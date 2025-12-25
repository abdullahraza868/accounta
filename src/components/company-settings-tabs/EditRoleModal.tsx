import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  ChevronDown,
  ChevronRight,
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
} from 'lucide-react';
import { cn } from '../ui/utils';

// Permission action types
type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'manage';

// Scope types
type ScopeType = 'all' | 'assigned';

// Permission structure
type Permission = {
  id: string;
  name: string;
  description?: string;
  actions: ActionType[];
  defaultActions?: ActionType[];
  scope?: {
    options: { value: ScopeType; label: string }[];
    default: ScopeType;
  };
};

type PermissionSection = {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  permissions?: Permission[];
  scope?: ScopeType;
};

// Dashboard module categories
type DashboardModule = {
  id: string;
  name: string;
  category: 'financial' | 'client' | 'project-task' | 'communication' | 'document';
  enabled: boolean;
};

const DASHBOARD_MODULES: DashboardModule[] = [
  { id: 'invoices-overview', name: 'Invoices Overview', category: 'financial', enabled: false },
  { id: 'client-activity', name: 'Client Activity', category: 'client', enabled: false },
  { id: 'leads', name: 'Leads', category: 'client', enabled: false },
  { id: 'client-overview', name: 'Client Overview', category: 'client', enabled: false },
  { id: 'my-tasks', name: 'My Tasks', category: 'project-task', enabled: false },
  { id: 'project-tasks', name: 'Project Tasks', category: 'project-task', enabled: false },
  { id: 'messages', name: 'Messages', category: 'communication', enabled: false },
  { id: 'meetings', name: 'Meetings', category: 'communication', enabled: false },
  { id: 'signed-documents', name: 'Signed Documents', category: 'document', enabled: false },
  { id: 'organizer', name: 'Organizer', category: 'document', enabled: false },
  { id: 'documents-overview', name: 'Documents Overview', category: 'document', enabled: false },
];

const MODULE_CATEGORIES = [
  { id: 'financial', name: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'client', name: 'Client Management', icon: <Users className="w-4 h-4" /> },
  { id: 'project-task', name: 'Projects & Tasks', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'communication', name: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'document', name: 'Documents', icon: <FileText className="w-4 h-4" /> },
];

type EditRoleModalProps = {
  role?: {
    id: string;
    name: string;
    description: string;
    color: string;
    isDefault: boolean;
    userCount: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: any) => void;
};

