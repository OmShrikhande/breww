const Game = require('../models/Game');

const getGames = async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json({ success: true, data: games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, data: game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    const settings = await Game.updateSettings(req.params.id, req.body);
    res.json({ success: true, data: { settings } });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active','inactive','maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use: active, inactive, maintenance' });
    }
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    const result = await Game.updateStatus(req.params.id, status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const bulkStatus = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['enable','disable','maintenance'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Use: enable, disable, maintenance' });
    }
    const result = await Game.bulkStatus(action);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Bulk status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getGames, getGameById, updateSettings, updateStatus, bulkStatus };
