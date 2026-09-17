const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const { writeAudit } = require('../services/audit');

const router = express.Router();
router.use(authenticate, tenantContext);

// List tenants (system admin) or own tenant
router.get('/', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT t.*,
                (SELECT COUNT(*)::int FROM users u WHERE u.tenant_id = t.id) AS user_count,
                (SELECT COUNT(*)::int FROM vehicles v WHERE v.tenant_id = t.id) AS vehicle_count
         FROM tenants t
         ORDER BY t.created_at DESC`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list tenants' });
  }
});

// Provision tenant (FR-01)
router.post('/', requireRoles('SYSTEM_ADMIN'), async (req, res) => {
  try {
    const { name, slug, adminEmail, adminName, adminPassword } = req.body || {};
    if (!name || !slug || !adminEmail || !adminPassword) {
      return res.status(400).json({
        error: 'name, slug, adminEmail, and adminPassword are required',
      });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const created = await req.db(async (client) => {
      const t = await client.query(
        `INSERT INTO tenants (name, slug, status)
         VALUES ($1, $2, 'active')
         RETURNING *`,
        [name, slug.toLowerCase().replace(/\s+/g, '-')]
      );
      const tenant = t.rows[0];
      await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role, status)
         VALUES ($1, $2, $3, $4, 'TENANT_ADMIN', 'active')`,
        [tenant.id, adminEmail, passwordHash, adminName || `${name} Admin`]
      );
      return tenant;
    });

    await writeAudit({
      tenantId: created.id,
      userId: req.user.id,
      action: 'TENANT_CREATE',
      resource: 'tenants',
      details: { name, slug: created.slug },
      ip: req.ip,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Tenant slug or admin email already exists' });
    }
    return res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Deactivate tenant (FR-10)
router.patch('/:id/status', requireRoles('SYSTEM_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await req.db((client) =>
      client.query(
        `UPDATE tenants SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, req.params.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Tenant not found' });

    await writeAudit({
      tenantId: req.params.id,
      userId: req.user.id,
      action: 'TENANT_STATUS',
      resource: 'tenants',
      details: { status },
      ip: req.ip,
    });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update tenant' });
  }
});

module.exports = router;
