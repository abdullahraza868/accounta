import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Eye, RotateCcw, AlertCircle, Sparkles, Copy, Plus, Trash2, Calendar, ArrowDown, Edit2, Minus, ChevronRight, ChevronDown, Info, FileText, Shield, DollarSign, CheckCircle, XCircle } from 'lucide-react';
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

type InvoiceReminderTemplate = {
  id: string;
  name: string;
  dayTrigger: number | 'before-due'; // negative for before due date
  subject: string;
  body: string;
  daysBeforeDue?: number; // for "before due" reminder
  finalStatus?: 'none' | 'suspend' | 'collections' | 'write-off';
};

const defaultTemplates: InvoiceReminderTemplate[] = [
  {
    id: 'before-due',
    name: 'Payment Due Soon',
    dayTrigger: 'before-due',
    daysBeforeDue: 3,
    subject: 'Reminder: Invoice #{{number}} Due in {{days_until_due}} Days',
    body: `Hello {{client_name}},

This is a friendly reminder that your invoice payment is due soon.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Due Date: {{due_date}}
Days Until Due: {{days_until_due}}

You can view and pay your invoice by logging into your client portal or clicking the link below.

Thank you for your business!

Best regards,
{{company_name}}`,
  },
  {
    id: 'due-date',
    name: 'Payment Due Today',
    dayTrigger: 0,
    subject: 'Payment Due Today: Invoice #{{number}}',
    body: `Hello {{client_name}},

This is a reminder that your invoice payment is due today.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Due Date: {{due_date}}

Please submit payment at your earliest convenience. You can pay through your client portal or contact us for payment options.

If you've already sent payment, please disregard this message.

Thank you,
{{company_name}}`,
  },
  {
    id: 'overdue-1',
    name: 'Overdue Reminder 1',
    dayTrigger: 7,
    subject: 'Overdue: Invoice #{{number}} - 7 Days Past Due',
    body: `Hello {{client_name}},

We wanted to let you know that we haven't received payment for your invoice.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

This may have been an oversight. Please submit payment as soon as possible to avoid any late fees or service interruptions.

If you have any questions or need to discuss payment arrangements, please contact us.

Thank you,
{{company_name}}`,
  },
  {
    id: 'overdue-2',
    name: 'Overdue Reminder 2',
    dayTrigger: 14,
    subject: 'Action Required: Invoice #{{number}} - 14 Days Past Due',
    body: `Hello {{client_name}},

Your invoice payment remains outstanding and is now {{days_overdue}} days past due.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Immediate action is required to avoid:**
• Late fees being applied
• Service suspension
• Account restrictions

Please submit payment immediately or contact us to discuss payment arrangements.

Best regards,
{{company_name}}`,
  },
  {
    id: 'overdue-2.5',
    name: 'Overdue Reminder 3',
    dayTrigger: 21,
    subject: 'Urgent: Invoice #{{number}} - 21 Days Past Due',
    body: `Hello {{client_name}},

Your invoice payment is now {{days_overdue}} days past due and requires urgent attention.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Account Status:**
Continued non-payment may result in service suspension or account restrictions.

Please submit payment immediately or contact us to discuss this matter.

Thank you,
{{company_name}} Billing Team`,
  },
  {
    id: 'overdue-4',
    name: 'Final Notice - Account Suspended',
    dayTrigger: 30,
    subject: 'Account Suspended - Payment Required for Invoice #{{number}}',
    body: `Hello {{client_name}},

Your account has been suspended due to non-payment. This invoice is now {{days_overdue}} days overdue.

**Invoice Details:**
Invoice #{{number}}
Amount Due: {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

**Account Status: SUSPENDED**

To reactivate your services, please update your payment method or contact our billing team.

If you're experiencing financial difficulty, please contact us immediately to discuss payment options.

{{company_name}}`,
    finalStatus: 'write-off',
  },
];

