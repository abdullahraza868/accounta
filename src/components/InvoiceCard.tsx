import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Eye,
  User,
  Building2,
  Download,
  CreditCard,
  Edit,
  AlertCircle,
  XCircle,
  ArrowLeft,
  MailPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Zap
} from 'lucide-react';
import { Card } from './ui/card';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type PaymentMethod = 'ACH' | 'Wire' | 'Check' | 'Credit Card' | 'Cash' | 'PayPal' | 'Venmo' | 'Zelle' | 'Klarna' | 'Stripe';
type InvoiceStatus = 'Draft' | 'Sent to Client' | 'Viewed' | 'Paid' | 'Void';
type ClientType = 'Individual' | 'Business';

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
  lineItemsCount: number;
  lineItems?: Array<{
    name: string;
    description?: string;
    amount: number;
  }>;
};

type InvoiceCardProps = {
  invoice: Invoice;
  isOverdue: (invoice: Invoice) => boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  handleMarkAsPaid: (invoice: Invoice) => void;
};

export function InvoiceCard({ 
  invoice, 
  isOverdue, 
  formatCurrency, 
  formatDate,
  handleMarkAsPaid 
}: InvoiceCardProps) {
  const navigate = useNavigate();
  const invoiceOverdue = isOverdue(invoice);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isLineItemsExpanded, setIsLineItemsExpanded] = React.useState(false);

  // Build timeline events
  const buildTimeline = () => {
    try {
      const events: Array<{ 
        label: string; 
        date: string;
        time: string;
        color: string;
        timestamp?: number;
      }> = [];
      
      // Check if Created and Sent should be combined
      const shouldCombineCreatedAndSent = () => {
        if (!invoice.created || !invoice.sentOn || invoice.status === 'Draft') return false;
        
        const createdDate = new Date(invoice.created + ' ' + (invoice.createdTime || '00:00'));
        const sentDate = new Date(invoice.sentOn + ' ' + (invoice.sentTime || '00:00'));
        
        // Check if same day
        if (invoice.created !== invoice.sentOn) return false;
        
        // Check if within 1 hour
        const hoursDiff = Math.abs(sentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 1;
      };
      
      const combineCreatedAndSent = shouldCombineCreatedAndSent();
      
      // Created & Sent (combined)
      if (combineCreatedAndSent) {
        const timestamp = new Date(invoice.created + ' ' + (invoice.createdTime || '00:00')).getTime();
        events.push({
          label: 'Created/Sent',
          date: invoice.created,
          time: invoice.createdTime || '',
          color: 'blue',
          timestamp
        });
      } else {
        // Created (separate)
        if (invoice.created) {
          const timestamp = new Date(invoice.created + ' ' + (invoice.createdTime || '00:00')).getTime();
          events.push({
            label: 'Created',
            date: invoice.created,
            time: invoice.createdTime || '',
            color: 'gray',
            timestamp
          });
        }
        
        // Sent (separate)
        if (invoice.sentOn && invoice.status !== 'Draft') {
          const timestamp = new Date(invoice.sentOn + ' ' + (invoice.sentTime || '00:00')).getTime();
          events.push({
            label: 'Sent',
            date: invoice.sentOn,
            time: invoice.sentTime || '',
            color: 'blue',
            timestamp
          });
        }
      }
      
      // Viewed
      if (invoice.viewedAt) {
        const timestamp = new Date(invoice.viewedAt + ' ' + (invoice.viewedTime || '00:00')).getTime();
        events.push({
          label: 'Viewed',
          date: invoice.viewedAt,
          time: invoice.viewedTime || '',
          color: 'purple',
          timestamp
        });
      }
      
      // Paid
      if (invoice.paidAt && invoice.status === 'Paid') {
        const timestamp = new Date(invoice.paidAt + ' ' + (invoice.paidTime || '00:00')).getTime();
        events.push({
          label: 'Paid',
          date: invoice.paidAt,
          time: invoice.paidTime || '',
          color: 'green',
          timestamp
        });
      }
      
      return events;
    } catch (error) {
      console.error('Error building timeline:', error);
      return [];
    }
  };

  const timeline = buildTimeline();

  // Calculate if paid on time or late
  const getPaidStatus = () => {
    if (!invoice.paidAt || !invoice.dueDate || invoice.status !== 'Paid') return null;
    
    const paidDate = new Date(invoice.paidAt);
    const dueDate = new Date(invoice.dueDate);
    
    if (paidDate <= dueDate) {
      return { status: 'on-time', text: 'On Time' };
    } else {
      const diffTime = Math.abs(paidDate.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: 'late', text: `Late ${diffDays}d` };
    }
  };

  const paidStatus = getPaidStatus();

  // Calculate visual status for gray box
  const getVisualStatus = () => {
    const today = new Date();
    
    // Paid on Time
    if (invoice.status === 'Paid' && invoice.paidAt && invoice.dueDate) {
      const paidDate = new Date(invoice.paidAt);
      const dueDate = new Date(invoice.dueDate);
      
      if (paidDate <= dueDate) {
        return {
          type: 'paid-on-time',
          icon: CheckCircle,
          label: 'Paid on Time',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          date: invoice.paidAt,
          dateLabel: 'Paid'
        };
      } else {
        // Paid Late - but still PAID (positive with info)
        const diffTime = Math.abs(paidDate.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          type: 'paid-late',
          icon: CheckCircle,
          label: 'Paid Late',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          date: invoice.paidAt,
          dateLabel: 'Paid'
        };
      }
    }
    
    // Overdue
    if (invoiceOverdue && invoice.status !== 'Void') {
      const dueDate = new Date(invoice.dueDate);
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        type: 'overdue',
        icon: XCircle,
        label: `Overdue ${diffDays}d`,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        date: invoice.dueDate,
        dateLabel: 'Was Due'
      };
    }
    
    // Due Soon (within 7 days)
    if (invoice.dueDate && invoice.status !== 'Paid' && invoice.status !== 'Void') {
      const dueDate = new Date(invoice.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 7) {
        return {
          type: 'due-soon',
          icon: Clock,
          label: `Due in ${diffDays}d`,
          color: 'text-green-600 dark:text-green-400 opacity-70 animate-clock-tick',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          date: invoice.dueDate,
          dateLabel: 'Due Date'
        };
      }
    }
    
    // Awaiting Payment (sent but not paid, not overdue, not due soon)
    if ((invoice.status === 'Sent to Client' || invoice.status === 'Viewed') && invoice.sentOn) {
      const sentDate = new Date(invoice.sentOn);
      const diffTime = Math.abs(today.getTime() - sentDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return {
        type: 'awaiting',
        icon: MailPlus,
        label: diffDays > 0 ? `Sent ${diffDays}d ago` : 'Sent Today',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800/20',
        borderColor: 'border-gray-200 dark:border-gray-700',
        date: invoice.dueDate,
        dateLabel: 'Due Date'
      };
    }
    
    // Draft
    if (invoice.status === 'Draft') {
      return {
        type: 'draft',
        icon: FileText,
        label: 'Draft',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800/20',
        borderColor: 'border-gray-200 dark:border-gray-700',
        date: invoice.created,
        dateLabel: 'Created'
      };
    }
    
    // Void
    if (invoice.status === 'Void') {
      return {
        type: 'void',
        icon: XCircle,
        label: 'Void',
        color: 'text-gray-500 dark:text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-800/20',
        borderColor: 'border-gray-300 dark:border-gray-700',
        date: invoice.created,
        dateLabel: 'Created'
      };
    }
    
    // Default - use due date
    return {
      type: 'default',
      icon: Clock,
      label: 'Pending',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800/20',
      borderColor: 'border-gray-200 dark:border-gray-700',
      date: invoice.dueDate,
      dateLabel: 'Due Date'
    };
  };

  const visualStatus = getVisualStatus();

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResend = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Resend invoice:', invoice.id);
    // TODO: Implement resend functionality
  };

  const handleVoid = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Void invoice:', invoice.id);
    // TODO: Implement void functionality
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete invoice:', invoice.id);
    // TODO: Implement delete functionality
  };

  const handleEditInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/billing/invoice/${invoice.id}/edit`);
  };

  const handleMarkAsPaidWithMethod = (e: React.MouseEvent, method: PaymentMethod) => {
    e.stopPropagation();
    console.log(`Marking invoice ${invoice.id} as paid via ${method}`);
    // TODO: Implement actual payment marking
  };

  return (
    <div 
      className="perspective-card cursor-pointer"
      onClick={handleCardClick}
      style={{
        perspective: '1000px',
        minHeight: '320px',
        height: isLineItemsExpanded ? 'auto' : '320px',
        transition: 'height 0.3s ease-out, z-index 0s',
        position: 'relative',
        zIndex: (isFlipped || isLineItemsExpanded) ? 50 : 1
      }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT SIDE - NORMAL */}
        <Card className={cn(
          "absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 hover:shadow-lg hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-200 flex flex-col backface-hidden",
          invoice.status === 'Void' && "opacity-60 grayscale-[30%]"
        )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          {/* Void Overlay - Large X covering entire card */}
          {invoice.status === 'Void' && (
            <div className="absolute z-50 pointer-events-none" style={{ top: '40px', left: 0, right: 0, bottom: 0 }}>
              <svg 
                className="w-full h-full" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                style={{ opacity: 0.12 }}
              >
                <defs>
                  {/* Gradient for first diagonal line (top-left to bottom-right) */}
                  <linearGradient id="diagonalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4B5563', stopOpacity: 0 }} />
                    <stop offset="35%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
                    <stop offset="65%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4B5563', stopOpacity: 0 }} />
                  </linearGradient>
                  
                  {/* Gradient for second diagonal line (top-right to bottom-left) */}
                  <linearGradient id="diagonalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4B5563', stopOpacity: 0 }} />
                    <stop offset="35%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
                    <stop offset="65%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4B5563', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* First diagonal line - top-left corner to bottom-right corner */}
                <line 
                  x1="5" 
                  y1="5" 
                  x2="95" 
                  y2="95" 
                  stroke="url(#diagonalGrad1)" 
                  strokeWidth="0.4" 
                  strokeLinecap="round"
                />
                
                {/* Second diagonal line - top-right corner to bottom-left corner */}
                <line 
                  x1="95" 
                  y1="5" 
                  x2="5" 
                  y2="95" 
                  stroke="url(#diagonalGrad2)" 
                  strokeWidth="0.4" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          
          {/* Top Bar with Status */}
          <div className={cn(
            "h-9 sm:h-10 border-b px-2 sm:px-3 flex items-center justify-between rounded-t-lg gap-2",
            invoice.status === 'Paid' 
              ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30"
              : invoice.status === 'Void'
              ? "bg-red-50 dark:bg-red-900/30 border-red-300/60 dark:border-red-800/50"
              : invoiceOverdue && invoice.status !== 'Void'
              ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30"
              : (() => {
                  // Check if due soon
                  if (invoice.dueDate && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft') {
                    const today = new Date();
                    const dueDate = new Date(invoice.dueDate);
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 0 && diffDays <= 7) {
                      return "bg-green-50/30 dark:bg-green-900/5 border-green-100/50 dark:border-green-800/20";
                    }
                  }
                  return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
                })()
          )}>
            {/* Left side - Status badges */}
            <div className="flex items-center gap-2">
              {/* Recently Paid - Match Signatures Exactly */}
              {invoice.status === 'Paid' && invoice.paidAt && (() => {
                const paidDate = new Date(invoice.paidAt);
                const today = new Date();
                const daysSincePaid = Math.floor((today.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
                const isRecent = daysSincePaid <= 7; // Recently paid if within 7 days
                
                return isRecent && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">RECENTLY PAID</span>
                  </div>
                );
              })()}
              
              {/* Paid (older than 7 days) */}
              {invoice.status === 'Paid' && invoice.paidAt && (() => {
                const paidDate = new Date(invoice.paidAt);
                const today = new Date();
                const daysSincePaid = Math.floor((today.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
                const isRecent = daysSincePaid <= 7;
                
                return !isRecent && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">PAID</span>
                  </div>
                );
              })()}
              
              {/* Overdue - Separate Category - AMBER like signatures */}
              {invoiceOverdue && invoice.status !== 'Paid' && invoice.status !== 'Void' && (() => {
                const today = new Date();
                const dueDate = new Date(invoice.dueDate);
                const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 tracking-wide">
                      <span className="uppercase">OVERDUE</span> ({diffDays}d)
                    </span>
                  </div>
                );
              })()}
              
              {/* Due Soon - Within 7 days - Subtle green with opacity */}
              {!invoiceOverdue && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && invoice.dueDate && (() => {
                const today = new Date();
                const dueDate = new Date(invoice.dueDate);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return diffDays > 0 && diffDays <= 7 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-green-600/70 dark:text-green-400/70" />
                    <span className="text-[10px] font-medium text-green-700/70 dark:text-green-300/70 tracking-wide">
                      <span className="uppercase">DUE SOON</span> ({diffDays}d)
                    </span>
                  </div>
                );
              })()}
              
              {/* Pending Payment - Regular pending (not overdue, not due soon, not draft) - GRAY */}
              {!invoiceOverdue && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && (invoice.status === 'Sent to Client' || invoice.status === 'Viewed') && (() => {
                // Check if it's NOT due soon
                if (invoice.dueDate) {
                  const today = new Date();
                  const dueDate = new Date(invoice.dueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  // Only show "Pending Payment" if NOT due soon (more than 7 days away) AND not overdue
                  return diffDays > 7 && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">PENDING PAYMENT</span>
                    </div>
                  );
                }
                // If no due date, show pending payment (not overdue by definition)
                return (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">PENDING PAYMENT</span>
                  </div>
                );
              })()}
              
              {/* Draft - GRAY */}
              {invoice.status === 'Draft' && (
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">DRAFT</span>
                </div>
              )}
              
              {/* Void - GRAY */}
              {invoice.status === 'Void' && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">VOID</span>
                </div>
              )}
            </div>
            
            {/* Right side - Client Name, Year Badge, Mark Paid and Resend */}
            <div className="flex items-center gap-2">
              {/* Year Badge and Sent Date */}
              <div className="flex items-center gap-1.5">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[9px] px-1.5 py-0.5 rounded">
                  {invoice.year}
                </div>
                {/* Sent Date - Match Signatures */}
                {invoice.sentOn && invoice.status !== 'Draft' && (
                  <div className="text-[9px] text-gray-600 dark:text-gray-400">
                    Sent: {(() => {
                      const date = new Date(invoice.sentOn);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    })()}
                  </div>
                )}
              </div>
              
              {/* Resend Button - for sent/viewed/overdue invoices */}
              {invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && (
                <button
                  onClick={handleResend}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Resend Invoice"
                >
                  <MailPlus className={cn(
                    "w-3.5 h-3.5",
                    invoiceOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                  )} />
                </button>
              )}
            </div>
          </div>

          {/* Card Header - Compact */}
          <div className="px-2 sm:px-3 pt-2 pb-2 relative">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Icon - Larger */}
                <div 
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    invoice.clientType === 'Business' 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-green-100 dark:bg-green-900/30"
                  )}
                >
                  {invoice.clientType === 'Business' ? (
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                
                {/* Client Name & Invoice Number */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
                      {invoice.client}
                    </h3>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {invoice.invoiceNo}
                  </p>
                </div>
              </div>
              
              {/* Amount Badge and Edit Button */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 -mt-1">
                <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-white whitespace-nowrap" style={{ backgroundColor: 'var(--primaryColor)' }}>
                  {formatCurrency(invoice.amountDue)}
                </div>
                
                {/* Edit Button - for editable invoices (not paid, not void) */}
                {invoice.status !== 'Paid' && invoice.status !== 'Void' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/billing/edit-invoice/${invoice.id}`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit Invoice"
                  >
                    <Edit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* BIG NOT VIEWED INDICATOR - Absolute positioned in white space */}
            {!invoice.viewedAt && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && (() => {
              // Check if overdue or due soon
              const isOverdueOrDueSoon = invoiceOverdue || (() => {
                if (invoice.dueDate) {
                  const today = new Date();
                  const dueDate = new Date(invoice.dueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays > 0 && diffDays <= 7;
                }
                return false;
              })();
              
              return isOverdueOrDueSoon && (
                <div className="absolute left-[54%] -translate-x-1/2 top-[-2px] flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-medium uppercase tracking-[0.28em] text-gray-200/75 dark:text-gray-700/55">
                      NOT
                    </div>
                    <div className="text-xl font-medium uppercase tracking-[0.28em] text-gray-200/75 dark:text-gray-700/55 -mt-0.5">
                      VIEWED
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-2 sm:px-3 pb-0 flex gap-2 sm:gap-3">
            {/* Left/Middle Column - Large Gray Data Box - NOW VISUAL */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {/* Visual Status Box - Balanced: Informative but Calm */}
              <div className={cn(
                "flex-1 rounded-lg border p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 md:gap-4",
                invoice.status === 'Void' 
                  ? "border-gray-300/50 dark:border-gray-700/50 bg-gray-100/40 dark:bg-gray-800/10 opacity-50"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
              )}>
                {/* Left: Line Items Count */}
                <div className="flex-shrink-0 text-center min-w-[40px] sm:min-w-[50px]">
                  <div className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5 sm:mb-1 uppercase tracking-wide">Items</div>
                  <div className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    {invoice.lineItemsCount}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-10 sm:h-12 md:h-14 bg-gray-200 dark:bg-gray-700"></div>

                {/* Center: Key Dates - Show both Paid and Due for paid invoices */}
                <div className="flex-1 text-center relative min-w-0">
                  {invoice.status === 'Paid' && invoice.paidAt ? (
                    // For paid invoices, show both Paid and Due dates - ALIGNED
                    <div className="space-y-0.5 sm:space-y-1 inline-block text-left">
                      <div className="text-[9px] sm:text-[10px] text-gray-700 dark:text-gray-300 leading-tight whitespace-nowrap">
                        <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[8px] sm:text-[9px] inline-block w-8 sm:w-9">Paid:</span>
                        <span className="font-medium">{formatDate(invoice.paidAt)}</span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-gray-700 dark:text-gray-300 leading-tight whitespace-nowrap">
                        <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[8px] sm:text-[9px] inline-block w-8 sm:w-9">Due:</span>
                        <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                      </div>
                    </div>
                  ) : (
                    // For unpaid invoices, show the label from visualStatus
                    <>
                      <div className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wide">
                        {visualStatus.dateLabel}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-700 dark:text-gray-300 leading-tight font-medium">
                        {formatDate(visualStatus.date)}
                      </div>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-14 bg-gray-200 dark:bg-gray-700"></div>

                {/* Right: Visual Status with Subtle Color */}
                <div className="flex-shrink-0 text-center min-w-[70px] sm:min-w-[80px] md:min-w-[90px]">
                  <div className="relative inline-block">
                    <visualStatus.icon className={cn(
                      "w-4 h-4 mb-1 mx-auto",
                      visualStatus.type === 'paid-on-time' ? 'text-green-500 dark:text-green-400' :
                      visualStatus.type === 'paid-late' ? 'text-green-500 dark:text-green-400' :
                      visualStatus.type === 'overdue' ? 'text-red-500 dark:text-red-400' :
                      visualStatus.type === 'due-soon' ? 'text-green-500 dark:text-green-400 opacity-70 animate-clock-tick' :
                      visualStatus.type === 'awaiting' ? 'text-gray-500 dark:text-gray-400' :
                      'text-gray-500 dark:text-gray-400'
                    )} />
                    {/* Subtle amber dot for paid-late - attention indicator */}
                    {visualStatus.type === 'paid-late' && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full" />
                    )}
                  </div>
                  <div className={cn(
                    "text-[10px] sm:text-[11px] font-medium leading-tight",
                    visualStatus.type === 'paid-on-time' ? 'text-green-600 dark:text-green-400' :
                    visualStatus.type === 'paid-late' ? 'text-green-600 dark:text-green-400' :
                    visualStatus.type === 'overdue' ? 'text-red-600 dark:text-red-400' :
                    visualStatus.type === 'due-soon' ? 'text-green-600 dark:text-green-400 opacity-70' :
                    visualStatus.type === 'awaiting' ? 'text-gray-600 dark:text-gray-400' :
                    'text-gray-600 dark:text-gray-400'
                  )}>
                    {visualStatus.label}
                  </div>
                  {/* Payment method for paid invoices */}
                  {invoice.status === 'Paid' && invoice.paidVia && (
                    <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium flex items-center justify-center gap-0.5">
                      {invoice.paidVia === 'Stripe' && <Zap className="w-2.5 h-2.5 text-purple-500 dark:text-purple-400" />}
                      <span>via {invoice.paidVia}</span>
                    </div>
                  )}
                  {/* Days info for late payments - muted below */}
                  {visualStatus.type === 'paid-late' && paidStatus && (
                    <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {paidStatus.text}
                    </div>
                  )}
                  {/* Mark Paid button for unpaid invoices - PROMINENT */}
                  {invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1 mt-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded-md text-[10px] transition-all border border-purple-200 dark:border-purple-800/30 w-full"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Mark Paid</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          Select Payment Method
                        </div>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'ACH')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          🏦 ACH
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Cash')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          💵 Cash
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Check')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          ✅ Check
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Credit Card')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          💳 Credit Card
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'PayPal')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          🅿️ PayPal
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Venmo')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          📱 Venmo
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Wire')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          🔗 Wire
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleMarkAsPaidWithMethod(e, 'Zelle')}
                          className="cursor-pointer py-2 px-3 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          💳 Zelle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            {timeline.length > 0 && (() => {
              // Calculate proportional positions based on timestamps
              const timestamps = timeline.map(e => e.timestamp || 0);
              const minTime = Math.min(...timestamps);
              const maxTime = Math.max(...timestamps);
              const timeRange = maxTime - minTime;
              
              // Minimum spacing between events (in percentage) to prevent overlap
              const MIN_SPACING = 25; // 25% minimum gap between events
              
              // Calculate initial percentage position for each event
              let eventsWithPositions = timeline.map((event, index) => {
                let topPercent = 0;
                if (timeRange > 0 && event.timestamp) {
                  topPercent = ((event.timestamp - minTime) / timeRange) * 100;
                } else {
                  // Fallback to equal spacing if all events at same time
                  topPercent = timeline.length > 1 ? (index / (timeline.length - 1)) * 100 : 50;
                }
                return { ...event, topPercent, originalPercent: topPercent };
              });
              
              // Enforce minimum spacing - adjust positions if needed
              if (eventsWithPositions.length > 1) {
                for (let i = 1; i < eventsWithPositions.length; i++) {
                  const prev = eventsWithPositions[i - 1];
                  const curr = eventsWithPositions[i];
                  
                  // If current event is too close to previous, push it down
                  if (curr.topPercent - prev.topPercent < MIN_SPACING) {
                    curr.topPercent = prev.topPercent + MIN_SPACING;
                  }
                }
                
                // If last event exceeds 100%, compress all events proportionally
                const lastEvent = eventsWithPositions[eventsWithPositions.length - 1];
                if (lastEvent.topPercent > 100) {
                  const scale = 100 / lastEvent.topPercent;
                  eventsWithPositions = eventsWithPositions.map(e => ({
                    ...e,
                    topPercent: e.topPercent * scale
                  }));
                }
              }
              
              return (
                <div className="w-16 xl:w-20 flex-shrink-0 flex flex-col py-2 -mr-4">
                  <div className="relative pl-1 flex-1">
                    {/* Vertical Timeline Line */}
                    <div 
                      className="absolute left-0 w-[1.5px] bg-gradient-to-b from-blue-400/15 via-purple-400/15 to-green-400/15 dark:from-blue-600/12 dark:via-purple-600/12 dark:to-green-600/12"
                      style={{
                        top: '-32px',
                        bottom: '-32px',
                        height: 'calc(100% + 64px)'
                      }}
                    />
                    
                    {/* Timeline Events - Positioned Proportionally with Minimum Spacing */}
                    <div className="absolute left-0 w-full" style={{ top: '-16px', bottom: '-16px', height: 'calc(100% + 32px)' }}>
                      <div className="relative h-full">
                        {eventsWithPositions.map((event, index) => {
                          const colorClasses = {
                            gray: 'bg-gray-400/60 dark:bg-gray-500/50',
                            blue: 'bg-blue-400/60 dark:bg-blue-500/50',
                            purple: 'bg-purple-400/60 dark:bg-purple-500/50',
                            green: 'bg-green-400/60 dark:bg-green-500/50'
                          };
                          
                          return (
                            <div 
                              key={`${event.label}-${index}`} 
                              className="absolute left-0 flex items-center gap-2"
                              style={{ 
                                top: `${event.topPercent}%`,
                                transform: 'translateY(-50%)'
                              }}
                            >
                              {/* Dot */}
                              <div 
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 flex-shrink-0",
                                  colorClasses[event.color as keyof typeof colorClasses]
                                )}
                                style={{ marginLeft: '-0.3125rem' }}
                              />
                              
                              {/* Event details */}
                              <div>
                                <div className="text-[9px] font-medium text-gray-600/70 dark:text-gray-400/70 leading-tight whitespace-nowrap">{event.label}</div>
                                <div className="text-[8px] text-gray-500/60 dark:text-gray-500/50 leading-tight whitespace-nowrap">{formatDate(event.date)}</div>
                                <div className="text-[8px] text-gray-500/60 dark:text-gray-600/50 leading-tight whitespace-nowrap">
                                  {event.time}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Action Button Row - Always Visible */}
          <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-2 flex gap-1.5 sm:gap-2 bg-white dark:bg-gray-900 rounded-b-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View invoice:', invoice.id);
              }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Download invoice:', invoice.id);
              }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </Card>

        {/* BACK SIDE - EXPANDED */}
        <Card className="absolute inset-0 p-0 border-gray-200/60 dark:border-gray-700 shadow-xl flex flex-col backface-hidden bg-white dark:bg-gray-900"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Top Bar with Status - MATCH FRONT */}
          <div className={cn(
            "h-10 border-b px-3 flex items-center justify-between rounded-t-lg flex-shrink-0",
            invoice.status === 'Paid' 
              ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30"
              : invoice.status === 'Void'
              ? "bg-red-50 dark:bg-red-900/30 border-red-300/60 dark:border-red-800/50"
              : invoiceOverdue && invoice.status !== 'Void'
              ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30"
              : (() => {
                  // Check if due soon
                  if (invoice.dueDate && invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft') {
                    const today = new Date();
                    const dueDate = new Date(invoice.dueDate);
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 0 && diffDays <= 7) {
                      return "bg-green-50/30 dark:bg-green-900/5 border-green-100/50 dark:border-green-800/20";
                    }
                  }
                  return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
                })()
          )}>
            {/* Left side - Details label */}
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                Details
              </span>
            </div>
            
            {/* Right side - Year Badge and Sent Date - MATCH FRONT */}
            <div className="flex items-center gap-2">
              {/* Year Badge and Sent Date */}
              <div className="flex items-center gap-1.5">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 text-[9px] px-1.5 py-0.5 rounded">
                  {invoice.year}
                </div>
                {/* Sent Date - Match Front */}
                {invoice.sentOn && invoice.status !== 'Draft' && (
                  <div className="text-[9px] text-gray-600 dark:text-gray-400">
                    Sent: {(() => {
                      const date = new Date(invoice.sentOn);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    })()}
                  </div>
                )}
              </div>
              
              {/* Resend Button - for sent/viewed/overdue invoices - MATCH FRONT */}
              {invoice.status !== 'Paid' && invoice.status !== 'Void' && invoice.status !== 'Draft' && (
                <button
                  onClick={handleResend}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Resend Invoice"
                >
                  <MailPlus className={cn(
                    "w-3.5 h-3.5",
                    invoiceOverdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                  )} />
                </button>
              )}
            </div>
          </div>

          {/* Card Header - Fixed Size */}
          <div className="px-3 pt-2 pb-2 relative flex-shrink-0">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Icon - EXACT MATCH FRONT */}
                <div 
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    invoice.clientType === 'Business' 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-green-100 dark:bg-green-900/30"
                  )}
                >
                  {invoice.clientType === 'Business' ? (
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                
                {/* Client Name & Invoice Number - EXACT MATCH FRONT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {invoice.client}
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {invoice.invoiceNo}
                  </p>
                </div>
              </div>
              
              {/* Amount Badge and Edit Button - MATCH FRONT */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                  {formatCurrency(invoice.amountDue)}
                </div>
                
                {/* Edit Button - for editable invoices (not paid, not void) - MATCH FRONT */}
                {invoice.status !== 'Paid' && invoice.status !== 'Void' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/billing/edit-invoice/${invoice.id}`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit Invoice"
                  >
                    <Edit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Back Content - No scroll */}
          <div className="p-3 flex-1 bg-white dark:bg-gray-900">
            {/* Line Items Section */}
            {invoice.lineItems && invoice.lineItems.length > 0 && (() => {
              // Show expanded or first 3 items
              const displayedItems = isLineItemsExpanded ? invoice.lineItems : invoice.lineItems.slice(0, 3);
              
              return (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Included Items ({invoice.lineItems.length}):
                  </p>
                  <div className="space-y-1">
                    {displayedItems.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                            {item.description && (
                              <span className="text-gray-500 dark:text-gray-500 text-[10px] truncate block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    {invoice.lineItems.length > 3 && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLineItemsExpanded(!isLineItemsExpanded);
                        }}
                        className="flex items-center gap-2 pt-0.5 text-xs cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        {!isLineItemsExpanded ? (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }}></div>
                            </div>
                            <span className="font-medium" style={{ color: 'var(--primaryColor)' }}>
                              + {invoice.lineItems.length - 3} more item{invoice.lineItems.length - 3 > 1 ? 's' : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                            <span className="font-medium" style={{ color: 'var(--primaryColor)' }}>
                              Show less
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Back Action Buttons */}
          <div className="px-3 pb-3 pt-1 flex gap-2 bg-white dark:bg-gray-900 rounded-b-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View invoice:', invoice.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Download invoice:', invoice.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Back</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}