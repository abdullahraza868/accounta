import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Mail, Copy, X, FileText, Folder, Plus, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

type FileToSend = {
  id: string;
  name: string;
  folderPath: string;
  type: string;
};

type FolderItem = {
  id: string;
  name: string;
  fileCount: number;
};

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  folderId: string;
};

type SendFilesDialogProps = {
  open: boolean;
  onClose: () => void;
  clientName: string;
  clientEmail?: string;
  initialFiles?: FileToSend[];
  allFolders: FolderItem[];
  allFiles: FileItem[];
  getFolderPath: (folderId: string) => string;
};

const emailTemplates = [
  {
    id: 'general',
    name: 'General File Share',
    subject: 'Files Shared with You',
    body: `Hi there,\n\nI'm sharing the following files with you:\n\n[FILE_LIST]\n\nYou can access these files using the secure link below:\n\n[SECURE_LINK]\n\nIf you have any questions, please let me know.\n\nBest regards`
  },
  {
    id: 'review',
    name: 'Review Request',
    subject: 'Please Review These Documents',
    body: `Hi there,\n\nCould you please review the following documents at your earliest convenience:\n\n[FILE_LIST]\n\nAccess the files here:\n\n[SECURE_LINK]\n\nPlease let me know if you have any questions or concerns.\n\nBest regards`
  },
  {
    id: 'signature',
    name: 'Signature Request',
    subject: 'Documents Requiring Your Signature',
    body: `Hi there,\n\nThe following documents require your signature:\n\n[FILE_LIST]\n\nPlease access and sign the documents using this secure link:\n\n[SECURE_LINK]\n\nIf you need any clarification, feel free to reach out.\n\nBest regards`
  },
  {
    id: 'completed',
    name: 'Completed Work',
    subject: 'Your Completed Documents',
    body: `Hi there,\n\nGreat news! Your documents have been completed and are ready for you:\n\n[FILE_LIST]\n\nAccess your files here:\n\n[SECURE_LINK]\n\nPlease review and let me know if you need anything else.\n\nBest regards`
  }
];

export function SendFilesDialog({
  open,
  onClose,
  clientName,
  clientEmail,
  initialFiles = [],
  allFolders,
  allFiles,
  getFolderPath,
}: SendFilesDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '');
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [emailSubject, setEmailSubject] = useState(emailTemplates[0].subject);
  const [emailBody, setEmailBody] = useState(emailTemplates[0].body);
  const [selectedFiles, setSelectedFiles] = useState<FileToSend[]>(initialFiles);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [browseFolder, setBrowseFolder] = useState<string | null>(null);

  const [secureLink] = useState(
    `${window.location.origin}/shared-files/${Math.random().toString(36).substring(2, 15)}`
  );

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  const handleSend = () => {
    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to send');
      return;
    }

    // Build file list for email
    const fileList = selectedFiles.map((f, i) => `${i + 1}. ${f.name} (${f.folderPath})`).join('\n');

    // Replace placeholders in email
    const finalEmailBody = emailBody
      .replace('[FILE_LIST]', fileList)
      .replace('[SECURE_LINK]', secureLink);

    // In real implementation, this would:
    // 1. Create a secure share token
    // 2. Send email to recipient
    // 3. Log the share activity

    toast.success(`${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} sent to ${recipientEmail}`);
    
    // Reset and close
    setRecipientEmail('');
    setSelectedTemplate('general');
    setEmailSubject(emailTemplates[0].subject);
    setEmailBody(emailTemplates[0].body);
    setSelectedFiles([]);
    setShowFileBrowser(false);
    setBrowseFolder(null);
    onClose();
  };

  const copySecureLink = () => {
    navigator.clipboard.writeText(secureLink);
    toast.success('Secure link copied to clipboard');
  };

  const toggleFileSelection = (file: FileItem) => {
    const folderPath = getFolderPath(file.folderId);
    const fileToSend: FileToSend = {
      id: file.id,
      name: file.name,
      folderPath,
      type: file.type,
    };

    const isSelected = selectedFiles.find(f => f.id === file.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, fileToSend]);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== fileId));
  };

  const currentBrowseFolderFiles = browseFolder 
    ? allFiles.filter(f => f.folderId === browseFolder)
    : [];

  const rootFolders = allFolders.filter(f => !f.id.startsWith('subfolder-'));
  const currentFolder = browseFolder ? allFolders.find(f => f.id === browseFolder) : null;

  // Sync with props when dialog opens or initialFiles/clientEmail changes
  useEffect(() => {
    if (open) {
      setSelectedFiles(initialFiles);
      setRecipientEmail(clientEmail || '');
    }
  }, [open, initialFiles, clientEmail]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="send-files-description">
        <DialogHeader>
          <DialogTitle>Send Files via Email</DialogTitle>
          <DialogDescription id="send-files-description">
            Share files with {clientName || 'recipient'} via secure email link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Selected Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFileBrowser(!showFileBrowser)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {showFileBrowser ? 'Hide File Browser' : 'Add More Files'}
              </Button>
            </div>
            
            {selectedFiles.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Folder className="w-3 h-3" />
                        {file.folderPath}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No files selected. Click "Add More Files" to browse.
                </p>
              </div>
            )}
          </div>

          {/* File Browser */}
          {showFileBrowser && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
                <h4 className="font-medium text-sm">Browse Files</h4>
              </div>

              {/* Breadcrumb */}
              {browseFolder && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setBrowseFolder(null)}
                    className="hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    All Folders
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="font-medium">{currentFolder?.name}</span>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {!browseFolder ? (
                  // Show folders
                  <>
                    {rootFolders.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No folders available
                      </p>
                    ) : (
                      rootFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => setBrowseFolder(folder.id)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                          <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {folder.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  // Show files in selected folder
                  <>
                    {currentBrowseFolderFiles.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No files in this folder
                      </p>
                    ) : (
                      currentBrowseFolderFiles.map((file) => {
                        const isSelected = selectedFiles.find(f => f.id === file.id);
                        return (
                          <button
                            key={file.id}
                            onClick={() => toggleFileSelection(file)}
                            className={cn(
                              "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
                              isSelected
                                ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400 dark:border-purple-600"
                                : "hover:bg-white dark:hover:bg-gray-800 border-2 border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                              isSelected
                                ? "bg-purple-600 border-purple-600"
                                : "border-gray-300 dark:border-gray-600"
                            )}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {file.size}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Recipient Email */}
          <div>
            <Label htmlFor="recipient-email">
              Recipient Email
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="client@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Template Selector */}
          <div>
            <Label htmlFor="template-selector">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Preview */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              <h3 className="font-semibold text-gray-900 dark:text-white">Email Preview</h3>
              <Badge variant="outline" className="text-xs">Editable</Badge>
            </div>

            {/* Email Subject */}
            <div className="mb-4">
              <Label htmlFor="email-subject" className="text-sm">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Email Body */}
            <div>
              <Label htmlFor="email-body" className="text-sm">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="mt-2 font-mono text-xs"
                rows={12}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <strong>[FILE_LIST]</strong> will be replaced with the list of files • 
                <strong> [SECURE_LINK]</strong> will be replaced with a secure access link
              </p>
            </div>
          </div>

          {/* Secure Link Preview */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <strong>Secure Share Link:</strong>
                  <div className="text-xs mt-1 font-mono bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800 break-all">
                    {secureLink}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySecureLink}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            disabled={selectedFiles.length === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}