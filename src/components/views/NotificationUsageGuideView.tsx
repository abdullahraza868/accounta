/**
 * Toast Notification Usage Guide
 * 
 * This page provides comprehensive documentation and examples for using
 * the toast notification system throughout the application.
 */

import { useState } from 'react';
import { Bell, Code, Zap, BookOpen, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useNotify } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

export function NotificationUsageGuideView() {
  const notify = useNotify();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exampleUsages = [
    {
      id: 'success',
      title: 'Success Notification',
      description: 'Use for successful operations',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      code: `import { useNotify } from '../../contexts/NotificationContext';

function MyComponent() {
  const notify = useNotify();
  
  const handleSubmit = async () => {
    // ... your code
    notify.success(
      'Client Added',
      'John Smith has been added to your client list',
      '/clients/123',
      'View Profile'
    );
  };
}`,
      demo: () => notify.success(
        'Client Added',
        'John Smith has been added to your client list',
        '/clients',
        'View Clients'
      )
    },
    {
      id: 'error',
      title: 'Error Notification',
      description: 'Use for errors and failures',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      code: `notify.error(
  'Payment Failed',
  'Unable to process payment. Please check your payment method.',
  '/billing/settings',
  'Update Payment'
);`,
      demo: () => notify.error(
        'Payment Failed',
        'Unable to process payment. Please check your payment method.',
        '/billing',
        'View Billing'
      )
    },
    {
      id: 'warning',
      title: 'Warning Notification',
      description: 'Use for warnings and attention items',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      code: `notify.warning(
  'Invoice Overdue',
  'Invoice #INV-2025-089 is now 15 days overdue ($3,400.00)',
  '/billing/invoices/089',
  'Send Reminder'
);`,
      demo: () => notify.warning(
        'Invoice Overdue',
        'Invoice #INV-2025-089 is now 15 days overdue ($3,400.00)',
        '/billing',
        'View Invoice'
      )
    },
    {
      id: 'info',
      title: 'Info Notification',
      description: 'Use for informational messages',
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      code: `notify.info(
  'System Update Available',
  'A new version of the application is available. Update now?',
  '/settings/updates',
  'View Details'
);`,
      demo: () => notify.info(
        'System Update Available',
        'A new version of the application is available. Update now?',
        '/settings',
        'View Settings'
      )
    },
    {
      id: 'payment',
      title: 'Payment Notification',
      description: 'Use for payment-related events',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      code: `notify.payment(
  'Payment Received',
  'Invoice #INV-2025-001 has been paid by Acme Corp ($5,250.00)',
  '/billing/invoices/001',
  'View Invoice'
);`,
      demo: () => notify.payment(
        'Payment Received',
        'Invoice #INV-2025-001 has been paid by Acme Corp ($5,250.00)',
        '/billing',
        'View Invoice'
      )
    },
    {
      id: 'client',
      title: 'Client Notification',
      description: 'Use for client-related events',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      code: `notify.client(
  'New Client Request',
  'Sarah Johnson has requested to become a client',
  '/clients/requests',
  'Review Request'
);`,
      demo: () => notify.client(
        'New Client Request',
        'Sarah Johnson has requested to become a client',
        '/clients',
        'View Clients'
      )
    },
    {
      id: 'task',
      title: 'Task Notification',
      description: 'Use for task-related events',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      code: `notify.task(
  'Task Assigned',
  'You have been assigned to review Q4 2024 financials',
  '/tasks/456',
  'View Task'
);`,
      demo: () => notify.task(
        'Task Assigned',
        'You have been assigned to review Q4 2024 financials',
        '/tasks',
        'View Tasks'
      )
    },
    {
      id: 'message',
      title: 'Message Notification',
      description: 'Use for new messages',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      code: `notify.message(
  'New Message',
  'John Doe sent you a message: "Can we schedule a meeting?"',
  '/messages/789',
  'View Message'
);`,
      demo: () => notify.message(
        'New Message',
        'John Doe sent you a message: "Can we schedule a meeting?"',
        '/messages',
        'View Messages'
      )
    },
    {
      id: 'security',
      title: 'Security Notification',
      description: 'Use for security events',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      code: `notify.security(
  'New Login Detected',
  'Login from new device in San Francisco, CA',
  '/settings/security',
  'Review Activity'
);`,
      demo: () => notify.security(
        'New Login Detected',
        'Login from new device in San Francisco, CA',
        '/settings',
        'View Security'
      )
    },
    {
      id: 'custom',
      title: 'Custom Notification',
      description: 'Use for custom scenarios with full control',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      code: `notify.custom({
  type: 'invoice_paid',
  category: 'billing',
  title: 'Custom Event',
  message: 'Your custom message here',
  priority: 'high', // 'critical' | 'high' | 'normal' | 'low'
  actionUrl: '/custom-page',
  actionLabel: 'Custom Action',
  metadata: { customData: 'value' }
});`,
      demo: () => notify.custom({
        type: 'invoice_paid',
        category: 'billing',
        title: 'Custom Event',
        message: 'This is a custom notification with full control',
        priority: 'high',
        actionUrl: '/billing',
        actionLabel: 'Custom Action'
      })
    }
  ];

  const setupCode = `// 1. Import the hook in your component
import { useNotify } from '../../contexts/NotificationContext';

// 2. Use it in your component
function MyComponent() {
  const notify = useNotify();
  
  return (
    <button onClick={() => notify.success('Done!', 'Task completed')}>
      Click me
    </button>
  );
}`;

  const apiReference = [
    {
      method: 'notify.success(title, message, actionUrl?, actionLabel?)',
      description: 'Show a success notification (green, normal priority)',
      returns: 'void'
    },
    {
      method: 'notify.error(title, message, actionUrl?, actionLabel?)',
      description: 'Show an error notification (red, critical priority)',
      returns: 'void'
    },
    {
      method: 'notify.warning(title, message, actionUrl?, actionLabel?)',
      description: 'Show a warning notification (orange, high priority)',
      returns: 'void'
    },
    {
      method: 'notify.info(title, message, actionUrl?, actionLabel?)',
      description: 'Show an info notification (blue, normal priority)',
      returns: 'void'
    },
    {
      method: 'notify.payment(title, message, actionUrl?, actionLabel?)',
      description: 'Show a payment notification (green, high priority)',
      returns: 'void'
    },
    {
      method: 'notify.client(title, message, actionUrl?, actionLabel?)',
      description: 'Show a client notification (purple, normal priority)',
      returns: 'void'
    },
    {
      method: 'notify.task(title, message, actionUrl?, actionLabel?)',
      description: 'Show a task notification (blue, normal priority)',
      returns: 'void'
    },
    {
      method: 'notify.message(title, message, actionUrl?, actionLabel?)',
      description: 'Show a message notification (purple, normal priority)',
      returns: 'void'
    },
    {
      method: 'notify.security(title, message, actionUrl?, actionLabel?)',
      description: 'Show a security notification (red, high priority)',
      returns: 'void'
    },
    {
      method: 'notify.custom(event)',
      description: 'Show a custom notification with full control over all properties',
      returns: 'void'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Toast Notification Usage Guide
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn how to use toast notifications throughout the application
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Quick Start
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              The toast notification system is now active throughout the application. Simply import the <code className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-700 dark:text-purple-300">useNotify</code> hook and start showing notifications!
            </p>
            
            <div className="relative">
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{setupCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-700"
                onClick={() => copyCode(setupCode, 'setup')}
              >
                {copiedCode === 'setup' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Example Usages */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-600" />
          Example Usages
        </h2>
        
        <div className="grid gap-4">
          {exampleUsages.map((example) => {
            const Icon = example.icon;
            return (
              <Card key={example.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      example.bgColor
                    )}>
                      <Icon className={cn("w-5 h-5", example.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {example.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {example.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={example.demo}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Try it
                  </Button>
                </div>
                
                <div className="relative">
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-700 text-xs h-7"
                    onClick={() => copyCode(example.code, example.id)}
                  >
                    {copiedCode === example.id ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* API Reference */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          API Reference
        </h2>
        
        <div className="space-y-4">
          {apiReference.map((api, index) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
              <code className="text-sm font-mono text-purple-700 dark:text-purple-300 font-semibold">
                {api.method}
              </code>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {api.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Returns: <code>{api.returns}</code>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Best Practices
        </h2>
        
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Use appropriate priority levels:</strong> Reserve critical notifications for truly important events that require immediate attention.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Include action URLs:</strong> Provide actionUrl and actionLabel parameters to help users navigate to relevant pages.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Keep messages concise:</strong> Toast notifications auto-dismiss, so keep messages short and actionable.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Use consistent patterns:</strong> Use the type-specific methods (success, error, etc.) for consistent behavior.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Test with user settings:</strong> Remember that users can customize their notification preferences in Settings → Notifications.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}