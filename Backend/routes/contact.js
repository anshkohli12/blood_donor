const express = require('express')
const { body, validationResult } = require('express-validator')
const ContactMessage = require('../models/ContactMessage')
const User = require('../models/User')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Root test route
router.get('/', (req, res) => {
  console.log('=== ROOT CONTACT ROUTE HIT ===')
  res.json({ success: true, message: 'Contact routes working' })
})

// Test route to check if auth is working (no auth required)
router.get('/test-simple', async (req, res) => {
  console.log('=== SIMPLE TEST ROUTE ACCESSED ===')
  console.log('Test route hit at:', new Date().toISOString())
  res.json({
    success: true,
    message: 'Route working without auth'
  })
})

// Test route to check if auth is working
router.get('/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('=== TEST ROUTE ACCESSED ===')
    console.log('User:', req.user)
    res.json({
      success: true,
      message: 'Auth working',
      user: req.user
    })
  } catch (error) {
    console.error('Test route error:', error)
    res.status(500).json({
      success: false,
      message: 'Test route failed'
    })
  }
})

// Submit contact form (public route)
router.post('/submit', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5-200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10-2000 characters')
], async (req, res) => {
  try {
    console.log('=== CONTACT FORM SUBMISSION ===')
    console.log('Request body:', req.body)
    console.log('Request headers:', req.headers)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email, phone, subject, message } = req.body
    console.log('Extracted data:', { firstName, lastName, email, phone, subject, message })

    const contactMessage = new ContactMessage({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message
    })

    console.log('ContactMessage object before save:', contactMessage)
    
    const savedMessage = await contactMessage.save()
    console.log('Message saved successfully! ID:', savedMessage._id)
    console.log('Saved message data:', savedMessage)

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        id: savedMessage._id,
        submittedAt: savedMessage.createdAt
      }
    })
  } catch (error) {
    console.error('=== CONTACT FORM ERROR ===')
    console.error('Error details:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    if (error.errors) {
      console.error('Mongoose validation errors:', error.errors)
    }
    console.error('Stack trace:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    })
  }
})

// Get all contact messages (admin only)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
  console.log('=== ROUTE HIT: GET CONTACT MESSAGES ===')
  console.log('Request received at:', new Date().toISOString())
  
  try {
    console.log('=== CONTACT MESSAGES ROUTE HIT ===')
    console.log('Query params:', req.query)
    
    const {
      page = 1,
      limit = 50,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build filter query
    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (priority && priority !== 'all') filter.priority = priority
    if (search && search.trim()) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    console.log('Filter:', filter)
    console.log('Sort:', sort)

    // Get messages
    const messages = await ContactMessage.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))

    console.log('Found messages:', messages.length)

    // Get total count and stats
    const total = await ContactMessage.countDocuments(filter)
    const totalStats = await ContactMessage.countDocuments()
    const pendingStats = await ContactMessage.countDocuments({ status: 'pending' })
    const inProgressStats = await ContactMessage.countDocuments({ status: 'in-progress' })
    const resolvedStats = await ContactMessage.countDocuments({ status: 'resolved' })
    const unreadStats = await ContactMessage.countDocuments({ isRead: false })
    const urgentStats = await ContactMessage.countDocuments({ priority: 'urgent' })

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        stats: {
          total: totalStats,
          pending: pendingStats,
          inProgress: inProgressStats,
          resolved: resolvedStats,
          unread: unreadStats,
          urgent: urgentStats
        }
      }
    })
  } catch (error) {
    console.error('=== GET CONTACT MESSAGES ERROR ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    })
  }
})

