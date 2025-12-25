# ✅ TABLE TOOLBAR LAYOUT STANDARD - COMMITTED TO MEMORY

## **Standard Toolbar Layout for ALL Table Pages**

All table-based pages (Signatures, Billing, etc.) MUST follow this standardized toolbar layout pattern.

---

## **Layout Structure**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Summary Cards - Draggable Stats]                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  LEFT SIDE                          │  RIGHT SIDE                   │
│  • Search                           │  • Primary Action Button      │
│  • Filters/Tabs                     │  • Manage Templates           │
│  • Clear Filters (if active)        │  • Bulk Actions               │
│                                     │  • Settings                   │
└─────────────────────────────────────────────────────────────────────┘

[Table Content Below]
```

---

## **Implementation Pattern**

### **1. Summary Cards (Top Section)**
- Placed immediately after page header
- Draggable stat cards
- Grid layout (usually 5 columns)
- Clickable to filter

### **2. Toolbar (Below Cards)**
```tsx
<div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
  {/* LEFT SIDE: Filters & Search */}
  <div className="flex items-center gap-3">
    {/* Tabs or filter buttons */}
    {/* Date filter dropdown */}
    {/* Search input */}
    {/* Clear filters button (conditional) */}
  </div>

  {/* RIGHT SIDE: Action Buttons */}
  <div className="flex gap-2">
    {/* Primary action with primary color background */}
    <Button
      size="sm"
      className="gap-2"
      style={{ backgroundColor: 'var(--primaryColor)' }}
    >
      <Plus className="w-4 h-4" />
      New [Item]
    </Button>
    
    {/* Secondary action - Manage Templates */}
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      style={{
        borderColor: 'var(--primaryColor)',
        color: 'var(--primaryColor)'
      }}
    >
      <FileText className="w-4 h-4" />
      Manage Templates
    </Button>
    
    {/* Bulk action with badge (if applicable) */}
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50"
    >
      <MailPlus className="w-3.5 h-3.5" />
      Bulk [Action]
      {count > 0 && (
        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 ...">
          {count}
        </Badge>
      )}
    </Button>
    
    {/* Settings button */}
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0"
    >
      <Settings className="w-4 h-4" />
    </Button>
  </div>
</div>
```

---

## **Standard Button Labels**

### **Signatures Page:**
- ✅ "New Signature" (primary)
- ✅ "Manage Templates" (secondary)
- ✅ "Bulk Resend" (bulk action)
- ✅ Settings icon (settings)

### **Billing Page:**
- ✅ "Add Invoice" (primary)
- ✅ "Manage Templates" (secondary)
- ✅ "Bulk Send" (bulk action for overdue)
- ✅ Settings icon (settings)

### **Other Pages:**
- Use descriptive action verbs: "Add", "New", "Create"
- Always use "Manage Templates" (not "Templates")
- Bulk actions: "Bulk [Action Name]"

---

## **Left Side Components**

### **Search Input**
```tsx
<div className="relative w-64">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-9 h-8 text-sm"
  />
</div>
```

### **Filter Tabs/Buttons**
```tsx
<div className="flex items-center gap-1">
  <button
    onClick={() => setActiveTab('tab1')}
    className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
      activeTab === 'tab1'
        ? "bg-purple-100 text-purple-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    <Icon className="w-4 h-4" />
    Tab Name
  </button>
</div>
```

### **Dropdown Filters**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-8">
      <span className="text-xs">{filterValue}</span>
      <ChevronDown className="w-3 h-3 ml-1.5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="w-48">
    {/* Options */}
  </DropdownMenuContent>
</DropdownMenu>
```

### **Clear Filters Button (Conditional)**
```tsx
{hasActiveFilters && (
  <button
    onClick={clearAllFilters}
    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
  >
    Clear filters
  </button>
)}
```

---

## **Right Side Components**

### **Primary Action Button**
- Uses `var(--primaryColor)` background
- Size: `sm`
- Icon + Text
- Usually: Add, New, Create

```tsx
<Button
  size="sm"
  className="gap-2"
  style={{ backgroundColor: 'var(--primaryColor)' }}
  onClick={handlePrimaryAction}
>
  <Plus className="w-4 h-4" />
  Add [Item]
</Button>
```

