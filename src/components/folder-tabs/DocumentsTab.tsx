import { useState, useMemo, useEffect } from 'react';
import { Client } from '../../App';
import { 
  FileText, Upload, Download, Trash2, FolderOpen, CheckCircle, Clock, AlertCircle,
  MoreVertical, Edit, MoveRight, Search, Filter, ArrowUpDown, ChevronDown, Eye,
  Folder, Mail, MessageSquare, Plus, Check, Grid, List, UserPlus, X, Settings, FileEdit,
  CheckCircle2, LayoutGrid, Users, Building2, User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { MoveDocumentDialog } from '../dialogs/MoveDocumentDialog';

type DocumentsTabProps = {
  client: Client;
};

type DocumentMethod = 'Uploaded File' | 'Email' | 'Text Message';

type Document = {
  id: string;
  name: string;
  documentType: string;
  year: string;
  receivedDate: string | null;
  reviewedDate: string | null;
  reviewedBy: string | null;
  method: DocumentMethod | null;
  thumbnail: string;
  aiTags: string[];
  status: 'received' | 'pending' | 'reviewing';
  requestedDate?: string;
  clientId?: string;
  clientName?: string;
  clientType?: 'Individual' | 'Business';
};

type DocumentTemplate = {
  id: string;
  name: string;
  category: string;
  required: boolean;
  recurring: boolean; // if true, required every year
};

type FolderTemplate = {
  id: string;
  name: string;
  subfolders: string[];
};

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  documentCount: number;
  newDocumentCount: number;
  mostRecentDate: string;
  linkedAccounts?: string[];
};