// Get single contact message (admin only)
router.get('/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id).lean()

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Manually enrich user data
    const userIds = new Set()
    
    if (message.adminResponse?.respondedBy) {
      userIds.add(message.adminResponse.respondedBy.toString())
    }
    
    if (message.statusHistory) {
      message.statusHistory.forEach(history => {
        if (history.changedBy) {
          userIds.add(history.changedBy.toString())
        }
      })
    }

    if (message.adminNotes) {
      message.adminNotes.forEach(note => {
        if (note.addedBy) {
          userIds.add(note.addedBy.toString())
        }
      })
    }

    if (message.readBy) {
      message.readBy.forEach(userId => {
        if (userId) {
          userIds.add(userId.toString())
        }
      })
    }

    // Fetch all users at once
    const users = await Promise.all(
      Array.from(userIds).map(id => User.getUserById(id))
    )
    
    // Create user map
    const usersMap = {}
    users.forEach(user => {
      if (user) {
        usersMap[user._id.toString()] = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    })

    // Enrich message with user data
    if (message.adminResponse?.respondedBy) {
      const userId = message.adminResponse.respondedBy.toString()
      message.adminResponse.respondedBy = usersMap[userId] || null
    }
    
    if (message.statusHistory) {
      message.statusHistory = message.statusHistory.map(history => ({
        ...history,
        changedBy: history.changedBy 
          ? usersMap[history.changedBy.toString()] || null 
          : null
      }))
    }

    if (message.adminNotes) {
      message.adminNotes = message.adminNotes.map(note => ({
        ...note,
        addedBy: note.addedBy 
          ? usersMap[note.addedBy.toString()] || null 
          : null
      }))
    }

    if (message.readBy) {
      message.readBy = message.readBy
        .map(userId => usersMap[userId.toString()])
        .filter(Boolean)
    }

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Get contact message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    })
  }
})

// Update contact message status/priority (admin only)
router.put('/messages/:id', authenticateToken, requireAdmin, [
  body('status').optional().isIn(['pending', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('statusNote').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { status, priority, statusNote } = req.body
    const updateData = {}
    
    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    // Add to status history if status changed
    if (status) {
      const message = await ContactMessage.findById(req.params.id)
      if (message && message.status !== status) {
        updateData.$push = {
          statusHistory: {
            status,
            changedBy: req.user._id,
            changedAt: new Date(),
            note: statusNote || `Status changed to ${status}`
          }
        }
      }
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).lean()

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Manually enrich user data
    const userIds = new Set()
    
    if (message.adminResponse?.respondedBy) {
      userIds.add(message.adminResponse.respondedBy.toString())
    }
    
    if (message.statusHistory) {
      message.statusHistory.forEach(history => {
        if (history.changedBy) {
          userIds.add(history.changedBy.toString())
        }
      })
    }

    if (message.adminNotes) {
      message.adminNotes.forEach(note => {
        if (note.addedBy) {
          userIds.add(note.addedBy.toString())
        }
      })
    }

    if (message.readBy) {
      message.readBy.forEach(userId => {
        if (userId) {
          userIds.add(userId.toString())
        }
      })
    }

    // Fetch all users at once
    const users = await Promise.all(
      Array.from(userIds).map(id => User.getUserById(id))
    )
    
    // Create user map
    const usersMap = {}
    users.forEach(user => {
      if (user) {
        usersMap[user._id.toString()] = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    })

    // Enrich message with user data
    if (message.adminResponse?.respondedBy) {
      const userId = message.adminResponse.respondedBy.toString()
      message.adminResponse.respondedBy = usersMap[userId] || null
    }
    
    if (message.statusHistory) {
      message.statusHistory = message.statusHistory.map(history => ({
        ...history,
        changedBy: history.changedBy 
          ? usersMap[history.changedBy.toString()] || null 
          : null
      }))
    }

    if (message.adminNotes) {
      message.adminNotes = message.adminNotes.map(note => ({
        ...note,
        addedBy: note.addedBy 
          ? usersMap[note.addedBy.toString()] || null 
          : null
      }))
    }

    if (message.readBy) {
      message.readBy = message.readBy
        .map(userId => usersMap[userId.toString()])
        .filter(Boolean)
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    })
  } catch (error) {
    console.error('Update contact message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    })
  }
})

// Mark message as read (admin only)
router.put('/messages/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readBy: req.user._id,
        readAt: new Date()
      },
      { new: true }
    ).lean()

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Enrich readBy user data
    if (message.readBy) {
      const readByUser = await User.getUserById(message.readBy)
      if (readByUser) {
        message.readBy = {
          _id: readByUser._id,
          firstName: readByUser.firstName,
          lastName: readByUser.lastName,
          email: readByUser.email
        }
      }
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    })
  } catch (error) {
    console.error('Mark message as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    })
  }
})

