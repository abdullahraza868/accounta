import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Check, 
  Plus,
  Trash2,
  Globe,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from './ui/utils';

// Import provider logos (we'll use icon placeholders)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#f25022" d="M11.4 11.4H2V2h9.4v9.4z"/>
    <path fill="#00a4ef" d="M22 11.4h-9.4V2H22v9.4z"/>
    <path fill="#7fba00" d="M11.4 22H2v-9.4h9.4V22z"/>
    <path fill="#ffb900" d="M22 22h-9.4v-9.4H22V22z"/>
  </svg>
);

type CalendarSource = {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'internal';
  color: string;
  enabled: boolean;
  connected?: boolean;
  email?: string;
};

type CalendarSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarSources: CalendarSource[];
  onToggleSource: (id: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onConnectAccount: (type: 'google' | 'microsoft') => void;
  onDisconnectAccount: (id: string) => void;
  defaultTimeZone?: string;
  onTimeZoneChange?: (timezone: string) => void;
};

export function CalendarSettingsDialog({
  open,
  onOpenChange,
  calendarSources,
  onToggleSource,
  onUpdateColor,
  onConnectAccount,
  onDisconnectAccount,
  defaultTimeZone = 'America/New_York',
  onTimeZoneChange
}: CalendarSettingsDialogProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState(defaultTimeZone);

  const colorOptions = [
    { value: '#7c3aed', label: 'Purple' },
    { value: '#2563eb', label: 'Blue' },
    { value: '#059669', label: 'Green' },
    { value: '#dc2626', label: 'Red' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#ca8a04', label: 'Yellow' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#db2777', label: 'Pink' },
    { value: '#4f46e5', label: 'Indigo' },
    { value: '#9333ea', label: 'Violet' },
  ];

  const timeZones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const handleTimeZoneChange = (timezone: string) => {
    setSelectedTimeZone(timezone);
    if (onTimeZoneChange) {
      onTimeZoneChange(timezone);
    }
  };

  const getProviderIcon = (type: CalendarSource['type']) => {
    switch (type) {
      case 'google':
        return <GoogleIcon />;
      case 'microsoft':
        return <MicrosoftIcon />;
      case 'internal':
        return <CalendarIcon className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />;
    }
  };

  const connectedAccounts = calendarSources.filter(s => s.type !== 'internal' && s.connected);
  const availableConnections = [
    { type: 'google' as const, label: 'Google Calendar', connected: connectedAccounts.some(a => a.type === 'google') },
    { type: 'microsoft' as const, label: 'Microsoft Outlook', connected: connectedAccounts.some(a => a.type === 'microsoft') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="calendar-settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Calendar Settings</DialogTitle>
          <DialogDescription id="calendar-settings-description">
            Manage your calendar connections, time zone preferences, and calendar source settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Time Zone Settings */}
          <div>
            <Label className="text-base flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4" />
              Default Time Zone
            </Label>
            <Select value={selectedTimeZone} onValueChange={handleTimeZoneChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              All meeting times will be displayed in this time zone
            </p>
          </div>

          <Separator />

          {/* Connected Accounts */}
          <div>
            <Label className="text-base mb-3 block">Connected Calendar Accounts</Label>
            
            {connectedAccounts.length > 0 ? (
              <div className="space-y-2 mb-4">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      {getProviderIcon(account.type)}
                      <div>
                        <div className="font-medium text-sm">{account.name}</div>
                        {account.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{account.email}</div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDisconnectAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mb-4">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No external calendar accounts connected
                </p>
              </div>
            )}

            <div className="space-y-2">
              {availableConnections.map((connection) => (
                !connection.connected && (
                  <Button
                    key={connection.type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onConnectAccount(connection.type)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect {connection.label}
                  </Button>
                )
              ))}
            </div>
          </div>

          <Separator />

          {/* Calendar Sources */}
          <div>
            <Label className="text-base mb-3 block">Calendar Sources</Label>
            <div className="space-y-3">
              {calendarSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getProviderIcon(source.type)}
                    <div className="flex-1">
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {source.type} calendar
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Color Picker */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Color:</Label>
                      <div className="flex gap-1">
                        {colorOptions.slice(0, 5).map((color) => (
                          <button
                            key={`${source.id}-${color.value}`}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                              source.color === color.value
                                ? "border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white"
                                : "border-gray-300 dark:border-gray-600"
                            )}
                            style={{ backgroundColor: color.value }}
                            onClick={() => onUpdateColor(source.id, color.value)}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Toggle */}
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => onToggleSource(source.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}