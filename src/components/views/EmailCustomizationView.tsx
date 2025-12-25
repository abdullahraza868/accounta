import { useState } from 'react';
import { Mail, Plus, RotateCcw, Eye, Edit2, Trash2, AlertCircle, Repeat, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'dunning' | 'general';
  dayTrigger?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// Default dunning templates
const defaultDunningTemplates: EmailTemplate[] = [
  {
    id: 'dunning-day-0',
    name: 'Payment Due - Day 0',
    subject: 'Payment Due Today: {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

This is a friendly reminder that your {{invoice_or_subscription}} payment is due today.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Due Date: {{due_date}}

We'll automatically attempt to process your payment using the payment method on file. If you've recently updated your billing information, no further action is needed.

If you have any questions or need to update your payment method, please contact us or log into your account.

Thank you for your business!

Best regards,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 0,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-3',
    name: 'Payment Reminder - Day 3',
    subject: 'Payment Reminder: {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

We wanted to let you know that we haven't received payment for your recent {{invoice_or_subscription}}.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: 3

This may have been an oversight, or there might be an issue with your payment method on file. You can easily update your billing information by logging into your account.

If you've already sent payment, please disregard this message. If you have any questions, we're here to help.

Thank you,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 3,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-10',
    name: 'Payment Not Received - Day 10',
    subject: 'Action Required: Update Payment Method for {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

We've attempted to process payment for your {{invoice_or_subscription}}, but haven't been successful.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: 10

**What you can do:**
• Update your payment method in your account settings
• Contact us if you need assistance or have questions
• Make a manual payment through your client portal

We understand that billing issues happen, and we're here to help resolve this quickly. Please reach out if there's anything we can do to assist.

Best regards,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 10,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-14',
    name: 'Urgent: Payment Required - Day 14',
    subject: 'Urgent: Payment Required to Avoid Service Interruption',
    body: `Hello {{client_name}},

We're writing to inform you that payment for your {{invoice_or_subscription}} remains outstanding, and we've been unable to process payment with your current billing information.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: 14

**Immediate Action Required:**
To avoid any interruption to your service, please update your billing information or make a payment as soon as possible.

You can:
• Log into your account to update payment details
• Contact our billing team for assistance
• Make a manual payment through your client portal

We value your business and want to ensure uninterrupted service. Please don't hesitate to reach out if you need any assistance.

Thank you,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 14,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-21',
    name: 'Final Notice - Day 21',
    subject: 'Final Notice: Payment Required for {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

This is a final notice regarding your outstanding {{invoice_or_subscription}} payment.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: 21

**Next Steps:**
We need to resolve this matter within the next 9 days to maintain your account in good standing. We understand that situations can arise, and we're here to help find a solution that works for you.

**We're Here to Help:**
If you're experiencing any difficulties or have questions about this payment, please reach out to us. We're committed to working with you to resolve this matter.

**To resolve this now:**
• Update your payment method in your account
• Contact our team: {{support_email}} or {{support_phone}}
• Make a manual payment through your client portal

We value our business relationship and look forward to continuing to serve you.

Best regards,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 21,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-30',
    name: 'Account Attention Required - Day 30',
    subject: 'Immediate Attention Required: {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

Your account requires immediate attention due to an outstanding payment that is now 30 days overdue.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: 30

**Account Status:**
Due to non-payment, action may be required regarding your account status. We want to work with you to resolve this matter.

**Please Contact Us Immediately:**
We strongly encourage you to reach out to our team so we can discuss this matter and find a resolution:
• Email: {{support_email}}
• Phone: {{support_phone}}
• Client Portal: [Login to your account]

We value your business and remain committed to finding a solution that works for both parties.

Sincerely,
{{company_name}} Billing Team`,
    category: 'dunning',
    dayTrigger: 30,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function EmailCustomizationView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultDunningTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Editor form state
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    body: '',
    dayTrigger: 0,
  });

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      dayTrigger: template.dayTrigger || 0,
    });
    setIsCreating(false);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditForm({
      name: '',
      subject: '',
      body: '',
      dayTrigger: 0,
    });
    setIsCreating(true);
    setShowEditor(true);
  };

  const handleSave = () => {
    if (isCreating) {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: `custom-${Date.now()}`,
        name: editForm.name,
        subject: editForm.subject,
        body: editForm.body,
        category: 'dunning',
        dayTrigger: editForm.dayTrigger,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate].sort((a, b) => (a.dayTrigger || 0) - (b.dayTrigger || 0)));
    } else if (selectedTemplate) {
      // Update existing template
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate.id
            ? {
                ...t,
                name: editForm.name,
                subject: editForm.subject,
                body: editForm.body,
                dayTrigger: editForm.dayTrigger,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    }
    setShowEditor(false);
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      setTemplates(templates.filter((t) => t.id !== selectedTemplate.id));
      setShowDeleteConfirm(false);
      setSelectedTemplate(null);
    }
  };

  const handleReset = () => {
    setTemplates(defaultDunningTemplates);
    setShowResetConfirm(false);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1200px] mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">Email Customization</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage email templates and dunning escalation strategy</p>
              </div>
            </div>
          </div>

          {/* Payment Retry Strategy Link */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-sm mb-6 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)' }}
                >
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-gray-100 mb-1 font-semibold">Payment Retry Strategy</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Configure automatic payment retry attempts and what happens when all retries fail. This works in conjunction with the dunning escalation emails below.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                    <AlertCircle className="w-3 h-3" />
                    <span>Retries happen first, then dunning emails begin after all retries fail</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => window.location.href = '/settings/payment-retry-strategy'}
                className="gap-2 flex-shrink-0"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Configure Retries
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dunning Strategy Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-gray-900 dark:text-gray-100 mb-2">Payment Reminder Strategy (Dunning Escalation)</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automated email reminders sent after payment retries fail and invoice becomes overdue
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>How it works:</strong> These email templates are automatically sent based on days overdue. 
                  Use merge fields like <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">{'{{client_name}}'}</code>, <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">{'{{amount}}'}</code>, 
                  and <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">{'{{invoice_or_subscription}}'}</code> to personalize messages.
                </div>
              </div>
            </div>

            {/* Template Timeline */}
            <div className="p-6">
              <div className="space-y-4">
                {templates
                  .filter((t) => t.category === 'dunning')
                  .sort((a, b) => (a.dayTrigger || 0) - (b.dayTrigger || 0))
                  .map((template, index) => (
                    <div
                      key={template.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                    >
                      {/* Day Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex flex-col items-center justify-center text-white shadow-md">
                          <div className="text-xs opacity-90">Day</div>
                          <div className="text-xl font-semibold">{template.dayTrigger}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {template.subject}
                            </p>
                          </div>
                          {template.isDefault && (
                            <Badge variant="outline" className="flex-shrink-0">
                              Default
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            Preview
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit2 className="w-4 h-4 mr-1.5" />
                            Edit
                          </Button>
                          {!template.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Connector Line */}
                      {index < templates.filter((t) => t.category === 'dunning').length - 1 && (
                        <div className="absolute left-[46px] top-[88px] w-0.5 h-8 bg-gradient-to-b from-purple-300 to-purple-200 dark:from-purple-700 dark:to-purple-800" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Available Merge Fields Reference */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-4">Available Merge Fields</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                '{{client_name}}',
                '{{company_name}}',
                '{{invoice_or_subscription}}',
                '{{invoice_or_subscription_capitalized}}',
                '{{number}}',
                '{{amount}}',
                '{{due_date}}',
                '{{days_overdue}}',
                '{{support_email}}',
                '{{support_phone}}',
              ].map((field) => (
                <code
                  key={field}
                  className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 font-mono"
                >
                  {field}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl" aria-describedby="email-preview-description">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription id="email-preview-description">
              Preview of {selectedTemplate?.name} (Day {selectedTemplate?.dayTrigger})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">Subject Line</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm">{selectedTemplate?.subject}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">Email Body</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans">{selectedTemplate?.body}</pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="email-editor-description">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Template' : 'Edit Template'}</DialogTitle>
            <DialogDescription id="email-editor-description">
              {isCreating ? 'Create a custom email template for your dunning strategy' : `Editing: ${selectedTemplate?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Payment Reminder - Day 5"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="day-trigger">
                  Day Trigger <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="day-trigger"
                  type="number"
                  min="0"
                  value={editForm.dayTrigger}
                  onChange={(e) => setEditForm({ ...editForm, dayTrigger: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 5"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">
                Subject Line <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                placeholder="Use merge fields like {{client_name}} and {{amount}}"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="body">
                Email Body <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="body"
                value={editForm.body}
                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                placeholder="Write your email content here. Use merge fields like {{client_name}}, {{amount}}, {{due_date}}, etc."
                rows={15}
                className="mt-1.5 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editForm.name || !editForm.subject || !editForm.body}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            >
              {isCreating ? 'Create Template' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent aria-describedby="delete-template-description">
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription id="delete-template-description">
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent aria-describedby="reset-template-description">
          <DialogHeader>
            <DialogTitle>Reset to Default Templates?</DialogTitle>
            <DialogDescription id="reset-template-description">
              This will restore all default email templates and remove any custom templates you've created. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            >
              Reset Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}