import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Download, Trash2, AlertCircle, Check, X, 
  Mail, MessageSquare, MoveRight, Edit, FileEdit, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, Play, Ban, Calendar, Clock,
  ZoomIn, ZoomOut, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, ExternalLink,
  Maximize2, Minimize2, User, Building2, Filter, Plus, Bell, FolderOpen,
  TrendingUp, Eye, CheckCircle, CheckCircle2, FileQuestion, Folder, Users, EyeOff, PanelLeftClose, PanelLeft,
  LayoutGrid, List
} from 'lucide-react';
import { Resizable } from 're-resizable';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { RequestDocumentDialog } from '../dialogs/RequestDocumentDialog';
import { MoveDocumentDialog } from '../dialogs/MoveDocumentDialog';
import { DocumentFilterPanel } from '../DocumentFilterPanel';
import { ChangeYearDialog } from '../dialogs/ChangeYearDialog';
import { DeleteDocumentsDialog } from '../dialogs/DeleteDocumentsDialog';
import { MoveToUserDialog } from '../dialogs/MoveToUserDialog';
import { UploadDocumentsDialog } from '../dialogs/UploadDocumentsDialog';
import { RequestDocumentsWorkflow } from '../RequestDocumentsWorkflow';
import { ReminderHistoryDialog } from '../dialogs/ReminderHistoryDialog';
import { ActivityLogView } from '../ActivityLogView';
import { FileManagerView } from '../FileManagerView';
import { DocumentActivityLogView } from '../DocumentActivityLogView';
import { DocumentChecklistView } from '../DocumentChecklistView';

type DocumentMethod = 'Uploaded File' | 'Email' | 'Text Message';
type DocumentStatus = 'pending' | 'approved' | 'requested' | 'rejected';

type ReminderHistory = {
  sentDate: Date;
  sentBy: string;
  viewed: boolean;
  viewedDate?: Date;
};

type Document = {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  documentType: string;
  year: string;
  receivedDate: string | null;
  reviewedDate: string | null;
  reviewedBy: string | null;
  status: DocumentStatus;
  rejectionReason?: string;
  requestedDate?: string;
  method: DocumentMethod | null;
  thumbnail: string;
  hasOldYear?: boolean;
  uploadedBy?: string; // For linked accounts - show who uploaded
  reminderHistory?: ReminderHistory[]; // Track all reminder sends
};

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  documentCount: number;
  newDocumentCount: number; // pending or requested
  mostRecentDate: string;
  linkedAccounts?: string[]; // IDs of linked clients
  isFirm?: boolean; // Special flag for firm documents
};

type ActivityType = 
  | 'upload'
  | 'approve'
  | 'reject'
  | 'move'
  | 'delete'
  | 'rename'
  | 'request'
  | 'reminder'
  | 'view'
  | 'note'
  | 'type_change'
  | 'year_change';

type ActivityLogEntry = {
  id: string;
  timestamp: Date;
  activityType: ActivityType;
  performedBy: string;
  clientId: string;
  clientName: string;
  documentId?: string;
  documentName?: string;
  documentType?: string;
  details: string;
  metadata?: {
    rejectionReason?: string;
    fromFolder?: string;
    toFolder?: string;
    fromClient?: string;
    toClient?: string;
    fromYear?: string;
    toYear?: string;
    oldName?: string;
    newName?: string;
    reminderSent?: boolean;
    reminderViewed?: boolean;
    emailSent?: boolean;
    originalDocument?: Document; // For rejected docs
  };
};

type TabMode = 'documents' | 'filemanager' | 'checklist' | 'activitylog';

