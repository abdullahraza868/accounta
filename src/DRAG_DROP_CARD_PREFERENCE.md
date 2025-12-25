# Drag and Drop Card Movement Control Preference

## Design Standard

**Movement Control Icon Location: TOP LEFT**

When implementing draggable cards with reordering functionality, the grip icon (drag handle) should always be placed in the **top-left corner** of the card, not the top-right.

## Implementation

```tsx
// Correct placement - top-left
<div className="absolute top-2 left-2 text-gray-400 pointer-events-none z-10">
  <GripVertical className="w-4 h-4" />
</div>
```

## Examples

### ✅ Correct Implementation
- **Signatures Page Stats Cards** - Grip icon in top-left corner
- This allows the right side of cards to display important data/badges without visual clutter

### Key Points
1. Position: `absolute top-2 left-2`
2. Z-index: `z-10` to ensure visibility
3. Pointer events: `pointer-events-none` so it doesn't interfere with drag functionality
4. Color: `text-gray-400` for subtle, unobtrusive appearance

## Rationale

- **Visual Balance**: Important data (numbers, badges) typically appears on the right side
- **User Expectation**: Left-aligned controls follow natural reading flow
- **Consistency**: Maintains uniform UX across all draggable card interfaces
- **Accessibility**: Clear visual indicator without obscuring content

## Files Using This Standard

- `/components/views/SignaturesView.tsx` - DraggableStatCard component

## Future Implementations

When creating new draggable card interfaces, always place the grip icon in the top-left corner following the above pattern.
