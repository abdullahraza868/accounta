# Test Login Flow - Step by Step

## QUICK TEST (30 seconds)

### Test 1: Fresh Browser
```bash
1. Close ALL browser tabs/windows
2. Open NEW browser window
3. Go to: http://localhost:5173/login
   (Type it manually - don't use autocomplete)
4. The URL bar should show: /login
5. Login with: admin@example.com / 123qwe
6. Press F12 to open console
7. Click "Sign In"
8. Watch the console output
9. What URL do you end up at?
```

**Expected Result:**
- URL: `http://localhost:5173/clients`
- Page: Client Management View with client list

**Actual Result:**
- URL: `http://localhost:5173/client-portal/dashboard`  ❌
- Page: Client Portal Dashboard

### Test 2: Incognito Mode
```bash
1. Open Incognito/Private window (Ctrl+Shift+N / Cmd+Shift+N)
2. Go to: http://localhost:5173/login
3. Open console (F12)
4. Login with: admin@example.com / 123qwe
5. What URL do you end up at?
```

**If it works in incognito:**
→ It's 100% a browser cache/history issue
→ Solution: Clear cache or use incognito for now

**If it DOESN'T work in incognito:**
→ It's a code issue
→ Solution: Use the emergency fix

### Test 3: Direct URL
```bash
1. After logging in (even if on client portal)
2. Manually type in URL bar: http://localhost:5173/clients
3. Press Enter
4. Does it stay on /clients or redirect to client portal?
```

**If it stays on /clients:**
→ Login is redirecting you, but the route works
→ Check the console logs from the login

**If it redirects to client portal:**
→ Something is globally redirecting admin users
→ Check the App.tsx logs

## CONSOLE LOGS TO CHECK

When you login, you should see this sequence:

```
🔐 LoginView: Attempting admin login...
🔐 AuthContext.login: Starting login process
📧 Email: admin@example.com
🏢 Tenant: none
✅ AuthContext.login: Setting auth data
👤 User permissions: ["Pages.Dashboard", "Pages.Firm.Client", ...]
✅ AuthContext.login: Login complete
✅ LoginView: Login successful
🚀 LoginView: Navigating to: /clients
📦 LoginView: Clearing client portal localStorage...
📦 LoginView: localStorage after clearing:
   - preferredPortal: null
   - clientPortalSession: null
   - accessToken: EXISTS
🌐 LoginView: Current window.location: /login
🎯 LoginView: About to navigate to: /clients
📍 Current location: /clients
🔐 Is auth page: false
👤 Is client portal: false
✅ Rendering app layout
🔍 LoginView: Post-navigate check - Current path: /clients
✅ LoginView: Correctly at admin path
```

**Copy and paste YOUR actual console output here:**
```
[Paste your console output]
```

## WHAT URL ARE YOU TYPING?

Please confirm exactly what you're typing in the URL bar:

```
What I type: _______________________

What the browser shows after I press Enter: _______________________

What I end up at after login: _______________________
```

## BROWSER INFO

Please confirm:

- Browser: Chrome / Firefox / Edge / Safari / Other: _______
- Version: _______
- Extensions enabled: Yes / No
- Using incognito: Yes / No
- Cleared cache recently: Yes / No

## SCREENSHOT REQUEST

Please take screenshots of:

1. **Before Login**
   - URL bar showing what you typed
   - The login page

2. **After Login**
   - URL bar showing where you ended up
   - The page content
   - Browser console (F12) showing the logs

This will help me see exactly what's happening!

## QUICK SANITY CHECKS

### Are you on the right port?
```
✅ http://localhost:5173/login
❌ http://localhost:3000/login
❌ http://localhost:5174/login
```

### Are there multiple dev servers running?
```bash
# Check what's running on port 5173
netstat -ano | findstr :5173    (Windows)
lsof -i :5173                   (Mac/Linux)

# Should only be ONE process
```

### Is the dev server actually running?
```bash
# You should see in the terminal:
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## EMERGENCY: Skip Login Entirely

If you just need to access the admin side:

```typescript
// Open console (F12) and paste:
localStorage.setItem('accessToken', 'mock_token_' + Date.now());
localStorage.setItem('user', JSON.stringify({
  id: 1,
  userName: "admin@example.com",
  name: "Admin",
  surname: "User",
  emailAddress: "admin@example.com",
  grantedPermissions: [
    'Pages.Dashboard',
    'Pages.Firm.Client',
    'Pages.Users',
    'Pages.Signatures',
    'Pages.Documents',
    'Pages.Calendar',
    'Pages.Billing',
    'Pages.Chat',
    'Pages.Settings',
    'Pages.PlatformBranding'
  ]
}));

// Then manually go to:
window.location.href = '/clients';
```

This bypasses login completely and takes you straight to the admin client page.

---

**Let me know the results of these tests!**

Especially:
1. What happens in incognito mode?
2. What does the console show?
3. Can you manually navigate to /clients after login?
