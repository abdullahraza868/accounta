# Client Portal Quick Reference

## 🚀 Quick Start

### View the Client Portal
1. Navigate to: `/client-portal/login`
2. Enter any email/password (mock auth enabled)
3. Click "Sign In"
4. You'll be redirected to the client dashboard

### Add a New Page (5-Minute Guide)

**1. Create the file:**
```bash
/pages/client-portal/[section]/ClientPortal[Section].tsx
```

**2. Use this template:**
```tsx
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';

export default function ClientPortal[Section]() {
  const { primaryColor } = useBranding();

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        <h1>Page Title</h1>
        {/* Your content */}
      </div>
    </ClientPortalLayout>
  );
}
```

**3. Add the route in `/routes/AppRoutes.tsx`:**
```tsx
// Import at top
import ClientPortal[Section] from '../pages/client-portal/[section]/ClientPortal[Section]';

// Add route in Client Portal section
<Route
  path="/client-portal/[section]"
  element={
    <ProtectedRoute>
      <ClientPortal[Section] />
    </ProtectedRoute>
  }
/>
```

**Done!** Navigate to `/client-portal/[section]` to see your page.

## 📁 File Structure

```
/pages/client-portal/
  ├── login/
  │   └── ClientPortalLogin.tsx         ✅ DONE
  ├── dashboard/
  │   └── ClientPortalDashboard.tsx     ✅ DONE
  ├── documents/                         ⏭️ TODO
  ├── invoices/                          ⏭️ TODO
  ├── signatures/                        ⏭️ TODO
  ├── messages/                          ⏭️ TODO
  └── profile/                           ⏭️ TODO

/components/client-portal/
  └── ClientPortalLayout.tsx             ✅ DONE
```

## 🎯 Navigation Menu Items

The ClientPortalLayout includes these navigation items:

1. **Dashboard** → `/client-portal/dashboard` ✅
2. **Documents** → `/client-portal/documents` ⏭️
3. **Invoices** → `/client-portal/invoices` ⏭️
4. **Signatures** → `/client-portal/signatures` ⏭️
5. **Messages** → `/client-portal/messages` ⏭️
6. **Profile** → `/client-portal/profile` ⏭️

## 🛠️ Common Patterns

### Get Branding Colors
```tsx
import { useBranding } from '../../../contexts/BrandingContext';

const { primaryColor, logoUrl } = useBranding();
```

### Format Dates
```tsx
import { useAppSettings } from '../../../contexts/AppSettingsContext';

const { formatDate, formatDateTime } = useAppSettings();

// Usage
formatDate('2025-10-31')           // "10-31-2025"
formatDateTime('2025-10-31T14:30') // "10-31-2025" on line 1, "2:30 PM" on line 2
```

### Create a Table
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Add a Button
```tsx
import { Button } from '../../../components/ui/button';

<Button
  onClick={handleClick}
  className="text-white"
  style={{ backgroundColor: primaryColor }}
>
  Button Text
</Button>
```

### Create a Card
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-6">
  <h2 className="text-lg mb-4">Card Title</h2>
  {/* Card content */}
</div>
```

### Add an Icon
```tsx
import { FileText, Receipt, Edit } from 'lucide-react';

<FileText className="w-5 h-5" style={{ color: primaryColor }} />
```

## 🎨 Styling Standards

### Always Use:
- ✅ `primaryColor` from BrandingContext
- ✅ Tailwind utility classes
- ✅ Existing spacing system (space-y-6, gap-4, etc.)
- ✅ Semantic HTML (h1, h2, h3, p)

### Never Use:
- ❌ Hardcoded color values (no purple, no #7C3AED)
- ❌ Font size classes (text-2xl, text-lg) - uses globals.css
- ❌ Font weight classes (font-bold) - uses globals.css
- ❌ Line height classes (leading-none) - uses globals.css

### Responsive Grid
```tsx
{/* 1 column mobile, 2 tablet, 3 desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

## 📊 Mock Data Examples

### Documents
```tsx
const mockDocuments = [
  {
    id: '1',
    name: 'Tax Return 2024.pdf',
    type: 'Tax Return',
    date: '2025-10-30T14:30:00',
    size: '2.4 MB',
  },
  // ...
];
```

### Invoices
```tsx
const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-123',
    date: '2025-10-15',
    amount: 1500.00,
    status: 'pending',
    dueDate: '2025-11-15',
  },
  // ...
];
```

### Signatures
```tsx
const mockSignatures = [
  {
    id: '1',
    documentName: 'Form 8879',
    requestDate: '2025-10-28',
    status: 'pending',
    dueDate: '2025-11-05',
  },
  // ...
];
```

## 🔍 Testing Checklist

When building a new page:

- [ ] Page loads without errors
- [ ] Uses ClientPortalLayout wrapper
- [ ] Branding colors applied correctly
- [ ] Date formatting uses AppSettingsContext
- [ ] Mobile responsive (test on small viewport)
- [ ] Navigation works from header menu
- [ ] Mock data displays correctly
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Follows design system standards

## 🆘 Common Issues

### Issue: Colors not showing
**Fix**: Make sure you're using `primaryColor` from `useBranding()`
```tsx
const { primaryColor } = useBranding();
style={{ backgroundColor: primaryColor }}
```

### Issue: Dates showing wrong format
**Fix**: Use formatDate/formatDateTime from AppSettingsContext
```tsx
const { formatDate } = useAppSettings();
{formatDate(item.date)}
```

### Issue: Page not loading
**Fix**: Check that route is added in AppRoutes.tsx

### Issue: Not mobile responsive
**Fix**: Use responsive Tailwind classes (sm:, md:, lg:)

## 📖 Full Documentation

For complete details, see:
- **`/CLIENT_PORTAL_ARCHITECTURE.md`** - Complete architecture guide
- **`/CLIENT_PORTAL_SETUP_GUIDE.md`** - Detailed setup instructions

## 💡 Tips

1. **Start Simple**: Build the basic page first, add features incrementally
2. **Copy Patterns**: Look at ClientPortalDashboard.tsx for examples
3. **Use Mock Data**: Add real API calls later
4. **Test Mobile**: Clients will use phones - mobile-first!
5. **Keep It Clean**: Client portal should be simpler than admin interface
6. **Follow Standards**: Use the same table/component patterns as firm side

---

**Ready to build? Pick a page and start coding!**

Example: "Create the client portal documents page with a table of documents"
