# Table List Header Spacing Standard

## 📅 Last Updated: 2025-01-30

## Overview
This standard defines the spacing between the "List Header" section (title + view toggle) and the table itself.

---

## ✅ Standard: mb-6 Spacing

The section containing the table title, count badge, and view toggle buttons should have **`mb-6`** (1.5rem / 24px) margin bottom before the table begins.

### Correct Implementation

```tsx
{/* Table Section - Above the actual table */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-2">
    <h3 className="text-gray-900 dark:text-gray-100">Invoice List</h3>
    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
      {filteredInvoices.length}
    </Badge>
  </div>
  
  {/* View Toggle */}
  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
    <Button
      size="sm"
      className="gap-1.5 h-7 px-3 text-xs text-white"
      style={{ backgroundColor: 'var(--primaryColor)' }}
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      Single View
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 h-7 px-3 text-xs text-gray-600 dark:text-gray-400"
      onClick={() => navigate('/path/split')}
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      Split View
    </Button>
  </div>
</div>

{/* Table */}
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  {/* ... table content ... */}
</Card>
```

---

## ❌ Common Mistakes

### Mistake #1: Using mb-3 (Too Small)
```tsx
<div className="flex items-center justify-between mb-3">  {/* ❌ Wrong */}
```
**Impact:** Table feels cramped and visually compressed.

### Mistake #2: No Spacing
```tsx
<div className="flex items-center justify-between">  {/* ❌ Wrong */}
```
**Impact:** Table header touches list header, looks messy.

---

## 🎯 Apply To

This standard should be applied to ALL table pages including:

### ✅ Already Applied
- [x] BillingView.tsx
- [x] SignaturesView.tsx

### ⚠️ Needs Review/Update
- [ ] ClientManagementView.tsx
- [ ] Form8879View.tsx  
- [ ] SignatureTemplatesView.tsx
- [ ] IncomingDocumentsView.tsx
- [ ] All client folder tabs with tables
- [ ] All team member tabs with tables
- [ ] All company settings tabs with tables

---

## 📐 Visual Spacing Guide

```
┌─────────────────────────────────────────────────────────┐
│  [Toolbar with filters and action buttons]             │
└─────────────────────────────────────────────────────────┘
                         ↓ py-4 (from toolbar)
┌─────────────────────────────────────────────────────────┐
│  Invoice List [123]           [Single View] [Split View]│ ← List Header
└─────────────────────────────────────────────────────────┘
                         ↓ mb-6 (24px) ← STANDARD
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐  │
│  │ Table Header (Primary Color Background)          │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ Table Rows...                                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Related Standards

- **TABLE_HEADER_STYLING_STANDARD.md** - Primary color background (not gradient)
- **TABLE_VIEW_TOGGLE_STANDARD.md** - View toggle button styling
- **TABLE_TOOLBAR_LAYOUT_STANDARD.md** - Toolbar above list header

---

## 💡 Design Rationale

**Why mb-6?**
- Provides visual breathing room between sections
- Maintains hierarchy (toolbar → list header → table)
- Matches spacing used in design system for section breaks
- Prevents visual cramping

**Why not mb-3?**
- Too tight, table feels compressed
- Doesn't provide enough visual separation
- Makes the interface feel cluttered

**Why not mb-8 or higher?**
- Too much white space
- Wastes vertical screen real estate
- Makes sections feel disconnected

---

## ✅ Quality Checklist

When implementing table pages, verify:
- [ ] List header section has `mb-6` class
- [ ] Title (h3) is styled with `text-gray-900 dark:text-gray-100`
- [ ] Count badge uses blue-50 background with blue-700 text
- [ ] View toggle buttons are present (if applicable)
- [ ] Spacing feels balanced and not cramped
- [ ] Matches reference pages (Billing, Signatures)

---

## 📝 Examples

### BillingView (Reference Implementation)
```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-2">
    <h3 className="text-gray-900 dark:text-gray-100">Invoice List</h3>
    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
      {filteredInvoices.length}
    </Badge>
  </div>
  
  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
    {/* View toggle buttons */}
  </div>
</div>
```

### SignaturesView (Reference Implementation)
```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-2">
    <h3 className="text-gray-900 dark:text-gray-100">Signature Requests</h3>
    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
      {signatureRequests.length}
    </Badge>
  </div>
  
  <div className="flex items-center gap-3">
    {/* View toggle + Settings button */}
  </div>
</div>
```

---

**Standard Status:** ✅ Active  
**Enforcement:** Required for all table pages  
**Last Audit:** 2025-01-30
