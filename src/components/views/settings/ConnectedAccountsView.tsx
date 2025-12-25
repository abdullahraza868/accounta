import { CompanySettingsLayout } from './CompanySettingsLayout';

export function ConnectedAccountsView() {
  return (
    <CompanySettingsLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Connected Accounts</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Manage integrations with third-party services for email syncing, calendar connections, and more.
          </p>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      </div>
    </CompanySettingsLayout>
  );
}
