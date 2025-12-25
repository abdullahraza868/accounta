# 🏠 Household Spouse Linking - Quick Reference

## 📍 Access

**Route**: `/client-portal/settings/household`

**File**: `/pages/client-portal/settings/ClientPortalHousehold.tsx`

---

## 🎯 States

| State | Description | Actions |
|-------|-------------|---------|
| **None** | No spouse linked | Send Invite |
| **Pending** | Invite sent, waiting | Resend Invite, Cancel Invite |
| **Linked** | Spouse connected | Change Mode, Unlink Spouse |

---

## 🔧 Household Modes

| Mode | Description | Editable |
|------|-------------|----------|
| **Unified** | Both spouses share docs & deliverables | ✅ Yes |
| **Separated** | Uploads are private to uploader | ✅ Yes |
| **Divorced/Closed** | Read-only, firm only | ❌ No |

---

## 🧪 Quick Test

### Test Empty State
```typescript
// Default state - just navigate to page
// /client-portal/settings/household
```

### Test Pending State
```typescript
// In ClientPortalHousehold.tsx, uncomment:
setStatus('pending'); 
setSpouse({ email: 'spouse@example.com' });
```

### Test Linked State (Editable)
```typescript
// In ClientPortalHousehold.tsx, uncomment:
setStatus('linked'); 
setSpouse({ name: 'Jane Doe', email: 'spouse@example.com', mode: 'unified' });
```

### Test Linked State (Divorced - Read-only)
```typescript
// In ClientPortalHousehold.tsx, uncomment:
setStatus('linked'); 
setSpouse({ name: 'Jane Doe', email: 'spouse@example.com', mode: 'divorced' });
```

---

## 🔌 API Endpoints

```typescript
// Import
import { apiService } from '../../../services/ApiService';

// Get status
await apiService.getHouseholdStatus();

// Send invite
await apiService.sendHouseholdInvite(email);

// Resend invite
await apiService.resendHouseholdInvite(email);

// Cancel invite
await apiService.cancelHouseholdInvite(email);

// Update mode
await apiService.updateHouseholdMode(mode);

// Unlink
await apiService.unlinkSpouse();
```

---

## ✅ Validation

**Email Field**:
- Uses `validateEmail()` from `/lib/fieldValidation.ts`
- Required field
- Valid email format
- Real-time error feedback

---

## 🎨 Branding

All colors use `branding.colors.*`:
- `primaryButton` - Send Invite, primary actions
- `errorColor` - Unlink, Cancel, validation errors
- `warningColor` - Pending status
- `successColor` - Active/linked status
- `cardBackground` - Card containers
- `borderColor` - Borders
- `headingText` / `bodyText` / `mutedText` - Typography

---

## 📱 Navigation

To add to client portal menu:

```typescript
{
  icon: Users,
  label: 'Household',
  path: '/client-portal/settings/household',
}
```

---

## 🚀 Production Checklist

- [ ] Remove mock test states from component
- [ ] Implement API endpoints (see `HOUSEHOLD_API_INTEGRATION_GUIDE.md`)
- [ ] Update ApiService.ts with real calls
- [ ] Add to navigation menu
- [ ] Configure email service
- [ ] Test full workflow
- [ ] Deploy to production

---

## 📚 Documentation

- **Full Implementation**: `CLIENT_PORTAL_HOUSEHOLD_SPOUSE_LINKING_COMPLETE.md`
- **API Integration**: `HOUSEHOLD_API_INTEGRATION_GUIDE.md`
- **Component**: `/pages/client-portal/settings/ClientPortalHousehold.tsx`
- **Routes**: `/routes/AppRoutes.tsx` (line 41, 253)

---

## 🎉 Ready!

The Household Spouse Linking feature is complete and ready for backend integration!
