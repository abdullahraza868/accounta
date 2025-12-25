# Design System Reference Guide

This document tracks all icons, UI patterns, and interaction models used throughout the application to ensure consistency.

**📌 IMPORTANT:** This is our source of truth for ALL new pages and features. Always reference this guide before starting new work to maintain consistency and start further ahead.

---

## 🎯 Core Design Principles

### 1. Completed Items Recede to Background
**Principle:** Completed/archived items should be visually present but subdued. Users don't need to actively pay attention to finished work.

**Implementation:**
- Use muted color palettes (grays with subtle green tints for completion)
- Smaller, more compact layouts
- Collapsed by default
- Lower visual hierarchy (smaller text, lighter colors, subtle borders)
- Less prominent buttons/actions

**Examples:**
- SignatureTab completed section: Subtle green tints, collapsed by default, compact rows
- Use opacity values like `/30`, `/60`, `/70` for subtle color application

### 2. Date Formatting Consistency
**Principle:** ALL dates throughout the application MUST use the centralized date formatting system.

**Implementation:**
```tsx
import { useAppSettings } from '../../contexts/AppSettingsContext';

const { formatDate, formatDateTime } = useAppSettings();

// For date only
<span>{formatDate(dateString)}</span>

// For date + time (displays on two lines)
<div className="flex flex-col gap-0.5">
  {(() => {
    const formatted = formatDateTime(dateString);
    const [date, time] = formatted.split('\n');
    return (
      <>
        <span className="text-sm text-gray-900">{date}</span>
        <span className="text-xs text-gray-500">{time}</span>
      </>
    );
  })()}
</div>
```

**Never:**
- Hardcode date formats
- Use native `toLocaleDateString()` without going through AppSettingsContext
- Display dates without considering user's format preference

### 3. Scrollable Content Areas
**Principle:** Every page/view must have proper scroll functionality to handle content overflow.

**Implementation:**
```tsx
// Page container
<div className="h-full overflow-auto">
  {/* Page content */}
</div>

// Dialog/modal content
<DialogContent className="max-w-2xl">
  <div className="max-h-[500px] overflow-y-auto">
    {/* Scrollable content */}
  </div>
</DialogContent>

// Table body
<div className="max-h-[600px] overflow-y-auto">
  {/* Table rows */}
</div>
```

**Testing:**
- Always test with more content than fits on screen
- Ensure scroll indicators appear
- Verify sticky headers work correctly
- Check mobile/tablet scroll behavior

### 4. Vertical Space Efficiency
**Principle:** Prioritize vertical space efficiency to show more content without scrolling.

**Implementation:**
- Use compact padding for secondary/archive content
- Collapse sections by default when appropriate
- Use multi-column layouts where it makes sense
- Minimize whitespace in tables and lists

---

## 🎨 Icon Library

All icons are from **lucide-react**. Import syntax: `import { IconName } from 'lucide-react';`

### Navigation & Actions

| Icon | Usage | Context |
|------|-------|---------|
| `ChevronRight` | Expand/collapse rows (rotates 90° when expanded) | Tables, lists with expandable content |
| `ChevronDown` | Dropdown menus, collapsible sections (rotates 180° when expanded) | Section headers, dropdown triggers |
| `ChevronLeft` | Back navigation, previous | Pagination, navigation |
| `ChevronsRight` | Next page, skip forward | Pagination |
| `ChevronsLeft` | Previous page, skip back | Pagination |
| `Plus` | Add new item | Primary creation buttons |
| `X` / `XIcon` | Close, dismiss, remove filter | Close buttons, filter clearing |
| `MoreVertical` | Actions menu | Row actions, context menus |
| `ExternalLink` | Open in new window/view | Client folder links, external navigation |

### Documents & Files

| Icon | Usage | Context |
|------|-------|---------|
| `FileSignature` | Signature requests and documents | Signatures feature |
| `FileText` | General documents, audit trails | Documents, notes, audit logs |
| `File` | Generic file | File uploads, attachments |
| `Upload` | Upload action | File upload buttons |
| `Download` | Download action | Download buttons |
| `Eye` | View/preview | View document, view details |
| `Image` | Image files | Image previews |

### Status & State Icons

