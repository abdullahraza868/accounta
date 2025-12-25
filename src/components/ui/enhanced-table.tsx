import { useState, useMemo, useCallback, useEffect, forwardRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './table';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Settings2, ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { cn } from './utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type ColumnDef<T> = {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
};

type EnhancedTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableColumnVisibility?: boolean;
  storageKey?: string;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const SortableHeader = forwardRef<
  HTMLTableCellElement,
  { 
    id: string; 
    children: React.ReactNode; 
    width?: number;
    isResizing?: boolean;
    onResize?: (e: React.MouseEvent) => void;
    isDragging?: boolean;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
  }
>(({ 
  id, 
  children, 
  width, 
  isResizing, 
  onResize,
  isDragging,
  style,
  attributes,
  listeners,
}, ref) => {
  return (
    <TableHead
      ref={ref}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50',
        isResizing && 'select-none'
      )}
    >
      <div className="flex items-center gap-2">
        {listeners && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
      {onResize && (
        <div
          onMouseDown={onResize}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ zIndex: 10 }}
        />
      )}
    </TableHead>
  );
});

SortableHeader.displayName = 'SortableHeader';

function DraggableHeaderCell({ 
  id, 
  children, 
  width, 
  isResizing, 
  onResize,
  enableReorder,
}: { 
  id: string; 
  children: React.ReactNode; 
  width?: number;
  isResizing?: boolean;
  onResize?: (e: React.MouseEvent) => void;
  enableReorder?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !enableReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: width ? `${width}px` : undefined,
  };

  return (
    <SortableHeader
      ref={setNodeRef}
      id={id}
      width={width}
      isResizing={isResizing}
      onResize={onResize}
      isDragging={isDragging}
      style={style}
      attributes={attributes}
      listeners={enableReorder ? listeners : undefined}
    >
      {children}
    </SortableHeader>
  );
}

export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  onRowClick,
  className,
  enableColumnResize = true,
  enableColumnReorder = true,
  enableColumnVisibility = true,
  storageKey,
}: EnhancedTableProps<T>) {
  // Load saved configuration
  const savedConfig = storageKey ? localStorage.getItem(`table-config-${storageKey}`) : null;
  const config = savedConfig ? JSON.parse(savedConfig) : null;

  const [columnOrder, setColumnOrder] = useState<string[]>(
    config?.order || initialColumns.map(c => c.id)
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    config?.widths || {}
  );
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    new Set(config?.hidden || [])
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save configuration
  const saveConfig = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(`table-config-${storageKey}`, JSON.stringify({
        order: columnOrder,
        widths: columnWidths,
        hidden: Array.from(hiddenColumns),
      }));
    }
  }, [storageKey, columnOrder, columnWidths, hiddenColumns]);

  // Handle column reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder;
      });
      setTimeout(saveConfig, 0);
    }
  };

  // Handle column resizing
  const handleResizeStart = useCallback((columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    const currentWidth = columnWidths[columnId] || 150;
    setStartWidth(currentWidth);
  }, [columnWidths]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (resizingColumn) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    }
  }, [resizingColumn, startX, startWidth]);

  const handleResizeEnd = useCallback(() => {
    if (resizingColumn) {
      setResizingColumn(null);
      saveConfig();
    }
  }, [resizingColumn, saveConfig]);

  // Add resize event listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [handleResizeMove, handleResizeEnd]);

  // Get ordered and visible columns
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map(id => initialColumns.find(col => col.id === id))
      .filter((col): col is ColumnDef<T> => col !== undefined && !hiddenColumns.has(col.id));
  }, [columnOrder, initialColumns, hiddenColumns]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = initialColumns.find(c => c.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === columnId) {
        if (current.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        } else {
          return null;
        }
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const column = initialColumns.find(c => c.id === sortConfig.key);
    if (!column?.accessorKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[column.accessorKey!];
      const bVal = b[column.accessorKey!];

      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, initialColumns]);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
    setTimeout(saveConfig, 0);
  };

  return (
    <div className={cn('w-full', className)}>
      {enableColumnVisibility && (
        <div className="mb-3 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings2 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {initialColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={!hiddenColumns.has(column.id)}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DndContext
          sensors={enableColumnReorder ? sensors : []}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <SortableContext
                  items={orderedColumns.map(c => c.id)}
                  strategy={horizontalListSortingStrategy}
                  disabled={!enableColumnReorder}
                >
                  {orderedColumns.map((column) => (
                    <DraggableHeaderCell
                      key={column.id}
                      id={column.id}
                      width={columnWidths[column.id] || column.width}
                      isResizing={resizingColumn === column.id}
                      onResize={enableColumnResize ? (e) => handleResizeStart(column.id, e) : undefined}
                      enableReorder={enableColumnReorder}
                    >
                      <button
                        onClick={() => handleSort(column.id)}
                        className={cn(
                          'flex items-center gap-1 w-full text-left transition-colors',
                          column.sortable && 'hover:text-purple-600 dark:hover:text-purple-400'
                        )}
                        disabled={!column.sortable}
                      >
                        <span>{column.header}</span>
                        {column.sortable && (
                          <span className="ml-auto">
                            {sortConfig?.key === column.id ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                            )}
                          </span>
                        )}
                      </button>
                    </DraggableHeaderCell>
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={orderedColumns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  {orderedColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ width: columnWidths[column.id] || column.width }}
                    >
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey])
                        : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </DndContext>
      </div>
    </div>
  );
}
