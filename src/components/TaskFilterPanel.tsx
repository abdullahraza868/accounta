import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Filter, X, Users, Building2, User, CheckSquare, Flag, List, Folder, Plus } from 'lucide-react';

interface TaskList {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

interface TaskFilterPanelProps {
  // Separate included and excluded arrays for each filter type
  includedAssignees: string[];
  excludedAssignees: string[];
  includedClients: string[];
  excludedClients: string[];
  includedStatuses: string[];
  excludedStatuses: string[];
  includedPriorities: string[];
  excludedPriorities: string[];
  includedTaskLists: string[];
  excludedTaskLists: string[];
  
  // Current mode for each filter type (affects new selections only)
  assigneeMode?: 'include' | 'exclude';
  clientMode?: 'include' | 'exclude';
  statusMode?: 'include' | 'exclude';
  priorityMode?: 'include' | 'exclude';
  taskListMode?: 'include' | 'exclude';
  
  // Data
  allAssignees: string[];
  allClients: Array<{ name: string; type: 'business' | 'individual' }>;
  allTaskLists: TaskList[];
  customStatuses?: string[];
  
  // Handlers for included/excluded arrays
  onIncludedAssigneesChange: (assignees: string[]) => void;
  onExcludedAssigneesChange: (assignees: string[]) => void;
  onIncludedClientsChange: (clients: string[]) => void;
  onExcludedClientsChange: (clients: string[]) => void;
  onIncludedStatusesChange: (statuses: string[]) => void;
  onExcludedStatusesChange: (statuses: string[]) => void;
  onIncludedPrioritiesChange: (priorities: string[]) => void;
  onExcludedPrioritiesChange: (priorities: string[]) => void;
  onIncludedTaskListsChange: (taskLists: string[]) => void;
  onExcludedTaskListsChange: (taskLists: string[]) => void;
  
  // Mode change handlers
  onAssigneeModeChange?: (mode: 'include' | 'exclude') => void;
  onClientModeChange?: (mode: 'include' | 'exclude') => void;
  onStatusModeChange?: (mode: 'include' | 'exclude') => void;
  onPriorityModeChange?: (mode: 'include' | 'exclude') => void;
  onTaskListModeChange?: (mode: 'include' | 'exclude') => void;
  
