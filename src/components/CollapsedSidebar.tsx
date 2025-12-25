import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Folder, 
  CheckSquare, 
  DollarSign, 
  FileSignature, 
  Building2, 
  FolderTree,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Settings,
  LogOut,
  Sun,
  Moon,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from './ui/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

type CollapsedSidebarProps = {
  onExpand?: () => void;
};

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useBranding();
  const { logout } = useAuth();
  
  // Get current page from pathname
  const currentPage = location.pathname.slice(1) || 'dashboard';
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: Users, label: 'Clients', page: 'clients' },
    { icon: MessageSquare, label: 'Chat', page: 'chat' },
    { icon: FileText, label: 'Document Center', page: 'document-center' },
    { icon: Folder, label: 'Projects', page: 'projects' },
    { icon: CheckSquare, label: 'Tasks', page: 'tasks' },
    { icon: CreditCard, label: 'Billing', page: 'billing' },
    { icon: FileSignature, label: 'Signatures', page: 'signatures' },
    { icon: Building2, label: 'Representations', page: 'representations' },
    { icon: FolderTree, label: 'Organizer', page: 'organizer' },
    { icon: BarChart3, label: 'Firm Stats', page: 'firm-stats' },
  ];

  return (
    <aside 
      className="w-20 h-full backdrop-blur-xl rounded-2xl border shadow-xl shadow-gray-900/5 dark:shadow-black/20 flex flex-col overflow-hidden"
      style={{ 
        background: 'var(--bgColorSideMenu, #ffffff)',
        borderColor: 'var(--stokeColor, #e5e7eb)'
      }}
    >
      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto min-h-0">
        <TooltipProvider>
          {menuItems.map((item, index) => (
            <div key={item.label}>
              {index === 0 ? (
                // Dashboard with inline expand button
                <div className="flex flex-col items-center gap-1 mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigate(`/${item.page}`)}
                        className="w-full flex items-center justify-center p-3 transition-all duration-200 rounded-xl group"
                        style={
                          currentPage === item.page
                            ? {
                                background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))',
                                color: 'var(--selectedColorSideMenu, #ffffff)',
                                boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.4)',
                              }
                            : {
                                color: 'var(--primaryColorSideMenu, #374151)',
                              }
                        }
                      >
                        <item.icon className={cn("w-5 h-5 transition-transform duration-200", currentPage === item.page && "scale-110")} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                  {onExpand && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={onExpand}
                          className="p-2 rounded-xl transition-all duration-200 border-2"
                          style={{ 
                            borderColor: 'var(--primaryColor, #7c3aed)',
                            backgroundColor: 'rgba(var(--primaryColorBtnRgb, 124, 58, 237), 0.1)',
                            color: 'var(--primaryColor, #7c3aed)'
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Expand sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ) : (
                // Other menu items
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(`/${item.page}`)}
                      className="w-full flex items-center justify-center p-3 mb-2 transition-all duration-200 rounded-xl group"
                      style={
                        currentPage === item.page
                          ? {
                              background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))',
                              color: 'var(--selectedColorSideMenu, #ffffff)',
                              boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.4)',
                            }
                          : {
                              color: 'var(--primaryColorSideMenu, #374151)',
                            }
                      }
                    >
                      <item.icon className={cn("w-5 h-5 transition-transform duration-200", currentPage === item.page && "scale-110")} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </TooltipProvider>
      </nav>
      
      {/* Bottom Section */}
      <div className="border-t flex-shrink-0" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
        {/* User Account */}
        <div className="p-3 flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border hover:shadow-md transition-all flex items-center justify-center"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback 
                      className="text-white text-sm font-medium"
                      style={{ background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))' }}
                    >
                      MD
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Matthew Dua</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Firm Account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Quick Actions */}
        <div className="px-3 pb-3 space-y-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center justify-center p-3 transition-all rounded-xl"
                  style={
                    currentPage === 'settings'
                      ? {
                          background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))',
                          color: 'var(--selectedColorSideMenu, #ffffff)',
                          boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.4)',
                        }
                      : {
                          color: 'var(--primaryColorSideMenu, #374151)',
                        }
                  }
                >
                  <Settings className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl"
                  style={{ color: 'var(--primaryColorSideMenu, #374151)' }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Theme Toggle */}
        <div className="px-3 pb-3">
          <div className="flex flex-col gap-1 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => isDarkMode && toggleDarkMode()}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-lg transition-all",
                      !isDarkMode ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Light Mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !isDarkMode && toggleDarkMode()}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-lg transition-all",
                      isDarkMode ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dark Mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </aside>
  );
}