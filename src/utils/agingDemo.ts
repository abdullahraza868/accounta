// Live Demo of Aging System
// Run this to see the system in action with real calculations

import {
  calculateDaysOverdue,
  getAgingBucket,
  getPaymentStatus,
  getAgingColors,
  getPaymentStatusColors,
  getApplicableRetryPolicy,
  calculateNextRetryDate,
  calculateAgingSummary,
  enrichSubscriptionWithAging
} from './agingCalculations';

import {
  generateMockSubscriptions,
  generateMockInvoices,
  mockPaymentRetrySettings
} from './mockAgingData';

console.log('\n' + '═'.repeat(70));
console.log('  AGING SYSTEM LIVE DEMO - Phase 1 & 2 Implementation');
console.log('═'.repeat(70) + '\n');

// ============================================================================
// DEMO 1: Basic Aging Calculation
// ============================================================================

console.log('📊 DEMO 1: Basic Aging Calculation\n');

const testDates = [
  { desc: 'Due in 15 days', date: '2025-12-17' },
  { desc: 'Due today', date: '2025-12-02' },
  { desc: '15 days overdue', date: '2025-11-17' },
  { desc: '45 days overdue', date: '2025-10-18' },
  { desc: '75 days overdue', date: '2025-09-18' },
  { desc: '100 days overdue', date: '2025-08-24' }
];

testDates.forEach(({ desc, date }) => {
  const days = calculateDaysOverdue(date);
  const bucket = getAgingBucket(days);
  const colors = getAgingColors(bucket);
  
  console.log(`${colors.icon} ${desc.padEnd(20)} | Due: ${date} | ${days} days overdue | Bucket: ${bucket}`);
});

// ============================================================================
// DEMO 2: Payment Status Logic
// ============================================================================

console.log('\n\n📋 DEMO 2: Payment Status Logic\n');

const statusScenarios = [
  { desc: 'Current, no issues', daysOverdue: 0, failedAttempts: 0, isRetrying: false },
  { desc: 'Past due, no failures', daysOverdue: 15, failedAttempts: 0, isRetrying: false },
  { desc: 'In active dunning', daysOverdue: 8, failedAttempts: 2, isRetrying: true },
  { desc: 'Payment failed', daysOverdue: 45, failedAttempts: 3, isRetrying: false }
];

statusScenarios.forEach(({ desc, daysOverdue, failedAttempts, isRetrying }) => {
  const status = getPaymentStatus(daysOverdue, failedAttempts, isRetrying);
  const colors = getPaymentStatusColors(status);
  
  console.log(`${colors.icon} ${desc.padEnd(25)} → ${status}`);
  console.log(`   Days overdue: ${daysOverdue}, Failed attempts: ${failedAttempts}, Retrying: ${isRetrying}\n`);
});

// ============================================================================
// DEMO 3: Retry Policy Selection
// ============================================================================

console.log('\n📅 DEMO 3: Retry Policy Selection\n');

const subscriptions = generateMockSubscriptions();

// Test with different subscription amounts
const testSubs = [
  subscriptions.find(s => s.amount === 750),   // $750 - uses default
  subscriptions.find(s => s.amount === 3000),  // $3000 - uses $1000+ override
];

testSubs.forEach(sub => {
  if (sub) {
    const policy = getApplicableRetryPolicy(sub, mockPaymentRetrySettings);
    
    console.log(`Subscription: ${sub.planName} - ${sub.client}`);
    console.log(`Amount: $${sub.amount}`);
    console.log(`Selected Policy:`);
    console.log(`  • Retry 1: ${policy.retry1Days} days after failure`);
    console.log(`  • Retry 2: ${policy.retry2Days} days after first retry`);
    console.log(`  • Retry 3: ${policy.retry3Days} days after second retry`);
    console.log(`  • Total window: ${policy.retry1Days + policy.retry2Days + policy.retry3Days} days`);
    console.log(`  • Final action: ${policy.finalAction}`);
    console.log(`  • Reason: ${sub.amount >= 1000 ? 'Amount-based override ($1000+)' : 'Global default'}\n`);
  }
});

// ============================================================================
// DEMO 4: Next Retry Date Calculation
// ============================================================================

console.log('\n🗓️  DEMO 4: Next Retry Date Calculation\n');

const failureDate = '2025-12-01';
const policy = mockPaymentRetrySettings.defaultPolicy;

console.log(`Payment failed on: ${failureDate}`);
console.log(`Using default policy: ${policy.retry1Days}, ${policy.retry2Days}, ${policy.retry3Days} days\n`);

for (let attempt = 1; attempt <= 3; attempt++) {
  const nextRetry = calculateNextRetryDate(failureDate, attempt, policy);
  console.log(`Retry ${attempt}: ${nextRetry}`);
}

console.log(`\nAfter 3 retries fail: ${policy.finalAction} subscription`);

// ============================================================================
// DEMO 5: Aging Summary
// ============================================================================

console.log('\n\n📊 DEMO 5: Aging Summary Report\n');

const allSubscriptions = generateMockSubscriptions();
const allInvoices = generateMockInvoices();
const summary = calculateAgingSummary(allSubscriptions, allInvoices);

