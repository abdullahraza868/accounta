import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2,
  Users,
  Shield,
  Navigation,
  Calendar,
  Mail,
  LayoutGrid,
  Link2,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../ui/utils';

type Subsection = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
};

const subsections: Subsection[] = [
  {
    id: 'demographics',
    label: 'Firm Demographics',
    icon: Building2,
    path: '/settings/company/demographics'
  },
  {
    id: 'team',
    label: 'Team Members',
    icon: Users,
    path: '/settings/company/team'
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: Shield,
    path: '/settings/company/roles'
  },
  {
    id: 'navigation',
    label: 'Navigation & UI Preferences',
    icon: Navigation,
    path: '/settings/company/navigation'
  },
  {
    id: 'calendar',
    label: 'Calendar Settings',
    icon: Calendar,
    path: '/settings/company/calendar'
  },
  {
    id: 'email',
    label: 'Email Customization',
    icon: Mail,
    path: '/settings/company/email'
  },
  {
    id: 'schedule',
    label: 'Schedule Settings',
    icon: Clock,
    path: '/settings/company/schedule'
  },
  {
    id: 'connected',
    label: 'Connected Accounts',
    icon: Link2,
    path: '/settings/company/connected'
  },
  {
    id: 'dashboard',
    label: 'Dashboard Modules',
    icon: LayoutGrid,
    path: '/settings/company/dashboard'
  },
  {
    id: 'auth',
    label: 'Authentication & Security',
    icon: Shield,
    path: '/settings/company/auth'
  }
];

type CompanySettingsHubViewProps = {
  children: React.ReactNode;
};

export function CompanySettingsHubView({ children }: CompanySettingsHubViewProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Company Settings</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Firm-level configuration</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {subsections.map((item) => {
              const isActive = currentPath === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "scale-110")} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        {children}
      </div>
    </div>
  );
}
