import { useState, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BrandingProvider } from './contexts/BrandingContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ClientVisibilityProvider } from './contexts/ClientVisibilityContext';
import { NavigationConfigProvider } from './contexts/NavigationConfigContext';
import { AppRoutes } from './routes/AppRoutes';
import { Sidebar } from './components/Sidebar';
import { CollapsedSidebar } from './components/CollapsedSidebar';
import { Header } from './components/Header';
import { BrandingColorReference } from './components/BrandingColorReference';
import { MockModeBanner } from './components/MockModeBanner';
import { CSSLoadingDiagnostic } from './components/CSSLoadingDiagnostic';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './components/ui/sheet';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';

// Import Axios configuration to set up interceptors
import './config/axios.config';
// Import startup info logger
import { logStartupInfo } from './lib/startupInfo';

export type AppView = 'admin' | 'client-portal';

export type Client = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Business';
  group: string;
  assignedTo: string;
  tags: string[];
  createdDate: string;
};

export type FolderTab = 
  | 'Snapshot' 
  | 'Demographics' 
  | 'Activity'
  | 'Communication' 
  | 'Invoices' 
  | 'Signatures'
  | 'Documents'
  | 'Notes'
  | 'Organizer' 
  | 'Teams';

// Main app content component
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mark as initialized immediately - CSS variables are applied in main.tsx before React renders
  useEffect(() => {
    console.log('🔄 App initializing...');
    const root = document.documentElement;
    const bgColor = getComputedStyle(root).getPropertyValue('--backgroundColor');
    
    if (bgColor && bgColor.trim() !== '') {
      console.log('✅ CSS variables confirmed loaded');
      console.log('✅ App initialized');
      setIsInitialized(true);
    } else {
      console.warn('⚠️ CSS variables not detected - forcing initialization anyway');
      // Force initialization immediately - CSS variables are set in main.tsx
      setIsInitialized(true);
    }
  }, []);

  // WATCHDOG & AUTO-REDIRECT: Prevent admin users from accessing client portal
  useEffect(() => {
    // Skip redirect on login pages and workflow pages to avoid redirect loops
    if (location.pathname === '/client-portal/login' || 
        location.pathname === '/client-portal/household/invitation') {
      return;
    }

    if (location.pathname.startsWith('/client-portal')) {
      // Check if we have admin user data but are on client portal
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Only redirect if user has grantedPermissions array (admin users)
          // AND has the Pages.Firm.Client permission
          // Client portal users won't have grantedPermissions array or will have role='client'
          const isAdminUser = user.grantedPermissions && 
                            Array.isArray(user.grantedPermissions) && 
                            user.grantedPermissions.includes('Pages.Firm.Client');
          const isClientUser = user.role === 'client';
          
          if (isAdminUser && !isClientUser) {
            // ADMIN USER DETECTED ON CLIENT PORTAL - IMMEDIATE REDIRECT
            
            // Determine best redirect target
            let redirectTo = '/clients';
            
            // Try to preserve the context - redirect to equivalent admin page
            if (location.pathname.includes('/signatures')) {
              redirectTo = '/signatures';
            } else if (location.pathname.includes('/documents')) {
              redirectTo = '/document-center';
            } else if (location.pathname.includes('/invoices')) {
              redirectTo = '/billing';
            } else if (location.pathname.includes('/dashboard')) {
              redirectTo = '/dashboard';
            }
            
            console.log('🔒 SECURITY: Admin user detected on client portal - redirecting to', redirectTo);
            
            // Use immediate navigation
            navigate(redirectTo, { replace: true });
          }
        } catch (e) {
          console.error('Error checking user permissions:', e);
        }
      }
    }
  }, [location.pathname, navigate]);

  // Show minimal loading state while initializing
  if (!isInitialized) {
    return (
      <div 
        className="h-screen w-screen flex items-center justify-center" 
        style={{ 
          background: 'var(--pageBgColorLogin, #f9fafb)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2" 
            style={{ borderColor: 'var(--primaryColor, #7c3aed)' }}
          ></div>
          <p style={{ color: 'var(--secondaryTextColor, #374151)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Only show layout for authenticated routes (not login/forgot-password/2fa/tenant-not-found)
  // Also exclude client portal routes (they have their own layout)
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/forgot-password' ||
                     location.pathname === '/account/validate-2fa-auth' ||
                     location.pathname === '/tenant-not-found';
  
  const isClientPortalRoute = location.pathname.startsWith('/client-portal');

  console.log('📍 Current location:', location.pathname);
  console.log('🔐 Is auth page:', isAuthPage);
  console.log('👤 Is client portal:', isClientPortalRoute);

  // Render minimal layout for auth pages and client portal (they handle their own layouts)
  if (isAuthPage || isClientPortalRoute) {
    console.log('✅ Rendering minimal layout (auth or client portal)');
    return (
      <>
        <MockModeBanner />
        <AppRoutes />
        <Toaster />
      </>
    );
  }

  console.log('✅ Rendering app layout');

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900">
      {/* Mock Mode Banner */}
      <MockModeBanner />
      
      {/* Header - Shows on all authenticated pages with fixed independent layout */}
      <Header />

      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="md:hidden fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full shadow-2xl border-2"
          style={{
            background: 'var(--bgColorSideMenu)',
            borderColor: 'var(--stokeColor)',
          }}
          onClick={() => setShowMobileSidebar(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Access navigation menu and settings</SheetDescription>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden p-4 lg:p-6">
        {/* Desktop Layout with Resizable Sidebar */}
        <ResizablePanelGroup direction="horizontal" className="hidden md:flex">
          {/* Sidebar Panel */}
          {!isSidebarCollapsed ? (
            <>
              <ResizablePanel defaultSize={11} minSize={10} maxSize={25}>
                <Sidebar onCollapse={() => setIsSidebarCollapsed(true)} />
              </ResizablePanel>
              <ResizableHandle withHandle className="mx-2 lg:mx-3 w-1 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
            </>
          ) : (
            <>
              <ResizablePanel defaultSize={5} minSize={5} maxSize={5}>
                <CollapsedSidebar onExpand={() => setIsSidebarCollapsed(false)} />
              </ResizablePanel>
              <ResizableHandle className="mx-2 lg:mx-3 w-0 pointer-events-none" />
            </>
          )}

          {/* Main Content Area */}
          <ResizablePanel defaultSize={isSidebarCollapsed ? 95 : 89}>
            <div className="h-full flex flex-col rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-y-auto">
              <AppRoutes />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Mobile Layout (no resizing) */}
        <div className="md:hidden flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-y-auto">
            <AppRoutes />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster />
      
      {/* Development Tools */}
      <BrandingColorReference />
      <CSSLoadingDiagnostic />
    </div>
  );
}

function App() {
  // Log startup information
  useEffect(() => {
    console.log('🚀 App component mounted');
    logStartupInfo();
    console.log('✅ App initialized successfully');
    console.log('📍 Current path:', window.location.pathname);
  }, []);

  console.log('🔄 App component rendering...');

  return (
    <BrowserRouter>
      <BrandingProvider>
        <AuthProvider>
          <AppSettingsProvider>
            <NotificationProvider>
              <ClientVisibilityProvider>
                <NavigationConfigProvider>
                  <DndProvider backend={HTML5Backend}>
                    <AppContent />
                  </DndProvider>
                </NavigationConfigProvider>
              </ClientVisibilityProvider>
            </NotificationProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default App;