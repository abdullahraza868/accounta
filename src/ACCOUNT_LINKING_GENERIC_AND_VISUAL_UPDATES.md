# Account Linking Generic Updates & Visual-First Improvements

## Summary
Made the household linking feature more generic to support any type of account linking (spouse, business partner, family, etc.) and converted the unlink reason selection to use visual clickable boxes instead of radio buttons. Also implemented double-click-outside-to-close behavior for all dialogs.

## Changes Made

### 1. Generic Account Linking Terminology ✅

**Before (Spouse-specific):**
- "Household Linking" → "Account Linking"
- "Manage Household" → "Link Account"
- "Unlink Spouse" → "Unlink Account"
- `linkedSpouse` → `linkedAccount`
- `spouseEmail` → `accountEmail`
- `householdStatus` → `accountLinkStatus`

**Updated Variables:**
```tsx
// State variables
const [showAccountLinking, setShowAccountLinking] = useState(false);
const [linkingState, setLinkingState] = useState<'idle' | 'sending' | 'sent'>('idle');
const [accountEmail, setAccountEmail] = useState('');
const [accountLinkStatus, setAccountLinkStatus] = useState<AccountLinkStatus>('none');
const [linkedAccount, setLinkedAccount] = useState<{
  name: string;
  email: string;
  linkedDate: Date;
  accessLevel: 'full' | 'limited';
  relationship?: string; // NEW: 'spouse', 'business_partner', 'family', etc.
} | null>(null);
```

**Activity Log Type:**
- `household_unlinked` → `account_unlinked`

**Benefits:**
- ✅ Works for any relationship type
- ✅ More flexible for business use cases
- ✅ Clearer naming for multi-purpose linking
- ✅ Optional `relationship` field for future categorization

### 2. Visual Reason Selection ✅

**Before: Radio Buttons**
```tsx
<RadioGroup value={unlinkReason} onValueChange={setUnlinkReason}>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="divorced" id="divorced" />
      <Label htmlFor="divorced">Divorced</Label>
    </div>
    {/* ... */}
  </div>
</RadioGroup>
```

**After: Visual Clickable Boxes**
```tsx
<div className="grid grid-cols-3 gap-3">
  <ClickableOptionBox
    selected={unlinkReason === 'divorced'}
    onClick={() => setUnlinkReason('divorced')}
    label="Divorced"
  />
  <ClickableOptionBox
    selected={unlinkReason === 'separated'}
    onClick={() => setUnlinkReason('separated')}
    label="Separated"
  />
  <ClickableOptionBox
    selected={unlinkReason === 'other'}
    onClick={() => setUnlinkReason('other')}
    label="Other"
  />
</div>
```

**Benefits:**
- ✅ More visually appealing
- ✅ Easier to see all options at once
- ✅ Better mobile experience
- ✅ Consistent with visual-first design philosophy
- ✅ Built-in accessibility

### 3. Double-Click Outside to Close ✅

**Enhanced AlertDialog Component:**
```tsx
// New prop added to AlertDialogContent
<AlertDialogContent 
  onDoubleClickOutsideClose={() => setOpen(false)}
>
  {/* Dialog content */}
</AlertDialogContent>
```

**Implementation in AlertDialog:**
```tsx
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & {
    onDoubleClickClose?: () => void;
  }
>(({ className, onDoubleClickClose, ...props }, ref) => {
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onDoubleClickClose) {
      onDoubleClickClose();
    }
  };

  return (
    <AlertDialogPrimitive.Overlay
      onDoubleClick={handleDoubleClick}
      {...props}
    />
  );
});
```

**Benefits:**
- ✅ Quick way to dismiss dialogs
- ✅ Works on desktop and mobile (double-tap)
- ✅ Doesn't interfere with single-click
- ✅ Intuitive user gesture

### 4. Applied to Profile Page ✅

**Unlink Account Dialog:**
```tsx
<AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
  <AlertDialogContent 
    className="max-w-lg"
    onDoubleClickOutsideClose={() => setShowUnlinkDialog(false)}
  >
    <AlertDialogHeader>
      <AlertDialogTitle>Unlink Account</AlertDialogTitle>
      <AlertDialogDescription>
        {/* Visual reason selection */}
        <div className="grid grid-cols-3 gap-3">
          <ClickableOptionBox selected={...} onClick={...} label="Divorced" />
          <ClickableOptionBox selected={...} onClick={...} label="Separated" />
          <ClickableOptionBox selected={...} onClick={...} label="Other" />
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
  </AlertDialogContent>
</AlertDialog>
```

