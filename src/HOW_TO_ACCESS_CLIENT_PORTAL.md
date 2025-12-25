# How to Access the Client Portal in Figma Make

## 🎉 It's Ready!

You can now easily switch between the firm admin login and client portal login!

## 🚀 Quick Access

**On the Firm Login Page:**
- Look at the bottom of the login form
- You'll see "Are you a client?"
- Click **"Go to Client Portal →"**

**On the Client Portal Login Page:**
- Look at the bottom of the login form
- You'll see "Are you a firm administrator?"
- Click **"Go to Admin Login →"**

## 📝 What to Expect

When the page loads, you'll see:
1. **Client Portal Login Page**
   - Clean, branded login form
   - Your company logo (if configured)
   - Email and password fields
   - "Remember me" checkbox
   - "Forgot password?" link

2. **To Log In:**
   - Enter **any email** (e.g., `test@example.com`)
   - Enter **any password** (e.g., `password`)
   - Click "Sign In"
   - You'll be taken to the client dashboard!

3. **Client Dashboard:**
   - Welcome message
   - Stats cards (documents, invoices, signatures, messages)
   - Recent activity timeline
   - Upcoming tasks
   - Quick action buttons
   - Top navigation bar with menu

## 🎨 What You'll See

### Layout:
- **Top Navigation** (not the firm sidebar!)
- Logo and "Client Portal" text
- Horizontal menu: Dashboard | Documents | Invoices | Signatures | Messages | Profile
- User profile dropdown on the right
- Mobile-responsive hamburger menu

### Features:
- ✅ Uses your branding colors
- ✅ Uses your logo
- ✅ Mock authentication (any credentials work)
- ✅ Fully functional navigation
- ✅ Mobile responsive

## 🔄 To Return to Firm Side

If you want to go back to the firm-side admin interface, manually change the URL to:
```
/login
```

Then log in with firm credentials.

## ⚙️ Technical Details

### What Changed:
1. **App.tsx** - Now recognizes client portal routes and doesn't show firm sidebar/header
2. **AppRoutes.tsx** - Root `/` temporarily redirects to `/client-portal/login` for easy testing

### Current Routes:
- `/` → Redirects to `/client-portal/login` (TEMPORARY FOR TESTING)
- `/client-portal/login` → Client login page (public)
- `/client-portal/dashboard` → Client dashboard (after login)
- `/login` → Firm admin login (still works!)

## 🧪 Testing the Client Portal

### Test Navigation:
1. Click each menu item (Dashboard, Documents, Invoices, etc.)
2. Most routes aren't built yet, so you'll see a 404 or blank page - that's expected!
3. Dashboard and Login are the only fully built pages right now

### Test Mobile:
1. Resize your browser window to mobile width
2. You should see a hamburger menu icon
3. Click it to see the mobile navigation menu

### Test Logout:
1. Click the user profile dropdown in the top right
2. Click "Logout"
3. You'll be redirected back to the login page

## 📋 Next Steps - Building More Pages

Once you're ready to build more pages:

1. **Documents Page**: "Create the client portal documents page"
2. **Invoices Page**: "Create the client portal invoices page"
3. **Profile Page**: "Create the client portal profile page"
4. **Signatures Page**: "Create the client portal signatures page"
5. **Messages Page**: "Create the client portal messages page"

## 🔧 When You're Done Testing

To restore normal behavior (firm side as default):

1. Open `/routes/AppRoutes.tsx`
2. Find the root `/` route (around line 268)
3. Change it back from:
   ```tsx
   <Route 
     path="/" 
     element={<Navigate to="/client-portal/login" replace />} 
   />
   ```
   
   To:
   ```tsx
   <Route 
     path="/" 
     element={
       <ProtectedRoute>
         <Navigate to="/dashboard" replace />
       </ProtectedRoute>
     } 
   />
   ```

## 💡 Pro Tips

1. **Bookmark the client portal URL** in your browser for quick access during development
2. **Open in a new tab** to test both firm and client portals side by side
3. **Use browser dev tools** to test responsive behavior
4. **Check the console** for helpful debug messages

## 🆘 Troubleshooting

### Issue: Still seeing firm sidebar
**Solution**: Make sure you're at `/client-portal/login` not `/login`

### Issue: Getting 404 errors
**Solution**: Normal! Only Login and Dashboard are built. Other pages need to be created.

### Issue: Colors not showing
**Solution**: Make sure Platform Branding is configured with colors and logo

### Issue: Can't log in
**Solution**: Use ANY email/password - authentication is mocked for testing

---

## ✅ You're All Set!

**Just refresh your Figma Make preview and start exploring the client portal!**

When you're ready to build more pages, refer to:
- `CLIENT_PORTAL_QUICK_REFERENCE.md` - For code patterns
- `CLIENT_PORTAL_BUILD_CHECKLIST.md` - For what to build next
- `CLIENT_PORTAL_SETUP_GUIDE.md` - For detailed instructions

---

*Last Updated: October 31, 2025*
