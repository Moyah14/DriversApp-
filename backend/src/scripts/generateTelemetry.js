/**
 * Lightweight synthetic telemetry generator for local demos / load smoke tests.
 * Usage: node src/scripts/generateTelemetry.js [count]
 * Requires API running and seeded vehicles.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const API = process.env.API_URL || 'http://localhost:4000';

async function login(email, password) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  return res.json();
}

async function main() {
  const count = Number(process.argv[2] || 50);
  const { token } = await login('fleetadmin1@plateau.ng', 'Password123!');
  const vehiclesRes = await fetch(`${API}/api/v1/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const vehicles = await vehiclesRes.json();
  if (!vehicles.length) throw new Error('No vehicles found');

  let lat = 6.45;
  let lng = 3.35;
  let speed = 55;

  for (let i = 0; i < count; i++) {
    const vehicle = vehicles[i % vehicles.length];
    speed = Math.max(0, Math.min(140, speed + (Math.random() * 20 - 10)));
    if (i % 17 === 0) speed = 120; // inject speeding
    if (i % 23 === 0) speed = Math.max(0, speed - 30); // inject harsh brake-ish drop

    lat += (Math.random() - 0.5) * 0.002;
    lng += (Math.random() - 0.5) * 0.002;

    const res = await fetch(`${API}/api/v1/telemetry`, {
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
        engineRpm: 1500 + Math.random() * 1000,
        acceleratorPct: Math.random() * 100,
      }),
    });
    const body = await res.json();
    console.log(i + 1, res.status, body.data?.event_type || body.error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
