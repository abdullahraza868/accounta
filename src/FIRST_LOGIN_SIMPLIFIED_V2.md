# First Login Workflow - Simplified (v2) - For Users WITH Phone Number

## Overview
Streamlined first login with three authentication methods, all requiring OTP verification before accessing the dashboard.

**IMPORTANT:** This workflow is for users who **already have a phone number** in the system. For users who need to add their phone number during first login, use `/workflows/first-login-add-phone` instead (see `FIRST_LOGIN_ADD_PHONE_WORKFLOW.md`).

---

## Authentication Flow

### Step 1: Choose Authentication Method

Users see three options:

1. **Sign in with Google** - OAuth authentication
2. **Sign in with Microsoft** - OAuth authentication  
3. **Send Magic Link** - Email-based passwordless authentication

---

## Complete Workflows

### Flow A: Google Sign-In

```
┌─────────────────────────────────────┐
│     CHOOSE AUTHENTICATION           │
│   [Sign in with Google]             │
└────────────┬────────────────────────┘
             │ User clicks Google
             ▼
┌─────────────────────────────────────┐
│   Google OAuth Authentication       │
└────────────┬────────────────────────┘
             │ OAuth Success
             ▼
┌─────────────────────────────────────┐
│   Send OTP to Phone                 │
│   "Code sent to your phone"         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   VERIFY YOUR PHONE                 │
│   Enter 6-digit code                │
│   [_ _ _ _ _ _]                     │
│   [Resend code]                     │
│   [Verify Code]                     │
└────────────┬────────────────────────┘
             │ OTP Verified
             ▼
┌─────────────────────────────────────┐
│   ✅ SUCCESS                        │
│   "Welcome to [Company]!"           │
│   Auto-redirect to dashboard...     │
└────────────┬────────────────────────┘
             │
             ▼
        DASHBOARD
```

### Flow B: Microsoft Sign-In

```
┌─────────────────────────────────────┐
│     CHOOSE AUTHENTICATION           │
│   [Sign in with Microsoft]          │
└────────────┬────────────────────────┘
             │ User clicks Microsoft
             ▼
┌─────────────────────────────────────┐
│   Microsoft OAuth Authentication    │
└────────────┬────────────────────────┘
             │ OAuth Success
             ▼
┌─────────────────────────────────────┐
│   Send OTP to Phone                 │
│   "Code sent to your phone"         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   VERIFY YOUR PHONE                 │
│   Enter 6-digit code                │
│   [_ _ _ _ _ _]                     │
│   [Resend code]                     │
│   [Verify Code]                     │
└────────────┬────────────────────────┘
             │ OTP Verified
             ▼
┌─────────────────────────────────────┐
│   ✅ SUCCESS                        │
│   "Welcome to [Company]!"           │
│   Auto-redirect to dashboard...     │
└────────────┬────────────────────────┘
             │
             ▼
        DASHBOARD
```

### Flow C: Magic Link

```
┌─────────────────────────────────────┐
│     CHOOSE AUTHENTICATION           │
│   Email: [________________]         │
│   [Send Magic Link]                 │
└────────────┬────────────────────────┘
             │ User enters email & clicks
             ▼
┌─────────────────────────────────────┐
│   Send Magic Link to Email          │
└────────────┬────────────────────────┘
             │ Email sent
             ▼
┌─────────────────────────────────────┐
│   CHECK YOUR EMAIL SCREEN           │
│   "Magic Link Sent!"                │
│   "We sent a link to: [email]"      │
│                                     │
│   Next Steps:                       │
│   1. Check your inbox               │
│   2. Click "Sign In" in email       │
│   3. You'll verify your phone       │
│                                     │
│   [Resend magic link]               │
│   [← Back to sign in options]       │
└────────────┬────────────────────────┘
             │ User clicks link in email
             │ Link contains token
             ▼
┌─────────────────────────────────────┐
│   Validate Magic Link Token         │
└────────────┬────────────────────────┘
             │ Token Valid
             ▼
┌─────────────────────────────────────┐
│   Send OTP to Phone                 │
│   "Code sent to your phone"         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   VERIFY YOUR PHONE                 │
│   Enter 6-digit code                │
│   [_ _ _ _ _ _]                     │
│   [Resend code]                     │
│   [Verify Code]                     │
└────────────┬────────────────────────┘
             │ OTP Verified
             ▼
┌─────────────────────────────────────┐
│   ✅ SUCCESS                        │
│   "Welcome to [Company]!"           │
│   Auto-redirect to dashboard...     │
└────────────┬────────────────────────┘
             │
             ▼
        DASHBOARD
```

---

## Key Features

