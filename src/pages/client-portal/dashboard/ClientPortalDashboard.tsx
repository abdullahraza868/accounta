import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FileText,
  Receipt,
  Edit,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ClientPortalDashboard() {
  const { branding } = useBranding();
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Pending Documents', value: 3, icon: FileText, color: 'blue' },
    { label: 'Unsigned Items', value: 2, icon: Edit, color: 'orange' },
    { label: 'Outstanding Invoices', value: 1, icon: Receipt, color: 'red' },
    { label: 'New Messages', value: 5, icon: MessageSquare, color: 'green' },
  ];

  const recentActivity = [
    {
      type: 'document',
      title: 'Tax Return 2024 uploaded',
      date: '2025-10-30',
      time: '2:30 PM',
      status: 'completed',
    },
    {
      type: 'signature',
      title: 'Form 8879 requires signature',
      date: '2025-10-29',
      time: '10:15 AM',
      status: 'pending',
    },
    {
      type: 'invoice',
      title: 'Invoice #2024-123 sent',
      date: '2025-10-28',
      time: '9:00 AM',
      status: 'pending',
    },
    {
      type: 'message',
      title: 'New message from your accountant',
      date: '2025-10-27',
      time: '4:45 PM',
      status: 'new',
    },
  ];

  const upcomingTasks = [
    {
      title: 'Sign Form 8879',
      dueDate: '2025-11-05',
      priority: 'high',
    },
    {
      title: 'Review and approve tax return',
      dueDate: '2025-11-07',
      priority: 'high',
    },
    {
      title: 'Pay Invoice #2024-123',
      dueDate: '2025-11-10',
      priority: 'medium',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'new':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ClientPortalLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 style={{ color: branding.colors.headingText }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Client'}!
          </h1>
          <p className="mt-2" style={{ color: branding.colors.mutedText }}>
            Here's an overview of your account activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-lg p-6 hover:shadow-lg transition-shadow border"
                style={{
                  background: branding.colors.cardBackground,
                  borderColor: branding.colors.borderColor,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.colors.primaryButton}15` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: branding.colors.primaryButton }}
                    />
                  </div>
                  <div className="text-3xl" style={{ color: branding.colors.primaryButton }}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm" style={{ color: branding.colors.mutedText }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="rounded-lg border" style={{ background: branding.colors.cardBackground, borderColor: branding.colors.borderColor }}>
            <div className="p-6 border-b" style={{ borderColor: branding.colors.borderColor }}>
              <h2 className="text-lg" style={{ color: branding.colors.headingText }}>Recent Activity</h2>
            </div>
            <div style={{ borderColor: branding.colors.borderColor }}>
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="p-4 transition-colors border-b last:border-b-0"
                  style={{ borderColor: branding.colors.borderColor }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: branding.colors.bodyText }}>
                        {activity.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                        {activity.date}
                        <span className="mx-1">•</span>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="rounded-lg border" style={{ background: branding.colors.cardBackground, borderColor: branding.colors.borderColor }}>
            <div className="p-6 border-b" style={{ borderColor: branding.colors.borderColor }}>
              <h2 className="text-lg" style={{ color: branding.colors.headingText }}>Upcoming Tasks</h2>
            </div>
            <div>
              {upcomingTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="p-4 transition-colors border-b last:border-b-0"
                  style={{ borderColor: branding.colors.borderColor }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: branding.colors.bodyText }}>
                        {task.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                        Due: {task.dueDate}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg p-6 border" style={{ background: branding.colors.cardBackground, borderColor: branding.colors.borderColor }}>
          <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              className="p-4 border rounded-lg hover:shadow-md transition-all text-center"
              style={{ borderColor: branding.colors.primaryButton }}
            >
              <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: branding.colors.primaryButton }} />
              <div className="text-sm" style={{ color: branding.colors.bodyText }}>View Documents</div>
            </button>
            <button
              className="p-4 border rounded-lg hover:shadow-md transition-all text-center"
              style={{ borderColor: branding.colors.primaryButton }}
            >
              <Edit className="w-6 h-6 mx-auto mb-2" style={{ color: branding.colors.primaryButton }} />
              <div className="text-sm" style={{ color: branding.colors.bodyText }}>Sign Documents</div>
            </button>
            <button
              className="p-4 border rounded-lg hover:shadow-md transition-all text-center"
              style={{ borderColor: branding.colors.primaryButton }}
            >
              <Receipt className="w-6 h-6 mx-auto mb-2" style={{ color: branding.colors.primaryButton }} />
              <div className="text-sm" style={{ color: branding.colors.bodyText }}>Pay Invoices</div>
            </button>
            <button
              className="p-4 border rounded-lg hover:shadow-md transition-all text-center"
              style={{ borderColor: branding.colors.primaryButton }}
            >
              <MessageSquare className="w-6 h-6 mx-auto mb-2" style={{ color: branding.colors.primaryButton }} />
              <div className="text-sm" style={{ color: branding.colors.bodyText }}>Send Message</div>
            </button>
          </div>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
