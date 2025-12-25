import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, UserCog, Users, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FirmTab } from '../company-settings-tabs/FirmTab';
import { RolesTab } from '../company-settings-tabs/RolesTab_NEW';
import { TeamMembersTab } from '../company-settings-tabs/TeamMembersTab_NEW';
import { MultifactorTab } from '../company-settings-tabs/MultifactorTab';

// Shared types
type Role = {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  userCount?: number;
  permissions?: Record<string, boolean>;
  teamMembers?: { id: string; name: string; avatar?: string }[];
};

type ClientGroup = {
  id: string;
  name: string;
  clientCount: number;
};

type Client = {
  id: string;
  name: string;
  groupId: string;
};

// Shared mock data for client groups
const SHARED_CLIENT_GROUPS: ClientGroup[] = [
  { id: 'group-1', name: 'Tax Clients', clientCount: 25 },
  { id: 'group-2', name: 'Audit Clients', clientCount: 15 },
  { id: 'group-3', name: 'Advisory Clients', clientCount: 30 },
  { id: 'group-4', name: 'Bookkeeping Clients', clientCount: 40 },
];

// Shared mock data for clients
const SHARED_CLIENTS: Client[] = [
  { id: 'client-1', name: 'Acme Corporation', groupId: 'group-1' },
  { id: 'client-2', name: 'Tech Startup Inc', groupId: 'group-1' },
  { id: 'client-3', name: 'Manufacturing Co', groupId: 'group-2' },
  { id: 'client-4', name: 'Retail Store LLC', groupId: 'group-3' },
  { id: 'client-5', name: 'Restaurant Group', groupId: 'group-4' },
  { id: 'client-6', name: 'Medical Practice', groupId: 'group-1' },
  { id: 'client-7', name: 'Law Firm Partners', groupId: 'group-3' },
  { id: 'client-8', name: 'Real Estate Holdings', groupId: 'group-2' },
];

export function CompanySettingsView() {
  const [searchParams] = useSearchParams();
  // Initialize activeTab based on URL params
  const initialTab = searchParams.get('action') === 'invite' ? 'team' : 'firm';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Shared state for roles - will be populated by RolesTab and consumed by TeamMembersTab
  const [sharedRoles, setSharedRoles] = useState<Role[]>([]);

  // Auto-switch to team tab if action=invite is in URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invite') {
      setActiveTab('team');
    }
  }, [searchParams]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header with Breadcrumb */}
      <div className="flex-none px-8 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>Settings</span>
          <span>›</span>
          <span className="text-gray-900 dark:text-gray-100">Company settings</span>
        </div>
        <h1 className="text-gray-900 dark:text-gray-100">Company Settings</h1>
      </div>

      {/* Tabs Container - Scrollable */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <TabsTrigger 
                value="firm" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Firm</span>
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white"
              >
                <UserCog className="w-4 h-4" />
                <span className="hidden sm:inline">Roles</span>
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger 
                value="multifactor" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Multifactor Authentication</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="firm" className="mt-0">
              <FirmTab />
            </TabsContent>
            <TabsContent value="roles" className="mt-0">
              <RolesTab 
                sharedRoles={sharedRoles}
                setSharedRoles={setSharedRoles}
              />
            </TabsContent>
            <TabsContent value="team" className="mt-0">
              <TeamMembersTab 
                sharedRoles={sharedRoles}
                sharedClientGroups={SHARED_CLIENT_GROUPS}
                sharedClients={SHARED_CLIENTS}
              />
            </TabsContent>
            <TabsContent value="multifactor" className="mt-0">
              <MultifactorTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}