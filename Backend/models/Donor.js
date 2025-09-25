const dbConnection = require('../config/database');

class DonorModel {
  constructor() {
    this.collectionName = 'donors';
  }

  getCollection() {
    const db = dbConnection.getDatabase();
    return db.collection(this.collectionName);
  }

  // Create a new donor
  async createDonor(donorData) {
    try {
      const collection = this.getCollection();
      const result = await collection.insertOne({
        ...donorData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      throw new Error(`Error creating donor: ${error.message}`);
    }
  }

  // Get all donors
  async getAllDonors(filters = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
      
      const donors = await collection
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return donors;
    } catch (error) {
      throw new Error(`Error fetching donors: ${error.message}`);
    }
  }

  // Get donor by ID
  async getDonorById(id) {
    try {
      const { ObjectId } = require('mongodb');
      const collection = this.getCollection();
      const donor = await collection.findOne({ _id: new ObjectId(id) });
      return donor;
    } catch (error) {
      throw new Error(`Error fetching donor: ${error.message}`);
    }
  }

  // Update donor
  async updateDonor(id, updateData) {
    try {
      const { ObjectId } = require('mongodb');
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
      throw new Error(`Error updating donor: ${error.message}`);
    }
  }

  // Delete donor
  async deleteDonor(id) {
    try {
      const { ObjectId } = require('mongodb');
      const collection = this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result;
    } catch (error) {
      throw new Error(`Error deleting donor: ${error.message}`);
    }
  }

  // Find donors by blood type
  async findDonorsByBloodType(bloodType) {
    try {
      const collection = this.getCollection();
      const donors = await collection.find({ bloodType: bloodType }).toArray();
      return donors;
    } catch (error) {
      throw new Error(`Error finding donors by blood type: ${error.message}`);
    }
  }
}

module.exports = new DonorModel();