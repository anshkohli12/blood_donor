const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  // Basic Event Info
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Date and Time
  date: {
    type: Date,
    required: [true, 'Event start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Event end date is required']
  },
  
  // Location Details
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  // Organizer Info (Blood Bank)
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  
  // Capacity
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0
  },
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'attended'],
      default: 'confirmed'
    }
  }],
  
  // Event Image
  image: {
    type: String,
    default: ''
  },
  
  // Contact Information
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required']
  },
  
  // Additional Information
  requirements: {
    type: String,
    default: 'Must be 18+ years old, weigh at least 110 lbs, and be in good health'
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for geospatial queries
eventSchema.index({ 'coordinates': '2dsphere' })

// Index for filtering
eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ organizer: 1 })

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registeredCount >= this.maxCapacity
})

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date()
  if (this.status === 'cancelled') return 'Cancelled'
  if (this.status === 'completed') return 'Completed'
  if (now > this.endDate) return 'Completed'
  if (now >= this.date && now <= this.endDate) return 'Ongoing'
  if (this.date > now) return 'Upcoming'
  return 'Unknown'
})

// Method to register a user
eventSchema.methods.registerUser = async function(userId) {
  if (this.isFull) {
    throw new Error('Event is already full')
  }
  
  const alreadyRegistered = this.registrations.some(
    reg => reg.userId.toString() === userId.toString()
  )
  
  if (alreadyRegistered) {
    throw new Error('User is already registered for this event')
  }
  
  this.registrations.push({ userId, status: 'confirmed' })
  this.registeredCount += 1
  await this.save()
  return this
}

// Method to unregister a user
eventSchema.methods.unregisterUser = async function(userId) {
  const registrationIndex = this.registrations.findIndex(
    reg => reg.userId.toString() === userId.toString()
  )
  
  if (registrationIndex === -1) {
    throw new Error('User is not registered for this event')
  }
  
  this.registrations.splice(registrationIndex, 1)
  this.registeredCount = Math.max(0, this.registeredCount - 1)
  await this.save()
  return this
}

// Method to approve event
eventSchema.methods.approveEvent = async function(adminId) {
  this.status = 'approved'
  this.approvedBy = adminId
  this.approvedAt = new Date()
  await this.save()
  return this
}

// Method to reject event
eventSchema.methods.rejectEvent = async function(adminId, reason) {
  this.status = 'rejected'
  this.approvedBy = adminId
  this.rejectionReason = reason
  await this.save()
  return this
}

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true })
eventSchema.set('toObject', { virtuals: true })

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
