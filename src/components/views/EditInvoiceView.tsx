// EditInvoiceView - Complete rebuild for editing invoices
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  User,
  Building2,
  Check,
  Calendar,
  CreditCard,
  Building,
  Percent,
  Search,
  Download,
  Send,
  X,
  Repeat,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  Pencil,
  ChevronUp,
  ChevronDown,
  Tag,
  MessageSquare,
  Save,
  Eye,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { formatDateDisplay } from '../../lib/dateFormatting';
import { RecurrenceSelector, RecurrenceData } from '../RecurrenceSelector';
import { FullInvoicePreview } from '../FullInvoicePreview';
import { StepNavigation, Step as StepConfig } from '../StepNavigation';
import { LineItemsCard, InvoiceItem as LineItemsCardItem, Discount as LineItemsCardDiscount } from '../invoice/LineItemsCard';
import { PaymentMethodsCard, PaymentMethod as PaymentMethodsCardMethod } from '../invoice/PaymentMethodsCard';
import { MemoCardWithTemplates, MemoTemplate } from '../invoice/MemoCardWithTemplates';
import { DiscountDialog, DiscountType as DiscountDialogType } from '../invoice/DiscountDialog';
import { LineItemTemplateDialog, LineItemTemplate as LineItemTemplateDialogTemplate } from '../invoice/LineItemTemplateDialog';

// Types
type Client = {
  id: string;
  name: string;
  email: string;
  type: 'Individual' | 'Business';
  companyName?: string;
};

type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: 'Bookkeeping' | 'Tax' | 'Consulting' | 'Audit' | 'Payroll' | 'Other';
  icon: string;
  items: Omit<InvoiceItem, 'id' | 'amount'>[];
};

type LineItemTemplate = {
  id: string;
  name: string;
  description?: string;
  category: 'Bookkeeping' | 'Tax' | 'Consulting' | 'Audit' | 'Payroll' | 'Other';
  defaultRate: number;
  usageCount: number;
  lastUsed: string;
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

type TemplateCategory = 'Bookkeeping' | 'Tax' | 'Consulting' | 'Audit' | 'Payroll' | 'Other';

type InvoiceStep = 'details' | 'client' | 'template';

const TEMPLATE_CATEGORIES: TemplateCategory[] = ['Tax', 'Bookkeeping', 'Consulting', 'Payroll', 'Audit', 'Other'];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Bookkeeping': '#8B5CF6',
  'Tax': '#3B82F6',
  'Consulting': '#10B981',
  'Audit': '#F59E0B',
  'Payroll': '#EF4444',
  'Other': '#6B7280',
};

// Mock data
const mockInvoices = [
  {
    id: '1',
    invoiceNo: 'INV-2024-001',
    client: 'Smith Family Trust',
    clientId: '1',
    clientType: 'Individual' as const,
    email: 'john.smith@email.com',
    amountDue: 1850,
    dueDate: '2024-12-31',
    status: 'Sent to Client' as const,
    year: '2024',
    sentOn: '2024-11-15',
    paymentMethod: ['ACH', 'Wire'] as const,
    items: [
      { id: '1', name: 'Monthly Bookkeeping', description: 'November 2024 bookkeeping services', quantity: 1, rate: 500, amount: 500 },
      { id: '2', name: 'Tax Consultation', description: 'Q4 tax planning session', quantity: 2, rate: 350, amount: 700 },
      { id: '3', name: 'Financial Report Preparation', description: '', quantity: 1, rate: 650, amount: 650 },
    ],
    memo: 'Payment is due upon receipt of this invoice. Thank you for your prompt payment!',
  },
  {
    id: '2',
    invoiceNo: 'INV-2024-0002',
    client: 'John Smith',
    clientId: '102',
    clientType: 'Individual' as const,
    email: 'john.smith@email.com',
    amountDue: 1200,
    dueDate: '2024-11-10',
    status: 'Viewed' as const,
    year: '2024',
    sentOn: '2024-10-20',
    paymentMethod: ['ACH'] as const,
    items: [
      { id: '1', name: 'Individual Tax Return', description: '2024 tax return preparation', quantity: 1, rate: 750, amount: 750 },
      { id: '2', name: 'State Tax Filing', description: 'State tax return', quantity: 1, rate: 250, amount: 250 },
      { id: '3', name: 'Tax Planning Consultation', description: '1-hour tax planning session', quantity: 1, rate: 200, amount: 200 },
    ],
    memo: 'Payment is due within 30 days of invoice date. Thank you for your business!',
  },
];

