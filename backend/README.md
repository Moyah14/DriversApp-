# Plateau Fleet Platform

Role-based multi-tenant transit/fleet management API with PostgreSQL RLS, JWT RBAC, telemetry ingestion, and driver safety scoring.

## Quick start (Docker)

```bash
docker compose up --build
```

- API: http://localhost:4000/health
- Admin portal: http://localhost:3000
- Tenant portal (union-agents): http://localhost:3001

## Seed accounts

| Role | Email | Password |
|------|-------|----------|
| SYSTEM_ADMIN | admin@plateau.gov.ng | Password123! |
| TENANT_ADMIN | fleetadmin1@plateau.ng | Password123! |
| DRIVER | driver11@plateau.ng | Password123! |

## Local API (without Docker frontend)

```bash
cd backend
npm install
# Start Postgres (via docker compose up db -d)
npm run migrate
npm run seed
npm run dev
```

## Key endpoints

- `POST /api/v1/auth/login`
- `GET/POST /api/v1/tenants`
- `GET/POST /api/v1/vehicles`
- `POST /api/v1/telemetry`
- `GET /api/v1/telemetry/live`
- `GET /api/v1/scores`
- `GET /api/v1/alerts`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/scorecards/export`
