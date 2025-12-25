# Authentication Workflows Documentation

## Overview
This document describes the passwordless authentication system with comprehensive user flows for first-time login, magic link expiration handling, and legal compliance.

## Workflows

### 1. First Login - Passwordless (Has Phone)
**Path:** `/workflows/first-login`

**User Type:** Users who already have a phone number in the system

**Flow:**
1. User chooses authentication method:
   - Google OAuth
   - Microsoft OAuth
   - Magic Link (email)
2. If Magic Link: User receives email and clicks the link
3. System sends OTP to registered phone number
4. User must agree to:
   - ✅ SMS/text message permissions
   - ✅ Privacy Policy
   - ✅ Terms & Conditions
5. User enters 6-digit OTP code
6. Redirect to dashboard on success

**Key Features:**
- All three terms/privacy checkboxes must be checked before verification
- Warning message if user tries to proceed without agreeing
- Links to view full Privacy Policy and Terms & Conditions
- Resend OTP functionality with 60-second countdown
- Demo code: `123456`

---

### 2. First Login - Add Phone Number
**Path:** `/workflows/first-login-add-phone`

**User Type:** Users who need to add their phone number

**Flow:**
1. User chooses authentication method:
   - Google OAuth
   - Microsoft OAuth
   - Magic Link (email)
2. If Magic Link: User receives email and clicks the link
3. User adds their phone number
4. System sends OTP to new phone number
5. User must agree to:
   - ✅ SMS/text message permissions
   - ✅ Privacy Policy
   - ✅ Terms & Conditions
6. User enters 6-digit OTP code
7. Redirect to dashboard on success

**Key Features:**
- Phone number validation with proper formatting
- Same terms/privacy requirements as standard login
- Auto-skip to phone collection if coming from magic link
- Resend OTP functionality
- Demo code: `123456`

---

### 3. Link Expired
**Path:** `/workflows/link-expired`

**Query Parameters:**
- `email` - User's email address (optional)
- `reason` - Either `expired` or `invalid`

**User Experience:**
- **If email is in URL:** Automatically sends a new magic link
- **If no email:** User can manually enter email and request new link

**Flow:**
1. User clicks expired/invalid magic link
2. Redirected to Link Expired page
3. System automatically sends new magic link (if email available)
4. User receives success confirmation
5. User checks email for new link
6. User has 15 minutes to use the new link

**Key Features:**
- Automatic link resend for better UX
- Clear explanation of 15-minute expiration policy
- Manual resend option if automatic send fails
- Option to use different email address
- Loading state during automatic send

---

## Legal Documents

### Privacy Policy
**Path:** `/privacy-policy`

**Sections:**
- Information We Collect
- How We Use Your Information
- Data Security
- Your Rights
- Third-Party Services
- Data Retention
- Contact Information

**Access:**
- Linked from authentication checkboxes
- Opens in new tab for easy review
- Must be agreed to before account activation

---

### Terms & Conditions
**Path:** `/terms-and-conditions`

**Sections:**
- Acceptance of Terms
- User Account
- Acceptable Use
- Prohibited Activities
- Limitation of Liability
- Termination
- Governing Law
- Contact Information

**Access:**
- Linked from authentication checkboxes
- Opens in new tab for easy review
- Must be agreed to before account activation

---

## SMS/Text Message Permissions

**What Users Agree To:**
- Receive verification codes via SMS
- Receive important account notifications
- Receive security alerts

**Implementation:**
- Required checkbox in both login workflows
- Must be agreed to before OTP verification
- Cannot proceed without agreement
- Clear, simple language explaining the permission

---

## Security Features

### Magic Link Expiration
- **Duration:** 15 minutes
- **Reason:** Security best practice
- **Handling:** Automatic new link generation
- **User Experience:** Seamless with clear messaging

