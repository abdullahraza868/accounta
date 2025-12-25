// Billing & Subscriptions Types
// Centralized type definitions for billing, subscriptions, invoices, and aging

// ============================================================================
// AGING & PAYMENT STATUS TYPES
// ============================================================================

export type PaymentStatus = 
  // Active/Warning Statuses
  | 'Current' 
  | 'Past Due' 
  | 'Payment Issue'
  | 'Payment Failed' 
  // Final/Closed Statuses (Manual)
  | 'Suspended'
  | 'Canceled' 
  | 'In Collections'
  | 'Written Off';

export type AgingBucket = 'Current' | '1-30' | '31-60' | '61-90' | '90+';
export type FinalAction = 'pause' | 'cancel' | 'keep-active';

// ============================================================================
// PAYMENT RETRY CONFIGURATION
// ============================================================================

export type PaymentRetryPolicy = {
  retry1Days: number;
  retry2Days: number;
  retry3Days: number;
  finalAction: FinalAction;
};

export type AmountBasedRetryPolicy = PaymentRetryPolicy & {
  threshold: number; // Minimum subscription amount for this policy to apply
};

export type PaymentRetrySettings = {
  enabled: boolean;
  defaultPolicy: PaymentRetryPolicy;
  
  // OPTIONAL: Amount-based overrides
  // e.g., subscriptions >= $1000 get more aggressive retry schedule
  amountBasedPolicies: AmountBasedRetryPolicy[];
  
  // Admin notifications
  notifyAdminAfterAttempts: number; // e.g., notify after 3 failed attempts
  notifyAdminEmails: string[];
};

// ============================================================================
// PAYMENT ATTEMPT TRACKING
// ============================================================================

export type PaymentAttempt = {
  attemptDate: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  failureReason?: string;
  transactionId?: string;
  retryNumber?: number; // 0 = initial attempt, 1 = first retry, etc.
};

// ============================================================================
// ENHANCED SUBSCRIPTION TYPE
// ============================================================================

export type SubscriptionStatus = 'Active' | 'Pending First Invoice' | 'Paused' | 'Canceled' | 'Ended';
export type Frequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type PaymentMethodType = 'ACH' | 'Credit Card' | 'Wire' | 'Check' | 'PayPal';

export type Subscription = {
  // Basic Information
  id: string;
  client: string;
  clientId: string;
  clientType: 'Business' | 'Individual';
  planName: string;
  amount: number;
  frequency: Frequency;
  status: SubscriptionStatus;
  
  // Payment Information
  paymentMethod: PaymentMethodType | null;
  nextPaymentDate: string | null;
  
  // NEW: Payment Status & Aging
  paymentStatus: PaymentStatus;
  lastSuccessfulPayment: string | null;
  lastPaymentAttempt: string | null;
  failedAttempts: number;
  nextRetryDate: string | null;
  daysOverdue: number;
  agingBucket: AgingBucket;
  overdueAmount: number;
  
  // NEW: Status Change Tracking (for final statuses)
  statusChangedDate?: string | null; // When status was manually changed to Suspended/Canceled/etc
  statusChangedBy?: string | null; // Admin who changed the status
  statusChangeNotes?: string | null; // Optional notes about why status was changed
  
  // NEW: Reminder Phase Tracking
  reminderPhase?: {
    current: number; // e.g., 1, 2, or 3
    total: number;    // e.g., 3
    lastSent?: string;
    nextScheduled?: string;
  };
  remindersSuspended?: boolean;
  suspensionNote?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  
  // NEW: Payment History
  paymentHistory: PaymentAttempt[];
  
  // NEW: Custom Retry Policy (overrides global settings)
  customRetryPolicy?: {
    enabled: boolean;
    policy: PaymentRetryPolicy;
  };
  
  // Notification Preferences
  notifications?: {
    clientSuccess: boolean;
    firmSuccess: boolean;
    clientFailure: boolean;
    firmFailure: boolean;
  };
  
  // Customer Contact Information
  primaryContact?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

// ============================================================================
// ENHANCED INVOICE TYPE
// ============================================================================

export type InvoiceStatus = 'Paid' | 'Draft' | 'Overdue' | 'Sent to Client';

export type Invoice = {
  // Basic Information
  id: string;
  client: string;
  clientId: string;
  clientType: 'Business' | 'Individual';
  invoiceNo: string;
  created: string;
  createdTime: string;
  sentOn: string;
  sentTime: string;
  year: number;
  amountDue: number;
  status: InvoiceStatus;
  dueDate: string;
  
  // Payment Information
  paidAt?: string;
  paidTime?: string;
  paidVia?: PaymentMethodType;
  
  // NEW: Aging Fields
  daysOverdue: number;
  agingBucket: AgingBucket;
  paymentStatus: PaymentStatus;
  lastReminderSent?: string;
  reminderCount: number;
};

// ============================================================================
// AGING REPORT TYPES
// ============================================================================

export type AgingReportGrouping = 'customer' | 'aging-bucket';
export type AgingReportSortBy = 'days-overdue' | 'amount' | 'customer-name';

export type AgingReportItem = {
  type: 'subscription' | 'invoice';
  id: string;
  description: string; // Plan name or Invoice number
  daysOverdue: number;
  amount: number;
  agingBucket: AgingBucket;
};

export type AgingReportCustomer = {
  customerId: string;
  customerName: string;
  customerType: 'Business' | 'Individual';
  email?: string;
  phone?: string;
  items: AgingReportItem[];
  totalOverdue: number;
};

export type AgingReportSummary = {
  current: { count: number; amount: number };
  bucket_1_30: { count: number; amount: number };
  bucket_31_60: { count: number; amount: number };
  bucket_61_90: { count: number; amount: number };
  bucket_90_plus: { count: number; amount: number };
  totalAccountsReceivable: number;
  totalOverdue: number;
  overduePercentage: number;
};

export type AgingReport = {
  generatedDate: string;
  generatedTime: string;
  includeInvoices: boolean;
  includeSubscriptions: boolean;
  groupBy: AgingReportGrouping;
  sortBy: AgingReportSortBy;
  showOnlyOverdue: boolean;
  includeContactInfo: boolean;
  customers: AgingReportCustomer[];
  summary: AgingReportSummary;
};

// ============================================================================
// AGING STAT CARD CONFIGURATION
// ============================================================================

export type AgingStatCardType = 'current' | '1-30' | '31-60' | '61-90' | '90+';

export type AgingStatCard = {
  id: AgingStatCardType;
  label: string;
  bucket: AgingBucket;
  icon: string; // Emoji
  color: string;
  bgColor: string;
};