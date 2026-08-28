const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

const requireSuperAdmin = requireRole('superadmin');
const requireAdminOrAbove = requireRole('superadmin', 'admin');
const requireViewerOrAbove = requireRole('superadmin', 'admin', 'viewer');

const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  req.query.page = page;
  req.query.limit = limit;
  next();
};

const validatePeriod = (req, res, next) => {
  const { period } = req.query;
  if (period && !['7d', '30d'].includes(period)) {
    return res.status(400).json({ success: false, message: 'Invalid period. Use: 7d or 30d' });
  }
  next();
};

const validateId = (param = 'id') => (req, res, next) => {
  const val = req.params[param];
  if (!val || val.length > 100) {
    return res.status(400).json({ success: false, message: `Invalid ${param}` });
  }
  next();
};

module.exports = { requireRole, requireSuperAdmin, requireAdminOrAbove, requireViewerOrAbove, validatePagination, validatePeriod, validateId };
