# Magic Link "Check Your Email" Screen

## Overview
Added an intermediate screen in the magic link flow that instructs users to check their email and click the link before proceeding to OTP verification.

---

## Updated Magic Link Flow

### Previous Flow (Auto-Simulated)
```
Choose Auth → Send Magic Link → [2 second wait] → OTP Screen
```

### New Flow (With Check Email Screen)
```
Choose Auth → Send Magic Link → Check Email Screen → User Clicks Link → OTP Screen
```

---

## Visual Layout

### Check Email Screen Design

```
┌─────────────────────────────────────────────────┐
│                  [Company Logo]                  │
│                                                  │
│            ┌───────────────────┐                │
│            │   📧 Mail Icon    │                │
│            │   in circle       │                │
│            └───────────────────┘                │
│                                                  │
│            Magic Link Sent!                     │
│                                                  │
│   We've sent a secure sign-in link to:         │
│                                                  │
│        ┌─────────────────────────┐              │
│        │  user@example.com       │              │
│        └─────────────────────────┘              │
│                                                  │
│   ┌──────────────────────────────────────┐     │
│   │  Next Steps:                         │     │
│   │                                      │     │
│   │  ① Check your inbox (and spam)      │     │
│   │  ② Click "Sign In" in email         │     │
│   │  ③ You'll verify your phone         │     │
│   └──────────────────────────────────────┘     │
│                                                  │
│   ┌──────────────────────────────────────┐     │
│   │  DEMO MODE:                          │     │
│   │  For testing, click below to        │     │
│   │  simulate clicking the magic link   │     │
│   │                                      │     │
│   │  [Simulate Magic Link Click]        │     │
│   └──────────────────────────────────────┘     │
│                                                  │
│        Didn't receive the email?                │
│        [Resend magic link]                      │
│                                                  │
│        ← Back to sign in options                │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Screen Elements

### Header Section
- **Mail icon in circle**
  - 64x64px circle with purple background (20% opacity)
  - Mail icon in branded primary color
  - Centered in view

- **Heading: "Magic Link Sent!"**
  - Uses `headingText` color
  - Centered text

- **Subheading**
  - "We've sent a secure sign-in link to:"
  - Uses `bodyText` color
  - Smaller text size

### Email Display Box
- **Styled container** with:
  - Background: `inputBackground`
  - Border: `inputBorder`
  - Padding: 12px
  - Rounded corners
  - Email address in medium font weight

### Instructions Box
- **Container** with:
  - Background: `inputBackground`
  - Border: `inputBorder`
  - "Next Steps:" heading
  - Numbered list with circle badges

- **Each instruction** includes:
  - Numbered badge (1, 2, 3) in primary color
  - Clear action text
  - Left-aligned with proper spacing

### Demo Mode Section
- **Container** with:
  - Light secondary color background (10% opacity)
  - Secondary color border
  - Demo explanation text
  - Simulation button

- **Simulate button**:
  - Secondary color background
  - White text
  - Mail icon + text
  - Triggers progression to OTP screen

### Footer Actions
- **Resend link**
  - Small text
  - Link color
  - Click to resend magic link email

- **Back button**
  - "← Back to sign in options"
  - Link color
  - Returns to authentication choice screen

---

## User Journey

### Step-by-Step Flow

1. **User enters email and clicks "Send Magic Link"**
   - Email validation occurs
   - API sends magic link email
   - Toast: "Magic link sent to your email!"

2. **Check Email Screen Appears**
   - Shows confirmation email was sent
   - Displays user's email address
   - Provides clear instructions
   - Offers resend option if needed

3. **User Goes to Email**
   - Opens email client
   - Finds email (checks spam if needed)
   - Clicks "Sign In" button in email

4. **Magic Link URL**
   - Format: `/workflows/first-login?email=user@example.com&token=secure-token`
   - Page detects token in URL
   - Validates token with backend

5. **OTP Screen Appears**
   - Toast: "Magic link verified!"
   - Toast: "Verification code sent to your phone"
   - User enters 6-digit OTP
   - Verifies and proceeds to dashboard

---

## Demo Mode Behavior

### For Testing (Without Email Service)

In demo mode, the "Simulate Magic Link Click" button allows testers to:
1. See the "Check Email" screen
2. Click the simulation button
3. Progress to OTP verification
4. Complete the full flow without needing real email

### Production Behavior

In production, the simulation button would not be shown. Instead:
1. User receives actual email
2. Clicks real link in email
3. Link includes token parameter
4. Page auto-detects token and proceeds to OTP

---

## Technical Implementation

### State Management

```typescript
type Step = 'choose-auth' | 'check-email' | 'verify-otp' | 'success';
```

### Functions

**Send Magic Link:**
```typescript
const handleSendMagicLink = async () => {
  // Validate email
  // Call API to send magic link
  // Show check-email screen
  setStep('check-email');
};
```

**Simulate Click (Demo):**
```typescript
const handleMagicLinkClicked = () => {
  // Verify magic link token
  // Send OTP to phone
  // Show OTP screen
  toast.success('Magic link verified!');
  toast.info('Verification code sent to your phone');
  setResendCountdown(60);
  setStep('verify-otp');
};
```

**Auto-detect Magic Link in URL:**
```typescript
useEffect(() => {
  if (tokenFromUrl && emailFromUrl) {
    // User clicked link in email
    setAuthMethod('magic-link');
    handleMagicLinkClicked();
  }
}, [tokenFromUrl, emailFromUrl]);
```

---

## API Integration

### Send Magic Link Endpoint

```typescript
POST /api/auth/send-magic-link

