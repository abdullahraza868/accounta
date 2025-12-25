import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { X, Check, Plus, Trash2, ChevronDown, ChevronUp, Minus, FileText, CreditCard, Building, Sparkles, Pencil, Save, Repeat, Percent, DollarSign, Clock, Search, Tag } from 'lucide-react';
import { StepNavigation, Step as StepConfig } from './StepNavigation';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { RecurrenceSelector, RecurrenceData } from './RecurrenceSelector';

// Category types
const TEMPLATE_CATEGORIES = [
  'Accounting',
  'Audit',
  'Bookkeeping',
  'Consulting',
  'Other',
  'Payroll',
  'Tax',
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

// Icon library organized by category
const ICON_LIBRARY = {
  'Popular': ['📊', '📚', '📄', '💼', '🔍', '💰', '📋', '💡'],
  'Finance & Money': ['💰', '💵', '💴', '💶', '💷', '💳', '💸', '🏦', '📈', '📉', '💹', '🪙'],
  'Documents': ['📄', '📃', '📋', '📑', '📊', '📈', '📉', '🗂️', '📁', '🗃️', '📇', '🗓️'],
  'Business': ['💼', '🏢', '🏪', '🏭', '⚖️', '📊', '📈', '💹', '📞', '📧', '🖥️', '⌨️'],
  'Symbols': ['✓', '✔️', '✅', '⭐', '🌟', '💫', '🎯', '🔔', '⚡', '🔥', '💎', '🏆'],
  'Objects': ['📚', '🔍', '🔎', '💡', '🔧', '⚙️', '🔨', '📐', '📏', '🧮', '🗝️', '🔑'],
  'Time': ['⏰', '⏱️', '⏲️', '⌛', '⏳', '🕐', '🕑', '🕒', '📅', '📆', '🗓️', '🕰️'],
  'Communication': ['📞', '📧', '✉️', '📬', '📭', '📮', '📪', '📫', '💬', '💭', '🗨️', '📢'],
};

// Quick select icons (most commonly used)
const QUICK_SELECT_ICONS = ['📊', '📚', '📄', '💼', '🔍', '💰', '📋', '💡', '📈', '🏢', '⏰', '✅', '💵', '📞', '⚖️', '📆', '💹', '🔔'];

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  isRecurring?: boolean;
  lineItems: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }[];
};

type LineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
};

type PaymentMethod = 'ach' | 'amazon' | 'card';

type DiscountType = 'percentage' | 'amount';

type Discount = {
  type: DiscountType;
  value: number;
};

type MemoTemplate = {
  id: string;
  name: string;
  content: string;
  category: string;
};

const defaultMemoTemplates: MemoTemplate[] = [
  {
    id: 'memo-1',
    name: 'Net 30 - Standard',
    content: 'Payment is due within 30 days of invoice date. Thank you for your business!',
    category: 'Payment Terms'
  },
  {
    id: 'memo-2',
    name: 'Net 30 - With Late Fee',
    content: 'Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly finance charge. Questions? Please contact us at your earliest convenience.',
    category: 'Payment Terms'
  },
  {
    id: 'memo-3',
    name: 'Due on Receipt',
    content: 'Payment is due upon receipt of this invoice. Thank you for your prompt payment!',
    category: 'Payment Terms'
  },
  {
    id: 'memo-4',
    name: 'Net 15 - Quick Payment',
    content: 'Payment is due within 15 days of invoice date. We appreciate your business and prompt payment.',
    category: 'Payment Terms'
  },
  {
    id: 'memo-5',
    name: 'Payment Instructions',
    content: 'Please remit payment via ACH, credit card, or check. For ACH transfers, please contact us for banking details. Payment is due within 30 days. Thank you!',
    category: 'Payment Details'
  },
  {
    id: 'memo-6',
    name: 'Simple Thank You',
    content: 'Thank you for your business! We appreciate the opportunity to work with you. Please feel free to contact us with any questions.',
    category: 'General'
  },
  {
    id: 'memo-7',
    name: 'Work Completion',
    content: 'All services have been completed as outlined in our agreement. Thank you for choosing us. Payment is due within 30 days.',
    category: 'General'
  },
  {
    id: 'memo-8',
    name: 'Questions Welcome',
    content: 'If you have any questions about this invoice or the services provided, please don\'t hesitate to reach out. We\'re here to help. Payment due within 30 days.',
    category: 'General'
  },
  {
    id: 'memo-9',
    name: 'Deposit / Partial Payment',
    content: 'This invoice represents a partial payment for services. The remaining balance will be invoiced upon completion. Thank you!',
    category: 'Special'
  },
  {
    id: 'memo-10',
    name: 'Final Invoice',
    content: 'This is the final invoice for the completed project. All deliverables have been provided. We look forward to working with you again. Payment due within 15 days.',
    category: 'Special'
  },
  {
    id: 'memo-11',
    name: 'Recurring Service',
    content: 'This invoice covers services for the current billing period. Payment is due by the 1st of the month. Thank you for your continued business!',
    category: 'Special'
  },
  {
    id: 'memo-12',
    name: 'Early Payment Discount',
    content: 'Payment is due within 30 days. Pay within 10 days and receive a 2% discount! Please contact us if you plan to take advantage of this offer.',
    category: 'Special'
  },
].sort((a, b) => a.name.localeCompare(b.name));

