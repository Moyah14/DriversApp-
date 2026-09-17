const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

/**
 * Run a query with optional tenant/role session context for RLS.
 * Uses a dedicated client + transaction so SET LOCAL applies.
 */
async function withTenantContext({ tenantId, role }, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_role', $1, true)`, [role || '']);
    await client.query(
      `SELECT set_config('app.current_tenant_id', $1, true)`,
      [tenantId || '']
    );
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query, withTenantContext };
