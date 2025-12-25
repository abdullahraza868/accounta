import { X, Download, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

type Discount = {
  type: 'percentage' | 'amount';
  value: number;
};

type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  amount: number;
  status: string;
  dueDate: string;
  items: InvoiceItem[];
  discount?: Discount | null;
  subtotal: number;
  memo?: string;
};

type FullInvoicePreviewProps = {
  invoice: Invoice;
  onClose: () => void;
};

export function FullInvoicePreview({ invoice, onClose }: FullInvoicePreviewProps) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
      
      if (newCount === 2) {
        onClose();
        setClickCount(0);
        return;
      }
      
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 500);
      setClickTimer(timer);
    }
  };

  // Format date for display in "Month DD, YYYY" format
  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const discountAmount = invoice.discount
    ? invoice.discount.type === 'percentage'
      ? (invoice.subtotal * invoice.discount.value) / 100
      : invoice.discount.value
    : 0;

  const issueDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">
              Invoice Preview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review your invoice before sending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Document - Stripe Style */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto bg-white dark:bg-gray-950 rounded-lg shadow-2xl overflow-hidden" style={{ maxWidth: '850px' }}>
            {/* Purple accent border at top */}
            <div className="h-2" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
            
            <div className="p-8 md:p-16">
              {/* Header with Invoice and Logo */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-5xl text-gray-900 dark:text-gray-100 mb-2" style={{ fontWeight: 300 }}>Invoice</h1>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    #{invoice.id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl mb-2" style={{ color: 'var(--primaryColor)', fontWeight: 600 }}>
                    acounta
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Acounta Demo Inc
                  </div>
                </div>
              </div>

              {/* From and Bill To Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-12 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">From</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    <div className="font-medium mb-2">Acounta Demo Inc</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>123 Business Street</div>
                      <div>Los Angeles, CA 90001</div>
                      <div>United States</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Bill To</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {invoice.clientCompany && (
                      <div className="font-medium mb-2">{invoice.clientCompany}</div>
                    )}
                    <div className={invoice.clientCompany ? 'text-sm text-gray-600 dark:text-gray-400' : 'font-medium mb-2'}>
                      {invoice.clientName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {invoice.clientEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-12 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice number</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date of issue</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{formatLongDate(issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date due</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{formatLongDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount due</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium text-lg" style={{ color: 'var(--primaryColor)' }}>
                    ${invoice.amount.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900 dark:border-gray-100">
                      <th className="text-left py-4 text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                        Description
                      </th>
                      <th className="text-center py-4 text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100 w-20" style={{ fontWeight: 600 }}>
                        Qty
                      </th>
                      <th className="text-right py-4 text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100 w-32" style={{ fontWeight: 600 }}>
                        Unit price
                      </th>
                      <th className="text-right py-4 text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100 w-32" style={{ fontWeight: 600 }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <tr key={item.id} className={index !== invoice.items.length - 1 ? 'border-b border-gray-200 dark:border-gray-800' : ''}>
                          <td className="py-4 text-gray-900 dark:text-gray-100">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="text-center py-4 text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </td>
                          <td className="text-right py-4 text-gray-900 dark:text-gray-100">
                            ${item.rate.toFixed(2)}
                          </td>
                          <td className="text-right py-4 text-gray-900 dark:text-gray-100 font-medium">
                            ${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                          No items added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Section - Stripe Style */}
              <div className="flex justify-end mb-12">
                <div className="w-full md:w-80 space-y-3">
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount && discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : `$${invoice.discount.value}`})
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-900 dark:border-gray-100">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">Amount due (USD)</span>
                    <span className="text-2xl text-gray-900 dark:text-gray-100" style={{ fontWeight: 600 }}>
                      ${invoice.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memo Section (if exists) */}
              {invoice.memo && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Notes</div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{invoice.memo}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Thank you for your business!
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Questions? Contact us at support@acounta.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}