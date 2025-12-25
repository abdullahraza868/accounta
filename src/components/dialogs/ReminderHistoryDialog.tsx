import React, { useState } from 'react';
import { Bell, Eye, EyeOff, User, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

type ReminderHistory = {
  sentDate: Date;
  sentBy: string;
  viewed: boolean;
  viewedDate?: Date;
};

type Document = {
  id: string;
  clientName: string;
  documentType: string;
  year: string;
  reminderHistory?: ReminderHistory[];
};

interface ReminderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  emailBody: string;
  onEmailChange: (email: string) => void;
  onSend: () => void;
}

export function ReminderHistoryDialog({
  open,
  onOpenChange,
  document,
  emailBody,
  onEmailChange,
  onSend,
}: ReminderHistoryDialogProps) {
  if (!document) return null;

  const history = document.reminderHistory || [];
  const recentHistory = history.filter(h => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return h.sentDate.getTime() > sevenDaysAgo;
  });

  // Format relative time or absolute date
  const formatReminderDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Recent - use relative time
    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} mins ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 3) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    // Older - use date | time format
    const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} | ${timeStr}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="reminder-history-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Send Reminder - {document.clientName}
          </DialogTitle>
          <DialogDescription id="reminder-history-description">
            Reminder for {document.documentType} ({document.year})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              <strong>Recent Reminders Sent:</strong> You've sent {recentHistory.length} reminder{recentHistory.length > 1 ? 's' : ''} in the last 7 days. 
              Consider if another reminder is necessary.
            </AlertDescription>
          </Alert>

          {/* Reminder History */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Recent Reminder History (Last 7 Days)
            </Label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-40 overflow-y-auto">
              {recentHistory.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No reminders sent in the last 7 days
                </div>
              ) : (
                recentHistory.map((reminder, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {reminder.sentBy}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 ml-5">
                          Sent {formatReminderDate(reminder.sentDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {reminder.viewed ? (
                          <>
                            <Eye className="w-4 h-4 text-green-600" />
                            <div className="text-xs">
                              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                                Viewed
                              </Badge>
                              {reminder.viewedDate && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {formatReminderDate(reminder.viewedDate)}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                              Not Viewed
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Body Editor */}
          <div className="space-y-2">
            <Label htmlFor="emailBody" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Message
            </Label>
            <Textarea
              id="emailBody"
              value={emailBody}
              onChange={(e) => onEmailChange(e.target.value)}
              rows={8}
              className="resize-none font-mono text-sm"
              placeholder="Enter email message..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Edit the email message before sending the reminder
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
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              onSend();
              onOpenChange(false);
            }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Send Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}