export function DocumentCenterView() {
  const navigate = useNavigate();
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentNoteDocId, setCurrentNoteDocId] = useState<string | null>(null);
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState('');
  const [editingDocumentName, setEditingDocumentName] = useState(false);
  const [tempDocumentName, setTempDocumentName] = useState('');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [clientSortBy, setClientSortBy] = useState<'recent' | 'name'>('recent');
  const [clientNewFilter, setClientNewFilter] = useState<'all' | 'new'>('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'pending' | 'reviewing'>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocName, setEditingDocName] = useState('');
  const [rejectEmailTemplate, setRejectEmailTemplate] = useState('');
  const [showOrganizeView, setShowOrganizeView] = useState(false);
  const [showChangeYearDialog, setShowChangeYearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveToUserDialog, setShowMoveToUserDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRequestDocumentsWorkflow, setShowRequestDocumentsWorkflow] = useState(false);
  const [clientListCollapsed, setClientListCollapsed] = useState(false);
  
  // View mode state - Table View or Split View
  const [viewMode, setViewMode] = useState<'table' | 'split'>(() => {
    const saved = localStorage.getItem('documentCenterViewMode');
    return (saved === 'split' || saved === 'table') ? saved : 'table';
  });

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('documentCenterViewMode', viewMode);
  }, [viewMode]);

  // Reminder history dialog state
  const [showReminderHistoryDialog, setShowReminderHistoryDialog] = useState(false);
  const [reminderDialogDoc, setReminderDialogDoc] = useState<Document | null>(null);
  const [reminderEmailBody, setReminderEmailBody] = useState('');

  // Activity Log state
  const [activityLogDays, setActivityLogDays] = useState(7); // Default to 7 days
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType | 'all'>('all');
  const [activityUserFilter, setActivityUserFilter] = useState('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [showActivityFilters, setShowActivityFilters] = useState(false);

  // Track reminder sent timestamps (documentId -> timestamp) - LEGACY
  const [reminderSentTimestamps, setReminderSentTimestamps] = useState<Record<string, number>>({});

  // Helper to check if reminder was sent within last 24 hours - LEGACY
  const wasReminderSentRecently = (docId: string): boolean => {
    const timestamp = reminderSentTimestamps[docId];
    if (!timestamp) return false;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < twentyFourHours;
  };

  // Helper to get reminder history for a document
  const getReminderHistory = (doc: Document): ReminderHistory[] => {
    return doc.reminderHistory || [];
  };

  // Helper to check if any reminder was sent in last 7 days
  const hasRecentReminder = (doc: Document): boolean => {
    const history = getReminderHistory(doc);
    if (history.length === 0) return false;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return history.some(h => h.sentDate.getTime() > sevenDaysAgo);
  };

  // Helper to format relative time or absolute date
  const formatReminderDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Recent - use relative time
    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} mins ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 3) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    // Older - use date | time format
    const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} | ${timeStr}`;
  };

  // Get the most recent reminder for a document
  const getLatestReminder = (doc: Document): ReminderHistory | null => {
    const history = getReminderHistory(doc);
    if (history.length === 0) return null;
    return history[history.length - 1];
  };

  // Handler for sending reminder
  const handleSendReminder = (doc: Document, emailBody?: string) => {
    const newReminder: ReminderHistory = {
      sentDate: new Date(),
      sentBy: 'Current User',
      viewed: Math.random() > 0.5, // Mock viewed status
      viewedDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
    };

    setDocuments(docs =>
      docs.map(d =>
        d.id === doc.id
          ? {
              ...d,
              reminderHistory: [...(d.reminderHistory || []), newReminder],
            }
          : d
      )
    );

    // Keep legacy timestamp for backward compatibility
    setReminderSentTimestamps(prev => ({
      ...prev,
      [doc.id]: Date.now()
    }));

    toast.success('Reminder sent to ' + doc.clientName);
  };

  // Handler for clicking Send Reminder button
  const handleSendReminderClick = (doc: Document) => {
    if (hasRecentReminder(doc)) {
      // Show history dialog
      setReminderDialogDoc(doc);
      setReminderEmailBody(`Hi ${doc.clientName},\n\nThis is a reminder to upload your ${doc.documentType} for the ${doc.year} tax year.\n\nPlease upload at your earliest convenience.\n\nThank you!`);
      setShowReminderHistoryDialog(true);
    } else {
      // Send immediately
      handleSendReminder(doc);
    }
  };

  // Helper function to check if year is 2+ years old
  const isOldYear = (year: string): boolean => {
    const currentYear = new Date().getFullYear();
    const docYear = parseInt(year);
    return currentYear - docYear >= 2;
  };

  // Helper function to format received date
  const formatReceivedDate = (dateStr: string | null): { date: string; time: string } | null => {
    if (!dateStr) return null;
    const [date, time, meridian] = dateStr.split(' ');
    return { date, time: `${time} ${meridian}` };
  };

  // Mock clients data
  const [clients] = useState<ClientSummary[]>([
    // FIRM DOCUMENTS - Always first
    {
      id: 'firm',
      name: 'FIRM Documents',
      type: 'Business',
      documentCount: 0,
      newDocumentCount: 0,
      mostRecentDate: new Date().toISOString().split('T')[0],
      isFirm: true,
    },
    {
      id: '1',
      name: 'Troy Business Services LLC',
      type: 'Business',
      documentCount: 15,
      newDocumentCount: 3,
      mostRecentDate: '2024-12-20',
    },
    {
      id: '2',
      name: 'Abacus 360',
      type: 'Business',
      documentCount: 22,
      newDocumentCount: 6,
      mostRecentDate: '2024-10-17',
    },
    {
      id: '3',
      name: 'Best Face Forward',
      type: 'Business',
      documentCount: 8,
      newDocumentCount: 1,
      mostRecentDate: '2024-10-10',
    },
    {
      id: '4',
      name: 'Cleveland Business Services, LLC',
      type: 'Business',
      documentCount: 12,
      newDocumentCount: 2,
      mostRecentDate: '2024-10-18',
    },
    {
      id: '5',
      name: 'John Smith',
      type: 'Individual',
      documentCount: 9,
      newDocumentCount: 2,
      mostRecentDate: '2024-12-10',
      linkedAccounts: ['6'], // Linked to spouse
    },
    {
      id: '6',
      name: 'Jane Smith',
      type: 'Individual',
      documentCount: 7,
      newDocumentCount: 1,
      mostRecentDate: '2024-12-08',
      linkedAccounts: ['5'], // Linked to spouse
    },
    {
      id: '7',
      name: 'Anderson Construction Inc',
      type: 'Business',
      documentCount: 6,
      newDocumentCount: 0,
      mostRecentDate: '2024-08-15',
    },
    {
      id: '8',
      name: 'Green Valley Consulting',
      type: 'Business',
      documentCount: 11,
      newDocumentCount: 0,
      mostRecentDate: '2024-09-22',
    },
    {
      id: '9',
      name: 'Emily Rodriguez',
      type: 'Individual',
      documentCount: 4,
      newDocumentCount: 0,
      mostRecentDate: '2024-07-30',
    },
    {
      id: '10',
      name: 'Michael Chen',
      type: 'Individual',
      documentCount: 13,
      newDocumentCount: 4,
      mostRecentDate: '2024-11-28',
      linkedAccounts: ['13', '14'], // Linked to spouse and business
    },
    {
      id: '13',
      name: 'Lisa Chen',
      type: 'Individual',
      documentCount: 8,
      newDocumentCount: 2,
      mostRecentDate: '2024-11-25',
      linkedAccounts: ['10'], // Linked to spouse
    },
    {
      id: '14',
      name: 'Chen Family Trust',
      type: 'Business',
      documentCount: 5,
      newDocumentCount: 1,
      mostRecentDate: '2024-11-20',
      linkedAccounts: ['10'], // Linked to Michael
    },
    {
      id: '11',
      name: 'Stellar Marketing LLC',
      type: 'Business',
      documentCount: 7,
      newDocumentCount: 0,
      mostRecentDate: '2024-06-12',
    },
    {
      id: '12',
      name: 'David & Sarah Williams',
      type: 'Individual',
      documentCount: 5,
      newDocumentCount: 1,
      mostRecentDate: '2024-11-05',
    },
    {
      id: '15',
      name: 'Robert Johnson',
      type: 'Individual',
      documentCount: 6,
      newDocumentCount: 2,
      mostRecentDate: '2024-12-15',
      linkedAccounts: ['16'], // Linked to spouse
    },
    {
      id: '16',
      name: 'Maria Johnson',
      type: 'Individual',
      documentCount: 5,
      newDocumentCount: 1,
      mostRecentDate: '2024-12-12',
      linkedAccounts: ['15'], // Linked to spouse
    },
  ]);

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    // Troy Business Services LLC (id: 1)
    {
      id: '1',
      name: 'W2_Form_2024.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-10-15 09:23 AM',
      reviewedDate: '2024-10-16 02:15 PM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '2',
      name: 'Invoice_123.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'Invoice',
      year: '2024',
      receivedDate: '2024-11-05 01:20 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '3',
      name: 'Receipt_456.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'Receipt',
      year: '2024',
      receivedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      status: 'requested',
      requestedDate: '2024-11-01',
      method: null,
      thumbnail: '📄',
      reminderHistory: [
        {
          sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          sentBy: 'Sarah Johnson',
          viewed: true,
          viewedDate: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
        },
        {
          sentDate: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
          sentBy: 'Current User',
          viewed: false,
        },
      ],
    },
    {
      id: '4',
      name: '1099_NEC_2023.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: '1099-NEC',
      year: '2023',
      receivedDate: '2024-03-15 10:45 AM',
      reviewedDate: '2024-03-16 11:20 AM',
      reviewedBy: 'David Martinez',
      status: 'approved',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: '5',
      name: 'Tax_Return_2021.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'Tax Return',
      year: '2021',
      receivedDate: '2024-10-01 02:30 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
      hasOldYear: true,
    },

    // Abacus 360 (id: 2)
    {
      id: '6',
      name: '1099_Misc_2024.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: '1099-MISC',
      year: '2024',
      receivedDate: '2024-10-12 11:45 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: '7',
      name: 'Tax_Return_2022.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Tax Return',
      year: '2022',
      receivedDate: '2024-10-14 02:30 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
      hasOldYear: true,
    },
    {
      id: '8',
      name: 'Bank_Statement_Oct_2024.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-11-01 08:15 AM',
      reviewedDate: '2024-11-02 09:45 AM',
      reviewedBy: 'Emily Davis',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '9',
      name: 'Donation_Receipt_2024.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Donation Receipt',
      year: '2024',
      receivedDate: '2024-09-20 03:30 PM',
      reviewedDate: '2024-09-21 10:15 AM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Text Message',
      thumbnail: '💬',
    },
    {
      id: '10',
      name: 'W2_Form_2020.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'W2 Form',
      year: '2020',
      receivedDate: '2024-11-10 01:20 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
      hasOldYear: true,
    },

    // Cleveland Business Services, LLC (id: 4)
    {
      id: '11',
      name: 'W2_Form_2023.pdf',
      clientName: 'Cleveland Business Services, LLC',
      clientId: '4',
      clientType: 'Business',
      documentType: 'W2 Form',
      year: '2023',
      receivedDate: '2024-10-18 10:30 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '12',
      name: 'Invoice_789.pdf',
      clientName: 'Cleveland Business Services, LLC',
      clientId: '4',
      clientType: 'Business',
      documentType: 'Invoice',
      year: '2024',
      receivedDate: '2024-11-12 02:45 PM',
      reviewedDate: '2024-11-13 09:00 AM',
      reviewedBy: 'Mike Brown',
      status: 'approved',
      method: 'Email',
      thumbnail: '📧',
    },

    // John Smith (id: 5)
    {
      id: '13',
      name: 'Property_Tax_Bill.pdf',
      clientName: 'John Smith',
      clientId: '5',
      clientType: 'Individual',
      documentType: 'Property Tax Bill',
      year: '2024',
      receivedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      status: 'requested',
      requestedDate: '2024-10-01',
      method: null,
      thumbnail: '📄',
      reminderHistory: [
        {
          sentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          sentBy: 'Mike Brown',
          viewed: false,
        },
      ],
    },
    {
      id: '14',
      name: 'Mortgage_Interest_2023.pdf',
      clientName: 'John Smith',
      clientId: '5',
      clientType: 'Individual',
      documentType: 'Other',
      year: '2023',
      receivedDate: '2024-02-10 11:30 AM',
      reviewedDate: '2024-02-11 03:15 PM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '15',
      name: 'W2_Form_2024.pdf',
      clientName: 'John Smith',
      clientId: '5',
      clientType: 'Individual',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-12-05 09:20 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },

    // Jane Smith (id: 6)
    {
      id: '16',
      name: 'Bank_Statement_Sept.pdf',
      clientName: 'Jane Smith',
      clientId: '6',
      clientType: 'Individual',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-10-10 03:12 PM',
      reviewedDate: '2024-10-11 09:30 AM',
      reviewedBy: 'Mike Brown',
      status: 'approved',
      method: 'Text Message',
      thumbnail: '💬',
    },
    {
      id: '17',
      name: 'Donation_Receipt_2024.pdf',
      clientName: 'Jane Smith',
      clientId: '6',
      clientType: 'Individual',
      documentType: 'Donation Receipt',
      year: '2024',
      receivedDate: '2024-11-18 10:05 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '17a',
      name: 'W2_Form_2024.pdf',
      clientName: 'Jane Smith',
      clientId: '6',
      clientType: 'Individual',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-12-08 11:15 AM',
      reviewedDate: '2024-12-09 02:30 PM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '17b',
      name: 'Property_Tax_Bill_2024.pdf',
      clientName: 'Jane Smith',
      clientId: '6',
      clientType: 'Individual',
      documentType: 'Property Tax Bill',
      year: '2024',
      receivedDate: '2024-12-01 09:45 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: '17c',
      name: '1099_INT_2024.pdf',
      clientName: 'Jane Smith',
      clientId: '6',
      clientType: 'Individual',
      documentType: '1099-INT',
      year: '2024',
      receivedDate: '2024-11-28 03:20 PM',
      reviewedDate: '2024-11-29 10:00 AM',
      reviewedBy: 'Mike Brown',
      status: 'approved',
      method: 'Text Message',
      thumbnail: '💬',
    },

    // Robert Johnson (id: 15) - Test client with spouse
    {
      id: 'test1',
      name: 'W2_Form_2024.pdf',
      clientName: 'Robert Johnson',
      clientId: '15',
      clientType: 'Individual',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-12-10 10:30 AM',
      reviewedDate: '2024-12-11 02:15 PM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: 'test2',
      name: 'Bank_Statement_Dec_2024.pdf',
      clientName: 'Robert Johnson',
      clientId: '15',
      clientType: 'Individual',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-12-15 09:20 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: 'test3',
      name: '1099_DIV_2024.pdf',
      clientName: 'Robert Johnson',
      clientId: '15',
      clientType: 'Individual',
      documentType: '1099-DIV',
      year: '2024',
      receivedDate: '2024-12-05 11:45 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },

    // Maria Johnson (id: 16) - Spouse of Robert Johnson
    {
      id: 'test4',
      name: 'W2_Form_2024.pdf',
      clientName: 'Maria Johnson',
      clientId: '16',
      clientType: 'Individual',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-12-08 02:15 PM',
      reviewedDate: '2024-12-09 10:30 AM',
      reviewedBy: 'Mike Brown',
      status: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: 'test5',
      name: 'Property_Tax_Bill_2024.pdf',
      clientName: 'Maria Johnson',
      clientId: '16',
      clientType: 'Individual',
      documentType: 'Property Tax Bill',
      year: '2024',
      receivedDate: '2024-12-12 09:00 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: 'test6',
      name: 'Donation_Receipt_2024.pdf',
      clientName: 'Maria Johnson',
      clientId: '16',
      clientType: 'Individual',
      documentType: 'Donation Receipt',
      year: '2024',
      receivedDate: '2024-11-30 03:45 PM',
      reviewedDate: '2024-12-01 11:20 AM',
      reviewedBy: 'Sarah Johnson',
      status: 'approved',
      method: 'Text Message',
      thumbnail: '💬',
    },
    {
      id: 'test7',
      name: '1099_INT_2024.pdf',
      clientName: 'Maria Johnson',
      clientId: '16',
      clientType: 'Individual',
      documentType: '1099-INT',
      year: '2024',
      receivedDate: '2024-12-01 10:15 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },

    // Michael Chen (id: 10)
    {
      id: '18',
      name: '1099_NEC_2024.pdf',
      clientName: 'Michael Chen',
      clientId: '10',
      clientType: 'Individual',
      documentType: '1099-NEC',
      year: '2024',
      receivedDate: '2024-11-25 02:30 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: '19',
      name: 'Investment_Statement_2024.pdf',
      clientName: 'Michael Chen',
      clientId: '10',
      clientType: 'Individual',
      documentType: 'Other',
      year: '2024',
      receivedDate: '2024-11-20 11:45 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
    {
      id: '20',
      name: 'Receipt_Medical_2024.pdf',
      clientName: 'Michael Chen',
      clientId: '10',
      clientType: 'Individual',
      documentType: 'Receipt',
      year: '2024',
      receivedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      status: 'requested',
      requestedDate: '2024-11-15',
      method: null,
      thumbnail: '📄',
      reminderHistory: [
        {
          sentDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          sentBy: 'Current User',
          viewed: true,
          viewedDate: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        },
      ],
    },
    {
      id: '21',
      name: 'Tax_Return_2019.pdf',
      clientName: 'Michael Chen',
      clientId: '10',
      clientType: 'Individual',
      documentType: 'Tax Return',
      year: '2019',
      receivedDate: '2024-11-28 04:15 PM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Email',
      thumbnail: '📧',
      hasOldYear: true,
    },

    // Best Face Forward (id: 3)
    {
      id: '22',
      name: 'Invoice_567.pdf',
      clientName: 'Best Face Forward',
      clientId: '3',
      clientType: 'Business',
      documentType: 'Invoice',
      year: '2024',
      receivedDate: '2024-09-15 01:30 PM',
      reviewedDate: '2024-09-16 10:20 AM',
      reviewedBy: 'Emily Davis',
      status: 'approved',
      method: 'Email',
      thumbnail: '📧',
    },
    {
      id: '23',
      name: 'Quarterly_Report_Q3.pdf',
      clientName: 'Best Face Forward',
      clientId: '3',
      clientType: 'Business',
      documentType: 'Other',
      year: '2024',
      receivedDate: '2024-10-05 09:15 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },

    // David & Sarah Williams (id: 12)
    {
      id: '24',
      name: 'Property_Tax_2024.pdf',
      clientName: 'David & Sarah Williams',
      clientId: '12',
      clientType: 'Individual',
      documentType: 'Property Tax Bill',
      year: '2024',
      receivedDate: '2024-11-05 08:30 AM',
      reviewedDate: null,
      reviewedBy: null,
      status: 'pending',
      method: 'Uploaded File',
      thumbnail: '📄',
    },
  ]);

  // Mock activity log data
  const [activityLog] = useState<ActivityLogEntry[]>([
    {
      id: 'act1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      activityType: 'upload',
      performedBy: 'Sarah Johnson',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      documentId: '1',
      documentName: 'W2_2024.pdf',
      documentType: 'Form W-2',
      details: 'Document uploaded via secure portal',
      metadata: { emailSent: true }
    },
    {
      id: 'act2',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      activityType: 'reject',
      performedBy: 'John Smith',
      clientId: '3',
      clientName: 'Sarah Wilson',
      documentId: '11',
      documentName: 'Bank_Statement_Jan.pdf',
      documentType: 'Bank Statement',
      details: 'Document rejected - Wrong document uploaded',
      metadata: {
        rejectionReason: 'Wrong document uploaded. Please upload December bank statement.',
        emailSent: true,
        originalDocument: documents.find(d => d.id === '11')
      }
    },
    {
      id: 'act3',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      activityType: 'move',
      performedBy: 'John Smith',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      documentId: '5',
      documentName: 'Tax_Return_2021.pdf',
      documentType: 'Tax Return',
      details: 'Document moved from Abacus 360',
      metadata: {
        fromClient: 'Abacus 360',
        toClient: 'Troy Business Services LLC',
        fromFolder: 'Tax Returns',
        toFolder: 'Tax Returns'
      }
    },
    {
      id: 'act4',
      timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      activityType: 'approve',
      performedBy: 'John Smith',
      clientId: '2',
      clientName: 'Abacus 360',
      documentId: '6',
      documentName: '1099_Misc_2024.pdf',
      documentType: '1099-MISC',
      details: 'Document approved and filed'
    },
    {
      id: 'act5',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      activityType: 'reminder',
      performedBy: 'John Smith',
      clientId: '4',
      clientName: 'Michael Chen',
      documentId: '13',
      documentName: 'Form_1099_INT.pdf',
      documentType: 'Form 1099-INT',
      details: 'Reminder sent to client',
      metadata: {
        reminderSent: true,
        reminderViewed: false,
        emailSent: true
      }
    },
    {
      id: 'act6',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      activityType: 'request',
      performedBy: 'Sarah Johnson',
      clientId: '5',
      clientName: 'Emily Rodriguez',
      details: 'Document request sent for 3 documents: Tax Return, Form W-2, Bank Statement',
      metadata: { emailSent: true }
    },
    {
      id: 'act7',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      activityType: 'year_change',
      performedBy: 'John Smith',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      documentId: '5',
      documentName: 'Tax_Return_2021.pdf',
      documentType: 'Tax Return',
      details: 'Document year changed from 2021 to 2024',
      metadata: {
        fromYear: '2021',
        toYear: '2024'
      }
    },
    {
      id: 'act8',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      activityType: 'rename',
      performedBy: 'Sarah Johnson',
      clientId: '2',
      clientName: 'Abacus 360',
      documentId: '6',
      documentName: '1099_Misc_2024.pdf',
      documentType: '1099-MISC',
      details: 'Document renamed',
      metadata: {
        oldName: '1099_Misc.pdf',
        newName: '1099_Misc_2024.pdf'
      }
    },
    {
      id: 'act9',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      activityType: 'delete',
      performedBy: 'John Smith',
      clientId: '3',
      clientName: 'Sarah Wilson',
      documentName: 'Duplicate_W2.pdf',
      documentType: 'Form W-2',
      details: 'Document deleted - Duplicate file'
    },
    {
      id: 'act10',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      activityType: 'upload',
      performedBy: 'Michael Chen',
      clientId: '4',
      clientName: 'Michael Chen',
      documentId: '13',
      documentName: 'Form_1099_INT.pdf',
      documentType: 'Form 1099-INT',
      details: 'Document uploaded via email',
      metadata: { emailSent: false }
    },
    {
      id: 'act11',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      activityType: 'reject',
      performedBy: 'Sarah Johnson',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      documentName: 'Invoice_Q4.pdf',
      documentType: 'Invoice',
      details: 'Document rejected - Incomplete information',
      metadata: {
        rejectionReason: 'Invoice is missing vendor details. Please upload complete invoice.',
        emailSent: true
      }
    },
    {
      id: 'act12',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      activityType: 'note',
      performedBy: 'John Smith',
      clientId: '2',
      clientName: 'Abacus 360',
      documentId: '7',
      documentName: 'Tax_Return_2022.pdf',
      documentType: 'Tax Return',
      details: 'Note added: "Need to verify depreciation schedule before filing"'
    },
  ]);

  // Filter documents by selected clients
  const filteredDocuments = useMemo(() => {
    if (selectedClientIds.length === 0) return [];
    
    let filtered = documents.filter(doc => {
      // Check if document belongs to selected client
      if (selectedClientIds.includes(doc.clientId)) return true;
      
      // If showing linked accounts, check if document belongs to a linked account
      if (showLinkedAccounts) {
        const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
        if (selectedClient?.linkedAccounts?.includes(doc.clientId)) return true;
      }
      
      return false;
    });

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mark old years
    filtered = filtered.map(doc => ({
      ...doc,
      hasOldYear: isOldYear(doc.year),
    }));

    return filtered;
  }, [selectedClientIds, documents, showLinkedAccounts, searchQuery, clients]);

  // Account grouping for split view
  type AccountGroup = {
    accountId: string;
    accountName: string;
    documents: Document[];
    clientType: 'Individual' | 'Business';
  };

  const accountGroups = useMemo(() => {
    const accountMap = new Map<string, AccountGroup>();
    
    filteredDocuments.forEach(doc => {
      if (!accountMap.has(doc.clientId)) {
        const client = clients.find(c => c.id === doc.clientId);
        accountMap.set(doc.clientId, {
          accountId: doc.clientId,
          accountName: doc.clientName,
          documents: [],
          clientType: client?.type || doc.clientType || 'Individual'
        });
      }
      accountMap.get(doc.clientId)!.documents.push(doc);
    });
    
    return Array.from(accountMap.values());
  }, [filteredDocuments, clients]);

  // Check if there are any Individual (spouse-linked) accounts
  const hasIndividualAccounts = useMemo(() => {
    return accountGroups.some(group => group.clientType === 'Individual');
  }, [accountGroups]);

  // Effect: Switch to File Manager tab when Firm is selected
  useEffect(() => {
    const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
    if (selectedClient?.isFirm) {
      // For Firm, default to File Manager tab
      setActiveTab('filemanager');
    } else if (selectedClientIds.length > 0 && activeTab === 'filemanager') {
      // When switching from Firm to regular client, go back to Documents tab
      setActiveTab('documents');
    }
  }, [selectedClientIds, clients]);

  // Effect: Auto-switch to Table View if in Split View but no Individual accounts
  useEffect(() => {
    if (viewMode === 'split' && !hasIndividualAccounts && accountGroups.length > 1) {
      setViewMode('table');
      toast.info('Split View is only available for spouse-linked accounts');
    }
  }, [viewMode, hasIndividualAccounts, accountGroups.length]);

  // Filter clients
  const filteredClients = useMemo(() => {
    let filtered = clients;
    
    // Apply new filter
    if (clientNewFilter === 'new') {
      filtered = filtered.filter(client => client.newDocumentCount > 0);
    }
    
    // Apply type filter
    if (clientTypeFilter !== 'all') {
      filtered = filtered.filter(client => client.type === clientTypeFilter);
    }
    
    // Apply search query
    if (clientSearchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
      );
    }
    
    // Sort by recent or name
    filtered = [...filtered].sort((a, b) => {
      if (clientSortBy === 'recent') {
        return new Date(b.mostRecentDate).getTime() - new Date(a.mostRecentDate).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  }, [clients, clientSearchQuery, clientTypeFilter, clientSortBy, clientNewFilter]);

  // Calculate stats for dashboard
  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const needsReview = documents.filter(d => d.status === 'pending').length;
    const requestedPending = documents.filter(d => d.status === 'requested').length;
    const oldYearCount = documents.filter(d => isOldYear(d.year)).length;
    
    return {
      totalDocuments,
      needsReview,
      requestedPending,
      oldYearCount,
    };
  }, [documents]);

  // Calculate stats for selected client's documents
  const clientStats = useMemo(() => {
    const receivedDocs = filteredDocuments.filter(d => d.status === 'approved');
    const pendingDocs = filteredDocuments.filter(d => d.status === 'requested');
    const needReviewDocs = filteredDocuments.filter(d => d.status === 'pending');
    
    return {
      received: receivedDocs.length,
      pending: pendingDocs.length,
      needReview: needReviewDocs.length,
    };
  }, [filteredDocuments]);

  // Filter documents by status for client view
  const clientFilteredDocs = useMemo(() => {
    let filtered = filteredDocuments;

    // Apply status filter
    if (statusFilter === 'received') {
      filtered = filtered.filter(d => d.status === 'approved');
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(d => d.status === 'requested');
    } else if (statusFilter === 'reviewing') {
      filtered = filtered.filter(d => d.status === 'pending');
    }

    // Apply year filter
    if (selectedYear !== 'all') {
      // For "Need Review" status, show all unreviewed regardless of year
      if (statusFilter === 'reviewing') {
        // Show all documents needing review
        filtered = filtered.filter(d => d.status === 'pending');
      } else if (statusFilter === 'all') {
        // Show unreviewed from all years + documents from selected year
        const unreviewedDocs = filteredDocuments.filter(d => d.reviewedDate === null);
        const selectedYearDocs = filteredDocuments.filter(d => d.year === selectedYear);
        const otherYearUnreviewed = unreviewedDocs.filter(d => d.year !== selectedYear);
        filtered = [...new Set([...selectedYearDocs, ...otherYearUnreviewed])];
      } else {
        // Normal year filtering for other statuses
        filtered = filtered.filter(d => d.year === selectedYear);
      }
    }

    return filtered;
  }, [filteredDocuments, statusFilter, selectedYear]);

  // Filter activity log entries
  const filteredActivityLog = useMemo(() => {
    if (selectedClientIds.length === 0) return [];
    
    let filtered = activityLog.filter(activity => {
      // Filter by selected clients
      if (!selectedClientIds.includes(activity.clientId)) return false;
      
      // Filter by date range
      const cutoffDate = new Date(Date.now() - activityLogDays * 24 * 60 * 60 * 1000);
      if (activity.timestamp < cutoffDate) return false;
      
      // Filter by activity type
      if (activityTypeFilter !== 'all' && activity.activityType !== activityTypeFilter) {
        return false;
      }
      
      // Filter by user
      if (activityUserFilter !== 'all' && activity.performedBy !== activityUserFilter) {
        return false;
      }
      
      // Filter by search query
      if (activitySearchQuery) {
        const query = activitySearchQuery.toLowerCase();
        const matchesSearch = 
          activity.details.toLowerCase().includes(query) ||
          activity.clientName.toLowerCase().includes(query) ||
          (activity.documentName && activity.documentName.toLowerCase().includes(query)) ||
          (activity.documentType && activity.documentType.toLowerCase().includes(query)) ||
          activity.performedBy.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
    
    // Sort by timestamp (most recent first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activityLog, selectedClientIds, activityLogDays, activityTypeFilter, activityUserFilter, activitySearchQuery]);

  // Get unique users from activity log for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(activityLog.map(a => a.performedBy));
    return Array.from(users).sort();
  }, [activityLog]);

  // Get all accounts to show in switcher (current + linked accounts)
  // This must be before any early returns to follow Rules of Hooks
  const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
  
  // Find the primary client (the one that has linkedAccounts defined)
  // This ensures we maintain the original order regardless of which account is selected
  const primaryClient = useMemo(() => {
    if (!selectedClient) return null;
    
    // If current client has linked accounts, it's the primary
    if (selectedClient.linkedAccounts && selectedClient.linkedAccounts.length > 0) {
      return selectedClient;
    }
    
    // Otherwise, find the client that has this one in its linked accounts
    return clients.find(c => 
      c.linkedAccounts && c.linkedAccounts.includes(selectedClient.id)
    ) || selectedClient;
  }, [selectedClient, clients]);
  
  const hasLinkedAccounts = primaryClient?.linkedAccounts && primaryClient.linkedAccounts.length > 0;
  
  const accountsToShow = useMemo(() => {
    if (!primaryClient || !hasLinkedAccounts) return [];
    
    // Maintain original order: primary client first, then its linked accounts in their original order
    const allLinkedAccountIds = [
      primaryClient.id, // Primary account
      ...(primaryClient.linkedAccounts || []) // Linked accounts in original order
    ];
    
    // Get account details and filter out invalid IDs
    return allLinkedAccountIds
      .map(id => clients.find(c => c.id === id))
      .filter(Boolean) as ClientSummary[];
  }, [primaryClient, hasLinkedAccounts, clients]);

  // Handle account switching
  const handleAccountSwitch = (accountId: string) => {
    // Update selectedClientIds to contain only the selected account ID
    setSelectedClientIds([accountId]);
    // Reset showLinkedAccounts since we're switching, not showing combined view
    setShowLinkedAccounts(false);
    // Optionally reset search query for fresh view
    setSearchQuery('');
  };

  // Handle "All Accounts" selection - shows all linked accounts combined
  const handleAllAccounts = () => {
    // Keep the current account selected
    if (selectedClient) {
      setSelectedClientIds([selectedClient.id]);
    }
    // Enable linked accounts view to show combined documents
    setShowLinkedAccounts(true);
    // Optionally reset search query for fresh view
    setSearchQuery('');
  };

  // Check if there are old year documents in filtered list
  const hasOldYearDocuments = filteredDocuments.some(doc => doc.hasOldYear);

  // Toggle document selection
  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedDocuments.length === clientFilteredDocs.length && clientFilteredDocs.length > 0) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(clientFilteredDocs.map(d => d.id));
    }
  };

  // Get method badge
  const getMethodBadge = (method: DocumentMethod | null) => {
    if (!method) return null;
    
    const methodConfig = {
      'Uploaded File': { icon: Upload, color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
      'Email': { icon: Mail, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
      'Text Message': { icon: MessageSquare, color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300' },
    };

    const config = methodConfig[method];
    const Icon = config.icon;

    return (
      <Badge className={cn("text-xs", config.color)}>
        <Icon className="w-3 h-3 mr-1" />
        {method}
      </Badge>
    );
  };

  // Format date/time
  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return null;
    
    const date = new Date(dateTimeStr);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    return { date: dateStr, time: timeStr };
  };

  // Handle approve
  const handleApprove = (docId: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'approved' as DocumentStatus, reviewedDate: new Date().toISOString(), reviewedBy: 'Current User' }
          : doc
      )
    );
    toast.success('Document approved');
  };

  // Handle reject
  const handleReject = (docId: string, reason: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'rejected' as DocumentStatus, rejectionReason: reason, reviewedDate: new Date().toISOString(), reviewedBy: 'Current User' }
          : doc
      )
    );
    toast.success('Document rejected and client notified');
  };

  // Handle move document
  const handleMoveDocument = (docId: string, newClientId: string) => {
    const newClient = clients.find(c => c.id === newClientId);
    if (!newClient) return;
    
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, clientId: newClientId, clientName: newClient.name, clientType: newClient.type }
          : doc
      )
    );
    toast.success(`Document moved to ${newClient.name}`);
  };

  // Handle bulk approve
  const handleBulkApprove = () => {
    const docsToApprove = selectedDocuments.filter(docId => {
      const doc = documents.find(d => d.id === docId);
      return doc && doc.status !== 'requested'; // Skip requested documents
    });
    
    setDocuments(docs =>
      docs.map(doc =>
        docsToApprove.includes(doc.id)
          ? { ...doc, status: 'approved' as DocumentStatus, reviewedDate: new Date().toISOString(), reviewedBy: 'Current User' }
          : doc
      )
    );
    
    const skipped = selectedDocuments.length - docsToApprove.length;
    if (skipped > 0) {
      toast.success(`Approved ${docsToApprove.length} document${docsToApprove.length > 1 ? 's' : ''} (${skipped} requested document${skipped > 1 ? 's' : ''} skipped)`);
    } else {
      toast.success(`Approved ${docsToApprove.length} document${docsToApprove.length > 1 ? 's' : ''}`);
    }
    // Keep documents selected for smooth, non-jarring experience
  };

  // Handle bulk move to user
  const handleBulkMoveToUser = (targetClientId: string, targetClientName: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        selectedDocuments.includes(doc.id)
          ? { 
              ...doc, 
              clientId: targetClientId, 
              clientName: targetClientName,
              clientType: clients.find(c => c.id === targetClientId)?.type || doc.clientType
            }
          : doc
      )
    );
    toast.success(`Moved ${selectedDocuments.length} document${selectedDocuments.length > 1 ? 's' : ''} to ${targetClientName}`);
    setSelectedDocuments([]);
  };

  // Handle bulk change year
  const handleBulkChangeYear = (year: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        selectedDocuments.includes(doc.id)
          ? { ...doc, year }
          : doc
      )
    );
    setSelectedDocuments([]);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setDocuments(docs => docs.filter(doc => !selectedDocuments.includes(doc.id)));
    setSelectedDocuments([]);
  };

  // Tax categories for organizing documents
  const TAX_CATEGORIES = [
    { id: 'income', name: 'Income', order: 1 },
    { id: 'deductions', name: 'Deductions', order: 2 },
    { id: 'credits', name: 'Credits', order: 3 },
    { id: 'investments', name: 'Investments', order: 4 },
    { id: 'business', name: 'Business Expenses', order: 5 },
    { id: 'property', name: 'Property & Assets', order: 6 },
    { id: 'healthcare', name: 'Healthcare', order: 7 },
    { id: 'other', name: 'Other', order: 8 },
  ];

  // Categorize documents based on document type
  const categorizeDocument = (doc: Document): string => {
    const type = doc.documentType.toLowerCase();
    if (type.includes('w2') || type.includes('1099') || type.includes('w-2')) return 'income';
    if (type.includes('donation') || type.includes('mortgage') || type.includes('property tax')) return 'deductions';
    if (type.includes('investment') || type.includes('stock')) return 'investments';
    if (type.includes('invoice') || type.includes('receipt') && doc.clientType === 'Business') return 'business';
    if (type.includes('property')) return 'property';
    return 'other';
  };

  // Group documents by category when in organize view
  const organizedDocuments = showOrganizeView
    ? TAX_CATEGORIES.map(category => ({
        category,
        documents: clientFilteredDocs.filter(doc => categorizeDocument(doc) === category.id),
      })).filter(group => group.documents.length > 0)
    : [];

  // Handle upload
  const handleUpload = (files: File[]) => {
    // Here you would handle the actual file upload
    console.log('Uploading files:', files);
    // Add the documents to the state
    // toast already shown in dialog
  };

  // Handle download
  const handleDownload = () => {
    if (selectedDocuments.length === 0) {
      toast.error('No documents selected');
      return;
    }
    
    const docs = selectedDocuments.map(id => documents.find(d => d.id === id)).filter(Boolean);
    toast.success(`Downloading ${docs.length} document${docs.length > 1 ? 's' : ''}...`);
    // Here you would handle the actual download
  };

  // Handle download all
  const handleDownloadAll = () => {
    if (filteredDocuments.length === 0) {
      toast.error('No documents available to download');
      return;
    }
    
    toast.success(`Downloading all ${filteredDocuments.length} document${filteredDocuments.length > 1 ? 's' : ''}...`);
    // Here you would handle the actual download of all documents
  };

  // Format activity timestamp for display
  const formatActivityTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Get activity type display info
  const getActivityTypeInfo = (type: ActivityType): { icon: React.ReactNode; label: string; color: string } => {
    switch (type) {
      case 'upload':
        return { icon: <Upload className="w-4 h-4" />, label: 'Upload', color: 'text-blue-600 dark:text-blue-400' };
      case 'approve':
        return { icon: <Check className="w-4 h-4" />, label: 'Approved', color: 'text-green-600 dark:text-green-400' };
      case 'reject':
        return { icon: <X className="w-4 h-4" />, label: 'Rejected', color: 'text-red-600 dark:text-red-400' };
      case 'move':
        return { icon: <MoveRight className="w-4 h-4" />, label: 'Moved', color: 'text-purple-600 dark:text-purple-400' };
      case 'delete':
        return { icon: <Trash2 className="w-4 h-4" />, label: 'Deleted', color: 'text-red-600 dark:text-red-400' };
      case 'rename':
        return { icon: <Edit className="w-4 h-4" />, label: 'Renamed', color: 'text-gray-600 dark:text-gray-400' };
      case 'request':
        return { icon: <Mail className="w-4 h-4" />, label: 'Request Sent', color: 'text-orange-600 dark:text-orange-400' };
      case 'reminder':
        return { icon: <Bell className="w-4 h-4" />, label: 'Reminder', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'view':
        return { icon: <Eye className="w-4 h-4" />, label: 'Viewed', color: 'text-gray-600 dark:text-gray-400' };
      case 'note':
        return { icon: <StickyNote className="w-4 h-4" />, label: 'Note Added', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'type_change':
        return { icon: <FileEdit className="w-4 h-4" />, label: 'Type Changed', color: 'text-gray-600 dark:text-gray-400' };
      case 'year_change':
        return { icon: <Calendar className="w-4 h-4" />, label: 'Year Changed', color: 'text-gray-600 dark:text-gray-400' };
      default:
        return { icon: <FileText className="w-4 h-4" />, label: 'Activity', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  // Export activity log to CSV
  const exportActivityLogCSV = () => {
    if (filteredActivityLog.length === 0) {
      toast.error('No activities to export');
      return;
    }

    const headers = ['Timestamp', 'Activity Type', 'Performed By', 'Client', 'Document', 'Document Type', 'Details'];
    const rows = filteredActivityLog.map(activity => [
      activity.timestamp.toLocaleString('en-US'),
      getActivityTypeInfo(activity.activityType).label,
      activity.performedBy,
      activity.clientName,
      activity.documentName || '-',
      activity.documentType || '-',
      activity.details
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredActivityLog.length} activities to CSV`);
  };

  // Export activity log to PDF
  const exportActivityLogPDF = () => {
    if (filteredActivityLog.length === 0) {
      toast.error('No activities to export');
      return;
    }

    toast.success('PDF export functionality will generate a formatted activity log report');
    // In a real implementation, you would use a library like jsPDF or generate server-side
  };

  // Handle request documents
  const handleRequestDocuments = (requests: any[], clients: any[], emailBody: string, sendEmail: boolean) => {
    // Create requested status documents for each client
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const requestedDate = `${formattedDate} ${formattedTime}`;
    
    const newDocuments: Document[] = [];
    
    clients.forEach(client => {
      requests.forEach(request => {
        const newDoc: Document = {
          id: `req-${Date.now()}-${Math.random()}`,
          name: `${request.documentType} - ${client.name}`,
          clientName: client.name,
          clientId: client.id,
          clientType: client.type,
          documentType: request.documentType,
          year: selectedYear,
          receivedDate: null,
          reviewedDate: null,
          reviewedBy: null,
          status: 'requested',
          requestedDate: requestedDate,
          method: null,
          thumbnail: '📄',
        };
        newDocuments.push(newDoc);
      });
    });
    
    setDocuments(prev => [...newDocuments, ...prev]);
    
    if (sendEmail) {
      console.log('Sending email with body:', emailBody);
      // Here you would send the actual email
    }
  };



  // Stats Dashboard (when no client selected)
  if (selectedClientIds.length === 0) {
    return (
      <div className="flex h-full min-h-0">
        {/* Left Column - Client List */}
        <div className={cn(
          "border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0 bg-white dark:bg-gray-900 transition-all duration-300",
          clientListCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Clients</h2>
            </div>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setClientTypeFilter('all')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  clientTypeFilter === 'all'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                All
              </button>
              <button
                onClick={() => setClientTypeFilter('Individual')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  clientTypeFilter === 'Individual'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <User className="w-3 h-3" />
                Individual
              </button>
              <button
                onClick={() => setClientTypeFilter('Business')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  clientTypeFilter === 'Business'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Building2 className="w-3 h-3" />
                Business
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-2 pt-2">
              {/* All/New, Select All and Sort Toggle */}
              <div className="flex items-center justify-between mb-2 px-1">
                {/* All/New Navigation */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setClientNewFilter('all')}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      clientNewFilter === 'all'
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setClientNewFilter('new')}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      clientNewFilter === 'new'
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    New
                  </button>
                  <button
                    onClick={() => {
                      if (selectedClientIds.length === filteredClients.length) {
                        setSelectedClientIds([]);
                      } else {
                        setSelectedClientIds(filteredClients.map(c => c.id));
                      }
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      selectedClientIds.length === filteredClients.length && filteredClients.length > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {selectedClientIds.length === filteredClients.length && filteredClients.length > 0 ? (
                      <>
                        <Check className="w-3 h-3 inline mr-1" />
                        Selected
                      </>
                    ) : (
                      'Select All'
                    )}
                  </button>
                </div>
                
                {/* Sort Toggle */}
                <button
                  onClick={() => setClientSortBy(clientSortBy === 'recent' ? 'name' : 'recent')}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Sort: {clientSortBy === 'recent' ? 'Recent' : 'Name'}
                </button>
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              {filteredClients.map((client) => {
                const clientDate = new Date(client.mostRecentDate);
                const formattedDate = clientDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                
                // Special styling for Firm entry
                if (client.isFirm) {
                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientIds([client.id])}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all border",
                        "bg-gray-50 dark:bg-gray-800/50",
                        "border-gray-200 dark:border-gray-700",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-start gap-2.5 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {client.name}
                              </span>
                              <Badge className="bg-gray-600 dark:bg-gray-500 text-white text-[10px] h-4 px-1.5">
                                INTERNAL
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Shared & private document storage
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientIds([client.id])}
                    className={cn(
                      "w-full text-left p-2.5 pr-3 rounded-lg transition-all",
                      "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30",
                      "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    )}
                  >
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0 max-w-[165px]">
                        {client.type === 'Business' ? (
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="font-medium text-sm text-gray-900 dark:text-white break-words line-clamp-2 leading-tight">
                          {client.name}
                        </span>
                      </div>
                      {client.newDocumentCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs h-5 px-1.5 flex-shrink-0">
                          {client.newDocumentCount} new
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{client.documentCount} document{client.documentCount !== 1 ? 's' : ''}</span>
                      <span className="flex-shrink-0 ml-2">{formattedDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Area - Empty State */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="p-6 flex items-center gap-4">
                <button
                  onClick={() => setClientListCollapsed(!clientListCollapsed)}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={clientListCollapsed ? "Show client list" : "Hide client list"}
                >
                  {clientListCollapsed ? (
                    <PanelLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Document Center</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage documents, file uploads, and client submissions
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Total Documents */}
                  <Card className="border-l-4 border-l-blue-500">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalDocuments}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents</div>
                    </div>
                  </Card>

                  {/* Needs Review */}
                  <Card className="border-l-4 border-l-orange-500">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-8 h-8 text-orange-500" />
                        {stats.needsReview > 0 && (
                          <Badge variant="destructive" className="text-xs">{stats.needsReview}</Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.needsReview}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Needs Review</div>
                    </div>
                  </Card>

                  {/* Requested Pending */}
                  <Card className="border-l-4 border-l-purple-500">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <FileQuestion className="w-8 h-8 text-purple-500" />
                        {stats.requestedPending > 0 && (
                          <Badge className="bg-purple-500 text-xs">{stats.requestedPending}</Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.requestedPending}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Requested Pending</div>
                    </div>
                  </Card>

                  {/* Old Year Documents */}
                  <Card className="border-l-4 border-l-amber-500">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                        {stats.oldYearCount > 0 && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">Alert</Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.oldYearCount}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Documents from 2+ Years Ago</div>
                    </div>
                  </Card>
                </div>

                {/* Instructions */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Folder className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Get Started</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Select a client from the left sidebar to view their documents, manage file uploads, and track document requests.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Review and approve incoming documents</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Request specific documents from clients</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Upload files for clients to download</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Track document checklists and history</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Desktop Tools Download Section */}
                <Card className="mt-6 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Desktop Tools</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Download Windows applications to enhance your workflow
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Sync App */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">Sync App</h4>
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                                Windows
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Sync documents from your desktop or backup directly to the Document Center
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Auto-sync • Desktop backup • Batch upload</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0"
                            onClick={() => {
                              toast.success('Downloading Sync App installer...');
                            }}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      </div>

                      {/* Print Driver */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">Print Driver</h4>
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                                Windows
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Upload files directly from tax software to the File Manager using print-to-file
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Tax software integration • Direct upload • No scanning</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0"
                            onClick={() => {
                              toast.success('Downloading Print Driver installer...');
                            }}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <strong>Windows Only:</strong> These applications require Windows 10 or later. Mac users can upload documents directly through the web interface.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main view with client selected

  return (
    <div className="flex h-full min-h-0">
      {/* Left Column - Client List */}
      <div className={cn(
        "border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0 bg-white dark:bg-gray-900 transition-all duration-300",
        clientListCollapsed ? "w-0 overflow-hidden" : "w-80"
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Clients</h2>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={clientSearchQuery}
              onChange={(e) => setClientSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setClientTypeFilter('all')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                clientTypeFilter === 'all'
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setClientTypeFilter('Individual')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                clientTypeFilter === 'Individual'
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <User className="w-3 h-3" />
              Individual
            </button>
            <button
              onClick={() => setClientTypeFilter('Business')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                clientTypeFilter === 'Business'
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <Building2 className="w-3 h-3" />
              Business
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pt-2">
            {/* All/New and Sort Toggle */}
            <div className="flex items-center justify-between mb-2 px-1">
              {/* All/New Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={() => setClientNewFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    clientNewFilter === 'all'
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setClientNewFilter('new')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    clientNewFilter === 'new'
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  New
                </button>
              </div>
              
              {/* Sort Toggle */}
              <button
                onClick={() => setClientSortBy(clientSortBy === 'recent' ? 'name' : 'recent')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Sort: {clientSortBy === 'recent' ? 'Recent' : 'Name'}
              </button>
            </div>
          </div>
          
          <div className="p-2 space-y-1">
            {filteredClients.map((client) => {
              const clientDate = new Date(client.mostRecentDate);
              const formattedDate = clientDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
              
              // Special styling for Firm entry
              if (client.isFirm) {
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientIds([client.id])}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all border",
                      selectedClientIds.includes(client.id)
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-start gap-2.5 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                              {client.name}
                            </span>
                            <Badge className="bg-gray-600 dark:bg-gray-500 text-white text-[10px] h-4 px-1.5">
                              INTERNAL
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Shared & private document storage
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }
              
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientIds([client.id])}
                  className={cn(
                    "w-full text-left p-2.5 pr-3 rounded-lg transition-all",
                    selectedClientIds.includes(client.id)
                      ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700"
                      : "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30",
                    "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  )}
                >
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0 max-w-[165px]">
                      {client.type === 'Business' ? (
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="font-medium text-sm text-gray-900 dark:text-white break-words line-clamp-2 leading-tight">
                        {client.name}
                      </span>
                    </div>
                    {client.newDocumentCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs h-5 px-1.5 flex-shrink-0">
                        {client.newDocumentCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{client.documentCount} document{client.documentCount !== 1 ? 's' : ''}</span>
                    <span className="flex-shrink-0 ml-2">{formattedDate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right Area - Tabs and Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with Tabs */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setClientListCollapsed(!clientListCollapsed)}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={clientListCollapsed ? "Show client list" : "Hide client list"}
                >
                  {clientListCollapsed ? (
                    <PanelLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedClient?.name}
                    </h1>
                    {hasLinkedAccounts && (
                      <button
                        onClick={() => setShowLinkedAccounts(!showLinkedAccounts)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                          showLinkedAccounts
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Linked Accounts
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedClient?.type} • {filteredDocuments.length} documents
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {/* Show Documents tab only for regular clients */}
              {!selectedClient?.isFirm && (
                <button
                  onClick={() => setActiveTab('documents')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === 'documents'
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab('filemanager')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === 'filemanager'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  File Manager
                </div>
              </button>
              {/* Show Checklist tab only for regular clients */}
              {!selectedClient?.isFirm && (
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === 'checklist'
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Document Checklist
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab('activitylog')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === 'activitylog'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity Log
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {showRequestDocumentsWorkflow ? (
            <RequestDocumentsWorkflow
              clients={clients.filter(c => selectedClientIds.includes(c.id))}
              onClose={() => setShowRequestDocumentsWorkflow(false)}
              onSend={handleRequestDocuments}
            />
          ) : activeTab === 'documents' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-6 space-y-6 flex-1 overflow-x-auto overflow-y-auto">
                {/* Stats Cards - Clickable Filters */}
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className={cn(
                      "border-gray-200/60 cursor-pointer transition-all hover:shadow-lg",
                      statusFilter === 'received' && "ring-2 ring-green-500 shadow-lg"
                    )}
                    onClick={() => setStatusFilter(statusFilter === 'received' ? 'all' : 'received')}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Received</p>
                          <p className="text-2xl font-semibold text-green-600 mt-1">{clientStats.received}</p>
                          <p className="text-xs text-gray-400 mt-1">Reviewed & filed</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "border-gray-200/60 cursor-pointer transition-all hover:shadow-lg",
                      statusFilter === 'pending' && "ring-2 ring-orange-500 shadow-lg"
                    )}
                    onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
                          <p className="text-2xl font-semibold text-orange-600 mt-1">{clientStats.pending}</p>
                          <p className="text-xs text-gray-400 mt-1">Awaiting upload</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={cn(
                      "border-gray-200/60 cursor-pointer transition-all hover:shadow-lg",
                      statusFilter === 'reviewing' && "ring-2 ring-blue-500 shadow-lg"
                    )}
                    onClick={() => setStatusFilter(statusFilter === 'reviewing' ? 'all' : 'reviewing')}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Need Review</p>
                          <p className="text-2xl font-semibold text-blue-600 mt-1">{clientStats.needReview}</p>
                          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filters Bar */}
                <div className="flex items-center justify-between gap-4">
                  {/* Filters - Left Side */}
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    {/* Year Filter - Quick Access */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Year:</span>
                      <button
                        onClick={() => setSelectedYear('2024')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2024'
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        2024
                      </button>
                      <button
                        onClick={() => setSelectedYear('2023')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2023'
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        2023
                      </button>
                      <button
                        onClick={() => setSelectedYear('2022')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2022'
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        2022
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedYear('all')}>
                            All Years
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedYear('2021')}>
                            2021
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedYear('2020')}>
                            2020
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedYear('2019')}>
                            2019
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Quick Filter - Status Buttons */}
                    <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Status:</span>
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          statusFilter === 'all'
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                      >
                        All Documents
                      </button>
                      <button
                        onClick={() => setStatusFilter('reviewing')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                          statusFilter === 'reviewing'
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        )}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Needs Review ({clientStats.needReview})
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                          statusFilter === 'pending'
                            ? "bg-orange-600 text-white shadow-sm"
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
                        )}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Requested ({clientStats.pending})
                      </button>
                      <button
                        onClick={() => setStatusFilter('received')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                          statusFilter === 'received'
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                        )}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved ({clientStats.received})
                      </button>
                    </div>
                  </div>

                  {/* Search - Right Side */}
                  <div className="relative w-64 flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 h-8 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
                  {/* Left Side - Linked Accounts Dropdown */}
                  {hasLinkedAccounts && accountsToShow.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="default"
                          className="gap-2 font-semibold border-2 border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 shadow-sm"
                        >
                          <Users className="w-4 h-4" />
                          Linked Accounts
                          {!showLinkedAccounts && selectedClientIds.length === 1 && selectedClientIds[0] !== primaryClient?.id && (
                            <Badge variant="secondary" className="ml-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                              1
                            </Badge>
                          )}
                          {showLinkedAccounts && accountsToShow.length > 1 && (
                            <Badge variant="secondary" className="ml-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                              {accountsToShow.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuLabel>Select Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* All Accounts Option */}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => {
                            handleAllAccounts();
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Checkbox
                              checked={showLinkedAccounts}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="flex-1">All Accounts</span>
                            {showLinkedAccounts && (
                              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                        </DropdownMenuItem>
                        {/* Individual Accounts */}
                        {accountsToShow.map(account => {
                          const isActive = selectedClientIds.includes(account.id) && !showLinkedAccounts;
                          return (
                            <DropdownMenuItem
                              key={account.id}
                              className="cursor-pointer"
                              onSelect={() => {
                                handleAccountSwitch(account.id);
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <Checkbox
                                  checked={isActive}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                />
                                {account.type === 'Business' ? (
                                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">{account.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{account.type}</div>
                                </div>
                                {isActive && (
                                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Right Side - Action Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button 
                      variant={showOrganizeView ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOrganizeView(!showOrganizeView)}
                      className={showOrganizeView ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      {showOrganizeView ? 'Show All Documents' : 'Organize documents'}
                    </Button>

                    <DropdownMenu>
                      <div className="flex">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={selectedDocuments.length === 0}
                          onClick={handleDownload}
                          className="rounded-r-none border-r-0"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download {selectedDocuments.length > 0 ? `(${selectedDocuments.length})` : ''}
                        </Button>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={filteredDocuments.length === 0}
                            className="rounded-l-none px-2"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </div>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={handleDownloadAll}
                          disabled={filteredDocuments.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All ({filteredDocuments.length} documents)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      size="sm"
                      className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      onClick={() => setShowUploadDialog(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>

                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
                      onClick={() => setShowRequestDocumentsWorkflow(true)}
                      disabled={selectedClientIds.length === 0}
                    >
                      <FileQuestion className="w-4 h-4 mr-2" />
                      Request Documents
                    </Button>
                  </div>
                </div>

                {/* View Toggle Row - Only show if multiple accounts and Individual accounts exist */}
                {accountGroups.length > 1 && hasIndividualAccounts && (
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                      <Button
                        size="sm"
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        className={cn(
                          "gap-1.5 h-7 px-3 text-xs",
                          viewMode === 'table' 
                            ? "text-white" 
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                        style={viewMode === 'table' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        onClick={() => setViewMode('table')}
                      >
                        <List className="w-3.5 h-3.5" />
                        Table View
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'split' ? 'default' : 'ghost'}
                        className={cn(
                          "gap-1.5 h-7 px-3 text-xs",
                          viewMode === 'split'
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                        style={viewMode === 'split' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        onClick={() => setViewMode('split')}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Split View
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Bar - Shows when documents selected */}
                {selectedDocuments.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600 text-white">
                        {selectedDocuments.length} Selected
                      </Badge>
                      <span className="text-sm text-purple-900">Bulk Actions:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-300"
                        onClick={handleBulkApprove}
                        disabled={selectedDocuments.every(docId => {
                          const doc = documents.find(d => d.id === docId);
                          return !doc || doc.status === 'approved' || doc.status === 'requested';
                        })}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-300"
                        onClick={() => setShowMoveToUserDialog(true)}
                      >
                        <MoveRight className="w-4 h-4 mr-2" />
                        Move to User
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-300"
                        onClick={() => {
                          // Open folder selection dialog
                          toast.info('Move to Folder functionality - select destination folder');
                        }}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Move to Folder
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-300"
                        onClick={() => setShowChangeYearDialog(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Change Year
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedDocuments([])}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Info Banner for Different Year Documents */}
                {selectedYear !== 'all' && clientFilteredDocs.some(d => d.year !== selectedYear && d.reviewedDate === null) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Showing unreviewed documents from other years
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Documents with year badges need review even though they're from a different tax year than currently selected ({selectedYear}).
                      </p>
                    </div>
                  </div>
                )}

                {/* Documents Table - Table View or Split View */}
                {viewMode === 'table' ? (
                  <Card className="border-gray-200/60">
                    <div className="overflow-x-auto">
                      {(() => {
                        // Determine if client column should be shown (when viewing multiple clients or a single linked account is selected)
                        const isSingleLinkedAccountSelected = selectedClientIds.length === 1 && primaryClient && selectedClientIds[0] !== primaryClient.id && !showLinkedAccounts;
                        const showClientColumn = showLinkedAccounts || accountGroups.length > 1 || isSingleLinkedAccountSelected;
                        const columnCount = showClientColumn ? 9 : 8;
                        
                        return (
                      <table className="w-full min-w-[1400px]">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left w-12">
                              <Checkbox 
                                checked={selectedDocuments.length === clientFilteredDocs.length && clientFilteredDocs.length > 0}
                                onCheckedChange={toggleSelectAll}
                              />
                            </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
                          </th>
                          {showClientColumn && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                          )}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Received
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reviewed
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {showOrganizeView ? (
                          // Organized view with category headers - ORGANIZED_VIEW_START
                          organizedDocuments.flatMap((group) => [
                            // Category Header Row
            <tr key={`category-${group.category.id}`} className="bg-gray-100 dark:bg-gray-800">
                              <td colSpan={columnCount} className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1 w-1 rounded-full bg-purple-600"></div>
                                  <span className="font-semibold text-gray-900 dark:text-white uppercase tracking-wide text-xs">
                                    {group.category.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({group.documents.length} document{group.documents.length !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              </td>
                            </tr>,
                            // Documents in this category
                            ...group.documents.map((doc) => {
                          const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
                          const isUnreviewed = doc.reviewedDate === null;
                          const isRequested = doc.status === 'requested';
                          const shouldGrayOut = isRequested && statusFilter !== 'pending'; // Only gray out if NOT filtering by requested
                          const latestReminder = getLatestReminder(doc);
                          
                          // Check if document belongs to a linked spouse account
                          const isLinkedSpouseDoc = showLinkedAccounts && selectedClientIds.length > 0 && (() => {
                            const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
                            return selectedClient?.linkedAccounts?.includes(doc.clientId) ?? false;
                          })();
                          
                          return (
                          <tr 
                            key={doc.id}
                            className={cn(
                              "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group",
                              selectedDocuments.includes(doc.id) && "bg-purple-50/30 dark:bg-purple-900/10",
                              isLinkedSpouseDoc && "bg-blue-50/30 dark:bg-blue-900/10",
                              isDifferentYear && isUnreviewed && "bg-amber-50/40 dark:bg-amber-900/20 border-l-4 border-amber-500"
                            )}
                          >
                            <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                              <Checkbox 
                                checked={selectedDocuments.includes(doc.id)}
                                onCheckedChange={() => toggleDocumentSelection(doc.id)}
                              />
                            </td>
                            <td className={cn("px-4 py-4 relative", shouldGrayOut && "opacity-50")}>
                              <div className="flex items-center gap-3">
                                <div className="relative group/preview">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
                                    {doc.thumbnail}
                                  </div>
                                  {/* Preview on Hover - Fixed z-index */}
                                  <div className="fixed hidden group-hover/preview:block z-[9999] pointer-events-none" style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                  }}>
                                    <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-6xl">
                                        {doc.thumbnail}
                                      </div>
                                      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {editingDocId === doc.id ? (
                                      <Input
                                        value={editingDocName}
                                        onChange={(e) => setEditingDocName(e.target.value)}
                                        onBlur={() => {
                                          if (editingDocName.trim()) {
                                            setDocuments(docs =>
                                              docs.map(d =>
                                                d.id === doc.id
                                                  ? { ...d, name: editingDocName }
                                                  : d
                                              )
                                            );
                                            toast.success('Document renamed');
                                          }
                                          setEditingDocId(null);
                                          setEditingDocName('');
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                          } else if (e.key === 'Escape') {
                                            setEditingDocId(null);
                                            setEditingDocName('');
                                          }
                                        }}
                                        className="h-7 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingDocId(doc.id);
                                          setEditingDocName(doc.name);
                                        }}
                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                                        title="Click to rename"
                                      >
                                        {doc.name}
                                      </button>
                                    )}
                                    {isDifferentYear && isUnreviewed && (
                                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                        {doc.year}
                                      </Badge>
                                    )}
                                    {documentNotes[doc.id] && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDoc(doc);
                                          setShowNotesDialog(true);
                                        }}
                                        className="text-purple-600 hover:text-purple-700 transition-colors"
                                        title="View notes"
                                      >
                                        <FileEdit className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {showClientColumn && (
                              <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                                <div className="flex items-center gap-2">
                                  {doc.clientType === 'Business' ? (
                                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  ) : (
                                    <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                  )}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {doc.clientName}
                                  </span>
                                </div>
                              </td>
                            )}
                            <td className="px-4 py-4">
                              <Select 
                                value={doc.documentType}
                                onValueChange={(value) => {
                                  // Handle document type change
                                  console.log('Change document type to:', value);
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="W2 Form">W2 Form</SelectItem>
                                  <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                                  <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                  <SelectItem value="Property Tax Bill">Property Tax Bill</SelectItem>
                                  <SelectItem value="Donation Receipt">Donation Receipt</SelectItem>
                                  <SelectItem value="Invoice">Invoice</SelectItem>
                                  <SelectItem value="Receipt">Receipt</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4">
                              <Select 
                                value={doc.year}
                                onValueChange={(value) => {
                                  // Handle year change
                                  console.log('Change year to:', value);
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2024">2024</SelectItem>
                                  <SelectItem value="2023">2023</SelectItem>
                                  <SelectItem value="2022">2022</SelectItem>
                                  <SelectItem value="2021">2021</SelectItem>
                                  <SelectItem value="2020">2020</SelectItem>
                                  <SelectItem value="2019">2019</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4">
                              {doc.receivedDate ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDateTime(doc.receivedDate)?.date}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(doc.receivedDate)?.time}
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  Not received
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {doc.reviewedDate && doc.reviewedBy ? (
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatDateTime(doc.reviewedDate)?.date}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
                                    </div>
                                  </div>
                                </div>
                              ) : doc.status === 'pending' ? (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                    onClick={() => handleApprove(doc.id)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedDoc(doc);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : doc.status === 'requested' ? (
                                <div className="space-y-1.5">
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Requested
                                  </Badge>
                                  {latestReminder && (
                                    <>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        {latestReminder.viewed ? (
                                          <>
                                            <Eye className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                              Viewed {formatReminderDate(latestReminder.viewedDate || latestReminder.sentDate)}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-500">
                                              Not viewed
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Sent: {formatReminderDate(latestReminder.sentDate)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                  Not reviewed
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {getMethodBadge(doc.method)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
                                {doc.status === 'requested' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                    onClick={() => handleSendReminderClick(doc)}
                                  >
                                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                                    Send Reminder
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {doc.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                          Approve Document
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedDoc(doc);
                                          setShowRejectDialog(true);
                                        }}>
                                          <X className="w-4 h-4 mr-2 text-red-600" />
                                          Reject Document
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    {doc.status === 'approved' && (
                                      <>
                                        <DropdownMenuItem onClick={() => {
                                          navigate(`/workflows/download?doc=${doc.id}`);
                                        }}>
                                          <ExternalLink className="w-4 h-4 mr-2 text-purple-600" />
                                          Test Workflow
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    <DropdownMenuItem onClick={() => {
                                      setDocumentToMove(doc);
                                      setShowMoveDialog(true);
                                    }}>
                                      <MoveRight className="w-4 h-4 mr-2" />
                                      Move to User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {}}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedDoc(doc);
                                      setShowNotesDialog(true);
                                    }}>
                                      <FileEdit className="w-4 h-4 mr-2" />
                                      {documentNotes[doc.id] ? 'Edit Notes' : 'Add Notes'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                            })
                          ])
                        ) : (
                          // Normal view without categories - FLATLIST
                          clientFilteredDocs.map((doc) => {
                          const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
                          const isUnreviewed = doc.reviewedDate === null;
                          const isRequested = doc.status === 'requested';
                          const shouldGrayOut = isRequested && statusFilter !== 'pending'; // Only gray out if NOT filtering by requested
                          const latestReminder = getLatestReminder(doc);
                          
                          // Check if document belongs to a linked spouse account
                          const isLinkedSpouseDoc = showLinkedAccounts && selectedClientIds.length > 0 && (() => {
                            const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
                            return selectedClient?.linkedAccounts?.includes(doc.clientId) ?? false;
                          })();
                          
                          return (
                          <tr 
                            key={doc.id}
                            className={cn(
                              "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group",
                              selectedDocuments.includes(doc.id) && "bg-purple-50/30 dark:bg-purple-900/10",
                              isLinkedSpouseDoc && "bg-blue-50/30 dark:bg-blue-900/10",
                              isDifferentYear && isUnreviewed && "bg-amber-50/40 dark:bg-amber-900/20 border-l-4 border-amber-500"
                            )}
                          >
                            <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                              <Checkbox 
                                checked={selectedDocuments.includes(doc.id)}
                                onCheckedChange={() => toggleDocumentSelection(doc.id)}
                              />
                            </td>
                            <td className={cn("px-4 py-4 relative", shouldGrayOut && "opacity-50")}>
                              <div className="flex items-center gap-3">
                                <div className="relative group/preview">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
                                    {doc.thumbnail}
                                  </div>
                                  {/* Preview on Hover - Fixed z-index */}
                                  <div className="fixed hidden group-hover/preview:block z-[9999] pointer-events-none" style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                  }}>
                                    <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-6xl">
                                        {doc.thumbnail}
                                      </div>
                                      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {editingDocId === doc.id ? (
                                      <Input
                                        value={editingDocName}
                                        onChange={(e) => setEditingDocName(e.target.value)}
                                        onBlur={() => {
                                          if (editingDocName.trim()) {
                                            setDocuments(docs =>
                                              docs.map(d =>
                                                d.id === doc.id
                                                  ? { ...d, name: editingDocName }
                                                  : d
                                              )
                                            );
                                            toast.success('Document renamed');
                                          }
                                          setEditingDocId(null);
                                          setEditingDocName('');
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                          } else if (e.key === 'Escape') {
                                            setEditingDocId(null);
                                            setEditingDocName('');
                                          }
                                        }}
                                        className="h-7 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingDocId(doc.id);
                                          setEditingDocName(doc.name);
                                        }}
                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                                        title="Click to rename"
                                      >
                                        {doc.name}
                                      </button>
                                    )}
                                    {isDifferentYear && isUnreviewed && (
                                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                        {doc.year}
                                      </Badge>
                                    )}
                                    {documentNotes[doc.id] && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDoc(doc);
                                          setShowNotesDialog(true);
                                        }}
                                        className="text-purple-600 hover:text-purple-700 transition-colors"
                                        title="View notes"
                                      >
                                        <FileEdit className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {showClientColumn && (
                              <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                                <div className="flex items-center gap-2">
                                  {doc.clientType === 'Business' ? (
                                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  ) : (
                                    <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                  )}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {doc.clientName}
                                  </span>
                                </div>
                              </td>
                            )}
                            <td className="px-4 py-4">
                              <Select 
                                value={doc.documentType}
                                onValueChange={(value) => {
                                  // Handle document type change
                                  console.log('Change document type to:', value);
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="W2 Form">W2 Form</SelectItem>
                                  <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                                  <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                  <SelectItem value="Property Tax Bill">Property Tax Bill</SelectItem>
                                  <SelectItem value="Donation Receipt">Donation Receipt</SelectItem>
                                  <SelectItem value="Invoice">Invoice</SelectItem>
                                  <SelectItem value="Receipt">Receipt</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4">
                              <Select 
                                value={doc.year}
                                onValueChange={(value) => {
                                  // Handle year change
                                  console.log('Change year to:', value);
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2024">2024</SelectItem>
                                  <SelectItem value="2023">2023</SelectItem>
                                  <SelectItem value="2022">2022</SelectItem>
                                  <SelectItem value="2021">2021</SelectItem>
                                  <SelectItem value="2020">2020</SelectItem>
                                  <SelectItem value="2019">2019</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4">
                              {doc.receivedDate ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDateTime(doc.receivedDate)?.date}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(doc.receivedDate)?.time}
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  Not received
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {doc.reviewedDate && doc.reviewedBy ? (
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatDateTime(doc.reviewedDate)?.date}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
                                    </div>
                                  </div>
                                </div>
                              ) : doc.status === 'pending' ? (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                    onClick={() => handleApprove(doc.id)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedDoc(doc);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : doc.status === 'requested' ? (
                                <div className="space-y-1.5">
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Requested
                                  </Badge>
                                  {latestReminder && (
                                    <>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        {latestReminder.viewed ? (
                                          <>
                                            <Eye className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                              Viewed {formatReminderDate(latestReminder.viewedDate || latestReminder.sentDate)}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-500">
                                              Not viewed
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Sent: {formatReminderDate(latestReminder.sentDate)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                  Not reviewed
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {getMethodBadge(doc.method)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
                                {doc.status === 'requested' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                    onClick={() => handleSendReminderClick(doc)}
                                  >
                                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                                    Send Reminder
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {doc.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                          Approve Document
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedDoc(doc);
                                          setShowRejectDialog(true);
                                        }}>
                                          <X className="w-4 h-4 mr-2 text-red-600" />
                                          Reject Document
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    {doc.status === 'approved' && (
                                      <>
                                        <DropdownMenuItem onClick={() => {
                                          navigate(`/workflows/download?doc=${doc.id}`);
                                        }}>
                                          <ExternalLink className="w-4 h-4 mr-2 text-purple-600" />
                                          Test Workflow
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    <DropdownMenuItem onClick={() => {
                                      setDocumentToMove(doc);
                                      setShowMoveDialog(true);
                                    }}>
                                      <MoveRight className="w-4 h-4 mr-2" />
                                      Move to User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {}}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedDoc(doc);
                                      setShowNotesDialog(true);
                                    }}>
                                      <FileEdit className="w-4 h-4 mr-2" />
                                      {documentNotes[doc.id] ? 'Edit Notes' : 'Add Notes'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                          })
                        )}
                      </tbody>
                    </table>
                        );
                      })()}
                  </div>
                </Card>
                ) : viewMode === 'split' && hasIndividualAccounts ? (
                  // Split View - Group by Account (only available for Individual/spouse-linked accounts)
                  <div className="space-y-6">
                    {accountGroups.length === 0 ? (
                      <Card className="border-gray-200/60 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No documents found</p>
                      </Card>
                    ) : (
                      accountGroups.map((account) => {
                        // Get account's documents from the already-filtered clientFilteredDocs
                        const accountDocs = clientFilteredDocs.filter(doc => doc.clientId === account.accountId);

                        // Apply organize view filter if enabled
                        const displayDocs = showOrganizeView 
                          ? organizedDocuments.flatMap(g => g.documents).filter(d => accountDocs.some(ad => ad.id === d.id))
                          : accountDocs;

                        return (
                          <div key={account.accountId} className="space-y-3">
                            {/* Account Header */}
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                {account.clientType === 'Business' ? (
                                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{account.accountName}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{account.clientType}</p>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                                  {displayDocs.length} document{displayDocs.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>

                            {/* Empty State for Account */}
                            {displayDocs.length === 0 ? (
                              <Card className="border-gray-200/60 p-8 text-center">
                                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  No documents found for {account.accountName}
                                </p>
                              </Card>
                            ) : (
                              <>
                                {/* Account Documents Table */}
                                <Card className="border-gray-200/60">
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[1400px]">
                                  <thead className="bg-gray-50/50 border-b border-gray-200">
                                    <tr>
                                      <th className="px-4 py-3 text-left w-12">
                                        <Checkbox 
                                          checked={displayDocs.length > 0 && displayDocs.every(doc => selectedDocuments.includes(doc.id))}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedDocuments(prev => [...new Set([...prev, ...displayDocs.map(d => d.id)])]);
                                            } else {
                                              setSelectedDocuments(prev => prev.filter(id => !displayDocs.some(d => d.id === id)));
                                            }
                                          }}
                                        />
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Document
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Document Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Year
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Received
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reviewed
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                      </th>
                                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {showOrganizeView ? (
                                      organizedDocuments.flatMap((group) => {
                                        const groupDocs = group.documents.filter(d => accountDocs.some(ad => ad.id === d.id));
                                        if (groupDocs.length === 0) return [];
                                        
                                        return [
                                          <tr key={`category-${group.category.id}-${account.accountId}`} className="bg-gray-100 dark:bg-gray-800">
                                            <td colSpan={8} className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-purple-600"></div>
                                                <span className="font-semibold text-gray-900 dark:text-white uppercase tracking-wide text-xs">
                                                  {group.category.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  ({groupDocs.length} document{groupDocs.length !== 1 ? 's' : ''})
                                                </span>
                                              </div>
                                            </td>
                                          </tr>,
                                          ...groupDocs.map((doc) => {
                                            const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
                                            const isUnreviewed = doc.reviewedDate === null;
                                            const isRequested = doc.status === 'requested';
                                            const shouldGrayOut = isRequested && statusFilter !== 'pending';
                                            const latestReminder = getLatestReminder(doc);
                                            
                                            // Check if document belongs to a linked spouse account
                                            const isLinkedSpouseDoc = showLinkedAccounts && selectedClientIds.length > 0 && (() => {
                                              const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
                                              return selectedClient?.linkedAccounts?.includes(doc.clientId) ?? false;
                                            })();
                                            
                                            return (
                                              <tr 
                                                key={doc.id}
                                                className={cn(
                                                  "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group",
                                                  selectedDocuments.includes(doc.id) && "bg-purple-50/30 dark:bg-purple-900/10",
                                                  isLinkedSpouseDoc && "bg-blue-50/30 dark:bg-blue-900/10",
                                                  isDifferentYear && isUnreviewed && "bg-amber-50/40 dark:bg-amber-900/20 border-l-4 border-amber-500"
                                                )}
                                              >
                                                <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                                                  <Checkbox 
                                                    checked={selectedDocuments.includes(doc.id)}
                                                    onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                                  />
                                                </td>
                                                <td className={cn("px-4 py-4 relative", shouldGrayOut && "opacity-50")}>
                                                  <div className="flex items-center gap-3">
                                                    <div className="relative group/preview">
                                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
                                                        {doc.thumbnail}
                                                      </div>
                                                      <div className="fixed hidden group-hover/preview:block z-[9999] pointer-events-none" style={{
                                                        left: '50%',
                                                        top: '50%',
                                                        transform: 'translate(-50%, -50%)'
                                                      }}>
                                                        <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                                                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-6xl">
                                                            {doc.thumbnail}
                                                          </div>
                                                          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        {editingDocId === doc.id ? (
                                                          <Input
                                                            value={editingDocName}
                                                            onChange={(e) => setEditingDocName(e.target.value)}
                                                            onBlur={() => {
                                                              if (editingDocName.trim()) {
                                                                setDocuments(docs =>
                                                                  docs.map(d =>
                                                                    d.id === doc.id
                                                                      ? { ...d, name: editingDocName }
                                                                      : d
                                                                  )
                                                                );
                                                                toast.success('Document renamed');
                                                              }
                                                              setEditingDocId(null);
                                                              setEditingDocName('');
                                                            }}
                                                            onKeyDown={(e) => {
                                                              if (e.key === 'Enter') {
                                                                e.currentTarget.blur();
                                                              } else if (e.key === 'Escape') {
                                                                setEditingDocId(null);
                                                                setEditingDocName('');
                                                              }
                                                            }}
                                                            className="h-7 text-sm"
                                                            autoFocus
                                                          />
                                                        ) : (
                                                          <button
                                                            onClick={() => {
                                                              setEditingDocId(doc.id);
                                                              setEditingDocName(doc.name);
                                                            }}
                                                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                                                            title="Click to rename"
                                                          >
                                                            {doc.name}
                                                          </button>
                                                        )}
                                                        {isDifferentYear && isUnreviewed && (
                                                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                                            {doc.year}
                                                          </Badge>
                                                        )}
                                                        {documentNotes[doc.id] && (
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setSelectedDoc(doc);
                                                              setShowNotesDialog(true);
                                                            }}
                                                            className="text-purple-600 hover:text-purple-700 transition-colors"
                                                            title="View notes"
                                                          >
                                                            <FileEdit className="w-3.5 h-3.5" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                  <Select 
                                                    value={doc.documentType}
                                                    onValueChange={(value) => {
                                                      console.log('Change document type to:', value);
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="W2 Form">W2 Form</SelectItem>
                                                      <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                                                      <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                                                      <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                                      <SelectItem value="Property Tax Bill">Property Tax Bill</SelectItem>
                                                      <SelectItem value="Donation Receipt">Donation Receipt</SelectItem>
                                                      <SelectItem value="Invoice">Invoice</SelectItem>
                                                      <SelectItem value="Receipt">Receipt</SelectItem>
                                                      <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </td>
                                                <td className="px-4 py-4">
                                                  <Select 
                                                    value={doc.year}
                                                    onValueChange={(value) => {
                                                      console.log('Change year to:', value);
                                                    }}
                                                  >
                                                    <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors w-24">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="2024">2024</SelectItem>
                                                      <SelectItem value="2023">2023</SelectItem>
                                                      <SelectItem value="2022">2022</SelectItem>
                                                      <SelectItem value="2021">2021</SelectItem>
                                                      <SelectItem value="2020">2020</SelectItem>
                                                      <SelectItem value="2019">2019</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </td>
                                                <td className="px-4 py-4">
                                                  {doc.receivedDate ? (
                                                    <div>
                                                      <div className="text-sm font-medium text-gray-900">
                                                        {formatDateTime(doc.receivedDate)?.date}
                                                      </div>
                                                      <div className="text-xs text-gray-500">
                                                        {formatDateTime(doc.receivedDate)?.time}
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                                      Not received
                                                    </Badge>
                                                  )}
                                                </td>
                                                <td className="px-4 py-4">
                                                  {doc.reviewedDate && doc.reviewedBy ? (
                                                    <div className="flex items-start gap-2">
                                                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                      </div>
                                                      <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                          {formatDateTime(doc.reviewedDate)?.date}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                          {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ) : doc.status === 'pending' ? (
                                                    <div className="flex items-center gap-2">
                                                      <Button 
                                                        size="sm" 
                                                        className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                                        onClick={() => handleApprove(doc.id)}
                                                      >
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Approve
                                                      </Button>
                                                      <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                          setSelectedDoc(doc);
                                                          setShowRejectDialog(true);
                                                        }}
                                                      >
                                                        Reject
                                                      </Button>
                                                    </div>
                                                  ) : doc.status === 'requested' ? (
                                                    <div className="space-y-1.5">
                                                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                                                        <Bell className="w-3 h-3 mr-1" />
                                                        Requested
                                                      </Badge>
                                                      {latestReminder && (
                                                        <>
                                                          <div className="flex items-center gap-1.5 text-xs">
                                                            {latestReminder.viewed ? (
                                                              <>
                                                                <Eye className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                  Viewed {formatReminderDate(latestReminder.viewedDate || latestReminder.sentDate)}
                                                                </span>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <EyeOff className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500 dark:text-gray-500">
                                                                  Not viewed
                                                                </span>
                                                              </>
                                                            )}
                                                          </div>
                                                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Sent: {formatReminderDate(latestReminder.sentDate)}
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                                      Not reviewed
                                                    </Badge>
                                                  )}
                                                </td>
                                                <td className="px-4 py-4">
                                                  {getMethodBadge(doc.method)}
                                                </td>
                                                <td className="px-4 py-4">
                                                  <div className="flex items-center justify-end gap-1">
                                                    {doc.status === 'requested' && (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                        onClick={() => handleSendReminderClick(doc)}
                                                      >
                                                        <Bell className="w-3.5 h-3.5 mr-1.5" />
                                                        Send Reminder
                                                      </Button>
                                                    )}
                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                          <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                        {doc.status === 'pending' && (
                                                          <>
                                                            <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                                                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                              Approve Document
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                              setSelectedDoc(doc);
                                                              setShowRejectDialog(true);
                                                            }}>
                                                              <X className="w-4 h-4 mr-2 text-red-600" />
                                                              Reject Document
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                          </>
                                                        )}
                                                        {doc.status === 'approved' && (
                                                          <>
                                                            <DropdownMenuItem onClick={() => {
                                                              navigate(`/workflows/download?doc=${doc.id}`);
                                                            }}>
                                                              <ExternalLink className="w-4 h-4 mr-2 text-purple-600" />
                                                              Test Workflow
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                          </>
                                                        )}
                                                        <DropdownMenuItem onClick={() => {
                                                          setDocumentToMove(doc);
                                                          setShowMoveDialog(true);
                                                        }}>
                                                          <MoveRight className="w-4 h-4 mr-2" />
                                                          Move to User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {}}>
                                                          <Edit className="w-4 h-4 mr-2" />
                                                          Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                          setSelectedDoc(doc);
                                                          setShowNotesDialog(true);
                                                        }}>
                                                          <FileEdit className="w-4 h-4 mr-2" />
                                                          {documentNotes[doc.id] ? 'Edit Notes' : 'Add Notes'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                          <Download className="w-4 h-4 mr-2" />
                                                          Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                          <Trash2 className="w-4 h-4 mr-2" />
                                                          Delete
                                                        </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ];
                                      })
                                    ) : (
                                      displayDocs.map((doc) => {
                                        const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
                                        const isUnreviewed = doc.reviewedDate === null;
                                        const isRequested = doc.status === 'requested';
                                        const shouldGrayOut = isRequested && statusFilter !== 'pending';
                                        const latestReminder = getLatestReminder(doc);
                                        
                                        // Check if document belongs to a linked spouse account
                                        const isLinkedSpouseDoc = showLinkedAccounts && selectedClientIds.length > 0 && (() => {
                                          const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
                                          return selectedClient?.linkedAccounts?.includes(doc.clientId) ?? false;
                                        })();
                                        
                                        return (
                                          <tr 
                                            key={doc.id}
                                            className={cn(
                                              "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group",
                                              selectedDocuments.includes(doc.id) && "bg-purple-50/30 dark:bg-purple-900/10",
                                              isLinkedSpouseDoc && "bg-blue-50/30 dark:bg-blue-900/10",
                                              isDifferentYear && isUnreviewed && "bg-amber-50/40 dark:bg-amber-900/20 border-l-4 border-amber-500"
                                            )}
                                          >
                                            <td className={cn("px-4 py-4", shouldGrayOut && "opacity-50")}>
                                              <Checkbox 
                                                checked={selectedDocuments.includes(doc.id)}
                                                onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                              />
                                            </td>
                                            <td className={cn("px-4 py-4 relative", shouldGrayOut && "opacity-50")}>
                                              <div className="flex items-center gap-3">
                                                <div className="relative group/preview">
                                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
                                                    {doc.thumbnail}
                                                  </div>
                                                  <div className="fixed hidden group-hover/preview:block z-[9999] pointer-events-none" style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                  }}>
                                                    <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                                                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-6xl">
                                                        {doc.thumbnail}
                                                      </div>
                                                      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    {editingDocId === doc.id ? (
                                                      <Input
                                                        value={editingDocName}
                                                        onChange={(e) => setEditingDocName(e.target.value)}
                                                        onBlur={() => {
                                                          if (editingDocName.trim()) {
                                                            setDocuments(docs =>
                                                              docs.map(d =>
                                                                d.id === doc.id
                                                                  ? { ...d, name: editingDocName }
                                                                  : d
                                                              )
                                                            );
                                                            toast.success('Document renamed');
                                                          }
                                                          setEditingDocId(null);
                                                          setEditingDocName('');
                                                        }}
                                                        onKeyDown={(e) => {
                                                          if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                          } else if (e.key === 'Escape') {
                                                            setEditingDocId(null);
                                                            setEditingDocName('');
                                                          }
                                                        }}
                                                        className="h-7 text-sm"
                                                        autoFocus
                                                      />
                                                    ) : (
                                                      <button
                                                        onClick={() => {
                                                          setEditingDocId(doc.id);
                                                          setEditingDocName(doc.name);
                                                        }}
                                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                                                        title="Click to rename"
                                                      >
                                                        {doc.name}
                                                      </button>
                                                    )}
                                                    {isDifferentYear && isUnreviewed && (
                                                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                                        {doc.year}
                                                      </Badge>
                                                    )}
                                                    {documentNotes[doc.id] && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedDoc(doc);
                                                          setShowNotesDialog(true);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-700 transition-colors"
                                                        title="View notes"
                                                      >
                                                        <FileEdit className="w-3.5 h-3.5" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-4 py-4">
                                              <Select 
                                                value={doc.documentType}
                                                onValueChange={(value) => {
                                                  console.log('Change document type to:', value);
                                                }}
                                              >
                                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="W2 Form">W2 Form</SelectItem>
                                                  <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                                                  <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                                                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                                  <SelectItem value="Property Tax Bill">Property Tax Bill</SelectItem>
                                                  <SelectItem value="Donation Receipt">Donation Receipt</SelectItem>
                                                  <SelectItem value="Invoice">Invoice</SelectItem>
                                                  <SelectItem value="Receipt">Receipt</SelectItem>
                                                  <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </td>
                                            <td className="px-4 py-4">
                                              <Select 
                                                value={doc.year}
                                                onValueChange={(value) => {
                                                  console.log('Change year to:', value);
                                                }}
                                              >
                                                <SelectTrigger className="h-8 text-sm border-gray-200 hover:border-purple-400 transition-colors w-24">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="2024">2024</SelectItem>
                                                  <SelectItem value="2023">2023</SelectItem>
                                                  <SelectItem value="2022">2022</SelectItem>
                                                  <SelectItem value="2021">2021</SelectItem>
                                                  <SelectItem value="2020">2020</SelectItem>
                                                  <SelectItem value="2019">2019</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </td>
                                            <td className="px-4 py-4">
                                              {doc.receivedDate ? (
                                                <div>
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {formatDateTime(doc.receivedDate)?.date}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    {formatDateTime(doc.receivedDate)?.time}
                                                  </div>
                                                </div>
                                              ) : (
                                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                                  Not received
                                                </Badge>
                                              )}
                                            </td>
                                            <td className="px-4 py-4">
                                              {doc.reviewedDate && doc.reviewedBy ? (
                                                <div className="flex items-start gap-2">
                                                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                      {formatDateTime(doc.reviewedDate)?.date}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                      {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : doc.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                  <Button 
                                                    size="sm" 
                                                    className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                                    onClick={() => handleApprove(doc.id)}
                                                  >
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Approve
                                                  </Button>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                      setSelectedDoc(doc);
                                                      setShowRejectDialog(true);
                                                    }}
                                                  >
                                                    Reject
                                                  </Button>
                                                </div>
                                              ) : doc.status === 'requested' ? (
                                                <div className="space-y-1.5">
                                                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    Requested
                                                  </Badge>
                                                  {latestReminder && (
                                                    <>
                                                      <div className="flex items-center gap-1.5 text-xs">
                                                        {latestReminder.viewed ? (
                                                          <>
                                                            <Eye className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                              Viewed {formatReminderDate(latestReminder.viewedDate || latestReminder.sentDate)}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-500">
                                                              Not viewed
                                                            </span>
                                                          </>
                                                        )}
                                                      </div>
                                                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                                        Sent: {formatReminderDate(latestReminder.sentDate)}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              ) : (
                                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                                  Not reviewed
                                                </Badge>
                                              )}
                                            </td>
                                            <td className="px-4 py-4">
                                              {getMethodBadge(doc.method)}
                                            </td>
                                            <td className="px-4 py-4">
                                              <div className="flex items-center justify-end gap-1">
                                                {doc.status === 'requested' && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                    onClick={() => handleSendReminderClick(doc)}
                                                  >
                                                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                                                    Send Reminder
                                                  </Button>
                                                )}
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                      <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    {doc.status === 'pending' && (
                                                      <>
                                                        <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                                                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                          Approve Document
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                          setSelectedDoc(doc);
                                                          setShowRejectDialog(true);
                                                        }}>
                                                          <X className="w-4 h-4 mr-2 text-red-600" />
                                                          Reject Document
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                      </>
                                                    )}
                                                    {doc.status === 'approved' && (
                                                      <>
                                                        <DropdownMenuItem onClick={() => {
                                                          navigate(`/workflows/download?doc=${doc.id}`);
                                                        }}>
                                                          <ExternalLink className="w-4 h-4 mr-2 text-purple-600" />
                                                          Test Workflow
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                      </>
                                                    )}
                                                    <DropdownMenuItem onClick={() => {
                                                      setDocumentToMove(doc);
                                                      setShowMoveDialog(true);
                                                    }}>
                                                      <MoveRight className="w-4 h-4 mr-2" />
                                                      Move to User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {}}>
                                                      <Edit className="w-4 h-4 mr-2" />
                                                      Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                      setSelectedDoc(doc);
                                                      setShowNotesDialog(true);
                                                    }}>
                                                      <FileEdit className="w-4 h-4 mr-2" />
                                                      {documentNotes[doc.id] ? 'Edit Notes' : 'Add Notes'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                      <Download className="w-4 h-4 mr-2" />
                                                      Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                      <Trash2 className="w-4 h-4 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                                </Card>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  // Fallback: Show Table View if Split View is not available (e.g., only Business accounts)
                  <Card className="border-gray-200/60 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Split View is only available for spouse-linked accounts</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'filemanager' && (
            <FileManagerView 
              clientName={selectedClient?.name || ''}
              isFirm={selectedClient?.isFirm || false}
              showAISearch={selectedClient?.isFirm || false}
            />
          )}

          {activeTab === 'checklist' && (
            <DocumentChecklistView
              clientName={selectedClient?.name || ''}
              clientId={selectedClient?.id || ''}
            />
          )}

          {activeTab === 'activitylog' && (
            <DocumentActivityLogView
              clientName={selectedClient?.name || ''}
              isFirm={selectedClient?.isFirm || false}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <RequestDocumentDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        clientId={selectedClient?.id || ''}
        clientName={selectedClient?.name || ''}
      />

      <MoveDocumentDialog
        open={showMoveDialog}
        onClose={() => {
          setShowMoveDialog(false);
          setDocumentToMove(null);
        }}
        document={documentToMove}
        clients={clients}
        onMove={handleMoveDocument}
      />

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => {
        setShowRejectDialog(open);
        if (open && selectedDoc) {
          // Initialize email template when dialog opens
          const uploadLink = `${window.location.origin}/document-upload?doc=${selectedDoc.id}`;
          setRejectEmailTemplate(
            `Dear ${selectedDoc.clientName},\n\n` +
            `We have reviewed your submitted document "${selectedDoc.name}" and unfortunately cannot accept it at this time.\n\n` +
            `Reason: ${rejectionReason || '[Please provide a reason above]'}\n\n` +
            `Please review the feedback and resubmit the document with the necessary corrections.\n\n` +
            `To upload a new version, please click the link below:\n` +
            `${uploadLink}\n\n` +
            `For your security, you will be asked to verify your identity with a code sent to your phone.\n\n` +
            `If you have any questions, please don't hesitate to contact us.\n\n` +
            `Best regards,\n` +
            `Your Accounting Team`
          );
        }
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="reject-document-description">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription id="reject-document-description">
              Provide a reason for rejecting this document. The client will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason (Internal)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="E.g., Document is not clear, wrong year, missing information..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  // Update email template with new reason
                  if (selectedDoc) {
                    const uploadLink = `${window.location.origin}/document-upload?doc=${selectedDoc.id}`;
                    setRejectEmailTemplate(
                      `Dear ${selectedDoc.clientName},\n\n` +
                      `We have reviewed your submitted document "${selectedDoc.name}" and unfortunately cannot accept it at this time.\n\n` +
                      `Reason: ${e.target.value || '[Please provide a reason above]'}\n\n` +
                      `Please review the feedback and resubmit the document with the necessary corrections.\n\n` +
                      `To upload a new version, please click the link below:\n` +
                      `${uploadLink}\n\n` +
                      `For your security, you will be asked to verify your identity with a code sent to your phone.\n\n` +
                      `If you have any questions, please don't hesitate to contact us.\n\n` +
                      `Best regards,\n` +
                      `Your Accounting Team`
                    );
                  }
                }}
                className="mt-2"
                rows={3}
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <Label htmlFor="email-template">Email Template (Editable)</Label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">To:</span>
                  <span>{selectedDoc?.clientName || 'Client'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <span className="font-medium">Subject:</span>
                  <span>Document Rejection - {selectedDoc?.name || 'Document'}</span>
                </div>
              </div>
              <Textarea
                id="email-template"
                value={rejectEmailTemplate}
                onChange={(e) => setRejectEmailTemplate(e.target.value)}
                className="mt-2 font-mono text-sm"
                rows={12}
              />
              <p className="text-xs text-gray-500 mt-2">
                You can customize this email before sending it to the client.
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => {
                if (selectedDoc) {
                  navigate(`/workflows/upload?doc=${selectedDoc.id}`);
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Workflow
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
                setRejectEmailTemplate('');
                setSelectedDoc(null);
              }}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (selectedDoc && rejectionReason.trim()) {
                    handleReject(selectedDoc.id, rejectionReason);
                    setShowRejectDialog(false);
                    setRejectionReason('');
                    setRejectEmailTemplate('');
                    setSelectedDoc(null);
                  }
                }}
                disabled={!rejectionReason.trim()}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Rejection Email
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move To User Dialog */}
      <MoveToUserDialog
        open={showMoveToUserDialog}
        onOpenChange={setShowMoveToUserDialog}
        currentClientId={selectedClientIds[0] || ''}
        currentClientName={clients.find(c => c.id === selectedClientIds[0])?.name || ''}
        documentCount={selectedDocuments.length}
        clients={clients}
        onConfirm={handleBulkMoveToUser}
      />

      {/* Change Year Dialog */}
      <ChangeYearDialog
        open={showChangeYearDialog}
        onOpenChange={setShowChangeYearDialog}
        documentCount={selectedDocuments.length}
        onConfirm={handleBulkChangeYear}
      />

      {/* Delete Documents Dialog */}
      <DeleteDocumentsDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        documentCount={selectedDocuments.length}
        onConfirm={handleBulkDelete}
      />

      {/* Upload Documents Dialog */}
      <UploadDocumentsDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        clientName={clients.find(c => c.id === selectedClientIds[0])?.name || 'Selected Client'}
        onUpload={handleUpload}
      />

      {/* Reminder History Dialog */}
      <ReminderHistoryDialog
        open={showReminderHistoryDialog}
        onOpenChange={setShowReminderHistoryDialog}
        document={reminderDialogDoc}
        emailBody={reminderEmailBody}
        onEmailChange={setReminderEmailBody}
        onSend={() => {
          if (reminderDialogDoc) {
            handleSendReminder(reminderDialogDoc, reminderEmailBody);
          }
        }}
      />
    </div>
  );
}
