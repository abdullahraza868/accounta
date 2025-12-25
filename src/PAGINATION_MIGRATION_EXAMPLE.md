# Pagination Migration Example

This document shows how to refactor existing pagination to use the new reusable components.

---

## Before: Manual Pagination

```tsx
// SignaturesView.tsx - OLD APPROACH (Lines 1624-1717)

{/* Pagination Controls */}
{totalCount > 0 && (
  <div className="flex items-center justify-between mt-4">
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
      </div>
      {/* Items Per Page */}
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          setItemsPerPage(Number(value));
          setCurrentPage(1);
        }}
      >
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 / page</SelectItem>
          <SelectItem value="25">25 / page</SelectItem>
          <SelectItem value="50">50 / page</SelectItem>
          <SelectItem value="100">100 / page</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1 || totalPages <= 1}
        className="h-8 w-8 p-0"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1 || totalPages <= 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {/* Page Numbers */}
      {totalPages > 1 && Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(pageNum)}
            className="h-8 w-8 p-0"
            style={currentPage === pageNum ? { backgroundColor: 'var(--primaryColor)' } : undefined}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages <= 1}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages || totalPages <= 1}
        className="h-8 w-8 p-0"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
)}
```

**Lines of code:** ~93 lines
**Maintenance:** High - any changes need to be replicated across all pages

---

## After: Using TablePagination Component

```tsx
// SignaturesView.tsx - NEW APPROACH

import { TablePagination } from '../components/TablePagination';

// ... in the component JSX:

<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

**Lines of code:** ~7 lines (including import)
**Maintenance:** Low - update one component, all pages benefit

---

## Migration Steps

### Step 1: Add Import

```tsx
import { TablePagination } from '../components/TablePagination';
```

### Step 2: Keep Your State Variables

No changes needed - keep using:
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [totalCount, setTotalCount] = useState(0);
```

### Step 3: Replace Manual Pagination with Component

Replace the entire manual pagination block (all the JSX) with:

```tsx
<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

### Step 4: Remove Unused Imports (Optional)

If not used elsewhere, you can remove:
```tsx
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
```

### Step 5: Test

- ✅ Navigation buttons work
- ✅ Page numbers display correctly
- ✅ Items per page selector works
- ✅ "Showing X to Y of Z" displays correctly
- ✅ Resets to page 1 when changing items per page
- ✅ Branding color applies to active page
- ✅ Dark mode works

---

## Split View Migration Example

### Before: Manual Compact Pagination

```tsx
// SignaturesViewSplit.tsx - OLD APPROACH

{totalPages > 1 && (
  <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
    <span className="text-xs text-gray-500 dark:text-gray-400">
      Page {currentPage} of {totalPages}
    </span>
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="h-7 w-7 p-0"
      >
        <ChevronsLeft className="w-3.5 h-3.5" />
      </Button>
      {/* ... more buttons ... */}
    </div>
  </div>
)}
```

### After: Using TablePaginationCompact

```tsx
// SignaturesViewSplit.tsx - NEW APPROACH

import { TablePaginationCompact } from '../components/TablePaginationCompact';

const totalPages = Math.ceil(totalCount / itemsPerPage);

<TablePaginationCompact
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

---

## Benefits of Migration

### ✅ Consistency
- All pages look and behave the same
- No more slight variations between pages

### ✅ Maintainability
- Update once, fix everywhere
- Less code to review
- Easier to onboard new developers

### ✅ Reliability
- Thoroughly tested component
- Edge cases handled
- Accessibility built-in

### ✅ Productivity
- Faster to implement new pages
- Copy-paste template works every time
- Less debugging

### ✅ Future-Proofing
- Add features once (e.g., keyboard navigation)
- Update styling globally
- Add analytics/tracking centrally

---

## Rollout Strategy

### Phase 1: High-Traffic Pages (Week 1)
- [ ] ClientManagementView
- [ ] SignaturesView ✅
- [ ] SignaturesViewSplit ✅
- [ ] Form8879View
- [ ] SignatureTemplatesView

### Phase 2: Client Folder Tabs (Week 2)
- [ ] DocumentsTab
- [ ] FilesTab
- [ ] InvoicesTab
- [ ] ActivityTab
- [ ] CommunicationTab

### Phase 3: Remaining Pages (Week 3)
- [ ] All team member tabs
- [ ] Company settings tabs
- [ ] Other views

### Phase 4: Cleanup (Week 4)
- [ ] Remove old pagination code comments
- [ ] Update documentation
- [ ] Add unit tests for pagination components

---

## Testing Checklist

After migrating each page:

- [ ] Navigation works (First, Prev, Next, Last)
- [ ] Page numbers display and work correctly
- [ ] Items per page changes work (Full component only)
- [ ] "Showing X to Y of Z" calculates correctly
- [ ] Resets to page 1 on filter changes
- [ ] Disabled states are correct
- [ ] Active page uses brand color
- [ ] Dark mode styling correct
- [ ] Loading states don't break pagination
- [ ] Empty states don't show pagination
- [ ] Responsive on mobile
- [ ] No console errors

---

## Common Issues & Solutions

### Issue: Component Not Rendering

**Symptom:** Pagination doesn't appear at all

**Solution:**
```tsx
// Check that you're passing totalCount, not totalPages
<TablePagination
  totalCount={totalCount}  // ✅ Correct
  // NOT: totalPages={totalPages}  // ❌ Wrong prop
/>
```

### Issue: Buttons Always Disabled

**Symptom:** Can't click any navigation buttons

**Solution:**
```tsx
// For Compact version, pass totalPages not totalCount
<TablePaginationCompact
  totalPages={Math.ceil(totalCount / itemsPerPage)}  // ✅ Correct
  // NOT: totalPages={totalCount}  // ❌ Wrong calculation
/>
```

### Issue: Items Per Page Not Resetting Page

**Symptom:** Page doesn't reset to 1 when changing items per page

**Solution:**
The component handles this automatically via `onItemsPerPageChange`. 
Make sure you're using the callback:
```tsx
onItemsPerPageChange={setItemsPerPage}  // ✅ This resets page internally
```

---

## Side-by-Side Comparison

| Aspect | Manual Pagination | TablePagination Component |
|--------|-------------------|---------------------------|
| Lines of Code | ~93 lines | ~7 lines |
| Imports Needed | 4+ imports | 1 import |
| Consistency | Varies by page | 100% consistent |
| Bugs | Potential in each impl | Fixed once |
| Dark Mode | Manual per page | Built-in |
| Branding | Manual per page | Automatic |
| Updates | Edit every page | Edit one file |
| Testing | Test every page | Test once |
| Accessibility | Varies | Standardized |
| Mobile Ready | Varies | Built-in |

---

**Recommendation:** Migrate all pages to use the new components. The time investment upfront will save countless hours of maintenance and debugging in the future.

---

**Last Updated:** Current session  
**Migration Status:** 2 of ~25 pages completed
