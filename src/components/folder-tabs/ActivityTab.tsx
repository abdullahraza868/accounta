import { Client } from '../../App';
import { 
  Activity,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  Upload,
  UserPlus,
  Download,
  MessageSquare,
  Video,
  Calendar,
  FileSignature,
  DollarSign,
  CreditCard,
  Send,
  StickyNote,
  Users,
  Key,
  Share2,
  MessageCircle,
  Edit,
  LogIn,
  LogOut,
  Filter,
  Search,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FilePlus,
  ChevronRight,
  ExternalLink,
  User,
  MapPin,
  Paperclip,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible';

type ActivityTabProps = {
  client: Client;
};

// Comprehensive activity type definitions for developers
export type ActivityType = 
  // Authentication & Access
  | 'login' | 'logout' | 'password-reset' | 'portal-access-granted'
  // Documents
  | 'document-upload' | 'document-download' | 'document-shared' | 'document-deleted'
  // Communication
  | 'email-sent' | 'email-received' | 'sms-sent' | 'sms-received'
  | 'phone-call-outbound' | 'phone-call-inbound' | 'phone-call-missed'
  | 'video-meeting' | 'message-sent' | 'comment-added'
  // Meetings & Calendar
  | 'meeting-scheduled' | 'meeting-completed' | 'meeting-cancelled' | 'meeting-rescheduled'
  // Invoices & Payments
  | 'invoice-created' | 'invoice-sent' | 'invoice-viewed' | 'invoice-paid' | 'payment-received'
  // Signatures
  | 'signature-request-sent' | 'document-signed' | 'signature-declined'
  // Tasks & Notes
  | 'task-created' | 'task-completed' | 'task-assigned' | 'note-added' | 'note-updated'
  // Client & Team Management
  | 'client-created' | 'client-updated' | 'team-member-added' | 'team-member-removed'
  // File Management
  | 'folder-created' | 'file-moved' | 'file-renamed'
  // Status Changes
  | 'status-changed' | 'priority-changed';

type ActivityItem = {
  id: string;
  type: ActivityType;
  user: string;
  userInitials: string;
  action: string;
  details?: string;
  metadata?: string;
  timestamp: Date;
  category: 'authentication' | 'documents' | 'communication' | 'meetings' | 'financial' | 'signatures' | 'tasks' | 'team' | 'system';
  // Extended details for drill-down
  extendedDetails?: {
    subject?: string;
    body?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    attachments?: string[];
    duration?: string;
    participants?: string[];
    location?: string;
    amount?: string;
    notes?: string;
    status?: string;
    tags?: string[];
    preview?: string; // URL or path to preview image/document
    previewType?: 'image' | 'document' | 'invoice'; // Type of preview
    documentUrl?: string; // URL to the actual document/invoice/image
  };
  // Invoice tracking
  tracking?: {
    invoiceViewed?: boolean;
    invoiceViewedAt?: Date;
    invoiceLastViewedAt?: Date;
    invoiceViewCount?: number;
    invoiceDownloaded?: boolean;
    invoiceDownloadedAt?: Date;
  };
};

type ActivityGroup = {
  date: string;
  displayDate: string;
  activities: ActivityItem[];
};

export const ActivityTab = forwardRef<any, ActivityTabProps>(({ client }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);

  // Mock activity data - organized by recency with extended details
  const allActivities: ActivityItem[] = [
    {
      id: '0',
      type: 'invoice-created',
      user: 'You',
      userInitials: 'YO',
      action: 'created invoice',
      details: 'Invoice #2024-0189',
      metadata: '$1,850.00',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      category: 'financial',
      extendedDetails: {
        amount: '$1,850.00',
        notes: 'Invoice for bookkeeping services - Q4 2024.',
        status: 'Draft',
        preview: 'https://images.unsplash.com/photo-1762427354566-2b6902a9fd06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZvaWNlJTIwZG9jdW1lbnR8ZW58MXx8fHwxNzY2MTg5MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        previewType: 'invoice',
        documentUrl: '/invoices/2024-0189.pdf'
      },
      tracking: {
        invoiceViewed: false
      }
    },
    {
      id: '1',
      type: 'document-upload',
      user: 'Sarah Johnson',
      userInitials: 'SJ',
      action: 'uploaded a document',
      details: 'Tax_Return_2024.pdf',
      metadata: '2.4 MB',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'documents',
      extendedDetails: {
        notes: 'Uploaded via client portal. Document has been automatically categorized under Tax Returns.',
        tags: ['Tax Return', '2024', 'Federal'],
        preview: 'https://images.unsplash.com/photo-1762151717091-4e0633e0c431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjBkb2N1bWVudCUyMGZvcm18ZW58MXx8fHwxNzY2Mjg0MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        previewType: 'document',
        documentUrl: '/documents/Tax_Return_2024.pdf'
      }
    },
    {
      id: '2',
      type: 'email-sent',
      user: 'You',
      userInitials: 'YO',
      action: 'sent an email',
      details: 'Tax Document Request',
      metadata: 'to client',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      category: 'communication',
      extendedDetails: {
        subject: 'Tax Document Request - Action Required',
        body: 'Hi ' + client.firstName + ',\n\nI hope this email finds you well. I\'m reaching out to request some additional documents needed to complete your 2024 tax return.\n\nPlease upload the following:\n- W2 forms\n- 1099 forms\n- Mortgage interest statements\n\nYou can upload these through the client portal at your convenience.\n\nBest regards',
        to: [client.email],
        cc: ['admin@accountingfirm.com'],
        attachments: ['Document_Checklist.pdf']
      }
    },
    {
      id: '3',
      type: 'login',
      user: client.firstName + ' ' + client.lastName,
      userInitials: (client.firstName[0] + client.lastName[0]).toUpperCase(),
      action: 'logged into portal',
      details: 'Client Portal Access',
      metadata: 'Chrome on Windows',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      category: 'authentication',
      extendedDetails: {
        location: 'New York, NY',
        notes: 'IP: 192.168.1.1'
      }
    },
    {
      id: '4',
      type: 'document-download',
      user: client.firstName + ' ' + client.lastName,
      userInitials: (client.firstName[0] + client.lastName[0]).toUpperCase(),
      action: 'downloaded a document',
      details: 'W2_Form_2024.pdf',
      timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
      category: 'documents',
      extendedDetails: {
        notes: 'Downloaded from Documents tab in client portal',
        tags: ['W2', '2024']
      }
    },
    {
      id: '5',
      type: 'invoice-paid',
      user: client.firstName + ' ' + client.lastName,
      userInitials: (client.firstName[0] + client.lastName[0]).toUpperCase(),
      action: 'paid invoice',
      details: 'Invoice #2024-0156',
      metadata: '$2,450.00',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      category: 'financial',
      extendedDetails: {
        amount: '$2,450.00',
        notes: 'Payment received via ACH transfer. Confirmation #ACH-789456',
        status: 'Completed'
      }
    },
    {
      id: '5a',
      type: 'invoice-sent',
      user: 'You',
      userInitials: 'YO',
      action: 'sent invoice',
      details: 'Invoice #2024-0178',
      metadata: '$3,200.00',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 1 day, 2 hours ago
      category: 'financial',
      extendedDetails: {
        amount: '$3,200.00',
        subject: 'Invoice for Consulting Services',
        notes: 'Invoice for business consulting and advisory services - November 2024.',
        to: [client.email],
        preview: 'https://images.unsplash.com/photo-1762427354566-2b6902a9fd06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZvaWNlJTIwZG9jdW1lbnR8ZW58MXx8fHwxNzY2MTg5MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        previewType: 'invoice',
        documentUrl: '/invoices/2024-0178.pdf'
      },
      tracking: {
        invoiceViewed: true,
        invoiceViewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
        invoiceLastViewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        invoiceViewCount: 1,
        invoiceDownloaded: false
      }
    },
    {
      id: '6',
      type: 'phone-call-outbound',
      user: 'Mike Brown',
      userInitials: 'MB',
      action: 'called client',
      details: 'Discussed quarterly taxes',
      metadata: '15 min',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000), // 1 day, 3 hours ago
      category: 'communication',
      extendedDetails: {
        duration: '15 minutes',
        participants: [client.firstName + ' ' + client.lastName, 'Mike Brown'],
        notes: 'Discussed Q4 estimated tax payments and potential deductions. Client will gather charitable contribution receipts. Follow-up scheduled for next week.'
      }
    },
    {
      id: '7',
      type: 'meeting-scheduled',
      user: 'You',
      userInitials: 'YO',
      action: 'scheduled a meeting',
      details: 'Q4 Tax Planning Session',
      metadata: 'Dec 15, 2:00 PM',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      category: 'meetings',
      extendedDetails: {
        duration: '60 minutes',
        participants: [client.firstName + ' ' + client.lastName, 'You', 'Sarah Johnson'],
        location: 'Video Conference (Zoom)',
        notes: 'Agenda: Review Q4 estimates, discuss year-end tax strategies, review investment opportunities'
      }
    },
    {
      id: '8',
      type: 'document-signed',
      user: client.firstName + ' ' + client.lastName,
      userInitials: (client.firstName[0] + client.lastName[0]).toUpperCase(),
      action: 'signed document',
      details: 'Engagement Letter 2024',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000), // 2 days, 4 hours ago
      category: 'signatures',
      extendedDetails: {
        notes: 'Document signed via DocuSign. All parties have received executed copy.',
        status: 'Fully Executed'
      }
    },
    {
      id: '9',
      type: 'task-completed',
      user: 'Sarah Johnson',
      userInitials: 'SJ',
      action: 'completed task',
      details: 'Review Q3 financials',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      category: 'tasks',
      extendedDetails: {
        notes: 'Reviewed all Q3 financial statements. Found minor discrepancy in August expenses - corrected. Client financials are now accurate and ready for tax prep.',
        status: 'Completed'
      }
    },
    {
      id: '10',
      type: 'team-member-added',
      user: 'You',
      userInitials: 'YO',
      action: 'added team member',
      details: 'Sarah Johnson',
      metadata: 'Senior Accountant',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 3 days, 2 hours ago
      category: 'team',
      extendedDetails: {
        notes: 'Sarah will be assisting with this client account. She has full access to documents and communications.',
        status: 'Active'
      }
    },
    {
      id: '11',
      type: 'invoice-sent',
      user: 'You',
      userInitials: 'YO',
      action: 'sent invoice',
      details: 'Invoice #2024-0156',
      metadata: '$2,450.00',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      category: 'financial',
      extendedDetails: {
        amount: '$2,450.00',
        subject: 'Invoice for Tax Preparation Services',
        notes: 'Invoice for 2024 individual tax return preparation. Payment due within 30 days.',
        to: [client.email]
      },
      tracking: {
        invoiceViewed: true,
        invoiceViewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000), // 4 days, 6 hours ago
        invoiceLastViewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        invoiceViewCount: 3,
        invoiceDownloaded: true,
        invoiceDownloadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000) // 3 days, 2 hours ago
      }
    },
    {
      id: '12',
      type: 'note-added',
      user: 'Mike Brown',
      userInitials: 'MB',
      action: 'added a note',
      details: 'Client prefers email communication',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      category: 'tasks',
      extendedDetails: {
        notes: 'Client has requested all future communications be via email. They check email daily and prefer this over phone calls for non-urgent matters.'
      }
    },
    {
      id: '12a',
      type: 'invoice-created',
      user: 'You',
      userInitials: 'YO',
      action: 'created invoice',
      details: 'Invoice #2024-0142',
      metadata: '$1,950.00',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      category: 'financial',
      extendedDetails: {
        amount: '$1,950.00',
        subject: 'Invoice for Payroll Processing Services',
        notes: 'Monthly payroll processing for October 2024.',
        to: [client.email]
      },
      tracking: {
        invoiceViewed: false
      }
    },
    {
      id: '13',
      type: 'video-meeting',
      user: 'You',
      userInitials: 'YO',
      action: 'had a video meeting',
      details: 'Year-end tax review',
      metadata: '45 min',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      category: 'meetings',
      extendedDetails: {
        duration: '45 minutes',
        participants: [client.firstName + ' ' + client.lastName, 'You'],
        location: 'Zoom Meeting',
        notes: 'Comprehensive review of tax situation. Discussed:\n- Current year projections\n- Retirement contribution strategies\n- Potential tax credits\n- Filing timeline\n\nAction items: Client to provide remaining documentation by month end.'
      }
    },
    {
      id: '14',
      type: 'portal-access-granted',
      user: 'You',
      userInitials: 'YO',
      action: 'granted portal access',
      details: client.firstName + ' ' + client.lastName,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      category: 'authentication',
      extendedDetails: {
        notes: 'Client portal access credentials sent via email. Welcome package includes tutorial video and quick start guide.'
      }
    }
  ];

  // Define categories for filtering
  const categories = [
    { 
      value: 'email', 
      label: 'Email', 
      icon: Mail,
      count: allActivities.filter(a => a.type.includes('email')).length 
    },
    { 
      value: 'call', 
      label: 'Calls', 
      icon: Phone,
      count: allActivities.filter(a => a.type.includes('phone-call')).length 
    },
    { 
      value: 'sms', 
      label: 'SMS', 
      icon: MessageSquare,
      count: allActivities.filter(a => a.type.includes('sms')).length 
    },
    { 
      value: 'meeting', 
      label: 'Meetings', 
      icon: Video,
      count: allActivities.filter(a => a.type.includes('meeting') || a.type === 'video-meeting').length 
    },
    { 
      value: 'document', 
      label: 'Documents', 
      icon: FileText,
      count: allActivities.filter(a => a.type.includes('document')).length 
    },
    { 
      value: 'invoice', 
      label: 'Invoices', 
      icon: DollarSign,
      count: allActivities.filter(a => a.type.includes('invoice') || a.type.includes('payment')).length 
    },
    { 
      value: 'signature', 
      label: 'Signatures', 
      icon: FileSignature,
      count: allActivities.filter(a => a.type.includes('signature') || a.type.includes('signed')).length 
    },
    { 
      value: 'task', 
      label: 'Tasks', 
      icon: CheckCircle,
      count: allActivities.filter(a => a.type.includes('task')).length 
    }
  ];

  // Get icon and color for activity type
  const getActivityIcon = (type: ActivityType): { icon: React.ReactNode; bgColor: string; textColor: string } => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      // Authentication
      case 'login':
        return { icon: <LogIn className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'logout':
        return { icon: <LogOut className={iconClass} />, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
      case 'password-reset':
        return { icon: <Key className={iconClass} />, bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      case 'portal-access-granted':
        return { icon: <Key className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      
      // Documents
      case 'document-upload':
        return { icon: <Upload className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'document-download':
        return { icon: <Download className={iconClass} />, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' };
      case 'document-shared':
        return { icon: <Share2 className={iconClass} />, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' };
      case 'document-deleted':
        return { icon: <FileText className={iconClass} />, bgColor: 'bg-red-100', textColor: 'text-red-700' };
      
      // Communication
      case 'email-sent':
      case 'email-received':
        return { icon: <Mail className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'sms-sent':
      case 'sms-received':
        return { icon: <MessageSquare className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'phone-call-outbound':
      case 'phone-call-inbound':
        return { icon: <Phone className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'phone-call-missed':
        return { icon: <Phone className={iconClass} />, bgColor: 'bg-red-100', textColor: 'text-red-700' };
      case 'video-meeting':
        return { icon: <Video className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'message-sent':
        return { icon: <MessageCircle className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'comment-added':
        return { icon: <MessageCircle className={iconClass} />, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
      
      // Meetings
      case 'meeting-scheduled':
        return { icon: <Calendar className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'meeting-completed':
        return { icon: <CheckCircle2 className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'meeting-cancelled':
        return { icon: <X className={iconClass} />, bgColor: 'bg-red-100', textColor: 'text-red-700' };
      case 'meeting-rescheduled':
        return { icon: <Clock className={iconClass} />, bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      
      // Financial
      case 'invoice-created':
        return { icon: <FilePlus className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'invoice-sent':
        return { icon: <Send className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'invoice-viewed':
        return { icon: <FileText className={iconClass} />, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' };
      case 'invoice-paid':
        return { icon: <CheckCircle className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'payment-received':
        return { icon: <DollarSign className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      
      // Signatures
      case 'signature-request-sent':
        return { icon: <Send className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'document-signed':
        return { icon: <FileSignature className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'signature-declined':
        return { icon: <X className={iconClass} />, bgColor: 'bg-red-100', textColor: 'text-red-700' };
      
      // Tasks
      case 'task-created':
        return { icon: <FilePlus className={iconClass} />, bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'task-completed':
        return { icon: <CheckCircle className={iconClass} />, bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'task-assigned':
        return { icon: <UserPlus className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'note-added':
      case 'note-updated':
        return { icon: <StickyNote className={iconClass} />, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
      
      // Team
      case 'team-member-added':
        return { icon: <UserPlus className={iconClass} />, bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'team-member-removed':
        return { icon: <UserPlus className={iconClass} />, bgColor: 'bg-red-100', textColor: 'text-red-700' };
      
      // Default
      default:
        return { icon: <Activity className={iconClass} />, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Format tracking timestamp
  const formatTrackingTimestamp = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for grouping
  const formatDateGroup = (date: Date): { date: string; displayDate: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (activityDate.getTime() === today.getTime()) {
      return { date: activityDate.toISOString(), displayDate: 'Today' };
    } else if (activityDate.getTime() === yesterday.getTime()) {
      return { date: activityDate.toISOString(), displayDate: 'Yesterday' };
    } else if (now.getTime() - activityDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return { 
        date: activityDate.toISOString(), 
        displayDate: activityDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      };
    } else {
      return { 
        date: activityDate.toISOString(), 
        displayDate: activityDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
    }
  };

  // Filter and search activities
  const filteredActivities = allActivities.filter(activity => {
    // Category filter - now based on activity type
    if (selectedCategories.length > 0) {
      const matchesCategory = selectedCategories.some(cat => {
        switch(cat) {
          case 'email': return activity.type.includes('email');
          case 'call': return activity.type.includes('phone-call');
          case 'sms': return activity.type.includes('sms');
          case 'meeting': return activity.type.includes('meeting') || activity.type === 'video-meeting';
          case 'document': return activity.type.includes('document');
          case 'invoice': return activity.type.includes('invoice') || activity.type.includes('payment');
          case 'signature': return activity.type.includes('signature') || activity.type.includes('signed');
          case 'task': return activity.type.includes('task');
          default: return false;
        }
      });
      if (!matchesCategory) return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        activity.user.toLowerCase().includes(searchLower) ||
        activity.action.toLowerCase().includes(searchLower) ||
        activity.details?.toLowerCase().includes(searchLower) ||
        activity.metadata?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Group activities by date
  const groupedActivities: ActivityGroup[] = filteredActivities.reduce((groups: ActivityGroup[], activity) => {
    const { date, displayDate } = formatDateGroup(activity.timestamp);
    
    let group = groups.find(g => g.date === date);
    if (!group) {
      group = { date, displayDate, activities: [] };
      groups.push(group);
    }
    
    group.activities.push(activity);
    return groups;
  }, []);

  // Sort groups by date (most recent first)
  groupedActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleActivityExpansion = (activityId: string) => {
    setExpandedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  // Determine if an activity has expandable details
  const hasExtendedDetails = (activity: ActivityItem): boolean => {
    return !!activity.extendedDetails && Object.keys(activity.extendedDetails).length > 0;
  };

  // Expose state to parent via ref
  useImperativeHandle(ref, () => ({
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    categories
  }));

  return (
    <div className="p-6">
      {/* Timeline */}
      {groupedActivities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || selectedCategories.length > 0
                ? 'No activities found matching your filters'
                : 'No activity to display'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map((group, groupIndex) => (
            <div key={group.date} className="relative">
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.displayDate}</h3>
                  <p className="text-sm text-gray-500">{group.activities.length} activities</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              </div>

              {/* Vertical Timeline Line */}
              {groupIndex !== groupedActivities.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-transparent" />
              )}

              {/* Activities */}
              <div className="ml-24 space-y-3">
                {group.activities.map((activity, activityIndex) => {
                  const { icon, bgColor, textColor } = getActivityIcon(activity.type);
                  const isExpanded = expandedActivities.includes(activity.id);
                  const canExpand = hasExtendedDetails(activity);
                  
                  return (
                    <div key={activity.id} className="relative">
                      {/* Connection Line to Timeline */}
                      <div className="absolute -left-16 top-6 w-16 h-px bg-gray-200" />
                      
                      {/* Activity Card */}
                      <Collapsible open={isExpanded} onOpenChange={() => canExpand && toggleActivityExpansion(activity.id)}>
                        <Card 
                          className={cn(
                            "p-4 border-l-4 border-l-purple-600 transition-all",
                            canExpand && "hover:shadow-md cursor-pointer"
                          )}
                          onClick={() => canExpand && toggleActivityExpansion(activity.id)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bgColor, textColor)}>
                              {icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-900">{activity.user}</span>
                                    <span className="text-gray-600"> {activity.action}</span>
                                  </p>
                                  {activity.details && (
                                    <p className="text-sm text-gray-700 font-medium mt-0.5">{activity.details}</p>
                                  )}
                                  {activity.metadata && (
                                    <p className="text-xs text-gray-500 mt-0.5">{activity.metadata}</p>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatRelativeTime(activity.timestamp)}
                                </span>
                              </div>

                              {/* Row with View Details button and Invoice Tracking */}
                              <div className="flex items-center justify-between mt-2">
                                {/* Expand/Collapse Trigger */}
                                {canExpand && (
                                  <CollapsibleTrigger asChild>
                                    <button 
                                      className="flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-800 group"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ChevronRight className={cn(
                                        "w-3.5 h-3.5 transition-transform",
                                        isExpanded && "rotate-90"
                                      )} />
                                      <span className="group-hover:underline">
                                        {isExpanded ? 'Hide details' : 'View details'}
                                      </span>
                                    </button>
                                  </CollapsibleTrigger>
                                )}

                                {/* Invoice Tracking */}
                                {(activity.type === 'invoice-created' || activity.type === 'invoice-sent') && activity.tracking && (
                                  <div className="flex items-center gap-2 text-[10px] text-gray-600 ml-auto">
                                    {activity.tracking.invoiceViewed === false ? (
                                      <span 
                                        className="flex items-center gap-1"
                                        title="Invoice has not been viewed yet"
                                      >
                                        <EyeOff className="w-3 h-3" />
                                        <span className="uppercase">NOT VIEWED</span>
                                      </span>
                                    ) : activity.tracking.invoiceViewed && activity.tracking.invoiceViewedAt ? (
                                      <>
                                        <span 
                                          className="flex items-center gap-1"
                                          title={`Viewed ${activity.tracking.invoiceViewCount || 1} time(s). Last viewed: ${activity.tracking.invoiceLastViewedAt ? formatTrackingTimestamp(activity.tracking.invoiceLastViewedAt) : 'N/A'}`}
                                        >
                                          <Eye className="w-3 h-3" />
                                          Viewed: {formatTrackingTimestamp(activity.tracking.invoiceViewedAt)}
                                        </span>
                                        {activity.tracking.invoiceDownloaded && activity.tracking.invoiceDownloadedAt && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span 
                                              className="flex items-center gap-1"
                                              title={`Downloaded: ${formatTrackingTimestamp(activity.tracking.invoiceDownloadedAt)}`}
                                            >
                                              <Download className="w-3 h-3" />
                                              Downloaded: {formatTrackingTimestamp(activity.tracking.invoiceDownloadedAt)}
                                            </span>
                                          </>
                                        )}
                                      </>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User Avatar */}
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                {activity.userInitials}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          {/* Extended Details */}
                          {canExpand && (
                            <CollapsibleContent className="mt-4 pt-4 border-t border-gray-100">
                              <div className="pl-14 space-y-3">
                                {/* Document/Invoice Preview */}
                                {activity.extendedDetails?.preview && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {activity.extendedDetails.previewType === 'invoice' ? (
                                          <>
                                            <DollarSign className="w-3.5 h-3.5" />
                                            <span>Invoice Preview:</span>
                                          </>
                                        ) : (
                                          <>
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Document Preview:</span>
                                          </>
                                        )}
                                      </div>
                                      {activity.extendedDetails.documentUrl && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(activity.extendedDetails?.documentUrl, '_blank');
                                          }}
                                        >
                                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                          Open Full Document
                                        </Button>
                                      )}
                                    </div>
                                    <div 
                                      className={cn(
                                        "relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm group",
                                        activity.extendedDetails.documentUrl && "cursor-pointer hover:border-purple-300 transition-all"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (activity.extendedDetails?.documentUrl) {
                                          window.open(activity.extendedDetails.documentUrl, '_blank');
                                        }
                                      }}
                                    >
                                      <img 
                                        src={activity.extendedDetails.preview} 
                                        alt={`${activity.extendedDetails.previewType || 'document'} preview`}
                                        className="w-full h-auto object-contain max-h-96"
                                      />
                                      {activity.extendedDetails.documentUrl && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
                                            <ExternalLink className="w-4 h-4 text-purple-700" />
                                            <span className="text-sm font-medium text-purple-700">Click to open</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Email Details */}
                                {activity.extendedDetails?.subject && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Mail className="w-3.5 h-3.5" />
                                      <span>Subject:</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{activity.extendedDetails.subject}</p>
                                  </div>
                                )}
                                
                                {activity.extendedDetails?.to && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <User className="w-3.5 h-3.5" />
                                      <span>To:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activity.extendedDetails.to.map((recipient, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {recipient}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {activity.extendedDetails?.cc && activity.extendedDetails.cc.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <User className="w-3.5 h-3.5" />
                                      <span>CC:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activity.extendedDetails.cc.map((recipient, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {recipient}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {activity.extendedDetails?.body && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Message:</span>
                                    </div>
                                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                                      {activity.extendedDetails.body}
                                    </div>
                                  </div>
                                )}

                                {activity.extendedDetails?.attachments && activity.extendedDetails.attachments.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span>Attachments:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activity.extendedDetails.attachments.map((file, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs gap-1">
                                          <FileText className="w-3 h-3" />
                                          {file}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Meeting/Call Details */}
                                {activity.extendedDetails?.participants && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Users className="w-3.5 h-3.5" />
                                      <span>Participants:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activity.extendedDetails.participants.map((participant, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {participant}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {activity.extendedDetails?.duration && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Duration:</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{activity.extendedDetails.duration}</p>
                                  </div>
                                )}

                                {activity.extendedDetails?.location && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <MapPin className="w-3.5 h-3.5" />
                                      <span>Location:</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{activity.extendedDetails.location}</p>
                                  </div>
                                )}

                                {/* Financial Details */}
                                {activity.extendedDetails?.amount && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <DollarSign className="w-3.5 h-3.5" />
                                      <span>Amount:</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{activity.extendedDetails.amount}</p>
                                  </div>
                                )}

                                {/* General Details */}
                                {activity.extendedDetails?.status && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Status:</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {activity.extendedDetails.status}
                                    </Badge>
                                  </div>
                                )}

                                {activity.extendedDetails?.tags && activity.extendedDetails.tags.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Activity className="w-3.5 h-3.5" />
                                      <span>Tags:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activity.extendedDetails.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {activity.extendedDetails?.notes && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <StickyNote className="w-3.5 h-3.5" />
                                      <span>Notes:</span>
                                    </div>
                                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                                      {activity.extendedDetails.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          )}
                        </Card>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ActivityTab.displayName = 'ActivityTab';