const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const {
  evaluateTelemetryEvent,
  computeScoreFromPenalties,
} = require('../services/scoringEngine');

const router = express.Router();
router.use(authenticate, tenantContext);

/**
 * POST /api/v1/telemetry
 * Ingest vehicle telemetry (FR-04 / FR-05)
 */
router.post('/', requireRoles('SYSTEM_ADMIN', 'TENANT_ADMIN', 'DRIVER'), async (req, res) => {
  const started = Date.now();
  try {
    const {
      vehicleId,
      latitude,
      longitude,
      speed_kmh,
      speedKmh,
      engineRpm,
      acceleratorPct,
      dtcCodes,
      recordedAt,
      tenant_id: payloadTenantId,
    } = req.body || {};

    const speed = speed_kmh ?? speedKmh;
    if (
      !vehicleId ||
      latitude === undefined ||
      longitude === undefined ||
      speed === undefined
    ) {
      return res.status(400).json({
        error: 'vehicleId, latitude, longitude, and speed_kmh are required',
      });
    }

    // Reject malformed numeric fields (TC-UT-01)
    if ([latitude, longitude, speed].some((v) => Number.isNaN(Number(v)))) {
      return res.status(400).json({ error: 'Numeric fields must be valid numbers' });
    }

    const recorded_at = recordedAt || new Date().toISOString();

    const result = await req.db(async (client) => {
      const vehicleRes = await client.query(`SELECT * FROM vehicles WHERE id = $1`, [
        vehicleId,
      ]);
      const vehicle = vehicleRes.rows[0];
      if (!vehicle) {
        const err = new Error('Vehicle not found or not visible in tenant scope');
        err.status = 404;
        throw err;
      }

      // RLS session tenant overrides any tampered payload tenant_id (TC-RL-02)
      const tenantId =
        req.user.role === 'SYSTEM_ADMIN'
          ? vehicle.tenant_id
          : req.user.tenantId || vehicle.tenant_id;

      if (payloadTenantId && req.user.role !== 'SYSTEM_ADMIN' && payloadTenantId !== tenantId) {
        // Ignore tampered tenant — persist under session tenant
      }

      const prevRes = await client.query(
        `SELECT speed_kmh, recorded_at FROM telemetry_logs
         WHERE vehicle_id = $1
         ORDER BY recorded_at DESC LIMIT 1`,
        [vehicleId]
      );
      const previous = prevRes.rows[0] || null;

      const { eventType, penalty } = evaluateTelemetryEvent(
        { speed_kmh: Number(speed), recorded_at },
        previous
      );

      const driverId = vehicle.assigned_driver_id;

      const insert = await client.query(
        `INSERT INTO telemetry_logs
           (tenant_id, vehicle_id, driver_id, recorded_at, latitude, longitude,
            speed_kmh, engine_rpm, accelerator_pct, dtc_codes, event_type, penalty_points)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          tenantId,
          vehicleId,
          driverId,
          recorded_at,
          Number(latitude),
          Number(longitude),
          Number(speed),
          engineRpm ?? null,
          acceleratorPct ?? null,
          dtcCodes || null,
          eventType,
          penalty,
        ]
      );

      if (penalty > 0) {
        await client.query(
          `INSERT INTO alerts (tenant_id, vehicle_id, driver_id, alert_type, severity, message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            tenantId,
            vehicleId,
            driverId,
            eventType,
            eventType === 'harsh_braking' ? 'high' : 'medium',
            `${eventType.replace('_', ' ')} detected at ${Number(speed).toFixed(1)} km/h (−${penalty} pts)`,
          ]
        );
      }

      if (driverId && penalty > 0) {
        const scoreRes = await client.query(
          `SELECT * FROM driver_scores
           WHERE driver_id = $1 AND tenant_id = $2
           ORDER BY updated_at DESC LIMIT 1`,
          [driverId, tenantId]
        );
        if (scoreRes.rows[0]) {
          const s = scoreRes.rows[0];
          const totalPenalties = Number(s.total_penalties) + penalty;
          const speeding =
            Number(s.speeding_events) + (eventType === 'speeding' ? 1 : 0);
          const braking =
            Number(s.harsh_braking_events) + (eventType === 'harsh_braking' ? 1 : 0);
          const idling =
            Number(s.idling_events) + (eventType === 'excessive_idling' ? 1 : 0);
          const newScore = computeScoreFromPenalties(
            totalPenalties,
            Number(s.distance_km) || 0
          );
          await client.query(
            `UPDATE driver_scores SET
               score = $1,
               total_penalties = $2,
               speeding_events = $3,
               harsh_braking_events = $4,
               idling_events = $5,
               updated_at = NOW()
             WHERE id = $6`,
            [newScore, totalPenalties, speeding, braking, idling, s.id]
          );
        } else {
          const newScore = computeScoreFromPenalties(penalty, 0);
          await client.query(
            `INSERT INTO driver_scores
               (tenant_id, driver_id, vehicle_id, score, total_penalties,
                speeding_events, harsh_braking_events, idling_events,
                period_start, period_end)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8, CURRENT_DATE - 30, CURRENT_DATE)`,
            [
              tenantId,
              driverId,
              vehicleId,
              newScore,
              penalty,
              eventType === 'speeding' ? 1 : 0,
              eventType === 'harsh_braking' ? 1 : 0,
              eventType === 'excessive_idling' ? 1 : 0,
            ]
          );
        }
      }

      return insert.rows[0];
    });

    const elapsed = Date.now() - started;
    return res.status(201).json({
      data: result,
      meta: { processingMs: elapsed },
    });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Ingestion failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const vehicleId = req.query.vehicleId;
    const params = [];
    let sql = `SELECT t.*, v.plate_number FROM telemetry_logs t
               JOIN vehicles v ON v.id = t.vehicle_id WHERE 1=1`;
    if (vehicleId) {
      params.push(vehicleId);
      sql += ` AND t.vehicle_id = $${params.length}`;
    }
    if (req.user.role === 'DRIVER') {
      params.push(req.user.id);
      sql += ` AND t.driver_id = $${params.length}`;
    }
    params.push(limit);
    sql += ` ORDER BY t.recorded_at DESC LIMIT $${params.length}`;

    const result = await req.db((client) => client.query(sql, params));
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

/** Latest positions for live fleet map */
router.get('/live', async (req, res) => {
  try {
    const result = await req.db((client) =>
      client.query(
        `SELECT DISTINCT ON (t.vehicle_id)
           t.vehicle_id, t.latitude, t.longitude, t.speed_kmh, t.event_type,
           t.recorded_at, v.plate_number, u.full_name AS driver_name
         FROM telemetry_logs t
         JOIN vehicles v ON v.id = t.vehicle_id
         LEFT JOIN users u ON u.id = t.driver_id
         ORDER BY t.vehicle_id, t.recorded_at DESC`
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch live positions' });
  }
});

module.exports = router;
