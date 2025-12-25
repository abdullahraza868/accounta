import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Building2, AlertCircle } from 'lucide-react';
import { useBranding } from '../../../../contexts/BrandingContext';
import { toast } from 'sonner@2.0.3';
import axios from 'axios';
import { getApiBaseUrl } from '../../../../config/api.config';

type TenantSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTenantSelected: (tenantId: number, tenancyName: string) => void;
};

export enum AppTenantAvailabilityState {
  Available = 1,
  InActive = 2,
  NotFound = 3
}

type IsTenantAvailableOutput = {
  state: AppTenantAvailabilityState;
  tenantId: number | null;
};

export function TenantSelectionDialog({ open, onOpenChange, onTenantSelected }: TenantSelectionDialogProps) {
  const { branding } = useBranding();
  const [firmName, setFirmName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!firmName.trim()) {
      setError('Please enter a firm name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try to call the IsTenantAvailable API
      const response = await axios.post<IsTenantAvailableOutput>(
        `${getApiBaseUrl()}/api/services/app/Account/IsTenantAvailable`,
        {
          tenancyName: firmName.trim()
        },
        {
          timeout: 5000 // 5 second timeout
        }
      );

      const result = response.data;

      switch (result.state) {
        case AppTenantAvailabilityState.Available:
          if (result.tenantId !== null) {
            // Store tenant ID in localStorage
            localStorage.setItem('tenantId', result.tenantId.toString());
            
            // Update the cookie (simulating abp.multiTenancy.setTenantIdCookie)
            document.cookie = `Abp.TenantId=${result.tenantId}; path=/`;
            
            toast.success(`Switched to ${firmName}`);
            onTenantSelected(result.tenantId, firmName.trim());
            onOpenChange(false);
            setFirmName('');
            
            // Check if we need to redirect to subdomain
            if (window.location.hostname !== 'localhost' && !(window.location.href.indexOf('192') >= 0)) {
              const currentHost = window.location.hostname;
              const firstDotIndex = currentHost.indexOf('.');
              if (firstDotIndex > 0) {
                const baseDomain = currentHost.substring(firstDotIndex);
                const newUrl = `${window.location.protocol}//${firmName.trim()}${baseDomain}${window.location.pathname}`;
                window.location.href = newUrl;
              }
            }
          } else {
            setError('Tenant ID not provided by server');
          }
          break;

        case AppTenantAvailabilityState.InActive:
          setError(`The tenant "${firmName}" is not active`);
          toast.error(`Tenant "${firmName}" is not active`);
          break;

        case AppTenantAvailabilityState.NotFound:
          setError(`There is no tenant defined with name "${firmName}"`);
          toast.error(`There is no tenant defined with name "${firmName}"`);
          break;

        default:
          setError('Unknown response from server');
          break;
      }
    } catch (err: any) {
      // API not available - use mock mode
      console.log(`ℹ️ Using mock tenant: ${firmName.trim()}`);
      
      // Mock mode - accept any tenant name when API is not available
      const mockTenantId = Math.floor(Math.random() * 100) + 1;
      
      // Store tenant ID in localStorage
      localStorage.setItem('tenantId', mockTenantId.toString());
      
      // Update the cookie
      document.cookie = `Abp.TenantId=${mockTenantId}; path=/`;
      
      toast.success(`Switched to ${firmName.trim()} (Mock Mode)`);
      onTenantSelected(mockTenantId, firmName.trim());
      onOpenChange(false);
      setFirmName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFirmName('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="tenant-selection-description-login-page">
        <DialogHeader>
          <DialogTitle style={{ color: branding.colors.headingText }}>
            Change Tenant
          </DialogTitle>
          <DialogDescription id="tenant-selection-description-login-page" style={{ color: branding.colors.mutedText }}>
            Enter the firm name to switch to a different tenant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firmName" style={{ color: branding.colors.bodyText }}>
              Firm Name
            </Label>
            <div className="relative">
              <Building2 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: branding.colors.mutedText }}
              />
              <Input
                id="firmName"
                value={firmName}
                onChange={(e) => {
                  setFirmName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSave();
                  }
                }}
                placeholder="Enter firm name"
                className="pl-10"
                style={{
                  background: branding.colors.inputBackground,
                  borderColor: error ? '#ef4444' : branding.colors.inputBorder,
                  color: branding.colors.inputText,
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !firmName.trim()}
            style={{
              background: branding.colors.primaryButton,
              color: branding.colors.primaryButtonText,
            }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Checking...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}