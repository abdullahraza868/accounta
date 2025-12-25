# Billing Single/Split View Synchronization - Complete Guide

## ✅ PRINCIPLE COMMITTED TO MEMORY
**Single and Split views must ALWAYS stay in sync.** Any changes made to one view MUST be replicated to the other view.

---

## Recent Changes Applied to Single View (BillingView.tsx)

### 1. **Stat Card Reordering**
```
Order: Paid → Recently Paid → Unpaid → Overdue → Draft
```
- Moved "Recently Paid" to position 2 (after Paid)
- Moved "Draft" to the end (position 5)

### 2. **Draft Card Label**
- Changed from "Draft/Sent" to just "Draft"
- Still includes both 'Draft' and 'Sent to Client' statuses in the logic

### 3. **Invoices/Subscriptions Switcher**
- **Location**: Centered in the "Invoice List" row (between title and view toggle)
- **Styling**: 
  - Both buttons have equal width: `w-[120px]`
  - Larger size for visual weight: `px-4 py-2 text-sm`
  - Background container: `bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5`

### 4. **Smart Created/Sent Date Display**
- If created date === sent date: Show "Created & Sent" as one entry
- If different: Show separate "Created" and "Sent" entries with labels
- Uses `DateDisplayWithTooltip` for each date

### 5. **Smart Due/Paid Date Display Logic**
- **If paid BEFORE or ON due date**: Show only "Paid" date
- **If paid AFTER due date**: Show both "Due" and "Paid" dates
- **If not paid**: Show "Due" date with dash for unpaid
- **Custom Tooltip**: ALWAYS shows both dates:
  - "Due date: [formatted date]"
  - "Paid date @ [time]" (if paid)
- Uses `formatDate` from `useAppSettings()` hook

### 6. **New Invoice Test Data**
Added invoices with different created/sent dates to demonstrate the smart display:
- **Phoenix Consulting LLC** (id: '17'): Created 01-15-2025, Sent 01-22-2025
- **Nexus Technologies** (id: '18'): Created 02-01-2025, Sent 02-05-2025
- **Cascade Ventures** (id: '19'): Created 10-10-2024, Sent 10-18-2024

### 7. **Fixed Column Widths**
All table columns have explicit width classes to prevent shifting:
```
Client Name: w-[240px]
Invoice #: w-[160px]
Created / Sent: w-[160px]
Due / Paid: w-[160px]
Year: w-[80px]
Amount: w-[120px]
Paid Via: w-[140px]
Status: w-[180px]
Actions: w-[100px]
```

### 8. **BulkSendInvoicesDialog Date Formatting**
- Now uses `DateDisplayWithTooltip` component
- Respects date format settings from `AppSettingsContext`

---

## Changes Needed for Split View (BillingViewSplit.tsx)

### Priority 1: Critical Functionality

1. **Add `formatDate` from useAppSettings**
   ```tsx
   const { formatDate } = useAppSettings();
   ```

2. **Reorder Stat Cards**
   - Update the stat card order array to: [paid, recent, unpaid, overdue, draft]

3. **Change "Draft/Sent" to "Draft"**
   - Update stat card label
   - Maintain filter logic for both 'draft' and 'sent' statuses

4. **Add Invoices/Subscriptions Switcher**
   - Center it in the table header row (between "Invoice List" title and view toggle)
   - Use equal width buttons: `w-[120px]`
   - Same styling as single view

### Priority 2: Table Changes

5. **Implement Smart Created/Sent Date Display**
   - Add logic to check if created === sent
   - Show combined or separate entries accordingly

6. **Implement Smart Due/Paid Date Display**
   - Add logic to compare paid date vs due date
   - Show only paid if paid <= due
   - Show both if paid > due
   - Wrap in `TooltipProvider` with custom tooltip showing both dates

7. **Add New Test Invoice Data**
   - Add the same 3 new invoices (Phoenix, Nexus, Cascade) to demonstrate different created/sent dates

8. **Apply Fixed Column Widths**
   - Add explicit `w-[XXXpx]` classes to all table columns in BOTH tables (Outstanding and Paid)

### Priority 3: Dialog/Component Updates

9. **Update BulkSendInvoicesDialog** (if used in split view)
   - Ensure it uses `DateDisplayWithTooltip`
   - Respects `AppSettingsContext` settings

---

## Code Patterns to Follow

### Pattern 1: Smart Created/Sent Display
```tsx
{invoice.sentOn && invoice.created === invoice.sentOn ? (
  <div>
    <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Created & Sent</div>
    <DateDisplayWithTooltip date={invoice.created} time={invoice.createdTime} />
  </div>
) : (
  <div className="flex flex-col gap-1">
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Created</div>
      <DateDisplayWithTooltip date={invoice.created} time={invoice.createdTime} />
    </div>
    {invoice.sentOn && (
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Sent</div>
        <DateDisplayWithTooltip date={invoice.sentOn} time={invoice.sentTime} />
      </div>
    )}
  </div>
)}
```

