# Filter Button Styling Standard

## Overview
This document defines the standard styling for filter buttons throughout the application. This pattern is currently used on the **Billing** and **Signatures** pages and should be applied consistently to all future filter implementations.

## Visual Grouping Pattern

### Container Styling
Filter buttons should be visually grouped using a **gray background container** with rounded corners:

```tsx
<div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
  {/* Filter buttons go here */}
</div>
```

### Individual Button Styling

Each filter button follows this pattern:

```tsx
<button
  onClick={() => handleFilter('value')}
  className={cn(
    "px-3 py-1.5 rounded text-xs transition-colors",
    isActive
      ? "text-white shadow-sm"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
  )}
  style={isActive ? { backgroundColor: 'var(--primaryColor)' } : {}}
>
  Filter Label
</button>
```

## Key Features

1. **Group Container**:
   - Background: `bg-gray-100 dark:bg-gray-800`
   - Border radius: `rounded-lg`
   - Padding: `p-1`
   - Gap between buttons: `gap-2`

2. **Active State**:
   - Text color: `text-white`
   - Background: `var(--primaryColor)` (uses platform branding)
   - Shadow: `shadow-sm`

3. **Inactive State**:
   - Text color: `text-gray-600 dark:text-gray-400`
   - Hover text: `hover:text-gray-900 dark:hover:text-gray-200`
   - No background color

4. **Button Sizing**:
   - Padding: `px-3 py-1.5`
   - Text size: `text-xs`
   - Border radius: `rounded`

5. **Transitions**:
   - All state changes use: `transition-colors`

## Current Implementation Examples

### Billing Page
- **Header Area**: Invoices/Subscriptions switcher (moved from toolbar to header for consistency)
- **Toolbar Area**: Date filters (All Dates, Today, This Week, This Month, This Year)

### Signatures Page
- **Client Type Filter**: All, Individual (with icon), Business (with icon)
- **Document Name Filter**: All, 2024 Tax Return, Form 8879

## Layout Standards

### Placement Rules
1. **Page Header**: Non-filter toggles (like Invoices/Subscriptions) should be in the header area next to the page title
2. **Toolbar**: Filter buttons go in the toolbar area on the LEFT side
3. **Action Buttons**: Always on the RIGHT side of the toolbar (Add, Bulk Send, Settings, etc.)

### Toolbar Structure
```tsx
<div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
  {/* LEFT SIDE - Filters */}
  <div className="flex items-center gap-4 flex-1">
    <SearchInput />
    <FilterGroup1 />
    <FilterGroup2 />
  </div>

  {/* RIGHT SIDE - Actions */}
  <div className="flex gap-2">
    <ActionButton1 />
    <ActionButton2 />
  </div>
</div>
```

## Usage Notes

- ✅ **DO**: Use this pattern for all date filters, type filters, and status toggles
- ✅ **DO**: Group related filters together in their own container
- ✅ **DO**: Use `var(--primaryColor)` for active state to respect platform branding
- ✅ **DO**: Include dark mode classes for all states
- ❌ **DON'T**: Use this pattern for action buttons (Add, Delete, etc.)
- ❌ **DON'T**: Mix filter buttons and action buttons in the same visual group

## Accessibility

- All buttons should have clear, descriptive labels
- Active state should be visually distinct (color + shadow)
- Hover states should provide clear feedback
- Dark mode must be fully supported

## Related Standards

- See `/STANDARD_PAGE_LAYOUT_PATTERN.md` for overall page layout standards
- See `/TABLE_TOOLBAR_LAYOUT_STANDARD.md` for complete toolbar patterns
- See `/DESIGN_SYSTEM_REFERENCE.md` for universal design patterns
