import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Eye,
  Calendar,
  Check,
  AlertCircle,
  Building2,
  Sparkles,
  List,
  LayoutGrid,
  Flame,
  Mail,
  X as XIcon,
  Search,
  Plus,
  MailPlus,
  Settings,
  GripVertical,
  Download,
  DollarSign,
  AlertTriangle,
  Edit,
  Trash2,
  User,
  XCircle,
  CreditCard,
  Repeat,
  ArrowUpDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { cn } from '../ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { ClientNameWithLink } from '../ClientNameWithLink';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { BulkSendInvoicesDialog } from '../BulkSendInvoicesDialog';
import { BillingSettingsDialog } from '../BillingSettingsDialog';
import { InvoiceCard } from '../InvoiceCard';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

type InvoiceStatus = 'Paid' | 'Draft' | 'Overdue' | 'Sent to Client' | 'Viewed' | 'Void';
type PaymentMethod = 'Cash' | 'Venmo' | 'Zelle' | 'ACH' | 'Wire' | 'Check' | 'PayPal' | 'Klarna' | 'Stripe';
type ClientType = 'Business' | 'Individual';
type StatusFilter = 'all' | 'paid' | 'unpaid' | 'overdue' | 'draft' | 'recent' | 'void';
type StatCardType = 'all' | 'paid' | 'unpaid' | 'overdue' | 'draft' | 'recent';

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
  viewedAt?: string;
  viewedTime?: string;
  lineItemsCount?: number;
  lineItems?: Array<{
    name: string;
    description?: string;
    amount: number;
  }>;
  notes?: string;
};

type StatCardConfig = {
  id: StatCardType;
  label: string;
  label2?: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  getValue: (stats: any) => number;
  badge?: (stats: any) => React.ReactNode;
  filterValue?: StatusFilter;
};

type DraggableStatCardProps = {
  config: StatCardConfig;
  index: number;
  stats: any;
  statusFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  formatCurrency: (amount: number) => string;
};

const DraggableStatCard = ({ config, index, stats, statusFilter, onFilterChange, moveCard, formatCurrency }: DraggableStatCardProps) => {
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn("relative", isDragging && "opacity-50")}
    >
      <div className="absolute top-2 left-2 text-gray-400 pointer-events-none z-10">
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => onFilterChange(config.filterValue || config.id as StatusFilter)}
        className="text-left w-full"
      >
        <Card className={cn(
          "p-4 pl-8 border-gray-200/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-move",
          statusFilter === (config.filterValue || config.id) && "ring-2 ring-purple-100"
        )}
        style={statusFilter === (config.filterValue || config.id) ? { borderColor: 'var(--primaryColor)' } : {}}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bgColor }}>
                {config.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{config.label}</p>
                {config.label2 && <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{config.label2}</p>}
                {config.description && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{config.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl text-gray-900 dark:text-gray-100">{formatCurrency(config.getValue(stats))}</p>
              {config.badge && config.badge(stats)}
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
};

type DraggableSectionButtonProps = {
  sectionId: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  onClick: () => void;
};

const DraggableSectionButton = ({ sectionId, label, count, icon, index, moveSection, onClick }: DraggableSectionButtonProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION_BUTTON',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SECTION_BUTTON',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <button
      ref={(node) => drag(drop(node))}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all group",
        "text-gray-600 dark:text-gray-400",
        "hover:text-gray-900 dark:hover:text-gray-100",
        "cursor-move",
        isDragging && "opacity-40"
      )}
    >
      <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      {icon}
      <span className="font-medium">{label}</span>
      <span className="text-gray-400 dark:text-gray-500">({count})</span>
    </button>
  );
};

type DraggableReorderItemProps = {
  sectionId: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
};

const DraggableReorderItem = ({ sectionId, label, icon, color, index, moveItem }: DraggableReorderItemProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'REORDER_SECTION',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'REORDER_SECTION',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        "flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm",
        isDragging && "opacity-50"
      )}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      {icon}
      <span className={cn("flex-1", color)}>{label}</span>
      <span className="text-xs text-gray-400">#{index + 1}</span>
    </div>
  );
};

