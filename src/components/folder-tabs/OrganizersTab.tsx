import { Client } from '../../App';
import { 
  LayoutGrid, Plus, CheckCircle, Clock, Calendar, FileText, Building2, 
  DollarSign, Users, Search, Filter, Eye, Edit2, Trash2, Copy, Download,
  ChevronRight, ChevronDown, Send, Mail, ArrowUpDown, ArrowUp, ArrowDown,
  MoreVertical, X, Save, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

type OrganizersTabProps = {
  client: Client;
};

type OrganizerType = 'tax' | 'business' | 'checklist' | 'custom';
type OrganizerStatus = 'not-started' | 'in-progress' | 'completed' | 'sent' | 'received';
type SortField = 'name' | 'type' | 'status' | 'progress' | 'lastUpdated';
type SortDirection = 'asc' | 'desc' | null;

type OrganizerSection = {
  id: string;
  title: string;
  description?: string;
  questions: OrganizerQuestion[];
  isExpanded?: boolean;
};

type OrganizerQuestion = {
  id: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'yes-no' | 'multiple-choice' | 'file-upload';
  answer?: string;
  options?: string[];
  required: boolean;
  helpText?: string;
};

type Organizer = {
  id: string;
  name: string;
  type: OrganizerType;
  status: OrganizerStatus;
  progress: number;
  lastUpdated: string;
  createdDate: string;
  sentDate?: string;
  receivedDate?: string;
  dueDate?: string;
  year?: number;
  sections: OrganizerSection[];
  notes?: string;
};

export function OrganizersTab({ client }: OrganizersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<OrganizerType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<OrganizerStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Mock organizer data
  const [organizers, setOrganizers] = useState<Organizer[]>([
    { 
      id: '1', 
      name: '2024 Tax Organizer', 
      type: 'tax',
      status: 'completed', 
      progress: 100, 
      lastUpdated: '2024-10-20',
      createdDate: '2024-09-01',
      sentDate: '2024-09-05',
      receivedDate: '2024-10-20',
      dueDate: '2024-11-15',
      year: 2024,
      sections: [
        {
          id: 's1',
          title: 'Personal Information',
          description: 'Basic personal and contact information',
          isExpanded: true,
          questions: [
            { id: 'q1', question: 'Have you changed your address this year?', type: 'yes-no', answer: 'No', required: true },
            { id: 'q2', question: 'Have you changed your phone number?', type: 'yes-no', answer: 'No', required: true },
            { id: 'q3', question: 'Marital status change?', type: 'yes-no', answer: 'No', required: true },
          ]
        },
        {
          id: 's2',
          title: 'Income Information',
          description: 'All sources of income for the tax year',
          questions: [
            { id: 'q4', question: 'W-2 Forms', type: 'file-upload', required: true },
            { id: 'q5', question: '1099 Forms', type: 'file-upload', required: false },
            { id: 'q6', question: 'Other income sources', type: 'text', required: false },
          ]
        },
        {
          id: 's3',
          title: 'Deductions',
          description: 'Itemized deductions and credits',
          questions: [
            { id: 'q7', question: 'Mortgage interest paid', type: 'number', required: false },
            { id: 'q8', question: 'Property taxes paid', type: 'number', required: false },
            { id: 'q9', question: 'Charitable contributions', type: 'number', required: false },
          ]
        }
      ],
      notes: 'All documents received and reviewed. Ready for filing.'
    },
    { 
      id: '2', 
      name: 'Business Information Organizer', 
      type: 'business',
      status: 'in-progress', 
      progress: 65, 
      lastUpdated: '2024-10-24',
      createdDate: '2024-10-01',
      sentDate: '2024-10-02',
      dueDate: '2024-11-30',
      year: 2024,
      sections: [
        {
          id: 's4',
          title: 'Business Details',
          questions: [
            { id: 'q10', question: 'Business legal name', type: 'text', answer: 'Acme Corp', required: true },
            { id: 'q11', question: 'EIN', type: 'text', answer: '12-3456789', required: true },
            { id: 'q12', question: 'Business type', type: 'multiple-choice', options: ['LLC', 'S-Corp', 'C-Corp', 'Partnership', 'Sole Proprietor'], answer: 'LLC', required: true },
          ]
        },
        {
          id: 's5',
          title: 'Financial Information',
          questions: [
            { id: 'q13', question: 'Annual revenue', type: 'number', required: true },
            { id: 'q14', question: 'Total expenses', type: 'number', required: true },
          ]
        }
      ]
    },
    { 
      id: '3', 
      name: 'Year-End Checklist', 
      type: 'checklist',
      status: 'not-started', 
      progress: 0, 
      lastUpdated: '2024-10-10',
      createdDate: '2024-10-10',
      dueDate: '2024-12-31',
      year: 2024,
      sections: [
        {
          id: 's6',
          title: 'Required Tasks',
          questions: [
            { id: 'q15', question: 'Review financial statements', type: 'yes-no', required: true },
            { id: 'q16', question: 'Reconcile bank accounts', type: 'yes-no', required: true },
            { id: 'q17', question: 'Review accounts receivable', type: 'yes-no', required: true },
            { id: 'q18', question: 'Review accounts payable', type: 'yes-no', required: true },
          ]
        }
      ]
    },
    { 
      id: '4', 
      name: 'Q1 2024 Bookkeeping Review', 
      type: 'custom',
      status: 'sent', 
      progress: 30, 
      lastUpdated: '2024-03-25',
      createdDate: '2024-03-15',
      sentDate: '2024-03-20',
      dueDate: '2024-04-15',
      year: 2024,
      sections: [
        {
          id: 's7',
          title: 'Review Items',
          questions: [
            { id: 'q19', question: 'Bank reconciliation complete?', type: 'yes-no', required: true },
            { id: 'q20', question: 'Credit card reconciliation complete?', type: 'yes-no', required: true },
          ]
        }
      ]
    }
  ]);

  // New organizer form state
  const [newOrganizer, setNewOrganizer] = useState({
    name: '',
    type: 'tax' as OrganizerType,
    year: new Date().getFullYear(),
    dueDate: ''
  });

  // Organizer type options
  const organizerTypes = [
    { value: 'tax', label: 'Tax Organizer', icon: FileText, color: 'blue' },
    { value: 'business', label: 'Business Organizer', icon: Building2, color: 'purple' },
    { value: 'checklist', label: 'Checklist', icon: CheckCircle, color: 'green' },
    { value: 'custom', label: 'Custom Organizer', icon: LayoutGrid, color: 'gray' }
  ];

  // Get status badge
  const getStatusBadge = (status: OrganizerStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'sent':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"><Send className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'received':
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200"><Mail className="w-3 h-3 mr-1" />Received</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200"><AlertCircle className="w-3 h-3 mr-1" />Not Started</Badge>;
      default:
        return null;
    }
  };

  // Get type icon and color
  const getTypeInfo = (type: OrganizerType) => {
    const typeInfo = organizerTypes.find(t => t.value === type);
    return typeInfo || organizerTypes[3];
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortField('lastUpdated');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-3.5 h-3.5" />;
    if (sortDirection === 'desc') return <ArrowDown className="w-3.5 h-3.5" />;
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
  };

  // Filter and sort organizers
  const filteredOrganizers = organizers
    .filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(org.type);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(org.status);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === 'lastUpdated' || sortField === 'name') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Handle create organizer
  const handleCreateOrganizer = () => {
    if (!newOrganizer.name.trim()) {
      toast.error('Please enter an organizer name');
      return;
    }

    const organizer: Organizer = {
      id: `org-${Date.now()}`,
      name: newOrganizer.name,
      type: newOrganizer.type,
      status: 'not-started',
      progress: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      year: newOrganizer.year,
      dueDate: newOrganizer.dueDate || undefined,
      sections: [],
      notes: ''
    };

    setOrganizers([organizer, ...organizers]);
    setShowCreateDialog(false);
    setNewOrganizer({ name: '', type: 'tax', year: new Date().getFullYear(), dueDate: '' });
    toast.success('Organizer created successfully');
  };

  // Handle delete organizer
  const handleDeleteOrganizer = (id: string) => {
    setOrganizers(organizers.filter(org => org.id !== id));
    if (selectedOrganizer?.id === id) {
      setSelectedOrganizer(null);
      setViewMode('list');
    }
    setShowDeleteDialog(null);
    toast.success('Organizer deleted successfully');
  };

  // Handle duplicate organizer
  const handleDuplicateOrganizer = (organizer: Organizer) => {
    const duplicate: Organizer = {
      ...organizer,
      id: `org-${Date.now()}`,
      name: `${organizer.name} (Copy)`,
      status: 'not-started',
      progress: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      sentDate: undefined,
      receivedDate: undefined,
      sections: organizer.sections.map(section => ({
        ...section,
        questions: section.questions.map(q => ({ ...q, answer: undefined }))
      }))
    };
    setOrganizers([duplicate, ...organizers]);
    toast.success('Organizer duplicated successfully');
  };

  // Handle send organizer
  const handleSendOrganizer = (id: string) => {
    setOrganizers(organizers.map(org => 
      org.id === id 
        ? { ...org, status: 'sent', sentDate: new Date().toISOString().split('T')[0] }
        : org
    ));
    toast.success('Organizer sent to client');
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Calculate progress based on answered questions
  const calculateProgress = (organizer: Organizer): number => {
    const allQuestions = organizer.sections.flatMap(s => s.questions);
    const requiredQuestions = allQuestions.filter(q => q.required);
    if (requiredQuestions.length === 0) return 0;
    const answeredRequired = requiredQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    return Math.round((answeredRequired / requiredQuestions.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b bg-white dark:bg-gray-900" style={{ borderColor: 'var(--stokeColor)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Type
                  {selectedTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                      {selectedTypes.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {organizerTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedTypes.includes(type.value as OrganizerType)}
                    onCheckedChange={(checked) => {
                      setSelectedTypes(
                        checked
                          ? [...selectedTypes, type.value as OrganizerType]
                          : selectedTypes.filter(t => t !== type.value)
                      );
                    }}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('not-started')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, 'not-started']
                        : selectedStatuses.filter(s => s !== 'not-started')
                    );
                  }}
                >
                  Not Started
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('in-progress')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, 'in-progress']
                        : selectedStatuses.filter(s => s !== 'in-progress')
                    );
                  }}
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('sent')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, 'sent']
                        : selectedStatuses.filter(s => s !== 'sent')
                    );
                  }}
                >
                  Sent
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('received')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, 'received']
                        : selectedStatuses.filter(s => s !== 'received')
                    );
                  }}
                >
                  Received
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('completed')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, 'completed']
                        : selectedStatuses.filter(s => s !== 'completed')
                    );
                  }}
                >
                  Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear filters */}
            {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedStatuses([]);
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Actions */}
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
            style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New Organizer
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' ? (
          <div className="p-6">
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredOrganizers.length} of {organizers.length} organizers
            </div>

            {/* Organizers List */}
            <div className="grid gap-4">
              {filteredOrganizers.length === 0 ? (
                <Card className="p-12 text-center">
                  <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-gray-900 dark:text-gray-100">No organizers found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedTypes.length > 0 || selectedStatuses.length > 0
                      ? 'Try adjusting your filters or search term'
                      : 'Get started by creating your first organizer'}
                  </p>
                  {!searchTerm && selectedTypes.length === 0 && selectedStatuses.length === 0 && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Organizer
                    </Button>
                  )}
                </Card>
              ) : (
                filteredOrganizers.map((organizer) => {
                  const typeInfo = getTypeInfo(organizer.type);
                  const TypeIcon = typeInfo.icon;
                  const actualProgress = calculateProgress(organizer);

                  return (
                    <Card 
                      key={organizer.id} 
                      className="hover-brand transition-all group cursor-pointer"
                      onClick={() => {
                        setSelectedOrganizer(organizer);
                        setViewMode('details');
                        // Expand all sections by default
                        setExpandedSections(new Set(organizer.sections.map(s => s.id)));
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div 
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                              `bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-950`
                            )}
                            style={{
                              backgroundColor: typeInfo.color === 'blue' ? 'rgb(219 234 254)' :
                                             typeInfo.color === 'purple' ? 'rgb(243 232 255)' :
                                             typeInfo.color === 'green' ? 'rgb(220 252 231)' :
                                             'rgb(243 244 246)'
                            }}
                          >
                            <TypeIcon 
                              className={cn("w-6 h-6", `text-${typeInfo.color}-700`)}
                              style={{
                                color: typeInfo.color === 'blue' ? 'rgb(29 78 216)' :
                                       typeInfo.color === 'purple' ? 'rgb(126 34 206)' :
                                       typeInfo.color === 'green' ? 'rgb(21 128 61)' :
                                       'rgb(55 65 81)'
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="mb-1 group-hover:text-[var(--primaryColor)] transition-colors">
                                  {organizer.name}
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {getStatusBadge(organizer.status)}
                                  <span className="text-sm text-gray-500">
                                    {typeInfo.label}
                                  </span>
                                  {organizer.year && (
                                    <span className="text-sm text-gray-500">
                                      {organizer.year}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrganizer(organizer);
                                    setViewMode('details');
                                    setExpandedSections(new Set(organizer.sections.map(s => s.id)));
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    // Edit functionality would go here
                                    toast.info('Edit functionality coming soon');
                                  }}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateOrganizer(organizer);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  {organizer.status !== 'sent' && organizer.status !== 'received' && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendOrganizer(organizer.id);
                                    }}>
                                      <Send className="w-4 h-4 mr-2" />
                                      Send to Client
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    // Download functionality would go here
                                    toast.info('Download functionality coming soon');
                                  }}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteDialog(organizer.id);
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span 
                                  className="font-medium"
                                  style={{ color: actualProgress === 100 ? 'rgb(21 128 61)' : 'var(--primaryColor)' }}
                                >
                                  {actualProgress}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-500"
                                  style={{ 
                                    width: `${actualProgress}%`,
                                    backgroundColor: actualProgress === 100 ? 'rgb(21 128 61)' : 'var(--primaryColor)'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Last updated: {organizer.lastUpdated}</span>
                              </div>
                              {organizer.dueDate && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  <span>Due: {organizer.dueDate}</span>
                                </div>
                              )}
                              {organizer.sentDate && (
                                <div className="flex items-center gap-1.5">
                                  <Send className="w-4 h-4" />
                                  <span>Sent: {organizer.sentDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // Details View
          selectedOrganizer && (
            <div className="p-6">
              {/* Back button */}
              <Button 
                variant="ghost" 
                onClick={() => {
                  setViewMode('list');
                  setSelectedOrganizer(null);
                }}
                className="mb-4 gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to List
              </Button>

              {/* Organizer Header */}
              <Card className="mb-6">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: getTypeInfo(selectedOrganizer.type).color === 'blue' ? 'rgb(219 234 254)' :
                                         getTypeInfo(selectedOrganizer.type).color === 'purple' ? 'rgb(243 232 255)' :
                                         getTypeInfo(selectedOrganizer.type).color === 'green' ? 'rgb(220 252 231)' :
                                         'rgb(243 244 246)'
                        }}
                      >
                        {(() => {
                          const TypeIcon = getTypeInfo(selectedOrganizer.type).icon;
                          return (
                            <TypeIcon 
                              className="w-8 h-8"
                              style={{
                                color: getTypeInfo(selectedOrganizer.type).color === 'blue' ? 'rgb(29 78 216)' :
                                       getTypeInfo(selectedOrganizer.type).color === 'purple' ? 'rgb(126 34 206)' :
                                       getTypeInfo(selectedOrganizer.type).color === 'green' ? 'rgb(21 128 61)' :
                                       'rgb(55 65 81)'
                              }}
                            />
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        <h2 className="mb-2">{selectedOrganizer.name}</h2>
                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(selectedOrganizer.status)}
                          <span className="text-sm text-gray-500">
                            {getTypeInfo(selectedOrganizer.type).label}
                          </span>
                          {selectedOrganizer.year && (
                            <span className="text-sm text-gray-500">
                              Year: {selectedOrganizer.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {selectedOrganizer.status !== 'sent' && selectedOrganizer.status !== 'received' && (
                        <Button
                          onClick={() => handleSendOrganizer(selectedOrganizer.id)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send to Client
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => toast.info('Download functionality coming soon')}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Organizer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateOrganizer(selectedOrganizer)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setShowDeleteDialog(selectedOrganizer.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                      <span 
                        className="font-medium"
                        style={{ color: calculateProgress(selectedOrganizer) === 100 ? 'rgb(21 128 61)' : 'var(--primaryColor)' }}
                      >
                        {calculateProgress(selectedOrganizer)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${calculateProgress(selectedOrganizer)}%`,
                          backgroundColor: calculateProgress(selectedOrganizer) === 100 ? 'rgb(21 128 61)' : 'var(--primaryColor)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--stokeColor)' }}>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created</div>
                      <div className="text-sm">{selectedOrganizer.createdDate}</div>
                    </div>
                    {selectedOrganizer.sentDate && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Sent</div>
                        <div className="text-sm">{selectedOrganizer.sentDate}</div>
                      </div>
                    )}
                    {selectedOrganizer.dueDate && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Due Date</div>
                        <div className="text-sm">{selectedOrganizer.dueDate}</div>
                      </div>
                    )}
                    {selectedOrganizer.receivedDate && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Received</div>
                        <div className="text-sm">{selectedOrganizer.receivedDate}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Sections */}
              <div className="space-y-4">
                {selectedOrganizer.sections.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2">No sections yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add sections and questions to this organizer
                    </p>
                    <Button
                      onClick={() => toast.info('Add section functionality coming soon')}
                      style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </Card>
                ) : (
                  selectedOrganizer.sections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const answeredQuestions = section.questions.filter(q => q.answer && q.answer.trim() !== '').length;
                    const totalQuestions = section.questions.length;

                    return (
                      <Card key={section.id}>
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                              <div>
                                <h3 className="mb-0.5">{section.title}</h3>
                                {section.description && (
                                  <p className="text-sm text-gray-500">{section.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {answeredQuestions}/{totalQuestions} answered
                              </span>
                              {answeredQuestions === totalQuestions && totalQuestions > 0 && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t" style={{ borderColor: 'var(--stokeColor)' }}>
                            <div className="p-6 space-y-6">
                              {section.questions.map((question) => (
                                <div key={question.id} className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    {question.question}
                                    {question.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </Label>
                                  {question.helpText && (
                                    <p className="text-sm text-gray-500">{question.helpText}</p>
                                  )}
                                  
                                  {question.type === 'text' && (
                                    <Input
                                      value={question.answer || ''}
                                      placeholder="Enter answer..."
                                      readOnly
                                      className="bg-gray-50 dark:bg-gray-800/50"
                                    />
                                  )}
                                  
                                  {question.type === 'number' && (
                                    <Input
                                      type="number"
                                      value={question.answer || ''}
                                      placeholder="Enter amount..."
                                      readOnly
                                      className="bg-gray-50 dark:bg-gray-800/50"
                                    />
                                  )}
                                  
                                  {question.type === 'date' && (
                                    <Input
                                      type="date"
                                      value={question.answer || ''}
                                      readOnly
                                      className="bg-gray-50 dark:bg-gray-800/50"
                                    />
                                  )}
                                  
                                  {question.type === 'yes-no' && (
                                    <div className="flex gap-3">
                                      <div
                                        className={cn(
                                          "flex-1 p-3 border rounded-lg cursor-not-allowed",
                                          question.answer === 'Yes' 
                                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          {question.answer === 'Yes' ? (
                                            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                                          ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                          )}
                                          <span>Yes</span>
                                        </div>
                                      </div>
                                      <div
                                        className={cn(
                                          "flex-1 p-3 border rounded-lg cursor-not-allowed",
                                          question.answer === 'No' 
                                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          {question.answer === 'No' ? (
                                            <XCircle className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                                          ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                          )}
                                          <span>No</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {question.type === 'multiple-choice' && (
                                    <Select value={question.answer || ''} disabled>
                                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50">
                                        <SelectValue placeholder="Select an option..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {question.options?.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  
                                  {question.type === 'file-upload' && (
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-800/50" style={{ borderColor: 'var(--stokeColor)' }}>
                                      {question.answer ? (
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                          <FileText className="w-4 h-4 text-green-600" />
                                          <span className="text-green-600">File uploaded</span>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500">
                                          No file uploaded
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Notes Section */}
              {selectedOrganizer.notes && (
                <Card className="mt-6">
                  <div className="p-6">
                    <h3 className="mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Notes
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrganizer.notes}</p>
                  </div>
                </Card>
              )}
            </div>
          )
        )}
      </div>

      {/* Create Organizer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="create-organizer-description">
          <DialogHeader>
            <DialogTitle>Create New Organizer</DialogTitle>
            <DialogDescription id="create-organizer-description">
              Set up a new organizer to collect information from your client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organizer Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 2024 Tax Organizer"
                value={newOrganizer.name}
                onChange={(e) => setNewOrganizer({ ...newOrganizer, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={newOrganizer.type}
                onValueChange={(value) => setNewOrganizer({ ...newOrganizer, type: value as OrganizerType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={newOrganizer.year}
                  onChange={(e) => setNewOrganizer({ ...newOrganizer, year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newOrganizer.dueDate}
                  onChange={(e) => setNewOrganizer({ ...newOrganizer, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrganizer}
              style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
            >
              Create Organizer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby="delete-organizer-description">
          <DialogHeader>
            <DialogTitle>Delete Organizer</DialogTitle>
            <DialogDescription id="delete-organizer-description">
              Are you sure you want to delete this organizer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => showDeleteDialog && handleDeleteOrganizer(showDeleteDialog)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
