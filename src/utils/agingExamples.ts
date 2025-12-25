// Aging System Usage Examples
// Demonstrates how to use the aging calculation utilities and types

import {
  calculateDaysOverdue,
  getAgingBucket,
  getPaymentStatus,
  getAgingColors,
  getPaymentStatusColors,
  getApplicableRetryPolicy,
  calculateNextRetryDate,
  getRetryScheduleDescription,
  calculateAgingSummary,
  enrichSubscriptionWithAging,
  enrichInvoiceWithAging
} from './agingCalculations';

import {
  generateMockSubscriptions,
  generateMockInvoices,
  mockPaymentRetrySettings
} from './mockAgingData';

import type { Subscription, Invoice } from '../types/billing';

// ============================================================================
// EXAMPLE 1: Basic Aging Calculations
// ============================================================================

export function exampleBasicAging() {
  console.log('=== EXAMPLE 1: Basic Aging Calculations ===\n');
  
  // Calculate days overdue from a due date
  const dueDate1 = '2025-11-15'; // 17 days ago
  const daysOverdue1 = calculateDaysOverdue(dueDate1);
  console.log(`Due date: ${dueDate1}`);
  console.log(`Days overdue: ${daysOverdue1}`);
  console.log(`Aging bucket: ${getAgingBucket(daysOverdue1)}`);
  console.log(`Payment status: ${getPaymentStatus(daysOverdue1)}\n`);
  
  // Different aging scenarios
  const scenarios = [
    { dueDate: '2025-12-15', description: 'Future due date' },
    { dueDate: '2025-11-20', description: '12 days overdue' },
    { dueDate: '2025-10-15', description: '48 days overdue' },
    { dueDate: '2025-09-15', description: '78 days overdue' },
    { dueDate: '2025-08-15', description: '109 days overdue' },
  ];
  
  scenarios.forEach(({ dueDate, description }) => {
    const days = calculateDaysOverdue(dueDate);
    const bucket = getAgingBucket(days);
    const colors = getAgingColors(bucket);
    
    console.log(`${description}:`);
    console.log(`  Days: ${days}, Bucket: ${bucket}, Icon: ${colors.icon}`);
  });
}

// ============================================================================
// EXAMPLE 2: Color and Styling
// ============================================================================

export function exampleColorStyling() {
  console.log('\n=== EXAMPLE 2: ADA-Compliant Color Styling ===\n');
  
  const buckets: Array<'Current' | '1-30' | '31-60' | '61-90' | '90+'> = [
    'Current', '1-30', '31-60', '61-90', '90+'
  ];
  
  buckets.forEach(bucket => {
    const colors = getAgingColors(bucket);
    console.log(`Bucket: ${bucket} ${colors.icon}`);
    console.log(`  Badge classes: ${colors.badge}`);
    console.log(`  Row background: ${colors.row}`);
    console.log('');
  });
  
  // Payment status colors
  const statuses: Array<'Current' | 'Past Due' | 'Payment Failed' | 'In Dunning'> = [
    'Current', 'Past Due', 'Payment Failed', 'In Dunning'
  ];
  
  console.log('Payment Status Colors:\n');
  statuses.forEach(status => {
    const colors = getPaymentStatusColors(status);
    console.log(`Status: ${status} ${colors.icon}`);
    console.log(`  Classes: ${colors.badge}\n`);
  });
}

// ============================================================================
// EXAMPLE 3: Retry Policy Logic
// ============================================================================

export function exampleRetryPolicy() {
  console.log('\n=== EXAMPLE 3: Retry Policy Logic ===\n');
  
  const subscriptions = generateMockSubscriptions();
  
  // Example subscription with payment failure
  const failedSub = subscriptions.find(s => s.failedAttempts > 0);
  
  if (failedSub) {
    console.log(`Subscription: ${failedSub.planName} - ${failedSub.client}`);
    console.log(`Amount: $${failedSub.amount}`);
    console.log(`Failed attempts: ${failedSub.failedAttempts}\n`);
    
    // Get applicable retry policy
    const policy = getApplicableRetryPolicy(failedSub, mockPaymentRetrySettings);
    console.log('Applicable Retry Policy:');
    console.log(`  First retry: ${policy.retry1Days} days`);
    console.log(`  Second retry: ${policy.retry2Days} days`);
    console.log(`  Third retry: ${policy.retry3Days} days`);
    console.log(`  Final action: ${policy.finalAction}\n`);
    
    // Get retry schedule description
    const schedule = getRetryScheduleDescription(policy);
    console.log('Retry Schedule:');
    schedule.forEach((line, i) => console.log(`  ${i + 1}. ${line}`));
    
    // Calculate next retry dates
    const failureDate = '2025-12-01';
    console.log(`\nIf payment failed on ${failureDate}:`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      const nextRetry = calculateNextRetryDate(failureDate, attempt, policy);
      console.log(`  Retry ${attempt}: ${nextRetry}`);
    }
  }
}

// ============================================================================
// EXAMPLE 4: Data Enrichment
// ============================================================================

