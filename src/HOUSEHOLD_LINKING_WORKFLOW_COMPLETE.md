# Household Linking Workflow - Complete Implementation

## Overview
Complete household/spouse linking system with inline visual states, invitation management, and public invitation response page.

---

## Workflow States

### 1. **No Link** (Initial State)
- **Location**: Profile page
- **Display**: Purple info box with "No spouse linked yet" message
- **Action**: "Manage Household" button to start process

### 2. **Sending Invitation** (Active Process)
- **Visual**: 3-step progress indicator
  - Step 1: Enter Email (active)
  - Step 2: Sending (loading spinner)
  - Step 3: Invitation Sent (checkmark)
- **Form**: Email input with Send/Cancel buttons
- **Validation**: Email required
- **API Call**: Send invitation → creates pending status
- **Duration**: ~1.5 seconds
- **Result**: Transitions to "Pending" state

### 3. **Pending** (Waiting for Response)
- **Display**: Yellow/amber warning box
- **Shows**:
  - Recipient email
  - Sent date/time
  - Expiration date (7 days from sent)
- **Actions**:
  - **Resend** button - sends new invitation, resets 7-day timer
  - **Cancel** button - cancels invitation, returns to "No Link"
- **Test Buttons** (for development):
  - [Test] Accept - simulates spouse acceptance
  - [Test] Reject - simulates spouse rejection
  - [Test] Expire - simulates expiration

### 4. **Linked** (Successfully Connected)
- **Display**: Green success box
- **Shows**:
  - Spouse name
  - Spouse email
  - Linked date
  - **Shared Access section**:
    - ✓ Tax return deliverables (both receive copies)
    - ✗ Separate document storage (not shared)
    - ✗ No connection to uploaded documents
- **Action**: "Unlink Spouse" button
  - Confirms with popup
  - Returns to "No Link" state

### 5. **Rejected** (Spouse Declined)
- **Display**: Red error box
- **Message**: "Your spouse declined the household linking invitation"
- **Action**: "Send New" button
  - Returns to "No Link" state
  - Opens invitation form

### 6. **Expired** (Invitation Expired)
- **Display**: Gray neutral box
- **Message**: "The invitation you sent has expired after 7 days"
- **Action**: "Send New" button
  - Returns to "No Link" state
  - Opens invitation form

---

## Spouse Invitation Response Page

### URL
`/client-portal/household/invitation?token={INVITATION_TOKEN}`

### Access
- **Public** (no login required)
- Accessed via email link sent to spouse
- Can also be accessed while logged in to profile

### States

#### **Loading**
- Validates invitation token
- Shows spinner with "Validating invitation..." message
- ~1 second duration

#### **Valid Invitation**
- **Display**:
  - Purple Users icon
  - "You've Been Invited!" heading
  - Invitation details card:
    - From: Sender name
    - Sender Email
    - Your Email (recipient)
  - "What will be shared" section (same as profile page)
  - Expiration notice
- **Actions**:
  - **Decline** button (outline, with XCircle icon)
    - Confirms with popup
    - Shows rejected state
  - **Accept & Link Household** button (primary)
    - Shows loading spinner
    - ~1.5 seconds
    - Shows accepted state

#### **Accepted**
- Green checkmark icon
- "Household Linked Successfully!" message
- "Redirecting you to login..." message
- Auto-redirects to `/client-portal/login` after 3 seconds

#### **Rejected/Declined**
- Red X icon
- "Invitation Declined" message
- "Go to Login" button

#### **Invalid/Expired**
- Red alert icon
- Different messages for invalid vs expired
- "Go to Login" button

---

## File Structure

### Core Files
```
/pages/client-portal/
├── profile/ClientPortalProfile.tsx          # Main household management
├── household/HouseholdInvitationResponse.tsx # Public invitation response
└── settings/ClientPortalHousehold.tsx       # Legacy (can be removed)

/routes/AppRoutes.tsx                        # Routing configuration
```

### Routes
```tsx
// Public (no login)
/client-portal/household/invitation?token=xxx

// Protected (login required)
/client-portal/profile  # Contains household management section
```

---

