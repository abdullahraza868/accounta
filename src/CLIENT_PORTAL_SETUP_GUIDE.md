# Client Portal Setup Guide

## ✅ What's Been Set Up

### 1. Architecture Documentation
- **`/CLIENT_PORTAL_ARCHITECTURE.md`** - Complete architectural overview and design principles

### 2. Directory Structure
```
/pages/client-portal/          - All client portal pages
  ├── login/
  │   └── ClientPortalLogin.tsx
  └── dashboard/
      └── ClientPortalDashboard.tsx

/components/client-portal/     - Client-specific components
  └── ClientPortalLayout.tsx   - Main layout with header & navigation
```

### 3. Components Created

#### ClientPortalLayout
- **Location**: `/components/client-portal/ClientPortalLayout.tsx`
- **Purpose**: Provides the main layout for all client portal pages
- **Features**:
  - Top navigation bar with logo
  - Horizontal navigation menu (Dashboard, Documents, Invoices, Signatures, Messages, Profile)
  - User profile section with logout
  - Mobile-responsive with hamburger menu
  - Uses branding colors from BrandingContext
  - Simple footer

#### ClientPortalLogin
- **Location**: `/pages/client-portal/login/ClientPortalLogin.tsx`
- **Purpose**: Login page for clients
- **Features**:
  - Clean, centered login form
  - Email and password fields
  - Remember me checkbox
  - Forgot password link
  - Uses branding colors and logo
  - Mock authentication (ready for API integration)

#### ClientPortalDashboard
- **Location**: `/pages/client-portal/dashboard/ClientPortalDashboard.tsx`
- **Purpose**: Main dashboard clients see after logging in
- **Features**:
  - Welcome message with user's name
  - Stats cards (Pending Documents, Unsigned Items, Outstanding Invoices, New Messages)
  - Recent Activity timeline
  - Upcoming Tasks list
  - Quick Actions buttons
  - Uses branding colors throughout

### 4. Routing
- **Updated**: `/routes/AppRoutes.tsx`
- **Client Portal Routes**:
  - `/client-portal/login` - Client login (public)
  - `/client-portal/dashboard` - Client dashboard (protected)
  - Comments included for adding more routes

### 5. What's Shared
The client portal uses these existing systems:
- ✅ BrandingContext (colors, logo)
- ✅ AppSettingsContext (date formats)
- ✅ AuthContext (authentication)
- ✅ All UI components from `/components/ui/`
- ✅ Global styles and typography
- ✅ Design system standards

## 🚀 How to Add New Client Portal Pages

### Step 1: Create the Page Component
Create a new file in `/pages/client-portal/[section]/`

Example: `/pages/client-portal/documents/ClientPortalDocuments.tsx`

```tsx
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';

export default function ClientPortalDocuments() {
  const { primaryColor } = useBranding();

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        <h1>My Documents</h1>
        {/* Your page content here */}
      </div>
    </ClientPortalLayout>
  );
}
```

### Step 2: Add the Route
Update `/routes/AppRoutes.tsx`:

```tsx
// 1. Import at the top
import ClientPortalDocuments from '../pages/client-portal/documents/ClientPortalDocuments';

// 2. Add route in the Client Portal section
<Route
  path="/client-portal/documents"
  element={
    <ProtectedRoute>
      <ClientPortalDocuments />
    </ProtectedRoute>
  }
/>
```

### Step 3: Navigation
The navigation in `ClientPortalLayout.tsx` already includes all main sections. The user can click and navigate immediately.

## 📋 Pages to Build

Here are the suggested client portal pages:

### Priority 1: Essential Pages
- ✅ **Dashboard** - Overview of everything (DONE)
- ✅ **Login** - Client authentication (DONE)
- ⏭️ **Documents** - View and download documents
- ⏭️ **Signatures** - Sign pending documents
- ⏭️ **Invoices** - View and pay invoices

### Priority 2: Communication
- ⏭️ **Messages** - Communicate with the firm
- ⏭️ **Profile** - Update contact information

