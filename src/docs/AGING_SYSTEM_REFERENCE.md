# Aging & Payment Retry System - Developer Reference

## Overview

This document provides a comprehensive reference for the Aging & Payment Retry system implemented in Phase 1 and Phase 2.

---

## 📁 File Structure

```
/types/
  └── billing.ts                 # All type definitions

/utils/
  ├── agingCalculations.ts       # Core calculation utilities
  ├── mockAgingData.ts           # Mock data generators
  └── agingExamples.ts           # Usage examples and tests

/docs/
  └── AGING_SYSTEM_REFERENCE.md  # This file
```

---

## 🎯 Quick Start

### 1. Import Types
```typescript
import type { 
  Subscription, 
  Invoice, 
  AgingBucket, 
  PaymentStatus,
  PaymentRetrySettings 
} from '../types/billing';
```

### 2. Import Utilities
```typescript
import { 
  calculateDaysOverdue,
  getAgingBucket,
  getPaymentStatus,
  getAgingColors,
  enrichSubscriptionWithAging,
  calculateAgingSummary
} from '../utils/agingCalculations';
```

### 3. Use Mock Data
```typescript
import { 
  generateMockSubscriptions, 
  generateMockInvoices,
  mockPaymentRetrySettings
} from '../utils/mockAgingData';

const subscriptions = generateMockSubscriptions();
const invoices = generateMockInvoices();
```

---

## 📊 Core Concepts

### Aging Buckets
Classification of how overdue an invoice or subscription is:

| Bucket | Days Overdue | Severity | Icon |
|--------|--------------|----------|------|
| `Current` | 0 | None | 🟢 |
| `1-30` | 1-30 | Low | 🟡 |
| `31-60` | 31-60 | Medium | 🟠 |
| `61-90` | 61-90 | High | 🔴 |
| `90+` | 90+ | Critical | 🔴 |

### Payment Status
Current state of payment processing:

| Status | Description | Icon |
|--------|-------------|------|
| `Current` | No payment issues | ✅ |
| `Past Due` | Payment overdue, no failed attempts | ⏰ |
| `Payment Failed` | Payment attempts have failed | ❌ |
| `In Dunning` | Active retry process in progress | 🔄 |

### Retry Policy
Configuration for automatic payment retry attempts:

```typescript
{
  retry1Days: 3,      // First retry 3 days after failure
  retry2Days: 5,      // Second retry 5 days after first retry  
  retry3Days: 7,      // Third retry 7 days after second retry
  finalAction: 'pause' | 'cancel' | 'keep-active'
}
```

**Total retry window:** 15 days (3 + 5 + 7)

---

## 🔧 Key Functions

### Calculate Days Overdue
```typescript
const daysOverdue = calculateDaysOverdue('2025-11-15');
// Returns: 17 (if today is Dec 2, 2025)
```

### Get Aging Bucket
```typescript
const bucket = getAgingBucket(45); 
// Returns: '31-60'
```

### Get Payment Status
```typescript
const status = getPaymentStatus(15, 2, true);
// Returns: 'In Dunning'
// (15 days overdue, 2 failed attempts, retry in progress)
```

### Get Colors (ADA Compliant)
```typescript
const colors = getAgingColors('1-30');
// Returns: {
//   badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700...',
//   badgeBorder: 'border border-yellow-300...',
//   row: 'bg-yellow-50/30 dark:bg-yellow-900/10',
//   text: 'text-gray-900 dark:text-gray-100',
//   icon: '🟡'
// }
```

### Enrich Data
```typescript
// Add aging fields to existing subscription data
const enrichedSub = enrichSubscriptionWithAging(rawSubscription);

// Now has: daysOverdue, agingBucket, paymentStatus, overdueAmount
```

