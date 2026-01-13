import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChevronRight, ChevronLeft, Check, Sparkles, X, Building2, Globe, Plus, Trash2, Settings2, Zap } from 'lucide-react';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { WorkflowTemplates } from './WorkflowTemplates';

interface Stage {
  id: string;
  name: string;
  color: string;
  tasks: any[];
  stageAutomations: number;
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

interface WorkflowWizardProps {
  onComplete: (workflow: Workflow) => void;
  onCancel: () => void;
  onBrowseCommunity?: () => void;
  pendingCommunityTemplate?: any;
}

const WORKFLOW_TEMPLATES = [
  {
    name: 'Monthly Bookkeeping',
    description: 'Document collection, reconciliation, review, reporting',
    icon: '📊',
    stages: 6,
    category: 'Accounting'
  },
  {
    name: 'Tax Return Prep',
    description: 'Organizer, collection, preparation, review, filing',
    icon: '📝',
    stages: 7,
    category: 'Accounting'
  },
  {
    name: 'Payroll Processing',
    description: 'Timesheets, calculation, approval, processing, deposits',
    icon: '💰',
    stages: 6,
    category: 'Accounting'
  },
  {
    name: 'Lead to Client',
    description: 'Inquiry, discovery, proposal, contract, onboarding',
    icon: '👥',
    stages: 6,
    category: 'Sales'
  },
  {
    name: 'Invoice Processing',
    description: 'Received, approval, scheduled, paid',
    icon: '📄',
    stages: 4,
    category: 'Accounting'
  },
  {
    name: 'Customer Support',
    description: 'Ticket received, assigned, in progress, resolved',
    icon: '🎧',
    stages: 4,
    category: 'General'
  },
  {
    name: 'Content Creation',
    description: 'Ideation, draft, review, approved, published',
    icon: '✍️',
    stages: 5,
    category: 'General'
  },
  {
    name: 'Start from Scratch',
    description: 'Build a completely custom workflow',
    icon: '⚡',
    stages: 3,
    category: 'Custom'
  }
];

export function WorkflowWizard({ onComplete, onCancel, onBrowseCommunity, pendingCommunityTemplate }: WorkflowWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof WORKFLOW_TEMPLATES[0] | null>(null);
  const [selectedSource, setSelectedSource] = useState<'quick' | 'firm' | 'community' | null>(null);
  
  // Step 1: Basic Info
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowIcon, setWorkflowIcon] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Step 2: Stages
  const [numberOfStages, setNumberOfStages] = useState(3);
  const [stages, setStages] = useState<Array<{ name: string; color: string; trackerLabel: string; trackerIcon: string }>>([ 
    { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
    { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
    { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
  ]);

  // Step 3: Setup mode
  const [setupMode, setSetupMode] = useState<'guided' | 'advanced'>('guided');
  const [currentStageSetup, setCurrentStageSetup] = useState(0);
  const [stageTasks, setStageTasks] = useState<Record<number, Array<{ name: string }>>>({});
  const [newTaskName, setNewTaskName] = useState('');

  const totalSteps = 3;

  // Auto-focus name input on step 1
  useEffect(() => {
    if (step === 1 && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 100);
    }
  }, [step]);

  // Handle pending community template
  useEffect(() => {
    if (pendingCommunityTemplate) {
      applyCommunityTemplate(pendingCommunityTemplate);
    }
  }, [pendingCommunityTemplate]);

  const resetWizard = () => {
    setStep(1);
    setSelectedTemplate(null);
    setWorkflowName('');
    setWorkflowDescription('');
    setWorkflowIcon('');
    setNumberOfStages(3);
    setStages([
      { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
      { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
      { name: '', color: 'border-t-violet-500', trackerLabel: '', trackerIcon: '' },
    ]);
    setSetupMode('guided');
    setCurrentStageSetup(0);
    setStageTasks({});
  };

  const applyTemplate = (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setSelectedSource('quick');
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setWorkflowIcon(template.icon);
    setNumberOfStages(template.stages);
    
    // Generate default stages based on template
    const newStages = Array(template.stages).fill(null).map((_, i) => ({
      name: '',
      color: 'border-t-violet-500',
      trackerLabel: '',
      trackerIcon: ''
    }));
    setStages(newStages);
  };

  const applyFirmTemplate = (template: any) => {
    setSelectedSource('firm');
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setWorkflowIcon('📊'); // Default icon
    setNumberOfStages(template.stages.length);
    
    // Map firm template stages to wizard format
    const newStages = template.stages.map((stage: any) => ({
      name: stage.name,
      color: 'border-t-violet-500',
      trackerLabel: stage.trackerLabel,
      trackerIcon: stage.trackerIcon || ''
    }));
    setStages(newStages);
    
    // Auto-advance to stage editing
    setStep(2);
  };

  const applyCommunityTemplate = (template: any) => {
    setSelectedSource('community');
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setWorkflowIcon('🌐'); // Default icon for community templates
    setNumberOfStages(template.stages.length);
    
    // Map community template stages to wizard format
    const newStages = template.stages.map((stage: any) => ({
      name: stage.name,
      color: 'border-t-violet-500',
      trackerLabel: stage.trackerLabel,
      trackerIcon: stage.trackerIcon || ''
    }));
    setStages(newStages);
    
    // Auto-advance to stage editing
    setStep(2);
  };

  const updateNumberOfStages = (num: number) => {
    setNumberOfStages(num);
    const newStages = Array(num).fill(null).map((_, i) => {
      if (i < stages.length) {
        return stages[i];
      }
      return {
        name: '',
        color: 'border-t-violet-500',
        trackerLabel: '',
        trackerIcon: ''
      };
    });
    setStages(newStages);
  };

  const updateStage = (index: number, field: string, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const addTaskToStage = (stageIndex: number) => {
    if (!newTaskName.trim()) return;
    
    const currentTasks = stageTasks[stageIndex] || [];
    setStageTasks({
      ...stageTasks,
      [stageIndex]: [...currentTasks, { name: newTaskName }]
    });
    setNewTaskName('');
  };

  const removeTaskFromStage = (stageIndex: number, taskIndex: number) => {
    const currentTasks = stageTasks[stageIndex] || [];
    setStageTasks({
      ...stageTasks,
      [stageIndex]: currentTasks.filter((_, i) => i !== taskIndex)
    });
  };

  const canProceedStep1 = workflowName.trim() !== '';
  const canProceedStep2 = stages.every(s => s.name.trim() !== '' && s.trackerLabel.trim() !== '');

  const handleComplete = () => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      icon: workflowIcon || '📋',
      stages: stages.map((stage, i) => {
        // Get tasks for this stage from stageTasks
        const stageTasksList = stageTasks[i] || [];
        // Convert border color class to bg color class for consistency
        const bgColor = stage.color.replace('border-t-', 'bg-') || 'bg-violet-500';
        return {
          id: `stage-${i + 1}`,
          name: stage.name,
          color: bgColor,
          tasks: stageTasksList.map((task, taskIndex) => ({
            id: `task-${i}-${taskIndex}-${Date.now()}`,
            name: task.name,
            description: '',
            assigneeRole: '',
            assignmentType: 'direct' as const,
            estimatedTime: '',
            movesToNextStage: false,
            dependencies: [],
            quickActions: []
          })),
          automations: [],
          trackerLabel: stage.trackerLabel,
          trackerIcon: stage.trackerIcon
        };
      })
    };
    
    onComplete(newWorkflow);
    resetWizard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Create New Workflow</h1>
                <p className="text-sm text-slate-500">Let's build your workflow step by step</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resetWizard();
                onCancel();
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Step {step} of {totalSteps}</span>
            <span className="text-slate-500">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between pt-2">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-violet-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step > 1 ? 'bg-violet-600 text-white' : step === 1 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm">Basic Info</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-violet-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step > 2 ? 'bg-violet-600 text-white' : step === 2 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100'}`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm">Define Stages</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-violet-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100'}`}>
                3
              </div>
              <span className="text-sm">Setup Tasks</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {/* Step 1: Basic Info + Template Selection */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Workflow Name - Prominently Featured */}
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <h3 className="text-slate-900 mb-1">What would you like to call your workflow?</h3>
                  <p className="text-sm text-slate-500">Give your workflow a clear, descriptive name</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <Input
                    ref={nameInputRef}
                    placeholder="e.g., Monthly Bookkeeping, Tax Return Prep, Lead to Client"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="text-center text-xl h-14 border-2 border-violet-300 focus-visible:ring-violet-500 shadow-lg"
                  />
                </div>
              </div>

              {/* Optional Details - Collapsed by default */}
              <div className="max-w-2xl mx-auto space-y-4 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <Label className="text-slate-600">Description (Optional)</Label>
                  <Textarea
                    placeholder="Brief description of what this workflow manages..."
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Template Selection - Below */}
              <div className="pt-6 border-t-2 border-slate-200">
                <div className="text-center mb-4">
                  <h3 className="text-slate-900 mb-1">Or start with a template</h3>
                  <p className="text-sm text-slate-500">Choose a pre-built workflow and customize it to your needs</p>
                </div>
                
                <Tabs defaultValue="quick" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="quick" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Quick Start
                    </TabsTrigger>
                    <TabsTrigger value="firm" className="gap-2">
                      <Building2 className="w-4 h-4" />
                      Your Templates
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quick" className="mt-0">
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {WORKFLOW_TEMPLATES.map((template) => (
                        <Card
                          key={template.name}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate?.name === template.name && selectedSource === 'quick'
                              ? 'border-2 border-violet-500 bg-violet-50'
                              : 'border border-slate-200 hover:border-violet-300'
                          }`}
                          onClick={() => applyTemplate(template)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="text-2xl">{template.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-slate-900 truncate">{template.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
                              <Badge variant="secondary" className="mt-1.5 text-xs">
                                {template.stages} stages
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="firm" className="mt-0 max-h-[300px] overflow-y-auto">
                    <WorkflowTemplates onSelectTemplate={applyFirmTemplate} />
                  </TabsContent>
                </Tabs>

                {/* Community Templates Link */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2 h-12 border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-400"
                    onClick={() => onBrowseCommunity?.()}
                  >
                    <Globe className="w-5 h-5 text-violet-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm text-slate-900">Browse Community Templates</div>
                      <div className="text-xs text-slate-500">View workflows shared by other firms</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Define Stages */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <h4 className="text-sm text-violet-900 mb-2">🎯 Define Your Workflow Stages</h4>
                <p className="text-sm text-violet-700">
                  Stages represent the major steps in your workflow. Each stage will contain specific tasks.
                </p>
                <p className="text-sm text-violet-700 mt-1">
                  <strong>Customer Tracker:</strong> This is what your customers see (e.g., "Making Your Pizza" instead of internal stages like "Preparation" and "Cooking")
                </p>
              </div>

              {/* Number of Stages - Visual Cards */}
              <div className="space-y-3">
                <Label>How many stages does your workflow have?</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 4, 5, 6, 7, 8].map((num) => (
                    <Card
                      key={num}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        numberOfStages === num
                          ? 'border-2 border-violet-500 bg-violet-50'
                          : 'border-2 border-slate-200'
                      }`}
                      onClick={() => updateNumberOfStages(num)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{num}</div>
                        <div className="text-xs text-slate-500">stages</div>
                        {/* Visual representation */}
                        <div className="flex gap-0.5 justify-center mt-3">
                          {Array(num).fill(null).map((_, i) => (
                            <div key={i} className="w-2 h-8 bg-violet-200 rounded-sm" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-slate-600">Custom:</Label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={numberOfStages}
                    onChange={(e) => updateNumberOfStages(parseInt(e.target.value) || 3)}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500">stages</span>
                </div>
              </div>

              {/* Customer Tracker Preview - Pizza Tracker Style */}
              <div className="space-y-2">
                <Label>Customer Tracker Preview</Label>
                <Card className="p-6 bg-white">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 z-0" />
                    <div className="absolute top-6 left-0 w-1/3 h-0.5 bg-violet-500 z-0" />
                    
                    {/* Tracker Steps */}
                    <div className="flex relative z-10 justify-between">
                      {stages.map((stage, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full ${index === 0 ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-400'} flex items-center justify-center mb-2`}>
                            <div className="w-3 h-3 rounded-full bg-current" />
                          </div>
                          <p className="text-xs text-slate-600 text-center max-w-[80px]">
                            {stage.trackerLabel || `Stage ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stage Configuration - Simplified */}
              <div className="space-y-4">
                <Label>Configure Each Stage</Label>
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-violet-500">
                      <div className="space-y-3">
                        <Badge variant="secondary">Stage {index + 1}</Badge>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Internal Stage Name *</Label>
                            <Input
                              placeholder={`e.g., ${index === 0 ? 'Order Received' : index === stages.length - 1 ? 'Delivery' : 'Processing'}`}
                              value={stage.name}
                              onChange={(e) => updateStage(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Customer Sees *</Label>
                            <Input
                              placeholder={`e.g., ${index === 0 ? 'Order Placed' : index === stages.length - 1 ? 'On the Way' : 'In Progress'}`}
                              value={stage.trackerLabel}
                              onChange={(e) => updateStage(index, 'trackerLabel', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Setup Tasks - Guided vs Advanced */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm text-green-900 mb-2">🎉 Great! Now Let's Set Up Tasks</h4>
                    <p className="text-sm text-green-700">
                      Add tasks and automations to each stage. You can do this now or skip and add them later.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Label className="text-xs text-green-800 whitespace-nowrap">
                      {setupMode === 'guided' ? 'Guided' : 'Advanced'}
                    </Label>
                    <Switch
                      checked={setupMode === 'advanced'}
                      onCheckedChange={(checked) => setSetupMode(checked ? 'advanced' : 'guided')}
                    />
                  </div>
                </div>
              </div>

              {/* Guided Mode - One Stage at a Time */}
              {setupMode === 'guided' && (
                <div className="space-y-4">
                  {/* Stage Progress */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {stages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStageSetup(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                          index === currentStageSetup
                            ? 'bg-violet-600 text-white'
                            : index < currentStageSetup
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {index < currentStageSetup ? <Check className="w-4 h-4" /> : index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Current Stage Setup */}
                  <Card className="p-6 border-l-4 border-l-violet-500">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-slate-900">Stage {currentStageSetup + 1}: {stages[currentStageSetup].name}</h3>
                        <p className="text-sm text-slate-500">Customer sees: "{stages[currentStageSetup].trackerLabel}"</p>
                      </div>

                      <div className="space-y-3">
                        <Label>Tasks for this stage</Label>
                        
                        {/* Task List */}
                        {(stageTasks[currentStageSetup] || []).length > 0 && (
                          <div className="space-y-2 mb-3">
                            {(stageTasks[currentStageSetup] || []).map((task, taskIndex) => (
                              <div key={taskIndex} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                                <span className="text-sm text-slate-700">{task.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTaskFromStage(currentStageSetup, taskIndex)}
                                >
                                  <Trash2 className="w-4 h-4 text-slate-400" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Task */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter task name..."
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addTaskToStage(currentStageSetup);
                              }
                            }}
                          />
                          <Button
                            onClick={() => addTaskToStage(currentStageSetup)}
                            className="gap-2 bg-violet-600 hover:bg-violet-700"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </Button>
                        </div>

                        <p className="text-xs text-slate-500">
                          💡 Tip: Add common tasks that occur in this stage. You can add automations later in the workflow builder.
                        </p>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStageSetup(Math.max(0, currentStageSetup - 1))}
                          disabled={currentStageSetup === 0}
                          className="gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous Stage
                        </Button>
                        
                        {currentStageSetup < stages.length - 1 ? (
                          <Button
                            onClick={() => setCurrentStageSetup(currentStageSetup + 1)}
                            className="gap-2 bg-violet-600 hover:bg-violet-700"
                          >
                            Next Stage
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={handleComplete}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Complete Setup
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Advanced Mode - All Stages Overview */}
              {setupMode === 'advanced' && (
                <div className="space-y-4">
                  {/* Workflow Summary */}
                  <Card className="p-6 bg-gradient-to-br from-violet-50 to-blue-50">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-4xl shadow-sm">
                        {workflowIcon || '📋'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-slate-900">{workflowName}</h3>
                        <p className="text-slate-600 text-sm">{workflowDescription || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary">{stages.length} Stages</Badge>
                          <Badge variant="secondary">Ready to configure</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Stages Preview */}
                  <div className="space-y-2">
                    <Label>Workflow Stages</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {stages.map((stage, index) => (
                        <Card key={index} className="p-4 border-l-4 border-l-violet-500">
                          <Badge variant="secondary" className="mb-2">Stage {index + 1}</Badge>
                          <p className="text-sm text-slate-900">{stage.name}</p>
                          <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                            <p className="text-slate-500">Customer sees:</p>
                            <p className="text-slate-700 mt-1">{stage.trackerLabel}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      ✅ You can add tasks and automations after creating the workflow in the Workflow Builder.
                    </p>
                  </div>

                  <Button
                    onClick={handleComplete}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Check className="w-4 h-4" />
                    Create Workflow
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons - Only show if not in step 3 or in advanced mode */}
        {(step < 3 || (step === 3 && setupMode === 'advanced')) && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  resetWizard();
                  onCancel();
                }
              }}
              className="gap-2"
              size="lg"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < totalSteps && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
                size="lg"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
