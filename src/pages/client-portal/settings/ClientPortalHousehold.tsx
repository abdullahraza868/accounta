import { useState, useRef, useEffect } from 'react';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../../lib/fieldValidation';
import { Loader2, UserPlus, Mail, Users, ArrowDown } from 'lucide-react';

type SpouseStatus = 'none' | 'pending' | 'linked';
type HouseholdMode = 'unified' | 'separated' | 'divorced';

interface SpouseData {
  name?: string;
  email: string;
  mode?: HouseholdMode;
}

export default function ClientPortalHousehold() {
  const { branding } = useBranding();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [status, setStatus] = useState<SpouseStatus>('none');
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState<HouseholdMode>('unified');

  // Auto-focus email input when in 'none' status
  useEffect(() => {
    if (status === 'none' && emailInputRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
        emailInputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Mock data - in production, load this from API on mount
  // Uncomment these lines to test different states:
  // setStatus('pending'); setSpouse({ email: 'spouse@example.com' });
  // setStatus('linked'); setSpouse({ name: 'Jane Doe', email: 'spouse@example.com', mode: 'unified' });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSendInvite = async () => {
    // Validate email
    const validation = validateEmail(email, true);
    if (!validation.isValid) {
      setEmailError(validation.error || '');
      return;
    }
    setEmailError('');

    // Disable button + show spinner
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await apiService.sendHouseholdInvite({ email });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success → toast → update state
      toast.success(`Invite sent to ${email}`);
      setSpouse({ email });
      setStatus('pending');
      setEmail('');
    } catch (error) {
      // Error → toast
      toast.error('Failed to send invite. Please try again.');
    } finally {
      // Re-enable button
      setIsLoading(false);
    }
  };

  const handleResendInvite = async () => {
    if (!spouse) return;

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await apiService.resendHouseholdInvite({ email: spouse.email });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Invite resent.');
    } catch (error) {
      toast.error('Failed to resend invite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvite = async () => {
    if (!spouse) return;

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await apiService.cancelHouseholdInvite({ email: spouse.email });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Invite cancelled.');
      setSpouse(null);
      setStatus('none');
    } catch (error) {
      toast.error('Failed to cancel invite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeMode = async (mode: HouseholdMode) => {
    if (!spouse || spouse.mode === 'divorced') return;

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await apiService.updateHouseholdMode({ mode });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Mode updated.');
      setSpouse({ ...spouse, mode });
      setSelectedMode(mode);
    } catch (error) {
      toast.error('Failed to update mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    setShowUnlinkDialog(false);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await apiService.unlinkSpouse();

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Spouse unlinked.');
      setSpouse(null);
      setStatus('none');
    } catch (error) {
      toast.error('Failed to unlink spouse. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  const renderEmptyState = () => (
    <div className="space-y-6">
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          background: `${branding.colors.primaryButton}08`,
          borderColor: `${branding.colors.primaryButton}30`,
        }}
      >
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
          <div className="text-sm space-y-1.5" style={{ color: branding.colors.bodyText }}>
            <p>
              Link another account to share documents and view deliverables together.
            </p>
            <p className="text-xs" style={{ color: branding.colors.mutedText }}>
              <strong>Most common use:</strong> Connecting spouse/partner accounts for joint tax preparation
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="spouse-email" style={{ color: branding.colors.bodyText }}>
            Email Address to Link
          </Label>
          <ArrowDown 
            className="w-4 h-4 animate-bounce" 
            style={{ color: branding.colors.primaryButton }}
          />
        </div>
        <div className="relative">
          <div 
            className="absolute -inset-0.5 rounded-lg opacity-75 blur-sm animate-pulse"
            style={{
              background: branding.colors.primaryButton,
            }}
          />
          <Input
            ref={emailInputRef}
            id="spouse-email"
            type="email"
            placeholder="partner@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            className="relative border-2 focus:ring-4 transition-all duration-200"
            style={{
              background: branding.colors.inputBackground,
              borderColor: emailError ? branding.colors.errorColor : branding.colors.primaryButton,
              color: branding.colors.inputText,
            }}
            disabled={isLoading}
          />
        </div>
        {emailError && (
          <p className="text-sm" style={{ color: branding.colors.errorColor }}>
            {emailError}
          </p>
        )}
      </div>

      <Button
        onClick={handleSendInvite}
        disabled={isLoading || !email.trim()}
        style={{
          background: branding.colors.primaryButton,
          color: branding.colors.primaryButtonText,
        }}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Send Invite
          </>
        )}
      </Button>
    </div>
  );

  const renderPendingState = () => (
    <div
      className="rounded-lg border p-6 space-y-4"
      style={{
        background: branding.colors.cardBackground,
        borderColor: branding.colors.borderColor,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg" style={{ color: branding.colors.headingText }}>
            Pending Invite
          </h3>
          <div className="flex items-center gap-2 text-sm" style={{ color: branding.colors.bodyText }}>
            <Mail className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
            {spouse?.email}
          </div>
          <Badge
            variant="outline"
            style={{
              borderColor: branding.colors.warningColor,
              color: branding.colors.warningColor,
              background: `${branding.colors.warningColor}10`,
            }}
          >
            Waiting for acceptance
          </Badge>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleResendInvite}
          disabled={isLoading}
          variant="outline"
          style={{
            borderColor: branding.colors.inputBorder,
            color: branding.colors.bodyText,
          }}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Resend Invite
            </>
          )}
        </Button>
        <Button
          onClick={handleCancelInvite}
          disabled={isLoading}
          variant="outline"
          style={{
            borderColor: branding.colors.errorColor,
            color: branding.colors.errorColor,
          }}
        >
          Cancel Invite
        </Button>
      </div>
    </div>
  );

  const renderLinkedState = () => {
    const isDivorced = spouse?.mode === 'divorced';

    return (
      <div
        className="rounded-lg border p-6 space-y-6"
        style={{
          background: branding.colors.cardBackground,
          borderColor: branding.colors.borderColor,
        }}
      >
        {/* Spouse Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg" style={{ color: branding.colors.headingText }}>
              Linked Spouse
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2" style={{ color: branding.colors.bodyText }}>
                <Users className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
                <span>{spouse?.name || 'Spouse Name'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: branding.colors.mutedText }}>
                <Mail className="w-4 h-4" />
                {spouse?.email}
              </div>
            </div>
            <Badge
              variant="outline"
              style={{
                borderColor: branding.colors.successColor,
                color: branding.colors.successColor,
                background: `${branding.colors.successColor}10`,
              }}
            >
              Active
            </Badge>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <Label htmlFor="household-mode" style={{ color: branding.colors.bodyText }}>
            Household Mode
          </Label>
          {isDivorced ? (
            <Badge
              variant="outline"
              className="text-sm"
              style={{
                borderColor: branding.colors.mutedText,
                color: branding.colors.mutedText,
                background: `${branding.colors.mutedText}10`,
              }}
            >
              Divorced/Closed (Read-only, firm only)
            </Badge>
          ) : (
            <Select
              value={spouse?.mode || selectedMode}
              onValueChange={(value) => handleChangeMode(value as HouseholdMode)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="household-mode"
                style={{
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  color: branding.colors.inputText,
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unified">Unified</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Mode Legend */}
        <div
          className="rounded-lg border p-4 space-y-2"
          style={{
            background: `${branding.colors.primaryButton}05`,
            borderColor: branding.colors.borderColor,
          }}
        >
          <h4 className="text-sm" style={{ color: branding.colors.headingText }}>
            Sharing Mode Descriptions:
          </h4>
          <ul className="space-y-1 text-sm" style={{ color: branding.colors.bodyText }}>
            <li>
              <strong>Unified:</strong> Both accounts share docs & deliverables (typical for married couples).
            </li>
            <li>
              <strong>Separated:</strong> Uploads are private to uploader (for filing separately).
            </li>
            <li>
              <strong>Divorced/Closed:</strong> Read-only, firm only (connection terminated).
            </li>
          </ul>
        </div>

        {/* Actions */}
        {!isDivorced && (
          <div className="pt-2">
            <Button
              onClick={() => setShowUnlinkDialog(true)}
              disabled={isLoading}
              variant="outline"
              style={{
                borderColor: branding.colors.errorColor,
                color: branding.colors.errorColor,
              }}
            >
              Unlink Account
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ClientPortalLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Page Header */}
        <div>
          <h1 style={{ color: branding.colors.headingText }}>Household Linking</h1>
          <p className="mt-2" style={{ color: branding.colors.mutedText }}>
            Link accounts to share documents and collaborate (typically used for spouse/partner linking)
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-lg border p-6"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.borderColor,
          }}
        >
          <div className="mb-6">
            <h2 className="text-lg" style={{ color: branding.colors.headingText }}>
              Account Linking
            </h2>
            <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
              Most commonly used to connect spouse/partner accounts
            </p>
          </div>

          {/* Conditional Rendering Based on State */}
          {status === 'none' && renderEmptyState()}
          {status === 'pending' && renderPendingState()}
          {status === 'linked' && renderLinkedState()}
        </div>

        {/* Unlink Confirmation Dialog */}
        <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
          <AlertDialogContent
            style={{
              background: branding.colors.cardBackground,
              borderColor: branding.colors.borderColor,
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: branding.colors.headingText }}>
                Unlink Spouse?
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: branding.colors.bodyText }}>
                Are you sure you want to unlink your spouse? This will remove shared access to
                documents and deliverables. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                style={{
                  borderColor: branding.colors.inputBorder,
                  color: branding.colors.bodyText,
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlink}
                style={{
                  background: branding.colors.dangerButton,
                  color: branding.colors.dangerButtonText,
                }}
              >
                Unlink Spouse
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ClientPortalLayout>
  );
}
