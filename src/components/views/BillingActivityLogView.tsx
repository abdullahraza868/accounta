import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardList, 
  ChevronRight, 
  Search, 
  Filter,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  User,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Activity,
  Zap,
  RefreshCcw,
  Bell,
  Eye,
  EyeOff,
  MousePointerClick,
  MailOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { comprehensiveBillingActivities } from '../../data/billingActivityMockData';

type ActivityType = 
  | 'email_sent' 
  | 'payment_attempt' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'status_change' 
  | 'retry_scheduled'
  | 'invoice_created'
  | 'subscription_created'
  | 'payment_method_updated';

type ActivityEvent = {
  id: string;
  timestamp: string;
  type: ActivityType;
  clientName: string;
  clientId: string;
  description: string;
  details: Record<string, any>;
  status: 'success' | 'failed' | 'pending' | 'warning';
  relatedEvents?: string[]; // IDs of related events
  category?: 'invoice' | 'subscription'; // Add category for filtering
  emailContent?: { // For email activities - show actual email
    subject: string;
    body: string;
  };
  tracking?: { // Tracking information
    // Email tracking
    emailOpened?: boolean;
    emailOpenedAt?: string;
    emailOpenCount?: number;
    emailBounced?: boolean;
    emailFailed?: boolean;
    // Invoice tracking
    invoiceViewed?: boolean;
    invoiceViewedAt?: string;
    invoiceViewCount?: number;
    invoiceLastViewedAt?: string;
    paymentPortalAccessed?: boolean;
    paymentPortalAccessedAt?: string;
    invoiceDownloaded?: boolean;
    invoiceDownloadedAt?: string;
  };
};