## Files Modified

### 1. `/pages/client-portal/profile/ClientPortalProfile.tsx`
**Changes:**
- ✅ Updated all household terminology to account linking
- ✅ Renamed all state variables to be generic
- ✅ Changed activity log type from `household_unlinked` to `account_unlinked`
- ✅ Updated all UI text to be generic
- ✅ Converted radio buttons to ClickableOptionBox
- ✅ Added double-click-outside-to-close to unlink dialog
- ✅ Added optional `relationship` field to linkedAccount type

### 2. `/components/ui/alert-dialog.tsx`
**Changes:**
- ✅ Added `onDoubleClickClose` prop to AlertDialogOverlay
- ✅ Added `onDoubleClickOutsideClose` prop to AlertDialogContent
- ✅ Implemented double-click handler that checks event target
- ✅ Passes prop from Content to Overlay

### 3. `/components/ui/dialog.tsx`
**Changes:**
- ✅ Added `onDoubleClickClose` prop to DialogOverlay
- ✅ Added `onDoubleClickOutsideClose` prop to DialogContent
- ✅ Implemented double-click handler
- ✅ Consistent with AlertDialog implementation

## New Documentation

### 1. `/TOOLBOX_DOUBLE_CLICK_OUTSIDE_TO_CLOSE.md`
Complete guide for implementing double-click-outside-to-close behavior:
- Overview and when to use
- Implementation examples
- Technical details
- Best practices
- Migration checklist
- User experience benefits

### 2. `/DESIGN_VISUAL_FIRST_STANDARD.md`
Comprehensive visual-first design philosophy:
- Core principle: "If you can make it visual and clickable, do it"
- Visual components priority list
- When traditional controls ARE appropriate
- Real-world examples
- Layout guidelines
- Accessibility considerations
- Design checklist
- Benefits (UX, development, business)
- Component reference
- Migration strategy
- Exception cases

### 3. `/DEVELOPMENT_CHECKLIST.md`
Master checklist for all development:
- Visual-first design checks
- Dialog/popup interaction checks
- Form validation checks
- Date formatting checks
- Branding & colors checks
- Dropdowns & lists checks
- Tables checks
- Typography checks
- Accessibility checks
- Mobile responsiveness checks
- Dialog-specific template
- Form-specific template
- Testing checklist
- Code quality checklist
- Documentation checklist
- Common mistakes to avoid

## UI Text Updates

### Section Title
**Before:** "Household Linking"  
**After:** "Account Linking"

### Button Text
**Before:** "Manage Household"  
**After:** "Link Account"

**Before:** "Unlink Spouse"  
**After:** "Unlink Account"

### Description Text
**Before:** "Link your spouse to share tax documents..."  
**After:** "Link another account to share tax documents..."

**Before:** "Your spouse has access to shared tax deliverables"  
**After:** "A linked account has access to shared tax deliverables"

### Status Messages
**Before:** "No spouse linked yet"  
**After:** "No linked accounts yet"

**Before:** "Household Linked"  
**After:** "Account Linked"

**Before:** "Spouse accepted the invitation"  
**After:** "User accepted the invitation"

### Form Labels
**Before:** "Spouse Email Address"  
**After:** "Email Address"

**Before:** "Enter your spouse's email address..."  
**After:** "Enter the email address of the account you'd like to link"

### Dialog Title
**Before:** "Unlink Spouse"  
**After:** "Unlink Account"

### Activity Log
**Before:** "Household unlinked"  
**After:** "Account unlinked"

## Reason Capture Enhancement

The unlink dialog now captures why accounts are being unlinked:

**Options:**
1. **Divorced** - For marital dissolution
2. **Separated** - For separation situations  
3. **Other** - For any other reason (with text field)

**Storage:**
```tsx
const confirmUnlinkAccount = () => {
  let reasonText = '';
  if (unlinkReason === 'divorced') {
    reasonText = 'Reason: Divorced';
  } else if (unlinkReason === 'separated') {
    reasonText = 'Reason: Separated';
  } else if (unlinkReason === 'other' && unlinkReasonOther.trim()) {
    reasonText = `Reason: ${unlinkReasonOther.trim()}`;
  }
  
  // Stored in activity log
  details: `${linkedAccount?.name} was unlinked. ${reasonText}`
};
```

**Activity Log Entry Example:**
```
"Jane Doe (jane.doe@example.com) was unlinked. Reason: Divorced"
```

## Visual Design Philosophy

### Why Visual-First?