// Mock existing templates for "use template" option
const existingTemplates: InvoiceTemplate[] = [
  {
    id: '1',
    name: 'Standard Monthly Bookkeeping',
    description: 'Monthly bookkeeping and basic services',
    category: 'Bookkeeping',
    icon: '📚',
    lineItems: [
      { name: 'Monthly Bookkeeping', description: 'Transaction recording and reconciliation', quantity: 1, rate: 500 },
      { name: 'Accounts Payable', description: 'AP processing and management', quantity: 1, rate: 300 },
      { name: 'Bank Reconciliation', description: 'Monthly bank reconciliation', quantity: 1, rate: 200 }
    ]
  },
  {
    id: '2',
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
    id: '3',
    name: 'Monthly Accounting Service',
    description: 'Complete accounting services',
    category: 'Accounting',
    icon: '💼',
    lineItems: [
      { name: 'Financial Statements', description: 'Monthly financial statement preparation', quantity: 1, rate: 400 },
      { name: 'General Ledger Review', description: 'GL account review and cleanup', quantity: 1, rate: 350 }
    ]
  },
  {
    id: '4',
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
    id: '5',
    name: 'Monthly Payroll Service',
    description: 'Complete payroll processing and tax filing',
    category: 'Payroll',
    icon: '💰',
    lineItems: [
      { name: 'Payroll Processing', description: 'Monthly payroll for up to 10 employees', quantity: 1, rate: 150 },
      { name: 'Payroll Tax Filing', description: 'Quarterly payroll tax returns', quantity: 0.33, rate: 125 }
    ]
  },
  {
    id: '6',
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
    id: '7',
    name: 'Annual Audit Package',
    description: 'Complete financial audit services',
    category: 'Audit',
    icon: '🔍',
    lineItems: [
      { name: 'Financial Audit', description: 'Annual financial statement audit', quantity: 1, rate: 2500 }
    ]
  },
  {
    id: '8',
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
];

// Line item template type
type LineItemTemplate = {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  defaultRate: number;
  usageCount: number;
  lastUsed: string;
};

// Line item templates
const lineItemTemplates: LineItemTemplate[] = [
  { id: 'item-1', name: 'Tax Return Preparation', description: 'Individual tax return preparation service', category: 'Tax', defaultRate: 350, usageCount: 45, lastUsed: '2024-11-10' },
  { id: 'item-2', name: 'Bookkeeping Services', description: 'Monthly bookkeeping services', category: 'Bookkeeping', defaultRate: 250, usageCount: 38, lastUsed: '2024-11-09' },
  { id: 'item-3', name: 'Financial Statement Review', description: 'Quarterly financial review and analysis', category: 'Accounting', defaultRate: 500, usageCount: 32, lastUsed: '2024-11-08' },
  { id: 'item-4', name: 'Payroll Processing', description: 'Monthly payroll processing service', category: 'Payroll', defaultRate: 150, usageCount: 28, lastUsed: '2024-11-07' },
  { id: 'item-5', name: 'Business Consultation', description: 'Strategic business consulting session', category: 'Consulting', defaultRate: 200, usageCount: 25, lastUsed: '2024-11-06' },
  { id: 'item-6', name: 'Audit Services', description: 'Internal audit services', category: 'Audit', defaultRate: 600, usageCount: 22, lastUsed: '2024-11-05' },
  { id: 'item-7', name: 'Sales Tax Filing', description: 'Quarterly sales tax preparation and filing', category: 'Tax', defaultRate: 175, usageCount: 20, lastUsed: '2024-11-04' },
  { id: 'item-8', name: 'Accounts Receivable', description: 'AR management and collection support', category: 'Bookkeeping', defaultRate: 225, usageCount: 18, lastUsed: '2024-11-03' },
  { id: 'item-9', name: 'Financial Planning', description: 'Annual financial planning and budgeting', category: 'Consulting', defaultRate: 450, usageCount: 15, lastUsed: '2024-11-02' },
  { id: 'item-10', name: 'Compliance Review', description: 'Regulatory compliance review', category: 'Audit', defaultRate: 550, usageCount: 12, lastUsed: '2024-11-01' },
];

interface CreateInvoiceTemplateWizardProps {
  onClose: () => void;
  onSave: (template: InvoiceTemplate) => void;
}

export function CreateInvoiceTemplateWizard({ onClose, onSave }: CreateInvoiceTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'template' | 'lineItems'>('basic');
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['basic']));
  const [startMethod, setStartMethod] = useState<'scratch' | 'template' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  // Form data
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('Tax');
  const [templateIcon, setTemplateIcon] = useState('📋');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(['card']);
  const [memo, setMemo] = useState('Payment is due upon receipt of this invoice. Thank you for your prompt payment!');
  const [memoTemplates, setMemoTemplates] = useState<MemoTemplate[]>(defaultMemoTemplates);
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [showMemoTemplateDialog, setShowMemoTemplateDialog] = useState(false);
  const [editingMemoTemplate, setEditingMemoTemplate] = useState<MemoTemplate | null>(null);
  const [memoTemplateForm, setMemoTemplateForm] = useState({ name: '', content: '', category: 'General' });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData | null>(null);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [discountInput, setDiscountInput] = useState({ type: 'percentage' as DiscountType, value: '' });
  
  // Line item template dialog
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showTemplateItems, setShowTemplateItems] = useState(true);
  const [itemSearch, setItemSearch] = useState('');
  const [dialogClickCount, setDialogClickCount] = useState(0);
  const [newItem, setNewItem] = useState({ name: '', description: '', quantity: '1', rate: '' });
  
  // Icon library dialog
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  
  // Validation dialog
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationType, setValidationType] = useState<'name' | 'category'>('name');

  // Ref for auto-focus
  const templateNameInputRef = useRef<HTMLInputElement>(null);
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const newLineItemInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus template name on mount
  useEffect(() => {
    if (currentStep === 'basic' && templateNameInputRef.current) {
      setTimeout(() => {
        templateNameInputRef.current?.focus();
        templateNameInputRef.current?.select();
      }, 100);
    }
  }, [currentStep]);

  // Auto-focus discount input when popup opens
  useEffect(() => {
    if (showDiscountPopup) {
      setTimeout(() => {
        discountInputRef.current?.focus();
        discountInputRef.current?.select();
      }, 200);
    }
  }, [showDiscountPopup]);

  // Step configurations for navigation - 3 steps if using template, 2 if from scratch
  const stepConfigs: StepConfig[] = startMethod === 'template'
    ? [
        { id: 'basic', label: 'Basic Info', number: 1 },
        { id: 'template', label: 'Template', number: 2 },
        { id: 'lineItems', label: 'Line Items', number: 3 },
      ]
    : [
        { id: 'basic', label: 'Basic Info', number: 1 },
        { id: 'lineItems', label: 'Line Items', number: 2 },
      ];

  const handleStepNavigation = (stepId: string) => {
    const step = stepId as 'basic' | 'template' | 'lineItems';
    
    // Validate when trying to navigate forward
    if (step === 'template' || step === 'lineItems') {
      if (!templateName.trim()) {
        setValidationType('name');
        setShowValidationDialog(true);
        return;
      }
      if (!templateCategory) {
        setValidationType('category');
        setShowValidationDialog(true);
        return;
      }
    }
    
    setCurrentStep(step);
    setVisitedSteps(new Set([...visitedSteps, step]));
    
    // Reset selections when going back to basic step
    if (step === 'basic' && startMethod === 'scratch') {
      setStartMethod(null);
      setSelectedTemplate(null);
      setTemplateCategory('Tax'); // Reset to default
    }
  };

  const handleStartFromScratch = () => {
    if (!templateName.trim()) {
      setValidationType('name');
      setShowValidationDialog(true);
      return;
    }
    if (!templateCategory) {
      setValidationType('category');
      setShowValidationDialog(true);
      return;
    }
    
    setStartMethod('scratch');
    setVisitedSteps(new Set([...visitedSteps, 'lineItems']));
    setCurrentStep('lineItems');
  };

  const handleContinueToTemplateSelection = () => {
    if (!templateName.trim()) {
      setValidationType('name');
      setShowValidationDialog(true);
      return;
    }
    if (!templateCategory) {
      setValidationType('category');
      setShowValidationDialog(true);
      return;
    }
    
    setStartMethod('template');
    setVisitedSteps(new Set([...visitedSteps, 'template']));
    setCurrentStep('template');
  };

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    
    // Populate line items from template
    const items: LineItem[] = template.lineItems.map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      rate: item.rate
    }));
    setLineItems(items);
    
    setVisitedSteps(new Set([...visitedSteps, 'lineItems']));
    setCurrentStep('lineItems');
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      rate: 0
    };
    setLineItems([...lineItems, newItem]);
    
    // Focus on the new line item's name input after render
    setTimeout(() => {
      newLineItemInputRef.current?.focus();
    }, 100);
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleIncrementQuantity = (id: string) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrementQuantity = (id: string) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
    ));
  };

  const handleIncrementRate = (id: string) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, rate: item.rate + 10 } : item
    ));
  };

  const handleDecrementRate = (id: string) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, rate: Math.max(0, item.rate - 10) } : item
    ));
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Line item template handlers
  const handleDialogBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const newCount = dialogClickCount + 1;
      setDialogClickCount(newCount);
      
      if (newCount === 1) {
        toast.info('Click outside again to close');
      }
      
      if (newCount === 2) {
        setShowAddItemDialog(false);
        setDialogClickCount(0);
        return;
      }
      
      setTimeout(() => setDialogClickCount(0), 2000);
    }
  };

  const handleAddLineItemTemplate = (item: LineItemTemplate) => {
    const newInvoiceItem: LineItem = {
      id: `item-${Date.now()}`,
      name: item.name,
      description: item.description || '',
      quantity: 1,
      rate: item.defaultRate,
    };
    setLineItems([...lineItems, newInvoiceItem]);
    setShowAddItemDialog(false);
    toast.success(`Added ${item.name}`);
  };

  const handleAddCustomItem = () => {
    if (!newItem.name.trim() || !newItem.quantity || !newItem.rate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const invoiceItem: LineItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      quantity: parseInt(newItem.quantity),
      rate: parseFloat(newItem.rate),
    };

    setLineItems([...lineItems, invoiceItem]);
    setNewItem({ name: '', description: '', quantity: '1', rate: '' });
    setShowAddItemDialog(false);
    toast.success(`Added ${invoiceItem.name}`);
  };

  // Filtered line item templates
  const filteredLineItemTemplates = lineItemTemplates.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput.value);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (discountInput.type === 'percentage' && value > 100) {
      toast.error('Percentage cannot exceed 100%');
      return;
    }

    setDiscount({ type: discountInput.type, value });
    setShowDiscountPopup(false);
    toast.success('Discount applied');
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountInput({ type: 'percentage', value: '' });
    toast.success('Discount removed');
  };

  const handleSaveMemoTemplate = () => {
    if (!memoTemplateForm.name.trim() || !memoTemplateForm.content.trim()) {
      toast.error('Please provide both name and content');
      return;
    }

    if (editingMemoTemplate) {
      // Update existing template
      setMemoTemplates((prev) => prev.map((t) => 
        t.id === editingMemoTemplate.id 
          ? { ...t, ...memoTemplateForm }
          : t
      ).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Template updated!');
    } else {
      // Create new template
      const newTemplate: MemoTemplate = {
        id: `memo-${Date.now()}`,
        ...memoTemplateForm
      };
      setMemoTemplates((prev) => [...prev, newTemplate].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Template created!');
    }

    setShowMemoTemplateDialog(false);
    setMemoTemplateForm({ name: '', content: '', category: 'General' });
    setEditingMemoTemplate(null);
  };

  const handleSaveTemplate = () => {
    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const newTemplate: InvoiceTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      icon: templateIcon,
      isRecurring: !!recurrenceData,
      lineItems: lineItems.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    onSave(newTemplate);
    toast.success('Template saved successfully!');
  };

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    if (!discount) return subtotal;
    
    const discountAmount = discount.type === 'percentage' 
      ? subtotal * (discount.value / 100)
      : discount.value;
    
    return Math.max(0, subtotal - discountAmount);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTemplateTotal = (template: InvoiceTemplate) => {
    return template.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
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

  // Filter templates by category
  const filteredTemplates = selectedCategoryFilter === 'All'
    ? existingTemplates
    : existingTemplates.filter(t => t.category === selectedCategoryFilter);

  // Get template count by category
  const getTemplateCount = (category: TemplateCategory | 'All') => {
    if (category === 'All') return existingTemplates.length;
    return existingTemplates.filter(t => t.category === category).length;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with Step Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Create Invoice Template</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {startMethod === 'template' ? (
              <>
                Step {currentStep === 'basic' ? '1' : currentStep === 'template' ? '2' : '3'} of 3: {
                  currentStep === 'basic' ? 'Basic Information' : 
                  currentStep === 'template' ? 'Select Template' : 
                  'Configure Line Items'
                }
              </>
            ) : (
              <>
                Step {currentStep === 'basic' ? '1' : '2'} of 2: {currentStep === 'basic' ? 'Basic Information' : 'Configure Line Items'}
              </>
            )}
          </p>
        </div>

        {/* Step Navigation */}
        <StepNavigation
          steps={stepConfigs}
          currentStepId={currentStep}
          visitedStepIds={visitedSteps}
          onStepClick={handleStepNavigation}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {currentStep === 'basic' && (
          <div className="max-w-6xl mx-auto p-8 space-y-6">
            {/* Template Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-4">Template Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Template Name <span className="text-red-500 text-lg">*</span> <span className="text-xs text-gray-500 dark:text-gray-400">(Required)</span>
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Monthly Bookkeeping Package"
                    className={`w-full px-3 py-2 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 transition-all ${
                      templateName.trim() 
                        ? 'border border-gray-300 dark:border-gray-700' 
                        : 'border-2'
                    }`}
                    style={!templateName.trim() ? { borderColor: 'var(--primaryColor)' } : {}}
                    ref={templateNameInputRef}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Description <span className="text-xs text-gray-500">(Optional)</span></label>
                  <Textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    rows={2}
                  />
                </div>

                {/* Visual Category Selection - Required Field */}
                <div 
                  ref={categorySectionRef}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 transition-all ${
                    templateCategory 
                      ? 'border border-gray-200 dark:border-gray-700' 
                      : 'border-2 shadow-lg'
                  }`}
                  style={!templateCategory ? { borderColor: 'var(--primaryColor)' } : {}}
                >
                  <label className="block text-sm font-medium mb-3">
                    Category <span className="text-red-500 text-lg">*</span> <span className="text-xs text-gray-500 dark:text-gray-400">(Required)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategory(cat)}
                        className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                          templateCategory === cat
                            ? 'border-[var(--primaryColor)] shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        style={templateCategory === cat ? { backgroundColor: `${CATEGORY_COLORS[cat]}10` } : {}}
                      >
                        <div className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</div>
                        <div className="text-sm font-medium">{cat}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Section - Optional */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">Select Icon <span className="text-xs text-gray-500">(Optional)</span></label>
                  
                  {/* Icons with Selected Display in Center */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 justify-center">
                      {/* Left Column */}
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(0, 3).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(3, 6).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(6, 9).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      {/* Center - Selected Icon Display */}
                      <div className="mx-2">
                        <div className="w-36 h-36 flex items-center justify-center rounded-2xl border-4 shadow-xl bg-white dark:bg-gray-800" style={{ borderColor: 'var(--primaryColor)' }}>
                          <span className="text-7xl">{templateIcon}</span>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(9, 12).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(12, 15).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {QUICK_SELECT_ICONS.slice(15, 18).map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setTemplateIcon(icon)}
                            className={`h-11 w-11 flex items-center justify-center text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                              templateIcon === icon
                                ? 'border-[var(--primaryColor)] bg-white dark:bg-gray-800 shadow-md'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[var(--primaryColor)]'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Browse Library Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIconLibrary(true)}
                    className="w-full bg-white dark:bg-gray-800"
                  >
                    Browse Full Icon Library
                  </Button>
                </div>
              </div>
            </div>

            {/* Start Method Selection */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 shadow-lg relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primaryColor)] opacity-5 rounded-full -mr-16 -mt-16"></div>
              
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--primaryColor)' }}>
                How would you like to start? <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Choose your starting point for this invoice template
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Start from Scratch */}
                <button
                  onClick={handleStartFromScratch}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative bg-white dark:bg-gray-800 ${
                    startMethod === 'scratch'
                      ? 'border-[var(--primaryColor)] shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="font-medium mb-1">Start from Scratch</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Build your template from the ground up
                  </p>
                  {startMethod === 'scratch' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Use Existing Template */}
                <button
                  onClick={handleContinueToTemplateSelection}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative bg-white dark:bg-gray-800 ${
                    startMethod === 'template'
                      ? 'border-[var(--primaryColor)] shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="font-medium mb-1">Use Existing Template</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start with a template and customize it
                  </p>
                  {startMethod === 'template' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Cancel Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Template Selection (only shown when using template method) */}
        {currentStep === 'template' && (
          <div className="max-w-6xl mx-auto p-8 space-y-6">
            {/* Start from Scratch option */}
            <div className="mb-6">
              <button
                onClick={() => handleStepNavigation('lineItems')}
                className="w-full p-6 rounded-xl border-2 border-dashed bg-purple-50 dark:bg-purple-950/20 border-[var(--primaryColor)] hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-all flex items-center gap-4 group shadow-sm"
              >
                <div className="text-4xl">✏️</div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--primaryColor)' }}>Start from Scratch</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a custom invoice template with your own line items
                  </p>
                </div>
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                  selectedCategoryFilter === 'All'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600'
                }`}
                style={selectedCategoryFilter === 'All' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                All ({getTemplateCount('All')})
              </button>
              {TEMPLATE_CATEGORIES.map((category) => {
                const count = getTemplateCount(category);
                if (count === 0) return null;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategoryFilter(category)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                      selectedCategoryFilter === category
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600'
                    }`}
                    style={selectedCategoryFilter === category ? { backgroundColor: CATEGORY_COLORS[category] } : {}}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>

            {/* 3-Column Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const templateTotal = calculateTemplateTotal(template);
                const isExpanded = expandedTemplates.has(template.id);
                const displayedItems = isExpanded ? template.lineItems : template.lineItems.slice(0, 3);

                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-6 rounded-xl border-2 transition-all relative overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg group"
                  >
                        {/* Total Badge */}
                        {templateTotal > 0 && (
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                            ${templateTotal.toFixed(2)}
                          </div>
                        )}
                        
                        <div className="text-4xl mb-3">{template.icon}</div>
                        <h3 className="text-lg font-medium mb-2 pr-24">{template.name}</h3>
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
                  </div>
                );
              })}
            </div>

            {/* Bottom Cancel Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'lineItems' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Template Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Template Info Card - Show Category */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{templateIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Template name"
                          className="text-xl font-medium flex-1"
                        />
                      </div>
                      {templateDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{templateDescription}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: CATEGORY_COLORS[templateCategory] }}>
                          {CATEGORY_ICONS[templateCategory]} {templateCategory}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Line Items Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Line Items
                </h3>
                
                {/* Discount Toggle - Small and Subtle */}
                {discount ? (
                  <button
                    onClick={handleRemoveDiscount}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30"
                  >
                    <Percent className="w-3.5 h-3.5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`} off
                    </span>
                    <X className="w-3 h-3 text-green-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDiscountPopup(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Add Discount</span>
                  </button>
                )}
              </div>

              {lineItems.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-center mb-6">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500 mb-6">No line items yet</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
                    <button
                      onClick={handleAddLineItem}
                      className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                    >
                      <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                      <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter manually
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateItems(true);
                        setShowAddItemDialog(true);
                      }}
                      className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                    >
                      <Clock className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                      <h3 className="font-medium text-[var(--primaryColor)] mb-1">Use Template</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pick saved items
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] transition-colors bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}>
                              #{index + 1}
                            </span>
                            <Input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateLineItem(item.id, 'name', e.target.value)}
                              onFocus={(e) => e.target.select()}
                              placeholder="Service or product name"
                              className="flex-1 font-medium"
                              ref={index === lineItems.length - 1 ? newLineItemInputRef : undefined}
                            />
                          </div>
                          <Input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Description (optional)"
                            className="text-sm text-gray-500"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ml-2 gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Quantity</Label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDecrementQuantity(item.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                              style={{ color: 'var(--primaryColor)' }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="text-center h-10"
                              min="0"
                              step="0.01"
                              style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                            />
                            <button
                              onClick={() => handleIncrementQuantity(item.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                              style={{ color: 'var(--primaryColor)' }}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Rate</Label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDecrementRate(item.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                              style={{ color: 'var(--primaryColor)' }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleUpdateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="text-center h-10"
                              min="0"
                              step="0.01"
                              style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                            />
                            <button
                              onClick={() => handleIncrementRate(item.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                              style={{ color: 'var(--primaryColor)' }}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Amount</Label>
                          <div className="h-10 px-3 flex items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-md border-2 border-purple-200 dark:border-purple-900">
                            <span className="font-medium" style={{ color: 'var(--primaryColor)' }}>${(item.quantity * item.rate).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Item Buttons - Two Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddLineItem}
                      className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                      <div className="text-center">
                        <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Create Custom</div>
                        <div className="text-xs text-gray-500 mt-1">Enter manually</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateItems(true);
                        setShowAddItemDialog(true);
                      }}
                      className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                      <div className="text-center">
                        <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Use Template</div>
                        <div className="text-xs text-gray-500 mt-1">Pick saved items</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            {lineItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                {discount ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`})</span>
                      <span>-${(calculateSubtotal() - calculateTotal()).toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-lg font-medium">Template Total</span>
                      <span className="text-2xl font-semibold" style={{ color: 'var(--primaryColor)' }}>
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Template Total</span>
                    <span className="text-2xl font-semibold" style={{ color: 'var(--primaryColor)' }}>
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Recurring Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base flex items-center gap-2">
                  <Repeat className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Recurring Settings
                </h3>
                
                {/* Recurring Toggle */}
                <button
                  onClick={() => {
                    const newIsRecurring = !recurrenceData;
                    if (newIsRecurring) {
                      setRecurrenceData({
                        pattern: 'monthly',
                        interval: 1,
                        endType: 'never'
                      });
                    } else {
                      setRecurrenceData(null);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    recurrenceData 
                      ? 'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800' 
                      : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" style={{ color: recurrenceData ? 'var(--primaryColor)' : undefined }} />
                  <span className={recurrenceData ? 'font-medium' : ''} style={{ color: recurrenceData ? 'var(--primaryColor)' : undefined }}>
                    Recurring
                  </span>
                </button>
              </div>

              {recurrenceData && (
                <div>
                  <RecurrenceSelector
                    value={recurrenceData}
                    onChange={setRecurrenceData}
                    allowEndDate={false}
                    showTemplateMessage={true}
                  />
                </div>
              )}

              {!recurrenceData && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This template will create one-time invoices. Enable recurring to automatically generate invoices on a schedule.
                </p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <Label className="mb-4 block text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                Payment Methods
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => togglePaymentMethod('card')}
                  className={`p-5 border-2 rounded-xl transition-all ${
                    selectedPaymentMethods.includes('card')
                      ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mb-3 mx-auto" style={selectedPaymentMethods.includes('card') ? { color: 'var(--primaryColor)' } : {}} />
                  <div className="font-medium">Card</div>
                  <div className="text-xs text-gray-500 mt-1">Credit/Debit</div>
                </button>
                <button
                  onClick={() => togglePaymentMethod('ach')}
                  className={`p-5 border-2 rounded-xl transition-all ${
                    selectedPaymentMethods.includes('ach')
                      ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Building className="w-8 h-8 mb-3 mx-auto" style={selectedPaymentMethods.includes('ach') ? { color: 'var(--primaryColor)' } : {}} />
                  <div className="font-medium">ACH</div>
                  <div className="text-xs text-gray-500 mt-1">Bank Transfer</div>
                </button>
                <button
                  onClick={() => togglePaymentMethod('amazon')}
                  className={`p-5 border-2 rounded-xl transition-all ${
                    selectedPaymentMethods.includes('amazon')
                      ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">🛒</div>
                  <div className="font-medium">Amazon Pay</div>
                  <div className="text-xs text-gray-500 mt-1">Quick checkout</div>
                </button>
              </div>
              
              {/* Warning if no payment methods selected */}
              {selectedPaymentMethods.length === 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ Please select at least one payment method. Clients cannot pay without payment options.
                  </p>
                </div>
              )}
            </div>

            {/* Memo */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--primaryColor)' }}>Invoice Memo</h3>
                </div>
                <button
                  onClick={() => setShowMemoTemplates(!showMemoTemplates)}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                  style={{ color: 'var(--primaryColor)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  {showMemoTemplates ? 'Hide Templates' : 'Use Template'}
                </button>
              </div>

              {showMemoTemplates && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose from {memoTemplates.length} templates or create your own
                    </p>
                    <button
                      onClick={() => {
                        setMemoTemplateForm({ name: '', content: '', category: 'General' });
                        setEditingMemoTemplate(null);
                        setShowMemoTemplateDialog(true);
                      }}
                      className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                      style={{ borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }}
                    >
                      <Plus className="w-4 h-4" />
                      New Template
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {memoTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="relative p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
                      >
                        <button
                          onClick={() => {
                            setMemo(template.content);
                            setShowMemoTemplates(false);
                            toast.success(`Applied "${template.name}"`);
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-sm pr-2">{template.name}</div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0" style={{ color: 'var(--primaryColor)' }}>
                              {template.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{template.content}</div>
                        </button>
                        
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMemoTemplateForm({
                                name: template.name,
                                content: template.content,
                                category: template.category
                              });
                              setEditingMemoTemplate(template);
                              setShowMemoTemplateDialog(true);
                            }}
                            className="p-1.5 bg-white dark:bg-gray-800 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-200 dark:border-gray-700"
                            style={{ color: 'var(--primaryColor)' }}
                            title="Edit template"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${template.name}"?`)) {
                                setMemoTemplates((prev) => prev.filter((t) => t.id !== template.id));
                                toast.success('Template deleted');
                              }
                            }}
                            className="p-1.5 px-2 bg-white dark:bg-gray-800 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 text-red-600 flex items-center gap-1"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-xs">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add payment instructions, terms, or notes for your client..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Right Column - Template Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl border-2 rounded-xl" style={{ borderColor: 'var(--primaryColor)' }}>
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm opacity-90">Template Preview</p>
                      <p className="text-lg font-semibold">{templateName || 'New Template'}</p>
                    </div>
                    <FileText className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                {/* Preview Body - Stripe Style */}
                <div className="p-8 bg-white dark:bg-gray-900 relative">
                  {/* Template Icon Background */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <div className="text-7xl">{templateIcon}</div>
                  </div>

                  {/* Total Amount - Large */}
                  <div className="mb-1">
                    <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                      ${calculateTotal().toFixed(2)}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="mb-8 text-gray-500 text-sm">
                    {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
                    {recurrenceData && ` • ${recurrenceData.pattern}`}
                  </div>

                  {/* Three Row Layout */}
                  <div className="space-y-2 mb-6">
                    {/* Category */}
                    <div className="flex gap-8">
                      <span className="text-gray-500 text-sm w-24">Category</span>
                      <span className="text-gray-900 dark:text-gray-100 text-sm">
                        {templateCategory}
                      </span>
                    </div>

                    {/* Line Items */}
                    <div className="flex gap-8">
                      <span className="text-gray-500 text-sm w-24">Line Items</span>
                      <span className="text-gray-900 dark:text-gray-100 text-sm">
                        {lineItems.length > 0 ? `${lineItems.length} ${lineItems.length === 1 ? 'item' : 'items'}` : 'No items'}
                      </span>
                    </div>

                    {/* Payment Methods */}
                    <div className="flex gap-8">
                      <span className="text-gray-500 text-sm w-24">Payments</span>
                      <span className="text-gray-900 dark:text-gray-100 text-sm">
                        {selectedPaymentMethods.length > 0 
                          ? selectedPaymentMethods.map(m => m.toUpperCase()).join(', ')
                          : 'None selected'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Discount badge if applied */}
                  {discount && (
                    <div className="mb-4 inline-block">
                      <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        {discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}
                      </span>
                    </div>
                  )}

                  {/* View template details link */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-gray-500 text-sm">
                      {memo ? (
                        <div className="line-clamp-2">{memo}</div>
                      ) : (
                        <div className="italic">No memo added</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleSaveTemplate}
                  className="w-full gap-2 h-12"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStepNavigation('basic')}
                  >
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        )}
      </div>

      {/* Memo Template Dialog */}
      {showMemoTemplateDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMemoTemplateDialog(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                  <span style={{ color: 'var(--primaryColor)' }}>
                    {editingMemoTemplate ? 'Edit Memo Template' : 'New Memo Template'}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingMemoTemplate ? 'Update your memo template' : 'Create a reusable memo template'}
                </p>
              </div>
              <button
                onClick={() => setShowMemoTemplateDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="template-name" className="text-base mb-2 block">Template Name</Label>
                <Input
                  id="template-name"
                  value={memoTemplateForm.name}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, name: e.target.value })}
                  placeholder="e.g., Net 30 - Standard"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="template-category" className="text-base mb-2 block">Category</Label>
                <select
                  id="template-category"
                  value={memoTemplateForm.category}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="General">General</option>
                  <option value="Payment Terms">Payment Terms</option>
                  <option value="Payment Details">Payment Details</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <Label htmlFor="template-content" className="text-base mb-2 block">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={memoTemplateForm.content}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, content: e.target.value })}
                  placeholder="Enter the memo text that will be used when this template is selected..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMemoTemplateDialog(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveMemoTemplate}
                  className="flex-1 h-11 text-white"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingMemoTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Popup */}
      {showDiscountPopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDiscountPopup(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">Add Discount</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply a discount to this template</p>
              </div>
              <button
                onClick={() => setShowDiscountPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base mb-3 block">Discount Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setDiscountInput({ ...discountInput, type: 'percentage' });
                      setTimeout(() => {
                        discountInputRef.current?.focus();
                      }, 100);
                    }}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      discountInput.type === 'percentage'
                        ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Percent className="w-6 h-6 mx-auto mb-2" style={discountInput.type === 'percentage' ? { color: 'var(--primaryColor)' } : {}} />
                    <div className="font-medium">Percentage</div>
                    <div className="text-xs text-gray-500 mt-1">e.g., 10%</div>
                  </button>
                  <button
                    onClick={() => {
                      setDiscountInput({ ...discountInput, type: 'amount' });
                      setTimeout(() => {
                        discountInputRef.current?.focus();
                      }, 100);
                    }}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      discountInput.type === 'amount'
                        ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-2" style={discountInput.type === 'amount' ? { color: 'var(--primaryColor)' } : {}} />
                    <div className="font-medium">Fixed Amount</div>
                    <div className="text-xs text-gray-500 mt-1">e.g., $50</div>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="discountValue" className="text-base">
                  {discountInput.type === 'percentage' ? 'Percentage Off' : 'Amount Off'}
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      const currentValue = parseFloat(discountInput.value) || 0;
                      const step = discountInput.type === 'percentage' ? 1 : 1;
                      const newValue = Math.max(0, currentValue - step);
                      setDiscountInput({ ...discountInput, value: newValue.toString() });
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="relative flex-1">
                    {discountInput.type === 'amount' && (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    )}
                    {discountInput.type === 'percentage' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ fontSize: '1.125rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        %
                      </span>
                    )}
                    <Input
                      id="discountValue"
                      type="text"
                      value={discountInput.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers, decimals, and empty string
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setDiscountInput({ ...discountInput, value });
                        }
                      }}
                      className={`h-12 text-center ${discountInput.type === 'amount' || discountInput.type === 'percentage' ? 'pl-10' : ''}`}
                      placeholder={discountInput.type === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
                      style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                      ref={discountInputRef}
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      const currentValue = parseFloat(discountInput.value) || 0;
                      const step = discountInput.type === 'percentage' ? 1 : 1;
                      const max = discountInput.type === 'percentage' ? 100 : Infinity;
                      const newValue = Math.min(max, currentValue + step);
                      setDiscountInput({ ...discountInput, value: newValue.toString() });
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDiscountPopup(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyDiscount}
                  className="flex-1 h-12"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  Apply Discount
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      {showAddItemDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleDialogBackdropClick}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-medium">Add Line Item</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose from templates or create a custom line item
                  </p>
                </div>
                <button
                  onClick={() => setShowAddItemDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateItems(true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    showTemplateItems
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Line Item Templates
                </button>
                <button
                  onClick={() => setShowTemplateItems(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    !showTemplateItems
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Custom
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {showTemplateItems ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search line item templates..."
                      className="pl-11 h-12"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-6">
                    {TEMPLATE_CATEGORIES.map((category) => {
                      const categoryItems = filteredLineItemTemplates.filter((item) => item.category === category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-3.5 h-3.5" style={{ color: CATEGORY_COLORS[category] }} />
                            <h4 className="text-xs font-medium" style={{ color: CATEGORY_COLORS[category] }}>
                              {category}
                            </h4>
                            <div 
                              className="h-px flex-1"
                              style={{ backgroundColor: `${CATEGORY_COLORS[category]}40` }}
                            />
                          </div>
                          <div className="grid gap-3">
                            {categoryItems.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleAddLineItemTemplate(item)}
                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left group"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium group-hover:text-[var(--primaryColor)] transition-colors">{item.name}</p>
                                    {item.description && (
                                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-lg font-medium" style={{ color: 'var(--primaryColor)' }}>${item.defaultRate}</p>
                                    <p className="text-xs text-gray-500">default rate</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Used {item.usageCount}x</span>
                                  </div>
                                  <span>•</span>
                                  <span>Last: {new Date(item.lastUsed).toLocaleDateString()}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <Label htmlFor="newItemName" className="text-base">Item Name <span className="text-red-500 text-lg">*</span> <span className="text-xs text-gray-500 dark:text-gray-400">(Required)</span></Label>
                    <Input
                      id="newItemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g., Tax Return Preparation"
                      className={`mt-2 h-12 focus:ring-2 focus:ring-purple-500 transition-all ${
                        newItem.name.trim() 
                          ? 'border border-gray-300 dark:border-gray-700' 
                          : 'border-2'
                      }`}
                      style={!newItem.name.trim() ? { borderColor: 'var(--primaryColor)' } : {}}
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="newItemDescription" className="text-base text-gray-700 dark:text-gray-300">Description <span className="text-xs text-gray-500">(Optional)</span></Label>
                    <Textarea
                      id="newItemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      placeholder="Add a detailed description of this service..."
                      rows={3}
                      className="mt-2 resize-none border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newItemQuantity" className="text-base">Quantity <span className="text-red-500 text-lg">*</span> <span className="text-xs text-gray-500 dark:text-gray-400">(Required)</span></Label>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(1, parseInt(newItem.quantity || '1') - 1);
                            setNewItem({ ...newItem, quantity: newQty.toString() });
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                          style={{ color: 'var(--primaryColor)' }}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <Input
                          id="newItemQuantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          min="1"
                          className={`h-12 text-center flex-1 focus:ring-2 focus:ring-purple-500 transition-all ${
                            newItem.quantity && parseFloat(newItem.quantity) > 0
                              ? 'border border-gray-300 dark:border-gray-700' 
                              : 'border-2'
                          }`}
                          style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '500', 
                            letterSpacing: '0.01em',
                            ...((!newItem.quantity || parseFloat(newItem.quantity) <= 0) && { borderColor: 'var(--primaryColor)' })
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = parseInt(newItem.quantity || '1') + 1;
                            setNewItem({ ...newItem, quantity: newQty.toString() });
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                          style={{ color: 'var(--primaryColor)' }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newItemRate" className="text-base">Rate <span className="text-red-500 text-lg">*</span> <span className="text-xs text-gray-500 dark:text-gray-400">(Required)</span></Label>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newRate = Math.max(0, parseFloat(newItem.rate || '0') - 1);
                            setNewItem({ ...newItem, rate: newRate.toString() });
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                          style={{ color: 'var(--primaryColor)' }}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="newItemRate"
                            type="number"
                            value={newItem.rate}
                            onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                            onFocus={(e) => e.target.select()}
                            min="0"
                            step="0.01"
                            className={`pl-10 h-12 text-center focus:ring-2 focus:ring-purple-500 transition-all ${
                              newItem.rate && parseFloat(newItem.rate) > 0
                                ? 'border border-gray-300 dark:border-gray-700' 
                                : 'border-2'
                            }`}
                            style={{ 
                              fontSize: '1.125rem', 
                              fontWeight: '500', 
                              letterSpacing: '0.01em',
                              ...((!newItem.rate || parseFloat(newItem.rate) <= 0) && { borderColor: 'var(--primaryColor)' })
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newRate = parseFloat(newItem.rate || '0') + 1;
                            setNewItem({ ...newItem, rate: newRate.toString() });
                          }}
                          className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                          style={{ color: 'var(--primaryColor)' }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddCustomItem}
                    className="w-full mt-6 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Custom Item
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Name Validation Dialog */}
      {showValidationDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowValidationDialog(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200 dark:border-red-900">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {validationType === 'name' ? 'Template Name Required' : 'Category Required'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {validationType === 'name' 
                    ? 'Please enter a template name before continuing. This helps you identify and organize your invoice templates.'
                    : 'Please select a category before continuing. This helps organize your templates by type.'
                  }
                </p>
                <Button
                  onClick={() => {
                    setShowValidationDialog(false);
                    setTimeout(() => {
                      if (validationType === 'name') {
                        templateNameInputRef.current?.focus();
                      } else {
                        categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="w-full h-11"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Icon Library Modal */}
      {showIconLibrary && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowIconLibrary(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Icon Library</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose an icon for your template
                </p>
              </div>
              <button
                onClick={() => setShowIconLibrary(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Icon Categories - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {Object.entries(ICON_LIBRARY).map(([category, icons]) => (
                <div key={category}>
                  <h3 className="font-medium mb-3" style={{ color: 'var(--primaryColor)' }}>
                    {category}
                  </h3>
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setTemplateIcon(icon);
                          setShowIconLibrary(false);
                        }}
                        className={`h-12 w-12 flex items-center justify-center text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                          templateIcon === icon
                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/30 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        title={icon}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
                <span className="text-3xl">{templateIcon}</span>
              </div>
              <Button
                onClick={() => setShowIconLibrary(false)}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}