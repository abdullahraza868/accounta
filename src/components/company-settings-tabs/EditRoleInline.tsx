import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  X,
  Check,
  Save,
  AlertCircle,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Briefcase,
  DollarSign,
  FileSignature,
  FileSpreadsheet,
  Calendar,
  MessageSquare,
  Settings,
  Lock,
  ChevronRight,
  ChevronLeft,
  ListTodo,
  Mail,
  Phone,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '../ui/utils';

// Permission action types
type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'manage';

type EditRoleInlineProps = {
  role?: {
    id: string;
    name: string;
    description: string;
    color: string;
    isDefault: boolean;
    userCount: number;
  };
  onCancel: () => void;
  onSave: (roleData: any) => void;
  existingRoles?: string[]; // Array of existing role names for validation
};

const ALL_DASHBOARD_MODULES = [
  'Invoices Overview',
  'Client Activity',
  'Leads',
  'Client Overview',
  'My Tasks',
  'Project Tasks',
  'Messages',
  'Meetings',
  'Signed Documents',
  'Organizer',
  'Documents Overview'
];

// Mock Client Groups Data
const CLIENT_GROUPS = [
  { id: 'active', name: 'Active Clients', count: 45, color: 'green' },
  { id: 'tax', name: 'Tax Clients', count: 32, color: 'blue' },
  { id: 'audit', name: 'Audit Clients', count: 18, color: 'purple' },
  { id: 'consulting', name: 'Consulting Clients', count: 12, color: 'orange' },
  { id: 'inactive', name: 'Inactive Clients', count: 8, color: 'gray' },
];

// Mock Clients Data with group memberships
const ALL_CLIENTS = [
  { id: '1', name: 'Acme Corporation', groups: ['active', 'tax'] },
  { id: '2', name: 'TechStart Inc', groups: ['active', 'consulting'] },
  { id: '3', name: 'Global Ventures LLC', groups: ['active', 'audit'] },
  { id: '4', name: 'Smith & Sons', groups: ['tax'] },
  { id: '5', name: 'Johnson Enterprises', groups: ['active', 'tax', 'audit'] },
  { id: '6', name: 'Williams Consulting', groups: ['consulting'] },
  { id: '7', name: 'Brown Industries', groups: ['active', 'audit'] },
  { id: '8', name: 'Davis Holdings', groups: ['tax'] },
  { id: '9', name: 'Miller Group', groups: ['active', 'consulting'] },
  { id: '10', name: 'Wilson & Co', groups: ['audit'] },
  { id: '11', name: 'Moore Financial', groups: ['active', 'tax'] },
  { id: '12', name: 'Taylor Services', groups: ['inactive'] },
  { id: '13', name: 'Anderson Corp', groups: ['active', 'tax'] },
  { id: '14', name: 'Thomas Industries', groups: ['consulting'] },
  { id: '15', name: 'Jackson Retail', groups: ['active', 'audit'] },
];

