# Authentication Architecture - Complete System

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION SYSTEM                          │
│                    (Completely Passwordless)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐             ┌───────▼────────┐
        │  ADMIN SIDE    │             │ CLIENT PORTAL  │
        │   (Firm Team)  │             │   (Clients)    │
        └───────┬────────┘             └───────┬────────┘
                │                               │
        ┌───────┴────────┐             ┌───────┴────────┐
        │                │             │                │
    ┌───▼───┐      ┌────▼────┐   ┌────▼────┐    ┌────▼────┐
    │Normal │      │ First   │   │ Normal  │    │Household│
    │Login  │      │ Login   │   │ Login   │    │Invitation│
    └───────┘      └────┬────┘   └─────────┘    └─────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
      ┌──────▼──────┐      ┌──────▼──────┐
      │ Has Phone   │      │Needs Phone  │
      │  Workflow   │      │  Workflow   │
      └─────────────┘      └─────────────┘
```

---

## Admin Side Authentication

### 1. Normal Login (`/login`)

**For:** Existing team members logging in

**Flow:**
```
Enter Email
    ↓
Tenant Selection (if multiple)
    ↓
Choose Auth Method
  ├─ Google OAuth
  ├─ Microsoft OAuth
  └─ Magic Link
    ↓
OTP to existing phone
    ↓
Dashboard
```

**Route:** `/login`  
**Component:** `LoginView.tsx`

---

### 2. First Login - Has Phone (`/workflows/first-login`)

**For:** New team members with phone in system

**Flow:**
```
Invitation Link
    ↓
Choose Auth Method
  ├─ Google OAuth
  ├─ Microsoft OAuth
  └─ Magic Link
    ↓
OTP to existing phone
    ↓
Dashboard
```

**Route:** `/workflows/first-login`  
**Component:** `FirstLoginSetPasswordView.tsx`  
**Steps:** 3

---

### 3. First Login - Needs Phone (`/workflows/first-login-add-phone`)

**For:** New team members without phone in system

**Flow:**
```
Invitation Link
    ↓
Choose Auth Method
  ├─ Google OAuth
  ├─ Microsoft OAuth
  └─ Magic Link
    ↓
Add Phone Number
    ↓
OTP to new phone
    ↓
Dashboard
```

**Route:** `/workflows/first-login-add-phone`  
**Component:** `FirstLoginAddPhoneView.tsx`  
**Steps:** 4

---

## Client Portal Authentication

### 1. Normal Login (`/client-portal/login`)

**For:** Existing clients logging in

**Flow:**
```
Enter Email
    ↓
Choose Auth Method
  ├─ Google OAuth
  ├─ Microsoft OAuth
  └─ Magic Link
    ↓
OTP to phone
    ↓
Client Dashboard
```

**Route:** `/client-portal/login`  
**Component:** `ClientPortalLogin.tsx`

---

### 2. Household Invitation (`/client-portal/household/invitation`)

**For:** Spouse/partner invited to join household

**Flow:**
```
Invitation Link (from email)
    ↓
Accept/Decline Screen
    ↓
If Accept:
  Choose Auth Method
    ↓
  OTP to phone
    ↓
  Linked to Primary Account
    ↓
  Client Dashboard
```

**Route:** `/client-portal/household/invitation`  
**Component:** `HouseholdInvitationResponse.tsx`

---

## Authentication Methods (All Workflows)

### Method 1: Google OAuth

```
┌──────────────────────┐
│  User clicks Google  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Redirect to Google │
│   OAuth consent page │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User authorizes app │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Google redirects back│
│   with auth code     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Exchange code for    │
│   access token       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Create/update user  │
│   session in system  │
└──────────┬───────────┘
           │
           ▼
     Next Step (OTP or Add Phone)
```

---

### Method 2: Microsoft OAuth

```
┌──────────────────────┐
│User clicks Microsoft │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Redirect to Microsoft│
│   OAuth consent page │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User authorizes app │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│Microsoft redirects   │
│  back with auth code │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Exchange code for    │
│   access token       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Create/update user  │
│   session in system  │
└──────────┬───────────┘
           │
           ▼
     Next Step (OTP or Add Phone)
```

---

### Method 3: Magic Link

```
┌──────────────────────┐
│  User enters email   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Generate secure token│
│  (expires in 1 hour) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Send email with     │
│    magic link        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  "Check Your Email"  │
│    screen shows      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User clicks link    │
│   in their email     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Validate token on    │
│   server side        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Create/update user  │
│   session in system  │
└──────────┬───────────┘
           │
           ▼
     Next Step (OTP or Add Phone)
