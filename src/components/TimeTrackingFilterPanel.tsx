import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Filter, X, Users, Building2, User, Folder, Briefcase } from 'lucide-react';

interface TimeTrackingFilterPanelProps {
  // Included/Excluded arrays
  includedUsers: string[];
  excludedUsers: string[];
  includedClients: string[];
  excludedClients: string[];
  includedProjects: string[];
  excludedProjects: string[];
  includedRoles: string[];
  excludedRoles: string[];
  
  // Data
  allUsers: string[];
  allClients: Array<{ name: string; type: 'business' | 'individual' }>;
  allProjects: Array<{ id: string; name: string }>;
  allRoles: string[];
  
  // Handlers
  onIncludedUsersChange: (users: string[]) => void;
  onExcludedUsersChange: (users: string[]) => void;
  onIncludedClientsChange: (clients: string[]) => void;
  onExcludedClientsChange: (clients: string[]) => void;
  onIncludedProjectsChange: (projects: string[]) => void;
  onExcludedProjectsChange: (projects: string[]) => void;
  onIncludedRolesChange: (roles: string[]) => void;
  onExcludedRolesChange: (roles: string[]) => void;
  
  onClose: () => void;
  onClearAll: () => void;
}

export function TimeTrackingFilterPanel({
  includedUsers,
  excludedUsers,
  includedClients,
  excludedClients,
  includedProjects,
  excludedProjects,
  includedRoles,
  excludedRoles,
  allUsers,
  allClients,
  allProjects,
  allRoles,
  onIncludedUsersChange,
  onExcludedUsersChange,
  onIncludedClientsChange,
  onExcludedClientsChange,
  onIncludedProjectsChange,
  onExcludedProjectsChange,
  onIncludedRolesChange,
  onExcludedRolesChange,
  onClose,
  onClearAll,
}: TimeTrackingFilterPanelProps) {
  
  // Helper function to check if an item is included, excluded, or neither
  const getSelectionState = (
    item: string,
    included: string[],
    excluded: string[]
  ): 'included' | 'excluded' | 'none' => {
    if (included.includes(item)) return 'included';
    if (excluded.includes(item)) return 'excluded';
    return 'none';
  };

  // Helper to toggle selection
  const toggleSelection = (
    item: string,
    included: string[],
    excluded: string[],
    onIncludedChange: (items: string[]) => void,
    onExcludedChange: (items: string[]) => void
  ) => {
    const currentState = getSelectionState(item, included, excluded);
    
    if (currentState === 'none') {
      // Add to included
      onIncludedChange([...included, item]);
    } else if (currentState === 'included') {
      // Move to excluded
      onIncludedChange(included.filter(i => i !== item));
      onExcludedChange([...excluded, item]);
    } else {
      // Remove from excluded (back to none)
      onExcludedChange(excluded.filter(i => i !== item));
    }
  };

  // Get filter button style
  const getButtonStyle = (state: 'included' | 'excluded' | 'none') => {
    if (state === 'included') {
      return 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900';
    } else if (state === 'excluded') {
      return 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 line-through';
    }
    return 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700';
  };

  const activeFiltersCount = 
    includedUsers.length + excludedUsers.length +
    includedClients.length + excludedClients.length +
    includedProjects.length + excludedProjects.length +
    includedRoles.length + excludedRoles.length;

  return (
    <Card className="p-4 border-violet-300 dark:border-violet-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-medium dark:text-gray-200">Advanced Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs h-7"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Legend */}
      <div className="flex items-center gap-4 mb-4 p-2 bg-slate-50 dark:bg-gray-800 rounded-lg text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950" />
          <span className="text-slate-600 dark:text-gray-400">Include</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950" />
          <span className="text-slate-600 dark:text-gray-400">Exclude</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <span className="text-slate-600 dark:text-gray-400">No filter</span>
        </div>
        <span className="text-slate-500 dark:text-gray-500 ml-auto">Click to cycle through states</span>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-6">
          {/* Users Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <Label className="text-sm font-medium dark:text-gray-200">Team Members</Label>
              {(includedUsers.length > 0 || excludedUsers.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {includedUsers.length + excludedUsers.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allUsers.map(user => {
                const state = getSelectionState(user, includedUsers, excludedUsers);
                return (
                  <button
                    key={user}
                    onClick={() => toggleSelection(user, includedUsers, excludedUsers, onIncludedUsersChange, onExcludedUsersChange)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-all ${getButtonStyle(state)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {user}
                    </div>
                  </button>
                );
              })}
              {allUsers.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-gray-500">No users available</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Roles Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <Label className="text-sm font-medium dark:text-gray-200">Roles</Label>
              {(includedRoles.length > 0 || excludedRoles.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {includedRoles.length + excludedRoles.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allRoles.map(role => {
                const state = getSelectionState(role, includedRoles, excludedRoles);
                return (
                  <button
                    key={role}
                    onClick={() => toggleSelection(role, includedRoles, excludedRoles, onIncludedRolesChange, onExcludedRolesChange)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-all ${getButtonStyle(state)}`}
                  >
                    {role}
                  </button>
                );
              })}
              {allRoles.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-gray-500">No roles available</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Clients Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <Label className="text-sm font-medium dark:text-gray-200">Clients</Label>
              {(includedClients.length > 0 || excludedClients.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {includedClients.length + excludedClients.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allClients.map(client => {
                const state = getSelectionState(client.name, includedClients, excludedClients);
                return (
                  <button
                    key={client.name}
                    onClick={() => toggleSelection(client.name, includedClients, excludedClients, onIncludedClientsChange, onExcludedClientsChange)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-all ${getButtonStyle(state)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      {client.name}
                    </div>
                  </button>
                );
              })}
              {allClients.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-gray-500">No clients available</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Projects Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <Label className="text-sm font-medium dark:text-gray-200">Projects</Label>
              {(includedProjects.length > 0 || excludedProjects.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {includedProjects.length + excludedProjects.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allProjects.map(project => {
                const state = getSelectionState(project.id, includedProjects, excludedProjects);
                return (
                  <button
                    key={project.id}
                    onClick={() => toggleSelection(project.id, includedProjects, excludedProjects, onIncludedProjectsChange, onExcludedProjectsChange)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-all ${getButtonStyle(state)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-3 h-3" />
                      {project.name}
                    </div>
                  </button>
                );
              })}
              {allProjects.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-gray-500">No projects available</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer with actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
        <p className="text-xs text-slate-500 dark:text-gray-400">
          {activeFiltersCount === 0 
            ? 'No filters applied' 
            : `${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
        </p>
        <Button onClick={onClose} size="sm">
          Apply Filters
        </Button>
      </div>
    </Card>
  );
}
