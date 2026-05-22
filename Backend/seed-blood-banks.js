require('dotenv').config();
const mongoose = require('mongoose');
const dbConnection = require('./config/database');
const BloodBank = require('./models/BloodBank');
const UserModel = require('./models/User');
const jwt = require('jsonwebtoken');

const bloodBanks = [
  {
    name: 'LifeStream Blood Bank',
    licenseNumber: 'LIC-BB-2024-001',
    email: 'lifestream@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: '45 MG Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [77.2195, 28.6328] },
    contact: {
      phone: '+91-11-23456789',
      alternatePhone: '+91-11-23456780',
      fax: '+91-11-23456781',
      website: 'https://lifestreambloodbank.in',
      emergencyContact: '+91-9876543210'
    },
    contactPerson: {
      name: 'Dr. Rajesh Sharma',
      designation: 'Chief Medical Officer',
      phone: '+91-9876543210',
      email: 'rajesh.sharma@lifestream.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Emergency Blood Supply', '24/7 Emergency Service'],
    specialServices: 'Rare blood group availability and emergency 24/7 service',
    bloodStock: { 'O+': 45, 'O-': 12, 'A+': 38, 'A-': 8, 'B+': 52, 'B-': 6, 'AB+': 15, 'AB-': 3 },
    capacity: { totalBeds: 20, storageCapacity: 500, dailyCollectionCapacity: 50 },
    rating: 4.5,
    reviewCount: 128,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: true, openTime: '10:00', closeTime: '14:00' }
    }
  },
  {
    name: 'Red Cross Blood Center',
    licenseNumber: 'LIC-BB-2024-002',
    email: 'redcross@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: '112 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    contact: {
      phone: '+91-22-12345678',
      alternatePhone: '+91-22-12345679',
      fax: '+91-22-12345680',
      website: 'https://redcrossblood.in',
      emergencyContact: '+91-9123456789'
    },
    contactPerson: {
      name: 'Dr. Priya Patel',
      designation: 'Director',
      phone: '+91-9123456789',
      email: 'priya.patel@redcross.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Plasma Collection', 'Apheresis', 'Mobile Blood Drives', 'Emergency Blood Supply'],
    specialServices: 'Mobile blood drive units and plasma therapy center',
    bloodStock: { 'O+': 60, 'O-': 18, 'A+': 42, 'A-': 11, 'B+': 55, 'B-': 9, 'AB+': 20, 'AB-': 5 },
    capacity: { totalBeds: 30, storageCapacity: 800, dailyCollectionCapacity: 75 },
    rating: 4.8,
    reviewCount: 256,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      tuesday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      wednesday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      thursday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      friday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      sunday: { isOpen: true, openTime: '09:00', closeTime: '15:00' }
    }
  },
  {
    name: 'Sanjeevani Blood Bank',
    licenseNumber: 'LIC-BB-2024-003',
    email: 'sanjeevani@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: '78 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    contact: {
      phone: '+91-80-87654321',
      alternatePhone: '+91-80-87654322',
      fax: '',
      website: 'https://sanjeevaniblood.in',
      emergencyContact: '+91-9988776655'
    },
    contactPerson: {
      name: 'Dr. Anil Kumar',
      designation: 'Head of Operations',
      phone: '+91-9988776655',
      email: 'anil.kumar@sanjeevani.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Rare Blood Types', 'Educational Programs'],
    specialServices: 'Specializes in rare blood group matching and donor education programs',
    bloodStock: { 'O+': 35, 'O-': 8, 'A+': 28, 'A-': 5, 'B+': 40, 'B-': 4, 'AB+': 12, 'AB-': 2 },
    capacity: { totalBeds: 15, storageCapacity: 350, dailyCollectionCapacity: 40 },
    rating: 4.3,
    reviewCount: 89,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '14:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  },
  {
    name: 'Apollo Blood Bank',
    licenseNumber: 'LIC-BB-2024-004',
    email: 'apollo@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: '21 Anna Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600002',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
    contact: {
      phone: '+91-44-55667788',
      alternatePhone: '+91-44-55667789',
      fax: '+91-44-55667790',
      website: 'https://apollobloodbank.in',
      emergencyContact: '+91-9876501234'
    },
    contactPerson: {
      name: 'Dr. Meena Iyer',
      designation: 'Senior Pathologist',
      phone: '+91-9876501234',
      email: 'meena.iyer@apollo.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Plasma Collection', 'Cord Blood Banking', 'Bone Marrow Registry'],
    specialServices: 'Advanced cord blood banking and bone marrow registry services',
    bloodStock: { 'O+': 70, 'O-': 22, 'A+': 50, 'A-': 14, 'B+': 65, 'B-': 11, 'AB+': 25, 'AB-': 7 },
    capacity: { totalBeds: 40, storageCapacity: 1000, dailyCollectionCapacity: 100 },
    rating: 4.7,
    reviewCount: 312,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      saturday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      sunday: { isOpen: true, openTime: '08:00', closeTime: '16:00' }
    }
  },
  {
    name: 'Jeevan Raksha Blood Centre',
    licenseNumber: 'LIC-BB-2024-005',
    email: 'jeevanraksha@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: '156 Salt Lake Sector V',
      city: 'Kolkata',
      state: 'West Bengal',
      zipCode: '700091',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [88.3639, 22.5726] },
    contact: {
      phone: '+91-33-44556677',
      alternatePhone: '+91-33-44556678',
      fax: '',
      website: 'https://jeevanraksha.in',
      emergencyContact: '+91-9765432100'
    },
    contactPerson: {
      name: 'Dr. Sanjay Banerjee',
      designation: 'Medical Director',
      phone: '+91-9765432100',
      email: 'sanjay.banerjee@jeevanraksha.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Emergency Blood Supply', 'Mobile Blood Drives', '24/7 Emergency Service'],
    specialServices: 'Emergency blood supply network across eastern India',
    bloodStock: { 'O+': 40, 'O-': 10, 'A+': 32, 'A-': 7, 'B+': 48, 'B-': 5, 'AB+': 18, 'AB-': 4 },
    capacity: { totalBeds: 25, storageCapacity: 600, dailyCollectionCapacity: 60 },
    rating: 4.4,
    reviewCount: 167,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '16:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  }
];

