import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  DollarSign,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '../ui/utils';
import { EditTeamMemberInline } from './EditTeamMemberInline';
import { InviteTeamMemberDialog } from '../InviteTeamMemberDialog';
import { toast } from 'sonner@2.0.3';

type TeamMemberStatus = 'active' | 'inactive' | 'pending';

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
  status: TeamMemberStatus;
  startDate?: string;
  avatar?: string;
  subscriptionCost: number;
  hasAddOns?: boolean;
  // Client assignment
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

type TeamMembersTabProps = {
  sharedRoles: Role[];
  sharedClientGroups: ClientGroup[];
  sharedClients: Client[];
};

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@firm.com',
    phone: '(555) 123-4567',
    jobTitle: 'Managing Partner',
    department: 'Leadership',
    roleId: 'owner',
    roleName: 'Owner/Admin',
    roleColor: 'purple',
    status: 'active',
    startDate: '2020-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    subscriptionCost: 99,
    clientAccessMode: 'all',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@firm.com',
    phone: '(555) 234-5678',
    jobTitle: 'Senior CPA',
    department: 'Tax',
    roleId: 'cpa',
    roleName: 'CPA / Partner',
    roleColor: 'blue',
    status: 'active',
    startDate: '2020-03-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    subscriptionCost: 79,
    clientAccessMode: 'groups',
    assignedClientGroups: ['group-1', 'group-2'],
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@firm.com',
    phone: '(555) 345-6789',
    jobTitle: 'Tax Manager',
    department: 'Tax',
    roleId: 'manager',
    roleName: 'Manager',
    roleColor: 'green',
    status: 'active',
    startDate: '2021-06-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    subscriptionCost: 59,
    clientAccessMode: 'individual',
    assignedClients: ['client-1', 'client-2', 'client-6'],
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@firm.com',
    phone: '(555) 456-7890',
    jobTitle: 'Staff Accountant',
    department: 'Audit',
    roleId: 'staff',
    roleName: 'Staff Accountant',
    roleColor: 'gray',
    status: 'active',
    startDate: '2022-09-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    subscriptionCost: 49,
    clientAccessMode: 'individual',
    assignedClients: ['client-3', 'client-8'],
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@firm.com',
    jobTitle: 'Bookkeeper',
    department: 'Bookkeeping',
    roleId: 'bookkeeper',
    roleName: 'Bookkeeper',
    roleColor: 'yellow',
    status: 'active',
    startDate: '2021-11-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    subscriptionCost: 39,
    clientAccessMode: 'groups',
    assignedClientGroups: ['group-4'],
  },
  {
    id: '6',
    firstName: 'Jessica',
    lastName: 'Williams',
    email: 'jessica.williams@firm.com',
    phone: '(555) 567-8901',
    jobTitle: 'Senior Accountant',
    department: 'Advisory',
    roleId: 'staff',
    roleName: 'Staff Accountant',
    roleColor: 'gray',
    status: 'inactive',
    startDate: '2021-03-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    subscriptionCost: 0,
    clientAccessMode: 'individual',
    assignedClients: ['client-4', 'client-7'],
  },
  {
    id: '7',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@firm.com',
    jobTitle: 'Tax Associate',
    department: 'Tax',
    roleId: 'staff',
    roleName: 'Staff Accountant',
    roleColor: 'gray',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    subscriptionCost: 49,
    clientAccessMode: 'individual',
    assignedClients: [],
  },
];

