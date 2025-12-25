# Authentication Flow Diagrams

## Visual Workflow Maps for All Authentication Scenarios

---

## 1. FIRST LOGIN - Google/Microsoft Sign-In

```
┌─────────────────────────────────────────────────────────────┐
│                    CHOOSE AUTHENTICATION                     │
│  [Google Sign-In] [Microsoft Sign-In] [Set Up Password]     │
└────────────┬────────────────────────────────────────────────┘
             │ User clicks Google/Microsoft
             ▼
┌────────────────────────────────────────────────────────────┐
│                    OAuth Authentication                     │
│              (Google/Microsoft handles login)               │
└────────────┬───────────────────────────────────────────────┘
             │ OAuth Success
             ▼
         Has Phone?
             │
      ┌──────┴──────┐
      │             │
   YES│             │NO
      │             │
      ▼             ▼
┌──────────┐   ┌──────────────────┐
│ Send OTP │   │  Collect Phone   │
│ to Phone │   │  Number Screen   │
└────┬─────┘   └────────┬─────────┘
     │                  │
     │                  ▼
     │         ┌──────────────────┐
     │         │   Send OTP to    │
     │         │      Phone       │
     │         └────────┬─────────┘
     │                  │
     └──────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│               VERIFY PHONE OTP SCREEN                       │
│          Enter 6-digit code from phone                      │
│                 [Resend Code]                               │
└────────────┬───────────────────────────────────────────────┘
             │ OTP Verified
             ▼
┌────────────────────────────────────────────────────────────┐
│                  ✅ SUCCESS SCREEN                          │
│              "Welcome to [Company]!"                        │
│              [Go to Dashboard] ────────────► DASHBOARD      │
└────────────────────────────────────────────────────────────┘
```

---

## 2. FIRST LOGIN - Set Up Password

```
┌─────────────────────────────────────────────────────────────┐
│                    CHOOSE AUTHENTICATION                     │
│  [Google Sign-In] [Microsoft Sign-In] [Set Up Password]     │
└────────────┬────────────────────────────────────────────────┘
             │ User clicks Set Up Password
             ▼
┌────────────────────────────────────────────────────────────┐
│                  SET PASSWORD SCREEN                        │
│    • Username (Email): [shown, read-only]                  │
│    • Password: [input with requirements]                   │
│    • Confirm Password: [input]                             │
│    • Requirements checklist (live validation)              │
└────────────┬───────────────────────────────────────────────┘
             │ Password Set
             ▼
         Has Phone?
             │
      ┌──────┴──────┐
      │             │
   YES│             │NO
      │             │
      ▼             ▼
┌──────────┐   ┌──────────────────┐
│ Redirect │   │   Send OTP to    │
│ to Login │   │      EMAIL       │
│   Page   │   └────────┬─────────┘
└──────────┘            │
                        ▼
              ┌──────────────────┐
              │ VERIFY EMAIL OTP │
              │  Enter 6-digit   │
              │      code        │
              └────────┬─────────┘
                       │ OTP Verified
                       ▼
              ┌──────────────────┐
              │  Collect Phone   │
              │  Number Screen   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   Send OTP to    │
              │      PHONE       │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ VERIFY PHONE OTP │
              │  Enter 6-digit   │
              │      code        │
              └────────┬─────────┘
                       │ OTP Verified
                       ▼
              ┌──────────────────┐
              │    Redirect to   │
              │    Login Page    │
              └──────────────────┘
```

---

## 3. REGULAR LOGIN FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN SCREEN                           │
│               [Sign in with Google]                         │
│                       OR                                    │
│   • Email: [input]                                         │
│   • Password: [input]                                      │
│   • [Remember me]  [Forgot password?]                      │
│   • [Sign In]                                              │
└────────────┬────────────────────────────────────────────────┘
             │ Credentials Validated
             ▼
┌────────────────────────────────────────────────────────────┐
│                   Send OTP to Phone                         │
│            (or email if no phone on file)                   │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│               VERIFY YOUR IDENTITY SCREEN                   │
│    "Enter the verification code sent to your phone"        │
│                                                             │
│          [_] [_] [_] [_] [_] [_]                          │
│                                                             │
│              [Resend code in 60s]                          │
│              [← Back to login]                             │
│                                                             │
│              [Verify Code]                                 │
└────────────┬───────────────────────────────────────────────┘
             │ OTP Verified
             ▼
