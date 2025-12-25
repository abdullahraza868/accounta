import { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type BillingSettingsDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  overdueSendThreshold: number;
  onOverdueSendThresholdChange: (days: number) => void;
  autoSendEnabled?: boolean;
  onAutoSendToggle?: (enabled: boolean) => void;
  reminderFrequencyDays?: number;
  maxReminders?: number;
  onReminderSettingsChange?: (frequency: number, maxCount: number) => void;
};

export function BillingSettingsDialog({
  open,
  onOpenChange = () => {},
  overdueSendThreshold,
  onOverdueSendThresholdChange,
  autoSendEnabled = false,
  onAutoSendToggle,
  reminderFrequencyDays = 7,
  maxReminders = 3,
  onReminderSettingsChange,
}: BillingSettingsDialogProps) {
  const [thresholdDays, setThresholdDays] = useState(overdueSendThreshold.toString());
  const [autoSend, setAutoSend] = useState(autoSendEnabled);
  const [error, setError] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState(reminderFrequencyDays.toString());
  const [maxReminderCount, setMaxReminderCount] = useState(maxReminders.toString());

  useEffect(() => {
    if (open) {
      setThresholdDays(overdueSendThreshold.toString());
      setAutoSend(autoSendEnabled);
      setError('');
      setReminderFrequency(reminderFrequencyDays.toString());
      setMaxReminderCount(maxReminders.toString());
    }
  }, [open, overdueSendThreshold, autoSendEnabled, reminderFrequencyDays, maxReminders]);

  const handleSave = () => {
    const days = parseInt(thresholdDays);
    if (isNaN(days) || days < 1 || days > 365) {
      setError('Please enter a number between 1 and 365');
      return;
    }
    onOverdueSendThresholdChange(days);
    if (onAutoSendToggle) {
      onAutoSendToggle(autoSend);
    }
    if (onReminderSettingsChange) {
      onReminderSettingsChange(parseInt(reminderFrequency), parseInt(maxReminderCount));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="billing-settings-description">
        <DialogHeader>
          <DialogTitle>Billing Settings</DialogTitle>
          <DialogDescription id="billing-settings-description">
            Configure settings for billing and invoice reminders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overdue Threshold Setting */}
          <div className="space-y-2">
            <Label htmlFor="threshold">Overdue Threshold (Days Past Due)</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => {
                  const newValue = Math.max(1, parseInt(thresholdDays) - 1);
                  setThresholdDays(newValue.toString());
                  setError('');
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="365"
                value={thresholdDays}
                onChange={(e) => {
                  setThresholdDays(e.target.value);
                  setError('');
                }}
                className={`w-20 text-center ${error ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => {
                  const newValue = Math.min(365, parseInt(thresholdDays) + 1);
                  setThresholdDays(newValue.toString());
                  setError('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">
                Invoices are marked with an overdue indicator when they reach this threshold.
              </p>
              <p className="text-xs text-gray-500">
                The "Bulk Send" button will appear for invoices that are overdue by this many days.
              </p>
            </div>
          </div>

          {/* Auto-Send Setting */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send" className="text-base">
                  Auto-Send Reminders
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically send invoice reminders when threshold is met
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={autoSend}
                onCheckedChange={setAutoSend}
              />
            </div>
            {autoSend && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    ✓ First reminder will be sent automatically once an invoice is {thresholdDays} day{parseInt(thresholdDays) !== 1 ? 's' : ''} past due
                  </p>
                </div>

                {/* Reminder Frequency Setting */}
                <div className="space-y-2 pt-4">
                  <Label htmlFor="reminder-frequency">
                    Reminder Frequency (Days)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const newValue = Math.max(1, parseInt(reminderFrequency) - 1);
                        setReminderFrequency(newValue.toString());
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="reminder-frequency"
                      type="number"
                      min="1"
                      max="90"
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value)}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const newValue = Math.min(90, parseInt(reminderFrequency) + 1);
                        setReminderFrequency(newValue.toString());
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    First reminder will be sent at {thresholdDays} days, then reminders will be sent every {reminderFrequency} days
                  </p>
                </div>

                {/* Max Reminders Setting */}
                <div className="space-y-2 pt-4">
                  <Label htmlFor="max-reminders">
                    Maximum Reminders
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const newValue = Math.max(1, parseInt(maxReminderCount) - 1);
                        setMaxReminderCount(newValue.toString());
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="max-reminders"
                      type="number"
                      min="1"
                      max="10"
                      value={maxReminderCount}
                      onChange={(e) => setMaxReminderCount(e.target.value)}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const newValue = Math.min(10, parseInt(maxReminderCount) + 1);
                        setMaxReminderCount(newValue.toString());
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">reminders</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    A total of {Math.max(0, parseInt(maxReminderCount) - 1)} reminder{parseInt(maxReminderCount) - 1 !== 1 ? 's' : ''} will be sent after the initial reminder sent on day {thresholdDays}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}