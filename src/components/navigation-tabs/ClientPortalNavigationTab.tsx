import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Check,
  X,
  Plus,
  Shield,
  type LucideIcon,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Home,
  FileText,
  Folder,
  Mail,
  Phone,
  Calendar,
  Settings,
  Users,
} from 'lucide-react';
import { AddCustomLinkDialog, CustomLink } from '../dialogs/AddCustomLinkDialog';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useNavigationConfig, ClientPortalNavItem } from '../../contexts/NavigationConfigContext';

// Icon mapping for custom links
const iconMap: Record<string, LucideIcon> = {
  'globe': Globe,
  'link': LinkIcon,
  'external-link': ExternalLink,
  'home': Home,
  'file-text': FileText,
  'folder': Folder,
  'mail': Mail,
  'phone': Phone,
  'calendar': Calendar,
  'settings': Settings,
  'users': Users,
};

type DraggableItemProps = {
  item: ClientPortalNavItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleVisibility: (id: string) => void;
  deleteItem: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  onEditCustomLink?: (item: ClientPortalNavItem) => void;
};

function DraggableMenuItem({ 
  item, 
  index, 
  moveItem, 
  toggleVisibility, 
  deleteItem,
  editingId,
  setEditingId,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
  onEditCustomLink
}: DraggableItemProps) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'menu-item',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'menu-item',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

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
        className={`flex-1 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-4 flex items-center gap-3 border border-purple-100 dark:border-purple-900/30 transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50' : ''
        } ${!item.visible && !isDragging ? 'opacity-40' : ''}`}
      >
        {/* Drag Handle Icon (visual only) */}
        <div>
          <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Icon + Label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              background: 'rgba(var(--primaryColorBtnRgb), 0.1)',
            }}
          >
            <item.icon 
              className="w-5 h-5" 
              style={{ color: 'var(--primaryColor)' }}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
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
                        className="h-8 w-auto px-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Cancel</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cancel</TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <span className="text-gray-900 dark:text-gray-100 truncate">
                    {item.label}
                  </span>
                  {item.isSystem && (
                    <Badge 
                      variant="outline" 
                      className="flex-shrink-0 text-xs border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      System
                    </Badge>
                  )}
                </>
              )}
            </div>
            {item.url && !isEditing && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {item.openBehavior === 'new-window' ? (
                  <ExternalLink className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                <span className="truncate">{item.url}</span>
              </div>
            )}
            {/* Edit indicator */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </div>
            )}
          </div>
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

          {/* Delete - Only for custom items */}
          {!item.isSystem && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="h-8 w-8 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}

function ClientPortalNavigationContent() {
  const { config, updateClientPortalNav } = useNavigationConfig();
  const [menuItems, setMenuItems] = useState<ClientPortalNavItem[]>(config.clientPortalNav);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = menuItems[dragIndex];
    const newItems = [...menuItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Update order property
    const reorderedItems = newItems.map((item, idx) => ({ ...item, order: idx }));
    setMenuItems(reorderedItems);
    updateClientPortalNav(reorderedItems);
  };

  const toggleVisibility = (id: string) => {
    const newItems = menuItems.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    setMenuItems(newItems);
    updateClientPortalNav(newItems);
    
    const item = newItems.find(i => i.id === id);
    if (item) {
      toast.success(`${item.label} ${item.visible ? 'shown' : 'hidden'}`);
    }
  };

  const deleteItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (item?.isSystem) {
      toast.error('Cannot delete system items');
      return;
    }
    const newItems = menuItems.filter(item => item.id !== id);
    setMenuItems(newItems);
    updateClientPortalNav(newItems);
    toast.success('Menu item deleted');
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const newItems = menuItems.map(item =>
      item.id === editingId ? { ...item, label: editValue.trim() } : item
    );
    setMenuItems(newItems);
    updateClientPortalNav(newItems);
    toast.success('Item renamed');
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddCustomLink = (link: CustomLink) => {
    const newItem: ClientPortalNavItem = {
      id: link.id,
      icon: iconMap[link.icon] || Globe,
      label: link.name,
      visible: true,
      isSystem: false,
      url: link.url,
      openBehavior: link.openBehavior,
      order: menuItems.length,
    };
    const newItems = [...menuItems, newItem];
    setMenuItems(newItems);
    updateClientPortalNav(newItems);
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-1">Client Portal Navigation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag entire boxes to reorder. Click Edit to rename items.
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Link
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">System vs Custom Items</p>
              <p>System items cannot be deleted but can be hidden or renamed. Custom links can be fully managed, including deletion.</p>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="p-6 space-y-3">
          {menuItems.map((item, index) => (
            <DraggableMenuItem
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
              toggleVisibility={toggleVisibility}
              deleteItem={deleteItem}
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

      {/* Add Custom Link Dialog */}
      <AddCustomLinkDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCustomLink}
      />
    </>
  );
}

export function ClientPortalNavigationTab() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-8">
        <DndProvider backend={HTML5Backend}>
          <TooltipProvider>
            <ClientPortalNavigationContent />
          </TooltipProvider>
        </DndProvider>
      </div>
    </div>
  );
}