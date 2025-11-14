const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConnection = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blood Donor Backend API is running!',
    status: 'success'
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const db = dbConnection.getDatabase();
    await db.admin().ping();
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes will be added here
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const contactRoutes = require('./routes/contact');
const bloodBankRoutes = require('./routes/bloodBanks');
const eventRoutes = require('./routes/events');
const requestRoutes = require('./routes/requests');

console.log('=== MOUNTING ROUTES ===');
console.log('Auth routes type:', typeof authRoutes);
console.log('Donor routes type:', typeof donorRoutes);
console.log('Contact routes type:', typeof contactRoutes);

// Debug middleware to log all requests BEFORE routes
app.use((req, res, next) => {
  console.log(`=== REQUEST DEBUG ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Path: ${req.path}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`===================`);
  next();
});

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

app.use('/api/blood-banks', bloodBankRoutes);
console.log('✅ Blood bank routes mounted at /api/blood-banks');

app.use('/api/donors', donorRoutes);
console.log('✅ Donor routes mounted at /api/donors');

app.use('/api/contact', contactRoutes);
console.log('✅ Contact routes mounted at /api/contact');

app.use('/api/events', eventRoutes);
console.log('✅ Event routes mounted at /api/events');

app.use('/api/requests', requestRoutes);
console.log('✅ Request routes mounted at /api/requests');

// Debug middleware to log all requests - moved after routes

// Example: app.use('/api/requests', requestRoutes);
// Example: app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start server and connect to database
async function startServer() {
  try {
    // Connect to MongoDB first
    await dbConnection.connect();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  await dbConnection.disconnect();
  process.exit(0);
});

startServer();

module.exports = app;