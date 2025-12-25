# Table Drag & Drop Reorder Standard ✅

## 📋 Overview

This document defines the **standard pattern** for implementing drag-and-drop row reordering in tables across the application. This functionality allows users to manually reorder items by dragging them up and down.

**Status:** ✅ Active Standard - Use this pattern for ALL tables that need manual reordering

---

## 🎯 When to Use

Implement drag-and-drop reordering when:
- ✅ Users need to **manually set display order** or priority
- ✅ Order is **user-defined** (not based on a data field like date/name)
- ✅ Order should **persist** across sessions
- ✅ Examples: Task lists, user lists, document organizers, custom menus

**Don't use when:**
- ❌ Order is determined by sorting on data fields (use sortable columns instead)
- ❌ Order is system-generated (like creation date)
- ❌ Items are paginated and order spans multiple pages

---

## 🔧 Implementation Pattern

### 1. Dependencies

```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
```

### 2. Data Model

Add a `displayOrder` field to your data type:

```typescript
export type YourDataType = {
  id: string;
  // ... other fields
  displayOrder: number; // Required for drag-and-drop
};
```

### 3. Initialize Display Order

When creating mock data or loading from API:

```typescript
const [items, setItems] = useState<YourDataType[]>([
  {
    id: '1',
    // ... other fields
    displayOrder: 0,
  },
  {
    id: '2',
    // ... other fields
    displayOrder: 1,
  },
  // etc.
]);
```

### 4. Sorting Logic

When not actively sorting by another field, sort by displayOrder:

```typescript
const filteredAndSortedItems = (() => {
  // First filter
  let filtered = items.filter((item) => {
    // Your filter logic
  });

  // Then sort
  if (sortField && sortDirection) {
    // Sort by selected field
    filtered = [...filtered].sort((a, b) => {
      // Your sort logic
    });
  } else {
    // When no sort is active, sort by displayOrder
    filtered = [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return filtered;
})();
```

### 5. Move Handler

Implement the drag-and-drop logic:

```typescript
const moveItem = (dragId: string, hoverId: string) => {
  const dragIndex = items.findIndex((item) => item.id === dragId);
  const hoverIndex = items.findIndex((item) => item.id === hoverId);

  if (dragIndex === -1 || hoverIndex === -1) return;

  const newItems = [...items];
  const [draggedItem] = newItems.splice(dragIndex, 1);
  newItems.splice(hoverIndex, 0, draggedItem);

  // Update display order for all items
  const reorderedItems = newItems.map((item, index) => ({
    ...item,
    displayOrder: index,
  }));

  setItems(reorderedItems);
};
```

### 6. Wrap with DndProvider

```typescript
return (
  <DndProvider backend={HTML5Backend}>
    <YourLayout>
      {/* Your content */}
    </YourLayout>
  </DndProvider>
);
```

### 7. Create DraggableRow Component

```typescript
type DraggableRowProps = {
  item: YourDataType;
  index: number;
  moveItem: (dragId: string, hoverId: string) => void;
  // ... other props needed for rendering
};

function DraggableRow({
  item,
  index,
  moveItem,
  // ... other props
}: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'YOUR_ROW_TYPE', // Unique identifier
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'YOUR_ROW_TYPE', // Same as above
    hover: (dragItem: { id: string; index: number }) => {
      if (dragItem.id !== item.id) {
        moveItem(dragItem.id, item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      className={cn(
        'hover:opacity-80 transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'bg-purple-50' // Or use branding colors
      )}
      style={{ 
        background: branding.colors.cardBackground,
        cursor: 'move',
      }}
    >
      {/* Checkbox column */}
      <td className="px-6 py-4">
        {/* Your checkbox */}
      </td>
      
      {/* Drag handle column */}
      <td className="px-2 py-4">
        <GripVertical 
          className="w-4 h-4 cursor-grab active:cursor-grabbing" 
          style={{ color: branding.colors.mutedText }} 
        />
      </td>
      
      {/* Rest of your columns */}
      {/* ... */}
    </tr>
  );
}
```

### 8. Use DraggableRow in Table

```typescript
<tbody className="divide-y" style={{ borderColor: branding.colors.borderColor }}>
  {filteredAndSortedItems.map((item, index) => (
    <DraggableRow
      key={item.id}
      item={item}
      index={index}
      moveItem={moveItem}
      // ... other props
    />
  ))}
</tbody>
```

---

## 🎨 Visual Standards

### Drag Handle
- **Icon:** `<GripVertical />` from lucide-react
- **Size:** `w-4 h-4`
- **Color:** `branding.colors.mutedText`
- **Cursor:** `cursor-grab` (idle), `cursor-grabbing` (active)
- **Position:** Second column (after checkbox)

