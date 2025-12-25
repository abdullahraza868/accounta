import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  User, 
  Download, 
  CheckSquare, 
  Users, 
  Settings,
  Check,
  Clock,
  Mail,
  Smartphone,
  Volume2,
  BellOff,
} from 'lucide-react';
import { cn } from './ui/utils';
import { NotificationPriority } from '../types/notifications';

export interface WizardAnswers {
  'money-invoices': NotificationPriority;
  'clients-signatures': NotificationPriority;
  'documents-files': NotificationPriority;
  'tasks-projects-organizer': NotificationPriority;
  'team-hr': NotificationPriority;
  'system-security': NotificationPriority;
}

interface NotificationSetupWizardProps {
  onComplete: (answers: WizardAnswers, quietHours: { enabled: boolean; startTime: string; endTime: string }) => void;
  onSkip: () => void;
  currentDefaults?: Partial<WizardAnswers>; // Show user what their current defaults are
}

interface WizardStep {
  id: keyof WizardAnswers | 'quiet-hours' | 'summary';
  title: string;
  description: string;
  icon: any;
  examples: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'money-invoices',
    title: 'Money & Invoices',
    description: 'How should we notify you about financial events?',
    icon: FileText,
    examples: 'Invoice paid, Payment received, Invoice overdue, Payment failed',
  },
  {
    id: 'clients-signatures',
    title: 'Client Communications & Signatures',
    description: 'How should we notify you about client interactions?',
    icon: User,
    examples: 'Client message received, Signature requested, Client portal access granted',
  },
  {
    id: 'documents-files',
    title: 'Documents & Files',
    description: 'How should we notify you about document activities?',
    icon: Download,
    examples: 'File uploaded, Document ready for review, Incoming document received',
  },
  {
    id: 'tasks-projects-organizer',
    title: 'Tasks, Projects & Organizer',
    description: 'How should we notify you about work items?',
    icon: CheckSquare,
    examples: 'Task assigned to you, Deadline approaching, Project milestone completed',
  },
  {
    id: 'team-hr',
    title: 'Team & HR',
    description: 'How should we notify you about team activities?',
    icon: Users,
    examples: 'Team member added, Time off request, New hire onboarding',
  },
  {
    id: 'system-security',
    title: 'System & Security',
    description: 'How should we notify you about system events?',
    icon: Settings,
    examples: 'Login from new device, Account locked, System update available',
  },
  {
    id: 'quiet-hours',
    title: 'Quiet Hours',
    description: 'Set up do-not-disturb schedule',
    icon: Clock,
    examples: 'Optional: Block notifications during specific hours',
  },
  {
    id: 'summary',
    title: 'Review Your Preferences',
    description: 'Summary of your notification settings',
    icon: Check,
    examples: 'You can always customize individual notifications later',
  },
];

const PRIORITY_OPTIONS = [
  {
    id: 'urgent' as NotificationPriority,
    label: 'Urgent',
    description: 'Popup with sound + Email + SMS',
    icon: Volume2,
    color: 'red',
  },
  {
    id: 'important' as NotificationPriority,
    label: 'Important',
    description: 'Popup + Email',
    icon: Smartphone,
    color: 'orange',
  },
  {
    id: 'normal' as NotificationPriority,
    label: 'Normal',
    description: 'Email only',
    icon: Mail,
    color: 'blue',
  },
  {
    id: 'low' as NotificationPriority,
    label: 'Low Priority',
    description: 'Daily Email Digest',
    icon: Clock,
    color: 'gray',
  },
  {
    id: 'off' as NotificationPriority,
    label: "Don't notify me",
    description: 'No notifications',
    icon: BellOff,
    color: 'gray',
  },
];

