const ApiError = require('../utils/api-error');

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
}

const requireAdmin = requireRole('admin');
const requireAny = (_req, _res, next) => next();

module.exports = {
  requireRole,
  requireAdmin,
  requireAny,
};