export function InvoiceReminderStrategyView() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<InvoiceReminderTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceReminderTemplate | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<InvoiceReminderTemplate | null>(null);
  const [quickEditTemplate, setQuickEditTemplate] = useState<InvoiceReminderTemplate | null>(null);
  const [quickEditDay, setQuickEditDay] = useState<string>('');
  const [dayEditError, setDayEditError] = useState('');
  const [isEditingBadge, setIsEditingBadge] = useState(false);
  const [badgeEditValue, setBadgeEditValue] = useState('');
  const [isMergeFieldsOpen, setIsMergeFieldsOpen] = useState(false);

  // Final status settings
  const [finalStatus, setFinalStatus] = useState<'collections' | 'write-off' | 'suspend' | 'keep-active'>('suspend');
  
  // Refs for textarea cursor position
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);
  
  // Editor form state
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    body: '',
    dayTrigger: 0 as number | 'before-due',
    daysBeforeDue: 3,
    finalStatus: 'none' as 'none' | 'suspend' | 'collections' | 'write-off',
  });

  // Merge field definitions with categories and colors
  const mergeFields = [
    { field: '{{client_name}}', label: 'Client Name', category: 'Client', color: 'emerald' },
    { field: '{{number}}', label: 'Invoice Number', category: 'Invoice', color: 'purple' },
    { field: '{{amount}}', label: 'Amount Due', category: 'Payment', color: 'amber' },
    { field: '{{due_date}}', label: 'Due Date', category: 'Payment', color: 'amber' },
    { field: '{{days_overdue}}', label: 'Days Overdue', category: 'Payment', color: 'amber' },
    { field: '{{days_until_due}}', label: 'Days Until Due', category: 'Payment', color: 'amber' },
    { field: '{{company_name}}', label: 'Company Name', category: 'Company', color: 'blue' },
    { field: '{{support_email}}', label: 'Support Email', category: 'Company', color: 'blue' },
    { field: '{{support_phone}}', label: 'Support Phone', category: 'Company', color: 'blue' },
  ];

  // Mock preview data - dynamically updates based on current template
  const previewData = {
    client_name: 'John Smith',
    number: 'INV-2024-001',
    amount: '$1,250.00',
    due_date: 'December 15, 2024',
    days_overdue: editForm.dayTrigger === 'before-due' ? '0' : String(editForm.dayTrigger),
    days_until_due: editForm.dayTrigger === 'before-due' ? String(editForm.daysBeforeDue) : '0',
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

  const handleTemplateClick = (template: InvoiceReminderTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      dayTrigger: template.dayTrigger,
      daysBeforeDue: template.daysBeforeDue || 3,
      finalStatus: template.finalStatus || 'none',
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
              daysBeforeDue: editForm.daysBeforeDue,
              finalStatus: editForm.finalStatus,
            }
          : t
      )
    );
    setSelectedTemplate(null);
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
    setTemplateToDelete(null);
  };

  const handleResetToDefaults = () => {
    setTemplates(defaultTemplates);
    setShowResetDialog(false);
  };

  const handleUpdateDaysBeforeDue = (id: string, value: number) => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, daysBeforeDue: value } : t)
    );
  };

  const handleUpdateFinalStatus = (id: string, value: 'none' | 'suspend' | 'collections' | 'write-off') => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, finalStatus: value } : t)
    );
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

  const handleQuickEditDay = () => {
    if (!quickEditTemplate) return;
    
    const newDay = parseInt(quickEditDay);
    if (isNaN(newDay) || newDay < 0) {
      setDayEditError('Please enter a valid number (0 or greater)');
      return;
    }

    const oldDay = quickEditTemplate.dayTrigger;
    
    // Update name and subject to reflect new day
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
    } else if (newSubject.includes(`${oldDay} Days Past Due`)) {
      newSubject = newSubject.replace(`${oldDay} Days Past Due`, `${newDay} Days Past Due`);
    } else if (newSubject.includes(`Day ${oldDay}`)) {
      newSubject = newSubject.replace(`Day ${oldDay}`, `Day ${newDay}`);
    }

    setTemplates(prev =>
      prev.map(t => t.id === quickEditTemplate.id ? { 
        ...t, 
        dayTrigger: newDay,
        name: newName,
        subject: newSubject
      } : t)
    );
    setQuickEditTemplate(null);
    setQuickEditDay('');
    setDayEditError('');
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
                  {selectedTemplate.dayTrigger === 'before-due' 
                    ? `Day -${selectedTemplate.daysBeforeDue} (Before Due)` 
                    : `Day ${selectedTemplate.dayTrigger}`} Email Template
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

              {/* Day Configuration - only for non-before-due templates */}
              {editForm.dayTrigger !== 'before-due' && (
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
                          const newDay = Math.max(0, Number(editForm.dayTrigger) - 1);
                          
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
                          newSubject = newSubject.replace(new RegExp(`${oldDay} Days Past Due`, 'g'), `${newDay} Days Past Due`);
                          newSubject = newSubject.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                          
                          setEditForm({
                            ...editForm,
                            dayTrigger: newDay,
                            name: newName,
                            subject: newSubject,
                          });
                        }}
                        disabled={Number(editForm.dayTrigger) <= 0}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
                        style={{
                          background: Number(editForm.dayTrigger) <= 0 
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
                                newSubject = newSubject.replace(new RegExp(`${oldDay} Days Past Due`, 'g'), `${newDay} Days Past Due`);
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
                              background: editForm.dayTrigger === 0
                                ? 'linear-gradient(135deg, var(--primaryColor), #7C3AED)'
                                : 'linear-gradient(135deg, #EF4444, #DC2626)',
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
                            const newDay = Math.min(365, Number(editForm.dayTrigger) + 1);
                            
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
                            newSubject = newSubject.replace(new RegExp(`${oldDay} Days Past Due`, 'g'), `${newDay} Days Past Due`);
                            newSubject = newSubject.replace(new RegExp(`Day ${oldDay}(?!\\d)`, 'g'), `Day ${newDay}`);
                            
                            setEditForm({
                              ...editForm,
                              dayTrigger: newDay,
                              name: newName,
                              subject: newSubject,
                            });
                          }}
                          disabled={Number(editForm.dayTrigger) >= 365}
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
                          style={{
                            background: Number(editForm.dayTrigger) >= 365 
                              ? '#9CA3AF' 
                              : 'linear-gradient(135deg, #10B981, #059669)',
                          }}
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>

                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {editForm.dayTrigger === 0 ? 'Due Date' : `${editForm.dayTrigger} Day${Number(editForm.dayTrigger) === 1 ? '' : 's'} Overdue`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Sent {editForm.dayTrigger === 0 ? 'on due date' : `${editForm.dayTrigger} day${Number(editForm.dayTrigger) === 1 ? '' : 's'} after`}
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
              )}

              {/* Before Due Configuration */}
              {editForm.dayTrigger === 'before-due' && (
                <div>
                  <Label className="text-gray-900 dark:text-gray-100 font-medium">
                    Days Before Due Date
                  </Label>
                  <div className="mt-1.5 grid grid-cols-4 gap-3">
                    {[3, 5, 7, 10].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, daysBeforeDue: days })}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${editForm.daysBeforeDue === days 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                          }
                        `}
                      >
                        {editForm.daysBeforeDue === days && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${editForm.daysBeforeDue === days ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {days}
                          </div>
                          <div className={`text-xs mt-1 ${editForm.daysBeforeDue === days ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            days
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Status - only for Day 45 */}
              {selectedTemplate?.id === 'final-notice' && (
                <div>
                  <Label className="text-gray-900 dark:text-gray-100 font-medium">
                    Account Action After This Reminder
                  </Label>
                  <select
                    value={editForm.finalStatus}
                    onChange={(e) => setEditForm({ ...editForm, finalStatus: e.target.value as any })}
                    className="mt-1.5 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="none">No Action</option>
                    <option value="suspend">Suspend Account</option>
                    <option value="collections">Send to Collections</option>
                    <option value="write-off">Write Off</option>
                  </select>
                </div>
              )}

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
                      {['Client', 'Invoice', 'Payment', 'Company'].map((category) => {
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header with Breadcrumb */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/billing')}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Billing
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
            Invoice Reminder Settings
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Invoice Reminder Strategy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure automated payment reminders for invoices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-100">
            <strong>How it works:</strong> These email templates are
            automatically sent based on the timeline. Click any template card to
            edit it. Use merge fields like{' '}
            <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
              {'{{client_name}}'}
            </code>
            ,{' '}
            <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
              {'{{amount}}'}
            </code>
            , and{' '}
            <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
              {'{{number}}'}
            </code>{' '}
            to personalize messages.
          </div>
        </div>
      </div>

      {/* When This Applies Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
              When This Strategy Applies
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              This reminder strategy is used for <strong>invoices</strong> and <strong>subscriptions without payment methods on file</strong>. Reminders begin before the due date and escalate if payment isn't received.
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">
              For subscriptions with payment methods on file, use the{' '}
              <button
                onClick={() => navigate('/payment-reminder-strategy')}
                className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
              >
                Subscription Payment Strategy
              </button>
              {' '}instead.
            </p>
          </div>
        </div>
      </div>

      {/* Template Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {templates
            .sort((a, b) => {
              const aDay = a.dayTrigger === 'before-due' ? -(a.daysBeforeDue || 0) : a.dayTrigger;
              const bDay = b.dayTrigger === 'before-due' ? -(b.daysBeforeDue || 0) : b.dayTrigger;
              return aDay - bDay;
            })
            .map((template, index, arr) => (
              <div key={template.id} className="relative">
                <div
                  onClick={() => handleTemplateClick(template)}
                  className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer hover:shadow-md group"
                >
                  {/* Day Badge */}
                  <div className="flex-shrink-0 relative">
                    {template.dayTrigger === 'before-due' ? (
                      <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
                        <div className="text-xs opacity-90 uppercase tracking-wide">
                          Day
                        </div>
                        <div className="text-2xl font-bold">
                          -{template.daysBeforeDue}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickEditTemplate(template);
                          setQuickEditDay(String(template.dayTrigger));
                          setDayEditError('');
                        }}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all relative group/badge"
                        style={{
                          background: template.dayTrigger === 0 
                            ? 'linear-gradient(135deg, var(--primaryColor), #7C3AED)'
                            : `linear-gradient(135deg, #EF4444, ${
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
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Subject: {template.subject}
                        </p>
                        
                        {/* Day Configuration */}
                        {template.dayTrigger === 'before-due' && (
                          <>
                            <div className="mt-3">
                              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Days Before Due:</Label>
                              <div className="grid grid-cols-4 gap-2">
                                {[3, 5, 7, 10].map((days) => (
                                  <button
                                    key={days}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateDaysBeforeDue(template.id, days);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all min-h-[70px] ${
                                      template.daysBeforeDue === days
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center gap-1 h-full justify-center">
                                      <div className={`text-xl font-bold ${
                                        template.daysBeforeDue === days
                                          ? 'text-green-700 dark:text-green-300'
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>
                                        {days}
                                      </div>
                                      <div className={`text-xs ${
                                        template.daysBeforeDue === days
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        days
                                      </div>
                                      <CheckCircle className={`w-4 h-4 transition-opacity ${
                                        template.daysBeforeDue === days
                                          ? 'opacity-100 text-green-600 dark:text-green-400'
                                          : 'opacity-0'
                                      }`} />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-green-800 dark:text-green-200">
                                <strong>Smart Skip:</strong> This reminder is automatically skipped for invoices with less than 7 days until due date to avoid spamming short-term invoices.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
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
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to edit template →
                    </div>
                  </div>
                </div>

                {/* Arrow connector between cards */}
                {index < arr.length - 1 && (
                  <div className="flex justify-center items-center py-2">
                    <ArrowDown className="w-6 h-6 text-blue-400 dark:text-blue-600" />
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
                    After the last enabled reminder on <strong>Day {templates.filter(t => t.dayTrigger !== 'before-due').reduce((max, t) => Math.max(max, typeof t.dayTrigger === 'number' ? t.dayTrigger : 0), 0)}</strong>, the following action will be applied:
                  </p>
                  {templates.filter(t => t.dayTrigger !== 'before-due').length === 0 && (
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Quick Edit Day Dialog */}
      {quickEditTemplate && (
        <Dialog open={!!quickEditTemplate} onOpenChange={() => {
          setQuickEditTemplate(null);
          setDayEditError('');
        }}>
          <DialogContent aria-describedby="edit-day-trigger-description">
            <DialogHeader>
              <DialogTitle>Edit Day Trigger</DialogTitle>
              <DialogDescription id="edit-day-trigger-description">
                Change when this reminder is sent (days after due date).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Days After Due Date</Label>
              <Input
                type="number"
                value={quickEditDay}
                onChange={(e) => {
                  setQuickEditDay(e.target.value);
                  setDayEditError('');
                }}
                placeholder="Enter number of days..."
                className="mt-2"
                min={0}
              />
              {dayEditError && (
                <p className="text-sm text-red-600 mt-2">{dayEditError}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setQuickEditTemplate(null);
                setDayEditError('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleQuickEditDay} style={{ backgroundColor: 'var(--primaryColor)' }}>
                Save Day
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {templateToDelete && (
        <Dialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
          <DialogContent aria-describedby="delete-invoice-template-description">
            <DialogHeader>
              <DialogTitle>Delete Template?</DialogTitle>
              <DialogDescription id="delete-invoice-template-description">
                Are you sure you want to delete "{templateToDelete.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateToDelete(null)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteTemplate} variant="destructive">
                Delete Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent aria-describedby="reset-invoice-reminder-description">
          <DialogHeader>
            <DialogTitle>Reset to Default Templates?</DialogTitle>
            <DialogDescription id="reset-invoice-reminder-description">
              This will restore all invoice reminder templates to their default settings. Any customizations will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetToDefaults} variant="destructive">
              Reset to Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}