## User Journey

### Primary User (Sender)
1. Goes to Profile page
2. Sees "No spouse linked yet" box
3. Clicks "Manage Household"
4. Sees inline form with 3-step visual progress
5. Enters spouse email
6. Clicks "Send Invitation"
7. Sees sending animation (spinner)
8. Sees success confirmation
9. Returns to profile showing "Pending" status with:
   - Spouse email
   - Sent date
   - Expiration date
   - Resend/Cancel buttons
10. Can test acceptance with [Test] buttons

### Spouse (Recipient)
1. Receives email with link containing token
2. Clicks link → opens `/client-portal/household/invitation?token=xxx`
3. Sees loading validation
4. Sees invitation details:
   - Who sent it
   - What will be shared
   - When it expires
5. Clicks "Accept & Link Household" or "Decline"
6. If accepted:
   - Sees success message
   - Auto-redirects to login
   - Primary user's profile updates to "Linked" state
7. If declined:
   - Sees decline confirmation
   - Primary user's profile updates to "Rejected" state

---

## State Transitions

```
No Link
  ↓ (Click "Manage Household")
Sending Invitation Form
  ↓ (Enter email, click Send)
Sending Animation
  ↓ (API call completes)
Pending
  ↓ Spouse clicks Accept
Linked
  ↓ OR Spouse clicks Decline
Rejected → Can send new → Back to No Link
  ↓ OR 7 days pass
Expired → Can send new → Back to No Link

Linked
  ↓ (Click "Unlink Spouse", confirm)
No Link
```

---

## Visual Design

### Color Coding
- **Purple** - Info/Initial state (No Link, Sending)
- **Yellow/Amber** - Pending/Warning (Waiting for response)
- **Green** - Success (Linked)
- **Red** - Error (Rejected)
- **Gray** - Neutral (Expired)

### Icons
- **Users** - Household/General
- **UserPlus** - Send invitation
- **Mail** - Email-related
- **Clock** - Pending/Expiration
- **Check** - Success/Linked
- **XCircle** - Rejected/Declined
- **AlertCircle** - Expired/Invalid
- **RefreshCw** - Resend
- **Send** - Send new
- **UserMinus** - Unlink
- **LinkIcon** - Connection
- **Loader2** - Loading

### Animations
- **Motion** (Framer Motion) for smooth transitions
- `AnimatePresence` with mode="wait" for state changes
- Initial: `opacity: 0, y: 10`
- Animate: `opacity: 1, y: 0`
- Exit: `opacity: 0, y: -10`
- Duration: 0.2s

---

## Key Features

### ✅ Inline Management
- No navigation to separate page
- All states visible in same section
- Smooth visual transitions

### ✅ Visual Progress
- 3-step stepper shows current progress
- Clear visual feedback at each step

### ✅ Comprehensive States
- Handles all scenarios: pending, linked, rejected, expired
- Clear messaging for each state
- Appropriate actions for each state

### ✅ Invitation Control
- Can cancel pending invitations
- Can resend invitations (resets timer)
- Shows expiration countdown

### ✅ Unlink Capability
- Divorce scenario handled
- Confirmation before unlinking
- Returns to clean state

### ✅ Access Clarity
- Explicitly shows what IS shared (tax deliverables)
- Explicitly shows what IS NOT shared (documents, storage)

### ✅ Public Response
- No login required for spouse to respond
- Clean, branded experience
- Mobile-responsive

### ✅ Test Buttons
- [Test] Accept, Reject, Expire buttons in pending state
- For development/demo purposes
- Should be removed in production or hidden behind feature flag

---

## API Integration Points

### Send Invitation
```tsx
// POST /api/household/send-invitation
{
  spouseEmail: string
}

// Response
{
  invitationId: string,
  token: string,
  sentDate: Date,
  expiresDate: Date
}
```

### Cancel Invitation
```tsx
// POST /api/household/cancel-invitation
{
  invitationId: string
}
```

### Resend Invitation
```tsx
// POST /api/household/resend-invitation
{
  invitationId: string
}

// Response - new token and dates
{
  token: string,
  sentDate: Date,
  expiresDate: Date
}
```

