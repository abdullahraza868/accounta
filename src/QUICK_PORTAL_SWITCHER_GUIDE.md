# Quick Portal Switcher Guide

## 🔄 Switching Between Portals Made Easy!

You can now easily switch between the **Firm Admin Portal** and the **Client Portal** directly from the login pages!

---

## 📍 From Firm Admin Login → Client Portal

### Step 1: Go to Firm Login
Navigate to `/login` (this is the default landing page)

### Step 2: Look at the Bottom
Scroll down to the bottom of the login form

### Step 3: Click the Link
You'll see:
```
Are you a client?
[Building Icon] Go to Client Portal →
```

Click **"Go to Client Portal →"** and you'll be taken to `/client-portal/login`

---

## 📍 From Client Portal → Firm Admin Login

### Step 1: Go to Client Portal Login
Navigate to `/client-portal/login`

### Step 2: Look at the Bottom
Scroll down to the bottom of the login form

### Step 3: Click the Link
You'll see:
```
Are you a firm administrator?
[Shield Icon] Go to Admin Login →
```

Click **"Go to Admin Login →"** and you'll be taken to `/login`

---

## 🎨 Visual Difference

### Firm Admin Login (`/login`)
- **Layout**: Split-screen design
  - Left: Login form
  - Right: Branded illustration with stats
- **Title**: "Welcome Back"
- **Subtitle**: "Sign in to [Your Company Name]"
- **Features**: 
  - Tenant selector
  - Email/Password fields
  - Remember me checkbox
  - Forgot password link
- **Icon**: Lock icon in purple circle

### Client Portal Login (`/client-portal/login`)
- **Layout**: Centered single-column
- **Title**: "Client Portal"
- **Subtitle**: "Sign in to access your account"
- **Features**:
  - Email/Password fields
  - Remember me checkbox
  - Forgot password link
  - Contact support link
- **Simpler, cleaner design focused on client experience**

---

## 🧪 Quick Test

### Test the Full Flow:

1. **Start at firm login** (`/login`)
2. **Click "Go to Client Portal →"** at the bottom
3. **You're now at** `/client-portal/login`
4. **Click "Go to Admin Login →"** at the bottom
5. **You're back at** `/login`

---

## 💡 Pro Tips

### For Development:
- **Bookmark both URLs** for quick access:
  - Firm: `http://localhost:5173/login`
  - Client: `http://localhost:5173/client-portal/login`

- **Open in separate tabs** to work on both simultaneously

- **Use browser dev tools** to test responsive behavior

### For Testing:
- **Firm Login**: Use `admin@example.com` / `123qwe`
- **Client Login**: Use ANY email/password (mocked authentication)

---

## 📋 Current Portal Features

### Firm Admin Portal (After Login)
✅ Full sidebar navigation  
✅ Client management  
✅ Billing & invoices  
✅ Signatures  
✅ Documents  
✅ Calendar  
✅ Team management  
✅ Settings & branding  

### Client Portal (After Login)
✅ Top navigation bar  
✅ Dashboard with stats  
✅ Recent activity  
✅ Quick actions  
⏭️ Documents (not built yet)  
⏭️ Invoices (not built yet)  
⏭️ Signatures (not built yet)  
⏭️ Messages (not built yet)  
⏭️ Profile (not built yet)  

---

## 🆘 Troubleshooting

### Issue: Link not visible
**Solution**: Scroll down to the very bottom of the login form

### Issue: Link doesn't work
**Solution**: 
- Check the browser console for errors
- Make sure you're on the correct login page (`/login` or `/client-portal/login`)
- Refresh the page

### Issue: Wrong portal after clicking
**Solution**: 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Styling looks broken
**Solution**: 
- Make sure Platform Branding is configured
- Check that branding colors are set
- Verify logo URL is valid

---

## ✅ You're All Set!

**Just look for the portal switcher link at the bottom of any login page!**

Need to build more client portal pages? Just ask:
- "Create the client portal documents page"
- "Create the client portal invoices page"
- "Create the client portal profile page"

---

*Last Updated: October 31, 2025*