**User Experience:**
- ✅ Faster decision making (see all options at once)
- ✅ Clearer visual hierarchy
- ✅ More engaging interface
- ✅ Reduced cognitive load
- ✅ Better mobile experience

**Development:**
- ✅ Consistent patterns across app
- ✅ Reusable components
- ✅ Built-in accessibility
- ✅ Easier to maintain

**Business:**
- ✅ Higher conversion rates
- ✅ Reduced user errors
- ✅ Better user satisfaction
- ✅ More modern appearance

### Component Usage Priority

1. **ClickableOptionBox** - For 2-6 options with short labels
2. **Toggle Switches** - For binary on/off choices
3. **Segmented Controls** - For 2-4 mutually exclusive options
4. **Progress Steppers** - For multi-step processes
5. **Visual Cards** - For options with icons/descriptions
6. **Traditional Controls** - Only when above don't work

## How to Apply Visual-First

### Quick Decision Tree

```
Is it a selection? 
  ├─ 2-6 options with short labels?
  │   └─ ✅ Use ClickableOptionBox
  ├─ Binary choice (on/off)?
  │   └─ ✅ Use Switch
  ├─ 2-4 mutually exclusive options?
  │   └─ ✅ Use Segmented Control
  ├─ Multi-step process?
  │   └─ ✅ Use Progress Stepper
  └─ 10+ options or searchable?
      └─ ✅ Use Dropdown/Select
```

## Testing Completed

### Visual Design ✅
- Visual option boxes display correctly
- Grid layout works on desktop
- Grid layout stacks on mobile
- Selected state is clear
- Hover states work

### Functionality ✅
- Clicking boxes selects the option
- Only one option can be selected at a time
- "Other" option shows text field
- Text field input is captured
- Reason is stored in activity log

### Double-Click Behavior ✅
- Double-clicking overlay closes dialog
- Double-clicking dialog content does NOT close
- Works on desktop
- Works on mobile (double-tap)
- Doesn't interfere with single-click

### Accessibility ✅
- Keyboard navigation works (Tab)
- Enter/Space activates selection
- ARIA labels present
- Focus states visible
- Screen reader friendly

### Terminology Updates ✅
- All "household" changed to "account"
- All "spouse" changed to generic terms
- Button labels updated
- Toast messages updated
- Activity log entries updated

## Future Enhancements

### Relationship Types
Could add a field to specify relationship:
```tsx
const [linkedAccount, setLinkedAccount] = useState<{
  name: string;
  email: string;
  linkedDate: Date;
  accessLevel: 'full' | 'limited';
  relationship?: 'spouse' | 'business_partner' | 'family' | 'accountant' | 'other';
} | null>(null);
```

### Multiple Linked Accounts
Could extend to support multiple linked accounts:
```tsx
const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
```

### Advanced Permissions
Could add granular permissions beyond full/limited:
```tsx
permissions: {
  viewDocuments: boolean;
  uploadDocuments: boolean;
  viewInvoices: boolean;
  signDocuments: boolean;
}
```

## Migration Notes

If you have existing household linking implementations:

1. Replace `household` with `account` in variable names
2. Replace `spouse` with `account` or generic terms
3. Update UI text to be relationship-agnostic
4. Add `relationship` field to support categorization
5. Convert radio buttons to ClickableOptionBox
6. Add double-click-outside-to-close to dialogs
7. Test all functionality
8. Update documentation

## Standards Established

### 1. Visual-First Design
All new selection interfaces should prioritize visual clickable elements over traditional form controls.

### 2. Double-Click Outside Close
All dialogs must include `onDoubleClickOutsideClose` prop.

### 3. Generic Terminology
Use generic, inclusive terminology that supports multiple use cases rather than specific relationship types.

### 4. Development Checklist
Consult `/DEVELOPMENT_CHECKLIST.md` before creating any new component.

---

## Quick Reference

**Visual-First:** `/DESIGN_VISUAL_FIRST_STANDARD.md`  
**Double-Click Close:** `/TOOLBOX_DOUBLE_CLICK_OUTSIDE_TO_CLOSE.md`  
**ClickableOptionBox:** `/TOOLBOX_CLICKABLE_OPTION_BOX.md`  
**Development Checklist:** `/DEVELOPMENT_CHECKLIST.md`

**Component:** `/pages/client-portal/profile/ClientPortalProfile.tsx`  
**AlertDialog:** `/components/ui/alert-dialog.tsx`  
**Dialog:** `/components/ui/dialog.tsx`

---

**Status:** ✅ Complete  
**Next Steps:** Apply these patterns throughout the application
