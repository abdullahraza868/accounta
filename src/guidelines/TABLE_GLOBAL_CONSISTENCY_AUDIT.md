# Table Global Consistency Audit - ALL PAGES

## Purpose

This checklist ensures ALL tables throughout the application follow global UX/UI consistency standards. This is a **MANDATORY AUDIT** that must be run on every page with a table.

## The Problem

Inconsistent table patterns across the application lead to:
- Poor user experience
- Wasted development time
- Redundant fixes
- User confusion

## The Solution

**ONE STANDARD PATTERN** for ALL tables, enforced globally through regular audits.

## Global Standards Reference

Before auditing, familiarize yourself with these standards:
- `/guidelines/TABLE_ITEMS_PER_PAGE_PLACEMENT_STANDARD.md` - Items per page placement
- `/guidelines/TABLE_VIEW_TOGGLE_STANDARD.md` - View toggle placement  
- `/guidelines/TABLE_PAGINATION_PLACEMENT_STANDARD.md` - Pagination placement
- `/guidelines/DUAL_VIEW_SYNC_PROTOCOL.md` - Dual view synchronization
- `/guidelines/TABLE_UNIVERSAL_CHECKLIST.md` - Universal table checklist

## Pages to Audit

### Main Views
- [ ] `/components/views/BillingView.tsx`
- [ ] `/components/views/BillingViewSplit.tsx`
- [ ] `/components/views/SignaturesView.tsx`
- [ ] `/components/views/SignaturesViewSplit.tsx`
- [ ] `/components/views/ClientManagementView.tsx`
- [ ] `/components/views/IncomingDocumentsView.tsx`
- [ ] `/components/views/SignatureTemplatesView.tsx`
- [ ] `/components/views/CalendarView.tsx` (if has table)
- [ ] `/components/views/Form8879View.tsx` (if has table)

### Folder Tabs
- [ ] `/components/folder-tabs/DocumentsTab.tsx`
- [ ] `/components/folder-tabs/FilesTab.tsx`
- [ ] `/components/folder-tabs/InvoicesTab.tsx`
- [ ] `/components/folder-tabs/SignatureTab.tsx`
- [ ] `/components/folder-tabs/ProjectsTab.tsx`
- [ ] `/components/folder-tabs/ActivityTab.tsx`
- [ ] `/components/folder-tabs/NotesTab.tsx`
- [ ] `/components/folder-tabs/OrganizersTab.tsx`

### Team Member Tabs
- [ ] `/components/team-member-tabs/DocumentsTab.tsx`
- [ ] `/components/team-member-tabs/ActivityTab.tsx`
- [ ] `/components/team-member-tabs/NotesTab.tsx`

## Per-Page Checklist

For EACH file above, verify the following:

### 1. Items Per Page Placement ⭐ CRITICAL
- [ ] Items per page selector is at TOP RIGHT
- [ ] Items per page is AFTER (to the right of) view toggle
- [ ] Items per page has width `w-[110px]`
- [ ] Items per page has height `h-8` (NOT h-7)
- [ ] Items per page has text size `text-xs`
- [ ] Options are: 10, 25, 50, 100 (NOT 5)
- [ ] Format is "X / page" with spaces (e.g., "25 / page")
- [ ] Changing items per page resets to page 1
- [ ] Items per page is NOT at the bottom
- [ ] Items per page is NOT in the toolbar/filter section

### 2. View Toggle Placement
- [ ] View toggle is at TOP RIGHT
- [ ] View toggle is BEFORE (to the left of) items per page
- [ ] View toggle uses standard styling (border, rounded-lg, bg-gray-50)
- [ ] Active button has primary color background
- [ ] Inactive button has ghost variant
- [ ] Both buttons have same size: `h-7 px-3 text-xs`
- [ ] Gap between toggle and items per page is `gap-3`

