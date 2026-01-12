import { useState, useMemo } from 'react';
import { Client } from '../../App';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Receipt, 
  Plus, 
  Download, 
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';

type InvoicesTabProps = {
  client: Client;
};

export function InvoicesTab({ client }: InvoicesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

  // Get unique years from invoices
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    invoices.forEach(invoice => {
      const issueYear = new Date(invoice.issueDate).getFullYear().toString();
      years.add(issueYear);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [invoices]);

  // Filter invoices based on search query, status, and year
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          invoice.id.toLowerCase().includes(query) ||
          invoice.description.toLowerCase().includes(query) ||
          invoice.status.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }

      // Year filter (based on issue date)
      if (selectedYear !== 'all') {
        const issueYear = new Date(invoice.issueDate).getFullYear().toString();
        if (issueYear !== selectedYear) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, searchQuery, statusFilter, selectedYear]);

  // Calculate stats based on filtered invoices
  const filteredTotalOutstanding = filteredInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const filteredTotalPaid = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Filters - Left Side */}
        <div className="flex items-center gap-3 flex-1">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                statusFilter === 'all'
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                statusFilter === 'paid'
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
              )}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                statusFilter === 'pending'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                statusFilter === 'overdue'
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              )}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Overdue
            </button>
          </div>

          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Search - Right Side */}
        <div className="relative w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-gray-200/60 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Outstanding</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">
                ${filteredTotalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {(statusFilter !== 'all' || selectedYear !== 'all' || searchQuery) && (
                <p className="text-xs text-gray-400 mt-1">Filtered</p>
              )}
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
                ${filteredTotalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {(statusFilter !== 'all' || selectedYear !== 'all' || searchQuery) && (
                <p className="text-xs text-gray-400 mt-1">Filtered</p>
              )}
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
              <p className="text-2xl font-semibold text-gray-900 mt-1">{filteredInvoices.length}</p>
              {(statusFilter !== 'all' || selectedYear !== 'all' || searchQuery) && (
                <p className="text-xs text-gray-400 mt-1">Filtered</p>
              )}
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No invoices found matching your search' : 'No invoices found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
