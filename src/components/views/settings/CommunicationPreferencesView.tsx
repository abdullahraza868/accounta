import { ClientPortalSettingsLayout } from './ClientPortalSettingsLayout';

export function CommunicationPreferencesView() {
  return (
    <ClientPortalSettingsLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Communication Preferences</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Configure reminder management and communication settings for client interactions.
          </p>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      </div>
    </ClientPortalSettingsLayout>
  );
}
