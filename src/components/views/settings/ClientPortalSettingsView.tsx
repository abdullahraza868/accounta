import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Palette,
  Lock,
  FolderOpen,
  MessageSquare,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { PlatformBrandingView } from '../PlatformBrandingView';
import { FolderManagementView } from '../FolderManagementView';

type SettingsSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  component?: React.ComponentType;
  placeholder?: boolean;
};

const sections: SettingsSection[] = [
  {
    id: 'branding',
    label: 'Portal Branding',
    icon: Palette,
    component: PlatformBrandingView
  },
  {
    id: 'permissions',
    label: 'Client Permissions',
    icon: Lock,
    placeholder: true
  },
  {
    id: 'folders',
    label: 'Folders & Templates',
    icon: FolderOpen,
    component: FolderManagementView
  },
  {
    id: 'communication',
    label: 'Communication Preferences',
    icon: MessageSquare,
    placeholder: true
  }
];

export function ClientPortalSettingsView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current section from URL path
  const pathSegments = location.pathname.split('/');
  const currentSectionId = pathSegments[3] || 'branding'; // /settings/client-portal/{section}
  
  const currentSection = sections.find(s => s.id === currentSectionId) || sections[0];
  
  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Left Sidebar - Sections List */}
      <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Settings</span>
          </button>
          <h2 className="text-gray-900 dark:text-gray-100">Client & Portal Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure client-facing features
          </p>
        </div>
        
        {/* Sections Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sections.map((section) => {
              const isActive = section.id === currentSectionId;
              
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(`/settings/client-portal/${section.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentSection.component ? (
          // Render the actual component (has its own wrapper)
          <currentSection.component />
        ) : currentSection.placeholder ? (
          // Placeholder content
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto p-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                    <currentSection.icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-gray-900 dark:text-gray-100 mb-3">{currentSection.label}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This section is coming soon. We're building comprehensive settings to help you manage your {currentSection.label.toLowerCase()}.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm">
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