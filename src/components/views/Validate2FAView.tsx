import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export function Validate2FAView() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { setAuthData } = useAuth();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get stored email from localStorage
    const email = localStorage.getItem('userEmail');
    if (!email) {
      // If no email stored, redirect back to login
      navigate('/login');
      return;
    }
    setUserEmail(email);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to verify 2FA code
      // const result = await apiService.verify2FACode({
      //   code: code,
      //   email: userEmail,
      //   provider: localStorage.getItem('userAuthProvider') || 'Default'
      // });

      // Mock successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUser = {
        id: 1,
        userName: localStorage.getItem('userName') || userEmail,
        name: 'John',
        surname: 'Doe',
        emailAddress: userEmail,
        grantedPermissions: [
          'Pages.Dashboard',
          'Pages.Firm.Client',
          'Pages.Users',
          'Pages.Signatures',
          'Pages.Documents',
          'Pages.Billing',
          'Pages.Chat',
          'Pages.Settings',
          'Pages.PlatformBranding'
        ]
      };

      setAuthData(mockToken, mockUser);

      // Clear temporary 2FA data
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAuthProvider');
      localStorage.removeItem('userName');

      toast.success('Successfully logged in!');
      navigate('/clients', { replace: true });
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Replace with actual API call to resend code
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div 
      className="h-screen flex items-center justify-center p-4"
      style={{ background: branding.colors.loginBackground }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ 
                background: branding.colors.primaryButton,
                boxShadow: `0 20px 40px -10px ${branding.colors.primaryButton}40`,
              }}
            >
              <Shield className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
            </div>
          </div>
          <h1 
            className="mb-2 text-3xl tracking-tight"
            style={{ color: branding.colors.headingText }}
          >
            Two-Factor Authentication
          </h1>
          <p 
            className="text-base"
            style={{ color: branding.colors.mutedText }}
          >
            Enter the 6-digit code sent to {userEmail}
          </p>
        </div>

        {/* 2FA Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code Input */}
          <div>
            <Label 
              htmlFor="code" 
              className="text-sm mb-2 block font-medium"
              style={{ color: branding.colors.bodyText }}
            >
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-12 rounded-xl border-2 transition-all focus:shadow-lg text-center text-2xl tracking-widest"
              style={{
                background: branding.colors.inputBackground,
                borderColor: branding.colors.inputBorder,
                color: branding.colors.inputText,
              }}
              placeholder="000000"
              required
              autoFocus
              maxLength={6}
            />
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            className="w-full gap-2 h-12 rounded-xl transition-all shadow-lg"
            disabled={isLoading || code.length < 6}
            style={{
              background: branding.colors.primaryButton,
              color: branding.colors.primaryButtonText,
              boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Verify Code
              </>
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm hover:underline"
              style={{ color: branding.colors.linkColor }}
            >
              Didn't receive the code? Resend
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <Link
              to="/login"
              className="text-sm hover:underline inline-flex items-center gap-1"
              style={{ color: branding.colors.linkColor }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p 
            className="text-sm"
            style={{ color: branding.colors.mutedText }}
          >
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
