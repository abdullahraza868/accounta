import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  UserCog, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  Download,
  Users,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  Settings,
  Lock,
  FlipHorizontal,
  X,
  Check,
  Save
} from 'lucide-react';
import { cn } from '../ui/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

type Permission = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type PermissionCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
};

type Role = {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  userCount: number;
  color: string;
  permissions: Record<string, boolean>;
};

const DEFAULT_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'billing-reports',
    name: 'Billing Reports',
    description: 'Access to revenue and aging reports',
    icon: <DollarSign className="w-5 h-5" />,
    permissions: [
      {
        id: 'billing.reports.view_revenue',
        name: 'View Revenue Data',
        description: 'Access to all revenue metrics and reports',
        enabled: false,
      },
      {
        id: 'billing.reports.view_aging',
        name: 'View Aging Reports',
        description: 'Access to accounts receivable aging data',
        enabled: false,
      },
      {
        id: 'billing.reports.view_all_clients',
        name: 'View All Clients',
        description: 'View billing data for all clients (vs only assigned clients)',
        enabled: false,
      },
      {
        id: 'billing.reports.export',
        name: 'Export Reports',
        description: 'Download and export billing reports',
        enabled: false,
      },
    ],
  },
  {
    id: 'billing-management',
    name: 'Billing Management',
    description: 'Manage invoices and subscriptions',
    icon: <FileText className="w-5 h-5" />,
    permissions: [
      {
        id: 'billing.invoices.create',
        name: 'Create Invoices',
        description: 'Create new invoices',
        enabled: false,
      },
      {
        id: 'billing.invoices.edit',
        name: 'Edit Invoices',
        description: 'Modify existing invoices',
        enabled: false,
      },
      {
        id: 'billing.invoices.delete',
        name: 'Delete Invoices',
        description: 'Delete invoices',
        enabled: false,
      },
      {
        id: 'billing.subscriptions.manage',
        name: 'Manage Subscriptions',
        description: 'Create, edit, and cancel subscriptions',
        enabled: false,
      },
    ],
  },
  {
    id: 'client-management',
    name: 'Client Management',
    description: 'Manage client information and access',
    icon: <Users className="w-5 h-5" />,
    permissions: [
      {
        id: 'clients.view_all',
        name: 'View All Clients',
        description: 'Access all client folders and data',
        enabled: false,
      },
      {
        id: 'clients.view_assigned',
        name: 'View Assigned Clients',
        description: 'Access only clients assigned to this role',
        enabled: false,
      },
      {
        id: 'clients.create',
        name: 'Create Clients',
        description: 'Add new clients to the system',
        enabled: false,
      },
      {
        id: 'clients.edit',
        name: 'Edit Clients',
        description: 'Modify client information',
        enabled: false,
      },
      {
        id: 'clients.delete',
        name: 'Delete Clients',
        description: 'Remove clients from the system',
        enabled: false,
      },
    ],
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    description: 'Access to company and system settings',
    icon: <Settings className="w-5 h-5" />,
    permissions: [
      {
        id: 'settings.company.view',
        name: 'View Company Settings',
        description: 'View firm information and settings',
        enabled: false,
      },
      {
        id: 'settings.company.edit',
        name: 'Edit Company Settings',
        description: 'Modify firm information and settings',
        enabled: false,
      },
      {
        id: 'settings.team.manage',
        name: 'Manage Team',
        description: 'Add, edit, and remove team members',
        enabled: false,
      },
      {
        id: 'settings.roles.manage',
        name: 'Manage Roles',
        description: 'Create and modify user roles and permissions',
        enabled: false,
      },
    ],
  },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and settings',
    isDefault: true,
    userCount: 1,
    color: 'purple',
    permissions: {
      'billing.reports.view_revenue': true,
      'billing.reports.view_aging': true,
      'billing.reports.view_all_clients': true,
      'billing.reports.export': true,
      'billing.invoices.create': true,
      'billing.invoices.edit': true,
      'billing.invoices.delete': true,
      'billing.subscriptions.manage': true,
      'clients.view_all': true,
      'clients.view_assigned': false,
      'clients.create': true,
      'clients.edit': true,
      'clients.delete': true,
      'settings.company.view': true,
      'settings.company.edit': true,
      'settings.team.manage': true,
      'settings.roles.manage': true,
    },
  },
  {
    id: 'cpa',
    name: 'CPA / Partner',
    description: 'Senior accountant with broad access',
    isDefault: true,
    userCount: 3,
    color: 'blue',
    permissions: {
      'billing.reports.view_revenue': true,
      'billing.reports.view_aging': true,
      'billing.reports.view_all_clients': true,
      'billing.reports.export': true,
      'billing.invoices.create': true,
      'billing.invoices.edit': true,
      'billing.invoices.delete': false,
      'billing.subscriptions.manage': true,
      'clients.view_all': true,
      'clients.view_assigned': false,
      'clients.create': true,
      'clients.edit': true,
      'clients.delete': false,
      'settings.company.view': true,
      'settings.company.edit': false,
      'settings.team.manage': false,
      'settings.roles.manage': false,
    },
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team manager with client oversight',
    isDefault: true,
    userCount: 2,
    color: 'green',
    permissions: {
      'billing.reports.view_revenue': false,
      'billing.reports.view_aging': true,
      'billing.reports.view_all_clients': true,
      'billing.reports.export': true,
      'billing.invoices.create': true,
      'billing.invoices.edit': true,
      'billing.invoices.delete': false,
      'billing.subscriptions.manage': false,
      'clients.view_all': true,
      'clients.view_assigned': false,
      'clients.create': true,
      'clients.edit': true,
      'clients.delete': false,
      'settings.company.view': true,
      'settings.company.edit': false,
      'settings.team.manage': false,
      'settings.roles.manage': false,
    },
  },
  {
    id: 'staff',
    name: 'Staff Accountant',
    description: 'Standard team member with limited access',
    isDefault: true,
    userCount: 5,
    color: 'gray',
    permissions: {
      'billing.reports.view_revenue': false,
      'billing.reports.view_aging': false,
      'billing.reports.view_all_clients': false,
      'billing.reports.export': false,
      'billing.invoices.create': false,
      'billing.invoices.edit': false,
      'billing.invoices.delete': false,
      'billing.subscriptions.manage': false,
      'clients.view_all': false,
      'clients.view_assigned': true,
      'clients.create': false,
      'clients.edit': false,
      'clients.delete': false,
      'settings.company.view': false,
      'settings.company.edit': false,
      'settings.team.manage': false,
      'settings.roles.manage': false,
    },
  },
  {
    id: 'bookkeeper',
    name: 'Bookkeeper',
    description: 'Financial record keeping and basic client access',
    isDefault: true,
    userCount: 2,
    color: 'yellow',
    permissions: {
      'billing.reports.view_revenue': false,
      'billing.reports.view_aging': true,
      'billing.reports.view_all_clients': false,
      'billing.reports.export': true,
      'billing.invoices.create': true,
      'billing.invoices.edit': true,
      'billing.invoices.delete': false,
      'billing.subscriptions.manage': false,
      'clients.view_all': false,
      'clients.view_assigned': true,
      'clients.create': false,
      'clients.edit': false,
      'clients.delete': false,
      'settings.company.view': false,
      'settings.company.edit': false,
      'settings.team.manage': false,
      'settings.roles.manage': false,
    },
  },
];

