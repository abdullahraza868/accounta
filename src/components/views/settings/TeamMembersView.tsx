import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Search, LayoutGrid, List, Mail, Send, Edit, Power, ExternalLink, Clock, Shield, FlipHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { EditTeamMemberInline } from '../../company-settings-tabs/EditTeamMemberInline';

// Mock data for roles
const AVAILABLE_ROLES = [
  { id: 'admin', name: 'Admin', color: 'purple', isDefault: false },
  { id: 'senior-accountant', name: 'Senior Accountant', color: 'blue', isDefault: false },
  { id: 'accountant', name: 'Accountant', color: 'green', isDefault: false },
  { id: 'bookkeeper', name: 'Bookkeeper', color: 'yellow', isDefault: false },
  { id: 'tax-specialist', name: 'Tax Specialist', color: 'blue', isDefault: false },
  { id: 'staff', name: 'Staff', color: 'gray', isDefault: true },
];

// Mock data for client groups
const CLIENT_GROUPS = [
  { id: 'group-1', name: 'Enterprise Clients', clientCount: 15 },
  { id: 'group-2', name: 'Small Business', clientCount: 32 },
  { id: 'group-3', name: 'Non-Profit Organizations', clientCount: 8 },
  { id: 'group-4', name: 'Tech Startups', clientCount: 12 },
  { id: 'group-5', name: 'Retail Clients', clientCount: 20 },
];

// Mock data for individual clients
const CLIENTS = [
  { id: 'client-1', name: 'Acme Corporation', groupId: 'group-1' },
  { id: 'client-2', name: 'TechStart Inc.', groupId: 'group-4' },
  { id: 'client-3', name: 'Green Valley NGO', groupId: 'group-3' },
  { id: 'client-4', name: 'Main Street Bakery', groupId: 'group-2' },
  { id: 'client-5', name: 'Global Enterprises Ltd', groupId: 'group-1' },
  { id: 'client-6', name: 'Local Coffee Shop', groupId: 'group-5' },
  { id: 'client-7', name: 'Innovation Labs', groupId: 'group-4' },
  { id: 'client-8', name: 'Community Foundation', groupId: 'group-3' },
  { id: 'client-9', name: 'Downtown Boutique', groupId: 'group-5' },
  { id: 'client-10', name: 'Smith & Associates', groupId: 'group-2' },
];

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Inactive';
  subscriptionType: 'Monthly' | 'Yearly' | 'None';
  lastActive: string;
  avatar?: string;
  // Client assignment
  clientAccessMode?: 'all' | 'groups' | 'individual';
  assignedClientGroups?: string[];
  assignedClients?: string[];
};

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@accountingfirm.com',
    role: 'Admin',
    status: 'Active',
    subscriptionType: 'Yearly',
    lastActive: '2 hours ago',
    clientAccessMode: 'all',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@accountingfirm.com',
    role: 'Senior Accountant',
    status: 'Active',
    subscriptionType: 'Yearly',
    lastActive: '1 day ago',
    clientAccessMode: 'groups',
    assignedClientGroups: ['group-1', 'group-2'], // Enterprise Clients (15) + Small Business (32) = 47 clients
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@accountingfirm.com',
    role: 'Accountant',
    status: 'Invited',
    subscriptionType: 'Monthly',
    lastActive: 'Never',
    clientAccessMode: 'individual',
    assignedClients: ['Acme Corp', 'Tech Startup', 'Retail LLC'],
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@accountingfirm.com',
    role: 'Bookkeeper',
    status: 'Active',
    subscriptionType: 'Monthly',
    lastActive: '5 minutes ago',
    clientAccessMode: 'individual',
    assignedClients: ['Restaurant Group', 'Medical Practice'],
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@accountingfirm.com',
    role: 'Tax Specialist',
    status: 'Inactive',
    subscriptionType: 'None',
    lastActive: '2 months ago',
    clientAccessMode: 'individual',
    assignedClients: ['Law Firm', 'Manufacturing Co'],
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@accountingfirm.com',
    role: 'Admin',
    status: 'Active',
    subscriptionType: 'Yearly',
    lastActive: '30 minutes ago',
    clientAccessMode: 'all',
  },
];

