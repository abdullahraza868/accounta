import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { FileDown, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

type Email = {
  id: string;
  from: string;
  fromInitials: string;
  to: string[];
  cc?: string[];
  subject: string;
  content: string;
  timestamp: string;
  date: string;
  attachments?: { name: string; type: string; size: string }[];
  isFromFirm: boolean;
};

type EmailPDFPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  emails: Email[];
};

export function EmailPDFPreviewDialog({ open, onOpenChange, subject, emails }: EmailPDFPreviewDialogProps) {
  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    toast.success('PDF downloaded successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh]"
        aria-describedby="email-pdf-preview-description"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.doubleClick === 'close') {
            onOpenChange(false);
          } else {
            target.dataset.doubleClick = 'close';
            setTimeout(() => {
              delete target.dataset.doubleClick;
            }, 300);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileDown className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
            Export Email Thread as PDF
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400" id="email-pdf-preview-description">
            Preview the email thread before downloading as PDF
          </DialogDescription>
        </DialogHeader>

        {/* PDF Preview Area */}
        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm">
          <ScrollArea className="h-[60vh]">
            {/* Email Thread Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{subject}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {emails.length} {emails.length === 1 ? 'message' : 'messages'} in this thread
              </p>
            </div>

            {/* Email Messages */}
            <div className="space-y-6">
              {emails.map((email, index) => (
                <div key={email.id} className="pb-4">
                  {/* Email Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{email.from}</span>
                        {email.isFromFirm && (
                          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded">
                            Firm
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>To: {email.to.join(', ')}</span>
                        {email.cc && email.cc.length > 0 && (
                          <span className="ml-2">• CC: {email.cc.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                      <div>{email.date}</div>
                      <div>{email.timestamp}</div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{email.content}</p>
                  </div>

                  {/* Attachments */}
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attachments ({email.attachments.length}):
                      </p>
                      <div className="space-y-1">
                        {email.attachments.map((att, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                            • {att.name} ({att.size})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {index < emails.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="gap-2"
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}