| Icon | Usage | Context |
|------|-------|---------|
| `CheckCircle` | Completed, success, signed | Completed signatures, success states |
| `Check` | Selected, confirmed | Checkboxes, confirmations |
| `Clock` | Pending, waiting | Pending signatures, time-based states |
| `AlertCircle` | Warning, unsigned | Warnings, alerts |
| `AlertTriangle` | Overdue, important warning | Overdue signatures, critical warnings |
| `Sparkles` | New item, recently added | New signatures (within 48hrs) |
| `Circle` | Status indicator | Status badges |

### Communication

| Icon | Usage | Context |
|------|-------|---------|
| `Send` | Send message, sent status | Send buttons, sent signatures |
| `Mail` | Email, messages | Email actions |
| `MailPlus` | Resend | Resend signature requests |
| `MessageSquare` | Chat, comments | Chat features, comments |
| `Phone` | Phone contact | Contact information |

### People & Organizations

| Icon | Usage | Context |
|------|-------|---------|
| `User` | Individual person, manual action | Individual clients, manual source |
| `Users` | Multiple people, recipients | Recipients list, team |
| `Building2` | Business entity | Business clients |
| `UserPlus` | Add user/member | Add team member |

### Editing & Management

| Icon | Usage | Context |
|------|-------|---------|
| `Edit` | Edit action | Edit buttons |
| `Trash2` | Delete action | Delete buttons (always text-red-600) |
| `Copy` | Duplicate, copy | Copy actions |
| `Archive` | Archive action | Archive buttons |

### Filters & Search

| Icon | Usage | Context |
|------|-------|---------|
| `Search` | Search input | Search fields |
| `Filter` | Active filters indicator | Filter displays |
| `FilterX` | Clear all filters | Clear filter buttons |
| `SlidersHorizontal` | Filter settings | Filter configuration |

### Calendar & Time

| Icon | Usage | Context |
|------|-------|---------|
| `Calendar` | Date, calendar events | Date fields, calendar views |
| `CalendarDays` | Multiple dates | Date ranges |

### Workflow & Automation

| Icon | Usage | Context |
|------|-------|---------|
| `Workflow` | Automated process | Workflow source indicators |
| `Layout` | Templates, layouts | Template management |
| `Settings` | Settings, configuration | Settings pages |
| `Cog` | Advanced settings | Configuration |

### Utility

| Icon | Usage | Context |
|------|-------|---------|
| `GripVertical` | Drag handle | Draggable items |
| `ArrowUpDown` | Sort (unsorted) | Sortable column headers |
| `ArrowUp` | Sort ascending | Sorted columns |
| `ArrowDown` | Sort descending | Sorted columns |
| `MapPin` | Location | Address fields |
| `Globe` | Website, URL | Website links |

---

## 🎯 UI Interaction Patterns

### Expandable Rows

**Pattern:** ChevronRight icon that rotates 90° when expanded

**Used in:**
- SignaturesView - recipient details
- SignatureTab (Active section) - recipient details  
- SignatureTab (Completed section) - recipient details

**Implementation:**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => toggleRowExpanded(id)}
  className="h-8 w-8 p-0"
>
  <ChevronRight className={cn(
    "w-4 h-4 transition-transform",
    isExpanded && "rotate-90"
  )} />
</Button>
```

### Collapsible Sections

**Pattern:** ChevronDown icon that rotates 180° OR ChevronRight that rotates 90°

**Implementation:**
```tsx
<ChevronDown className={cn(
  "w-4 h-4 transition-transform",
  isExpanded && "rotate-180"
)} />
```

### Hover-Only Links

**Pattern:** Text appears normal until hover, then shows underline and color change

**Used in:**
- Client names in signature tables
- Document names

**Implementation:**
```tsx
<button
  className="text-sm text-gray-700 dark:text-gray-300 group-hover:underline group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-left"
>
  {text}
</button>
```

### Document Thumbnail Preview

**Pattern:** Small thumbnail with large preview on hover

**Implementation:**
```tsx
<div className="relative group/preview">
  <div className="w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-transform">
    <img src={thumbnail} />
  </div>
  {/* Preview on Hover */}
  <div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block">
    <div className="w-64 h-80 bg-white rounded-lg shadow-2xl border-2 p-4">
      <img src={thumbnail} className="w-full h-full object-contain" />
    </div>
  </div>
