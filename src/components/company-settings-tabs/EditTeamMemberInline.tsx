import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Shield,
  DollarSign,
  AlertCircle,
  Check,
  Users,
  Folder
} from 'lucide-react';
import { cn } from '../ui/utils';

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

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  roleId: string;
  roleName: string;
  roleColor: string;
  status: 'active' | 'inactive' | 'pending';
  startDate?: string;
  subscriptionCost: number;
  clientAccessMode: 'all' | 'groups' | 'individual';
  assignedClientGroups?: string[];
  assignedClients?: string[];
};

type Role = {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
};

type ClientGroup = {
  id: string;
  name: string;
  clientCount: number;
};

type Client = {
  id: string;
  name: string;
  groupId: string;
};

type Props = {
  member?: TeamMember;
  onCancel: () => void;
  onSave: (data: any) => void;
  availableRoles: Role[];
  clientGroups: ClientGroup[];
  clients: Client[];
  existingEmails: string[];
  availableMonthlySeats?: number;
  availableYearlySeats?: number;
  onPurchaseSeats?: () => void;
};

export function EditTeamMemberInline({
  member,
  onCancel,
  onSave,
  availableRoles,
  clientGroups,
  clients,
  existingEmails,
  availableMonthlySeats = 999,
  availableYearlySeats = 999,
  onPurchaseSeats,
}: Props) {
  const isEditMode = !!member;
  const hasNoMonthlySeats = !isEditMode && availableMonthlySeats === 0;
  const hasNoYearlySeats = !isEditMode && availableYearlySeats === 0;
  const hasNoSeats = hasNoMonthlySeats && hasNoYearlySeats;
  const isLowOnSeats = !isEditMode && (availableMonthlySeats + availableYearlySeats) > 0 && (availableMonthlySeats + availableYearlySeats) <= 2;

  // Basic Info
  const [firstName, setFirstName] = useState(member?.firstName || '');
  const [lastName, setLastName] = useState(member?.lastName || '');
  const [email, setEmail] = useState(member?.email || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [jobTitle, setJobTitle] = useState(member?.jobTitle || '');
  const [department, setDepartment] = useState(member?.department || '');
  const [startDate, setStartDate] = useState(member?.startDate || '');

  // Role
  const [selectedRoleId, setSelectedRoleId] = useState(member?.roleId || 'staff');

  // Billing (only for new members)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Client Access
  const [clientAccessMode, setClientAccessMode] = useState<'all' | 'assigned'>(
    member?.clientAccessMode === 'groups' || member?.clientAccessMode === 'individual' ? 'assigned' : 'all'
  );
  const [assignmentMethod, setAssignmentMethod] = useState<'groups' | 'individual'>('groups');
  const [selectedClientGroups, setSelectedClientGroups] = useState<Set<string>>(
    new Set(member?.assignedClientGroups || [])
  );
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set(member?.assignedClients || [])
  );
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedClientsSearchQuery, setSelectedClientsSearchQuery] = useState('');

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Get selected role details - handle undefined availableRoles
  const selectedRole = availableRoles?.find(r => r.id === selectedRoleId);

  // Auto-calculate subscription cost based on role
  const getSubscriptionCost = (roleId: string): number => {
    const roleCostMap: Record<string, number> = {
      'owner': 99,
      'cpa': 79,
      'manager': 59,
      'staff': 49,
      'bookkeeper': 39,
    };
    return roleCostMap[roleId] || 49;
  };

  const subscriptionCost = getSubscriptionCost(selectedRoleId);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!firstName.trim()) {
      newErrors.push('First name is required');
    }

    if (!lastName.trim()) {
      newErrors.push('Last name is required');
    }

    if (!email.trim()) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Please enter a valid email address');
    } else if (!isEditMode && existingEmails?.includes(email)) {
      newErrors.push('This email is already in use by another team member');
    } else if (isEditMode && member && email !== member.email && existingEmails?.includes(email)) {
      newErrors.push('This email is already in use by another team member');
    }

    if (clientAccessMode === 'assigned' && assignmentMethod === 'groups' && selectedClientGroups.size === 0) {
      newErrors.push('Please select at least one client group');
    }

    if (clientAccessMode === 'assigned' && assignmentMethod === 'individual' && selectedClients.size === 0) {
      newErrors.push('Please select at least one client');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    // Check for available seats when creating new member
    if (!isEditMode) {
      if (billingCycle === 'monthly' && hasNoMonthlySeats) {
        setErrors(['No monthly seats available. Please select yearly or purchase more monthly seats.']);
        return;
      }
      if (billingCycle === 'yearly' && hasNoYearlySeats) {
        setErrors(['No yearly seats available. Please select monthly or purchase more yearly seats.']);
        return;
      }
    }

    if (!validateForm()) return;

    const roleData = availableRoles?.find(r => r.id === selectedRoleId);
    if (!roleData) return;

    const data = {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      startDate,
      roleId: selectedRoleId,
      roleName: roleData.name,
      roleColor: roleData.color,
      subscriptionCost,
      billingCycle: !isEditMode ? billingCycle : undefined, // Only include for new members
      clientAccessMode,
      assignedClientGroups: clientAccessMode === 'assigned' && assignmentMethod === 'groups' ? Array.from(selectedClientGroups) : [],
      assignedClients: clientAccessMode === 'assigned' && assignmentMethod === 'individual' ? Array.from(selectedClients) : [],
    };

    onSave(data);
  };

  const toggleClientGroup = (groupId: string) => {
    setSelectedClientGroups(prev =>
      prev.has(groupId)
        ? new Set([...prev].filter(id => id !== groupId))
        : new Set([...prev, groupId])
    );
  };

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.has(clientId)
        ? new Set([...prev].filter(id => id !== clientId))
        : new Set([...prev, clientId])
    );
  };

  const getRoleColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-500' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-500' },
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-500' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-500' },
      gray: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', badge: 'bg-gray-500' },
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-purple-500 dark:border-purple-600 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            {isEditMode ? <User className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode ? `Edit Team Member: ${member.firstName} ${member.lastName}` : 'Add New Team Member'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update team member details and permissions' : 'Invite a new team member to your firm'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@firm.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Accountant"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-sm font-medium">
                Department
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Tax"
                className="mt-1.5"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 md:w-1/2"
              />
            </div>
          </div>
        </div>

        {/* Role Assignment */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role & Permissions
          </h4>
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Assign Role <span className="text-red-500">*</span>
            </Label>
            {(availableRoles || []).length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No roles available</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please create roles first in the Roles tab</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(availableRoles || []).map(role => {
                    const isSelected = selectedRoleId === role.id;
                    const roleColors = getRoleColorClasses(role.color);
                    const roleCost = getSubscriptionCost(role.id);
                    
                    // Role descriptions and permission counts
                    const roleInfo: Record<string, { permissions: number; description: string }> = {
                      'owner': { permissions: 15, description: 'Full system access and control' },
                      'admin': { permissions: 12, description: 'Manage team, clients, and settings' },
                      'cpa': { permissions: 10, description: 'Full client management access' },
                      'manager': { permissions: 8, description: 'Oversee projects and team' },
                      'senior-accountant': { permissions: 8, description: 'Advanced accounting tasks' },
                      'staff': { permissions: 6, description: 'Standard team member access' },
                      'accountant': { permissions: 6, description: 'Core accounting functions' },
                      'bookkeeper': { permissions: 5, description: 'Basic bookkeeping tasks' },
                      'tax-specialist': { permissions: 7, description: 'Tax preparation and filing' },
                    };
                    const info = roleInfo[role.id] || { permissions: 5, description: 'Standard access' };
                    
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                            isSelected
                              ? 'bg-purple-600'
                              : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={cn('w-2 h-2 rounded-full', roleColors.badge)} />
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {role.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {info.permissions} permissions • {info.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedRole && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <p className="text-sm text-purple-900 dark:text-purple-100">
                      <strong>{selectedRole.name}</strong> - This role determines what actions this team member can perform.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Billing Cycle - Only show for new members */}
        {!isEditMode && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Billing & Subscription
            </h4>

            {/* Seat Availability Warning - Seamless Purchase Flow */}
            {hasNoSeats && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      No Available Seats
                    </h5>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      Purchase seats now to continue inviting {name || 'this team member'}.
                    </p>
                    
                    {/* Quick Purchase Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          // Handle Stripe purchase for monthly seat
                          alert('Opening Stripe checkout for Monthly seat ($65/month)...');
                          // After successful purchase, seat count will be updated
                        }}
                        className="p-3 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-lg hover:border-purple-500 transition-all text-left"
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Purchase</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          $65<span className="text-xs font-normal">/mo</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Monthly Seat</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          // Handle Stripe purchase for yearly seat
                          alert('Opening Stripe checkout for Yearly seat ($540/year = $45/month)...');
                          // After successful purchase, seat count will be updated
                        }}
                        className="p-3 bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-lg hover:border-green-500 transition-all text-left relative"
                      >
                        <Badge className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-xs px-1.5 py-0.5">
                          Save 15%
                        </Badge>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Purchase</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          $45<span className="text-xs font-normal">/mo</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yearly Seat</p>
                      </button>
                    </div>
                    
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      💳 Secure payment via Stripe • Instant activation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLowOnSeats && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Low on Seats
                    </h5>
                    <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <p>You're running low on seats:</p>
                      <ul className="text-xs space-y-0.5 ml-4">
                        <li>• Monthly: {availableMonthlySeats} remaining</li>
                        <li>• Yearly: {availableYearlySeats} remaining</li>
                      </ul>
                      <p className="text-xs mt-2">Consider purchasing more to avoid interruptions.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Seats Display */}
            {!hasNoSeats && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-1">
                  <strong>Available Seats:</strong>
                </p>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
                  <div>• Monthly: {availableMonthlySeats} seat{availableMonthlySeats === 1 ? '' : 's'}</div>
                  <div>• Yearly: {availableYearlySeats} seat{availableYearlySeats === 1 ? '' : 's'}</div>
                </div>
              </div>
            )}

            {/* Billing Cycle Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Choose Billing Cycle <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  disabled={hasNoMonthlySeats}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left relative',
                    hasNoMonthlySeats && 'opacity-50 cursor-not-allowed',
                    billingCycle === 'monthly'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      billingCycle === 'monthly'
                        ? 'bg-purple-600'
                        : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                    )}>
                      {billingCycle === 'monthly' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        Monthly
                      </h6>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        $65<span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Billed monthly • Cancel anytime
                      </p>
                      {hasNoMonthlySeats ? (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">
                            No monthly seats available
                          </p>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Opening Stripe checkout for Monthly seat ($65/month)...');
                            }}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline cursor-pointer"
                          >
                            Purchase Monthly Seat
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {availableMonthlySeats} seat{availableMonthlySeats === 1 ? '' : 's'} available
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBillingCycle('yearly')}
                  disabled={hasNoYearlySeats}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left relative',
                    hasNoYearlySeats && 'opacity-50 cursor-not-allowed',
                    billingCycle === 'yearly'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  )}
                >
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                      Save 15%
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      billingCycle === 'yearly'
                        ? 'bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                    )}>
                      {billingCycle === 'yearly' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        Yearly
                      </h6>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        $45<span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        $540/year • Save $240 annually
                      </p>
                      {hasNoYearlySeats ? (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">
                            No yearly seats available
                          </p>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Opening Stripe checkout for Yearly seat ($540/year = $45/month)...');
                            }}
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium underline cursor-pointer"
                          >
                            Purchase Yearly Seat (Save 15%)
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {availableYearlySeats} seat{availableYearlySeats === 1 ? '' : 's'} available
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Access Assignment */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Client Access
          </h4>
          
          {/* Instructional Message */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> While roles define what actions users can perform, client access controls which clients they can see. 
              You can customize client access for each team member individually, regardless of their role.
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Step 1: All Clients vs Assigned Clients Only */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Client Access Mode <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setClientAccessMode('all')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    clientAccessMode === 'all'
                      ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
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
                  onClick={() => setClientAccessMode('assigned')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    clientAccessMode === 'assigned'
                      ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
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
                      onClick={() => setAssignmentMethod('groups')}
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
                      onClick={() => setAssignmentMethod('individual')}
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
              </>
            )}

            {/* Client Group Selection */}
            {clientAccessMode === 'assigned' && assignmentMethod === 'groups' && (
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
            {clientAccessMode === 'assigned' && assignmentMethod === 'individual' && (
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

            {/* Info about client access */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>Note:</strong> Client access determines which clients this team member can see and work with. 
                Their role determines what actions they can perform on those clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        >
          <Save className="w-4 h-4" />
          {isEditMode ? 'Save Changes' : 'Add Team Member'}
        </Button>
      </div>
    </div>
  );
}