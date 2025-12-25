/**
 * NotificationContext
 * 
 * Provides global toast notification functionality throughout the application.
 * This context manages notification settings and provides a simple API to trigger
 * toast notifications from any component.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationToastManager, triggerNotification, type NotificationEvent } from '../components/NotificationToastManager';
import type { NotificationSettings } from '../components/views/NotificationSettingsView';

interface NotificationContextType {
  userSettings: NotificationSettings;
  updateSettings: (settings: NotificationSettings) => void;
  showNotification: (event: Omit<NotificationEvent, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default notification settings
function getDefaultSettings(): NotificationSettings {
  return {
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      allowCritical: true
    },
    categoryDefaults: [],
    customSettings: []
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [userSettings, setUserSettings] = useState<NotificationSettings>(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  const updateSettings = (settings: NotificationSettings) => {
    setUserSettings(settings);
  };

  const showNotification = (event: Omit<NotificationEvent, 'id' | 'timestamp'>) => {
    triggerNotification(event);
  };

  return (
    <NotificationContext.Provider value={{ userSettings, updateSettings, showNotification }}>
      {/* Mount the toast manager */}
      <NotificationToastManager 
        userSettings={userSettings}
        onUpdateSettings={updateSettings}
      />
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hooks for common notification types
export function useNotify() {
  const { showNotification } = useNotifications();

  return {
    // Success notification
    success: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'task_completed',
        category: 'tasks',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Error notification
    error: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'system_error',
        category: 'system',
        title,
        message,
        priority: 'critical',
        actionUrl,
        actionLabel
      });
    },

    // Warning notification
    warning: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'invoice_overdue',
        category: 'invoices',
        title,
        message,
        priority: 'high',
        actionUrl,
        actionLabel
      });
    },

    // Info notification
    info: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'system_update',
        category: 'system',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Invoice notification
    invoice: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'invoice_paid',
        category: 'invoices',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Client notification
    client: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'new_client',
        category: 'clients',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Payment notification
    payment: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'invoice_paid',
        category: 'billing',
        title,
        message,
        priority: 'high',
        actionUrl,
        actionLabel
      });
    },

    // Security notification
    security: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'security_login',
        category: 'security',
        title,
        message,
        priority: 'high',
        actionUrl,
        actionLabel
      });
    },

    // Task notification
    task: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'task_assigned',
        category: 'tasks',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Message notification
    message: (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      showNotification({
        type: 'message_received',
        category: 'messages',
        title,
        message,
        priority: 'normal',
        actionUrl,
        actionLabel
      });
    },

    // Custom notification with full control
    custom: (event: Omit<NotificationEvent, 'id' | 'timestamp'>) => {
      showNotification(event);
    }
  };
}
