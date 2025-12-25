// Aging Calculations Utilities
// Helper functions for calculating aging, payment status, and retry schedules

import type { 
  AgingBucket, 
  PaymentStatus, 
  PaymentRetryPolicy,
  AmountBasedRetryPolicy,
  PaymentRetrySettings,
  Subscription,
  Invoice
} from '../types/billing';

// ============================================================================
// AGING CALCULATIONS
// ============================================================================

/**
 * Calculate the number of days overdue from a due date
 * @param dueDate - The due date string (ISO format or parseable date string)
 * @returns Number of days overdue (0 if not overdue)
 */
export function calculateDaysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  
  const due = new Date(dueDate);
  const now = new Date();
  
  // Reset time to midnight for accurate day calculation
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Determine the aging bucket based on days overdue
 * @param daysOverdue - Number of days overdue
 * @returns The aging bucket classification
 */
export function getAgingBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue === 0) return 'Current';
  if (daysOverdue <= 30) return '1-30';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
}

/**
 * Determine payment status based on days overdue and failed attempts
 * @param daysOverdue - Number of days overdue
 * @param failedAttempts - Number of failed payment attempts
 * @param isRetrying - Whether payment retry is in progress
 * @returns The payment status classification
 */
export function getPaymentStatus(
  daysOverdue: number, 
  failedAttempts: number = 0,
  isRetrying: boolean = false
): PaymentStatus {
  if (daysOverdue === 0 && failedAttempts === 0) return 'Current';
  if (failedAttempts > 0 && isRetrying) return 'Payment Issue';
  if (failedAttempts > 0) return 'Payment Failed';
  if (daysOverdue > 0) return 'Past Due';
  return 'Current';
}

// ============================================================================
// COLOR & STYLING
// ============================================================================

/**
 * Get ADA-compliant colors for an aging bucket
 * Includes multiple visual indicators beyond just color
 */
export function getAgingColors(bucket: AgingBucket): {
  badge: string;
  badgeBorder: string;
  row: string;
  text: string;
  icon: string;
} {
  const colors = {
    'Current': {
      badge: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      badgeBorder: 'border border-green-300 dark:border-green-700',
      row: 'bg-white dark:bg-gray-900',
      text: 'text-gray-900 dark:text-gray-100',
      icon: '🟢'
    },
    '1-30': {
      badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      badgeBorder: 'border border-yellow-300 dark:border-yellow-700',
      row: 'bg-yellow-50/30 dark:bg-yellow-900/10',
      text: 'text-gray-900 dark:text-gray-100',
      icon: '🟡'
    },
    '31-60': {
      badge: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      badgeBorder: 'border border-orange-300 dark:border-orange-700',
      row: 'bg-orange-50/30 dark:bg-orange-900/10',
      text: 'text-gray-900 dark:text-gray-100',
      icon: '🟠'
    },
    '61-90': {
      badge: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      badgeBorder: 'border border-red-300 dark:border-red-700',
      row: 'bg-red-50/30 dark:bg-red-900/10',
      text: 'text-gray-900 dark:text-gray-100',
      icon: '🔴'
    },
    '90+': {
      badge: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      badgeBorder: 'border-2 border-red-400 dark:border-red-600', // Thicker border for critical status
      row: 'bg-red-50/40 dark:bg-red-900/15',
      text: 'text-gray-900 dark:text-gray-100',
      icon: '🔴'
    }
  };
  
  return colors[bucket];
}

/**
 * Get colors for payment status badges
 * Traffic light system: Green → Yellow → Orange → Red → Final statuses
 */
export function getPaymentStatusColors(status: PaymentStatus): {
  badge: string;
  icon: string;
} {
  const colors = {
    // Active/Warning Statuses - Traffic Light System 🚦
    'Current': {
      badge: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700',
      icon: '✅'
    },
    'Past Due': {
      badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700',
      icon: '⏰'
    },
    'Payment Issue': {
      badge: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700',
      icon: '🔄'
    },
    'Payment Failed': {
      badge: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700',
      icon: '❌'
    },
    
    // Final/Closed Statuses (Manual)
    'Suspended': {
      badge: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-400 dark:border-amber-600',
      icon: '⏸️'
    },
    'Canceled': {
      badge: 'bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600',
      icon: '⛔'
    },
    'In Collections': {
      badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border border-purple-400 dark:border-purple-600',
      icon: '📞'
    },
    'Written Off': {
      badge: 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600',
      icon: '📝'
    }
  };
  
  return colors[status];
}

