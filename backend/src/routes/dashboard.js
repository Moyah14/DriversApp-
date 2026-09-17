const express = require('express');
const { authenticate } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();
router.use(authenticate, tenantContext);

router.get('/summary', async (req, res) => {
  try {
    const summary = await req.db(async (client) => {
      const vehicles = await client.query(`SELECT COUNT(*)::int AS c FROM vehicles`);
      const drivers = await client.query(
        `SELECT COUNT(*)::int AS c FROM users WHERE role = 'DRIVER'`
      );
      const agents = await client.query(
        `SELECT COUNT(*)::int AS c FROM users WHERE role = 'AGENT'`
      );
      const unionHeads = await client.query(
        `SELECT COUNT(*)::int AS c FROM users WHERE role = 'UNION_HEAD'`
      );
      const parks = await client.query(`SELECT COUNT(*)::int AS c FROM parks`);
      const routes = await client.query(`SELECT COUNT(*)::int AS c FROM routes`);
      const activeAlerts = await client.query(
        `SELECT COUNT(*)::int AS c FROM alerts WHERE acknowledged = FALSE`
      );
      const avgScore = await client.query(
        `SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 100) AS avg_score FROM driver_scores`
      );
      const payments = await client.query(
        `SELECT
           COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0)::float AS revenue,
           COUNT(*)::int AS payment_count,
           COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today_count
         FROM payments`
      );
      const recentPayments = await client.query(
        `SELECT p.id, p.amount, p.payment_type, p.status, p.created_at,
                u.full_name AS user_name, v.plate_number
         FROM payments p
         LEFT JOIN users u ON u.id = p.user_id
         LEFT JOIN vehicles v ON v.id = p.vehicle_id
         ORDER BY p.created_at DESC
         LIMIT 10`
      );
      const chart = await client.query(
        `SELECT to_char(created_at, 'Mon DD') AS day,
                COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0)::float AS amount
         FROM payments
         WHERE created_at > NOW() - INTERVAL '14 days'
         GROUP BY 1, date_trunc('day', created_at)
         ORDER BY date_trunc('day', created_at)`
      );
      const tenants =
        req.user.role === 'SYSTEM_ADMIN'
          ? await client.query(`SELECT COUNT(*)::int AS c FROM tenants WHERE status = 'active'`)
          : { rows: [{ c: 1 }] };

      return {
        tenants: tenants.rows[0].c,
        vehicles: vehicles.rows[0].c,
        drivers: drivers.rows[0].c,
        agents: agents.rows[0].c,
        unionHeads: unionHeads.rows[0].c,
        parks: parks.rows[0].c,
        routes: routes.rows[0].c,
        activeAlerts: activeAlerts.rows[0].c,
        averageSafetyScore: Number(avgScore.rows[0].avg_score),
        revenue: payments.rows[0].revenue,
        paymentCount: payments.rows[0].payment_count,
        todayPayments: payments.rows[0].today_count,
        recentPayments: recentPayments.rows,
        revenueChart: chart.rows,
      };
    });
    return res.json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load dashboard summary' });
  }
});

router.get('/scorecards/export', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT u.full_name, u.email, ds.score, ds.total_penalties,
                ds.speeding_events, ds.harsh_braking_events, ds.idling_events,
                ds.period_start, ds.period_end
         FROM driver_scores ds
         JOIN users u ON u.id = ds.driver_id
         ORDER BY ds.score ASC`
      )
    );

    const header =
      'full_name,email,score,total_penalties,speeding_events,harsh_braking_events,idling_events,period_start,period_end\n';
    const rows = result.rows
      .map((r) =>
        [
          r.full_name,
          r.email,
          r.score,
          r.total_penalties,
          r.speeding_events,
          r.harsh_braking_events,
          r.idling_events,
          r.period_start,
          r.period_end,
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="driver-scorecards.csv"');
    return res.send(header + rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
