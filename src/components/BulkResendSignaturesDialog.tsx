import React, { useState, useEffect } from 'react';
import { MailPlus, User, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';

type SignatureRequest = {
  id: string;
  clientName: string;
  clientType: 'Individual' | 'Business';
  documentName: string;
  sentAt: string;
  status: string;
};

type BulkResendSignaturesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overdueSignatures: SignatureRequest[];
  onResendConfirm: (selectedIds: string[]) => void;
};

export function BulkResendSignaturesDialog({
  open,
  onOpenChange,
  overdueSignatures,
  onResendConfirm,
}: BulkResendSignaturesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // Initialize with all signatures selected when dialog opens
  useEffect(() => {
    if (open && overdueSignatures.length > 0) {
      setSelectedIds(new Set(overdueSignatures.map(sig => sig.id)));
      setSelectAll(true);
    }
  }, [open, overdueSignatures]);

  const toggleSignature = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === overdueSignatures.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(overdueSignatures.map(sig => sig.id)));
      setSelectAll(true);
    }
  };

  const handleResend = () => {
    onResendConfirm(Array.from(selectedIds));
    onOpenChange(false);
  };

  const getDaysOld = (sentAt: string): number => {
    const sentDate = new Date(sentAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="bulk-resend-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailPlus className="w-5 h-5 text-orange-600" />
            Bulk Resend Signature Requests
          </DialogTitle>
          <DialogDescription id="bulk-resend-description">
            {overdueSignatures.length === 0 ? (
              'No overdue signature requests found matching your current filters.'
            ) : (
              `Send reminder emails for ${overdueSignatures.length} overdue signature request${overdueSignatures.length !== 1 ? 's' : ''}`
            )}
          </DialogDescription>
        </DialogHeader>

        {overdueSignatures.length > 0 && (
          <>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={toggleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All ({selectedIds.size} of {overdueSignatures.length} selected)
                </label>
              </div>
            </div>

            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {overdueSignatures.map((signature) => {
                  const isSelected = selectedIds.has(signature.id);
                  const daysOld = getDaysOld(signature.sentAt);

                  return (
                    <div
                      key={signature.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => toggleSignature(signature.id)}
                    >
                      <Checkbox
                        id={signature.id}
                        checked={isSelected}
                        onCheckedChange={() => toggleSignature(signature.id)}
                        className="mt-0.5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={cn(
                              "w-7 h-7 rounded flex items-center justify-center flex-shrink-0",
                              signature.clientType === 'Business'
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-green-500 to-green-600"
                            )}
                          >
                            {signature.clientType === 'Business' ? (
                              <Building2 className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {signature.clientName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-medium">
                              {daysOld}d overdue
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate pl-9">
                          {signature.documentName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResend}
                disabled={selectedIds.size === 0}
                className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <MailPlus className="w-4 h-4" />
                Resend {selectedIds.size} Request{selectedIds.size !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}

        {overdueSignatures.length === 0 && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}