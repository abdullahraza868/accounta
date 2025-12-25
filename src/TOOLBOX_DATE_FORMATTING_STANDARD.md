# Toolbox: Date Formatting Standard

## ⭐ CRITICAL STANDARD - ALWAYS FOLLOW

**Every date displayed in the application MUST use the centralized date formatting system from AppSettingsContext.**

This is a **mandatory, committed memory standard** that applies to ALL dates throughout the entire application.

---

## Overview

The application has a centralized date formatting system that:
- Respects user's date format preferences (MM-DD-YYYY, DD-MM-YYYY, YYYY-MM-DD)
- Respects user's time format preferences (12-hour vs 24-hour)
- Ensures consistency across all pages
- Makes it easy to change formats globally

---

## The Rule

### ✅ ALWAYS DO THIS:

```tsx
import { useAppSettings } from '../contexts/AppSettingsContext';

function MyComponent() {
  const { formatDate, formatDateTime, formatTime } = useAppSettings();
  
  return (
    <div>
      {/* For dates only */}
      <div>{formatDate(myDateString)}</div>
      
      {/* For dates with time */}
      <div>{formatDateTime(myDateTimeString)}</div>
      
      {/* For time only */}
      <div>{formatTime(myTimeString)}</div>
    </div>
  );
}
```

### ❌ NEVER DO THIS:

```tsx
// ❌ DON'T hardcode date formats
<div>{myDate}</div>
<div>{new Date(myDate).toLocaleDateString()}</div>
<div>{moment(myDate).format('MM/DD/YYYY')}</div>

// ❌ DON'T create your own formatting functions
const formatMyDate = (date) => {
  return new Date(date).toLocaleDateString('en-US');
};
```

---

## Available Formatting Functions

### 1. `formatDate(dateString)`
Formats a date without time.

```tsx
const { formatDate } = useAppSettings();

// Input: "2025-11-01" or ISO date string
// Output: "11-01-2025" (based on user's preference)
<div>{formatDate(user.birthDate)}</div>
```

### 2. `formatDateTime(dateTimeString)`
Formats a date with time on two lines (for table cells).

```tsx
const { formatDateTime } = useAppSettings();

// Input: "2025-11-01T14:30:00Z"
// Output: Multi-line display
//   11-01-2025
//   2:30 PM
<div>{formatDateTime(document.createdAt)}</div>
```

### 3. `formatTime(timeString)`
Formats time only.

```tsx
const { formatTime } = useAppSettings();

// Input: "14:30:00" or ISO time string
// Output: "2:30 PM" (based on user's preference)
<div>{formatTime(meeting.startTime)}</div>
```

---

## Special Cases

### Badges with Dates

When displaying dates in badges or special UI elements, still use the formatting function:

```tsx
const formatExpiryDate = (date: string | null) => {
  if (!date) {
    return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
      Unlimited
    </Badge>;
  }
  
  const expiry = new Date(date);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
      Expired
    </Badge>;
  } else if (daysUntilExpiry <= 7) {
    return <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
      {daysUntilExpiry}d left
    </Badge>;
  } else if (daysUntilExpiry <= 30) {
    // ✅ Use formatDate for the actual date display
    return (
      <span className="text-sm font-medium text-amber-600">
        {formatDate(date)}
      </span>
    );
  } else {
    // ✅ Use formatDate for the actual date display
    return (
      <span className="text-sm" style={{ color: branding.colors.bodyText }}>
        {formatDate(date)}
      </span>
    );
  }
};
```

### Table Components

For table cells, use the dedicated DateTimeDisplay and DateDisplay components:

```tsx
import { DateTimeDisplay, DateDisplay } from '../DateTimeDisplay';

// For date + time columns
<td className="p-3 w-[160px]">
  <DateTimeDisplay date={record.createdAt} />
</td>

// For date-only columns
<td className="p-3 w-[140px]">
  <DateDisplay date={record.dueDate} />
</td>
```

These components internally use the formatDate/formatDateTime functions from AppSettingsContext.

---

## Common Patterns

### 1. Displaying a Due Date

```tsx
const { formatDate } = useAppSettings();

<div className="flex items-center gap-2">
  <Calendar className="w-4 h-4" />
  <span>Due: {formatDate(invoice.dueDate)}</span>
</div>
```

### 2. Displaying Created/Updated Timestamps