// ============================================================================
// RETRY POLICY CALCULATIONS
// ============================================================================

/**
 * Get the applicable retry policy for a subscription
 * Considers both global settings and subscription-specific overrides
 */
export function getApplicableRetryPolicy(
  subscription: Subscription,
  globalSettings: PaymentRetrySettings
): PaymentRetryPolicy {
  // Check if subscription has custom retry policy
  if (subscription.customRetryPolicy?.enabled) {
    return subscription.customRetryPolicy.policy;
  }
  
  // Check if amount-based policy applies
  if (globalSettings.amountBasedPolicies.length > 0) {
    // Find the highest threshold that the subscription amount meets
    const applicablePolicy = globalSettings.amountBasedPolicies
      .filter(policy => subscription.amount >= policy.threshold)
      .sort((a, b) => b.threshold - a.threshold)[0];
    
    if (applicablePolicy) {
      return {
        retry1Days: applicablePolicy.retry1Days,
        retry2Days: applicablePolicy.retry2Days,
        retry3Days: applicablePolicy.retry3Days,
        finalAction: applicablePolicy.finalAction,
      };
    }
  }
  
  // Use default policy
  return globalSettings.defaultPolicy;
}

/**
 * Calculate the next retry date based on retry policy and attempt number
 * @param failureDate - Date of the failed payment attempt
 * @param attemptNumber - Which retry attempt (1, 2, or 3)
 * @param retryPolicy - The retry policy to use
 * @returns ISO date string for next retry, or null if no more retries
 */
export function calculateNextRetryDate(
  failureDate: string,
  attemptNumber: number,
  retryPolicy: PaymentRetryPolicy
): string | null {
  if (attemptNumber > 3) return null;
  
  const failure = new Date(failureDate);
  let daysToAdd = 0;
  
  switch (attemptNumber) {
    case 1:
      daysToAdd = retryPolicy.retry1Days;
      break;
    case 2:
      daysToAdd = retryPolicy.retry1Days + retryPolicy.retry2Days;
      break;
    case 3:
      daysToAdd = retryPolicy.retry1Days + retryPolicy.retry2Days + retryPolicy.retry3Days;
      break;
    default:
      return null;
  }
  
  const nextRetry = new Date(failure);
  nextRetry.setDate(nextRetry.getDate() + daysToAdd);
  
  return nextRetry.toISOString().split('T')[0];
}

/**
 * Get a human-readable description of the retry schedule
 */
export function getRetryScheduleDescription(retryPolicy: PaymentRetryPolicy): string[] {
  return [
    `First retry: ${retryPolicy.retry1Days} days after initial failure`,
    `Second retry: ${retryPolicy.retry1Days + retryPolicy.retry2Days} days after initial failure`,
    `Third retry: ${retryPolicy.retry1Days + retryPolicy.retry2Days + retryPolicy.retry3Days} days after initial failure`,
    `After all retries fail: ${getFinalActionDescription(retryPolicy.finalAction)}`
  ];
}

/**
 * Get human-readable description of final action
 */
export function getFinalActionDescription(action: FinalAction): string {
  const descriptions = {
    'pause': 'Pause subscription until payment is resolved',
    'cancel': 'Cancel subscription automatically',
    'keep-active': 'Keep subscription active (manual follow-up required)'
  };
  
  return descriptions[action];
}

// ============================================================================
// AGING SUMMARY CALCULATIONS
// ============================================================================

/**
 * Calculate aging summary from a list of subscriptions and invoices
 */
