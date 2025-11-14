const express = require('express');
const BloodRequestModel = require('../models/BloodRequest');
const BloodBankModel = require('../models/BloodBank');
const { authenticateToken, authenticateBloodBank } = require('../middleware/auth');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Create a new blood request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      bloodBankId: new ObjectId(req.body.bloodBankId),
      requesterId: req.user._id,
      requesterName: `${req.user.firstName} ${req.user.lastName}`,
      requesterEmail: req.user.email
    };

    const result = await BloodRequestModel.createRequest(requestData);

    // If urgent, add notification
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
      data: {
        _id: result.insertedId,
        ...requestData
      }
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get my requests (user)
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await BloodRequestModel.getAllRequests(
      { requesterId: req.user._id.toString() },
      { sort: { createdAt: -1 } }
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get requests for blood bank
router.get('/blood-bank/requests', authenticateBloodBank, async (req, res) => {
  try {
    console.log('=== GET BLOOD BANK REQUESTS ===');
    console.log('Blood Bank:', req.bloodBank);
    
    const { status, urgency } = req.query;
    const bloodBankId = req.bloodBank._id;
    
    console.log('Blood Bank ID:', bloodBankId);
    console.log('Filters:', { status, urgency });

    const filters = {};
    if (status) filters.status = status;
    if (urgency) filters.urgency = urgency;

    const requests = await BloodRequestModel.getBloodBankRequests(bloodBankId, filters);
    
    console.log('Found requests:', requests.length);

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Get blood bank requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update request status (blood bank only)
router.put('/:id/status', authenticateBloodBank, async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await BloodRequestModel.updateStatus(req.params.id, status, note);

    const updatedRequest = await BloodRequestModel.getRequestById(req.params.id);

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update request (requester only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check if user owns this request
    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete request (requester only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await BloodRequestModel.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check if user owns this request
    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await BloodRequestModel.deleteRequest(req.params.id);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
