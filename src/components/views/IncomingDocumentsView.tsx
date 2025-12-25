import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Download, Trash2, AlertCircle, Check, X, 
  Mail, MessageSquare, MoveRight, Edit, FileEdit, Search,
  ChevronDown, ChevronLeft, ChevronRight, StickyNote, Play, Ban, Calendar, Clock,
  ZoomIn, ZoomOut, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, ExternalLink,
  Maximize2, Minimize2
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

type DocumentMethod = 'Uploaded File' | 'Email' | 'Text Message';

type IncomingDocument = {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
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

type SortColumn = 'clientName' | 'receivedDate' | 'method' | null;
type SortDirection = 'asc' | 'desc';

export function IncomingDocumentsView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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
    client: 180,
    document: 280,
    type: 200,
    year: 120,
    received: 150,
    method: 150,
    approveReject: 200,
    actions: 120,
  });

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

  // Mock documents data
  const [documents, setDocuments] = useState<IncomingDocument[]>([
    {
      id: '1',
      name: '1099_Misc_2024.pdf',
      clientName: 'Abacus 360',
      clientId: '2',
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
      documentType: 'Other',
      year: '2024',
      receivedDate: '2024-10-20 07:15 PM',
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
  ]);

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
  const totalDocuments = documents.length;
  const needsReview = documents.filter(d => d.reviewStatus === null).length;
  const reviewed = documents.filter(d => d.reviewStatus !== null).length;
  const hasOldDocuments = documents.some(d => isOldYear(d.year));

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

  let filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Apply sorting
  if (sortColumn) {
    filteredDocuments = [...filteredDocuments].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortColumn === 'clientName') {
        aValue = a.clientName.toLowerCase();
        bValue = b.clientName.toLowerCase();
      } else if (sortColumn === 'receivedDate') {
        // Parse the date format "2024-10-12 11:45 AM"
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
        ? { ...doc, reviewStatus: 'rejected' as const, reviewedDate: new Date().toISOString(), reviewedBy: 'You' }
        : doc
    ));
    toast.success('Document rejected');
  };

  const handleChangeDocumentType = (docId: string, newType: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, documentType: newType } : doc
    ));
  };

  const handleChangeDocumentYear = (docId: string, newYear: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, year: newYear } : doc
    ));
  };

  const handleDownload = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    toast.success(`Downloading ${doc?.name}`);
  };

  const handleMove = (docId: string) => {
    toast.info('Move document dialog would open here');
  };

  const handleDelete = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(documents.filter(d => d.id !== docId));
    toast.success(`${doc?.name} deleted`);
  };

  const handleOpenNotes = (docId: string) => {
    setCurrentNoteDocId(docId);
    setNoteText(documentNotes[docId] || '');
    setShowNotesDialog(true);
  };

  const handleSaveNotes = () => {
    if (currentNoteDocId) {
      setDocumentNotes(prev => ({
        ...prev,
        [currentNoteDocId]: noteText,
      }));
      toast.success('Notes saved');
      setShowNotesDialog(false);
      setCurrentNoteDocId(null);
      setNoteText('');
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
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

  const handleBulkChangeYear = () => {
    if (bulkYear) {
      setDocuments(prev => prev.map(doc =>
        selectedDocuments.includes(doc.id) ? { ...doc, year: bulkYear } : doc
      ));
      toast.success(`Changed year for ${selectedDocuments.length} document(s)`);
      setSelectedDocuments([]);
      setBulkYear('');
      setShowBulkYearDialog(false);
    }
  };

  const handleBulkChangeType = () => {
    if (bulkType) {
      setDocuments(prev => prev.map(doc =>
        selectedDocuments.includes(doc.id) ? { ...doc, documentType: bulkType } : doc
      ));
      toast.success(`Changed type for ${selectedDocuments.length} document(s)`);
      setSelectedDocuments([]);
      setBulkType('');
      setShowBulkTypeDialog(false);
    }
  };

  const startReviewMode = () => {
    const docsToReview = documents.filter(d => d.reviewStatus === null);
    if (docsToReview.length === 0) {
      toast.error('No documents to review');
      return;
    }
    setCurrentReviewIndex(0);
    setShowReviewMode(true);
  };

  const handleExcludeDocumentType = () => {
    const currentDoc = getCurrentReviewDoc();
    if (currentDoc) {
      toast.success(`Future ${currentDoc.documentType} documents from emails will be excluded`);
      moveToNextDocument();
    }
  };

  const handleSaveDocumentName = () => {
    const currentDoc = getCurrentReviewDoc();
    if (currentDoc && tempDocumentName.trim()) {
      setDocuments(prev => prev.map(doc =>
        doc.id === currentDoc.id ? { ...doc, name: tempDocumentName } : doc
      ));
      setEditingDocumentName(false);
      toast.success('Document name updated');
    }
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

  // Review Mode Functions
  const getFilteredDocsToReview = () => {
    let docsToReview = documents.filter(d => d.reviewStatus === null);
    
    if (reviewByClient && currentReviewClient) {
      docsToReview = docsToReview.filter(d => d.clientName === currentReviewClient);
    }
    
    return docsToReview;
  };

  const getCurrentReviewDoc = () => {
    const docsToReview = getFilteredDocsToReview();
    return docsToReview[currentReviewIndex] || null;
  };

  const handleReviewApprove = () => {
    const currentDoc = getCurrentReviewDoc();
    if (currentDoc) {
      setDocuments(prev => prev.map(doc =>
        doc.id === currentDoc.id
          ? { ...doc, reviewStatus: 'approved' as const, reviewedDate: new Date().toISOString(), reviewedBy: 'You' }
          : doc
      ));
      toast.success(`${currentDoc.name} approved`);
      moveToNextDocument();
    }
  };

  const handleReviewReject = () => {
    const currentDoc = getCurrentReviewDoc();
    if (currentDoc && rejectionReason.trim()) {
      setDocuments(prev => prev.map(doc =>
        doc.id === currentDoc.id
          ? { 
              ...doc, 
              reviewStatus: 'rejected' as const, 
              rejectionReason, 
              reviewedDate: new Date().toISOString(), 
              reviewedBy: 'You' 
            }
          : doc
      ));
      toast.success(`${currentDoc.name} rejected`);
      setRejectionReason('');
      moveToNextDocument();
    }
  };

  const moveToNextDocument = () => {
    const docsToReview = getFilteredDocsToReview();
    if (currentReviewIndex >= docsToReview.length - 1) {
      if (reviewByClient && currentReviewClient) {
        toast.success(`All documents for ${currentReviewClient} reviewed!`);
        setReviewByClient(false);
        setCurrentReviewClient(null);
        setCurrentReviewIndex(0);
      } else {
        toast.success('All documents reviewed!');
        setShowReviewMode(false);
        setCurrentReviewIndex(0);
      }
    } else {
      setCurrentReviewIndex(prev => prev + 1);
    }
  };

  const goToPreviousDocument = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(prev => prev - 1);
      setRejectionReason('');
    }
  };

  const goToNextDocument = () => {
    const docsToReview = getFilteredDocsToReview();
    if (currentReviewIndex < docsToReview.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
      setRejectionReason('');
    }
  };

  const handleReviewThisClientFirst = () => {
    const currentDoc = getCurrentReviewDoc();
    if (currentDoc) {
      setReviewByClient(true);
      setCurrentReviewClient(currentDoc.clientName);
      setCurrentReviewIndex(0);
      toast.success(`Now reviewing all documents for ${currentDoc.clientName}`);
    }
  };

  const handleReviewAllClients = () => {
    setReviewByClient(false);
    setCurrentReviewClient(null);
    setCurrentReviewIndex(0);
    toast.success('Now reviewing all documents');
  };

  const currentDoc = getCurrentReviewDoc();
  const docsToReview = getFilteredDocsToReview();
  const allDocsToReview = documents.filter(d => d.reviewStatus === null);
  
  // Check if client has changed from previous document
  const getPreviousReviewDoc = () => {
    if (currentReviewIndex > 0) {
      return docsToReview[currentReviewIndex - 1];
    }
    return null;
  };
  
  const previousDoc = getPreviousReviewDoc();
  const clientChanged = previousDoc && currentDoc && previousDoc.clientName !== currentDoc.clientName;

  // Get client document counts
  const getClientDocumentCounts = () => {
    const counts: Record<string, number> = {};
    allDocsToReview.forEach(doc => {
      counts[doc.clientName] = (counts[doc.clientName] || 0) + 1;
    });
    return counts;
  };

  // REVIEW MODE - Full-page two-column layout
  if (showReviewMode && currentDoc) {
    const progressPercentage = ((currentReviewIndex + 1) / docsToReview.length) * 100;
    const receivedDateTime = formatReceivedDate(currentDoc.receivedDate);
    const clientDocCounts = getClientDocumentCounts();
    const currentClientDocCount = clientDocCounts[currentDoc.clientName] || 0;
    
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowReviewMode(false);
                  setCurrentReviewIndex(0);
                  setRejectionReason('');
                  setEditingDocumentName(false);
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-gray-900">Document Review Mode</h1>
                <p className="text-gray-500 mt-1">
                  Reviewing document {currentReviewIndex + 1} of {docsToReview.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDocument}
                disabled={currentReviewIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                {currentReviewIndex + 1} / {docsToReview.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextDocument}
                disabled={currentReviewIndex === docsToReview.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-500">
                {reviewByClient ? (
                  <span>Reviewing: <span className="font-medium text-purple-700">{currentReviewClient}</span></span>
                ) : (
                  <span>Reviewing: All Clients</span>
                )}
              </div>
              {reviewByClient ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleReviewAllClients}
                >
                  Review All Clients
                </Button>
              ) : null}
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{currentReviewIndex + 1} completed</span>
              <span>{docsToReview.length - currentReviewIndex - 1} remaining</span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 flex gap-6 pt-6 min-h-0">
          {/* LEFT - Document Preview */}
          <div className={`flex-1 bg-gray-50 rounded-xl border border-gray-200 flex flex-col p-6 ${
            isPreviewFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
          }`}>
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                  disabled={previewZoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">{previewZoom}%</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                  disabled={previewZoom >= 150}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                  title={isPreviewFullscreen ? "Exit fullscreen" : "View fullscreen"}
                >
                  {isPreviewFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {isPreviewFullscreen && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsPreviewFullscreen(false)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Document Preview */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-100 dark:bg-gray-900">
              <div 
                className="bg-white rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
                style={{ 
                  width: `${previewZoom}%`,
                  maxWidth: '100%'
                }}
              >
                <img 
                  src={getPreviewImage(currentDoc.documentType)}
                  alt={currentDoc.name}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* RIGHT - Controls Panel */}
          <div className="w-[400px] flex-shrink-0">
            <Card className="h-full flex flex-col border-gray-200/60">
              {/* Card Header */}
              <div className="p-5 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Review Document</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Client Change Alert */}
                {clientChanged && (
                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <span className="font-medium">New Client</span>
                      <br />
                      Now reviewing documents for {currentDoc.clientName}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Document Info */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Client</Label>
                      {currentClientDocCount > 1 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {currentClientDocCount} docs
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{currentDoc.clientName}</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Document Name</Label>
                      {!editingDocumentName && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setEditingDocumentName(true);
                            setTempDocumentName(currentDoc.name);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {editingDocumentName ? (
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={tempDocumentName}
                          onChange={(e) => setTempDocumentName(e.target.value)}
                          className="h-9"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-9 bg-gradient-to-br from-purple-600 to-purple-700"
                          onClick={handleSaveDocumentName}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9"
                          onClick={() => setEditingDocumentName(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1 text-sm font-medium text-gray-900">{currentDoc.name}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={currentDoc.documentType} 
                        onValueChange={(value) => handleChangeDocumentType(currentDoc.id, value)}
                      >
                        <SelectTrigger className="mt-1 h-9">
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
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Year</Label>
                      <Select 
                        value={currentDoc.year} 
                        onValueChange={(value) => handleChangeDocumentYear(currentDoc.id, value)}
                      >
                        <SelectTrigger className="mt-1 h-9">
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
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider">Received</Label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {receivedDateTime.date}
                        {receivedDateTime.time && (
                          <>
                            {' '}<span className="text-gray-400">|</span>{' '}
                            {receivedDateTime.time}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wider">Method</Label>
                    <div className="mt-2">{getMethodBadge(currentDoc.method)}</div>
                  </div>
                </div>

                <Separator />

                {/* Review Actions */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason (optional)</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="e.g., Document is blurry, missing signature..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    {!reviewByClient && currentClientDocCount > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        onClick={handleReviewThisClientFirst}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Review all {currentClientDocCount} docs from this client first
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleReviewApprove}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleReviewReject}
                        disabled={!rejectionReason.trim()}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={moveToNextDocument}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Skip for Now
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Additional Actions */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">More Actions</Label>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9"
                    size="sm"
                    onClick={() => handleDownload(currentDoc.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9"
                    size="sm"
                    onClick={() => handleOpenNotes(currentDoc.id)}
                  >
                    <StickyNote className="w-4 h-4 mr-2" />
                    Add Notes
                  </Button>

                  {currentDoc.method === 'Email' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-9 border-orange-200 text-orange-700 hover:bg-orange-50"
                      size="sm"
                      onClick={handleExcludeDocumentType}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Exclude from Email Import
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 border-red-200 text-red-700 hover:bg-red-50"
                    size="sm"
                    onClick={() => {
                      handleDelete(currentDoc.id);
                      if (docsToReview.length > 1) {
                        // If there are more documents, move to the next one
                        if (currentReviewIndex < docsToReview.length - 1) {
                          // Don't increment index since we just deleted current doc
                        } else {
                          // We were on the last doc, go back one
                          setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1));
                        }
                      } else {
                        // No more documents to review, exit review mode
                        setShowReviewMode(false);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Document
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL LIST VIEW
  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{totalDocuments}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-purple-200 bg-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{needsReview}</div>
              <div className="text-sm text-gray-600">Needs Review</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{reviewed}</div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Old Documents Alert */}
      {hasOldDocuments && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <span className="font-medium">Old Documents Detected</span>
            <br />
            You have documents from 2 or more years ago. Please review and update year if necessary. If old year is correct, after approval it will be filed into prior year(s).
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents, clients, or types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border border-gray-200 dark:border-gray-700"
          />
        </div>
        <Button
          onClick={startReviewMode}
          className="bg-gradient-to-br from-purple-600 to-purple-700 flex-shrink-0"
          disabled={documents.filter(d => d.reviewStatus === null).length === 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Review Mode
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDocuments.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-purple-900">
                {selectedDocuments.length} document(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocuments([])}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkApproveDialog(true)}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkYearDialog(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Change Year
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkTypeDialog(true)}
              >
                <FileEdit className="w-4 h-4 mr-2" />
                Change Document Type
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Documents Table */}
      <Card className="border-gray-200/60">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th style={{ width: `${columnWidths.checkbox}px` }} className="text-left p-4">
                  <Checkbox
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: `${columnWidths.client}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.client, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        client: prev.client + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={100}
                  >
                    <div 
                      className="text-left p-4 text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:text-gray-900 flex items-center select-none"
                      onClick={() => handleSort('clientName')}
                    >
                      Client
                      {getSortIcon('clientName')}
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.document}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.document, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        document: prev.document + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={150}
                  >
                    <div className="text-left p-4 text-xs uppercase tracking-wider text-gray-600">
                      Document
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.type}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.type, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        type: prev.type + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={120}
                  >
                    <div className="text-left p-4 text-xs uppercase tracking-wider text-gray-600">
                      Document Type
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.year}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.year, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        year: prev.year + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={100}
                  >
                    <div className="text-left p-4 text-xs uppercase tracking-wider text-gray-600">
                      Year
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.received}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.received, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        received: prev.received + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={100}
                  >
                    <div 
                      className="text-left p-4 text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:text-gray-900 flex items-center select-none"
                      onClick={() => handleSort('receivedDate')}
                    >
                      Received
                      {getSortIcon('receivedDate')}
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.method}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.method, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        method: prev.method + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={100}
                  >
                    <div 
                      className="text-left p-4 text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:text-gray-900 flex items-center select-none"
                      onClick={() => handleSort('method')}
                    >
                      Method
                      {getSortIcon('method')}
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.approveReject}px`, position: 'relative' }}>
                  <Resizable
                    size={{ width: columnWidths.approveReject, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                      setColumnWidths(prev => ({
                        ...prev,
                        approveReject: prev.approveReject + d.width
                      }));
                    }}
                    enable={{ right: true }}
                    minWidth={150}
                  >
                    <div className="text-left p-4 text-xs uppercase tracking-wider text-gray-600">
                      Approve/Reject
                    </div>
                  </Resizable>
                </th>
                <th style={{ width: `${columnWidths.actions}px` }} className="text-left p-4 text-xs uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => {
                const docIsOldYear = isOldYear(doc.year);
                const receivedDateTime = formatReceivedDate(doc.receivedDate);
                return (
                <tr 
                  key={doc.id} 
                  className={cn(
                    "border-b border-gray-100 hover:bg-gray-50/50",
                    docIsOldYear && "bg-yellow-50/50 border-yellow-200"
                  )}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={() => handleSelectDocument(doc.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 group">
                      <div className="text-sm text-gray-900">{doc.clientName}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clients?clientId=${doc.clientId}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
                        title="Open client folder"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
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
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.name}</div>
                        {docIsOldYear && (
                          <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                            Old
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
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
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
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
                  <td className="p-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <div>{receivedDateTime.date}</div>
                      {receivedDateTime.time && (
                        <div className="text-gray-500 dark:text-gray-400">{receivedDateTime.time}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {getMethodBadge(doc.method)}
                  </td>
                  <td className="p-4">
                    {doc.reviewStatus === null ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(doc.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(doc.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          doc.reviewStatus === 'approved' && "bg-green-50 text-green-700 border-green-200",
                          doc.reviewStatus === 'rejected' && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {doc.reviewStatus === 'approved' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Approved
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Rejected
                          </>
                        )}
                      </Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleOpenNotes(doc.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMove(doc.id)}>
                          <MoveRight className="w-4 h-4 mr-2" />
                          Move to Client
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenNotes(doc.id)}>
                          <StickyNote className="w-4 h-4 mr-2" />
                          Add Notes
                        </DropdownMenuItem>
                        {doc.method === 'Email' && (
                          <DropdownMenuItem 
                            onClick={() => {
                              toast.success(`Excluding ${doc.documentType} from future email imports`);
                            }}
                            className="text-orange-700"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Exclude from Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent aria-describedby="document-notes-description">
          <DialogHeader>
            <DialogTitle>Document Notes</DialogTitle>
            <DialogDescription id="document-notes-description">
              Add notes or comments about this document for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your notes here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNotes}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Dialog */}
      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent aria-describedby="bulk-approve-description">
          <DialogHeader>
            <DialogTitle>Approve Documents</DialogTitle>
            <DialogDescription id="bulk-approve-description">
              Are you sure you want to approve {selectedDocuments.length} document(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve {selectedDocuments.length} Document(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent aria-describedby="bulk-delete-description">
          <DialogHeader>
            <DialogTitle>Delete Documents</DialogTitle>
            <DialogDescription id="bulk-delete-description">
              Are you sure you want to delete {selectedDocuments.length} document(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedDocuments.length} Document(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Change Year Dialog */}
      <Dialog open={showBulkYearDialog} onOpenChange={setShowBulkYearDialog}>
        <DialogContent aria-describedby="bulk-year-description">
          <DialogHeader>
            <DialogTitle>Change Document Year</DialogTitle>
            <DialogDescription id="bulk-year-description">
              Change the year for {selectedDocuments.length} document(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Year</Label>
            <Select value={bulkYear} onValueChange={setBulkYear}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkYearDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkChangeYear}
              disabled={!bulkYear}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Change Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Change Type Dialog */}
      <Dialog open={showBulkTypeDialog} onOpenChange={setShowBulkTypeDialog}>
        <DialogContent aria-describedby="bulk-type-description">
          <DialogHeader>
            <DialogTitle>Change Document Type</DialogTitle>
            <DialogDescription id="bulk-type-description">
              Change the type for {selectedDocuments.length} document(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Document Type</Label>
            <Select value={bulkType} onValueChange={setBulkType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="W2 Form">W2 Form</SelectItem>
                <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Tax Return">Tax Return</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkTypeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkChangeType}
              disabled={!bulkType}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Change Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