### OTP Verification
- **Code Length:** 6 digits
- **Delivery:** SMS to verified phone number
- **Resend:** Available after 60-second cooldown
- **Demo Mode:** Code `123456` for testing

### Terms Agreement Tracking
- All checkboxes must be checked
- Visual warning if user tries to proceed without agreeing
- Backend should store consent timestamp (production)
- Links to full legal documents for transparency

---

## Testing Workflows

**Access Test Flows:**
1. Navigate to `/workflows/login`
2. Choose a workflow to test
3. Follow the step-by-step process

**Available Test Workflows:**
- Tenant Not Found
- First Login - Passwordless (Has Phone)
- First Login - Add Phone Number
- Link Expired

**Demo Features:**
- All workflows are fully functional in demo mode
- OTP code `123456` works for verification
- Magic links auto-redirect after brief delay
- No actual emails or SMS sent

---

## Production Considerations

### Before Launch:
1. **Email Service:**
   - Configure actual email delivery
   - Design branded email templates
   - Set up magic link generation with real tokens
   - Implement proper link expiration logic

2. **SMS Service:**
   - Integrate with SMS provider (Twilio, etc.)
   - Generate real OTP codes
   - Implement rate limiting
   - Add phone number validation

3. **Security:**
   - Implement proper token generation
   - Add rate limiting for magic links
   - Add rate limiting for OTP sends
   - Store consent timestamps in database
   - Implement token invalidation after use
   - Add CSRF protection

4. **Legal:**
   - Customize Privacy Policy for your company
   - Customize Terms & Conditions
   - Add versioning for legal documents
   - Track user consent to specific versions
   - Implement consent withdrawal mechanism

5. **Analytics:**
   - Track workflow completion rates
   - Monitor link expiration rates
   - Track OTP retry attempts
   - Monitor terms agreement dropout

---

## Error Handling

### Common Scenarios:
- **Invalid Email:** Validation before sending magic link
- **Phone Already Exists:** Handle duplicate phone numbers
- **Invalid OTP:** Clear error message, allow retry
- **Expired OTP:** Option to resend
- **Network Errors:** Graceful failure with retry options
- **Email Delivery Failure:** Alternative authentication options

---

## User Support

### Help Resources:
- Clear error messages throughout
- "Contact administrator" option
- Resend functionality for all communications
- Back navigation to try different methods
- Demo codes for testing

---

## API Integration Notes

### Endpoints Needed:
1. `POST /auth/magic-link` - Send magic link
2. `GET /auth/verify-magic-link` - Verify token
3. `POST /auth/send-otp` - Send OTP code
4. `POST /auth/verify-otp` - Verify OTP
5. `POST /auth/oauth/google` - Google OAuth callback
6. `POST /auth/oauth/microsoft` - Microsoft OAuth callback
7. `POST /user/consent` - Store terms agreement

### Magic Link Structure:
```
https://your-domain.com/workflows/first-login?token=abc123&email=user@example.com
```

### Error Redirect:
```
https://your-domain.com/workflows/link-expired?email=user@example.com&reason=expired
```

---

## Mobile Responsiveness

All workflows are fully responsive and tested on:
- Mobile phones (320px - 480px)
- Tablets (481px - 768px)
- Desktop (769px+)

Key mobile features:
- Touch-friendly buttons
- Responsive layouts
- Easy-to-read text
- Optimized input fields
- Full viewport utilization

---

## Accessibility

WCAG 2.1 AA Compliance:
- Semantic HTML
- Proper ARIA labels
- Keyboard navigation
- Color contrast ratios
- Screen reader support
- Focus indicators

---

## Maintenance

### Regular Updates:
- Review and update legal documents annually
- Test all workflows quarterly
- Monitor error rates
- Update demo codes as needed
- Review security practices

### Version Control:
- Track changes to legal documents
- Maintain changelog for workflows
- Document API changes
- Keep screenshots up to date

---

Last Updated: November 11, 2025
Version: 1.0.0
