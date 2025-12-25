# Design Palette: Table Styling Standards

## Overview
This document defines the standard table styling used throughout the Acounta application.

## Table Structure

### Card Container
```tsx
<Card className="border shadow-sm overflow-hidden rounded-xl" style={{ borderColor: branding.colors.borderColor }}>
```

**Key Points:**
- `overflow-hidden` - Required to properly clip rounded corners
- `rounded-xl` - Standard border radius for card containers
- Border color uses branding system

### Table Element
```tsx
<table className="w-full min-w-[1200px]">
```

**Key Points:**
- `w-full` - Full width within container
- `min-w-[1200px]` - Minimum width for horizontal scrolling on small screens

### Table Header
```tsx
<thead>
  <tr style={{ backgroundColor: 'var(--primaryColor)' }} className="rounded-t-xl">
    <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
      Column Name
    </th>
  </tr>
</thead>
```

**Key Points:**
- Background uses CSS variable `--primaryColor` from branding system
- `rounded-t-xl` class on `<tr>` - Rounds top corners of header
- Text color: `text-white/90` for slight transparency
- Text styling: `text-xs uppercase tracking-wide` for professional look
- Padding: `px-4 py-4` for consistent spacing

### Table Body
```tsx
<tbody className="divide-y" style={{ borderColor: branding.colors.borderColor }}>
  <tr style={{ background: branding.colors.cardBackground }}>
    <td className="px-4 py-4">
      Cell Content
    </td>
  </tr>
</tbody>
```

**Key Points:**
- `divide-y` - Adds horizontal divider between rows
- Border and background colors use branding system
- Consistent padding: `px-4 py-4`

## Visual Standards

### Rounded Corners
- **Card Container**: `rounded-xl` (0.75rem / 12px)
- **Table Header**: First row gets `rounded-t-xl` to match card corners
- **Important**: Must use `overflow-hidden` on card to properly clip

### Colors
- **Header Background**: `var(--primaryColor)` - Purple gradient from branding
- **Header Text**: `text-white/90` - White with 90% opacity
- **Row Background**: `branding.colors.cardBackground` - White/dark theme aware
- **Borders**: `branding.colors.borderColor` - Gray borders, theme-aware

### Typography
- **Header Text**: `text-xs uppercase tracking-wide` - Small, uppercase, letter-spaced
- **Body Text**: Use default styling or apply `text-sm` for smaller text

## Complete Example

```tsx
<Card className="border shadow-sm overflow-hidden rounded-xl" style={{ borderColor: branding.colors.borderColor }}>
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1200px]">
      <thead>
        <tr style={{ backgroundColor: 'var(--primaryColor)' }} className="rounded-t-xl">
          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
            Name
          </th>
          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
            Status
          </th>
          <th className="px-4 py-4 text-right text-xs uppercase tracking-wide text-white/90">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y" style={{ borderColor: branding.colors.borderColor }}>
        <tr style={{ background: branding.colors.cardBackground }}>
          <td className="px-4 py-4">John Smith</td>
          <td className="px-4 py-4">Active</td>
          <td className="px-4 py-4 text-right">
            <Button>Edit</Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</Card>
```

## Usage Notes

1. **Always** wrap tables in a Card component
2. **Always** add `overflow-hidden` to the Card
3. **Always** use `rounded-xl` on Card and `rounded-t-xl` on first header row
4. **Always** use CSS variables or branding context for colors
5. **Never** hardcode purple colors - use `var(--primaryColor)`

## Files Using This Standard

- `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx` - Account Access table
- All other data tables throughout the application should follow this standard

## Related Documents

- `/DESIGN_SYSTEM_REFERENCE.md` - Overall design system
- `/TABLE_STANDARDS_MASTER_CHECKLIST.md` - Table functionality standards
- `/COLOR_CENTRALIZATION_TRACKING.md` - Branding color system