export function TeamMembersTab({ sharedRoles, sharedClientGroups, sharedClients }: TeamMembersTabProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use shared data from parent
  const AVAILABLE_ROLES = (sharedRoles && sharedRoles.length > 0) ? sharedRoles : [];
  const CLIENT_GROUPS = sharedClientGroups || [];
  const CLIENTS = sharedClients || [];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TeamMemberStatus>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Mock seat management - in real app this would come from API/context
  const [availableSeats, setAvailableSeats] = useState(4);
  const totalSeats = 10;
  const usedSeats = teamMembers.filter(m => m.status === 'active').length;
  const reservedSeats = teamMembers.filter(m => m.status === 'pending').length;
  
  // Mock payment method status - in real app this would come from API/context
  const [hasPaymentMethod, setHasPaymentMethod] = useState(true);

  // Check URL for action parameter (e.g., ?action=invite)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invite') {
      setInviteDialogOpen(true);
      // Clean up URL parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Calculate stats
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const inactiveMembers = teamMembers.filter(m => m.status === 'inactive').length;
  const pendingMembers = teamMembers.filter(m => m.status === 'pending').length;
  const totalMonthlyCost = teamMembers
    .filter(m => m.status === 'active' || m.status === 'pending')
    .reduce((sum, m) => sum + m.subscriptionCost, 0);

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    // Status filter
    if (statusFilter !== 'all' && member.status !== statusFilter) return false;
    
    // Role filter
    if (roleFilter !== 'all' && member.roleId !== roleFilter) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const email = member.email.toLowerCase();
      const jobTitle = member.jobTitle?.toLowerCase() || '';
      
      if (!fullName.includes(query) && !email.includes(query) && !jobTitle.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const handleCreateMember = () => {
    setIsCreatingMember(true);
  };

  const handleSaveNewMember = (memberData: any) => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      ...memberData,
      status: 'pending' as TeamMemberStatus,
      subscriptionCost: 49, // Default cost
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsCreatingMember(false);
  };

  const handleEditMember = (memberId: string) => {
    setEditingMemberId(memberId);
  };

  const handleSaveEditMember = (memberData: any) => {
    if (!editingMemberId) return;
    
    const updatedMembers = teamMembers.map(member =>
      member.id === editingMemberId
        ? { ...member, ...memberData }
        : member
    );
    setTeamMembers(updatedMembers);
    setEditingMemberId(null);
  };

  const handleDeleteMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.firstName} ${member.lastName} from your team? This will deactivate their account and remove their access.`
    );
    
    if (!confirmed) return;
    
    // Set to inactive instead of deleting
    const updatedMembers = teamMembers.map(m =>
      m.id === memberId ? { ...m, status: 'inactive' as TeamMemberStatus } : m
    );
    setTeamMembers(updatedMembers);
  };

  const handleResendInvite = (memberId: string) => {
    alert('Invitation email resent!');
  };

  const handleReactivate = (memberId: string) => {
    const updatedMembers = teamMembers.map(m =>
      m.id === memberId ? { ...m, status: 'active' as TeamMemberStatus } : m
    );
    setTeamMembers(updatedMembers);
  };

  // Handle team member invitation
  const handleInvite = (inviteData: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    roleId: string;
    billingCycle: 'monthly' | 'yearly';
  }) => {
    const role = AVAILABLE_ROLES.find(r => r.id === inviteData.roleId);
    if (!role) return;

    // Calculate subscription cost based on billing cycle
    const monthlyCost = inviteData.billingCycle === 'monthly' ? 65 : 45;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      firstName: inviteData.firstName,
      lastName: inviteData.lastName,
      email: inviteData.email,
      roleId: inviteData.roleId,
      roleName: role.name,
      roleColor: role.color,
      status: 'pending',
      subscriptionCost: monthlyCost,
      clientAccessMode: 'individual',
      assignedClients: [],
    };

    setTeamMembers([...teamMembers, newMember]);
    setAvailableSeats(prev => prev - 1); // Reserve a seat
  };

  // Handle purchase seats navigation
  const handlePurchaseSeats = () => {
    // Navigate to billing page
    navigate('/settings/billing');
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

  const getStatusBadge = (status: TeamMemberStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
            <UserX className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getClientAccessSummary = (member: TeamMember) => {
    if (member.clientAccessMode === 'all') {
      return 'All Clients';
    } else if (member.clientAccessMode === 'groups') {
      const groupCount = member.assignedClientGroups?.length || 0;
      return `${groupCount} Client ${groupCount === 1 ? 'Group' : 'Groups'}`;
    } else {
      const clientCount = member.assignedClients?.length || 0;
      return `${clientCount} ${clientCount === 1 ? 'Client' : 'Clients'}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* DEBUG PANEL - Remove in production */}
      {!isCreatingMember && !editingMemberId && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">🧪 Testing Panel (Remove in Production)</p>
              <div className="flex gap-4 text-xs text-amber-800 dark:text-amber-200">
                <div>Available Seats: <strong>{availableSeats}</strong></div>
                <div>Has Payment Method: <strong>{hasPaymentMethod ? 'Yes' : 'No'}</strong></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAvailableSeats(prev => Math.max(0, prev - 1))}
                className="text-xs"
              >
                - Seat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAvailableSeats(prev => prev + 1)}
                className="text-xs"
              >
                + Seat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHasPaymentMethod(prev => !prev)}
                className="text-xs"
              >
                Toggle Payment Method
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Stats Cards - Hide when editing or creating */}
      {!isCreatingMember && !editingMemberId && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Team</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{activeMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{pendingMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive</p>
                <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{inactiveMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <UserX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${totalMonthlyCost}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Team Member Inline */}
      {editingMemberId && (() => {
        const member = teamMembers.find(m => m.id === editingMemberId);
        if (!member) return null;
        return (
          <EditTeamMemberInline
            member={member}
            onCancel={() => setEditingMemberId(null)}
            onSave={handleSaveEditMember}
            availableRoles={AVAILABLE_ROLES}
            clientGroups={CLIENT_GROUPS}
            clients={CLIENTS}
            existingEmails={teamMembers.map(m => m.email)}
          />
        );
      })()}

      {/* Create Team Member Inline */}
      {isCreatingMember && (
        <EditTeamMemberInline
          onCancel={() => setIsCreatingMember(false)}
          onSave={handleSaveNewMember}
          availableRoles={AVAILABLE_ROLES}
          clientGroups={CLIENT_GROUPS}
          clients={CLIENTS}
          existingEmails={teamMembers.map(m => m.email)}
        />
      )}

      {/* Main Card - Hide when editing or creating */}
      {!isCreatingMember && !editingMemberId && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-gray-900 dark:text-gray-100">Team Members</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your team members, roles, and client assignments
                </p>
              </div>
              <Button
                onClick={() => setInviteDialogOpen(true)}
                className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4" />
                Invite Team Member
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {AVAILABLE_ROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredMembers.length} of {totalMembers} team members
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setRoleFilter('all');
                  }}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Team Members Grid */}
          <div className="p-6">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No team members found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first team member'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => {
                  const fullName = `${member.firstName} ${member.lastName}`;
                  const initials = `${member.firstName[0]}${member.lastName[0]}`;
                  const roleColor = getRoleColorClasses(member.roleColor);

                  return (
                    <Card
                      key={member.id}
                      className="p-4 hover:shadow-lg transition-all border-2 border-gray-200 dark:border-gray-700"
                    >
                      {/* Header with Avatar and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
                            roleColor.badge
                          )}>
                            {member.avatar ? (
                              <img src={member.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{fullName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.jobTitle || 'No title'}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {getStatusBadge(member.status)}
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className="mb-3">
                        <Badge className={cn('text-xs', roleColor.bg, roleColor.text, 'border-0')}>
                          <Shield className="w-3 h-3 mr-1" />
                          {member.roleName}
                        </Badge>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.department && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{member.department}</span>
                          </div>
                        )}
                        {member.startDate && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Started {new Date(member.startDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Client Access */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Client Access</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {getClientAccessSummary(member)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {member.status === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleResendInvite(member.id)}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Resend Invite
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        ) : member.status === 'inactive' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleReactivate(member.id)}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Reactivate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMember(member.id)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleEditMember(member.id)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <UserX className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Invite Team Member Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        availableSeats={availableSeats}
        roles={AVAILABLE_ROLES}
        onInvite={handleInvite}
        onPurchaseSeats={handlePurchaseSeats}
        hasPaymentMethod={hasPaymentMethod}
      />
    </div>
  );
}