import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  LayoutDashboard,
  Users,
  FileText,
  Folder,
  CheckSquare,
  CreditCard,
  FileSignature,
  LucideIcon,
  Globe,
  Search,
  MessageSquare,
  Calendar,
  Bell,
  User,
  FolderKanban,
  FolderOpen,
  FileUp,
  PenTool,
  Upload,
  Activity,
  Plus,
  Phone,
  Mail,
  HelpCircle,
  Wallet,
  BarChart3,
  Repeat,
  TrendingUp,
  DollarSign,
  Settings
} from 'lucide-react';

// Submenu Item
export type SubmenuItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  visible: boolean;
  order: number;
};

// Main Navigation Item
export type MainNavItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  visible: boolean;
  isSystem: boolean;
  url?: string;
  openBehavior?: 'new-window' | 'embedded';
  order: number;
  submenu?: SubmenuItem[];
};

// Client Portal Navigation Item
export type ClientPortalNavItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  visible: boolean;
  isSystem: boolean;
  url?: string;
  openBehavior?: 'new-window' | 'embedded';
  order: number;
};

// Topbar Item
export type TopbarItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  visible: boolean;
};

// Client Folder Tab
export type ClientFolderTab = {
  id: string;
  icon: LucideIcon;
  label: string;
  visible: boolean;
  order: number;
};

type NavigationConfig = {
  mainNav: MainNavItem[];
  clientPortalNav: ClientPortalNavItem[];
  topbar: TopbarItem[];
  clientFolder: ClientFolderTab[];
};

type NavigationConfigContextType = {
  config: NavigationConfig;
  updateMainNav: (items: MainNavItem[]) => void;
  updateClientPortalNav: (items: ClientPortalNavItem[]) => void;
  updateTopbar: (items: TopbarItem[]) => void;
  updateClientFolder: (tabs: ClientFolderTab[]) => void;
};

const NavigationConfigContext = createContext<NavigationConfigContextType | undefined>(undefined);

const defaultConfig: NavigationConfig = {
  mainNav: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', visible: true, isSystem: true, order: 0 },
    { id: 'clients', icon: Users, label: 'Clients', visible: true, isSystem: true, order: 1 },
    { id: 'intake', icon: FileText, label: 'Document Center', visible: true, isSystem: true, order: 2 },
    { id: 'chat', icon: MessageSquare, label: 'Chat', visible: true, isSystem: true, order: 3 },
    { id: 'projects', icon: Folder, label: 'Projects', visible: true, isSystem: true, order: 4 },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', visible: true, isSystem: true, order: 5 },
    { 
      id: 'billing', 
      icon: CreditCard, 
      label: 'Billing', 
      visible: true, 
      isSystem: true, 
      order: 6,
      submenu: [
        { id: 'reports', icon: BarChart3, label: 'Reports', visible: true, order: 0 },
        { id: 'invoices', icon: FileText, label: 'Invoices', visible: true, order: 1 },
        { id: 'subscriptions', icon: Repeat, label: 'Subscriptions', visible: true, order: 2 },
        { id: 'payments', icon: Wallet, label: 'Payments', visible: true, order: 3 },
      ]
    },
    { id: 'signatures', icon: FileSignature, label: 'Signatures', visible: true, isSystem: true, order: 7 },
    { id: 'utilization-analytics', icon: TrendingUp, label: 'Utilization & Analytics', visible: true, isSystem: true, order: 8 },
    { id: 'payroll-report', icon: DollarSign, label: 'Payroll Report', visible: true, isSystem: true, order: 9 },
    { id: 'team-settings', icon: Settings, label: 'Team Settings', visible: true, isSystem: true, order: 10 },
    { 
      id: 'acounta-website', 
      icon: Globe, 
      label: 'Acounta Website', 
      visible: true, 
      isSystem: false,
      url: 'https://www.acounta.com',
      openBehavior: 'embedded',
      order: 11
    },
  ],
  clientPortalNav: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', visible: true, isSystem: true, order: 0 },
    { id: 'projects', icon: Folder, label: 'Projects', visible: true, isSystem: true, order: 1 },
    { id: 'invoices', icon: CreditCard, label: 'Invoices', visible: true, isSystem: true, order: 2 },
    { id: 'file-manager', icon: FolderOpen, label: 'File Manager', visible: true, isSystem: true, order: 3 },
    { id: 'uploaded-docs', icon: FileUp, label: 'Uploaded Docs', visible: true, isSystem: true, order: 4 },
    { id: 'signatures', icon: FileSignature, label: 'Signatures', visible: true, isSystem: true, order: 5 },
    { id: 'communication', icon: MessageSquare, label: 'Communication', visible: true, isSystem: true, order: 6 },
  ],
  topbar: [
    // Left side quick access (editable labels)
    { id: 'clients', icon: Users, label: 'Clients', visible: true },
    { id: 'add-task', icon: Plus, label: 'Add Task', visible: true },
    { id: 'message', icon: Phone, label: 'Message', visible: true },
    // Right side action icons - email, calendar, notifications, help section
    { id: 'email', icon: Mail, label: 'Email', visible: true },
    { id: 'text-messages', icon: MessageSquare, label: 'Text Messages', visible: true },
    { id: 'calendar', icon: Calendar, label: 'Calendar', visible: true },
    { id: 'notifications', icon: Bell, label: 'Notifications', visible: true },
    { id: 'help', icon: HelpCircle, label: 'Help', visible: true },
  ],
  clientFolder: [
    { id: 'snapshot', icon: LayoutDashboard, label: 'Snapshot', visible: true, order: 0 },
    { id: 'demographics', icon: Users, label: 'Demographics', visible: true, order: 1 },
    { id: 'teams', icon: Users, label: 'Teams', visible: true, order: 2 },
    { id: 'projects', icon: FolderKanban, label: 'Projects', visible: true, order: 3 },
    { id: 'invoices', icon: FileText, label: 'Invoices', visible: true, order: 4 },
    { id: 'files', icon: FolderOpen, label: 'Files', visible: true, order: 5 },
    { id: 'documents', icon: Upload, label: 'Documents', visible: true, order: 6 },
    { id: 'signatures', icon: PenTool, label: 'Signatures', visible: true, order: 7 },
    { id: 'communication', icon: MessageSquare, label: 'Communication', visible: true, order: 8 },
    { id: 'activity', icon: Activity, label: 'Activity', visible: true, order: 9 },
    { id: 'notes', icon: CheckSquare, label: 'Notes', visible: true, order: 10 },
  ],
};

export function NavigationConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<NavigationConfig>(defaultConfig);

  const updateMainNav = (items: MainNavItem[]) => {
    setConfig(prev => ({ ...prev, mainNav: items }));
  };

  const updateClientPortalNav = (items: ClientPortalNavItem[]) => {
    setConfig(prev => ({ ...prev, clientPortalNav: items }));
  };

  const updateTopbar = (items: TopbarItem[]) => {
    setConfig(prev => ({ ...prev, topbar: items }));
  };

  const updateClientFolder = (tabs: ClientFolderTab[]) => {
    setConfig(prev => ({ ...prev, clientFolder: tabs }));
  };

  return (
    <NavigationConfigContext.Provider 
      value={{ 
        config, 
        updateMainNav, 
        updateClientPortalNav, 
        updateTopbar, 
        updateClientFolder 
      }}
    >
      {children}
    </NavigationConfigContext.Provider>
  );
}

export function useNavigationConfig() {
  const context = useContext(NavigationConfigContext);
  if (!context) {
    throw new Error('useNavigationConfig must be used within NavigationConfigProvider');
  }
  return context;
}