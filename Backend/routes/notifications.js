const express = require('express');
const NotificationModel = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await NotificationModel.getUserNotifications(req.user._id, {
      limit: parseInt(limit),
      skip
    });

    res.json({
      success: true,
      data: notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await NotificationModel.getUnreadCount(req.user._id);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await NotificationModel.markAsRead(req.params.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await NotificationModel.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
