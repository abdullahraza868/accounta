import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../ui/badge';
import {
  Eye,
  EyeOff,
  Edit,
  Check,
  X,
  Shield,
  Info,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useNavigationConfig, TopbarItem } from '../../contexts/NavigationConfigContext';

type TopbarItemRowProps = {
  item: TopbarItem;
  toggleItem: (id: string) => void;
  canEdit: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
};

function TopbarItemRow({
  item,
  toggleItem,
  canEdit,
  editingId,
  setEditingId,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
}: TopbarItemRowProps) {
  const Icon = item.icon;
  const isEditing = editingId === item.id;

  const handleEditClick = () => {
    if (canEdit) {
      setEditingId(item.id);
      setEditValue(item.label);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Main box */}
      <div
        onClick={() => !isEditing && canEdit && handleEditClick()}
        className={`flex-1 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-4 flex items-center gap-3 border border-purple-100 dark:border-purple-900/30 transition-all ${
          !item.visible ? 'opacity-40' : ''
        } ${canEdit && !isEditing ? 'cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20' : ''}`}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            background: 'rgba(var(--primaryColorBtnRgb), 0.1)',
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
              <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
              {canEdit && (
                <Badge 
                  variant="outline" 
                  className="flex-shrink-0 text-xs border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                >
                  Editable
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action button outside the box */}
      {!isEditing && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant={item.visible ? "outline" : "default"}
            size="sm"
            onClick={() => toggleItem(item.id)}
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

function TopbarNavigationContent() {
  const { config, updateTopbar } = useNavigationConfig();
  const [items, setItems] = useState(config.topbar);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // First 4 items can be edited (Clients, Add Task, Message, Text Messages)
  const editableIds = ['clients', 'add-task', 'message', 'text-messages'];

  const toggleItem = (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    setItems(newItems);
    updateTopbar(newItems);
    
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
    const newItems = items.map(item =>
      item.id === editingId ? { ...item, label: editValue.trim() } : item
    );
    setItems(newItems);
    updateTopbar(newItems);
    toast.success('Item renamed');
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
        <h2 className="text-gray-900 dark:text-gray-100 mb-1">Topbar Navigation</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Control visibility and edit names for topbar items. Click on editable items to rename them.
        </p>
      </div>

      {/* Info Banners */}
      <div className="mx-6 mt-6 space-y-3">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Editable Items</p>
              <p>The first three items (Clients, Add Task, Message) can be renamed by clicking on them.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-700 dark:text-purple-300">
              <p className="font-medium mb-1">System Items</p>
              <p>Topbar items cannot be reordered or deleted. You can only control visibility and edit certain labels.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topbar Items List */}
      <div className="p-6 space-y-3">
        {items.map((item) => (
          <TopbarItemRow
            key={item.id}
            item={item}
            toggleItem={toggleItem}
            canEdit={editableIds.includes(item.id)}
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

export function TopbarNavigationTab() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-8">
        <TooltipProvider>
          <TopbarNavigationContent />
        </TooltipProvider>
      </div>
    </div>
  );
}