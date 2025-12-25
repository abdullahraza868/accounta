/**
 * Example Component showing how to use toast notifications
 * 
 * This is a reference example that demonstrates various ways to trigger
 * notifications from your components.
 */

import { useState } from 'react';
import { useNotify } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  DollarSign,
  Users,
  MessageSquare,
  Shield
} from 'lucide-react';

export function NotificationExampleComponent() {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);

  // Example 1: Simple success notification
  const handleSaveClient = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    
    // Show success notification
    notify.success(
      'Client Saved',
      'John Smith has been successfully added to your client list'
    );
  };

  // Example 2: Success with action button
  const handleSaveWithAction = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    
    notify.success(
      'Client Created',
      'John Smith has been added to your client list',
      '/clients/123', // URL to navigate to
      'View Profile'   // Button label
    );
  };

  // Example 3: Error notification with action
  const handlePaymentError = () => {
    notify.error(
      'Payment Failed',
      'Unable to process payment for Invoice #INV-2025-001',
      '/billing/settings',
      'Update Payment Method'
    );
  };

  // Example 4: Warning notification
  const handleInvoiceWarning = () => {
    notify.warning(
      'Invoice Overdue',
      'Invoice #INV-2024-089 is now 15 days overdue ($3,400.00)',
      '/billing',
      'Send Reminder'
    );
  };

  // Example 5: Info notification
  const handleInfoNotification = () => {
    notify.info(
      'System Update',
      'A new version is available. Your experience has been improved!',
      '/settings',
      'View Changes'
    );
  };

  // Example 6: Payment received notification
  const handlePaymentReceived = () => {
    notify.payment(
      'Payment Received',
      'Invoice #INV-2025-001 has been paid by Acme Corp ($5,250.00)',
      '/billing',
      'View Invoice'
    );
  };

  // Example 7: Client notification
  const handleClientNotification = () => {
    notify.client(
      'New Client Request',
      'Sarah Johnson has requested to become a client',
      '/clients',
      'Review Request'
    );
  };

  // Example 8: Task notification
  const handleTaskNotification = () => {
    notify.task(
      'Task Assigned',
      'You have been assigned to review Q4 2024 financials for Acme Corp',
      '/tasks',
      'View Task'
    );
  };

  // Example 9: Message notification
  const handleMessageNotification = () => {
    notify.message(
      'New Message',
      'John Doe: "Can we schedule a meeting this week?"',
      '/messages',
      'View Message'
    );
  };

  // Example 10: Security notification
  const handleSecurityNotification = () => {
    notify.security(
      'New Login Detected',
      'Login from new device in San Francisco, CA at 2:30 PM',
      '/settings/security',
      'Review Activity'
    );
  };

  // Example 11: Custom notification with full control
  const handleCustomNotification = () => {
    notify.custom({
      type: 'invoice_sent',
      category: 'invoices',
      title: 'Bulk Invoice Send Complete',
      message: '15 invoices have been sent to clients successfully',
      priority: 'high',
      actionUrl: '/billing',
      actionLabel: 'View Invoices',
      metadata: {
        count: 15,
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Toast Notification Examples
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click any button to see how toast notifications work in action
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Notifications */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Basic Notifications
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleSaveClient}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Success (Simple)'}
            </Button>
            
            <Button 
              onClick={handleSaveWithAction}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Success (With Action)
            </Button>

            <Button 
              onClick={handlePaymentError}
              className="bg-red-600 hover:bg-red-700 text-white justify-start"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Error Notification
            </Button>

            <Button 
              onClick={handleInvoiceWarning}
              className="bg-orange-600 hover:bg-orange-700 text-white justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Warning Notification
            </Button>

            <Button 
              onClick={handleInfoNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
            >
              <Info className="w-4 h-4 mr-2" />
              Info Notification
            </Button>
          </div>
        </Card>

        {/* Context-Specific Notifications */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Context-Specific Notifications
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button 
              onClick={handlePaymentReceived}
              variant="outline"
              className="justify-start"
            >
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Payment Received
            </Button>

            <Button 
              onClick={handleClientNotification}
              variant="outline"
              className="justify-start"
            >
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              Client Notification
            </Button>

            <Button 
              onClick={handleTaskNotification}
              variant="outline"
              className="justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
              Task Notification
            </Button>

            <Button 
              onClick={handleMessageNotification}
              variant="outline"
              className="justify-start"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
              Message Notification
            </Button>

            <Button 
              onClick={handleSecurityNotification}
              variant="outline"
              className="justify-start"
            >
              <Shield className="w-4 h-4 mr-2 text-red-600" />
              Security Alert
            </Button>

            <Button 
              onClick={handleCustomNotification}
              variant="outline"
              className="justify-start"
            >
              <Info className="w-4 h-4 mr-2 text-purple-600" />
              Custom Notification
            </Button>
          </div>
        </Card>

        {/* Code Example */}
        <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Implementation Example
          </h3>
          <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`import { useNotify } from '../../contexts/NotificationContext';

function MyComponent() {
  const notify = useNotify();
  
  const handleAction = async () => {
    try {
      // Your API call or action
      await saveClient(data);
      
      // Show success notification with action button
      notify.success(
        'Client Saved',
        'John Smith has been added to your client list',
        '/clients/123',
        'View Profile'
      );
    } catch (error) {
      // Show error notification
      notify.error(
        'Save Failed',
        'Unable to save client. Please try again.',
        '/help',
        'Get Help'
      );
    }
  };
  
  return <button onClick={handleAction}>Save Client</button>;
}`}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}
