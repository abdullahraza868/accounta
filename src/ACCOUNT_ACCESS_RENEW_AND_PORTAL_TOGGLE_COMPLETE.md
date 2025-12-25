# Account Access - Renew Access & Portal Toggle Complete

## Changes Made

### 1. Renew Access Button (When Expired)
When a user's access status is "Expired", a "Renew & Send" button now appears in the Actions column, outside of the 3-dot dropdown menu.

**Features:**
- Visible button with rotating arrow icon
- Opens dialog with quick renewal options
- Styled with primary brand color

### 2. Renew Access Dialog
A comprehensive dialog that provides three renewal options:

**Quick Renewal Options:**
- 30 Days - One-click renewal
- 90 Days - One-click renewal
- Both automatically update expiry date and send credentials

**Custom Option:**
- Navigate to Edit User page for custom date and settings
- Full control over all user parameters

**Visual Design:**
- Clean grid layout for quick options
- Divider with "Or" text
- Info note about automatic credential sending
- Consistent branding colors throughout

### 3. Portal Access Toggle
The Portal Access status is now fully interactive:

**When Active:**
- Shows green "Active" text with checkmark icon
- Dotted underline indicates clickability
- Click to remove portal access

**When Inactive:**
- Shows gray "No Portal" text with X icon
- Dotted underline indicates clickability
- Click to grant portal access

**User Experience:**
- Hover effect (opacity change)
- Tooltip on hover
- Toast confirmation message
- Immediate visual feedback

## Technical Implementation

### New State
```typescript
const [renewAccessDialog, setRenewAccessDialog] = useState<{ 
  open: boolean; 
  userId: string | null 
}>({ 
  open: false, 
  userId: null 
});
```

### New Functions
```typescript
// Open renew dialog
const handleRenewAccess = (userId: string) => {
  setRenewAccessDialog({ open: true, userId });
};

// Navigate to edit page
const handleRenewWithEdit = () => {
  if (renewAccessDialog.userId) {
    navigate(`/client-portal/account-access/add-user?edit=${renewAccessDialog.userId}`);
    setRenewAccessDialog({ open: false, userId: null });
  }
};

// Quick renewal with preset days
const handleRenewQuick = (days: number) => {
  if (renewAccessDialog.userId) {
    const user = portalUsers.find((u) => u.id === renewAccessDialog.userId);
    if (user) {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + days);
      
      setPortalUsers((prev) =>
        prev.map((u) =>
          u.id === renewAccessDialog.userId
            ? { ...u, accessExpires: newExpiryDate.toISOString(), status: 'Active' }
            : u
        )
      );
      
      toast.success(`Access renewed for ${days} days. Login credentials sent to ${user.email}`);
      setRenewAccessDialog({ open: false, userId: null });
    }
  }
};

// Toggle portal access on/off
const handleTogglePortalAccess = (userId: string) => {
  const user = portalUsers.find((u) => u.id === userId);
  if (user) {
    setPortalUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, hasPortalAccess: !u.hasPortalAccess }
          : u
      )
    );
    toast.success(user.hasPortalAccess ? 'Portal access removed' : 'Portal access granted');
  }
};
```

### Updated Props
Added `handleTogglePortalAccess` to DraggableRow component props for portal access toggle functionality.

## File Modified
- `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`

## User Workflow

### Renewing Expired Access
1. User's access expires
2. Status badge shows "Expired" in red
3. "Renew & Send" button appears in Actions column
4. Click button to open renewal dialog
5. Choose quick renewal (30 or 90 days) or custom settings
6. Quick renewal: Immediate update + toast confirmation
7. Custom renewal: Navigate to edit page

### Managing Portal Access
1. Look at Portal Access indicator in Status column
2. See "Active" (green) or "No Portal" (gray)
3. Notice dotted underline indicating clickability
4. Click to toggle portal access
5. Receive toast confirmation
6. Visual update is immediate

## Benefits
- **Faster workflows** - Quick renewal options save time
- **Clear visual cues** - Dotted underline shows clickability
- **Consistent UX** - Follows established dialog patterns
- **Better accessibility** - Obvious interactive elements
- **Flexible options** - Quick renewal or detailed edit

## Status
✅ Complete and functional
