import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield,
  Trash2,
  FileText,
  BarChart3,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../ui/utils';

type SubSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
};

const subsections: SubSection[] = [
  { id: 'retention', label: 'Data Retention', icon: Trash2, route: '/settings/security/retention' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, route: '/settings/security/audit' },
  { id: 'reports', label: 'Access Reports', icon: BarChart3, route: '/settings/security/reports' }
];

export function SecurityComplianceSettingsView() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which subsection is active
  const activeSection = subsections.find(s => location.pathname === s.route) || subsections[0];

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100">Security & Compliance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise security controls</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {subsections.map((section) => {
              const isActive = location.pathname === section.route;
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(section.route)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  )}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-orange-50/10 to-gray-50 dark:from-gray-900 dark:via-orange-950/5 dark:to-gray-900">
        <div className="max-w-5xl mx-auto p-8">
          {/* Content Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <activeSection.icon className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">{activeSection.label}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure your {activeSection.label.toLowerCase()}</p>
              </div>
            </div>

            {/* Placeholder Content */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-gray-600 dark:text-gray-400">
                This section will contain the configuration options for {activeSection.label}.
              </p>
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Enterprise Feature:</strong> This section is designed for compliance and security monitoring at scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
