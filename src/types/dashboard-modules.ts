// Dashboard Module Registry
// Centralized configuration for all dashboard widgets/modules

import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Inbox,
  LayoutGrid,
  LineChart,
  Mail,
  PieChart,
  Target,
  TrendingUp,
  Users,
  Bell,
  FolderOpen,
  ClipboardList,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type ModuleCategory =
  | 'overview'
  | 'financial'
  | 'clients'
  | 'tasks'
  | 'communications'
  | 'documents'
  | 'team'
  | 'analytics';

export type ModuleSize = 'small' | 'medium' | 'large' | 'full';

export type ModuleAccessLevel = 'view' | 'full';

export interface DashboardModule {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: LucideIcon;
  defaultSize: ModuleSize;
  defaultRoles: string[]; // Role IDs that can see this by default
  requiresIntegration?: string[]; // Optional: requires certain integrations
  isNew?: boolean; // Show "New" badge
  accessLevels?: ModuleAccessLevel[]; // What access levels are available (for Phase 2)
}

// Module Registry - All available dashboard modules
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  // ===== OVERVIEW MODULES =====
  integrationStatus: {
    id: 'integrationStatus',
    name: 'Integration Status',
    description: 'Monitor connected integrations and resolve issues',
    category: 'overview',
    icon: Zap,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin'],
  },

  taskOverview: {
    id: 'taskOverview',
    name: 'Task Overview',
    description: 'Visual breakdown of all tasks by status',
    category: 'overview',
    icon: PieChart,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  clientOverview: {
    id: 'clientOverview',
    name: 'Client Overview',
    description: 'Summary of client statistics and status',
    category: 'clients',
    icon: Users,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },

  // ===== FINANCIAL MODULES =====
  invoices: {
    id: 'invoices',
    name: 'Invoices',
    description: 'Track open and paid invoices',
    category: 'financial',
    icon: DollarSign,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },

  revenue: {
    id: 'revenue',
    name: 'Revenue',
    description: 'Monthly revenue, growth trends, and YTD performance',
    category: 'financial',
    icon: TrendingUp,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },

  outstandingPayments: {
    id: 'outstandingPayments',
    name: 'Outstanding Payments',
    description: 'Overdue invoices and payment tracking',
    category: 'financial',
    icon: DollarSign,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },

  // ===== CLIENT MODULES =====
  leads: {
    id: 'leads',
    name: 'Leads',
    description: 'Track prospects and conversion funnel',
    category: 'clients',
    icon: Target,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  recentActivity: {
    id: 'recentActivity',
    name: 'Recent Activity',
    description: 'Latest client interactions and updates',
    category: 'clients',
    icon: Activity,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  atRiskClients: {
    id: 'atRiskClients',
    name: 'At-Risk Clients',
    description: 'Clients who may need attention',
    category: 'clients',
    icon: Bell,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager'],
    isNew: true,
  },

  // ===== TASK MODULES =====
  myTasks: {
    id: 'myTasks',
    name: 'My Tasks',
    description: 'Your personal task list with due dates',
    category: 'tasks',
    icon: CheckSquare,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  projectTask: {
    id: 'projectTask',
    name: 'Project Tasks',
    description: 'Tasks organized by project',
    category: 'tasks',
    icon: LayoutGrid,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  upcomingDeadlines: {
    id: 'upcomingDeadlines',
    name: 'Upcoming Deadlines',
    description: 'Tasks and projects due soon',
    category: 'tasks',
    icon: Calendar,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
    isNew: true,
  },

  // ===== COMMUNICATION MODULES =====
  inbox: {
    id: 'inbox',
    name: 'Inbox',
    description: 'Recent messages and communications',
    category: 'communications',
    icon: Inbox,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  calendar: {
    id: 'calendar',
    name: 'Calendar',
    description: 'Upcoming meetings and events',
    category: 'communications',
    icon: Calendar,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  notifications: {
    id: 'notifications',
    name: 'Notifications',
    description: 'Recent alerts and system notifications',
    category: 'communications',
    icon: Bell,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
    isNew: true,
  },

  // ===== DOCUMENT MODULES =====
  documents: {
    id: 'documents',
    name: 'Documents',
    description: 'Document status and processing queue',
    category: 'documents',
    icon: FileText,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  signedDocs: {
    id: 'signedDocs',
    name: 'New Signed Documents',
    description: 'Recently signed documents',
    category: 'documents',
    icon: FileText,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager'],
  },

  organizer: {
    id: 'organizer',
    name: 'Organizer',
    description: 'Document organization and filing',
    category: 'documents',
    icon: FolderOpen,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin', 'manager', 'team-member'],
  },

  // ===== TEAM MODULES =====
  teamUtilization: {
    id: 'teamUtilization',
    name: 'Team Utilization',
    description: 'Team member workload and capacity',
    category: 'team',
    icon: Users,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },

  timeOff: {
    id: 'timeOff',
    name: 'Time Off Requests',
    description: 'Pending time off requests requiring approval',
    category: 'team',
    icon: Calendar,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },

  birthdaysAnniversaries: {
    id: 'birthdaysAnniversaries',
    name: 'Birthdays & Anniversaries',
    description: 'Upcoming team member celebrations',
    category: 'team',
    icon: Users,
    defaultSize: 'small',
    defaultRoles: ['owner', 'admin', 'manager'],
    isNew: true,
  },

  // ===== ANALYTICS MODULES =====
  kpiScorecard: {
    id: 'kpiScorecard',
    name: 'KPI Scorecard',
    description: 'Key performance indicators at a glance',
    category: 'analytics',
    icon: BarChart3,
    defaultSize: 'full',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },

  performanceMetrics: {
    id: 'performanceMetrics',
    name: 'Performance Metrics',
    description: 'Team and business performance analytics',
    category: 'analytics',
    icon: LineChart,
    defaultSize: 'medium',
    defaultRoles: ['owner', 'admin'],
    isNew: true,
  },
};

// Category metadata
export const MODULE_CATEGORIES: Record<ModuleCategory, { name: string; icon: LucideIcon; color: string }> = {
  overview: {
    name: 'Overview',
    icon: LayoutGrid,
    color: 'purple',
  },
  financial: {
    name: 'Financial',
    icon: DollarSign,
    color: 'green',
  },
  clients: {
    name: 'Clients',
    icon: Users,
    color: 'blue',
  },
  tasks: {
    name: 'Tasks & Projects',
    icon: CheckSquare,
    color: 'orange',
  },
  communications: {
    name: 'Communications',
    icon: Mail,
    color: 'indigo',
  },
  documents: {
    name: 'Documents',
    icon: FileText,
    color: 'gray',
  },
  team: {
    name: 'Team & HR',
    icon: Users,
    color: 'pink',
  },
  analytics: {
    name: 'Analytics',
    icon: BarChart3,
    color: 'cyan',
  },
};

// Helper functions
export function getModulesByCategory(category: ModuleCategory): DashboardModule[] {
  return Object.values(DASHBOARD_MODULES).filter((module) => module.category === category);
}

export function getModulesForRole(roleId: string): DashboardModule[] {
  return Object.values(DASHBOARD_MODULES).filter((module) =>
    module.defaultRoles.includes(roleId)
  );
}

export function getModuleById(moduleId: string): DashboardModule | undefined {
  return DASHBOARD_MODULES[moduleId];
}

export function getAllModuleIds(): string[] {
  return Object.keys(DASHBOARD_MODULES);
}

export function getModuleCount(): number {
  return Object.keys(DASHBOARD_MODULES).length;
}
