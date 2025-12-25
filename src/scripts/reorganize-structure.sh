#!/bin/bash

# File Structure Reorganization Script
# This script reorganizes the project structure to separate account and app pages

echo "Starting file structure reorganization..."
echo "==========================================="

# Create new directory structure
echo "Creating new directory structure..."

# Account pages
mkdir -p pages/account/forgot-password
mkdir -p pages/account/validate-2fa

# App pages
mkdir -p pages/app/dashboard
mkdir -p pages/app/notifications
mkdir -p pages/app/clients/components
mkdir -p pages/app/clients/tabs
mkdir -p pages/app/documents
mkdir -p pages/app/signatures/components
mkdir -p pages/app/calendar/components
mkdir -p pages/app/chat
mkdir -p pages/app/billing
mkdir -p pages/app/client-portal
mkdir -p pages/app/settings/tabs
mkdir -p pages/app/help

# Component reorganization
mkdir -p components/layout
mkdir -p components/common
mkdir -p components/team/tabs
mkdir -p components/navigation/tabs

echo "✓ Directory structure created"

# Copy files to new locations (COPY first, then DELETE old ones after verification)

# Account pages
echo "Copying account pages..."
cp components/views/ForgotPasswordView.tsx pages/account/forgot-password/ 2>/dev/null || echo "ForgotPasswordView.tsx not found"
cp components/views/Validate2FAView.tsx pages/account/validate-2fa/ 2>/dev/null || echo "Validate2FAView.tsx not found"

# App pages - Dashboard
echo "Copying dashboard..."
cp components/views/DashboardView.tsx pages/app/dashboard/ 2>/dev/null || echo "DashboardView.tsx not found"

# App pages - Notifications
echo "Copying notifications..."
cp components/views/NotificationsView.tsx pages/app/notifications/ 2>/dev/null || echo "NotificationsView.tsx not found"

# App pages - Clients
echo "Copying client pages..."
cp components/views/ClientManagementView.tsx pages/app/clients/ 2>/dev/null || echo "ClientManagementView.tsx not found"
cp components/ClientList.tsx pages/app/clients/components/ 2>/dev/null || echo "ClientList.tsx not found"
cp components/ClientFolder.tsx pages/app/clients/components/ 2>/dev/null || echo "ClientFolder.tsx not found"
cp components/AddTeamMember.tsx pages/app/clients/components/ 2>/dev/null || echo "AddTeamMember.tsx not found"
cp components/ClientNameWithLink.tsx pages/app/clients/components/ 2>/dev/null || echo "ClientNameWithLink.tsx not found"
cp components/ClientGroupsDialog.tsx pages/app/clients/components/ 2>/dev/null || echo "ClientGroupsDialog.tsx not found"
cp components/ManageClientGroupsDialog.tsx pages/app/clients/components/ 2>/dev/null || echo "ManageClientGroupsDialog.tsx not found"