// Mock data for demonstration - expanded with more varied timestamps
const mockActivities: ActivityEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    type: 'email_sent',
    clientName: 'Acme Corp',
    clientId: 'client-001',
    description: 'Payment Reminder Day 7 email sent to client',
    details: {
      emailType: 'Day 7 Reminder',
      recipient: 'billing@acmecorp.com',
      subscription: 'SUB-12345',
      amount: '$1,250.00',
    },
    status: 'success',
    category: 'subscription',
    relatedEvents: ['2'],
    emailContent: {
      subject: 'Payment Reminder: Subscription #SUB-12345 - 7 Days Overdue',
      body: `Hello Acme Corp,

Your payment for Subscription #SUB-12345 remains outstanding and is now 7 days overdue.

Amount Due: $1,250.00
Due Date: ${new Date(Date.now() - 7 * 24 * 60 * 60000).toLocaleDateString()}

Please update your payment method or contact us if you have any questions.

Best regards,
Billing Team`,
    },
    tracking: {
      emailOpened: false, // NOT OPENED - IMPORTANT
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(), // 90 mins ago
    type: 'payment_failed',
    clientName: 'Acme Corp',
    clientId: 'client-001',
    description: 'Automatic payment retry failed',
    details: {
      amount: '$1,250.00',
      subscription: 'SUB-12345',
      reason: 'Insufficient funds',
      attemptNumber: 3,
      paymentMethod: 'Visa ending in 1234',
    },
    status: 'failed',
    category: 'subscription',
    relatedEvents: ['1'],
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    type: 'payment_success',
    clientName: 'Global Solutions LLC',
    clientId: 'client-003',
    description: 'Subscription payment processed successfully',
    details: {
      amount: '$499.00',
      subscription: 'SUB-11223',
      plan: 'Professional Plan',
      paymentMethod: 'Visa ending in 4242',
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
    type: 'status_change',
    clientName: 'TechStart Inc',
    clientId: 'client-002',
    description: 'Subscription status changed: Past Due → Overdue',
    details: {
      subscription: 'SUB-67890',
      previousStatus: 'Past Due',
      newStatus: 'Overdue',
      daysOverdue: 14,
      amount: '$750.00',
    },
    status: 'warning',
    category: 'subscription',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(), // Yesterday
    type: 'email_sent',
    clientName: 'Innovate Partners',
    clientId: 'client-004',
    description: 'Invoice Due Today reminder sent to client',
    details: {
      emailType: 'Due Today Reminder',
      recipient: 'finance@innovatepartners.com',
      invoice: 'INV-5678',
      amount: '$1,999.00',
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Payment Due Today: Invoice #INV-5678',
      body: `Hello Innovate Partners,

This is a friendly reminder that your invoice payment is due today.

Invoice #INV-5678
Amount Due: $1,999.00
Due Date: ${new Date().toLocaleDateString()}

Please submit payment to avoid any late fees.

Best regards,
Billing Team`,
    },
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60000).toISOString(), // Yesterday
    type: 'retry_scheduled',
    clientName: 'TechStart Inc',
    clientId: 'client-002',
    description: 'Automatic payment retry scheduled',
    details: {
      subscription: 'SUB-67890',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString(),
      scheduledTime: '10:00 AM EST',
      attemptNumber: 3,
      amount: '$750.00',
    },
    status: 'pending',
    category: 'subscription',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), // 2 days ago
    type: 'invoice_created',
    clientName: 'Digital Media Co',
    clientId: 'client-005',
    description: 'New invoice created and sent',
    details: {
      invoice: 'INV-9012',
      amount: '$750.00',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60000).toLocaleDateString(),
      items: 'Monthly Service Fee',
    },
    status: 'success',
    category: 'invoice',
    tracking: {
      invoiceViewed: true,
      invoiceViewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60000).toISOString(), // 1.5 days ago
      invoiceViewCount: 3,
      invoiceLastViewedAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(), // 4 hours ago
      paymentPortalAccessed: true,
      paymentPortalAccessedAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(), // 3 hours ago
      invoiceDownloaded: true,
      invoiceDownloadedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    },
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60000).toISOString(), // 2 days ago
    type: 'payment_method_updated',
    clientName: 'Global Solutions LLC',
    clientId: 'client-003',
    description: 'Client updated payment method',
    details: {
      previousMethod: 'Visa ending in 1234',
      newMethod: 'Visa ending in 4242',
      updatedBy: 'Client Portal',
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(), // 3 days ago
    type: 'payment_success',
    clientName: 'Innovate Partners',
    clientId: 'client-004',
    description: 'Invoice payment processed successfully',
    details: {
      amount: '$1,999.00',
      invoice: 'INV-5678',
      paymentMethod: 'Mastercard ending in 8888',
      transactionId: 'TXN-998877',
    },
    status: 'success',
    category: 'invoice',
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(), // 4 days ago
    type: 'subscription_created',
    clientName: 'StartupHub LLC',
    clientId: 'client-006',
    description: 'New subscription activated',
    details: {
      subscription: 'SUB-99887',
      plan: 'Enterprise Plan',
      amount: '$2,500.00',
      billingCycle: 'Monthly',
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(), // 5 days ago
    type: 'email_sent',
    clientName: 'Digital Media Co',
    clientId: 'client-005',
    description: 'Payment Reminder Day 14 email sent to client',
    details: {
      emailType: 'Day 14 Reminder',
      recipient: 'accounting@digitalmedia.com',
      subscription: 'SUB-44556',
      amount: '$899.00',
    },
    status: 'success',
    category: 'subscription',
    emailContent: {
      subject: 'Payment Reminder: Subscription #SUB-44556 - 14 Days Overdue',
      body: `Hello Digital Media Co,

Your payment for Subscription #SUB-44556 remains outstanding and is now 14 days overdue.

Amount Due: $899.00
Original Due Date: ${new Date(Date.now() - 19 * 24 * 60 * 60000).toLocaleDateString()}

Please update your payment method or contact us immediately.

Best regards,
Billing Team`,
    },
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60000).toISOString(), // 6 days ago
    type: 'email_sent',
    clientName: 'BuildRight Construction',
    clientId: 'client-007',
    description: 'Final Notice Day 30 email sent to client',
    details: {
      emailType: 'Day 30 Final Notice',
      recipient: 'billing@buildright.com',
      invoice: 'INV-7788',
      amount: '$3,250.00',
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Final Notice: Immediate Attention Required - Invoice #INV-7788',
      body: `Hello BuildRight Construction,

Your account requires immediate attention due to an outstanding payment that is now 30 days overdue.

Invoice #INV-7788
Amount Due: $3,250.00
Original Due Date: ${new Date(Date.now() - 36 * 24 * 60 * 60000).toLocaleDateString()}

Please contact us immediately to avoid service suspension.

Best regards,
Billing Team`,
    },
  },
];

type FilterPreset = 'all' | 'action_required' | 'payments' | 'communications' | 'documents' | 'system' | 'not_seen';
type CategoryFilter = 'all' | 'invoice' | 'subscription';