### Simplified Authentication
- **No password setup required** - Passwordless authentication only
- **Three clear options** - Google, Microsoft, or Magic Link
- **Consistent OTP verification** - All methods require phone verification
- **Automatic redirect** - Seamless transition to dashboard after verification

### Security
- **Multi-factor authentication** - OAuth/Magic Link + OTP verification
- **Phone number verification** - Required for all users
- **Token-based magic links** - Secure, time-limited email links
- **Rate limiting** - 60-second countdown between OTP resends

### User Experience
- **Clear visual hierarchy** - Branded design throughout
- **Real-time validation** - Email format validation
- **Helpful messaging** - Contextual help text at each step
- **Loading states** - Visual feedback during all operations
- **Auto-focus** - Primary inputs focus automatically

---

## Step Details

### Step 1: Choose Authentication

**Screen Elements:**
- Company logo
- Welcome heading
- Google sign-in button (white, Google branding)
- Microsoft sign-in button (white, Microsoft branding)
- Divider with "Or" text
- Email input field
- Send Magic Link button (branded primary color)
- Info text explaining magic link

**Validation:**
- Email format validation
- Disabled send button if email is invalid

### Step 2: Check Your Email (Magic Link Only)

**Screen Elements:**
- Mail icon in circle
- "Magic Link Sent!" heading
- Email address display
- Numbered instructions:
  1. Check your inbox (and spam)
  2. Click "Sign In" button in email
  3. You'll be redirected to verify phone
- Resend magic link button
- Back to sign in options link
- Demo mode simulation button (for testing)

**Features:**
- Clear visual confirmation email was sent
- Step-by-step instructions for user
- Ability to resend if email not received
- Return to auth selection if needed
- Demo button simulates clicking email link

### Step 3: Verify OTP

**Screen Elements:**
- Shield icon
- "Verify Your Phone" heading
- Security verification info box
- 6-digit code input (individual boxes)
- Resend code button (with countdown)
- Verify Code button
- Back to sign in options link
- Demo code hint

**Features:**
- Auto-focus on first input box
- Auto-advance to next box on digit entry
- Paste support for full code
- Keyboard navigation (arrows, backspace)
- 60-second resend countdown

### Step 4: Success

**Screen Elements:**
- Green checkmark icon
- "Welcome to [Company]!" heading
- Success message
- User email display (in styled box)
- Auto-redirect indicator (pulsing dot)
- "Taking you to your dashboard..." text

**Behavior:**
- Shows for 1.5 seconds
- Automatically redirects to `/clients` (dashboard)

---

## Demo Mode

### Demo Codes
- **OTP Code**: `123456` (valid for verification)
- **Resend Countdown**: 60 seconds
- **Auto-redirect Delay**: 1.5 seconds

### Magic Link Simulation
In demo mode, after clicking "Send Magic Link":
1. Shows success toast
2. Displays "Check Your Email" screen with instructions
3. User clicks "Simulate Magic Link Click" button
4. Proceeds to OTP verification

In production:
1. User receives email with magic link
2. User clicks link in email
3. Link contains token and email in URL params
4. Page detects token and goes directly to OTP step

---

## Technical Details

### URL Parameters

**For Magic Link:**
```
/workflows/first-login?email=user@example.com&token=secure-magic-link-token
```

**For Invitation:**
```
/workflows/first-login?email=user@example.com&token=secure-invitation-token
```

### State Management

**Steps:**
```typescript
type Step = 'choose-auth' | 'check-email' | 'verify-otp' | 'success';
```

**Auth Methods:**
```typescript
type AuthMethod = 'google' | 'microsoft' | 'magic-link' | null;
```

### Auto-detection Logic

```typescript
// If user came from magic link, skip to OTP
useEffect(() => {
  if (tokenFromUrl && emailFromUrl) {
    setAuthMethod('magic-link');
    setStep('verify-otp');
    setResendCountdown(60);
  }
}, [tokenFromUrl, emailFromUrl]);
```

---

## API Integration Points

### Google OAuth
```typescript
// Redirect to Google OAuth
window.location.href = `/api/auth/google?token=${invitationToken}`;

// Callback should return to first login with auth state
// Then send OTP
POST /api/auth/send-otp
{
  "method": "phone",
  "userId": "user-id-from-oauth"
}
```

### Microsoft OAuth
```typescript
// Redirect to Microsoft OAuth
window.location.href = `/api/auth/microsoft?token=${invitationToken}`;

// Callback should return to first login with auth state
// Then send OTP
POST /api/auth/send-otp
{
  "method": "phone",
  "userId": "user-id-from-oauth"
}
```

### Magic Link
```typescript
// Send magic link
POST /api/auth/send-magic-link
{
  "email": "user@example.com",
  "invitationToken": "original-invitation-token"
}

// Response contains magic link token
{
  "magicLinkUrl": "/workflows/first-login?email=...&token=...",
  "expiresIn": 3600 // seconds
}
```

