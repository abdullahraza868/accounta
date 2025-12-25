import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  FileText,
  BarChart3
} from 'lucide-react';
import { cn } from '../../ui/utils';

type SubSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

const subsections: SubSection[] = [
  {
    id: 'retention',
    label: 'Data Retention',
    icon: Clock,
    path: '/settings/security/retention'
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: FileText,
    path: '/settings/security/audit'
  },
  {
    id: 'reports',
    label: 'Access Reports',
    icon: BarChart3,
    path: '/settings/security/reports'
  }
];

type SecurityComplianceSettingsLayoutProps = {
  children: React.ReactNode;
};

export function SecurityComplianceSettingsLayout({ children }: SecurityComplianceSettingsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentSection = subsections.find(s => location.pathname === s.path);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 flex min-h-0 overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 dark:from-gray-900 dark:via-orange-950/10 dark:to-gray-900">
        {/* Left Sidebar - Subsections */}
        <aside className="w-72 border-r border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-y-auto flex-shrink-0">
          <div className="p-6">
            {/* Back to Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Settings
            </button>

            {/* Category Title */}
            <div className="mb-6">
              <h2 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Security & Compliance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage security
              </p>
            </div>

            {/* Subsections List */}
            <nav className="space-y-1">
              {subsections.map((section) => {
                const isActive = location.pathname === section.path;
                return (
                  <button
                    key={section.id}
                    onClick={() => navigate(section.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <section.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "scale-110")} />
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-[1200px] mx-auto p-8">
            {/* Page Header */}
            {currentSection && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                    <currentSection.icon className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-gray-900 dark:text-gray-100">{currentSection.label}</h1>
                </div>
              </div>
            )}

            {/* Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
