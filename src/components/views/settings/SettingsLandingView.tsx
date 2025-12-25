import { 
  Building2, 
  Users, 
  Shield, 
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CategoryCard = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  route: string;
  isExternal?: boolean;
};

const categoryCards: CategoryCard[] = [
  {
    id: 'company',
    icon: Building2,
    title: 'Company Settings',
    description: 'Manage firm demographics, team members, roles, navigation, calendar, email, schedule, and authentication settings.',
    gradient: 'from-purple-500 to-purple-600',
    route: '/settings/company'
  },
  {
    id: 'client-portal',
    icon: Users,
    title: 'Client & Portal Settings',
    description: 'Configure portal branding, client permissions, folders, templates, and communication preferences.',
    gradient: 'from-blue-500 to-blue-600',
    route: '/settings/client-portal'
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Manage data retention policies, audit logs, and access reports for compliance and security.',
    gradient: 'from-orange-500 to-red-600',
    route: '/settings/security'
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Invoicing',
    description: 'Configure subscription, payment reminders, invoice reminders, and payment retry strategies.',
    gradient: 'from-green-500 to-emerald-600',
    route: '/billing/subscription/settings',
    isExternal: true
  }
];

export function SettingsLandingView() {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your company, clients, security, and billing preferences
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            {categoryCards.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(card.route)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 p-8 text-left overflow-hidden"
              >
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                    <card.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-900 dark:text-gray-100 mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center gap-2 text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all duration-300">
                    <span className="text-sm font-medium">
                      {card.isExternal ? 'Go to settings' : 'Configure'}
                    </span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-500">
              Copyright © 2025, Acounta ® Inc. All Rights Reserved.{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                923-ACOUNTA (226-8682)
              </a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a href="#" className="text-xs text-gray-500 hover:text-purple-600">
                Terms & Conditions
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-xs text-gray-500 hover:text-purple-600">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