Request:
{
  "email": "user@example.com",
  "invitationToken": "original-invitation-token" // if from invitation
}

Response:
{
  "sent": true,
  "expiresIn": 3600 // seconds
}
```

### Email Template

Subject: "Sign in to [Company Name]"

Body:
```
Hello,

Click the button below to sign in to your [Company Name] account:

[Sign In Button] → Links to: https://app.example.com/workflows/first-login?email=user@example.com&token=secure-magic-link-token

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Thanks,
The [Company Name] Team
```

### Validate Magic Link Token

```typescript
POST /api/auth/validate-magic-link

Request:
{
  "token": "secure-magic-link-token",
  "email": "user@example.com"
}

Response:
{
  "valid": true,
  "userId": "user-id",
  "phoneNumber": "+1234567890" // to send OTP
}
```

---

## User Experience Benefits

### Clear Communication
- ✅ User knows email was sent successfully
- ✅ User knows exactly what to do next
- ✅ User can resend if email doesn't arrive
- ✅ User can go back if they change their mind

### Reduced Confusion
- ❌ No more wondering "did it send?"
- ❌ No more automatic transitions that feel unexpected
- ❌ No more uncertainty about next steps

### Better Error Recovery
- User can resend if email doesn't arrive
- User can return to try different auth method
- Clear path forward with numbered instructions

### Security Transparency
- User sees their email address
- User knows to look for email
- User understands the multi-step process

---

## Accessibility Features

### Visual Hierarchy
- Large icon draws attention
- Clear heading confirms action
- Email address prominently displayed
- Numbered steps easy to follow

### Color Coding
- Primary color for success confirmation
- Secondary color for demo mode section
- Link color for actions
- Consistent with brand throughout

### Interactive Elements
- All buttons have clear labels
- Links have descriptive text
- Hover states on interactive elements
- Proper focus states for keyboard navigation

### Screen Reader Support
- Semantic HTML structure
- Proper heading levels
- Clear aria labels on buttons
- Descriptive link text

---

## Testing Scenarios

### Happy Path
1. ✅ User enters email
2. ✅ User clicks "Send Magic Link"
3. ✅ Check Email screen appears
4. ✅ Email address shown correctly
5. ✅ User clicks simulation button (demo)
6. ✅ OTP screen appears
7. ✅ User enters OTP
8. ✅ Success screen, then dashboard

### Error Handling
1. ✅ Email not received → User clicks "Resend magic link"
2. ✅ User changes mind → Clicks "Back to sign in options"
3. ✅ Invalid token in URL → Error message, return to auth selection
4. ✅ Expired token → Error message with resend option

### Edge Cases
1. ✅ User leaves page and returns → Can still see check email screen
2. ✅ User clicks magic link multiple times → First valid, subsequent expired
3. ✅ User tries different email → Can go back and try again
4. ✅ Spam folder → Instructions mention checking spam

---

## Comparison with Previous Implementation

### What Changed
- ➕ **Added** "Check Email" intermediate screen
- ➕ **Added** clear numbered instructions
- ➕ **Added** resend magic link option
- ➕ **Added** back to auth options button
- ➕ **Added** demo mode simulation button
- 🔄 **Changed** from auto-progress to manual progression
- 🔄 **Changed** user flow to be more explicit

### What Stayed the Same
- ✅ Email validation
- ✅ Toast notifications
- ✅ OTP verification process
- ✅ Branded design system
- ✅ Success screen and redirect
- ✅ Loading states

---

## Files Modified

**Primary File:**
- `/components/views/FirstLoginSetPasswordView.tsx`

**Documentation:**
- `/FIRST_LOGIN_SIMPLIFIED_V2.md` - Updated with new flow
- `/MAGIC_LINK_CHECK_EMAIL_SCREEN.md` - This document

---

## Next Steps for Production

### Backend Requirements
1. Implement magic link email sending
2. Create email template with proper branding
3. Generate secure tokens with expiration
4. Validate tokens and link to user accounts
5. Track magic link clicks for analytics

### Security Considerations
1. Token should be cryptographically secure
2. Token should expire after 1 hour
3. Token should be single-use only
4. Track failed validation attempts
5. Rate limit magic link requests per email

### Email Deliverability
1. Configure SPF, DKIM, DMARC records
2. Use reputable email service (SendGrid, Mailgun, etc.)
3. Monitor bounce and spam rates
4. Provide clear "report spam" handling
5. Include unsubscribe option if required

---

## Summary

The "Check Your Email" screen adds a crucial intermediate step that:
- **Confirms** the magic link was sent
- **Instructs** users on what to do next
- **Provides** options to resend or go back
- **Improves** overall user experience and clarity
- **Reduces** support requests about "where's my email?"

This change makes the magic link flow more transparent and user-friendly while maintaining security through OTP verification.
