const mongoose = require('mongoose');
require('dotenv').config();

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

  async connect() {
    try {
      if (this.isConnected) {
        console.log('Already connected to MongoDB');
        return;
      }

      console.log('Connecting to MongoDB...');
      console.log('Database URL:', process.env.MONGODB_URI);

      // Configure Mongoose options
      const options = {
        bufferCommands: false, // Disable mongoose buffering
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        maxPoolSize: 10, // Maintain up to 10 socket connections
        heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      
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
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return mongoose.connection.db;
  }

  isConnectionReady() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();