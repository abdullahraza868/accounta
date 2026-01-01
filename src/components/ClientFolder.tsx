import { 
  Gauge,
  User,
  Activity,
  MessageSquare, 
  Receipt,
  FileSignature,
  FolderOpen,
  StickyNote,
  LayoutGrid,
  Users,
  Edit2,
  Settings,
  ExternalLink,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Video,
  Send,
  Search,
  Filter,
  X,
  ChevronDown,
  Smartphone,
  FileText,
  Upload,
  FileUp,
  MessageCircle,
  History
} from 'lucide-react';
import { Client, FolderTab } from '../App';
import { cn } from './ui/utils';
import { SnapshotTab } from './folder-tabs/SnapshotTab';
import { DemographicsTab } from './folder-tabs/DemographicsTab';
import { ActivityTab } from './folder-tabs/ActivityTab';
import { CommunicationTab } from './folder-tabs/CommunicationTab';
import { InvoicesTab } from './folder-tabs/InvoicesTab';
import { SignatureTab } from './folder-tabs/SignatureTab';
import { DocumentsTab } from './folder-tabs/DocumentsTab';
import { NotesTab } from './folder-tabs/NotesTab';
import { OrganizersTab } from './folder-tabs/OrganizersTab';
import { TeamsTab } from './folder-tabs/TeamsTab';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ClientDetailsSummary } from './ClientDetailsSummary';
import { useState, useRef, useEffect } from 'react';

type ClientFolderProps = {
  client: Client;
  activeTab: FolderTab;
  onTabChange: (tab: FolderTab) => void;
  communicationSubTab?: 'internal' | 'external' | 'texting' | 'email' | 'callback-history';
  onCommunicationSubTabChange?: (subTab: 'internal' | 'external' | 'texting' | 'email' | 'callback-history') => void;
};

