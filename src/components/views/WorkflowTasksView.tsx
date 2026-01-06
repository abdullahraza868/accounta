// Workflow Tasks View with Visual Filters and Include/Exclude functionality
import { useState, Fragment, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Clock, AlertCircle, CheckCircle2, Calendar as CalendarIcon, CheckSquare, X, Flag, MessageSquare, Paperclip, ListTodo, Users, Building2, Minus, ChevronDown, ChevronUp, GripVertical, Play, Square, MoreVertical, Edit2, Trash2, ArrowLeft, User } from 'lucide-react';
import { ProjectTask, Workflow, Project, useWorkflowContext } from '../WorkflowContext';
import { toast } from 'sonner@2.0.3';
import { TaskDetailDialog } from '../TaskDetailDialog';
import { TaskFilterPanel } from '../TaskFilterPanel';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { useDrag, useDrop } from 'react-dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface WorkflowTasksViewProps {
  workflowTasks: ProjectTask[];
  projects: Array<{ id: string; name: string; clientName?: string }>;
  onTaskUpdate: (task: ProjectTask) => void;
  filterStatus?: string;
  selectedAssignees?: string[];
  selectedProjects?: string[];
  workflow?: Workflow;
  searchQuery?: string;
  showFilterPanel?: boolean;
  onToggleFilterPanel?: (show: boolean) => void;
  viewMode?: 'list' | 'kanban';
  timeFilter?: 'all' | 'today' | 'week' | 'month' | 'overdue';
  completedDisplayMode?: 'hide' | 'inline' | 'only';
  includedAssignees?: string[];
  excludedAssignees?: string[];
  includedClients?: string[];
  excludedClients?: string[];
  includedStatuses?: string[];
  excludedStatuses?: string[];
  includedPriorities?: string[];
  excludedPriorities?: string[];
  includedTaskLists?: string[];
  excludedTaskLists?: string[];
  assigneeMode?: 'include' | 'exclude';
  clientMode?: 'include' | 'exclude';
  statusMode?: 'include' | 'exclude';
  priorityMode?: 'include' | 'exclude';
  taskListMode?: 'include' | 'exclude';
}

interface TaskList {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  sharedWith?: string[];
}

const ItemTypes = {
  TASK: 'task',
};

// Draggable task row component
function DraggableTaskRow({ 
  task, 
  children, 
  onDragStart,
  onDrop,
  isSelected,
  onClick,
  selectedTaskIds,
  isMultiSelectMode,
  isExpanded,
  isTimerActive,
  completedDisplayMode
}: { 
  task: ProjectTask; 
  children: React.ReactNode;
  onDragStart: () => void;
  onDrop?: (draggedTaskIds: string[], targetTaskId: string) => void;
  isSelected: boolean;
  onClick: () => void;
  selectedTaskIds: string[];
  isMultiSelectMode: boolean;
  isExpanded?: boolean;
  isTimerActive?: boolean;
  completedDisplayMode?: 'hide' | 'inline' | 'only';
}) {
  // When multiselect is active and task is selected, drag all selected tasks
  const tasksToDrag = isMultiSelectMode && isSelected ? selectedTaskIds : [task.id];
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { taskIds: tasksToDrag },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [task.id, tasksToDrag, isMultiSelectMode]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { taskIds: string[] }) => {
      if (onDrop && !item.taskIds.includes(task.id)) {
        onDrop(item.taskIds, task.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [task.id, onDrop]);

  const isCompleted = task.status === 'completed';
  
  // When showing only completed tasks, make them more legible (no opacity reduction)
  const completedOpacity = completedDisplayMode === 'only' ? '' : 'opacity-60';

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={onClick}
      className={`
        flex items-center gap-4 px-6 py-4 border-b transition-all cursor-move
        ${isExpanded ? 'bg-gradient-to-r from-violet-50/50 to-indigo-50/50 border-violet-200 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}
        ${isSelected ? 'bg-violet-50' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'border-t-4 border-t-violet-500' : ''}
        ${isTimerActive ? 'bg-gradient-to-r from-violet-100 to-purple-100 border-l-4 border-l-violet-600 shadow-md ring-2 ring-violet-200 ring-opacity-50' : ''}
        ${isCompleted && !isTimerActive && !isSelected ? `bg-slate-50 ${completedOpacity}` : ''}
      `}
      onDragStart={onDragStart}
    >
      {children}
    </div>
  );
}

