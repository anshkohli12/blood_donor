const UserModel = require('../models/User');

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

    const user = await UserModel.verifyToken(token);
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

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin
};