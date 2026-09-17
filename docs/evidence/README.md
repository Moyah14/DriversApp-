# Evidence artifacts

This folder holds machine-generated JSON used in **Chapter 4** (evaluation / isolation / performance).

| File | Produced by | Purpose |
|------|-------------|---------|
| `isolation-results.json` | `backend`: `npm run test:isolation` | Multi-tenant auth, RLS, and RBAC test cases (pass/fail + messages) |
| `load-results.json` | `backend`: `npm run test:load` | Telemetry ingest latency/throughput smoke results |

## How to regenerate

API must be reachable at `http://localhost:4000` (Compose or local `npm run dev`).

```bash
cd backend
npm run test:isolation
npm run generate:telemetry   # optional warm-up for live demos
npm run test:load
# or
npm run test:evidence
```

Scripts write/overwrite the JSON files under `docs/evidence/`. Commit updated results only when you intend to freeze a thesis evidence snapshot.

## Note

These files are **not** secrets. Seed credentials used by the scripts are the documented demo password `Password123!` only.
