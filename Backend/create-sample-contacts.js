const mongoose = require('mongoose')
require('dotenv').config()

const ContactMessage = require('./models/ContactMessage')

async function createSampleContacts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if there are already contact messages
    const existingCount = await ContactMessage.countDocuments()
    console.log(`Existing contact messages: ${existingCount}`)

    if (existingCount === 0) {
      const sampleContacts = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          subject: 'Blood Donation Inquiry',
          message: 'I would like to know more about blood donation requirements and schedules.',
          status: 'pending',
          priority: 'medium'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          subject: 'Emergency Blood Request',
          message: 'We urgently need O- blood type for a patient. Please contact us immediately.',
          status: 'pending',
          priority: 'urgent'
        },
        {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          subject: 'Thank You',
          message: 'Thank you for organizing the blood drive at our office. It was very well managed.',
          status: 'resolved',
          priority: 'low'
        }
      ]

      const created = await ContactMessage.insertMany(sampleContacts)
      console.log(`Created ${created.length} sample contact messages`)
    } else {
      console.log('Sample contacts already exist')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating sample contacts:', error)
    process.exit(1)
  }
}

createSampleContacts()