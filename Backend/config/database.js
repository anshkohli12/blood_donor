const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
      process.exit(0);
    });
  }

  async connect(uri) {
    try {
      const connectionUri = uri || process.env.MONGODB_URI;
      
      // Use mongoose.connection.readyState to accurately check connection status
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB (readyState: 1)');
        this.isConnected = true;
        return mongoose.connection;
      }

      if (mongoose.connection.readyState === 2) {
        console.log('Currently connecting...');
        return mongoose.connection;
      }

      console.log('Connecting to MongoDB...');
      console.log('Database URL:', connectionUri ? 'Set' : 'Undefined');

      // Configure Mongoose options for serverless
      const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        bufferCommands: false, // Prevents Mongoose from indefinitely holding queries if DB connection drops
      };

      await mongoose.connect(connectionUri, options);
      
      this.isConnected = true;
      console.log('✅ Successfully connected to MongoDB with Mongoose!');
      
      // Test the connection
      await mongoose.connection.db.admin().ping();
      console.log('✅ Database ping successful!');
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (!this.isConnected) {
        return;
      }
      
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  getDatabase() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    return mongoose.connection.db;
  }

  isConnectionReady() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();