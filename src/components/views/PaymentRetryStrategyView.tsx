import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, AlertCircle, ChevronRight, Save, Info, Plus, Minus, Bell, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

export function PaymentRetryStrategyView() {
  const navigate = useNavigate();
  
  // Default retry settings: 1, 3, 7 days
  const [retry1Days, setRetry1Days] = useState(1);
  const [retry2Days, setRetry2Days] = useState(3);
  const [retry3Days, setRetry3Days] = useState(7);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Manual input states
  const [isEditingRetry1, setIsEditingRetry1] = useState(false);
  const [isEditingRetry2, setIsEditingRetry2] = useState(false);
  const [isEditingRetry3, setIsEditingRetry3] = useState(false);
  const [tempInput, setTempInput] = useState('');

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log('Saving retry settings:', {
      retry1Days,
      retry2Days,
      retry3Days,
    });
    setHasUnsavedChanges(false);
    // Show success toast
  };

  const handleIncrement = (
    currentValue: number,
    setter: (value: number) => void,
    max: number = 90
  ) => {
    const newValue = Math.min(max, currentValue + 1);
    setter(newValue);
    setHasUnsavedChanges(true);
  };

  const handleDecrement = (
    currentValue: number,
    setter: (value: number) => void,
    min: number = 1
  ) => {
    const newValue = Math.max(min, currentValue - 1);
    setter(newValue);
    setHasUnsavedChanges(true);
  };

  const handleManualInputStart = (
    currentValue: number,
    setIsEditing: (value: boolean) => void
  ) => {
    setTempInput(currentValue.toString());
    setIsEditing(true);
  };

  const handleManualInputComplete = (
    setIsEditing: (value: boolean) => void,
    setter: (value: number) => void,
    min: number = 1,
    max: number = 90
  ) => {
    const parsed = parseInt(tempInput);
    if (!isNaN(parsed)) {
      const clampedValue = Math.max(min, Math.min(max, parsed));
      setter(clampedValue);
      setHasUnsavedChanges(true);
    }
    setIsEditing(false);
    setTempInput('');
  };

  const handleManualInputCancel = (setIsEditing: (value: boolean) => void) => {
    setIsEditing(false);
    setTempInput('');
  };

  // Reusable retry input component
  const RetryInput = ({
    label,
    value,
    isEditing,
    onIncrement,
    onDecrement,
    onStartEdit,
    onCompleteEdit,
    onCancelEdit,
  }: {
    label: string;
    value: number;
    isEditing: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
    onStartEdit: () => void;
    onCompleteEdit: () => void;
    onCancelEdit: () => void;
  }) => (
    <div className="flex-1 min-w-[200px]">
      <Label className="text-gray-900 dark:text-gray-100 font-medium">{label}</Label>
      <div className="mt-2 flex items-center justify-center gap-3">
        {/* Minus Button */}
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
          style={{
            background: value <= 1 
              ? '#9CA3AF' 
              : 'linear-gradient(135deg, #EF4444, #DC2626)',
          }}
        >
          <Minus className="w-4 h-4 text-white" />
        </button>

        {/* Number Display/Input */}
        {isEditing ? (
          <Input
            type="number"
            min="1"
            max="90"
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            onBlur={onCompleteEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onCompleteEdit();
              } else if (e.key === 'Escape') {
                onCancelEdit();
              }
            }}
            autoFocus
            className="w-20 h-12 text-center font-semibold text-lg"
          />
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="w-20 h-12 rounded-lg flex flex-col items-center justify-center text-white shadow-lg border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--primaryColor), #7C3AED)',
            }}
          >
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] font-medium opacity-90">
              day{value === 1 ? '' : 's'}
            </div>
          </button>
        )}

        {/* Plus Button */}
        <button
          type="button"
          onClick={onIncrement}
          disabled={value >= 90}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-110 active:scale-95"
          style={{
            background: value >= 90 
              ? '#9CA3AF' 
              : 'linear-gradient(135deg, #10B981, #059669)',
          }}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/subscription-settings')}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2"
          >
            Billing Settings
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Payment Retry Settings
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <RotateCcw className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
              Payment Retry Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure automatic retry attempts for failed subscription payments
            </p>
          </div>
          {hasUnsavedChanges && (
            <Button
              onClick={handleSave}
              style={{ backgroundColor: 'var(--primaryColor)' }}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6 pb-32">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  About Payment Retries
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  When a subscription payment fails, the system will automatically retry the payment according to the schedule below. 
                  After all retry attempts are exhausted, the system will take the final action you specify.
                </p>
              </div>
            </div>
          </div>

          {/* Retry Schedule */}
          <Card className="p-6 shadow-sm">
            <h3 className="text-base mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              Payment Retry Schedule
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              If a payment fails, the system will automatically retry on the following schedule:
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RetryInput
                  label="First Retry (day after failure)"
                  value={retry1Days}
                  isEditing={isEditingRetry1}
                  onIncrement={() => handleIncrement(retry1Days, setRetry1Days)}
                  onDecrement={() => handleDecrement(retry1Days, setRetry1Days)}
                  onStartEdit={() => handleManualInputStart(retry1Days, setIsEditingRetry1)}
                  onCompleteEdit={() => handleManualInputComplete(setIsEditingRetry1, setRetry1Days)}
                  onCancelEdit={() => handleManualInputCancel(setIsEditingRetry1)}
                />
                <RetryInput
                  label="Second Retry (day after failure)"
                  value={retry2Days}
                  isEditing={isEditingRetry2}
                  onIncrement={() => handleIncrement(retry2Days, setRetry2Days)}
                  onDecrement={() => handleDecrement(retry2Days, setRetry2Days)}
                  onStartEdit={() => handleManualInputStart(retry2Days, setIsEditingRetry2)}
                  onCompleteEdit={() => handleManualInputComplete(setIsEditingRetry2, setRetry2Days)}
                  onCancelEdit={() => handleManualInputCancel(setIsEditingRetry2)}
                />
                <RetryInput
                  label="Third Retry (day after failure)"
                  value={retry3Days}
                  isEditing={isEditingRetry3}
                  onIncrement={() => handleIncrement(retry3Days, setRetry3Days)}
                  onDecrement={() => handleDecrement(retry3Days, setRetry3Days)}
                  onStartEdit={() => handleManualInputStart(retry3Days, setIsEditingRetry3)}
                  onCompleteEdit={() => handleManualInputComplete(setIsEditingRetry3, setRetry3Days)}
                  onCancelEdit={() => handleManualInputCancel(setIsEditingRetry3)}
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Retry Schedule Preview:</strong>
                    <ul className="mt-2 space-y-1 ml-4 list-disc">
                      <li>First retry: Day {retry1Days} (on day {retry1Days} after initial failure)</li>
                      <li>Second retry: Day {retry2Days} (on day {retry2Days} after initial failure)</li>
                      <li>Third retry: Day {retry3Days} (on day {retry3Days} after initial failure)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* After Retries: Payment Reminder Flow */}
          <Card className="p-6 shadow-sm border-2" style={{ borderColor: 'var(--primaryColor)' }}>
            <h3 className="text-base mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              After All Retries Fail: Payment Reminder Flow
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              When all automatic payment retry attempts are exhausted, the system automatically transitions to the <strong>Payment Reminder Strategy</strong>. This sends a series of reminder emails to collect payment before taking final action.
            </p>
            
            {/* Visual Flow */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white mb-2">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    3 Retry Attempts
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Up to Day {Math.max(retry1Days, retry2Days, retry3Days)}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400" />
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    Payment Reminders
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Defined by strategy
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400" />
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    Final Action
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Cancel, Suspend, etc.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/payment-reminder-strategy')}
              className="w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] hover:shadow-lg text-left bg-white dark:bg-gray-800"
              style={{ borderColor: 'var(--primaryColor)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Configure Payment Reminder Strategy
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Set up reminder emails and final actions after retries are exhausted
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </Card>

          {/* Additional Context */}
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              What happens during retry attempts?
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
              <li>The subscription status changes to "Payment Issue" (orange badge)</li>
              <li>The system displays retry count (e.g., "Retry 1/3")</li>
              <li>Next retry date is shown to administrators and clients</li>
              <li>Client can update payment method at any time to resolve the issue</li>
              <li>If payment succeeds during retry, status returns to "Active"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}