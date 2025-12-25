import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { Badge } from '../../../components/ui/badge';
import { Receipt } from 'lucide-react';

export default function ClientPortalInvoices() {
  const { branding } = useBranding();

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6" style={{ color: branding.colors.primaryButton }} />
            <h1 style={{ color: branding.colors.headingText }}>Invoices</h1>
            <Badge
              className="text-xs"
              style={{
                background: `${branding.colors.primaryButton}15`,
                color: branding.colors.primaryButton,
                border: `1px solid ${branding.colors.primaryButton}30`,
              }}
            >
              Coming Soon
            </Badge>
          </div>
          <p className="mt-2" style={{ color: branding.colors.mutedText }}>
            View and pay your invoices
          </p>
        </div>

        {/* Split View will go here - will support both Invoices and Subscriptions */}
        <div className="text-center py-20" style={{ color: branding.colors.mutedText }}>
          Invoice split view coming soon... (will include Invoices & Subscriptions)
        </div>
      </div>
    </ClientPortalLayout>
  );
}
