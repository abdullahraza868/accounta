# Toolbox: Double-Click Outside to Close Popups

## Overview
This pattern allows users to close dialogs/popups by double-clicking on the overlay (outside the dialog content). This provides an alternative to clicking the X button or Cancel button.

## When to Use
- ✅ All AlertDialog components
- ✅ All Dialog components  
- ✅ All modal overlays
- ✅ Any popup/overlay interaction

## Implementation

### AlertDialog Component
The `AlertDialog` component has been enhanced with `onDoubleClickOutsideClose` prop:

```tsx
<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent 
    onDoubleClickOutsideClose={() => setIsOpen(false)}
  >
    {/* Dialog content */}
  </AlertDialogContent>
</AlertDialog>
```

### How It Works
1. User double-clicks on the dark overlay (outside the dialog)
2. The overlay detects the double-click event
3. The `onDoubleClickOutsideClose` callback is triggered
4. The dialog closes

### Example Usage

#### Basic Example
```tsx
const [showDialog, setShowDialog] = useState(false);

<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
  <AlertDialogContent 
    onDoubleClickOutsideClose={() => setShowDialog(false)}
  >
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Action</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to proceed?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### With Complex State
```tsx
const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);

const handleClose = () => {
  setShowUnlinkDialog(false);
  // Reset any form state if needed
  resetForm();
};

<AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
  <AlertDialogContent 
    onDoubleClickOutsideClose={handleClose}
  >
    {/* Dialog content */}
  </AlertDialogContent>
</AlertDialog>
```

## Technical Details

### AlertDialogOverlay Enhancement
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
      className={cn(
        "fixed inset-0 z-50 bg-black/50 ...",
        className
      )}
      onDoubleClick={handleDoubleClick}
      {...props}
      ref={ref}
    />
  );
});
```

### AlertDialogContent Enhancement
```tsx
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    onDoubleClickOutsideClose?: () => void;
  }
>(({ className, onDoubleClickOutsideClose, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay onDoubleClickClose={onDoubleClickOutsideClose} />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn("...", className)}
      {...props}
    />
  </AlertDialogPortal>
));
```

## Best Practices

### ✅ DO
- Always add `onDoubleClickOutsideClose` to all AlertDialog components
- Use the same handler as `onOpenChange` when appropriate
- Include any cleanup logic in the close handler
- Test that double-clicking inside the dialog content does NOT close it

### ❌ DON'T
- Don't use single-click to close (too easy to accidentally trigger)
- Don't forget to add this to new dialogs
- Don't use for critical confirmations without additional safeguards
- Don't prevent the overlay from receiving events

## Migration Checklist

When adding to existing dialogs:

1. ✅ Add `onDoubleClickOutsideClose` prop to `AlertDialogContent`
2. ✅ Pass the close handler function
3. ✅ Test double-click closes the dialog
4. ✅ Test double-click inside dialog does NOT close it
5. ✅ Verify any form state is properly reset on close

## Related Components
- `/components/ui/alert-dialog.tsx` - AlertDialog implementation
- `/components/ui/dialog.tsx` - Regular Dialog (should be updated similarly)

## Files Updated
- `/components/ui/alert-dialog.tsx` - Added double-click functionality
- `/pages/client-portal/profile/ClientPortalProfile.tsx` - Example usage

## User Experience Benefits
- Provides quick way to dismiss dialogs
- Reduces clicks needed for common actions
- Intuitive gesture (double-click = "I'm done")
- Doesn't interfere with single-click interactions
- Works on both desktop and touch devices (with double-tap)

---

**Standard:** Apply this pattern to ALL dialog components throughout the application.
