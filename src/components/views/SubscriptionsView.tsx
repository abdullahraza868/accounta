import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Search,
  Download,
  Repeat,
  MoreVertical,
  Eye,
  Edit,
  Pause,
  Play,
  XCircle,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  GripVertical,
  Info,
  CircleSlash,
  Mail,
  Phone,
  User,
  Settings,
  RotateCcw,
  Sparkles,
  Shield,
  ChevronDown,
  BellOff,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { ClientCellDisplay } from '../ClientCellDisplay';
import { DateDisplayWithTooltip } from '../DateDisplayWithTooltip';
import { TablePaginationNav } from '../TablePaginationNav';
import { generateMockSubscriptions, generateMockInvoices } from '../../utils/mockAgingData';
import { calculateAgingSummary, getPaymentStatusColors } from '../../utils/agingCalculations';
import { AgingSummarySection } from '../AgingSummarySection';
import { AgingDataDebugView } from '../AgingDataDebugView';
import { SetFinalStatusDialog } from '../SetFinalStatusDialog';
import type { Subscription as AgingSubscription } from '../../types/billing';

type SubscriptionStatus = 'Active' | 'Pending First Invoice' | 'Paused' | 'Canceled' | 'Ended';
type Frequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
type ClientType = 'Business' | 'Individual';
type StatusFilter = 'all' | 'active' | 'pending_first_invoice' | 'paused' | 'canceled' | 'ended';
type PaymentMethod = 'ACH' | 'Credit Card' | 'Wire' | 'Check' | 'PayPal';
type AgingBucketFilter = 'all' | 'current' | '1-30' | '31-60' | '61-90' | '90+';
type PaymentStatusFilter = 'all' | 'current' | 'overdue' | 'failed' | 'retry_pending';

type Subscription = {
  id: string;
  client: string;
  clientId: string;
  clientType: ClientType;
  planName: string;
  amount: number;
  frequency: Frequency;
  nextPaymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  status: SubscriptionStatus;
  // Payment tracking fields
  paymentStatus?: 'Current' | 'Overdue' | 'Failed' | 'Pending Retry' | 'Past Due' | 'Payment Issue' | 'Payment Failed';
  daysOverdue?: number;
  failedAttempts?: number;
  lastPaymentAttempt?: string | null;
  nextRetryDate?: string | null;
  agingBucket?: 'Current' | '1-30' | '31-60' | '61-90' | '90+';
  // Customer contact info
  customerEmail?: string;
  customerPhone?: string;
  primaryContact?: string;
  // Final status tracking
  finalStatus?: string;
  finalStatusSetBy?: 'auto' | 'manual';
  finalStatusSetDate?: string;
  // Retry phase tracking for Payment Issue status (automatic payment retries)
  retryPhase?: {
    current: number;
    total: number;
    lastAttempt?: string;
    nextScheduled?: string;
  };
  // Reminder phase tracking for Past Due and Payment Failed statuses (email reminders)
  reminderPhase?: {
    current: number;
    total: number;
    lastSent?: string;
    nextScheduled?: string;
  };
  remindersSuspended?: boolean;
  suspensionNote?: string;
  suspendedAt?: string;
  suspendedBy?: string;
};

type StatCardType = 'mrr' | 'arr' | 'ytd' | 'pending';

type StatCardConfig = {
  id: StatCardType;
  label: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  getValue: (subscriptions: Subscription[]) => number;
  growthPercent?: number;
  secondaryAmount?: number; // For MTD on YTD card and Pending Yearly on Pending card
  secondaryLabel?: string;
};

type DraggableStatCardProps = {
  config: StatCardConfig;
  index: number;
  subscriptions: Subscription[];
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  formatCurrency: (amount: number) => string;
};

