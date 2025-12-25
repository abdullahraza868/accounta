import { useState, useEffect, useRef } from 'react';
import { Client } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Tag, Plus, X, Check, Search, Trash2 } from 'lucide-react';
import { cn } from './ui/utils';

type ManageClientGroupsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSave: (groups: string[]) => void;
};

export function ManageClientGroupsDialog({
  open,
  onOpenChange,
  client,
  onSave
}: ManageClientGroupsDialogProps) {
  // Mock available groups - in real app, fetch from API
  const availableGroupsData = [
    'Premium',
    'Trial',
    'FreeTrial',
    'Fit-St Premium',
    'VIP',
    'Tax Services',
    'Bookkeeping',
    'Quarterly Review',
    'Annual Review',
    'New Client',
    'High Priority'
  ];

  const [availableGroups, setAvailableGroups] = useState<string[]>(availableGroupsData);
  
  // Combine client.group and client.tags into one array
  const getClientGroups = () => {
    const groups: string[] = [];
    if (client.group) groups.push(client.group);
    if (client.tags) groups.push(...client.tags);
    return groups;
  };
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>(getClientGroups());
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedGroups(getClientGroups());
      setSearchQuery('');
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  }, [open, client]);

  // Auto-focus when adding group
  useEffect(() => {
    if (isAddingGroup && newGroupInputRef.current) {
      newGroupInputRef.current.focus();
    }
  }, [isAddingGroup]);

  const filteredGroups = availableGroups.filter(group =>
    group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleGroup = (group: string) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter(g => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() && !availableGroups.includes(newGroupName.trim())) {
      const newGroup = newGroupName.trim();
      setAvailableGroups([...availableGroups, newGroup]);
      setSelectedGroups([...selectedGroups, newGroup]);
      setNewGroupName('');
      setIsAddingGroup(false);
      setSearchQuery('');
    }
  };

  const handleRemoveGroup = (group: string) => {
    setAvailableGroups(availableGroups.filter(g => g !== group));
    setSelectedGroups(selectedGroups.filter(g => g !== group));
  };

  const handleSave = () => {
    onSave(selectedGroups);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" aria-describedby="manage-client-groups-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Manage Client Groups
          </DialogTitle>
          <DialogDescription id="manage-client-groups-description">
            Assign {client.name} to groups for better organization and filtering
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected Groups Preview */}
          {selectedGroups.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                Selected Groups ({selectedGroups.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedGroups.map((group, index) => (
                  <Badge 
                    key={index}
                    className="px-2.5 py-1 text-xs flex items-center gap-1"
                    style={{ 
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      color: 'var(--primaryColor)',
                      borderColor: 'var(--primaryColor)'
                    }}
                  >
                    {group}
                    <button
                      onClick={() => handleToggleGroup(group)}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Groups List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Available Groups</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingGroup(true)}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Group
              </Button>
            </div>

            <ScrollArea className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 space-y-1">
                {/* Add New Group Form */}
                {isAddingGroup && (
                  <div className="p-3 border-2 border-dashed rounded-lg mb-2" style={{ borderColor: 'var(--primaryColor)' }}>
                    <div className="flex gap-2">
                      <Input
                        ref={newGroupInputRef}
                        placeholder="Enter new group name..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddGroup();
                          } else if (e.key === 'Escape') {
                            setIsAddingGroup(false);
                            setNewGroupName('');
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddGroup}
                        disabled={!newGroupName.trim()}
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                        className="text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingGroup(false);
                          setNewGroupName('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Group List */}
                {filteredGroups.length === 0 && !isAddingGroup && (
                  <div className="text-center py-8">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No groups found</p>
                  </div>
                )}

                {filteredGroups.map((group) => (
                  <div
                    key={group}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                      selectedGroups.includes(group)
                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                    onClick={() => handleToggleGroup(group)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        selectedGroups.includes(group)
                          ? "border-purple-600 dark:border-purple-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      style={selectedGroups.includes(group) ? { 
                        backgroundColor: 'var(--primaryColor)',
                        borderColor: 'var(--primaryColor)'
                      } : {}}
                      >
                        {selectedGroups.includes(group) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{group}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveGroup(group);
                      }}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                      title="Delete group"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500">
            {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              style={{ backgroundColor: 'var(--primaryColor)' }}
              className="text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}