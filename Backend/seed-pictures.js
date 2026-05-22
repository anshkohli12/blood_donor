require('dotenv').config();
const dbConnection = require('./config/database');
const BloodBank = require('./models/BloodBank');
const mongoose = require('mongoose');

// Professional medical and profile pictures from Unsplash
const bankImages = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200', // clinic building
  'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=200', // medical team
  'https://images.unsplash.com/photo-1538108149393-cebb47ac194a?auto=format&fit=crop&q=80&w=200', // modern clinic
  'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=200', // medical background
  'https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&q=80&w=200', // hospital staff
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=200'
];

const maleDonors = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
];

const femaleDonors = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
];

async function seedPictures() {
  try {
    await dbConnection.connect();
    console.log('✅ Connected to database\n');

    // 1. Update Blood Banks
    const banks = await BloodBank.find({});
    let bankCount = 0;
    for (let i = 0; i < banks.length; i++) {
        banks[i].profileImage = bankImages[i % bankImages.length];
        await banks[i].save();
        bankCount++;
    }
    console.log(`🏥 Updated ${bankCount} Blood Banks with professional medical imagery.`);

    // 2. Update Donors
    const db = dbConnection.getDatabase();
    const donors = await db.collection('donors').find({}).toArray();
    let donorCount = 0;
    
    for (const donor of donors) {
      let selectedAvatar = '';
      
      // Attempt to infer gender by name from our seeded list for realistic avatars
      const maleNames = ['Sanjay', 'Sunil', 'Armaan', 'Ranbir', 'Varun', 'Tiger'];
      const femaleNames = ['Kareena', 'Deepika', 'Alia', 'Shraddha'];
      
      const firstName = donor.name.split(' ')[0];
      
      if (femaleNames.includes(firstName)) {
        selectedAvatar = femaleDonors[Math.floor(Math.random() * femaleDonors.length)];
      } else {
        selectedAvatar = maleDonors[Math.floor(Math.random() * maleDonors.length)];
      }

      await db.collection('donors').updateOne(
        { _id: donor._id },
        { $set: { avatar: selectedAvatar } }
      );
      donorCount++;
    }
    console.log(`👤 Updated ${donorCount} Donors with high-quality profile avatars.`);

    console.log('\n🎉 Successfully enriched the database with pictures!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

seedPictures();
