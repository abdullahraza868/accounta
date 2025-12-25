import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  FileSignature, 
  Send, 
  CheckCircle, 
  Clock,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Edit,
  MailPlus,
  FileText,
  AlertCircle,
  User,
  Users,
  Calendar,
  Check,
  X as XIcon,
  Upload,
  Search,
  ChevronDown,
  Building2,
  ChevronRight,
  Workflow,
  MapPin,
  Globe,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Flame,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  FilterX,
  Loader2,
  GripVertical,
  HelpCircle,
  Settings,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { TablePaginationCompact } from '../TablePaginationCompact';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';
import { NewSignatureRequestDialog } from '../NewSignatureRequestDialog';
import { BulkResendSignaturesDialog } from '../BulkResendSignaturesDialog';
import { SignatureSettingsDialog } from '../SignatureSettingsDialog';
import { ClientNameWithLink } from '../ClientNameWithLink';
import { apiService } from '../../services/ApiService';
import { useAppSettings } from '../../contexts/AppSettingsContext';

type SignatureStatus = 'completed' | 'partial' | 'sent' | 'viewed' | 'unsigned';

type Recipient = {
  id: string;
  name: string;
  email: string;
  role?: string;
  signedAt?: string;
  viewedAt?: string;
  ipAddress?: string;
  viewedIpAddress?: string;
  signedIpAddress?: string;
};

type SignatureRequest = {
  id: string;
  documentName: string;
  documentType: 'custom' | '8879' | 'template';
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  year: number;
  sentAt: string;
  recipients: Recipient[];
  totalSent: number;
  totalSigned: number;
  status: SignatureStatus;
  createdBy: string;
  source: 'manual' | 'workflow';
  workflowName?: string;
  sentBy?: string;
  template?: string;
};

type SortColumn = 'clientName' | 'documentName' | 'sentAt' | 'status' | null;
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'completed' | 'partial' | 'sent' | 'pending' | 'recent';
type ClientTypeFilter = 'all' | 'Individual' | 'Business';

type StatCardType = 'all' | 'completed' | 'sent' | 'partial' | 'recent';

type StatCardConfig = {
  id: StatCardType;
  label: string;
  label2?: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  getValue: (stats: any) => number;
  badge?: (stats: any) => React.ReactNode;
  filterValue?: StatusFilter;
};

type DraggableStatCardProps = {
  config: StatCardConfig;
  index: number;
  stats: any;
  statusFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
};

