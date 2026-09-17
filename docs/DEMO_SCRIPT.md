# Demo Script (10–15 min thesis defense)

Use seed password **`Password123!`** for every account below. Start with `docker compose up --build` from the repo root.

| Portal | URL |
|--------|-----|
| Tenant / Fleet / Driver | http://localhost:3000 |
| Super Admin | http://localhost:3001 |
| API health | http://localhost:4000/health |

> If you used `docker compose` frontend services instead of local `npm start`, ports may be swapped (admin 3000 / tenant 3001). Use the URL your terminal printed.

---

## 1. Super Admin — Tenants & Audit (~2 min)

1. Open **http://localhost:3001**
2. Sign in as **`admin@plateau.gov.ng`** / `Password123!`
3. Open **Tenants** — show active fleets / tenant list
4. Open **Audit** — show recent system audit events (seed + admin actions)

**Talking point:** platform-wide control plane; tenants are isolated domains.

---

## 2. Fleet admin — Fleet & scorecards (~3 min)

1. Open **http://localhost:3000/login**
2. Sign in as **`fleetadmin1@plateau.ng`** / `Password123!`
3. Open **Fleet** (`http://localhost:3000/fleet`) — vehicles/drivers under this tenant
4. Open **Scorecards** (`http://localhost:3000/scorecards`) — safety scores

**Talking point:** tenant-scoped JWT + RLS; this admin only sees tenant 1 data.

---

## 3. Top-up flow (~2 min)

1. From the tenant dashboard (`http://localhost:3000/dashboard`), start **Top-Up Card**
2. Look up a seeded driver/vehicle and complete authorize/top-up
3. Confirm the payment appears under **Payments** (`http://localhost:3000/payments`)

**Talking point:** payment workflow is API-backed (`/api/v1/payments/...`), not mock UI.

---

## 4. Parks & Routes (~2 min)

1. In Super Admin (or tenant UI routes), open **Parks** / **Routes**
   - Admin parks: `http://localhost:3001/parks`
   - Admin routes: `http://localhost:3001/routes`
   - Tenant routes: `http://localhost:3000/routes`
2. Show a park pair and a route linking parks; note driver counts

**Talking point:** domain model parks → routes → vehicles/drivers.

---

## 5. Driver — My Score (~2 min)

1. Log out; open **http://localhost:3000/login**
2. Sign in as **`driver11@plateau.ng`** / `Password123!`
3. Land on / open **My Score** (`http://localhost:3000/my-score`)
4. Show score + recent telemetry-linked performance

**Talking point:** role-based redirect; drivers cannot provision tenants (RBAC).

---

## 6. Live tracking after telemetry (~3 min)

1. With API up, from `backend/`:

   ```bash
   npm run generate:telemetry
   ```

2. As **`fleetadmin1@plateau.ng`**, open **Live Tracking**  
   `http://localhost:3000/live`
3. Refresh / wait for live positions and optional alerts
4. (Optional) show isolation evidence: `npm run test:isolation` → `docs/evidence/isolation-results.json`

**Talking point:** telemetry ingestion + tenant isolation; cross-tenant reads return empty under RLS.

---

## Quick credential cheat sheet

| Who | Email | Where |
|-----|-------|--------|
| Super admin | admin@plateau.gov.ng | http://localhost:3001 |
| Fleet admin (T1) | fleetadmin1@plateau.ng | http://localhost:3000 |
| Fleet admin (T2) | fleetadmin2@plateau.ng | http://localhost:3000 (isolation) |
| Agent | agent1@plateau.ng | http://localhost:3000 |
| Driver | driver11@plateau.ng | http://localhost:3000 → `/my-score` |
| Union head | unionhead1@plateau.ng | union-heads UI (optional) |

**Top-up demo tips:** plate `PLJ-1101ABC`, OTP `123456`, any amount e.g. `2500`
