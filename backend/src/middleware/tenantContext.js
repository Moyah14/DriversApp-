const { withTenantContext } = require('../db/pool');

/**
 * Attach a helper that runs DB work under the caller's RLS session context.
 */
function tenantContext(req, res, next) {
  req.db = (fn) =>
    withTenantContext(
      {
        tenantId: req.user?.tenantId || null,
        role: req.user?.role || '',
      },
      fn
    );
  next();
}

module.exports = { tenantContext };
