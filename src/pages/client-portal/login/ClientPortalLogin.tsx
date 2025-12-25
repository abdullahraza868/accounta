import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ClientPortalLogin() {
  const navigate = useNavigate();
  const { primaryColor, logoUrl } = useBranding();
  const { setAuthData } = useAuth();
  const [email, setEmail] = useState('client@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock login - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password
      if (email && password) {
        // Store client portal user data
        // This is different from admin users who have grantedPermissions
        const clientUser = {
          id: 1,
          userName: email,
          name: 'Client',
          surname: 'User',
          emailAddress: email,
          role: 'client', // Critical marker for WATCHDOG to detect client users
          // Note: No grantedPermissions array - this distinguishes client from admin
        };
        
        const mockToken = 'client_portal_token_' + Date.now();
        
        // Use AuthContext to properly set auth state
        setAuthData(mockToken, clientUser);
        
        toast.success('Welcome to the client portal!');
        navigate('/client-portal/dashboard');
      } else {
        toast.error('Please enter both email and password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-12 w-auto mx-auto mb-4"
            />
          ) : (
            <div
              className="h-12 w-12 rounded-lg mx-auto mb-4"
              style={{ backgroundColor: primaryColor }}
            />
          )}
          <h1 className="text-2xl">Client Portal</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm hover:underline"
                style={{ color: primaryColor }}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Need help accessing your account?{' '}
              <button
                type="button"
                className="hover:underline"
                style={{ color: primaryColor }}
              >
                Contact support
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Are you a firm administrator?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm hover:underline transition-all"
              style={{ color: primaryColor }}
            >
              <Shield className="w-4 h-4" />
              Go to Admin Login →
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Your Firm Name. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
