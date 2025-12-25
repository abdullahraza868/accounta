// All Tasks View with Task Lists, Time-based Filters, and Drag & Drop
import { useState, useEffect, Fragment, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { useWorkflowContext, ProjectTask } from './WorkflowContext';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  X, 
  Flag, 
  MessageSquare,
  Plus,
  Download,
  Calendar as CalendarIcon,
  List,
  Edit2,
  Trash2,
  MoreVertical,
  Folder,
  Users,
  User,
  Building2,
  UserCircle,
  Minus,
  GripVertical,
  ArrowRightLeft,
  Paperclip,
  ListTodo,
  ChevronUp,
  ChevronDown,
  Keyboard,
  Settings,
  Play,
  Square,
  ArrowDown,
  LayoutList,
  LayoutGrid,
  Tag,
  Mail,
  Repeat,
  Phone,
  Inbox,
  FolderKanban,
  Check,
  Shield
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { TaskDetailDialog } from './TaskDetailDialog';
import { TaskFilterPanel } from './TaskFilterPanel';
import { FloatingTimerWidget } from './FloatingTimerWidget';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from './ui/utils';

// Mock clients with type information
const mockClients = [
  { name: 'Acme Corp', type: 'business' as const, email: 'contact@acmecorp.com', phone: '(555) 123-4567' },
  { name: 'TechStart LLC', type: 'business' as const, email: 'info@techstart.com', phone: '(555) 234-5678' },
  { name: 'Global Industries', type: 'business' as const, email: 'hello@globalind.com', phone: '(555) 345-6789' },
  { name: 'Startup XYZ', type: 'business' as const, email: 'team@startupxyz.com', phone: '(555) 456-7890' },
  { name: 'Enterprise Co', type: 'business' as const, email: 'support@enterpriseco.com', phone: '(555) 567-8901' },
  { name: 'John Anderson', type: 'individual' as const, email: 'j.anderson@email.com', phone: '(555) 678-9012' },
  { name: 'Sarah Mitchell', type: 'individual' as const, email: 's.mitchell@email.com', phone: '(555) 789-0123' },
  { name: 'David Chen', type: 'individual' as const, email: 'd.chen@email.com', phone: '(555) 890-1234' },
  { name: 'Emily Rodriguez', type: 'individual' as const, email: 'e.rodriguez@email.com', phone: '(555) 901-2345' },
  { name: 'Michael Thompson', type: 'individual' as const, email: 'm.thompson@email.com', phone: '(555) 012-3456' },
];

// Color options for task lists
const colorOptions = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-slate-500',
  'bg-orange-500',
];

interface TaskList {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  sharedWith?: string[];
}

// Email type definition
type Email = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
    clientType?: 'Individual' | 'Business';
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  flagged: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  isSecure: boolean;
  isFirmEmail?: boolean;
  thread?: Email[];
  projectIds?: string[];
  clientId?: string;
  clientName?: string;
  scheduledFor?: string;
  status?: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedLinks?: Array<{
    url: string;
    clickedAt: string;
  }>;
};

