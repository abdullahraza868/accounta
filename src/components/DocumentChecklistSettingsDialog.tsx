import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Info, Calendar, Mail, Eye, Send, TestTube } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from './ui/utils';

export type ChecklistSettings = {
  sendMethod: 'auto' | 'manual';
  autoSendDate?: string; // Format: MM-DD (e.g., "01-05" for Jan 5)
  emailSubject: string;
  emailBody: string;
};

interface DocumentChecklistSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ChecklistSettings;
  onSave: (settings: ChecklistSettings) => void;
  clientName?: string; // If provided, it's client-level settings
  isGlobal?: boolean; // True if editing global settings
}

// Default email template
const DEFAULT_EMAIL_SUBJECT = 'Document Checklist for {tax_year} Tax Return - {firm_name}';
const DEFAULT_EMAIL_BODY = `Dear {client_name},

We hope this message finds you well. As we prepare for your {tax_year} tax return, we need you to gather and submit the following documents:

{document_list}

Please upload these documents through your secure client portal:
{portal_link}

If you have any additional documents that may apply to new deductions or credits for {tax_year}, please include those as well.

Important Notes:
• All documents should be complete and clearly legible
• If you have questions about any item, please contact us
• The deadline for submission is {due_date}

Thank you for your prompt attention to this matter. We look forward to serving you this tax season.

Best regards,
{firm_name}
{firm_phone}
{firm_email}`;

