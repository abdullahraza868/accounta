import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';

interface DeleteDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentCount: number;
  onConfirm: () => void;
}

export function DeleteDocumentsDialog({
  open,
  onOpenChange,
  documentCount,
  onConfirm,
}: DeleteDocumentsDialogProps) {
  const [clickCount, setClickCount] = useState(0);

  const handleOutsideClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 1) {
      onOpenChange(false);
      setClickCount(0);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    toast.success(`Deleted ${documentCount} document${documentCount > 1 ? 's' : ''}`);
    onOpenChange(false);
    setClickCount(0);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (!open) handleOutsideClick();
      }}
    >
      <DialogContent 
        className="max-w-md"
        aria-describedby="delete-documents-description"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleOutsideClick();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl">Delete Documents</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2" id="delete-documents-description">
            Are you sure you want to delete {documentCount} document{documentCount > 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            <p className="font-semibold mb-1">
              You are about to permanently delete {documentCount} document{documentCount > 1 ? 's' : ''}.
            </p>
            <p className="text-sm">
              This action cannot be reversed. The document{documentCount > 1 ? 's' : ''} will be permanently removed from the system.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Warning:</strong> Deleted documents cannot be recovered. Make sure you have backups if needed.
          </p>
        </div>

        {clickCount === 1 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click outside again to close without deleting
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setClickCount(0);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}