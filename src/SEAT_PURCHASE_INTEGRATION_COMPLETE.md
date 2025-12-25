# Seat Purchase Integration Complete ✅

## Implementation Summary

Successfully integrated the seat purchase workflow into the Acounta platform with mock Stripe integration. The system follows a firm-based model where seats are purchased upfront and reserved when team member invitations are sent.

---

## 1. Billing & Subscription Page Integration

### Location
`/components/views/settings/BillingSubscriptionView.tsx`

### Changes
- **Added SeatManagementCard** component to the billing page
- Displays seat usage with color-coded alerts (green/yellow/red)
- Shows:
  - Active seats (green)
  - Pending/Reserved seats (yellow)
  - Available seats (blue)
  - Usage progress bar
  - Current monthly cost
  - Warning messages when seats are low or full
- **Purchase Button** opens a comprehensive purchase dialog

### Mock Seat Purchase Handler
```typescript
const handlePurchaseSeats = async (quantity: number) => {
  // Simulate API call to Stripe
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Update firm subscription
  setFirmSubscription(prev => ({
    ...prev,
    totalSeats: prev.totalSeats + quantity,
    availableSeats: prev.availableSeats + quantity,
    perSeatPrice: 49,
    totalMonthlyCost: prev.totalMonthlyCost + (quantity * 49),
  }));
};
```

---

## 2. Team Members Page Integration

### Location
`/components/company-settings-tabs/TeamMembersTab_NEW.tsx`

### Changes

#### A. Seat Availability Banner
- **Color-coded alert banner** displayed at the top:
  - 🔴 **Red**: No seats available - shows "Purchase Seats" button
  - 🟡 **Yellow**: 2 or fewer seats available - shows warning
  - 🔵 **Blue**: 3+ seats available - normal status
- Shows: `{available} of {total} seats available`
- Displays: `{used} active • {reserved} pending invites`

#### B. Seat Checking on Invitation
**Before opening invitation dialog:**
```typescript
const handleCreateMember = () => {
  if (firmSubscription.availableSeats <= 0) {
    toast.error('No available seats', {
      description: 'You need to purchase more seats before inviting team members.',
      action: {
        label: 'Go to Billing',
        onClick: () => window.location.href = '#/settings/billing',
      },
    });
    return;
  }
  setIsCreatingMember(true);
};
```

**After sending invitation:**
```typescript
const handleSaveNewMember = (memberData: any) => {
  if (firmSubscription.availableSeats <= 0) {
    toast.error('No available seats');
    return;
  }

  // Create pending team member
  const newMember = { ...memberData, status: 'pending', subscriptionCost: 49 };
  setTeamMembers([...teamMembers, newMember]);
  
  // Reserve a seat
  setFirmSubscription(prev => ({
    ...prev,
    reservedSeats: prev.reservedSeats + 1,
    availableSeats: prev.availableSeats - 1,
  }));
  
  toast.success('Invitation sent!', {
    description: `${memberData.firstName} ${memberData.lastName} has been invited. A seat has been reserved.`,
  });
};
```

---

## 3. Seat Purchase Components

### A. SeatManagementCard
**Location:** `/components/SeatManagementCard.tsx`

**Features:**
- Visual seat usage progress bar
- Three-card breakdown: Active (green) / Pending (yellow) / Available (blue)
- Current monthly cost display
- Next billing date
- Alert messages for low/full capacity
- "Purchase Additional Seats" button
- Simple purchase dialog with:
  - Quantity input
  - Cost breakdown (current + additional)
  - New monthly total calculation
  - Prorated billing notice

### B. SeatPurchaseFlow (Comprehensive 3-Step)
**Location:** `/components/views/settings/SeatPurchaseFlow.tsx`

**Step 1: Select Quantity**
- Current seat status dashboard
- Increment/decrement buttons
- Quick select buttons (5, 10, 25, 50 seats)
- Real-time cost calculator
- Preview of new total seats

**Step 2: Checkout (Mock Stripe)**
- Order summary
- Mock payment method (Visa ending in 4242)
- Billing information breakdown
- Terms and conditions notice
- "Pay $XXX" button

**Step 3: Success**
- Confirmation message
- New available seat count
- Receipt notification
- Billing start date

---

## 4. Firm Subscription State

