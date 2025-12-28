import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Settings, Trash2, GripVertical, Zap, User, Clock, ChevronRight, Edit, AlertTriangle, GitBranch, CheckSquare, Play, Users, Copy, FolderKanban, Eye, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { AutomationBuilder } from '../components/AutomationBuilderFigmaVersion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { useWorkflowContext, Workflow as ContextWorkflow } from './WorkflowContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  triggerTaskId?: string; // Optional: if trigger is task-specific
  enabled: boolean;
  actions: string[];
  conditions?: Array<{
    id: string;
    field: string;
    operator: string;
    value: string | number | boolean | string[];
  }>;
  details?: string; // e.g., "3 days after completion"
}

interface QuickAction {
  id: string;
  type: string; // 'send-email', 'create-task', 'update-field', etc.
  label: string;
  config?: any; // Action-specific configuration
}

interface Task {
  id: string;
  name: string;
  description: string;
  assigneeRole: string;
  assignmentType: 'direct' | 'inherit'; // How the task is assigned
  inheritFromTaskId?: string; // If assignmentType is 'inherit', which task to inherit from
  estimatedTime: string;
  movesToNextStage: boolean;
  dependencies: string[]; // Array of task IDs this task depends on
  quickActions?: QuickAction[]; // Simple actions that happen after task completion
}

interface Stage {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
  automations: Automation[]; // Actual automations stored at stage level
  trackerLabel: string;
  trackerIcon?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  stages: Stage[];
}

