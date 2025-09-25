const express = require('express');
const DonorModel = require('../models/Donor');

const router = express.Router();

// GET /api/donors - Get all donors
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, bloodType } = req.query;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (bloodType) {
      filters.bloodType = bloodType;
    }
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { createdAt: -1 }
    };
    
    const donors = await DonorModel.getAllDonors(filters, options);
    
    res.json({
      success: true,
      data: donors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: donors.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/donors/:id - Get donor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await DonorModel.getDonorById(id);
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/donors - Create new donor
router.post('/', async (req, res) => {
  try {
    const donorData = req.body;
    
    // Basic validation
    const requiredFields = ['name', 'email', 'bloodType', 'phone'];
    const missingFields = requiredFields.filter(field => !donorData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const result = await DonorModel.createDonor(donorData);
    
    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: { 
        _id: result.insertedId,
        ...donorData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/donors/:id - Update donor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await DonorModel.updateDonor(id, updateData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Donor updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/donors/:id - Delete donor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DonorModel.deleteDonor(id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/donors/blood-type/:bloodType - Get donors by blood type
router.get('/blood-type/:bloodType', async (req, res) => {
  try {
    const { bloodType } = req.params;
    const donors = await DonorModel.findDonorsByBloodType(bloodType);
    
    res.json({
      success: true,
      data: donors,
      count: donors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;