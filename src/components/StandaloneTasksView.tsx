import { useState } from 'react';
import { AllTasksView } from './AllTasksView';
import { WorkflowProvider } from './WorkflowContext';
import { TooltipProvider } from './ui/tooltip';
import { DndProviderWrapper } from './DndProviderWrapper';

/**
 * StandaloneTasksView - A self-contained component for the Tasks section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps the AllTasksView with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the AllTasksView component and all its dependencies:
 *    - TaskDetailDialog.tsx
 *    - TaskFilterPanel.tsx
 *    - FloatingTimerWidget.tsx
 *    - All related UI components
 * 3. Copy all UI components from /components/ui folder
 * 4. Copy WorkflowContext.tsx
 * 5. Copy DndProviderWrapper.tsx
 * 6. Import and use: <StandaloneTasksView />
 */

interface StandaloneTasksViewProps {
  /** Optional initial workflow filter to show tasks from a specific workflow */
  initialWorkflowFilter?: string;
  /** Optional callback when a task is clicked/opened */
  onTaskClick?: (task: any) => void;
  /** Optional callback when a task is updated */
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

export function StandaloneTasksView({
  initialWorkflowFilter,
  onTaskClick,
  onTaskUpdate
}: StandaloneTasksViewProps) {
  return (
    <WorkflowProvider>
      <TooltipProvider>
        <DndProviderWrapper>
          <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
            <AllTasksView 
              initialWorkflowFilter={initialWorkflowFilter}
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
            />
          </div>
        </DndProviderWrapper>
      </TooltipProvider>
    </WorkflowProvider>
  );
}