  onClose: () => void;
  onClearAll: () => void;
}

export function TaskFilterPanel({
  includedAssignees,
  excludedAssignees,
  includedClients,
  excludedClients,
  includedStatuses,
  excludedStatuses,
  includedPriorities,
  excludedPriorities,
  includedTaskLists,
  excludedTaskLists,
  assigneeMode = 'include',
  clientMode = 'include',
  statusMode = 'include',
  priorityMode = 'include',
  taskListMode = 'include',
  allAssignees,
  allClients,
  allTaskLists,
  customStatuses,
  onIncludedAssigneesChange,
  onExcludedAssigneesChange,
  onIncludedClientsChange,
  onExcludedClientsChange,
  onIncludedStatusesChange,
  onExcludedStatusesChange,
  onIncludedPrioritiesChange,
  onExcludedPrioritiesChange,
  onIncludedTaskListsChange,
  onExcludedTaskListsChange,
  onAssigneeModeChange,
  onClientModeChange,
  onStatusModeChange,
  onPriorityModeChange,
  onTaskListModeChange,
  onClose,
  onClearAll
}: TaskFilterPanelProps) {
  const individualClients = allClients.filter(c => c.type === 'individual');
  const businessClients = allClients.filter(c => c.type === 'business');
  
  const activeFilterCount = includedAssignees.length + excludedAssignees.length + includedClients.length + excludedClients.length + includedStatuses.length + excludedStatuses.length + includedPriorities.length + excludedPriorities.length + (includedTaskLists?.length || 0) + (excludedTaskLists?.length || 0);

  // Toggle functions that respect the current mode
  const toggleAssignee = (assignee: string) => {
    const inIncluded = includedAssignees.includes(assignee);
    const inExcluded = excludedAssignees.includes(assignee);
    
    if (inIncluded) {
      onIncludedAssigneesChange(includedAssignees.filter(a => a !== assignee));
    } else if (inExcluded) {
      onExcludedAssigneesChange(excludedAssignees.filter(a => a !== assignee));
    } else {
      if (assigneeMode === 'include') {
        onIncludedAssigneesChange([...includedAssignees, assignee]);
      } else {
        onExcludedAssigneesChange([...excludedAssignees, assignee]);
      }
    }
  };

  const toggleClient = (client: string) => {
    const inIncluded = includedClients.includes(client);
    const inExcluded = excludedClients.includes(client);
    
    if (inIncluded) {
      onIncludedClientsChange(includedClients.filter(c => c !== client));
    } else if (inExcluded) {
      onExcludedClientsChange(excludedClients.filter(c => c !== client));
    } else {
      if (clientMode === 'include') {
        onIncludedClientsChange([...includedClients, client]);
      } else {
        onExcludedClientsChange([...excludedClients, client]);
      }
    }
  };

  const toggleStatus = (status: string) => {
    const inIncluded = includedStatuses.includes(status);
    const inExcluded = excludedStatuses.includes(status);
    
    if (inIncluded) {
      onIncludedStatusesChange(includedStatuses.filter(s => s !== status));
    } else if (inExcluded) {
      onExcludedStatusesChange(excludedStatuses.filter(s => s !== status));
    } else {
      if (statusMode === 'include') {
        onIncludedStatusesChange([...includedStatuses, status]);
      } else {
        onExcludedStatusesChange([...excludedStatuses, status]);
      }
    }
  };

  const togglePriority = (priority: string) => {
    const inIncluded = includedPriorities.includes(priority);
    const inExcluded = excludedPriorities.includes(priority);
    
    if (inIncluded) {
      onIncludedPrioritiesChange(includedPriorities.filter(p => p !== priority));
    } else if (inExcluded) {
      onExcludedPrioritiesChange(excludedPriorities.filter(p => p !== priority));
    } else {
      if (priorityMode === 'include') {
        onIncludedPrioritiesChange([...includedPriorities, priority]);
      } else {
        onExcludedPrioritiesChange([...excludedPriorities, priority]);
      }
    }
  };

  const toggleTaskList = (taskListId: string) => {
    const inIncluded = includedTaskLists.includes(taskListId);
    const inExcluded = excludedTaskLists.includes(taskListId);
    
    if (inIncluded) {
      onIncludedTaskListsChange(includedTaskLists.filter(tl => tl !== taskListId));
    } else if (inExcluded) {
      onExcludedTaskListsChange(excludedTaskLists.filter(tl => tl !== taskListId));
    } else {
      if (taskListMode === 'include') {
        onIncludedTaskListsChange([...includedTaskLists, taskListId]);
      } else {
        onExcludedTaskListsChange([...excludedTaskLists, taskListId]);
      }
    }
  };

  // Select All functions
  const selectAllAssignees = () => {
    if (assigneeMode === 'include') {
      const allSelected = allAssignees.every(a => includedAssignees.includes(a));
      if (allSelected) {
        onIncludedAssigneesChange([]);
      } else {
        onIncludedAssigneesChange(allAssignees);
      }
    } else {
      const allSelected = allAssignees.every(a => excludedAssignees.includes(a));
      if (allSelected) {
        onExcludedAssigneesChange([]);
      } else {
        onExcludedAssigneesChange(allAssignees);
      }
    }
  };

  const selectAllClients = () => {
    const allClientNames = allClients.map(c => c.name);
    if (clientMode === 'include') {
      const allSelected = allClientNames.every(c => includedClients.includes(c));
      if (allSelected) {
        onIncludedClientsChange([]);
      } else {
        onIncludedClientsChange(allClientNames);
      }
    } else {
      const allSelected = allClientNames.every(c => excludedClients.includes(c));
      if (allSelected) {
        onExcludedClientsChange([]);
      } else {
        onExcludedClientsChange(allClientNames);
      }
    }
  };

  const selectBusinessClients = () => {
    const businessClientNames = businessClients.map(c => c.name);
    if (clientMode === 'include') {
      const allSelected = businessClientNames.every(c => includedClients.includes(c));
      if (allSelected) {
        onIncludedClientsChange(includedClients.filter(c => !businessClientNames.includes(c)));
      } else {
        const newIncluded = [...new Set([...includedClients, ...businessClientNames])];
        onIncludedClientsChange(newIncluded);
      }
    } else {
      const allSelected = businessClientNames.every(c => excludedClients.includes(c));
      if (allSelected) {
        onExcludedClientsChange(excludedClients.filter(c => !businessClientNames.includes(c)));
      } else {
        const newExcluded = [...new Set([...excludedClients, ...businessClientNames])];
        onExcludedClientsChange(newExcluded);
      }
    }
  };

  const selectIndividualClients = () => {
    const individualClientNames = individualClients.map(c => c.name);
    if (clientMode === 'include') {
      const allSelected = individualClientNames.every(c => includedClients.includes(c));
      if (allSelected) {
        onIncludedClientsChange(includedClients.filter(c => !individualClientNames.includes(c)));
      } else {
        const newIncluded = [...new Set([...includedClients, ...individualClientNames])];
        onIncludedClientsChange(newIncluded);
      }
    } else {
      const allSelected = individualClientNames.every(c => excludedClients.includes(c));
      if (allSelected) {
        onExcludedClientsChange(excludedClients.filter(c => !individualClientNames.includes(c)));
      } else {
        const newExcluded = [...new Set([...excludedClients, ...individualClientNames])];
        onExcludedClientsChange(newExcluded);
      }
    }
  };

  const selectAllStatuses = () => {
    const defaultStatuses = ['pending', 'in-progress', 'completed', 'blocked'];
    const allStatusOptions = customStatuses && customStatuses.length > 0 ? customStatuses : defaultStatuses;
    if (statusMode === 'include') {
      const allSelected = allStatusOptions.every(s => includedStatuses.includes(s));
      if (allSelected) {
        onIncludedStatusesChange([]);
      } else {
        onIncludedStatusesChange(allStatusOptions);
      }
    } else {
      const allSelected = allStatusOptions.every(s => excludedStatuses.includes(s));
      if (allSelected) {
        onExcludedStatusesChange([]);
      } else {
        onExcludedStatusesChange(allStatusOptions);
      }
    }
  };

  const selectAllPriorities = () => {
    const allPriorities = ['low', 'medium', 'high'];
    if (priorityMode === 'include') {
      const allSelected = allPriorities.every(p => includedPriorities.includes(p));
      if (allSelected) {
        onIncludedPrioritiesChange([]);
      } else {
        onIncludedPrioritiesChange(allPriorities);
      }
    } else {
      const allSelected = allPriorities.every(p => excludedPriorities.includes(p));
      if (allSelected) {
        onExcludedPrioritiesChange([]);
      } else {
        onExcludedPrioritiesChange(allPriorities);
      }
    }
  };

  const selectAllTaskLists = () => {
    const allTaskListIds = allTaskLists.map(tl => tl.id);
    if (taskListMode === 'include') {
      const allSelected = allTaskListIds.every(id => includedTaskLists.includes(id));
      if (allSelected) {
        onIncludedTaskListsChange([]);
      } else {
        onIncludedTaskListsChange(allTaskListIds);
      }
    } else {
      const allSelected = allTaskListIds.every(id => excludedTaskLists.includes(id));
      if (allSelected) {
        onExcludedTaskListsChange([]);
      } else {
        onExcludedTaskListsChange(allTaskListIds);
      }
    }
  };

  const statuses = customStatuses || ['todo', 'in-progress', 'review', 'completed'];
  const priorities = ['low', 'medium', 'high'];

  return (
    <Card className="p-4 sticky top-4 bg-gradient-to-br from-white to-slate-50 shadow-lg border-slate-200 h-full flex flex-col">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-900">Filter Tasks</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </Button>
        )}

