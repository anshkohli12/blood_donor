require('dotenv').config();
const dbConnection = require('./config/database');
const BloodBank = require('./models/BloodBank');

const chandigarhBloodBanks = [
  {
    name: 'PGI Blood Bank',
    licenseNumber: 'LIC-CHD-2024-001',
    email: 'pgi@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Sector 12, PGIMER Campus',
      city: 'Chandigarh',
      state: 'Chandigarh',
      zipCode: '160012',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7794, 30.7641] },
    contact: {
      phone: '+91-172-2746018',
      alternatePhone: '+91-172-2746019',
      fax: '+91-172-2746020',
      website: 'https://pgimer.edu.in',
      emergencyContact: '+91-9876001001'
    },
    contactPerson: {
      name: 'Dr. Neelam Marwaha',
      designation: 'Head of Transfusion Medicine',
      phone: '+91-9876001001',
      email: 'neelam.marwaha@pgi.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Plasma Collection', 'Apheresis', 'Rare Blood Types', 'Emergency Blood Supply', '24/7 Emergency Service'],
    specialServices: 'Premier government blood bank with rare blood group registry and 24/7 emergency service. Attached to PGIMER hospital.',
    bloodStock: { 'O+': 85, 'O-': 25, 'A+': 60, 'A-': 18, 'B+': 72, 'B-': 14, 'AB+': 30, 'AB-': 8 },
    capacity: { totalBeds: 50, storageCapacity: 1200, dailyCollectionCapacity: 120 },
    rating: 4.9,
    reviewCount: 520,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      saturday: { isOpen: true, openTime: '07:00', closeTime: '20:00' },
      sunday: { isOpen: true, openTime: '08:00', closeTime: '18:00' }
    }
  },
  {
    name: 'GMCH Blood Bank',
    licenseNumber: 'LIC-CHD-2024-002',
    email: 'gmch@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Sector 32, GMCH Campus',
      city: 'Chandigarh',
      state: 'Chandigarh',
      zipCode: '160032',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7536, 30.7280] },
    contact: {
      phone: '+91-172-2665253',
      alternatePhone: '+91-172-2665254',
      fax: '',
      website: 'https://gmch.gov.in',
      emergencyContact: '+91-9876002002'
    },
    contactPerson: {
      name: 'Dr. Harpreet Singh',
      designation: 'Senior Medical Officer',
      phone: '+91-9876002002',
      email: 'harpreet.singh@gmch.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Emergency Blood Supply', '24/7 Emergency Service'],
    specialServices: 'Government medical college blood bank with free blood services for BPL patients',
    bloodStock: { 'O+': 55, 'O-': 15, 'A+': 42, 'A-': 10, 'B+': 50, 'B-': 8, 'AB+': 20, 'AB-': 5 },
    capacity: { totalBeds: 30, storageCapacity: 700, dailyCollectionCapacity: 80 },
    rating: 4.5,
    reviewCount: 340,
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
      sunday: { isOpen: true, openTime: '09:00', closeTime: '14:00' }
    }
  },
  {
    name: 'Rotary Blood Bank Chandigarh',
    licenseNumber: 'LIC-CHD-2024-003',
    email: 'rotary.chd@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'SCO 368-369, Sector 35-D',
      city: 'Chandigarh',
      state: 'Chandigarh',
      zipCode: '160035',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7688, 30.7230] },
    contact: {
      phone: '+91-172-2604700',
      alternatePhone: '+91-172-2604701',
      fax: '',
      website: 'https://rotarybloodbank.org',
      emergencyContact: '+91-9876003003'
    },
    contactPerson: {
      name: 'Dr. Simran Kaur',
      designation: 'Chief Pathologist',
      phone: '+91-9876003003',
      email: 'simran.kaur@rotary.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Mobile Blood Drives', 'Educational Programs'],
    specialServices: 'Voluntary blood donation center with regular community blood drives and awareness programs',
    bloodStock: { 'O+': 38, 'O-': 10, 'A+': 30, 'A-': 7, 'B+': 35, 'B-': 5, 'AB+': 14, 'AB-': 3 },
    capacity: { totalBeds: 18, storageCapacity: 400, dailyCollectionCapacity: 45 },
    rating: 4.6,
    reviewCount: 215,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  },
  {
    name: 'Fortis Blood Bank Mohali',
    licenseNumber: 'LIC-CHD-2024-004',
    email: 'fortis.mohali@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Phase 8, Industrial Area',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160059',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7172, 30.7046] },
    contact: {
      phone: '+91-172-4692222',
      alternatePhone: '+91-172-4692223',
      fax: '+91-172-4692224',
      website: 'https://fortishealthcare.com',
      emergencyContact: '+91-9876004004'
    },
    contactPerson: {
      name: 'Dr. Vikram Dhillon',
      designation: 'Director Blood Services',
      phone: '+91-9876004004',
      email: 'vikram.dhillon@fortis.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Plasma Collection', 'Apheresis', 'Emergency Blood Supply', '24/7 Emergency Service'],
    specialServices: 'Premium hospital blood bank with advanced apheresis technology and component separation',
    bloodStock: { 'O+': 65, 'O-': 20, 'A+': 48, 'A-': 15, 'B+': 58, 'B-': 12, 'AB+': 22, 'AB-': 6 },
    capacity: { totalBeds: 35, storageCapacity: 900, dailyCollectionCapacity: 90 },
    rating: 4.7,
    reviewCount: 278,
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
    name: 'Max Hospital Blood Bank',
    licenseNumber: 'LIC-CHD-2024-005',
    email: 'max.mohali@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Phase 6, SAS Nagar',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160055',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7220, 30.6942] },
    contact: {
      phone: '+91-172-6652000',
      alternatePhone: '+91-172-6652001',
      fax: '',
      website: 'https://maxhealthcare.in',
      emergencyContact: '+91-9876005005'
    },
    contactPerson: {
      name: 'Dr. Aman Gupta',
      designation: 'Head of Hematology',
      phone: '+91-9876005005',
      email: 'aman.gupta@maxhealthcare.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Plasma Collection', 'Emergency Blood Supply'],
    specialServices: 'Specialized in pediatric transfusion and immune-compromised patient blood services',
    bloodStock: { 'O+': 50, 'O-': 16, 'A+': 40, 'A-': 12, 'B+': 45, 'B-': 9, 'AB+': 18, 'AB-': 4 },
    capacity: { totalBeds: 25, storageCapacity: 650, dailyCollectionCapacity: 65 },
    rating: 4.6,
    reviewCount: 190,
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
    name: 'Alchemist Blood Bank Panchkula',
    licenseNumber: 'LIC-CHD-2024-006',
    email: 'alchemist.pkl@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Sector 21, Near Tau Devi Lal Stadium',
      city: 'Panchkula',
      state: 'Haryana',
      zipCode: '134116',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.8606, 30.6942] },
    contact: {
      phone: '+91-172-2590555',
      alternatePhone: '+91-172-2590556',
      fax: '',
      website: 'https://alchemisthospital.com',
      emergencyContact: '+91-9876006006'
    },
    contactPerson: {
      name: 'Dr. Ritu Verma',
      designation: 'Blood Bank Incharge',
      phone: '+91-9876006006',
      email: 'ritu.verma@alchemist.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Platelet Donation', 'Emergency Blood Supply'],
    specialServices: 'Serves Panchkula and surrounding Haryana areas with quick emergency response',
    bloodStock: { 'O+': 30, 'O-': 8, 'A+': 25, 'A-': 6, 'B+': 32, 'B-': 4, 'AB+': 12, 'AB-': 2 },
    capacity: { totalBeds: 15, storageCapacity: 300, dailyCollectionCapacity: 35 },
    rating: 4.2,
    reviewCount: 95,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  },
  {
    name: 'Ivy Hospital Blood Centre',
    licenseNumber: 'LIC-CHD-2024-007',
    email: 'ivy.mohali@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Sector 71, SAS Nagar',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160071',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7112, 30.7130] },
    contact: {
      phone: '+91-172-7170000',
      alternatePhone: '+91-172-7170001',
      fax: '',
      website: 'https://ivyhospital.com',
      emergencyContact: '+91-9876007007'
    },
    contactPerson: {
      name: 'Dr. Jaspreet Kaur',
      designation: 'Consultant Pathologist',
      phone: '+91-9876007007',
      email: 'jaspreet.kaur@ivy.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Emergency Blood Supply', 'Platelet Donation'],
    specialServices: 'Multi-specialty hospital blood bank with integrated trauma center support',
    bloodStock: { 'O+': 42, 'O-': 11, 'A+': 35, 'A-': 9, 'B+': 40, 'B-': 7, 'AB+': 16, 'AB-': 3 },
    capacity: { totalBeds: 20, storageCapacity: 450, dailyCollectionCapacity: 50 },
    rating: 4.4,
    reviewCount: 145,
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
      sunday: { isOpen: true, openTime: '10:00', closeTime: '14:00' }
    }
  },
  {
    name: 'Sector 16 Blood Bank',
    licenseNumber: 'LIC-CHD-2024-008',
    email: 'sector16@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Government Multi Specialty Hospital, Sector 16',
      city: 'Chandigarh',
      state: 'Chandigarh',
      zipCode: '160016',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7856, 30.7520] },
    contact: {
      phone: '+91-172-2781329',
      alternatePhone: '+91-172-2781330',
      fax: '',
      website: 'https://gmsh16.gov.in',
      emergencyContact: '+91-9876008008'
    },
    contactPerson: {
      name: 'Dr. Parveen Garg',
      designation: 'Medical Superintendent',
      phone: '+91-9876008008',
      email: 'parveen.garg@gmsh.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Emergency Blood Supply', 'Mobile Blood Drives', '24/7 Emergency Service'],
    specialServices: 'Government hospital blood bank providing free blood to accident victims and emergency cases',
    bloodStock: { 'O+': 48, 'O-': 13, 'A+': 38, 'A-': 9, 'B+': 44, 'B-': 7, 'AB+': 17, 'AB-': 4 },
    capacity: { totalBeds: 22, storageCapacity: 550, dailyCollectionCapacity: 55 },
    rating: 4.3,
    reviewCount: 180,
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
    name: 'Healing Touch Blood Bank Zirakpur',
    licenseNumber: 'LIC-CHD-2024-009',
    email: 'healingtouch.zkp@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'VIP Road, Near Zirakpur Flyover',
      city: 'Zirakpur',
      state: 'Punjab',
      zipCode: '140603',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.8172, 30.6436] },
    contact: {
      phone: '+91-1762-504000',
      alternatePhone: '+91-1762-504001',
      fax: '',
      website: 'https://healingtouchzirakpur.com',
      emergencyContact: '+91-9876009009'
    },
    contactPerson: {
      name: 'Dr. Manish Tiwari',
      designation: 'Lab Director',
      phone: '+91-9876009009',
      email: 'manish.tiwari@healingtouch.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Emergency Blood Supply'],
    specialServices: 'Serving Zirakpur-Derabassi-Ambala highway corridor with rapid emergency delivery',
    bloodStock: { 'O+': 25, 'O-': 6, 'A+': 20, 'A-': 4, 'B+': 28, 'B-': 3, 'AB+': 10, 'AB-': 2 },
    capacity: { totalBeds: 10, storageCapacity: 200, dailyCollectionCapacity: 25 },
    rating: 4.1,
    reviewCount: 67,
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
    name: 'IISER Blood Donation Centre',
    licenseNumber: 'LIC-CHD-2024-010',
    email: 'iiser.chd@bloodbank.com',
    password: 'BloodBank@123',
    address: {
      street: 'Sector 81, Knowledge City',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '140306',
      country: 'India'
    },
    location: { type: 'Point', coordinates: [76.7292, 30.6680] },
    contact: {
      phone: '+91-172-2240266',
      alternatePhone: '+91-172-2240267',
      fax: '',
      website: 'https://iisermohali.ac.in',
      emergencyContact: '+91-9876010010'
    },
    contactPerson: {
      name: 'Dr. Anjali Mehta',
      designation: 'Health Centre Incharge',
      phone: '+91-9876010010',
      email: 'anjali.mehta@iiser.in'
    },
    services: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Educational Programs', 'Mobile Blood Drives'],
    specialServices: 'University-affiliated blood donation centre focusing on youth donors and educational outreach',
    bloodStock: { 'O+': 20, 'O-': 5, 'A+': 18, 'A-': 3, 'B+': 22, 'B-': 3, 'AB+': 8, 'AB-': 2 },
    capacity: { totalBeds: 8, storageCapacity: 150, dailyCollectionCapacity: 20 },
    rating: 4.0,
    reviewCount: 42,
    isVerified: true,
    isActive: true,
    isOpen: true,
    operatingHours: {
      monday: { isOpen: true, openTime: '10:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '10:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '10:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '10:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '10:00', closeTime: '17:00' },
      saturday: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '13:00' }
    }
  }
];

