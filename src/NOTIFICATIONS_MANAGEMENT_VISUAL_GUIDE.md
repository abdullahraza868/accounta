# Notifications Management Page - Visual Guide

## Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ [Logo]                                    [Actions] [👤 Profile] │
│                                                     [🔔 <- Opens  │
│                                                    This Page]    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  📬 Notifications                    🟣 3 Unread   🔴 1 Urgent   │
│  View your notification history and customize preferences        │
│                                                                   │
│  [✓ Mark All Read]  [⚙️ Settings]                               │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search notifications...                  [×]           │  │
│  │                                                           │  │
│  │ Filters: [👁️ All] [📁 All Categories] [📱 All Channels] │  │
│  │                                                           │  │
│  │ ☐ Select all (10 selected)                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  NOTIFICATION CARD (UNREAD)                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☐ [💼] Payment Received                    🔵 5 min ago  │  │
│  │        Payment of $1,250.00 received from Acme Corp       │  │
│  │                                                            │  │
│  │   [Client]  Sent via: [📱 App] [📧 Email]                │  │
│  │   Mark as read | [✏️ Customize ▼]                [🗑️]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  NOTIFICATION CARD (EXPANDED SETTINGS)                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☐ [📄] Invoice Overdue                     🟠 15 min ago │  │
│  │        Invoice #INV-2024-001 is now 5 days overdue        │  │
│  │                                                            │  │
│  │   [Invoice] [🟣 Custom]  Sent via: [📱 App] [📧 Email]   │  │
│  │   Mark as read | [✏️ Customize ▲]                [🗑️]   │  │
│  │                                                            │  │
│  │   ┌────────────────────────────────────────────────────┐  │  │
│  │   │ 🎨 Notification Preferences  [🔄 Reset to Defaults]│  │  │
│  │   │ How do you want to receive "Invoice Overdue"?     │  │  │
│  │   │                                                    │  │  │
│  │   │ Notification Channels:                             │  │  │
│  │   │ ┌─────────┐ ┌─────────┐ ┌─────────┐               │  │  │
│  │   │ │ 📱 App  │ │ 📧 Email│ │ 📱 SMS  │               │  │  │
│  │   │ │   ✓     │ │   ✓     │ │   ✓     │               │  │  │
│  │   │ └─────────┘ └─────────┘ └─────────┘               │  │  │
│  │   │    (Selected)  (Selected)  (Selected)              │  │  │
│  │   │                                                    │  │  │
│  │   │ ┌────────────────────────────────────────────────┐│  │  │
│  │   │ │ 🔊 Notification Sound            [Toggle ON]  ││  │  │
│  │   │ │ Play sound when app notification appears      ││  │  │
│  │   │ └────────────────────────────────────────────────┘│  │  │
│  │   │                                                    │  │  │
│  │   │ Example:                                           │  │  │
│  │   │ Invoice #2024-001 is now 5 days overdue          │  │  │
│  │   └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  NOTIFICATION CARD (READ)                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☐ [✍️] Document Signed                     2 hours ago   │  │
│  │        Sarah Johnson signed the Engagement Letter         │  │
│  │                                                            │  │
│  │   [Signature]  Sent via: [📱 App] [📧 Email]             │  │
│  │   Mark as unread | [✏️ Customize ▼]              [🗑️]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  (More notification cards...)                                    │
│                                                                   │
│  Showing 10 of 10 notifications. Manage all notification settings│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Page Header
```
┌─────────────────────────────────────────────────────────────────┐
│  📬 Notifications      [Badge: 3 Unread]  [Badge: 1 Urgent]     │
│  View your notification history and customize preferences        │
│                                                                   │
│  [✓ Mark All Read]  [⚙️ Settings]                               │
└─────────────────────────────────────────────────────────────────┘
```
- **Title**: "Notifications"
- **Badges**: 
  - Purple badge for unread count
  - Red badge for urgent notifications
- **Actions**:
  - "Mark All Read" button
  - "Settings" button → links to full notification settings page

### 2. Search and Filters Bar
```
┌───────────────────────────────────────────────────────────────┐
│ 🔍 Search notifications...                            [×]     │
│                                                               │
│ Filters:                                                      │
│ [👁️ Unread ▼]  [📁 Client ▼]  [📱 Email ▼]                 │
│                                                               │
│ ☐ Select all (5 selected)  [✓ Read (5)]  [🗑️ Delete]       │
└───────────────────────────────────────────────────────────────┘
```

