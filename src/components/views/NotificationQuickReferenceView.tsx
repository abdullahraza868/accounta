/**
 * Toast Notification Quick Reference
 * 
 * A quick reference card for the toast notification system
 */

import { Code, BookOpen, Zap, Bell, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export function NotificationQuickReferenceView() {
  const navigate = useNavigate();

  const methods = [
    { name: 'notify.success()', useCase: 'Successful operations', color: 'text-green-600 bg-green-50' },
    { name: 'notify.error()', useCase: 'Errors and failures', color: 'text-red-600 bg-red-50' },
    { name: 'notify.warning()', useCase: 'Warnings and alerts', color: 'text-orange-600 bg-orange-50' },
    { name: 'notify.info()', useCase: 'Informational messages', color: 'text-blue-600 bg-blue-50' },
    { name: 'notify.payment()', useCase: 'Payment events', color: 'text-green-600 bg-green-50' },
    { name: 'notify.client()', useCase: 'Client events', color: 'text-purple-600 bg-purple-50' },
    { name: 'notify.task()', useCase: 'Task events', color: 'text-blue-600 bg-blue-50' },
    { name: 'notify.message()', useCase: 'Messages', color: 'text-purple-600 bg-purple-50' },
    { name: 'notify.security()', useCase: 'Security events', color: 'text-red-600 bg-red-50' },
    { name: 'notify.custom()', useCase: 'Full control', color: 'text-gray-600 bg-gray-50' },
  ];

  const priorities = [
    { level: 'critical', duration: 'Never', sound: 'Loud', color: 'Red', useFor: 'Critical errors, security' },
    { level: 'high', duration: '10s', sound: 'Medium', color: 'Orange', useFor: 'Warnings, important' },
    { level: 'normal', duration: '5s', sound: 'Soft', color: 'Blue', useFor: 'Success, info, general' },
    { level: 'low', duration: '3s', sound: 'Quiet', color: 'Gray', useFor: 'Minor updates' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Toast Notifications - Quick Reference
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Everything you need to use toast notifications at a glance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-purple-600" />
          Quick Links
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            onClick={() => navigate('/notification-usage-guide')}
            variant="outline"
            className="justify-start"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Usage Guide
          </Button>
          <Button
            onClick={() => navigate('/notification-toast-demo')}
            variant="outline"
            className="justify-start"
          >
            <Bell className="w-4 h-4 mr-2" />
            Demo Page
          </Button>
          <Button
            onClick={() => navigate('/notification-settings')}
            variant="outline"
            className="justify-start"
          >
            <Code className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={() => window.open('/TOAST_NOTIFICATIONS_README.md', '_blank')}
            variant="outline"
            className="justify-start"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Full Docs
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Import & Setup */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Import & Setup
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto mb-4">
            <code>{`import { useNotify } from '../../contexts/NotificationContext';

function MyComponent() {
  const notify = useNotify();
  
  // Use notify.success(), notify.error(), etc.
}`}</code>
          </pre>
        </Card>

        {/* Simple Example */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Simple Example
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto mb-4">
            <code>{`// Basic notification
notify.success('Saved!', 'Changes saved');

// With action button
notify.success(
  'Client Added',
  'John Smith added',
  '/clients/123',    // URL
  'View Profile'      // Label
);`}</code>
          </pre>
        </Card>
      </div>

      {/* Available Methods */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Available Methods
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {methods.map((method) => (
            <div
              key={method.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${method.color}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {method.name}
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {method.useCase}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Priority Levels */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Priority Levels
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Duration</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Sound</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Color</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Use For</th>
              </tr>
            </thead>
            <tbody>
              {priorities.map((priority) => (
                <tr key={priority.level} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {priority.level}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{priority.duration}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{priority.sound}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{priority.color}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{priority.useFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Patterns */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Patterns
        </h3>
        
        <div className="space-y-4">
          {/* Pattern 1 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Form Submit with Error Handling
            </h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{`try {
  await saveData();
  notify.success('Saved', 'Data saved successfully');
} catch (error) {
  notify.error('Failed', 'Unable to save data');
}`}</code>
            </pre>
          </div>

          {/* Pattern 2 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Bulk Operation
            </h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{`const result = await bulkSend(invoices);
notify.custom({
  type: 'invoice_sent',
  category: 'invoices',
  title: 'Bulk Send Complete',
  message: \`\${result.count} invoices sent\`,
  priority: 'high'
});`}</code>
            </pre>
          </div>

          {/* Pattern 3 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Real-time Event
            </h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{`socket.on('payment', (data) => {
  notify.payment(
    'Payment Received',
    \`Invoice #\${data.id} paid (\$\${data.amount})\`,
    \`/invoices/\${data.id}\`,
    'View'
  );
});`}</code>
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
