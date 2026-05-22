require('dotenv').config();
const mongoose = require('mongoose');
const dbConnection = require('./config/database');
const EventModel = require('./models/Event');
const BloodBank = require('./models/BloodBank');

const dummyImages = [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800', // blood bag / iv
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800', // medical team / heart
    'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&q=80&w=800', // red medical background
    'https://images.unsplash.com/photo-1542884748-2b87b36c6b90?auto=format&fit=crop&q=80&w=800', // community help
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800'  // hands together
];

async function seedEvents() {
  try {
    await dbConnection.connect();
    console.log('✅ Connected to database\n');

    // Get existing blood banks to act as organizers
    const banks = await BloodBank.find({});
    if (banks.length === 0) {
      console.error('❌ No blood banks found. Please seed blood banks first.');
      process.exit(1);
    }
    console.log(`✅ Found ${banks.length} blood banks to host events.\n`);

    // Let's create some events spread across next couple of months
    const eventsToCreate = [
      {
        title: 'Mega Blood Drive 2026',
        description: 'Join us for our annual mega blood donation drive. Help us save lives and make a massive difference in the community. Refreshments and certificates will be provided to all successful donors!',
        location: 'Sector 17 Plaza, Chandigarh',
        coordinates: { type: 'Point', coordinates: [76.7794, 30.7333] },
        maxCapacity: 500,
        contactPhone: '+91-9876000001',
        contactEmail: 'events@megadrive.com',
        requirements: 'Must be 18-65 years old, weigh at least 50 kg, and be in good health. Bring a valid ID.',
        additionalInfo: 'T-shirts for early bird donors. Doctors on stand-by.',
        status: 'approved',
        image: dummyImages[0],
        daysOffsetStart: 5,
        daysOffsetEnd: 6
      },
      {
        title: 'Urgent Plasma Donation Camp',
        description: 'We are facing a severe shortage of blood plasma for critical patients. If you are eligible, please donate and save a life today.',
        location: 'Elante Mall Courtyard, Chandigarh',
        coordinates: { type: 'Point', coordinates: [76.8010, 30.7055] },
        maxCapacity: 150,
        contactPhone: '+91-9876000002',
        contactEmail: 'plasma@help.org',
        requirements: 'Must have fully recovered from recent illness if any. General donation eligibility applies.',
        additionalInfo: 'Walk-ins allowed, but pre-registration is preferred.',
        status: 'approved',
        image: dummyImages[1],
        daysOffsetStart: 2,
        daysOffsetEnd: 2
      },
      {
        title: 'Corporate Blood Donation Week',
        description: 'Partnering with top IT parks to encourage professionals to donate blood. Taking just 30 minutes out of your workday can save up to 3 lives.',
        location: 'Rajiv Gandhi IT Park, Chandigarh',
        coordinates: { type: 'Point', coordinates: [76.8431, 30.7266] },
        maxCapacity: 300,
        contactPhone: '+91-9876000003',
        contactEmail: 'corporate@bloodbank.org',
        requirements: 'Open to all IT park employees and general public.',
        additionalInfo: 'Mobile blood donation vans will be stationed throughout the week.',
        status: 'approved',
        image: dummyImages[2],
        daysOffsetStart: 10,
        daysOffsetEnd: 15
      },
      {
        title: 'University Youth Donation Drive',
        description: 'Calling all university youth! Step up, act responsibly, and donate blood. Your single donation is crucial for our emergency reserves.',
        location: 'Panjab University, Student Centre',
        coordinates: { type: 'Point', coordinates: [76.7681, 30.7610] },
        maxCapacity: 250,
        contactPhone: '+91-9876000004',
        contactEmail: 'youth@puchd.ac.in',
        requirements: 'Must be 18+ and carry student ID or any valid ID.',
        additionalInfo: 'Free health checkup and blood group testing included for all volunteers.',
        status: 'approved',
        image: dummyImages[3],
        daysOffsetStart: 20,
        daysOffsetEnd: 21
      },
      {
        title: 'Weekend Community Life-Saver Camp',
        description: 'A community-focused blood camp arranged for families to come together and pledge for a good cause. Every drop counts.',
        location: 'Sukhna Lake Promenade, Chandigarh',
        coordinates: { type: 'Point', coordinates: [76.8087, 30.7421] },
        maxCapacity: 400,
        contactPhone: '+91-9876000005',
        contactEmail: 'communityrun@sukhna.org',
        requirements: 'General donation guidelines apply. No alcohol consumption 48 hours prior.',
        additionalInfo: 'Live music and community gathering post-donation.',
        status: 'approved',
        image: dummyImages[4],
        daysOffsetStart: 30,
        daysOffsetEnd: 31
      }
    ];

    let createdEvents = 0;

    for (let i = 0; i < eventsToCreate.length; i++) {
      const data = eventsToCreate[i];
      // Pick a random bank as organizer
      const bank = banks[i % banks.length];

      // Calculate Dates based on offset from today
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + data.daysOffsetStart);
      startDate.setHours(9, 0, 0, 0);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.daysOffsetEnd);
      endDate.setHours(18, 0, 0, 0);

      try {
        const event = new EventModel({
          title: data.title,
          description: data.description,
          date: startDate,
          endDate: endDate,
          location: data.location,
          coordinates: data.coordinates,
          organizer: bank._id,
          organizerName: bank.name,
          maxCapacity: data.maxCapacity,
          registeredCount: Math.floor(Math.random() * (data.maxCapacity * 0.4)), // random starting registrations
          image: data.image,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          requirements: data.requirements,
          additionalInfo: data.additionalInfo,
          status: data.status
        });
        
        await event.save();
        createdEvents++;
        console.log(`✅ Created Event: ${event.title}`);
        console.log(`   📅 Date: ${startDate.toDateString()}`);
        console.log(`   🏢 Organizer: ${bank.name}`);
        console.log(`   🖼️  Image: Included`);
        console.log('');
      } catch (err) {
         console.error(`❌ Failed Event: ${data.title} — ${err.message}`);
      }
    }

    console.log('='.repeat(50));
    console.log(`\n🎉 Event Seeding complete! Successfully added ${createdEvents} events.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedEvents();
