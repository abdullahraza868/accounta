import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Mail, Phone, ArrowRight, Building2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { validateEmail } from '../../lib/fieldValidation';
import { useBranding } from '../../contexts/BrandingContext';

type ViewState = 'initial' | 'searching' | 'found' | 'not-found';

interface TenantResult {
  tenantName: string;
  firmName: string;
  url: string;
}

export function TenantNotFoundView() {
  const { branding } = useBranding();
  const [viewState, setViewState] = useState<ViewState>('initial');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [tenantResult, setTenantResult] = useState<TenantResult | null>(null);
  const [attemptedFirmName] = useState(() => {
    // Try to extract firm name from URL
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    return parts[0] || 'the firm';
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSearch = async () => {
    // Validate email
    const validation = validateEmail(email, true);
    if (!validation.isValid) {
      setEmailError(validation.error || 'Please enter a valid email address');
      return;
    }

    setViewState('searching');

    try {
      // TODO: Replace with actual API call using NSwag client
      // Example: const result = await tenantService.findTenantByEmail({ emailAddress: email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response - in production, this will come from the API
      const mockFound = email.includes('test') || email.includes('demo');
      
      if (mockFound) {
        // Email found - show correct tenant URL
        const result: TenantResult = {
          tenantName: 'smithcpa',
          firmName: 'Smith & Associates CPA',
          url: 'https://smithcpa.acounta.com'
        };
        setTenantResult(result);
        setViewState('found');
      } else {
        // Email not found
        setViewState('not-found');
      }
    } catch (error) {
      console.error('Error searching for tenant:', error);
      toast.error('An error occurred while searching. Please try again.');
      setViewState('initial');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !emailError && email) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${branding.colors.loginBackground} 0%, ${branding.colors.mainBackground} 100%)`
        }}
      >
        {/* Floating Gradient Orbs */}
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.colors.primaryBrand} 0%, transparent 70%)`,
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.colors.secondaryBrand} 0%, transparent 70%)`,
            animationDuration: '6s',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.colors.infoColor} 0%, transparent 70%)`,
            animationDuration: '5s',
            animationDelay: '2s'
          }}
        />

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill={branding.colors.primaryBrand} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Building2 className="w-16 h-16" style={{ color: branding.colors.primaryBrand }} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <MapPin className="w-20 h-20" style={{ color: branding.colors.secondaryBrand }} />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10">
          <Search className="w-24 h-24" style={{ color: branding.colors.primaryBrand }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Glow effect behind logo */}
            <div 
              className="absolute inset-0 blur-2xl opacity-30 rounded-full"
              style={{ background: branding.colors.primaryBrand }}
            />
            {branding.images.logo ? (
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                <img 
                  src={branding.images.logo} 
                  alt={branding.companyName || 'Company Logo'}
                  className="h-12 object-contain"
                />
              </div>
            ) : (
              <div className="relative flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ background: branding.colors.primaryButton }}
                >
                  <span className="text-xl text-white">A</span>
                </div>
                <span className="text-2xl" style={{ color: branding.colors.headingText }}>
                  {branding.companyName || 'Acounta'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Card */}
        <Card 
          className="border-0 shadow-2xl backdrop-blur-sm relative overflow-hidden"
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Card Glow Effect */}
          <div 
            className="absolute inset-0 opacity-50 blur-xl"
            style={{ 
              background: `linear-gradient(135deg, ${branding.colors.primaryBrand}20 0%, ${branding.colors.secondaryBrand}20 100%)`
            }}
          />
          
          <CardContent className="pt-8 pb-8 relative z-10">
            {/* Initial State - Tenant Not Found */}
            {viewState === 'initial' && (
              <div className="text-center">
                <div className="relative mb-6">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative"
                    style={{ background: `${branding.colors.primaryBrand}10` }}
                  >
                    {/* Pulsing ring effect */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ background: branding.colors.primaryBrand }}
                    />
                    <AlertCircle className="w-10 h-10 relative z-10" style={{ color: branding.colors.primaryBrand }} />
                  </div>
                </div>
                
                <h1 className="text-gray-900 dark:text-gray-100 mb-3">
                  Firm Not Found
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  The accounting firm "<span style={{ color: branding.colors.primaryBrand }}>{attemptedFirmName}</span>" was not found.
                </p>
                
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6"
                  style={{ 
                    background: `${branding.colors.primaryBrand}15`,
                    border: `2px solid ${branding.colors.primaryBrand}30`
                  }}
                >
                  <ArrowRight 
                    className="w-5 h-5" 
                    style={{ color: branding.colors.primaryBrand }} 
                  />
                  <span 
                    className="font-medium"
                    style={{ color: branding.colors.primaryBrand }}
                  >
                    Let's help you get to the right place.
                  </span>
                </div>

                <div className="text-left mb-6">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 mb-2 block">
                    Enter your email address
                  </Label>
                  <div className="relative">
                    <Mail 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                      style={{ color: branding.colors.mutedText }}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="you@example.com"
                      autoFocus
                      className="pl-11 h-12 border-2 transition-all"
                      style={{ 
                        borderColor: emailError ? branding.colors.errorColor : branding.colors.inputBorder,
                        background: branding.colors.inputBackground,
                      }}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm mt-2" style={{ color: branding.colors.errorColor }}>
                      {emailError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    We'll search our system to find your accounting firm
                  </p>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={!email || !!emailError}
                  className="w-full text-white h-12 shadow-lg transition-all hover:shadow-xl"
                  style={{ background: branding.colors.primaryButton }}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find My Firm
                </Button>
              </div>
            )}

            {/* Searching State */}
            {viewState === 'searching' && (
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <div 
                    className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto animate-spin"
                    style={{ 
                      borderColor: `${branding.colors.primaryBrand}30`,
                      borderTopColor: 'transparent'
                    }}
                  />
                  <div 
                    className="absolute inset-0 w-16 h-16 border-4 border-t-transparent rounded-full mx-auto animate-spin"
                    style={{ 
                      borderColor: 'transparent',
                      borderTopColor: branding.colors.primaryBrand,
                      animationDuration: '0.8s'
                    }}
                  />
                </div>
                <h2 className="text-gray-900 dark:text-gray-100 mb-2">
                  Searching for your firm...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we look up your account
                </p>
              </div>
            )}

            {/* Found State */}
            {viewState === 'found' && tenantResult && (
              <div className="text-center">
                <div className="relative mb-6">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative"
                    style={{ background: `${branding.colors.successColor}15` }}
                  >
                    {/* Success pulse effect */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ background: branding.colors.successColor }}
                    />
                    <CheckCircle className="w-10 h-10 relative z-10" style={{ color: branding.colors.successColor }} />
                  </div>
                </div>
                
                <h2 className="text-gray-900 dark:text-gray-100 mb-3">
                  Firm Found!
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  This is the correct URL for your accounting firm:
                </p>

                <div 
                  className="p-5 rounded-xl mb-2 border-2 relative overflow-hidden"
                  style={{ 
                    background: branding.colors.cardBackground,
                    borderColor: branding.colors.successColor
                  }}
                >
                  {/* Success gradient background */}
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{ background: `linear-gradient(135deg, ${branding.colors.successColor} 0%, transparent 100%)` }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Building2 className="w-5 h-5" style={{ color: branding.colors.successColor }} />
                      <p className="text-gray-900 dark:text-gray-100">
                        {tenantResult.firmName}
                      </p>
                    </div>
                    <div 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg mb-3 text-sm"
                      style={{ 
                        background: `${branding.colors.successColor}20`,
                        color: branding.colors.successColor
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <strong>Please note this URL</strong>
                    </div>
                    <div 
                      className="p-4 rounded-lg text-sm break-all"
                      style={{ 
                        background: branding.colors.mainBackground,
                        color: branding.colors.primaryBrand
                      }}
                    >
                      <strong>{tenantResult.url}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Bookmark this URL for easy access in the future
                </p>

                <Button
                  onClick={() => window.location.href = tenantResult.url}
                  className="w-full text-white h-12 shadow-lg transition-all hover:shadow-xl"
                  style={{ background: branding.colors.primaryButton }}
                >
                  Go to Portal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Not Found State */}
            {viewState === 'not-found' && (
              <div className="text-center">
                <div className="relative mb-6">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative"
                    style={{ background: `${branding.colors.errorColor}15` }}
                  >
                    <AlertCircle className="w-10 h-10 relative z-10" style={{ color: branding.colors.errorColor }} />
                  </div>
                </div>
                
                <h2 className="text-gray-900 dark:text-gray-100 mb-3">
                  Email Not Found
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We couldn't find <span className="text-gray-900 dark:text-gray-100 break-all">{email}</span> in our system.
                </p>

                <div 
                  className="p-5 rounded-xl mb-6 text-left"
                  style={{ background: branding.colors.mainBackground }}
                >
                  <p className="text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: branding.colors.warningColor }} />
                    <strong>What to do next:</strong>
                  </p>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-3 p-3 rounded-lg" style={{ background: branding.colors.cardBackground }}>
                      <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: branding.colors.primaryBrand }} />
                      <span>Contact your accounting firm directly for the correct portal address</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg" style={{ background: branding.colors.cardBackground }}>
                      <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: branding.colors.primaryBrand }} />
                      <span>Call your accountant to verify your email address is registered</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setViewState('initial');
                    setEmail('');
                  }}
                  className="w-full text-white h-12 shadow-lg transition-all hover:shadow-xl"
                  style={{ background: branding.colors.primaryButton }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <div 
            className="inline-block px-6 py-3 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(255, 255, 255, 0.5)' }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copyright © 2025, {branding.companyName} ® Inc. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
