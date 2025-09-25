const express = require('express');
const UserModel = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

console.log('Auth routes file loaded successfully!');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    
    // Basic validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'password', 
      'bloodType', 'dateOfBirth', 'city', 'state'
    ];
    
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (userData.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(userData.bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood type'
      });
    }

    // Create user (default role is 'user')
    const newUser = await UserModel.createUser({
      ...userData,
      role: 'user' // Force user role for public registration
    });

    // Generate JWT token for immediate login
    const loginResult = await UserModel.loginUser(userData.email, userData.password);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: loginResult.user,
      token: loginResult.token
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await UserModel.loginUser(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  console.log('Profile update route hit!', req.body);
  console.log('User from token:', req.user);
  try {
    const userId = req.user._id; // Changed from req.user.userId to req.user._id
    const updateData = req.body;
    
    console.log('Updating user with ID:', userId);
    
    // Basic validation for required fields
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bloodType', 
      'dateOfBirth', 'city', 'state'
    ];
    
    // Filter out any fields that aren't allowed to be updated
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });
    
    // Validate blood type if provided
    if (filteredData.bloodType) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodTypes.includes(filteredData.bloodType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid blood type'
        });
      }
    }
    
    // Validate phone format if provided
    if (filteredData.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(filteredData.phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
    }
    
    // Update user profile
    const result = await UserModel.updateUser(userId, filteredData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes were made to the profile'
      });
    }
    
    // Get updated user data
    const updatedUser = await UserModel.getUserById(userId);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (role) {
      filters.role = role;
    }
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { createdAt: -1 }
    };
    
    const users = await UserModel.getAllUsers(filters, options);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/create-admin - Create admin user (protected route)
router.post('/create-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminData = req.body;
    
    const admin = await UserModel.createUser({
      ...adminData,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: admin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Initialize admin user (for development)
router.post('/init-admin', async (req, res) => {
  try {
    const admin = await UserModel.createAdminUser();
    
    res.json({
      success: true,
      message: 'Admin user initialized',
      data: admin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;