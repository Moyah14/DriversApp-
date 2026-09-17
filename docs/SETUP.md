# Setup Guide

## Prerequisites

- **Docker Desktop** (required) — Postgres, API, and UI portals run via Compose
- **Node.js 20+** (optional) — only needed for local API/evidence scripts outside Docker

## Start the stack

From the repository root:

```bash
docker compose up --build
```

Wait until the API health check responds and the CRA portals finish compiling.

## Ports

| Service | URL | Notes |
|---------|-----|--------|
| API | http://localhost:4000 | Health: `/health` |
| Tenant / Agent portal | http://localhost:3000 | `union-agents` (local `npm start`) |
| Super Admin portal | http://localhost:3001 | `admin-portal` (local `PORT=3001 npm start`) |
| Union Heads portal | http://localhost:3002 | optional; `union-heads` with `PORT=3002` |

If you start frontends via `docker compose` instead, Compose maps admin→3000 and tenant→3001 — use whichever ports your terminal printed.

## Seed accounts

Seeded automatically when the API container migrates/seeds. Password for all demo users:

**`Password123!`**

| Role | Email |
|------|-------|
| SYSTEM_ADMIN | admin@plateau.gov.ng |
| TENANT_ADMIN | fleetadmin1@plateau.ng |
| AGENT | agent1@plateau.ng |
| UNION_HEAD | unionhead1@plateau.ng |
| DRIVER | driver11@plateau.ng |

A second tenant fleet admin (`fleetadmin2@plateau.ng`) exists for isolation demos.

## Local API only (optional)

```bash
docker compose up db -d
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Then start any frontend with `REACT_APP_API_URL=http://localhost:4000`.

## Evidence / thesis scripts

With the API running on port 4000, from `backend/`:

```bash
npm run test:isolation      # writes docs/evidence/isolation-results.json
npm run generate:telemetry  # synthetic GPS points (optional count arg)
npm run test:load           # writes docs/evidence/load-results.json
```

Combined:

```bash
npm run test:evidence
```

## Note: `fleet_app` role (RLS)

The API connects as PostgreSQL role **`fleet_app`**, which is a non-superuser application role with **no RLS bypass**. Table owner / migrate uses an elevated URL (`fleet` / `MIGRATE_DATABASE_URL`) for DDL and grants; runtime queries run under tenant session context so Row Level Security enforces multi-tenant isolation.
