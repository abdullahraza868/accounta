# Table Pagination and Items Per Page Control - Placement Standard

## Core Principles

### 1. Items Per Page Control Location
**ALWAYS place the items per page selector in the BOTTOM RIGHT of the toolbar**, NOT in the top section.

✅ **CORRECT:**
```tsx
<div className="flex items-center justify-between mb-4 ...">
  {/* Left side: filters, search, etc. */}
  <div className="flex items-center gap-3">
    ...filters...
  </div>
  
  {/* Right side: action buttons AND items per page control */}
  <div className="flex items-center gap-3">
    {/* Items Per Page - MUST be here */}
    <Select
      value={itemsPerPage.toString()}
      onValueChange={(value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-[110px] h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5 / page</SelectItem>
        <SelectItem value="10">10 / page</SelectItem>
        <SelectItem value="25">25 / page</SelectItem>
        <SelectItem value="50">50 / page</SelectItem>
        <SelectItem value="100">100 / page</SelectItem>
      </SelectContent>
    </Select>
    
    {/* View Toggle */}
    <div className="flex items-center gap-1 ...">
      ...view toggle buttons...
    </div>
    
    {/* Settings button */}
    <Button ...>Settings</Button>
  </div>
</div>
```

❌ **INCORRECT:**
- Placing items per page control in top toolbar
- Placing items per page control on left side
- Having items per page control separate from action buttons

### 2. Pagination Placement
**ALWAYS place pagination INSIDE the table's Card container as the last visual row**, NOT below the card.

The pagination should:
- Be placed AFTER `</table>` but BEFORE the closing `</Card>`
- Use `TablePaginationCompact` component for split views
- Use `TablePagination` component for single views (but still inside Card)
- Have a border-top to visually separate it from table content
- Match the table's styling context (purple for outstanding, green for completed)

✅ **CORRECT Structure:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <table className="w-full">
    <thead>
      {/* headers */}
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
  
  {/* Pagination INSIDE Card, AFTER table */}
  <TablePaginationCompact 
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</Card>
```

❌ **INCORRECT Structure:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <table className="w-full">
    <thead>
      {/* headers */}
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
</Card>

{/* Pagination OUTSIDE Card - WRONG! */}
<TablePagination ... />
```

## Components to Use

### For Split Views (Multiple Tables)
Use `TablePaginationCompact`:
- Compact design with just page navigation
- Items per page is controlled globally in toolbar
- Perfect for when you have multiple paginated tables on one view

```tsx
import { TablePaginationCompact } from '../TablePaginationCompact';

<TablePaginationCompact 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### For Single Views (One Table)
Use `TablePagination` but still INSIDE the Card:
- Includes items per page selector in the pagination row
- More comprehensive pagination controls

```tsx
import { TablePagination } from '../TablePagination';

<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

## Visual Benefits

### Why Items Per Page Goes on Bottom Right
1. **Consistency** - Same location across all tables
2. **Grouping** - Keeps view controls together (items per page, view toggle, settings)
3. **Natural Flow** - Users look to bottom for pagination, having items per page nearby makes sense
4. **Space Efficiency** - Doesn't clutter the filter/search area on the left

### Why Pagination Goes Inside Card
1. **Visual Containment** - Pagination feels part of the table, not separate
2. **Cleaner Layout** - No orphaned elements below cards
3. **Better Hierarchy** - Clear that pagination controls THIS table
4. **Consistent Spacing** - No need to manage gap between card and external pagination
5. **Mobile Responsive** - Keeps pagination with its table when scrolling

## Real-World Examples

### Signatures Split View ✅
- Items per page: Bottom right toolbar with view toggle
- Pagination: Inside Card using TablePaginationCompact
- Each table (Active and Completed) has its own pagination inside

### Billing Split View ✅ (Paid section)
- Items per page: Bottom right toolbar  
- Pagination: Inside Card using TablePaginationCompact
- Green-themed pagination matches green card styling

### What Needs Fixing ❌
- Billing Single View: Pagination currently OUTSIDE card
- Billing Split View Outstanding: Pagination currently OUTSIDE card

## Implementation Checklist

When creating or updating a table view:

- [ ] Items per page control is in bottom right of toolbar
- [ ] Items per page control is grouped with view toggle and settings
- [ ] Items per page selector uses: `className="w-[110px] h-7 text-xs"`
- [ ] Items per page options: 5, 10, 25, 50, 100
- [ ] Pagination is placed AFTER `</table>` but BEFORE `</Card>`
- [ ] Using correct pagination component (Compact for split, regular for single)
- [ ] Pagination has border-top for visual separation
- [ ] Pagination styling matches table context (purple/green/neutral)
- [ ] No orphaned pagination elements below cards

## Key Takeaway

**The pagination is part of the table, not separate from it. It should visually appear as the last row of the table by being inside the Card container.**

This creates a cohesive, professional appearance and ensures consistent UX across all table views in the application.
