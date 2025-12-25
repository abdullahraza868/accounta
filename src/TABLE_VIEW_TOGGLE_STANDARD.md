# Table View Toggle Standard

## Overview
Standard pattern for Single View / Split View toggle buttons that appear above tables.

## Placement
The view toggle should be placed **above the table** in a small section that includes:
- Left side: Table title with count badge
- Right side: View toggle buttons (and optional settings)

## Standard Implementation

```tsx
{/* Table Section - Above the actual table */}
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <h3 className="text-gray-900 dark:text-gray-100">Signature Requests</h3>
    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
      {totalCount}
    </Badge>
  </div>
  
  {/* View Toggle & Settings */}
  <div className="flex items-center gap-3">
    {/* View Toggle */}
    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
      <Button
        size="sm"
        className={cn(
          "gap-1.5 h-7 px-3 text-xs text-white"
        )}
        style={{ backgroundColor: 'var(--primaryColor)' }}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Single View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 h-7 px-3 text-xs",
          "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        )}
        onClick={() => {
          localStorage.setItem('viewPreference', 'split');
          navigate('/path/split');
        }}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Split View
      </Button>
    </div>
  </div>
</div>
```

## Key Features

### Container
- Grouped toggle buttons in a container with:
  - Border: `border border-gray-200 dark:border-gray-700`
  - Background: `bg-gray-50 dark:bg-gray-800/50`
  - Rounded corners: `rounded-lg`
  - Padding: `p-1`

### Active Button (Selected View)
- Solid background using primary color: `style={{ backgroundColor: 'var(--primaryColor)' }}`
- White text: `text-white`
- Button size: `h-7 px-3`
- Text size: `text-xs`
- Icon size: `w-3.5 h-3.5`
- Gap between icon and text: `gap-1.5`

### Inactive Button (Unselected View)
- Ghost variant: `variant="ghost"`
- Gray text: `text-gray-600 dark:text-gray-400`
- Hover effect: `hover:text-gray-900 dark:hover:text-gray-100`
- Same sizing as active button

### Icon
Use `LayoutGrid` from lucide-react for view toggles:
```tsx
import { LayoutGrid } from 'lucide-react';
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Table Title                          [Single][Split] ⚙️  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                   Table Header                       │ │
│ │─────────────────────────────────────────────────────│ │
│ │                   Table Content                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Spacing
- Margin below toggle section: `mb-3` (12px)
- Gap between toggle and settings: `gap-3`
- Gap between buttons in toggle: `gap-1`

## Reference Implementation
See `/components/views/SignaturesView.tsx` lines 1052-1091

## Checklist
- [ ] Toggle placed above table (not in header)
- [ ] Active button uses primaryColor background
- [ ] Inactive button uses ghost variant
- [ ] LayoutGrid icon used for both buttons
- [ ] Container has border and background
- [ ] Proper spacing and sizing applied
