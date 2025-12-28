import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  FileText,
  Download,
  RefreshCw,
  Image as ImageIcon,
  File,
  User,
  Building2,
  Eye,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner';

type DocumentStatus = 'uploaded' | 'requested' | 'pending';
type DocumentType = 'pdf' | 'image' | 'other';

type ClientDocument = {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt?: string; // ISO date string
  requestedAt?: string; // ISO date string
  previewUrl?: string; // For images
  size?: number; // File size in bytes
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
  requestedAt: string;
};

type ClientDocumentDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: TaxClient | null;
  documents?: ClientDocument[];
  onStartProject?: (clientId: string) => void;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


export function ClientDocumentDetailsModal({
  open,
  onOpenChange,
  client,
  documents = [],
  onStartProject,
}: ClientDocumentDetailsModalProps) {
  const [selectedDocument, setSelectedDocument] = useState<ClientDocument | null>(null);

  // Auto-select first document when modal opens
  React.useEffect(() => {
    if (open && documents.length > 0) {
      setSelectedDocument(documents[0]);
    }
  }, [open, documents]);

  // Reset selection when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedDocument(null);
    }
  }, [open]);

  const handleStartProject = () => {
    if (!client) return;
    
    toast.success(`Starting project for ${client.clientName}`);
    if (onStartProject) {
      onStartProject(client.id);
    }
    onOpenChange(false);
  };

  const handleRefresh = () => {
    toast.success('Preview refreshed');
  };

  const handleDownload = async () => {
    if (!selectedDocument || !selectedDocument.previewUrl) {
      toast.error('Download URL not available');
      return;
    }

    try {
      toast.info(`Downloading ${selectedDocument.name}...`);
      
      // Fetch the file as a blob
      const response = await fetch(selectedDocument.previewUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = selectedDocument.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success(`Downloaded ${selectedDocument.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0" style={{ maxWidth: '70vw', width: '70vw' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {client.clientName}
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  <div className="flex items-center gap-2">
                    {client.clientType === 'Business' ? (
                      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    )}
                    <span>{client.clientType}</span>
                    <span className="text-gray-400">•</span>
                    <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Split-View Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Section - Documents List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
                Documents
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {documents.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No documents</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all border",
                          selectedDocument?.id === doc.id
                            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {doc.type === 'image' ? (
                            <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          ) : doc.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <File className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {doc.name}
                            </p>
                            {doc.size && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {formatFileSize(doc.size)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Section - Preview Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Preview Header with Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedDocument ? (
                  <>
                    {selectedDocument.type === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : selectedDocument.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedDocument.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No document selected
                  </span>
                )}
              </div>
              {selectedDocument && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-2 text-xs h-7"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2 text-xs h-7"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {/* Preview Area */}
            <ScrollArea className="flex-1">
              <div className="p-6 h-full">
                {!selectedDocument ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <Eye className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select a document to preview
                    </p>
                  </div>
                ) : selectedDocument.type === 'image' && selectedDocument.previewUrl ? (
                  <div className="flex items-center justify-center h-full">
                    <img
                      src={selectedDocument.previewUrl}
                      alt={selectedDocument.name}
                      className="max-w-full max-h-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm object-contain"
                    />
                  </div>
                ) : selectedDocument.type === 'pdf' && selectedDocument.previewUrl ? (
                  <div className="h-full w-full">
                    <iframe
                      src={selectedDocument.previewUrl}
                      className="w-full h-full min-h-[600px] rounded-lg border border-gray-200 dark:border-gray-700"
                      title={selectedDocument.name}
                    />
                  </div>
                ) : selectedDocument.previewUrl ? (
                  <div className="h-full w-full">
                    <iframe
                      src={selectedDocument.previewUrl}
                      className="w-full h-full min-h-[600px] rounded-lg border border-gray-200 dark:border-gray-700"
                      title={selectedDocument.name}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <File className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {selectedDocument.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Document preview not available
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {documents.length} document{documents.length !== 1 ? 's' : ''} total
          </div>
          <Button
            onClick={handleStartProject}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            Start Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