```

---

## OTP Verification Flow

```
┌──────────────────────┐
│   User authenticated │
│  (Google/MS/Magic)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Check if user has   │
│   phone number       │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
Has Phone    No Phone
     │           │
     │           ▼
     │   ┌──────────────┐
     │   │  Add Phone   │
     │   │    Screen    │
     │   └──────┬───────┘
     │          │
     └──────┬───┘
            ▼
┌──────────────────────┐
│ Generate 6-digit OTP │
│  (expires 5 minutes) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Send OTP via SMS    │
│   to phone number    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  OTP Input Screen    │
│  [_ _ _ _ _ _]       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User enters code    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Validate OTP code   │
│   against stored     │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
   Valid      Invalid
     │           │
     │           ▼
     │   ┌──────────────┐
     │   │ Show error   │
     │   │ Allow retry  │
     │   └──────┬───────┘
     │          │
     │          ▼
     │   ┌──────────────┐
     │   │ Can resend   │
     │   │after cooldown│
     │   └──────────────┘
     │
     ▼
┌──────────────────────┐
│   Issue JWT token    │
│   Create session     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Redirect to Dashboard│
└──────────────────────┘
```

---

## Security Layers

### Layer 1: Authentication
- OAuth 2.0 (Google/Microsoft)
- Magic Link with secure tokens
- Email validation

### Layer 2: Phone Verification
- SMS-based OTP
- 6-digit codes
- Time-limited (5 minutes)
- Rate-limited resends

### Layer 3: Session Management
- JWT tokens
- Secure HTTP-only cookies
- CSRF protection
- Session timeout

### Layer 4: Additional Security
- Rate limiting per IP
- Account lockout after failures
- Suspicious activity detection
- Audit logging

---

## Data Flow

### User Authentication Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Auth request
       ▼
┌─────────────┐
│  Frontend   │
│ (React App) │
└──────┬──────┘
       │
       │ 2. OAuth redirect or Magic Link
       ▼
┌─────────────┐
│  OAuth      │
│  Provider   │◄───────┐
│(Google/MS)  │        │
└──────┬──────┘        │
       │               │
       │ 3. Auth code  │
       ▼               │
┌─────────────┐        │
│   Backend   │        │
│  API Server │        │
└──────┬──────┘        │
       │               │
       │ 4. Validate   │
       │    & get user │
       ▼               │
┌─────────────┐        │
│  Database   │        │
└──────┬──────┘        │
       │               │
       │ 5. User data  │
       ▼               │
┌─────────────┐        │
│   Backend   │        │
└──────┬──────┘        │
       │               │
       │ 6. Send OTP   │
       ▼               │
┌─────────────┐        │
│  SMS Service│        │
│  (Twilio)   │        │
└──────┬──────┘        │
       │               │
       │ 7. OTP sent   │
       ▼               │
┌─────────────┐        │
│   Frontend  │        │
└──────┬──────┘        │
       │               │
       │ 8. Verify OTP │
       ▼               │
┌─────────────┐        │
│   Backend   │────────┘
└──────┬──────┘
       │
       │ 9. Issue JWT
       ▼
┌─────────────┐
│   Frontend  │
│ (Authorized)│
└─────────────┘
```

---

## Route Structure

```
/
├── /login
│   └── Admin normal login
│
├── /workflows
│   ├── /login
│   │   └── Workflow hub (test/demo)
│   │
│   ├── /first-login
│   │   └── First login - Has phone
│   │
│   └── /first-login-add-phone
│       └── First login - Needs phone
│
├── /client-portal
│   ├── /login
│   │   └── Client normal login
│   │
│   ├── /household/invitation
│   │   └── Household member invitation
│   │
│   ├── /dashboard
│   ├── /documents
│   ├── /signatures
│   ├── /invoices
│   ├── /profile
│   ├── /settings
│   └── /account-access
│
└── /clients (dashboard)
    └── Protected admin routes
```

---

## Component Hierarchy

