# Plateau Drivers / Multi-Tenant Fleet Platform

Role-based multi-tenant transit/fleet management with PostgreSQL **RLS**, JWT **RBAC**, telemetry scoring, payments, parks, and routes.

## Quick start

```bash
docker compose up --build -d db api
```

Then start UIs (separate terminals):

```bash
# Tenant / Agent portal → http://localhost:3000
cd mobile-app-driver/union-agents/my-app
$env:REACT_APP_API_URL="http://localhost:4000"; npm start

# Super Admin → http://localhost:3001
cd admin-portal
$env:PORT=3001; $env:REACT_APP_API_URL="http://localhost:4000"; $env:BROWSER="none"; npm start
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/SETUP.md](docs/SETUP.md) | Install, ports, seed accounts, evidence scripts |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 10–15 min defense demo walkthrough |
| [docs/SCREENSHOT_CHECKLIST.md](docs/SCREENSHOT_CHECKLIST.md) | Screenshots for Chapters 3–4 |
| [docs/evidence/CHAPTER4_SUMMARY.md](docs/evidence/CHAPTER4_SUMMARY.md) | Isolation + load results for thesis |

## Seed logins (password: `Password123!`)

- `admin@plateau.gov.ng` — SYSTEM_ADMIN  
- `fleetadmin1@plateau.ng` — TENANT_ADMIN  
- `agent1@plateau.ng` — AGENT  
- `unionhead1@plateau.ng` — UNION_HEAD  
- `driver11@plateau.ng` — DRIVER  

## Evidence commands

```bash
cd backend
npm run test:isolation
npm run generate:telemetry -- 50
npm run test:load -- 20 200
```