const availableRoles = [
  'Admin',
  'Senior Accountant',
  'Accountant',
  'Bookkeeper',
  'Tax Specialist',
  'Viewer'
];

// Mock client groups and clients for assignment
const availableClientGroups = [
  'Tax Clients',
  'Advisory Clients',
  'Audit Clients',
  'Bookkeeping Clients',
  'Payroll Clients'
];

const availableClients = [
  'Acme Corp',
  'Tech Startup',
  'Retail LLC',
  'Restaurant Group',
  'Medical Practice',
  'Law Firm',
  'Manufacturing Co',
  'Real Estate Inc',
  'Consulting Group',
  'Financial Services'
];

// Role permissions mapping
const rolePermissions: Record<string, string[]> = {
  'Admin': [
    'Full system access',
    'Manage team members',
    'Billing & subscription management',
    'Client management',
    'All HR functions',
    'Settings & configuration'
  ],
  'Senior Accountant': [
    'Client management',
    'Financial reporting',
    'Approve transactions',
    'Team oversight',
    'Document management'
  ],
  'Accountant': [
    'Client management',
    'Transaction processing',
    'Financial reporting',
    'Document management'
  ],
  'Bookkeeper': [
    'Transaction entry',
    'Basic reporting',
    'Document upload',
    'Client communication'
  ],
  'Tax Specialist': [
    'Tax preparation',
    'Tax filing',
    'Client tax documents',
    'Tax reporting'
  ],
  'Viewer': [
    'View-only access',
    'Basic reporting',
    'Export data'
  ]
};

