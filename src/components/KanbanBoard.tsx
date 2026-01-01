import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Calendar, Paperclip, MessageSquare, Zap, Activity, LayoutGrid, List, LayoutList, CheckSquare, FolderKanban, Settings2, Keyboard, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, Filter, X, Users, Building2, User, Search, Calendar as CalendarIcon, Tag, Minus, Settings, Download, Flag, ArrowLeft, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useWorkflowContext, Project, ProjectTask } from './WorkflowContext';
import { WorkflowTasksView } from './views/WorkflowTasksView';
import { TaskFilterPanel } from './TaskFilterPanel';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../contexts/AuthContext';

interface ProjectCard {
  id: string;
  name: string;
  template: string;
  assignees: string[];
  progress: number;
  tasks: { total: number; completed: number };
  dueDate: string;
  comments: number;
  attachments: number;
  clientName?: string;
}

interface KanbanBoardProps {
  viewMode?: 'kanban' | 'list';
  onViewModeChange?: (mode: 'kanban' | 'list') => void;
  onProjectClick?: (project: ProjectCard) => void;
  onActivityLogClick?: (project: ProjectCard) => void;
  onStartWizard?: () => void;
  onEditWorkflow?: () => void;
  onViewTasks?: (workflowId?: string) => void;
}

// Mock clients with type information for dropdown
const mockClients = [
  { name: 'Acme Corp', type: 'business' as const },
  { name: 'TechStart LLC', type: 'business' as const },
  { name: 'Global Industries', type: 'business' as const },
  { name: 'Startup XYZ', type: 'business' as const },
  { name: 'Enterprise Co', type: 'business' as const },
  { name: 'Innovate Inc', type: 'business' as const },
  { name: 'Blue Ocean Partners', type: 'business' as const },
  { name: 'Metro Solutions', type: 'business' as const },
  { name: 'Peak Performance LLC', type: 'business' as const },
  { name: 'Summit Group', type: 'business' as const },
  { name: 'John Anderson', type: 'individual' as const },
  { name: 'Sarah Mitchell', type: 'individual' as const },
  { name: 'David Chen', type: 'individual' as const },
  { name: 'Emily Rodriguez', type: 'individual' as const },
  { name: 'Michael Thompson', type: 'individual' as const },
  { name: 'Jennifer Lee', type: 'individual' as const },
  { name: 'Robert Wilson', type: 'individual' as const },
  { name: 'Lisa Martinez', type: 'individual' as const },
];