async function seedChandigarhBanks() {
  try {
    await dbConnection.connect();
    console.log('✅ Connected to database\n');

    const db = dbConnection.getDatabase();
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ Admin user not found! Run init-admin.js first.');
      process.exit(1);
    }
    console.log(`✅ Found admin: ${adminUser.email}\n`);

    let created = 0;
    for (const bankData of chandigarhBloodBanks) {
      try {
        // Skip if already exists
        const existing = await BloodBank.findOne({ email: bankData.email });
        if (existing) {
          console.log(`⚠️  Skipped (already exists): ${bankData.name}`);
          continue;
        }

        const bloodBank = new BloodBank({
          ...bankData,
          createdBy: adminUser._id
        });
        
        await bloodBank.save();
        created++;
        console.log(`✅ [${created}] Created: ${bankData.name}`);
        console.log(`   📧 ${bankData.email} | 📍 ${bankData.address.city}, ${bankData.address.state}`);
        console.log(`   🩸 ${Object.values(bankData.bloodStock).reduce((a, b) => a + b, 0)} units | ⭐ ${bankData.rating}`);
        console.log('');
      } catch (err) {
        console.error(`❌ Failed: ${bankData.name} — ${err.message}`);
      }
    }

    const totalBanks = await BloodBank.countDocuments();
    console.log('='.repeat(55));
    console.log(`\n🎉 Added ${created} Chandigarh-area blood banks!`);
    console.log(`📊 Total blood banks in database: ${totalBanks}`);
    console.log(`🔑 All use password: BloodBank@123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedChandigarhBanks();
