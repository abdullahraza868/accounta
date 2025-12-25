import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../lib/emailValidation';
import { apiService } from '../../services/ApiService';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';
import loginIllustration from 'figma:asset/00fc986d99affa136ad08ce9201415f41fcf7e8a.png';

export function ForgotPasswordView() {
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [tenancyName, setTenancyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError || !email) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiService.resetPassword({ emailAddress: email, tenancyName: tenancyName || undefined });
      setIsSuccess(true);
      toast.success('Password reset instructions sent to your email!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="h-screen flex"
      style={{ background: branding.colors.loginBackground }}
    >
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={accountaLogo} 
              alt={branding.companyName} 
              className="h-8 mx-auto mb-8"
            />
            
            {!isSuccess ? (
              <>
                <h1 
                  className="mb-2"
                  style={{ color: branding.colors.headingText }}
                >
                  Reset Password
                </h1>
                <p 
                  className="mb-6"
                  style={{ color: branding.colors.mutedText }}
                >
                  Enter your email address and we'll send you instructions to reset your password
                </p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <CheckCircle2 
                    className="w-16 h-16 mx-auto"
                    style={{ color: branding.colors.successColor }}
                  />
                </div>
                <h1 
                  className="mb-2"
                  style={{ color: branding.colors.headingText }}
                >
                  Check Your Email
                </h1>
                <p 
                  className="mb-6"
                  style={{ color: branding.colors.mutedText }}
                >
                  We've sent password reset instructions to {email}
                </p>
              </>
            )}
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label 
                  htmlFor="email" 
                  className="text-sm mb-1.5 block"
                  style={{ color: branding.colors.bodyText }}
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: emailError ? '#ef4444' : branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{emailError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                style={{
                  background: branding.colors.primaryButton,
                  color: branding.colors.primaryButtonText,
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>

              {/* Back to Login */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 text-sm py-2 hover:underline"
                style={{ color: branding.colors.linkColor }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-4">
              <Link to="/login" className="block">
                <Button
                  className="w-full"
                  style={{
                    background: branding.colors.primaryButton,
                    color: branding.colors.primaryButtonText,
                  }}
                >
                  Back to Login
                </Button>
              </Link>
              
              <p 
                className="text-sm text-center"
                style={{ color: branding.colors.mutedText }}
              >
                Didn't receive the email?{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="hover:underline"
                  style={{ color: branding.colors.linkColor }}
                >
                  Resend
                </button>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p 
              className="text-xs mb-2"
              style={{ color: branding.colors.mutedText }}
            >
              Powered by
            </p>
            <img 
              src={accountaLogo} 
              alt={branding.companyName} 
              className="h-5 mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ 
          background: branding.colors.loginIllustrationBackground 
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        
        <div className="relative z-10 text-center max-w-xl">
          <h2 className="text-white mb-4">
            We've got your back
          </h2>
          <p className="text-white/90 text-lg mb-12">
            Password recovery is quick and easy. We'll help you get back to work in no time.
          </p>
          
          {/* Illustration */}
          <div className="relative">
            <img 
              src={loginIllustration} 
              alt="Platform illustration" 
              className="w-full max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
