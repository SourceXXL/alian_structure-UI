import type { MetricsPanelDefinition } from './types';

// Panels are intentionally predefined to avoid arbitrary PromQL execution from the browser.
// Add panels here as you introduce new business/system KPIs.
export const METRICS_PANELS: MetricsPanelDefinition[] = [
  {
    id: 'sys_http_request_rate',
    group: 'system',
    title: 'HTTP request rate',
    description: 'Requests per second (all routes).',
    unit: 'rate_per_s',
    promqlRange: 'sum(rate(http_requests_total[5m]))',
  },
  {
    id: 'sys_http_error_rate',
    group: 'system',
    title: 'HTTP error rate',
    description: '5xx requests per second.',
    unit: 'rate_per_s',
    promqlRange: 'sum(rate(http_requests_total{status=~"5.."}[5m]))',
  },
  {
    id: 'sys_http_p95_latency_ms',
    group: 'system',
    title: 'HTTP p95 latency',
    description: '95th percentile latency (ms).',
    unit: 'ms',
    promqlRange:
      'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000',
  },
  {
    id: 'sys_process_cpu_percent',
    group: 'system',
    title: 'Process CPU',
    description: 'CPU usage percent (process-level).',
    unit: 'percent',
    promqlRange: 'avg(rate(process_cpu_seconds_total[5m])) * 100',
  },
  {
    id: 'sys_process_memory_bytes',
    group: 'system',
    title: 'Process memory',
    description: 'Resident memory bytes.',
    unit: 'bytes',
    promqlRange: 'avg(process_resident_memory_bytes)',
  },
  {
    id: 'biz_agent_invocations_rate',
    group: 'business',
    title: 'Agent invocations',
    description: 'Invocation rate per second across all agents.',
    unit: 'rate_per_s',
    promqlRange: 'sum(rate(agent_invocations_total[5m]))',
  },
  {
    id: 'biz_agent_success_rate_percent',
    group: 'business',
    title: 'Agent success rate',
    description: 'Success rate percent.',
    unit: 'percent',
    promqlRange:
      '(sum(rate(agent_invocations_total{status="success"}[5m])) / clamp_min(sum(rate(agent_invocations_total[5m])), 1e-9)) * 100',
  },
  {
    id: 'biz_revenue_xlm_rate',
    group: 'business',
    title: 'Revenue rate',
    description: 'Revenue per second (XLM).',
    unit: 'xlm',
    promqlRange: 'sum(rate(agent_revenue_xlm_total[5m]))',
  },
];

export function getPanel(panelId: string): MetricsPanelDefinition | null {
  return METRICS_PANELS.find((p) => p.id === panelId) || null;
}

