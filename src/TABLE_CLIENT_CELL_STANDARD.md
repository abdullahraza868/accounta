# ✅ TABLE CLIENT CELL DISPLAY STANDARD - COMMITTED TO MEMORY

## **Standard Client Display Format for ALL Tables**

All tables throughout the entire application MUST use the standardized client cell format with avatar, clickable name, and folder link icon.

---

## **Implementation**

### **1. ClientCellDisplay Component**
Located at: `/components/ClientCellDisplay.tsx`

```tsx
import { ClientCellDisplay } from '../ClientCellDisplay';

// Basic usage - shows avatar, name, and folder link
<ClientCellDisplay 
  clientId={invoice.clientId}
  clientName={invoice.client}
  clientType="Business"
/>

// With custom name click handler (e.g., view document)
<ClientCellDisplay 
  clientId={request.clientId}
  clientName={request.clientName}
  clientType={request.clientType}
  onNameClick={() => console.log('View document:', request.id)}
/>

// Without avatar (simpler view)
<ClientCellDisplay 
  clientId={client.id}
  clientName={client.name}
  showAvatar={false}
/>
```

### **2. Visual Format**

```
┌─────────────────────────────────────────┐
│ [👤]  John Doe              [🔗]       │  ← Individual (Green avatar)
│       ^^^^^^^^^^              ^^        │
│       Name (clickable)   Folder link   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [🏢]  Acme Corporation      [🔗]       │  ← Business (Blue avatar)
└─────────────────────────────────────────┘
```

### **3. Component Features**
- ✅ **Avatar**: Color-coded (Blue = Business, Green = Individual)
- ✅ **Client Name**: Clickable (custom action or default)
- ✅ **Folder Link**: Hover-visible icon to open client folder
- ✅ **Responsive**: Handles long names with truncation
- ✅ **Dark mode**: Fully supported
- ✅ **Primary Color Integration**: Link icon uses `var(--primaryColor)`

---

## **Usage Examples**

### **Example 1: Signatures Table**
```tsx
<td className="px-6 py-5">
  <ClientCellDisplay 
    clientId={request.clientId}
    clientName={request.clientName}
    clientType={request.clientType}
    onNameClick={() => console.log('View document:', request.id)}
  />
</td>
```

### **Example 2: Invoices Table**
```tsx
<td className="p-3 w-[260px]">
  <ClientCellDisplay 
    clientId={invoice.clientId}
    clientName={invoice.client}
    clientType="Business"
  />
</td>
```

### **Example 3: Simple List (No Avatar)**
```tsx
<td className="p-3">
  <ClientCellDisplay 
    clientId={client.id}
    clientName={client.name}
    showAvatar={false}
  />
</td>
```

### **Example 4: Without Folder Link**
```tsx
<td className="p-3">
  <ClientCellDisplay 
    clientId={client.id}
    clientName={client.name}
    showFolderLink={false}
  />
</td>
```

---

## **Component API**

### **ClientCellDisplay**
```tsx
interface ClientCellDisplayProps {
  clientId: string;              // Required - For folder navigation
  clientName: string;            // Required - Display name
  clientType?: 'Business' | 'Individual';  // Optional - Default: 'Individual'
  onNameClick?: () => void;      // Optional - Custom click handler for name
  className?: string;            // Optional - Additional wrapper classes
  showAvatar?: boolean;          // Optional - Default: true
  showFolderLink?: boolean;      // Optional - Default: true
}
```

**Avatar Colors:**
- **Business**: Blue gradient (`from-blue-500 to-blue-600`)
- **Individual**: Green gradient (`from-green-500 to-green-600`)

**Icons:**
- **Business**: Building2 icon
- **Individual**: User icon
- **Folder Link**: ExternalLink icon (uses `var(--primaryColor)`)

---

## **Visual States**

### **Default State**
- Avatar: Visible with appropriate color
- Name: Standard text color
- Folder Link: Hidden (opacity: 0)

### **Hover State**
- Avatar: No change
- Name: Underline if `onNameClick` is provided
- Folder Link: Visible (opacity: 100), purple/primary color background on hover

### **Click Behavior**
- **Name Click**: Executes `onNameClick` if provided
- **Folder Link Click**: Navigates to `/clients?clientId={clientId}`

---

## **Replacing Old Patterns**

### ❌ **OLD - Using ClientNameWithLink**
```tsx
<ClientNameWithLink 
  clientId={invoice.clientId}
  clientName={invoice.client}
/>
```

### ✅ **NEW - Using ClientCellDisplay**
```tsx
<ClientCellDisplay 
  clientId={invoice.clientId}
  clientName={invoice.client}
  clientType="Business"
/>
```

---

## **Integration with Application Settings**

The folder link icon automatically uses `var(--primaryColor)` from Application Settings, ensuring consistency with the app's theme.

---

## **Checklist for ALL Tables**

When creating or updating ANY table with client names, ALWAYS:

- [ ] Import `ClientCellDisplay` from `/components/ClientCellDisplay`
- [ ] Replace any existing client name displays
- [ ] Include `clientId` and `clientName` props
- [ ] Optionally add `clientType` for correct avatar color
- [ ] Optionally add `onNameClick` for custom actions (e.g., view document)
- [ ] **NEVER** create custom client name displays inline

---

## **Pages Already Updated**

- ✅ `/components/views/SignaturesViewSplit.tsx` - Both Outstanding and Completed tables
- ✅ `/components/views/BillingViewSplit.tsx` - Both Outstanding and Paid tables
- ✅ `/components/views/BillingView.tsx` - Single view table

---

## **Benefits**

1. **Consistency** - Same client display across entire application
2. **User Experience** - Hover-reveal folder link reduces clutter
3. **Visual Clarity** - Color-coded avatars for Business vs Individual
4. **Maintainability** - Single source of truth for client display logic
5. **Accessibility** - Proper semantic structure with clear actions
6. **Navigation** - Quick access to client folders from any table
7. **Primary Color Integration** - Respects user's theme preferences

---

## **ALWAYS REMEMBER**

> **For every table with client names → Use `ClientCellDisplay` component**
> 
> **NEVER create inline client name displays**

This is now the standard and must be followed for all future tables!

---

## **Related Standards**

- See `/TABLE_DATE_TIME_FORMAT_STANDARD.md` for date/time display
- See `/DESIGN_SYSTEM_REFERENCE.md` for status badge patterns
- See `/TABLE_PAGINATION_CHECKLIST.md` for pagination implementation