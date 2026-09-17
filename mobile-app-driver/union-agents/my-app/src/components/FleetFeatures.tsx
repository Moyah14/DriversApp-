import React, { useEffect, useState } from 'react';
import { api, API_URL, getToken } from '../api/client';
import './FleetFeatures.css';

export const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    plateNumber: '',
    make: 'Toyota',
    model: 'Hiace',
    vehicleType: 'bus',
    assignedDriverId: '',
  });

  const load = () => {
    Promise.all([api('/api/v1/vehicles'), api('/api/v1/users?role=DRIVER')])
      .then(([v, d]) => {
        setVehicles(v);
        setDrivers(d);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/v1/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          assignedDriverId: form.assignedDriverId || null,
        }),
      });
      setForm({ ...form, plateNumber: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fleet-feature-page">
      <header className="fleet-feature-header">
        <div>
          <h1>Fleet & vehicles</h1>
          <p>Register vehicles, set status, and assign drivers within your tenant.</p>
        </div>
      </header>
      {error && <div className="fleet-error">{error}</div>}

      <form className="fleet-form-card" onSubmit={create}>
        <h2>Add vehicle</h2>
        <div className="fleet-form-grid">
          <input
            required
            placeholder="Plate number"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
          />
          <input
            placeholder="Make"
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
          />
          <input
            placeholder="Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
          <select
            value={form.assignedDriverId}
            onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Register vehicle</button>
      </form>

      <div className="fleet-table-card">
        <table>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Type</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Safety score</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.plate_number}</td>
                <td>{v.vehicle_type}</td>
                <td>
                  <span className={`status-pill status-${v.status}`}>{v.status}</span>
                </td>
                <td>{v.driver_name || '—'}</td>
                <td>{v.driver_score != null ? Number(v.driver_score).toFixed(1) : '—'}</td>
              </tr>
            ))}
            {!vehicles.length && (
              <tr>
                <td colSpan={5} className="muted">
                  No vehicles yet. Start the API and seed data, or add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ScorecardsPage: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/v1/scores')
      .then(setScores)
      .catch((e) => setError(e.message));
  }, []);

  const exportCsv = () => {
    const token = getToken();
    window.open(`${API_URL}/api/v1/dashboard/scorecards/export?token=${token}`, '_blank');
    // Prefer authenticated fetch download
    fetch(`${API_URL}/api/v1/dashboard/scorecards/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'driver-scorecards.csv';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => setError(e.message));
  };

  return (
    <div className="fleet-feature-page">
      <header className="fleet-feature-header">
        <div>
          <h1>Driver scorecards</h1>
          <p>Rule-based safety scores (0–100) from speeding, harsh braking, and idling events.</p>
        </div>
        <button className="fleet-secondary-btn" onClick={exportCsv}>
          Export CSV
        </button>
      </header>
      {error && <div className="fleet-error">{error}</div>}
      <div className="fleet-table-card">
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Score</th>
              <th>Penalties</th>
              <th>Speeding</th>
              <th>Harsh brake</th>
              <th>Idling</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.driver_name}</strong>
                  <div className="muted">{s.driver_email}</div>
                </td>
                <td>
                  <span className={`score-badge ${Number(s.score) < 70 ? 'low' : 'ok'}`}>
                    {Number(s.score).toFixed(1)}
                  </span>
                </td>
                <td>{s.total_penalties}</td>
                <td>{s.speeding_events}</td>
                <td>{s.harsh_braking_events}</td>
                <td>{s.idling_events}</td>
              </tr>
            ))}
            {!scores.length && (
              <tr>
                <td colSpan={6} className="muted">
                  No scorecards yet. Ingest telemetry to generate scores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LiveTrackingPage: React.FC = () => {
  const [points, setPoints] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/v1/telemetry/live')
      .then(setPoints)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fleet-feature-page">
      <header className="fleet-feature-header">
        <div>
          <h1>Live fleet tracking</h1>
          <p>Latest telemetry positions per vehicle (auto-refresh every 5s).</p>
        </div>
        <button className="fleet-secondary-btn" onClick={load}>
          Refresh
        </button>
      </header>
      {error && <div className="fleet-error">{error}</div>}
      <div className="live-grid">
        {points.map((p) => (
          <div key={p.vehicle_id} className="live-card">
            <div className="live-card-top">
              <strong>{p.plate_number}</strong>
              <span className={`event-pill event-${p.event_type}`}>{p.event_type}</span>
            </div>
            <div className="muted">{p.driver_name || 'Unassigned'}</div>
            <div className="live-metrics">
              <div>
                <span>Speed</span>
                <strong>{Number(p.speed_kmh).toFixed(1)} km/h</strong>
              </div>
              <div>
                <span>Lat / Lng</span>
                <strong>
                  {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                </strong>
              </div>
            </div>
            <div className="muted small">{new Date(p.recorded_at).toLocaleString()}</div>
          </div>
        ))}
        {!points.length && <div className="muted">No live positions. Generate telemetry from the API scripts.</div>}
      </div>
    </div>
  );
};

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/v1/alerts')
      .then(setAlerts)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const ack = async (id: string) => {
    try {
      await api(`/api/v1/alerts/${id}/ack`, { method: 'PATCH' });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="fleet-feature-page">
      <header className="fleet-feature-header">
        <div>
          <h1>Safety alerts</h1>
          <p>Real-time threshold notifications for speeding, harsh braking, and idling.</p>
        </div>
      </header>
      {error && <div className="fleet-error">{error}</div>}
      <div className="fleet-table-card">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Vehicle</th>
              <th>Message</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>{a.alert_type}</td>
                <td>
                  <span className={`severity-${a.severity}`}>{a.severity}</span>
                </td>
                <td>{a.plate_number || '—'}</td>
                <td>{a.message}</td>
                <td>
                  {!a.acknowledged && (
                    <button className="fleet-link-btn" onClick={() => ack(a.id)}>
                      Ack
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!alerts.length && (
              <tr>
                <td colSpan={6} className="muted">
                  No alerts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DriverPortalPage: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/api/v1/scores'), api('/api/v1/telemetry?limit=30')])
      .then(([s, t]) => {
        setScores(s);
        setEvents(t);
      })
      .catch((e) => setError(e.message));
  }, []);

  const score = scores[0];

  return (
    <div className="fleet-feature-page">
      <header className="fleet-feature-header">
        <div>
          <h1>My performance</h1>
          <p>Your personal safety scorecard and recent penalty events.</p>
        </div>
      </header>
      {error && <div className="fleet-error">{error}</div>}
      <div className="score-hero">
        <div>
          <span className="muted">Current safety score</span>
          <div className="score-hero-value">{score ? Number(score.score).toFixed(1) : '—'}</div>
        </div>
        <div className="score-hero-stats">
          <div>
            <span>Speeding</span>
            <strong>{score?.speeding_events ?? 0}</strong>
          </div>
          <div>
            <span>Harsh braking</span>
            <strong>{score?.harsh_braking_events ?? 0}</strong>
          </div>
          <div>
            <span>Idling</span>
            <strong>{score?.idling_events ?? 0}</strong>
          </div>
        </div>
      </div>
      <div className="fleet-table-card">
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Recent events</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Speed</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.recorded_at).toLocaleString()}</td>
                <td>{e.event_type}</td>
                <td>{Number(e.speed_kmh).toFixed(1)} km/h</td>
                <td>−{e.penalty_points}</td>
              </tr>
            ))}
            {!events.length && (
              <tr>
                <td colSpan={4} className="muted">
                  No telemetry events for your account yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
