import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from './ui/utils';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationConfig } from '../contexts/NavigationConfigContext';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';
import { 
  Sun,
  Moon,
  LogOut,
  Settings,
  ChevronLeft
} from 'lucide-react';

type SidebarProps = {
  onCollapse?: () => void;
};

export function Sidebar({ onCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useBranding();
  const { logout } = useAuth();
  const { config } = useNavigationConfig();
  const [billingExpanded, setBillingExpanded] = useState(false);
  
  // Get visible menu items from context, filtered and sorted
  const menuItems = config.mainNav
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);
  
  // Get current page from pathname
  // Extract the first segment to match against menu items (e.g., '/billing/add-invoice' -> 'billing')
  const pathSegments = location.pathname.slice(1).split('/');
  const currentPage = pathSegments[0] || 'dashboard';

  // Special handling for billing-related routes that aren't under /billing
  const isBillingPage = currentPage === 'billing' || 
                        location.pathname === '/manage-invoice-templates' ||
                        location.pathname === '/invoices/add' ||
                        location.pathname === '/subscription-settings' ||
                        location.pathname.startsWith('/billing/recurring') ||
                        location.pathname.startsWith('/billing/templates') ||
                        location.pathname.startsWith('/projects/') && location.pathname.includes('/add-invoice');

  // Special handling for signatures-related routes
  const isSignaturesPage = currentPage === 'signatures' || 
                          currentPage === 'signature-templates';

  // Special handling for notification-toast-demo page
  const isToastDemoPage = location.pathname === '/notification-toast-demo';

  // Auto-expand billing submenu when on a billing page
  useEffect(() => {
    if (isBillingPage) {
      setBillingExpanded(true);
    } else {
      setBillingExpanded(false);
    }
  }, [isBillingPage]);
  
  return (
    <aside 
      className="h-full backdrop-blur-xl rounded-2xl border shadow-xl shadow-gray-900/5 dark:shadow-black/20 flex flex-col overflow-hidden"
      style={{ 
        background: 'var(--bgColorSideMenu, #ffffff)',
        borderColor: 'var(--stokeColor, #e5e7eb)'
      }}
    >
      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto min-h-0">
        {menuItems.map((item, index) => {
          const isActive = currentPage === item.id || 
                          (item.id === 'billing' && isBillingPage) || 
                          (item.id === 'signatures' && isSignaturesPage) ||
                          (item.id === 'notification-toast-demo' && isToastDemoPage);
          
          return (
            <div key={item.id}>
              {index === 0 ? (
                // First item with inline collapse button
                <div className="flex items-center gap-1 mb-1">
                  <button
                    onClick={() => {
                      if (item.url) {
                        if (item.openBehavior === 'new-window') {
                          window.open(item.url, '_blank');
                        } else {
                          navigate(`/custom-link?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.label)}`);
                        }
                      } else {
                        navigate(`/${item.id}`);
                      }
                    }}
                    className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl group hover:opacity-90"
                    style={
                      isActive
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
                    <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                    <span className="tracking-tight truncate">{item.label}</span>
                  </button>
                  {onCollapse && (
                    <button
                      onClick={onCollapse}
                      className="p-2.5 rounded-lg transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 flex-shrink-0"
                      style={{ color: 'var(--primaryColor, #7c3aed)' }}
                      title="Collapse sidebar"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : item.id === 'billing' ? (
                // Billing with submenu
                <>
                  <button
                    onClick={() => {
                      navigate('/billing');
                      setBillingExpanded(!billingExpanded);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 rounded-xl group hover:opacity-90"
                    style={
                      isBillingPage
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
                    <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200", isBillingPage && "scale-110")} />
                    <span className="tracking-tight truncate">{item.label}</span>
                  </button>
                  
                  {/* Billing Submenu - Dynamic from config */}
                  {billingExpanded && item.submenu && (
                    <div className="ml-4 mb-1 space-y-1">
                      {item.submenu
                        .filter(subItem => subItem.visible)
                        .sort((a, b) => a.order - b.order)
                        .map(subItem => {
                          // Map submenu IDs to routes
                          const subRouteMap: Record<string, string> = {
                            'reports': '/billing',
                            'invoices': '/billing/invoices',
                            'subscriptions': '/billing/subscriptions',
                            'payments': '/payments',
                            'subscription-settings': '/subscription-settings',
                          };
                          
                          const subRoute = subRouteMap[subItem.id] || `/${subItem.id}`;
                          const isSubActive = location.pathname === subRoute || 
                                             (subItem.id === 'invoices' && (location.pathname === '/billing/cards' || location.pathname === '/billing/table' || location.pathname === '/billing/split')) ||
                                             (subItem.id === 'subscriptions' && location.pathname === '/subscriptions') ||
                                             (subItem.id === 'subscription-settings' && location.pathname === '/subscription-settings');
                          
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => navigate(subRoute)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              style={
                                isSubActive
                                  ? { color: 'var(--primaryColor, #7c3aed)' }
                                  : { color: 'var(--primaryColorSideMenu, #6b7280)' }
                              }
                            >
                              <subItem.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="tracking-tight truncate">{subItem.label}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                // Other menu items
                <button
                  onClick={() => {
                    if (item.url) {
                      // Custom link handling
                      if (item.openBehavior === 'new-window') {
                        window.open(item.url, '_blank');
                      } else {
                        // Embedded - navigate to custom-link route with URL params
                        navigate(`/custom-link?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.label)}`);
                      }
                    } else {
                      // Regular navigation - map 'intake' to 'document-center' for backwards compatibility
                      const route = item.id === 'intake' ? 'document-center' : item.id;
                      navigate(`/${route}`);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 rounded-xl group hover:opacity-90"
                  style={
                    isActive
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
                  <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                  <span className="tracking-tight truncate">{item.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className="border-t border-gray-200/50 flex-shrink-0">
        {/* Quick Actions */}
        <div className="px-4 py-4 space-y-1">
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all font-medium rounded-xl"
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
            <span>Settings</span>
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
        
        {/* Theme Toggle */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-1">
            <button
              onClick={() => isDarkMode && toggleDarkMode()}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all font-medium",
                !isDarkMode ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => !isDarkMode && toggleDarkMode()}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all font-medium",
                isDarkMode ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Footer - Powered by Acounta */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-gray-400">Powered by</span>
            <img src={accountaLogo} alt="Acounta" className="h-4" />
          </div>
        </div>
      </div>
    </aside>
  );
}