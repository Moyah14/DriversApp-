const { withTenantContext } = require('../db/pool');

async function writeAudit({ tenantId, userId, action, resource, details, ip, role }) {
  try {
    await withTenantContext(
      {
        tenantId: tenantId || null,
        role: role || (tenantId ? 'TENANT_ADMIN' : 'SYSTEM_ADMIN'),
      },
      (client) =>
        client.query(
          `INSERT INTO audit_logs (tenant_id, user_id, action, resource, details, ip_address)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
          [
            tenantId || null,
            userId || null,
            action,
            resource || null,
            JSON.stringify(details || {}),
            ip || null,
          ]
        )
    );
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

module.exports = { writeAudit };
