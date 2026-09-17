const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const { writeAudit } = require('../services/audit');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT v.*, u.full_name AS driver_name, u.email AS driver_email,
             ds.score AS driver_score
      FROM vehicles v
      LEFT JOIN users u ON u.id = v.assigned_driver_id
      LEFT JOIN LATERAL (
        SELECT score FROM driver_scores
        WHERE driver_id = v.assigned_driver_id
        ORDER BY updated_at DESC LIMIT 1
      ) ds ON true
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND v.assigned_driver_id = $${params.length}`;
    }

    sql += ' ORDER BY v.created_at DESC';
    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list vehicles' });
  }
});

router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const { plateNumber, make, model, vehicleType, status, assignedDriverId, tenantId } =
      req.body || {};
    if (!plateNumber) return res.status(400).json({ error: 'plateNumber required' });

    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || req.user.tenantId : req.user.tenantId;
    if (!effectiveTenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    const result = await req.db((client) =>
      client.query(
        `INSERT INTO vehicles
           (tenant_id, plate_number, make, model, vehicle_type, status, assigned_driver_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          effectiveTenantId,
          plateNumber,
          make || null,
          model || null,
          vehicleType || 'bus',
          status || 'active',
          assignedDriverId || null,
        ]
      )
    );

    await writeAudit({
      tenantId: effectiveTenantId,
      userId: req.user.id,
      action: 'VEHICLE_CREATE',
      resource: 'vehicles',
      details: { plateNumber },
      ip: req.ip,
    });

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Plate number already registered for tenant' });
    }
    return res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.patch('/:id', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const { status, assignedDriverId, make, model } = req.body || {};
    const result = await req.db((client) =>
      client.query(
        `UPDATE vehicles SET
           status = COALESCE($1, status),
           assigned_driver_id = COALESCE($2, assigned_driver_id),
           make = COALESCE($3, make),
           model = COALESCE($4, model),
           updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [status || null, assignedDriverId || null, make || null, model || null, req.params.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Vehicle not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

module.exports = router;