export function ClientFolder({ client, activeTab, onTabChange, communicationSubTab, onCommunicationSubTabChange }: ClientFolderProps) {
  const teamsTabRef = useRef<{ triggerAddMember: () => void } | null>(null);
  const activityTabRef = useRef<{ 
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    categories: { value: string; label: string; icon?: any; count: number }[];
  } | null>(null);
  const communicationTabRef = useRef<{
    channelMode: 'internal' | 'external' | 'texting' | 'email' | 'callback-history';
    setChannelMode: (mode: 'internal' | 'external' | 'texting' | 'email' | 'callback-history') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  } | null>(null);
  const [activityKey, setActivityKey] = useState(0);
  const [communicationKey, setCommunicationKey] = useState(0);
  const [currentChannelMode, setCurrentChannelMode] = useState<'internal' | 'external' | 'texting' | 'email' | 'callback-history'>('internal');
  const [currentSnapshotSubTab, setCurrentSnapshotSubTab] = useState<'overview' | 'action-items' | 'tracker' | 'meetings'>('overview');

  // Force re-render when Activity tab becomes active to populate filters
  useEffect(() => {
    if (activeTab === 'Activity') {
      // Small delay to ensure ref is populated
      const timer = setTimeout(() => {
        setActivityKey(prev => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Force re-render when Communication tab becomes active to populate filters
  useEffect(() => {
    if (activeTab === 'Communication') {
      const timer = setTimeout(() => {
        setCommunicationKey(prev => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Build tabs list based on client type
  const baseTabs: { label: FolderTab; icon: React.ElementType }[] = [
    { label: 'Snapshot', icon: Gauge },
    { label: 'Demographics', icon: User },
    { label: 'Teams', icon: Users },
    { label: 'Activity', icon: Activity },
    { label: 'Communication', icon: MessageSquare },
    { label: 'Invoices', icon: Receipt },
    { label: 'Signatures', icon: FileSignature },
    { label: 'Documents', icon: FolderOpen },
    { label: 'Notes', icon: StickyNote },
    { label: 'Organizer', icon: LayoutGrid },
  ];

  // All tabs are now available for both Individual and Business clients
  const primaryTabs: { label: FolderTab; icon: React.ElementType }[] = baseTabs;

  const moreTabs: { label: FolderTab; icon: React.ElementType }[] = [];

  // Render submenu actions based on active tab
  const renderSubmenuActions = () => {
    switch (activeTab) {
      case 'Snapshot':
        return (
          <div className="flex-1 flex justify-end gap-2">
            {/* Preview Button */}
            <Button 
              size="sm"
              onClick={() => window.open('/client-portal', '_blank', 'noopener,noreferrer')}
              className="btn-primary text-xs md:text-sm h-8"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Preview Client View
            </Button>
          </div>
        );
      case 'Demographics':
        return (
          <div className="flex-1 flex justify-end gap-2">
            <Button 
              size="sm"
              className="btn-primary text-xs md:text-sm h-8"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Details
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="border-brand-light text-brand-primary hover-brand text-xs md:text-sm h-8"
              onClick={() => {
                // Trigger settings panel in DemographicsTab
                const event = new CustomEvent('toggleDemographicsSettings');
                window.dispatchEvent(event);
              }}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Customize Fields
            </Button>
          </div>
        );
      case 'Activity':
        return (
          <div className="flex-1 flex items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Filters:</span>
              
              {/* All Button */}
              <button
                onClick={() => activityTabRef.current?.setSelectedCategories([])}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5",
                  (activityTabRef.current?.selectedCategories.length || 0) === 0
                    ? "bg-selected-light border-brand-light hover-brand"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                All
                <span className={cn(
                  "ml-0.5 px-1 py-0.5 rounded text-xs",
                  (activityTabRef.current?.selectedCategories.length || 0) === 0 ? "badge-brand" : "bg-gray-100 text-gray-600"
                )}>
                  {(activityTabRef.current?.categories || []).reduce((total, cat) => total + cat.count, 0)}
                </span>
              </button>

              {/* Category Buttons */}
              {(activityTabRef.current?.categories || []).map((category) => {
                const isSelected = activityTabRef.current?.selectedCategories.includes(category.value);
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => {
                      const current = activityTabRef.current?.selectedCategories || [];
                      const newCategories = current.includes(category.value)
                        ? current.filter(c => c !== category.value)
                        : [...current, category.value];
                      activityTabRef.current?.setSelectedCategories(newCategories);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5",
                      isSelected
                        ? "bg-selected-light border-brand-light hover-brand"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                    {category.label}
                    <span className={cn(
                      "ml-0.5 px-1 py-0.5 rounded text-xs",
                      isSelected ? "badge-brand" : "bg-gray-100 text-gray-600"
                    )}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search - Right Side */}
            <div className="relative w-48 lg:w-56 xl:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search activity..."
                value={activityTabRef.current?.searchTerm || ''}
                onChange={(e) => activityTabRef.current?.setSearchTerm(e.target.value)}
                className="pl-9 pr-9 h-8 text-sm"
              />
              {activityTabRef.current?.searchTerm && (
                <button
                  onClick={() => activityTabRef.current?.setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      case 'Teams':
        return (
          <div className="flex-1 flex justify-end">
            <Button 
              size="sm"
              onClick={() => teamsTabRef.current?.triggerAddMember()}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Add Team Member
            </Button>
          </div>
        );
      case 'Communication':
        return (
          <div className="flex-1 flex items-center justify-between gap-4">
            {/* Channel Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentChannelMode('internal');
                  communicationTabRef.current?.setChannelMode('internal');
                  onCommunicationSubTabChange?.('internal');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'internal'
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Internal Discussion
                <Badge className="ml-1 bg-orange-500 hover:bg-orange-500 text-white text-[10px] h-4 min-w-4 px-1">
                  2
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('external');
                  communicationTabRef.current?.setChannelMode('external');
                  onCommunicationSubTabChange?.('external');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'external'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Client Chat
                <Badge className="ml-1 bg-red-600 hover:bg-red-600 text-white text-[10px] h-4 min-w-4 px-1 animate-pulse">
                  1
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('email');
                  communicationTabRef.current?.setChannelMode('email');
                  onCommunicationSubTabChange?.('email');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'email'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                Email
                <Badge className="ml-1 bg-purple-600 hover:bg-purple-600 text-white text-[10px] h-4 min-w-4 px-1">
                  1
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('texting');
                  communicationTabRef.current?.setChannelMode('texting');
                  onCommunicationSubTabChange?.('texting');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'texting'
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Text Messages
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('callback-history');
                  communicationTabRef.current?.setChannelMode('callback-history');
                  onCommunicationSubTabChange?.('callback-history');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'callback-history'
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <History className="w-3.5 h-3.5" />
                Callback History
              </button>
            </div>

            {/* Search - Right Side */}
            <div className="relative w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={communicationTabRef.current?.searchQuery || ''}
                onChange={(e) => communicationTabRef.current?.setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-8 text-sm"
              />
              {communicationTabRef.current?.searchQuery && (
                <button
                  onClick={() => communicationTabRef.current?.setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      case 'Invoices':
        return (
          <div className="flex-1 flex justify-end">
            <Button 
              size="sm"
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Invoice
            </Button>
          </div>
        );
      case 'Signatures':
        return null; // Buttons are in the SignatureTab component itself
      case 'Notes':
        return (
          <div className="flex-1 flex justify-end">
            <Button 
              size="sm"
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Note
            </Button>
          </div>
        );
      case 'Organizer':
        return (
          <div className="flex-1 flex justify-end">
            <Button 
              size="sm"
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Organizer
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-black/20 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
        <div className="flex items-center gap-1 px-3 md:px-5 min-w-max">
          {primaryTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onTabChange(tab.label)}
              className={cn(
                "flex items-center gap-1.5 px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap tracking-tight relative",
                activeTab === tab.label
                  ? "border-brand-primary text-brand-primary bg-selected-lighter"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              )}
            >
              <tab.icon className={cn(
                "w-3.5 md:w-4 h-3.5 md:h-4 transition-transform duration-200",
                activeTab === tab.label && "scale-110"
              )} />
              <span className="tracking-tight">{tab.label}</span>
              {tab.label === 'Communication' && (
                <Badge className="ml-1 bg-red-600 hover:bg-red-600 text-white text-[10px] h-4 min-w-4 px-1 animate-pulse">
                  4
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Client Details Summary - Always visible across all tabs */}
      <ClientDetailsSummary client={client} />

      {/* Submenu Bar - Actions for current tab */}
      {renderSubmenuActions() && (
        <div className={cn(
          "bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 px-3 md:px-4",
          activeTab === 'Activity' ? "py-2" : "py-2 flex items-center justify-between gap-2"
        )}>
          {renderSubmenuActions()}
        </div>
      )}
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
        {activeTab === 'Snapshot' && <SnapshotTab client={client} subTab={currentSnapshotSubTab} />}
        {activeTab === 'Demographics' && <DemographicsTab client={client} />}
        {activeTab === 'Teams' && <TeamsTab ref={teamsTabRef} client={client} />}
        {activeTab === 'Activity' && <ActivityTab key={activityKey} ref={activityTabRef} client={client} />}
        {activeTab === 'Communication' && <CommunicationTab key={communicationKey} ref={communicationTabRef} client={client} />}
        {activeTab === 'Invoices' && <InvoicesTab client={client} />}
        {activeTab === 'Signatures' && <SignatureTab client={client} />}
        {activeTab === 'Documents' && <DocumentsTab client={client} />}
        {activeTab === 'Notes' && <NotesTab client={client} />}
        {activeTab === 'Organizer' && <OrganizersTab client={client} />}
      </div>
    </div>
  );
}