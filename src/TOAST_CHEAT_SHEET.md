# 🔔 Toast Notifications - Cheat Sheet

## Import
```tsx
import { useNotify } from '../../contexts/NotificationContext';
const notify = useNotify();
```

## Basic Usage
```tsx
notify.success(title, message, actionUrl?, actionLabel?)
notify.error(title, message, actionUrl?, actionLabel?)
notify.warning(title, message, actionUrl?, actionLabel?)
notify.info(title, message, actionUrl?, actionLabel?)
```

## All Methods

### Success (Green, Normal)
```tsx
notify.success('Saved!', 'Changes saved successfully');
```

### Error (Red, Critical)
```tsx
notify.error('Failed', 'Unable to save changes');
```

### Warning (Orange, High)
```tsx
notify.warning('Overdue', 'Invoice is 15 days overdue');
```

### Info (Blue, Normal)
```tsx
notify.info('Update', 'New version available');
```

### Payment (Green, High)
```tsx
notify.payment('Payment', 'Invoice #123 paid ($5,250)');
```

### Client (Purple, Normal)
```tsx
notify.client('New Client', 'Sarah Johnson added');
```

### Task (Blue, Normal)
```tsx
notify.task('Assigned', 'Review Q4 financials');
```

### Message (Purple, Normal)
```tsx
notify.message('New Message', 'John: "Meeting?"');
```

### Security (Red, High)
```tsx
notify.security('New Login', 'Login from SF, CA');
```

### Custom (Full Control)
```tsx
notify.custom({
  type: 'invoice_sent',
  category: 'invoices',
  title: 'Bulk Complete',
  message: '15 invoices sent',
  priority: 'high',
  actionUrl: '/billing',
  actionLabel: 'View'
});
```

## With Action Button
```tsx
notify.success(
  'Client Added',
  'John Smith added',
  '/clients/123',    // URL
  'View Profile'      // Button
);
```

## Priority Levels

| Priority | Duration | Color |
|----------|----------|-------|
| critical | Never | Red |
| high | 10s | Orange |
| normal | 5s | Blue |
| low | 3s | Gray |

## Common Patterns

### Form Submit
```tsx
try {
  await save();
  notify.success('Saved', 'Data saved');
} catch {
  notify.error('Failed', 'Unable to save');
}
```

### Bulk Operation
```tsx
const result = await bulk();
notify.custom({
  type: 'task_completed',
  category: 'tasks',
  title: 'Complete',
  message: `${result.count} processed`,
  priority: 'high'
});
```

### Real-time Event
```tsx
socket.on('payment', (data) => {
  notify.payment(
    'Received',
    `$${data.amount} from ${data.client}`,
    `/invoices/${data.id}`,
    'View'
  );
});
```

## Resources

- **Usage Guide**: `/notification-usage-guide`
- **Demo**: `/notification-toast-demo`
- **Settings**: `/notification-settings`
- **Quick Ref**: `/notification-quick-reference`

## Tips

✅ Use appropriate priority
✅ Include action URLs
✅ Keep messages short
✅ Use type-specific methods
✅ Test with settings

❌ Don't spam notifications
❌ Don't use for persistent info
❌ Don't rely on color alone

---

**Quick Start**: Import `useNotify`, use `notify.success()` or `notify.error()` in your components!
