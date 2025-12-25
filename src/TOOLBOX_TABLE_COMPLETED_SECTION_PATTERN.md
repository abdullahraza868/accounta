# Toolbox: Completed Table Section Pattern

## 📋 Purpose
Standard pattern for displaying "completed" items in a separate table section with green theming and invisible header row for alignment.

## ✅ When to Use
- Signatures that have been completed
- Invoices that have been paid
- Tasks that are done
- Any "finished" items that need visual separation from active items

## 🎯 Key Pattern Rules

### Rule #1: Invisible Header Row (NOT No Header!)
```tsx
{/* ✅ CORRECT - Header exists but is invisible */}
<thead>
  <tr style={{ background: 'transparent' }}>
    <th className="px-4 py-4 w-[300px]">
      <div className="opacity-0 text-xs uppercase tracking-wide">Column Name</div>
    </th>
  </tr>
</thead>

{/* ❌ WRONG - No header row at all */}
<tbody>
  {/* Missing thead completely breaks alignment */}
</tbody>
```

**Why:** The invisible header maintains column width alignment with the active table above it.

### Rule #2: Same Column Widths as Active Table
```tsx
// Active Table Columns
w-[300px] w-[160px] w-[100px] w-[150px] w-[120px]

// Completed Table Columns (MUST MATCH!)
w-[300px] w-[160px] w-[100px] w-[150px] w-[120px]
```

**Why:** If widths don't match, columns won't align vertically.

### Rule #3: Green Theme for Completed
```tsx
// Wrapper
<div className="bg-green-50/20 dark:bg-green-900/5 rounded-lg border border-green-200/30 dark:border-green-800/30">

// Tbody
<tbody className="divide-y divide-green-200/30 dark:divide-green-800/30 bg-green-50/10 dark:bg-green-900/5">

// Row Hover
className="hover:bg-green-100/30 dark:hover:bg-green-900/15"

// Chevron Button
className="text-green-600/60 hover:text-green-700 hover:bg-green-100/30"
```

### Rule #4: Checkmark Icon on Each Row
```tsx
<CheckCircle className="w-3.5 h-3.5 text-green-600/60 dark:text-green-500/60 flex-shrink-0" />
```

### Rule #5: Recently Completed Badge (< 48 hours)
```tsx
// Helper function
const isSignedInLast48Hours = (request: SignatureRequest): boolean => {
  if (request.status !== 'completed') return false;
  if (!request.signedAt) return false;
  const signedDate = new Date(request.signedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - signedDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
};

// Badge
{isSignedInLast48Hours(request) && (
  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-4 dark:bg-emerald-900/30 dark:text-emerald-400">
    NEW
  </Badge>
)}
```

### Rule #6: Expanded Row - Single Line with Dots
```tsx
{/* ✅ CORRECT - Inline with dots */}
<div className="flex items-center gap-2 text-xs">
  <CheckCircle className="w-3 h-3 text-green-600/80 flex-shrink-0" />
  <span>Completed by John</span>
  <span className="text-gray-400">·</span>
  <Calendar className="w-3 h-3" />
  <DateTimeDisplay date={item.completedAt} />
  <span className="text-gray-400">·</span>
  <span className="font-mono text-gray-500">IP: 192.168.1.1</span>
</div>

{/* ❌ WRONG - Stacked vertically */}
<div className="space-y-2">
  <div>Completed by John</div>
  <div>Date: ...</div>
  <div>IP: ...</div>
</div>
```

## 📝 Complete Example

