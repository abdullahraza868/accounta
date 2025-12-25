import { useState } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Diagnostic Panel - Temporary component for debugging
 * 
 * To use: Import and add to App.tsx:
 * import { DiagnosticPanel } from './components/DiagnosticPanel';
 * 
 * Then add <DiagnosticPanel /> before </BrowserRouter>
 */
export function DiagnosticPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { branding, isDarkMode } = useBranding();
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state - just a button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-lg shadow-xl text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
        >
          🔍 Diagnostics
        </button>
      )}

      {/* Expanded state - full panel */}
      {isOpen && (
        <div 
          className="w-96 max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl border-2"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.cardBorder,
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: branding.colors.cardBorder }}
          >
            <h3 className="flex items-center gap-2" style={{ color: branding.colors.headingText }}>
              🔍 <span>Diagnostic Panel</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Close"
              >
                <X className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 text-sm">
            {/* Route Information */}
            <Section title="Route Information" branding={branding}>
              <InfoRow label="Current Path" value={location.pathname} />
              <InfoRow label="Search Params" value={location.search || '(none)'} />
              <InfoRow label="Hash" value={location.hash || '(none)'} />
            </Section>

            {/* Authentication Status */}
            <Section title="Authentication" branding={branding}>
              <InfoRow label="Authenticated" value={isAuthenticated ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Loading" value={isLoading ? '⏳ Yes' : '✅ No'} />
              <InfoRow label="User" value={user ? `${user.name} ${user.surname}` : '(none)'} />
              <InfoRow label="Email" value={user?.emailAddress || '(none)'} />
              <InfoRow label="Tenant ID" value={user?.tenantId?.toString() || '(none)'} />
            </Section>

            {/* Branding Status */}
            <Section title="Branding" branding={branding}>
              <InfoRow label="Company Name" value={branding.companyName} />
              <InfoRow label="Dark Mode" value={isDarkMode ? '🌙 Yes' : '☀️ No'} />
              <InfoRow label="Primary Color" value={
                <span className="flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded border" 
                    style={{ background: branding.colors.primaryBrand, borderColor: branding.colors.cardBorder }}
                  />
                  {branding.colors.primaryBrand}
                </span>
              } />
              <InfoRow label="Secondary Color" value={
                <span className="flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded border" 
                    style={{ background: branding.colors.secondaryBrand, borderColor: branding.colors.cardBorder }}
                  />
                  {branding.colors.secondaryBrand}
                </span>
              } />
            </Section>

            {/* CSS Variables */}
            <Section title="CSS Variables (Sample)" branding={branding}>
              <InfoRow 
                label="--primaryColor" 
                value={getComputedStyle(document.documentElement).getPropertyValue('--primaryColor') || '(not set)'} 
              />
              <InfoRow 
                label="--backgroundColor" 
                value={getComputedStyle(document.documentElement).getPropertyValue('--backgroundColor') || '(not set)'} 
              />
              <InfoRow 
                label="--primaryColorBtn" 
                value={getComputedStyle(document.documentElement).getPropertyValue('--primaryColorBtn') || '(not set)'} 
              />
            </Section>

            {/* localStorage Info */}
            <Section title="LocalStorage" branding={branding}>
              <InfoRow label="Access Token" value={localStorage.getItem('accessToken') ? '✅ Set' : '❌ Not set'} />
              <InfoRow label="Tenant ID" value={localStorage.getItem('tenantId') || '(none)'} />
              <InfoRow label="Tenant Name" value={localStorage.getItem('tenantName') || '(none)'} />
              <InfoRow label="Dark Mode" value={localStorage.getItem('darkMode') || '(none)'} />
            </Section>

            {/* System Info */}
            <Section title="System" branding={branding}>
              <InfoRow label="Window Width" value={`${window.innerWidth}px`} />
              <InfoRow label="Window Height" value={`${window.innerHeight}px`} />
              <InfoRow label="Device Pixel Ratio" value={window.devicePixelRatio.toString()} />
              <InfoRow label="User Agent" value={navigator.userAgent.substring(0, 50) + '...'} />
            </Section>

            {/* Actions */}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: branding.colors.cardBorder }}>
              <button
                onClick={() => {
                  console.clear();
                  console.log('=== DIAGNOSTIC DUMP ===');
                  console.log('Route:', location);
                  console.log('Auth:', { isAuthenticated, user, isLoading });
                  console.log('Branding:', branding);
                  console.log('CSS Variables:', {
                    primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primaryColor'),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--backgroundColor'),
                    primaryColorBtn: getComputedStyle(document.documentElement).getPropertyValue('--primaryColorBtn'),
                  });
                  console.log('localStorage:', {
                    accessToken: localStorage.getItem('accessToken') ? 'SET' : 'NOT SET',
                    tenantId: localStorage.getItem('tenantId'),
                    tenantName: localStorage.getItem('tenantName'),
                  });
                  alert('✅ Diagnostic info dumped to console');
                }}
                className="w-full px-3 py-2 rounded text-white"
                style={{ background: branding.colors.primaryButton }}
              >
                📋 Dump to Console
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all localStorage data?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full px-3 py-2 rounded text-white bg-red-600 hover:bg-red-700"
              >
                🗑️ Clear LocalStorage & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, branding }: { title: string; children: React.ReactNode; branding: any }) {
  return (
    <div className="space-y-2">
      <h4 style={{ color: branding.colors.headingText }}>{title}</h4>
      <div className="space-y-1 pl-2 border-l-2" style={{ borderColor: branding.colors.cardBorder }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="opacity-70">{label}:</span>
      <span className="font-mono text-right break-all max-w-[60%]">{value}</span>
    </div>
  );
}
