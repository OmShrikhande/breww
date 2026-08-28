const Notification = require('../models/Notification');

const getAll = async (req, res) => {
  try {
    const data = await Notification.findAll();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const unreadCount = async (req, res) => {
  try {
    const count = await Notification.unreadCount();
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const markRead = async (req, res) => {
  try {
    const result = await Notification.markRead(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    const updated = await Notification.markAllRead();
    res.json({ success: true, data: { updated } });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendTest = async (req, res) => {
  try {
    const { channel } = req.body;
    if (!['email','sms'].includes(channel)) {
      return res.status(400).json({ success: false, message: 'Invalid channel. Use: email, sms' });
    }
    await Notification.create('system', `Test ${channel} notification`, `This is a test ${channel} notification sent from admin panel`);
    res.json({ success: true, data: { sent: true, channel } });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAll, unreadCount, markRead, markAllRead, sendTest };
