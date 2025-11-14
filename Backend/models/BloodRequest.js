const dbConnection = require('../config/database');
const { ObjectId } = require('mongodb');

class BloodRequestModel {
  constructor() {
    this.collectionName = 'bloodRequests';
  }

  getCollection() {
    const db = dbConnection.getDatabase();
    return db.collection(this.collectionName);
  }

  // Create a new blood request
  async createRequest(requestData) {
    try {
      const collection = this.getCollection();
      const result = await collection.insertOne({
        ...requestData,
        status: 'pending', // pending, approved, rejected, fulfilled, cancelled
        createdAt: new Date(),
        updatedAt: new Date(),
        notifications: []
      });
      return result;
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
      
      // Build query filters
      if (filters.bloodType) query.bloodType = filters.bloodType;
      if (filters.urgency) query.urgency = filters.urgency;
      if (filters.status) query.status = filters.status;
      if (filters.bloodBankId) query.bloodBankId = new ObjectId(filters.bloodBankId);
      if (filters.requesterId) query.requesterId = new ObjectId(filters.requesterId);
      
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
      
      console.log('=== getBloodBankRequests ===');
      console.log('Looking for bloodBankId:', bloodBankId);
      console.log('Type:', typeof bloodBankId);
      
      // First check what's in the database
      const allRequests = await collection.find({}).toArray();
      console.log('Total requests in DB:', allRequests.length);
      if (allRequests.length > 0) {
        console.log('Sample request bloodBankId:', allRequests[0].bloodBankId);
        console.log('Sample request bloodBankId type:', typeof allRequests[0].bloodBankId);
      }
      
      // Handle both string and ObjectId formats
      const bloodBankIdStr = bloodBankId.toString();
      const query = { 
        $or: [
          { bloodBankId: new ObjectId(bloodBankId) },
          { bloodBankId: bloodBankIdStr }
        ]
      };
      console.log('Query:', JSON.stringify(query));
      
      if (filters.status) query.status = filters.status;
      if (filters.urgency) query.urgency = filters.urgency;
      
      const requests = await collection
        .find(query)
        .sort({ urgency: -1, createdAt: -1 }) // urgent first, then by date
        .toArray();
      
      console.log('Found requests:', requests.length);
      
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

  // Update request status
  async updateStatus(requestId, status, note = '') {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            status,
            updatedAt: new Date()
          },
          $push: {
            statusHistory: {
              status,
              note,
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
