/**
 * Lightweight latency/throughput smoke test (thesis TC-LP style).
 * Usage: node src/scripts/testLoad.js [concurrency] [requests]
 * Writes docs/evidence/load-results.json
 */
const fs = require('fs');
const path = require('path');

const API = process.env.API_URL || 'http://localhost:4000';

async function login() {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fleetadmin1@plateau.ng', password: 'Password123!' }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

async function timed(fn) {
  const t0 = process.hrtime.bigint();
  let ok = true;
  let status = 0;
  try {
    const res = await fn();
    status = res.status;
    ok = res.ok;
    await res.text();
  } catch {
    ok = false;
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { ok, status, ms };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

async function main() {
  const concurrency = Number(process.argv[2] || 20);
  const total = Number(process.argv[3] || 200);
  const { token } = await login();

  const vehiclesRes = await fetch(`${API}/api/v1/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const vehicles = await vehiclesRes.json();
  if (!vehicles.length) throw new Error('No vehicles');

  let lat = 6.45;
  let lng = 3.35;
  let i = 0;
  const latencies = [];
  let errors = 0;
  const started = Date.now();

  async function worker() {
    while (i < total) {
      const n = i++;
      const vehicle = vehicles[n % vehicles.length];
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      const speed = n % 19 === 0 ? 115 : 40 + (n % 40);
      const result = await timed(() =>
        fetch(`${API}/api/v1/telemetry`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicleId: vehicle.id,
            latitude: lat,
            longitude: lng,
            speed_kmh: speed,
          }),
        })
      );
      latencies.push(result.ms);
      if (!result.ok) errors += 1;
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const elapsedSec = (Date.now() - started) / 1000;
  const sorted = [...latencies].sort((a, b) => a - b);
  const report = {
    runAt: new Date().toISOString(),
    concurrency,
    totalRequests: total,
    errors,
    errorRatePct: Number(((errors / total) * 100).toFixed(3)),
    elapsedSec: Number(elapsedSec.toFixed(3)),
    throughputReqPerSec: Number((total / elapsedSec).toFixed(2)),
    latencyMs: {
      p50: Number(percentile(sorted, 50).toFixed(2)),
      p95: Number(percentile(sorted, 95).toFixed(2)),
      p99: Number(percentile(sorted, 99).toFixed(2)),
      avg: Number((sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2)),
      max: Number(sorted[sorted.length - 1].toFixed(2)),
    },
    targets: {
      p95Under50ms: percentile(sorted, 95) < 50,
      throughputOver100: total / elapsedSec >= 100,
    },
  };

  const outDir = path.join(__dirname, '../../../docs/evidence');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'load-results.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log('\n=== Load / Latency Evidence ===');
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
