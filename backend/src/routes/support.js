const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT t.*,
                u.full_name AS requester_name, u.email AS requester_email,
                (SELECT COUNT(*)::int FROM support_replies r WHERE r.ticket_id = t.id) AS reply_count
         FROM support_tickets t
         LEFT JOIN users u ON u.id = t.requester_id
         ORDER BY t.created_at DESC
         LIMIT 200`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list tickets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await req.db((client) =>
      client.query(
        `SELECT t.*, u.full_name AS requester_name
         FROM support_tickets t
         LEFT JOIN users u ON u.id = t.requester_id
         WHERE t.id = $1`,
        [req.params.id]
      )
    );
    if (!ticket.rows[0]) return res.status(404).json({ error: 'Not found' });
    const replies = await req.db((client) =>
      client.query(
        `SELECT r.*, a.full_name AS author_name
         FROM support_replies r
         LEFT JOIN users a ON a.id = r.author_id
         WHERE r.ticket_id = $1
         ORDER BY r.created_at ASC`,
        [req.params.id]
      )
    );
    return res.json({ ...ticket.rows[0], replies: replies.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load ticket' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { subject, message, tenantId } = req.body || {};
    if (!subject || !message) {
      return res.status(400).json({ error: 'subject and message required' });
    }
    const effectiveTenantId =
      req.user.role === 'SYSTEM_ADMIN' ? tenantId || null : req.user.tenantId;
    const result = await req.db((client) =>
      client.query(
        `INSERT INTO support_tickets (tenant_id, requester_id, subject, message, status)
         VALUES ($1,$2,$3,$4,'pending')
         RETURNING *`,
        [effectiveTenantId, req.user.id, subject, message]
      )
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.post('/:id/replies', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    const reply = await req.db(async (client) => {
      const r = await client.query(
        `INSERT INTO support_replies (ticket_id, author_id, message)
         VALUES ($1,$2,$3) RETURNING *`,
        [req.params.id, req.user.id, message]
      );
      await client.query(
        `UPDATE support_tickets SET status = 'resolved', updated_at = NOW() WHERE id = $1`,
        [req.params.id]
      );
      return r.rows[0];
    });
    return res.status(201).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to reply' });
  }
});

module.exports = router;
