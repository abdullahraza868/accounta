# Billing Table Synchronization - Complete ✅

## Changes Applied to BOTH Views

### 1. Combined Invoice # / Year Column ✅
**Single View & Split View:**
- Header: `Invoice # / Year` with width `w-[200px]`
- Cell content shows Invoice # with year underneath
- Year displayed as: `Year: {invoice.year}` in small gray text
- Removed separate Year column

### 2. Document Hover Preview Updated ✅
**Single View & Split View:**
- Preview tooltip now includes year in the preview
- Added line: `Year: {invoice.year}` in preview card

### 3. Paid Late Indicator ✅
**Single View & Split View:**
- When invoice is paid after due date, shows "LATE" badge
- Badge styling: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`
- Positioned next to "Paid" label in Due/Paid column
- Only appears when both Due and Paid dates are shown

## Table Structure - Now Identical

### Headers (Both Views)
1. Client Name - `w-[240px]`
2. **Invoice # / Year** - `w-[200px]` ⭐ Combined
3. Created / Sent - `w-[160px]`
4. Due / Paid - `w-[160px]`
5. Amount - `w-[120px]`
6. Paid Via - `w-[140px]`
7. Status - `w-[180px]`
8. Actions - `w-[100px]`

### Key Cell Content (Both Views)

#### Invoice # / Year Cell
```tsx
<div className="flex items-center gap-2">
  {/* Document Icon with Preview */}
  <div className="relative group/preview">
    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
      📄
    </div>
    {/* Preview includes year */}
    <div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block pointer-events-none">
      {/* ... preview content with year ... */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Year: {invoice.year}</p>
    </div>
  </div>
  <div className="flex flex-col">
    <div className="flex items-center gap-1.5">
      <button onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')} className="text-xs text-gray-900 dark:text-gray-100 hover:underline">
        {invoice.invoiceNo || 'Draft'}
      </button>
      {isRecentlyCreated(invoice.created) && (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-1 py-0 h-3.5">NEW</Badge>
      )}
    </div>
    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Year: {invoice.year}</span>
  </div>
</div>
```

#### Due / Paid Cell (When Paid Late)
```tsx
{invoice.paidAt && (
  <div>
    <div className="flex items-center gap-1">
      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Paid</div>
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[9px] px-1 py-0 h-3.5 font-medium">LATE</Badge>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {formatDate(invoice.paidAt)}
      </span>
      {isRecentlyPaid(invoice.paidAt) && (
        <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-0.5" />
      )}
    </div>
  </div>
)}
```

## New Principle Document Created ✅

Created: `/guidelines/TABLE_DUAL_VIEW_SYNC_PRINCIPLE.md`

This document establishes the principle that:
- ALL table changes must be applied to BOTH views simultaneously
- Prevents duplicate work
- Ensures consistency
- Simplifies testing and maintenance

## Files Modified
1. `/components/views/BillingView.tsx` - Single view updated
2. `/components/views/BillingViewSplit.tsx` - Split view updated
3. `/guidelines/TABLE_DUAL_VIEW_SYNC_PRINCIPLE.md` - New principle document

## Testing Checklist
- [x] Both views have same column headers
- [x] Both views have matching column widths
- [x] Both views show Invoice # with year underneath
- [x] Both views removed separate Year column
- [x] Both views show "LATE" badge for paid late invoices
- [x] Both views include year in document preview
- [x] Table widths are properly balanced

## Next Steps
From now on, any billing table changes should reference the sync principle document and be applied to both views simultaneously.
