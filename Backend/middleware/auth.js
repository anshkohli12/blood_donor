const UserModel = require('../models/User');
const BloodBank = require('../models/BloodBank');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Decode the token to check its type
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.type === 'bloodbank') {
      // Blood bank token
      const bloodBank = await BloodBank.findById(decoded.id);
      if (!bloodBank) {
        throw new Error('Blood bank not found');
      }
      user = {
        id: bloodBank._id.toString(),
        type: 'bloodbank',
        name: bloodBank.name,
        email: bloodBank.email,
        ...decoded
      };
    } else {
      // Regular user token
      user = await UserModel.verifyToken(token);
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (idParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[idParam];
    const userId = req.user._id.toString();
    
    if (req.user.role === 'admin' || resourceId === userId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

// Middleware to authenticate blood bank specifically
const authenticateBloodBank = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a blood bank token
    if (decoded.type !== 'bloodbank') {
      return res.status(403).json({
        success: false,
        message: 'Blood bank access required'
      });
    }

    // Get blood bank details
    const bloodBank = await BloodBank.findById(decoded.id);
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }

    req.bloodBank = {
      _id: bloodBank._id,
      name: bloodBank.name,
      email: bloodBank.email,
      ...decoded
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  authenticateBloodBank
};