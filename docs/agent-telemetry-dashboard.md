# Agent telemetry dashboard

Live dashboard for agent telemetry over **WebSockets**, with **filters**, **role-based visibility**, and **PII-safe** display.

## Features

- **Event types**: `heartbeat`, `status`, `error`, `task_started`, `task_completed`
- **Severities**: `debug`, `info`, `warn`, `error`, `critical` (viewers cannot select `debug`)
- **Filters**: event type, severity, and per-agent ref (operators and admins only)
- **Roles** (demo: chosen in UI, stored in `sessionStorage`):
  - **Viewer**: stream only; error details masked; no per-agent filter; no export
  - **Operator**: full sanitized error detail, per-agent filter, clear buffer
  - **Admin**: operator capabilities plus JSON export of the **currently visible** (filtered) events

## Sensitive data

- UI only shows **opaque** `agentRef` identifiers (e.g. `agent_a7f3`), not names, emails, or wallet addresses.
- `lib/telemetry/sanitize.ts` strips known sensitive keys and redacts email-like and long base64-like strings from payload values before display.
- **Production**: perform the same scrubbing on the **telemetry gateway** before emit; treat the browser as untrusted.

## WebSocket

1. **Without** `NEXT_PUBLIC_TELEMETRY_WS_URL`, the dashboard uses an in-browser **mock** stream so the page works out of the box.
2. **With** the variable set, the client opens a WebSocket to that URL and appends `?role=<viewer|operator|admin>`.

### Local dev server

```bash
npm run telemetry:ws
```

Default URL: `ws://127.0.0.1:3456`. In `.env.local`:

```env
NEXT_PUBLIC_TELEMETRY_WS_URL=ws://127.0.0.1:3456
```

The dev server sends a one-line `telemetry_welcome` message, then JSON telemetry events every two seconds. **Viewers** receive masked error messages from the server (mirrors client RBAC).

### Production notes

Next.js route handlers do not host long-lived WebSockets on typical serverless hosts. Run a **dedicated telemetry gateway** (or edge WebSocket service), authenticate clients (e.g. JWT), derive **role server-side**, and filter or mask payloads **before** sending.

## HTTP API (capability contract)

- `GET /api/telemetry/session?role=viewer|operator|admin` — returns `{ role, capabilities }`.
- `POST /api/telemetry/session` with JSON `{ "role": "operator" }` — same response.

These endpoints document the capability matrix; in production, replace client-supplied role with verified identity.

## Acceptance mapping

| Criterion | Implementation |
|-----------|------------------|
| Live updates for all event types | Mock stream + dev WS server cycle all types; client accepts any valid `TelemetryEvent` |
| Filtering and access control | `eventMatchesFilters` + `TelemetryCapabilities`; server-side role on dev WS |
| No sensitive data | Sanitizer + opaque agent refs + viewer masking |
| Documentation | This file |

## Route

- App path: `/telemetry`