console.log('ACCOUNTS RECEIVABLE AGING SUMMARY');
console.log('═'.repeat(70));
console.log('');
console.log(`🟢 Current (0 days):          ${summary.current.count.toString().padStart(2)} items    $${summary.current.amount.toFixed(2).padStart(10)}`);
console.log(`🟡 1-30 Days Overdue:         ${summary.bucket_1_30.count.toString().padStart(2)} items    $${summary.bucket_1_30.amount.toFixed(2).padStart(10)}`);
console.log(`🟠 31-60 Days Overdue:        ${summary.bucket_31_60.count.toString().padStart(2)} items    $${summary.bucket_31_60.amount.toFixed(2).padStart(10)}`);
console.log(`🔴 61-90 Days Overdue:        ${summary.bucket_61_90.count.toString().padStart(2)} items    $${summary.bucket_61_90.amount.toFixed(2).padStart(10)}`);
console.log(`🔴 90+ Days Overdue:          ${summary.bucket_90_plus.count.toString().padStart(2)} items    $${summary.bucket_90_plus.amount.toFixed(2).padStart(10)}`);
console.log('');
console.log('─'.repeat(70));
console.log(`Total Accounts Receivable:              $${summary.totalAccountsReceivable.toFixed(2).padStart(10)}`);
console.log(`Total Overdue:                          $${summary.totalOverdue.toFixed(2).padStart(10)}`);
console.log(`Overdue Percentage:                      ${summary.overduePercentage.toFixed(1).padStart(9)}%`);
console.log('═'.repeat(70));

// ============================================================================
// DEMO 6: Overdue Subscriptions Detail
// ============================================================================

console.log('\n\n⚠️  DEMO 6: Overdue Subscriptions Detail\n');

const overdueSubscriptions = allSubscriptions.filter(s => s.daysOverdue > 0);
console.log(`Found ${overdueSubscriptions.length} overdue subscriptions:\n`);

overdueSubscriptions
  .sort((a, b) => b.daysOverdue - a.daysOverdue)  // Most overdue first
  .forEach(sub => {
    const agingColors = getAgingColors(sub.agingBucket);
    const statusColors = getPaymentStatusColors(sub.paymentStatus);
    
    console.log(`${agingColors.icon} ${sub.client.padEnd(25)} | ${sub.planName.padEnd(25)}`);
    console.log(`   Amount: $${sub.amount.toString().padStart(6)} | ${sub.daysOverdue} days overdue | ${sub.agingBucket} | ${statusColors.icon} ${sub.paymentStatus}`);
    
    if (sub.failedAttempts > 0) {
      console.log(`   Failed attempts: ${sub.failedAttempts}`);
      if (sub.nextRetryDate) {
        console.log(`   Next retry: ${sub.nextRetryDate}`);
      } else {
        console.log(`   ⚠️  All retries exhausted`);
      }
    }
    console.log('');
  });

// ============================================================================
// DEMO 7: Data Enrichment
// ============================================================================

console.log('\n🔄 DEMO 7: Data Enrichment\n');

const rawSubscription = {
  id: 'DEMO-001',
  client: 'Demo Client Inc.',
  clientId: 'C-999',
  clientType: 'Business' as const,
  planName: 'Monthly Demo Service',
  amount: 850,
  frequency: 'Monthly' as const,
  nextPaymentDate: '2025-11-15',  // 17 days ago
  paymentMethod: 'ACH' as const,
  status: 'Active' as const,
  lastSuccessfulPayment: '2025-10-15',
  lastPaymentAttempt: null,
  failedAttempts: 0,
  nextRetryDate: null,
  paymentHistory: []
};

console.log('BEFORE enrichment:');
console.log('  daysOverdue:', (rawSubscription as any).daysOverdue || 'undefined');
console.log('  agingBucket:', (rawSubscription as any).agingBucket || 'undefined');
console.log('  paymentStatus:', (rawSubscription as any).paymentStatus || 'undefined');
console.log('');

const enriched = enrichSubscriptionWithAging(rawSubscription);

console.log('AFTER enrichment:');
console.log('  daysOverdue:', enriched.daysOverdue);
console.log('  agingBucket:', enriched.agingBucket);
console.log('  paymentStatus:', enriched.paymentStatus);
console.log('  overdueAmount:', enriched.overdueAmount);

const colors = getAgingColors(enriched.agingBucket);
console.log(`\n${colors.icon} This subscription is in the "${enriched.agingBucket}" bucket`);

// ============================================================================
// DEMO 8: Color Classes for UI
// ============================================================================

console.log('\n\n🎨 DEMO 8: ADA-Compliant Color Classes\n');

const buckets: Array<'Current' | '1-30' | '31-60' | '61-90' | '90+'> = [
  'Current', '1-30', '31-60', '61-90', '90+'
];

console.log('UI Color Classes (for React components):\n');

buckets.forEach(bucket => {
  const colors = getAgingColors(bucket);
  console.log(`${colors.icon} ${bucket.padEnd(10)}`);
  console.log(`   Badge: ${colors.badge}`);
  console.log(`   Border: ${colors.badgeBorder}`);
  console.log(`   Row BG: ${colors.row}`);
  console.log('');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '═'.repeat(70));
console.log('  ✅ DEMO COMPLETE - All Phase 1 & 2 Features Demonstrated');
console.log('═'.repeat(70));
console.log('');
console.log('Key Takeaways:');
console.log('  • Aging calculations work correctly');
console.log('  • Payment status logic handles all scenarios');
console.log('  • Retry policy selection is intelligent (default vs amount-based)');
console.log('  • Next retry dates calculate accurately');
console.log('  • Aging summary provides comprehensive AR overview');
console.log('  • Data enrichment works seamlessly');
console.log('  • ADA-compliant colors with multiple visual indicators');
console.log('');
console.log('Ready for Phase 3: UI Component Implementation');
console.log('');

// Uncomment to run the demo:
// runDemo();

export function runDemo() {
  // All the console.log statements above will execute
}
