import { useState } from 'react';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Check,
  X,
  Shield,
  Info,
  Star,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useNavigationConfig, ClientFolderTab as ClientFolderTabType } from '../../contexts/NavigationConfigContext';

type DraggableItemProps = {
  item: ClientFolderTabType;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleVisibility: (id: string) => void;
  isFirst: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
};

function DraggableFolderItem({ 
  item, 
  index, 
  moveItem,
  toggleVisibility,
  isFirst,
  editingId,
  setEditingId,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit
}: DraggableItemProps) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'folder-item',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'folder-item',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const Icon = item.icon;
  const isEditing = editingId === item.id;

  const handleEditClick = () => {
    setEditingId(item.id);
    setEditValue(item.label);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Main draggable box */}
      <div
        ref={(node) => drag(drop(preview(node)))}
        onClick={() => !isEditing && handleEditClick()}
        className={`flex-1 rounded-lg p-4 flex items-center gap-3 border transition-all cursor-grab active:cursor-grabbing ${
          isDragging 
            ? 'opacity-50' 
            : ''
        } ${!item.visible && !isDragging ? 'opacity-40' : ''} ${
          isFirst
            ? 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 border-purple-300 dark:border-purple-700'
            : 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30'
        }`}
      >
        {/* Drag Handle Icon (visual only) */}
        <div>
          <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            background: isFirst 
              ? 'rgba(var(--primaryColorBtnRgb), 0.2)' 
              : 'rgba(var(--primaryColorBtnRgb), 0.1)',
          }}
        >
          <Icon 
            className="w-5 h-5" 
            style={{ color: 'var(--primaryColor)' }}
          />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="h-8 flex-1"
                autoFocus
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.stopPropagation()}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEdit();
                    }}
                    className="h-8 w-auto px-3 text-green-600 hover:text-green-700 dark:text-green-400 gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                    className="h-8 w-auto px-3 text-red-600 hover:text-red-700 dark:text-red-400 gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-900 dark:text-gray-100">
                {item.label}
              </span>

              {/* Default Tab Badge */}
              {isFirst && (
                <Badge className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 flex-shrink-0">
                  <Star className="w-3 h-3 mr-1" />
                  Default Tab
                </Badge>
              )}
              {/* Edit indicator */}
              {!isEditing && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons outside the box */}
      {!isEditing && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Visibility Toggle */}
          <Button
            variant={item.visible ? "outline" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(item.id);
            }}
            className={
              item.visible
                ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            }
          >
            {item.visible ? 'Hide' : 'Show'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ClientFolderContent() {
  const { config, updateClientFolder } = useNavigationConfig();
  const [folderItems, setFolderItems] = useState<ClientFolderTabType[]>(config.clientFolder);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = folderItems[dragIndex];
    const newItems = [...folderItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Update order property
    const reorderedItems = newItems.map((item, idx) => ({ ...item, order: idx }));
    setFolderItems(reorderedItems);
    updateClientFolder(reorderedItems);
    
    // Show toast when item becomes first
    if (hoverIndex === 0) {
      toast.success(`${draggedItem.label} is now the default tab`);
    }
  };

  const toggleVisibility = (id: string) => {
    const newItems = folderItems.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    setFolderItems(newItems);
    updateClientFolder(newItems);
    
    const item = newItems.find(i => i.id === id);
    if (item) {
      toast.success(`${item.label} ${item.visible ? 'shown' : 'hidden'}`);
    }
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const newItems = folderItems.map(item =>
      item.id === editingId ? { ...item, label: editValue.trim() } : item
    );
    setFolderItems(newItems);
    updateClientFolder(newItems);
    toast.success('Tab renamed');
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-gray-900 dark:text-gray-100 mb-1">Client Folder Tabs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Drag entire boxes to reorder tabs. Click Edit to rename items.
        </p>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Default Tab Behavior</p>
              <p>The first tab in the list will be the default tab that opens when you click on a client folder.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Items List */}
      <div className="p-6 space-y-3">
        {folderItems.map((item, index) => (
          <DraggableFolderItem
            key={item.id}
            item={item}
            index={index}
            moveItem={moveItem}
            toggleVisibility={toggleVisibility}
            isFirst={index === 0}
            editingId={editingId}
            setEditingId={setEditingId}
            editValue={editValue}
            setEditValue={setEditValue}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
          />
        ))}
      </div>
    </Card>
  );
}

export function ClientFolderTab() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-8">
        <DndProvider backend={HTML5Backend}>
          <TooltipProvider>
            <ClientFolderContent />
          </TooltipProvider>
        </DndProvider>
      </div>
    </div>
  );
}