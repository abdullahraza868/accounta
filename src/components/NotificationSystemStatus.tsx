/**
 * Notification System Status
 * 
 * A visual indicator that the notification system is active
 * Can be placed anywhere to show system status
 */

import { CheckCircle, Bell } from 'lucide-react';
import { Card } from './ui/card';

export function NotificationSystemStatus() {
  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Toast Notifications Active
            </h3>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300">
            System ready • Use <code className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 rounded font-mono">useNotify()</code> in any component
          </p>
        </div>
      </div>
    </Card>
  );
}

export function NotificationSystemStatusCompact() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-xs font-medium text-green-700 dark:text-green-300">
        Toast Notifications Active
      </span>
    </div>
  );
}

export function NotificationSystemBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
      <span className="text-xs font-medium text-green-700 dark:text-green-300">
        Active
      </span>
    </div>
  );
}