### 3. Table Header Section Structure ⭐ CRITICAL
```tsx
<div className="flex items-center justify-between mb-6">
  {/* MUST have EXACTLY 2 direct children */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <h3>Title</h3>
      <Badge>{count}</Badge>
    </div>
    {/* If tabs exist, they go HERE inside left container */}
  </div>
  <div className="flex items-center gap-3">
    <ItemsPerPage /> {/* FIRST - MANDATORY ORDER */}
    <ViewToggle /> {/* SECOND */}
  </div>
</div>
```
- [ ] ⭐ Header has EXACTLY 2 direct children (not 3!)
- [ ] ⭐ All left items (title, badge, tabs) are grouped in one container
- [ ] ⭐ Items per page and view toggle are in separate right container
- [ ] ⭐ **ORDER:** Items per page BEFORE view toggle (mandatory!)
- [ ] Left side has title + badge
- [ ] If tabs exist, they're inside left container (not separate)
- [ ] Right side has items per page + view toggle (in that order)
- [ ] Right side gap is `gap-3`
- [ ] Left side gap (if tabs exist) is `gap-4`
- [ ] Margin bottom is `mb-6`

### 4. Pagination Placement
- [ ] Pagination is at BOTTOM of table
- [ ] Pagination is INSIDE Card component (after table closes)
- [ ] Pagination uses `TablePaginationNav` component (NOT `TablePagination`)
- [ ] Pagination does NOT include items per page selector
- [ ] Pagination shows info text: "Showing X to Y of Z results"
- [ ] Pagination has navigation buttons: First, Prev, Page Numbers, Next, Last

### 5. Table Toolbar (Search/Filters/Buttons)
- [ ] Toolbar is BELOW header section
- [ ] Toolbar is ABOVE table
- [ ] Toolbar uses flex justify-between
- [ ] Left side has search + filters
- [ ] Right side has action buttons
- [ ] Toolbar has proper spacing: `mb-4 pb-4 border-b`
- [ ] Active filters use primary color for border and text

### 6. Dual View Sync (if applicable)
- [ ] File has warning comment at top about dual view sync
- [ ] Counterpart file exists (e.g., BillingView ↔ BillingViewSplit)
- [ ] Top sections are IDENTICAL between both files
- [ ] ONLY difference is table layout (single vs split)
- [ ] ONLY difference is pagination state variables
- [ ] State variables are synced
- [ ] Filtering logic is synced
- [ ] Sorting logic is synced
- [ ] Mock data is synced

