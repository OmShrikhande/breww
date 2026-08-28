const Round = require('../models/Round');

const getCurrent = async (req, res) => {
  try {
    const round = await Round.getCurrent(req.params.id);
    if (!round) return res.status(404).json({ success: false, message: 'No active round found' });
    res.json({ success: true, data: round });
  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getBetDistribution = async (req, res) => {
  try {
    const dist = await Round.getBetDistribution(req.params.id);
    if (!dist) return res.status(404).json({ success: false, message: 'No active round found' });
    res.json({ success: true, data: dist });
  } catch (error) {
    console.error('Get bet distribution error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUpcoming = async (req, res) => {
  try {
    const data = await Round.getUpcoming(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'No active round found' });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get upcoming round error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const declare = async (req, res) => {
  try {
    const { result, roundId } = req.body;
    if (!result) return res.status(400).json({ success: false, message: 'Result is required' });
    const gameId = req.params.id;
    const data = await Round.declare(gameId, result, roundId, true);
    if (gameId !== 'aviator' || !data?.flying) {
      await Round.startNew(gameId);
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Declare round error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await Round.getHistory(req.params.id, parseInt(page), parseInt(limit));
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get round history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getRoundDetail = async (req, res) => {
  try {
    const round = await Round.getRoundDetail(req.params.id, req.params.roundId);
    if (!round) return res.status(404).json({ success: false, message: 'Round not found' });
    res.json({ success: true, data: round });
  } catch (error) {
    console.error('Get round detail error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const startNew = async (req, res) => {
  try {
    const round = await Round.startNew(req.params.id);
    res.status(201).json({ success: true, data: round });
  } catch (error) {
    console.error('Start new round error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCurrent, getBetDistribution, getUpcoming, declare, getHistory, getRoundDetail, startNew };
