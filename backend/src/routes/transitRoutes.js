const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const { writeAudit } = require('../services/audit');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT r.*,
                pa.name AS park_a_name, pa.address AS park_a_address,
                pb.name AS park_b_name, pb.address AS park_b_address,
                uha.full_name AS park_a_union_head,
                uhb.full_name AS park_b_union_head,
                rb.full_name AS registered_by_name,
                (SELECT COUNT(*)::int FROM vehicles v WHERE v.route_id = r.id) AS drivers_count
         FROM routes r
         LEFT JOIN parks pa ON pa.id = r.park_a_id
         LEFT JOIN parks pb ON pb.id = r.park_b_id
         LEFT JOIN users uha ON uha.id = pa.union_head_id
         LEFT JOIN users uhb ON uhb.id = pb.union_head_id
         LEFT JOIN users rb ON rb.id = r.registered_by
         ORDER BY r.created_at DESC`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list routes' });
  }
});

router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { name, area, parkAId, parkBId, tenantId, status } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || req.user.tenantId : req.user.tenantId;
    if (!effectiveTenantId) return res.status(400).json({ error: 'tenantId required' });

    const result = await req.db((client) =>
      client.query(
        `INSERT INTO routes (tenant_id, name, area, park_a_id, park_b_id, registered_by, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          effectiveTenantId,
          name,
          area || null,
          parkAId || null,
          parkBId || null,
          req.user.id,
          status || 'active',
        ]
      )
    );
    await writeAudit({
      tenantId: effectiveTenantId,
      userId: req.user.id,
      action: 'ROUTE_CREATE',
      resource: 'routes',
      details: { name },
      ip: req.ip,
      role: req.user.role,
    });
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create route' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const routeRes = await req.db((client) =>
      client.query(
        `SELECT r.*,
                pa.name AS park_a_name, pa.address AS park_a_address,
                pb.name AS park_b_name, pb.address AS park_b_address
         FROM routes r
         LEFT JOIN parks pa ON pa.id = r.park_a_id
         LEFT JOIN parks pb ON pb.id = r.park_b_id
         WHERE r.id = $1`,
        [req.params.id]
      )
    );
    if (!routeRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    const drivers = await req.db((client) =>
      client.query(
        `SELECT u.full_name, u.phone, v.plate_number
         FROM vehicles v
         JOIN users u ON u.id = v.assigned_driver_id
         WHERE v.route_id = $1`,
        [req.params.id]
      )
    );
    return res.json({ ...routeRes.rows[0], drivers: drivers.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load route' });
  }
});

module.exports = router;
