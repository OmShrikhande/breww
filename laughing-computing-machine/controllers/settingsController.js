const Settings = require('../models/Settings');

const getAll = async (req, res) => {
  try {
    const data = await Settings.getAll();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateGroup = (group) => async (req, res) => {
  try {
    const data = await Settings.upsertGroup(group, req.body, req.admin.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Update ${group} settings error:`, error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getApiKey = async (req, res) => {
  try {
    const data = await Settings.getApiKey();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const rotateApiKey = async (req, res) => {
  try {
    const data = await Settings.rotateApiKey(req.admin.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Rotate API key error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const testWebhook = async (req, res) => {
  try {
    const data = await Settings.testWebhook();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAll, updateGroup, getApiKey, rotateApiKey, testWebhook };
