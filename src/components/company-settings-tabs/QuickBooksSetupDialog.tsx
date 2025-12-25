import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  FileText,
  ExternalLink,
  CheckCircle,
  Info,
  AlertCircle,
  Zap,
  Shield,
  RefreshCw,
  Database,
  Users,
  DollarSign,
} from 'lucide-react';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';

type QuickBooksSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    companyId: string;
    realmId: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  mode?: 'connect' | 'reconnect';
};

export function QuickBooksSetupDialog({
  open,
  onOpenChange,
  onComplete,
  mode = 'connect',
}: QuickBooksSetupDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // In production, this would open QuickBooks OAuth popup
      // For now, simulate the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful OAuth
      const mockData = {
        companyId: 'qb_' + Math.random().toString(36).substring(7),
        realmId: Math.random().toString(36).substring(7),
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };

      setConnectionStatus('success');
      toast.success('QuickBooks connected successfully!');

      // Wait a moment to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete(mockData);
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Failed to connect to QuickBooks');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestSync = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate testing the sync
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful test with sample data
      const mockTestData = {
        customersFound: 127,
        invoicesFound: 342,
        lastSync: new Date().toISOString(),
      };

      setTestResult({
        success: true,
        message: 'Sync test successful! QuickBooks data is accessible.',
        data: mockTestData,
      });
      toast.success('Sync test completed successfully!');
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to sync with QuickBooks. Please check your connection.',
      });
      toast.error('Sync test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    if (connectionStatus === 'connecting') {
      const confirmed = window.confirm(
        'Connection in progress. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }

    setConnectionStatus('idle');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" aria-describedby="quickbooks-setup-description">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {mode === 'reconnect' ? 'Reconnect QuickBooks' : 'Connect QuickBooks'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400" id="quickbooks-setup-description">
            {mode === 'reconnect'
              ? 'Your QuickBooks connection has expired. Reconnect to restore data syncing.'
              : 'Sync client data and financial information with QuickBooks Online'}
          </DialogDescription>
        </DialogHeader>

        {connectionStatus === 'idle' && (
          <div className="space-y-4 py-4">
            {mode === 'reconnect' && (
              <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Connection Expired
                    </p>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      QuickBooks connections expire every 100 days for security. Click "Reconnect" below
                      to restore access - your previous settings will be preserved.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                What Gets Synced
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Client Data
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Customer names, contact info, and company details
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Invoices & Payments
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Billing history and payment records
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Financial Reports
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        P&L statements and balance sheets
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Time Tracking
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Billable hours and project time
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">How It Works:</p>
                  <ul className="space-y-1">
                    <li>1. You'll be redirected to QuickBooks to sign in</li>
                    <li>2. Select which company to connect</li>
                    <li>3. Authorize Acounta to access your data</li>
                    <li>4. You'll be redirected back automatically</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Security & Privacy:</p>
                  <p>
                    Acounta uses OAuth 2.0 for secure authentication. We never see your QuickBooks
                    password, and you can revoke access at any time from your QuickBooks settings.
                    Data is encrypted in transit and at rest.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {mode === 'reconnect' ? 'Reconnect to QuickBooks' : 'Connect to QuickBooks'}
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connecting to QuickBooks...
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
              Please complete the authorization in the QuickBooks window. Don't close this dialog.
            </p>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Successfully Connected!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
              Your QuickBooks account is now connected and syncing.
            </p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connection Failed
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
              We couldn't connect to QuickBooks. Please try again.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setConnectionStatus('idle');
                  handleConnect();
                }}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}