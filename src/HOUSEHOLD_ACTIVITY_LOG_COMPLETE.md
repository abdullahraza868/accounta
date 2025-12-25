# Household Linking - Activity Log Complete

## Overview
A collapsible activity log that tracks all household linking events in a beautiful timeline format. The log shows when invitations were sent, accepted, rejected, when access levels changed, and when households were unlinked.

---

## Visual Design

### Collapsed State (Default)
```
┌──────────────────────────────────────────────────────┐
│ ✅ Household Linked                                  │
│ ...                                                  │
│                    [Activity Log ▼] [Unlink Spouse]  │← Buttons
└──────────────────────────────────────────────────────┘
```

### Expanded State
```
┌──────────────────────────────────────────────────────┐
│ ✅ Household Linked                                  │
│ ...                                                  │
│                    [Activity Log ▲] [Unlink Spouse]  │← Button shows up arrow
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ 📜 Activity Log                         5 entries││
│ │                                                  ││
│ │ ● Access level changed to Full Access           ││← Latest
│ │ │ Can see all tax documents and returns         ││
│ │ │ By: You                 Oct 28, 2024 1:10 PM  ││
│ │ │                                               ││
│ │ ● Access level changed to Limited Access        ││
│ │ │ Can only see final tax return deliverables   ││
│ │ │ By: You                 Oct 25, 2024 11:20 AM││
│ │ │                                               ││
│ │ ✓ Invitation accepted                           ││
│ │ │ Jane Doe accepted the household linking      ││
│ │ │ invitation                                    ││
│ │ │                         Oct 21, 2024 4:45 PM ││
│ │ │                                               ││
│ │ 🔄 Invitation resent                            ││
│ │ │ jane.doe@example.com                         ││
│ │ │                         Oct 20, 2024 9:15 AM ││
│ │ │                                               ││
│ │ ✉️ Invitation sent                              ││
│ │   jane.doe@example.com                         ││
│ │                           Oct 15, 2024 2:30 PM ││← Oldest
│ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Activity Types & Icons

| Type | Icon | Color | Background | Description |
|------|------|-------|------------|-------------|
| **invitation_sent** | ✉️ Send | Blue (#3B82F6) | Light Blue (#DBEAFE) | Initial invitation sent |
| **invitation_resent** | 🔄 RefreshCw | Blue (#3B82F6) | Light Blue (#DBEAFE) | Invitation sent again |
| **invitation_accepted** | ✓ Check | Green (#10B981) | Light Green (#D1FAE5) | Spouse accepted |
| **invitation_rejected** | ✗ XCircle | Red (#EF4444) | Light Red (#FEE2E2) | Spouse rejected |
| **invitation_expired** | 🕐 Clock | Gray (#9CA3AF) | Light Gray (#F3F4F6) | Invitation timed out |
| **invitation_cancelled** | ✗ X | Gray (#9CA3AF) | Light Gray (#F3F4F6) | User cancelled |
| **access_changed** | 👥 Users | Purple (#8B5CF6) | Light Purple (#EDE9FE) | Access level modified |
| **household_unlinked** | ➖ UserMinus | Red (#EF4444) | Light Red (#FEE2E2) | Household disconnected |

---

## Data Structure

### Activity Log Entry
```typescript
type ActivityLogEntry = {
  id: string;                           // Unique identifier
  type: 'invitation_sent' |             // Type of activity
        'invitation_resent' | 
        'invitation_accepted' | 
        'invitation_rejected' | 
        'invitation_expired' | 
        'access_changed' | 
        'household_unlinked' | 
        'invitation_cancelled';
  timestamp: Date;                      // When it occurred
  description: string;                  // Main description
  details?: string;                     // Additional info (optional)
  performedBy?: string;                 // Who did it (optional)
};
```

### Example Entries
```typescript
// Invitation sent
{
  id: '1',
  type: 'invitation_sent',
  timestamp: new Date('2024-10-15T14:30:00'),
  description: 'Invitation sent',
  details: 'jane.doe@example.com',
}

// Invitation accepted
{
  id: '3',
  type: 'invitation_accepted',
  timestamp: new Date('2024-10-21T16:45:00'),
  description: 'Invitation accepted',
  details: 'Jane Doe accepted the household linking invitation',
}

