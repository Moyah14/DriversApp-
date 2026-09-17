# Chapter 4 Evidence Summary

Generated from automated scripts against the local Docker stack (`plateau-fleet-api` + PostgreSQL 16).

## 1. Security & isolation (RLS + RBAC)

**Script:** `backend` → `npm run test:isolation`  
**Artifact:** [`isolation-results.json`](./isolation-results.json)

| Case | Result |
|------|--------|
| Valid / invalid login | PASS |
| Tenant vehicle lists disjoint (overlap=0) | PASS |
| Cross-tenant telemetry read → 0 rows | PASS |
| Tampered `tenant_id` on ingest ignored | PASS |
| Driver cannot provision tenants (403) | PASS |
| Invalid JWT rejected (401) | PASS |
| Speeding event scored (−10) | PASS |
| Scorecards readable | PASS |

**Summary: 9/9 passed** after fixing DB role bypass (API now connects as `fleet_app`, which does **not** bypass RLS).

## 2. Telemetry generator

**Script:** `npm run generate:telemetry -- 30`  
Ingested mixed `normal` / `speeding` / `harsh_braking` events with HTTP 201 responses. Use Live Tracking + Scorecards + Alerts UI to capture screenshots.

## 3. Load / latency smoke test

**Script:** `npm run test:load -- 20 200`  
**Artifact:** [`load-results.json`](./load-results.json)

Latest local Docker Desktop (Windows) run:

| Metric | Value |
|--------|-------|
| Requests | 200 @ concurrency 20 |
| Errors | 0 |
| Throughput | ~55 req/s |
| Latency p50 / p95 | ~326 ms / ~648 ms |

**Note for dissertation:** Thesis NFRs (p95 &lt; 50 ms, ≥500 req/s) target a tuned Linux host / cloud VM. Local Docker-on-Windows introduces higher I/O latency. Report **measured** values here and state the environment. Isolation correctness is environment-independent and fully evidenced above.

## 4. How to regenerate

```bash
cd backend
npm run test:evidence
```

Or individually:

```bash
npm run test:isolation
npm run generate:telemetry -- 50
npm run test:load -- 20 200
```
