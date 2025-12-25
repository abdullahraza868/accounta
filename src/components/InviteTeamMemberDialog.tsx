import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Mail,
  UserPlus,
  AlertTriangle,
  ShoppingCart,
  Users,
  Check,
  Info,
  DollarSign,
  Calendar,
  Zap,
  X,
  CreditCard,
  Clock,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import { Card } from './ui/card';

type Role = {
  id: string;
  name: string;
  color: string;
  description?: string;
  permissionCount?: number;
};

// Mock Client Groups Data - same as EditRoleInline
const CLIENT_GROUPS = [
  { id: 'active', name: 'Active Clients', count: 45, color: 'green' },
  { id: 'tax', name: 'Tax Clients', count: 32, color: 'blue' },
  { id: 'audit', name: 'Audit Clients', count: 18, color: 'purple' },
  { id: 'consulting', name: 'Consulting Clients', count: 12, color: 'orange' },
  { id: 'inactive', name: 'Inactive Clients', count: 8, color: 'gray' },
];

// Mock Clients Data with group memberships - same as EditRoleInline
const ALL_CLIENTS = [
  { id: '1', name: 'Acme Corporation', groups: ['active', 'tax'] },
  { id: '2', name: 'TechStart Inc', groups: ['active', 'consulting'] },
  { id: '3', name: 'Global Ventures LLC', groups: ['active', 'audit'] },
  { id: '4', name: 'Smith & Sons', groups: ['tax'] },
  { id: '5', name: 'Johnson Enterprises', groups: ['active', 'tax', 'audit'] },
  { id: '6', name: 'Williams Consulting', groups: ['consulting'] },
  { id: '7', name: 'Brown Industries', groups: ['active', 'audit'] },
  { id: '8', name: 'Davis Holdings', groups: ['tax'] },
  { id: '9', name: 'Miller Group', groups: ['active', 'consulting'] },
  { id: '10', name: 'Wilson & Co', groups: ['audit'] },
  { id: '11', name: 'Moore Financial', groups: ['active', 'tax'] },
  { id: '12', name: 'Taylor Services', groups: ['inactive'] },
  { id: '13', name: 'Anderson Corp', groups: ['active', 'tax'] },
  { id: '14', name: 'Thomas Industries', groups: ['consulting'] },
  { id: '15', name: 'Jackson Retail', groups: ['active', 'audit'] },
];

type InviteTeamMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSeats: number;
  roles: Role[];
  onInvite: (data: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    billingCycle: 'monthly' | 'yearly';
    clientAccessMode: 'all' | 'assigned';
    selectedClientGroups?: string[];
    selectedClients?: string[];
  }) => void;
  onPurchaseSeats: () => void;
  hasPaymentMethod?: boolean; // Track if payment method is on file
};

