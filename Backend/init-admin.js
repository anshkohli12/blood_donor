require('dotenv').config();
const dbConnection = require('./config/database');
const UserModel = require('./models/User');

async function initAdmin() {
  try {
    await dbConnection.connect();
    console.log('Creating admin user...');
    
    const admin = await UserModel.createAdminUser();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

initAdmin();