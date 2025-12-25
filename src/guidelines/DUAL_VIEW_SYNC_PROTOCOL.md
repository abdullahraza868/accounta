# Dual View Synchronization Protocol - MANDATORY

## The Problem

When working with dual view files (e.g., BillingView.tsx & BillingViewSplit.tsx, SignaturesView.tsx & SignaturesViewSplit.tsx), changes are frequently made to one view but not the other, causing:
- Feature inconsistency between views
- Broken user experience
- Wasted time fixing the same issue twice
- User frustration

## Root Cause

Treating dual view files as **separate files** instead of as **a single logical unit** with two display variations.

## THE RULE

> **When editing ANY dual view file, you MUST edit BOTH files simultaneously as if they were ONE file.**

The ONLY difference between Single View and Split View should be:
- **Table layout below the toolbar**
- **Pagination state** (split view has separate pagination for each table)

Everything else MUST be IDENTICAL:
- ✅ Header section
- ✅ Stats cards
- ✅ Toolbar (search, filters, buttons)
- ✅ State variables
- ✅ Filtering logic
- ✅ Sorting logic
- ✅ Dialogs and modals
- ✅ Helper functions
- ✅ Mock data
- ✅ Settings

## MANDATORY WORKFLOW

### Step 1: Identify Dual View Files
Before making ANY change, check if the file has a dual view counterpart:
- `BillingView.tsx` ↔️ `BillingViewSplit.tsx`
- `SignaturesView.tsx` ↔️ `SignaturesViewSplit.tsx`
- Any file with "Split" suffix has a regular counterpart

### Step 2: Make Changes to BOTH Files
**DO NOT make changes to one file and move on.**

For EVERY edit:
1. ✅ Edit File A
2. ✅ Edit File B with THE EXACT SAME CHANGE
3. ✅ Verify both files are in sync

### Step 3: Verification Checklist
After making changes, verify:
- [ ] New state variables added to both files
- [ ] New imports added to both files  
- [ ] Filter logic updated in both files
- [ ] Sort logic updated in both files
- [ ] Toolbar UI updated in both files
- [ ] Helper functions updated in both files
- [ ] Event handlers updated in both files
- [ ] Comments and documentation match

## SPECIFIC SCENARIOS

### Adding a New Filter
**WRONG:** Add filter Select to BillingView.tsx toolbar ❌

**RIGHT:**
1. Add `filterName` state to BOTH files
2. Add filter Select UI to BOTH files' toolbars
3. Update filtering logic in BOTH files
4. Update "Clear filters" button in BOTH files
5. Test in BOTH views

### Adding Column Sorting
**WRONG:** Add sortable headers to BillingView.tsx ❌

**RIGHT:**
1. Add `sortColumn` and `sortDirection` state to BOTH files
2. Add `handleSort()` function to BOTH files
3. Add `getSortIcon()` function to BOTH files
4. Update ALL table headers in BOTH files
5. Test sorting in BOTH views

### Adding a Dialog/Modal
**WRONG:** Add dialog state and component to BillingView.tsx ❌

**RIGHT:**
1. Add dialog state to BOTH files
2. Add dialog trigger buttons to BOTH files
3. Add dialog component to BOTH files
4. Add dialog handlers to BOTH files
5. Test dialog in BOTH views

## PREVENTION STRATEGIES

### Strategy 1: Think Tool
Use the `think` tool to remind yourself:
```
I'm editing BillingView.tsx. This has a dual view counterpart at BillingViewSplit.tsx.
I need to make ALL changes to BOTH files. Let me list what needs to be synced:
- State variables: X, Y, Z
- UI components: Filter dropdown, button
- Logic: Filtering function
```

### Strategy 2: Code Comments at Top of File
Add at the top of BOTH files:
```tsx
/**
 * DUAL VIEW FILE - BillingView.tsx ↔️ BillingViewSplit.tsx
 * 
 * IMPORTANT: When making changes to this file, you MUST also update the counterpart file.
 * The ONLY differences should be:
 * - Table layout (single table vs split tables)
 * - Pagination state (single vs dual)
 * 
 * Everything else MUST be kept in sync:
 * - Imports, state, filtering, sorting, toolbar, dialogs, helpers
 */
```

### Strategy 3: Diff Check Before Completing
Before marking a task complete, run a mental diff:
1. Open both files side-by-side
2. Verify the top sections are identical
3. Only the table rendering should differ

### Strategy 4: Explicit Checklist in Response
When working with dual views, explicitly state:
```
Changes made to BOTH views:
✅ BillingView.tsx - Added Paid Via filter
✅ BillingViewSplit.tsx - Added Paid Via filter
```

## EXAMPLE: Adding "Paid Via" Filter

### ❌ WRONG APPROACH
```
1. Add paidViaFilter state to BillingView.tsx
2. Add Select dropdown to BillingView.tsx
3. Update filtering logic in BillingView.tsx
4. Mark task complete
```

