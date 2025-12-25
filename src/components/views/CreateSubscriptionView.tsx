// CreateSubscriptionView Component - 6-step wizard for creating subscriptions
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  User,
  Building2,
  Search,
  Check,
  CreditCard,
  Calendar,
  DollarSign,
  Repeat,
  AlertCircle,
  Plus,
  Minus,
  X,
  FileText,
  Clock,
  Bell,
  Ban,
  Pause,
  PlayCircle,
  Mail,
  Building,
  Percent,
  Tag,
  Filter,
} from 'lucide-react';
import { type Client } from '../../App';
import { StepNavigation, Step as StepConfig } from '../StepNavigation';
import { toast } from 'sonner@2.0.3';

type WorkflowStep = 'client' | 'plan' | 'billing' | 'firstPayment' | 'failedPayment' | 'review';

type BillingFrequency = 'monthly' | 'quarterly' | 'yearly';
type PaymentMethodType = 'card' | 'ach';
type FirstPaymentTiming = 'now' | 'scheduled';
type FirstPaymentAmount = 'full' | 'prorated' | 'custom';
type FinalAction = 'pause' | 'cancel' | 'keep-active';
type DiscountType = 'percentage' | 'amount';
type SubscriptionDuration = 'never' | 'date' | 'occurrences';

type Discount = {
  type: DiscountType;
  value: number;
};

type LineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

// Mock clients data
const mockClients: Client[] = [
  { id: '1', name: 'Smith Family Trust', firstName: 'John', lastName: 'Smith', email: 'john@smith.com', phone: '555-0101', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: ['High Priority'], createdDate: '2024-01-15' },
  { id: '2', name: 'Tech Startup Inc.', firstName: 'Jane', lastName: 'Doe', email: 'jane@techstartup.com', phone: '555-0102', type: 'Business', companyName: 'Tech Startup Inc.', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['Recurring'], createdDate: '2024-02-20' },
  { id: '3', name: 'Anderson LLC', firstName: 'Bob', lastName: 'Anderson', email: 'bob@andersonllc.com', phone: '555-0103', type: 'Business', companyName: 'Anderson LLC', group: 'Business Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-03-10' },
  { id: '4', name: 'Johnson & Associates', firstName: 'Michael', lastName: 'Johnson', email: 'michael@johnsonassoc.com', phone: '555-0104', type: 'Business', companyName: 'Johnson & Associates', group: 'Business Clients', assignedTo: 'Sarah Johnson', tags: ['High Priority'], createdDate: '2024-01-20' },
  { id: '5', name: 'Garcia Consulting', firstName: 'Maria', lastName: 'Garcia', email: 'maria@garciaconsulting.com', phone: '555-0105', type: 'Business', companyName: 'Garcia Consulting', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['Recurring'], createdDate: '2024-02-15' },
  { id: '6', name: 'Emily Rodriguez', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.r@consulting.com', phone: '555-0106', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-03-05' },
  { id: '7', name: 'Wilson Enterprises', firstName: 'David', lastName: 'Wilson', email: 'david@wilsonenterprises.com', phone: '555-0107', type: 'Business', companyName: 'Wilson Enterprises', group: 'Business Clients', assignedTo: 'Michael Chen', tags: ['High Priority'], createdDate: '2024-02-28' },
  { id: '8', name: 'Christina Baker', firstName: 'Christina', lastName: 'Baker', email: 'christina@bakerllc.com', phone: '555-0108', type: 'Individual', group: 'Individual Clients', assignedTo: 'Sarah Johnson', tags: [], createdDate: '2024-01-10' },
].sort((a, b) => a.name.localeCompare(b.name));

