import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileText, 
  DollarSign, 
  Users, 
  Calculator, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Bookkeeping' | 'Tax' | 'Payroll' | 'Sales' | 'Advisory';
  icon: any;
  complexity: 'Simple' | 'Moderate' | 'Advanced';
  estimatedSetupTime: string;
  stages: {
    name: string;
    trackerLabel: string;
    tasks: { name: string; estimatedTime: string }[];
    automations: { trigger: string; actions: string[] }[];
  }[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'monthly-bookkeeping',
    name: 'Monthly Bookkeeping Close',
    description: 'Complete monthly close process with document collection, reconciliation, and client reporting',
    category: 'Bookkeeping',
    icon: Calculator,
    complexity: 'Moderate',
    estimatedSetupTime: '10 min',
    stages: [
      {
        name: 'Document Collection',
        trackerLabel: 'Collecting Your Documents',
        tasks: [
          { name: 'Request bank statements', estimatedTime: '5 min' },
          { name: 'Request credit card statements', estimatedTime: '5 min' },
          { name: 'Request receipts and invoices', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Request Documents from Client'] 
          },
          { 
            trigger: 'no_client_response', 
            actions: ['Send Email to Client', 'Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Bank Reconciliation',
        trackerLabel: 'Reviewing Your Transactions',
        tasks: [
          { name: 'Download bank transactions', estimatedTime: '15 min' },
          { name: 'Match transactions to records', estimatedTime: '1 hour' },
          { name: 'Resolve discrepancies', estimatedTime: '30 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Categorization & Review',
        trackerLabel: 'Processing Your Records',
        tasks: [
          { name: 'Categorize transactions', estimatedTime: '2 hours' },
          { name: 'Review for accuracy', estimatedTime: '30 min' },
          { name: 'Manager review', estimatedTime: '20 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Assign Task to Team Member', 'Send Email to Team Member'] 
          },
        ],
      },
      {
        name: 'Financial Statements',
        trackerLabel: 'Preparing Your Reports',
        tasks: [
          { name: 'Generate P&L and Balance Sheet', estimatedTime: '20 min' },
          { name: 'Add management notes', estimatedTime: '15 min' },
          { name: 'Partner review', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Generate & Send Report'] 
          },
        ],
      },
      {
        name: 'Client Delivery',
        trackerLabel: 'Your Reports Are Ready',
        tasks: [
          { name: 'Send reports to client', estimatedTime: '10 min' },
          { name: 'Schedule review call', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Update Client Portal Status', 'Create Calendar Event/Meeting'] 
          },
        ],
      },
      {
        name: 'Complete',
        trackerLabel: 'All Done!',
        tasks: [
          { name: 'Archive documents', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Archive Completed Work', 'Update QuickBooks/Xero'] 
          },
        ],
      },
    ],
  },
  {
    id: 'tax-return-prep',
    name: 'Tax Return Preparation',
    description: 'Individual or business tax return workflow from organizer to e-filing',
    category: 'Tax',
    icon: FileText,
    complexity: 'Advanced',
    estimatedSetupTime: '15 min',
    stages: [
      {
        name: 'Tax Organizer',
        trackerLabel: 'Getting Started',
        tasks: [
          { name: 'Send tax organizer to client', estimatedTime: '10 min' },
          { name: 'Schedule initial call', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Request Documents from Client'] 
          },
          { 
            trigger: 'days_before_deadline', 
            actions: ['Send Email to Client', 'Send SMS Reminder'] 
          },
        ],
      },
      {
        name: 'Document Collection',
        trackerLabel: 'Collecting Your Tax Documents',
        tasks: [
          { name: 'Collect W-2s and 1099s', estimatedTime: '15 min' },
          { name: 'Collect deduction documentation', estimatedTime: '20 min' },
          { name: 'Verify all forms received', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'document_received', 
            actions: ['Send Email to Client', 'Update Client Portal Status'] 
          },
          { 
            trigger: 'no_client_response', 
            actions: ['Send Email to Client', 'Escalate to Manager/Partner'] 
          },
        ],
      },
      {
        name: 'Preparation',
        trackerLabel: 'Preparing Your Return',
        tasks: [
          { name: 'Enter tax data', estimatedTime: '2 hours' },
          { name: 'Apply deductions and credits', estimatedTime: '1 hour' },
          { name: 'Quality review', estimatedTime: '30 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Assign Task to Team Member'] 
          },
        ],
      },
      {
        name: 'Partner Review',
        trackerLabel: 'Final Review in Progress',
        tasks: [
          { name: 'Partner review return', estimatedTime: '30 min' },
          { name: 'Resolve review comments', estimatedTime: '20 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Team Member', 'Create Calendar Event/Meeting'] 
          },
        ],
      },
      {
        name: 'Client Review',
        trackerLabel: 'Ready for Your Review',
        tasks: [
          { name: 'Send draft to client', estimatedTime: '10 min' },
          { name: 'Review call with client', estimatedTime: '30 min' },
          { name: 'Make final adjustments', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Update Client Portal Status', 'Create Calendar Event/Meeting'] 
          },
        ],
      },
      {
        name: 'E-filing',
        trackerLabel: 'Filing Your Return',
        tasks: [
          { name: 'E-file federal return', estimatedTime: '15 min' },
          { name: 'E-file state return', estimatedTime: '15 min' },
          { name: 'Process payment if needed', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Email to Client', 'Update Client Portal Status'] 
          },
        ],
      },
      {
        name: 'Complete',
        trackerLabel: 'Successfully Filed!',
        tasks: [
          { name: 'Send confirmation and copies', estimatedTime: '10 min' },
          { name: 'Archive tax documents', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Archive Completed Work'] 
          },
        ],
      },
    ],
  },
  {
    id: 'payroll-processing',
    name: 'Bi-Weekly Payroll Processing',
    description: 'Complete payroll cycle from timesheet collection to tax deposits',
    category: 'Payroll',
    icon: DollarSign,
    complexity: 'Moderate',
    estimatedSetupTime: '12 min',
    stages: [
      {
        name: 'Timesheet Collection',
        trackerLabel: 'Collecting Timesheets',
        tasks: [
          { name: 'Send timesheet reminder', estimatedTime: '5 min' },
          { name: 'Collect employee timesheets', estimatedTime: '20 min' },
          { name: 'Verify hours', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'time_scheduled', 
            actions: ['Send Email to Client', 'Send SMS Reminder'] 
          },
          { 
            trigger: 'days_before_deadline', 
            actions: ['Send Email to Client'] 
          },
        ],
      },
      {
        name: 'Payroll Calculation',
        trackerLabel: 'Calculating Payroll',
        tasks: [
          { name: 'Calculate gross pay', estimatedTime: '30 min' },
          { name: 'Calculate deductions and taxes', estimatedTime: '20 min' },
          { name: 'Review for accuracy', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Client Approval',
        trackerLabel: 'Awaiting Your Approval',
        tasks: [
          { name: 'Send payroll summary to client', estimatedTime: '10 min' },
          { name: 'Get client approval', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Update Client Portal Status'] 
          },
          { 
            trigger: 'no_client_response', 
            actions: ['Send SMS Reminder', 'Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Processing',
        trackerLabel: 'Processing Your Payroll',
        tasks: [
          { name: 'Process direct deposits', estimatedTime: '20 min' },
          { name: 'Print physical checks if needed', estimatedTime: '15 min' },
          { name: 'Send pay stubs', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Email to Client', 'Update QuickBooks/Xero'] 
          },
        ],
      },
      {
        name: 'Tax Deposits',
        trackerLabel: 'Processing Tax Deposits',
        tasks: [
          { name: 'Calculate tax deposits', estimatedTime: '15 min' },
          { name: 'Submit federal deposits', estimatedTime: '10 min' },
          { name: 'Submit state deposits', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'deadline_passed', 
            actions: ['Escalate to Manager/Partner', 'Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Complete',
        trackerLabel: 'Payroll Complete',
        tasks: [
          { name: 'Generate payroll reports', estimatedTime: '10 min' },
          { name: 'Archive payroll records', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Generate & Send Report', 'Archive Completed Work'] 
          },
        ],
      },
    ],
  },
  {
    id: 'lead-to-client',
    name: 'Lead to Client Onboarding',
    description: 'Convert leads into clients with automated follow-ups and onboarding',
    category: 'Sales',
    icon: Users,
    complexity: 'Simple',
    estimatedSetupTime: '8 min',
    stages: [
      {
        name: 'New Lead',
        trackerLabel: 'Getting to Know You',
        tasks: [
          { name: 'Initial inquiry response', estimatedTime: '10 min' },
          { name: 'Schedule discovery call', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Create Calendar Event/Meeting', 'Create Follow-up Task'] 
          },
        ],
      },
      {
        name: 'Discovery',
        trackerLabel: 'Understanding Your Needs',
        tasks: [
          { name: 'Conduct discovery call', estimatedTime: '30 min' },
          { name: 'Assess service needs', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Email to Client', 'Create Follow-up Task'] 
          },
        ],
      },
      {
        name: 'Proposal',
        trackerLabel: 'Preparing Your Proposal',
        tasks: [
          { name: 'Create customized proposal', estimatedTime: '45 min' },
          { name: 'Manager review', estimatedTime: '15 min' },
          { name: 'Send proposal to lead', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Assign Task to Team Member'] 
          },
          { 
            trigger: 'specific_task_completed', 
            actions: ['Send Email to Client', 'Send Proposal/Quote'] 
          },
          { 
            trigger: 'no_client_response', 
            actions: ['Send Email to Client', 'Create Follow-up Task'] 
          },
        ],
      },
      {
        name: 'Contract',
        trackerLabel: 'Finalizing Agreement',
        tasks: [
          { name: 'Send engagement letter', estimatedTime: '10 min' },
          { name: 'Get contract signed', estimatedTime: '15 min' },
          { name: 'Process initial payment', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Engagement Letter', 'Request E-Signature'] 
          },
          { 
            trigger: 'document_received', 
            actions: ['Send Email to Client', 'Update Client Portal Status', 'Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Onboarding',
        trackerLabel: 'Welcome Aboard!',
        tasks: [
          { name: 'Set up client portal', estimatedTime: '20 min' },
          { name: 'Send welcome packet', estimatedTime: '15 min' },
          { name: 'Schedule kickoff meeting', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Client', 'Update Client Portal Status', 'Create Calendar Event/Meeting'] 
          },
          { 
            trigger: 'payment_received', 
            actions: ['Send Email to Client', 'Assign Task to Team Member'] 
          },
        ],
      },
      {
        name: 'Active Client',
        trackerLabel: 'Working Together',
        tasks: [
          { name: 'Conduct kickoff meeting', estimatedTime: '45 min' },
          { name: 'Create service delivery plan', estimatedTime: '30 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Slack/Teams Message', 'Create Follow-up Task'] 
          },
        ],
      },
    ],
  },
  {
    id: 'invoice-processing',
    name: 'Accounts Payable Processing',
    description: 'Streamlined invoice approval and payment workflow',
    category: 'Bookkeeping',
    icon: FileText,
    complexity: 'Simple',
    estimatedSetupTime: '6 min',
    stages: [
      {
        name: 'Invoice Received',
        trackerLabel: 'Processing Invoice',
        tasks: [
          { name: 'Scan/upload invoice', estimatedTime: '5 min' },
          { name: 'Enter invoice details', estimatedTime: '10 min' },
        ],
        automations: [
          { 
            trigger: 'document_received', 
            actions: ['Send Slack/Teams Message', 'Update Client Portal Status'] 
          },
        ],
      },
      {
        name: 'Approval',
        trackerLabel: 'Awaiting Approval',
        tasks: [
          { name: 'Manager review', estimatedTime: '10 min' },
          { name: 'Client approval if needed', estimatedTime: '15 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Send Email to Team Member', 'Create Follow-up Task'] 
          },
          { 
            trigger: 'no_client_response', 
            actions: ['Send Email to Client', 'Escalate to Manager/Partner'] 
          },
        ],
      },
      {
        name: 'Payment Scheduled',
        trackerLabel: 'Payment Scheduled',
        tasks: [
          { name: 'Schedule payment', estimatedTime: '5 min' },
          { name: 'Add to payment batch', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'days_before_deadline', 
            actions: ['Send Slack/Teams Message'] 
          },
        ],
      },
      {
        name: 'Paid',
        trackerLabel: 'Payment Complete',
        tasks: [
          { name: 'Process payment', estimatedTime: '10 min' },
          { name: 'Record in accounting system', estimatedTime: '5 min' },
        ],
        automations: [
          { 
            trigger: 'stage_entered', 
            actions: ['Update QuickBooks/Xero', 'Send Email to Client'] 
          },
        ],
      },
    ],
  },
];

export function WorkflowTemplates({ onSelectTemplate }: { onSelectTemplate: (template: WorkflowTemplate) => void }) {
  const categories = ['All', 'Bookkeeping', 'Tax', 'Payroll', 'Sales', 'Advisory'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = selectedCategory === 'All' 
    ? workflowTemplates 
    : workflowTemplates.filter(t => t.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-700 border-green-200';
      case 'Moderate': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Advanced': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Pre-Built Workflow Templates</h2>
        <p className="text-sm text-slate-500">
          Start with industry-specific templates designed for accounting, bookkeeping, and professional services firms
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-5 hover:shadow-md transition-all border-slate-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <template.icon className="w-6 h-6 text-violet-600" />
                </div>
                <Badge className={getComplexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-slate-900 mb-1">{template.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{template.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {template.stages.length} stages
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.estimatedSetupTime}
                </div>
              </div>

              {/* Action */}
              <Button 
                className="w-full"
                onClick={() => onSelectTemplate(template)}
              >
                Use This Template
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-8 border-dashed border-slate-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No templates found in this category</p>
          </div>
        </Card>
      )}
    </div>
  );
}
