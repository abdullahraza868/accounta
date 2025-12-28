import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  GripVertical,
  Calendar as CalendarIcon,
  RefreshCw,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { TablePagination } from '../TablePagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import { ClientDocumentDetailsModal } from '../ClientDocumentDetailsModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ClientDocument = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  status: 'uploaded' | 'requested' | 'pending';
  uploadedAt?: string;
  requestedAt?: string;
  previewUrl?: string;
  size?: number;
};

type TaxClient = {
  id: string;
  no: number;
  clientName: string;
  clientType: 'Individual' | 'Business';
  workflow: string;
  workflowStep?: string;
  notes?: string;
  documentCount: number;
  requestedAt: string; // ISO date string
  documents?: ClientDocument[];
};

type SortColumn = 'clientName' | 'requestedAt' | null;
type SortDirection = 'asc' | 'desc';
type ClientTypeFilter = 'all' | 'Individual' | 'Business';

// Mock data
const INITIAL_TAX_CLIENTS: TaxClient[] = [
  {
    id: '1',
    no: 1,
    clientName: 'Business No Last Name',
    clientType: 'Business',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 3,
    requestedAt: '2024-06-17T11:43:00',
    documents: [
      {
        id: '1-doc-1',
        name: 'Business Tax Return 2024.pdf',
        type: 'pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-15T10:30:00',
        size: 245760,
        previewUrl: 'https://pdfobject.com/pdf/sample.pdf',
      },
      {
        id: '1-doc-2',
        name: '1099-INT Statement.pdf',
        type: 'pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-20T14:15:00',
        size: 189440,
        previewUrl: 'https://pdfobject.com/pdf/sample.pdf',
      },
      {
        id: '1-doc-3',
        name: 'Receipts - Q1 2024.pdf',
        type: 'pdf',
        status: 'requested',
        requestedAt: '2024-02-01T09:00:00',
        previewUrl: 'https://pdfobject.com/pdf/sample.pdf',
      },
    ],
  },
  {
    id: '2',
    no: 2,
    clientName: 'Alma Alvarez',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 2,
    requestedAt: '2024-03-07T07:46:00',
    documents: [
      {
        id: '2-doc-1',
        name: 'W-2 Form 2024.pdf',
        type: 'pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-15T10:30:00',
        size: 245760,
        previewUrl: 'https://pdfobject.com/pdf/sample.pdf',
      },
      {
        id: '2-doc-2',
        name: 'Tax Document Photo.jpg',
        type: 'image',
        status: 'uploaded',
        uploadedAt: '2024-01-18T16:45:00',
        size: 512000,
        previewUrl: 'https://easifyapps.com/wp-content/uploads/2023/08/placeholder-scaled.jpg',
      },
    ],
  },
  {
    id: '3',
    no: 3,
    clientName: 'Bob Farmer',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2025-10-06T12:56:00',
  },
  {
    id: '4',
    no: 4,
    clientName: 'Anthony Brown',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2024-06-17T11:42:00',
  },
  {
    id: '5',
    no: 5,
    clientName: 'Dawn Lewis',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2024-10-05T12:43:00',
  },
  {
    id: '6',
    no: 6,
    clientName: 'Sidonnie Clewarth',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2024-03-07T07:34:00',
  },
  {
    id: '7',
    no: 7,
    clientName: 'asad',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 1,
    requestedAt: '2024-09-26T21:25:00',
  },
  {
    id: '8',
    no: 8,
    clientName: 'Abhi Verma',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2024-09-26T21:25:00',
  },
  {
    id: '9',
    no: 9,
    clientName: 'Beverly Waymire',
    clientType: 'Individual',
    workflow: 'Start Project',
    workflowStep: '',
    notes: '',
    documentCount: 0,
    requestedAt: '2024-02-23T22:50:00',
  },
];

