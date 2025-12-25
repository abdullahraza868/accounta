import React, { useState } from 'react';
import {
  Folder, FolderOpen, File, Upload, Download, Trash2, Edit, Plus,
  Search, MoreVertical, Users, Lock, Building2, ChevronRight, FileText,
  Image as ImageIcon, FileSpreadsheet, Presentation, Archive, Video, Music,
  Grid, List, ArrowUpDown, Calendar, Clock, User, Sparkles, Send, Loader2, Check, X, AlertCircle, Mail
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { SendFilesDialog } from './dialogs/SendFilesDialog';

type FolderType = 'shared' | 'private';

type FolderItem = {
  id: string;
  name: string;
  type: FolderType;
  fileCount: number;
  size: string;
  lastModified: Date;
  owner?: string;
  isSystem?: boolean;
  parentId?: string | null;
};

type FileItem = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'doc' | 'video' | 'audio' | 'archive' | 'other';
  size: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedDate: Date;
  folderId: string;
};

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'date';
type SortOrder = 'asc' | 'desc';

interface FileManagerViewProps {
  clientName: string;
  isFirm?: boolean;
  showAISearch?: boolean;
  currentUser?: string;
}

export function FileManagerView({ 
  clientName, 
  isFirm = false, 
  showAISearch = false,
  currentUser = 'Sarah Johnson'
}: FileManagerViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<FolderType>('shared');
  const [isDragging, setIsDragging] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  
  // AI Search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showAIExpanded, setShowAIExpanded] = useState(false);

  // Send email dialog state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [fileToEmail, setFileToEmail] = useState<FileItem | null>(null);
  const [folderFilesToEmail, setFolderFilesToEmail] = useState<Array<{id: string; name: string; folderPath: string; type: string}>>([]);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [folders, setFolders] = useState<FolderItem[]>(
    isFirm ? [
      {
        id: 'shared-templates',
        name: 'Templates',
        type: 'shared',
        fileCount: 6,
        size: '45 MB',
        lastModified: new Date(2024, 11, 10),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'shared-policies',
        name: 'Policies & Procedures',
        type: 'shared',
        fileCount: 6,
        size: '7.2 MB',
        lastModified: new Date(2024, 11, 10),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'shared-training',
        name: 'Training Materials',
        type: 'shared',
        fileCount: 5,
        size: '138 MB',
        lastModified: new Date(2024, 11, 8),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'shared-contracts',
        name: 'Contracts & Agreements',
        type: 'shared',
        fileCount: 4,
        size: '4.2 MB',
        lastModified: new Date(2024, 11, 1),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'private-sarah',
        name: 'My Private Folder',
        type: 'private',
        fileCount: 3,
        size: '757 KB',
        lastModified: new Date(2024, 11, 12),
        owner: currentUser,
        isSystem: true,
        parentId: null,
      },
    ] : [
      {
        id: 'client-tax-docs',
        name: 'Tax Documents',
        type: 'shared',
        fileCount: 2,
        size: '2.4 MB',
        lastModified: new Date(2024, 11, 10),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'client-financial',
        name: 'Financial Statements',
        type: 'shared',
        fileCount: 2,
        size: '3.2 MB',
        lastModified: new Date(2024, 10, 15),
        isSystem: true,
        parentId: null,
      },
      {
        id: 'client-correspondence',
        name: 'Correspondence',
        type: 'shared',
        fileCount: 0,
        size: '0 MB',
        lastModified: new Date(2024, 11, 8),
        isSystem: true,
        parentId: null,
      },
    ]
  );

  const [files, setFiles] = useState<FileItem[]>([
    // Shared Policies Folder
    {
      id: 'file1',
      name: 'Employee_Handbook_2024.pdf',
      type: 'pdf',
      size: '2.5 MB',
      sizeBytes: 2621440,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 10),
      folderId: 'shared-policies',
    },
    {
      id: 'file4',
      name: 'PTO_Policy_2024.pdf',
      type: 'pdf',
      size: '890 KB',
      sizeBytes: 911360,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 11, 3),
      folderId: 'shared-policies',
    },
    {
      id: 'file11',
      name: 'Code_of_Conduct.pdf',
      type: 'pdf',
      size: '1.8 MB',
      sizeBytes: 1887436,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 25),
      folderId: 'shared-policies',
    },
    {
      id: 'file12',
      name: 'Remote_Work_Policy.docx',
      type: 'doc',
      size: '245 KB',
      sizeBytes: 250880,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 10, 20),
      folderId: 'shared-policies',
    },
    {
      id: 'file13',
      name: 'Expense_Reimbursement_Guidelines.pdf',
      type: 'pdf',
      size: '675 KB',
      sizeBytes: 691200,
      uploadedBy: 'Emily Rodriguez',
      uploadedDate: new Date(2024, 10, 15),
      folderId: 'shared-policies',
    },
    {
      id: 'file14',
      name: 'Data_Security_Policy.pdf',
      type: 'pdf',
      size: '1.1 MB',
      sizeBytes: 1153433,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 10, 10),
      folderId: 'shared-policies',
    },
    
    // Shared Training Folder
    {
      id: 'file2',
      name: 'Onboarding_Checklist.pdf',
      type: 'pdf',
      size: '450 KB',
      sizeBytes: 460800,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 11, 8),
      folderId: 'shared-training',
    },
    {
      id: 'file5',
      name: 'Benefits_Overview.xlsx',
      type: 'spreadsheet',
      size: '1.2 MB',
      sizeBytes: 1258291,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 28),
      folderId: 'shared-training',
    },
    {
      id: 'file15',
      name: 'Software_Training_Presentation.pptx',
      type: 'doc',
      size: '8.5 MB',
      sizeBytes: 8912896,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 11, 1),
      folderId: 'shared-training',
    },
    {
      id: 'file16',
      name: 'Customer_Service_Best_Practices.pdf',
      type: 'pdf',
      size: '3.2 MB',
      sizeBytes: 3355443,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 18),
      folderId: 'shared-training',
    },
    {
      id: 'file17',
      name: 'Compliance_Training_Video.mp4',
      type: 'video',
      size: '125 MB',
      sizeBytes: 131072000,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 10, 5),
      folderId: 'shared-training',
    },
    
    // Shared Templates Folder
    {
      id: 'file3',
      name: 'Client_Agreement_Template.docx',
      type: 'doc',
      size: '120 KB',
      sizeBytes: 122880,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 5),
      folderId: 'shared-templates',
    },
    {
      id: 'file18',
      name: 'Invoice_Template.xlsx',
      type: 'spreadsheet',
      size: '85 KB',
      sizeBytes: 87040,
      uploadedBy: 'Emily Rodriguez',
      uploadedDate: new Date(2024, 11, 2),
      folderId: 'shared-templates',
    },
    {
      id: 'file19',
      name: 'Proposal_Template.docx',
      type: 'doc',
      size: '156 KB',
      sizeBytes: 159744,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 28),
      folderId: 'shared-templates',
    },
    {
      id: 'file20',
      name: 'Email_Signature_Template.html',
      type: 'other',
      size: '12 KB',
      sizeBytes: 12288,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 10, 22),
      folderId: 'shared-templates',
    },
    {
      id: 'file21',
      name: 'Meeting_Notes_Template.docx',
      type: 'doc',
      size: '45 KB',
      sizeBytes: 46080,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 10, 15),
      folderId: 'shared-templates',
    },
    {
      id: 'file22',
      name: 'Letterhead_Template.pdf',
      type: 'pdf',
      size: '890 KB',
      sizeBytes: 911360,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 8),
      folderId: 'shared-templates',
    },
    
    // Shared Contracts Folder
    {
      id: 'file23',
      name: 'Standard_NDA.pdf',
      type: 'pdf',
      size: '567 KB',
      sizeBytes: 580608,
      uploadedBy: 'Emily Rodriguez',
      uploadedDate: new Date(2024, 11, 1),
      folderId: 'shared-contracts',
    },
    {
      id: 'file24',
      name: 'Service_Agreement_2024.pdf',
      type: 'pdf',
      size: '1.4 MB',
      sizeBytes: 1468006,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 10, 20),
      folderId: 'shared-contracts',
    },
    {
      id: 'file25',
      name: 'Consulting_Contract_Template.docx',
      type: 'doc',
      size: '215 KB',
      sizeBytes: 220160,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 12),
      folderId: 'shared-contracts',
    },
    {
      id: 'file26',
      name: 'Partnership_Agreement.pdf',
      type: 'pdf',
      size: '2.1 MB',
      sizeBytes: 2202009,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 10, 5),
      folderId: 'shared-contracts',
    },
    
    // Private Folder
    {
      id: 'file27',
      name: 'Personal_Notes_2024.docx',
      type: 'doc',
      size: '78 KB',
      sizeBytes: 79872,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 12),
      folderId: 'private-sarah',
    },
    {
      id: 'file28',
      name: 'Performance_Review_Draft.pdf',
      type: 'pdf',
      size: '445 KB',
      sizeBytes: 455680,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 8),
      folderId: 'private-sarah',
    },
    {
      id: 'file29',
      name: 'Client_Strategy_Ideas.xlsx',
      type: 'spreadsheet',
      size: '234 KB',
      sizeBytes: 239616,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 3),
      folderId: 'private-sarah',
    },
    
    // Client Folders (if not firm)
    {
      id: 'file30',
      name: '2023_Tax_Return.pdf',
      type: 'pdf',
      size: '1.8 MB',
      sizeBytes: 1887436,
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 11, 10),
      folderId: 'client-tax-docs',
    },
    {
      id: 'file31',
      name: 'W2_Forms_2023.pdf',
      type: 'pdf',
      size: '567 KB',
      sizeBytes: 580608,
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 10, 15),
      folderId: 'client-tax-docs',
    },
    {
      id: 'file32',
      name: 'Q4_2024_Financial_Statement.pdf',
      type: 'pdf',
      size: '2.3 MB',
      sizeBytes: 2411724,
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 10, 15),
      folderId: 'client-financial',
    },
    {
      id: 'file33',
      name: 'Balance_Sheet_November.xlsx',
      type: 'spreadsheet',
      size: '890 KB',
      sizeBytes: 911360,
      uploadedBy: 'Emily Rodriguez',
      uploadedDate: new Date(2024, 10, 10),
      folderId: 'client-financial',
    },
  ]);



  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-pink-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-orange-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: newFolderType,
      fileCount: 0,
      size: '0 MB',
      lastModified: new Date(),
      owner: newFolderType === 'private' ? currentUser : undefined,
      parentId: selectedFolder, // Set parent to current folder when inside a folder
    };

    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowCreateFolderDialog(false);
    toast.success(`Folder "${newFolderName}" created successfully`);
  };

  const handleFolderClick = (folderId: string, e?: React.MouseEvent) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
      setSelectedFolder(folderId);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root level
      setFolderPath([]);
      setSelectedFolder(null);
    } else {
      // Navigate to specific folder in path
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setSelectedFolder(newPath[newPath.length - 1].id);
    }
  };

  const handleFileHover = (fileId: string | null, event?: React.MouseEvent) => {
    setHoveredFileId(fileId);
    if (event && fileId) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setShowAIExpanded(true);
    setAiSearching(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiResponse(`Based on the firm documents, here's what I found:\n\nThe Employee Handbook 2024 states that all employees are entitled to 15 days of PTO annually, with the ability to roll over up to 5 unused days to the next year. New employees accrue PTO at a rate of 1.25 days per month during their first year.\n\nAdditionally, the firm offers 10 paid holidays per year and sick leave is tracked separately with no maximum limit.`);
      setAiSearching(false);
      toast.success('AI search completed');
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.success('Files uploaded successfully');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.success(`${files.length} file(s) uploaded successfully`);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRenameStart = (file: FileItem) => {
    setRenamingFileId(file.id);
    setRenameValue(file.name);
  };

  const handleRenameSave = (fileId: string) => {
    if (renameValue.trim()) {
      setFiles(files.map(f => f.id === fileId ? { ...f, name: renameValue } : f));
      toast.success('File renamed successfully');
    }
    setRenamingFileId(null);
  };

  const handleRenameCancel = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  const handleEmailFile = (file: FileItem) => {
    setFileToEmail(file);
    setShowSendDialog(true);
  };

  const getFolderPath = (folderId: string): string => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Root';
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    folder.parentId === selectedFolder // Only show folders in current directory
  );

  let currentFolderFiles = selectedFolder
    ? files.filter(f => f.folderId === selectedFolder)
    : [];

  // Apply sorting
  currentFolderFiles = [...currentFolderFiles].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'size') {
      comparison = a.sizeBytes - b.sizeBytes;
    } else if (sortBy === 'date') {
      comparison = a.uploadedDate.getTime() - b.uploadedDate.getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const exampleQuestions = [
    "What is our PTO policy?",
    "Find all contract templates",
    "What are the client onboarding steps?",
    "Show me the latest training materials"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        {/* Search and Actions Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={selectedFolder ? "Search files..." : "Search folders..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Sort controls when inside folder */}
            {selectedFolder && (
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-md p-1 mr-2">
                <button
                  onClick={() => toggleSort('name')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1",
                    sortBy === 'name'
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  Name
                  {sortBy === 'name' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('size')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1",
                    sortBy === 'size'
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  Size
                  {sortBy === 'size' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('date')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1",
                    sortBy === 'date'
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  Modified
                  {sortBy === 'date' && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-3 py-1.5 rounded transition-colors flex items-center gap-1.5",
                  viewMode === 'grid'
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                <Grid className="w-4 h-4" />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-3 py-1.5 rounded transition-colors flex items-center gap-1.5",
                  viewMode === 'list'
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
            <Button
              onClick={() => setShowCreateFolderDialog(true)}
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Plus className="w-4 h-4" />
              New Folder
            </Button>
            <Button
              onClick={handleUploadClick}
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Breadcrumb below search - with 2px padding - Only when inside folder */}
        {selectedFolder && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-[2px] mb-[-2px]">
            <Building2 className="w-4 h-4" />
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              All Folders
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {folders.find(f => f.id === selectedFolder)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 overflow-auto",
        showAISearch && !selectedFolder ? "pb-0" : ""
      )}>
        <div 
          className={cn(
            "transition-colors relative p-6",
            isDragging && "bg-purple-50 dark:bg-purple-950/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        {/* Drag and Drop Watermark */}
        {!isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 z-0 pt-32">
            <div className="border-[3px] border-dashed border-gray-300/30 dark:border-gray-600/20 rounded-2xl w-full max-w-lg h-56 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100/40 dark:bg-gray-800/30 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400/60 dark:text-gray-500/50" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-sm text-gray-500/60 dark:text-gray-400/50">
                  Drag & drop files here
                </p>
                <p className="text-xs text-gray-400/60 dark:text-gray-500/40 mt-1">
                  or click Upload Files button
                </p>
              </div>
            </div>
          </div>
        )}



        {!selectedFolder ? (
          <div className="relative z-10">
            {isFirm && (
              <div className="mb-6">
                <div className="bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Firm Document Storage
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Store and organize all firm-wide documents. <strong>Shared folders</strong> are visible to all team members, while <strong>Private folders</strong> are only visible to you.
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Shared:</strong> All team members
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Private:</strong> Only you
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={(e) => handleFolderClick(folder.id, e)}
                    className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        folder.type === 'shared'
                          ? "bg-blue-100 dark:bg-blue-950/50"
                          : "bg-orange-100 dark:bg-orange-950/50"
                      )}>
                        {folder.type === 'shared' ? (
                          <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const folderFiles = files.filter(f => f.folderId === folder.id);
                            if (folderFiles.length === 0) {
                              toast.error('No files in this folder to email');
                              return;
                            }
                            const allFolderFiles = folderFiles.map(f => ({
                              id: f.id,
                              name: f.name,
                              folderPath: getFolderPath(f.folderId),
                              type: f.type,
                            }));
                            setFolderFilesToEmail(allFolderFiles);
                            setShowSendDialog(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          title="Email all files in folder"
                        >
                          <Mail className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--primaryColor)' }}>Email All</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Downloaded all files from ' + folder.name);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Download all files in folder"
                        >
                          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Download All</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                      {folder.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {folder.type === 'shared' ? (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{folder.fileCount} files</span>
                        <span>{folder.size}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500 dark:text-gray-500">Last modified: </span>
                        {folder.lastModified.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))  }
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Files</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Last Modified</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFolders.map((folder) => (
                      <tr
                        key={folder.id}
                        onClick={(e) => handleFolderClick(folder.id, e)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded flex items-center justify-center",
                              folder.type === 'shared'
                                ? "bg-blue-100 dark:bg-blue-950/50"
                                : "bg-orange-100 dark:bg-orange-950/50"
                            )}>
                              {folder.type === 'shared' ? (
                                <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {folder.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {folder.type === 'shared' ? (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{folder.fileCount}</td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{folder.size}</td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {folder.lastModified.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const folderFiles = files.filter(f => f.folderId === folder.id);
                                  if (folderFiles.length === 0) {
                                    toast.error('No files in this folder to email');
                                    return;
                                  }
                                  const allFolderFiles = folderFiles.map(f => ({
                                    id: f.id,
                                    name: f.name,
                                    folderPath: getFolderPath(f.folderId),
                                    type: f.type,
                                  }));
                                  setFolderFilesToEmail(allFolderFiles);
                                  setShowSendDialog(true);
                                }}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email All
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download All
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                disabled={folder.isSystem}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10">
            {/* Drop zone watermark */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-purple-100/90 dark:bg-purple-900/30 border-4 border-dashed border-purple-400 dark:border-purple-600 rounded-lg">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <p className="text-xl font-semibold text-purple-900 dark:text-purple-100">Drop files here to upload</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Files will be added to {folders.find(f => f.id === selectedFolder)?.name}</p>
                </div>
              </div>
            )}

            {currentFolderFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Folder className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No files yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload files or drag and drop to get started
                </p>
                <Button
                  onClick={handleUploadClick}
                  className="gap-2"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentFolderFiles.map((file) => {
                  return (
                    <div
                      key={file.id}
                      className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
                    >
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="relative w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center cursor-pointer"
                        onMouseEnter={(e) => handleFileHover(file.id, e)}
                        onMouseLeave={() => handleFileHover(null)}
                      >
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {file.uploadedDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {renamingFileId === file.id ? (
                      <div className="mb-2">
                        <div className="flex items-center gap-1">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSave(file.id);
                              if (e.key === 'Escape') handleRenameCancel();
                            }}
                          />
                          <button
                            onClick={() => handleRenameSave(file.id)}
                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={handleRenameCancel}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                          {file.name}
                        </h3>
                        <button
                          onClick={() => handleRenameStart(file)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline whitespace-nowrap flex-shrink-0"
                        >
                          Rename
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{file.uploadedBy}</span>
                      </div>
                      <div className="flex items-center">
                        <span>{file.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmailFile(file);
                        }}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                        title="Send via Email"
                      >
                        <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Email</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Downloaded ' + file.name);
                        }}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Download</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Deleted ' + file.name);
                        }}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Delete</span>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded By</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Modified</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentFolderFiles.map((file) => {
                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              onMouseEnter={(e) => handleFileHover(file.id, e)}
                              onMouseLeave={() => handleFileHover(null)}
                              className="cursor-pointer"
                            >
                              {getFileIcon(file.type)}
                            </div>
                            {renamingFileId === file.id ? (
                              <div className="flex items-center gap-1 flex-1">
                                <Input
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className="h-7 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSave(file.id);
                                    if (e.key === 'Escape') handleRenameCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleRenameSave(file.id)}
                                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button
                                  onClick={handleRenameCancel}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => handleRenameStart(file)}
                                className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                              >
                                {file.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {file.uploadedBy}
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {file.size}
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {file.uploadedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailFile(file);
                              }}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-all"
                              title="Send via Email"
                            >
                              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Downloaded ' + file.name);
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(file);
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                              title="Rename"
                            >
                              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Deleted ' + file.name);
                              }}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Document Search - Only for Firm - Fixed to bottom */}
      {showAISearch && !selectedFolder && (
        <div className={cn(
          "border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 transition-all duration-300",
          showAIExpanded ? "min-h-[600px]" : ""
        )}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    AI Document Assistant
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask questions about your firm documents and get instant answers
                  </p>
                </div>
              </div>
              {showAIExpanded && (
                <button
                  onClick={() => {
                    setShowAIExpanded(false);
                    setAiResponse(null);
                    setAiQuery('');
                  }}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                  title="Close AI Assistant"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>

            {!showAIExpanded && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setAiQuery(question)}
                      className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
                    >
                      {question}
                    </button>
                  ))  }
                </div>
              </div>
            )}

            {aiResponse ? (
              <>
                <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">AI Response</h4>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {aiResponse}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Disclaimer:</strong> AI responses may contain inaccuracies or outdated information. Always verify critical information with the original documents or consult with appropriate personnel.
                    </span>
                  </p>
                </div>

                {/* Follow-up question input */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Ask a follow-up question..."
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      rows={2}
                      className="resize-none border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAISearch();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleAISearch}
                    disabled={aiSearching || !aiQuery.trim()}
                    className="gap-2 h-auto"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    {aiSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Initial question input */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your question here... (e.g., What is our PTO policy?)"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      rows={2}
                      className="resize-none border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAISearch();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleAISearch}
                    disabled={aiSearching || !aiQuery.trim()}
                    className="gap-2 h-auto"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    {aiSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent aria-describedby="create-folder-description">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription id="create-folder-description">
              Create a new folder to organize your documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
              />
            </div>
            <div>
              <Label className="mb-3 block">Folder Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewFolderType('shared')}
                  className={cn(
                    "p-4 border-2 rounded-lg text-left transition-all",
                    newFolderType === 'shared'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Shared</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Visible to all team members
                  </p>
                </button>
                <button
                  onClick={() => setNewFolderType('private')}
                  className={cn(
                    "p-4 border-2 rounded-lg text-left transition-all",
                    newFolderType === 'private'
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Private</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Only visible to you
                  </p>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} style={{ backgroundColor: 'var(--primaryColor)' }}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="*/*"
      />

      {/* File Preview Hover */}
      {hoveredFileId && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y - 220}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4 shadow-2xl w-64">
            <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center mb-3">
              {(() => {
                const file = files.find(f => f.id === hoveredFileId);
                if (!file) return null;
                
                if (file.type === 'image') {
                  return <div className="text-center text-gray-500 dark:text-gray-400 text-sm">Image Preview</div>;
                } else if (file.type === 'pdf') {
                  return (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-red-500 mb-2 mx-auto" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">PDF Document</span>
                    </div>
                  );
                } else if (file.type === 'spreadsheet') {
                  return (
                    <div className="text-center">
                      <FileSpreadsheet className="w-16 h-16 text-green-500 mb-2 mx-auto" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Spreadsheet</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center">
                      <File className="w-16 h-16 text-gray-400 mb-2 mx-auto" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">File Preview</span>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="text-center">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {files.find(f => f.id === hoveredFileId)?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {files.find(f => f.id === hoveredFileId)?.size}
              </p>
            </div>
          </div>
          {/* Arrow pointing down */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              bottom: '-8px',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid rgb(216, 180, 254)'
            }}
          />
        </div>
      )}

      {/* Send Files Dialog */}
      <SendFilesDialog
        open={showSendDialog}
        onClose={() => {
          setShowSendDialog(false);
          setFileToEmail(null);
          setFolderFilesToEmail([]);
        }}
        clientName={clientName}
        clientEmail={`${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`}
        initialFiles={
          folderFilesToEmail.length > 0 
            ? folderFilesToEmail 
            : fileToEmail 
              ? [{
                  id: fileToEmail.id,
                  name: fileToEmail.name,
                  folderPath: getFolderPath(fileToEmail.folderId),
                  type: fileToEmail.type,
                }] 
              : []
        }
        allFolders={folders}
        allFiles={files}
        getFolderPath={getFolderPath}
      />
    </div>
  );
}
