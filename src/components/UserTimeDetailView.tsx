import { useState, useMemo } from 'react';
import { useWorkflowContext } from './WorkflowContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval, getDay, addDays, isSameMonth } from 'date-fns@3.6.0';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Clock, Save, X, Calendar, ChevronLeft, ChevronRight, ArrowLeft, User, Target, DollarSign, TrendingUp, ChevronDown, ChevronUp, Plus, Edit2, Trash2, AlertTriangle, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { TimeEntryPopupContent } from './TimeEntryPopupContent';

interface UserTimeDetailViewProps {
  userName: string;
  initialWeekStart: Date;
  onBack: () => void;
}

interface TimeEntry {
  id: string;
  taskId: string;
  taskName: string;
  projectName: string;
  projectId?: string;
  clientName: string;
  duration: number;
  isBillable: boolean;
  isUncategorized?: boolean;
  notes?: string;
}

interface DayHours {
  date: Date;
  billableHours: number;
  nonBillableHours: number;
  totalHours: number;
  entries: TimeEntry[];
}

type ViewMode = 'weekly' | 'monthly';
type MonthDetailMode = 'week' | 'day';

interface AssignmentPopupState {
  open: boolean;
  dateKey: string;
  deltaHours: number;
  mode: 'add' | 'reduce';
  existingEntries: TimeEntry[];
}

interface EditingEntryState {
  entryId: string;
  field: 'hours' | 'notes' | 'client' | 'project';
  value: any;
  originalValue: any;
}

