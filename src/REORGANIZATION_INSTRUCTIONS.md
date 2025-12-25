# File Structure Reorganization Instructions

## Overview
This guide will help you reorganize your project structure to separate account pages from app pages, with each module having its own folder.

## Current Issues Fixed
1. ✓ Tenant selection dialog created with API integration
2. ✓ 2FA authentication flow implemented  
3. ✓ Login page updated with "Change Tenant" button
4. ✓ Proper tenant header (Abp.TenantId) added to all API requests
5. ⚠️ File structure needs reorganization

## New Structure Benefits
- 📁 Clear separation between `/account` and `/app` pages
- 📦 Module-based organization (clients, signatures, settings, etc.)
- 🔍 Components co-located with their features
- 📈 Scalable and maintainable architecture
- 🎯 Easy to find files and understand project structure

## Step-by-Step Instructions

### Step 1: Backup Your Current Code
```bash
# Create a backup branch
git checkout -b backup-before-reorganization
git add .
git commit -m "Backup before file reorganization"

# Create working branch
git checkout -b feature/file-reorganization
```

### Step 2: Run the Reorganization Script

#### On Linux/Mac:
```bash
chmod +x scripts/reorganize-structure.sh
./scripts/reorganize-structure.sh
```

#### On Windows:
```cmd
scripts\reorganize-structure.bat
```

This script will:
- Create the new directory structure
- Copy all files to their new locations
- Keep original files intact (for safety)

### Step 3: Fix Import Paths

#### Option A: Automatic (Recommended)
```bash
# Using Python script
python3 scripts/fix-imports.py
```

#### Option B: Manual
Update imports in each moved file according to these rules:

**For files in `/pages/account/*`:**
```typescript
// OLD
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';

// NEW
import { useBranding } from '../../../contexts/BrandingContext';
import { Button } from '../../../components/ui/button';
```

**For files in `/pages/app/*`:**
```typescript
// OLD
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';

// NEW
import { useBranding } from '../../../contexts/BrandingContext';
import { Button } from '../../../components/ui/button';
```

**For module-specific components:**
```typescript
// In pages/app/clients/ClientManagementView.tsx
// OLD
import { ClientList } from '../../components/ClientList';
import { SnapshotTab } from '../../components/folder-tabs/SnapshotTab';

// NEW
import { ClientList } from './components/ClientList';
import { SnapshotTab } from './tabs/SnapshotTab';
```

### Step 4: Update Routes File
```bash
# Backup old routes
mv routes/AppRoutes.tsx routes/AppRoutes.old.tsx

# Use new routes
mv routes/AppRoutes.new.tsx routes/AppRoutes.tsx
```

### Step 5: Update Component Imports

Files that need import updates:

#### Layout Components (in /components/layout/)
- Header.tsx
- Sidebar.tsx  
- CollapsedSidebar.tsx

Update imports from `'./ComponentName'` to `'../layout/ComponentName'` in files that use them.

#### Common Components (in /components/common/)
- BrandedButton.tsx
- FilterPanel.tsx
- AddActionItemDialog.tsx
- etc.

Update imports in files that use these components.

### Step 6: Test the Application
```bash
npm run dev
```

Test each module:
- [ ] Login page with tenant selection
- [ ] 2FA flow
- [ ] Dashboard
- [ ] Client management
- [ ] Signatures
- [ ] Documents
- [ ] Calendar
- [ ] Chat
- [ ] Billing
- [ ] Settings
- [ ] Help

### Step 7: Fix Any Remaining Errors

Common errors and solutions:

**Error: Cannot find module**
```
Solution: Check the import path depth
- For pages/account/*: use ../../../
- For pages/app/*: use ../../../  
- For nested modules: adjust accordingly
```

**Error: Component not found**
```
Solution: Verify the component was moved to the correct location
Check REORGANIZATION_GUIDE.txt for the correct path
```

**Error: Hook call order**
```
Solution: This usually means a component wasn't properly imported
Check that all component imports are correct
```

### Step 8: Clean Up Old Files (ONLY AFTER VERIFICATION)

⚠️ **WARNING: Only do this after thoroughly testing!**

