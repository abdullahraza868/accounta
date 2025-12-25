/**
 * PHASE 3: Toast Quick Actions
 * 
 * Individual notification toasts that appear for real-time events with 
 * quick action settings directly in the toast. This is the third level 
 * of our notification architecture:
 * 
 * 1. Global bell icon (all notifications)
 * 2. Contextual in-page drawers (page-specific notifications)
 * 3. Toast quick actions (individual notification settings) ← THIS FILE
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { 
  Bell, 
  Settings, 
  X, 
  Volume2, 
  VolumeX,
  MessageSquare,
  Mail,
  Smartphone,
  DollarSign,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  TrendingUp,
  Shield,
  Briefcase,
  UserCheck,
  FileCheck,
  Activity
} from 'lucide-react';
import { cn } from './ui/utils';
import { NOTIFICATION_TYPES, type NotificationCategory, type NotificationSettings } from './views/NotificationSettingsView';

// Notification priority levels
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

// Individual notification event
export interface NotificationEvent {
  id: string;
  type: keyof typeof NOTIFICATION_TYPES;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<NotificationCategory, any> = {
  billing: DollarSign,
  invoices: FileText,
  clients: Users,
  tasks: CheckCircle,
  calendar: Calendar,
  messages: MessageSquare,
  team: UserCheck,
  documents: FileCheck,
  reports: TrendingUp,
  security: Shield,
  system: Activity,
  integrations: Briefcase
};

// Priority colors
const PRIORITY_COLORS = {
  critical: 'border-red-500 bg-red-50 dark:bg-red-950/50',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/50',
  normal: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50',
  low: 'border-gray-500 bg-gray-50 dark:bg-gray-900'
};

const PRIORITY_ICON_COLORS = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  normal: 'text-blue-600 dark:text-blue-400',
  low: 'text-gray-600 dark:text-gray-400'
};

interface NotificationToastProps {
  event: NotificationEvent;
  onSettingsClick: (event: NotificationEvent) => void;
  onDismiss: (id: string) => void;
  userSettings: NotificationSettings;
}

function NotificationToast({ event, onSettingsClick, onDismiss, userSettings }: NotificationToastProps) {
  const Icon = CATEGORY_ICONS[event.category];
  const priorityColor = PRIORITY_COLORS[event.priority];
  const iconColor = PRIORITY_ICON_COLORS[event.priority];

  // Get current settings for this notification type
  const getCurrentSettings = () => {
    return userSettings.customSettings.find(s => s.notificationId === event.type);
  };

  const settings = getCurrentSettings();
  const hasSound = settings?.popupSound ?? true;

  return (
    <div className={cn(
      "w-full max-w-md p-4 rounded-lg border-l-4 shadow-lg",
      priorityColor
    )}>
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {event.title}
            </h4>
            <button
              onClick={() => onDismiss(event.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {event.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="w-3 h-3" />
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {event.actionUrl && (
              <button
                onClick={() => window.location.href = event.actionUrl!}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition-colors"
              >
                {event.actionLabel || 'View'}
              </button>
            )}
            
            <button
              onClick={() => onSettingsClick(event)}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3 h-3" />
              Settings
            </button>

            {/* Sound indicator */}
            {hasSound ? (
              <Volume2 className="w-3.5 h-3.5 text-gray-400 ml-auto" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-400 ml-auto" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationToastManagerProps {
  userSettings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export function NotificationToastManager({ userSettings, onUpdateSettings }: NotificationToastManagerProps) {
  const [activeToasts, setActiveToasts] = useState<Map<string, string>>(new Map());

  // Function to show a notification toast
  const showNotification = (event: NotificationEvent) => {
    // Check if notification is enabled for this type
    const customSettings = userSettings?.customSettings?.find(s => s.notificationId === event.type);
    const categoryDefaults = userSettings?.categoryDefaults?.find(cd => cd.category === event.category);
    
    // Determine if popup is enabled
    const hasCustom = !!customSettings;
    const popupEnabled = hasCustom 
      ? customSettings.channels.includes('popup')
      : categoryDefaults?.channels.includes('popup') ?? true;

    if (!popupEnabled) {
      return; // Don't show toast if popup is disabled
    }

    // Play sound if enabled
    const soundEnabled = hasCustom
      ? customSettings.popupSound
      : categoryDefaults?.popupSound ?? true;
    
    if (soundEnabled && popupEnabled) {
      playNotificationSound(event.priority);
    }

    // Show toast
    const toastId = toast.custom((t) => (
      <NotificationToast
        event={event}
        onSettingsClick={handleSettingsClick}
        onDismiss={handleDismiss}
        userSettings={userSettings}
      />
    ), {
      duration: event.priority === 'critical' ? Infinity : 
                event.priority === 'high' ? 10000 : 
                event.priority === 'normal' ? 5000 : 3000,
      position: 'top-right',
    });

    setActiveToasts(prev => new Map(prev.set(event.id, toastId as string)));
  };

  // Handle settings click - open quick settings modal
  const handleSettingsClick = (event: NotificationEvent) => {
    // TODO: Open inline settings modal for this specific notification
    console.log('Open settings for:', event.type);
    toast.info('Quick settings coming soon!');
  };

  // Handle dismiss
  const handleDismiss = (id: string) => {
    const toastId = activeToasts.get(id);
    if (toastId) {
      toast.dismiss(toastId);
      setActiveToasts(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Play notification sound based on priority
  const playNotificationSound = (priority: NotificationPriority) => {
    // In a real app, this would play different sounds for different priorities
    // For now, we'll just use the browser's default notification sound
    const audio = new Audio();
    
    switch (priority) {
      case 'critical':
        // Higher pitch, more urgent sound
        audio.src = 'data:audio/wav;base64,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';
        audio.volume = 0.7;
        break;
      case 'high':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiuBzvLZiTUIGGWz7eajUBoKUKzn7rxiHQU7k9n0yHkqBCR8zPLTjT4LFGGz6OqnUhsKSKXh8btkHgcrhM/z2YgyBxlns+7jnE4MDFGl5fC4YBwGOI/U8Ml1LAUlfMnx2I4+CxRisufsp1QZCkik4fG6ZB4FKoLN8tiIOQcZZrPt45xPDAxRp+fwtWAdBTiP1/DIdSsFJHvJ8diOPgsUYrLn7KdUGQpIpOHxumQeBSqCzfLYiDkHGWaz7uOcTwwMUafn8LRgHgU4jtfwyHUrBSR7yPHYjj4LFGKy5+ynVBkKSKTh8bpkHgUqgs3y2Ig5Bxlms+7jnE4MDFGn5+';
        audio.volume = 0.5;
        break;
      case 'normal':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiuBzvLZiTUIGGWz7eajUBoKUKzn7rxiHQU7k9n0yHkqBCR8zPLTjT4LFGGz6OqnUhsKSKXh8btkHgcrhM/z2YgyBxlns+7jnE4MDFGl5fC4YBwGOI/U8Ml1LAUlfMnx2I4+CxRisufsp1QZCkik4fG6ZB4FKoLN8tiIOQcZZrPt45xPDAxRp+fwtWAdBTiP1/DIdSsFJHvJ8diOPgsUYrLn7KdUGQpIpOHxumQeBSqCzfLYiDkHGWaz7uOcTwwMUafn8LRgHgU4jtfwyHUrBSR7yPHYjj4LFGKy5+ynVBkKSKTh8bpkHgUqgs3y2Ig5Bxlms+7jnE4MDFGn5+C0YB4FOI7X8Mh1KwUke8jx2I4+CxRisufsp1QZCkik4fG6ZB4FKoLN8tiIOQcZZrPt45xODAxRp+fgtGAdBTiO1/DIBSsFJHvI8diOPgsUYrLn7KdUGQpIpOHxumQeBSqCzfLYiDkHGWaz7eOcTgwMUafn4LRgHQU4jtfwyHUrBSR7yPHYjj4LFGKy5+ynVBkKSKTh8bpkHgUqgs3y2Ig5Bxlms+3jnE4MDFGn5+C0YB0FOI7X8Mh1KwUke8jx2I4+CxRisufsp1QZCkik4fG6ZB4FKoLN8tiIOQcZZrPt45xODAxRp+fgtGAdBTiO1/DIdSsFJHvI8diOPgsUYrLn7KdUGQpIpOHxumQeBSqCzfLYiDkHGWaz7eOcTwwMUafn4LVgHQU4jtfwx3UrBSN7yPHVjEAKFGGx5+ynVBkKSKPh8bpkHgUqgs3y2Ig5Bxlms+3jnE8MDFGn5+C1YB0FOI7X8Md1KwUje8jx1YxA';
        audio.volume = 0.3;
        break;
      default:
        audio.volume = 0.2;
    }
    
    audio.play().catch(() => {
      // Silently fail if audio playback is not allowed
    });
  };

  // Expose showNotification globally so other components can trigger toasts
  useEffect(() => {
    (window as any).showNotification = showNotification;
    return () => {
      delete (window as any).showNotification;
    };
  }, [userSettings]);

  return null; // This is a headless component
}

// Helper function to trigger notifications from anywhere in the app
export function triggerNotification(event: Omit<NotificationEvent, 'id' | 'timestamp'>) {
  const fullEvent: NotificationEvent = {
    ...event,
    id: `notification-${Date.now()}-${Math.random()}`,
    timestamp: new Date()
  };
  
  if ((window as any).showNotification) {
    (window as any).showNotification(fullEvent);
  }
}

// Demo notifications for testing
export const DEMO_NOTIFICATIONS: Omit<NotificationEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'invoice_paid',
    category: 'billing',
    title: 'Payment Received',
    message: 'Invoice #INV-2025-001 has been paid by Acme Corp ($5,250.00)',
    priority: 'high',
    actionUrl: '/billing',
    actionLabel: 'View Invoice'
  },
  {
    type: 'invoice_overdue',
    category: 'invoices',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-089 is now 15 days overdue ($3,400.00)',
    priority: 'critical',
    actionUrl: '/billing',
    actionLabel: 'Send Reminder'
  },
  {
    type: 'new_client',
    category: 'clients',
    title: 'New Client Added',
    message: 'Sarah Johnson has been added to your client list',
    priority: 'normal',
    actionUrl: '/clients',
    actionLabel: 'View Profile'
  },
  {
    type: 'task_completed',
    category: 'tasks',
    title: 'Task Completed',
    message: 'Monthly reconciliation for Acme Corp has been marked complete',
    priority: 'normal',
    actionUrl: '/tasks',
    actionLabel: 'View Details'
  },
  {
    type: 'security_login',
    category: 'security',
    title: 'New Login Detected',
    message: 'Login from new device in San Francisco, CA',
    priority: 'high',
    actionUrl: '/settings/security',
    actionLabel: 'Review Activity'
  }
];