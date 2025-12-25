import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { WorkflowProvider } from './WorkflowContext';
import { TooltipProvider } from './ui/tooltip';

/**
 * StandaloneProjectsView - A self-contained component for the Projects/KanbanBoard section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps the KanbanBoard with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the KanbanBoard component and all its dependencies
 * 3. Copy all UI components from /components/ui folder
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneProjectsView />
 */

type ProjectViewMode = 'kanban' | 'list';

interface StandaloneProjectsViewProps {
  /** Optional callback when a project is clicked */
  onProjectClick?: (project: any) => void;
  /** Optional callback when activity log is clicked */
  onActivityLogClick?: (project: any) => void;
  /** Optional callback when "New Workflow" is clicked */
  onStartWizard?: () => void;
  /** Optional callback when "Edit Workflow" is clicked */
  onEditWorkflow?: () => void;
  /** Optional callback when viewing tasks for a workflow */
  onViewTasks?: (workflowId?: string) => void;
  /** Initial view mode: 'kanban' (cards) or 'list' (table) */
  initialViewMode?: ProjectViewMode;
}

export function StandaloneProjectsView({
  onProjectClick,
  onActivityLogClick,
  onStartWizard,
  onEditWorkflow,
  onViewTasks,
  initialViewMode = 'kanban'
}: StandaloneProjectsViewProps) {
  const [projectViewMode, setProjectViewMode] = useState<ProjectViewMode>(initialViewMode);

  return (
    <WorkflowProvider>
      <TooltipProvider>
        <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
          <KanbanBoard 
            viewMode={projectViewMode}
            onViewModeChange={setProjectViewMode}
            onProjectClick={onProjectClick}
            onActivityLogClick={onActivityLogClick}
            onStartWizard={onStartWizard}
            onEditWorkflow={onEditWorkflow}
            onViewTasks={onViewTasks}
          />
        </div>
      </TooltipProvider>
    </WorkflowProvider>
  );
}