const mockClients: Client[] = [
  { id: '1', name: 'Smith Family Trust', email: 'john.smith@email.com', type: 'Individual' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Individual' },
  { id: '3', name: 'Michael Chen', email: 'mchen@techcorp.com', type: 'Business', companyName: 'TechCorp Inc.' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily.r@consulting.com', type: 'Business', companyName: 'Rodriguez Consulting' },
  { id: '5', name: 'David Lee', email: 'david.lee@email.com', type: 'Individual' },
  { id: '6', name: 'Amanda Foster', email: 'afoster@business.com', type: 'Business', companyName: 'Foster & Associates' },
  { id: '102', name: 'John Smith', email: 'john.smith@email.com', type: 'Individual' },
].sort((a, b) => a.name.localeCompare(b.name));

const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: 'scratch',
    name: 'Start from Scratch',
    description: 'Create a custom invoice with your own line items',
    category: 'Other',
    icon: '✏️',
    items: [],
  },
  {
    id: 'individual-tax',
    name: 'Individual Tax Return',
    description: 'Standard individual tax return package',
    category: 'Tax',
    icon: '📄',
    items: [
      { name: 'Federal Tax Return Preparation', description: 'Form 1040 preparation and filing', quantity: 1, rate: 250 },
      { name: 'State Tax Return', description: 'State income tax filing', quantity: 1, rate: 100 },
      { name: 'Tax Consultation', description: 'One hour consultation session', quantity: 1, rate: 150 },
    ],
  },
  {
    id: 'business-tax',
    name: 'Business Tax Return',
    description: 'Complete business tax preparation package',
    category: 'Tax',
    icon: '🏢',
    items: [
      { name: 'Business Tax Return (Form 1120)', description: 'Corporate tax return preparation', quantity: 1, rate: 850 },
      { name: 'Quarterly Tax Filing', description: 'Q4 estimated tax filing', quantity: 1, rate: 175 },
      { name: 'Financial Statement Review', description: 'Review and preparation', quantity: 1, rate: 300 },
      { name: 'Business Advisory Consultation', description: 'Strategic business tax planning', quantity: 1, rate: 200 },
    ],
  },
  {
    id: 'bookkeeping',
    name: 'Monthly Bookkeeping',
    description: 'Standard monthly bookkeeping services',
    category: 'Bookkeeping',
    icon: '📊',
    items: [
      { name: 'Monthly Bookkeeping Services', description: 'Transaction recording and reconciliation', quantity: 1, rate: 250 },
      { name: 'Financial Reports', description: 'P&L and Balance Sheet', quantity: 1, rate: 100 },
      { name: 'Accounts Payable/Receivable', description: 'AP/AR management', quantity: 1, rate: 150 },
    ],
  },
  {
    id: 'payroll',
    name: 'Payroll Processing',
    description: 'Monthly payroll services package',
    category: 'Payroll',
    icon: '💰',
    items: [
      { name: 'Payroll Processing', description: 'Monthly payroll for up to 10 employees', quantity: 1, rate: 200 },
      { name: 'Payroll Tax Filing', description: 'Quarterly payroll tax returns', quantity: 1, rate: 150 },
    ],
  },
  {
    id: 'consultation',
    name: 'Consulting Package',
    description: 'Professional consulting services',
    category: 'Consulting',
    icon: '💼',
    items: [
      { name: 'Tax Consultation (Hourly)', description: 'Professional tax consultation', quantity: 3, rate: 150 },
      { name: 'Financial Planning Session', description: 'Strategic financial planning', quantity: 1, rate: 300 },
    ],
  },
];

