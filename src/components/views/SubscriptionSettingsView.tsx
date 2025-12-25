import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, RotateCcw, DollarSign, ChevronRight, FileText, ClipboardList, Info, Book } from 'lucide-react';
import { Button } from '../ui/button';

export function SubscriptionSettingsView() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header with Breadcrumb */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/subscriptions')}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Subscriptions
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Billing Settings
          </span>
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Billing Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure payment policies, reminder strategies, and automation
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Explanation Box */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    How Billing Automation Works
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/billing-automation-details')}
                    className="gap-2 flex-shrink-0 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Book className="w-3.5 h-3.5" />
                    View Details
                  </Button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong className="text-blue-600 dark:text-blue-400">✓ Already configured and working!</strong> Your billing automation is active with sensible defaults — you don't need to change anything. However, you can customize payment collection, reminders, and retry strategies if needed. The system intelligently handles different payment scenarios:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Subscriptions with Payment Method:</strong>
                      <span className="text-gray-700 dark:text-gray-300"> Auto-retry failed payments, then send reminders if all retries fail.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Invoices & Manual Subscriptions:</strong>
                      <span className="text-gray-700 dark:text-gray-300"> Send email reminders before and after due dates to request payment.</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  💡 <strong>Optional:</strong> Customize email templates, retry schedules, and escalation policies below to match your business needs. All activities are logged for audit purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Reminder Settings Card */}
            <button
              onClick={() => navigate('/payment-reminder-strategy')}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Subscription Payment Strategy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email payment reminders sent after payment retries fail (subscriptions with payment method).
              </p>
              <div className="mt-4 text-xs text-purple-600 dark:text-purple-400 font-medium">
                For: Subscriptions with payment method
              </div>
            </button>

            {/* Invoice Reminder Settings Card */}
            <button
              onClick={() => navigate('/invoice-reminder-strategy')}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Invoice Reminder Strategy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment reminders for invoices and subscriptions without payment methods on file.
              </p>
              <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                For: Invoices + Subscriptions without payment method
              </div>
            </button>

            {/* Payment Retry Settings Card - Not Configurable in V1 */}
            <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-left">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-medium text-amber-700 dark:text-amber-300">
                  Phase 2
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Payment Retry Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Control automatic payment retry attempts for failed subscription payments before marking as failed.
              </p>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-900 dark:text-purple-100">
                  <strong>Version 1 Default:</strong> System uses a fixed retry schedule (1, 3, 7 days after failure). Email reminders are sent automatically after all retries fail. Custom retry configuration will be available in Phase 2.
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Default schedule: 1, 3, 7 days after failure
              </div>
            </div>

            {/* Late Fee Policy Card - Coming Soon */}
            <button
              disabled
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg opacity-60 cursor-not-allowed text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-gray-400" />
                </div>
                <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                  Coming Soon
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Late Fee Policy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure automatic late fee assessments for overdue subscription payments.
              </p>
            </button>

            {/* Billing Activity Log Card */}
            <button
              onClick={() => navigate('/billing-activity-log')}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Billing Activity Log
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and track all billing activities, email communications, payment attempts, and status changes.
              </p>
              <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Audit trail for all billing events
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}