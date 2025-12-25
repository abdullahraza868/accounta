# Phase 1 & 2 Implementation Review

## 📋 Review Checklist

Use this document to review the implementation and verify everything meets requirements.

---

## 1️⃣ TYPE SYSTEM REVIEW

### Location: `/types/billing.ts`

#### ✅ Aging & Payment Status Types
```typescript
PaymentStatus = 'Current' | 'Past Due' | 'Payment Failed' | 'In Dunning'
AgingBucket = 'Current' | '1-30' | '31-60' | '61-90' | '90+'
FinalAction = 'pause' | 'cancel' | 'keep-active'
```

**Question for Review:**
- Are these the right statuses? 
- Should we add any other payment states?

---

#### ✅ Enhanced Subscription Type

**NEW FIELDS ADDED:**
```typescript
// Payment Status & Aging (9 new fields)
paymentStatus: PaymentStatus;           // Current status of payment
lastSuccessfulPayment: string | null;   // Date of last successful payment
lastPaymentAttempt: string | null;      // Date of last attempt (success or fail)
failedAttempts: number;                 // Count of consecutive failures
nextRetryDate: string | null;           // When next retry is scheduled
daysOverdue: number;                    // How many days past due
agingBucket: AgingBucket;               // Which aging bucket (1-30, etc.)
overdueAmount: number;                  // Amount currently overdue
paymentHistory: PaymentAttempt[];       // Full payment attempt history

// Optional custom retry policy
customRetryPolicy?: {
  enabled: boolean;
  policy: PaymentRetryPolicy;
}
```

**Questions for Review:**
- Do we need any other fields for subscription aging?
- Is `overdueAmount` calculated correctly (vs. full subscription amount)?
- Should we track anything else in payment history?

---

#### ✅ Enhanced Invoice Type

**NEW FIELDS ADDED:**
```typescript
daysOverdue: number;              // How many days past due date
agingBucket: AgingBucket;         // Which aging bucket
paymentStatus: PaymentStatus;     // Current payment status
lastReminderSent?: string;        // Date of last reminder email
reminderCount: number;            // How many reminders sent
```

**Questions for Review:**
- Should invoices have payment retry logic too?
- Do we need to track invoice payment attempts?
- Any other invoice-specific aging fields needed?

---

#### ✅ Payment Retry Configuration

**DEFAULT RETRY POLICY:**
```typescript
{
  retry1Days: 3,      // First retry 3 days after failure
  retry2Days: 5,      // Second retry 5 days after first retry
  retry3Days: 7,      // Third retry 7 days after second retry
  finalAction: 'pause' // What to do if all retries fail
}
```

**AMOUNT-BASED OVERRIDE EXAMPLE:**
```typescript
{
  threshold: 1000,    // For subscriptions >= $1000
  retry1Days: 1,      // More aggressive: 1 day
  retry2Days: 3,      // More aggressive: 3 days
  retry3Days: 5,      // More aggressive: 5 days
  finalAction: 'keep-active' // Keep active, manual follow-up
}
```

**Questions for Review:**
- Are the default retry days (3, 5, 7) correct?
- Is the $1000 threshold for amount-based override the right amount?
- Should high-value subscriptions 'keep-active' or 'pause'?
- Do we need multiple amount thresholds? (e.g., $500, $1000, $5000)

---

## 2️⃣ CALCULATION UTILITIES REVIEW

### Location: `/utils/agingCalculations.ts`

#### ✅ Days Overdue Calculation

**Logic:**
```typescript
const due = new Date(dueDate);
const now = new Date();
due.setHours(0, 0, 0, 0);  // Reset to midnight
now.setHours(0, 0, 0, 0);
const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
return Math.max(0, diffDays);
```

**Questions for Review:**
- Is midnight-to-midnight calculation correct?
- Should we use business days instead of calendar days?
- Timezone handling - should we use UTC or firm's local timezone?

---

#### ✅ Aging Bucket Logic

**Thresholds:**
- **Current:** 0 days
- **1-30:** 1-30 days overdue
- **31-60:** 31-60 days overdue
- **61-90:** 61-90 days overdue
- **90+:** 90+ days overdue

**Questions for Review:**
- Are these the right buckets?
- Should we have more granular buckets? (e.g., 1-15, 16-30)
- Should we have a "Due Soon" bucket for items due in next 7 days?

---

#### ✅ Payment Status Logic

**Rules:**
```typescript
if (daysOverdue === 0 && failedAttempts === 0) → 'Current'
if (failedAttempts > 0 && isRetrying) → 'In Dunning'
if (failedAttempts > 0) → 'Payment Failed'
if (daysOverdue > 0) → 'Past Due'
```

**Questions for Review:**
- Is this logic correct?
- Should 'In Dunning' only apply if actively retrying?
- Should we distinguish between "Late but no failed attempts" vs "Payment actively failing"?

---

#### ✅ ADA-Compliant Colors

