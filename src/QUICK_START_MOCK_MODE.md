# Quick Start - Mock Mode 🚀

## ✅ Your app is READY with FULL MOCK DATA!

---

## 🎯 Quick Facts

- ✅ **Mock Mode**: ENABLED
- ✅ **Backend Required**: NO
- ✅ **All Pages**: Working with mock data
- ✅ **Login**: Any username/password works
- ✅ **API Calls**: All return mock data

---

## 🚀 Start the App

```bash
npm install
npm run dev
```

---

## 🔐 Login Credentials (Mock Mode)

**Any credentials work!** For example:
- Username: `admin`
- Password: `password`

Or:
- Username: `anything@example.com`
- Password: `12345`

**All combinations work in mock mode!**

---

## 📱 What You'll See

### 1. Console Messages
```
🚀 Acounta Client Management System
⚠️  Mock Mode: Enabled
ℹ️  The application is running with mock data.
```

### 2. Visual Indicator
- Yellow **"MOCK MODE"** banner at top of screen

### 3. Mock Data Available
- **20+** clients
- **15+** signature requests  
- **10+** invoices
- **15+** documents
- **Multiple** chat channels
- **Full** dashboard with tasks and calendar

---

## 🧭 Navigation

After logging in, explore:

1. **Dashboard** → Task overview, calendar, recent activity
2. **Client Management** → View and manage clients
3. **Signatures** → Signature requests and tracking
4. **Billing** → Invoices and payments
5. **Incoming Documents** → Document review workflow
6. **Chat** → Internal/external messaging
7. **Calendar** → Events and appointments
8. **Settings** → Platform branding, company settings

---

## 💾 Data Persistence

| Data Type | Persists? | Location |
|-----------|-----------|----------|
| Login session | ✅ Yes | localStorage |
| Branding settings | ✅ Yes | localStorage |
| Dashboard layout | ✅ Yes | localStorage |
| Mock client data | ❌ No | Component state |
| Mock invoices | ❌ No | Component state |
| Mock documents | ❌ No | Component state |

**To persist changes**: Add localStorage save in the component

---

## 🎨 Customization Features

### Available Now:
- ✅ Dark/Light mode toggle
- ✅ Custom color schemes
- ✅ Company logo upload
- ✅ Dashboard layout customization
- ✅ Sidebar resize

### How to Access:
1. Click **Settings** in sidebar
2. Go to **Platform Branding**
3. Customize colors and logo
4. Changes save automatically to localStorage

---

## 📚 Documentation Files

- `/MOCK_MODE_GUIDE.md` - Complete guide to mock mode
- `/MOCK_MODE_VERIFICATION.md` - Verification checklist
- `/API_SETUP_GUIDE.md` - How to connect real API
- `/README_CURRENT_STATE.md` - Current project state

---

## 🔧 Troubleshooting

### Issue: "Can't log in"
✅ **Solution**: Any username/password works in mock mode!

### Issue: "No data showing"
✅ **Solution**: Check browser console for errors. Try refreshing the page.

### Issue: "Network errors in console"
✅ **Solution**: This is normal! The app tries real API first, then uses mock data.

### Issue: "Changes not saving"
✅ **Solution**: Most mock data resets on refresh. Only branding/settings persist.

---

## 🌐 Switching to Real API

When ready to connect to your real API:

1. Open `/config/api.config.ts`
2. Change `useMockMode: false`
3. Update `baseUrl` to your API URL
4. Generate NSwag client (see `/API_SETUP_GUIDE.md`)
5. Restart the application

---

## 🎉 Ready to Go!

Your application is fully functional with mock data. You can:

✅ Test all features  
✅ Demonstrate the UI  
✅ Develop new features  
✅ Customize branding  
✅ No backend needed!

---

## 🆘 Need Help?

Check these files:
1. `/MOCK_MODE_GUIDE.md` - Full mock mode documentation
2. `/MOCK_MODE_VERIFICATION.md` - Verify everything works
3. Console messages - Look for mock mode indicators
4. Mock Mode Banner - Visual confirmation

---

**Current Status**: ✅ ALL SYSTEMS GO  
**Mock Data**: ✅ LOADED  
**Backend Required**: ❌ NO

**Start developing!** 🚀
