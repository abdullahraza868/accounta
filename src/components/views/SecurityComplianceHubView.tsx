import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield,
  Database,
  FileText,
  BarChart3,
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
    id: 'data-retention',
    label: 'Data Retention',
    icon: Database,
    path: '/settings/security/data-retention'
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: FileText,
    path: '/settings/security/audit-logs'
  },
  {
    id: 'access-reports',
    label: 'Access Reports',
    icon: BarChart3,
    path: '/settings/security/access-reports'
  }
];

type SecurityComplianceHubViewProps = {
  children: React.ReactNode;
};

export function SecurityComplianceHubView({ children }: SecurityComplianceHubViewProps) {
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
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Security & Compliance</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Security policies & logs</p>
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
                      ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "scale-110")} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
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
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 dark:from-gray-900 dark:via-orange-950/10 dark:to-gray-900">
        {children}
      </div>
    </div>
  );
}
