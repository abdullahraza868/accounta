# 🎯 Field Validation - Quick Reference

## Import

```typescript
import {
  validateEmail,
  validatePhone,
  validateDate,
  validateRequired,
  validateLength,
  validateNumber,
  validateUrl,
  validateZipCode,
  validateAll,
  customValidation,
} from '../lib/fieldValidation';

import { AlertCircle } from 'lucide-react';
```

---

## Standard Pattern

### 1. Add State

```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');
```

### 2. Create Handler

```typescript
const handleEmailChange = (value: string) => {
  setEmail(value);
  const result = validateEmail(value, true);
  setEmailError(result.error || '');
};
```

### 3. Update Input

```typescript
<Input
  value={email}
  onChange={(e) => handleEmailChange(e.target.value)}
  style={{
    borderColor: emailError ? '#ef4444' : branding.colors.inputBorder,
  }}
/>
{emailError && (
  <div className="flex items-center gap-1 text-xs text-red-600">
    <AlertCircle className="w-3 h-3" />
    <span>{emailError}</span>
  </div>
)}
```

---

## Quick Examples

### Email (Required)
```typescript
const result = validateEmail(email, true);
```

### Phone (Optional)
```typescript
const result = validatePhone(phone, false);
if (result.formatted) {
  setPhone(result.formatted);
}
```

### Date (With Min)
```typescript
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const result = validateDate(dateString, true, tomorrow);
```

### Required Field
```typescript
const result = validateRequired(firstName, 'First name');
```

### Number Range
```typescript
const result = validateNumber(ageString, true, 0, 150, 'Age');
```

### Multiple Fields
```typescript
const result = validateAll([
  validateEmail(email),
  validateRequired(firstName, 'First name'),
  validatePhone(phone),
]);
if (!result.isValid) {
  toast.error('Please fix errors');
}
```

---

## Checklist

- [ ] Import validators
- [ ] Add error state
- [ ] Create handlers
- [ ] Update onChange
- [ ] Add error styling
- [ ] Add error display
- [ ] Update submit logic

---

## Error Display

```tsx
{error && (
  <div className="flex items-center gap-1 text-xs text-red-600">
    <AlertCircle className="w-3 h-3" />
    <span>{error}</span>
  </div>
)}
```

## Error Border

```tsx
style={{
  borderColor: error ? '#ef4444' : branding.colors.inputBorder,
}}
```

---

*Location: `/lib/fieldValidation.ts`*
