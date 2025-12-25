# Pagination System Guide

## 🎯 Overview

This application uses a standardized pagination system across all tables. Two reusable components are available for consistent implementation.

---

## 📦 Available Components

### 1. TablePagination (Full-Featured)

**Location:** `/components/TablePagination.tsx`

**Use Case:** Standard tables outside Card borders

**Features:**
- Full navigation (First, Previous, Page Numbers, Next, Last)
- Items per page selector (10/25/50/100)
- "Showing X to Y of Z results" display
- **"Page X of Y" indicator between navigation arrows**
- Branded with `var(--primaryColor)`
- Dark mode support
- Responsive design

**Quick Implementation:**

```tsx
import { TablePagination } from '../components/TablePagination';
import { useState } from 'react';

function MyTableView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  return (
    <>
      {/* Your table goes here */}
      <table>...</table>
      
      {/* Pagination at the bottom */}
      <TablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </>
  );
}
```

---

### 2. TablePaginationCompact (Card-Friendly)

**Location:** `/components/TablePaginationCompact.tsx`

**Use Case:** Tables inside Card borders (Split Views, Dialogs)

**Features:**
- Compact navigation (First, Previous, Next, Last)
- "Page X of Y" display
- Smaller footprint
- Fits inside Card borders
- Background styling for visual separation

**Quick Implementation:**

```tsx
import { TablePaginationCompact } from '../components/TablePaginationCompact';
import { useState } from 'react';
import { Card } from '../components/ui/card';

function MySplitView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Card>
      {/* Your table or content */}
      <table>...</table>
      
      {/* Compact pagination inside Card */}
      <TablePaginationCompact
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}
```

---

## 🔧 Component API Reference

### TablePagination Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPage` | `number` | ✅ | - | Current page number (1-based) |
| `itemsPerPage` | `number` | ✅ | - | Number of items per page |
| `totalCount` | `number` | ✅ | - | Total number of items |
| `onPageChange` | `(page: number) => void` | ✅ | - | Callback when page changes |
| `onItemsPerPageChange` | `(items: number) => void` | ✅ | - | Callback when items per page changes |
| `itemsPerPageOptions` | `number[]` | ❌ | `[10, 25, 50, 100]` | Options for items per page |

### TablePaginationCompact Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPage` | `number` | ✅ | - | Current page number (1-based) |
| `totalPages` | `number` | ✅ | - | Total number of pages |
| `onPageChange` | `(page: number) => void` | ✅ | - | Callback when page changes |

---

## 📋 Implementation Checklist

When adding pagination to a page:

- [ ] Import the appropriate pagination component
- [ ] Add state variables: `currentPage`, `itemsPerPage`, `totalCount`
- [ ] Set default `itemsPerPage` to `25`
- [ ] Connect API to fetch paginated data
- [ ] Calculate `skipCount = (currentPage - 1) * itemsPerPage`
- [ ] Pass `skipCount` and `maxResultCount` to API
- [ ] Update `totalCount` from API response
- [ ] Reset `currentPage` to `1` when filters change
- [ ] Add `useEffect` to refetch when page/items change
- [ ] Test navigation buttons work correctly
- [ ] Test items per page selector (if using full component)
- [ ] Verify dark mode styling
- [ ] Test responsive behavior

---

## 🔄 Server-Side Pagination Pattern

### Standard API Integration

```tsx
const fetchData = async () => {
  setIsLoading(true);
  try {
    const skipCount = (currentPage - 1) * itemsPerPage;
    
    const response = await apiService.getData({
      skipCount,
      maxResultCount: itemsPerPage,
      sorting: sortColumn ? `${sortColumn} ${sortDirection}` : undefined,
      // ... other filters
    });
    
    setItems(response.items);
    setTotalCount(response.totalCount);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    setIsLoading(false);
  }
};

// Refetch when pagination or filters change
useEffect(() => {
  fetchData();
}, [currentPage, itemsPerPage, sortColumn, filters]);
```

### Reset Page on Filter Changes

```tsx
const handleFilterChange = (newFilter: string) => {
  setFilter(newFilter);
  setCurrentPage(1); // ← Always reset to page 1
};

const handleSearch = (query: string) => {
  setSearchQuery(query);
  setCurrentPage(1); // ← Always reset to page 1
};

const handleSort = (column: string) => {
  setSortColumn(column);
  setCurrentPage(1); // ← Always reset to page 1
};
```

---

## 🎨 Visual Specifications

