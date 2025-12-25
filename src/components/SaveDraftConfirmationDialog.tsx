import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

type SaveDraftConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAndContinue: () => void;
  onDiscardAndContinue: () => void;
  onCancel: () => void;
};

export function SaveDraftConfirmationDialog({
  open,
  onOpenChange,
  onSaveAndContinue,
  onDiscardAndContinue,
  onCancel,
}: SaveDraftConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="save-draft-description">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div className="flex-1">
              <DialogTitle>Save as Draft?</DialogTitle>
              <DialogDescription className="mt-1" id="save-draft-description">
                You have unsaved changes in your email
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            You're composing an email with content. Would you like to save it as a draft before viewing the selected email?
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={onSaveAndContinue}
            className="w-full"
          >
            Save as Draft & Continue
          </Button>
          <Button
            onClick={onDiscardAndContinue}
            variant="outline"
            className="w-full"
          >
            Discard & Continue
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Keep Composing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}