### Dragging State
- **Opacity:** `opacity-50` for the dragged row
- **Cursor:** `cursor-move` on the entire row
- **Transition:** `transition-opacity` for smooth effect

### Drop Target
- **Background:** `bg-purple-50` when hovering over valid drop target
- **Or use branding:** `background: ${branding.colors.primaryButton}10`

### Row Styling
```typescript
className={cn(
  'hover:opacity-80 transition-opacity',
  isDragging && 'opacity-50',
  isOver && 'bg-purple-50'
)}
style={{ 
  background: branding.colors.cardBackground,
  cursor: 'move',
}}
```

---

## 📋 Table Header Structure

When drag-and-drop is enabled, the table should have:

```typescript
<thead>
  <tr>
    <th className="px-6 py-3 text-left w-12">
      {/* Checkbox for select all */}
    </th>
    <th className="px-2 py-3 w-12">
      {/* Drag handle icon (static) */}
      <GripVertical className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
    </th>
    {/* Rest of sortable/regular columns */}
  </tr>
</thead>
```

---

## ✅ UX Considerations

### Visual Feedback
1. **Cursor changes** - Show grab/grabbing cursors
2. **Opacity** - Reduce opacity of dragged item
3. **Hover state** - Highlight drop target
4. **Smooth transitions** - Use CSS transitions

### Behavior
1. **Instant update** - State updates immediately on drop
2. **No confirmation** - Direct manipulation
3. **Toast notification** - Optional (not always needed for reordering)
4. **Maintain order** - Order persists when filtering/searching is cleared

### Accessibility
1. **Keyboard support** - Consider adding keyboard shortcuts (↑/↓ arrows)
2. **Touch support** - Works with HTML5Backend on touch devices
3. **Visual indicators** - Clear drag handle for discoverability

---

## 🔄 Interaction with Sorting

### Priority Rules
1. **Active sort field** - Overrides displayOrder
2. **No active sort** - Falls back to displayOrder
3. **Clear sort** - Returns to displayOrder

### Implementation
```typescript
if (sortField && sortDirection) {
  // User-initiated sort is active
  filtered = [...filtered].sort((a, b) => {
    // Sort by selected field
  });
} else {
  // No active sort - use manual order
  filtered = [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
}
```

### User Flow
1. User manually reorders items (drag-and-drop)
2. User clicks a column header to sort
3. Table re-sorts by that column
4. User clears sort (click again to remove arrow)
5. Table returns to manual order

---

## 📊 Example Implementation

See: `/pages/client-portal/account-access/ClientPortalAccountAccess.tsx`

**Complete working example with:**
- ✅ DndProvider wrapper
- ✅ displayOrder field
- ✅ moveUser handler
- ✅ DraggableRow component
- ✅ Proper sorting fallback
- ✅ Visual feedback
- ✅ Branding integration

---

## 🚀 Quick Checklist

When implementing drag-and-drop:

- [ ] Install react-dnd and react-dnd-html5-backend
- [ ] Add `displayOrder: number` to data type
- [ ] Initialize displayOrder values (0, 1, 2, ...)
- [ ] Wrap component with `<DndProvider backend={HTML5Backend}>`
- [ ] Create `moveItem()` handler
- [ ] Create `DraggableRow` component with useDrag/useDrop
- [ ] Use unique `type` string for drag items
- [ ] Add GripVertical icon as drag handle
- [ ] Style dragging/hover states
- [ ] Update sorting logic to fallback to displayOrder
- [ ] Handle new items (set displayOrder = items.length)
- [ ] Test drag-and-drop functionality
- [ ] Test interaction with sorting/filtering

---

## 🎯 Common Patterns

### Adding New Items
```typescript
const handleAddItem = (itemData: Partial<YourDataType>) => {
  const newItem: YourDataType = {
    ...itemData,
    id: Date.now().toString(),
    displayOrder: items.length, // Add to end
  } as YourDataType;
  setItems((prev) => [...prev, newItem]);
};
```

### Deleting Items
```typescript
const handleDeleteItem = (itemId: string) => {
  setItems((prev) => {
    // Remove the item
    const filtered = prev.filter((item) => item.id !== itemId);
    // Reindex displayOrder
    return filtered.map((item, index) => ({
      ...item,
      displayOrder: index,
    }));
  });
};
```

