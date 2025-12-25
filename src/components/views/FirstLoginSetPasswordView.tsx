import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Check, Mail, Shield, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GoogleLogo } from '../GoogleLogo';
import { MicrosoftLogo } from '../MicrosoftLogo';
import { VerificationCodeInput } from '../ui/verification-code-input';
import { validateEmail } from '../../lib/emailValidation';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

type Step = 'method' | 'verify' | 'otp';

export function FirstLoginSetPasswordView() {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email and token from URL params (would come from invitation link or magic link)
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || 'demo-token-123';
  
  const [step, setStep] = useState<'method' | 'verify' | 'otp'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [email, setEmail] = useState(emailFromUrl);
  const [emailError, setEmailError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [agreeToAll, setAgreeToAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [magicLinkClicked, setMagicLinkClicked] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔐 FirstLoginView - Current step:', step);
    console.log('🔐 FirstLoginView - Selected method:', selectedMethod);
    console.log('🔐 FirstLoginView - Is loading:', isLoading);
  }, [step, selectedMethod, isLoading]);

  // If user came from magic link (has token in URL), skip to OTP
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== 'demo-token-123' && emailFromUrl) {
      setSelectedMethod('magic-link');
      setStep('verify');
      setCountdown(60);
    }
  }, [tokenFromUrl, emailFromUrl]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleChooseGoogle = async () => {
    setIsLoading(true);
    setSelectedMethod('google');
    
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Connected with Google!');
      
      // Send OTP directly - skip to OTP verification
      toast.info('Verification code sent to your phone');
      setCountdown(60);
      setStep('verify'); // This should go to OTP step, not magic link step
    } catch (error) {
      toast.error('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseMicrosoft = async () => {
    setIsLoading(true);
    setSelectedMethod('microsoft');
    
    try {
      // Simulate Microsoft OAuth
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Connected with Microsoft!');
      
      // Send OTP directly - skip to OTP verification
      toast.info('Verification code sent to your phone');
      setCountdown(60);
      setStep('verify'); // This should go to OTP step, not magic link step
    } catch (error) {
      toast.error('Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (emailError || !email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setSelectedMethod('magic-link');
    
    try {
      // Simulate sending magic link
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Magic link sent to your email!');
      
      // Show "check your email" screen
      setStep('verify');
      
    } catch (error) {
      toast.error('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkClicked = () => {
    // User clicked the magic link in their email
    // In production, this would be triggered by URL params
    toast.success('Magic link verified!');
    toast.info('Verification code sent to your phone');
    setCountdown(60);
    setStep('verify');
    setMagicLinkClicked(true);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    if (!agreeToAll) {
      setShowWarning(true);
      toast.error('Please agree to the terms before continuing');
      return;
    }

    setShowWarning(false);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: accept "123456" as valid code
    if (otpCode === '123456') {
      toast.success('Phone verified!');
      setStep('otp');
      
      // Redirect to dashboard after brief success message
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } else {
      toast.error('Invalid code. Try 123456 for demo');
    }
    
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('New code sent to your phone');
    setCountdown(60);
    setIsLoading(false);
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
                  background: branding.colors.primaryButton,
                  boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
                }}
              >
                {step === 'otp' ? (
                  <Check className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
                ) : step === 'verify' ? (
                  <Shield className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
                ) : (
                  <Mail className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
                )}
              </div>
            </div>
            <h1 
              className="mb-2 text-2xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              {step === 'method' && 'Welcome!'}
              {step === 'verify' && selectedMethod === 'magic-link' && !magicLinkClicked && 'Check Your Email'}
              {step === 'verify' && (selectedMethod !== 'magic-link' || magicLinkClicked) && 'Verify Your Phone'}
              {step === 'otp' && 'All Set!'}
            </h1>
            <p 
              className="text-sm"
              style={{ color: branding.colors.mutedText }}
            >
              {step === 'method' && 'Choose how you\'d like to sign in'}
              {step === 'verify' && selectedMethod === 'magic-link' && !magicLinkClicked && `We sent a magic link to ${email}`}
              {step === 'verify' && (selectedMethod !== 'magic-link' || magicLinkClicked) && 'We sent a code to your phone'}
              {step === 'otp' && 'Redirecting to dashboard...'}
            </p>
          </div>

          {/* Step 1: Choose Authentication Method */}
          {step === 'method' && (
            <div className="space-y-4">
              {/* Google Sign-In Option */}
              <button
                type="button"
                onClick={handleChooseGoogle}
                disabled={isLoading}
                className="w-full h-14 rounded-xl transition-all hover:shadow-md border-2 flex items-center justify-center gap-3 font-medium disabled:opacity-50"
                style={{
                  background: '#ffffff',
                  borderColor: '#dadce0',
                  color: '#3c4043',
                }}
              >
                <GoogleLogo className="w-6 h-6" />
                <span>Sign in with Google</span>
              </button>

              {/* Microsoft Sign-In Option */}
              <button
                type="button"
                onClick={handleChooseMicrosoft}
                disabled={isLoading}
                className="w-full h-14 rounded-xl transition-all hover:shadow-md border-2 flex items-center justify-center gap-3 font-medium disabled:opacity-50"
                style={{
                  background: '#ffffff',
                  borderColor: '#dadce0',
                  color: '#3c4043',
                }}
              >
                <MicrosoftLogo className="w-6 h-6" />
                <span>Sign in with Microsoft</span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: branding.colors.inputBorder }} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2" 
                    style={{ 
                      background: branding.colors.cardBackground,
                      color: branding.colors.mutedText 
                    }}
                  >
                    Or
                  </span>
                </div>
              </div>

              {/* Magic Link Option */}
              <div className="space-y-4">
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

                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={isLoading || !email || !!emailError}
                  className="w-full h-14 rounded-xl transition-all hover:shadow-lg border-2 flex items-center justify-center gap-3 font-medium disabled:opacity-50"
                  style={{
                    background: branding.colors.primaryButton,
                    borderColor: branding.colors.primaryButton,
                    color: branding.colors.primaryButtonText,
                    boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
                  }}
                >
                  {isLoading && selectedMethod === 'magic-link' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send Magic Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Text */}
              <div 
                className="mt-4 p-3 rounded-lg text-xs text-center"
                style={{ 
                  background: `${branding.colors.primaryButton}10`,
                  color: branding.colors.mutedText 
                }}
              >
                We'll send a secure link to your email. Click it to sign in instantly.
              </div>
            </div>
          )}

          {/* Step 2: Check Email (Magic Link) - ONLY show if magic-link selected AND not yet clicked */}
          {step === 'verify' && selectedMethod === 'magic-link' && !magicLinkClicked && (
            <div className="space-y-6">
              {/* Email Sent Message */}
              <div 
                className="p-6 rounded-lg text-center"
                style={{ 
                  background: `${branding.colors.primaryButton}10`,
                  borderColor: branding.colors.primaryButton,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <div className="mb-4 flex justify-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `${branding.colors.primaryButton}20`,
                    }}
                  >
                    <Mail className="w-8 h-8" style={{ color: branding.colors.primaryButton }} />
                  </div>
                </div>
                <h3 className="mb-2" style={{ color: branding.colors.headingText }}>
                  Magic Link Sent!
                </h3>
                <p className="text-sm mb-4" style={{ color: branding.colors.bodyText }}>
                  We've sent a secure sign-in link to:
                </p>
                <div 
                  className="p-3 rounded-lg mb-4 inline-block"
                  style={{ 
                    background: branding.colors.inputBackground,
                    borderColor: branding.colors.inputBorder,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <p className="font-medium" style={{ color: branding.colors.bodyText }}>
                    {email}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div 
                className="p-4 rounded-lg space-y-3"
                style={{ 
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
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
                    <span>Click the "Sign In" button in the email</span>
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
                    <span>You'll be redirected here to verify your phone</span>
                  </li>
                </ol>
              </div>

              {/* Demo Mode - Simulate Click */}
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  background: `${branding.colors.secondaryButton}10`,
                  borderColor: branding.colors.secondaryButton,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="text-xs mb-3" style={{ color: branding.colors.mutedText }}>
                  <strong>Demo Mode:</strong> In production, you would click the link in your email.
                  For testing, click the button below to simulate clicking the magic link.
                </p>
                <Button
                  type="button"
                  onClick={handleMagicLinkClicked}
                  className="gap-2"
                  style={{
                    background: branding.colors.secondaryButton,
                    color: branding.colors.primaryButtonText,
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Simulate Clicking Magic Link
                </Button>
              </div>

              {/* Didn't receive email? */}
              <div className="text-center space-y-2">
                <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                  Didn't receive the email?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSendMagicLink();
                  }}
                  className="text-sm transition-all"
                  style={{ color: branding.colors.linkColor }}
                >
                  Resend magic link
                </button>
              </div>

              {/* Back to Sign In Options */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('method');
                    setEmail('');
                    setSelectedMethod('');
                  }}
                  className="text-sm transition-all"
                  style={{ color: branding.colors.linkColor }}
                >
                  ← Back to sign in options
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verify OTP - Show for Google/Microsoft OR after magic link clicked */}
          {step === 'verify' && (selectedMethod !== 'magic-link' || magicLinkClicked) && (
            <div className="space-y-6">
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

              {/* Terms and Agreements - Combined */}
              <div 
                className={`p-4 rounded-lg transition-all ${!agreeToAll ? 'animate-pulse' : ''}`}
                style={{ 
                  background: !agreeToAll 
                    ? `${branding.colors.primaryButton}15`
                    : branding.colors.inputBackground,
                  borderColor: !agreeToAll 
                    ? branding.colors.primaryButton
                    : branding.colors.inputBorder,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  boxShadow: !agreeToAll 
                    ? `0 0 20px ${branding.colors.primaryButton}30`
                    : 'none',
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeToAll}
                    onChange={(e) => setAgreeToAll(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer"
                    style={{
                      accentColor: branding.colors.primaryButton
                    }}
                  />
                  <span 
                    className="text-xs group-hover:opacity-80 transition-opacity" 
                    style={{ 
                      color: branding.colors.bodyText,
                      fontWeight: !agreeToAll ? '500' : '400'
                    }}
                  >
                    I agree to receive SMS/text messages for verification and important notifications, and I have read and agree to the{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: branding.colors.linkColor }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: branding.colors.linkColor }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || countdown > 0}
                  className="text-sm transition-all disabled:opacity-50"
                  style={{ color: branding.colors.linkColor }}
                >
                  {countdown > 0 
                    ? `Resend code in ${countdown}s` 
                    : 'Resend code'}
                </button>
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6 || !agreeToAll}
                className="w-full h-12 rounded-xl transition-all shadow-lg"
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

              {/* Warning if terms not agreed */}
              {(otpCode.length === 6 && !agreeToAll) && (
                <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                  Please agree to all terms above to continue
                </p>
              )}

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('method');
                    setOtpCode('');
                  }}
                  className="text-sm transition-all"
                  style={{ color: branding.colors.linkColor }}
                >
                  ← Back to sign in options
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'otp' && (
            <div className="space-y-6 text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: '#10b98120' }}
              >
                <Check className="w-10 h-10" style={{ color: '#10b981' }} />
              </div>

              <div>
                <h3 className="mb-2 text-xl" style={{ color: branding.colors.headingText }}>
                  Welcome to {branding.companyName}!
                </h3>
                <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                  Your account has been verified successfully.
                </p>
              </div>

              {email && (
                <div 
                  className="p-4 rounded-lg text-left"
                  style={{ 
                    background: branding.colors.inputBackground,
                    borderColor: branding.colors.inputBorder,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
                    <span className="text-sm" style={{ color: branding.colors.bodyText }}>
                      {email || emailFromUrl}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: branding.colors.primaryButton }} />
                <span className="text-xs" style={{ color: branding.colors.mutedText }}>
                  Taking you to your dashboard...
                </span>
              </div>
            </div>
          )}
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
          This is a test workflow. In production, authentication would be handled securely.
        </div>
      </div>
    </div>
  );
}