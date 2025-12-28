import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Auth & Onboarding Pages
import { LoginView } from '../components/views/LoginView';
import { ForgotPasswordView } from '../components/views/ForgotPasswordView';
import { Validate2FAView } from '../components/views/Validate2FAView';
import { LoginWorkflowsView } from '../components/views/LoginWorkflowsView';
import { TenantNotFoundView } from '../components/views/TenantNotFoundView';
import { FirstLoginSetPasswordView } from '../components/views/FirstLoginSetPasswordView';
import { FirstLoginAddPhoneView } from '../components/views/FirstLoginAddPhoneView';
import { LinkExpiredView } from '../components/views/LinkExpiredView';
import { PrivacyPolicyView } from '../components/views/PrivacyPolicyView';
import { TermsAndConditionsView } from '../components/views/TermsAndConditionsView';

// App Pages
import { DashboardView } from '../components/views/DashboardView';
import { NotificationsView } from '../components/views/NotificationsView';
import { NotificationsManagementView } from '../components/views/NotificationsManagementView';
import { ClientManagementView } from '../components/views/ClientManagementView';
import { CreateClientView } from '../components/views/CreateClientView';
import { ImportClientsView } from '../components/views/ImportClientsView';
import { IncomingDocumentsViewWrapper } from '../components/views/IncomingDocumentsViewWrapper';
import { DocumentCenterView } from '../components/views/DocumentCenterView';
import { DocumentUploadView } from '../components/views/DocumentUploadView';
import { SignaturesView } from '../components/views/SignaturesView';
import { SignaturesViewSimple } from '../components/views/SignaturesViewSimple';
import { SignaturesViewSplit } from '../components/views/SignaturesViewSplit';
import { SignatureTemplatesView } from '../components/views/SignatureTemplatesView';
import { AddSignatureTemplateView } from '../components/views/AddSignatureTemplateView';
import UseTemplateView from '../components/views/UseTemplateView';
import { UploadDocumentView } from '../components/views/UploadDocumentView';
import { EditSignatureView } from '../components/views/EditSignatureView';
import { Form8879VerifyRecipientsView } from '../components/views/Form8879VerifyRecipientsView';
import { Form8879View } from '../components/views/Form8879View';
import { CalendarView } from '../components/views/CalendarView';
import { ChatView } from '../components/views/ChatView';
import { ProjectsView } from '../components/views/ProjectsView';
import { ProjectTemplatesView } from '../components/views/ProjectTemplatesView';
import { TasksView } from '../components/views/TasksView';
import { BillingView } from '../components/views/BillingView';
import { BillingViewSplit } from '../components/views/BillingViewSplit';
import { BillingViewCards } from '../components/views/BillingViewCards';
import { BillingReportsView } from '../components/views/BillingReportsView';
import { CreateRecurringInvoiceView } from '../components/views/CreateRecurringInvoiceView';
import { SubscriptionsView } from '../components/views/SubscriptionsView';
import { CreateSubscriptionView } from '../components/views/CreateSubscriptionView';
import { ManageInvoiceTemplatesView } from '../components/views/ManageInvoiceTemplatesView';
import { EditInvoiceTemplateView } from '../components/views/EditInvoiceTemplateView';
import { LineItemTemplateFormView } from '../components/views/LineItemTemplateFormView';
import { LineItemTemplatesView } from '../components/views/LineItemTemplatesView';
import { AddLineItemTemplateView } from '../components/views/AddLineItemTemplateView';
import { RepresentationsView } from '../components/views/RepresentationsView';
import { OrganizerView } from '../components/views/OrganizerView';
import { FirmStatsView } from '../components/views/FirmStatsView';
import { SettingsView } from '../components/views/SettingsView';
import { HelpView } from '../components/views/HelpView';
import { ClientFolderView } from '../components/views/ClientFolderView';
import { NotificationPreferencesView } from '../components/views/NotificationPreferencesView';
import { NotificationToastDemo } from '../components/views/NotificationToastDemo';
import { FolderManagementView } from '../components/views/FolderManagementView';
import { NavigationView } from '../components/views/NavigationView';

