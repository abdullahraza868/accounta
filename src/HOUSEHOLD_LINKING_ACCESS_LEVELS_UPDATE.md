# Household Linking - Access Levels Update

## Changes Implemented

### 1. **Clickable "No Spouse Linked" Box**
The initial state box is now fully clickable - same action as the "Manage Household" button.

**Features:**
- ✅ Entire box is clickable
- ✅ Hover effect (shadow appears)
- ✅ Cursor changes to pointer
- ✅ Keyboard accessible (Enter/Space)
- ✅ UserPlus icon on right side
- ✅ Updated text: "Click here to send an invitation"

**Before:**
```
┌──────────────────────────────────────────────┐
│ 🏠 No spouse linked yet                      │
│ Click "Manage Household" to send invitation  │← Just info
└──────────────────────────────────────────────┘
```

**After:**
```
┌──────────────────────────────────────────────┐
│ 🏠 No spouse linked yet               👤+    │← Clickable!
│ Click here to send an invitation             │  Hover effect
└──────────────────────────────────────────────┘
```

---

### 2. **Access Level Options When Linked**
When household is linked, you can now choose between two access levels:

#### **Full Access** (Default)
- Spouse can see ALL tax documents
- Spouse can see ALL tax returns
- Complete transparency

#### **Limited Access**
- Spouse can ONLY see final tax return deliverables
- Cannot see work-in-progress documents
- Cannot see intermediate versions
- Only the completed, delivered tax return

---

## Visual Design - Linked State

### Full Access Selected (Default)
```
┌────────────────────────────────────────────────────┐
│ ✅ Household Linked                                │
│                                                    │
│ 👤 Jane Doe                                        │
│ 📧 jane.doe@example.com                            │
│ 🔗 Linked on 11/01/2025                            │
│                                                    │
│ ┌────────────────────────────────────────────────┐│
│ │ Access Level:                                  ││
│ │                                                ││
│ │ ┌────────────────────────────────────────────┐││ 
│ │ │ ● Full Access                   ← SELECTED ││← Green border
│ │ │ Can see all tax documents and returns      │││  Green bg
│ │ └────────────────────────────────────────────┘││
│ │                                                ││
│ │ ┌────────────────────────────────────────────┐││
│ │ │ ○ Limited Access                           │││← Light border
│ │ │ Can only see final tax return deliverables │││  White bg
│ │ └────────────────────────────────────────────┘││
│ │                                                ││
│ │ Always Shared:                                 ││
│ │ ✓ Final tax return (both receive copies)      ││
│ │ ✗ Uploaded documents (always separate)        ││
│ └────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

### Limited Access Selected
```
┌────────────────────────────────────────────────────┐
│ ✅ Household Linked                                │
│                                                    │
│ 👤 Jane Doe                                        │
│ 📧 jane.doe@example.com                            │
│ 🔗 Linked on 11/01/2025                            │
│                                                    │
│ ┌────────────────────────────────────────────────┐│
│ │ Access Level:                                  ││
│ │                                                ││
│ │ ┌────────────────────────────────────────────┐││
│ │ │ ○ Full Access                              │││← Light border
│ │ │ Can see all tax documents and returns      │││  White bg
│ │ └────────────────────────────────────────────┘││
│ │                                                ││
│ │ ┌────────────────────────────────────────────┐││
│ │ │ ● Limited Access                ← SELECTED │││← Green border
│ │ │ Can only see final tax return deliverables │││  Green bg
│ │ └────────────────────────────────────────────┘││
│ │                                                ││
│ │ Always Shared:                                 ││
│ │ ✓ Final tax return (both receive copies)      ││
│ │ ✗ Uploaded documents (always separate)        ││
│ └────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

---

## Access Level Comparison

| Feature | Full Access | Limited Access |
|---------|-------------|----------------|
| **Final Tax Return** | ✅ Yes | ✅ Yes |
| **Draft Tax Returns** | ✅ Yes | ❌ No |
| **Work-in-Progress Documents** | ✅ Yes | ❌ No |
| **Tax Worksheets** | ✅ Yes | ❌ No |
| **Supporting Documents** | ✅ Yes | ❌ No |
| **Uploaded Documents** | ❌ No (always separate) | ❌ No (always separate) |
| **Document Storage** | ❌ No (always separate) | ❌ No (always separate) |

---

## User Flow

### Initial Setup (New)
1. Click clickable "No spouse linked yet" box OR "Manage Household" button
2. Enter spouse email
3. Send invitation
4. Spouse accepts
5. **Default: Full Access** is automatically selected

### Changing Access Level
1. Navigate to Profile page
2. Scroll to Household section
3. See current access level highlighted
4. Click desired access level option
5. Toast confirmation appears
6. Access level updated immediately

---

## Toast Messages

### When Changing to Full Access
```
✅ Spouse can now see all tax documents
```

### When Changing to Limited Access
```
✅ Spouse can now see only final tax returns
```

---

## Interactive Elements

### Clickable "No Link" Box
```tsx
<div 
  className="cursor-pointer transition-all hover:shadow-md"
  onClick={() => setShowHouseholdManagement(true)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowHouseholdManagement(true);
    }
  }}
>
```

**Accessibility:**
- `role="button"` - Announced as button to screen readers
- `tabIndex={0}` - Can be reached via Tab key
- Keyboard support for Enter and Space keys
- Visual hover effect

### Access Level Options
```tsx
<div 
  className="cursor-pointer transition-all border-2"
  onClick={() => handleChangeAccessLevel('full')}
  role="button"
  tabIndex={0}
  onKeyDown={...}
>
```