interface DraggableTaskProps {
  task: Task;
  taskIndex: number;
  stageId: string;
  totalTasks: number;
  allTasks: Task[];
  onMove: (fromIndex: number, toIndex: number) => void;
  onMoveBetweenStages: (task: Task, fromStageId: string, toStageId: string, insertIndex: number) => void;
  isOutOfOrder: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

interface DroppableStageProps {
  stage: Stage;
  stageIndex: number;
  totalStages: number;
  onDropTask: (task: Task, fromStageId: string, toStageId: string, insertIndex?: number) => void;
  children: React.ReactNode;
}

const DroppableStage = ({ stage, stageIndex, totalStages, onDropTask, children }: DroppableStageProps) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { task: Task; taskIndex: number; stageId: string }) => {
      // Only handle cross-stage drops here
      if (item.stageId !== stage.id) {
        onDropTask(item.task, item.stageId, stage.id);
      }
    },
    canDrop: (item: { task: Task; taskIndex: number; stageId: string }) => {
      // Can drop if it's from a different stage
      return item.stageId !== stage.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} className="relative">
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-violet-100/90 border-4 border-violet-400 border-dashed rounded-lg z-10 pointer-events-none flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Badge className="bg-violet-500 text-white text-sm px-4 py-2 shadow-lg">
              Drop to move task to {stage.name}
            </Badge>
          </div>
        </div>
      )}
      <div className={`transition-all ${isOver && canDrop ? 'opacity-30 scale-[0.98]' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const DraggableTask = ({ task, taskIndex, stageId, totalTasks, allTasks, onMove, onMoveBetweenStages, isOutOfOrder, onEditClick, onDeleteClick }: DraggableTaskProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { task, taskIndex, stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Clean up if needed
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { task: Task; taskIndex: number; stageId: string }) => {
      if (item.stageId === stageId && item.taskIndex !== taskIndex) {
        // Same stage - reorder
        onMove(item.taskIndex, taskIndex);
      } else if (item.stageId !== stageId) {
        // Different stage - insert at this position
        onMoveBetweenStages(item.task, item.stageId, stageId, taskIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={(node) => drag(drop(node))}>
      <Card
        className={`p-3 transition-all ${
          isDragging ? 'opacity-30 cursor-grabbing scale-95' : 'cursor-grab'
        } ${
          isOver && !isDragging ? 'border-violet-400 shadow-lg' : 'border-slate-200'
        } ${
          isOutOfOrder 
            ? 'border-red-300 bg-red-50' 
            : 'bg-white hover:shadow-sm'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">{taskIndex + 1}.</span>
                <p className="text-sm text-slate-900">{task.name}</p>
                {isOutOfOrder && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Out of order
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-9">{task.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
              >
                <Edit className="w-3 h-3 text-slate-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
              >
                <Trash2 className="w-3 h-3 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-9 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1 min-w-0">
              <User className="w-3 h-3 flex-shrink-0" />
              {task.assignmentType === 'inherit' ? (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-violet-600 whitespace-nowrap">Inherits from</span>
                  <span className="text-slate-700 truncate max-w-[150px]" title={allTasks.find(t => t.id === task.inheritFromTaskId)?.name || 'Unknown'}>
                    {allTasks.find(t => t.id === task.inheritFromTaskId)?.name || 'Unknown'}
                  </span>
                </div>
              ) : (
                task.assigneeRole
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedTime}
            </div>
            {task.dependencies && task.dependencies.length > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <GitBranch className="w-3 h-3" />
                {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
              </Badge>
            )}
            {task.movesToNextStage && (
              <Badge className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-100">
                → Next stage
              </Badge>
            )}
            {(() => {
              const childCount = allTasks.filter(t => t.assignmentType === 'inherit' && t.inheritFromTaskId === task.id).length;
              return childCount > 0 ? (
                <Badge className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-100 gap-1">
                  <Users className="w-3 h-3" />
                  {childCount} inherit{childCount > 1 ? '' : 's'}
                </Badge>
              ) : null;
            })()}
            {task.quickActions && task.quickActions.length > 0 && (
              <Badge className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-100 gap-1">
                <Zap className="w-3 h-3" />
                {task.quickActions.length} action{task.quickActions.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {isOutOfOrder && (
            <div className="ml-[52px] p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Task that moves to next stage should be the last task.</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

interface AutomationCardProps {
  automation: Automation;
  automationIndex: number;
  stageId: string;
  onMove: (fromIndex: number, toIndex: number) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onToggleEnabled: () => void;
}

const DraggableAutomation = ({ automation, automationIndex, stageId, onMove, onEditClick, onDeleteClick, onToggleEnabled }: AutomationCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'AUTOMATION',
    item: { automation, automationIndex, stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'AUTOMATION',
    drop: (item: { automation: Automation; automationIndex: number; stageId: string }) => {
      if (item.stageId === stageId && item.automationIndex !== automationIndex) {
        onMove(item.automationIndex, automationIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'stage_entered': return 'When stage entered';
      case 'stage_completed': return 'When stage completed';
      case 'specific_task_completed': return 'When task completed';
      case 'time_based': return 'Time-based';
      case 'time_after_task': return 'Time after task';
      default: return trigger;
    }
  };

  return (
    <div ref={(node) => drag(drop(node))}>
      <Card className={`p-3 transition-all ${
        isDragging ? 'opacity-30 cursor-grabbing scale-95' : 'cursor-grab'
      } ${
        isOver && !isDragging ? 'border-violet-400 shadow-lg' : 'border-slate-200'
      } bg-blue-50/30 hover:shadow-sm`}>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <Zap className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <p className="text-sm text-slate-900 truncate">{automation.name}</p>
              {!automation.enabled && (
                <Badge variant="outline" className="text-xs text-slate-400 flex-shrink-0">
                  Disabled
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleEnabled}
              >
                <Settings className="w-3 h-3 text-slate-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onEditClick}
              >
                <Edit className="w-3 h-3 text-slate-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onDeleteClick}
              >
                <Trash2 className="w-3 h-3 text-slate-400" />
              </Button>
            </div>
          </div>
          
          <div className="ml-6 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-violet-50 text-violet-700 border-violet-200 flex-shrink-0">
                <Play className="w-3 h-3 mr-1" />
                {getTriggerLabel(automation.trigger)}
              </Badge>
              {automation.details && (
                <span className="text-xs text-slate-500">{automation.details}</span>
              )}
            </div>
            <div className="flex items-start gap-1 text-xs text-slate-500">
              <span className="text-slate-400 whitespace-nowrap">Actions:</span>
              <span className="break-words">{automation.actions.join(' → ')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ==================== CUSTOMER STAGE INDICATOR COMPONENT ====================
interface CustomerStageIndicatorProps {
  stage: Stage;
  stageIndex: number;
  stages: Stage[];
  currentActiveStageIndex: number;
  onEdit?: () => void;
}

function CustomerStageIndicator({
  stage,
  stageIndex,
  stages,
  currentActiveStageIndex,
  onEdit,
}: CustomerStageIndicatorProps) {
  // Group stages by tracker label to find position in overall progress
  const trackerGroups = stages.reduce((acc: any[], s, idx) => {
    const lastGroup = acc[acc.length - 1];
    if (!lastGroup || lastGroup.label !== s.trackerLabel) {
      acc.push({
        label: s.trackerLabel,
        icon: s.trackerIcon,
        stageCount: 1,
        stageIds: [s.id],
        stageIndex: idx,
      });
    } else {
      lastGroup.stageCount += 1;
      lastGroup.stageIds.push(s.id);
    }
    return acc;
  }, []);

  // Find which group this stage belongs to
  const thisStageGroupIndex = trackerGroups.findIndex(group => 
    group.stageIds.includes(stage.id)
  );

  // Find which group the active stage belongs to (based on currentActiveStageIndex)
  const activeStage = stages[currentActiveStageIndex];
  const currentGroupIndex = activeStage 
    ? trackerGroups.findIndex(group => group.stageIds.includes(activeStage.id))
    : 0;

  // Determine status of this stage's group
  const isCompleted = thisStageGroupIndex < currentGroupIndex;
  const isCurrent = thisStageGroupIndex === currentGroupIndex;
  const isPending = thisStageGroupIndex > currentGroupIndex;

  return (
    <div className="px-3 py-3 bg-gradient-to-br from-violet-50 to-blue-50 border-b border-violet-200">
      <div className="relative">
        {/* Single Tracker Step - Only this stage's indicator */}
        <div className="flex relative z-20 justify-center">
          <div className="flex flex-col items-center justify-start">
            {/* Tracker Circle */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow relative z-30
              ${isCompleted ? 'bg-green-500 text-white' : ''}
              ${isCurrent ? 'bg-violet-500 text-white ring-4 ring-violet-200' : ''}
              ${isPending ? 'bg-slate-200 text-slate-400' : ''}
            `}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm">{stage.trackerIcon || '📝'}</span>
              )}
            </div>

            {/* Tracker Label */}
            <div className="text-center group/tracker relative">
              <p className={`text-xs ${
                isCurrent ? 'text-violet-700' : 
                isCompleted ? 'text-green-700' : 
                'text-slate-500'
              }`}>
                {stage.trackerLabel || 'Not set'}
              </p>
              {isCurrent && (
                <Badge className="mt-1 bg-violet-600 hover:bg-violet-600 text-white text-xs px-2 py-0">
                  In Progress
                </Badge>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover/tracker:opacity-100 transition-opacity absolute -top-1 -right-1"
                  onClick={onEdit}
                >
                  <Edit className="w-3 h-3 text-slate-400" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


interface WorkflowBuilderProps {
  onStartWizard?: () => void;
  newWorkflow?: Workflow | null;
  onPreview?: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ onStartWizard, newWorkflow, onPreview }: WorkflowBuilderProps = {}) {
  const { workflows: contextWorkflows, addWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow } = useWorkflowContext();
  
  // Use context workflows if available, otherwise use mock data
  const [workflows, setWorkflows] = useState<Workflow[]>(contextWorkflows.length > 0 ? contextWorkflows as any[] : [
    {
      id: '1',
      name: 'Pizza Order Workflow',
      description: 'Complete pizza ordering and delivery process',
      icon: '🍕',
      stages: [
        {
          id: '1',
          name: 'Order Received',
          color: 'bg-blue-500',
          trackerLabel: 'Order Placed',
          trackerIcon: '📝',
          tasks: [
            { id: '1', name: 'Receive order', description: 'Customer places order online or by phone', assigneeRole: 'Order Taker', assignmentType: 'direct', estimatedTime: '2 min', movesToNextStage: false, dependencies: [] },
            { id: '2', name: 'Confirm payment', description: 'Verify payment is successful', assigneeRole: 'Order Taker', assignmentType: 'inherit', inheritFromTaskId: '1', estimatedTime: '1 min', movesToNextStage: false, dependencies: ['1'] },
            { id: '3', name: 'Send confirmation', description: 'Send order confirmation to customer', assigneeRole: 'System', assignmentType: 'direct', estimatedTime: '0 min', movesToNextStage: true, dependencies: ['2'] },
          ],
          automations: [
            { id: 'a1', name: 'Notify team of new order', trigger: 'stage_entered', enabled: true, actions: ['Send Slack notification', 'Update dashboard'] },
            { id: 'a2', name: 'Send order confirmation email', trigger: 'specific_task_completed', triggerTaskId: '3', enabled: true, actions: ['Email customer', 'Log in CRM'] },
          ],
        },
        {
          id: '2',
          name: 'Preparation',
          color: 'bg-violet-500',
          trackerLabel: 'Making Your Pizza',
          trackerIcon: '👨‍🍳',
          tasks: [
            { id: '4', name: 'Prepare dough', description: 'Roll and shape pizza dough', assigneeRole: 'Pizza Chef', assignmentType: 'direct', estimatedTime: '5 min', movesToNextStage: false, dependencies: [] },
            { id: '5', name: 'Add toppings', description: 'Add sauce, cheese, and requested toppings', assigneeRole: 'Pizza Chef', assignmentType: 'inherit', inheritFromTaskId: '4', estimatedTime: '3 min', movesToNextStage: true, dependencies: ['4'] },
          ],
          automations: [
            { id: 'a3', name: 'Assign to available chef', trigger: 'stage_entered', enabled: true, actions: ['Auto-assign chef', 'Set timer'] },
            { id: 'a4', name: 'Quality photo capture', trigger: 'specific_task_completed', triggerTaskId: '5', enabled: true, actions: ['Take photo', 'Upload to customer app'] },
          ],
        },
        {
          id: '3',
          name: 'Cooking',
          color: 'bg-amber-500',
          trackerLabel: 'Making Your Pizza',
          trackerIcon: '👨‍🍳',
          tasks: [
            { id: '6', name: 'Put in oven', description: 'Place pizza in oven at 450°F', assigneeRole: 'Pizza Chef', assignmentType: 'direct', estimatedTime: '1 min', movesToNextStage: false, dependencies: [] },
            { id: '7', name: 'Monitor cooking', description: 'Check pizza is cooking properly', assigneeRole: 'Pizza Chef', assignmentType: 'inherit', inheritFromTaskId: '6', estimatedTime: '10 min', movesToNextStage: false, dependencies: ['6'] },
            { id: '8', name: 'Remove from oven', description: 'Take pizza out when ready', assigneeRole: 'Pizza Chef', assignmentType: 'inherit', inheritFromTaskId: '6', estimatedTime: '1 min', movesToNextStage: true, dependencies: ['7'] },
          ],
          automations: [
            { id: 'a5', name: 'Start 12-minute timer', trigger: 'specific_task_completed', triggerTaskId: '6', enabled: true, actions: ['Start countdown timer', 'Alert when done'] },
            { id: 'a6', name: 'Update customer tracker', trigger: 'specific_task_completed', triggerTaskId: '8', enabled: true, actions: ['Update tracker to "Almost ready"'] },
          ],
        },
        {
          id: '4',
          name: 'Quality Check',
          color: 'bg-pink-500',
          trackerLabel: 'Making Your Pizza',
          trackerIcon: '👨‍🍳',
          tasks: [
            { id: '9', name: 'Inspect pizza', description: 'Ensure pizza meets quality standards', assigneeRole: 'Kitchen Manager', assignmentType: 'direct', estimatedTime: '2 min', movesToNextStage: false, dependencies: [] },
            { id: '10', name: 'Box pizza', description: 'Place pizza in delivery box', assigneeRole: 'Pizza Chef', assignmentType: 'direct', estimatedTime: '1 min', movesToNextStage: true, dependencies: ['9'] },
          ],
          automations: [
            { id: 'a7', name: 'Mark ready for delivery', trigger: 'specific_task_completed', triggerTaskId: '10', enabled: true, actions: ['Update status', 'Notify delivery team'] },
          ],
        },
        {
          id: '5',
          name: 'Delivery',
          color: 'bg-green-500',
          trackerLabel: 'Out for Delivery',
          trackerIcon: '🚗',
          tasks: [
            { id: '11', name: 'Assign driver', description: 'Assign available delivery driver', assigneeRole: 'System', assignmentType: 'direct', estimatedTime: '0 min', movesToNextStage: false, dependencies: [] },
            { id: '12', name: 'Out for delivery', description: 'Driver leaves with pizza', assigneeRole: 'Delivery Driver', assignmentType: 'direct', estimatedTime: '1 min', movesToNextStage: false, dependencies: ['11'] },
            { id: '13', name: 'Delivered', description: 'Pizza delivered to customer', assigneeRole: 'Delivery Driver', assignmentType: 'inherit', inheritFromTaskId: '12', estimatedTime: '15 min', movesToNextStage: true, dependencies: ['12'] },
          ],
          automations: [
            { id: 'a8', name: 'Auto-assign nearest driver', trigger: 'stage_entered', enabled: true, actions: ['Find available driver', 'Assign automatically'] },
            { id: 'a9', name: 'Send tracking link', trigger: 'specific_task_completed', triggerTaskId: '12', enabled: true, actions: ['SMS customer', 'Enable live tracking'] },
            { id: 'a10', name: 'Request feedback', trigger: 'time_after_task', triggerTaskId: '13', enabled: true, actions: ['Send satisfaction survey'], details: '3 days after delivery' },
            { id: 'a11', name: 'Mark order complete', trigger: 'specific_task_completed', triggerTaskId: '13', enabled: true, actions: ['Close order', 'Archive data', 'Update analytics'] },
          ],
        },
      ],
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(workflows[0]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentActiveStageIndex, setCurrentActiveStageIndex] = useState<number>(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showAutomationList, setShowAutomationList] = useState(false);
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false);
  const [automationLevel, setAutomationLevel] = useState<'stage' | 'task'>('stage');
  const [focusedAutomationId, setFocusedAutomationId] = useState<string | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<{ stageId: string; taskId: string } | null>(null);
  const [deleteAutomationConfirm, setDeleteAutomationConfirm] = useState<{ stageId: string; automationId: string } | null>(null);
  const [showTrackerDialog, setShowTrackerDialog] = useState(false);
  const [editingTrackerIndex, setEditingTrackerIndex] = useState<number | null>(null);
  const [trackerLabelInput, setTrackerLabelInput] = useState('');
  const [trackerIconInput, setTrackerIconInput] = useState('');
  const [assignedStages, setAssignedStages] = useState<string[]>([]);
  const [stageName, setStageName] = useState('');
  const [stageColor, setStageColor] = useState('border-t-blue-500');
  
  // Duplicate workflow dialog state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateWorkflowName, setDuplicateWorkflowName] = useState('');
  
  // Task form state
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskAssignmentType, setTaskAssignmentType] = useState<'direct' | 'inherit'>('direct');
  const [taskInheritFrom, setTaskInheritFrom] = useState<string>('');
  const [taskTime, setTaskTime] = useState('');
  const [taskMovesToNextStage, setTaskMovesToNextStage] = useState(false);
  const [taskDependencies, setTaskDependencies] = useState<string[]>([]);
  const [taskQuickActions, setTaskQuickActions] = useState<QuickAction[]>([]);
  
  // Cross-stage drag state
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceStageId: string } | null>(null);
  
  // Collapsible sections state
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());

  // Sync workflows to context whenever they change
  useEffect(() => {
    workflows.forEach(workflow => {
      const contextWorkflow = contextWorkflows.find(w => w.id === workflow.id);
      if (contextWorkflow) {
        // Update existing workflow
        updateWorkflow(workflow as any);
      } else {
        // Add new workflow
        addWorkflow(workflow as any);
      }
    });
  }, [workflows]);

  // Sync context workflows back to local state
  useEffect(() => {
    if (contextWorkflows.length > 0) {
      // Ensure all stages have automations array
      const normalizedWorkflows = contextWorkflows.map(workflow => ({
        ...workflow,
        stages: workflow.stages.map(stage => ({
          ...stage,
          automations: stage.automations || []
        }))
      }));
      setWorkflows(normalizedWorkflows as any[]);
    }
  }, [contextWorkflows]);

  // Handle new workflow from wizard
  useEffect(() => {
    if (newWorkflow) {
      const workflowExists = workflows.some(w => w.id === newWorkflow.id);
      if (!workflowExists) {
        const updatedWorkflows = [...workflows, newWorkflow];
        setWorkflows(updatedWorkflows);
        setSelectedWorkflow(newWorkflow);
      }
    }
  }, [newWorkflow]);

  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const moveTaskBetweenStages = (task: Task, fromStageId: string, toStageId: string, insertIndex?: number) => {
    const fromStage = selectedWorkflow.stages.find(s => s.id === fromStageId);
    const toStage = selectedWorkflow.stages.find(s => s.id === toStageId);
    
    const updatedWorkflow = {
      ...selectedWorkflow,
      stages: selectedWorkflow.stages.map(stage => {
        if (stage.id === fromStageId) {
          // Remove task from source stage
          return {
            ...stage,
            tasks: stage.tasks.filter(t => t.id !== task.id)
          };
        } else if (stage.id === toStageId) {
          // Add task to target stage at specific index or at the end
          const newTasks = [...stage.tasks];
          if (insertIndex !== undefined) {
            newTasks.splice(insertIndex, 0, task);
          } else {
            newTasks.push(task);
          }
          return {
            ...stage,
            tasks: newTasks
          };
        }
        return stage;
      })
    };
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
    
    toast.success(`Moved "${task.name}" from ${fromStage?.name} to ${toStage?.name}`);
  };

  const moveTask = (stageId: string, fromIndex: number, toIndex: number) => {
    const updatedWorkflow = {
      ...selectedWorkflow,
      stages: selectedWorkflow.stages.map(stage => {
        if (stage.id === stageId) {
          const newTasks = [...stage.tasks];
          const [movedTask] = newTasks.splice(fromIndex, 1);
          newTasks.splice(toIndex, 0, movedTask);
          return { ...stage, tasks: newTasks };
        }
        return stage;
      })
    };
    
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const moveAutomation = (stageId: string, fromIndex: number, toIndex: number) => {
    const updatedWorkflow = {
      ...selectedWorkflow,
      stages: selectedWorkflow.stages.map(stage => {
        if (stage.id === stageId) {
          const newAutomations = [...(stage.automations || [])];
          const [movedAutomation] = newAutomations.splice(fromIndex, 1);
          newAutomations.splice(toIndex, 0, movedAutomation);
          return { ...stage, automations: newAutomations };
        }
        return stage;
      })
    };
    
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const isTaskOutOfOrder = (task: Task, taskIndex: number, tasks: Task[]) => {
    // A task is out of order if it moves to next stage but is not the last task
    return task.movesToNextStage && taskIndex < tasks.length - 1;
  };

  const getTaskChildCount = (taskId: string, tasks: Task[]) => {
    // Count how many tasks inherit from this task
    return tasks.filter(t => t.assignmentType === 'inherit' && t.inheritFromTaskId === taskId).length;
  };

  const getTaskAutomationCount = (taskId: string, stage: Stage) => {
    // Count automations that reference this specific task
    return (stage.automations || []).filter(auto => auto.triggerTaskId === taskId).length;
  };

  return (
    <div className="space-y-4">
        {/* Compact Header - Single Line */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Workflow Selector with Tabs */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Label */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <FolderKanban className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Workflow:</span>
              </div>
              
              {/* Visible Workflow Tabs */}
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                {(() => {
                  // Calculate how many workflows can fit as tabs (show first 3-4)
                  const MAX_VISIBLE = 3;
                  const visibleWorkflows = workflows.slice(0, MAX_VISIBLE);
                  const dropdownWorkflows = workflows.slice(MAX_VISIBLE);
                  const hasDropdown = dropdownWorkflows.length > 0;
                  
                  return (
                    <>
                      {visibleWorkflows.map((workflow) => {
                        const isActive = selectedWorkflow.id === workflow.id;
                        
                        return (
                          <TooltipProvider key={workflow.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSelectedWorkflow(workflow as any)}
                                  className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex-shrink-0
                                    ${isActive 
                                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500 border-violet-600 text-white shadow-md' 
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                                    }
                                  `}
                                >
                                  <span className="text-base">{workflow.icon}</span>
                                  <span className="text-sm font-medium">{workflow.name}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Click to edit workflow</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                      
                      {/* More Workflows Dropdown */}
                      {hasDropdown && (
                        <Select 
                          value={dropdownWorkflows.find(w => w.id === selectedWorkflow.id)?.id || ''} 
                          onValueChange={(value) => {
                            const workflow = workflows.find(w => w.id === value);
                            if (workflow) setSelectedWorkflow(workflow as any);
                          }}
                        >
                          <SelectTrigger className="w-[200px] h-[34px]">
                            <SelectValue placeholder={`+${dropdownWorkflows.length} more workflows`} />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownWorkflows.map(workflow => (
                              <SelectItem key={workflow.id} value={workflow.id}>
                                <div className="flex items-center gap-2">
                                  <span>{workflow.icon}</span>
                                  <span>{workflow.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline"
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => {
                  setDuplicateWorkflowName(`${selectedWorkflow.name} (Copy)`);
                  setShowDuplicateDialog(true);
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </Button>
              <Button 
                size="sm"
                className="gap-1.5 h-8 bg-violet-600 hover:bg-violet-700"
                onClick={onStartWizard}
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </Button>
            </div>
          </div>
        </div>

      {/* Visual Workflow Builder */}
      <div className="space-y-3">


        {/* Tasks & Automations Header with Stats */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Tasks & Automations</span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{selectedWorkflow.stages.length} stages</span>
              <span>•</span>
              <span>{selectedWorkflow.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)} tasks</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {selectedWorkflow.stages.reduce((sum, stage) => sum + (stage.automations?.length || 0), 0)} automations
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border-violet-200" 
              onClick={() => {
                if (onPreview && selectedWorkflow) {
                  onPreview(selectedWorkflow);
                }
              }}
            >
              <Eye className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-violet-700">Preview</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => {
              setSelectedStage(null);
              setStageName('');
              setStageColor('border-t-blue-500');
              setShowStageDialog(true);
            }}>
              <Plus className="w-3.5 h-3.5" />
              Add Stage
            </Button>
          </div>
        </div>

        {/* Kanban Flow Visualization */}
        <div className="relative -mx-4">
          <div className="flex gap-6 overflow-x-auto pb-4 relative px-4" style={{ minWidth: 'max-content' }}>
            {/* Single Continuous Progress Line - Connects all Customer View indicators across all stages */}
            {(() => {
              const trackerGroups = selectedWorkflow.stages.reduce((acc: any[], s, idx) => {
                const lastGroup = acc[acc.length - 1];
                if (!lastGroup || lastGroup.label !== s.trackerLabel) {
                  acc.push({
                    label: s.trackerLabel,
                    icon: s.trackerIcon,
                    stageCount: 1,
                    stageIds: [s.id],
                    stageIndex: idx,
                  });
                } else {
                  lastGroup.stageCount += 1;
                  lastGroup.stageIds.push(s.id);
                }
                return acc;
              }, []);

              const activeStage = selectedWorkflow.stages[currentActiveStageIndex];
              const currentGroupIndex = activeStage 
                ? trackerGroups.findIndex(group => group.stageIds.includes(activeStage.id))
                : 0;

              const progressWidth = currentGroupIndex >= 0 
                ? ((currentGroupIndex + 0.5) / trackerGroups.length) * 100 
                : 0;

              // Calculate total width: each card is 360px + gap of 24px (gap-6)
              const totalWidth = selectedWorkflow.stages.length * 360 + (selectedWorkflow.stages.length - 1) * 24;

              return (
                <>
                  {/* Background line - spans full width across all cards (always visible) */}
                  <div 
                    className="absolute h-[2px] bg-slate-200"
                    style={{ 
                      top: '115px',
                      left: '16px', // Match px-4 padding
                      width: `${totalWidth}px`,
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                  {/* Progress fill - animated gradient (shows progress up to active stage) */}
                  {progressWidth > 0 && (
                    <div 
                      className="absolute h-[2px] bg-gradient-to-r from-green-500 to-violet-500 transition-all duration-500"
                      style={{ 
                        top: '115px',
                        left: '16px', // Match px-4 padding
                        width: `${(progressWidth / 100) * totalWidth}px`,
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    />
                  )}
                </>
              );
            })()}
            {selectedWorkflow.stages.map((stage, stageIndex) => (
              <React.Fragment key={stage.id}>
                <div className="min-w-[360px] max-w-[360px] flex-shrink-0 relative">
                  <DroppableStage 
                    stage={stage}
                    stageIndex={stageIndex}
                    totalStages={selectedWorkflow.stages.length}
                    onDropTask={moveTaskBetweenStages}
                  >
                    <Card className="border-slate-200">
                      {/* Compact Stage Header */}
                      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-400 cursor-move flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-slate-900">{stage.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{stage.tasks.length} tasks</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleStageCollapse(stage.id)}
                            >
                              {collapsedStages.has(stage.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setSelectedStage(stage);
                                setStageName(stage.name);
                                setStageColor(stage.color);
                                setShowStageDialog(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {!collapsedStages.has(stage.id) && (
                        <>
                      {/* Customer View Indicator */}
                      <CustomerStageIndicator
                        stage={stage}
                        stageIndex={stageIndex}
                        stages={selectedWorkflow.stages}
                        currentActiveStageIndex={currentActiveStageIndex}
                        onEdit={() => {
                          setEditingTrackerIndex(stageIndex);
                          setTrackerLabelInput(stage.trackerLabel);
                          setTrackerIconInput(stage.trackerIcon || '');
                          setAssignedStages([stage.id]);
                          setShowTrackerDialog(true);
                        }}
                      />

                    {/* Tasks and Automations List - In Chronological Order */}
                    <div className="p-3 space-y-2">
                      {stage.tasks.length === 0 && (stage.automations || []).length === 0 && (
                        <div className="py-6 px-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-sm text-slate-400">
                            No tasks or automations yet. Add one below.
                          </p>
                        </div>
                      )}
                      
                      {/* Stage Entry Automations (happen when stage is entered) */}
                      {(stage.automations || []).filter(a => a.trigger === 'stage_entered').map((automation) => {
                        const actualIndex = (stage.automations || []).findIndex(a => a.id === automation.id);
                        return (
                          <div key={automation.id}>
                            <DraggableAutomation
                              automation={automation}
                              automationIndex={actualIndex}
                              stageId={stage.id}
                              onMove={(fromIndex, toIndex) => moveAutomation(stage.id, fromIndex, toIndex)}
                              onEditClick={() => {
                                setSelectedStage(stage);
                                setSelectedTask(null);
                                setAutomationLevel('stage');
                                setFocusedAutomationId(automation.id);
                                setEditingAutomation(automation);
                                setShowAutomationList(true);
                              }}
                              onDeleteClick={() => {
                                setDeleteAutomationConfirm({ stageId: stage.id, automationId: automation.id });
                              }}
                              onToggleEnabled={() => {
                                toast.info('Toggle automation coming soon!');
                              }}
                            />
                          </div>
                        );
                      })}
                      
                      {/* Tasks with their associated automations */}
                      {stage.tasks.map((task, taskIndex) => {
                        const outOfOrder = isTaskOutOfOrder(task, taskIndex, stage.tasks);
                        const relatedAutomations = (stage.automations || []).filter(
                          a => (a.trigger === 'specific_task_completed' || a.trigger === 'time_after_task') && 
                               a.triggerTaskId === task.id
                        );
                        
                        return (
                          <div key={task.id} className="space-y-2">
                            <DraggableTask
                              task={task}
                              taskIndex={taskIndex}
                              stageId={stage.id}
                              totalTasks={stage.tasks.length}
                              allTasks={stage.tasks}
                              onMove={(fromIndex, toIndex) => moveTask(stage.id, fromIndex, toIndex)}
                              onMoveBetweenStages={moveTaskBetweenStages}
                              isOutOfOrder={outOfOrder}
                              onEditClick={() => {
                                setSelectedStage(stage);
                                setEditingTask(task);
                                setTaskName(task.name);
                                setTaskDescription(task.description);
                                setTaskAssignee(task.assigneeRole);
                                setTaskAssignmentType(task.assignmentType || 'direct');
                                setTaskInheritFrom(task.inheritFromTaskId || '');
                                setTaskTime(task.estimatedTime);
                                setTaskMovesToNextStage(task.movesToNextStage);
                                setTaskDependencies(task.dependencies);
                                setTaskQuickActions(task.quickActions || []);
                                setShowTaskDialog(true);
                              }}
                              onDeleteClick={() => {
                                setDeleteTaskConfirm({ stageId: stage.id, taskId: task.id });
                              }}
                            />
                            
                            {/* Automations that trigger after this task */}
                            {relatedAutomations.map((automation) => {
                              const actualIndex = (stage.automations || []).findIndex(a => a.id === automation.id);
                              return (
                                <div key={automation.id}>
                                  <DraggableAutomation
                                    automation={automation}
                                    automationIndex={actualIndex}
                                    stageId={stage.id}
                                    onMove={(fromIndex, toIndex) => moveAutomation(stage.id, fromIndex, toIndex)}
                                    onEditClick={() => {
                                      setSelectedStage(stage);
                                      setSelectedTask(null);
                                      setAutomationLevel('stage');
                                      setFocusedAutomationId(automation.id);
                                      setEditingAutomation(automation);
                                      setShowAutomationList(true);
                                    }}
                                    onDeleteClick={() => {
                                      setDeleteAutomationConfirm({ stageId: stage.id, automationId: automation.id });
                                    }}
                                    onToggleEnabled={() => {
                                      toast.info('Toggle automation coming!');
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      
                      {/* Stage Completion Automations (happen when stage is completed) */}
                      {(stage.automations || []).filter(a => a.trigger === 'stage_completed').map((automation) => {
                        const actualIndex = (stage.automations || []).findIndex(a => a.id === automation.id);
                        return (
                          <div key={automation.id}>
                            <DraggableAutomation
                              automation={automation}
                              automationIndex={actualIndex}
                              stageId={stage.id}
                              onMove={(fromIndex, toIndex) => moveAutomation(stage.id, fromIndex, toIndex)}
                              onEditClick={() => {
                                setSelectedStage(stage);
                                setSelectedTask(null);
                                setAutomationLevel('stage');
                                setFocusedAutomationId(automation.id);
                                setEditingAutomation(automation);
                                setShowAutomationList(true);
                              }}
                              onDeleteClick={() => {
                                setDeleteAutomationConfirm({ stageId: stage.id, automationId: automation.id });
                              }}
                              onToggleEnabled={() => {
                                toast.info('Toggle automation coming soon!');
                              }}
                            />
                          </div>
                        );
                      })}

                      {/* Add Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 h-8"
                          onClick={() => {
                            setSelectedStage(stage);
                            setShowTaskDialog(true);
                          }}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Add Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 h-8"
                          onClick={() => {
                            setSelectedStage(stage);
                            setSelectedTask(null);
                            setAutomationLevel('stage');
                            setFocusedAutomationId(null);
                            setEditingAutomation(null);
                            setShowAutomationBuilder(true);
                          }}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Add Automation
                        </Button>
                      </div>
                    </div>
                    </>
                      )}
                      
                      {/* Collapsed View - Show customer indicator when collapsed */}
                      {collapsedStages.has(stage.id) && (
                        <CustomerStageIndicator
                          stage={stage}
                          stageIndex={stageIndex}
                          stages={selectedWorkflow.stages}
                          currentActiveStageIndex={currentActiveStageIndex}
                          onEdit={() => {
                            setEditingTrackerIndex(stageIndex);
                            setTrackerLabelInput(stage.trackerLabel);
                            setTrackerIconInput(stage.trackerIcon || '');
                            setAssignedStages([stage.id]);
                            setShowTrackerDialog(true);
                          }}
                        />
                      )}
                  </Card>
                  </DroppableStage>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Stage Dialog */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
            <DialogDescription>Configure the stage details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stage Name</Label>
              <Input 
                placeholder="e.g., Quality Check" 
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex gap-2">
                {[
                  { color: 'bg-blue-500', border: 'border-t-blue-500' },
                  { color: 'bg-violet-500', border: 'border-t-violet-500' },
                  { color: 'bg-amber-500', border: 'border-t-amber-500' },
                  { color: 'bg-pink-500', border: 'border-t-pink-500' },
                  { color: 'bg-green-500', border: 'border-t-green-500' },
                  { color: 'bg-red-500', border: 'border-t-red-500' }
                ].map((colorObj) => (
                  <button
                    key={colorObj.border}
                    className={`w-10 h-10 rounded-lg ${colorObj.color} hover:scale-110 transition-transform ${stageColor === colorObj.border ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}
                    onClick={() => setStageColor(colorObj.border)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  if (!stageName.trim()) return;
                  
                  if (selectedStage) {
                    // Update existing stage
                    const updatedWorkflow = {
                      ...selectedWorkflow,
                      stages: selectedWorkflow.stages.map(s => 
                        s.id === selectedStage.id 
                          ? { ...s, name: stageName, color: stageColor }
                          : s
                      )
                    };
                    setSelectedWorkflow(updatedWorkflow);
                    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                  } else {
                    // Add new stage
                    const newStage: Stage = {
                      id: `stage-${Date.now()}`,
                      name: stageName,
                      color: stageColor,
                      tasks: [],
                      automations: [],
                      trackerLabel: stageName,
                      trackerIcon: '📋'
                    };
                    const updatedWorkflow = {
                      ...selectedWorkflow,
                      stages: [...selectedWorkflow.stages, newStage]
                    };
                    setSelectedWorkflow(updatedWorkflow);
                    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                  }
                  setShowStageDialog(false);
                  setStageName('');
                  setStageColor('border-t-blue-500');
                }}
              >
                {selectedStage ? 'Update Stage' : 'Add Stage'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={(open) => {
        setShowTaskDialog(open);
        if (!open) {
          // Reset form when closing
          setEditingTask(null);
          setTaskName('');
          setTaskDescription('');
          setTaskAssignee('');
          setTaskTime('');
          setTaskMovesToNextStage(false);
          setTaskDependencies([]);
          setTaskQuickActions([]);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : `Add Task to ${selectedStage?.name}`}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the task details' : 'Define what needs to be done in this stage'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input 
                placeholder="e.g., Inspect pizza quality" 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Brief description of what this task involves" 
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Task Assignment</Label>
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="direct"
                      checked={taskAssignmentType === 'direct'}
                      onChange={(e) => setTaskAssignmentType('direct')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Assign to specific user/role</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="inherit"
                      checked={taskAssignmentType === 'inherit'}
                      onChange={(e) => setTaskAssignmentType('inherit')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Inherit from parent task</span>
                  </label>
                </div>
                
                {taskAssignmentType === 'direct' ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Assign To</Label>
                    <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member or role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-1">
                          <div className="px-2 py-1.5 text-xs text-slate-500 font-medium">Team Members</div>
                          <SelectItem value="John Doe">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">
                                JD
                              </div>
                              <span>John Doe</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Sarah Miller">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                                SM
                              </div>
                              <span>Sarah Miller</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Alex Smith">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">
                                AS
                              </div>
                              <span>Alex Smith</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Kim Lee">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                                KL
                              </div>
                              <span>Kim Lee</span>
                            </div>
                          </SelectItem>
                          <div className="px-2 py-1.5 text-xs text-slate-500 font-medium mt-2">Roles</div>
                          <SelectItem value="Accountant">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                                💼
                              </div>
                              <span>Accountant</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Bookkeeper">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                                📚
                              </div>
                              <span>Bookkeeper</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Tax Specialist">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                                📋
                              </div>
                              <span>Tax Specialist</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Manager">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                                👔
                              </div>
                              <span>Manager</span>
                            </div>
                          </SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Parent Task</Label>
                    <Select value={taskInheritFrom} onValueChange={setTaskInheritFrom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedStage?.tasks
                          .filter(t => t.id !== editingTask?.id && t.assignmentType === 'direct')
                          .map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name} (assigned to {task.assigneeRole})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      This task will be assigned to whoever is assigned the parent task
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estimated Time</Label>
              <Input 
                placeholder="e.g., 5 min" 
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>
            {selectedStage?.tasks && selectedStage.tasks.length > 0 && (
              <div className="space-y-2">
                <Label>Task Dependencies</Label>
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">This task cannot start until these tasks are completed:</p>
                  <div className="space-y-1">
                    {selectedStage.tasks.map((task) => (
                      <label key={task.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={taskDependencies.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTaskDependencies([...taskDependencies, task.id]);
                            } else {
                              setTaskDependencies(taskDependencies.filter(id => id !== task.id));
                            }
                          }}
                        />
                        <span className="text-sm text-slate-700">{task.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Quick Actions Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quick Actions</Label>
                  <p className="text-xs text-slate-500 mt-1">Simple actions that happen when this task completes</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-gradient-to-br from-violet-50/50 to-indigo-50/50">
                {taskQuickActions.length > 0 ? (
                  <div className="space-y-2">
                    {taskQuickActions.map((action, index) => (
                      <div key={action.id} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded">
                        <div className="flex items-center gap-2 flex-1">
                          <Zap className="w-4 h-4 text-violet-600" />
                          <span className="text-sm text-slate-700">{action.label}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setTaskQuickActions(taskQuickActions.filter(a => a.id !== action.id));
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No quick actions yet. Add one below!</p>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'send-email',
                        label: '📧 Send Email'
                      }]);
                    }}
                  >
                    <span className="text-base">📧</span>
                    Send Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'send-sms',
                        label: '💬 Send SMS'
                      }]);
                    }}
                  >
                    <span className="text-base">💬</span>
                    Send SMS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'create-task',
                        label: '✅ Create Task'
                      }]);
                    }}
                  >
                    <span className="text-base">✅</span>
                    Create Task
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'update-field',
                        label: '📝 Update Field'
                      }]);
                    }}
                  >
                    <span className="text-base">📝</span>
                    Update Field
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'wait-delay',
                        label: '⏳ Wait / Delay'
                      }]);
                    }}
                  >
                    <span className="text-base">⏳</span>
                    Wait / Delay
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="justify-start gap-2 h-9"
                    onClick={() => {
                      setTaskQuickActions([...taskQuickActions, {
                        id: `qa-${Date.now()}`,
                        type: 'notify-team',
                        label: '🔔 Notify Team'
                      }]);
                    }}
                  >
                    <span className="text-base">🔔</span>
                    Notify Team
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="moves-stage" 
                  className="w-4 h-4" 
                  checked={taskMovesToNextStage}
                  onChange={(e) => setTaskMovesToNextStage(e.target.checked)}
                />
                <Label htmlFor="moves-stage" className="cursor-pointer">
                  Completing this task automatically moves the order to the next stage
                </Label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  if (!taskName.trim() || !selectedStage) return;
                  
                  if (editingTask) {
                    // Update existing task
                    const updatedTask: Task = {
                      ...editingTask,
                      name: taskName,
                      description: taskDescription,
                      assigneeRole: taskAssignmentType === 'direct' ? taskAssignee : (selectedStage?.tasks.find(t => t.id === taskInheritFrom)?.assigneeRole || ''),
                      assignmentType: taskAssignmentType,
                      inheritFromTaskId: taskAssignmentType === 'inherit' ? taskInheritFrom : undefined,
                      estimatedTime: taskTime,
                      movesToNextStage: taskMovesToNextStage,
                      dependencies: taskDependencies,
                      quickActions: taskQuickActions
                    };
                    
                    const updatedWorkflow = {
                      ...selectedWorkflow,
                      stages: selectedWorkflow.stages.map(stage => 
                        stage.id === selectedStage.id
                          ? { ...stage, tasks: stage.tasks.map(t => t.id === editingTask.id ? updatedTask : t) }
                          : stage
                      )
                    };
                    
                    setSelectedWorkflow(updatedWorkflow);
                    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                    toast.success('Task updated successfully!');
                  } else {
                    // Create new task
                    const newTask: Task = {
                      id: `task-${Date.now()}`,
                      name: taskName,
                      description: taskDescription,
                      assigneeRole: taskAssignmentType === 'direct' ? taskAssignee : (selectedStage?.tasks.find(t => t.id === taskInheritFrom)?.assigneeRole || ''),
                      assignmentType: taskAssignmentType,
                      inheritFromTaskId: taskAssignmentType === 'inherit' ? taskInheritFrom : undefined,
                      estimatedTime: taskTime,
                      movesToNextStage: taskMovesToNextStage,
                      dependencies: taskDependencies,
                      quickActions: taskQuickActions
                    };
                    
                    const updatedWorkflow = {
                      ...selectedWorkflow,
                      stages: selectedWorkflow.stages.map(stage => 
                        stage.id === selectedStage.id
                          ? { ...stage, tasks: [...stage.tasks, newTask] }
                          : stage
                      )
                    };
                    
                    setSelectedWorkflow(updatedWorkflow);
                    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                    toast.success('Task added successfully!');
                  }
                  setShowTaskDialog(false);
                  
                  // Reset form
                  setTaskName('');
                  setTaskDescription('');
                  setTaskAssignee('');
                  setTaskAssignmentType('direct');
                  setTaskInheritFrom('');
                  setTaskTime('');
                  setTaskMovesToNextStage(false);
                  setTaskDependencies([]);
                  setTaskQuickActions([]);
                }}
                disabled={!taskName.trim()}
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Automation Builder Dialog */}
      <Dialog open={showAutomationBuilder} onOpenChange={(open) => {
        setShowAutomationBuilder(open);
        if (!open) {
          setFocusedAutomationId(null);
        }
      }}>
        <DialogContent className="!max-w-[1540px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {focusedAutomationId 
                ? `Edit Automation - ${selectedStage?.name}`
                : `Stage Automations - ${selectedStage?.name}`}
              {selectedTask && ` (Focused on: ${selectedTask.name})`}
            </DialogTitle>
            <DialogDescription>
              {focusedAutomationId 
                ? 'Edit this automation or add additional automations to this stage.'
                : 'All automations for this stage. You can create automations that trigger on stage entry, specific tasks, or time-based events.'}
              {selectedTask && ' Currently showing automations related to the selected task.'}
            </DialogDescription>
          </DialogHeader>
          <AutomationBuilder 
            stageName={selectedStage?.name}
            tasks={selectedStage?.tasks.map(t => ({ id: t.id, name: t.name }))}
            automations={selectedStage?.automations || []}
            focusedTaskId={selectedTask?.id}
            focusedAutomationId={focusedAutomationId}
            workflow={selectedWorkflow}
            currentStageId={selectedStage?.id}
            onAutomationsChange={(updatedAutomations) => {
              if (!selectedStage) return;
              const updatedWorkflow = {
                ...selectedWorkflow,
                stages: selectedWorkflow.stages.map(s =>
                  s.id === selectedStage.id
                    ? { ...s, automations: updatedAutomations }
                    : s
                ),
              };
              setSelectedWorkflow(updatedWorkflow);
              setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tracker Step Dialog */}
      <Dialog open={showTrackerDialog} onOpenChange={setShowTrackerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Tracker Label</DialogTitle>
            <DialogDescription>
              Configure what customers see for {selectedWorkflow.stages[editingTrackerIndex || 0]?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer-Facing Label</Label>
              <Input 
                placeholder="e.g., Making Your Pizza" 
                value={trackerLabelInput}
                onChange={(e) => setTrackerLabelInput(e.target.value)}
              />
              <p className="text-xs text-slate-500">What customers will see in the tracker</p>
            </div>

            <div className="space-y-2">
              <Label>Icon/Emoji</Label>
              <Input 
                placeholder="e.g., 👨‍🍳" 
                value={trackerIconInput}
                onChange={(e) => setTrackerIconInput(e.target.value)}
                className="text-2xl"
              />
              <p className="text-xs text-slate-500">Visual icon for this step</p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-xs text-slate-500 mb-2">Preview:</p>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-xl">
                  {trackerIconInput || '❓'}
                </div>
                <div>
                  <p className="text-sm text-slate-900">{trackerLabelInput || 'Your Label Here'}</p>
                  <p className="text-xs text-slate-500">Customer tracker step</p>
                </div>
              </div>
            </div>

            {/* Common Examples */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Quick Examples:</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Order Received', icon: '📝' },
                  { label: 'Processing', icon: '⚙️' },
                  { label: 'In Production', icon: '🏭' },
                  { label: 'Quality Check', icon: '✅' },
                  { label: 'Ready', icon: '🎉' },
                  { label: 'On the Way', icon: '🚗' },
                ].map((example) => (
                  <button
                    key={example.label}
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded text-left transition-colors"
                    onClick={() => {
                      setTrackerLabelInput(example.label);
                      setTrackerIconInput(example.icon);
                    }}
                  >
                    <span className="text-lg">{example.icon}</span>
                    <span className="text-xs text-slate-700">{example.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowTrackerDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  // Update just this stage's tracker label
                  const updatedStages = selectedWorkflow.stages.map((stage, idx) => {
                    if (idx === editingTrackerIndex) {
                      return {
                        ...stage,
                        trackerLabel: trackerLabelInput,
                        trackerIcon: trackerIconInput,
                      };
                    }
                    return stage;
                  });
                  
                  setSelectedWorkflow({
                    ...selectedWorkflow,
                    stages: updatedStages,
                  });
                  
                  setShowTrackerDialog(false);
                }}
                disabled={!trackerLabelInput || !trackerIconInput}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={deleteTaskConfirm !== null} onOpenChange={(open) => !open && setDeleteTaskConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task and all its associated automations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleteTaskConfirm) return;
                
                const updatedWorkflow = {
                  ...selectedWorkflow,
                  stages: selectedWorkflow.stages.map(stage => 
                    stage.id === deleteTaskConfirm.stageId
                      ? {
                          ...stage,
                          tasks: stage.tasks.filter(t => t.id !== deleteTaskConfirm.taskId),
                          automations: (stage.automations || []).filter(a => a.triggerTaskId !== deleteTaskConfirm.taskId)
                        }
                      : stage
                  )
                };
                
                setSelectedWorkflow(updatedWorkflow);
                setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                setDeleteTaskConfirm(null);
                toast.success('Task deleted successfully');
              }}
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Automation Confirmation */}
      <AlertDialog open={deleteAutomationConfirm !== null} onOpenChange={(open) => !open && setDeleteAutomationConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this automation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleteAutomationConfirm) return;
                
                const updatedWorkflow = {
                  ...selectedWorkflow,
                  stages: selectedWorkflow.stages.map(stage => 
                    stage.id === deleteAutomationConfirm.stageId
                      ? {
                          ...stage,
                          automations: (stage.automations || []).filter(a => a.id !== deleteAutomationConfirm.automationId)
                        }
                      : stage
                  )
                };
                
                setSelectedWorkflow(updatedWorkflow);
                setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
                setDeleteAutomationConfirm(null);
                toast.success('Automation deleted successfully');
              }}
            >
              Delete Automation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Workflow Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Workflow</DialogTitle>
            <DialogDescription>
              Enter a name for the duplicated workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input 
                placeholder="Enter workflow name" 
                value={duplicateWorkflowName}
                onChange={(e) => setDuplicateWorkflowName(e.target.value)}
                onFocus={(e) => e.target.select()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowDuplicateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const newWorkflowId = duplicateWorkflow(selectedWorkflow.id, duplicateWorkflowName);
                  toast.success('Workflow duplicated!');
                  setShowDuplicateDialog(false);
                  // Select the newly duplicated workflow after a short delay
                  setTimeout(() => {
                    const duplicated = contextWorkflows.find(w => w.name === duplicateWorkflowName);
                    if (duplicated) {
                      setSelectedWorkflow(duplicated as any);
                    }
                  }, 100);
                }}
                disabled={!duplicateWorkflowName.trim()}
              >
                Duplicate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
