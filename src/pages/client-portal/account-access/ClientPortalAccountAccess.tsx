import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppSettings } from '../../../contexts/AppSettingsContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { TablePagination } from '../../../components/TablePagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '../../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  Filter,
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
  ArrowDown,
  Shield,
  Clock,
  UserPlus,
  Calendar,
  CalendarClock,
  Infinity,
  CalendarDays,
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { AddUserDialog } from '../../../components/client-portal/AddUserDialog';
import { toast } from 'sonner@2.0.3';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole?: string;
  dateAdded: string;
  accessExpires: string | null; // null = unlimited
  status: 'Active' | 'Suspended'; // Base status - can be overridden by expiry
  hasPortalAccess: boolean;
  force2FA: boolean;
  displayOrder: number; // For drag and drop ordering
  permissions: {
    pages: string[]; // Array of page names
    folders: string[]; // Array of folder paths
  };
};

// Computed status type includes Expired
export type ComputedStatus = 'Active' | 'Suspended' | 'Expired';

type SortField = 'name' | 'role' | 'portal' | 'expires';
type SortDirection = 'asc' | 'desc' | null;

export default function ClientPortalAccountAccess() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { user } = useAuth();
  const { formatDate } = useAppSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['Active', 'Suspended', 'Expired']);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: string | null }>({ 
    open: false, 
    userId: null 
  });
  const [generatedPasswordDialog, setGeneratedPasswordDialog] = useState<{ 
    open: boolean; 
    userId: string | null; 
    password: string;
    userEmail: string;
  }>({ 
    open: false, 
    userId: null,
    password: '',
    userEmail: '',
  });
  const [renewAccessDialog, setRenewAccessDialog] = useState<{ 
    open: boolean; 
    userId: string | null;
    selectedDays: number | null | 'unlimited';
    customDate: string;
  }>({ 
    open: false, 
    userId: null,
    selectedDays: null,
    customDate: '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [columnWidths, setColumnWidths] = useState({
    name: 240,
    role: 160,
    contact: 300,
    expires: 180,
    status: 120,
    portal: 120,
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  // Client type - detect from user account (mock for now)
  const clientType: 'Individual' | 'Business' = 'Business'; // Would come from user.clientType

  // Role types based on client type
  const roleTypes =
    clientType === 'Individual'
      ? ['Accountant', 'Bookkeeper', 'Advisor / Consultant', 'Power of Attorney', 'Other']
      : ['Partner', 'Manager', 'Employee', 'Accountant', 'Bookkeeper', 'Advisor / Consultant', 'Power of Attorney', 'Other'];

  // Mock users data
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@acmecorp.com',
      phone: '+15551234567',
      role: 'Partner',
      dateAdded: '2024-01-15',
      accessExpires: null, // Unlimited
      status: 'Active',
      hasPortalAccess: true,
      force2FA: true,
      displayOrder: 0,
      permissions: {
        pages: ['Dashboard', 'Profile', 'Documents', 'Signatures', 'Invoices'],
        folders: ['/Tax Documents', '/Financial Statements', '/Contracts'],
      },
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@acmecorp.com',
      phone: '+15552345678',
      role: 'Accountant',
      dateAdded: '2024-02-10',
      accessExpires: '2025-12-31',
      status: 'Active',
      hasPortalAccess: true,
      force2FA: true,
      displayOrder: 1,
      permissions: {
        pages: ['Dashboard', 'Documents', 'Invoices'],
        folders: ['/Tax Documents', '/Financial Statements'],
      },
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@acmecorp.com',
      phone: '+15553456789',
      role: 'Manager',
      dateAdded: '2024-03-05',
      accessExpires: '2025-06-30',
      status: 'Active',
      hasPortalAccess: true,
      force2FA: false,
      displayOrder: 2,
      permissions: {
        pages: ['Dashboard', 'Documents'],
        folders: ['/Tax Documents'],
      },
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.d@acmecorp.com',
      phone: '+15554567890',
      role: 'Employee',
      dateAdded: '2024-04-20',
      accessExpires: '2025-03-31',
      status: 'Suspended',
      hasPortalAccess: false,
      force2FA: false,
      displayOrder: 3,
      permissions: {
        pages: ['Dashboard'],
        folders: [],
      },
    },
  ]);

  // Compute actual status (including expiry check) - MUST BE DEFINED BEFORE FILTERING
  const getComputedStatus = (user: PortalUser): ComputedStatus => {
    // Check if access has expired
    if (user.accessExpires) {
      const expiry = new Date(user.accessExpires);
      const today = new Date();
      if (expiry < today) {
        return 'Expired';
      }
    }
    // Return base status
    return user.status;
  };

  const getStatusBadgeStyle = (status: ComputedStatus) => {
    const styles: Record<ComputedStatus, string> = {
      Active: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50',
      Suspended: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50',
      Expired: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
    };
    return styles[status];
  };

  // Filter and sort users
  const filteredAndSortedUsers = (() => {
    // First filter
    let filtered = portalUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);

      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(getComputedStatus(user));

      return matchesSearch && matchesRole && matchesStatus;
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
          case 'role':
            aValue = a.role.toLowerCase();
            bValue = b.role.toLowerCase();
            break;
          case 'expires':
            aValue = a.accessExpires || 'zzz'; // null (unlimited) sorts last
            bValue = b.accessExpires || 'zzz';
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
    } else {
      // When no sort is active, sort by displayOrder
      filtered = [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return filtered;
  })();

  // Pagination
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRoles, selectedStatus]);

  // Count by role
  const roleCounts = roleTypes.reduce((acc, type) => {
    acc[type] = portalUsers.filter((u) => u.role === type).length;
    return acc;
  }, {} as Record<string, number>);

  // Count active/suspended/expired
  const activeCount = portalUsers.filter((u) => getComputedStatus(u) === 'Active').length;
  const suspendedCount = portalUsers.filter((u) => getComputedStatus(u) === 'Suspended').length;
  const expiredCount = portalUsers.filter((u) => getComputedStatus(u) === 'Expired').length;
  const portalAccessCount = portalUsers.filter((u) => u.hasPortalAccess).length;

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Partner: 'bg-purple-50 text-purple-700 border-purple-200',
      Manager: 'bg-orange-50 text-orange-700 border-orange-200',
      Employee: 'bg-blue-50 text-blue-700 border-blue-200',
      Accountant: 'bg-green-50 text-green-700 border-green-200',
      Bookkeeper: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Advisor / Consultant': 'bg-teal-50 text-teal-700 border-teal-200',
      'Power of Attorney': 'bg-red-50 text-red-700 border-red-200',
      Other: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[role] || colors['Other'];
  };

  const toggleRoleFilter = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  };

  const handleBulkAction = (action: string) => {
    toast.success(`Bulk action: ${action} for ${selectedUsers.length} user(s)`);
    setSelectedUsers([]);
  };

  const handleToggleStatus = (userId: string) => {
    setPortalUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
          : user
      )
    );
    toast.success('User status updated');
  };

  const handleSendLogin = (userId: string) => {
    const user = portalUsers.find((u) => u.id === userId);
    toast.success(`Login credentials sent to ${user?.email}`);
  };

  const handleResetPassword = (userId: string) => {
    setResetPasswordDialog({ open: true, userId });
  };

  const handleResetPasswordManual = () => {
    const user = portalUsers.find((u) => u.id === resetPasswordDialog.userId);
    if (!user) return;
    
    // Generate a secure temporary password
    const generatePassword = () => {
      const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const lowercase = 'abcdefghjkmnpqrstuvwxyz';
      const numbers = '23456789';
      const symbols = '!@#$%&*';
      
      let password = '';
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
      
      const allChars = uppercase + lowercase + numbers + symbols;
      for (let i = 0; i < 8; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
    const newPassword = generatePassword();
    
    // Close reset dialog and open generated password dialog
    setResetPasswordDialog({ open: false, userId: null });
    setGeneratedPasswordDialog({ 
      open: true, 
      userId: user.id,
      password: newPassword,
      userEmail: user.email,
    });
  };

  const handleSendPasswordLink = () => {
    const user = portalUsers.find((u) => u.id === resetPasswordDialog.userId);
    toast.success(`Password reset link sent to ${user?.email}`);
    setResetPasswordDialog({ open: false, userId: null });
  };

  const handleDeleteUser = (userId: string) => {
    setPortalUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success('User deleted');
  };

  const handleRenewAccess = (userId: string) => {
    setRenewAccessDialog({ open: true, userId, selectedDays: null, customDate: '' });
  };

  const handleRenewWithEdit = () => {
    if (renewAccessDialog.userId) {
      navigate(`/client-portal/account-access/add-user?edit=${renewAccessDialog.userId}`);
      setRenewAccessDialog({ open: false, userId: null, selectedDays: null, customDate: '' });
    }
  };

  const handleSelectDays = (days: number) => {
    setRenewAccessDialog(prev => ({ ...prev, selectedDays: days, customDate: '' }));
  };

  const handleRenewAndSend = () => {
    if (renewAccessDialog.userId && (renewAccessDialog.selectedDays || renewAccessDialog.customDate)) {
      const user = portalUsers.find((u) => u.id === renewAccessDialog.userId);
      if (user) {
        let newExpiryDate: string | null = null;
        let message = '';

        if (renewAccessDialog.selectedDays === 'unlimited') {
          newExpiryDate = null;
          message = 'Access renewed with unlimited duration';
        } else if (renewAccessDialog.customDate) {
          newExpiryDate = renewAccessDialog.customDate;
          message = `Access renewed until ${formatDate(renewAccessDialog.customDate)}`;
        } else if (typeof renewAccessDialog.selectedDays === 'number') {
          const date = new Date();
          date.setDate(date.getDate() + renewAccessDialog.selectedDays);
          newExpiryDate = date.toISOString();
          message = `Access renewed for ${renewAccessDialog.selectedDays} days`;
        }
        
        // Check if we're also granting portal access
        const grantingPortalAccess = !user.hasPortalAccess;
        
        setPortalUsers((prev) =>
          prev.map((u) =>
            u.id === renewAccessDialog.userId
              ? { ...u, accessExpires: newExpiryDate, status: 'Active', hasPortalAccess: true }
              : u
          )
        );
        
        const portalAccessMessage = grantingPortalAccess ? ' and portal access granted' : '';
        toast.success(`${message}${portalAccessMessage}. Login credentials sent to ${user.email}`);
        setRenewAccessDialog({ open: false, userId: null, selectedDays: null, customDate: '' });
      }
    }
  };

  const handleTogglePortalAccess = (userId: string) => {
    const user = portalUsers.find((u) => u.id === userId);
    if (user) {
      setPortalUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, hasPortalAccess: !u.hasPortalAccess }
            : u
        )
      );
      toast.success(user.hasPortalAccess ? 'Portal access removed' : 'Portal access granted');
    }
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
      return <ArrowUpDown className="w-3.5 h-3.5 text-white/50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3.5 h-3.5 text-white/90" />;
    }
    return <ArrowDown className="w-3.5 h-3.5 text-white/90" />;
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
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn]: newWidth,
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

  const handleStatCardClick = (
    filterType: 'all' | 'active' | 'suspended' | 'portal'
  ) => {
    switch (filterType) {
      case 'all':
        setSelectedStatus(['Active', 'Suspended', 'Expired']);
        setSelectedRoles([]);
        break;
      case 'active':
        setSelectedStatus(['Active']);
        break;
      case 'suspended':
        setSelectedStatus(['Suspended']);
        break;
      case 'portal':
        setSelectedStatus(['Active']);
        break;
    }
  };

  const handleSaveNewUser = (userData: Partial<PortalUser>) => {
    const newUser: PortalUser = {
      ...userData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
      displayOrder: portalUsers.length, // Add to end
    } as PortalUser;
    setPortalUsers((prev) => [...prev, newUser]);
    setShowAddDialog(false);
    toast.success('User added successfully');
  };



  const formatExpiryDate = (date: string | null) => {
    if (!date) return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">Unlimited</Badge>;
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return (
        <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
          {daysUntilExpiry}d left
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <span className="text-sm font-medium text-amber-600">
          {formatDate(date)}
        </span>
      );
    } else {
      return (
        <span className="text-sm" style={{ color: branding.colors.bodyText }}>
          {formatDate(date)}
        </span>
      );
    }
  };

  const getExpiryIconColor = (date: string | null) => {
    if (!date) return 'text-green-600';
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return 'text-red-600';
    if (daysUntilExpiry <= 7) return 'text-orange-600';
    if (daysUntilExpiry <= 30) return 'text-amber-600';
    return branding.colors.mutedText;
  };

  // Drag and drop handlers
  const moveUser = (dragId: string, hoverId: string) => {
    const dragIndex = portalUsers.findIndex((user) => user.id === dragId);
    const hoverIndex = portalUsers.findIndex((user) => user.id === hoverId);

    if (dragIndex === -1 || hoverIndex === -1) return;

    const newUsers = [...portalUsers];
    const [draggedUser] = newUsers.splice(dragIndex, 1);
    newUsers.splice(hoverIndex, 0, draggedUser);

    // Update display order for all users
    const reorderedUsers = newUsers.map((user, index) => ({
      ...user,
      displayOrder: index,
    }));

    setPortalUsers(reorderedUsers);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ClientPortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ color: branding.colors.headingText }}>Account Access</h1>
            <Badge
              className="text-xs"
              style={{
                background: `${branding.colors.primaryButton}15`,
                color: branding.colors.primaryButton,
                border: `1px solid ${branding.colors.primaryButton}30`,
              }}
            >
              {clientType}
            </Badge>
          </div>
          <p className="mt-2" style={{ color: branding.colors.mutedText }}>
            Manage user access and permissions for your account
          </p>
        </div>

        {/* Stats Cards - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all"
            style={{ borderColor: branding.colors.borderColor }}
            onClick={() => handleStatCardClick('all')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: branding.colors.mutedText }}>
                  Total Users
                </p>
                <p className="text-2xl mt-1" style={{ color: branding.colors.headingText }}>
                  {portalUsers.length}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${branding.colors.primaryButton}15` }}
              >
                <Users className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              'p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all',
              selectedStatus.length === 1 && selectedStatus.includes('Active')
                ? 'border-green-300 bg-green-50/30'
                : ''
            )}
            style={
              selectedStatus.length === 1 && selectedStatus.includes('Active')
                ? {}
                : { borderColor: branding.colors.borderColor }
            }
            onClick={() => handleStatCardClick('active')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: branding.colors.mutedText }}>
                  Active
                </p>
                <p className="text-2xl mt-1 text-green-600">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              'p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all',
              selectedStatus.length === 1 && selectedStatus.includes('Suspended')
                ? 'border-gray-400 bg-gray-50/50'
                : ''
            )}
            style={
              selectedStatus.length === 1 && selectedStatus.includes('Suspended')
                ? {}
                : { borderColor: branding.colors.borderColor }
            }
            onClick={() => handleStatCardClick('suspended')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: branding.colors.mutedText }}>
                  Suspended
                </p>
                <p className="text-2xl mt-1 text-gray-400">{suspendedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <UserX className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Card>

          <Card
            className="p-4 border shadow-sm cursor-pointer hover:shadow-md transition-all"
            style={{ borderColor: branding.colors.borderColor }}
            onClick={() => handleStatCardClick('portal')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: branding.colors.mutedText }}>
                  Portal Access
                </p>
                <p className="text-2xl mt-1 text-blue-600">{portalAccessCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search, Filters, and Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: branding.colors.mutedText }}
              />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  color: branding.colors.inputText,
                }}
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
                  <span className="ml-auto text-xs text-gray-500">({activeCount})</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatus.includes('Suspended')}
                  onCheckedChange={() => toggleStatusFilter('Suspended')}
                >
                  <span>Suspended</span>
                  <span className="ml-auto text-xs text-gray-500">({suspendedCount})</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatus.includes('Expired')}
                  onCheckedChange={() => toggleStatusFilter('Expired')}
                >
                  <span>Expired</span>
                  <span className="ml-auto text-xs text-gray-500">({expiredCount})</span>
                </DropdownMenuCheckboxItem>
                {selectedStatus.length < 3 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedStatus(['Active', 'Suspended', 'Expired'])}>
                      Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Role
                  {selectedRoles.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {selectedRoles.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  Filter by Role
                </div>
                <DropdownMenuSeparator />
                {roleTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={selectedRoles.includes(type)}
                    onCheckedChange={() => toggleRoleFilter(type)}
                  >
                    <span>{type}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      ({roleCounts[type] || 0})
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedRoles.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedRoles([])}>
                      Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Add User Button */}
          <Button
            onClick={() => navigate('/client-portal/account-access/add-user')}
            style={{
              background: branding.colors.primaryButton,
              color: branding.colors.primaryButtonText,
            }}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <Card
            className="p-4 border shadow-sm"
            style={{
              background: `${branding.colors.primaryButton}10`,
              borderColor: `${branding.colors.primaryButton}30`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                  className="h-7"
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
                  onClick={() => handleBulkAction('suspend')}
                  className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Ban className="w-3 h-3 mr-1" />
                  Suspend
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Users List */}
        <Card className="border shadow-sm overflow-hidden rounded-xl" style={{ borderColor: branding.colors.borderColor }}>
          <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
              <thead>
                <tr style={{ backgroundColor: 'var(--primaryColor)' }} className="rounded-t-xl">
                  <th className="px-6 py-4 text-left w-12">
                    <Checkbox
                      checked={
                        selectedUsers.length === paginatedUsers.length &&
                        paginatedUsers.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-2 py-4 w-12">
                    <GripVertical className="w-4 h-4 text-white/90" />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 relative group w-[240px]"
                  >
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      Name
                      {getSortIcon('name')}
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 group-hover:bg-white/10"
                      onMouseDown={(e) => handleResizeStart('name', e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 relative group w-[160px]"
                  >
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      Role
                      {getSortIcon('role')}
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 group-hover:bg-white/10"
                      onMouseDown={(e) => handleResizeStart('role', e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 relative group w-[300px]"
                  >
                    Contact
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 group-hover:bg-white/10"
                      onMouseDown={(e) => handleResizeStart('contact', e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 relative group w-[180px]"
                  >
                    <button
                      onClick={() => handleSort('expires')}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      Access Expires
                      {getSortIcon('expires')}
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 group-hover:bg-white/10"
                      onMouseDown={(e) => handleResizeStart('expires', e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 relative group w-[140px]"
                  >
                    <button
                      onClick={() => handleSort('portal')}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      Portal Access
                      {getSortIcon('portal')}
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 group-hover:bg-white/10"
                      onMouseDown={(e) => handleResizeStart('portal', e)}
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-right text-xs uppercase tracking-wide text-white/90 w-[100px]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: branding.colors.borderColor }}>
                {paginatedUsers.map((user, index) => (
                  <DraggableRow
                    key={user.id}
                    user={user}
                    index={startIndex + index}
                    moveUser={moveUser}
                    selectedUsers={selectedUsers}
                    toggleSelectUser={toggleSelectUser}
                    branding={branding}
                    getRoleColor={getRoleColor}
                    formatExpiryDate={formatExpiryDate}
                    getExpiryIconColor={getExpiryIconColor}
                    getComputedStatus={getComputedStatus}
                    getStatusBadgeStyle={getStatusBadgeStyle}
                    handleSendLogin={handleSendLogin}
                    handleResetPassword={handleResetPassword}
                    handleToggleStatus={handleToggleStatus}
                    handleDeleteUser={handleDeleteUser}
                    handleRenewAccess={handleRenewAccess}
                    handleTogglePortalAccess={handleTogglePortalAccess}
                    navigate={navigate}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAndSortedUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: branding.colors.mutedText }} />
              <h3 className="mb-2" style={{ color: branding.colors.headingText }}>
                No users found
              </h3>
              <p style={{ color: branding.colors.mutedText }}>
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </Card>
        
        {/* Pagination - Outside Card */}
        {filteredAndSortedUsers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Add User Dialog */}
      {showAddDialog && (
        <AddUserDialog
          clientType={clientType}
          roleTypes={roleTypes}
          onClose={() => setShowAddDialog(false)}
          onSave={handleSaveNewUser}
        />
      )}

      {/* Reset Password Dialog */}
      <AlertDialog 
        open={resetPasswordDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setResetPasswordDialog({ open: false, userId: null });
          }
        }}
      >
        <AlertDialogContent style={{ background: branding.colors.cardBackground }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: branding.colors.headingText }}>
              Reset Password
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: branding.colors.bodyText }}>
              <div className="space-y-4 mt-2">
                <div>
                  Choose how you would like to reset the password for{' '}
                  <strong>
                    {portalUsers.find(u => u.id === resetPasswordDialog.userId)?.name}
                  </strong>
                </div>
                
                <div className="space-y-3">
                  <div 
                    className="p-4 rounded-lg border cursor-pointer hover:border-blue-500 transition-colors"
                    style={{ borderColor: branding.colors.borderColor }}
                    onClick={handleSendPasswordLink}
                  >
                    <div className="flex items-start gap-3">
                      <Send className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: branding.colors.headingText }}>
                          Send Password Reset Link
                        </div>
                        <div className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                          User will receive an email with a secure link to reset their password
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg border cursor-pointer hover:border-blue-500 transition-colors"
                    style={{ borderColor: branding.colors.borderColor }}
                    onClick={handleResetPasswordManual}
                  >
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: branding.colors.headingText }}>
                          Reset Manually
                        </div>
                        <div className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                          Generate a temporary password and share it with the user
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetPasswordDialog({ open: false, userId: null })}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generated Password Dialog */}
      <AlertDialog 
        open={generatedPasswordDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setGeneratedPasswordDialog({ open: false, userId: null, password: '', userEmail: '' });
          }
        }}
      >
        <AlertDialogContent style={{ background: branding.colors.cardBackground }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: branding.colors.headingText }}>
              Password Reset Successfully
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: branding.colors.bodyText }}>
              <div className="space-y-4 mt-2">
                <div>
                  A temporary password has been generated for{' '}
                  <strong>
                    {portalUsers.find(u => u.id === generatedPasswordDialog.userId)?.name}
                  </strong>.
                </div>
                
                <div 
                  className="p-4 rounded-lg border-2"
                  style={{ 
                    borderColor: branding.colors.primaryButton,
                    background: `${branding.colors.primaryButton}10`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: branding.colors.mutedText }}>
                        Temporary Password
                      </div>
                      <div 
                        className="text-xl font-mono font-medium select-all"
                        style={{ color: branding.colors.headingText }}
                      >
                        {generatedPasswordDialog.password}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPasswordDialog.password);
                        toast.success('Password copied to clipboard');
                      }}
                      style={{
                        borderColor: branding.colors.primaryButton,
                        color: branding.colors.primaryButton,
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div 
                  className="p-3 rounded-lg border-l-4"
                  style={{
                    background: '#fef3c7',
                    borderColor: '#f59e0b',
                  }}
                >
                  <div className="text-sm text-amber-900">
                    ⚠️ <strong>Important:</strong> Make sure to save this password securely. It will not be shown again.
                  </div>
                </div>

                <div className="text-sm">
                  You can now share this password with the user, or click the button below to email it to them at{' '}
                  <strong>{generatedPasswordDialog.userEmail}</strong>.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setGeneratedPasswordDialog({ open: false, userId: null, password: '', userEmail: '' })}
            >
              Done
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`Password sent to ${generatedPasswordDialog.userEmail}`);
                setGeneratedPasswordDialog({ open: false, userId: null, password: '', userEmail: '' });
              }}
              style={{
                background: branding.colors.primaryButton,
                color: branding.colors.primaryButtonText,
              }}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Renew Access Dialog */}
      <AlertDialog 
        open={renewAccessDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setRenewAccessDialog({ open: false, userId: null, selectedDays: null, customDate: '' });
          }
        }}
      >
        <AlertDialogContent style={{ background: branding.colors.cardBackground }} className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: branding.colors.headingText }}>
              Renew Access
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-2" style={{ color: branding.colors.bodyText }}>
                <div>
                  Renewing access for{' '}
                  <strong>
                    {portalUsers.find(u => u.id === renewAccessDialog.userId)?.name}
                  </strong>
                </div>
                
                <div className="space-y-3">
                  {/* Quick Renew Options - 3 columns */}
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        renewAccessDialog.selectedDays === 30 && "ring-2"
                      )}
                      style={{ 
                        borderColor: renewAccessDialog.selectedDays === 30 ? branding.colors.primaryButton : branding.colors.borderColor,
                        background: renewAccessDialog.selectedDays === 30 ? `${branding.colors.primaryButton}10` : 'transparent',
                      }}
                      onClick={() => handleSelectDays(30)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="w-5 h-5" style={{ color: renewAccessDialog.selectedDays === 30 ? branding.colors.primaryButton : branding.colors.mutedText }} />
                        <div className="font-medium text-sm" style={{ color: branding.colors.headingText }}>
                          30 Days
                        </div>
                        <div className="text-xs text-center" style={{ color: branding.colors.mutedText }}>
                          {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                        </div>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        renewAccessDialog.selectedDays === 90 && "ring-2"
                      )}
                      style={{ 
                        borderColor: renewAccessDialog.selectedDays === 90 ? branding.colors.primaryButton : branding.colors.borderColor,
                        background: renewAccessDialog.selectedDays === 90 ? `${branding.colors.primaryButton}10` : 'transparent',
                      }}
                      onClick={() => handleSelectDays(90)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="w-5 h-5" style={{ color: renewAccessDialog.selectedDays === 90 ? branding.colors.primaryButton : branding.colors.mutedText }} />
                        <div className="font-medium text-sm" style={{ color: branding.colors.headingText }}>
                          90 Days
                        </div>
                        <div className="text-xs text-center" style={{ color: branding.colors.mutedText }}>
                          {formatDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                        </div>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        renewAccessDialog.selectedDays === 180 && "ring-2"
                      )}
                      style={{ 
                        borderColor: renewAccessDialog.selectedDays === 180 ? branding.colors.primaryButton : branding.colors.borderColor,
                        background: renewAccessDialog.selectedDays === 180 ? `${branding.colors.primaryButton}10` : 'transparent',
                      }}
                      onClick={() => handleSelectDays(180)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="w-5 h-5" style={{ color: renewAccessDialog.selectedDays === 180 ? branding.colors.primaryButton : branding.colors.mutedText }} />
                        <div className="font-medium text-sm" style={{ color: branding.colors.headingText }}>
                          180 Days
                        </div>
                        <div className="text-xs text-center" style={{ color: branding.colors.mutedText }}>
                          {formatDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        renewAccessDialog.selectedDays === 365 && "ring-2"
                      )}
                      style={{ 
                        borderColor: renewAccessDialog.selectedDays === 365 ? branding.colors.primaryButton : branding.colors.borderColor,
                        background: renewAccessDialog.selectedDays === 365 ? `${branding.colors.primaryButton}10` : 'transparent',
                      }}
                      onClick={() => handleSelectDays(365)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-5 h-5" style={{ color: renewAccessDialog.selectedDays === 365 ? branding.colors.primaryButton : branding.colors.mutedText }} />
                        <div className="font-medium text-sm" style={{ color: branding.colors.headingText }}>
                          1 Year
                        </div>
                        <div className="text-xs text-center" style={{ color: branding.colors.mutedText }}>
                          {formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                        </div>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                        renewAccessDialog.selectedDays === 'unlimited' && "ring-2"
                      )}
                      style={{ 
                        borderColor: renewAccessDialog.selectedDays === 'unlimited' ? branding.colors.primaryButton : branding.colors.borderColor,
                        background: renewAccessDialog.selectedDays === 'unlimited' ? `${branding.colors.primaryButton}10` : 'transparent',
                      }}
                      onClick={() => setRenewAccessDialog(prev => ({ ...prev, selectedDays: 'unlimited', customDate: '' }))}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Infinity className="w-5 h-5" style={{ color: renewAccessDialog.selectedDays === 'unlimited' ? branding.colors.primaryButton : branding.colors.mutedText }} />
                        <div className="font-medium text-sm" style={{ color: branding.colors.headingText }}>
                          Unlimited
                        </div>
                        <div className="text-xs text-center" style={{ color: branding.colors.mutedText }}>
                          No expiration
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Date Option */}
                  <div 
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                      renewAccessDialog.customDate && "ring-2"
                    )}
                    style={{ 
                      borderColor: renewAccessDialog.customDate ? branding.colors.primaryButton : branding.colors.borderColor,
                      background: renewAccessDialog.customDate ? `${branding.colors.primaryButton}10` : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0" style={{ color: branding.colors.primaryButton }} />
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2" style={{ color: branding.colors.headingText }}>
                          Custom Expiration Date
                        </div>
                        <Input
                          type="date"
                          value={renewAccessDialog.customDate}
                          onChange={(e) => setRenewAccessDialog(prev => ({ ...prev, customDate: e.target.value, selectedDays: null }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-48"
                          style={{
                            background: branding.colors.inputBackground,
                            borderColor: branding.colors.inputBorder,
                            color: branding.colors.inputText,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-left flex-1" style={{ color: branding.colors.mutedText }}>
                {(renewAccessDialog.selectedDays || renewAccessDialog.customDate) && (() => {
                  const user = portalUsers.find(u => u.id === renewAccessDialog.userId);
                  const willGrantPortalAccess = user && !user.hasPortalAccess;
                  return (
                    <span>
                      ℹ️ This will renew access{willGrantPortalAccess ? ', grant portal access,' : ''} and send login credentials to the user's email
                    </span>
                  );
                })()}
              </div>
              <div className="flex gap-2">
                <AlertDialogCancel onClick={() => setRenewAccessDialog({ open: false, userId: null, selectedDays: null, customDate: '' })}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  disabled={!renewAccessDialog.selectedDays && !renewAccessDialog.customDate}
                  onClick={handleRenewAndSend}
                  style={{
                    background: (renewAccessDialog.selectedDays || renewAccessDialog.customDate) ? branding.colors.primaryButton : undefined,
                    color: (renewAccessDialog.selectedDays || renewAccessDialog.customDate) ? 'white' : undefined,
                  }}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Renew & Send Login
                </Button>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientPortalLayout>
    </DndProvider>
  );
}

// Draggable Row Component
type DraggableRowProps = {
  user: PortalUser;
  index: number;
  moveUser: (dragId: string, hoverId: string) => void;
  selectedUsers: string[];
  toggleSelectUser: (id: string) => void;
  branding: any;
  getRoleColor: (role: string) => string;
  formatExpiryDate: (date: string | null) => JSX.Element | React.ReactNode;
  getExpiryIconColor: (date: string | null) => string;
  getComputedStatus: (user: PortalUser) => ComputedStatus;
  getStatusBadgeStyle: (status: ComputedStatus) => string;
  handleSendLogin: (id: string) => void;
  handleResetPassword: (id: string) => void;
  handleToggleStatus: (id: string) => void;
  handleDeleteUser: (id: string) => void;
  handleRenewAccess: (id: string) => void;
  handleTogglePortalAccess: (id: string) => void;
  navigate: (path: string) => void;
};

function DraggableRow({
  user,
  index,
  moveUser,
  selectedUsers,
  toggleSelectUser,
  branding,
  getRoleColor,
  formatExpiryDate,
  getExpiryIconColor,
  getComputedStatus,
  getStatusBadgeStyle,
  handleSendLogin,
  handleResetPassword,
  handleToggleStatus,
  handleDeleteUser,
  handleRenewAccess,
  handleTogglePortalAccess,
  navigate,
}: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'USER_ROW',
    item: { id: user.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'USER_ROW',
    hover: (item: { id: string; index: number }) => {
      if (item.id !== user.id) {
        moveUser(item.id, user.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      className={cn(
        'hover:opacity-80 transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'bg-purple-50'
      )}
      style={{ 
        background: branding.colors.cardBackground,
        cursor: 'move',
      }}
    >
      <td className="px-6 py-4">
        <Checkbox
          checked={selectedUsers.includes(user.id)}
          onCheckedChange={() => toggleSelectUser(user.id)}
        />
      </td>
      <td className="px-2 py-4">
        <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" style={{ color: branding.colors.mutedText }} />
      </td>
      <td className="px-4 py-4">
        <div>
          <div 
            className="text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: branding.colors.headingText }}
            onClick={() => navigate(`/client-portal/account-access/add-user?edit=${user.id}`)}
          >
            {user.name}
          </div>
          {user.force2FA && (
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-600">2FA Required</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
          {user.customRole || user.role}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm" style={{ color: branding.colors.bodyText }}>
            <Mail className="w-3 h-3" style={{ color: branding.colors.mutedText }} />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: branding.colors.mutedText }}>
            <Phone className="w-3 h-3" />
            {user.phone}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => handleRenewAccess(user.id)}
          title="Click to edit expiration date"
        >
          <Clock className={`w-3 h-3 ${getExpiryIconColor(user.accessExpires)}`} />
          <span className="underline decoration-dotted">
            {formatExpiryDate(user.accessExpires)}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        {user.hasPortalAccess && getComputedStatus(user) === 'Active' && (
          <div 
            className="flex items-center gap-1.5 text-sm text-green-600 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => handleTogglePortalAccess(user.id)}
            title="Click to remove portal access"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="underline decoration-dotted">Active</span>
          </div>
        )}
        {user.hasPortalAccess && getComputedStatus(user) === 'Suspended' && (
          <div 
            className="flex items-center gap-1.5 text-sm text-orange-600 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => handleTogglePortalAccess(user.id)}
            title="Click to remove portal access"
          >
            <Ban className="w-4 h-4" />
            <span className="underline decoration-dotted">Suspended</span>
          </div>
        )}
        {user.hasPortalAccess && getComputedStatus(user) === 'Expired' && (
          <div 
            className="flex items-center gap-1.5 text-sm text-red-600 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => handleTogglePortalAccess(user.id)}
            title="Click to remove portal access"
          >
            <Clock className="w-4 h-4" />
            <span className="underline decoration-dotted">Expired</span>
          </div>
        )}
        {!user.hasPortalAccess && (
          <div 
            className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => handleTogglePortalAccess(user.id)}
            title="Click to grant portal access"
          >
            <UserX className="w-4 h-4" />
            <span className="underline decoration-dotted">No Portal Access</span>
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {getComputedStatus(user) === 'Expired' && (
            <Button
              size="sm"
              className="h-8 gap-1.5"
              style={{
                background: branding.colors.primaryButton,
                color: 'white',
              }}
              onClick={() => handleRenewAccess(user.id)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Renew & Send
            </Button>
          )}
          {getComputedStatus(user) === 'Active' && user.status !== 'Suspended' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
              onClick={() => handleToggleStatus(user.id)}
            >
              <Ban className="w-3.5 h-3.5" />
              Suspend
            </Button>
          )}
          {user.status === 'Suspended' && getComputedStatus(user) !== 'Expired' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => handleToggleStatus(user.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reinstate
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate(`/client-portal/account-access/add-user?edit=${user.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendLogin(user.id)}>
              <Send className="w-4 h-4 mr-2" />
              Send Login Info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {getComputedStatus(user) === 'Expired' && (
              <>
                <DropdownMenuItem onClick={() => handleRenewAccess(user.id)}>
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-blue-600">Renew Access</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
              {user.status === 'Active' ? (
                <>
                  <Ban className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="text-orange-600">Suspend User</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-600">Activate User</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteUser(user.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
