/**
 * Local WebSocket telemetry broadcaster for development.
 * Role is taken from query: ws://127.0.0.1:3456?role=operator
 *
 * Run: npm run telemetry:ws
 */
import { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.TELEMETRY_WS_PORT || '3456', 10);

const EVENT_TYPES = ['heartbeat', 'status', 'error', 'task_started', 'task_completed'];
const SEVERITIES = ['debug', 'info', 'warn', 'error', 'critical'];
const AGENTS = ['agent_a7f3', 'agent_b2c9', 'agent_m1k4'];

let seq = 0;

function buildEvent() {
  seq += 1;
  const type = EVENT_TYPES[seq % EVENT_TYPES.length];
  const severity = SEVERITIES[seq % SEVERITIES.length];
  const agentRef = AGENTS[seq % AGENTS.length];
  return {
    id: `srv-${Date.now()}-${seq}`,
    ts: Date.now(),
    agentRef,
    type,
    severity,
    payload: {
      correlationId: `corr_${(seq % 4096).toString(16)}`,
      taskKind: 'embedding_batch',
      state: type === 'status' ? 'running' : 'idle',
      code: type === 'error' ? 'E_TIMEOUT' : undefined,
      message:
        type === 'error'
          ? 'Dependency timeout — retry scheduled'
          : type === 'heartbeat'
            ? 'alive'
            : 'ok',
    },
  };
}

function forRole(event, role) {
  if (
    role === 'viewer' &&
    (event.type === 'error' || event.severity === 'error' || event.severity === 'critical')
  ) {
    return {
      ...event,
      payload: {
        code: event.payload?.code,
        message: '[details restricted for your role]',
      },
    };
  }
  return event;
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws, req) => {
  let role = 'viewer';
  try {
    const u = new URL(req.url || '/', 'http://localhost');
    const r = u.searchParams.get('role');
    if (r === 'operator' || r === 'admin') role = r;
  } catch {
    /* default viewer */
  }

  ws.send(JSON.stringify({ type: 'telemetry_welcome', role, ts: Date.now() }));

  const iv = setInterval(() => {
    if (ws.readyState !== 1) return;
    const ev = forRole(buildEvent(), role);
    ws.send(JSON.stringify(ev));
  }, 2000);

  ws.on('close', () => clearInterval(iv));
});

// eslint-disable-next-line no-console
console.log(`Telemetry WebSocket listening on ws://127.0.0.1:${PORT}`);