### **Manage Templates Button**
- Always labeled "Manage Templates" (NOT "Templates")
- Outline variant
- Primary color border and text
- Size: `sm`

```tsx
<Button
  variant="outline"
  size="sm"
  className="gap-2"
  style={{
    borderColor: 'var(--primaryColor)',
    color: 'var(--primaryColor)'
  }}
  onClick={() => navigate('/templates-page')}
>
  <FileText className="w-4 h-4" />
  Manage Templates
</Button>
```

### **Bulk Action Button**
- Outline variant with specific color (usually orange for resend/send)
- Badge showing count (positioned absolutely)
- Size: `sm`
- Icon + Text

```tsx
<Button
  variant="outline"
  size="sm"
  className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 text-xs gap-1.5"
  onClick={handleBulkAction}
  title="Bulk Action Description"
>
  <MailPlus className="w-3.5 h-3.5" />
  Bulk [Action]
  {count > 0 && (
    <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
      {count}
    </Badge>
  )}
</Button>
```

### **Settings Button**
- Outline variant
- Icon only (no text)
- Size: `sm` with square dimensions (h-9 w-9)

```tsx
<Button
  variant="outline"
  size="sm"
  className="h-9 w-9 p-0"
  onClick={() => setShowSettingsDialog(true)}
  title="Settings"
>
  <Settings className="w-4 h-4" />
</Button>
```

---

## **Complete Example (Signatures Pattern)**

```tsx
{/* Toolbar */}
<div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">
    {/* Tabs */}
    <div className="flex items-center gap-1">
      <button
        onClick={() => setActiveTab('invoices')}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
          activeTab === 'invoices'
            ? "bg-purple-100 text-purple-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        <FileText className="w-4 h-4" />
        Invoices
      </button>
    </div>

    {/* Date Filter */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <span className="text-xs">{dateFilter}</span>
          <ChevronDown className="w-3 h-3 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => setDateFilter('All Dates')}>All Dates</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDateFilter('This Month')}>This Month</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Search */}
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 h-8 text-sm"
      />
    </div>

    {/* Clear Filters */}
    {statusFilter !== 'all' && (
      <button
        onClick={() => setStatusFilter('all')}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
      >
        Clear filters
      </button>
    )}
  </div>

  {/* RIGHT SIDE */}
  <div className="flex gap-2">
    <Button
      size="sm"
      className="gap-2"
      style={{ backgroundColor: 'var(--primaryColor)' }}
      onClick={() => setShowNewDialog(true)}
    >
      <Plus className="w-4 h-4" />
      New Signature
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      style={{
        borderColor: 'var(--primaryColor)',
        color: 'var(--primaryColor)'
      }}
      onClick={() => navigate('/signature-templates')}
    >
      <FileText className="w-4 h-4" />
      Manage Templates
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50 text-xs gap-1.5"
      onClick={() => setShowBulkDialog(true)}
    >
      <MailPlus className="w-3.5 h-3.5" />
      Bulk Resend
      {overdueCount > 0 && (
        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white">
          {overdueCount}
        </Badge>
      )}
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0"
      onClick={() => setShowSettingsDialog(true)}
    >
      <Settings className="w-4 h-4" />
    </Button>
  </div>
</div>
```

---

## **Key Principles**

1. ✅ **Left-Right Split**: Filters/search LEFT, actions RIGHT
2. ✅ **Consistent Spacing**: `gap-2` between buttons, `gap-3` for left items
3. ✅ **Primary Color Integration**: Use `var(--primaryColor)` for primary action
4. ✅ **"Manage Templates" Label**: Always use this exact text
5. ✅ **Badge Position**: Absolute positioning on bulk action buttons
6. ✅ **Icon Sizes**: `w-4 h-4` for main icons, `w-3.5 h-3.5` for smaller
7. ✅ **Button Heights**: `h-8` or `h-9` for consistency

---

## **Pages Updated**

- ✅ `/components/views/SignaturesViewSplit.tsx`
- 🔄 `/components/views/BillingView.tsx` - In progress
- 🔄 `/components/views/BillingViewSplit.tsx` - In progress

---

## **ALWAYS REMEMBER**

> **Filters and search on the LEFT**
> 
> **Action buttons on the RIGHT**
> 
> **"Manage Templates" - never just "Templates"**

This is now the standard and must be followed for all future table pages!

---

**Last Updated**: October 30, 2025
