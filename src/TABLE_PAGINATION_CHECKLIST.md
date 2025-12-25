# Table Pagination Checklist

## ✅ Pagination Standard

All pages with tables need pagination controls at the bottom with:
- **Left Side**: "Showing X to Y of Z results" + Items per page selector (10/25/50/100)
- **Right Side**: Navigation buttons (First | Previous | [Page Numbers] | Next | Last)

## 🎯 Reusable Components Available

### **TablePagination** (`/components/TablePagination.tsx`)
Full-featured pagination for use at the bottom of tables (outside Card borders).

**Usage:**
```tsx
import { TablePagination } from '../components/TablePagination';

// In your component:
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [totalCount, setTotalCount] = useState(0);

// Below your table:
<TablePagination
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
  itemsPerPageOptions={[10, 25, 50, 100]} // Optional, defaults to [10, 25, 50, 100]
/>
```

### **TablePaginationCompact** (`/components/TablePaginationCompact.tsx`)
Compact pagination for use inside Card borders (e.g., Split Views).

**Usage:**
```tsx
import { TablePaginationCompact } from '../components/TablePaginationCompact';

// In your component:
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(totalCount / itemsPerPage);

// Inside your Card, at the bottom:
<TablePaginationCompact
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

## 📋 Pages with Tables - Status

### ✅ Completed
- [x] **SignaturesView.tsx** - Single view with full pagination at bottom
- [x] **SignaturesViewSplit.tsx** - Split view with compact pagination in each card

### 🔍 To Review & Update

#### Client Management
- [ ] **ClientManagementView.tsx** - Main client list table
- [ ] **ClientList.tsx** - Client listing component

#### Client Folder Tabs
- [ ] **folder-tabs/ActivityTab.tsx** - Activity log table
- [ ] **folder-tabs/CommunicationTab.tsx** - Communication history
- [ ] **folder-tabs/DocumentsTab.tsx** - Documents table
- [ ] **folder-tabs/FilesTab.tsx** - Files listing
- [ ] **folder-tabs/InvoicesTab.tsx** - Invoices table
- [ ] **folder-tabs/NotesTab.tsx** - Notes listing
- [ ] **folder-tabs/OrganizersTab.tsx** - Organizers table
- [ ] **folder-tabs/ProjectsTab.tsx** - Projects table
- [ ] **folder-tabs/TeamsTab.tsx** - Team members table

#### Team Member Tabs
- [ ] **team-member-tabs/ActivityTab.tsx** - Team member activity
- [ ] **team-member-tabs/CommunicationTab.tsx** - Team communication
- [ ] **team-member-tabs/DocumentsTab.tsx** - Team documents

#### Company Settings Tabs
- [ ] **company-settings-tabs/TeamTab.tsx** - Team members list
- [ ] **company-settings-tabs/RolesTab.tsx** - Roles and permissions table

#### Other Views
- [ ] **Form8879View.tsx** - Form 8879 listing
- [ ] **Form8879VerifyRecipientsView.tsx** - Recipients table
- [ ] **SignatureTemplatesView.tsx** - Templates listing
- [ ] **IncomingDocumentsView.tsx** - Documents inbox
- [ ] **CalendarView.tsx** - Events list view (if applicable)
- [ ] **BillingView.tsx** - Billing/invoice tables
- [ ] **NotificationsView.tsx** - Notifications list
- [ ] **MeetingAnalytics.tsx** - Analytics tables

## 📝 Required State Variables

```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [totalCount, setTotalCount] = useState(0);
```

## ⚙️ Server-Side Pagination Pattern

When implementing API calls:

```tsx
const fetchData = async () => {
  const skipCount = (currentPage - 1) * itemsPerPage;
  const response = await apiService.getData({
    skipCount,
    maxResultCount: itemsPerPage,
    // ... other filters
  });
  setTotalCount(response.totalCount);
  setItems(response.items);
};

// Re-fetch when page or items per page changes
useEffect(() => {
  fetchData();
}, [currentPage, itemsPerPage]);
```

## 🎯 Reset Page on Filter Changes

Always reset to page 1 when filters change:

```tsx
const handleFilterChange = (filter) => {
  setFilter(filter);
  setCurrentPage(1); // ← Important!
};

const handleSearchChange = (query) => {
  setSearchQuery(query);
  setCurrentPage(1); // ← Important!
};
```

Note: When using `TablePagination`, the component automatically resets to page 1 when `itemsPerPage` changes via `onItemsPerPageChange`.

## 📐 Positioning

- **Position**: Below the table, outside the Card border
- **Margin**: `mt-4` spacing from table
- **Layout**: Full-width flex with space-between
- **Visibility**: Only show when `totalPages > 1`

## 🎨 Alternative: Compact Pagination (for cards)

For use inside Card borders (like Split View):

```tsx
<div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
  <span className="text-xs text-gray-500 dark:text-gray-400">
    Page {currentPage} of {totalPages}
  </span>
  <div className="flex items-center gap-1">
    {/* Same navigation buttons as above, but size="sm" and h-7 w-7 */}
  </div>
</div>
```

## 📋 Implementation Priority

1. **High Priority** - Pages with frequent use:
   - ClientManagementView
   - Form8879View
   - SignatureTemplatesView
   - IncomingDocumentsView

2. **Medium Priority** - Folder tabs:
   - DocumentsTab
   - FilesTab
   - InvoicesTab
   - ActivityTab

3. **Low Priority** - Less frequently accessed:
   - Team member tabs
   - Analytics tables
   - Settings tables

## ✅ Quality Checklist per Page

Before marking a page as complete:
- [ ] Pagination controls at bottom of table
- [ ] Items per page selector present (10/25/50/100)
- [ ] Default is 25 items per page
- [ ] Navigation buttons work correctly
- [ ] Current page button uses `var(--primaryColor)`
- [ ] First/Previous disabled on page 1
- [ ] Next/Last disabled on last page
- [ ] Page resets to 1 when filters change
- [ ] Page resets to 1 when items per page changes
- [ ] Pagination hidden when only 1 page
- [ ] "Showing X to Y of Z" text displays correctly
- [ ] Server-side pagination implemented (if applicable)
- [ ] Dark mode styling works correctly
- [ ] Responsive on mobile devices

## 🚀 Next Steps

1. Review each file in the "To Review & Update" list
2. Identify which ones have tables
3. Check if they currently have pagination
4. Implement standard pagination pattern
5. Test functionality
6. Mark as complete

---

**Last Updated**: Current session
**Status**: 2 of ~25+ pages completed