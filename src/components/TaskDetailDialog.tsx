import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns@3.6.0';
import { 
  Calendar, 
  Clock, 
  Upload,
  FileText,
  Plus,
  Send,
  X,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
  User,
  Building2,
  UserCircle,
  Flag,
  CheckCircle2,
  ListTodo,
  MessageSquare,
  Activity,
  AlertCircle,
  Download,
  Image as ImageIcon,
  File,
  Settings,
  GripVertical,
  Repeat,
  FolderOpen,
  ExternalLink,
  Info,
  Phone,
  Mail
} from 'lucide-react';
import { ProjectTask, Workflow, Project, useWorkflowContext } from './WorkflowContext';
import { toast } from 'sonner@2.0.3';
import { TimeTrackingDetailDialog } from './TimeTrackingDetailDialog';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  owner?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  initials: string;
  avatarColor: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface TaskList {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  sharedWith?: string[];
}

interface TaskDetailDialogProps {
  task: ProjectTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (task: ProjectTask) => void;
  workflow?: Workflow;
  project?: Project;
  taskLists?: TaskList[];
  currentListId?: string;
  onListChange?: (taskId: string, listId: string) => void;
  mode?: 'view' | 'create';
  onBackToSimple?: () => void;
}

export function TaskDetailDialog({ task, open, onOpenChange, onTaskUpdate, workflow, project, taskLists, currentListId, onListChange, mode = 'view', onBackToSimple }: TaskDetailDialogProps) {
  const { addTask } = useWorkflowContext();
  const [isDragging, setIsDragging] = useState(false);
  const [timeTrackingDetailOpen, setTimeTrackingDetailOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = 'JD'; // Current logged-in user

  const [subTasks, setSubTasks] = useState<SubTask[]>(
    mode === 'create' ? [] : [
      { id: '1', title: 'Review client documentation', completed: true, description: 'Go through all documentation', priority: 'high', owner: 'John Doe' },
      { id: '2', title: 'Prepare initial analysis', completed: false, description: 'Create analysis report', priority: 'medium', owner: 'Sarah Miller' },
      { id: '3', title: 'Schedule follow-up meeting', completed: false, priority: 'low' },
    ]
  );
  
  const [comments, setComments] = useState<Comment[]>(
    mode === 'create' ? [] : [
      {
        id: '1',
        author: 'You',
        initials: 'YO',
        content: 'I reached out to the client about the missing documents. Waiting for their response.',
        timestamp: '1 hour ago',
        avatarColor: 'bg-yellow-100 text-yellow-700'
      },
      {
        id: '2',
        author: 'Nav Chan',
        initials: 'NC',
        content: 'Client has requested additional time to provide missing documents.',
        timestamp: '2 hours ago',
        avatarColor: 'bg-blue-100 text-blue-700'
      },
      {
        id: '3',
        author: 'Sarah Miller',
        initials: 'SM',
        content: 'Reminder: This needs to be completed by end of week.',
        timestamp: '1 day ago',
        avatarColor: 'bg-purple-100 text-purple-700'
      }
    ]
  );
  
  const [attachments, setAttachments] = useState<Attachment[]>(
    mode === 'create' ? [] : [
      {
        id: '1',
        name: 'tax_documents_2024.pdf',
        size: '2.4 MB',
        type: 'pdf',
        uploadedBy: 'JD',
        uploadedAt: '3 days ago'
      }
    ]
  );

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(
    mode === 'create' ? [] : [
      {
        id: '1',
        user: 'Nav Chan',
        timestamp: '04/03/2025 01:46 PM',
        action: 'updated task description from...',
        details: 'updated task description from...'
      },
      {
        id: '2',
        user: 'Nav Chan',
        timestamp: '04/03/2025 01:46 PM',
        action: "assigned a sub task to 'Nav c...'",
        details: "assigned a sub task to 'Nav c...'"
      },
      {
        id: '3',
        user: 'Nav Chan',
        timestamp: '04/03/2025 01:46 PM',
        action: "created a new sub task 'test'",
        details: "created a new sub task 'test'"
      },
      {
        id: '4',
        user: 'Nav Chan',
        timestamp: '04/03/2025 12:19 PM',
        action: 'added a new comment with l...',
        details: 'added a new comment with l...'
      },
      {
        id: '5',
        user: 'Nav Chan',
        timestamp: '04/03/2025 12:00 PM',
        action: 'updated task assigned user t...',
        details: 'updated task assigned user t...'
      },
      {
        id: '6',
        user: 'Nav Chan',
        timestamp: '01/31/2025 03:30 PM',
        action: 'created this task',
        details: 'created this task'
      }
    ]
  );

  const [newComment, setNewComment] = useState('');
  const [newSubTask, setNewSubTask] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task?.name || '');
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showIncompleteSubtasksDialog, setShowIncompleteSubtasksDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [hideCompletedSubtasks, setHideCompletedSubtasks] = useState(false);
  const [statusManageDialogOpen, setStatusManageDialogOpen] = useState(false);
  
  // Default status options - can be customized
  const [statusOptions, setStatusOptions] = useState([
    { value: 'todo', label: 'Open', color: 'bg-slate-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' }
  ]);
  
  // Helper function to safely parse dates
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  };
  
  const [dueDate, setDueDate] = useState<Date | undefined>(parseDate(task?.dueDate));
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
  
  // Recurring task state
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [showAdvancedRecurrence, setShowAdvancedRecurrence] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'weekdays' | 'monthly' | 'yearly' | 'custom'>(
    task?.recurrencePattern || 'monthly'
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState(task?.recurrenceInterval || 1);
  const [recurrenceBaseDate, setRecurrenceBaseDate] = useState<'scheduled' | 'completed'>(task?.recurrenceBaseDate || 'scheduled');
  const [recurrenceStartDate, setRecurrenceStartDate] = useState<Date | undefined>(
    task?.recurrenceStartDate ? parseDate(task.recurrenceStartDate) : undefined
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    task?.recurrenceEndDate ? parseDate(task.recurrenceEndDate) : undefined
  );
  const [recurrenceWeekDays, setRecurrenceWeekDays] = useState<number[]>(task?.recurrenceWeekDays || []);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number | undefined>(task?.recurrenceDayOfMonth);

  // Initialize weekDays and dayOfMonth from dueDate if not set
  useEffect(() => {
    if (isRecurring && dueDate) {
      // Initialize weekDays for weekly pattern if not set
      if (recurrencePattern === 'weekly' && recurrenceWeekDays.length === 0) {
        const dayOfWeek = dueDate.getDay();
        setRecurrenceWeekDays([dayOfWeek]);
      }
      // Initialize dayOfMonth for monthly pattern if not set
      if (recurrencePattern === 'monthly' && !recurrenceDayOfMonth) {
        setRecurrenceDayOfMonth(dueDate.getDate());
      }
    }
  }, [isRecurring, recurrencePattern, dueDate]);

  if (!task) return null;

  // Helper function to safely format dates
  const safeFormatDate = (date: Date | undefined, formatStr: string): string => {
    if (!date) return '';
    try {
      return format(date, formatStr);
    } catch {
      return '';
    }
  };

  const handleTaskNameChange = () => {
    if (taskName.trim() && taskName !== task.name) {
      onTaskUpdate({ ...task, name: taskName.trim() });
      toast.success('Task name updated');
    }
    setIsEditingName(false);
  };

  const handleStatusChange = (newStatus: string) => {
    // Check if trying to complete task with incomplete subtasks
    if (newStatus === 'completed') {
      const incompleteSubtasks = subTasks.filter(st => !st.completed);
      if (incompleteSubtasks.length > 0) {
        setPendingStatus(newStatus);
        setShowIncompleteSubtasksDialog(true);
        return;
      }
    }
    
    // Proceed with status change
    onTaskUpdate({
      ...task,
      status: newStatus as ProjectTask['status'],
      completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt
    });
    toast.success('Status updated');
    
    // Handle recurring task - create next occurrence
    if (newStatus === 'completed' && task.isRecurring && task.recurrencePattern) {
      // Determine base date for calculation
      const baseDate = task.recurrenceBaseDate === 'completed' 
        ? new Date() 
        : new Date(task.dueDate);
      
      let nextDueDate: Date;
      const interval = task.recurrenceInterval || 1;
      
      switch (task.recurrencePattern) {
        case 'daily':
          nextDueDate = addDays(baseDate, interval);
          break;
        case 'weekly':
          nextDueDate = addWeeks(baseDate, interval);
          break;
        case 'weekdays':
          // Find next weekday
          nextDueDate = addDays(baseDate, 1);
          while (nextDueDate.getDay() === 0 || nextDueDate.getDay() === 6) {
            nextDueDate = addDays(nextDueDate, 1);
          }
          break;
        case 'monthly':
          nextDueDate = addMonths(baseDate, interval);
          break;
        case 'yearly':
          nextDueDate = addYears(baseDate, interval);
          break;
        case 'custom':
          // Use interval with the base pattern
          nextDueDate = addDays(baseDate, interval);
          break;
        default:
          nextDueDate = addMonths(baseDate, interval);
      }
      
      // Check if next occurrence is within end date range
      if (task.recurrenceEndDate && nextDueDate > new Date(task.recurrenceEndDate)) {
        toast.info('Recurrence ended - no more tasks will be created');
        return;
      }
      
      // Create new recurring task
      addTask({
        name: task.name,
        description: task.description,
        projectId: task.projectId,
        workflowId: task.workflowId,
        stageId: task.stageId,
        assignee: task.assignee,
        priority: task.priority,
        status: 'todo',
        dueDate: nextDueDate.toISOString(),
        automations: task.automations,
        dependencies: [],
        isRecurring: task.isRecurring,
        recurrencePattern: task.recurrencePattern,
        recurrenceInterval: task.recurrenceInterval,
        recurrenceBaseDate: task.recurrenceBaseDate,
        recurrenceStartDate: task.recurrenceStartDate,
        recurrenceEndDate: task.recurrenceEndDate,
        recurrenceWeekDays: task.recurrenceWeekDays,
        recurrenceDayOfMonth: task.recurrenceDayOfMonth
      });
      
      toast.success('Next recurring task created');
    }
  };

  const confirmCompleteWithPendingSubtasks = () => {
    if (pendingStatus) {
      onTaskUpdate({
        ...task,
        status: pendingStatus as ProjectTask['status'],
        completedAt: pendingStatus === 'completed' ? new Date().toISOString() : task.completedAt
      });
      toast.success('Status updated');
      
      // Handle recurring task - create next occurrence
      if (pendingStatus === 'completed' && task.isRecurring && task.recurrencePattern) {
        const currentDueDate = new Date(task.dueDate);
        let nextDueDate: Date;
        
        const interval = task.recurrenceInterval || 1;
        
        switch (task.recurrencePattern) {
          case 'daily':
            nextDueDate = addDays(currentDueDate, interval);
            break;
          case 'weekly':
            nextDueDate = addWeeks(currentDueDate, interval);
            break;
          case 'monthly':
            nextDueDate = addMonths(currentDueDate, interval);
            break;
          case 'quarterly':
            nextDueDate = addMonths(currentDueDate, 3 * interval);
            break;
          case 'yearly':
            nextDueDate = addYears(currentDueDate, interval);
            break;
          default:
            nextDueDate = addMonths(currentDueDate, interval);
        }
        
        // Create new recurring task
        addTask({
          name: task.name,
          description: task.description,
          projectId: task.projectId,
          workflowId: task.workflowId,
          stageId: task.stageId,
          assignee: task.assignee,
          priority: task.priority,
          status: 'todo',
          dueDate: nextDueDate.toISOString(),
          automations: task.automations,
          dependencies: [],
          isRecurring: task.isRecurring,
          recurrencePattern: task.recurrencePattern,
          recurrenceInterval: task.recurrenceInterval
        });
        
        toast.success('Next recurring task created');
      }
    }
    setShowIncompleteSubtasksDialog(false);
    setPendingStatus(null);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      initials: 'YO',
      content: newComment,
      timestamp: 'Just now',
      avatarColor: 'bg-yellow-100 text-yellow-700'
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleEditComment = (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (comment) {
      setEditingCommentId(id);
      setEditingCommentText(comment.content);
    }
  };

  const handleSaveCommentEdit = () => {
    if (!editingCommentText.trim()) return;
    
    setComments(comments.map(c => 
      c.id === editingCommentId 
        ? { ...c, content: editingCommentText, timestamp: 'Just now (edited)' }
        : c
    ));
    setEditingCommentId(null);
    setEditingCommentText('');
    toast.success('Comment updated');
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
    toast.success('Comment deleted');
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    
    const subTask: SubTask = {
      id: Date.now().toString(),
      title: newSubTask,
      completed: false,
      priority: 'medium',
      owner: currentUserId
    };
    
    setSubTasks([...subTasks, subTask]);
    setNewSubTask('');
    setExpandedSubtaskId(subTask.id); // Auto-expand new subtask
    toast.success('Subtask added');
  };

  const updateSubTask = (id: string, field: keyof SubTask, value: any) => {
    setSubTasks(subTasks.map(st => 
      st.id === id ? { ...st, [field]: value } : st
    ));
  };

  const deleteSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
    toast.success('Subtask deleted');
  };

  const toggleSubTask = (id: string) => {
    setSubTasks(subTasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      name: 'dropped-file.pdf',
      size: '1.2 MB',
      type: 'pdf',
      uploadedBy: 'You',
      uploadedAt: 'Just now'
    };
    setAttachments([newAttachment, ...attachments]);
    toast.success('File uploaded');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: files[0].name,
        size: '1.2 MB',
        type: files[0].type.includes('pdf') ? 'pdf' : 'doc',
        uploadedBy: 'You',
        uploadedAt: 'Just now'
      };
      setAttachments([newAttachment, ...attachments]);
      toast.success('File uploaded');
    }
  };

  // Group activity log by date
  const groupedActivityLog: { date: string; entries: ActivityLogEntry[] }[] = [];
  activityLog.forEach((entry) => {
    const date = entry.timestamp.split(' ')[0]; // Extract date part
    let group = groupedActivityLog.find(g => g.date === date);
    if (!group) {
      group = { date, entries: [] };
      groupedActivityLog.push(group);
    }
    group.entries.push(entry);
  });

  const completedSubtasks = subTasks.filter(st => st.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1400px] h-[90vh] p-0 gap-0 flex flex-col">
        <DialogTitle className="sr-only">{task.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Task details including description, subtasks, comments, attachments, and activity log
        </DialogDescription>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {mode === 'create' && onBackToSimple && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToSimple}
                  className="mr-2 gap-2 text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Simple
                </Button>
              )}
              {isEditingName ? (
                <>
                  <Input
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    onBlur={handleTaskNameChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTaskNameChange();
                      if (e.key === 'Escape') {
                        setTaskName(task.name);
                        setIsEditingName(false);
                      }
                    }}
                    autoFocus
                    className="flex-1 max-w-[calc(100%-80px)] border-violet-300 focus-visible:ring-violet-500 h-10 shadow-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleTaskNameChange}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-10 shrink-0 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div 
                    className="group cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setIsEditingName(true);
                      setTaskName(task.name);
                    }}
                  >
                    <h2 className="hover:text-violet-600 transition-colors">
                      {task.name}
                    </h2>
                    <Pencil className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
                  </div>
                  
                  <div className="h-5 w-px bg-violet-200 mx-1" />
                  
                  <Select 
                    value={task.assignee || 'Unassigned'} 
                    onValueChange={(value) => onTaskUpdate({ ...task, assignee: value === 'Unassigned' ? undefined : value })}
                  >
                    <SelectTrigger className="w-[180px] h-9 border-violet-200 bg-white/80 hover:bg-white shadow-sm shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5 ring-2 ring-violet-100">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
                            {task.assignee?.substring(0, 1).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{task.assignee || 'Unassigned'}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                      <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            
            {/* Created Date or Create Button - Right Side */}
            {mode === 'create' ? (
              <Button
                onClick={() => {
                  // Close the comprehensive view and let the parent handle task creation
                  onOpenChange(false);
                }}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-sm mr-10 px-6"
              >
                <Check className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            ) : (
              !isEditingName && task.createdAt && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-violet-200 shadow-sm mr-10">
                  <Clock className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs text-slate-600">
                    Created {safeFormatDate(task.createdAt, 'MMM d, yyyy')}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Two Column Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - 70% */}
          <div className="w-[70%] border-r border-slate-200">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-5">
                {/* Description */}
                <div className="border border-violet-100 rounded-lg p-4 bg-gradient-to-br from-white to-violet-50/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs uppercase tracking-wide text-slate-600">
                      Description
                    </label>
                  </div>
                  <Textarea
                    value={task.description || 'Schedule and conduct approval meeting with client'}
                    onChange={(e) => onTaskUpdate({ ...task, description: e.target.value })}
                    placeholder="Add a description..."
                    className="min-h-[80px] resize-none border-violet-200 bg-white focus-visible:ring-2 focus-visible:ring-violet-500 text-sm"
                  />
                </div>

                {/* Sub Tasks */}
                <div className="border border-indigo-100 rounded-lg p-4 bg-gradient-to-br from-white to-indigo-50/30 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-white" />
                      </div>
                      <label className="text-xs uppercase tracking-wide text-slate-600">
                        Sub Tasks
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={hideCompletedSubtasks ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setHideCompletedSubtasks(!hideCompletedSubtasks)}
                        className="h-7 px-2 text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {hideCompletedSubtasks ? 'Show' : 'Hide'} Completed
                      </Button>
                      <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all" 
                          style={{ width: `${subTasks.length > 0 ? (completedSubtasks / subTasks.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {completedSubtasks}/{subTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {subTasks.filter(st => !hideCompletedSubtasks || !st.completed).map((subTask) => {
                      const isExpanded = expandedSubtaskId === subTask.id;
                      const priorityColors = {
                        low: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200',
                        medium: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200',
                        high: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                      };
                      
                      return (
                        <div key={subTask.id} className="border border-slate-200 rounded-lg overflow-hidden hover:border-violet-300 transition-colors shadow-sm hover:shadow">
                          {/* Collapsed View */}
                          <div 
                            className="flex items-center gap-3 group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30 px-3 py-2.5 transition-all cursor-pointer"
                            onClick={() => setExpandedSubtaskId(isExpanded ? null : subTask.id)}
                          >
                            <Checkbox
                              checked={subTask.completed}
                              onCheckedChange={() => toggleSubTask(subTask.id)}
                              className="shrink-0 border-violet-300 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm ${subTask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                  {subTask.title}
                                </span>
                                {subTask.priority && (
                                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${priorityColors[subTask.priority]} shadow-sm`}>
                                    {subTask.priority === 'high' && '🔴'}
                                    {subTask.priority === 'medium' && '🟡'}
                                    {subTask.priority === 'low' && '🔵'}
                                    {' '}{subTask.priority}
                                  </Badge>
                                )}
                              </div>
                              {subTask.description && !isExpanded && (
                                <p className="text-xs text-slate-500 truncate mt-1">{subTask.description}</p>
                              )}
                            </div>
                            {subTask.owner && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
                                <Avatar className="w-6 h-6 ring-2 ring-violet-100">
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-[10px]">
                                    {subTask.owner.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">{subTask.owner}</span>
                              </div>
                            )}
                            <ChevronDown className={`w-4 h-4 text-violet-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Expanded View */}
                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-3 bg-gradient-to-br from-slate-50 to-violet-50/30 border-t border-violet-100">
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-600">Title</Label>
                                <Input
                                  value={subTask.title}
                                  onChange={(e) => updateSubTask(subTask.id, 'title', e.target.value)}
                                  className="text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs text-slate-600">Description</Label>
                                <Textarea
                                  value={subTask.description || ''}
                                  onChange={(e) => updateSubTask(subTask.id, 'description', e.target.value)}
                                  placeholder="Add a description..."
                                  className="text-sm resize-none"
                                  rows={2}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs text-slate-600">Priority</Label>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                      { value: 'low', color: { border: 'border-blue-200', bg: 'bg-blue-100/70', text: 'text-blue-700' } },
                                      { value: 'medium', color: { border: 'border-amber-200', bg: 'bg-amber-100/70', text: 'text-amber-700' } },
                                      { value: 'high', color: { border: 'border-red-200', bg: 'bg-red-100/70', text: 'text-red-700' } }
                                    ].map((priority) => {
                                      const isSelected = subTask.priority === priority.value;
                                      return (
                                        <button
                                          key={priority.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateSubTask(subTask.id, 'priority', priority.value);
                                          }}
                                          className={`h-7 rounded border transition-all flex items-center justify-center text-xs capitalize ${
                                            isSelected
                                              ? `${priority.color.border} ${priority.color.bg} ${priority.color.text}`
                                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                          }`}
                                        >
                                          {priority.value}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs text-slate-600">Owner</Label>
                                  <Select 
                                    value={subTask.owner || 'Unassigned'}
                                    onValueChange={(value) => updateSubTask(subTask.id, 'owner', value === 'Unassigned' ? undefined : value)}
                                  >
                                    <SelectTrigger className="h-8 text-sm" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center gap-1.5">
                                        {subTask.owner && (
                                          <Avatar className="w-4 h-4">
                                            <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                                              {subTask.owner.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                        )}
                                        <SelectValue placeholder="Unassigned" />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                                      <SelectItem value="John Smith">John Smith</SelectItem>
                                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                      <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                                      <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex justify-end pt-2 border-t border-slate-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSubTask(subTask.id);
                                  }}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Subtask
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a new subtask..."
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                      className="text-sm border-violet-200 bg-white focus-visible:ring-2 focus-visible:ring-violet-500"
                    />
                    <Button 
                      onClick={handleAddSubTask} 
                      variant="outline"
                      className="gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200 shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Comments */}
                <div className="border border-blue-100 rounded-lg p-4 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-xs uppercase tracking-wide text-slate-600">
                      Comments ({comments.length})
                    </label>
                  </div>

                  <div className="space-y-3 mb-4">
                    {comments.map((comment, index) => {
                      const isOwnComment = comment.author === 'You';
                      const isEditing = editingCommentId === comment.id;
                      const showEditDelete = index === 0; // Show edit/delete on first comment
                      
                      return (
                        <div key={comment.id} className="flex gap-3 group p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <Avatar className="w-9 h-9 shrink-0 ring-2 ring-blue-100">
                            <AvatarFallback className={comment.avatarColor}>
                              {comment.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-slate-400">{comment.timestamp}</span>
                              {isOwnComment && !isEditing && (
                                <div className={`ml-auto flex items-center gap-1 transition-opacity ${showEditDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditComment(comment.id)}
                                    className="h-7 w-7 p-0 hover:bg-slate-200"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCommentEdit();
                                    if (e.key === 'Escape') {
                                      setEditingCommentId(null);
                                      setEditingCommentText('');
                                    }
                                  }}
                                  autoFocus
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={handleSaveCommentEdit}
                                  className="h-7 px-2 bg-violet-600 hover:bg-violet-700"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText('');
                                  }}
                                  className="h-7 px-2"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Avatar className="w-9 h-9 shrink-0 ring-2 ring-yellow-100">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                        YO
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                        className="pr-12 border-blue-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                      <Button 
                        onClick={handleAddComment} 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <Collapsible open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
                  <div className="border border-purple-100 rounded-lg bg-gradient-to-br from-white to-purple-50/30 shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-xs uppercase tracking-wide text-slate-600 cursor-pointer">
                          Activity Log
                        </label>
                      </div>
                      {isActivityLogOpen ? (
                        <ChevronUp className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-purple-400" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="relative">
                          {/* Vertical timeline line */}
                          <div className="absolute left-[100px] top-0 bottom-0 w-px bg-slate-200" />
                          
                          <div className="space-y-0">
                            {groupedActivityLog.map((group, groupIndex) => (
                              <div key={group.date} className="relative">
                                {/* Date pill */}
                                <div className="relative flex items-center mb-5 mt-2">
                                  <div className="absolute left-0 right-0 h-px bg-slate-200" />
                                  <div className="relative mx-auto bg-white border border-slate-200 rounded-full px-4 py-1.5">
                                    <span className="text-xs text-slate-600">{group.date}</span>
                                  </div>
                                </div>

                                {/* Activity entries for this date */}
                                <div className="space-y-3 mb-6">
                                  {group.entries.map((entry, entryIndex) => {
                                    const [date, time] = entry.timestamp.split(' ', 2);
                                    const timeStr = time ? `${time.split(':')[0]}:${time.split(':')[1]} ${time.split(' ')[1] || ''}`.trim() : '';
                                    
                                    return (
                                      <div key={entry.id} className="relative flex items-start gap-4">
                                        {/* Timestamp on left */}
                                        <div className="w-[90px] text-right shrink-0">
                                          <div className="text-xs text-slate-400">{date}</div>
                                          <div className="text-xs text-slate-400">{timeStr}</div>
                                        </div>

                                        {/* Timeline dot */}
                                        <div className="relative shrink-0 mt-1">
                                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-2">
                                          <div className="flex items-start gap-2">
                                            <span className="text-sm text-slate-900">{entry.user}:</span>
                                            <span className="text-sm text-slate-500 flex-1">{entry.details || entry.action}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - 30% */}
          <div className="w-[30%]">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {/* Task Context - Client & Workflow */}
                <div className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-white to-slate-50 shadow-sm space-y-4">
                  {/* Client Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <label className="text-xs uppercase tracking-wide text-slate-600">
                        Client
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="px-1.5 py-0.5 rounded text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>Contact</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-3 max-w-xs bg-white border border-slate-200 shadow-lg">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-slate-900">(555) 123-4567</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-slate-900">contact@acmecorp.com</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Client Folder Link */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.success('Opening client folder...');
                          // In a real app, this would navigate to the client folder
                        }}
                        className="ml-auto gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-auto py-1 px-2"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span className="text-xs">View Folder</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <Select 
                      value={project?.clientName || 'Acme Corporation'}
                      onValueChange={(value) => {
                        // Handle client change
                        toast.success('Client updated');
                      }}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Acme Corporation">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>Acme Corporation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TechStart Inc">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>TechStart Inc</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Global Industries">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>Global Industries</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="John Anderson">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-emerald-600" />
                            <span>John Anderson</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Maria Rodriguez">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-emerald-600" />
                            <span>Maria Rodriguez</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="David Kim">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-emerald-600" />
                            <span>David Kim</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Workflow */}
                  {workflow && (
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-500 mb-2 block">
                        Workflow
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50">
                        <span>{workflow.icon}</span>
                        <span className="text-sm flex-1">{workflow.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Task List */}
                  {taskLists && taskLists.length > 0 && (
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-500 mb-2 block">
                        List
                      </label>
                      <Select 
                        value={currentListId || 'inbox'} 
                        onValueChange={(value) => {
                          if (onListChange && task) {
                            onListChange(task.id, value);
                            toast.success('Task moved to list');
                          }
                        }}
                      >
                        <SelectTrigger className="border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taskLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${list.color}`} />
                                <span>{list.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Task Properties */}
                <div className="border border-emerald-100 rounded-lg p-4 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm space-y-4">
                  {/* Status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" />
                        <label className="text-xs uppercase tracking-wide text-slate-600">
                          Status
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusManageDialogOpen(true)}
                        className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                    <Select value={task.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-orange-600" />
                        <label className="text-xs uppercase tracking-wide text-slate-600">
                          Priority
                        </label>
                      </div>
                      {task.priority && (
                        <button
                          type="button"
                          onClick={() => {
                            onTaskUpdate({
                              ...task,
                              priority: undefined
                            });
                            toast.success('Priority cleared');
                          }}
                          className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low', color: { border: 'border-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' } },
                        { value: 'medium', color: { border: 'border-amber-500', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' } },
                        { value: 'high', color: { border: 'border-red-500', bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700' } }
                      ].map((priority) => {
                        const isSelected = task.priority === priority.value;
                        return (
                          <button
                            key={priority.value}
                            type="button"
                            onClick={() => {
                              const newPriority = isSelected ? undefined : (priority.value as ProjectTask['priority']);
                              onTaskUpdate({
                                ...task,
                                priority: newPriority
                              });
                              toast.success(isSelected ? 'Priority cleared' : 'Priority updated');
                            }}
                            className={`h-12 rounded-full border-2 transition-all flex items-center justify-center text-sm capitalize ${
                              isSelected
                                ? `${priority.color.border} ${priority.color.light} ${priority.color.text}`
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            {priority.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time Tracked */}
                <div className="border border-violet-100 rounded-lg p-4 bg-gradient-to-br from-white to-violet-50/30 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-violet-600" />
                      <label className="text-xs uppercase tracking-wide text-slate-600">
                        Time Tracked
                      </label>
                    </div>
                    <button
                      onClick={() => setTimeTrackingDetailOpen(true)}
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg hover:border-violet-300 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex-1">
                        <div className="text-2xl font-mono text-violet-700">
                          {(() => {
                            const totalSeconds = task.timeTracked || 0;
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            
                            if (hours > 0) {
                              return `${hours}h ${minutes}m`;
                            } else if (minutes > 0) {
                              return `${minutes}m`;
                            } else {
                              return '0m';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-violet-600 mt-0.5">
                          Total time tracked · Click for details
                        </div>
                      </div>
                      {task.timeTracked && task.timeTracked > 0 && (
                        <div className="text-xs text-slate-500 text-right">
                          {Math.floor((task.timeTracked || 0) / 60)} minutes total
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="border border-orange-100 rounded-lg p-4 bg-gradient-to-br from-white to-orange-50/30 shadow-sm space-y-4">
                  {/* Due Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <label className="text-xs uppercase tracking-wide text-slate-600">
                        Due Date
                      </label>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left border-slate-200 hover:bg-slate-50 h-10"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                          <span className={dueDate ? "text-slate-900" : "text-slate-400"}>
                            {dueDate ? safeFormatDate(dueDate, 'MMM dd, yyyy') : 'Select due date'}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => {
                            setDueDate(date);
                            if (date) {
                              onTaskUpdate({ ...task, dueDate: safeFormatDate(date, 'yyyy-MM-dd') });
                              toast.success('Due date updated');
                            }
                          }}
                          initialFocus
                          className="rounded-md border shadow-lg"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Recurring Task */}
                  <div className="border border-slate-200 rounded-lg bg-white">
                    <div 
                      className="flex items-center justify-between p-4 pb-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg"
                      onClick={() => {
                        const newValue = !isRecurring;
                        setIsRecurring(newValue);
                        if (!newValue) {
                          setShowAdvancedRecurrence(false);
                        }
                        onTaskUpdate({ 
                          ...task, 
                          isRecurring: newValue,
                          recurrencePattern: newValue ? recurrencePattern : undefined,
                          recurrenceInterval: newValue ? recurrenceInterval : undefined,
                          recurrenceBaseDate: newValue ? recurrenceBaseDate : undefined,
                          recurrenceStartDate: newValue ? recurrenceStartDate?.toISOString() : undefined,
                          recurrenceEndDate: newValue ? recurrenceEndDate?.toISOString() : undefined
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="recurring" 
                          checked={isRecurring}
                          onCheckedChange={(checked) => {
                            // Handled by parent div onClick
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label 
                          htmlFor="recurring" 
                          className="text-sm text-slate-700 cursor-pointer flex items-center gap-2 font-medium pointer-events-none"
                        >
                          <Repeat className="w-4 h-4 text-orange-600" />
                          Repeat this task
                        </label>
                      </div>
                      
                      {isRecurring && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAdvancedRecurrence(!showAdvancedRecurrence);
                          }}
                          className="h-7 text-xs text-violet-600 hover:text-violet-700"
                        >
                          {showAdvancedRecurrence ? 'Basic' : 'Advanced'}
                        </Button>
                      )}
                    </div>
                    
                    {isRecurring && !showAdvancedRecurrence && (
                      <div className="space-y-3 ml-6">
                        {/* Quick Options */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'daily', label: 'Daily', interval: 1 },
                            { value: 'weekdays', label: 'Weekdays', interval: 1 },
                            { value: 'weekly', label: 'Weekly', interval: 1 },
                            { value: 'monthly', label: 'Monthly', interval: 1 },
                            { value: 'yearly', label: 'Yearly', interval: 1 }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setRecurrencePattern(option.value as any);
                                setRecurrenceInterval(option.interval);
                                onTaskUpdate({ 
                                  ...task, 
                                  recurrencePattern: option.value as any,
                                  recurrenceInterval: option.interval,
                                  isRecurring: true
                                });
                              }}
                              className={`px-3 py-2 text-sm rounded-md border transition-all ${
                                recurrencePattern === option.value && recurrenceInterval === option.interval
                                  ? 'bg-violet-50 border-violet-300 text-violet-700 font-medium'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setRecurrencePattern('custom');
                              setShowAdvancedRecurrence(true);
                            }}
                            className="px-3 py-2 text-sm rounded-md border bg-white border-slate-200 text-slate-600 hover:border-slate-300 transition-all"
                          >
                            Custom...
                          </button>
                        </div>
                        
                        {/* Summary for Basic View */}
                        {recurrencePattern && recurrencePattern !== 'custom' && (
                          <div className="pt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg mt-3">
                            <div className="flex items-start gap-2">
                              <Repeat className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-slate-900 font-medium mb-1">
                                  {(() => {
                                    // Completion-based recurrence
                                    if (recurrenceBaseDate === 'completed') {
                                      if (recurrencePattern === 'weekdays') {
                                        return 'Repeats 1 weekday after completion';
                                      } else if (recurrencePattern === 'weekly') {
                                        return 'Repeats 1 week after completion';
                                      } else if (recurrencePattern === 'monthly') {
                                        return 'Repeats 1 month after completion';
                                      } else if (recurrencePattern === 'yearly') {
                                        return 'Repeats 1 year after completion';
                                      } else if (recurrencePattern === 'daily') {
                                        return 'Repeats 1 day after completion';
                                      }
                                      return 'Repeats after completion';
                                    }
                                    
                                    // Schedule-based recurrence
                                    const baseDate = dueDate || new Date();
                                    const dayName = safeFormatDate(baseDate, 'EEEE');
                                    const monthDay = safeFormatDate(baseDate, 'do');
                                    
                                    if (recurrencePattern === 'weekdays') {
                                      return 'Repeats every weekday (Monday-Friday)';
                                    } else if (recurrencePattern === 'weekly') {
                                      return `Repeats on ${dayName} every week`;
                                    } else if (recurrencePattern === 'monthly') {
                                      return `Repeats on the ${monthDay} every month`;
                                    } else if (recurrencePattern === 'yearly') {
                                      const monthName = safeFormatDate(baseDate, 'MMMM');
                                      return `Repeats on ${monthName} ${monthDay} every year`;
                                    } else if (recurrencePattern === 'daily') {
                                      return 'Repeats every day';
                                    }
                                    return 'Repeats';
                                  })()}
                                </p>
                                <div className="space-y-1">
                                  {recurrenceBaseDate === 'completed' && (
                                    <p className="text-xs text-slate-600">
                                      • Example: Complete on Jan 15 → next task due Feb 15
                                    </p>
                                  )}
                                  {recurrenceStartDate && (
                                    <p className="text-xs text-slate-600">
                                      • Starts {safeFormatDate(recurrenceStartDate, 'MMM dd, yyyy')}
                                    </p>
                                  )}
                                  {recurrenceEndDate && (
                                    <p className="text-xs text-slate-600">
                                      • Ends {safeFormatDate(recurrenceEndDate, 'MMM dd, yyyy')}
                                    </p>
                                  )}
                                  {!recurrenceEndDate && (
                                    <p className="text-xs text-slate-600">
                                      • No end date (repeats indefinitely)
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isRecurring && showAdvancedRecurrence && (
                      <div className="space-y-4 ml-6">
                        {/* Custom Interval */}
                        <div>
                          <Label className="text-xs text-slate-600 mb-2 block">Repeat every</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={recurrenceInterval}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                setRecurrenceInterval(value);
                                onTaskUpdate({ 
                                  ...task, 
                                  recurrenceInterval: value,
                                  isRecurring: true,
                                  recurrencePattern: recurrencePattern
                                });
                              }}
                              className="w-20 h-9 border-slate-200"
                            />
                            <Select 
                              value={recurrencePattern === 'custom' ? 'daily' : recurrencePattern} 
                              onValueChange={(value: any) => {
                                setRecurrencePattern(value);
                                onTaskUpdate({ 
                                  ...task, 
                                  recurrencePattern: value,
                                  isRecurring: true,
                                  recurrenceInterval: recurrenceInterval
                                });
                              }}
                            >
                              <SelectTrigger className="flex-1 h-9 border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">{recurrenceInterval === 1 ? 'Day' : 'Days'}</SelectItem>
                                <SelectItem value="weekly">{recurrenceInterval === 1 ? 'Week' : 'Weeks'}</SelectItem>
                                <SelectItem value="weekdays">Weekdays</SelectItem>
                                <SelectItem value="monthly">{recurrenceInterval === 1 ? 'Month' : 'Months'}</SelectItem>
                                <SelectItem value="yearly">{recurrenceInterval === 1 ? 'Year' : 'Years'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Day of Week Selector (for weekly) */}
                        {recurrencePattern === 'weekly' && recurrenceBaseDate !== 'completed' && (
                          <div>
                            <Label className="text-xs text-slate-600 mb-2 block">Repeat on</Label>
                            <div className="grid grid-cols-7 gap-1">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                                const isSelected = recurrenceWeekDays.includes(index);
                                const fullDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                return (
                                  <button
                                    key={index}
                                    type="button"
                                    title={fullDayNames[index]}
                                    onClick={() => {
                                      const newDays = isSelected 
                                        ? recurrenceWeekDays.filter(d => d !== index)
                                        : [...recurrenceWeekDays, index].sort();
                                      setRecurrenceWeekDays(newDays);
                                      onTaskUpdate({ 
                                        ...task, 
                                        recurrenceWeekDays: newDays,
                                        isRecurring: true
                                      });
                                    }}
                                    className={`h-9 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                                      isSelected
                                        ? 'bg-violet-600 text-white border-2 border-violet-600'
                                        : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {recurrenceWeekDays.length === 0 
                                ? 'Select at least one day' 
                                : `Selected: ${recurrenceWeekDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                              }
                            </p>
                          </div>
                        )}
                        
                        {/* Day of Month Selector (for monthly) */}
                        {recurrencePattern === 'monthly' && recurrenceBaseDate !== 'completed' && (
                          <div>
                            <Label className="text-xs text-slate-600 mb-2 block">Repeat on day</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="31"
                                value={recurrenceDayOfMonth || (dueDate ? dueDate.getDate() : 1)}
                                onChange={(e) => {
                                  const value = Math.max(1, Math.min(31, parseInt(e.target.value) || 1));
                                  setRecurrenceDayOfMonth(value);
                                  onTaskUpdate({ 
                                    ...task, 
                                    recurrenceDayOfMonth: value,
                                    isRecurring: true
                                  });
                                }}
                                className="w-20 h-9 border-slate-200"
                              />
                              <span className="text-sm text-slate-600">of the month</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Will repeat on the {recurrenceDayOfMonth || (dueDate ? dueDate.getDate() : 1)}
                              {(() => {
                                const day = recurrenceDayOfMonth || (dueDate ? dueDate.getDate() : 1);
                                if (day === 1 || day === 21 || day === 31) return 'st';
                                if (day === 2 || day === 22) return 'nd';
                                if (day === 3 || day === 23) return 'rd';
                                return 'th';
                              })()} of each month
                            </p>
                          </div>
                        )}
                        
                        {/* Base on Completion Toggle */}
                        <div className="border-t border-slate-200 pt-4">
                          <div
                            onClick={() => {
                              const newValue = recurrenceBaseDate === 'completed' ? 'scheduled' : 'completed';
                              setRecurrenceBaseDate(newValue);
                              onTaskUpdate({ 
                                ...task, 
                                recurrenceBaseDate: newValue,
                                isRecurring: true
                              });
                            }}
                            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              recurrenceBaseDate === 'completed'
                                ? 'border-violet-300 bg-violet-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <Checkbox
                              checked={recurrenceBaseDate === 'completed'}
                              onCheckedChange={() => {}}
                              className="mt-0.5 pointer-events-none"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">Base on completion date</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Next task created based on when you complete it (instead of scheduled date)
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Start Date */}
                        <div>
                          <Label className="text-xs text-slate-600 mb-2 block">Start date (optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left border-slate-200 hover:bg-slate-50 h-9"
                              >
                                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                <span className={recurrenceStartDate ? "text-slate-900" : "text-slate-400"}>
                                  {recurrenceStartDate ? safeFormatDate(recurrenceStartDate, 'MMM dd, yyyy') : 'No start date'}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={recurrenceStartDate}
                                onSelect={(date) => {
                                  setRecurrenceStartDate(date);
                                  onTaskUpdate({ 
                                    ...task, 
                                    recurrenceStartDate: date?.toISOString(),
                                    isRecurring: true
                                  });
                                }}
                                className="rounded-md border shadow-lg"
                              />
                            </PopoverContent>
                          </Popover>
                          {recurrenceStartDate && (
                            <button
                              onClick={() => {
                                setRecurrenceStartDate(undefined);
                                onTaskUpdate({ ...task, recurrenceStartDate: undefined });
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 mt-1 ml-1"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        
                        {/* End Date */}
                        <div>
                          <Label className="text-xs text-slate-600 mb-2 block">End date (optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left border-slate-200 hover:bg-slate-50 h-9"
                              >
                                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                <span className={recurrenceEndDate ? "text-slate-900" : "text-slate-400"}>
                                  {recurrenceEndDate ? safeFormatDate(recurrenceEndDate, 'MMM dd, yyyy') : 'Never ends'}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={recurrenceEndDate}
                                onSelect={(date) => {
                                  setRecurrenceEndDate(date);
                                  onTaskUpdate({ 
                                    ...task, 
                                    recurrenceEndDate: date?.toISOString(),
                                    isRecurring: true
                                  });
                                }}
                                disabled={(date) => recurrenceStartDate ? date < recurrenceStartDate : false}
                                className="rounded-md border shadow-lg"
                              />
                            </PopoverContent>
                          </Popover>
                          {recurrenceEndDate && (
                            <button
                              onClick={() => {
                                setRecurrenceEndDate(undefined);
                                onTaskUpdate({ ...task, recurrenceEndDate: undefined });
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 mt-1 ml-1"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        
                        {/* Summary */}
                        <div className="pt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                          <div className="flex items-start gap-2">
                            <Repeat className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 font-medium mb-1">
                                {(() => {
                                  // Completion-based recurrence
                                  if (recurrenceBaseDate === 'completed') {
                                    if (recurrencePattern === 'weekdays') {
                                      return `Repeats ${recurrenceInterval === 1 ? '1 weekday' : `${recurrenceInterval} weekdays`} after completion`;
                                    } else if (recurrencePattern === 'weekly') {
                                      return `Repeats ${recurrenceInterval === 1 ? '1 week' : `${recurrenceInterval} weeks`} after completion`;
                                    } else if (recurrencePattern === 'monthly') {
                                      return `Repeats ${recurrenceInterval === 1 ? '1 month' : `${recurrenceInterval} months`} after completion`;
                                    } else if (recurrencePattern === 'yearly') {
                                      return `Repeats ${recurrenceInterval === 1 ? '1 year' : `${recurrenceInterval} years`} after completion`;
                                    } else if (recurrencePattern === 'daily') {
                                      return `Repeats ${recurrenceInterval === 1 ? '1 day' : `${recurrenceInterval} days`} after completion`;
                                    }
                                    return 'Repeats after completion';
                                  }
                                  
                                  // Schedule-based recurrence
                                  const baseDate = dueDate || new Date();
                                  const dayName = safeFormatDate(baseDate, 'EEEE');
                                  const monthDay = safeFormatDate(baseDate, 'do');
                                  
                                  if (recurrencePattern === 'weekdays') {
                                    return 'Repeats every weekday (Monday-Friday)';
                                  } else if (recurrencePattern === 'weekly') {
                                    if (recurrenceWeekDays.length > 0) {
                                      const dayNames = recurrenceWeekDays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]);
                                      const daysText = dayNames.length === 1 ? dayNames[0] : 
                                        dayNames.length === 2 ? dayNames.join(' and ') :
                                        dayNames.slice(0, -1).join(', ') + ', and ' + dayNames[dayNames.length - 1];
                                      return `Repeats on ${daysText}${recurrenceInterval > 1 ? ` every ${recurrenceInterval} weeks` : ' every week'}`;
                                    }
                                    return `Repeats on ${dayName}${recurrenceInterval > 1 ? ` every ${recurrenceInterval} weeks` : ' every week'}`;
                                  } else if (recurrencePattern === 'monthly') {
                                    const day = recurrenceDayOfMonth || (dueDate ? dueDate.getDate() : 1);
                                    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                                                   day === 2 || day === 22 ? 'nd' :
                                                   day === 3 || day === 23 ? 'rd' : 'th';
                                    return `Repeats on the ${day}${suffix}${recurrenceInterval > 1 ? ` every ${recurrenceInterval} months` : ' every month'}`;
                                  } else if (recurrencePattern === 'yearly') {
                                    const monthName = safeFormatDate(baseDate, 'MMMM');
                                    const day = recurrenceDayOfMonth || (dueDate ? dueDate.getDate() : 1);
                                    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                                                   day === 2 || day === 22 ? 'nd' :
                                                   day === 3 || day === 23 ? 'rd' : 'th';
                                    return `Repeats on ${monthName} ${day}${suffix}${recurrenceInterval > 1 ? ` every ${recurrenceInterval} years` : ' every year'}`;
                                  } else if (recurrencePattern === 'daily') {
                                    return `Repeats ${recurrenceInterval === 1 ? 'every day' : `every ${recurrenceInterval} days`}`;
                                  }
                                  return 'Repeats';
                                })()}
                              </p>
                              <div className="space-y-1">
                                {recurrenceBaseDate === 'completed' && (
                                  <p className="text-xs text-slate-600">
                                    • Example: Complete on Jan 15 → next task due Feb 15
                                  </p>
                                )}
                                {recurrenceStartDate && (
                                  <p className="text-xs text-slate-600">
                                    • Starts {safeFormatDate(recurrenceStartDate, 'MMM dd, yyyy')}
                                  </p>
                                )}
                                {recurrenceEndDate && (
                                  <p className="text-xs text-slate-600">
                                    • Ends {safeFormatDate(recurrenceEndDate, 'MMM dd, yyyy')}
                                  </p>
                                )}
                                {!recurrenceEndDate && (
                                  <p className="text-xs text-slate-600">
                                    • No end date (repeats indefinitely)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <label className="text-xs uppercase tracking-wide text-slate-600">
                        Created
                      </label>
                    </div>
                    <div className="px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
                      {task.createdAt ? safeFormatDate(task.createdAt, 'MMM dd, yyyy h:mm a') : '—'}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <label className="text-xs uppercase tracking-wide text-slate-500 mb-3 block">
                    Attachments
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
                      isDragging 
                        ? 'border-violet-400 bg-violet-50' 
                        : 'border-slate-200 bg-slate-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 mb-1">
                      Drag and drop files to upload!
                    </p>
                    <p className="text-xs text-slate-400 mb-2">or</p>
                    <Button 
                      variant="link" 
                      onClick={handleFileSelect}
                      className="gap-2 text-slate-600 h-auto p-0 text-xs"
                    >
                      <Paperclip className="w-3 h-3" />
                      Choose Files
                    </Button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100"
                        >
                          <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-900 truncate">{attachment.name}</p>
                            <p className="text-xs text-slate-400">
                              {attachment.size}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      {/* Status Management Dialog */}
      <Dialog open={statusManageDialogOpen} onOpenChange={setStatusManageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Manage Statuses</DialogTitle>
          <DialogDescription>
            Add, edit, delete, and reorder your custom status options.
          </DialogDescription>
          
          <div className="space-y-3 py-4">
            {statusOptions.map((status, index) => (
              <div 
                key={status.value} 
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              >
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <Input
                  value={status.label}
                  onChange={(e) => {
                    const newOptions = [...statusOptions];
                    newOptions[index].label = e.target.value;
                    setStatusOptions(newOptions);
                  }}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (statusOptions.length > 1) {
                      setStatusOptions(statusOptions.filter((_, i) => i !== index));
                      toast.success('Status deleted');
                    } else {
                      toast.error('At least one status is required');
                    }
                  }}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newStatus = {
                value: `status-${Date.now()}`,
                label: 'New Status',
                color: 'bg-slate-500'
              };
              setStatusOptions([...statusOptions, newStatus]);
              toast.success('Status added');
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Status
          </Button>
        </DialogContent>
      </Dialog>

      {/* Incomplete Subtasks Warning Dialog */}
      <AlertDialog open={showIncompleteSubtasksDialog} onOpenChange={setShowIncompleteSubtasksDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete task with pending subtasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This task has {subTasks.filter(st => !st.completed).length} incomplete subtask{subTasks.filter(st => !st.completed).length > 1 ? 's' : ''}:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <ul className="space-y-2">
              {subTasks.filter(st => !st.completed).map((subtask) => (
                <li key={subtask.id} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-slate-700">{subtask.title}</div>
                    {subtask.owner && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Owner: {subtask.owner}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <AlertDialogDescription className="text-sm text-slate-600">
            Are you sure you want to mark this task as completed?
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowIncompleteSubtasksDialog(false);
              setPendingStatus(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCompleteWithPendingSubtasks}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Complete Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Tracking Detail Dialog */}
      <TimeTrackingDetailDialog
        task={task}
        open={timeTrackingDetailOpen}
        onOpenChange={setTimeTrackingDetailOpen}
      />
    </Dialog>
  );
}
