# Standard Page Layout Pattern

This document defines the "normal" styling pattern based on the Signatures page. ALL future pages must follow this pattern.

## Container Structure

```tsx
<div className="flex flex-col h-full overflow-hidden">
  <div className="flex-1 overflow-y-auto p-6">
    {/* All content here */}
  </div>
</div>
```

## Spacing Standards

### Header
- **Margin bottom**: `mb-6`
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-gray-900 dark:text-gray-100">Page Title</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      Description or count
    </p>
  </div>
</div>
```

### Stats Cards
- **Margin bottom**: `mb-6`
```tsx
<div className="grid grid-cols-5 gap-4 mb-6">
  {/* Cards here */}
</div>
```

### Toolbar
- **Margin bottom**: `mb-4`
- **Padding bottom**: `pb-4`
- **Border bottom**: `border-b border-gray-200 dark:border-gray-700`
```tsx
<div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
  {/* Toolbar content */}
</div>
```

### Table Section Header
- **Margin bottom**: `mb-6`
```tsx
<div className="flex items-center justify-between mb-6">
  {/* Table title and view toggle */}
</div>
```

## Stat Card Styling (DraggableStatCard)

### Card Container
```tsx
<Card className={cn(
  "p-4 pl-8 border-gray-200/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-move",
  isActive && "ring-2 ring-purple-100"
)}
style={isActive ? { borderColor: config.color } : {}}>
```

**Key properties:**
- Padding: `p-4 pl-8` (NOT p-3.5 pl-8)
- Border: `border-gray-200/60 dark:border-gray-700`
- Shadow: `shadow-sm hover:shadow-md` (NOT hover:shadow-lg)
- Transition: `transition-all` (NOT transition-shadow)
- Active state: `ring-2 ring-purple-100` (NOT just ring-2)

### Icon Container
```tsx
<div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
     style={{ backgroundColor: config.bgColor }}>
  {config.icon}
</div>
```

**Key properties:**
- Size: `w-10 h-10` (NOT w-9 h-9)

## Filter Button Grouping

Filters MUST be visually grouped with a shared background container:

```tsx
<div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
  <button
    className={cn(
      "px-3 py-1.5 rounded text-xs transition-colors",
      isActive 
        ? "text-white shadow-sm" 
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
    )}
    style={isActive ? { backgroundColor: 'var(--primaryColor)' } : {}}
  >
    Option 1
  </button>
  <button className={/* same pattern */}>
    Option 2
  </button>
</div>
```

### Example Groupings
1. **Document Type Filter**: "All Docs", "8879", "Other" → grouped together
2. **Client Type Filter**: "All", "Individual", "Business" → grouped together
3. **Date Filter**: "All Dates", "Today", "This Week", "This Month", "This Year" → grouped together

**NEVER use separate individual buttons for related filters**

## Toolbar Layout

### Left Side
```tsx
<div className="flex items-center gap-4 flex-1">
  {/* Search Input */}
  <div className="relative max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
    <Input
      type="text"
      placeholder="Search..."
      className="pl-9 border-gray-300 dark:border-gray-600"
    />
  </div>
  
  {/* Filter Group 1 */}
  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
    {/* Buttons */}
  </div>
  
  {/* Filter Group 2 */}
  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
    {/* Buttons */}
  </div>
  
  {/* Clear filters (if needed) */}
  {hasFilters && (
    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline">
      Clear filters
    </button>
  )}
</div>
```

### Right Side
```tsx
<div className="flex gap-2">
  {/* Action buttons */}
</div>
```

## Search Input Styling

```tsx
<div className="relative max-w-md">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
  <Input
    type="text"
    placeholder="Search..."
    className="pl-9 border-gray-300 dark:border-gray-600"
  />
</div>
```

**Key properties:**
- Max width: `max-w-md` (for search inputs)
- Icon size: `w-4 h-4`
- Padding left: `pl-9`

## View Toggle

```tsx
<div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
  <Button
    size="sm"
    className="gap-1.5 h-7 px-3 text-xs text-white"
    style={{ backgroundColor: 'var(--primaryColor)' }}
  >
    <LayoutGrid className="w-3.5 h-3.5" />
    Single View
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="gap-1.5 h-7 px-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
  >
    <LayoutGrid className="w-3.5 h-3.5" />
    Split View
  </Button>
</div>
```

## Gap Sizing Between Elements

- Search to filter group: `gap-4`
- Between filter groups: `gap-4`
- Between buttons in toolbar: `gap-2`
- Between buttons in filter group: `gap-2` (handled by parent)

## Summary of Key Changes from Previous Pattern

1. ✅ Container uses `flex flex-col h-full overflow-hidden` with inner scrollable div
2. ✅ Header spacing: `mb-6` (not pb-6)
3. ✅ Stats cards: `mb-6`
4. ✅ Toolbar: `mb-4 pb-4 border-b` (not just py-4)
5. ✅ Table section: `mb-6`
6. ✅ Card padding: `p-4 pl-8` (not p-3.5)
7. ✅ Icon container: `w-10 h-10` (not w-9 h-9)
8. ✅ Card hover: `hover:shadow-md` (not hover:shadow-lg)
9. ✅ Filters: grouped with `bg-gray-100 dark:bg-gray-800 rounded-lg p-1`
10. ✅ Filter buttons: `rounded text-xs` (not rounded-md)
11. ✅ Search gap to filters: `gap-4` (not gap-3)

## This Is The Standard

The Signatures page (SignaturesView.tsx) is the reference implementation. When in doubt, check that file.
