# 🧰 Toolbox: Draggable Table Rows

## 📋 Overview

Reusable components and hooks for adding drag-and-drop reordering to any table in the application.

**Location:** `/components/ui/draggable-table-row.tsx`

**Status:** ✅ Production Ready

---

## 🎯 What's in the Toolbox

### Components

1. **`<DraggableTableRow>`** - Main draggable row wrapper
2. **`<DragHandleCell>`** - Standard drag handle cell
3. **`useDragReorder`** - Hook for handling reorder logic

---

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTableRow, useDragReorder } from './components/ui/draggable-table-row';
import { GripVertical } from 'lucide-react';

function MyTable() {
  const [items, setItems] = useState(myItems);
  const handleMove = useDragReorder(items, setItems);

  return (
    <DndProvider backend={HTML5Backend}>
      <table>
        <thead>
          <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
            <th className="px-2 py-4 w-12">
              <GripVertical className="w-4 h-4 text-white/90" />
            </th>
            <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
              Name
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <DraggableTableRow
              key={item.id}
              id={item.id}
              index={index}
              type="MY_ITEM"
              onMove={handleMove}
            >
              <td className="px-2 py-4">
                <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-gray-400" />
              </td>
              <td className="px-4 py-4">{item.name}</td>
            </DraggableTableRow>
          ))}
        </tbody>
      </table>
    </DndProvider>
  );
}
```

---

## 📚 Component API

### DraggableTableRow

Wraps a table row to make it draggable.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | ✅ Yes | - | Unique identifier for this row |
| `index` | `number` | ✅ Yes | - | Current index in the list |
| `type` | `string` | ✅ Yes | - | Unique type for drag/drop (e.g., 'USER_ROW') |
| `onMove` | `(dragId: string, hoverId: string) => void` | ✅ Yes | - | Callback when row is moved |
| `children` | `React.ReactNode` | ✅ Yes | - | Table cells to render |
| `className` | `string` | ❌ No | - | Additional classes |
| `style` | `React.CSSProperties` | ❌ No | - | Additional inline styles |
| `backgroundColor` | `string` | ❌ No | - | Row background color |
| `showHoverHighlight` | `boolean` | ❌ No | `true` | Show hover highlight on drop target |
| `hoverHighlightColor` | `string` | ❌ No | `'bg-purple-50'` | Tailwind class for hover |

#### Example

```tsx
<DraggableTableRow
  id="user-123"
  index={0}
  type="USER_ROW"
  onMove={handleMove}
  backgroundColor={branding.colors.cardBackground}
  showHoverHighlight={true}
  hoverHighlightColor="bg-purple-50"
>
  <td>Cell 1</td>
  <td>Cell 2</td>
</DraggableTableRow>
```

---

### DragHandleCell

Pre-built drag handle cell component.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `React.ReactNode` | ❌ No | GripVertical SVG | Custom icon to display |
| `iconColor` | `string` | ❌ No | `'text-gray-400'` | Tailwind class for icon color |
| `padding` | `string` | ❌ No | `'px-2 py-4'` | Tailwind padding class |

#### Example

```tsx
<DragHandleCell 
  icon={<GripVertical className="w-4 h-4" />}
  iconColor="text-gray-400"
  padding="px-2 py-4"
/>
```

---

### useDragReorder Hook

Handles the reordering logic automatically.

#### Type Signature

```typescript
function useDragReorder<T extends { id: string; displayOrder: number }>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
): (dragId: string, hoverId: string) => void
```

#### Requirements

- Items MUST have `id: string` field
- Items MUST have `displayOrder: number` field

#### Returns

Function to pass to `DraggableTableRow` as `onMove` prop

#### Example

```tsx
const [users, setUsers] = useState<User[]>(initialUsers);
const handleMove = useDragReorder(users, setUsers);

// Use in table
<DraggableTableRow onMove={handleMove} ... />
```

---

## 🎨 Styling Standards

### Table Header

Always use Application Settings primary color:

```tsx
<thead>
  <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
    <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
      Column Name
    </th>
  </tr>
</thead>
```

**Standards:**
- ✅ `backgroundColor: 'var(--primaryColor)'` - Uses app setting
- ✅ `text-white/90` - 90% opacity white text
- ✅ `text-xs uppercase tracking-wide` - Header typography
- ✅ `px-4 py-4` - Standard padding (py-4, NOT py-3)

### Drag Handle

```tsx
// In header
<th className="px-2 py-4 w-12">
  <GripVertical className="w-4 h-4 text-white/90" />
