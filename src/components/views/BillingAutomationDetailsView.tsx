import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, RotateCcw, FileText, CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';

export function BillingAutomationDetailsView() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/subscription-settings')}
          className="gap-2 mb-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing Settings
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            How Billing Automation Works
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A comprehensive guide to payment collection, retries, and reminders
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Overview */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              System Overview
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              The billing automation system handles payment collection intelligently based on whether a payment method is on file. It uses a three-phase approach: <strong>automatic retries</strong>, <strong>email reminders</strong>, and <strong>final actions</strong>.
            </p>
          </div>

          {/* Two Tracks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Track 1: Subscriptions with Payment Method */}
            <div className="p-6 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Track 1: Subscriptions with Payment Method
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatic retries, then email reminders
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Payment method on file (credit card, ACH, etc.)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>System automatically retries failed payments (Day 1, 3, 7)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>If all retries fail, email reminders begin (Day 7, 14, 21, 30)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Final status set on last reminder day</span>
                </div>
              </div>
            </div>

            {/* Track 2: Invoices/Subscriptions without Payment Method */}
            <div className="p-6 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Track 2: Invoices & Manual Subscriptions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email reminders only
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>No payment method on file (manual payment expected)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Pre-due reminder sent (Day -3, optional)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Post-due reminders sent (Day 1, 7, 14, 30, 45)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Final status set on last reminder day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Payment Flow Timeline (Subscriptions with Payment Method)
            </h3>
            
            <div className="space-y-6">
              {/* Phase 1: Auto Retries */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Phase 1: Automatic Payment Retries (Days 0-7)
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm">
                        <strong>Day 0:</strong> Payment Fails
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg text-sm">
                        <strong>Day 1:</strong> Retry 1
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg text-sm">
                        <strong>Day 3:</strong> Retry 2
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg text-sm">
                        <strong>Day 7:</strong> Retry 3
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-300 font-medium">Payment Issue - Retry X/3</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Decision Point */}
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400 rotate-90" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">After Day 7 Retry</p>
                </div>
              </div>

              {/* Two Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Success */}
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Payment Succeeds
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Status returns to <strong>Current</strong>. No further action needed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Failure */}
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        All Retries Fail
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Proceed to <strong>Phase 2: Email Reminders</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 2: Email Reminders */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Phase 2: Email Reminder Sequence (Days 7-30)
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg text-sm">
                        <strong>Day 7:</strong> Reminder 1
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg text-sm">
                        <strong>Day 14:</strong> Reminder 2
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg text-sm">
                        <strong>Day 21:</strong> Reminder 3
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg text-sm">
                        <strong>Day 30:</strong> Final Notice
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-300 font-medium">Payment Issue - Reminder X/Y</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Phase 3: Final Action */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Phase 3: Final Action (After Last Reminder)
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      System automatically applies the configured final action:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300"><strong>Send to Collections:</strong> Move to collections queue</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300"><strong>Write Off:</strong> Mark as bad debt</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300"><strong>Cancel Subscription:</strong> Terminate service</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300"><strong>Suspend Service:</strong> Pause access</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300"><strong>Keep Active:</strong> No action taken</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Traffic Light Status System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Green */}
              <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Current</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  All payments up to date, no issues
                </p>
              </div>

              {/* Yellow */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Payment Issue</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Active retries or reminders in progress
                </p>
                <div className="text-xs space-y-1">
                  <div className="text-gray-600 dark:text-gray-400">• "Retry X/3" - During auto-retry phase</div>
                  <div className="text-gray-600 dark:text-gray-400">• "Reminder X/Y" - During email phase</div>
                </div>
              </div>

              {/* Red */}
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Final Status</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Final action has been applied
                </p>
                <div className="text-xs space-y-1">
                  <div className="text-gray-600 dark:text-gray-400">• Collections</div>
                  <div className="text-gray-600 dark:text-gray-400">• Write Off</div>
                  <div className="text-gray-600 dark:text-gray-400">• Cancelled/Suspended</div>
                </div>
              </div>
            </div>
          </div>

          {/* Aging Buckets */}
          <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Aging Buckets & Color Coding
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Overdue invoices and subscriptions are categorized by how long they've been past due:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">1-30 Days</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Early stage</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-400 rounded-r">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">31-60 Days</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Escalating</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 rounded-r">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">61-90 Days</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Serious</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-400 rounded-r">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">90+ Days</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Key Takeaways
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>System works automatically</strong> – pre-configured with sensible defaults, no action required</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>Customization is optional</strong> – adjust retry schedules, email templates, and final actions as needed</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>Two separate tracks</strong> – one for payment methods on file (auto-retry + emails), one for manual payments (emails only)</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>Transparent status tracking</strong> – traffic light system with sub-indicators shows exactly where each payment is in the process</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>All activity is logged</strong> – full audit trail of retry attempts, emails sent, and status changes</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}