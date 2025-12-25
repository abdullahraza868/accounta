import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { showNotification } from '../notifications/NotificationToast';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import {
  Bell,
  User,
  FileText,
  CheckSquare,
  Mail,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotificationDemoView() {
  const navigate = useNavigate();

  const demoNotifications = [
    {
      id: 'client-new-registration',
      title: 'New Client Registered',
      message: 'John Smith just created an account',
      icon: <User className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'invoice-paid',
      title: 'Invoice Paid',
      message: 'Payment of $2,500 received from Acme Corp',
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
    },
    {
      id: 'signature-document-signed',
      title: 'Document Signed',
      message: 'Sarah Johnson signed the engagement letter',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'task-assigned',
      title: 'New Task Assigned',
      message: 'You were assigned to review Q4 tax returns',
      icon: <CheckSquare className="w-5 h-5 text-orange-600" />,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Notification System Demo</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Test all three access points for managing notifications
              </p>
            </div>
          </div>
        </div>

        {/* Access Point 1: Toast Quick Actions */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium mb-1">Access Point 1: Toast Quick Actions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Every toast notification has a gear icon. Click it to instantly adjust that notification's settings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoNotifications.map((notif) => (
              <Button
                key={notif.id}
                variant="outline"
                className="justify-start gap-3"
                onClick={() => {
                  showNotification({
                    notificationId: notif.id,
                    title: notif.title,
                    message: notif.message,
                    icon: notif.icon,
                    actionButton: {
                      label: 'View Details',
                      onClick: () => console.log('Action clicked'),
                    },
                  });
                }}
              >
                {notif.icon}
                Show {notif.title}
              </Button>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            💡 <strong>Tip:</strong> Click any button above to trigger a toast notification, then click the gear icon in the toast to manage its settings.
          </p>
        </Card>

        {/* Access Point 2: Contextual In-Page Drawer */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium mb-1">Access Point 2: Contextual In-Page Drawer</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manage notifications related to the page you're on. Each drawer shows only relevant notifications for that context.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NotificationDrawer category="client" />
            <NotificationDrawer category="invoice" />
            <NotificationDrawer category="signature" />
            <NotificationDrawer category="task" />
            <NotificationDrawer category="project" />
            <NotificationDrawer category="team" />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            💡 <strong>Tip:</strong> On real pages (e.g., Clients page), you'd see "⚙️ Notifications" in the header. It opens a drawer with only client-related notifications.
          </p>
        </Card>

        {/* Access Point 3: Central Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium mb-1">Access Point 3: Central Notification Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Full management page with all 12 categories, ~80 notification types, search, filters, quiet hours, and digest options.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/notification-settings')}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="w-full"
          >
            Open Full Notification Settings
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            💡 <strong>Tip:</strong> In production, this would be accessed via the bell icon in the top navigation bar.
          </p>
        </Card>

        {/* Summary */}
        <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <h3 className="font-medium mb-3">🎯 How It All Works Together</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              <span><strong>Toast Quick Actions:</strong> User gets a notification → clicks gear icon → adjusts settings in 5 seconds</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              <span><strong>Contextual Drawer:</strong> User is on Clients page → clicks "Notifications" → manages only client notifications</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">3.</span>
              <span><strong>Central Settings:</strong> User wants full control → opens complete settings → manages everything with search/filters</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