export function KanbanBoard({ viewMode = 'kanban', onViewModeChange, onProjectClick, onActivityLogClick, onStartWizard, onEditWorkflow, onViewTasks }: KanbanBoardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workflows, projects, tasks, addProject, moveProject, getWorkflow, getTasksByWorkflow, getTaskCounts, updateTask, userProfiles } = useWorkflowContext();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || '');
  const [showTasksView, setShowTasksView] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [selectedStageForNewProject, setSelectedStageForNewProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  
  // Advanced filters with exclusion support
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [excludeLeads, setExcludeLeads] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [excludeClients, setExcludeClients] = useState(false);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [excludeStages, setExcludeStages] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false);
  
  // Task view state (from AllTasksView)
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all');
  const [completedDisplayMode, setCompletedDisplayMode] = useState<'hide' | 'inline' | 'only'>('hide');
  const [showShortcutsLearningMode, setShowShortcutsLearningMode] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  
  // Task filter state
  const [includedAssignees, setIncludedAssignees] = useState<string[]>([]);
  const [excludedAssignees, setExcludedAssignees] = useState<string[]>([]);
  const [includedClients, setIncludedClients] = useState<string[]>([]);
  const [excludedClients, setExcludedClients] = useState<string[]>([]);
  const [includedStatuses, setIncludedStatuses] = useState<string[]>([]);
  const [excludedStatuses, setExcludedStatuses] = useState<string[]>([]);
  const [includedPriorities, setIncludedPriorities] = useState<string[]>([]);
  const [excludedPriorities, setExcludedPriorities] = useState<string[]>([]);
  const [includedTaskLists, setIncludedTaskLists] = useState<string[]>([]);
  const [excludedTaskLists, setExcludedTaskLists] = useState<string[]>([]);
  const [assigneeMode, setAssigneeMode] = useState<'include' | 'exclude'>('include');
  const [clientMode, setClientMode] = useState<'include' | 'exclude'>('include');
  const [statusMode, setStatusMode] = useState<'include' | 'exclude'>('include');
  const [priorityMode, setPriorityMode] = useState<'include' | 'exclude'>('include');
  const [taskListMode, setTaskListMode] = useState<'include' | 'exclude'>('include');
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open workflow builder
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (onEditWorkflow) {
          onEditWorkflow();
        }
      }
      // Cmd/Ctrl + N: New project
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewProjectDialogOpen(true);
      }
      // Cmd/Ctrl + /: Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEditWorkflow]);
  
  // Mock activity counts per client
  const activityCounts: { [key: string]: number } = {
    'client-1': 5,
    'client-2': 4,
    'client-3': 3,
    'client-4': 0,
    'client-5': 0,
  };

  // Get the current workflow
  const currentWorkflow = getWorkflow(selectedWorkflowId);
  const stages = currentWorkflow?.stages || [];

  // Get projects for this workflow grouped by stage
  const workflowProjects = projects.filter(p => p.workflowId === selectedWorkflowId);
  
  // Get unique values for filters
  const allLeads = Array.from(new Set(workflowProjects.flatMap(p => p.assignees)));
  const allClientsNames = Array.from(new Set(workflowProjects.map(p => p.clientName).filter(Boolean)));
  
  // Create client objects with type information
  const allClients = allClientsNames.map(name => {
    const mockClient = mockClients.find(c => c.name === name);
    return {
      name: name,
      type: mockClient?.type || 'business' as const
    };
  });
  
  // Get task-related data for TaskFilterPanel
  const workflowTasks = getTasksByWorkflow(selectedWorkflowId);
  const allTaskAssignees = Array.from(new Set(workflowTasks.map(t => t.assignee).filter(Boolean))) as string[];
  const allTaskClients = Array.from(new Set(workflowTasks.map(t => t.clientName).filter(Boolean) as string[])).map((name: string) => {
    const mockClient = mockClients.find(c => c.name === name);
    return {
      name: name,
      type: (mockClient?.type || 'business') as 'business' | 'individual'
    };
  });
  const allTaskStatuses = Array.from(new Set(workflowTasks.map(t => t.status).filter(Boolean))) as string[];
  const allTaskPriorities = Array.from(new Set(workflowTasks.map(t => t.priority).filter(Boolean))) as string[];
  const allTaskLists: Array<{ id: string; name: string; color: string; taskCount: number }> = []; // TODO: Get from context if available
  
  // Get logged-in user's full name
  const loggedInUserName = useMemo(() => {
    if (!user) return null;
    // Try to match user with userProfiles by name or email
    const userProfile = userProfiles?.find(profile => 
      profile.name.toLowerCase().includes(user.name.toLowerCase()) ||
      profile.email?.toLowerCase() === user.emailAddress?.toLowerCase()
    );
    return userProfile?.name || `${user.name} ${user.surname || ''}`.trim();
  }, [user, userProfiles]);
  
  // Create team members array from userProfiles (for Team View dropdown)
  // Ensure logged-in user is included even if not in userProfiles
  const teamMembers = useMemo(() => {
    const colors = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', '#ca8a04', '#0891b2', '#7e22ce'];
    
    const membersFromProfiles = (userProfiles || []).map((profile: any, index: number) => {
      const fullName = profile.name;
      const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      return {
        id: profile.id,
        name: fullName,
        avatar: initials,
        color: colors[index % colors.length]
      };
    });
    
    // If logged-in user is not in the list, add them
    if (loggedInUserName && !membersFromProfiles.some((m: any) => m.name === loggedInUserName)) {
      const userInitials = loggedInUserName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      membersFromProfiles.unshift({
        id: user?.id?.toString() || 'current-user',
        name: loggedInUserName,
        avatar: userInitials,
        color: colors[0] // Use first color for logged-in user
      });
    }
    
    return membersFromProfiles;
  }, [userProfiles, loggedInUserName, user]);
  
  // Initialize default assignee to logged-in user when Tasks view is shown
  useEffect(() => {
    if (showTasksView && loggedInUserName && includedAssignees.length === 0 && excludedAssignees.length === 0) {
      setIncludedAssignees([loggedInUserName]);
      setAssigneeMode('include');
    }
  }, [showTasksView, loggedInUserName]);
  
  // Toggle team member in assignee filter (for Team View dropdown)
  const toggleTeamMember = (memberName: string) => {
    // Remove from excluded if it's there
    if (excludedAssignees.includes(memberName)) {
      setExcludedAssignees(excludedAssignees.filter(name => name !== memberName));
    }
    
    // Toggle in included
    if (includedAssignees.includes(memberName)) {
      setIncludedAssignees(includedAssignees.filter(name => name !== memberName));
    } else {
      setIncludedAssignees([...includedAssignees, memberName]);
    }
    
    // Set mode to include when selecting members
    setAssigneeMode('include');
  };
  
  // Clear all task filters
  const clearAllTaskFilters = () => {
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
  };
  
  // Calculate active filter count for tasks
  const activeTaskFilterCount = includedAssignees.length + excludedAssignees.length + includedClients.length + excludedClients.length + includedStatuses.length + excludedStatuses.length + includedPriorities.length + excludedPriorities.length + includedTaskLists.length + excludedTaskLists.length;
  
  // Helper function to get assignee name
  const getAssigneeName = (assignee: string) => {
    return assignee || 'Unassigned';
  };
  
  // Separate clients by type for grouping
  const individualClients = allClients.filter(c => c.type === 'individual');
  const businessClients = allClients.filter(c => c.type === 'business');
  
  // Apply search and filter
  const filteredProjects = workflowProjects.filter(project => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = project.name.toLowerCase().includes(query);
      const matchesClient = project.clientName?.toLowerCase().includes(query);
      if (!matchesName && !matchesClient) return false;
    }
    
    // Project Lead filter (with exclusion support)
    if (selectedLeads.length > 0) {
      const hasSelectedLead = project.assignees.some(a => selectedLeads.includes(a));
      if (excludeLeads) {
        // Exclude mode: reject if project has any of the selected leads
        if (hasSelectedLead) return false;
      } else {
        // Include mode: accept only if project has at least one selected lead
        if (!hasSelectedLead) return false;
      }
    }
    
    // Client filter (with exclusion support)
    if (selectedClients.length > 0) {
      const matchesClient = project.clientName && selectedClients.includes(project.clientName);
      if (excludeClients) {
        // Exclude mode: reject if project matches any selected client
        if (matchesClient) return false;
      } else {
        // Include mode: accept only if project matches a selected client
        if (!matchesClient) return false;
      }
    }
    
    // Stage filter (with exclusion support)
    if (selectedStages.length > 0) {
      const matchesStage = selectedStages.includes(project.currentStageId);
      if (excludeStages) {
        // Exclude mode: reject if project is in any selected stage
        if (matchesStage) return false;
      } else {
        // Include mode: accept only if project is in a selected stage
        if (!matchesStage) return false;
      }
    }
    
    // Status filter
    if (filterStatus === 'active') {
      return project.progress < 100;
    } else if (filterStatus === 'overdue') {
      // Consider overdue if progress < 100 and has tasks (simplified logic)
      return project.progress < 100 && project.tasks.total > 0;
    } else if (filterStatus === 'completed') {
      return project.progress === 100;
    }
    
    return true;
  });
  
  const projectsByStage: { [key: string]: Project[] } = {};
  stages.forEach(stage => {
    projectsByStage[stage.id] = filteredProjects.filter(p => p.currentStageId === stage.id);
  });

  // Convert Project to ProjectCard for compatibility
  const convertToProjectCard = (project: Project): ProjectCard => ({
    id: project.id,
    name: project.name,
    template: currentWorkflow?.name || 'Unknown',
    assignees: project.assignees,
    progress: project.progress,
    tasks: project.tasks,
    dueDate: project.dueDate,
    comments: project.comments,
    attachments: project.attachments,
    clientName: project.clientName
  });

  // Get all projects across stages for list view
  const allProjects = filteredProjects.map(project => {
    const stage = stages.find(s => s.id === project.currentStageId);
    return {
      ...convertToProjectCard(project),
      stageName: stage?.name || 'Unknown',
      stageColor: stage?.color || 'border-slate-500'
    };
  });

  // Count active filters
  const activeFilterCount = 
    (selectedLeads.length > 0 ? 1 : 0) +
    (selectedClients.length > 0 ? 1 : 0) +
    (selectedStages.length > 0 ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedLeads([]);
    setExcludeLeads(false);
    setSelectedClients([]);
    setExcludeClients(false);
    setSelectedStages([]);
    setExcludeStages(false);
    setFilterStatus('all');
    setSearchQuery('');
  };

  const handleCreateProject = () => {
    if (!selectedClient.trim()) {
      toast.error('Please select a client');
      return;
    }

    const firstStageId = selectedStageForNewProject || stages[0]?.id;
    
    if (!firstStageId) {
      toast.error('No stages available in this workflow');
      return;
    }

    const projectName = newProjectName.trim() || selectedClient;

    addProject({
      name: projectName,
      workflowId: selectedWorkflowId,
      currentStageId: firstStageId,
      assignees: ['JD'],
      progress: 0,
      tasks: { total: stages.reduce((sum, s) => sum + s.tasks.length, 0), completed: 0 },
      dueDate: 'TBD',
      comments: 0,
      attachments: 0,
      clientName: selectedClient
    });

    toast.success(`Project "${newProjectName}" created!`);
    setNewProjectName('');
    setSelectedClient('');
    setNewProjectDialogOpen(false);
    setSelectedStageForNewProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Back to Projects Button - Show when in Tasks View */}
      {showTasksView && (
        <div className="mb-2">
          <Button
            variant="ghost"
            onClick={() => setShowTasksView(false)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-slate-900">{showTasksView ? 'Tasks' : 'Projects'}</h2>
            <Badge variant="secondary" className="rounded-full">
              {showTasksView 
                ? `${getTasksByWorkflow(selectedWorkflowId).filter(t => t.status !== 'completed').length} ${getTasksByWorkflow(selectedWorkflowId).filter(t => t.status !== 'completed').length !== 1 ? 'tasks' : 'task'}`
                : `${filteredProjects.length} ${filteredProjects.length !== 1 ? 'projects' : 'project'}`
              }
            </Badge>
          </div>
          <p className="text-slate-500">
            {showTasksView 
              ? `All tasks in ${currentWorkflow?.name || 'Workflow'}`
              : 'Track and manage your projects visually'
            }
          </p>
        </div>
        {!showTasksView && (
          <div className="flex gap-3">
            <Button 
              className="gap-2 bg-violet-600 hover:bg-violet-700"
              onClick={() => navigate('/start-my-tax-list')}
            >
              <FileText className="w-4 h-4" />
              Start My Tax List
            </Button>
            <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="gap-2 bg-violet-600 hover:bg-violet-700"
                  onClick={() => {
                    setSelectedStageForNewProject(null);
                    setNewProjectDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  {selectedStageForNewProject 
                    ? `Add a new project to ${stages.find(s => s.id === selectedStageForNewProject)?.name} stage`
                    : `Create a new project in ${currentWorkflow?.name || 'this workflow'}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.name} value={client.name}>
                          <div className="flex items-center gap-2">
                            {client.type === 'individual' ? (
                              <User className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project Name (Optional)</Label>
                  <Input 
                    placeholder="e.g., 2025 Tax Return"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateProject();
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500">Leave blank to use client name</p>
                </div>
                <div className="space-y-2">
                  <Label>Workflow</Label>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="text-sm">{currentWorkflow?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{currentWorkflow?.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Starting Stage</Label>
                  <Select 
                    value={selectedStageForNewProject || stages[0]?.id} 
                    onValueChange={setSelectedStageForNewProject}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={handleCreateProject}
                >
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-0">

        {/* Compact Combined Workflow Selector & Search Bar */}
        {workflows.length > 0 && (() => {
          // Sort workflows: those with tasks first
          const sortedWorkflows = [...workflows].sort((a, b) => {
            const aTaskCount = getTaskCounts(a.id).total;
            const bTaskCount = getTaskCounts(b.id).total;
            if (aTaskCount > 0 && bTaskCount === 0) return -1;
            if (aTaskCount === 0 && bTaskCount > 0) return 1;
            return 0;
          });

          // Show tabs for first 4-5 workflows with tasks, rest in dropdown
          const maxVisibleTabs = 5;
          const visibleWorkflows = sortedWorkflows.slice(0, maxVisibleTabs);
          const dropdownWorkflows = sortedWorkflows.slice(maxVisibleTabs);
          const hasDropdown = dropdownWorkflows.length > 0;

          return (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="px-4 py-2.5 border-b border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Label */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Workflow:</span>
                    </div>
                    
                    {/* Visible Workflow Tabs */}
                    <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                      {visibleWorkflows.map((workflow) => {
                        const taskCounts = getTaskCounts(workflow.id);
                        const isActive = selectedWorkflowId === workflow.id;
                        
                        return (
                          <div key={workflow.id} className="flex items-center gap-0 flex-shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setSelectedWorkflowId(workflow.id);
                                  }}
                                  className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap
                                    ${taskCounts.total > 0 ? 'rounded-r-none border-r-0' : ''}
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
                                <p className="text-xs">Click to view projects</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {taskCounts.total > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="h-[34px] min-w-8 px-2 text-xs flex items-center justify-center gap-0.5 cursor-pointer hover:scale-105 transition-all rounded-lg rounded-l-none border font-medium bg-red-500 text-white border-red-600 hover:bg-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Set view mode to tasks and select this workflow
                                      setSelectedWorkflowId(workflow.id);
                                      // Show tasks view internally
                                      setShowTasksView(true);
                                      // Also call onViewTasks if provided (for external navigation)
                                      if (onViewTasks) {
                                        onViewTasks(workflow.id);
                                      }
                                    }}
                                  >
                                    {taskCounts.total}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">View {taskCounts.total} task{taskCounts.total !== 1 ? 's' : ''}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* More Workflows Dropdown */}
                      {hasDropdown && (
                        <Select 
                          value={dropdownWorkflows.find(w => w.id === selectedWorkflowId)?.id || ''} 
                          onValueChange={(value) => {
                            setSelectedWorkflowId(value);
                          }}
                        >
                          <SelectTrigger className="w-[200px] h-[34px]">
                            <SelectValue placeholder={`+${dropdownWorkflows.length} more workflows`} />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownWorkflows.map(workflow => {
                              const taskCounts = getTaskCounts(workflow.id);
                              return (
                                <SelectItem key={workflow.id} value={workflow.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{workflow.icon}</span>
                                    <span>{workflow.name}</span>
                                    {taskCounts.total > 0 && (
                                      <Badge variant="secondary" className="ml-auto">
                                        {taskCounts.total}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    
                      {/* Add New Button */}
                      {!showTasksView && (
                        <button
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50 transition-all whitespace-nowrap flex-shrink-0 text-slate-600 hover:text-violet-700"
                          onClick={() => {
                            if (onStartWizard) {
                              onStartWizard();
                            } else {
                              toast.info('Creating new workflow...');
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">New Workflow</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions - Only Edit Workflow */}
                  {!showTasksView && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Workflow Settings Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 gap-1.5 border-violet-300 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 text-violet-700"
                              onClick={() => {
                                if (onEditWorkflow) {
                                  onEditWorkflow();
                                }
                              }}
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              <span className="text-xs">Edit Workflow</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit workflow (⌘K)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>

              {/* Search & Filter Bar */}
              {showTasksView ? (
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

                      {/* Team View Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                            <Users className="w-4 h-4" />
                            Team View
                            {includedAssignees.length > 0 && (
                              <Badge variant="secondary" className="ml-1">
                                {includedAssignees.length}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Select Team Members</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {teamMembers.map(member => {
                            const isSelected = includedAssignees.includes(member.name);
                            return (
                              <DropdownMenuItem
                                key={member.id}
                                className="cursor-pointer"
                                onSelect={(e) => {
                                  e.preventDefault(); // Prevent dropdown from closing
                                  toggleTeamMember(member.name);
                                }}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <Checkbox
                                    checked={isSelected}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent event bubbling
                                    }}
                                  />
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ backgroundColor: member.color }}
                                  >
                                    {member.avatar}
                                  </div>
                                  <span className="flex-1">{member.name}</span>
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
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
                        {activeTaskFilterCount > 0 && (
                          <Badge className="ml-1 bg-white/20 text-white border-white/30 px-1.5 min-w-[20px] justify-center">
                            {activeTaskFilterCount}
                          </Badge>
                        )}
                        {showShortcutsLearningMode && (
                          <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">⇧ F</kbd>
                        )}
                      </Button>

                      <div className="flex-1 flex-shrink-0 min-w-[20px]" />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Export tasks functionality
                                  const tasksToExport = getTasksByWorkflow(selectedWorkflowId);
                                  const csvContent = [
                                    ['Task Name', 'Assignee', 'Status', 'Priority', 'Due Date', 'Client'].join(','),
                                    ...tasksToExport.map(task => [
                                      task.name,
                                      task.assignee || 'Unassigned',
                                      task.status,
                                      task.priority,
                                      task.dueDate || '',
                                      task.projectId || ''
                                    ].join(','))
                                  ].join('\n');
                                  const blob = new Blob([csvContent], { type: 'text/csv' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  toast.success('Tasks exported successfully');
                                }}
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
                        <Tabs value={taskViewMode} onValueChange={(v) => setTaskViewMode(v as 'list' | 'kanban')} className="h-auto">
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
                    {activeTaskFilterCount > 0 && (
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
                          {includedTaskLists.map(listId => {
                            // TODO: Get task list name from context
                            const listName = `List ${listId}`;
                            return (
                              <Badge 
                                key={`list-include-${listId}`} 
                                variant="secondary" 
                                className="gap-1 text-xs h-6 bg-green-100 text-green-800 border-green-300"
                              >
                                <List className="w-2.5 h-2.5" />
                                {listName}
                                <button
                                  onClick={() => setIncludedTaskLists(includedTaskLists.filter(id => id !== listId))}
                                  className="ml-1 rounded-full p-0.5 hover:bg-green-200"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </Badge>
                            );
                          })}

                          {/* Excluded Task List Filters */}
                          {excludedTaskLists.map(listId => {
                            // TODO: Get task list name from context
                            const listName = `List ${listId}`;
                            return (
                              <Badge 
                                key={`list-exclude-${listId}`} 
                                variant="secondary" 
                                className="gap-1 text-xs h-6 bg-red-100 text-red-800 border-red-300"
                              >
                                <Minus className="w-2.5 h-2.5" />
                                {listName}
                                <button
                                  onClick={() => setExcludedTaskLists(excludedTaskLists.filter(id => id !== listId))}
                                  className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </Badge>
                            );
                          })}

                          {/* Clear All Filters Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllTaskFilters}
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
              ) : (
                <div className="px-4 py-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="🔍 Search projects or clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-sm bg-white border-slate-300 focus:border-violet-400 focus:ring-violet-400"
                      />
                    </div>

                    {/* Filter Toggle Button */}
                    <Button
                      variant={showFilterPanel ? 'default' : 'outline'}
                      size="sm"
                      className={`gap-2 h-8 ${showFilterPanel ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span className="text-xs">Filters</span>
                      {(activeFilterCount > 0 || filterStatus !== 'all') && (
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 text-xs bg-white text-violet-700">
                          {activeFilterCount + (filterStatus !== 'all' ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>

                    {/* Active Filter Summary */}
                    {(selectedLeads.length > 0 || selectedClients.length > 0 || selectedStages.length > 0 || filterStatus !== 'all') && (
                      <>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {filterStatus !== 'all' && (
                            <Badge variant="secondary" className="gap-1 text-xs h-6 bg-blue-100 text-blue-800 border-blue-300">
                              <Activity className="w-2.5 h-2.5" />
                              {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                              <button
                                onClick={() => setFilterStatus('all')}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </Badge>
                          )}
                          
                          {selectedLeads.slice(0, 2).map(lead => (
                            <Badge 
                              key={lead} 
                              variant="secondary" 
                              className={`gap-1 text-xs h-6 ${excludeLeads ? 'bg-red-100 text-red-800 border-red-300' : 'bg-violet-100 text-violet-800 border-violet-300'}`}
                            >
                              {excludeLeads && <span className="font-semibold">NOT</span>}
                              <Users className="w-2.5 h-2.5" />
                              {lead}
                              <button
                                onClick={() => setSelectedLeads(selectedLeads.filter(l => l !== lead))}
                                className={`ml-1 ${excludeLeads ? 'hover:bg-red-200' : 'hover:bg-violet-200'} rounded-full p-0.5`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </Badge>
                          ))}
                          {selectedLeads.length > 2 && (
                            <Badge variant="secondary" className="text-xs h-6">
                              +{selectedLeads.length - 2} more
                            </Badge>
                          )}
                          
                          {selectedClients.slice(0, 2).map(client => {
                            const clientData = allClients.find(c => c.name === client);
                            const isIndividual = clientData?.type === 'individual';
                            return (
                              <Badge 
                                key={client} 
                                variant="secondary" 
                                className={`gap-1 text-xs h-6 ${
                                  excludeClients 
                                    ? 'bg-red-100 text-red-800 border-red-300' 
                                    : isIndividual
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                {excludeClients && <span className="font-semibold">NOT</span>}
                                {isIndividual ? (
                                  <User className="w-2.5 h-2.5" />
                                ) : (
                                  <Building2 className="w-2.5 h-2.5" />
                                )}
                                {client}
                                <button
                                  onClick={() => setSelectedClients(selectedClients.filter(c => c !== client))}
                                  className={`ml-1 ${
                                    excludeClients 
                                      ? 'hover:bg-red-200' 
                                      : isIndividual 
                                        ? 'hover:bg-blue-200' 
                                        : 'hover:bg-emerald-200'
                                  } rounded-full p-0.5`}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </Badge>
                            );
                          })}
                          {selectedClients.length > 2 && (
                            <Badge variant="secondary" className="text-xs h-6">
                              +{selectedClients.length - 2} more
                            </Badge>
                          )}
                          
                          {selectedStages.slice(0, 2).map(stage => (
                            <Badge 
                              key={stage} 
                              variant="secondary" 
                              className={`gap-1 text-xs h-6 ${excludeStages ? 'bg-red-100 text-red-800 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}
                            >
                              {excludeStages && <span className="font-semibold">NOT</span>}
                              <FolderKanban className="w-2.5 h-2.5" />
                              {stage}
                              <button
                                onClick={() => setSelectedStages(selectedStages.filter(s => s !== stage))}
                                className={`ml-1 ${excludeStages ? 'hover:bg-red-200' : 'hover:bg-amber-200'} rounded-full p-0.5`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </Badge>
                          ))}
                          {selectedStages.length > 2 && (
                            <Badge variant="secondary" className="text-xs h-6">
                              +{selectedStages.length - 2} more
                            </Badge>
                          )}
                          
                          {/* Clear Filters Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLeads([]);
                              setSelectedClients([]);
                              setSelectedStages([]);
                              setFilterStatus('all');
                            }}
                            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear Filters
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* View Mode Toggle */}
                    {onViewModeChange && (
                      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as 'kanban' | 'list')} className="h-auto">
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
                    )}
                    
                    {/* Shortcuts Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => setShowShortcuts(true)}
                          >
                            <Keyboard className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Keyboard shortcuts (⌘/)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Use these shortcuts to navigate faster
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Edit Workflow</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">New Project</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono">⌘N</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono">⌘/</kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* No Workflows State */}
        {workflows.length === 0 && (
          <Card className="p-8 text-center border-2 border-dashed border-slate-300">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <FolderKanban className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-slate-900 mb-2">No Workflows Yet</h3>
                <p className="text-sm text-slate-500">
                  Create a workflow to start managing projects with kanban boards
                </p>
              </div>
              <Button 
                className="gap-2 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  if (onStartWizard) {
                    onStartWizard();
                  } else {
                    toast.info('Creating new workflow...');
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Workflow
              </Button>
            </div>
          </Card>
        )}

        {/* Content Area with Optional Left Sidebar */}
        {workflows.length > 0 && (
          <div className="flex gap-4 mt-4">
            {/* Left Filter Sidebar */}
            {showFilterPanel && (
              <div className="w-72 flex-shrink-0">
                {showTasksView ? (
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
                    allAssignees={allTaskAssignees}
                    allClients={allTaskClients}
                    allTaskLists={allTaskLists}
                    customStatuses={allTaskStatuses}
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
                    onClose={() => setShowFilterPanel(false)}
                    onClearAll={clearAllTaskFilters}
                  />
                ) : (
                  <Card className="p-4 sticky top-4 bg-gradient-to-br from-white to-slate-50 shadow-lg border-slate-200">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                              <Filter className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-slate-900">Filter Projects</h3>
                          </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setShowFilterPanel(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Filter Summary */}
                      {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {selectedLeads.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                              <Users className="w-3 h-3" />
                              <span>{selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {selectedClients.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <Building2 className="w-3 h-3" />
                              <span>{selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {selectedStages.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <FolderKanban className="w-3 h-3" />
                              <span>{selectedStages.length} stage{selectedStages.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Clear All */}
                    {(selectedLeads.length > 0 || selectedClients.length > 0 || selectedStages.length > 0 || filterStatus !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="w-full gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </Button>
                    )}

                    <Separator />

                    <ScrollArea className="h-[calc(100vh-320px)]">
                      <div className="space-y-4 pr-4">
                        {/* Status Filter */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-slate-700">
                            <Activity className="w-4 h-4 text-violet-500" />
                            Project Status
                          </Label>
                          <RadioGroup value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 transition-colors">
                                <RadioGroupItem value="all" id="status-all" />
                                <Label htmlFor="status-all" className="cursor-pointer flex-1">All Projects</Label>
                              </div>
                              <div className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 transition-colors">
                                <RadioGroupItem value="active" id="status-active" />
                                <Label htmlFor="status-active" className="cursor-pointer flex-1">Active Only</Label>
                              </div>
                              <div className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 transition-colors">
                                <RadioGroupItem value="overdue" id="status-overdue" />
                                <Label htmlFor="status-overdue" className="cursor-pointer flex-1">Overdue</Label>
                              </div>
                              <div className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 transition-colors">
                                <RadioGroupItem value="completed" id="status-completed" />
                                <Label htmlFor="status-completed" className="cursor-pointer flex-1">Completed</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <Separator />

                        {/* Project Lead Filter */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-slate-700">
                            <Users className="w-4 h-4 text-violet-500" />
                            Project Lead
                          </Label>
                          
                          {/* Include/Exclude Toggle */}
                          <div className="flex gap-2">
                            <Button
                              variant={!excludeLeads ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeLeads(false)}
                              className={`flex-1 text-xs ${!excludeLeads ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                            >
                              ✓ Include
                            </Button>
                            <Button
                              variant={excludeLeads ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeLeads(true)}
                              className={`flex-1 text-xs ${excludeLeads ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            >
                              ✕ Exclude
                            </Button>
                          </div>

                          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                            {allLeads.length === 0 ? (
                              <p className="text-xs text-slate-500 p-4 text-center">No leads found</p>
                            ) : (
                              <div className="space-y-0.5">
                                {allLeads.map(lead => (
                                  <div 
                                    key={lead} 
                                    className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                      selectedLeads.includes(lead)
                                        ? 'bg-violet-50 border border-violet-200'
                                        : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                    onClick={() => {
                                      if (selectedLeads.includes(lead)) {
                                        setSelectedLeads(selectedLeads.filter(l => l !== lead));
                                      } else {
                                        setSelectedLeads([...selectedLeads, lead]);
                                      }
                                    }}
                                  >
                                    <Avatar className={`w-7 h-7 flex-shrink-0 ${
                                      selectedLeads.includes(lead)
                                        ? 'ring-2 ring-violet-400'
                                        : ''
                                    }`}>
                                      <AvatarFallback className={`text-xs ${
                                        selectedLeads.includes(lead)
                                          ? 'bg-violet-100 text-violet-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {lead.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className={`text-sm flex-1 ${
                                      selectedLeads.includes(lead)
                                        ? 'text-violet-900'
                                        : 'text-slate-700'
                                    }`}>
                                      {lead}
                                    </span>
                                    {selectedLeads.includes(lead) && (
                                      <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Client Filter */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-slate-700">
                            <Building2 className="w-4 h-4 text-violet-500" />
                            Client
                          </Label>
                          
                          {/* Include/Exclude Toggle */}
                          <div className="flex gap-2">
                            <Button
                              variant={!excludeClients ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeClients(false)}
                              className={`flex-1 text-xs ${!excludeClients ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                            >
                              ✓ Include
                            </Button>
                            <Button
                              variant={excludeClients ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeClients(true)}
                              className={`flex-1 text-xs ${excludeClients ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            >
                              ✕ Exclude
                            </Button>
                          </div>

                          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg">
                            {allClients.length === 0 ? (
                              <p className="text-xs text-slate-500 p-4 text-center">No clients found</p>
                            ) : (
                              <div className="divide-y divide-slate-100">
                                {/* Business Clients Section */}
                                {businessClients.length > 0 && (
                                  <div className="p-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                                      <Building2 className="w-3 h-3 text-emerald-600" />
                                      <span className="text-xs text-slate-500 uppercase tracking-wide">Business ({businessClients.length})</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      {businessClients.map(client => (
                                        <div 
                                          key={client.name} 
                                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                            selectedClients.includes(client.name)
                                              ? 'bg-emerald-50 border border-emerald-200'
                                              : 'hover:bg-slate-50 border border-transparent'
                                          }`}
                                          onClick={() => {
                                            if (selectedClients.includes(client.name)) {
                                              setSelectedClients(selectedClients.filter(c => c !== client.name));
                                            } else {
                                              setSelectedClients([...selectedClients, client.name]);
                                            }
                                          }}
                                        >
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            selectedClients.includes(client.name)
                                              ? 'bg-emerald-100'
                                              : 'bg-slate-100'
                                          }`}>
                                            <Building2 className={`w-3.5 h-3.5 ${
                                              selectedClients.includes(client.name)
                                                ? 'text-emerald-600'
                                                : 'text-slate-500'
                                            }`} />
                                          </div>
                                          <span className={`text-sm flex-1 ${
                                            selectedClients.includes(client.name)
                                              ? 'text-emerald-900'
                                              : 'text-slate-700'
                                          }`}>
                                            {client.name}
                                          </span>
                                          {selectedClients.includes(client.name) && (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Individual Clients Section */}
                                {individualClients.length > 0 && (
                                  <div className="p-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                                      <User className="w-3 h-3 text-blue-600" />
                                      <span className="text-xs text-slate-500 uppercase tracking-wide">Individual ({individualClients.length})</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      {individualClients.map(client => (
                                        <div 
                                          key={client.name} 
                                          className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                            selectedClients.includes(client.name)
                                              ? 'bg-blue-50 border border-blue-200'
                                              : 'hover:bg-slate-50 border border-transparent'
                                          }`}
                                          onClick={() => {
                                            if (selectedClients.includes(client.name)) {
                                              setSelectedClients(selectedClients.filter(c => c !== client.name));
                                            } else {
                                              setSelectedClients([...selectedClients, client.name]);
                                            }
                                          }}
                                        >
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            selectedClients.includes(client.name)
                                              ? 'bg-blue-100'
                                              : 'bg-slate-100'
                                          }`}>
                                            <User className={`w-3.5 h-3.5 ${
                                              selectedClients.includes(client.name)
                                                ? 'text-blue-600'
                                                : 'text-slate-500'
                                            }`} />
                                          </div>
                                          <span className={`text-sm flex-1 ${
                                            selectedClients.includes(client.name)
                                              ? 'text-blue-900'
                                              : 'text-slate-700'
                                          }`}>
                                            {client.name}
                                          </span>
                                          {selectedClients.includes(client.name) && (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Stage Filter */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-slate-700">
                            <FolderKanban className="w-4 h-4 text-violet-500" />
                            Stage
                          </Label>
                          
                          {/* Include/Exclude Toggle */}
                          <div className="flex gap-2">
                            <Button
                              variant={!excludeStages ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeStages(false)}
                              className={`flex-1 text-xs ${!excludeStages ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                            >
                              ✓ Include
                            </Button>
                            <Button
                              variant={excludeStages ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExcludeStages(true)}
                              className={`flex-1 text-xs ${excludeStages ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            >
                              ✕ Exclude
                            </Button>
                          </div>

                          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
                            {stages.length === 0 ? (
                              <p className="text-xs text-slate-500 p-4 text-center">No stages found</p>
                            ) : (
                              <div className="space-y-0.5">
                                {stages.map(stage => (
                                  <div 
                                    key={stage.id} 
                                    className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer ${
                                      selectedStages.includes(stage.id)
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                    onClick={() => {
                                      if (selectedStages.includes(stage.id)) {
                                        setSelectedStages(selectedStages.filter(s => s !== stage.id));
                                      } else {
                                        setSelectedStages([...selectedStages, stage.id]);
                                      }
                                    }}
                                  >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      selectedStages.includes(stage.id)
                                        ? 'bg-amber-100'
                                        : 'bg-slate-100'
                                    }`}>
                                      <FolderKanban className={`w-3.5 h-3.5 ${
                                        selectedStages.includes(stage.id)
                                          ? 'text-amber-600'
                                          : 'text-slate-500'
                                      }`} />
                                    </div>
                                    <span className={`text-sm flex-1 ${
                                      selectedStages.includes(stage.id)
                                        ? 'text-amber-900'
                                        : 'text-slate-700'
                                    }`}>
                                      {stage.name}
                                    </span>
                                    {selectedStages.includes(stage.id) && (
                                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </Card>
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Kanban Board View */}
              {!showTasksView && viewMode === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {stages.map((stage) => (
                  <div key={stage.id} className="min-w-[320px] flex-shrink-0">
                    <Card className={`p-4 border-t-4 ${stage.color} border-slate-200`}>
                <div className="space-y-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-900">{stage.name}</h3>
                      <Badge variant="secondary" className="rounded-full">
                        {projectsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
                    {!showTasksView && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedStageForNewProject(stage.id);
                          setNewProjectDialogOpen(true);
                        }}
                        title={`Add project to ${stage.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Project Cards */}
                  <div className="space-y-3">
                    {projectsByStage[stage.id]?.map((project) => {
                      const projectCard = convertToProjectCard(project);
                      return (
                        <Card key={project.id} className="p-4 border-slate-200 hover:border-violet-300 transition-colors group">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div 
                                className="flex-1 cursor-pointer" 
                                onClick={() => onProjectClick?.(projectCard)}
                              >
                                <h4 className="text-sm text-slate-900 hover:text-violet-600 transition-colors">
                                  {project.clientName && project.name !== project.clientName 
                                    ? `${project.clientName} - ${project.name}`
                                    : project.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                  <span>{currentWorkflow?.name}</span>
                                  {project.year && (
                                    <>
                                      <span>•</span>
                                      <span>{project.year}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {/* Activity indicator */}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 relative opacity-60 group-hover:opacity-100 transition-opacity"
                                title="View activity log"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onActivityLogClick?.(projectCard);
                                }}
                              >
                                <Activity className="w-3.5 h-3.5 text-slate-600" />
                                {activityCounts[project.id] > 0 && (
                                  <Badge 
                                    className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0 px-1 text-xs bg-violet-600"
                                  >
                                    {activityCounts[project.id]}
                                  </Badge>
                                )}
                              </Button>
                            </div>

                            {/* Project Info Grid */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <span className="text-slate-400">Created:</span>
                                <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Due {project.dueDate}</span>
                              </div>
                              {project.personInCharge && (
                                <div className="flex items-center gap-1 text-slate-500">
                                  <span className="text-slate-400">Account Manager:</span>
                                  <span className="font-medium text-violet-600">{project.personInCharge}</span>
                                </div>
                              )}
                              {project.timeSpent !== undefined && (
                                <div className="flex items-center gap-1 text-slate-500">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{project.timeSpent}h</span>
                                </div>
                              )}
                            </div>

                            {/* Progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-slate-900">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-1.5" />
                            </div>

                            {/* Tasks */}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                              </div>
                              <span className="text-slate-300">|</span>
                              <span>Assigned: {project.assignees.join(', ')}</span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex -space-x-2">
                                {project.assignees.map((assignee, i) => (
                                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                                      {assignee}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {project.comments}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" />
                                  {project.attachments}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Card>
                    </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {!showTasksView && viewMode === 'list' && (
                  <Card className="border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProjects.map((project) => (
                  <TableRow 
                  key={project.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => onProjectClick?.(project)}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {project.clientName && project.name !== project.clientName 
                          ? `${project.clientName} - ${project.name}`
                          : project.name}
                      </p>
                      <p className="text-xs text-slate-500">{project.template}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-l-4 ${project.stageColor}`}>
                      {project.stageName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={project.progress} className="h-2" />
                      <span className="text-xs text-slate-600">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {project.tasks.completed}/{project.tasks.total}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{project.dueDate}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.assignees.map((assignee, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                            {assignee}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {project.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {project.attachments}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
                </Table>
              </Card>
            )}

            {/* Tasks View */}
            {showTasksView && (
              <div className="space-y-4">
                <WorkflowTasksView
                  workflowTasks={getTasksByWorkflow(selectedWorkflowId)}
                  projects={workflowProjects.map(p => ({ id: p.id, name: p.name, clientName: p.clientName }))}
                  onTaskUpdate={updateTask}
                  workflow={getWorkflow(selectedWorkflowId)}
                  viewMode={taskViewMode}
                  searchQuery={searchQuery}
                  timeFilter={timeFilter}
                  completedDisplayMode={completedDisplayMode}
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
                />
              </div>
            )}

            {/* Empty State */}
            {workflowProjects.length === 0 && !showTasksView && (
              <Card className="p-12 border-slate-200 border-dashed">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                    <FolderKanban className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900">No projects yet</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Create your first project to get started with {currentWorkflow?.name}
                    </p>
                  </div>
                  <Button 
                    className="gap-2 bg-violet-600 hover:bg-violet-700"
                    onClick={() => setNewProjectDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
