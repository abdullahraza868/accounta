# Billing Split View Update Plan

## Critical Understanding
**The entire top section (stat cards, filters, toolbar, buttons, Invoices/Subscriptions switcher) must be IDENTICAL in both single and split views. Only the table section differs - single has 1 table, split has 2 tables.**

---

## Step 1: Copy Complete Top Section from BillingView.tsx

### What to Copy (Lines 1-950 approximately)
1. **All imports** - especially add missing ones:
   ```tsx
   import { Sparkles, MailPlus, Settings, XCircle, CreditCard, Zap, Edit } from 'lucide-react';
   import { DateDisplayWithTooltip } from '../DateDisplayWithTooltip';
   import { BulkSendInvoicesDialog } from '../BulkSendInvoicesDialog';
   import { BillingSettingsDialog } from '../BillingSettingsDialog';
   import { TablePagination } from '../TablePagination';
   import { useAppSettings } from '../../contexts/AppSettingsContext';
   import {
     Tooltip,
     TooltipContent,
     TooltipProvider,
     TooltipTrigger,
   } from '../ui/tooltip';
   ```

2. **Updated Type Definitions**:
   ```tsx
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
   ```

3. **Complete Invoice Data Array** - Use the EXACT same invoice data from single view (19 invoices including Phoenix, Nexus, Cascade)

4. **Complete DraggableStatCard Component** - Exact copy from single view

5. **Main Component Start**:
   ```tsx
   export function BillingViewSplit() {
     const navigate = useNavigate();
     const { formatDate } = useAppSettings(); // CRITICAL - add this
     
     // Check if user prefers single view and redirect
     useEffect(() => {
       const preferredView = localStorage.getItem('billingViewPreference');
       if (preferredView === 'single') {
         navigate('/billing', { replace: true });
       }
     }, [navigate]);
   ```

6. **State Management** - Copy all state from single view, then ADD split-specific:
   ```tsx
   // ... all state from single view ...
   
   // SPLIT VIEW SPECIFIC - Add these:
   const [outstandingCurrentPage, setOutstandingCurrentPage] = useState(1);
   const [paidCurrentPage, setPaidCurrentPage] = useState(1);
   ```

7. **All Helper Functions** - Copy exact functions:
   - `isRecentlyCreated()`
   - `isRecentlyPaid()`
   - `isOverdueForSending()`
   - `formatCurrency()`
   - `getStatusBadge()`
   - `handleSaveThreshold()`
   - `handleBulkSendConfirm()`
   - `handleMarkAsPaid()`
   - `moveCard()`

8. **Stat Card Configs** - CRITICAL: Use the EXACT order from single view:
   ```tsx
   const statCardConfigs: StatCardConfig[] = [
     {
       id: 'paid',
       label: 'Paid',
       count: `${paidInvoices.length} invoices`,
       icon: <CheckCircle className="w-4.5 h-4.5 text-green-600" />,
       // ... exact copy from single view
     },
     {
       id: 'recent',
       label: 'Recently Paid',
       count: `${recentlyPaidInvoices.length} invoices • Last 7 days`,
       icon: <Sparkles className="w-4.5 h-4.5 text-emerald-600" />,
       // ... exact copy from single view
     },
     {
       id: 'unpaid',
       // ... exact copy
     },
     {
       id: 'overdue',
       // ... exact copy
     },
     {
       id: 'draft',
       label: 'Draft', // NOT "Draft/Sent"
       // ... exact copy
     }
   ];
   
   const [statCardOrder, setStatCardOrder] = useState<number[]>([0, 1, 2, 3, 4]);
   ```

