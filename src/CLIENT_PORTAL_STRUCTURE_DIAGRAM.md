# Client Portal Structure Diagram

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐          ┌──────────────────────┐      │
│  │   FIRM SIDE         │          │   CLIENT PORTAL      │      │
│  │   (Admin)           │          │   (Self-Service)     │      │
│  └─────────────────────┘          └──────────────────────┘      │
│           │                                    │                 │
│           │                                    │                 │
│  ┌────────▼────────┐                  ┌────────▼──────────┐     │
│  │  Firm Layout    │                  │  Client Layout    │     │
│  │  - Left Sidebar │                  │  - Top Nav Bar    │     │
│  │  - Full Header  │                  │  - Simple Header  │     │
│  │  - Admin Tools  │                  │  - User Profile   │     │
│  └─────────────────┘                  └───────────────────┘     │
│           │                                    │                 │
│           │                                    │                 │
│  ┌────────▼────────────────────┐     ┌────────▼──────────────┐  │
│  │ Firm Routes                 │     │ Client Portal Routes  │  │
│  │ /dashboard                  │     │ /client-portal/login  │  │
│  │ /clients                    │     │ /client-portal/       │  │
│  │ /billing                    │     │   dashboard           │  │
│  │ /signatures                 │     │ /client-portal/       │  │
│  │ /calendar                   │     │   documents           │  │
│  │ etc.                        │     │ /client-portal/       │  │
│  └─────────────────────────────┘     │   invoices            │  │
│                                       │ etc.                  │  │
│                                       └───────────────────────┘  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        SHARED RESOURCES                          │
│  - BrandingContext (colors, logo)                               │
│  - AppSettingsContext (date formats)                            │
│  - AuthContext (authentication)                                 │
│  - UI Components (/components/ui/)                              │
│  - Design System & Standards                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 File Organization

```
project/
│
├── /pages/
│   ├── /client-portal/              ← NEW: Client portal pages
│   │   ├── /login/
│   │   │   └── ClientPortalLogin.tsx
│   │   ├── /dashboard/
│   │   │   └── ClientPortalDashboard.tsx
│   │   ├── /documents/              ← TO BUILD
│   │   ├── /invoices/               ← TO BUILD
│   │   ├── /signatures/             ← TO BUILD
│   │   ├── /messages/               ← TO BUILD
│   │   └── /profile/                ← TO BUILD
│   │
│   └── /account/                    ← EXISTING: Firm pages
│       └── /login/
│           └── LoginView.tsx
│
├── /components/
│   ├── /client-portal/              ← NEW: Client components
│   │   └── ClientPortalLayout.tsx
│   │
│   ├── /views/                      ← EXISTING: Firm views
│   │   ├── DashboardView.tsx
│   │   ├── ClientManagementView.tsx
│   │   ├── BillingView.tsx
│   │   └── ...
│   │
│   ├── /ui/                         ← SHARED: UI components
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── Header.tsx                   ← FIRM: Admin header
│   ├── Sidebar.tsx                  ← FIRM: Admin sidebar
│   └── ...
│
├── /contexts/                       ← SHARED: All contexts
│   ├── BrandingContext.tsx
│   ├── AppSettingsContext.tsx
│   └── AuthContext.tsx
│
└── /routes/
    └── AppRoutes.tsx                ← UPDATED: Added client routes
```

## 🎨 Layout Comparison

### Firm Layout (Admin Side)
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Search | Notif | Settings | User │
├──────┬──────────────────────────────────────────┤
│      │                                           │
│ Side │                                           │
│ bar  │         Main Content Area                 │
│      │         (Full Admin Interface)            │
│ Nav  │                                           │
│      │                                           │
│ Menu │                                           │
│      │                                           │
└──────┴──────────────────────────────────────────┘
```

### Client Portal Layout
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Dashboard | Docs | ... | User ▼ │
├─────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│            Main Content Area                     │
│            (Simple Client Interface)             │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│ Footer: Copyright                                │
└─────────────────────────────────────────────────┘
```

## 🔄 User Journey

### Firm User Journey
```
1. Visit app → /
2. Not logged in → Redirect to /login
3. Login as firm user
4. Redirect to /dashboard
5. Full admin interface available
6. Can manage all clients
```

