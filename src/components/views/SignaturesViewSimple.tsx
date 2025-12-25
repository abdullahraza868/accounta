import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  FileSignature, 
  CheckCircle, 
  Clock,
  Eye,
  User,
  Users,
  Calendar,
  Check,
  AlertCircle,
  Building2,
  Sparkles,
  List,
  LayoutGrid,
  Flame,
  Mail,
  Workflow,
  X as XIcon,
  Search,
  Plus,
  FileText,
  MailPlus,
  Settings,
  GripVertical,
  Send,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { cn } from '../ui/utils';
import { ClientNameWithLink } from '../ClientNameWithLink';
import { apiService } from '../../services/ApiService';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { NewSignatureRequestDialog } from '../NewSignatureRequestDialog';
import { BulkResendSignaturesDialog } from '../BulkResendSignaturesDialog';
import { SignatureSettingsDialog } from '../SignatureSettingsDialog';
import { Concept1Card, Concept3Card, Concept3BCard } from '../SignatureCardConcepts';

type SignatureStatus = 'completed' | 'partial' | 'sent' | 'viewed' | 'unsigned';
type StatusFilter = 'all' | 'completed' | 'partial' | 'sent' | 'pending' | 'recent';
type StatCardType = 'all' | 'completed' | 'sent' | 'partial' | 'recent';
type ClientTypeFilter = 'all' | 'Individual' | 'Business';

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

const StatusBadge = ({ status }: { status: SignatureStatus }) => {
  const variants: Record<SignatureStatus, { label: string; className: string }> = {
    completed: { 
      label: 'Completed', 
      className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
    },
    partial: { 
      label: 'Partial', 
      className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
    },
    viewed: { 
      label: 'Viewed', 
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
    },
    sent: { 
      label: 'Sent', 
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' 
    },
    unsigned: { 
      label: 'Unsigned', 
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' 
    }
  };

  const variant = variants[status];
  return (
    <Badge className={cn("text-xs", variant.className)}>
      {variant.label}
    </Badge>
  );
};

const getDocumentTypeBadge = (type: string) => {
  switch (type) {
    case '8879':
      return (
        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
          IRS 8879
        </Badge>
      );
    case 'template':
      return (
        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs">
          Template
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs">
          Custom
        </Badge>
      );
  }
};