export function UserTimeDetailView({ userName, initialWeekStart, onBack }: UserTimeDetailViewProps) {
  const { tasks, timerEntries, userProfiles, projects } = useWorkflowContext();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [monthDetailMode, setMonthDetailMode] = useState<MonthDetailMode>('day');
  const [selectedUser, setSelectedUser] = useState(userName);
  const [editedHours, setEditedHours] = useState<Map<string, number>>(new Map());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showBillableOnly, setShowBillableOnly] = useState(false);
  const [assignmentPopup, setAssignmentPopup] = useState<AssignmentPopupState>({
    open: false,
    dateKey: '',
    deltaHours: 0,
    mode: 'add',
    existingEntries: []
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });
  const [addTimePopup, setAddTimePopup] = useState<{ open: boolean; dateKey: string }>({
    open: false,
    dateKey: ''
  });
  const [editTimePopup, setEditTimePopup] = useState<{ 
    open: boolean; 
    entry: TimeEntry | null;
    dateKey: string;
    originalClient: string;
    originalProject: string;
  }>({
    open: false,
    entry: null,
    dateKey: '',
    originalClient: '',
    originalProject: ''
  });
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    hours: 0,
    selectedClient: '',
    selectedProject: '',
    selectedTask: '',
    notes: '',
    isUncategorized: false
  });

  // Get all team members
  const teamMembers = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.assignee))).sort();
  }, [tasks]);

  // Get user profile
  const userProfile = useMemo(() => {
    return userProfiles.find(u => u.name === selectedUser);
  }, [userProfiles, selectedUser]);

  // Get unique clients
  const uniqueClients = useMemo(() => {
    const clientSet = new Set<string>();
    projects.forEach(p => {
      if (p.clientName) clientSet.add(p.clientName);
    });
    return Array.from(clientSet).sort();
  }, [projects]);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  // For monthly view
  const monthStart = startOfMonth(currentWeekStart);
  const monthEnd = endOfMonth(currentWeekStart);
  const weeksInMonth = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  // Calculate hours by day for weekly view
  const hoursByDay = useMemo(() => {
    const dayMap = new Map<string, DayHours>();

    // Initialize all days
    daysInWeek.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dayMap.set(dateKey, {
        date,
        billableHours: 0,
        nonBillableHours: 0,
        totalHours: 0,
        entries: []
      });
    });

    // Process timer entries
    timerEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task || task.assignee !== selectedUser || !entry.duration) return;

      const entryDate = new Date(entry.startTime);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      
      // Check if entry is within the week
      if (!dayMap.has(dateKey)) return;

      const dayData = dayMap.get(dateKey)!;
      const hours = entry.duration / 3600;
      const isBillable = task.status === 'completed';
      const project = projects.find(p => p.id === task.projectId);
      const clientName = project?.clientName || '';
      const isUncategorized = task.projectId === 'uncat-project' || !clientName;

      dayData.entries.push({
        id: entry.id,
        taskId: entry.taskId,
        taskName: task.name,
        projectName: project?.name || '',
        projectId: task.projectId,
        clientName: clientName,
        duration: entry.duration,
        isBillable,
        isUncategorized
      });

      if (isBillable) {
        dayData.billableHours += hours;
      } else {
        dayData.nonBillableHours += hours;
      }
      dayData.totalHours += hours;
    });

    return dayMap;
  }, [timerEntries, tasks, selectedUser, daysInWeek, projects]);

  // Calculate hours by day for monthly calendar view
  const hoursByDayMonth = useMemo(() => {
    const dayMap = new Map<string, DayHours>();

    // Get all days in the month
    const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Initialize all days
    allDaysInMonth.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dayMap.set(dateKey, {
        date,
        billableHours: 0,
        nonBillableHours: 0,
        totalHours: 0,
        entries: []
      });
    });

    // Process timer entries
    timerEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task || task.assignee !== selectedUser || !entry.duration) return;

      const entryDate = new Date(entry.startTime);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      
      // Check if entry is within the month
      if (!dayMap.has(dateKey)) return;

      const dayData = dayMap.get(dateKey)!;
      const hours = entry.duration / 3600;
      const isBillable = task.status === 'completed';
      const project = projects.find(p => p.id === task.projectId);
      const clientName = project?.clientName || '';
      const isUncategorized = task.projectId === 'uncat-project' || !clientName;

      dayData.entries.push({
        id: entry.id,
        taskId: entry.taskId,
        taskName: task.name,
        projectName: project?.name || '',
        projectId: task.projectId,
        clientName: clientName,
        duration: entry.duration,
        isBillable,
        isUncategorized
      });

      if (isBillable) {
        dayData.billableHours += hours;
      } else {
        dayData.nonBillableHours += hours;
      }
      dayData.totalHours += hours;
    });

    return dayMap;
  }, [timerEntries, tasks, selectedUser, monthStart, monthEnd, projects]);

  // Generate calendar grid for month view
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = monthStart;
    const lastDayOfMonth = monthEnd;
    
    // Get the start of the week for the first day of the month
    const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    
    // Get the end of the week for the last day of the month
    const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
    
    // Get all days in the calendar grid
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Group into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    
    return weeks;
  }, [monthStart, monthEnd]);

  // Calculate hours by week for monthly view
  const hoursByWeek = useMemo(() => {
    const weekMap = new Map<string, { billable: number; nonBillable: number; total: number }>();

    weeksInMonth.forEach(weekStartDate => {
      const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
      
      let billable = 0;
      let nonBillable = 0;
      
      daysInWeek.forEach(date => {
        timerEntries.forEach(entry => {
          const task = tasks.find(t => t.id === entry.taskId);
          if (!task || task.assignee !== selectedUser || !entry.duration) return;

          const entryDate = new Date(entry.startTime);
          if (isSameDay(entryDate, date)) {
            const hours = entry.duration / 3600;
            const isBillable = task.status === 'completed';
            
            if (isBillable) {
              billable += hours;
            } else {
              nonBillable += hours;
            }
          }
        });
      });

      weekMap.set(format(weekStartDate, 'yyyy-MM-dd'), {
        billable,
        nonBillable,
        total: billable + nonBillable
      });
    });

    return weekMap;
  }, [timerEntries, tasks, selectedUser, weeksInMonth]);

  // Get edited or actual hours
  const getDisplayHours = (dateKey: string, field: 'billable' | 'nonBillable' | 'total') => {
    const editKey = `${dateKey}-${field}`;
    if (editedHours.has(editKey)) {
      return editedHours.get(editKey)!;
    }
    const dayData = hoursByDay.get(dateKey);
    if (!dayData) return 0;
    
    switch (field) {
      case 'billable': return dayData.billableHours;
      case 'nonBillable': return dayData.nonBillableHours;
      case 'total': return dayData.totalHours;
    }
  };

  const handleHoursChange = (dateKey: string, field: 'billable' | 'nonBillable', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    // Only show popup for billable hours changes
    if (field === 'billable') {
      const currentValue = getDisplayHours(dateKey, 'billable');
      const delta = numValue - currentValue;
      
      if (Math.abs(delta) > 0.01) { // Ignore tiny changes
        const dayData = hoursByDay.get(dateKey);
        const existingEntries = dayData?.entries.filter(e => e.isBillable) || [];
        
        setAssignmentPopup({
          open: true,
          dateKey,
          deltaHours: delta,
          mode: delta > 0 ? 'add' : 'reduce',
          existingEntries
        });
        
        setAssignmentForm({
          hours: Math.abs(delta),
          selectedClient: '',
          selectedProject: '',
          selectedTask: '',
          notes: '',
          isUncategorized: false
        });
      }
    }
    
    const editKey = `${dateKey}-${field}`;
    const newEditedHours = new Map(editedHours);
    newEditedHours.set(editKey, numValue);
    setEditedHours(newEditedHours);
  };

  const handleAssignmentSubmit = () => {
    if (assignmentPopup.mode === 'add') {
      if (!assignmentForm.isUncategorized && !assignmentForm.selectedClient) {
        toast.error('Please select a client or mark as uncategorized');
        return;
      }
      
      // Create new time entry
      const newEntry: TimeEntry = {
        id: `entry-${Date.now()}`,
        taskId: assignmentForm.selectedTask || `task-${Date.now()}`,
        taskName: assignmentForm.selectedTask ? tasks.find(t => t.id === assignmentForm.selectedTask)?.name || 'New Task' : 'General Work',
        projectName: assignmentForm.selectedProject ? projects.find(p => p.id === assignmentForm.selectedProject)?.name || '' : '',
        projectId: assignmentForm.selectedProject,
        clientName: assignmentForm.selectedClient,
        duration: assignmentForm.hours * 3600,
        isBillable: true,
        isUncategorized: assignmentForm.isUncategorized,
        notes: assignmentForm.notes
      };
      
      // Add entry to the day
      const dayData = hoursByDay.get(assignmentPopup.dateKey);
      if (dayData) {
        dayData.entries.push(newEntry);
      }
      
      toast.success(`Added ${assignmentForm.hours}h ${assignmentForm.isUncategorized ? 'as uncategorized' : `to ${assignmentForm.selectedClient}`}`);
    } else {
      // Reduce mode - user should select which entries to reduce
      toast.success(`Reduced ${Math.abs(assignmentPopup.deltaHours)}h from billable time`);
    }
    
    setAssignmentPopup({ ...assignmentPopup, open: false });
  };

  const handleSave = () => {
    toast.success('Hours updated successfully');
    setEditedHours(new Map());
  };

  const handleCancel = () => {
    setEditedHours(new Map());
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  // Calculate week totals
  const weekTotal = useMemo(() => {
    let totalBillable = 0;
    let totalNonBillable = 0;
    
    daysInWeek.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      totalBillable += getDisplayHours(dateKey, 'billable');
      totalNonBillable += getDisplayHours(dateKey, 'nonBillable');
    });

    return {
      billable: totalBillable,
      nonBillable: totalNonBillable,
      total: totalBillable + totalNonBillable
    };
  }, [daysInWeek, editedHours, hoursByDay]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const availableHours = userProfile ? userProfile.hoursPerWeek : 40;
    const utilizationRate = availableHours > 0 ? (weekTotal.billable / availableHours) * 100 : 0;
    const billablePercentage = weekTotal.total > 0 ? (weekTotal.billable / weekTotal.total) * 100 : 0;
    const revenue = weekTotal.billable * (userProfile?.billableRate || 0);
    const cost = weekTotal.total * (userProfile?.hourlyRate || 0);
    const profit = revenue - cost;

    return {
      utilizationRate,
      billablePercentage,
      revenue,
      cost,
      profit
    };
  }, [weekTotal, userProfile]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handlePreviousMonth = () => {
    const prevMonth = subWeeks(currentWeekStart, 4);
    setCurrentWeekStart(startOfWeek(startOfMonth(prevMonth), { weekStartsOn: 1 }));
  };

  const handleNextMonth = () => {
    const nextMonth = addWeeks(currentWeekStart, 4);
    setCurrentWeekStart(startOfWeek(startOfMonth(nextMonth), { weekStartsOn: 1 }));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const toggleDayExpanded = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const startEditingEntry = (entry: TimeEntry, dateKey: string) => {
    setEditTimePopup({
      open: true,
      entry,
      dateKey,
      originalClient: entry.clientName,
      originalProject: entry.projectName
    });
    setAssignmentForm({
      hours: entry.duration / 3600,
      selectedClient: entry.clientName,
      selectedProject: entry.projectId || '',
      selectedTask: entry.taskId,
      notes: entry.notes || '',
      isUncategorized: entry.isUncategorized || false
    });
    setShowClientPicker(!!entry.clientName);
  };

  const saveEntryEdit = () => {
    if (!editTimePopup.entry) return;
    
    const entry = editTimePopup.entry;
    const clientChanged = assignmentForm.selectedClient !== editTimePopup.originalClient;
    const projectChanged = assignmentForm.selectedProject !== editTimePopup.originalProject;
    
    if (clientChanged || projectChanged) {
      setConfirmDialog({
        open: true,
        message: `⚠️ Change client assignment? This will move ${assignmentForm.hours}h from '${editTimePopup.originalClient || 'Uncategorized'}' to '${assignmentForm.selectedClient || 'Uncategorized'}'`,
        onConfirm: () => {
          // Apply changes
          entry.clientName = assignmentForm.selectedClient;
          entry.projectName = assignmentForm.selectedProject ? projects.find(p => p.id === assignmentForm.selectedProject)?.name || '' : '';
          entry.projectId = assignmentForm.selectedProject;
          entry.duration = assignmentForm.hours * 3600;
          entry.notes = assignmentForm.notes;
          entry.isUncategorized = assignmentForm.isUncategorized;
          
          toast.success('Time entry updated');
          setEditTimePopup({ open: false, entry: null, dateKey: '', originalClient: '', originalProject: '' });
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      });
    } else {
      // Just update hours/notes
      entry.duration = assignmentForm.hours * 3600;
      entry.notes = assignmentForm.notes;
      toast.success('Time entry updated');
      setEditTimePopup({ open: false, entry: null, dateKey: '', originalClient: '', originalProject: '' });
    }
  };

  const handleAddTimeForDate = (dateKey: string) => {
    setAddTimePopup({ open: true, dateKey });
    setAssignmentForm({
      hours: 1,
      selectedClient: '',
      selectedProject: '',
      selectedTask: '',
      notes: '',
      isUncategorized: false
    });
    setShowClientPicker(false);
    setClientSearch('');
  };

  const handleAddTimeSubmit = () => {
    if (!assignmentForm.isUncategorized && !assignmentForm.selectedClient) {
      toast.error('Please select a client or mark as uncategorized');
      return;
    }
    
    if (assignmentForm.hours <= 0) {
      toast.error('Please enter hours greater than 0');
      return;
    }
    
    // Create new time entry
    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      taskId: assignmentForm.selectedTask || `task-${Date.now()}`,
      taskName: assignmentForm.selectedTask ? tasks.find(t => t.id === assignmentForm.selectedTask)?.name || 'New Task' : 'General Work',
      projectName: assignmentForm.selectedProject ? projects.find(p => p.id === assignmentForm.selectedProject)?.name || '' : '',
      projectId: assignmentForm.selectedProject,
      clientName: assignmentForm.selectedClient,
      duration: assignmentForm.hours * 3600,
      isBillable: true,
      isUncategorized: assignmentForm.isUncategorized,
      notes: assignmentForm.notes
    };
    
    // Add entry to the day
    const dayData = hoursByDay.get(addTimePopup.dateKey);
    if (dayData) {
      dayData.entries.push(newEntry);
    }
    
    toast.success(`Added ${assignmentForm.hours}h ${assignmentForm.isUncategorized ? 'as uncategorized' : `to ${assignmentForm.selectedClient}`}`);
    setAddTimePopup({ open: false, dateKey: '' });
    setShowClientPicker(false);
    setClientSearch('');
  };
  
  // Filtered clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return uniqueClients;
    return uniqueClients.filter(client => 
      client.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [uniqueClients, clientSearch]);

  // Get projects for selected client
  const getProjectsForClient = (clientName: string) => {
    return projects.filter(p => p.clientName === clientName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl">Time Tracking Detail</h2>
            <p className="text-sm text-slate-500 mt-1">
              View and manage individual team member hours
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-0.5">Total Billable</div>
              <div className="text-2xl font-mono text-emerald-600">
                {formatHours(weekTotal.billable)}h
              </div>
              <div className="text-xs text-slate-500">
                {formatHours(weekTotal.total)}h total
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-0.5">Utilization Rate</div>
              <div className="text-2xl font-mono text-blue-600">
                {formatPercentage(metrics.utilizationRate)}
              </div>
              <div className="text-xs text-slate-500">
                {formatPercentage(metrics.billablePercentage)} billable
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-violet-200 bg-gradient-to-br from-white to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-0.5">Revenue</div>
              <div className="text-2xl font-mono text-violet-600">
                {formatCurrency(metrics.revenue)}
              </div>
              <div className="text-xs text-slate-500">
                {formatCurrency(metrics.cost)} cost
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-200 bg-gradient-to-br from-white to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-0.5">Profit</div>
              <div className={`text-2xl font-mono ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.profit)}
              </div>
              <div className="text-xs text-slate-500">
                This week
              </div>
            </div>
          </div>
        </Card>
      </div>

      {viewMode === 'weekly' ? (
        <>
          {/* Weekly Hours Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm">Weekly Hours</h3>
                
                {/* Team Member Selector */}
                <div className="flex items-center gap-3 pl-4 border-l-2 border-violet-300">
                  {/* User Avatar */}
                  <div className="relative">
                    {selectedUser === 'Emily Brown' ? (
                      <img 
                        src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2MzYzODk5OHww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Emily Brown"
                        className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-violet-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-violet-200">
                        <span className="text-sm text-white font-medium">
                          {selectedUser.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                  </div>
                  
                  {/* Team Member Dropdown */}
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-[200px] h-10 bg-gradient-to-br from-white to-violet-50 border-violet-300 hover:border-violet-400 shadow-sm hover:shadow transition-all font-medium">
                      <User className="w-4 h-4 mr-2 text-violet-600" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* User Details */}
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{userProfile?.hoursPerWeek || 40}h/week</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span>${userProfile?.billableRate || 0}/hr</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                      {userProfile?.role || 'Team Member'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Month Navigation */}
                <Button variant="outline" size="icon" onClick={handlePreviousMonth} title="Previous Month">
                  <div className="flex items-center">
                    <ChevronLeft className="w-3 h-3" />
                    <ChevronLeft className="w-3 h-3 -ml-2" />
                  </div>
                </Button>
                {/* Week Navigation */}
                <Button variant="outline" size="icon" onClick={handlePreviousWeek} title="Previous Week">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[200px]">
                  <div className="text-xs text-slate-500">Work Week</div>
                  <div className="text-sm font-medium">
                    {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleNextWeek} title="Next Week">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth} title="Next Month">
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3" />
                    <ChevronRight className="w-3 h-3 -ml-2" />
                  </div>
                </Button>
                <div className="border-l border-slate-200 pl-2 ml-1 flex items-center gap-1">
                  <Button 
                    variant={viewMode === 'weekly' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('weekly')}
                    className={viewMode === 'weekly' ? 'bg-violet-600 hover:bg-violet-700' : ''}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={viewMode === 'monthly' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('monthly')}
                    className={viewMode === 'monthly' ? 'bg-violet-600 hover:bg-violet-700' : ''}
                  >
                    Month
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>

                {/* Save/Cancel buttons for edited hours */}
                {editedHours.size > 0 && (
                  <>
                    <div className="border-l border-slate-200 pl-2 ml-1 flex items-center gap-2">
                      <span className="text-xs text-amber-600">
                        {editedHours.size} unsaved
                      </span>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="w-3 h-3 mr-1.5" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSave}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        <Save className="w-3 h-3 mr-1.5" />
                        Save
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left p-3 min-w-[140px]">Hour Type</th>
                    {daysInWeek.map(date => {
                      const isToday = isSameDay(date, new Date());
                      return (
                        <th key={format(date, 'yyyy-MM-dd')} className="text-center p-3 min-w-[110px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs text-slate-500">{format(date, 'EEE')}</span>
                            <div className="flex items-center gap-1">
                              <span className={isToday ? 'text-violet-700 font-medium' : ''}>
                                {format(date, 'MMM d')}
                              </span>
                              {isToday && (
                                <Badge variant="secondary" className="text-xs px-1 py-0 h-4">Today</Badge>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="text-center p-3 bg-slate-100 min-w-[100px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-slate-500">Total</span>
                        <span>Week</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Billable Hours Row */}
                  <tr className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="font-medium">Billable Hours</span>
                      </div>
                    </td>
                    {daysInWeek.map(date => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return (
                        <td key={dateKey} className="p-2 text-center">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={getDisplayHours(dateKey, 'billable')}
                            onChange={(e) => handleHoursChange(dateKey, 'billable', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="h-9 text-sm font-mono text-center border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-slate-50">
                      <span className="font-mono text-emerald-600">
                        {formatHours(weekTotal.billable)}h
                      </span>
                    </td>
                  </tr>

                  {/* Non-Billable Hours Row */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="font-medium">Non-Billable Hours</span>
                      </div>
                    </td>
                    {daysInWeek.map(date => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return (
                        <td key={dateKey} className="p-2 text-center">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={getDisplayHours(dateKey, 'nonBillable')}
                            onChange={(e) => handleHoursChange(dateKey, 'nonBillable', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="h-9 text-sm font-mono text-center border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                          />
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-slate-50">
                      <span className="font-mono text-slate-600">
                        {formatHours(weekTotal.nonBillable)}h
                      </span>
                    </td>
                  </tr>

                  {/* Total Hours Row */}
                  <tr className="border-b-2 border-slate-200 bg-violet-50/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <span className="font-medium">Total Hours</span>
                      </div>
                    </td>
                    {daysInWeek.map(date => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return (
                        <td key={dateKey} className="p-3 text-center">
                          <span className="font-mono text-violet-700">
                            {formatHours(getDisplayHours(dateKey, 'total'))}h
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-violet-100">
                      <span className="font-mono text-violet-700">
                        {formatHours(weekTotal.total)}h
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Time Entries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm">Time Entries</h3>
              <Button
                variant={showBillableOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowBillableOnly(!showBillableOnly)}
                className={showBillableOnly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Filter className="w-3 h-3 mr-1.5" />
                {showBillableOnly ? 'Billable Only' : 'All Entries'}
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {daysInWeek.map(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayData = hoursByDay.get(dateKey);
                const isToday = isSameDay(date, new Date());
                
                // Filter entries based on billable toggle
                const displayEntries = dayData?.entries.filter(entry => 
                  !showBillableOnly || entry.isBillable
                ) || [];
                
                // Separate uncategorized and regular entries
                const uncategorizedEntries = displayEntries.filter(e => e.isUncategorized);
                const regularEntries = displayEntries.filter(e => !e.isUncategorized);

                return (
                  <div key={dateKey} className={`border rounded-lg p-3 ${isToday ? 'border-violet-200 bg-violet-50/30' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{format(date, 'EEE d')}</span>
                        {isToday && <Badge variant="secondary" className="text-xs px-1 py-0 h-4">Today</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-violet-100"
                        onClick={() => handleAddTimeForDate(dateKey)}
                      >
                        <Plus className="w-3 h-3 text-violet-600" />
                      </Button>
                    </div>
                    
                    {displayEntries.length > 0 ? (
                      <div className="space-y-1.5">
                        {/* Uncategorized entries at top */}
                        {uncategorizedEntries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="text-xs bg-amber-50 rounded p-2 border-2 border-amber-300 relative group cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
                            onClick={() => startEditingEntry(entry, dateKey)}
                          >
                            <div className="flex items-center gap-1 mb-1 text-amber-700">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="font-medium text-xs">Uncategorized</span>
                            </div>
                            <div className="text-xs text-amber-600 mb-1">
                              Assign to client for billing
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {/* Billable Badge - Green circle with $ */}
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0" title="Billable">
                                  <DollarSign className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                              <span className="font-mono text-xs text-slate-600">
                                {formatHours(entry.duration / 3600)}h
                              </span>
                            </div>
                            {/* Edit icon indicator */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 className="w-3 h-3 text-amber-700" />
                            </div>
                          </div>
                        ))}
                        
                        {/* Regular entries */}
                        {(expandedDays.has(dateKey) ? regularEntries : regularEntries.slice(0, 3)).map((entry) => {
                          const project = projects.find(p => p.id === entry.projectId);
                          
                          return (
                            <div 
                              key={entry.id} 
                              className="text-xs bg-white rounded p-2 border border-slate-100 relative group cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all"
                              onClick={() => startEditingEntry(entry, dateKey)}
                            >
                              {/* Client and Project */}
                              {(entry.clientName || entry.projectName) && (
                                <div className="text-xs text-slate-500 mb-1 truncate">
                                  {entry.clientName && <span className="font-medium">{entry.clientName}</span>}
                                  {entry.clientName && entry.projectName && <span className="mx-1">•</span>}
                                  {entry.projectName && <span>{entry.projectName}</span>}
                                </div>
                              )}
                              {/* Task Name */}
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate text-xs">{entry.taskName}</span>
                              </div>
                              {/* Notes if present */}
                              {entry.notes && (
                                <div className="text-xs text-slate-400 mb-1 italic truncate">
                                  {entry.notes}
                                </div>
                              )}
                              {/* Hours and Billability */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {/* Billable Badge - Green circle with $ */}
                                  {entry.isBillable ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0" title="Billable">
                                      <DollarSign className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center shrink-0" title="Non-Billable">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    </div>
                                  )}
                                </div>
                                <span className="font-mono text-xs text-slate-600">
                                  {formatHours(entry.duration / 3600)}h
                                </span>
                              </div>
                              {/* Edit icon indicator */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="w-3 h-3 text-violet-600" />
                              </div>
                            </div>
                          );
                        })}
                        {/* Show more/less button */}
                        {regularEntries.length > 3 && (
                          <button
                            onClick={() => toggleDayExpanded(dateKey)}
                            className="w-full text-xs text-violet-600 hover:text-violet-700 py-1.5 flex items-center justify-center gap-1 bg-white border border-slate-200 rounded hover:bg-violet-50 transition-colors"
                          >
                            {expandedDays.has(dateKey) ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                Show all {regularEntries.length} entries
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-3">No entries</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        /* Monthly Calendar View - keeping existing implementation */
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm">Monthly Calendar - {format(monthStart, 'MMMM yyyy')}</h3>
            
            <div className="flex items-center gap-2">
              {/* Date Navigation & View Mode Controls */}
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center min-w-[160px]">
                <div className="text-sm">
                  {format(monthStart, 'MMMM yyyy')}
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-slate-600 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            {calendarGrid.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0">
                {week.map((date, dayIdx) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const dayData = hoursByDayMonth.get(dateKey);
                  const isCurrentMonth = isSameMonth(date, monthStart);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div
                      key={dayIdx}
                      className={`min-h-[100px] p-2 border-r last:border-r-0 ${
                        !isCurrentMonth ? 'bg-slate-50' : ''
                      } ${isToday ? 'bg-violet-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${!isCurrentMonth ? 'text-slate-400' : 'text-slate-700'} ${isToday ? 'font-bold text-violet-700' : ''}`}>
                          {format(date, 'd')}
                        </span>
                        {dayData && dayData.totalHours > 0 && (
                          <span className="text-xs font-mono text-slate-600">
                            {formatHours(dayData.totalHours)}h
                          </span>
                        )}
                      </div>
                      {dayData && dayData.billableHours > 0 && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="font-mono">{formatHours(dayData.billableHours)}h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assignment Popup */}
      <Dialog open={assignmentPopup.open} onOpenChange={(open) => setAssignmentPopup({ ...assignmentPopup, open })}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {assignmentPopup.mode === 'add' ? 'Assign Billable Hours' : 'Reduce Billable Hours'}
            </DialogTitle>
            <DialogDescription>
              {assignmentPopup.mode === 'add' 
                ? `Assign ${Math.abs(assignmentPopup.deltaHours).toFixed(1)}h to a client, project, or task`
                : `Remove ${Math.abs(assignmentPopup.deltaHours).toFixed(1)}h from existing entries`
              }
            </DialogDescription>
          </DialogHeader>

          {assignmentPopup.mode === 'add' ? (
            <div className="space-y-6">
              {/* Assignment Form */}
              <TimeEntryPopupContent
                hours={assignmentForm.hours}
                onHoursChange={(hours) => setAssignmentForm({ ...assignmentForm, hours })}
                isUncategorized={assignmentForm.isUncategorized}
                onUncategorizedChange={(value) => setAssignmentForm({ ...assignmentForm, isUncategorized: value, selectedClient: value ? '' : assignmentForm.selectedClient })}
                selectedClient={assignmentForm.selectedClient}
                onClientChange={(client) => setAssignmentForm({ ...assignmentForm, selectedClient: client, selectedProject: '', selectedTask: '' })}
                selectedProject={assignmentForm.selectedProject}
                onProjectChange={(project) => setAssignmentForm({ ...assignmentForm, selectedProject: project, selectedTask: '' })}
                notes={assignmentForm.notes}
                onNotesChange={(notes) => setAssignmentForm({ ...assignmentForm, notes })}
                clients={uniqueClients}
                projects={projects}
                existingEntries={assignmentPopup.existingEntries}
                onSelectExistingEntry={(entry) => {
                  setAssignmentForm({
                    ...assignmentForm,
                    selectedClient: entry.clientName,
                    selectedProject: entry.projectId || '',
                    selectedTask: entry.taskId
                  });
                }}
              />

              {/* Show current entries for this date */}
              {hoursByDay.get(assignmentPopup.dateKey)?.entries && hoursByDay.get(assignmentPopup.dateKey)!.entries.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-xs mb-3 block text-slate-600">Current Entries for {assignmentPopup.dateKey && format(new Date(assignmentPopup.dateKey), 'MMM d, yyyy')}</Label>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto bg-slate-50 rounded-lg p-3">
                    {hoursByDay.get(assignmentPopup.dateKey)!.entries.map(entry => (
                      <div key={entry.id} className="text-xs bg-white rounded p-2.5 border border-slate-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-700 truncate">{entry.taskName}</div>
                            {entry.clientName && (
                              <div className="text-slate-500 truncate mt-0.5">
                                {entry.clientName}{entry.projectName && ` • ${entry.projectName}`}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {entry.isBillable ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center" title="Billable">
                                <DollarSign className="w-2.5 h-2.5 text-white" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center" title="Non-Billable">
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              </div>
                            )}
                            <span className="font-mono text-xs text-slate-600">
                              {formatHours(entry.duration / 3600)}h
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAssignmentPopup({ ...assignmentPopup, open: false })}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={handleAssignmentSubmit}
                >
                  Assign Hours
                </Button>
              </div>
            </div>
          ) : (
            /* Reduce mode */
            <div className="space-y-4">
              <div>
                <Label>Select entries to reduce</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {assignmentPopup.existingEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{entry.taskName}</div>
                        <div className="text-xs text-slate-500">
                          {entry.clientName} {entry.projectName && `• ${entry.projectName}`}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-600">
                        {formatHours(entry.duration / 3600)}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAssignmentPopup({ ...assignmentPopup, open: false })}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={handleAssignmentSubmit}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Time Popup */}
      <Dialog open={addTimePopup.open} onOpenChange={(open) => setAddTimePopup({ ...addTimePopup, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
            <DialogDescription>
              Add a new time entry for {addTimePopup.dateKey && format(new Date(addTimePopup.dateKey), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <TimeEntryPopupContent
              hours={assignmentForm.hours}
              onHoursChange={(hours) => setAssignmentForm({ ...assignmentForm, hours })}
              isUncategorized={assignmentForm.isUncategorized}
              onUncategorizedChange={(value) => setAssignmentForm({ ...assignmentForm, isUncategorized: value, selectedClient: value ? '' : assignmentForm.selectedClient })}
              selectedClient={assignmentForm.selectedClient}
              onClientChange={(client) => setAssignmentForm({ ...assignmentForm, selectedClient: client, selectedProject: '', selectedTask: '' })}
              selectedProject={assignmentForm.selectedProject}
              onProjectChange={(project) => setAssignmentForm({ ...assignmentForm, selectedProject: project, selectedTask: '' })}
              notes={assignmentForm.notes}
              onNotesChange={(notes) => setAssignmentForm({ ...assignmentForm, notes })}
              clients={uniqueClients}
              projects={projects}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setAddTimePopup({ open: false, dateKey: '' });
                  setShowClientPicker(false);
                  setClientSearch('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleAddTimeSubmit}
              >
                Add Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Time Popup */}
      <Dialog open={editTimePopup.open} onOpenChange={(open) => setEditTimePopup({ ...editTimePopup, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Edit time entry for {editTimePopup.dateKey && format(new Date(editTimePopup.dateKey), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <TimeEntryPopupContent
              hours={assignmentForm.hours}
              onHoursChange={(hours) => setAssignmentForm({ ...assignmentForm, hours })}
              isUncategorized={assignmentForm.isUncategorized}
              onUncategorizedChange={(value) => setAssignmentForm({ ...assignmentForm, isUncategorized: value, selectedClient: value ? '' : assignmentForm.selectedClient })}
              selectedClient={assignmentForm.selectedClient}
              onClientChange={(client) => setAssignmentForm({ ...assignmentForm, selectedClient: client, selectedProject: '', selectedTask: '' })}
              selectedProject={assignmentForm.selectedProject}
              onProjectChange={(project) => setAssignmentForm({ ...assignmentForm, selectedProject: project, selectedTask: '' })}
              notes={assignmentForm.notes}
              onNotesChange={(notes) => setAssignmentForm({ ...assignmentForm, notes })}
              clients={uniqueClients}
              projects={projects}
              existingEntries={editTimePopup.dateKey ? (weeklyDayData.get(editTimePopup.dateKey)?.entries.filter(e => e.id !== editTimePopup.entry?.id && !e.isUncategorized) || []) : []}
              onSelectExistingEntry={(entry) => {
                setAssignmentForm({
                  ...assignmentForm,
                  selectedClient: entry.clientName,
                  selectedProject: entry.projectId || '',
                  selectedTask: entry.taskId,
                  isUncategorized: false
                });
              }}
              forceShowClientPicker={editTimePopup.entry?.isUncategorized || false}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditTimePopup({ open: false, entry: null, dateKey: '', originalClient: '', originalProject: '' });
                  setShowClientPicker(false);
                  setClientSearch('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={saveEntryEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Change</DialogTitle>
            <DialogDescription>
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              onClick={confirmDialog.onConfirm}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
