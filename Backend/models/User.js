const dbConnection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserModel {
  constructor() {
    this.collectionName = 'users';
  }

  getCollection() {
    const db = dbConnection.getDatabase();
    return db.collection(this.collectionName);
  }

  // Create a new user
  async createUser(userData) {
    try {
      const collection = this.getCollection();
      
      // Check if user already exists
      const existingUser = await collection.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user data
      const newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        phone: userData.phone,
        password: hashedPassword,
        bloodType: userData.bloodType,
        dateOfBirth: new Date(userData.dateOfBirth),
        city: userData.city,
        state: userData.state,
        role: userData.role || 'user', // 'user' or 'admin'
        isActive: true,
        isEmailVerified: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newUser);
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return {
        _id: result.insertedId,
        ...userWithoutPassword
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      const collection = this.getCollection();
      
      // Find user by email
      const user = await collection.findOne({ 
        email: email.toLowerCase(),
        isActive: true
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await collection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Return user without password
      const { password: userPassword, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const { ObjectId } = require('mongodb');
      const collection = this.getCollection();
      
      const user = await collection.findOne(
        { _id: new ObjectId(id), isActive: true },
        { projection: { password: 0 } } // Exclude password
      );
      
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const collection = this.getCollection();
      
      const user = await collection.findOne(
        { email: email.toLowerCase(), isActive: true },
        { projection: { password: 0 } } // Exclude password
      );
      
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, updateData) {
    try {
      const { ObjectId } = require('mongodb');
      const collection = this.getCollection();

      // Remove sensitive fields that shouldn't be updated directly
      const { password, email, role, ...safeUpdateData } = updateData;

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...safeUpdateData,
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Get all users (admin only)
  async getAllUsers(filters = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
      
      const users = await collection
        .find(filters, { projection: { password: 0 } })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return users;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.getUserById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Create admin user (for initialization)
  async createAdminUser() {
    try {
      const collection = this.getCollection();
      
      // Check if admin already exists
      const existingAdmin = await collection.findOne({ role: 'admin' });
      if (existingAdmin) {
        return existingAdmin;
      }

      // Create admin user
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL,
        phone: '+1234567890',
        password: process.env.ADMIN_PASSWORD,
        bloodType: 'O+',
        dateOfBirth: new Date('1990-01-01'),
        city: 'Admin City',
        state: 'Admin State',
        role: 'admin'
      };

      const admin = await this.createUser(adminData);
      console.log('Admin user created successfully');
      return admin;
    } catch (error) {
      console.error('Error creating admin user:', error.message);
      throw error;
    }
  }
}

module.exports = new UserModel();