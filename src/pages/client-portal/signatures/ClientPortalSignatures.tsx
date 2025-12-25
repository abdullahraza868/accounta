import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  FileSignature, 
  CheckCircle, 
  Clock,
  MoreVertical,
  Eye,
  Download,
  FileText,
  AlertCircle,
  Calendar,
  Check,
  X as XIcon,
  Search,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  GripVertical,
  User,
  Mail
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { TablePaginationCompact } from '../../../components/TablePaginationCompact';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { cn } from '../../../components/ui/utils';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAppSettings } from '../../../contexts/AppSettingsContext';
import { DateTimeDisplay } from '../../../components/DateTimeDisplay';

type SignatureStatus = 'completed' | 'viewed' | 'pending' | 'overdue';

type Recipient = {
  id: string;
  name: string;
  email: string;
  role?: string;
  signedAt?: string;
  viewedAt?: string;
  viewedIpAddress?: string;
  signedIpAddress?: string;
};

type SignatureRequest = {
  id: string;
  documentName: string;
  documentType: 'custom' | '8879' | 'template';
  year: number;
  sentAt: string;
  sentBy: string;
  firmName: string;
  status: SignatureStatus;
  recipients: Recipient[];
  viewedAt?: string;
  signedAt?: string;
  ipAddress?: string;
  daysOld: number;
};

type StatusFilter = 'all' | 'completed' | 'pending' | 'recent';

type StatCardType = 'all' | 'completed' | 'pending' | 'recent' | 'viewed';