### Validate Token
```tsx
// GET /api/household/validate-token?token=xxx

// Response
{
  valid: boolean,
  status: 'valid' | 'expired' | 'invalid' | 'already_used',
  invitationData: {
    senderName: string,
    senderEmail: string,
    recipientEmail: string,
    sentDate: Date,
    expiresDate: Date
  }
}
```

### Accept Invitation
```tsx
// POST /api/household/accept-invitation
{
  token: string
}

// Response
{
  success: boolean,
  linkedData: {
    name: string,
    email: string,
    linkedDate: Date
  }
}
```

### Reject Invitation
```tsx
// POST /api/household/reject-invitation
{
  token: string
}
```

### Unlink Spouse
```tsx
// POST /api/household/unlink
{}

// Response
{
  success: boolean
}
```

### Get Household Status
```tsx
// GET /api/household/status

// Response
{
  status: 'none' | 'pending' | 'linked' | 'rejected' | 'expired',
  invitationData: {...} | null,
  linkedSpouse: {...} | null
}
```

---

## Email Template

### Subject
`{SenderName} has invited you to link your household`

### Body
```
Hi {RecipientName},

{SenderName} ({SenderEmail}) has invited you to link your household accounts.

By linking your accounts, both of you will receive copies of your tax return deliverables. Your document storage will remain separate and private.

Please click the link below to accept or decline this invitation:

{ACCEPT_LINK}

This invitation will expire on {ExpirationDate}.

If you did not expect this invitation, you can safely ignore this email.

Best regards,
{FirmName}
```

---

## Security Considerations

1. **Token Security**
   - Tokens should be cryptographically secure random strings
   - One-time use (marked as used after acceptance/rejection)
   - Expire after 7 days
   - Invalidated if cancelled

2. **Email Validation**
   - Verify email format
   - Check for existing household links
   - Prevent duplicate invitations to same email

3. **Rate Limiting**
   - Limit invitation sends per user (e.g., 5 per day)
   - Prevent spam

4. **Confirmation**
   - Unlink requires confirmation popup
   - Rejection requires confirmation popup

---

## Testing Checklist

### Profile Page States
- [ ] No Link state displays correctly
- [ ] "Manage Household" button opens inline form
- [ ] Email validation works
- [ ] Send invitation shows progress stepper
- [ ] Pending state shows correct information
- [ ] Resend button works and updates dates
- [ ] Cancel button returns to No Link
- [ ] [Test] Accept button transitions to Linked
- [ ] [Test] Reject button transitions to Rejected
- [ ] [Test] Expire button transitions to Expired
- [ ] Linked state shows spouse details
- [ ] Linked state shows access info correctly
- [ ] Unlink button works with confirmation
- [ ] Rejected state shows Send New button
- [ ] Expired state shows Send New button
- [ ] All animations are smooth

### Invitation Response Page
- [ ] Loading state shows during validation
- [ ] Invalid token shows error
- [ ] Valid invitation shows all details
- [ ] Accept button shows loading state
- [ ] Accept transitions to success
- [ ] Accept auto-redirects to login
- [ ] Decline requires confirmation
- [ ] Decline shows declined state
- [ ] Page is mobile responsive
- [ ] Branding colors applied correctly

### State Transitions
- [ ] No Link → Sending → Pending works
- [ ] Pending → Linked works
- [ ] Pending → Rejected works
- [ ] Pending → Expired works
- [ ] Linked → No Link (unlink) works
- [ ] Rejected → No Link works
- [ ] Expired → No Link works

---

## Future Enhancements

1. **Invitation History**
   - Show list of all sent invitations
   - Track acceptance/rejection dates

2. **Multiple Households**
   - Support for multiple linked users
   - Parent-child relationships

3. **Email Notifications**
   - Notify sender when spouse accepts/rejects
   - Reminder emails before expiration

4. **Custom Expiration**
   - Allow setting custom expiration dates
   - Default 7 days, can override

5. **Access Levels**
   - Different levels of sharing
   - Granular permissions

---

## Status
✅ **COMPLETE** - Ready for backend integration and testing
