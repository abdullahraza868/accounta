# 🎯 How to Access Seat Management Card

## Quick Navigation

### Method 1: Direct URL (Fastest)
Copy and paste this URL into your browser:
```
http://localhost:5173/settings/company/billing
```

### Method 2: Through the UI

1. **Open Settings**
   - Look in the left sidebar
   - Click on the ⚙️ **Settings** icon/button

2. **Go to Company Settings**
   - Click **Company Settings** (should be the main settings page)

3. **Click "Billing & Subscription" Tab**
   - In the top navigation tabs, you'll see:
     - Demographics
     - Team Members
     - Roles & Permissions
     - Navigation Menus
     - Authentication & Security
     - **Billing & Subscription** ← Click this one!

4. **See the Seat Management Card**
   - The SeatManagementCard will be at the **top of the page**
   - It shows:
     - Current seat usage (Active/Pending/Available)
     - Visual progress bar
     - Monthly cost
     - "Purchase Additional Seats" button

---

## What You'll See

### Seat Management Card Features:
```
┌─────────────────────────────────────────────────────┐
│  Team Seat Management                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  60% of seats in use (6/10)                         │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ Active  │  │ Pending │  │Available│           │
│  │   5     │  │    1    │  │    4    │           │
│  └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│  Monthly Cost: $295                                 │
│  Next billing: Jan 1, 2025                         │
│                                                     │
│  [Purchase Additional Seats]                        │
└─────────────────────────────────────────────────────┘
```

### Clicking "Purchase Additional Seats" Opens:
- **3-Step Purchase Flow Dialog**
  - Step 1: Select Quantity (choose number of seats)
  - Step 2: Review & Checkout (mock Stripe payment)
  - Step 3: Success confirmation

---

## Testing the Full Workflow

### 1. View Seat Management
✅ Navigate to `/settings/company/billing`
✅ See the SeatManagementCard at the top

### 2. Purchase Seats (Mock Flow)
✅ Click "Purchase Additional Seats"
✅ Select quantity (e.g., 5 seats)
✅ Click "Continue to Checkout"
✅ Click "Complete Purchase" (simulates Stripe)
✅ See success confirmation
✅ Notice available seats increase

### 3. Invite Team Member
✅ Go to "Team Members" tab (`/settings/company/team-members`)
✅ Click "Invite Team Member" button
✅ See available seats displayed in dialog
✅ Fill in member details
✅ Click "Send Invitation"
✅ Notice available seats decrease by 1 (reserved)

### 4. No Seats Available Scenario
✅ Purchase exactly 0 available seats (use all)
✅ Try to invite a new team member
✅ See warning: "No available seats"
✅ Click "Purchase Seats" button in dialog
✅ Redirected to billing page
✅ Purchase more seats
✅ Return and complete invitation

---

## Component Locations

- **SeatManagementCard**: `/components/SeatManagementCard.tsx`
- **SeatPurchaseFlow**: `/components/views/settings/SeatPurchaseFlow.tsx`
- **InviteTeamMemberDialog**: `/components/InviteTeamMemberDialog.tsx`
- **BillingSubscriptionView**: `/components/views/settings/BillingSubscriptionView.tsx`
- **TeamMembersTab**: `/components/company-settings-tabs/TeamMembersTab_NEW.tsx`

---

## Need Help?

If you don't see the Seat Management Card:

1. **Check the URL**: Make sure you're at `/settings/company/billing`
2. **Check the tab**: Make sure "Billing & Subscription" tab is selected
3. **Clear browser cache**: Sometimes needed for React apps
4. **Check console**: Open DevTools (F12) and look for errors
5. **Restart dev server**: `npm run dev` or refresh the page

---

## Current Mock Data

The app is using mock data with these defaults:
- **Total Seats**: 10
- **Active Members**: 5
- **Pending Invitations**: 1
- **Available Seats**: 4
- **Monthly Cost per Seat**: $49

You can modify these in:
- `BillingSubscriptionView.tsx` (firmSubscription state)
- `TeamMembersTab_NEW.tsx` (availableSeats state)
