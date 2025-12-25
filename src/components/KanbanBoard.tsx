import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Calendar, Paperclip, MessageSquare, Zap, Activity, LayoutGrid, List, LayoutList, CheckSquare, FolderKanban, Settings2, Keyboard, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, Filter, X, Users, Building2, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useWorkflowContext, Project, ProjectTask } from './WorkflowContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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
  const { workflows, projects, tasks, addProject, moveProject, getWorkflow, getTasksByWorkflow, getTaskCounts, updateTask } = useWorkflowContext();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || '');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-slate-900 dark:text-gray-100">Projects</h2>
            <Badge variant="secondary" className="rounded-full">
              {filteredProjects.length} {filteredProjects.length !== 1 ? 'projects' : 'project'}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-gray-400">Track and manage your projects visually</p>
        </div>
        <div className="flex gap-3">
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
                  <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded border border-slate-200 dark:border-gray-700">
                    <p className="text-sm dark:text-gray-200">{currentWorkflow?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{currentWorkflow?.description}</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Label */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                      <span className="text-sm text-slate-600 dark:text-gray-300">Workflow:</span>
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
                                      : 'bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30'
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
                                      // Navigate to workflow tasks full page view
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
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all whitespace-nowrap flex-shrink-0 text-slate-600 dark:text-gray-300 hover:text-violet-700"
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
                    </div>
                  </div>
                  
                  {/* Actions - Only Edit Workflow */}
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
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="px-4 py-2 bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="🔍 Search projects or clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border-slate-300 dark:border-gray-600 focus:border-violet-400 focus:ring-violet-400"
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
                      <TabsList className="bg-slate-100 dark:bg-gray-700 p-0.5 h-8">
                        <TabsTrigger value="kanban" className="gap-1.5 h-7 px-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 text-xs">
                          <FolderKanban className="w-3 h-3" />
                          Kanban
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-1.5 h-7 px-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 text-xs">
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
          <Card className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-gray-700 dark:bg-gray-800">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                <FolderKanban className="w-8 h-8 text-slate-400 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-gray-100 mb-2">No Workflows Yet</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
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
                <Card className="p-4 sticky top-4 bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-slate-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Filter className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-slate-900 dark:text-gray-100">Filter Projects</h3>
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
                          <Label className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
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
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Kanban Board View */}
              {viewMode === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {stages.map((stage) => (
                  <div key={stage.id} className="min-w-[320px] flex-shrink-0">
                    <Card className={`p-4 border-t-4 ${stage.color} border-slate-200 dark:border-gray-700 dark:bg-gray-800`}>
                <div className="space-y-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-900 dark:text-gray-100">{stage.name}</h3>
                      <Badge variant="secondary" className="rounded-full">
                        {projectsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
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
                  </div>

                  {/* Project Cards */}
                  <div className="space-y-3">
                    {projectsByStage[stage.id]?.map((project) => {
                      const projectCard = {
                        ...convertToProjectCard(project),
                        stageName: stage.name,
                        stageColor: stage.color
                      };
                      return (
                        <Card key={project.id} className="p-4 border-slate-200 dark:border-gray-700 dark:bg-gray-900 hover:border-violet-300 transition-colors group">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div 
                                className="flex-1 cursor-pointer" 
                                onClick={() => onProjectClick?.(projectCard)}
                              >
                                <h4 className="text-sm text-slate-900 dark:text-gray-100 hover:text-violet-600 transition-colors">
                                  {project.clientName && project.name !== project.clientName 
                                    ? `${project.clientName} - ${project.name}`
                                    : project.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-gray-400">
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
                              <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                                <span className="text-slate-400 dark:text-gray-500">Created:</span>
                                <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3 text-slate-400 dark:text-gray-500" />
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
                                <span className="text-slate-500 dark:text-gray-400">Progress</span>
                                <span className="text-slate-900 dark:text-gray-100">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-1.5" />
                            </div>

                            {/* Tasks */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                              </div>
                              <span className="text-slate-300 dark:text-gray-600">|</span>
                              <span>Assigned: {project.assignees.join(', ')}</span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-700">
                              <div className="flex -space-x-2">
                                {project.assignees.map((assignee, i) => (
                                  <Avatar key={i} className="w-6 h-6 border-2 border-white dark:border-gray-800">
                                    <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                                      {assignee}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-gray-500">
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
                {viewMode === 'list' && (
                  <Card className="border-slate-200 dark:border-gray-700 dark:bg-gray-800">
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
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700"
                  onClick={() => onProjectClick?.(project)}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {project.clientName && project.name !== project.clientName 
                          ? `${project.clientName} - ${project.name}`
                          : project.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{project.template}</p>
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
                      <span className="text-xs text-slate-600 dark:text-gray-300">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 dark:text-gray-300">
                      {project.tasks.completed}/{project.tasks.total}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 dark:text-gray-300">{project.dueDate}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.assignees.map((assignee, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white dark:border-gray-800">
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
            {viewMode === 'tasks' && (
              <WorkflowTasksView
                workflowTasks={getTasksByWorkflow(selectedWorkflowId)}
                projects={workflowProjects.map(p => ({ id: p.id, name: p.name }))}
                onTaskUpdate={updateTask}
              />
            )}

            {/* Empty State */}
            {workflowProjects.length === 0 && viewMode !== 'tasks' && (
              <Card className="p-12 border-slate-200 dark:border-gray-700 dark:bg-gray-800 border-dashed">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto">
                    <FolderKanban className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-gray-100">No projects yet</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
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
