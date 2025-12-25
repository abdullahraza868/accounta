# Acounta Client Management - Setup Instructions

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher

### 2. Installation Steps

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`.

### 3. First Time Setup

When you first run the application:

1. **You will be redirected to the login page** (`/login`)
2. **Use these default credentials** (Mock Mode):
   - Email: `admin@example.com`
   - Password: `123qwe`
   - Tenant: Click "Change Tenant" and enter any firm name (e.g., "Default")

3. **After logging in**, you will be redirected to the Clients page

### 4. Mock Mode

The application runs in **Mock Mode** by default, which means:
- ✅ All features work without a backend API
- ✅ Data is simulated but persistent within your browser session
- ✅ No API keys or credentials are required
- ✅ Perfect for development and testing

A banner at the top will indicate "Development Mode: API unavailable - running in mock mode"

### 5. Application Structure

```
/components         - Reusable React components
  /ui              - ShadCN UI components
  /views           - Page views (active)
/pages             - Reorganized structure (not currently used)
  /account         - Login, 2FA, password reset
  /app             - Application pages
/contexts          - React contexts (Auth, Branding)
/services          - API service layer
/routes            - Route configuration
/styles            - Global styles and CSS
```

### 6. Navigation

After logging in, you can access:

- **📊 Dashboard** - Overview and analytics
- **👥 Clients** - Client management (default landing page)
- **📄 Documents** - Incoming documents
- **✍️ Signatures** - Signature requests and templates
- **📅 Calendar** - Schedule and appointments
- **💬 Chat** - Internal messaging with urgency flags
- **💰 Billing** - Invoices and billing
- **🎨 Client Portal** - Portal view
- **⚙️ Settings** - Application and company settings
- **🎨 Platform Branding** - Customize colors and branding

### 7. Features

#### Authentication
- Email/password login with mock 2FA support
- Tenant selection and switching
- Password recovery flow
- Remember me functionality

#### Branding System
- Customizable color scheme
- Dark mode support
- Company logo and images
- CSS variable-based theming

#### Client Management
- Three-column layout (list, folder, details)
- Client groups and filtering
- Team member assignment
- Document management
- Signature tracking
- Communication history

### 8. Troubleshooting

#### Issue: Blank or unstyled page on startup
**Solution**: 
- Clear your browser cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Ensure CSS is loading by checking the Network tab in DevTools

#### Issue: "Cannot find module" errors
**Solution**:
```bash
# Clean install
npm run clean
npm install
```

#### Issue: Port 3000 already in use
**Solution**:
Edit `vite.config.ts` and change the port:
```typescript
server: {
  port: 3001, // Change to any available port
  open: true,
}
```

### 9. Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### 10. Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### 11. Dark Mode

Toggle dark mode from:
- The user menu in the top right corner
- Settings > Appearance

### 12. API Integration (Future)

To connect to a real Acounta API backend:

1. Update `/config/api.config.ts` with your API URL
2. The application will automatically switch from mock mode to API mode
3. Refer to `/API_SETUP_GUIDE.md` for detailed instructions

### 13. Support

For issues or questions:
1. Check the `/MOCK_MODE_GUIDE.md` for mock mode details
2. Review `/ERRORS_FIXED.md` for common fixes
3. Check console logs for detailed error messages

### 14. Important Files

- `/App.tsx` - Main application component
- `/main.tsx` - Application entry point
- `/routes/AppRoutes.tsx` - Route configuration
- `/contexts/AuthContext.tsx` - Authentication logic
- `/contexts/BrandingContext.tsx` - Branding/theming
- `/styles/globals.css` - Global styles and CSS variables

---

## Current State

✅ **READY TO USE**

The application is fully functional in mock mode with:
- Complete authentication flow
- All page views working
- Mock data for all features
- Responsive design
- Dark mode support
- Customizable branding

**Default route**: When you visit `/`, you'll be redirected to `/login` (if not authenticated) or `/clients` (if authenticated).

---

Last Updated: Today
Version: 1.0.0
