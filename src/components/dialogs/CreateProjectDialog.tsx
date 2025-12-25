import React, { useState } from 'react';
import { X, Briefcase, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

interface Workflow {
  id: string;
  name: string;
  stages: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onCreateProject: (data: {
    projectName: string;
    workflow: string;
    startingStage: string;
    accountManager: string;
  }) => void;
}

// Mock workflows
const WORKFLOWS: Workflow[] = [
  {
    id: 'tax-prep',
    name: 'Tax Preparation',
    stages: ['Documents Requested', 'Documents Received', 'In Review', 'Completed', 'Filed']
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    stages: ['Setup', 'Monthly Processing', 'Reconciliation', 'Review', 'Completed']
  },
  {
    id: 'audit',
    name: 'Audit',
    stages: ['Planning', 'Fieldwork', 'Draft Report', 'Final Report', 'Closed']
  },
  {
    id: 'consulting',
    name: 'Consulting Project',
    stages: ['Discovery', 'Analysis', 'Recommendations', 'Implementation', 'Completed']
  }
];

// Mock team members
const ACCOUNT_MANAGERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Accountant' },
  { id: '2', name: 'Michael Chen', role: 'Tax Specialist' },
  { id: '3', name: 'Emily Rodriguez', role: 'CPA' },
  { id: '4', name: 'David Thompson', role: 'Audit Manager' },
];

export function CreateProjectDialog({ isOpen, onClose, selectedCount, onCreateProject }: CreateProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  if (!isOpen) return null;

  const selectedWorkflowObj = WORKFLOWS.find(w => w.id === selectedWorkflow);
  const workflowStages = selectedWorkflowObj?.stages || [];

  const handleCreate = () => {
    if (selectedWorkflow) {
      onCreateProject({
        projectName,
        workflow: selectedWorkflow,
        startingStage: selectedStage,
        accountManager: selectedManager
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setProjectName('');
    setSelectedWorkflow('');
    setSelectedStage('');
    setSelectedManager('');
    setShowWorkflowDropdown(false);
    setShowStageDropdown(false);
    setShowManagerDropdown(false);
    onClose();
  };

  const isValid = selectedWorkflow;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
          }}
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Create Project
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Create project for <span className="font-semibold text-brand-primary">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span>
            </p>
          </div>

          <div className="space-y-5">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name (optional)..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            {/* Workflow Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowWorkflowDropdown(!showWorkflowDropdown);
                    setShowStageDropdown(false);
                    setShowManagerDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-left flex items-center justify-between"
                >
                  <span className={selectedWorkflow ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedWorkflow ? WORKFLOWS.find(w => w.id === selectedWorkflow)?.name : 'Select workflow...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showWorkflowDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {WORKFLOWS.map((workflow) => (
                      <div
                        key={workflow.id}
                        onClick={() => {
                          setSelectedWorkflow(workflow.id);
                          setSelectedStage(''); // Reset stage when workflow changes
                          setShowWorkflowDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{workflow.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{workflow.stages.length} stages</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Starting Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Stage
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    if (selectedWorkflow) {
                      setShowStageDropdown(!showStageDropdown);
                      setShowWorkflowDropdown(false);
                      setShowManagerDropdown(false);
                    }
                  }}
                  disabled={!selectedWorkflow}
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-left flex items-center justify-between ${
                    !selectedWorkflow ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className={selectedStage ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedStage || (selectedWorkflow ? 'Select starting stage (optional)...' : 'Select workflow first...')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showStageDropdown && workflowStages.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {workflowStages.map((stage, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedStage(stage);
                          setShowStageDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-gray-900">{stage}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Manager
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowManagerDropdown(!showManagerDropdown);
                    setShowWorkflowDropdown(false);
                    setShowStageDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-left flex items-center justify-between"
                >
                  <span className={selectedManager ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedManager ? ACCOUNT_MANAGERS.find(m => m.id === selectedManager)?.name : 'Select account manager (optional)...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showManagerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {ACCOUNT_MANAGERS.map((manager) => (
                      <div
                        key={manager.id}
                        onClick={() => {
                          setSelectedManager(manager.id);
                          setShowManagerDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{manager.name}</div>
                        <div className="text-xs text-gray-500">{manager.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}