```bash
# Create cleanup script
cat > scripts/cleanup-old-files.sh << 'EOF'
#!/bin/bash
echo "Removing old files..."

# Remove old views directory
rm -rf components/views

# Remove old tabs directories  
rm -rf components/folder-tabs
rm -rf components/company-settings-tabs
rm -rf components/team-member-tabs
rm -rf components/navigation-tabs

# Remove old component files that were moved
rm -f components/ClientList.tsx
rm -f components/ClientFolder.tsx
rm -f components/AddTeamMember.tsx
rm -f components/ClientNameWithLink.tsx
rm -f components/ClientGroupsDialog.tsx
rm -f components/ManageClientGroupsDialog.tsx
rm -f components/NewSignatureRequestDialog.tsx
rm -f components/UseTemplateDialog.tsx
rm -f components/Form8879Dialog.tsx
rm -f components/ScheduleMeetingDialog.tsx
rm -f components/Header.tsx
rm -f components/Sidebar.tsx
rm -f components/CollapsedSidebar.tsx
rm -f components/BrandedButton.tsx
rm -f components/FilterPanel.tsx
rm -f components/BrandingColorReference.tsx
rm -f components/AddActionItemDialog.tsx
rm -f components/AddNoteDialog.tsx
rm -f components/TeamMemberProfile.tsx
rm -f components/TenantSelectionDialog.tsx

echo "Cleanup complete!"
EOF

chmod +x scripts/cleanup-old-files.sh
./scripts/cleanup-old-files.sh
```

### Step 9: Commit Changes
```bash
git add .
git commit -m "Reorganize file structure: separate account and app modules"
```

## New File Structure

```
/pages/
  /account/
    /login/
      - LoginView.tsx
      /components/
        - TenantSelectionDialog.tsx
    /forgot-password/
      - ForgotPasswordView.tsx
    /validate-2fa/
      - Validate2FAView.tsx

  /app/
    /dashboard/
      - DashboardView.tsx
    /clients/
      - ClientManagementView.tsx
      /components/ (client-specific)
      /tabs/ (client folder tabs)
    /documents/
      - IncomingDocumentsView.tsx
    /signatures/
      - SignaturesView.tsx
      - SignatureTemplatesView.tsx
      - NewTemplateView.tsx
      - UseTemplateView.tsx
      - UploadDocumentView.tsx
      - Form8879View.tsx
      /components/ (signature-specific)
    /calendar/
      - CalendarView.tsx
      /components/
    /chat/
      - ChatView.tsx
    /billing/
      - BillingView.tsx
    /client-portal/
      - ClientPortalView.tsx
    /settings/
      - SettingsView.tsx
      - MyAccountView.tsx
      - ChangePasswordView.tsx
      - CompanySettingsView.tsx
      - NavigationView.tsx
      - PlatformBrandingView.tsx
      /tabs/ (settings tabs)
    /help/
      - HelpView.tsx
    /notifications/
      - NotificationsView.tsx

/components/
  /layout/
    - Header.tsx
    - Sidebar.tsx
    - CollapsedSidebar.tsx
  /common/
    - ProtectedRoute.tsx
    - BrandedButton.tsx
    - FilterPanel.tsx
    - etc.
  /team/
    - TeamMemberProfile.tsx
    /tabs/
  /navigation/
    /tabs/
  /ui/ (unchanged)
  /figma/ (unchanged)
```

## Route Changes

### Old Routes
```typescript
/login → /account/login
/forgot-password → /account/forgot-password
/account/validate-2fa-auth → /account/validate-2fa
```

### New Import Paths
All view imports now come from `/pages/account/*` or `/pages/app/*`

## Troubleshooting

### Issue: Module not found errors everywhere
**Solution:** Run the fix-imports.py script or manually fix import depths

### Issue: Some components still import from old paths
**Solution:** Search and replace across the project:
```bash
# Find all files with old import patterns
grep -r "from '../views/" pages/
grep -r "from '../../views/" pages/
```

### Issue: Circular dependency warnings
**Solution:** Check that no components are importing from moved locations

### Issue: TypeScript errors about types
**Solution:** Ensure all .tsx files have proper exports and imports

## Verification Checklist

- [ ] All pages load without errors
- [ ] Login with tenant selection works
- [ ] 2FA flow works (if enabled)
- [ ] Navigation between pages works
- [ ] All dialogs and modals open correctly
- [ ] Client management features work
- [ ] Signature workflows work
- [ ] Settings pages work
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds: `npm run build`

## Need Help?

If you encounter issues:
1. Check the console for specific error messages
2. Verify import paths match the new structure
3. Ensure all files were copied correctly
4. Review the REORGANIZATION_GUIDE.txt for file locations
5. Check that routes file is updated

## Rollback Instructions

If something goes wrong:
```bash
git checkout backup-before-reorganization
```

Then review the changes and try again more carefully.
