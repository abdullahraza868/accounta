import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  LayoutDashboard,
  User,
  FileText,
  FileSignature,
  Receipt,
  Key,
  LogOut,
  HelpCircle,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { TenantSelectionDialog } from '../../pages/account/login/components/TenantSelectionDialog';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

interface ClientPortalLayoutProps {
  children: ReactNode;
}

export function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { branding } = useBranding();
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // Get current page from pathname
  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: User, label: 'Profile', page: 'profile' },
    { icon: FileText, label: 'Documents', page: 'documents' },
    { icon: FileSignature, label: 'Signatures', page: 'signatures' },
    { icon: Receipt, label: 'Invoices', page: 'invoices' },
    { icon: Key, label: 'Account Access', page: 'account-access' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/client-portal/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: branding.colors.pageBackground }}>
      {/* Left Sidebar */}
      <aside
        className="w-64 h-full backdrop-blur-xl rounded-2xl border shadow-xl shadow-gray-900/5 dark:shadow-black/20 flex flex-col overflow-hidden m-4"
        style={{
          background: branding.colors.sidebarBackground,
          borderColor: branding.colors.borderColor,
        }}
      >
        {/* Logo Section - Centered */}
        <div className="p-6 border-b" style={{ borderColor: branding.colors.borderColor }}>
          <div className="flex items-center justify-center">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="h-8 w-auto max-w-[160px] object-contain" />
            ) : branding.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="h-8 w-auto max-w-[160px] object-contain" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex-shrink-0"
                style={{ background: branding.colors.primaryButton }}
              />
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => navigate(`/client-portal/${item.page}`)}
                className="w-full flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 rounded-xl group hover:opacity-90"
                style={
                  isActive
                    ? {
                        background: branding.colors.sidebarActiveBackground,
                        color: branding.colors.sidebarActiveText,
                        boxShadow: `0 10px 15px -3px ${branding.colors.primaryButton}40`,
                      }
                    : {
                        color: branding.colors.sidebarText,
                      }
                }
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className="tracking-tight truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t flex-shrink-0" style={{ borderColor: branding.colors.borderColor }}>
          {/* Account Switcher */}
          <div className="p-4">
            <button
              onClick={() => setShowAccountSwitcher(true)}
              className="w-full p-3 rounded-xl transition-all hover:opacity-90 group"
              style={{
                background: branding.colors.cardBackground,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: branding.colors.borderColor,
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback
                    style={{
                      background: `${branding.colors.primaryButton}20`,
                      color: branding.colors.primaryButton,
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: branding.colors.headingText }}>
                    {user?.email || 'User Account'}
                  </div>
                  <div className="text-xs truncate" style={{ color: branding.colors.mutedText }}>
                    {branding.companyName}
                  </div>
                </div>
                <ChevronDown
                  className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-y-0.5"
                  style={{ color: branding.colors.mutedText }}
                />
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-4 space-y-2">
            <button
              onClick={() => window.open('https://help.acounta.com', '_blank')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:opacity-80 text-sm"
              style={{
                background: branding.colors.cardBackground,
                color: branding.colors.bodyText,
              }}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:opacity-80 text-sm"
              style={{
                background: branding.colors.cardBackground,
                color: branding.colors.bodyText,
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Powered by Acounta */}
          <div className="p-4 pt-0">
            <div className="text-center py-3 px-2 rounded-lg" style={{ background: branding.colors.cardBackground }}>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs" style={{ color: branding.colors.mutedText }}>
                  Powered by
                </span>
                <img 
                  src={accountaLogo} 
                  alt="Acounta" 
                  className="h-4 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>

      {/* Account Switcher Dialog */}
      <TenantSelectionDialog
        open={showAccountSwitcher}
        onOpenChange={setShowAccountSwitcher}
        onTenantSelected={(tenantId, tenancyName) => {
          setShowAccountSwitcher(false);
          // Handle account switch - for now just close
          // In production, this would switch the active account
        }}
      />
    </div>
  );
}