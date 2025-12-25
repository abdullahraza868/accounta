import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { getPaymentStatusColors } from '../utils/agingCalculations';
import { Check, Sparkles, AlertCircle } from 'lucide-react';

type SetFinalStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    client: string;
    planName: string;
    paymentStatus?: string;
    finalStatus?: string; // Auto-set by reminder strategy
    finalStatusSetBy?: 'auto' | 'manual'; // How it was set
    finalStatusSetDate?: string; // When it was set
  } | null;
  onConfirm: (status: string, notes: string) => void;
};

const finalStatuses = [
  { 
    value: 'Suspended', 
    label: 'Suspended', 
    icon: '⏸️',
    description: 'Service paused until payment received',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBorderColor: 'hover:border-amber-400 dark:hover:border-amber-600',
    selectedBorderColor: 'border-amber-500 dark:border-amber-500',
    selectedBgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-900 dark:text-amber-100'
  },
  { 
    value: 'Canceled', 
    label: 'Canceled', 
    icon: '⛔',
    description: 'Subscription permanently canceled',
    bgColor: 'bg-gray-50 dark:bg-gray-800/30',
    borderColor: 'border-gray-200 dark:border-gray-700',
    hoverBorderColor: 'hover:border-gray-400 dark:hover:border-gray-600',
    selectedBorderColor: 'border-gray-500 dark:border-gray-500',
    selectedBgColor: 'bg-gray-100 dark:bg-gray-800/50',
    textColor: 'text-gray-900 dark:text-gray-100'
  },
  { 
    value: 'In Collections', 
    label: 'In Collections', 
    icon: '💰',
    description: 'Sent to collections agency',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBorderColor: 'hover:border-purple-400 dark:hover:border-purple-600',
    selectedBorderColor: 'border-purple-500 dark:border-purple-500',
    selectedBgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-900 dark:text-purple-100'
  },
  { 
    value: 'Written Off', 
    label: 'Written Off', 
    icon: '📝',
    description: 'Bad debt written off for accounting',
    bgColor: 'bg-slate-50 dark:bg-slate-900/10',
    borderColor: 'border-slate-200 dark:border-slate-800',
    hoverBorderColor: 'hover:border-slate-400 dark:hover:border-slate-600',
    selectedBorderColor: 'border-slate-500 dark:border-slate-500',
    selectedBgColor: 'bg-slate-100 dark:bg-slate-900/30',
    textColor: 'text-slate-900 dark:text-slate-100'
  },
];

export function SetFinalStatusDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
}: SetFinalStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Set initial selected status to the current final status (if auto-set)
  useEffect(() => {
    if (subscription?.finalStatus && open) {
      setSelectedStatus(subscription.finalStatus);
    }
  }, [subscription?.finalStatus, open]);

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, notes);
      // Reset form
      setSelectedStatus('');
      setNotes('');
      onOpenChange(false);
    }
  };

  if (!subscription) return null;

  const hasFinalStatus = subscription.finalStatus;
  const isAutoSet = subscription.finalStatusSetBy === 'auto';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" aria-describedby="set-final-status-description">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {hasFinalStatus ? 'Change Final Status' : 'Set Final Status'}
          </DialogTitle>
          <DialogDescription id="set-final-status-description">
            {hasFinalStatus ? (
              <>
                Review or change the final status for <span className="font-medium">{subscription.client}</span> - {subscription.planName}
              </>
            ) : (
              <>
                Set a final/closed status for <span className="font-medium">{subscription.client}</span> - {subscription.planName}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Payment Status */}
          <div>
            <Label className="text-sm text-gray-600 dark:text-gray-400">Current Payment Status</Label>
            <div className="mt-1.5">
              {subscription.paymentStatus && (() => {
                const colorInfo = getPaymentStatusColors(subscription.paymentStatus as any);
                return (
                  <Badge className={colorInfo.badge}>
                    {colorInfo.icon} {subscription.paymentStatus}
                  </Badge>
                );
              })()}
            </div>
          </div>

          {/* Auto-Set Final Status Info */}
          {hasFinalStatus && isAutoSet && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Final Status Auto-Set by Payment Reminder Strategy
                  </h4>
                  <p className="text-xs text-purple-800 dark:text-purple-200 mb-2">
                    After all payment retries and reminder emails were exhausted, the system automatically set this subscription to <strong>{subscription.finalStatus}</strong> status{subscription.finalStatusSetDate && ` on ${subscription.finalStatusSetDate}`}.
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    You can override this status below if needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Override Info */}
          {hasFinalStatus && !isAutoSet && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Current final status: <strong>{subscription.finalStatus}</strong>{subscription.finalStatusSetDate && ` (set on ${subscription.finalStatusSetDate})`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Visual Status Selection */}
          <div>
            <Label className="text-sm mb-3 block">
              {hasFinalStatus ? 'Change Final Status' : 'Select Final Status'} <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {finalStatuses.map((status) => {
                const isSelected = selectedStatus === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setSelectedStatus(status.value)}
                    className={`
                      relative text-left p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${status.bgColor}
                      ${isSelected 
                        ? `${status.selectedBorderColor} ${status.selectedBgColor} shadow-md` 
                        : `${status.borderColor} ${status.hoverBorderColor}`
                      }
                    `}
                  >
                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Icon and Label */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl leading-none">{status.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${status.textColor}`}>
                          {status.label}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {status.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm">
              Notes (Optional)
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-1.5">
              Document why you're setting this final status and any relevant details for audit purposes.
            </p>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Customer requested cancellation due to payment issues..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              <strong>⚠️ Important:</strong> This status change will be tracked with your user ID, timestamp, and notes for reporting and audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedStatus('');
              setNotes('');
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            Confirm Status Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}