### Priority 3: Additional Features
- ⏭️ **Organizers** - Complete tax organizers
- ⏭️ **Appointments** - Schedule meetings
- ⏭️ **Notifications** - View all notifications
- ⏭️ **Help** - FAQs and support

## 🎨 Design Guidelines

### Layout
- Always wrap pages in `<ClientPortalLayout>`
- Use the established spacing system (space-y-6, space-y-8, etc.)
- Keep the interface simple and uncluttered

### Colors
- Always use `primaryColor` from `useBranding()` hook
- Never hardcode purple or any other colors
- Follow the branding system

### Components
- Use existing UI components from `/components/ui/`
- Share table components and standards
- Follow the established design patterns from the firm side

### Typography
- Use semantic HTML headings (h1, h2, h3)
- Don't add font size/weight classes (uses globals.css defaults)
- Follow the TABLE_DATE_TIME_FORMAT_STANDARD for dates

### Mobile First
- Client portal MUST be mobile-responsive
- Clients will often use phones/tablets
- Test on mobile devices regularly

## 🔐 Authentication

### Current Setup (Mock)
Right now, the client portal uses mock authentication:
- Any email/password combination works
- User is set with role: 'client'
- Mock data is displayed

### Future API Integration
When connecting to the real API:

1. **Client Login Endpoint**
   - Different from firm user login
   - Returns client-specific token
   - Token includes client ID/context

2. **Client Context**
   - API knows which client is logged in
   - Returns only that client's data
   - Enforces client-level permissions

3. **Route Protection**
   - ProtectedRoute should check for client role
   - Prevent clients from accessing firm routes
   - Prevent firm users from accessing client routes

## 🔄 Differences from Firm Side

### Firm Side (Admin Interface)
- Left sidebar navigation
- Access to all clients
- Management features
- Complex workflows
- Role-based permissions

### Client Side (Portal)
- Top navigation bar
- Access to own data only
- Self-service features
- Simple workflows
- View-only for most data

## 📊 API Integration Notes

When you're ready to connect to APIs:

### Documents API
```tsx
// Example: Fetch client's documents
const fetchDocuments = async () => {
  const response = await api.get('/api/client/documents');
  setDocuments(response.data);
};
```

### Signatures API
```tsx
// Example: Get pending signatures
const fetchPendingSignatures = async () => {
  const response = await api.get('/api/client/signatures/pending');
  setPendingSignatures(response.data);
};
```

### Invoices API
```tsx
// Example: Get client invoices
const fetchInvoices = async () => {
  const response = await api.get('/api/client/invoices');
  setInvoices(response.data);
};
```

## 🎯 Next Steps

### To Start Building:
1. Choose which page to build first (recommend Documents or Invoices)
2. Create the page component in `/pages/client-portal/[section]/`
3. Add the route to `AppRoutes.tsx`
4. Use ClientPortalLayout wrapper
5. Follow the design system
6. Add mock data initially
7. Replace with API calls later

### Example Command:
"Create the client portal documents page where clients can view and download their documents"

### Testing:
1. Navigate to `/client-portal/login`
2. Enter any email/password
3. Should redirect to `/client-portal/dashboard`
4. Click navigation items to test routing
5. Test on mobile viewport

## 📝 Important Reminders

- ✅ Always use BrandingContext colors
- ✅ Always use AppSettingsContext for date formatting
- ✅ Keep the interface simple and clean
- ✅ Mobile-first approach
- ✅ Follow established design patterns
- ✅ Use existing UI components
- ✅ Add mock data for development
- ✅ Plan for API integration

## 🆘 Getting Help

If you need assistance:
1. Refer to `CLIENT_PORTAL_ARCHITECTURE.md` for big picture
2. Look at existing pages as examples
3. Follow the firm-side patterns (but simplified)
4. Ask specific questions about what you want to build

---

**You're now ready to build the client portal! Start with whichever page makes the most sense for your workflow.**