</div>
```

### External Link Icon (Hover-Only)

**Pattern:** Icon appears only on hover next to client name

**Implementation:**
```tsx
<div className="flex items-center gap-1 group/clientname">
  <span>{clientName}</span>
  <button className="opacity-0 group-hover/clientname:opacity-100 transition-opacity">
    <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
  </button>
</div>
```

### Draggable Cards

**Pattern:** Grip handle visible, opacity changes during drag

**Used in:**
- SignatureTab stat cards
- SignaturesView stat cards

**Implementation:**
```tsx
const [{ isDragging }, drag] = useDrag({
  type: 'STAT_CARD',
  item: { index },
  collect: (monitor) => ({ isDragging: monitor.isDragging() })
});

<div className={cn("relative", isDragging && "opacity-50")}>
  <div className="absolute top-2 left-2">
    <GripVertical className="w-4 h-4 text-gray-400" />
  </div>
  {/* Card content */}
</div>
```

---

## 🎨 Color & State Patterns

### Status Badge Colors

| Status | Background | Text | Border | Icon |
|--------|-----------|------|--------|------|
| Completed | `bg-green-50` | `text-green-700` | `border-green-200` | `CheckCircle` |
| Partial | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | `Clock` |
| Viewed | `bg-purple-50` | `text-purple-700` | `border-purple-200` | `Eye` |
| Sent | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `Send` |
| Unsigned | `bg-gray-50` | `text-gray-700` | `border-gray-200` | `AlertCircle` |

### Special Badges

| Type | Style | Icon |
|------|-------|------|
| NEW (48hrs) | `bg-emerald-100 text-emerald-700` | `Sparkles` |
| Overdue | `bg-orange-100 text-orange-700` | `AlertTriangle` |
| Document Type (8879) | Primary color with opacity | None |
| Document Type (Template) | `bg-blue-50 text-blue-700` | None |
| Document Type (Custom) | `bg-gray-50 text-gray-700` | None |

### Archive/Completed Section Colors

**Pattern:** Subtle green tints to convey completion without demanding attention

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `bg-green-50/30` | `bg-green-900/10` |
| Border | `border-green-200/40` | `border-green-800/40` |
| Hover | `hover:bg-green-50/50` | `hover:bg-green-900/20` |
| Icon | `text-green-600/70` | `text-green-500/70` |
| Dividers | `divide-green-200/30` | `divide-green-800/30` |

### Active Section Colors

**Pattern:** Uses primary brand color throughout

| Element | Style |
|---------|-------|
| Header Gradient | `linear-gradient(to right, var(--primaryColor), var(--secondaryColor))` |
| Icon Colors | `style={{ color: 'var(--primaryColor)' }}` |
| Hover States | `hover:text-purple-600` with `dark:hover:text-purple-400` |

---

## 📐 Layout Patterns

### Submenu Layout (Standardized)

**Pattern:** Filters/switchers on left, action buttons on right

```tsx
<div className="flex items-center justify-between">
  {/* Left side - Filters/Switchers */}
  <div className="flex items-center gap-3">
    <Select>...</Select>
    <Input placeholder="Search..." />
  </div>
  
  {/* Right side - Actions */}
  <div className="flex gap-2">
    <Button variant="outline">Secondary Action</Button>
    <Button>Primary Action</Button>
  </div>
</div>
```

### Table Header

**Pattern:** Gradient background using brand colors

**Active Tables:**
```tsx
<div style={{
  background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))'
}}>
  <div className="text-xs uppercase tracking-wide text-white/90">Column</div>
</div>
```

**Completed/Archive Tables:**
- Uses subtle green gradients instead
- More subdued appearance

### Card Grid Layouts

**Pattern:** Responsive grid with gap-4

```tsx
<div className="grid grid-cols-5 gap-4">
  {/* Stat cards */}