┌────────────────────────────────────────────────────────────┐
│                     DASHBOARD                               │
│              Successfully logged in!                        │
└────────────────────────────────────────────────────────────┘
```

---

## 4. RESET PASSWORD FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                RESET PASSWORD SCREEN                        │
│          (User arrives via email link)                      │
│                                                             │
│   • Email: [shown, read-only]                              │
│   • New Password: [input with requirements]                │
│   • Confirm Password: [input]                              │
│   • Requirements checklist (live validation)               │
│                                                             │
│              [Reset Password]                              │
└────────────┬────────────────────────────────────────────────┘
             │ Password Updated
             ▼
┌────────────────────────────────────────────────────────────┐
│                   Send OTP to Email                         │
│          "Verification code sent to your email"            │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│             VERIFY YOUR IDENTITY SCREEN                     │
│    "Enter the verification code sent to [email]"           │
│                                                             │
│          [_] [_] [_] [_] [_] [_]                          │
│                                                             │
│              [Resend code in 60s]                          │
│                                                             │
│              [Verify Code]                                 │
└────────────┬───────────────────────────────────────────────┘
             │ OTP Verified
             ▼
┌────────────────────────────────────────────────────────────┐
│               ✅ SUCCESS SCREEN                             │
│          "Password Reset Successful!"                       │
│     "You can now sign in with your new password"           │
│                                                             │
│          [Go to Login] (also auto-redirects)               │
└────────────┬───────────────────────────────────────────────┘
             │ Auto-redirect after 2 seconds
             ▼
┌────────────────────────────────────────────────────────────┐
│                     LOGIN PAGE                              │
└────────────────────────────────────────────────────────────┘
```

---

## Key Decision Points

### Has Phone on File?
This determines the flow path:
- **YES** → Simpler flow, send OTP to phone
- **NO** → Additional steps to collect and verify phone

### Authentication Method
Three options on first login:
1. **Google** → OAuth flow → Phone collection (if needed) → OTP verification
2. **Microsoft** → OAuth flow → Phone collection (if needed) → OTP verification
3. **Password** → Set password → Email OTP (if no phone) → Phone collection (if no phone) → Phone OTP → Login page

### OTP Delivery Method
Priority:
1. **Phone** (primary) - if phone number is on file
2. **Email** (fallback) - if no phone number available

---

## State Transitions

### First Login Steps (Password Method, No Phone)
```
choose-auth → set-password → verify-email-otp → collect-phone → verify-phone-otp → [redirect to login]
```

### First Login Steps (Password Method, Has Phone)
```
choose-auth → set-password → [redirect to login]
```

### First Login Steps (Google/Microsoft, No Phone)
```
choose-auth → [OAuth] → collect-phone → verify-phone-otp → success → [redirect to dashboard]
```

### First Login Steps (Google/Microsoft, Has Phone)
```
choose-auth → [OAuth] → verify-phone-otp → success → [redirect to dashboard]
```

### Regular Login Steps
```
credentials → verify-otp → [redirect to dashboard]
```

### Reset Password Steps
```
set-password → verify-otp → success → [redirect to login]
```

---

## Component Reuse

### Screens/Components Used Across Flows

| Component | First Login | Regular Login | Reset Password |
|-----------|-------------|---------------|----------------|
| Password Setup | ✅ | ❌ | ✅ |
| Phone Collection | ✅ | ❌ | ❌ |
| Email OTP Verify | ✅ | ❌ | ✅ |
| Phone OTP Verify | ✅ | ✅ | ❌ |
| Success Screen | ✅ | ❌ | ✅ |
| OAuth Options | ✅ | ✅ | ❌ |

### Shared UI Components
- `VerificationCodeInput` - Used in all OTP verification screens
- `PhoneInput` - Used in phone collection screens
- Password requirements checklist - Used in password setup screens
- Resend countdown timer - Used in all OTP screens

---

## Error Handling Flows

### Invalid OTP Code
```
[OTP Screen] → User enters wrong code → Toast: "Invalid code" → Stay on OTP screen
```

### Expired OTP
```
[OTP Screen] → Resend countdown expires → User can click "Resend code" → New OTP sent
```

### Network Error
```
[Any Screen] → API call fails → Toast: Error message → Stay on current screen
```

### Password Validation Error
```
[Password Screen] → Click submit with weak password → Toast: "Password does not meet requirements" → Stay on screen
```

---

## Demo Mode Behavior

All flows include demo mode features:
- **Demo OTP Code**: `123456` always validates successfully
- **Demo Controls**: Toggle phone availability (first login only)
- **Simulated Delays**: 1000ms for API calls, 500ms for resend
- **Auto-focus**: Primary input fields auto-focus on screen load
- **Toast Messages**: Clear feedback for every action

---

## Security Considerations

1. **Multiple Verification Layers**
   - First login: Password/OAuth + Email OTP + Phone OTP
   - Regular login: Password + Phone OTP
   - Reset password: New password + Email OTP

2. **Phone Number Verification**
   - Required for all users
   - Verified via OTP before account activation

3. **Rate Limiting** (to be implemented in backend)
   - 60-second countdown between OTP resends
   - Prevent brute force attacks on OTP

4. **Secure Token Handling**
   - Invitation tokens in URL for first login
   - Reset tokens in URL for password reset
   - Session tokens after successful authentication

---

## User Experience Patterns

### Progressive Disclosure
- Show only relevant options at each step
- Hide complexity until needed
- Clear step indicators in headings

### Immediate Feedback
- Real-time password strength validation
- Toast notifications for all actions
- Visual loading states during API calls

### Error Recovery
- "Back to login" option during OTP verification
- Resend OTP option with countdown
- Clear error messages with actionable guidance

### Accessibility
- Auto-focus on primary inputs
- Keyboard navigation support
- Clear labels and instructions
- Disabled states for invalid actions