</th>

// In body
<td className="px-2 py-4">
  <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-gray-400" />
</td>
```

**Standards:**
- ✅ `w-4 h-4` - Icon size
- ✅ `cursor-grab` - Idle cursor
- ✅ `active:cursor-grabbing` - Active cursor
- ✅ `text-gray-400` - Body row color
- ✅ `text-white/90` - Header color

### Row States

```tsx
<DraggableTableRow
  style={{ 
    cursor: 'move',
    backgroundColor: branding.colors.cardBackground 
  }}
  showHoverHighlight={true}
  hoverHighlightColor="bg-purple-50"
>
```

**Visual Feedback:**
- Dragging: 50% opacity (automatic)
- Hovering: Purple highlight (configurable)
- Cursor: Move cursor on entire row

---

## 📋 Complete Example

```tsx
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTableRow, useDragReorder } from './components/ui/draggable-table-row';
import { useBranding } from './contexts/BrandingContext';
import { GripVertical } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  displayOrder: number;
};

export function UsersTable() {
  const { branding } = useBranding();
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John', email: 'john@example.com', displayOrder: 0 },
    { id: '2', name: 'Jane', email: 'jane@example.com', displayOrder: 1 },
  ]);

  const handleMove = useDragReorder(users, setUsers);

  return (
    <DndProvider backend={HTML5Backend}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
            <th className="px-2 py-4 w-12">
              <GripVertical className="w-4 h-4 text-white/90" />
            </th>
            <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
              Name
            </th>
            <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <DraggableTableRow
              key={user.id}
              id={user.id}
              index={index}
              type="USER_ROW"
              onMove={handleMove}
              backgroundColor={branding.colors.cardBackground}
            >
              <td className="px-2 py-4">
                <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-gray-400" />
              </td>
              <td className="px-4 py-4">{user.name}</td>
              <td className="px-4 py-4">{user.email}</td>
            </DraggableTableRow>
          ))}
        </tbody>
      </table>
    </DndProvider>
  );
}
```

---

## ✅ Integration Checklist

When adding drag-and-drop to a table:

### Data Setup
- [ ] Add `displayOrder: number` field to data type
- [ ] Initialize displayOrder values (0, 1, 2, ...)
- [ ] Ensure new items get correct displayOrder

### Component Setup
- [ ] Import `DndProvider` and `HTML5Backend`
- [ ] Wrap component with `<DndProvider backend={HTML5Backend}>`
- [ ] Import `DraggableTableRow` and `useDragReorder`
- [ ] Create move handler with `useDragReorder`
- [ ] Choose unique `type` string for your rows

### Table Header
- [ ] Use `backgroundColor: 'var(--primaryColor)'` on `<tr>`
- [ ] Use `text-white/90` on all `<th>` elements
- [ ] Use `py-4` padding (NOT py-3)
- [ ] Remove any gradients or branding color styles
- [ ] Add drag handle column with GripVertical icon

### Table Body
- [ ] Replace `<tr>` with `<DraggableTableRow>`
- [ ] Pass `id`, `index`, `type`, `onMove` props
- [ ] Add drag handle cell with GripVertical
- [ ] Use `cursor-grab active:cursor-grabbing` on handle
- [ ] Pass `backgroundColor` from branding

### Sorting Integration
- [ ] Update sort logic to fallback to displayOrder
- [ ] When no sort active, sort by displayOrder
- [ ] Clear sort returns to manual order

### Testing
- [ ] Drag works smoothly
- [ ] Visual feedback displays
- [ ] Order persists through filters
- [ ] Works with sorting
- [ ] Header uses app setting color
- [ ] No console errors

---

## 🎯 Where It's Used

### ✅ Implemented
- [x] Client Portal - Account Access (`/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`)

### 🔜 Ready to Add
- [ ] Teams Tab - Reorder team members
- [ ] Navigation Menus - Custom ordering
- [ ] Document Lists - Priority ordering
- [ ] Task Lists - Priority ordering
- [ ] Any user-defined lists

---

## 🔍 Troubleshooting

### Drag doesn't work
- ✅ Check DndProvider wraps the table
- ✅ Verify HTML5Backend is imported correctly
- ✅ Confirm `type` in row matches in useDrop accept

### Order resets after filter
- ✅ Ensure displayOrder is preserved in state
- ✅ Check sort logic falls back to displayOrder
- ✅ Verify you're not recreating objects

### Header doesn't use app setting color
- ✅ Use `backgroundColor: 'var(--primaryColor)'`
- ✅ NOT `background: branding.colors.primaryButton`
- ✅ NOT gradients or inline colors

### Text not readable on header
- ✅ Use `text-white/90` on all header text
- ✅ NOT gray colors or branding.colors.bodyText

---

## 📖 Related Standards

- **Table Header Background** - `/TABLE_HEADER_BACKGROUND_STANDARD.md`
- **Drag & Drop Reorder** - `/TABLE_DRAG_DROP_REORDER_STANDARD.md`
- **Table Standards Master** - `/guidelines/TABLE_UNIVERSAL_CHECKLIST.md`
- **Application Settings** - `/contexts/AppSettingsContext.tsx`

---

## 💡 Pro Tips

### Tip 1: Custom Hover Color
Match your brand by customizing the hover highlight:

```tsx
<DraggableTableRow
  hoverHighlightColor="bg-blue-50"
  // or use branding
  style={{ 
    // Add custom hover in CSS or use className with hover:
  }}
