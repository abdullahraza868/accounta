import { Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { ArrowLeft, FileText, UserCheck, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export function TermsAndConditionsView() {
  const { branding } = useBranding();

  const sections = [
    {
      icon: UserCheck,
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using this platform, you accept and agree to be bound by these Terms and Conditions',
        'If you do not agree to these terms, you should not use this platform',
        'We reserve the right to change these terms at any time',
        'Continued use of the platform after changes constitutes acceptance of modified terms'
      ]
    },
    {
      icon: FileText,
      title: 'User Account',
      content: [
        'You must provide accurate and complete information when creating your account',
        'You are responsible for maintaining the confidentiality of your account',
        'You must notify us immediately of any unauthorized access to your account',
        'One user account per person - sharing accounts is prohibited',
        'We reserve the right to suspend or terminate accounts that violate our terms'
      ]
    },
    {
      icon: Scale,
      title: 'Acceptable Use',
      content: [
        'Use the platform only for lawful purposes and in accordance with these terms',
        'Do not use the platform to transmit any harmful or malicious content',
        'Respect the intellectual property rights of others',
        'Do not attempt to gain unauthorized access to any part of the platform',
        'Do not interfere with or disrupt the platform or servers'
      ]
    },
    {
      icon: Ban,
      title: 'Prohibited Activities',
      content: [
        'Reverse engineering, decompiling, or disassembling the platform',
        'Using automated systems or software to extract data from the platform',
        'Impersonating another user or person',
        'Uploading viruses or other malicious code',
        'Attempting to bypass any security features',
        'Using the platform for any illegal activities'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Limitation of Liability',
      content: [
        'The platform is provided "as is" without warranties of any kind',
        'We are not liable for any indirect, incidental, or consequential damages',
        'We do not guarantee uninterrupted or error-free service',
        'Your use of the platform is at your own risk',
        'We are not responsible for any data loss or security breaches'
      ]
    },
    {
      icon: RefreshCw,
      title: 'Termination',
      content: [
        'We may terminate or suspend your account at any time without prior notice',
        'You may terminate your account by contacting us',
        'Upon termination, your right to use the platform will immediately cease',
        'We may retain certain information as required by law',
        'Provisions that should survive termination will remain in effect'
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
                <FileText className="w-8 h-8" style={{ color: branding.colors.primaryButtonText }} />
              </div>
            </div>
            <h1 
              className="mb-2 text-3xl tracking-tight"
              style={{ color: branding.colors.headingText }}
            >
              Terms & Conditions
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
              Welcome to {branding.companyName}. These Terms and Conditions outline the rules and regulations for the use of our platform. By accessing this application, you agree to comply with and be bound by the following terms and conditions of use.
            </p>
            <p 
              className="text-sm"
              style={{ color: branding.colors.bodyText }}
            >
              The terminology "you," "your," and "yours" refers to the user of this platform. The terminology "we," "us," "our," and "{branding.companyName}" refers to our company. The terminology "Party," "Parties," or "us" refers to both you and us.
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

          {/* Governing Law */}
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
              Governing Law
            </h2>
            <p 
              className="text-sm"
              style={{ color: branding.colors.bodyText }}
            >
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which {branding.companyName} operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p 
              className="text-sm mb-2"
              style={{ color: branding.colors.bodyText }}
            >
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p 
              className="text-sm font-medium"
              style={{ color: branding.colors.primaryButton }}
            >
              legal@{branding.companyName.toLowerCase().replace(/\s+/g, '')}.com
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