export function NotificationSetupWizard({ onComplete, onSkip, currentDefaults }: NotificationSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>(currentDefaults || {});
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  });

  const step = WIZARD_STEPS[currentStep];
  const isQuestionStep = currentStep < 6;
  const isQuietHoursStep = currentStep === 6;
  const isSummaryStep = currentStep === 7;
  const canProceed = isSummaryStep || isQuietHoursStep || (isQuestionStep && answers[step.id as keyof WizardAnswers]);

  const handleSelect = (priority: NotificationPriority) => {
    if (isQuestionStep) {
      setAnswers(prev => ({ ...prev, [step.id]: priority }));
    }
  };

  const handleNext = () => {
    if (isSummaryStep) {
      onComplete(answers as WizardAnswers, quietHours);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getPriorityColor = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'orange': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300';
      case 'blue': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'gray': return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  const getStepLabel = (id: string) => {
    const stepData = WIZARD_STEPS.find(s => s.id === id);
    return stepData?.title || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
              Notification Setup
            </h2>
            <button
              onClick={onSkip}
              className="text-xs md:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Skip for now
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2">
            {WIZARD_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-300",
                  idx <= currentStep ? "bg-gradient-to-r from-purple-500 to-purple-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            ))}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step Icon and Title */}
              <div className="text-center mb-6 md:mb-8">
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30"
                >
                  <step.icon 
                    className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-2">
                  {step.description}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {step.examples}
                </p>
              </div>

              {/* Question Step - Priority Options */}
              {isQuestionStep && (
                <div className="space-y-3 max-w-2xl mx-auto">
                  {/* Show current default indicator */}
                  {currentDefaults && currentDefaults[step.id as keyof WizardAnswers] && (
                    <div className="text-center mb-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-semibold">Current default:</span> {PRIORITY_OPTIONS.find(o => o.id === currentDefaults[step.id as keyof WizardAnswers])?.label}
                      </p>
                    </div>
                  )}
                  
                  {PRIORITY_OPTIONS.map((option) => {
                    const isSelected = answers[step.id as keyof WizardAnswers] === option.id;
                    const isCurrentDefault = currentDefaults && currentDefaults[step.id as keyof WizardAnswers] === option.id;
                    const OptionIcon = option.icon;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 relative",
                          "hover:shadow-md",
                          isSelected 
                            ? getPriorityColor(option.color)
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        {isCurrentDefault && !isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Default
                          </div>
                        )}
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-white/50 dark:bg-black/20" : "bg-gray-100 dark:bg-gray-800"
                        )}>
                          <OptionIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{option.label}</div>
                          <div className={cn(
                            "text-sm",
                            isSelected ? "opacity-90" : "text-gray-500 dark:text-gray-400"
                          )}>
                            {option.description}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-6 h-6 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quiet Hours Step */}
              {isQuietHoursStep && (
                <div className="max-w-2xl mx-auto">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">
                            Enable Quiet Hours
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Block non-urgent notifications during specific times
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuietHours(prev => ({ ...prev, enabled: true }))}
                            className={cn(
                              "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm min-w-[95px] whitespace-nowrap",
                              quietHours.enabled 
                                ? "flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-md"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                            )}
                          >
                            {quietHours.enabled && <Check className="w-3.5 h-3.5" />}
                            <span>Turn On</span>
                          </button>
                          {quietHours.enabled && (
                            <button
                              onClick={() => setQuietHours(prev => ({ ...prev, enabled: false }))}
                              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md min-w-[95px] whitespace-nowrap"
                            >
                              Turn Off
                            </button>
                          )}
                        </div>
                      </div>

                      {quietHours.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={quietHours.startTime}
                                onChange={(e) => setQuietHours(prev => ({ ...prev, startTime: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={quietHours.endTime}
                                onChange={(e) => setQuietHours(prev => ({ ...prev, endTime: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Urgent notifications (security, failed payments) will still come through
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Summary Step */}
              {isSummaryStep && (
                <div className="max-w-2xl mx-auto space-y-4">
                  {Object.entries(answers).map(([key, value]) => {
                    const option = PRIORITY_OPTIONS.find(o => o.id === value);
                    return (
                      <Card key={key} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {getStepLabel(key)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {option?.description}
                            </div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            option?.color === 'red' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                            option?.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                            option?.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                            option?.color === 'gray' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                          )}>
                            {option?.label}
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {quietHours.enabled && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Quiet Hours
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quietHours.startTime} - {quietHours.endTime}
                          </div>
                        </div>
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                    </Card>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ✓ You can customize individual notification types anytime in the detailed settings below.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm"
          >
            <span className="hidden sm:inline">{isSummaryStep ? 'Complete Setup' : 'Next'}</span>
            <span className="sm:hidden">{isSummaryStep ? 'Complete' : 'Next'}</span>
            {!isSummaryStep && <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}