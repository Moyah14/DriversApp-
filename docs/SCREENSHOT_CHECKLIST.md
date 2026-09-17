# Screenshot Checklist (Chapters 3–4)

Capture these for the thesis write-up. Prefer full browser chrome with URL bar visible where helpful.

## Chapter 3 — Architecture & design

- [ ] High-level architecture diagram (API, Postgres RLS, portals, roles)
- [ ] Sequence: login → JWT → tenant session → RLS query
- [ ] ER / domain sketch: tenants, users, parks, routes, vehicles, payments, telemetry, scores
- [ ] Role matrix table screenshot (SYSTEM_ADMIN / TENANT_ADMIN / AGENT / UNION_HEAD / DRIVER)
- [ ] Docker Compose topology (optional: `docker compose ps`)

## Chapter 3–4 — UI portals

### Super Admin (`http://localhost:3000`)

- [ ] Sign-in screen
- [ ] Dashboard summary
- [ ] Tenants list / create tenant
- [ ] Audit logs
- [ ] Accounts (drivers / agents / union heads tabs)
- [ ] Parks list + park detail
- [ ] Routes list + route detail
- [ ] Payments overview
- [ ] Analytics / support (if cited)

### Tenant / Fleet (`http://localhost:3001`)

- [ ] Login
- [ ] Dashboard
- [ ] Fleet vehicles
- [ ] Scorecards (and optional CSV export dialog)
- [ ] Live tracking map / list
- [ ] Alerts (ack if shown)
- [ ] Payments + top-up / authorize flow (2–3 frames)
- [ ] Routes
- [ ] Driver My Score (`driver11@plateau.ng`)

### Union Heads UI (if demonstrated)

- [ ] Login (`unionhead1@plateau.ng`)
- [ ] Dashboard summary (API-backed stats)
- [ ] Accounts drivers list
- [ ] Payments
- [ ] Routes

## Chapter 4 — Evaluation / evidence

- [ ] Isolation test terminal output (`npm run test:isolation`)
- [ ] `docs/evidence/isolation-results.json` (pass/fail cases visible)
- [ ] Cross-tenant empty read callout (highlight TC-RL case)
- [ ] Load test terminal output (`npm run test:load`)
- [ ] `docs/evidence/load-results.json` (latency percentiles / throughput)
- [ ] Telemetry generation run (`npm run generate:telemetry`) then Live Tracking screenshot
- [ ] Scorecards before/after telemetry (optional pair)
- [ ] Health endpoint `http://localhost:4000/health`

## Tips

- Use consistent browser zoom (100%) and window size
- Redact nothing required for seed demos; do not capture real production secrets
- Name files by chapter + topic, e.g. `ch4-isolation-results.png`
