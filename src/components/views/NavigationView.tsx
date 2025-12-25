import { useState } from 'react';
import { Menu, Grid, AlignJustify, Folder } from 'lucide-react';
import { MainNavigationTab } from '../navigation-tabs/MainNavigationTab';
import { ClientPortalNavigationTab } from '../navigation-tabs/ClientPortalNavigationTab';
import { TopbarNavigationTab } from '../navigation-tabs/TopbarNavigationTab';
import { ClientFolderTab } from '../navigation-tabs/ClientFolderTab';
import { cn } from '../ui/utils';

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

export function NavigationView() {
  const [activeSection, setActiveSection] = useState('main-navigation');

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || MainNavigationTab;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>Settings</span>
          <span>›</span>
          <span className="text-gray-900 dark:text-gray-100">Navigation</span>
        </div>
        <h1 className="text-gray-900 dark:text-gray-100">Navigation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your navigation menus and client folder tabs
        </p>
      </div>

      {/* Main Content Area with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        {/* Left Sidebar Navigation */}
        <aside className="flex-none w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                    isActive
                      ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