export function CreateSubscriptionView() {
  const navigate = useNavigate();

  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('client');
  const [visitedSteps, setVisitedSteps] = useState<Set<WorkflowStep>>(new Set(['client']));

  // Step configuration
  const stepConfigs: StepConfig[] = [
    { id: 'client', label: 'Client', number: 1 },
    { id: 'plan', label: 'Plan', number: 2 },
    { id: 'billing', label: 'Billing Cycle', number: 3 },
    { id: 'firstPayment', label: 'First Payment', number: 4 },
    { id: 'failedPayment', label: 'Failed Payments', number: 5 },
    { id: 'review', label: 'Review', number: 6 },
  ];

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [planName, setPlanName] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [subscriptionDuration, setSubscriptionDuration] = useState<SubscriptionDuration>('never');
  const [endDate, setEndDate] = useState('');
  const [numberOfOccurrences, setNumberOfOccurrences] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>('card');
  const [hasPaymentDetails, setHasPaymentDetails] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [firstPaymentTiming, setFirstPaymentTiming] = useState<FirstPaymentTiming>('now');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');
  const [firstPaymentAmount, setFirstPaymentAmount] = useState<FirstPaymentAmount>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [retry1Days, setRetry1Days] = useState('1');
  const [retry2Days, setRetry2Days] = useState('3');
  const [retry3Days, setRetry3Days] = useState('7');
  const [finalAction, setFinalAction] = useState<FinalAction>('pause');
  const [notifyClientSuccess, setNotifyClientSuccess] = useState(true);
  const [notifyFirmSuccess, setNotifyFirmSuccess] = useState(true);
  const [notifyClientFailure, setNotifyClientFailure] = useState(true);
  const [notifyFirmFailure, setNotifyFirmFailure] = useState(true);

  // UI state
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [discountInput, setDiscountInput] = useState({ type: 'percentage' as DiscountType, value: '' });
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlanNameRequiredPopup, setShowPlanNameRequiredPopup] = useState(false);

  // Refs
  const discountInputRef = useRef<HTMLInputElement>(null);
  const planNameInputRef = useRef<HTMLInputElement>(null);

  // Auto-open client selector on mount
  useEffect(() => {
    if (currentStep === 'client' && !selectedClient) {
      const timer = setTimeout(() => setShowClientSelector(true), 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, selectedClient]);

  // Auto-focus discount input when popup opens
  useEffect(() => {
    if (showDiscountPopup) {
      setTimeout(() => {
        discountInputRef.current?.focus();
        discountInputRef.current?.select();
      }, 200);
    }
  }, [showDiscountPopup]);

  // Auto-focus plan name input when on plan step
  useEffect(() => {
    if (currentStep === 'plan') {
      setTimeout(() => {
        planNameInputRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return mockClients.filter((client) => {
      const matchesType = clientTypeFilter === 'all' || client.type === clientTypeFilter;
      const matchesSearch =
        !clientSearch ||
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.companyName && client.companyName.toLowerCase().includes(clientSearch.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [clientSearch, clientTypeFilter]);

  // Calculate client counts
  const allClientsCount = mockClients.length;
  const individualCount = mockClients.filter(c => c.type === 'Individual').length;
  const businessCount = mockClients.filter(c => c.type === 'Business').length;

  // Handlers
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientSelector(false);
    setClientSearch('');
    handleNext();
  };

  const handleNext = () => {
    // Validate plan name on step 2
    if (currentStep === 'plan' && !planName.trim()) {
      setShowPlanNameRequiredPopup(true);
      return;
    }

    const stepOrder: WorkflowStep[] = ['client', 'plan', 'billing', 'firstPayment', 'failedPayment', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      setVisitedSteps(new Set([...visitedSteps, nextStep]));
    }
  };

  const handleBack = () => {
    const stepOrder: WorkflowStep[] = ['client', 'plan', 'billing', 'firstPayment', 'failedPayment', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleStepClick = (stepId: string) => {
    if (visitedSteps.has(stepId as WorkflowStep)) {
      setCurrentStep(stepId as WorkflowStep);
    }
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput.value);
    if (value > 0) {
      setDiscount({
        type: discountInput.type,
        value,
      });
      toast.success('Discount applied');
    }
    setShowDiscountPopup(false);
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    toast.success('Discount removed');
  };

  // Line Item Handlers
  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
    setEditingItemId(newItem.id);
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
    toast.success('Line item removed');
  };

  const handleIncrementLineItem = (id: string, field: 'quantity' | 'rate') => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const increment = field === 'rate' ? 10 : 1;
        const updatedItem = { ...item, [field]: item[field] + increment };
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        return updatedItem;
      }
      return item;
    }));
  };

  const handleDecrementLineItem = (id: string, field: 'quantity' | 'rate') => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const decrement = field === 'rate' ? 10 : 1;
        const newValue = Math.max(0, item[field] - decrement);
        const updatedItem = { ...item, [field]: newValue };
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Build payload
      const payload = {
        clientId: selectedClient?.id,
        planName,
        lineItems,
        taxYear,
        discount,
        subscriptionDuration,
        endDate: subscriptionDuration === 'date' ? endDate : null,
        numberOfOccurrences: subscriptionDuration === 'occurrences' ? parseInt(numberOfOccurrences) : null,
        billingFrequency,
        billingDay: parseInt(billingDay),
        paymentMethod: {
          type: paymentMethodType,
          details: hasPaymentDetails ? {
            ...(paymentMethodType === 'card' ? {
              cardNumber,
              expiry: cardExpiry,
              cvv: cardCVV,
            } : {
              routingNumber,
              accountNumber,
            }),
          } : null,
        },
        firstPayment: {
          timing: firstPaymentTiming,
          date: firstPaymentDate || null,
          amountType: firstPaymentAmount,
          customAmount: customAmount ? parseFloat(customAmount) : null,
        },
        retryPolicy: {
          retry1Days: parseInt(retry1Days),
          retry2Days: parseInt(retry2Days),
          retry3Days: parseInt(retry3Days),
          finalAction,
        },
        notifications: {
          clientSuccess: notifyClientSuccess,
          firmSuccess: notifyFirmSuccess,
          clientFailure: notifyClientFailure,
          firmFailure: notifyFirmFailure,
        },
      };
      
      console.log('Subscription payload:', payload);
      
      toast.success('Subscription created successfully');
      navigate('/subscriptions');
    } catch (error) {
      toast.error('Failed to create subscription. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Calculations
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const subtotal = calculateSubtotal();
    if (discount.type === 'percentage') {
      return (subtotal * discount.value) / 100;
    }
    return discount.value;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const calculateFirstPaymentAmount = () => {
    const total = calculateTotal();
    if (firstPaymentAmount === 'full') return total;
    if (firstPaymentAmount === 'custom' && customAmount) return parseFloat(customAmount);
    
    // Prorated calculation (simplified - actual would be based on days)
    if (firstPaymentAmount === 'prorated') {
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const remainingDays = daysInMonth - today.getDate() + 1;
      return (total / daysInMonth) * remainingDays;
    }
    
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFrequencyLabel = () => {
    const labels: Record<BillingFrequency, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return labels[billingFrequency];
  };

  // Generate upcoming billing dates for preview
  const generateUpcomingDates = () => {
    const dates: Date[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      
      switch (billingFrequency) {
        case 'monthly':
          date.setMonth(startDate.getMonth() + i);
          break;
        case 'quarterly':
          date.setMonth(startDate.getMonth() + (i * 3));
          break;
        case 'yearly':
          date.setFullYear(startDate.getFullYear() + i);
          break;
      }
      
      // Set to billing day
      date.setDate(parseInt(billingDay));
      dates.push(date);
    }
    
    return dates;
  };

  // Step 1: Client Selection
  if (currentStep === 'client') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-8 py-4 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/subscriptions')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Create New Subscription</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 1 of 6: Select Client
              </p>
            </div>
          </div>

          <StepNavigation
            steps={stepConfigs}
            currentStepId={currentStep}
            visitedStepIds={visitedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {!showClientSelector && !selectedClient && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl mb-3">Select a Client</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose which client this subscription is for
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowClientSelector(true)}
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                  className="gap-2"
                >
                  <User className="w-5 h-5" />
                  Choose Client
                </Button>
              </div>
            )}

            {showClientSelector && (
              <div className="max-w-5xl mx-auto">
                <Card className="p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg">Select Client</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClientSelector(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Filter Buttons */}
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
                  <div className="relative mb-4">
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

  // Steps 2-6: Standard Layout with Header
  return (
    <div className="h-screen bg-gray-50/50 dark:bg-gray-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/subscriptions')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Subscriptions
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-gray-900 dark:text-gray-100">Create New Subscription</h1>
            </div>
          </div>
          
          <StepNavigation
            steps={stepConfigs}
            currentStepId={currentStep}
            visitedStepIds={visitedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Step 2: Subscription Plan */}
          {currentStep === 'plan' && (
            <div className="space-y-6 pb-32">
              {/* Client Info */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Selected Client
                </h3>
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

              {/* Subscription Plan Details */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Subscription Plan Details
                  </h3>
                  
                  {/* Add Discount Button */}
                  {!discount ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDiscountInput({ type: 'percentage', value: '' });
                        setShowDiscountPopup(true);
                      }}
                      className="gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Add Discount
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {discount.type === 'percentage' ? `${discount.value}% off` : `${formatCurrency(discount.value)} off`}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiscount}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planName">Plan Name *</Label>
                    <Input
                      ref={planNameInputRef}
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g., Monthly Bookkeeping Service"
                      className={`mt-1.5 ${!planName.trim() ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500' : ''}`}
                    />
                  </div>

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
                </div>
              </Card>

              {/* Line Items */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Line Items
                  </h3>
                  
                  {/* Discount Toggle */}
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
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleAddLineItem}
                        className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                      >
                        <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                        <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Build from scratch
                        </p>
                      </button>
                      <button
                        onClick={() => toast.info('Line item templates coming soon')}
                        className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                      >
                        <FileText className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                        <h3 className="font-medium text-[var(--primaryColor)] mb-1">Use Template</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          From saved templates
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
                              />
                            </div>
                            <Input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                              placeholder="Description (optional)"
                              className="text-sm text-gray-600 dark:text-gray-400"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="ml-3 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors group"
                            title="Remove item"
                          >
                            <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Quantity</Label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecrementLineItem(item.id, 'quantity')}
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
                                min="1"
                              />
                              <button
                                onClick={() => handleIncrementLineItem(item.id, 'quantity')}
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
                                onClick={() => handleDecrementLineItem(item.id, 'rate')}
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
                                  onChange={(e) => handleUpdateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                  onFocus={(e) => e.target.select()}
                                  className="pl-8 text-center h-10"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <button
                                onClick={() => handleIncrementLineItem(item.id, 'rate')}
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
                    
                    {/* Add Item Button */}
                    <button
                      onClick={handleAddLineItem}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Plus className="w-5 h-5 text-[var(--primaryColor)]" />
                      <span className="text-sm font-medium" style={{ color: 'var(--primaryColor)' }}>Add Another Line Item</span>
                    </button>
                  </div>
                )}
              </Card>

              {/* Pricing Summary */}
              {lineItems.length > 0 && (
                <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-100 dark:border-purple-900">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Pricing Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Discount ({discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)})
                        </span>
                        <span className="text-green-600">
                          -{formatCurrency(calculateDiscountAmount())}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-purple-800">
                      <span className="font-medium">Total per Billing Cycle</span>
                      <span className="font-medium text-lg" style={{ color: 'var(--primaryColor)' }}>
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Billing Cycle */}
          {currentStep === 'billing' && (
            <div className="grid grid-cols-3 gap-6 pb-32">
              {/* Left Column: 2/3 */}
              <div className="col-span-2 space-y-6">
                {/* Billing Frequency */}
                <Card className="p-6 shadow-sm">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <Repeat className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Billing Frequency
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['monthly', 'quarterly', 'yearly'] as BillingFrequency[]).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setBillingFrequency(freq)}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          billingFrequency === freq
                            ? 'bg-purple-50 dark:bg-purple-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        style={{
                          borderColor: billingFrequency === freq ? 'var(--primaryColor)' : undefined,
                        }}
                      >
                        <div className="text-3xl mb-2">
                          {freq === 'monthly' && '📅'}
                          {freq === 'quarterly' && '📊'}
                          {freq === 'yearly' && '🎯'}
                        </div>
                        <div className="font-medium capitalize">{freq}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {freq === 'monthly' && 'Every month'}
                          {freq === 'quarterly' && 'Every 3 months'}
                          {freq === 'yearly' && 'Every year'}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Billing Day */}
                <Card className="p-6 shadow-sm">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Billing Day
                  </h3>
                  <div>
                    <Label htmlFor="billingDay">
                      {billingFrequency === 'monthly' && 'Day of Month'}
                      {billingFrequency === 'quarterly' && 'Day of First Month in Quarter'}
                      {billingFrequency === 'yearly' && 'Day of Year'}
                    </Label>
                    <Select value={billingDay} onValueChange={setBillingDay}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`} of the month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Client will be charged on this day of each billing period
                    </p>
                  </div>
                </Card>

                {/* Payment Method */}
                <Card className="p-6 shadow-sm">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Payment Method
                  </h3>

                  <div className="space-y-4">
                    {/* Method Type Selection */}
                    <div>
                      <Label>Payment Type</Label>
                      <div className="grid grid-cols-2 gap-3 mt-1.5">
                        <button
                          onClick={() => {
                            setPaymentMethodType('card');
                            setHasPaymentDetails(false);
                          }}
                          className={`p-4 border-2 rounded-xl transition-all text-left ${
                            paymentMethodType === 'card'
                              ? 'bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          style={{
                            borderColor: paymentMethodType === 'card' ? 'var(--primaryColor)' : undefined,
                          }}
                        >
                          <CreditCard className="w-6 h-6 mb-2" style={{ color: paymentMethodType === 'card' ? 'var(--primaryColor)' : undefined }} />
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Visa, Mastercard, Amex
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setPaymentMethodType('ach');
                            setHasPaymentDetails(false);
                          }}
                          className={`p-4 border-2 rounded-xl transition-all text-left ${
                            paymentMethodType === 'ach'
                              ? 'bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          style={{
                            borderColor: paymentMethodType === 'ach' ? 'var(--primaryColor)' : undefined,
                          }}
                        >
                          <Building className="w-6 h-6 mb-2" style={{ color: paymentMethodType === 'ach' ? 'var(--primaryColor)' : undefined }} />
                          <div className="font-medium">ACH / Bank Account</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Direct bank transfer
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Optional: Add Payment Details */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setHasPaymentDetails(!hasPaymentDetails)}
                        className="flex items-center gap-2 text-sm hover:underline"
                        style={{ color: 'var(--primaryColor)' }}
                      >
                        {hasPaymentDetails ? (
                          <>
                            <Minus className="w-4 h-4" />
                            Remove payment details
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add payment details (if you have them)
                          </>
                        )}
                      </button>
                    </div>

                    {/* Payment Details Form */}
                    {hasPaymentDetails && (
                      <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
                        {paymentMethodType === 'card' ? (
                          <>
                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="1234 5678 9012 3456"
                                className="mt-1.5"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="cardExpiry">Expiry Date</Label>
                                <Input
                                  id="cardExpiry"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  placeholder="MM/YY"
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label htmlFor="cardCVV">CVV</Label>
                                <Input
                                  id="cardCVV"
                                  value={cardCVV}
                                  onChange={(e) => setCardCVV(e.target.value)}
                                  placeholder="123"
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <Label htmlFor="routingNumber">Routing Number</Label>
                              <Input
                                id="routingNumber"
                                value={routingNumber}
                                onChange={(e) => setRoutingNumber(e.target.value)}
                                placeholder="123456789"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountNumber">Account Number</Label>
                              <Input
                                id="accountNumber"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="000123456789"
                                className="mt-1.5"
                              />
                            </div>
                          </>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          This information will be securely stored and encrypted
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Subscription Duration */}
                <Card className="p-6 shadow-sm">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Subscription Duration
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSubscriptionDuration('never')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          subscriptionDuration === 'never'
                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <Repeat className="w-5 h-5 mx-auto mb-2" style={{ color: subscriptionDuration === 'never' ? 'var(--primaryColor)' : undefined }} />
                        <div className="text-sm font-medium">Never Ends</div>
                        <div className="text-xs text-gray-500 mt-1">Runs indefinitely</div>
                      </button>
                      <button
                        onClick={() => setSubscriptionDuration('date')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          subscriptionDuration === 'date'
                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-2" style={{ color: subscriptionDuration === 'date' ? 'var(--primaryColor)' : undefined }} />
                        <div className="text-sm font-medium">End Date</div>
                        <div className="text-xs text-gray-500 mt-1">Specific date</div>
                      </button>
                      <button
                        onClick={() => setSubscriptionDuration('occurrences')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          subscriptionDuration === 'occurrences'
                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: subscriptionDuration === 'occurrences' ? 'var(--primaryColor)' : undefined }} />
                        <div className="text-sm font-medium"># of Cycles</div>
                        <div className="text-xs text-gray-500 mt-1">Limited cycles</div>
                      </button>
                    </div>

                    {subscriptionDuration === 'date' && (
                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    )}

                    {subscriptionDuration === 'occurrences' && (
                      <div>
                        <Label htmlFor="numberOfOccurrences">Number of Billing Cycles *</Label>
                        <Input
                          id="numberOfOccurrences"
                          type="number"
                          min="1"
                          value={numberOfOccurrences}
                          onChange={(e) => setNumberOfOccurrences(e.target.value)}
                          placeholder="e.g., 12"
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column: 1/3 - Preview */}
              <div className="col-span-1">
                <Card className="p-6 shadow-sm sticky top-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-100 dark:border-blue-900">
                  <h3 className="text-base mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Billing Schedule
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getFrequencyLabel()} billing on day {billingDay}
                    </div>
                    <div className="text-lg font-medium" style={{ color: 'var(--primaryColor)' }}>
                      {formatCurrency(calculateTotal())} / {billingFrequency === 'monthly' ? 'mo' : billingFrequency === 'quarterly' ? 'qtr' : 'yr'}
                    </div>
                  </div>

                  <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
                    <div className="text-sm font-medium mb-3">Upcoming Charges:</div>
                    <div className="space-y-2">
                      {generateUpcomingDates().map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200/50 dark:border-blue-800/50"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
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
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                      ... continuing {billingFrequency}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: First Payment */}
          {currentStep === 'firstPayment' && (
            <div className="space-y-6 pb-32">
              {/* First Payment Timing */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  When to Charge First Payment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFirstPaymentTiming('now')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      firstPaymentTiming === 'now'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: firstPaymentTiming === 'now' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="font-medium">Charge Immediately</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Process payment as soon as subscription is created
                    </div>
                  </button>
                  <button
                    onClick={() => setFirstPaymentTiming('scheduled')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      firstPaymentTiming === 'scheduled'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: firstPaymentTiming === 'scheduled' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <div className="text-3xl mb-2">📅</div>
                    <div className="font-medium">Schedule for Date</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Choose a specific date for first charge
                    </div>
                  </button>
                </div>

                {firstPaymentTiming === 'scheduled' && (
                  <div className="mt-4">
                    <Label htmlFor="firstPaymentDate">First Payment Date</Label>
                    <Input
                      id="firstPaymentDate"
                      type="date"
                      value={firstPaymentDate}
                      onChange={(e) => setFirstPaymentDate(e.target.value)}
                      className="mt-1.5"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </Card>

              {/* First Payment Amount */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  First Payment Amount
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setFirstPaymentAmount('full')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      firstPaymentAmount === 'full'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: firstPaymentAmount === 'full' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <div className="text-2xl mb-2">💯</div>
                    <div className="font-medium">Full Amount</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </button>
                  <button
                    onClick={() => setFirstPaymentAmount('prorated')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      firstPaymentAmount === 'prorated'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: firstPaymentAmount === 'prorated' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium">Prorated</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on remaining days
                    </div>
                  </button>
                  <button
                    onClick={() => setFirstPaymentAmount('custom')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      firstPaymentAmount === 'custom'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: firstPaymentAmount === 'custom' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <div className="text-2xl mb-2">✏️</div>
                    <div className="font-medium">Custom Amount</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter specific amount
                    </div>
                  </button>
                </div>

                {firstPaymentAmount === 'custom' && (
                  <div className="mt-4">
                    <Label htmlFor="customAmount">Custom Amount</Label>
                    <div className="relative mt-1.5">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Preview */}
              <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-100 dark:border-blue-900">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Payment Schedule Preview
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">First Payment</span>
                      <span className="text-lg" style={{ color: 'var(--primaryColor)' }}>
                        {formatCurrency(calculateFirstPaymentAmount())}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {firstPaymentTiming === 'now' ? 'Immediately' : firstPaymentDate ? new Date(firstPaymentDate).toLocaleDateString() : 'On selected date'}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Subsequent Payments</span>
                      <span className="text-lg">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getFrequencyLabel()} on day {billingDay} of billing period
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: Failed Payment & Notifications */}
          {currentStep === 'failedPayment' && (
            <div className="space-y-6 pb-32">
              {/* Retry Policy */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <Repeat className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Payment Retry Schedule
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If a payment fails, the system will automatically retry on the following schedule:
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="retry1Days">First Retry (days after failure)</Label>
                      <Input
                        id="retry1Days"
                        type="number"
                        min="1"
                        value={retry1Days}
                        onChange={(e) => setRetry1Days(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="retry2Days">Second Retry (days after first retry)</Label>
                      <Input
                        id="retry2Days"
                        type="number"
                        min="1"
                        value={retry2Days}
                        onChange={(e) => setRetry2Days(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="retry3Days">Third Retry (days after second retry)</Label>
                      <Input
                        id="retry3Days"
                        type="number"
                        min="1"
                        value={retry3Days}
                        onChange={(e) => setRetry3Days(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Retry Schedule Preview:</strong>
                        <ul className="mt-2 space-y-1 ml-4 list-disc">
                          <li>First retry: {retry1Days} days after initial failure</li>
                          <li>Second retry: {parseInt(retry1Days) + parseInt(retry2Days)} days after initial failure</li>
                          <li>Third retry: {parseInt(retry1Days) + parseInt(retry2Days) + parseInt(retry3Days)} days after initial failure</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Final Action After Retries */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Action After All Retries Fail
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setFinalAction('pause')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      finalAction === 'pause'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: finalAction === 'pause' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <Pause className="w-6 h-6 mb-2" style={{ color: finalAction === 'pause' ? 'var(--primaryColor)' : undefined }} />
                    <div className="font-medium">Pause Subscription</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Temporarily halt billing until resolved
                    </div>
                  </button>
                  <button
                    onClick={() => setFinalAction('cancel')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      finalAction === 'cancel'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: finalAction === 'cancel' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <Ban className="w-6 h-6 mb-2" style={{ color: finalAction === 'cancel' ? 'var(--primaryColor)' : undefined }} />
                    <div className="font-medium">Cancel Subscription</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      End the subscription permanently
                    </div>
                  </button>
                  <button
                    onClick={() => setFinalAction('keep-active')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      finalAction === 'keep-active'
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      borderColor: finalAction === 'keep-active' ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    <PlayCircle className="w-6 h-6 mb-2" style={{ color: finalAction === 'keep-active' ? 'var(--primaryColor)' : undefined }} />
                    <div className="font-medium">Keep Active</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Continue subscription, accumulate unpaid balance
                    </div>
                  </button>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-base mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Email Notifications
                </h3>

                <div className="space-y-6">
                  {/* Success Notifications */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Successful Payment Notifications
                    </h4>
                    <div className="space-y-3 ml-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={notifyClientSuccess}
                            onChange={(e) => setNotifyClientSuccess(e.target.checked)}
                            className="peer w-5 h-5 cursor-pointer opacity-0 absolute"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-[var(--primaryColor)] peer-checked:bg-[var(--primaryColor)] transition-all flex items-center justify-center">
                            {notifyClientSuccess && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Email receipt to client</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Send payment confirmation to {selectedClient?.email}
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={notifyFirmSuccess}
                            onChange={(e) => setNotifyFirmSuccess(e.target.checked)}
                            className="peer w-5 h-5 cursor-pointer opacity-0 absolute"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-[var(--primaryColor)] peer-checked:bg-[var(--primaryColor)] transition-all flex items-center justify-center">
                            {notifyFirmSuccess && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Email receipt to firm</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Internal notification of successful payment
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Failure Notifications */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600" />
                      Failed Payment Notifications
                    </h4>
                    <div className="space-y-3 ml-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={notifyClientFailure}
                            onChange={(e) => setNotifyClientFailure(e.target.checked)}
                            className="peer w-5 h-5 cursor-pointer opacity-0 absolute"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-[var(--primaryColor)] peer-checked:bg-[var(--primaryColor)] transition-all flex items-center justify-center">
                            {notifyClientFailure && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Notify client of payment failure</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Alert client to update payment method
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={notifyFirmFailure}
                            onChange={(e) => setNotifyFirmFailure(e.target.checked)}
                            className="peer w-5 h-5 cursor-pointer opacity-0 absolute"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-[var(--primaryColor)] peer-checked:bg-[var(--primaryColor)] transition-all flex items-center justify-center">
                            {notifyFirmFailure && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Notify firm of payment failure</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Internal alert for failed payment follow-up
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6 pb-32">
              {/* Summary Header */}
              <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-100 dark:border-purple-900">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl mb-2">Review Subscription</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please review all details before creating the subscription
                  </p>
                </div>
              </Card>

              {/* Client Info */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Client
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('client')}>
                    Edit
                  </Button>
                </div>
                {selectedClient && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                      {selectedClient.type === 'Business' ? (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <User className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedClient.name}</p>
                        <Badge variant="secondary" className="text-xs">{selectedClient.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{selectedClient.email}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Plan Details */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Subscription Plan
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('plan')}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan Name</span>
                    <span className="font-medium">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax Year</span>
                    <span>{taxYear}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount ({discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)})
                      </span>
                      <span className="text-green-600">
                        -{formatCurrency(calculateDiscountAmount())}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Total per Billing Cycle</span>
                    <span className="text-lg font-medium" style={{ color: 'var(--primaryColor)' }}>
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Billing Details */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <Repeat className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Billing Details
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('billing')}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frequency</span>
                    <span className="font-medium capitalize">{billingFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Billing Day</span>
                    <span>Day {billingDay} of billing period</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                    <span className="capitalize">{paymentMethodType === 'card' ? 'Credit/Debit Card' : 'ACH / Bank Account'}</span>
                  </div>
                  {hasPaymentDetails && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Payment details on file
                    </div>
                  )}
                </div>
              </Card>

              {/* First Payment */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    First Payment
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('firstPayment')}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Timing</span>
                    <span className="capitalize">
                      {firstPaymentTiming === 'now' ? 'Immediately' : `Scheduled: ${firstPaymentDate ? new Date(firstPaymentDate).toLocaleDateString() : 'Not set'}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Type</span>
                    <span className="capitalize">{firstPaymentAmount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium">First Payment Amount</span>
                    <span className="text-lg font-medium" style={{ color: 'var(--primaryColor)' }}>
                      {formatCurrency(calculateFirstPaymentAmount())}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Failed Payment Rules */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Failed Payment Policy
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('failedPayment')}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Retry Schedule</span>
                    <span>{retry1Days}, {retry2Days}, {retry3Days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Final Action</span>
                    <span className="capitalize">{finalAction.replace('-', ' ')}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email Notifications:</p>
                    <div className="space-y-1 text-sm ml-4">
                      {notifyClientSuccess && <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-600" /> Client - Successful payments</div>}
                      {notifyFirmSuccess && <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-600" /> Firm - Successful payments</div>}
                      {notifyClientFailure && <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-600" /> Client - Failed payments</div>}
                      {notifyFirmFailure && <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-600" /> Firm - Failed payments</div>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            {currentStep !== 'client' && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep !== 'review' ? (
              <Button
                onClick={handleNext}
                style={{ backgroundColor: 'var(--primaryColor)' }}
                className="gap-2 min-w-[150px]"
              >
                Continue
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--primaryColor)' }}
                className="gap-2 min-w-[200px]"
              >
                {isSubmitting ? 'Creating Subscription...' : 'Create Subscription'}
                {!isSubmitting && <Check className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Name Required Popup */}
      {showPlanNameRequiredPopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Require double-click outside to close
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-medium mb-2">Plan Name Required</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Please enter a name for this subscription plan before continuing.
              </p>
              <Button
                onClick={() => {
                  setShowPlanNameRequiredPopup(false);
                  setTimeout(() => {
                    planNameInputRef.current?.focus();
                  }, 100);
                }}
                style={{ backgroundColor: 'var(--primaryColor)' }}
                className="w-full h-12"
              >
                Got it
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
              <div>
                <h2 className="text-xl font-medium">Add Discount</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply a discount to this subscription</p>
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
    </div>
  );
}
