import React from 'react';

export type Step = {
  id: string;
  label: string;
  number: number;
};

type StepNavigationProps = {
  steps: Step[];
  currentStepId: string;
  visitedStepIds: Set<string>;
  onStepClick: (stepId: string) => void;
};

export function StepNavigation({ steps, currentStepId, visitedStepIds, onStepClick }: StepNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCurrentStep = currentStepId === step.id;
        const isVisited = visitedStepIds.has(step.id);
        const isCompleted = isVisited && !isCurrentStep;
        const isClickable = isVisited;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => {
                if (isClickable) {
                  onStepClick(step.id);
                }
              }}
              disabled={!isClickable}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isCurrentStep
                    ? 'text-white'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
                style={isCurrentStep ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span className={`text-sm ${isCurrentStep ? '' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.label}
              </span>
            </button>
            
            {/* Add divider line between steps (but not after the last step) */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 min-w-[40px]" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