export function EditRoleModal({ role, isOpen, onClose, onSave }: EditRoleModalProps) {
  const isOwnerAdmin = role?.name === 'Owner/Admin';
  const isEditMode = !!role;

  // Form state
  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleDescription, setRoleDescription] = useState(role?.description || '');
  const [roleColor, setRoleColor] = useState(role?.color || 'purple');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedDashboard, setExpandedDashboard] = useState<Set<string>>(new Set());

  // Permission sections state
  const [sections, setSections] = useState<PermissionSection[]>([
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      enabled: false,
    },
    {
      id: 'clients',
      name: 'Clients',
      icon: <Users className="w-5 h-5" />,
      enabled: false,
      scope: 'all',
      permissions: [
        {
          id: 'client-overview',
          name: 'Overview/Snapshot',
          actions: ['view'],
          defaultActions: ['view'],
        },
        {
          id: 'client-demographics',
          name: 'Demographics',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'client-teams',
          name: 'Teams',
          actions: ['view', 'create', 'edit', 'delete'],
          defaultActions: ['view'],
        },
        {
          id: 'client-activity',
          name: 'Activity Log',
          actions: ['view', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'client-documents',
          name: 'Documents',
          actions: ['view', 'create', 'edit', 'delete', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'client-file-manager',
          name: 'File Manager',
          actions: ['view', 'create', 'edit', 'delete', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'client-signatures',
          name: 'Signatures',
          actions: ['view', 'create', 'edit', 'delete', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'client-billing',
          name: 'Billing/Invoices',
          actions: ['view', 'create', 'edit', 'delete', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'client-projects',
          name: 'Projects',
          actions: ['view', 'create', 'edit', 'delete'],
          defaultActions: ['view'],
        },
        {
          id: 'client-messages',
          name: 'Messages',
          actions: ['view', 'create'],
          defaultActions: ['view'],
        },
        {
          id: 'client-organizer',
          name: 'Organizer',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
      ],
    },
    {
      id: 'document-center',
      name: 'Document Center',
      icon: <FolderOpen className="w-5 h-5" />,
      enabled: false,
      permissions: [
        {
          id: 'dc-documents',
          name: 'Documents',
          actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'],
          defaultActions: ['view'],
        },
        {
          id: 'dc-checklist',
          name: 'Document Checklist/Bundle',
          actions: ['view', 'create', 'edit', 'delete', 'manage'],
          defaultActions: ['view'],
        },
        {
          id: 'dc-file-manager',
          name: 'File Manager',
          actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'],
          defaultActions: ['view'],
        },
      ],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <Briefcase className="w-5 h-5" />,
      enabled: false,
      scope: 'all',
      permissions: [
        {
          id: 'project-access',
          name: 'Project Access',
          description: 'View and access projects',
          actions: ['view', 'create', 'edit', 'delete'],
          defaultActions: ['view'],
          scope: {
            options: [
              { value: 'all', label: 'All Projects' },
              { value: 'assigned', label: 'Assigned Projects Only' },
            ],
            default: 'all',
          },
        },
        {
          id: 'project-budget',
          name: 'Project Budget',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'project-workflows',
          name: 'Workflows',
          description: 'View and manage workflows',
          actions: ['view', 'create', 'edit'],
          defaultActions: ['view'],
          scope: {
            options: [
              { value: 'all', label: 'All Workflows' },
              { value: 'assigned', label: 'Assigned Workflows Only' },
            ],
            default: 'assigned',
          },
        },
        {
          id: 'project-create-on-workflows',
          name: 'Create Projects on Workflows',
          description: 'Create new projects using workflow templates',
          actions: ['create'],
          defaultActions: [],
        },
      ],
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: <DollarSign className="w-5 h-5" />,
      enabled: false,
      permissions: [
        {
          id: 'billing-invoices',
          name: 'Invoices',
          actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'],
          defaultActions: ['view'],
        },
        {
          id: 'billing-subscriptions',
          name: 'Subscriptions',
          actions: ['view', 'create', 'edit', 'delete', 'manage'],
          defaultActions: ['view'],
        },
        {
          id: 'billing-payments',
          name: 'Payments (Stripe Dashboard)',
          description: 'Access to Stripe Express Dashboard',
          actions: ['view'],
          defaultActions: [],
        },
        {
          id: 'billing-settings',
          name: 'Billing Settings',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'billing-payment-strategy',
          name: 'Subscription Payment Strategy',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'billing-reminder-strategy',
          name: 'Invoice Reminder Strategy',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'billing-activity',
          name: 'Billing Activity Log',
          actions: ['view', 'export'],
          defaultActions: ['view'],
        },
      ],
    },
    {
      id: 'signatures',
      name: 'Signatures',
      icon: <FileSignature className="w-5 h-5" />,
      enabled: false,
      permissions: [
        {
          id: 'signatures-view',
          name: 'View Signatures',
          actions: ['view', 'export'],
          defaultActions: ['view'],
        },
        {
          id: 'signatures-send',
          name: 'Send Signature Requests',
          actions: ['create'],
          defaultActions: [],
        },
        {
          id: 'signatures-templates',
          name: 'Signature Templates',
          actions: ['view', 'create', 'edit', 'delete', 'manage'],
          defaultActions: ['view'],
        },
        {
          id: 'signatures-manage',
          name: 'Manage Signatures',
          description: 'Edit and delete signature requests',
          actions: ['edit', 'delete'],
          defaultActions: [],
        },
      ],
    },
    {
      id: 'organizer',
      name: 'Organizer',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      enabled: false,
      permissions: [
        {
          id: 'organizer-view',
          name: 'View Organizers',
          actions: ['view'],
          defaultActions: ['view'],
        },
        {
          id: 'organizer-manage',
          name: 'Manage Organizers',
          actions: ['create', 'edit', 'delete'],
          defaultActions: [],
        },
      ],
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      enabled: false,
    },
    {
      id: 'messages',
      name: 'Messages/Chats',
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: false,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      enabled: false,
      permissions: [
        {
          id: 'settings-company',
          name: 'Company Settings',
          description: 'Firm branding, business information',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'settings-portal',
          name: 'Client & Portal Settings',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'settings-security',
          name: 'Security & Compliance',
          description: 'MFA, security settings',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
        {
          id: 'settings-billing',
          name: 'Billing & Invoicing Settings',
          actions: ['view', 'edit'],
          defaultActions: ['view'],
        },
      ],
    },
  ]);

  // Dashboard modules state
  const [dashboardModules, setDashboardModules] = useState<DashboardModule[]>(DASHBOARD_MODULES);

  // Permission state for each subsection
  const [permissionStates, setPermissionStates] = useState<
    Record<string, { actions: Set<ActionType>; scope?: ScopeType }>
  >({});

  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setRoleDescription(role.description);
      setRoleColor(role.color);
      // TODO: Load existing permissions from role data
    }
  }, [role]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleDashboardCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedDashboard);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedDashboard(newExpanded);
  };

  const toggleSectionEnabled = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section
      )
    );

    // If disabling, collapse the section
    if (expandedSections.has(sectionId)) {
      const newExpanded = new Set(expandedSections);
      newExpanded.delete(sectionId);
      setExpandedSections(newExpanded);
    }
  };

  const toggleAction = (permissionId: string, action: ActionType) => {
    setPermissionStates((prev) => {
      const current = prev[permissionId] || { actions: new Set(), scope: undefined };
      const newActions = new Set(current.actions);

      if (newActions.has(action)) {
        newActions.delete(action);
        // If removing 'view', also remove dependent actions
        if (action === 'view') {
          ['create', 'edit', 'delete', 'export', 'manage'].forEach((a) =>
            newActions.delete(a as ActionType)
          );
        }
        // If removing 'edit', also remove 'delete'
        if (action === 'edit') {
          newActions.delete('delete');
        }
      } else {
        newActions.add(action);
        // If adding any action except 'view', ensure 'view' is enabled
        if (action !== 'view') {
          newActions.add('view');
        }
        // If adding 'delete', ensure 'edit' is enabled
        if (action === 'delete') {
          newActions.add('edit');
          newActions.add('view');
        }
      }

      return {
        ...prev,
        [permissionId]: { ...current, actions: newActions },
      };
    });
  };

  const toggleDashboardModule = (moduleId: string) => {
    setDashboardModules(
      dashboardModules.map((module) =>
        module.id === moduleId ? { ...module, enabled: !module.enabled } : module
      )
    );
  };

  const setPermissionScope = (permissionId: string, scope: ScopeType) => {
    setPermissionStates((prev) => ({
      ...prev,
      [permissionId]: { ...prev[permissionId], scope },
    }));
  };

  const handleSave = () => {
    const roleData = {
      name: roleName,
      description: roleDescription,
      color: roleColor,
      sections,
      dashboardModules,
      permissionStates,
    };
    onSave(roleData);
  };

  const getActionLabel = (action: ActionType): string => {
    const labels: Record<ActionType, string> = {
      view: 'View',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      manage: 'Manage',
    };
    return labels[action];
  };

  const isActionEnabled = (permissionId: string, action: ActionType): boolean => {
    return permissionStates[permissionId]?.actions.has(action) || false;
  };

  const getPermissionScope = (permissionId: string): ScopeType | undefined => {
    return permissionStates[permissionId]?.scope;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between border-b border-purple-500">
          <div className="flex items-center gap-3">
            {isOwnerAdmin ? (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Settings className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isOwnerAdmin ? 'View Permissions' : isEditMode ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-sm text-purple-100">
                {isOwnerAdmin
                  ? 'Owner/Admin has full access to all features (cannot be modified)'
                  : isEditMode
                  ? `Customize permissions for ${role?.name}`
                  : 'Define a new role with specific permissions'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Impact Warning */}
        {isEditMode && !isOwnerAdmin && role && role.userCount > 0 && (
          <div className="mx-6 mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {role.userCount} {role.userCount === 1 ? 'user' : 'users'} will be affected by this
                change
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Changes will take effect on their next page navigation
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Role Details */}
          {!isOwnerAdmin && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Role Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="role-name" className="text-sm font-medium">
                    Role Name *
                  </Label>
                  <Input
                    id="role-name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g., Senior Accountant"
                    className="mt-1.5"
                    disabled={role?.isDefault}
                  />
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

          {/* Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Access Permissions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sections.filter((s) => s.enabled).length} of {sections.length} sections enabled
              </p>
            </div>

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Section Header - Clickable */}
                  <div className="flex items-center gap-3 p-4">
                    {/* Enable/Disable Checkbox */}
                    <button
                      onClick={() => !isOwnerAdmin && toggleSectionEnabled(section.id)}
                      disabled={isOwnerAdmin}
                      className={cn(
                        'w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all',
                        isOwnerAdmin
                          ? 'bg-purple-600 dark:bg-purple-500 cursor-not-allowed opacity-70'
                          : section.enabled
                          ? 'bg-purple-600 dark:bg-purple-500 hover:bg-purple-700'
                          : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                      )}
                    >
                      {(isOwnerAdmin || section.enabled) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        section.enabled || isOwnerAdmin
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      )}
                    >
                      {section.icon}
                    </div>

                    {/* Section Name - Clickable to expand */}
                    <button
                      onClick={() =>
                        (section.enabled || isOwnerAdmin) &&
                        (section.permissions || section.id === 'dashboard') &&
                        toggleSection(section.id)
                      }
                      disabled={!section.enabled && !isOwnerAdmin}
                      className="flex-1 flex items-center justify-between text-left"
                    >
                      <div className="flex-1">
                        <h4
                          className={cn(
                            'font-medium',
                            section.enabled || isOwnerAdmin
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-600'
                          )}
                        >
                          {section.name}
                        </h4>
                        {section.permissions && section.enabled && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {section.permissions.length} subsections
                          </p>
                        )}
                      </div>

                      {/* Expand Arrow - Only show if section has permissions or is dashboard */}
                      {(section.permissions || section.id === 'dashboard') && (
                        <div className="ml-auto">
                          {expandedSections.has(section.id) ? (
                            <ChevronDown
                              className={cn(
                                'w-5 h-5',
                                section.enabled || isOwnerAdmin
                                  ? 'text-gray-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ) : (
                            <ChevronRight
                              className={cn(
                                'w-5 h-5',
                                section.enabled || isOwnerAdmin
                                  ? 'text-gray-400'
                                  : 'text-gray-300'
                              )}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Expanded Content - Dashboard Modules */}
                  {section.id === 'dashboard' &&
                    expandedSections.has(section.id) &&
                    (section.enabled || isOwnerAdmin) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Select which dashboard modules this role can access. Users can customize
                          their own dashboard layout from available modules.
                        </p>

                        <div className="space-y-3">
                          {MODULE_CATEGORIES.map((category) => {
                            const categoryModules = dashboardModules.filter(
                              (m) => m.category === category.id
                            );

                            return (
                              <div
                                key={category.id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                {/* Category Header */}
                                <button
                                  onClick={() => toggleDashboardCategory(category.id)}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                    {category.icon}
                                  </div>
                                  <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                                    {category.name}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {categoryModules.filter((m) => m.enabled).length} /{' '}
                                    {categoryModules.length}
                                  </span>
                                  {expandedDashboard.has(category.id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>

                                {/* Category Modules */}
                                {expandedDashboard.has(category.id) && (
                                  <div className="px-3 pb-3 space-y-2">
                                    {categoryModules.map((module) => (
                                      <button
                                        key={module.id}
                                        onClick={() =>
                                          !isOwnerAdmin && toggleDashboardModule(module.id)
                                        }
                                        disabled={isOwnerAdmin}
                                        className={cn(
                                          'w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left',
                                          isOwnerAdmin || module.enabled
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                                            isOwnerAdmin
                                              ? 'bg-purple-600 cursor-not-allowed'
                                              : module.enabled
                                              ? 'bg-purple-600'
                                              : 'bg-gray-300 dark:bg-gray-600'
                                          )}
                                        >
                                          {(isOwnerAdmin || module.enabled) && (
                                            <Check className="w-3 h-3 text-white" />
                                          )}
                                        </div>
                                        <span
                                          className={cn(
                                            'text-sm',
                                            isOwnerAdmin || module.enabled
                                              ? 'text-gray-900 dark:text-gray-100 font-medium'
                                              : 'text-gray-600 dark:text-gray-400'
                                          )}
                                        >
                                          {module.name}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Expanded Content - Subsection Permissions */}
                  {section.permissions &&
                    expandedSections.has(section.id) &&
                    (section.enabled || isOwnerAdmin) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        {/* Scope Selector (for Clients and Projects) */}
                        {section.scope !== undefined && (
                          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Label className="text-sm font-medium mb-2 block">
                              {section.name} Scope
                            </Label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (!isOwnerAdmin) {
                                    setSections(
                                      sections.map((s) =>
                                        s.id === section.id ? { ...s, scope: 'all' } : s
                                      )
                                    );
                                  }
                                }}
                                disabled={isOwnerAdmin}
                                className={cn(
                                  'flex-1 py-2 px-4 rounded-lg border transition-all text-sm font-medium',
                                  isOwnerAdmin || section.scope === 'all'
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                )}
                              >
                                All {section.name}
                              </button>
                              <button
                                onClick={() => {
                                  if (!isOwnerAdmin) {
                                    setSections(
                                      sections.map((s) =>
                                        s.id === section.id ? { ...s, scope: 'assigned' } : s
                                      )
                                    );
                                  }
                                }}
                                disabled={isOwnerAdmin}
                                className={cn(
                                  'flex-1 py-2 px-4 rounded-lg border transition-all text-sm font-medium',
                                  !isOwnerAdmin && section.scope === 'assigned'
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                )}
                              >
                                Assigned {section.name} Only
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {section.scope === 'all'
                                ? `This role can access all ${section.name.toLowerCase()} in the system`
                                : `This role can only access ${section.name.toLowerCase()} specifically assigned to them`}
                            </p>
                          </div>
                        )}

                        {/* Subsection Permissions */}
                        <div className="space-y-3">
                          {section.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                            >
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {permission.name}
                                </h5>
                                {permission.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {permission.description}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {permission.actions.map((action) => {
                                  const enabled =
                                    isOwnerAdmin ||
                                    (permission.defaultActions?.includes(action) ?? false) ||
                                    isActionEnabled(permission.id, action);

                                  return (
                                    <button
                                      key={action}
                                      onClick={() =>
                                        !isOwnerAdmin && toggleAction(permission.id, action)
                                      }
                                      disabled={isOwnerAdmin}
                                      className={cn(
                                        'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                        isOwnerAdmin
                                          ? 'bg-purple-600 border-purple-600 text-white cursor-not-allowed opacity-90'
                                          : enabled
                                          ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
                                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                      )}
                                    >
                                      {getActionLabel(action)}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Permission-specific Scope */}
                              {permission.scope && (
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                  <Label className="text-xs font-medium mb-2 block text-gray-600 dark:text-gray-400">
                                    Scope
                                  </Label>
                                  <div className="flex gap-2">
                                    {permission.scope.options.map((option) => {
                                      const selected =
                                        isOwnerAdmin
                                          ? permission.scope?.default === option.value
                                          : getPermissionScope(permission.id) === option.value ||
                                            (getPermissionScope(permission.id) === undefined &&
                                              permission.scope?.default === option.value);

                                      return (
                                        <button
                                          key={option.value}
                                          onClick={() =>
                                            !isOwnerAdmin &&
                                            setPermissionScope(permission.id, option.value)
                                          }
                                          disabled={isOwnerAdmin}
                                          className={cn(
                                            'flex-1 py-1.5 px-3 rounded-lg border transition-all text-xs font-medium',
                                            selected
                                              ? 'bg-purple-600 border-purple-600 text-white'
                                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                          )}
                                        >
                                          {option.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!isOwnerAdmin && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!roleName.trim()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Save className="w-4 h-4" />
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        )}

        {/* Footer for Owner/Admin (Close only) */}
        {isOwnerAdmin && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end">
            <Button onClick={onClose} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