### Pattern 2: Smart Due/Paid with Custom Tooltip
```tsx
<td className="px-4 py-4 w-[160px]">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          {(() => {
            const isPaid = invoice.paidAt !== undefined;
            const paidDate = invoice.paidAt ? new Date(invoice.paidAt) : null;
            const dueDate = new Date(invoice.dueDate);
            const paidBeforeOrOnDue = paidDate && paidDate <= dueDate;

            if (isPaid && paidBeforeOrOnDue) {
              return (
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Paid</div>
                  <span className="text-sm text-gray-900">{formatDate(invoice.paidAt!)}</span>
                </div>
              );
            } else {
              return (
                <div className="flex flex-col gap-1">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Due</div>
                    <span className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</span>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Paid</div>
                      <span className="text-sm text-gray-900">{formatDate(invoice.paidAt)}</span>
                    </div>
                  )}
                </div>
              );
            }
          })()}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <div className="text-xs space-y-1">
          <div><strong>Due date:</strong> {formatDate(invoice.dueDate)}</div>
          {invoice.paidAt && invoice.paidTime && (
            <div><strong>Paid date @</strong> {invoice.paidTime}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</td>
```

### Pattern 3: Invoices/Subscriptions Switcher
```tsx
{/* Centered Invoices/Subscriptions Switcher - Bigger for Visual Weight */}
<div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5">
  <button
    onClick={() => setActiveTab('invoices')}
    className={cn(
      "px-4 py-2 rounded text-sm transition-colors w-[120px]",
      activeTab === 'invoices'
        ? "text-white shadow-sm"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
    )}
    style={activeTab === 'invoices' ? { backgroundColor: 'var(--primaryColor)' } : {}}
  >
    Invoices
  </button>
  <button
    onClick={() => setActiveTab('subscriptions')}
    className={cn(
      "px-4 py-2 rounded text-sm transition-colors w-[120px]",
      activeTab === 'subscriptions'
        ? "text-white shadow-sm"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
    )}
    style={activeTab === 'subscriptions' ? { backgroundColor: 'var(--primaryColor)' } : {}}
  >
    Subscriptions
  </button>
</div>
```

---

## Checklist for Future Single/Split Sync

When making changes to either view:

- [ ] Apply changes to BOTH files
- [ ] Test both views to ensure functionality is identical
- [ ] Check that all filters work the same way
- [ ] Verify pagination works correctly in both
- [ ] Ensure tooltips display identically
- [ ] Confirm date formatting respects AppSettingsContext in both
- [ ] Check responsive behavior (if applicable)
- [ ] Verify dark mode styling matches
- [ ] Test all interactive elements (buttons, dropdowns, dialogs)

---

## Summary of Single View Changes (BillingView.tsx) ✅

| Change | Status | Description |
|--------|--------|-------------|
| Stat Card Reorder | ✅ DONE | Paid → Recently Paid → Unpaid → Overdue → Draft |
| Draft Label | ✅ DONE | Changed "Draft/Sent" to "Draft" |
| Invoices/Subscriptions | ✅ DONE | Centered, equal width buttons (120px each) |
| Smart Created/Sent | ✅ DONE | Combined display when dates match |
| Smart Due/Paid | ✅ DONE | Show only paid if paid <= due, both if paid > due |
| Custom Tooltip | ✅ DONE | Always shows "Due date:" and "Paid date @" |
| Test Data | ✅ DONE | Added 3 invoices with different created/sent dates |
| Column Widths | ✅ DONE | All columns have explicit width classes |
| Bulk Send Dialog | ✅ DONE | Uses DateDisplayWithTooltip with AppSettings |

## Summary of Split View Changes (BillingViewSplit.tsx) ⏳

| Change | Status | Description |
|--------|--------|-------------|
| Stat Card Reorder | ⏳ TODO | Need to update order array |
| Draft Label | ⏳ TODO | Need to change "Draft/Sent" to "Draft" |
| Invoices/Subscriptions | ⏳ TODO | Need to add centered switcher |
| Smart Created/Sent | ⏳ TODO | Need to implement combined display logic |
| Smart Due/Paid | ⏳ TODO | Need to implement smart date display |
| Custom Tooltip | ⏳ TODO | Need to add tooltip with all date info |
| Test Data | ⏳ TODO | Need to add same 3 new invoices |
| Column Widths | ⏳ TODO | Need explicit widths for BOTH tables |
| Bulk Send Dialog | ⏳ TODO | Check if exists, update if needed |

---

## Files Modified

1. `/components/views/BillingView.tsx` - ✅ All changes applied
2. `/components/BulkSendInvoicesDialog.tsx` - ✅ Updated to use AppSettings
3. `/components/views/BillingViewSplit.tsx` - ⏳ Needs all changes applied

---

**Remember: Every change to Billing functionality must be applied to BOTH single and split views!**
