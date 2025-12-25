// Comprehensive billing activity log mock data covering all billing-related notification types
// from our 79-notification system

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
  relatedEvents?: string[];
  category?: 'invoice' | 'subscription';
  emailContent?: {
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

export const comprehensiveBillingActivities: ActivityEvent[] = [
  // ============ CLIENT PAYMENT NOTIFICATIONS ============
  {
    id: '1',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    type: 'payment_success',
    clientName: 'Acme Corp',
    clientId: 'client-001',
    description: 'Client payment received',
    details: {
      notificationType: 'client-payment-made',
      amount: '$2,500.00',
      invoice: 'INV-2025-001',
      paymentMethod: 'ACH',
      transactionId: 'TXN-887766',
    },
    status: 'success',
    category: 'invoice',
  },

  // ============ INVOICE NOTIFICATIONS (8 types from notification system) ============
  {
    id: '2',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    type: 'invoice_created',
    clientName: 'TechStart Inc',
    clientId: 'client-002',
    description: 'New invoice created',
    details: {
      notificationType: 'invoice-created',
      invoice: 'INV-2025-015',
      amount: '$8,500.00',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60000).toLocaleDateString(),
      items: 'Tax Preparation Services - Q4 2024',
    },
    status: 'success',
    category: 'invoice',
    tracking: {
      invoiceViewed: true,
      invoiceViewedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      invoiceViewCount: 2,
      invoiceLastViewedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      paymentPortalAccessed: false,
      invoiceDownloaded: false,
    },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Global Solutions LLC',
    clientId: 'client-003',
    description: 'Invoice sent to client',
    details: {
      notificationType: 'invoice-sent',
      emailType: 'Invoice Delivery',
      recipient: 'accounting@globalsolutions.com',
      invoice: 'INV-2024-007',
      amount: '$3,200.00',
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Invoice #INV-2024-007 from Your Accounting Firm',
      body: `Hello Global Solutions LLC,

Please find attached your invoice for services rendered.

Invoice #INV-2024-007
Amount Due: $3,200.00
Due Date: ${new Date(Date.now() + 15 * 24 * 60 * 60000).toLocaleDateString()}

Thank you for your business!`,
    },
    tracking: {
      emailOpened: true,
      emailOpenedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      emailOpenCount: 1,
      invoiceViewed: true,
      invoiceViewedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      invoiceViewCount: 1,
      paymentPortalAccessed: true,
      paymentPortalAccessedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      invoiceDownloaded: true,
      invoiceDownloadedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    type: 'status_change',
    clientName: 'Innovate Partners',
    clientId: 'client-004',
    description: 'Client viewed invoice',
    details: {
      notificationType: 'invoice-viewed',
      invoice: 'INV-2024-005',
      amount: '$1,750.00',
      viewedAt: new Date(Date.now() - 60 * 60000).toLocaleString(),
      ipAddress: '192.168.1.100',
    },
    status: 'success',
    category: 'invoice',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    type: 'payment_success',
    clientName: 'Digital Media Co',
    clientId: 'client-005',
    description: 'Invoice payment received',
    details: {
      notificationType: 'invoice-paid',
      invoice: 'INV-2025-001',
      amount: '$5,250.00',
      paymentMethod: 'Credit Card ending in 4242',
      transactionId: 'TXN-123456',
    },
    status: 'success',
    category: 'invoice',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    type: 'status_change',
    clientName: 'BuildRight Construction',
    clientId: 'client-007',
    description: 'Invoice status changed: Current → Overdue',
    details: {
      notificationType: 'invoice-overdue',
      invoice: 'INV-2024-001',
      amount: '$3,250.00',
      daysOverdue: 5,
      originalDueDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'warning',
    category: 'invoice',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    type: 'payment_failed',
    clientName: 'StartupHub LLC',
    clientId: 'client-006',
    description: 'Invoice payment attempt failed',
    details: {
      notificationType: 'invoice-payment-failed',
      invoice: 'INV-2024-012',
      amount: '$2,100.00',
      reason: 'Card declined - Insufficient funds',
      paymentMethod: 'Visa ending in 1234',
      attemptNumber: 1,
    },
    status: 'failed',
    category: 'invoice',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Metro Manufacturing',
    clientId: 'client-008',
    description: 'Payment Reminder Day 7 email sent to client',
    details: {
      notificationType: 'invoice-reminder-sent',
      emailType: 'Day 7 Reminder',
      recipient: 'billing@metromanufacturing.com',
      invoice: 'INV-2024-002',
      amount: '$4,500.00',
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Payment Reminder: Invoice #INV-2024-002 - 7 Days Overdue',
      body: `Hello Metro Manufacturing,

Your payment for Invoice #INV-2024-002 remains outstanding and is now 7 days overdue.

Amount Due: $4,500.00
Original Due Date: ${new Date(Date.now() - 7 * 24 * 60 * 60000).toLocaleDateString()}

Please submit payment as soon as possible.

Best regards,
Billing Team`,
    },
    tracking: {
      emailOpened: false,
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    type: 'status_change',
    clientName: 'Creative Studios',
    clientId: 'client-009',
    description: 'Client disputed invoice',
    details: {
      notificationType: 'invoice-disputed',
      invoice: 'INV-2024-008',
      amount: '$3,750.00',
      disputeReason: 'Services not rendered as agreed',
      disputedBy: 'John Smith',
      disputeDate: new Date(Date.now() - 5 * 60 * 60000).toLocaleDateString(),
    },
    status: 'warning',
    category: 'invoice',
  },

  // ============ SUBSCRIPTION NOTIFICATIONS (5 types from notification system) ============
  {
    id: '10',
    timestamp: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Tech Solutions Inc',
    clientId: 'client-010',
    description: 'Subscription renewal reminder sent',
    details: {
      notificationType: 'subscription-renewal-upcoming',
      emailType: 'Renewal Reminder',
      subscription: 'SUB-2024-015',
      renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString(),
      amount: '$999.00',
      plan: 'Professional Plan',
    },
    status: 'success',
    category: 'subscription',
    emailContent: {
      subject: 'Your subscription renews in 3 days',
      body: `Hello Tech Solutions Inc,

Your Professional Plan subscription renews in 3 days.

Subscription: SUB-2024-015
Renewal Date: ${new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString()}
Amount: $999.00

Your card on file will be charged automatically.`,
    },
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
    type: 'payment_success',
    clientName: 'Acme Corp',
    clientId: 'client-001',
    description: 'Subscription renewed successfully',
    details: {
      notificationType: 'subscription-renewed',
      subscription: 'SUB-2024-001',
      plan: 'Monthly Bookkeeping',
      amount: '$500.00',
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60000).toLocaleDateString(),
      paymentMethod: 'Visa ending in 4242',
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60000).toISOString(),
    type: 'payment_failed',
    clientName: 'Digital Media Co',
    clientId: 'client-005',
    description: 'Subscription payment failed',
    details: {
      notificationType: 'subscription-payment-failed',
      subscription: 'SUB-2024-015',
      amount: '$750.00',
      reason: 'Card expired',
      paymentMethod: 'Mastercard ending in 8888',
      attemptNumber: 1,
    },
    status: 'failed',
    category: 'subscription',
  },
  {
    id: '13',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    type: 'status_change',
    clientName: 'Global Industries',
    clientId: 'client-011',
    description: 'Client cancelled subscription',
    details: {
      notificationType: 'subscription-cancelled',
      subscription: 'SUB-2024-022',
      plan: 'Basic Plan',
      cancelledBy: 'Client Portal',
      cancelDate: new Date(Date.now() - 2 * 24 * 60 * 60000).toLocaleDateString(),
      finalBillingDate: new Date(Date.now() + 28 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'warning',
    category: 'subscription',
  },
  {
    id: '14',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60000).toISOString(),
    type: 'subscription_created',
    clientName: 'Global Industries',
    clientId: 'client-011',
    description: 'Client upgraded subscription',
    details: {
      notificationType: 'subscription-upgraded',
      subscription: 'SUB-2024-022',
      previousPlan: 'Basic Plan ($299/mo)',
      newPlan: 'Premium Plan ($1,200/mo)',
      effectiveDate: new Date(Date.now() - 2.5 * 24 * 60 * 60000).toLocaleDateString(),
      proratedCredit: '$150.00',
    },
    status: 'success',
    category: 'subscription',
  },

  // ============ PAYMENT RETRY & DUNNING (Day 7, 14, 30) ============
  {
    id: '15',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Acme Corp',
    clientId: 'client-001',
    description: 'Payment Reminder Day 7 email sent to client',
    details: {
      emailType: 'Day 7 Reminder',
      recipient: 'billing@acmecorp.com',
      subscription: 'SUB-12345',
      amount: '$1,250.00',
      daysOverdue: 7,
    },
    status: 'success',
    category: 'subscription',
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
      emailOpened: false,
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '16',
    timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60000).toISOString(),
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
      nextRetryDate: new Date(Date.now() + 2 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'failed',
    category: 'subscription',
    relatedEvents: ['15'],
  },
  {
    id: '17',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'TechStart Inc',
    clientId: 'client-002',
    description: 'Payment Reminder Day 14 email sent to client',
    details: {
      emailType: 'Day 14 Reminder',
      recipient: 'finance@techstart.com',
      subscription: 'SUB-67890',
      amount: '$750.00',
      daysOverdue: 14,
    },
    status: 'success',
    category: 'subscription',
    emailContent: {
      subject: 'Payment Reminder: Subscription #SUB-67890 - 14 Days Overdue',
      body: `Hello TechStart Inc,

Your payment for Subscription #SUB-67890 remains outstanding and is now 14 days overdue.

Amount Due: $750.00
Original Due Date: ${new Date(Date.now() - 14 * 24 * 60 * 60000).toLocaleDateString()}

Please update your payment method or contact us immediately.

Best regards,
Billing Team`,
    },
    tracking: {
      emailOpened: true,
      emailOpenedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60000).toISOString(),
      emailOpenCount: 2,
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '18',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'BuildRight Construction',
    clientId: 'client-007',
    description: 'Final Notice Day 30 email sent to client',
    details: {
      emailType: 'Day 30 Final Notice',
      recipient: 'billing@buildright.com',
      invoice: 'INV-7788',
      amount: '$3,250.00',
      daysOverdue: 30,
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Final Notice: Immediate Attention Required - Invoice #INV-7788',
      body: `Hello BuildRight Construction,

Your account requires immediate attention due to an outstanding payment that is now 30 days overdue.

Invoice #INV-7788
Amount Due: $3,250.00
Original Due Date: ${new Date(Date.now() - 30 * 24 * 60 * 60000).toLocaleDateString()}

Please contact us immediately to avoid service suspension.

Best regards,
Billing Team`,
    },
  },

  // ============ INVOICE DUE TODAY & DUE SOON REMINDERS ============
  {
    id: '19',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Innovate Partners',
    clientId: 'client-004',
    description: 'Invoice Due Today reminder sent to client',
    details: {
      emailType: 'Due Today Reminder',
      recipient: 'finance@innovatepartners.com',
      invoice: 'INV-5678',
      amount: '$1,999.00',
      dueDate: 'Today',
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
    tracking: {
      emailOpened: false,
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '20',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    type: 'email_sent',
    clientName: 'Creative Studios',
    clientId: 'client-009',
    description: 'Invoice Due Soon reminder sent to client',
    details: {
      emailType: 'Due in 3 Days',
      recipient: 'accounting@creativestudios.com',
      invoice: 'INV-9988',
      amount: '$2,750.00',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'success',
    category: 'invoice',
    emailContent: {
      subject: 'Reminder: Invoice #INV-9988 Due in 3 Days',
      body: `Hello Creative Studios,

This is a friendly reminder that your invoice payment is due soon.

Invoice #INV-9988
Amount Due: $2,750.00
Due Date: ${new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString()}

Please ensure payment is submitted on time.

Best regards,
Billing Team`,
    },
    tracking: {
      emailOpened: true,
      emailOpenedAt: new Date(Date.now() - 6.5 * 24 * 60 * 60000).toISOString(),
      emailOpenCount: 1,
      emailBounced: false,
      emailFailed: false,
    },
  },

  // ============ PAYMENT METHOD & STATUS CHANGES ============
  {
    id: '21',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60000).toISOString(),
    type: 'payment_method_updated',
    clientName: 'Global Solutions LLC',
    clientId: 'client-003',
    description: 'Client updated payment method',
    details: {
      previousMethod: 'Visa ending in 1234',
      newMethod: 'Visa ending in 4242',
      updatedBy: 'Client Portal',
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60000).toLocaleString(),
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '22',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60000).toISOString(),
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
    id: '23',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    type: 'retry_scheduled',
    clientName: 'Digital Media Co',
    clientId: 'client-005',
    description: 'Automatic payment retry scheduled',
    details: {
      subscription: 'SUB-44556',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60000).toLocaleDateString(),
      scheduledTime: '10:00 AM EST',
      attemptNumber: 3,
      amount: '$899.00',
    },
    status: 'pending',
    category: 'subscription',
  },

  // ============ CLIENT-INITIATED ACTIONS ============
  {
    id: '24',
    timestamp: new Date(Date.now() - 11 * 24 * 60 * 60000).toISOString(),
    type: 'subscription_created',
    clientName: 'Metro Manufacturing',
    clientId: 'client-008',
    description: 'Client changed subscription plan',
    details: {
      notificationType: 'client-subscription-changed',
      subscription: 'SUB-8877',
      previousPlan: 'Basic Plan',
      newPlan: 'Premium Plan',
      effectiveDate: new Date(Date.now() - 11 * 24 * 60 * 60000).toLocaleDateString(),
      initiatedBy: 'Client Portal',
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '25',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60000).toISOString(),
    type: 'payment_success',
    clientName: 'StartupHub LLC',
    clientId: 'client-006',
    description: 'Subscription payment processed successfully',
    details: {
      amount: '$2,500.00',
      subscription: 'SUB-99887',
      plan: 'Enterprise Plan',
      paymentMethod: 'ACH',
      transactionId: 'TXN-554433',
    },
    status: 'success',
    category: 'subscription',
  },
  {
    id: '26',
    timestamp: new Date(Date.now() - 13 * 24 * 60 * 60000).toISOString(),
    type: 'invoice_created',
    clientName: 'Creative Studios',
    clientId: 'client-009',
    description: 'New invoice created and sent',
    details: {
      invoice: 'INV-9012',
      amount: '$750.00',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60000).toLocaleDateString(),
      items: 'Monthly Accounting Services',
      createdBy: 'Admin User',
    },
    status: 'success',
    category: 'invoice',
    tracking: {
      invoiceViewed: false,
      invoiceDownloaded: false,
    },
  },
];