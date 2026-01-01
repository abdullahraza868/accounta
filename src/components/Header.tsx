import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Users, Plus, User, Building2, Mail, Calendar, Bell, HelpCircle, 
  ChevronDown, X, Phone, Settings, LogOut, Key, CreditCard, CheckCircle2, 
  AlertTriangle, MessageSquare 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationConfig } from '../contexts/NavigationConfigContext';
// import accountaLogo from '../images/acounta-logo.svg'; // Logo file not available
import { apiService } from '../services/ApiService';
import type { Client } from '../types/client';
import { CallbackMessageDialog } from './dialogs/CallbackMessageDialog';
import { IntegrationStatusMonitor, type IntegrationIssue } from './IntegrationStatusMonitor';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type HeaderProps = {
  clients?: Client[];
  onToggleSidebar?: () => void;
};

export function Header({ clients: propClients, onToggleSidebar }: HeaderProps) {
  const { isDarkMode, toggleDarkMode, logo, companyName } = useBranding();
  const { user, logout } = useAuth();
  const { config } = useNavigationConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>(propClients || []);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'All' | 'Individual' | 'Business'>('All');
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);
  const [integrationStatusOpen, setIntegrationStatusOpen] = useState(false);

  // Mock integration issues - would come from API
  // Commented out during development to keep the integration issues box hidden
  const [integrationIssues, setIntegrationIssues] = useState<IntegrationIssue[]>([
    // {
    //   id: 'qb-disconnect',
    //   integrationName: 'QuickBooks',
    //   severity: 'error',
    //   message: 'Connection expired',
    //   detailedMessage: 'QuickBooks connection has expired. Reconnect to continue syncing client data and financial information.',
    //   actionLabel: 'Reconnect Now',
    //   actionUrl: '/settings/company/connected',
    //   timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    //   affectedUsers: 12,
    //   canDismiss: true,
    // },
  ]);

  // Get topbar items from config
  const topbarItems = config.topbar;
  const clientsItem = topbarItems.find(item => item.id === 'clients');
  const addTaskItem = topbarItems.find(item => item.id === 'add-task');
  const messageItem = topbarItems.find(item => item.id === 'message');

  // Mock clients for demo purposes
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      type: 'Individual',
      group: 'Personal',
      assignedTo: 'Matthew Dua',
      tags: ['VIP', 'Tax'],
      createdDate: '2024-01-15',
      services: ['Tax', 'Bookkeeping']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0102',
      type: 'Individual',
      group: 'Personal',
      assignedTo: 'Matthew Dua',
      tags: ['Tax'],
      createdDate: '2024-01-20',
      services: ['Tax']
    },
    {
      id: '3',
      name: 'Tech Solutions LLC',
      firstName: 'Tech',
      lastName: 'Solutions',
      email: 'info@techsolutions.com',
      phone: '555-0103',
      type: 'Business',
      group: 'Corporate',
      assignedTo: 'Matthew Dua',
      tags: ['Business', 'Quarterly'],
      createdDate: '2024-02-01',
      services: ['Tax', 'Bookkeeping', 'Payroll']
    },
    {
      id: '4',
      name: 'Maria Garcia',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@example.com',
      phone: '555-0104',
      type: 'Individual',
      group: 'Personal',
      assignedTo: 'Matthew Dua',
      tags: ['Tax', 'Audit'],
      createdDate: '2024-02-15',
      services: ['Tax', 'Advisory']
    },
    {
      id: '5',
      name: 'Global Enterprises Inc',
      firstName: 'Global',
      lastName: 'Enterprises',
      email: 'contact@globalent.com',
      phone: '555-0105',
      type: 'Business',
      group: 'Corporate',
      assignedTo: 'Matthew Dua',
      tags: ['Business', 'Annual'],
      createdDate: '2024-03-01',
      services: ['Tax', 'Bookkeeping', 'Advisory', 'Payroll']
    }
  ];

  // Load clients from API on mount
  useEffect(() => {
    if (!propClients || propClients.length === 0) {
      loadClients();
    }
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const response = await apiService.getClients();
      if (response && response.items && response.items.length > 0) {
        setClients(response.items);
      } else {
        // Use mock clients if API returns empty
        setClients(mockClients);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      // Fallback to mock clients on error
      setClients(mockClients);
    } finally {
      setLoadingClients(false);
    }
  };

  // Calculate counts
  const allCount = clients.length;
  const individualCount = clients.filter(c => c.type === 'Individual').length;
  const businessCount = clients.filter(c => c.type === 'Business').length;

  // Filter clients based on search and type
  const filteredClients = useMemo(() => {
    let filtered = clients;
    
    // Filter by type
    if (clientTypeFilter !== 'All') {
      filtered = filtered.filter(client => client.type === clientTypeFilter);
    }
    
    // Filter by search query
    if (clientSearchQuery.trim()) {
      const query = clientSearchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.type.toLowerCase().includes(query)
      );
    }
    
    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, clientSearchQuery, clientTypeFilter]);

  // Group clients by first letter
  const clientsByLetter = useMemo(() => {
    const grouped: Record<string, Client[]> = {};
    filteredClients.forEach(client => {
      const firstLetter = client.name[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(client);
    });
    return grouped;
  }, [filteredClients]);

  // Get available letters (sorted)
  const availableLetters = useMemo(() => {
    return Object.keys(clientsByLetter).sort();
  }, [clientsByLetter]);

  // Scroll to letter section
  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`client-letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Desktop Header - Independent fixed layout */}
      <header 
        className="hidden md:block h-14 md:h-16 backdrop-blur-xl border-b shadow-sm flex-shrink-0"
        style={{
          background: 'var(--bgColorTopBar, #ffffff)',
          borderColor: 'var(--stokeColor, #e5e7eb)',
        }}
      >
        <div className="h-full w-full flex items-center">
          {/* Logo - Fixed width column (never changes) */}
          <div 
            className="flex items-center justify-center flex-shrink-0"
            style={{ 
              width: '240px',
              minWidth: '240px',
            }}
          >
            <img 
              src={logo || '/placeholder-logo.png'} 
              alt={companyName} 
              className="h-8 md:h-10 w-auto max-w-[200px] object-contain" 
            />
          </div>
          
          {/* Quick Access Items - Fixed position, left side */}
          <div className="hidden lg:flex items-center gap-2 px-4 flex-shrink-0">
            {/* Clients Dropdown - Only show if visible */}
            {clientsItem?.visible && (
              <DropdownMenu onOpenChange={(open) => {
                if (!open) {
                  setClientSearchQuery('');
                  setClientTypeFilter('All');
                }
              }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl border-gray-200/60 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm">
                    <Users className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                    <span className="font-medium" style={{ color: 'var(--primaryColorTopBar)' }}>{clientsItem.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[420px] p-0">
                  {/* Search and Filters */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    
                    {/* Type Filters */}
                    <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
                      <button
                        onClick={() => setClientTypeFilter('All')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex-1 justify-center ${
                          clientTypeFilter === 'All' 
                            ? 'bg-white dark:bg-gray-700 shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>All</span>
                        <span className="font-semibold ml-0.5">{allCount}</span>
                      </button>
                      <button
                        onClick={() => setClientTypeFilter('Individual')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex-1 justify-center ${
                          clientTypeFilter === 'Individual'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Individual</span>
                        <span className="font-semibold ml-0.5">{individualCount}</span>
                      </button>
                      <button
                        onClick={() => setClientTypeFilter('Business')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex-1 justify-center ${
                          clientTypeFilter === 'Business'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Business</span>
                        <span className="font-semibold ml-0.5">{businessCount}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {/* Clients List */}
                    <div className="flex-1 max-h-96 overflow-y-auto" id="clients-scroll-container">
                      {filteredClients.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          <p className="mb-3">{clientSearchQuery || clientTypeFilter !== 'All' ? 'No clients match your filters' : 'No clients found'}</p>
                          {(clientSearchQuery || clientTypeFilter !== 'All') && (
                            <Button
                              variant="default"
                              onClick={() => {
                                setClientSearchQuery('');
                                setClientTypeFilter('All');
                              }}
                              className="gap-2"
                              style={{ backgroundColor: 'var(--primaryColor)' }}
                            >
                              <X className="w-4 h-4" />
                              Clear search & filters
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
                          </div>
                          {availableLetters.map(letter => (
                            <div key={letter} id={`client-letter-${letter}`}>
                              <div className="sticky top-0 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                                {letter}
                              </div>
                              {clientsByLetter[letter].map((client) => (
                                <DropdownMenuItem 
                                  key={client.id}
                                  onClick={() => {
                                    navigate(`/clients?clientId=${client.id}`);
                                  }}
                                  className="cursor-pointer px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    {client.type === 'Business' ? (
                                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm truncate font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.email}</div>
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* Alphabetical Directory */}
                    {availableLetters.length > 0 && (
                      <div className="w-8 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center py-2 gap-0.5">
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                          <button
                            key={letter}
                            onClick={() => scrollToLetter(letter)}
                            disabled={!availableLetters.includes(letter)}
                            className={`text-[10px] font-medium w-5 h-5 rounded flex items-center justify-center transition-all ${
                              availableLetters.includes(letter)
                                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer'
                                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                            }`}
                            title={availableLetters.includes(letter) ? `Jump to ${letter}` : `No clients starting with ${letter}`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Add Task - Only show if visible */}
            {addTaskItem?.visible && (
              <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl border-gray-200/60 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span className="font-medium" style={{ color: 'var(--primaryColorTopBar)' }}>{addTaskItem.label}</span>
              </Button>
            )}
            
            {/* Message - Only show if visible */}
            {messageItem?.visible && (
              <Button 
                variant="outline" 
                className="gap-2 h-10 px-4 rounded-xl border-gray-200/60 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
                onClick={() => setShowCallbackDialog(true)}
              >
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                <span className="font-medium" style={{ color: 'var(--primaryColorTopBar)' }}>{messageItem.label}</span>
              </Button>
            )}
          </div>
          
          {/* Spacer to push right icons to the right */}
          <div className="flex-1"></div>
          
          {/* Action Icons - Right side */}
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4">
            {/* My Profile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => navigate('/my-account')}
                  className={`hidden sm:flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                    location.pathname === '/my-account'
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                      : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                  }`}
                >
                  <User className="w-4 md:w-5 h-4 md:h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>My Account</TooltipContent>
            </Tooltip>
            
            {/* Email */}
            {topbarItems.find(item => item.id === 'email')?.visible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/email')}
                    className={`relative hidden sm:flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                      location.pathname === '/email'
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                        : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <Mail className="w-4 md:w-5 h-4 md:h-5" />
                    {/* Unread Badge */}
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-semibold rounded-full px-1">
                      12
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Email</TooltipContent>
              </Tooltip>
            )}
            
            {/* Text Messages */}
            {topbarItems.find(item => item.id === 'text-messages')?.visible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/text-messages')}
                    className={`relative hidden sm:flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                      location.pathname === '/text-messages'
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                        : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <MessageSquare className="w-4 md:w-5 h-4 md:h-5" />
                    {/* Unread Badge */}
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-semibold rounded-full px-1">
                      3
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Text Messages</TooltipContent>
              </Tooltip>
            )}
            
            {/* Calendar */}
            {topbarItems.find(item => item.id === 'calendar')?.visible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/calendar')}
                    className={`hidden sm:flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                      location.pathname === '/calendar'
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                        : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <Calendar className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Calendar</TooltipContent>
              </Tooltip>
            )}
            
            {/* Notifications Dropdown */}
            {topbarItems.find(item => item.id === 'notifications')?.visible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/notifications/management')}
                    className={`relative flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                      location.pathname.startsWith('/notifications')
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                        : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <Bell className="w-4 md:w-5 h-4 md:h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            )}
            
            {/* Help */}
            {topbarItems.find(item => item.id === 'help')?.visible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/help')}
                    className={`hidden sm:flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl border transition-all duration-200 shadow-sm ${
                      location.pathname === '/help'
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 shadow-lg'
                        : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg'
                    }`}
                  >
                    <HelpCircle className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Help & Support</TooltipContent>
              </Tooltip>
            )}
            
            {/* Integration Status Badge */}
            {integrationIssues.length > 0 && (
              <Popover open={integrationStatusOpen} onOpenChange={setIntegrationStatusOpen}>
                <PopoverTrigger asChild>
                  <button 
                    className={`relative flex w-9 md:w-11 h-9 md:h-11 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br border transition-all duration-200 hover:shadow-lg shadow-sm ${
                      integrationIssues.some(i => i.severity === 'critical')
                        ? 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 animate-pulse'
                        : integrationIssues.some(i => i.severity === 'error')
                        ? 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400'
                        : 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                    }`}
                    title="Integration Issues"
                  >
                    <AlertTriangle className="w-4 md:w-5 h-4 md:h-5" />
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                      integrationIssues.some(i => i.severity === 'critical')
                        ? 'bg-red-500'
                        : integrationIssues.some(i => i.severity === 'error')
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}>
                      {integrationIssues.length}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0" align="end">
                  <IntegrationStatusMonitor
                    issues={integrationIssues}
                    onDismiss={(issueId) => {
                      setIntegrationIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
                    }}
                    onReconnect={(integrationId) => {
                      // Navigate to connected accounts page
                      navigate('/settings/company/connected');
                      setIntegrationStatusOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
            
            {/* Account Name with Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 md:ml-3 pl-2 md:pl-3 border-l border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors">
                  <Avatar 
                    className="w-8 md:w-10 h-8 md:h-10 ring-2 ring-offset-1 md:ring-offset-2"
                    style={{ 
                      ringColor: 'rgba(var(--primaryColorBtnRgb), 0.2)',
                      borderColor: 'var(--profilePicBorderColor)'
                    }}
                  >
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sumit" />
                    <AvatarFallback 
                      className="text-white font-medium text-xs md:text-sm"
                      style={{ background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))' }}
                    >
                      {user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{companyName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Switch Account</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden xl:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info Header */}
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name || 'User'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{user?.emailAddress || ''}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* My Account */}
                <DropdownMenuItem onClick={() => navigate('/my-account')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  My Account
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Account Switcher Section */}
                <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  Switch Account
                </DropdownMenuLabel>
                
                {/* Current Account */}
                <DropdownMenuItem className="cursor-pointer bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--selectedBgColorSideMenu)' }}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{companyName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Current Account</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </DropdownMenuItem>
                
                {/* Other Accounts */}
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Demo Accounting Firm</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Premium Plan</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">ABC Tax Services</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Business Plan</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="cursor-pointer text-purple-600 dark:text-purple-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Account
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="cursor-pointer text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header 
        className="md:hidden h-14 backdrop-blur-xl border-b shadow-sm flex-shrink-0 flex items-center px-2 gap-2"
        style={{
          background: 'var(--bgColorTopBar, #ffffff)',
          borderColor: 'var(--stokeColor, #e5e7eb)',
        }}
      >
        {/* Mobile Logo */}
        <img 
          src={logo || '/placeholder-logo.png'} 
          alt={companyName} 
          className="h-8 w-auto max-w-[140px] object-contain" 
        />
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Mobile Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:shadow-lg shadow-sm">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="cursor-pointer py-3">
                  <div className="flex gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">New client message</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sarah Johnson sent you a message</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <Avatar className="w-9 h-9 ring-2 ring-offset-1" style={{ ringColor: 'rgba(var(--primaryColorBtnRgb), 0.2)' }}>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sumit" />
                  <AvatarFallback className="text-white text-xs" style={{ background: 'var(--selectedBgColorSideMenu)' }}>
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{user?.emailAddress || ''}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/my-account')} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Callback Message Dialog */}
      <CallbackMessageDialog
        open={showCallbackDialog}
        onOpenChange={setShowCallbackDialog}
        onNavigateToEmailTemplates={() => {
          navigate('/settings');
          // Optional: You could add a query parameter or state to auto-scroll to email templates
          // navigate('/settings?section=email-customization');
        }}
      />

      {/* Integration Status Monitor */}
      <IntegrationStatusMonitor
        open={integrationStatusOpen}
        onOpenChange={setIntegrationStatusOpen}
        issues={integrationIssues}
        onIssueDismiss={(issueId) => {
          setIntegrationIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
        }}
      />
    </>
  );
}