/**
 * PHASE 3 DEMO: Toast Quick Actions Testing
 * 
 * This page demonstrates the third level of our notification architecture:
 * Individual toast notifications with quick action settings.
 */

import { useState, useEffect } from 'react';
import { Bell, Play, Sparkles, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { triggerNotification, DEMO_NOTIFICATIONS, NotificationEvent } from '../NotificationToastManager';
import { NotificationToastManager } from '../NotificationToastManager';
import type { NotificationSettings } from './NotificationSettingsView';

// Helper function to get priority-based classes
function getPriorityClasses(priority: string, type: 'icon' | 'badge' | 'bg') {
  const classes = {
    critical: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
    },
    high: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      icon: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400'
    },
    normal: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
    },
    low: {
      bg: 'bg-gray-100 dark:bg-gray-900',
      icon: 'text-gray-600 dark:text-gray-400',
      badge: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400'
    }
  };
  
  return classes[priority as keyof typeof classes]?.[type] || classes.normal[type];
}

export function NotificationToastDemoView() {
  const [userSettings, setUserSettings] = useState<NotificationSettings>(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return parsed;
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const [autoDemo, setAutoDemo] = useState(false);
  const [demoInterval, setDemoInterval] = useState<number | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Auto demo mode - trigger random notifications
  useEffect(() => {
    if (autoDemo) {
      const interval = window.setInterval(() => {
        const randomNotification = DEMO_NOTIFICATIONS[Math.floor(Math.random() * DEMO_NOTIFICATIONS.length)];
        triggerNotification(randomNotification);
      }, 5000); // Every 5 seconds
      
      setDemoInterval(interval);
      
      return () => {
        if (interval) window.clearInterval(interval);
      };
    } else {
      if (demoInterval) {
        window.clearInterval(demoInterval);
        setDemoInterval(null);
      }
    }
  }, [autoDemo]);

  const handleTriggerNotification = (index: number) => {
    triggerNotification(DEMO_NOTIFICATIONS[index]);
  };

  const handleTriggerAll = () => {
    DEMO_NOTIFICATIONS.forEach((notification, index) => {
      setTimeout(() => {
        triggerNotification(notification);
      }, index * 800); // Stagger by 800ms
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast Manager - Headless Component */}
      <NotificationToastManager 
        userSettings={userSettings}
        onUpdateSettings={setUserSettings}
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Toast Notifications Demo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Phase 3: Individual notification toasts with quick actions
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Info */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Three-Level Notification Architecture
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span><strong>Global Bell Icon:</strong> View all notifications across the entire system</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span><strong>Contextual In-Page Drawers:</strong> Page-specific notifications (e.g., billing page notifications)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold shadow">
                  3
                </span>
                <span><strong>Toast Quick Actions:</strong> Real-time individual notifications with settings (YOU ARE HERE)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Controls */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Demo Controls</h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button
            onClick={handleTriggerAll}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Trigger All Notifications
          </Button>
          
          <Button
            onClick={() => setAutoDemo(!autoDemo)}
            variant={autoDemo ? "destructive" : "outline"}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoDemo ? "animate-spin" : ""}`} />
            {autoDemo ? 'Stop' : 'Start'} Auto Demo
          </Button>

          <Button
            onClick={() => window.location.href = '/settings/notifications'}
            variant="outline"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Auto demo will trigger a random notification every 5 seconds
        </p>
      </Card>

      {/* Individual Notification Triggers */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Individual Notifications</h3>
        
        <div className="grid gap-3">
          {DEMO_NOTIFICATIONS.map((notification, index) => (
            <button
              key={index}
              onClick={() => handleTriggerNotification(index)}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getPriorityClasses(notification.priority, 'bg')}`}>
                <Bell className={`w-5 h-5 ${getPriorityClasses(notification.priority, 'icon')}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityClasses(notification.priority, 'badge')}`}>
                    {notification.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
                    {notification.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>
              
              <Play className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </Card>

      {/* Features List */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Toast Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">✨ Visual Features</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Priority-based colors (critical, high, normal, low)</li>
              <li>• Category icons and context</li>
              <li>• Auto-dismiss based on priority</li>
              <li>• Responsive layout</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">⚙️ Functional Features</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Quick action buttons (View, Settings)</li>
              <li>• Sound indicators (Volume2/VolumeX icons)</li>
              <li>• Priority-based sound effects</li>
              <li>• Respects user notification settings</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">🎛️ Settings Integration</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Honors popup enable/disable per type</li>
              <li>• Respects category defaults</li>
              <li>• Custom notification overrides</li>
              <li>• Quiet hours support (coming soon)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">🔗 Integration Points</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Global trigger function available</li>
              <li>• Link to full notification settings</li>
              <li>• Action URLs for quick navigation</li>
              <li>• Metadata support for context</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function for default settings
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