**Filter Options:**
1. **Read Status**: All / Unread / Read
2. **Category**: All Categories / Client / Invoice / Task / Project / etc.
3. **Channel**: All Channels / App / Email / SMS

**Bulk Actions** (appears when items selected):
- Mark as Read
- Delete

### 3. Notification Card (Collapsed)
```
┌───────────────────────────────────────────────────────────────┐
│ ☐ [Icon] Title Text                      Badge    Timestamp   │
│          Message text goes here...                            │
│                                                               │
│   [Category]  Sent via: [📱] [📧] [📱]  [Custom]            │
│   Mark as read/unread | [Customize ▼]               [🗑️]    │
└───────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Checkbox**: For bulk selection
- **Category Icon**: Colored square with icon (e.g., 💼 for client, 📄 for invoice)
- **Title**: Bold notification title
- **Priority Badge**: If urgent/important
- **Unread Indicator**: Small purple dot if unread
- **Message**: Gray text, notification details
- **Category Badge**: Outlined badge with category name
- **Channel Indicators**: Visual boxes showing App/Email/SMS
- **Custom Badge**: Purple badge if custom preferences set
- **Actions**: Mark as read/unread, Customize button, Delete icon

**Visual States:**
- **Unread**: Purple left border + light purple background
- **Read**: White background, no border
- **Hover**: Shadow increases

### 4. Notification Card (Expanded Settings)
```
┌───────────────────────────────────────────────────────────────┐
│ ☐ [Icon] Title                                    Timestamp   │
│          Message                                              │
│                                                               │
│   [Category]  Sent via: [📱] [📧]                            │
│   Mark as read | [Customize ▲]                      [🗑️]    │
│                                                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ 🎨 Notification Preferences   [🔄 Reset to Defaults] │   │
│   │ How do you want to receive "..." notifications?      │   │
│   │                                                       │   │
│   │ Notification Channels:                                │   │
│   │ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│   │ │ 📱 App   │ │ 📧 Email │ │ 📱 SMS   │              │   │
│   │ │    ✓     │ │          │ │          │              │   │
│   │ └──────────┘ └──────────┘ └──────────┘              │   │
│   │  Selected     Unselected   Unselected                │   │
│   │                                                       │   │
│   │ ┌────────────────────────────────────────────────┐   │   │
│   │ │ 🔊 Notification Sound           [Toggle ON]   │   │   │
│   │ │ Play sound when app notification appears      │   │   │
│   │ └────────────────────────────────────────────┘   │   │   │
│   │                                                       │   │
│   │ Example: Example notification text here...          │   │
│   └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

**Settings Panel Elements:**
1. **Header**: "Notification Preferences" + Reset button
2. **Description**: "How do you want to receive [notification type]?"
3. **Channel Selection**:
   - Three large clickable boxes (App, Email, SMS)
   - Purple border when selected
   - Gray border when unselected
   - Checkmark icon when selected
4. **Sound Toggle**: Only shows if App is selected
5. **Example Preview**: Shows sample notification text

**Interaction:**
- Click channel box to toggle selection
- Click sound toggle to turn on/off
- Changes save automatically with toast confirmation
- "Reset to Defaults" removes custom preferences

## Channel Indicator System

### Visual Format
```
Sent via: [📱 App] [📧 Email] [📱 SMS]
```

### Channel Icons
- **📱 App** (MessageSquare icon) - In-app notifications
- **📧 Email** (Mail icon) - Email notifications  
- **📱 SMS** (Smartphone icon) - Text messages

### Display Logic
- Shows which channels THIS specific notification was sent through
- Gray background boxes with icon + text
- Helps user understand their notification delivery
- Text label hidden on small screens, icon remains

### Examples
```
Payment notification: [📱 App] [📧 Email] [📱 SMS]
→ User received this via all 3 channels

Document upload:      [📱 App]
→ User only received this in-app

Security alert:       [📱 App] [📧 Email] [📱 SMS]
→ Critical notification sent via all channels
```

## Color System

