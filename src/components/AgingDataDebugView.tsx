import { Badge } from './ui/badge';
import { Card } from './ui/card';
import type { Subscription } from '../types/billing';

type AgingDataDebugViewProps = {
  subscriptions: Subscription[];
};

export function AgingDataDebugView({ subscriptions }: AgingDataDebugViewProps) {
  // Group subscriptions by aging bucket
  const current = subscriptions.filter(s => s.agingBucket === 'Current');
  const bucket_1_30 = subscriptions.filter(s => s.agingBucket === '1-30');
  const bucket_31_60 = subscriptions.filter(s => s.agingBucket === '31-60');
  const bucket_61_90 = subscriptions.filter(s => s.agingBucket === '61-90');
  const bucket_90_plus = subscriptions.filter(s => s.agingBucket === '90+');

  // Debug: Show all buckets found
  const allBuckets = subscriptions.map(s => ({
    client: s.client,
    bucket: s.agingBucket,
    daysOverdue: s.daysOverdue,
    nextPaymentDate: s.nextPaymentDate
  }));

  const renderSubscriptionList = (subs: Subscription[], color: string) => {
    if (subs.length === 0) {
      return <p className="text-sm text-gray-400 italic">None</p>;
    }
    
    return (
      <div className="space-y-2">
        {subs.map(sub => (
          <div key={sub.id} className="text-sm space-y-1 border-b border-gray-100 dark:border-gray-800 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{sub.client}</p>
                <p className="text-gray-600 dark:text-gray-400">{sub.planName} - ${sub.amount}/{sub.frequency}</p>
              </div>
              <Badge className={color}>
                {sub.paymentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Status: {sub.status}</span>
              <span>Days Overdue: {sub.daysOverdue}</span>
              <span>Next Payment: {sub.nextPaymentDate || 'N/A'}</span>
              {sub.failedAttempts > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  Failed Attempts: {sub.failedAttempts}
                </span>
              )}
              {sub.nextRetryDate && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  Next Retry: {sub.nextRetryDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6 mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10 max-h-[600px] overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          🔍 Aging Data Debug View
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This shows the detailed breakdown of subscriptions in each aging bucket
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {subscriptions.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Subscriptions</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-green-600">
              {current.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-red-600">
              {bucket_1_30.length + bucket_31_60.length + bucket_61_90.length + bucket_90_plus.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          </div>
        </div>
      </div>

      {/* Raw Debug Data - Collapsible */}
      <details className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
          🐛 Raw Bucket Data (Click to expand)
        </summary>
        <pre className="mt-2 overflow-x-auto text-[10px]">
          {JSON.stringify(allBuckets, null, 2)}
        </pre>
      </details>

      <div className="space-y-4">
        {/* Current */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🟢</span>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Current ({current.length})
            </h4>
          </div>
          {renderSubscriptionList(current, 'bg-green-100 text-green-700 border-green-300')}
        </div>

        {/* 1-30 Days */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🟡</span>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              1-30 Days Overdue ({bucket_1_30.length})
            </h4>
          </div>
          {renderSubscriptionList(bucket_1_30, 'bg-yellow-100 text-yellow-700 border-yellow-300')}
        </div>

        {/* 31-60 Days */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🟠</span>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              31-60 Days Overdue ({bucket_31_60.length})
            </h4>
          </div>
          {renderSubscriptionList(bucket_31_60, 'bg-orange-100 text-orange-700 border-orange-300')}
        </div>

        {/* 61-90 Days */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔴</span>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              61-90 Days Overdue ({bucket_61_90.length})
            </h4>
          </div>
          {renderSubscriptionList(bucket_61_90, 'bg-red-100 text-red-700 border-red-300')}
        </div>

        {/* 90+ Days */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔴</span>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              90+ Days Overdue ({bucket_90_plus.length})
            </h4>
          </div>
          {renderSubscriptionList(bucket_90_plus, 'bg-red-100 text-red-700 border-red-300')}
        </div>
      </div>
    </Card>
  );
}