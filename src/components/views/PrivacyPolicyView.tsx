import { Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export function PrivacyPolicyView() {
  const { branding } = useBranding();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Account information (name, email address, phone number)',
        'Authentication data (OAuth tokens, magic links)',
        'Usage data (login times, feature usage)',
        'Device and browser information',
        'Communication preferences'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'Provide and maintain our services',
        'Authenticate and verify your identity',
        'Send you important notifications and updates',
        'Improve our platform and user experience',
        'Comply with legal obligations'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'End-to-end encryption for sensitive data',
        'Regular security audits and updates',
        'Secure data storage with industry-standard protocols',
        'Limited access to personal information',
        'Multi-factor authentication for all accounts'
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access your personal data at any time',
        'Request corrections to your information',
        'Delete your account and associated data',
        'Opt-out of non-essential communications',
        'Export your data in a portable format'
      ]
    },
    {
      icon: Globe,
      title: 'Third-Party Services',
      content: [
        'We use trusted authentication providers (Google, Microsoft)',
        'SMS verification through secure providers',
        'Analytics services to improve our platform',
        'Cloud infrastructure providers for data storage',
        'Email service providers for communications'
      ]
    }
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-8 relative overflow-hidden"
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Firm Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src={branding.images.logo} 
            alt={branding.companyName}
            className="h-12 object-contain"
          />
        </div>

        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-all text-sm"
          style={{
            color: branding.colors.mutedText,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div 
          className="rounded-2xl shadow-2xl p-8 sm:p-12"
          style={{
            background: branding.colors.cardBackground,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: branding.colors.inputBorder,
          }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4 flex justify-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: branding.colors.primaryButton,
                  boxShadow: `0 10px 30px -5px ${branding.colors.primaryButton}40`,
                }}
              >
                <Shield className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
              </div>
            </div>
            <h1 
              className="mb-2 text-3xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              Privacy Policy
            </h1>
            <p 
              className="text-sm"
              style={{ color: branding.colors.mutedText }}
            >
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p 
              className="text-sm mb-4"
              style={{ color: branding.colors.bodyText }}
            >
              At {branding.companyName}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
            <p 
              className="text-sm"
              style={{ color: branding.colors.bodyText }}
            >
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div 
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ 
                    background: branding.colors.inputBackground,
                    borderColor: branding.colors.inputBorder,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `${branding.colors.primaryButton}20`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                    </div>
                    <div>
                      <h2 
                        className="text-lg mb-2"
                        style={{ color: branding.colors.headingText }}
                      >
                        {section.title}
                      </h2>
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => (
                          <li 
                            key={itemIndex}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: branding.colors.bodyText }}
                          >
                            <span 
                              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: branding.colors.primaryButton }}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Retention */}
          <div 
            className="mt-8 p-6 rounded-xl"
            style={{ 
              background: `${branding.colors.primaryButton}10`,
              borderColor: branding.colors.primaryButton,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <h2 
              className="text-lg mb-3"
              style={{ color: branding.colors.headingText }}
            >
              Data Retention
            </h2>
            <p 
              className="text-sm"
              style={{ color: branding.colors.bodyText }}
            >
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p 
              className="text-sm mb-2"
              style={{ color: branding.colors.bodyText }}
            >
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p 
              className="text-sm font-medium"
              style={{ color: branding.colors.primaryButton }}
            >
              privacy@{branding.companyName.toLowerCase().replace(/\s+/g, '')}.com
            </p>
          </div>
        </div>

        {/* Powered by Acounta */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="text-xs" style={{ color: branding.colors.mutedText }}>Powered by</span>
          <img src={accountaLogo} alt="Acounta" className="h-4" />
        </div>
      </div>
    </div>
  );
}
