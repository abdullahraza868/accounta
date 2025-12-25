import { SecurityComplianceSettingsLayout } from './SecurityComplianceSettingsLayout';

export function AuditLogsView() {
  return (
    <SecurityComplianceSettingsLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Audit Logs</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            View comprehensive audit trails of all system activities and user actions for security monitoring.
          </p>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      </div>
    </SecurityComplianceSettingsLayout>
  );
}
