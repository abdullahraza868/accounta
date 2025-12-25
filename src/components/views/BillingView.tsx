/**
 * ⚠️ DUAL VIEW FILE ⚠️
 * BillingView.tsx ↔️ BillingViewSplit.tsx
 * 
 * CRITICAL: When making changes to this file, you MUST also update BillingViewSplit.tsx
 * 
 * The ONLY differences between the two files should be:
 * - Table layout (single table vs split outstanding/paid tables)
 * - Pagination state (currentPage vs outstandingCurrentPage/paidCurrentPage)
 * 
 * Everything else MUST be kept in sync:
 * ✅ Imports, state variables, filtering logic, sorting logic
 * ✅ Toolbar (search, filters, buttons)
 * ✅ Dialogs, modals, and helper functions
 * ✅ Mock data and type definitions
 * 
 * See: /guidelines/DUAL_VIEW_SYNC_PROTOCOL.md
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import { 
  Search, 
  Download, 
  RefreshCw, 
  ChevronDown,
  Eye,
  MailPlus,
  Trash2,
  FileText,
  Check,
  Clock,
  Sparkles,
  AlertTriangle,
  LayoutGrid,
  CheckCircle,
  Plus,
  Settings,
  Edit,
  XCircle,
  CreditCard,
  Zap,
  MoreVertical,
  GripVertical,
  Repeat,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { DateTimeDisplay, DateDisplay } from '../DateTimeDisplay';
import { DateDisplayWithTooltip } from '../DateDisplayWithTooltip';
import { ClientCellDisplay } from '../ClientCellDisplay';
import { BulkSendInvoicesDialog } from '../BulkSendInvoicesDialog';
import { BillingSettingsDialog } from '../BillingSettingsDialog';
import { TablePaginationNav } from '../TablePaginationNav';
import { useAppSettings } from '../../contexts/AppSettingsContext';

type InvoiceStatus = 'Paid' | 'Draft' | 'Overdue' | 'Sent to Client';
type PaymentMethod = 'Cash' | 'Venmo' | 'Zelle' | 'ACH' | 'Wire' | 'Check' | 'PayPal' | 'Klarna' | 'Stripe';
type ClientType = 'Business' | 'Individual';

type Invoice = {
  id: string;
  client: string;
  clientId: string;
  clientType: ClientType;
  invoiceNo: string;
  created: string;
  createdTime: string;
  sentOn: string;
  sentTime: string;
  year: number;
  amountDue: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paidTime?: string;
  paidVia?: PaymentMethod;
};

type StatusFilter = 'all' | 'paid' | 'unpaid' | 'overdue' | 'draft' | 'recent';
type StatCardType = 'all' | 'paid' | 'unpaid' | 'overdue' | 'draft' | 'recent';

type StatCardConfig = {
  id: StatCardType;
  label: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  getValue: (invoices: Invoice[]) => number;
  filterValue?: StatusFilter;
  growthPercent?: number;
};

type DraggableStatCardProps = {
  config: StatCardConfig;
  index: number;
  invoices: Invoice[];
  statusFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  formatCurrency: (amount: number) => string;
};

const DraggableStatCard = ({ config, index, invoices, statusFilter, onFilterChange, moveCard, formatCurrency }: DraggableStatCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'STAT_CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'STAT_CARD',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  // Helper function defined within component scope
  const isRecentlyPaid = (paidDate?: string): boolean => {
    if (!paidDate) return false;
    const paid = new Date(paidDate);
    const now = new Date();
    const daysDiff = (now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const value = config.getValue(invoices);
  const totalAmount = invoices
    .filter(inv => {
      const filterVal = config.filterValue || config.id;
      if (filterVal === 'all') return true;
      if (filterVal === 'paid') return inv.status === 'Paid';
      if (filterVal === 'unpaid') return inv.status === 'Sent to Client';
      if (filterVal === 'overdue') return inv.status === 'Overdue';
      if (filterVal === 'draft') return inv.status === 'Draft';
      if (filterVal === 'recent') return inv.status === 'Paid' && inv.paidAt && isRecentlyPaid(inv.paidAt);
      return false;
    })
    .reduce((sum, inv) => sum + inv.amountDue, 0);

  const isActive = statusFilter === (config.filterValue || config.id);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn("relative", isDragging && "opacity-50")}
    >
      <div className="absolute top-2 left-2 text-gray-400 pointer-events-none z-10">
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => {
          const filterValue = (config.filterValue || config.id) as StatusFilter;
          // Toggle off if already active, otherwise set to this filter
          onFilterChange(isActive ? 'all' : filterValue);
        }}
        className="text-left w-full"
      >
        <Card className={cn(
          "pl-8 border-gray-200/60 shadow-sm hover:shadow-md transition-all cursor-move",
          isActive && "ring-2 ring-purple-100",
          "py-2 pr-2 h-[65px] !gap-0 !flex-row"
        )}
        style={isActive ? { borderColor: config.color, height: '65px' } : { height: '65px' }}>
          <div className="flex items-center justify-between gap-2 h-full w-full">
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 -ml-[3px]" style={{ backgroundColor: config.bgColor }}>
                {config.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-gray-500 uppercase tracking-wide leading-tight truncate">{config.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight whitespace-nowrap truncate">{config.count}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 mr-[8px]">
              <p className="text-[17px] text-gray-900 leading-none whitespace-nowrap mt-[1px]">{formatCurrency(totalAmount)}</p>
              <div className="flex items-center justify-end gap-1 mt-[8px] min-h-[12px]">
                {config.growthPercent !== undefined ? (
                  <>
                    {config.growthPercent >= 0 ? (
                      <ArrowUp className="w-2.5 h-2.5 text-green-600" />
                    ) : (
                      <ArrowDown className="w-2.5 h-2.5 text-red-600" />
                    )}
                    <span className={`text-[9px] leading-[12px] ${config.growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(config.growthPercent).toFixed(1)}% vs last year
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] leading-[12px] text-transparent">0.0% vs last year</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
};

type BillingViewProps = {
  // Add any props if needed
};

export function BillingView({}: BillingViewProps) {
  const navigate = useNavigate();
  const { formatDate } = useAppSettings();
  
  // Check if user prefers another view and redirect
  useEffect(() => {
    const preferredView = localStorage.getItem('billingViewPreference');
    if (preferredView === 'split') {
      navigate('/billing/split', { replace: true });
    } else if (preferredView === 'cards') {
      navigate('/billing/cards', { replace: true });
    }
  }, [navigate]);
  
  const [activeTab, setActiveTab] = useState<'invoices' | 'subscriptions'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paidViaFilter, setPaidViaFilter] = useState<string>('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Billing-specific settings
  const [overdueSendThreshold, setOverdueSendThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('billingOverdueSendThreshold');
    return saved ? parseInt(saved) : 7; // Default 7 days
  });
  
  const [showBulkSendDialog, setShowBulkSendDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [resentInvoices, setResentInvoices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resentInvoices');
    return saved ? JSON.parse(saved) : {};
  });

  // Mock invoice data with more business clients
  const invoices: Invoice[] = [
    {
      id: '1',
      client: 'Acme Corporation',
      clientId: '101',
      clientType: 'Business',
      invoiceNo: 'BRSC2888-0001',
      created: '2025-02-14',
      createdTime: '10:00 AM',
      sentOn: '2025-02-14',
      sentTime: '10:02 AM',
      year: 2024,
      amountDue: 2517.00,
      status: 'Paid',
      dueDate: '2025-02-14',
      paidAt: '2025-02-15',
      paidTime: '02:18 PM',
      paidVia: 'ACH',
    },
    {
      id: '2',
      client: 'TechStart Solutions LLC',
      clientId: '102',
      clientType: 'Business',
      invoiceNo: 'BRCBRX34-0002',
      created: '2025-11-20',
      createdTime: '12:31 PM',
      sentOn: '2025-11-20',
      sentTime: '12:31 PM',
      year: 2025,
      amountDue: 3250.00,
      status: 'Paid',
      dueDate: '2025-12-20',
      paidAt: '2025-11-22',
      paidTime: '01:23 PM',
      paidVia: 'Stripe',
    },
    {
      id: '3',
      client: 'Global Dynamics Inc',
      clientId: '103',
      clientType: 'Business',
      invoiceNo: 'GLB-2025-0003',
      created: '2025-02-10',
      createdTime: '12:47 PM',
      sentOn: '2025-02-10',
      sentTime: '12:50 PM',
      year: 2024,
      amountDue: 4175.00,
      status: 'Sent to Client',
      dueDate: '2025-03-13',
    },
    {
      id: '4',
      client: 'Elite Arena Sports',
      clientId: '104',
      clientType: 'Business',
      invoiceNo: 'ESG84447-0001',
      created: '2025-01-20',
      createdTime: '08:27 AM',
      sentOn: '2025-01-20',
      sentTime: '08:31 AM',
      year: 2024,
      amountDue: 1850.00,
      status: 'Paid',
      dueDate: '2025-02-28',
      paidAt: '2025-01-25',
      paidTime: '04:18 PM',
      paidVia: 'Stripe',
    },
    {
      id: '5',
      client: 'Meridian Consulting Group',
      clientId: '105',
      clientType: 'Business',
      invoiceNo: 'MCG-2025-0005',
      created: '2025-01-15',
      createdTime: '02:08 PM',
      sentOn: '2025-01-15',
      sentTime: '02:10 PM',
      year: 2024,
      amountDue: 2950.00,
      status: 'Overdue',
      dueDate: '2025-02-01',
    },
    {
      id: '6',
      client: 'Horizon Enterprises',
      clientId: '106',
      clientType: 'Business',
      invoiceNo: 'HRZ-2024-0024',
      created: '2024-12-02',
      createdTime: '03:11 PM',
      sentOn: '2024-12-02',
      sentTime: '03:11 PM',
      year: 2023,
      amountDue: 1575.00,
      status: 'Paid',
      dueDate: '2025-01-11',
      paidAt: '2024-12-20',
      paidTime: '03:11 PM',
      paidVia: 'ACH',
    },
    {
      id: '7',
      client: 'Stellar Manufacturing Co',
      clientId: '107',
      clientType: 'Business',
      invoiceNo: '96STEABG-0004',
      created: '2024-11-28',
      createdTime: '10:51 AM',
      sentOn: '2024-11-28',
      sentTime: '10:51 AM',
      year: 2023,
      amountDue: 5200.00,
      status: 'Paid',
      dueDate: '2024-12-28',
      paidAt: '2024-12-05',
      paidTime: '10:51 AM',
      paidVia: 'Check',
    },
    {
      id: '8',
      client: 'Innovate Labs LLC',
      clientId: '108',
      clientType: 'Business',
      invoiceNo: '9R5FEABG-0003',
      created: '2024-11-20',
      createdTime: '10:51 AM',
      sentOn: '2024-11-20',
      sentTime: '10:51 AM',
      year: 2023,
      amountDue: 3800.00,
      status: 'Paid',
      dueDate: '2024-12-28',
      paidAt: '2024-12-01',
      paidTime: '10:51 AM',
      paidVia: 'Stripe',
    },
    {
      id: '9',
      client: 'Quantum Solutions Inc',
      clientId: '109',
      clientType: 'Business',
      invoiceNo: 'QSI-2024-0001',
      created: '2024-11-05',
      createdTime: '11:01 AM',
      sentOn: '2024-11-05',
      sentTime: '11:02 AM',
      year: 2023,
      amountDue: 2217.00,
      status: 'Overdue',
      dueDate: '2024-11-21',
    },
    {
      id: '10',
      client: 'Pacific Northwest Trading',
      clientId: '110',
      clientType: 'Business',
      invoiceNo: 'PNT-2024-0010',
      created: '2024-11-05',
      createdTime: '11:01 AM',
      sentOn: '2024-11-05',
      sentTime: '11:05 AM',
      year: 2024,
      amountDue: 4850.00,
      status: 'Sent to Client',
      dueDate: '2024-12-05',
    },
    {
      id: '11',
      client: 'Apex Distribution Inc',
      clientId: '111',
      clientType: 'Business',
      invoiceNo: 'APX-2024-0001',
      created: '2024-10-23',
      createdTime: '05:47 PM',
      sentOn: '2024-10-23',
      sentTime: '05:47 PM',
      year: 2023,
      amountDue: 3100.00,
      status: 'Paid',
      dueDate: '2024-11-23',
      paidAt: '2024-11-10',
      paidTime: '05:47 PM',
      paidVia: 'Stripe',
    },
    {
      id: '12',
      client: 'Summit Logistics Group',
      clientId: '112',
      clientType: 'Business',
      invoiceNo: '138X5A54-0002',
      created: '2024-09-16',
      createdTime: '06:17 AM',
      sentOn: '2024-09-16',
      sentTime: '06:17 AM',
      year: 2023,
      amountDue: 6500.00,
      status: 'Paid',
      dueDate: '2024-10-16',
      paidAt: '2024-09-30',
      paidTime: '06:17 AM',
      paidVia: 'ACH',
    },
    {
      id: '13',
      client: 'Velocity Digital Marketing',
      clientId: '113',
      clientType: 'Business',
      invoiceNo: 'VDM-2024-0001',
      created: '2024-09-07',
      createdTime: '06:17 AM',
      sentOn: '2024-09-07',
      sentTime: '06:17 AM',
      year: 2023,
      amountDue: 2850.00,
      status: 'Paid',
      dueDate: '2024-10-26',
      paidAt: '2024-10-15',
      paidTime: '06:17 AM',
      paidVia: 'Stripe',
    },
    {
      id: '14',
      client: 'Precision Engineering LLC',
      clientId: '114',
      clientType: 'Business',
      invoiceNo: 'PE-2024-0001',
      created: '2024-08-12',
      createdTime: '10:18 AM',
      sentOn: '2024-08-12',
      sentTime: '10:35 AM',
      year: 2023,
      amountDue: 5775.24,
      status: 'Overdue',
      dueDate: '2024-09-12',
    },
    {
      id: '15',
      client: 'Johnny X',
      clientId: '1',
      clientType: 'Individual',
      invoiceNo: 'JX-2025-0001',
      created: '2025-02-01',
      createdTime: '10:00 AM',
      sentOn: '2025-02-01',
      sentTime: '10:02 AM',
      year: 2024,
      amountDue: 517.00,
      status: 'Paid',
      dueDate: '2025-02-14',
      paidAt: '2025-02-05',
      paidTime: '02:18 PM',
      paidVia: 'Cash',
    },
    {
      id: '16',
      client: 'Rory Wests',
      clientId: '5',
      clientType: 'Individual',
      invoiceNo: 'RW-2024-0012',
      created: '2024-12-09',
      createdTime: '02:08 PM',
      sentOn: '2024-12-09',
      sentTime: '02:10 PM',
      year: 2023,
      amountDue: 850.00,
      status: 'Overdue',
      dueDate: '2024-12-28',
    },
    {
      id: '17',
      client: 'Phoenix Consulting LLC',
      clientId: '115',
      clientType: 'Business',
      invoiceNo: 'PHX-2025-0001',
      created: '2025-01-15',
      createdTime: '09:00 AM',
      sentOn: '2025-01-22',
      sentTime: '02:30 PM',
      year: 2024,
      amountDue: 4200.00,
      status: 'Paid',
      dueDate: '2025-02-15',
      paidAt: '2025-02-10',
      paidTime: '11:45 AM',
      paidVia: 'ACH',
    },
    {
      id: '18',
      client: 'Nexus Technologies',
      clientId: '116',
      clientType: 'Business',
      invoiceNo: 'NXT-2025-0003',
      created: '2025-02-01',
      createdTime: '03:15 PM',
      sentOn: '2025-02-05',
      sentTime: '10:00 AM',
      year: 2024,
      amountDue: 3750.00,
      status: 'Paid',
      dueDate: '2025-03-10',
      paidAt: '2025-03-15',
      paidTime: '04:20 PM',
      paidVia: 'Wire',
    },
    {
      id: '19',
      client: 'Cascade Ventures',
      clientId: '117',
      clientType: 'Business',
      invoiceNo: 'CSV-2024-0008',
      created: '2024-10-10',
      createdTime: '01:30 PM',
      sentOn: '2024-10-18',
      sentTime: '09:15 AM',
      year: 2023,
      amountDue: 5500.00,
      status: 'Sent to Client',
      dueDate: '2024-11-20',
    },
    {
      id: '20',
      client: 'Pinnacle Marketing Group',
      clientId: '118',
      clientType: 'Business',
      invoiceNo: 'PMG-2025-0011',
      created: '2025-11-15',
      createdTime: '09:30 AM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 2800.00,
      status: 'Draft',
      dueDate: '2025-12-15',
    },
    {
      id: '21',
      client: 'Vertex Technologies',
      clientId: '119',
      clientType: 'Business',
      invoiceNo: 'VTX-2025-0012',
      created: '2025-11-14',
      createdTime: '02:15 PM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 4250.00,
      status: 'Draft',
      dueDate: '2025-12-14',
    },
    {
      id: '22',
      client: 'Sarah Johnson',
      clientId: '120',
      clientType: 'Individual',
      invoiceNo: 'SJ-2025-0013',
      created: '2025-11-16',
      createdTime: '11:00 AM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 1500.00,
      status: 'Draft',
      dueDate: '2025-12-16',
    },
    {
      id: '23',
      client: 'Apex Consulting Partners',
      clientId: '121',
      clientType: 'Business',
      invoiceNo: 'ACP-2025-0014',
      created: '2025-11-17',
      createdTime: '10:45 AM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 3900.00,
      status: 'Draft',
      dueDate: '2025-12-17',
    },
    {
      id: '24',
      client: 'Fusion Retail LLC',
      clientId: '122',
      clientType: 'Business',
      invoiceNo: 'FRL-2025-0015',
      created: '2025-11-13',
      createdTime: '03:20 PM',
      sentOn: '',
      sentTime: '',
      year: 2025,
      amountDue: 5600.00,
      status: 'Draft',
      dueDate: '2025-12-13',
    },
    {
      id: '25',
      client: 'Summit Financial Group',
      clientId: '123',
      clientType: 'Business',
      invoiceNo: 'SFG-2025-0016',
      created: '2025-11-01',
      createdTime: '09:00 AM',
      sentOn: '2025-11-01',
      sentTime: '09:05 AM',
      year: 2025,
      amountDue: 3200.00,
      status: 'Paid',
      dueDate: '2025-12-01',
      paidAt: '2025-11-15',
      paidTime: '02:30 PM',
      paidVia: 'ACH',
    },
    {
      id: '26',
      client: 'Coastal Enterprises',
      clientId: '124',
      clientType: 'Business',
      invoiceNo: 'CE-2025-0017',
      created: '2025-11-05',
      createdTime: '11:15 AM',
      sentOn: '2025-11-05',
      sentTime: '11:20 AM',
      year: 2025,
      amountDue: 4750.00,
      status: 'Paid',
      dueDate: '2025-12-05',
      paidAt: '2025-11-14',
      paidTime: '10:45 AM',
      paidVia: 'Stripe',
    },
    {
      id: '27',
      client: 'Metro Solutions Inc',
      clientId: '125',
      clientType: 'Business',
      invoiceNo: 'MSI-2025-0018',
      created: '2025-11-08',
      createdTime: '02:00 PM',
      sentOn: '2025-11-08',
      sentTime: '02:05 PM',
      year: 2025,
      amountDue: 2100.00,
      status: 'Paid',
      dueDate: '2025-12-08',
      paidAt: '2025-11-16',
      paidTime: '03:15 PM',
      paidVia: 'Wire',
    },
    {
      id: '28',
      client: 'Nexus Consulting LLC',
      clientId: '126',
      clientType: 'Business',
      invoiceNo: 'NC-2025-0019',
      created: '2025-11-10',
      createdTime: '10:30 AM',
      sentOn: '2025-11-10',
      sentTime: '10:35 AM',
      year: 2025,
      amountDue: 5800.00,
      status: 'Paid',
      dueDate: '2025-12-10',
      paidAt: '2025-11-17',
      paidTime: '09:20 AM',
      paidVia: 'ACH',
    },
    {
      id: '29',
      client: 'Michael Chen',
      clientId: '127',
      clientType: 'Individual',
      invoiceNo: 'MC-2025-0020',
      created: '2025-11-12',
      createdTime: '01:45 PM',
      sentOn: '2025-11-12',
      sentTime: '01:50 PM',
      year: 2025,
      amountDue: 925.00,
      status: 'Paid',
      dueDate: '2025-12-12',
      paidAt: '2025-11-18',
      paidTime: '11:00 AM',
      paidVia: 'Venmo',
    },
  ];

  // Helper function to check if invoice was created recently (within 48 hours)
  const isRecentlyCreated = (createdDate: string): boolean => {
    const created = new Date(createdDate);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  // Helper function to check if invoice was paid recently (within 7 days)
  const isRecentlyPaid = (paidDate?: string): boolean => {
    if (!paidDate) return false;
    const paid = new Date(paidDate);
    const now = new Date();
    const daysDiff = (now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  // Helper function to check if invoice is overdue for sending (past due by threshold days)
  const isOverdueForSending = (invoice: Invoice): boolean => {
    if (invoice.status !== 'Overdue') return false;
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const daysPastDue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysPastDue >= overdueSendThreshold;
  };

  // Calculate summary metrics
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Sent to Client');
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  const draftInvoices = invoices.filter(inv => inv.status === 'Draft');
  const recentlyPaidInvoices = invoices.filter(inv => inv.status === 'Paid' && isRecentlyPaid(inv.paidAt));

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalDraft = draftInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);

  // Calculate YTD paid invoices (current year)
  const currentYear = new Date().getFullYear();
  const paidInvoicesYTD = invoices.filter(inv => 
    inv.status === 'Paid' && 
    inv.paidAt && 
    new Date(inv.paidAt).getFullYear() === currentYear
  );
  const totalPaidYTD = paidInvoicesYTD.reduce((sum, inv) => sum + inv.amountDue, 0);

  // Calculate last year's YTD paid invoices (same period last year)
  const lastYear = currentYear - 1;
  const currentDayOfYear = Math.floor((new Date().getTime() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const paidInvoicesLastYearYTD = invoices.filter(inv => {
    if (inv.status !== 'Paid' || !inv.paidAt) return false;
    const paidDate = new Date(inv.paidAt);
    const paidYear = paidDate.getFullYear();
    if (paidYear !== lastYear) return false;
    const dayOfYear = Math.floor((paidDate.getTime() - new Date(lastYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear <= currentDayOfYear;
  });
  const totalPaidLastYearYTD = paidInvoicesLastYearYTD.reduce((sum, inv) => sum + inv.amountDue, 0);

  // Calculate growth percentage
  const growthPercent = totalPaidLastYearYTD > 0 
    ? ((totalPaidYTD - totalPaidLastYearYTD) / totalPaidLastYearYTD) * 100
    : totalPaidYTD > 0 ? 100 : 0;

  // Filter invoices based on status filter and paid via filter
  const filteredInvoices = invoices.filter(invoice => {
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'paid') matchesStatus = invoice.status === 'Paid';
    else if (statusFilter === 'unpaid') matchesStatus = invoice.status === 'Sent to Client';
    else if (statusFilter === 'overdue') matchesStatus = invoice.status === 'Overdue';
    else if (statusFilter === 'draft') matchesStatus = invoice.status === 'Draft';
    else if (statusFilter === 'recent') matchesStatus = invoice.status === 'Paid' && isRecentlyPaid(invoice.paidAt);
    
    // Paid Via filter
    const matchesPaidVia = paidViaFilter === 'all' || invoice.paidVia === paidViaFilter;
    
    return matchesStatus && matchesPaidVia;
  });

  // Sorting logic
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--primaryColor)' }} />
      : <ArrowDown className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--primaryColor)' }} />;
  };

  // Sort the filtered invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortColumn) {
      case 'client':
        aValue = a.client.toLowerCase();
        bValue = b.client.toLowerCase();
        break;
      case 'invoiceNo':
        aValue = parseInt(a.invoiceNo) || 0;
        bValue = parseInt(b.invoiceNo) || 0;
        break;
      case 'created':
        aValue = new Date(a.created).getTime();
        bValue = new Date(b.created).getTime();
        break;
      case 'sentOn':
        aValue = new Date(a.sentOn).getTime();
        bValue = new Date(b.sentOn).getTime();
        break;
      case 'year':
        aValue = a.year;
        bValue = b.year;
        break;
      case 'amountDue':
        aValue = a.amountDue;
        bValue = b.amountDue;
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
        break;
      case 'paidAt':
        aValue = a.paidAt ? new Date(a.paidAt).getTime() : 0;
        bValue = b.paidAt ? new Date(b.paidAt).getTime() : 0;
        break;
      case 'paidVia':
        aValue = a.paidVia?.toLowerCase() || '';
        bValue = b.paidVia?.toLowerCase() || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Get overdue invoices for bulk send
  const overdueForSending = sortedInvoices.filter(isOverdueForSending);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'Draft':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'Overdue':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'Sent to Client':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            <MailPlus className="w-3 h-3 mr-1" />
            Sent to Client
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSaveThreshold = (days: number) => {
    setOverdueSendThreshold(days);
    localStorage.setItem('billingOverdueSendThreshold', days.toString());
  };

  const handleBulkSendConfirm = (selectedIds: string[]) => {
    const now = new Date().getTime();
    const updatedResentInvoices = { ...resentInvoices };
    
    selectedIds.forEach(id => {
      updatedResentInvoices[id] = now;
    });
    
    setResentInvoices(updatedResentInvoices);
    localStorage.setItem('resentInvoices', JSON.stringify(updatedResentInvoices));
    
    console.log(`${selectedIds.length} invoice reminder(s) sent successfully`);
  };

  const [showInvoicePreview, setShowInvoicePreview] = useState<string | null>(null);
  
  // Payment method selection state
  const [paymentMethodDialog, setPaymentMethodDialog] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({
    open: false,
    invoiceId: null,
  });

  const handleMarkAsPaid = (invoiceId: string, method: PaymentMethod) => {
    console.log(`Marking invoice ${invoiceId} as paid via ${method}`);
    // TODO: Implement actual payment marking
    setPaymentMethodDialog({ open: false, invoiceId: null });
  };

  // Stat Card Configurations
  const statCardConfigs: StatCardConfig[] = [
    {
      id: 'paid',
      label: 'Paid (YTD)',
      count: `${paidInvoicesYTD.length} invoices`,
      icon: <CheckCircle className="w-[18px] h-[18px] text-green-600" />,
      color: 'green',
      bgColor: 'green-50',
      getValue: () => paidInvoicesYTD.length,
      filterValue: 'paid',
      growthPercent: growthPercent
    },
    {
      id: 'recent',
      label: 'Recently Paid',
      count: `${recentlyPaidInvoices.length} invoices`,
      icon: <Sparkles className="w-[18px] h-[18px] text-emerald-600" />,
      color: 'emerald',
      bgColor: 'emerald-50',
      getValue: (invoices) => invoices.filter(inv => inv.status === 'Paid' && inv.paidAt && isRecentlyPaid(inv.paidAt)).length,
      filterValue: 'recent'
    },
    {
      id: 'unpaid',
      label: 'Unpaid',
      count: `${unpaidInvoices.length} invoices`,
      icon: <Clock className="w-[18px] h-[18px] text-purple-600" />,
      color: 'purple',
      bgColor: 'purple-50',
      getValue: (invoices) => invoices.filter(inv => inv.status === 'Sent to Client').length,
      filterValue: 'unpaid'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: `${overdueInvoices.length} invoices late by ${overdueSendThreshold}+ days`,
      icon: <AlertTriangle className="w-[18px] h-[18px] text-red-600" />,
      color: 'red',
      bgColor: 'red-50',
      getValue: (invoices) => invoices.filter(inv => inv.status === 'Overdue').length,
      filterValue: 'overdue'
    },
    {
      id: 'draft',
      label: 'Draft',
      count: `${draftInvoices.length} invoices`,
      icon: <FileText className="w-[18px] h-[18px] text-gray-600" />,
      color: 'gray',
      bgColor: 'gray-50',
      getValue: (invoices) => invoices.filter(inv => inv.status === 'Draft' || inv.status === 'Sent to Client').length,
      filterValue: 'draft'
    }
  ];

  // State for stat card order - persisted to localStorage
  const [statCardOrder, setStatCardOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem('billingStatCardOrder');
    return saved ? JSON.parse(saved) : [0, 1, 2, 3, 4];
  });

  // Function to move stat card
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const dragCard = statCardOrder[dragIndex];
    const newOrder = statCardOrder.filter((_, i) => i !== dragIndex).slice(0, hoverIndex).concat(dragCard).concat(statCardOrder.filter((_, i) => i !== dragIndex).slice(hoverIndex));
    setStatCardOrder(newOrder);
    localStorage.setItem('billingStatCardOrder', JSON.stringify(newOrder));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100">Billing</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {sortedInvoices.length} invoice{sortedInvoices.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Stats Cards - Draggable */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {statCardOrder.map((index) => (
            <DraggableStatCard
              key={index}
              config={statCardConfigs[index]}
              index={index}
              invoices={invoices}
              statusFilter={statusFilter}
              onFilterChange={setStatusFilter}
              moveCard={moveCard}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Date Filter - Visually Grouped */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setDateFilter('All Dates')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs transition-colors",
                  dateFilter === 'All Dates'
                    ? "text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                style={dateFilter === 'All Dates' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                All Dates
              </button>
              <button
                onClick={() => setDateFilter('Today')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs transition-colors",
                  dateFilter === 'Today'
                    ? "text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                style={dateFilter === 'Today' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('This Week')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs transition-colors",
                  dateFilter === 'This Week'
                    ? "text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                style={dateFilter === 'This Week' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter('This Month')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs transition-colors",
                  dateFilter === 'This Month'
                    ? "text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                style={dateFilter === 'This Month' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('This Year')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs transition-colors",
                  dateFilter === 'This Year'
                    ? "text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
                style={dateFilter === 'This Year' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                This Year
              </button>
            </div>

            {/* Paid Via Filter */}
            <Select
              value={paidViaFilter}
              onValueChange={(value) => {
                setPaidViaFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger 
                className="w-[150px] h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                style={
                  paidViaFilter !== 'all'
                    ? { borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }
                    : {}
                }
              >
                <SelectValue placeholder="Paid Via" />
              </SelectTrigger>
              <SelectContent className="w-44">
                <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
                  Filter by Payment
                </div>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="ACH">🏦 ACH</SelectItem>
                <SelectItem value="Cash">💵 Cash</SelectItem>
                <SelectItem value="Check">✅ Check</SelectItem>
                <SelectItem value="Klarna">🛍️ Klarna</SelectItem>
                <SelectItem value="PayPal">🅿️ PayPal</SelectItem>
                <SelectItem value="Stripe">⚡ Stripe</SelectItem>
                <SelectItem value="Venmo">📱 Venmo</SelectItem>
                <SelectItem value="Wire">🔗 Wire</SelectItem>
                <SelectItem value="Zelle">💳 Zelle</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(statusFilter !== 'all' || paidViaFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPaidViaFilter('all');
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
              onClick={() => {
                if (activeTab === 'invoices') {
                  navigate('/invoices/add');
                } else {
                  console.log('Add Subscription');
                }
              }}
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'invoices' ? 'Add Invoice' : 'Add Subscription'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              style={{
                borderColor: 'var(--primaryColor)',
                color: 'var(--primaryColor)'
              }}
              onClick={() => navigate('/manage-invoice-templates')}
            >
              <FileText className="w-4 h-4" />
              Templates
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/subscription-settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Billing Settings (Reminders & Retries)</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 text-xs gap-1.5"
              onClick={() => setShowBulkSendDialog(true)}
              title="Bulk Send Overdue Invoice Reminders"
            >
              <MailPlus className="w-3.5 h-3.5" />
              Bulk Send
              {overdueForSending.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
                  {overdueForSending.length}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setShowSettingsDialog(true)}
              title="Billing Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Side: Title + Badge + Tabs */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 dark:text-gray-100">Invoice List</h3>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                {filteredInvoices.length}
              </Badge>
            </div>
            
            {/* Invoices/Subscriptions Switcher - With Icons */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5">
            <button
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "px-4 py-2 rounded text-sm transition-colors w-[130px] flex items-center justify-center gap-2",
                activeTab === 'invoices'
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              style={activeTab === 'invoices' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              <FileText className="w-4 h-4" />
              Invoices
            </button>
            <button
              onClick={() => navigate('/subscriptions')}
              className={cn(
                "px-4 py-2 rounded text-sm transition-colors w-[140px] flex items-center justify-center gap-2",
                activeTab === 'subscriptions'
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
              style={activeTab === 'subscriptions' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              <Repeat className="w-4 h-4" />
              Subscriptions
            </button>
          </div>
          </div>
          
          {/* Right Side: Items Per Page + View Toggle */}
          <div className="flex items-center gap-3">
            {/* Items Per Page with page count */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentPage} of {Math.ceil(filteredInvoices.length / itemsPerPage) || 1}
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
              <Button
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs text-white"
                )}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Single View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs",
                  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                onClick={() => {
                  localStorage.setItem('billingViewPreference', 'split');
                  navigate('/billing/split');
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Split View
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr 
              style={{
                backgroundColor: 'var(--primaryColor)'
              }}
            >
              <th className="px-6 py-4 pl-10 text-left text-xs uppercase tracking-wide text-white/90 w-[240px]">
                <button 
                  onClick={() => handleSort('client')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Client Name{getSortIcon('client')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[200px]">
                <button 
                  onClick={() => handleSort('invoiceNo')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Invoice # / Year{getSortIcon('invoiceNo')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[160px]">
                <button 
                  onClick={() => handleSort('created')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Created / Sent{getSortIcon('created')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[160px]">
                <button 
                  onClick={() => handleSort('dueDate')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Due / Paid{getSortIcon('dueDate')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[120px]">
                <button 
                  onClick={() => handleSort('amountDue')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Amount{getSortIcon('amountDue')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[140px]">
                <button 
                  onClick={() => handleSort('paidVia')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Paid Via{getSortIcon('paidVia')}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[180px]">
                <button 
                  onClick={() => handleSort('status')} 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Status{getSortIcon('status')}
                </button>
              </th>
              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-white/90 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {(() => {
              // Apply pagination slicing
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + itemsPerPage);
              
              return paginatedInvoices.map((invoice, index) => (
                <tr 
                  key={invoice.id}
                  className={cn(
                    "hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors",
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/30 dark:bg-gray-800/50"
                  )}
                >
                  {/* Client Name - Bigger text with left padding */}
                  <td className="px-6 py-4 pl-10">
                    <div className="flex items-center gap-2">
                      <ClientCellDisplay
                        clientName={invoice.client}
                        clientId={invoice.clientId}
                        clientType={invoice.clientType}
                        onNameClick={() => {
                          console.log('View invoice:', invoice.id);
                          setShowInvoicePreview(invoice.id);
                        }}
                      />
                      {/* Overdue badge AFTER client name (7+ days past due) */}
                      {isOverdueForSending(invoice) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                {(() => {
                                  const dueDate = new Date(invoice.dueDate);
                                  const now = new Date();
                                  const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                  return (
                                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[9px] px-1.5 py-0 h-4 font-medium">
                                      {daysOverdue}d
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Invoice is {(() => {
                                const dueDate = new Date(invoice.dueDate);
                                const now = new Date();
                                const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                return daysOverdue;
                              })()} days overdue</p>
                              <p className="text-xs text-gray-400">Overdue indicators appear {overdueSendThreshold}+ days past due date</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>

                  {/* Invoice Number / Year - Combined column with preview on hover */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {/* Document Icon with Hover Preview */}
                      <div className="relative group/preview">
                        <div 
                          className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                        >
                          📄
                        </div>
                        {/* Preview on Hover */}
                        <div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block pointer-events-none">
                          <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                              <div className="text-center p-4">
                                <div className="text-6xl mb-2">📄</div>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{invoice.invoiceNo || 'Draft'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{invoice.client}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(invoice.amountDue)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Year: {invoice.year}</p>
                              </div>
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Invoice Preview</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')}
                            className="text-xs text-gray-900 dark:text-gray-100 hover:underline"
                          >
                            {invoice.invoiceNo || 'Draft'}
                          </button>
                          {isRecentlyCreated(invoice.created) && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-1 py-0 h-3.5">NEW</Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Year: {invoice.year}</span>
                      </div>
                    </div>
                  </td>

                  {/* Created / Sent - Combined Column with labels - ALIGNED */}
                  <td className="px-4 py-4 w-[160px]">
                    {invoice.sentOn && invoice.created === invoice.sentOn ? (
                      // If created and sent dates match, show only once
                      <div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Created & Sent</div>
                        <DateDisplayWithTooltip 
                          date={invoice.created} 
                          time={invoice.createdTime}
                        />
                      </div>
                    ) : (
                      // If different, show both
                      <div className="flex flex-col gap-1">
                        <div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Created</div>
                          <DateDisplayWithTooltip 
                            date={invoice.created} 
                            time={invoice.createdTime}
                          />
                        </div>
                        {invoice.sentOn && (
                          <div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Sent</div>
                            <DateDisplayWithTooltip 
                              date={invoice.sentOn} 
                              time={invoice.sentTime}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Due / Paid - Combined Column with labels - SMART DISPLAY + Custom Tooltip */}
                  <td className="px-4 py-4 w-[160px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            {(() => {
                              // Smart logic: If paid before or on due date, show only paid date
                              // If paid after due date, show both dates
                              const isPaid = invoice.paidAt !== undefined;
                              const paidDate = invoice.paidAt ? new Date(invoice.paidAt) : null;
                              const dueDate = new Date(invoice.dueDate);
                              const paidBeforeOrOnDue = paidDate && paidDate <= dueDate;

                              if (isPaid && paidBeforeOrOnDue) {
                                // Paid before or on due date - show only paid date
                                return (
                                  <div>
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5 font-medium">Paid on time</div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDate(invoice.paidAt!)}
                                      </span>
                                      {isRecentlyPaid(invoice.paidAt) && (
                                        <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-0.5" />
                                      )}
                                    </div>
                                  </div>
                                );
                              } else {
                                // Show both due and paid (or just due if not paid)
                                return (
                                  <div className="flex flex-col gap-1">
                                    {!invoice.paidAt && (
                                      <div>
                                        <div className={cn(
                                          "text-[10px] uppercase tracking-wide mb-0.5",
                                          invoice.status === 'Overdue' 
                                            ? "text-red-600 dark:text-red-400 font-medium" 
                                            : "text-gray-500 dark:text-gray-400"
                                        )}>
                                          {invoice.status === 'Overdue' ? (() => {
                                            const dueDate = new Date(invoice.dueDate);
                                            const now = new Date();
                                            const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                            return `Overdue (${daysOverdue}d)`;
                                          })() : 'Due'}
                                        </div>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                          {formatDate(invoice.dueDate)}
                                        </span>
                                      </div>
                                    )}
                                    {invoice.paidAt && (
                                      <div>
                                        <div className="flex items-center gap-1">
                                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5 font-medium">Paid late</div>
                                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[9px] px-1 py-0 h-3.5 font-medium">
                                            {(() => {
                                              const dueDate = new Date(invoice.dueDate);
                                              const paidDate = new Date(invoice.paidAt);
                                              const daysLate = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                                              return `${daysLate}d`;
                                            })()}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(invoice.paidAt)}
                                          </span>
                                          {isRecentlyPaid(invoice.paidAt) && (
                                            <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-0.5" />
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <div><strong>Due date:</strong> {formatDate(invoice.dueDate)}</div>
                            {invoice.paidAt && invoice.paidTime && (
                              <div><strong>Paid Date:</strong> {formatDate(invoice.paidAt)} @ {invoice.paidTime}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>

                  {/* Amount - Left Aligned for $ sign alignment */}
                  <td className="px-4 py-4 text-left w-[120px]">
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(invoice.amountDue)}</span>
                  </td>

                  {/* Paid Via - Interactive for marking as paid */}
                  <td className="px-4 py-4 w-[140px]">
                    {invoice.paidVia ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{invoice.paidVia}</span>
                        {invoice.paidVia === 'Stripe' && (
                          <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" title="Auto-payment" />
                        )}
                      </div>
                    ) : invoice.status === 'Overdue' || invoice.status === 'Sent to Client' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs gap-1.5 px-3 border-2 border-green-400 text-green-700 hover:bg-green-50 hover:border-green-500 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 font-medium shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Mark Paid
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-44 p-1">
                          <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
                            Select Payment Method
                          </div>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'ACH')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            🏦 ACH
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Cash')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            💵 Cash
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Check')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            ✅ Check
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Klarna')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            🛍️ Klarna
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'PayPal')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            🅿️ PayPal
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Venmo')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            📱 Venmo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Wire')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            🔗 Wire
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsPaid(invoice.id, 'Zelle')}
                            className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            💳 Zelle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Status - MOVED HERE after Paid Via */}
                  <td className="px-4 py-4">
                    {getStatusBadge(invoice.status)}
                  </td>

                  {/* Actions - Fixed width container for alignment */}
                  <td className="px-4 py-4 pr-8">
                    <div className="flex justify-end items-center gap-1 w-[72px] ml-auto">
                      {/* Resend button - only for overdue invoices meeting threshold */}
                      {isOverdueForSending(invoice) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Resend invoice:', invoice.id);
                                }}
                              >
                                <MailPlus className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="text-xs">
                                Overdue by {overdueSendThreshold}+ days. Click to resend invoice reminder.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {/* Dropdown menu - always present in same position */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => console.log('View invoice:', invoice.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                          
                          {invoice.status !== 'Paid' && (
                            <DropdownMenuItem onClick={() => navigate(`/billing/edit-invoice/${invoice.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Invoice
                            </DropdownMenuItem>
                          )}
                          
                          {(invoice.status === 'Overdue' || invoice.status === 'Sent to Client') && (
                            <DropdownMenuItem onClick={() => console.log('Resend invoice:', invoice.id)}>
                              <MailPlus className="w-4 h-4 mr-2" />
                              Resend Invoice
                            </DropdownMenuItem>
                          )}
                          
                          {invoice.status === 'Paid' && (
                            <DropdownMenuItem 
                              onClick={() => console.log('Void invoice:', invoice.id)}
                              className="text-orange-600 dark:text-orange-400"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Void Invoice
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => console.log('Delete invoice:', invoice.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
        
        {/* Pagination - Inside Card */}
        <TablePaginationNav
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedInvoices.length}
          onPageChange={setCurrentPage}
        />
        </Card>

        {/* Dialogs */}
      <BulkSendInvoicesDialog
        open={showBulkSendDialog}
        onClose={() => setShowBulkSendDialog(false)}
        overdueInvoices={overdueForSending.map(inv => ({
          id: inv.id,
          client: inv.client,
          clientId: inv.clientId,
          clientType: inv.clientType,
          invoiceNo: inv.invoiceNo,
          amountDue: inv.amountDue,
          dueDate: inv.dueDate,
          created: inv.created,
          createdTime: inv.createdTime,
        }))}
        onConfirm={handleBulkSendConfirm}
      />

        <BillingSettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          overdueSendThreshold={overdueSendThreshold}
          onOverdueSendThresholdChange={handleSaveThreshold}
        />
      </div>
    </div>
  );
}