### Data Structure
```typescript
const firmSubscription: FirmSubscription = {
  id: 'sub_firm_123',
  firmId: 'firm_abc',
  firmName: 'Acme Accounting Firm',
  tier: 'professional',
  status: 'active',
  stripeCustomerId: 'cus_stripe_123',
  stripeSubscriptionId: 'sub_stripe_456',
  
  // Seat Management
  totalSeats: 10,           // Total purchased seats
  usedSeats: 5,             // Active team members
  availableSeats: 4,        // Available for new invites
  reservedSeats: 1,         // Pending invitations
  
  // Billing
  billingCycle: 'monthly',
  basePrice: 99,            // Base platform fee
  perSeatPrice: 49,         // Cost per seat
  totalMonthlyCost: 344,    // Base (99) + 5 seats (245)
  nextBillingDate: '2025-02-01',
  
  // Stripe IDs (for future real integration)
  currentPeriodStart: '2025-01-01',
  currentPeriodEnd: '2025-02-01',
};
```

---

## 5. User Workflows

### Workflow 1: Purchase Seats from Billing Page
1. Admin navigates to **Settings > Billing & Subscription**
2. Sees **Seat Management Card** showing current usage
3. Clicks **"Purchase Additional Seats"**
4. Enters quantity in dialog
5. Reviews cost breakdown
6. Confirms purchase (mock Stripe)
7. Seats added to account immediately
8. Toast notification confirms purchase

### Workflow 2: Invite Team Member (Seats Available)
1. Admin navigates to **Settings > Team**
2. Sees seat availability banner: **"4 of 10 seats available"**
3. Clicks **"Add Team Member"**
4. Fills out invitation form
5. Sends invitation
6. **System reserves 1 seat** (availableSeats: 4 → 3, reservedSeats: 1 → 2)
7. Toast confirms: "Invitation sent! A seat has been reserved."

### Workflow 3: Invite Team Member (No Seats Available)
1. Admin navigates to **Settings > Team**
2. Sees red alert banner: **"0 of 10 seats available"**
3. Clicks **"Add Team Member"**
4. **System blocks action** with error toast:
   - Message: "No available seats"
   - Description: "You need to purchase more seats before inviting team members."
   - **Action Button**: "Go to Billing" (redirects to `/settings/billing`)
5. Admin clicks "Go to Billing"
6. Purchases more seats
7. Returns to Team Members and sends invitation

---

## 6. Seat State Transitions

### States
- **Available**: Seats purchased but not assigned
- **Reserved**: Seats assigned to pending invitations
- **Used**: Seats assigned to active team members
- **Total**: All purchased seats (Available + Reserved + Used)

### Transitions
```
Purchase Seats:
  availableSeats += quantity
  totalSeats += quantity

Send Invitation:
  availableSeats -= 1
  reservedSeats += 1
  status: 'pending'

Accept Invitation:
  reservedSeats -= 1
  usedSeats += 1
  status: 'active'

Cancel Invitation:
  reservedSeats -= 1
  availableSeats += 1

Deactivate Member:
  usedSeats -= 1
  availableSeats += 1
  status: 'inactive'

Reactivate Member:
  availableSeats -= 1
  usedSeats += 1
  status: 'active'
```

---

## 7. Visual Indicators

### Color System
- **🟢 Green**: Active seats, positive status
- **🟡 Yellow**: Reserved/pending seats, warning (≤2 available)
- **🔵 Blue**: Available seats, normal status
- **🔴 Red**: No seats available, critical alert
- **⚫ Gray**: Inactive team members

### Alert Thresholds
- **Critical** (Red): 0 available seats
- **Warning** (Yellow): 1-2 available seats
- **Normal** (Blue): 3+ available seats

---

## 8. Toast Notifications

### Success Notifications
- ✅ "Successfully purchased {X} seat(s)" (with description)
- ✅ "Invitation sent! A seat has been reserved"
- ✅ "Team member activated" (seat moves from reserved to used)

### Error Notifications
- ❌ "No available seats" (with "Go to Billing" action)
- ❌ "Purchase failed" (with retry option)
- ❌ "Please enter a valid number of seats"

---

## 9. Mock Stripe Integration

