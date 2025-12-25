# Troubleshooting Guide

## Issue: Broken/Unstyled Design on Startup

If you're seeing an unstyled login page or broken layout when you download and run the code, follow these steps:

### Solution 1: Clean Installation

```bash
# Stop the dev server if running (Ctrl+C)

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Start the dev server
npm run dev
```

### Solution 2: Hard Browser Refresh

1. Open the application in your browser
2. Open DevTools (F12 or Right-click > Inspect)
3. Right-click the refresh button and select "Empty Cache and Hard Reload"
4. Or use keyboard shortcut:
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### Solution 3: Clear Browser Data

1. Open your browser settings
2. Clear browsing data for the last hour
3. Make sure to check:
   - ✅ Cached images and files
   - ✅ Cookies and site data
4. Reload the page

### Solution 4: Check CSS Loading

1. Open DevTools (F12)
2. Go to the **Network** tab
3. Reload the page
4. Look for `globals.css` in the list
5. Check if it loaded successfully (status 200)
6. Click on it and verify the CSS content is there

If globals.css is not loading:
- Check that `/styles/globals.css` exists
- Verify `/main.tsx` imports it: `import './styles/globals.css';`

### Solution 5: Verify CSS Variables

1. Open DevTools (F12)
2. Go to the **Console** tab
3. Type this and press Enter:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--primaryColor')
```

You should see: `#7c3aed` (or similar purple color)

If you see an empty string:
- The CSS variables are not loading
- Try Solution 1 (Clean Installation)

### Solution 6: Check for JavaScript Errors

1. Open DevTools (F12)
2. Go to the **Console** tab
3. Look for red error messages
4. If you see errors, note them down

Common errors and fixes:

#### Error: "Cannot find module"
**Solution**: Run `npm install` again

#### Error: "Unexpected token" or syntax errors
**Solution**: 
```bash
# Make sure you're using Node 18+
node --version

# If version is too old, update Node.js
# Then reinstall dependencies
npm install
```

#### Error: "port 3000 already in use"
**Solution**: Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001,
  open: true,
}
```

### Solution 7: Use Diagnostic Panel

1. Open `/App.tsx`
2. Add this import at the top:
```typescript
import { DiagnosticPanel } from './components/DiagnosticPanel';
```

3. Add the component before the closing tags:
```typescript
return (
  <BrowserRouter>
    <BrandingProvider>
      <AuthProvider>
        <AppContent />
        <DiagnosticPanel />  {/* Add this line */}
      </AuthProvider>
    </BrandingProvider>
  </BrowserRouter>
);
```

4. Save and reload
5. Click the "🔍 Diagnostics" button in the bottom-right corner
6. Review the information

### Solution 8: Verify File Structure

Make sure these files exist:

```
✅ /App.tsx
✅ /main.tsx
✅ /index.html
✅ /styles/globals.css
✅ /components/views/LoginView.tsx
✅ /contexts/BrandingContext.tsx
✅ /contexts/AuthContext.tsx
✅ /routes/AppRoutes.tsx
```

If any are missing, there may have been an issue with the download.

### Solution 9: Check Environment

Make sure you're in the correct directory:

```bash
# Should show package.json
ls package.json

# Should show the project name
cat package.json | grep "acounta-client-management"
```

### Solution 10: Restart Everything

```bash
# Stop the dev server (Ctrl+C)

# Close your browser

# Clear everything
rm -rf node_modules package-lock.json .vite dist

# Reinstall
npm install

# Start fresh
npm run dev

# Open browser manually
# Navigate to http://localhost:3000
```

## Still Having Issues?

### Enable Verbose Logging

1. Open `/main.tsx`
2. You should see console logs when the app starts
3. Open browser DevTools Console
4. Look for:
   - ✅ "App initialized successfully"
   - ✅ "Loaded branding (mock mode)"
   - ✅ "Branding colors applied to CSS variables"

### Check Specific Issues

#### Issue: Login page appears but looks broken
- **Symptom**: Form elements are visible but unstyled
- **Cause**: CSS variables not applied or CSS not loaded
- **Solution**: Try Solutions 1, 2, and 5 above

#### Issue: Blank white screen
- **Symptom**: Nothing appears, just white
- **Cause**: JavaScript error preventing render
- **Solution**: Check Solution 6 (JavaScript Errors)

#### Issue: Infinite loading spinner
- **Symptom**: Spinner never stops
- **Cause**: Auth context stuck in loading state
- **Solution**: Clear localStorage:
```javascript
// In browser console:
localStorage.clear();
window.location.reload();
```

#### Issue: Redirects immediately after login
- **Symptom**: Can't stay logged in
- **Cause**: Auth token not being saved
- **Solution**: Check browser privacy settings, disable "Clear cookies on exit"

### System Requirements

Verify your system meets requirements:

```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check that the project builds
npm run build

# If build succeeds, try preview mode
npm run preview
```

### Last Resort: Complete Reset

If nothing else works:

```bash
# 1. Delete the entire project folder
cd ..
rm -rf acounta-client-management

# 2. Re-download/clone the project
# (download from source again)

# 3. Fresh install
cd acounta-client-management
npm install
npm run dev
```

## Expected Behavior

When the app is working correctly, you should see:

1. **On first load**: 
   - A brief loading spinner (< 1 second)
   - Then redirect to `/login`

2. **Login page**:
   - Purple gradient background on right side (desktop)
   - White login form on left side
   - Styled input fields with icons
   - Purple "Sign In" button
   - "Change Tenant" button
   - "Forgot password?" link

3. **After login**:
   - Redirect to `/clients` page
   - Left sidebar with navigation
   - Three-column layout
   - Purple color scheme throughout

## Debug Checklist

Before reporting an issue, verify:

- [ ] Node version is 18 or higher
- [ ] npm install completed without errors
- [ ] Dev server starts without errors
- [ ] Browser console shows no red errors
- [ ] Hard refresh attempted (Ctrl+Shift+R)
- [ ] LocalStorage cleared and retried
- [ ] Different browser tested (Chrome, Firefox)
- [ ] Diagnostic panel shows correct CSS variables

## Getting Help

If you've tried all solutions above:

1. Take a screenshot of the broken page
2. Open browser DevTools console
3. Take a screenshot of any errors
4. Run the Diagnostic Panel and dump to console
5. Copy the console output
6. Include all of this information when reporting the issue

---

**Most Common Fix**: 90% of styling issues are resolved by:
1. `rm -rf node_modules package-lock.json`
2. `npm install`
3. Hard browser refresh (Ctrl+Shift+R)
