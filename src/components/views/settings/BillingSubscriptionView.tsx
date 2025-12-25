import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  Download, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Package,
  FileText,
  ChevronRight,
  Plus,
  Check,
  Receipt,
  UserPlus,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { SeatManagementCard } from '../../SeatManagementCard';
import type { FirmSubscription } from '../../../types/subscription';

type UserSubscription = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionType: 'Monthly' | 'Yearly';
  monthlyCost: number;
  status: 'Active' | 'Invited';
};

type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  downloadUrl?: string;
};

const mockUsers: UserSubscription[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@firm.com', subscriptionType: 'Yearly', monthlyCost: 45, status: 'Active' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@firm.com', subscriptionType: 'Yearly', monthlyCost: 45, status: 'Active' },
  { id: '3', name: 'Emily Rodriguez', email: 'emily.rodriguez@firm.com', subscriptionType: 'Monthly', monthlyCost: 65, status: 'Invited' },
  { id: '4', name: 'David Park', email: 'david.park@firm.com', subscriptionType: 'Monthly', monthlyCost: 65, status: 'Active' },
  { id: '5', name: 'James Wilson', email: 'james.wilson@firm.com', subscriptionType: 'Yearly', monthlyCost: 45, status: 'Active' },
];

const mockInvoices: Invoice[] = [
  { id: 'INV-2025-001', date: 'January 1, 2025', amount: 610, status: 'Paid' },
  { id: 'INV-2024-012', date: 'December 1, 2024', amount: 610, status: 'Paid' },
  { id: 'INV-2024-011', date: 'November 1, 2024', amount: 545, status: 'Paid' },
  { id: 'INV-2024-010', date: 'October 1, 2024', amount: 545, status: 'Paid' },
];

