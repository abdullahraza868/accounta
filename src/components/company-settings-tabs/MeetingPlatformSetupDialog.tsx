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
  Video,
  ExternalLink,
  CheckCircle,
  Info,
  AlertCircle,
  Shield,
  RefreshCw,
  Calendar,
  Users,
  Clock,
  Link2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';

type MeetingPlatform = 'zoom' | 'google-meet' | 'teams';
type ConnectionLevel = 'firm' | 'personal';

type MeetingPlatformSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: MeetingPlatform;
  level: ConnectionLevel;
  onComplete: (data: {
    platform: MeetingPlatform;
    level: ConnectionLevel;
    accountEmail: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  mode?: 'connect' | 'reconnect';
};

const platformConfig = {
  'zoom': {
    name: 'Zoom',
    description: 'Video conferencing platform',
    icon: Video,
    color: 'blue',
    features: ['HD video meetings', 'Screen sharing', 'Recording', 'Breakout rooms'],
  },
  'google-meet': {
    name: 'Google Meet',
    description: 'Google Workspace meetings',
    icon: Calendar,
    color: 'green',
    features: ['Integrated with Google Calendar', 'Live captions', 'Screen sharing', 'Up to 100 participants'],
  },
  'teams': {
    name: 'Microsoft Teams',
    description: 'Microsoft 365 meetings',
    icon: Users,
    color: 'purple',
    features: ['Integrated with Outlook', 'Chat & collaboration', 'Screen sharing', 'Meeting recordings'],
  },
};

export function MeetingPlatformSetupDialog({
  open,
  onOpenChange,
  platform,
  level,
  onComplete,
  mode = 'connect',
}: MeetingPlatformSetupDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [testMeetingLink, setTestMeetingLink] = useState<string | null>(null);

  const config = platformConfig[platform];
  
  // Add safety check
  if (!config) {
    console.error(`Invalid platform: ${platform}`);
    return null;
  }
  
  const Icon = config.icon;

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful OAuth
      const mockData = {
        platform,
        level,
        accountEmail: 'user@example.com',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };

      setConnectionStatus('success');
      toast.success(`${config.name} connected successfully!`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete(mockData);
    } catch (error) {
      setConnectionStatus('error');
      toast.error(`Failed to connect to ${config.name}`);
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
    onOpenChange(false);
  };

  const handleCreateTestMeeting = async () => {
    setIsCreatingTest(true);

    try {
      // Simulate test meeting creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful test meeting creation
      const mockLink = 'https://example.com/test-meeting';
      setTestMeetingLink(mockLink);
      toast.success(`Test meeting created successfully!`);
    } catch (error) {
      toast.error(`Failed to create test meeting`);
    } finally {
      setIsCreatingTest(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" aria-describedby="meeting-platform-setup-description">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {mode === 'reconnect' ? `Reconnect ${config.name}` : `Connect ${config.name}`}
            {level === 'firm' && (
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300">
                Firm Account
              </Badge>
            )}
            {level === 'personal' && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300">
                Personal Account
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400" id="meeting-platform-setup-description">
            {level === 'firm'
              ? `Set up ${config.name} as your firm's default meeting platform`
              : `Connect your personal ${config.name} account for meetings`}
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
                      Your {config.name} connection has expired. Reconnect to restore meeting functionality.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Platform Info */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                What You'll Get
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Features */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                How It Works in Acounta
              </h4>
              <div className="space-y-3">
                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Automatic Meeting Creation
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Meetings are automatically created when you schedule appointments with clients
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Links in Invitations
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Meeting links are automatically included in calendar invites and reminders
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        One-Click Join
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Clients can join meetings directly from the Acounta portal
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Level-specific info */}
            {level === 'firm' && (
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-800 dark:text-purple-200">
                    <p className="font-semibold mb-1">Firm-Level Account:</p>
                    <p>
                      This will be the default meeting platform for all team members. Individual team
                      members can still connect their personal accounts to override this default.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {level === 'personal' && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Personal Account:</p>
                    <p>
                      This account is for your use only. Meetings you create will use your personal
                      {config.name} account instead of the firm default.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* OAuth Info */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">How Authorization Works:</p>
                  <ul className="space-y-1">
                    <li>1. You'll be redirected to {config.name} to sign in</li>
                    <li>2. Review and approve the requested permissions</li>
                    <li>3. You'll be redirected back to Acounta automatically</li>
                    <li>4. Meetings will be created using your account</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Security & Privacy:</p>
                  <p>
                    Acounta uses OAuth 2.0 for secure authentication. We only request permissions to
                    create and manage meetings. You can revoke access at any time from your {config.name} account settings.
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {mode === 'reconnect' ? `Reconnect to ${config.name}` : `Connect to ${config.name}`}
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connecting to {config.name}...
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
              Please complete the authorization in the {config.name} window. Don't close this dialog.
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
              Your {config.name} account is now connected and ready to create meetings.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTestMeeting}
                disabled={isCreatingTest}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Create Test Meeting
              </Button>
            </div>
            {testMeetingLink && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                  Test Meeting Link:
                </p>
                <a href={testMeetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 underline">
                  {testMeetingLink}
                </a>
              </div>
            )}
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
              We couldn't connect to {config.name}. Please try again.
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