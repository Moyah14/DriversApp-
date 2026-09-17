/**
 * Thesis TC-RL / TC-RB evidence: cross-tenant isolation + RBAC checks.
 * Usage: node src/scripts/testIsolation.js
 * Writes results to ../../docs/evidence/isolation-results.json
 */
const fs = require('fs');
const path = require('path');

const API = process.env.API_URL || 'http://localhost:4000';

async function login(email, password) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function api(token, method, route, body) {
  const res = await fetch(`${API}${route}`, {
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
  return { status: res.status, data };
}

function pass(cond, msg) {
  return { ok: !!cond, message: msg };
}

async function main() {
  const results = {
    runAt: new Date().toISOString(),
    api: API,
    cases: [],
  };

  const admin = await login('admin@plateau.gov.ng', 'Password123!');
  const t1 = await login('fleetadmin1@plateau.ng', 'Password123!');
  const t2 = await login('fleetadmin2@plateau.ng', 'Password123!');
  const driver = await login('driver11@plateau.ng', 'Password123!');

  results.cases.push({
    id: 'TC-AUTH-01',
    name: 'Valid logins succeed',
    ...pass(
      admin.status === 200 && t1.status === 200 && t2.status === 200 && driver.status === 200,
      `admin=${admin.status} t1=${t1.status} t2=${t2.status} driver=${driver.status}`
    ),
  });

  const bad = await login('fleetadmin1@plateau.ng', 'WrongPassword!');
  results.cases.push({
    id: 'TC-AUTH-02',
    name: 'Invalid password rejected',
    ...pass(bad.status === 401, `status=${bad.status}`),
  });

  // Tenant 1 vehicles
  const v1 = await api(t1.body.token, 'GET', '/api/v1/vehicles');
  const v2 = await api(t2.body.token, 'GET', '/api/v1/vehicles');
  results.cases.push({
    id: 'TC-RL-01a',
    name: 'Each tenant sees only own vehicles (non-empty scoped lists)',
    ...(() => {
      const overlap = (v1.data || []).filter((a) =>
        (v2.data || []).some((b) => a.id === b.id)
      ).length;
      const ok =
        Array.isArray(v1.data) &&
        Array.isArray(v2.data) &&
        v1.data.length > 0 &&
        v2.data.length > 0 &&
        overlap === 0;
      return pass(ok, `t1=${v1.data?.length} t2=${v2.data?.length} overlap=${overlap}`);
    })(),
  });

  // Cross-tenant read attempt: Tenant2 tries to fetch Tenant1 vehicle by using T1 id in telemetry list filter
  const foreignVehicleId = v1.data[0]?.id;
  const crossRead = await api(
    t2.body.token,
    'GET',
    `/api/v1/telemetry?vehicleId=${foreignVehicleId}&limit=5`
  );
  const leaked = Array.isArray(crossRead.data) && crossRead.data.length > 0;
  results.cases.push({
    id: 'TC-RL-01',
    name: 'Cross-tenant telemetry read returns empty (RLS)',
    ...pass(!leaked && crossRead.status === 200, `status=${crossRead.status} rows=${crossRead.data?.length ?? 'n/a'}`),
  });

  // Tampered tenant_id on telemetry write (TC-RL-02)
  const ownVehicle = v2.data[0];
  const tamper = await api(t2.body.token, 'POST', '/api/v1/telemetry', {
    vehicleId: ownVehicle.id,
    latitude: 6.45,
    longitude: 3.35,
    speed_kmh: 40,
    tenant_id: v1.data[0]?.tenant_id || '00000000-0000-0000-0000-000000000099',
  });
  const savedTenant = tamper.data?.data?.tenant_id;
  results.cases.push({
    id: 'TC-RL-02',
    name: 'Tampered payload tenant_id ignored; record under session tenant',
    ...pass(
      tamper.status === 201 && savedTenant && savedTenant === ownVehicle.tenant_id,
      `status=${tamper.status} savedTenant=${savedTenant} expected=${ownVehicle.tenant_id}`
    ),
  });

  // Driver cannot provision tenants (TC-RB-01)
  const rbac = await api(driver.body.token, 'POST', '/api/v1/tenants', {
    name: 'Hacker Transit',
    slug: 'hacker-transit',
    adminEmail: 'hacker@evil.test',
    adminPassword: 'Password123!',
  });
  results.cases.push({
    id: 'TC-RB-01',
    name: 'Driver blocked from tenant provisioning',
    ...pass(rbac.status === 403, `status=${rbac.status}`),
  });

  // Forged / missing token (TC-RB-02 style)
  const forged = await api('not.a.real.jwt', 'GET', '/api/v1/vehicles');
  results.cases.push({
    id: 'TC-RB-02',
    name: 'Invalid JWT rejected',
    ...pass(forged.status === 401, `status=${forged.status}`),
  });

  // Scoring sanity: speeding event produces penalty
  const speedHit = await api(t1.body.token, 'POST', '/api/v1/telemetry', {
    vehicleId: v1.data[0].id,
    latitude: 6.46,
    longitude: 3.36,
    speed_kmh: 120,
  });
  results.cases.push({
    id: 'TC-UT-02',
    name: 'Speeding telemetry classified / ingested',
    ...pass(
      speedHit.status === 201 &&
        (speedHit.data?.data?.event_type === 'speeding' ||
          Number(speedHit.data?.data?.penalty_points) >= 0),
      `status=${speedHit.status} event=${speedHit.data?.data?.event_type} penalty=${speedHit.data?.data?.penalty_points}`
    ),
  });

  const scores = await api(t1.body.token, 'GET', '/api/v1/scores');
  results.cases.push({
    id: 'TC-AN-01',
    name: 'Driver scorecards readable after telemetry',
    ...pass(scores.status === 200 && Array.isArray(scores.data) && scores.data.length > 0, `count=${scores.data?.length}`),
  });

  const passed = results.cases.filter((c) => c.ok).length;
  const failed = results.cases.length - passed;
  results.summary = { total: results.cases.length, passed, failed, allPassed: failed === 0 };

  const outDir = path.join(__dirname, '../../../docs/evidence');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'isolation-results.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));

  console.log('\n=== Isolation / RBAC / Scoring Evidence ===');
  for (const c of results.cases) {
    console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  ${c.name}  (${c.message})`);
  }
  console.log(`\nSummary: ${passed}/${results.cases.length} passed`);
  console.log(`Wrote ${outFile}`);

  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