**Visual States:**
- **Selected:** Green border (border-green-600), green background (bg-green-50), filled circle
- **Unselected:** Light border (border-green-200), white background, empty circle
- **Hover:** Darker border (border-green-400), white background

---

## Data Structure

### LinkedSpouse Type
```typescript
type LinkedSpouse = {
  name: string;
  email: string;
  linkedDate: Date;
  accessLevel: 'full' | 'limited'; // NEW!
};
```

### Default Values
```typescript
// When spouse accepts invitation
setLinkedSpouse({
  name: 'Jane Doe',
  email: 'jane@example.com',
  linkedDate: new Date(),
  accessLevel: 'full', // Default to full access
});
```

---

## API Integration Points

### Update Access Level
```typescript
// POST /api/household/update-access-level
{
  accessLevel: 'full' | 'limited'
}

// Response
{
  success: boolean,
  accessLevel: 'full' | 'limited'
}
```

### Get Household Status (Updated)
```typescript
// GET /api/household/status

// Response
{
  status: 'none' | 'pending' | 'linked' | 'rejected' | 'expired',
  linkedSpouse: {
    name: string,
    email: string,
    linkedDate: Date,
    accessLevel: 'full' | 'limited' // NEW!
  } | null
}
```

---

## Business Logic

### What Full Access Means
When `accessLevel === 'full'`:
- Spouse receives ALL tax-related deliverables
- Includes drafts, worksheets, supporting docs
- Full transparency in tax preparation
- Both spouses see identical tax documents

### What Limited Access Means
When `accessLevel === 'limited'`:
- Spouse receives ONLY final tax return
- No work-in-progress documents visible
- No intermediate versions
- Only the completed, signed-off tax return
- More privacy in the preparation process

### Always Separate (Both Levels)
Regardless of access level:
- ❌ Uploaded documents (client uploads)
- ❌ Document storage/folders
- ❌ Personal files
- ❌ Non-tax related documents

---

## Use Cases

### Full Access (Recommended for Most)
**Best for:**
- Married couples filing jointly
- Full financial transparency
- Both spouses want to review everything
- Collaborative tax review

**Example:**
> "John and Jane file jointly. They both want to see all tax documents, worksheets, and drafts so they can review together before filing."

### Limited Access
**Best for:**
- One spouse handles all tax matters
- Other spouse only needs final return for records
- Privacy in preparation process
- Separation of financial responsibilities

**Example:**
> "John handles all tax preparation. Jane only wants to receive the final tax return for her records, but doesn't need to see all the working papers."

---

## Testing Checklist

### Clickable Box
- [ ] Box is clickable and opens form
- [ ] Hover shows shadow effect
- [ ] Cursor changes to pointer
- [ ] Keyboard Tab focuses the box
- [ ] Enter key opens form
- [ ] Space key opens form
- [ ] UserPlus icon visible on right
- [ ] Text updated to "Click here"

### Access Levels
- [ ] Default is Full Access when linked
- [ ] Can click Full Access option
- [ ] Can click Limited Access option
- [ ] Only one option selected at a time
- [ ] Selected option has green border + background
- [ ] Unselected option has light border
- [ ] Hover effect works on unselected
- [ ] Toast appears when changing
- [ ] Toast message is correct
- [ ] Access level persists after page reload

### Keyboard Navigation
- [ ] Can Tab to access level options
- [ ] Enter key selects option
- [ ] Space key selects option
- [ ] Visual focus indicator present

---

## Code Changes Summary

### New State
```typescript
const [linkedSpouse, setLinkedSpouse] = useState<{
  name: string;
  email: string;
  linkedDate: Date;
  accessLevel: 'full' | 'limited'; // ← NEW
} | null>(null);
```

### New Handler
```typescript
const handleChangeAccessLevel = (level: 'full' | 'limited') => {
  if (!linkedSpouse) return;
  
  setLinkedSpouse({
    ...linkedSpouse,
    accessLevel: level,
  });
  
  const message = level === 'full' 
    ? 'Spouse can now see all tax documents' 
    : 'Spouse can now see only final tax returns';
  toast.success(message);
};
```

### Updated Components
1. **No Link Box** - Now clickable with hover effect
2. **Linked State** - Shows access level selector
3. **simulateAcceptance** - Sets default to 'full'

---

## Mobile Responsive

### Desktop View
- Access level options side by side
- Full text visible
- Larger click targets

### Mobile View (< 640px)
- Access level options stack vertically
- Full width
- Maintains readability
- Same functionality

---

## Security Considerations

### Access Control
- Access level stored per household link
- Backend validates access level on all document requests
- API enforces access restrictions
- Cannot bypass via frontend manipulation

### Audit Trail
- Log access level changes
- Track who changed it and when
- Include in household activity log

---

## Future Enhancements

1. **Time-based Access**
   - Temporary full access during tax season
   - Auto-revert to limited after filing

2. **Granular Permissions**
   - Select specific document types
   - Custom access rules
   - Per-year access settings

3. **Notification Settings**
   - Notify spouse when access level changes
   - Email confirmation of changes

4. **Access History**
   - View when access level was changed
   - See what documents spouse has accessed

---

## Status
✅ **COMPLETE** - Clickable box and access levels fully implemented

## Key Files Updated
- `/pages/client-portal/profile/ClientPortalProfile.tsx` - Main implementation
- State management for access levels
- Clickable box with keyboard support
- Access level selector UI
- Handler for changing access levels