type StatCardConfig = {
  id: StatCardType;
  label: string;
  label2?: string;
  icon: React.ReactNode;
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
  const { branding } = useBranding();
  
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

  const isActive = statusFilter === (config.filterValue || config.id);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn("relative", isDragging && "opacity-50")}
    >
      <div 
        className="absolute top-2 left-2 z-10 pointer-events-none"
        style={{ color: branding.colors.mutedText }}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => onFilterChange(config.filterValue || config.id as StatusFilter)}
        className="text-left w-full"
      >
        <Card 
          className={cn(
            "p-4 pl-8 shadow-sm hover:shadow-md transition-all cursor-move",
            isActive && "ring-2"
          )}
          style={{
            borderColor: isActive ? branding.colors.primaryButton : branding.colors.borderColor,
            background: branding.colors.cardBackground,
            ...(isActive && { ringColor: `${branding.colors.primaryButton}40` })
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `${branding.colors.primaryButton}15`,
                  color: branding.colors.primaryButton
                }}
              >
                {config.icon}
              </div>
              <div>
                <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                  {config.label}
                </p>
                {config.label2 && (
                  <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                    {config.label2}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-2xl" style={{ color: branding.colors.headingText }}>
                {config.getValue(stats)}
              </p>
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
};

export default function ClientPortalSignatures() {
  const { branding } = useBranding();
  const { formatDate, formatDateTime } = useAppSettings();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<SignatureRequest | null>(null);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<SignatureRequest | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedSectionCollapsed, setCompletedSectionCollapsed] = useState(false);

  // Card order state
  const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
    const saved = localStorage.getItem('clientPortalSignaturesCardOrder');
    return saved ? JSON.parse(saved) : ['all', 'pending', 'completed', 'viewed', 'recent'];
  });

  // Mock data - Extended for pagination testing
  const allSignatureRequests: SignatureRequest[] = [
    {
      id: '1',
      documentName: 'Form 8879 - 2024 Tax Return',
      documentType: '8879',
      year: 2024,
      sentAt: '2024-11-01T10:30:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'pending',
      daysOld: 1,
      recipients: [
        {
          id: 'r1',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Taxpayer',
        },
        {
          id: 'r2',
          name: 'Mary Smith',
          email: 'mary@example.com',
          role: 'Spouse',
        },
      ],
    },
    {
      id: '2',
      documentName: 'Engagement Letter 2024',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-28T14:20:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'overdue',
      viewedAt: '2024-10-29T09:15:00',
      daysOld: 5,
      recipients: [
        {
          id: 'r3',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-10-29T09:15:00',
          viewedIpAddress: '192.168.1.105',
        },
      ],
    },
    {
      id: '3',
      documentName: 'Tax Organizer 2024',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-10-15T11:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-10-15T14:30:00',
      signedAt: '2024-10-15T14:35:00',
      ipAddress: '192.168.1.100',
      daysOld: 18,
      recipients: [
        {
          id: 'r4',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Signer',
          viewedAt: '2024-10-15T14:30:00',
          signedAt: '2024-10-15T14:35:00',
          viewedIpAddress: '192.168.1.100',
          signedIpAddress: '192.168.1.100',
        },
      ],
    },
    {
      id: '4',
      documentName: 'Form 8879 - 2023 Amended Return',
      documentType: '8879',
      year: 2023,
      sentAt: '2025-10-20T09:00:00',
      sentBy: 'David Martinez',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2025-10-20T10:15:00',
      signedAt: '2025-11-01T10:20:00',
      ipAddress: '192.168.1.100',
      daysOld: 13,
      recipients: [
        {
          id: 'r5',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Taxpayer',
          viewedAt: '2025-10-20T10:15:00',
          signedAt: '2025-10-31T15:16:00',
          viewedIpAddress: '192.168.1.102',
          signedIpAddress: '192.168.1.102',
        },
        {
          id: 'r6',
          name: 'Mary Smith',
          email: 'mary@example.com',
          role: 'Spouse',
          viewedAt: '2025-10-21T10:45:00',
          signedAt: '2025-11-01T11:03:00',
          viewedIpAddress: '192.168.1.108',
          signedIpAddress: '192.168.1.108',
        },
      ],
    },
    {
      id: '5',
      documentName: 'Power of Attorney',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-11-02T08:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'viewed',
      viewedAt: '2024-11-02T09:15:00',
      daysOld: 0,
      recipients: [
        {
          id: 'r7',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-11-02T09:15:00',
          viewedIpAddress: '192.168.1.106',
        },
      ],
    },
    {
      id: '6',
      documentName: 'Form 8879 - 2024 Q3 Estimated',
      documentType: '8879',
      year: 2024,
      sentAt: '2024-10-25T09:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'pending',
      daysOld: 8,
      recipients: [
        {
          id: 'r8',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Taxpayer',
        },
      ],
    },
    {
      id: '7',
      documentName: 'Quarterly Tax Estimate - Q4 2024',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-10-30T11:30:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'viewed',
      viewedAt: '2024-10-31T08:45:00',
      daysOld: 3,
      recipients: [
        {
          id: 'r9',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-10-31T08:45:00',
          viewedIpAddress: '192.168.1.110',
        },
      ],
    },
    {
      id: '8',
      documentName: 'Form 8879 - 2023 Tax Return',
      documentType: '8879',
      year: 2023,
      sentAt: '2024-09-15T10:00:00',
      sentBy: 'David Martinez',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-09-15T11:20:00',
      signedAt: '2024-09-15T11:25:00',
      ipAddress: '192.168.1.101',
      daysOld: 48,
      recipients: [
        {
          id: 'r10',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Taxpayer',
          viewedAt: '2024-09-15T11:20:00',
          signedAt: '2024-09-15T11:25:00',
          viewedIpAddress: '192.168.1.101',
          signedIpAddress: '192.168.1.101',
        },
        {
          id: 'r11',
          name: 'Mary Smith',
          email: 'mary@example.com',
          role: 'Spouse',
          viewedAt: '2024-09-15T11:22:00',
          signedAt: '2024-09-15T11:26:00',
          viewedIpAddress: '192.168.1.101',
          signedIpAddress: '192.168.1.101',
        },
      ],
    },
    {
      id: '9',
      documentName: 'Engagement Letter 2023',
      documentType: 'custom',
      year: 2023,
      sentAt: '2024-08-20T14:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-08-21T09:30:00',
      signedAt: '2024-08-21T09:35:00',
      ipAddress: '192.168.1.103',
      daysOld: 74,
      recipients: [
        {
          id: 'r12',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-08-21T09:30:00',
          signedAt: '2024-08-21T09:35:00',
          viewedIpAddress: '192.168.1.103',
          signedIpAddress: '192.168.1.103',
        },
      ],
    },
    {
      id: '10',
      documentName: 'Extension Request Form 4868',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-10-27T16:00:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'overdue',
      daysOld: 6,
      recipients: [
        {
          id: 'r13',
          name: 'John Smith',
          email: 'john@example.com',
        },
      ],
    },
    {
      id: '11',
      documentName: 'Annual Disclosure Statement',
      documentType: 'custom',
      year: 2024,
      sentAt: '2025-10-10T10:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2025-10-10T15:20:00',
      signedAt: '2025-11-01T15:30:00',
      ipAddress: '192.168.1.107',
      daysOld: 23,
      recipients: [
        {
          id: 'r14',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2025-10-10T15:20:00',
          signedAt: '2025-11-01T15:30:00',
          viewedIpAddress: '192.168.1.107',
          signedIpAddress: '192.168.1.107',
        },
      ],
    },
    {
      id: '12',
      documentName: 'Tax Planning Document 2025',
      documentType: 'template',
      year: 2024,
      sentAt: '2025-10-05T09:00:00',
      sentBy: 'David Martinez',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2025-10-06T10:15:00',
      signedAt: '2025-11-02T08:20:00',
      ipAddress: '192.168.1.109',
      daysOld: 28,
      recipients: [
        {
          id: 'r15',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2025-10-06T10:15:00',
          signedAt: '2025-11-02T08:20:00',
          viewedIpAddress: '192.168.1.109',
          signedIpAddress: '192.168.1.109',
        },
      ],
    },
    {
      id: '13',
      documentName: 'IRS Representation Letter',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-11-01T13:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'pending',
      daysOld: 1,
      recipients: [
        {
          id: 'r16',
          name: 'John Smith',
          email: 'john@example.com',
        },
      ],
    },
    {
      id: '14',
      documentName: 'Business Entity Formation Docs',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-22T10:30:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'viewed',
      viewedAt: '2024-10-23T11:00:00',
      daysOld: 11,
      recipients: [
        {
          id: 'r17',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-10-23T11:00:00',
          viewedIpAddress: '192.168.1.111',
        },
      ],
    },
    {
      id: '15',
      documentName: 'Form 8879 - 2022 Amended Return',
      documentType: '8879',
      year: 2022,
      sentAt: '2024-09-01T14:00:00',
      sentBy: 'David Martinez',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-09-02T09:15:00',
      signedAt: '2024-09-02T09:20:00',
      ipAddress: '192.168.1.112',
      daysOld: 62,
      recipients: [
        {
          id: 'r18',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'Primary Taxpayer',
          viewedAt: '2024-09-02T09:15:00',
          signedAt: '2024-09-02T09:20:00',
          viewedIpAddress: '192.168.1.112',
          signedIpAddress: '192.168.1.112',
        },
      ],
    },
    {
      id: '16',
      documentName: 'State Tax Return - CA',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-09-20T11:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-09-20T14:30:00',
      signedAt: '2024-09-20T14:35:00',
      ipAddress: '192.168.1.113',
      daysOld: 43,
      recipients: [
        {
          id: 'r19',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-09-20T14:30:00',
          signedAt: '2024-09-20T14:35:00',
          viewedIpAddress: '192.168.1.113',
          signedIpAddress: '192.168.1.113',
        },
      ],
    },
    {
      id: '17',
      documentName: 'Payroll Authorization Form',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-18T08:00:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-10-18T10:15:00',
      signedAt: '2024-10-18T10:20:00',
      ipAddress: '192.168.1.114',
      daysOld: 15,
      recipients: [
        {
          id: 'r20',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-10-18T10:15:00',
          signedAt: '2024-10-18T10:20:00',
          viewedIpAddress: '192.168.1.114',
          signedIpAddress: '192.168.1.114',
        },
      ],
    },
    {
      id: '18',
      documentName: 'Estimated Tax Worksheet Q1',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-08-15T09:30:00',
      sentBy: 'David Martinez',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-08-15T11:00:00',
      signedAt: '2024-08-15T11:05:00',
      ipAddress: '192.168.1.115',
      daysOld: 79,
      recipients: [
        {
          id: 'r21',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-08-15T11:00:00',
          signedAt: '2024-08-15T11:05:00',
          viewedIpAddress: '192.168.1.115',
          signedIpAddress: '192.168.1.115',
        },
      ],
    },
    {
      id: '19',
      documentName: 'Audit Response Documentation',
      documentType: 'custom',
      year: 2024,
      sentAt: '2024-10-29T15:00:00',
      sentBy: 'Sarah Johnson',
      firmName: 'Smith & Associates CPA',
      status: 'pending',
      daysOld: 4,
      recipients: [
        {
          id: 'r22',
          name: 'John Smith',
          email: 'john@example.com',
        },
      ],
    },
    {
      id: '20',
      documentName: 'Retirement Plan Contribution Form',
      documentType: 'template',
      year: 2024,
      sentAt: '2024-10-12T10:00:00',
      sentBy: 'Michael Chen',
      firmName: 'Smith & Associates CPA',
      status: 'completed',
      viewedAt: '2024-10-12T14:20:00',
      signedAt: '2024-10-12T14:25:00',
      ipAddress: '192.168.1.116',
      daysOld: 21,
      recipients: [
        {
          id: 'r23',
          name: 'John Smith',
          email: 'john@example.com',
          viewedAt: '2024-10-12T14:20:00',
          signedAt: '2024-10-12T14:25:00',
          viewedIpAddress: '192.168.1.116',
          signedIpAddress: '192.168.1.116',
        },
      ],
    },
  ];

  // Helper functions
  const isRecentlySigned = (request: SignatureRequest) => {
    if (!request.signedAt) return false;
    const signedDate = new Date(request.signedAt);
    const daysSince = Math.floor((Date.now() - signedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 7;
  };

  const isSignedInLast48Hours = (request: SignatureRequest): boolean => {
    if (request.status !== 'completed') return false;
    if (!request.signedAt) return false;
    const signedDate = new Date(request.signedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - signedDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  const getStatusBadge = (request: SignatureRequest) => {
    switch (request.status) {
      case 'completed':
        return (
          <Badge 
            className="border"
            style={{
              background: '#10b98115',
              color: '#047857',
              borderColor: '#10b98140'
            }}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Signed
          </Badge>
        );
      case 'viewed':
        return (
          <Badge 
            className="border"
            style={{
              background: `${branding.colors.primaryButton}15`,
              color: branding.colors.primaryButton,
              borderColor: `${branding.colors.primaryButton}40`
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Viewed
          </Badge>
        );
      case 'pending':
        return (
          <Badge 
            className="border"
            style={{
              background: '#3b82f615',
              color: '#1d4ed8',
              borderColor: '#3b82f640'
            }}
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge 
            className="border"
            style={{
              background: '#f9731615',
              color: '#c2410c',
              borderColor: '#f9731640'
            }}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Action Needed
          </Badge>
        );
    }
  };

  const getDocumentTypeBadge = (type: SignatureRequest['documentType']) => {
    switch (type) {
      case '8879':
        return (
          <Badge 
            variant="outline" 
            className="text-[10px] h-4 px-1.5"
            style={{ 
              color: branding.colors.primaryButton, 
              borderColor: branding.colors.primaryButton,
              background: `${branding.colors.primaryButton}10`
            }}
          >
            IRS 8879
          </Badge>
        );
      case 'template':
        return (
          <Badge 
            variant="outline" 
            className="text-blue-700 border-blue-300 bg-blue-50 text-[10px] h-4 px-1.5"
          >
            Template
          </Badge>
        );
      case 'custom':
        return (
          <Badge 
            variant="outline" 
            className="text-[10px] h-4 px-1.5"
            style={{
              color: branding.colors.mutedText,
              borderColor: branding.colors.borderColor,
              background: branding.colors.cardBackground
            }}
          >
            Document
          </Badge>
        );
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
  const pendingRequests = allSignatureRequests.filter(r => r.status === 'pending' || r.status === 'overdue' || r.status === 'viewed').length;
  const viewedRequests = allSignatureRequests.filter(r => r.status === 'viewed').length;
  const recentlySignedRequests = allSignatureRequests.filter(r => isRecentlySigned(r)).length;

  const stats = {
    total: totalRequests,
    completed: completedRequests,
    pending: pendingRequests,
    viewed: viewedRequests,
    recent: recentlySignedRequests,
  };

  // Filtering
  let filteredRequests = allSignatureRequests.filter(req => {
    const matchesSearch = req.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.sentBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = false;
    if (statusFilter === 'all') {
      matchesFilter = true;
    } else if (statusFilter === 'recent') {
      matchesFilter = isRecentlySigned(req);
    } else if (statusFilter === 'pending') {
      matchesFilter = req.status === 'pending' || req.status === 'overdue' || req.status === 'viewed';
    } else {
      matchesFilter = req.status === statusFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Separate into pending and completed
  const pendingRequestsFiltered = filteredRequests.filter(r => r.status !== 'completed');
  const completedRequestsFiltered = filteredRequests.filter(r => r.status === 'completed');

  // Pagination
  const pendingTotalPages = Math.ceil(pendingRequestsFiltered.length / itemsPerPage);
  const completedTotalPages = Math.ceil(completedRequestsFiltered.length / itemsPerPage);
  
  const paginatedPendingRequests = pendingRequestsFiltered.slice(
    (pendingCurrentPage - 1) * itemsPerPage,
    pendingCurrentPage * itemsPerPage
  );
  
  const paginatedCompletedRequests = completedRequestsFiltered.slice(
    (completedCurrentPage - 1) * itemsPerPage,
    completedCurrentPage * itemsPerPage
  );

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setPendingCurrentPage(1);
    setCompletedCurrentPage(1);
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCardOrder(newOrder);
    localStorage.setItem('clientPortalSignaturesCardOrder', JSON.stringify(newOrder));
  };

  // Card configurations
  const cardConfigs: Record<StatCardType, StatCardConfig> = {
    all: {
      id: 'all',
      label: 'All',
      label2: 'Signatures',
      icon: <FileSignature className="w-5 h-5" />,
      getValue: (stats) => stats.total,
    },
    pending: {
      id: 'pending',
      label: 'Need',
      label2: 'Signature',
      icon: <Clock className="w-5 h-5" />,
      getValue: (stats) => stats.pending,
      filterValue: 'pending',
    },
    completed: {
      id: 'completed',
      label: 'Signed',
      label2: 'Complete',
      icon: <CheckCircle className="w-5 h-5" />,
      getValue: (stats) => stats.completed,
    },
    viewed: {
      id: 'viewed',
      label: 'Opened',
      label2: 'Not Signed',
      icon: <Eye className="w-5 h-5" />,
      getValue: (stats) => stats.viewed,
    },
    recent: {
      id: 'recent',
      label: 'Recently',
      label2: 'Signed',
      icon: <Sparkles className="w-5 h-5" />,
      getValue: (stats) => stats.recent,
      filterValue: 'recent',
    },
  };

  // Render Pending Table
  const renderPendingTable = () => {
    if (paginatedPendingRequests.length === 0) return null;

    return (
      <div>
        {/* Table Header - Following Standard */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
            <h3 style={{ color: branding.colors.headingText }}>Pending Signatures</h3>
            <Badge 
              variant="outline" 
              style={{
                background: `${branding.colors.primaryButton}15`,
                color: branding.colors.primaryButton,
                borderColor: `${branding.colors.primaryButton}40`
              }}
            >
              {pendingRequestsFiltered.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Items Per Page */}
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setPendingCurrentPage(1);
                setCompletedCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
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
          </div>
        </div>

        {/* Table */}
        <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr style={{ backgroundColor: 'var(--primaryColor)' }}>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[300px]">
                    Document
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[160px]">
                    Received
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[100px]">
                    Year
                  </th>
                  <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[150px]">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-white/90 w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPendingRequests.map((request) => {
                  const isExpanded = expandedRows.has(request.id);
                  return (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-5">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleRowExpanded(request.id)}
                              className="mt-1 flex-shrink-0 hover:opacity-70 transition-opacity"
                              style={{ color: branding.colors.mutedText }}
                            >
                              <ChevronRight className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-90"
                              )} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  onClick={() => setSelectedDocument(request)}
                                  className="font-medium hover:underline text-left"
                                  style={{ color: branding.colors.primaryButton }}
                                >
                                  {request.documentName}
                                </button>
                                {request.status === 'overdue' && (
                                  <Badge 
                                    className="h-5 px-1.5 text-[10px] flex items-center gap-1"
                                    style={{
                                      background: '#f9731615',
                                      color: '#c2410c',
                                      borderColor: '#f9731640'
                                    }}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    {request.daysOld}d
                                  </Badge>
                                )}
                                {request.daysOld === 0 && request.status !== 'completed' && (
                                  <Badge 
                                    className="h-5 px-1.5 text-[10px] flex items-center gap-1"
                                    style={{
                                      background: `${branding.colors.primaryButton}15`,
                                      color: branding.colors.primaryButton,
                                      borderColor: `${branding.colors.primaryButton}40`
                                    }}
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getDocumentTypeBadge(request.documentType)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <DateTimeDisplay date={request.sentAt} />
                        </td>
                        <td className="px-4 py-5">
                          <span style={{ color: branding.colors.bodyText }}>{request.year}</span>
                        </td>
                        <td className="px-4 py-5">
                          {getStatusBadge(request)}
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              className="h-8 px-3 gap-2"
                              style={{ background: branding.colors.primaryButton }}
                              onClick={() => setSelectedDocument(request)}
                            >
                              <FileSignature className="w-4 h-4" />
                              Sign Now
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setSelectedDocument(request)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review Document
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Recipients Row */}
                      {isExpanded && (
                        <tr key={`${request.id}-expanded`}>
                          <td colSpan={5} className="p-0">
                            <div className="bg-green-50/30 dark:bg-green-900/10 border-t" style={{ borderColor: branding.colors.borderColor }}>
                              {request.recipients.map((recipient, index) => (
                                <div
                                  key={recipient.id}
                                  className={cn(
                                    "py-3 grid gap-4 items-start",
                                    index < request.recipients.length - 1 && "border-b"
                                  )}
                                  style={{ 
                                    gridTemplateColumns: '300px 160px 100px 150px 120px',
                                    borderColor: index < request.recipients.length - 1 ? branding.colors.borderColor : undefined 
                                  }}
                                >
                                  {/* Document Column - Recipient Info */}
                                  <div className="flex items-center gap-3 px-4 pl-12">
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
                                        <span className="text-sm truncate" style={{ color: branding.colors.bodyText }}>{recipient.name}</span>
                                        {recipient.role && (
                                          <Badge 
                                            variant="outline" 
                                            className="text-[10px] px-1.5 py-0 h-4"
                                            style={{ 
                                              color: branding.colors.primaryButton, 
                                              borderColor: branding.colors.primaryButton,
                                              backgroundColor: `${branding.colors.primaryButton}05`
                                            }}
                                          >
                                            {recipient.role}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs truncate" style={{ color: branding.colors.mutedText }}>{recipient.email}</p>
                                    </div>
                                  </div>

                                  {/* Received Column - Viewed/Signed Times */}
                                  <div className="flex flex-col gap-1 px-4">
                                    {recipient.viewedAt && (
                                      <div className="text-xs">
                                        <div style={{ color: branding.colors.mutedText }}>Viewed:</div>
                                        {(() => {
                                          const formatted = formatDateTime(recipient.viewedAt);
                                          const [date, time] = formatted.split('\n');
                                          return (
                                            <>
                                              <div style={{ color: branding.colors.bodyText }}>{date}</div>
                                              <div style={{ color: branding.colors.mutedText }}>{time}</div>

                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}
                                    {recipient.signedAt && (
                                      <div className="text-xs mt-1">
                                        <div style={{ color: branding.colors.mutedText }}>Signed:</div>
                                        {(() => {
                                          const formatted = formatDateTime(recipient.signedAt);
                                          const [date, time] = formatted.split('\n');
                                          return (
                                            <>
                                              <div className="text-green-700 dark:text-green-400">{date}</div>
                                              <div style={{ color: branding.colors.mutedText }}>{time}</div>

                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>

                                  {/* Year Column - IP Addresses */}
                                  <div className="text-xs space-y-2 px-4">
                                    {recipient.viewedIpAddress && (
                                      <div>
                                        <div style={{ color: branding.colors.mutedText }} className="mb-0.5">Viewed IP:</div>
                                        <div style={{ color: branding.colors.bodyText }} className="font-mono">
                                          {recipient.viewedIpAddress}
                                        </div>
                                      </div>
                                    )}
                                    {recipient.signedIpAddress && (
                                      <div>
                                        <div style={{ color: branding.colors.mutedText }} className="mb-0.5">Signed IP:</div>
                                        <div className="text-green-700 dark:text-green-400 font-mono">
                                          {recipient.signedIpAddress}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Status Column - Recipient Status Badge (Indented as child) */}
                                  <div className="px-4 pl-8">
                                    {recipient.signedAt ? (
                                      <Badge 
                                        className="border text-xs px-2 py-1"
                                        style={{
                                          background: '#10b98115',
                                          color: '#047857',
                                          borderColor: '#10b98140'
                                        }}
                                      >
                                        <Check className="w-3 h-3 mr-1" />
                                        Signed
                                      </Badge>
                                    ) : recipient.viewedAt ? (
                                      <Badge 
                                        className="border text-xs px-2 py-1"
                                        style={{
                                          background: `${branding.colors.primaryButton}15`,
                                          color: branding.colors.primaryButton,
                                          borderColor: `${branding.colors.primaryButton}40`
                                        }}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Viewed
                                      </Badge>
                                    ) : (
                                      <Badge 
                                        className="border text-xs px-2 py-1"
                                        style={{
                                          background: '#3b82f615',
                                          color: '#1d4ed8',
                                          borderColor: '#3b82f640'
                                        }}
                                      >
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Actions Column - Empty */}
                                  <div className="px-4"></div>
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
          </div>
          <TablePaginationCompact 
            currentPage={pendingCurrentPage}
            totalPages={pendingTotalPages}
            onPageChange={setPendingCurrentPage}
          />
        </Card>
      </div>
    );
  };

  // Render Completed Table - Following Green Pattern with Invisible Header Row
  const renderCompletedSection = () => {
    if (completedRequestsFiltered.length === 0) return null;

    return (
      <div>
        {/* Collapsible Header */}
        <button
          onClick={() => setCompletedSectionCollapsed(!completedSectionCollapsed)}
          className="w-full flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-green-100/30 dark:hover:bg-green-900/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            <h3 className="text-gray-900 dark:text-gray-100">Completed Signatures</h3>
            <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300/60 dark:border-green-700/60">
              {completedRequestsFiltered.length}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completedSectionCollapsed ? 'Click to expand' : 'Click to collapse'}
          </span>
        </button>

        {!completedSectionCollapsed && (
          <div className="bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/40 dark:border-green-800/40 overflow-hidden">
            <table className="w-full table-fixed">
              {/* Invisible Header Row for Alignment */}
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th className="px-4 py-4 w-[300px]">
                    <div className="opacity-0 text-xs uppercase tracking-wide">Document</div>
                  </th>
                  <th className="px-4 py-4 w-[160px]">
                    <div className="opacity-0 text-xs uppercase tracking-wide">Received</div>
                  </th>
                  <th className="px-4 py-4 w-[100px]">
                    <div className="opacity-0 text-xs uppercase tracking-wide">Year</div>
                  </th>
                  <th className="px-4 py-4 w-[150px]">
                    <div className="opacity-0 text-xs uppercase tracking-wide">Status</div>
                  </th>
                  <th className="px-4 py-4 w-[120px]">
                    <div className="opacity-0 text-xs uppercase tracking-wide">Actions</div>
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-green-200/30 dark:divide-green-800/30 bg-green-50/10 dark:bg-green-900/5">
                {paginatedCompletedRequests.map((request) => {
                  const isExpanded = expandedRows.has(request.id);
                  
                  return (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-green-100/30 dark:hover:bg-green-900/15 transition-colors">
                        <td className="px-4 py-5">
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpanded(request.id)}
                              className="h-6 w-6 p-0 text-green-600/60 hover:text-green-700 hover:bg-green-100/30 dark:text-green-500/60 dark:hover:text-green-400 dark:hover:bg-green-900/20 flex-shrink-0 mt-1"
                            >
                              <ChevronRight className={cn(
                                "w-3.5 h-3.5 transition-transform",
                                isExpanded && "rotate-90"
                              )} />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600/60 dark:text-green-500/60 flex-shrink-0" />
                                <button
                                  onClick={() => setSelectedDocument(request)}
                                  className="text-sm text-gray-700 dark:text-gray-400 hover:underline text-left truncate"
                                >
                                  {request.documentName}
                                </button>
                                {isSignedInLast48Hours(request) && (
                                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-4 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getDocumentTypeBadge(request.documentType)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <DateTimeDisplay 
                            date={request.sentAt} 
                            dateClassName="text-xs text-gray-600 dark:text-gray-500"
                            timeClassName="text-xs text-gray-500 dark:text-gray-500"
                          />
                        </td>
                        <td className="px-4 py-5">
                          <span className="text-xs text-gray-600 dark:text-gray-500">{request.year}</span>
                        </td>
                        <td className="px-4 py-5">
                          {/* Signed Badge for Main Row */}
                          <Badge 
                            className="border text-xs px-2 py-1"
                            style={{
                              background: '#10b98115',
                              color: '#047857',
                              borderColor: '#10b98140'
                            }}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Signed
                          </Badge>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex justify-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setSelectedAuditDoc(request)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Audit Trail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedDocument(request)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Document
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Recipients Row */}
                      {isExpanded && (
                        <tr key={`${request.id}-expanded`}>
                          <td colSpan={5} className="p-0">
                            <table className="w-full table-fixed bg-green-50/30 dark:bg-green-900/10 border-t border-green-200/30 dark:border-green-800/30">
                              <tbody>
                                {request.recipients.map((recipient, index) => (
                                  <tr
                                    key={recipient.id}
                                    className={cn(
                                      index < request.recipients.length - 1 && "border-b border-green-200/30 dark:border-green-800/30"
                                    )}
                                  >
                                    {/* Document Column - Recipient Info */}
                                    <td className="px-4 py-3 w-[300px]">
                                      <div className="flex items-center gap-3 pl-8">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{recipient.name}</span>
                                            {recipient.role && (
                                              <Badge 
                                                variant="outline" 
                                                className="text-[10px] px-1.5 py-0 h-4"
                                                style={{ 
                                                  color: branding.colors.primaryButton, 
                                                  borderColor: branding.colors.primaryButton,
                                                  backgroundColor: `${branding.colors.primaryButton}05`
                                                }}
                                              >
                                                {recipient.role}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Received Column - Viewed/Signed Times */}
                                    <td className="px-4 py-3 w-[160px]">
                                      <div className="flex flex-col gap-1">
                                        {recipient.viewedAt && (
                                          <div className="text-xs">
                                            <div className="text-gray-500 dark:text-gray-400">Viewed:</div>
                                            {(() => {
                                              const formatted = formatDateTime(recipient.viewedAt);
                                              const [date, time] = formatted.split('\n');
                                              return (
                                                <>
                                                  <div className="text-gray-900 dark:text-gray-100">{date}</div>
                                                  <div className="text-gray-500 dark:text-gray-400">{time}</div>
                                                </>
                                              );
                                            })()}
                                          </div>
                                        )}
                                        {recipient.signedAt && (
                                          <div className="text-xs mt-1">
                                            <div className="text-gray-500 dark:text-gray-400">Signed:</div>
                                            {(() => {
                                              const formatted = formatDateTime(recipient.signedAt);
                                              const [date, time] = formatted.split('\n');
                                              return (
                                                <>
                                                  <div className="text-green-700 dark:text-green-400">{date}</div>
                                                  <div className="text-gray-500 dark:text-gray-400">{time}</div>
                                                </>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Year Column - IP Addresses */}
                                    <td className="px-4 py-3 w-[100px]">
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
                                            <div className="text-green-700 dark:text-green-400 font-mono">
                                              {recipient.signedIpAddress}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Status Column - Recipient Status Badge (Indented as child) */}
                                    <td className="px-4 py-3 w-[150px]">
                                      <div className="pl-4">
                                        <Badge 
                                          className="border text-xs px-2 py-1"
                                          style={{
                                            background: '#10b98115',
                                            color: '#047857',
                                            borderColor: '#10b98140'
                                          }}
                                        >
                                          <Check className="w-3 h-3 mr-1" />
                                          Signed
                                        </Badge>
                                      </div>
                                    </td>

                                    {/* Actions Column - Empty */}
                                    <td className="px-4 py-3 w-[120px]"></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            
            <TablePaginationCompact 
              currentPage={completedCurrentPage}
              totalPages={completedTotalPages}
              onPageChange={setCompletedCurrentPage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <ClientPortalLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileSignature 
                  className="w-6 h-6" 
                  style={{ color: branding.colors.primaryButton }} 
                />
                <h1 style={{ color: branding.colors.headingText }}>Signatures</h1>
              </div>
              <p className="mt-2" style={{ color: branding.colors.mutedText }}>
                {filteredRequests.length} signature request{filteredRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats Bar - Draggable Cards */}
          <div className="grid grid-cols-5 gap-4">
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

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: branding.colors.mutedText }}
                />
                <Input
                  type="text"
                  placeholder="Search signatures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border"
                  style={{
                    borderColor: branding.colors.borderColor,
                    background: branding.colors.cardBackground
                  }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                  setPendingCurrentPage(1);
                  setCompletedCurrentPage(1);
                }}
                className="text-xs underline hover:opacity-70 transition-opacity"
                style={{ color: branding.colors.mutedText }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Pending Table */}
          {renderPendingTable()}

          {/* Completed Section */}
          {renderCompletedSection()}

          {/* No Results */}
          {paginatedPendingRequests.length === 0 && completedRequestsFiltered.length === 0 && (
            <Card 
              className="border shadow-sm p-12"
              style={{
                borderColor: branding.colors.borderColor,
                background: branding.colors.cardBackground
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <FileSignature 
                  className="w-12 h-12" 
                  style={{ color: branding.colors.mutedText }}
                />
                <p style={{ color: branding.colors.mutedText }}>
                  No signature requests found
                </p>
              </div>
            </Card>
          )}

          {/* View Document Dialog */}
          <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
            <DialogContent 
              className="max-w-4xl max-h-[90vh]"
              style={{
                background: branding.colors.cardBackground,
                borderColor: branding.colors.borderColor
              }}
              aria-describedby="view-document-description"
            >
              <DialogHeader>
                <DialogTitle style={{ color: branding.colors.headingText }}>
                  {selectedDocument?.documentName}
                </DialogTitle>
                <DialogDescription id="view-document-description" style={{ color: branding.colors.mutedText }}>
                  {selectedDocument?.status === 'completed' 
                    ? 'Document signed and completed'
                    : 'Review the document and sign below'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Document preview would go here */}
                <div 
                  className="aspect-[8.5/11] border-2 border-dashed rounded-lg flex items-center justify-center"
                  style={{ borderColor: branding.colors.borderColor }}
                >
                  <div className="text-center">
                    <FileText 
                      className="w-12 h-12 mx-auto mb-3" 
                      style={{ color: branding.colors.mutedText }}
                    />
                    <p style={{ color: branding.colors.mutedText }}>
                      Document preview
                    </p>
                  </div>
                </div>

                {selectedDocument?.status !== 'completed' && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      style={{ background: branding.colors.primaryButton }}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Sign Document
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Audit Trail Dialog */}
          <Dialog open={!!selectedAuditDoc} onOpenChange={() => setSelectedAuditDoc(null)}>
            <DialogContent 
              style={{
                background: branding.colors.cardBackground,
                borderColor: branding.colors.borderColor
              }}
              aria-describedby="audit-trail-description"
            >
              <DialogHeader>
                <DialogTitle style={{ color: branding.colors.headingText }}>
                  Audit Trail
                </DialogTitle>
                <DialogDescription id="audit-trail-description" style={{ color: branding.colors.mutedText }}>
                  Complete signing history for {selectedAuditDoc?.documentName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                {selectedAuditDoc?.signedAt && (
                  <div 
                    className="p-3 rounded-lg border"
                    style={{
                      borderColor: branding.colors.borderColor,
                      background: branding.colors.cardBackground
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: branding.colors.headingText }}>
                          Document Signed
                        </p>
                        <DateTimeDisplay date={selectedAuditDoc.signedAt} className="text-xs" />
                        {selectedAuditDoc.ipAddress && (
                          <p className="text-xs font-mono mt-1" style={{ color: branding.colors.mutedText }}>
                            IP: {selectedAuditDoc.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedAuditDoc?.viewedAt && (
                  <div 
                    className="p-3 rounded-lg border"
                    style={{
                      borderColor: branding.colors.borderColor,
                      background: branding.colors.cardBackground
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${branding.colors.primaryButton}15` }}
                      >
                        <Eye className="w-4 h-4" style={{ color: branding.colors.primaryButton }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: branding.colors.headingText }}>
                          Document Viewed
                        </p>
                        <DateTimeDisplay date={selectedAuditDoc.viewedAt} className="text-xs" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div 
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: branding.colors.borderColor,
                    background: branding.colors.cardBackground
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: branding.colors.headingText }}>
                        Document Sent
                      </p>
                      {selectedAuditDoc?.sentAt && (
                        <DateTimeDisplay date={selectedAuditDoc.sentAt} className="text-xs" />
                      )}
                      <p className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                        By {selectedAuditDoc?.sentBy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DndProvider>
    </ClientPortalLayout>
  );
}
