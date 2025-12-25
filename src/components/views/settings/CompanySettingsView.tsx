import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  Navigation, 
  Menu, 
  Grid, 
  AlignJustify, 
  Folder,
  Calendar,
  Mail,
  Clock,
  Link2,
  LayoutGrid,
  Lock,
  CreditCard,
  ArrowLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../ui/button';
import { NavigationView } from '../NavigationView';
import { EmailCustomizationView } from '../../../pages/app/settings/EmailCustomizationView';
import { FirmDemographicsView } from './FirmDemographicsView';
import { TeamMembersView } from './TeamMembersView';
import { RolesPermissionsView } from './RolesPermissionsView';
import { AuthSecurityView } from './AuthSecurityView';
import { BillingSubscriptionView } from './BillingSubscriptionView';
import { ScheduleSettingsView } from './ScheduleSettingsView';
import { DashboardModulesView } from './DashboardModulesView';
import { MainNavigationTab } from '../../navigation-tabs/MainNavigationTab';
import { ClientPortalNavigationTab } from '../../navigation-tabs/ClientPortalNavigationTab';
import { TopbarNavigationTab } from '../../navigation-tabs/TopbarNavigationTab';
import { ClientFolderTab } from '../../navigation-tabs/ClientFolderTab';
import { ConnectedAccountsTab } from '../../company-settings-tabs/ConnectedAccountsTab';

type SettingsSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  component?: React.ComponentType;
  placeholder?: boolean;
  submenu?: {
    id: string;
    label: string;
    icon: React.ElementType;
    component: React.ComponentType;
  }[];
};

const sections: SettingsSection[] = [
  {
    id: 'demographics',
    label: 'Firm Demographics',
    icon: Building2,
    component: FirmDemographicsView
  },
  {
    id: 'team',
    label: 'Team Members',
    icon: Users,
    component: TeamMembersView
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: Shield,
    component: RolesPermissionsView
  },
  {
    id: 'navigation',
    label: 'Navigation & UI',
    icon: Navigation,
    submenu: [
      {
        id: 'main-navigation',
        label: 'Main Navigation',
        icon: Menu,
        component: MainNavigationTab
      },
      {
        id: 'client-portal',
        label: 'Client Portal Navigation',
        icon: Grid,
        component: ClientPortalNavigationTab
      },
      {
        id: 'topbar',
        label: 'Topbar Navigation',
        icon: AlignJustify,
        component: TopbarNavigationTab
      },
      {
        id: 'client-folder',
        label: 'Client Folder',
        icon: Folder,
        component: ClientFolderTab
      }
    ]
  },
  {
    id: 'calendar',
    label: 'Calendar Settings',
    icon: Calendar,
    placeholder: true
  },
  {
    id: 'email',
    label: 'Email Customization',
    icon: Mail,
    component: EmailCustomizationView
  },
  {
    id: 'schedule',
    label: 'Schedule Settings',
    icon: Clock,
    component: ScheduleSettingsView
  },
  {
    id: 'connected',
    label: 'Connected Accounts',
    icon: Link2,
    component: ConnectedAccountsTab
  },
  {
    id: 'dashboard',
    label: 'Dashboard Modules',
    icon: LayoutGrid,
    component: DashboardModulesView
  },
  {
    id: 'authentication',
    label: 'Authentication & Security',
    icon: Lock,
    component: AuthSecurityView
  },
  {
    id: 'billing',
    label: 'Billing & Subscription',
    icon: CreditCard,
    component: BillingSubscriptionView
  }
];

export function CompanySettingsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  
  // Get current section and subsection from URL path
  const pathSegments = location.pathname.split('/');
  const currentSectionId = pathSegments[3] || 'demographics'; // /settings/company/{section}
  const currentSubsectionId = pathSegments[4] || null; // /settings/company/navigation/{subsection}
  
  const currentSection = sections.find(s => s.id === currentSectionId) || sections[0];
  
  // If on navigation section without subsection, redirect to first submenu item
  useEffect(() => {
    if (currentSectionId === 'navigation' && !currentSubsectionId && currentSection.submenu) {
      const firstSubmenuItem = currentSection.submenu[0];
      navigate(`/settings/company/navigation/${firstSubmenuItem.id}`, { replace: true });
    }
  }, [currentSectionId, currentSubsectionId, currentSection.submenu, navigate]);
  
  // Auto-expand navigation submenu when on a navigation page
  useEffect(() => {
    const isNavigationPage = currentSectionId === 'navigation';
    if (isNavigationPage) {
      setNavigationExpanded(true);
    }
  }, [currentSectionId]);
  
  // Determine which component to render
  let ComponentToRender = currentSection.component;
  
  if (currentSection.submenu && currentSubsectionId) {
    const submenuItem = currentSection.submenu.find(sub => sub.id === currentSubsectionId);
    if (submenuItem) {
      ComponentToRender = submenuItem.component;
    }
  }
  
  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Left Sidebar - Sections List */}
      <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Settings</span>
          </button>
          <h2 className="text-gray-900 dark:text-gray-100">Company Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your firm's configuration
          </p>
        </div>
        
        {/* Sections Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sections.map((section) => {
              const isActive = section.id === currentSectionId;
              const hasSubmenu = section.submenu && section.submenu.length > 0;
              
              return (
                <div key={section.id}>
                  {/* Main Section Button */}
                  <button
                    onClick={() => {
                      if (hasSubmenu) {
                        // For sections with submenu, navigate to first submenu item and expand
                        const firstSubmenuItem = section.submenu![0];
                        navigate(`/settings/company/${section.id}/${firstSubmenuItem.id}`);
                        if (section.id === 'navigation') {
                          setNavigationExpanded(true);
                        }
                      } else {
                        navigate(`/settings/company/${section.id}`);
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{section.label}</span>
                    </div>
                    {hasSubmenu && isActive && (
                      <div onClick={(e) => {
                        e.stopPropagation();
                        if (section.id === 'navigation') {
                          setNavigationExpanded(!navigationExpanded);
                        }
                      }}>
                        {navigationExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu Items */}
                  {hasSubmenu && isActive && navigationExpanded && (
                    <div className="ml-4 mt-1 space-y-1 relative pl-3 border-l-2 border-purple-300 dark:border-purple-700">
                      {section.submenu!.map((submenuItem) => {
                        const isSubmenuActive = currentSubsectionId === submenuItem.id;
                        
                        return (
                          <button
                            key={submenuItem.id}
                            onClick={() => navigate(`/settings/company/${section.id}/${submenuItem.id}`)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                              isSubmenuActive
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <submenuItem.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{submenuItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {ComponentToRender ? (
          // Render the actual component (like NavigationSettingsView)
          <ComponentToRender />
        ) : currentSection.placeholder ? (
          // Placeholder content
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto p-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6">
                    <currentSection.icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-gray-900 dark:text-gray-100 mb-3">{currentSection.label}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This section is coming soon. We're building comprehensive settings to help you manage your {currentSection.label.toLowerCase()}.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Under Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}