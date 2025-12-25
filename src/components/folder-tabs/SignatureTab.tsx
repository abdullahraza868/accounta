import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Client } from '../../App';
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
  X as XIcon,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertTriangle,
  Workflow,
  GripVertical,
  Filter,
  FilterX,
  Layout
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';
import { NewSignatureRequestDialog } from '../NewSignatureRequestDialog';
import { useAppSettings } from '../../contexts/AppSettingsContext';

type SignatureTabProps = {
  client: Client;
};

type SignatureStatus = 'completed' | 'partial' | 'sent' | 'viewed' | 'unsigned';

type Recipient = {
  id: string;
  name: string;
  email: string;
  role?: string;
  signedAt?: string;
  viewedAt?: string;
  signedIpAddress?: string;
  viewedIpAddress?: string;
};

type SignatureRequest = {
  id: string;
  documentName: string;
  documentType: 'custom' | '8879' | 'template';
  year: number;
  sentAt: string;
  recipients: Recipient[];
  totalSent: number;
  totalSigned: number;
  status: SignatureStatus;
  createdBy: string;
  template?: string;
  sentBy?: string;
  source: 'manual' | 'workflow';
  workflowName?: string;
  thumbnail: string;
};

type AuditEvent = {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
};

type SortColumn = 'documentName' | 'sentAt' | 'status' | null;
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'completed' | 'partial' | 'sent' | 'pending' | 'recent';
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
      <div className="absolute top-2 left-2 text-gray-400 dark:text-gray-600 pointer-events-none z-10">
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => onFilterChange(config.filterValue || config.id as StatusFilter)}
        className="text-left w-full"
      >
        <Card className={cn(
          "p-3 pl-8 border-gray-200/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-move",
          statusFilter === (config.filterValue || config.id) && "ring-2 ring-purple-100 dark:ring-purple-900/30"
        )}
        style={statusFilter === (config.filterValue || config.id) ? { borderColor: 'var(--primaryColor)' } : {}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bgColor }}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight">{config.label}</span>
                {config.label2 && <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight">{config.label2}</span>}
              </div>
              {config.description && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{config.description}</p>}
            </div>
            <div className="flex-shrink-0 ml-auto">
              <p className="text-2xl text-gray-900 dark:text-gray-100 font-bold tabular-nums">{config.getValue(stats)}</p>
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
};