async function seedBloodBanks() {
  try {
    // Connect to DB
    await dbConnection.connect();
    console.log('✅ Connected to database\n');

    // Get admin user to set createdBy
    const db = dbConnection.getDatabase();
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ Admin user not found! Run init-admin.js first.');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.email}\n`);

    // Clear existing blood banks (optional - for clean seed)
    const existingCount = await BloodBank.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing blood banks. Clearing...`);
      await BloodBank.deleteMany({});
      console.log('✅ Cleared existing blood banks\n');
    }

    // Create blood banks directly via Mongoose (with all fields)
    let created = 0;
    for (const bankData of bloodBanks) {
      try {
        const bloodBank = new BloodBank({
          ...bankData,
          createdBy: adminUser._id
        });
        
        await bloodBank.save();
        created++;
        console.log(`✅ [${created}/${bloodBanks.length}] Created: ${bankData.name}`);
        console.log(`   📧 Email: ${bankData.email}`);
        console.log(`   🔑 Password: ${bankData.password}`);
        console.log(`   📍 ${bankData.address.city}, ${bankData.address.state}`);
        console.log(`   🩸 Total blood units: ${Object.values(bankData.bloodStock).reduce((a, b) => a + b, 0)}`);
        console.log('');
      } catch (err) {
        console.error(`❌ Failed to create ${bankData.name}: ${err.message}`);
      }
    }

    console.log('='.repeat(50));
    console.log(`\n🎉 Seeding complete! Created ${created}/${bloodBanks.length} blood banks.`);
    console.log('\n📋 All blood banks use the same password: BloodBank@123');
    console.log('\n📋 Blood Bank Login Credentials:');
    console.log('-'.repeat(50));
    bloodBanks.forEach(bank => {
      console.log(`  ${bank.name}`);
      console.log(`    Email: ${bank.email}`);
      console.log(`    Password: BloodBank@123`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedBloodBanks();
