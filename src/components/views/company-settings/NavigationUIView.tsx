import { useState } from 'react';
import { Menu, Grid, AlignJustify, Folder, Navigation } from 'lucide-react';
import { MainNavigationTab } from '../../navigation-tabs/MainNavigationTab';
import { ClientPortalNavigationTab } from '../../navigation-tabs/ClientPortalNavigationTab';
import { TopbarNavigationTab } from '../../navigation-tabs/TopbarNavigationTab';
import { ClientFolderTab } from '../../navigation-tabs/ClientFolderTab';
import { cn } from '../../ui/utils';

type NavigationSection = {
  id: string;
  icon: React.ElementType;
  label: string;
  component: React.ComponentType;
};

const sections: NavigationSection[] = [
  { 
    id: 'main-navigation', 
    icon: Menu, 
    label: 'Main Navigation',
    component: MainNavigationTab
  },
  { 
    id: 'client-portal', 
    icon: Grid, 
    label: 'Client Portal Navigation',
    component: ClientPortalNavigationTab
  },
  { 
    id: 'topbar', 
    icon: AlignJustify, 
    label: 'Topbar Navigation',
    component: TopbarNavigationTab
  },
  { 
    id: 'client-folder', 
    icon: Folder, 
    label: 'Client Folder',
    component: ClientFolderTab
  },
];

export function NavigationUIView() {
  const [activeSection, setActiveSection] = useState('main-navigation');

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || MainNavigationTab;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100">Navigation & UI Preferences</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Customize navigation menus, links, and interface elements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}