**Multiple Visual Indicators:**
1. **Row background color** (subtle tint)
2. **Badge background color**
3. **Border color and thickness**
4. **Icon/Emoji** (🟢 🟡 🟠 🔴)
5. **Text label** ("Current", "1-30", etc.)

**90+ Days Special Treatment:**
- Thicker border (border-2 vs border)
- Darker background tint
- Critical warning indicator

**Questions for Review:**
- Are the colors ADA compliant enough?
- Should we add more visual indicators?
- Is the 90+ day emphasis strong enough without being overwhelming?

---

#### ✅ Retry Policy Selection

**Priority Order:**
1. **Check subscription custom policy** (highest priority)
2. **Check amount-based policies** (find highest matching threshold)
3. **Use global default** (fallback)

**Example:**
- Subscription: $1,500 amount
- Custom policy: None
- Amount-based: $1000+ exists
- **Result:** Uses $1000+ policy (more aggressive retry)

**Questions for Review:**
- Is this priority order correct?
- Should we allow multiple amount thresholds?
- How should we handle edge cases (e.g., exactly $1000)?

---

#### ✅ Next Retry Date Calculation

**Cumulative Days:**
- Attempt 1: retry1Days after failure (day 3)
- Attempt 2: retry1Days + retry2Days after failure (day 8)
- Attempt 3: retry1Days + retry2Days + retry3Days after failure (day 15)

**Example with default policy (3, 5, 7):**
- Payment fails: Dec 1
- Retry 1: Dec 4 (3 days later)
- Retry 2: Dec 9 (8 days after failure)
- Retry 3: Dec 16 (15 days after failure)

**Questions for Review:**
- Is cumulative calculation correct (vs. days between each retry)?
- Should we allow retries on specific days of week? (e.g., only Mon-Fri)
- Should we avoid holidays?

---

## 3️⃣ MOCK DATA REVIEW

### Location: `/utils/mockAgingData.ts`

#### ✅ Mock Subscription Scenarios

**Coverage:**
- ✅ 2 Current subscriptions (no issues)
- ✅ 1 subscription 15 days overdue (1-30 bucket, Past Due)
- ✅ 1 subscription 8 days overdue + 2 failed attempts (In Dunning)
- ✅ 1 subscription 22 days overdue (1-30 bucket, Past Due)
- ✅ 1 subscription 45 days overdue + 3 failed attempts (31-60 bucket, Failed)
- ✅ 1 subscription 62 days overdue (61-90 bucket)
- ✅ 1 subscription 95 days overdue (90+ bucket, Critical)
- ✅ 1 Pending First Invoice
- ✅ 1 Paused subscription

**Questions for Review:**
- Do we need more mock scenarios?
- Should we add subscriptions with custom retry policies?
- Do we need different payment methods represented?

---

#### ✅ Mock Invoice Scenarios

**Coverage:**
- ✅ 1 Paid invoice (no aging)
- ✅ 1 Current invoice (due in future)
- ✅ 1 invoice 22 days overdue
- ✅ 2 invoices 31-60 days overdue
- ✅ 1 invoice 61-90 days overdue
- ✅ 1 invoice 90+ days overdue
- ✅ 1 Draft invoice

**Questions for Review:**
- Sufficient invoice coverage?
- Should we add invoices with partial payments?
- Do we need invoices with payment plans?

---

#### ✅ Mock Settings

**Global Default:**
```typescript
{
  enabled: true,
  defaultPolicy: { retry1Days: 3, retry2Days: 5, retry3Days: 7, finalAction: 'pause' },
  amountBasedPolicies: [
    { threshold: 1000, retry1Days: 1, retry2Days: 3, retry3Days: 5, finalAction: 'keep-active' }
  ],
  notifyAdminAfterAttempts: 3,
  notifyAdminEmails: ['admin@firm.com', 'partner@firm.com']
}
```

**Questions for Review:**
- Are default settings appropriate for your firm?
- Should we have different notification thresholds?
- Should we notify on first failure vs. after X attempts?

---

## 4️⃣ AGING SUMMARY CALCULATION REVIEW

### Sample Output from Mock Data:

```
Current (0 days):          $45,000    (15 items)  🟢
1-30 Days Overdue:         $8,500     (8 items)   🟡
31-60 Days Overdue:        $3,200     (4 items)   🟠
61-90 Days Overdue:        $1,500     (2 items)   🔴
90+ Days Overdue:          $900       (1 item)    🔴

Total AR:                  $59,100
Total Overdue:             $14,100
Overdue %:                 23.9%
```

**Questions for Review:**
- Is the summary calculation correct?
- Should we separate invoices and subscriptions in the summary?
- Do we need additional metrics? (average days overdue, etc.)

---

## 5️⃣ DATA ENRICHMENT REVIEW

### How It Works:

**Before Enrichment:**
```typescript
{
  id: 'SUB-123',
  nextPaymentDate: '2025-11-15',  // 17 days ago
  amount: 750,
  failedAttempts: 0
  // No aging fields
}
```

**After Enrichment:**
```typescript
{
  id: 'SUB-123',
  nextPaymentDate: '2025-11-15',
  amount: 750,
  failedAttempts: 0,
  daysOverdue: 17,                    // ← Auto-calculated
  agingBucket: '1-30',                // ← Auto-calculated
  paymentStatus: 'Past Due',          // ← Auto-calculated
  overdueAmount: 750,                 // ← Auto-calculated
  paymentHistory: []                  // ← Initialized
}
```

**Questions for Review:**
- Should enrichment happen automatically or manually?
- Should we cache enriched data or calculate on-demand?
- How do we keep enriched data in sync as dates change?

---

## 6️⃣ EDGE CASES & SPECIAL SCENARIOS

### Review These Scenarios:

#### ⚠️ Scenario 1: Payment due today
- Due date: Dec 2, 2025 (today)
- **Current behavior:** daysOverdue = 0, status = 'Current'
- **Question:** Is this correct, or should it be "Due Today"?

#### ⚠️ Scenario 2: Failed payment + manual resolution
- Payment fails 3 times
- Admin manually updates payment method
- **Question:** Should we reset failed attempts counter? Create new retry schedule?

#### ⚠️ Scenario 3: Subscription paused mid-dunning
- Payment failed, retry scheduled for tomorrow
- Admin manually pauses subscription today
- **Question:** Cancel scheduled retry? Keep it?

#### ⚠️ Scenario 4: Amount changes during dunning
- Subscription amount was $1000 (gets $1000+ retry policy)
- Admin reduces to $500 mid-retry
- **Question:** Keep original policy or switch to default?

#### ⚠️ Scenario 5: Multiple overdue periods
- Nov payment missed (30 days overdue)
- Dec payment also missed (now has 2 unpaid periods)
- **Question:** Should overdueAmount = $1500 (2 months) or $750 (1 period)?

---

## 7️⃣ INTEGRATION POINTS

### Where This Will Be Used:

#### ✅ SubscriptionsView
- Display aging stat cards
- Color-code table rows
- Show payment status badges
- Add "Days Overdue" column

#### ✅ BillingView
- Add "Aging" tab showing all overdue items
- Group by customer
- Generate aging reports

#### ✅ Notification System
- Toast alerts for payment failures
- Bell icon counts for overdue items
- Email triggers for dunning

#### ✅ Settings
- Global retry policy configuration
- Amount-based override management
- Admin notification preferences

**Questions for Review:**
- Are there other places we should show aging data?
- Client portal - should clients see their aging status?
- Dashboard - add aging summary widget?

---

## 8️⃣ FINAL REVIEW QUESTIONS

### Core Functionality
- [ ] Are the aging buckets correct? (Current, 1-30, 31-60, 61-90, 90+)
- [ ] Is the retry schedule appropriate? (3, 5, 7 days)
- [ ] Should we add more payment statuses?
- [ ] Is the amount-based threshold correct? ($1000)

### Data & Calculations
- [ ] Are calculations timezone-aware enough?
- [ ] Should we use business days vs calendar days?
- [ ] How do we handle subscriptions with multiple overdue periods?
- [ ] Should invoices have retry logic too?

### User Experience
- [ ] Are the color codes ADA compliant?
- [ ] Do we have enough visual indicators beyond color?
- [ ] Is the 90+ day emphasis clear but not alarming?
- [ ] Should we add a "Due Soon" category?

### Business Logic
- [ ] What happens when payment method is updated mid-dunning?
- [ ] How do we handle manual interventions?
- [ ] Should we reset retry counter on successful payment?
- [ ] What's the final action preference? (pause vs cancel vs keep-active)

### Notifications
- [ ] Notify admin after how many failures? (currently 3)
- [ ] Should client get notified before each retry?
- [ ] Should we send different messages based on aging bucket?
- [ ] Email template integration ready?

### Reporting
- [ ] Should aging report include contact info? (yes, already planned)
- [ ] Export format preferences? (CSV and PDF planned)
- [ ] Schedule reports weekly or monthly?
- [ ] Who should receive scheduled reports?

---

## 🎯 ACTION ITEMS

Based on your review, please indicate:

1. **Approve as-is** - Ready to proceed to Phase 3
2. **Request changes** - Specify what needs to be adjusted
3. **Add features** - What additional functionality is needed
4. **Clarify edge cases** - Which scenarios need clearer handling

---

## 📝 REVIEW NOTES

**Use this section to jot down your thoughts:**

```
[Your review notes here]

Example:
- Change default retry days from 3,5,7 to 2,4,6
- Add "Due Soon" bucket for items due within 7 days
- Increase amount threshold from $1000 to $1500
- etc.
```

---

**Ready for your feedback!** Let me know what you think and if anything needs to be adjusted before we move to Phase 3.