export function EditRoleInline({ role, onCancel, onSave, existingRoles = [] }: EditRoleInlineProps) {
  const isOwnerAdmin = role?.name === 'Owner/Admin';
  const isEditMode = !!role;
  const isProtectedRole = role?.isDefault || false; // Protect all default roles

  // Form state
  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleDescription, setRoleDescription] = useState(role?.description || '');
  const [roleColor, setRoleColor] = useState(role?.color || 'purple');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Main sections enabled (all start TRUE by default - let users remove)
  const [dashboardEnabled, setDashboardEnabled] = useState(true);
  const [clientsEnabled, setClientsEnabled] = useState(true);
  const [documentCenterEnabled, setDocumentCenterEnabled] = useState(true);
  const [projectsEnabled, setProjectsEnabled] = useState(true);
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [signaturesEnabled, setSignaturesEnabled] = useState(true);
  const [organizerEnabled, setOrganizerEnabled] = useState(true);
  const [calendarEnabled, setCalendarEnabled] = useState(true);
  const [tasksEnabled, setTasksEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [textingEnabled, setTextingEnabled] = useState(true);
  const [settingsEnabled, setSettingsEnabled] = useState(true);

  // "Access All" override for clients (managers only)
  const [accessAllClients, setAccessAllClients] = useState(isOwnerAdmin);

  // Client Assignment State
  const [clientAccessMode, setClientAccessMode] = useState<'all' | 'assigned'>('all');
  const [assignmentMethod, setAssignmentMethod] = useState<'groups' | 'individual' | null>(null);
  const [selectedClientGroups, setSelectedClientGroups] = useState<Set<string>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedClientsSearchQuery, setSelectedClientsSearchQuery] = useState('');

  // Permissions state for subsections
  const [permissions, setPermissions] = useState<Record<string, Set<ActionType>>>({});

  // Dashboard modules state (all enabled by default)
  const [dashboardModules, setDashboardModules] = useState<Set<string>>(
    new Set(ALL_DASHBOARD_MODULES)
  );

  // When an area is enabled in Step 1, automatically select all its permissions
  useEffect(() => {
    if (dashboardEnabled && dashboardModules.size === 0 && !isOwnerAdmin) {
      setDashboardModules(new Set(ALL_DASHBOARD_MODULES));
    }
  }, [dashboardEnabled, isOwnerAdmin]);

  // Auto-enable all permissions when sections are first enabled
  useEffect(() => {
    if (isOwnerAdmin) return;
    
    const newPermissions: Record<string, Set<ActionType>> = { ...permissions };
    let hasChanges = false;

    // Auto-enable all permissions for newly enabled sections
    if (clientsEnabled) {
      ['client-overview', 'client-demographics', 'client-teams', 'client-documents'].forEach(id => {
        if (!newPermissions[id] || newPermissions[id].size === 0) {
          const actions: ActionType[] = 
            id === 'client-overview' ? ['view'] :
            id === 'client-demographics' ? ['view', 'edit'] :
            id === 'client-teams' ? ['view', 'create', 'edit', 'delete'] :
            ['view', 'create', 'edit', 'delete', 'export'];
          newPermissions[id] = new Set(actions);
          hasChanges = true;
        }
      });
    }

    if (documentCenterEnabled && (!newPermissions['documents'] || newPermissions['documents'].size === 0)) {
      newPermissions['documents'] = new Set(['view', 'create', 'edit', 'delete', 'export']);
      hasChanges = true;
    }

    if (projectsEnabled) {
      ['project-overview', 'project-workflows', 'project-tasks', 'project-documents', 'project-team'].forEach(id => {
        if (!newPermissions[id] || newPermissions[id].size === 0) {
          const actions: ActionType[] = 
            id === 'project-overview' ? ['view'] :
            id === 'project-team' ? ['view', 'edit'] :
            id === 'project-documents' ? ['view', 'create', 'edit', 'delete', 'export'] :
            ['view', 'create', 'edit', 'delete'];
          newPermissions[id] = new Set(actions);
          hasChanges = true;
        }
      });
    }

    if (tasksEnabled && (!newPermissions['tasks'] || newPermissions['tasks'].size === 0)) {
      newPermissions['tasks'] = new Set(['view', 'create', 'edit', 'delete', 'manage']);
      hasChanges = true;
    }

    if (billingEnabled) {
      ['billing-invoices', 'billing-payments', 'billing-expenses', 'billing-reports'].forEach(id => {
        if (!newPermissions[id] || newPermissions[id].size === 0) {
          const actions: ActionType[] = 
            id === 'billing-invoices' ? ['view', 'create', 'edit', 'delete', 'export'] :
            id === 'billing-payments' ? ['view', 'create', 'edit', 'export'] :
            id === 'billing-expenses' ? ['view', 'create', 'edit', 'delete'] :
            ['view', 'export'];
          newPermissions[id] = new Set(actions);
          hasChanges = true;
        }
      });
    }

    if (signaturesEnabled && (!newPermissions['signatures'] || newPermissions['signatures'].size === 0)) {
      newPermissions['signatures'] = new Set(['view', 'create', 'delete', 'export']);
      hasChanges = true;
    }

    if (organizerEnabled && (!newPermissions['organizer'] || newPermissions['organizer'].size === 0)) {
      newPermissions['organizer'] = new Set(['view', 'create', 'edit', 'delete', 'manage']);
      hasChanges = true;
    }

    if (calendarEnabled && (!newPermissions['calendar'] || newPermissions['calendar'].size === 0)) {
      newPermissions['calendar'] = new Set(['view', 'create', 'edit', 'delete']);
      hasChanges = true;
    }

    if (emailEnabled && (!newPermissions['email'] || newPermissions['email'].size === 0)) {
      newPermissions['email'] = new Set(['view', 'create', 'manage']);
      hasChanges = true;
    }

    if (textingEnabled && (!newPermissions['texting'] || newPermissions['texting'].size === 0)) {
      newPermissions['texting'] = new Set(['view', 'create']);
      hasChanges = true;
    }

    if (settingsEnabled) {
      ['settings-company', 'settings-team', 'settings-roles', 'settings-billing', 'settings-integrations'].forEach(id => {
        if (!newPermissions[id] || newPermissions[id].size === 0) {
          const actions: ActionType[] = 
            id === 'settings-company' || id === 'settings-billing' ? ['view', 'edit'] :
            ['view', 'manage'];
          newPermissions[id] = new Set(actions);
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      setPermissions(newPermissions);
    }
  }, [
    clientsEnabled,
    documentCenterEnabled,
    projectsEnabled,
    tasksEnabled,
    billingEnabled,
    signaturesEnabled,
    organizerEnabled,
    calendarEnabled,
    emailEnabled,
    textingEnabled,
    settingsEnabled,
    isOwnerAdmin
  ]);

  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setRoleDescription(role.description);
      setRoleColor(role.color);
    }
  }, [role]);

  const togglePermission = (subsectionId: string, action: ActionType) => {
    if (isOwnerAdmin) return;

    setPermissions((prev) => {
      const current = prev[subsectionId] || new Set();
      const newActions = new Set(current);

      if (newActions.has(action)) {
        newActions.delete(action);
        if (action === 'view') {
          ['create', 'edit', 'delete', 'export', 'manage'].forEach((a) =>
            newActions.delete(a as ActionType)
          );
        }
        if (action === 'edit') newActions.delete('delete');
      } else {
        newActions.add(action);
        if (action !== 'view') newActions.add('view');
        if (action === 'delete') {
          newActions.add('edit');
          newActions.add('view');
        }
      }

      return { ...prev, [subsectionId]: newActions };
    });
  };

  const hasPermission = (subsectionId: string, action: ActionType): boolean => {
    return permissions[subsectionId]?.has(action) || false;
  };

  const toggleDashboardModule = (moduleId: string) => {
    if (isOwnerAdmin) return;
    setDashboardModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const selectAllDashboard = () => {
    if (isOwnerAdmin) return;
    setDashboardModules(new Set(ALL_DASHBOARD_MODULES));
  };

  const deselectAllDashboard = () => {
    if (isOwnerAdmin) return;
    setDashboardModules(new Set());
  };

  const selectAllPermissions = (subsectionIds: string[], allActions: Record<string, ActionType[]>) => {
    if (isOwnerAdmin) return;
    setPermissions(prev => {
      const newPerms = { ...prev };
      subsectionIds.forEach(id => {
        newPerms[id] = new Set(allActions[id] || []);
      });
      return newPerms;
    });
  };

  const deselectAllPermissions = (subsectionIds: string[]) => {
    if (isOwnerAdmin) return;
    setPermissions(prev => {
      const newPerms = { ...prev };
      subsectionIds.forEach(id => {
        newPerms[id] = new Set();
      });
      return newPerms;
    });
  };

  const ActionButton = ({ active, onClick, children, disabled }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
        disabled
          ? 'bg-purple-600 border-purple-600 text-white cursor-not-allowed'
          : active
          ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
      )}
    >
      {children}
    </button>
  );

  const AccessAllOverride = ({ 
    isEnabled, 
    onToggle, 
    label, 
    description 
  }: {
    isEnabled: boolean;
    onToggle: () => void;
    label: string;
    description: string;
  }) => (
    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-0">
              {label}
            </Label>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {description}
          </p>
        </div>
        <button
          onClick={() => !isOwnerAdmin && onToggle()}
          disabled={isOwnerAdmin}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all border flex-shrink-0',
            isOwnerAdmin || isEnabled
              ? 'bg-purple-600 border-purple-600 text-white'
              : 'bg-white dark:bg-gray-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-purple-400'
          )}
        >
          {isEnabled ? '✓ All' : 'Assigned Only'}
        </button>
      </div>
    </div>
  );

  const handleSave = () => {
    // Validation
    const errors: string[] = [];
    
    if (!roleName.trim()) {
      errors.push('Role name is required');
    }
    
    // Check for duplicate role names (excluding current role if editing)
    const normalizedName = roleName.trim().toLowerCase();
    const isDuplicate = existingRoles.some(
      existingName => existingName.toLowerCase() === normalizedName && existingName !== role?.name
    );
    
    if (isDuplicate) {
      errors.push(`A role named "${roleName}" already exists`);
    }
    
    if (getEnabledCount() === 0) {
      errors.push('At least one module must be enabled');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors
    setValidationErrors([]);
    
    // Compile complete role data
    const roleData = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      color: roleColor,
      
      // Access and permissions
      accessAllClients,
      permissions,
      
      // Enabled modules
      dashboardEnabled,
      clientsEnabled,
      documentCenterEnabled,
      projectsEnabled,
      billingEnabled,
      signaturesEnabled,
      organizerEnabled,
      calendarEnabled,
      tasksEnabled,
      emailEnabled,
      textingEnabled,
      settingsEnabled,
      
      // Dashboard modules
      dashboardModules: Array.from(dashboardModules),
      
      // Client assignment (if not access all)
      clientAccessMode,
      assignmentMethod,
      selectedClientGroups: Array.from(selectedClientGroups),
      selectedClients: Array.from(selectedClients),
    };
    
    onSave(roleData);
  };

  const getEnabledCount = () => {
    return [
      dashboardEnabled,
      clientsEnabled,
      documentCenterEnabled,
      projectsEnabled,
      billingEnabled,
      signaturesEnabled,
      organizerEnabled,
      calendarEnabled,
      tasksEnabled,
      emailEnabled,
      textingEnabled,
      settingsEnabled,
    ].filter(Boolean).length;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-purple-500 dark:border-purple-600 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            {isOwnerAdmin ? (
              <Lock className="w-5 h-5 text-white" />
            ) : (
              <Settings className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isOwnerAdmin ? 'Owner/Admin Permissions (View Only)' : isEditMode ? `Edit Role: ${role?.name}` : 'Create New Role'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentStep === 1
                ? 'Select which areas this role can access'
                : 'Configure detailed permissions for selected areas'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Protected Role Warning */}
      {isProtectedRole && !isOwnerAdmin && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Protected System Role
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                This is a default system role. You can modify permissions, but it cannot be deleted. Consider duplicating this role if you need a custom version.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Impact Warning */}
      {isEditMode && !isOwnerAdmin && role && role.userCount > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {role.userCount} {role.userCount === 1 ? 'user' : 'users'} will be affected by this change
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Changes will take effect on their next page navigation
              </p>
            </div>
          </div>
          
          {/* Show first 3 affected users */}
          <div className="flex items-center gap-2 flex-wrap">
            {MOCK_USERS.slice(0, Math.min(3, role.userCount)).map((user) => (
              <div key={user.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-700">
                <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xs font-semibold text-amber-900 dark:text-amber-100">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100">{user.name}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{user.email}</p>
                </div>
              </div>
            ))}
            {role.userCount > 3 && (
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                +{role.userCount - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Owner/Admin Warning - Cannot be changed */}
      {isOwnerAdmin && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-100 text-lg mb-1">
                Owner/Admin Role Cannot Be Modified
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                This is a system role with full access to all features. Permissions for this role cannot be changed to ensure platform security and proper administration.
              </p>
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Only viewing permissions - no changes can be saved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Details */}
      {!isOwnerAdmin && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Role Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role-name" className="text-sm font-medium">
                Role Name *
              </Label>
              {role?.isDefault ? (
                <div className="mt-1.5">
                  <p className="text-gray-900 dark:text-gray-100 py-2">
                    {roleName}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    System role names cannot be changed
                  </p>
                </div>
              ) : (
                <Input
                  id="role-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Senior Accountant"
                  className="mt-1.5"
                />
              )}
            </div>

            <div>
              <Label htmlFor="role-description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="role-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Brief description"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="role-color" className="text-sm font-medium">
                Role Color
              </Label>
              <Select value={roleColor} onValueChange={setRoleColor}>
                <SelectTrigger id="role-color" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {!isOwnerAdmin && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
            currentStep === 1
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          )}>
            1
          </div>
          <div className={cn('h-1 w-16 rounded-full', currentStep === 2 ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700')} />
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
            currentStep === 2
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          )}>
            2
          </div>
        </div>
      )}

      {/* Content based on step */}
      {currentStep === 1 ? (
        /* STEP 1: Select Main Sections */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Step 1: Select Access Areas
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose which platform sections this role can access
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {getEnabledCount()} of 12 areas selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDashboardEnabled(true);
                    setClientsEnabled(true);
                    setDocumentCenterEnabled(true);
                    setProjectsEnabled(true);
                    setBillingEnabled(true);
                    setSignaturesEnabled(true);
                    setOrganizerEnabled(true);
                    setCalendarEnabled(true);
                    setTasksEnabled(true);
                    setEmailEnabled(true);
                    setTextingEnabled(true);
                    setSettingsEnabled(true);
                  }}
                  className="gap-1 h-8 text-xs"
                  disabled={isOwnerAdmin}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDashboardEnabled(false);
                    setClientsEnabled(false);
                    setDocumentCenterEnabled(false);
                    setProjectsEnabled(false);
                    setBillingEnabled(false);
                    setSignaturesEnabled(false);
                    setOrganizerEnabled(false);
                    setCalendarEnabled(false);
                    setTasksEnabled(false);
                    setEmailEnabled(false);
                    setTextingEnabled(false);
                    setSettingsEnabled(false);
                  }}
                  className="gap-1 h-8 text-xs"
                  disabled={isOwnerAdmin}
                >
                  <Square className="w-3.5 h-3.5" />
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: dashboardEnabled, setter: setDashboardEnabled, desc: 'Dashboard modules' },
              { id: 'clients', label: 'Clients', icon: Users, enabled: clientsEnabled, setter: setClientsEnabled, desc: 'Client folders' },
              { id: 'documentCenter', label: 'Document Center', icon: FolderOpen, enabled: documentCenterEnabled, setter: setDocumentCenterEnabled, desc: 'Documents' },
              { id: 'projects', label: 'Projects', icon: Briefcase, enabled: projectsEnabled, setter: setProjectsEnabled, desc: 'Project management' },
              { id: 'tasks', label: 'Tasks', icon: ListTodo, enabled: tasksEnabled, setter: setTasksEnabled, desc: 'Task management' },
              { id: 'billing', label: 'Billing', icon: DollarSign, enabled: billingEnabled, setter: setBillingEnabled, desc: 'Invoices & payments' },
              { id: 'signatures', label: 'Signatures', icon: FileSignature, enabled: signaturesEnabled, setter: setSignaturesEnabled, desc: 'Signature requests' },
              { id: 'organizer', label: 'Organizer', icon: FileSpreadsheet, enabled: organizerEnabled, setter: setOrganizerEnabled, desc: 'Tax organizers' },
              { id: 'calendar', label: 'Calendar', icon: Calendar, enabled: calendarEnabled, setter: setCalendarEnabled, desc: 'Scheduling' },
              { id: 'email', label: 'Email', icon: Mail, enabled: emailEnabled, setter: setEmailEnabled, desc: 'Email communication' },
              { id: 'texting', label: 'Texting', icon: Phone, enabled: textingEnabled, setter: setTextingEnabled, desc: 'Text message communication' },
              { id: 'settings', label: 'Settings', icon: Settings, enabled: settingsEnabled, setter: setSettingsEnabled, desc: 'System settings' },
            ].map(({ id, label, icon: Icon, enabled, setter, desc }) => (
              <button
                key={id}
                onClick={() => !isOwnerAdmin && setter(!enabled)}
                disabled={isOwnerAdmin}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left hover:shadow-md',
                  isOwnerAdmin || enabled
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      isOwnerAdmin || enabled
                        ? 'bg-purple-600 dark:bg-purple-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isOwnerAdmin || enabled ? 'text-white' : 'text-gray-400')} />
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                      isOwnerAdmin || enabled
                        ? 'bg-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    {(isOwnerAdmin || enabled) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <h5 className={cn('font-semibold mb-1 text-sm', isOwnerAdmin || enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400')}>
                  {label}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* STEP 2: Configure Permissions */
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Step 2: Configure Permissions & Client Access
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fine-tune what actions users can perform and which clients they can access
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              All permissions enabled by default
            </p>
          </div>

          {/* Dashboard */}
          {dashboardEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Dashboard</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllDashboard}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={deselectAllDashboard}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select available dashboard modules</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_DASHBOARD_MODULES.map((module) => (
                  <button
                    key={module}
                    onClick={() => toggleDashboardModule(module)}
                    disabled={isOwnerAdmin}
                    className={cn(
                      'p-2 rounded-lg border transition-all text-xs',
                      isOwnerAdmin || dashboardModules.has(module)
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded flex items-center justify-center', isOwnerAdmin || dashboardModules.has(module) ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600')}>
                        {(isOwnerAdmin || dashboardModules.has(module)) && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span className={cn(isOwnerAdmin || dashboardModules.has(module) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400')}>{module}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {clientsEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Clients</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(
                      ['client-overview', 'client-demographics', 'client-teams', 'client-documents'],
                      {
                        'client-overview': ['view'],
                        'client-demographics': ['view', 'edit'],
                        'client-teams': ['view', 'create', 'edit', 'delete'],
                        'client-documents': ['view', 'create', 'edit', 'delete', 'export']
                      }
                    )}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['client-overview', 'client-demographics', 'client-teams', 'client-documents'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>
              
              {/* Access All Override */}
              <AccessAllOverride
                isEnabled={accessAllClients}
                onToggle={() => setAccessAllClients(!accessAllClients)}
                label="Access All Clients Override"
                description="Enable to grant access to ALL clients. Otherwise, access is limited to assigned clients (set in Team Management)."
              />

              {/* Client subsections */}
              <div className="space-y-3">
                {[
                  { id: 'client-overview', name: 'Overview/Snapshot', actions: ['view'] as ActionType[] },
                  { id: 'client-demographics', name: 'Demographics', actions: ['view', 'edit'] as ActionType[] },
                  { id: 'client-teams', name: 'Teams', actions: ['view', 'create', 'edit', 'delete'] as ActionType[] },
                  { id: 'client-documents', name: 'Documents', actions: ['view', 'create', 'edit', 'delete', 'export'] as ActionType[] },
                ].map((sub) => (
                  <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{sub.name}</h6>
                    <div className="flex flex-wrap gap-2">
                      {sub.actions.map((action) => (
                        <ActionButton
                          key={action}
                          active={isOwnerAdmin || hasPermission(sub.id, action)}
                          onClick={() => togglePermission(sub.id, action)}
                          disabled={isOwnerAdmin}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </ActionButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Center */}
          {documentCenterEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Document Center</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['documents'], { 'documents': ['view', 'create', 'edit', 'delete', 'export'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['documents'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Document permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Document Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'edit', 'delete', 'export'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('documents', action)}
                      onClick={() => togglePermission('documents', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {projectsEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(
                      ['project-overview', 'project-workflows', 'project-tasks', 'project-documents', 'project-team'],
                      {
                        'project-overview': ['view'],
                        'project-workflows': ['view', 'create', 'edit', 'delete'],
                        'project-tasks': ['view', 'create', 'edit', 'delete'],
                        'project-documents': ['view', 'create', 'edit', 'delete', 'export'],
                        'project-team': ['view', 'edit']
                      }
                    )}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['project-overview', 'project-workflows', 'project-tasks', 'project-documents', 'project-team'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Project subsections */}
              <div className="space-y-3">
                {[
                  { id: 'project-overview', name: 'Overview', actions: ['view'] as ActionType[] },
                  { id: 'project-workflows', name: 'Workflows', actions: ['view', 'create', 'edit', 'delete'] as ActionType[] },
                  { id: 'project-tasks', name: 'Tasks', actions: ['view', 'create', 'edit', 'delete'] as ActionType[] },
                  { id: 'project-documents', name: 'Documents', actions: ['view', 'create', 'edit', 'delete', 'export'] as ActionType[] },
                  { id: 'project-team', name: 'Team', actions: ['view', 'edit'] as ActionType[] },
                ].map((sub) => (
                  <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{sub.name}</h6>
                    <div className="flex flex-wrap gap-2">
                      {sub.actions.map((action) => (
                        <ActionButton
                          key={action}
                          active={isOwnerAdmin || hasPermission(sub.id, action)}
                          onClick={() => togglePermission(sub.id, action)}
                          disabled={isOwnerAdmin}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </ActionButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {tasksEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ListTodo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Tasks</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['tasks'], { 'tasks': ['view', 'create', 'edit', 'delete', 'manage'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['tasks'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Task permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Task Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'edit', 'delete', 'manage'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('tasks', action)}
                      onClick={() => togglePermission('tasks', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action === 'manage' ? 'Assign Tasks' : action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing */}
          {billingEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Billing</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(
                      ['billing-invoices', 'billing-payments', 'billing-expenses', 'billing-reports'],
                      {
                        'billing-invoices': ['view', 'create', 'edit', 'delete', 'export'],
                        'billing-payments': ['view', 'create', 'edit', 'export'],
                        'billing-expenses': ['view', 'create', 'edit', 'delete'],
                        'billing-reports': ['view', 'export']
                      }
                    )}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['billing-invoices', 'billing-payments', 'billing-expenses', 'billing-reports'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Billing subsections */}
              <div className="space-y-3">
                {[
                  { id: 'billing-invoices', name: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] as ActionType[] },
                  { id: 'billing-payments', name: 'Payments', actions: ['view', 'create', 'edit', 'export'] as ActionType[] },
                  { id: 'billing-expenses', name: 'Expenses', actions: ['view', 'create', 'edit', 'delete'] as ActionType[] },
                  { id: 'billing-reports', name: 'Reports', actions: ['view', 'export'] as ActionType[] },
                ].map((sub) => (
                  <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{sub.name}</h6>
                    <div className="flex flex-wrap gap-2">
                      {sub.actions.map((action) => (
                        <ActionButton
                          key={action}
                          active={isOwnerAdmin || hasPermission(sub.id, action)}
                          onClick={() => togglePermission(sub.id, action)}
                          disabled={isOwnerAdmin}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </ActionButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          {signaturesEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileSignature className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Signatures</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['signatures'], { 'signatures': ['view', 'create', 'delete', 'export'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['signatures'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Signature permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Signature Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'delete', 'export'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('signatures', action)}
                      onClick={() => togglePermission('signatures', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action === 'create' ? 'Send' : action === 'delete' ? 'Void' : action === 'export' ? 'Download' : action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Organizer */}
          {organizerEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Organizer</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['organizer'], { 'organizer': ['view', 'create', 'edit', 'delete', 'manage'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['organizer'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Organizer permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Organizer Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'edit', 'delete', 'manage'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('organizer', action)}
                      onClick={() => togglePermission('organizer', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action === 'manage' ? 'Send' : action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar */}
          {calendarEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Calendar</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['calendar'], { 'calendar': ['view', 'create', 'edit', 'delete'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['calendar'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Calendar permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Calendar Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'edit', 'delete'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('calendar', action)}
                      onClick={() => togglePermission('calendar', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {emailEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Email</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['email'], { 'email': ['view', 'create', 'manage'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['email'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Email permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create', 'manage'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('email', action)}
                      onClick={() => togglePermission('email', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action === 'create' ? 'Send' : action === 'manage' ? 'Templates' : action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Texting */}
          {textingEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Texting</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(['texting'], { 'texting': ['view', 'create'] })}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['texting'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Texting permissions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Texting Actions</h6>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'create'] as ActionType[]).map((action) => (
                    <ActionButton
                      key={action}
                      active={isOwnerAdmin || hasPermission('texting', action)}
                      onClick={() => togglePermission('texting', action)}
                      disabled={isOwnerAdmin}
                    >
                      {action === 'create' ? 'Send' : action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {settingsEnabled && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h5>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAllPermissions(
                      ['settings-company', 'settings-team', 'settings-roles', 'settings-billing', 'settings-integrations'],
                      {
                        'settings-company': ['view', 'edit'],
                        'settings-team': ['view', 'manage'],
                        'settings-roles': ['view', 'manage'],
                        'settings-billing': ['view', 'edit'],
                        'settings-integrations': ['view', 'manage']
                      }
                    )}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAllPermissions(['settings-company', 'settings-team', 'settings-roles', 'settings-billing', 'settings-integrations'])}
                    disabled={isOwnerAdmin}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Square className="w-3 h-3" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Settings subsections */}
              <div className="space-y-3">
                {[
                  { id: 'settings-company', name: 'Company Profile', actions: ['view', 'edit'] as ActionType[] },
                  { id: 'settings-team', name: 'Team Management', actions: ['view', 'manage'] as ActionType[] },
                  { id: 'settings-roles', name: 'Roles', actions: ['view', 'manage'] as ActionType[] },
                  { id: 'settings-billing', name: 'Billing Settings', actions: ['view', 'edit'] as ActionType[] },
                  { id: 'settings-integrations', name: 'Integrations', actions: ['view', 'manage'] as ActionType[] },
                ].map((sub) => (
                  <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{sub.name}</h6>
                    <div className="flex flex-wrap gap-2">
                      {sub.actions.map((action) => (
                        <ActionButton
                          key={action}
                          active={isOwnerAdmin || hasPermission(sub.id, action)}
                          onClick={() => togglePermission(sub.id, action)}
                          disabled={isOwnerAdmin}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </ActionButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Access Assignment - Only show if Clients is enabled */}
          {clientsEnabled && (
            <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl border-2 border-purple-300 dark:border-purple-700 p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Client Data Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Define which client data this role can access
                  </p>
                </div>
              </div>

              {/* Step 1: Choose Access Mode */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Client Access Level
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setClientAccessMode('all');
                      setAssignmentMethod(null);
                      setSelectedClientGroups(new Set());
                      setSelectedClients(new Set());
                    }}
                    disabled={isOwnerAdmin}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      clientAccessMode === 'all'
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                        clientAccessMode === 'all'
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}>
                        {clientAccessMode === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          All Clients
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Can access all clients in the system (default)
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setClientAccessMode('assigned')}
                    disabled={isOwnerAdmin}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      clientAccessMode === 'assigned'
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                        clientAccessMode === 'assigned'
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}>
                        {clientAccessMode === 'assigned' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          Assigned Clients Only
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Restrict access to specific clients you assign
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: If Assigned Clients, show assignment method */}
              {clientAccessMode === 'assigned' && (
                <>
                  {/* Help text - Show BEFORE method selection */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Assignment Method
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAssignmentMethod('groups')}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          assignmentMethod === 'groups'
                            ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                            assignmentMethod === 'groups'
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}>
                            {assignmentMethod === 'groups' && <Check className="w-3.5 h-3.5 text-white" />}
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
                        onClick={() => setAssignmentMethod('individual')}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          assignmentMethod === 'individual'
                            ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                            assignmentMethod === 'individual'
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}>
                            {assignmentMethod === 'individual' && <Check className="w-3.5 h-3.5 text-white" />}
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

                  {/* Client Group Selection */}
                  {assignmentMethod === 'groups' && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Select Client Groups
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {CLIENT_GROUPS.map((group) => {
                            const isSelected = selectedClientGroups.has(group.id);
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
                                onClick={() => {
                                  const newGroups = new Set(selectedClientGroups);
                                  const newClients = new Set(selectedClients);
                                  
                                  if (isSelected) {
                                    // Remove group and its clients
                                    newGroups.delete(group.id);
                                    ALL_CLIENTS.forEach(client => {
                                      if (client.groups.includes(group.id)) {
                                        newClients.delete(client.id);
                                      }
                                    });
                                  } else {
                                    // Add group and all its clients
                                    newGroups.add(group.id);
                                    ALL_CLIENTS.forEach(client => {
                                      if (client.groups.includes(group.id)) {
                                        newClients.add(client.id);
                                      }
                                    });
                                  }
                                  
                                  setSelectedClientGroups(newGroups);
                                  setSelectedClients(newClients);
                                }}
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

                      {/* Show selected clients from groups */}
                      {selectedClients.size > 0 && (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Selected Clients ({selectedClients.size})
                            </h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClientGroups(new Set());
                                setSelectedClients(new Set());
                                setSelectedClientsSearchQuery('');
                              }}
                              className="h-7 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          
                          {/* Search within selected clients */}
                          <Input
                            type="text"
                            placeholder="Search selected clients..."
                            value={selectedClientsSearchQuery}
                            onChange={(e) => setSelectedClientsSearchQuery(e.target.value)}
                            className="mb-3"
                          />

                          {/* Help text */}
                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                            💡 <strong>Tip:</strong> You can mix and match! Select client groups, then click individual clients below to add or remove them from your selection.
                          </div>

                          {/* List view of selected clients */}
                          <div className="grid grid-cols-2 gap-3">
                            {ALL_CLIENTS
                              .filter(c => selectedClients.has(c.id))
                              .filter(client => 
                                client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                client.groups.some(gId => {
                                  const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                  return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                })
                              )
                              .map((client) => (
                                <button
                                  key={client.id}
                                  onClick={() => {
                                    const newClients = new Set(selectedClients);
                                    newClients.delete(client.id);
                                    setSelectedClients(newClients);
                                  }}
                                  className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all border border-gray-100 dark:border-gray-800"
                                >
                                  {/* Checkbox - Always checked in selected list */}
                                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-green-600">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  
                                  {/* Client Info */}
                                  <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
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
                                  
                                  {/* Remove icon hint */}
                                  <div className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity">
                                    <X className="w-4 h-4" />
                                  </div>
                                </button>
                              ))}
                          </div>
                          
                          {/* No results message */}
                          {selectedClientsSearchQuery && 
                           ALL_CLIENTS
                             .filter(c => selectedClients.has(c.id))
                             .filter(client => 
                               client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                               client.groups.some(gId => {
                                 const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                 return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                               })
                             ).length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              No clients match your search
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Individual Client Selection */}
                  {assignmentMethod === 'individual' && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Search and Select Clients
                        </h5>
                        <Input
                          type="text"
                          placeholder="Search clients..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="mb-3"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          {ALL_CLIENTS
                            .filter(client => 
                              client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
                            )
                            .map((client) => {
                              const isSelected = selectedClients.has(client.id);
                              return (
                                <button
                                  key={client.id}
                                  onClick={() => {
                                    const newClients = new Set(selectedClients);
                                    if (isSelected) {
                                      newClients.delete(client.id);
                                    } else {
                                      newClients.add(client.id);
                                    }
                                    setSelectedClients(newClients);
                                  }}
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
                      </div>

                      {/* Show selected clients */}
                      {selectedClients.size > 0 && (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Selected Clients ({selectedClients.size})
                            </h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClients(new Set());
                                setSelectedClientsSearchQuery('');
                              }}
                              className="h-7 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          
                          {/* Search within selected clients */}
                          <Input
                            type="text"
                            placeholder="Search selected clients..."
                            value={selectedClientsSearchQuery}
                            onChange={(e) => setSelectedClientsSearchQuery(e.target.value)}
                            className="mb-3"
                          />

                          {/* Help text */}
                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                            💡 <strong>Tip:</strong> Click any client to remove them from your selection. You can always add them back!
                          </div>

                          {/* List view of selected clients */}
                          <div className="grid grid-cols-2 gap-3">
                            {ALL_CLIENTS
                              .filter(c => selectedClients.has(c.id))
                              .filter(client => 
                                client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                client.groups.some(gId => {
                                  const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                  return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                })
                              )
                              .map((client) => (
                                <button
                                  key={client.id}
                                  onClick={() => {
                                    const newClients = new Set(selectedClients);
                                    newClients.delete(client.id);
                                    setSelectedClients(newClients);
                                  }}
                                  className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all border border-gray-100 dark:border-gray-800"
                                >
                                  {/* Checkbox - Always checked in selected list */}
                                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-green-600">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  
                                  {/* Client Info */}
                                  <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
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
                                  
                                  {/* Remove icon hint */}
                                  <div className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity">
                                    <X className="w-4 h-4" />
                                  </div>
                                </button>
                              ))}
                          </div>
                          
                          {/* No results message */}
                          {selectedClientsSearchQuery && 
                           ALL_CLIENTS
                             .filter(c => selectedClients.has(c.id))
                             .filter(client => 
                               client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                               client.groups.some(gId => {
                                 const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                 return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                               })
                             ).length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              No clients match your search
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      {!isOwnerAdmin && (
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {currentStep === 2 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Areas
            </Button>
          )}
          <div className="ml-auto flex gap-3">
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            {currentStep === 1 ? (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={getEnabledCount() === 0}
                className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Next: Configure Permissions
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!roleName.trim()}
                className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Save className="w-4 h-4" />
                {isEditMode ? 'Save Changes' : 'Create Role'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer for Owner/Admin (Close only) */}
      {isOwnerAdmin && (
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onCancel} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

// Mock user data - Replace with real data from your backend
const MOCK_USERS = [
  { id: '1', name: 'John Smith', email: 'john@example.com', avatar: null },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: null },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', avatar: null },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', avatar: null },
  { id: '5', name: 'Robert Wilson', email: 'robert@example.com', avatar: null },
];