### OTP Verification
```typescript
// Verify OTP code
POST /api/auth/verify-otp
{
  "code": "123456",
  "token": "magic-link-or-session-token"
}

// Response
{
  "verified": true,
  "sessionToken": "new-session-token",
  "redirectUrl": "/clients"
}
```

---

## Comparison with Old Flow

### What Was Removed
- ❌ Set Password option
- ❌ Password strength validation
- ❌ Confirm password field
- ❌ Phone number collection step (assumed in backend)
- ❌ Multiple conditional paths based on phone availability
- ❌ Email OTP verification (for password users)

### What Was Simplified
- ✅ Single linear flow for all auth methods
- ✅ Consistent OTP verification step
- ✅ No password management
- ✅ Unified success screen with auto-redirect

### What Remains
- ✅ Google OAuth
- ✅ Microsoft OAuth
- ✅ Phone OTP verification
- ✅ Branded design system
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

---

## User Journey Summary

**For Google/Microsoft Authentication:**

1. **Choose** → User clicks Google or Microsoft
2. **Authenticate** → User completes OAuth
3. **Verify** → User enters 6-digit OTP code from phone
4. **Success** → User sees confirmation and is redirected to dashboard

**Total Steps:** 3

**For Magic Link Authentication:**

1. **Choose** → User enters email and clicks Send Magic Link
2. **Check Email** → User sees instructions to check email
3. **Click Link** → User clicks link in their email
4. **Verify** → User enters 6-digit OTP code from phone
5. **Success** → User sees confirmation and is redirected to dashboard

**Total Steps:** 4

**Time to Dashboard:** ~30-60 seconds (depending on how quickly user checks email and has phone nearby)

---

## Testing Checklist

### Google Sign-In
- [ ] Click Google button → OAuth flow
- [ ] After OAuth → OTP screen appears
- [ ] Enter OTP → Success screen
- [ ] Auto-redirect to dashboard works

### Microsoft Sign-In
- [ ] Click Microsoft button → OAuth flow
- [ ] After OAuth → OTP screen appears
- [ ] Enter OTP → Success screen
- [ ] Auto-redirect to dashboard works

### Magic Link
- [ ] Enter email → Validation works
- [ ] Click Send Magic Link → Success toast
- [ ] Check Email screen appears with instructions
- [ ] Email address displayed correctly
- [ ] Resend magic link button works
- [ ] Back to sign in options works
- [ ] Click "Simulate Magic Link Click" (demo)
- [ ] OTP screen appears
- [ ] Enter OTP → Success screen
- [ ] Auto-redirect to dashboard works

### OTP Screen
- [ ] Code input accepts 6 digits
- [ ] Auto-advance between boxes works
- [ ] Paste full code works
- [ ] Backspace navigation works
- [ ] Resend countdown works
- [ ] Resend button sends new code
- [ ] Back to sign in options works
- [ ] Demo code 123456 validates

### General
- [ ] Branded colors throughout
- [ ] Responsive on mobile
- [ ] Loading states show correctly
- [ ] Error messages are clear
- [ ] Auto-focus works on inputs

---

## Production Considerations

### Backend Requirements

1. **OAuth Integration**
   - Google OAuth 2.0 setup
   - Microsoft OAuth 2.0 setup
   - Callback URLs configured
   - User profile data extraction

2. **Magic Link System**
   - Secure token generation
   - Email delivery service
   - Token expiration (recommend 1 hour)
   - One-time use validation

3. **OTP System**
   - SMS/Phone service integration
   - Code generation (6-digit)
   - Code expiration (recommend 10 minutes)
   - Rate limiting (max 5 attempts)

4. **User Management**
   - Create user on first login
   - Link OAuth accounts to user
   - Store phone number securely
   - Session management

### Security Best Practices

- ✅ Use HTTPS for all endpoints
- ✅ Implement CSRF protection
- ✅ Rate limit OTP requests
- ✅ Expire magic links after use
- ✅ Log authentication attempts
- ✅ Implement account lockout after failed attempts
- ✅ Validate all tokens server-side

---

## File Updated

**Primary File:**
- `/components/views/FirstLoginSetPasswordView.tsx`

**Dependencies (unchanged):**
- `/components/ui/verification-code-input.tsx`
- `/components/GoogleLogo.tsx`
- `/components/MicrosoftLogo.tsx`
- `/lib/emailValidation.ts`
- `/contexts/BrandingContext.tsx`

**Related Files:**
- `/components/views/LoginView.tsx` - Regular login (still has OTP)
- `/components/views/ResetPasswordView.tsx` - Password reset (still has OTP)
