import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Eye, RotateCcw, AlertCircle, Sparkles, Copy, Plus, Trash2, Calendar, ArrowDown, Edit2, Minus, ChevronRight, ChevronDown, Settings, CheckCircle, XCircle, ArrowRight, Info, Shield, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

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

// Default dunning templates (shared with EmailCustomizationView)
const defaultDunningTemplates: EmailTemplate[] = [
  {
    id: 'dunning-day-7',
    name: 'Payment Retry Failed - Day 7',
    subject: 'Payment Retry Failed: {{invoice_or_subscription}} #{{number}} - Action Required',
    body: `Hello {{client_name}},

We wanted to let you know that we were unable to process payment for your {{invoice_or_subscription}} after multiple automatic retry attempts.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

Our automated retry attempts were unsuccessful. This may be due to insufficient funds, an expired card, or other payment method issues.

**What you can do:**
• Update your payment method in your account settings
• Contact us if you need assistance or have questions
• Make a manual payment through your client portal

If you've already resolved this, please disregard this message. We're here to help if you need anything.

Thank you,
{{company_name}}`,
    category: 'dunning',
    dayTrigger: 7,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-14',
    name: 'Payment Reminder - Day 14',
    subject: 'Payment Reminder: {{invoice_or_subscription}} #{{number}} - 14 Days Overdue',
    body: `Hello {{client_name}},

Your payment for {{invoice_or_subscription}} #{{number}} remains outstanding.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Immediate Action Required:**
To avoid any interruption to your service, please update your billing information or make a payment as soon as possible.

**You can:**
• Log into your account to update payment details
• Contact our billing team for assistance: {{support_email}}
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
    name: 'Urgent - Day 21',
    subject: 'Urgent: Payment Required - {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

Your account requires urgent attention due to an outstanding payment that is now {{days_overdue}} days overdue.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Account Status:**
Continued non-payment may result in service suspension or account restrictions.

**Please Contact Us:**
We encourage you to reach out to our team to discuss this matter:
• Email: {{support_email}}
• Phone: {{support_phone}}

**Update Your Payment Method:**
You can resolve this by logging into your account and updating your billing information.

We appreciate your prompt attention to this matter.

Thank you,
{{company_name}} Billing Team`,
    category: 'dunning',
    dayTrigger: 21,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dunning-day-30',
    name: 'Final Notice - Account Suspended',
    subject: 'Account Suspended - Payment Required for {{invoice_or_subscription}} #{{number}}',
    body: `Hello {{client_name}},

Your account has been suspended due to non-payment. This {{invoice_or_subscription}} is now {{days_overdue}} days overdue.

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Account Status: SUSPENDED**

To reactivate your services, please update your payment method or contact our billing team.

If you're experiencing financial difficulty, please contact us immediately to discuss payment options:
• Email: {{support_email}}
• Phone: {{support_phone}}

{{company_name}}`,
    category: 'dunning',
    dayTrigger: 30,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function PaymentReminderStrategyView() {
  const navigate = useNavigate();
  
  // Default retry settings (should match PaymentRetryStrategyView defaults)
  const [retrySettings] = useState({
    retry1Days: 1,
    retry2Days: 3,
    retry3Days: 7,
  });
  
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultDunningTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newTemplateDay, setNewTemplateDay] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [quickEditTemplate, setQuickEditTemplate] = useState<EmailTemplate | null>(null);
  const [quickEditDay, setQuickEditDay] = useState('');
  const [dayEditError, setDayEditError] = useState('');
  const [isEditingBadge, setIsEditingBadge] = useState(false);
  const [badgeEditValue, setBadgeEditValue] = useState('');
  const [isMergeFieldsOpen, setIsMergeFieldsOpen] = useState(false);

  // Final status settings
  const [finalStatus, setFinalStatus] = useState<'collections' | 'write-off' | 'cancel' | 'suspend' | 'keep-active'>('keep-active');

  // Refs for textarea cursor position
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);

  // Editor form state
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    body: '',
    dayTrigger: 0,
  });

  // Merge field definitions with categories and colors
  const mergeFields = [
    { field: '{{client_name}}', label: 'Client Name', category: 'Client', color: 'emerald' },
    { field: '{{invoice_or_subscription}}', label: 'Type (lower)', category: 'Document', color: 'purple' },
    { field: '{{invoice_or_subscription_capitalized}}', label: 'Type (upper)', category: 'Document', color: 'purple' },
    { field: '{{number}}', label: 'Number', category: 'Document', color: 'purple' },
    { field: '{{amount}}', label: 'Amount', category: 'Payment', color: 'amber' },
    { field: '{{due_date}}', label: 'Due Date', category: 'Payment', color: 'amber' },
    { field: '{{days_overdue}}', label: 'Days Overdue', category: 'Payment', color: 'amber' },
    { field: '{{company_name}}', label: 'Company', category: 'Company', color: 'blue' },
    { field: '{{support_email}}', label: 'Email', category: 'Company', color: 'blue' },
    { field: '{{support_phone}}', label: 'Phone', category: 'Company', color: 'blue' },
  ];

  // Mock preview data - dynamically updates based on current template
  const previewData = {
    client_name: 'John Smith',
    invoice_or_subscription: 'invoice',
    invoice_or_subscription_capitalized: 'Invoice',
    number: 'INV-2024-001',
    amount: '$1,250.00',
    due_date: 'December 1, 2024',
    days_overdue: String(editForm.dayTrigger || 0),
    company_name: 'Acme Corp',
    support_email: 'support@acmecorp.com',
    support_phone: '(555) 123-4567',
  };

  const replaceVariables = (text: string): string => {
    let result = text;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    
    // Convert **text** to bold HTML
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return result;
  };

  const handleTemplateClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      dayTrigger: template.dayTrigger || 0,
    });
  };

  const handleSave = () => {
    if (!selectedTemplate) return;

    // Validation - all fields required
    if (!editForm.name.trim() || !editForm.subject.trim() || !editForm.body.trim()) {
      return; // Don't save if any required field is empty
    }

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
    setSelectedTemplate(null);
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
  };

  const handleResetToDefaults = () => {
    setTemplates(defaultDunningTemplates);
    setSelectedTemplate(null);
    setShowResetConfirm(false);
  };

  // Insert merge field at cursor position
  const insertMergeField = (field: string, target: 'subject' | 'body') => {
    const ref = target === 'subject' ? subjectRef : bodyRef;
    if (!ref.current) return;

    const start = ref.current.selectionStart || 0;
    const end = ref.current.selectionEnd || 0;
    const currentValue = target === 'subject' ? editForm.subject : editForm.body;

    const newValue =
      currentValue.substring(0, start) +
      field +
      currentValue.substring(end);

    if (target === 'subject') {
      setEditForm({ ...editForm, subject: newValue });
    } else {
      setEditForm({ ...editForm, body: newValue });
    }

    // Set cursor position after the inserted field
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(start + field.length, start + field.length);
      }
    }, 0);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-300 dark:border-emerald-700',
        text: 'text-emerald-700 dark:text-emerald-300',
        hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-300 dark:border-purple-700',
        text: 'text-purple-700 dark:text-purple-300',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-300 dark:border-amber-700',
        text: 'text-amber-700 dark:text-amber-300',
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-300 dark:border-blue-700',
        text: 'text-blue-700 dark:text-blue-300',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      },
    };
    return colors[color] || colors.blue;
  };

  // Split screen view when template is selected
  if (selectedTemplate) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Colorful Header */}
        <div 
          className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, var(--primaryColor) 0%, #7C3AED 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </Button>
              <div className="h-6 w-px bg-white/30" />
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {selectedTemplate.name}
                </h1>
                <p className="text-xs text-white/80">
                  Day {selectedTemplate.dayTrigger} Email Template
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Split Screen Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor */}
          <div className="flex-1 overflow-y-auto border-r-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-900/10">
            <div className="p-6 space-y-6">
              {/* Template Name */}
              <div>
                <Label htmlFor="template-name" className="text-gray-900 dark:text-gray-100 font-medium">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1.5 border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Days Overdue */}
              <div>
                <Label className="text-gray-900 dark:text-gray-100 font-medium">
                  Days Overdue <span className="text-red-500">*</span>
                </Label>
                
                {/* Visual Counter with +/- Controls */}
                <div className="mt-1.5 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    {/* Minus Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newDay = Math.max(0, editForm.dayTrigger - 1);
                        
                        const isDuplicate = templates.some(
                          (t) => t.id !== selectedTemplate?.id && t.dayTrigger === newDay
                        );
                        
                        if (isDuplicate) {
                          setDayEditError(`Day ${newDay} already exists. Please choose a different day.`);
                          return;
                        }
                        
                        setDayEditError('');
                        
                        const oldDay = editForm.dayTrigger;
                        let newName = editForm.name;
                        let newSubject = editForm.subject;
                        
                        // More robust replacement using regex to avoid partial matches
                        newName = newName.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                        newName = newName.replace(new RegExp(`- Day ${oldDay}(?!\\d)`, 'g'), `- Day ${newDay}`);
                        
                        newSubject = newSubject.replace(new RegExp(`${oldDay} Days Overdue`, 'g'), `${newDay} Days Overdue`);
                        newSubject = newSubject.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                        
                        setEditForm({
                          ...editForm,
                          dayTrigger: newDay,
                          name: newName,
                          subject: newSubject,
                        });
                      }}
                      disabled={editForm.dayTrigger <= 0}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
                      style={{
                        background: editForm.dayTrigger <= 0 
                          ? '#9CA3AF' 
                          : 'linear-gradient(135deg, #EF4444, #DC2626)',
                      }}
                    >
                      <Minus className="w-5 h-5 text-white" />
                    </button>

                    {/* Day Badge */}
                    {isEditingBadge ? (
                      <div 
                        className="w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white shadow-lg border-2 border-white relative"
                        style={{
                          background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)',
                        }}
                      >
                        <div className="text-[10px] opacity-90 uppercase tracking-wide">
                          Day
                        </div>
                        <Input
                          ref={badgeInputRef}
                          type="number"
                          min="0"
                          max="365"
                          value={badgeEditValue}
                          onChange={(e) => setBadgeEditValue(e.target.value)}
                          onBlur={() => {
                            const newDay = parseInt(badgeEditValue) || 0;
                            
                            const isDuplicate = templates.some(
                              (t) => t.id !== selectedTemplate?.id && t.dayTrigger === newDay
                            );
                            
                            if (isDuplicate) {
                              setDayEditError(`Day ${newDay} already exists. Please choose a different day.`);
                              setBadgeEditValue(String(editForm.dayTrigger));
                              setIsEditingBadge(false);
                              return;
                            }
                            
                            setDayEditError('');
                            
                            const oldDay = editForm.dayTrigger;
                            let newName = editForm.name;
                            let newSubject = editForm.subject;
                            
                            // More robust replacement using regex to avoid partial matches
                            newName = newName.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                            newName = newName.replace(new RegExp(`- Day ${oldDay}(?!\\d)`, 'g'), `- Day ${newDay}`);
                            
                            newSubject = newSubject.replace(new RegExp(`${oldDay} Days Overdue`, 'g'), `${newDay} Days Overdue`);
                            newSubject = newSubject.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                            
                            setEditForm({
                              ...editForm,
                              dayTrigger: newDay,
                              name: newName,
                              subject: newSubject,
                            });
                            
                            setIsEditingBadge(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              badgeInputRef.current?.blur();
                            } else if (e.key === 'Escape') {
                              setBadgeEditValue(String(editForm.dayTrigger));
                              setIsEditingBadge(false);
                            }
                          }}
                          className="w-14 h-10 text-center text-2xl font-bold bg-white/20 border-white/50 text-white placeholder:text-white/50 p-0"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingBadge(true);
                          setBadgeEditValue(String(editForm.dayTrigger));
                          setTimeout(() => badgeInputRef.current?.select(), 0);
                        }}
                        className="w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white shadow-lg hover:scale-105 transition-all group/edit relative"
                        style={{
                          background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)',
                        }}
                        title="Click to edit day"
                      >
                        <div className="text-[10px] opacity-90 uppercase tracking-wide">
                          Day
                        </div>
                        <div className="text-3xl font-bold">
                          {editForm.dayTrigger}
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover/edit:bg-white/10 transition-colors flex items-center justify-center opacity-0 group-hover/edit:opacity-100">
                          <Edit2 className="w-4 h-4" />
                        </div>
                      </button>
                    )}

                    {/* Plus Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newDay = Math.min(365, editForm.dayTrigger + 1);
                        
                        const isDuplicate = templates.some(
                          (t) => t.id !== selectedTemplate?.id && t.dayTrigger === newDay
                        );
                        
                        if (isDuplicate) {
                          setDayEditError(`Day ${newDay} already exists. Please choose a different day.`);
                          return;
                        }
                        
                        setDayEditError('');
                        
                        const oldDay = editForm.dayTrigger;
                        let newName = editForm.name;
                        let newSubject = editForm.subject;
                        
                        // More robust replacement using regex to avoid partial matches
                        newName = newName.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                        newName = newName.replace(new RegExp(`- Day ${oldDay}(?!\\d)`, 'g'), `- Day ${newDay}`);
                        
                        newSubject = newSubject.replace(new RegExp(`${oldDay} Days Overdue`, 'g'), `${newDay} Days Overdue`);
                        newSubject = newSubject.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                        
                        setEditForm({
                          ...editForm,
                          dayTrigger: newDay,
                          name: newName,
                          subject: newSubject,
                        });
                      }}
                      disabled={editForm.dayTrigger >= 365}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
                      style={{
                        background: editForm.dayTrigger >= 365 
                          ? '#9CA3AF' 
                          : 'linear-gradient(135deg, #10B981, #059669)',
                      }}
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editForm.dayTrigger === 0 ? 'Due Date' : `${editForm.dayTrigger} Day${editForm.dayTrigger === 1 ? '' : 's'} Overdue`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Sent {editForm.dayTrigger === 0 ? 'on due date' : `${editForm.dayTrigger} day${editForm.dayTrigger === 1 ? '' : 's'} after`}
                      </div>
                    </div>
                  </div>
                </div>
                
                {dayEditError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {dayEditError}
                  </p>
                )}
              </div>

              {/* Email Subject */}
              <div>
                <Label htmlFor="template-subject" className="text-gray-900 dark:text-gray-100 font-medium">
                  Email Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={subjectRef}
                  id="template-subject"
                  value={editForm.subject}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subject: e.target.value })
                  }
                  className="mt-1.5 border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                  placeholder="Use merge fields like {{client_name}}"
                  required
                />
              </div>

              {/* Email Body */}
              <div>
                <Label htmlFor="template-body" className="text-gray-900 dark:text-gray-100 font-medium">
                  Email Body <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  ref={bodyRef}
                  id="template-body"
                  value={editForm.body}
                  onChange={(e) =>
                    setEditForm({ ...editForm, body: e.target.value })
                  }
                  className="mt-1.5 min-h-[300px] font-mono text-sm border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                  placeholder="Use merge fields like {{client_name}}, {{amount}}, {{due_date}}"
                  required
                />
              </div>

              {/* Clickable Merge Fields - Collapsible */}
              <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsMergeFieldsOpen(!isMergeFieldsOpen)}
                  className="w-full p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 items-center">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold text-purple-900 dark:text-purple-100">
                          Merge Fields - Click to Insert
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                          {isMergeFieldsOpen ? 'Click any field to insert it at your cursor position' : 'Click to view available merge fields'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-purple-600 dark:text-purple-400 transition-transform flex-shrink-0 ${
                        isMergeFieldsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {isMergeFieldsOpen && (
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t-2 border-purple-200 dark:border-purple-800">
                    {/* Grouped by category */}
                    <div className="space-y-3">
                      {['Client', 'Document', 'Payment', 'Company'].map((category) => {
                        const categoryFields = mergeFields.filter((f) => f.category === category);
                        if (categoryFields.length === 0) return null;

                        return (
                          <div key={category}>
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                              {category}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {categoryFields.map((field) => {
                                const colors = getColorClasses(field.color);
                                return (
                                  <button
                                    key={field.field}
                                    onClick={() => insertMergeField(field.field, 'body')}
                                    className={`group relative px-3 py-2 rounded-lg border-2 transition-all cursor-pointer text-xs font-medium ${colors.bg} ${colors.border} ${colors.text} ${colors.hover} hover:scale-105 hover:shadow-md`}
                                    title={`Click to insert ${field.label}`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Plus className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                                      <code className="font-mono">{field.field}</code>
                                    </div>
                                    <div className="text-[10px] opacity-75 mt-0.5">
                                      {field.label}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Save and Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-purple-200 dark:border-purple-800">
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={handleCancel}
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  size="default"
                  onClick={handleSave}
                  disabled={!editForm.name.trim() || !editForm.subject.trim() || !editForm.body.trim()}
                  className="min-w-[120px]"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="p-6">
              {/* Preview Header */}
              <div className="mb-6 pb-4 border-b-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    Live Email Preview
                  </h2>
                  <Badge 
                    className="ml-auto"
                    style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
                  >
                    Updates in Real-Time
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-10">
                  See how your email will look to clients with sample data
                </p>
              </div>

              {/* Email Preview Card */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                {/* Email Header */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 px-5 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Subject:
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {editForm.subject ? (
                      <span dangerouslySetInnerHTML={{ __html: replaceVariables(editForm.subject) }} />
                    ) : (
                      <span className="text-gray-400 italic">No subject entered</span>
                    )}
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 bg-white dark:bg-gray-800">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {editForm.body ? (
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          lineHeight: '1.6',
                        }}
                        className="text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: replaceVariables(editForm.body) }}
                      />
                    ) : (
                      <span className="text-gray-400 italic">No content entered</span>
                    )}
                  </div>
                </div>

                {/* Email Footer - Sample */}
                <div className="bg-gray-50 dark:bg-gray-900/30 px-5 py-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    This is a preview with sample data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default view: Template timeline cards
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/subscriptions')}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Subscriptions
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/subscription-settings')}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2"
          >
            Billing Settings
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Subscription Payment Settings
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Subscription Payment Strategy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automated emails sent after payment retries fail (subscriptions with payment method)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddNew(true)}
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Plus className="w-4 h-4" />
              Add New Reminder
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-100">
              <strong>How it works:</strong> These email templates are automatically sent based on days overdue. Click any template card to edit it, customize the timing (days), or delete it. You can also add new reminders for any day you choose. Use merge fields like{' '}
              <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                {'{{client_name}}'}
              </code>
              ,{' '}
              <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                {'{{amount}}'}
              </code>
              , and{' '}
              <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                {'{{invoice_or_subscription}}'}
              </code>{' '}
              to personalize messages.
            </div>
          </div>
        </div>

        {/* When This Applies Banner */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border-b border-purple-200 dark:border-purple-800">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                When This Strategy Applies
              </h3>
              <p className="text-xs text-purple-800 dark:text-purple-200">
                This reminder strategy is used for <strong>subscriptions with payment methods on file</strong>. After automatic payment retries are exhausted (typically by Day 7), these email reminders begin to notify the customer of the failed payment.
              </p>
              <p className="text-xs text-purple-800 dark:text-purple-200 mt-2">
                For invoices or subscriptions without payment methods, use the{' '}
                <button
                  onClick={() => navigate('/invoice-reminder-strategy')}
                  className="font-semibold underline hover:text-purple-600 dark:hover:text-purple-300"
                >
                  Invoice Reminder Strategy
                </button>
                {' '}instead.
              </p>
            </div>
          </div>
        </div>

        {/* Template Timeline */}
        <div className="p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Retry Schedule Info Banner - Shows BEFORE Day 7 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Payment Retry Period (Days 0-7)
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        System automatically retries failed payments on Days 1, 3, and 7 before email reminders begin
                      </p>
                    </div>
                  </div>

                  {/* Timeline visualization in ONE box */}
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Automatic Retry Schedule
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Day 0 - Initial Failure */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Fails</div>
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-sm">
                          <div className="text-center">
                            <div className="text-xs opacity-90">Day</div>
                            <div className="text-lg font-bold">0</div>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                      {/* Retry 1 */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">1st Retry</div>
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                          <div className="text-center">
                            <div className="text-xs opacity-90">Day</div>
                            <div className="text-lg font-bold">{retrySettings.retry1Days}</div>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                      {/* Retry 2 */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">2nd Retry</div>
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                          <div className="text-center">
                            <div className="text-xs opacity-90">Day</div>
                            <div className="text-lg font-bold">{retrySettings.retry2Days}</div>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                      {/* Retry 3 */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">3rd Retry</div>
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                          <div className="text-center">
                            <div className="text-xs opacity-90">Day</div>
                            <div className="text-lg font-bold">{retrySettings.retry3Days}</div>
                          </div>
                        </div>
                      </div>

                      {/* Split paths - Success (top) and Failure (bottom) */}
                      <div className="flex flex-col gap-2 ml-2">
                        {/* Success path */}
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center shadow-sm text-white">
                            <CheckCircle className="w-5 h-5" />
                            <div className="text-[9px] font-semibold mt-0.5">Success</div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <div className="px-3 py-1.5 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <div className="text-xs font-semibold text-green-800 dark:text-green-300">Current</div>
                          </div>
                        </div>
                        
                        {/* Failure path */}
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center shadow-sm text-white">
                            <XCircle className="w-5 h-5" />
                            <div className="text-[9px] font-semibold mt-0.5">Fail</div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <div className="px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                            <div className="text-xs font-semibold text-red-800 dark:text-red-300">Email Reminders</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanation text */}
                    <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>If payment succeeds:</strong> Subscription returns to &quot;Current&quot; status. No reminder emails sent.</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <span><strong>If all retries fail:</strong> Email reminder sequence begins (Day 7 below).</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Down arrow after banner */}
            <div className="flex justify-center items-center py-2">
              <div className="flex flex-col items-center">
                <ArrowDown 
                  className="w-6 h-6 text-purple-400 dark:text-purple-600 animate-bounce" 
                  style={{ animationDuration: '2s' }}
                />
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                  Email Reminders Begin
                </div>
              </div>
            </div>

            {/* Template Cards */}
            {templates
              .filter((t) => t.category === 'dunning')
              .sort((a, b) => (a.dayTrigger || 0) - (b.dayTrigger || 0))
              .map((template, index, arr) => (
                <div key={template.id} className="relative">
                  <div
                    onClick={() => handleTemplateClick(template)}
                    className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:shadow-md group hover:border-red-300 dark:hover:border-red-600"
                  >
                    {/* Day Badge */}
                    <div className="flex-shrink-0 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickEditTemplate(template);
                          setQuickEditDay(String(template.dayTrigger || 0));
                          setDayEditError('');
                        }}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all relative group/badge"
                        style={{
                          background: `linear-gradient(135deg, #EF4444, ${
                            index % 2 === 0 ? '#DC2626' : '#B91C1C'
                          })`,
                        }}
                        title="Click to change day"
                      >
                        <div className="text-xs opacity-90 uppercase tracking-wide">
                          Day
                        </div>
                        <div className="text-2xl font-bold">
                          {template.dayTrigger}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-white/0 group-hover/badge:bg-white/10 transition-colors flex items-center justify-center opacity-0 group-hover/badge:opacity-100">
                          <Edit2 className="w-4 h-4" />
                        </div>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-1 transition-colors group-hover:text-red-600 dark:group-hover:text-red-400">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Subject: {template.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {template.isDefault && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                            >
                              Default
                            </Badge>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTemplateToDelete(template);
                            }}
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border border-transparent hover:border-red-300 dark:hover:border-red-700"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {template.body.split('\n').slice(0, 2).join(' ')}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400">
                        Click to edit template →
                      </div>
                    </div>
                  </div>

                  {/* Arrow connector between cards */}
                  {index < arr.length - 1 && (
                    <div className="flex justify-center items-center py-2">
                      <div className="flex flex-col items-center">
                        <ArrowDown 
                          className="w-6 h-6 text-purple-400 dark:text-purple-600 animate-bounce" 
                          style={{ animationDuration: '2s' }}
                        />
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                          Escalation
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Final Status Card - Cannot be deleted */}
            <div className="mt-8">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-md">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Final Status Action
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      After the last enabled reminder on <strong>Day {templates.filter(t => t.category === 'dunning').reduce((max, t) => Math.max(max, t.dayTrigger || 0), 0)}</strong>, the following action will be applied:
                    </p>
                    {templates.filter(t => t.category === 'dunning').length === 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>No email reminders are enabled. Set the day to apply final status:</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Status Options - Visual Clickable Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    type="button"
                    onClick={() => setFinalStatus('collections')}
                    className={`p-4 rounded-lg border-2 transition-all min-h-[140px] ${
                      finalStatus === 'collections'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 h-full justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        finalStatus === 'collections'
                          ? 'bg-red-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          finalStatus === 'collections'
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          finalStatus === 'collections'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          Send to Collections
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 transition-opacity ${
                        finalStatus === 'collections'
                          ? 'opacity-100 text-red-600 dark:text-red-400'
                          : 'opacity-0'
                      }`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalStatus('write-off')}
                    className={`p-4 rounded-lg border-2 transition-all min-h-[140px] ${
                      finalStatus === 'write-off'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 h-full justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        finalStatus === 'write-off'
                          ? 'bg-orange-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <XCircle className={`w-5 h-5 ${
                          finalStatus === 'write-off'
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          finalStatus === 'write-off'
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          Write Off
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 transition-opacity ${
                        finalStatus === 'write-off'
                          ? 'opacity-100 text-orange-600 dark:text-orange-400'
                          : 'opacity-0'
                      }`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalStatus('cancel')}
                    className={`p-4 rounded-lg border-2 transition-all min-h-[140px] ${
                      finalStatus === 'cancel'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 h-full justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        finalStatus === 'cancel'
                          ? 'bg-purple-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <XCircle className={`w-5 h-5 ${
                          finalStatus === 'cancel'
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          finalStatus === 'cancel'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          Cancel Subscription
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 transition-opacity ${
                        finalStatus === 'cancel'
                          ? 'opacity-100 text-purple-600 dark:text-purple-400'
                          : 'opacity-0'
                      }`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalStatus('suspend')}
                    className={`p-4 rounded-lg border-2 transition-all min-h-[140px] ${
                      finalStatus === 'suspend'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 h-full justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        finalStatus === 'suspend'
                          ? 'bg-yellow-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ${
                          finalStatus === 'suspend'
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          finalStatus === 'suspend'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          Suspend Service
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 transition-opacity ${
                        finalStatus === 'suspend'
                          ? 'opacity-100 text-yellow-600 dark:text-yellow-400'
                          : 'opacity-0'
                      }`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalStatus('keep-active')}
                    className={`p-4 rounded-lg border-2 transition-all min-h-[140px] ${
                      finalStatus === 'keep-active'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 h-full justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        finalStatus === 'keep-active'
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${
                          finalStatus === 'keep-active'
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          finalStatus === 'keep-active'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          Keep Active
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          No Action
                        </div>
                      </div>
                      <CheckCircle className={`w-5 h-5 transition-opacity ${
                        finalStatus === 'keep-active'
                          ? 'opacity-100 text-green-600 dark:text-green-400'
                          : 'opacity-0'
                      }`} />
                    </div>
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>This final action cannot be deleted and will automatically execute after the last enabled reminder. You can change which action is applied, but this step will always occur.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent aria-describedby="reset-payment-reminder-description">
          <DialogHeader>
            <DialogTitle>Reset to Default Templates?</DialogTitle>
            <DialogDescription id="reset-payment-reminder-description">
              This will restore all email templates to their default content. Any customizations you have made will be lost. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetToDefaults}
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Reminder Dialog */}
      <Dialog open={showAddNew} onOpenChange={(open) => {
        setShowAddNew(open);
        if (!open) setNewTemplateDay('');
      }}>
        <DialogContent aria-describedby="add-payment-reminder-description">
          <DialogHeader>
            <DialogTitle>Add New Payment Reminder</DialogTitle>
            <DialogDescription id="add-payment-reminder-description">
              Create a custom reminder email that will be automatically sent after a specific number of days overdue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-day-trigger" className="font-medium">
                Days Overdue <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-day-trigger"
                type="number"
                min="0"
                max="365"
                value={newTemplateDay}
                onChange={(e) => setNewTemplateDay(e.target.value)}
                placeholder="e.g., 7, 15, 45"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the number of days after the due date to send this reminder
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddNew(false);
                setNewTemplateDay('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!newTemplateDay || parseInt(newTemplateDay) < 0}
              onClick={() => {
                const dayValue = parseInt(newTemplateDay);
                const newTemplate: EmailTemplate = {
                  id: `dunning-day-${dayValue}-${Date.now()}`,
                  name: `Payment Reminder - Day ${dayValue}`,
                  subject: `Payment Reminder: {{invoice_or_subscription}} #{{number}} - ${dayValue} Days Overdue`,
                  body: `Hello {{client_name}},

[Add your custom message here - explain why you're reaching out and what action they should take]

**Payment Details:**
{{invoice_or_subscription_capitalized}} #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**What you can do:**
• Update your payment method in your account settings
• Contact us if you need assistance or have questions: {{support_email}} or {{support_phone}}
• Make a manual payment through your client portal

If you've already sent payment, please disregard this message.

Thank you,
{{company_name}}`,
                  category: 'dunning',
                  dayTrigger: dayValue,
                  isDefault: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setTemplates([...templates, newTemplate]);
                setShowAddNew(false);
                setNewTemplateDay('');
                // Auto-edit the new template
                setSelectedTemplate(newTemplate);
                setEditForm({
                  name: newTemplate.name,
                  subject: newTemplate.subject,
                  body: newTemplate.body,
                  dayTrigger: newTemplate.dayTrigger || 0,
                });
              }}
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!templateToDelete} onOpenChange={(open) => {
        if (!open) setTemplateToDelete(null);
      }}>
        <DialogContent aria-describedby="delete-payment-reminder-description">
          <DialogHeader>
            <DialogTitle>Delete Payment Reminder?</DialogTitle>
            <DialogDescription id="delete-payment-reminder-description">
              {templateToDelete?.isDefault ? (
                <>
                  Are you sure you want to delete this default template? You can always restore it using the &quot;Reset to Defaults&quot; button.
                </>
              ) : (
                <>
                  Are you sure you want to delete this custom reminder? This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex flex-col items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)',
                  }}
                >
                  <div className="text-[10px] opacity-90 uppercase">Day</div>
                  <div className="text-lg font-bold">{templateToDelete?.dayTrigger}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {templateToDelete?.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {templateToDelete?.subject}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (templateToDelete) {
                  setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
                  setTemplateToDelete(null);
                }
              }}
            >
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Edit Day Dialog */}
      <Dialog open={!!quickEditTemplate} onOpenChange={(open) => {
        if (!open) {
          setQuickEditTemplate(null);
          setQuickEditDay('');
          setDayEditError('');
        }
      }}>
        <DialogContent aria-describedby="change-reminder-day-description">
          <DialogHeader>
            <DialogTitle>Change Reminder Day</DialogTitle>
            <DialogDescription id="change-reminder-day-description">
              Update when this reminder email should be sent. The template name and subject will automatically update to reflect the new day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quick-edit-day" className="font-medium">
                Days Overdue <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="quick-edit-day"
                  type="number"
                  min="0"
                  max="365"
                  value={quickEditDay}
                  onChange={(e) => {
                    setQuickEditDay(e.target.value);
                    const newDay = parseInt(e.target.value);
                    if (newDay >= 0) {
                      // Check for duplicates
                      const isDuplicate = templates.some(
                        (t) => t.id !== quickEditTemplate?.id && t.dayTrigger === newDay
                      );
                      if (isDuplicate) {
                        setDayEditError(`Day ${newDay} already exists. Please choose a different day.`);
                      } else {
                        setDayEditError('');
                      }
                    }
                  }}
                  className="pl-10"
                  placeholder="e.g., 0, 7, 14, 30"
                  autoFocus
                />
              </div>
              {dayEditError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dayEditError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email will be sent this many days after payment is due
              </p>
            </div>

            {/* Preview of what will change */}
            {quickEditTemplate && quickEditDay && !dayEditError && parseInt(quickEditDay) >= 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Preview of Changes:
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Template Name:</span>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {quickEditTemplate.name.replace(
                        `Day ${quickEditTemplate.dayTrigger}`,
                        `Day ${parseInt(quickEditDay)}`
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email Subject:</span>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {quickEditTemplate.subject
                        .replace(
                          `${quickEditTemplate.dayTrigger} Days Overdue`,
                          `${parseInt(quickEditDay)} Days Overdue`
                        )
                        .replace(
                          `Day ${quickEditTemplate.dayTrigger}`,
                          `Day ${parseInt(quickEditDay)}`
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQuickEditTemplate(null);
                setQuickEditDay('');
                setDayEditError('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!quickEditDay || parseInt(quickEditDay) < 0 || !!dayEditError}
              onClick={() => {
                if (!quickEditTemplate) return;
                
                const newDay = parseInt(quickEditDay);
                const oldDay = quickEditTemplate.dayTrigger || 0;
                
                // Auto-update name and subject
                let newName = quickEditTemplate.name;
                let newSubject = quickEditTemplate.subject;
                
                // Update name
                if (newName.includes(`Day ${oldDay}`)) {
                  newName = newName.replace(`Day ${oldDay}`, `Day ${newDay}`);
                } else if (newName.includes(`- Day ${oldDay}`)) {
                  newName = newName.replace(`- Day ${oldDay}`, `- Day ${newDay}`);
                }
                
                // Update subject
                if (newSubject.includes(`${oldDay} Days Overdue`)) {
                  newSubject = newSubject.replace(`${oldDay} Days Overdue`, `${newDay} Days Overdue`);
                } else if (newSubject.includes(`Day ${oldDay}`)) {
                  newSubject = newSubject.replace(`Day ${oldDay}`, `Day ${newDay}`);
                }
                
                // Update the template
                setTemplates(
                  templates.map((t) =>
                    t.id === quickEditTemplate.id
                      ? {
                          ...t,
                          dayTrigger: newDay,
                          name: newName,
                          subject: newSubject,
                          updatedAt: new Date().toISOString(),
                        }
                      : t
                  )
                );
                
                setQuickEditTemplate(null);
                setQuickEditDay('');
                setDayEditError('');
              }}
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              Update Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
