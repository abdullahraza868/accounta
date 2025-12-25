import { 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Mail, 
  FolderKanban, 
  Calendar, 
  FileBox, 
  TrendingUp, 
  CheckSquare, 
  FolderOpen, 
  Activity, 
  Users,
  LucideIcon
} from 'lucide-react';

export type ModuleCategory = 'integration' | 'tasks' | 'financial' | 'documents' | 'communication' | 'clients' | 'calendar' | 'analytics';

export type ModuleSize = 'small' | 'medium' | 'large';

export interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: ModuleCategory;
  defaultSize: ModuleSize;
  defaultRoles: string[]; // Role IDs that can see this module by default
  isPremium?: boolean; // For future premium features
  minRequiredPermissions?: string[]; // Specific permissions needed
}

// Complete module registry - all available dashboard modules
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  integrationStatus: {
    id: 'integrationStatus',
    name: 'Integration Status',
    description: 'Monitor connected integrations and resolve issues',
    icon: AlertCircle,
    category: 'integration',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },
  taskOverview: {
    id: 'taskOverview',
    name: 'Task Overview',
    description: 'Visual breakdown of all tasks by status',
    icon: CheckCircle2,
    category: 'tasks',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  invoices: {
    id: 'invoices',
    name: 'Invoices',
    description: 'Track open and paid invoices',
    icon: DollarSign,
    category: 'financial',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },
  signedDocs: {
    id: 'signedDocs',
    name: 'New Signed Documents',
    description: 'Recently signed documents from clients',
    icon: FileText,
    category: 'documents',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  inbox: {
    id: 'inbox',
    name: 'Inbox',
    description: 'Recent messages and communications',
    icon: Mail,
    category: 'communication',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  projectTask: {
    id: 'projectTask',
    name: 'Project Tasks',
    description: 'Tasks organized by project and workflow',
    icon: FolderKanban,
    category: 'tasks',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    description: 'Upcoming meetings and events',
    icon: Calendar,
    category: 'calendar',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  documents: {
    id: 'documents',
    name: 'Documents',
    description: 'Document processing status overview',
    icon: FileBox,
    category: 'documents',
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  leads: {
    id: 'leads',
    name: 'Leads',
    description: 'Prospect and lead conversion tracking',
    icon: TrendingUp,
    category: 'clients',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },
  myTasks: {
    id: 'myTasks',
    name: 'My Tasks',
    description: 'Your personal task list',
    icon: CheckSquare,
    category: 'tasks',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  organizer: {
    id: 'organizer',
    name: 'Organizer',
    description: 'Organize and manage your workflow',
    icon: FolderOpen,
    category: 'tasks',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },
  recentActivity: {
    id: 'recentActivity',
    name: 'Recent Activity',
    description: 'Latest client and team activity',
    icon: Activity,
    category: 'analytics',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },
  clientOverview: {
    id: 'clientOverview',
    name: 'Client Overview',
    description: 'Client statistics and login tracking',
    icon: Users,
    category: 'clients',
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },
};

// Category metadata for organization
export const MODULE_CATEGORIES: Record<ModuleCategory, { name: string; description: string; icon: LucideIcon }> = {
  integration: {
    name: 'Integrations',
    description: 'Connected services and integration monitoring',
    icon: AlertCircle,
  },
  tasks: {
    name: 'Tasks & Projects',
    description: 'Task management and project tracking',
    icon: CheckSquare,
  },
  financial: {
    name: 'Financial',
    description: 'Invoices, revenue, and financial metrics',
    icon: DollarSign,
  },
  documents: {
    name: 'Documents',
    description: 'Document management and processing',
    icon: FileBox,
  },
  communication: {
    name: 'Communication',
    description: 'Messages and client communications',
    icon: Mail,
  },
  clients: {
    name: 'Clients',
    description: 'Client management and tracking',
    icon: Users,
  },
  calendar: {
    name: 'Calendar & Meetings',
    description: 'Scheduling and meeting management',
    icon: Calendar,
  },
  analytics: {
    name: 'Analytics & Activity',
    description: 'Activity tracking and analytics',
    icon: Activity,
  },
};

// Helper function to get modules by category
export function getModulesByCategory(category: ModuleCategory): DashboardModule[] {
  return Object.values(DASHBOARD_MODULES).filter(module => module.category === category);
}

// Helper function to get modules available to a role
export function getModulesForRole(roleId: string): DashboardModule[] {
  return Object.values(DASHBOARD_MODULES).filter(module => 
    module.defaultRoles.includes(roleId)
  );
}

// Helper function to check if user can access module
export function canAccessModule(moduleId: string, roleId: string, roleModuleOverrides?: string[]): boolean {
  const module = DASHBOARD_MODULES[moduleId];
  if (!module) return false;
  
  // If role has overrides, use those
  if (roleModuleOverrides) {
    return roleModuleOverrides.includes(moduleId);
  }
  
  // Otherwise check default roles
  return module.defaultRoles.includes(roleId);
}

// Get all module IDs as array
export function getAllModuleIds(): string[] {
  return Object.keys(DASHBOARD_MODULES);
}

// Get module by ID
export function getModuleById(moduleId: string): DashboardModule | undefined {
  return DASHBOARD_MODULES[moduleId];
}
