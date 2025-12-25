/**
 * Subscription & Seat Management Types
 * For firm-based subscription model where firms purchase seats for team members
 */

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export type SeatStatus = 'available' | 'reserved' | 'active' | 'inactive';

export type Seat = {
  id: string;
  firmId: string;
  userId?: string; // Assigned user ID (if occupied)
  userEmail?: string; // Email of invited/active user
  status: SeatStatus;
  assignedAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  subscriptionType: 'monthly' | 'yearly';
  monthlyCost: number;
};

export type FirmSubscription = {
  id: string;
  firmId: string;
  firmName: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  
  // Stripe integration
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePaymentMethodId?: string;
  
  // Seat management
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  reservedSeats: number; // Pending invitations
  
  // Billing
  billingCycle: 'monthly' | 'yearly';
  basePrice: number; // Base subscription cost
  perSeatPrice: number; // Cost per additional seat
  totalMonthlyCost: number;
  nextBillingDate: string;
  
  // Dates
  createdAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
};

export type SeatPurchaseRequest = {
  firmId: string;
  quantity: number; // Number of seats to purchase
  billingCycle: 'monthly' | 'yearly';
  prorated: boolean; // Whether to prorate the charge
};

export type SeatPurchaseResponse = {
  success: boolean;
  newTotalSeats: number;
  addedSeats: number;
  proratedAmount: number;
  newMonthlyTotal: number;
  stripeInvoiceId: string;
  message: string;
};

export type SeatAllocationRequest = {
  firmId: string;
  userEmail: string;
  subscriptionType: 'monthly' | 'yearly';
  reserveOnly: boolean; // If true, just reserve (for pending invites), if false, activate
};

export type SeatAllocationResponse = {
  success: boolean;
  seatId: string;
  status: SeatStatus;
  message: string;
};

export type SeatUsageSummary = {
  total: number;
  used: number;
  available: number;
  reserved: number;
  utilizationPercentage: number;
  warningThreshold: boolean; // True if > 80% utilized
  criticalThreshold: boolean; // True if 100% utilized
};