const DraggableStatCard = ({ config, index, stats, statusFilter, onFilterChange, moveCard }: DraggableStatCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STAT_CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'STAT_CARD',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn("relative", isDragging && "opacity-50")}
    >
      <div className="absolute top-2 left-2 text-gray-400 pointer-events-none z-10">
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => onFilterChange(config.filterValue || config.id as StatusFilter)}
        className="text-left w-full"
      >
        <Card className={cn(
          "p-4 pl-8 border-gray-200/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-move",
          statusFilter === (config.filterValue || config.id) && "ring-2 ring-purple-100"
        )}
        style={statusFilter === (config.filterValue || config.id) ? { borderColor: 'var(--primaryColor)' } : {}}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bgColor }}>
                {config.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{config.label}</p>
                {config.label2 && <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{config.label2}</p>}
                {config.description && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{config.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl text-gray-900 dark:text-gray-100">{config.getValue(stats)}</p>
              {config.badge && config.badge(stats)}
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
};

export function SignaturesViewSplit() {
  const navigate = useNavigate();
  const { formatDate, formatDateTime } = useAppSettings();
  
  // Check if user prefers single view and redirect
  useEffect(() => {
    const preferredView = localStorage.getItem('signaturesViewPreference');
    if (preferredView === 'single') {
      navigate('/signatures', { replace: true });
    }
  }, [navigate]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showBulkResendDialog, setShowBulkResendDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Separate pagination for active and completed
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');
  const [documentNameFilter, setDocumentNameFilter] = useState<string>('all');
  
  // Server-side data state
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Card order state
  const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
    const saved = localStorage.getItem('signaturesCardOrder');
    return saved ? JSON.parse(saved) : ['all', 'recent', 'partial', 'sent', 'completed'];
  });

  // Overdue days setting
  const [overdueDays, setOverdueDays] = useState<number>(() => {
    const saved = localStorage.getItem('signatureOverdueDays');
    return saved ? parseInt(saved) : 3;
  });

  const handleOverdueDaysChange = (days: number) => {
    setOverdueDays(days);
    localStorage.setItem('signatureOverdueDays', days.toString());
  };

  // Track resent signatures
  const [resentSignatures, setResentSignatures] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resentSignatures');
    return saved ? JSON.parse(saved) : {};
  });

  // Confirmation dialog state
  const [resendConfirmDialog, setResendConfirmDialog] = useState<{
    open: boolean;
    signatureId: string | null;
  }>({
    open: false,
    signatureId: null,
  });

  // Fetch data from server
  const fetchSignatures = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSignatures({
        maxResultCount: 1000, // Get all for split view
        sorting: sortColumn ? `${sortColumn} ${sortDirection.toUpperCase()}` : undefined,
        statusFilter,
        clientTypeFilter,
        documentNameFilter,
        searchQuery
      });
      
      setSignatureRequests(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch signatures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters/sort changes
  useEffect(() => {
    fetchSignatures();
  }, [sortColumn, sortDirection, statusFilter, clientTypeFilter, documentNameFilter, searchQuery]);

  // Cleanup old resent signature entries
  useEffect(() => {
    const now = new Date().getTime();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const cleanedResentSignatures: Record<string, number> = {};
    
    Object.entries(resentSignatures).forEach(([id, timestamp]) => {
      if (now - timestamp < threeDaysInMs) {
        cleanedResentSignatures[id] = timestamp;
      }
    });
    
    if (Object.keys(cleanedResentSignatures).length !== Object.keys(resentSignatures).length) {
      setResentSignatures(cleanedResentSignatures);
      localStorage.setItem('resentSignatures', JSON.stringify(cleanedResentSignatures));
    }
  }, [resentSignatures]);

  // Calculate stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    partial: 0,
    recent: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allResponse = await apiService.getSignatures({ maxResultCount: 1000 });
        const now = new Date();
        
        const completed = allResponse.items.filter(r => r.status === 'completed').length;
        const pending = allResponse.items.filter(r => r.status === 'sent' || r.status === 'viewed' || r.status === 'partial').length;
        const partial = allResponse.items.filter(r => r.status === 'partial').length;
        const recent = allResponse.items.filter(r => {
          if (r.status !== 'completed') return false;
          const sentDate = new Date(r.sentAt);
          const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length;
        const overdue = allResponse.items.filter(r => {
          if (r.status === 'completed') return false;
          
          const resentTimestamp = resentSignatures[r.id];
          if (resentTimestamp) {
            const overdueDaysInMs = overdueDays * 24 * 60 * 60 * 1000;
            if (now.getTime() - resentTimestamp < overdueDaysInMs) {
              return false;
            }
          }
          
          const sentDate = new Date(r.sentAt);
          const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > overdueDays;
        }).length;

        setStats({
          total: allResponse.totalCount,
          completed,
          pending,
          overdue,
          partial,
          recent
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [overdueDays, resentSignatures]);

  const isRecentlySigned = (request: SignatureRequest): boolean => {
    if (request.status !== 'completed') return false;
    const sentDate = new Date(request.sentAt);
    const now = new Date();
    const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const isSignedInLast48Hours = (request: SignatureRequest): boolean => {
    if (request.status !== 'completed') return false;
    const sentDate = new Date(request.sentAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  const isOverdue = (request: SignatureRequest): boolean => {
    if (request.status === 'completed') return false;
    
    const resentTimestamp = resentSignatures[request.id];
    if (resentTimestamp) {
      const now = new Date().getTime();
      const overdueDaysInMs = overdueDays * 24 * 60 * 60 * 1000;
      if (now - resentTimestamp < overdueDaysInMs) {
        return false;
      }
    }
    
    const sentDate = new Date(request.sentAt);
    const now = new Date();
    const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > overdueDays;
  };

  const getDaysOld = (request: SignatureRequest): number => {
    const sentDate = new Date(request.sentAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Split requests into active and completed
  const activeRequests = signatureRequests.filter(r => r.status !== 'completed');
  const completedRequests = signatureRequests.filter(r => r.status === 'completed');

  // Paginate each separately
  const paginatedActiveRequests = activeRequests.slice(
    (activeCurrentPage - 1) * itemsPerPage,
    activeCurrentPage * itemsPerPage
  );
  const paginatedCompletedRequests = completedRequests.slice(
    (completedCurrentPage - 1) * itemsPerPage,
    completedCurrentPage * itemsPerPage
  );

  const activeTotalPages = Math.ceil(activeRequests.length / itemsPerPage);
  const completedTotalPages = Math.ceil(completedRequests.length / itemsPerPage);

  const filteredOverdueCount = activeRequests.filter(request => isOverdue(request)).length;

  const handleResendClick = (requestId: string) => {
    setResendConfirmDialog({
      open: true,
      signatureId: requestId,
    });
  };

  const handleResendConfirm = async () => {
    if (!resendConfirmDialog.signatureId) return;
    
    try {
      const now = new Date().getTime();
      const updatedResentSignatures = {
        ...resentSignatures,
        [resendConfirmDialog.signatureId]: now,
      };
      setResentSignatures(updatedResentSignatures);
      localStorage.setItem('resentSignatures', JSON.stringify(updatedResentSignatures));
      
      setResendConfirmDialog({ open: false, signatureId: null });
      console.log('Signature request resent successfully');
    } catch (error) {
      console.error('Failed to resend signature:', error);
    }
  };

  const handleBulkResendConfirm = async (selectedIds: string[]) => {
    try {
      const now = new Date().getTime();
      const updatedResentSignatures = { ...resentSignatures };
      
      selectedIds.forEach(id => {
        updatedResentSignatures[id] = now;
      });
      
      setResentSignatures(updatedResentSignatures);
      localStorage.setItem('resentSignatures', JSON.stringify(updatedResentSignatures));
      
      console.log(`${selectedIds.length} signature request(s) resent successfully`);
    } catch (error) {
      console.error('Failed to bulk resend signatures:', error);
    }
  };

  const [overdueSignatures, setOverdueSignatures] = useState<SignatureRequest[]>([]);

  const fetchOverdueSignatures = async () => {
    try {
      const response = await apiService.getSignatures({
        maxResultCount: 1000,
        statusFilter,
        clientTypeFilter,
        documentNameFilter,
        searchQuery
      });
      
      const overdue = response.items.filter(request => isOverdue(request));
      setOverdueSignatures(overdue);
    } catch (error) {
      console.error('Failed to fetch overdue signatures:', error);
      setOverdueSignatures([]);
    }
  };

  useEffect(() => {
    if (showBulkResendDialog) {
      fetchOverdueSignatures();
    }
  }, [showBulkResendDialog, resentSignatures, statusFilter, clientTypeFilter, documentNameFilter, searchQuery]);

  const toggleRowExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1" />;
  };

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setActiveCurrentPage(1);
    setCompletedCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setActiveCurrentPage(1);
    setCompletedCurrentPage(1);
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCardOrder(newOrder);
    localStorage.setItem('signaturesCardOrder', JSON.stringify(newOrder));
  };

  const cardConfigs: Record<StatCardType, StatCardConfig> = {
    all: {
      id: 'all',
      label: 'Total',
      label2: 'Requests',
      icon: <FileSignature className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />,
      color: 'var(--primaryColor)',
      bgColor: 'rgba(124, 58, 237, 0.1)',
      getValue: (stats) => stats.total,
    },
    completed: {
      id: 'completed',
      label: 'Fully',
      label2: 'Signed',
      icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      color: '#16a34a',
      bgColor: 'rgb(220, 252, 231)',
      getValue: (stats) => stats.completed,
    },
    sent: {
      id: 'sent',
      label: 'Pending',
      label2: 'Signatures',
      icon: <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: '#2563eb',
      bgColor: 'rgb(219, 234, 254)',
      getValue: (stats) => stats.pending,
      filterValue: 'pending' as StatusFilter,
    },
    partial: {
      id: 'partial',
      label: 'Partially',
      label2: 'Signed',
      icon: <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
      color: '#ca8a04',
      bgColor: 'rgb(254, 249, 195)',
      getValue: (stats) => stats.partial,
    },
    recent: {
      id: 'recent',
      label: 'Recently',
      label2: 'Signed',
      icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: '#059669',
      bgColor: 'rgb(209, 250, 229)',
      getValue: (stats) => stats.recent,
    },
  };

  const getStatusBadge = (request: SignatureRequest) => {
    switch (request.status) {
      case 'completed':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            Partially Signed
          </Badge>
        );
      case 'viewed':
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50">
            <Eye className="w-3 h-3 mr-1" />
            Viewed
          </Badge>
        );
      case 'sent':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            <Send className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case 'unsigned':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unsigned
          </Badge>
        );
    }
  };

  const getDocumentTypeBadge = (type: SignatureRequest['documentType']) => {
    switch (type) {
      case '8879':
        return (
          <Badge variant="outline" style={{ 
            color: 'var(--primaryColor)', 
            borderColor: 'var(--primaryColor)',
            backgroundColor: 'rgba(124, 58, 237, 0.1)'
          }}>
            IRS 8879
          </Badge>
        );
      case 'template':
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
            Template
          </Badge>
        );
      case 'custom':
        return (
          <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50">
            Custom
          </Badge>
        );
    }
  };

  const uniqueDocumentNames = Array.from(new Set(signatureRequests.map(r => r.documentName))).sort();

  // Render table function (reusable for both active and completed)
  const renderSignatureTable = (
    requests: SignatureRequest[],
    isCompleted: boolean = false
  ) => {
    const headerStyle = isCompleted 
      ? { background: 'transparent' } // Match row background
      : { backgroundColor: 'var(--primaryColor)' }; // Solid primary color, no gradient

    return (
      <table className="w-full table-fixed">
        <thead>
          <tr style={headerStyle}>
            <th className="px-4 py-4 text-center w-[60px]">
              <div className={cn(
                "text-xs uppercase tracking-wide",
                isCompleted ? "opacity-0" : "text-white/90"
              )}></div>
            </th>
            <th className="px-6 py-4 text-left w-[260px]">
              <button
                onClick={() => handleSort('clientName')}
                className={cn(
                  "text-xs uppercase tracking-wide flex items-center transition-colors",
                  isCompleted ? "opacity-0 pointer-events-none" : "text-white/90 hover:text-white"
                )}
              >
                Client Name
                {getSortIcon('clientName')}
              </button>
            </th>
            <th className="px-6 py-4 text-left w-[220px]">
              <button
                onClick={() => handleSort('documentName')}
                className={cn(
                  "text-xs uppercase tracking-wide flex items-center transition-colors",
                  isCompleted ? "opacity-0 pointer-events-none" : "text-white/90 hover:text-white"
                )}
              >
                Document Name
                {getSortIcon('documentName')}
              </button>
            </th>
            <th className="px-6 py-4 text-left w-[180px]">
              <button
                onClick={() => handleSort('sentAt')}
                className={cn(
                  "text-xs uppercase tracking-wide flex items-center transition-colors",
                  isCompleted ? "opacity-0 pointer-events-none" : "text-white/90 hover:text-white"
                )}
              >
                Sent At
                {getSortIcon('sentAt')}
              </button>
            </th>
            <th className="px-6 py-4 text-left w-[100px]">
              <div className={cn(
                "text-xs uppercase tracking-wide",
                isCompleted ? "opacity-0" : "text-white/90"
              )}>Year</div>
            </th>
            <th className="px-6 py-4 text-left w-[160px]">
              <div className={cn(
                "text-xs uppercase tracking-wide",
                isCompleted ? "opacity-0" : "text-white/90"
              )}>Source</div>
            </th>
            <th className="px-6 py-4 text-left w-[220px]">
              <div className={cn(
                "text-xs uppercase tracking-wide",
                isCompleted ? "opacity-0" : "text-white/90"
              )}>Recipients</div>
            </th>
            <th className="px-6 py-4 text-left w-[150px]">
              <button
                onClick={() => handleSort('status')}
                className={cn(
                  "text-xs uppercase tracking-wide flex items-center transition-colors",
                  isCompleted ? "opacity-0 pointer-events-none" : "text-white/90 hover:text-white"
                )}
              >
                Status
                {getSortIcon('status')}
              </button>
            </th>
            <th className="px-6 py-4 text-center w-[100px]">
              <div className={cn(
                "text-xs uppercase tracking-wide",
                isCompleted ? "opacity-0" : "text-white/90"
              )}>Actions</div>
            </th>
          </tr>
        </thead>

        <tbody className={cn(
          "divide-y",
          isCompleted 
            ? "divide-green-200/30 dark:divide-green-800/30 bg-green-50/10 dark:bg-green-900/5" 
            : "divide-gray-200 dark:divide-gray-700"
        )}>
          {requests.map((request) => {
            const isExpanded = expandedRows.has(request.id);
            const rowHoverClass = isCompleted
              ? "hover:bg-green-100/30 dark:hover:bg-green-900/15"
              : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50";
            
            return (
              <React.Fragment key={request.id}>
                <tr className={cn(rowHoverClass, "transition-colors")}>
                  {/* Expand Toggle */}
                  <td className="px-4 py-5">
                    <div className="flex justify-center">
                      {request.status !== 'sent' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpanded(request.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </Button>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  </td>

                  {/* Client Name */}
                  <td className="px-6 py-5">
                    <div 
                      className={cn("flex items-center gap-3", request.status !== 'sent' && "cursor-pointer")}
                      onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        request.clientType === 'Business' 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-green-500 to-green-600"
                      )}>
                        {request.clientType === 'Business' ? (
                          <Building2 className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap group/clientname">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('View document:', request.id);
                            }}
                            className="text-gray-900 dark:text-gray-100 truncate hover:underline"
                          >
                            {request.clientName}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clients?clientId=${request.clientId}`);
                            }}
                            className="opacity-0 group-hover/clientname:opacity-100 transition-opacity p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded shrink-0"
                            title="Open client folder"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          </button>
                          {request.status === 'completed' && isSignedInLast48Hours(request) && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-4 dark:bg-emerald-900/30 dark:text-emerald-400">
                              NEW
                            </Badge>
                          )}
                          {isOverdue(request) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help inline-flex">
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 h-4 px-1.5 text-[10px] flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      {getDaysOld(request)}d
                                    </Badge>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">
                                    <strong>Overdue Badge</strong><br />
                                    This signature has been pending for more than {overdueDays} day{overdueDays !== 1 ? 's' : ''}. The number shows how many days old the request is.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Document Name */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative group/preview">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                            style={{ backgroundColor: isCompleted ? 'rgba(22, 163, 74, 0.1)' : 'rgba(124, 58, 237, 0.1)' }}>
                            <FileSignature className="w-5 h-5" style={{ color: isCompleted ? '#16a34a' : 'var(--primaryColor)' }} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-gray-100 truncate">{request.documentName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDocumentTypeBadge(request.documentType)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sent At */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    <div className="flex flex-col gap-0.5">
                      {(() => {
                        const formatted = formatDateTime(request.sentAt);
                        const [date, time] = formatted.split('\n');
                        return (
                          <>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{date}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Year */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    <div className="text-gray-700 dark:text-gray-300">{request.year}</div>
                  </td>

                  {/* Source */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    <div className="flex flex-col gap-1">
                      {request.source === 'workflow' ? (
                        <>
                          <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-400">
                            <Workflow className="w-4 h-4" />
                            <span>Automated</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-5 truncate">{request.workflowName}</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                            <User className="w-4 h-4" />
                            <span>Manual</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-5 truncate">{request.sentBy}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Recipients */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                        {request.recipients.map(r => r.name).join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {request.totalSigned} of {request.totalSent} signed
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td 
                    className={cn("px-6 py-5", request.status !== 'sent' && "cursor-pointer")}
                    onClick={() => request.status !== 'sent' && toggleRowExpanded(request.id)}
                  >
                    {getStatusBadge(request)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-1">
                      {isOverdue(request) && request.status !== 'completed' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResendClick(request.id);
                                }}
                              >
                                <MailPlus className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="text-xs">
                                Pending over {overdueDays} {overdueDays === 1 ? 'day' : 'days'}. Number shows total days.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                          </DropdownMenuItem>
                          {request.status === 'completed' && (
                            <>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                View Audit Trail
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status !== 'completed' && (
                            <>
                              <DropdownMenuItem>
                                <MailPlus className="w-4 h-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>

                {/* Expanded Recipients Row */}
                {isExpanded && (
                  <tr key={`${request.id}-expanded`}>
                    <td colSpan={9} className="p-0">
                      <div className={cn(
                        "border-t",
                        isCompleted
                          ? "bg-green-100/30 dark:bg-green-900/15 border-green-200/30 dark:border-green-800/30"
                          : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      )}>
                        {request.recipients.map((recipient, index) => (
                          <div
                            key={recipient.id}
                            className={cn(
                              "px-6 py-3 grid grid-cols-[60px_1fr_1fr_180px_100px_160px_280px_150px_100px] gap-4 items-center",
                              index < request.recipients.length - 1 && "border-b",
                              isCompleted 
                                ? "border-green-200/30 dark:border-green-800/30"
                                : "border-gray-200 dark:border-gray-700"
                            )}
                          >
                            <div></div>
                            
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                recipient.signedAt ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"
                              )}>
                                {recipient.signedAt ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{recipient.name}</span>
                                  {recipient.role && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ 
                                      color: 'var(--primaryColor)', 
                                      borderColor: 'var(--primaryColor)',
                                      backgroundColor: 'rgba(124, 58, 237, 0.05)'
                                    }}>
                                      {recipient.role}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
                              </div>
                            </div>

                            <div></div>

                            <div className="flex flex-col gap-1">
                              {recipient.viewedAt && (
                                <div className="text-xs">
                                  <div className="text-gray-500 dark:text-gray-400">Viewed:</div>
                                  <div className="text-gray-900 dark:text-gray-100">
                                    {recipient.viewedAt.split(' ')[0]}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {recipient.viewedAt.split(' ').slice(1).join(' ')}
                                  </div>
                                </div>
                              )}
                              {recipient.signedAt && (
                                <div className="text-xs mt-1">
                                  <div className="text-gray-500 dark:text-gray-400">Signed:</div>
                                  <div className="text-green-700 dark:text-green-400 font-medium">
                                    {recipient.signedAt.split(' ')[0]}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {recipient.signedAt.split(' ').slice(1).join(' ')}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div></div>

                            <div className="text-xs space-y-2">
                              {recipient.viewedIpAddress && (
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 mb-0.5">Viewed IP:</div>
                                  <div className="text-gray-700 dark:text-gray-300 font-mono">
                                    {recipient.viewedIpAddress}
                                  </div>
                                </div>
                              )}
                              {recipient.signedIpAddress && (
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 mb-0.5">Signed IP:</div>
                                  <div className="text-gray-700 dark:text-gray-300 font-mono">
                                    {recipient.signedIpAddress}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div></div>

                            <div className="pl-4">
                              {recipient.signedAt ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs px-2 py-1">
                                  <Check className="w-3 h-3 mr-1" />
                                  Signed
                                </Badge>
                              ) : recipient.viewedAt ? (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50 text-xs px-2 py-1">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Viewed
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50 text-xs px-2 py-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>

                            <div></div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 dark:text-gray-100">Signatures</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalCount} signature request{totalCount !== 1 ? 's' : ''} ({activeRequests.length} active, {completedRequests.length} completed)
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {cardOrder.map((cardId, index) => (
              <DraggableStatCard
                key={cardId}
                config={cardConfigs[cardId]}
                index={index}
                stats={stats}
                statusFilter={statusFilter}
                onFilterChange={handleFilterChange}
                moveCard={moveCard}
              />
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search signatures..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              {/* Client Type Filter */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => {
                    setClientTypeFilter('all');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs transition-colors",
                    clientTypeFilter === 'all' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setClientTypeFilter('Individual');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                    clientTypeFilter === 'Individual' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'Individual' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <User className="w-3.5 h-3.5" />
                  Individual
                </button>
                <button
                  onClick={() => {
                    setClientTypeFilter('Business');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                    clientTypeFilter === 'Business' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'Business' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Business
                </button>
              </div>

              {/* Document Name Filter */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => {
                    setDocumentNameFilter('all');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs transition-colors",
                    documentNameFilter === 'all' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={documentNameFilter === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  All Docs
                </button>
                <button
                  onClick={() => {
                    setDocumentNameFilter('8879');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs transition-colors",
                    documentNameFilter === '8879' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={documentNameFilter === '8879' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  8879
                </button>
                <Select
                  value={documentNameFilter === 'all' || documentNameFilter === '8879' ? '' : documentNameFilter}
                  onValueChange={(value) => {
                    setDocumentNameFilter(value);
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                >
                  <SelectTrigger 
                    className="w-[180px] h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    style={
                      documentNameFilter !== 'all' && documentNameFilter !== '8879' 
                        ? { borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }
                        : {}
                    }
                  >
                    <SelectValue placeholder="More..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDocumentNames
                      .filter(name => !name.includes('Form 8879'))
                      .map(name => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(statusFilter !== 'all' || clientTypeFilter !== 'all' || documentNameFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setClientTypeFilter('all');
                    setDocumentNameFilter('all');
                    setSearchQuery('');
                    setActiveCurrentPage(1);
                    setCompletedCurrentPage(1);
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-2"
                style={{ backgroundColor: 'var(--primaryColor)' }}
                onClick={() => setShowNewRequestDialog(true)}
              >
                <Plus className="w-4 h-4" />
                New Signature
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                style={{
                  borderColor: 'var(--primaryColor)',
                  color: 'var(--primaryColor)'
                }}
                onClick={() => navigate('/signature-templates')}
              >
                <FileText className="w-4 h-4" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 text-xs gap-1.5"
                onClick={() => setShowBulkResendDialog(true)}
                title="Bulk Resend Overdue Signatures"
              >
                <MailPlus className="w-3.5 h-3.5" />
                Bulk Resend
                {filteredOverdueCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
                    {filteredOverdueCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setShowSettingsDialog(true)}
                title="Signature Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Signatures Table */}
          {isLoading ? (
            <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm p-12">
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primaryColor)' }} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading signatures...</p>
              </div>
            </Card>
          ) : (
            <>
              {paginatedActiveRequests.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 dark:text-gray-100">Active & Pending Signatures</h3>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                        {activeRequests.length}
                      </Badge>
                    </div>
                    
                    {/* View Toggle & Settings */}
                    <div className="flex items-center gap-3">
                      {/* Items Per Page */}
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setActiveCurrentPage(1);
                          setCompletedCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[110px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 / page</SelectItem>
                          <SelectItem value="10">10 / page</SelectItem>
                          <SelectItem value="25">25 / page</SelectItem>
                          <SelectItem value="50">50 / page</SelectItem>
                          <SelectItem value="100">100 / page</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* View Toggle */}
                      <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "gap-1.5 h-7 px-3 text-xs",
                            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          )}
                          onClick={() => {
                            localStorage.setItem('signaturesViewPreference', 'single');
                            navigate('/signatures');
                          }}
                        >
                          <List className="w-3.5 h-3.5" />
                          Table View
                        </Button>
                        <Button
                          size="sm"
                          className={cn(
                            "gap-1.5 h-7 px-3 text-xs text-white"
                          )}
                          style={{ backgroundColor: 'var(--primaryColor)' }}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Split Table
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "gap-1.5 h-7 px-3 text-xs",
                            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          )}
                          onClick={() => {
                            localStorage.setItem('signaturesViewPreference', 'simple');
                            navigate('/signatures/simple');
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Card View
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
                    {renderSignatureTable(paginatedActiveRequests, false)}
                    <TablePaginationCompact 
                      currentPage={activeCurrentPage}
                      totalPages={activeTotalPages}
                      onPageChange={setActiveCurrentPage}
                    />
                  </Card>
                </div>
              )}

              {/* Completed Signatures Table - Subtle Green Theme */}
              {paginatedCompletedRequests.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                      <h3 className="text-gray-900 dark:text-gray-100">Completed Signatures</h3>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-400/70 dark:border-green-600/70">
                        {completedRequests.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
                    <Card className="border-0 shadow-none bg-transparent">
                      {renderSignatureTable(paginatedCompletedRequests, true)}
                      <TablePaginationCompact 
                        currentPage={completedCurrentPage}
                        totalPages={completedTotalPages}
                        onPageChange={setCompletedCurrentPage}
                      />
                    </Card>
                  </div>
                </div>
              )}

              {/* No Results */}
              {paginatedActiveRequests.length === 0 && paginatedCompletedRequests.length === 0 && (
                <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm p-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileSignature className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-500 dark:text-gray-400">No signature requests found</p>
                    <Button
                      size="sm"
                      className="gap-2 mt-2"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                      onClick={() => setShowNewRequestDialog(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Create First Request
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Dialogs */}
          <NewSignatureRequestDialog 
            open={showNewRequestDialog} 
            onOpenChange={setShowNewRequestDialog} 
          />

          <BulkResendSignaturesDialog
            open={showBulkResendDialog}
            onOpenChange={setShowBulkResendDialog}
            overdueSignatures={overdueSignatures}
            onResendConfirm={handleBulkResendConfirm}
          />

          <SignatureSettingsDialog
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
            overdueDays={overdueDays}
            onOverdueDaysChange={handleOverdueDaysChange}
          />

          <AlertDialog open={resendConfirmDialog.open} onOpenChange={(open) => {
            if (!open) {
              setResendConfirmDialog({ open: false, signatureId: null });
            }
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resend Signature Request?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will resend the signature request to all recipients. The overdue badge will be hidden for {overdueDays} {overdueDays === 1 ? 'day' : 'days'} after resending.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResendConfirm}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Resend
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DndProvider>
  );
}