export function BillingSubscriptionView() {
  const navigate = useNavigate();
  const [users] = useState<UserSubscription[]>(mockUsers);
  const [addOns, setAddOns] = useState<AddOn[]>([
    { 
      id: 'phone', 
      name: 'Custom Phone Number', 
      description: 'Use your own phone number for client communications',
      price: 0, // Pricing configured at org level
      enabled: true 
    },
    { 
      id: 'sync', 
      name: 'Sync App', 
      description: 'Real-time data synchronization with external systems',
      price: 0, // Pricing configured at org level
      enabled: false 
    },
  ]);
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSubscription | null>(null);

  // Mock firm subscription data for seat management
  const [firmSubscription, setFirmSubscription] = useState<FirmSubscription>({
    id: 'sub_firm_123',
    firmId: 'firm_abc',
    firmName: 'Acme Accounting Firm',
    tier: 'professional',
    status: 'active',
    stripeCustomerId: 'cus_stripe_123',
    stripeSubscriptionId: 'sub_stripe_456',
    totalSeats: 10,
    usedSeats: 5, // Active users
    availableSeats: 4,
    reservedSeats: 1, // Pending invites
    billingCycle: 'monthly',
    basePrice: 99,
    perSeatPrice: 49,
    totalMonthlyCost: 344, // Base (99) + 5 active seats (245)
    nextBillingDate: '2025-02-01',
    createdAt: '2024-01-01',
    currentPeriodStart: '2025-01-01',
    currentPeriodEnd: '2025-02-01',
  });

  // Calculate totals
  const activeUsers = users.filter(u => u.status === 'Active');
  const yearlyUsers = activeUsers.filter(u => u.subscriptionType === 'Yearly').length;
  const monthlyUsers = activeUsers.filter(u => u.subscriptionType === 'Monthly').length;
  const usersCost = users.reduce((sum, u) => u.status === 'Active' ? sum + u.monthlyCost : sum, 0);
  const addOnsCost = addOns.reduce((sum, a) => a.enabled ? sum + a.price : sum, 0);
  const totalMonthlyCost = usersCost + addOnsCost;
  const annualSavings = monthlyUsers * (65 - 45) * 12; // Potential savings if all monthly users upgrade

  const handleToggleAddOn = (addOnId: string) => {
    setAddOns(addOns.map(a => 
      a.id === addOnId ? { ...a, enabled: !a.enabled } : a
    ));
    const addOn = addOns.find(a => a.id === addOnId);
    if (addOn) {
      toast.success(
        addOn.enabled ? `${addOn.name} disabled` : `${addOn.name} enabled`,
        {
          description: addOn.enabled 
            ? `Saved $${addOn.price}/month` 
            : `Added $${addOn.price}/month to your subscription`
        }
      );
    }
  };

  const handleUpgradeUser = (user: UserSubscription) => {
    setSelectedUser(user);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    if (!selectedUser) return;
    
    toast.success(`${selectedUser.name} upgraded to Yearly plan`, {
      description: 'Prorated credit applied. They now pay $45/month (billed annually).',
    });
    
    setUpgradeDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading ${invoice.id}`);
  };

  // Handle seat purchase
  const handlePurchaseSeats = async (quantity: number, billingCycle: 'monthly' | 'yearly') => {
    // Simulate API call to Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const MONTHLY_PRICE = 65;
    const YEARLY_PRICE = 45; // 15% discount
    const pricePerSeat = billingCycle === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
    
    // Update firm subscription
    setFirmSubscription(prev => ({
      ...prev,
      totalSeats: prev.totalSeats + quantity,
      availableSeats: prev.availableSeats + quantity,
      perSeatPrice: pricePerSeat,
      totalMonthlyCost: prev.totalMonthlyCost + (quantity * pricePerSeat),
    }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-gray-900 dark:text-gray-100 mb-2">Billing & Subscription</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your subscription, users, add-ons, and billing information
              </p>
            </div>
          </div>

          {/* Seat Management Card */}
          <div className="mb-6">
            <SeatManagementCard 
              subscription={firmSubscription}
              onPurchaseSeats={handlePurchaseSeats}
            />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${totalMonthlyCost}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Next billing: Feb 1, 2025</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{activeUsers.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {yearlyUsers} yearly, {monthlyUsers} monthly
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Potential Savings</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">${annualSavings}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {monthlyUsers > 0 ? 'Upgrade monthly users to yearly' : 'All users on yearly plan!'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Add-ons Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {addOns.filter(a => a.enabled).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">${addOnsCost}/month</p>
            </div>
          </div>

          {/* User Subscriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-900 dark:text-gray-100 font-medium mb-1">User Subscriptions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage individual user subscription plans
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    onClick={() => {
                      // Navigate to team members page and open invite dialog
                      navigate('/settings/company/team?action=invite');
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Team Member
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate('/settings/company/team')}
                  >
                    <Users className="w-4 h-4" />
                    Manage Team
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableHead className="text-gray-700 dark:text-gray-300 pl-[52px]">User</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Plan & Cost</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border flex items-center gap-1',
                            user.status === 'Active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          )}
                        >
                          {user.status === 'Active' ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              'border flex items-center gap-1 w-fit',
                              user.subscriptionType === 'Yearly'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            )}
                          >
                            {user.subscriptionType === 'Yearly' ? (
                              <Calendar className="w-3 h-3" />
                            ) : (
                              <CalendarDays className="w-3 h-3" />
                            )}
                            {user.subscriptionType}
                          </Badge>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${user.monthlyCost}/mo
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {user.subscriptionType === 'Monthly' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpgradeUser(user)}
                              className="gap-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              Upgrade to Yearly
                            </Button>
                          )}
                          {user.subscriptionType === 'Yearly' && (
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              <Check className="w-3 h-3 mr-1" />
                              Best Value
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Subscriptions Total
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ${usersCost}/month
                </span>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-medium mb-1">Add-ons</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enhance your account with additional features
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                      addOn.enabled
                        ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{addOn.name}</h3>
                        {addOn.enabled && (
                          <Badge className="bg-green-600 text-white border-0">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{addOn.description}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                          ${addOn.price}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
                      </div>
                      <Button
                        variant={addOn.enabled ? 'outline' : 'default'}
                        onClick={() => handleToggleAddOn(addOn.id)}
                        className={cn(
                          addOn.enabled
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                            : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                        )}
                      >
                        {addOn.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add-ons Total
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ${addOnsCost}/month
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-900 dark:text-gray-100 font-medium mb-1">Payment Method</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your payment information
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Visa ending in 4242</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/2026</p>
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  Default
                </Badge>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-medium mb-1">Invoice History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View and download past invoices
                </p>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableHead className="text-gray-700 dark:text-gray-300">Invoice ID</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {invoice.date}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        ${invoice.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border',
                            invoice.status === 'Paid'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                              : invoice.status === 'Pending'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="gap-1.5"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Billing Summary Card */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Current Billing Summary
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Next billing date: February 1, 2025
                </p>
              </div>
              <Receipt className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-purple-200 dark:border-purple-800">
                <span className="text-purple-800 dark:text-purple-200">User Subscriptions ({activeUsers.length} users)</span>
                <span className="font-medium text-purple-900 dark:text-purple-100">${usersCost}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-purple-200 dark:border-purple-800">
                <span className="text-purple-800 dark:text-purple-200">Add-ons</span>
                <span className="font-medium text-purple-900 dark:text-purple-100">${addOnsCost}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">Total Monthly Cost</span>
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">${totalMonthlyCost}</span>
              </div>
            </div>

            {annualSavings > 0 && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Save ${annualSavings}/year
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Upgrade {monthlyUsers} monthly user{monthlyUsers !== 1 ? 's' : ''} to yearly billing and save 30%!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="upgrade-yearly-description">
          <DialogHeader>
            <DialogTitle>Upgrade to Yearly Plan</DialogTitle>
            <DialogDescription id="upgrade-yearly-description">
              Upgrade {selectedUser?.name} from Monthly to Yearly billing
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Current Plan</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">$65/month</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Billed monthly</p>
                </div>
                <div className="text-3xl text-purple-400">→</div>
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">New Plan</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">$45/month</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Billed annually ($540/year)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800 dark:text-purple-200">Annual Savings</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    $240/year
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                What happens next:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5 list-disc list-inside">
                <li>Prorated credit applied for unused monthly subscription</li>
                <li>Annual charge of $540 applied immediately</li>
                <li>User continues with uninterrupted access</li>
                <li>Renewal in 12 months at $540/year</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmUpgrade}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Upgrade to Yearly
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}