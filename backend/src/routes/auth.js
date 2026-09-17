const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withTenantContext } = require('../db/pool');
const { writeAudit } = require('../services/audit');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Credential lookup uses elevated session context (FORCE RLS is enabled)
    const result = await withTenantContext({ role: 'SYSTEM_ADMIN', tenantId: null }, (client) =>
      client.query(
        `SELECT u.*, t.name AS tenant_name, t.status AS tenant_status
         FROM users u
         LEFT JOIN tenants t ON t.id = u.tenant_id
         WHERE LOWER(u.email) = LOWER($1)`,
        [email]
      )
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }
    if (user.tenant_id && user.tenant_status && user.tenant_status !== 'active') {
      return res.status(401).json({ error: 'Tenant organization is inactive' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await writeAudit({
      tenantId: user.tenant_id,
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      details: { email: user.email, role: user.role },
      ip: req.ip,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await withTenantContext(
      { tenantId: req.user.tenantId, role: req.user.role },
      (client) =>
        client.query(
          `SELECT u.id, u.email, u.full_name, u.role, u.tenant_id, u.phone, u.status,
                  t.name AS tenant_name
           FROM users u
           LEFT JOIN tenants t ON t.id = u.tenant_id
           WHERE u.id = $1`,
          [req.user.id]
        )
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      tenantId: row.tenant_id,
      tenantName: row.tenant_name,
      phone: row.phone,
      status: row.status,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

module.exports = router;
