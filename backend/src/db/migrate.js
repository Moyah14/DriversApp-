const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  // Prefer superuser URL for DDL / role grants (fleet), then app connects as fleet_app
  const url =
    process.env.MIGRATE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://fleet:fleetsecret@localhost:5432/fleet_platform';

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    const base = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const ext = fs.readFileSync(path.join(__dirname, 'schema_extensions.sql'), 'utf8');
    const grants = fs.readFileSync(path.join(__dirname, 'grant_app_role.sql'), 'utf8');
    await client.query(base);
    console.log('✓ Core schema + RLS applied');
    await client.query(ext);
    console.log('✓ Domain extensions applied');
    await client.query(grants);
    console.log('✓ Application role fleet_app granted (no RLS bypass)');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