### Current Implementation
All Stripe interactions are **mocked** using:
- `setTimeout()` delays to simulate API calls
- Local state updates
- Mock payment card: "Visa ending in 4242"
- Mock customer ID: `cus_stripe_123`
- Mock subscription ID: `sub_stripe_456`

### For Real Stripe Integration (Future)
Replace mock handlers with:
```typescript
// Real Stripe Purchase
const handlePurchaseSeats = async (quantity: number) => {
  const session = await createStripeCheckoutSession({
    quantity,
    priceId: SEAT_PRICE_ID,
    customerId: firmSubscription.stripeCustomerId,
  });
  
  window.location.href = session.url;
};

// Stripe Webhook Handler (Backend)
// Listen for checkout.session.completed
// Update subscription in database
// Reserve seats when invitation is sent
```

---

## 10. Purchase History Tracking

### Recommended Implementation
Create a `SeatPurchaseHistory` table:

```typescript
type SeatPurchaseHistory = {
  id: string;
  firmId: string;
  quantity: number;
  pricePerSeat: number;
  totalCost: number;
  purchasedAt: string;
  purchasedBy: string; // Admin user ID
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
};
```

### Display Location
Add a **"Purchase History"** section in the Billing view:
- Table showing all seat purchases
- Columns: Date, Quantity, Cost, Purchased By, Status
- Download invoice button
- Filter by date range

---

## 11. Testing Checklist

### ✅ Completed
- [x] Seat Management Card displays in Billing page
- [x] Purchase dialog opens and calculates costs correctly
- [x] Mock Stripe purchase updates seat counts
- [x] Team Member page shows seat availability banner
- [x] Invitation blocked when no seats available
- [x] Toast notification with "Go to Billing" action
- [x] Seat reservation on invitation send
- [x] Color-coded alerts (red/yellow/blue)
- [x] Seat counts update in real-time

### 🔄 Future Testing (Real Stripe)
- [ ] Stripe Checkout Session creation
- [ ] Webhook handling for payment success
- [ ] Prorated billing calculations
- [ ] Failed payment handling
- [ ] Refund processing
- [ ] Invoice generation
- [ ] Email notifications for purchases

---

## 12. Configuration

### Environment Variables (For Real Stripe)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx (backend)
STRIPE_WEBHOOK_SECRET=whsec_xxx (backend)
SEAT_PRICE_ID=price_xxx
BASE_PLAN_PRICE_ID=price_xxx
```

### Pricing Configuration
```typescript
const SEAT_PRICING = {
  perSeatMonthly: 49,
  basePlanMonthly: 99,
  yearlyDiscount: 0.30, // 30% off
};
```

---

## 13. Business Logic Rules

### Seat Purchase
- ✅ Minimum purchase: 1 seat
- ✅ Maximum purchase: 100 seats per transaction
- ✅ Immediate availability after purchase
- ✅ Prorated billing for current period

### Seat Reservation
- ✅ Seats reserved when invitation sent
- ✅ Seats released if invitation cancelled/expired
- ✅ Reserved seats count toward total usage
- ✅ Cannot send more invites than available seats

### Seat Deactivation
- ✅ Deactivating member frees up 1 seat
- ✅ Freed seat becomes available immediately
- ✅ Billing adjusted on next cycle
- ✅ Can reactivate if seats available

---

## 14. Files Modified/Created

### Modified
- `/components/views/settings/BillingSubscriptionView.tsx` - Added SeatManagementCard
- `/components/company-settings-tabs/TeamMembersTab_NEW.tsx` - Added seat checking logic

### Existing Components Used
- `/components/SeatManagementCard.tsx` - Seat display card
- `/components/views/settings/SeatPurchaseFlow.tsx` - Comprehensive 3-step purchase

### Type Definition
- `/types/subscription.ts` - FirmSubscription type

---

## Summary

The seat purchase workflow is **fully integrated** with:
1. ✅ **Billing page** showing seat management card
2. ✅ **Team Members page** checking available seats
3. ✅ **Seat reservation** on invitation send
4. ✅ **Visual alerts** for low/no seats
5. ✅ **Toast notifications** guiding users to purchase
6. ✅ **Mock Stripe** integration ready for real implementation

Next steps for production:
- Replace mock Stripe with real Stripe API
- Add backend webhook handlers
- Implement purchase history tracking
- Add email notifications
- Set up prorated billing calculations
