import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Settings as SettingsIcon,
  Check,
  X,
  MessageSquare,
  Mail as MailIcon,
  Smartphone,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast as sonnerToast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { NotificationChannel, NotificationFrequency, NotificationCategory } from '../../types/notifications';
import { ALL_NOTIFICATION_TYPES } from '../../data/notificationTypes';

interface NotificationToastProps {
  notificationId: string;
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface QuickSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationId: string;
  notificationName: string;
  category: NotificationCategory;
  currentChannels: NotificationChannel[];
  isCustom: boolean;
  hasDigest: boolean;
  digestFrequency?: NotificationFrequency;
  isLocked?: boolean;
  onSave: (settings: {
    channels: NotificationChannel[];
    digestEnabled: boolean;
    digestFrequency?: NotificationFrequency;
  }) => void;
  onReset: () => void;
}

function QuickSettingsDialog({
  open,
  onOpenChange,
  notificationId,
  notificationName,
  category,
  currentChannels,
  isCustom,
  hasDigest,
  digestFrequency,
  isLocked,
  onSave,
  onReset,
}: QuickSettingsDialogProps) {
  const [channels, setChannels] = useState<NotificationChannel[]>(currentChannels);
  const [digestEnabled, setDigestEnabled] = useState(hasDigest);
  const [frequency, setFrequency] = useState<NotificationFrequency>(digestFrequency || 'daily');

  const toggleChannel = (channel: NotificationChannel) => {
    if (isLocked) return;
    
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleSave = () => {
    onSave({
      channels,
      digestEnabled,
      digestFrequency: digestEnabled ? frequency : undefined,
    });
    onOpenChange(false);
    sonnerToast.success('Notification preferences updated');
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
    sonnerToast.success('Reset to category defaults');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="manage-notification-description">
        <DialogHeader>
          <DialogTitle>Manage Notification</DialogTitle>
          <DialogDescription id="manage-notification-description">
            Customize how you receive "{notificationName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isCustom ? (
              <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20">
                Custom Settings
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                Using Category Defaults
              </Badge>
            )}
            {isLocked && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Required - Cannot Disable
              </Badge>
            )}
          </div>

          {/* Channel Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">Delivery Channels</h4>
            <div className="space-y-2">
              <button
                onClick={() => toggleChannel('toast')}
                disabled={isLocked}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border-2",
                  channels.includes('toast')
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                  isLocked && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  {channels.includes('toast') ? (
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Toast Notification</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      In-app popup notification
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => toggleChannel('email')}
                disabled={isLocked}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border-2",
                  channels.includes('email')
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                  isLocked && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  {channels.includes('email') ? (
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                  <MailIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send to your email address
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => toggleChannel('sms')}
                disabled={isLocked}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border-2",
                  channels.includes('sms')
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                  isLocked && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  {channels.includes('sms') ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                  <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">SMS</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Text message to your phone
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Digest Settings */}
          {!isLocked && (
            <div>
              <h4 className="text-sm font-medium mb-3">Digest Options</h4>
              <button
                onClick={() => setDigestEnabled(!digestEnabled)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border-2",
                  digestEnabled
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className="flex items-center gap-3">
                  {digestEnabled ? (
                    <Check className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Enable Digest</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Batch notifications together
                    </p>
                  </div>
                </div>
              </button>

              {digestEnabled && (
                <div className="mt-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                    Digest Frequency
                  </label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as NotificationFrequency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          {isCustom && !isLocked && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationToast({
  notificationId,
  title,
  message,
  icon,
  actionButton,
  onDismiss,
}: NotificationToastProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get notification details (in real app, this would come from context/store)
  const notificationType = ALL_NOTIFICATION_TYPES.find(n => n.id === notificationId);
  const category = notificationType?.category || 'system';
  
  // Mock current settings (in real app, get from context/store)
  const mockSettings = {
    currentChannels: ['toast', 'email'] as NotificationChannel[],
    isCustom: false,
    hasDigest: false,
    digestFrequency: 'daily' as NotificationFrequency,
    isLocked: notificationType?.locked || false,
  };

  const handleSaveSettings = (settings: any) => {
    // In real app, update context/store and save to backend
    console.log('Saving notification settings:', settings);
  };

  const handleResetSettings = () => {
    // In real app, reset to defaults in context/store
    console.log('Resetting to defaults');
  };

  return (
    <>
      <div className="flex items-start gap-3 w-full">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>
          
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="text-xs font-medium mt-2 hover:underline"
              style={{ color: 'var(--primaryColor)' }}
            >
              {actionButton.label}
            </button>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Manage this notification"
          >
            <SettingsIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <QuickSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        notificationId={notificationId}
        notificationName={notificationType?.name || title}
        category={category}
        currentChannels={mockSettings.currentChannels}
        isCustom={mockSettings.isCustom}
        hasDigest={mockSettings.hasDigest}
        digestFrequency={mockSettings.digestFrequency}
        isLocked={mockSettings.isLocked}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
      />
    </>
  );
}

// Helper function to show a notification toast with settings
export function showNotification(props: Omit<NotificationToastProps, 'onDismiss'>) {
  sonnerToast.custom((t) => (
    <NotificationToast
      {...props}
      onDismiss={() => sonnerToast.dismiss(t)}
    />
  ), {
    duration: 5000,
  });
}
