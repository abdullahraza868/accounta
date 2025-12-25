// Aging System Test View - Visual Review of Phase 1 & 2
// This page shows all the aging system functionality in action

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  calculateDaysOverdue,
  getAgingBucket,
  getPaymentStatus,
  getAgingColors,
  getPaymentStatusColors,
  getApplicableRetryPolicy,
  calculateNextRetryDate,
  calculateAgingSummary,
  getRetryScheduleDescription
} from '../../utils/agingCalculations';

import {
  generateMockSubscriptions,
  generateMockInvoices,
  mockPaymentRetrySettings
} from '../../utils/mockAgingData';

import type { AgingBucket, PaymentStatus } from '../../types/billing';

export default function AgingSystemTestView() {
  const subscriptions = generateMockSubscriptions();
  const invoices = generateMockInvoices();
  const summary = calculateAgingSummary(subscriptions, invoices);

  // Get overdue subscriptions for demonstration
  const overdueSubscriptions = subscriptions
    .filter(s => s.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Test aging calculation with different dates
  const testDates = [
    { desc: 'Due in 15 days', date: '2025-12-17' },
    { desc: 'Due today', date: '2025-12-02' },
    { desc: '15 days overdue', date: '2025-11-17' },
    { desc: '45 days overdue', date: '2025-10-18' },
    { desc: '75 days overdue', date: '2025-09-18' },
    { desc: '100 days overdue', date: '2025-08-24' }
  ];

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-purple-600 dark:text-purple-400 mb-2">
            Aging System - Phase 1 & 2 Review
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visual demonstration of all aging calculation features
          </p>
        </div>

        {/* Section 1: Aging Summary Stats */}
        <Card className="p-6">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            📊 Aging Summary (All Subscriptions + Invoices)
          </h2>
          
          <div className="grid grid-cols-5 gap-4">
            {/* Current */}
            <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <div className="text-3xl mb-2">🟢</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</div>
              <div className="text-2xl mb-1">${summary.current.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summary.current.count} items</div>
            </Card>

            {/* 1-30 Days */}
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl mb-2">🟡</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">1-30 Days</div>
              <div className="text-2xl mb-1">${summary.bucket_1_30.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summary.bucket_1_30.count} items</div>
            </Card>

            {/* 31-60 Days */}
            <Card className="p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800">
              <div className="text-3xl mb-2">🟠</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">31-60 Days</div>
              <div className="text-2xl mb-1">${summary.bucket_31_60.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summary.bucket_31_60.count} items</div>
            </Card>

            {/* 61-90 Days */}
            <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">61-90 Days</div>
              <div className="text-2xl mb-1">${summary.bucket_61_90.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summary.bucket_61_90.count} items</div>
            </Card>

            {/* 90+ Days */}
            <Card className="p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600">
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">90+ Days ⚠️</div>
              <div className="text-2xl mb-1">${summary.bucket_90_plus.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{summary.bucket_90_plus.count} items</div>
            </Card>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total AR</div>
                <div className="text-2xl">${summary.totalAccountsReceivable.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Overdue</div>
                <div className="text-2xl text-red-600">${summary.totalOverdue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue %</div>
                <div className="text-2xl text-red-600">{summary.overduePercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Aging Calculation Examples */}
        <Card className="p-6">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            🧮 Aging Calculation Examples
          </h2>
          
          <div className="space-y-3">
            {testDates.map(({ desc, date }) => {
              const days = calculateDaysOverdue(date);
              const bucket = getAgingBucket(days);
              const colors = getAgingColors(bucket);
              
              return (
                <div key={date} className={`p-4 rounded-lg ${colors.row}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{colors.icon}</div>
                      <div>
                        <div className="font-medium">{desc}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Due date: {date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${colors.badge} ${colors.badgeBorder}`}>
                        {bucket}
                      </Badge>
                      <div className="text-right">
                        <div className="font-medium">{days} days</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {days === 0 ? 'Current' : 'Overdue'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Section 3: Payment Status Examples */}
        <Card className="p-6">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            💳 Payment Status Logic
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { desc: 'Current - No Issues', daysOverdue: 0, failedAttempts: 0, isRetrying: false },
              { desc: 'Past Due - No Failures', daysOverdue: 15, failedAttempts: 0, isRetrying: false },
              { desc: 'In Active Dunning', daysOverdue: 8, failedAttempts: 2, isRetrying: true },
              { desc: 'Payment Failed', daysOverdue: 45, failedAttempts: 3, isRetrying: false }
            ].map((scenario, idx) => {
              const status = getPaymentStatus(scenario.daysOverdue, scenario.failedAttempts, scenario.isRetrying);
              const colors = getPaymentStatusColors(status);
              
              return (
                <Card key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{colors.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium mb-2">{scenario.desc}</div>
                      <Badge className={colors.badge}>
                        {status}
                      </Badge>
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Days overdue: {scenario.daysOverdue}</div>
                        <div>Failed attempts: {scenario.failedAttempts}</div>
                        <div>Retrying: {scenario.isRetrying ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Section 4: Retry Policy Configuration */}
        <Card className="p-6">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            📅 Retry Policy Configuration
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Default Policy */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-3">Default Policy (All Subscriptions)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 1:</span>
                  <span>{mockPaymentRetrySettings.defaultPolicy.retry1Days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 2:</span>
                  <span>{mockPaymentRetrySettings.defaultPolicy.retry2Days} days after first</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 3:</span>
                  <span>{mockPaymentRetrySettings.defaultPolicy.retry3Days} days after second</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between font-medium">
                    <span>Total Window:</span>
                    <span>
                      {mockPaymentRetrySettings.defaultPolicy.retry1Days + 
                       mockPaymentRetrySettings.defaultPolicy.retry2Days + 
                       mockPaymentRetrySettings.defaultPolicy.retry3Days} days
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Final Action:</span>
                  <span className="capitalize">{mockPaymentRetrySettings.defaultPolicy.finalAction}</span>
                </div>
              </div>
            </Card>

            {/* Amount-Based Override */}
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-medium mb-3">Amount-Based Override ($1000+)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 1:</span>
                  <span>{mockPaymentRetrySettings.amountBasedPolicies[0].retry1Days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 2:</span>
                  <span>{mockPaymentRetrySettings.amountBasedPolicies[0].retry2Days} days after first</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retry 3:</span>
                  <span>{mockPaymentRetrySettings.amountBasedPolicies[0].retry3Days} days after second</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between font-medium">
                    <span>Total Window:</span>
                    <span>
                      {mockPaymentRetrySettings.amountBasedPolicies[0].retry1Days + 
                       mockPaymentRetrySettings.amountBasedPolicies[0].retry2Days + 
                       mockPaymentRetrySettings.amountBasedPolicies[0].retry3Days} days
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Final Action:</span>
                  <span className="capitalize">{mockPaymentRetrySettings.amountBasedPolicies[0].finalAction}</span>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Section 5: Overdue Subscriptions (Real Data) */}
        <Card className="p-6">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            ⚠️ Overdue Subscriptions ({overdueSubscriptions.length} items)
          </h2>
          
          <div className="space-y-3">
            {overdueSubscriptions.map(sub => {
              const agingColors = getAgingColors(sub.agingBucket);
              const statusColors = getPaymentStatusColors(sub.paymentStatus);
              
              return (
                <Card key={sub.id} className={`p-4 ${agingColors.row}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{agingColors.icon}</div>
                      <div>
                        <div className="font-medium">{sub.client}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{sub.planName}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={statusColors.badge}>
                            {statusColors.icon} {sub.paymentStatus}
                          </Badge>
                          <Badge className={`${agingColors.badge} ${agingColors.badgeBorder}`}>
                            {sub.agingBucket}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-medium">${sub.amount}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {sub.daysOverdue} days overdue
                      </div>
                      {sub.failedAttempts > 0 && (
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {sub.failedAttempts} failed attempt{sub.failedAttempts !== 1 ? 's' : ''}
                        </div>
                      )}
                      {sub.nextRetryDate && (
                        <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          Retry: {sub.nextRetryDate}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-purple-50 dark:bg-purple-900/10">
          <h2 className="text-purple-600 dark:text-purple-400 mb-4">
            ✅ Phase 1 & 2 Complete
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Type definitions with 15+ new types</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>15+ calculation utility functions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Mock data: 10 subscriptions + 8 invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>ADA-compliant color system</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Intelligent retry policy selection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Comprehensive documentation</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Ready for Phase 3:</strong> UI Components - Add aging columns to SubscriptionsView table, create "Aging" tab in BillingView, implement stat cards
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
