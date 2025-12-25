import React, { useState, useEffect } from 'react';
import { Settings, Clock, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type SignatureSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overdueDays: number;
  onOverdueDaysChange: (days: number) => void;
  autoSendEnabled?: boolean;
  onAutoSendToggle?: (enabled: boolean) => void;
  reminderFrequencyDays?: number;
  maxReminders?: number;
  onReminderSettingsChange?: (frequency: number, maxCount: number) => void;
};

export function SignatureSettingsDialog({
  open,
  onOpenChange,
  overdueDays,
  onOverdueDaysChange,
  autoSendEnabled = false,
  onAutoSendToggle,
  reminderFrequencyDays = 3,
  maxReminders = 5,
  onReminderSettingsChange,
}: SignatureSettingsDialogProps) {
  const [days, setDays] = useState(overdueDays.toString());
  const [autoSend, setAutoSend] = useState(autoSendEnabled);
  const [error, setError] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState(reminderFrequencyDays.toString());
  const [maxReminderCount, setMaxReminderCount] = useState(maxReminders.toString());

  useEffect(() => {
    if (open) {
      setDays(overdueDays.toString());
      setAutoSend(autoSendEnabled);
      setError('');
      setReminderFrequency(reminderFrequencyDays.toString());
      setMaxReminderCount(maxReminders.toString());
    }
  }, [open, overdueDays, autoSendEnabled, reminderFrequencyDays, maxReminders]);

  const handleSave = () => {
    const daysNum = parseInt(days);
    
    if (isNaN(daysNum)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (daysNum < 1) {
      setError('Days must be at least 1');
      return;
    }
    
    if (daysNum > 365) {
      setError('Days cannot exceed 365');
      return;
    }
    
    onOverdueDaysChange(daysNum);
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
      <DialogContent className="max-w-md" aria-describedby="signature-settings-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Signature Request Settings
          </DialogTitle>
          <DialogDescription id="signature-settings-description">
            Configure when signature requests are marked as overdue
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overdue-days" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Days Before Overdue
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => {
                  const newValue = Math.max(1, parseInt(days) - 1);
                  setDays(newValue.toString());
                  setError('');
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="overdue-days"
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  setError('');
                }}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => {
                  const newValue = Math.min(365, parseInt(days) + 1);
                  setDays(newValue.toString());
                  setError('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Signature requests will be marked as overdue after this many days without being signed.
              The overdue badge will appear, and a resend notification icon will be available.
            </p>
          </div>

          {/* Auto-Send Setting */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send" className="text-base">
                  Auto-Send Reminders
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically resend signature requests when threshold is met
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
                    ✓ First reminder will be sent automatically after {days} day{parseInt(days) !== 1 ? 's' : ''} overdue
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    First reminder will be sent at {days} days, then reminders will be sent every {reminderFrequency} days
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    A total of {Math.max(0, parseInt(maxReminderCount) - 1)} reminder{parseInt(maxReminderCount) - 1 !== 1 ? 's' : ''} will be sent after the initial reminder sent on day {days}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Default: 3 days
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This setting applies to all signature requests in your firm. 
              When you resend a signature request, the overdue badge will be hidden for this duration.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
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