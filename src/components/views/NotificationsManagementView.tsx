/**
 * NotificationsManagementView - Visual Timeline Edition
 * 
 * Comprehensive notifications page that combines:
 * - Visual timeline with date markers and connection dots
 * - Category sidebar for quick filtering
 * - Notification history with channel indicators
 * - Inline preference management
 * - Search and filtering
 * 
 * Goal: Make it visually intuitive for users to:
 * 1. See what happened on a timeline
 * 2. Filter by category quickly
 * 3. Know how they were notified
 * 4. Change preferences right from the same screen
 */

import { useState, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Settings as SettingsIcon,
  Smartphone,
  Mail as MailIcon,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Edit2,
  RotateCcw,
  Eye,
  User,
  FileText,
  CheckSquare,
  Calendar,
  Repeat,
  PenLine,
  Download,
  Users,
  UserCircle,
  Shield,
  Briefcase,
  Clock,
  Zap,
  Send,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ExternalLink,
  Plus,
  ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';
import type { NotificationChannel, NotificationCategory } from '../../types/notifications';
import { ALL_NOTIFICATION_TYPES, CATEGORY_INFO, getNotificationExample } from '../../data/notificationTypes';

// Icon mapping for categories
const CATEGORY_ICON_MAP: Record<string, any> = {
  client: User,
  project: Briefcase,
  task: CheckSquare,
  organizer: Calendar,
  invoice: FileText,
  subscription: Repeat,
  signature: PenLine,
  'incoming-documents': Download,
  team: Users,
  hr: UserCircle,
  system: SettingsIcon,
  security: Shield,
};

// Channel icon mapping
const CHANNEL_ICON_MAP: Record<NotificationChannel, any> = {
  popup: MessageSquare,
  email: MailIcon,
  sms: Smartphone,
};

// Notification Action Configuration
interface NotificationAction {
  id: string;
  label: string;
  icon: any;
  variant?: 'default' | 'outline' | 'ghost';
  handler: (notification: NotificationHistoryItem) => void;
  requiresForm?: boolean;
  formFields?: ActionFormField[];
}

interface ActionFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

// Action configurations by notification type
const NOTIFICATION_ACTIONS: Record<string, NotificationAction[]> = {
  // Billing - Invoice Overdue
  'invoice-overdue': [
    {
      id: 'send-reminder',
      label: 'Send Reminder',
      icon: Send,
      variant: 'default',
      handler: (notification) => {
        toast.success('Reminder sent to client via email');
      },
    },
    {
      id: 'mark-paid',
      label: 'Mark Paid',
      icon: DollarSign,
      variant: 'outline',
      requiresForm: true,
      formFields: [
        { name: 'amount', label: 'Amount', type: 'number', placeholder: '0.00', required: true },
        { name: 'date', label: 'Payment Date', type: 'date', required: true },
        { name: 'method', label: 'Payment Method', type: 'select', required: true, options: [
          { value: 'card', label: 'Credit Card' },
          { value: 'ach', label: 'ACH/Bank Transfer' },
          { value: 'check', label: 'Check' },
          { value: 'cash', label: 'Cash' },
        ]},
      ],
      handler: (notification) => {
        toast.success('Invoice marked as paid');
      },
    },
    {
      id: 'view-invoice',
      label: 'View Invoice',
      icon: Eye,
      variant: 'ghost',
      handler: (notification) => {
        // Would open invoice viewer
        toast.info('Opening invoice...');
      },
    },
  ],
  
  // Document - File Review Needed
  'document-review-needed': [
    {
      id: 'review-now',
      label: 'Review Now',
      icon: Eye,
      variant: 'default',
      handler: (notification) => {
        toast.info('Opening document viewer...');
      },
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      variant: 'outline',
      requiresForm: true,
      formFields: [
        { name: 'title', label: 'Task Title', type: 'text', placeholder: 'Review client documents', required: true },
        { name: 'assignee', label: 'Assign To', type: 'select', required: true, options: [
          { value: 'me', label: 'Me' },
          { value: 'sarah', label: 'Sarah Johnson' },
          { value: 'mike', label: 'Mike Chen' },
        ]},
        { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
      ],
      handler: (notification) => {
        toast.success('Task created successfully');
      },
    },
    {
      id: 'remind-later',
      label: 'Remind Me',
      icon: Clock,
      variant: 'ghost',
      requiresForm: true,
      formFields: [
        { name: 'when', label: 'Remind me in', type: 'select', required: true, options: [
          { value: '1h', label: '1 hour' },
          { value: '3h', label: '3 hours' },
          { value: '1d', label: 'Tomorrow' },
          { value: '1w', label: 'Next week' },
        ]},
      ],
      handler: (notification) => {
        toast.success('Reminder set');
      },
    },
  ],
  
  // HR - Time Off Request
  'hr-time-off-request': [
    {
      id: 'approve',
      label: 'Approve',
      icon: ThumbsUp,
      variant: 'default',
      requiresForm: true,
      formFields: [
        { name: 'note', label: 'Note (optional)', type: 'textarea', placeholder: 'Add a note for the employee...', required: false },
      ],
      handler: (notification) => {
        toast.success('Time off request approved');
      },
    },
    {
      id: 'deny',
      label: 'Deny',
      icon: ThumbsDown,
      variant: 'outline',
      requiresForm: true,
      formFields: [
        { name: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Explain why this request is denied...', required: true },
      ],
      handler: (notification) => {
        toast.error('Time off request denied');
      },
    },
    {
      id: 'view-calendar',
      label: 'View Calendar',
      icon: Calendar,
      variant: 'ghost',
      handler: (notification) => {
        toast.info('Opening team calendar...');
      },
    },
  ],
};

// Notification history item type
interface NotificationHistoryItem {
  id: string;
  notificationTypeId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  channels: NotificationChannel[]; // How this notification was sent
  priority: 'urgent' | 'important' | 'normal' | 'low';
  actionUrl?: string;
  metadata?: Record<string, any>;
  actionHistory?: ActionHistoryItem[];
}

interface ActionHistoryItem {
  actionId: string;
  actionLabel: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

// User preference for a specific notification type
interface NotificationTypePreference {
  notificationTypeId: string;
  channels: NotificationChannel[];
  popupSound: boolean;
  isCustom: boolean; // true if differs from category defaults
}

// Time period groupings
type TimePeriod = 'now' | 'today' | 'yesterday' | 'this-week' | 'earlier';

interface TimePeriodInfo {
  label: string;
  color: string;
  bgColor: string;
}

const TIME_PERIOD_INFO: Record<TimePeriod, TimePeriodInfo> = {
  'now': { label: 'Just Now', color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.1)' },
  'today': { label: 'Today', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  'yesterday': { label: 'Yesterday', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  'this-week': { label: 'This Week', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  'earlier': { label: 'Earlier', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

export function NotificationsManagementView() {
  const navigate = useNavigate();
  
  // State
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');
  const [filterChannel, setFilterChannel] = useState<NotificationChannel | 'all'>('all');
  const [expandedSettings, setExpandedSettings] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null); // Which notification's action form is open
  const [activeAction, setActiveAction] = useState<NotificationAction | null>(null); // Which action is active
  const [actionFormData, setActionFormData] = useState<Record<string, any>>({});
  
  // Mock notification history data
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([
    {
      id: 'n1',
      notificationTypeId: 'client-payment-made',
      category: 'client',
      title: 'Payment Received',
      message: 'Payment of $1,250.00 received from Acme Corp',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n2',
      notificationTypeId: 'invoice-overdue',
      category: 'invoice',
      title: 'Invoice Overdue',
      message: 'Invoice #INV-2024-001 for Acme Corp is now 5 days overdue ($3,250.00)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n2b',
      notificationTypeId: 'document-review-needed',
      category: 'client',
      title: 'File Review Needed',
      message: 'Client uploaded tax documents that require your review - W2s and 1099 forms for 2024',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      read: false,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n2c',
      notificationTypeId: 'hr-time-off-request',
      category: 'hr',
      title: 'Time Off Request',
      message: 'Sarah Johnson requested time off: Dec 23-27, 2024 (5 days)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false,
      channels: ['popup', 'email'],
      priority: 'normal',
    },
    {
      id: 'n3',
      notificationTypeId: 'task-assigned',
      category: 'task',
      title: 'Task Assigned to You',
      message: "New task assigned: 'Review Q4 financials for Acme Corp'",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n4',
      notificationTypeId: 'signature-document-signed',
      category: 'signature',
      title: 'Document Signed',
      message: 'Sarah Johnson signed the Engagement Letter',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n5',
      notificationTypeId: 'client-document-uploaded',
      category: 'client',
      title: 'Document Uploaded',
      message: "Client uploaded 'Tax Documents 2024.pdf'",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true,
      channels: ['popup'],
      priority: 'low',
    },
    {
      id: 'n6',
      notificationTypeId: 'invoice-paid',
      category: 'invoice',
      title: 'Invoice Paid',
      message: 'Invoice #INV-2025-001 has been paid by Acme Corp ($5,250.00)',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: true,
      channels: ['popup', 'email', 'sms'],
      priority: 'important',
    },
    {
      id: 'n7',
      notificationTypeId: 'security-new-device-login',
      category: 'security',
      title: 'New Device Login',
      message: 'New login from Chrome on Windows in San Francisco, CA',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      channels: ['popup', 'email', 'sms'],
      priority: 'urgent',
    },
    {
      id: 'n8',
      notificationTypeId: 'project-deadline-approaching',
      category: 'project',
      title: 'Deadline Approaching',
      message: "Project 'Year End Close' deadline in 2 days",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      channels: ['popup', 'email'],
      priority: 'important',
    },
    {
      id: 'n9',
      notificationTypeId: 'team-member-added',
      category: 'team',
      title: 'Team Member Added',
      message: 'Jessica Martinez joined your team as Senior Accountant',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      channels: ['popup', 'email'],
      priority: 'normal',
    },
    {
      id: 'n10',
      notificationTypeId: 'system-maintenance-scheduled',
      category: 'system',
      title: 'Maintenance Scheduled',
      message: 'System maintenance scheduled for tonight at 11 PM',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      channels: ['popup', 'email'],
      priority: 'normal',
    },
    {
      id: 'n11',
      notificationTypeId: 'hr-leave-approved',
      category: 'hr',
      title: 'Leave Request Approved',
      message: 'Your leave request for December 24-26 has been approved',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      channels: ['popup', 'email'],
      priority: 'normal',
    },
    {
      id: 'n12',
      notificationTypeId: 'organizer-event-reminder',
      category: 'organizer',
      title: 'Event Reminder',
      message: 'Team Meeting starting in 15 minutes',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      read: true,
      channels: ['popup'],
      priority: 'important',
    },
  ]);

  // Mock user preferences for notification types
  const [userPreferences, setUserPreferences] = useState<Record<string, NotificationTypePreference>>({
    // Example: user has customized invoice-overdue preferences
    'invoice-overdue': {
      notificationTypeId: 'invoice-overdue',
      channels: ['popup', 'email', 'sms'],
      popupSound: true,
      isCustom: true,
    },
  });

  // Get category defaults (in real app, this would come from context)
  const getCategoryDefaults = (category: NotificationCategory) => {
    // Mock defaults
    return {
      channels: ['popup', 'email'] as NotificationChannel[],
      popupSound: false,
    };
  };

  // Get effective preference for a notification type
  const getEffectivePreference = (notificationTypeId: string) => {
    const notificationType = ALL_NOTIFICATION_TYPES.find(t => t.id === notificationTypeId);
    if (!notificationType) return { channels: ['popup'] as NotificationChannel[], popupSound: false };

    const userPref = userPreferences[notificationTypeId];
    if (userPref) {
      return { channels: userPref.channels, popupSound: userPref.popupSound };
    }

    const categoryDefaults = getCategoryDefaults(notificationType.category);
    return { channels: categoryDefaults.channels, popupSound: categoryDefaults.popupSound };
  };

  // Check if a notification type has custom preferences
  const hasCustomPreferences = (notificationTypeId: string) => {
    return userPreferences[notificationTypeId]?.isCustom || false;
  };

  // Update preference for a notification type
  const updatePreference = (
    notificationTypeId: string,
    channels: NotificationChannel[],
    popupSound: boolean
  ) => {
    const notificationType = ALL_NOTIFICATION_TYPES.find(t => t.id === notificationTypeId);
    if (!notificationType) return;

    const categoryDefaults = getCategoryDefaults(notificationType.category);
    const isCustom = 
      JSON.stringify([...channels].sort()) !== JSON.stringify([...categoryDefaults.channels].sort()) ||
      popupSound !== categoryDefaults.popupSound;

    if (isCustom) {
      setUserPreferences({
        ...userPreferences,
        [notificationTypeId]: {
          notificationTypeId,
          channels,
          popupSound,
          isCustom: true,
        },
      });
      toast.success('Notification preferences updated');
    } else {
      // Remove custom preference - using defaults
      const newPrefs = { ...userPreferences };
      delete newPrefs[notificationTypeId];
      setUserPreferences(newPrefs);
      toast.success('Reset to category defaults');
    }
  };

  // Reset to defaults
  const resetToDefaults = (notificationTypeId: string) => {
    const newPrefs = { ...userPreferences };
    delete newPrefs[notificationTypeId];
    setUserPreferences(newPrefs);
    toast.success('Reset to category defaults');
  };

  // Get time period for a notification
  const getTimePeriod = (timestamp: Date): TimePeriod => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 30) return 'now';
    if (hours < 24) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return 'this-week';
    return 'earlier';
  };

  // Filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !n.title.toLowerCase().includes(query) &&
          !n.message.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Read filter
      if (filterRead === 'unread' && n.read) return false;
      if (filterRead === 'read' && !n.read) return false;

      // Category filter
      if (filterCategory !== 'all' && n.category !== filterCategory) return false;

      // Channel filter
      if (filterChannel !== 'all' && !n.channels.includes(filterChannel)) return false;

      return true;
    });
  }, [notifications, searchQuery, filterRead, filterCategory, filterChannel]);

  // Group notifications by time period
  const groupedNotifications = useMemo(() => {
    const groups: Record<TimePeriod, NotificationHistoryItem[]> = {
      'now': [],
      'today': [],
      'yesterday': [],
      'this-week': [],
      'earlier': [],
    };

    filteredNotifications.forEach(n => {
      const period = getTimePeriod(n.timestamp);
      groups[period].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; unread: number }> = {};
    
    Object.keys(CATEGORY_INFO).forEach(cat => {
      const categoryNotifications = notifications.filter(n => n.category === cat);
      stats[cat] = {
        total: categoryNotifications.length,
        unread: categoryNotifications.filter(n => !n.read).length,
      };
    });

    return stats;
  }, [notifications]);

  // Stats
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  // Actions
  const toggleNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const markAsRead = (ids: string[], showToast: boolean = true) => {
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedNotifications([]);
    if (showToast) {
      toast.success(`Marked ${ids.length} notification${ids.length > 1 ? 's' : ''} as read`);
    }
  };

  const markAsUnread = (ids: string[]) => {
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, read: false } : n))
    );
    setSelectedNotifications([]);
    toast.success(`Marked ${ids.length} notification${ids.length > 1 ? 's' : ''} as unread`);
  };

  const deleteNotifications = (ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedNotifications([]);
    toast.success(`Deleted ${ids.length} notification${ids.length > 1 ? 's' : ''}`);
  };

  // Toggle channel for a notification type
  const toggleChannel = (notificationTypeId: string, channel: NotificationChannel) => {
    const currentPref = getEffectivePreference(notificationTypeId);
    const newChannels = currentPref.channels.includes(channel)
      ? currentPref.channels.filter(c => c !== channel)
      : [...currentPref.channels, channel];
    updatePreference(notificationTypeId, newChannels, currentPref.popupSound);
  };

  // Toggle popup sound
  const togglePopupSound = (notificationTypeId: string) => {
    const currentPref = getEffectivePreference(notificationTypeId);
    updatePreference(notificationTypeId, currentPref.channels, !currentPref.popupSound);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time for timeline
  const formatTimelineTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get opacity based on read status (NEW APPROACH)
  // Unread = Full visibility (normal, clean)
  // Read = Faded into background (you've seen it, it recedes)
  const getCardOpacity = (notification: NotificationHistoryItem) => {
    if (notification.read) {
      return 0.45; // Read notifications fade into the background
    }
    return 1; // Unread notifications stay full visibility
  };

  return (
    <div className="h-full overflow-auto relative" style={{ background: 'var(--backgroundColor, #f9fafb)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30">
          <div 
            className="absolute top-0 left-0 w-1 h-full"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--primaryColor, #7c3aed), transparent)',
              left: '240px',
              opacity: 0.15,
            }}
          />
        </div>
      </div>

      <div className="flex relative">
        {/* Category Sidebar */}
        <div 
          className="sticky top-0 h-screen w-48 border-r flex-shrink-0 overflow-y-auto"
          style={{ 
            background: 'var(--middleBackgroundColor, #ffffff)',
            borderColor: 'var(--stokeColor, #e5e7eb)',
          }}
        >
          <div className="p-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
              Categories
            </h3>
            
            {/* All Categories */}
            <button
              onClick={() => setFilterCategory('all')}
              className={cn(
                'w-full flex items-center justify-between gap-2 p-3 rounded-lg mb-1 transition-all text-left',
                filterCategory === 'all'
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primaryColor, #7c3aed)' }} />
                <span className="text-sm truncate">All</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {notifications.length}
                </span>
                {unreadCount > 0 && (
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ background: 'var(--primaryColor, #7c3aed)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            <div className="mt-3 space-y-1">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                const Icon = CATEGORY_ICON_MAP[key];
                const stats = categoryStats[key] || { total: 0, unread: 0 };
                
                return (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key as NotificationCategory)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-3 rounded-lg transition-all text-left',
                      filterCategory === key
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 dark:border-purple-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                    )}
                    style={{
                      borderColor: filterCategory === key ? info.color : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {Icon && (
                        <Icon 
                          className="w-4 h-4 flex-shrink-0" 
                          style={{ color: info.color }}
                        />
                      )}
                      <span className="text-sm truncate">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {stats.total}
                      </span>
                      {stats.unread > 0 && (
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded text-white"
                          style={{ background: info.color }}
                        >
                          {stats.unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl text-gray-900 dark:text-gray-100">Notifications Timeline</h1>
                  {unreadCount > 0 && (
                    <Badge 
                      className="text-white" 
                      style={{ background: 'var(--primaryColor, #7c3aed)' }}
                    >
                      {unreadCount} Unread
                    </Badge>
                  )}
                  {urgentCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                      {urgentCount} Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Clear Dropdown */}
                  {unreadCount > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          style={{ 
                            color: 'var(--primaryColor, #7c3aed)',
                            borderColor: 'var(--primaryColor, #7c3aed)'
                          }}
                        >
                          <Zap className="w-4 h-4" />
                          Quick Clear
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 z-[9999]" style={{ background: 'var(--middleBackgroundColor, #ffffff)' }}>
                      <DropdownMenuItem 
                        onClick={() => {
                          const unreadNotifications = filteredNotifications.filter(n => !n.read);
                          const first5 = unreadNotifications.slice(0, 5).map(n => n.id);
                          if (first5.length > 0) {
                            markAsRead(first5);
                            toast.success(`Marked ${first5.length} notification${first5.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read).length === 0}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        First 5 unread
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const unreadNotifications = filteredNotifications.filter(n => !n.read);
                          const first10 = unreadNotifications.slice(0, 10).map(n => n.id);
                          if (first10.length > 0) {
                            markAsRead(first10);
                            toast.success(`Marked ${first10.length} notification${first10.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read).length === 0}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        First 10 unread
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const unreadNotifications = filteredNotifications.filter(n => !n.read);
                          const first20 = unreadNotifications.slice(0, 20).map(n => n.id);
                          if (first20.length > 0) {
                            markAsRead(first20);
                            toast.success(`Marked ${first20.length} notification${first20.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read).length === 0}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        First 20 unread
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          const justNow = filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'now');
                          if (justNow.length > 0) {
                            markAsRead(justNow.map(n => n.id));
                            toast.success(`Marked ${justNow.length} notification${justNow.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'now').length === 0}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        All from "Just Now"
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const today = filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'today');
                          if (today.length > 0) {
                            markAsRead(today.map(n => n.id));
                            toast.success(`Marked ${today.length} notification${today.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'today').length === 0}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        All from "Today"
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const yesterday = filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'yesterday');
                          if (yesterday.length > 0) {
                            markAsRead(yesterday.map(n => n.id));
                            toast.success(`Marked ${yesterday.length} notification${yesterday.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'yesterday').length === 0}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        All from "Yesterday"
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const thisWeek = filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'this-week');
                          if (thisWeek.length > 0) {
                            markAsRead(thisWeek.map(n => n.id));
                            toast.success(`Marked ${thisWeek.length} notification${thisWeek.length > 1 ? 's' : ''} as read`);
                          }
                        }}
                        disabled={filteredNotifications.filter(n => !n.read && getTimePeriod(n.timestamp) === 'this-week').length === 0}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        All from "This Week"
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          const allUnread = filteredNotifications.filter(n => !n.read).map(n => n.id);
                          if (allUnread.length > 0) {
                            markAsRead(allUnread);
                            toast.success(`Marked all ${allUnread.length} notifications as read`);
                          }
                        }}
                        disabled={unreadCount === 0}
                        className="text-purple-600 dark:text-purple-400"
                      >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        All Visible ({unreadCount} unread)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/notification-settings')}
                    className="gap-2"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View your notification history and customize how you receive each type
              </p>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6 border shadow-sm" style={{ background: 'var(--middleBackgroundColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Read Status Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          {filterRead === 'all' ? 'All' : filterRead === 'unread' ? 'Unread' : 'Read'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilterRead('all')}>
                          All Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterRead('unread')}>
                          Unread Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterRead('read')}>
                          Read Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Channel Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          {filterChannel === 'all' ? 'All Channels' : filterChannel === 'popup' ? 'App' : filterChannel === 'email' ? 'Email' : 'SMS'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilterChannel('all')}>
                          All Channels
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterChannel('popup')}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          App Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterChannel('email')}>
                          <MailIcon className="w-4 h-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterChannel('sms')}>
                          <Smartphone className="w-4 h-4 mr-2" />
                          SMS
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Bulk Actions */}
                    {selectedNotifications.length > 0 && (
                      <>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(selectedNotifications)}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Read ({selectedNotifications.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNotifications(selectedNotifications)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Select All */}
                {filteredNotifications.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <Checkbox
                      checked={
                        selectedNotifications.length === filteredNotifications.length &&
                        filteredNotifications.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedNotifications.length > 0
                        ? `${selectedNotifications.length} selected`
                        : 'Select all'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline View */}
            {filteredNotifications.length === 0 ? (
              <Card className="border shadow-sm" style={{ background: 'var(--middleBackgroundColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search or filters'
                      : filterRead === 'unread'
                      ? "You're all caught up!"
                      : 'No notifications match your filters'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Render each time period that has notifications */}
                {(Object.keys(groupedNotifications) as TimePeriod[]).map(period => {
                  const periodNotifications = groupedNotifications[period];
                  if (periodNotifications.length === 0) return null;

                  const periodInfo = TIME_PERIOD_INFO[period];

                  return (
                    <div key={period} className="relative">
                      {/* Period Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div 
                          className="flex items-center gap-2 px-4 py-2 rounded-full"
                          style={{ 
                            background: periodInfo.bgColor,
                            color: periodInfo.color,
                          }}
                        >
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{periodInfo.label}</span>
                          <span className="text-sm opacity-75">({periodNotifications.length})</span>
                        </div>
                        <div className="flex-1 h-px" style={{ background: periodInfo.color, opacity: 0.2 }} />
                      </div>

                      {/* Notifications in this period */}
                      <div className="space-y-4 relative">
                        {/* Timeline line for this period */}
                        <div 
                          className="absolute left-6 top-0 bottom-0 w-0.5"
                          style={{ background: periodInfo.color, opacity: 0.3 }}
                        />

                        {periodNotifications.map((notification, index) => {
                          const notificationType = ALL_NOTIFICATION_TYPES.find(t => t.id === notification.notificationTypeId);
                          const categoryInfo = CATEGORY_INFO[notification.category];
                          const CategoryIcon = CATEGORY_ICON_MAP[notification.category];
                          const isExpanded = expandedSettings === notification.id;
                          const currentPref = getEffectivePreference(notification.notificationTypeId);
                          const isCustom = hasCustomPreferences(notification.notificationTypeId);
                          const cardOpacity = getCardOpacity(notification);

                          return (
                            <div key={notification.id} className="relative flex gap-6" style={{ opacity: cardOpacity }}>
                              {/* Timeline Node */}
                              <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                                {/* Time label */}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap">
                                  {formatTimelineTime(notification.timestamp)}
                                </div>
                                {/* Timeline dot */}
                                <div 
                                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-lg relative"
                                  style={{ 
                                    background: 'var(--middleBackgroundColor, #ffffff)',
                                    borderColor: categoryInfo?.color || periodInfo.color,
                                  }}
                                >
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    style={{ background: categoryInfo?.color || periodInfo.color }}
                                  >
                                    {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                                  </div>
                                </div>
                                {/* Connection line to card */}
                                <div 
                                  className="absolute left-12 top-14 w-6 h-0.5"
                                  style={{ background: categoryInfo?.color || periodInfo.color, opacity: 0.3 }}
                                />
                              </div>

                              {/* Notification Card */}
                              <div className="flex-1 pb-4">
                                <Card
                                  className={`border-2 shadow-md transition-all hover:shadow-lg cursor-pointer ${!notification.read ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}
                                  style={{
                                    background: 'var(--middleBackgroundColor, #ffffff)',
                                    borderColor: categoryInfo?.color || periodInfo.color,
                                  }}
                                  onMouseEnter={() => {
                                    // Hover to mark as read (no toast)
                                    if (!notification.read) {
                                      markAsRead([notification.id], false);
                                    }
                                  }}
                                  onClick={() => {
                                    // Click entire card to toggle read/unread
                                    if (notification.read) {
                                      markAsUnread([notification.id]);
                                    } else {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                >
                                  <CardContent className="p-4">
                                    {/* Main Notification Content */}
                                    <div className="flex items-start gap-4">
                                      {/* Checkbox */}
                                      <Checkbox
                                        checked={selectedNotifications.includes(notification.id)}
                                        onCheckedChange={() => toggleNotification(notification.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1"
                                      />

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        {/* Title and Time */}
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                              {notification.title}
                                            </h4>
                                            {notification.priority === 'urgent' && (
                                              <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                                Urgent
                                              </Badge>
                                            )}
                                            {!notification.read && (
                                              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--primaryColor, #7c3aed)' }} />
                                            )}
                                          </div>
                                          <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatTimestamp(notification.timestamp)}
                                          </span>
                                        </div>

                                        {/* Message */}
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                          {notification.message}
                                        </p>

                                        {/* Action Buttons - Command Center */}
                                        {NOTIFICATION_ACTIONS[notification.notificationTypeId] && (
                                          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                                            {/* Primary and Secondary Actions */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {NOTIFICATION_ACTIONS[notification.notificationTypeId].map((action, idx) => {
                                                const ActionIcon = action.icon;
                                                const isPrimary = idx === 0;
                                                const isSecondary = idx === 1;
                                                const isOverflow = idx > 1;

                                                if (isOverflow) return null; // Handle overflow menu separately

                                                return (
                                                  <Button
                                                    key={action.id}
                                                    variant={action.variant || 'default'}
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (action.requiresForm) {
                                                        setExpandedAction(notification.id);
                                                        setActiveAction(action);
                                                        setActionFormData({});
                                                      } else {
                                                        action.handler(notification);
                                                      }
                                                    }}
                                                    className={cn(
                                                      'gap-2',
                                                      isPrimary && 'bg-purple-600 hover:bg-purple-700 text-white border-none'
                                                    )}
                                                  >
                                                    <ActionIcon className="w-4 h-4" />
                                                    {action.label}
                                                  </Button>
                                                );
                                              })}

                                              {/* Overflow Menu for additional actions */}
                                              {NOTIFICATION_ACTIONS[notification.notificationTypeId].length > 2 && (
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-1">
                                                      <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="start">
                                                    {NOTIFICATION_ACTIONS[notification.notificationTypeId].slice(2).map((action) => {
                                                      const ActionIcon = action.icon;
                                                      return (
                                                        <DropdownMenuItem
                                                          key={action.id}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (action.requiresForm) {
                                                              setExpandedAction(notification.id);
                                                              setActiveAction(action);
                                                              setActionFormData({});
                                                            } else {
                                                              action.handler(notification);
                                                            }
                                                          }}
                                                        >
                                                          <ActionIcon className="w-4 h-4 mr-2" />
                                                          {action.label}
                                                        </DropdownMenuItem>
                                                      );
                                                    })}
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              )}
                                            </div>

                                            {/* Inline Action Form */}
                                            <AnimatePresence>
                                              {expandedAction === notification.id && activeAction?.requiresForm && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                      {activeAction.label}
                                                    </h5>
                                                    <div className="space-y-3">
                                                      {activeAction.formFields?.map((field) => (
                                                        <div key={field.name}>
                                                          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                                            {field.label}
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                          </Label>
                                                          {field.type === 'select' ? (
                                                            <select
                                                              className="w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                              style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                                                              value={actionFormData[field.name] || ''}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                setActionFormData({ ...actionFormData, [field.name]: e.target.value });
                                                              }}
                                                              onClick={(e) => e.stopPropagation()}
                                                            >
                                                              <option value="">Select...</option>
                                                              {field.options?.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                  {opt.label}
                                                                </option>
                                                              ))}
                                                            </select>
                                                          ) : field.type === 'textarea' ? (
                                                            <textarea
                                                              className="w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                              style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                                                              rows={3}
                                                              placeholder={field.placeholder}
                                                              value={actionFormData[field.name] || ''}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                setActionFormData({ ...actionFormData, [field.name]: e.target.value });
                                                              }}
                                                              onClick={(e) => e.stopPropagation()}
                                                            />
                                                          ) : (
                                                            <input
                                                              type={field.type}
                                                              className="w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                              style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                                                              placeholder={field.placeholder}
                                                              value={actionFormData[field.name] || ''}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                setActionFormData({ ...actionFormData, [field.name]: e.target.value });
                                                              }}
                                                              onClick={(e) => e.stopPropagation()}
                                                            />
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2 mt-4">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setExpandedAction(null);
                                                          setActiveAction(null);
                                                          setActionFormData({});
                                                        }}
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          activeAction.handler(notification);
                                                          setExpandedAction(null);
                                                          setActiveAction(null);
                                                          setActionFormData({});
                                                        }}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                                      >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Confirm
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>

                                            {/* Action History */}
                                            {notification.actionHistory && notification.actionHistory.length > 0 && (
                                              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                                <div className="space-y-1">
                                                  {notification.actionHistory.map((history, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                      <Check className="w-3 h-3 text-green-600" />
                                                      <span>{history.actionLabel}</span>
                                                      <span>•</span>
                                                      <span>{formatTimestamp(history.timestamp)}</span>
                                                      <span>by {history.userName}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Metadata Row */}
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                          {/* Left: Category badge */}
                                          <div className="flex items-center gap-3">
                                            <Badge 
                                              variant="outline" 
                                              className="text-xs capitalize"
                                              style={{ 
                                                borderColor: categoryInfo?.color,
                                                color: categoryInfo?.color 
                                              }}
                                            >
                                              {categoryInfo?.label || notification.category}
                                            </Badge>

                                            {isCustom && (
                                              <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                                Custom
                                              </Badge>
                                            )}
                                          </div>

                                          {/* Right: Channel Preferences + Actions */}
                                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {/* Channel Icons */}
                                            <div className="flex items-center gap-2 pr-3 border-r" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                              {/* App */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleChannel(notification.notificationTypeId, 'popup');
                                                }}
                                                className={cn(
                                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2',
                                                  currentPref.channels.includes('popup')
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-400'
                                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                )}
                                                title="In-app notifications"
                                              >
                                                <MessageSquare className={cn(
                                                  'w-4 h-4',
                                                  currentPref.channels.includes('popup')
                                                    ? 'text-purple-600 dark:text-purple-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                                )} />
                                              </button>

                                              {/* Email */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleChannel(notification.notificationTypeId, 'email');
                                                }}
                                                className={cn(
                                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2',
                                                  currentPref.channels.includes('email')
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-400'
                                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                )}
                                                title="Email notifications"
                                              >
                                                <MailIcon className={cn(
                                                  'w-4 h-4',
                                                  currentPref.channels.includes('email')
                                                    ? 'text-purple-600 dark:text-purple-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                                )} />
                                              </button>

                                              {/* SMS */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleChannel(notification.notificationTypeId, 'sms');
                                                }}
                                                className={cn(
                                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2',
                                                  currentPref.channels.includes('sms')
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-400'
                                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                )}
                                                title="SMS notifications"
                                              >
                                                <Smartphone className={cn(
                                                  'w-4 h-4',
                                                  currentPref.channels.includes('sms')
                                                    ? 'text-purple-600 dark:text-purple-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                                )} />
                                              </button>
                                            </div>
                                            
                                            {!notification.read && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  markAsRead([notification.id]);
                                                }}
                                                className="text-xs hover:underline"
                                                style={{ color: 'var(--primaryColor, #7c3aed)' }}
                                              >
                                                Mark as read
                                              </button>
                                            )}
                                            {notification.read && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  markAsUnread([notification.id]);
                                                }}
                                                className="text-xs text-gray-500 hover:underline"
                                              >
                                                Mark as unread
                                              </button>
                                            )}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedSettings(isExpanded ? null : notification.id);
                                              }}
                                              className="gap-1 h-7 px-2"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                              <span className="hidden sm:inline">Customize</span>
                                              {isExpanded ? (
                                                <ChevronUp className="w-3 h-3" />
                                              ) : (
                                                <ChevronDown className="w-3 h-3" />
                                              )}
                                            </Button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotifications([notification.id]);
                                              }}
                                              className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expandable Settings Panel */}
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                              <div className="flex items-center justify-between mb-4">
                                                <div>
                                                  <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                                                    Notification Preferences
                                                  </h5>
                                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    How do you want to receive "{notificationType?.name || notification.title}" notifications?
                                                  </p>
                                                </div>
                                                {isCustom && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      resetToDefaults(notification.notificationTypeId);
                                                    }}
                                                    className="gap-2 text-xs"
                                                  >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Reset to Defaults
                                                  </Button>
                                                )}
                                              </div>

                                              {/* Channel Selection */}
                                              <div className="mb-4">
                                                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                                                  Notification Channels
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                  {/* App/Popup */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleChannel(notification.notificationTypeId, 'popup');
                                                    }}
                                                    className={cn(
                                                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                                                      currentPref.channels.includes('popup')
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                    )}
                                                  >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="font-medium">App</span>
                                                    {currentPref.channels.includes('popup') && (
                                                      <Check className="w-4 h-4 ml-1" />
                                                    )}
                                                  </button>

                                                  {/* Email */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleChannel(notification.notificationTypeId, 'email');
                                                    }}
                                                    className={cn(
                                                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                                                      currentPref.channels.includes('email')
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                    )}
                                                  >
                                                    <MailIcon className="w-4 h-4" />
                                                    <span className="font-medium">Email</span>
                                                    {currentPref.channels.includes('email') && (
                                                      <Check className="w-4 h-4 ml-1" />
                                                    )}
                                                  </button>

                                                  {/* SMS */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleChannel(notification.notificationTypeId, 'sms');
                                                    }}
                                                    className={cn(
                                                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                                                      currentPref.channels.includes('sms')
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                    )}
                                                  >
                                                    <Smartphone className="w-4 h-4" />
                                                    <span className="font-medium">SMS</span>
                                                    {currentPref.channels.includes('sms') && (
                                                      <Check className="w-4 h-4 ml-1" />
                                                    )}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Popup Sound */}
                                              {currentPref.channels.includes('popup') && (
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                                  <div className="flex items-center gap-2">
                                                    {currentPref.popupSound ? (
                                                      <Volume2 className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                      <VolumeX className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <div>
                                                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        Notification Sound
                                                      </Label>
                                                      <p className="text-xs text-gray-500">
                                                        Play sound when app notification appears
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <Switch
                                                    checked={currentPref.popupSound}
                                                    onCheckedChange={(checked) => {
                                                      togglePopupSound(notification.notificationTypeId);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                </div>
                                              )}

                                              {/* Example Preview */}
                                              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                                                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                                                  Example
                                                </Label>
                                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                                  {getNotificationExample(notification.notificationTypeId)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