// Add admin note (admin only)
router.post('/messages/:id/notes', authenticateToken, requireAdmin, [
  body('note').trim().isLength({ min: 1, max: 1000 }).withMessage('Note must be between 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { note } = req.body

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          adminNotes: {
            note,
            addedBy: req.user._id,
            addedAt: new Date()
          }
        }
      },
      { new: true }
    ).lean()

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Manually enrich user data
    const userIds = new Set()
    
    if (message.readBy) {
      userIds.add(message.readBy.toString())
    }
    
    if (message.adminNotes) {
      message.adminNotes.forEach(note => {
        if (note.addedBy) {
          userIds.add(note.addedBy.toString())
        }
      })
    }

    // Fetch all users at once
    const users = await Promise.all(
      Array.from(userIds).map(id => User.getUserById(id))
    )
    
    // Create user map
    const usersMap = {}
    users.forEach(user => {
      if (user) {
        usersMap[user._id.toString()] = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    })

    // Enrich message with user data
    if (message.readBy) {
      message.readBy = usersMap[message.readBy.toString()] || null
    }
    
    if (message.adminNotes) {
      message.adminNotes = message.adminNotes.map(note => ({
        ...note,
        addedBy: note.addedBy 
          ? usersMap[note.addedBy.toString()] || null 
          : null
      }))
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: message
    })
  } catch (error) {
    console.error('Add admin note error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    })
  }
})

// Delete contact message (admin only)
router.delete('/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete contact message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    })
  }
})

// Send admin response to user (admin only)
router.post('/messages/:id/response', authenticateToken, requireAdmin, [
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Response must be between 10-2000 characters')
], async (req, res) => {
  try {
    console.log('=== SEND RESPONSE DEBUG ===')
    console.log('Request body:', req.body)
    console.log('Message field:', req.body.message)
    console.log('Message length:', req.body.message?.length)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { message: responseMessage } = req.body

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: {
          message: responseMessage,
          respondedBy: req.user._id,
          respondedAt: new Date(),
          isUserNotified: true
        },
        status: 'resolved' // Automatically mark as resolved when response is sent
      },
      { new: true }
    ).lean()

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Manually enrich respondedBy user data
    const responderUser = await User.getUserById(req.user._id)
    if (responderUser && message.adminResponse) {
      message.adminResponse.respondedBy = {
        firstName: responderUser.firstName,
        lastName: responderUser.lastName,
        email: responderUser.email
      }
    }

    // Enrich status history changedBy
    if (message.statusHistory && message.statusHistory.length > 0) {
      const userIds = [...new Set(message.statusHistory
        .map(h => h.changedBy?.toString())
        .filter(Boolean))]
      
      const users = await Promise.all(userIds.map(id => User.getUserById(id)))
      const usersMap = {}
      users.forEach(user => {
        if (user) {
          usersMap[user._id.toString()] = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      })

      message.statusHistory = message.statusHistory.map(history => ({
        ...history,
        changedBy: history.changedBy 
          ? usersMap[history.changedBy.toString()] || null 
          : null
      }))
    }

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: message
    })
  } catch (error) {
    console.error('Send admin response error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send response'
    })
  }
})

// Get user's own contact messages by email (public - requires email verification)
router.get('/my-messages/:email', async (req, res) => {
  try {
    const { email } = req.params

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      })
    }

    // Get messages without populate (using lean for plain objects)
    const messages = await ContactMessage.find({ 
      email: email.toLowerCase() 
    })
      .select('firstName lastName email subject message status priority adminResponse statusHistory createdAt updatedAt')
      .lean()
      .sort({ createdAt: -1 })

    // Manually enrich user data
    const userIds = new Set()
    
    messages.forEach(msg => {
      if (msg.adminResponse?.respondedBy) {
        userIds.add(msg.adminResponse.respondedBy.toString())
      }
      if (msg.statusHistory) {
        msg.statusHistory.forEach(history => {
          if (history.changedBy) {
            userIds.add(history.changedBy.toString())
          }
        })
      }
    })

    // Fetch all users at once
    const users = await Promise.all(
      Array.from(userIds).map(id => User.getUserById(id))
    )
    
    // Create user map
    const usersMap = {}
    users.forEach(user => {
      if (user) {
        usersMap[user._id.toString()] = {
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    })

    // Enrich messages with user data
    const enrichedMessages = messages.map(msg => {
      const enriched = { ...msg }
      
      if (enriched.adminResponse?.respondedBy) {
        const userId = enriched.adminResponse.respondedBy.toString()
        enriched.adminResponse.respondedBy = usersMap[userId] || null
      }
      
      if (enriched.statusHistory) {
        enriched.statusHistory = enriched.statusHistory.map(history => ({
          ...history,
          changedBy: history.changedBy 
            ? usersMap[history.changedBy.toString()] || null 
            : null
        }))
      }
      
      return enriched
    })

    res.json({
      success: true,
      data: enrichedMessages
    })
  } catch (error) {
    console.error('Get user messages error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    })
  }
})

module.exports = router