// Client Portal Pages
import ClientPortalLogin from '../pages/client-portal/login/ClientPortalLogin';
import ClientPortalDashboard from '../pages/client-portal/dashboard/ClientPortalDashboard';
import HouseholdInvitationResponse from '../pages/client-portal/household/HouseholdInvitationResponse';
import { ClientPortalView } from '../components/views/ClientPortalView';
import ClientPortalProfile from '../pages/client-portal/profile/ClientPortalProfile';
import ClientPortalDocuments from '../pages/client-portal/documents/ClientPortalDocuments';
import ClientPortalSignatures from '../pages/client-portal/signatures/ClientPortalSignatures';
import ClientPortalInvoices from '../pages/client-portal/invoices/ClientPortalInvoices';
import ClientPortalAccountAccess from '../pages/client-portal/account-access/ClientPortalAccountAccess';
import AddUser from '../pages/client-portal/account-access/AddUser';
import ClientPortalHousehold from '../pages/client-portal/settings/ClientPortalHousehold';
import { SecureUploadView } from '../pages/client-portal/SecureUploadView';

// Settings Views
import { ApplicationSettingsView } from '../components/views/ApplicationSettingsView';
import { CompanySettingsView } from '../components/views/CompanySettingsView';
import { PlatformBrandingView } from '../components/views/PlatformBrandingView';
import { EmailCustomizationView } from '../pages/app/settings/EmailCustomizationView';
import { PaymentReminderStrategyView } from '../components/views/PaymentReminderStrategyView';
import { PaymentRetryStrategyView } from '../components/views/PaymentRetryStrategyView';
import { InvoiceReminderStrategyView } from '../components/views/InvoiceReminderStrategyView';
import { SubscriptionSettingsView } from '../components/views/SubscriptionSettingsView';
import { BillingActivityLogView } from '../components/views/BillingActivityLogView';
import { BillingAutomationDetailsView } from '../components/views/BillingAutomationDetailsView';
import { MyAccountView } from '../pages/app/settings/MyAccountView';
import { NotificationSettingsView } from '../components/views/NotificationSettingsView';
import { NotificationDemoView } from '../components/views/NotificationDemoView';
import { NotificationToastDemoView } from '../components/views/NotificationToastDemoView';
import { NotificationUsageGuideView } from '../components/views/NotificationUsageGuideView';
import { NotificationQuickReferenceView } from '../components/views/NotificationQuickReferenceView';
import { ChangePasswordView } from '../components/views/ChangePasswordView';

// New Settings Architecture
import { SettingsLandingView } from '../components/views/settings/SettingsLandingView';
import { CompanySettingsView as NewCompanySettingsView } from '../components/views/settings/CompanySettingsView';
import { ClientPortalSettingsView } from '../components/views/settings/ClientPortalSettingsView';
import { SecurityComplianceView } from '../components/views/settings/SecurityComplianceView';
import { ScheduleSettingsView } from '../components/views/settings/ScheduleSettingsView';
import { DashboardModulesView } from '../components/views/settings/DashboardModulesView';

// Project and Invoice Views
import { ProjectDetailView } from '../components/views/ProjectDetailView';
import { ProjectActivityLogView } from '../components/views/ProjectActivityLogView';
import { RequestDocumentsView } from '../components/views/RequestDocumentsView';
import { WorkflowEditorView } from '../components/views/WorkflowEditorView';
import { AddInvoiceView } from '../components/views/AddInvoiceView';
import { EditInvoiceView } from '../components/views/EditInvoiceView';
import AgingSystemTestView from '../components/views/AgingSystemTestView';

// Onboarding and Workflows
import { DocumentDownloadWorkflowView } from '../components/views/DocumentDownloadWorkflowView';
import { DocumentUploadWorkflowView } from '../components/views/DocumentUploadWorkflowView';
import { WorkflowTestingView } from '../components/views/WorkflowTestingView';
import { CustomLinkView } from '../components/views/CustomLinkView';

// Email
import { EmailPage } from '../pages/app/EmailPage';