### Client User Journey
```
1. Visit app → /client-portal
2. Redirect to /client-portal/login
3. Login as client
4. Redirect to /client-portal/dashboard
5. Simple portal interface
6. See only their own data
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────┐
│              User visits site                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Which login page? │
        └────────┬───────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌────────┐      ┌──────────────┐
   │ /login │      │ /client-     │
   │        │      │ portal/login │
   └───┬────┘      └──────┬───────┘
       │                  │
       ▼                  ▼
   ┌────────┐      ┌──────────────┐
   │  Firm  │      │   Client     │
   │  User  │      │   User       │
   └───┬────┘      └──────┬───────┘
       │                  │
       ▼                  ▼
   ┌────────┐      ┌──────────────┐
   │ Firm   │      │  Client      │
   │ Routes │      │  Portal      │
   │        │      │  Routes      │
   └────────┘      └──────────────┘
```

## 📊 Data Access Patterns

### Firm Side (Admin)
```
API Request: GET /api/clients
Response: [All clients in the firm]

API Request: GET /api/invoices
Response: [All invoices for all clients]

Permissions: Can access all client data
```

### Client Portal
```
API Request: GET /api/client/documents
Response: [Only this client's documents]

API Request: GET /api/client/invoices
Response: [Only this client's invoices]

Permissions: Can only access own data
```

## 🎯 Component Reuse Strategy

### Shared Components (Use As-Is)
```
✅ UI Components (Button, Table, Dialog, etc.)
✅ Form Components (Input, Select, Checkbox, etc.)
✅ Icon Components (Lucide React)
✅ Context Providers (Branding, Settings, Auth)
✅ Utilities and Helpers
```

### Separate Components (Different for Each)
```
❌ Layout Components
   - Firm: Sidebar + Header
   - Client: Top Nav Bar

❌ Navigation Components
   - Firm: Full admin menu
   - Client: Simple client menu

❌ Page/View Components
   - Firm: Management interfaces
   - Client: Self-service interfaces
```

### Adapted Components (Similar but Customized)
```
⚠️ Tables
   - Same structure, different data
   - Same styling, different actions

⚠️ Forms
   - Same inputs, different endpoints
   - Same validation, different purposes

⚠️ Dialogs/Modals
   - Same component, different content
```

## 🚦 Route Protection

```
Public Routes (No Auth Required)
  /login                    → Firm login
  /forgot-password          → Firm password reset
  /client-portal/login      → Client login

Protected Routes (Auth Required)
  Firm Routes:
    /dashboard              → Requires firm user
    /clients                → Requires firm user
    /billing                → Requires firm user
    ...
  
  Client Portal Routes:
    /client-portal/dashboard  → Requires client user
    /client-portal/documents  → Requires client user
    /client-portal/invoices   → Requires client user
    ...
```

## 📱 Responsive Behavior

### Desktop (≥1024px)
```
Firm Side:
  - Full sidebar visible
  - Full header with all tools
  - Multi-column layouts

Client Portal:
  - Horizontal navigation visible
  - Full header
  - Multi-column layouts
```

### Tablet (768px - 1023px)
```
Firm Side:
  - Collapsible sidebar
  - Simplified header
  - 2-column layouts

Client Portal:
  - Horizontal navigation
  - Simplified header
  - 2-column layouts
```

### Mobile (<768px)
```
Firm Side:
  - Hidden sidebar (hamburger menu)
  - Minimal header
  - Single column layouts

Client Portal:
  - Hidden nav (hamburger menu)
  - Minimal header
  - Single column layouts
```

## 🔄 Development Workflow

```
1. Building Firm Features
   ├── Create in /components/views/
   ├── Add route to /routes/AppRoutes.tsx
   ├── Use firm layout (Sidebar + Header)
   └── Access via /[feature-name]

2. Building Client Portal Features
   ├── Create in /pages/client-portal/[feature]/
   ├── Add route to /routes/AppRoutes.tsx
   ├── Use ClientPortalLayout
   └── Access via /client-portal/[feature]
```

## 🎨 Styling Consistency

```
Both Firm and Client Portal use:
  ├── Same color system (BrandingContext)
  ├── Same typography (globals.css)
  ├── Same spacing system (Tailwind)
  ├── Same component library (/components/ui/)
  ├── Same icons (Lucide React)
  └── Same design patterns

Result: Consistent brand experience across both interfaces
```

---

## Quick Summary

| Aspect | Firm Side | Client Portal |
|--------|-----------|---------------|
| **Layout** | Sidebar + Header | Top Nav Bar |
| **Access** | All clients | Own data only |
| **Routes** | `/[feature]` | `/client-portal/[feature]` |
| **Users** | Firm employees | Clients |
| **Complexity** | Full admin tools | Simple self-service |
| **Files** | `/components/views/` | `/pages/client-portal/` |
| **Shared** | UI, contexts, styles, design system |

---

**This structure keeps everything organized and makes it easy to build both interfaces simultaneously!**
