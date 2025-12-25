import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  File,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Search,
  X,
  Check,
  Link2,
  Folder,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Briefcase,
  Paperclip,
} from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string; // for files: 'pdf', 'image', 'document', etc.
  size?: number; // for files
  uploadedAt?: Date; // for files
  uploadedBy?: string; // for files
  itemCount?: number; // for folders
  previewUrl?: string; // for files with previews
};

type Client = {
  id: string;
  name: string;
  email: string;
  type: 'Individual' | 'Business';
};

type ConnectedAccount = {
  id: string;
  name: string;
  relationship: string; // 'Spouse', 'Business', 'Trust', etc.
  email: string;
};

type InlineEmailFileManagerProps = {
  onBack: () => void;
  onSelectDocuments: (docs: Array<{ doc: any; asLink: boolean }>) => void;
  recipientClientIds?: string[];
  onAddRecipient?: (clientId: string, clientName: string, clientEmail: string) => void;
};

export function InlineEmailFileManager({
  onBack,
  onSelectDocuments,
  recipientClientIds = [],
  onAddRecipient,
}: InlineEmailFileManagerProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'allClients' | 'connected' | 'firm'>('client');
  const [viewMode, setViewMode] = useState<'list' | 'files'>('files'); // 'list' for client list, 'files' for file browser
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    recipientClientIds.length > 0 ? recipientClientIds[0] : null
  );
  const [currentPath, setCurrentPath] = useState<string[]>([]); // folder breadcrumbs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [shareAsLinks, setShareAsLinks] = useState<Set<string>>(new Set());

  // Mock clients
  const allClients: Client[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', type: 'Individual' },
    { id: '2', name: 'Mary Johnson', email: 'mary@example.com', type: 'Individual' },
    { id: '3', name: 'Tech Innovations LLC', email: 'contact@techinnovations.com', type: 'Business' },
    { id: '4', name: 'Smith Family Trust', email: 'trust@smithfamily.com', type: 'Business' },
    { id: '5', name: 'Sarah Williams', email: 'sarah@example.com', type: 'Individual' },
  ];

  // Mock connected accounts (linked entities for selected client)
  const connectedAccounts: ConnectedAccount[] = selectedClientId === '1' ? [
    { id: '2', name: 'Mary Smith', relationship: 'Spouse', email: 'mary@smithfamily.com' },
    { id: '6', name: 'Smith Consulting LLC', relationship: 'Business', email: 'info@smithconsulting.com' },
    { id: '7', name: 'Smith Properties Inc', relationship: 'Business', email: 'contact@smithproperties.com' },
  ] : selectedClientId === '3' ? [
    { id: '8', name: 'Tech Innovations Subsidiary', relationship: 'Subsidiary', email: 'sub@techinnovations.com' },
  ] : [];

  // Mock file structure - organized by client and path
  const getFilesForPath = (clientId: string | null, path: string[]): FileItem[] => {
    if (!clientId) return [];

    // Root level
    if (path.length === 0) {
      if (clientId === 'firm') {
        return [
          { id: 'f1', name: 'Templates', type: 'folder', itemCount: 12 },
          { id: 'f2', name: 'Forms', type: 'folder', itemCount: 45 },
          { id: 'f3', name: 'Engagement Letters', type: 'folder', itemCount: 8 },
          { id: 'f4', name: 'Marketing Materials', type: 'folder', itemCount: 23 },
          { id: 'doc1', name: 'Firm Brochure.pdf', type: 'file', fileType: 'pdf', size: 2456789, uploadedAt: new Date('2024-11-15'), uploadedBy: 'Admin' },
          { id: 'doc2', name: 'Service Agreement Template.docx', type: 'file', fileType: 'document', size: 345678, uploadedAt: new Date('2024-12-01'), uploadedBy: 'Admin' },
        ];
      } else {
        return [
          { id: 'f1', name: 'Tax Returns', type: 'folder', itemCount: 8 },
          { id: 'f2', name: 'W-2s & 1099s', type: 'folder', itemCount: 15 },
          { id: 'f3', name: 'Receipts', type: 'folder', itemCount: 134 },
          { id: 'f4', name: 'Invoices', type: 'folder', itemCount: 12 },
          { id: 'doc1', name: '2023 Tax Return.pdf', type: 'file', fileType: 'pdf', size: 3456789, uploadedAt: new Date('2024-04-10'), uploadedBy: 'John Smith' },
          { id: 'doc2', name: 'Engagement Letter Signed.pdf', type: 'file', fileType: 'pdf', size: 234567, uploadedAt: new Date('2024-01-15'), uploadedBy: 'Firm' },
          { id: 'doc3', name: 'Tax Organizer.xlsx', type: 'file', fileType: 'spreadsheet', size: 456789, uploadedAt: new Date('2024-02-20'), uploadedBy: 'John Smith' },
        ];
      }
    }

    // Subfolder: Tax Returns
    if (path[0] === 'Tax Returns') {
      return [
        { id: 'doc10', name: '2023 Federal 1040.pdf', type: 'file', fileType: 'pdf', size: 1234567, uploadedAt: new Date('2024-04-10'), uploadedBy: 'Firm' },
        { id: 'doc11', name: '2023 State Return.pdf', type: 'file', fileType: 'pdf', size: 987654, uploadedAt: new Date('2024-04-10'), uploadedBy: 'Firm' },
        { id: 'doc12', name: '2022 Federal 1040.pdf', type: 'file', fileType: 'pdf', size: 1156789, uploadedAt: new Date('2023-04-12'), uploadedBy: 'Firm' },
        { id: 'doc13', name: '2022 State Return.pdf', type: 'file', fileType: 'pdf', size: 934567, uploadedAt: new Date('2023-04-12'), uploadedBy: 'Firm' },
      ];
    }

    // Subfolder: W-2s & 1099s
    if (path[0] === 'W-2s & 1099s') {
      return [
        { id: 'doc20', name: '2023 W-2 - Employer A.pdf', type: 'file', fileType: 'pdf', size: 234567, uploadedAt: new Date('2024-02-01'), uploadedBy: 'John Smith' },
        { id: 'doc21', name: '2023 W-2 - Employer B.pdf', type: 'file', fileType: 'pdf', size: 245678, uploadedAt: new Date('2024-02-01'), uploadedBy: 'John Smith' },
        { id: 'doc22', name: '2023 1099-INT - Bank.pdf', type: 'file', fileType: 'pdf', size: 123456, uploadedAt: new Date('2024-02-15'), uploadedBy: 'John Smith' },
        { id: 'doc23', name: '2023 1099-DIV - Investments.pdf', type: 'file', fileType: 'pdf', size: 234567, uploadedAt: new Date('2024-02-15'), uploadedBy: 'John Smith' },
      ];
    }

    // Subfolder: Receipts
    if (path[0] === 'Receipts') {
      return [
        { id: 'f10', name: 'Charitable Donations', type: 'folder', itemCount: 23 },
        { id: 'f11', name: 'Medical Expenses', type: 'folder', itemCount: 45 },
        { id: 'f12', name: 'Business Expenses', type: 'folder', itemCount: 66 },
        { id: 'img1', name: 'Receipt_001.jpg', type: 'file', fileType: 'image', size: 234567, uploadedAt: new Date('2024-03-15'), uploadedBy: 'John Smith', previewUrl: 'https://images.unsplash.com/photo-1554224311-beee4ece3c5d?w=400&h=300&fit=crop' },
        { id: 'img2', name: 'Receipt_002.png', type: 'file', fileType: 'image', size: 345678, uploadedAt: new Date('2024-03-20'), uploadedBy: 'John Smith', previewUrl: 'https://images.unsplash.com/photo-1572893218889-3c6c8f6b81c4?w=400&h=300&fit=crop' },
      ];
    }

    // Firm: Templates folder
    if (path[0] === 'Templates') {
      return [
        { id: 'doc30', name: 'Tax Return Cover Letter.docx', type: 'file', fileType: 'document', size: 123456, uploadedAt: new Date('2024-01-10'), uploadedBy: 'Admin' },
        { id: 'doc31', name: 'Document Request Email.html', type: 'file', fileType: 'html', size: 45678, uploadedAt: new Date('2024-01-15'), uploadedBy: 'Admin' },
        { id: 'doc32', name: 'Year-End Tax Planning Letter.docx', type: 'file', fileType: 'document', size: 234567, uploadedAt: new Date('2024-11-01'), uploadedBy: 'Admin' },
      ];
    }

    return [];
  };

  const currentFiles = getFilesForPath(
    activeTab === 'firm' ? 'firm' : selectedClientId,
    currentPath
  );

  const selectedClient = allClients.find(c => c.id === selectedClientId);

  const handleFileToggle = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
      const newLinks = new Set(shareAsLinks);
      newLinks.delete(fileId);
      setShareAsLinks(newLinks);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleLinkToggle = (fileId: string) => {
    const newLinks = new Set(shareAsLinks);
    if (newLinks.has(fileId)) {
      newLinks.delete(fileId);
    } else {
      newLinks.add(fileId);
    }
    setShareAsLinks(newLinks);
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentPath([]);
    setViewMode('files');
  };

  const handleConnectedAccountSelect = (accountId: string) => {
    setSelectedClientId(accountId);
    setCurrentPath([]);
    setViewMode('files');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentPath([]);
  };

  const handleTabChange = (tab: string) => {
    const newTab = tab as 'client' | 'allClients' | 'connected' | 'firm';
    setActiveTab(newTab);
    
    if (newTab === 'client') {
      // Default to first recipient or null
      setSelectedClientId(recipientClientIds.length > 0 ? recipientClientIds[0] : null);
      setViewMode('files');
      setCurrentPath([]);
    } else if (newTab === 'allClients') {
      setViewMode('list');
      setCurrentPath([]);
    } else if (newTab === 'connected') {
      setViewMode('list');
      setCurrentPath([]);
    } else if (newTab === 'firm') {
      setSelectedClientId('firm');
      setViewMode('files');
      setCurrentPath([]);
    }
  };

  const handleAttach = () => {
    const selectedDocsData = Array.from(selectedFiles).map(fileId => {
      // Find the file in current files
      const file = currentFiles.find(f => f.id === fileId && f.type === 'file');
      if (!file) return null;

      return {
        doc: {
          id: file.id,
          name: file.name,
          type: file.fileType || 'file',
          size: file.size || 0,
        },
        asLink: shareAsLinks.has(fileId), // Respect per-file selection
      };
    }).filter(Boolean) as Array<{ doc: any; asLink: boolean }>;

    if (selectedDocsData.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    const attachCount = selectedDocsData.filter(d => !d.asLink).length;
    const linkCount = selectedDocsData.filter(d => d.asLink).length;

    onSelectDocuments(selectedDocsData);
    
    if (attachCount > 0 && linkCount > 0) {
      toast.success(`${attachCount} file(s) attached, ${linkCount} link(s) added`);
    } else if (attachCount > 0) {
      toast.success(`${attachCount} file(s) attached to email`);
    } else {
      toast.success(`${linkCount} secure link(s) added to email`);
    }
    
    onBack();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType === 'document' || fileType === 'html') return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType === 'spreadsheet') return <FileText className="w-5 h-5 text-green-500" />;
    if (fileType === 'image') return <ImageIcon className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onBack}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <FolderOpen className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Attach from File Manager
            </h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onBack}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="client">
              <User className="w-4 h-4 mr-2" />
              Client Documents
            </TabsTrigger>
            <TabsTrigger value="connected">
              <Building2 className="w-4 h-4 mr-2" />
              Linked Accounts
            </TabsTrigger>
            <TabsTrigger value="firm">
              <Briefcase className="w-4 h-4 mr-2" />
              Firm Documents
            </TabsTrigger>
            <TabsTrigger value="allClients">
              <Users className="w-4 h-4 mr-2" />
              All Clients
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Client Documents Tab */}
        {activeTab === 'client' && (
          <>
            {recipientClientIds.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Recipient Selected
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Select a client below to browse their documents. The selected client will be automatically added to the "To" field.
                    </p>
                  </div>

                  {/* Client Selection Grid */}
                  <div className="mb-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {allClients
                      .filter(client => 
                        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        client.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(client => (
                        <button
                          key={client.id}
                          onClick={() => {
                            // Add client to recipients
                            if (onAddRecipient) {
                              onAddRecipient(client.id, client.name, client.email);
                            }
                            handleClientSelect(client.id);
                          }}
                          className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            client.type === 'Business'
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-green-100 dark:bg-green-900/30"
                          )}>
                            {client.type === 'Business' ? (
                              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {client.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {client.email}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Client selector if multiple recipients */}
                {recipientClientIds.length > 1 && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <Label className="text-sm font-medium mb-2 block">Viewing documents for:</Label>
                    <div className="flex gap-2">
                      {recipientClientIds.map(clientId => {
                        const client = allClients.find(c => c.id === clientId);
                        if (!client) return null;
                        return (
                          <button
                            key={clientId}
                            onClick={() => setSelectedClientId(clientId)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                              selectedClientId === clientId
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                            )}
                          >
                            {client.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {renderFileBrowser()}
              </>
            )}
          </>
        )}

        {/* Linked Accounts Tab */}
        {activeTab === 'connected' && (
          <>
            {viewMode === 'list' ? (
              <div className="flex-1 overflow-y-auto p-4">
                {recipientClientIds.length === 0 || !selectedClient ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No Client Selected
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add a recipient to view their linked accounts
                      </p>
                    </div>
                  </div>
                ) : connectedAccounts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No Linked Accounts
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedClient.name} has no linked entities
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Connected to {selectedClient.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        These entities are linked to this client
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {connectedAccounts.map(account => (
                        <button
                          key={account.id}
                          onClick={() => handleConnectedAccountSelect(account.id)}
                          className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {account.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {account.relationship}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              renderFileBrowser()
            )}
          </>
        )}

        {/* Firm Documents Tab */}
        {activeTab === 'firm' && renderFileBrowser()}

        {/* All Clients Tab */}
        {activeTab === 'allClients' && (
          <>
            {viewMode === 'list' ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {allClients
                    .filter(client => 
                      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      client.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client.id)}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          {client.type === 'Business' ? (
                            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {client.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {client.email}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              renderFileBrowser()
            )}
          </>
        )}
      </div>

      {/* Footer - Attach Button */}
      {viewMode === 'files' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.size === 0 ? (
                'No files selected'
              ) : (
                <>
                  {selectedFiles.size} file(s) selected
                  {shareAsLinks.size > 0 && ` (${shareAsLinks.size} as link${shareAsLinks.size > 1 ? 's' : ''})`}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button
                onClick={handleAttach}
                disabled={selectedFiles.size === 0}
                style={{ backgroundColor: selectedFiles.size > 0 ? 'var(--primaryColor)' : undefined }}
              >
                Attach {selectedFiles.size > 0 && `(${selectedFiles.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderFileBrowser() {
    return (
      <>
        {/* Breadcrumbs and Back to List */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <div className="space-y-2">
            {/* First Line: Client/Firm Badge */}
            <div className="flex items-center gap-2">
              {/* Client Badge */}
              {selectedClient && activeTab !== 'firm' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  {selectedClient.type === 'Business' ? (
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {selectedClient.name}
                  </span>
                </div>
              )}

              {/* Firm Badge */}
              {activeTab === 'firm' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Firm Documents
                  </span>
                </div>
              )}
            </div>

            {/* Second Line: Back Button + Breadcrumbs */}
            <div className="flex items-center gap-3">
              {/* Back to List Button */}
              {(activeTab === 'allClients' || activeTab === 'connected') && viewMode === 'files' && (
                <Button size="sm" variant="ghost" onClick={handleBackToList} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to List
                </Button>
              )}

              {/* Breadcrumbs */}
              {currentPath.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPath([])}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                  {currentPath.map((folder, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={() => handleBreadcrumbClick(index + 1)}
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        {folder}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File List */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4">
            {currentFiles.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Files or Folders
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This location is empty
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Folders first */}
                {currentFiles
                  .filter(item => item.type === 'folder')
                  .map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderClick(folder.name)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {folder.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {folder.itemCount} items
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}

                {/* Files */}
                <TooltipProvider>
                  {currentFiles
                    .filter(item => item.type === 'file')
                    .map(file => {
                      const isSelected = selectedFiles.has(file.id);
                      const isLink = shareAsLinks.has(file.id);

                      return (
                        <Tooltip key={file.id} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Card
                              className={cn(
                                'p-3 cursor-pointer transition-all',
                                isSelected
                                  ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                  : 'hover:border-gray-300 dark:hover:border-gray-600'
                              )}
                              onClick={() => handleFileToggle(file.id)}
                            >
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <div
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                              isSelected
                                ? 'bg-purple-600 border-purple-600'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>

                          {/* File Icon */}
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 cursor-help">
                                  {getFileIcon(file.fileType || 'file')}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="p-0 max-w-sm" sideOffset={10}>
                                {file.fileType === 'image' && file.previewUrl ? (
                                  // Image preview
                                  <div className="w-80">
                                    <img 
                                      src={file.previewUrl} 
                                      alt={file.name}
                                      className="w-full h-60 object-cover rounded-t-md"
                                    />
                                    <div className="p-3 bg-white dark:bg-gray-950">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatFileSize(file.size || 0)} • {file.uploadedAt ? format(file.uploadedAt, 'MMM d, yyyy') : 'Unknown date'}
                                      </p>
                                    </div>
                                  </div>
                                ) : file.fileType === 'pdf' ? (
                                  // PDF preview
                                  <div className="w-64 p-4 bg-white dark:bg-gray-950">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-red-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          PDF Document
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                      <div className="flex justify-between">
                                        <span>Size:</span>
                                        <span className="font-medium">{formatFileSize(file.size || 0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Uploaded:</span>
                                        <span className="font-medium">{file.uploadedAt ? format(file.uploadedAt, 'MMM d, yyyy') : 'Unknown'}</span>
                                      </div>
                                      {file.uploadedBy && (
                                        <div className="flex justify-between">
                                          <span>By:</span>
                                          <span className="font-medium">{file.uploadedBy}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  // Other file types
                                  <div className="w-64 p-4 bg-white dark:bg-gray-950">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                        {getFileIcon(file.fileType || 'file')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                                          {file.fileType === 'spreadsheet' ? 'Spreadsheet' : 
                                           file.fileType === 'document' ? 'Document' : 
                                           file.fileType === 'html' ? 'HTML File' : 'File'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                      <div className="flex justify-between">
                                        <span>Size:</span>
                                        <span className="font-medium">{formatFileSize(file.size || 0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Uploaded:</span>
                                        <span className="font-medium">{file.uploadedAt ? format(file.uploadedAt, 'MMM d, yyyy') : 'Unknown'}</span>
                                      </div>
                                      {file.uploadedBy && (
                                        <div className="flex justify-between">
                                          <span>By:</span>
                                          <span className="font-medium">{file.uploadedBy}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {file.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size || 0)} • {file.uploadedAt ? format(file.uploadedAt, 'MMM d, yyyy') : 'Unknown date'}
                            </p>
                          </div>

                          {/* Mode Selection Buttons - Both visible when selected */}
                          {isSelected && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={!isLink ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Set to attach mode (not link)
                                    const newLinks = new Set(shareAsLinks);
                                    newLinks.delete(file.id);
                                    setShareAsLinks(newLinks);
                                  }}
                                  className={cn(
                                    'gap-2 transition-opacity',
                                    !isLink 
                                      ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 opacity-100' 
                                      : 'opacity-40 hover:opacity-60'
                                  )}
                                  title="Attach file directly to email"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  Attach File
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isLink ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Set to link mode
                                    const newLinks = new Set(shareAsLinks);
                                    newLinks.add(file.id);
                                    setShareAsLinks(newLinks);
                                  }}
                                  className={cn(
                                    'gap-2 transition-opacity',
                                    isLink 
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 opacity-100' 
                                      : 'opacity-40 hover:opacity-60'
                                  )}
                                  title="Send as secure link"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  Secure Link
                                </Button>
                              </div>
                              
                              {/* Explanation text below buttons */}
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed text-right">
                                {!isLink ? (
                                  <span className="text-purple-700 dark:text-purple-400">
                                    📎 File will be attached directly to the email
                                  </span>
                                ) : (
                                  <span className="text-blue-700 dark:text-blue-400">
                                    🔗 A secure, trackable link will be inserted
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0 border-0" sideOffset={10}>
                      {file.previewUrl ? (
                        <div className="w-64 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-purple-300 dark:border-purple-600">
                          <img 
                            src={file.previewUrl} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              {getFileIcon(file.fileType || 'file')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {file.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {formatFileSize(file.size || 0)}
                              </p>
                              {file.uploadedAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Uploaded {format(file.uploadedAt, 'MMM d, yyyy')}
                                </p>
                              )}
                              {file.uploadedBy && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  By {file.uploadedBy}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
              </div>
            )}
          </div>
        </ScrollArea>
      </>
    );
  }
}