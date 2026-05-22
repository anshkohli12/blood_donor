require('dotenv').config();
const dbConnection = require('./config/database');
const UserModel = require('./models/User');
const DonorModel = require('./models/Donor');

const users = [
  { firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@example.com', phone: '+91-9876543201', password: 'Password@123', bloodType: 'O+', dateOfBirth: '1990-05-14', city: 'Delhi', state: 'Delhi', role: 'user' },
  { firstName: 'Priya', lastName: 'Singh', email: 'priya.singh@example.com', phone: '+91-9876543202', password: 'Password@123', bloodType: 'A+', dateOfBirth: '1992-08-21', city: 'Mumbai', state: 'Maharashtra', role: 'user' },
  { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@example.com', phone: '+91-9876543203', password: 'Password@123', bloodType: 'B+', dateOfBirth: '1988-11-03', city: 'Bangalore', state: 'Karnataka', role: 'user' },
  { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@example.com', phone: '+91-9876543204', password: 'Password@123', bloodType: 'AB+', dateOfBirth: '1995-02-15', city: 'Chennai', state: 'Tamil Nadu', role: 'user' },
  { firstName: 'Vikram', lastName: 'Verma', email: 'vikram.verma@example.com', phone: '+91-9876543205', password: 'Password@123', bloodType: 'O-', dateOfBirth: '1985-07-30', city: 'Kolkata', state: 'West Bengal', role: 'user' },
  { firstName: 'Neha', lastName: 'Reddy', email: 'neha.reddy@example.com', phone: '+91-9876543206', password: 'Password@123', bloodType: 'A-', dateOfBirth: '1993-12-05', city: 'Hyderabad', state: 'Telangana', role: 'user' },
  { firstName: 'Karan', lastName: 'Chopra', email: 'karan.chopra@example.com', phone: '+91-9876543207', password: 'Password@123', bloodType: 'B-', dateOfBirth: '1991-09-18', city: 'Pune', state: 'Maharashtra', role: 'user' },
  { firstName: 'Pooja', lastName: 'Joshi', email: 'pooja.joshi@example.com', phone: '+91-9876543208', password: 'Password@123', bloodType: 'AB-', dateOfBirth: '1996-04-22', city: 'Ahmedabad', state: 'Gujarat', role: 'user' },
  { firstName: 'Rohan', lastName: 'Mehta', email: 'rohan.mehta@example.com', phone: '+91-9876543209', password: 'Password@123', bloodType: 'O+', dateOfBirth: '1989-01-10', city: 'Jaipur', state: 'Rajasthan', role: 'user' },
  { firstName: 'Anjali', lastName: 'Nair', email: 'anjali.nair@example.com', phone: '+91-9876543210', password: 'Password@123', bloodType: 'A+', dateOfBirth: '1994-06-25', city: 'Kochi', state: 'Kerala', role: 'user' }
];

const donors = [
  { name: 'Sanjay Dutt', email: 'sanjay.donor@example.com', bloodType: 'O+', city: 'Chandigarh', state: 'Chandigarh', phone: '+91-8876543201', totalDonations: 4, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), isAvailable: true, distance: 3.5 },
  { name: 'Sunil Grover', email: 'sunil.donor@example.com', bloodType: 'A+', city: 'Mohali', state: 'Punjab', phone: '+91-8876543202', totalDonations: 8, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), isAvailable: true, distance: 8.2 },
  { name: 'Kareena Kapoor', email: 'kareena.donor@example.com', bloodType: 'B+', city: 'Panchkula', state: 'Haryana', phone: '+91-8876543203', totalDonations: 1, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), isAvailable: false, distance: 7.1 }, // Not available (donated recently)
  { name: 'Armaan Malik', email: 'armaan.donor@example.com', bloodType: 'AB+', city: 'Delhi', state: 'Delhi', phone: '+91-8876543204', totalDonations: 12, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(), isAvailable: true, distance: 15.0 },
  { name: 'Deepika Singh', email: 'deepika.donor@example.com', bloodType: 'O-', city: 'Chandigarh', state: 'Chandigarh', phone: '+91-8876543205', totalDonations: 3, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), isAvailable: false, distance: 2.1 }, // Not available (donated recently)
  { name: 'Ranbir Kapoor', email: 'ranbir.donor@example.com', bloodType: 'A-', city: 'Zirakpur', state: 'Punjab', phone: '+91-8876543206', totalDonations: 6, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), isAvailable: true, distance: 10.5 },
  { name: 'Alia Bhatt', email: 'alia.donor@example.com', bloodType: 'B-', city: 'Mohali', state: 'Punjab', phone: '+91-8876543207', totalDonations: 2, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(), isAvailable: true, distance: 9.3 },
  { name: 'Varun Dhawan', email: 'varun.donor@example.com', bloodType: 'AB-', city: 'Panchkula', state: 'Haryana', phone: '+91-8876543208', totalDonations: 5, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(), isAvailable: true, distance: 6.8 },
  { name: 'Shraddha Kapoor', email: 'shraddha.donor@example.com', bloodType: 'O+', city: 'Chandigarh', state: 'Chandigarh', phone: '+91-8876543209', totalDonations: 9, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(), isAvailable: true, distance: 4.2 },
  { name: 'Tiger Shroff', email: 'tiger.donor@example.com', bloodType: 'A+', city: 'Zirakpur', state: 'Punjab', phone: '+91-8876543210', totalDonations: 15, lastDonation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), isAvailable: false, distance: 12.4 } // Not available (donated recently)
];

async function seedData() {
  try {
    await dbConnection.connect();
    console.log('✅ Connected to database\n');

    let createdUsers = 0;
    for (const userData of users) {
      try {
        const existing = await UserModel.getUserByEmail(userData.email);
        if (existing) {
          console.log(`⚠️  Skipped User (already exists): ${userData.email}`);
          continue;
        }
        await UserModel.createUser(userData);
        createdUsers++;
        console.log(`✅ Created User: ${userData.firstName} ${userData.lastName}`);
      } catch (err) {
        console.error(`❌ Failed User: ${userData.email} — ${err.message}`);
      }
    }

    let createdDonors = 0;
    const db = dbConnection.getDatabase();
    for (const donorData of donors) {
      try {
        const existing = await db.collection('donors').findOne({ email: donorData.email });
        if (existing) {
          console.log(`⚠️  Skipped Donor (already exists): ${donorData.name}`);
          continue;
        }
        await DonorModel.createDonor(donorData);
        createdDonors++;
        console.log(`✅ Created Donor: ${donorData.name}`);
      } catch (err) {
        console.error(`❌ Failed Donor: ${donorData.name} — ${err.message}`);
      }
    }

    console.log('='.repeat(50));
    console.log(`\n🎉 Seeding complete!`);
    console.log(`👥 Users Added: ${createdUsers}`);
    console.log(`🩸 Donors Added: ${createdDonors}`);
    console.log(`🔑 All users password: Password@123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
