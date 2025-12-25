import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  CreditCard 
} from 'lucide-react';

type SettingCategory = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  path: string;
};

const settingsCategories: SettingCategory[] = [
  {
    id: 'company',
    icon: Building2,
    title: 'Company Settings',
    description: 'Manage firm demographics, team members, roles, navigation, calendar, email, and authentication settings.',
    gradient: 'from-purple-500 to-purple-600',
    path: '/settings/company'
  },
  {
    id: 'client-portal',
    icon: Users,
    title: 'Client & Portal Settings',
    description: 'Configure portal branding, client permissions, folders, templates, and communication preferences.',
    gradient: 'from-blue-500 to-blue-600',
    path: '/settings/client-portal'
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Manage data retention policies, audit logs, access reports, and compliance requirements.',
    gradient: 'from-orange-500 to-red-600',
    path: '/settings/security'
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Invoicing',
    description: 'Configure subscription, payment reminders, invoice reminders, and payment retry strategies.',
    gradient: 'from-green-500 to-green-600',
    path: '/billing/subscription/settings'
  }
];

export function SettingsHubView() {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your company, client portal, security, and billing settings</p>
          </div>

          {/* Settings Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(category.path)}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:border-transparent dark:hover:border-transparent transition-all duration-300 p-8 text-left relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-900 dark:text-gray-100 mb-3">{category.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r group-hover:translate-x-2 transition-transform duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                    <span className={`bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
                      Configure settings
                    </span>
                    <svg className={`w-4 h-4 text-${category.id === 'company' ? 'purple' : category.id === 'client-portal' ? 'blue' : category.id === 'security' ? 'orange' : 'green'}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copyright © 2025, Acounta ® Inc. All Rights Reserved.{' '}
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline">
                923-ACOUNTA (226-8682)
              </a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Terms & Conditions
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
