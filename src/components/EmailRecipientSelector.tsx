import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  X,
  Users,
  Building2,
  Check,
  Search,
} from 'lucide-react';
import { cn } from './ui/utils';

type RecipientSelectorProps = {
  onClose: () => void;
  onSelectRecipients: (recipients: Array<{ type: 'client' | 'group'; value: string; label: string }>) => void;
};

type Client = {
  id: string;
  name: string;
  email: string;
  type: string;
  groups: string[];
};

type ClientGroup = {
  id: string;
  name: string;
  count: number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
};

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Troy Business Services LLC', email: 'gokhan@troy.com', type: 'Business', groups: ['g1', 'g3'] },
  { id: '3', name: 'Best Face Forward', email: 'jamal@bestface.com', type: 'Business', groups: ['g1'] },
  { id: '11', name: 'John & Mary Smith', email: 'john@smithfamily.com', type: 'Individual', groups: ['g2'] },
  { id: '12', name: 'Sarah Johnson', email: 'sarah@example.com', type: 'Individual', groups: ['g2'] },
  { id: '13', name: 'Tech Innovators Inc', email: 'contact@techinnovators.com', type: 'Business', groups: ['g1', 'g3'] },
  { id: '14', name: 'Green Valley Farms', email: 'info@greenvalley.com', type: 'Business', groups: ['g1'] },
  { id: '15', name: 'David Wilson', email: 'david.w@example.com', type: 'Individual', groups: ['g2'] },
];

const CLIENT_GROUPS: ClientGroup[] = [
  { id: 'g1', name: 'All Business Clients', count: 24, color: 'blue' },
  { id: 'g2', name: '1040 Clients', count: 156, color: 'green' },
  { id: 'g3', name: 'Quarterly Filers', count: 45, color: 'purple' },
];

