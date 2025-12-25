# ✅ TABLE STANDARDS - MASTER CHECKLIST

## **Complete Checklist for ALL Tables in the Application**

This is the master reference for creating or updating any table. All standards listed here are **MANDATORY** and committed to memory.

---

## **📋 Pre-Implementation Checklist**

Before creating or updating ANY table, review these standards:

- [ ] Read `/TABLE_CLIENT_CELL_STANDARD.md` - Client name display
- [ ] Read `/TABLE_DATE_TIME_FORMAT_STANDARD.md` - Date/time display
- [ ] Read `/TABLE_BORDER_STYLING_STANDARD.md` - **Border styling (REQUIRED)**
- [ ] Read `/DESIGN_SYSTEM_REFERENCE.md` - Status badges
- [ ] Read `/TABLE_PAGINATION_CHECKLIST.md` - Pagination implementation

---

## **1️⃣ CLIENT CELL DISPLAY** ⭐

### **Component to Use:**
```tsx
import { ClientCellDisplay } from '../ClientCellDisplay';
```

### **Implementation:**
```tsx
<td className="p-3 w-[260px]">
  <ClientCellDisplay 
    clientId={record.clientId}
    clientName={record.clientName}
    clientType="Business"  // or "Individual"
    onNameClick={() => console.log('Optional action')}
  />
</td>
```

### **Features:**
- ✅ Color-coded avatar (Blue = Business, Green = Individual)
- ✅ Clickable name (optional custom action)
- ✅ Hover-visible folder link icon
- ✅ Uses `var(--primaryColor)` for link icon

### **❌ DON'T:**
- Use `ClientNameWithLink` (deprecated)
- Create inline client name displays
- Hardcode purple colors

---

## **2️⃣ DATE/TIME DISPLAY** ⭐

### **Components to Use:**
```tsx
import { DateTimeDisplay, DateDisplay } from '../DateTimeDisplay';
```

### **Implementation:**
```tsx
// For columns with date AND time
<td className="p-3 w-[160px]">
  <DateTimeDisplay date={record.createdAt} />
</td>

// For columns with date ONLY
<td className="p-3 w-[140px]">
  <DateDisplay date={record.dueDate} />
</td>
```

### **Visual Format:**
```
10-30-2025  ← Date (larger text)
2:45 PM     ← Time (smaller, gray text)
```

### **Features:**
- ✅ Automatically uses Application Settings for format
- ✅ Respects user's date format preference (MM-DD-YYYY, etc.)
- ✅ Respects user's time format preference (12-hour vs 24-hour)
- ✅ Dark mode support

### **❌ DON'T:**
- Use inline `formatDateTime()` or `formatDate()` calls in table cells
- Hardcode date formats

---

## **3️⃣ TABLE BORDERS** ⭐ **MANDATORY**

### **Standard Card Border:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed">
      {/* Table content */}
    </table>
  </div>
</Card>
```

### **Completed Section (Green Theme):**
```tsx
<div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
  <Card className="border-0 shadow-none bg-transparent">
    {/* Table content */}
  </Card>
</div>
```

### **Key Requirements:**
- ✅ **ALL tables MUST have visible borders**
- ✅ Use `border-gray-200/60` for standard tables
- ✅ Use `border-green-200/40` for completed sections
- ✅ Include `shadow-sm` for subtle elevation
- ✅ Include `overflow-hidden` on Card

### **❌ DON'T:**
- Leave tables without borders
- Use inline `borderColor` styles
- Use `branding.colors.borderColor`
- Omit border opacity (`/60` or `/40`)

**📘 Full Documentation:** `/TABLE_BORDER_STYLING_STANDARD.md`

---

## **4️⃣ STATUS BADGES** ⭐

### **Standard Pattern (from DESIGN_SYSTEM_REFERENCE.md):**
```tsx
<Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
  <CheckCircle className="w-3 h-3 mr-1" />
  Paid
</Badge>
```

### **Color Variants:**
- **Green**: Paid, Completed, Success (`bg-green-50 text-green-700 border-green-200`)
- **Blue**: Sent, In Progress (`bg-blue-50 text-blue-700 border-blue-200`)
- **Orange/Yellow**: Pending, Partial (`bg-yellow-50 text-yellow-700 border-yellow-200`)
- **Red**: Overdue, Failed (`bg-red-50 text-red-700 border-red-200`)
- **Gray**: Draft, Inactive (`bg-gray-50 text-gray-700 border-gray-200`)

### **Pattern:**
- ✅ Icon FIRST, then text
- ✅ `mr-1` spacing between icon and text
- ✅ `-50` background variant
- ✅ `-700` text variant
- ✅ `-200` border variant
- ✅ `hover:bg-[color]-50` to prevent color changes on hover

### **❌ DON'T:**
- Put text before icon
- Use different spacing values
- Omit the hover state
- Use `-100` or `-600` variants

---

## **5️⃣ TABLE HEADERS** ⭐

### **Standard Pattern:**
```tsx
<thead>
  <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
    <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[260px]">
      Client
    </th>
    {/* More headers... */}
  </tr>
