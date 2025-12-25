import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Account Pages
import { LoginView } from '../pages/account/login/LoginView';
import { ForgotPasswordView } from '../pages/account/forgot-password/ForgotPasswordView';
import { Validate2FAView } from '../pages/account/validate-2fa/Validate2FAView';

// App Pages - Dashboard
import { DashboardView } from '../pages/app/dashboard/DashboardView';

// App Pages - Notifications
import { NotificationsView } from '../pages/app/notifications/NotificationsView';

// App Pages - Clients
import { ClientManagementView } from '../pages/app/clients/ClientManagementView';

// App Pages - Documents
import { IncomingDocumentsView } from '../pages/app/documents/IncomingDocumentsView';

// App Pages - Signatures
import { SignaturesView } from '../pages/app/signatures/SignaturesView';
import { SignatureTemplatesView } from '../pages/app/signatures/SignatureTemplatesView';
import { NewTemplateView } from '../pages/app/signatures/NewTemplateView';
import  UseTemplateView  from '../pages/app/signatures/UseTemplateView';
import { UploadDocumentView } from '../pages/app/signatures/UploadDocumentView';
import { Form8879View } from '../pages/app/signatures/Form8879View';

// App Pages - Calendar
import { CalendarView } from '../pages/app/calendar/CalendarView';

// App Pages - Chat
import { ChatView } from '../pages/app/chat/ChatView';

// App Pages - Billing
import { BillingView } from '../pages/app/billing/BillingView';

// App Pages - Client Portal
import { ClientPortalView } from '../pages/app/client-portal/ClientPortalView';

// App Pages - Settings
import { SettingsView } from '../pages/app/settings/SettingsView';
import { CompanySettingsView } from '../pages/app/settings/CompanySettingsView';
import { NavigationView } from '../pages/app/settings/NavigationView';
import { PlatformBrandingView } from '../pages/app/settings/PlatformBrandingView';
import { MyAccountView } from '../pages/app/settings/MyAccountView';
import { ChangePasswordView } from '../pages/app/settings/ChangePasswordView';

// App Pages - Help
import { HelpView } from '../pages/app/help/HelpView';

export function AppRoutes() {
  return (
    <Routes>
      {/* Account routes (public) */}
      <Route path="/account/login" element={<LoginView />} />
      <Route path="/account/forgot-password" element={<ForgotPasswordView />} />
      <Route path="/account/validate-2fa" element={<Validate2FAView />} />

      {/* Legacy login route redirect */}
      <Route path="/login" element={<Navigate to="/account/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/account/forgot-password" replace />} />

      {/* Protected app routes */}
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
        path="/clients"
        element={
          <ProtectedRoute permissions={['Pages.Dashboard', 'Pages.Firm.Client']}>
            <ClientManagementView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incoming-documents"
        element={
          <ProtectedRoute permissions="Pages.Documents">
            <IncomingDocumentsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatures"
        element={
          <ProtectedRoute permissions="Pages.Signatures">
            <SignaturesView />
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
            <NewTemplateView />
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
            <BillingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-portal"
        element={
          <ProtectedRoute>
            <ClientPortalView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <SettingsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-settings"
        element={
          <ProtectedRoute permissions="Pages.Settings">
            <CompanySettingsView />
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
        path="/platform-branding"
        element={
          <ProtectedRoute permissions="Pages.PlatformBranding">
            <PlatformBrandingView />
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

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 - Redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
