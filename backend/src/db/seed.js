const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_role', 'SYSTEM_ADMIN', true)`);
    await client.query(`SELECT set_config('app.current_tenant_id', '', true)`);

    const passwordHash = await bcrypt.hash('Password123!', 10);

    const adminRes = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role, status)
       VALUES (NULL, $1, $2, $3, 'SYSTEM_ADMIN', 'active')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      ['admin@plateau.gov.ng', passwordHash, 'System Administrator']
    );

    const tenants = [
      { name: 'Jos Central Transit Union', slug: 'jos-central' },
      { name: 'Bukuru Fleet Operators', slug: 'bukuru-fleet' },
    ];

    const tenantIds = [];
    for (const t of tenants) {
      const res = await client.query(
        `INSERT INTO tenants (name, slug, status)
         VALUES ($1, $2, 'active')
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [t.name, t.slug]
      );
      tenantIds.push(res.rows[0].id);
    }

    for (let i = 0; i < tenantIds.length; i++) {
      const tid = tenantIds[i];
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tid]);

      await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role, phone, status)
         VALUES ($1, $2, $3, $4, 'TENANT_ADMIN', $5, 'active')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [tid, `fleetadmin${i + 1}@plateau.ng`, passwordHash, `Fleet Admin ${i + 1}`, `+234801000000${i + 1}`]
      );

      const agentRes = await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role, phone, status)
         VALUES ($1, $2, $3, $4, 'AGENT', $5, 'active')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id`,
        [tid, `agent${i + 1}@plateau.ng`, passwordHash, `Agent ${i + 1}`, `+234803000000${i + 1}`]
      );

      const uhRes = await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role, phone, address, status)
         VALUES ($1, $2, $3, $4, 'UNION_HEAD', $5, $6, 'active')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id`,
        [
          tid,
          `unionhead${i + 1}@plateau.ng`,
          passwordHash,
          `Union Head ${i + 1}`,
          `+234804000000${i + 1}`,
          'Jos North, Plateau',
        ]
      );

      const parkA = await client.query(
        `INSERT INTO parks (tenant_id, name, area, address, union_head_id, registered_by, status)
         VALUES ($1, $2, 'Jos North', $3, $4, $5, 'active')
         ON CONFLICT (tenant_id, name) DO UPDATE SET address = EXCLUDED.address
         RETURNING id, name`,
        [tid, `Jos Bus Park ${i + 1}`, 'Near UniJos', uhRes.rows[0].id, agentRes.rows[0].id]
      );
      const parkB = await client.query(
        `INSERT INTO parks (tenant_id, name, area, address, union_head_id, registered_by, status)
         VALUES ($1, $2, 'Jos South', $3, $4, $5, 'active')
         ON CONFLICT (tenant_id, name) DO UPDATE SET address = EXCLUDED.address
         RETURNING id, name`,
        [tid, `Terminus Park ${i + 1}`, 'Terminus Jos', uhRes.rows[0].id, agentRes.rows[0].id]
      );

      const routeRes = await client.query(
        `INSERT INTO routes (tenant_id, name, area, park_a_id, park_b_id, registered_by, status)
         VALUES ($1, $2, 'Jos North', $3, $4, $5, 'active')
         RETURNING id`,
        [
          tid,
          `${parkA.rows[0].name} ↔ ${parkB.rows[0].name}`,
          parkA.rows[0].id,
          parkB.rows[0].id,
          agentRes.rows[0].id,
        ]
      );

      for (let d = 1; d <= 3; d++) {
        const driverEmail = `driver${i + 1}${d}@plateau.ng`;
        const driverRes = await client.query(
          `INSERT INTO users
             (tenant_id, email, password_hash, full_name, role, phone, nin, address, license_ref, status)
           VALUES ($1, $2, $3, $4, 'DRIVER', $5, $6, $7, $8, 'active')
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
           RETURNING id, full_name`,
          [
            tid,
            driverEmail,
            passwordHash,
            `Driver ${i + 1}-${d}`,
            `+234802000${i}${d}00`,
            `1692345712${i}${d}`,
            'No 15, Olaiya street, Plateau',
            'IMG 3456.jpg',
          ]
        );

        const plate = `PLJ-${i + 1}${d}0${d}ABC`;
        const vehicleRes = await client.query(
          `INSERT INTO vehicles
             (tenant_id, plate_number, make, model, vehicle_type, status, assigned_driver_id, park_id, route_id)
           VALUES ($1, $2, 'Toyota', 'Hiace', 'bus', 'active', $3, $4, $5)
           ON CONFLICT (tenant_id, plate_number) DO UPDATE
             SET assigned_driver_id = EXCLUDED.assigned_driver_id,
                 park_id = EXCLUDED.park_id,
                 route_id = EXCLUDED.route_id
           RETURNING id`,
          [tid, plate, driverRes.rows[0].id, parkA.rows[0].id, routeRes.rows[0].id]
        );

        await client.query(
          `INSERT INTO wallets (tenant_id, user_id, balance)
           VALUES ($1, $2, $3)
           ON CONFLICT (tenant_id, user_id) DO UPDATE SET balance = EXCLUDED.balance`,
          [tid, driverRes.rows[0].id, 5000 + d * 2500]
        );

        await client.query(
          `INSERT INTO driver_scores (tenant_id, driver_id, vehicle_id, score, period_start, period_end)
           VALUES ($1, $2, $3, 100, CURRENT_DATE - 30, CURRENT_DATE)
           ON CONFLICT (tenant_id, driver_id, period_start, period_end) DO NOTHING`,
          [tid, driverRes.rows[0].id, vehicleRes.rows[0].id]
        );

        await client.query(
          `INSERT INTO payments
             (tenant_id, user_id, vehicle_id, amount, payment_type, status, description, created_by)
           VALUES
             ($1, $2, $3, $4, 'card', 'success', 'Daily dues', $5),
             ($1, $2, $3, $6, 'topup', 'success', 'Card top-up', $5),
             ($1, $2, $3, 1500, 'transfer', 'pending', 'Pending transfer', $5)`,
          [
            tid,
            driverRes.rows[0].id,
            vehicleRes.rows[0].id,
            2000 + d * 500,
            agentRes.rows[0].id,
            10000,
          ]
        );
      }

      await client.query(
        `INSERT INTO support_tickets (tenant_id, requester_id, subject, message, status)
         VALUES ($1, $2, 'Payment confirmation', 'Please confirm last top-up for my driver card.', 'pending')`,
        [tid, agentRes.rows[0].id]
      );
    }

    await client.query(`SELECT set_config('app.current_tenant_id', '', true)`);
    await client.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, resource, details)
       VALUES (NULL, $1, 'SEED', 'system', '{"message":"Full domain seed completed"}'::jsonb)`,
      [adminRes.rows[0].id]
    );

    await client.query('COMMIT');
    console.log('✓ Seed complete');
    console.log('  SYSTEM_ADMIN : admin@plateau.gov.ng / Password123!');
    console.log('  TENANT_ADMIN : fleetadmin1@plateau.ng / Password123!');
    console.log('  AGENT        : agent1@plateau.ng / Password123!');
    console.log('  UNION_HEAD   : unionhead1@plateau.ng / Password123!');
    console.log('  DRIVER       : driver11@plateau.ng / Password123!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
