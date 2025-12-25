# Quick Test Credentials

## 🚀 Fast Login for Testing

### Admin/Firm-Side Login
**URL:** `/login`

```
Email: admin@example.com
Password: 123qwe
```

**Auto-filled:** ✅ YES  
**Just press:** Enter or click "Sign In"

---

### Client Portal Login
**URL:** `/client-portal/login`

```
Email: client@example.com
Password: password123
```

**Auto-filled:** ✅ YES (as of Nov 2, 2024)  
**Just press:** Enter or click "Sign In"

---

## 🔄 Quick Testing Workflow

### Test Admin Login
```bash
1. Open browser to http://localhost:5173/login
2. Credentials auto-filled
3. Press Enter or click "Sign In"
4. Should redirect to /clients
```

### Test Client Portal Login
```bash
1. Open browser to http://localhost:5173/client-portal/login
2. Credentials auto-filled
3. Press Enter or click "Sign In"
4. Should redirect to /client-portal/dashboard
```

### Test Logout & Re-login
```bash
1. While logged in to admin, click logout
2. Should clear all localStorage
3. Go to /login
4. Log in again
5. Should redirect to /clients (NOT client portal)
```

---

## 🎯 What Gets Pre-filled

| Page | Email | Password | Notes |
|------|-------|----------|-------|
| `/login` | `admin@example.com` | `123qwe` | Admin/Firm side |
| `/client-portal/login` | `client@example.com` | `password123` | Client side |

---

## ⚙️ Change Pre-filled Credentials

### Admin Login
Edit `/pages/account/login/LoginView.tsx`:
```tsx
const [email, setEmail] = useState('admin@example.com');  // Change here
const [password, setPassword] = useState('123qwe');       // Change here
```

### Client Portal Login
Edit `/pages/client-portal/login/ClientPortalLogin.tsx`:
```tsx
const [email, setEmail] = useState('client@example.com'); // Change here
const [password, setPassword] = useState('password123');  // Change here
```

---

## 🔒 Security Note

**These pre-filled credentials are for DEVELOPMENT/TESTING ONLY.**

Before deploying to production:
1. Remove pre-filled values
2. Change to empty strings:
   ```tsx
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   ```

---

## 🧪 Mock Mode Users

When in mock mode (default), these credentials work:

**Admin Users:**
- `admin@example.com` / `123qwe`
- `john@example.com` / `123qwe`
- `sarah@example.com` / `123qwe`

**Any email/password combo works in mock mode** - the system just needs non-empty values.

---

## 📱 Browser Auto-fill

If you want browsers to remember credentials:
1. Keep "Remember Me" checkbox enabled
2. Allow browser to save password when prompted
3. Browser will auto-fill on future visits

---

**Created:** November 2, 2024  
**Purpose:** Fast testing during development  
**Remember:** Remove for production!
