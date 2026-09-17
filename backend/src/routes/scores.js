const express = require('express');
const { authenticate } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/', async (req, res) => {
  try {
    const params = [];
    let sql = `
      SELECT ds.*, u.full_name AS driver_name, u.email AS driver_email,
             v.plate_number
      FROM driver_scores ds
      JOIN users u ON u.id = ds.driver_id
      LEFT JOIN vehicles v ON v.id = ds.vehicle_id
      WHERE 1=1`;

    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND ds.driver_id = $${params.length}`;
    }

    sql += ' ORDER BY ds.score ASC, ds.updated_at DESC';
    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch scorecards' });
  }
});

router.get('/:driverId', async (req, res) => {
  try {
    if (req.user.role === 'DRIVER' && req.user.id !== req.params.driverId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await req.db((client) =>
      client.query(
        `SELECT ds.*, u.full_name AS driver_name
         FROM driver_scores ds
         JOIN users u ON u.id = ds.driver_id
         WHERE ds.driver_id = $1
         ORDER BY ds.updated_at DESC`,
        [req.params.driverId]
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch driver score' });
  }
});

module.exports = router;