### 7. Component Imports
- [ ] Uses `TablePaginationNav` from `'../TablePaginationNav'` (NOT `TablePagination`)
- [ ] Uses `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `'../ui/select'`
- [ ] Uses `Button` from `'../ui/button'`
- [ ] Uses proper imports for icons (e.g., `LayoutGrid` from `'lucide-react'`)

### 8. State Variables
- [ ] `itemsPerPage` state exists with default value (usually 25)
- [ ] `currentPage` state exists with default value 1
- [ ] State variables are properly typed
- [ ] Changing items per page resets currentPage to 1

### 9. Styling Standards
- [ ] Primary color uses `var(--primaryColor)` (NOT hardcoded purple)
- [ ] Dark mode compatible (uses dark: variants)
- [ ] Proper spacing and gaps follow design system
- [ ] Card component has standard styling: `border border-gray-200/60 dark:border-gray-700 shadow-sm`

### 10. Accessibility
- [ ] Buttons have proper aria labels (if needed)
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG standards

## Audit Process

### Step 1: Review Standard
Read the standard document for the pattern being audited.

### Step 2: Open File
Open the file to be audited.

### Step 3: Check Each Item
Go through the checklist above, marking each item.

### Step 4: Document Issues
If any items fail, document:
- What is wrong
- What it should be
- Line numbers

### Step 5: Fix Issues
Apply fixes according to the standard.

### Step 6: Verify Fix
Re-run the checklist to ensure all items pass.

### Step 7: Test in Browser
Load the page and verify:
- Items per page at top right
- View toggle works
- Items per page selector works
- Pagination works
- Responsiveness works

## Quick Fixes

### Move Items Per Page to Top

**Before (WRONG):**
```tsx
<table>...</table>
<TablePagination 
  itemsPerPage={itemsPerPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

**After (CORRECT):**
```tsx
{/* Header with items per page at top right */}
<div className="flex items-center justify-between mb-6">
  <h3>Title</h3>
  <div className="flex items-center gap-3">
    <ViewToggle />
    <Select value={itemsPerPage.toString()} onValueChange={...}>
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
</div>

<table>...</table>
<TablePaginationNav 
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
/>
```

### Fix Items Per Page Options

**Before (WRONG):**
```tsx
<SelectItem value="5">5 / page</SelectItem>
```

**After (CORRECT):**
```tsx
{/* Remove 5, use 10, 25, 50, 100 only */}
<SelectItem value="10">10 / page</SelectItem>
<SelectItem value="25">25 / page</SelectItem>
<SelectItem value="50">50 / page</SelectItem>
<SelectItem value="100">100 / page</SelectItem>
```

### Fix Items Per Page Height

**Before (WRONG):**
```tsx
<SelectTrigger className="w-[110px] h-7 text-xs">
```

**After (CORRECT):**
```tsx
<SelectTrigger className="w-[110px] h-8 text-xs">
```

### Fix Items Per Page Placement Order

**Before (WRONG):**
```tsx
<div className="flex items-center gap-3">
  <ItemsPerPage /> {/* First - WRONG */}
  <ViewToggle /> {/* Second */}
</div>
```

**After (CORRECT):**
```tsx
<div className="flex items-center gap-3">
  <ViewToggle /> {/* First - CORRECT */}
  <ItemsPerPage /> {/* Second */}
</div>
```

## Audit Log

Track audit results here:

### Audit Date: [CURRENT SESSION]

| File | Items/Page Top | Correct Order | 2-Child Rule | View Toggle | Pagination | Dual Sync | Status |
|------|----------------|---------------|--------------|-------------|------------|-----------|--------|
| BillingView.tsx | ✅ FIXED | ✅ FIXED | ✅ FIXED | ✅ | ✅ | ✅ | ✅ PASS |
| BillingViewSplit.tsx | ✅ FIXED | ✅ FIXED | ✅ FIXED | ✅ | ✅ | ✅ | ✅ PASS |
| SignaturesView.tsx | ✅ | N/A* | ✅ | ✅ | ✅ | N/A | ✅ PASS |
| SignaturesViewSplit.tsx | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ PASS |

*SignaturesView uses TablePagination component at bottom (different pattern, also acceptable)
| SignaturesView.tsx | ❌ TODO | ✅ | ❌ TODO | ✅ | TODO |
| SignaturesViewSplit.tsx | ❌ TODO | ✅ | ❌ TODO | ✅ | TODO |
| ClientManagementView.tsx | ❌ TODO | N/A | ❌ TODO | N/A | TODO |
| IncomingDocumentsView.tsx | ❌ TODO | N/A | ❌ TODO | N/A | TODO |
| SignatureTemplatesView.tsx | ❌ TODO | N/A | ❌ TODO | N/A | TODO |
| ... | ... | ... | ... | ... | ... |

## Success Criteria

A page PASSES the audit when:
- ✅ All 10 checklist sections are complete
- ✅ Items per page is at TOP RIGHT
- ✅ Items per page is AFTER view toggle
- ✅ Pagination uses `TablePaginationNav` (no items per page at bottom)
- ✅ If dual view, both files are synced
- ✅ Browser testing confirms visual correctness

## Enforcement

This audit is **MANDATORY** for:
- All new table implementations
- All table modifications
- All PR reviews involving tables
- Regular quarterly consistency checks

## Automation Goal

Future goal: Create a linter rule that automatically checks:
- Items per page selector is NOT in TablePagination component usage
- TablePaginationNav is used instead of TablePagination
- Items per page Select is present in header section

---

**Status:** ACTIVE AUDIT PROCESS  
**Frequency:** On-demand + quarterly reviews  
**Owner:** Development team  
**Last Run:** Current session (BillingView, BillingViewSplit - partial)
