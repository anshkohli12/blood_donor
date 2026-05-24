const express = require('express');
const multer = require('multer');
const path = require('path');
const BloodRequestModel = require('../models/BloodRequest');
const BloodBankModel = require('../models/BloodBank');
const NotificationModel = require('../models/Notification');
const { authenticateToken, authenticateBloodBank } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Multer config for prescription uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
});

// Create a new blood request (with optional prescription upload)
router.post('/', authenticateToken, upload.single('prescription'), async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requesterId: req.user._id,
      requesterName: `${req.user.firstName} ${req.user.lastName}`,
      requesterEmail: req.user.email,
      prescriptionPath: req.file ? req.file.filename : null
    };

    // Parse units as number
    if (requestData.unitsNeeded) {
      requestData.unitsNeeded = parseInt(requestData.unitsNeeded, 10);
    }

    const result = await BloodRequestModel.createRequest(requestData);

    // Send pending email to the requester
    try {
      await sendEmail('bloodRequestPending', {
        requesterName: requestData.requesterName,
        requesterEmail: requestData.requesterEmail,
        requestId: result.requestId,
        bloodType: requestData.bloodType,
        patientName: requestData.patientName,
        unitsNeeded: requestData.unitsNeeded
      });
    } catch (emailErr) {
      console.warn('Failed to send pending email:', emailErr.message);
    }

    // Create notification for the requester
    try {
      await NotificationModel.createNotification({
        userId: req.user._id.toString(),
        title: 'Blood Request Submitted',
        message: `Your blood request ${result.requestId} for ${requestData.bloodType} has been submitted and is under review.`,
        type: 'request_pending',
        requestId: result.insertedId.toString()
      });
    } catch (notifErr) {
      console.warn('Failed to create notification:', notifErr.message);
    }

    // If urgent, notify blood bank
    if (requestData.urgency === 'urgent' && requestData.bloodBankId) {
      await BloodRequestModel.addNotification(result.insertedId, {
        type: 'urgent_request',
        message: `Urgent blood request for ${requestData.bloodType}`,
        bloodBankId: requestData.bloodBankId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: result.insertedDoc
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all blood requests (with filters)
router.get('/', async (req, res) => {
  try {
    const { bloodType, urgency, status, page = 1, limit = 50 } = req.query;

    const filters = {};
    if (bloodType) filters.bloodType = bloodType;
    if (urgency) filters.urgency = urgency;
    if (status) filters.status = status;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 }
    };

    const requests = await BloodRequestModel.getAllRequests(filters, options);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: requests.length
      }
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my requests (user) — uses improved ObjectId/string query
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await BloodRequestModel.getRequestsByUser(req.user._id);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get requests for blood bank
router.get('/blood-bank/requests', authenticateBloodBank, async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const bloodBankId = req.bloodBank._id;

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;

    const requests = await BloodRequestModel.getBloodBankRequests(bloodBankId, filters);

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Get blood bank requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get urgent requests for blood bank
router.get('/blood-bank/urgent', authenticateBloodBank, async (req, res) => {
  try {
    const bloodBankId = req.bloodBank._id;
    const requests = await BloodRequestModel.getUrgentRequests(bloodBankId);

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Get urgent requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update request status (blood bank only) — enhanced with approve/reject/schedule/complete
router.put('/:id/status', authenticateBloodBank, async (req, res) => {
  try {
    const { status, note, rejectionReason, appointmentDate, appointmentTime, appointmentRoom, instructions } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'scheduled', 'completed', 'fulfilled', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Reject requires a reason
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const statusData = {
      note: note || '',
      rejectionReason,
      appointmentDate,
      appointmentTime,
      appointmentRoom,
      instructions
    };

    await BloodRequestModel.updateStatus(req.params.id, status, statusData);
    const updatedRequest = await BloodRequestModel.getRequestById(req.params.id);

    // Send email and create notification based on status
    if (updatedRequest) {
      const emailData = {
        requesterName: updatedRequest.requesterName,
        requesterEmail: updatedRequest.requesterEmail,
        requestId: updatedRequest.requestId,
        bloodType: updatedRequest.bloodType,
        patientName: updatedRequest.patientName,
        unitsNeeded: updatedRequest.unitsNeeded,
        bloodBankName: req.bloodBank.name,
        updateDate: new Date().toLocaleString()
      };

      let emailType = null;
      let notifTitle = '';
      let notifMessage = '';
      let notifType = '';

      if (status === 'approved') {
        emailType = 'bloodRequestApproved';
        emailData.appointmentDate = appointmentDate;
        emailData.appointmentTime = appointmentTime;
        emailData.appointmentRoom = appointmentRoom;
        emailData.instructions = instructions;
        emailData.bloodBankLocation = req.bloodBank.address || '';
        notifTitle = 'Request Approved! ✅';
        notifMessage = `Your blood request ${updatedRequest.requestId} has been approved by ${req.bloodBank.name}.${appointmentDate ? ` Appointment: ${appointmentDate} at ${appointmentTime}` : ''}`;
        notifType = 'request_approved';
      } else if (status === 'rejected') {
        emailType = 'bloodRequestRejected';
        emailData.rejectionReason = rejectionReason;
        notifTitle = 'Request Rejected';
        notifMessage = `Your blood request ${updatedRequest.requestId} has been rejected. Reason: ${rejectionReason}`;
        notifType = 'request_rejected';
      } else if (status === 'scheduled') {
        emailType = 'bloodRequestApproved';
        emailData.appointmentDate = appointmentDate;
        emailData.appointmentTime = appointmentTime;
        emailData.appointmentRoom = appointmentRoom;
        emailData.instructions = instructions;
        emailData.bloodBankLocation = req.bloodBank.address || '';
        notifTitle = 'Visit Scheduled 📅';
        notifMessage = `A visit has been scheduled for your blood request ${updatedRequest.requestId}. Date: ${appointmentDate} at ${appointmentTime}`;
        notifType = 'request_scheduled';
      } else if (status === 'completed' || status === 'fulfilled') {
        emailType = 'bloodRequestCompleted';
        notifTitle = 'Request Completed ✔️';
        notifMessage = `Your blood request ${updatedRequest.requestId} has been fulfilled. Thank you for using Blood Donor Platform.`;
        notifType = 'request_completed';
      }

      // Send email (non-blocking)
      if (emailType) {
        sendEmail(emailType, emailData).catch(err =>
          console.warn(`Failed to send ${emailType} email:`, err.message)
        );
      }

      // Create notification for the requester
      if (notifTitle && updatedRequest.requesterId) {
        NotificationModel.createNotification({
          userId: updatedRequest.requesterId.toString(),
          title: notifTitle,
          message: notifMessage,
          type: notifType,
          requestId: updatedRequest._id.toString()
        }).catch(err => console.warn('Failed to create notification:', err.message));
      }
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule a visit (blood bank only)
router.put('/:id/schedule', authenticateBloodBank, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime, appointmentRoom, instructions } = req.body;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Appointment date and time are required' });
    }

    const statusData = {
      note: 'Visit scheduled by blood bank',
      appointmentDate,
      appointmentTime,
      appointmentRoom,
      instructions
    };

    await BloodRequestModel.updateStatus(req.params.id, 'scheduled', statusData);
    const updatedRequest = await BloodRequestModel.getRequestById(req.params.id);

    // Send email and notification
    if (updatedRequest) {
      sendEmail('bloodRequestApproved', {
        requesterName: updatedRequest.requesterName,
        requesterEmail: updatedRequest.requesterEmail,
        requestId: updatedRequest.requestId,
        bloodType: updatedRequest.bloodType,
        patientName: updatedRequest.patientName,
        unitsNeeded: updatedRequest.unitsNeeded,
        bloodBankName: req.bloodBank.name,
        bloodBankLocation: req.bloodBank.address || '',
        appointmentDate,
        appointmentTime,
        appointmentRoom,
        instructions,
        updateDate: new Date().toLocaleString()
      }).catch(err => console.warn('Failed to send schedule email:', err.message));

      if (updatedRequest.requesterId) {
        NotificationModel.createNotification({
          userId: updatedRequest.requesterId.toString(),
          title: 'Visit Scheduled 📅',
          message: `A visit has been scheduled for your blood request ${updatedRequest.requestId}. Date: ${appointmentDate} at ${appointmentTime}`,
          type: 'request_scheduled',
          requestId: updatedRequest._id.toString()
        }).catch(err => console.warn('Failed to create notification:', err.message));
      }
    }

    res.json({
      success: true,
      message: 'Visit scheduled successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Schedule visit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update request (requester only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    await BloodRequestModel.updateRequest(req.params.id, req.body);
    const updatedRequest = await BloodRequestModel.getRequestById(req.params.id);

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete request (requester only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    await BloodRequestModel.deleteRequest(req.params.id);
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
