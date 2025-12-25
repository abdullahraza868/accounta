# Mock Mode Guide

## ✅ Mock Mode is ENABLED and FULLY CONFIGURED

Your application is currently running in **mock mode**, which means it uses simulated data instead of making real API calls. This allows you to develop and test the UI without needing a backend server.

---

## 🎯 Current Configuration

### API Configuration (`/config/api.config.ts`)
```typescript
useMockMode: true  // ✅ Mock mode is ENABLED
```

- **Status**: ✅ ACTIVE
- **API URL**: `https://api.acounta.com` (not being used in mock mode)
- **Behavior**: All API calls will use mock data instead of making real HTTP requests

---

## 📋 What's Using Mock Data

### 1. Authentication & Account Management ✅
**Files**: 
- `/services/ApiService.ts`
- `/contexts/AuthContext.tsx`

**Mock Features**:
- ✅ Login with any username/password
- ✅ 2FA flow simulation
- ✅ Tenant selection
- ✅ Password reset
- ✅ Profile updates
- ✅ Change password

**Mock Credentials**: Any username/password will work in mock mode

---

### 2. Platform Branding ✅
**Files**: 
- `/contexts/BrandingContext.tsx`
- `/services/ApiService.ts`

**Mock Data**:
```javascript
{
  primaryColor: '#7c3aed',
  secondaryColor: '#6d28d9',
  logoUrl: 'Acounta Logo',
  companyName: 'Acounta'
}
```

**Features**:
- ✅ Dark mode toggle
- ✅ Custom color schemes
- ✅ Company logo
- ✅ All branding changes stored in localStorage

---

### 3. Client Management ✅
**File**: `/components/views/ClientManagementView.tsx`

**Mock Clients**:
- Troy Business Services LLC
- Abacus 360
- Best Face Forward
- Cleveland Business Services, LLC
- Count on Cooley Bookkeeping
- TNT Accounting Services, LLC
- And many more...

**Features**:
- ✅ Client list/card/table views
- ✅ Client folders with full details
- ✅ Demographics, documents, invoices, signatures
- ✅ Notes, activities, communications
- ✅ Team assignments

---

### 4. Signature Requests ✅
**File**: `/components/views/SignaturesView.tsx`

**Mock Data Includes**:
- ✅ Form 8879 signatures
- ✅ Engagement letters
- ✅ Custom documents
- ✅ Multi-recipient tracking
- ✅ Status tracking (completed/partial/sent/unsigned)
- ✅ Workflow automation indicators

---

### 5. Billing & Invoices ✅
**File**: `/components/views/BillingView.tsx`

**Mock Invoices**:
- ✅ Paid invoices
- ✅ Draft invoices
- ✅ Overdue invoices
- ✅ Payment methods (Cash, Stripe, Check, ACH)
- ✅ Full invoice details and history

---

### 6. Incoming Documents ✅
**File**: `/components/views/IncomingDocumentsView.tsx`

**Mock Documents**:
- ✅ Tax forms (1099-MISC, W-2, 1040)
- ✅ Bank statements
- ✅ Receipts
- ✅ Payroll documents
- ✅ Document review workflow
- ✅ Bulk operations
- ✅ Multiple delivery methods (email, upload, text)

---

### 7. Other Pages ✅
All other views also use mock data:
- ✅ Dashboard
- ✅ Calendar
- ✅ Chat
- ✅ Notifications
- ✅ Settings
- ✅ My Account
- ✅ Company Settings
- ✅ Client Portal

---

## 🔍 How to Verify Mock Mode is Working

### Console Messages
When you start the app, you should see:
```
🚀 Acounta Client Management System
Mode: Development
API URL: https://api.acounta.com
⚠️  Mock Mode: Enabled
ℹ️  The application is running with mock data.
ℹ️  To connect to a real API, update the baseUrl in config/api.config.ts
```

### Visual Indicators
1. **Mock Mode Banner**: Yellow banner at the top of the screen when logged in
2. **Console Logs**: Look for `[MOCK]` prefixed log messages
3. **Toast Notifications**: Some actions show "(Mock Mode)" in success messages

