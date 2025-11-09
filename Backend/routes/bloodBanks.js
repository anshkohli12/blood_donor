const express = require('express')
const router = express.Router()
const BloodBank = require('../models/BloodBank')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/blood-banks')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Public routes - Get all blood banks (for users to find blood banks)
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      state, 
      bloodType, 
      page = 1, 
      limit = 10,
      search,
      isOpen,
      hasStock 
    } = req.query

    let query = { isActive: true }
    
    // Filter by location
    if (city) query['address.city'] = new RegExp(city, 'i')
    if (state) query['address.state'] = new RegExp(state, 'i')
    
    // Filter by availability
    if (isOpen === 'true') query.isOpen = true
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') },
        { specialServices: new RegExp(search, 'i') }
      ]
    }
    
    // Filter by blood type availability
    if (bloodType && hasStock === 'true') {
      query[`bloodStock.${bloodType}`] = { $gt: 0 }
    }

    const bloodBanks = await BloodBank.find(query)
      .select('-password') // Don't send password
      .populate('createdBy', 'firstName lastName')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await BloodBank.countDocuments(query)

    res.json({
      success: true,
      data: bloodBanks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error fetching blood banks:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blood banks',
      error: error.message 
    })
  }
})

// Get nearby blood banks
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50, bloodType, hasStock } = req.query
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      })
    }

    let query = { 
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }

    // Filter by blood type availability
    if (bloodType && hasStock === 'true') {
      query[`bloodStock.${bloodType}`] = { $gt: 0 }
    }

    const bloodBanks = await BloodBank.find(query)
      .select('-password')
      .populate('createdBy', 'firstName lastName')
      .sort({ rating: -1 })

    res.json({
      success: true,
      data: bloodBanks
    })
  } catch (error) {
    console.error('Error fetching nearby blood banks:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching nearby blood banks',
      error: error.message 
    })
  }
})

// Get blood bank by ID
router.get('/:id', async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'firstName lastName')

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    res.json({
      success: true,
      data: bloodBank
    })
  } catch (error) {
    console.error('Error fetching blood bank:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blood bank',
      error: error.message 
    })
  }
})

// Get blood stock for a specific blood bank
router.get('/:id/stock', async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id)
      .select('name bloodStock lastStockUpdate')

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    res.json({
      success: true,
      data: {
        name: bloodBank.name,
        bloodStock: bloodBank.bloodStock,
        lastStockUpdate: bloodBank.lastStockUpdate,
        totalUnits: bloodBank.getTotalBloodUnits(),
        lowStockTypes: bloodBank.getLowStockTypes()
      }
    })
  } catch (error) {
    console.error('Error fetching blood stock:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blood stock',
      error: error.message 
    })
  }
})

// Search blood banks
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const bloodBanks = await BloodBank.find({
      isActive: true,
      $text: { $search: q }
    })
    .select('-password')
    .populate('createdBy', 'firstName lastName')

    res.json({
      success: true,
      data: bloodBanks
    })
  } catch (error) {
    console.error('Error searching blood banks:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error searching blood banks',
      error: error.message 
    })
  }
})

// ADMIN ROUTES - Require admin authentication

// Create new blood bank (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Create blood bank request received')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    console.log('User:', JSON.stringify(req.user, null, 2))
    console.log('User ID field:', req.user.userId || req.user.id)
    
    const {
      name,
      email,
      password,
      username
    } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    // Check if blood bank with same email already exists
    const existingBloodBank = await BloodBank.findOne({
      email: email.toLowerCase()
    })

    if (existingBloodBank) {
      return res.status(400).json({
        success: false,
        message: 'Blood bank with this email already exists'
      })
    }

    // Create new blood bank with minimal data
    const bloodBank = new BloodBank({
      name,
      email: email.toLowerCase(),
      password,
      username: username || email.split('@')[0], // Use email prefix if no username provided
      createdBy: req.user.userId || req.user.id,
      // Set default values for required fields
      licenseNumber: `TEMP-${Date.now()}`, // Temporary license number
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates [longitude, latitude]
      },
      contact: {
        phone: '',
        alternatePhone: '',
        fax: '',        website: '',
        emergencyContact: ''
      },
      contactPerson: {
        name: '',
        designation: '',
        phone: '',
        email: ''
      },
      operatingHours: {
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        saturday: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
        sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
      },
      bloodStock: {
        'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0,
        'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0
      }
    })

    await bloodBank.save()

    // Return blood bank without password
    const bloodBankResponse = await BloodBank.findById(bloodBank._id)
      .select('-password')
      .populate('createdBy', 'firstName lastName')

    res.status(201).json({
      success: true,
      message: 'Blood bank created successfully',
      data: bloodBankResponse
    })
  } catch (error) {
    console.error('Error creating blood bank:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error creating blood bank',
      error: error.message 
    })
  }
})

