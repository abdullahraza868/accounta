import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  DollarSign, 
  Filter, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Edit, 
  Trash2, 
  Repeat 
} from 'lucide-react';
import { CreateInvoiceTemplateWizard } from '../CreateInvoiceTemplateWizard';
import { type Client } from '../../App';
import { TemplateCard } from '../TemplateCardStyles';
import { RecurrenceData } from '../RecurrenceSelector';

// Category types
const TEMPLATE_CATEGORIES = [
  'Accounting',
  'Bookkeeping',
  'Payroll',
  'Tax',
  'Consulting',
  'Audit',
  'Other'
] as const;

type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Accounting': '#8B5CF6',
  'Bookkeeping': '#3B82F6',
  'Tax': '#10B981',
  'Consulting': '#F59E0B',
  'Audit': '#EF4444',
  'Payroll': '#EC4899',
  'Other': '#6B7280',
};

const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  'Accounting': '📊',
  'Bookkeeping': '📚',
  'Tax': '📄',
  'Consulting': '💼',
  'Audit': '🔍',
  'Payroll': '💰',
  'Other': '📋',
};

// Type definitions
type LineItemTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  defaultRate: number;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  isRecurring?: boolean;
  recurrence?: RecurrenceData;
  lineItems: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }[];
};

// Mock data
const mockLineItemTemplates: LineItemTemplate[] = [
  { id: '1', name: 'Monthly Bookkeeping', description: 'Monthly bookkeeping services', category: 'Bookkeeping', defaultRate: 500 },
  { id: '2', name: 'Accounts Payable', description: 'AP processing and management', category: 'Bookkeeping', defaultRate: 300 },
  { id: '3', name: 'Bank Reconciliation', description: 'Monthly bank reconciliation', category: 'Bookkeeping', defaultRate: 200 },
  { id: '4', name: 'Financial Statements', description: 'Monthly financial statement preparation', category: 'Accounting', defaultRate: 400 },
  { id: '5', name: 'General Ledger Review', description: 'GL account review and cleanup', category: 'Accounting', defaultRate: 350 },
  { id: '6', name: 'Individual Tax Return', description: 'Personal income tax preparation', category: 'Tax', defaultRate: 350 },
  { id: '7', name: 'Business Tax Return', description: 'Corporate tax return preparation', category: 'Tax', defaultRate: 850 },
  { id: '8', name: 'Tax Planning Session', description: 'Strategic tax planning consultation', category: 'Tax', defaultRate: 250 },
  { id: '9', name: 'Hourly Consulting', description: 'General business consulting', category: 'Consulting', defaultRate: 200 },
  { id: '10', name: 'Payroll Processing', description: 'Monthly payroll processing', category: 'Payroll', defaultRate: 150 },
  { id: '11', name: 'Payroll Tax Filing', description: 'Quarterly payroll tax filing', category: 'Payroll', defaultRate: 125 },
  { id: '12', name: 'Financial Audit', description: 'Annual financial statement audit', category: 'Audit', defaultRate: 2500 },
  { id: '13', name: 'Budget Analysis', description: 'Annual budget review and analysis', category: 'Accounting', defaultRate: 450 },
  { id: '14', name: 'CFO Services', description: 'Fractional CFO consulting', category: 'Consulting', defaultRate: 500 },
];