```tsx
const { formatDateTime } = useAppSettings();

<div className="text-sm text-gray-500">
  Created: {formatDateTime(document.createdAt)}
</div>
```

### 3. Displaying a Time Range

```tsx
const { formatTime } = useAppSettings();

<div>
  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
</div>
```

### 4. Conditional Date Display

```tsx
const { formatDate } = useAppSettings();

<div>
  {user.accessExpires 
    ? `Expires: ${formatDate(user.accessExpires)}` 
    : 'Never expires'
  }
</div>
```

---

## Examples from the Codebase

### ✅ Client Portal Account Access
```tsx
// /pages/client-portal/account-access/ClientPortalAccountAccess.tsx

const { formatDate } = useAppSettings();

const formatExpiryDate = (date: string | null) => {
  if (!date) return <Badge>Unlimited</Badge>;
  
  // ... logic for determining urgency ...
  
  // When displaying the actual date:
  return (
    <span className="text-sm" style={{ color: branding.colors.bodyText }}>
      {formatDate(date)}  {/* ✅ Using formatDate */}
    </span>
  );
};
```

### ✅ Add User Page
```tsx
// /pages/client-portal/account-access/AddUser.tsx

const { formatDate } = useAppSettings();

{accessPreset === 'custom' && accessDate && (
  <div className="p-3 rounded-lg" style={{ background: `${branding.colors.primaryButton}10` }}>
    <p className="text-sm" style={{ color: branding.colors.bodyText }}>
      Access expires on: <strong>{formatDate(accessDate)}</strong>
    </p>
  </div>
)}
```

---

## Why This Standard Exists

1. **User Preferences**: Different users prefer different date formats (US: MM-DD-YYYY, Europe: DD-MM-YYYY, ISO: YYYY-MM-DD)
2. **Consistency**: All dates look the same across the entire application
3. **Maintainability**: Change the format once in settings, updates everywhere
4. **Internationalization**: Easy to add new locale support
5. **Time Zones**: Centralized handling of timezone conversions (future feature)

---

## Checking for Violations

To find dates that aren't using the standard:

```bash
# Search for hardcoded date formatting
grep -r "toLocaleDateString" src/
grep -r "toLocaleString" src/
grep -r ".format(" src/ | grep -i date
grep -r "new Date(" src/ | grep -v "formatDate"
```

---

## The AppSettingsContext

Location: `/contexts/AppSettingsContext.tsx`

This context provides:
- `formatDate(date)` - Format date only
- `formatDateTime(dateTime)` - Format date with time
- `formatTime(time)` - Format time only
- User's date format preference
- User's time format preference (12h vs 24h)

---

## Table Integration

All tables MUST use either:
1. The formatting functions directly (for special displays)
2. The `DateTimeDisplay` or `DateDisplay` components (for standard table cells)

See `/TABLE_DATE_TIME_FORMAT_STANDARD.md` for table-specific guidance.

---

## Enforcement Checklist

When reviewing or creating code with dates:

- [ ] Import `useAppSettings` hook
- [ ] Destructure `formatDate`, `formatDateTime`, or `formatTime`
- [ ] Use the appropriate function for all date displays
- [ ] Remove any hardcoded date formatting
- [ ] Remove any custom date formatting functions
- [ ] Test with different date format settings

---

## Related Documentation

- `/TABLE_DATE_TIME_FORMAT_STANDARD.md` - Table-specific date formatting
- `/contexts/AppSettingsContext.tsx` - Implementation details
- `/components/DateTimeDisplay.tsx` - Table components

---

## Real-World Example: Account Access Expiry Dates

### Before (❌ Wrong):
```tsx
const formatExpiryDate = (date: string | null) => {
  // ... logic ...
  return (
    <span className="text-sm">
      {date}  {/* ❌ Raw date string */}
    </span>
  );
};
```

### After (✅ Correct):
```tsx
const { formatDate } = useAppSettings();

const formatExpiryDate = (date: string | null) => {
  // ... logic ...
  return (
    <span className="text-sm">
      {formatDate(date)}  {/* ✅ Formatted using user's preference */}
    </span>
  );
};
```

---

## Summary

🎯 **The Golden Rule**: Every date in the application goes through `formatDate()`, `formatDateTime()`, or `formatTime()` from `useAppSettings()`.

**No exceptions. This is committed to memory and automatically applied to all code.**

---

**Last Updated**: November 1, 2025
