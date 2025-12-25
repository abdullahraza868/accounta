import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Lock, Mail, Eye, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../../lib/emailValidation';
import { TenantSelectionDialog } from './components/TenantSelectionDialog';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';
import loginIllustration from 'figma:asset/00fc986d99affa136ad08ce9201415f41fcf7e8a.png';

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { branding } = useBranding();
  const { login } = useAuth();
  
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
      console.log('🔐 LoginView: Attempting admin login...');
      await login(email, password, tenancyName || undefined);
      console.log('✅ LoginView: Login successful');
      toast.success('Successfully logged in!');
      
      // Redirect to the page they tried to visit or to clients page
      let from = (location.state as any)?.from?.pathname || '/clients';
      
      // SECURITY: Admin users should NEVER go to client portal
      if (from.startsWith('/client-portal')) {
        console.warn('⚠️ LoginView: Attempted redirect to client portal for admin user!');
        console.warn('   Overriding to /clients for security');
        from = '/clients';
      }
      
      console.log('🚀 LoginView: Navigating to:', from);
      console.log('📦 LoginView: Clearing client portal localStorage...');
      
      // Clear any client portal data to prevent confusion
      localStorage.removeItem('preferredPortal');
      localStorage.removeItem('clientPortalSession');
      
      console.log('📦 LoginView: localStorage after clearing:');
      console.log('   - preferredPortal:', localStorage.getItem('preferredPortal'));
      console.log('   - clientPortalSession:', localStorage.getItem('clientPortalSession'));
      console.log('   - accessToken:', localStorage.getItem('accessToken') ? 'EXISTS' : 'NONE');
      
      console.log('🌐 LoginView: Current window.location:', window.location.pathname);
      console.log('🎯 LoginView: About to navigate to:', from);
      
      navigate(from, { replace: true });
      
      // Double-check navigation after a brief delay
      setTimeout(() => {
        console.log('🔍 LoginView: Post-navigate check - Current path:', window.location.pathname);
        if (window.location.pathname.includes('client-portal')) {
          console.error('❌ LoginView: UNEXPECTED! Ended up at client portal!');
          console.error('   This means something AFTER navigate() redirected us');
        } else {
          console.log('✅ LoginView: Correctly at admin path');
        }
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if 2FA is required
      if (error.message === '2FA_REQUIRED') {
        toast.info('Two-factor authentication required');
        navigate('/account/validate-2fa');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
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
              Welcome Back
            </h1>
            <p 
              className="text-base"
              style={{ color: branding.colors.mutedText }}
            >
              Sign in to {branding.companyName}
            </p>
          </div>

          {/* Login Form */}
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
                to="/account/forgot-password"
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

      {/* Tenant Selection Dialog */}
      <TenantSelectionDialog
        open={showTenantDialog}
        onOpenChange={setShowTenantDialog}
        onTenantSelected={handleTenantSelected}
      />
    </div>
  );
}
