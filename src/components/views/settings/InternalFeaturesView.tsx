import { ArrowLeft, Code, Users, Settings, Database, Flag, Activity } from 'lucide-react';
import { Button } from '../../ui/button';

export function InternalFeaturesView() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-orange-50 via-red-50/20 to-orange-50 dark:from-gray-900 dark:via-red-950/10 dark:to-gray-900">
        <div className="max-w-[1200px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="gap-2 mb-4 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Team Members
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-gray-900 dark:text-gray-100">Internal Mode</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Internal features for managing your SaaS platform (not visible to customers)
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  Internal Features Only
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  These features are for your development team to manage the platform internally. 
                  They are not accessible to your customers and should not be exposed in customer-facing interfaces.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">User Categories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage internal user types: Regular User, Implementation Manager, Support Staff, etc.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Configure Categories
              </Button>
            </div>

            {/* Helper Accounts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Helper Accounts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create special helper accounts for customer support and onboarding assistance.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Add Helper Account
              </Button>
            </div>

            {/* System Diagnostics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">System Diagnostics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                View system health, database stats, API usage, and performance metrics.
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Diagnostics
              </Button>
            </div>

            {/* Feature Flags */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                <Flag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Feature Flags</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enable or disable features for specific customers or globally across the platform.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Manage Flags
              </Button>
            </div>

            {/* Platform Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Platform Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Track customer usage, feature adoption, and platform-wide statistics.
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Analytics
              </Button>
            </div>

            {/* Customer Impersonation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Customer Impersonation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Securely log in as a customer to troubleshoot issues and provide support.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Impersonate User
              </Button>
            </div>
          </div>

          {/* Developer Notes */}
          <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              For Your Development Team
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Placeholder Page:</strong> This is a placeholder for internal features that your development team will build.
              </p>
              <p>
                <strong>Features to implement:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>User Categories: Dropdown to assign users as "Regular User", "Implementation Manager", "Helper Account", etc.</li>
                <li>Helper Account Creation: Form to create special support/onboarding accounts</li>
                <li>System Diagnostics: Dashboard showing platform health metrics</li>
                <li>Feature Flags: Toggle features on/off per customer or globally</li>
                <li>Analytics: Customer usage statistics and feature adoption metrics</li>
                <li>Customer Impersonation: Secure way to log in as customer for support</li>
              </ul>
              <p className="pt-2">
                <strong>Security Note:</strong> Ensure proper authentication and audit logging for all internal features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