### ✅ RIGHT APPROACH
```
1. Add paidViaFilter state to BillingView.tsx
2. Add paidViaFilter state to BillingViewSplit.tsx
3. Add Select dropdown to BillingView.tsx toolbar
4. Add Select dropdown to BillingViewSplit.tsx toolbar
5. Update filtering logic in BillingView.tsx
6. Update filtering logic in BillingViewSplit.tsx
7. Update "Clear filters" in BillingView.tsx
8. Update "Clear filters" in BillingViewSplit.tsx
9. Test both views
10. Mark task complete
```

## CODE STRUCTURE THAT SHOULD ALWAYS MATCH

```tsx
// ========== ALWAYS IDENTICAL IN BOTH FILES ==========

// 1. IMPORTS
import { useState } from 'react';
import { Search, Plus, ... } from 'lucide-react';
// ... all imports

// 2. TYPE DEFINITIONS
type InvoiceStatus = 'Paid' | 'Draft' | ...;
type PaymentMethod = 'Cash' | 'Venmo' | ...;

// 3. STATE VARIABLES
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
const [paidViaFilter, setPaidViaFilter] = useState<string>('all');
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
// ... all state

// 4. MOCK DATA
const invoices: Invoice[] = [ /* EXACT SAME DATA */ ];

// 5. HELPER FUNCTIONS
const handleSort = (column: string) => { /* EXACT SAME */ };
const getSortIcon = (column: string) => { /* EXACT SAME */ };
const formatCurrency = (amount: number) => { /* EXACT SAME */ };

// 6. FILTERING LOGIC
const filteredInvoices = invoices.filter(invoice => {
  /* EXACT SAME LOGIC */
});

// 7. SORTING LOGIC
const sortedInvoices = sortInvoices(filteredInvoices);

// 8. JSX - HEADER SECTION
<div className="flex items-center justify-between mb-6">
  {/* EXACT SAME */}
</div>

// 9. JSX - STATS CARDS
<div className="grid grid-cols-5 gap-4 mb-6">
  {/* EXACT SAME */}
</div>

// 10. JSX - TOOLBAR
<div className="flex items-center justify-between mb-4 pb-4 border-b">
  {/* EXACT SAME - Search, filters, buttons */}
</div>

// ========== ONLY DIFFERENCE: TABLE SECTION ==========

// BillingView.tsx: Single table with all invoices
<Card>
  <table>...</table>
  <TablePagination currentPage={currentPage} ... />
</Card>

// BillingViewSplit.tsx: Split into outstanding and paid
<Card>
  <table>/* Outstanding */</table>
  <TablePaginationCompact currentPage={outstandingCurrentPage} ... />
</Card>
<Card>
  <table>/* Paid */</table>
  <TablePaginationCompact currentPage={paidCurrentPage} ... />
</Card>

// ========== ALWAYS IDENTICAL AGAIN ==========

// 11. DIALOGS
<BulkSendDialog ... />
<SettingsDialog ... />
```

## ANSWER TO "WHY DOES THIS KEEP HAPPENING?"

This keeps happening because:
1. **Mental model issue:** Thinking of them as two separate files
2. **Workflow issue:** Editing one file completely before moving to the other
3. **No forcing function:** No automated check to ensure sync
4. **Comment clarity:** Files don't explicitly warn about dual view requirement

## WHAT TO DO TO PREVENT IN FUTURE

1. **Always use the think tool** to confirm dual view awareness before starting
2. **Add warning comments** to the top of BOTH files
3. **Explicit verification** in responses: "Updated BOTH BillingView.tsx and BillingViewSplit.tsx"
4. **Mental checklist:** "Does this file have a Split counterpart? If yes, edit both."
5. **Side-by-side editing:** Treat as a single file being edited in two places
6. **Final diff check:** Before completing, verify top sections are identical

## FILES AFFECTED BY THIS PROTOCOL

Current dual view pairs:
- `/components/views/BillingView.tsx` ↔️ `/components/views/BillingViewSplit.tsx`
- `/components/views/SignaturesView.tsx` ↔️ `/components/views/SignaturesViewSplit.tsx`

Future dual views:
- Any file ending in "Split" has a regular counterpart
- Apply this protocol to ALL dual view files

## COMMITMENT

**From now on, when working with dual view files:**
1. I will ALWAYS identify if a file has a dual view counterpart
2. I will ALWAYS make changes to BOTH files simultaneously
3. I will ALWAYS verify synchronization before completing
4. I will ALWAYS explicitly state in my response that both files were updated

This is not optional. This is MANDATORY for maintaining code quality and user experience.

---

**Status:** ACTIVE PROTOCOL
**Applies to:** All dual view file pairs
**Enforcement:** Every single edit to dual view files must follow this protocol
