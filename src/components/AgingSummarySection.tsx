import { AlertCircle, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { calculateAgingSummary } from '../utils/agingCalculations';
import type { Subscription, Invoice } from '../types/billing';

type AgingSummarySectionProps = {
  subscriptions: Subscription[];
  invoices?: Invoice[];
  formatCurrency: (amount: number) => string;
};

export function AgingSummarySection({ subscriptions, invoices = [], formatCurrency }: AgingSummarySectionProps) {
  const summary = calculateAgingSummary(subscriptions, invoices);
  
  // Count payment statuses from subscriptions
  const paymentStatusCounts = subscriptions.reduce((acc, sub) => {
    const status = sub.paymentStatus || 'Current';
    if (status === 'Payment Failed') acc.failed++;
    else if (status === 'In Dunning') acc.retry_pending++;
    else if (status === 'Past Due') acc.overdue++;
    else acc.current++;
    return acc;
  }, { failed: 0, retry_pending: 0, overdue: 0, current: 0 });

  const agingCards = [
    {
      bucket: 'current',
      label: 'Current',
      count: summary.current.count,
      amount: summary.current.amount,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bgColor: 'rgb(240, 253, 244)',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      bucket: '1-30',
      label: '1-30 Days',
      count: summary.bucket_1_30.count,
      amount: summary.bucket_1_30.amount,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bgColor: 'rgb(254, 252, 232)',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    },
    {
      bucket: '31-60',
      label: '31-60 Days',
      count: summary.bucket_31_60.count,
      amount: summary.bucket_31_60.amount,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      bgColor: 'rgb(255, 247, 237)',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-700'
    },
    {
      bucket: '61-90',
      label: '61-90 Days',
      count: summary.bucket_61_90.count,
      amount: summary.bucket_61_90.amount,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bgColor: 'rgb(254, 242, 242)',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700'
    },
    {
      bucket: '90+',
      label: '90+ Days',
      count: summary.bucket_90_plus.count,
      amount: summary.bucket_90_plus.amount,
      icon: <XCircle className="w-5 h-5 text-red-800" />,
      bgColor: 'rgb(248, 113, 113, 0.1)',
      textColor: 'text-red-800 dark:text-red-200',
      borderColor: 'border-red-300 dark:border-red-600'
    }
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Aging Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aging Summary</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Overdue: {formatCurrency(summary.totalOverdue)} 
            <span className="mx-2">•</span>
            {summary.bucket_1_30.count + summary.bucket_31_60.count + summary.bucket_61_90.count + summary.bucket_90_plus.count} subscriptions
          </p>
        </div>
      </div>

      {/* Aging Buckets Grid */}
      <div className="grid grid-cols-5 gap-4">
        {agingCards.map((card) => (
          <Card
            key={card.bucket}
            className={`p-4 border ${card.borderColor} hover:shadow-md transition-all`}
            style={{ backgroundColor: card.bgColor }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                  {card.label}
                </p>
                <p className={`text-2xl ${card.textColor}`}>
                  {formatCurrency(card.amount)}
                </p>
              </div>
              <div>{card.icon}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${card.textColor} ${card.borderColor} text-xs`}>
                {card.count} {card.count === 1 ? 'subscription' : 'subscriptions'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Failed Payments
              </p>
              <p className="text-xl text-gray-900 dark:text-gray-100">
                {paymentStatusCounts.failed}
              </p>
            </div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Retry Pending
              </p>
              <p className="text-xl text-gray-900 dark:text-gray-100">
                {paymentStatusCounts.retry_pending}
              </p>
            </div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Overdue
              </p>
              <p className="text-xl text-gray-900 dark:text-gray-100">
                {paymentStatusCounts.overdue}
              </p>
            </div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Current
              </p>
              <p className="text-xl text-gray-900 dark:text-gray-100">
                {paymentStatusCounts.current}
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </Card>
      </div>
    </div>
  );
}