export function DocumentChecklistSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
  clientName,
  isGlobal = false,
}: DocumentChecklistSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<ChecklistSettings>(settings);
  const [showPreview, setShowPreview] = useState(false);

  // Reset to defaults
  const handleResetToDefaults = () => {
    setLocalSettings({
      ...localSettings,
      emailSubject: DEFAULT_EMAIL_SUBJECT,
      emailBody: DEFAULT_EMAIL_BODY,
    });
    toast.success('Email template reset to defaults');
  };

  // Generate preview with sample data
  const generatePreview = () => {
    const sampleData = {
      '{client_name}': clientName || 'John Smith',
      '{firm_name}': 'Your Accounting Firm',
      '{firm_phone}': '(555) 123-4567',
      '{firm_email}': 'info@yourfirm.com',
      '{tax_year}': '2024',
      '{due_date}': 'March 15, 2025',
      '{portal_link}': 'https://portal.yourfirm.com/upload',
      '{document_list}': `• W-2 Form - Wage and Tax Statement
• 1099-INT - Interest Income
• 1099-DIV - Dividends and Distributions
• Property Tax Statement
• Mortgage Interest Statement (1098)`,
    };

    let preview = localSettings.emailBody;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replaceAll(key, value);
    });

    return preview;
  };

  const generateSubjectPreview = () => {
    const sampleData = {
      '{client_name}': clientName || 'John Smith',
      '{firm_name}': 'Your Accounting Firm',
      '{tax_year}': '2024',
    };

    let preview = localSettings.emailSubject;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replaceAll(key, value);
    });

    return preview;
  };

  // Handle save
  const handleSave = () => {
    // Validation
    if (localSettings.sendMethod === 'auto' && !localSettings.autoSendDate) {
      toast.error('Please select an auto-send date');
      return;
    }

    if (!localSettings.emailSubject.trim()) {
      toast.error('Email subject is required');
      return;
    }

    if (!localSettings.emailBody.trim()) {
      toast.error('Email body is required');
      return;
    }

    onSave(localSettings);
    toast.success(
      isGlobal
        ? 'Global checklist settings saved'
        : `Checklist settings saved for ${clientName}`
    );
    onOpenChange(false);
  };

  // Send test email
  const handleSendTestEmail = () => {
    toast.success('Test email sent to your account');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="checklist-settings-description">
        <DialogHeader>
          <DialogTitle>
            {isGlobal ? 'Global Document Checklist Settings' : `Checklist Settings - ${clientName}`}
          </DialogTitle>
          <DialogDescription id="checklist-settings-description">
            {isGlobal
              ? 'Configure default settings for all clients. Individual clients can override these settings.'
              : `Configure how the document checklist is sent to ${clientName}. These settings override global defaults.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sending" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sending">
              <Calendar className="w-4 h-4 mr-2" />
              Sending Settings
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Template
            </TabsTrigger>
          </TabsList>

          {/* Sending Settings Tab */}
          <TabsContent value="sending" className="flex-1 overflow-auto space-y-4 mt-4">
            <div className="space-y-4">
              {/* Send Method */}
              <div className="space-y-2">
                <Label>Send Method</Label>
                <Select
                  value={localSettings.sendMethod}
                  onValueChange={(value: 'auto' | 'manual') =>
                    setLocalSettings((prev) => ({ ...prev, sendMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Send Manually</SelectItem>
                    <SelectItem value="auto">Send Automatically</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose whether to send the checklist manually or automatically each year
                </p>
              </div>

              {/* Auto-Send Date - Only show if automatic */}
              {localSettings.sendMethod === 'auto' && (
                <div className="space-y-2">
                  <Label>Annual Send Date</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Select
                        value={localSettings.autoSendDate?.split('-')[0] || '01'}
                        onValueChange={(month) => {
                          const day = localSettings.autoSendDate?.split('-')[1] || '01';
                          setLocalSettings((prev) => ({
                            ...prev,
                            autoSendDate: `${month}-${day}`,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">January</SelectItem>
                          <SelectItem value="02">February</SelectItem>
                          <SelectItem value="03">March</SelectItem>
                          <SelectItem value="04">April</SelectItem>
                          <SelectItem value="05">May</SelectItem>
                          <SelectItem value="06">June</SelectItem>
                          <SelectItem value="07">July</SelectItem>
                          <SelectItem value="08">August</SelectItem>
                          <SelectItem value="09">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={localSettings.autoSendDate?.split('-')[1] || '01'}
                        onValueChange={(day) => {
                          const month = localSettings.autoSendDate?.split('-')[0] || '01';
                          setLocalSettings((prev) => ({
                            ...prev,
                            autoSendDate: `${month}-${day}`,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => {
                            const day = String(i + 1).padStart(2, '0');
                            return (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    The checklist will be automatically sent every year on this date
                  </p>
                </div>
              )}

              {/* Info Card */}
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        How Automatic Sending Works
                      </p>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                        <li>The checklist will be sent automatically each year on the specified date</li>
                        <li>Clients will receive an email with all required documents listed</li>
                        <li>A secure upload link will be included in the email</li>
                        <li>You can still manually send the checklist at any time</li>
                        {isGlobal && (
                          <li className="font-medium text-purple-600 dark:text-purple-400">
                            Individual clients can override these settings
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Template Tab */}
          <TabsContent value="email" className="flex-1 overflow-auto space-y-4 mt-4">
            <div className="space-y-4">
              {/* Subject Line */}
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={localSettings.emailSubject}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, emailSubject: e.target.value }))
                  }
                  placeholder="Enter email subject"
                />
              </div>

              {/* Email Body */}
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={localSettings.emailBody}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, emailBody: e.target.value }))
                  }
                  placeholder="Enter email body"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {/* Available Variables */}
              <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Available Variables
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{client_name}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Client's name</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{firm_name}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Your firm name</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{tax_year}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Current tax year</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{due_date}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Submission deadline</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{document_list}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">List of documents</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{portal_link}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Upload portal URL</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{firm_phone}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Firm phone number</p>
                    </div>
                    <div className="space-y-1">
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                        {'{firm_email}'}
                      </code>
                      <p className="text-gray-600 dark:text-gray-400 ml-2">Firm email address</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button variant="outline" onClick={handleResetToDefaults}>
                  Reset to Defaults
                </Button>
              </div>

              {/* Preview */}
              {showPreview && (
                <Card className="border-2 border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {generateSubjectPreview()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Message:</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {generatePreview()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-shrink-0">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              className="gap-2"
            >
              <TestTube className="w-4 h-4" />
              Send Test Email
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
