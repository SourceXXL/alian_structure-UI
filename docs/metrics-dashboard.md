# Metrics dashboard (system + business)

Dashboard for viewing **system** and **business** metrics with **Prometheus / OpenTelemetry** compatibility and **PII-safe** display.

## Route

- `/dashboard`

## Features

- **Charts + tables**: time-series line charts and a “latest value” table per panel.
- **Custom business metric views**: add predefined panels in `lib/metrics/panels.ts`.
- **Integration**:
  - Prometheus HTTP API (`/api/v1/query_range`)
  - OpenTelemetry Collector via Prometheus exporter (same HTTP API shape)
- **Filtering**: client-side filter by series name (derived from **sanitized** labels).
- **Export**: CSV export of the currently visible series.

## Configuration

Set one of these server-side environment variables (do **not** use `NEXT_PUBLIC_`):

```env
METRICS_PROMETHEUS_BASE_URL=http://localhost:9090
# or
METRICS_OTEL_PROMETHEUS_BASE_URL=http://localhost:9464
```

If neither is set, the dashboard uses **mock metrics** so the UI works out-of-the-box.

## No PII policy

This dashboard is **defense-in-depth**:

- API layer sanitizes Prometheus label sets in `lib/metrics/sanitize.ts`:
  - Drops sensitive label keys (e.g. `email`, `user_id`, `instance`, `ip`, `wallet`, etc.)
  - Scrubs label values that look like emails, IPs, Stellar addresses, or long secrets.
- UI only displays the derived `seriesName` (built from sanitized labels).

**Important**: Frontend sanitization is not a substitute for server-side governance. Ensure your metrics pipeline never emits PII.

## Adding a new metric panel

Edit `lib/metrics/panels.ts` and add a new entry:

- `id`: stable identifier
- `group`: `system` or `business`
- `title` / `description`
- `promqlRange`: a safe PromQL query

Panels are predefined to avoid arbitrary PromQL execution from browsers.

## Acceptance mapping

| Criterion | Implementation |
|----------|----------------|
| All major metrics are visualized | System + business panel groups in `/dashboard` |
| No PII in any metric | Label sanitizer + UI only renders sanitized series names |
| Export and filtering work | Series name filter + CSV export |
| Documentation complete | This document |