### Category Colors (from CATEGORY_INFO)
```
Client:             🟣 Purple   (#7C3AED)
Project:            🔵 Blue     (#3B82F6)
Task:               🟢 Green    (#10B981)
Organizer:          🟠 Orange   (#F59E0B)
Invoice:            🔴 Red      (#EF4444)
Subscription:       🎀 Pink     (#EC4899)
Signature:          🟣 Violet   (#8B5CF6)
Incoming Docs:      🔵 Cyan     (#06B6D4)
Team:               🟢 Lime     (#84CC16)
HR:                 🟠 Orange   (#F97316)
System:             ⚫ Gray     (#6B7280)
Security:           🔴 Red      (#DC2626)
```

### Priority Colors
```
🔴 Urgent:          Red background
🟠 Important:       Orange background
🔵 Normal:          Blue background
⚫ Low:             Gray background
```

### Status Colors
```
Unread:             Purple left border + light purple bg
Read:               White background
Custom:             Purple badge
```

## Responsive Behavior

### Desktop (lg and up)
```
┌─────────────────────────────────────────────────────────────────┐
│ Full layout with all elements visible                            │
│ Channel text labels shown: [📱 App] [📧 Email] [📱 SMS]         │
│ All filter buttons in one row                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet (md)
```
┌─────────────────────────────────────────────────────┐
│ Layout adapts, filters may wrap to second row       │
│ Channel text labels shown                           │
└─────────────────────────────────────────────────────┘
```

### Mobile (sm and below)
```
┌─────────────────────────────────────┐
│ Vertical stacking                   │
│ Channel icons only: [📱] [📧] [📱] │
│ Filters stack vertically            │
│ Compact padding                     │
└─────────────────────────────────────┘
```

## Interactive States

### Notification Card States
```
DEFAULT:        White bg, gray border
HOVER:          Increased shadow
UNREAD:         Purple left border + tinted bg
SELECTED:       Checkbox checked
EXPANDED:       Settings panel visible with animation
```

### Channel Selection States
```
UNSELECTED:     Gray border, white bg
SELECTED:       Purple border, purple bg, checkmark
HOVER:          Slightly darker border
DISABLED:       Grayed out (for locked notifications)
```

### Button States
```
PRIMARY:        Purple bg (var(--primaryColor))
OUTLINE:        Transparent bg, border
GHOST:          No border, transparent bg
HOVER:          Darker shade
DISABLED:       Grayed out, no interaction
```

## Accessibility Features

### Multiple Visual Indicators
- ✅ Color + icon + text
- ✅ Border + background for unread
- ✅ Badge + dot for unread indicator
- ✅ Icons always accompanied by text (on desktop)

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Enter/Space to activate buttons
- Escape to close expanded panels

### Screen Reader Support
- Proper ARIA labels
- Status announcements (e.g., "Marked as read")
- Icon descriptions
- Button purposes clearly labeled

## Animation Details

### Expand/Collapse Settings
```javascript
// Motion animation
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
exit: { height: 0, opacity: 0 }
duration: 0.2s
```

### Toast Notifications
```javascript
// On preference change
toast.success("Notification preferences updated")

// On reset
toast.success("Reset to category defaults")

// On bulk action
toast.success("Marked 5 notifications as read")
```

## Empty States

### No Notifications
```
┌────────────────────────────────────┐
│           🔔                       │
│                                    │
│    No notifications found          │
│    You're all caught up!           │
└────────────────────────────────────┘
```

### No Search Results
```
┌────────────────────────────────────┐
│           🔔                       │
│                                    │
│    No notifications found          │
│    Try adjusting your search       │
│    or filters                      │
└────────────────────────────────────┘
```

## Success Scenarios

### User Flow Example:
1. User clicks bell icon → Page loads with 5 unread notifications
2. User sees "Payment Received" with [📱 App] [📧 Email] indicators
3. User clicks "Customize" → Settings panel expands
4. User sees App and Email are selected
5. User clicks SMS box → SMS gets selected, purple border appears
6. Toast: "Notification preferences updated"
7. Purple "Custom" badge appears on the notification card
8. User can continue browsing or click "Reset to Defaults"

## Summary

The Notifications Management Page provides a visually intuitive interface where:
- **What happened** is clear from the title and message
- **How you were notified** is obvious from channel indicators
- **Changing preferences** is easy with inline editing
- Everything uses consistent branding colors and visual-first design
- Mobile-responsive and ADA compliant throughout