### Calculate Summary
```typescript
const summary = calculateAgingSummary(subscriptions, invoices);
// Returns: {
//   current: { count: 15, amount: 45000 },
//   bucket_1_30: { count: 8, amount: 8500 },
//   bucket_31_60: { count: 4, amount: 3200 },
//   bucket_61_90: { count: 2, amount: 1500 },
//   bucket_90_plus: { count: 1, amount: 900 },
//   totalAccountsReceivable: 59100,
//   totalOverdue: 14100,
//   overduePercentage: 23.9
// }
```

### Get Retry Policy
```typescript
// Automatically handles global settings, amount-based overrides, 
// and subscription-specific policies
const policy = getApplicableRetryPolicy(subscription, globalSettings);
```

### Calculate Next Retry Date
```typescript
const nextRetry = calculateNextRetryDate('2025-12-01', 1, policy);
// Returns: '2025-12-04' (for first retry)
```

---

## 🎨 UI Component Patterns

### Table Row with Aging Colors
```tsx
<tr className={getAgingColors(subscription.agingBucket).row}>
  <td>{subscription.client}</td>
  <td>
    <Badge className={`
      ${getAgingColors(subscription.agingBucket).badge}
      ${getAgingColors(subscription.agingBucket).badgeBorder}
    `}>
      {getAgingColors(subscription.agingBucket).icon} {subscription.agingBucket}
    </Badge>
  </td>
  <td>{subscription.daysOverdue} days</td>
</tr>
```

### Payment Status Badge
```tsx
const statusColors = getPaymentStatusColors(subscription.paymentStatus);

<Badge className={statusColors.badge}>
  {statusColors.icon} {subscription.paymentStatus}
</Badge>
```

### Aging Stat Card
```tsx
function AgingStatCard({ bucket, subscriptions, invoices }) {
  const summary = calculateAgingSummary(subscriptions, invoices);
  const colors = getAgingColors(bucket);
  const data = summary[`bucket_${bucket.replace('-', '_')}`];
  
  return (
    <Card className={colors.row}>
      <div className="p-4">
        <div className="text-2xl">{colors.icon}</div>
        <div className="font-medium">{bucket} Days</div>
        <div className="text-sm text-gray-500">
          {data.count} items
        </div>
        <div className="text-xl font-bold">
          ${data.amount.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
```

---

## 📋 Type Reference

### Subscription Type (Enhanced)
```typescript
type Subscription = {
  // Basic fields
  id: string;
  client: string;
  clientId: string;
  clientType: 'Business' | 'Individual';
  planName: string;
  amount: number;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  nextPaymentDate: string | null;
  paymentMethod: 'ACH' | 'Credit Card' | 'Wire' | 'Check' | 'PayPal' | null;
  status: 'Active' | 'Pending First Invoice' | 'Paused' | 'Canceled' | 'Ended';
  
  // NEW: Aging fields
  paymentStatus: PaymentStatus;
  lastSuccessfulPayment: string | null;
  lastPaymentAttempt: string | null;
  failedAttempts: number;
  nextRetryDate: string | null;
  daysOverdue: number;
  agingBucket: AgingBucket;
  overdueAmount: number;
  paymentHistory: PaymentAttempt[];
  
  // Optional custom retry policy
  customRetryPolicy?: {
    enabled: boolean;
    policy: PaymentRetryPolicy;
  };
};
```

### Invoice Type (Enhanced)
```typescript
type Invoice = {
  // Basic fields
  id: string;
  client: string;
  clientId: string;
  clientType: 'Business' | 'Individual';
  invoiceNo: string;
  created: string;
  createdTime: string;
  sentOn: string;
  sentTime: string;
  year: number;
  amountDue: number;
  status: 'Paid' | 'Draft' | 'Overdue' | 'Sent to Client';
  dueDate: string;
  paidAt?: string;
  paidTime?: string;
  paidVia?: PaymentMethod;
  
  // NEW: Aging fields
  daysOverdue: number;
  agingBucket: AgingBucket;
  paymentStatus: PaymentStatus;
  lastReminderSent?: string;
  reminderCount: number;
};
```

---

## 🧪 Testing

Run the examples file to test all functionality:

