import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Clock, Mail, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../lib/emailValidation';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export function LinkExpiredView() {
  const { branding } = useBranding();
  const [searchParams] = useSearchParams();
  
  const emailFromUrl = searchParams.get('email') || '';
  const reasonFromUrl = searchParams.get('reason') || 'expired'; // 'expired' or 'invalid'
  
  const [email, setEmail] = useState(emailFromUrl);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Automatically send new link when component loads with valid email (in background)
  useEffect(() => {
    if (emailFromUrl && validateEmail(emailFromUrl)) {
      // Silently send the new magic link in background
      const autoSendLink = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('New magic link sent to your email!');
        } catch (error) {
          toast.error('Failed to send magic link');
        }
      };
      autoSendLink();
    }
  }, [emailFromUrl]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleResendLink = async () => {
    if (emailError || !email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate sending new magic link
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('New magic link sent to your email!');
      
    } catch (error) {
      toast.error('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ background: branding.colors.loginBackground }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, ${branding.colors.primaryButton}, ${branding.colors.secondaryButton})`,
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, ${branding.colors.secondaryButton}, ${branding.colors.primaryButton})`,
            animationDuration: '6s',
            animationDelay: '1s'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Firm Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src={branding.images.logo} 
            alt={branding.companyName}
            className="h-12 object-contain"
          />
        </div>

        {/* Back Link */}
        <Link
          to="/workflows/login"
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-all text-sm"
          style={{
            color: branding.colors.mutedText,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workflows</span>
        </Link>

        {/* Main Card */}
        <div 
          className="rounded-2xl shadow-2xl p-8"
          style={{
            background: branding.colors.cardBackground,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: branding.colors.inputBorder,
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: '#ef444420',
                  boxShadow: '0 10px 30px -5px #ef444440',
                }}
              >
                <Clock className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
            </div>
            <h1 
              className="mb-2 text-2xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              {reasonFromUrl === 'invalid' ? 'Invalid Link' : 'Link Expired'}
            </h1>
            <p 
              className="text-sm"
              style={{ color: branding.colors.mutedText }}
            >
              {reasonFromUrl === 'invalid' 
                ? 'This link is invalid or has already been used' 
                : 'This magic link has expired for security purposes'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Explanation */}
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: `${branding.colors.primaryButton}10`,
                borderColor: branding.colors.inputBorder,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <p className="text-sm mb-2" style={{ color: branding.colors.bodyText }}>
                <strong>Why did this happen?</strong>
              </p>
              <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                Magic links expire after 15 minutes for your security. {emailFromUrl ? "We're sending you a new one automatically." : "Enter your email below to get a new one."}
              </p>
            </div>

            {/* Auto-send status or Email Input */}
            {emailFromUrl && validateEmail(emailFromUrl) ? (
              <div 
                className="p-6 rounded-lg"
                style={{ 
                  background: '#10b98110',
                  borderColor: '#10b981',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Check className="w-8 h-8" style={{ color: '#10b981' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: branding.colors.headingText }}>
                      New Link Sent!
                    </p>
                    <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                      Check your email for the new magic link
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Email Input */}
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
                      className="pl-12 h-12 rounded-xl border-2 transition-all"
                      style={{
                        background: branding.colors.inputBackground,
                        borderColor: emailError ? '#ef4444' : branding.colors.inputBorder,
                        color: branding.colors.inputText,
                      }}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{emailError}</p>
                  )}
                </div>

                {/* Resend Button */}
                <Button
                  type="button"
                  onClick={handleResendLink}
                  disabled={isLoading || !email || !!emailError}
                  className="w-full h-14 rounded-xl transition-all hover:shadow-lg border-2 flex items-center justify-center gap-3 font-medium"
                  style={{
                    background: branding.colors.primaryButton,
                    borderColor: branding.colors.primaryButton,
                    color: branding.colors.primaryButtonText,
                    boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-6 h-6" />
                      <span>Send New Magic Link</span>
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Next Steps - shown after link is sent */}
            {emailFromUrl && validateEmail(emailFromUrl) && (
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: branding.colors.headingText }}>
                  Next Steps:
                </p>
                <ol className="space-y-2 text-sm" style={{ color: branding.colors.bodyText }}>
                  <li className="flex items-start gap-2">
                    <span 
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ 
                        background: branding.colors.primaryButton,
                        color: branding.colors.primaryButtonText 
                      }}
                    >
                      1
                    </span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span 
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ 
                        background: branding.colors.primaryButton,
                        color: branding.colors.primaryButtonText 
                      }}
                    >
                      2
                    </span>
                    <span>Click the "Sign In" button within 15 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span 
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ 
                        background: branding.colors.primaryButton,
                        color: branding.colors.primaryButtonText 
                      }}
                    >
                      3
                    </span>
                    <span>Complete your authentication to continue</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Help Text */}
            <div 
              className="p-3 rounded-lg text-xs text-center"
              style={{ 
                background: `${branding.colors.primaryButton}10`,
                color: branding.colors.mutedText 
              }}
            >
              {emailFromUrl && validateEmail(emailFromUrl) 
                ? "Didn't receive it? Check your spam folder or contact support."
                : "A new secure link will be sent to your email. Make sure to use it within 15 minutes."}
            </div>
          </div>
        </div>

        {/* Powered by Acounta */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="text-xs" style={{ color: branding.colors.mutedText }}>Powered by</span>
          <img src={accountaLogo} alt="Acounta" className="h-4" />
        </div>

        {/* Footer Info */}
        <div 
          className="mt-4 text-center text-xs"
          style={{ color: branding.colors.mutedText }}
        >
          Need help? Contact your account administrator
        </div>
      </div>
    </div>
  );
}