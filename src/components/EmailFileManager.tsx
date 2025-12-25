import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  File,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Search,
  X,
  Check,
  Upload,
  Link2,
  Download,
  Eye,
  Clock,
  Folder,
  ChevronRight,
  Building2,
  Users,
} from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  category: string;
  clientId: string;
  clientName: string;
  accountType: 'client' | 'connected' | 'firm';
  tags?: string[];
  previewUrl?: string;
};

type EmailFileManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocuments: (docs: Array<{ doc: Document; asLink: boolean }>) => void;
  recipientClientIds?: string[]; // The client(s) receiving the email
};

export function EmailFileManager({
  isOpen,
  onClose,
  onSelectDocuments,
  recipientClientIds = [],
}: EmailFileManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [shareAsLinks, setShareAsLinks] = useState<Set<string>>(new Set()); // Docs to share as secure links
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [accountFilter, setAccountFilter] = useState<'all' | 'client' | 'connected' | 'firm'>('all');
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Mock documents - In production, filter based on recipientClientIds
  const allDocuments: Document[] = [
    // Client Documents
    {
      id: '1',
      name: '2024_Tax_Return.pdf',
      type: 'application/pdf',
      size: 2458000,
      uploadedAt: new Date('2024-12-15'),
      uploadedBy: 'John Smith',
      category: 'Tax Returns',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      accountType: 'client',
      tags: ['2024', 'Tax Return', 'Important'],
    },
    {
      id: '2',
      name: 'W2_2024.pdf',
      type: 'application/pdf',
      size: 156000,
      uploadedAt: new Date('2024-12-10'),
      uploadedBy: 'Sarah Johnson',
      category: 'Tax Documents',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      accountType: 'client',
      tags: ['W-2', '2024'],
    },
    {
      id: '3',
      name: 'Invoice_Dec_2024.pdf',
      type: 'application/pdf',
      size: 89000,
      uploadedAt: new Date('2024-12-01'),
      uploadedBy: 'System',
      category: 'Invoices',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      accountType: 'client',
    },
    {
      id: '4',
      name: 'Financial_Statement_Q4.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 445000,
      uploadedAt: new Date('2024-11-28'),
      uploadedBy: 'Michael Chen',
      category: 'Financial Statements',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      accountType: 'client',
      tags: ['Q4', '2024', 'Financial'],
    },
    // Connected Account Documents
    {
      id: '5',
      name: 'Payroll_Summary_Nov.pdf',
      type: 'application/pdf',
      size: 234000,
      uploadedAt: new Date('2024-11-30'),
      uploadedBy: 'Gusto',
      category: 'Payroll',
      clientId: '1',
      clientName: 'Troy Business Services LLC (Gusto)',
      accountType: 'connected',
      tags: ['Payroll', 'Gusto', 'November'],
    },
    {
      id: '6',
      name: 'Bank_Statement_Nov_2024.pdf',
      type: 'application/pdf',
      size: 678000,
      uploadedAt: new Date('2024-11-25'),
      uploadedBy: 'Bank of America',
      category: 'Bank Statements',
      clientId: '1',
      clientName: 'Troy Business Services LLC (BOA)',
      accountType: 'connected',
      tags: ['Bank', 'November'],
    },
    // Firm Documents
    {
      id: '7',
      name: 'Engagement_Letter_Template.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 45000,
      uploadedAt: new Date('2024-10-15'),
      uploadedBy: 'Admin',
      category: 'Templates',
      clientId: 'firm',
      clientName: 'Firm Documents',
      accountType: 'firm',
      tags: ['Template', 'Legal'],
    },
    {
      id: '8',
      name: 'Tax_Season_Checklist.pdf',
      type: 'application/pdf',
      size: 125000,
      uploadedAt: new Date('2024-09-01'),
      uploadedBy: 'Admin',
      category: 'Resources',
      clientId: 'firm',
      clientName: 'Firm Documents',
      accountType: 'firm',
      tags: ['Checklist', 'Tax Season'],
    },
    // Recently Attached (mock)
    {
      id: '9',
      name: '1099_2024.pdf',
      type: 'application/pdf',
      size: 98000,
      uploadedAt: new Date('2024-12-18'),
      uploadedBy: 'John Smith',
      category: 'Tax Documents',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      accountType: 'client',
      tags: ['1099', '2024', 'Recently Used'],
    },
  ];

  // Categories with counts
  const categories = useMemo(() => {
    const categoryCounts = allDocuments.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  }, []);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      // Search filter
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'pdf' && doc.type !== 'application/pdf') return false;
        if (filterType === 'excel' && !doc.type.includes('spreadsheet')) return false;
        if (filterType === 'word' && !doc.type.includes('word')) return false;
        if (filterType === 'image' && !doc.type.startsWith('image/')) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && doc.category !== filterCategory) {
        return false;
      }

      // Account type filter
      if (accountFilter !== 'all' && doc.accountType !== accountFilter) {
        return false;
      }

      return true;
    });
  }, [allDocuments, searchQuery, filterType, filterCategory, accountFilter]);

  // Recently attached documents
  const recentlyAttached = useMemo(() => {
    return allDocuments
      .filter(doc => doc.tags?.includes('Recently Used'))
      .slice(0, 5);
  }, []);

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
      // Also remove from share as links
      const newLinks = new Set(shareAsLinks);
      newLinks.delete(docId);
      setShareAsLinks(newLinks);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const toggleShareAsLink = (docId: string) => {
    const newLinks = new Set(shareAsLinks);
    if (newLinks.has(docId)) {
      newLinks.delete(docId);
    } else {
      newLinks.add(docId);
    }
    setShareAsLinks(newLinks);
  };

  const handleAttachSelected = () => {
    const docsToAttach = Array.from(selectedDocs).map(docId => {
      const doc = allDocuments.find(d => d.id === docId)!;
      return {
        doc,
        asLink: shareAsLinks.has(docId),
      };
    });

    onSelectDocuments(docsToAttach);
    toast.success(`${selectedDocs.size} document(s) attached`);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (type.includes('spreadsheet') || type.includes('excel')) {
      return <FileText className="w-5 h-5 text-green-500" />;
    }
    if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType) {
      case 'client':
        return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">Client</Badge>;
      case 'connected':
        return <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">Connected</Badge>;
      case 'firm':
        return <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs">Firm</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0" aria-describedby="file-manager-description">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Document File Manager
          </DialogTitle>
          <DialogDescription id="file-manager-description">
            Select documents to attach to your email. Choose to attach files or share as secure links.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Filters & Categories */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4 overflow-y-auto">
            {/* Account Type Filter */}
            <div>
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                Source
              </Label>
              <div className="space-y-1">
                <Button
                  variant={accountFilter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountFilter('all')}
                  className="w-full justify-start gap-2"
                >
                  <Folder className="w-4 h-4" />
                  All Documents
                </Button>
                <Button
                  variant={accountFilter === 'client' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountFilter('client')}
                  className="w-full justify-start gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Client Documents
                </Button>
                <Button
                  variant={accountFilter === 'connected' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountFilter('connected')}
                  className="w-full justify-start gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Connected Accounts
                </Button>
                <Button
                  variant={accountFilter === 'firm' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountFilter('firm')}
                  className="w-full justify-start gap-2"
                >
                  <Users className="w-4 h-4" />
                  Firm Documents
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                Categories
              </Label>
              <div className="space-y-1">
                <Button
                  variant={filterCategory === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                  className="w-full justify-between"
                >
                  <span>All Categories</span>
                  <Badge variant="secondary" className="text-xs">{allDocuments.length}</Badge>
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.name}
                    variant={filterCategory === cat.name ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterCategory(cat.name)}
                    className="w-full justify-between"
                  >
                    <span className="truncate">{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* File Type Filter */}
            <div>
              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                File Type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(true)}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </Button>
              </div>

              {selectedDocs.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedDocs.size} document(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedDocs(new Set());
                      setShareAsLinks(new Set());
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="all">All Documents ({filteredDocuments.length})</TabsTrigger>
                <TabsTrigger value="recent">Recently Attached ({recentlyAttached.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-4 mx-4">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 gap-2 pb-4">
                    {filteredDocuments.map(doc => {
                      const isSelected = selectedDocs.has(doc.id);
                      const isLink = shareAsLinks.has(doc.id);
                      const isHovered = hoveredDoc === doc.id;

                      return (
                        <Card
                          key={doc.id}
                          className={cn(
                            'p-3 cursor-pointer transition-all hover:shadow-md relative',
                            isSelected && 'ring-2 ring-offset-2',
                            isSelected && !isLink && 'ring-blue-500',
                            isSelected && isLink && 'ring-green-500'
                          )}
                          onMouseEnter={() => setHoveredDoc(doc.id)}
                          onMouseLeave={() => setHoveredDoc(null)}
                          onClick={() => toggleDocSelection(doc.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Selection Checkbox */}
                            <div
                              className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            {/* File Icon */}
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              {getFileIcon(doc.type)}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {doc.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {getAccountTypeBadge(doc.accountType)}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatFileSize(doc.size)}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {format(doc.uploadedAt, 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                    {doc.clientName} • {doc.category}
                                  </p>
                                  {doc.tags && doc.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {doc.tags.map(tag => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="text-xs bg-gray-100 dark:bg-gray-800"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Actions (on hover) */}
                                {isHovered && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Preview feature coming soon...');
                                      }}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success('Document downloaded');
                                      }}
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Share as Link Toggle */}
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={isLink ? 'default' : 'outline'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleShareAsLink(doc.id);
                                      }}
                                      className={cn(
                                        'gap-2 flex-1',
                                        isLink && 'bg-green-600 hover:bg-green-700 text-white'
                                      )}
                                    >
                                      <Link2 className="w-3.5 h-3.5" />
                                      {isLink ? 'Share as Secure Link' : 'Attach File'}
                                    </Button>
                                  </div>
                                  {isLink && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      Recipient will receive a secure download link
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {filteredDocuments.length === 0 && (
                      <div className="text-center py-12">
                        <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No documents found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="recent" className="flex-1 overflow-hidden mt-4 mx-4">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 gap-2 pb-4">
                    {recentlyAttached.map(doc => {
                      const isSelected = selectedDocs.has(doc.id);
                      const isLink = shareAsLinks.has(doc.id);

                      return (
                        <Card
                          key={doc.id}
                          className={cn(
                            'p-3 cursor-pointer transition-all hover:shadow-md',
                            isSelected && 'ring-2 ring-blue-500 ring-offset-2'
                          )}
                          onClick={() => toggleDocSelection(doc.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              {getFileIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {doc.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Recently attached • {formatFileSize(doc.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedDocs.size > 0 && (
              <span>
                {selectedDocs.size} selected • {shareAsLinks.size} as secure link
                {shareAsLinks.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAttachSelected}
              disabled={selectedDocs.size === 0}
              style={{ backgroundColor: selectedDocs.size > 0 ? 'var(--primaryColor)' : undefined }}
            >
              Attach {selectedDocs.size > 0 && `(${selectedDocs.size})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Missing import
import { Shield } from 'lucide-react';