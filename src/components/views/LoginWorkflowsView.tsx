import { Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { ArrowLeft, Key, UserPlus, UserX, Lock, Phone, Clock } from 'lucide-react';

function LoginWorkflowsView() {
  const { branding } = useBranding();

  const workflows = [
    {
      id: 'tenant-not-found',
      title: 'Tenant Not Found',
      description: 'What users see when their tenant cannot be located in the system',
      icon: UserX,
      path: '/tenant-not-found',
      color: '#ef4444',
    },
    {
      id: 'first-login',
      title: 'First Login - Passwordless (Has Phone)',
      description: 'User with existing phone: Choose Google/Microsoft/Magic Link → OTP verification → Dashboard',
      icon: UserPlus,
      path: '/workflows/first-login',
      color: '#10b981',
    },
    {
      id: 'first-login-add-phone',
      title: 'First Login - Add Phone Number',
      description: 'User without phone: Choose Google/Microsoft/Magic Link → Add phone → OTP verification → Dashboard',
      icon: Phone,
      path: '/workflows/first-login-add-phone',
      color: '#3b82f6',
    },
    {
      id: 'link-expired',
      title: 'Link Expired',
      description: 'What users see when a magic link has expired and how to request a new one',
      icon: Clock,
      path: '/workflows/link-expired?email=user@example.com&reason=expired',
      color: '#f59e0b',
    },
    // Future workflows can be added here
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
      style={{ background: branding.colors.loginBackground }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, ${branding.colors.primaryButton}, ${branding.colors.secondaryButton})`,
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, ${branding.colors.secondaryButton}, ${branding.colors.primaryButton})`,
            animationDuration: '6s',
            animationDelay: '1s'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg transition-all hover:shadow-md"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.inputBorder,
            color: branding.colors.bodyText,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ 
                background: branding.colors.primaryButton,
                boxShadow: `0 20px 40px -10px ${branding.colors.primaryButton}40`,
              }}
            >
              <Lock className="w-10 h-10" style={{ color: branding.colors.primaryButtonText }} />
            </div>
          </div>
          <h1 
            className="mb-3 text-4xl tracking-tight"
            style={{ color: branding.colors.headingText }}
          >
            Login Workflows
          </h1>
          <p 
            className="text-lg"
            style={{ color: branding.colors.mutedText }}
          >
            Test and preview different login and authentication scenarios
          </p>
        </div>

        {/* Workflow Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Link
                key={workflow.id}
                to={workflow.path}
                className="group relative p-6 rounded-2xl transition-all hover:shadow-xl"
                style={{
                  background: branding.colors.cardBackground,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: branding.colors.inputBorder,
                }}
              >
                {/* Icon */}
                <div className="mb-4 flex items-start justify-between">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ 
                      background: `${workflow.color}15`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: workflow.color }} />
                  </div>
                  
                  <div 
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: `${workflow.color}15`,
                      color: workflow.color,
                    }}
                  >
                    Test Workflow
                  </div>
                </div>

                {/* Content */}
                <h3 
                  className="mb-2 text-xl font-medium"
                  style={{ color: branding.colors.headingText }}
                >
                  {workflow.title}
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: branding.colors.mutedText }}
                >
                  {workflow.description}
                </p>

                {/* Hover Arrow */}
                <div 
                  className="mt-4 flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3"
                  style={{ color: branding.colors.linkColor }}
                >
                  <span>View Workflow</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Footer */}
        <div 
          className="mt-8 p-4 rounded-xl text-center text-sm"
          style={{
            background: `${branding.colors.primaryButton}10`,
            color: branding.colors.mutedText,
          }}
        >
          💡 These workflows are for testing purposes. They demonstrate the user experience for different login scenarios.
        </div>
      </div>
    </div>
  );
}

export { LoginWorkflowsView };
export default LoginWorkflowsView;