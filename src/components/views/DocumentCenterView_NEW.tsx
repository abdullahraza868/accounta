import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Download, Trash2, AlertCircle, Check, X, 
  Mail, MessageSquare, MoveRight, Edit, FileEdit, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, Play, Ban, Calendar, Clock,
  ZoomIn, ZoomOut, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, ExternalLink,
  Maximize2, Minimize2, User, Building2, Filter, Plus, Bell, FolderOpen,
  TrendingUp, Eye, CheckCircle, FileQuestion, Folder, Users
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

type DocumentMethod = 'Uploaded File' | 'Email' | 'Text Message';
type DocumentStatus = 'pending' | 'approved' | 'requested' | 'rejected';

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
};

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  documentCount: number;
  newDocumentCount: number; // pending or requested
  mostRecentDate: string;
  linkedAccounts?: string[]; // IDs of linked clients
};

type TabMode = 'documents' | 'filemanager' | 'checklist';

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
    {
      id: '1',
      name: 'Troy Business Services LLC',
      type: 'Business',
      documentCount: 12,
      newDocumentCount: 3,
      mostRecentDate: '2024-12-20',
    },
    {
      id: '2',
      name: 'Abacus 360',
      type: 'Business',
      documentCount: 18,
      newDocumentCount: 6,
      mostRecentDate: '2024-10-17',
    },
    {
      id: '3',
      name: 'Best Face Forward',
      type: 'Business',
      documentCount: 5,
      newDocumentCount: 1,
      mostRecentDate: '2024-10-10',
    },
    {
      id: '4',
      name: 'Cleveland Business Services, LLC',
      type: 'Business',
      documentCount: 8,
      newDocumentCount: 1,
      mostRecentDate: '2024-10-18',
    },
    {
      id: '5',
      name: 'John Smith',
      type: 'Individual',
      documentCount: 6,
      newDocumentCount: 2,
      mostRecentDate: '2024-12-10',
      linkedAccounts: ['6'], // Linked to spouse
    },
    {
      id: '6',
      name: 'Jane Smith',
      type: 'Individual',
      documentCount: 4,
      newDocumentCount: 1,
      mostRecentDate: '2024-12-08',
      linkedAccounts: ['5'], // Linked to spouse
    },
  ]);

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
    },
    {
      id: '4',
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
      id: '5',
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
      hasOldYear: false,
    },
    {
      id: '6',
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

  // Stats Dashboard (when no client selected)
  if (selectedClientIds.length === 0) {
    return (
      <div className="flex h-full">
        {/* Left Column - Client List */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
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
                
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientIds([client.id])}
                    className={cn(
                      "w-full text-left p-3 pr-4 rounded-lg transition-all",
                      "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30",
                      "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    )}
                  >
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {client.type === 'Business' ? (
                          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
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
                      <span className="flex-shrink-0">{formattedDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Area - Empty State */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Document Center</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage documents, file uploads, and client submissions
                </p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main view with client selected
  const selectedClient = clients.find(c => selectedClientIds.includes(c.id));
  const hasLinkedAccounts = selectedClient?.linkedAccounts && selectedClient.linkedAccounts.length > 0;

  return (
    <div className="flex h-full">
      {/* Left Column - Client List */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
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
              
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientIds([client.id])}
                  className={cn(
                    "w-full text-left p-3 pr-4 rounded-lg transition-all",
                    selectedClientIds.includes(client.id)
                      ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700"
                      : "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30",
                    "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  )}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {client.type === 'Business' ? (
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
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
                    <span className="flex-shrink-0">{formattedDate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right Area - Tabs and Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Tabs */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
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
              <Button
                onClick={() => navigate(`/clients/${selectedClient?.id}`)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Open Folder
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'documents' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 flex-1 overflow-auto">
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

                {/* Filters and Actions Bar */}
                <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Year Filter - Quick Access */}
                    <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
                      <button
                        onClick={() => setSelectedYear('2024')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2024'
                            ? "bg-purple-100 text-purple-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        2024
                      </button>
                      <button
                        onClick={() => setSelectedYear('2023')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2023'
                            ? "bg-purple-100 text-purple-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        2023
                      </button>
                      <button
                        onClick={() => setSelectedYear('2022')}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          selectedYear === '2022'
                            ? "bg-purple-100 text-purple-700"
                            : "text-gray-600 hover:bg-gray-100"
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

                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Search documents..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Bulk Update
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={selectedDocuments.length === 0}>
                          Change Document Type
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={selectedDocuments.length === 0}>
                          Change Year
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={selectedDocuments.length === 0}>
                          Add Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={selectedDocuments.length === 0}>
                          Mark as Reviewed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={selectedDocuments.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download ({selectedDocuments.length})
                    </Button>

                    <Button 
                      size="sm"
                      className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

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
                      <Button size="sm" variant="outline" className="border-purple-300">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve All
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-300">
                        <MoveRight className="w-4 h-4 mr-2" />
                        Move to User
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-300">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Move to Folder
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-300 text-red-600 hover:bg-red-50">
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

                {/* Documents Table */}
                <Card className="border-gray-200/60">
                  <div className="overflow-x-auto">
                    <table className="w-full">
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
                      <tbody className="divide-y divide-gray-200">
                        {clientFilteredDocs.map((doc) => {
                          const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
                          const isUnreviewed = doc.reviewedDate === null;
                          
                          return (
                          <tr 
                            key={doc.id}
                            className={cn(
                              "hover:bg-gray-50/50 transition-colors group",
                              selectedDocuments.includes(doc.id) && "bg-purple-50/30",
                              isDifferentYear && isUnreviewed && "bg-amber-50/40 border-l-4 border-amber-500"
                            )}
                          >
                            <td className="px-4 py-4">
                              <Checkbox 
                                checked={selectedDocuments.includes(doc.id)}
                                onCheckedChange={() => toggleDocumentSelection(doc.id)}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative group/preview">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
                                    {doc.thumbnail}
                                  </div>
                                  {/* Preview on Hover */}
                                  <div className="absolute left-0 top-12 z-50 hidden group-hover/preview:block">
                                    <div className="w-64 h-80 bg-white rounded-lg shadow-2xl border-2 border-purple-200 p-4">
                                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-6xl">
                                        {doc.thumbnail}
                                      </div>
                                      <p className="text-xs text-center mt-2 text-gray-500">Document Preview</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
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
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDateTime(doc.reviewedDate)?.date}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
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
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                  Awaiting upload
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {getMethodBadge(doc.method)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
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
                        )})}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'filemanager' && (
            <div className="flex-1 overflow-auto p-6">
              <Card className="p-12 text-center">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">File Manager</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload files for clients to download (Coming soon)
                </p>
              </Card>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="flex-1 overflow-auto p-6">
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Document Checklist</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track required documents and auto-populate annual lists (Coming soon)
                </p>
              </Card>
            </div>
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
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent aria-describedby="reject-document-new-description">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription id="reject-document-new-description">
              Provide a reason for rejecting this document. The client will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="E.g., Document is not clear, wrong year, missing information..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedDoc && rejectionReason.trim()) {
                  handleReject(selectedDoc.id, rejectionReason);
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setSelectedDoc(null);
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Reject & Notify Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
