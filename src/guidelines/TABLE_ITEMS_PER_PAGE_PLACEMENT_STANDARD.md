# Items Per Page Placement - GLOBAL STANDARD

## ⚠️ CRITICAL RULES - DO NOT DEVIATE

1. The **Items Per Page** selector MUST ALWAYS be positioned at the **TOP RIGHT** of the table section
2. **ORDER MATTERS:** Items Per Page comes BEFORE View Toggle
3. **Correct Order:** `[Items/Page] [View Toggle]`
4. **Wrong Order:** ~~`[View Toggle] [Items/Page]`~~

This is a **GLOBAL UI/UX CONSISTENCY REQUIREMENT** that applies to ALL tables throughout the application.

## The Correct Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Table Title                    [25/page ▼] [View Toggle]   │ ← TOP RIGHT
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Table content here]                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-25 of 100     [◄◄] [◄] [1][2][3] [►] [►►]        │ ← BOTTOM
└─────────────────────────────────────────────────────────────┘
```

### Location Breakdown

**TOP RIGHT Section (IN THIS ORDER):**
1. **Items Per Page Selector** (25/page, 50/page, etc.) - COMES FIRST
2. **View Toggle** (Split View / Single View) - COMES SECOND
- GROUPED TOGETHER with 3-unit gap

**BOTTOM Section (inside last table row or after table):**
- Info text: "Showing X to Y of Z results"
- Pagination controls: First, Previous, Page Numbers, Next, Last
- NO items per page selector here

## Why This Pattern?

1. **Discoverability:** Users look at the top of a table to control how many items they see
2. **Consistency:** Same location across all tables = better UX
3. **Context:** Top-level controls (what to show) go at top, navigation (which page) goes at bottom
4. **Proximity:** Items per page is logically grouped with view toggle (both control "how" you see data)

## Implementation

### JSX Structure

⚠️ **CRITICAL:** The outer container MUST have EXACTLY TWO direct children:
1. Left side container (title + badge + any tabs/filters)
2. Right side container (view toggle + items per page)

If you have 3+ direct children, `justify-between` will CENTER the middle items!

```tsx
{/* Table Header Section */}
<div className="flex items-center justify-between mb-6">
  {/* Left Side: Group ALL left elements together */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <h3 className="text-gray-900 dark:text-gray-100">Table Title</h3>
      <Badge>{items.length}</Badge>
    </div>
    
    {/* If you have tabs, put them HERE inside left container */}
    <div className="flex items-center gap-2">
      <button>Tab 1</button>
      <button>Tab 2</button>
    </div>
  </div>
  
  {/* Right Side: Items Per Page + View Toggle */}
  <div className="flex items-center gap-3">
    {/* Items Per Page - COMES FIRST */}
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
    
    {/* View Toggle - COMES SECOND */}
    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
      <Button /* Single View */ />
      <Button /* Split View */ />
    </div>
  </div>
</div>

{/* Table */}
<Card>
  <table>...</table>
</Card>

{/* Pagination - BOTTOM ONLY */}
<TablePaginationNav
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### Styling Standards

**Items Per Page Selector:**
- Width: `w-[110px]`
- Height: `h-8`
- Text size: `text-xs`
- Options: 10, 25, 50, 100 per page
- Format: `"25 / page"` (with spaces around slash)

**View Toggle + Items Per Page Container:**
- Flex container: `flex items-center gap-3`
- View toggle and items per page have 3-unit gap between them

## New Component: TablePaginationNav

To enforce this pattern, we need a new component that ONLY handles pagination navigation (no items per page selector).

```tsx
// /components/TablePaginationNav.tsx
export function TablePaginationNav({
  currentPage,
  itemsPerPage,
  totalCount,
  onPageChange
}: TablePaginationNavProps) {
  // Shows: Info + Navigation buttons
  // Does NOT include items per page selector
  return (
    <div className="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
      {/* Left: Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalCount} results
      </div>
      
      {/* Right: Navigation */}
      <div className="flex items-center gap-1">
        {/* First, Previous, Page Numbers, Next, Last */}
      </div>
    </div>
  );
}
```

## Files That Need This Pattern

### ✅ Already Correct (Need Verification)
- None confirmed yet

### ❌ Need Fixing (Items per page at bottom instead of top)
- [x] `/components/views/BillingView.tsx`
- [ ] `/components/views/BillingViewSplit.tsx`
- [ ] `/components/views/SignaturesView.tsx`
- [ ] `/components/views/SignaturesViewSplit.tsx`
- [ ] `/components/views/ClientManagementView.tsx`
- [ ] `/components/views/IncomingDocumentsView.tsx`
- [ ] `/components/views/SignatureTemplatesView.tsx`
- [ ] `/components/folder-tabs/DocumentsTab.tsx`
- [ ] `/components/folder-tabs/FilesTab.tsx`
- [ ] `/components/folder-tabs/InvoicesTab.tsx`
- [ ] `/components/folder-tabs/SignatureTab.tsx`
- [ ] `/components/folder-tabs/ProjectsTab.tsx`
- [ ] `/components/folder-tabs/ActivityTab.tsx`

## Verification Checklist

For EVERY page with a table, verify:

1. [ ] Items per page selector is at TOP RIGHT
2. [ ] Items per page is next to view toggle (if view toggle exists)
3. [ ] Items per page is NOT at the bottom
4. [ ] Items per page has width `w-[110px]`
5. [ ] Items per page has height `h-8`
6. [ ] Items per page has text size `text-xs`
7. [ ] Items per page options are: 10, 25, 50, 100
8. [ ] Format is "X / page" with spaces
9. [ ] Changing items per page resets to page 1
10. [ ] Pagination nav at bottom does NOT include items per page

## Migration Steps

For each file that needs fixing:

### Step 1: Add Items Per Page to Top
```tsx
{/* Add to TOP RIGHT section */}
<div className="flex items-center gap-3">
  {/* Existing view toggle */}
  <div className="flex items-center gap-1 ...">
    {/* View toggle buttons */}
  </div>
  
  {/* NEW: Items Per Page */}
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
```

### Step 2: Create TablePaginationNav Component
```tsx
// New component without items per page selector
```

### Step 3: Replace TablePagination with TablePaginationNav
```tsx
{/* OLD */}
<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}  // ← includes items per page
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}  // ← includes items per page
/>

{/* NEW */}
<TablePaginationNav
  currentPage={currentPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  // No itemsPerPage or onItemsPerPageChange props
/>
```

### Step 4: Test
1. Items per page appears at top right
2. Changing items per page resets to page 1
3. Pagination at bottom works correctly
4. No items per page selector at bottom

## Common Mistakes to Avoid

### ❌ CRITICAL ERROR: Three direct children causing centering

**This is the #1 mistake that causes view toggle to center!**

```tsx
{/* WRONG - 3 direct children */}
<div className="flex items-center justify-between mb-6">
  <div>Title + Badge</div>  {/* Child 1 - LEFT */}
  <div>Tabs</div>           {/* Child 2 - CENTER ❌ */}
  <div>Toggle + Items</div> {/* Child 3 - RIGHT */}
</div>
```

**Result:** Tabs get centered, toggle goes to right, but everything looks wrong!

**Fix:** Group left items together:
```tsx
{/* CORRECT - 2 direct children */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-4">  {/* Child 1 - LEFT */}
    <div>Title + Badge</div>
    <div>Tabs</div>  {/* Grouped with left */}
  </div>
  <div>Toggle + Items</div>  {/* Child 2 - RIGHT ✅ */}
</div>
```

### ❌ WRONG: Items per page at bottom
```tsx
<table>...</table>
<TablePagination 
  itemsPerPage={itemsPerPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

### ❌ WRONG: Items per page in toolbar
```tsx
<div className="toolbar">
  <Input />  {/* Search */}
  <Select /> {/* Items per page - WRONG LOCATION */}
</div>
```

### ❌ WRONG: Items per page on left side
```tsx
<div className="flex justify-between">
  <Select /> {/* Items per page - WRONG SIDE */}
  <div>View Toggle</div>
</div>
```

### ✅ CORRECT: Items per page at top right
```tsx
<div className="flex items-center justify-between mb-6">
  <h3>Title</h3>
  <div className="flex items-center gap-3">
    <ViewToggle />
    <Select /> {/* Items per page - CORRECT! */}
  </div>
</div>
```

## Enforcement

This is a **MANDATORY STANDARD**. Any PR or update that places items per page anywhere other than TOP RIGHT next to the view toggle will be rejected.

### Code Review Checklist
- [ ] Items per page is at top right
- [ ] Items per page is NOT at bottom
- [ ] Items per page is NOT in toolbar
- [ ] Items per page is next to view toggle
- [ ] Styling matches standard (w-[110px], h-8, text-xs)
- [ ] Options are 10, 25, 50, 100
- [ ] Format is "X / page"

## References

- See `/guidelines/TABLE_VIEW_TOGGLE_STANDARD.md` for view toggle standards
- See `/guidelines/TABLE_PAGINATION_PLACEMENT_STANDARD.md` for pagination standards
- See `/components/TablePaginationNav.tsx` (to be created)

---

**Status:** ACTIVE GLOBAL STANDARD  
**Applies to:** ALL tables in the application  
**Enforcement:** MANDATORY - no exceptions  
**Last Updated:** Current session
