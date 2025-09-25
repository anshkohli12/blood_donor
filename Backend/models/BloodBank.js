const mongoose = require('mongoose')

const bloodStockSchema = {
  'O+': { type: Number, default: 0, min: 0 },
  'O-': { type: Number, default: 0, min: 0 },
  'A+': { type: Number, default: 0, min: 0 },
  'A-': { type: Number, default: 0, min: 0 },
  'B+': { type: Number, default: 0, min: 0 },
  'B-': { type: Number, default: 0, min: 0 },
  'AB+': { type: Number, default: 0, min: 0 },
  'AB-': { type: Number, default: 0, min: 0 }
}

const operatingHoursSchema = new mongoose.Schema({
  monday: { 
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '17:00' }
  },
  tuesday: { 
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '17:00' }
  },
  wednesday: { 
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '17:00' }
  },
  thursday: { 
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '17:00' }
  },
  friday: { 
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '17:00' }
  },
  saturday: { 
    isOpen: { type: Boolean, default: false },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '13:00' }
  },
  sunday: { 
    isOpen: { type: Boolean, default: false },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '13:00' }
  }
})

const bloodBankSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Blood bank name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  
  // Login Credentials for Blood Bank Staff
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Address Information
  address: {
    street: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    zipCode: { type: String, default: '', trim: true },
    country: { type: String, default: 'USA', trim: true }
  },
  
  // Geographic coordinates for location-based searches
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Contact Information
  contact: {
    phone: { type: String, default: '', trim: true },
    alternatePhone: { type: String, default: '', trim: true },
    fax: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    emergencyContact: { type: String, default: '', trim: true }
  },
  
  // Operating Hours
  operatingHours: operatingHoursSchema,
  
  // Operating Hours Display String (auto-generated)
  operatingHoursDisplay: { type: String },
  
  // Blood Stock
  bloodStock: bloodStockSchema,
  
  // Profile Image
  profileImage: { type: String, default: '' },
  
  // Services and Facilities
  services: [{
    type: String,
    enum: [
      'Blood Collection',
      'Blood Testing',
      'Blood Storage',
      'Platelet Donation',
      'Plasma Collection',
      'Apheresis',
      'Mobile Blood Drives',
      'Emergency Blood Supply',
      'Rare Blood Types',
      'Cord Blood Banking',
      'Bone Marrow Registry',
      'Educational Programs',
      '24/7 Emergency Service'
    ]
  }],
  
  specialServices: { type: String, trim: true },
  
  // Status and Verification
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: true }, // Current open/closed status
  
  // Ratings and Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Staff Information
  contactPerson: {
    name: { type: String, default: '', trim: true },
    designation: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true }
  },
  
  // Capacity and Infrastructure
  capacity: {
    totalBeds: { type: Number, default: 0 },
    storageCapacity: { type: Number, default: 0 }, // in units
    dailyCollectionCapacity: { type: Number, default: 0 }
  },
  
  // Certification and Compliance
  certifications: [{
    name: { type: String, trim: true },
    issuedBy: { type: String, trim: true },
    validUntil: { type: Date },
    certificateNumber: { type: String, trim: true }
  }],
  
  // Last stock update
  lastStockUpdate: { type: Date, default: Date.now },
  
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
})

// Index for geospatial queries
bloodBankSchema.index({ location: '2dsphere' })

// Index for search functionality
bloodBankSchema.index({ 
  name: 'text', 
  'address.city': 'text', 
  'address.state': 'text',
  specialServices: 'text'
})

// Generate operating hours display string
bloodBankSchema.pre('save', function(next) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  let hoursDisplay = []
  let currentGroup = null
  
  days.forEach((day, index) => {
    const dayHours = this.operatingHours[day]
    if (dayHours.isOpen) {
      const timeStr = `${dayHours.openTime} - ${dayHours.closeTime}`
      if (!currentGroup || currentGroup.time !== timeStr) {
        if (currentGroup) {
          hoursDisplay.push(`${currentGroup.days}: ${currentGroup.time}`)
        }
        currentGroup = { days: dayNames[index], time: timeStr }
      } else {
        currentGroup.days += `-${dayNames[index]}`
      }
    } else {
      if (currentGroup) {
        hoursDisplay.push(`${currentGroup.days}: ${currentGroup.time}`)
        currentGroup = null
      }
    }
  })
  
  if (currentGroup) {
    hoursDisplay.push(`${currentGroup.days}: ${currentGroup.time}`)
  }
  
  this.operatingHoursDisplay = hoursDisplay.join(', ') || 'Hours not specified'
  next()
})

// Method to check if blood bank is currently open
bloodBankSchema.methods.isCurrentlyOpen = function() {
  const now = new Date()
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const todayHours = this.operatingHours[currentDay]
  if (!todayHours.isOpen) return false
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
}

// Method to get total blood units
bloodBankSchema.methods.getTotalBloodUnits = function() {
  const stock = this.bloodStock
  return Object.values(stock).reduce((total, units) => total + units, 0)
}

// Method to get low stock blood types (< 10 units)
bloodBankSchema.methods.getLowStockTypes = function() {
  const stock = this.bloodStock
  return Object.entries(stock)
    .filter(([type, units]) => units < 10)
    .map(([type, units]) => ({ type, units }))
}

// Method to update blood stock
bloodBankSchema.methods.updateBloodStock = function(bloodType, quantity, operation = 'set') {
  if (operation === 'add') {
    this.bloodStock[bloodType] += quantity
  } else if (operation === 'subtract') {
    this.bloodStock[bloodType] = Math.max(0, this.bloodStock[bloodType] - quantity)
  } else {
    this.bloodStock[bloodType] = Math.max(0, quantity)
  }
  this.lastStockUpdate = new Date()
  return this.save()
}

// Hash password before saving
bloodBankSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const bcrypt = require('bcryptjs')
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Method to compare password
bloodBankSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs')
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('BloodBank', bloodBankSchema)