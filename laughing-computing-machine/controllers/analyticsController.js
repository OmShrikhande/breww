const Analytics = require('../models/Analytics');

const revenue = async (req, res) => {
  try {
    const data = await Analytics.revenue(req.query.period || '7d');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics revenue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const bets = async (req, res) => {
  try {
    const data = await Analytics.bets(req.query.period || '7d');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics bets error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sessions = async (req, res) => {
  try {
    const data = await Analytics.sessions(req.query.period || '7d');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics sessions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const gameShare = async (req, res) => {
  try {
    const data = await Analytics.gameShare();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics game share error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const peakHours = async (req, res) => {
  try {
    const data = await Analytics.peakHours();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics peak hours error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const heatmap = async (req, res) => {
  try {
    const data = await Analytics.heatmap();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics heatmap error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const winLoss = async (req, res) => {
  try {
    const data = await Analytics.winLoss();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics win/loss error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const quickMetrics = async (req, res) => {
  try {
    const data = await Analytics.quickMetrics();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics quick metrics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { format = 'csv', period = '7d', type = 'revenue' } = req.body;
    if (!['csv','pdf'].includes(format)) return res.status(400).json({ success: false, message: 'Invalid format. Use: csv, pdf' });
    if (!['revenue','bets','users'].includes(type)) return res.status(400).json({ success: false, message: 'Invalid type. Use: revenue, bets, users' });

    const result = await Analytics.export(format, period, type);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { revenue, bets, sessions, gameShare, peakHours, heatmap, winLoss, quickMetrics, exportReport };
