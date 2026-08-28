const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      await Admin.logLogin(null, email, ip, userAgent, false);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await Admin.validatePassword(password, admin.password_hash);
    if (!valid) {
      await Admin.logLogin(admin.id, email, ip, userAgent, false);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await Admin.createSession(admin.id, token, ip, userAgent);
    await Admin.updateLastLogin(admin.id);
    await Admin.logLogin(admin.id, email, ip, userAgent, true);

    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    await Admin.deleteSession(req.token);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const me = async (req, res) => {
  const a = req.admin;
  res.json({
    success: true,
    data: { id: a.id, name: a.name, email: a.email, role: a.role, lastLogin: a.last_login }
  });
};

const refresh = async (req, res) => {
  try {
    const oldToken = req.token;
    await Admin.deleteSession(oldToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = jwt.sign({ adminId: req.admin.id, role: req.admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    await Admin.createSession(req.admin.id, token, ip, userAgent);
    res.json({ success: true, data: { token, expiresAt } });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const loginLogs = async (req, res) => {
  try {
    const logs = await Admin.getLoginLogs(req.admin.id);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Login logs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login, logout, me, refresh, loginLogs };
