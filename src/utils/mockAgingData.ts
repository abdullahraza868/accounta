// Mock Aging Data Generator
// Generates realistic mock data for subscriptions and invoices with aging calculations

import type { Subscription, Invoice } from '../types/billing';
import { 
  calculateDaysOverdue, 
  getAgingBucket, 
  getPaymentStatus,
  enrichSubscriptionWithAging,
  enrichInvoiceWithAging
} from './agingCalculations';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a date X days ago from today
 */
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Get a date X days in the future from today
 */
function getDaysAhead(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// ============================================================================
// MOCK SUBSCRIPTIONS WITH AGING DATA
// ============================================================================

export function generateMockSubscriptions(): Subscription[] {
  const baseSubscriptions: Partial<Subscription>[] = [
    // CURRENT - No issues
    {
      id: '1',
      client: 'Tech Innovations Inc.',
      clientId: '101',
      clientType: 'Business',
      planName: 'Monthly Bookkeeping',
      amount: 750,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAhead(15), // Due in 15 days
      paymentMethod: 'ACH',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(15),
      lastPaymentAttempt: getDaysAgo(15),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: [
        {
          attemptDate: getDaysAgo(15),
          amount: 750,
          status: 'Success',
          transactionId: 'TXN-001',
          retryNumber: 0
        }
      ]
    },
    
    // CURRENT - No issues
    {
      id: '2',
      client: 'ABC Holdings',
      clientId: '102',
      clientType: 'Business',
      planName: 'Tax Prep & Advisory',
      amount: 5000,
      frequency: 'Yearly',
      nextPaymentDate: getDaysAhead(45), // Due in 45 days
      paymentMethod: 'Credit Card',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(320),
      lastPaymentAttempt: getDaysAgo(320),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: []
    },
    
    // 1-30 DAYS OVERDUE - Past Due
    {
      id: '3',
      client: 'Acme Corporation',
      clientId: '103',
      clientType: 'Business',
      planName: 'Monthly Bookkeeping',
      amount: 750,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(15), // 15 days overdue
      paymentMethod: 'ACH',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(45),
      lastPaymentAttempt: getDaysAgo(15),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: [],
      // Reminder Phase - Day 14 (2nd reminder)
      reminderPhase: {
        current: 2,
        total: 3,
        lastSent: getDaysAgo(1),
        nextScheduled: getDaysAhead(16) // Day 30 reminder
      }
    },
    
    // 1-30 DAYS OVERDUE - Payment Failed, In Dunning
    {
      id: '4',
      client: 'TechStart Inc',
      clientId: '104',
      clientType: 'Business',
      planName: 'CFO Services',
      amount: 3000,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(8), // 8 days overdue
      paymentMethod: 'Credit Card',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(38),
      lastPaymentAttempt: getDaysAgo(5), // First retry attempted 5 days ago
      failedAttempts: 1,
      nextRetryDate: getDaysAhead(3), // Next retry in 3 days
      paymentHistory: [
        {
          attemptDate: getDaysAgo(8),
          amount: 3000,
          status: 'Failed',
          failureReason: 'Insufficient funds',
          retryNumber: 0
        },
        {
          attemptDate: getDaysAgo(5),
          amount: 3000,
          status: 'Failed',
          failureReason: 'Card declined',
          retryNumber: 1
        }
      ],
      // Retry Phase - Currently in Payment Issue status (automatic payment retries)
      retryPhase: {
        current: 2,
        total: 3,
        lastAttempt: getDaysAgo(5),
        nextScheduled: getDaysAhead(3)
      }
    },
    
    // 1-30 DAYS OVERDUE
    {
      id: '5',
      client: 'Global Solutions',
      clientId: '105',
      clientType: 'Business',
      planName: 'Quarterly Financial Review',
      amount: 2500,
      frequency: 'Quarterly',
      nextPaymentDate: getDaysAgo(22), // 22 days overdue
      paymentMethod: 'Wire',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(112),
      lastPaymentAttempt: getDaysAgo(22),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: [],
      // Reminder Phase - Day 30 (3rd/final reminder) - SUSPENDED
      reminderPhase: {
        current: 3,
        total: 3,
        lastSent: getDaysAgo(8),
        nextScheduled: null
      },
      remindersSuspended: true,
      suspensionNote: 'Customer requested pause while resolving internal billing dispute',
      suspendedAt: getDaysAgo(3),
      suspendedBy: 'Admin User'
    },
    
    // 31-60 DAYS OVERDUE - Payment Failed with Auto-Set Final Status (Suspended)
    {
      id: '6',
      client: 'Martinez Consulting',
      clientId: '106',
      clientType: 'Business',
      planName: 'Monthly Accounting',
      amount: 1200,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(45), // 45 days overdue
      paymentMethod: 'ACH',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(75),
      lastPaymentAttempt: getDaysAgo(30), // Last retry 30 days ago
      failedAttempts: 3,
      nextRetryDate: null, // All retries exhausted
      primaryContact: 'Carlos Martinez',
      customerEmail: 'carlos@martinezconsulting.com',
      customerPhone: '(555) 123-4567',
      finalStatus: 'Suspended', // Auto-set by payment retry strategy
      finalStatusSetBy: 'auto' as const,
      finalStatusSetDate: getDaysAgo(30),
      paymentHistory: [
        {
          attemptDate: getDaysAgo(45),
          amount: 1200,
          status: 'Failed',
          failureReason: 'Account closed',
          retryNumber: 0
        },
        {
          attemptDate: getDaysAgo(42),
          amount: 1200,
          status: 'Failed',
          failureReason: 'Account closed',
          retryNumber: 1
        },
        {
          attemptDate: getDaysAgo(37),
          amount: 1200,
          status: 'Failed',
          failureReason: 'Account closed',
          retryNumber: 2
        },
        {
          attemptDate: getDaysAgo(30),
          amount: 1200,
          status: 'Failed',
          failureReason: 'Account closed',
          retryNumber: 3
        }
      ]
    },
    
    // 61-90 DAYS OVERDUE - Past Due with reminders
    {
      id: '7',
      client: 'John Smith',
      clientId: '107',
      clientType: 'Individual',
      planName: 'Personal Tax Prep',
      amount: 500,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(62), // 62 days overdue
      paymentMethod: 'Credit Card',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(92),
      lastPaymentAttempt: getDaysAgo(62),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: [],
      // Reminder Phase - Day 60 (3rd/final reminder sent, awaiting final action)
      reminderPhase: {
        current: 3,
        total: 3,
        lastSent: getDaysAgo(2),
        nextScheduled: null
      }
    },
    
    // 90+ DAYS OVERDUE - Critical - Past Due with reminders exhausted
    {
      id: '8',
      client: 'Emily Rodriguez',
      clientId: '108',
      clientType: 'Individual',
      planName: 'Small Business Advisory',
      amount: 300,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(95), // 95 days overdue
      paymentMethod: 'Check',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(125),
      lastPaymentAttempt: getDaysAgo(95),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: [],
      // Reminder Phase - All reminders sent, ready for final action
      reminderPhase: {
        current: 3,
        total: 3,
        lastSent: getDaysAgo(65),
        nextScheduled: null
      }
    },
    
    // PENDING FIRST INVOICE
    {
      id: '9',
      client: 'Wilson Enterprises',
      clientId: '109',
      clientType: 'Business',
      planName: 'Startup Package',
      amount: 1200,
      frequency: 'Monthly',
      nextPaymentDate: null,
      paymentMethod: null,
      status: 'Pending First Invoice',
      lastSuccessfulPayment: null,
      lastPaymentAttempt: null,
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: []
    },
    
    // PAUSED
    {
      id: '10',
      client: 'Innovation Labs',
      clientId: '110',
      clientType: 'Business',
      planName: 'CFO Services',
      amount: 3000,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(10),
      paymentMethod: 'Wire',
      status: 'Paused',
      lastSuccessfulPayment: getDaysAgo(40),
      lastPaymentAttempt: getDaysAgo(40),
      failedAttempts: 0,
      nextRetryDate: null,
      paymentHistory: []
    },
    
    // Payment Failed with Auto-Set Final Status (In Collections)
    {
      id: '11',
      client: 'Anderson & Partners',
      clientId: '111',
      clientType: 'Business',
      planName: 'Monthly Bookkeeping',
      amount: 950,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(75), // 75 days overdue
      paymentMethod: 'Credit Card',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(105),
      lastPaymentAttempt: getDaysAgo(65), // Last retry 65 days ago
      failedAttempts: 3,
      nextRetryDate: null, // All retries exhausted
      primaryContact: 'Sarah Anderson',
      customerEmail: 'sarah@andersonpartners.com',
      customerPhone: '(555) 987-6543',
      finalStatus: 'In Collections', // Auto-set by payment retry strategy
      finalStatusSetBy: 'auto' as const,
      finalStatusSetDate: getDaysAgo(65),
      paymentHistory: []
    },
    
    // Payment Failed with Manually-Set Final Status (Canceled)
    {
      id: '12',
      client: 'Johnson LLC',
      clientId: '112',
      clientType: 'Business',
      planName: 'Tax Consulting',
      amount: 1500,
      frequency: 'Quarterly',
      nextPaymentDate: getDaysAgo(100), // 100 days overdue
      paymentMethod: 'ACH',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(190),
      lastPaymentAttempt: getDaysAgo(85), // Last retry 85 days ago
      failedAttempts: 3,
      nextRetryDate: null, // All retries exhausted
      primaryContact: 'Michael Johnson',
      customerEmail: 'mike@johnsonllc.com',
      customerPhone: '(555) 234-5678',
      finalStatus: 'Canceled', // Manually set by admin
      finalStatusSetBy: 'manual' as const,
      finalStatusSetDate: getDaysAgo(50),
      paymentHistory: []
    },
    
    // Payment Failed with Auto-Set Final Status (Written Off)
    {
      id: '13',
      client: 'Davis Enterprises',
      clientId: '113',
      clientType: 'Business',
      planName: 'Payroll Services',
      amount: 800,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(120), // 120 days overdue
      paymentMethod: 'Credit Card',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(150),
      lastPaymentAttempt: getDaysAgo(110), // Last retry 110 days ago
      failedAttempts: 3,
      nextRetryDate: null, // All retries exhausted
      primaryContact: 'Lisa Davis',
      customerEmail: 'lisa@davisenterprise.com',
      customerPhone: '(555) 876-5432',
      finalStatus: 'Written Off', // Auto-set by payment retry strategy
      finalStatusSetBy: 'auto' as const,
      finalStatusSetDate: getDaysAgo(110),
      paymentHistory: []
    },
    
    // Payment Failed - All retries exhausted, sending reminders, no final status set yet
    {
      id: '14',
      client: 'Thompson & Associates',
      clientId: '114',
      clientType: 'Business',
      planName: 'Monthly Advisory',
      amount: 1800,
      frequency: 'Monthly',
      nextPaymentDate: getDaysAgo(25), // 25 days overdue
      paymentMethod: 'ACH',
      status: 'Active',
      lastSuccessfulPayment: getDaysAgo(55),
      lastPaymentAttempt: getDaysAgo(15), // Last retry 15 days ago
      failedAttempts: 3,
      nextRetryDate: null, // All retries exhausted
      primaryContact: 'Patricia Thompson',
      customerEmail: 'patricia@thompsonassoc.com',
      customerPhone: '(555) 345-6789',
      paymentHistory: [
        {
          attemptDate: getDaysAgo(25),
          amount: 1800,
          status: 'Failed',
          failureReason: 'Insufficient funds',
          retryNumber: 0
        },
        {
          attemptDate: getDaysAgo(22),
          amount: 1800,
          status: 'Failed',
          failureReason: 'Insufficient funds',
          retryNumber: 1
        },
        {
          attemptDate: getDaysAgo(18),
          amount: 1800,
          status: 'Failed',
          failureReason: 'Insufficient funds',
          retryNumber: 2
        },
        {
          attemptDate: getDaysAgo(15),
          amount: 1800,
          status: 'Failed',
          failureReason: 'Insufficient funds',
          retryNumber: 3
        }
      ],
      // Reminder Phase - Currently in Payment Failed status (sending reminders after retries exhausted)
      reminderPhase: {
        current: 2,
        total: 3,
        lastSent: getDaysAgo(8),
        nextScheduled: getDaysAhead(7) // Next reminder in 7 days
      }
    }
  ];
  
  // Enrich all subscriptions with calculated aging fields
  return baseSubscriptions.map(sub => enrichSubscriptionWithAging(sub));
}

// ============================================================================
// MOCK INVOICES WITH AGING DATA
// ============================================================================

export function generateMockInvoices(): Invoice[] {
  const baseInvoices: Partial<Invoice>[] = [
    // PAID - No aging issues
    {
      id: 'INV-001',
      client: 'Tech Innovations Inc.',
      clientId: '101',
      clientType: 'Business',
      invoiceNo: 'INV-2025-001',
      created: getDaysAgo(45),
      createdTime: '09:30 AM',
      sentOn: getDaysAgo(45),
      sentTime: '09:35 AM',
      year: 2025,
      amountDue: 1500,
      status: 'Paid',
      dueDate: getDaysAgo(15),
      paidAt: getDaysAgo(10),
      paidTime: '02:15 PM',
      paidVia: 'ACH',
      reminderCount: 0
    },
    
    // CURRENT - Due in future
    {
      id: 'INV-002',
      client: 'ABC Holdings',
      clientId: '102',
      clientType: 'Business',
      invoiceNo: 'INV-2025-002',
      created: getDaysAgo(10),
      createdTime: '10:15 AM',
      sentOn: getDaysAgo(10),
      sentTime: '10:20 AM',
      year: 2025,
      amountDue: 2400,
      status: 'Sent to Client',
      dueDate: getDaysAhead(20), // Due in 20 days
      reminderCount: 0
    },
    
    // 1-30 DAYS OVERDUE
    {
      id: 'INV-003',
      client: 'Acme Corporation',
      clientId: '103',
      clientType: 'Business',
      invoiceNo: 'INV-2025-003',
      created: getDaysAgo(52),
      createdTime: '11:00 AM',
      sentOn: getDaysAgo(52),
      sentTime: '11:05 AM',
      year: 2025,
      amountDue: 1200,
      status: 'Overdue',
      dueDate: getDaysAgo(22), // 22 days overdue
      reminderCount: 1,
      lastReminderSent: getDaysAgo(5)
    },
    
    // 31-60 DAYS OVERDUE
    {
      id: 'INV-004',
      client: 'Acme Corporation',
      clientId: '103',
      clientType: 'Business',
      invoiceNo: 'INV-2024-089',
      created: getDaysAgo(105),
      createdTime: '02:30 PM',
      sentOn: getDaysAgo(105),
      sentTime: '02:35 PM',
      year: 2024,
      amountDue: 850,
      status: 'Overdue',
      dueDate: getDaysAgo(45), // 45 days overdue
      reminderCount: 2,
      lastReminderSent: getDaysAgo(15)
    },
    
    // 31-60 DAYS OVERDUE
    {
      id: 'INV-005',
      client: 'Martinez Consulting',
      clientId: '106',
      clientType: 'Business',
      invoiceNo: 'INV-2024-095',
      created: getDaysAgo(88),
      createdTime: '09:00 AM',
      sentOn: getDaysAgo(88),
      sentTime: '09:05 AM',
      year: 2024,
      amountDue: 3200,
      status: 'Overdue',
      dueDate: getDaysAgo(58), // 58 days overdue
      reminderCount: 3,
      lastReminderSent: getDaysAgo(8)
    },
    
    // 61-90 DAYS OVERDUE
    {
      id: 'INV-006',
      client: 'TechStart Inc',
      clientId: '104',
      clientType: 'Business',
      invoiceNo: 'INV-2024-072',
      created: getDaysAgo(132),
      createdTime: '03:45 PM',
      sentOn: getDaysAgo(132),
      sentTime: '03:50 PM',
      year: 2024,
      amountDue: 1500,
      status: 'Overdue',
      dueDate: getDaysAgo(72), // 72 days overdue
      reminderCount: 4,
      lastReminderSent: getDaysAgo(12)
    },
    
    // 90+ DAYS OVERDUE - Critical
    {
      id: 'INV-007',
      client: 'Emily Rodriguez',
      clientId: '108',
      clientType: 'Individual',
      invoiceNo: 'INV-2024-045',
      created: getDaysAgo(155),
      createdTime: '01:20 PM',
      sentOn: getDaysAgo(155),
      sentTime: '01:25 PM',
      year: 2024,
      amountDue: 300,
      status: 'Overdue',
      dueDate: getDaysAgo(95), // 95 days overdue
      reminderCount: 5,
      lastReminderSent: getDaysAgo(20)
    },
    
    // DRAFT - No aging
    {
      id: 'INV-008',
      client: 'Global Solutions',
      clientId: '105',
      clientType: 'Business',
      invoiceNo: 'DRAFT-2025-012',
      created: getDaysAgo(2),
      createdTime: '04:00 PM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 4200,
      status: 'Draft',
      dueDate: getDaysAhead(30),
      reminderCount: 0
    }
  ];
  
  // Enrich all invoices with calculated aging fields
  return baseInvoices.map(inv => enrichInvoiceWithAging(inv));
}

// ============================================================================
// DEFAULT MOCK SETTINGS
// ============================================================================

export const mockPaymentRetrySettings = {
  enabled: true,
  defaultPolicy: {
    retry1Days: 3,
    retry2Days: 5,
    retry3Days: 7,
    finalAction: 'pause' as const
  },
  amountBasedPolicies: [
    {
      threshold: 1000,
      retry1Days: 1,
      retry2Days: 3,
      retry3Days: 5,
      finalAction: 'keep-active' as const
    }
  ],
  notifyAdminAfterAttempts: 3,
  notifyAdminEmails: ['admin@firm.com', 'partner@firm.com']
};