// Mock email data
const mockEmails: Email[] = [
  {
    id: '1',
    from: { name: 'Gokhan Troy', email: 'gokhan@troy.com', avatar: 'GT', clientType: 'Business' },
    to: ['sarah@firm.com'],
    subject: 'Q4 Tax Documents Ready for Review',
    body: `Hi Sarah,

I hope this email finds you well. I wanted to let you know that I've uploaded all the Q4 tax documents to the portal as requested.

The documents include:
- Income statements
- Expense reports
- Quarterly revenue breakdown

Please let me know if you need anything else or if you have any questions.

Best regards,
Gokhan`,
    date: new Date().toISOString(),
    read: false,
    starred: false,
    flagged: true,
    hasAttachments: true,
    attachments: [
      { id: '1', name: 'Q4-Income-Statement.pdf', size: 245000, type: 'application/pdf' },
      { id: '2', name: 'Q4-Expenses.xlsx', size: 89000, type: 'application/vnd.ms-excel' }
    ],
    isSecure: false,
    clientId: '1',
    clientName: 'Troy Business Services LLC',
    status: 'delivered',
    deliveredAt: new Date().toISOString()
  },
  {
    id: '2',
    from: { name: 'Sarah Johnson', email: 'sarah@firm.com', avatar: 'SJ', clientType: 'Individual' },
    to: ['jamal@bestface.com'],
    subject: 'Year-End Financial Review Meeting Confirmation',
    body: `Hi Jamal,

This is to confirm our year-end financial review meeting scheduled for next week.

Meeting Details:
- Date: December 20, 2025
- Time: 2:00 PM EST
- Duration: 1.5 hours
- Location: Virtual (Google Meet link will be sent)

Please review the attached agenda before our meeting.

Looking forward to our discussion!

Best,
Sarah`,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: true,
    flagged: false,
    hasAttachments: true,
    attachments: [
      { id: '3', name: 'Meeting-Agenda.pdf', size: 125000, type: 'application/pdf' }
    ],
    isSecure: false,
    clientId: '3',
    clientName: 'Best Face Forward',
    status: 'opened',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    clickedLinks: [
      {
        url: 'https://meet.google.com/abc-defg-hij',
        clickedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '3',
    from: { name: 'Mike Chen', email: 'mike@firm.com', avatar: 'MC', clientType: 'Individual' },
    to: ['john@smithfamily.com'],
    subject: '2024 Tax Return - Sensitive Information',
    body: `Dear John and Mary,

I'm pleased to inform you that your 2024 tax return has been completed. Due to the sensitive nature of this information, I've sent this as a secure email.

The attached PDF includes:
- Complete 2024 Federal Tax Return
- State Tax Return
- Supporting documentation
- Summary of deductions and credits

You'll need to verify your identity to download the attachments. Please review everything and let me know if you have any questions.

Best regards,
Mike Chen, CPA`,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    flagged: false,
    hasAttachments: true,
    attachments: [
      { id: '4', name: '2024-Tax-Return.pdf', size: 1200000, type: 'application/pdf' }
    ],
    isSecure: true,
    clientId: '11',
    clientName: 'John & Mary Smith',
    status: 'delivered',
    deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
];

interface AllTasksViewProps {
  initialWorkflowFilter?: string;
}

// Drag and drop types
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
        ${isExpanded ? 'bg-gradient-to-r from-violet-50/50 to-indigo-50/50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-200 dark:border-violet-700 shadow-sm' : 'border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800'}
        ${isSelected ? 'bg-violet-50 dark:bg-violet-900/30' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'border-t-4 border-t-violet-500' : ''}
        ${isTimerActive ? 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 border-l-4 border-l-violet-600 shadow-md ring-2 ring-violet-200 dark:ring-violet-700 ring-opacity-50' : ''}
        ${isCompleted && !isTimerActive && !isSelected ? `bg-slate-50 dark:bg-gray-800/50 ${completedOpacity}` : ''}
      `}
      onDragStart={onDragStart}
    >
      {children}
    </div>
  );
}

// Droppable list item component
function DroppableListItem({ 
  list, 
  children,
  onTaskDrop,
  isSelected
}: { 
  list: TaskList; 
  children: React.ReactNode;
  onTaskDrop: (taskId: string, listId: string) => void;
  isSelected: boolean;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { taskIds: string[] }) => {
      item.taskIds.forEach(taskId => onTaskDrop(taskId, list.id));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [list.id]);

  return (
    <div
      ref={drop}
      className={`
        ${isOver ? 'ring-2 ring-violet-400 ring-offset-2 rounded-lg' : ''}
      `}
    >
      {children}
    </div>
  );
}

function AllTasksViewContent({ initialWorkflowFilter }: AllTasksViewProps = {}) {
  const { tasks, projects, updateTask, addTask, deleteTask, activeTimer, startTimer, stopTimer, getTimerElapsed } = useWorkflowContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all');
  const [selectedList, setSelectedList] = useState<string>('inbox'); // Default to inbox
  const [hideCompleted, setHideCompleted] = useState(true);
  const [completedDisplayMode, setCompletedDisplayMode] = useState<'hide' | 'inline' | 'only'>('hide');
  
  // New state for managing new task flow
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const [showComprehensiveNewTask, setShowComprehensiveNewTask] = useState(false);
  
  // Timer confirmation dialog
  const [showTimerConfirmation, setShowTimerConfirmation] = useState(false);
  const [pendingTimerTask, setPendingTimerTask] = useState<ProjectTask | null>(null);
  
  // Visual filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Email viewer modal state
  const [showEmailViewer, setShowEmailViewer] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  // Separate tracking for included and excluded items
  const [includedAssignees, setIncludedAssignees] = useState<string[]>([]);
  const [excludedAssignees, setExcludedAssignees] = useState<string[]>([]);
  const [includedClients, setIncludedClients] = useState<string[]>([]);
  const [excludedClients, setExcludedClients] = useState<string[]>([]);
  const [includedStatuses, setIncludedStatuses] = useState<string[]>([]);
  const [excludedStatuses, setExcludedStatuses] = useState<string[]>([]);
  const [includedPriorities, setIncludedPriorities] = useState<string[]>([]);
  const [excludedPriorities, setExcludedPriorities] = useState<string[]>([]);
  const [includedTaskListFilters, setIncludedTaskListFilters] = useState<string[]>([]);
  const [excludedTaskListFilters, setExcludedTaskListFilters] = useState<string[]>([]);
  
  // Current mode for adding new filters (doesn't affect existing filters)
  const [assigneeMode, setAssigneeMode] = useState<'include' | 'exclude'>('include');
  const [clientMode, setClientMode] = useState<'include' | 'exclude'>('include');
  const [statusMode, setStatusMode] = useState<'include' | 'exclude'>('include');
  const [priorityMode, setPriorityMode] = useState<'include' | 'exclude'>('include');
  const [taskListFilterMode, setTaskListFilterMode] = useState<'include' | 'exclude'>('include');
  
  // Task Lists management with sharing - with task list associations
  const [taskListAssignments, setTaskListAssignments] = useState<Record<string, string>>({
    // taskId: listId mapping - pre-assign some tasks for testing
    'task-1': 'inbox',
    'task-2': 'callback',
    'task-3': 'list-2',
    'task-4': 'list-3',
    'task-5': 'inbox',
    'task-7': 'list-1',
    'task-9': 'callback',
    'task-10': 'list-2',
    'task-11': 'list-3',
    'task-12': 'list-1',
    'task-14': 'inbox',
    'task-15': 'list-2',
    'task-16': 'callback',
    'task-18': 'list-3',
    'task-19': 'list-2',
    // Email tasks
    'email-task-1': 'email-tasks',
    'email-task-2': 'email-tasks',
    'email-task-3': 'email-tasks',
    'email-task-4': 'email-tasks',
    // Recurring tasks
    'recurring-task-1': 'recurring-tasks',
    'recurring-task-2': 'recurring-tasks',
    'recurring-task-3': 'recurring-tasks',
    'recurring-task-4': 'recurring-tasks',
    'recurring-task-5': 'recurring-tasks'
  });
  
  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // Expanded tasks for subtasks
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  const [taskLists, setTaskLists] = useState<TaskList[]>([
    { id: 'inbox', name: 'Inbox', color: 'bg-slate-500', taskCount: 0, sharedWith: ['JD', 'SM', 'AK'] },
    { id: 'callback', name: 'Callback', color: 'bg-amber-500', taskCount: 0, sharedWith: ['JD', 'TC'] },
    { id: 'email-tasks', name: 'Email Tasks', color: 'bg-cyan-500', taskCount: 0, sharedWith: ['JD', 'SM'] },
    { id: 'recurring-tasks', name: 'Recurring Tasks', color: 'bg-indigo-500', taskCount: 0, sharedWith: ['JD'] },
    { id: 'list-1', name: 'My Tasks', color: 'bg-violet-500', taskCount: 0, sharedWith: ['JD'] },
    { id: 'list-2', name: 'Team Tasks', color: 'bg-blue-500', taskCount: 0, sharedWith: ['JD', 'SM', 'AK', 'TC'] },
    { id: 'list-3', name: 'Client Work', color: 'bg-emerald-500', taskCount: 0, sharedWith: ['JD', 'SM'] },
  ]);
  const [showListDialog, setShowListDialog] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [listName, setListName] = useState('');
  const [listColor, setListColor] = useState('bg-violet-500');
  const [customColorHex, setCustomColorHex] = useState('#8b5cf6');
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [newListSharedWith, setNewListSharedWith] = useState<string[]>([]); // Sharing during creation
  const [showSharingSection, setShowSharingSection] = useState(false); // Toggle for sharing section
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showShortcutsLearningMode, setShowShortcutsLearningMode] = useState(false);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'assignee' | 'task' | 'list' | 'client' | 'status' | 'priority' | 'dueDate' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const currentUserId = 'JD'; // Current logged-in user
  
  // Task order state - tracks custom order within each list
  const [taskOrder, setTaskOrder] = useState<Record<string, number>>({});
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharingList, setSharingList] = useState<TaskList | null>(null);

  // Status management
  const [showStatusManageDialog, setShowStatusManageDialog] = useState(false);
  const [customStatuses, setCustomStatuses] = useState<string[]>(['Open', 'Review', 'Paused', 'In Progress']);
  const [draggedStatusIndex, setDraggedStatusIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // View mode and status colors
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusColors, setStatusColors] = useState<Record<string, string>>({
    'To Do': 'bg-slate-500',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-emerald-500',
    'Open': 'bg-violet-500',
    'Review': 'bg-amber-500',
    'Paused': 'bg-red-500',
  });
  const [editingStatusColor, setEditingStatusColor] = useState<string | null>(null);
  const [tempStatusColor, setTempStatusColor] = useState<string>('bg-violet-500');
  const [tempCustomColorHex, setTempCustomColorHex] = useState<string>('#8b5cf6');
  const [showStatusCustomColorPicker, setShowStatusCustomColorPicker] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
  
  // Kanban drag tracking - use ref to avoid re-renders
  const dragTaskIdRef = useRef<string | null>(null);

  // New task state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>(currentUserId);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskClient, setNewTaskClient] = useState<string>('');
  const [newTaskList, setNewTaskList] = useState<string>(''); // Target list for new task

  // Inline quick add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddAssignee, setQuickAddAssignee] = useState<string>(currentUserId);
  const [quickAddClient, setQuickAddClient] = useState<string>('');
  const [quickAddDueDate, setQuickAddDueDate] = useState<Date | undefined>(undefined);

  // Auto-assign tasks with listId to appropriate list
  // Sync task listId property to taskListAssignments mapping
  useEffect(() => {
    const newAssignments = { ...taskListAssignments };
    let hasChanges = false;
    
    tasks.forEach(task => {
      if (task.listId && !taskListAssignments[task.id]) {
        newAssignments[task.id] = task.listId;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setTaskListAssignments(newAssignments);
    }
  }, [tasks, taskListAssignments]);


  // Check for pending email task from localStorage
  useEffect(() => {
    const checkPendingTask = () => {
      const pendingTasksData = localStorage.getItem('pendingEmailTasks');
      console.log('[AllTasksView] Checking for pending email tasks:', pendingTasksData ? 'Found' : 'None');
      if (pendingTasksData) {
        try {
          const tasksArray = JSON.parse(pendingTasksData);
          if (Array.isArray(tasksArray) && tasksArray.length > 0) {
            console.log('[AllTasksView] Adding tasks from emails:', tasksArray);
            
            // Get email-task mapping to update it with real task IDs
            const emailTaskMapping = JSON.parse(localStorage.getItem('emailTaskMapping') || '{}');
            
            // Add all tasks from the queue
            tasksArray.forEach(taskData => {
              const { listIds, ...taskDataWithoutListIds } = taskData;
              
              // If listIds is an array with multiple lists, create the task in each list
              if (Array.isArray(listIds) && listIds.length > 0) {
                listIds.forEach((listId: string) => {
                  addTask({
                    ...taskDataWithoutListIds,
                    listId: listId
                  });
                });
              } else {
                // Fallback: use listId if it exists, otherwise default to 'email-tasks'
                addTask({
                  ...taskDataWithoutListIds,
                  listId: taskData.listId || 'email-tasks'
                });
              }
              
              // Generate the task ID that will be created (same logic as WorkflowContext)
              const newTaskId = `task-${Date.now()}`;
              
              // Update mapping with real task ID if this task has an emailId
              if (taskData.emailId) {
                emailTaskMapping[taskData.emailId] = newTaskId;
                console.log('[AllTasksView] Updated email-task mapping:', taskData.emailId, '->', newTaskId);
              }
            });
            
            // Save updated mapping
            localStorage.setItem('emailTaskMapping', JSON.stringify(emailTaskMapping));
            
            // Clear from localStorage
            localStorage.removeItem('pendingEmailTasks');
          }
        } catch (error) {
          console.error('Error creating task from email:', error);
          localStorage.removeItem('pendingEmailTasks');
        }
      }
    };

    // Check on mount and when selected list changes
    checkPendingTask();

    // Check when hash changes (user navigates to tasks page)
    const handleHashChange = () => {
      console.log('[AllTasksView] Hash changed, checking for pending task');
      checkPendingTask();
    };
    window.addEventListener('hashchange', handleHashChange);

    // Also check when window regains focus (user might have created task in another tab/window)
    const handleFocus = () => checkPendingTask();
    window.addEventListener('focus', handleFocus);

    // Listen for storage events (when localStorage changes in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pendingEmailTasks' && e.newValue) {
        checkPendingTask();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [addTask, selectedList]);

  // Handle opening a specific task from navigation state (e.g., from email "View Task" button)
  useEffect(() => {
    const state = location.state as { openTaskId?: string } | null;
    if (state?.openTaskId) {
      const taskToOpen = tasks.find(t => t.id === state.openTaskId);
      if (taskToOpen) {
        setSelectedTask(taskToOpen);
        setTaskDialogOpen(true);
        console.log('[AllTasksView] Opening task from navigation state:', state.openTaskId);
        // Clear the state to avoid reopening on re-render
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, tasks, navigate, location.pathname]);

  // Get unique assignees and clients from projects
  const allAssignees = Array.from(new Set(projects.flatMap(p => p.assignees)));
  const allClientsNames = Array.from(new Set(projects.map(p => p.clientName).filter(Boolean) as string[]));
  const allClients = allClientsNames.map(name => {
    const mockClient = mockClients.find(c => c.name === name);
    return {
      name: name,
      type: mockClient?.type || 'business' as const
    };
  });

  // Helper to get assignee display name from ID
  const getAssigneeName = (assigneeId: string): string => {
    // Team member mapping - matches CreateTaskFromEmailDialog
    const teamMemberMap: Record<string, string> = {
      'JD': 'JD',
      '2': 'MC',   // Mike Chen
      '3': 'ER',   // Emily Rodriguez
      '4': 'DK',   // David Kim
      'SM': 'SM',
      'AK': 'AK',
      'TC': 'TC',
      'AB': 'AB',
    };
    return teamMemberMap[assigneeId] || assigneeId;
  };

  // Helper to get client name for a task
  const getClientName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.clientName || 'No Client';
  };

  // Get list name for a task
  const getTaskListName = (taskId: string) => {
    // First check if the task has a listId property
    const task = tasks.find(t => t.id === taskId);
    const listId = task?.listId || taskListAssignments[taskId];
    if (!listId) return '—';
    const list = taskLists.find(l => l.id === listId);
    return list?.name || '—';
  };

  // Get list color for a task
  const getTaskListColor = (taskId: string) => {
    // First check if the task has a listId property
    const task = tasks.find(t => t.id === taskId);
    const listId = task?.listId || taskListAssignments[taskId];
    if (!listId) return 'bg-slate-500';
    const list = taskLists.find(l => l.id === listId);
    return list?.color || 'bg-slate-500';
  };

  // Filter tasks by time
  const filterTasksByTime = (task: ProjectTask) => {
    if (!task.dueDate) return timeFilter === 'all';
    
    try {
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return timeFilter === 'all';
      
      const today = new Date();
      
      switch (timeFilter) {
        case 'today':
          return isToday(dueDate);
        case 'week':
          return isThisWeek(dueDate, { weekStartsOn: 1 });
        case 'month':
          return isThisMonth(dueDate);
        case 'overdue':
          return dueDate < startOfDay(today) && task.status !== 'completed';
        default:
          return true;
      }
    } catch {
      return timeFilter === 'all';
    }
  };

  // Get email by ID
  const getEmailById = (emailId: string): Email | null => {
    return mockEmails.find(e => e.id === emailId) || null;
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle viewing email in modal
  const handleViewEmail = (emailId: string) => {
    const email = getEmailById(emailId);
    if (email) {
      setSelectedEmail(email);
      setShowEmailViewer(true);
    } else {
      toast.error('Email not found');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTime = filterTasksByTime(task);
    
    // My Tasks filter for specific list
    const matchesMyTasks = !showMyTasksOnly || task.assignee === currentUserId;
    
    // List filter - check task.listId first, then fall back to taskListAssignments
    const taskListId = task.listId || taskListAssignments[task.id];
    let matchesList = true;
    if (selectedList === 'all') {
      matchesList = true;
    } else if (selectedList === 'my-tasks') {
      matchesList = task.assignee === currentUserId;
    } else if (selectedList === 'email-tasks') {
      // Email Tasks list shows ALL tasks from emails, regardless of assignee
      matchesList = taskListId === selectedList;
    } else if (['inbox', 'callback', 'recurring-tasks'].includes(selectedList)) {
      // Other default lists only show current user's tasks
      matchesList = taskListId === selectedList && task.assignee === currentUserId;
    } else {
      matchesList = taskListId === selectedList;
    }
    
    // Visual filter matches with mixed include/exclude logic
    // Logic: If there are included items, the item must be in the included list AND not in the excluded list
    //        If there are no included items, the item just must not be in the excluded list
    const matchesAssignee = 
      (includedAssignees.length === 0 && excludedAssignees.length === 0) || 
      (includedAssignees.length > 0 
        ? includedAssignees.includes(task.assignee) && !excludedAssignees.includes(task.assignee)
        : !excludedAssignees.includes(task.assignee));
    
    const taskClient = projects.find(p => p.id === task.projectId)?.clientName;
    const matchesClient = 
      (includedClients.length === 0 && excludedClients.length === 0) || 
      (includedClients.length > 0 
        ? (taskClient && includedClients.includes(taskClient) && !excludedClients.includes(taskClient))
        : (taskClient && !excludedClients.includes(taskClient)));
    
    const matchesStatus = 
      (includedStatuses.length === 0 && excludedStatuses.length === 0) || 
      (includedStatuses.length > 0 
        ? includedStatuses.includes(task.status) && !excludedStatuses.includes(task.status)
        : !excludedStatuses.includes(task.status));
    
    const matchesPriority = 
      (includedPriorities.length === 0 && excludedPriorities.length === 0) || 
      (includedPriorities.length > 0 
        ? includedPriorities.includes(task.priority) && !excludedPriorities.includes(task.priority)
        : !excludedPriorities.includes(task.priority));
    
    const matchesTaskListFilter = 
      (includedTaskListFilters.length === 0 && excludedTaskListFilters.length === 0) || 
      (includedTaskListFilters.length > 0 
        ? (taskListId && includedTaskListFilters.includes(taskListId) && !excludedTaskListFilters.includes(taskListId))
        : (taskListId && !excludedTaskListFilters.includes(taskListId)));
    
    // Completed filter based on display mode
    const matchesCompletedFilter = 
      viewMode === 'kanban' ? true : // Kanban view always shows all tasks (Done column handles completed tasks)
      completedDisplayMode === 'hide' ? task.status !== 'completed' :
      completedDisplayMode === 'only' ? task.status === 'completed' :
      true; // 'inline' and 'separate' show all tasks
    
    return matchesSearch && matchesTime && matchesMyTasks && matchesList && matchesAssignee && matchesClient && matchesStatus && matchesPriority && matchesTaskListFilter && matchesCompletedFilter;
  });

  // Sort tasks
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (!sortColumn) {
      // Use custom task order when no sort is active
      const aOrder = taskOrder[a.id] ?? Infinity;
      const bOrder = taskOrder[b.id] ?? Infinity;
      return aOrder - bOrder;
    }
    
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'assignee':
        return multiplier * a.assignee.localeCompare(b.assignee);
      
      case 'task':
        return multiplier * a.name.localeCompare(b.name);
      
      case 'list': {
        const aListId = taskListAssignments[a.id];
        const bListId = taskListAssignments[b.id];
        const aListName = taskLists.find(l => l.id === aListId)?.name || '';
        const bListName = taskLists.find(l => l.id === bListId)?.name || '';
        return multiplier * aListName.localeCompare(bListName);
      }
      
      case 'client': {
        const aClient = getClientName(a.projectId);
        const bClient = getClientName(b.projectId);
        return multiplier * aClient.localeCompare(bClient);
      }
      
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      
      case 'priority': {
        const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        return multiplier * (aPriority - bPriority);
      }
      
      case 'dueDate': {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return multiplier * (aDate - bDate);
      }
      
      default:
        return 0;
    }
  });

  // Handle column sort
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

  // Priority colors and icons
  const getPriorityStyle = (priority?: string) => {
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
          label: status
        };
    }
  };

  // Handle status reorder
  const handleStatusReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newStatuses = [...customStatuses];
    const [movedItem] = newStatuses.splice(fromIndex, 1);
    newStatuses.splice(toIndex, 0, movedItem);
    setCustomStatuses(newStatuses);
  };

  // Toggle task completion
  const toggleTaskComplete = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTask = {
      ...task,
      status: task.status === 'completed' ? 'todo' : ('completed' as const),
      completedAt: task.status === 'completed' ? undefined : new Date().toISOString()
    };
    updateTask(updatedTask);
  };

  // Delete task
  const handleDeleteTask = (task: ProjectTask) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast.success('Task deleted');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  // Timer handlers
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
      const previousTask = tasks.find(t => t.id === activeTimer?.taskId);
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

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedTaskIds(sortedAndFilteredTasks.map(t => t.id));
      toast.success('Multi-select mode enabled');
      return;
    }

    if (selectedTaskIds.length === sortedAndFilteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedAndFilteredTasks.map(t => t.id));
    }
  };

  const toggleSelectTask = (taskId: string) => {
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
    const tasksToUpdate = tasks.filter(t => selectedTaskIds.includes(t.id));
    tasksToUpdate.forEach(task => {
      updateTask({
        ...task,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });
    });
    toast.success(`Marked ${tasksToUpdate.length} task${tasksToUpdate.length !== 1 ? 's' : ''} as completed`);
    clearSelection();
  };

  const bulkMoveToList = (listId: string) => {
    const tasksToMove = tasks.filter(t => selectedTaskIds.includes(t.id));
    const list = taskLists.find(l => l.id === listId);
    
    // Update the task list assignments
    const newAssignments = { ...taskListAssignments };
    selectedTaskIds.forEach(taskId => {
      newAssignments[taskId] = listId;
    });
    setTaskListAssignments(newAssignments);
    
    toast.success(`Moved ${tasksToMove.length} task${tasksToMove.length !== 1 ? 's' : ''} to ${list?.name}`);
    clearSelection();
  };

  const handleTaskRowClick = (task: ProjectTask) => {
    if (isMultiSelectMode) {
      toggleSelectTask(task.id);
      return;
    }
    
    // Otherwise, expand subtasks if they exist
    if (task.subtasks && task.subtasks.total > 0) {
      setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
    }
  };

  const handleTaskNameClick = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };
  
  // Get task indicators (comments, attachments, subtasks)
  const getTaskIndicators = (task: ProjectTask) => {
    return {
      comments: task.comments || 0,
      attachments: task.attachments || 0,
      subtasks: task.subtasks || { total: 0, completed: 0 }
    };
  };
  
  // Mock subtasks - in real app these would come from context
  const getSubtasks = (taskId: string) => {
    return [
      { id: `${taskId}-sub-1`, name: 'Review client documents', description: 'Check all client-provided documents for completeness', status: 'completed' as const, assignee: 'JD', priority: 'high' },
      { id: `${taskId}-sub-2`, name: 'Prepare initial analysis', description: 'Create preliminary financial analysis report', status: 'in-progress' as const, assignee: 'SM', priority: 'medium' },
      { id: `${taskId}-sub-3`, name: 'Schedule follow-up meeting', description: '', status: 'todo' as const, assignee: 'AB', priority: 'low' },
    ];
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setIncludedAssignees([]);
    setExcludedAssignees([]);
    setIncludedClients([]);
    setExcludedClients([]);
    setIncludedStatuses([]);
    setExcludedStatuses([]);
    setIncludedPriorities([]);
    setExcludedPriorities([]);
    setIncludedTaskListFilters([]);
    setExcludedTaskListFilters([]);
    setAssigneeMode('include');
    setClientMode('include');
    setStatusMode('include');
    setPriorityMode('include');
    setTaskListFilterMode('include');
    toast.success('All filters cleared');
  };

  // Check if any filters are active
  const activeFilterCount = includedAssignees.length + excludedAssignees.length + includedClients.length + excludedClients.length + includedStatuses.length + excludedStatuses.length + includedPriorities.length + excludedPriorities.length + includedTaskListFilters.length + excludedTaskListFilters.length;

  // Get selected list info for header
  const getSelectedListInfo = () => {
    if (selectedList === 'all') {
      return { name: 'All Tasks', color: 'bg-gradient-to-r from-violet-500 to-indigo-500', colorLight: 'bg-violet-50' };
    }
    if (selectedList === 'my-tasks') {
      return { name: 'My Tasks', color: 'bg-gradient-to-r from-violet-500 to-indigo-500', colorLight: 'bg-violet-50' };
    }
    const list = taskLists.find(l => l.id === selectedList);
    if (list) {
      // Map colors to their gradient equivalents
      const colorMap: Record<string, { color: string; colorLight: string }> = {
        'bg-violet-500': { color: 'bg-gradient-to-r from-violet-500 to-violet-600', colorLight: 'bg-violet-50' },
        'bg-blue-500': { color: 'bg-gradient-to-r from-blue-500 to-blue-600', colorLight: 'bg-blue-50' },
        'bg-emerald-500': { color: 'bg-gradient-to-r from-emerald-500 to-emerald-600', colorLight: 'bg-emerald-50' },
        'bg-amber-500': { color: 'bg-gradient-to-r from-amber-500 to-amber-600', colorLight: 'bg-amber-50' },
        'bg-red-500': { color: 'bg-gradient-to-r from-red-500 to-red-600', colorLight: 'bg-red-50' },
        'bg-pink-500': { color: 'bg-gradient-to-r from-pink-500 to-pink-600', colorLight: 'bg-pink-50' },
        'bg-indigo-500': { color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', colorLight: 'bg-indigo-50' },
        'bg-teal-500': { color: 'bg-gradient-to-r from-teal-500 to-teal-600', colorLight: 'bg-teal-50' },
        'bg-slate-500': { color: 'bg-gradient-to-r from-slate-500 to-slate-600', colorLight: 'bg-slate-50' },
        'bg-orange-500': { color: 'bg-gradient-to-r from-orange-500 to-orange-600', colorLight: 'bg-orange-50' },
      };
      
      // Handle custom colors
      if (list.color.startsWith('custom-')) {
        const hexColor = list.color.replace('custom-', '');
        return {
          name: list.name,
          color: hexColor, // Just the hex color for inline styles
          colorLight: 'bg-slate-50',
          isCustom: true
        };
      }
      
      const colors = colorMap[list.color] || { color: 'bg-gradient-to-r from-violet-500 to-violet-600', colorLight: 'bg-violet-50' };
      return { 
        name: list.name, 
        ...colors,
        isCustom: false
      };
    }
    return { name: 'All Tasks', color: 'bg-gradient-to-r from-violet-500 to-indigo-500', colorLight: 'bg-violet-50' };
  };

  const selectedListInfo = getSelectedListInfo();

  // Helper to get icon for special lists
  const getListIcon = (listId: string) => {
    if (listId === 'inbox') {
      return Inbox;
    }
    if (listId === 'callback') {
      return Phone;
    }
    if (listId === 'email-tasks') {
      return Mail;
    }
    if (listId === 'recurring-tasks') {
      return Repeat;
    }
    return null;
  };

  // Helper to render badge with custom color support
  const renderListBadge = (color: string, name: string, className: string = '') => {
    if (color.startsWith('custom-')) {
      const hexColor = color.replace('custom-', '');
      return (
        <Badge 
          className={`text-white border-0 text-xs ${className}`}
          style={{ backgroundColor: hexColor }}
        >
          {name}
        </Badge>
      );
    }
    return (
      <Badge className={`${color} text-white border-0 text-xs ${className}`}>
        {name}
      </Badge>
    );
  };

  // Task list management
  const openAddListDialog = () => {
    setEditingList(null);
    setListName('');
    setListColor('bg-violet-500');
    setCustomColorHex('#8b5cf6');
    setShowCustomColorPicker(false);
    setNewListSharedWith([]); // Reset sharing
    setShowSharingSection(false); // Reset sharing section visibility
    setShowListDialog(true);
  };

  const openEditListDialog = (list: TaskList) => {
    setEditingList(list);
    setListName(list.name);
    setListColor(list.color);
    setShowListDialog(true);
  };

  const saveTaskList = () => {
    if (!listName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (editingList) {
      setTaskLists(taskLists.map(list => 
        list.id === editingList.id 
          ? { ...list, name: listName, color: listColor }
          : list
      ));
      toast.success('List updated');
    } else {
      const newList: TaskList = {
        id: `list-${Date.now()}`,
        name: listName,
        color: listColor,
        taskCount: 0,
        sharedWith: [currentUserId, ...newListSharedWith] // Include current user + selected shares
      };
      setTaskLists([...taskLists, newList]);
      toast.success('List created');
    }
    setShowListDialog(false);
  };

  // Toggle user for new list sharing
  const toggleNewListUserShare = (userId: string) => {
    setNewListSharedWith(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const deleteTaskList = (listId: string) => {
    setTaskLists(taskLists.filter(list => list.id !== listId));
    if (selectedList === listId) {
      setSelectedList('all');
    }
    toast.success('List deleted');
  };

  // Share list management
  const openShareDialog = (list: TaskList) => {
    setSharingList(list);
    setShowShareDialog(true);
  };

  const toggleUserShare = (userId: string) => {
    if (!sharingList) return;
    
    const currentShared = sharingList.sharedWith || [];
    const isShared = currentShared.includes(userId);
    
    const updatedShared = isShared
      ? currentShared.filter(id => id !== userId)
      : [...currentShared, userId];
    
    setTaskLists(taskLists.map(list => 
      list.id === sharingList.id 
        ? { ...list, sharedWith: updatedShared }
        : list
    ));
    
    setSharingList({ ...sharingList, sharedWith: updatedShared });
    toast.success(isShared ? 'User removed from list' : 'User added to list');
  };

  // Move task list up or down in the order
  const moveTaskList = (listId: string, direction: 'up' | 'down') => {
    const index = taskLists.findIndex(l => l.id === listId);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === taskLists.length - 1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newLists = [...taskLists];
    [newLists[index], newLists[newIndex]] = [newLists[newIndex], newLists[index]];
    
    setTaskLists(newLists);
    toast.success('List order updated');
  };

  // Drag and drop handler
  const handleTaskDrop = (taskId: string, listId: string) => {
    const previousListId = taskListAssignments[taskId];
    setTaskListAssignments(prev => ({
      ...prev,
      [taskId]: listId
    }));
    
    const list = taskLists.find(l => l.id === listId);
    const task = tasks.find(t => t.id === taskId);
    toast.success(`Moved "${task?.name}" to ${list?.name}`);
  };

  // Reorder tasks handler
  const handleTaskReorder = (draggedTaskIds: string[], targetTaskId: string) => {
    const currentTasks = [...sortedAndFilteredTasks];
    const targetIndex = currentTasks.findIndex(t => t.id === targetTaskId);
    
    if (targetIndex === -1) return;
    
    // Create new order based on current visible order
    const newOrder: Record<string, number> = {};
    let orderCounter = 0;
    
    // First, assign order to all tasks except the dragged ones
    currentTasks.forEach((task) => {
      if (!draggedTaskIds.includes(task.id)) {
        if (task.id === targetTaskId) {
          // Insert dragged tasks before target
          draggedTaskIds.forEach((draggedId) => {
            newOrder[draggedId] = orderCounter++;
          });
        }
        newOrder[task.id] = orderCounter++;
      }
    });
    
    setTaskOrder(newOrder);
    toast.success('Task order updated');
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined, formatStr: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return format(date, formatStr);
    } catch {
      return '';
    }
  };
  
  // Helper function to check if a date is overdue
  const isOverdue = (dateString: string | undefined, taskStatus: string) => {
    if (!dateString || taskStatus === 'completed') return false;
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch {
      return false;
    }
  };
  
  // Helper function to check if a date is today
  const isDueToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    try {
      const dueDate = new Date(dateString);
      return isToday(dueDate);
    } catch {
      return false;
    }
  };

  // Export tasks
  const exportTasks = () => {
    const csv = [
      ['Task', 'Assignee', 'Client', 'Status', 'Priority', 'Due Date', 'Created'].join(','),
      ...sortedAndFilteredTasks.map(task => [
        task.name,
        task.assignee,
        getClientName(task.projectId),
        task.status,
        task.priority,
        safeFormatDate(task.dueDate, 'yyyy-MM-dd'),
        safeFormatDate(task.createdAt, 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Tasks exported');
  };



  // Create task via inline quick add
  const createQuickTask = () => {
    if (!quickAddName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    const targetListId = selectedList === 'all' || selectedList === 'my-tasks' ? 'inbox' : selectedList;
    
    // Find first project for the selected client, or create a default project
    let targetProject = projects[0];
    if (quickAddClient) {
      const clientProject = projects.find(p => p.clientName === quickAddClient);
      if (clientProject) {
        targetProject = clientProject;
      }
    }

    if (!targetProject) {
      toast.error('No projects available');
      return;
    }

    const newTaskId = `task-${Date.now()}`;
    
    addTask({
      name: quickAddName.trim(),
      description: '',
      projectId: targetProject.id,
      assignee: quickAddAssignee || 'Unassigned',
      status: 'todo',
      priority: undefined,
      dueDate: quickAddDueDate ? quickAddDueDate.toISOString() : new Date().toISOString(),
      automations: 0,
      dependencies: []
    });

    // Assign the new task to the selected list
    setTaskListAssignments({ ...taskListAssignments, [newTaskId]: targetListId });

    const listName = taskLists.find(l => l.id === targetListId)?.name || 'Inbox';
    toast.success(`Task added to ${listName}`);
    
    // Reset quick add
    setQuickAddName('');
    setQuickAddAssignee(currentUserId);
    setQuickAddClient('');
    setQuickAddDueDate(undefined);
    setShowQuickAdd(false);
  };

  // Create new task
  const createNewTask = () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    // Find project by client if selected, otherwise use first project
    let targetProject = projects[0];
    if (newTaskClient) {
      const projectWithClient = projects.find(p => p.clientName === newTaskClient);
      if (projectWithClient) {
        targetProject = projectWithClient;
      }
    }
    
    if (!targetProject) {
      toast.error('No projects available. Please create a project first.');
      return;
    }

    const newTaskId = `task-${Date.now()}`;
    
    addTask({
      name: newTaskName.trim(),
      description: newTaskDescription.trim(),
      projectId: targetProject.id,
      workflowId: targetProject.workflowId,
      stageId: targetProject.currentStageId,
      assignee: newTaskAssignee || 'JD', // Use selected assignee or default
      priority: newTaskPriority,
      status: 'todo',
      dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : new Date().toISOString(),
      automations: 0,
      dependencies: []
    });

    // Assign the new task to the selected list
    const targetListId = newTaskList || 'inbox';
    setTaskListAssignments({ ...taskListAssignments, [newTaskId]: targetListId });

    const listName = taskLists.find(l => l.id === targetListId)?.name || 'Inbox';
    toast.success(`Task created in ${listName}`);
    setTaskDialogOpen(false);
    setNewTaskName('');
    setNewTaskDescription('');
    setNewTaskAssignee('');
    setNewTaskPriority(undefined);
    setNewTaskDueDate(undefined);
    setNewTaskClient('');
    setNewTaskList('');
  };

  // Timer handlers - Temporarily commented for debugging
  /*
  const handleToggleTimer = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeTimer?.taskId === task.id) {
      // Stop the current timer
      stopTimer();
      toast.success('Timer stopped');
    } else {
      // Stop any existing timer and start new one
      if (activeTimer) {
        stopTimer();
      }
      startTimer(task.id, task.projectId);
      toast.success('Timer started');
    }
  };
  */

  // Inline editing handlers
  const startEditing = (taskId: string, field: string, currentValue: string) => {
    setEditingTaskId(taskId);
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingField(null);
    setEditingValue('');
  };

  const saveInlineEdit = (taskId: string, field: string, value: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(taskId, { [field]: value });
    cancelEditing();
    toast.success('Task updated');
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent, taskId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveInlineEdit(taskId, field, editingValue);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Determine if we should show the List column (only for All Tasks and My Tasks views)
  const showListColumn = selectedList === 'all' || selectedList === 'my-tasks';

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // ESC - Dismiss/cancel dialog
      if (e.key === 'Escape') {
        if (showShortcutsDialog) {
          setShowShortcutsDialog(false);
        } else if (taskDialogOpen) {
          setTaskDialogOpen(false);
        } else if (showQuickAdd) {
          setShowQuickAdd(false);
          setQuickAddName('');
          setQuickAddAssignee(currentUserId);
          setQuickAddClient('');
          setQuickAddDueDate(undefined);
        } else if (showFilterPanel) {
          setShowFilterPanel(false);
        }
        return;
      }

      // Don't process other shortcuts when typing
      if (isInputField) return;
      
      // S - Search
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
        toast.success('Search focused');
      }
      
      // ? - Show shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }
      
      // Cmd/Ctrl + I - Go to Inbox
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setSelectedList('inbox');
        toast.success('Switched to Inbox');
      }
      
      // Cmd/Ctrl + C - Go to Callback
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        setSelectedList('callback');
        toast.success('Switched to Callback');
      }
      
      // Cmd/Ctrl + A - All Tasks
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedList('all');
        toast.success('Switched to All Tasks');
      }
      
      // Cmd/Ctrl + M - My Tasks
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setSelectedList('my-tasks');
        toast.success('Switched to My Tasks');
      }
      
      // Cmd/Ctrl + Shift + A - Select all
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggleSelectAll();
      }
      
      // N - New task (simple dialog)
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setSelectedTask(null);
        setIsAddingNewTask(true);
        setShowComprehensiveNewTask(false);
        setNewTaskAssignee(currentUserId);
        // Set the target list based on current selection
        const targetListId = selectedList === 'all' || selectedList === 'my-tasks' ? 'inbox' : selectedList;
        setNewTaskList(targetListId);
        setTaskDialogOpen(true);
        toast.success('New task');
      }
      
      // Q - Quick add task (inline)
      if (e.key === 'q' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setShowQuickAdd(true);
        toast.success('Quick add');
      }
      
      // Shift + A - All tasks
      if (e.shiftKey && e.key === 'A' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTimeFilter('all');
        toast.success('Showing all tasks');
      }
      
      // Shift + T - Today
      if (e.shiftKey && e.key === 'T' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTimeFilter('today');
        toast.success('Showing today\'s tasks');
      }
      
      // Shift + W - This week
      if (e.shiftKey && e.key === 'W' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTimeFilter('week');
        toast.success('Showing this week\'s tasks');
      }
      
      // Shift + M - This month
      if (e.shiftKey && e.key === 'M' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTimeFilter('month');
        toast.success('Showing this month\'s tasks');
      }
      
      // Shift + O - Overdue
      if (e.shiftKey && e.key === 'O' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTimeFilter('overdue');
        toast.success('Showing overdue tasks');
      }
      
      // Shift + S - Show/hide completed
      if (e.shiftKey && e.key === 'S' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHideCompleted(!hideCompleted);
        toast.success(hideCompleted ? 'Showing completed tasks' : 'Hiding completed tasks');
      }
      
      // Shift + F - Toggle filters
      if (e.shiftKey && e.key === 'F' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowFilterPanel(!showFilterPanel);
        toast.success(showFilterPanel ? 'Filters closed' : 'Filters opened');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFilterPanel, isMultiSelectMode, showShortcutsDialog, taskDialogOpen, showQuickAdd, timeFilter, hideCompleted]);

  return (
    <div className="flex gap-6 h-full">
      {/* Left Sidebar - Task Lists or Filter Panel */}
      {!showFilterPanel ? (
        <div className="w-64 flex-shrink-0 space-y-4">
          <Card className="border-slate-200 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                  <span className="text-sm text-slate-700 dark:text-gray-300">Task Lists</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openAddListDialog}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1">
                  {/* All Tasks */}
                  <button
                    onClick={() => setSelectedList('all')}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left
                      ${selectedList === 'all'
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm' 
                        : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">All Tasks</span>
                      {showShortcutsLearningMode && (
                        <kbd className="px-1 py-0.5 text-[11px] bg-white/20 border border-white/30 rounded">⌘ A</kbd>
                      )}
                    </div>
                    <Badge className={selectedList === 'all' ? "bg-white/20 text-white border-white/30" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300"}>
                      {tasks.length}
                    </Badge>
                  </button>

                  {/* My Tasks */}
                  <button
                    onClick={() => setSelectedList('my-tasks')}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left
                      ${selectedList === 'my-tasks'
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm' 
                        : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">My Tasks</span>
                      {showShortcutsLearningMode && (
                        <kbd className="px-1 py-0.5 text-[11px] bg-white/20 border border-white/30 rounded">⌘ M</kbd>
                      )}
                    </div>
                    <Badge className={selectedList === 'my-tasks' ? "bg-white/20 text-white border-white/30" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300"}>
                      {tasks.filter(t => t.assignee === 'JD').length}
                    </Badge>
                  </button>

                  <div className="border-t border-slate-200 dark:border-gray-700 my-2" />

                  {/* Default Task Lists */}
                  <div className="mb-3">
                    <div className="px-3 py-1 mb-1">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-gray-500">Default Lists</span>
                    </div>
                    {taskLists.filter(list => ['inbox', 'callback', 'email-tasks', 'recurring-tasks'].includes(list.id)).map((list) => {
                      // Keyboard shortcuts for specific lists
                      const listShortcuts: Record<string, string> = {
                        'inbox': '⌘ I',
                        'callback': '⌘ C'
                      };
                      return (
                        <div key={list.id} className="space-y-1">
                          <DroppableListItem 
                            list={list} 
                            onTaskDrop={handleTaskDrop}
                            isSelected={selectedList === list.id}
                          >
                            <div className="group relative">
                              <button
                                onClick={() => {
                                  setSelectedList(list.id);
                                  setShowMyTasksOnly(false);
                                }}
                                className={`
                                  w-full flex items-center gap-2 px-3 py-2 pr-9 rounded-lg transition-all text-left
                                  ${selectedList === list.id
                                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm' 
                                    : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300'
                                  }
                                `}
                              >
                                <div className={`w-2.5 h-2.5 rounded-full ${list.color} flex-shrink-0`} />
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  {(() => {
                                    const ListIcon = getListIcon(list.id);
                                    return ListIcon ? (
                                      <>
                                        <ListIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedList === list.id ? 'text-white' : 'text-slate-500'}`} />
                                        <span className="text-sm truncate">{list.name}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm truncate">{list.name}</span>
                                    );
                                  })()}
                                  {showShortcutsLearningMode && listShortcuts[list.id] && (
                                    <kbd className="px-1 py-0.5 text-[11px] bg-white/20 border border-white/30 rounded whitespace-nowrap">{listShortcuts[list.id]}</kbd>
                                  )}
                                </div>
                                
                                <Badge className={selectedList === list.id ? "bg-white/20 text-white border-white/30 px-2" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-2"}>
                                  {Object.values(taskListAssignments).filter(id => id === list.id).length}
                                </Badge>
                              </button>
                            </div>
                          </DroppableListItem>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200 my-3" />

                  {/* Custom Task Lists */}
                  <div className="px-3 py-1 mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Custom Lists</span>
                  </div>
                  {taskLists.filter(list => !['inbox', 'callback', 'email-tasks', 'recurring-tasks'].includes(list.id)).map((list) => {
                    // Keyboard shortcuts for specific lists
                    const listShortcuts: Record<string, string> = {
                      'inbox': '⌘ I',
                      'callback': '⌘ C'
                    };
                    return (
                      <div key={list.id} className="space-y-1">
                        <DroppableListItem 
                          list={list} 
                          onTaskDrop={handleTaskDrop}
                          isSelected={selectedList === list.id}
                        >
                          <div className="group relative">
                            <button
                              onClick={() => {
                                setSelectedList(list.id);
                                setShowMyTasksOnly(false); // Reset My Tasks filter when switching lists
                              }}
                              className={`
                                w-full flex items-center gap-2 px-3 py-2 pr-9 rounded-lg transition-all text-left
                                ${selectedList === list.id
                                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm' 
                                  : 'hover:bg-slate-100 text-slate-700'
                                }
                              `}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full ${list.color} flex-shrink-0`} />
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {(() => {
                                  const ListIcon = getListIcon(list.id);
                                  return ListIcon ? (
                                    <>
                                      <ListIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedList === list.id ? 'text-white' : 'text-slate-500'}`} />
                                      <span className="text-sm truncate">{list.name}</span>
                                    </>
                                  ) : (
                                    <span className="text-sm truncate">{list.name}</span>
                                  );
                                })()}
                                {showShortcutsLearningMode && listShortcuts[list.id] && (
                                  <kbd className="px-1 py-0.5 text-[11px] bg-white/20 border border-white/30 rounded whitespace-nowrap">{listShortcuts[list.id]}</kbd>
                                )}
                              </div>
                              
                              <Badge className={selectedList === list.id ? "bg-white/20 text-white border-white/30 px-2" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-2"}>
                                {Object.values(taskListAssignments).filter(id => id === list.id).length}
                              </Badge>
                            </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${selectedList === list.id ? 'text-white hover:bg-white/20' : ''}`}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => moveTaskList(list.id, 'up')}>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Move Up
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => moveTaskList(list.id, 'down')}>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Move Down
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openShareDialog(list)}>
                                <Users className="w-4 h-4 mr-2" />
                                Share List
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditListDialog(list)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit List
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteTaskList(list.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete List
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* My Tasks filter toggle for this list - hide for default lists since they only show user's tasks */}
                        {selectedList === list.id && !['inbox', 'callback', 'email-tasks', 'recurring-tasks'].includes(list.id) && list.sharedWith && list.sharedWith.length > 1 && (
                          <button
                            onClick={() => setShowMyTasksOnly(!showMyTasksOnly)}
                            className={`
                              w-full flex items-center gap-2 px-3 py-1.5 ml-4 rounded text-xs transition-all
                              ${showMyTasksOnly
                                ? 'text-violet-600 bg-violet-50' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                              }
                            `}
                          >
                            <User className="w-3 h-3" />
                            <span>My Tasks Only</span>
                          </button>
                        )}
                      </DroppableListItem>
                    </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      ) : (
        <div className="w-80 flex-shrink-0">
          <TaskFilterPanel
            includedAssignees={includedAssignees}
            excludedAssignees={excludedAssignees}
            includedClients={includedClients}
            excludedClients={excludedClients}
            includedStatuses={includedStatuses}
            excludedStatuses={excludedStatuses}
            includedPriorities={includedPriorities}
            excludedPriorities={excludedPriorities}
            includedTaskLists={includedTaskListFilters}
            excludedTaskLists={excludedTaskListFilters}
            assigneeMode={assigneeMode}
            clientMode={clientMode}
            statusMode={statusMode}
            priorityMode={priorityMode}
            taskListMode={taskListFilterMode}
            allAssignees={allAssignees}
            allClients={allClients}
            allTaskLists={taskLists}
            customStatuses={customStatuses}
            onIncludedAssigneesChange={setIncludedAssignees}
            onExcludedAssigneesChange={setExcludedAssignees}
            onIncludedClientsChange={setIncludedClients}
            onExcludedClientsChange={setExcludedClients}
            onIncludedStatusesChange={setIncludedStatuses}
            onExcludedStatusesChange={setExcludedStatuses}
            onIncludedPrioritiesChange={setIncludedPriorities}
            onExcludedPrioritiesChange={setExcludedPriorities}
            onIncludedTaskListsChange={setIncludedTaskListFilters}
            onExcludedTaskListsChange={setExcludedTaskListFilters}
            onAssigneeModeChange={setAssigneeMode}
            onClientModeChange={setClientMode}
            onStatusModeChange={setStatusMode}
            onPriorityModeChange={setPriorityMode}
            onTaskListModeChange={setTaskListFilterMode}
            onClose={() => setShowFilterPanel(false)}
            onClearAll={clearAllFilters}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-20 bg-slate-50 dark:bg-gray-900 pb-4 space-y-4 shadow-md border-b border-slate-200 dark:border-gray-700 mb-6">
        {/* Header with List Name and Color */}
        <div 
          className={`${(selectedListInfo as any).isCustom ? '' : selectedListInfo.color} text-white px-6 py-3 rounded-lg shadow-md`}
          style={(selectedListInfo as any).isCustom ? { 
            background: `linear-gradient(to right, ${selectedListInfo.color}, ${selectedListInfo.color}dd)` 
          } : {}}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-lg font-semibold">{selectedListInfo.name}</h2>
                <p className="text-xs text-white/80 mt-0.5">{sortedAndFilteredTasks.length} task{sortedAndFilteredTasks.length !== 1 ? 's' : ''}</p>
              </div>
              
              {/* Shared Users Display */}
              {selectedList !== 'all' && selectedList !== 'my-tasks' && (() => {
                const currentList = taskLists.find(l => l.id === selectedList);
                if (currentList) {
                  // Filter out current user from shared list
                  const otherUsers = (currentList.sharedWith || []).filter(userId => userId !== currentUserId);
                  const hasOtherUsers = otherUsers.length > 0;
                  
                  return (
                    <div className="flex items-center gap-3 pl-6 border-l border-white/30">
                      {hasOtherUsers && (
                        <>
                          <span className="text-sm text-white/90">Shared with:</span>
                          <div className="flex items-center gap-2">
                            {otherUsers.map((userId) => (
                              <TooltipProvider key={userId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
                                      <Avatar className="w-6 h-6 border-2 border-white/50">
                                        <AvatarFallback className="text-xs bg-white/30 text-white">
                                          {userId}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-white">{userId}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Team Member - {userId}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openShareDialog(currentList)}
                        className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white border-white/30"
                        variant="outline"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Share
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            
            {/* My Tasks toggle for shared lists at top level */}
            {(selectedList === 'all' || (selectedList !== 'my-tasks' && taskLists.find(l => l.id === selectedList)?.sharedWith && taskLists.find(l => l.id === selectedList)!.sharedWith!.length > 1)) && (
              <Button
                variant={showMyTasksOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMyTasksOnly(!showMyTasksOnly)}
                className={`gap-2 flex-shrink-0 transition-all shadow-md ${
                  showMyTasksOnly 
                    ? 'bg-white text-violet-700 border-white hover:bg-white hover:text-violet-800 ring-2 ring-white/50' 
                    : 'bg-white/20 text-white hover:bg-white/30 border-white/30'
                }`}
              >
                <User className="w-4 h-4" />
                <span className={showMyTasksOnly ? 'font-semibold' : ''}>
                  {showMyTasksOnly ? 'Showing My Tasks' : 'Show My Tasks Only'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Top Bar - Time Filters, Filters, Search, and Actions */}
        <Card className="border-slate-200 shadow-sm">
          <div className="p-3">
            <div className="flex items-center gap-3 overflow-x-auto min-w-0">
              {/* Search */}
              <div className="flex-1 max-w-xs relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={showShortcutsLearningMode ? "Search tasks... (S)" : "Search tasks..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-gray-700 dark:text-gray-100 border-slate-300 dark:border-gray-600 focus:border-violet-400 focus:ring-violet-400"
                />
                {showShortcutsLearningMode && !searchQuery && (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">S</kbd>
                )}
              </div>

              {/* Time Filters */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-gray-700 rounded-lg">
                  {['all', 'today', 'week', 'month', 'overdue'].map((filter) => {
                    const shortcuts: Record<string, string> = {
                      'all': '⇧ A',
                      'today': '⇧ T',
                      'week': '⇧ W',
                      'month': '⇧ M',
                      'overdue': '⇧ O'
                    };
                    return (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter as any)}
                        className={`
                          px-3 py-1.5 rounded text-xs transition-all capitalize flex items-center gap-1.5
                          ${timeFilter === filter
                            ? 'bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm font-medium'
                            : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100'
                          }
                        `}
                      >
                        {filter}
                        {showShortcutsLearningMode && (
                          <kbd className="px-1 py-0.5 text-[11px] bg-slate-200 border border-slate-300 rounded">{shortcuts[filter]}</kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completed Tasks Display Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={completedDisplayMode === 'hide' ? 'outline' : 'default'}
                    size="sm"
                    className={`gap-2 flex-shrink-0 ${completedDisplayMode !== 'hide' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedDisplayMode === 'hide' && 'Hide Completed'}
                    {completedDisplayMode === 'inline' && 'Show Completed'}
                    {completedDisplayMode === 'only' && 'Completed Only'}
                    {showShortcutsLearningMode && (
                      <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">⇧ S</kbd>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {completedDisplayMode !== 'hide' && (
                    <DropdownMenuItem onClick={() => setCompletedDisplayMode('hide')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Hide Completed
                    </DropdownMenuItem>
                  )}
                  {completedDisplayMode !== 'inline' && (
                    <DropdownMenuItem onClick={() => setCompletedDisplayMode('inline')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Show Completed
                    </DropdownMenuItem>
                  )}
                  {completedDisplayMode !== 'only' && (
                    <DropdownMenuItem onClick={() => setCompletedDisplayMode('only')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed Only
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Toggle Button */}
              <Button
                variant={showFilterPanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`gap-2 flex-shrink-0 ${showFilterPanel ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 bg-white/20 text-white border-white/30 px-1.5 min-w-[20px] justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
                {showShortcutsLearningMode && (
                  <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">⇧ F</kbd>
                )}
              </Button>

              <div className="flex-1 flex-shrink-0 min-w-[20px]" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTask(null);
                    setIsAddingNewTask(true);
                    setShowComprehensiveNewTask(false);
                    setNewTaskAssignee(currentUserId);
                    // Set the target list based on current selection
                    const targetListId = selectedList === 'all' || selectedList === 'my-tasks' ? 'inbox' : selectedList;
                    setNewTaskList(targetListId);
                    setTaskDialogOpen(true);
                  }}
                  className="gap-2 bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                  {showShortcutsLearningMode && (
                    <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 border border-white/30 rounded">N</kbd>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusManageDialog(true)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Statuses
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportTasks}
                        className="w-8 h-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export Tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant={showShortcutsLearningMode ? 'default' : 'outline'}
                              size="sm"
                              className={`w-8 h-8 p-0 ${showShortcutsLearningMode ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            >
                              <Keyboard className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-2">
                              <button
                                onClick={() => {
                                  setShowShortcutsLearningMode(!showShortcutsLearningMode);
                                  toast.success(showShortcutsLearningMode ? 'Learning mode off' : 'Learning mode on');
                                }}
                                className="w-full flex items-center justify-between hover:bg-slate-50 rounded p-2 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Keyboard className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">Learning mode</span>
                                </div>
                                <div className={`h-7 px-3 text-xs rounded flex items-center ${showShortcutsLearningMode ? 'bg-emerald-600 text-white' : 'bg-violet-50 border border-violet-300 text-violet-700'}`}>
                                  {showShortcutsLearningMode ? 'On' : 'Off'}
                                </div>
                              </button>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowShortcutsDialog(true)}>
                              <List className="w-4 h-4 mr-2" />
                              View all shortcuts
                              <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">?</kbd>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Keyboard Shortcuts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* View Toggle Button */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')} className="h-auto">
                  <TabsList className="bg-slate-100 p-0.5 h-8">
                    <TabsTrigger value="kanban" className="gap-1.5 h-7 px-2.5 data-[state=active]:bg-white text-xs">
                      <FolderKanban className="w-3 h-3" />
                      Kanban
                    </TabsTrigger>
                    <TabsTrigger value="list" className="gap-1.5 h-7 px-2.5 data-[state=active]:bg-white text-xs">
                      <LayoutList className="w-3 h-3" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Active Filter Badges Row */}
            {activeFilterCount > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">Active filters:</span>
                  
                  {/* Included Assignee Filters */}
                  {includedAssignees.map(assignee => (
                    <Badge 
                      key={`assignee-include-${assignee}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                    >
                      <Users className="w-2.5 h-2.5" />
                      {getAssigneeName(assignee)}
                      <button
                        onClick={() => setIncludedAssignees(includedAssignees.filter(a => a !== assignee))}
                        className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Excluded Assignee Filters */}
                  {excludedAssignees.map(assignee => (
                    <Badge 
                      key={`assignee-exclude-${assignee}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      {getAssigneeName(assignee)}
                      <button
                        onClick={() => setExcludedAssignees(excludedAssignees.filter(a => a !== assignee))}
                        className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Included Client Filters */}
                  {includedClients.map(client => (
                    <Badge 
                      key={`client-include-${client}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                    >
                      <Building2 className="w-2.5 h-2.5" />
                      {client}
                      <button
                        onClick={() => setIncludedClients(includedClients.filter(c => c !== client))}
                        className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Excluded Client Filters */}
                  {excludedClients.map(client => (
                    <Badge 
                      key={`client-exclude-${client}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      {client}
                      <button
                        onClick={() => setExcludedClients(excludedClients.filter(c => c !== client))}
                        className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Included Status Filters */}
                  {includedStatuses.map(status => (
                    <Badge 
                      key={`status-include-${status}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {status}
                      <button
                        onClick={() => setIncludedStatuses(includedStatuses.filter(s => s !== status))}
                        className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Excluded Status Filters */}
                  {excludedStatuses.map(status => (
                    <Badge 
                      key={`status-exclude-${status}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      {status}
                      <button
                        onClick={() => setExcludedStatuses(excludedStatuses.filter(s => s !== status))}
                        className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Included Priority Filters */}
                  {includedPriorities.map(priority => (
                    <Badge 
                      key={`priority-include-${priority}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                    >
                      <Flag className="w-2.5 h-2.5" />
                      {priority}
                      <button
                        onClick={() => setIncludedPriorities(includedPriorities.filter(p => p !== priority))}
                        className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Excluded Priority Filters */}
                  {excludedPriorities.map(priority => (
                    <Badge 
                      key={`priority-exclude-${priority}`} 
                      variant="secondary" 
                      className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                    >
                      <Minus className="w-2.5 h-2.5" />
                      {priority}
                      <button
                        onClick={() => setExcludedPriorities(excludedPriorities.filter(p => p !== priority))}
                        className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}

                  {/* Included Task List Filters */}
                  {includedTaskListFilters.map(listId => {
                    const list = taskLists.find(l => l.id === listId);
                    return list ? (
                      <Badge 
                        key={`list-include-${listId}`} 
                        variant="secondary" 
                        className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                      >
                        <List className="w-2.5 h-2.5" />
                        {list.name}
                        <button
                          onClick={() => setIncludedTaskListFilters(includedTaskListFilters.filter(id => id !== listId))}
                          className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ) : null;
                  })}

                  {/* Excluded Task List Filters */}
                  {excludedTaskListFilters.map(listId => {
                    const list = taskLists.find(l => l.id === listId);
                    return list ? (
                      <Badge 
                        key={`list-exclude-${listId}`} 
                        variant="secondary" 
                        className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                      >
                        <Minus className="w-2.5 h-2.5" />
                        {list.name}
                        <button
                          onClick={() => setExcludedTaskListFilters(excludedTaskListFilters.filter(id => id !== listId))}
                          className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ) : null;
                  })}

                  {/* Clear All Filters Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 ml-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Table Header - Only show in list view */}
        {viewMode === 'list' && sortedAndFilteredTasks.length > 0 && (
        <Card className="border-slate-200">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center justify-center transition-all duration-200 ${!isMultiSelectMode ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`}>
                        <Checkbox
                          checked={isMultiSelectMode && sortedAndFilteredTasks.length > 0 && selectedTaskIds.length === sortedAndFilteredTasks.length}
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
                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Drag</span>
              </div>
              <div className="w-10 flex-shrink-0">
                {/* Timer column header */}
              </div>
              <div className="w-20 flex-shrink-0">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
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
        </Card>
        )}
        </div>
        {/* End Sticky Header Container */}

        {/* Bulk Action Bar */}
        {isMultiSelectMode && selectedTaskIds.length > 0 && (
          <Card className="border-violet-300 dark:border-violet-700 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 p-4 shadow-lg mb-6">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-violet-300 hover:bg-violet-100"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Move to List
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {taskLists.map((list) => {
                      const ListIcon = getListIcon(list.id);
                      return (
                        <DropdownMenuItem
                          key={list.id}
                          onClick={() => bulkMoveToList(list.id)}
                          className="gap-2"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${list.color} flex-shrink-0`} />
                          {ListIcon && <ListIcon className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{list.name}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {Object.values(taskListAssignments).filter(id => id === list.id).length}
                          </Badge>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  onClick={bulkCompleteSelected}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Filter Indicator Banner */}
        {showMyTasksOnly && (
          <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 mb-6">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-600 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-violet-900">Filtered View Active</div>
                  <div className="text-sm text-violet-700">Showing only tasks assigned to you ({currentUserId})</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMyTasksOnly(false)}
                className="gap-2 text-violet-700 hover:text-violet-900 hover:bg-violet-100"
              >
                <X className="w-4 h-4" />
                Clear Filter
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks List */}
        <Card className="border-slate-200">
          {/* Task Rows - List View */}
          {viewMode === 'list' ? (
          <div className="divide-y divide-slate-100 dark:divide-gray-700 overflow-x-auto min-w-0">
            {sortedAndFilteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                </div>
                <p className="text-slate-500 dark:text-gray-400">No tasks found</p>
              </div>
            ) : (
              sortedAndFilteredTasks.map((task) => {
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
                    completedDisplayMode={completedDisplayMode}
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
                            const updatedTask = {
                              ...task,
                              status: checked ? ('completed' as const) : ('to-do' as const),
                              completedAt: checked ? new Date().toISOString() : undefined
                            };
                            updateTask(updatedTask);
                          }}
                        />
                      )}
                    </div>

                    {/* Drag Handle */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center cursor-move">
                      <GripVertical className="w-4 h-4 text-slate-300 dark:text-gray-600 hover:text-slate-500 dark:hover:text-gray-400" />
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
                          <span className={task.status === 'completed' && (completedDisplayMode === 'inline' || completedDisplayMode === 'only') ? 'text-slate-600 line-through decoration-black/20 decoration-1' : 'group-hover:text-violet-700'}>
                            {taskListAssignments[task.id] === 'inbox' && (
                              <Inbox className="w-3.5 h-3.5 inline-block mr-1.5 text-slate-600" />
                            )}
                            {taskListAssignments[task.id] === 'callback' && (
                              <Phone className="w-3.5 h-3.5 inline-block mr-1.5 text-amber-600" />
                            )}
                            {task.emailId && (
                              <Mail className="w-3.5 h-3.5 inline-block mr-1.5 text-green-600" />
                            )}
                            {task.isRecurring && (
                              <Repeat className="w-3.5 h-3.5 inline-block mr-1.5 text-violet-600" />
                            )}
                            {task.name}
                          </span>
                        </button>
                        {task.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 px-2 ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
                        )}
                        {/* Inline Indicators */}
                        <div className="flex items-center gap-2 mt-2 px-2">
                          {task.emailId && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded-md transition-colors border border-green-200 hover:border-green-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewEmail(task.emailId!);
                                    }}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="font-medium">Email</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-medium">Click to open source email</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
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

                    {/* List Column (only for All Tasks and My Tasks views) */}
                    {showListColumn && (
                      <div className="w-32 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {editingTaskId === task.id && editingField === 'list' ? (
                          <Select
                            value={taskListAssignments[task.id] || 'inbox'}
                            onValueChange={(value) => {
                              setTaskListAssignments({ ...taskListAssignments, [task.id]: value });
                              toast.success('Task moved to list');
                              cancelEditing();
                            }}
                            onOpenChange={(open) => {
                              if (!open) cancelEditing();
                            }}
                            open={true}
                          >
                            <SelectTrigger className="h-7 text-sm border-violet-300 focus:ring-violet-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {taskLists.map((list) => {
                                const ListIcon = getListIcon(list.id);
                                return (
                                  <SelectItem key={list.id} value={list.id}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${list.color}`} />
                                      {ListIcon && <ListIcon className="w-3.5 h-3.5 text-slate-500" />}
                                      <span>{list.name}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <button
                            onClick={() => startEditing(task.id, 'list', taskListAssignments[task.id] || 'inbox')}
                            className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded transition-colors w-full"
                          >
                            <div className={`w-2 h-2 rounded-full ${getTaskListColor(task.id)}`} />
                            {(() => {
                              const listId = taskListAssignments[task.id] || 'inbox';
                              const ListIcon = getListIcon(listId);
                              return ListIcon ? <ListIcon className="w-3.5 h-3.5 text-slate-500" /> : null;
                            })()}
                            <span className="text-sm text-slate-600">{getTaskListName(task.id)}</span>
                          </button>
                        )}
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
                              {(() => {
                                const clientName = getClientName(task.projectId);
                                const clientData = mockClients.find(c => c.name === clientName);
                                if (!clientData || clientName === 'No Client') {
                                  return <p>No client assigned</p>;
                                }
                                return (
                                  <div className="space-y-1">
                                    <p className="font-medium">{clientData.name}</p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <Mail className="w-3 h-3" />
                                      <span>{clientData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <Phone className="w-3 h-3" />
                                      <span>{clientData.phone}</span>
                                    </div>
                                  </div>
                                );
                              })()}
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
                          {task.emailId && (
                              <>
                              <DropdownMenuItem onClick={() => {
                                handleViewEmail(task.emailId!);
                              }}>
                                <Mail className="w-4 h-4 mr-2" />
                                View Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedTask(task);
                            setTaskDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task)}
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
                          const subtaskPriorityStyle = getPriorityStyle(subtask.priority);
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
                                {subtask.description && (
                                  <p className="text-xs text-slate-500 mt-1">{subtask.description}</p>
                                )}
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
          ) : (
            <div className="p-6">
              <div className="flex gap-4 overflow-x-auto pb-4">
                {['To Do', 'In Progress'].concat(customStatuses.filter(s => s !== 'To Do' && s !== 'In Progress' && s !== 'Completed')).concat(['Completed']).map((status) => {
                  const statusTasks = sortedAndFilteredTasks.filter(task => {
                    if (status === 'To Do') return task.status === 'to-do' || task.status === 'To Do';
                    if (status === 'In Progress') return task.status === 'in-progress' || task.status === 'In Progress';
                    if (status === 'Completed') return task.status === 'completed' || task.status === 'Completed';
                    return task.status === status;
                  });
                  
                  const statusColor = statusColors[status] || 'bg-violet-500';
                  const isCustomColor = statusColor.startsWith('custom-');
                  
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
                        const task = tasks.find(t => t.id === taskId);
                        if (task) {
                          let newStatus = status;
                          if (status === 'To Do') newStatus = 'to-do';
                          else if (status === 'In Progress') newStatus = 'in-progress';
                          else if (status === 'Completed') newStatus = 'completed';
                          
                          updateTask({ ...task, status: newStatus });
                        }
                      }}
                    >
                      <div className="bg-slate-50 rounded-lg border border-slate-200 flex flex-col h-full max-h-[calc(100vh-400px)]">
                        <div className="p-4 border-b border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className={`w-3 h-3 rounded-full ${statusColor}`}
                              style={isCustomColor ? { backgroundColor: statusColor.replace('custom-', '') } : {}}
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
                                const priorityStyle = getPriorityStyle(task.priority);
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
                                        dragTaskIdRef.current = task.id;
                                      }}
                                      onDragEnd={(e) => {
                                        // Clear drag state after a short delay to let click handler check it
                                        setTimeout(() => {
                                          dragTaskIdRef.current = null;
                                        }, 50);
                                      }}
                                      onClick={(e) => {
                                        // Don't open dialog if we just dragged or if clicking interactive elements
                                        const target = e.target as HTMLElement;
                                        if (
                                          dragTaskIdRef.current === task.id ||
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
                                              updateTask(updatedTask);
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
                })}
              </div>
            </div>
          )}

          {/* Inline Quick Add Row */}
          {viewMode === 'list' && (
            !showQuickAdd ? (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="w-full flex items-center gap-4 px-6 py-3 border-t border-slate-200 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 hover:from-violet-50 hover:to-indigo-50 transition-all group"
            >
              <div className="w-12 flex-shrink-0" />
              <div className="w-8 flex-shrink-0" />
              <div className="w-10 flex-shrink-0" />
              <div className="w-20 flex-shrink-0" />
              <div className="flex items-center gap-2 text-sm text-violet-600 group-hover:text-violet-700">
                <Plus className="w-4 h-4" />
                <span className="font-medium">Quick Add Task</span>
                {showShortcutsLearningMode && (
                  <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-violet-100 border border-violet-300 rounded">Q</kbd>
                )}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 px-6 py-4 border-t-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50">
              {/* Checkbox placeholder */}
              <div className="w-12 flex-shrink-0" />
              
              {/* Drag placeholder */}
              <div className="w-8 flex-shrink-0" />
              
              {/* Timer placeholder */}
              <div className="w-10 flex-shrink-0" />
              
              {/* Assignee */}
              <div className="w-20 flex-shrink-0">
                <Select value={quickAddAssignee} onValueChange={setQuickAddAssignee}>
                  <SelectTrigger className="h-9 bg-white border-violet-200 focus:border-violet-400">
                    <SelectValue placeholder="Assign">
                      {quickAddAssignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                              {quickAddAssignee}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Assign</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allAssignees.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                              {getAssigneeName(assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getAssigneeName(assignee)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Task Name */}
              <div className={showListColumn ? "flex-1 min-w-[250px]" : "flex-1 min-w-[300px]"}>
                <Input
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="Task name..."
                  className="bg-white border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createQuickTask();
                    } else if (e.key === 'Escape') {
                      setShowQuickAdd(false);
                      setQuickAddName('');
                      setQuickAddAssignee(currentUserId);
                      setQuickAddClient('');
                      setQuickAddDueDate(undefined);
                    }
                  }}
                />
              </div>
              
              {/* List (if shown) */}
              {showListColumn && (
                <div className="w-32 flex-shrink-0">
                  <Badge className={`${getSelectedListInfo().colorLight} border-violet-200`}>
                    {getSelectedListInfo().name}
                  </Badge>
                </div>
              )}
              
              {/* Client */}
              <div className="w-40 flex-shrink-0">
                <Select value={quickAddClient} onValueChange={setQuickAddClient}>
                  <SelectTrigger className="h-9 bg-white border-violet-200 focus:border-violet-400">
                    <SelectValue placeholder="Client">
                      {quickAddClient ? (
                        <div className="flex items-center gap-2">
                          {allClients.find(c => c.name === quickAddClient)?.type === 'business' ? (
                            <Building2 className="w-3.5 h-3.5 text-violet-600" />
                          ) : (
                            <UserCircle className="w-3.5 h-3.5 text-violet-600" />
                          )}
                          <span className="truncate text-xs">{quickAddClient}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Client</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allClients.map(client => (
                      <SelectItem key={client.name} value={client.name}>
                        <div className="flex items-center gap-2">
                          {client.type === 'business' ? (
                            <Building2 className="w-3.5 h-3.5 text-violet-600" />
                          ) : (
                            <UserCircle className="w-3.5 h-3.5 text-violet-600" />
                          )}
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status - fixed */}
              <div className="w-32 flex-shrink-0">
                <Badge className="bg-slate-50 text-slate-600 border-slate-200">
                  To Do
                </Badge>
              </div>
              
              {/* Priority - fixed */}
              <div className="w-28 flex-shrink-0">
                <Badge className="bg-amber-50 text-amber-600 border-amber-200">
                  Medium
                </Badge>
              </div>
              
              {/* Due Date */}
              <div className="w-32 flex-shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-full justify-start text-left bg-white border-violet-200 hover:border-violet-400"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 mr-2 text-violet-600" />
                      <span className="text-xs">
                        {quickAddDueDate ? format(quickAddDueDate, 'MMM dd') : 'Due date'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={quickAddDueDate}
                      onSelect={setQuickAddDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Actions */}
              <div className="w-12 flex-shrink-0 flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={createQuickTask}
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Save (Enter)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowQuickAdd(false);
                          setQuickAddName('');
                          setQuickAddAssignee(currentUserId);
                          setQuickAddClient('');
                          setQuickAddDueDate(undefined);
                        }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Cancel (Esc)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )
          )}
        </Card>
      </div>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onTaskUpdate={(updatedTask) => {
            updateTask(updatedTask);
            setSelectedTask(updatedTask); // Update local state to reflect changes
          }}
          taskLists={taskLists}
          currentListId={taskListAssignments[selectedTask.id]}
          onListChange={(taskId, listId) => {
            setTaskListAssignments({ ...taskListAssignments, [taskId]: listId });
          }}
        />
      )}

      {/* New Task Dialog - Simple */}
      {!selectedTask && !showComprehensiveNewTask && isAddingNewTask && (
        <Dialog open={taskDialogOpen} onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setIsAddingNewTask(false);
            setShowComprehensiveNewTask(false);
          }
        }}>
          <DialogContent className="max-w-2xl" aria-describedby="create-task-description">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription id="create-task-description">
                Add a new task to your workflow
              </DialogDescription>
            </DialogHeader>
            
            {/* List Selector */}
            <div className="space-y-2">
              <Label htmlFor="task-list">Add to List</Label>
              <Select value={newTaskList} onValueChange={setNewTaskList}>
                <SelectTrigger id="task-list">
                  <SelectValue placeholder="Select list">
                    {(() => {
                      const selectedListObj = taskLists.find(l => l.id === newTaskList);
                      return selectedListObj ? (
                        <div className="flex items-center gap-2">
                          <ListTodo className="w-4 h-4" />
                          {renderListBadge(selectedListObj.color, selectedListObj.name)}
                        </div>
                      ) : 'Select list';
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {taskLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4" />
                        {renderListBadge(list.color, list.name)}
                        <span className="text-xs text-slate-500">({list.taskCount})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      createNewTask();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Select assignee">
                      {newTaskAssignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                              {newTaskAssignee}
                            </AvatarFallback>
                          </Avatar>
                          <span>{newTaskAssignee}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                              {assignee}
                            </AvatarFallback>
                          </Avatar>
                          <span>{assignee}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-priority">Priority (optional)</Label>
                  {newTaskPriority && (
                    <button
                      type="button"
                      onClick={() => setNewTaskPriority(undefined)}
                      className="text-xs text-slate-500 hover:text-slate-700 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'low' as const, color: { border: 'border-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' } },
                    { value: 'medium' as const, color: { border: 'border-amber-500', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' } },
                    { value: 'high' as const, color: { border: 'border-red-500', bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700' } }
                  ].map((priority) => {
                    const isSelected = newTaskPriority === priority.value;
                    return (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setNewTaskPriority(isSelected ? undefined : priority.value)}
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
              
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (optional)</Label>
                <Textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="task-due-date"
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDueDate ? format(newTaskDueDate, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-client">Client (optional)</Label>
                <Select value={newTaskClient} onValueChange={setNewTaskClient}>
                  <SelectTrigger id="task-client">
                    <SelectValue placeholder="Select client">
                      {newTaskClient && (() => {
                        const selectedClient = mockClients.find(c => c.name === newTaskClient);
                        return selectedClient ? (
                          <div className="flex items-center gap-2">
                            {selectedClient.type === 'business' ? (
                              <Building2 className="w-4 h-4 text-slate-500" />
                            ) : (
                              <UserCircle className="w-4 h-4 text-slate-500" />
                            )}
                            <span>{selectedClient.name}</span>
                          </div>
                        ) : newTaskClient;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.name} value={client.name}>
                        <div className="flex items-center gap-2">
                          {client.type === 'business' ? (
                            <Building2 className="w-4 h-4 text-slate-500" />
                          ) : (
                            <UserCircle className="w-4 h-4 text-slate-500" />
                          )}
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Preserve filled data, just show comprehensive view
                  setShowComprehensiveNewTask(true);
                }}
                className="mr-auto gap-2 border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800 hover:border-violet-400 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                More Options
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setTaskDialogOpen(false);
                  setIsAddingNewTask(false);
                  setNewTaskName('');
                  setNewTaskDescription('');
                  setNewTaskAssignee('');
                  setNewTaskPriority(undefined);
                  setNewTaskDueDate(undefined);
                  setNewTaskClient('');
                  setNewTaskList('');
                }}>
                  Cancel
                </Button>
                <Button onClick={createNewTask}>
                  Create Task
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Task Dialog - Comprehensive */}
      {!selectedTask && showComprehensiveNewTask && isAddingNewTask && (() => {
        // Create a temporary task object from form data
        const tempTask: ProjectTask = {
          id: 'temp-new-task',
          name: newTaskName || 'New Task',
          description: newTaskDescription,
          status: 'in-progress' as const,
          priority: newTaskPriority,
          assignee: newTaskAssignee,
          client: newTaskClient,
          dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : new Date().toISOString(),
          automations: 0,
          dependencies: [],
          completedAt: undefined,
          project: projects[0]?.id || '',
        };

        return (
          <TaskDetailDialog
            task={tempTask}
            open={taskDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                // When closing from comprehensive view, create the task
                if (newTaskName.trim()) {
                  createNewTask();
                }
                setIsAddingNewTask(false);
                setShowComprehensiveNewTask(false);
              }
              setTaskDialogOpen(open);
            }}
            onTaskUpdate={(updatedTask) => {
              // Update form data when task is modified in comprehensive view
              setNewTaskName(updatedTask.name);
              setNewTaskDescription(updatedTask.description || '');
              setNewTaskAssignee(updatedTask.assignee || '');
              setNewTaskPriority(updatedTask.priority);
              setNewTaskClient(updatedTask.client || '');
              if (updatedTask.dueDate) {
                setNewTaskDueDate(new Date(updatedTask.dueDate));
              }
            }}
            taskLists={taskLists}
            currentListId={newTaskList}
            onListChange={(taskId, listId) => {
              setNewTaskList(listId);
            }}
            mode="create"
            onBackToSimple={() => {
              setShowComprehensiveNewTask(false);
            }}
          />
        );
      })()}

      {/* Add/Edit List Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent aria-describedby="list-dialog-description">
          <DialogHeader>
            <DialogTitle>{editingList ? 'Edit List' : 'Create New List'}</DialogTitle>
            <DialogDescription id="list-dialog-description">
              {editingList ? 'Update the list name and color' : 'Create a new task list to organize your work'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>List Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setListColor(color);
                      setShowCustomColorPicker(false);
                    }}
                    className={`
                      w-8 h-8 rounded-full ${color} transition-all
                      ${listColor === color && !showCustomColorPicker ? 'ring-2 ring-offset-2 ring-violet-600 scale-110' : 'hover:scale-105'}
                    `}
                  />
                ))}
                {/* Custom Color Button */}
                <button
                  onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                  className={`
                    w-8 h-8 rounded-full border-2 border-dashed border-slate-300 hover:border-violet-400 transition-all flex items-center justify-center
                    ${showCustomColorPicker ? 'ring-2 ring-offset-2 ring-violet-600 scale-110 border-violet-400' : 'hover:scale-105'}
                  `}
                  style={showCustomColorPicker ? { backgroundColor: customColorHex } : {}}
                >
                  {!showCustomColorPicker && <Plus className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              
              {/* Custom Color Picker */}
              {showCustomColorPicker && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <Label className="text-xs">Custom Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => {
                        setCustomColorHex(e.target.value);
                        setListColor(`custom-${e.target.value}`);
                      }}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={customColorHex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(hex) || hex.startsWith('#')) {
                          setCustomColorHex(hex);
                          if (/^#[0-9A-F]{6}$/i.test(hex)) {
                            setListColor(`custom-${hex}`);
                          }
                        }
                      }}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {!editingList && !showSharingSection && (
              <div className="pt-2 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="w-full border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-800 border-2"
                  onClick={() => setShowSharingSection(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share with Team
                  {newListSharedWith.length > 0 && (
                    <Badge className="ml-2 bg-violet-600 text-white">
                      {newListSharedWith.length}
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            {!editingList && showSharingSection && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-600" />
                    Share with Team
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {newListSharedWith.length} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSharingSection(false)}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Choose team members who can view and manage tasks in this list
                </p>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {['SM', 'AK', 'TC', 'AB'].map((userId) => {
                    const isShared = newListSharedWith.includes(userId);
                    return (
                      <div 
                        key={userId} 
                        className={`flex items-center justify-between p-2 border-2 rounded-lg transition-colors cursor-pointer ${
                          isShared 
                            ? 'bg-violet-50 border-violet-300 hover:bg-violet-100' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => toggleNewListUserShare(userId)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                              {userId}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{userId}</p>
                            <p className="text-xs text-slate-500">Team Member</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={isShared}
                          onCheckedChange={() => toggleNewListUserShare(userId)}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> You'll always have access to this list. You can modify sharing later from the list menu.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTaskList}>
              {editingList ? 'Update List' : 'Create List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share List Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent aria-describedby="share-list-description">
          <DialogHeader>
            <DialogTitle>Share "{sharingList?.name}"</DialogTitle>
            <DialogDescription id="share-list-description">
              Choose who can view and manage tasks in this list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {['JD', 'SM', 'AK', 'TC', 'AB'].map((userId) => {
              const isShared = sharingList?.sharedWith?.includes(userId) || false;
              return (
                <div key={userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-violet-100 text-violet-700">
                        {userId}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userId}</p>
                      <p className="text-xs text-slate-500">Team Member</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={isShared}
                    onCheckedChange={() => toggleUserShare(userId)}
                  />
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowShareDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="shortcuts-description">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription id="shortcuts-description">
              Speed up your workflow with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Pattern Explanation */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-violet-900 mb-3 flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Shortcut Pattern
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-3 border border-violet-200">
                  <div className="flex items-center gap-2 mb-1">
                    <kbd className="px-2 py-1 text-xs bg-violet-100 border border-violet-300 rounded font-mono">⌘/Ctrl</kbd>
                    <span className="text-violet-700 font-medium">+ Key</span>
                  </div>
                  <p className="text-xs text-slate-600">Left sidebar navigation (task lists)</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-1">
                    <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">Shift</kbd>
                    <span className="text-indigo-700 font-medium">+ Key</span>
                  </div>
                  <p className="text-xs text-slate-600">Filter row controls (time & display)</p>
                </div>
              </div>
            </div>

            {/* Left Sidebar - Ctrl/Cmd Shortcuts */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
                <List className="w-4 h-4 text-violet-600" />
                Left Sidebar (⌘/Ctrl)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-violet-50">
                  <span className="text-sm text-slate-700">Go to Inbox</span>
                  <kbd className="px-2 py-1 text-xs bg-violet-100 border border-violet-300 rounded font-mono">⌘ I</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-violet-50">
                  <span className="text-sm text-slate-700">Go to Callback</span>
                  <kbd className="px-2 py-1 text-xs bg-violet-100 border border-violet-300 rounded font-mono">⌘ C</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-violet-50">
                  <span className="text-sm text-slate-700">All Tasks View</span>
                  <kbd className="px-2 py-1 text-xs bg-violet-100 border border-violet-300 rounded font-mono">⌘ A</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-violet-50">
                  <span className="text-sm text-slate-700">My Tasks View</span>
                  <kbd className="px-2 py-1 text-xs bg-violet-100 border border-violet-300 rounded font-mono">⌘ M</kbd>
                </div>
              </div>
            </div>

            {/* Filter Row - Shift Shortcuts */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter Row (Shift)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">All Tasks (time filter)</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ A</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">Today</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ T</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">This Week</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ W</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">This Month</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ M</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">Overdue</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ O</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">Show/Hide Completed</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ S</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50">
                  <span className="text-sm text-slate-700">Toggle Filters Panel</span>
                  <kbd className="px-2 py-1 text-xs bg-indigo-100 border border-indigo-300 rounded font-mono">⇧ F</kbd>
                </div>
              </div>
            </div>

            {/* General Actions */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-slate-600" />
                General Actions
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">New Task (Full Dialog)</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">N</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Quick Add Task (Inline)</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">Q</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Search Tasks</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">S</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Select All Tasks</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">⌘ ⇧ A</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Show Shortcuts</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">?</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Dismiss / Cancel</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-300 rounded font-mono">Esc</kbd>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Tip:</span> Use Ctrl instead of ⌘ on Windows/Linux. Enable <span className="font-semibold text-emerald-700">"Learn"</span> mode to see shortcuts next to buttons while you work.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Management Dialog */}
      <Dialog open={showStatusManageDialog} onOpenChange={setShowStatusManageDialog}>
        <DialogContent className="max-w-lg" aria-describedby="status-manage-description">
          <DialogHeader>
            <DialogTitle>Manage Task Statuses</DialogTitle>
            <DialogDescription id="status-manage-description">
              Add, edit, and organize your custom status options. Click on any status to edit it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Existing Statuses */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm text-slate-600">Current Statuses</div>
                <Badge variant="secondary" className="text-xs">
                  {customStatuses.length} total
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {customStatuses.map((status, index) => (
                  <div 
                    key={`${status}-${index}`}
                    id={`status-row-${index}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedStatusIndex !== null && draggedStatusIndex !== index) {
                        setDragOverIndex(index);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedStatusIndex !== null && draggedStatusIndex !== index) {
                        handleStatusReorder(draggedStatusIndex, index);
                      }
                      setDraggedStatusIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragLeave={() => {
                      setDragOverIndex(null);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg border bg-white transition-all group ${
                      draggedStatusIndex === index 
                        ? 'opacity-40 border-violet-300' 
                        : dragOverIndex === index && draggedStatusIndex !== null
                        ? 'border-violet-400 border-2 bg-violet-50'
                        : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'
                    }`}
                  >
                    <div 
                      draggable={true}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedStatusIndex(index);
                        if (e.dataTransfer) {
                          e.dataTransfer.effectAllowed = 'move';
                          // Set custom drag image to the entire row
                          const draggedElement = document.getElementById(`status-row-${index}`);
                          if (draggedElement) {
                            e.dataTransfer.setDragImage(draggedElement, 20, 20);
                          }
                        }
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        setDraggedStatusIndex(null);
                        setDragOverIndex(null);
                      }}
                      className="cursor-grab active:cursor-grabbing flex-shrink-0 p-1"
                    >
                      <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>
                    {/* Color Indicator */}
                    <Popover open={editingStatusColor === status} onOpenChange={(open) => {
                      if (!open) setEditingStatusColor(null);
                    }}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStatusColor(status);
                            setTempStatusColor(statusColors[status] || 'bg-violet-500');
                            setShowStatusCustomColorPicker(false);
                          }}
                          className={`w-6 h-6 rounded flex-shrink-0 ${statusColors[status] || 'bg-violet-500'} hover:ring-2 hover:ring-violet-400 hover:ring-offset-1 transition-all`}
                          style={
                            statusColors[status]?.startsWith('custom-') 
                              ? { backgroundColor: statusColors[status].replace('custom-', '') }
                              : {}
                          }
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-64" side="left">
                        <div className="space-y-3">
                          <div className="text-sm">Status Color</div>
                          <div className="flex gap-2 flex-wrap">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  setStatusColors({ ...statusColors, [status]: color });
                                  setTempStatusColor(color);
                                  setShowStatusCustomColorPicker(false);
                                }}
                                className={`
                                  w-6 h-6 rounded ${color} transition-all
                                  ${tempStatusColor === color && !showStatusCustomColorPicker ? 'ring-2 ring-offset-1 ring-violet-600 scale-110' : 'hover:scale-105'}
                                `}
                              />
                            ))}
                            <button
                              onClick={() => setShowStatusCustomColorPicker(!showStatusCustomColorPicker)}
                              className={`
                                w-6 h-6 rounded border-2 border-dashed border-slate-300 hover:border-violet-400 transition-all flex items-center justify-center
                                ${showStatusCustomColorPicker ? 'ring-2 ring-offset-1 ring-violet-600 scale-110 border-violet-400' : 'hover:scale-105'}
                              `}
                              style={showStatusCustomColorPicker ? { backgroundColor: tempCustomColorHex } : {}}
                            >
                              {!showStatusCustomColorPicker && <Plus className="w-3 h-3 text-slate-400" />}
                            </button>
                          </div>
                          {showStatusCustomColorPicker && (
                            <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-2">
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="color"
                                  value={tempCustomColorHex}
                                  onChange={(e) => {
                                    setTempCustomColorHex(e.target.value);
                                    setStatusColors({ ...statusColors, [status]: `custom-${e.target.value}` });
                                  }}
                                  className="w-12 h-8 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={tempCustomColorHex}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    if (hex.startsWith('#')) {
                                      setTempCustomColorHex(hex);
                                      if (/^#[0-9A-F]{6}$/i.test(hex)) {
                                        setStatusColors({ ...statusColors, [status]: `custom-${hex}` });
                                      }
                                    }
                                  }}
                                  placeholder="#8b5cf6"
                                  className="flex-1 h-8 text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Input
                      value={status}
                      onChange={(e) => {
                        const newStatuses = [...customStatuses];
                        newStatuses[index] = e.target.value;
                        setCustomStatuses(newStatuses);
                      }}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      id={`status-input-${index}`}
                      className="flex-1 h-9 text-sm border-0 bg-transparent focus:bg-white focus:border-violet-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (customStatuses.length > 1) {
                          setCustomStatuses(customStatuses.filter((_, i) => i !== index));
                          toast.success('Status deleted');
                        } else {
                          toast.error('At least one status is required');
                        }
                      }}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Add New Status Button */}
            <div className="border-t border-slate-200 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCustomStatuses([...customStatuses, 'New Status']);
                  toast.success('Status added');
                  // Focus on the newly added input after state updates
                  setTimeout(() => {
                    const newInput = document.getElementById(`status-input-${customStatuses.length}`);
                    if (newInput) {
                      newInput.focus();
                      (newInput as HTMLInputElement).select();
                    }
                  }, 50);
                }}
                className="w-full gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <Plus className="w-4 h-4" />
                Add New Status
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowStatusManageDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Timer Widget */}
      {activeTimer && (() => {
        const timerTask = tasks.find(t => t.id === activeTimer.taskId);
        const timerProject = timerTask ? projects.find(p => p.id === timerTask.projectId) : null;
        
        if (timerTask && timerProject) {
          return (
            <FloatingTimerWidget
              task={timerTask}
              project={timerProject}
              onClose={() => {
                const duration = stopTimer();
                const minutes = Math.floor(duration / 60);
                toast.success(`Timer stopped. ${minutes} minute${minutes !== 1 ? 's' : ''} tracked.`);
              }}
            />
          );
        }
        return null;
      })()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timer Confirmation Dialog */}
      <AlertDialog open={showTimerConfirmation} onOpenChange={setShowTimerConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              Switch Timer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You currently have a timer running for "{tasks.find(t => t.id === activeTimer?.taskId)?.name}". 
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
            <AlertDialogAction onClick={confirmStartTimer} className="bg-violet-600 hover:bg-violet-700">
              Switch Timer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Viewer Modal */}
      <Dialog open={showEmailViewer} onOpenChange={setShowEmailViewer}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
          <DialogTitle className="sr-only">
            {selectedEmail?.subject || 'Email Preview'}
          </DialogTitle>
          {selectedEmail && (
            <div className="flex flex-col h-full">
              {/* Email Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-10 flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedEmail.subject}
                      </h2>
                      {selectedEmail.isSecure && (
                        <Badge 
                          className="gap-1.5 px-2.5 py-1 bg-green-600 hover:bg-green-700 border-green-600"
                        >
                          <Shield className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-medium text-white">Secure</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <div 
                            className="w-full h-full flex items-center justify-center text-white text-xs font-medium rounded-full"
                            style={{ backgroundColor: 'var(--primaryColor)' }}
                          >
                            {selectedEmail.from.avatar || selectedEmail.from.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedEmail.from.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEmail.from.email}</p>
                        </div>
                      </div>
                      <span>•</span>
                      <span>{format(new Date(selectedEmail.date), 'MMM d, yyyy · h:mm a')}</span>
                    </div>

                    {selectedEmail.to && selectedEmail.to.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">To:</span> {selectedEmail.to.join(', ')}
                      </div>
                    )}

                    {selectedEmail.status && selectedEmail.status !== 'draft' && (
                      <div className="mt-2 flex items-center gap-2">
                        {selectedEmail.status === 'delivered' && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Check className="w-3 h-3" />
                            Delivered
                          </Badge>
                        )}
                        {selectedEmail.status === 'opened' && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Check className="w-3 h-3 text-green-600" />
                            Opened
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <ScrollArea className="flex-1 p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                    {selectedEmail.body}
                  </pre>
                </div>

                {/* Attachments */}
                {selectedEmail.hasAttachments && selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Attachments ({selectedEmail.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="relative p-3 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all group cursor-pointer hover:border-purple-300 dark:hover:border-purple-700"
                          onClick={() => {
                            toast.success(`Downloaded ${attachment.name}`);
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                              <Paperclip className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="flex items-center gap-2 pointer-events-none"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Footer with action button */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email Preview
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Store email ID to navigate to
                      localStorage.setItem('navigateToEmailId', selectedEmail.id);
                      // Navigate to email page
                      navigate('/email');
                      // Close modal
                      setShowEmailViewer(false);
                    }}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Open Full Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AllTasksView(props: AllTasksViewProps) {
  return <AllTasksViewContent {...props} />;
}