import { useState, useEffect } from 'react';
import { MailPlus, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ClientCellDisplay } from './ClientCellDisplay';
import { DateDisplayWithTooltip } from './DateDisplayWithTooltip';
import { useAppSettings } from '../contexts/AppSettingsContext';

type Invoice = {
  id: string;
  client: string;
  clientId: string;
  clientType: 'Business' | 'Individual';
  invoiceNo: string;
  amountDue: number;
  dueDate: string;
  created: string;
  createdTime: string;
};

type BulkSendInvoicesDialogProps = {
  open: boolean;
  onClose: () => void;
  overdueInvoices: Invoice[];
  onConfirm: (selectedIds: string[]) => void;
};

export function BulkSendInvoicesDialog({
  open,
  onClose,
  overdueInvoices,
  onConfirm,
}: BulkSendInvoicesDialogProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      // Select all by default
      setSelectedInvoices(overdueInvoices.map(inv => inv.id));
      setIsSending(false);
    }
  }, [open, overdueInvoices]);

  const handleToggle = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === overdueInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(overdueInvoices.map(inv => inv.id));
    }
  };

  const handleSend = async () => {
    if (selectedInvoices.length === 0) return;
    
    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onConfirm(selectedInvoices);
    setIsSending(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const { dateFormat } = useAppSettings();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col" aria-describedby="bulk-send-invoices-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailPlus className="w-5 h-5 text-orange-600" />
            Bulk Send Overdue Invoice Reminders
          </DialogTitle>
          <DialogDescription id="bulk-send-invoices-description">
            Send reminder emails for the selected overdue invoices. Clients will receive a notification to complete payment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {overdueInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-gray-900 font-medium">No Overdue Invoices</p>
              <p className="text-sm text-gray-500 mt-1">
                All invoices are either paid or not yet overdue.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Checkbox
                  id="select-all"
                  checked={selectedInvoices.length === overdueInvoices.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Select All ({overdueInvoices.length} invoices)
                </label>
              </div>

              {/* Invoice List */}
              {overdueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
                >
                  <Checkbox
                    id={`invoice-${invoice.id}`}
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={() => handleToggle(invoice.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <ClientCellDisplay
                            clientName={invoice.client}
                            clientId={invoice.clientId}
                            clientType={invoice.clientType}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">Due: <DateDisplayWithTooltip date={invoice.dueDate} time="12:00 AM" /></span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(invoice.amountDue)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedInvoices.length} of {overdueInvoices.length} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={selectedInvoices.length === 0 || isSending}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MailPlus className="w-4 h-4 mr-2" />
                    Send {selectedInvoices.length} Reminder{selectedInvoices.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}