// Sortable row component
function SortableRow({ 
  client, 
  onWorkflowClick, 
  onEyeClick 
}: { 
  client: TaxClient;
  onWorkflowClick: (id: string) => void;
  onEyeClick: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-all cursor-move",
        isDragging && "opacity-50"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="w-8 flex-shrink-0 flex items-center justify-center cursor-move"
      >
        <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500" />
      </div>

      {/* No */}
      <div className="w-16 flex-shrink-0 text-sm text-gray-900 dark:text-gray-100">
        {client.no}
      </div>

      {/* Client Name */}
      <div className="flex-1 min-w-[200px]">
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {client.clientName}
        </span>
      </div>

      {/* Workflow */}
      <div className="w-32 flex-shrink-0">
        <Button
          size="sm"
          onClick={() => onWorkflowClick(client.id)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {client.workflow}
        </Button>
      </div>

      {/* Workflow Step */}
      <div className="w-32 flex-shrink-0 text-sm text-gray-700 dark:text-gray-300">
        {client.workflowStep || ''}
      </div>

      {/* Notes */}
      <div className="w-32 flex-shrink-0 text-sm text-gray-700 dark:text-gray-300">
        {client.notes || ''}
      </div>

      {/* Documents */}
      <div className="w-24 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-gray-100">{client.documentCount}</span>
          {client.documentCount > 0 && (
            <Badge 
              variant="destructive" 
              className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {client.documentCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Requested At */}
      <div className="w-40 flex-shrink-0 text-sm text-gray-700 dark:text-gray-300">
        {formatDateTime(client.requestedAt)}
      </div>

      {/* Action */}
      <div className="w-12 flex-shrink-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEyeClick(client.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </Button>
      </div>
    </div>
  );
}

export function StartMyTaxListView() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<TaxClient[]>(INITIAL_TAX_CLIENTS);
  const [activeTab, setActiveTab] = useState<ClientTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<TaxClient | null>(null);
  const [showDocumentDetailsModal, setShowDocumentDetailsModal] = useState(false);
  
  // Add client form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientType, setNewClientType] = useState<'Individual' | 'Business'>('Individual');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter clients
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(c => c.clientType === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(c => new Date(c.requestedAt) >= new Date(dateRange.from));
    }
    if (dateRange.to) {
      filtered = filtered.filter(c => new Date(c.requestedAt) <= new Date(dateRange.to + 'T23:59:59'));
    }

    // Sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortColumn];
        let bVal: any = b[sortColumn];

        if (sortColumn === 'requestedAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortColumn === 'clientName') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [clients, activeTab, searchQuery, dateRange, sortColumn, sortDirection]);

  // Paginate
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setClients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Update the 'no' field based on new positions
        return reordered.map((item, index) => ({ ...item, no: index + 1 }));
      });
      toast.success('Client order updated');
    }
  };

  // Handle add client
  const handleAddClient = () => {
    if (!newClientName.trim()) {
      toast.error('Please enter a client name');
      return;
    }

    const newClient: TaxClient = {
      id: Date.now().toString(),
      no: clients.length + 1,
      clientName: newClientName,
      clientType: newClientType,
      workflow: 'Start Project',
      workflowStep: '',
      notes: newClientNotes || '',
      documentCount: 0,
      requestedAt: new Date().toISOString(),
      documents: [],
    };

    setClients([...clients, newClient]);
    toast.success(`${newClientName} added successfully`);
    
    // Reset form
    setNewClientName('');
    setNewClientType('Individual');
    setNewClientNotes('');
    setShowAddClientDialog(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.success('Data refreshed');
  };

  // Handle workflow button click
  const handleWorkflowClick = (id: string) => {
    toast.info('Start workflow for client');
  };

  // Handle eye icon click
  const handleEyeClick = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      setSelectedClientForDetails(client);
      setShowDocumentDetailsModal(true);
    }
  };

  // Get documents for a client (with fallback to empty array)
  const getClientDocuments = (client: TaxClient): ClientDocument[] => {
    return client.documents || [];
  };

  // Handle start project from modal
  const handleStartProject = (clientId: string) => {
    // This can trigger workflow or navigation
    toast.success('Project started successfully');
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/projects')}
                className="gap-2 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            <div className="flex items-center gap-3">
              
              <h1 className="text-gray-900 dark:text-gray-100 font-medium">
                Start My Tax List
              </h1>
              <Badge variant="secondary" className="text-xs">
                {filteredClients.length} {filteredClients.length === 1 ? 'Tax' : 'Taxes'}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors",
                activeTab === 'all'
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              style={activeTab === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveTab('Individual');
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'Individual'
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              style={activeTab === 'Individual' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => {
                setActiveTab('Business');
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'Business'
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              style={activeTab === 'Business' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              <Building2 className="w-4 h-4" />
              Businesses
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Select a range</span>
                </div>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, from: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-40"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, to: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-40"
                />
              </div>
            </div>

            {/* Add Client Button */}
            <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm font-medium">Add New Tax Client</DialogTitle>
                  <DialogDescription className="text-xs">
                    Add a new client to your tax list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-xs">
                      Client Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientName"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Client Type</Label>
                    <RadioGroup value={newClientType} onValueChange={(value) => setNewClientType(value as 'Individual' | 'Business')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Individual" id="individual" />
                        <Label htmlFor="individual" className="text-xs font-normal cursor-pointer">
                          Individual
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Business" id="business" />
                        <Label htmlFor="business" className="text-xs font-normal cursor-pointer">
                          Business
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newClientNotes}
                      onChange={(e) => setNewClientNotes(e.target.value)}
                      placeholder="Enter notes"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddClientDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddClient}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Add Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 overflow-hidden">
          {paginatedClients.length > 0 && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto min-w-0">
              <div className="flex items-center gap-4">
                <div className="w-8 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Drag</span>
                </div>
                <div className="w-16 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">No</span>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <button
                    onClick={() => handleSort('clientName')}
                    className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                  >
                    Client Name
                    {getSortIcon('clientName')}
                  </button>
                </div>
                <div className="w-32 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Workflow</span>
                </div>
                <div className="w-32 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Workflow Step</span>
                </div>
                <div className="w-32 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Notes</span>
                </div>
                <div className="w-24 flex-shrink-0">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Documents</span>
                </div>
                <div className="w-40 flex-shrink-0">
                  <button
                    onClick={() => handleSort('requestedAt')}
                    className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                  >
                    Requested At
                    {getSortIcon('requestedAt')}
                  </button>
                </div>
                <div className="w-12 flex-shrink-0">
                  {/* Actions column header */}
                </div>
              </div>
            </div>
          )}

          {/* Task Rows */}
          <div className="divide-y divide-slate-100 overflow-x-auto min-w-0">
            {paginatedClients.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No tax clients found</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={paginatedClients.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {paginatedClients.map((client) => (
                    <SortableRow
                      key={client.id}
                      client={client}
                      onWorkflowClick={handleWorkflowClick}
                      onEyeClick={handleEyeClick}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
            <TablePagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalCount={filteredClients.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </Card>
      </div>

      {/* Client Document Details Modal */}
      <ClientDocumentDetailsModal
        open={showDocumentDetailsModal}
        onOpenChange={setShowDocumentDetailsModal}
        client={selectedClientForDetails}
        documents={selectedClientForDetails ? getClientDocuments(selectedClientForDetails) : []}
        onStartProject={handleStartProject}
      />
    </div>
  );
}

