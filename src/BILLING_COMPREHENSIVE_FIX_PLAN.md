# Billing Views Comprehensive Fix Plan

## Issues to Fix

### 1. **Stat Card Reordering - BROKEN**
**Current Issue:** The stat card reorder is using incorrect data structure and move function
**Fix Required:**
- Store card order as array of card IDs (strings), not indexes
- Use proper moveCard function from signatures
- Save to localStorage with key 'billingCardOrder'
- Default order: ['paid', 'unpaid', 'overdue', 'draft', 'recent']

### 2. **Stat Card Colors - INCORRECT**
**Current Issue:** Colors are strings like 'green', 'purple' but need to be actual color values
**Fix Required:**
```typescript
color: '#16a34a', // not 'green'
bgColor: 'rgb(220, 252, 231)', // not 'green-50'
```

### 3. **Date Filter Visual Grouping - MISSING**
**Current Issue:** Date filter buttons are not visually grouped
**Fix Required:**
```tsx
<div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
  {/* All date filter buttons here */}
</div>
```

### 4. **Padding Under Toolbar Line - MISSING**
**Current Issue:** No pt-6 on the section after toolbar
**Fix Required:**
```tsx
{/* Table Section - Above the actual table */}
<div className="flex items-center justify-between mb-6 pt-6">  {/* ADD pt-6 */}
```

### 5. **Created/Sent Date Consolidation - NOT IMPLEMENTED**
**Current Issue:** Created and Sent always show separately
**Fix Required:**
- If `created === sentOn`, show them combined on one line
- Tooltip shows both with times:
  ```
  created: DD-MM-YYYY @ HH:MM AM
  sent: DD-MM-YYYY @ HH:MM AM
  ```

### 6. **Same Data in Both Views - NEEDS VERIFICATION**
**Status:** Data appears to be shared already, but needs to be exported to a shared file
**Fix Required:**
- Create `/data/invoices.ts` with shared invoice data
- Both BillingView and BillingViewSplit import from same file

### 7. **Apply All Changes to Both Views**
**Required:** All fixes above must be applied to BOTH:
- `/components/views/BillingView.tsx`
- `/components/views/BillingViewSplit.tsx`

## Implementation Order

1. Fix stat card configurations (colors, getValue functions)
2. Fix card reordering logic (use proper DnD from signatures)
3. Add visual grouping to date filters
4. Add pt-6 padding after toolbar
5. Implement created/sent date consolidation logic
6. Extract shared invoice data to separate file
7. Apply all changes to BillingViewSplit.tsx

## Reference Files

- **Signatures for Drag & Drop:** `/components/views/SignaturesView.tsx` (lines 571-578 for moveCard)
- **Signatures for Padding:** Check spacing between toolbar and "Signature List" section
- **Date Format:** `/components/DateDisplayWithTooltip.tsx` (already fixed for tooltip)

## Specific Code Snippets Needed

### Proper moveCard Function
```typescript
const moveCard = (dragIndex: number, hoverIndex: number) => {
  const newOrder = [...cardOrder];
  const [removed] = newOrder.splice(dragIndex, 1);
  newOrder.splice(hoverIndex, 0, removed);
  setCardOrder(newOrder);
  localStorage.setItem('billingCardOrder', JSON.stringify(newOrder));
};
```

### Card Order State
```typescript
const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
  const saved = localStorage.getItem('billingCardOrder');
  return saved ? JSON.parse(saved) : ['paid', 'unpaid', 'overdue', 'draft', 'recent'];
});
```

### Stat Card Configs Object (not array)
```typescript
const cardConfigs: Record<StatCardType, StatCardConfig> = {
  paid: {
    id: 'paid',
    label: 'Paid',
    count: `${paidInvoices.length} invoices`,
    icon: <Check className=\"w-4.5 h-4.5 text-green-600\" />,
    color: '#16a34a',
    bgColor: 'rgb(220, 252, 231)',
    getValue: (stats) => stats.paid,
  },
  // ... rest of configs
};
```

### Rendering Cards
```tsx
<div className=\"grid grid-cols-5 gap-4 mb-6\">
  {cardOrder.map((cardId, index) => (
    <DraggableStatCard
      key={cardId}
      config={cardConfigs[cardId]}
      index={index}
      stats={stats}
      statusFilter={statusFilter}
      onFilterChange={handleFilterChange}
      moveCard={moveCard}
    />
  ))}
</div>
```
