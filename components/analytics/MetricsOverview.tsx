import { AnalyticsDataset } from '@/lib/analytics/types';
import Card from '@/components/Card';

function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function MetricsOverview({ dataset }: { dataset: AnalyticsDataset }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card>
        <p className="text-sm text-gray-400 mb-1">Total Contract Invocations</p>
        <p className="text-3xl font-bold glow-text">{formatNumber(dataset.totals.totalContractInvocations, 0)}</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-400 mb-1">Success Rate</p>
        <p className="text-3xl font-bold text-cosmic-cyan">{formatNumber(dataset.totals.successRate)}%</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-400 mb-1">Avg Execution Cost</p>
        <p className="text-3xl font-bold text-cosmic-purple">{formatNumber(dataset.totals.avgExecutionCostXlm, 7)} XLM</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-400 mb-1">XLM Revenue</p>
        <p className="text-3xl font-bold text-cosmic-cyan">{formatNumber(dataset.totals.xlmRevenue, 4)} XLM</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-400 mb-1">Unique Accounts</p>
        <p className="text-3xl font-bold glow-text">{formatNumber(dataset.totals.uniqueAccounts, 0)}</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-400 mb-1">Transaction Frequency</p>
        <p className="text-3xl font-bold text-cosmic-purple">{formatNumber(dataset.totals.transactionFrequency, 2)}/day</p>
      </Card>
    </div>
  );
}