export function BillingViewCards() {
  const navigate = useNavigate();
  const { formatDate, formatDateTime } = useAppSettings();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientType | 'all'>('all');
  const [showBulkSendDialog, setShowBulkSendDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showMarkAsPaidDialog, setShowMarkAsPaidDialog] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ACH');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    draft: 0,
    recent: 0
  });

  // Show scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Card order state - load from localStorage or use default order
  const [cardOrder, setCardOrder] = useState<StatCardType[]>(() => {
    const saved = localStorage.getItem('billingCardOrder');
    return saved ? JSON.parse(saved) : ['all', 'recent', 'unpaid', 'overdue', 'paid'];
  });

  // Section order state - load from localStorage or use default order
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('billingSectionOrder');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add 'overdue' if it doesn't exist (insert after recentlyPaid)
      if (!parsed.includes('overdue')) {
        const recentlyPaidIndex = parsed.indexOf('recentlyPaid');
        if (recentlyPaidIndex !== -1) {
          parsed.splice(recentlyPaidIndex + 1, 0, 'overdue');
        } else {
          parsed.unshift('overdue'); // Add at the beginning if recentlyPaid not found
        }
        // Save the migrated order back to localStorage
        localStorage.setItem('billingSectionOrder', JSON.stringify(parsed));
      }
      return parsed;
    }
    // Default order: Recently Paid → Overdue → Pending → Drafts → Void → Paid
    return ['recentlyPaid', 'overdue', 'pendingPayment', 'drafts', 'void', 'paid'];
  });

  // Overdue days setting
  const [overdueSendThreshold, setOverdueSendThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('billingOverdueSendThreshold');
    return saved ? parseInt(saved) : 7;
  });

  // Track resent invoices with timestamps
  const [resentInvoices, setResentInvoices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resentInvoices');
    return saved ? JSON.parse(saved) : {};
  });

  // State for bulk send overdue invoices
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);

  // Resend confirmation dialog state
  const [resendConfirmDialog, setResendConfirmDialog] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({
    open: false,
    invoiceId: null,
  });

  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({
    open: false,
    invoiceId: null,
  });

  // Void confirmation dialog state
  const [voidConfirmDialog, setVoidConfirmDialog] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({
    open: false,
    invoiceId: null,
  });

  // Card flip state for invoice cards
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Reorder dialog state
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [tempSectionOrder, setTempSectionOrder] = useState<string[]>(sectionOrder);

  // Mock invoice data
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Dynamic dates based on current date to ensure data always shows correctly
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const daysAgo = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return formatDate(date);
    };
    const daysFromNow = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return formatDate(date);
    };
    
    return [
      // Recently Paid - Paid within last 7 days
      {
        id: '1',
        client: 'Acme Corporation',
        clientId: '101',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0001',
        created: daysAgo(25),
        createdTime: '10:00 AM',
        sentOn: daysAgo(25),
        sentTime: '10:02 AM',
        year: 2024,
        amountDue: 5250.00,
        status: 'Paid',
        dueDate: daysAgo(10),
        paidAt: daysAgo(0),  // Today - Recently Paid
        paidTime: '02:18 PM',
        paidVia: 'ACH',
        viewedAt: daysAgo(24),
        viewedTime: '09:30 AM',
        lineItemsCount: 5,
        lineItems: [
          { name: '2024 Tax Preparation', description: 'Individual tax return preparation', amount: 2500.00 },
          { name: 'State Tax Filing', description: 'State income tax preparation and filing', amount: 750.00 },
          { name: 'Quarterly Estimates', description: 'Q4 2024 estimated tax calculations', amount: 500.00 },
          { name: 'Prior Year Amendment', description: '2023 tax return amendment', amount: 1000.00 },
          { name: 'Tax Planning Session', description: 'Year-end tax planning consultation', amount: 500.00 },
        ],
      },
      {
        id: '7',
        client: 'Modern Design Co',
        clientId: '107',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0007',
        created: daysAgo(20),
        createdTime: '02:00 PM',
        sentOn: daysAgo(20),
        sentTime: '02:15 PM',
        year: 2024,
        amountDue: 4750.00,
        status: 'Paid',
        dueDate: daysAgo(8),  // Due 8 days ago
        paidAt: daysAgo(10), // Paid 10 days ago - PAID ON TIME (2 days BEFORE due date)
        paidTime: '11:30 AM',
        paidVia: 'Wire',
        viewedAt: daysAgo(19),
        viewedTime: '08:00 AM',
        lineItemsCount: 6,
        lineItems: [
          { name: 'Quarterly Bookkeeping', description: 'Q4 2024 bookkeeping services', amount: 1200.00 },
          { name: 'Financial Statements', description: 'Profit & loss and balance sheet', amount: 850.00 },
          { name: 'Payroll Processing', description: '3 months payroll services', amount: 1500.00 },
          { name: 'Tax Prep Support', description: 'Year-end tax preparation assistance', amount: 650.00 },
          { name: 'Accounts Reconciliation', description: 'Bank and credit card reconciliation', amount: 350.00 },
          { name: 'Consultation', description: 'Financial planning consultation', amount: 200.00 },
        ],
      },
      {
        id: '8',
        client: 'Jennifer Martinez',
        clientId: '108',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0008',
        created: daysAgo(22),
        createdTime: '03:30 PM',
        sentOn: daysAgo(22),
        sentTime: '03:45 PM',
        year: 2024,
        amountDue: 1850.00,
        status: 'Paid',
        dueDate: daysAgo(12),
        paidAt: daysAgo(4),  // 4 days ago - Recently Paid
        paidTime: '09:15 AM',
        paidVia: 'Check',
        viewedAt: daysAgo(21),
        viewedTime: '10:00 AM',
        lineItemsCount: 3,
        lineItems: [
          { name: 'Tax Return Preparation', description: 'Individual 1040 tax return', amount: 950.00 },
          { name: 'State Filing', description: 'State income tax return', amount: 450.00 },
          { name: 'Tax Advisory', description: 'Tax planning consultation', amount: 450.00 },
        ],
      },
      {
        id: '5',
        client: 'Global Industries',
        clientId: '105',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0005',
        created: daysAgo(18),
        createdTime: '10:30 AM',
        sentOn: daysAgo(18),
        sentTime: '10:45 AM',
        year: 2024,
        amountDue: 12500.00,
        status: 'Paid',
        dueDate: daysAgo(8),
        paidAt: daysAgo(6),  // 6 days ago - Recently Paid
        paidTime: '04:30 PM',
        paidVia: 'Wire',
        viewedAt: daysAgo(17),
        viewedTime: '11:00 AM',
        lineItemsCount: 12,
        lineItems: [
          { name: 'Annual Audit', description: '2024 financial audit', amount: 4500.00 },
          { name: 'Quarterly Reviews', description: 'Q1-Q4 quarterly financial reviews', amount: 2400.00 },
          { name: 'Tax Compliance', description: 'Corporate tax compliance services', amount: 1800.00 },
          { name: 'Payroll Services', description: 'Annual payroll processing', amount: 1200.00 },
          { name: 'Financial Analysis', description: 'Monthly financial analysis reports', amount: 900.00 },
          { name: 'Budget Planning', description: '2025 budget planning session', amount: 600.00 },
          { name: 'Cash Flow Management', description: 'Cash flow projections and management', amount: 400.00 },
          { name: 'Accounts Payable', description: 'AP processing and management', amount: 250.00 },
          { name: 'Accounts Receivable', description: 'AR processing and management', amount: 200.00 },
          { name: 'Bank Reconciliation', description: 'Monthly bank reconciliations', amount: 150.00 },
          { name: 'Document Preparation', description: 'Financial document preparation', amount: 75.00 },
          { name: 'Filing Services', description: 'Corporate filing services', amount: 25.00 },
        ],
      },
      
      // PAID LATE - Recently paid but after due date
      {
        id: '17',
        client: 'Sunset Retail',
        clientId: '117',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0017',
        created: daysAgo(45),
        createdTime: '09:00 AM',
        sentOn: daysAgo(45),
        sentTime: '09:15 AM',
        year: 2024,
        amountDue: 3400.00,
        status: 'Paid',
        dueDate: daysAgo(12),  // Due 12 days ago
        paidAt: daysAgo(3),    // Paid 3 days ago - LATE by 9 days
        paidTime: '10:30 AM',
        paidVia: 'ACH',
        viewedAt: daysAgo(44),
        viewedTime: '02:00 PM',
        lineItemsCount: 4,
        lineItems: [
          { name: 'Monthly Bookkeeping', description: 'October 2024 bookkeeping', amount: 1200.00 },
          { name: 'Sales Tax Filing', description: 'Q3 2024 sales tax return', amount: 850.00 },
          { name: 'Financial Reports', description: 'Monthly financial statements', amount: 850.00 },
          { name: 'Consulting', description: 'Business advisory consultation', amount: 500.00 },
        ],
      },
      {
        id: '22',
        client: 'TechStart Solutions LLC',
        clientId: '122',
        clientType: 'Business',
        invoiceNo: 'BRCBRX34-0002',
        created: daysAgo(4),
        createdTime: '12:31 PM',
        sentOn: daysAgo(4),
        sentTime: '12:31 PM',
        year: 2025,
        amountDue: 3250.00,
        status: 'Paid',
        dueDate: daysFromNow(26),  // Was due in future
        paidAt: daysAgo(2),    // Paid 2 days ago - Recently Paid On Time
        paidTime: '01:23 PM',
        paidVia: 'Stripe',
        viewedAt: daysAgo(3),
        viewedTime: '02:00 PM',
        lineItemsCount: 5,
        lineItems: [
          { name: 'Software Subscription Management', description: 'Monthly subscription audit and optimization', amount: 1250.00 },
          { name: 'Cloud Infrastructure Consulting', description: 'AWS cost optimization', amount: 800.00 },
          { name: 'Technical Documentation', description: 'System architecture documentation', amount: 600.00 },
          { name: 'Code Review', description: 'Security and best practices review', amount: 400.00 },
          { name: 'DevOps Setup', description: 'CI/CD pipeline configuration', amount: 200.00 },
        ],
      },
      {
        id: '18',
        client: 'Robert Anderson',
        clientId: '118',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0018',
        created: daysAgo(50),
        createdTime: '11:00 AM',
        sentOn: daysAgo(50),
        sentTime: '11:20 AM',
        year: 2024,
        amountDue: 1950.00,
        status: 'Paid',
        dueDate: daysAgo(20),  // Due 20 days ago
        paidAt: daysAgo(5),    // Paid 5 days ago - LATE by 15 days
        paidTime: '03:15 PM',
        paidVia: 'Check',
        viewedAt: daysAgo(49),
        viewedTime: '09:00 AM',
        lineItemsCount: 2,
        lineItems: [
          { name: 'Personal Tax Return', description: 'Form 1040 preparation', amount: 1200.00 },
          { name: 'Investment Income Reporting', description: 'Schedule D and capital gains', amount: 750.00 },
        ],
      },
      
      // DUE SOON - Within 7 days
      {
        id: '19',
        client: 'Coastal Ventures',
        clientId: '119',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0019',
        created: daysAgo(15),
        createdTime: '10:00 AM',
        sentOn: daysAgo(15),
        sentTime: '10:30 AM',
        year: 2024,
        amountDue: 5800.00,
        status: 'Sent to Client',
        dueDate: daysFromNow(3),  // Due in 3 days
        viewedAt: daysAgo(14),
        viewedTime: '11:00 AM',
        lineItemsCount: 7,
        lineItems: [
          { name: 'Website Development', description: 'Corporate website redesign', amount: 2200.00 },
          { name: 'SEO Optimization', description: 'Search engine optimization services', amount: 1100.00 },
          { name: 'Content Creation', description: 'Blog and marketing content', amount: 900.00 },
          { name: 'Social Media Setup', description: 'Social media account setup and branding', amount: 700.00 },
          { name: 'Analytics Integration', description: 'Google Analytics and tracking setup', amount: 500.00 },
          { name: 'Email Marketing', description: 'Email campaign setup and templates', amount: 300.00 },
          { name: 'Training Session', description: 'CMS training for staff', amount: 100.00 },
        ],
      },
      {
        id: '20',
        client: 'Lisa Thompson',
        clientId: '120',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0020',
        created: daysAgo(8),
        createdTime: '02:00 PM',
        sentOn: daysAgo(8),
        sentTime: '02:15 PM',
        year: 2024,
        amountDue: 2750.00,
        status: 'Viewed',
        dueDate: daysFromNow(1),  // Due TOMORROW
        viewedAt: daysAgo(7),
        viewedTime: '09:30 AM',
        lineItemsCount: 3,
        lineItems: [
          { name: 'Estate Planning Review', description: 'Annual estate plan review and updates', amount: 1500.00 },
          { name: 'Trust Administration', description: 'Family trust administration services', amount: 850.00 },
          { name: 'Document Updates', description: 'Will and beneficiary updates', amount: 400.00 },
        ],
      },
      {
        id: '21',
        client: 'Metro Solutions',
        clientId: '121',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0021',
        created: daysAgo(20),
        createdTime: '01:00 PM',
        sentOn: daysAgo(20),
        sentTime: '01:20 PM',
        year: 2024,
        amountDue: 8200.00,
        status: 'Sent to Client',
        dueDate: daysFromNow(6),  // Due in 6 days
        viewedAt: daysAgo(19),
        viewedTime: '10:00 AM',
        lineItemsCount: 9,
        lineItems: [
          { name: 'Strategic Planning Session', description: 'Q1 2025 strategic planning workshop', amount: 2500.00 },
          { name: 'Market Analysis', description: 'Competitive market research and analysis', amount: 1800.00 },
          { name: 'Business Model Review', description: 'Revenue model optimization', amount: 1200.00 },
          { name: 'Process Optimization', description: 'Operational efficiency improvements', amount: 900.00 },
          { name: 'Team Assessment', description: 'Organizational structure review', amount: 600.00 },
          { name: 'KPI Dashboard', description: 'Performance metrics dashboard setup', amount: 450.00 },
          { name: 'Vendor Analysis', description: 'Supplier cost analysis', amount: 350.00 },
          { name: 'Risk Assessment', description: 'Business risk evaluation', amount: 250.00 },
          { name: 'Follow-up Consultation', description: 'Implementation support call', amount: 150.00 },
        ],
      },
      
      // Pending Payment - Not Overdue (due in future or within threshold)
      {
        id: '3',
        client: 'Tech Solutions LLC',
        clientId: '103',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0003',
        created: daysAgo(10),
        createdTime: '09:00 AM',
        sentOn: daysAgo(10),
        sentTime: '09:30 AM',
        year: 2024,
        amountDue: 3800.00,
        status: 'Sent to Client',
        dueDate: daysFromNow(15),  // 15 days in future - Not overdue
        viewedAt: daysAgo(9),
        viewedTime: '02:00 PM',
        lineItemsCount: 7,
        lineItems: [
          { name: 'Software Licensing', description: 'Annual enterprise licenses', amount: 1400.00 },
          { name: 'Cloud Storage', description: '12 months cloud backup service', amount: 650.00 },
          { name: 'IT Support', description: 'Monthly managed IT support', amount: 550.00 },
          { name: 'Security Audit', description: 'Cybersecurity assessment', amount: 450.00 },
          { name: 'Hardware Setup', description: 'New workstation configuration', amount: 350.00 },
          { name: 'Network Configuration', description: 'VPN and network setup', amount: 250.00 },
          { name: 'Training', description: 'Security awareness training', amount: 150.00 },
        ],
      },
      {
        id: '9',
        client: 'David Chen',
        clientId: '109',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0009',
        created: daysAgo(12),
        createdTime: '11:00 AM',
        sentOn: daysAgo(12),
        sentTime: '11:30 AM',
        year: 2024,
        amountDue: 2200.00,
        status: 'Viewed',
        dueDate: daysFromNow(8),  // 8 days in future - Not overdue
        viewedAt: daysAgo(11),
        viewedTime: '09:00 AM',
        lineItemsCount: 4,
        lineItems: [
          { name: 'Financial Planning', description: 'Retirement planning consultation', amount: 1000.00 },
          { name: 'Investment Analysis', description: 'Portfolio review and recommendations', amount: 700.00 },
          { name: 'Tax Strategy', description: 'Tax-efficient investment planning', amount: 350.00 },
          { name: 'Insurance Review', description: 'Life and disability insurance analysis', amount: 150.00 },
        ],
      },
      {
        id: '10',
        client: 'Summit Consulting',
        clientId: '110',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0010',
        created: daysAgo(8),
        createdTime: '01:00 PM',
        sentOn: daysAgo(8),
        sentTime: '01:15 PM',
        year: 2024,
        amountDue: 6500.00,
        status: 'Sent to Client',
        dueDate: daysFromNow(20),  // 20 days in future - Not overdue
        viewedAt: daysAgo(7),
        viewedTime: '10:30 AM',
        lineItemsCount: 8,
        lineItems: [
          { name: 'Project Management', description: 'Q4 project oversight and coordination', amount: 2100.00 },
          { name: 'Client Meetings', description: 'Weekly status meetings and reporting', amount: 1400.00 },
          { name: 'Requirements Analysis', description: 'Business requirements documentation', amount: 900.00 },
          { name: 'Stakeholder Workshops', description: 'User story and workflow sessions', amount: 700.00 },
          { name: 'Risk Management', description: 'Project risk identification and mitigation', amount: 500.00 },
          { name: 'Quality Assurance', description: 'UAT coordination and testing', amount: 400.00 },
          { name: 'Change Management', description: 'Process change documentation', amount: 450.00 },
          { name: 'Post-Launch Support', description: 'Go-live support and monitoring', amount: 50.00 },
        ],
      },
      {
        id: '16',
        client: 'Bright Future Inc',
        clientId: '116',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0016',
        created: daysAgo(5),
        createdTime: '02:00 PM',
        sentOn: daysAgo(5),
        sentTime: '02:15 PM',
        year: 2024,
        amountDue: 4200.00,
        status: 'Viewed',
        dueDate: daysFromNow(5),  // 5 days in future - Not overdue
        viewedAt: daysAgo(4),
        viewedTime: '11:00 AM',
        lineItemsCount: 6,
        lineItems: [
          { name: 'Brand Strategy', description: 'Brand positioning and messaging', amount: 1500.00 },
          { name: 'Logo Design', description: 'Corporate logo design and variations', amount: 1100.00 },
          { name: 'Brand Guidelines', description: 'Visual identity style guide', amount: 700.00 },
          { name: 'Marketing Collateral', description: 'Business cards and letterhead design', amount: 500.00 },
          { name: 'Social Media Assets', description: 'Social media templates and graphics', amount: 300.00 },
          { name: 'Brand Launch', description: 'Brand launch presentation', amount: 100.00 },
        ],
      },
      
      // Pending Payment - Overdue (due more than 7 days ago with default threshold)
      {
        id: '2',
        client: 'John Smith',
        clientId: '102',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0002',
        created: daysAgo(35),
        createdTime: '11:00 AM',
        sentOn: daysAgo(35),
        sentTime: '11:15 AM',
        year: 2024,
        amountDue: 1200.00,
        status: 'Viewed',
        dueDate: daysAgo(15),  // 15 days ago - Overdue (> 7 days threshold)
        viewedAt: daysAgo(34),
        viewedTime: '03:45 PM',
        lineItemsCount: 3,
        lineItems: [
          { name: 'Monthly Bookkeeping', description: 'September 2024 bookkeeping services', amount: 600.00 },
          { name: 'Bank Reconciliation', description: 'Monthly bank statement reconciliation', amount: 350.00 },
          { name: 'Expense Categorization', description: 'Expense tracking and categorization', amount: 250.00 },
        ],
      },
      {
        id: '6',
        client: 'Sarah Johnson',
        clientId: '106',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0006',
        created: daysAgo(40),
        createdTime: '03:00 PM',
        sentOn: daysAgo(40),
        sentTime: '03:15 PM',
        year: 2024,
        amountDue: 2100.00,
        status: 'Sent to Client',
        dueDate: daysAgo(20),  // 20 days ago - Overdue (> 7 days threshold)
        viewedAt: daysAgo(39),
        viewedTime: '10:15 AM',
        lineItemsCount: 4,
        lineItems: [
          { name: 'Tax Consultation', description: 'Personal tax planning session', amount: 900.00 },
          { name: 'Document Review', description: 'Financial document review and analysis', amount: 600.00 },
          { name: 'Retirement Planning', description: 'IRA and 401k optimization', amount: 400.00 },
          { name: 'Filing Assistance', description: 'Tax form preparation assistance', amount: 200.00 },
        ],
      },
      {
        id: '11',
        client: 'Riverside Properties',
        clientId: '111',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0011',
        created: daysAgo(38),
        createdTime: '09:30 AM',
        sentOn: daysAgo(38),
        sentTime: '09:45 AM',
        year: 2024,
        amountDue: 8900.00,
        status: 'Viewed',
        dueDate: daysAgo(18),  // 18 days ago - Overdue (> 7 days threshold)
        viewedAt: daysAgo(37),
        viewedTime: '11:00 AM',
        lineItemsCount: 10,
        lineItems: [
          { name: 'Property Management Services', description: 'Monthly property management', amount: 2500.00 },
          { name: 'Tenant Screening', description: 'Background checks and credit reports', amount: 1200.00 },
          { name: 'Lease Agreement Prep', description: 'Lease document preparation', amount: 900.00 },
          { name: 'Rent Collection', description: 'Rent collection and processing', amount: 800.00 },
          { name: 'Maintenance Coordination', description: 'Property maintenance scheduling', amount: 700.00 },
          { name: 'Property Inspections', description: 'Quarterly property inspections', amount: 650.00 },
          { name: 'Financial Reporting', description: 'Monthly owner statements', amount: 550.00 },
          { name: 'Vendor Management', description: 'Contractor coordination', amount: 450.00 },
          { name: 'Legal Compliance', description: 'Regulatory compliance review', amount: 850.00 },
          { name: 'Emergency Services', description: '24/7 emergency response', amount: 300.00 },
        ],
      },
      
      // NEW: Overdue but NOT VIEWED - Critical attention needed!
      {
        id: '16',
        client: 'Urgent Corp',
        clientId: '116',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0016',
        created: daysAgo(25),
        createdTime: '09:00 AM',
        sentOn: daysAgo(25),
        sentTime: '09:30 AM',
        year: 2024,
        amountDue: 12800.00,
        status: 'Sent to Client',
        dueDate: daysAgo(10),  // 10 days overdue
        // NO viewedAt - this will show "OVERDUE (10d) • NOT VIEWED"
        lineItemsCount: 8,
        lineItems: [
          { name: 'Consulting Services', description: 'Business strategy consulting', amount: 4200.00 },
          { name: 'Market Research', description: 'Industry analysis and competitor research', amount: 2800.00 },
          { name: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities, threats', amount: 1900.00 },
          { name: 'Executive Coaching', description: 'Leadership coaching sessions', amount: 1500.00 },
          { name: 'Process Documentation', description: 'Standard operating procedures', amount: 900.00 },
          { name: 'Team Training', description: 'Staff development workshop', amount: 700.00 },
          { name: 'Implementation Plan', description: 'Strategic implementation roadmap', amount: 500.00 },
          { name: 'Follow-up Support', description: 'Post-consulting support', amount: 300.00 },
        ],
      },
      {
        id: '17',
        client: 'Late Payer LLC',
        clientId: '117',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0017',
        created: daysAgo(50),
        createdTime: '11:00 AM',
        sentOn: daysAgo(50),
        sentTime: '11:30 AM',
        year: 2024,
        amountDue: 6700.00,
        status: 'Sent to Client',
        dueDate: daysAgo(22),  // 22 days overdue!
        // NO viewedAt - this will show "OVERDUE (22d) • NOT VIEWED"
        lineItemsCount: 5,
        lineItems: [
          { name: 'Legal Consulting', description: 'Contract review and negotiation', amount: 2400.00 },
          { name: 'Compliance Review', description: 'Regulatory compliance assessment', amount: 1800.00 },
          { name: 'Policy Development', description: 'Corporate policy documentation', amount: 1200.00 },
          { name: 'Risk Assessment', description: 'Legal risk evaluation', amount: 900.00 },
          { name: 'Advisory Services', description: 'General legal advisory', amount: 400.00 },
        ],
      },
      
      // NEW: Due Soon but NOT VIEWED - Needs attention
      {
        id: '18',
        client: 'Procrastinator Inc',
        clientId: '118',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0018',
        created: daysAgo(10),
        createdTime: '02:00 PM',
        sentOn: daysAgo(10),
        sentTime: '02:30 PM',
        year: 2024,
        amountDue: 4200.00,
        status: 'Sent to Client',
        dueDate: daysFromNow(2),  // Due in 2 days
        // NO viewedAt - this will show "DUE SOON (2d) • NOT VIEWED"
        lineItemsCount: 3,
        lineItems: [
          { name: 'Website Maintenance', description: 'Monthly website updates and security', amount: 2000.00 },
          { name: 'Content Updates', description: 'Blog posts and page content updates', amount: 1400.00 },
          { name: 'Performance Optimization', description: 'Site speed and SEO improvements', amount: 800.00 },
        ],
      },
      
      // Drafts
      {
        id: '4',
        client: 'Jane Doe',
        clientId: '104',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0004',
        created: daysAgo(5),
        createdTime: '02:00 PM',
        sentOn: '',
        sentTime: '',
        year: 2024,
        amountDue: 850.00,
        status: 'Draft',
        dueDate: daysFromNow(12),
        lineItemsCount: 2,
        lineItems: [
          { name: 'Personal Tax Return', description: 'Individual tax preparation', amount: 550.00 },
          { name: 'State Filing', description: 'State tax return', amount: 300.00 },
        ],
      },
      {
        id: '12',
        client: 'Marcus Williams',
        clientId: '112',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0012',
        created: daysAgo(2),
        createdTime: '04:00 PM',
        sentOn: '',
        sentTime: '',
        year: 2024,
        amountDue: 1500.00,
        status: 'Draft',
        dueDate: daysFromNow(17),
        lineItemsCount: 3,
        lineItems: [
          { name: 'Financial Consultation', description: 'Investment planning session', amount: 800.00 },
          { name: 'Portfolio Analysis', description: 'Investment portfolio review', amount: 450.00 },
          { name: 'Recommendation Report', description: 'Written recommendations and strategy', amount: 250.00 },
        ],
      },
      
      // Paid (older than 7 days)
      {
        id: '13',
        client: 'Northwest Corp',
        clientId: '113',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0013',
        created: daysAgo(50),
        createdTime: '10:00 AM',
        sentOn: daysAgo(50),
        sentTime: '10:15 AM',
        year: 2024,
        amountDue: 7200.00,
        status: 'Paid',
        dueDate: daysAgo(35),
        paidAt: daysAgo(20),  // 20 days ago - Paid (older than 7 days)
        paidTime: '01:30 PM',
        paidVia: 'ACH',
        viewedAt: daysAgo(49),
        viewedTime: '09:00 AM',
        lineItemsCount: 9,
        lineItems: [
          { name: 'Corporate Tax Preparation', description: 'Business tax return preparation', amount: 2400.00 },
          { name: 'Quarterly Filings', description: 'Q1-Q4 quarterly tax estimates', amount: 1500.00 },
          { name: 'Sales Tax Management', description: 'Monthly sales tax filings', amount: 1100.00 },
          { name: 'Payroll Tax Filing', description: 'Annual payroll tax returns', amount: 900.00 },
          { name: 'Tax Planning', description: 'Strategic tax planning consultation', amount: 550.00 },
          { name: 'Audit Support', description: 'Tax audit representation', amount: 350.00 },
          { name: 'Document Preparation', description: 'Tax document organization', amount: 250.00 },
          { name: 'State Compliance', description: 'Multi-state tax compliance', amount: 100.00 },
          { name: 'Extension Filing', description: 'Tax extension preparation', amount: 50.00 },
        ],
      },
      {
        id: '14',
        client: 'Emily Taylor',
        clientId: '114',
        clientType: 'Individual',
        invoiceNo: 'INV-2024-0014',
        created: daysAgo(60),
        createdTime: '02:00 PM',
        sentOn: daysAgo(60),
        sentTime: '02:15 PM',
        year: 2024,
        amountDue: 3200.00,
        status: 'Paid',
        dueDate: daysAgo(45),
        paidAt: daysAgo(40),  // 40 days ago - Paid (older than 7 days)
        paidTime: '03:45 PM',
        paidVia: 'Check',
        viewedAt: daysAgo(59),
        viewedTime: '10:00 AM',
        lineItemsCount: 5,
        lineItems: [
          { name: 'Estate Tax Planning', description: 'Estate tax strategy and planning', amount: 1400.00 },
          { name: 'Gift Tax Review', description: 'Annual gift tax analysis', amount: 800.00 },
          { name: 'Trust Tax Return', description: 'Irrevocable trust tax filing', amount: 550.00 },
          { name: 'Beneficiary Analysis', description: 'Beneficiary designation review', amount: 300.00 },
          { name: 'Document Updates', description: 'Trust document amendments', amount: 150.00 },
        ],
      },
      
      // Void
      {
        id: '15',
        client: 'Cancelled Client LLC',
        clientId: '115',
        clientType: 'Business',
        invoiceNo: 'INV-2024-0015',
        created: daysAgo(25),
        createdTime: '11:00 AM',
        sentOn: daysAgo(25),
        sentTime: '11:15 AM',
        year: 2024,
        amountDue: 4500.00,
        status: 'Void',
        dueDate: daysAgo(10),
        viewedAt: daysAgo(24),
        viewedTime: '09:30 AM',
        lineItemsCount: 6,
        lineItems: [
          { name: 'Service Agreement - VOIDED', description: 'Annual service contract (cancelled)', amount: 2000.00 },
          { name: 'Setup Fee - VOIDED', description: 'Initial setup and onboarding', amount: 1200.00 },
          { name: 'Consulting - VOIDED', description: 'Strategic consulting sessions', amount: 800.00 },
          { name: 'Training - VOIDED', description: 'Staff training program', amount: 300.00 },
          { name: 'Support - VOIDED', description: 'Technical support package', amount: 150.00 },
          { name: 'Materials - VOIDED', description: 'Training materials and documentation', amount: 50.00 },
        ],
      },
    ];
  });

  // Card configurations
  const cardConfigs: Record<StatCardType, StatCardConfig> = {
    all: {
      id: 'all',
      label: 'Total',
      label2: 'Invoices',
      icon: <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />,
      color: 'var(--primaryColor)',
      bgColor: 'rgba(124, 58, 237, 0.1)',
      getValue: (stats) => stats.total,
    },
    paid: {
      id: 'paid',
      label: 'Paid',
      label2: 'Invoices',
      icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      color: '#16a34a',
      bgColor: 'rgb(220, 252, 231)',
      getValue: (stats) => stats.paid,
    },
    unpaid: {
      id: 'unpaid',
      label: 'Pending',
      label2: 'Payment',
      icon: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: '#2563eb',
      bgColor: 'rgb(219, 234, 254)',
      getValue: (stats) => stats.unpaid,
    },
    overdue: {
      id: 'overdue',
      label: 'Overdue',
      label2: 'Invoices',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      color: '#ea580c',
      bgColor: 'rgb(254, 215, 170)',
      getValue: (stats) => stats.overdue,
    },
    draft: {
      id: 'draft',
      label: 'Draft',
      label2: 'Invoices',
      icon: <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      color: '#6b7280',
      bgColor: 'rgb(243, 244, 246)',
      getValue: (stats) => stats.draft,
    },
    recent: {
      id: 'recent',
      label: 'Recently',
      label2: 'Paid',
      icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: '#059669',
      bgColor: 'rgb(209, 250, 229)',
      getValue: (stats) => stats.recent,
    },
  };

  // Calculate stats
  useEffect(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const paid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amountDue, 0);
    const unpaid = invoices.filter(inv => inv.status === 'Sent to Client' || inv.status === 'Viewed').reduce((sum, inv) => sum + inv.amountDue, 0);
    const overdue = invoices.filter(inv => isOverdue(inv)).reduce((sum, inv) => sum + inv.amountDue, 0);  // Use dynamic calculation
    const draft = invoices.filter(inv => inv.status === 'Draft').reduce((sum, inv) => sum + inv.amountDue, 0);
    
    const now = new Date();
    const recent = invoices.filter(inv => {
      if (inv.status !== 'Paid' || !inv.paidAt) return false;
      const paidDate = new Date(inv.paidAt);
      const daysDiff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).reduce((sum, inv) => sum + inv.amountDue, 0);

    setStats({ total, paid, unpaid, overdue, draft, recent });
  }, [invoices, overdueSendThreshold]);  // Add overdueSendThreshold as dependency

  const isRecentlyPaid = (invoice: Invoice): boolean => {
    if (invoice.status !== 'Paid' || !invoice.paidAt) return false;
    const paidDate = new Date(invoice.paidAt);
    const now = new Date();
    const daysDiff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  // Helper to check if an invoice is overdue
  const isOverdue = (invoice: Invoice) => {
    // Only check unpaid invoices
    if (invoice.status === 'Paid' || invoice.status === 'Draft' || invoice.status === 'Void') {
      return false;
    }
    
    // Calculate days since due date
    if (!invoice.dueDate) return false;
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Invoice is overdue if it's past due date by more than the threshold
    return daysSinceDue > overdueSendThreshold;
  };

  // Move card function for drag and drop
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCardOrder(newOrder);
    localStorage.setItem('billingCardOrder', JSON.stringify(newOrder));
  };

  // Move section function for drag and drop
  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setSectionOrder(newOrder);
    localStorage.setItem('billingSectionOrder', JSON.stringify(newOrder));
  };

  // Scroll to section by section ID (used by section navigation buttons)
  const scrollToSectionById = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll to section based on stat card filter
  const scrollToSection = (filter: StatusFilter) => {
    // Map filter to section ID
    const filterToSectionMap: Record<StatusFilter, string | null> = {
      'all': null, // Show all sections in their current order
      'recent': 'recentlyPaid',
      'paid': 'paid',
      'unpaid': 'pendingPayment',
      'overdue': 'overdue', // Overdue is its own section
      'draft': 'drafts',
      'void': 'void',
    };

    const targetSection = filterToSectionMap[filter];
    
    if (targetSection) {
      scrollToSectionById(targetSection);
    }
  };

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    scrollToSection(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle individual resend click
  const handleResendClick = (invoiceId: string) => {
    setResendConfirmDialog({
      open: true,
      invoiceId: invoiceId,
    });
  };

  // Handle resend confirmation
  const handleResendConfirm = async () => {
    if (!resendConfirmDialog.invoiceId) return;
    
    try {
      // Record the resend timestamp
      const now = new Date().getTime();
      const updatedResentInvoices = {
        ...resentInvoices,
        [resendConfirmDialog.invoiceId]: now,
      };
      setResentInvoices(updatedResentInvoices);
      localStorage.setItem('resentInvoices', JSON.stringify(updatedResentInvoices));
      
      // Close the dialog
      setResendConfirmDialog({ open: false, invoiceId: null });
      
      console.log('Invoice resent successfully');
    } catch (error) {
      console.error('Failed to resend invoice:', error);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowMarkAsPaidDialog(true);
  };

  const handleMarkAsPaidConfirm = () => {
    if (!selectedInvoiceForPayment) return;
    
    // Update the invoice status
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === selectedInvoiceForPayment.id
          ? {
              ...inv,
              status: 'Paid' as InvoiceStatus,
              paidAt: paymentDate,
              paidTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              paidVia: paymentMethod,
            }
          : inv
      )
    );
    
    setShowMarkAsPaidDialog(false);
    setSelectedInvoiceForPayment(null);
  };

  // Handle void invoice
  const handleVoidClick = (invoiceId: string) => {
    setVoidConfirmDialog({
      open: true,
      invoiceId: invoiceId,
    });
  };

  const handleVoidConfirm = () => {
    if (!voidConfirmDialog.invoiceId) return;
    
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === voidConfirmDialog.invoiceId
          ? { ...inv, status: 'Void' as InvoiceStatus }
          : inv
      )
    );
    
    setVoidConfirmDialog({ open: false, invoiceId: null });
  };

  // Handle delete invoice
  const handleDeleteClick = (invoiceId: string) => {
    setDeleteConfirmDialog({
      open: true,
      invoiceId: invoiceId,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmDialog.invoiceId) return;
    
    setInvoices(prevInvoices =>
      prevInvoices.filter(inv => inv.id !== deleteConfirmDialog.invoiceId)
    );
    
    setDeleteConfirmDialog({ open: false, invoiceId: null });
  };

  // Fetch overdue invoices for bulk send
  const fetchOverdueInvoices = () => {
    const overdue = invoices.filter(invoice => isOverdue(invoice));
    setOverdueInvoices(overdue);
  };

  useEffect(() => {
    if (showBulkSendDialog) {
      fetchOverdueInvoices();
    }
  }, [showBulkSendDialog, resentInvoices, invoices]);

  // Track scroll position for scroll to top button
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setShowScrollTop(scrollTop > 400);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBulkSendConfirm = async (selectedIds: string[]) => {
    try {
      const now = new Date().getTime();
      const updatedResentInvoices = { ...resentInvoices };
      selectedIds.forEach(id => {
        updatedResentInvoices[id] = now;
      });
      setResentInvoices(updatedResentInvoices);
      localStorage.setItem('resentInvoices', JSON.stringify(updatedResentInvoices));
      
      setShowBulkSendDialog(false);
      
      console.log(`Bulk sent ${selectedIds.length} invoice reminders successfully`);
    } catch (error) {
      console.error('Failed to bulk send invoices:', error);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    if (searchQuery && !invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (clientTypeFilter !== 'all' && invoice.clientType !== clientTypeFilter) {
      return false;
    }
    if (statusFilter === 'paid' && invoice.status !== 'Paid') return false;
    if (statusFilter === 'unpaid' && invoice.status !== 'Sent to Client' && invoice.status !== 'Viewed') return false;
    if (statusFilter === 'overdue' && invoice.status !== 'Overdue') return false;
    if (statusFilter === 'draft' && invoice.status !== 'Draft') return false;
    if (statusFilter === 'void' && invoice.status !== 'Void') return false;
    if (statusFilter === 'recent' && !isRecentlyPaid(invoice)) return false;
    return true;
  });

  // Group invoices by status for display
  const recentlyPaid = filteredInvoices.filter(isRecentlyPaid);
  const overdueInvoicesList = filteredInvoices.filter(inv => isOverdue(inv));  // Use dynamic calculation
  const notOverdueInvoices = filteredInvoices.filter(inv => (inv.status === 'Sent to Client' || inv.status === 'Viewed') && !isOverdue(inv));  // Not overdue
  const allPendingPayment = filteredInvoices.filter(inv => inv.status === 'Sent to Client' || inv.status === 'Viewed');  // Combined: overdue + not overdue
  const drafts = filteredInvoices.filter(inv => inv.status === 'Draft');
  const voidInvoices = filteredInvoices.filter(inv => inv.status === 'Void');
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'Paid' && !isRecentlyPaid(inv));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">Invoices</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                </p>
              </div>
              <NotificationDrawer 
                category="invoice"
                onNavigateToSettings={() => navigate('/settings/notifications')}
                trigger={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Notifications
                  </Button>
                }
              />
            </div>

            {/* Stats Bar - Draggable Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
            {cardOrder.map((cardId, index) => (
              <DraggableStatCard
                key={cardId}
                config={cardConfigs[cardId]}
                index={index}
                stats={stats}
                statusFilter={statusFilter}
                onFilterChange={handleFilterChange}
                moveCard={moveCard}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 border-gray-300 dark:border-gray-600 w-full"
                />
              </div>
              
              {/* Client Type Filter */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setClientTypeFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs transition-colors",
                    clientTypeFilter === 'all' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  All
                </button>
                <button
                  onClick={() => setClientTypeFilter('Individual')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                    clientTypeFilter === 'Individual' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'Individual' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <User className="w-3.5 h-3.5" />
                  Individual
                </button>
                <button
                  onClick={() => setClientTypeFilter('Business')}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                    clientTypeFilter === 'Business' 
                      ? "text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                  style={clientTypeFilter === 'Business' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Business
                </button>
              </div>

              {/* Clear Filters */}
              {(statusFilter !== 'all' || clientTypeFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setClientTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button
                size="sm"
                className="gap-2"
                style={{ backgroundColor: 'var(--primaryColor)' }}
                onClick={() => navigate('/billing/add-invoice')}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">New</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 relative text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20 text-xs gap-1.5"
                onClick={() => setShowBulkSendDialog(true)}
                title="Bulk Send Overdue Reminders"
              >
                <MailPlus className="w-3.5 h-3.5" />
                Bulk Send
                {overdueInvoicesList.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-orange-500 text-white border-white dark:border-gray-900">
                    {overdueInvoicesList.length}
                  </Badge>
                )}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => navigate('/payment-reminder-strategy')}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure email reminder settings</p>
                </TooltipContent>
              </Tooltip>
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

          {/* View Toggle Row - with Invoice count, Section Navigation, and View Toggle */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 md:mb-6 gap-4">
            {/* Left: Invoice Count */}
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 dark:text-gray-100">Invoices</h3>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                {filteredInvoices.length}
              </Badge>
            </div>

            {/* Center: Section Navigation Menu */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-start lg:justify-center flex-1 px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-full lg:w-auto">
              {sectionOrder.map((sectionId, index) => {
              const sectionConfigs: Record<string, { label: string; count: number; icon: React.ReactNode }> = {
                recentlyPaid: {
                  label: 'Recently Paid',
                  count: recentlyPaid.length,
                  icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
                },
                overdue: {
                  label: 'Overdue',
                  count: overdueInvoicesList.length,
                  icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
                },
                pendingPayment: {
                  label: 'Pending Payment',
                  count: notOverdueInvoices.length,
                  icon: <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
                },
                drafts: {
                  label: 'Drafts',
                  count: drafts.length,
                  icon: <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />,
                },
                paid: {
                  label: 'Paid',
                  count: paidInvoices.length,
                  icon: <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />,
                },
                void: {
                  label: 'Void',
                  count: voidInvoices.length,
                  icon: <XCircle className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />,
                },
              };
              
              const config = sectionConfigs[sectionId];
              if (!config || config.count === 0) return null;
              
              return (
                <DraggableSectionButton
                  key={sectionId}
                  sectionId={sectionId}
                  label={config.label}
                  count={config.count}
                  icon={config.icon}
                  index={index}
                  moveSection={moveSection}
                  onClick={() => scrollToSectionById(sectionId)}
                />
              );
            })}
            
            {/* Separator */}
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />
            
            {/* Reorder Button */}
            <button
              onClick={() => {
                setTempSectionOrder(sectionOrder);
                setShowReorderDialog(true);
              }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
                "text-gray-500 dark:text-gray-500",
                "hover:text-gray-900 dark:hover:text-gray-200",
                "font-medium"
              )}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Reorder</span>
            </button>
            </div>
            
            {/* Right: View Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs",
                  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                onClick={() => {
                  localStorage.setItem('billingViewPreference', 'single');
                  navigate('/billing/table');
                }}
              >
                <List className="w-3.5 h-3.5" />
                Table View
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
                Split Table
              </Button>
              <Button
                size="sm"
                className={cn(
                  "gap-1.5 h-7 px-3 text-xs text-white"
                )}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Card View
              </Button>
            </div>
          </div>

          {/* Card Sections - Dynamically ordered */}
          {sectionOrder.map((sectionId) => {
            // Helper to check if invoice is due soon (within 7 days)
            const isDueSoon = (invoice: Invoice) => {
              if (!invoice.dueDate || invoice.status === 'Paid' || invoice.status === 'Void' || invoice.status === 'Draft') return false;
              const today = new Date();
              const dueDate = new Date(invoice.dueDate);
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays > 0 && diffDays <= 7;
            };

            // Sort pending payment: due soon first, then others
            const sortedPendingInvoices = [...notOverdueInvoices].sort((a, b) => {
              const aDueSoon = isDueSoon(a);
              const bDueSoon = isDueSoon(b);
              if (aDueSoon && !bDueSoon) return -1;
              if (!aDueSoon && bDueSoon) return 1;
              return 0;
            });

            // Split pending payment into due soon and others for visual separator
            const dueSoonInvoices = sortedPendingInvoices.filter(isDueSoon);
            const otherPendingInvoices = sortedPendingInvoices.filter(inv => !isDueSoon(inv));
            
            // Sort due soon invoices by days until due (ascending: 1 day, 2 days, etc.)
            const sortedDueSoonInvoices = [...dueSoonInvoices].sort((a, b) => {
              const today = new Date();
              const aDueDate = new Date(a.dueDate);
              const bDueDate = new Date(b.dueDate);
              const aDiffDays = Math.ceil((aDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const bDiffDays = Math.ceil((bDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return aDiffDays - bDiffDays; // Ascending order: 1 day first, then 2 days, etc.
            });

            // Section rendering configuration
            const sections: Record<string, { invoices: Invoice[]; icon: React.ReactNode; title: string; badge: React.ReactNode }> = {
              recentlyPaid: {
                invoices: recentlyPaid,
                icon: <Sparkles className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />,
                title: 'Recently Paid',
                badge: (
                  <>
                    <Badge variant="outline" className="ml-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      {recentlyPaid.length} invoice{recentlyPaid.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="ml-2" style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--primaryColor) 15%, transparent)',
                      color: 'var(--primaryColor)',
                      borderColor: 'var(--primaryColor)'
                    }}>
                      Last 7 days
                    </Badge>
                  </>
                ),
              },
              overdue: {
                invoices: overdueInvoicesList,
                icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
                title: 'Overdue',
                badge: (
                  <Badge variant="outline" className="ml-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    {overdueInvoicesList.length} invoice{overdueInvoicesList.length !== 1 ? 's' : ''}
                  </Badge>
                ),
              },
              pendingPayment: {
                invoices: sortedPendingInvoices,
                icon: <Clock className="w-5 h-5 text-blue-500" />,
                title: 'Pending Payment',
                badge: (
                  <Badge variant="outline" className="ml-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {notOverdueInvoices.length} invoice{notOverdueInvoices.length !== 1 ? 's' : ''}
                  </Badge>
                ),
              },
              drafts: {
                invoices: drafts,
                icon: <Edit className="w-5 h-5 text-gray-500" />,
                title: 'Drafts',
                badge: (
                  <Badge variant="outline" className="ml-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                    {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
                  </Badge>
                ),
              },
              paid: {
                invoices: paidInvoices,
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                title: 'Paid',
                badge: (
                  <Badge variant="outline" className="ml-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    {paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}
                  </Badge>
                ),
              },
              void: {
                invoices: voidInvoices,
                icon: <XCircle className="w-5 h-5 text-gray-500" />,
                title: 'Void',
                badge: (
                  <Badge variant="outline" className="ml-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                    {voidInvoices.length} void
                  </Badge>
                ),
              },
            };

            const section = sections[sectionId];
            if (!section || section.invoices.length === 0) return null;

            return (
              <div key={sectionId} id={`section-${sectionId}`} className="mb-12 md:mb-16 scroll-mt-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {section.icon}
                  <h2 className="text-lg md:text-xl text-gray-900 dark:text-gray-100">{section.title}</h2>
                  {section.badge}
                  
                  {/* Bulk Send button for Overdue section */}
                  {sectionId === 'overdue' && overdueInvoicesList.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 relative text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 text-xs gap-1.5 ml-2"
                      onClick={() => setShowBulkSendDialog(true)}
                      title="Bulk Send Overdue Reminders"
                    >
                      <MailPlus className="w-3.5 h-3.5" />
                      Bulk Send
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-white dark:border-gray-900">
                        {overdueInvoicesList.length}
                      </Badge>
                    </Button>
                  )}
                </div>
                
                {/* Special handling for Pending Payment section - sorted with visual separator */}
                {sectionId === 'pendingPayment' ? (
                  <>
                    {/* Due Soon Invoices */}
                    {sortedDueSoonInvoices.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-[2560px]:grid-cols-4 gap-3 md:gap-4">
                          {sortedDueSoonInvoices.map(invoice => (
                            <div key={invoice.id} style={{ opacity: !invoice.viewedAt && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' ? 0.9 : 1 }}>
                              <InvoiceCard 
                                invoice={invoice} 
                                isOverdue={isOverdue}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                handleMarkAsPaid={handleMarkAsPaid}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Visual Separator if there are other pending invoices */}
                        {otherPendingInvoices.length > 0 && (
                          <div className="flex items-center justify-center my-12 relative">
                            <div className="w-[85%] h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-60"></div>
                            <span className="absolute text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-white dark:bg-gray-900 px-3">
                              Other Pending
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Other Pending Invoices */}
                    {otherPendingInvoices.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-[2560px]:grid-cols-4 gap-3 md:gap-4">
                        {otherPendingInvoices.map(invoice => (
                          <div key={invoice.id} style={{ opacity: !invoice.viewedAt && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' ? 0.9 : 1 }}>
                            <InvoiceCard 
                              invoice={invoice} 
                              isOverdue={isOverdue}
                              formatCurrency={formatCurrency}
                              formatDate={formatDate}
                              handleMarkAsPaid={handleMarkAsPaid}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Regular grid for all other sections */
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-[2560px]:grid-cols-4 gap-3 md:gap-4">
                    {(sectionId === 'paid' ? section.invoices.slice(0, 8) : section.invoices).map(invoice => (
                      <div key={invoice.id} style={{ opacity: !invoice.viewedAt && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' ? 0.9 : 1 }}>
                        <InvoiceCard 
                          invoice={invoice} 
                          isOverdue={isOverdue}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          handleMarkAsPaid={handleMarkAsPaid}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">No invoices found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or create a new invoice
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <BulkSendInvoicesDialog
        open={showBulkSendDialog}
        onClose={() => setShowBulkSendDialog(false)}
        overdueInvoices={overdueInvoices}
        onConfirm={handleBulkSendConfirm}
      />

      <BillingSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        overdueSendThreshold={overdueSendThreshold}
        onOverdueSendThresholdChange={(days) => {
          setOverdueSendThreshold(days);
          localStorage.setItem('billingOverdueSendThreshold', days.toString());
        }}
      />

      {/* Mark as Paid Dialog */}
      <Dialog open={showMarkAsPaidDialog} onOpenChange={setShowMarkAsPaidDialog}>
        <DialogContent aria-describedby="mark-paid-description">
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription id="mark-paid-description">
              Record payment for invoice {selectedInvoiceForPayment?.invoiceNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACH">ACH</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Wire">Wire</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="Klarna">Klarna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Date
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedInvoiceForPayment && formatCurrency(selectedInvoiceForPayment.amountDue)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkAsPaidDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaidConfirm} style={{ backgroundColor: 'var(--primaryColor)' }}>
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Confirmation Dialog */}
      <AlertDialog
        open={resendConfirmDialog.open}
        onOpenChange={(open) => setResendConfirmDialog({ open, invoiceId: resendConfirmDialog.invoiceId })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a reminder email to the client. The overdue badge will be hidden for {overdueSendThreshold} {overdueSendThreshold === 1 ? 'day' : 'days'} after sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResendConfirm}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Send Reminder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Void Confirmation Dialog */}
      <AlertDialog
        open={voidConfirmDialog.open}
        onOpenChange={(open) => setVoidConfirmDialog({ open, invoiceId: voidConfirmDialog.invoiceId })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the invoice as void. This action can be reversed by editing the invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoidConfirm}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Void Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => setDeleteConfirmDialog({ open, invoiceId: deleteConfirmDialog.invoiceId })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reorder Sections Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="reorder-sections-description">
          <DialogHeader>
            <DialogTitle>Reorder Invoice Sections</DialogTitle>
            <DialogDescription id="reorder-sections-description">
              Drag and drop to reorder the sections in your preferred sequence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <DndProvider backend={HTML5Backend}>
              {tempSectionOrder.map((sectionId, index) => {
                const sectionConfigs: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
                  recentlyPaid: {
                    label: 'Recently Paid',
                    icon: <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
                    color: 'text-emerald-600 dark:text-emerald-400',
                  },
                  overdue: {
                    label: 'Overdue',
                    icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
                    color: 'text-amber-600 dark:text-amber-400',
                  },
                  pendingPayment: {
                    label: 'Pending Payment',
                    icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
                    color: 'text-blue-600 dark:text-blue-400',
                  },
                  drafts: {
                    label: 'Drafts',
                    icon: <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
                    color: 'text-gray-600 dark:text-gray-400',
                  },
                  paid: {
                    label: 'Paid',
                    icon: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />,
                    color: 'text-green-600 dark:text-green-400',
                  },
                  void: {
                    label: 'Void',
                    icon: <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
                    color: 'text-gray-600 dark:text-gray-400',
                  },
                };

                const config = sectionConfigs[sectionId];
                if (!config) return null;

                const handleMoveReorderItem = (dragIndex: number, hoverIndex: number) => {
                  const newOrder = [...tempSectionOrder];
                  const [removed] = newOrder.splice(dragIndex, 1);
                  newOrder.splice(hoverIndex, 0, removed);
                  setTempSectionOrder(newOrder);
                };

                return (
                  <DraggableReorderItem
                    key={sectionId}
                    sectionId={sectionId}
                    label={config.label}
                    icon={config.icon}
                    color={config.color}
                    index={index}
                    moveItem={handleMoveReorderItem}
                  />
                );
              })}
            </DndProvider>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTempSectionOrder(sectionOrder);
                setShowReorderDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSectionOrder(tempSectionOrder);
                localStorage.setItem('billingSectionOrder', JSON.stringify(tempSectionOrder));
                setShowReorderDialog(false);
              }}
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 h-12 w-12 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
          style={{ 
            backgroundColor: 'var(--primaryColor)',
            opacity: showScrollTop ? 1 : 0,
            pointerEvents: showScrollTop ? 'auto' : 'none'
          }}
          title="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 text-white" />
        </Button>
      )}
    </DndProvider>
  );
}