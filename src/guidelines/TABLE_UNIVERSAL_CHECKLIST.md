# Table Universal Checklist

This checklist ensures all tables maintain consistency across the application. Reference this EVERY time you create or modify a table.

## ✅ Mandatory Table Standards

### 1. Pagination Placement & Styling
- [ ] Pagination is placed **inside the Card** component, after `</table>`
- [ ] For single view tables: Use `<TablePagination>` component
- [ ] For split view tables: Use `<TablePaginationCompact>` component
- [ ] TablePagination has: `px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30`
- [ ] TablePaginationCompact has: `px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50`
- [ ] **Never add custom padding/margin** - use standard from `/lib/tableConfig.ts`

### 2. Column Sorting
- [ ] All sortable columns have sort icons (ArrowUpDown, ArrowUp, ArrowDown from lucide-react)
- [ ] Sort state tracked with `sortColumn` and `sortDirection`
- [ ] Header cells are clickable buttons with `handleSort(columnName)` function
- [ ] Sorted data array is used for pagination (not filtered array directly)
- [ ] Sort icons styled with: `w-3.5 h-3.5 ml-1` and primary color when active

### 3. Header Styling
- [ ] Header row uses: `style={{ backgroundColor: 'var(--primaryColor)' }}`
- [ ] Header cells: `text-white/90 text-xs uppercase tracking-wide`
- [ ] Header padding: `px-4 py-4` (first column: `px-6 py-4 pl-10`)
- [ ] Sortable headers wrapped in `<button>` with `flex items-center hover:text-white transition-colors`

### 4. Table Body Styling
- [ ] tbody: `bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700`
- [ ] tr: `hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`
- [ ] td padding: `px-4 py-4` (first column: `px-6 py-4 pl-10`, actions: `px-4 py-4 pr-8`)

### 5. Filters & Toolbar
- [ ] Toolbar layout: Search/filters on left, action buttons on right
- [ ] Filter button groups use branded background styling from `/lib/tableConfig.ts`
- [ ] Active filter uses: `style={{ backgroundColor: 'var(--primaryColor)' }}` and `text-white`
- [ ] "Clear filters" button shows when any filter is active
- [ ] All filters reset to defaults when cleared

### 6. Action Buttons Alignment
- [ ] Action column: Fixed width container `w-[72px] ml-auto`
- [ ] Actions: `flex justify-end items-center gap-1`
- [ ] Buttons: `h-8 w-8 p-0` with consistent spacing

### 7. Client Cell Display
- [ ] Use `<ClientCellDisplay>` component for client names
- [ ] Includes avatar, name, and type badge
- [ ] Consistent across all tables

### 8. Date/Time Display
- [ ] Use `<DateDisplayWithTooltip>` for dates
- [ ] Use `<DateTimeDisplay>` for date with time on second line
- [ ] All dates use `formatDate()` from AppSettingsContext
- [ ] Format: MM-DD-YYYY with time on second line when applicable

### 9. Status Badges
- [ ] Follow universal status badge pattern from Design System Reference
- [ ] Colors: Green (success), Red (error/overdue), Blue (info), Gray (neutral), Orange (warning)
- [ ] Include icons where applicable

### 10. View Toggle (Dual View Systems)
- [ ] Single/Split view toggle buttons in header
- [ ] View preference saved to localStorage
- [ ] Redirect on mount if preference doesn't match current view
- [ ] **ALL changes must be synced between both views**

## 🔧 Configuration Reference

All table styling should reference: `/lib/tableConfig.ts`

Import and use standardized configurations:
```tsx
import { TABLE_PAGINATION, TABLE_HEADER, TABLE_BODY, getTableClasses } from '@/lib/tableConfig';

const classes = getTableClasses();
```

## 📋 Common Sortable Columns

Always add sorting to these columns (when present):
- [ ] Client Name
- [ ] Invoice/Document Number
- [ ] Created Date
- [ ] Sent Date
- [ ] Due Date
- [ ] Paid Date
- [ ] Amount
- [ ] Status
- [ ] Year
- [ ] Payment Method

## 🚫 Never Do This

- ❌ Add pagination outside the Card component
- ❌ Use hardcoded purple colors (use `var(--primaryColor)`)
- ❌ Forget dark mode classes
- ❌ Skip sorting on tables with multiple rows
- ❌ Override pagination padding without updating `/lib/tableConfig.ts`
- ❌ Create custom table components without referencing standards
- ❌ Make changes to one view without updating the paired view (in dual view systems)

## ✨ Always Do This

- ✅ Use TablePagination component with no modifications
- ✅ Use TablePaginationCompact for split views
- ✅ Reference `/lib/tableConfig.ts` for all table styling
- ✅ Test both light and dark modes
- ✅ Test pagination with different item counts
- ✅ Ensure mobile responsiveness
- ✅ Apply changes to BOTH views in dual view systems (Billing, Signatures, etc.)

## 📝 Quick Copy-Paste Templates

### Standard Table Structure
```tsx
<Card className="border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden rounded-lg">
  <table className="w-full">
    <thead>
      <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
        <th className="px-6 py-4 pl-10 text-left text-xs uppercase tracking-wide text-white/90">
          <button onClick={() => handleSort('name')} className="flex items-center hover:text-white transition-colors">
            Name{getSortIcon('name')}
          </button>
        </th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
      {items.map(item => (
        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <td className="px-6 py-4 pl-10">{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
  
  <TablePagination
    currentPage={currentPage}
    itemsPerPage={itemsPerPage}
    totalItems={sortedItems.length}
    onPageChange={setCurrentPage}
    onItemsPerPageChange={setItemsPerPage}
  />
</Card>
```

### Sort Implementation
```tsx
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

const getSortIcon = (column: string) => {
  if (sortColumn !== column) {
    return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400" />;
  }
  return sortDirection === 'asc' 
    ? <ArrowUp className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--primaryColor)' }} />
    : <ArrowDown className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--primaryColor)' }} />;
};

const sortedItems = [...filteredItems].sort((a, b) => {
  if (!sortColumn) return 0;
  
  const aValue = a[sortColumn];
  const bValue = b[sortColumn];
  
  if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
  if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
  return 0;
});
```

## 🔄 When Making Table Changes

1. Check if table has a dual view (Single/Split) - if yes, update BOTH
2. Reference `/lib/tableConfig.ts` for styling values
3. Test pagination appears correctly inside Card with proper spacing
4. Verify sorting works on all applicable columns
5. Test in both light and dark mode
6. Verify mobile responsiveness
7. Update this checklist if adding new standards

---

**Last Updated:** After pagination spacing standardization
**Related Files:** 
- `/lib/tableConfig.ts` - Universal table configuration
- `/components/TablePagination.tsx` - Standard pagination
- `/components/TablePaginationCompact.tsx` - Compact pagination for split views
- `/guidelines/TABLE_PAGINATION_PLACEMENT_STANDARD.md` - Pagination placement rules
- `/guidelines/TABLE_DUAL_VIEW_SYNC_PRINCIPLE.md` - Dual view sync requirements
