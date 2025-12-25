import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Clock,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Repeat
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { cn } from '../ui/utils';
import { ClientNameWithLink } from '../ClientNameWithLink';
import { generateMockSubscriptions, generateMockInvoices } from '../../utils/mockAgingData';
import { calculateAgingSummary } from '../../utils/agingCalculations';
import type { AgingBucket } from '../../types/billing';

type DateRangeFilter = 'all-time' | 'ytd' | 'this-month' | 'last-month' | 'this-year' | 'last-year' | 'custom';

export function BillingReportsView() {
  // Get aging data from both subscriptions and invoices
  const agingSubscriptions = generateMockSubscriptions();
  const agingInvoices = generateMockInvoices();
  const agingSummary = calculateAgingSummary(agingSubscriptions, agingInvoices);

  const [dateRange, setDateRange] = useState<DateRangeFilter>('all-time');
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set(['1-30', '31-60', '61-90', '90+']));
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const toggleBucket = (bucket: string) => {
    const newExpanded = new Set(expandedBuckets);
    if (newExpanded.has(bucket)) {
      newExpanded.delete(bucket);
    } else {
      newExpanded.add(bucket);
    }
    setExpandedBuckets(newExpanded);
  };

  // Calculate revenue metrics
  const calculateRevenueMetrics = () => {
    // Calculate total revenue from paid invoices
    const paidInvoices = agingInvoices.filter(inv => inv.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    
    // Calculate monthly revenue (mock: last 30 days)
    const monthlyRevenue = totalRevenue * 0.15; // Mock: ~15% of total is this month
    const previousMonthRevenue = totalRevenue * 0.12; // Mock: previous month was slightly less
    const monthlyGrowth = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    
    // Calculate yearly revenue
    const currentYear = new Date().getFullYear();
    const yearlyRevenue = totalRevenue * 0.65; // Mock: ~65% of total is this year
    const previousYearRevenue = totalRevenue * 0.35; // Mock: remaining is previous years
    const yearlyGrowth = ((yearlyRevenue - previousYearRevenue) / previousYearRevenue) * 100;
    
    // Outstanding revenue (all overdue amounts)
    const outstandingRevenue = agingSummary.totalOverdue;
    
    // Accounts receivable (all unpaid invoices + overdue subscriptions)
    const accountsReceivable = agingSummary.totalAccountsReceivable;
    
    return {
      totalRevenue,
      monthlyRevenue,
      monthlyGrowth,
      previousMonthRevenue,
      yearlyRevenue,
      yearlyGrowth,
      previousYearRevenue,
      outstandingRevenue,
      accountsReceivable,
    };
  };

  const metrics = calculateRevenueMetrics();

  // Revenue stat cards configuration
  const revenueCards = [
    {
      id: 'total',
      label: 'Total Revenue',
      value: metrics.totalRevenue,
      subtext: 'All-time collected',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'var(--primaryColor)',
      bgColor: 'rgba(124, 58, 237, 0.1)',
      showGrowth: false,
    },
    {
      id: 'monthly',
      label: 'Monthly Revenue',
      value: metrics.monthlyRevenue,
      subtext: `Prev: ${formatCurrency(metrics.previousMonthRevenue)}`,
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      color: 'blue',
      bgColor: 'rgb(239, 246, 255)',
      growth: metrics.monthlyGrowth,
      showGrowth: true,
    },
    {
      id: 'yearly',
      label: 'Yearly Revenue (YTD)',
      value: metrics.yearlyRevenue,
      subtext: `Prev Year: ${formatCurrency(metrics.previousYearRevenue)}`,
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      color: 'green',
      bgColor: 'rgb(240, 253, 244)',
      growth: metrics.yearlyGrowth,
      showGrowth: true,
    },
    {
      id: 'outstanding',
      label: 'Outstanding Revenue',
      value: metrics.outstandingRevenue,
      subtext: `AR: ${formatCurrency(metrics.accountsReceivable)}`,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      color: 'orange',
      bgColor: 'rgb(255, 247, 237)',
      showGrowth: false,
    },
  ];

  // Group customers by aging bucket
  const getCustomersByBucket = (bucket: AgingBucket) => {
    const customerMap = new Map<string, {
      clientId: string;
      clientName: string;
      clientType: 'Business' | 'Individual';
      items: Array<{
        type: 'invoice' | 'subscription';
        id: string;
        number: string;
        amount: number;
        daysOverdue: number;
        lastPaymentDate?: string;
        nextRetryDate?: string;
        email?: string;
        phone?: string;
      }>;
      totalAmount: number;
    }>();

    // Add subscriptions
    agingSubscriptions
      .filter(sub => sub.agingBucket === bucket)
      .forEach(sub => {
        const key = sub.clientId;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            clientId: sub.clientId,
            clientName: sub.client,
            clientType: sub.clientType,
            items: [],
            totalAmount: 0,
          });
        }
        const customer = customerMap.get(key)!;
        customer.items.push({
          type: 'subscription',
          id: sub.id,
          number: sub.planName,
          amount: sub.overdueAmount || sub.amount,
          daysOverdue: sub.daysOverdue,
          lastPaymentDate: sub.lastSuccessfulPayment || undefined,
          nextRetryDate: sub.nextRetryDate || undefined,
          email: sub.customerEmail || undefined,
          phone: sub.customerPhone || undefined,
        });
        customer.totalAmount += (sub.overdueAmount || sub.amount);
      });

    // Add invoices
    agingInvoices
      .filter(inv => inv.agingBucket === bucket)
      .forEach(inv => {
        const key = inv.clientId;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            clientId: inv.clientId,
            clientName: inv.client,
            clientType: inv.clientType,
            items: [],
            totalAmount: 0,
          });
        }
        const customer = customerMap.get(key)!;
        customer.items.push({
          type: 'invoice',
          id: inv.id,
          number: inv.invoiceNo,
          amount: inv.amountDue,
          daysOverdue: inv.daysOverdue,
          lastPaymentDate: inv.paidAt,
        });
        customer.totalAmount += inv.amountDue;
      });

    // Convert to array and sort by total amount descending
    return Array.from(customerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Aging bucket configurations
  const agingBuckets = [
    {
      id: 'current',
      bucket: 'Current' as AgingBucket,
      label: 'Current',
      count: agingSummary.current.count,
      amount: agingSummary.current.amount,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bgColor: 'rgb(240, 253, 244)',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700',
    },
    {
      id: '1-30',
      bucket: '1-30' as AgingBucket,
      label: '1-30 Days Overdue',
      count: agingSummary.bucket_1_30.count,
      amount: agingSummary.bucket_1_30.amount,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bgColor: 'rgb(254, 252, 232)',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
    },
    {
      id: '31-60',
      bucket: '31-60' as AgingBucket,
      label: '31-60 Days Overdue',
      count: agingSummary.bucket_31_60.count,
      amount: agingSummary.bucket_31_60.amount,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      bgColor: 'rgb(255, 247, 237)',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-700',
    },
    {
      id: '61-90',
      bucket: '61-90' as AgingBucket,
      label: '61-90 Days Overdue',
      count: agingSummary.bucket_61_90.count,
      amount: agingSummary.bucket_61_90.amount,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bgColor: 'rgb(254, 242, 242)',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700',
    },
    {
      id: '90+',
      bucket: '90+' as AgingBucket,
      label: '90+ Days Overdue',
      count: agingSummary.bucket_90_plus.count,
      amount: agingSummary.bucket_90_plus.amount,
      icon: <XCircle className="w-5 h-5 text-red-800" />,
      bgColor: 'rgb(248, 113, 113, 0.1)',
      textColor: 'text-red-800 dark:text-red-200',
      borderColor: 'border-red-300 dark:border-red-600',
    },
  ];

  return (
    <div className="h-full bg-gray-50/50 dark:bg-gray-900/50 flex flex-col">
      {/* Fixed Header */}
      <div 
        className="sticky top-0 z-10 backdrop-blur-xl border-b shadow-sm px-8 py-6"
        style={{
          background: 'var(--bgColorMain, #ffffff)',
          borderColor: 'var(--stokeColor, #e5e7eb)',
        }}
      >
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">
              Billing Reports
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive revenue and aging analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeFilter)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="flex items-center gap-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button size="sm">Apply</Button>
          </div>
        )}
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Revenue Metrics Section */}
        <div className="mb-8">
          <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-4 gap-4">
            {revenueCards.map((card) => (
              <Card
                key={card.id}
                className="p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                style={{ backgroundColor: card.bgColor }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                      {card.label}
                    </p>
                    <p className="text-2xl text-gray-900 dark:text-gray-100">
                      {formatCurrency(card.value)}
                    </p>
                  </div>
                  <div>{card.icon}</div>
                </div>
                <div className="flex items-center gap-2">
                  {card.showGrowth && card.growth !== undefined ? (
                    <div className="flex items-center gap-1">
                      {card.growth >= 0 ? (
                        <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-xs ${card.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {Math.abs(card.growth).toFixed(1)}%
                      </span>
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtext}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Aging Summary Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg text-gray-900 dark:text-gray-100">Aging Summary</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Overdue: {formatCurrency(agingSummary.totalOverdue)} 
                <span className="mx-2">•</span>
                {agingSummary.bucket_1_30.count + agingSummary.bucket_31_60.count + agingSummary.bucket_61_90.count + agingSummary.bucket_90_plus.count} items
              </p>
            </div>
          </div>

          {/* Aging Buckets Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {agingBuckets.map((bucket) => (
              <Card
                key={bucket.id}
                className={`p-4 border ${bucket.borderColor} hover:shadow-md transition-all cursor-pointer`}
                style={{ backgroundColor: bucket.bgColor }}
                onClick={() => bucket.count > 0 && toggleBucket(bucket.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                      {bucket.label}
                    </p>
                    <p className={`text-2xl ${bucket.textColor}`}>
                      {formatCurrency(bucket.amount)}
                    </p>
                  </div>
                  <div>{bucket.icon}</div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${bucket.textColor} ${bucket.borderColor} text-xs`}>
                    {bucket.count} {bucket.count === 1 ? 'item' : 'items'}
                  </Badge>
                  {bucket.count > 0 && (
                    expandedBuckets.has(bucket.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Customer Breakdown by Bucket */}
          <div className="space-y-6">
            {agingBuckets.map((bucket) => {
              if (bucket.count === 0) return null;
              
              const customers = getCustomersByBucket(bucket.bucket);
              const isExpanded = expandedBuckets.has(bucket.id);

              return (
                <Collapsible key={bucket.id} open={isExpanded} onOpenChange={() => toggleBucket(bucket.id)}>
                  <CollapsibleContent>
                    <Card className="p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        {bucket.icon}
                        <h3 className={`text-lg ${bucket.textColor}`}>
                          {bucket.label} - Customer Details
                        </h3>
                        <Badge variant="outline" className="ml-auto">
                          {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {customers.map((customer) => (
                          <div
                            key={customer.clientId}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            {/* Customer Header */}
                            <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <ClientNameWithLink
                                    clientId={customer.clientId}
                                    clientName={customer.clientName}
                                    clientType={customer.clientType}
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {customer.clientType}
                                  </Badge>
                                </div>
                                {customer.items[0]?.email && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Mail className="w-3 h-3" />
                                    {customer.items[0].email}
                                  </div>
                                )}
                                {customer.items[0]?.phone && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {customer.items[0].phone}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Owed</p>
                                <p className={`text-xl ${bucket.textColor}`}>
                                  {formatCurrency(customer.totalAmount)}
                                </p>
                              </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-2">
                              {customer.items.map((item, index) => (
                                <div
                                  key={`${item.type}-${item.id}`}
                                  className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {item.type === 'invoice' ? (
                                      <FileText className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <Repeat className="w-4 h-4 text-purple-600" />
                                    )}
                                    <div>
                                      <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {item.type === 'invoice' ? `Invoice ${item.number}` : item.number}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{item.daysOverdue} days overdue</span>
                                        {item.lastPaymentDate && (
                                          <>
                                            <span>•</span>
                                            <span>Last paid: {new Date(item.lastPaymentDate).toLocaleDateString()}</span>
                                          </>
                                        )}
                                        {item.nextRetryDate && (
                                          <>
                                            <span>•</span>
                                            <span className="text-yellow-600 dark:text-yellow-400">
                                              Next retry: {new Date(item.nextRetryDate).toLocaleDateString()}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 min-w-[100px] text-right">
                                      {formatCurrency(item.amount)}
                                    </p>
                                    <Button size="sm" variant="ghost">
                                      View
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        {/* Payment Strategy Information */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg text-gray-900 dark:text-gray-100">Payment Retry Strategy</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Retries</p>
              <p className="text-2xl text-gray-900 dark:text-gray-100">
                {agingSubscriptions.filter(sub => sub.paymentStatus === 'In Dunning').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatic payment retry in progress</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Past Due Reminders</p>
              <p className="text-2xl text-gray-900 dark:text-gray-100">
                {agingSubscriptions.filter(sub => sub.paymentStatus === 'Past Due').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email reminders being sent</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Failed Payments</p>
              <p className="text-2xl text-gray-900 dark:text-gray-100">
                {agingSubscriptions.filter(sub => sub.paymentStatus === 'Payment Failed').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requires manual intervention</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