// New Pages
import { UtilizationAnalyticsView } from '../components/views/UtilizationAnalyticsView';
import { PayrollReportView } from '../components/views/PayrollReportView';
import { TeamSettingsView } from '../components/views/TeamSettingsView';
import { TextMessagesView } from '../components/views/TextMessagesView';
import { StartMyTaxListView } from '../components/views/StartMyTaxListView';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - Firm Side */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/forgot-password" element={<ForgotPasswordView />} />
      <Route path="/account/validate-2fa-auth" element={<Validate2FAView />} />
      
      {/* Login Workflows - Testing/Demo */}
      <Route path="/workflows/login" element={<LoginWorkflowsView />} />
      <Route path="/tenant-not-found" element={<TenantNotFoundView />} />
      <Route path="/workflows/first-login" element={<FirstLoginSetPasswordView />} />
      <Route path="/workflows/first-login-add-phone" element={<FirstLoginAddPhoneView />} />
      <Route path="/workflows/link-expired" element={<LinkExpiredView />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsView />} />

      {/* Public routes - Client Portal */}
      <Route path="/client-portal/login" element={<ClientPortalLogin />} />
      <Route path="/client-portal/household/invitation" element={<HouseholdInvitationResponse />} />
      <Route path="/secure-upload/:clientId/:token" element={<SecureUploadView />} />
      <Route path="/document-upload" element={<DocumentUploadView />} />
      <Route path="/workflows/upload" element={<DocumentUploadWorkflowView />} />
      <Route path="/workflows/download" element={<DocumentDownloadWorkflowView />} />
      <Route path="/workflows/testing" element={<WorkflowTestingView />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute permissions="Pages.Dashboard">
            <DashboardView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/management"
        element={
          <ProtectedRoute>
            <NotificationsManagementView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email"
        element={
          <ProtectedRoute>
            <EmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute permissions={['Pages.Dashboard', 'Pages.Firm.Client']}>
            <ClientManagementView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/add"
        element={
          <ProtectedRoute permissions={['Pages.Dashboard', 'Pages.Firm.Client']}>
            <CreateClientView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/import"
        element={
          <ProtectedRoute permissions={['Pages.Dashboard', 'Pages.Firm.Client']}>
            <ImportClientsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incoming-documents"
        element={
          <ProtectedRoute permissions="Pages.Documents">
            <IncomingDocumentsViewWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/document-center"
        element={
          <ProtectedRoute permissions="Pages.Documents">
            <DocumentCenterView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignaturesViewSimple />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/table"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignaturesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/split"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignaturesViewSplit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/simple"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignaturesViewSimple />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature-templates"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignatureTemplatesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature-templates/new"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <AddSignatureTemplateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature-templates/add"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <AddSignatureTemplateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature-templates/use"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <UseTemplateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/upload-document"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <UploadDocumentView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/edit"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <EditSignatureView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/form-8879/verify"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <Form8879VerifyRecipientsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures/form-8879"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <Form8879View />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute permissions="Pages.Calendar">
            <CalendarView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute permissions="Pages.Chat">
            <ChatView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <BillingReportsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/invoices"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <BillingViewCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/table"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <BillingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/split"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <BillingViewSplit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/cards"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <BillingViewCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/recurring/create"
        element={
          <ProtectedRoute>
            <CreateRecurringInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-invoice-templates"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <ManageInvoiceTemplatesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-invoice-template"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <EditInvoiceTemplateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-line-item-template"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <LineItemTemplateFormView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal-settings"
        element={
          <ProtectedRoute>
            <ClientPortalView />
          </ProtectedRoute>
        }
      />
      
      {/* Client Portal routes (protected for client users) */}
      <Route
        path="/client-portal/dashboard"
        element={
          <ProtectedRoute>
            <ClientPortalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/profile"
        element={
          <ProtectedRoute>
            <ClientPortalProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/documents"
        element={
          <ProtectedRoute>
            <ClientPortalDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/signatures"
        element={
          <ProtectedRoute>
            <ClientPortalSignatures />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/invoices"
        element={
          <ProtectedRoute>
            <ClientPortalInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/account-access"
        element={
          <ProtectedRoute>
            <ClientPortalAccountAccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/account-access/add-user"
        element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal/settings/household"
        element={
          <ProtectedRoute>
            <ClientPortalHousehold />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <SettingsLandingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/company"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <NewCompanySettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/company/:section"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <NewCompanySettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/company/:section/:subsection"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <NewCompanySettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/client-portal"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <ClientPortalSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/client-portal/:section"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <ClientPortalSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/security"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <SecurityComplianceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/security/:section"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <SecurityComplianceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/schedule"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <ScheduleSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/dashboard-modules"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <DashboardModulesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/application-settings"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <ApplicationSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navigation"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <NavigationView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/navigation"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <NavigationView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform-branding"
        element={
          <ProtectedRoute permissions="Pages.PlatformBranding">
            <PlatformBrandingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email-customization"
        element={
          <ProtectedRoute permissions="Pages.EmailCustomization">
            <EmailCustomizationView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-reminder-strategy"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <PaymentReminderStrategyView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-retry-strategy"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <PaymentRetryStrategyView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice-reminder-strategy"
        element={
          <ProtectedRoute permissions="Pages.Billing">
            <InvoiceReminderStrategyView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription-settings"
        element={
          <ProtectedRoute>
            <SubscriptionSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing-activity-log"
        element={
          <ProtectedRoute>
            <BillingActivityLogView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing-automation-details"
        element={
          <ProtectedRoute>
            <BillingAutomationDetailsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-account"
        element={
          <ProtectedRoute>
            <MyAccountView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-settings"
        element={
          <ProtectedRoute>
            <NotificationSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-demo"
        element={
          <ProtectedRoute>
            <NotificationDemoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-toast-demo"
        element={
          <ProtectedRoute>
            <NotificationToastDemoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-usage-guide"
        element={
          <ProtectedRoute>
            <NotificationUsageGuideView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-quick-reference"
        element={
          <ProtectedRoute>
            <NotificationQuickReferenceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <HelpView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/activity-log"
        element={
          <ProtectedRoute>
            <ProjectActivityLogView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/request-documents"
        element={
          <ProtectedRoute>
            <RequestDocumentsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/edit/:workflowId"
        element={
          <ProtectedRoute>
            <WorkflowEditorView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows/create"
        element={
          <ProtectedRoute>
            <WorkflowEditorView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/add-invoice"
        element={
          <ProtectedRoute>
            <AddInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/add"
        element={
          <ProtectedRoute>
            <AddInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/add-invoice"
        element={
          <ProtectedRoute>
            <AddInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/edit-invoice/:invoiceId"
        element={
          <ProtectedRoute>
            <EditInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/edit/:invoiceId"
        element={
          <ProtectedRoute>
            <EditInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/recurring/create"
        element={
          <ProtectedRoute>
            <CreateRecurringInvoiceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/create"
        element={
          <ProtectedRoute>
            <CreateSubscriptionView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aging-system-test"
        element={
          <ProtectedRoute>
            <AgingSystemTestView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/reports"
        element={
          <ProtectedRoute>
            <BillingReportsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/folders"
        element={
          <ProtectedRoute>
            <FolderManagementView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/custom-link"
        element={
          <ProtectedRoute>
            <CustomLinkView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email"
        element={
          <ProtectedRoute>
            <EmailPage />
          </ProtectedRoute>
        }
      />

      {/* New Pages */}
      <Route
        path="/utilization-analytics"
        element={
          <ProtectedRoute>
            <UtilizationAnalyticsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll-report"
        element={
          <ProtectedRoute>
            <PayrollReportView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-settings"
        element={
          <ProtectedRoute>
            <TeamSettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/text-messages"
        element={
          <ProtectedRoute>
            <TextMessagesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/start-my-tax-list"
        element={
          <ProtectedRoute>
            <StartMyTaxListView />
          </ProtectedRoute>
        }
      />

      {/* Default route - redirect to settings for development */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/settings" replace />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Navigate to="/settings" replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}