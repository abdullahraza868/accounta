import { Client } from '../../App';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Filter,
  UserPlus,
  Key,
  RotateCcw,
  GripVertical,
  MoreVertical,
  Ban,
  CheckCircle2,
  UserX,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TeamMemberProfile } from '../TeamMemberProfile';
import { AddTeamMember } from '../AddTeamMember';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '../ui/dropdown-menu';

type TeamsTabProps = {
  client: Client;
};

export type TeamsTabRef = {
  triggerAddMember: () => void;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  title?: string;
  department?: string;
  employmentDate?: string;
  dateAdded: string;
  status: 'Active' | 'Inactive';
  hasPortalAccess: boolean;
};

type SortField = 'name' | 'title' | 'relationship' | 'status' | 'portal';
type SortDirection = 'asc' | 'desc' | null;

export const TeamsTab = forwardRef<TeamsTabRef, TeamsTabProps>(({ client }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['Active']);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<TeamMember | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [columnWidths, setColumnWidths] = useState({
    name: 200,
    title: 180,
    relationship: 140,
    contact: 220,
    status: 100,
    portal: 80
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  // Relationship types
  const relationshipTypes = [
    'Partner',
    'Employee',
    'Accountant',
    'Bookkeeper',
    'Manager',
    'Director',
    'Shareholder',
    'Consultant',
    'Advisor',
    'Other'
  ];

  // Mock team members data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@acmecorp.com',
      phone: '(555) 123-4567',
      relationship: 'Partner',
      title: 'Managing Partner',
      department: 'Executive',
      employmentDate: '2020-01-15',
      dateAdded: '2024-01-15',
      status: 'Active',
      hasPortalAccess: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@acmecorp.com',
      phone: '(555) 234-5678',
      relationship: 'Partner',
      title: 'Partner',
      department: 'Executive',
      employmentDate: '2020-03-01',
      dateAdded: '2024-01-15',
      status: 'Active',
      hasPortalAccess: true
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@acmecorp.com',
      phone: '(555) 345-6789',
      relationship: 'Accountant',
      title: 'Chief Financial Officer',
      department: 'Finance',
      employmentDate: '2021-02-10',
      dateAdded: '2024-02-10',
      status: 'Active',
      hasPortalAccess: true
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.d@acmecorp.com',
      phone: '(555) 456-7890',
      relationship: 'Manager',
      title: 'Operations Manager',
      department: 'Operations',
      employmentDate: '2022-03-05',
      dateAdded: '2024-03-05',
      status: 'Active',
      hasPortalAccess: true
    },
    {
      id: '5',
      name: 'Robert Wilson',
      email: 'rwilson@acmecorp.com',
      phone: '(555) 567-8901',
      relationship: 'Employee',
      title: 'Senior Analyst',
      department: 'Analytics',
      employmentDate: '2023-04-20',
      dateAdded: '2024-04-20',
      status: 'Active',
      hasPortalAccess: false
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@acmecorp.com',
      phone: '(555) 678-9012',
      relationship: 'Bookkeeper',
      title: 'Senior Bookkeeper',
      department: 'Finance',
      employmentDate: '2022-05-12',
      dateAdded: '2024-05-12',
      status: 'Inactive',
      hasPortalAccess: false
    }
  ]);

  // Filter and sort team members
  const filteredAndSortedMembers = (() => {
    // First filter
    let filtered = teamMembers.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.title && member.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRelationship = 
        selectedRelationships.length === 0 || 
        selectedRelationships.includes(member.relationship);
      
      const matchesStatus = 
        selectedStatus.length === 0 || 
        selectedStatus.includes(member.status);
      
      return matchesSearch && matchesRelationship && matchesStatus;
    });

    // Then sort
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'title':
            aValue = (a.title || '').toLowerCase();
            bValue = (b.title || '').toLowerCase();
            break;
          case 'relationship':
            aValue = a.relationship.toLowerCase();
            bValue = b.relationship.toLowerCase();
            break;
          case 'status':
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          case 'portal':
            aValue = a.hasPortalAccess ? 1 : 0;
            bValue = b.hasPortalAccess ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  })();

  // Count by relationship
  const relationshipCounts = relationshipTypes.reduce((acc, type) => {
    acc[type] = teamMembers.filter(m => m.relationship === type).length;
    return acc;
  }, {} as Record<string, number>);

  // Count active/inactive
  const activeCount = teamMembers.filter(m => m.status === 'Active').length;
  const inactiveCount = teamMembers.filter(m => m.status === 'Inactive').length;

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      'Partner': 'bg-purple-50 text-purple-700 border-purple-200',
      'Employee': 'bg-blue-50 text-blue-700 border-blue-200',
      'Accountant': 'bg-green-50 text-green-700 border-green-200',
      'Bookkeeper': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Manager': 'bg-orange-50 text-orange-700 border-orange-200',
      'Director': 'bg-pink-50 text-pink-700 border-pink-200',
      'Shareholder': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Consultant': 'bg-teal-50 text-teal-700 border-teal-200',
      'Advisor': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Other': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[relationship] || colors['Other'];
  };

  const toggleRelationshipFilter = (relationship: string) => {
    setSelectedRelationships(prev =>
      prev.includes(relationship)
        ? prev.filter(r => r !== relationship)
        : [...prev, relationship]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredAndSortedMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredAndSortedMembers.map(m => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for members:`, selectedMembers);
    // Handle bulk actions
    setSelectedMembers([]);
  };

  const handleToggleStatus = (memberId: string) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, status: member.status === 'Active' ? 'Inactive' : 'Active' }
        : member
    ));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <ArrowDown className="w-3.5 h-3.5 text-purple-600" />;
  };

  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(column);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[column as keyof typeof columnWidths];
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const diff = e.clientX - resizeStartX.current;
        const newWidth = Math.max(80, resizeStartWidth.current + diff);
        setColumnWidths(prev => ({
          ...prev,
          [resizingColumn]: newWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn]);

  const handleStatCardClick = (filterType: 'all' | 'active' | 'inactive' | 'portal') => {
    switch (filterType) {
      case 'all':
        setSelectedStatus(['Active', 'Inactive']);
        setSelectedRelationships([]);
        break;
      case 'active':
        setSelectedStatus(['Active']);
        break;
      case 'inactive':
        setSelectedStatus(['Inactive']);
        break;
      case 'portal':
        // Filter to show only members with portal access
        setSelectedStatus(['Active']); // Usually portal users are active
        // Could add a separate portal filter if needed
        break;
    }
  };

  const handleSaveNewMember = (memberData: Partial<TeamMember>) => {
    setTeamMembers(prev => [...prev, memberData as TeamMember]);
    setShowAddForm(false);
  };

  // Expose method to parent via ref
  useImperativeHandle(ref, () => ({
    triggerAddMember: () => setShowAddForm(true)
  }));

  // If showing add form, show the AddTeamMember component
  if (showAddForm) {
    return (
      <AddTeamMember 
        client={client}
        onClose={() => setShowAddForm(false)}
        onSave={handleSaveNewMember}
      />
    );
  }

  // If a member profile is selected, show the profile view
  if (selectedMemberProfile) {
    return (
      <TeamMemberProfile 
        member={selectedMemberProfile} 
        onClose={() => setSelectedMemberProfile(null)} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="p-4 border border-gray-200/60 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
          onClick={() => handleStatCardClick('all')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{teamMembers.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card 
          className={cn(
            "p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all",
            selectedStatus.length === 1 && selectedStatus.includes('Active')
              ? "border-green-300 bg-green-50/30"
              : "border-gray-200/60 hover:border-green-300"
          )}
          onClick={() => handleStatCardClick('active')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card 
          className={cn(
            "p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all",
            selectedStatus.length === 1 && selectedStatus.includes('Inactive')
              ? "border-gray-400 bg-gray-50/50"
              : "border-gray-200/60 hover:border-gray-400"
          )}
          onClick={() => handleStatCardClick('inactive')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Inactive</p>
              <p className="text-2xl font-semibold text-gray-400 mt-1">
                {inactiveCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <UserX className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 border border-gray-200/60 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
          onClick={() => handleStatCardClick('portal')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Portal Access</p>
              <p className="text-2xl font-semibold text-blue-600 mt-1">
                {teamMembers.filter(m => m.hasPortalAccess).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Status
              {selectedStatus.length > 0 && selectedStatus.length < 2 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedStatus.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              Filter by Status
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatus.includes('Active')}
              onCheckedChange={() => toggleStatusFilter('Active')}
            >
              <span>Active</span>
              <span className="ml-auto text-xs text-gray-500">
                ({activeCount})
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus.includes('Inactive')}
              onCheckedChange={() => toggleStatusFilter('Inactive')}
            >
              <span>Inactive</span>
              <span className="ml-auto text-xs text-gray-500">
                ({inactiveCount})
              </span>
            </DropdownMenuCheckboxItem>
            {selectedStatus.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedStatus(['Active'])}>
                  Clear Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Relationship Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Relationship
              {selectedRelationships.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedRelationships.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              Filter by Relationship
            </div>
            <DropdownMenuSeparator />
            {relationshipTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedRelationships.includes(type)}
                onCheckedChange={() => toggleRelationshipFilter(type)}
              >
                <span>{type}</span>
                <span className="ml-auto text-xs text-gray-500">
                  ({relationshipCounts[type] || 0})
                </span>
              </DropdownMenuCheckboxItem>
            ))}
            {selectedRelationships.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedRelationships([])}>
                  Clear Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <Card className="p-4 border border-purple-200 bg-purple-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-purple-900">
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMembers([])}
                className="h-7 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('email')}
                className="h-8"
              >
                <Mail className="w-3 h-3 mr-1" />
                Email All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('sendLogin')}
                className="h-8"
              >
                <Key className="w-3 h-3 mr-1" />
                Send Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('resetPassword')}
                className="h-8"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Ban className="w-3 h-3 mr-1" />
                Deactivate
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Team Members List */}
      <Card className="border border-gray-200/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <Checkbox
                    checked={selectedMembers.length === filteredAndSortedMembers.length && filteredAndSortedMembers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-2 py-3 w-12">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.name }}
                >
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                  >
                    Name
                    {getSortIcon('name')}
                  </button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('name', e)}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.title }}
                >
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                  >
                    Title / Department
                    {getSortIcon('title')}
                  </button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('title', e)}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.relationship }}
                >
                  <button
                    onClick={() => handleSort('relationship')}
                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                  >
                    Relationship
                    {getSortIcon('relationship')}
                  </button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('relationship', e)}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.contact }}
                >
                  <div className="flex items-center gap-1.5">
                    Contact
                  </div>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('contact', e)}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.status }}
                >
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('status', e)}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide relative group"
                  style={{ width: columnWidths.portal }}
                >
                  <button
                    onClick={() => handleSort('portal')}
                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                  >
                    Portal
                    {getSortIcon('portal')}
                  </button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300 group-hover:bg-purple-200"
                    onMouseDown={(e) => handleResizeStart('portal', e)}
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedMembers.map((member) => (
                <tr 
                  key={member.id} 
                  className={cn(
                    "hover:bg-gray-50 transition-colors cursor-pointer",
                    selectedMembers.includes(member.id) && "bg-purple-50/30"
                  )}
                  onClick={(e) => {
                    // Don't open profile if clicking on checkbox, drag handle, status, or action menu
                    if (
                      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                      (e.target as HTMLElement).closest('[data-no-row-click]')
                    ) {
                      return;
                    }
                    setSelectedMemberProfile(member);
                  }}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleSelectMember(member.id)}
                    />
                  </td>
                  <td className="px-2 py-4" data-no-row-click onClick={(e) => e.stopPropagation()}>
                    <div className="cursor-grab hover:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-purple-700">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <div className="text-sm text-gray-900">{member.title || '-'}</div>
                      {member.department && (
                        <div className="text-xs text-gray-500">{member.department}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getRelationshipColor(member.relationship))}
                    >
                      {member.relationship}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4" data-no-row-click onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      className="group"
                    >
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs cursor-pointer transition-all",
                          member.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        )}
                      >
                        {member.status}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {member.hasPortalAccess ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Ban className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4" data-no-row-click onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Edit className="w-3 h-3 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-3 h-3 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Key className="w-3 h-3 mr-2" />
                            Send Login Info
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(member.id)}>
                            {member.status === 'Active' ? (
                              <>
                                <Ban className="w-3 h-3 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-3 h-3 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm || selectedRelationships.length > 0 || selectedStatus.length !== 1
                  ? 'No team members found matching your filters'
                  : 'No team members added yet'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});