export function calculateAgingSummary(
  subscriptions: Subscription[],
  invoices: Invoice[]
): {
  current: { count: number; amount: number };
  bucket_1_30: { count: number; amount: number };
  bucket_31_60: { count: number; amount: number };
  bucket_61_90: { count: number; amount: number };
  bucket_90_plus: { count: number; amount: number };
  totalAccountsReceivable: number;
  totalOverdue: number;
  overduePercentage: number;
} {
  const summary = {
    current: { count: 0, amount: 0 },
    bucket_1_30: { count: 0, amount: 0 },
    bucket_31_60: { count: 0, amount: 0 },
    bucket_61_90: { count: 0, amount: 0 },
    bucket_90_plus: { count: 0, amount: 0 },
    totalAccountsReceivable: 0,
    totalOverdue: 0,
    overduePercentage: 0,
  };
  
  // Process subscriptions
  subscriptions.forEach(sub => {
    const bucket = sub.agingBucket;
    const amount = sub.overdueAmount || sub.amount;
    
    summary.totalAccountsReceivable += amount;
    
    if (bucket === 'Current') {
      summary.current.count++;
      summary.current.amount += amount;
    } else {
      summary.totalOverdue += amount;
      
      if (bucket === '1-30') {
        summary.bucket_1_30.count++;
        summary.bucket_1_30.amount += amount;
      } else if (bucket === '31-60') {
        summary.bucket_31_60.count++;
        summary.bucket_31_60.amount += amount;
      } else if (bucket === '61-90') {
        summary.bucket_61_90.count++;
        summary.bucket_61_90.amount += amount;
      } else if (bucket === '90+') {
        summary.bucket_90_plus.count++;
        summary.bucket_90_plus.amount += amount;
      }
    }
  });
  
  // Process unpaid invoices
  invoices.filter(inv => inv.status !== 'Paid').forEach(inv => {
    const bucket = inv.agingBucket;
    const amount = inv.amountDue;
    
    summary.totalAccountsReceivable += amount;
    
    if (bucket === 'Current') {
      summary.current.count++;
      summary.current.amount += amount;
    } else {
      summary.totalOverdue += amount;
      
      if (bucket === '1-30') {
        summary.bucket_1_30.count++;
        summary.bucket_1_30.amount += amount;
      } else if (bucket === '31-60') {
        summary.bucket_31_60.count++;
        summary.bucket_31_60.amount += amount;
      } else if (bucket === '61-90') {
        summary.bucket_61_90.count++;
        summary.bucket_61_90.amount += amount;
      } else if (bucket === '90+') {
        summary.bucket_90_plus.count++;
        summary.bucket_90_plus.amount += amount;
      }
    }
  });
  
  // Calculate overdue percentage
  if (summary.totalAccountsReceivable > 0) {
    summary.overduePercentage = (summary.totalOverdue / summary.totalAccountsReceivable) * 100;
  }
  
  return summary;
}

// ============================================================================
// DATA ENRICHMENT
// ============================================================================

/**
 * Enrich a subscription with calculated aging fields
 */
export function enrichSubscriptionWithAging(
  subscription: Partial<Subscription>
): Subscription {
  const daysOverdue = calculateDaysOverdue(subscription.nextPaymentDate || null);
  const agingBucket = getAgingBucket(daysOverdue);
  const paymentStatus = getPaymentStatus(
    daysOverdue, 
    subscription.failedAttempts || 0,
    !!subscription.nextRetryDate
  );
  
  return {
    ...subscription,
    daysOverdue,
    agingBucket,
    paymentStatus,
    overdueAmount: daysOverdue > 0 ? (subscription.overdueAmount || subscription.amount || 0) : 0,
    failedAttempts: subscription.failedAttempts || 0,
    paymentHistory: subscription.paymentHistory || [],
  } as Subscription;
}

/**
 * Enrich an invoice with calculated aging fields
 */
export function enrichInvoiceWithAging(
  invoice: Partial<Invoice>
): Invoice {
  const daysOverdue = calculateDaysOverdue(invoice.dueDate || null);
  const agingBucket = getAgingBucket(daysOverdue);
  const paymentStatus = invoice.status === 'Paid' 
    ? 'Current' 
    : getPaymentStatus(daysOverdue);
  
  return {
    ...invoice,
    daysOverdue,
    agingBucket,
    paymentStatus,
    reminderCount: invoice.reminderCount || 0,
  } as Invoice;
}