export function exampleDataEnrichment() {
  console.log('\n=== EXAMPLE 4: Data Enrichment ===\n');
  
  // Raw subscription data (without aging fields)
  const rawSubscription = {
    id: 'SUB-123',
    client: 'Example Corp',
    clientId: 'C-123',
    clientType: 'Business' as const,
    planName: 'Monthly Bookkeeping',
    amount: 750,
    frequency: 'Monthly' as const,
    nextPaymentDate: '2025-11-15', // Overdue
    paymentMethod: 'ACH' as const,
    status: 'Active' as const,
    lastSuccessfulPayment: '2025-10-15',
    lastPaymentAttempt: null,
    failedAttempts: 0,
    nextRetryDate: null,
    paymentHistory: []
  };
  
  console.log('Before enrichment:');
  console.log('  Has daysOverdue:', 'daysOverdue' in rawSubscription);
  console.log('  Has agingBucket:', 'agingBucket' in rawSubscription);
  console.log('  Has paymentStatus:', 'paymentStatus' in rawSubscription);
  
  // Enrich with aging data
  const enrichedSubscription = enrichSubscriptionWithAging(rawSubscription);
  
  console.log('\nAfter enrichment:');
  console.log(`  Days overdue: ${enrichedSubscription.daysOverdue}`);
  console.log(`  Aging bucket: ${enrichedSubscription.agingBucket}`);
  console.log(`  Payment status: ${enrichedSubscription.paymentStatus}`);
  console.log(`  Overdue amount: $${enrichedSubscription.overdueAmount}`);
}

// ============================================================================
// EXAMPLE 5: Aging Summary Report
// ============================================================================

export function exampleAgingSummary() {
  console.log('\n=== EXAMPLE 5: Aging Summary Report ===\n');
  
  const subscriptions = generateMockSubscriptions();
  const invoices = generateMockInvoices();
  
  const summary = calculateAgingSummary(subscriptions, invoices);
  
  console.log('ACCOUNTS RECEIVABLE AGING SUMMARY\n');
  console.log('━'.repeat(60));
  
  console.log(`Current (0 days):          ${summary.current.count} items    $${summary.current.amount.toFixed(2)}`);
  console.log(`1-30 Days Overdue:         ${summary.bucket_1_30.count} items    $${summary.bucket_1_30.amount.toFixed(2)}`);
  console.log(`31-60 Days Overdue:        ${summary.bucket_31_60.count} items    $${summary.bucket_31_60.amount.toFixed(2)}`);
  console.log(`61-90 Days Overdue:        ${summary.bucket_61_90.count} items    $${summary.bucket_61_90.amount.toFixed(2)}`);
  console.log(`90+ Days Overdue:          ${summary.bucket_90_plus.count} items    $${summary.bucket_90_plus.amount.toFixed(2)}`);
  
  console.log('━'.repeat(60));
  console.log(`Total Accounts Receivable: $${summary.totalAccountsReceivable.toFixed(2)}`);
  console.log(`Total Overdue:             $${summary.totalOverdue.toFixed(2)}`);
  console.log(`Overdue Percentage:        ${summary.overduePercentage.toFixed(1)}%`);
}

// ============================================================================
// EXAMPLE 6: Working with Mock Data
// ============================================================================

export function exampleMockData() {
  console.log('\n=== EXAMPLE 6: Working with Mock Data ===\n');
  
  const subscriptions = generateMockSubscriptions();
  const invoices = generateMockInvoices();
  
  console.log(`Generated ${subscriptions.length} subscriptions`);
  console.log(`Generated ${invoices.length} invoices\n`);
  
  // Show overdue subscriptions
  const overdueSubscriptions = subscriptions.filter(s => s.daysOverdue > 0);
  console.log(`Overdue Subscriptions (${overdueSubscriptions.length}):\n`);
  
  overdueSubscriptions.forEach(sub => {
    const colors = getAgingColors(sub.agingBucket);
    console.log(`${colors.icon} ${sub.client} - ${sub.planName}`);
    console.log(`   $${sub.amount} | ${sub.daysOverdue} days overdue | ${sub.agingBucket}`);
    console.log(`   Status: ${sub.paymentStatus} | Failed attempts: ${sub.failedAttempts}`);
    console.log('');
  });
  
  // Show overdue invoices
  const overdueInvoices = invoices.filter(inv => inv.daysOverdue > 0);
  console.log(`\nOverdue Invoices (${overdueInvoices.length}):\n`);
  
  overdueInvoices.forEach(inv => {
    const colors = getAgingColors(inv.agingBucket);
    console.log(`${colors.icon} ${inv.invoiceNo} - ${inv.client}`);
    console.log(`   $${inv.amountDue} | ${inv.daysOverdue} days overdue | ${inv.agingBucket}`);
    console.log(`   Reminders sent: ${inv.reminderCount}`);
    console.log('');
  });
}

// ============================================================================
// EXAMPLE 7: UI Component Usage Pattern
// ============================================================================

export function exampleUIComponentUsage() {
  console.log('\n=== EXAMPLE 7: UI Component Usage Pattern ===\n');
  
  const subscription = generateMockSubscriptions()[2]; // Get overdue subscription
  const colors = getAgingColors(subscription.agingBucket);
  const statusColors = getPaymentStatusColors(subscription.paymentStatus);
  
  console.log('React Component Pattern:\n');
  console.log(`// Subscription row with aging indicator
<tr className="${colors.row}">
  <td>{subscription.client}</td>
  <td>{subscription.planName}</td>
  <td>
    <Badge className="${statusColors.badge}">
      {statusColors.icon} {subscription.paymentStatus}
    </Badge>
  </td>
  <td>
    <Badge className="${colors.badge} ${colors.badgeBorder}">
      {colors.icon} {subscription.agingBucket}
    </Badge>
  </td>
  <td className="${colors.text}">
    {subscription.daysOverdue} days
  </td>
  <td>\${subscription.amount}</td>
</tr>`);
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  exampleBasicAging();
  exampleColorStyling();
  exampleRetryPolicy();
  exampleDataEnrichment();
  exampleAgingSummary();
  exampleMockData();
  exampleUIComponentUsage();
  
  console.log('\n' + '='.repeat(60));
  console.log('All examples completed successfully!');
  console.log('='.repeat(60));
}

// Uncomment to run examples in development:
// runAllExamples();
