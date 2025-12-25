# 🔧 Pagination Toolset - Quick Reference

**Standard pagination system for all tables in the application.**

---

## 📦 What's in the Toolset?

### Components
1. **TablePagination** - Full-featured pagination for standard tables
2. **TablePaginationCompact** - Compact version for split views/cards

### Documentation
1. **PAGINATION_SYSTEM_GUIDE.md** - Comprehensive usage guide
2. **TABLE_PAGINATION_CHECKLIST.md** - Implementation tracking
3. **PAGINATION_MIGRATION_EXAMPLE.md** - Migration examples

---

## ⚡ Quick Start

### For Standard Tables

```tsx
import { TablePagination } from '../components/TablePagination';

const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [totalCount, setTotalCount] = useState(0);

<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

### For Split Views / Cards

```tsx
import { TablePaginationCompact } from '../components/TablePaginationCompact';

const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(totalCount / itemsPerPage);

<TablePaginationCompact
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

---

## 📐 Design Specs

### Full Pagination
- **Position:** Bottom of table, outside Card border
- **Spacing:** `mt-4` from table
- **Layout:** Flex space-between
- **Left:** "Showing X to Y of Z" + Items selector
- **Right:** Navigation buttons + page numbers

### Compact Pagination
- **Position:** Inside Card, at bottom
- **Spacing:** Border-top separator
- **Layout:** Flex space-between
- **Left:** "Page X of Y"
- **Right:** Navigation buttons only

---

## 🎯 Best Practices

### ✅ Always
- Default to 25 items per page
- Reset to page 1 when filters change
- Use TablePagination for main views
- Use TablePaginationCompact for split views
- Set totalCount from API response

### ❌ Never
- Don't write custom pagination UI
- Don't forget to update totalCount
- Don't skip resetting page on filter changes
- Don't put full pagination inside Cards

---

## 📊 Server-Side Pattern

```tsx
const fetchData = async () => {
  const skipCount = (currentPage - 1) * itemsPerPage;
  const response = await apiService.getData({
    skipCount,
    maxResultCount: itemsPerPage
  });
  setItems(response.items);
  setTotalCount(response.totalCount);
};

useEffect(() => {
  fetchData();
}, [currentPage, itemsPerPage]);
```

---

## 🔍 When to Use Which?

| Use Case | Component | Example |
|----------|-----------|---------|
| Main table view | TablePagination | ClientManagementView |
| Split view cards | TablePaginationCompact | SignaturesViewSplit |
| Dialog with table | TablePaginationCompact | Modal with list |
| Full-width table | TablePagination | Form8879View |
| Side-by-side tables | TablePaginationCompact | Dual-pane views |

---

## 📚 Documentation Links

- **Full Guide:** PAGINATION_SYSTEM_GUIDE.md
- **Implementation Tracking:** TABLE_PAGINATION_CHECKLIST.md
- **Migration Examples:** PAGINATION_MIGRATION_EXAMPLE.md
- **Components:**
  - `/components/TablePagination.tsx`
  - `/components/TablePaginationCompact.tsx`

---

## 🎨 Features

### Both Components
✅ Branded with `var(--primaryColor)`  
✅ Dark mode support  
✅ Responsive design  
✅ Smart button states  
✅ Accessible  
✅ Consistent styling  

### TablePagination Only
✅ Items per page selector  
✅ "Showing X to Y of Z" display  
✅ **"Page X of Y" indicator between arrows**  
✅ Page number buttons (up to 5)  
✅ Auto-reset on items change  

### TablePaginationCompact Only
✅ Minimal footprint  
✅ Card-friendly styling  
✅ Background separation  

---

## 🚀 Implementation Status

- ✅ **SignaturesView** - Implemented
- ✅ **SignaturesViewSplit** - Implemented
- 🔄 **~23 more pages** - In progress

See TABLE_PAGINATION_CHECKLIST.md for full list.

---

## 💡 Pro Tips

1. **Copy the template** from PAGINATION_SYSTEM_GUIDE.md
2. **Always test** navigation after implementing
3. **Check totalCount** is properly set from API
4. **Remember to reset** page 1 on all filter changes
5. **Use the right component** - full vs compact

---

**Version:** 1.0  
**Last Updated:** Current session  
**Status:** Production Ready ✅  
**Maintained By:** Development Team