# Google Login Integration Guide

## Overview
Google login has been added to the admin login page (`/components/views/LoginView.tsx`). The UI is complete and ready - backend OAuth integration is required to make it functional.

## Current Status

### ✅ Frontend Complete
- Google login button added below the main login form
- Visual divider with "Or continue with" text
- Proper branding colors and styling
- Loading states handled
- Error handling in place

### 🔧 Backend Required
The `handleGoogleLogin` function currently shows a placeholder toast. Backend needs to implement Google OAuth 2.0 flow.

## How to Test

1. Navigate to `/login` (admin login page)
2. You'll see the traditional email/password form
3. Below that is a divider with "Or continue with"
4. Click the "Sign in with Google" button
5. Currently shows: "Google login will be available once backend OAuth is configured"

## Backend Implementation Required

### 1. Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `https://yourdomain.com/api/auth/google/callback`
     - `http://localhost:5173/api/auth/google/callback` (for local dev)

2. **Save credentials:**
   - Client ID
   - Client Secret

### 2. Backend Endpoints Needed

#### A. Initiate OAuth Flow
```
GET /api/auth/google
```
- Redirects user to Google OAuth consent screen
- Include scopes: `openid email profile`
- Include state parameter for CSRF protection

#### B. Handle OAuth Callback
```
GET /api/auth/google/callback
```
- Receives authorization code from Google
- Exchanges code for access token
- Retrieves user info from Google
- Creates or updates user in database
- Generates session/JWT token
- Redirects to frontend with token

### 3. Frontend Integration Points

Once backend is ready, update the `handleGoogleLogin` function in `/components/views/LoginView.tsx`:

```typescript
const handleGoogleLogin = async () => {
  setIsLoading(true);
  
  try {
    // Option 1: Full page redirect
    window.location.href = '/api/auth/google';
    
    // Option 2: Popup window (alternative)
    // const width = 500;
    // const height = 600;
    // const left = window.screen.width / 2 - width / 2;
    // const top = window.screen.height / 2 - height / 2;
    // window.open(
    //   '/api/auth/google',
    //   'Google Login',
    //   `width=${width},height=${height},left=${left},top=${top}`
    // );
    
  } catch (error: any) {
    console.error('Google login error:', error);
    toast.error('Google login failed. Please try again.');
    setIsLoading(false);
  }
};
```

### 4. User Data Handling

When user logs in via Google, backend should:

1. **Extract Google profile data:**
   - Email (required)
   - Name
   - Profile picture
   - Google ID

2. **Check if user exists:**
   - If exists: Log them in
   - If new: Create account with Google data

3. **Tenant handling:**
   - If current tenant is set (from localStorage): Associate user with that tenant
   - If no tenant: Either assign to default or prompt user to select

4. **Return to frontend:**
   - Session token/JWT
   - User profile data
   - Tenant information

### 5. Security Considerations

✅ **Must implement:**
- State parameter validation (CSRF protection)
- Verify Google token signature
- Use HTTPS in production
- Secure session storage
- Token expiration handling
- Refresh token flow

⚠️ **Important:**
- Never expose Client Secret to frontend
- Validate redirect URIs on backend
- Implement rate limiting on auth endpoints

## Testing Checklist

Once backend is implemented:

- [ ] Click "Sign in with Google" redirects to Google consent screen
- [ ] Google consent screen shows correct app name and permissions
- [ ] After allowing access, redirects back to app
- [ ] User is logged in successfully
- [ ] User data is saved correctly
- [ ] Existing users can log in via Google
- [ ] New users are created automatically
- [ ] Error handling works (e.g., user denies access)
- [ ] Tenant association works correctly
- [ ] Session persists after refresh
- [ ] Works in both development and production

## User Flow

1. User arrives at login page and sees Google button first (prominent position)
2. User clicks "Sign in with Google" 
3. Redirected to Google login/consent screen
4. User logs in to Google (if not already)
5. User approves requested permissions
6. Google redirects to callback URL with auth code
7. Backend exchanges code for tokens
8. Backend creates/retrieves user account
9. Backend creates session
10. User redirected to `/clients` page (logged in)

**Alternative Flow:**
- User can scroll down and use traditional email/password login below the divider

## Design

### Official Google Branding
The implementation follows Google's official Sign-In branding guidelines:

- **Button placement:** ABOVE traditional login form (primary position)
- **Button style:** White background (#ffffff) with light gray border (#dadce0)
- **Icon:** Official Google "G" logo (4-color: blue, red, yellow, green) - see `/components/GoogleLogo.tsx`
- **Text:** "Sign in with Google" in dark gray (#3c4043)
- **Divider:** "Or sign in with email" separator below Google button
- **Loading state:** Button disabled when loading
- **Hover effect:** Subtle shadow on hover
- **Responsive:** Full width, matches height of other inputs (h-12)

### Visual Hierarchy
1. **First:** Google sign-in button (most prominent)
2. **Then:** Divider with "Or sign in with email"
3. **Finally:** Traditional email/password form

This matches what users see on YouTube, Gmail, and other Google services, making it instantly recognizable and trustworthy.

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- Platform Branding: Uses CSS variables from `/contexts/BrandingContext.tsx`

## Future Enhancements

Consider adding:
- Microsoft/Azure AD login
- Apple Sign In
- SAML/SSO for enterprise clients
- Social login providers (GitHub, LinkedIn, etc.)