</thead>
```

### **Features:**
- ✅ Uses `var(--primaryColor)` (NO gradients)
- ✅ `text-white/90` for text color
- ✅ `text-xs uppercase tracking-wider` for styling
- ✅ Fixed widths on each column (e.g., `w-[260px]`)
- ✅ Consistent padding (`p-3` or `px-6 py-4`)

### **❌ DON'T:**
- Use gradients on table headers
- Hardcode purple colors
- Use `bg-purple-600` or similar

---

## **6️⃣ PAGINATION** ⭐

### **Component to Use:**
```tsx
import { TablePaginationCompact } from '../TablePaginationCompact';
```

### **Implementation:**
```tsx
<TablePaginationCompact
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### **Features:**
- ✅ Compact design
- ✅ Shows page numbers
- ✅ Previous/Next buttons
- ✅ Responsive

### **❌ DON'T:**
- Create custom pagination UI
- Use the old `TablePagination` component

---

## **6️⃣ TABLE STRUCTURE** ⭐

### **Standard Pattern:**
```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed">
      <thead>
        {/* Headers */}
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            {/* Cells */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
  <TablePaginationCompact
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</Card>
```

### **Features:**
- ✅ Card wrapper for border and shadow
- ✅ `overflow-x-auto` for horizontal scrolling
- ✅ `table-fixed` for consistent column widths
- ✅ Hover states on rows
- ✅ Dark mode support
- ✅ Border between rows

---

## **7️⃣ COLUMN WIDTHS** ⭐

### **Standard Widths:**
- **Client column**: `w-[260px]`
- **Date/Time column**: `w-[160px]`
- **Date only column**: `w-[140px]`
- **Invoice/Document No**: `w-[180px]`
- **Status column**: `w-[140px]`
- **Amount column**: `w-[160px]`
- **Actions column**: `w-[100px]`

### **Features:**
- ✅ Use fixed widths for alignment
- ✅ Match widths between header and body
- ✅ Use `table-fixed` on table element

---

## **🎨 COMPLETE EXAMPLE TABLE**

```tsx
import { ClientCellDisplay } from '../ClientCellDisplay';
import { DateTimeDisplay, DateDisplay } from '../DateTimeDisplay';
import { TablePaginationCompact } from '../TablePaginationCompact';

<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed">
      <thead>
        <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[260px]">
            Client
          </th>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[180px]">
            Invoice No
          </th>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[160px]">
            Created
          </th>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[140px]">
            Due Date
          </th>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[140px]">
            Status
          </th>
          <th className="text-left p-3 text-xs uppercase tracking-wider text-white/90 w-[100px]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-3 w-[260px]">
              <ClientCellDisplay 
                clientId={item.clientId}
                clientName={item.clientName}
                clientType="Business"
              />
            </td>
            <td className="p-3 text-gray-900 dark:text-gray-100 w-[180px]">
              {item.invoiceNo}
            </td>
            <td className="p-3 w-[160px]">
              <DateTimeDisplay date={item.created} />
            </td>
            <td className="p-3 w-[140px]">
              <DateDisplay date={item.dueDate} />
            </td>
            <td className="p-3 w-[140px]">
              <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Paid
              </Badge>
            </td>
            <td className="p-3 w-[100px]">
              {/* Actions dropdown */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
  <TablePaginationCompact
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</Card>
```

---

## **✅ FINAL CHECKLIST**

When creating or updating a table, verify:

- [ ] Using `ClientCellDisplay` for client names
- [ ] Using `DateTimeDisplay` or `DateDisplay` for dates
- [ ] Status badges follow icon-first pattern with correct variants
- [ ] Table header uses `var(--primaryColor)` (NO gradients)
- [ ] Fixed column widths defined
- [ ] `TablePaginationCompact` component added
- [ ] Card wrapper with proper styling
- [ ] `table-fixed` class on table
- [ ] Hover states on rows
- [ ] Dark mode classes present
- [ ] No hardcoded purple colors
- [ ] No inline date formatting

---

## **📚 RELATED DOCUMENTATION**

1. `/TABLE_CLIENT_CELL_STANDARD.md` - Client display details
2. `/TABLE_DATE_TIME_FORMAT_STANDARD.md` - Date/time formatting details
3. `/DESIGN_SYSTEM_REFERENCE.md` - Status badge patterns
4. `/TABLE_PAGINATION_CHECKLIST.md` - Pagination implementation
5. `/COLOR_CENTRALIZATION_TRACKING.md` - Primary color system

---

## **🎯 TABLES UPDATED SO FAR**

- ✅ `/components/views/SignaturesViewSplit.tsx`
- ✅ `/components/views/BillingViewSplit.tsx`
- ✅ `/components/views/BillingView.tsx`

---

## **ALWAYS REMEMBER**

> **Every table must follow ALL these standards.**
> 
> **This is committed to memory and will be applied to all future tables automatically.**

---

**Last Updated**: October 30, 2025