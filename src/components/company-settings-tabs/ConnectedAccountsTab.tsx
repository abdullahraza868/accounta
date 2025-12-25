import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Phone,
  Mail,
  FileText,
  Video,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Plus,
  Settings,
  Building2,
  User,
  Zap,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { TwilioSetupDialog } from './TwilioSetupDialog';
import { QuickBooksSetupDialog } from './QuickBooksSetupDialog';
import { EmailServiceSetupDialog } from './EmailServiceSetupDialog';
import { MeetingPlatformSetupDialog } from './MeetingPlatformSetupDialog';
import { IntegrationStatusMonitor, type IntegrationIssue } from '../IntegrationStatusMonitor';

// Integration status types
type IntegrationStatus = 'not_connected' | 'setup_in_progress' | 'connected' | 'disconnected' | 'error';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'communication' | 'accounting' | 'meetings';
  level: 'firm' | 'user';
  status: IntegrationStatus;
  requiresAdmin: boolean;
  connectedAt?: string;
  lastSync?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
};

export function ConnectedAccountsTab() {
  const [twilioDialogOpen, setTwilioDialogOpen] = useState(false);
  const [quickBooksDialogOpen, setQuickBooksDialogOpen] = useState(false);
  const [emailServiceDialogOpen, setEmailServiceDialogOpen] = useState(false);
  const [meetingPlatformDialogOpen, setMeetingPlatformDialogOpen] = useState(false);
  const [selectedMeetingPlatform, setSelectedMeetingPlatform] = useState<'zoom' | 'google-meet' | 'teams'>('zoom');
  const [selectedMeetingLevel, setSelectedMeetingLevel] = useState<'firm' | 'personal'>('firm');
  
  // Mock integrations data - would come from API
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'twilio',
      name: 'Twilio (Custom Phone Number)',
      description: 'Send SMS notifications and texts from your own business phone number',
      icon: Phone,
      category: 'communication',
      level: 'firm',
      status: 'not_connected',
      requiresAdmin: true,
    },
    {
      id: 'email',
      name: 'Email Service',
      description: 'Send firm-branded emails and automated notifications from Acounta',
      icon: Mail,
      category: 'communication',
      level: 'firm',
      status: 'connected',
      requiresAdmin: true,
      connectedAt: '2024-01-15',
      lastSync: '2024-03-10',
      metadata: { provider: 'SendGrid', fromEmail: 'notifications@yourfirm.com' },
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Sync client data and financial information with QuickBooks Online',
      icon: FileText,
      category: 'accounting',
      level: 'firm',
      status: 'disconnected',
      requiresAdmin: true,
      connectedAt: '2024-01-20',
      lastSync: '2024-02-28',
      errorMessage: 'QuickBooks connection expired. Please reconnect to continue syncing data.',
    },
    {
      id: 'firm-zoom',
      name: 'Zoom (Firm Account)',
      description: 'Default meeting platform for client meetings and team collaboration',
      icon: Video,
      category: 'meetings',
      level: 'firm',
      status: 'connected',
      requiresAdmin: true,
      connectedAt: '2024-01-10',
      lastSync: '2024-03-15',
      metadata: { accountEmail: 'meetings@yourfirm.com' },
    },
    {
      id: 'firm-google-meet',
      name: 'Google Meet (Firm Account)',
      description: 'Alternative meeting platform for client meetings',
      icon: Calendar,
      category: 'meetings',
      level: 'firm',
      status: 'not_connected',
      requiresAdmin: true,
    },
    {
      id: 'firm-teams',
      name: 'Microsoft Teams (Firm Account)',
      description: 'Enterprise meeting and collaboration platform',
      icon: Users,
      category: 'meetings',
      level: 'firm',
      status: 'not_connected',
      requiresAdmin: true,
    },
  ]);

  const firmIntegrations = integrations.filter(i => i.level === 'firm');

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'setup_in_progress':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            Setup In Progress
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
            Not Connected
          </Badge>
        );
    }
  };

  const handleConnect = (integrationId: string) => {
    switch (integrationId) {
      case 'twilio':
        setTwilioDialogOpen(true);
        break;
      case 'quickbooks':
        setQuickBooksDialogOpen(true);
        break;
      case 'email':
        setEmailServiceDialogOpen(true);
        break;
      case 'firm-zoom':
        setSelectedMeetingPlatform('zoom');
        setSelectedMeetingLevel('firm');
        setMeetingPlatformDialogOpen(true);
        break;
      case 'firm-google-meet':
        setSelectedMeetingPlatform('google-meet');
        setSelectedMeetingLevel('firm');
        setMeetingPlatformDialogOpen(true);
        break;
      case 'firm-teams':
        setSelectedMeetingPlatform('teams');
        setSelectedMeetingLevel('firm');
        setMeetingPlatformDialogOpen(true);
        break;
      default:
        console.log(`Connecting to ${integrationId}...`);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to disconnect this integration? This may affect automated features.'
    );
    if (confirmed) {
      setIntegrations(integrations.map(i =>
        i.id === integrationId ? { ...i, status: 'not_connected' as IntegrationStatus } : i
      ));
    }
  };

  const handleReconnect = (integrationId: string) => {
    handleConnect(integrationId);
  };

  // Count disconnected firm integrations for alert
  const disconnectedFirmIntegrations = firmIntegrations.filter(
    i => i.status === 'disconnected' || i.status === 'error'
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Connected Accounts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage integrations with third-party services for communications, accounting, and meetings
            </p>
          </div>

          <div className="space-y-6">
            {/* Alert for disconnected integrations */}
            {disconnectedFirmIntegrations.length > 0 && (
              <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Action Required: {disconnectedFirmIntegrations.length} Integration{disconnectedFirmIntegrations.length > 1 ? 's' : ''} Disconnected
                    </p>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      Some firm-level integrations have been disconnected and require attention to restore functionality.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {disconnectedFirmIntegrations.map(integration => (
                        <Button
                          key={integration.id}
                          size="sm"
                          variant="outline"
                          onClick={() => handleReconnect(integration.id)}
                          className="text-xs bg-white dark:bg-gray-800"
                        >
                          Reconnect {integration.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Firm-Level Integrations */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-gray-900 dark:text-gray-100">Firm-Level Integrations</h2>
                <Badge variant="outline" className="ml-2">Admin Only</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                These integrations apply to the entire firm and enable firm-wide features like branded communications and accounting sync.
              </p>

              <div className="space-y-6">
                {/* Communication */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    Communication
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {firmIntegrations
                      .filter(i => i.category === 'communication')
                      .map(integration => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onReconnect={handleReconnect}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                  </div>
                </div>

                {/* Accounting */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    Accounting
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {firmIntegrations
                      .filter(i => i.category === 'accounting')
                      .map(integration => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onReconnect={handleReconnect}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                  </div>
                </div>

                {/* Meeting Platforms */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    Meeting Platforms (Firm Default)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {firmIntegrations
                      .filter(i => i.category === 'meetings')
                      .map(integration => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onReconnect={handleReconnect}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Twilio Setup Dialog */}
            <TwilioSetupDialog
              open={twilioDialogOpen}
              onOpenChange={setTwilioDialogOpen}
              onComplete={(data) => {
                setIntegrations(integrations.map(i =>
                  i.id === 'twilio'
                    ? {
                        ...i,
                        status: 'connected' as IntegrationStatus,
                        connectedAt: new Date().toISOString(),
                        lastSync: new Date().toISOString(),
                        metadata: data,
                      }
                    : i
                ));
                setTwilioDialogOpen(false);
              }}
            />

            {/* QuickBooks Setup Dialog */}
            <QuickBooksSetupDialog
              open={quickBooksDialogOpen}
              onOpenChange={setQuickBooksDialogOpen}
              onComplete={(data) => {
                setIntegrations(integrations.map(i =>
                  i.id === 'quickbooks'
                    ? {
                        ...i,
                        status: 'connected' as IntegrationStatus,
                        connectedAt: new Date().toISOString(),
                        lastSync: new Date().toISOString(),
                        metadata: data,
                      }
                    : i
                ));
                setQuickBooksDialogOpen(false);
              }}
            />

            {/* Email Service Setup Dialog */}
            <EmailServiceSetupDialog
              open={emailServiceDialogOpen}
              onOpenChange={setEmailServiceDialogOpen}
              onComplete={(data) => {
                setIntegrations(integrations.map(i =>
                  i.id === 'email'
                    ? {
                        ...i,
                        status: 'connected' as IntegrationStatus,
                        connectedAt: new Date().toISOString(),
                        lastSync: new Date().toISOString(),
                        metadata: data,
                      }
                    : i
                ));
                setEmailServiceDialogOpen(false);
              }}
            />

            {/* Meeting Platform Setup Dialog */}
            <MeetingPlatformSetupDialog
              open={meetingPlatformDialogOpen}
              onOpenChange={setMeetingPlatformDialogOpen}
              platform={selectedMeetingPlatform}
              level={selectedMeetingLevel}
              onComplete={(data) => {
                setIntegrations(integrations.map(i =>
                  i.id === 'firm-zoom' || i.id === 'firm-google-meet' || i.id === 'firm-teams'
                    ? {
                        ...i,
                        status: 'connected' as IntegrationStatus,
                        connectedAt: new Date().toISOString(),
                        lastSync: new Date().toISOString(),
                        metadata: data,
                      }
                    : i
                ));
                setMeetingPlatformDialogOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Integration Card Component
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onReconnect,
  getStatusBadge,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
  getStatusBadge: (status: IntegrationStatus) => JSX.Element;
}) {
  const Icon = integration.icon;
  const isConnected = integration.status === 'connected';
  const needsAttention = integration.status === 'disconnected' || integration.status === 'error';

  return (
    <Card
      className={cn(
        'p-5 border-2 transition-all',
        needsAttention
          ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'
          : isConnected
          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              needsAttention
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : isConnected
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                needsAttention
                  ? 'text-orange-600 dark:text-orange-400'
                  : isConnected
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {integration.name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {integration.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">{getStatusBadge(integration.status)}</div>

      {/* Error Message */}
      {needsAttention && integration.errorMessage && (
        <div className="mb-3 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg">
          <p className="text-xs text-orange-800 dark:text-orange-200">
            {integration.errorMessage}
          </p>
        </div>
      )}

      {/* Metadata */}
      {isConnected && integration.metadata && (
        <div className="mb-3 space-y-1">
          {Object.entries(integration.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{value as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* Last Sync */}
      {isConnected && integration.lastSync && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Last synced: {new Date(integration.lastSync).toLocaleDateString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {integration.status === 'not_connected' && (
          <Button
            size="sm"
            onClick={() => onConnect(integration.id)}
            className="flex-1 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <Plus className="w-3 h-3 mr-1" />
            Connect
          </Button>
        )}

        {needsAttention && (
          <Button
            size="sm"
            onClick={() => onReconnect(integration.id)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Reconnect
          </Button>
        )}

        {isConnected && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConnect(integration.id)}
              className="flex-1"
            >
              <Settings className="w-3 h-3 mr-1" />
              Manage
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDisconnect(integration.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

// Fix missing Users import
function Users({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}