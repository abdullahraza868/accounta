import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from './utils';

/**
 * Draggable Table Row Component
 * 
 * A reusable component that makes table rows draggable for reordering.
 * 
 * @example
 * ```tsx
 * import { DndProvider } from 'react-dnd';
 * import { HTML5Backend } from 'react-dnd-html5-backend';
 * import { DraggableTableRow } from './components/ui/draggable-table-row';
 * 
 * // Wrap your table with DndProvider
 * <DndProvider backend={HTML5Backend}>
 *   <table>
 *     <tbody>
 *       {items.map((item, index) => (
 *         <DraggableTableRow
 *           key={item.id}
 *           id={item.id}
 *           index={index}
 *           type="YOUR_ITEM_TYPE"
 *           onMove={handleMove}
 *         >
 *           <td>Content</td>
 *         </DraggableTableRow>
 *       ))}
 *     </tbody>
 *   </table>
 * </DndProvider>
 * ```
 */

export interface DraggableTableRowProps {
  /** Unique identifier for this row */
  id: string;
  /** Current index in the list */
  index: number;
  /** Unique type identifier for drag/drop (e.g., 'USER_ROW', 'TASK_ROW') */
  type: string;
  /** Callback when row is moved */
  onMove: (dragId: string, hoverId: string) => void;
  /** Child elements (table cells) */
  children: React.ReactNode;
  /** Additional className for styling */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Background color for the row (defaults to card background) */
  backgroundColor?: string;
  /** Whether to show hover highlight (defaults to true) */
  showHoverHighlight?: boolean;
  /** Custom hover highlight color (defaults to purple-50) */
  hoverHighlightColor?: string;
}

export function DraggableTableRow({
  id,
  index,
  type,
  onMove,
  children,
  className,
  style,
  backgroundColor,
  showHoverHighlight = true,
  hoverHighlightColor = 'bg-purple-50',
}: DraggableTableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: type,
    hover: (item: { id: string; index: number }) => {
      if (item.id !== id) {
        onMove(item.id, id);
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
        'transition-opacity',
        isDragging && 'opacity-50',
        showHoverHighlight && isOver && hoverHighlightColor,
        className
      )}
      style={{
        cursor: 'move',
        backgroundColor,
        ...style,
      }}
    >
      {children}
    </tr>
  );
}

/**
 * Standard drag handle cell component
 * Use as the first or second cell in your draggable row
 */
export interface DragHandleCellProps {
  /** Icon component to use (defaults to GripVertical) */
  icon?: React.ReactNode;
  /** Icon color class (defaults to text-white/90 for table headers, or custom) */
  iconColor?: string;
  /** Padding class (defaults to px-2 py-4) */
  padding?: string;
}

export function DragHandleCell({
  icon,
  iconColor = 'text-gray-400',
  padding = 'px-2 py-4',
}: DragHandleCellProps) {
  return (
    <td className={padding}>
      {icon || (
        <div className={cn('w-4 h-4 cursor-grab active:cursor-grabbing', iconColor)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      )}
    </td>
  );
}

/**
 * Hook for handling row reordering
 * 
 * @example
 * ```tsx
 * const [items, setItems] = useState(myItems);
 * const handleMove = useDragReorder(items, setItems);
 * 
 * // Use in DraggableTableRow
 * <DraggableTableRow onMove={handleMove} ... />
 * ```
 */
export function useDragReorder<T extends { id: string; displayOrder: number }>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) {
  return (dragId: string, hoverId: string) => {
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
}
