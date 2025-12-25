import { useState } from 'react';
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
import { Mail, Link2, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';

type RequestDocumentDialogProps = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
};

export function RequestDocumentDialog({
  open,
  onClose,
  clientId,
  clientName,
}: RequestDocumentDialogProps) {
  const [documentDescription, setDocumentDescription] = useState('');
  const [emailSubject, setEmailSubject] = useState(`Document Request from Your Accountant`);
  const [emailBody, setEmailBody] = useState(
    `Hi there,\n\nWe need the following document(s) from you to complete your records:\n\n[DOCUMENT_DESCRIPTION]\n\nPlease use the secure link below to upload the requested document(s). You'll need to verify your phone number for security.\n\n[SECURE_UPLOAD_LINK]\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nYour Accounting Team`
  );

  const [secureLink] = useState(
    `${window.location.origin}/secure-upload/${clientId}/${Math.random().toString(36).substring(2, 15)}`
  );

  const handleSendRequest = () => {
    if (!documentDescription.trim()) {
      toast.error('Please describe what document you need');
      return;
    }

    // Replace placeholders in email
    const finalEmailBody = emailBody
      .replace('[DOCUMENT_DESCRIPTION]', documentDescription)
      .replace('[SECURE_UPLOAD_LINK]', secureLink);

    // In real implementation, this would:
    // 1. Create a secure upload token
    // 2. Send email to client
    // 3. Add document to requested list

    toast.success(`Document request sent to ${clientName}`);
    
    // Reset and close
    setDocumentDescription('');
    setEmailBody(
      `Hi there,\n\nWe need the following document(s) from you to complete your records:\n\n[DOCUMENT_DESCRIPTION]\n\nPlease use the secure link below to upload the requested document(s). You'll need to verify your phone number for security.\n\n[SECURE_UPLOAD_LINK]\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nYour Accounting Team`
    );
    onClose();
  };

  const copySecureLink = () => {
    navigator.clipboard.writeText(secureLink);
    toast.success('Secure link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="request-document-description">
        <DialogHeader>
          <DialogTitle>Request Document from {clientName}</DialogTitle>
          <DialogDescription id="request-document-description">
            Send a secure document upload request to your client via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Test Link Alert */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Link2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <strong>Test Secure Upload Flow:</strong>
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

          {/* Document Description */}
          <div>
            <Label htmlFor="document-description">
              What document do you need?
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="document-description"
              placeholder="E.g., W-2 form for 2024, Bank statements for October 2024, Property tax bill..."
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Be specific so the client knows exactly what to upload
            </p>
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
                className="mt-2 font-mono text-sm"
                rows={12}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <strong>Note:</strong> [DOCUMENT_DESCRIPTION] and [SECURE_UPLOAD_LINK] will be automatically replaced when sent
              </p>
            </div>
          </div>

          {/* Security Info */}
          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200 text-sm">
              <strong>Security:</strong> The secure upload link requires phone verification before allowing file uploads. 
              The link is unique and can only be used by this client.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="btn-primary gap-2"
            onClick={handleSendRequest}
            disabled={!documentDescription.trim()}
          >
            <Mail className="w-4 h-4" />
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