```tsx
const renderCompletedSection = () => {
  if (completedItems.length === 0) return null;

  return (
    <div>
      {/* Collapsible Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-green-100/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3>Completed Items</h3>
          <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-300/60">
            {completedItems.length}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          {collapsed ? 'Click to expand' : 'Click to collapse'}
        </span>
      </button>

      {!collapsed && (
        <div className="bg-green-50/20 rounded-lg border border-green-200/30 overflow-hidden">
          <table className="w-full table-fixed">
            {/* Invisible Header Row - MAINTAINS ALIGNMENT */}
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th className="px-4 py-4 w-[300px]">
                  <div className="opacity-0 text-xs uppercase">Name</div>
                </th>
                <th className="px-4 py-4 w-[160px]">
                  <div className="opacity-0 text-xs uppercase">Date</div>
                </th>
                <th className="px-4 py-4 w-[100px]">
                  <div className="opacity-0 text-xs uppercase">Year</div>
                </th>
                <th className="px-4 py-4 w-[120px]">
                  <div className="opacity-0 text-xs uppercase">Actions</div>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-green-200/30 bg-green-50/10">
              {paginatedCompleted.map((item) => {
                const isExpanded = expandedRows.has(item.id);
                
                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-green-100/30 transition-colors">
                      <td className="px-4 py-5">
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpanded(item.id)}
                            className="h-6 w-6 p-0 text-green-600/60 hover:text-green-700 hover:bg-green-100/30"
                          >
                            <ChevronRight className={cn(
                              "w-3.5 h-3.5 transition-transform",
                              isExpanded && "rotate-90"
                            )} />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600/60" />
                              <span className="text-sm text-gray-700">{item.name}</span>
                              {isCompletedInLast48Hours(item) && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] h-4">
                                  NEW
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <DateTimeDisplay date={item.completedAt} className="text-xs text-gray-500" />
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-xs text-gray-600">{item.year}</span>
                      </td>
                      <td className="px-4 py-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>

                    {/* Expanded Details - Single Line */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 bg-green-100/20 border-t border-green-200/30">
                          <div className="ml-10 flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-600/80" />
                            <span className="text-gray-700">Completed by {item.user}</span>
                            <span className="text-gray-400">·</span>
                            <Calendar className="w-3 h-3" />
                            <DateTimeDisplay date={item.completedAt} />
                            {item.ipAddress && (
                              <>
                                <span className="text-gray-400">·</span>
                                <span className="font-mono text-gray-500">IP: {item.ipAddress}</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          <TablePaginationCompact 
            currentPage={completedPage}
            totalPages={completedTotalPages}
            onPageChange={setCompletedPage}
          />
        </div>
      )}
    </div>
  );
};
```

## 🚨 Common Mistakes

### ❌ Mistake #1: No Header Row
```tsx
// Missing thead completely
<table>
  <tbody>...</tbody>
</table>
```
**Fix:** Add invisible header row with `opacity-0`

### ❌ Mistake #2: Different Column Widths
```tsx
// Active table
w-[300px] w-[200px]

// Completed table  
w-[250px] w-[180px]  // ❌ Different!
```
**Fix:** Use exact same widths

### ❌ Mistake #3: Stacked Expanded Row
```tsx
<div className="space-y-2">
  <div>Info 1</div>
  <div>Info 2</div>
</div>
```
**Fix:** Use inline flex with dots

### ❌ Mistake #4: Missing Recently Completed Badge
```tsx
// Just showing the name without NEW badge
<span>{item.name}</span>
```
**Fix:** Add `isCompletedInLast48Hours()` check and emerald NEW badge

## 🎨 Color Reference

```tsx
// Wrapper
bg-green-50/20 dark:bg-green-900/5
border-green-200/30 dark:border-green-800/30

// Dividers
divide-green-200/30 dark:divide-green-800/30

// Row Background
bg-green-50/10 dark:bg-green-900/5

// Row Hover
hover:bg-green-100/30 dark:hover:bg-green-900/15

// Expanded Row
bg-green-100/20 dark:bg-green-900/10
border-green-200/30 dark:border-green-800/30

// Checkmark
text-green-600/60 dark:text-green-500/60

// NEW Badge (< 48 hours)
bg-emerald-100 text-emerald-700
dark:bg-emerald-900/30 dark:text-emerald-400
```

## ✅ Checklist

Before implementing a completed section:

- [ ] Invisible header row exists (not missing entirely)
- [ ] `opacity-0` on all header content
- [ ] Same column widths as active table
- [ ] Green theme colors applied
- [ ] Checkmark icon on each row
- [ ] Recently completed badge (< 48 hours) implemented
- [ ] Expanded row uses inline format with dots
- [ ] Collapsible header button works
- [ ] Pagination included

## 📚 Related Files

- `/CLIENT_PORTAL_SIGNATURES_FIXES_NEEDED.md` - The issues that led to this standard
- `/TABLE_HEADER_BACKGROUND_STANDARD.md` - Header background rules
- `/components/views/SignaturesViewSplit.tsx` - Reference implementation
- `/components/folder-tabs/SignatureTab.tsx` - Another reference

## 🎯 Use In

- Client Portal Signatures
- Firm-side Signatures (Split View)
- Client Folder Signature Tab
- Any page with completed/finished items needing separation

---

**Created:** November 2, 2024  
**Status:** ✅ Active Standard  
**Mandatory:** YES - for all completed sections