### Persisting Order to Backend
```typescript
const handleReorder = async (dragId: string, hoverId: string) => {
  // Update local state immediately
  moveItem(dragId, hoverId);
  
  // Then persist to backend
  try {
    await api.updateDisplayOrder(items);
    toast.success('Order saved');
  } catch (error) {
    toast.error('Failed to save order');
    // Optionally revert state
  }
};
```

---

## 🔍 Troubleshooting

### Drag doesn't work
- ✅ Check DndProvider is wrapping the component
- ✅ Verify HTML5Backend is imported and used
- ✅ Confirm `type` in useDrag matches `accept` in useDrop
- ✅ Ensure ref is attached to the row element

### Order resets after filter
- ✅ Make sure sorting logic falls back to displayOrder
- ✅ Verify displayOrder is preserved when filtering
- ✅ Check that you're not creating new objects without displayOrder

### Visual feedback not working
- ✅ Confirm isDragging and isOver are in collect functions
- ✅ Check CSS classes are applied correctly
- ✅ Verify cursor styles are not being overridden

### Items jump around during drag
- ✅ Use `item.id` comparison in hover callback
- ✅ Don't call moveItem on every hover, only when IDs differ
- ✅ Consider using `monitor.isOver({ shallow: true })`

---

## 📚 Related Standards

- **🧰 Toolbox: Draggable Table** - `/TOOLBOX_DRAGGABLE_TABLE.md` - **START HERE for reusable components!**
- **Table Standards Master Checklist** - `/guidelines/TABLE_UNIVERSAL_CHECKLIST.md`
- **Table Header Background** - `/TABLE_HEADER_BACKGROUND_STANDARD.md`
- **Table Header Styling** - `/TABLE_HEADER_STYLING_STANDARD.md`
- **Branding Colors** - Use `branding.colors` throughout
- **Icon Standards** - `/TABLE_ICON_STANDARDS.md`

---

## ✅ Success Criteria

A properly implemented drag-and-drop table should:

1. ✅ **Visual drag handle** - GripVertical icon visible and interactive
2. ✅ **Cursor feedback** - Changes to grab/grabbing during interaction
3. ✅ **Smooth dragging** - Row follows cursor with opacity change
4. ✅ **Clear drop target** - Hover state shows where item will be dropped
5. ✅ **Instant update** - Order changes immediately on drop
6. ✅ **Persistent order** - Manual order maintained when filters cleared
7. ✅ **Sort interaction** - Works alongside sortable columns
8. ✅ **New items** - Added to end with correct displayOrder
9. ✅ **Branding** - Uses branding colors consistently
10. ✅ **No errors** - Console is clean, no warnings

---

## 🎨 Code Template

```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 1. Add displayOrder to your type
export type Item = {
  id: string;
  displayOrder: number;
  // ... other fields
};

// 2. Create move handler
const moveItem = (dragId: string, hoverId: string) => {
  const dragIndex = items.findIndex((i) => i.id === dragId);
  const hoverIndex = items.findIndex((i) => i.id === hoverId);
  if (dragIndex === -1 || hoverIndex === -1) return;
  
  const newItems = [...items];
  const [draggedItem] = newItems.splice(dragIndex, 1);
  newItems.splice(hoverIndex, 0, draggedItem);
  
  setItems(newItems.map((item, index) => ({
    ...item,
    displayOrder: index,
  })));
};

// 3. Create draggable row component
function DraggableRow({ item, index, moveItem }: Props) {
  const ref = useRef<HTMLTableRowElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM_ROW',
    item: { id: item.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  
  const [{ isOver }, drop] = useDrop({
    accept: 'ITEM_ROW',
    hover: (dragItem: { id: string }) => {
      if (dragItem.id !== item.id) {
        moveItem(dragItem.id, item.id);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  
  drag(drop(ref));
  
  return (
    <tr
      ref={ref}
      className={cn(
        'hover:opacity-80 transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'bg-purple-50'
      )}
      style={{ cursor: 'move' }}
    >
      <td>
        <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
      </td>
      {/* Other cells */}
    </tr>
  );
}

// 4. Wrap with DndProvider and use component
return (
  <DndProvider backend={HTML5Backend}>
    <table>
      <tbody>
        {items.map((item, index) => (
          <DraggableRow key={item.id} item={item} index={index} moveItem={moveItem} />
        ))}
      </tbody>
    </table>
  </DndProvider>
);
```

---

## 🎉 You're All Set!

This pattern provides a **consistent, reliable drag-and-drop reordering experience** across all tables in the application.

**Live Example:** Client Portal → Account Access → Drag user rows up/down

---

*Last Updated: October 31, 2025*
*Standard Version: 1.0*
*Status: ✅ Active and Required*