export function BillingActivityLogView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Use comprehensive mock data
  const mockActivities = comprehensiveBillingActivities;

  // Calculate summary stats
  const todayActivities = mockActivities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  const stats = {
    paymentsSucceeded: todayActivities.filter(a => a.type === 'payment_success').length,
    paymentsFailed: todayActivities.filter(a => a.type === 'payment_failed').length,
    emailsSent: todayActivities.filter(a => a.type === 'email_sent').length,
    actionRequired: mockActivities.filter(a => a.status === 'failed' || a.status === 'warning').length,
    totalRevenue: todayActivities
      .filter(a => a.type === 'payment_success')
      .reduce((sum, a) => {
        const amount = a.details.amount?.replace(/[$,]/g, '');
        return sum + (parseFloat(amount) || 0);
      }, 0),
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEvents(newExpanded);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'email_sent':
        return <Mail className="w-5 h-5" />;
      case 'payment_attempt':
      case 'payment_success':
      case 'payment_failed':
        return <CreditCard className="w-5 h-5" />;
      case 'status_change':
        return <AlertTriangle className="w-5 h-5" />;
      case 'retry_scheduled':
        return <Clock className="w-5 h-5" />;
      case 'invoice_created':
        return <FileText className="w-5 h-5" />;
      case 'subscription_created':
        return <DollarSign className="w-5 h-5" />;
      case 'payment_method_updated':
        return <User className="w-5 h-5" />;
      default:
        return <ClipboardList className="w-5 h-5" />;
    }
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'email_sent':
        return 'Email';
      case 'payment_attempt':
        return 'Payment Attempt';
      case 'payment_success':
        return 'Payment';
      case 'payment_failed':
        return 'Payment';
      case 'status_change':
        return 'Status Change';
      case 'retry_scheduled':
        return 'Retry Scheduled';
      case 'invoice_created':
        return 'Invoice';
      case 'subscription_created':
        return 'Subscription';
      case 'payment_method_updated':
        return 'Payment Method';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: ActivityType, status: string) => {
    // Override color based on status for critical items
    if (status === 'failed') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
      };
    }
    if (status === 'warning') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    }

    switch (type) {
      case 'email_sent':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'payment_success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          dot: 'bg-green-500',
        };
      case 'retry_scheduled':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
        };
      case 'invoice_created':
      case 'subscription_created':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'payment_method_updated':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          text: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          dot: 'bg-gray-400',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return null;
    }
  };

  const getFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format timestamp for timeline display
  const getTimelineTimestamp = (timestamp: string, groupKey: string) => {
    const date = new Date(timestamp);
    
    // For "Today" - show relative time
    if (groupKey === 'Today') {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hr ago`;
      }
    }
    
    // For all other days - show date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format tracking timestamp: 12/8/2025 | 2:30 PM
  const formatTrackingTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} | ${timeStr}`;
  };

  // Filter by preset
  const filterByPreset = (activities: ActivityEvent[]) => {
    switch (selectedPreset) {
      case 'action_required':
        return activities.filter(a => a.status === 'failed' || a.status === 'warning');
      case 'payments':
        return activities.filter(a => 
          a.type === 'payment_success' || 
          a.type === 'payment_failed' || 
          a.type === 'payment_attempt'
        );
      case 'communications':
        return activities.filter(a => a.type === 'email_sent');
      case 'documents':
        return activities.filter(a => 
          a.type === 'invoice_created' || 
          a.type === 'subscription_created'
        );
      case 'system':
        return activities.filter(a => 
          a.type === 'status_change' || 
          a.type === 'retry_scheduled' ||
          a.type === 'payment_method_updated'
        );
      case 'not_seen':
        return activities.filter(a => 
          (a.type === 'email_sent' && 
          a.tracking && 
          a.tracking.emailOpened === false) ||
          (a.type === 'invoice_created' && 
          a.tracking && 
          a.tracking.invoiceViewed === false)
        );
      default:
        return activities;
    }
  };

  // Filter by date range
  const filterByDateRange = (activities: ActivityEvent[]) => {
    const now = new Date();
    return activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / 86400000);
      
      switch (dateRange) {
        case 'today':
          return activityDate.toDateString() === now.toDateString();
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        default:
          return true;
      }
    });
  };

  // Filter by search
  const filterBySearch = (activities: ActivityEvent[]) => {
    if (!searchQuery) return activities;
    
    const query = searchQuery.toLowerCase();
    return activities.filter(a =>
      a.clientName.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      Object.values(a.details).some(v => 
        String(v).toLowerCase().includes(query)
      )
    );
  };

  // Filter by category
  const filterByCategory = (activities: ActivityEvent[]) => {
    if (categoryFilter === 'all') return activities;
    return activities.filter(a => a.category === categoryFilter);
  };

  // Apply all filters
  let filteredActivities = mockActivities;
  filteredActivities = filterByDateRange(filteredActivities);
  filteredActivities = filterByPreset(filteredActivities);
  filteredActivities = filterBySearch(filteredActivities);
  filteredActivities = filterByCategory(filteredActivities);

  // Group by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    let groupKey: string;
    if (date.toDateString() === now.toDateString()) {
      groupKey = 'Today';
    } else if (diffDays === 1) {
      groupKey = 'Yesterday';
    } else if (diffDays < 7) {
      groupKey = 'This Week';
    } else if (diffDays < 30) {
      groupKey = 'This Month';
    } else {
      groupKey = 'Older';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
    return groups;
  }, {} as Record<string, ActivityEvent[]>);

  // Ensure order: Today, Yesterday, This Week, This Month, Older
  const orderedGroups = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Scrollable Container - allows header and cards to scroll away */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with Breadcrumb - NOT STICKY */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
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
              Billing Activity Log
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Billing Activity Log
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                    v19
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time timeline of all billing events and activities
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {/* Category Filter - 2 Line Layout */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Line 1: Category Filter Pills - CENTERED */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setSelectedPreset('all');
                    }}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all ${
                      categoryFilter === 'all' && selectedPreset === 'all'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'all' && selectedPreset === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    All Billing
                  </button>
                  
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setSelectedPreset('action_required');
                    }}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      selectedPreset === 'action_required'
                        ? 'text-white'
                        : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                    }`}
                    style={selectedPreset === 'action_required' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    Action Required
                    {stats.actionRequired > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-[10px] font-bold">
                        {stats.actionRequired}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setCategoryFilter('invoice')}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      categoryFilter === 'invoice'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'invoice' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Invoices
                  </button>
                  
                  <button
                    onClick={() => setCategoryFilter('subscription')}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      categoryFilter === 'subscription'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'subscription' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                    Subscriptions
                  </button>
                </div>
              </div>

              {/* Line 2: Sleek Text Filter Menu - CENTERED */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setSelectedPreset('all')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'all'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('not_seen')}
                    className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                      selectedPreset === 'not_seen'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    Not Seen
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('payments')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'payments'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Payments
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('communications')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'communications'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Communications
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('documents')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'documents'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Documents
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('system')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'system'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No activities found matching your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPreset('all');
                    setSearchQuery('');
                    setDateRange('week');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {orderedGroups.map((groupKey) => {
                  const groupActivities = groupedActivities[groupKey];
                  if (!groupActivities || groupActivities.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      {/* Date Group Header - NOT STICKY */}
                      <div className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800">
                            <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                              {groupKey}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                        </div>
                      </div>

                      {/* Activities in this group */}
                      <div className="relative space-y-3 pl-8">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[1.125rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-transparent dark:from-purple-700 dark:via-blue-700" />

                        {groupActivities.map((activity, index) => {
                          const isExpanded = expandedEvents.has(activity.id);
                          const colors = getActivityColor(activity.type, activity.status);
                          const isActionRequired = activity.status === 'failed' || activity.status === 'warning';

                          return (
                            <div key={activity.id} className="relative">
                              {/* Timeline timestamp - on the left */}
                              <div className="absolute -left-[9.5rem] top-4 w-[8rem] text-right">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {getTimelineTimestamp(activity.timestamp, groupKey)}
                                </span>
                              </div>

                              {/* Timeline dot */}
                              <div className={`absolute -left-[1.4375rem] top-4 w-5 h-5 rounded-full border-4 border-gray-50 dark:border-gray-900 ${colors.dot} ${isActionRequired ? 'animate-pulse' : ''}`} />

                              {/* Activity Card */}
                              <div
                                className={`bg-white dark:bg-gray-800 border-2 ${colors.border} rounded-xl overflow-hidden transition-all ${
                                  isActionRequired ? 'shadow-lg' : 'hover:shadow-md'
                                }`}
                              >
                                {/* Card Header - Always Visible */}
                                <button
                                  onClick={() => toggleExpand(activity.id)}
                                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Icon with Label */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${colors.bg} ${colors.border} ${colors.text}`}>
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <span className={`text-[10px] font-medium ${colors.text}`}>
                                        {getActivityTypeLabel(activity.type)}
                                      </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3 mb-1">
                                        <div className="flex-1 min-w-0">
                                          {/* Client Name - Line 1 */}
                                          <h3 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/clients/${activity.clientId}`);
                                            }}
                                            className="font-bold text-base text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 hover:underline cursor-pointer"
                                          >
                                            {activity.clientName}
                                          </h3>
                                          {/* Description - Line 2 */}
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                            {activity.description}
                                          </p>
                                          {/* Key Details at First Level */}
                                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            {activity.details.amount && (
                                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {activity.details.amount}
                                              </span>
                                            )}
                                            {activity.details.invoice && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.details.invoice}
                                              </span>
                                            )}
                                            {activity.details.subscription && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.details.subscription}
                                              </span>
                                            )}
                                            {activity.details.plan && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.details.plan}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {getStatusBadge(activity.status)}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 flex-wrap mt-2">
                                        <span title={getFullTimestamp(activity.timestamp)}>
                                          {getTimelineTimestamp(activity.timestamp, groupKey)}
                                        </span>
                                        {activity.relatedEvents && activity.relatedEvents.length > 0 && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                              <Bell className="w-3 h-3" />
                                              Related event
                                            </span>
                                          </>
                                        )}
                                        {!isExpanded && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-purple-600 dark:text-purple-400 italic">
                                              Click for details
                                            </span>
                                          </>
                                        )}
                                        {/* TRACKING INFO - Positioned ~2/3 across */}
                                        <div className="flex-1" />
                                        
                                        {/* Email Tracking */}
                                        {activity.type === 'email_sent' && activity.tracking && (
                                          <>
                                            {activity.tracking.emailOpened === false ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title="Email has not been opened yet"
                                              >
                                                <EyeOff className="w-3 h-3" />
                                                <span className="uppercase">NOT OPENED</span>
                                              </span>
                                            ) : activity.tracking.emailOpened && activity.tracking.emailOpenedAt ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title={`Opened ${activity.tracking.emailOpenCount || 1} time(s)`}
                                              >
                                                <MailOpen className="w-3 h-3" />
                                                Opened: {formatTrackingTimestamp(activity.tracking.emailOpenedAt)}
                                              </span>
                                            ) : null}
                                            {activity.tracking.emailBounced && (
                                              <>
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1">
                                                  <XCircle className="w-3 h-3" />
                                                  <span className="uppercase">BOUNCED</span>
                                                </span>
                                              </>
                                            )}
                                          </>
                                        )}
                                        
                                        {/* Invoice Tracking */}
                                        {activity.type === 'invoice_created' && activity.tracking && (
                                          <>
                                            {activity.tracking.invoiceViewed === false ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title="Invoice has not been viewed yet"
                                              >
                                                <EyeOff className="w-3 h-3" />
                                                <span className="uppercase">NOT VIEWED</span>
                                              </span>
                                            ) : activity.tracking.invoiceViewed && activity.tracking.invoiceViewedAt ? (
                                              <>
                                                <span 
                                                  className="flex items-center gap-1"
                                                  title={`Viewed ${activity.tracking.invoiceViewCount || 1} time(s). Last viewed: ${activity.tracking.invoiceLastViewedAt ? formatTrackingTimestamp(activity.tracking.invoiceLastViewedAt) : 'N/A'}`}
                                                >
                                                  <Eye className="w-3 h-3" />
                                                  Viewed: {formatTrackingTimestamp(activity.tracking.invoiceViewedAt)}
                                                </span>
                                                {activity.tracking.invoiceDownloaded && activity.tracking.invoiceDownloadedAt && (
                                                  <>
                                                    <span className="text-gray-400">•</span>
                                                    <span 
                                                      className="flex items-center gap-1"
                                                      title={`Downloaded: ${formatTrackingTimestamp(activity.tracking.invoiceDownloadedAt)}`}
                                                    >
                                                      <Download className="w-3 h-3" />
                                                      Downloaded: {formatTrackingTimestamp(activity.tracking.invoiceDownloadedAt)}
                                                    </span>
                                                  </>
                                                )}
                                              </>
                                            ) : null}
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <div className="flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="mt-3 space-y-2">
                                      {Object.entries(activity.details).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3 text-sm">
                                          <span className="text-gray-500 dark:text-gray-500 capitalize min-w-[140px] font-medium">
                                            {key.replace(/_/g, ' ')}:
                                          </span>
                                          <span className="text-gray-900 dark:text-gray-100 flex-1">
                                            {value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Related Events */}
                                    {activity.relatedEvents && activity.relatedEvents.length > 0 && (
                                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                          <Bell className="w-3 h-3" />
                                          Related Events
                                        </div>
                                        <div className="space-y-1">
                                          {activity.relatedEvents.map(relatedId => {
                                            const relatedEvent = mockActivities.find(a => a.id === relatedId);
                                            if (!relatedEvent) return null;
                                            return (
                                              <button
                                                key={relatedId}
                                                onClick={() => toggleExpand(relatedId)}
                                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                              >
                                                → {relatedEvent.description}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Email Content */}
                                    {activity.emailContent && (
                                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          Email Content
                                        </div>
                                        <div className="space-y-1">
                                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            Subject: {activity.emailContent.subject}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {activity.emailContent.body}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}