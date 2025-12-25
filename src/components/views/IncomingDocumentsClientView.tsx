import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Download, Trash2, AlertCircle, Check, X, 
  Mail, MessageSquare, MoveRight, Edit, FileEdit, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, Play, Ban, Calendar, Clock,
  ZoomIn, ZoomOut, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, ExternalLink,
  Maximize2, Minimize2, User, Building2, Filter
} from 'lucide-react';
import { Resizable } from 're-resizable';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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

type DocumentMethod = 'Uploaded File' | 'Email' | 'Text Message';

type IncomingDocument = {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  documentType: string;
  year: string;
  receivedDate: string;
  reviewedDate: string | null;
  reviewedBy: string | null;
  reviewStatus: 'approved' | 'rejected' | null;
  rejectionReason?: string;
  method: DocumentMethod;
  thumbnail: string;
  status: 'received' | 'pending' | 'reviewing';
  hasOldYear?: boolean;
};

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  documentCount: number;
  newDocumentCount: number; // not approved or rejected
  mostRecentDate: string;
};

type ClientSortBy = 'alphabetical' | 'recent';

type SortColumn = 'receivedDate' | 'method' | null;
type SortDirection = 'asc' | 'desc';

export function IncomingDocumentsClientView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentNoteDocId, setCurrentNoteDocId] = useState<string | null>(null);
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkYearDialog, setShowBulkYearDialog] = useState(false);
  const [showBulkTypeDialog, setShowBulkTypeDialog] = useState(false);
  const [bulkYear, setBulkYear] = useState('');
  const [bulkType, setBulkType] = useState('');
  const [editingDocumentName, setEditingDocumentName] = useState(false);
  const [tempDocumentName, setTempDocumentName] = useState('');
  const [reviewByClient, setReviewByClient] = useState(false);
  const [currentReviewClient, setCurrentReviewClient] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 60,
    document: 280,
    type: 200,
    year: 120,
    received: 150,
    method: 150,
    approveReject: 200,
    actions: 120,
  });

  // Client view specific state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [clientSortBy, setClientSortBy] = useState<ClientSortBy>('recent');
  const [clientTypeFilter, setClientTypeFilter] = useState<'All' | 'Individual' | 'Business'>('All');

  // Helper function to get preview image for document type
  const getPreviewImage = (documentType: string) => {
    const typeMap: Record<string, string> = {
      '1099-MISC': 'https://images.unsplash.com/photo-1605070208719-ad1d187917f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwxMDk5JTIwZm9ybSUyMGRvY3VtZW50fGVufDF8fHx8MTc2MTQyMDYxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'W-2': 'https://images.unsplash.com/photo-1636038197596-28e7dce070e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3MiUyMHRheCUyMGZvcm18ZW58MXx8fHwxNzYxNDIwNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      '1040': 'https://images.unsplash.com/photo-1636038197596-28e7dce070e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjBmb3JtJTIwMTA0MHxlbnwxfHx8fDE3NjE0MjA2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'Tax Return': 'https://images.unsplash.com/photo-1579444741963-5ae219cfe27c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjByZXR1cm4lMjBmb3Jtc3xlbnwxfHx8fDE3NjE0MjA2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'Bank Statement': 'https://images.unsplash.com/photo-1569979230536-b3415317a681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5rJTIwc3RhdGVtZW50JTIwZG9jdW1lbnR8ZW58MXx8fHwxNzYxNDIwNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'Receipt': 'https://images.unsplash.com/photo-1675580167286-47ea50993b8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHJlY2VpcHR8ZW58MXx8fHwxNzYxNDIwNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'Payroll': 'https://images.unsplash.com/photo-1579444741963-5ae219cfe27c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjByZXR1cm4lMjBmb3Jtc3xlbnwxfHx8fDE3NjE0MjA2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    };
    return typeMap[documentType] || typeMap['Tax Return'];
  };

  // Mock documents data - enhanced with client types
  const [documents, setDocuments] = useState<IncomingDocument[]>([
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
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '1a',
      name: 'Quarterly_Tax_Return_Q3.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Tax Return',
      year: '2024',
      receivedDate: '2024-10-13 09:20 AM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '1b',
      name: 'Bank_Statement_October.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-10-14 02:30 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Uploaded File',
      thumbnail: '📄',
      status: 'pending',
    },
    {
      id: '1c',
      name: 'Payroll_Summary_Oct.xlsx',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Payroll',
      year: '2024',
      receivedDate: '2024-10-15 04:45 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '1d',
      name: 'Receipt_Office_Supplies.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Receipt',
      year: '2024',
      receivedDate: '2024-10-16 10:15 AM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Text Message',
      thumbnail: '💬',
      status: 'pending',
    },
    {
      id: '1e',
      name: 'Invoice_Client_Services_Oct.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
      clientType: 'Business',
      documentType: 'Invoice',
      year: '2024',
      receivedDate: '2024-10-17 03:00 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Bank_Statement_Sept.pdf',
      clientName: 'Best Face Forward',
      clientId: '3',
      clientType: 'Business',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-10-10 03:15 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Text Message',
      thumbnail: '💬',
      status: 'pending',
    },
    {
      id: '3',
      name: 'Invoice_Template_Oct.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'Other',
      year: '2024',
      receivedDate: '2024-12-20 07:15 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '4',
      name: 'W2_Form_2023.pdf',
      clientName: 'Cleveland Business Services, LLC',
      clientId: '4',
      clientType: 'Business',
      documentType: 'W2 Form',
      year: '2023',
      receivedDate: '2024-10-18 10:30 AM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Uploaded File',
      thumbnail: '📄',
      status: 'pending',
    },
    {
      id: '5',
      name: 'W2_Form_2024.pdf',
      clientName: 'Troy Business Services LLC',
      clientId: '1',
      clientType: 'Business',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-10-15 09:23 AM',
      reviewedDate: '2024-10-16 02:15 PM',
      reviewedBy: 'Sarah Johnson',
      reviewStatus: 'approved',
      method: 'Uploaded File',
      thumbnail: '📄',
      status: 'received',
    },
    {
      id: '6',
      name: 'Tax_Return_2024.pdf',
      clientName: 'Anderson, Michael',
      clientId: '5',
      clientType: 'Individual',
      documentType: 'Tax Return',
      year: '2024',
      receivedDate: '2024-12-11 02:30 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '7',
      name: 'W2_2024.pdf',
      clientName: 'Anderson, Michael',
      clientId: '5',
      clientType: 'Individual',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-12-11 09:15 AM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Uploaded File',
      thumbnail: '📄',
      status: 'pending',
    },
    {
      id: '8',
      name: 'Bank_Statement_Nov.pdf',
      clientName: 'Johnson, Sarah',
      clientId: '6',
      clientType: 'Individual',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-12-10 04:20 PM',
      reviewedDate: null,
      reviewedBy: null,
      reviewStatus: null,
      method: 'Email',
      thumbnail: '📧',
      status: 'pending',
    },
    {
      id: '9',
      name: 'Receipt_Medical.pdf',
      clientName: 'Davis, Emily',
      clientId: '7',
      clientType: 'Individual',
      documentType: 'Receipt',
      year: '2024',
      receivedDate: '2024-12-09 11:30 AM',
      reviewedDate: '2024-12-10 09:00 AM',
      reviewedBy: 'Mike Brown',
      reviewStatus: 'approved',
      method: 'Text Message',
      thumbnail: '💬',
      status: 'received',
    },
  ]);

  // Build client summaries from documents
  const clientSummaries = useMemo<ClientSummary[]>(() => {
    const clientMap = new Map<string, ClientSummary>();
    
    documents.forEach(doc => {
      if (!clientMap.has(doc.clientId)) {
        clientMap.set(doc.clientId, {
          id: doc.clientId,
          name: doc.clientName,
          type: doc.clientType,
          documentCount: 0,
          newDocumentCount: 0,
          mostRecentDate: doc.receivedDate,
        });
      }
      
      const client = clientMap.get(doc.clientId)!;
      client.documentCount++;
      if (doc.reviewStatus === null) {
        client.newDocumentCount++;
      }
      
      // Update most recent date
      const currentDate = new Date(doc.receivedDate.split(' ')[0]).getTime();
      const mostRecentDate = new Date(client.mostRecentDate.split(' ')[0]).getTime();
      if (currentDate > mostRecentDate) {
        client.mostRecentDate = doc.receivedDate;
      }
    });
    
    return Array.from(clientMap.values());
  }, [documents]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clientSummaries;
    
    // Apply search filter
    if (clientSearchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (clientTypeFilter !== 'All') {
      filtered = filtered.filter(client => client.type === clientTypeFilter);
    }
    
    // Sort clients
    const sorted = [...filtered].sort((a, b) => {
      if (clientSortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by most recent
        const aDate = new Date(a.mostRecentDate.split(' ')[0]).getTime();
        const bDate = new Date(b.mostRecentDate.split(' ')[0]).getTime();
        return bDate - aDate;
      }
    });
    
    return sorted;
  }, [clientSummaries, clientSearchQuery, clientTypeFilter, clientSortBy]);

  // Auto-select client with most recent document on load
  useState(() => {
    if (filteredClients.length > 0 && selectedClientIds.length === 0) {
      // Find client with most recent document
      const mostRecentClient = [...clientSummaries].sort((a, b) => {
        const aDate = new Date(a.mostRecentDate.split(' ')[0]).getTime();
        const bDate = new Date(b.mostRecentDate.split(' ')[0]).getTime();
        return bDate - aDate;
      })[0];
      
      if (mostRecentClient) {
        setSelectedClientIds([mostRecentClient.id]);
      }
    }
  });

  // Filter documents based on selected clients and search
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    // Filter by selected clients
    if (selectedClientIds.length > 0) {
      filtered = filtered.filter(doc => selectedClientIds.includes(doc.clientId));
    }
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        if (sortColumn === 'receivedDate') {
          const parseDate = (dateStr: string) => {
            const [datePart] = dateStr.split(' ');
            return new Date(datePart).getTime();
          };
          aValue = parseDate(a.receivedDate);
          bValue = parseDate(b.receivedDate);
        } else if (sortColumn === 'method') {
          aValue = a.method.toLowerCase();
          bValue = b.method.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [documents, selectedClientIds, searchQuery, sortColumn, sortDirection]);

  // Helper to check if document year is old (2+ years behind current year)
  const isOldYear = (year: string) => {
    const currentYear = new Date().getFullYear();
    const docYear = parseInt(year);
    return currentYear - docYear >= 2;
  };

  // Helper to format received date/time
  const formatReceivedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dateFormatted = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const timeFormatted = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return { date: dateFormatted, time: timeFormatted };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  // Stats
  const totalDocuments = filteredDocuments.length;
  const needsReview = filteredDocuments.filter(d => d.reviewStatus === null).length;
  const reviewed = filteredDocuments.filter(d => d.reviewStatus !== null).length;
  const hasOldDocuments = filteredDocuments.some(d => isOldYear(d.year));

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
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleApprove = (docId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId
        ? { ...doc, reviewStatus: 'approved' as const, reviewedDate: new Date().toISOString(), reviewedBy: 'You' }
        : doc
    ));
    toast.success('Document approved');
  };

  const handleReject = (docId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId
        ? { ...doc, reviewStatus: 'rejected' as const, reviewedDate: new Date().toISOString(), reviewedBy: 'You', rejectionReason }
        : doc
    ));
    toast.success('Document rejected');
    setRejectionReason('');
  };

  const handleChangeDocumentType = (docId: string, newType: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, documentType: newType } : doc
    ));
    toast.success('Document type updated');
  };

  const handleChangeDocumentYear = (docId: string, newYear: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, year: newYear } : doc
    ));
    toast.success('Year updated');
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document deleted');
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const toggleAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(d => d.id));
    }
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientIds([clientId]);
  };

  const handleBulkApprove = () => {
    setDocuments(prev => prev.map(doc =>
      selectedDocuments.includes(doc.id)
        ? { ...doc, reviewStatus: 'approved' as const, reviewedDate: new Date().toISOString(), reviewedBy: 'You' }
        : doc
    ));
    toast.success(`${selectedDocuments.length} document(s) approved`);
    setSelectedDocuments([]);
    setShowBulkApproveDialog(false);
  };

  const handleBulkDelete = () => {
    setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
    toast.success(`${selectedDocuments.length} document(s) deleted`);
    setSelectedDocuments([]);
    setShowBulkDeleteDialog(false);
  };

  const handleBulkYearUpdate = () => {
    setDocuments(prev => prev.map(doc =>
      selectedDocuments.includes(doc.id)
        ? { ...doc, year: bulkYear }
        : doc
    ));
    toast.success(`Updated year for ${selectedDocuments.length} document(s)`);
    setSelectedDocuments([]);
    setShowBulkYearDialog(false);
    setBulkYear('');
  };

  const handleBulkTypeUpdate = () => {
    setDocuments(prev => prev.map(doc =>
      selectedDocuments.includes(doc.id)
        ? { ...doc, documentType: bulkType }
        : doc
    ));
    toast.success(`Updated type for ${selectedDocuments.length} document(s)`);
    setSelectedDocuments([]);
    setShowBulkTypeDialog(false);
    setBulkType('');
  };

  const getMethodBadge = (method: DocumentMethod) => {
    const methodConfig = {
      'Uploaded File': { icon: Upload, color: 'bg-purple-100 text-purple-700 border-purple-200' },
      'Email': { icon: Mail, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'Text Message': { icon: MessageSquare, color: 'bg-green-100 text-green-700 border-green-200' },
    };

    const config = methodConfig[method];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {method}
      </Badge>
    );
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Client List */}
      <div className="w-80 flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Client List Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Clients</h2>
            <Select value={clientSortBy} onValueChange={(value) => setClientSortBy(value as ClientSortBy)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Client Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={clientSearchQuery}
              onChange={(e) => setClientSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Client Type Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setClientTypeFilter('All')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                clientTypeFilter === 'All'
                  ? "bg-selected-light border-brand-light hover-brand"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setClientTypeFilter('Individual')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center justify-center gap-1",
                clientTypeFilter === 'Individual'
                  ? "bg-selected-light border-brand-light hover-brand"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <User className="w-3 h-3" />
              Individual
            </button>
            <button
              onClick={() => setClientTypeFilter('Business')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center justify-center gap-1",
                clientTypeFilter === 'Business'
                  ? "bg-selected-light border-brand-light hover-brand"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Building2 className="w-3 h-3" />
              Business
            </button>
          </div>
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No clients found
              </div>
            ) : (
              filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleClientClick(client.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-md transition-all border",
                    selectedClientIds.includes(client.id)
                      ? "bg-selected-light border-brand-light"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {client.type === 'Individual' ? (
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {client.name}
                      </span>
                    </div>
                    {client.newDocumentCount > 0 && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white text-[10px] h-5 min-w-5 px-1.5 flex-shrink-0">
                        {client.newDocumentCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{client.documentCount} document{client.documentCount !== 1 ? 's' : ''}</span>
                    <span>{new Date(client.mostRecentDate.split(' ')[0]).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Document List */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Stats & Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-primary" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {totalDocuments} Document{totalDocuments !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {needsReview} need review • {reviewed} reviewed
                  </div>
                </div>
              </div>
              
              {hasOldDocuments && (
                <Alert className="py-2 px-3 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-xs text-amber-800 dark:text-amber-300 ml-2">
                    Documents from 2+ years ago detected
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Document
              </Button>
              
              {selectedDocuments.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Bulk Actions ({selectedDocuments.length})
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowBulkApproveDialog(true)}>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBulkYearDialog(true)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Update Year
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBulkTypeDialog(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Update Type
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowBulkDeleteDialog(true)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Document Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3" style={{ width: columnWidths.checkbox }}>
                  <Checkbox
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={toggleAllDocuments}
                  />
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300" style={{ width: columnWidths.document }}>
                  Document Name
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300" style={{ width: columnWidths.type }}>
                  Type
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300" style={{ width: columnWidths.year }}>
                  Year
                </th>
                <th 
                  className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                  style={{ width: columnWidths.received }}
                  onClick={() => handleSort('receivedDate')}
                >
                  <div className="flex items-center">
                    Received
                    {getSortIcon('receivedDate')}
                  </div>
                </th>
                <th 
                  className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                  style={{ width: columnWidths.method }}
                  onClick={() => handleSort('method')}
                >
                  <div className="flex items-center">
                    Method
                    {getSortIcon('method')}
                  </div>
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300" style={{ width: columnWidths.approveReject }}>
                  Approve/Reject
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700 dark:text-gray-300" style={{ width: columnWidths.actions }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No documents found for selected client(s)
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const docIsOldYear = isOldYear(doc.year);
                  const receivedDateTime = formatReceivedDate(doc.receivedDate);
                  return (
                  <tr 
                    key={doc.id} 
                    className={cn(
                      "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      docIsOldYear && "bg-amber-50/50 dark:bg-amber-900/10"
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="relative group/preview">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-xl flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
                            {doc.thumbnail}
                          </div>
                          {/* Preview on Hover */}
                          <div className="absolute left-0 top-12 z-50 hidden group-hover/preview:block">
                            <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                              <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center text-6xl">
                                {doc.thumbnail}
                              </div>
                              <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Document Preview</p>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {doc.name}
                          </div>
                          {docIsOldYear && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span className="text-xs text-amber-600 dark:text-amber-400">Old year document</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select 
                        value={doc.documentType} 
                        onValueChange={(value) => handleChangeDocumentType(doc.id, value)}
                      >
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="W2 Form">W2 Form</SelectItem>
                          <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                          <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                          <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                          <SelectItem value="Invoice">Invoice</SelectItem>
                          <SelectItem value="Receipt">Receipt</SelectItem>
                          <SelectItem value="Tax Return">Tax Return</SelectItem>
                          <SelectItem value="Payroll">Payroll</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select 
                        value={doc.year} 
                        onValueChange={(value) => handleChangeDocumentYear(doc.id, value)}
                      >
                        <SelectTrigger className="w-[100px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div>{receivedDateTime.date}</div>
                        {receivedDateTime.time && (
                          <div className="text-gray-500 dark:text-gray-400">{receivedDateTime.time}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {getMethodBadge(doc.method)}
                    </td>
                    <td className="p-3">
                      {doc.reviewStatus === null ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => handleApprove(doc.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleReject(doc.id)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs",
                            doc.reviewStatus === 'approved' 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {doc.reviewStatus === 'approved' ? (
                              <><Check className="w-3 h-3 mr-1" /> Approved</>
                            ) : (
                              <><X className="w-3 h-3 mr-1" /> Rejected</>
                            )}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ZoomIn className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <StickyNote className="w-4 h-4 mr-2" />
                            Add Note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Dialogs */}
      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent aria-describedby="bulk-approve-client-description">
          <DialogHeader>
            <DialogTitle>Approve Selected Documents</DialogTitle>
            <DialogDescription id="bulk-approve-client-description">
              Are you sure you want to approve {selectedDocuments.length} document(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkApprove} className="btn-primary">
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent aria-describedby="bulk-delete-client-description">
          <DialogHeader>
            <DialogTitle>Delete Selected Documents</DialogTitle>
            <DialogDescription id="bulk-delete-client-description">
              Are you sure you want to delete {selectedDocuments.length} document(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkDelete} variant="destructive">
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkYearDialog} onOpenChange={setShowBulkYearDialog}>
        <DialogContent aria-describedby="bulk-year-client-description">
          <DialogHeader>
            <DialogTitle>Update Year</DialogTitle>
            <DialogDescription id="bulk-year-client-description">
              Update the year for {selectedDocuments.length} selected document(s)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-year">Tax Year</Label>
            <Input
              id="bulk-year"
              value={bulkYear}
              onChange={(e) => setBulkYear(e.target.value)}
              placeholder="e.g., 2024"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkYearDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkYearUpdate} className="btn-primary" disabled={!bulkYear}>
              Update Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkTypeDialog} onOpenChange={setShowBulkTypeDialog}>
        <DialogContent aria-describedby="bulk-type-client-description">
          <DialogHeader>
            <DialogTitle>Update Document Type</DialogTitle>
            <DialogDescription id="bulk-type-client-description">
              Update the document type for {selectedDocuments.length} selected document(s)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-type">Document Type</Label>
            <Select value={bulkType} onValueChange={setBulkType}>
              <SelectTrigger id="bulk-type" className="mt-2">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Payroll">Payroll</SelectItem>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Tax Return">Tax Return</SelectItem>
                <SelectItem value="W2 Form">W2 Form</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkTypeUpdate} className="btn-primary" disabled={!bulkType}>
              Update Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}