9. **JSX Return - Header Section** - EXACT COPY:
   ```tsx
   return (
     <div className="flex flex-col h-full overflow-hidden">
       <div className="flex-1 overflow-y-auto p-6">
         {/* Header Section - EXACT COPY */}
         <div className="flex items-center justify-between mb-6">
           <div>
             <h2 className="text-gray-900 dark:text-gray-100">Billing</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
               {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
             </p>
           </div>
         </div>

         {/* Stats Cards - Draggable - EXACT COPY */}
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

         {/* Toolbar - EXACT COPY */}
         <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
           <div className="flex items-center gap-4 flex-1">
             {/* Search */}
             {/* Date Filter Buttons */}
             {/* Clear Filters */}
           </div>
           <div className="flex gap-2">
             {/* Add Invoice */}
             {/* Manage Templates */}
             {/* Bulk Send */}
             {/* Settings */}
           </div>
         </div>

         {/* Table Section Header - WITH INVOICES/SUBSCRIPTIONS CENTERED */}
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
             <h3 className="text-gray-900 dark:text-gray-100">Invoice List</h3>
             <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
               {filteredInvoices.length}
             </Badge>
           </div>
           
           {/* Centered Invoices/Subscriptions Switcher - EXACT COPY */}
           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5">
             <button
               onClick={() => setActiveTab('invoices')}
               className={cn(
                 "px-4 py-2 rounded text-sm transition-colors w-[120px]",
                 activeTab === 'invoices'
                   ? "text-white shadow-sm"
                   : "text-gray-600 dark:text-gray-400"
               )}
               style={activeTab === 'invoices' ? { backgroundColor: 'var(--primaryColor)' } : {}}
             >
               Invoices
             </button>
             <button
               onClick={() => setActiveTab('subscriptions')}
               className={cn(
                 "px-4 py-2 rounded text-sm transition-colors w-[120px]",
                 activeTab === 'subscriptions'
                   ? "text-white shadow-sm"
                   : "text-gray-600 dark:text-gray-400"
               )}
               style={activeTab === 'subscriptions' ? { backgroundColor: 'var(--primaryColor)' } : {}}
             >
               Subscriptions
             </button>
           </div>
           
           {/* View Toggle - EXACT COPY but swap active state */}
           <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
             <Button
               variant="ghost"
               size="sm"
               className={cn("gap-1.5 h-7 px-3 text-xs")}
               onClick={() => {
                 localStorage.setItem('billingViewPreference', 'single');
                 navigate('/billing');
               }}
             >
               <LayoutGrid className="w-3.5 h-3.5" />
               Single View
             </Button>
             <Button
               size="sm"
               className={cn("gap-1.5 h-7 px-3 text-xs text-white")}
               style={{ backgroundColor: 'var(--primaryColor)' }}
             >
               <LayoutGrid className="w-3.5 h-3.5" />
               Split View
             </Button>
           </div>
         </div>
   ```

---

## Step 2: Update the Two Tables Section (SPLIT VIEW SPECIFIC)

### Outstanding Table
1. **Add all column width classes** - `w-[XXXpx]` for every column
2. **Smart Created/Sent Display** - Use Pattern 1 from sync doc
3. **Smart Due/Paid with Tooltip** - Use Pattern 2 from sync doc
4. **Use `formatDate` from hook** instead of hardcoded formats
5. **Add Recently Paid sparkle icon** for paid dates within 7 days
6. **Add overdue badge logic** with `isOverdueForSending()`

### Paid Table
1. **Same updates as Outstanding table**
2. **Keep separate pagination** (`paidCurrentPage`)

---

## Step 3: Update Dialog Components at Bottom

```tsx
{/* Dialogs - EXACT COPY FROM SINGLE VIEW */}
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
  onClose={() => setShowSettingsDialog(false)}
  overdueSendThreshold={overdueSendThreshold}
  onSaveThreshold={handleSaveThreshold}
/>
```

---

## Critical Code Patterns for Both Tables

### Pattern 1: Smart Created/Sent (use in BOTH tables)
```tsx
{invoice.sentOn && invoice.created === invoice.sentOn ? (
  <div>
    <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Created & Sent</div>
    <DateDisplayWithTooltip date={invoice.created} time={invoice.createdTime} />
  </div>
) : (
  <div className="flex flex-col gap-1">
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Created</div>
      <DateDisplayWithTooltip date={invoice.created} time={invoice.createdTime} />
    </div>
    {invoice.sentOn && (
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Sent</div>
        <DateDisplayWithTooltip date={invoice.sentOn} time={invoice.sentTime} />
      </div>
    )}
  </div>
)}
```

### Pattern 2: Smart Due/Paid with Custom Tooltip (use in BOTH tables)
```tsx
<td className="px-4 py-4 w-[160px]">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          {(() => {
            const isPaid = invoice.paidAt !== undefined;
            const paidDate = invoice.paidAt ? new Date(invoice.paidAt) : null;
            const dueDate = new Date(invoice.dueDate);
            const paidBeforeOrOnDue = paidDate && paidDate <= dueDate;

            if (isPaid && paidBeforeOrOnDue) {
              return (
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Paid</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-900">{formatDate(invoice.paidAt!)}</span>
                    {isRecentlyPaid(invoice.paidAt) && (
                      <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-0.5" />
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex flex-col gap-1">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Due</div>
                    <span className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</span>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Paid</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900">{formatDate(invoice.paidAt)}</span>
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
            <div><strong>Paid date @</strong> {invoice.paidTime}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</td>
```

---

## Summary Checklist for Split View

- [ ] Copy all imports from single view
- [ ] Copy all type definitions from single view
- [ ] Copy complete invoice data array (19 invoices)
- [ ] Add `const { formatDate } = useAppSettings();`
- [ ] Copy complete stat card configs in correct order
- [ ] Copy complete header section JSX
- [ ] Copy complete toolbar section JSX
- [ ] Add Invoices/Subscriptions switcher (centered, equal width buttons)
- [ ] Update Outstanding table with smart date logic
- [ ] Update Paid table with smart date logic
- [ ] Add column width classes to both tables
- [ ] Copy dialog components
- [ ] Test both tables display correctly
- [ ] Test pagination works for both tables
- [ ] Test all filters work identically to single view

---

**PRINCIPLE: Top section = 100% identical. Only table section differs (1 table vs 2 tables).**
