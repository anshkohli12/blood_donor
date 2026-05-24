const dbConnection = require('../config/database');
const { ObjectId } = require('mongodb');

class NotificationModel {
  constructor() {
    this.collectionName = 'notifications';
  }

  getCollection() {
    const db = dbConnection.getDatabase();
    return db.collection(this.collectionName);
  }

  // Create a new notification
  async createNotification({ userId, title, message, type, requestId = null }) {
    try {
      const collection = this.getCollection();

      const notification = {
        userId: userId.toString(),
        title,
        message,
        type, // 'request_pending', 'request_approved', 'request_rejected', 'request_scheduled', 'request_completed'
        requestId: requestId || null,
        read: false,
        createdAt: new Date()
      };

      const result = await collection.insertOne(notification);
      return { _id: result.insertedId, ...notification };
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Get notifications for a user (paginated, newest first)
  async getUserNotifications(userId, { limit = 20, skip = 0 } = {}) {
    try {
      const collection = this.getCollection();
      const userIdStr = userId.toString();

      const notifications = await collection
        .find({ userId: userIdStr })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return notifications;
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments({
        userId: userId.toString(),
        read: false
      });
      return count;
    } catch (error) {
      throw new Error(`Error counting notifications: ${error.message}`);
    }
  }

  // Mark a single notification as read
  async markAsRead(notificationId) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } }
      );
      return result;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications for a user as read
  async markAllAsRead(userId) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateMany(
        { userId: userId.toString(), read: false },
        { $set: { read: true } }
      );
      return result;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }
}

module.exports = new NotificationModel();
