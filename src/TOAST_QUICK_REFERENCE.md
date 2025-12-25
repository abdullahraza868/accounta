# 🔔 Toast Notifications - Quick Reference

## Import
```tsx
import { useNotify } from '../../contexts/NotificationContext';
```

## Setup
```tsx
const notify = useNotify();
```

## Basic Usage

| Method | Use Case | Example |
|--------|----------|---------|
| `notify.success()` | Successful operations | Client saved, task completed |
| `notify.error()` | Errors and failures | Payment failed, save error |
| `notify.warning()` | Warnings and alerts | Invoice overdue, deadline approaching |
| `notify.info()` | Informational messages | Update available, tip of the day |
| `notify.payment()` | Payment events | Payment received, refund processed |
| `notify.client()` | Client events | New client, client updated |
| `notify.task()` | Task events | Task assigned, task completed |
| `notify.message()` | Messages | New message, chat notification |
| `notify.security()` | Security events | New login, password changed |
| `notify.custom()` | Full control | Any custom scenario |

## Examples

### Simple Notification
```tsx
notify.success('Saved!', 'Your changes have been saved');
```

### With Action Button
```tsx
notify.success(
  'Client Added',
  'John Smith has been added',
  '/clients/123',  // URL
  'View Profile'   // Button label
);
```

### Error Handling
```tsx
try {
  await saveData();
  notify.success('Saved', 'Data saved successfully');
} catch (error) {
  notify.error('Failed', 'Unable to save data');
}
```

### Custom Notification
```tsx
notify.custom({
  type: 'invoice_sent',
  category: 'invoices',
  title: 'Bulk Send Complete',
  message: '15 invoices sent',
  priority: 'high', // critical | high | normal | low
  actionUrl: '/billing',
  actionLabel: 'View'
});
```

## Priority Levels

| Priority | Duration | Sound | Color | Use For |
|----------|----------|-------|-------|---------|
| `critical` | Never (manual dismiss) | Loud | Red | Critical errors, security |
| `high` | 10 seconds | Medium | Orange | Warnings, important events |
| `normal` | 5 seconds | Soft | Blue | Success, info, general |
| `low` | 3 seconds | Quiet | Gray | Minor updates |

## Resources

- **Usage Guide**: `/notification-usage-guide`
- **Demo Page**: `/notification-toast-demo`
- **Settings**: `/notification-settings`
- **Example Code**: `/components/examples/NotificationExampleComponent.tsx`
- **Full Documentation**: `/TOAST_NOTIFICATIONS_README.md`

## Quick Patterns

### Form Submit
```tsx
const handleSubmit = async (data) => {
  try {
    await api.submit(data);
    notify.success('Submitted', 'Form submitted successfully');
  } catch (error) {
    notify.error('Failed', error.message);
  }
};
```

### Bulk Operation
```tsx
const result = await bulkOperation();
notify.custom({
  type: 'task_completed',
  category: 'tasks',
  title: 'Bulk Complete',
  message: `${result.count} items processed`,
  priority: 'high'
});
```

### Real-time Event
```tsx
socket.on('payment', (data) => {
  notify.payment(
    'Payment Received',
    `$${data.amount} from ${data.client}`,
    `/invoices/${data.id}`,
    'View'
  );
});
```

---

**That's it!** Start using `notify.success()`, `notify.error()`, etc. in your components! 🚀