// Access changed
{
  id: '4',
  type: 'access_changed',
  timestamp: new Date('2024-10-25T11:20:00'),
  description: 'Access level changed to Limited Access',
  details: 'Can only see final tax return deliverables',
  performedBy: 'You',
}

// Household unlinked
{
  id: '6',
  type: 'household_unlinked',
  timestamp: new Date('2024-10-30T10:00:00'),
  description: 'Household unlinked',
  details: 'Jane Doe (jane.doe@example.com) was unlinked',
  performedBy: 'You',
}
```

---

## Implementation Details

### State Management
```typescript
const [showActivityLog, setShowActivityLog] = useState(false);
const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
```

### Activity Log Button
```tsx
<Button
  variant="outline"
  onClick={() => setShowActivityLog(!showActivityLog)}
  style={{
    borderColor: branding.colors.primaryButton,
    color: branding.colors.primaryButton,
  }}
  className="gap-2"
>
  <History className="w-4 h-4" />
  Activity Log
  {showActivityLog ? (
    <ChevronUp className="w-4 h-4 ml-1" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1" />
  )}
</Button>
```

**Features:**
- Shows chevron up when open, down when closed
- Primary brand color
- Icon + text label
- Positioned next to "Unlink Spouse" button

---

### Collapsible Timeline

```tsx
<Collapsible open={showActivityLog} onOpenChange={setShowActivityLog}>
  <CollapsibleContent>
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Timeline content */}
    </motion.div>
  </CollapsibleContent>