// Helper to get permission display name
const getPermissionDisplayName = (permissionId: string): string => {
  for (const category of DEFAULT_PERMISSION_CATEGORIES) {
    const permission = category.permissions.find(p => p.id === permissionId);
    if (permission) return permission.name;
  }
  return permissionId;
};

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('purple');
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['billing-reports']));
  const [basedOnRole, setBasedOnRole] = useState<string>('staff');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [roleFilter, setRoleFilter] = useState<'All' | 'Default' | 'Custom'>('All');

  const filteredRoles = roles.filter(role => {
    if (roleFilter === 'All') return true;
    if (roleFilter === 'Default') return role.isDefault;
    if (roleFilter === 'Custom') return !role.isDefault;
    return true;
  });

  const totalRoles = roles.length;
  const defaultRoles = roles.filter(r => r.isDefault).length;
  const customRoles = roles.filter(r => !r.isDefault).length;
  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);

  const handleCreateRole = () => {
    // Initialize permissions from the selected base role
    const baseRole = roles.find(r => r.id === basedOnRole);
    if (baseRole) {
      setNewRolePermissions({ ...baseRole.permissions });
    }
    setIsCreatingRole(true);
  };

  const handleSaveRole = () => {
    const newRole: Role = {
      id: `custom-${Date.now()}`,
      name: newRoleName,
      description: newRoleDescription,
      isDefault: false,
      userCount: 0,
      color: newRoleColor,
      permissions: newRolePermissions,
    };
    setRoles([...roles, newRole]);
    setIsCreatingRole(false);
    resetForm();
  };

  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description);
    setNewRoleColor(role.color);
    setNewRolePermissions({ ...role.permissions });
  };

  const handleUpdateRole = () => {
    if (!editingRoleId) return;
    
    const updatedRoles = roles.map(role =>
      role.id === editingRoleId
        ? {
            ...role,
            name: newRoleName,
            description: newRoleDescription,
            color: newRoleColor,
            permissions: newRolePermissions,
          }
        : role
    );
    setRoles(updatedRoles);
    setEditingRoleId(null);
    resetForm();
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    resetForm();
  };

  const handleCancelCreate = () => {
    setIsCreatingRole(false);
    resetForm();
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const resetForm = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleColor('purple');
    setNewRolePermissions({});
    setBasedOnRole('staff');
  };

  const togglePermission = (permissionId: string) => {
    setNewRolePermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCardFlip = (roleId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const getRoleColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700', badge: 'bg-purple-500' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700', badge: 'bg-blue-500' },
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700', badge: 'bg-green-500' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700', badge: 'bg-yellow-500' },
      gray: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600', badge: 'bg-gray-500' },
      red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700', badge: 'bg-red-500' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700', badge: 'bg-orange-500' },
    };
    return colorMap[color] || colorMap.gray;
  };

  const getCategoryColor = (categoryId: string) => {
    const colorMap: Record<string, string> = {
      'billing-reports': 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
      'billing-management': 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
      'client-management': 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
      'system-settings': 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
    };
    return colorMap[categoryId] || 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setRoleFilter('All')}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
              roleFilter === 'All' 
                ? 'border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Roles</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalRoles}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setRoleFilter('Default')}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
              roleFilter === 'Default' 
                ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Default Roles</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{defaultRoles}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setRoleFilter('Custom')}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
              roleFilter === 'Custom' 
                ? 'border-green-500 dark:border-green-500 ring-2 ring-green-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Custom Roles</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{customRoles}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCog className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setRoleFilter('All')}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
              'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-gray-900 dark:text-gray-100">Manage Roles</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create and manage custom roles with specific permissions for your team members
                </p>
              </div>
              <Button
                onClick={handleCreateRole}
                className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </Button>
            </div>
          </div>

          {/* Flip Cards Hint - Only show when not editing/creating */}
          {!editingRoleId && !isCreatingRole && (
            <div className="mx-6 mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 flex items-center gap-2">
              <FlipHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>Tip:</strong> Click on any card to flip it and view all permissions, or click Edit to modify permissions
              </p>
            </div>
          )}

          {/* Roles Grid */}
          <div className="p-6">
            {editingRoleId ? (
              /* Inline Edit Mode - Takes Over Full Area */
              (() => {
                const role = roles.find(r => r.id === editingRoleId);
                if (!role) return null;

                return (
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-purple-500 dark:border-purple-600 p-6 shadow-lg">
                    {/* Edit Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                          <Edit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Editing: {role.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Customize role details and permissions
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>

                    {/* Role Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="edit-role-name" className="text-sm font-medium">
                          Role Name *
                          {role.isDefault && (
                            <Badge variant="outline" className="ml-2 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                              <Lock className="w-2.5 h-2.5 mr-1" />
                              System Role
                            </Badge>
                          )}
                        </Label>
                        {role.isDefault ? (
                          <div className="mt-1.5 py-2">
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {role.name}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              System role names cannot be changed
                            </p>
                          </div>
                        ) : (
                          <Input
                            id="edit-role-name"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="e.g., Senior Accountant"
                            className="mt-1.5"
                          />
                        )}
                      </div>

                      <div>
                        <Label htmlFor="edit-role-description" className="text-sm font-medium">Description</Label>
                        <Input
                          id="edit-role-description"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                          placeholder="Brief description"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-role-color" className="text-sm font-medium">Role Color</Label>
                        <Select value={newRoleColor} onValueChange={setNewRoleColor}>
                          <SelectTrigger id="edit-role-color" className="mt-1.5">
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

                    {/* Permissions Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Permissions</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Object.values(newRolePermissions).filter(Boolean).length} of {Object.keys(newRolePermissions).length} enabled
                        </span>
                      </div>

                      {/* Visual Permission Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DEFAULT_PERMISSION_CATEGORIES.map((category) => (
                          <div
                            key={category.id}
                            className={cn(
                              'rounded-xl p-4',
                              getCategoryColor(category.id)
                            )}
                          >
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                {category.icon}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                  {category.name}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {category.description}
                                </p>
                              </div>
                            </div>

                            {/* Permission Boxes */}
                            <div className="space-y-2">
                              {category.permissions.map((permission) => {
                                const isEnabled = newRolePermissions[permission.id];
                                return (
                                  <button
                                    key={permission.id}
                                    onClick={() => togglePermission(permission.id)}
                                    className={cn(
                                      'w-full p-3 rounded-lg border transition-all text-left',
                                      isEnabled
                                        ? 'bg-white dark:bg-gray-800 border-purple-400 dark:border-purple-500 shadow-sm'
                                        : 'bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                                    )}
                                  >
                                    <div className="flex items-start gap-2">
                                      {/* Visual Checkbox */}
                                      <div className={cn(
                                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                                        isEnabled
                                          ? 'bg-purple-600 dark:bg-purple-500'
                                          : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                                      )}>
                                        {isEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={cn(
                                          'text-sm font-medium',
                                          isEnabled
                                            ? 'text-gray-900 dark:text-gray-100'
                                            : 'text-gray-600 dark:text-gray-400'
                                        )}>
                                          {permission.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateRole}
                        disabled={!newRoleName.trim()}
                        className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Cards Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((role) => {
                  const colorClasses = getRoleColorClasses(role.color);
                  const enabledPermissionsCount = Object.values(role.permissions).filter(Boolean).length;
                  const totalPermissionsCount = Object.keys(role.permissions).length;
                  const isFlipped = flippedCards.has(role.id);

                  return (
                    <div
                      key={role.id}
                      className="relative h-[320px] cursor-pointer"
                      style={{ perspective: '1000px' }}
                      onClick={() => toggleCardFlip(role.id)}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-500"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front of Card */}
                        <div
                          className={cn(
                            'absolute w-full h-full bg-gray-50 dark:bg-gray-900 rounded-xl border-2 p-5 hover:shadow-md transition-shadow flex flex-col',
                            colorClasses.border
                          )}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                        >
                          {/* Role Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn('w-3 h-3 rounded-full', colorClasses.badge)} />
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">{role.name}</h3>
                                {role.isDefault && (
                                  <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                                    <Lock className="w-2.5 h-2.5 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {role.description}
                              </p>
                            </div>
                          </div>

                          {/* User Count */}
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                            </span>
                          </div>

                          {/* Permissions Summary */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Permissions</span>
                              <span className="text-xs text-gray-900 dark:text-gray-100">
                                {enabledPermissionsCount} / {totalPermissionsCount}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={cn('h-2 rounded-full', colorClasses.badge)}
                                style={{ width: `${(enabledPermissionsCount / totalPermissionsCount) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Key Permissions Preview - flex-1 to take remaining space */}
                          <div className="flex-1 mb-4 overflow-hidden">
                            <div className="space-y-1.5">
                              {Object.entries(role.permissions)
                                .filter(([_, enabled]) => enabled)
                                .slice(0, 3)
                                .map(([permId], idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                                    {getPermissionDisplayName(permId)}
                                  </div>
                                ))}
                              {enabledPermissionsCount > 3 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                  +{enabledPermissionsCount - 3} more...
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions - at bottom */}
                          <div 
                            className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 mt-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1.5 text-xs"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            {!role.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            )}
                          </div>

                          {/* Flip Indicator - moved to action bar */}
                          <div className="flex items-center justify-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 mt-2 pointer-events-none">
                            <FlipHorizontal className="w-3 h-3" />
                            <span className="font-medium">Click to see all permissions</span>
                          </div>
                        </div>

                        {/* Back of Card - All Permissions */}
                        <div
                          className="absolute w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl border-2 border-purple-300 dark:border-purple-700 p-5 flex flex-col"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          {(() => {
                            // Get all enabled permissions
                            const enabledPermissions = Object.entries(role.permissions)
                              .filter(([_, enabled]) => enabled)
                              .map(([permId]) => getPermissionDisplayName(permId));
                            
                            const permissionCount = enabledPermissions.length;
                            
                            // Dynamic sizing based on content amount
                            const getLayoutClasses = () => {
                              if (permissionCount <= 4) {
                                return {
                                  gridCols: 'grid-cols-1',
                                  textSize: 'text-sm',
                                  gap: 'gap-2',
                                  checkSize: 'text-base',
                                };
                              } else if (permissionCount <= 8) {
                                return {
                                  gridCols: 'grid-cols-2',
                                  textSize: 'text-xs',
                                  gap: 'gap-x-3 gap-y-2',
                                  checkSize: 'text-sm',
                                };
                              } else if (permissionCount <= 12) {
                                return {
                                  gridCols: 'grid-cols-2',
                                  textSize: 'text-[11px]',
                                  gap: 'gap-x-3 gap-y-1.5',
                                  checkSize: 'text-xs',
                                };
                              } else {
                                return {
                                  gridCols: 'grid-cols-2',
                                  textSize: 'text-[10px]',
                                  gap: 'gap-x-2 gap-y-1',
                                  checkSize: 'text-[11px]',
                                };
                              }
                            };

                            const layout = getLayoutClasses();

                            return (
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {role.name} Permissions ({permissionCount})
                                  </h3>
                                </div>
                                <div className="flex-1 min-h-0 overflow-auto">
                                  <ul className={cn('grid h-full content-start', layout.gridCols, layout.gap)}>
                                    {enabledPermissions.map((permission, index) => (
                                      <li key={index} className={cn('flex items-start gap-1.5 leading-tight text-gray-700 dark:text-gray-300', layout.textSize)}>
                                        <span className={cn('text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0', layout.checkSize)}>✓</span>
                                        <span className="break-words">{permission}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="mt-2 text-right">
                                  <p className="text-[9px] text-purple-700 dark:text-purple-300 italic opacity-70">
                                    Click to flip back
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredRoles.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No roles found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or create a new role
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={isCreatingRole} onOpenChange={setIsCreatingRole}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" aria-describedby="create-role-description">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription id="create-role-description">
              Define a new role with specific permissions for your team members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Senior Accountant"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Brief description of this role"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role-color">Role Color</Label>
                <Select value={newRoleColor} onValueChange={setNewRoleColor}>
                  <SelectTrigger id="role-color" className="mt-1">
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

              <div>
                <Label htmlFor="based-on">Base Permissions On</Label>
                <Select value={basedOnRole} onValueChange={(value) => {
                  setBasedOnRole(value);
                  const baseRole = DEFAULT_ROLES.find(r => r.id === value);
                  if (baseRole) {
                    setNewRolePermissions({ ...baseRole.permissions });
                  }
                }}>
                  <SelectTrigger id="based-on" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_ROLES.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Start with permissions from an existing role
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-sm text-gray-900 dark:text-gray-100 mb-3">Permissions</h3>
              <div className="space-y-2">
                {DEFAULT_PERMISSION_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  return (
                    <Collapsible
                      key={category.id}
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            {category.icon}
                            <div className="text-left">
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {category.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                            {category.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                              >
                                <div className="flex-1">
                                  <Label
                                    htmlFor={permission.id}
                                    className="text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                                  >
                                    {permission.name}
                                  </Label>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                                <Switch
                                  id={permission.id}
                                  checked={newRolePermissions[permission.id] || false}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!newRoleName.trim()}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}