# Table Header Quick Reference Card

## ✅ THE CORRECT PATTERN (Copy This!)

```tsx
{/* Table Header Section */}
<div className="flex items-center justify-between mb-6">
  
  {/* ▼ LEFT SIDE ▼ */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <h3 className="text-gray-900 dark:text-gray-100">Table Name</h3>
      <Badge variant="outline" className="...">
        {count}
      </Badge>
    </div>
    
    {/* Optional: Tabs/Filters go HERE (inside left container) */}
  </div>
  
  {/* ▼ RIGHT SIDE ▼ */}
  <div className="flex items-center gap-3">
    
    {/* 1️⃣ FIRST: Items Per Page */}
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
    
    {/* 2️⃣ SECOND: View Toggle */}
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
        onClick={() => {/* Navigate to split */}}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Split View
      </Button>
    </div>
    
  </div>
</div>
```

## ⚠️ CRITICAL RULES

### Rule #1: EXACTLY 2 Direct Children
```tsx
<div className="flex justify-between">
  <div>{/* LEFT: All left items grouped */}</div>
  <div>{/* RIGHT: All right items grouped */}</div>
</div>
```

❌ **NEVER** have 3+ direct children (causes centering!)

### Rule #2: Correct Order
```
[Items Per Page] [View Toggle]  ✅ CORRECT
[View Toggle] [Items Per Page]  ❌ WRONG
```

Items Per Page ALWAYS comes BEFORE View Toggle!

### Rule #3: Gap Sizes
- **Outer container:** `justify-between mb-6`
- **Left container:** `gap-4` (between title and tabs)
- **Right container:** `gap-3` (between items/page and toggle)
- **Title section:** `gap-2` (between title and badge)

## 📋 Pre-Commit Checklist

Before committing any table header:

- [ ] Outer container has `justify-between`
- [ ] Outer container has EXACTLY 2 direct children
- [ ] Left side groups: title, badge, tabs
- [ ] Right side has items per page FIRST
- [ ] Right side has view toggle SECOND
- [ ] Gap sizes are correct (4, 3, 2)
- [ ] Tested in browser (no centering)

## 🔍 Visual Check

### What You Should See:
```
┌──────────────────────────────────────────────────────┐
│ Table Name (123)   📋 Tabs      [25/page] [Single|Split] │
│ ↑                  ↑             ↑         ↑          │
│ Left               Left          Right     Right      │
│ Title              Tabs          Items     Toggle     │
└──────────────────────────────────────────────────────┘
```

### What You Should NOT See:
```
┌──────────────────────────────────────────────────────┐
│ Table Name         📋 Tabs           [Single] [25/page] │
│                        ↑                  ↑            │
│                     CENTERED!         WRONG ORDER!     │
└──────────────────────────────────────────────────────┘
```

## 🚫 Common Mistakes

### Mistake #1: Three Direct Children
```tsx
❌ WRONG:
<div className="flex justify-between">
  <div>Title</div>
  <div>Tabs</div>      {/* This gets CENTERED! */}
  <div>Controls</div>
</div>

✅ CORRECT:
<div className="flex justify-between">
  <div>
    <div>Title</div>
    <div>Tabs</div>    {/* Grouped together */}
  </div>
  <div>Controls</div>
</div>
```

### Mistake #2: Wrong Order
```tsx
❌ WRONG:
<div className="flex items-center gap-3">
  <ViewToggle />
  <ItemsPerPage />
</div>

✅ CORRECT:
<div className="flex items-center gap-3">
  <ItemsPerPage />
  <ViewToggle />
</div>
```

### Mistake #3: Wrong Gap
```tsx
❌ WRONG:
<div className="flex items-center gap-2">  {/* Too small! */}
  <ItemsPerPage />
  <ViewToggle />
</div>

✅ CORRECT:
<div className="flex items-center gap-3">  {/* Correct! */}
  <ItemsPerPage />
  <ViewToggle />
</div>
```

## 📚 Reference Files

**Current Page:** Quick Reference  
**Full Standard:** `/guidelines/TABLE_ITEMS_PER_PAGE_PLACEMENT_STANDARD.md`  
**Audit Checklist:** `/guidelines/TABLE_GLOBAL_CONSISTENCY_AUDIT.md`  
**Flex Rule:** `/guidelines/FLEX_LAYOUT_JUSTIFY_BETWEEN_RULE.md`  
**Latest Fix:** `/ITEMS_PER_PAGE_ORDER_FIX_COMPLETE.md`

## 🎯 Reference Implementation

**Best Example:** `/components/views/SignaturesViewSplit.tsx` (lines 1437-1497)

This file shows the perfect implementation:
- ✅ 2 direct children
- ✅ Items per page FIRST
- ✅ View toggle SECOND  
- ✅ Correct gaps
- ✅ Proper grouping

**Also Correct:** `/components/views/BillingView.tsx` and `/components/views/BillingViewSplit.tsx` (after latest fix)

## 💡 Quick Tips

1. **When in doubt:** Copy from SignaturesViewSplit.tsx
2. **Before coding:** Count your direct children (must = 2)
3. **After coding:** Test in browser for centering
4. **Remember:** Items → Toggle (alphabetical!)
5. **Think:** What before How (items = what to show, toggle = how to show)

## 🧪 Self-Test

**Question:** What's wrong with this code?
```tsx
<div className="flex justify-between mb-6">
  <h3>Invoices</h3>
  <div>
    <button>Invoices</button>
    <button>Subscriptions</button>
  </div>
  <div>
    <ViewToggle />
    <ItemsPerPage />
  </div>
</div>
```

**Answers:**
1. ❌ 3 direct children (will cause centering)
2. ❌ Wrong order (toggle before items)
3. ❌ No badge with title
4. ❌ No gap specified in containers

**Fixed Version:**
```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <h3>Invoices</h3>
      <Badge>{count}</Badge>
    </div>
    <div>
      <button>Invoices</button>
      <button>Subscriptions</button>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <ItemsPerPage />
    <ViewToggle />
  </div>
</div>
```

---

**Last Updated:** Latest fix  
**Mandatory:** YES  
**Applies To:** ALL table headers with dual controls  

**Remember:** [Items/Page] → [View Toggle] (always in this order!)
