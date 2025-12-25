# Notification System

A comprehensive, scalable notification management system with three access points for maximum user convenience.

## Architecture

### Core Files

- **`/types/notifications.ts`** - TypeScript type definitions
- **`/data/notificationTypes.ts`** - All 80+ notification type definitions across 12 categories
- **`/components/views/NotificationSettingsView.tsx`** - Main settings page (central management)
- **`/components/notifications/NotificationToast.tsx`** - Toast component with gear icon
- **`/components/notifications/NotificationDrawer.tsx`** - Contextual drawer component

## Three Access Points

### 1. Toast Quick Actions ⚡
**Where:** Every toast notification  
**How:** Gear icon in top-right of toast  
**Purpose:** Instant adjustment without leaving context

```tsx
import { showNotification } from './components/notifications/NotificationToast';

// Trigger a notification with quick settings
showNotification({
  notificationId: 'client-new-registration',
  title: 'New Client Registered',
  message: 'John Smith just created an account',
  icon: <User className="w-5 h-5 text-purple-600" />,
  actionButton: {
    label: 'View Client',
    onClick: () => navigate('/clients/123'),
  },
});
```

### 2. Contextual In-Page Drawer 📍
**Where:** Page headers (e.g., Clients page)  
**How:** "⚙️ Notifications" button  
**Purpose:** Manage notifications related to current page

```tsx
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

// Add to any page header
<NotificationDrawer 
  category="client"
  trigger={
    <Button variant="outline" size="sm" className="gap-2">
      <Settings className="w-4 h-4" />
      Notifications
    </Button>
  }
/>
```

### 3. Central Settings Page 🔔
**Where:** `/notification-settings` route  
**How:** Bell icon in top navigation  
**Purpose:** Complete management with search, filters, bulk actions

## Features

### Hierarchical Organization
- **12 Categories:** Client, Project, Task, Organizer, Invoice, Subscription, Signature, Incoming Documents, Team, HR, System, Security
- **~80 Notification Types** across all categories
- **Cascading Defaults:** Category-level settings apply to all notifications unless customized

### Delivery Channels
- **Toast** - In-app popup notifications
- **Email** - Email notifications
- **SMS** - Text message notifications

### Advanced Features
- ✅ **Search & Filter** - Find notifications quickly
- ✅ **Quiet Hours** - Mute notifications during specific times
- ✅ **Digest Mode** - Batch notifications (hourly/daily/weekly)
- ✅ **Role-Based Defaults** - Different settings for Admin/Partner/Manager/Staff
- ✅ **Visual Status Badges** - "Using defaults" vs "Custom" indicators
- ✅ **Locked Notifications** - Security alerts that cannot be disabled
- ✅ **Expand All / Collapse All** - Quick navigation

## Categories

| Category | Count | Example Notifications |
|----------|-------|----------------------|
| Client | 12 | New registration, document uploaded, payment made |
| Project | 10 | Project assigned, deadline approaching, status changed |
| Task | 8 | Task assigned, due soon, overdue |
| Organizer | 6 | Event created, reminder, invitation |
| Invoice | 8 | Invoice paid, overdue, payment failed |
| Subscription | 5 | Renewal upcoming, payment failed, cancelled |
| Signature | 7 | Document sent, signed, declined |
| Incoming Documents | 5 | Document received, processed, failed |
| Team | 6 | Member added, assignment, mentioned |
| HR | 5 | Time off request, approved, denied |
| System | 4 | Update available, maintenance scheduled |
| Security | 3 | New device login, password changed, suspicious activity (LOCKED) |

## Usage Examples

### Example 1: Add to Clients Page

```tsx
import { NotificationDrawer } from '../notifications/NotificationDrawer';

export function ClientManagementView() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1>Clients</h1>
        <div className="flex gap-2">
          <NotificationDrawer category="client" />
          <Button>+ New Client</Button>
        </div>
      </div>
      
      {/* Rest of page... */}
    </div>
  );
}
```

### Example 2: Trigger Custom Toast

```tsx
import { showNotification } from '../notifications/NotificationToast';

function handleClientRegistration(client) {
  // ... save client logic ...
  
  // Show notification with settings
  showNotification({
    notificationId: 'client-new-registration',
    title: 'New Client Registered',
    message: `${client.name} just created an account`,
    icon: <User className="w-5 h-5 text-purple-600" />,
    actionButton: {
      label: 'View Client',
      onClick: () => navigate(`/clients/${client.id}`),
    },
  });
}
```

### Example 3: Check User Preferences (Backend)

```tsx
// In real app, this would come from API/context
const userSettings = useNotificationSettings();

// Check if user wants email notifications for invoices
const invoiceDefaults = userSettings.categoryDefaults
  .find(cd => cd.category === 'invoice');

if (invoiceDefaults.channels.includes('email')) {
  // Send email notification
}

// Check individual notification preference
const invoicePaidPref = userSettings.preferences
  .find(p => p.notificationId === 'invoice-paid');

if (invoicePaidPref?.digestEnabled) {
  // Add to digest queue instead of sending immediately
  addToDigestQueue(invoicePaidPref.digestFrequency);
}
```

## State Management

In production, notification preferences should be managed via:
- **Context API** or **Redux** for client-side state
- **API endpoints** for persistence
- **Real-time sync** to update across devices

```tsx
// Example context structure
interface NotificationContextType {
  settings: UserNotificationSettings;
  updateCategoryDefaults: (category, channels) => void;
  updateNotificationPreference: (id, settings) => void;
  resetToDefaults: (id) => void;
  quietHours: QuietHours;
  updateQuietHours: (updates) => void;
}
```

## Adding New Notification Types

1. Add to `/data/notificationTypes.ts`:
```tsx
{
  id: 'new-notification-id',
  category: 'client',
  name: 'Display Name',
  description: 'When this notification is triggered',
  defaultChannels: ['toast', 'email'],
}
```

2. Trigger in your code:
```tsx
showNotification({
  notificationId: 'new-notification-id',
  title: 'Display Name',
  message: 'Specific details about this instance',
  icon: <Icon className="w-5 h-5" />,
});
```

## Future Enhancements

- **Custom Groups** - User-defined notification groups (e.g., "VIP Clients")
- **Smart Digests** - AI-powered summarization
- **Notification Templates** - Presets for common workflows
- **Bulk Actions** - Select multiple, apply settings
- **Test Mode** - Send test notifications
- **Analytics** - Track which notifications users interact with
- **Push Notifications** - Browser/mobile push support

## Design Principles

✅ **Meet users where they are** - Three access points ensure settings are always accessible  
✅ **Progressive disclosure** - Simple defaults, complex options when needed  
✅ **Visual hierarchy** - Collapsible categories reduce cognitive load  
✅ **Consistent patterns** - Same UI across all three access points  
✅ **Immediate feedback** - Toast confirmations for all changes  
✅ **Mobile responsive** - Works on all screen sizes  
✅ **Dark mode support** - Fully styled for both themes  

## Testing

Access the demo page to test all three access points:
```
/notification-demo
```

This page demonstrates:
- Toast notifications with gear icon
- Contextual drawers for each category
- Link to full settings page
