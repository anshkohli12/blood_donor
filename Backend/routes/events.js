const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const User = require('../models/User')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/events')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
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

// PUBLIC ROUTES

// Get all approved events
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'approved',
      search,
      location,
      upcoming,
      page = 1,
      limit = 10 
    } = req.query

    let query = { status: 'approved' }
    
    // Filter by location
    if (location) {
      query.location = new RegExp(location, 'i')
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { organizerName: new RegExp(search, 'i') }
      ]
    }
    
    // Filter upcoming events
    if (upcoming === 'true') {
      query.date = { $gte: new Date() }
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email contact address')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Event.countDocuments(query)

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events',
      error: error.message 
    })
  }
})

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email contact address profileImage')
      .populate('registrations.userId', 'firstName lastName email')

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching event',
      error: error.message 
    })
  }
})

// BLOOD BANK ROUTES (Authenticated)

// Create new event (Blood Bank only)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Only blood banks can create events
    if (req.user.type !== 'bloodbank' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only blood banks can create events'
      })
    }

    const eventData = req.file ? JSON.parse(req.body.data) : req.body

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'endDate', 'location', 'maxCapacity', 'contactPhone', 'contactEmail']
    const missingFields = requiredFields.filter(field => !eventData[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    // Validate dates
    const startDate = new Date(eventData.date)
    const endDate = new Date(eventData.endDate)
    const now = new Date()

    if (startDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Event start date must be in the future'
      })
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Event end date must be after start date'
      })
    }

    // Create event object
    const event = new Event({
      ...eventData,
      organizer: req.user.id,
      organizerName: req.user.name,
      status: 'pending', // Requires admin approval
      image: req.file ? `/uploads/events/${req.file.filename}` : eventData.image || ''
    })

    await event.save()

    // Populate organizer info
    await event.populate('organizer', 'name email contact address')

    res.status(201).json({
      success: true,
      message: 'Event created successfully. Awaiting admin approval.',
      data: event
    })
  } catch (error) {
    console.error('Error creating event:', error)
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error creating event',
      error: error.message 
    })
  }
})

// Get events created by logged-in blood bank
router.get('/my-events/list', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'bloodbank') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'name email contact')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('Error fetching blood bank events:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events',
      error: error.message 
    })
  }
})

// Update event (Blood Bank - only their own events)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    // Check if user owns this event or is admin
    if (req.user.type === 'bloodbank' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own events'
      })
    }

    const updateData = req.file ? JSON.parse(req.body.data) : req.body

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (event.image) {
        const oldImagePath = path.join(__dirname, '..', event.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      updateData.image = `/uploads/events/${req.file.filename}`
    }

    // If event was already approved and blood bank edits it, set back to pending
    if (event.status === 'approved' && req.user.type === 'bloodbank') {
      updateData.status = 'pending'
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        event[key] = updateData[key]
      }
    })

    await event.save()
    await event.populate('organizer', 'name email contact')

    res.json({
      success: true,
      message: event.status === 'pending' ? 'Event updated. Awaiting admin approval.' : 'Event updated successfully',
      data: event
    })
  } catch (error) {
    console.error('Error updating event:', error)
    
    if (req.file) {
      const filePath = req.file.path
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating event',
      error: error.message 
    })
  }
})

// Delete event (Blood Bank - only their own events)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    // Check if user owns this event or is admin
    if (req.user.type === 'bloodbank' && event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own events'
      })
    }

    // Delete event image if exists
    if (event.image) {
      const imagePath = path.join(__dirname, '..', event.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting event',
      error: error.message 
    })
  }
})

// USER REGISTRATION ROUTES

// Register for an event
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Event is not approved for registration'
      })
    }

    await event.registerUser(req.user._id || req.user.userId)

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    })
  } catch (error) {
    console.error('Error registering for event:', error)
    res.status(400).json({ 
      success: false, 
      message: error.message 
    })
  }
})

// Unregister from an event
router.post('/:id/unregister', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    await event.unregisterUser(req.user._id || req.user.userId)

    res.json({
      success: true,
      message: 'Successfully unregistered from event',
      data: event
    })
  } catch (error) {
    console.error('Error unregistering from event:', error)
    res.status(400).json({ 
      success: false, 
      message: error.message 
    })
  }
})

// Get user's registered events
router.get('/my-registrations/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId
    
    const events = await Event.find({
      'registrations.userId': userId,
      status: 'approved'
    })
      .populate('organizer', 'name email contact')
      .sort({ date: 1 })

    res.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching registrations',
      error: error.message 
    })
  }
})