const initialInvoiceTemplates: InvoiceTemplate[] = [
  {
    id: '1',
    name: 'Standard Monthly Bookkeeping',
    description: 'Monthly bookkeeping and basic services',
    category: 'Bookkeeping',
    icon: '📚',
    isRecurring: true,
    lineItems: [
      { name: 'Monthly Bookkeeping', description: 'Transaction recording and reconciliation', quantity: 1, rate: 500 },
      { name: 'Accounts Payable', description: 'AP processing and management', quantity: 1, rate: 300 },
      { name: 'Bank Reconciliation', description: 'Monthly bank reconciliation', quantity: 1, rate: 200 }
    ]
  },
  {
    id: '2',
    name: 'Premium Bookkeeping Package',
    description: 'Comprehensive bookkeeping with financial reporting',
    category: 'Bookkeeping',
    icon: '📊',
    lineItems: [
      { name: 'Monthly Bookkeeping', description: 'Transaction recording and reconciliation', quantity: 1, rate: 500 },
      { name: 'Accounts Payable', description: 'AP processing and management', quantity: 1, rate: 300 },
      { name: 'Bank Reconciliation', description: 'Monthly bank reconciliation', quantity: 1, rate: 200 },
      { name: 'Financial Statements', description: 'P&L and Balance Sheet', quantity: 1, rate: 400 }
    ]
  },
  {
    id: '3',
    name: 'Monthly Accounting Service',
    description: 'Complete accounting services',
    category: 'Accounting',
    icon: '💼',
    lineItems: [
      { name: 'Financial Statements', description: 'Monthly financial statement preparation', quantity: 1, rate: 400 },
      { name: 'General Ledger Review', description: 'GL account review and cleanup', quantity: 1, rate: 350 },
      { name: 'Budget Analysis', description: 'Monthly budget variance analysis', quantity: 1, rate: 450 }
    ]
  },
  {
    id: '4',
    name: 'Individual Tax Package',
    description: 'Complete individual tax preparation',
    category: 'Tax',
    icon: '📄',
    lineItems: [
      { name: 'Individual Tax Return', description: 'Personal income tax preparation', quantity: 1, rate: 350 },
      { name: 'Tax Planning Session', description: 'Strategic tax planning consultation', quantity: 1, rate: 250 }
    ]
  },
  {
    id: '5',
    name: 'Business Tax Package',
    description: 'Complete business tax services',
    category: 'Tax',
    icon: '🏢',
    lineItems: [
      { name: 'Business Tax Return', description: 'Corporate tax return preparation', quantity: 1, rate: 850 },
      { name: 'Tax Planning Session', description: 'Strategic tax planning consultation', quantity: 2, rate: 250 }
    ]
  },
  {
    id: '6',
    name: 'Monthly Payroll Service',
    description: 'Complete payroll processing and tax filing',
    category: 'Payroll',
    icon: '💰',
    isRecurring: true,
    lineItems: [
      { name: 'Payroll Processing', description: 'Monthly payroll for up to 10 employees', quantity: 1, rate: 150 },
      { name: 'Payroll Tax Filing', description: 'Quarterly payroll tax returns', quantity: 0.33, rate: 125 }
    ]
  },
  {
    id: '7',
    name: 'Consulting Package',
    description: 'Professional consulting services',
    category: 'Consulting',
    icon: '💡',
    lineItems: [
      { name: 'Hourly Consulting', description: 'Professional business consultation', quantity: 3, rate: 200 },
      { name: 'CFO Services', description: 'Fractional CFO services', quantity: 1, rate: 500 }
    ]
  },
  {
    id: '8',
    name: 'Annual Audit Package',
    description: 'Complete financial audit services',
    category: 'Audit',
    icon: '🔍',
    lineItems: [
      { name: 'Financial Audit', description: 'Annual financial statement audit', quantity: 1, rate: 2500 }
    ]
  },
  // Additional Tax templates to show 4-5 in one category
  {
    id: '9',
    name: 'Tax Extension Service',
    description: 'File tax extensions for individuals or businesses',
    category: 'Tax',
    icon: '📅',
    lineItems: [
      { name: 'Individual Tax Return', description: 'Extension filing', quantity: 1, rate: 150 },
      { name: 'Tax Planning Session', description: 'Brief consultation', quantity: 0.5, rate: 250 }
    ]
  },
  {
    id: '10',
    name: 'Quarterly Tax Estimates',
    description: 'Quarterly estimated tax calculations and filing',
    category: 'Tax',
    icon: '🧮',
    lineItems: [
      { name: 'Tax Planning Session', description: 'Quarterly calculation', quantity: 1, rate: 250 }
    ]
  },
  {
    id: '11',
    name: 'Multi-State Tax Return',
    description: 'Tax preparation for clients with multi-state income',
    category: 'Tax',
    icon: '🗺️',
    lineItems: [
      { name: 'Individual Tax Return', description: 'Primary state return', quantity: 1, rate: 350 },
      { name: 'Individual Tax Return', description: 'Additional state returns', quantity: 2, rate: 200 },
      { name: 'Tax Planning Session', description: 'Multi-state planning', quantity: 1, rate: 250 }
    ]
  },
];

