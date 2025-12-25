import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Check, Phone, Shield, Mail, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GoogleLogo } from '../GoogleLogo';
import { MicrosoftLogo } from '../MicrosoftLogo';
import { VerificationCodeInput } from '../ui/verification-code-input';
import { PhoneInput } from '../ui/phone-input';
import { validateEmail } from '../../lib/emailValidation';

type Step = 'choose-auth' | 'check-email' | 'add-phone' | 'verify-otp' | 'success';

export function FirstLoginAddPhoneView() {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email from URL params (would come from invitation link)
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  
  const [step, setStep] = useState<Step>('choose-auth');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [email, setEmail] = useState(emailFromUrl);
  const [emailError, setEmailError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [agreeToAll, setAgreeToAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('📱 FirstLoginAddPhone - Current step:', step);
    console.log('📱 FirstLoginAddPhone - Auth method:', selectedMethod);
    console.log('📱 FirstLoginAddPhone - Is loading:', isLoading);
  }, [step, selectedMethod, isLoading]);

  // If user came from magic link (has token in URL), they're already authenticated
  useEffect(() => {
    if (tokenFromUrl && emailFromUrl) {
      console.log('🔗 Magic link detected - skipping to add phone');
      setSelectedMethod('magic-link');
      setEmail(emailFromUrl);
      setStep('add-phone');
    }
  }, [tokenFromUrl, emailFromUrl]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setSelectedMethod('google');
    
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Google authentication successful!');
      
      // Move to phone collection
      setStep('add-phone');
      
    } catch (error) {
      toast.error('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setSelectedMethod('microsoft');
    
    try {
      // Simulate Microsoft OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Microsoft authentication successful!');
      
      // Move to phone collection
      setStep('add-phone');
      
    } catch (error) {
      toast.error('Microsoft sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      validateEmail(value, setEmailError);
    }
  };

  const handleSendMagicLink = async () => {
    // Validate email
    if (!validateEmail(email, setEmailError)) {
      return;
    }

    setIsLoading(true);
    setSelectedMethod('magic-link');
    
    try {
      // Simulate sending magic link
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Magic link sent to your email!');
      
      // Show "check your email" screen
      setStep('check-email');
      
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
    setStep('add-phone');
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleAddPhone = async () => {
    if (!validatePhone(phoneNumber)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Verification code sent to your phone!');
      setCountdown(60);
      setStep('verify-otp');
      
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    if (!agreeToAll) {
      toast.error('Please agree to the terms before continuing');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: accept "123456" as valid code
    if (otpCode === '123456') {
      toast.success('Phone verified successfully!');
      setStep('success');
      
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

        {/* Main Card */}
        <div 
          className="p-8 rounded-2xl shadow-2xl backdrop-blur-sm"
          style={{ 
            background: branding.colors.cardBackground,
            borderColor: branding.colors.cardBorder,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="mb-2 text-2xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              {step === 'choose-auth' && 'Welcome!'}
              {step === 'check-email' && 'Check Your Email'}
              {step === 'add-phone' && 'Add Your Phone'}
              {step === 'verify-otp' && 'Verify Your Phone'}
              {step === 'success' && 'All Set!'}
            </h1>
            <p 
              className="text-sm"
              style={{ color: branding.colors.mutedText }}
            >
              {step === 'choose-auth' && 'Choose how you\'d like to sign in'}
              {step === 'check-email' && 'We sent a magic link to your email'}
              {step === 'add-phone' && 'We need your phone number for account security'}
              {step === 'verify-otp' && 'We sent a code to your phone'}
              {step === 'success' && 'Redirecting to dashboard...'}
            </p>
          </div>

          {/* Step 1: Choose Authentication Method */}
          {step === 'choose-auth' && (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:shadow-lg flex items-center justify-center gap-3 font-medium disabled:opacity-50"
              >
                {isLoading && selectedMethod === 'google' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span style={{ color: branding.colors.bodyText }}>Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleLogo className="w-6 h-6" />
                    <span style={{ color: branding.colors.bodyText }}>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Microsoft Sign In */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:shadow-lg flex items-center justify-center gap-3 font-medium disabled:opacity-50"
              >
                {isLoading && selectedMethod === 'microsoft' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span style={{ color: branding.colors.bodyText }}>Signing in...</span>
                  </>
                ) : (
                  <>
                    <MicrosoftLogo className="w-6 h-6" />
                    <span style={{ color: branding.colors.bodyText }}>Continue with Microsoft</span>
                  </>
                )}
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
                <Shield className="w-4 h-4 inline-block mr-1" />
                After signing in, you'll need to add your phone number for security.
              </div>
            </div>
          )}

          {/* Step 2: Check Email (Magic Link) */}
          {step === 'check-email' && (
            <div className="space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: `${branding.colors.primaryButton}20` }}
                >
                  <Mail className="w-10 h-10" style={{ color: branding.colors.primaryButton }} />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-4">
                <p style={{ color: branding.colors.bodyText }}>
                  We sent a magic link to:
                </p>
                <p 
                  className="font-medium text-lg"
                  style={{ color: branding.colors.headingText }}
                >
                  {email}
                </p>
              </div>

              {/* Steps */}
              <div 
                className="p-4 rounded-lg space-y-3 text-sm"
                style={{ 
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="font-medium" style={{ color: branding.colors.headingText }}>
                  What to do next:
                </p>
                <ol className="space-y-2 list-decimal list-inside" style={{ color: branding.colors.bodyText }}>
                  <li>Check your email inbox</li>
                  <li>Look for an email from {branding.companyName}</li>
                  <li>Click the "Continue to {branding.companyName}" button</li>
                  <li>You'll be brought back here to add your phone</li>
                </ol>
              </div>

              {/* Demo Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleMagicLinkClicked}
                  className="w-full h-12 rounded-xl border-2 transition-all hover:shadow-lg font-medium"
                  style={{
                    background: branding.colors.cardBackground,
                    borderColor: branding.colors.inputBorder,
                    color: branding.colors.primaryButton,
                  }}
                >
                  Demo: Simulate Clicking Magic Link
                </button>
                <p className="text-xs text-center mt-2" style={{ color: branding.colors.mutedText }}>
                  In production, users click the link in their email
                </p>
              </div>

              {/* Help Text */}
              <div className="text-center text-xs" style={{ color: branding.colors.mutedText }}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  className="underline"
                  style={{ color: branding.colors.linkColor }}
                >
                  resend
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Add Phone Number */}
          {step === 'add-phone' && (
            <div className="space-y-6">
              {/* Success Badge */}
              <div 
                className="p-3 rounded-lg flex items-center gap-3"
                style={{ 
                  background: `${branding.colors.successColor}10`,
                  borderColor: branding.colors.successColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: branding.colors.successColor }}
                >
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: branding.colors.bodyText }}>
                    <strong>Authenticated successfully!</strong>
                  </p>
                  <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                    {selectedMethod === 'google' && 'via Google'}
                    {selectedMethod === 'microsoft' && 'via Microsoft'}
                    {selectedMethod === 'magic-link' && 'via Magic Link'}
                  </p>
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <Label 
                  htmlFor="phone" 
                  className="text-sm mb-2 block font-medium"
                  style={{ color: branding.colors.bodyText }}
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" 
                    style={{ color: branding.colors.mutedText }}
                  />
                  <PhoneInput
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      if (phoneError) validatePhone(value);
                    }}
                    placeholder="(555) 123-4567"
                    className="pl-12"
                    disabled={isLoading}
                  />
                </div>
                {phoneError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{phoneError}</p>
                )}
                <p className="text-xs mt-2" style={{ color: branding.colors.mutedText }}>
                  We'll send a verification code to this number
                </p>
              </div>

              {/* Continue Button */}
              <Button
                type="button"
                onClick={handleAddPhone}
                disabled={isLoading || !phoneNumber}
                className="w-full h-14 rounded-xl transition-all hover:shadow-lg border-2 gap-3"
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-6 h-6" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Verify OTP */}
          {step === 'verify-otp' && (
            <div className="space-y-6">
              {/* Phone Display */}
              <div 
                className="p-3 rounded-lg text-center"
                style={{ 
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                  Code sent to
                </p>
                <p className="font-medium" style={{ color: branding.colors.bodyText }}>
                  {phoneNumber}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <Label 
                  className="text-sm mb-3 block font-medium text-center"
                  style={{ color: branding.colors.bodyText }}
                >
                  Enter Verification Code
                </Label>
                <VerificationCodeInput
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={handleVerifyOtp}
                />
                <p className="text-xs text-center mt-3" style={{ color: branding.colors.mutedText }}>
                  Demo: Enter <strong>123456</strong> to verify
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
                {countdown > 0 ? (
                  <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm transition-all"
                    style={{ color: branding.colors.linkColor }}
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6 || !agreeToAll}
                className="w-full h-14 rounded-xl transition-all hover:shadow-lg border-2 gap-3"
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6" />
                    <span>Verify Code</span>
                  </>
                )}
              </Button>

              {/* Warning if terms not agreed */}
              {(otpCode.length === 6 && !agreeToAll) && (
                <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                  Please agree to all terms above to continue
                </p>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: `${branding.colors.successColor}20` }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: branding.colors.successColor }}
                  >
                    <Check className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div>
                <h2 
                  className="text-xl mb-2"
                  style={{ color: branding.colors.headingText }}
                >
                  Welcome to {branding.companyName}!
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: branding.colors.mutedText }}
                >
                  Your account is ready. Taking you to your dashboard...
                </p>
              </div>

              {/* User Info */}
              <div 
                className="p-4 rounded-lg inline-block"
                style={{ 
                  background: branding.colors.inputBackground,
                  borderColor: branding.colors.inputBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <p className="text-sm mb-1" style={{ color: branding.colors.mutedText }}>
                  Phone verified
                </p>
                <p className="font-medium" style={{ color: branding.colors.bodyText }}>
                  {phoneNumber}
                </p>
              </div>

              {/* Loading Indicator */}
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: branding.colors.primaryButton }}
                />
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ 
                    background: branding.colors.primaryButton,
                    animationDelay: '0.2s'
                  }}
                />
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ 
                    background: branding.colors.primaryButton,
                    animationDelay: '0.4s'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}