# Client folder tabs
echo "Copying client tabs..."
cp components/folder-tabs/*.tsx pages/app/clients/tabs/ 2>/dev/null || echo "Folder tabs not found"

# App pages - Documents
echo "Copying documents..."
cp components/views/IncomingDocumentsView.tsx pages/app/documents/ 2>/dev/null || echo "IncomingDocumentsView.tsx not found"

# App pages - Signatures
echo "Copying signatures..."
cp components/views/SignaturesView.tsx pages/app/signatures/ 2>/dev/null || echo "SignaturesView.tsx not found"
cp components/views/SignatureTemplatesView.tsx pages/app/signatures/ 2>/dev/null || echo "SignatureTemplatesView.tsx not found"
cp components/views/NewTemplateView.tsx pages/app/signatures/ 2>/dev/null || echo "NewTemplateView.tsx not found"
cp components/views/UseTemplateView.tsx pages/app/signatures/ 2>/dev/null || echo "UseTemplateView.tsx not found"
cp components/views/UploadDocumentView.tsx pages/app/signatures/ 2>/dev/null || echo "UploadDocumentView.tsx not found"
cp components/views/Form8879View.tsx pages/app/signatures/ 2>/dev/null || echo "Form8879View.tsx not found"
cp components/NewSignatureRequestDialog.tsx pages/app/signatures/components/ 2>/dev/null || echo "NewSignatureRequestDialog.tsx not found"
cp components/UseTemplateDialog.tsx pages/app/signatures/components/ 2>/dev/null || echo "UseTemplateDialog.tsx not found"
cp components/Form8879Dialog.tsx pages/app/signatures/components/ 2>/dev/null || echo "Form8879Dialog.tsx not found"

# App pages - Calendar
echo "Copying calendar..."
cp components/views/CalendarView.tsx pages/app/calendar/ 2>/dev/null || echo "CalendarView.tsx not found"
cp components/ScheduleMeetingDialog.tsx pages/app/calendar/components/ 2>/dev/null || echo "ScheduleMeetingDialog.tsx not found"

# App pages - Chat
echo "Copying chat..."
cp components/views/ChatView.tsx pages/app/chat/ 2>/dev/null || echo "ChatView.tsx not found"

# App pages - Billing
echo "Copying billing..."
cp components/views/BillingView.tsx pages/app/billing/ 2>/dev/null || echo "BillingView.tsx not found"

# App pages - Client Portal
echo "Copying client portal..."
cp components/views/ClientPortalView.tsx pages/app/client-portal/ 2>/dev/null || echo "ClientPortalView.tsx not found"

# App pages - Settings
echo "Copying settings..."
cp components/views/SettingsView.tsx pages/app/settings/ 2>/dev/null || echo "SettingsView.tsx not found"
cp components/views/MyAccountView.tsx pages/app/settings/ 2>/dev/null || echo "MyAccountView.tsx not found"
cp components/views/ChangePasswordView.tsx pages/app/settings/ 2>/dev/null || echo "ChangePasswordView.tsx not found"
cp components/views/CompanySettingsView.tsx pages/app/settings/ 2>/dev/null || echo "CompanySettingsView.tsx not found"
cp components/views/NavigationView.tsx pages/app/settings/ 2>/dev/null || echo "NavigationView.tsx not found"
cp components/views/PlatformBrandingView.tsx pages/app/settings/ 2>/dev/null || echo "PlatformBrandingView.tsx not found"

# Settings tabs
echo "Copying settings tabs..."
cp components/company-settings-tabs/*.tsx pages/app/settings/tabs/ 2>/dev/null || echo "Company settings tabs not found"

# App pages - Help
echo "Copying help..."
cp components/views/HelpView.tsx pages/app/help/ 2>/dev/null || echo "HelpView.tsx not found"

# Layout components
echo "Copying layout components..."
cp components/Header.tsx components/layout/ 2>/dev/null || echo "Header.tsx not found"
cp components/Sidebar.tsx components/layout/ 2>/dev/null || echo "Sidebar.tsx not found"
cp components/CollapsedSidebar.tsx components/layout/ 2>/dev/null || echo "CollapsedSidebar.tsx not found"

# Common components
echo "Copying common components..."
cp components/BrandedButton.tsx components/common/ 2>/dev/null || echo "BrandedButton.tsx not found"
cp components/FilterPanel.tsx components/common/ 2>/dev/null || echo "FilterPanel.tsx not found"
cp components/BrandingColorReference.tsx components/common/ 2>/dev/null || echo "BrandingColorReference.tsx not found"
cp components/AddActionItemDialog.tsx components/common/ 2>/dev/null || echo "AddActionItemDialog.tsx not found"
cp components/AddNoteDialog.tsx components/common/ 2>/dev/null || echo "AddNoteDialog.tsx not found"

# Team components
echo "Copying team components..."
cp components/TeamMemberProfile.tsx components/team/ 2>/dev/null || echo "TeamMemberProfile.tsx not found"
cp components/team-member-tabs/*.tsx components/team/tabs/ 2>/dev/null || echo "Team member tabs not found"

# Navigation components
echo "Copying navigation components..."
cp components/navigation-tabs/*.tsx components/navigation/tabs/ 2>/dev/null || echo "Navigation tabs not found"

echo ""
echo "✓ Files copied to new locations"
echo ""
echo "==========================================="
echo "IMPORTANT: Next Steps"
echo "==========================================="
echo "1. Review the new structure in /pages and /components"
echo "2. Update import paths in all moved files"
echo "3. Replace /routes/AppRoutes.tsx with /routes/AppRoutes.new.tsx"
echo "4. Test the application thoroughly"
echo "5. Once verified, run cleanup script to remove old files"
echo ""
echo "To update AppRoutes.tsx, run:"
echo "  mv routes/AppRoutes.tsx routes/AppRoutes.old.tsx"
echo "  mv routes/AppRoutes.new.tsx routes/AppRoutes.tsx"
echo ""
echo "Reorganization complete!"