        <Separator className="flex-shrink-0" />

        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-4">
            {/* Assignees */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4 text-violet-500" />
                Assignee
              </Label>
              
              {/* Include/Exclude Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={assigneeMode === 'include' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAssigneeModeChange?.('include')}
                  className={`flex-1 text-xs ${assigneeMode === 'include' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  ✓ Include
                </Button>
                <Button
                  variant={assigneeMode === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAssigneeModeChange?.('exclude')}
                  className={`flex-1 text-xs ${assigneeMode === 'exclude' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  ✕ Exclude
                </Button>
              </div>

              {/* Select All Button */}
              {allAssignees.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllAssignees}
                  className="w-full text-xs"
                >
                  {(assigneeMode === 'include' 
                    ? allAssignees.every(a => includedAssignees.includes(a))
                    : allAssignees.every(a => excludedAssignees.includes(a))
                  ) ? 'Deselect All' : 'Select All'}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                {allAssignees.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No assignees found</p>
                ) : (
                  <div className="space-y-0.5">
                    {allAssignees.map((assignee) => {
                      const isIncluded = includedAssignees.includes(assignee);
                      const isExcluded = excludedAssignees.includes(assignee);
                      const isSelected = isIncluded || isExcluded;
                      
                      return (
                        <div
                          key={assignee}
                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? isIncluded 
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => toggleAssignee(assignee)}
                        >
                          <Avatar className={`w-7 h-7 flex-shrink-0 ${
                            isSelected 
                              ? isIncluded
                                ? 'ring-2 ring-green-400'
                                : 'ring-2 ring-red-400'
                              : ''
                          }`}>
                            <AvatarFallback className={`text-xs ${
                              isSelected
                                ? isIncluded
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {assignee.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`text-sm flex-1 ${
                            isSelected 
                              ? isIncluded
                                ? 'text-green-900'
                                : 'text-red-900'
                              : 'text-slate-700'
                          }`}>
                            {assignee}
                          </span>
                          {isSelected && (
                            <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Clients */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-violet-500" />
                Client
              </Label>
              
              {/* Include/Exclude Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={clientMode === 'include' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onClientModeChange?.('include')}
                  className={`flex-1 text-xs ${clientMode === 'include' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  ✓ Include
                </Button>
                <Button
                  variant={clientMode === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onClientModeChange?.('exclude')}
                  className={`flex-1 text-xs ${clientMode === 'exclude' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  ✕ Exclude
                </Button>
              </div>

              {/* Select All Clients Button */}
              {allClients.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllClients}
                  className="w-full text-xs"
                >
                  {(clientMode === 'include' 
                    ? allClients.every(c => includedClients.includes(c.name))
                    : allClients.every(c => excludedClients.includes(c.name))
                  ) ? 'Deselect All Clients' : 'Select All Clients'}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                {allClients.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No clients found</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Business Clients Section */}
                    {businessClients.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Business ({businessClients.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {businessClients.map((client) => {
                            const isIncluded = includedClients.includes(client.name);
                            const isExcluded = excludedClients.includes(client.name);
                            const isSelected = isIncluded || isExcluded;
                            
                            return (
                              <div
                                key={client.name}
                                className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                  isSelected
                                    ? isIncluded
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-red-50 border border-red-200'
                                    : 'hover:bg-slate-50 border border-transparent'
                                }`}
                                onClick={() => toggleClient(client.name)}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isSelected 
                                    ? isIncluded 
                                      ? 'bg-green-100' 
                                      : 'bg-red-100' 
                                    : 'bg-slate-100'
                                }`}>
                                  <Building2 className={`w-3.5 h-3.5 ${
                                    isSelected 
                                      ? isIncluded 
                                        ? 'text-green-600' 
                                        : 'text-red-600' 
                                      : 'text-slate-500'
                                  }`} />
                                </div>
                                <span className={`text-sm flex-1 ${
                                  isSelected 
                                    ? isIncluded 
                                      ? 'text-green-900' 
                                      : 'text-red-900' 
                                    : 'text-slate-700'
                                }`}>
                                  {client.name}
                                </span>
                                {isSelected && (
                                  <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Individual Clients Section */}
                    {individualClients.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Individual ({individualClients.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {individualClients.map((client) => {
                            const isIncluded = includedClients.includes(client.name);
                            const isExcluded = excludedClients.includes(client.name);
                            const isSelected = isIncluded || isExcluded;
                            
                            return (
                              <div
                                key={client.name}
                                className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                  isSelected
                                    ? isIncluded
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-red-50 border border-red-200'
                                    : 'hover:bg-slate-50 border border-transparent'
                                }`}
                                onClick={() => toggleClient(client.name)}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isSelected 
                                    ? isIncluded 
                                      ? 'bg-green-100' 
                                      : 'bg-red-100' 
                                    : 'bg-slate-100'
                                }`}>
                                  <User className={`w-3.5 h-3.5 ${
                                    isSelected 
                                      ? isIncluded 
                                        ? 'text-green-600' 
                                        : 'text-red-600' 
                                      : 'text-slate-500'
                                  }`} />
                                </div>
                                <span className={`text-sm flex-1 ${
                                  isSelected 
                                    ? isIncluded 
                                      ? 'text-green-900' 
                                      : 'text-red-900' 
                                    : 'text-slate-700'
                                }`}>
                                  {client.name}
                                </span>
                                {isSelected && (
                                  <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Statuses */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <CheckSquare className="w-4 h-4 text-violet-500" />
                Status
              </Label>
              
              {/* Include/Exclude Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={statusMode === 'include' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusModeChange?.('include')}
                  className={`flex-1 text-xs ${statusMode === 'include' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  ✓ Include
                </Button>
                <Button
                  variant={statusMode === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusModeChange?.('exclude')}
                  className={`flex-1 text-xs ${statusMode === 'exclude' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  ✕ Exclude
                </Button>
              </div>

              {/* Select All Button */}
              {statuses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllStatuses}
                  className="w-full text-xs"
                >
                  {(statusMode === 'include' 
                    ? statuses.every(s => includedStatuses.includes(s))
                    : statuses.every(s => excludedStatuses.includes(s))
                  ) ? 'Deselect All' : 'Select All'}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                {statuses.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No statuses found</p>
                ) : (
                  <div className="space-y-0.5">
                    {statuses.map((status) => {
                      const isIncluded = includedStatuses.includes(status);
                      const isExcluded = excludedStatuses.includes(status);
                      const isSelected = isIncluded || isExcluded;
                      
                      return (
                        <div
                          key={status}
                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? isIncluded
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => toggleStatus(status)}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? isIncluded 
                                ? 'bg-green-100' 
                                : 'bg-red-100' 
                              : 'bg-slate-100'
                          }`}>
                            <Folder className={`w-3.5 h-3.5 ${
                              isSelected 
                                ? isIncluded 
                                  ? 'text-green-600' 
                                  : 'text-red-600' 
                                : 'text-slate-500'
                            }`} />
                          </div>
                          <span className={`text-sm flex-1 capitalize ${
                            isSelected 
                              ? isIncluded 
                                ? 'text-green-900' 
                                : 'text-red-900' 
                              : 'text-slate-700'
                          }`}>
                            {status}
                          </span>
                          {isSelected && (
                            <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Priorities */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <Flag className="w-4 h-4 text-violet-500" />
                Priority
              </Label>
              
              {/* Include/Exclude Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={priorityMode === 'include' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityModeChange?.('include')}
                  className={`flex-1 text-xs ${priorityMode === 'include' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  ✓ Include
                </Button>
                <Button
                  variant={priorityMode === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityModeChange?.('exclude')}
                  className={`flex-1 text-xs ${priorityMode === 'exclude' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  ✕ Exclude
                </Button>
              </div>

              {/* Select All Button */}
              {priorities.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllPriorities}
                  className="w-full text-xs"
                >
                  {(priorityMode === 'include' 
                    ? priorities.every(p => includedPriorities.includes(p))
                    : priorities.every(p => excludedPriorities.includes(p))
                  ) ? 'Deselect All' : 'Select All'}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                {priorities.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No priorities found</p>
                ) : (
                  <div className="space-y-0.5">
                    {priorities.map((priority) => {
                      const isIncluded = includedPriorities.includes(priority);
                      const isExcluded = excludedPriorities.includes(priority);
                      const isSelected = isIncluded || isExcluded;
                      
                      return (
                        <div
                          key={priority}
                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? isIncluded
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => togglePriority(priority)}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? isIncluded 
                                ? 'bg-green-100' 
                                : 'bg-red-100' 
                              : 'bg-slate-100'
                          }`}>
                            <Flag className={`w-3.5 h-3.5 ${
                              isSelected 
                                ? isIncluded 
                                  ? 'text-green-600' 
                                  : 'text-red-600' 
                                : 'text-slate-500'
                            }`} />
                          </div>
                          <span className={`text-sm flex-1 capitalize ${
                            isSelected 
                              ? isIncluded 
                                ? 'text-green-900' 
                                : 'text-red-900' 
                              : 'text-slate-700'
                          }`}>
                            {priority}
                          </span>
                          {isSelected && (
                            <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Task Lists */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <List className="w-4 h-4 text-violet-500" />
                Task Lists
              </Label>
              
              {/* Include/Exclude Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={taskListMode === 'include' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTaskListModeChange?.('include')}
                  className={`flex-1 text-xs ${taskListMode === 'include' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  ✓ Include
                </Button>
                <Button
                  variant={taskListMode === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTaskListModeChange?.('exclude')}
                  className={`flex-1 text-xs ${taskListMode === 'exclude' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  ✕ Exclude
                </Button>
              </div>

              {/* Select All Button */}
              {allTaskLists.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllTaskLists}
                  className="w-full text-xs"
                >
                  {(taskListMode === 'include' 
                    ? allTaskLists.every(tl => includedTaskLists.includes(tl.id))
                    : allTaskLists.every(tl => excludedTaskLists.includes(tl.id))
                  ) ? 'Deselect All' : 'Select All'}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                {allTaskLists.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No task lists found</p>
                ) : (
                  <div className="space-y-0.5">
                    {allTaskLists.map((list) => {
                      const isIncluded = includedTaskLists.includes(list.id);
                      const isExcluded = excludedTaskLists.includes(list.id);
                      const isSelected = isIncluded || isExcluded;
                      
                      return (
                        <div
                          key={list.id}
                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? isIncluded
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => toggleTaskList(list.id)}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? isIncluded 
                                ? 'bg-green-100' 
                                : 'bg-red-100' 
                              : 'bg-slate-100'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${list.color}`}></div>
                          </div>
                          <span className={`text-sm flex-1 ${
                            isSelected 
                              ? isIncluded 
                                ? 'text-green-900' 
                                : 'text-red-900' 
                              : 'text-slate-700'
                          }`}>
                            {list.name}
                          </span>
                          <span className="text-xs text-slate-400">{list.taskCount}</span>
                          {isSelected && (
                            <div className={`w-5 h-5 rounded-full ${isIncluded ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center flex-shrink-0`}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}