```
App.tsx
├── BrandingProvider
│   ├── AuthProvider
│   │   ├── AppSettingsProvider
│   │   │   └── Router
│   │   │       ├── Public Routes
│   │   │       │   ├── LoginView
│   │   │       │   ├── FirstLoginSetPasswordView
│   │   │       │   ├── FirstLoginAddPhoneView
│   │   │       │   ├── LoginWorkflowsView
│   │   │       │   ├── ClientPortalLogin
│   │   │       │   └── HouseholdInvitationResponse
│   │   │       │
│   │   │       └── Protected Routes
│   │   │           ├── Admin Dashboard
│   │   │           ├── Client Management
│   │   │           ├── Client Portal Dashboard
│   │   │           └── ... other protected pages
│   │   │
│   │   └── ProtectedRoute (HOC)
│   │
│   └── Layout Components
│       ├── Sidebar
│       ├── Header
│       └── ClientPortalLayout
│
└── Shared Components
    ├── GoogleLogo
    ├── MicrosoftLogo
    ├── VerificationCodeInput
    ├── PhoneInput
    └── ... other UI components
```

---

## State Management

### Global State (Context)

```typescript
BrandingContext
├── colors: BrandingColors
├── images: BrandingImages
├── companyName: string
└── isDarkMode: boolean

AuthContext
├── user: User | null
├── isAuthenticated: boolean
├── isLoading: boolean
├── login(credentials)
├── logout()
└── updateUser(user)

AppSettingsContext
├── dateFormat: string
├── timeFormat: string
├── itemsPerPage: number
└── ... other settings
```

### Local State (Components)

```typescript
FirstLoginSetPasswordView
├── step: 'choose-auth' | 'check-email' | 'verify-otp' | 'success'
├── authMethod: 'google' | 'microsoft' | 'magic-link' | null
├── email: string
├── otpCode: string
├── isLoading: boolean
└── resendCountdown: number

FirstLoginAddPhoneView
├── step: 'choose-auth' | 'add-phone' | 'verify-otp' | 'success'
├── authMethod: 'google' | 'microsoft' | 'magic-link' | null
├── email: string
├── phoneNumber: string
├── otpCode: string
├── isLoading: boolean
└── resendCountdown: number
```

---

## API Endpoints

### Authentication Endpoints

```typescript
POST   /api/auth/google              // Google OAuth callback
POST   /api/auth/microsoft           // Microsoft OAuth callback
POST   /api/auth/send-magic-link     // Send magic link email
POST   /api/auth/validate-magic-link // Validate magic link token
POST   /api/auth/send-otp            // Send OTP to phone
POST   /api/auth/verify-otp          // Verify OTP code
POST   /api/auth/refresh             // Refresh JWT token
POST   /api/auth/logout              // End session
GET    /api/auth/session             // Check session status
```

### User Endpoints

```typescript
POST   /api/users/add-phone          // Add phone to user
GET    /api/users/me                 // Get current user
PUT    /api/users/me                 // Update current user
GET    /api/users/:id                // Get user by ID (admin)
```

### Client Portal Endpoints

```typescript
POST   /api/client-portal/auth/login           // Client login
POST   /api/client-portal/household/invite     // Send household invite
POST   /api/client-portal/household/accept     // Accept invitation
POST   /api/client-portal/household/decline    // Decline invitation
```

---

## Environment Configuration

### Required Environment Variables

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback

# SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourcompany.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# Application Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:44313
```

---

## Monitoring & Logging

### Events to Log

**Authentication Events:**
- ✅ Login attempts (success/failure)
- ✅ OAuth authentication (provider, success/failure)
- ✅ Magic link generation
- ✅ Magic link clicks
- ✅ OTP generation
- ✅ OTP verification (success/failure)
- ✅ Session creation
- ✅ Session expiration
- ✅ Logout events

**Security Events:**
- ⚠️ Multiple failed login attempts
- ⚠️ Suspicious IP addresses
- ⚠️ Rate limit exceeded
- ⚠️ Invalid tokens
- ⚠️ Expired sessions accessed
- ⚠️ Permission denied
- ⚠️ Account lockouts

**User Events:**
- 📊 User registration
- 📊 Phone number added
- 📊 Phone number verified
- 📊 Profile updates
- 📊 Password reset requests (if keeping legacy)

---

## Summary

This authentication system provides:

✅ **Multiple entry points** (admin, client portal, first login)  
✅ **Flexible auth methods** (Google, Microsoft, Magic Link)  
✅ **Strong security** (OAuth + OTP multi-factor)  
✅ **Passwordless everywhere** (no passwords to manage)  
✅ **Scalable architecture** (clear separation of concerns)  
✅ **Comprehensive logging** (security and analytics)  
✅ **Production ready** (with monitoring and alerting)

**A complete, modern, passwordless authentication system! 🎉**