// Update blood bank (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id)
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false, 
        message: 'Blood bank not found'
      })
    }

    // Update fields
    const allowedUpdates = [
      'name', 'licenseNumber', 'address', 'contact', 'operatingHours',
      'services', 'specialServices', 'contactPerson', 'capacity', 
      'certifications', 'isActive', 'isVerified', 'isOpen'
    ]

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        bloodBank[field] = req.body[field]
      }
    })

    // Update coordinates if provided
    if (req.body.coordinates && req.body.coordinates.length === 2) {
      bloodBank.location = {
        type: 'Point',
        coordinates: req.body.coordinates
      }
    }

    await bloodBank.save()

    const updatedBloodBank = await BloodBank.findById(bloodBank._id)
      .select('-password')
      .populate('createdBy', 'firstName lastName')

    res.json({
      success: true,
      message: 'Blood bank updated successfully',
      data: updatedBloodBank
    })
  } catch (error) {
    console.error('Error updating blood bank:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blood bank',
      error: error.message 
    })
  }
})

// Delete blood bank (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id)
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    await BloodBank.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Blood bank deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blood bank:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting blood bank',
      error: error.message 
    })
  }
})

// BLOOD BANK STAFF AUTHENTICATION ROUTES

// Blood bank login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find blood bank by email
    const bloodBank = await BloodBank.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (!bloodBank) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isPasswordValid = await bloodBank.comparePassword(password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: bloodBank._id, 
        type: 'bloodbank',
        name: bloodBank.name,
        email: bloodBank.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return blood bank info without password
    const bloodBankInfo = {
      id: bloodBank._id,
      name: bloodBank.name,
      email: bloodBank.email,
      licenseNumber: bloodBank.licenseNumber,
      address: bloodBank.address,
      contact: bloodBank.contact,
      type: 'bloodbank'
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: bloodBankInfo
    })
  } catch (error) {
    console.error('Error in blood bank login:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in',
      error: error.message 
    })
  }
})

// Update blood bank profile (Blood bank staff only)
router.put('/:id/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    // Check if user is admin or the blood bank staff
    if (req.user.type !== 'bloodbank' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Check if blood bank staff is updating their own profile
    if (req.user.type === 'bloodbank' && req.user.bloodBankId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      })
    }

    const bloodBank = await BloodBank.findById(req.params.id)
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    // Parse the form data
    const updateData = JSON.parse(req.body.data || '{}')

    // Handle profile image upload
    if (req.file) {
      // Delete old image if exists
      if (bloodBank.profileImage) {
        const oldImagePath = path.join(__dirname, '../uploads/blood-banks', path.basename(bloodBank.profileImage))
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      
      // Set new image path
      updateData.profileImage = `/uploads/blood-banks/${req.file.filename}`
    }

    // Update the blood bank
    const updatedBloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedBloodBank
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile',
      error: error.message 
    })
  }
})

// Update blood stock (Blood bank staff only)
router.put('/:id/stock', authenticateToken, async (req, res) => {
  try {
    const { bloodType, quantity, operation = 'set' } = req.body
    
    // Check if user is admin or the blood bank staff
    if (req.user.type !== 'bloodbank' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // If blood bank staff, can only update their own stock
    if (req.user.type === 'bloodbank' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own blood stock'
      })
    }

    const bloodBank = await BloodBank.findById(req.params.id)
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    // Validate blood type
    const validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood type'
      })
    }

    // Update stock
    await bloodBank.updateBloodStock(bloodType, quantity, operation)

    res.json({
      success: true,
      message: 'Blood stock updated successfully',
      data: {
        bloodType,
        newQuantity: bloodBank.bloodStock[bloodType],
        lastStockUpdate: bloodBank.lastStockUpdate
      }
    })
  } catch (error) {
    console.error('Error updating blood stock:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blood stock',
      error: error.message 
    })
  }
})

// Get blood bank dashboard data (Blood bank staff only)
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if user is the blood bank staff or admin
    if (req.user.type === 'bloodbank' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const bloodBank = await BloodBank.findById(req.params.id)
      .select('-password')

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      })
    }

    // Dashboard statistics
    const stats = {
      totalBloodUnits: bloodBank.getTotalBloodUnits(),
      lowStockTypes: bloodBank.getLowStockTypes(),
      isCurrentlyOpen: bloodBank.isCurrentlyOpen(),
      lastStockUpdate: bloodBank.lastStockUpdate,
      rating: bloodBank.rating,
      reviewCount: bloodBank.reviewCount
    }

    res.json({
      success: true,
      data: {
        bloodBank,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data',
      error: error.message 
    })
  }
})

module.exports = router