export function DocumentsTab({ client }: DocumentsTabProps) {
  const [viewMode, setViewMode] = useState<'submitted' | 'filemanager' | 'checklist'>('submitted');
  // View mode for table/split view (separate from main viewMode)
  const [tableViewMode, setTableViewMode] = useState<'table' | 'split'>(() => {
    const saved = localStorage.getItem('documentsTabViewMode');
    return (saved === 'split' || saved === 'table') ? saved : 'table';
  });
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(client.id);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('documentsTabViewMode', tableViewMode);
  }, [tableViewMode]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'pending' | 'reviewing'>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddChecklistDialog, setShowAddChecklistDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editFormData, setEditFormData] = useState({ documentType: '', year: '' });
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({
    '1': 'Verified with employer records',
    '4': 'Urgent - needed for property tax deduction',
  });

  // Mock linked accounts data
  const mockLinkedAccounts: ClientSummary[] = [
    {
      id: client.id,
      name: client.name,
      type: client.type,
      documentCount: 7,
      newDocumentCount: 2,
      mostRecentDate: '2024-11-28',
      linkedAccounts: ['linked-1', 'linked-2'],
    },
    {
      id: 'linked-1',
      name: client.type === 'Individual' ? `${client.name} - Spouse` : `${client.name} - Business Account`,
      type: client.type === 'Individual' ? 'Individual' : 'Business',
      documentCount: 5,
      newDocumentCount: 1,
      mostRecentDate: '2024-11-25',
      linkedAccounts: [client.id],
    },
    {
      id: 'linked-2',
      name: client.type === 'Individual' ? `${client.name} - Business` : `${client.name} - Trust`,
      type: 'Business',
      documentCount: 3,
      newDocumentCount: 0,
      mostRecentDate: '2024-11-20',
      linkedAccounts: [client.id],
    },
  ];

  // Mock all clients for MoveDocumentDialog
  const allClients: ClientSummary[] = [
    ...mockLinkedAccounts,
    {
      id: 'other-1',
      name: 'Other Client 1',
      type: 'Individual',
      documentCount: 10,
      newDocumentCount: 2,
      mostRecentDate: '2024-11-27',
    },
    {
      id: 'other-2',
      name: 'Other Business LLC',
      type: 'Business',
      documentCount: 8,
      newDocumentCount: 1,
      mostRecentDate: '2024-11-26',
    },
  ];

  // Get current client summary
  const currentClientSummary = mockLinkedAccounts.find(c => c.id === client.id) || mockLinkedAccounts[0];
  const hasLinkedAccounts = currentClientSummary?.linkedAccounts && currentClientSummary.linkedAccounts.length > 0;

  // Get accounts to show in switcher
  const accountsToShow = useMemo(() => {
    if (!currentClientSummary || !hasLinkedAccounts) return [];

    const allLinkedAccountIds = [
      currentClientSummary.id,
      ...(currentClientSummary.linkedAccounts || [])
    ];

    return allLinkedAccountIds
      .map((id: string) => mockLinkedAccounts.find((c: ClientSummary) => c.id === id))
      .filter((a): a is ClientSummary => Boolean(a));
  }, [currentClientSummary, hasLinkedAccounts]);

  // Handle account switching
  const handleAccountSwitch = (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowLinkedAccounts(false);
    setSearchQuery('');
  };

  // Handle "All Accounts" selection
  const handleAllAccounts = () => {
    if (!currentClientSummary) return;
    setShowLinkedAccounts(true);
    setSelectedAccountId('');
    setSearchQuery('');
  };

  // Determine current display name for the dropdown button
  const currentAccountDisplayName = useMemo(() => {
    if (showLinkedAccounts) {
      return "All Accounts";
    }
    const selectedAccount = accountsToShow.find(a => a.id === selectedAccountId);
    return selectedAccount?.name || client.name;
  }, [showLinkedAccounts, selectedAccountId, accountsToShow, client.name]);

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'W2_Form_2024.pdf',
      documentType: 'W2 Form',
      year: '2024',
      receivedDate: '2024-10-15 09:23 AM',
      reviewedDate: '2024-10-16 02:15 PM',
      reviewedBy: 'Sarah Johnson',
      method: 'Uploaded File',
      thumbnail: '📄',
      aiTags: ['Tax Form', 'W2', 'Income'],
      status: 'received',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '2',
      name: '1099_Misc_2024.pdf',
      documentType: '1099-MISC',
      year: '2024',
      receivedDate: '2024-10-12 11:45 AM',
      reviewedDate: null,
      reviewedBy: null,
      method: 'Email',
      thumbnail: '📄',
      aiTags: ['Tax Form', '1099', 'Self-Employment'],
      status: 'reviewing',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '3',
      name: 'Bank_Statement_Sept.pdf',
      documentType: 'Bank Statement',
      year: '2024',
      receivedDate: '2024-10-10 03:12 PM',
      reviewedDate: '2024-10-11 09:30 AM',
      reviewedBy: 'Mike Brown',
      method: 'Text Message',
      thumbnail: '📄',
      aiTags: ['Banking', 'Statement', 'September'],
      status: 'received',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '4',
      name: 'Property_Tax_Bill.pdf',
      documentType: 'Property Tax Bill',
      year: '2024',
      receivedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      method: null,
      thumbnail: '📄',
      aiTags: [],
      status: 'pending',
      requestedDate: '2024-10-01',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '5',
      name: 'Charitable_Donations.pdf',
      documentType: 'Donation Receipt',
      year: '2024',
      receivedDate: null,
      reviewedDate: null,
      reviewedBy: null,
      method: null,
      thumbnail: '📄',
      aiTags: [],
      status: 'pending',
      requestedDate: '2024-09-28',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '6',
      name: 'W2_Form_2023.pdf',
      documentType: 'W2 Form',
      year: '2023',
      receivedDate: '2024-10-20 02:15 PM',
      reviewedDate: null,
      reviewedBy: null,
      method: 'Uploaded File',
      thumbnail: '📄',
      aiTags: ['Tax Form', 'W2', 'Income'],
      status: 'reviewing',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    {
      id: '7',
      name: 'Amended_Return_2023.pdf',
      documentType: 'Invoice',
      year: '2023',
      receivedDate: '2024-10-18 10:30 AM',
      reviewedDate: null,
      reviewedBy: null,
      method: 'Email',
      thumbnail: '📄',
      aiTags: ['Tax Form', 'Amended'],
      status: 'reviewing',
      clientId: client.id,
      clientName: client.name,
      clientType: client.type,
    },
    // Add some documents for linked accounts if they exist
    ...(hasLinkedAccounts ? [
      {
        id: '8',
        name: 'Linked_Account_Doc_1.pdf',
        documentType: 'W2 Form',
        year: '2024',
        receivedDate: '2024-11-01 10:00 AM',
        reviewedDate: null,
        reviewedBy: null,
        method: 'Uploaded File',
        thumbnail: '📄',
        aiTags: ['Tax Form'],
        status: 'reviewing',
        clientId: 'linked-1',
        clientName: mockLinkedAccounts.find(c => c.id === 'linked-1')?.name || 'Linked Account',
        clientType: mockLinkedAccounts.find(c => c.id === 'linked-1')?.type || 'Individual',
      },
      {
        id: '9',
        name: 'Linked_Account_Doc_2.pdf',
        documentType: '1099-MISC',
        year: '2024',
        receivedDate: '2024-11-05 02:00 PM',
        reviewedDate: '2024-11-06 09:00 AM',
        reviewedBy: 'Sarah Johnson',
        method: 'Email',
        thumbnail: '📄',
        aiTags: ['Tax Form'],
        status: 'received',
        clientId: 'linked-2',
        clientName: mockLinkedAccounts.find(c => c.id === 'linked-2')?.name || 'Linked Account',
        clientType: mockLinkedAccounts.find(c => c.id === 'linked-2')?.type || 'Business',
      },
    ] : []),
  ]);

  // Document checklist/template - what docs clients should have
  const [documentChecklist, setDocumentChecklist] = useState<DocumentTemplate[]>([
    { id: '1', name: 'W2 Forms', category: 'Income', required: true, recurring: true },
    { id: '2', name: '1099 Forms', category: 'Income', required: true, recurring: true },
    { id: '3', name: 'Bank Statements', category: 'Financial', required: true, recurring: true },
    { id: '4', name: 'Investment Statements', category: 'Financial', required: false, recurring: true },
    { id: '5', name: 'Property Tax Bills', category: 'Deductions', required: false, recurring: true },
    { id: '6', name: 'Charitable Donations', category: 'Deductions', required: false, recurring: true },
    { id: '7', name: 'Business Expenses', category: 'Business', required: false, recurring: true },
  ]);

  // Folder templates for file manager
  const [folderTemplates, setFolderTemplates] = useState<FolderTemplate[]>([
    {
      id: '1',
      name: '2024 Tax Year',
      subfolders: ['Income Documents', 'Deductions', 'Receipts', 'Correspondence']
    },
    {
      id: '2',
      name: 'Banking',
      subfolders: ['Statements', 'Cancelled Checks', 'Wire Transfers']
    },
    {
      id: '3',
      name: 'Business',
      subfolders: ['Invoices', 'Expenses', 'Payroll', 'Contracts']
    },
  ]);

  // Handle download all
  const handleDownloadAll = () => {
    if (filteredDocs.length === 0) {
      toast.error('No documents available to download');
      return;
    }
    toast.success(`Downloading all ${filteredDocs.length} document${filteredDocs.length > 1 ? 's' : ''}...`);
    // Here you would handle the actual download of all documents
  };

  // Handle move document
  const handleMoveDocument = (docId: string, newClientId: string) => {
    setDocuments((prev: Document[]) => prev.map((doc: Document) => 
      doc.id === docId 
        ? { ...doc, clientId: newClientId, clientName: allClients.find((c: ClientSummary) => c.id === newClientId)?.name || doc.clientName, clientType: allClients.find((c: ClientSummary) => c.id === newClientId)?.type || doc.clientType }
        : doc
    ));
    toast.success('Document moved successfully');
    setShowMoveDialog(false);
    setSelectedDoc(null);
  };

  const receivedDocs = documents.filter(d => d.status === 'received');
  const pendingDocs = documents.filter(d => d.status === 'pending');
  const needReviewDocs = documents.filter(d => d.status === 'reviewing');

  // Filter documents by account first
  const accountFilteredDocs = useMemo(() => {
    if (showLinkedAccounts) {
      // Show all linked accounts' documents
      const linkedIds = currentClientSummary?.linkedAccounts || [];
      return documents.filter((d: Document) => 
        d.clientId === client.id || 
        (d.clientId && linkedIds.includes(d.clientId))
      );
    } else if (selectedAccountId) {
      // Show only selected account's documents
      return documents.filter((d: Document) => d.clientId === selectedAccountId);
    }
    // Default: show current client's documents
    return documents.filter((d: Document) => d.clientId === client.id);
  }, [documents, showLinkedAccounts, selectedAccountId, client.id, currentClientSummary]);

  // Apply search filter
  const searchFilteredDocs = useMemo(() => {
    if (!searchQuery) return accountFilteredDocs;
    const query = searchQuery.toLowerCase();
    return accountFilteredDocs.filter((doc: Document) =>
      doc.name.toLowerCase().includes(query) ||
      doc.documentType.toLowerCase().includes(query) ||
      doc.aiTags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [accountFilteredDocs, searchQuery]);

  // Apply status and year filters
  let filteredDocs: Document[] = [];
  
  // Special handling for different status filters
  if (statusFilter === 'reviewing') {
    // "Needs Review" shows ALL unreviewed documents regardless of year
    filteredDocs = searchFilteredDocs.filter((d: Document) => d.status === 'reviewing');
  } else if (statusFilter === 'all') {
    // "All" view shows all unreviewed documents + documents from selected year
    const unreviewedDocs = searchFilteredDocs.filter((d: Document) => d.reviewedDate === null);
    if (selectedYear === 'all') {
      filteredDocs = searchFilteredDocs;
    } else {
      // Show unreviewed from all years + reviewed from selected year
      const selectedYearDocs = searchFilteredDocs.filter((d: Document) => d.year === selectedYear);
      const otherYearUnreviewed = unreviewedDocs.filter((d: Document) => d.year !== selectedYear);
      filteredDocs = [...new Set([...selectedYearDocs, ...otherYearUnreviewed])];
    }
  } else {
    // Other status filters (received, pending) apply year filter normally
    filteredDocs = selectedYear === 'all' 
      ? searchFilteredDocs.filter((d: Document) => d.status === statusFilter)
      : searchFilteredDocs.filter((d: Document) => d.year === selectedYear && d.status === statusFilter);
  }

  // Group documents by account for split view
  const accountGroups = useMemo(() => {
    if (tableViewMode !== 'split') return [];
    
    const groups = new Map<string, { accountId: string; accountName: string; clientType: 'Individual' | 'Business' }>();
    
    filteredDocs.forEach((doc: Document) => {
      if (!doc.clientId) return;
      const account = mockLinkedAccounts.find((c: ClientSummary) => c.id === doc.clientId) || {
        id: doc.clientId,
        name: doc.clientName || 'Unknown',
        type: doc.clientType || 'Individual',
      };
      
      if (!groups.has(doc.clientId)) {
        groups.set(doc.clientId, {
          accountId: doc.clientId,
          accountName: account.name,
          clientType: account.type,
        });
      }
    });
    
    return Array.from(groups.values());
  }, [filteredDocs, tableViewMode, mockLinkedAccounts]);

  // Check if there are any Individual (spouse-linked) accounts
  const hasIndividualAccounts = useMemo(() => {
    return accountGroups.some((group: { clientType: 'Individual' | 'Business' }) => group.clientType === 'Individual');
  }, [accountGroups]);

  // Effect: Auto-switch to Table View if in Split View but no Individual accounts
  useEffect(() => {
    if (tableViewMode === 'split' && !hasIndividualAccounts && accountGroups.length > 1) {
      setTableViewMode('table');
      toast.info('Split View is only available for spouse-linked accounts');
    }
  }, [tableViewMode, hasIndividualAccounts, accountGroups.length]);

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments((prev: string[]) => 
      prev.includes(id) ? prev.filter((docId: string) => docId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocs.map(d => d.id));
    }
  };

  const getMethodBadge = (method: DocumentMethod | null) => {
    if (!method) return null;
    
    const methodConfig = {
      'Uploaded File': { icon: Upload, color: 'bg-purple-50 text-purple-700 border-purple-200' },
      'Email': { icon: Mail, color: 'bg-blue-50 text-blue-700 border-blue-200' },
      'Text Message': { icon: MessageSquare, color: 'bg-green-50 text-green-700 border-green-200' },
    };

    const config = methodConfig[method];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {method}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return null;
    
    const date = new Date(dateTimeStr);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    return { date: dateStr, time: timeStr };
  };

  // Helper function to render table header
  const renderTableHeader = () => {
    // Determine if client column should be shown (only in table view when viewing multiple clients)
    const showClientColumn = showLinkedAccounts || accountGroups.length > 1;
    
    return (
      <thead className="bg-gray-50/50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left w-12">
            <Checkbox 
              checked={selectedDocuments.length === filteredDocs.length && filteredDocs.length > 0}
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
    );
  };

  // Helper function to render document row
  const renderDocumentRow = (doc: Document) => {
    const isDifferentYear = selectedYear !== 'all' && doc.year !== selectedYear;
    const isUnreviewed = doc.reviewedDate === null;
    
    // Check if document belongs to a linked spouse account
    const isLinkedSpouseDoc = showLinkedAccounts && currentClientSummary && doc.clientId && 
      currentClientSummary.linkedAccounts?.includes(doc.clientId) && 
      doc.clientId !== client.id;
    
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
        {(showLinkedAccounts || accountGroups.length > 1) && (
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              {doc.clientType === 'Business' ? (
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {doc.clientName || 'Unknown'}
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
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatDateTime(doc.reviewedDate)?.date}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(doc.reviewedDate)?.time} • {doc.reviewedBy}
              </div>
            </div>
          ) : doc.status === 'reviewing' ? (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                onClick={() => {
                  setSelectedDoc(doc);
                  setShowApproveDialog(true);
                }}
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
                {doc.status === 'reviewing' && (
                  <>
                    <DropdownMenuItem onClick={() => {
                      setSelectedDoc(doc);
                      setShowApproveDialog(true);
                    }}>
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
                  setSelectedDoc(doc);
                  setShowMoveDialog(true);
                }}>
                  <MoveRight className="w-4 h-4 mr-2" />
                  Move to User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedDoc(doc);
                  setEditFormData({ documentType: doc.documentType, year: doc.year });
                  setShowEditDialog(true);
                }}>
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
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">


        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setViewMode('submitted')}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-all",
              viewMode === 'submitted'
                ? "border-purple-600 text-purple-700 bg-purple-50/50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Client Submissions
            <Badge variant="secondary" className="ml-2">
              {documents.length}
            </Badge>
          </button>
          <button
            onClick={() => setViewMode('filemanager')}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-all",
              viewMode === 'filemanager'
                ? "border-purple-600 text-purple-700 bg-purple-50/50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            File Manager
          </button>
          <button
            onClick={() => setViewMode('checklist')}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-all",
              viewMode === 'checklist'
                ? "border-purple-600 text-purple-700 bg-purple-50/50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Check className="w-4 h-4 inline mr-2" />
            Document Checklist
            <Badge variant="secondary" className="ml-2">
              {documentChecklist.length}
            </Badge>
          </button>
        </div>

        {/* Client Submissions View */}
        {viewMode === 'submitted' && (
          <div className="space-y-4">
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
                  Needs Review ({needReviewDocs.length})
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
                  <Clock className="w-3.5 h-3.5" />
                  Requested ({pendingDocs.length})
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
                  Approved ({receivedDocs.length})
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
                      <p className="text-2xl font-semibold text-green-600 mt-1">{receivedDocs.length}</p>
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
                      <p className="text-2xl font-semibold text-orange-600 mt-1">{pendingDocs.length}</p>
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
                      <p className="text-2xl font-semibold text-blue-600 mt-1">{needReviewDocs.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                                  </div>
                          </div>
                </CardContent>
              </Card>
                  </div>

            {/* View Toggle Row - Only show if multiple accounts and Individual accounts exist */}
                {accountGroups.length > 1 && hasIndividualAccounts && (
              <div className="flex items-center justify-end gap-2 flex-wrap">
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                    <Button
                      size="sm"
                      variant={tableViewMode === 'table' ? 'default' : 'ghost'}
                      className={cn(
                        "gap-1.5 h-7 px-3 text-xs",
                        tableViewMode === 'table' 
                          ? "text-white" 
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                      style={tableViewMode === 'table' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      onClick={() => setTableViewMode('table')}
                    >
                      <List className="w-3.5 h-3.5" />
                      Table View
                    </Button>
                    <Button
                      size="sm"
                      variant={tableViewMode === 'split' ? 'default' : 'ghost'}
                      className={cn(
                        "gap-1.5 h-7 px-3 text-xs",
                        tableViewMode === 'split'
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                      style={tableViewMode === 'split' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      onClick={() => setTableViewMode('split')}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Split View
                    </Button>
                  </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg p-3">
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
                      {!showLinkedAccounts && selectedAccountId && (
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
                      onSelect={(e) => {
                        e.preventDefault();
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
                      const isActive = selectedAccountId === account.id && !showLinkedAccounts;
                      return (
                        <DropdownMenuItem
                          key={account.id}
                          className="cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
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
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <div className="flex">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={selectedDocuments.length === 0}
                      onClick={() => {
                        if (selectedDocuments.length > 0) {
                          toast.success(`Downloading ${selectedDocuments.length} document${selectedDocuments.length !== 1 ? 's' : ''}...`);
                        }
                      }}
                      className="rounded-r-none border-r-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {selectedDocuments.length > 0 ? `(${selectedDocuments.length})` : ''}
                    </Button>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={filteredDocs.length === 0}
                        className="rounded-l-none px-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </div>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleDownloadAll}
                      disabled={filteredDocs.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All ({filteredDocs.length} documents)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            {selectedYear !== 'all' && filteredDocs.some(d => d.year !== selectedYear && d.reviewedDate === null) && (
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

            {/* Documents Table or Split View */}
            {tableViewMode === 'table' ? (
              <Card className="border-gray-200/60">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {renderTableHeader()}
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocs.map((doc) => renderDocumentRow(doc))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : tableViewMode === 'split' && hasIndividualAccounts ? (
              // Split View - Group by Account (only available for Individual/spouse-linked accounts)
              <div className="space-y-6">
                {accountGroups.length === 0 ? (
                  <Card className="border-gray-200/60 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No documents found</p>
                  </Card>
                ) : (
                  accountGroups.map((account: { accountId: string; accountName: string; clientType: 'Individual' | 'Business' }) => {
                    // Get account's documents from the filtered docs
                    const accountDocs = filteredDocs.filter((doc: Document) => doc.clientId === account.accountId);

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
                              {accountDocs.length} document{accountDocs.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>

                        {/* Account's Documents Table */}
                        <Card className="border-gray-200/60">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              {renderTableHeader()}
                              <tbody className="divide-y divide-gray-200">
                                {accountDocs.map((doc) => renderDocumentRow(doc))}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </div>
                    );
                  })
                )}
              </div>
            ) : tableViewMode === 'split' && !hasIndividualAccounts ? (
              // Fallback when Split View is not available (only Business accounts)
              <Card className="border-gray-200/60 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Split View is only available for spouse-linked accounts</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Switch to Table View to see all documents
                </p>
              </Card>
            ) : null}
          </div>
        )}

        {/* File Manager View */}
        {viewMode === 'filemanager' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Organized client documents in folder structure
              </p>
              <Button 
                variant="outline"
                onClick={() => setShowFolderDialog(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>

            {/* Folder Structure */}
            <div className="grid grid-cols-1 gap-3">
              {folderTemplates.map((folder) => (
                <Card key={folder.id} className="border-gray-200/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Folder className="w-5 h-5 text-purple-600" />
                        {folder.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {folder.subfolders.length} subfolders
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {folder.subfolders.map((subfolder, idx) => (
                        <div key={idx} className="ml-6">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <FolderOpen className="w-4 h-4 text-gray-400" />
                            {subfolder}
                          </div>
                          {/* Mock files in subfolder */}
                          <div className="ml-6 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-600 cursor-pointer py-1">
                              <FileText className="w-3 h-3" />
                              Sample_Document_{idx + 1}.pdf
                              <span className="text-gray-400">•</span>
                              <span>2.3 MB</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {folderTemplates.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-12 pb-12 text-center">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No folder structure yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create folder templates to organize client documents
                  </p>
                  <Button onClick={() => setShowFolderDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Folder Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Document Checklist View */}
        {viewMode === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Manage required documents for {client.name} • {selectedYear}
              </p>
              <Button 
                onClick={() => setShowAddChecklistDialog(true)}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {documentChecklist.map((item) => (
                <Card key={item.id} className="border-gray-200/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.required && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                              Required
                            </Badge>
                          )}
                          {item.recurring && (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Annual
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Input 
                            placeholder="Add notes for this document..." 
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approve Document Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent aria-describedby="approve-document-description">
            <DialogHeader>
              <DialogTitle>Review & Approve Document</DialogTitle>
              <DialogDescription id="approve-document-description">
                Mark {selectedDoc?.name} as reviewed and approved
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document:</span>
                    <span className="font-medium text-gray-900">{selectedDoc?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{selectedDoc?.documentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Received:</span>
                    <span className="font-medium text-gray-900">
                      {selectedDoc?.receivedDate && formatDateTime(selectedDoc.receivedDate)?.date} at {selectedDoc?.receivedDate && formatDateTime(selectedDoc.receivedDate)?.time}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Review Notes (Optional)</Label>
                <Textarea placeholder="Add any notes about this document..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Document Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent aria-describedby="reject-document-description">
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription id="reject-document-description">
                Reject {selectedDoc?.name} and notify client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document:</span>
                    <span className="font-medium text-gray-900">{selectedDoc?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{selectedDoc?.documentType}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Reason for Rejection <span className="text-red-600">*</span></Label>
                <Textarea 
                  placeholder="Explain why this document is being rejected..." 
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Client will be notified with this message</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <X className="w-4 h-4 mr-2" />
                Reject & Notify Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent aria-describedby="edit-document-description">
            <DialogHeader>
              <DialogTitle>Edit Document Details</DialogTitle>
              <DialogDescription id="edit-document-description">
                Update document type and year for {selectedDoc?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  <p className="text-purple-900">
                    Correct the AI classification if the document type or year was detected incorrectly.
                  </p>
                </div>
              </div>
              <div>
                <Label>Document Type</Label>
                <Select 
                  value={editFormData.documentType} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger>
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
              </div>
              <div>
                <Label>Tax Year</Label>
                <Select 
                  value={editFormData.year} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, year: value }))}
                >
                  <SelectTrigger>
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
              <div>
                <Label>Update AI Tags (Optional)</Label>
                <Input placeholder="Add custom tags..." />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Document Dialog */}
        {selectedDoc && (
          <MoveDocumentDialog
            open={showMoveDialog}
            onClose={() => {
              setShowMoveDialog(false);
              setSelectedDoc(null);
            }}
            document={{
              id: selectedDoc.id,
              name: selectedDoc.name,
              clientId: selectedDoc.clientId || client.id,
              clientName: selectedDoc.clientName || client.name,
              clientType: selectedDoc.clientType || client.type,
              documentType: selectedDoc.documentType,
              year: selectedDoc.year,
            }}
            clients={allClients}
            onMove={handleMoveDocument}
          />
        )}

        {/* Folder Template Management Dialog */}
        <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
          <DialogContent className="max-w-2xl" aria-describedby="folder-templates-description">
            <DialogHeader>
              <DialogTitle>Manage Folder Templates</DialogTitle>
              <DialogDescription id="folder-templates-description">
                Create and manage folder structures that can be applied to any client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {folderTemplates.map((template) => (
                  <Card key={template.id} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                        <Button variant="ghost" size="sm" className="h-7 text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-600 space-y-1">
                        {template.subfolders.map((sub, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <FolderOpen className="w-3 h-3" />
                            {sub}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="border-t pt-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Checklist Item Dialog */}
        <Dialog open={showAddChecklistDialog} onOpenChange={setShowAddChecklistDialog}>
          <DialogContent aria-describedby="add-checklist-item-description">
            <DialogHeader>
              <DialogTitle>Add Document to Checklist</DialogTitle>
              <DialogDescription id="add-checklist-item-description">
                Add a new required document for this client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Document Name</Label>
                <Input placeholder="e.g., 1099-NEC Form" />
              </div>
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="deductions">Deductions</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="required" />
                  <label htmlFor="required" className="text-sm font-medium">
                    Required
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="recurring" />
                  <label htmlFor="recurring" className="text-sm font-medium">
                    Recurring (Annual)
                  </label>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Add any special instructions..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddChecklistDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Add to Checklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Notes Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent aria-describedby="document-notes-description">
            <DialogHeader>
              <DialogTitle>Document Notes</DialogTitle>
              <DialogDescription id="document-notes-description">
                Add or edit notes for {selectedDoc?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Add notes about this document..."
                  rows={6}
                  defaultValue={selectedDoc ? documentNotes[selectedDoc.id] || '' : ''}
                />
                <p className="text-xs text-gray-500 mt-2">
                  These notes are visible to team members and help track document requirements.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