```typescript
import { runAllExamples } from '../utils/agingExamples';

runAllExamples();
```

This will output:
- Basic aging calculations
- Color and styling examples
- Retry policy logic
- Data enrichment
- Aging summary report
- Mock data usage
- UI component patterns

---

## 🎯 Common Use Cases

### Use Case 1: Display Subscriptions with Aging
```typescript
import { generateMockSubscriptions } from '../utils/mockAgingData';
import { getAgingColors, getPaymentStatusColors } from '../utils/agingCalculations';

const subscriptions = generateMockSubscriptions();

// Filter to show only overdue
const overdueSubscriptions = subscriptions.filter(s => s.daysOverdue > 0);

// Sort by most overdue first
const sortedByAging = [...overdueSubscriptions].sort(
  (a, b) => b.daysOverdue - a.daysOverdue
);

// Render with color coding
sortedByAging.map(sub => {
  const rowColors = getAgingColors(sub.agingBucket);
  const statusColors = getPaymentStatusColors(sub.paymentStatus);
  
  return (
    <tr className={rowColors.row} key={sub.id}>
      {/* ... table cells ... */}
    </tr>
  );
});
```

### Use Case 2: Generate Aging Report
```typescript
import { calculateAgingSummary } from '../utils/agingCalculations';
import { generateMockSubscriptions, generateMockInvoices } from '../utils/mockAgingData';

const subscriptions = generateMockSubscriptions();
const invoices = generateMockInvoices();
const summary = calculateAgingSummary(subscriptions, invoices);

// Display summary
console.log(`Total AR: $${summary.totalAccountsReceivable}`);
console.log(`Total Overdue: $${summary.totalOverdue}`);
console.log(`Overdue %: ${summary.overduePercentage.toFixed(1)}%`);
```

### Use Case 3: Handle Payment Retry
```typescript
import { getApplicableRetryPolicy, calculateNextRetryDate } from '../utils/agingCalculations';
import { mockPaymentRetrySettings } from '../utils/mockAgingData';

function handlePaymentFailure(subscription: Subscription, failureDate: string) {
  const policy = getApplicableRetryPolicy(subscription, mockPaymentRetrySettings);
  const attemptNumber = subscription.failedAttempts + 1;
  
  if (attemptNumber <= 3) {
    const nextRetry = calculateNextRetryDate(failureDate, attemptNumber, policy);
    
    // Update subscription
    return {
      ...subscription,
      failedAttempts: attemptNumber,
      nextRetryDate: nextRetry,
      paymentStatus: 'In Dunning' as const
    };
  } else {
    // All retries exhausted
    return {
      ...subscription,
      failedAttempts: attemptNumber,
      nextRetryDate: null,
      paymentStatus: 'Payment Failed' as const,
      status: policy.finalAction === 'pause' ? 'Paused' as const : subscription.status
    };
  }
}
```

---

## ♿ Accessibility (ADA Compliance)

All color coding includes **multiple visual indicators** beyond just color:

1. **Color backgrounds** - Subtle row backgrounds
2. **Border styles** - Different border weights for severity (90+ has thicker border)
3. **Icons/Emojis** - Visual symbols (🟢 🟡 🟠 🔴)
4. **Text labels** - Explicit status text ("Current", "1-30", etc.)
5. **Tooltips** - Additional context on hover (when implemented)

This ensures the system is usable for:
- Color blind users
- Users with low vision
- Screen reader users
- Users who disable CSS

---

## 🚀 Next Steps (Phase 3+)

Once Phase 1 & 2 are complete, the next phases will add:

- **Phase 3:** UI components (stat cards, tables, tabs)
- **Phase 4:** Aging report generator with export
- **Phase 5:** Settings UI for retry configuration
- **Phase 6:** Notification integration

---

## 📞 Support

For questions or issues with the aging system:
1. Review this reference document
2. Check `/utils/agingExamples.ts` for usage patterns
3. Test with mock data from `/utils/mockAgingData.ts`

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0 (Phase 1 & 2 Complete)
