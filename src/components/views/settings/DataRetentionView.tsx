import { SecurityComplianceSettingsLayout } from './SecurityComplianceSettingsLayout';

export function DataRetentionView() {
  return (
    <SecurityComplianceSettingsLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Data Retention</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Configure data retention policies and automatic deletion schedules for compliance.
          </p>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      </div>
    </SecurityComplianceSettingsLayout>
  );
}