>
```

### Tip 2: Disable Drag Conditionally
Conditionally render normal `<tr>` vs `<DraggableTableRow>`:

```tsx
{canReorder ? (
  <DraggableTableRow {...props}>
    {children}
  </DraggableTableRow>
) : (
  <tr>{children}</tr>
)}
```

### Tip 3: Persist Order to Backend
Use the move handler to trigger save:

```tsx
const handleMove = (dragId: string, hoverId: string) => {
  const moveHandler = useDragReorder(items, setItems);
  moveHandler(dragId, hoverId);
  
  // Optionally persist to backend
  saveOrderToBackend(items);
};
```

### Tip 4: Toast Notification
Optionally show toast after reordering:

```tsx
const handleMove = (dragId: string, hoverId: string) => {
  useDragReorder(items, setItems)(dragId, hoverId);
  toast.success('Order updated');
};
```

---

## 🎨 Design System Integration

### Branding Colors
Always use branding context colors:

```tsx
const { branding } = useBranding();

<DraggableTableRow
  backgroundColor={branding.colors.cardBackground}
>
```

### Application Settings
Always use CSS variables for header:

```tsx
// ✅ CORRECT - Uses app setting
<tr style={{ backgroundColor: 'var(--primaryColor)' }}>

// ❌ WRONG - Hardcoded
<tr style={{ backgroundColor: '#7c3aed' }}>

// ❌ WRONG - Branding direct
<tr style={{ backgroundColor: branding.colors.primaryButton }}>
```

### Dark Mode Support
The toolbox components automatically support dark mode:
- Uses branding.colors which adapt
- CSS variables change with theme
- No additional code needed

---

## 🚀 Future Enhancements

Potential additions to the toolbox:

1. **Keyboard Support** - Arrow keys to reorder
2. **Touch Gestures** - Better mobile support
3. **Animation** - Smooth transitions
4. **Undo/Redo** - Revert order changes
5. **Multi-select Drag** - Drag multiple rows
6. **Nested Rows** - Support for row groups
7. **Virtual Scrolling** - For very long lists

---

## ✅ Success Criteria

A properly implemented draggable table should:

1. ✅ Drag handle visible and interactive
2. ✅ Smooth cursor feedback (grab/grabbing)
3. ✅ Visual states clear (dragging, hovering)
4. ✅ Order updates immediately
5. ✅ Works with sorting/filtering
6. ✅ Header uses `var(--primaryColor)`
7. ✅ Header text is `text-white/90`
8. ✅ No console errors
9. ✅ Branding colors throughout
10. ✅ Responsive and accessible

---

## 🎉 You're Ready!

You now have a complete, reusable system for adding drag-and-drop to any table!

**Components:** `/components/ui/draggable-table-row.tsx`  
**Example:** `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`  
**Standard:** `/TABLE_DRAG_DROP_REORDER_STANDARD.md`

---

*Last Updated: October 31, 2025*
*Toolbox Version: 1.0*
*Status: ✅ Production Ready*
