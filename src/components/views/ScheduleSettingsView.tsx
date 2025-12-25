import { Clock } from 'lucide-react';

export function ScheduleSettingsView() {
  return (
    <div className="max-w-[1200px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100">Schedule Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure firm-level scheduling preferences and availability
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Schedule Settings Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Configure working hours, time zones, booking rules, and schedule widget settings for your firm.
          </p>
        </div>
      </div>
    </div>
  );
}