export function SignatureTab({ client }: SignatureTabProps) {
  const navigate = useNavigate();
  const { formatDate, formatDateTime } = useAppSettings();
  const [selectedAuditRequest, setSelectedAuditRequest] = useState<SignatureRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [documentNameFilter, setDocumentNameFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  // Card order state
  const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
    const saved = localStorage.getItem('clientSignaturesCardOrder');
    return saved ? JSON.parse(saved) : ['all', 'recent', 'partial', 'sent', 'completed'];
  });

  // Get overdue days from main signatures page setting
  const [overdueDays] = useState<number>(() => {
    const saved = localStorage.getItem('signatureOverdueDays');
    return saved ? parseInt(saved) : 3;
  });

  // Track resent signatures
  const [resentSignatures, setResentSignatures] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resentSignatures');
    return saved ? JSON.parse(saved) : {};
  });

  // Resend confirmation dialog
  const [resendConfirmDialog, setResendConfirmDialog] = useState<{
    open: boolean;
    signatureId: string | null;
  }>({
    open: false,
    signatureId: null,
  });

  // Mock data - replace with API call
  const allSignatureRequests: SignatureRequest[] = [
    {
      id: '1',
      documentName: 'Engagement Letter 2024',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-10-20 09:21 AM',
      recipients: [
        { 
          id: 'r1', 
          name: 'John Smith', 
          email: 'john@company.com',
          role: 'Primary Contact',
          signedAt: '2024-10-20 11:30 AM', 
          viewedAt: '2024-10-20 09:45 AM',
          signedIpAddress: '192.168.1.100'
        },
        { 
          id: 'r2', 
          name: 'Jane Smith', 
          email: 'jane@company.com',
          role: 'Secondary Contact',
          signedAt: '2024-10-20 02:15 PM', 
          viewedAt: '2024-10-20 10:00 AM',
          signedIpAddress: '192.168.1.100'
        },
      ],
      totalSent: 2,
      totalSigned: 2,
      status: 'completed',
      createdBy: 'Sarah Johnson',
      sentBy: 'Sarah Johnson',
      template: 'Standard Engagement Letter',
      source: 'manual',
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      documentName: 'Form 8879',
      documentType: '8879',
      year: 2024,
      sentAt: '2024-10-18 02:30 PM',
      recipients: [
        { 
          id: 'r3', 
          name: 'John Smith', 
          email: 'john@company.com',
          role: 'Primary Taxpayer',
          signedAt: '2024-10-18 04:20 PM', 
          viewedAt: '2024-10-18 02:45 PM',
          signedIpAddress: '192.168.1.101'
        },
      ],
      totalSent: 1,
      totalSigned: 1,
      status: 'completed',
      createdBy: 'Mike Brown',
      sentBy: 'Mike Brown',
      source: 'workflow',
      workflowName: 'Tax Filing Auto-Send',
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      documentName: 'Tax Authorization',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-15 11:00 AM',
      recipients: [
        { 
          id: 'r4', 
          name: 'John Smith', 
          email: 'john@company.com',
          role: 'CEO',
          viewedAt: '2024-10-15 11:15 AM'
        },
        { 
          id: 'r5', 
          name: 'Jane Smith', 
          email: 'jane@company.com',
          role: 'CFO',
          signedAt: '2024-10-15 03:00 PM', 
          viewedAt: '2024-10-15 11:20 AM',
          signedIpAddress: '192.168.1.102'
        },
      ],
      totalSent: 2,
      totalSigned: 1,
      status: 'partial',
      createdBy: 'Sarah Johnson',
      sentBy: 'Sarah Johnson',
      source: 'manual',
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '4',
      documentName: 'Privacy Policy 2024',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-10 10:00 AM',
      recipients: [
        { 
          id: 'r6', 
          name: 'John Smith', 
          email: 'john@company.com',
          role: 'Owner',
          viewedAt: '2024-10-10 10:30 AM'
        },
      ],
      totalSent: 1,
      totalSigned: 0,
      status: 'sent',
      createdBy: 'Mike Brown',
      sentBy: 'Mike Brown',
      source: 'manual',
      thumbnail: 'https://via.placeholder.com/150'
    },
    {
      id: '5',
      documentName: 'Q3 Tax Forms',
      documentType: 'custom',
      year: 2024,
      sentAt: '2025-10-25 03:00 PM',
      recipients: [
        { 
          id: 'r7', 
          name: 'John Smith', 
          email: 'john@company.com',
          role: 'Primary',
          signedAt: '2025-10-27 09:15 AM', 
          viewedAt: '2025-10-25 03:30 PM',
          signedIpAddress: '192.168.1.103'
        },
      ],
      totalSent: 1,
      totalSigned: 1,
      status: 'completed',
      createdBy: 'Sarah Johnson',
      sentBy: 'Sarah Johnson',
      source: 'manual',
      thumbnail: 'https://via.placeholder.com/150'
    },
  ];

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

  // Helper functions
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

  const getAuditTrail = (request: SignatureRequest): AuditEvent[] => {
    const events: AuditEvent[] = [
      {
        id: 'e1',
        timestamp: request.sentAt,
        action: 'Document Created',
        user: request.createdBy,
        details: `Created and sent to ${request.totalSent} recipient${request.totalSent > 1 ? 's' : ''}`
      }
    ];

    request.recipients.forEach(recipient => {
      if (recipient.viewedAt) {
        events.push({
          id: `viewed-${recipient.id}`,
          timestamp: recipient.viewedAt,
          action: 'Document Viewed',
          user: recipient.name,
          details: `${recipient.email}${recipient.viewedIpAddress ? ` from ${recipient.viewedIpAddress}` : ''}`
        });
      }
      if (recipient.signedAt) {
        events.push({
          id: `signed-${recipient.id}`,
          timestamp: recipient.signedAt,
          action: 'Document Signed',
          user: recipient.name,
          details: `${recipient.email}${recipient.signedIpAddress ? ` from ${recipient.signedIpAddress}` : ''}`
        });
      }
    });

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return events;
  };

  const getStatusBadge = (request: SignatureRequest) => {
    switch (request.status) {
      case 'completed':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 hover:bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 hover:bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            Partially Signed
          </Badge>
        );
      case 'viewed':
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 hover:bg-purple-50">
            <Eye className="w-3 h-3 mr-1" />
            Viewed
          </Badge>
        );
      case 'sent':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-50">
            <Send className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case 'unsigned':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-50">
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
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
            Template
          </Badge>
        );
      case 'custom':
        return (
          <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
            Custom
          </Badge>
        );
    }
  };

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

  const toggleRowExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  // Stats
  const totalRequests = allSignatureRequests.length;
  const completedRequests = allSignatureRequests.filter(r => r.status === 'completed').length;
  const pendingRequests = allSignatureRequests.filter(r => r.status === 'sent' || r.status === 'viewed' || r.status === 'partial').length;
  const partialRequests = allSignatureRequests.filter(r => r.status === 'partial').length;
  const recentlySignedRequests = allSignatureRequests.filter(r => isRecentlySigned(r)).length;

  const stats = {
    total: totalRequests,
    completed: completedRequests,
    pending: pendingRequests,
    partial: partialRequests,
    recent: recentlySignedRequests,
  };

  // Filtering
  let filteredRequests = allSignatureRequests.filter(req => {
    const matchesSearch = req.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = false;
    if (statusFilter === 'all') {
      matchesFilter = true;
    } else if (statusFilter === 'recent') {
      matchesFilter = isRecentlySigned(req);
    } else if (statusFilter === 'pending') {
      matchesFilter = req.status === 'sent' || req.status === 'viewed' || req.status === 'partial';
    } else {
      matchesFilter = req.status === statusFilter;
    }

    const matchesDocumentName = documentNameFilter === 'all' || req.documentName === documentNameFilter;
    
    return matchesSearch && matchesFilter && matchesDocumentName;
  });

  // Separate into active and completed
  const activeRequests = filteredRequests.filter(r => r.status !== 'completed');
  const completedRequestsFiltered = filteredRequests.filter(r => r.status === 'completed');

  // Collapsible state for completed section (open by default on client folder page)
  const [completedSectionCollapsed, setCompletedSectionCollapsed] = useState(false);

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Move card function for drag and drop
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCardOrder(newOrder);
    localStorage.setItem('clientSignaturesCardOrder', JSON.stringify(newOrder));
  };

  // Card configurations
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

  // Render a table section
  const renderTableSection = (requests: SignatureRequest[], title: string, emptyMessage: string, isCompleted: boolean = false) => {
    if (requests.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          {title}
          <Badge variant="outline" className="ml-1">{requests.length}</Badge>
        </h3>
        <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div 
            className="px-4 py-3 grid grid-cols-[40px_1.5fr_2fr_140px_100px_140px_110px_80px] gap-4 items-center"
            style={{
              background: isCompleted 
                ? 'linear-gradient(to right, #16a34a, #15803d)' 
                : 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
            }}
          >
            <div className="text-xs uppercase tracking-wide text-white/90"></div>
            <div className="text-xs uppercase tracking-wide text-white/90">Client</div>
            <div className="text-xs uppercase tracking-wide text-white/90">Document Name</div>
            <div className="text-xs uppercase tracking-wide text-white/90">Sent At</div>
            <div className="text-xs uppercase tracking-wide text-white/90">Year</div>
            <div className="text-xs uppercase tracking-wide text-white/90">Source</div>
            <div className="text-xs uppercase tracking-wide text-white/90">Status</div>
            <div className="text-xs uppercase tracking-wide text-white/90 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => {
              const isExpanded = expandedRows.has(request.id);
              
              return (
                <div key={request.id}>
                  {/* Main Row */}
                  <div className="px-4 py-3 grid grid-cols-[40px_1.5fr_2fr_140px_100px_140px_110px_80px] gap-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Expand Toggle */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpanded(request.id)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      </Button>
                    </div>

                    {/* Client Name - with hover link */}
                    <div className="group/client">
                      <button
                        onClick={() => console.log('View document:', request.id)}
                        className="text-sm text-gray-700 dark:text-gray-300 group-hover/client:underline group-hover/client:text-purple-600 dark:group-hover/client:text-purple-400 transition-colors text-left"
                      >
                        {client.name}
                      </button>
                    </div>

                    {/* Document Name with thumbnail */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {/* Document Thumbnail with Hover Preview */}
                        <div className="relative group/preview">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                            style={{ backgroundColor: 'rgba(var(--primaryColorBtnRgb), 0.1)' }}
                          >
                            <img 
                              src={request.thumbnail} 
                              alt={request.documentName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <FileSignature className="w-4 h-4 hidden" style={{ color: 'var(--primaryColor)' }} />
                          </div>
                          {/* Preview on Hover */}
                          <div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block">
                            <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4"
                              style={{ borderColor: 'rgba(var(--primaryColorBtnRgb), 0.3)' }}
                            >
                              <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                                <img 
                                  src={request.thumbnail} 
                                  alt={request.documentName}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{request.documentName}</span>
                        {isSignedInLast48Hours(request) && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 h-5 px-1.5 text-[10px] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEW
                          </Badge>
                        )}
                        {isOverdue(request) && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 h-5 px-1.5 text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {getDaysOld(request)}d
                          </Badge>
                        )}
                      </div>
                      <div className="ml-10 flex items-center gap-2">
                        {getDocumentTypeBadge(request.documentType)}
                      </div>
                    </div>

                    {/* Sent At */}
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {request.sentAt}
                    </div>

                    {/* Year */}
                    <div className="text-sm text-gray-700 dark:text-gray-300">{request.year}</div>

                    {/* Source */}
                    <div className="flex flex-col gap-1">
                      {request.source === 'workflow' ? (
                        <>
                          <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400">
                            <Workflow className="w-3 h-3" />
                            <span>Automated</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 truncate">{request.workflowName}</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                            <User className="w-3 h-3" />
                            <span>Manual</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 truncate">{request.sentBy}</span>
                        </>
                      )}
                    </div>

                    {/* Status */}
                    <div>{getStatusBadge(request)}</div>

                    {/* Actions */}
                    <div className="flex justify-center gap-1">
                      {/* Show Resend button for overdue items */}
                      {isOverdue(request) && request.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendClick(request.id)}
                          className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                          title="Resend signature request"
                        >
                          <MailPlus className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setSelectedAuditRequest(request)}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Audit Trail
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download Audit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                          </DropdownMenuItem>
                          {request.status !== 'completed' && !isOverdue(request) && (
                            <>
                              <DropdownMenuItem onClick={() => handleResendClick(request.id)}>
                                <MailPlus className="w-4 h-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status !== 'completed' && isOverdue(request) && (
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded Recipients Row */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      <div className="ml-6">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Recipients ({request.totalSigned}/{request.totalSent} signed)
                        </h4>
                        <div className="space-y-2">
                          {request.recipients.map((recipient) => (
                            <div
                              key={recipient.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  recipient.signedAt ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
                                )}>
                                  {recipient.signedAt ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-900 dark:text-gray-100">{recipient.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{recipient.email}</p>
                                  {recipient.role && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.role}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {recipient.signedAt ? (
                                  <>
                                    <p className="text-xs text-green-700 dark:text-green-400">Signed</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.signedAt}</p>
                                    {recipient.signedIpAddress && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.signedIpAddress}</p>
                                    )}
                                  </>
                                ) : recipient.viewedAt ? (
                                  <>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">Viewed</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.viewedAt}</p>
                                    {recipient.viewedIpAddress && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.viewedIpAddress}</p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Not viewed</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // Render completed signatures section - subdued archive design
  const renderCompletedSection = (requests: SignatureRequest[]) => {
    if (requests.length === 0) return null;

    return (
      <div className="mt-8">
        {/* Collapsible Header */}
        <button
          onClick={() => setCompletedSectionCollapsed(!completedSectionCollapsed)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-green-50/30 dark:bg-green-900/10 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors border border-green-200/40 dark:border-green-800/40 mb-3"
        >
          <div className="flex items-center gap-3">
            <ChevronRight className={cn(
              "w-4 h-4 text-green-600/70 dark:text-green-500/70 transition-transform",
              !completedSectionCollapsed && "rotate-90"
            )} />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600/70 dark:text-green-500/70" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Completed Signatures (Archive)</span>
            </div>
            <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300/60 dark:border-green-700/60">
              {requests.length}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completedSectionCollapsed ? 'Click to expand' : 'Click to collapse'}
          </span>
        </button>

        {/* Collapsed Content */}
        {!completedSectionCollapsed && (
          <div className="bg-green-50/20 dark:bg-green-900/5 rounded-lg border border-green-200/30 dark:border-green-800/30 overflow-hidden">
            {/* Compact List View */}
            <div className="divide-y divide-green-200/30 dark:divide-green-800/30">
              {requests.map((request) => {
                const isExpanded = expandedRows.has(request.id);
                
                return (
                  <div key={request.id} className="hover:bg-green-100/20 dark:hover:bg-green-900/10 transition-colors">
                    {/* Compact Row */}
                    <div className="px-4 py-2.5 grid grid-cols-[30px_1.2fr_1.8fr_120px_90px_120px_80px] gap-3 items-center text-sm">
                      {/* Expand Toggle */}
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpanded(request.id)}
                          className="h-6 w-6 p-0 text-green-600/60 hover:text-green-700 hover:bg-green-100/30 dark:text-green-500/60 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <ChevronRight className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </Button>
                      </div>

                      {/* Client Name */}
                      <div className="group/client">
                        <button
                          onClick={() => console.log('View document:', request.id)}
                          className="text-xs text-gray-600 dark:text-gray-400 group-hover/client:underline group-hover/client:text-gray-800 dark:group-hover/client:text-gray-300 transition-colors text-left truncate"
                        >
                          {client.name}
                        </button>
                      </div>

                      {/* Document Name - Simplified */}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600/60 dark:text-green-500/60 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-400 truncate">{request.documentName}</span>
                        {getDocumentTypeBadge(request.documentType)}
                      </div>

                      {/* Sent At */}
                      <div className="text-xs text-gray-500 dark:text-gray-500">{request.sentAt}</div>

                      {/* Year */}
                      <div className="text-xs text-gray-600 dark:text-gray-500">{request.year}</div>

                      {/* Signed Count */}
                      <div className="text-xs text-green-700/80 dark:text-green-500/80">
                        {request.totalSigned}/{request.totalSent} signed
                      </div>

                      {/* Actions - Simplified */}
                      <div className="flex justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedAuditRequest(request)}>
                              <FileText className="w-4 h-4 mr-2" />
                              View Audit Trail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Expanded Recipients - Compact Version */}
                    {isExpanded && (
                      <div className="px-4 py-2 bg-green-100/20 dark:bg-green-900/10 border-t border-green-200/30 dark:border-green-800/30">
                        <div className="ml-8 space-y-1.5">
                          {request.recipients.map((recipient) => (
                            <div
                              key={recipient.id}
                              className="flex items-center justify-between py-1.5 px-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600/80 dark:text-green-500/80 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-400">{recipient.name}</span>
                                <span className="text-gray-400 dark:text-gray-500">·</span>
                                <span className="text-gray-500 dark:text-gray-500">{recipient.email}</span>
                              </div>
                              <span className="text-gray-400 dark:text-gray-500">{recipient.signedAt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get unique document names for filter
  const uniqueDocumentNames = Array.from(new Set(allSignatureRequests.map(r => r.documentName))).sort();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">Signature Requests</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredRequests.length} signature request{filteredRequests.length !== 1 ? 's' : ''} for {client.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/signatures/templates')}
              className="gap-2"
            >
              <Layout className="w-4 h-4" />
              Templates
            </Button>
            <Button
              size="sm"
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
              onClick={() => setShowNewRequestDialog(true)}
            >
              <Plus className="w-4 h-4" />
              New Signature Request
            </Button>
          </div>
        </div>

        {/* Stats Bar - Draggable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
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
        <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search signatures..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Document Name Filter */}
              {uniqueDocumentNames.length > 1 && (
                <Select
                  value={documentNameFilter}
                  onValueChange={(value) => setDocumentNameFilter(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Documents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    {uniqueDocumentNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || documentNameFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Active filters:
              </span>
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Status: {statusFilter}
                  <button onClick={() => handleFilterChange('all')} className="ml-1 hover:text-red-600">
                    <XIcon className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {documentNameFilter !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Document: {documentNameFilter}
                  <button onClick={() => setDocumentNameFilter('all')} className="ml-1 hover:text-red-600">
                    <XIcon className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="outline" className="gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => handleSearchChange('')} className="ml-1 hover:text-red-600">
                    <XIcon className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setDocumentNameFilter('all');
                  setSearchQuery('');
                }}
                className="h-6 text-xs gap-1"
              >
                <FilterX className="w-3 h-3" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Tables - Separated by Status */}
        {filteredRequests.length > 0 ? (
          <>
            {/* Active/Pending Signatures */}
            {renderTableSection(
              activeRequests, 
              'Active & Pending Signatures', 
              'No active signatures',
              false
            )}

            {/* Completed Signatures - Archive Style */}
            {renderCompletedSection(completedRequestsFiltered)}
          </>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <FileSignature className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">No signature requests found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || documentNameFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : `Get started by creating a new signature request for ${client.name}`}
            </p>
            {(searchQuery || statusFilter !== 'all' || documentNameFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDocumentNameFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}

        {/* Audit Trail Dialog */}
        <Dialog open={!!selectedAuditRequest} onOpenChange={(open) => !open && setSelectedAuditRequest(null)}>
          <DialogContent className="max-w-2xl" aria-describedby="audit-trail-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                Audit Trail
              </DialogTitle>
              <DialogDescription id="audit-trail-description">
                {selectedAuditRequest?.documentName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto">
              {selectedAuditRequest && getAuditTrail(selectedAuditRequest).map((event) => (
                <div key={event.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{event.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{event.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{event.user}</p>
                    {event.details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Resend Confirmation Dialog */}
        <AlertDialog open={resendConfirmDialog.open} onOpenChange={(open) => setResendConfirmDialog({ open, signatureId: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resend Signature Request?</AlertDialogTitle>
              <AlertDialogDescription>
                This will send a reminder email to all recipients who haven't signed yet. The overdue badge will be hidden for the next {overdueDays} days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResendConfirm} style={{ backgroundColor: 'var(--primaryColor)' }}>
                Resend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New Signature Request Dialog */}
        <NewSignatureRequestDialog 
          open={showNewRequestDialog} 
          onOpenChange={setShowNewRequestDialog}
          clientName={client.name}
        />
      </div>
    </DndProvider>
  );
}