export function ManageInvoiceTemplatesView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'invoice' | 'lineItem'>('invoice');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>(initialInvoiceTemplates);
  const [lineItemTemplates, setLineItemTemplates] = useState<LineItemTemplate[]>(mockLineItemTemplates);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<InvoiceTemplate | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string; type: 'invoice' | 'lineItem' } | null>(null);
  const [deleteClickCount, setDeleteClickCount] = useState(0);
  const [deleteClickTimer, setDeleteClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Wizard state for recurring template workflow
  const [wizardStep, setWizardStep] = useState<1 | 2>(1); // 1 = Select Client, 2 = Configure Recurrence
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [wizardRecurrence, setWizardRecurrence] = useState<RecurrenceData | null>(null);
  const [wizardIsRecurring, setWizardIsRecurring] = useState(false);
  const [showRecurringToggleConfirm, setShowRecurringToggleConfirm] = useState(false);

  // Simple form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<TemplateCategory>('Bookkeeping');
  const [newTemplateIcon, setNewTemplateIcon] = useState('📋');

  // Handle saved line item template from form
  useEffect(() => {
    if (location.state?.savedTemplate) {
      const savedTemplate = location.state.savedTemplate as LineItemTemplate;
      const isEdit = location.state.isEdit;

      if (isEdit) {
        // Update existing template
        setLineItemTemplates(prev =>
          prev.map(t => t.id === savedTemplate.id ? savedTemplate : t)
        );
      } else {
        // Add new template
        setLineItemTemplates(prev => [...prev, savedTemplate]);
      }

      // Switch to line item tab to show the result
      setActiveTab('lineItem');

      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Calculate invoice template total
  const calculateTemplateTotal = (template: InvoiceTemplate) => {
    return template.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  // Group line item templates by category
  const groupedLineItems = TEMPLATE_CATEGORIES.reduce((acc, category) => {
    const items = lineItemTemplates.filter(t => t.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<TemplateCategory, LineItemTemplate[]>);

  // Group invoice templates by category
  const groupedInvoices = TEMPLATE_CATEGORIES.reduce((acc, category) => {
    const items = invoiceTemplates.filter(t => t.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<TemplateCategory, InvoiceTemplate[]>);

  // Get filtered groups based on selected category
  const filteredInvoiceGroups = selectedCategory === 'All' 
    ? groupedInvoices 
    : { [selectedCategory]: groupedInvoices[selectedCategory] || [] };

  const filteredLineItemGroups = selectedCategory === 'All'
    ? groupedLineItems
    : { [selectedCategory]: groupedLineItems[selectedCategory] || [] };

  // Count templates by category
  const getInvoiceCount = (category: TemplateCategory | 'All') => {
    if (category === 'All') return invoiceTemplates.length;
    return invoiceTemplates.filter(t => t.category === category).length;
  };

  const getLineItemCount = (category: TemplateCategory | 'All') => {
    if (category === 'All') return lineItemTemplates.length;
    return lineItemTemplates.filter(t => t.category === category).length;
  };

  const toggleTemplate = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedTemplates(newExpanded);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate: InvoiceTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: newTemplateDescription,
      category: newTemplateCategory,
      icon: newTemplateIcon,
      lineItems: []
    };

    setInvoiceTemplates([...invoiceTemplates, newTemplate]);
    setShowCreateForm(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('Bookkeeping');
    setNewTemplateIcon('📋');
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('Bookkeeping');
    setNewTemplateIcon('📋');
  };

  const handleSaveNewTemplate = (template: InvoiceTemplate) => {
    setInvoiceTemplates([...invoiceTemplates, template]);
    setShowCreateForm(false);
  };

  const handleUseTemplate = (template: InvoiceTemplate) => {
    // Check if template is recurring - if so, start wizard flow
    if (template.isRecurring) {
      // Navigate to recurring invoice wizard
      navigate('/billing/recurring/create', {
        state: {
          selectedTemplate: template,
          fromManageTemplates: true
        }
      });
    } else {
      // For non-recurring templates, navigate directly to add invoice
      navigate('/invoices/add', {
        state: {
          selectedTemplate: template,
          fromManageTemplates: true
        }
      });
    }
  };

  const handleEditInvoiceTemplate = (template: InvoiceTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to edit page with template data
    navigate('/edit-invoice-template', {
      state: { template }
    });
  };

  const handleDeleteInvoiceTemplate = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({ id: templateId, name: templateName, type: 'invoice' });
  };

  const handleEditLineItemTemplate = (template: LineItemTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to edit page with template data
    navigate('/edit-line-item-template', {
      state: { template }
    });
  };

  const handleDeleteLineItemTemplate = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({ id: templateId, name: templateName, type: 'lineItem' });
  };

  const handleClientSelect = (client: Client) => {
    // Save selected client and move to step 2 (recurrence configuration)
    setSelectedClient(client);
    setWizardStep(2);
  };

  // Mock clients for selection (in real app, this would come from props or context)
  const mockClients: Client[] = [
    { id: '1', name: 'Smith Family Trust', firstName: 'John', lastName: 'Smith', email: 'john@smith.com', phone: '555-0101', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: ['High Priority'], createdDate: '2024-01-15' },
    { id: '2', name: 'Tech Startup Inc.', firstName: 'Jane', lastName: 'Doe', email: 'jane@techstartup.com', phone: '555-0102', type: 'Business', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['Recurring'], createdDate: '2024-02-20' },
    { id: '3', name: 'Anderson LLC', firstName: 'Bob', lastName: 'Anderson', email: 'bob@andersonllc.com', phone: '555-0103', type: 'Business', group: 'Business Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-03-10' },
  ];

  const [clientSearchQuery, setClientSearchQuery] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Wizard - Full Page Replacement */}
      {showCreateForm && activeTab === 'invoice' ? (
        <CreateInvoiceTemplateWizard
          onClose={() => setShowCreateForm(false)}
          onSave={handleSaveNewTemplate}
        />
      ) : (
        <>
          {/* Sticky Header - Back Button, Tabs, and Filters */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
            {/* Back Button */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/billing')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Billing
              </Button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`flex-1 py-4 px-6 rounded-t-xl border-2 border-b-0 transition-all ${
                    activeTab === 'invoice'
                      ? 'border-[var(--primaryColor)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FileText className={`w-5 h-5 ${activeTab === 'invoice' ? 'text-[var(--primaryColor)]' : 'text-gray-500'}`} />
                    <div className="text-left">
                      <div className={`font-medium ${activeTab === 'invoice' ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                        Invoice Templates
                      </div>
                      <div className="text-xs" style={{ color: 'var(--secondaryTextColor)' }}>
                        {invoiceTemplates.length} template{invoiceTemplates.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('lineItem')}
                  className={`flex-1 py-4 px-6 rounded-t-xl border-2 border-b-0 transition-all ${
                    activeTab === 'lineItem'
                      ? 'border-[var(--primaryColor)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <DollarSign className={`w-5 h-5 ${activeTab === 'lineItem' ? 'text-[var(--primaryColor)]' : 'text-gray-500'}`} />
                    <div className="text-left">
                      <div className={`font-medium ${activeTab === 'lineItem' ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                        Line Item Templates
                      </div>
                      <div className="text-xs" style={{ color: 'var(--secondaryTextColor)' }}>
                        {lineItemTemplates.length} template{lineItemTemplates.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4">
                {/* Category Filters - Left Side with horizontal scroll */}
                <div className="flex items-center gap-3 flex-1 overflow-x-auto scrollbar-thin">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                        selectedCategory === 'All'
                          ? 'text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      style={selectedCategory === 'All' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                    >
                      All ({activeTab === 'invoice' ? getInvoiceCount('All') : getLineItemCount('All')})
                    </button>
                    {TEMPLATE_CATEGORIES.map((category) => {
                      const count = activeTab === 'invoice' ? getInvoiceCount(category) : getLineItemCount(category);
                      if (count === 0) return null;
                      
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                            selectedCategory === category
                              ? 'text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                          style={selectedCategory === category ? { backgroundColor: CATEGORY_COLORS[category] } : {}}
                        >
                          {category} ({count})
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>

                {/* New Template Button - Right Side */}
                <Button
                  size="sm"
                  className="gap-2 flex-shrink-0"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                  onClick={() => {
                    if (activeTab === 'invoice') {
                      setShowCreateForm(true);
                    } else {
                      navigate('/edit-line-item-template');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                  {activeTab === 'invoice' ? 'New Invoice Template' : 'New Line Item Template'}
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Page Title - Scrolls with content */}
            <div className="px-8 pt-8 pb-4">
              <h1 className="text-2xl text-gray-900 dark:text-gray-100">Templates</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create and manage invoice and line item templates for faster billing
              </p>
            </div>

            {/* Template Content */}
            <div className="px-8 pb-8">
              <div className="max-w-6xl mx-auto">
                {activeTab === 'invoice' ? (
                  /* Invoice Templates - Grouped by Category */
                  <div className="space-y-8">
                    {Object.entries(filteredInvoiceGroups).map(([category, templates]) => {
                      if (!templates || templates.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5" style={{ color: CATEGORY_COLORS[category as TemplateCategory] }} />
                            <h3 className="text-lg font-medium" style={{ color: CATEGORY_COLORS[category as TemplateCategory] }}>
                              {category} ({templates.length})
                            </h3>
                            <div 
                              className="h-px flex-1"
                              style={{ backgroundColor: `${CATEGORY_COLORS[category as TemplateCategory]}40` }}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => {
                              const templateTotal = calculateTemplateTotal(template);
                              const isExpanded = expandedTemplates.has(template.id);
                              const displayedItems = isExpanded ? template.lineItems : template.lineItems.slice(0, 3);
                              
                              return (
                                <div
                                  key={template.id}
                                  onClick={() => handleUseTemplate(template)}
                                  className="w-full text-left p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg cursor-pointer"
                                >
                                  {/* Total Badge */}
                                  {templateTotal > 0 && (
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                                      ${templateTotal.toFixed(2)}
                                    </div>
                                  )}

                                  {/* Action Buttons - Centered below amount badge */}
                                  <div className="absolute top-12 right-3 flex gap-0.5 justify-end" style={{ width: 'fit-content' }}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleEditInvoiceTemplate(template, e)}
                                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 group/edit"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-gray-500 group-hover/edit:scale-125 transition-transform" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleDeleteInvoiceTemplate(template.id, template.name, e)}
                                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 group/delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 group-hover/delete:scale-125 transition-transform" />
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="text-4xl">{template.icon}</div>
                                    {template.isRecurring && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs" style={{ color: 'var(--primaryColor)' }}>
                                        <Repeat className="w-3 h-3" />
                                        <span className="font-medium">Recurring</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h3 className="text-lg font-medium mb-2 pr-20">{template.name}</h3>

                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {template.description}
                                  </p>

                                  {template.lineItems.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Included Items ({template.lineItems.length}):
                                      </p>
                                      <div className="space-y-2">
                                        {displayedItems.map((item, idx) => {
                                          const itemAmount = (item.quantity || 0) * (item.rate || 0);
                                          return (
                                            <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                                              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                                <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                                                <div className="flex-1 min-w-0">
                                                  <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                                                  {item.description && (
                                                    <span className="text-gray-500 dark:text-gray-500 text-[10px] truncate block">
                                                      {item.description}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                                                ${itemAmount.toFixed(2)}
                                              </span>
                                            </div>
                                          );
                                        })}
                                        {template.lineItems.length > 3 && (
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleTemplate(template.id);
                                            }}
                                            className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer select-none"
                                            style={{ color: 'var(--primaryColor)' }}
                                          >
                                            {!isExpanded ? (
                                              <>
                                                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                                                <div className="flex items-center gap-0.5">
                                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                                                </div>
                                                <span className="font-medium">+ {template.lineItems.length - 3} more item{template.lineItems.length - 3 > 1 ? 's' : ''}</span>
                                              </>
                                            ) : (
                                              <>
                                                <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="font-medium">Show less</span>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Call to action at bottom */}
                                  <div className="w-full mt-4 py-2 px-4 rounded-lg text-center font-medium text-white transition-all" style={{ backgroundColor: 'var(--primaryColor)' }}>
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Use This Template
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Line Item Templates - Grouped by Category */
                  <div className="space-y-8">
                    {Object.entries(filteredLineItemGroups).map(([category, items]) => {
                      if (!items || items.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5" style={{ color: CATEGORY_COLORS[category as TemplateCategory] }} />
                            <h3 className="text-lg font-medium" style={{ color: CATEGORY_COLORS[category as TemplateCategory] }}>
                              {category} ({items.length})
                            </h3>
                            <div 
                              className="h-px flex-1"
                              style={{ backgroundColor: `${CATEGORY_COLORS[category as TemplateCategory]}40` }}
                            />
                          </div>
                          <div className="space-y-3">
                            {items.map((template) => (
                              <div
                                key={template.id}
                                className="p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg group"
                              >
                                {/* Rate Badge */}
                                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                                  ${template.defaultRate.toFixed(2)}
                                </div>

                                {/* Action Buttons - Centered below the rate badge */}
                                <div className="absolute top-14 right-4 flex gap-1.5 justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleEditLineItemTemplate(template, e)}
                                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 group/edit"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-gray-500 group-hover/edit:scale-125 transition-transform" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteLineItemTemplate(template.id, template.name, e)}
                                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 group/delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 group-hover/delete:scale-125 transition-transform" />
                                  </Button>
                                </div>

                                <div className="flex items-start gap-4">
                                  <div className="text-4xl flex-shrink-0">{CATEGORY_ICONS[template.category]}</div>
                                  <div className="flex-1 pr-28">
                                    <h3 className="text-lg font-medium mb-2">{template.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                      {template.description}
                                    </p>
                                    
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm">
                                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-medium">${template.defaultRate.toFixed(2)}</span>
                                            <span className="text-gray-500">/ unit</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                          <Check className="w-3.5 h-3.5" style={{ color: 'var(--primaryColor)' }} />
                                          Ready to use
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirmation(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-medium mb-2">Delete Template?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-gray-100">"{deleteConfirmation.name}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (deleteConfirmation.type === 'invoice') {
                    setInvoiceTemplates(invoiceTemplates.filter(t => t.id !== deleteConfirmation.id));
                    console.log('Deleted template:', deleteConfirmation.id);
                  }
                  setDeleteConfirmation(null);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}