export function TeamMembersView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'card' | 'table'>('card');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Check URL for action parameter (e.g., ?action=invite)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invite') {
      setIsCreatingNew(true); // Use inline creation instead of dialog
      // Clean up URL parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Invited' | 'Inactive'>('All');
  const [emailError, setEmailError] = useState('');
  
  // NEW: Inline editing state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Seat management - tracked separately by billing cycle
  // Set to 0 to test "no seats" workflow, or positive numbers for normal operation
  const [availableMonthlySeats, setAvailableMonthlySeats] = useState(4);
  const [availableYearlySeats, setAvailableYearlySeats] = useState(2);
  const totalMonthlySeats = 10;
  const totalYearlySeats = 5;
  const usedMonthlySeats = teamMembers.filter(m => m.status === 'Active' && m.subscriptionType === 'Monthly').length;
  const usedYearlySeats = teamMembers.filter(m => m.status === 'Active' && m.subscriptionType === 'Yearly').length;
  const reservedMonthlySeats = teamMembers.filter(m => m.status === 'Invited' && m.subscriptionType === 'Monthly').length;
  const reservedYearlySeats = teamMembers.filter(m => m.status === 'Invited' && m.subscriptionType === 'Yearly').length;
  
  // Legacy totals for compatibility
  const availableSeats = availableMonthlySeats + availableYearlySeats;
  const totalSeats = totalMonthlySeats + totalYearlySeats;
  const usedSeats = usedMonthlySeats + usedYearlySeats;
  const reservedSeats = reservedMonthlySeats + reservedYearlySeats;

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    subscriptionType: 'Monthly' as 'Monthly' | 'Yearly',
    clientAccessMode: 'all' as 'all' | 'groups' | 'individual',
    assignedClientGroups: [] as string[],
    assignedClients: [] as string[],
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    subscriptionType: 'Monthly' as 'Monthly' | 'Yearly',
    clientAccessMode: 'all' as 'all' | 'groups' | 'individual',
    assignedClientGroups: [] as string[],
    assignedClients: [] as string[],
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (email: string, isInvite: boolean = true) => {
    if (isInvite) {
      setInviteForm({ ...inviteForm, email });
    } else {
      setEditForm({ ...editForm, email });
    }
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = (member.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = teamMembers.filter(m => m.status === 'Active').length;
  const invitedCount = teamMembers.filter(m => m.status === 'Invited').length;
  const inactiveCount = teamMembers.filter(m => m.status === 'Inactive').length;

  const handleInvite = () => {
    if (!validateEmail(inviteForm.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const newMember: TeamMember = {
      id: String(Date.now()),
      name: `${inviteForm.firstName} ${inviteForm.lastName}`,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'Invited',
      subscriptionType: inviteForm.subscriptionType,
      lastActive: 'Never',
      clientAccessMode: inviteForm.clientAccessMode,
      assignedClientGroups: inviteForm.assignedClientGroups,
      assignedClients: inviteForm.assignedClients,
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteDialogOpen(false);
    setInviteForm({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      subscriptionType: 'Monthly',
      clientAccessMode: 'all',
      assignedClientGroups: [],
      assignedClients: [],
    });
    setEmailError('');
    
    const cost = inviteForm.subscriptionType === 'Yearly' ? '$45/month (billed annually)' : '$65/month';
    toast.success(`Invitation sent to ${newMember.name}`, {
      description: `${inviteForm.subscriptionType} subscription (${cost}) will start when they accept.`,
    });
  };

  const handleStatusChange = (member: TeamMember, action: 'activate' | 'deactivate') => {
    setSelectedMember(member);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!selectedMember || !actionType) return;

    setTeamMembers(members =>
      members.map(m =>
        m.id === selectedMember.id
          ? {
              ...m,
              status: actionType === 'activate' ? 'Active' : 'Inactive',
              subscriptionType: actionType === 'activate' ? 'Monthly' : 'None',
            }
          : m
      )
    );

    toast.success(
      actionType === 'activate'
        ? `${selectedMember.name} has been activated`
        : `${selectedMember.name} has been deactivated`,
      {
        description:
          actionType === 'activate'
            ? 'Monthly subscription ($65/mo) will begin immediately.'
            : 'Subscription stopped. User cannot log in.',
      }
    );

    setConfirmDialogOpen(false);
    setSelectedMember(null);
    setActionType(null);
  };

  const handleEdit = (member: TeamMember) => {
    // Use inline editor instead of dialog
    setEditingMember(member);
  };

  const handleSaveEdit = () => {
    if (!selectedMember) return;
    
    if (!validateEmail(editForm.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setTeamMembers(members =>
      members.map(m =>
        m.id === selectedMember.id
          ? {
              ...m,
              name: `${editForm.firstName} ${editForm.lastName}`,
              email: editForm.email,
              role: editForm.role,
              subscriptionType: editForm.subscriptionType,
              clientAccessMode: editForm.clientAccessMode,
              assignedClientGroups: editForm.assignedClientGroups,
              assignedClients: editForm.assignedClients,
            }
          : m
      )
    );

    toast.success(`${editForm.firstName} ${editForm.lastName}'s details updated successfully`);
    setEditDialogOpen(false);
    setSelectedMember(null);
    setEmailError('');
  };

  const handleSendLogin = (member: TeamMember) => {
    toast.success(`Login credentials sent to ${member.email}`);
  };

  const toggleCardFlip = (memberId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    const variants = {
      Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      Invited: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      Inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    };

    return (
      <Badge variant="outline" className={cn('border', variants[status])}>
        {status}
      </Badge>
    );
  };

  const getSubscriptionBadge = (type: TeamMember['subscriptionType']) => {
    if (type === 'None') {
      return <span className="text-sm text-gray-400 dark:text-gray-500">—</span>;
    }

    const variants = {
      Monthly: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      Yearly: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    };

    const prices = {
      Monthly: '$65/mo',
      Yearly: '$45/mo',
    };

    return (
      <Badge variant="outline" className={cn('border text-xs whitespace-nowrap', variants[type as 'Monthly' | 'Yearly'])}>
        {type} <span className="ml-0.5 opacity-70">({prices[type as 'Monthly' | 'Yearly']})</span>
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientAccessSummary = (member: TeamMember) => {
    if (member.clientAccessMode === 'all') {
      return 'All Clients';
    } else if (member.clientAccessMode === 'groups') {
      const groupCount = member.assignedClientGroups?.length || 0;
      // Calculate total clients from groups
      const totalClients = member.assignedClientGroups?.reduce((total, groupId) => {
        const group = CLIENT_GROUPS.find(g => g.id === groupId);
        return total + (group?.clientCount || 0);
      }, 0) || 0;
      return `${totalClients} clients (${groupCount} ${groupCount === 1 ? 'group' : 'groups'})`;
    } else if (member.clientAccessMode === 'individual') {
      const clientCount = member.assignedClients?.length || 0;
      return `${clientCount} ${clientCount === 1 ? 'client' : 'clients'}`;
    }
    return 'No Access';
  };
  
  // NEW: Handlers for inline editor
  const handleInviteClick = () => {
    setIsCreatingNew(true);
  };
  
  const handleCancelInlineEdit = () => {
    setEditingMember(null);
    setIsCreatingNew(false);
  };
  
  const handleSaveInlineEdit = (memberData: any) => {
    // Convert firstName + lastName to name for storage
    const name = `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim();
    const role = AVAILABLE_ROLES.find(r => r.id === memberData.roleId)?.name || memberData.roleName || 'Staff';
    
    if (editingMember) {
      // Editing existing member
      setTeamMembers(members =>
        members.map(m =>
          m.id === editingMember.id
            ? { 
                ...m,
                name,
                email: memberData.email,
                role,
                clientAccessMode: memberData.clientAccessMode,
                assignedClientGroups: memberData.assignedClientGroups,
                assignedClients: memberData.assignedClients,
              }
            : m
        )
      );
      toast.success(`${name}'s details updated successfully`);
    } else {
      // Creating new member - reserve a seat of the appropriate type
      const billingCycle = memberData.billingCycle || 'monthly';
      const subscriptionType = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
      const price = billingCycle === 'yearly' ? 45 : 65;
      
      const newMember: TeamMember = {
        id: String(Date.now()),
        name,
        email: memberData.email,
        role,
        status: 'Invited' as const,
        subscriptionType,
        lastActive: 'Never',
        clientAccessMode: memberData.clientAccessMode,
        assignedClientGroups: memberData.assignedClientGroups,
        assignedClients: memberData.assignedClients,
      };
      setTeamMembers([...teamMembers, newMember]);
      
      // Reserve the appropriate seat type
      if (billingCycle === 'yearly') {
        setAvailableYearlySeats(prev => prev - 1);
      } else {
        setAvailableMonthlySeats(prev => prev - 1);
      }
      
      toast.success(`Invitation sent to ${name}`, {
        description: `${subscriptionType} subscription at $${price}/month will start when they accept the invitation.`,
      });
    }
    
    setEditingMember(null);
    setIsCreatingNew(false);
  };

  // Show inline editor when editing or creating
  if (editingMember || isCreatingNew) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
          <div className="max-w-[1400px] mx-auto p-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={handleCancelInlineEdit}
              className="mb-4 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team Members
            </Button>
            
            <EditTeamMemberInline
              member={editingMember ? {
                ...editingMember,
                firstName: editingMember.name.split(' ')[0] || '',
                lastName: editingMember.name.split(' ').slice(1).join(' ') || '',
                roleId: AVAILABLE_ROLES.find(r => r.name === editingMember.role)?.id || 'staff',
                roleName: editingMember.role,
                roleColor: AVAILABLE_ROLES.find(r => r.name === editingMember.role)?.color || 'gray',
                subscriptionCost: editingMember.subscriptionType === 'Yearly' ? 45 : 65,
              } : undefined}
              onCancel={handleCancelInlineEdit}
              onSave={handleSaveInlineEdit}
              availableRoles={AVAILABLE_ROLES}
              clientGroups={CLIENT_GROUPS}
              clients={CLIENTS}
              existingEmails={teamMembers.map(m => m.email)}
              availableMonthlySeats={availableMonthlySeats}
              availableYearlySeats={availableYearlySeats}
              onPurchaseSeats={() => window.location.href = '/settings/billing'}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 mb-2">Team Members</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your team members, subscriptions, and access permissions
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              asChild
            >
              <a href="#internal">
                <ExternalLink className="w-4 h-4" />
                Internal Mode
              </a>
            </Button>
          </div>

          {/* Stats Cards - Now Clickable Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <button
              onClick={() => setStatusFilter('All')}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter === 'All' 
                  ? 'border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{teamMembers.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter('Active')}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter === 'Active' 
                  ? 'border-green-500 dark:border-green-500 ring-2 ring-green-500/20' 
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{activeCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Power className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter('Invited')}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter === 'Invited' 
                  ? 'border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20' 
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Invites</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{invitedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter('Inactive')}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter === 'Inactive' 
                  ? 'border-gray-500 dark:border-gray-500 ring-2 ring-gray-500/20' 
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive Users</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{inactiveCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Power className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </button>

            {/* Seat Availability Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Seats</p>
                  <p className={cn(
                    "text-2xl font-semibold",
                    availableSeats === 0 ? "text-red-600 dark:text-red-400" :
                    availableSeats <= 2 ? "text-amber-600 dark:text-amber-400" :
                    "text-blue-600 dark:text-blue-400"
                  )}>
                    {availableSeats} / {totalSeats}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  availableSeats === 0 ? "bg-red-100 dark:bg-red-900/30" :
                  availableSeats <= 2 ? "bg-amber-100 dark:bg-amber-900/30" :
                  "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  <UserPlus className={cn(
                    "w-6 h-6",
                    availableSeats === 0 ? "text-red-600 dark:text-red-400" :
                    availableSeats <= 2 ? "text-amber-600 dark:text-amber-400" :
                    "text-blue-600 dark:text-blue-400"
                  )} />
                </div>
              </div>
              {/* Breakdown by billing cycle */}
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Monthly:</span>
                  <span className="font-medium">{availableMonthlySeats} / {totalMonthlySeats}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yearly:</span>
                  <span className="font-medium">{availableYearlySeats} / {totalYearlySeats}</span>
                </div>
              </div>
              
              {/* TEST CONTROLS - Remove in production */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">🧪 Test Controls:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAvailableMonthlySeats(0);
                      setAvailableYearlySeats(0);
                    }}
                    className="flex-1 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    Set All to 0
                  </button>
                  <button
                    onClick={() => {
                      setAvailableMonthlySeats(4);
                      setAvailableYearlySeats(2);
                    }}
                    className="flex-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {availableSeats === 0 && (
                <Button
                  onClick={() => window.location.href = '/settings/billing'}
                  size="sm"
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                >
                  Purchase Seats
                </Button>
              )}
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* View Toggle */}
                  <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewType('table')}
                      className={cn(
                        'flex items-center gap-1 rounded px-3 py-1.5 transition-all text-sm',
                        viewType === 'table'
                          ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                    <button
                      onClick={() => setViewType('card')}
                      className={cn(
                        'flex items-center gap-1 rounded px-3 py-1.5 transition-all text-sm',
                        viewType === 'card'
                          ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                      title="Card View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Card</span>
                    </button>
                  </div>
                </div>

                {/* Invite Button */}
                <Button
                  onClick={handleInviteClick}
                  className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Team Member
                </Button>
              </div>
            </div>

            {/* Table View */}
            {viewType === 'table' && (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Email Address</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Client Access</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Subscription</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Last Active</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                          member.status === 'Inactive' && 'opacity-50'
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {getInitials(member.name)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{getClientAccessSummary(member)}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>{getSubscriptionBadge(member.subscriptionType)}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {member.lastActive}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendLogin(member)}
                              className="h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Send Login"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              className="h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {member.status === 'Active' ? (
                              <button
                                onClick={() => handleStatusChange(member, 'deactivate')}
                                className="flex flex-col items-center justify-center h-12 px-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Deactivate User - Turn OFF"
                              >
                                <Power className="w-4 h-4" />
                                <span className="text-[9px] font-medium mt-0.5">OFF</span>
                              </button>
                            ) : member.status === 'Inactive' ? (
                              <button
                                onClick={() => handleStatusChange(member, 'activate')}
                                className="flex flex-col items-center justify-center h-12 px-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 transition-colors rounded hover:bg-green-50 dark:hover:bg-green-950/20"
                                title="Activate User - Turn ON"
                              >
                                <Power className="w-4 h-4" />
                                <span className="text-[9px] font-medium mt-0.5">ON</span>
                              </button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Card View */}
            {viewType === 'card' && (
              <div className="p-6">
                {/* Flip Cards Hint */}
                <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 flex items-center gap-2">
                  <FlipHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    <strong>Tip:</strong> Click on any card to flip it and view permissions for that role
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMembers.map((member) => {
                    const isFlipped = flippedCards.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className="relative h-[310px] cursor-pointer"
                        style={{ perspective: '1000px' }}
                        onClick={() => toggleCardFlip(member.id)}
                      >
                        <div
                          className="relative w-full h-full transition-transform duration-500"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }}
                        >
                          {/* Front of Card */}
                          <div
                            className="absolute w-full h-full bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                            }}
                          >
                            {/* Card Header */}
                            <div className={cn(
                              "flex items-start gap-3 mb-4",
                              member.status === 'Inactive' && 'opacity-50'
                            )}>
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                                {getInitials(member.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">{member.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1.5">{member.email}</p>
                                {/* ROLE BADGE */}
                                <div className="flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{member.role}</span>
                                </div>
                              </div>
                              {getStatusBadge(member.status)}
                            </div>

                            {/* Card Details */}
                            <div className={cn(
                              "space-y-3 mb-4",
                              member.status === 'Inactive' && 'opacity-50'
                            )}>
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Subscription</span>
                                <div className="flex-shrink-0">
                                  {getSubscriptionBadge(member.subscriptionType)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Client Access</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{getClientAccessSummary(member)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Last Active</span>
                                <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{member.lastActive}</span>
                              </div>
                            </div>

                            {/* Card Actions */}
                            <div 
                              className="flex gap-1.5 pt-3 pb-9 border-t border-gray-200 dark:border-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendLogin(member)}
                                className={cn(
                                  "flex-1 gap-1 text-xs px-2 min-w-0",
                                  member.status === 'Inactive' && 'opacity-50'
                                )}
                              >
                                <Send className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Send</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(member)}
                                className={cn(
                                  "flex-1 gap-1 text-xs px-2 min-w-0",
                                  member.status === 'Inactive' && 'opacity-50'
                                )}
                              >
                                <Edit className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Edit</span>
                              </Button>
                              {member.status === 'Active' ? (
                                <button
                                  onClick={() => handleStatusChange(member, 'deactivate')}
                                  className="flex flex-col items-center justify-center px-2 py-1 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950/30 rounded text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 hover:border-green-300 dark:hover:border-green-600 transition-all flex-shrink-0"
                                  title="Active User - Click to Deactivate"
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span className="text-[8px] font-medium mt-0.5 leading-none">ON</span>
                                </button>
                              ) : member.status === 'Inactive' ? (
                                <button
                                  onClick={() => handleStatusChange(member, 'activate')}
                                  className="flex flex-col items-center justify-center px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800 transition-all flex-shrink-0"
                                  title="Inactive User - Click to Activate"
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span className="text-[8px] font-medium mt-0.5 leading-none">OFF</span>
                                </button>
                              ) : null}
                            </div>
                            
                            {/* Permissions Indicator - Positioned below actions with proper spacing */}
                            <div className={cn(
                              "absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:opacity-100 transition-opacity pointer-events-none",
                              member.status === 'Active' ? 'opacity-100' : 'opacity-60'
                            )}
                            >
                              <FlipHorizontal className="w-3.5 h-3.5" />
                              <span>Permissions</span>
                            </div>
                          </div>

                          {/* Back of Card - Permissions */}
                          <div
                            className="absolute w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl border-2 border-purple-300 dark:border-purple-700 p-5 flex flex-col"
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                            }}
                          >
                            {(() => {
                              const permissionCount = rolePermissions[member.role]?.length || 0;
                              
                              // Dynamic sizing based on content amount
                              const getLayoutClasses = () => {
                                if (permissionCount <= 4) {
                                  return {
                                    gridCols: 'grid-cols-1',
                                    textSize: 'text-sm',
                                    gap: 'gap-2',
                                    checkSize: 'text-base',
                                  };
                                } else if (permissionCount <= 8) {
                                  return {
                                    gridCols: 'grid-cols-2',
                                    textSize: 'text-xs',
                                    gap: 'gap-x-3 gap-y-2',
                                    checkSize: 'text-sm',
                                  };
                                } else if (permissionCount <= 12) {
                                  return {
                                    gridCols: 'grid-cols-2',
                                    textSize: 'text-[11px]',
                                    gap: 'gap-x-3 gap-y-1.5',
                                    checkSize: 'text-xs',
                                  };
                                } else {
                                  return {
                                    gridCols: 'grid-cols-2',
                                    textSize: 'text-[10px]',
                                    gap: 'gap-x-2 gap-y-1',
                                    checkSize: 'text-[11px]',
                                  };
                                }
                              };

                              const layout = getLayoutClasses();

                              return (
                                <>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{member.role} Permissions</h3>
                                  </div>
                                  <div className="flex-1 min-h-0">
                                    <ul className={cn('grid h-full content-start', layout.gridCols, layout.gap)}>
                                      {rolePermissions[member.role]?.map((permission, index) => (
                                        <li key={index} className={cn('flex items-start gap-1.5 leading-tight text-gray-700 dark:text-gray-300', layout.textSize)}>
                                          <span className={cn('text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0', layout.checkSize)}>✓</span>
                                          <span className="break-words">{permission}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="mt-2 text-right">
                                    <p className="text-[9px] text-purple-700 dark:text-purple-300 italic opacity-70">
                                      Click to flip back
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredMembers.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No team members found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Team Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[550px]" aria-describedby="invite-member-description">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription id="invite-member-description">
              Send an invitation to a new team member. They'll receive an email to set up their account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  placeholder="John"
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  placeholder="Doe"
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => handleEmailChange(e.target.value, true)}
                placeholder="john.doe@company.com"
                className={cn(
                  "bg-gray-50 dark:bg-gray-900",
                  emailError && "border-red-500 dark:border-red-500"
                )}
              />
              {emailError ? (
                <p className="text-xs text-red-600 dark:text-red-400">{emailError}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">This will be their login email</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setInviteForm({ ...inviteForm, role })}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all text-sm',
                      inviteForm.role === role
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        "w-3.5 h-3.5 flex-shrink-0",
                        inviteForm.role === role ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
                      )} />
                      <span className="font-medium flex-1">
                        {role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Access Assignment */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Label>
                Client Access <span className="text-red-500">*</span>
              </Label>
              
              {/* Access Mode Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setInviteForm({ ...inviteForm, clientAccessMode: 'all', assignedClientGroups: [], assignedClients: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    inviteForm.clientAccessMode === 'all'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">All Clients</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full access</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setInviteForm({ ...inviteForm, clientAccessMode: 'groups', assignedClients: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    inviteForm.clientAccessMode === 'groups'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">Client Groups</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">By group</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setInviteForm({ ...inviteForm, clientAccessMode: 'individual', assignedClientGroups: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    inviteForm.clientAccessMode === 'individual'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">Individual</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Specific clients</div>
                </button>
              </div>

              {/* Client Groups Selection */}
              {inviteForm.clientAccessMode === 'groups' && (
                <div className="space-y-2 mt-3">
                  <Label className="text-sm">Select Client Groups</Label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                    {availableClientGroups.map((group) => (
                      <label
                        key={group}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={inviteForm.assignedClientGroups.includes(group)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInviteForm({
                                ...inviteForm,
                                assignedClientGroups: [...inviteForm.assignedClientGroups, group]
                              });
                            } else {
                              setInviteForm({
                                ...inviteForm,
                                assignedClientGroups: inviteForm.assignedClientGroups.filter(g => g !== group)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{group}</span>
                      </label>
                    ))}
                  </div>
                  {inviteForm.assignedClientGroups.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {inviteForm.assignedClientGroups.length} group{inviteForm.assignedClientGroups.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Individual Clients Selection */}
              {inviteForm.clientAccessMode === 'individual' && (
                <div className="space-y-2 mt-3">
                  <Label className="text-sm">Select Clients</Label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                    {availableClients.map((client) => (
                      <label
                        key={client}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={inviteForm.assignedClients.includes(client)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInviteForm({
                                ...inviteForm,
                                assignedClients: [...inviteForm.assignedClients, client]
                              });
                            } else {
                              setInviteForm({
                                ...inviteForm,
                                assignedClients: inviteForm.assignedClients.filter(c => c !== client)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{client}</span>
                      </label>
                    ))}
                  </div>
                  {inviteForm.assignedClients.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {inviteForm.assignedClients.length} client{inviteForm.assignedClients.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionType">
                Subscription Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInviteForm({ ...inviteForm, subscriptionType: 'Monthly' })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    inviteForm.subscriptionType === 'Monthly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">$65</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                </button>

                <button
                  type="button"
                  onClick={() => setInviteForm({ ...inviteForm, subscriptionType: 'Yearly' })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all relative',
                    inviteForm.subscriptionType === 'Yearly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Save 30%
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Yearly</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">$45</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">per month, billed annually</div>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> The subscription will be added to your account when the user accepts the invitation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setInviteDialogOpen(false);
              setEmailError('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.role || !!emailError}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]" aria-describedby="edit-member-description">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription id="edit-member-description">
              Update team member details and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editFirstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="John"
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editLastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Doe"
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEmailChange(e.target.value, false)}
                placeholder="john.doe@company.com"
                className={cn(
                  "bg-gray-50 dark:bg-gray-900",
                  emailError && "border-red-500 dark:border-red-500"
                )}
              />
              {emailError ? (
                <p className="text-xs text-red-600 dark:text-red-400">{emailError}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">This will be their login email</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role })}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all text-sm',
                      editForm.role === role
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        "w-3.5 h-3.5 flex-shrink-0",
                        editForm.role === role ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
                      )} />
                      <span className="font-medium flex-1">
                        {role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Access Assignment */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Label>
                Client Access <span className="text-red-500">*</span>
              </Label>
              
              {/* Access Mode Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, clientAccessMode: 'all', assignedClientGroups: [], assignedClients: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    editForm.clientAccessMode === 'all'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">All Clients</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full access</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, clientAccessMode: 'groups', assignedClients: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    editForm.clientAccessMode === 'groups'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">Client Groups</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">By group</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, clientAccessMode: 'individual', assignedClientGroups: [] })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all text-sm',
                    editForm.clientAccessMode === 'individual'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="font-medium">Individual</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Specific clients</div>
                </button>
              </div>

              {/* Client Groups Selection */}
              {editForm.clientAccessMode === 'groups' && (
                <div className="space-y-2 mt-3">
                  <Label className="text-sm">Select Client Groups</Label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                    {availableClientGroups.map((group) => (
                      <label
                        key={group}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.assignedClientGroups.includes(group)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                assignedClientGroups: [...editForm.assignedClientGroups, group]
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                assignedClientGroups: editForm.assignedClientGroups.filter(g => g !== group)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{group}</span>
                      </label>
                    ))}
                  </div>
                  {editForm.assignedClientGroups.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {editForm.assignedClientGroups.length} group{editForm.assignedClientGroups.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Individual Clients Selection */}
              {editForm.clientAccessMode === 'individual' && (
                <div className="space-y-2 mt-3">
                  <Label className="text-sm">Select Clients</Label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                    {availableClients.map((client) => (
                      <label
                        key={client}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.assignedClients.includes(client)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                assignedClients: [...editForm.assignedClients, client]
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                assignedClients: editForm.assignedClients.filter(c => c !== client)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{client}</span>
                      </label>
                    ))}
                  </div>
                  {editForm.assignedClients.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {editForm.assignedClients.length} client{editForm.assignedClients.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSubscriptionType">
                Subscription Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, subscriptionType: 'Monthly' })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    editForm.subscriptionType === 'Monthly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">$65</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, subscriptionType: 'Yearly' })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all relative',
                    editForm.subscriptionType === 'Yearly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Save 30%
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Yearly</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">$45</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">per month, billed annually</div>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setEmailError('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.role || !!emailError}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby="confirm-member-status-description">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'activate' ? 'Activate User' : 'Deactivate User'}
            </DialogTitle>
            <DialogDescription id="confirm-member-status-description">
              {actionType === 'activate'
                ? `Are you sure you want to activate ${selectedMember?.name}?`
                : `Are you sure you want to deactivate ${selectedMember?.name}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionType === 'activate' ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  This will:
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                  <li>Allow user to log in immediately</li>
                  <li>Start Monthly subscription ($65/month)</li>
                  <li>Add charges to your next invoice</li>
                </ul>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  This will:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>Prevent user from logging in</li>
                  <li>Stop subscription billing</li>
                  <li>Retain all user data for reactivation</li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className={
                actionType === 'activate'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {actionType === 'activate' ? 'Activate User' : 'Deactivate User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}