export function SignaturesViewSimple() {
  const navigate = useNavigate();
  const { formatDate, formatDateTime } = useAppSettings();
  
  // Check if user prefers another view and redirect
  useEffect(() => {
    const preferredView = localStorage.getItem('signaturesViewPreference');
    if (preferredView === 'single') {
      navigate('/signatures', { replace: true });
    } else if (preferredView === 'split') {
      navigate('/signatures/split', { replace: true });
    }
  }, [navigate]);
  
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');
  const [documentNameFilter, setDocumentNameFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showBulkResendDialog, setShowBulkResendDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    partial: 0,
    recent: 0
  });

  // Card order state - load from localStorage or use default order
  const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
    const saved = localStorage.getItem('signaturesCardOrder');
    return saved ? JSON.parse(saved) : ['all', 'recent', 'partial', 'sent', 'completed'];
  });

  // Overdue days setting
  const [overdueDays, setOverdueDays] = useState<number>(() => {
    const saved = localStorage.getItem('signatureOverdueDays');
    return saved ? parseInt(saved) : 3; // Default back to 3 days
  });

  // Track resent signatures with timestamps
  const [resentSignatures, setResentSignatures] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resentSignatures');
    return saved ? JSON.parse(saved) : {};
  });

  // State for bulk resend overdue signatures
  const [overdueSignatures, setOverdueSignatures] = useState<SignatureRequest[]>([]);

  // Resend confirmation dialog state
  const [resendConfirmDialog, setResendConfirmDialog] = useState<{
    open: boolean;
    signatureId: string | null;
  }>({
    open: false,
    signatureId: null,
  });

  // Card flip state for partially complete cards
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

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

  // Load all data
  useEffect(() => {
    loadData();
  }, [statusFilter, clientTypeFilter, documentNameFilter, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSignatures({
        skipCount: 0,
        maxResultCount: 1000,
        sorting: 'sentAt DESC',
        statusFilter,
        clientTypeFilter,
        documentNameFilter,
        searchQuery
      });

      setSignatureRequests(response.items || []);
      
      // Calculate stats - use all data regardless of filters for stats
      const allResponse = await apiService.getSignatures({
        skipCount: 0,
        maxResultCount: 1000,
        sorting: 'sentAt DESC'
      });
      
      const total = allResponse.totalCount || 0;
      const completed = allResponse.items.filter(r => r.status === 'completed').length;
      const partial = allResponse.items.filter(r => r.status === 'partial').length;
      const pending = allResponse.items.filter(r => r.status === 'sent').length;
      
      const now = new Date();
      const recent = allResponse.items.filter(r => {
        if (r.status !== 'completed') return false;
        const sentDate = new Date(r.sentAt);
        const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).length;

      const overdue = allResponse.items.filter(r => {
        if (r.status === 'completed') return false;
        const sentDate = new Date(r.sentAt);
        const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > overdueDays;
      }).length;

      setStats({ total, completed, pending, overdue, partial, recent });
    } catch (error) {
      console.error('Error loading signatures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRecentlySigned = (request: SignatureRequest): boolean => {
    if (request.status !== 'completed') return false;
    const sentDate = new Date(request.sentAt);
    const now = new Date();
    const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    console.log('isRecentlySigned check:', request.clientName, 'sentAt:', request.sentAt, 'daysDiff:', daysDiff, 'isRecent:', daysDiff <= 7);
    return daysDiff <= 7;
  };

  // Helper to check if a request is overdue
  const isOverdue = (request: SignatureRequest) => {
    const daysSinceSent = Math.floor((new Date().getTime() - new Date(request.sentAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent > overdueDays;
  };

  // Fetch all overdue signatures for bulk resend (respecting current filters)
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

  // Fetch overdue signatures when bulk resend dialog opens or filters change
  useEffect(() => {
    if (showBulkResendDialog) {
      fetchOverdueSignatures();
    }
  }, [showBulkResendDialog, resentSignatures, statusFilter, clientTypeFilter, documentNameFilter, searchQuery]);

  const handleBulkResendConfirm = async (selectedIds: string[]) => {
    try {
      // TODO: Call actual API to resend multiple signatures
      // await apiService.bulkResendSignatures(selectedIds);
      
      // Record the resend timestamp for all selected signatures
      const now = new Date().getTime();
      const updatedResentSignatures = { ...resentSignatures };
      selectedIds.forEach(id => {
        updatedResentSignatures[id] = now;
      });
      setResentSignatures(updatedResentSignatures);
      localStorage.setItem('resentSignatures', JSON.stringify(updatedResentSignatures));
      
      // Close the dialog
      setShowBulkResendDialog(false);
      
      console.log(`Bulk resent ${selectedIds.length} signature requests successfully`);
    } catch (error) {
      console.error('Failed to bulk resend signatures:', error);
    }
  };

  // Move card function for drag and drop
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCardOrder(newOrder);
    localStorage.setItem('signaturesCardOrder', JSON.stringify(newOrder));
  };

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle individual resend click
  const handleResendClick = (requestId: string) => {
    setResendConfirmDialog({
      open: true,
      signatureId: requestId,
    });
  };

  // Handle resend confirmation
  const handleResendConfirm = async () => {
    if (!resendConfirmDialog.signatureId) return;
    
    try {
      // TODO: Call actual API to resend signature
      // await apiService.resendSignature(resendConfirmDialog.signatureId);
      
      // Record the resend timestamp
      const now = new Date().getTime();
      const updatedResentSignatures = {
        ...resentSignatures,
        [resendConfirmDialog.signatureId]: now,
      };
      setResentSignatures(updatedResentSignatures);
      localStorage.setItem('resentSignatures', JSON.stringify(updatedResentSignatures));
      
      // Close the dialog
      setResendConfirmDialog({ open: false, signatureId: null });
      
      console.log('Signature request resent successfully');
    } catch (error) {
      console.error('Failed to resend signature:', error);
    }
  };

  // Get unique document names for filter
  const uniqueDocumentNames = Array.from(new Set(signatureRequests.map(r => r.documentName))).sort();

  // Group signatures by status for display
  const recentlySigned = signatureRequests.filter(isRecentlySigned);
  const partialRequests = signatureRequests.filter(r => r.status === 'partial' || r.status === 'viewed'); // Combined list
  const needsAttention = signatureRequests.filter(r => r.status === 'partial' || r.status === 'viewed'); // Keep for backwards compatibility
  const pending = signatureRequests.filter(r => r.status === 'sent');
  const completed = signatureRequests.filter(r => r.status === 'completed' && !isRecentlySigned(r));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 dark:text-gray-100">Signatures</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.total} signature request{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats Bar - Draggable Cards */}
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
                  onClick={() => setClientTypeFilter('all')}
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
                  onClick={() => setClientTypeFilter('Individual')}
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
                  onClick={() => setClientTypeFilter('Business')}
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
                  onClick={() => setDocumentNameFilter('all')}
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
                  onClick={() => setDocumentNameFilter('8879')}
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
                  onValueChange={(value) => setDocumentNameFilter(value)}
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
                {stats.overdue > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
                    {stats.overdue}
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

          {/* Table Section Header with View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 dark:text-gray-100">Signature Requests</h3>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                {signatureRequests.length}
              </Badge>
            </div>
            
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
                  navigate('/signatures/table');
                }}
              >
                <List className="w-3.5 h-3.5" />
                Table View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs",
                  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                onClick={() => {
                  localStorage.setItem('signaturesViewPreference', 'split');
                  navigate('/signatures/split');
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Split Table
              </Button>
              <Button
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs text-white"
                )}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Card View
              </Button>
            </div>
          </div>

          {/* Card Sections */}
          {/* Recently Signed Section */}
          {recentlySigned.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                <h2 className="text-xl text-gray-900 dark:text-gray-100">Recently Signed</h2>
                <Badge variant="outline" className="ml-2" style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--primaryColor) 15%, transparent)',
                  color: 'var(--primaryColor)',
                  borderColor: 'var(--primaryColor)'
                }}>
                  Last 7 days
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlySigned.map(request => (
                  <Concept3Card 
                    key={request.id} 
                    request={request} 
                    marginTop="-mt-3"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Debug info - temporary */}
          {recentlySigned.length === 0 && signatureRequests.length > 0 && (
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Debug: No recently signed items found. Total requests: {signatureRequests.length}, 
                Completed: {signatureRequests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                Check browser console for date calculations
              </p>
            </div>
          )}

          {/* OLD CODE - Hidden for testing */}
          {false && (
            <>
              <Card 
                key="dummy"
                className="p-0"
              />
            </>
          )}

          {/* Partially Complete Section - COMBINED */}
          {partialRequests.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl text-gray-900 dark:text-gray-100">Partially Complete</h2>
                <Badge variant="outline" className="ml-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  {partialRequests.length} items
                </Badge>
                
                {/* Bulk Resend Button - Show if there are overdue items */}
                {partialRequests.filter(r => isOverdue(r)).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 relative text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 text-xs gap-1.5"
                    onClick={() => setShowBulkResendDialog(true)}
                    title="Bulk Resend Overdue Signatures"
                  >
                    <MailPlus className="w-3.5 h-3.5" />
                    Bulk Resend
                    <Badge className="ml-1 h-5 px-1.5 flex items-center justify-center text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
                      {partialRequests.filter(r => isOverdue(r)).length}
                    </Badge>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {partialRequests.map(request => {
                  const requestOverdue = isOverdue(request);
                  const daysSinceSent = Math.floor((new Date().getTime() - new Date(request.sentAt).getTime()) / (1000 * 60 * 60 * 24));
                  const daysOverdue = daysSinceSent - overdueDays;
                  const hasAnySigned = request.recipients.some(r => r.signedAt);
                  return (
                  <Card 
                    key={request.id} 
                    className={cn(
                      "p-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-full group",
                      requestOverdue 
                        ? "border-orange-200/60 dark:border-orange-700" 
                        : "border-gray-200/60 dark:border-gray-700"
                    )}
                    onClick={() => navigate(`/signatures/${request.id}`)}
                  >
                    {/* Status Bar - ON TOP - conditional styling */}
                    <div className={cn(
                      "px-4 py-2 border-b",
                      requestOverdue 
                        ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/50" 
                        : "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50"
                    )}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {requestOverdue && (
                            <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          )}
                          <span className={cn(
                            "text-xs",
                            requestOverdue 
                              ? "text-orange-700 dark:text-orange-400" 
                              : "text-gray-600 dark:text-gray-400"
                          )}>
                            Partially Complete{requestOverdue && ` (Overdue ⏱️ ${daysOverdue}d)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(request.sentAt).split('\n')[0]}
                          </span>
                          {/* Individual Resend Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendClick(request.id);
                            }}
                            className={cn(
                              "p-1 rounded transition-colors",
                              requestOverdue 
                                ? "hover:bg-orange-100 dark:hover:bg-orange-900/30" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            title="Resend this signature request"
                          >
                            <MailPlus className={cn(
                              "w-3.5 h-3.5",
                              requestOverdue 
                                ? "text-orange-600 dark:text-orange-400" 
                                : "text-gray-600 dark:text-gray-400"
                            )} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                    {/* Top Row - Client Name + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 flex-1 min-w-0 truncate">
                        {request.clientName}
                      </h3>
                    </div>

                    {/* Document Name + Type Badge + Progress Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                        {request.documentName}
                      </p>
                      {getDocumentTypeBadge(request.documentType)}
                      <Badge className={cn(
                        "px-2 py-0.5 text-xs font-medium flex-shrink-0",
                        requestOverdue 
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                      )}>
                        {request.totalSigned}/{request.totalSent}
                      </Badge>
                    </div>

                    {/* Recipients - Compact */}
                    <div className="mb-3 flex-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Recipients ({request.recipients.length}):
                      </p>
                      <div className="space-y-1">
                        {request.recipients.map(recipient => (
                          <div key={recipient.id} className="flex items-center gap-2 text-sm">
                            <span className={cn(
                              "truncate flex-1 flex items-center gap-1.5",
                              recipient.signedAt ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"
                            )}>
                              {recipient.name}
                              {recipient.signedAt ? (
                                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </span>
                              ) : recipient.viewedAt ? (
                                <Eye className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                              )}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {recipient.signedAt 
                                ? formatDate(recipient.signedAt)
                                : recipient.viewedAt 
                                ? "Viewed" 
                                : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Grid - Compact */}
                    <div className="grid grid-cols-3 gap-2 mb-3 pt-2.5 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Year</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{request.year}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sent</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDateTime(request.sentAt).split('\n')[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Source</div>
                        <div className="flex items-center gap-1">
                          {request.source === 'workflow' ? (
                            <>
                              <Workflow className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                {request.workflowName || 'WF'}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-gray-100">Manual</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Preview - Show if any signature exists */}
                    {hasAnySigned && (
                      <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group-hover:shadow-sm transition-shadow">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileSignature className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <span className="text-white text-xs font-medium flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            View Document
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('View document:', request.id);
                        }}
                        disabled={!hasAnySigned}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors",
                          hasAnySigned
                            ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                        )}
                        title={hasAnySigned ? "View document" : "Available after at least one signature"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Download document:', request.id);
                        }}
                        disabled={!hasAnySigned}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors",
                          hasAnySigned
                            ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                        )}
                        title={hasAnySigned ? "Download document" : "Available after at least one signature"}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/signatures/${request.id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        title="View details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </div>

                    </div>
                  </Card>
                )})}
              </div>
            </div>
          )}

          {/* Pending Section */}
          {pending.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl text-gray-900 dark:text-gray-100">Pending</h2>
                <Badge variant="outline" className="ml-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                  {pending.length} items
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pending.map(request => {
                  const hasAnySigned = request.recipients.some(r => r.signedAt);
                  return (
                  <Card 
                    key={request.id} 
                    className="p-0 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-full group"
                    onClick={() => navigate(`/signatures/${request.id}`)}
                  >
                    {/* Simple Header Bar */}
                    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Pending
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(request.sentAt).split('\n')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 bg-white dark:bg-gray-900">
                      {/* Client Name - Large */}
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {request.clientName}
                      </h3>

                      {/* Document Name */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                        {request.documentName}
                      </p>

                      {/* Document Type Badge + Progress Badge on same line */}
                      <div className="flex items-center gap-2 mb-4">
                        {getDocumentTypeBadge(request.documentType)}
                        <Badge className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600">
                          0/{request.totalSent}
                        </Badge>
                      </div>

                      {/* Recipients - Compact */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recipients ({request.recipients.length}):
                        </p>
                        <div className="space-y-1.5">
                          {request.recipients.map(recipient => (
                            <div key={recipient.id} className="flex items-center gap-2 text-sm">
                              {recipient.signedAt ? (
                                <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                              ) : recipient.viewedAt ? (
                                <Eye className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              )}
                              <span className={cn(
                                "truncate flex-1",
                                recipient.signedAt ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                              )}>
                                {recipient.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {recipient.signedAt 
                                  ? formatDate(recipient.signedAt)
                                  : recipient.viewedAt 
                                  ? "Viewed" 
                                  : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metadata Grid - 3 columns */}
                      <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.year}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sent</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatDateTime(request.sentAt).split('\n')[0]}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</div>
                          <div className="flex items-center gap-1">
                            {request.source === 'workflow' ? (
                              <>
                                <Workflow className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {request.workflowName || 'WF'}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Manual</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Thumbnail Preview - Show if any signature exists */}
                      {hasAnySigned && (
                        <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group-hover:shadow-sm transition-shadow">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileSignature className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                            <span className="text-white text-xs font-medium flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              View Document
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )})}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-xl text-gray-900 dark:text-gray-100">Completed</h2>
                <Badge variant="outline" className="ml-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  {completed.length} items
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completed.slice(0, 8).map(request => (
                  <Concept3BCard key={request.id} request={request} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {signatureRequests.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FileSignature className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">No signature requests yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first signature request
              </p>
            </div>
          )}
        </div>
      </div>

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
        onOverdueDaysChange={(days) => {
          setOverdueDays(days);
          localStorage.setItem('signatureOverdueDays', days.toString());
        }}
      />

      {/* Resend Confirmation Dialog */}
      <AlertDialog
        open={resendConfirmDialog.open}
        onOpenChange={(open) => setResendConfirmDialog({ open, signatureId: resendConfirmDialog.signatureId })}
      >
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
    </DndProvider>
  );
}