</Collapsible>
```

**Features:**
- Smooth open/close animation
- Auto height calculation
- Fade in/out effect
- Uses Framer Motion

---

### Timeline Entry Layout

```tsx
<div className="relative flex gap-3 group">
  {/* Timeline line (connects entries) */}
  {!isLast && (
    <div className="absolute left-[15px] top-8 w-0.5 h-full" 
         style={{ background: borderColor }} />
  )}

  {/* Icon circle */}
  <div className="w-8 h-8 rounded-full flex items-center justify-center"
       style={{ background: bg }}>
    <Icon className="w-4 h-4" style={{ color }} />
  </div>

  {/* Content */}
  <div className="flex-1 pb-6">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <p className="text-sm font-medium">{entry.description}</p>
        {entry.details && (
          <p className="text-xs mt-1">{entry.details}</p>
        )}
        {entry.performedBy && (
          <p className="text-xs mt-1">By: {entry.performedBy}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-xs">Oct 28, 2024</p>
        <p className="text-xs">1:10 PM</p>
      </div>
    </div>
  </div>
</div>
```

**Layout:**
```
┌─────┬──────────────────────────────────────┐
│ ● ─ │ Description                Oct 28    │
│ │   │ Details                    1:10 PM   │
│ │   │ By: You                              │
│ ● ─ │ Description                Oct 25    │
│ │   │ Details                    11:20 AM  │
│ ●   │ Description                Oct 21    │
│     │ Details                    4:45 PM   │
└─────┴──────────────────────────────────────┘
```

---

## Auto-Logging Events

### 1. Invitation Sent
```typescript
const handleSendInvitation = () => {
  // ... send invitation logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_sent',
    timestamp: sentDate,
    description: 'Invitation sent',
    details: spouseEmail,
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 2. Invitation Resent
```typescript
const handleResendInvitation = () => {
  // ... resend logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_resent',
    timestamp: sentDate,
    description: 'Invitation resent',
    details: invitationData.email,
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 3. Invitation Cancelled
```typescript
const handleCancelPendingInvitation = () => {
  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_cancelled',
    timestamp: new Date(),
    description: 'Invitation cancelled',
    details: invitationData?.email || '',
    performedBy: 'You',
  };
  setActivityLog([newEntry, ...activityLog]);

  // ... cancel logic ...
};
```

### 4. Invitation Accepted
```typescript
const simulateAcceptance = () => {
  // ... acceptance logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_accepted',
    timestamp: acceptDate,
    description: 'Invitation accepted',
    details: 'Jane Doe accepted the household linking invitation',
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 5. Invitation Rejected
```typescript
const simulateRejection = () => {
  // ... rejection logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_rejected',
    timestamp: rejectDate,
    description: 'Invitation rejected',
    details: 'Your spouse declined the household linking invitation',
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 6. Invitation Expired
```typescript
const simulateExpiration = () => {
  // ... expiration logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'invitation_expired',
    timestamp: expireDate,
    description: 'Invitation expired',
    details: 'The invitation expired after 7 days without a response',
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 7. Access Level Changed
```typescript
const handleChangeAccessLevel = (level: 'full' | 'limited') => {
  // ... change access logic ...

  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'access_changed',
    timestamp: new Date(),
    description: `Access level changed to ${level === 'full' ? 'Full Access' : 'Limited Access'}`,
    details: level === 'full' 
      ? 'Can see all tax documents and returns' 
      : 'Can only see final tax return deliverables',
    performedBy: 'You',
  };
  setActivityLog([newEntry, ...activityLog]);
};
```

### 8. Household Unlinked
```typescript
const confirmUnlinkSpouse = () => {
  const newEntry: ActivityLogEntry = {
    id: Date.now().toString(),
    type: 'household_unlinked',
    timestamp: new Date(),
    description: 'Household unlinked',
    details: `${linkedSpouse?.name} (${linkedSpouse?.email}) was unlinked`,
    performedBy: 'You',
  };
  setActivityLog([newEntry, ...activityLog]);

  // ... unlink logic ...
};
```

---

## Helper Function: Icon Mapping

```typescript
const getActivityIcon = (type: ActivityLogEntry['type']) => {
  switch (type) {
    case 'invitation_sent':
      return { icon: Send, color: '#3B82F6', bg: '#DBEAFE' };
    case 'invitation_resent':
      return { icon: RefreshCw, color: '#3B82F6', bg: '#DBEAFE' };
    case 'invitation_accepted':
      return { icon: Check, color: '#10B981', bg: '#D1FAE5' };
    case 'invitation_rejected':
      return { icon: XCircle, color: '#EF4444', bg: '#FEE2E2' };
    case 'invitation_expired':
      return { icon: Clock, color: '#9CA3AF', bg: '#F3F4F6' };
    case 'invitation_cancelled':
      return { icon: X, color: '#9CA3AF', bg: '#F3F4F6' };
    case 'access_changed':
      return { icon: Users, color: '#8B5CF6', bg: '#EDE9FE' };
    case 'household_unlinked':
      return { icon: UserMinus, color: '#EF4444', bg: '#FEE2E2' };
    default:
      return { icon: AlertCircle, color: '#9CA3AF', bg: '#F3F4F6' };
  }
};
```

**Returns:**
- `icon` - Lucide React icon component
- `color` - Icon and text color
- `bg` - Background color for icon circle

---

## Date/Time Formatting

### Date Display
```typescript
timestamp.toLocaleDateString('en-US', { 
  month: 'short',    // "Oct"
  day: 'numeric',    // "28"
  year: 'numeric'    // "2024"
})
// Result: "Oct 28, 2024"
```

### Time Display
```typescript
timestamp.toLocaleTimeString('en-US', { 
  hour: 'numeric',   // "1"
  minute: '2-digit', // "10"
  hour12: true       // "PM"
})
// Result: "1:10 PM"
```

**Layout:**
```
Oct 28, 2024    ← Date on first line
1:10 PM         ← Time on second line
```

---

## Entry Badge

```tsx
<span className="text-xs px-2 py-0.5 rounded-full" 
      style={{ 
        background: `${branding.colors.primaryButton}15`,
        color: branding.colors.primaryButton,
      }}>
  {activityLog.length} {activityLog.length === 1 ? 'entry' : 'entries'}
</span>
```

**Example:**
- `5 entries` when there are 5 items
- `1 entry` when there is 1 item
- Branded color with 15% opacity background

---

## Timeline Connector Line

```tsx
{!isLast && (
  <div 
    className="absolute left-[15px] top-8 w-0.5 h-full -ml-px"
    style={{ background: branding.colors.borderColor }}
  />
)}
```

**Visual:**
```
●
│  ← Vertical line connects icons
│
●
│
●
   ← No line after last entry
```

**Positioning:**
- Positioned at `left-[15px]` (center of icon)
- Starts at `top-8` (below icon)
- Width of `0.5` (2px line)
- Full height to next entry
- Not rendered for last entry

---

## Color Coding System

### Blue - Informational
```css
Invitations sent/resent
- Icon: #3B82F6
- Background: #DBEAFE
```

### Green - Success
```css
Invitation accepted
- Icon: #10B981
- Background: #D1FAE5
```

### Red - Destructive
```css
Rejected/Unlinked
- Icon: #EF4444
- Background: #FEE2E2
```

### Gray - Neutral
```css
Expired/Cancelled
- Icon: #9CA3AF
- Background: #F3F4F6
```

### Purple - Action
```css
Access changed
- Icon: #8B5CF6
- Background: #EDE9FE
```

---

## Responsive Design

### Desktop (> 768px)
```
┌──────────────────────────────────────────┐
│ [Icon] Description         Oct 28, 2024  │
│        Details             1:10 PM       │
│        By: You                           │
└──────────────────────────────────────────┘
```

### Mobile (< 640px)
```
┌────────────────────────────┐
│ [Icon] Description         │
│        Details             │
│        By: You             │
│        Oct 28, 2024        │← Date wraps
│        1:10 PM             │
└────────────────────────────┘
```

**Adjustments:**
- Description and date side-by-side on desktop
- Stacked layout on mobile
- Icons maintain size
- Timeline line adjusts

---

## Empty State

```typescript
{activityLog.length > 0 && (
  <Collapsible>
    {/* Log content */}
  </Collapsible>
)}
```

**Behavior:**
- Activity Log button only shows when `householdStatus === 'linked'`
- Collapsible only renders if `activityLog.length > 0`
- If empty, nothing shows (no placeholder needed)

---

## Sorting

### Current: Newest First
```typescript
setActivityLog([newEntry, ...activityLog]);
//             ↑ New entry   ↑ Existing entries
```

**Display order:**
1. Most recent activity at top
2. Oldest activity at bottom
3. Timeline flows top to bottom

**Example:**
```
Latest:  Access changed (Oct 28)
         Access changed (Oct 25)
         Accepted (Oct 21)
         Resent (Oct 20)
Oldest:  Sent (Oct 15)
```

---

## Performance Considerations

### Limiting Entries
```typescript
// Option 1: Limit in state
const MAX_ENTRIES = 50;
setActivityLog([newEntry, ...activityLog.slice(0, MAX_ENTRIES - 1)]);

// Option 2: Limit in display
{activityLog.slice(0, 50).map((entry) => ...)}

// Option 3: Pagination
// Show 20 entries, "Load More" button
```

### Recommended Limits
- **Display:** Show last 50 entries
- **Storage:** Keep last 100 entries in state
- **API:** Paginate if > 100 entries
- **Archive:** Move old entries to separate endpoint

---

## API Integration

### Get Activity Log
```typescript
// GET /api/household/activity-log
// Response
{
  activities: ActivityLogEntry[],
  total: number,
  page: number,
  pageSize: number
}
```

### Add Activity Entry (Backend)
```typescript
// Automatically logged on backend for:
- All invitation actions
- Access level changes
- Household linking/unlinking
- Any household-related changes
```

### Load Activity Log
```typescript
useEffect(() => {
  const loadActivityLog = async () => {
    try {
      const response = await fetch('/api/household/activity-log');
      const data = await response.json();
      setActivityLog(data.activities);
    } catch (error) {
      console.error('Failed to load activity log', error);
    }
  };

  if (householdStatus === 'linked') {
    loadActivityLog();
  }
}, [householdStatus]);
```

---

## Testing Scenarios

### 1. Send Invitation
- Click "Manage Household"
- Enter email, send
- **Expected:** "Invitation sent" entry added
- Icon: Blue send icon
- Details: Email address

### 2. Resend Invitation
- From pending state, click "Resend"
- **Expected:** "Invitation resent" entry added
- Icon: Blue refresh icon
- Details: Email address

### 3. Cancel Invitation
- From pending state, click "Cancel"
- **Expected:** "Invitation cancelled" entry added
- Icon: Gray X icon
- Details: Email address

### 4. Accept Invitation (Test)
- From pending state, click "[Test] Accept"
- **Expected:** "Invitation accepted" entry added
- Icon: Green check icon
- Details: Spouse name + message

### 5. Reject Invitation (Test)
- From pending state, click "[Test] Reject"
- **Expected:** "Invitation rejected" entry added
- Icon: Red X circle icon
- Details: Decline message

### 6. Expire Invitation (Test)
- From pending state, click "[Test] Expire"
- **Expected:** "Invitation expired" entry added
- Icon: Gray clock icon
- Details: Expiration message

### 7. Change Access Level
- From linked state, click access option
- **Expected:** "Access changed" entry added
- Icon: Purple users icon
- Details: New access level + description
- PerformedBy: "You"

### 8. Unlink Spouse
- From linked state, click "Unlink Spouse"
- Confirm dialog
- **Expected:** "Household unlinked" entry added
- Icon: Red user minus icon
- Details: Spouse name + email
- PerformedBy: "You"

### 9. View Activity Log
- Click "Activity Log" button
- **Expected:** Timeline expands smoothly
- All entries visible
- Proper icons and colors
- Dates formatted correctly
- Timeline lines connect entries

### 10. Close Activity Log
- Click "Activity Log" again
- **Expected:** Timeline collapses smoothly
- Button shows down chevron

---

## Accessibility

### Keyboard Navigation
```
Tab     → Focus "Activity Log" button
Enter   → Toggle open/closed
Space   → Toggle open/closed
Tab     → Continue to next element
```

### Screen Reader
```tsx
<Button
  aria-label={`Activity log with ${activityLog.length} entries. ${showActivityLog ? 'Expanded' : 'Collapsed'}`}
  aria-expanded={showActivityLog}
>
  Activity Log
</Button>
```

**Announced:**
- "Activity log with 5 entries"
- "Expanded" or "Collapsed" state
- Each entry's description, details, and timestamp

### ARIA Attributes
```tsx
<Collapsible>
  <CollapsibleTrigger aria-controls="activity-log-content">
    Activity Log
  </CollapsibleTrigger>
  <CollapsibleContent id="activity-log-content">
    {/* Timeline */}
  </CollapsibleContent>
</Collapsible>
```

---

## Future Enhancements

### 1. Filtering
```
[All] [Invitations] [Access Changes] [Unlinks]
```
Filter by activity type

### 2. Search
```
[Search activity log...]
```
Search descriptions and details

### 3. Export
```
[Export to CSV]
```
Download activity history

### 4. Date Range
```
[Last 30 Days ▼]
```
Filter by time period

### 5. Detailed View
```
Click entry → Show full details in dialog
```
- IP address
- Browser/device
- Full timestamp
- Additional metadata

### 6. Notifications
```
Email when activity occurs
```
- Send notification on key events
- Configurable preferences

---

## Summary

### What Was Built
✅ Collapsible activity log section  
✅ Timeline layout with connecting lines  
✅ Color-coded icons for each activity type  
✅ Auto-logging for all household events  
✅ Date/time formatting  
✅ Entry count badge  
✅ Smooth animations  
✅ Responsive design  
✅ Full accessibility support  

### Key Features
- **8 activity types** tracked automatically
- **Color-coded** for quick scanning
- **Timeline view** with connecting lines
- **Newest first** sorting
- **Collapsible** to save space
- **Branded** colors throughout
- **Accessible** keyboard + screen reader support
- **Smooth animations** on open/close

### Files Updated
- `/pages/client-portal/profile/ClientPortalProfile.tsx`
  - Added activity log state and data
  - Added collapsible timeline component
  - Auto-logging in all relevant handlers
  - Helper function for icon mapping
  - Activity Log button with toggle

### Ready For
- API integration (GET/POST endpoints)
- Backend activity logging
- Historical data loading
- Pagination (if needed)
- Export functionality

---

## Status
✅ **COMPLETE** - Activity log fully implemented and functional
