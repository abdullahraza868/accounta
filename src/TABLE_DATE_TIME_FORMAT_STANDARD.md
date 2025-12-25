# ✅ TABLE DATE/TIME FORMAT STANDARD - COMMITTED TO MEMORY

## **Standard Date/Time Display Format for ALL Tables**

All tables throughout the entire application MUST use the standardized date/time format: **Date on top line, Time on bottom line**.

---

## **Implementation**

### **1. DateTimeDisplay Component**
Located at: `/components/DateTimeDisplay.tsx`

```tsx
import { DateTimeDisplay, DateDisplay } from '../DateTimeDisplay';

// For date + time columns
<DateTimeDisplay date={record.createdAt} />

// For date-only columns  
<DateDisplay date={record.dueDate} />
```

### **2. Visual Format**
```
10-30-2025    ← Date (larger, dark text)
2:45 PM       ← Time (smaller, gray text)
```

### **3. Component Features**
- ✅ Automatically uses Application Settings for date/time format
- ✅ Responsive to user's preferences (MM-DD-YYYY, DD-MM-YYYY, YYYY-MM-DD)
- ✅ Responsive to user's time format preference (12-hour vs 24-hour)
- ✅ Consistent styling across all tables
- ✅ Dark mode support

---

## **Usage Examples**

### **Example 1: Signatures Table - Sent At Column**
```tsx
<td className="px-6 py-5">
  <DateTimeDisplay date={request.sentAt} />
</td>
```

### **Example 2: Invoices Table - Created Column**
```tsx
<td className="p-3 w-[160px]">
  <DateTimeDisplay date={invoice.created} />
</td>
```

### **Example 3: Invoices Table - Due Date Column** (Date only, no time)
```tsx
<td className="p-3 w-[140px]">
  <DateDisplay date={invoice.dueDate} />
</td>
```

### **Example 4: With Conditional Rendering**
```tsx
<td className="p-3 w-[140px]">
  {invoice.paidAt ? (
    <DateTimeDisplay date={invoice.paidAt} />
  ) : (
    <span className="text-sm text-gray-500">-</span>
  )}
</td>
```

---

## **Component API**

### **DateTimeDisplay**
```tsx
interface DateTimeDisplayProps {
  date: Date | string;              // Required
  className?: string;               // Optional wrapper class
  dateClassName?: string;           // Optional date line class
  timeClassName?: string;           // Optional time line class
}
```

**Default Classes:**
- Date line: `text-sm text-gray-900 dark:text-gray-100`
- Time line: `text-xs text-gray-500 dark:text-gray-400`

### **DateDisplay**
```tsx
interface DateDisplayProps {
  date: Date | string;              // Required
  className?: string;               // Optional class
}
```

**Default Class:** `text-sm text-gray-900 dark:text-gray-100`

---

## **Integration with Application Settings**

The components automatically use these settings from `/contexts/AppSettingsContext.tsx`:

```tsx
export type AppSettings = {
  dateFormat: DateFormat;        // 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD'
  timeFormat: TimeFormat;        // '12-hour' | '24-hour'
  primaryColor: string;          // e.g., '#7c3aed'
  secondaryColor: string;        // e.g., '#a78bfa'
};
```

Users can change these in **Settings → Application Settings**.

---

## **Checklist for ALL Tables**

When creating or updating ANY table in the application, ALWAYS:

- [ ] Import `DateTimeDisplay` and/or `DateDisplay` from `/components/DateTimeDisplay`
- [ ] Use `<DateTimeDisplay>` for columns showing both date and time
- [ ] Use `<DateDisplay>` for columns showing date only
- [ ] **NEVER** use inline `formatDateTime()` or `formatDate()` directly in table cells
- [ ] Test that the format respects user's Application Settings

---

## **Pages Already Updated**

- ✅ `/components/views/SignaturesViewSplit.tsx` - Sent At column
- ✅ `/components/views/BillingViewSplit.tsx` - Created, Paid On columns

---

## **Benefits**

1. **Consistency** - Same date/time format across entire application
2. **User Preference** - Respects user's format settings
3. **Maintainability** - Single source of truth for formatting logic
4. **Accessibility** - Proper semantic structure with clear visual hierarchy
5. **Internationalization** - Easy to extend for more formats
6. **Dark Mode** - Automatic support without extra code

---

## **ALWAYS REMEMBER**

> **For every table with date/time columns → Use `DateTimeDisplay` or `DateDisplay` components**
> 
> **NEVER use inline date formatting in table cells**

This is now the standard and must be followed for all future tables!
