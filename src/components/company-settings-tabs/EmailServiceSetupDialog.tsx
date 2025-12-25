import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Mail,
  ExternalLink,
  CheckCircle,
  Info,
  AlertCircle,
  Shield,
  RefreshCw,
  Zap,
  FileText,
  Globe,
} from 'lucide-react';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner@2.0.3';

type EmailProvider = 'microsoft' | 'google' | 'sendgrid' | 'aws-ses';

type EmailServiceSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    provider: EmailProvider;
    fromEmail: string;
    fromName: string;
    replyToEmail?: string;
    credentials?: any;
  }) => void;
  mode?: 'connect' | 'reconnect';
};

export function EmailServiceSetupDialog({
  open,
  onOpenChange,
  onComplete,
  mode = 'connect',
}: EmailServiceSetupDialogProps) {
  const [provider, setProvider] = useState<EmailProvider>('microsoft');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const providers = [
    {
      id: 'microsoft' as EmailProvider,
      name: 'Microsoft 365',
      description: 'Use your Microsoft 365 account (Outlook, Exchange)',
      icon: Mail,
      recommended: true,
      authType: 'OAuth',
    },
    {
      id: 'google' as EmailProvider,
      name: 'Google Workspace',
      description: 'Use your Google Workspace account (Gmail for Business)',
      icon: Mail,
      recommended: true,
      authType: 'OAuth',
    },
    {
      id: 'sendgrid' as EmailProvider,
      name: 'SendGrid',
      description: 'Dedicated email service with high deliverability',
      icon: Zap,
      recommended: false,
      authType: 'API Key',
    },
    {
      id: 'aws-ses' as EmailProvider,
      name: 'AWS SES',
      description: 'Amazon Simple Email Service',
      icon: Globe,
      recommended: false,
      authType: 'API Key',
    },
  ];

  const selectedProviderInfo = providers.find(p => p.id === provider);
  const requiresOAuth = selectedProviderInfo?.authType === 'OAuth';

  const handleConnect = async () => {
    if (!fromEmail || !fromName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      if (requiresOAuth) {
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Simulate API key validation
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setConnectionStatus('success');
      toast.success(`${selectedProviderInfo?.name} connected successfully!`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete({
        provider,
        fromEmail,
        fromName,
        replyToEmail: replyToEmail || undefined,
        credentials: {
          // Mock credentials
          accessToken: 'mock_token',
        },
      });
    } catch (error) {
      setConnectionStatus('error');
      toast.error(`Failed to connect to ${selectedProviderInfo?.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (connectionStatus === 'connecting') {
      const confirmed = window.confirm('Connection in progress. Are you sure you want to cancel?');
      if (!confirmed) return;
    }

    setConnectionStatus('idle');
    setFromEmail('');
    setFromName('');
    setReplyToEmail('');
    onOpenChange(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsSendingTest(true);

    try {
      // Simulate sending a test email
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTestResult({ success: true, message: 'Test email sent successfully!' });
      toast.success('Test email sent successfully!');
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to send test email' });
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="email-service-setup-description">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {mode === 'reconnect' ? 'Reconnect Email Service' : 'Connect Email Service'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400" id="email-service-setup-description">
            Send firm-branded emails and automated notifications from Acounta
          </DialogDescription>
        </DialogHeader>

        {connectionStatus === 'idle' && (
          <div className="space-y-6 py-4">
            {/* Provider Selection */}
            <div>
              <Label className="mb-3 block">Select Email Provider *</Label>
              <RadioGroup value={provider} onValueChange={(value) => setProvider(value as EmailProvider)}>
                <div className="space-y-3">
                  {providers.map((p) => {
                    const Icon = p.icon;
                    const isSelected = provider === p.id;

                    return (
                      <Card
                        key={p.id}
                        className={`p-4 border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setProvider(p.id)}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={p.id} id={p.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <Label htmlFor={p.id} className="font-semibold cursor-pointer">
                                {p.name}
                              </Label>
                              {p.recommended && (
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {p.authType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Email Configuration */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Email Configuration
              </h4>

              <div>
                <Label htmlFor="fromName">From Name *</Label>
                <Input
                  id="fromName"
                  placeholder="Your Firm Name"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This name will appear as the sender in client emails
                </p>
              </div>

              <div>
                <Label htmlFor="fromEmail">From Email Address *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="notifications@yourfirm.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {requiresOAuth
                    ? 'This must be an email address from your connected account'
                    : 'The email address that will send all notifications'}
                </p>
              </div>

              <div>
                <Label htmlFor="replyToEmail">Reply-To Email (Optional)</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  placeholder="support@yourfirm.com"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Where client replies should be sent (defaults to From Email if not specified)
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">What Gets Sent:</p>
                    <ul className="space-y-1">
                      <li>• Client portal invitations</li>
                      <li>• Task and deadline reminders</li>
                      <li>• Document upload notifications</li>
                      <li>• Appointment confirmations</li>
                      <li>• Custom automated workflows</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {requiresOAuth && (
                <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-purple-800 dark:text-purple-200">
                      <p className="font-semibold mb-1">OAuth Authentication:</p>
                      <p>
                        You'll be redirected to {selectedProviderInfo?.name} to sign in and authorize
                        Acounta to send emails on your behalf. We never see your password.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">Privacy & Compliance:</p>
                    <p>
                      All emails are sent from your domain, ensuring brand consistency and better
                      deliverability. Acounta does not collect PII or sensitive client data through
                      email communications.
                    </p>
                  </div>
                </div>
              </Card>

              {(provider === 'microsoft' || provider === 'google') && (
                <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-green-800 dark:text-green-200">
                      <p className="font-semibold mb-1">Domain Requirements:</p>
                      <p>
                        Make sure your domain is verified in {provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}
                        and the email address you enter has permission to send emails.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={!fromEmail || !fromName || isConnecting}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {requiresOAuth ? (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect with {selectedProviderInfo?.name}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connecting to {selectedProviderInfo?.name}...
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
              {requiresOAuth
                ? "Please complete the authorization in the popup window. Don't close this dialog."
                : 'Validating your configuration...'}
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
              Your email service is now configured and ready to send firm-branded notifications.
            </p>
            <div className="space-y-4">
              <Label htmlFor="testEmail">Send a Test Email</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
              {testResult && (
                <div
                  className={`mt-2 ${
                    testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
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
              We couldn't connect to {selectedProviderInfo?.name}. Please try again.
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