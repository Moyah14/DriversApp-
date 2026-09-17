const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const { writeAudit } = require('../services/audit');

const router = express.Router();
router.use(authenticate, tenantContext);

const CREATABLE = ['TENANT_ADMIN', 'DRIVER', 'AGENT', 'UNION_HEAD'];

router.get('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT', 'UNION_HEAD'), async (req, res) => {
  try {
    const { role } = req.query;
    const params = [];
    let sql = `
      SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, u.phone, u.nin, u.address,
             u.license_ref, u.status, u.created_at,
             COALESCE(w.balance, 0)::float AS card_balance,
             v.plate_number, v.vehicle_type, v.id AS vehicle_id,
             p.name AS park_name, r.name AS route_name
      FROM users u
      LEFT JOIN wallets w ON w.user_id = u.id AND (w.tenant_id = u.tenant_id OR u.tenant_id IS NULL)
      LEFT JOIN vehicles v ON v.assigned_driver_id = u.id
      LEFT JOIN parks p ON p.id = v.park_id
      LEFT JOIN routes r ON r.id = v.route_id
      WHERE 1=1`;
    if (role) {
      params.push(role);
      sql += ` AND u.role = $${params.length}`;
    }
    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND u.id = $${params.length}`;
    }
    sql += ' ORDER BY u.created_at DESC';
    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role,
      phone,
      nin,
      address,
      licenseRef,
      tenantId,
      plateNumber,
      vehicleType,
      make,
      model,
      parkId,
      routeId,
    } = req.body || {};

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'email, password, fullName, role required' });
    }
    if (!CREATABLE.includes(role) && role !== 'SYSTEM_ADMIN') {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (role === 'SYSTEM_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || null : req.user.tenantId;
    if (role !== 'SYSTEM_ADMIN' && !effectiveTenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await req.db(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users
           (tenant_id, email, password_hash, full_name, role, phone, nin, address, license_ref, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
         RETURNING id, tenant_id, email, full_name, role, phone, nin, address, license_ref, status, created_at`,
        [
          effectiveTenantId,
          email,
          passwordHash,
          fullName,
          role,
          phone || null,
          nin || null,
          address || null,
          licenseRef || null,
        ]
      );
      const user = userRes.rows[0];

      if (effectiveTenantId) {
        await client.query(
          `INSERT INTO wallets (tenant_id, user_id, balance)
           VALUES ($1, $2, 0)
           ON CONFLICT DO NOTHING`,
          [effectiveTenantId, user.id]
        );
      }

      if (role === 'DRIVER' && plateNumber && effectiveTenantId) {
        await client.query(
          `INSERT INTO vehicles
             (tenant_id, plate_number, make, model, vehicle_type, status, assigned_driver_id, park_id, route_id)
           VALUES ($1,$2,$3,$4,$5,'active',$6,$7,$8)
           ON CONFLICT (tenant_id, plate_number) DO UPDATE
             SET assigned_driver_id = EXCLUDED.assigned_driver_id,
                 park_id = COALESCE(EXCLUDED.park_id, vehicles.park_id),
                 route_id = COALESCE(EXCLUDED.route_id, vehicles.route_id)`,
          [
            effectiveTenantId,
            plateNumber,
            make || null,
            model || null,
            vehicleType || 'bus',
            user.id,
            parkId || null,
            routeId || null,
          ]
        );
      }

      return user;
    });

    await writeAudit({
      tenantId: effectiveTenantId,
      userId: req.user.id,
      action: 'USER_CREATE',
      resource: 'users',
      details: { email, role },
      ip: req.ip,
      role: req.user.role,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'Email or plate already exists' });
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id/status', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await req.db((client) =>
      client.query(
        `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2
         RETURNING id, email, full_name, role, status`,
        [status, req.params.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword required' });
    }
    const updated = await req.db(async (client) => {
      const row = await client.query(`SELECT id, password_hash FROM users WHERE id = $1`, [
        req.user.id,
      ]);
      if (!row.rows[0]) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }
      const ok = await bcrypt.compare(currentPassword, row.rows[0].password_hash);
      if (!ok) {
        const err = new Error('Current password is incorrect');
        err.status = 400;
        throw err;
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await client.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
        hash,
        req.user.id,
      ]);
      return true;
    });
    return res.json({ ok: updated });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Password change failed' });
  }
});

module.exports = router;
