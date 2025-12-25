# Client Portal Architecture

## Overview
The client portal is a separate interface where clients login and access their own information. It's distinct from the firm-side admin interface.

## Architecture Principles

### Separation of Concerns
- **Firm Side**: All existing views - admin interface for managing clients, billing, signatures, etc.
- **Client Portal**: New interface where clients login to view their own data

### Shared Resources
The client portal shares:
- ✅ Design system and UI components (`/components/ui/`)
- ✅ Branding system (BrandingContext)
- ✅ App settings (AppSettingsContext - date formats, etc.)
- ✅ Global styles and typography
- ✅ Common utilities and helpers

### Separate Resources
The client portal has its own:
- 📁 Page directory: `/pages/client-portal/`
- 📁 Component directory: `/components/client-portal/`
- 🎨 Layout: ClientPortalLayout (no admin sidebar)
- 🔐 Authentication: Client-specific auth checks
- 🛣️ Routes: `/client-portal/*` route structure

## Directory Structure

```
/pages/client-portal/
  ├── dashboard/
  │   └── ClientPortalDashboard.tsx
  ├── documents/
  │   └── ClientPortalDocuments.tsx
  ├── invoices/
  │   └── ClientPortalInvoices.tsx
  ├── signatures/
  │   └── ClientPortalSignatures.tsx
  ├── messages/
  │   └── ClientPortalMessages.tsx
  └── profile/
      └── ClientPortalProfile.tsx

/components/client-portal/
  ├── ClientPortalLayout.tsx
  ├── ClientPortalHeader.tsx
  ├── ClientPortalNavigation.tsx
  └── [other client-specific components]
```

## Routing Structure

### Firm Routes (existing)
```
/login
/dashboard
/clients
/billing
/signatures
/calendar
etc.
```

### Client Portal Routes (new)
```
/client-portal/login          - Client login page
/client-portal/dashboard       - Client dashboard
/client-portal/documents       - View/download documents
/client-portal/invoices        - View invoices and make payments
/client-portal/signatures      - Sign documents
/client-portal/messages        - Communicate with firm
/client-portal/profile         - Update contact info
```

## Layout Differences

### Firm Layout
- Left sidebar navigation with all admin tools
- Full header with company settings, notifications
- Access to all client management features

### Client Portal Layout
- Top navigation bar or simple left nav (much simpler)
- Header with profile and logout
- Limited to client's own data
- Clean, simple interface focused on client needs

## Authentication

### Firm Users
- Login at `/login`
- Access to firm-side routes
- Can manage multiple clients
- Role-based permissions

### Client Users
- Login at `/client-portal/login`
- Access only to client portal routes
- See only their own data
- Limited permissions

## Integration Points

### API Calls
- Client portal uses same API service
- Different endpoints (client-specific)
- Token includes client context

### Branding
- Both use BrandingContext
- Same color scheme and logo
- Consistent brand experience

### Data
- Clients see THEIR data only
- API enforces client-level permissions
- No access to other clients' information

## Development Workflow

### Adding a New Client Portal Page

1. Create page in `/pages/client-portal/[section]/`
2. Use ClientPortalLayout wrapper
3. Add route to AppRoutes.tsx
4. Follow existing design system standards
5. Use shared UI components
6. Respect branding context

### Adding Client-Specific Components

1. Create in `/components/client-portal/`
2. Keep focused on client needs
3. Reuse firm-side components where appropriate
4. Follow established patterns

## Next Steps

1. ✅ Create ClientPortalLayout component
2. ✅ Create initial dashboard page
3. ✅ Set up routing structure
4. ⏭️ Build out additional client portal pages as needed
5. ⏭️ Implement client-specific authentication
6. ⏭️ Add client portal navigation

## Notes

- Client portal is a separate user experience
- Much simpler than firm-side interface
- Focused on self-service for clients
- Should be intuitive and easy to use
- Mobile-responsive is critical (clients may use phones)
