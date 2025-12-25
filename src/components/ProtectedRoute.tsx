import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  permissions?: string | string[];
  requireAll?: boolean; // If true, require all permissions. If false (default), require any permission
};

export function ProtectedRoute({ children, permissions, requireAll = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAllPermissions, hasAnyPermission, user } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', {
    path: location.pathname,
    isLoading,
    isAuthenticated,
    user: user?.emailAddress
  });

  if (isLoading) {
    // Show loading spinner while checking auth status
    console.warn('⏳ ProtectedRoute: Still loading auth...', location.pathname);
    return (
      <div 
        className="flex items-center justify-center min-h-screen" 
        style={{ background: 'var(--backgroundColor, #f9fafb)' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--primaryColor, #7c3aed)' }}
          ></div>
          <p style={{ color: 'var(--secondaryTextColor, #6b7280)' }}>Loading...</p>
          <p className="text-xs mt-2" style={{ color: 'var(--secondaryTextColor, #6b7280)' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on which portal they're trying to access
    const isClientPortalRoute = location.pathname.startsWith('/client-portal');
    const loginPath = isClientPortalRoute ? '/client-portal/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check permissions if provided
  if (permissions) {
    let hasRequiredPermission = false;

    if (typeof permissions === 'string') {
      hasRequiredPermission = hasPermission(permissions);
    } else if (Array.isArray(permissions)) {
      hasRequiredPermission = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    if (!hasRequiredPermission) {
      // Show permission denied page
      return (
        <div 
          className="flex items-center justify-center min-h-screen p-4"
          style={{ background: 'var(--backgroundColor, #f9fafb)' }}
        >
          <div className="text-center max-w-md">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(var(--dangerColorBtnRgb, 239, 68, 68), 0.1)' }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: 'var(--dangerColorBtn, #ef4444)' }} />
            </div>
            <h1 
              className="text-2xl font-semibold mb-2"
              style={{ color: 'var(--primaryTextColor, #111827)' }}
            >
              Access Denied
            </h1>
            <p 
              className="mb-6"
              style={{ color: 'var(--secondaryTextColor, #6b7280)' }}
            >
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                background: 'var(--primaryColorBtn, #7c3aed)',
                color: 'var(--primaryTextColorBtn, #ffffff)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primaryHoverColorBtn, #6d28d9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primaryColorBtn, #7c3aed)';
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