const lineItemTemplates: LineItemTemplate[] = [
  { id: 'item-1', name: 'Tax Return Preparation', description: 'Individual tax return preparation service', category: 'Tax', defaultRate: 350, usageCount: 45, lastUsed: '2024-11-10' },
  { id: 'item-2', name: 'Bookkeeping Services', description: 'Monthly bookkeeping services', category: 'Bookkeeping', defaultRate: 250, usageCount: 38, lastUsed: '2024-11-09' },
  { id: 'item-3', name: 'Consultation (Hourly)', description: 'Tax consultation services', category: 'Consulting', defaultRate: 150, usageCount: 52, lastUsed: '2024-11-08' },
  { id: 'item-4', name: 'Financial Statement Preparation', description: 'Preparation of financial statements', category: 'Bookkeeping', defaultRate: 500, usageCount: 28, lastUsed: '2024-11-05' },
  { id: 'item-5', name: 'Payroll Processing', description: 'Monthly payroll processing', category: 'Payroll', defaultRate: 200, usageCount: 22, lastUsed: '2024-11-03' },
  { id: 'item-6', name: 'Quarterly Tax Filing', description: 'Quarterly estimated tax filing', category: 'Tax', defaultRate: 175, usageCount: 31, lastUsed: '2024-11-01' },
  { id: 'item-7', name: 'Business Tax Return', description: 'Business entity tax return preparation', category: 'Tax', defaultRate: 750, usageCount: 19, lastUsed: '2024-10-28' },
  { id: 'item-8', name: 'Audit Representation', description: 'IRS audit representation services', category: 'Audit', defaultRate: 300, usageCount: 8, lastUsed: '2024-10-15' },
  { id: 'item-9', name: 'State Tax Return', description: 'State income tax filing', category: 'Tax', defaultRate: 100, usageCount: 35, lastUsed: '2024-11-12' },
  { id: 'item-10', name: 'Tax Planning Session', description: 'Strategic tax planning consultation', category: 'Tax', defaultRate: 200, usageCount: 25, lastUsed: '2024-11-07' },
].sort((a, b) => b.usageCount - a.usageCount);

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

