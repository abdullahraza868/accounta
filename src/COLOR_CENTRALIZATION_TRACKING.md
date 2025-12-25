# Color Centralization Tracking

## Overview
This document tracks all color usages throughout the application that need to be centralized into the Platform Branding system for consistent theming.

## Current Centralized System
- **BrandingContext** (`/contexts/BrandingContext.tsx`) - Manages platform-wide branding colors
- **CSS Variables** (`/styles/globals.css`) - Defines color tokens like `--primaryColor`, `--secondaryColor`, etc.
- All components should use these variables instead of hardcoded values

## Components with Hardcoded Colors (TO BE CENTRALIZED)

### 1. SignatureTab - Resend Confirmation Dialog
**Location**: `/components/folder-tabs/SignatureTab.tsx`
**Issue**: AlertDialog confirmation for resending signatures uses default Alert Dialog styling
**Current Colors**: 
- Uses default AlertDialog/AlertDialogAction component styling
- Action button currently styled with `style={{ backgroundColor: 'var(--primaryColor)' }}`
- Cancel button uses default styling

**Needed**: 
- Ensure all AlertDialog elements use branding colors consistently
- AlertDialogCancel should respect branding colors
- Background, borders, text colors should all reference CSS variables

**Priority**: Medium
**Status**: Tracked for future centralization

---

### 2. Status Badges Throughout Application
**Location**: Multiple components
**Issue**: Status badges (completed, pending, partial, etc.) use hardcoded colors like:
- Green (`bg-green-50`, `text-green-700`, etc.) for completed
- Yellow (`bg-yellow-50`, `text-yellow-700`, etc.) for partial/warning
- Blue (`bg-blue-50`, `text-blue-700`, etc.) for sent/info
- Orange (`bg-orange-50`, `text-orange-700`, etc.) for overdue/alert

**Needed**:
- Define semantic color tokens (e.g., `--successColor`, `--warningColor`, `--infoColor`, `--dangerColor`)
- Update all badge components to use these tokens
- Ensure dark mode variants are also centralized

**Priority**: Low (semantic colors are generally standard)
**Status**: Consider for future enhancement

---

### 3. Date Formatting Integration
**Location**: ALL pages/components that display dates
**Current Status**: ✅ Now using `formatDate()` and `formatDateTime()` from `AppSettingsContext`
**Reminder**: Always check for and integrate date formatting from context on every page

---

## Implementation Guidelines

When centralizing colors:
1. ✅ **Use CSS Variables**: Reference colors from `--primaryColor`, `--secondaryColor`, etc.
2. ✅ **Check Dark Mode**: Ensure colors work in both light and dark modes
3. ✅ **Update Component Styles**: Replace hardcoded Tailwind color classes with `style` props or create utility classes
4. ✅ **Test Branding Changes**: Verify colors update when Platform Branding settings change
5. ✅ **Document Changes**: Update this file when colors are centralized

## Future Enhancements

### Proposed New Color Tokens
```css
/* Semantic Status Colors */
--successColor: #16a34a;
--successColorLight: #dcfce7;
--successColorDark: #15803d;

--warningColor: #ca8a04;
--warningColorLight: #fef9c3;
--warningColorDark: #a16207;

--infoColor: #2563eb;
--infoColorLight: #dbeafe;
--infoColorDark: #1e40af;

--dangerColor: #dc2626;
--dangerColorLight: #fee2e2;
--dangerColorDark: #b91c1c;
```

### Components to Monitor
- All Dialog components (AlertDialog, Dialog, Sheet, etc.)
- All Badge components
- All Button variants
- All form components
- All status indicators
- All notification/toast components

## Notes
- This is an ongoing effort to ensure complete design system consistency
- New components should always use centralized colors from the start
- Regular audits should be performed to catch hardcoded colors

---

**Last Updated**: Current session
**Maintained By**: Development Team
