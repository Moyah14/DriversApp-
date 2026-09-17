/**
 * End-to-end demo walkthrough verifier (mirrors docs/DEMO_SCRIPT.md UI calls).
 * Usage: node src/scripts/demoWalkthrough.js
 */
const API = process.env.API_URL || 'http://localhost:4000';

async function login(email, password) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Login ${email} failed: ${res.status} ${JSON.stringify(body)}`);
  return body;
}

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, ok: res.ok };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log(`  ✓ ${msg}`);
}

async function main() {
  console.log('\n=== DEMO WALKTHROUGH ===\n');

  // Step 1 — Super Admin
  console.log('Step 1: Super Admin — Tenants & Audit');
  const admin = await login('admin@plateau.gov.ng', 'Password123!');
  assert(admin.user.role === 'SYSTEM_ADMIN', 'Admin role is SYSTEM_ADMIN');
  const tenants = await api(admin.token, 'GET', '/api/v1/tenants');
  assert(tenants.ok && tenants.data.length >= 2, `Tenants list (${tenants.data.length})`);
  const audit = await api(admin.token, 'GET', '/api/v1/audit');
  assert(audit.ok && Array.isArray(audit.data), `Audit logs (${audit.data.length})`);

  // Step 2 — Fleet admin
  console.log('\nStep 2: Fleet admin — Fleet & Scorecards');
  const fleet = await login('fleetadmin1@plateau.ng', 'Password123!');
  assert(fleet.user.role === 'TENANT_ADMIN', 'Fleet admin role TENANT_ADMIN');
  const vehicles = await api(fleet.token, 'GET', '/api/v1/vehicles');
  assert(vehicles.ok && vehicles.data.length > 0, `Vehicles (${vehicles.data.length})`);
  const scores = await api(fleet.token, 'GET', '/api/v1/scores');
  assert(scores.ok && scores.data.length > 0, `Scorecards (${scores.data.length})`);
  const summary = await api(fleet.token, 'GET', '/api/v1/dashboard/summary');
  assert(summary.ok && summary.data.vehicles > 0, `Dashboard summary vehicles=${summary.data.vehicles}`);

  // Step 3 — Top-up
  console.log('\nStep 3: Top-up flow');
  const plate = vehicles.data[0].plate_number;
  const lookup = await api(fleet.token, 'POST', '/api/v1/payments/lookup', { plateNumber: plate });
  assert(lookup.ok && lookup.data.user_id, `Lookup plate ${plate} → ${lookup.data.full_name}`);
  const topup = await api(fleet.token, 'POST', '/api/v1/payments/topup', {
    userId: lookup.data.user_id,
    vehicleId: lookup.data.vehicle_id,
    amount: 2500,
  });
  assert(topup.ok && topup.status === 201, `Top-up created (${topup.status})`);
  const payments = await api(fleet.token, 'GET', '/api/v1/payments');
  assert(
    payments.ok && payments.data.some((p) => p.payment_type === 'topup'),
    `Payments include topup (total ${payments.data.length})`
  );

  // Step 4 — Parks & Routes
  console.log('\nStep 4: Parks & Routes');
  const parks = await api(fleet.token, 'GET', '/api/v1/parks');
  assert(parks.ok && parks.data.length > 0, `Parks (${parks.data.length})`);
  const routes = await api(fleet.token, 'GET', '/api/v1/routes');
  assert(routes.ok && routes.data.length > 0, `Routes (${routes.data.length})`);
  const adminParks = await api(admin.token, 'GET', '/api/v1/parks');
  assert(adminParks.ok && adminParks.data.length >= parks.data.length, `Admin sees parks (${adminParks.data.length})`);

  // Step 5 — Driver My Score
  console.log('\nStep 5: Driver — My Score');
  const driver = await login('driver11@plateau.ng', 'Password123!');
  assert(driver.user.role === 'DRIVER', 'Driver role DRIVER');
  const myScores = await api(driver.token, 'GET', '/api/v1/scores');
  assert(myScores.ok && myScores.data.length >= 1, `Driver scorecards (${myScores.data.length})`);
  const myTel = await api(driver.token, 'GET', '/api/v1/telemetry?limit=10');
  assert(myTel.ok, `Driver telemetry (${Array.isArray(myTel.data) ? myTel.data.length : 0})`);
  const blocked = await api(driver.token, 'POST', '/api/v1/tenants', {
    name: 'Nope',
    slug: 'nope',
    adminEmail: 'x@y.z',
    adminPassword: 'Password123!',
  });
  assert(blocked.status === 403, 'Driver blocked from tenant create (403)');

  // Step 6 — Live tracking
  console.log('\nStep 6: Live tracking');
  const live = await api(fleet.token, 'GET', '/api/v1/telemetry/live');
  assert(live.ok && Array.isArray(live.data), `Live positions (${live.data.length})`);
  if (live.data.length === 0) {
    console.log('  → no live points yet; posting one telemetry sample…');
    const sample = await api(fleet.token, 'POST', '/api/v1/telemetry', {
      vehicleId: vehicles.data[0].id,
      latitude: 6.45,
      longitude: 3.35,
      speed_kmh: 55,
    });
    assert(sample.ok, 'Telemetry sample ingested');
    const live2 = await api(fleet.token, 'GET', '/api/v1/telemetry/live');
    assert(live2.data.length > 0, `Live positions after ingest (${live2.data.length})`);
  }
  const alerts = await api(fleet.token, 'GET', '/api/v1/alerts');
  assert(alerts.ok, `Alerts endpoint (${alerts.data.length})`);

  console.log('\n=== ALL DEMO STEPS PASSED (API layer) ===\n');
  console.log('UI checklist (open in browser):');
  console.log('  Admin  http://localhost:3001  → admin@plateau.gov.ng');
  console.log('  Tenant http://localhost:3000/login → fleetadmin1@plateau.ng');
  console.log('  Driver http://localhost:3000/login → driver11@plateau.ng');
}

main().catch((e) => {
  console.error('\nDEMO FAIL:', e.message);
  process.exit(1);
});
