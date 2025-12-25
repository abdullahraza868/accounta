// AddInvoiceView Component - Invoice creation with 3-step wizard
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Save,
  Send,
  X,
  Repeat,
  Clock,
  Filter,
  DollarSign,
  FileText,
  Sparkles,
  Pencil,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { formatDateDisplay } from '../../lib/dateFormatting';
import { RecurrenceSelector, RecurrenceData } from '../RecurrenceSelector';
import { FullInvoicePreview } from '../FullInvoicePreview';
import { StepNavigation, Step as StepConfig } from '../StepNavigation';

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

type InvoiceStep = 'client' | 'template' | 'details';

type TemplateCategory = 'Bookkeeping' | 'Tax' | 'Consulting' | 'Audit' | 'Payroll' | 'Other';

const TEMPLATE_CATEGORIES: TemplateCategory[] = ['Tax', 'Bookkeeping', 'Consulting', 'Payroll', 'Audit', 'Other'];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Bookkeeping': '#8B5CF6',
  'Tax': '#3B82F6',
  'Consulting': '#10B981',
  'Audit': '#F59E0B',
  'Payroll': '#EF4444',
  'Other': '#6B7280',
};

// Mock clients
const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', type: 'Individual' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Individual' },
  { id: '3', name: 'Michael Chen', email: 'mchen@techcorp.com', type: 'Business', companyName: 'TechCorp Inc.' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily.r@consulting.com', type: 'Business', companyName: 'Rodriguez Consulting' },
  { id: '5', name: 'David Lee', email: 'david.lee@email.com', type: 'Individual' },
  { id: '6', name: 'Amanda Foster', email: 'afoster@business.com', type: 'Business', companyName: 'Foster & Associates' },
  { id: '7', name: 'Robert Kim', email: 'robert.kim@email.com', type: 'Individual' },
  { id: '8', name: 'Jessica Martinez', email: 'j.martinez@corp.com', type: 'Business', companyName: 'Martinez Corp' },
  { id: '9', name: 'Brandon Williams', email: 'b.williams@email.com', type: 'Individual' },
  { id: '10', name: 'Christina Baker', email: 'christina@bakerllc.com', type: 'Business', companyName: 'Baker LLC' },
  { id: '11', name: 'Daniel Thompson', email: 'daniel.t@email.com', type: 'Individual' },
  { id: '12', name: 'Elizabeth Garcia', email: 'e.garcia@garciaco.com', type: 'Business', companyName: 'Garcia & Co.' },
  { id: '13', name: 'Frank Anderson', email: 'frank.a@email.com', type: 'Individual' },
  { id: '14', name: 'Grace Wilson', email: 'grace@wilsonenterprises.com', type: 'Business', companyName: 'Wilson Enterprises' },
  { id: '15', name: 'Henry Taylor', email: 'henry.taylor@email.com', type: 'Individual' },
  { id: '16', name: 'Isabella Moore', email: 'isabella@mooreconsulting.com', type: 'Business', companyName: 'Moore Consulting' },
  { id: '17', name: 'James Brown', email: 'j.brown@email.com', type: 'Individual' },
  { id: '18', name: 'Katherine Davis', email: 'katherine@davisgroup.com', type: 'Business', companyName: 'Davis Group' },
  { id: '19', name: 'Leonard Martinez', email: 'leonard.m@email.com', type: 'Individual' },
  { id: '20', name: 'Monica Harris', email: 'monica@harrisventures.com', type: 'Business', companyName: 'Harris Ventures' },
  { id: '21', name: 'Nathan Clark', email: 'nathan.c@email.com', type: 'Individual' },
  { id: '22', name: 'Olivia Lewis', email: 'olivia@lewispartners.com', type: 'Business', companyName: 'Lewis & Partners' },
  { id: '23', name: 'Patrick Walker', email: 'patrick.w@email.com', type: 'Individual' },
  { id: '24', name: 'Rachel Hall', email: 'rachel@hallcorp.com', type: 'Business', companyName: 'Hall Corporation' },
  { id: '25', name: 'Samuel Allen', email: 'samuel.a@email.com', type: 'Individual' },
  { id: '26', name: 'Tiffany Young', email: 'tiffany@youngadvisors.com', type: 'Business', companyName: 'Young Advisors' },
  { id: '27', name: 'Victor King', email: 'victor.k@email.com', type: 'Individual' },
  { id: '28', name: 'Wendy Scott', email: 'wendy@scottgroup.com', type: 'Business', companyName: 'Scott Group' },
  { id: '29', name: 'Xavier Green', email: 'xavier.g@email.com', type: 'Individual' },
  { id: '30', name: 'Yolanda Adams', email: 'yolanda@adamsenterprises.com', type: 'Business', companyName: 'Adams Enterprises' },
  { id: '31', name: 'Zachary Baker', email: 'zachary.b@email.com', type: 'Individual' },
  { id: '32', name: 'Angela Collins', email: 'angela@collinsllc.com', type: 'Business', companyName: 'Collins LLC' },
  { id: '33', name: 'Benjamin Foster', email: 'benjamin.f@email.com', type: 'Individual' },
  { id: '34', name: 'Caroline Mitchell', email: 'caroline@mitchellco.com', type: 'Business', companyName: 'Mitchell & Co.' },
  { id: '35', name: 'Derek Robinson', email: 'derek.r@email.com', type: 'Individual' },
  { id: '36', name: 'Emma Cooper', email: 'emma@cooperventures.com', type: 'Business', companyName: 'Cooper Ventures' },
].sort((a, b) => a.name.localeCompare(b.name));

