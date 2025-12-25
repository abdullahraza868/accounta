import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Lock, Mail, Eye, EyeOff, Building2, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../lib/emailValidation';
import { TenantSelectionDialog } from '../TenantSelectionDialog';
import { GoogleLogo } from '../GoogleLogo';
import { VerificationCodeInput } from '../ui/verification-code-input';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';
import loginIllustration from 'figma:asset/00fc986d99affa136ad08ce9201415f41fcf7e8a.png';

type LoginStep = 'credentials' | 'verify-otp';

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { branding } = useBranding();
  const { login } = useAuth();

  // Debug: Log branding colors on mount
  useEffect(() => {
    console.log('🎨 LoginView branding colors:', branding.colors);
  }, [branding]);
  
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123qwe');
  const [tenancyName, setTenancyName] = useState('');
  const [currentTenantName, setCurrentTenantName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Load current tenant info on mount
  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId');
    const storedTenantName = localStorage.getItem('tenantName');
    if (tenantId && storedTenantName) {
      setCurrentTenantName(storedTenantName);
      setTenancyName(storedTenantName);
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleTenantSelected = (tenantId: number, tenantName: string) => {
    setTenancyName(tenantName);
    setCurrentTenantName(tenantName);
    // Store tenant name for display
    localStorage.setItem('tenantName', tenantName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError || !email) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, check backend response for login success
      // For now, simulate successful credential validation
      toast.success('Credentials verified!');
      
      // Send OTP code
      toast.info('Verification code sent to your phone');
      setResendCountdown(60);
      setLoginStep('verify-otp');
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Demo: accept "123456" as valid code
      if (otpCode === '123456') {
        // Complete the login process
        await login(email, password, tenancyName || undefined);
        toast.success('Successfully logged in!');
        
        // Redirect to the page they tried to visit or to clients page
        const from = (location.state as any)?.from?.pathname || '/clients';
        navigate(from, { replace: true });
      } else {
        toast.error('Invalid code. Try 123456 for demo');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('New code sent to your phone');
    setResendCountdown(60);
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement Google OAuth flow with backend
      // This should redirect to Google OAuth endpoint or trigger OAuth popup
      // Example: window.location.href = '/api/auth/google';
      
      // For now, show a toast indicating this needs backend implementation
      toast.info('Google login will be available once backend OAuth is configured');
      
      // When backend is ready, the flow should be:
      // 1. Redirect to Google OAuth consent screen
      // 2. Google redirects back to callback URL with auth code
      // 3. Backend exchanges code for tokens
      // 4. Backend creates/updates user and returns session
      // 5. Frontend stores session and redirects to app
      
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="h-screen flex"
      style={{ background: branding.colors.loginBackground }}
    >
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
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
                <Lock className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
              </div>
            </div>
            <h1 
              className="mb-2 text-3xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              {loginStep === 'credentials' ? 'Welcome Back' : 'Verify Your Identity'}
            </h1>
            <p 
              className="text-base"
              style={{ color: branding.colors.mutedText }}
            >
              {loginStep === 'credentials' 
                ? `Sign in to ${branding.companyName}`
                : 'Enter the verification code sent to your phone'}
            </p>
          </div>

          {/* Credentials Step */}
          {loginStep === 'credentials' && (
            <>
              {/* Google Login Button - Prominent placement (Official Google Design) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl transition-all hover:shadow-md mb-6 border flex items-center justify-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#ffffff',
                  borderColor: '#dadce0',
                  color: '#3c4043',
                }}
              >
                <GoogleLogo className="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: branding.colors.inputBorder }} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2" 
                    style={{ 
                      background: branding.colors.loginBackground,
                      color: branding.colors.mutedText 
                    }}
                  >
                    Or sign in with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Login Form - Credentials Step */}
          {loginStep === 'credentials' && (
            <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Tenant Display & Change Button */}
            <div className="flex items-center justify-between p-3 rounded-lg border" 
                 style={{ 
                   borderColor: branding.colors.inputBorder,
                   background: branding.colors.inputBackground 
                 }}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
                <span className="text-sm" style={{ color: branding.colors.bodyText }}>
                  {currentTenantName ? (
                    <>Tenant: <span className="font-medium">{currentTenantName}</span></>
                  ) : (
                    'No tenant selected'
                  )}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTenantDialog(true)}
                className="text-xs"
              >
                Change Tenant
              </Button>
            </div>

            {/* Email Field */}
            <div>
              <Label 
                htmlFor="email" 
                className="text-sm mb-2 block font-medium"
                style={{ color: branding.colors.bodyText }}
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: branding.colors.mutedText }}
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 transition-all focus:shadow-lg"
                  style={{
                    background: branding.colors.inputBackground,
                    borderColor: emailError ? '#ef4444' : branding.colors.inputBorder,
                    color: branding.colors.inputText,
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label 
                htmlFor="password" 
                className="text-sm mb-2 block font-medium"
                style={{ color: branding.colors.bodyText }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: branding.colors.mutedText }}
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl border-2 transition-all focus:shadow-lg"
                  style={{
                    background: branding.colors.inputBackground,
                    borderColor: branding.colors.inputBorder,
                    color: branding.colors.inputText,
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: branding.colors.mutedText }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm cursor-pointer"
                  style={{ color: branding.colors.bodyText }}
                >
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm hover:underline"
                style={{ color: branding.colors.linkColor }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full gap-2 h-12 rounded-xl transition-all shadow-lg mt-6"
              disabled={isLoading}
              style={{
                background: branding.colors.primaryButton,
                color: branding.colors.primaryButtonText,
                boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          )}

          {/* OTP Verification Step */}
          {loginStep === 'verify-otp' && (
            <div className="space-y-6">
              {/* Info Message */}
              <div 
                className="p-4 rounded-lg flex items-start gap-3"
                style={{ 
                  background: `${branding.colors.primaryButton}10`,
                  borderColor: branding.colors.primaryButton,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <Shield className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: branding.colors.bodyText }}>
                    Security Verification
                  </p>
                  <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                    Enter the 6-digit code we sent to your phone
                  </p>
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <Label 
                  className="text-sm mb-4 block font-medium text-center"
                  style={{ color: branding.colors.bodyText }}
                >
                  Enter Verification Code
                </Label>
                <VerificationCodeInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={isLoading}
                />
                <p className="mt-4 text-xs text-center" style={{ color: branding.colors.mutedText }}>
                  Demo: Use code <span className="font-mono font-medium">123456</span>
                </p>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendCountdown > 0}
                  className="text-sm transition-all disabled:opacity-50"
                  style={{ color: branding.colors.linkColor }}
                >
                  {resendCountdown > 0 
                    ? `Resend code in ${resendCountdown}s` 
                    : 'Resend code'}
                </button>
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full gap-2 h-12 rounded-xl transition-all shadow-lg"
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

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('credentials');
                    setOtpCode('');
                  }}
                  className="text-sm transition-all"
                  style={{ color: branding.colors.linkColor }}
                >
                  ← Back to login
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {loginStep === 'credentials' && (
            <div className="mt-8 text-center space-y-3">
            <p 
              className="text-sm"
              style={{ color: branding.colors.mutedText }}
            >
              Protected by enterprise-grade security
            </p>
            
            {/* Client Portal Link */}
            <div className="pt-4 border-t" style={{ borderColor: branding.colors.inputBorder }}>
              <p className="text-sm mb-2" style={{ color: branding.colors.mutedText }}>
                Are you a client?
              </p>
              <Link
                to="/client-portal/login"
                className="inline-flex items-center gap-2 text-sm hover:underline transition-all"
                style={{ color: branding.colors.linkColor }}
              >
                <Building2 className="w-4 h-4" />
                Go to Client Portal →
              </Link>
            </div>

            {/* Test Link - Login Workflows */}
            <div className="pt-3">
              <Link
                to="/workflows/login"
                className="inline-flex items-center gap-2 text-xs hover:underline transition-all"
                style={{ color: branding.colors.mutedText }}
              >
                Test: Login Workflows →
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Tenant Selection Dialog */}
      <TenantSelectionDialog
        open={showTenantDialog}
        onOpenChange={setShowTenantDialog}
        onTenantSelected={handleTenantSelected}
      />

      {/* Right Side - Illustration */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center p-16 relative overflow-hidden"
        style={{ 
          background: branding.colors.loginIllustrationBackground 
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-pulse" 
               style={{ background: branding.colors.primaryButton }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-pulse delay-1000" 
               style={{ background: branding.colors.secondaryButton }} />
        </div>
        
        <div className="relative z-10 text-center max-w-2xl">
          <div className="mb-8">
            <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <img 
                src={accountaLogo} 
                alt={branding.companyName} 
                className="h-12"
              />
            </div>
          </div>
          <h2 className="text-white mb-6 text-4xl">
            Welcome to {branding.companyName}
          </h2>
          <p className="text-white/90 text-xl mb-12 leading-relaxed">
            Full practice management software that automates your workflows, streamlines client management, and scales with your business.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Clients', value: '10K+' },
              { label: 'Documents', value: '50K+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Illustration */}
          <div className="relative">
            <img 
              src={loginIllustration} 
              alt="Platform illustration" 
              className="w-full max-w-2xl mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
