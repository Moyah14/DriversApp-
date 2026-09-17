const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const { writeAudit } = require('../services/audit');

const router = express.Router();
router.use(authenticate, tenantContext);

function formatMoney(n) {
  return Number(n || 0);
}

router.get('/', async (req, res) => {
  try {
    const { status, type, userId } = req.query;
    const params = [];
    let sql = `
      SELECT p.*,
             u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone,
             v.plate_number
      FROM payments p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN vehicles v ON v.id = p.vehicle_id
      WHERE 1=1`;
    if (status) {
      params.push(String(status).toLowerCase());
      sql += ` AND p.status = $${params.length}`;
    }
    if (type) {
      params.push(String(type).toLowerCase());
      sql += ` AND p.payment_type = $${params.length}`;
    }
    if (userId) {
      params.push(userId);
      sql += ` AND p.user_id = $${params.length}`;
    }
    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND p.user_id = $${params.length}`;
    }
    sql += ' ORDER BY p.created_at DESC LIMIT 500';
    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list payments' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT
           COUNT(*)::int AS total_count,
           COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0)::float AS total_success_amount,
           COUNT(*) FILTER (WHERE status = 'success')::int AS success_count,
           COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_count,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
           COUNT(*) FILTER (WHERE payment_type = 'card')::int AS card_count,
           COUNT(*) FILTER (WHERE payment_type = 'deposit')::int AS deposit_count,
           COUNT(*) FILTER (WHERE payment_type = 'topup')::int AS topup_count
         FROM payments`
      )
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load payment summary' });
  }
});

router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { userId, vehicleId, amount, paymentType, status, description, tenantId } =
      req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || req.user.tenantId : req.user.tenantId;
    if (!effectiveTenantId) return res.status(400).json({ error: 'tenantId required' });

    const result = await req.db(async (client) => {
      const pay = await client.query(
        `INSERT INTO payments
           (tenant_id, user_id, vehicle_id, amount, payment_type, status, description, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          effectiveTenantId,
          userId || null,
          vehicleId || null,
          formatMoney(amount),
          (paymentType || 'card').toLowerCase(),
          (status || 'success').toLowerCase(),
          description || null,
          req.user.id,
        ]
      );

      if (userId && (status || 'success').toLowerCase() === 'success') {
        const delta =
          (paymentType || 'card').toLowerCase() === 'topup' ||
          (paymentType || '').toLowerCase() === 'deposit'
            ? formatMoney(amount)
            : 0;
        if (delta > 0) {
          await client.query(
            `INSERT INTO wallets (tenant_id, user_id, balance)
             VALUES ($1, $2, $3)
             ON CONFLICT (tenant_id, user_id)
             DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = NOW()`,
            [effectiveTenantId, userId, delta]
          );
        }
      }
      return pay.rows[0];
    });

    await writeAudit({
      tenantId: effectiveTenantId,
      userId: req.user.id,
      action: 'PAYMENT_CREATE',
      resource: 'payments',
      details: { amount, paymentType, userId },
      ip: req.ip,
      role: req.user.role,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

/** Lookup driver/vehicle by plate or user id for authorize/top-up flows */
router.post('/lookup', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { plateNumber, query: q } = req.body || {};
    const term = (plateNumber || q || '').trim();
    if (!term) return res.status(400).json({ error: 'plateNumber or query required' });

    const result = await req.db((client) =>
      client.query(
        `SELECT v.id AS vehicle_id, v.plate_number, v.vehicle_type,
                u.id AS user_id, u.full_name, u.email, u.phone,
                COALESCE(w.balance, 0)::float AS card_balance
         FROM vehicles v
         LEFT JOIN users u ON u.id = v.assigned_driver_id
         LEFT JOIN wallets w ON w.user_id = u.id AND w.tenant_id = v.tenant_id
         WHERE UPPER(v.plate_number) = UPPER($1)
            OR u.phone = $1
            OR LOWER(u.email) = LOWER($1)
         LIMIT 1`,
        [term]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Driver/vehicle not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lookup failed' });
  }
});

/** Top-up driver wallet after authorize */
router.post('/topup', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { userId, vehicleId, amount, tenantId } = req.body || {};
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'userId and valid amount required' });
    }
    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || req.user.tenantId : req.user.tenantId;
    if (!effectiveTenantId) return res.status(400).json({ error: 'tenantId required' });

    const payment = await req.db(async (client) => {
      await client.query(
        `INSERT INTO wallets (tenant_id, user_id, balance)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_id, user_id)
         DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = NOW()`,
        [effectiveTenantId, userId, formatMoney(amount)]
      );
      const pay = await client.query(
        `INSERT INTO payments
           (tenant_id, user_id, vehicle_id, amount, payment_type, status, description, created_by)
         VALUES ($1,$2,$3,$4,'topup','success',$5,$6)
         RETURNING *`,
        [
          effectiveTenantId,
          userId,
          vehicleId || null,
          formatMoney(amount),
          `Card top-up of ${amount}`,
          req.user.id,
        ]
      );
      return pay.rows[0];
    });

    return res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Top-up failed' });
  }
});

module.exports = router;
