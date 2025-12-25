// CreateRecurringInvoiceView Component - 3-step wizard for creating recurring invoices from templates
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
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
  Users,
  User,
  Building2,
  Search,
  Repeat,
  AlertCircle,
  Calendar,
  DollarSign,
  Check,
  Plus,
  Minus,
  Trash2,
  FileText,
  Pencil,
  Tag,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Building,
  Clock,
  Sparkles,
  Percent,
  Download,
  Save,
  Send,
  ShoppingCart,
} from 'lucide-react';
import { type Client } from '../../App';
import { RecurrenceSelector, RecurrenceData } from '../RecurrenceSelector';
import { StepNavigation, Step as StepConfig } from '../StepNavigation';
import { toast } from 'sonner@2.0.3';

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
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

type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

type WorkflowStep = 'client' | 'recurrence' | 'firstInvoiceOptions' | 'firstInvoiceDetails' | 'recurringDetails' | 'reviewSend';

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

type FirstInvoiceSendOption = 'immediately' | 'scheduled' | 'draft';
type RecurringSendOption = 'auto-send' | 'draft';

// Mock clients data - expanded to match AddInvoiceView
const mockClients: Client[] = [
  { id: '1', name: 'Smith Family Trust', firstName: 'John', lastName: 'Smith', email: 'john@smith.com', phone: '555-0101', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: ['High Priority'], createdDate: '2024-01-15' },
  { id: '2', name: 'Tech Startup Inc.', firstName: 'Jane', lastName: 'Doe', email: 'jane@techstartup.com', phone: '555-0102', type: 'Business', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['Recurring'], createdDate: '2024-02-20' },
  { id: '3', name: 'Anderson LLC', firstName: 'Bob', lastName: 'Anderson', email: 'bob@andersonllc.com', phone: '555-0103', type: 'Business', group: 'Business Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-03-10' },
  { id: '4', name: 'Johnson & Associates', firstName: 'Michael', lastName: 'Johnson', email: 'michael@johnsonassoc.com', phone: '555-0104', type: 'Business', group: 'Business Clients', assignedTo: 'Sarah Johnson', tags: ['High Priority'], createdDate: '2024-01-20' },
  { id: '5', name: 'Garcia Consulting', firstName: 'Maria', lastName: 'Garcia', email: 'maria@garciaconsulting.com', phone: '555-0105', type: 'Business', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['Recurring'], createdDate: '2024-02-15' },
  { id: '6', name: 'Emily Rodriguez', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.r@consulting.com', phone: '555-0106', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-03-05' },
  { id: '7', name: 'Wilson Enterprises', firstName: 'David', lastName: 'Wilson', email: 'david@wilsonenterprises.com', phone: '555-0107', type: 'Business', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['High Priority'], createdDate: '2024-02-28' },
  { id: '8', name: 'Christina Baker', firstName: 'Christina', lastName: 'Baker', email: 'christina@bakerllc.com', phone: '555-0108', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-01-10' },
].sort((a, b) => a.name.localeCompare(b.name));

// Mock memo templates
const mockMemoTemplates: MemoTemplate[] = [
  { id: '1', name: 'Standard Payment Terms', content: 'Payment is due within 30 days of invoice date. Please include invoice number with payment.', category: 'General' },
  { id: '2', name: 'Recurring Service', content: 'This is a recurring monthly invoice for services rendered. Services will continue unless cancelled in writing.', category: 'Recurring' },
  { id: '3', name: 'Late Payment', content: 'Late payments will incur a 1.5% monthly interest charge. Please contact us if you need alternative payment arrangements.', category: 'Payment' },
];

export function CreateRecurringInvoiceView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Component initialization
  const locationState = location.state as { selectedTemplate?: InvoiceTemplate; fromManageTemplates?: boolean } | null;

  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('client');
  const [visitedSteps, setVisitedSteps] = useState<Set<WorkflowStep>>(new Set(['client']));

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate] = useState<InvoiceTemplate | null>(locationState?.selectedTemplate || null);
  
  // Initialize recurrence data from template or use defaults
  const defaultRecurrence: RecurrenceData = selectedTemplate?.recurrence || {
    pattern: 'monthly',
    interval: 1,
    startDate: undefined,
    endDate: undefined,
    occurrences: undefined,
    endType: 'never'
  };
  
  const [recurrence, setRecurrence] = useState<RecurrenceData>(defaultRecurrence);
  const [isRecurring, setIsRecurring] = useState(true);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [firstInvoiceItems, setFirstInvoiceItems] = useState<InvoiceItem[]>([]);
  const [hasCustomFirstInvoice, setHasCustomFirstInvoice] = useState<boolean | null>(null);
  const [firstInvoiceDate, setFirstInvoiceDate] = useState<Date | undefined>(undefined);
  const [firstInvoicePaymentMethods, setFirstInvoicePaymentMethods] = useState<PaymentMethod[]>(['card']);
  const [firstInvoiceDiscount, setFirstInvoiceDiscount] = useState<Discount | null>(null);
  const [firstInvoiceMemo, setFirstInvoiceMemo] = useState('');
  const [showFirstInvoiceDiscountPopup, setShowFirstInvoiceDiscountPopup] = useState(false);
  const [showFirstInvoiceMemoTemplates, setShowFirstInvoiceMemoTemplates] = useState(false);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState<string>('DUE_ON_RECEIPT');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(['card']);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [memo, setMemo] = useState('');
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [memoTemplates] = useState<MemoTemplate[]>(mockMemoTemplates);
  
  // Step 5 - Review & Send state
  const [firstInvoiceSendOption, setFirstInvoiceSendOption] = useState<FirstInvoiceSendOption>('scheduled');
  const [recurringSendOption, setRecurringSendOption] = useState<RecurringSendOption>('auto-send');
  const [previewMode, setPreviewMode] = useState<'first' | 'recurring'>('first');

  // UI state
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [showRecurringToggleConfirm, setShowRecurringToggleConfirm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: '1',
    rate: '',
  });
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [isChangingClient, setIsChangingClient] = useState(false);

  // Step configuration - Dynamic based on whether first invoice is custom
  const stepConfigs: StepConfig[] = useMemo(() => {
    if (hasCustomFirstInvoice === null) {
      // Show potential step 4 so user knows there's more
      return [
        { id: 'client', label: 'Select Client', number: 1 },
        { id: 'recurrence', label: 'Configure Recurrence', number: 2 },
        { id: 'firstInvoiceOptions', label: 'First Invoice Options', number: 3 },
        { id: 'recurringDetails', label: 'Recurring Template', number: 4 },
        { id: 'reviewSend', label: 'Review & Send', number: 5 },
      ];
    } else if (hasCustomFirstInvoice) {
      return [
        { id: 'client', label: 'Select Client', number: 1 },
        { id: 'recurrence', label: 'Configure Recurrence', number: 2 },
        { id: 'firstInvoiceOptions', label: 'First Invoice Options', number: 3 },
        { id: 'firstInvoiceDetails', label: 'First Invoice Details', number: 4 },
        { id: 'recurringDetails', label: 'Recurring Template', number: 5 },
        { id: 'reviewSend', label: 'Review & Send', number: 6 },
      ];
    } else {
      return [
        { id: 'client', label: 'Select Client', number: 1 },
        { id: 'recurrence', label: 'Configure Recurrence', number: 2 },
        { id: 'firstInvoiceOptions', label: 'First Invoice Options', number: 3 },
        { id: 'recurringDetails', label: 'Recurring Template', number: 4 },
        { id: 'reviewSend', label: 'Review & Send', number: 5 },
      ];
    }
  }, [hasCustomFirstInvoice]);

  // Initialize line items from template
  useEffect(() => {
    if (selectedTemplate?.lineItems && selectedTemplate.lineItems.length > 0) {
      const templateItems: InvoiceItem[] = selectedTemplate.lineItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      }));
      setItems(templateItems);
    }
  }, [selectedTemplate]);

  // Filtered clients
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  ).filter(client => clientTypeFilter === 'all' || client.type === clientTypeFilter);

  // Calculate client counts
  const allClientsCount = mockClients.length;
  const individualCount = mockClients.filter(c => c.type === 'Individual').length;
  const businessCount = mockClients.filter(c => c.type === 'Business').length;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount 
    ? discount.type === 'percentage' 
      ? subtotal * (discount.value / 100) 
      : discount.value 
    : 0;
  const total = subtotal - discountAmount;

  // Calculate first invoice totals
  const firstInvoiceSubtotal = firstInvoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const firstInvoiceDiscountAmount = firstInvoiceDiscount 
    ? firstInvoiceDiscount.type === 'percentage' 
      ? firstInvoiceSubtotal * (firstInvoiceDiscount.value / 100) 
      : firstInvoiceDiscount.value 
    : 0;
  const firstInvoiceTotal = firstInvoiceSubtotal - firstInvoiceDiscountAmount;

  // Navigation handlers
  const handleBack = () => {
    if (currentStep === 'client') {
      navigate('/manage-invoice-templates');
    } else if (currentStep === 'recurrence') {
      setCurrentStep('client');
    } else if (currentStep === 'firstInvoiceOptions') {
      setCurrentStep('recurrence');
    } else if (currentStep === 'firstInvoiceDetails') {
      setCurrentStep('firstInvoiceOptions');
    } else if (currentStep === 'recurringDetails') {
      if (hasCustomFirstInvoice) {
        setCurrentStep('firstInvoiceDetails');
      } else {
        setCurrentStep('firstInvoiceOptions');
      }
    } else if (currentStep === 'reviewSend') {
      setCurrentStep('recurringDetails');
    }
  };

  const handleStepNavigation = (stepId: string) => {
    if (visitedSteps.has(stepId as WorkflowStep)) {
      setCurrentStep(stepId as WorkflowStep);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    if (isChangingClient) {
      setShowClientSelector(false);
      setIsChangingClient(false);
      setClientSearchQuery('');
    } else {
      setVisitedSteps(prev => new Set([...prev, 'recurrence']));
      setCurrentStep('recurrence');
      setClientSearchQuery('');
    }
  };

  const handleContinueToFirstInvoiceOptions = () => {
    setVisitedSteps(prev => new Set([...prev, 'firstInvoiceOptions']));
    setCurrentStep('firstInvoiceOptions');
  };

  const handleFirstInvoiceDecision = (isDifferent: boolean) => {
    setHasCustomFirstInvoice(isDifferent);
    if (isDifferent) {
      // Pre-populate first invoice items from template
      const templateItems: InvoiceItem[] = selectedTemplate?.lineItems?.map((item, index) => ({
        id: `first-item-${Date.now()}-${index}`,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })) || [];
      setFirstInvoiceItems(templateItems);
      // Set first invoice date to recurrence start date
      setFirstInvoiceDate(recurrence.startDate);
      setVisitedSteps(prev => new Set([...prev, 'firstInvoiceDetails']));
      setCurrentStep('firstInvoiceDetails');
    } else {
      setVisitedSteps(prev => new Set([...prev, 'recurringDetails']));
      setCurrentStep('recurringDetails');
    }
  };

  // Payment methods handlers
  const togglePaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const toggleFirstInvoicePaymentMethod = (method: PaymentMethod) => {
    setFirstInvoicePaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Discount handlers
  const handleRemoveDiscount = () => {
    setDiscount(null);
    toast.success('Discount removed');
  };

  const handleRemoveFirstInvoiceDiscount = () => {
    setFirstInvoiceDiscount(null);
    toast.success('Discount removed');
  };

  // Line items handlers
  const handleAddItem = () => {
    if (!newItem.name || !newItem.rate) {
      toast.error('Please enter a name and rate');
      return;
    }

    const quantity = parseFloat(newItem.quantity) || 1;
    const rate = parseFloat(newItem.rate) || 0;

    const item: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      quantity,
      rate,
      amount: quantity * rate,
    };

    setItems([...items, item]);
    setNewItem({ name: '', description: '', quantity: '1', rate: '' });
    setShowAddItemDialog(false);
    toast.success('Line item added');
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = updated.quantity * updated.rate;
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Line item removed');
  };

  // First invoice line items handlers
  const handleAddFirstInvoiceItem = () => {
    if (!newItem.name || !newItem.rate) {
      toast.error('Please enter a name and rate');
      return;
    }

    const quantity = parseFloat(newItem.quantity) || 1;
    const rate = parseFloat(newItem.rate) || 0;

    const item: InvoiceItem = {
      id: `first-item-${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      quantity,
      rate,
      amount: quantity * rate,
    };

    setFirstInvoiceItems([...firstInvoiceItems, item]);
    setNewItem({ name: '', description: '', quantity: '1', rate: '' });
    setShowAddItemDialog(false);
    toast.success('Line item added to first invoice');
  };

  const handleUpdateFirstInvoiceItem = (id: string, field: string, value: any) => {
    setFirstInvoiceItems(firstInvoiceItems.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = updated.quantity * updated.rate;
      }
      return updated;
    }));
  };

  const handleRemoveFirstInvoiceItem = (id: string) => {
    setFirstInvoiceItems(firstInvoiceItems.filter(item => item.id !== id));
    toast.success('Line item removed from first invoice');
  };

  const handleContinueToReview = () => {
    setVisitedSteps(prev => new Set([...prev, 'reviewSend']));
    setCurrentStep('reviewSend');
  };

  const handleFinalSaveDraft = () => {
    toast.success('Recurring invoice saved as draft!');
    navigate('/billing');
  };

  const handleFinalSend = () => {
    toast.success(`✅ Recurring invoice created! First invoice will be sent on ${firstInvoiceDate?.toLocaleDateString()}. Recurring invoices will be sent automatically.`);
    navigate('/billing');
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
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Create Recurring Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 1: Select Client
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
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl mb-2">Who is this recurring invoice for?</h2>
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
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
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
                      {(clientSearchQuery || clientTypeFilter !== 'all') && (
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => {
                            setClientSearchQuery('');
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
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Configure Recurrence
  if (currentStep === 'recurrence') {
    // Generate upcoming invoice dates preview
    const generateUpcomingDates = () => {
      if (!isRecurring) return [];
      
      const dates: Date[] = [];
      const startDate = recurrence.startDate ? new Date(recurrence.startDate) : new Date();
      const maxDates = recurrence.endType === 'occurrences' && recurrence.occurrences ? recurrence.occurrences : 10;
      
      for (let i = 0; i < Math.min(maxDates, 10); i++) {
        const date = new Date(startDate);
        
        switch (recurrence.pattern) {
          case 'daily':
            date.setDate(startDate.getDate() + (i * recurrence.interval));
            break;
          case 'weekly':
            date.setDate(startDate.getDate() + (i * recurrence.interval * 7));
            break;
          case 'monthly':
            date.setMonth(startDate.getMonth() + (i * recurrence.interval));
            break;
          case 'quarterly':
            date.setMonth(startDate.getMonth() + (i * recurrence.interval * 3));
            break;
          case 'yearly':
            date.setFullYear(startDate.getFullYear() + (i * recurrence.interval));
            break;
        }
        
        // Check if past end date
        if (recurrence.endType === 'date' && recurrence.endDate) {
          const endDate = new Date(recurrence.endDate);
          if (date > endDate) break;
        }
        
        dates.push(date);
      }
      
      return dates;
    };

    const upcomingDates = generateUpcomingDates();

    // Generate recurrence summary text
    const getRecurrenceSummary = () => {
      if (!isRecurring) {
        return "This will be a one-time invoice using the template's line items.";
      }

      const pattern = recurrence.pattern.charAt(0).toUpperCase() + recurrence.pattern.slice(1);
      let summary = `Invoices will be sent ${recurrence.pattern}`;
      
      if (recurrence.interval && recurrence.interval > 1) {
        summary = `Invoices will be sent every ${recurrence.interval} ${recurrence.pattern === 'monthly' ? 'months' : recurrence.pattern === 'weekly' ? 'weeks' : recurrence.pattern === 'daily' ? 'days' : 'years'}`;
      }

      if (recurrence.endType === 'never') {
        summary += ', continuing indefinitely until cancelled.';
      } else if (recurrence.endType === 'date' && recurrence.endDate) {
        summary += ` until ${new Date(recurrence.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
      } else if (recurrence.endType === 'occurrences' && recurrence.occurrences) {
        const firstDate = upcomingDates[0];
        const lastDate = upcomingDates[upcomingDates.length - 1];
        summary += ` for ${recurrence.occurrences} ${recurrence.occurrences === 1 ? 'invoice' : 'invoices'} total`;
        if (firstDate && lastDate) {
          summary += ` (${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
        }
        summary += '.';
      }

      return summary;
    };

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
              <h1 className="text-xl">Create Recurring Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 2: Configure Recurrence
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
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                <Repeat className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl mb-2">Configure Recurrence</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up the recurring schedule for this invoice
              </p>
            </div>

            {/* What Will Happen - PROMINENT - Full Width */}
            <div className="mb-6">
              <div className="p-6 rounded-xl border-2 shadow-lg" style={{ 
                borderColor: isRecurring ? 'var(--primaryColor)' : '#e5e7eb',
                backgroundColor: isRecurring ? 'var(--primaryColor)' : '#f9fafb',
                color: isRecurring ? 'white' : 'inherit'
              }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{
                    backgroundColor: isRecurring ? 'rgba(255, 255, 255, 0.2)' : 'rgba(124, 58, 237, 0.1)'
                  }}>
                    {isRecurring ? (
                      <Repeat className="w-6 h-6 text-white" />
                    ) : (
                      <FileText className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">
                      {isRecurring ? 'Recurring Invoice Schedule' : 'One-Time Invoice'}
                    </div>
                    <div className="text-base" style={{ 
                      opacity: isRecurring ? 0.95 : 1,
                      color: isRecurring ? 'white' : '#4b5563'
                    }}>
                      {getRecurrenceSummary()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: 2/3 Left (Controls) | 1/3 Right (Preview) */}
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column: Controls (2/3) */}
              <div className="col-span-2 space-y-6">
                {/* Toggle Recurring On/Off */}
                {!isRecurring ? (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-lg mb-1">Enable Recurring Invoice</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically generate invoices on a recurring schedule
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsRecurring(true)}
                        className="ml-4 text-white"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        Turn On Recurrence
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-lg mb-1">Turn Off Recurring</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Create a one-time invoice using the template's line items instead
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsRecurring(false)}
                        className="ml-4"
                      >
                        Turn Off Recurrence
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recurrence Settings - Only show if recurring is enabled */}
                {isRecurring && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6">
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">Schedule Settings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure when and how often invoices should be generated
                      </p>
                    </div>
                    <RecurrenceSelector
                      value={recurrence}
                      onChange={setRecurrence}
                    />
                  </div>
                )}

                {/* Continue button */}
                <div className="space-y-2">
                  <Button
                    onClick={handleContinueToFirstInvoiceOptions}
                    className="w-full gap-2 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    Continue to Invoice Options
                  </Button>
                </div>
              </div>

              {/* Right Column: Schedule Preview (1/3) */}
              <div className="col-span-1">
                {isRecurring && upcomingDates.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 sticky top-6">
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">Upcoming Schedule</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {upcomingDates.length === 10 ? 'First 10 invoices' : `${upcomingDates.length} invoice${upcomingDates.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {upcomingDates.map((date, index) => (
                        <div 
                          key={index}
                          className="p-3 border-2 rounded-lg flex items-center gap-3 bg-purple-50/50 dark:bg-purple-950/10"
                          style={{ borderColor: 'var(--primaryColor)', opacity: 0.8 }}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--primaryColor)' }}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {recurrence.endType === 'never' && (
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                        ... continuing indefinitely
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: First Invoice Options - Decision screen
  if (currentStep === 'firstInvoiceOptions') {
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
                <h1 className="text-xl">Create Recurring Invoice</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step 3: First Invoice Options
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl mb-2">Is your first invoice different?</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sometimes the first invoice in a recurring series includes one-time charges. Let us know if your first invoice needs special items.
              </p>
            </div>

            {/* Decision Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* YES - First invoice is different */}
              <button
                onClick={() => handleFirstInvoiceDecision(true)}
                className="group relative p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] bg-white dark:bg-gray-900 transition-all hover:shadow-2xl text-left"
              >
                <div className="absolute top-6 right-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-4" style={{ minHeight: '32px' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--primaryColor)' }}>Recommended for most cases</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Yes, my first invoice is different</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Customize the first invoice with one-time charges, then set up the recurring template.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common use cases:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Setup or Onboarding Fee</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">One-time charge for getting started</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building className="w-3.5 h-3.5" style={{ color: 'var(--primaryColor)' }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Initial Deposit or Advance Payment</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">First month plus security deposit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Percent className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Pro-rated First Period</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Partial month or discounted trial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Installation or Activation Fee</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">One-time hardware or service setup</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--primaryColor)' }}>
                    <span className="font-medium">Next: Customize first invoice</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* NO - Use same template */}
              <button
                onClick={() => handleFirstInvoiceDecision(false)}
                className="group relative p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)] bg-white dark:bg-gray-900 transition-all hover:shadow-2xl text-left"
              >
                <div className="absolute top-6 right-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
                    <Repeat className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-4" style={{ minHeight: '32px' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Simple & Quick</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No, use the same template</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    All invoices (including the first one) will use identical line items and amounts.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best for:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Repeat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Consistent Monthly Services</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Subscriptions, retainers, memberships</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Fixed Pricing Agreements</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Same amount every billing cycle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" style={{ color: 'var(--primaryColor)' }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Recurring Software Licenses</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SaaS, annual renewals, ongoing contracts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Regular Maintenance Plans</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Property upkeep, service contracts</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--primaryColor)' }}>
                    <span className="font-medium">Next: Configure recurring template</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Don't worry, you can always edit later</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Whether you choose to customize the first invoice or use the same template, you'll be able to review and modify all line items before finalizing. You can also edit individual invoices after they're generated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: First Invoice Details (Conditional - only if hasCustomFirstInvoice is true)
  if (currentStep === 'firstInvoiceDetails') {
    // This will be similar to the details screen but for first invoice only
    // To be implemented with full line items management
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
                <h1 className="text-xl">Create Recurring Invoice</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step 4: First Invoice Details
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

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Invoice Form (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contextual Banner */}
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2" style={{ color: 'var(--primaryColor)' }}>Customizing Your First Invoice</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Add one-time charges or customize line items for this initial invoice. On the next step, you'll configure the recurring invoice template.
                      </p>
                    </div>
                  </div>
                </div>

                {/* First Invoice Date */}
                <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-base flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    First Invoice Date
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {firstInvoiceDate ? firstInvoiceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={firstInvoiceDate}
                        onSelect={setFirstInvoiceDate}
                      />
                    </PopoverContent>
                  </Popover>
                </Card>

                {/* Line Items */}
                <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                      Line Items
                    </h3>
                    
                    {/* Discount Toggle */}
                    {firstInvoiceDiscount ? (
                      <button
                        onClick={handleRemoveFirstInvoiceDiscount}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30"
                      >
                        <Percent className="w-3.5 h-3.5 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {firstInvoiceDiscount.type === 'percentage' ? `${firstInvoiceDiscount.value}%` : `$${firstInvoiceDiscount.value}`} off
                        </span>
                        <X className="w-3 h-3 text-green-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowFirstInvoiceDiscountPopup(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Add Discount</span>
                      </button>
                    )}
                  </div>

                  {firstInvoiceItems.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                      <div className="text-center mb-6">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 mb-6">No line items yet</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
                        <button
                          onClick={() => {
                            const newInvoiceItem: InvoiceItem = {
                              id: `first-item-${Date.now()}`,
                              name: '',
                              description: '',
                              quantity: 1,
                              rate: 0,
                              amount: 0
                            };
                            setFirstInvoiceItems([...firstInvoiceItems, newInvoiceItem]);
                          }}
                          className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                        >
                          <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                          <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter inline
                          </p>
                        </button>
                        <button
                          onClick={() => {
                            toast.info('Line item templates coming soon!');
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
                  {firstInvoiceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex-1">
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateFirstInvoiceItem(item.id, 'name', e.target.value)}
                          className="mb-2 font-medium"
                          placeholder="Item name"
                        />
                        <Input
                          value={item.description || ''}
                          onChange={(e) => handleUpdateFirstInvoiceItem(item.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-20">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateFirstInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className="text-center"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateFirstInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            placeholder="Rate"
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28 flex items-center justify-end font-medium">
                          ${item.amount.toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFirstInvoiceItem(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      </div>
                    ))}
                    
                    {/* Add Item Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          const newInvoiceItem: InvoiceItem = {
                            id: `item-${Date.now()}`,
                            name: '',
                            description: '',
                            quantity: 1,
                            rate: 0,
                            amount: 0
                          };
                          setFirstInvoiceItems([...firstInvoiceItems, newInvoiceItem]);
                        }}
                        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                        <div className="text-center">
                          <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Create Custom</div>
                          <div className="text-xs text-gray-500 mt-1">Enter manually</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setShowAddItemDialog(true)}
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
                      onClick={() => toggleFirstInvoicePaymentMethod('card')}
                      className={`p-5 border-2 rounded-xl transition-all ${
                        firstInvoicePaymentMethods.includes('card')
                          ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <CreditCard className="w-8 h-8 mb-3 mx-auto" style={firstInvoicePaymentMethods.includes('card') ? { color: 'var(--primaryColor)' } : {}} />
                      <div className="font-medium">Card</div>
                      <div className="text-xs text-gray-500 mt-1">Credit/Debit</div>
                    </button>
                    <button
                      onClick={() => toggleFirstInvoicePaymentMethod('ach')}
                      className={`p-5 border-2 rounded-xl transition-all ${
                        firstInvoicePaymentMethods.includes('ach')
                          ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Building className="w-8 h-8 mb-3 mx-auto" style={firstInvoicePaymentMethods.includes('ach') ? { color: 'var(--primaryColor)' } : {}} />
                      <div className="font-medium">ACH</div>
                      <div className="text-xs text-gray-500 mt-1">Bank Transfer</div>
                    </button>
                    <button
                      onClick={() => toggleFirstInvoicePaymentMethod('amazon')}
                      className={`p-5 border-2 rounded-xl transition-all ${
                        firstInvoicePaymentMethods.includes('amazon')
                          ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <ShoppingCart className="w-8 h-8 mb-3 mx-auto" style={firstInvoicePaymentMethods.includes('amazon') ? { color: 'var(--primaryColor)' } : {}} />
                      <div className="font-medium">Amazon</div>
                      <div className="text-xs text-gray-500 mt-1">Amazon Pay</div>
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
                      onClick={() => setShowFirstInvoiceMemoTemplates(!showFirstInvoiceMemoTemplates)}
                      className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                      style={{ color: 'var(--primaryColor)' }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {showFirstInvoiceMemoTemplates ? 'Hide Templates' : 'Use Template'}
                    </button>
                  </div>

                  {showFirstInvoiceMemoTemplates && (
                    <div className="mb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                        {memoTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setFirstInvoiceMemo(template.content);
                              setShowFirstInvoiceMemoTemplates(false);
                              toast.success(`Applied "${template.name}"`);
                            }}
                            className="relative p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-sm pr-2">{template.name}</div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0" style={{ color: 'var(--primaryColor)' }}>
                                {template.category}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{template.content}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Textarea
                    id="firstInvoiceMemo"
                    value={firstInvoiceMemo}
                    onChange={(e) => setFirstInvoiceMemo(e.target.value)}
                    placeholder="Add payment instructions, terms, or notes for your client..."
                    rows={4}
                    className="resize-none"
                  />
                </Card>

                {/* Continue Button */}
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setVisitedSteps(prev => new Set([...prev, 'recurringDetails']));
                      setCurrentStep('recurringDetails');
                    }}
                    className="w-full gap-2 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    Continue to Recurring Template
                  </Button>
                </div>
              </div>

              {/* Right Column - Preview (1/3) */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4" style={{ marginTop: '130px' }}>
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

                    {/* Preview Body */}
                    <div className="p-8 bg-white dark:bg-gray-900 relative">
                      {/* Total Amount */}
                      <div className="mb-1">
                        <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                          ${firstInvoiceTotal.toFixed(2)}
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="mb-8 text-gray-500 text-sm">
                        {firstInvoiceDate ? `Due ${firstInvoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Due date not set'}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-16">To</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {selectedClient ? selectedClient.name : '—'}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-16">From</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">Your Company Name</span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-16">Date</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {firstInvoiceDate ? firstInvoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Line Items Summary */}
                      {firstInvoiceItems.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="space-y-3">
                            {firstInvoiceItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'Untitled'}</div>
                                  {item.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                  )}
                                </div>
                                <div className="text-gray-900 dark:text-gray-100 ml-4">
                                  ${item.amount.toFixed(2)}
                                </div>
                              </div>
                            ))}
                            
                            {/* Subtotal & Discount */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 dark:text-gray-100">${firstInvoiceSubtotal.toFixed(2)}</span>
                              </div>
                              {firstInvoiceDiscount && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-600">
                                    Discount ({firstInvoiceDiscount.type === 'percentage' ? `${firstInvoiceDiscount.value}%` : `$${firstInvoiceDiscount.value}`})
                                  </span>
                                  <span className="text-green-600">-${firstInvoiceDiscountAmount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                                <span className="text-gray-900 dark:text-gray-100">Total</span>
                                <span className="text-gray-900 dark:text-gray-100">${firstInvoiceTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Methods */}
                      {firstInvoicePaymentMethods.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                          <div className="text-xs text-gray-500 mb-2">Payment Methods</div>
                          <div className="flex gap-2">
                            {firstInvoicePaymentMethods.map((method) => (
                              <div key={method} className="px-2 py-1 bg-purple-50 dark:bg-purple-950/20 rounded text-xs" style={{ color: 'var(--primaryColor)' }}>
                                {method === 'card' ? 'Card' : method === 'ach' ? 'ACH' : 'Amazon'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Memo */}
                      {firstInvoiceMemo && (
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                          <div className="text-xs text-gray-500 mb-2">Memo</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{firstInvoiceMemo}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5 (or 4): Recurring Template / Line Items & Details
  if (currentStep === 'recurringDetails') {
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
              <h1 className="text-xl">Create Recurring Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasCustomFirstInvoice ? 'Step 5: Recurring Invoice Template' : 'Step 4: Recurring Invoice Template'}
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
              {/* Recurring Invoice Info Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                      <Repeat className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2" style={{ color: 'var(--primaryColor)' }}>Recurring Invoice Template</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {hasCustomFirstInvoice 
                        ? `This invoice will be sent on a recurring basis starting after your custom first invoice.`
                        : `This invoice will be sent on a recurring basis based on the schedule you configured.`}
                    </p>
                  </div>
                </div>
              </div>

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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                        onClick={() => {
                          const newInvoiceItem: InvoiceItem = {
                            id: `item-${Date.now()}`,
                            name: '',
                            description: '',
                            quantity: 1,
                            rate: 0,
                            amount: 0
                          };
                          setItems([...items, newInvoiceItem]);
                        }}
                        className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                      >
                        <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                        <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enter manually
                        </p>
                      </button>
                      <button
                        onClick={() => setShowAddItemDialog(true)}
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
                                onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                onFocus={(e) => e.target.select()}
                                placeholder="Service or product name"
                                className="flex-1 font-medium"
                              />
                            </div>
                            <Input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
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
                                onClick={() => {
                                  const newQty = Math.max(1, item.quantity - 1);
                                  handleUpdateItem(item.id, 'quantity', newQty);
                                }}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                                onFocus={(e) => e.target.select()}
                                className="text-center h-10"
                                min="1"
                                style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                              />
                              <button
                                onClick={() => handleUpdateItem(item.id, 'quantity', item.quantity + 1)}
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
                                onClick={() => {
                                  const newRate = Math.max(0, item.rate - 1);
                                  handleUpdateItem(item.id, 'rate', newRate);
                                }}
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
                                  onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  className="pl-8 text-center h-10"
                                  min="0"
                                  step="0.01"
                                  style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                                />
                              </div>
                              <button
                                onClick={() => handleUpdateItem(item.id, 'rate', item.rate + 1)}
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
                        onClick={() => {
                          const newInvoiceItem: InvoiceItem = {
                            id: `item-${Date.now()}`,
                            name: '',
                            description: '',
                            quantity: 1,
                            rate: 0,
                            amount: 0
                          };
                          setItems([...items, newInvoiceItem]);
                        }}
                        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                        <div className="text-center">
                          <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Create Custom</div>
                          <div className="text-xs text-gray-500 mt-1">Enter inline</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Line item templates coming soon!');
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
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                      {memoTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setMemo(template.content);
                            setShowMemoTemplates(false);
                            toast.success(`Applied "${template.name}"`);
                          }}
                          className="relative p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-sm pr-2">{template.name}</div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0" style={{ color: 'var(--primaryColor)' }}>
                              {template.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{template.content}</div>
                        </button>
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

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleContinueToReview}
                  className="w-full gap-2 h-12"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  Continue to Review
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
                    {/* Invoice Icon with Download Circle on the right */}
                    <div className="absolute top-6 right-6 opacity-10">
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
                    </div>

                    {/* Total Amount - Large */}
                    <div className="mb-1">
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        ${total.toFixed(2)}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="mb-8 text-gray-500 text-sm">
                      {dueDate === 'DUE_ON_RECEIPT' ? 'Due on Receipt' : `Due ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
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

                      {/* Date */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">Date</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Line Items Summary */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Included Items ({items.length}):
                        </p>
                        <div className="space-y-2 mb-4">
                          {items.map((item, idx) => {
                            const itemAmount = (item.quantity || 0) * (item.rate || 0);
                            return (
                              <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                  <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name || 'Untitled'}</span>
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
                        </div>
                        
                        {/* Subtotal & Discount */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900 dark:text-gray-100">${subtotal.toFixed(2)}</span>
                          </div>
                          {discount && (
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">
                                Discount ({discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`})
                              </span>
                              <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="text-gray-900 dark:text-gray-100">Total</span>
                            <span className="text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Methods */}
                    {selectedPaymentMethods.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                        <div className="text-xs text-gray-500 mb-2">Payment Methods</div>
                        <div className="flex gap-2">
                          {selectedPaymentMethods.map((method) => (
                            <div key={method} className="px-2 py-1 bg-purple-50 dark:bg-purple-950/20 rounded text-xs" style={{ color: 'var(--primaryColor)' }}>
                              {method === 'card' ? 'Card' : method === 'ach' ? 'ACH' : 'Amazon'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Memo */}
                    {memo && (
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                        <div className="text-xs text-gray-500 mb-2">Memo</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{memo}</div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Selector Dialog */}
      {showClientSelector && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClientSelector(false);
              setIsChangingClient(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Select Client</h2>
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
                All ({allClientsCount})
              </button>
              <button
                onClick={() => setClientTypeFilter('Individual')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  clientTypeFilter === 'Individual'
                    ? 'bg-[var(--primaryColor)] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
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
                Business ({businessCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-11"
              />
            </div>

            {/* Client List */}
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
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
                      <p className="text-sm text-gray-500 truncate">{client.email}</p>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {client.type}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      {showAddItemDialog && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddItemDialog(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Add Line Item</h2>
              <button
                onClick={() => setShowAddItemDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name *</label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rate *</label>
                  <Input
                    type="number"
                    value={newItem.rate}
                    onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddItemDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={currentStep === 'firstInvoiceDetails' ? handleAddFirstInvoiceItem : handleAddItem}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* First Invoice Discount Popup */}
      {showFirstInvoiceDiscountPopup && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFirstInvoiceDiscountPopup(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Add Discount</h2>
              <button
                onClick={() => setShowFirstInvoiceDiscountPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={firstInvoiceDiscount?.type || 'percentage'}
                  onValueChange={(value: DiscountType) => {
                    setFirstInvoiceDiscount({
                      type: value,
                      value: firstInvoiceDiscount?.value || 0
                    });
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={firstInvoiceDiscount?.value || ''}
                  onChange={(e) => {
                    setFirstInvoiceDiscount({
                      type: firstInvoiceDiscount?.type || 'percentage',
                      value: parseFloat(e.target.value) || 0
                    });
                  }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowFirstInvoiceDiscountPopup(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (firstInvoiceDiscount && firstInvoiceDiscount.value > 0) {
                    setShowFirstInvoiceDiscountPopup(false);
                    toast.success('Discount applied');
                  } else {
                    toast.error('Please enter a discount value');
                  }
                }}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Apply Discount
              </Button>
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
              <h2 className="text-xl font-medium">Add Discount</h2>
              <button
                onClick={() => setShowDiscountPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={discount?.type || 'percentage'}
                  onValueChange={(value: DiscountType) => {
                    setDiscount({
                      type: value,
                      value: discount?.value || 0
                    });
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={discount?.value || ''}
                  onChange={(e) => {
                    setDiscount({
                      type: discount?.type || 'percentage',
                      value: parseFloat(e.target.value) || 0
                    });
                  }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDiscountPopup(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (discount && discount.value > 0) {
                    setShowDiscountPopup(false);
                    toast.success('Discount applied');
                  } else {
                    toast.error('Please enter a discount value');
                  }
                }}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Apply Discount
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }

  // Step 5: Review & Send
  if (currentStep === 'reviewSend') {
    // Calculate next invoice dates for preview
    const generateNextDates = (count: number = 3) => {
      const dates: Date[] = [];
      const startDate = recurrence.startDate ? new Date(recurrence.startDate) : new Date();
      
      for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        
        switch (recurrence.pattern) {
          case 'daily':
            date.setDate(startDate.getDate() + (i * recurrence.interval));
            break;
          case 'weekly':
            date.setDate(startDate.getDate() + (i * recurrence.interval * 7));
            break;
          case 'monthly':
            date.setMonth(startDate.getMonth() + (i * recurrence.interval));
            break;
          case 'quarterly':
            date.setMonth(startDate.getMonth() + (i * recurrence.interval * 3));
            break;
          case 'yearly':
            date.setFullYear(startDate.getFullYear() + (i * recurrence.interval));
            break;
        }
        
        dates.push(date);
      }
      
      return dates;
    };

    const nextInvoiceDates = generateNextDates(3);
    const previewItems = previewMode === 'first' ? firstInvoiceItems : items;
    const previewSubtotal = previewItems.reduce((sum, item) => sum + item.amount, 0);
    const previewDiscount = previewMode === 'first' ? firstInvoiceDiscount : discount;
    const previewDiscountAmount = previewDiscount 
      ? previewDiscount.type === 'percentage' 
        ? previewSubtotal * (previewDiscount.value / 100) 
        : previewDiscount.value 
      : 0;
    const previewTotal = previewSubtotal - previewDiscountAmount;

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
              <h1 className="text-xl">Create Recurring Invoice</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {hasCustomFirstInvoice ? '6' : '5'}: Review & Send
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
          <div className="max-w-5xl mx-auto">
            {/* Header with checkmark */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primaryColor)' }}>
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl mb-1">Review & Confirm</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything looks good? Let's send it!
                </p>
              </div>
            </div>

            {/* Two Cards Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* First Invoice Card */}
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border-2" style={{ borderColor: 'var(--primaryColor)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    <h3 className="font-semibold">First Invoice</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}>
                    {firstInvoiceDate 
                      ? firstInvoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Not set'}
                  </div>
                </div>
                
                {/* Amount */}
                <div className="mb-6">
                  <div className="text-4xl font-bold" style={{ color: 'var(--primaryColor)' }}>
                    ${firstInvoiceTotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedClient?.name} · {firstInvoiceItems.length} {firstInvoiceItems.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* Line items list */}
                {firstInvoiceItems.length > 0 && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {firstInvoiceItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            ${item.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × ${item.rate.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Will be sent immediately</span>
                </div>
              </Card>

              {/* Recurring Template Card */}
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Recurring Template</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {recurrence.interval > 1 
                      ? `Every ${recurrence.interval} ${recurrence.pattern}s`
                      : recurrence.pattern}
                  </div>
                </div>
                
                {/* Amount */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedClient?.name} · {items.length} {items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* Line items list */}
                {items.length > 0 && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            ${item.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × ${item.rate.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next 3 Invoice Dates */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 mb-2">Next invoice dates:</div>
                  {nextInvoiceDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Button
                onClick={handleFinalSend}
                className="gap-2 h-12"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Send className="w-4 h-4" />
                Create & Send
              </Button>
              <Button
                variant="outline"
                onClick={handleFinalSaveDraft}
                className="gap-2 h-12"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should never reach here
  return null;
}