// Get registrations for a specific event (Blood Bank/Admin only)
router.get('/:id/registrations', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching registrations for event:', req.params.id)
    console.log('User info:', { id: req.user.id, type: req.user.type, role: req.user.role })
    
    // Use lean() and manually fetch user details via the project's UserModel
    const event = await Event.findById(req.params.id).lean()
    
    if (!event) {
      console.log('Event not found:', req.params.id)
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    console.log('Event found:', event.title)
    console.log('Event organizer:', event.organizer)
    console.log('Registrations count:', event.registrations?.length || 0)

    // Check if user is the organizer or admin
    // Blood bank users can have type 'bloodbank' or might be stored differently
    const isOrganizer = (req.user.type === 'bloodbank' || req.user.type === 'bloodBank') && 
                       event.organizer.toString() === req.user.id
    const isAdmin = req.user.role === 'admin'

    console.log('Authorization check:', { isOrganizer, isAdmin })

    if (!isOrganizer && !isAdmin) {
      console.log('Access denied for user:', req.user.id)
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event organizer or admin can view registrations'
      })
    }

    // registrations from Mongoose (lean) are plain objects with userId as ObjectId
    const registrations = event.registrations || []

    // Collect unique user ids and fetch details using the User model (project's UserModel)
    const userIds = registrations
      .map(r => r.userId)
      .filter(Boolean)
      .map(id => id.toString())

    const uniqueUserIds = [...new Set(userIds)]

    const usersMap = {}
    if (uniqueUserIds.length > 0) {
      // User is a custom class instance exported from ../models/User
      // It exposes getUserById(id) which returns a plain user object
      await Promise.all(uniqueUserIds.map(async (id) => {
        try {
          const u = await User.getUserById(id)
          if (u) usersMap[id] = u
        } catch (e) {
          console.warn('Failed to fetch user for id', id, e.message)
        }
      }))
    }

    const enriched = registrations.map(reg => ({
      _id: reg._id,
      registeredAt: reg.registeredAt,
      status: reg.status,
      userId: reg.userId ? (usersMap[reg.userId.toString()] || null) : null
    }))

    const validRegistrations = enriched.filter(r => r.userId != null)

    console.log('Access granted, sending', validRegistrations.length, 'valid registrations')

    res.json({
      success: true,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        maxCapacity: event.maxCapacity,
        registeredCount: validRegistrations.length,
        registrations: validRegistrations
      }
    })
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching event registrations',
      error: error.message 
    })
  }
})

// ADMIN ROUTES

// Test endpoint - Get count of all events
router.get('/admin/test', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments()
    const pendingEvents = await Event.countDocuments({ status: 'pending' })
    const approvedEvents = await Event.countDocuments({ status: 'approved' })
    
    res.json({
      success: true,
      message: 'Event routes are working!',
      counts: {
        total: totalEvents,
        pending: pendingEvents,
        approved: approvedEvents
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error counting events',
      error: error.message
    })
  }
})

// Get all events (including pending) - Admin only
router.get('/admin/all-events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin all-events request from user:', req.user);
    
    const { status, page = 1, limit = 20 } = req.query

    let query = {}
    if (status && status !== 'all') {
      query.status = status
    }

    console.log('Querying events with:', query);

    // First, let's just get the events without populate to debug
    const eventsRaw = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    console.log(`Found ${eventsRaw.length} raw events`);
    console.log('First event (if any):', eventsRaw[0]);

    // Now try to populate
    let events;
    try {
      events = await Event.find(query)
        .populate({
          path: 'organizer',
          select: 'name email contact address'
        })
        .populate({
          path: 'approvedBy',
          select: 'firstName lastName email'
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean()
      
      console.log(`Populated ${events.length} events successfully`);
    } catch (populateError) {
      console.error('Error during populate:', populateError);
      // If populate fails, use the raw events
      events = eventsRaw;
    }

    const total = await Event.countDocuments(query)

    // Get count by status
    const statusCounts = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    console.log('Status counts:', statusCounts);

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count
        return acc
      }, {})
    })
  } catch (error) {
    console.error('Error fetching all events:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Approve event - Admin only
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    await event.approveEvent(req.user.userId || req.user._id)
    await event.populate('organizer', 'name email contact')

    res.json({
      success: true,
      message: 'Event approved successfully',
      data: event
    })
  } catch (error) {
    console.error('Error approving event:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error approving event',
      error: error.message 
    })
  }
})

// Reject event - Admin only
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      })
    }

    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    await event.rejectEvent(req.user.userId || req.user._id, reason)
    await event.populate('organizer', 'name email contact')

    res.json({
      success: true,
      message: 'Event rejected',
      data: event
    })
  } catch (error) {
    console.error('Error rejecting event:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting event',
      error: error.message 
    })
  }
})

module.exports = router
