const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/', async (req, res) => {
  try {
    const params = [];
    let sql = `SELECT a.*, v.plate_number, u.full_name AS driver_name
               FROM alerts a
               LEFT JOIN vehicles v ON v.id = a.vehicle_id
               LEFT JOIN users u ON u.id = a.driver_id
               WHERE 1=1`;
    if (req.query.unacknowledged === 'true') {
      sql += ' AND a.acknowledged = FALSE';
    }
    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND a.driver_id = $${params.length}`;
    }
    sql += ' ORDER BY a.created_at DESC LIMIT 200';
    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list alerts' });
  }
});

router.patch('/:id/ack', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `UPDATE alerts SET acknowledged = TRUE WHERE id = $1 RETURNING *`,
        [req.params.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Alert not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

module.exports = router;
