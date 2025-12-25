# Dialog onOpenChange Error Fix

## Issue
TypeError: onOpenChange is not a function

## Root Cause
The `onOpenChange` handlers in AlertDialog components were using inline arrow functions with conditional logic that could return `undefined` or `false` instead of always being a proper function.

**Problematic Pattern:**
```tsx
onOpenChange={(open) => !open && setRenewAccessDialog({ open: false, userId: null })}
```

This pattern returns `false` when `open` is `true`, which causes the error.

## Solution
Changed all AlertDialog `onOpenChange` handlers to use proper function bodies with explicit `if` statements:

**Fixed Pattern:**
```tsx
onOpenChange={(open) => {
  if (!open) {
    setRenewAccessDialog({ open: false, userId: null, selectedDays: null });
  }
}}
```

## Files Fixed

### `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`

**1. Reset Password Dialog:**
```tsx
<AlertDialog 
  open={resetPasswordDialog.open} 
  onOpenChange={(open) => {
    if (!open) {
      setResetPasswordDialog({ open: false, userId: null });
    }
  }}
>
```

**2. Generated Password Dialog:**
```tsx
<AlertDialog 
  open={generatedPasswordDialog.open} 
  onOpenChange={(open) => {
    if (!open) {
      setGeneratedPasswordDialog({ open: false, userId: null, password: '', userEmail: '' });
    }
  }}
>
```

**3. Renew Access Dialog:**
```tsx
<AlertDialog 
  open={renewAccessDialog.open} 
  onOpenChange={(open) => {
    if (!open) {
      setRenewAccessDialog({ open: false, userId: null, selectedDays: null });
    }
  }}
>
```

## Key Points

1. **Always use function body:** Don't rely on short-circuit evaluation (`&&`) in onOpenChange
2. **Explicit conditionals:** Use `if` statements to make the logic clear
3. **Complete state:** Always include all required state properties when resetting dialog state
4. **Type safety:** This pattern ensures the handler always returns `undefined` (valid) not `false`

## Why This Matters

The `onOpenChange` prop expects a function that returns `void`. When using `!open && setState(...)`, if `open` is `true`, the expression evaluates to `false`, which violates the expected type and causes runtime errors.

## Standard Pattern for All Dialogs

Use this pattern for all AlertDialog, Dialog, and similar components:

```tsx
<AlertDialog
  open={dialogState.open}
  onOpenChange={(open) => {
    if (!open) {
      // Reset state here
      setDialogState({ open: false, ...otherProps });
    }
  }}
>
```

## Prevention

- Always check dialog `onOpenChange` handlers during code review
- Use explicit function bodies for event handlers
- Test dialog open/close behavior thoroughly
