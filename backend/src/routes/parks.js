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
        `SELECT p.*,
                uh.full_name AS union_head_name,
                rb.full_name AS registered_by_name,
                (SELECT COUNT(*)::int FROM vehicles v WHERE v.park_id = p.id) AS drivers_count
         FROM parks p
         LEFT JOIN users uh ON uh.id = p.union_head_id
         LEFT JOIN users rb ON rb.id = p.registered_by
         ORDER BY p.created_at DESC`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list parks' });
  }
});

router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { name, area, address, unionHeadId, tenantId, status } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || req.user.tenantId : req.user.tenantId;
    if (!effectiveTenantId) return res.status(400).json({ error: 'tenantId required' });

    const result = await req.db((client) =>
      client.query(
        `INSERT INTO parks (tenant_id, name, area, address, union_head_id, registered_by, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          effectiveTenantId,
          name,
          area || null,
          address || null,
          unionHeadId || null,
          req.user.id,
          status || 'active',
        ]
      )
    );
    await writeAudit({
      tenantId: effectiveTenantId,
      userId: req.user.id,
      action: 'PARK_CREATE',
      resource: 'parks',
      details: { name },
      ip: req.ip,
      role: req.user.role,
    });
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'Park name already exists' });
    return res.status(500).json({ error: 'Failed to create park' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT p.*, uh.full_name AS union_head_name
         FROM parks p
         LEFT JOIN users uh ON uh.id = p.union_head_id
         WHERE p.id = $1`,
        [req.params.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });

    const drivers = await req.db((client) =>
      client.query(
        `SELECT u.id, u.full_name, u.phone, v.plate_number
         FROM vehicles v
         JOIN users u ON u.id = v.assigned_driver_id
         WHERE v.park_id = $1`,
        [req.params.id]
      )
    );
    return res.json({ ...result.rows[0], drivers: drivers.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load park' });
  }
});

module.exports = router;