const DraggableStatCard = ({ config, index, subscriptions, moveCard, formatCurrency }: DraggableStatCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STAT_CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'STAT_CARD',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  const totalAmount = config.getValue(subscriptions);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn("relative", isDragging && "opacity-50")}
    >
      <div className="absolute top-2 left-2 text-gray-400 dark:text-gray-500 pointer-events-none z-10">
        <GripVertical className="w-4 h-4" />
      </div>
      <Card className={cn(
        "pl-8 border-gray-200/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-move",
        "py-2 pr-2 h-[65px] !gap-0 !flex-row"
      )}
      style={{ height: '65px' }}>
        <div className="flex items-center justify-between gap-2 h-full w-full">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 -ml-[3px]" style={{ backgroundColor: config.bgColor }}>
              {config.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight truncate">{config.label}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight whitespace-nowrap truncate">{config.count}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 mr-[8px]">
            <p className="text-[17px] text-gray-900 dark:text-gray-100 leading-none whitespace-nowrap mt-[1px]">{formatCurrency(totalAmount)}</p>
            <div className="flex items-center justify-end gap-1 mt-[8px] min-h-[12px]">
              {config.growthPercent !== undefined ? (
                <>
                  {config.growthPercent >= 0 ? (
                    <ArrowUp className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDown className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-[9px] leading-[12px] ${config.growthPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {Math.abs(config.growthPercent).toFixed(1)}% vs last year
                  </span>
                </>
              ) : config.secondaryAmount !== undefined ? (
                <span className="text-[9px] leading-[12px] text-gray-500 dark:text-gray-400">
                  {config.secondaryLabel}: {config.secondaryAmount}
                </span>
              ) : (
                <span className="text-[9px] leading-[12px] text-transparent">0.0% vs last year</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export function SubscriptionsView() {
  const navigate = useNavigate();
  const { formatDate } = useAppSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [agingBucketFilter, setAgingBucketFilter] = useState<AgingBucketFilter>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Set Final Status Dialog State
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [statusChangeNotes, setStatusChangeNotes] = useState('');

  // Suspend Reminders Dialog State
  const [suspendRemindersDialogOpen, setSuspendRemindersDialogOpen] = useState(false);
  const [subscriptionToSuspend, setSubscriptionToSuspend] = useState<Subscription | null>(null);
  const [suspendRemindersNote, setSuspendRemindersNote] = useState('');

  // Use aging-enabled mock subscription data
  const agingSubscriptions = generateMockSubscriptions();
  const agingInvoices = generateMockInvoices();
  
  // Calculate aging summary (requires both subscriptions and invoices)
  const agingSummary = calculateAgingSummary(agingSubscriptions, agingInvoices);
  
  // Convert aging subscriptions to match local Subscription type for existing display logic
  const subscriptions: Subscription[] = agingSubscriptions.map(sub => ({
    id: sub.id,
    client: sub.client,
    clientId: sub.clientId,
    clientType: sub.clientType,
    planName: sub.planName,
    amount: sub.amount,
    frequency: sub.frequency,
    nextPaymentDate: sub.nextPaymentDate,
    paymentMethod: sub.paymentMethod,
    status: sub.status,
    // Add payment tracking fields from aging data
    paymentStatus: sub.paymentStatus,
    daysOverdue: sub.daysOverdue,
    failedAttempts: sub.failedAttempts,
    lastPaymentAttempt: sub.lastPaymentAttempt,
    nextRetryDate: sub.nextRetryDate,
    agingBucket: sub.agingBucket,
    // Add customer contact info
    customerEmail: sub.customerEmail,
    customerPhone: sub.customerPhone,
    primaryContact: sub.primaryContact,
    // Add final status tracking fields
    finalStatus: sub.finalStatus,
    finalStatusSetBy: sub.finalStatusSetBy,
    finalStatusSetDate: sub.finalStatusSetDate,
    // Add reminder phase tracking
    reminderPhase: sub.reminderPhase,
    remindersSuspended: sub.remindersSuspended,
    suspensionNote: sub.suspensionNote,
    suspendedAt: sub.suspendedAt,
    suspendedBy: sub.suspendedBy,
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle suspending reminders
  const handleSuspendReminders = (subscriptionId: string, note: string) => {
    console.log('Suspending reminders for subscription:', subscriptionId, 'Note:', note);
    // In a real app, this would make an API call
  };

  // Calculate MRR (Monthly Recurring Revenue)
  const activeMRR = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => {
      const monthlyAmount = s.frequency === 'Monthly' ? s.amount :
                           s.frequency === 'Quarterly' ? s.amount / 3 :
                           s.frequency === 'Yearly' ? s.amount / 12 :
                           s.amount * 4.33; // weekly
      return sum + monthlyAmount;
    }, 0);

  // Calculate ARR (Annual Recurring Revenue)
  const activeARR = activeMRR * 12;

  // Calculate YTD revenue
  const ytdRevenue = activeMRR * 11; // Mock: 11 months so far

  // Pending subscriptions count
  const pendingCount = subscriptions.filter(s => s.status === 'Pending First Invoice').length;

  // Pending subscriptions - split by Monthly vs Yearly
  const pendingMonthly = subscriptions.filter(s => 
    s.status === 'Pending First Invoice' && s.frequency === 'Monthly'
  ).length;
  
  const pendingYearly = subscriptions.filter(s => 
    s.status === 'Pending First Invoice' && s.frequency === 'Yearly'
  ).length;

  // Stat Card Configurations
  const statCardConfigs: StatCardConfig[] = [
    {
      id: 'mrr',
      label: 'MRR',
      count: `${subscriptions.filter(s => s.status === 'Active').length} active subscriptions`,
      icon: <DollarSign className="w-[18px] h-[18px]" style={{ color: 'var(--primaryColor)' }} />,
      color: 'var(--primaryColor)',
      bgColor: 'rgba(124, 58, 237, 0.1)',
      getValue: () => activeMRR,
      growthPercent: 18.5
    },
    {
      id: 'arr',
      label: 'ARR',
      count: 'Annual Recurring Revenue',
      icon: <TrendingUp className="w-[18px] h-[18px] text-green-600" />,
      color: 'green',
      bgColor: 'rgb(240, 253, 244)',
      getValue: () => activeARR,
      growthPercent: 22.3
    },
    {
      id: 'ytd',
      label: 'YTD Revenue',
      count: `MTD: ${formatCurrency(activeMRR)}`,
      icon: <Calendar className="w-[18px] h-[18px] text-blue-600" />,
      color: 'blue',
      bgColor: 'rgb(239, 246, 255)',
      getValue: () => ytdRevenue,
      secondaryAmount: activeMRR,
      secondaryLabel: 'MTD'
    },
    {
      id: 'pending',
      label: 'Pending Monthly',
      count: `Pending Yearly: ${pendingYearly}`,
      icon: <Clock className="w-[18px] h-[18px] text-yellow-600" />,
      color: 'yellow',
      bgColor: 'rgb(254, 252, 232)',
      getValue: () => pendingMonthly,
      secondaryAmount: pendingYearly,
      secondaryLabel: 'Pending Yearly'
    }
  ];

  // State for stat card order - persisted to localStorage
  const [statCardOrder, setStatCardOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem('subscriptionsStatCardOrder');
    return saved ? JSON.parse(saved) : [0, 1, 2, 3];
  });

  // Function to move stat card
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const dragCard = statCardOrder[dragIndex];
    const newOrder = statCardOrder.filter((_, i) => i !== dragIndex).slice(0, hoverIndex).concat(dragCard).concat(statCardOrder.filter((_, i) => i !== dragIndex).slice(hoverIndex));
    setStatCardOrder(newOrder);
    localStorage.setItem('subscriptionsStatCardOrder', JSON.stringify(newOrder));
  };

  // Filtering logic
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch = 
      subscription.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      subscription.status.toLowerCase().replace(/ /g, '_') === statusFilter;

    const matchesFrequency = 
      frequencyFilter === 'all' || 
      subscription.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

  // Sorting logic
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" /> 
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn as keyof Subscription];
    let bValue: any = b[sortColumn as keyof Subscription];

    // Handle null values
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    // Convert to strings for comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Get status badge styling
  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-xs">
            Active
          </Badge>
        );
      case 'Pending First Invoice':
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 text-xs">
            Pending First Invoice
          </Badge>
        );
      case 'Paused':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs">
            Paused
          </Badge>
        );
      case 'Canceled':
        return (
          <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs">
            Canceled
          </Badge>
        );
      case 'Ended':
        return (
          <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs">
            Ended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs">
            {status}
          </Badge>
        );
    }
  };

  // Get payment status badge styling with tooltips
  const getPaymentStatusBadge = (
    subscription: Subscription
  ) => {
    const { paymentStatus, daysOverdue, failedAttempts, nextRetryDate, paymentMethod, finalStatus, finalStatusSetBy } = subscription;
    
    // If finalStatus exists, ONLY show that (completely replace payment status)
    if (finalStatus) {
      return (
        <div className="flex flex-col gap-1.5">
          <Badge
            className="text-xs font-medium flex items-center gap-1.5 w-fit"
            style={{
              backgroundColor: finalStatus === 'Suspended' 
                ? 'rgb(254 243 199)' // yellow-100
                : finalStatus === 'Canceled' 
                ? 'rgb(254 226 226)' // red-100
                : finalStatus === 'Collections'
                ? 'rgb(254 202 202)' // red-200
                : finalStatus === 'Write-off'
                ? 'rgb(229 231 235)' // gray-200
                : 'rgb(243 244 246)', // gray-100
              color: finalStatus === 'Suspended' 
                ? 'rgb(161 98 7)' // yellow-800
                : finalStatus === 'Canceled' 
                ? 'rgb(153 27 27)' // red-800
                : finalStatus === 'Collections'
                ? 'rgb(127 29 29)' // red-900
                : finalStatus === 'Write-off'
                ? 'rgb(55 65 81)' // gray-700
                : 'rgb(75 85 99)', // gray-600
              borderColor: finalStatus === 'Suspended' 
                ? 'rgb(251 191 36)' // yellow-400
                : finalStatus === 'Canceled' 
                ? 'rgb(248 113 113)' // red-400
                : finalStatus === 'Collections'
                ? 'rgb(239 68 68)' // red-500
                : finalStatus === 'Write-off'
                ? 'rgb(156 163 175)' // gray-400
                : 'rgb(209 213 219)', // gray-300
            }}
          >
            {finalStatusSetBy === 'auto' && (
              <Sparkles className="w-3 h-3 flex-shrink-0" />
            )}
            {finalStatus}
          </Badge>
          
          {/* Sub-status: Contact Customer for final statuses */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] text-red-700 dark:text-red-500 flex items-center gap-1 cursor-help font-medium">
                <AlertCircle className="w-3 h-3" />
                Contact Customer
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[350px] bg-red-900 dark:bg-red-950 text-white">
              <div className="text-xs space-y-2">
                <p className="font-semibold text-sm">⚠️ Final Status Set - Customer Contact Required</p>
                <p>Status: {finalStatus} (Set {finalStatusSetBy === 'auto' ? 'automatically' : 'manually'})</p>
                <div className="border-t border-red-700 dark:border-red-800 pt-2 mt-2">
                  <p className="font-semibold mb-1.5">Customer Contact Information:</p>
                  {subscription.primaryContact && (
                    <p className="flex items-center gap-1.5">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium">{subscription.primaryContact}</span>
                    </p>
                  )}
                  {subscription.customerEmail && (
                    <p className="flex items-center gap-1.5 mt-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <a 
                        href={`mailto:${subscription.customerEmail}`}
                        className="hover:underline text-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {subscription.customerEmail}
                      </a>
                    </p>
                  )}
                  {subscription.customerPhone && (
                    <p className="flex items-center gap-1.5 mt-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <a 
                        href={`tel:${subscription.customerPhone}`}
                        className="hover:underline text-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {subscription.customerPhone}
                      </a>
                    </p>
                  )}
                  {!subscription.primaryContact && !subscription.customerEmail && !subscription.customerPhone && (
                    <p className="text-yellow-200 italic">No contact information on file</p>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }
    
    if (!paymentStatus) {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 text-xs">
          —
        </Badge>
      );
    }

    // Show payment status with sub-statuses
    const colorInfo = getPaymentStatusColors(paymentStatus as any);
    const maxRetries = 3;
    
    // Build tooltip content based on status
    let tooltipContent = '';
    
    if (paymentStatus === 'Current') {
      tooltipContent = 'All payments up to date. No issues.';
    } else if (paymentStatus === 'Past Due') {
      // Past Due = no payment method on file OR manual payment expected (Yellow)
      if (!paymentMethod || paymentMethod === 'Wire' || paymentMethod === 'Check') {
        tooltipContent = `Payment is ${daysOverdue} days overdue. ${
          !paymentMethod 
            ? 'No payment method on file - cannot auto-charge.' 
            : `Manual payment method (${paymentMethod}) - awaiting client payment.`
        }`;
      } else {
        tooltipContent = `Payment is ${daysOverdue} days overdue. Payment method: ${paymentMethod}`;
      }
    } else if (paymentStatus === 'Payment Issue') {
      // Payment Issue = payment failed, actively retrying (Orange)
      const retriesRemaining = maxRetries - (failedAttempts || 0);
      tooltipContent = `Payment failed ${failedAttempts} time${failedAttempts === 1 ? '' : 's'}. ${retriesRemaining} ${retriesRemaining === 1 ? 'retry' : 'retries'} remaining.${nextRetryDate ? ` Next retry: ${formatDate(nextRetryDate)}` : ''}`;
    } else if (paymentStatus === 'Payment Failed') {
      // Payment Failed = all retries exhausted (Red)
      tooltipContent = `All ${maxRetries} payment attempts failed. Manual intervention required. Contact customer to update payment method. Last attempt: ${
        subscription.lastPaymentAttempt ? formatDate(subscription.lastPaymentAttempt) : 'Unknown'
      }`;
    } else if (paymentStatus === 'Suspended') {
      // Suspended = manually suspended due to non-payment
      tooltipContent = 'Subscription suspended due to non-payment. Customer service paused until payment is received.';
    } else if (paymentStatus === 'Canceled') {
      // Canceled = manually canceled due to non-payment
      tooltipContent = 'Subscription canceled due to non-payment. Customer would need to re-subscribe.';
    } else if (paymentStatus === 'In Collections') {
      // In Collections = sent to collections for debt recovery
      tooltipContent = 'Account sent to collections for debt recovery. Payment follow-up handled by collections team.';
    } else if (paymentStatus === 'Written Off') {
      // Written Off = bad debt written off for accounting purposes
      tooltipContent = 'Payment written off as bad debt for accounting purposes. No further collection attempts.';
    }
    
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Badge className={cn("text-xs cursor-help", colorInfo.badge)}>
                  {colorInfo.icon} {paymentStatus}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] bg-gray-900 dark:bg-gray-950 text-white">
              <p className="text-xs">{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Show retry info for "Payment Issue" status */}
        {/* Sub-status: Retry Phase for Payment Issue */}
        {paymentStatus === 'Payment Issue' && subscription.retryPhase && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-orange-700 dark:text-orange-400 font-medium">
              Retry {subscription.retryPhase.current}/{subscription.retryPhase.total}
            </span>
          </div>
        )}
        
        {/* Sub-status: Reminder Phase for Past Due and Payment Failed */}
        {(paymentStatus === 'Past Due' || paymentStatus === 'Payment Failed') && subscription.reminderPhase && !subscription.remindersSuspended && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              Sending Reminders {subscription.reminderPhase.current}/{subscription.reminderPhase.total}
            </span>
          </div>
        )}
        
        {/* Sub-status: Reminders Suspended for Past Due and Payment Failed */}
        {(paymentStatus === 'Past Due' || paymentStatus === 'Payment Failed') && subscription.remindersSuspended && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              Reminders Suspended
            </span>
          </div>
        )}
        


        
        {/* Show failure info for "Payment Failed" status */}
        {paymentStatus === 'Payment Failed' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] text-red-700 dark:text-red-500 flex items-center gap-1 cursor-help font-medium">
                <AlertCircle className="w-3 h-3" />
                Contact customer
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[350px] bg-red-900 dark:bg-red-950 text-white">
              <div className="text-xs space-y-2">
                <p className="font-semibold text-sm">⚠️ All Retries Exhausted</p>
                <p>{failedAttempts || maxRetries} consecutive payment failures</p>
                <div className="border-t border-red-700 dark:border-red-800 pt-2 mt-2">
                  <p className="font-semibold mb-1.5">Customer Contact Information:</p>
                  {subscription.primaryContact && (
                    <p className="flex items-center gap-1.5">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium">{subscription.primaryContact}</span>
                    </p>
                  )}
                  {subscription.customerEmail && (
                    <p className="flex items-center gap-1.5 mt-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <a 
                        href={`mailto:${subscription.customerEmail}`}
                        className="hover:underline text-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {subscription.customerEmail}
                      </a>
                    </p>
                  )}
                  {subscription.customerPhone && (
                    <p className="flex items-center gap-1.5 mt-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <a 
                        href={`tel:${subscription.customerPhone}`}
                        className="hover:underline text-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {subscription.customerPhone}
                      </a>
                    </p>
                  )}
                  {!subscription.primaryContact && !subscription.customerEmail && !subscription.customerPhone && (
                    <p className="text-yellow-200 italic">No contact information on file</p>
                  )}
                </div>
                <p className="text-[10px] text-red-200 mt-2">Click the payment status to set final action</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Final Status Display - shown below Payment Status badge */}
        {subscription.finalStatus && (
          <div className="flex items-center gap-1 mt-1">
            {subscription.finalStatusSetBy === 'auto' && (
              <Sparkles className="w-3 h-3 text-purple-500" />
            )}
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded border"
              style={{
                backgroundColor: subscription.finalStatus === 'Suspended' 
                  ? 'rgb(254 243 199)' // yellow-100
                  : subscription.finalStatus === 'Canceled' 
                  ? 'rgb(254 226 226)' // red-100
                  : subscription.finalStatus === 'In Collections'
                  ? 'rgb(254 202 202)' // red-200
                  : subscription.finalStatus === 'Written Off'
                  ? 'rgb(229 231 235)' // gray-200
                  : 'rgb(243 244 246)', // gray-100
                color: subscription.finalStatus === 'Suspended' 
                  ? 'rgb(161 98 7)' // yellow-800
                  : subscription.finalStatus === 'Canceled' 
                  ? 'rgb(153 27 27)' // red-800
                  : subscription.finalStatus === 'In Collections'
                  ? 'rgb(127 29 29)' // red-900
                  : subscription.finalStatus === 'Written Off'
                  ? 'rgb(55 65 81)' // gray-700
                  : 'rgb(75 85 99)', // gray-600
                borderColor: subscription.finalStatus === 'Suspended' 
                  ? 'rgb(251 191 36)' // yellow-400
                  : subscription.finalStatus === 'Canceled' 
                  ? 'rgb(248 113 113)' // red-400
                  : subscription.finalStatus === 'In Collections'
                  ? 'rgb(239 68 68)' // red-500
                  : subscription.finalStatus === 'Written Off'
                  ? 'rgb(156 163 175)' // gray-400
                  : 'rgb(209 213 219)', // gray-300
              }}
            >
              {subscription.finalStatus}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-[1800px] mx-auto">
          {/* Stats Cards - Draggable */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {statCardOrder.map((index) => (
              <DraggableStatCard
                key={index}
                config={statCardConfigs[index]}
                index={index}
                subscriptions={subscriptions}
                moveCard={moveCard}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger 
                  className="w-[180px] h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  style={
                    statusFilter !== 'all'
                      ? { borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }
                      : {}
                  }
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_first_invoice">Pending First Invoice</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              {/* Frequency Filter */}
              <Select
                value={frequencyFilter}
                onValueChange={(value) => {
                  setFrequencyFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger 
                  className="w-[150px] h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  style={
                    frequencyFilter !== 'all'
                      ? { borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }
                      : {}
                  }
                >
                  <SelectValue placeholder="All Frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Info className="w-4 h-4" />
                    Status Flow
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="payment-status-flow-description">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Info className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                      Payment Status Flow Chart
                    </DialogTitle>
                    <DialogDescription id="payment-status-flow-description">
                      Visual guide showing the progression of payment statuses from current to final resolution
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-8 py-6">
                    {/* Traffic Light Explanation */}
                    <div className="bg-gradient-to-r from-green-50 via-yellow-50 via-orange-50 to-red-50 dark:from-green-900/10 dark:via-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        🚦 Traffic Light System
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our payment status system follows a simple traffic light pattern: <span className="font-medium text-green-700 dark:text-green-400">Green</span> (all good) → <span className="font-medium text-yellow-700 dark:text-yellow-400">Yellow</span> (needs attention) → <span className="font-medium text-orange-700 dark:text-orange-400">Orange</span> (retrying) → <span className="font-medium text-red-700 dark:text-red-400">Red</span> (action required) → Final resolution status.
                      </p>
                    </div>

                    {/* Active Statuses */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Active/Warning Statuses</h3>
                      <div className="space-y-4">
                        {/* Current */}
                        <div className="flex items-start gap-4">
                          <div className="w-48 flex-shrink-0">
                            <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 text-sm px-3 py-1.5">
                              ✅ Current
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">All payments up to date</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">No action needed. Everything is running smoothly.</p>
                          </div>
                        </div>

                        {/* Arrow Down */}
                        <div className="pl-20">
                          <ArrowDown className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Past Due */}
                        <div className="flex items-start gap-4">
                          <div className="w-48 flex-shrink-0">
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 text-sm px-3 py-1.5">
                              ⏰ Past Due
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Payment overdue</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">No payment method on file OR manual payment (Wire/Check). Cannot auto-charge. Awaiting customer payment.</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">📧 Sub-status: Sending Reminders 1/3, 2/3, 3/3</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Actions: Can suspend reminders or wait until final reminder (day 30) to set final action</p>
                          </div>
                        </div>

                        {/* Arrow Down */}
                        <div className="pl-20">
                          <ArrowDown className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* In Dunning */}
                        <div className="flex items-start gap-4">
                          <div className="w-48 flex-shrink-0">
                            <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700 text-sm px-3 py-1.5">
                              🔄 Payment Issue
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Payment failed - Actively retrying</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">System is automatically retrying payment. Shows retry count and next retry date.</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">🔄 Sub-status: Retry 1/3, 2/3, 3/3</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Actions: System handles this automatically - no action needed yet</p>
                          </div>
                        </div>

                        {/* Arrow Down */}
                        <div className="pl-20">
                          <ArrowDown className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Payment Failed */}
                        <div className="flex items-start gap-4">
                          <div className="w-48 flex-shrink-0">
                            <Badge className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 text-sm px-3 py-1.5">
                              ❌ Payment Failed
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">All retries exhausted</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Manual intervention required. Contact customer to update payment method. This is where you decide next steps.</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">📧 Sub-status: Sending Reminders 1/3, 2/3, 3/3</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Actions: Can suspend reminders or wait until final reminder to set final action (Suspended, Canceled, Collections, Write-off)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-300 dark:border-gray-600"></div>

                    {/* Final Statuses */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Final/Closed Statuses (Manual)</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        After <span className="font-medium text-red-700 dark:text-red-400">Payment Failed</span> or <span className="font-medium text-yellow-700 dark:text-yellow-400">Past Due</span> reminders are exhausted (or suspended), you can set a final status:
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-4">⚠️ Sub-status: Contact Customer (shows customer contact info in tooltip)</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Suspended */}
                        <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10">
                          <Badge className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-400 dark:border-amber-600 text-sm px-3 py-1.5 mb-2">
                            ⏸️ Suspended
                          </Badge>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Service paused</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Customer service/access paused until payment received. Subscription can be reactivated when paid.
                          </p>
                        </div>

                        {/* Canceled */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/30 dark:bg-gray-800/30">
                          <Badge className="bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600 text-sm px-3 py-1.5 mb-2">
                            ⛔ Canceled
                          </Badge>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Subscription canceled</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Subscription permanently canceled due to non-payment. Customer would need to re-subscribe.
                          </p>
                        </div>

                        {/* In Collections */}
                        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/10">
                          <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border border-purple-400 dark:border-purple-600 text-sm px-3 py-1.5 mb-2">
                            📞 In Collections
                          </Badge>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Sent to collections</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Account sent to collections agency for debt recovery. Collections team handles follow-up.
                          </p>
                        </div>

                        {/* Written Off */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/30 dark:bg-slate-800/30">
                          <Badge className="bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 text-sm px-3 py-1.5 mb-2">
                            📝 Written Off
                          </Badge>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">Bad debt written off</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Debt written off for accounting purposes. No further collection attempts. Closes the loop for reporting.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Reference */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Quick Reference
                      </h4>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 ml-6 list-disc">
                        <li><span className="font-medium">Automatic Progression:</span> Current → Past Due (with reminders) → Payment Issue (with retries) → Payment Failed (with reminders)</li>
                        <li><span className="font-medium">Sub-statuses:</span> Each status shows progress (Reminders 1/3, Retry 2/3, etc.) to keep you informed</li>
                        <li><span className="font-medium">Manual Actions:</span> You can suspend reminders or set final action when reminders are exhausted</li>
                        <li><span className="font-medium">Final Statuses:</span> Suspended, Canceled, Collections, or Write-off - all show "Contact Customer" with info</li>
                        <li><span className="font-medium">Tracking:</span> All status changes tracked with date, user, and notes for complete audit trail</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button 
                size="sm" 
                className="gap-2" 
                style={{ backgroundColor: 'var(--primaryColor)' }}
                onClick={() => navigate('/subscriptions/create')}
              >
                <Repeat className="w-4 h-4" />
                New Subscription
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/subscription-settings')}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Billing Settings (Reminders & Retries)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mb-6">
            {/* Left Side: Title + Badge */}
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 dark:text-gray-100">Subscription List</h3>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                {filteredSubscriptions.length}
              </Badge>
            </div>
            
            {/* Right Side: Items Per Page */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentPage} of {Math.ceil(filteredSubscriptions.length / itemsPerPage) || 1}
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
                  <th className="px-6 py-4 pl-10 text-left text-xs uppercase tracking-wide text-white/90 w-[240px]">
                    <button 
                      onClick={() => handleSort('client')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Client{getSortIcon('client')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[180px]">
                    <button 
                      onClick={() => handleSort('planName')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Plan{getSortIcon('planName')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[120px]">
                    <button 
                      onClick={() => handleSort('amount')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Amount{getSortIcon('amount')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[120px]">
                    <button 
                      onClick={() => handleSort('frequency')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Frequency{getSortIcon('frequency')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[180px]">
                    <button 
                      onClick={() => handleSort('paymentStatus')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Payment Status{getSortIcon('paymentStatus')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[110px]">
                    <button 
                      onClick={() => handleSort('daysOverdue')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Days Overdue{getSortIcon('daysOverdue')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[140px]">
                    <button 
                      onClick={() => handleSort('nextPaymentDate')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Next Payment{getSortIcon('nextPaymentDate')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[140px]">
                    <button 
                      onClick={() => handleSort('status')} 
                      className="flex items-center hover:text-white transition-colors"
                    >
                      Sub Status{getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-white/90 w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {(() => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedSubscriptions = sortedSubscriptions.slice(startIndex, startIndex + itemsPerPage);
                  
                  return paginatedSubscriptions.map((subscription, index) => (
                    <tr 
                      key={subscription.id}
                      className={cn(
                        "hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors",
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/30 dark:bg-gray-800/50"
                      )}
                    >
                      {/* Client Name */}
                      <td className="px-6 py-4 pl-10">
                        <ClientCellDisplay
                          clientName={subscription.client}
                          clientId={subscription.clientId}
                          clientType={subscription.clientType}
                          onNameClick={() => console.log('View subscription:', subscription.id)}
                        />
                      </td>

                      {/* Plan Name */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {subscription.planName}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(subscription.amount)}
                        </div>
                      </td>

                      {/* Billing Cycle (Frequency) */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {subscription.frequency}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-4">
                        {getPaymentStatusBadge(subscription)}
                      </td>

                      {/* Days Overdue */}
                      <td className="px-4 py-4">
                        {subscription.daysOverdue !== undefined ? (
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {subscription.daysOverdue}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>

                      {/* Next Payment Date */}
                      <td className="px-4 py-4">
                        {subscription.nextPaymentDate ? (
                          <DateDisplayWithTooltip 
                            date={subscription.nextPaymentDate} 
                            time=""
                          />
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {getStatusBadge(subscription.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 pr-8">
                        <div className="flex justify-end items-center gap-2 ml-auto">
                          {/* Final Action Set Button - Only show when finalStatus exists */}
                          {subscription.finalStatus && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubscription(subscription);
                                setChangeStatusDialogOpen(true);
                              }}
                              className="h-8 px-3 text-xs gap-1.5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>Final Action Set</span>
                              <span className="text-[10px] opacity-70">•</span>
                              <span className="text-[10px]">Change</span>
                              <ChevronDown className="w-3 h-3 opacity-70" />
                            </Button>
                          )}
                          
                          {/* Set Final Action Button - Show when reminders exhausted OR suspended for Past Due or Payment Failed */}
                          {!subscription.finalStatus && 
                           (subscription.paymentStatus === 'Past Due' || subscription.paymentStatus === 'Payment Failed') && 
                           subscription.reminderPhase && 
                           (subscription.reminderPhase.current === subscription.reminderPhase.total || subscription.remindersSuspended) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubscription(subscription);
                                setChangeStatusDialogOpen(true);
                              }}
                              className="h-8 px-3 text-xs gap-1.5 border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                            >
                              <CircleSlash className="w-3.5 h-3.5" />
                              <span>Set Final Action</span>
                            </Button>
                          )}
                          
                          {/* Suspend Reminders Button - Show for Past Due or Payment Failed with active reminders that haven't exhausted */}
                          {!subscription.finalStatus &&
                           (subscription.paymentStatus === 'Past Due' || subscription.paymentStatus === 'Payment Failed') && 
                           subscription.reminderPhase && 
                           subscription.reminderPhase.current < subscription.reminderPhase.total &&
                           !subscription.remindersSuspended && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubscriptionToSuspend(subscription);
                                setSuspendRemindersDialogOpen(true);
                              }}
                              className="h-8 px-3 text-xs gap-1.5 border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <BellOff className="w-3.5 h-3.5" />
                              <span>Suspend Reminders</span>
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {subscription.status === 'Active' && (
                                <DropdownMenuItem>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {subscription.status === 'Paused' && (
                                <DropdownMenuItem>
                                  <Play className="w-4 h-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              {(subscription.status === 'Active' || subscription.status === 'Paused') && (
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Invoice History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            
            {/* Pagination - Inside Card */}
            <TablePaginationNav
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedSubscriptions.length}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>

        {/* Set Final Status Dialog */}
        <SetFinalStatusDialog
          open={changeStatusDialogOpen}
          onOpenChange={setChangeStatusDialogOpen}
          subscription={selectedSubscription}
          onConfirm={(status, notes) => {
            console.log('Final status set to:', status);
            console.log('Notes:', notes);
            console.log('Subscription:', selectedSubscription);
            // TODO: Implement actual status change logic with API call
            // This would update the subscription's paymentStatus, statusChangedDate, statusChangedBy, and statusChangeNotes
          }}
        />

        {/* Suspend Reminders Confirmation Dialog */}
        <Dialog open={suspendRemindersDialogOpen} onOpenChange={setSuspendRemindersDialogOpen}>
          <DialogContent className="sm:max-w-[500px]" aria-describedby="suspend-reminders-description">
            <DialogHeader>
              <DialogTitle>Suspend Reminders</DialogTitle>
              <DialogDescription id="suspend-reminders-description">
                Are you sure you want to suspend payment reminders for this subscription?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {subscriptionToSuspend && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {subscriptionToSuspend.client}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {subscriptionToSuspend.planName} • {formatCurrency(subscriptionToSuspend.amount)}/{subscriptionToSuspend.frequency}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="suspend-note">Reason for Suspension (Optional)</Label>
                <Textarea
                  id="suspend-note"
                  placeholder="e.g., Customer requested pause while resolving billing dispute..."
                  value={suspendRemindersNote}
                  onChange={(e) => setSuspendRemindersNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Payment reminders will be suspended indefinitely until manually reactivated. The subscription will remain active, but no automated reminder emails will be sent.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSuspendRemindersDialogOpen(false);
                  setSubscriptionToSuspend(null);
                  setSuspendRemindersNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log('Suspending reminders for:', subscriptionToSuspend?.id);
                  console.log('Note:', suspendRemindersNote);
                  // TODO: API call to suspend reminders
                  // This would update subscription.remindersSuspended = true,
                  // subscription.suspensionNote = note,
                  // subscription.suspendedAt = current date,
                  // subscription.suspendedBy = current admin user
                  setSuspendRemindersDialogOpen(false);
                  setSubscriptionToSuspend(null);
                  setSuspendRemindersNote('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Suspend Reminders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}