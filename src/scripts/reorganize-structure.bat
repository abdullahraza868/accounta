@echo off
echo Starting file structure reorganization...
echo ===========================================
echo.

REM Create new directory structure
echo Creating new directory structure...

REM Account pages
mkdir pages\account\forgot-password 2>nul
mkdir pages\account\validate-2fa 2>nul

REM App pages
mkdir pages\app\dashboard 2>nul
mkdir pages\app\notifications 2>nul
mkdir pages\app\clients\components 2>nul
mkdir pages\app\clients\tabs 2>nul
mkdir pages\app\documents 2>nul
mkdir pages\app\signatures\components 2>nul
mkdir pages\app\calendar\components 2>nul
mkdir pages\app\chat 2>nul
mkdir pages\app\billing 2>nul
mkdir pages\app\client-portal 2>nul
mkdir pages\app\settings\tabs 2>nul
mkdir pages\app\help 2>nul

REM Component reorganization
mkdir components\layout 2>nul
mkdir components\common 2>nul
mkdir components\team\tabs 2>nul
mkdir components\navigation\tabs 2>nul

echo ✓ Directory structure created
echo.

REM Copy files to new locations

REM Account pages
echo Copying account pages...
copy components\views\ForgotPasswordView.tsx pages\account\forgot-password\ >nul 2>&1
copy components\views\Validate2FAView.tsx pages\account\validate-2fa\ >nul 2>&1

REM App pages - Dashboard
echo Copying dashboard...
copy components\views\DashboardView.tsx pages\app\dashboard\ >nul 2>&1

REM App pages - Notifications
echo Copying notifications...
copy components\views\NotificationsView.tsx pages\app\notifications\ >nul 2>&1

REM App pages - Clients
echo Copying client pages...
copy components\views\ClientManagementView.tsx pages\app\clients\ >nul 2>&1
copy components\ClientList.tsx pages\app\clients\components\ >nul 2>&1
copy components\ClientFolder.tsx pages\app\clients\components\ >nul 2>&1
copy components\AddTeamMember.tsx pages\app\clients\components\ >nul 2>&1
copy components\ClientNameWithLink.tsx pages\app\clients\components\ >nul 2>&1
copy components\ClientGroupsDialog.tsx pages\app\clients\components\ >nul 2>&1
copy components\ManageClientGroupsDialog.tsx pages\app\clients\components\ >nul 2>&1

REM Client folder tabs
echo Copying client tabs...
copy components\folder-tabs\*.tsx pages\app\clients\tabs\ >nul 2>&1

REM App pages - Documents
echo Copying documents...
copy components\views\IncomingDocumentsView.tsx pages\app\documents\ >nul 2>&1

REM App pages - Signatures
echo Copying signatures...
copy components\views\SignaturesView.tsx pages\app\signatures\ >nul 2>&1
copy components\views\SignatureTemplatesView.tsx pages\app\signatures\ >nul 2>&1
copy components\views\NewTemplateView.tsx pages\app\signatures\ >nul 2>&1
copy components\views\UseTemplateView.tsx pages\app\signatures\ >nul 2>&1
copy components\views\UploadDocumentView.tsx pages\app\signatures\ >nul 2>&1
copy components\views\Form8879View.tsx pages\app\signatures\ >nul 2>&1
copy components\NewSignatureRequestDialog.tsx pages\app\signatures\components\ >nul 2>&1
copy components\UseTemplateDialog.tsx pages\app\signatures\components\ >nul 2>&1
copy components\Form8879Dialog.tsx pages\app\signatures\components\ >nul 2>&1

REM App pages - Calendar
echo Copying calendar...
copy components\views\CalendarView.tsx pages\app\calendar\ >nul 2>&1
copy components\ScheduleMeetingDialog.tsx pages\app\calendar\components\ >nul 2>&1

REM App pages - Chat
echo Copying chat...
copy components\views\ChatView.tsx pages\app\chat\ >nul 2>&1

REM App pages - Billing
echo Copying billing...
copy components\views\BillingView.tsx pages\app\billing\ >nul 2>&1

REM App pages - Client Portal
echo Copying client portal...
copy components\views\ClientPortalView.tsx pages\app\client-portal\ >nul 2>&1

REM App pages - Settings
echo Copying settings...
copy components\views\SettingsView.tsx pages\app\settings\ >nul 2>&1
copy components\views\MyAccountView.tsx pages\app\settings\ >nul 2>&1
copy components\views\ChangePasswordView.tsx pages\app\settings\ >nul 2>&1
copy components\views\CompanySettingsView.tsx pages\app\settings\ >nul 2>&1
copy components\views\NavigationView.tsx pages\app\settings\ >nul 2>&1
copy components\views\PlatformBrandingView.tsx pages\app\settings\ >nul 2>&1

REM Settings tabs
echo Copying settings tabs...
copy components\company-settings-tabs\*.tsx pages\app\settings\tabs\ >nul 2>&1

REM App pages - Help
echo Copying help...
copy components\views\HelpView.tsx pages\app\help\ >nul 2>&1

REM Layout components
echo Copying layout components...
copy components\Header.tsx components\layout\ >nul 2>&1
copy components\Sidebar.tsx components\layout\ >nul 2>&1
copy components\CollapsedSidebar.tsx components\layout\ >nul 2>&1

REM Common components
echo Copying common components...
copy components\BrandedButton.tsx components\common\ >nul 2>&1
copy components\FilterPanel.tsx components\common\ >nul 2>&1
copy components\BrandingColorReference.tsx components\common\ >nul 2>&1
copy components\AddActionItemDialog.tsx components\common\ >nul 2>&1
copy components\AddNoteDialog.tsx components\common\ >nul 2>&1

REM Team components
echo Copying team components...
copy components\TeamMemberProfile.tsx components\team\ >nul 2>&1
copy components\team-member-tabs\*.tsx components\team\tabs\ >nul 2>&1

REM Navigation components
echo Copying navigation components...
copy components\navigation-tabs\*.tsx components\navigation\tabs\ >nul 2>&1

echo.
echo ✓ Files copied to new locations
echo.
echo ===========================================
echo IMPORTANT: Next Steps
echo ===========================================
echo 1. Review the new structure in \pages and \components
echo 2. Update import paths in all moved files
echo 3. Replace \routes\AppRoutes.tsx with \routes\AppRoutes.new.tsx
echo 4. Test the application thoroughly
echo 5. Once verified, run cleanup script to remove old files
echo.
echo To update AppRoutes.tsx, run:
echo   move routes\AppRoutes.tsx routes\AppRoutes.old.tsx
echo   move routes\AppRoutes.new.tsx routes\AppRoutes.tsx
echo.
echo Reorganization complete!
pause