</div>
```

---

## 🔢 Size Standards

### Icon Sizes

| Context | Size Class | Actual Size |
|---------|-----------|-------------|
| Large feature icon | `w-6 h-6` | 24px |
| Standard UI icon | `w-4 h-4` | 16px |
| Small/compact icon | `w-3.5 h-3.5` | 14px |
| Tiny indicator | `w-3 h-3` | 12px |
| Status badge icon | `w-2.5 h-2.5` | 10px |

### Button Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| Default | `h-10` | `px-4 py-2` | Standard buttons |
| `sm` | `h-9` | `px-3` | Compact buttons |
| Icon button | `h-8 w-8` | `p-0` | Icon-only buttons |
| Compact icon | `h-6 w-6` | `p-0` | Archive/compact tables |

### Text Sizes

| Element | Size | Use Case |
|---------|------|----------|
| Table header | `text-xs uppercase` | Column headers |
| Table cell | `text-sm` | Standard table content |
| Compact table | `text-xs` | Archive/compact tables |
| Badge | `text-[10px]` | Small badges (NEW, Overdue) |
| Secondary text | `text-xs` | Helper text, timestamps |

---

## 🎭 Interactive States

### Hover Effects

**Rows:**
```tsx
className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
```

**Archive/Completed Rows:**
```tsx
className="hover:bg-green-100/20 dark:hover:bg-green-900/10 transition-colors"
```

**Buttons:**
```tsx
className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
```

### Selected/Active States

**Stat Cards:**
```tsx
className={cn(
  "border-gray-200",
  isActive && "ring-2 ring-purple-100"
)}
style={isActive ? { borderColor: 'var(--primaryColor)' } : {}}
```

---

## 🗂️ Component Patterns

### Pagination (Standard)

**Full Pagination** - For main tables outside Card borders

```tsx
import { TablePagination } from '../components/TablePagination';

const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [totalCount, setTotalCount] = useState(0);

<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

**Compact Pagination** - For split views and tables inside Cards

```tsx
import { TablePaginationCompact } from '../components/TablePaginationCompact';

const totalPages = Math.ceil(totalCount / itemsPerPage);

<TablePaginationCompact
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

**See also:** PAGINATION_SYSTEM_GUIDE.md, TOOLSET_PAGINATION.md

### Action Dropdown Menu

**Standard pattern for row actions:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <MoreVertical className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    {/* View actions */}
    <DropdownMenuItem>
      <Eye className="w-4 h-4 mr-2" />
      View
    </DropdownMenuItem>
    
    {/* Edit actions */}
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </DropdownMenuItem>
    
    {/* Destructive actions */}
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-600 focus:text-red-600">
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Empty State

```tsx
<Card className="p-12 text-center border-dashed">
  <FileSignature className="w-12 h-12 mx-auto mb-4 text-gray-400" />
  <h3 className="text-gray-900 mb-2">No items found</h3>
  <p className="text-sm text-gray-500 mb-6">Description</p>
  <Button>Call to Action</Button>
</Card>
```

### Filter Badge with Remove

```tsx
<Badge variant="outline" className="gap-1">
  Status: {value}
  <button onClick={handleRemove} className="ml-1 hover:text-red-600">
    <XIcon className="w-3 h-3" />
  </button>
</Badge>
```

---

## 📱 Responsive Patterns

### Grid Breakpoints

| Columns | Breakpoint | Use Case |
|---------|-----------|----------|
| 5 | Default | Stat cards on desktop |
| 3 | `lg:` | Stat cards on tablet |
| 1 | `sm:` | Stat cards on mobile |

---

## 🎨 Brand Color Usage

### When to use var(--primaryColor)

1. Primary action buttons background
2. Icon colors for main features
3. Hover states for links
4. Active/selected borders
5. Table header gradients (active tables)

### When to use semantic colors (green, yellow, etc.)

1. Status indicators (completed, pending, warning)
2. Badges
3. Archive/completed sections (subtle green)
4. Alert states (red for errors, orange for warnings)

---

## 📝 Notes

- **Always use transition-colors or transition-transform** for smooth interactions
- **Archive/completed sections** use muted colors (gray + subtle green)
- **Active/working sections** use vibrant brand colors
- **Destructive actions** (Delete) always use `text-red-600`
- **Icon + text patterns** always have icon before text with `mr-2` spacing
- **All dates** use `formatDate()` or `formatDateTime()` from AppSettingsContext

---

*Last Updated: Based on SignatureTab and SignaturesView implementation*