export function InviteTeamMemberDialog({
  open,
  onOpenChange,
  availableSeats,
  roles,
  onInvite,
  onPurchaseSeats,
  hasPaymentMethod = true, // Default to true for backward compatibility
}: InviteTeamMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [clientAccessMode, setClientAccessMode] = useState<'all' | 'assigned'>('all');
  const [assignmentMethod, setAssignmentMethod] = useState<'groups' | 'individual'>('groups');
  const [selectedClientGroups, setSelectedClientGroups] = useState<Set<string>>(new Set());
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedClientsSearchQuery, setSelectedClientsSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentMethodScreen, setShowPaymentMethodScreen] = useState(false); // Track if we should show "add payment method" screen

  const hasNoSeats = availableSeats === 0;
  const isLowOnSeats = availableSeats > 0 && availableSeats <= 2;
  const needsToAddPaymentMethod = hasNoSeats && !hasPaymentMethod; // Determine if user needs to add payment method
  const willChargeCard = hasNoSeats && hasPaymentMethod; // Will charge card for new seat

  // Pricing
  const MONTHLY_PRICE = 65;
  const YEARLY_PRICE = 45;
  const YEARLY_DISCOUNT = Math.round((1 - YEARLY_PRICE / MONTHLY_PRICE) * 100);
  const price = billingCycle === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
  const yearlySavings = (MONTHLY_PRICE - YEARLY_PRICE) * 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onInvite({ 
        email, 
        firstName, 
        lastName, 
        roleId, 
        billingCycle,
        clientAccessMode,
        selectedClientGroups: Array.from(selectedClientGroups),
        selectedClients: Array.from(selectedClients),
      });
      
      // If no payment method, show the "add payment method" screen
      if (needsToAddPaymentMethod) {
        setShowPaymentMethodScreen(true);
        toast.success('Invitation sent!', {
          description: `Invite sent to ${email}. Add a payment method to activate the seat.`,
        });
      } else {
        // Normal flow - either using existing seat or charging card
        toast.success('Invitation sent!', {
          description: willChargeCard 
            ? `Invite sent to ${email}. Your card will be charged $${price}/${billingCycle === 'monthly' ? 'month' : 'year'}.`
            : `An invite has been sent to ${email}. Seat will be reserved at $${price}/month (${billingCycle}).`,
        });

        // Reset form and close
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to send invitation', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setRoleId('');
    setBillingCycle('monthly');
    setClientAccessMode('all');
    setAssignmentMethod('groups');
    setSelectedClientGroups(new Set());
    setSelectedClients(new Set());
    setClientSearchQuery('');
    setSelectedClientsSearchQuery('');
    setShowPaymentMethodScreen(false);
  };

  const handlePurchaseClick = () => {
    onOpenChange(false);
    onPurchaseSeats();
  };

  const handleAddPaymentMethod = async () => {
    // Simulate opening Stripe payment method setup
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would open Stripe Elements or redirect to Stripe Checkout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment method added!', {
        description: 'Your pending invite will now be activated.',
      });
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add payment method', {
        description: 'Please try again or contact support.',
      });
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find(r => r.id === roleId);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby="invite-team-member-description">
        {/* Show "Add Payment Method" screen if invite sent without payment method */}
        {showPaymentMethodScreen ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                You're Almost Done
              </DialogTitle>
              <DialogDescription id="invite-team-member-description" className="text-gray-600 dark:text-gray-400">
                Add a payment method to activate the pending seat for {email}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Invitation Sent Successfully
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      We've sent an invitation to <strong>{email}</strong>. To complete the process and activate their seat, please add a payment method below.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Seat
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {firstName} {lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      ${billingCycle === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      per {billingCycle === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Payment Method
                </Badge>
              </Card>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                I'll Do This Later
              </Button>
              <Button 
                type="button"
                onClick={handleAddPaymentMethod}
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Add Payment Method
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription id="invite-team-member-description" className="text-gray-600 dark:text-gray-400">
                Send an invitation to join your firm. A seat will be reserved upon acceptance.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">

                {/* Low Seats Warning */}
                {isLowOnSeats && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Running low on seats
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Only {availableSeats} seat{availableSeats !== 1 ? 's' : ''} remaining. Consider purchasing more.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seats Available Display - Only show when seats ARE available */}
                {!hasNoSeats && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Available Seats
                        </span>
                      </div>
                      <Badge className={cn(
                        'font-semibold',
                        isLowOnSeats
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                      )}>
                        {availableSeats} {availableSeats === 1 ? 'seat' : 'seats'} available
                      </Badge>
                    </div>
                  </div>
                )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.smith@firm.com"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Role Selection - Cards */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const isSelected = roleId === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setRoleId(role.id)}
                        disabled={isSubmitting}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
                          isSubmitting && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                            isSelected
                              ? 'bg-purple-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={cn(
                                'w-2 h-2 rounded-full flex-shrink-0',
                                role.color === 'purple' && 'bg-purple-500',
                                role.color === 'blue' && 'bg-blue-500',
                                role.color === 'green' && 'bg-green-500',
                                role.color === 'yellow' && 'bg-yellow-500',
                                role.color === 'gray' && 'bg-gray-500',
                              )} />
                              <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                {role.name}
                              </h6>
                            </div>
                            {role.permissionCount !== undefined ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {role.permissionCount} permissions
                              </p>
                            ) : role.description ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {role.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Access Mode */}
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300">
                  Client Access <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setClientAccessMode('all')}
                    disabled={isSubmitting}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      clientAccessMode === 'all'
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                        clientAccessMode === 'all'
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}>
                        {clientAccessMode === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          All Clients
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Can access all clients in the system (default)
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientAccessMode('assigned')}
                    disabled={isSubmitting}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      clientAccessMode === 'assigned'
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                        clientAccessMode === 'assigned'
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}>
                        {clientAccessMode === 'assigned' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          Assigned Clients Only
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Restrict access to specific clients you assign
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Step 2: If Assigned Clients, show assignment method */}
                {clientAccessMode === 'assigned' && (
                  <>
                    {/* Help text - Show BEFORE method selection */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Mix & Match Client Selection
                          </p>
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            You can combine both methods! Start with client groups for broad coverage, then fine-tune by adding or removing individual clients.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Assignment Method
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAssignmentMethod('groups')}
                          disabled={isSubmitting}
                          className={cn(
                            'p-4 rounded-lg border-2 transition-all text-left',
                            assignmentMethod === 'groups'
                              ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                              assignmentMethod === 'groups'
                                ? 'bg-blue-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            )}>
                              {assignmentMethod === 'groups' && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                                By Client Group
                              </h6>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Select groups, then remove specific clients if needed
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAssignmentMethod('individual')}
                          disabled={isSubmitting}
                          className={cn(
                            'p-4 rounded-lg border-2 transition-all text-left',
                            assignmentMethod === 'individual'
                              ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                              assignmentMethod === 'individual'
                                ? 'bg-blue-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            )}>
                              {assignmentMethod === 'individual' && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                                Individual Clients
                              </h6>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Manually pick specific clients one by one
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Client Group Selection */}
                    {assignmentMethod === 'groups' && (
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Select Client Groups
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {CLIENT_GROUPS.map((group) => {
                              const isSelected = selectedClientGroups.has(group.id);
                              const colorClasses = {
                                green: 'border-green-500 bg-green-50 dark:bg-green-900/30',
                                blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
                                purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/30',
                                orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30',
                                gray: 'border-gray-500 bg-gray-50 dark:bg-gray-900/30',
                              }[group.color];

                              return (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => {
                                    const newGroups = new Set(selectedClientGroups);
                                    const newClients = new Set(selectedClients);
                                    
                                    if (isSelected) {
                                      // Remove group and its clients
                                      newGroups.delete(group.id);
                                      ALL_CLIENTS.forEach(client => {
                                        if (client.groups.includes(group.id)) {
                                          newClients.delete(client.id);
                                        }
                                      });
                                    } else {
                                      // Add group and all its clients
                                      newGroups.add(group.id);
                                      ALL_CLIENTS.forEach(client => {
                                        if (client.groups.includes(group.id)) {
                                          newClients.add(client.id);
                                        }
                                      });
                                    }
                                    
                                    setSelectedClientGroups(newGroups);
                                    setSelectedClients(newClients);
                                  }}
                                  className={cn(
                                    'p-3 rounded-lg border-2 transition-all text-left',
                                    isSelected
                                      ? colorClasses
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <h6 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                      {group.name}
                                    </h6>
                                    <div className={cn(
                                      'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                                      isSelected
                                        ? `bg-${group.color}-600`
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    )}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {group.count} clients
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Show selected clients from groups */}
                        {selectedClients.size > 0 && (
                          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Selected Clients ({selectedClients.size})
                              </h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedClientGroups(new Set());
                                  setSelectedClients(new Set());
                                  setSelectedClientsSearchQuery('');
                                }}
                                className="h-7 text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                            
                            {/* Search within selected clients */}
                            <Input
                              type="text"
                              placeholder="Search selected clients..."
                              value={selectedClientsSearchQuery}
                              onChange={(e) => setSelectedClientsSearchQuery(e.target.value)}
                              className="mb-3"
                            />

                            {/* Help text */}
                            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                              💡 <strong>Tip:</strong> You can mix and match! Select client groups, then click individual clients below to add or remove them from your selection.
                            </div>

                            {/* List view of selected clients */}
                            <div className="grid grid-cols-2 gap-3">
                              {ALL_CLIENTS
                                .filter(c => selectedClients.has(c.id))
                                .filter(client => 
                                  client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                  client.groups.some(gId => {
                                    const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                    return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                  })
                                )
                                .map((client) => (
                                  <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => {
                                      const newClients = new Set(selectedClients);
                                      newClients.delete(client.id);
                                      setSelectedClients(newClients);
                                    }}
                                    className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all border border-gray-100 dark:border-gray-800"
                                  >
                                    {/* Checkbox - Always checked in selected list */}
                                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-green-600">
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    
                                    {/* Client Info */}
                                    <div className="flex-1 text-left min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {client.name}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {client.groups.map(gId => {
                                          const group = CLIENT_GROUPS.find(g => g.id === gId);
                                          if (!group) return null;
                                          
                                          const pillColors = {
                                            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                            purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                            orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                                          }[group.color];

                                          return (
                                            <span
                                              key={gId}
                                              className={cn(
                                                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                                pillColors
                                              )}
                                            >
                                              {group.name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Remove icon hint */}
                                    <div className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity">
                                      <X className="w-4 h-4" />
                                    </div>
                                  </button>
                                ))}
                            </div>
                            
                            {/* No results message */}
                            {selectedClientsSearchQuery && 
                             ALL_CLIENTS
                               .filter(c => selectedClients.has(c.id))
                               .filter(client => 
                                 client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                 client.groups.some(gId => {
                                   const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                   return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                 })
                               ).length === 0 && (
                              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No clients match your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Individual Client Selection */}
                    {assignmentMethod === 'individual' && (
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Search and Select Clients
                          </h5>
                          <Input
                            type="text"
                            placeholder="Search clients..."
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            className="mb-3"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            {ALL_CLIENTS
                              .filter(client => 
                                client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
                              )
                              .map((client) => {
                                const isSelected = selectedClients.has(client.id);
                                return (
                                  <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => {
                                      const newClients = new Set(selectedClients);
                                      if (isSelected) {
                                        newClients.delete(client.id);
                                      } else {
                                        newClients.add(client.id);
                                      }
                                      setSelectedClients(newClients);
                                    }}
                                    className={cn(
                                      "flex items-center gap-3 p-3 transition-all rounded-lg border",
                                      isSelected
                                        ? "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100"
                                    )}
                                  >
                                    {/* Checkbox */}
                                    <div className={cn(
                                      'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all',
                                      isSelected
                                        ? 'bg-purple-600'
                                        : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                                    )}>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    
                                    {/* Client Info */}
                                    <div className="flex-1 text-left min-w-0">
                                      <p className={cn(
                                        "text-sm font-medium truncate",
                                        isSelected 
                                          ? "text-gray-900 dark:text-gray-100"
                                          : "text-gray-600 dark:text-gray-400"
                                      )}>
                                        {client.name}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {client.groups.map(gId => {
                                          const group = CLIENT_GROUPS.find(g => g.id === gId);
                                          if (!group) return null;
                                          
                                          const pillColors = {
                                            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                            purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                            orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                                          }[group.color];

                                          return (
                                            <span
                                              key={gId}
                                              className={cn(
                                                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                                pillColors
                                              )}
                                            >
                                              {group.name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        </div>

                        {/* Show selected clients */}
                        {selectedClients.size > 0 && (
                          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Selected Clients ({selectedClients.size})
                              </h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedClients(new Set());
                                  setSelectedClientsSearchQuery('');
                                }}
                                className="h-7 text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                            
                            {/* Search within selected clients */}
                            <Input
                              type="text"
                              placeholder="Search selected clients..."
                              value={selectedClientsSearchQuery}
                              onChange={(e) => setSelectedClientsSearchQuery(e.target.value)}
                              className="mb-3"
                            />

                            {/* Help text */}
                            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                              💡 <strong>Tip:</strong> Click any client to remove them from your selection. You can always add them back!
                            </div>

                            {/* List view of selected clients */}
                            <div className="grid grid-cols-2 gap-3">
                              {ALL_CLIENTS
                                .filter(c => selectedClients.has(c.id))
                                .filter(client => 
                                  client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                  client.groups.some(gId => {
                                    const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                    return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                  })
                                )
                                .map((client) => (
                                  <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => {
                                      const newClients = new Set(selectedClients);
                                      newClients.delete(client.id);
                                      setSelectedClients(newClients);
                                    }}
                                    className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all border border-gray-100 dark:border-gray-800"
                                  >
                                    {/* Checkbox - Always checked in selected list */}
                                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-green-600">
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    
                                    {/* Client Info */}
                                    <div className="flex-1 text-left min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {client.name}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {client.groups.map(gId => {
                                          const group = CLIENT_GROUPS.find(g => g.id === gId);
                                          if (!group) return null;
                                          
                                          const pillColors = {
                                            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                            purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                            orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                                          }[group.color];

                                          return (
                                            <span
                                              key={gId}
                                              className={cn(
                                                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                                pillColors
                                              )}
                                            >
                                              {group.name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Remove icon hint */}
                                    <div className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity">
                                      <X className="w-4 h-4" />
                                    </div>
                                  </button>
                                ))}
                            </div>
                            
                            {/* No results message */}
                            {selectedClientsSearchQuery && 
                             ALL_CLIENTS
                               .filter(c => selectedClients.has(c.id))
                               .filter(client => 
                                 client.name.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase()) ||
                                 client.groups.some(gId => {
                                   const groupName = CLIENT_GROUPS.find(g => g.id === gId)?.name || '';
                                   return groupName.toLowerCase().includes(selectedClientsSearchQuery.toLowerCase());
                                 })
                               ).length === 0 && (
                              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No clients match your search
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Billing Cycle Selection */}
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300">
                  Billing Cycle <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={billingCycle}
                  onValueChange={(value: string) => setBillingCycle(value as 'monthly' | 'yearly')}
                  disabled={isSubmitting}
                >
                  <div className="space-y-2">
                    {/* Monthly Option */}
                    <Card
                      className={cn(
                        "cursor-pointer transition-all border-2 p-4",
                        billingCycle === 'monthly'
                          ? "border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isSubmitting && setBillingCycle('monthly')}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="monthly" className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                              Monthly Billing
                            </Label>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                ${MONTHLY_PRICE}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {willChargeCard 
                              ? 'New seat will be added and billed to your existing payment method'
                              : 'Flexible month-to-month • Can upgrade to yearly anytime'
                            }
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Yearly Option */}
                    <Card
                      className={cn(
                        "relative cursor-pointer transition-all border-2 p-4",
                        billingCycle === 'yearly'
                          ? "border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isSubmitting && setBillingCycle('yearly')}
                    >
                      <Badge className="absolute -top-2 -right-2 bg-green-600 text-white border-0 shadow-md">
                        <Zap className="w-3 h-3 mr-1" />
                        Save {YEARLY_DISCOUNT}%
                      </Badge>
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="yearly" id="yearly" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="yearly" className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                              Yearly Billing
                            </Label>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                ${YEARLY_PRICE}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {willChargeCard 
                              ? `New seat will be added and billed to your existing payment method`
                              : `Billed annually at $${YEARLY_PRICE * 12}/year`
                            }
                          </p>
                          {!willChargeCard && (
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded px-3 py-1.5">
                              <DollarSign className="w-3.5 h-3.5" />
                              Save ${yearlySavings}/year compared to monthly
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-2 text-xs bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600 dark:text-gray-400">
                {willChargeCard ? (
                  <>
                    <strong>Authorization:</strong> By sending this invitation, you authorize us to charge your payment method ${price}/{billingCycle === 'monthly' ? 'month' : 'year'} when the invite is accepted.
                  </>
                ) : (
                  'An invitation email will be sent immediately. Once accepted, a seat will be reserved and billing will begin based on the selected plan.'
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gap-2"
              style={{ 
                background: isSubmitting ? undefined : 'var(--primaryColor)',
                color: isSubmitting ? undefined : 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
