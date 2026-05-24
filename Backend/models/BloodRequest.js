const dbConnection = require('../config/database');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class BloodRequestModel {
  constructor() {
    this.collectionName = 'bloodRequests';
  }

  getCollection() {
    const db = dbConnection.getDatabase();
    return db.collection(this.collectionName);
  }

  // Generate a human-readable request ID (REQ-XXXXXX)
  generateRequestId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'REQ-';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // Create a new blood request
  async createRequest(requestData) {
    try {
      const collection = this.getCollection();
      const requestId = this.generateRequestId();

      const newRequest = {
        requestId,
        requesterId: requestData.requesterId,
        requesterName: requestData.requesterName,
        requesterEmail: requestData.requesterEmail,
        requestType: requestData.requestType || 'other', // 'self' | 'other'

        // Patient info
        patientName: requestData.patientName,
        bloodType: requestData.bloodType,
        unitsNeeded: requestData.unitsNeeded || 1,
        patientAge: requestData.patientAge || null,
        patientGender: requestData.patientGender || null,

        // Hospital & location
        bloodBankId: requestData.bloodBankId ? new ObjectId(requestData.bloodBankId) : null,
        hospitalName: requestData.hospitalName || '',
        location: requestData.location || '',

        // Contact
        contactName: requestData.contactName || '',
        contactPhone: requestData.contactPhone || '',
        contactEmail: requestData.contactEmail || '',

        // Medical
        urgency: requestData.urgency || 'medium',
        emergencyLevel: requestData.emergencyLevel || 'medium',
        medicalCondition: requestData.medicalCondition || '',
        medicalNote: requestData.medicalNote || '',
        additionalNotes: requestData.additionalNotes || '',
        prescriptionPath: requestData.prescriptionPath || null,

        // Dates
        neededBy: requestData.neededBy ? new Date(requestData.neededBy) : null,
        requiredBeforeDate: requestData.requiredBeforeDate ? new Date(requestData.requiredBeforeDate) : null,

        // Status & appointment
        status: 'pending',
        rejectionReason: null,
        appointmentDate: null,
        appointmentTime: null,
        appointmentRoom: null,
        instructions: null,

        // History
        statusHistory: [
          { status: 'pending', note: 'Request submitted', timestamp: new Date() }
        ],
        notifications: [],

        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newRequest);
      return { ...result, requestId, insertedDoc: { _id: result.insertedId, ...newRequest } };
    } catch (error) {
      throw new Error(`Error creating blood request: ${error.message}`);
    }
  }

  // Get all blood requests with filters
  async getAllRequests(filters = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const query = {};

      if (filters.bloodType) query.bloodType = filters.bloodType;
      if (filters.urgency) query.urgency = filters.urgency;
      if (filters.status) query.status = filters.status;

      if (filters.bloodBankId) {
        const idStr = filters.bloodBankId.toString();
        query.$or = [
          { bloodBankId: new ObjectId(idStr) },
          { bloodBankId: idStr }
        ];
      }

      if (filters.requesterId) {
        const idStr = filters.requesterId.toString();
        query.$or = query.$or || [];
        // If $or already exists from bloodBankId, we need $and
        if (query.$or.length > 0) {
          delete query.$or;
          query.bloodBankId = filters.bloodBankId ? new ObjectId(filters.bloodBankId.toString()) : undefined;
        }
        // Query requesterId as both ObjectId and string
        query.$or = [
          { requesterId: new ObjectId(idStr) },
          { requesterId: idStr }
        ];
      }

      const requests = await collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return requests;
    } catch (error) {
      throw new Error(`Error fetching blood requests: ${error.message}`);
    }
  }

  // Get request by ID
  async getRequestById(id) {
    try {
      const collection = this.getCollection();
      const request = await collection.findOne({ _id: new ObjectId(id) });
      return request;
    } catch (error) {
      throw new Error(`Error fetching blood request: ${error.message}`);
    }
  }

  // Get requests for a specific user
  async getRequestsByUser(userId) {
    try {
      const collection = this.getCollection();
      const userIdStr = userId.toString();

      const requests = await collection
        .find({
          $or: [
            { requesterId: new ObjectId(userIdStr) },
            { requesterId: userIdStr }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      return requests;
    } catch (error) {
      throw new Error(`Error fetching user requests: ${error.message}`);
    }
  }

  // Update blood request
  async updateRequest(id, updateData) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error updating blood request: ${error.message}`);
    }
  }

  // Delete blood request
  async deleteRequest(id) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result;
    } catch (error) {
      throw new Error(`Error deleting blood request: ${error.message}`);
    }
  }

  // Get requests for a specific blood bank
  async getBloodBankRequests(bloodBankId, filters = {}) {
    try {
      const collection = this.getCollection();
      const bloodBankIdStr = bloodBankId.toString();

      const query = {
        $or: [
          { bloodBankId: new ObjectId(bloodBankId) },
          { bloodBankId: bloodBankIdStr }
        ]
      };

      if (filters.status) query.status = filters.status;
      if (filters.urgency) query.urgency = filters.urgency;

      const requests = await collection
        .find(query)
        .sort({ urgency: -1, createdAt: -1 })
        .toArray();

      return requests;
    } catch (error) {
      throw new Error(`Error fetching blood bank requests: ${error.message}`);
    }
  }

  // Get urgent requests
  async getUrgentRequests(bloodBankId = null) {
    try {
      const collection = this.getCollection();
      const query = {
        urgency: 'urgent',
        status: { $in: ['pending', 'approved'] }
      };

      if (bloodBankId) {
        query.bloodBankId = new ObjectId(bloodBankId);
      }

      const requests = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return requests;
    } catch (error) {
      throw new Error(`Error fetching urgent requests: ${error.message}`);
    }
  }

  // Add notification to request
  async addNotification(requestId, notification) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $push: {
            notifications: {
              ...notification,
              timestamp: new Date()
            }
          }
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error adding notification: ${error.message}`);
    }
  }

  // Update request status with full details
  async updateStatus(requestId, status, statusData = {}) {
    try {
      const collection = this.getCollection();

      const updateFields = {
        status,
        updatedAt: new Date()
      };

      // Add status-specific fields
      if (status === 'approved' || status === 'scheduled') {
        if (statusData.appointmentDate) updateFields.appointmentDate = statusData.appointmentDate;
        if (statusData.appointmentTime) updateFields.appointmentTime = statusData.appointmentTime;
        if (statusData.appointmentRoom) updateFields.appointmentRoom = statusData.appointmentRoom;
        if (statusData.instructions) updateFields.instructions = statusData.instructions;
      }

      if (status === 'rejected' && statusData.rejectionReason) {
        updateFields.rejectionReason = statusData.rejectionReason;
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: updateFields,
          $push: {
            statusHistory: {
              status,
              note: statusData.note || '',
              timestamp: new Date()
            }
          }
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error updating request status: ${error.message}`);
    }
  }
}

module.exports = new BloodRequestModel();