export function EditInvoiceView() {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();

  // Load invoice data
  const [invoice] = useState(() => {
    const found = mockInvoices.find(inv => inv.id === invoiceId);
    return found || null;
  });

  // Navigate away if invoice not found
  useEffect(() => {
    if (!invoice) {
      toast.error('Invoice not found');
      navigate('/billing');
    }
  }, [invoice, navigate]);

  // Workflow state - Start on details (main editing screen)
  const [currentStep, setCurrentStep] = useState<InvoiceStep>('details');
  const [visitedSteps, setVisitedSteps] = useState<Set<InvoiceStep>>(new Set(['details']));

  // Form state - Initialize from invoice
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Set selectedClient when invoice loads
  useEffect(() => {
    if (invoice && invoice.clientId) {
      const client = mockClients.find(c => c.id === invoice.clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [invoice]);
  const [taxYear, setTaxYear] = useState<number>(() => invoice ? parseInt(invoice.year) : new Date().getFullYear());
  const [dueDate, setDueDate] = useState<string>(() => invoice?.dueDate || 'DUE_ON_RECEIPT');
  const [items, setItems] = useState<InvoiceItem[]>(() => invoice?.items || []);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(['card']);
  const [memo, setMemo] = useState(() => invoice?.memo || 'Payment is due upon receipt of this invoice. Thank you for your prompt payment!');
  const [memoTemplates, setMemoTemplates] = useState<MemoTemplate[]>(defaultMemoTemplates);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceData | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  
  // UI state
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showTemplateItems, setShowTemplateItems] = useState(true);
  const [itemSearch, setItemSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [discountInput, setDiscountInput] = useState({ type: 'percentage' as DiscountType, value: '' });
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [dialogClickCount, setDialogClickCount] = useState(0);
  const [dialogClickTimer, setDialogClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [showMemoTemplateDialog, setShowMemoTemplateDialog] = useState(false);
  const [editingMemoTemplate, setEditingMemoTemplate] = useState<MemoTemplate | null>(null);
  const [memoTemplateForm, setMemoTemplateForm] = useState({ name: '', content: '', category: 'General' });
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: '1',
    rate: '',
  });
  
  // Refs for autofocus
  const newLineItemInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  // Check if invoice exists
  if (!invoice) {
    return null;
  }

  // Step configurations based on current step
  const stepConfigs: StepConfig[] = currentStep === 'client' ? [
    { id: 'client', label: 'Client', number: 1 },
    { id: 'details', label: 'Details', number: 2 },
  ] : currentStep === 'template' ? [
    { id: 'template', label: 'Template', number: 1 },
    { id: 'details', label: 'Details', number: 2 },
  ] : [];

  // Navigation handlers
  const handleStepNavigation = (stepId: string) => {
    setCurrentStep(stepId as InvoiceStep);
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
    setClientSearch('');
  };

  const handleBack = () => {
    if (currentStep === 'client' || currentStep === 'template') {
      handleBackToDetails();
    } else {
      handleDiscardChanges();
    }
  };

  // Auto-focus discount input when popup opens
  useEffect(() => {
    if (showDiscountPopup) {
      setTimeout(() => {
        discountInputRef.current?.focus();
        discountInputRef.current?.select();
      }, 200);
    }
  }, [showDiscountPopup]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount
    ? discount.type === 'percentage'
      ? (subtotal * discount.value) / 100
      : discount.value
    : 0;
  const total = subtotal - discountAmount;

  // Filtered clients
  const filteredClients = mockClients.filter((client) => {
    const matchesType = clientTypeFilter === 'all' || client.type === clientTypeFilter;
    const matchesSearch = clientSearch === '' || 
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(clientSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate client counts
  const allClientsCount = mockClients.length;
  const individualCount = mockClients.filter(c => c.type === 'Individual').length;
  const businessCount = mockClients.filter(c => c.type === 'Business').length;

  // Filtered line item templates
  const filteredLineItemTemplates = lineItemTemplates.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
    handleBackToDetails();
    toast.success(`Client changed to ${client.name}`);
  };

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    if (template.id === 'scratch') {
      setItems([]);
      toast.success('Cleared all line items');
    } else {
      // Load template items
      const templateItems: InvoiceItem[] = template.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      }));
      setItems(templateItems);
      toast.success(`Applied template: ${template.name}`);
    }
    handleBackToDetails();
  };

  const handleDialogBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const newCount = dialogClickCount + 1;
      setDialogClickCount(newCount);
      
      if (dialogClickTimer) {
        clearTimeout(dialogClickTimer);
      }
      
      if (newCount === 2) {
        setShowAddItemDialog(false);
        setShowDiscountPopup(false);
        setShowMemoTemplates(false);
        setShowMemoTemplateDialog(false);
        setDialogClickCount(0);
        return;
      }
      
      const timer = setTimeout(() => {
        setDialogClickCount(0);
      }, 500);
      setDialogClickTimer(timer);
    }
  };

  const handleAddLineItemTemplate = (item: LineItemTemplate) => {
    const newInvoiceItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: item.name,
      description: item.description,
      quantity: 1,
      rate: item.defaultRate,
      amount: item.defaultRate,
    };
    setItems([...items, newInvoiceItem]);
    setShowAddItemDialog(false);
    toast.success(`Added ${item.name}`);
  };

  const handleAddCustomItem = () => {
    if (!newItem.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!newItem.rate || parseFloat(newItem.rate) <= 0) {
      toast.error('Valid rate is required');
      return;
    }

    const quantity = parseFloat(newItem.quantity) || 1;
    const rate = parseFloat(newItem.rate);
    
    const invoiceItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      description: newItem.description || undefined,
      quantity,
      rate,
      amount: quantity * rate,
    };

    setItems([...items, invoiceItem]);
    setNewItem({ name: '', description: '', quantity: '1', rate: '' });
    setShowAddItemDialog(false);
    toast.success(`Added ${invoiceItem.name}`);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success('Item removed');
  };

  const handleAddLineItemInline = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
    
    // Focus on the new line item's name input after render
    setTimeout(() => {
      newLineItemInputRef.current?.focus();
    }, 100);
  };

  const handleUpdateItemField = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'rate', value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: numValue };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleIncrementItem = (id: string, field: 'quantity' | 'rate') => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const increment = field === 'quantity' ? 1 : 1;
        const updated = { ...item, [field]: item[field] + increment };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleDecrementItem = (id: string, field: 'quantity' | 'rate') => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const decrement = field === 'quantity' ? 1 : 1;
        const minValue = field === 'quantity' ? 1 : 0;
        const newValue = Math.max(minValue, item[field] - decrement);
        const updated = { ...item, [field]: newValue };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
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

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput.value);
    if (!value || value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (discountInput.type === 'percentage' && value > 100) {
      toast.error('Percentage cannot exceed 100%');
      return;
    }

    setDiscount({
      type: discountInput.type,
      value,
    });
    setShowDiscountPopup(false);
    setDiscountInput({ type: 'percentage', value: '' });
    toast.success('Discount applied!');
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    toast.success('Discount removed');
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    if (selectedPaymentMethods.includes(method)) {
      if (selectedPaymentMethods.length > 1) {
        setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
      }
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
    }
  };

  const handleEditAndSend = () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    toast.success(`Invoice updated and sent to ${selectedClient.name}`);
    navigate('/billing');
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Discard all changes and return to billing?')) {
      navigate('/billing');
    }
  };

  // RENDER SCREENS
  
  // Screen 1: Client Selection (Inline Workflow)
  if (currentStep === 'client') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Edit Invoice {invoice.invoiceNo}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 1 of 2: Change Client
              </p>
            </div>
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
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search clients by name, email, or company..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setClientTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    clientTypeFilter === 'all'
                      ? 'bg-purple-100 dark:bg-purple-950/30 border-2 border-[var(--primaryColor)]'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={clientTypeFilter === 'all' ? { color: 'var(--primaryColor)' } : {}}
                >
                  <span className="font-medium">All</span>
                  <span className="ml-2 text-sm opacity-70">({allClientsCount})</span>
                </button>
                <button
                  onClick={() => setClientTypeFilter('Individual')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    clientTypeFilter === 'Individual'
                      ? 'bg-purple-100 dark:bg-purple-950/30 border-2 border-[var(--primaryColor)]'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={clientTypeFilter === 'Individual' ? { color: 'var(--primaryColor)' } : {}}
                >
                  <span className="font-medium">Individual</span>
                  <span className="ml-2 text-sm opacity-70">({individualCount})</span>
                </button>
                <button
                  onClick={() => setClientTypeFilter('Business')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    clientTypeFilter === 'Business'
                      ? 'bg-purple-100 dark:bg-purple-950/30 border-2 border-[var(--primaryColor)]'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={clientTypeFilter === 'Business' ? { color: 'var(--primaryColor)' } : {}}
                >
                  <span className="font-medium">Business</span>
                  <span className="ml-2 text-sm opacity-70">({businessCount})</span>
                </button>
              </div>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:shadow-lg transition-all text-left bg-white dark:bg-gray-800 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/30 dark:to-blue-950/30 flex items-center justify-center flex-shrink-0">
                      {client.type === 'Business' ? (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <User className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{client.name}</p>
                        <Badge variant="secondary" className="text-xs">{client.type}</Badge>
                      </div>
                      {client.companyName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-0.5">
                          {client.companyName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 truncate">{client.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No clients found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Template Selection (Inline Workflow)
  if (currentStep === 'template') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Edit Invoice {invoice.invoiceNo}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 1 of 2: Start from Template
              </p>
            </div>
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
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setTemplateCategoryFilter('All')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    templateCategoryFilter === 'All'
                      ? 'bg-purple-100 dark:bg-purple-950/30 border-2 border-[var(--primaryColor)]'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={templateCategoryFilter === 'All' ? { color: 'var(--primaryColor)' } : {}}
                >
                  All Templates
                </button>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setTemplateCategoryFilter(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      templateCategoryFilter === category
                        ? 'bg-purple-100 dark:bg-purple-950/30 border-2 border-[var(--primaryColor)]'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    style={templateCategoryFilter === category ? { color: 'var(--primaryColor)' } : {}}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoiceTemplates
                .filter((template) => templateCategoryFilter === 'All' || template.category === templateCategoryFilter)
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:shadow-lg transition-all text-left bg-white dark:bg-gray-800 group"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="font-medium mb-2 group-hover:text-[var(--primaryColor)] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[template.category]}20`,
                          color: CATEGORY_COLORS[template.category],
                        }}
                      >
                        {template.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {template.items.length} {template.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: Main Details/Editing Screen (Default)
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Edit Invoice {invoice.invoiceNo}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Make changes to invoice details and line items
              </p>
            </div>
          </div>

        </div>

        {/* Only show step navigation when in inline workflows */}
        {stepConfigs.length > 0 && (
          <StepNavigation
            steps={stepConfigs}
            currentStepId={currentStep}
            visitedStepIds={visitedSteps}
            onStepClick={handleStepNavigation}
          />
        )}
      </div>

      {/* Main Content - Details Screen (continue in next part) */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Card */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Invoice For</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep('client')}
                    className="text-sm"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    Change Client
                  </Button>
                </div>
                
                {selectedClient && (
                  <div 
                    onClick={() => setCurrentStep('client')}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-100 dark:border-purple-900 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      {selectedClient.type === 'Business' ? (
                        <Building2 className="w-7 h-7 text-blue-600" />
                      ) : (
                        <User className="w-7 h-7" style={{ color: 'var(--primaryColor)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-lg">{selectedClient.name}</p>
                        <Badge variant="secondary">{selectedClient.type}</Badge>
                      </div>
                      {selectedClient.companyName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedClient.companyName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{selectedClient.email}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Invoice Details Card - WILL CONTINUE */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Invoice Details
                  </h3>
                  
                  {/* Recurring Toggle */}
                  <button
                    onClick={() => {
                      const newIsRecurring = !isRecurring;
                      setIsRecurring(newIsRecurring);
                      if (newIsRecurring && !recurrence) {
                        setRecurrence({
                          pattern: 'monthly',
                          interval: 1,
                          endType: 'never'
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isRecurring 
                        ? 'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" style={{ color: isRecurring ? 'var(--primaryColor)' : undefined }} />
                    <span className={isRecurring ? 'font-medium' : ''} style={{ color: isRecurring ? 'var(--primaryColor)' : undefined }}>
                      Recurring
                    </span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Select
                      value={taxYear.toString()}
                      onValueChange={(value) => setTaxYear(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Popover open={showDueDatePicker} onOpenChange={setShowDueDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1.5 h-10"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                          {dueDate === 'DUE_ON_RECEIPT' ? 'Due on Receipt' : dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setDueDate('DUE_ON_RECEIPT');
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span>Due on Receipt</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Today</span>
                            </button>
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 15);
                                setDueDate(date.toISOString().split('T')[0]);
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                                <span>Net 15</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">15 days</span>
                            </button>
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 30);
                                setDueDate(date.toISOString().split('T')[0]);
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                                <span>Net 30</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">30 days</span>
                            </button>
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 45);
                                setDueDate(date.toISOString().split('T')[0]);
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                                <span>Net 45</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">45 days</span>
                            </button>
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 60);
                                setDueDate(date.toISOString().split('T')[0]);
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                                <span>Net 60</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">60 days</span>
                            </button>
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 90);
                                setDueDate(date.toISOString().split('T')[0]);
                                setShowDueDatePicker(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                                <span>Net 90</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">90 days</span>
                            </button>
                          </div>
                        </div>
                        <div className="px-3 py-3">
                          <CalendarComponent
                            mode="single"
                            selected={dueDate !== 'DUE_ON_RECEIPT' && dueDate ? new Date(dueDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setDueDate(date.toISOString().split('T')[0]);
                              }
                            }}
                            initialFocus
                            className="p-0"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {isRecurring && recurrence && (
                  <div className="mt-4">
                    <RecurrenceSelector
                      value={recurrence}
                      onChange={setRecurrence}
                    />
                  </div>
                )}
              </Card>

              {/* Start from Template Button */}
              <Card className="p-4 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800">
                <button
                  onClick={() => setCurrentStep('template')}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium" style={{ color: 'var(--primaryColor)' }}>Start from Template</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Replace all items with a template</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[var(--primaryColor)] rotate-180 transition-colors" />
                </button>
              </Card>

              {/* Line Items */}
              <LineItemsCard
                items={items}
                discount={discount}
                onAddLineItemInline={handleAddLineItemInline}
                onShowTemplateDialog={() => {
                  setShowTemplateItems(true);
                  setShowAddItemDialog(true);
                }}
                onUpdateItemField={handleUpdateItemField}
                onUpdateItem={handleUpdateItem}
                onIncrementItem={handleIncrementItem}
                onDecrementItem={handleDecrementItem}
                onRemoveItem={handleRemoveItem}
                onShowDiscountPopup={() => setShowDiscountPopup(true)}
                onRemoveDiscount={handleRemoveDiscount}
                newLineItemInputRef={newLineItemInputRef}
                onStartFromTemplate={() => setCurrentStep('template')}
              />

              {/* Payment Methods */}
              <PaymentMethodsCard
                selectedPaymentMethods={selectedPaymentMethods}
                onTogglePaymentMethod={togglePaymentMethod}
              />

              {/* Memo */}
              <MemoCardWithTemplates
                memo={memo}
                onMemoChange={setMemo}
                memoTemplates={memoTemplates}
                onUpdateMemoTemplates={setMemoTemplates}
              />
            </div>

            {/* Right Column - Stripe-Style Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card className="overflow-hidden shadow-xl border-2" style={{ borderColor: 'var(--primaryColor)' }}>
                  {/* Preview Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm opacity-90">Invoice Preview</p>
                        <p className="text-lg font-semibold">Your Company Name</p>
                      </div>
                      <FileText className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  {/* Preview Body - Stripe Style */}
                  <div className="p-8 bg-white dark:bg-gray-900 relative">
                    {/* Invoice Icon with Download Circle on the right - Clickable */}
                    <button 
                      onClick={() => setShowFullPreview(true)}
                      className="absolute top-6 right-6 opacity-10 hover:opacity-20 transition-opacity cursor-pointer"
                    >
                      <svg className="w-20 h-20 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Document/Receipt body */}
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Lines representing invoice content */}
                        <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Circle at bottom right with arrow */}
                        <circle cx="18" cy="20" r="3.5" fill="currentColor" stroke="white" strokeWidth="1"/>
                        <path d="M18 18.5v3m0 0l-1.5-1.5m1.5 1.5l1.5-1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Total Amount - Large */}
                    <div className="mb-1">
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        ${total.toFixed(2)}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="mb-8 text-gray-500 text-sm">
                      Due {dueDate === 'DUE_ON_RECEIPT' ? 'on receipt' : new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Three Row Layout */}
                    <div className="space-y-2 mb-6">
                      {/* To */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">To</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {selectedClient ? selectedClient.name : '—'}
                        </span>
                      </div>

                      {/* From */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">From</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">Your Company Name</span>
                      </div>

                      {/* Memo */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">Memo</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {memo || (items.length > 0 ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : 'No items')}
                        </span>
                      </div>
                    </div>

                    {/* View invoice details link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        onClick={() => setShowFullPreview(true)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center gap-1 transition-colors"
                      >
                        View invoice details
                        <span className="text-xs">›</span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons Below Preview */}
                <div className="space-y-3">
                  <Button
                    onClick={handleEditAndSend}
                    className="w-full gap-2 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
                  >
                    <Send className="w-4 h-4" />
                    Edit & Send
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDiscardChanges}
                    className="w-full gap-2 h-12"
                  >
                    <X className="w-4 h-4" />
                    Discard Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Dialog */}
      <DiscountDialog
        isOpen={showDiscountPopup}
        discountType={discountInput.type}
        discountValue={discountInput.value}
        onDiscountTypeChange={(type) => setDiscountInput({ ...discountInput, type })}
        onDiscountValueChange={(value) => setDiscountInput({ ...discountInput, value })}
        onApply={handleApplyDiscount}
        onCancel={() => {
          setShowDiscountPopup(false);
          setDiscountInput({ type: 'percentage', value: '' });
        }}
        onBackdropClick={handleDialogBackdropClick}
      />

      {/* Line Item Template Dialog */}
      <LineItemTemplateDialog
        isOpen={showAddItemDialog}
        templates={filteredLineItemTemplates}
        searchQuery={itemSearch}
        onSearchChange={setItemSearch}
        onSelectTemplate={handleAddLineItemTemplate}
        onClose={() => {
          setShowAddItemDialog(false);
          setItemSearch('');
        }}
        onBackdropClick={handleDialogBackdropClick}
      />

      {/* Full Preview Modal */}
      {showFullPreview && selectedClient && (
        <FullInvoicePreview
          invoice={{
            id: invoice.invoiceNo,
            clientName: selectedClient.name,
            clientEmail: selectedClient.email,
            clientCompany: selectedClient.companyName,
            amount: total,
            status: 'draft',
            dueDate,
            items,
            discount,
            subtotal,
            memo,
          }}
          onClose={() => setShowFullPreview(false)}
        />
      )}
    </div>
  );
}