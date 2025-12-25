import { Client } from '../../App';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Receipt, 
  Plus, 
  Download, 
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../ui/utils';

type InvoicesTabProps = {
  client: Client;
};

export function InvoicesTab({ client }: InvoicesTabProps) {
  // Mock invoice data
  const invoices = [
    {
      id: 'INV-2024-001',
      description: 'Monthly Bookkeeping Services',
      amount: 850.00,
      status: 'paid',
      dueDate: '2024-10-15',
      paidDate: '2024-10-12',
      issueDate: '2024-10-01'
    },
    {
      id: 'INV-2024-002',
      description: 'Q3 Tax Preparation',
      amount: 1200.00,
      status: 'pending',
      dueDate: '2024-11-15',
      paidDate: null,
      issueDate: '2024-10-15'
    },
    {
      id: 'INV-2024-003',
      description: 'Annual Audit Services',
      amount: 2500.00,
      status: 'overdue',
      dueDate: '2024-10-30',
      paidDate: null,
      issueDate: '2024-09-30'
    },
    {
      id: 'INV-2024-004',
      description: 'Payroll Processing - September',
      amount: 450.00,
      status: 'paid',
      dueDate: '2024-09-15',
      paidDate: '2024-09-10',
      issueDate: '2024-09-01'
    },
    {
      id: 'INV-2024-005',
      description: 'CFO Consulting Services',
      amount: 3000.00,
      status: 'paid',
      dueDate: '2024-08-15',
      paidDate: '2024-08-14',
      issueDate: '2024-08-01'
    }
  ];

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-gray-200/60 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Outstanding</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200/60 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Paid</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200/60 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Invoices</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{invoices.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="border border-gray-200/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{invoice.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs flex items-center gap-1 w-fit", getStatusColor(invoice.status))}
                    >
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                    {invoice.paidDate && (
                      <div className="text-xs text-green-600 mt-0.5">
                        Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Mail className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
