import { CompanySettingsLayout } from './CompanySettingsLayout';

export function CalendarSettingsView() {
  return (
    <CompanySettingsLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Calendar Settings</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Configure firm-level calendar preferences including working hours, time zones, and default views.
          </p>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      </div>
    </CompanySettingsLayout>
  );
}