### Full Pagination Layout
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Showing 1 to 25 of 127 results   [25 / page ▼]   [<<] [<] Page 2 of 5 [1] [2] [3] [4] [5] [>] [>>] │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Compact Pagination Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Page 2 of 5                           [First] [◄] [►] [Last]     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Best Practices

### ✅ DO

- Use `TablePagination` for main views and full-width tables
- Use `TablePaginationCompact` for split views and card-contained tables
- Set default `itemsPerPage` to `25`
- Reset to page 1 when any filter changes
- Show pagination when `totalCount > 0` (component handles this)
- Use server-side pagination for large datasets
- Calculate `totalPages` as `Math.ceil(totalCount / itemsPerPage)`

### ❌ DON'T

- Don't hardcode pagination UI in each component
- Don't forget to reset page when filters change
- Don't show pagination when there's no data (component handles this)
- Don't forget to update `totalCount` from API response
- Don't use client-side pagination for large datasets
- Don't put full pagination inside Card borders (use compact version)

---

## 🔍 Troubleshooting

### Pagination Not Showing

**Issue:** Pagination doesn't appear at all

**Solutions:**
1. Check that `totalCount > 0`
2. Verify API response contains `totalCount`
3. Ensure component is rendered after loading completes
4. Check that state is properly initialized

### Navigation Buttons Disabled

**Issue:** All navigation buttons are disabled

**Solutions:**
1. Verify `totalPages > 1` for full navigation
2. Check that `currentPage` is within valid range (1 to totalPages)
3. Ensure `totalCount` is correctly set from API

### Items Per Page Not Working

**Issue:** Changing items per page doesn't work

**Solutions:**
1. Verify `onItemsPerPageChange` is properly connected
2. Check that API call uses `itemsPerPage` in `maxResultCount`
3. Ensure `useEffect` dependency array includes `itemsPerPage`
4. Component automatically resets to page 1 (check if expected)

### Wrong Page Count

**Issue:** Showing wrong number of pages

**Solutions:**
1. Verify `totalCount` from API is correct
2. Check calculation: `totalPages = Math.ceil(totalCount / itemsPerPage)`
3. Ensure `itemsPerPage` is a number, not a string

---

## 📊 Real-World Examples

### Example 1: Basic Table View

```tsx
import { TablePagination } from '../components/TablePagination';

function DocumentsTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [documents, setDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = async () => {
    const skipCount = (currentPage - 1) * itemsPerPage;
    const response = await apiService.getDocuments({
      skipCount,
      maxResultCount: itemsPerPage
    });
    setDocuments(response.items);
    setTotalCount(response.totalCount);
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, itemsPerPage]);

  return (
    <>
      <Card>
        <table>{/* render documents */}</table>
      </Card>
      
      <TablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </>
  );
}
```

### Example 2: Split View with Filters

```tsx
import { TablePaginationCompact } from '../components/TablePaginationCompact';

function SignaturesSplitView() {
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0);

  const pendingPages = Math.ceil(pendingTotal / itemsPerPage);
  const completedPages = Math.ceil(completedTotal / itemsPerPage);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Pending Card */}
      <Card>
        <table>{/* pending items */}</table>
        <TablePaginationCompact
          currentPage={pendingPage}
          totalPages={pendingPages}
          onPageChange={setPendingPage}
        />
      </Card>

      {/* Completed Card */}
      <Card>
        <table>{/* completed items */}</table>
        <TablePaginationCompact
          currentPage={completedPage}
          totalPages={completedPages}
          onPageChange={setCompletedPage}
        />
      </Card>
    </div>
  );
}
```

---

## 🚀 Quick Start Template

Copy and paste this template to quickly add pagination to any page:

```tsx
import { useState, useEffect } from 'react';
import { TablePagination } from '../components/TablePagination';
import { Card } from './ui/card';
import apiService from '../services/ApiService';

function MyTableView() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Data state
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const skipCount = (currentPage - 1) * itemsPerPage;
      const response = await apiService.getItems({
        skipCount,
        maxResultCount: itemsPerPage
      });
      setItems(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  return (
    <>
      <Card>
        <table>
          {/* Render your table */}
        </table>
      </Card>
      
      <TablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </>
  );
}

export default MyTableView;
```

---

## 📚 Related Documentation

- **TABLE_PAGINATION_CHECKLIST.md** - Implementation tracking for all pages
- **DESIGN_SYSTEM_REFERENCE.md** - Overall design system guide
- **Component Source:**
  - `/components/TablePagination.tsx`
  - `/components/TablePaginationCompact.tsx`

---

**Last Updated:** Current session  
**Version:** 1.0  
**Status:** Production Ready ✅