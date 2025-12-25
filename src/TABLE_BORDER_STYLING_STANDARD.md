# Table Border Styling Standard

## Overview
This document defines the standard border styling for tables across the application. All tables MUST have visible borders following these patterns for consistency and professional appearance.

## Standard Patterns

### 1. Standard Table Card Border

**For Regular Tables (Active/Pending sections):**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  {/* Table content */}
</Card>
```

**Key Properties:**
- Border: `border-gray-200/60` (light mode), `dark:border-gray-700` (dark mode)
- Shadow: `shadow-sm` for subtle elevation
- Overflow: `overflow-hidden` to contain rounded corners

### 2. Completed Section (Green Theme)

**For Completed/Success sections:**
```tsx
<div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
  <Card className="border-0 shadow-none bg-transparent">
    {/* Table content */}
  </Card>
</div>
```

**Key Properties:**
- **Wrapper div:**
  - Background: `bg-green-50/30` (light), `dark:bg-green-900/10` (dark)
  - Border: `border-green-200/40` (light), `dark:border-green-800/40` (dark)
  - Rounded: `rounded-lg`
  - Overflow: `overflow-hidden`

- **Inner Card:**
  - No border: `border-0`
  - No shadow: `shadow-none`
  - Transparent background: `bg-transparent`

### 3. Loading State Card

**For loading indicators:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm p-12">
  <div className="flex flex-col items-center justify-center gap-3">
    {/* Loading spinner */}
  </div>
</Card>
```

### 4. Empty State Card

**For "no results" messages:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm p-12">
  <div className="flex flex-col items-center justify-center gap-3">
    {/* Empty state icon and message */}
  </div>
</Card>
```

## Border Opacity Values

### Standard Borders
- **Light mode:** `border-gray-200/60` (60% opacity)
- **Dark mode:** `dark:border-gray-700` (full opacity)

### Green Theme Borders
- **Light mode:** `border-green-200/40` (40% opacity)
- **Dark mode:** `dark:border-green-800/40` (40% opacity)

## Background Colors

### Standard Card
- Uses default Card background (no custom background needed)

### Green Theme Wrapper
- **Light mode:** `bg-green-50/30` (30% opacity)
- **Dark mode:** `dark:bg-green-900/10` (10% opacity)

## Shadow Standards

### Standard Tables
- Use: `shadow-sm` (subtle shadow)

### Nested Cards (Green Theme)
- No shadow: `shadow-none`

## Implementation Examples

### Example 1: Signatures View (Admin)
```tsx
{/* Active Signatures */}
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed">
      {/* Table content */}
    </table>
  </div>
</Card>

{/* Completed Signatures */}
<div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
  <Card className="border-0 shadow-none bg-transparent">
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        {/* Table content */}
      </table>
    </div>
  </Card>
</div>
```

### Example 2: Billing View
```tsx
{/* Unpaid Invoices */}
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <table className="w-full table-fixed">
    {/* Table content */}
  </table>
</Card>

{/* Paid Invoices */}
<div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
  <Card className="border-0 shadow-none bg-transparent">
    <table className="w-full table-fixed">
      {/* Table content */}
    </table>
  </Card>
</div>
```

### Example 3: Client Portal
```tsx
{/* Active Section */}
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed">
      {/* Table content */}
    </table>
  </div>
</Card>

{/* Completed Section */}
<div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
  <table className="w-full table-fixed">
    {/* Table content */}
  </table>
</div>
```

## Common Mistakes to Avoid

### ❌ WRONG - No Border
```tsx
<Card className="shadow-sm overflow-hidden">
  {/* Missing border classes */}
</Card>
```

### ❌ WRONG - Using branding.colors for borders
```tsx
<Card 
  className="border shadow-sm"
  style={{ borderColor: branding.colors.borderColor }}
>
  {/* Don't use inline styles for borders */}
</Card>
```

### ❌ WRONG - Incorrect opacity
```tsx
<Card className="border border-gray-200 dark:border-gray-700">
  {/* Should be border-gray-200/60 for proper transparency */}
</Card>
```

### ✅ CORRECT - Standard Border
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  {/* Proper border with opacity and shadow */}
</Card>
```

## Verification Checklist

When implementing tables, verify:

- [ ] Table Card has `border border-gray-200/60 dark:border-gray-700`
- [ ] Table Card has `shadow-sm`
- [ ] Table Card has `overflow-hidden`
- [ ] Completed sections use green theme wrapper
- [ ] Green theme wrapper has proper border opacity (40%)
- [ ] Inner Card in green wrapper has `border-0 shadow-none bg-transparent`
- [ ] No inline `borderColor` styles are used
- [ ] Border is visible in both light and dark modes

## Files Using This Standard

### Admin Views
- `/components/views/SignaturesViewSplit.tsx`
- `/components/views/BillingViewSplit.tsx`
- `/components/views/ClientManagementView.tsx`

### Client Portal
- `/pages/client-portal/signatures/ClientPortalSignatures.tsx`
- `/pages/client-portal/invoices/ClientPortalInvoices.tsx`
- `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`

## Related Standards
- [Table Header Styling Standard](./TABLE_HEADER_STYLING_STANDARD.md)
- [Table Pagination Standard](./guidelines/TABLE_PAGINATION_PLACEMENT_STANDARD.md)
- [Design System Reference](./DESIGN_SYSTEM_REFERENCE.md)

## Updates
- **2024-11-02:** Initial standard created
- **2024-11-02:** Applied to Client Portal Signatures page

---

**Remember:** ALL tables must have visible borders. No exceptions. This is a core design standard that ensures visual consistency and professional appearance across the entire application.