// Invoice templates with pre-populated line items
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

// Line item templates
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

// Memo templates
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

export function AddInvoiceView() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { selectedTemplate?: any; selectedClient?: any; fromManageTemplates?: boolean } | null;

  // Workflow state - Always start at client selection
  const [currentStep, setCurrentStep] = useState<InvoiceStep>('client');

  // Determine if we should use 2-step or 3-step workflow
  const isTemplatePreselected = locationState?.fromManageTemplates && locationState?.selectedTemplate;

  // Step configuration - 2 steps if template is preselected, 3 steps otherwise
  const stepConfigs: StepConfig[] = isTemplatePreselected
    ? [
        { id: 'client', label: 'Client', number: 1 },
        { id: 'details', label: 'Details', number: 2 },
      ]
    : [
        { id: 'client', label: 'Client', number: 1 },
        { id: 'template', label: 'Template', number: 2 },
        { id: 'details', label: 'Details', number: 3 },
      ];

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(locationState?.selectedClient || null);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(locationState?.selectedTemplate || null);
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear() - 1);
  const [dueDate, setDueDate] = useState<string>('DUE_ON_RECEIPT');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(['card']);
  const [memo, setMemo] = useState('Payment is due upon receipt of this invoice. Thank you for your prompt payment!');
  const [memoTemplates, setMemoTemplates] = useState<MemoTemplate[]>(defaultMemoTemplates);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceData | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<InvoiceStep>>(new Set(['client']));
  
  // UI state
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [isChangingClient, setIsChangingClient] = useState(false); // Track if changing from step 3
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showTemplateItems, setShowTemplateItems] = useState(true);
  const [showAddItemMenu, setShowAddItemMenu] = useState(false);
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
  const [showInvoiceTemplates, setShowInvoiceTemplates] = useState(false);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  // Effect to handle incoming state from Manage Templates
  useEffect(() => {
    if (locationState?.fromManageTemplates && locationState?.selectedTemplate) {
      const template = locationState.selectedTemplate;
      // Set the selected template
      setSelectedTemplate(template);
      
      // Convert template line items to invoice items
      if (template.lineItems && template.lineItems.length > 0) {
        const templateItems: InvoiceItem[] = template.lineItems.map((item: any, index: number) => ({
          id: `item-${Date.now()}-${index}`,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        }));
        setItems(templateItems);
      }
      
      // Mark client and template steps as visited
      setVisitedSteps(new Set(['client']));
    }
  }, []);
  
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

  // Auto-open client selector on mount
  useEffect(() => {
    if (currentStep === 'client' && !selectedClient) {
      const timer = setTimeout(() => setShowClientSelector(true), 100);
      return () => clearTimeout(timer);
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
    setShowClientSelector(false);
    setIsChangingClient(false);
    setClientSearch('');
    
    // If we have a pre-selected template (from Manage Templates), skip to details
    if (selectedTemplate && selectedTemplate.id !== 'scratch') {
      setCurrentStep('details');
      setVisitedSteps(prev => new Set([...prev, 'template', 'details']));
    } else {
      // Otherwise go to template step if we're not already on details step
      if (currentStep !== 'details') {
        setCurrentStep('template');
        setVisitedSteps(prev => new Set([...prev, 'template']));
      }
    }
  };

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    
    // Load template items if not "Start from Scratch"
    if (template.id !== 'scratch') {
      const templateItems: InvoiceItem[] = template.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      }));
      setItems(templateItems);
    }
    
    setCurrentStep('details');
    setVisitedSteps(prev => new Set([...prev, 'details']));
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

    setDiscount({ type: discountInput.type, value });
    setShowDiscountPopup(false);
    toast.success('Discount applied');
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountInput({ type: 'percentage', value: '' });
    toast.success('Discount removed');
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    if (selectedPaymentMethods.includes(method)) {
      if (selectedPaymentMethods.length > 1) {
        setSelectedPaymentMethods(selectedPaymentMethods.filter((m) => m !== method));
      }
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
    }
  };

  const handleSaveInvoice = () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    toast.success('Invoice saved as draft!');
    navigate('/billing');
  };

  const handleSendInvoice = () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    toast.success('Invoice sent to client!');
    navigate('/billing');
  };

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('template');
    } else if (currentStep === 'template') {
      setCurrentStep('client');
      setShowClientSelector(true);
    } else {
      navigate('/billing');
    }
  };

  const handleStepNavigation = (stepId: string) => {
    const step = stepId as InvoiceStep;
    setCurrentStep(step);
    if (step === 'client') {
      setShowClientSelector(true);
    }
  };

  // Step 1: Client Selection
  if (currentStep === 'client') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Create New Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 1 of 3: Select Client
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
            {selectedClient ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl mb-2">Client Selected</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ready to continue to the next step
                  </p>
                </div>

                <Card className="p-6 shadow-xl space-y-4">
                  {/* Clickable Client Info Card */}
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-full p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-all hover:shadow-lg group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        {selectedClient.type === 'Business' ? (
                          <Building2 className="w-8 h-8 text-blue-600" />
                        ) : (
                          <User className="w-8 h-8" style={{ color: 'var(--primaryColor)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg font-medium truncate">{selectedClient.name}</p>
                          <Badge variant="secondary">{selectedClient.type}</Badge>
                        </div>
                        {selectedClient.companyName && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {selectedClient.companyName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{selectedClient.email}</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 px-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                          <X className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--primaryColor)' }}>
                          Change
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Click to select a different client</span>
                    </div>
                  </button>
                  
                  <Button
                    onClick={() => setCurrentStep('template')}
                    size="lg"
                    className="w-full gap-2"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl mb-2">Who is this invoice for?</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select the client you want to invoice
                  </p>
                </div>

                <Card className="p-6 shadow-xl">
                  {/* Client Type Filter */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setClientTypeFilter('all')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        clientTypeFilter === 'all'
                          ? 'bg-[var(--primaryColor)] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Filter className="w-4 h-4 inline mr-2" />
                      All Clients ({allClientsCount})
                    </button>
                    <button
                      onClick={() => setClientTypeFilter('Individual')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        clientTypeFilter === 'Individual'
                          ? 'bg-[var(--primaryColor)] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Individual ({individualCount})
                    </button>
                    <button
                      onClick={() => setClientTypeFilter('Business')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        clientTypeFilter === 'Business'
                          ? 'bg-[var(--primaryColor)] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Business ({businessCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search by name, email, or company..."
                      className="pl-11 h-12 text-base"
                      autoFocus
                    />
                  </div>

                  {/* Client List */}
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 575px)', minHeight: '300px' }}>
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="mb-4">No clients found</p>
                        {(clientSearch || clientTypeFilter !== 'all') && (
                          <Button
                            variant="default"
                            size="lg"
                            onClick={() => {
                              setClientSearch('');
                              setClientTypeFilter('all');
                            }}
                            className="gap-2"
                            style={{ backgroundColor: 'var(--primaryColor)' }}
                          >
                            <X className="w-5 h-5" />
                            Clear search & filters
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="p-4 rounded-xl transition-all text-left border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center flex-shrink-0">
                                {client.type === 'Business' ? (
                                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <User className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{client.name}</p>
                                {client.companyName && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-0.5">
                                    {client.companyName}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                <Badge variant="secondary" className="text-xs mt-2">
                                  {client.type}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Template Selection
  if (currentStep === 'template') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
              <h1 className="text-xl">Create New Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 2 of 3: Choose Template
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
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl mb-2">Choose Your Starting Point</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start from scratch to create a custom invoice or use a pre-built template
              </p>
            </div>

            {!showInvoiceTemplates ? (
              /* Initial Two Options */
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    const scratchTemplate = invoiceTemplates.find((t) => t.id === 'scratch');
                    if (scratchTemplate) handleSelectTemplate(scratchTemplate);
                  }}
                  className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                >
                  <div className="text-5xl mb-4">✏️</div>
                  <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--primaryColor)' }}>Start from Scratch</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a custom invoice with your own line items
                  </p>
                </button>
                <button
                  onClick={() => setShowInvoiceTemplates(true)}
                  className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                >
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--primaryColor)' }}>Use Template</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose from pre-built invoice templates
                  </p>
                </button>
              </div>
            ) : (
              <>
                {/* Start from Scratch option when viewing templates */}
                <div className="mb-6 max-w-4xl mx-auto">
                  <button
                    onClick={() => {
                      const scratchTemplate = invoiceTemplates.find((t) => t.id === 'scratch');
                      if (scratchTemplate) handleSelectTemplate(scratchTemplate);
                    }}
                    className="w-full p-6 rounded-xl border-2 border-dashed bg-purple-50 dark:bg-purple-950/20 border-[var(--primaryColor)] hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-all flex items-center gap-4 group shadow-sm"
                  >
                    <div className="text-4xl">✏️</div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--primaryColor)' }}>Start from Scratch</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create a custom invoice with your own line items
                      </p>
                    </div>
                  </button>
                </div>

                {/* Category Filter */}
                <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                  <button
                    onClick={() => setTemplateCategoryFilter('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      templateCategoryFilter === 'All'
                        ? 'bg-[var(--primaryColor)] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    All
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      templateCategoryFilter === 'All'
                        ? 'bg-white/20'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {invoiceTemplates.filter(t => t.id !== 'scratch').length}
                    </span>
                  </button>
                  {TEMPLATE_CATEGORIES.map((category) => {
                    const count = invoiceTemplates.filter(t => t.category === category && t.id !== 'scratch').length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={category}
                        onClick={() => setTemplateCategoryFilter(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          templateCategoryFilter === category
                            ? 'bg-[var(--primaryColor)] text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          templateCategoryFilter === category
                            ? 'bg-white/20'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Templates grouped by category */}
                <div className="space-y-8">
              {TEMPLATE_CATEGORIES.map((category) => {
                // Filter by selected category
                if (templateCategoryFilter !== 'All' && templateCategoryFilter !== category) return null;
                
                const categoryTemplates = invoiceTemplates.filter((t) => t.category === category && t.id !== 'scratch');
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4" style={{ color: CATEGORY_COLORS[category] }} />
                      <h3 className="text-sm font-medium" style={{ color: CATEGORY_COLORS[category] }}>
                        {category}
                      </h3>
                      <div 
                        className="h-px flex-1"
                        style={{ backgroundColor: `${CATEGORY_COLORS[category]}40` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryTemplates.map((template) => {
                        const templateTotal = template.items.reduce((sum, item) => {
                          const itemAmount = (item.quantity || 0) * (item.rate || 0);
                          return sum + itemAmount;
                        }, 0);
                        
                        const isExpanded = expandedTemplates.has(template.id);
                        const displayedItems = isExpanded ? template.items : template.items.slice(0, 3);
                        
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            className="p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg hover:scale-105"
                          >
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
                            {template.items.length > 0 && (
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                                  Included Items ({template.items.length}):
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
                                  {template.items.length > 3 && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newExpanded = new Set(expandedTemplates);
                                        if (isExpanded) {
                                          newExpanded.delete(template.id);
                                        } else {
                                          newExpanded.add(template.id);
                                        }
                                        setExpandedTemplates(newExpanded);
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
                                          <span className="font-medium">+ {template.items.length - 3} more item{template.items.length - 3 > 1 ? 's' : ''}</span>
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Invoice Details
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
              <h1 className="text-xl">Create New Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 3 of 3: Invoice Details {selectedTemplate && `• ${selectedTemplate.name}`}
              </p>
            </div>
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

      {/* Main Content */}
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
                    onClick={() => {
                      setIsChangingClient(true);
                      setShowClientSelector(true);
                    }}
                    className="text-sm"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    Change Client
                  </Button>
                </div>
                
                {selectedClient && (
                  <div 
                    onClick={() => {
                      setIsChangingClient(true);
                      setShowClientSelector(true);
                    }}
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

              {/* Invoice Details */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Invoice Details
                  </h3>
                  
                  {/* Recurring Toggle - Small and Subtle */}
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

              {/* Line Items */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
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

                {items.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center mb-6">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 mb-6">No line items yet</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
                      <button
                        onClick={handleAddLineItemInline}
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
                    {items.map((item, index) => (
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
                                onChange={(e) => handleUpdateItemField(item.id, 'name', e.target.value)}
                                onFocus={(e) => e.target.select()}
                                placeholder="Service or product name"
                                className="flex-1 font-medium"
                                ref={index === items.length - 1 ? newLineItemInputRef : undefined}
                              />
                            </div>
                            <Input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleUpdateItemField(item.id, 'description', e.target.value)}
                              onFocus={(e) => e.target.select()}
                              placeholder="Description (optional)"
                              className="text-sm text-gray-500"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Quantity</Label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecrementItem(item.id, 'quantity')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="text-center h-10"
                                min="1"
                                style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                              />
                              <button
                                onClick={() => handleIncrementItem(item.id, 'quantity')}
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
                                onClick={() => handleDecrementItem(item.id, 'rate')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <Input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                                  onFocus={(e) => e.target.select()}
                                  className="pl-8 text-center h-10"
                                  min="0"
                                  step="0.01"
                                  style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                                />
                              </div>
                              <button
                                onClick={() => handleIncrementItem(item.id, 'rate')}
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
                              <span className="font-medium" style={{ color: 'var(--primaryColor)' }}>${item.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Item Buttons - Two Side by Side */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleAddLineItemInline}
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
              </Card>

              {/* Payment Methods */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
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
              </Card>

              {/* Memo */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
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
                              className="p-1.5 bg-white dark:bg-gray-800 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 text-red-600"
                              title="Delete template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              </Card>
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
                      Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSendInvoice}
                    className="w-full gap-2 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Send className="w-4 h-4" />
                    Send Invoice
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSaveInvoice}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFullPreview(true)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    <Label htmlFor="newItemName" className="text-base">Item Name *</Label>
                    <Input
                      id="newItemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g., Tax Return Preparation"
                      className="mt-2 h-12"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="newItemDescription" className="text-base">Description</Label>
                    <Textarea
                      id="newItemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      placeholder="Add a detailed description of this service..."
                      rows={3}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newItemQuantity" className="text-base">Quantity *</Label>
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
                          className="h-12 text-center flex-1"
                          style={{ fontSize: '1.125rem', fontWeight: '500', letterSpacing: '0.01em' }}
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
                      <Label htmlFor="newItemRate" className="text-base">Rate *</Label>
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
                            className="pl-10 h-12 text-center"
                            placeholder="0.00"
                            style={{ fontSize: '1.125rem', fontWeight: '500', letterSpacing: '0.01em' }}
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply a discount to this invoice</p>
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
                      type="number"
                      value={discountInput.value}
                      onChange={(e) => setDiscountInput({ ...discountInput, value: e.target.value })}
                      className={`h-12 text-center ${discountInput.type === 'amount' || discountInput.type === 'percentage' ? 'pl-10' : ''}`}
                      placeholder={discountInput.type === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
                      min="0"
                      step={discountInput.type === 'percentage' ? '1' : '0.01'}
                      max={discountInput.type === 'percentage' ? '100' : undefined}
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
                  className="flex-1 h-11"
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

      {/* Full Preview Modal */}
      {showFullPreview && selectedClient && (
        <FullInvoicePreview
          invoice={{
            id: 'DRAFT',
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

      {/* Client Selector Modal - Only show when changing client from details step */}
      {showClientSelector && isChangingClient && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClientSelector(false);
              setIsChangingClient(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-medium">Select Client</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose who you're creating this invoice for
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowClientSelector(false);
                    setIsChangingClient(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client Type Filter */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setClientTypeFilter('all')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    clientTypeFilter === 'all'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  All Clients ({allClientsCount})
                </button>
                <button
                  onClick={() => setClientTypeFilter('Individual')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    clientTypeFilter === 'Individual'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Individual ({individualCount})
                </button>
                <button
                  onClick={() => setClientTypeFilter('Business')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    clientTypeFilter === 'Business'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Business ({businessCount})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search by name, email, or company..."
                  className="pl-11 h-12 text-base"
                  autoFocus
                />
              </div>
            </div>

            {/* Client List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-4">No clients found</p>
                  {(clientSearch || clientTypeFilter !== 'all') && (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => {
                        setClientSearch('');
                        setClientTypeFilter('all');
                      }}
                      className="gap-2"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <X className="w-5 h-5" />
                      Clear search & filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className={`p-4 rounded-xl transition-all text-left border-2 ${
                        selectedClient?.id === client.id
                          ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50/50 dark:hover:bg-purple-950/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center flex-shrink-0">
                          {client.type === 'Business' ? (
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <User className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{client.name}</p>
                            {selectedClient?.id === client.id && (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          {client.companyName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-0.5">
                              {client.companyName}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 truncate">{client.email}</p>
                          <Badge variant="secondary" className="text-xs mt-2">
                            {client.type}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
