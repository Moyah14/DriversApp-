const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();
router.use(authenticate, tenantContext, requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'));

router.get('/', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT a.*, u.email AS actor_email, u.full_name AS actor_name
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC
         LIMIT 500`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
