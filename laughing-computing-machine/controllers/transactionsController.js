const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const result = await Transaction.findAll({ type, status, page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await Transaction.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPending = async (req, res) => {
  try {
    const pending = await Transaction.getPending();
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const approve = async (req, res) => {
  try {
    const result = await Transaction.approve(req.params.id, req.admin.id);
    if (!result) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const reject = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });
    const result = await Transaction.reject(req.params.id, req.admin.id, reason);
    if (!result) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getTransactions, getStats, getPending, approve, reject };
