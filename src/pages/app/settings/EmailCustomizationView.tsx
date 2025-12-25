import { useState } from 'react';
import { 
  Mail, Plus, Search, Eye, Edit2, Trash2, Copy, Sparkles, 
  Calendar, Gift, Users, FileText, DollarSign, Bell, Clock,
  Star, Filter, Tag, Layout, MoreVertical, ArrowLeft, Save,
  AlertCircle, Check, X, Send, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import { Switch } from '../../../components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

// Category definitions
type EmailCategory = {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
};

const categories: EmailCategory[] = [
  {
    id: 'all',
    name: 'All Templates',
    icon: Layout,
    color: 'gray',
    description: 'View all email templates'
  },
  {
    id: 'onboarding',
    name: 'Client Onboarding',
    icon: Users,
    color: 'green',
    description: 'Welcome emails and getting started messages'
  },
  {
    id: 'tax-season',
    name: 'Tax Season',
    icon: FileText,
    color: 'blue',
    description: 'Tax deadline reminders and filing updates'
  },
  {
    id: 'documents',
    name: 'Document Management',
    icon: FileText,
    color: 'orange',
    description: 'Document requests and upload confirmations'
  },
  {
    id: 'appointments',
    name: 'Appointments',
    icon: Calendar,
    color: 'purple',
    description: 'Meeting confirmations, reminders, and follow-ups'
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    icon: DollarSign,
    color: 'emerald',
    description: 'Invoices, receipts, and payment reminders'
  },
  {
    id: 'seasonal',
    name: 'Seasonal & Special',
    icon: Gift,
    color: 'pink',
    description: 'Birthday wishes, holidays, and special occasions'
  },
  {
    id: 'general',
    name: 'General Communication',
    icon: Mail,
    color: 'indigo',
    description: 'Check-ins, updates, and newsletters'
  },
  {
    id: 'internal',
    name: 'Internal Team',
    icon: Bell,
    color: 'slate',
    description: 'Team notifications and assignments'
  }
];

// Email template type
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  isSystem: boolean;
  isFavorite: boolean;
  isAutomated?: boolean;
  automatedConfig?: {
    enabled: boolean;
    triggerType: 'birthday' | 'holiday' | 'anniversary';
    sendDate?: string;
    recipientCount?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
};

// System templates
const systemTemplates: EmailTemplate[] = [
  // Onboarding
  {
    id: 'sys-welcome',
    name: 'Welcome New Client',
    subject: 'Welcome to {{firm_name}}!',
    body: `Dear {{client_name}},

Welcome to {{firm_name}}! We're thrilled to have you as a client and look forward to partnering with you.

**Getting Started:**
• Access your client portal: {{portal_link}}
• Upload documents securely
• Schedule appointments with our team
• View your account status anytime

If you have any questions, don't hesitate to reach out. We're here to help!

Best regards,
{{firm_name}} Team`,
    category: 'onboarding',
    isSystem: true,
    isFavorite: false,
    tags: ['welcome', 'new-client'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-portal-access',
    name: 'Client Portal Access',
    subject: 'Your Client Portal is Ready',
    body: `Hi {{client_name}},

Your secure client portal is now active! You can access it anytime to:

✓ Upload and view documents
✓ Schedule appointments
✓ View invoices and make payments
✓ Message our team directly

**Access Your Portal:**
Portal URL: {{portal_link}}
Username: {{client_email}}

Click the link above and use the "Forgot Password" option to set your password.

See you in the portal!
{{firm_name}}`,
    category: 'onboarding',
    isSystem: true,
    isFavorite: false,
    tags: ['portal', 'access', 'login'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Tax Season
  {
    id: 'sys-tax-deadline',
    name: 'Tax Deadline Reminder',
    subject: 'Important: {{deadline_name}} Approaching',
    body: `Hi {{client_name}},

This is a friendly reminder that {{deadline_name}} is coming up on {{deadline_date}}.

**What You Need to Do:**
{{action_items}}

**Need Help?**
If you have questions or need an extension, please contact us as soon as possible.

Best regards,
{{firm_name}}`,
    category: 'tax-season',
    isSystem: true,
    isFavorite: false,
    tags: ['deadline', 'urgent', 'tax'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Documents
  {
    id: 'sys-doc-request',
    name: 'Document Upload Request',
    subject: 'Documents Needed: {{document_list}}',
    body: `Hi {{client_name}},

To proceed with your {{service_name}}, we need the following documents:

{{document_list}}

**How to Upload:**
1. Log into your client portal: {{portal_link}}
2. Go to the Documents section
3. Upload the required files

**Deadline:** {{upload_deadline}}

If you have any questions about what's needed, please let us know!

Thank you,
{{firm_name}}`,
    category: 'documents',
    isSystem: true,
    isFavorite: false,
    tags: ['documents', 'request', 'upload'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-doc-received',
    name: 'Document Received Confirmation',
    subject: 'We Received Your Documents',
    body: `Hi {{client_name}},

Thank you for uploading your documents! We've received:

{{document_names}}

Our team will review them shortly. We'll reach out if we need any clarification or additional information.

Best regards,
{{firm_name}}`,
    category: 'documents',
    isSystem: true,
    isFavorite: false,
    tags: ['documents', 'confirmation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Appointments
  {
    id: 'sys-appt-confirm',
    name: 'Appointment Confirmation',
    subject: 'Appointment Confirmed: {{appointment_date}}',
    body: `Hi {{client_name}},

Your appointment is confirmed!

**Meeting Details:**
Date: {{appointment_date}}
Time: {{appointment_time}}
Duration: {{duration}}
Location: {{location}}
With: {{team_member_name}}

{{meeting_link}}

Looking forward to speaking with you!

Best regards,
{{firm_name}}`,
    category: 'appointments',
    isSystem: true,
    isFavorite: false,
    tags: ['appointment', 'confirmation', 'meeting'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-appt-reminder-24hr',
    name: 'Appointment Reminder (24 Hours)',
    subject: 'Reminder: Appointment Tomorrow',
    body: `Hi {{client_name}},

This is a reminder about your upcoming appointment tomorrow.

**Meeting Details:**
Date: {{appointment_date}}
Time: {{appointment_time}}
With: {{team_member_name}}

{{meeting_link}}

Need to reschedule? Please let us know as soon as possible.

See you soon!
{{firm_name}}`,
    category: 'appointments',
    isSystem: true,
    isFavorite: false,
    tags: ['appointment', 'reminder', '24-hour'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-appt-followup',
    name: 'Appointment Follow-up',
    subject: 'Thank You for Meeting With Us',
    body: `Hi {{client_name}},

Thank you for taking the time to meet with us today!

**Next Steps:**
{{next_steps}}

If you have any questions about what we discussed, please don't hesitate to reach out.

Best regards,
{{team_member_name}}
{{firm_name}}`,
    category: 'appointments',
    isSystem: true,
    isFavorite: false,
    tags: ['appointment', 'follow-up', 'thank-you'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Billing
  {
    id: 'sys-invoice-sent',
    name: 'Invoice Sent',
    subject: 'Invoice #{{invoice_number}} from {{firm_name}}',
    body: `Hi {{client_name}},

Your invoice is ready for review.

**Invoice Details:**
Invoice #: {{invoice_number}}
Amount Due: {{amount}}
Due Date: {{due_date}}

**View & Pay:**
{{invoice_link}}

Payment can be made securely through your client portal or by the payment methods on the invoice.

Thank you for your business!
{{firm_name}}`,
    category: 'billing',
    isSystem: true,
    isFavorite: false,
    tags: ['invoice', 'billing', 'payment'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys-payment-received',
    name: 'Payment Received',
    subject: 'Payment Received - Thank You!',
    body: `Hi {{client_name}},

We've received your payment. Thank you!

**Payment Details:**
Amount: {{amount}}
Invoice #: {{invoice_number}}
Date Received: {{payment_date}}
Payment Method: {{payment_method}}

A receipt is available in your client portal.

Best regards,
{{firm_name}}`,
    category: 'billing',
    isSystem: true,
    isFavorite: false,
    tags: ['payment', 'receipt', 'confirmation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // General
  {
    id: 'sys-general-checkin',
    name: 'General Check-in',
    subject: 'Checking In',
    body: `Hi {{client_name}},

I wanted to reach out and see how everything is going. 

Is there anything we can help you with? Any questions about your account or upcoming deadlines?

Feel free to reply to this email or give us a call anytime.

Best regards,
{{team_member_name}}
{{firm_name}}`,
    category: 'general',
    isSystem: true,
    isFavorite: false,
    tags: ['check-in', 'general', 'relationship'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Internal
  {
    id: 'sys-team-assignment',
    name: 'Team Member Task Assignment',
    subject: 'New Task Assigned: {{task_name}}',
    body: `Hi {{team_member_name}},

You've been assigned a new task.

**Task Details:**
Task: {{task_name}}
Client: {{client_name}}
Due Date: {{due_date}}
Priority: {{priority}}

**Description:**
{{task_description}}

View full details in your dashboard: {{task_link}}

Thanks,
{{assigner_name}}`,
    category: 'internal',
    isSystem: true,
    isFavorite: false,
    tags: ['internal', 'task', 'assignment'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Automated special templates
const automatedTemplates: EmailTemplate[] = [
  {
    id: 'auto-birthday',
    name: 'Birthday Wishes',
    subject: '🎉 Happy Birthday, {{client_name}}!',
    body: `Dear {{client_name}},

🎂 Happy Birthday! 🎉

On behalf of everyone at {{firm_name}}, we wanted to take a moment to wish you a wonderful birthday filled with joy, laughter, and celebration.

We truly appreciate your trust in us and are grateful to have you as a valued client. Here's to another year of success and partnership!

Warmest wishes,
The {{firm_name}} Team

{{firm_logo}}`,
    category: 'seasonal',
    isSystem: true,
    isFavorite: false,
    isAutomated: true,
    automatedConfig: {
      enabled: false,
      triggerType: 'birthday',
      recipientCount: 0
    },
    tags: ['birthday', 'automated', 'special'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-holiday',
    name: 'Holiday Greetings',
    subject: 'Season\'s Greetings from {{firm_name}}',
    body: `Dear {{client_name}},

As the holiday season approaches, we wanted to take a moment to express our gratitude for your continued trust and partnership.

This year has been filled with opportunities to serve you, and we're thankful for the relationship we've built together.

Wishing you and your loved ones a joyful holiday season and a prosperous New Year!

Warm regards,
The {{firm_name}} Team

{{firm_logo}}`,
    category: 'seasonal',
    isSystem: true,
    isFavorite: false,
    isAutomated: true,
    automatedConfig: {
      enabled: false,
      triggerType: 'holiday',
      sendDate: '2024-12-15',
      recipientCount: 0
    },
    tags: ['holiday', 'automated', 'seasonal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Merge all templates
const allInitialTemplates = [...systemTemplates, ...automatedTemplates];

export function EmailCustomizationView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(allInitialTemplates);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'browse' | 'edit'>('browse');

  // Editor form state
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    tags: [] as string[],
  });

  // AI generation form
  const [aiForm, setAiForm] = useState({
    purpose: '',
    tone: 'professional',
    length: 'medium',
    includeVariables: true,
  });

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Get current category templates first, then others
  const sortedTemplates = selectedCategory === 'all' 
    ? filteredTemplates 
    : [
        ...filteredTemplates.filter(t => t.category === selectedCategory),
        ...filteredTemplates.filter(t => t.category !== selectedCategory)
      ];

  // Handlers
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setEditForm({
      name: '',
      subject: '',
      body: '',
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      tags: [],
    });
    setIsCreating(true);
    setViewMode('edit');
    setShowEditor(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      tags: template.tags,
    });
    setIsCreating(false);
    setViewMode('edit');
    setShowEditor(true);
  };

  const handleSave = () => {
    if (isCreating) {
      const newTemplate: EmailTemplate = {
        id: `custom-${Date.now()}`,
        name: editForm.name,
        subject: editForm.subject,
        body: editForm.body,
        category: editForm.category,
        isSystem: false,
        isFavorite: false,
        tags: editForm.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate]);
      toast.success('Email template created!');
    } else if (selectedTemplate) {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? {
              ...t,
              name: editForm.name,
              subject: editForm.subject,
              body: editForm.body,
              category: editForm.category,
              tags: editForm.tags,
              updatedAt: new Date().toISOString(),
            }
          : t
      ));
      toast.success('Email template updated!');
    }
    setShowEditor(false);
    setViewMode('browse');
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      toast.success('Email template deleted');
      setShowDeleteConfirm(false);
      setSelectedTemplate(null);
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicate: EmailTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates([...templates, duplicate]);
    toast.success('Template duplicated!');
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleToggleAutomation = (templateId: string) => {
    setTemplates(templates.map(t => {
      if (t.id === templateId && t.automatedConfig) {
        return {
          ...t,
          automatedConfig: {
            ...t.automatedConfig,
            enabled: !t.automatedConfig.enabled
          }
        };
      }
      return t;
    }));
  };

  const handleGenerateWithAI = () => {
    // TODO: Call AI backend
    toast.info('AI generation will be available soon!');
    setShowAIDialog(false);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  // Get counts per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return templates.length;
    return templates.filter(t => t.category === categoryId).length;
  };

  // Available variables
  const availableVariables = [
    '{{client_name}}', '{{client_email}}', '{{firm_name}}', '{{firm_logo}}',
    '{{team_member_name}}', '{{portal_link}}', '{{invoice_number}}',
    '{{amount}}', '{{due_date}}', '{{appointment_date}}', '{{appointment_time}}',
    '{{document_list}}', '{{meeting_link}}', '{{task_name}}', '{{deadline_date}}'
  ];

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ background: 'var(--bgColorRightPanel, #f9fafb)' }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b" style={{ 
        background: 'var(--bgColor, #ffffff)', 
        borderColor: 'var(--stokeColor, #e5e7eb)' 
      }}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)' }}
              >
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100 mb-1">Email Customization</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create, organize, and manage email templates for your firm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAIDialog(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
              <Button
                onClick={handleCreateNew}
                className="gap-2 text-white"
                style={{ background: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, subject, or tags..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Categories */}
        <div 
          className="w-72 border-r overflow-auto flex-shrink-0"
          style={{ 
            background: 'var(--bgColor, #ffffff)',
            borderColor: 'var(--stokeColor, #e5e7eb)' 
          }}
        >
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map(category => {
                const Icon = category.icon;
                const count = getCategoryCount(category.id);
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? `bg-${category.color}-100 dark:bg-${category.color}-900/30`
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected
                          ? `text-${category.color}-600 dark:text-${category.color}-400`
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${
                        isSelected 
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {category.name}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Favorites Section */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Quick Access
              </h3>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Favorites
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {templates.filter(t => t.isFavorite).length}
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Info Banner for Automated Emails */}
            {selectedCategory === 'seasonal' && (
              <Card className="mb-6 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                        Automated Special Emails
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Birthday and holiday emails can be automated. When enabled, they'll be sent automatically on the client's birthday or your chosen holiday date. You can customize the content and toggle automation on/off anytime.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {sortedTemplates.length} {sortedTemplates.length === 1 ? 'template' : 'templates'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            </div>

            {/* Template Cards */}
            {sortedTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No templates found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Create your first email template to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateNew} className="text-white" style={{ background: 'var(--primaryColor)' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTemplates.map(template => {
                  const category = categories.find(c => c.id === template.category);
                  const CategoryIcon = category?.icon || Mail;

                  return (
                    <Card 
                      key={template.id} 
                      className="group hover:shadow-md transition-shadow border"
                      style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                    >
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-${category?.color}-100 dark:bg-${category?.color}-900/30`}>
                              <CategoryIcon className={`w-5 h-5 text-${category?.color}-600 dark:text-${category?.color}-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                                {template.name}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {template.isSystem && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                                {template.isAutomated && (
                                  <Badge 
                                    variant={template.automatedConfig?.enabled ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {template.automatedConfig?.enabled ? 'Active' : 'Inactive'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleFavorite(template.id)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  template.isFavorite 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(template)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(template)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                {!template.isSystem && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedTemplate(template);
                                        setShowDeleteConfirm(true);
                                      }}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Subject Preview */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {template.subject}
                          </p>
                        </div>

                        {/* Body Preview */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-3">
                            {template.body.substring(0, 120)}...
                          </p>
                        </div>

                        {/* Automated Email Special Config */}
                        {template.isAutomated && template.automatedConfig && (
                          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                Automated Sending
                              </span>
                              <button
                                onClick={() => handleToggleAutomation(template.id)}
                                className="flex items-center gap-1.5"
                              >
                                {template.automatedConfig.enabled ? (
                                  <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                            {template.automatedConfig.enabled && (
                              <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                                {template.automatedConfig.triggerType === 'birthday' && (
                                  <p>• Sends automatically on client birthdays</p>
                                )}
                                {template.automatedConfig.triggerType === 'holiday' && template.automatedConfig.sendDate && (
                                  <p>• Sends on {new Date(template.automatedConfig.sendDate).toLocaleDateString()}</p>
                                )}
                                <p>• Recipients: {template.automatedConfig.recipientCount || 0} clients</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(template)}
                            className="flex-1"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="flex-1"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                          </Button>
                        </div>

                        {/* Meta Info */}
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 dark:text-gray-400" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                          Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => {
        setShowEditor(open);
        if (!open) setViewMode('browse');
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="editor-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create Email Template' : `Edit: ${selectedTemplate?.name}`}
            </DialogTitle>
            <DialogDescription id="editor-dialog-description">
              {isCreating 
                ? 'Create a new email template for your workflow' 
                : 'Make changes to your email template'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4 space-y-4">
            {/* Template Name & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Welcome New Client"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <Label htmlFor="subject">
                Subject Line <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                placeholder="Use variables like {{client_name}} and {{firm_name}}"
                className="mt-1.5"
              />
            </div>

            {/* Email Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="body">
                  Email Body <span className="text-red-500">*</span>
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIDialog(true)}
                  className="gap-1.5 h-7 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="body"
                value={editForm.body}
                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                placeholder="Write your email content here. Use variables like {{client_name}}, {{firm_name}}, etc."
                rows={16}
                className="font-mono text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                value={editForm.tags.join(', ')}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="welcome, new-client, onboarding"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Separate tags with commas. Tags help organize and search templates.
              </p>
            </div>

            {/* Available Variables */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Available Variables
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {availableVariables.map(variable => (
                  <button
                    key={variable}
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(variable);
                      toast.success('Variable copied to clipboard!');
                    }}
                    className="text-xs px-2 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded font-mono text-left transition-colors"
                  >
                    {variable}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                Click any variable to copy it to your clipboard, then paste into your template.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editForm.name || !editForm.subject || !editForm.body}
              className="text-white"
              style={{ background: 'var(--primaryColor)' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? 'Create Template' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl" aria-describedby="preview-dialog-description">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription id="preview-dialog-description">
              Preview of {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                Subject Line
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                <p className="text-sm font-medium">{selectedTemplate?.subject}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                Email Body
              </Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border max-h-96 overflow-auto" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {selectedTemplate?.body}
                </pre>
              </div>
            </div>
            {selectedTemplate?.isAutomated && selectedTemplate?.automatedConfig && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Automated Email Settings
                </h4>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <p>Status: {selectedTemplate.automatedConfig.enabled ? 'Active' : 'Inactive'}</p>
                  {selectedTemplate.automatedConfig.triggerType === 'birthday' && (
                    <p>Trigger: Sent automatically on client birthdays</p>
                  )}
                  {selectedTemplate.automatedConfig.triggerType === 'holiday' && selectedTemplate.automatedConfig.sendDate && (
                    <p>Send Date: {new Date(selectedTemplate.automatedConfig.sendDate).toLocaleDateString()}</p>
                  )}
                  <p>Recipients: {selectedTemplate.automatedConfig.recipientCount || 0} clients</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                handleEdit(selectedTemplate!);
              }}
              className="text-white"
              style={{ background: 'var(--primaryColor)' }}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent aria-describedby="delete-confirmation-description">
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription id="delete-confirmation-description">
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

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="ai-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate Email with AI
            </DialogTitle>
            <DialogDescription id="ai-dialog-description">
              Describe what you need and let AI create a professional email template for you
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="ai-purpose">
                What is this email for? <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ai-purpose"
                value={aiForm.purpose}
                onChange={(e) => setAiForm({ ...aiForm, purpose: e.target.value })}
                placeholder="E.g., 'A friendly reminder to clients about upcoming tax deadlines' or 'Thank you email after completing a service'"
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-tone">Tone</Label>
                <Select value={aiForm.tone} onValueChange={(value) => setAiForm({ ...aiForm, tone: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ai-length">Length</Label>
                <Select value={aiForm.length} onValueChange={(value) => setAiForm({ ...aiForm, length: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (2-3 paragraphs)</SelectItem>
                    <SelectItem value="medium">Medium (4-5 paragraphs)</SelectItem>
                    <SelectItem value="long">Long (6+ paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={aiForm.includeVariables}
                onCheckedChange={(checked) => setAiForm({ ...aiForm, includeVariables: checked })}
              />
              <Label className="text-sm font-normal cursor-pointer">
                Include merge variables (like {'{{client_name}}'}, {'{{firm_name}}'})
              </Label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  AI will generate a professional email template based on your requirements. You can edit it afterwards to perfect it for your needs.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={!aiForm.purpose.trim()}
              className="gap-2 text-white"
              style={{ background: 'var(--primaryColor)' }}
            >
              <Sparkles className="w-4 h-4" />
              Generate Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}