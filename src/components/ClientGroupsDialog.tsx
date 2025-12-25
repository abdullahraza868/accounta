import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Search, Tag, AlertCircle } from 'lucide-react';
import { cn } from './ui/utils';

export type ClientGroup = {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
};

// Default client groups based on the specification
export const defaultClientGroups: ClientGroup[] = [
  { id: 'lead', name: 'Lead', description: 'Prospective client or new lead', isDefault: true },
  { id: '1040', name: '1040', description: 'Standard individual return', isDefault: true },
  { id: '1040ez', name: '1040EZ', description: 'Simplified individual return (legacy)', isDefault: true },
  { id: '1040nr', name: '1040NR', description: 'Nonresident return', isDefault: true },
  { id: '1040py', name: '1040PY', description: 'Part-year resident', isDefault: true },
  { id: 'sch-a', name: 'Sch A', description: 'Itemized deductions', isDefault: true },
  { id: 'sch-b', name: 'Sch B', description: 'Interest & dividends', isDefault: true },
  { id: 'sch-c', name: 'Sch C', description: 'Sole proprietor / self-employment', isDefault: true },
  { id: 'sch-d', name: 'Sch D', description: 'Capital gains / losses', isDefault: true },
  { id: 'sch-e', name: 'Sch E', description: 'Rental, partnership, or S-Corp income', isDefault: true },
  { id: 'sch-f', name: 'Sch F', description: 'Farming income (optional)', isDefault: true },
  { id: '1065', name: '1065', description: 'Partnership return', isDefault: true },
  { id: '1120s', name: '1120S', description: 'S-Corporation return', isDefault: true },
  { id: '1120', name: '1120', description: 'C-Corporation return', isDefault: true },
  { id: '1041', name: '1041', description: 'Trust / Estate return', isDefault: true },
  { id: '990', name: '990', description: 'Nonprofit organization return', isDefault: true },
  { id: '940', name: '940', description: 'Federal unemployment (FUTA)', isDefault: true },
  { id: '941', name: '941', description: 'Employer\'s quarterly payroll return', isDefault: true },
  { id: 'sch-l', name: 'Sch L', description: 'Balance sheet schedule (business returns)', isDefault: true },
  { id: 'bookkeeping', name: 'Bookkeeping', description: 'Monthly or quarterly accounting work', isDefault: true },
  { id: 'sales-tax', name: 'Sales Tax', description: 'State or local sales/use filings', isDefault: true },
  { id: 'multi-state', name: 'Multi-State', description: 'Income or nexus across multiple states', isDefault: true },
  { id: 'international', name: 'International', description: 'Foreign income, FBAR, or related filings', isDefault: true },
  { id: 'catch-up', name: 'Catch-Up Work', description: 'Prior-year or back-filed returns', isDefault: true },
  { id: 'advisory', name: 'Advisory', description: 'Tax planning or CFO-type advisory', isDefault: true },
  { id: 'entity-formation', name: 'Entity Formation', description: 'New entity setup or registration', isDefault: true },
  { id: 'missing-info', name: 'Missing Info', description: 'Client has incomplete or missing information', isDefault: true },
];

type ClientGroupsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ClientGroup[];
  onUpdateGroups: (groups: ClientGroup[]) => void;
};

export function ClientGroupsDialog({ open, onOpenChange, groups, onUpdateGroups }: ClientGroupsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editingGroup, setEditingGroup] = useState<ClientGroup | null>(null);
  const addFormRef = useRef<HTMLDivElement>(null);

  // Scroll to form when it opens
  useEffect(() => {
    if (showAddForm && addFormRef.current) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [showAddForm]);

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category for better organization
  const categorizedGroups = {
    'Individual Returns': filteredGroups.filter(g => g.name.startsWith('1040')),
    'Schedules': filteredGroups.filter(g => g.name.startsWith('Sch')),
    'Business Returns': filteredGroups.filter(g => ['1065', '1120S', '1120', '1041', '990'].includes(g.name)),
    'Payroll': filteredGroups.filter(g => ['940', '941'].includes(g.name)),
    'Services': filteredGroups.filter(g => ['Bookkeeping', 'Sales Tax', 'Multi-State', 'International', 'Catch-Up Work', 'Advisory', 'Entity Formation'].includes(g.name)),
    'Other': filteredGroups.filter(g => 
      g.name === 'Missing Info' || 
      (!g.name.startsWith('1040') && 
       !g.name.startsWith('Sch') && 
       !['1065', '1120S', '1120', '1041', '990', '940', '941', 'Bookkeeping', 'Sales Tax', 'Multi-State', 'International', 'Catch-Up Work', 'Advisory', 'Entity Formation'].includes(g.name))
    ),
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: ClientGroup = {
      id: newGroupName.toLowerCase().replace(/\s+/g, '-'),
      name: newGroupName,
      description: newGroupDescription,
      isDefault: false,
    };

    onUpdateGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setShowAddForm(false);
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return;

    const updatedGroups = groups.map(g => 
      g.id === editingGroup.id 
        ? { ...g, name: newGroupName, description: newGroupDescription }
        : g
    );

    onUpdateGroups(updatedGroups);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this client group? This cannot be undone.')) {
      onUpdateGroups(groups.filter(g => g.id !== groupId));
    }
  };

  const handleEditGroup = (group: ClientGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="client-groups-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Manage Client Groups
          </DialogTitle>
          <DialogDescription id="client-groups-description">
            Organize clients by tax forms, services, and custom categories. Clients can have multiple groups.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Info Banner */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Tips for Client Groups:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 dark:text-blue-200">
                <li>Keep group names short and consistent</li>
                <li>Clients can belong to multiple groups</li>
                <li>Use "Missing Info" to identify clients needing data</li>
              </ul>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div 
              ref={addFormRef}
              className="mb-4 p-4 border-2 rounded-lg shadow-lg"
              style={{
                borderColor: 'var(--primaryColor)',
                background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.05), rgba(109, 40, 217, 0.03))',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                {editingGroup ? (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                )}
                <h4 className="font-medium" style={{ color: 'var(--primaryColor)' }}>
                  {editingGroup ? 'Edit Group' : 'Add New Group'}
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="group-name">Group Name <span className="text-red-600">*</span></Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Spanish, Crypto, High Net Worth"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea
                    id="group-description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Brief description of this client group..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingGroup ? handleUpdateGroup : handleAddGroup}
                    className="text-white"
                    style={{ background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))' }}
                  >
                    {editingGroup ? 'Update Group' : 'Add Group'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Groups List */}
          <div className="space-y-4">
            {Object.entries(categorizedGroups).map(([category, categoryGroups]) => {
              if (categoryGroups.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {group.name}
                            </span>
                            {group.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                            {group.name === 'Missing Info' && (
                              <Badge variant="destructive" className="text-xs">Alert</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                          {!group.isDefault && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditGroup(group)}
                                className="h-8 px-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGroup(group.id)}
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredGroups.length} groups total
          </div>
          <div className="flex gap-2">
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Custom Group
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}