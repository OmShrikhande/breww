const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const { search, status, vip, page = 1, limit = 20, sortBy, sortDir } = req.query;
    const result = await User.findAll({ search, status, vip, page, limit, sortBy, sortDir });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const stats = await User.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { action } = req.body;
    const statusMap = { ban: 'banned', suspend: 'suspended', activate: 'active' };
    const status = statusMap[action];
    if (!status) return res.status(400).json({ success: false, message: 'Invalid action. Use: ban, suspend, activate' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await User.updateStatus(req.params.id, status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { action, amount } = req.body;
    if (!['reset', 'add', 'subtract'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use: reset, add, subtract' });
    }
    if ((action === 'add' || action === 'subtract') && (!amount || isNaN(amount))) {
      return res.status(400).json({ success: false, message: 'Amount is required for add/subtract' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await User.adjustBalance(req.params.id, action, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Adjust balance error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserBets = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const bets = await User.getBets(req.params.id);
    res.json({ success: true, data: bets });
  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const txs = await User.getTransactions(req.params.id);
    res.json({ success: true, data: txs });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Note text is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const note = await User.addNote(req.params.id, req.admin.id, text);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const notes = await User.getNotes(req.params.id);
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getUsers, getUserStats, getUserById, updateUserStatus, adjustBalance, getUserBets, getUserTransactions, addNote, getNotes };