### Test Mock Mode
1. **Login**: Use any username/password - it will work
2. **View Clients**: You'll see pre-populated clients
3. **View Signatures**: Mock signature requests are displayed
4. **View Invoices**: Mock billing data is shown
5. **Change Settings**: All changes are stored in localStorage

---

## 🔄 How Mock Mode Works

### API Service Pattern
All API calls follow this pattern:

```typescript
async getClients() {
  // TODO: Replace with actual NSwag client call
  // return await this.clientService.getAll();

  // Mock implementation
  console.log('Mock getClients');
  return {
    items: [], // Mock data
    totalCount: 0
  };
}
```

### Graceful Fallback
Some components (like TenantSelectionDialog) try real API calls first, then fall back to mock:

```typescript
try {
  // Try real API call
  const response = await axios.post(apiUrl, data);
  // Handle real response
} catch (err) {
  // API not available - use mock mode
  console.log('Using mock data');
  // Return mock data
}
```

---

## 🚀 Switching to Real API

When you're ready to connect to a real API:

### Step 1: Update API Configuration
Edit `/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:21021', // Your real API URL
  useMockMode: false, // Disable mock mode
  // ... rest of config
};
```

### Step 2: Generate NSwag Client
Run the generation script:
```bash
# Windows
scripts/generate-api-client.bat

# Mac/Linux
scripts/generate-api-client.sh
```

### Step 3: Update ApiService
Edit `/services/ApiService.ts` and uncomment the real API implementations:
```typescript
// Uncomment imports
import { 
  TokenAuthServiceProxy, 
  // ... other proxies
} from './generated/ServiceProxies';

// Uncomment service initialization
this.tokenAuthService = new TokenAuthServiceProxy(baseUrl);
// ...

// Replace mock implementations with real calls
async authenticate(...) {
  return await this.tokenAuthService.authenticate(model);
}
```

---

## 📝 Adding More Mock Data

To add more mock data to any view:

1. **Find the view file** in `/components/views/`
2. **Add to the mock data array** (usually near the top of the component)
3. **Follow the existing pattern**

Example:
```typescript
const mockClients: Client[] = [
  {
    id: '1',
    name: 'New Client',
    email: 'new@client.com',
    // ... other fields
  },
  // Add more here
];
```

---

## 🐛 Troubleshooting

### Issue: "API errors in console"
**Solution**: This is expected in mock mode. The app tries the real API first, then falls back to mock data.

### Issue: "Data not persisting"
**Solution**: Mock data is stored in:
- Component state (resets on refresh)
- localStorage (persists across sessions)

To persist changes, use localStorage:
```typescript
localStorage.setItem('myData', JSON.stringify(data));
```

### Issue: "Mock mode banner not showing"
**Solution**: Check that you're logged in and not on the login page. The banner only shows on authenticated pages.

### Issue: "No data showing"
**Solution**: 
1. Check browser console for errors
2. Verify the view has mock data defined
3. Check if filters are hiding data

---

## ✅ Summary

Your application is **fully configured** for mock mode:
- ✅ All API calls return mock data
- ✅ All views have pre-populated mock data
- ✅ Authentication works with any credentials
- ✅ All features are testable without a backend
- ✅ Clear visual indicators show mock mode is active
- ✅ Easy to switch to real API when ready

**You can now use the entire application with mock data!**

---

## 📚 Related Files

- `/config/api.config.ts` - API configuration and mock mode toggle
- `/services/ApiService.ts` - Mock API implementations
- `/lib/startupInfo.ts` - Startup logging and mock mode indicators
- `/components/MockModeBanner.tsx` - Visual mock mode indicator
- `/contexts/AuthContext.tsx` - Mock authentication
- `/contexts/BrandingContext.tsx` - Mock branding data
- All `/components/views/*View.tsx` - Mock data for each page

---

**Last Updated**: Current session
**Mock Mode Status**: ✅ ACTIVE
