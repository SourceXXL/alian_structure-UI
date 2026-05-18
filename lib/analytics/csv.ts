import { AnalyticsDataset } from './types';

function csvEscape(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function analyticsToCsv(dataset: AnalyticsDataset): string {
  const header = [
    'date',
    'contractInvocations',
    'successRate',
    'avgExecutionCostXlm',
    'xlmRevenue',
    'transactionFrequency',
    'uniqueAccounts',
  ];

  const rows = dataset.timeSeries.map((point) => [
    point.date,
    point.contractInvocations,
    point.successRate.toFixed(2),
    point.avgExecutionCostXlm.toFixed(7),
    point.xlmRevenue.toFixed(7),
    point.transactionFrequency.toFixed(2),
    point.uniqueAccounts,
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => csvEscape(value)).join(','))
    .join('\n');
}