export function EmailRecipientSelector({ onClose, onSelectRecipients }: RecipientSelectorProps) {
  const [selectionMethod, setSelectionMethod] = useState<'groups' | 'individual'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [clientTypeFilter, setClientTypeFilter] = useState<'All' | 'Individual' | 'Business'>('All');

  // When groups are selected/deselected, update clients accordingly
  const handleGroupToggle = (groupId: string) => {
    const newGroups = new Set(selectedGroups);
    const newClients = new Set(selectedClients);

    if (newGroups.has(groupId)) {
      // Remove group and its clients
      newGroups.delete(groupId);
      MOCK_CLIENTS.forEach(client => {
        if (client.groups.includes(groupId)) {
          newClients.delete(client.id);
        }
      });
    } else {
      // Add group and all its clients
      newGroups.add(groupId);
      MOCK_CLIENTS.forEach(client => {
        if (client.groups.includes(groupId)) {
          newClients.add(client.id);
        }
      });
    }

    setSelectedGroups(newGroups);
    setSelectedClients(newClients);
  };

  const handleClientToggle = (clientId: string) => {
    const newClients = new Set(selectedClients);
    if (newClients.has(clientId)) {
      newClients.delete(clientId);
    } else {
      newClients.add(clientId);
    }
    setSelectedClients(newClients);
  };

  const handleConfirm = () => {
    const recipients: Array<{ type: 'client' | 'group'; value: string; label: string }> = [];
    
    // Add selected groups
    selectedGroups.forEach(groupId => {
      const group = CLIENT_GROUPS.find(g => g.id === groupId);
      if (group) {
        recipients.push({
          type: 'group',
          value: group.id,
          label: group.name,
        });
      }
    });

    // Add selected individual clients (only those not from groups in group mode)
    if (selectionMethod === 'individual') {
      selectedClients.forEach(clientId => {
        const client = MOCK_CLIENTS.find(c => c.id === clientId);
        if (client) {
          recipients.push({
            type: 'client',
            value: client.id,
            label: client.name,
          });
        }
      });
    } else {
      // In group mode, add individual clients that were manually selected
      selectedClients.forEach(clientId => {
        const client = MOCK_CLIENTS.find(c => c.id === clientId);
        if (client) {
          // Only add if not part of any selected group
          const isPartOfSelectedGroup = client.groups.some(gId => selectedGroups.has(gId));
          if (!isPartOfSelectedGroup) {
            recipients.push({
              type: 'client',
              value: client.id,
              label: client.name,
            });
          }
        }
      });
    }

    onSelectRecipients(recipients);
    onClose();
  };

  const filteredClients = MOCK_CLIENTS.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(client => {
    if (clientTypeFilter === 'All') return true;
    return client.type === clientTypeFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Recipients</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select clients or client groups to send email
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Help Text */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Mix & Match Client Selection
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    You can combine both methods! Start with client groups for broad coverage, then fine-tune by adding or removing individual clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Selection Method */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Selection Method
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectionMethod('groups')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    selectionMethod === 'groups'
                      ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                      selectionMethod === 'groups'
                        ? 'bg-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}>
                      {selectionMethod === 'groups' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        By Client Group
                      </h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Select groups, then remove specific clients if needed
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectionMethod('individual')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    selectionMethod === 'individual'
                      ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                      selectionMethod === 'individual'
                        ? 'bg-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}>
                      {selectionMethod === 'individual' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        Individual Clients
                      </h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Manually pick specific clients one by one
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Client Groups Selection */}
            {selectionMethod === 'groups' && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Select Client Groups
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CLIENT_GROUPS.map((group) => {
                    const isSelected = selectedGroups.has(group.id);
                    const colorClasses = {
                      green: 'border-green-500 bg-green-50 dark:bg-green-900/30',
                      blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
                      purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/30',
                      orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30',
                      gray: 'border-gray-500 bg-gray-50 dark:bg-gray-900/30',
                    }[group.color];

                    return (
                      <button
                        key={group.id}
                        onClick={() => handleGroupToggle(group.id)}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? colorClasses
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h6 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                            {group.name}
                          </h6>
                          <div className={cn(
                            'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                            isSelected
                              ? `bg-${group.color}-600`
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {group.count} clients
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Individual Client Selection */}
            {selectionMethod === 'individual' && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Search and Select Clients
                </h5>
                
                {/* Client Type Filter Pills */}
                <div className="flex gap-2 mb-3">
                  {(['All', 'Individual', 'Business'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setClientTypeFilter(filter)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        clientTypeFilter === filter
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search clients by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClients.has(client.id);
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleClientToggle(client.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 transition-all rounded-lg border",
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100"
                        )}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all',
                          isSelected
                            ? 'bg-purple-600'
                            : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        
                        {/* Client Info */}
                        <div className="flex-1 text-left min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isSelected 
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          )}>
                            {client.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.groups.map(gId => {
                              const group = CLIENT_GROUPS.find(g => g.id === gId);
                              if (!group) return null;
                              
                              const pillColors = {
                                green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                              }[group.color];

                              return (
                                <span
                                  key={gId}
                                  className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                    pillColors
                                  )}
                                >
                                  {group.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {filteredClients.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No clients match your search
                  </div>
                )}
              </div>
            )}

            {/* Selection Summary with Details */}
            {(selectedGroups.size > 0 || selectedClients.size > 0) && (
              <div className="p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Selection Summary
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {selectedGroups.size > 0 && `${selectedGroups.size} group(s)`}
                      {selectedGroups.size > 0 && selectedClients.size > 0 && ', '}
                      {selectedClients.size > 0 && `${selectedClients.size} client(s)`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroups(new Set());
                      setSelectedClients(new Set());
                    }}
                  >
                    Clear All
                  </Button>
                </div>
                
                {/* Selected Groups */}
                {selectedGroups.size > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Groups:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedGroups).map(groupId => {
                        const group = CLIENT_GROUPS.find(g => g.id === groupId);
                        if (!group) return null;
                        
                        const pillColors = {
                          green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
                          blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700',
                          purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700',
                          orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700',
                          gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700',
                        }[group.color];

                        return (
                          <Badge
                            key={groupId}
                            variant="secondary"
                            className={cn('gap-1 border', pillColors)}
                          >
                            <Users className="w-3 h-3" />
                            <span>{group.name}</span>
                            <span className="opacity-70">({group.count})</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Clients */}
                {selectedClients.size > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Clients:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedClients).map(clientId => {
                        const client = MOCK_CLIENTS.find(c => c.id === clientId);
                        if (!client) return null;

                        return (
                          <Badge
                            key={clientId}
                            variant="secondary"
                            className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700"
                          >
                            <Building2 className="w-3 h-3" />
                            <span>{client.name}</span>
                            <span className="opacity-70 text-xs">({client.email})</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedGroups.size === 0 && selectedClients.size === 0}
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <Check className="w-4 h-4 mr-2" />
            Add Recipients
          </Button>
        </div>
      </Card>
    </div>
  );
}