export function WorkflowTasksView({ workflowTasks, projects, onTaskUpdate, filterStatus = 'all', selectedAssignees = [], selectedProjects = [], workflow, searchQuery = '', showFilterPanel = false, onToggleFilterPanel, viewMode = 'list', timeFilter = 'all', completedDisplayMode = 'hide', includedAssignees: propIncludedAssignees = [], excludedAssignees: propExcludedAssignees = [], includedClients: propIncludedClients = [], excludedClients: propExcludedClients = [], includedStatuses: propIncludedStatuses = [], excludedStatuses: propExcludedStatuses = [], includedPriorities: propIncludedPriorities = [], excludedPriorities: propExcludedPriorities = [], includedTaskLists: propIncludedTaskLists = [], excludedTaskLists: propExcludedTaskLists = [], assigneeMode: propAssigneeMode = 'include', clientMode: propClientMode = 'include', statusMode: propStatusMode = 'include', priorityMode: propPriorityMode = 'include', taskListMode: propTaskListMode = 'include' }: WorkflowTasksViewProps) {
  // Get timer functions from context
  const { activeTimer, startTimer, stopTimer, getTimerElapsed } = useWorkflowContext();
  const navigate = useNavigate();
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Separate included and excluded arrays for each filter type - sync with props
  const [includedAssignees, setIncludedAssignees] = useState<string[]>(propIncludedAssignees);
  const [excludedAssignees, setExcludedAssignees] = useState<string[]>(propExcludedAssignees);
  const [includedClients, setIncludedClients] = useState<string[]>(propIncludedClients);
  const [excludedClients, setExcludedClients] = useState<string[]>(propExcludedClients);
  const [includedStatuses, setIncludedStatuses] = useState<string[]>(propIncludedStatuses);
  const [excludedStatuses, setExcludedStatuses] = useState<string[]>(propExcludedStatuses);
  const [includedPriorities, setIncludedPriorities] = useState<string[]>(propIncludedPriorities);
  const [excludedPriorities, setExcludedPriorities] = useState<string[]>(propExcludedPriorities);
  const [includedTaskLists, setIncludedTaskLists] = useState<string[]>(propIncludedTaskLists);
  const [excludedTaskLists, setExcludedTaskLists] = useState<string[]>(propExcludedTaskLists);
  
  // Include/Exclude modes - sync with props
  const [assigneeMode, setAssigneeMode] = useState<'include' | 'exclude'>(propAssigneeMode);
  const [clientMode, setClientMode] = useState<'include' | 'exclude'>(propClientMode);
  const [statusMode, setStatusMode] = useState<'include' | 'exclude'>(propStatusMode);
  const [priorityMode, setPriorityMode] = useState<'include' | 'exclude'>(propPriorityMode);
  const [taskListMode, setTaskListMode] = useState<'include' | 'exclude'>(propTaskListMode);
  
  // Sync filter arrays with props
  useEffect(() => {
    setIncludedAssignees(propIncludedAssignees);
    setExcludedAssignees(propExcludedAssignees);
    setIncludedClients(propIncludedClients);
    setExcludedClients(propExcludedClients);
    setIncludedStatuses(propIncludedStatuses);
    setExcludedStatuses(propExcludedStatuses);
    setIncludedPriorities(propIncludedPriorities);
    setExcludedPriorities(propExcludedPriorities);
    setIncludedTaskLists(propIncludedTaskLists);
    setExcludedTaskLists(propExcludedTaskLists);
  }, [propIncludedAssignees, propExcludedAssignees, propIncludedClients, propExcludedClients, propIncludedStatuses, propExcludedStatuses, propIncludedPriorities, propExcludedPriorities, propIncludedTaskLists, propExcludedTaskLists]);
  
  // Sync filter modes with props
  useEffect(() => {
    setAssigneeMode(propAssigneeMode);
    setClientMode(propClientMode);
    setStatusMode(propStatusMode);
    setPriorityMode(propPriorityMode);
    setTaskListMode(propTaskListMode);
  }, [propAssigneeMode, propClientMode, propStatusMode, propPriorityMode, propTaskListMode]);
  
  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'assignee' | 'task' | 'list' | 'client' | 'status' | 'priority' | 'dueDate' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Timer state
  const [pendingTimerTask, setPendingTimerTask] = useState<ProjectTask | null>(null);
  const [showTimerConfirmation, setShowTimerConfirmation] = useState(false);
  
  // List state (can be empty for workflow context)
  const [taskLists] = useState<TaskList[]>([]);
  const [taskListAssignments] = useState<Record<string, string>>({});
  const showListColumn = false; // Hide list column for workflow context

  // Split view mode state (similar to Documents Center)
  const [splitViewMode, setSplitViewMode] = useState<'table' | 'split'>(() => {
    const saved = localStorage.getItem('workflowTasksViewMode');
    return (saved === 'split' || saved === 'table') ? saved : 'table';
  });

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('workflowTasksViewMode', splitViewMode);
  }, [splitViewMode]);

  // Auto-switch to split view when multiple assignees are selected
  useEffect(() => {
    if (includedAssignees.length > 1 && splitViewMode === 'table') {
      setSplitViewMode('split');
    } else if (includedAssignees.length <= 1 && splitViewMode === 'split') {
      // Optionally switch back to table when only one assignee
      // Commented out to preserve user preference
      // setSplitViewMode('table');
    }
  }, [includedAssignees.length, splitViewMode]);

  // Get unique assignees and clients from tasks
  const allAssignees = Array.from(new Set(workflowTasks.map(t => t.assignee)));
  const allClientsNames = Array.from(new Set(workflowTasks.map(t => {
    const project = projects.find(p => p.id === t.projectId);
    return project?.clientName;
  }).filter(Boolean) as string[]));
  
  // Mock client type detection (you may have actual client data)
  const allClients = allClientsNames.map(name => ({
    name,
    type: 'business' as const // Defaulting to business, adjust if you have actual client type data
  }));
  
  const activeFilterCount = includedAssignees.length + excludedAssignees.length + includedClients.length + excludedClients.length + includedStatuses.length + excludedStatuses.length + includedPriorities.length + excludedPriorities.length + includedTaskLists.length + excludedTaskLists.length;

  // Priority colors and icons
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': 
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-50 hover:bg-red-100',
          border: 'border-red-200',
          icon: '🔴'
        };
      case 'medium': 
        return { 
          color: 'text-amber-600', 
          bg: 'bg-amber-50 hover:bg-amber-100',
          border: 'border-amber-200',
          icon: '🟡'
        };
      case 'low': 
        return { 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 hover:bg-blue-100',
          border: 'border-blue-200',
          icon: '🔵'
        };
      default: 
        return { 
          color: 'text-slate-500', 
          bg: 'bg-slate-50 hover:bg-slate-100',
          border: 'border-slate-200',
          icon: '⚪'
        };
    }
  };

  // Status styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Done'
        };
      case 'in-progress': 
        return { 
          icon: <Clock className="w-3.5 h-3.5" />,
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          label: 'In Progress'
        };
      case 'blocked': 
        return { 
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Blocked'
        };
      default: 
        return { 
          icon: <CheckSquare className="w-3.5 h-3.5" />,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          label: 'To Do'
        };
    }
  };

  const isOverdue = (dueDate: string | undefined, taskStatus?: string) => {
    if (!dueDate || taskStatus === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
    const due = new Date(dueDate);
    return due < today;
    } catch {
      return false;
    }
  };

  const isDueSoon = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const due = new Date(dueDate);
    return due >= today && due <= threeDaysFromNow;
  };

  // Removed toggleTaskComplete - now handled inline in checkbox

  // Apply filters
  const filteredTasks = workflowTasks.filter(task => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const taskClient = projects.find(p => p.id === task.projectId)?.clientName || '';
      const matchesSearch = 
        task.name.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query) ||
        taskClient.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Time filter
    let matchesTime = true;
    if (timeFilter && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      switch (timeFilter) {
        case 'today':
          matchesTime = isToday(dueDate);
          break;
        case 'week':
          matchesTime = isThisWeek(dueDate, { weekStartsOn: 1 }); // Monday as start of week
          break;
        case 'month':
          matchesTime = isThisMonth(dueDate);
          break;
        case 'overdue':
          matchesTime = isOverdue(task.dueDate, task.status);
          break;
        case 'all':
        default:
          matchesTime = true;
          break;
      }
    } else if (timeFilter === 'overdue') {
      // For overdue, we still want to show tasks even without dueDate if they're overdue
      matchesTime = isOverdue(task.dueDate, task.status);
    }
    if (!matchesTime) return false;
    
    // Completed filter based on display mode
    const matchesCompletedFilter = 
      viewMode === 'kanban' ? true : // Kanban view always shows all tasks (Done column handles completed tasks)
      completedDisplayMode === 'hide' ? task.status !== 'completed' :
      completedDisplayMode === 'only' ? task.status === 'completed' :
      true; // 'inline' shows all tasks
    if (!matchesCompletedFilter) return false;
    
    // Old prop-based filters (for backwards compatibility)
    if (selectedAssignees.length > 0 && !selectedAssignees.includes(task.assignee)) {
      return false;
    }
    
    if (selectedProjects.length > 0 && !selectedProjects.includes(task.projectId)) {
      return false;
    }
    
    if (filterStatus === 'todo') {
      if (task.status !== 'todo') return false;
    } else if (filterStatus === 'in-progress') {
      if (task.status !== 'in-progress') return false;
    } else if (filterStatus === 'blocked') {
      if (task.status !== 'blocked') return false;
    } else if (filterStatus === 'completed') {
      if (task.status !== 'completed') return false;
    } else if (filterStatus === 'overdue') {
      if (task.status === 'completed' || !isOverdue(task.dueDate)) return false;
    } else if (filterStatus === 'due-soon') {
      if (task.status === 'completed' || !isDueSoon(task.dueDate)) return false;
    }
    
    // Filter by assignee: must be in included list (if any) and not in excluded list (if any)
    const matchesAssignee = 
      (includedAssignees.length === 0 && excludedAssignees.length === 0) ||
      (includedAssignees.length > 0 ? includedAssignees.includes(task.assignee) : true) &&
      (excludedAssignees.length > 0 ? !excludedAssignees.includes(task.assignee) : true);
    
    // Filter by client: resolve client name from project, then check included/excluded
    const taskClient = projects.find(p => p.id === task.projectId)?.clientName || '';
    const matchesClient = 
      (includedClients.length === 0 && excludedClients.length === 0) ||
      (includedClients.length > 0 ? (taskClient && includedClients.includes(taskClient)) : true) &&
      (excludedClients.length > 0 ? !(taskClient && excludedClients.includes(taskClient)) : true);
    
    // Filter by status: must be in included list (if any) and not in excluded list (if any)
    const matchesStatus = 
      (includedStatuses.length === 0 && excludedStatuses.length === 0) ||
      (includedStatuses.length > 0 ? includedStatuses.includes(task.status) : true) &&
      (excludedStatuses.length > 0 ? !excludedStatuses.includes(task.status) : true);
    
    // Filter by priority: must be in included list (if any) and not in excluded list (if any)
    const taskPriority = task.priority || '';
    const matchesPriority = 
      (includedPriorities.length === 0 && excludedPriorities.length === 0) ||
      (includedPriorities.length > 0 ? (taskPriority && includedPriorities.includes(taskPriority)) : true) &&
      (excludedPriorities.length > 0 ? !(taskPriority && excludedPriorities.includes(taskPriority)) : true);
    
    // Task list matching (taskListId may not exist on ProjectTask)
    const taskListId = (task as any).taskListId || taskListAssignments[task.id];
    const matchesTaskList = 
      (includedTaskLists.length === 0 && excludedTaskLists.length === 0) ||
      (includedTaskLists.length > 0 ? (taskListId && includedTaskLists.includes(taskListId)) : true) &&
      (excludedTaskLists.length > 0 ? !(taskListId && excludedTaskLists.includes(taskListId)) : true);
    
    return matchesAssignee && matchesClient && matchesStatus && matchesPriority && matchesTaskList;
  });

  // Sort tasks based on sortColumn and sortDirection
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // If no sort column, use default sorting (overdue, due soon, then by status)
    if (!sortColumn) {
    // Completed tasks go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Overdue tasks to top
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Due soon next
    const aDueSoon = isDueSoon(a.dueDate);
    const bDueSoon = isDueSoon(b.dueDate);
    if (aDueSoon && !bDueSoon) return -1;
    if (!aDueSoon && bDueSoon) return 1;
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    // Apply column sorting
    let comparison = 0;
    
    switch (sortColumn) {
      case 'assignee': {
        comparison = a.assignee.localeCompare(b.assignee);
        break;
      }
      case 'task': {
        comparison = a.name.localeCompare(b.name);
        break;
      }
      case 'list': {
        const aList = getTaskListName(a.id);
        const bList = getTaskListName(b.id);
        comparison = aList.localeCompare(bList);
        break;
      }
      case 'client': {
        const aClient = getClientName(a.projectId);
        const bClient = getClientName(b.projectId);
        comparison = aClient.localeCompare(bClient);
        break;
      }
      case 'status': {
        comparison = a.status.localeCompare(b.status);
        break;
      }
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                     (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
        break;
      }
      case 'dueDate': {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = aDate - bDate;
        break;
      }
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Group tasks by assignee for split view (similar to accountGroups in Documents Center)
  const userGroups = useMemo(() => {
    if (splitViewMode !== 'split') return [];
    
    const groups = new Map<string, { userId: string; userName: string; tasks: ProjectTask[] }>();
    
    sortedTasks.forEach((task: ProjectTask) => {
      const assignee = task.assignee || 'Unassigned';
      if (!groups.has(assignee)) {
        groups.set(assignee, {
          userId: assignee,
          userName: assignee,
          tasks: []
        });
      }
      groups.get(assignee)!.tasks.push(task);
    });
    
    return Array.from(groups.values());
  }, [sortedTasks, splitViewMode]);

  const getClientName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.clientName || 'N/A';
  };

  const getAssigneeName = (assigneeId: string): string => {
    // In a real app, this would look up the assignee name from a users list
    return assigneeId;
  };

  // Status options for inline editing
  const customStatuses = ['todo', 'in-progress', 'completed', 'blocked'];
  
  // Inline editing helpers
  const startEditing = (taskId: string, field: string, _currentValue: string) => {
    setEditingTaskId(taskId);
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingField(null);
  };

  const saveInlineEdit = (taskId: string, field: string, value: any) => {
    const task = workflowTasks.find(t => t.id === taskId);
    if (!task) return;

    onTaskUpdate({
      ...task,
      [field]: value
    });
    cancelEditing();
    toast.success('Task updated');
  };

  // Sorting helper
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      // Toggle direction or clear sort
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Timer helpers
  const handleToggleTimer = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeTimer?.taskId === task.id) {
      // Stop the current timer
      const duration = stopTimer();
      const minutes = Math.floor(duration / 60);
      toast.success(`Timer stopped. ${minutes} minute${minutes !== 1 ? 's' : ''} tracked.`);
    } else {
      // If another timer is running, show confirmation
      if (activeTimer && activeTimer.taskId !== task.id) {
        setPendingTimerTask(task);
        setShowTimerConfirmation(true);
      } else {
        // No timer running, start immediately
        toast.success('Timer started');
        startTimer(task.id, task.projectId);
      }
    }
  };

  const confirmStartTimer = () => {
    if (pendingTimerTask) {
      const previousTask = workflowTasks.find(t => t.id === activeTimer?.taskId);
      const duration = stopTimer();
      const minutes = Math.floor(duration / 60);
      if (previousTask) {
        toast.success(`${previousTask.name}: ${minutes} min tracked`, {
          description: `Starting timer for ${pendingTimerTask.name}`
        });
      }
      startTimer(pendingTimerTask.id, pendingTimerTask.projectId);
      setShowTimerConfirmation(false);
      setPendingTimerTask(null);
    }
  };

  // Drag and drop helper
  const handleTaskReorder = (_draggedTaskIds: string[], _targetTaskId: string) => {
    // For workflow tasks, we might not need reordering, but we'll keep the function
    // In a real implementation, you'd update the task order in the workflow
    toast.success('Task order updated');
  };

  // List helpers (for future use)
  const getTaskListName = (taskId: string) => {
    const listId = taskListAssignments[taskId] || 'inbox';
    const list = taskLists.find(l => l.id === listId);
    return list?.name || 'Inbox';
  };

  const getTaskListColor = (_taskId: string) => {
    const listId = taskListAssignments[_taskId] || 'inbox';
    const list = taskLists.find((l: TaskList) => l.id === listId);
    return list?.color || 'bg-slate-400';
  };

  const getListIcon = (_listId: string) => {
    // Return appropriate icon based on listId
    return null;
  };

  // Date helpers
  const safeFormatDate = (dateString: string | undefined, formatStr: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), formatStr);
    } catch {
      return '';
    }
  };

  const isDueToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    try {
      return isToday(new Date(dateString));
    } catch {
      return false;
    }
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setIncludedAssignees([]);
    setExcludedAssignees([]);
    setIncludedClients([]);
    setExcludedClients([]);
    setIncludedStatuses([]);
    setExcludedStatuses([]);
    setIncludedPriorities([]);
    setExcludedPriorities([]);
    setIncludedTaskLists([]);
    setExcludedTaskLists([]);
    setAssigneeMode('include');
    setClientMode('include');
    setStatusMode('include');
    setPriorityMode('include');
    setTaskListMode('include');
    toast.success('All filters cleared');
  };

  const getProjectByTaskId = (taskId: string): Project | undefined => {
    const task = workflowTasks.find(t => t.id === taskId);
    if (!task) return undefined;
    const proj = projects.find(p => p.id === task.projectId);
    if (!proj) return undefined;
    // Return a partial Project object with the data we have
    return {
      id: proj.id,
      name: proj.name,
      clientName: proj.clientName,
      workflowId: task.workflowId,
      currentStageId: task.stageId,
      assignees: [task.assignee],
      progress: 0,
      tasks: { total: 0, completed: 0 },
      dueDate: task.dueDate,
      comments: 0,
      attachments: 0,
      createdAt: task.createdAt
    } as Project;
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    // Enter multi-select mode
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedTaskIds(sortedTasks.map(t => t.id));
      toast.success('Multi-select mode enabled');
      return;
    }

    // Already in multi-select mode, toggle all
    if (selectedTaskIds.length === sortedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedTasks.map(t => t.id));
    }
  };

  const toggleSelectTask = (taskId: string, event?: React.MouseEvent) => {
    // Handle shift-click for range selection
    if (event?.shiftKey && selectedTaskIds.length > 0) {
      const lastSelectedId = selectedTaskIds[selectedTaskIds.length - 1];
      const lastIndex = sortedTasks.findIndex(t => t.id === lastSelectedId);
      const currentIndex = sortedTasks.findIndex(t => t.id === taskId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = sortedTasks.slice(start, end + 1).map(t => t.id);
        setSelectedTaskIds(prev => {
          const newSet = new Set([...prev, ...rangeIds]);
          return Array.from(newSet);
        });
        return;
      }
    }

    // Normal toggle
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const clearSelection = () => {
    setSelectedTaskIds([]);
    setIsMultiSelectMode(false);
  };

  // Bulk actions
  const bulkCompleteSelected = () => {
    const tasksToUpdate = workflowTasks.filter(t => selectedTaskIds.includes(t.id));
    tasksToUpdate.forEach(task => {
      onTaskUpdate({
        ...task,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });
    });
    toast.success(`Marked ${tasksToUpdate.length} task${tasksToUpdate.length !== 1 ? 's' : ''} as completed`);
    clearSelection();
  };

  const bulkMarkTodo = () => {
    const tasksToUpdate = workflowTasks.filter(t => selectedTaskIds.includes(t.id));
    tasksToUpdate.forEach(task => {
      onTaskUpdate({
        ...task,
        status: 'todo' as const,
        completedAt: undefined
      });
    });
    toast.success(`Marked ${tasksToUpdate.length} task${tasksToUpdate.length !== 1 ? 's' : ''} as to do`);
    clearSelection();
  };

  const bulkChangePriority = (priority: 'high' | 'medium' | 'low') => {
    const tasksToUpdate = workflowTasks.filter(t => selectedTaskIds.includes(t.id));
    tasksToUpdate.forEach(task => {
      onTaskUpdate({
        ...task,
        priority
      });
    });
    toast.success(`Updated priority for ${tasksToUpdate.length} task${tasksToUpdate.length !== 1 ? 's' : ''}`);
    clearSelection();
  };

  const handleTaskRowClick = (task: ProjectTask) => {
    // In multiselect mode, clicking a row toggles selection
    if (isMultiSelectMode) {
      toggleSelectTask(task.id);
      return;
    }
    
    // Otherwise, expand subtasks if they exist
    const indicators = getTaskIndicators(task);
    if (indicators.subtasks.total > 0) {
      setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
    }
  };

  const handleTaskNameClick = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from firing
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // Mock counts for indicators - in real app these would come from context
  const getTaskIndicators = (task: ProjectTask) => {
    return {
      comments: Math.floor(Math.random() * 5), // Mock
      subtasks: { total: 3, completed: 1 }, // Mock
      attachments: Math.floor(Math.random() * 3) // Mock
    };
  };

  // Mock subtasks - in real app these would come from context
  const getSubtasks = (taskId: string) => {
    return [
      { id: `${taskId}-sub-1`, name: 'Review client documents', status: 'completed' as const, assignee: 'JD' },
      { id: `${taskId}-sub-2`, name: 'Prepare initial analysis', status: 'in-progress' as const, assignee: 'SM' },
      { id: `${taskId}-sub-3`, name: 'Schedule follow-up meeting', status: 'todo' as const, assignee: 'AB' },
    ];
  };

  if (workflowTasks.length === 0) {
    return (
      <Card className="p-12 border-slate-200 border-dashed">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <h3 className="text-slate-900">No tasks yet</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tasks will appear here as you create projects in this workflow
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Filters Summary - Only show if there are active filters */}
      {activeFilterCount > 0 && (
        <Card className="border-slate-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
                {includedAssignees.slice(0, 2).map(assignee => (
                  <Badge 
                    key={assignee} 
                    variant="secondary" 
                    className={`gap-1 text-xs h-6 ${
                      assigneeMode === 'exclude' 
                        ? 'bg-red-100 text-red-800 border-red-300' 
                        : 'bg-violet-100 text-violet-800 border-violet-300'
                    }`}
                  >
                    {assigneeMode === 'exclude' ? <Minus className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                    {assignee}
                    <button
                      onClick={() => setIncludedAssignees(includedAssignees.filter(a => a !== assignee))}
                      className={`ml-1 rounded-full p-0.5 ${
                        assigneeMode === 'exclude' 
                          ? 'hover:bg-red-200' 
                          : 'hover:bg-violet-200'
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                {includedAssignees.length > 2 && (
                  <Badge variant="secondary" className="text-xs h-6">
                    +{includedAssignees.length - 2} more
                  </Badge>
                )}

                {includedClients.slice(0, 2).map(client => (
                  <Badge 
                    key={client} 
                    variant="secondary" 
                    className={`gap-1 text-xs h-6 ${
                      clientMode === 'exclude'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {clientMode === 'exclude' ? <Minus className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                    {client}
                    <button
                      onClick={() => setIncludedClients(includedClients.filter(c => c !== client))}
                      className={`ml-1 rounded-full p-0.5 ${
                        clientMode === 'exclude'
                          ? 'hover:bg-red-200'
                          : 'hover:bg-emerald-200'
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                {includedClients.length > 2 && (
                  <Badge variant="secondary" className="text-xs h-6">
                    +{includedClients.length - 2} more
                  </Badge>
                )}
                
                {includedStatuses.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`gap-1 text-xs h-6 ${
                      statusMode === 'exclude'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {statusMode === 'exclude' ? <Minus className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                    {includedStatuses.length} status{includedStatuses.length > 1 ? 'es' : ''}
                    <button
                      onClick={() => setIncludedStatuses([])}
                      className={`ml-1 rounded-full p-0.5 ${
                        statusMode === 'exclude'
                          ? 'hover:bg-red-200'
                          : 'hover:bg-blue-200'
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                )}
                
                {includedPriorities.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`gap-1 text-xs h-6 ${
                      priorityMode === 'exclude'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {priorityMode === 'exclude' ? <Minus className="w-2.5 h-2.5" /> : <Flag className="w-2.5 h-2.5" />}
                    {includedPriorities.length} priorit{includedPriorities.length > 1 ? 'ies' : 'y'}
                    <button
                      onClick={() => setIncludedPriorities([])}
                      className={`ml-1 rounded-full p-0.5 ${
                        priorityMode === 'exclude'
                          ? 'hover:bg-red-200'
                          : 'hover:bg-amber-200'
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                )}
                
                {includedTaskLists.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`gap-1 text-xs h-6 ${
                      taskListMode === 'exclude'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {taskListMode === 'exclude' ? <Minus className="w-2.5 h-2.5" /> : <ListTodo className="w-2.5 h-2.5" />}
                    {includedTaskLists.length} task list{includedTaskLists.length > 1 ? 's' : ''}
                    <button
                      onClick={() => setIncludedTaskLists([])}
                      className={`ml-1 rounded-full p-0.5 ${
                        taskListMode === 'exclude'
                          ? 'hover:bg-red-200'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </Card>
      )}

      {/* Content with Optional Filter Panel */}
      <div className="flex gap-4">
        {/* Filter Panel */}
        {showFilterPanel && (
          <TaskFilterPanel
            includedAssignees={includedAssignees}
            excludedAssignees={excludedAssignees}
            includedClients={includedClients}
            excludedClients={excludedClients}
            includedStatuses={includedStatuses}
            excludedStatuses={excludedStatuses}
            includedPriorities={includedPriorities}
            excludedPriorities={excludedPriorities}
            includedTaskLists={includedTaskLists}
            excludedTaskLists={excludedTaskLists}
            assigneeMode={assigneeMode}
            clientMode={clientMode}
            statusMode={statusMode}
            priorityMode={priorityMode}
            taskListMode={taskListMode}
            allAssignees={allAssignees}
            allClients={allClients}
            allTaskLists={[]}
            onIncludedAssigneesChange={setIncludedAssignees}
            onExcludedAssigneesChange={setExcludedAssignees}
            onIncludedClientsChange={setIncludedClients}
            onExcludedClientsChange={setExcludedClients}
            onIncludedStatusesChange={setIncludedStatuses}
            onExcludedStatusesChange={setExcludedStatuses}
            onIncludedPrioritiesChange={setIncludedPriorities}
            onExcludedPrioritiesChange={setExcludedPriorities}
            onIncludedTaskListsChange={setIncludedTaskLists}
            onExcludedTaskListsChange={setExcludedTaskLists}
            onAssigneeModeChange={setAssigneeMode}
            onClientModeChange={setClientMode}
            onStatusModeChange={setStatusMode}
            onPriorityModeChange={setPriorityMode}
            onTaskListModeChange={setTaskListMode}
            onClose={() => onToggleFilterPanel?.(false)}
            onClearAll={clearAllFilters}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
      {/* Bulk Action Bar */}
      {isMultiSelectMode && selectedTaskIds.length > 0 && (
        <Card className="border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-violet-600 text-white px-3 py-1">
                {selectedTaskIds.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Exit Multi-Select
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={bulkCompleteSelected}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={bulkMarkTodo}
                className="gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Mark To Do
              </Button>
              
              <Select onValueChange={(value) => bulkChangePriority(value as 'high' | 'medium' | 'low')}>
                <SelectTrigger className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>Set Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="low">🔵 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks List or Kanban View */}
      {viewMode === 'list' ? (
      <Card className="border-slate-200 overflow-hidden">
        {/* Table Header - Only show in table view, not in split view */}
        {splitViewMode === 'table' && sortedTasks.length > 0 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto min-w-0">
          <div className="flex items-center gap-4">
              <div className="w-12 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                      <div className={`flex items-center justify-center transition-all duration-200 ${!isMultiSelectMode ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`}>
                      <Checkbox
                        checked={isMultiSelectMode && sortedTasks.length > 0 && selectedTaskIds.length === sortedTasks.length}
                        onCheckedChange={toggleSelectAll}
                        className={`${!isMultiSelectMode ? 'shadow-md border-violet-400 data-[state=unchecked]:border-violet-400' : ''}`}
                      />
                    </div>
                  </TooltipTrigger>
                    <TooltipContent side="right">
                    <p className="text-xs">
                      {isMultiSelectMode 
                        ? 'Select/deselect all tasks' 
                          : 'Click to enable multi-select mode'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
              <div className="w-8 flex-shrink-0">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Drag</span>
              </div>
              <div className="w-10 flex-shrink-0">
                {/* Timer column header */}
            </div>
            <div className="w-20 flex-shrink-0">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Assignee
                  {sortColumn === 'assignee' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
              <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                <button
                  onClick={() => handleSort('task')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Task
                  {sortColumn === 'task' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
              {showListColumn && (
                <div className="w-32 flex-shrink-0">
                  <button
                    onClick={() => handleSort('list')}
                    className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                  >
                    List
                    {sortColumn === 'list' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            <div className="w-40 flex-shrink-0">
                <button
                  onClick={() => handleSort('client')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Client
                  {sortColumn === 'client' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
            <div className="w-32 flex-shrink-0">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Status
                  {sortColumn === 'status' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
              <div className="w-28 flex-shrink-0">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Priority
                  {sortColumn === 'priority' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
            <div className="w-32 flex-shrink-0">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                >
                  Due Date
                  {sortColumn === 'dueDate' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
            </div>
              <div className="w-12 flex-shrink-0">
                {/* Actions column header */}
            </div>
          </div>
        </div>
        )}

        {/* Task Rows - Table View or Split View */}
        {splitViewMode === 'table' ? (
          <div className="divide-y divide-slate-100 overflow-x-auto min-w-0">
            {sortedTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-400" />
                  </div>
                <p className="text-slate-500">No tasks found</p>
              </div>
            ) : (
              sortedTasks.map((task) => {
              const priorityStyle = getPriorityStyle(task.priority);
              const statusStyle = getStatusStyle(task.status);
              const isSelected = selectedTaskIds.includes(task.id);
              const indicators = getTaskIndicators(task);
              const isExpanded = expandedTaskId === task.id;
              const hasSubtasks = indicators.subtasks.total > 0;
              
              return (
                <Fragment key={task.id}>
                  <DraggableTaskRow
                    task={task}
                    isSelected={isSelected}
                    onClick={() => handleTaskRowClick(task)}
                    onDragStart={() => {}}
                    onDrop={handleTaskReorder}
                    selectedTaskIds={selectedTaskIds}
                    isMultiSelectMode={isMultiSelectMode}
                    isExpanded={isExpanded}
                    isTimerActive={activeTimer?.taskId === task.id}
                    completedDisplayMode="inline"
                  >
                    {/* Checkbox */}
                    <div className="w-12 flex-shrink-0 flex items-center justify-center">
                      {isMultiSelectMode ? (
                      <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectTask(task.id)}
                        />
                      ) : (
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={(checked) => {
                            onTaskUpdate({
                              ...task,
                              status: checked ? ('completed' as const) : ('todo' as const),
                              completedAt: checked ? new Date().toISOString() : undefined
                            });
                          }}
                        />
                      )}
                    </div>

                    {/* Drag Handle */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center cursor-move">
                      <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                    </div>

                    {/* Timer Button */}
                    <div className="flex-shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleToggleTimer(task, e)}
                              className={`h-9 w-9 p-0 rounded-full relative transition-all duration-200 ${
                                activeTimer?.taskId === task.id
                                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-md animate-pulse'
                                  : 'text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-violet-500 hover:to-indigo-600 hover:shadow-sm border border-slate-200 hover:border-transparent'
                              }`}
                            >
                              {activeTimer?.taskId === task.id ? (
                                <Square className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs font-medium">
                              {activeTimer?.taskId === task.id ? (
                                <>Stop timer • {Math.floor(getTimerElapsed() / 60)}m {getTimerElapsed() % 60}s</>
                              ) : (
                                'Start timer'
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Elapsed time display - shows next to button when active */}
                      {activeTimer?.taskId === task.id && (
                        <div className="ml-2 flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-md border border-violet-200">
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor(getTimerElapsed() / 60)}:{String(getTimerElapsed() % 60).padStart(2, '0')}</span>
                        </div>
                      )}
                    </div>

                    {/* Assignee - Hidden when timer is active */}
                    {activeTimer?.taskId !== task.id && (
                      <div className="w-20 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {editingTaskId === task.id && editingField === 'assignee' ? (
                          <Select
                            value={task.assignee}
                            onValueChange={(value) => {
                              saveInlineEdit(task.id, 'assignee', value);
                            }}
                            onOpenChange={(open) => {
                              if (!open) cancelEditing();
                            }}
                            open={true}
                          >
                            <SelectTrigger className="w-full h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allAssignees.map((assignee) => (
                                <SelectItem key={assignee} value={assignee}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarFallback className="text-[10px]">{getAssigneeName(assignee)}</AvatarFallback>
                                    </Avatar>
                                    {getAssigneeName(assignee)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(task.id, 'assignee', task.assignee);
                            }}
                            className="hover:bg-slate-100 rounded p-1 transition-colors"
                          >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                                        {getAssigneeName(task.assignee)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                                  <p className="text-xs">Click to edit - {getAssigneeName(task.assignee)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                          </button>
                        )}
                    </div>
                    )}

                    {/* Task Name */}
                    <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={(e) => handleTaskNameClick(task, e)}
                          className="text-left hover:bg-slate-100 px-2 py-1 rounded transition-colors w-full group"
                        >
                          <span className={task.status === 'completed' ? 'text-slate-600 line-through decoration-black/20 decoration-1' : 'group-hover:text-violet-700'}>
                          {task.name}
                          </span>
                        </button>
                        {task.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 px-2 ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
                        )}
                        {/* Inline Indicators */}
                        <div className="flex items-center gap-2 mt-2 px-2">
                          {indicators.comments > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(task);
                                      setTaskDialogOpen(true);
                                    }}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{indicators.comments}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{indicators.comments} comment{indicators.comments !== 1 ? 's' : ''} - Click to view</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {indicators.subtasks.total > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2 py-1 rounded-md transition-colors border border-violet-200 hover:border-violet-300 hover:shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                                    }}
                                  >
                                    <ListTodo className="w-3.5 h-3.5" />
                                    <span className="font-medium">{indicators.subtasks.completed}/{indicators.subtasks.total}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3 h-3 ml-0.5" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3 ml-0.5 animate-bounce" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-medium">{isExpanded ? 'Hide' : 'Click to expand'} {indicators.subtasks.total} subtask{indicators.subtasks.total !== 1 ? 's' : ''}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {indicators.attachments > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(task);
                                      setTaskDialogOpen(true);
                                    }}
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{indicators.attachments}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{indicators.attachments} attachment{indicators.attachments !== 1 ? 's' : ''} - Click to view</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* List Column (conditional - hidden for workflow context) */}
                    {showListColumn && (
                      <div className="w-32 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* List column implementation would go here */}
                        </div>
                    )}

                    {/* Client */}
                    <div className="w-40 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {editingTaskId === task.id && editingField === 'client' ? (
                        <Select
                          value={task.projectId}
                          onValueChange={(value) => {
                            saveInlineEdit(task.id, 'projectId', value);
                          }}
                          onOpenChange={(open) => {
                            if (!open) cancelEditing();
                          }}
                          open={true}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                  {project.clientName || 'No Client'}
                    </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(task.id, 'client', task.projectId);
                                }}
                                className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded transition-colors w-full"
                              >
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-sm text-slate-600 truncate">
                                  {getClientName(task.projectId)}
                                </span>
                              </button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>{getClientName(task.projectId)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-32 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {editingTaskId === task.id && editingField === 'status' ? (
                      <Select
                        value={task.status}
                          onValueChange={(value) => {
                            saveInlineEdit(task.id, 'status', value);
                          }}
                          onOpenChange={(open) => {
                            if (!open) cancelEditing();
                          }}
                          open={true}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {customStatuses.map((status) => {
                              const style = getStatusStyle(status);
                              return (
                                <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                                    {style.icon}
                                    {style.label}
                            </div>
                          </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task.id, 'status', task.status);
                          }}
                          className="hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                        >
                          <Badge 
                            variant="outline" 
                            className={`${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border gap-1.5`}
                          >
                            {statusStyle.icon}
                            <span>{statusStyle.label}</span>
                          </Badge>
                        </button>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="w-28 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {editingTaskId === task.id && editingField === 'priority' ? (
                      <Select
                        value={task.priority}
                          onValueChange={(value) => {
                            saveInlineEdit(task.id, 'priority', value);
                          }}
                          onOpenChange={(open) => {
                            if (!open) cancelEditing();
                          }}
                          open={true}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {['low', 'medium', 'high'].map((priority) => {
                              const style = getPriorityStyle(priority);
                              return (
                                <SelectItem key={priority} value={priority}>
                                  <div className="flex items-center gap-2 capitalize">
                                    <span>{style.icon}</span>
                                    {priority}
                            </div>
                          </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task.id, 'priority', task.priority);
                          }}
                          className="hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                        >
                          <Badge 
                            variant="outline"
                            className={`${priorityStyle.bg} ${priorityStyle.color} ${priorityStyle.border} border gap-1.5 capitalize`}
                          >
                            <span>{priorityStyle.icon}</span>
                            <span>{task.priority}</span>
                          </Badge>
                        </button>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="w-32 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {editingTaskId === task.id && editingField === 'dueDate' ? (
                        <Popover 
                          open={true} 
                          onOpenChange={(open) => {
                            if (!open) cancelEditing();
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-8 justify-start text-left font-normal"
                            >
                              <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                              {task.dueDate ? safeFormatDate(task.dueDate, 'MMM d, yyyy') : 'Pick date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={task.dueDate ? (() => {
                                try {
                                  const date = new Date(task.dueDate);
                                  return isNaN(date.getTime()) ? undefined : date;
                                } catch {
                                  return undefined;
                                }
                              })() : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  saveInlineEdit(task.id, 'dueDate', date.toISOString());
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task.id, 'dueDate', task.dueDate || '');
                          }}
                          className="flex items-center gap-2 text-sm hover:bg-slate-100 px-2 py-1 rounded transition-colors w-full"
                        >
                          <CalendarIcon className={`w-3.5 h-3.5 ${
                            isOverdue(task.dueDate, task.status) ? 'text-red-500' : 
                            isDueToday(task.dueDate) ? 'text-green-500' : 
                            'text-slate-400'
                          }`} />
                          <span className={
                            isOverdue(task.dueDate, task.status) ? 'text-red-600' : 
                            isDueToday(task.dueDate) ? 'text-green-600' : 
                            'text-slate-600'
                          }>{task.dueDate ? safeFormatDate(task.dueDate, 'MMM d, yyyy') : 'No due date'}</span>
                        </button>
                      )}
                  </div>

                    {/* Actions Menu */}
                    <div className="w-12 flex-shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-slate-100"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTask(task);
                            setTaskDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              // Delete functionality would go here
                              toast.error('Delete functionality not implemented');
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                </div>
                  </DraggableTaskRow>

                  {/* Expanded Subtasks Section */}
                {isExpanded && hasSubtasks && (
                    <div className="bg-gradient-to-br from-slate-50 to-violet-50/20 border-b border-violet-200/50 px-6 py-4 relative">
                      {/* Left accent border */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-indigo-500"></div>
                      
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center gap-2 mb-3 ml-14">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <ListTodo className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-slate-700">Subtasks</span>
                          <Badge variant="outline" className="bg-white border-violet-200 text-violet-700">
                            {indicators.subtasks.completed}/{indicators.subtasks.total}
                          </Badge>
                        </div>
                        {getSubtasks(task.id).map((subtask) => {
                          const subtaskPriorityStyle = getPriorityStyle((subtask as any).priority || '');
                          const subtaskStatusStyle = getStatusStyle(subtask.status === 'completed' ? 'completed' : subtask.status === 'in-progress' ? 'in-progress' : 'todo');
                        return (
                            <div key={subtask.id} className={`flex items-start gap-4 py-2.5 px-3 rounded-lg border-2 transition-all ${
                              subtask.status === 'completed' 
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md'
                            }`}>
                              {/* Checkbox */}
                              <div className="w-12 flex-shrink-0 flex items-center justify-center pt-0.5">
                              <Checkbox
                                  checked={subtask.status === 'completed'} 
                                  onCheckedChange={() => {}}
                              />
                            </div>
                            
                              {/* Drag Handle Space */}
                              <div className="w-8 flex-shrink-0"></div>
                              
                              {/* Assignee - aligned with parent */}
                              <div className="w-20 flex-shrink-0 pt-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                        <Avatar className="w-7 h-7">
                                          <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                                            {subtask.assignee}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p className="text-xs">{subtask.assignee}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                              {/* Task Content - aligned with parent Task column */}
                              <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                                <span className={subtask.status === 'completed' ? 'text-sm text-slate-700 line-through decoration-slate-600' : 'text-sm text-slate-700'}>
                                  {subtask.name}
                                </span>
                            </div>
                            
                              {/* List Column Spacer (when shown) */}
                              {showListColumn && (
                                <div className="w-32 flex-shrink-0"></div>
                              )}
                              
                              {/* Client Column Spacer */}
                            <div className="w-40 flex-shrink-0"></div>
                            
                            {/* Status - aligned with parent */}
                              <div className="w-32 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className={`${subtaskStatusStyle.bg} ${subtaskStatusStyle.color} ${subtaskStatusStyle.border} border text-xs`}
                                >
                                  {subtask.status === 'completed' ? 'Done' : subtask.status === 'in-progress' ? 'In Progress' : 'To Do'}
                                </Badge>
                              </div>
                              
                              {/* Priority - aligned with parent */}
                              <div className="w-28 flex-shrink-0">
                                <Badge 
                                  variant="outline"
                                  className={`${subtaskPriorityStyle.bg} ${subtaskPriorityStyle.color} ${subtaskPriorityStyle.border} border gap-1 text-xs capitalize`}
                                >
                                  <span>{subtaskPriorityStyle.icon}</span>
                                  <span>{subtask.priority}</span>
                                </Badge>
                            </div>
                            
                              {/* Due Date Column Spacer */}
                              <div className="w-32 flex-shrink-0"></div>
                              
                              {/* Actions Column Spacer */}
                              <div className="w-12 flex-shrink-0"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                  </Fragment>
              );
            })
          )}
          </div>
        ) : splitViewMode === 'split' && userGroups.length > 0 ? (
          // Split View - Group by User
          <div className="space-y-6">
            {userGroups.map((userGroup) => {
              const userTasks = userGroup.tasks;
              
              return (
                <div key={userGroup.userId} className="space-y-3">
                  {/* User Header */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{userGroup.userName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Team Member</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                        {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* User's Tasks Table */}
                  <Card className="border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    {userTasks.length > 0 && (
                      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="w-12 flex-shrink-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`flex items-center justify-center transition-all duration-200 ${!isMultiSelectMode ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`}>
                                    <Checkbox
                                      checked={isMultiSelectMode && userTasks.length > 0 && userTasks.every(t => selectedTaskIds.includes(t.id))}
                                      onCheckedChange={() => {
                                        if (isMultiSelectMode) {
                                          const allSelected = userTasks.every(t => selectedTaskIds.includes(t.id));
                                          if (allSelected) {
                                            setSelectedTaskIds(selectedTaskIds.filter(id => !userTasks.some(t => t.id === id)));
                                          } else {
                                            setSelectedTaskIds([...selectedTaskIds, ...userTasks.map(t => t.id).filter(id => !selectedTaskIds.includes(id))]);
                                          }
                                        } else {
                                          setIsMultiSelectMode(true);
                                        }
                                      }}
                                      className={`${!isMultiSelectMode ? 'shadow-md border-violet-400 data-[state=unchecked]:border-violet-400' : ''}`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="text-xs">
                                    {isMultiSelectMode 
                                      ? 'Select/deselect all tasks' 
                                        : 'Click to enable multi-select mode'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="w-8 flex-shrink-0">
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Drag</span>
                          </div>
                          <div className="w-10 flex-shrink-0">
                            {/* Timer column header */}
                          </div>
                          <div className="w-20 flex-shrink-0">
                            <button
                              onClick={() => handleSort('assignee')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Assignee
                              {sortColumn === 'assignee' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                            <button
                              onClick={() => handleSort('task')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Task
                              {sortColumn === 'task' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {showListColumn && (
                            <div className="w-32 flex-shrink-0">
                              <button
                                onClick={() => handleSort('list')}
                                className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                              >
                                List
                                {sortColumn === 'list' && (
                                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                          <div className="w-40 flex-shrink-0">
                            <button
                              onClick={() => handleSort('client')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Client
                              {sortColumn === 'client' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Status
                              {sortColumn === 'status' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="w-28 flex-shrink-0">
                            <button
                              onClick={() => handleSort('priority')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Priority
                              {sortColumn === 'priority' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <button
                              onClick={() => handleSort('dueDate')}
                              className="flex items-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Due Date
                              {sortColumn === 'dueDate' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="w-12 flex-shrink-0">
                            {/* Actions column header */}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User's Task Rows */}
                    <div className="divide-y divide-slate-100 overflow-x-auto min-w-0">
                      {userTasks.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckSquare className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500">No tasks found</p>
                        </div>
                      ) : (
                        userTasks.map((task) => {
                          const priorityStyle = getPriorityStyle(task.priority);
                          const statusStyle = getStatusStyle(task.status);
                          const isSelected = selectedTaskIds.includes(task.id);
                          const indicators = getTaskIndicators(task);
                          const isExpanded = expandedTaskId === task.id;
                          const hasSubtasks = indicators.subtasks.total > 0;
                          
                          return (
                            <Fragment key={task.id}>
                              <DraggableTaskRow
                                task={task}
                                isSelected={isSelected}
                                onClick={() => handleTaskRowClick(task)}
                                onDragStart={() => {}}
                                onDrop={handleTaskReorder}
                                selectedTaskIds={selectedTaskIds}
                                isMultiSelectMode={isMultiSelectMode}
                                isExpanded={isExpanded}
                                isTimerActive={activeTimer?.taskId === task.id}
                                completedDisplayMode="inline"
                              >
                                {/* Reuse the same task row content from table view */}
                                {/* Checkbox */}
                                <div className="w-12 flex-shrink-0 flex items-center justify-center">
                                  {isMultiSelectMode ? (
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleSelectTask(task.id)}
                                    />
                                  ) : (
                                    <Checkbox
                                      checked={task.status === 'completed'}
                                      onCheckedChange={(checked) => {
                                        onTaskUpdate({
                                          ...task,
                                          status: checked ? ('completed' as const) : ('todo' as const),
                                          completedAt: checked ? new Date().toISOString() : undefined
                                        });
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Drag Handle */}
                                <div className="w-8 flex-shrink-0 flex items-center justify-center cursor-move">
                                  <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                </div>

                                {/* Timer Button */}
                                <div className="flex-shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => handleToggleTimer(task, e)}
                                          className={`h-9 w-9 p-0 rounded-full relative transition-all duration-200 ${
                                            activeTimer?.taskId === task.id
                                              ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-md animate-pulse'
                                              : 'text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-violet-500 hover:to-indigo-600 hover:shadow-sm border border-slate-200 hover:border-transparent'
                                          }`}
                                        >
                                          {activeTimer?.taskId === task.id ? (
                                            <Square className="w-4 h-4 fill-current" />
                                          ) : (
                                            <Play className="w-4 h-4 fill-current ml-0.5" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs font-medium">
                                          {activeTimer?.taskId === task.id ? (
                                            <>Stop timer • {Math.floor(getTimerElapsed() / 60)}m {getTimerElapsed() % 60}s</>
                                          ) : (
                                            'Start timer'
                                          )}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  {activeTimer?.taskId === task.id && (
                                    <div className="ml-2 flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-md border border-violet-200">
                                      <Clock className="w-3 h-3" />
                                      <span>{Math.floor(getTimerElapsed() / 60)}:{String(getTimerElapsed() % 60).padStart(2, '0')}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Assignee */}
                                {activeTimer?.taskId !== task.id && (
                                  <div className="w-20 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {editingTaskId === task.id && editingField === 'assignee' ? (
                                      <Select
                                        value={task.assignee}
                                        onValueChange={(value) => {
                                          saveInlineEdit(task.id, 'assignee', value);
                                        }}
                                        onOpenChange={(open) => {
                                          if (!open) cancelEditing();
                                        }}
                                        open={true}
                                      >
                                        <SelectTrigger className="w-full h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {allAssignees.map((assignee) => (
                                            <SelectItem key={assignee} value={assignee}>
                                              <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                  <AvatarFallback className="text-[10px]">{getAssigneeName(assignee)}</AvatarFallback>
                                                </Avatar>
                                                {getAssigneeName(assignee)}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(task.id, 'assignee', task.assignee);
                                        }}
                                        className="hover:bg-slate-100 rounded p-1 transition-colors"
                                      >
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div>
                                                <Avatar className="w-8 h-8">
                                                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                                                    {getAssigneeName(task.assignee)}
                                                  </AvatarFallback>
                                                </Avatar>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">Click to edit - {getAssigneeName(task.assignee)}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Task Name */}
                                <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                                  {editingTaskId === task.id && editingField === 'name' ? (
                                    <input
                                      type="text"
                                      defaultValue={task.name}
                                      onBlur={(e) => {
                                        saveInlineEdit(task.id, 'name', e.target.value);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveInlineEdit(task.id, 'name', (e.target as HTMLInputElement).value);
                                        } else if (e.key === 'Escape') {
                                          cancelEditing();
                                        }
                                      }}
                                      autoFocus
                                      className="w-full px-2 py-1 border border-violet-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(task.id, 'name', task.name);
                                      }}
                                      className="text-left hover:bg-slate-50 rounded px-2 py-1 transition-colors w-full"
                                    >
                                      <span className="font-medium text-slate-900">{task.name}</span>
                                    </button>
                                  )}
                                </div>

                                {/* List Column */}
                                {showListColumn && (
                                  <div className="w-32 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs">
                                      {getTaskListName(task.id)}
                                    </Badge>
                                  </div>
                                )}

                                {/* Client */}
                                <div className="w-40 flex-shrink-0">
                                  <span className="text-sm text-slate-600">{getClientName(task.projectId)}</span>
                                </div>

                                {/* Status */}
                                <div className="w-32 flex-shrink-0">
                                  {editingTaskId === task.id && editingField === 'status' ? (
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => {
                                        saveInlineEdit(task.id, 'status', value);
                                      }}
                                      onOpenChange={(open) => {
                                        if (!open) cancelEditing();
                                      }}
                                      open={true}
                                    >
                                      <SelectTrigger className="w-full h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {customStatuses.map((status) => (
                                          <SelectItem key={status} value={status}>
                                            {status === 'completed' ? 'Done' : status === 'in-progress' ? 'In Progress' : status === 'blocked' ? 'Blocked' : 'To Do'}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(task.id, 'status', task.status);
                                      }}
                                      className="hover:bg-slate-50 rounded p-1 transition-colors"
                                    >
                                      <Badge 
                                        variant="outline" 
                                        className={`${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border text-xs`}
                                      >
                                        {statusStyle.icon}
                                        {statusStyle.label}
                                      </Badge>
                                    </button>
                                  )}
                                </div>

                                {/* Priority */}
                                <div className="w-28 flex-shrink-0">
                                  {editingTaskId === task.id && editingField === 'priority' ? (
                                    <Select
                                      value={task.priority || ''}
                                      onValueChange={(value) => {
                                        saveInlineEdit(task.id, 'priority', value);
                                      }}
                                      onOpenChange={(open) => {
                                        if (!open) cancelEditing();
                                      }}
                                      open={true}
                                    >
                                      <SelectTrigger className="w-full h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="high">🔴 High</SelectItem>
                                        <SelectItem value="medium">🟡 Medium</SelectItem>
                                        <SelectItem value="low">🔵 Low</SelectItem>
                                        <SelectItem value="">None</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(task.id, 'priority', task.priority || '');
                                      }}
                                      className="hover:bg-slate-50 rounded p-1 transition-colors"
                                    >
                                      <Badge 
                                        variant="outline"
                                        className={`${priorityStyle.bg} ${priorityStyle.color} ${priorityStyle.border} border gap-1 text-xs capitalize`}
                                      >
                                        <span>{priorityStyle.icon}</span>
                                        <span>{task.priority || 'None'}</span>
                                      </Badge>
                                    </button>
                                  )}
                                </div>

                                {/* Due Date */}
                                <div className="w-32 flex-shrink-0">
                                  {editingTaskId === task.id && editingField === 'dueDate' ? (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full h-8">
                                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Set due date'}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                          onSelect={(date) => {
                                            if (date) {
                                              saveInlineEdit(task.id, 'dueDate', date.toISOString());
                                            }
                                          }}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(task.id, 'dueDate', task.dueDate || '');
                                      }}
                                      className="hover:bg-slate-50 rounded p-1 transition-colors w-full text-left"
                                    >
                                      {task.dueDate ? (
                                        <div className="flex items-center gap-1.5">
                                          <CalendarIcon className={`w-3.5 h-3.5 ${isOverdue(task.dueDate, task.status) ? 'text-red-500' : isDueSoon(task.dueDate) ? 'text-amber-500' : 'text-slate-400'}`} />
                                          <span className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : isDueSoon(task.dueDate) ? 'text-amber-600' : 'text-slate-600'}`}>
                                            {format(new Date(task.dueDate), 'MMM d')}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-slate-400">No due date</span>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="w-12 flex-shrink-0 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleTaskRowClick(task)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => {
                                          // Handle delete
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </DraggableTaskRow>

                              {/* Subtasks - same as table view */}
                              {isExpanded && hasSubtasks && (
                                <div className="bg-slate-50/50 border-l-4 border-l-violet-400">
                                  <div className="pl-6 pr-6 py-2 space-y-2">
                                    {indicators.subtasks.items.map((subtask) => {
                                      const subtaskStatusStyle = getStatusStyle(subtask.status);
                                      const subtaskPriorityStyle = getPriorityStyle(subtask.priority);
                                      
                                      return (
                                        <div key={subtask.id} className="flex items-center gap-4 pl-8 py-2 border-b border-slate-100 last:border-b-0">
                                          <div className="w-12 flex-shrink-0"></div>
                                          <div className="w-8 flex-shrink-0"></div>
                                          <div className="w-10 flex-shrink-0"></div>
                                          <div className="w-20 flex-shrink-0"></div>
                                          <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                                            <span className="text-sm text-slate-600">{subtask.name}</span>
                                          </div>
                                          {showListColumn && (
                                            <div className="w-32 flex-shrink-0"></div>
                                          )}
                                          <div className="w-40 flex-shrink-0"></div>
                                          <div className="w-32 flex-shrink-0">
                                            <Badge 
                                              variant="outline" 
                                              className={`${subtaskStatusStyle.bg} ${subtaskStatusStyle.color} ${subtaskStatusStyle.border} border text-xs`}
                                            >
                                              {subtask.status === 'completed' ? 'Done' : subtask.status === 'in-progress' ? 'In Progress' : 'To Do'}
                                            </Badge>
                                          </div>
                                          <div className="w-28 flex-shrink-0">
                                            <Badge 
                                              variant="outline"
                                              className={`${subtaskPriorityStyle.bg} ${subtaskPriorityStyle.color} ${subtaskPriorityStyle.border} border gap-1 text-xs capitalize`}
                                            >
                                              <span>{subtaskPriorityStyle.icon}</span>
                                              <span>{subtask.priority}</span>
                                            </Badge>
                                          </div>
                                          <div className="w-32 flex-shrink-0"></div>
                                          <div className="w-12 flex-shrink-0"></div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </Fragment>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No tasks found</p>
          </div>
        )}
      </Card>
      ) : (
        // Kanban View
        <div className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(() => {
              // Get unique statuses from workflow or use defaults
              const workflowStatuses = workflow?.customStatuses || ['To Do', 'In Progress', 'Completed'];
              const statusOrder = ['To Do', 'In Progress'].concat(
                workflowStatuses.filter((s: string) => s !== 'To Do' && s !== 'In Progress' && s !== 'Completed')
              ).concat(['Completed']);
              
              return statusOrder.map((status) => {
                const statusTasks = sortedTasks.filter(task => {
                  if (status === 'To Do') return task.status === 'to-do' || task.status === 'To Do';
                  if (status === 'In Progress') return task.status === 'in-progress' || task.status === 'In Progress';
                  if (status === 'Completed') return task.status === 'completed' || task.status === 'Completed';
                  return task.status === status;
                });
                
                const statusColor = 'bg-violet-500'; // Default color
                
                return (
                  <div 
                    key={status} 
                    className="flex-shrink-0 w-80"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('ring-2', 'ring-violet-400');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('ring-2', 'ring-violet-400');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-violet-400');
                      const taskId = e.dataTransfer.getData('taskId');
                      const task = workflowTasks.find(t => t.id === taskId);
                      if (task) {
                        let newStatus = status;
                        if (status === 'To Do') newStatus = 'to-do';
                        else if (status === 'In Progress') newStatus = 'in-progress';
                        else if (status === 'Completed') newStatus = 'completed';
                        
                        onTaskUpdate({ ...task, status: newStatus as any });
                      }
                    }}
                  >
                    <div className="bg-slate-50 rounded-lg border border-slate-200 flex flex-col h-full max-h-[calc(100vh-400px)]">
                      <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${statusColor}`}
                          />
                          <h3 className="font-medium">{status}</h3>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {statusTasks.length}
                          </Badge>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                          {statusTasks.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                              No tasks
                            </div>
                          ) : (
                            statusTasks.map((task) => {
                              const priorityStyle = getPriorityStyle((task as any).priority || '');
                              const indicators = getTaskIndicators(task);
                              
                              return (
                                <Card
                                  key={task.id}
                                  className={`hover:shadow-md transition-all border-slate-200 hover:border-violet-300 ${
                                    task.status === 'completed' 
                                      ? 'bg-slate-50' 
                                      : 'bg-white'
                                  }`}
                                >
                                  <div 
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('taskId', task.id);
                                    }}
                                    onClick={(e) => {
                                      const target = e.target as HTMLElement;
                                      if (
                                        target.closest('button') || 
                                        target.closest('[role="checkbox"]')
                                      ) {
                                        return;
                                      }
                                      setSelectedTask(task);
                                      setTaskDialogOpen(true);
                                    }}
                                    className="p-3 cursor-move space-y-2"
                                  >
                                    <div className="flex items-start gap-2">
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                          checked={task.status === 'completed'}
                                          onCheckedChange={(checked) => {
                                            const updatedTask = {
                                              ...task,
                                              status: checked ? ('completed' as const) : ('to-do' as const),
                                              completedAt: checked ? new Date().toISOString() : undefined
                                            };
                                            onTaskUpdate(updatedTask);
                                          }}
                                          className="mt-0.5"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={`text-sm ${task.status === 'completed' ? 'line-through decoration-black/20 decoration-1 text-slate-600' : ''}`}>
                                          {task.name}
                                        </div>
                                        {task.description && (
                                          <p className={`text-xs mt-1 line-clamp-2 ${task.status === 'completed' ? 'text-slate-500' : 'text-slate-500'}`}>{task.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div>
                                              <Avatar className="w-6 h-6">
                                                <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                                                  {getAssigneeName(task.assignee)}
                                                </AvatarFallback>
                                              </Avatar>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{getAssigneeName(task.assignee)}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      {task.priority && (
                                        <Badge 
                                          variant="outline"
                                          className={`${priorityStyle.bg} ${priorityStyle.color} ${priorityStyle.border} border text-[10px] px-1.5 py-0`}
                                        >
                                          <span>{priorityStyle.icon}</span>
                                        </Badge>
                                      )}
                                      
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                          <CalendarIcon className="w-3 h-3" />
                                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-1.5 ml-auto">
                                        {indicators.comments > 0 && (
                                          <div className="flex items-center gap-0.5 text-slate-500">
                                            <MessageSquare className="w-3 h-3" />
                                            <span className="text-[10px]">{indicators.comments}</span>
                                          </div>
                                        )}
                                        {indicators.attachments > 0 && (
                                          <div className="flex items-center gap-0.5 text-slate-500">
                                            <Paperclip className="w-3 h-3" />
                                            <span className="text-[10px]">{indicators.attachments}</span>
                                          </div>
                                        )}
                                        {indicators.subtasks.total > 0 && (
                                          <div className="flex items-center gap-0.5 text-slate-500">
                                            <ListTodo className="w-3 h-3" />
                                            <span className="text-[10px]">{indicators.subtasks.completed}/{indicators.subtasks.total}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Timer Confirmation Dialog */}
      <AlertDialog open={showTimerConfirmation} onOpenChange={setShowTimerConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Timer?</AlertDialogTitle>
            <AlertDialogDescription>
              You currently have a timer running for "{workflowTasks.find(t => t.id === activeTimer?.taskId)?.name}". 
              Do you want to stop it and start a new timer for "{pendingTimerTask?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowTimerConfirmation(false);
              setPendingTimerTask(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartTimer}>
              Switch Timer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onTaskUpdate={onTaskUpdate}
        workflow={workflow}
        project={selectedTask ? getProjectByTaskId(selectedTask.id) : undefined}
      />
        </div>
      </div>
    </div>
  );
}