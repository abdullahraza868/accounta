import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Trash2, Clock, Zap, FileCheck, CreditCard, Calendar, Edit2, ChevronDown, Info, Play, Loader2, CheckCircle, XCircle, AlertTriangle, Power, Filter } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// ==================== INTERFACES FROM AUTOMATIONBUILDER ====================
interface TriggerStructured {
  id: string;
  category: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
}

interface ActionStructured {
  id: string;
  category: string;
  name: string;
  config?: Record<string, any>;
}

interface ConditionField {
  value: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'enum' | 'boolean';
  enumOptions?: { value: string; label: string }[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'time' | 'multiselect' | 'textarea' | 'toggle';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  rows?: number;
}

interface Task {
  id: string;
  name: string;
}

interface Action {
  type: string;
  details: string;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  triggerTaskId?: string;
  triggerDocumentId?: string; // For document_signed trigger
  triggerOrganizerId?: string; // For organizer_submitted trigger
  triggerMeetingType?: string; // For meeting_scheduled trigger
  enabled: boolean;
  actions: string[];
  actionDetails?: Action[];
  conditions?: Condition[];
  details?: string;
  // New structured fields
  triggerObj?: TriggerStructured | null;
  actionObjs?: ActionStructured[];
  logicOperator?: 'AND' | 'OR';
}

interface AutomationBuilderProps {
  stageName?: string;
  tasks?: Task[];
  automations?: Automation[];
  focusedTaskId?: string | null;
  focusedAutomationId?: string | null;
  onAutomationsChange?: (automations: Automation[]) => void;
  workflow?: {
    id: string;
    name: string;
    stages: Array<{
      id: string;
      name: string;
      tasks?: Array<{ id: string; name: string }>;
    }>;
  };
  currentStageId?: string;
}

// ==================== MOCK DATA FROM AUTOMATIONBUILDER ====================

// Triggers with IDs
const MOCK_TRIGGERS: TriggerStructured[] = [
  // Stage
  { id: 't1', category: 'Stage', name: 'When Stage is Entered' },
  { id: 't2', category: 'Stage', name: 'When Stage is Completed' },
  { id: 't3', category: 'Stage', name: 'When Stage is Reopened' },
  // Task
  { id: 't4', category: 'Task', name: 'When Any Task Completed' },
  { id: 't5', category: 'Task', name: 'When Specific Task Completed' },
  { id: 't6', category: 'Task', name: 'When Task is Assigned' },
  { id: 't7', category: 'Task', name: 'When Task is Commented' },
  // Time
  { id: 't8', category: 'Time', name: 'Time After Stage Entered' },
  { id: 't9', category: 'Time', name: 'Time After Task Completed' },
  { id: 't10', category: 'Time', name: 'X Days Before Deadline' },
  { id: 't11', category: 'Time', name: 'When Deadline Passed' },
  { id: 't12', category: 'Time', name: 'Scheduled (Daily / Weekly / Monthly)' },
  // Client
  { id: 't13', category: 'Client', name: 'When Client Created' },
  { id: 't14', category: 'Client', name: 'When Client Status Changed' },
  { id: 't15', category: 'Client', name: "Client Hasn't Responded in X Days" },
  { id: 't16', category: 'Client', name: 'When Document Received' },
  { id: 't17', category: 'Client', name: 'When Document Signed' },
  { id: 't18', category: 'Client', name: 'When Form / Organizer Sent' },
  { id: 't19', category: 'Client', name: 'When Form / Organizer Submitted' },
  { id: 't20', category: 'Client', name: 'When Meeting is Scheduled' },
  // Financial
  { id: 't21', category: 'Financial', name: 'When Invoice Sent' },
  { id: 't22', category: 'Financial', name: 'When Payment Received' },
  { id: 't23', category: 'Financial', name: 'When Payment Overdue' },
  { id: 't24', category: 'Financial', name: 'When Subscription Payment Failed' },
  // Communication
  { id: 't25', category: 'Communication', name: 'When Email Replied' },
  { id: 't26', category: 'Communication', name: 'When SMS Replied' },
  { id: 't27', category: 'Communication', name: 'When Incoming Email Received' },
  { id: 't28', category: 'Communication', name: 'When Incoming SMS Received' },
  { id: 't29', category: 'Communication', name: 'When Incoming Email or SMS Received' },
  { id: 't30', category: 'Communication', name: 'When Outgoing SMS Error Occurs' },
  // Client (Lead Creation Variants)
  { id: 't31', category: 'Client', name: 'When Client Created via API' },
  { id: 't32', category: 'Client', name: 'When Client Created via Facebook' },
  { id: 't33', category: 'Client', name: 'When Client Created via Calendly' },
  { id: 't34', category: 'Client', name: 'When Custom Field Value Changed' },
];

// Actions with IDs
const MOCK_ACTIONS: ActionStructured[] = [
  // Communication
  { id: 'a1', category: 'Communication', name: 'Send Email to Client' },
  { id: 'a2', category: 'Communication', name: 'Send Email to Team Member' },
  { id: 'a3', category: 'Communication', name: 'Send Slack / Teams Message' },
  { id: 'a4', category: 'Communication', name: 'Send SMS Reminder' },
  // Client Portal
  { id: 'a5', category: 'Client Portal', name: 'Request Documents from Client' },
  { id: 'a6', category: 'Client Portal', name: 'Update Client Portal Status' },
  { id: 'a7', category: 'Client Portal', name: 'Send Form / Organizer' },
  // Sales / Engagement
  { id: 'a8', category: 'Sales / Engagement', name: 'Send Proposal / Quote' },
  { id: 'a9', category: 'Sales / Engagement', name: 'Send Engagement Letter' },
  { id: 'a10', category: 'Sales / Engagement', name: 'Request E-Signature' },
  // Task Management
  { id: 'a11', category: 'Task Management', name: 'Create Follow-up Task' },
  { id: 'a12', category: 'Task Management', name: 'Assign Task to Team Member' },
  { id: 'a13', category: 'Task Management', name: 'Auto-Complete Task' },
  { id: 'a14', category: 'Task Management', name: 'Escalate to Manager / Partner' },
  // Workflow
  { id: 'a15', category: 'Workflow', name: 'Move to Next Stage' },
  { id: 'a16', category: 'Workflow', name: 'Move Back to Stage' },
  { id: 'a17', category: 'Workflow', name: 'Archive Completed Work' },
  // Scheduling
  { id: 'a18', category: 'Scheduling', name: 'Create Calendar Event / Meeting' },
  // Reports
  { id: 'a19', category: 'Reports', name: 'Generate & Send Report' },
  // Integrations
  { id: 'a20', category: 'Integrations', name: 'Update QuickBooks / Xero' },
  { id: 'a21', category: 'Integrations', name: 'Send Webhook to External System' },
  // Utility
  { id: 'a22', category: 'Utility', name: 'Wait / Delay' },
  { id: 'a23', category: 'Utility', name: 'Notify Team (In-App)' },
  // Client Management
  { id: 'a24', category: 'Client Management', name: 'Assign Client to Team Member' },
  { id: 'a25', category: 'Client Management', name: 'Merge Client into Duplicate' },
  { id: 'a26', category: 'Client Management', name: 'Add Client to Do Not Contact List' },
  { id: 'a27', category: 'Client Management', name: 'Remove Client from Do Not Contact List' },
  // Communication Sequences
  { id: 'a28', category: 'Communication', name: 'Start Email Sequence' },
  { id: 'a29', category: 'Communication', name: 'Start SMS Sequence' },
  { id: 'a30', category: 'Communication', name: 'Stop All Sequences' },
  { id: 'a31', category: 'Communication', name: 'Send Client Details via Email' },
];

// Condition Fields with Type Metadata
const CONDITION_FIELDS: ConditionField[] = [
  { value: 'stage_name', label: 'Stage Name', type: 'text' },
  { value: 'workflow_name', label: 'Workflow Name', type: 'text' },
  { value: 'task_name', label: 'Task Name', type: 'text' },
  { value: 'assigned_user', label: 'Assigned User', type: 'text' },
  { 
    value: 'client_type', 
    label: 'Client Type', 
    type: 'enum',
    enumOptions: [
      { value: 'individual', label: 'Individual' },
      { value: 'business', label: 'Business' },
    ]
  },
  { value: 'client_tags', label: 'Client Tags', type: 'text' },
  { value: 'invoice_balance', label: 'Invoice Balance', type: 'number' },
  { value: 'days_overdue', label: 'Days Overdue', type: 'number' },
  { 
    value: 'form_type', 
    label: 'Form Type', 
    type: 'enum',
    enumOptions: [
      { value: 'tax_organizer', label: 'Tax Organizer' },
      { value: 'engagement_letter', label: 'Engagement Letter' },
      { value: 'questionnaire', label: 'Questionnaire' },
    ]
  },
];

// Operators by Field Type
const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  text: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'contains', label: 'contains' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_or_equal', label: '>=' },
    { value: 'less_or_equal', label: '<=' },
  ],
  date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
  ],
  enum: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'in_list', label: 'in list' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ],
};

// Mock data for configuration fields
const MOCK_CONFIG_TASKS = [
  { value: 'task1', label: 'Prepare tax documents' },
  { value: 'task2', label: 'Client intake call' },
  { value: 'task3', label: 'Review financial statements' },
  { value: 'task4', label: 'Submit tax return' },
];

const MOCK_TEAM_MEMBERS = [
  { value: 'user1', label: 'John Smith (Partner)' },
  { value: 'user2', label: 'Sarah Johnson (Manager)' },
  { value: 'user3', label: 'Mike Brown (Senior Accountant)' },
  { value: 'user4', label: 'Emily Davis (Staff Accountant)' },
];

const MOCK_STAGES = [
  { value: 'stage1', label: 'Initial Contact' },
  { value: 'stage2', label: 'Onboarding' },
  { value: 'stage3', label: 'Document Collection' },
  { value: 'stage4', label: 'In Progress' },
  { value: 'stage5', label: 'Review' },
  { value: 'stage6', label: 'Completed' },
];

const MOCK_EMAIL_TEMPLATES = [
  { value: 'template1', label: 'Welcome Email' },
  { value: 'template2', label: 'Document Request' },
  { value: 'template3', label: 'Payment Reminder' },
  { value: 'template4', label: 'Engagement Letter' },
  { value: 'template5', label: 'Tax Organizer' },
];

const MOCK_DOCUMENT_TYPES = [
  { value: 'w2', label: 'W-2 Form' },
  { value: '1099', label: '1099 Form' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'id', label: 'Government ID' },
  { value: 'receipt', label: 'Receipt' },
];

const MOCK_CLIENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
];

const MOCK_FORM_TYPES = [
  { value: 'tax_organizer', label: 'Tax Organizer' },
  { value: 'engagement_letter', label: 'Engagement Letter' },
  { value: 'questionnaire', label: 'Questionnaire' },
  { value: 'intake_form', label: 'Client Intake Form' },
];

const MOCK_REPORT_TYPES = [
  { value: 'monthly_summary', label: 'Monthly Summary Report' },
  { value: 'client_activity', label: 'Client Activity Report' },
  { value: 'revenue_report', label: 'Revenue Report' },
  { value: 'time_tracking', label: 'Time Tracking Report' },
];

const MOCK_EMAIL_SEQUENCES = [
  { value: 'seq1', label: 'Welcome Sequence' },
  { value: 'seq2', label: 'Onboarding Sequence' },
  { value: 'seq3', label: 'Follow-up Sequence' },
  { value: 'seq4', label: 'Payment Reminder Sequence' },
  { value: 'seq5', label: 'Document Request Sequence' },
];

const MOCK_SMS_SEQUENCES = [
  { value: 'sms_seq1', label: 'Welcome SMS Sequence' },
  { value: 'sms_seq2', label: 'Reminder SMS Sequence' },
  { value: 'sms_seq3', label: 'Appointment SMS Sequence' },
  { value: 'sms_seq4', label: 'Payment SMS Sequence' },
];

const MOCK_EMAIL_ACCOUNTS = [
  { value: 'email1', label: 'noreply@accounta.com' },
  { value: 'email2', label: 'support@accounta.com' },
  { value: 'email3', label: 'info@accounta.com' },
];

const MOCK_PHONE_ACCOUNTS = [
  { value: 'phone1', label: '+1 (555) 123-4567' },
  { value: 'phone2', label: '+1 (555) 987-6543' },
  { value: 'phone3', label: '+1 (555) 456-7890' },
];

const MOCK_ERROR_CODES = [
  { value: '11751', label: '11751 - Media exceeds size limit' },
  { value: '12300', label: '12300 - Invalid Content-Type' },
  { value: '30003', label: '30003 - Unavailable destination' },
  { value: '30005', label: '30005 - Unknown/inactive number' },
  { value: '30006', label: '30006 - Landline/unreachable' },
  { value: '30007', label: '30007 - Blocked by carrier' },
  { value: '30008', label: '30008 - Delivery failed' },
  { value: '30011', label: '30011 - MMS not supported' },
  { value: '30019', label: '30019 - Content size exceeds limit' },
  { value: '30410', label: '30410 - Provider timeout' },
];

const MOCK_CUSTOM_FIELDS = [
  { value: 'none', label: 'None (Any Custom Field)' },
  { value: 'budget', label: 'Budget' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'source', label: 'Source' },
  { value: 'industry', label: 'Industry' },
];

// Trigger Configuration Schemas
const TRIGGER_CONFIG_SCHEMAS: Record<string, ConfigField[]> = {
  't5': [ // When Specific Task Completed
    { key: 'taskId', label: 'Select Task', type: 'select', required: true, options: MOCK_CONFIG_TASKS },
  ],
  't7': [ // When Task is Commented
    { key: 'taskId', label: 'Specific Task (Optional)', type: 'select', required: false, options: MOCK_CONFIG_TASKS, placeholder: 'Any task' },
  ],
  't8': [ // Time After Stage Entered
    { key: 'days', label: 'Days', type: 'number', required: true, min: 0, placeholder: '0' },
    { key: 'hours', label: 'Hours', type: 'number', required: false, min: 0, max: 23, placeholder: '0' },
  ],
  't9': [ // Time After Task Completed
    { key: 'days', label: 'Days', type: 'number', required: true, min: 0, placeholder: '0' },
    { key: 'hours', label: 'Hours', type: 'number', required: false, min: 0, max: 23, placeholder: '0' },
    { key: 'taskId', label: 'Specific Task (Optional)', type: 'select', required: false, options: MOCK_CONFIG_TASKS, placeholder: 'Any task' },
  ],
  't10': [ // X Days Before Deadline
    { key: 'days', label: 'Days Before Deadline', type: 'number', required: true, min: 1, placeholder: '7' },
  ],
  't12': [ // Scheduled (Daily / Weekly / Monthly)
    { key: 'scheduleType', label: 'Frequency', type: 'select', required: true, options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
    ]},
    { key: 'scheduleTime', label: 'Time', type: 'time', required: true, placeholder: '09:00' },
    { key: 'scheduleDay', label: 'Day', type: 'select', required: false, options: [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' },
    ]},
  ],
  't14': [ // When Client Status Changed
    { key: 'status', label: 'To Status', type: 'select', required: true, options: MOCK_CLIENT_STATUSES },
  ],
  't15': [ // Client Hasn't Responded in X Days
    { key: 'days', label: 'Number of Days', type: 'number', required: true, min: 1, placeholder: '7' },
  ],
  't16': [ // When Document Received
    { key: 'documentType', label: 'Document Type (Optional)', type: 'select', required: false, options: MOCK_DOCUMENT_TYPES, placeholder: 'Any document' },
  ],
  't17': [ // When Document Signed
    { key: 'documentType', label: 'Document Type (Optional)', type: 'select', required: false, options: MOCK_DOCUMENT_TYPES, placeholder: 'Any document' },
  ],
  't18': [ // When Form / Organizer Sent
    { key: 'formType', label: 'Form Type (Optional)', type: 'select', required: false, options: MOCK_FORM_TYPES, placeholder: 'Any form' },
  ],
  't19': [ // When Form / Organizer Submitted
    { key: 'formType', label: 'Form Type (Optional)', type: 'select', required: false, options: MOCK_FORM_TYPES, placeholder: 'Any form' },
  ],
  't27': [ // When Incoming Email Received
    { key: 'textMatching', label: 'Text to Match (Optional)', type: 'text', required: false, placeholder: 'Enter text to match (supports | for multiple)' },
    { key: 'textMatchingType', label: 'Matching Type', type: 'select', required: false, options: [
      { value: 'exact', label: 'Exact Match' },
      { value: 'word', label: 'Contains Word' },
      { value: 'any', label: 'Any Match (Regex)' },
    ], placeholder: 'Select matching type' },
  ],
  't28': [ // When Incoming SMS Received
    { key: 'textMatching', label: 'Text to Match (Optional)', type: 'text', required: false, placeholder: 'Enter text to match (supports | for multiple)' },
    { key: 'textMatchingType', label: 'Matching Type', type: 'select', required: false, options: [
      { value: 'exact', label: 'Exact Match' },
      { value: 'word', label: 'Contains Word' },
      { value: 'any', label: 'Any Match (Regex)' },
    ], placeholder: 'Select matching type' },
  ],
  't29': [ // When Incoming Email or SMS Received
    { key: 'textMatching', label: 'Text to Match (Optional)', type: 'text', required: false, placeholder: 'Enter text to match (supports | for multiple)' },
    { key: 'textMatchingType', label: 'Matching Type', type: 'select', required: false, options: [
      { value: 'exact', label: 'Exact Match' },
      { value: 'word', label: 'Contains Word' },
      { value: 'any', label: 'Any Match (Regex)' },
    ], placeholder: 'Select matching type' },
  ],
  't30': [ // When Outgoing SMS Error Occurs
    { key: 'errorCodes', label: 'Error Codes', type: 'multiselect', required: false, options: MOCK_ERROR_CODES, placeholder: 'Select error codes (leave empty for all)' },
  ],
  't34': [ // When Custom Field Value Changed
    { key: 'customField', label: 'Custom Field (Optional)', type: 'select', required: false, options: MOCK_CUSTOM_FIELDS, placeholder: 'Any custom field' },
  ],
};

// ==================== TEST AUTOMATION INTERFACES ====================
interface TestLogEntry {
  step: number;
  type: 'trigger' | 'condition' | 'action';
  status: 'success' | 'warning' | 'error' | 'skipped';
  title: string;
  details: string[];
  timestamp: Date;
  duration?: number;
  error?: string;
}

interface MockTriggerEvent {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface MockConditionData {
  [key: string]: any;
}

interface MockActionResult {
  success: boolean;
  details: string[];
  error?: string;
  duration: number;
}

interface TestResult {
  success: boolean;
  overallStatus: 'success' | 'partial' | 'failed';
  executionTime: number;
  logs: TestLogEntry[];
  summary: string;
}

// ==================== MOCK DATA CONSTANTS ====================
const MOCK_SAMPLE_DATA = {
  clientEmail: 'client@example.com',
  clientName: 'John Smith',
  clientType: 'Business',
  projectId: 'proj_123',
  projectName: 'Tax Preparation 2024',
  teamMember: 'Sarah Johnson',
  teamMemberEmail: 'sarah@example.com',
  taskName: 'Review Documents',
  invoiceBalance: 2500,
  daysOverdue: 5,
  documentType: 'W-2 Form',
  paymentAmount: 1500,
};

// ==================== MOCK DATA GENERATORS ====================
function generateMockTriggerEvent(
  trigger: TriggerStructured,
  triggerConfig: Record<string, any>,
  workflow?: AutomationBuilderProps['workflow'],
  currentStageId?: string,
  tasks?: Task[]
): MockTriggerEvent {
  const now = new Date();
  const baseData: Record<string, any> = {
    timestamp: now,
    projectId: MOCK_SAMPLE_DATA.projectId,
    projectName: MOCK_SAMPLE_DATA.projectName,
  };

  switch (trigger.id) {
    case 't1': // Stage Entered
      return {
        type: 'stage_entered',
        data: {
          ...baseData,
          stageName: currentStageId 
            ? workflow?.stages.find(s => s.id === currentStageId)?.name || 'Onboarding'
            : 'Onboarding',
          stageId: currentStageId || 'stage_1',
        },
        timestamp: now,
      };
    
    case 't2': // Stage Completed
      return {
        type: 'stage_completed',
        data: {
          ...baseData,
          stageName: currentStageId 
            ? workflow?.stages.find(s => s.id === currentStageId)?.name || 'Review'
            : 'Review',
          stageId: currentStageId || 'stage_2',
        },
        timestamp: now,
      };
    
    case 't4': // Any Task Completed
      return {
        type: 'task_completed',
        data: {
          ...baseData,
          taskName: tasks && tasks.length > 0 ? tasks[0].name : MOCK_SAMPLE_DATA.taskName,
          taskId: tasks && tasks.length > 0 ? tasks[0].id : 'task_1',
          assignee: MOCK_SAMPLE_DATA.teamMember,
        },
        timestamp: now,
      };
    
    case 't5': // Specific Task Completed
      const taskId = triggerConfig.taskId;
      const task = tasks?.find(t => t.id === taskId) || tasks?.[0];
      return {
        type: 'task_completed',
        data: {
          ...baseData,
          taskName: task?.name || MOCK_SAMPLE_DATA.taskName,
          taskId: task?.id || taskId || 'task_1',
          assignee: MOCK_SAMPLE_DATA.teamMember,
        },
        timestamp: now,
      };
    
    case 't8': // Time After Stage
      const days = triggerConfig.days || 3;
      const hours = triggerConfig.hours || 0;
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + days);
      futureDate.setHours(futureDate.getHours() + hours);
      return {
        type: 'time_after_stage',
        data: {
          ...baseData,
          stageName: currentStageId 
            ? workflow?.stages.find(s => s.id === currentStageId)?.name || 'Onboarding'
            : 'Onboarding',
          days,
          hours,
          triggerTime: futureDate,
        },
        timestamp: futureDate,
      };
    
    case 't13': // Client Created
      return {
        type: 'client_created',
        data: {
          ...baseData,
          clientName: MOCK_SAMPLE_DATA.clientName,
          clientEmail: MOCK_SAMPLE_DATA.clientEmail,
          clientType: MOCK_SAMPLE_DATA.clientType,
        },
        timestamp: now,
      };
    
    case 't21': // Invoice Sent
      return {
        type: 'invoice_sent',
        data: {
          ...baseData,
          invoiceId: 'inv_123',
          invoiceAmount: MOCK_SAMPLE_DATA.invoiceBalance,
          clientName: MOCK_SAMPLE_DATA.clientName,
        },
        timestamp: now,
      };
    
    case 't22': // Payment Received
      return {
        type: 'payment_received',
        data: {
          ...baseData,
          paymentId: 'pay_123',
          paymentAmount: MOCK_SAMPLE_DATA.paymentAmount,
          clientName: MOCK_SAMPLE_DATA.clientName,
        },
        timestamp: now,
      };
    
    case 't27': // Incoming Email
      return {
        type: 'incoming_email',
        data: {
          ...baseData,
          emailFrom: MOCK_SAMPLE_DATA.clientEmail,
          emailSubject: 'Incoming Email Subject',
          emailBody: triggerConfig.textMatching || 'Sample email body',
          textMatching: triggerConfig.textMatching,
          textMatchingType: triggerConfig.textMatchingType,
        },
        timestamp: now,
      };
    
    case 't28': // Incoming SMS
      return {
        type: 'incoming_sms',
        data: {
          ...baseData,
          smsFrom: '+15551234567',
          smsBody: triggerConfig.textMatching || 'Sample SMS message',
          textMatching: triggerConfig.textMatching,
          textMatchingType: triggerConfig.textMatchingType,
        },
        timestamp: now,
      };
    
    case 't29': // Incoming Email or SMS
      return {
        type: 'incoming_any',
        data: {
          ...baseData,
          channel: 'email',
          message: triggerConfig.textMatching || 'Sample message',
          textMatching: triggerConfig.textMatching,
          textMatchingType: triggerConfig.textMatchingType,
        },
        timestamp: now,
      };
    
    case 't30': // Outgoing SMS Error
      return {
        type: 'outgoing_sms_error',
        data: {
          ...baseData,
          errorCode: triggerConfig.errorCodes?.[0] || '30008',
          errorCodes: triggerConfig.errorCodes || [],
          smsTo: '+15551234567',
        },
        timestamp: now,
      };
    
    case 't31': // Client Created via API
      return {
        type: 'client_created_api',
        data: {
          ...baseData,
          clientName: MOCK_SAMPLE_DATA.clientName,
          clientEmail: MOCK_SAMPLE_DATA.clientEmail,
          createProvider: 'api',
        },
        timestamp: now,
      };
    
    case 't32': // Client Created via Facebook
      return {
        type: 'client_created_facebook',
        data: {
          ...baseData,
          clientName: MOCK_SAMPLE_DATA.clientName,
          clientEmail: MOCK_SAMPLE_DATA.clientEmail,
          createProvider: 'facebook',
        },
        timestamp: now,
      };
    
    case 't33': // Client Created via Calendly
      return {
        type: 'client_created_calendly',
        data: {
          ...baseData,
          clientName: MOCK_SAMPLE_DATA.clientName,
          clientEmail: MOCK_SAMPLE_DATA.clientEmail,
          createProvider: 'calendly',
        },
        timestamp: now,
      };
    
    case 't34': // Custom Field Value Changed
      return {
        type: 'custom_field_changed',
        data: {
          ...baseData,
          customField: triggerConfig.customField || 'budget',
          oldValue: '10000',
          newValue: '15000',
        },
        timestamp: now,
      };
    
    default:
      return {
        type: 'generic_trigger',
        data: baseData,
        timestamp: now,
      };
  }
}

function generateMockConditionData(
  conditions: Condition[],
  triggerEvent: MockTriggerEvent
): MockConditionData {
  const mockData: MockConditionData = {
    stage_name: triggerEvent.data.stageName || 'Onboarding',
    workflow_name: triggerEvent.data.projectName || 'Tax Preparation Workflow',
    task_name: triggerEvent.data.taskName || MOCK_SAMPLE_DATA.taskName,
    assigned_user: triggerEvent.data.assignee || MOCK_SAMPLE_DATA.teamMember,
    client_type: MOCK_SAMPLE_DATA.clientType,
    client_tags: 'VIP, Priority',
    invoice_balance: MOCK_SAMPLE_DATA.invoiceBalance,
    days_overdue: MOCK_SAMPLE_DATA.daysOverdue,
    form_type: 'tax_organizer',
  };

  return mockData;
}

function simulateActionExecution(
  action: ActionStructured,
  actionConfig: Record<string, any>,
  triggerEvent: MockTriggerEvent,
  workflow?: AutomationBuilderProps['workflow'],
  currentStageId?: string
): MockActionResult {
  const startTime = Date.now();
  const details: string[] = [];
  let success = true;
  let error: string | undefined;

  // Simulate execution delay
  const duration = Math.random() * 200 + 100; // 100-300ms

  switch (action.id) {
    case 'a1': // Send Email to Client
      const templateId = actionConfig.templateId;
      const subject = actionConfig.subject || 'Automated Email';
      details.push(`To: ${MOCK_SAMPLE_DATA.clientEmail}`);
      details.push(`Subject: "${subject}"`);
      if (templateId) {
        const template = MOCK_EMAIL_TEMPLATES.find(t => t.value === templateId);
        if (template) details.push(`Template: ${template.label}`);
      }
      break;
    
    case 'a2': // Send Email to Team Member
      const assigneeId = actionConfig.assigneeId;
      const teamMember = MOCK_TEAM_MEMBERS.find(m => m.value === assigneeId);
      details.push(`To: ${teamMember?.label || MOCK_SAMPLE_DATA.teamMemberEmail}`);
      details.push(`Subject: "${actionConfig.subject || 'Team Notification'}"`);
      break;
    
    case 'a11': { // Create Follow-up Task
      details.push(`Task: "${actionConfig.taskName || 'Follow-up Task'}"`);
      if (actionConfig.assigneeId) {
        const assignee = MOCK_TEAM_MEMBERS.find(m => m.value === actionConfig.assigneeId);
        details.push(`Assignee: ${assignee?.label || 'Unassigned'}`);
      }
      if (actionConfig.dueDateOffset) {
        details.push(`Due in: ${actionConfig.dueDateOffset} days`);
      }
      break;
    }
    
    case 'a12': { // Assign Task to Team Member
      const taskId = actionConfig.taskId;
      const task = MOCK_CONFIG_TASKS.find(t => t.value === taskId);
      const assignee = MOCK_TEAM_MEMBERS.find(m => m.value === actionConfig.assigneeId);
      details.push(`Task: ${task?.label || 'Selected Task'}`);
      details.push(`Assigned to: ${assignee?.label || 'Team Member'}`);
      break;
    }
    
    case 'a15': { // Move to Next Stage
      const currentStage = workflow?.stages.find(s => s.id === currentStageId);
      const currentIndex = workflow?.stages.findIndex(s => s.id === currentStageId) || 0;
      const nextStage = workflow?.stages[currentIndex + 1];
      details.push(`From: ${currentStage?.name || 'Current Stage'}`);
      details.push(`To: ${nextStage?.name || 'Next Stage'}`);
      break;
    }
    
    case 'a16': { // Move Back to Stage
      const targetStageId = actionConfig.targetStageId;
      const targetStage = workflow?.stages.find(s => s.id === targetStageId);
      details.push(`Target Stage: ${targetStage?.name || 'Selected Stage'}`);
      break;
    }
    
    case 'a24': { // Assign Client to Team Member
      const assignee = MOCK_TEAM_MEMBERS.find(m => m.value === actionConfig.assigneeId);
      details.push(`Assigned to: ${assignee?.label || 'Team Member'}`);
      break;
    }
    
    case 'a25': { // Merge Client into Duplicate
      details.push(`Merge by: ${actionConfig.mergeBy || 'email'}`);
      details.push(`Finding duplicate by ${actionConfig.mergeBy || 'email'} address`);
      break;
    }
    
    case 'a26': { // Add to DNC
      details.push(`All client contacts added to Do Not Contact list`);
      break;
    }
    
    case 'a27': { // Remove from DNC
      details.push(`All client contacts removed from Do Not Contact list`);
      break;
    }
    
    case 'a28': { // Start Email Sequence
      const emailSeq = MOCK_EMAIL_SEQUENCES.find(s => s.value === actionConfig.emailSequenceTemplateId);
      const emailAccount = MOCK_EMAIL_ACCOUNTS.find(a => a.value === actionConfig.emailAccountId);
      details.push(`Sequence: ${emailSeq?.label || 'Email Sequence'}`);
      details.push(`From: ${emailAccount?.label || 'Email Account'}`);
      break;
    }
    
    case 'a29': { // Start SMS Sequence
      const smsSeq = MOCK_SMS_SEQUENCES.find(s => s.value === actionConfig.smsSequenceTemplateId);
      const phoneAccount = MOCK_PHONE_ACCOUNTS.find(a => a.value === actionConfig.phoneAccountId);
      details.push(`Sequence: ${smsSeq?.label || 'SMS Sequence'}`);
      details.push(`From: ${phoneAccount?.label || 'Phone Account'}`);
      break;
    }
    
    case 'a30': // Stop All Sequences
      details.push(`All active email and SMS sequences stopped`);
      break;
    
    case 'a31': // Send Client Details via Email
      details.push(`To: ${actionConfig.recipientEmail || 'recipient@example.com'}`);
      details.push(`Subject: Client Details - ${MOCK_SAMPLE_DATA.clientName}`);
      break;
    
    default:
      details.push(`Action: ${action.name}`);
      details.push(`Status: Executed`);
  }

  return {
    success,
    details,
    error,
    duration: Date.now() - startTime,
  };
}

// ==================== CONDITION EVALUATOR ====================
function evaluateCondition(
  condition: Condition,
  mockData: MockConditionData
): { passed: boolean; reason: string } {
  const field = CONDITION_FIELDS.find(f => f.value === condition.field);
  if (!field) {
    return { passed: false, reason: 'Unknown condition field' };
  }

  const conditionValue = condition.value;
  const mockValue = mockData[condition.field];

  if (mockValue === undefined) {
    return { passed: false, reason: `No mock data available for field: ${field.label}` };
  }

  switch (condition.operator) {
    case 'is':
      if (field.type === 'text' || field.type === 'enum') {
        const passed = String(mockValue).toLowerCase() === String(conditionValue).toLowerCase();
        return {
          passed,
          reason: passed
            ? `${field.label} is "${conditionValue}" (matches)`
            : `${field.label} is "${mockValue}" (expected "${conditionValue}")`,
        };
      }
      break;
    
    case 'is_not':
      if (field.type === 'text' || field.type === 'enum') {
        const passed = String(mockValue).toLowerCase() !== String(conditionValue).toLowerCase();
        return {
          passed,
          reason: passed
            ? `${field.label} is not "${conditionValue}" (matches)`
            : `${field.label} is "${mockValue}" (should not be "${conditionValue}")`,
        };
      }
      break;
    
    case 'contains':
      if (field.type === 'text') {
        const passed = String(mockValue).toLowerCase().includes(String(conditionValue).toLowerCase());
        return {
          passed,
          reason: passed
            ? `${field.label} contains "${conditionValue}" (matches)`
            : `${field.label} is "${mockValue}" (does not contain "${conditionValue}")`,
        };
      }
      break;
    
    case 'equals':
      if (field.type === 'number') {
        const passed = Number(mockValue) === Number(conditionValue);
        return {
          passed,
          reason: passed
            ? `${field.label} equals ${conditionValue} (matches)`
            : `${field.label} is ${mockValue} (expected ${conditionValue})`,
        };
      }
      break;
    
    case 'greater_than':
      if (field.type === 'number') {
        const passed = Number(mockValue) > Number(conditionValue);
        return {
          passed,
          reason: passed
            ? `${field.label} (${mockValue}) > ${conditionValue} (matches)`
            : `${field.label} is ${mockValue} (not greater than ${conditionValue})`,
        };
      }
      break;
    
    case 'less_than':
      if (field.type === 'number') {
        const passed = Number(mockValue) < Number(conditionValue);
        return {
          passed,
          reason: passed
            ? `${field.label} (${mockValue}) < ${conditionValue} (matches)`
            : `${field.label} is ${mockValue} (not less than ${conditionValue})`,
        };
      }
      break;
    
    case 'greater_or_equal':
      if (field.type === 'number') {
        const passed = Number(mockValue) >= Number(conditionValue);
        return {
          passed,
          reason: passed
            ? `${field.label} (${mockValue}) >= ${conditionValue} (matches)`
            : `${field.label} is ${mockValue} (not >= ${conditionValue})`,
        };
      }
      break;
    
    case 'less_or_equal':
      if (field.type === 'number') {
        const passed = Number(mockValue) <= Number(conditionValue);
        return {
          passed,
          reason: passed
            ? `${field.label} (${mockValue}) <= ${conditionValue} (matches)`
            : `${field.label} is ${mockValue} (not <= ${conditionValue})`,
        };
      }
      break;
  }

  return { passed: false, reason: `Unsupported operator: ${condition.operator} for field type: ${field.type}` };
}

function evaluateAllConditions(
  conditions: Condition[],
  logicOperator: 'AND' | 'OR',
  mockData: MockConditionData
): { 
  passed: boolean; 
  details: Array<{ condition: Condition; passed: boolean; reason: string }> 
} {
  if (conditions.length === 0) {
    return { passed: true, details: [] };
  }

  const details = conditions.map(condition => {
    const result = evaluateCondition(condition, mockData);
    return {
      condition,
      passed: result.passed,
      reason: result.reason,
    };
  });

  let passed: boolean;
  if (logicOperator === 'AND') {
    passed = details.every(d => d.passed);
  } else {
    passed = details.some(d => d.passed);
  }

  return { passed, details };
}

// ==================== TEST EXECUTION ENGINE ====================
async function runAutomationTest(
  automation: {
    triggerObj: TriggerStructured | null;
    triggerConfig: Record<string, any>;
    conditions: Condition[];
    logicOperator: 'AND' | 'OR';
    actionObjs: ActionStructured[];
    actionConfigs: Record<number, Record<string, any>>;
  },
  workflow?: AutomationBuilderProps['workflow'],
  currentStageId?: string,
  tasks?: Task[]
): Promise<TestResult> {
  const startTime = Date.now();
  const logs: TestLogEntry[] = [];
  let step = 1;

  // Phase 1: Simulate Trigger Event
  if (!automation.triggerObj) {
    return {
      success: false,
      overallStatus: 'failed',
      executionTime: Date.now() - startTime,
      logs: [{
        step: 1,
        type: 'trigger',
        status: 'error',
        title: 'Trigger Not Selected',
        details: ['No trigger configured'],
        timestamp: new Date(),
        error: 'Please select a trigger before testing',
      }],
      summary: 'Test failed: No trigger selected',
    };
  }

  const triggerEvent = generateMockTriggerEvent(
    automation.triggerObj,
    automation.triggerConfig,
    workflow,
    currentStageId,
    tasks
  );

  logs.push({
    step: step++,
    type: 'trigger',
    status: 'success',
    title: `Trigger: ${automation.triggerObj.name}`,
    details: Object.entries(triggerEvent.data).map(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${label}: ${value}`;
    }),
    timestamp: triggerEvent.timestamp,
  });

  // Phase 2: Evaluate Conditions
  if (automation.conditions.length > 0) {
    const mockData = generateMockConditionData(automation.conditions, triggerEvent);
    const conditionResult = evaluateAllConditions(
      automation.conditions,
      automation.logicOperator,
      mockData
    );

    const conditionDetails: string[] = [];
    conditionResult.details.forEach((detail, idx) => {
      const status = detail.passed ? '✅' : '❌';
      conditionDetails.push(`${status} ${detail.reason}`);
    });
    conditionDetails.push(`Logic: ${automation.logicOperator}`);
    conditionDetails.push(`Overall: ${conditionResult.passed ? 'PASSED' : 'FAILED'}`);

    logs.push({
      step: step++,
      type: 'condition',
      status: conditionResult.passed ? 'success' : 'warning',
      title: 'Conditions Evaluated',
      details: conditionDetails,
      timestamp: new Date(),
    });

    if (!conditionResult.passed) {
      return {
        success: false,
        overallStatus: 'failed',
        executionTime: Date.now() - startTime,
        logs,
        summary: `Test stopped: Conditions not met (${automation.logicOperator} logic)`,
      };
    }
  } else {
    logs.push({
      step: step++,
      type: 'condition',
      status: 'skipped',
      title: 'No Conditions',
      details: ['Automation will run for all triggers'],
      timestamp: new Date(),
    });
  }

  // Phase 3: Execute Actions
  const actionResults: Array<{ success: boolean; action: ActionStructured }> = [];
  
  for (let i = 0; i < automation.actionObjs.length; i++) {
    const action = automation.actionObjs[i];
    if (!action.id) {
      logs.push({
        step: step++,
        type: 'action',
        status: 'error',
        title: `Action ${i + 1}: Not Selected`,
        details: ['Action not configured'],
        timestamp: new Date(),
        error: 'Please select an action',
      });
      actionResults.push({ success: false, action });
      continue;
    }

    const actionConfig = automation.actionConfigs[i] || {};
    const result = simulateActionExecution(
      action,
      actionConfig,
      triggerEvent,
      workflow,
      currentStageId
    );

    logs.push({
      step: step++,
      type: 'action',
      status: result.success ? 'success' : 'error',
      title: `Action ${i + 1}: ${action.name}`,
      details: result.details,
      timestamp: new Date(),
      duration: result.duration,
      error: result.error,
    });

    actionResults.push({ success: result.success, action });
  }

  // Phase 4: Summary
  const allActionsSucceeded = actionResults.every(r => r.success);
  const someActionsSucceeded = actionResults.some(r => r.success);
  
  let overallStatus: 'success' | 'partial' | 'failed';
  if (allActionsSucceeded && actionResults.length > 0) {
    overallStatus = 'success';
  } else if (someActionsSucceeded) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'failed';
  }

  const executionTime = Date.now() - startTime;
  const summary = overallStatus === 'success'
    ? `Automation would execute successfully. All ${actionResults.length} action(s) completed.`
    : overallStatus === 'partial'
    ? `Automation partially succeeded. ${actionResults.filter(r => r.success).length} of ${actionResults.length} action(s) completed.`
    : `Automation failed. No actions executed successfully.`;

  return {
    success: overallStatus === 'success',
    overallStatus,
    executionTime,
    logs,
    summary,
  };
}

// ==================== DYNAMIC SCHEMA RESOLVERS ====================

// Helper function to get workflow-specific options
function getWorkflowOptions(
  fieldKey: string,
  workflow?: AutomationBuilderProps['workflow'],
  currentStageId?: string,
  tasks?: Task[]
): { value: string; label: string }[] {
  switch (fieldKey) {
    case 'targetStageId':
      // Return all stages from the workflow, excluding current stage
      if (workflow?.stages) {
        return workflow.stages
          .filter(s => s.id !== currentStageId)
          .map(s => ({ value: s.id, label: s.name }));
      }
      return MOCK_STAGES; // Fallback to mock data
    
    case 'taskId':
      // Return tasks from current stage or all workflow tasks
      if (tasks && tasks.length > 0) {
        return tasks.map(t => ({ value: t.id, label: t.name }));
      }
      if (workflow?.stages) {
        // Flatten all tasks from all stages
        const allTasks = workflow.stages
          .flatMap(s => s.tasks || [])
          .map(t => ({ value: t.id, label: t.name }));
        return allTasks.length > 0 ? allTasks : MOCK_CONFIG_TASKS;
      }
      return MOCK_CONFIG_TASKS; // Fallback
    
    default:
      return [];
  }
}

// Function to get resolved schema with dynamic options
function getActionConfigSchema(
  actionId: string,
  workflow?: AutomationBuilderProps['workflow'],
  currentStageId?: string,
  tasks?: Task[]
): ConfigField[] {
  const baseSchema = ACTION_CONFIG_SCHEMAS[actionId] || [];
  
  return baseSchema.map(field => {
    // Resolve dynamic options based on field key
    const dynamicOptions = getWorkflowOptions(field.key, workflow, currentStageId, tasks);
    if (dynamicOptions.length > 0) {
      return { ...field, options: dynamicOptions };
    }
    
    // Keep existing options if no dynamic options found
    return field;
  });
}

// Action Configuration Schemas
const ACTION_CONFIG_SCHEMAS: Record<string, ConfigField[]> = {
  'a1': [ // Send Email to Client
    { key: 'templateId', label: 'Email Template', type: 'select', required: true, options: MOCK_EMAIL_TEMPLATES },
    { key: 'subject', label: 'Subject (Optional Override)', type: 'text', required: false, placeholder: 'Leave blank to use template' },
    { key: 'body', label: 'Additional Message', type: 'textarea', required: false, rows: 3, placeholder: 'Add custom message...' },
  ],
  'a2': [ // Send Email to Team Member
    { key: 'assigneeId', label: 'Team Member', type: 'select', required: true, options: MOCK_TEAM_MEMBERS },
    { key: 'templateId', label: 'Email Template', type: 'select', required: true, options: MOCK_EMAIL_TEMPLATES },
    { key: 'subject', label: 'Subject (Optional Override)', type: 'text', required: false, placeholder: 'Leave blank to use template' },
  ],
  'a3': [ // Send Slack / Teams Message
    { key: 'channel', label: 'Platform', type: 'select', required: true, options: [
      { value: 'slack', label: 'Slack' },
      { value: 'teams', label: 'Microsoft Teams' },
    ]},
    { key: 'recipient', label: 'Channel / User', type: 'text', required: true, placeholder: '#general or @username' },
    { key: 'body', label: 'Message', type: 'textarea', required: true, rows: 3, placeholder: 'Message content...' },
  ],
  'a4': [ // Send SMS Reminder
    { key: 'body', label: 'Message', type: 'textarea', required: true, rows: 3, placeholder: 'SMS message (160 chars max)...' },
  ],
  'a5': [ // Request Documents from Client
    { key: 'documentTypes', label: 'Document Types', type: 'multiselect', required: true, options: MOCK_DOCUMENT_TYPES },
    { key: 'body', label: 'Additional Instructions', type: 'textarea', required: false, rows: 3, placeholder: 'Optional message...' },
  ],
  'a6': [ // Update Client Portal Status
    { key: 'portalStatus', label: 'Portal Status', type: 'select', required: true, options: [
      { value: 'awaiting_documents', label: 'Awaiting Documents' },
      { value: 'in_review', label: 'In Review' },
      { value: 'ready_for_signature', label: 'Ready for Signature' },
      { value: 'completed', label: 'Completed' },
    ]},
  ],
  'a7': [ // Send Form / Organizer
    { key: 'formId', label: 'Form', type: 'select', required: true, options: MOCK_FORM_TYPES },
    { key: 'body', label: 'Message to Client', type: 'textarea', required: false, rows: 3, placeholder: 'Optional message...' },
  ],
  'a8': [ // Send Proposal / Quote
    { key: 'templateId', label: 'Proposal Template', type: 'select', required: true, options: [
      { value: 'standard_tax', label: 'Standard Tax Return' },
      { value: 'business_tax', label: 'Business Tax Return' },
      { value: 'bookkeeping', label: 'Bookkeeping Services' },
      { value: 'consulting', label: 'Consulting Services' },
    ]},
    { key: 'body', label: 'Additional Notes', type: 'textarea', required: false, rows: 3, placeholder: 'Optional notes...' },
  ],
  'a9': [ // Send Engagement Letter
    { key: 'templateId', label: 'Engagement Letter Template', type: 'select', required: true, options: [
      { value: 'individual_tax', label: 'Individual Tax Return' },
      { value: 'business_tax', label: 'Business Tax Return' },
      { value: 'audit', label: 'Audit Engagement' },
      { value: 'advisory', label: 'Advisory Services' },
    ]},
  ],
  'a10': [ // Request E-Signature
    { key: 'documentType', label: 'Document', type: 'select', required: true, options: [
      { value: 'engagement_letter', label: 'Engagement Letter' },
      { value: 'tax_return', label: 'Tax Return' },
      { value: 'form_8879', label: 'Form 8879' },
      { value: 'contract', label: 'Contract' },
    ]},
  ],
  'a11': [ // Create Follow-up Task
    { key: 'taskName', label: 'Task Name', type: 'text', required: true, placeholder: 'Enter task name...' },
    { key: 'assigneeId', label: 'Assign To', type: 'select', required: false, options: MOCK_TEAM_MEMBERS, placeholder: 'Unassigned' },
    { key: 'dueDateOffset', label: 'Due In (Days)', type: 'number', required: false, min: 0, placeholder: '0' },
    { key: 'priority', label: 'Priority', type: 'select', required: false, options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ]},
  ],
  'a12': [ // Assign Task to Team Member
    { key: 'taskId', label: 'Task', type: 'select', required: true, options: MOCK_CONFIG_TASKS },
    { key: 'assigneeId', label: 'Assign To', type: 'select', required: true, options: MOCK_TEAM_MEMBERS },
  ],
  'a13': [ // Auto-Complete Task
    { key: 'taskId', label: 'Task', type: 'select', required: true, options: MOCK_CONFIG_TASKS },
  ],
  'a14': [ // Escalate to Manager / Partner
    { key: 'assigneeId', label: 'Escalate To', type: 'select', required: true, options: MOCK_TEAM_MEMBERS.filter(u => u.label.includes('Partner') || u.label.includes('Manager')) },
    { key: 'body', label: 'Escalation Note', type: 'textarea', required: true, rows: 3, placeholder: 'Reason for escalation...' },
  ],
  'a15': [ // Move to Next Stage
    // No config needed - automatically moves to next stage
  ],
  'a16': [ // Move Back to Stage
    { key: 'targetStageId', label: 'Target Stage', type: 'select', required: true, options: MOCK_STAGES },
  ],
  'a17': [ // Archive Completed Work
    // No config needed
  ],
  'a18': [ // Create Calendar Event / Meeting
    { key: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'Meeting title...' },
    { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true, min: 15, placeholder: '60' },
    { key: 'attendees', label: 'Attendees', type: 'multiselect', required: false, options: MOCK_TEAM_MEMBERS },
  ],
  'a19': [ // Generate & Send Report
    { key: 'reportType', label: 'Report Type', type: 'select', required: true, options: MOCK_REPORT_TYPES },
    { key: 'reportFormat', label: 'Format', type: 'select', required: true, options: [
      { value: 'pdf', label: 'PDF' },
      { value: 'excel', label: 'Excel' },
      { value: 'csv', label: 'CSV' },
    ]},
    { key: 'recipient', label: 'Send To', type: 'select', required: true, options: [
      { value: 'client', label: 'Client' },
      { value: 'team', label: 'Team Member' },
      { value: 'custom', label: 'Custom Email' },
    ]},
  ],
  'a20': [ // Update QuickBooks / Xero
    { key: 'integrationType', label: 'Platform', type: 'select', required: true, options: [
      { value: 'quickbooks', label: 'QuickBooks' },
      { value: 'xero', label: 'Xero' },
    ]},
    { key: 'body', label: 'Data to Sync', type: 'textarea', required: false, rows: 2, placeholder: 'Optional sync details...' },
  ],
  'a21': [ // Send Webhook to External System
    { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://api.example.com/webhook' },
    { key: 'body', label: 'Custom Payload (JSON)', type: 'textarea', required: false, rows: 4, placeholder: '{"key": "value"}' },
  ],
  'a22': [ // Wait / Delay
    { key: 'delayAmount', label: 'Delay Amount', type: 'number', required: true, min: 1, placeholder: '1' },
    { key: 'delayUnit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'minutes', label: 'Minutes' },
      { value: 'hours', label: 'Hours' },
      { value: 'days', label: 'Days' },
    ]},
  ],
  'a23': [ // Notify Team (In-App)
    { key: 'assigneeId', label: 'Notify', type: 'select', required: false, options: MOCK_TEAM_MEMBERS, placeholder: 'All team members' },
    { key: 'notificationMessage', label: 'Message', type: 'textarea', required: true, rows: 2, placeholder: 'Notification message...' },
  ],
  'a24': [ // Assign Client to Team Member
    { key: 'assigneeId', label: 'Assign To', type: 'select', required: true, options: MOCK_TEAM_MEMBERS },
  ],
  'a25': [ // Merge Client into Duplicate
    { key: 'mergeBy', label: 'Merge By', type: 'select', required: true, options: [
      { value: 'email', label: 'Email Address' },
      { value: 'phone', label: 'Phone Number' },
    ]},
  ],
  'a26': [ // Add Client to Do Not Contact List
    // No config needed
  ],
  'a27': [ // Remove Client from Do Not Contact List
    // No config needed
  ],
  'a28': [ // Start Email Sequence
    { key: 'emailSequenceTemplateId', label: 'Email Sequence Template', type: 'select', required: true, options: MOCK_EMAIL_SEQUENCES },
    { key: 'emailAccountId', label: 'Email Account', type: 'select', required: true, options: MOCK_EMAIL_ACCOUNTS },
  ],
  'a29': [ // Start SMS Sequence
    { key: 'smsSequenceTemplateId', label: 'SMS Sequence Template', type: 'select', required: true, options: MOCK_SMS_SEQUENCES },
    { key: 'phoneAccountId', label: 'Phone Account', type: 'select', required: true, options: MOCK_PHONE_ACCOUNTS },
  ],
  'a30': [ // Stop All Sequences
    // No config needed
  ],
  'a31': [ // Send Client Details via Email
    { key: 'recipientEmail', label: 'Recipient Email', type: 'text', required: true, placeholder: 'recipient@example.com' },
  ],
  'a21': [ // Send Webhook to External System (Enhanced)
    { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://api.example.com/webhook' },
    { key: 'webhookAction', label: 'HTTP Method', type: 'select', required: false, options: [
      { value: 'post', label: 'POST' },
      { value: 'get', label: 'GET' },
    ], placeholder: 'POST (default)' },
    { key: 'webhookHeaders', label: 'Custom Headers (JSON)', type: 'textarea', required: false, rows: 3, placeholder: '{"Authorization": "Bearer token"}' },
    { key: 'webhookBody', label: 'Custom Body (JSON)', type: 'textarea', required: false, rows: 4, placeholder: '{"key": "value"}' },
  ],
};

// ==================== ADAPTER FUNCTIONS ====================

// Mapping between Figma trigger values and AutomationBuilder trigger IDs
const TRIGGER_VALUE_TO_ID_MAP: Record<string, string> = {
  'stage_entered': 't1',
  'stage_completed': 't2',
  'stage_reopened': 't3',
  'any_task_completed': 't4',
  'specific_task_completed': 't5',
  'task_assigned': 't6',
  'task_commented': 't7',
  'time_after_stage': 't8',
  'time_after_task': 't9',
  'days_before_deadline': 't10',
  'deadline_passed': 't11',
  'time_scheduled': 't12',
  'client_created': 't13',
  'client_status_changed': 't14',
  'no_client_response': 't15',
  'document_received': 't16',
  'document_signed': 't17',
  'form_sent': 't18',
  'organizer_submitted': 't19',
  'meeting_scheduled': 't20',
  'invoice_sent': 't21',
  'payment_received': 't22',
  'payment_overdue': 't23',
  'subscription_failed': 't24',
  'email_replied': 't25',
  'sms_replied': 't26',
  'incoming_email': 't27',
  'incoming_sms': 't28',
  'incoming_any': 't29',
  'outgoing_sms_error': 't30',
  'client_created_api': 't31',
  'client_created_facebook': 't32',
  'client_created_calendly': 't33',
  'custom_field_changed': 't34',
};

// Reverse mapping
const TRIGGER_ID_TO_VALUE_MAP: Record<string, string> = Object.entries(TRIGGER_VALUE_TO_ID_MAP).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {} as Record<string, string>
);

// Mapping between Figma action values and AutomationBuilder action IDs
const ACTION_VALUE_TO_ID_MAP: Record<string, string> = {
  'send_client_email': 'a1',
  'send_team_email': 'a2',
  'send_slack': 'a3',
  'send_sms': 'a4',
  'request_documents': 'a5',
  'update_client_status': 'a6',
  'send_form_organizer': 'a7',
  'send_proposal': 'a8',
  'send_engagement_letter': 'a9',
  'request_signature': 'a10',
  'create_task': 'a11',
  'assign_task': 'a12',
  'complete_task': 'a13',
  'escalate_to_manager': 'a14',
  'move_to_stage': 'a15',
  'move_back_stage': 'a16',
  'archive_project': 'a17',
  'create_calendar_event': 'a18',
  'generate_report': 'a19',
  'update_accounting_software': 'a20',
  'send_webhook': 'a21',
  'wait_delay': 'a22',
  'notify_team': 'a23',
  'assign_client': 'a24',
  'merge_client': 'a25',
  'add_dnc': 'a26',
  'remove_dnc': 'a27',
  'start_email_sequence': 'a28',
  'start_sms_sequence': 'a29',
  'stop_sequences': 'a30',
  'send_client_details': 'a31',
};

// Reverse mapping
const ACTION_ID_TO_VALUE_MAP: Record<string, string> = Object.entries(ACTION_VALUE_TO_ID_MAP).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {} as Record<string, string>
);

// Convert Figma trigger format to structured format
function toStructuredTrigger(triggerValue: string, config?: Record<string, any>): TriggerStructured | null {
  const triggerId = TRIGGER_VALUE_TO_ID_MAP[triggerValue];
  if (!triggerId) return null;
  
  const trigger = MOCK_TRIGGERS.find(t => t.id === triggerId);
  return trigger ? { ...trigger, config: config || {} } : null;
}

// Convert structured trigger to Figma format
function fromStructuredTrigger(trigger: TriggerStructured | null): { value: string; config?: Record<string, any> } {
  if (!trigger) return { value: '' };
  
  const value = TRIGGER_ID_TO_VALUE_MAP[trigger.id];
  return {
    value: value || '',
    config: trigger.config,
  };
}

// Convert Figma action format to structured format
function toStructuredAction(actionValue: string, actionConfig?: Record<string, any>): ActionStructured | null {
  const actionId = ACTION_VALUE_TO_ID_MAP[actionValue];
  if (!actionId) return null;
  
  const action = MOCK_ACTIONS.find(a => a.id === actionId);
  return action ? { ...action, config: actionConfig || {} } : null;
}

// Convert structured action to Figma format
function fromStructuredAction(action: ActionStructured): { value: string; config?: Record<string, any> } {
  const value = ACTION_ID_TO_VALUE_MAP[action.id];
  return {
    value: value || '',
    config: action.config,
  };
}

// ==================== FORMATTING HELPER FUNCTIONS ====================

// Format trigger for human-readable display
function formatTriggerDisplay(triggerObj: TriggerStructured | null, triggerConfig?: Record<string, any>): string {
  if (!triggerObj) return '(No trigger)';
  
  const config = triggerConfig || triggerObj.config || {};
  const triggerName = triggerObj.name;
  
  // Handle different trigger categories with their configurations
  if (triggerObj.category === 'Client') {
    if (triggerName === 'When Client Created') {
      return 'Client created';
    }
    if (triggerName === 'When Client Status Changed') {
      return `Client status changed${config.status ? ` to ${config.status}` : ''}`;
    }
    if (triggerName === "Client Hasn't Responded in X Days") {
      return `Client hasn't responded in ${config.days || 'X'} days`;
    }
    if (triggerName === 'When Document Received') {
      return `Document received${config.documentType ? ` (${config.documentType})` : ''}`;
    }
    if (triggerName === 'When Document Signed') {
      return `Document signed${config.documentType ? ` (${config.documentType})` : ''}`;
    }
    if (triggerName === 'When Form / Organizer Sent') {
      return `Form/Organizer sent${config.formType ? ` (${config.formType})` : ''}`;
    }
    if (triggerName === 'When Form / Organizer Submitted') {
      return `Form/Organizer submitted${config.formType ? ` (${config.formType})` : ''}`;
    }
    if (triggerName === 'When Meeting is Scheduled') {
      return `Meeting scheduled${config.meetingType ? ` (${config.meetingType})` : ''}`;
    }
    if (triggerName === 'When Client Created via API') {
      return 'Client created via API';
    }
    if (triggerName === 'When Client Created via Facebook') {
      return 'Client created via Facebook';
    }
    if (triggerName === 'When Client Created via Calendly') {
      return 'Client created via Calendly';
    }
    if (triggerName === 'When Custom Field Value Changed') {
      return `Custom field changed${config.fieldName ? ` (${config.fieldName})` : ''}`;
    }
  }
  
  if (triggerObj.category === 'Financial') {
    if (triggerName === 'When Invoice Sent') {
      return 'Invoice sent';
    }
    if (triggerName === 'When Payment Received') {
      return 'Payment received';
    }
    if (triggerName === 'When Payment Overdue') {
      return 'Payment overdue';
    }
    if (triggerName === 'When Subscription Payment Failed') {
      return 'Subscription payment failed';
    }
  }
  
  if (triggerObj.category === 'Task') {
    if (triggerName === 'When Any Task Completed') {
      return 'Any task completed';
    }
    if (triggerName === 'When Specific Task Completed') {
      const taskName = config.taskName || config.taskId;
      return taskName ? `Task "${taskName}" completed` : 'Specific task completed';
    }
    if (triggerName === 'When Task is Assigned') {
      return 'Task assigned';
    }
    if (triggerName === 'When Task is Commented') {
      return 'Task commented';
    }
  }
  
  if (triggerObj.category === 'Stage') {
    if (triggerName === 'When Stage is Entered') {
      const stageName = config.stageName || config.stageId;
      return stageName ? `Stage "${stageName}" entered` : 'Stage entered';
    }
    if (triggerName === 'When Stage is Completed') {
      const stageName = config.stageName || config.stageId;
      return stageName ? `Stage "${stageName}" completed` : 'Stage completed';
    }
    if (triggerName === 'When Stage is Reopened') {
      const stageName = config.stageName || config.stageId;
      return stageName ? `Stage "${stageName}" reopened` : 'Stage reopened';
    }
  }
  
  if (triggerObj.category === 'Time') {
    if (triggerName === 'Time After Stage Entered') {
      return `After ${config.days || 'X'} days from stage entry`;
    }
    if (triggerName === 'Time After Task Completed') {
      return `After ${config.days || 'X'} days from task completion`;
    }
    if (triggerName === 'X Days Before Deadline') {
      return `${config.days || 'X'} days before deadline`;
    }
    if (triggerName === 'When Deadline Passed') {
      return 'Deadline passed';
    }
    if (triggerName === 'Scheduled (Daily / Weekly / Monthly)') {
      const frequency = config.frequency || 'daily';
      const time = config.time || '';
      return `Scheduled ${frequency}${time ? ` at ${time}` : ''}`;
    }
  }
  
  if (triggerObj.category === 'Communication') {
    if (triggerName === 'When Email Replied') {
      return 'Email replied';
    }
    if (triggerName === 'When SMS Replied') {
      return 'SMS replied';
    }
    if (triggerName === 'When Incoming Email Received') {
      return 'Incoming email received';
    }
    if (triggerName === 'When Incoming SMS Received') {
      return 'Incoming SMS received';
    }
    if (triggerName === 'When Incoming Email or SMS Received') {
      return 'Incoming email or SMS received';
    }
    if (triggerName === 'When Outgoing SMS Error Occurs') {
      return 'Outgoing SMS error occurred';
    }
  }
  
  // Fallback to trigger name
  return triggerName || 'Event occurs';
}

// Format condition for human-readable display
function formatConditionDisplay(condition: Condition): string {
  if (!condition.field || !condition.operator) {
    return '(Incomplete condition)';
  }
  
  // Find field definition
  const fieldDef = CONDITION_FIELDS.find(f => f.value === condition.field);
  const fieldLabel = fieldDef?.label || condition.field;
  
  // Find operator label
  const fieldType = fieldDef?.type || 'text';
  const operators = OPERATORS_BY_TYPE[fieldType] || OPERATORS_BY_TYPE.text || [];
  const operatorDef = operators.find(op => op.value === condition.operator);
  const operatorLabel = operatorDef?.label || condition.operator;
  
  // Format value
  let valueDisplay = String(condition.value || '');
  
  // Handle enum values
  if (fieldDef?.type === 'enum' && fieldDef.enumOptions) {
    const enumOption = fieldDef.enumOptions.find(opt => opt.value === condition.value);
    if (enumOption) {
      valueDisplay = enumOption.label;
    }
  }
  
  // Capitalize first letter of field label
  const capitalizedField = fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);
  
  return `${capitalizedField} ${operatorLabel} ${valueDisplay}`;
}

// Format action for human-readable display with configurations
function formatActionDisplay(actionObj: ActionStructured): { name: string; configs: string[] } {
  if (!actionObj) {
    return { name: '(No action)', configs: [] };
  }
  
  const config = actionObj.config || {};
  const configs: string[] = [];
  
  // Extract ALL relevant configuration based on action type - comprehensive extraction
  if (actionObj.category === 'Communication') {
    if (actionObj.name === 'Send Email to Client' || actionObj.name === 'Send Email to Team Member') {
      // Look up template from MOCK_EMAIL_TEMPLATES using templateId
      if (config.templateId) {
        const template = MOCK_EMAIL_TEMPLATES.find(t => t.value === config.templateId);
        if (template) {
          configs.push(`Template: ${template.label}`);
        } else if (config.templateName || config.template) {
          configs.push(`Template: ${config.templateName || config.template}`);
        }
      } else if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
      // Look up email account from MOCK_EMAIL_ACCOUNTS using emailAccountId
      if (config.emailAccountId) {
        const account = MOCK_EMAIL_ACCOUNTS.find(a => a.value === config.emailAccountId);
        if (account) {
          configs.push(`Email Account: ${account.label}`);
        } else if (config.emailAccount || config.account || config.fromAccount) {
          configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
        }
      } else if (config.emailAccount || config.account || config.fromAccount) {
        configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
      }
      if (config.subject) {
        configs.push(`Subject: ${config.subject}`);
      }
      if (config.toEmail || config.recipient || config.to) {
        configs.push(`To: ${config.toEmail || config.recipient || config.to}`);
      }
      // For team member emails, show assignee
      if (config.assigneeId) {
        const assignee = MOCK_TEAM_MEMBERS.find(m => m.value === config.assigneeId);
        if (assignee) {
          configs.push(`Team Member: ${assignee.label.split(' (')[0]}`);
        }
      }
    }
    if (actionObj.name === 'Start Email Sequence') {
      // Look up sequence from MOCK_EMAIL_SEQUENCES using emailSequenceTemplateId
      if (config.emailSequenceTemplateId) {
        const sequence = MOCK_EMAIL_SEQUENCES.find(s => s.value === config.emailSequenceTemplateId);
        if (sequence) {
          configs.push(`Sequence: ${sequence.label}`);
        } else if (config.sequenceName || config.sequence) {
          configs.push(`Sequence: ${config.sequenceName || config.sequence}`);
        }
      } else if (config.sequenceName || config.sequence) {
        configs.push(`Sequence: ${config.sequenceName || config.sequence}`);
      }
      // Look up email account from MOCK_EMAIL_ACCOUNTS using emailAccountId
      if (config.emailAccountId) {
        const account = MOCK_EMAIL_ACCOUNTS.find(a => a.value === config.emailAccountId);
        if (account) {
          configs.push(`Email Account: ${account.label}`);
        } else if (config.emailAccount || config.account || config.fromAccount) {
          configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
        }
      } else if (config.emailAccount || config.account || config.fromAccount) {
        configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
      }
      // Also check for template if present
      if (config.templateId) {
        const template = MOCK_EMAIL_TEMPLATES.find(t => t.value === config.templateId);
        if (template) {
          configs.push(`Template: ${template.label}`);
        } else if (config.templateName || config.template) {
          configs.push(`Template: ${config.templateName || config.template}`);
        }
      } else if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
    }
    if (actionObj.name === 'Start SMS Sequence') {
      // Look up sequence from MOCK_SMS_SEQUENCES using smsSequenceTemplateId
      if (config.smsSequenceTemplateId) {
        const sequence = MOCK_SMS_SEQUENCES.find(s => s.value === config.smsSequenceTemplateId);
        if (sequence) {
          configs.push(`Sequence: ${sequence.label}`);
        } else if (config.sequenceName || config.sequence) {
          configs.push(`Sequence: ${config.sequenceName || config.sequence}`);
        }
      } else if (config.sequenceName || config.sequence) {
        configs.push(`Sequence: ${config.sequenceName || config.sequence}`);
      }
      // Look up phone account from MOCK_PHONE_ACCOUNTS using phoneAccountId
      if (config.phoneAccountId) {
        const account = MOCK_PHONE_ACCOUNTS.find(a => a.value === config.phoneAccountId);
        if (account) {
          configs.push(`Phone Account: ${account.label}`);
        }
      }
      if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
    }
    if (actionObj.name === 'Send SMS Reminder') {
      if (config.message) {
        configs.push(`Message: ${config.message.substring(0, 50)}${config.message.length > 50 ? '...' : ''}`);
      }
      if (config.phoneNumber || config.to) {
        configs.push(`To: ${config.phoneNumber || config.to}`);
      }
    }
    if (actionObj.name === 'Send Slack / Teams Message') {
      if (config.channel) {
        configs.push(`Channel: ${config.channel}`);
      }
      if (config.message) {
        configs.push(`Message: ${config.message.substring(0, 50)}${config.message.length > 50 ? '...' : ''}`);
      }
      if (config.workspace || config.team) {
        configs.push(`Workspace: ${config.workspace || config.team}`);
      }
    }
    if (actionObj.name === 'Send Client Details via Email') {
      // Look up template from MOCK_EMAIL_TEMPLATES using templateId
      if (config.templateId) {
        const template = MOCK_EMAIL_TEMPLATES.find(t => t.value === config.templateId);
        if (template) {
          configs.push(`Template: ${template.label}`);
        } else if (config.templateName || config.template) {
          configs.push(`Template: ${config.templateName || config.template}`);
        }
      } else if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
      // Look up email account from MOCK_EMAIL_ACCOUNTS using emailAccountId
      if (config.emailAccountId) {
        const account = MOCK_EMAIL_ACCOUNTS.find(a => a.value === config.emailAccountId);
        if (account) {
          configs.push(`Email Account: ${account.label}`);
        } else if (config.emailAccount || config.account || config.fromAccount) {
          configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
        }
      } else if (config.emailAccount || config.account || config.fromAccount) {
        configs.push(`Email Account: ${config.emailAccount || config.account || config.fromAccount}`);
      }
      if (config.recipientEmail) {
        configs.push(`Recipient: ${config.recipientEmail}`);
      }
    }
  }
  
  if (actionObj.category === 'Task Management') {
    if (actionObj.name === 'Create Follow-up Task') {
      if (config.taskName || config.task) {
        configs.push(`Task: ${config.taskName || config.task}`);
      }
      if (config.assignee || config.assignedTo) {
        configs.push(`Assignee: ${config.assignee || config.assignedTo}`);
      }
      if (config.dueDate || config.dueDateDays) {
        configs.push(`Due: ${config.dueDate || `${config.dueDateDays} days`}`);
      }
      if (config.priority) {
        configs.push(`Priority: ${config.priority}`);
      }
    }
    if (actionObj.name === 'Assign Task to Team Member') {
      if (config.taskName || config.task) {
        configs.push(`Task: ${config.taskName || config.task}`);
      }
      if (config.teamMember || config.assignee) {
        configs.push(`Team Member: ${config.teamMember || config.assignee}`);
      }
    }
    if (actionObj.name === 'Auto-Complete Task') {
      if (config.taskName || config.task) {
        configs.push(`Task: ${config.taskName || config.task}`);
      }
    }
    if (actionObj.name === 'Escalate to Manager / Partner') {
      if (config.taskName || config.task) {
        configs.push(`Task: ${config.taskName || config.task}`);
      }
      if (config.escalateTo) {
        configs.push(`Escalate To: ${config.escalateTo}`);
      }
    }
  }
  
  if (actionObj.category === 'Workflow') {
    if (actionObj.name === 'Move to Next Stage' || actionObj.name === 'Move Back to Stage') {
      if (config.stageName || config.stage) {
        configs.push(`Stage: ${config.stageName || config.stage}`);
      }
      if (config.direction) {
        configs.push(`Direction: ${config.direction}`);
      }
    }
    if (actionObj.name === 'Archive Completed Work') {
      if (config.archiveAfterDays) {
        configs.push(`Archive After: ${config.archiveAfterDays} days`);
      }
    }
  }
  
  if (actionObj.category === 'Client Portal') {
    if (actionObj.name === 'Send Form / Organizer') {
      if (config.formType || config.form) {
        configs.push(`Form Type: ${config.formType || config.form}`);
      }
      if (config.recipient) {
        configs.push(`Recipient: ${config.recipient}`);
      }
      if (config.formName) {
        configs.push(`Form: ${config.formName}`);
      }
    }
    if (actionObj.name === 'Request Documents from Client') {
      if (config.documentTypes) {
        const docTypes = Array.isArray(config.documentTypes) 
          ? config.documentTypes.join(', ')
          : config.documentTypes;
        configs.push(`Documents: ${docTypes}`);
      }
      if (config.deadline) {
        configs.push(`Deadline: ${config.deadline}`);
      }
    }
    if (actionObj.name === 'Update Client Portal Status') {
      if (config.status) {
        configs.push(`Status: ${config.status}`);
      }
    }
  }
  
  if (actionObj.category === 'Sales / Engagement') {
    if (actionObj.name === 'Send Proposal / Quote') {
      if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
      if (config.amount) {
        configs.push(`Amount: $${config.amount}`);
      }
    }
    if (actionObj.name === 'Send Engagement Letter') {
      if (config.templateName || config.template) {
        configs.push(`Template: ${config.templateName || config.template}`);
      }
    }
    if (actionObj.name === 'Request E-Signature') {
      if (config.documentName || config.document) {
        configs.push(`Document: ${config.documentName || config.document}`);
      }
      if (config.signers) {
        const signers = Array.isArray(config.signers) 
          ? config.signers.join(', ')
          : config.signers;
        configs.push(`Signers: ${signers}`);
      }
    }
  }
  
  if (actionObj.category === 'Scheduling') {
    if (actionObj.name === 'Create Calendar Event / Meeting') {
      if (config.meetingType || config.type) {
        configs.push(`Meeting Type: ${config.meetingType || config.type}`);
      }
      if (config.duration) {
        configs.push(`Duration: ${config.duration} minutes`);
      }
      if (config.attendees) {
        const attendees = Array.isArray(config.attendees) 
          ? config.attendees.join(', ')
          : config.attendees;
        configs.push(`Attendees: ${attendees}`);
      }
      if (config.location) {
        configs.push(`Location: ${config.location}`);
      }
    }
  }
  
  if (actionObj.category === 'Reports') {
    if (actionObj.name === 'Generate & Send Report') {
      if (config.reportType || config.report) {
        configs.push(`Report Type: ${config.reportType || config.report}`);
      }
      if (config.recipient) {
        configs.push(`Recipient: ${config.recipient}`);
      }
      if (config.frequency) {
        configs.push(`Frequency: ${config.frequency}`);
      }
    }
  }
  
  if (actionObj.category === 'Integrations') {
    if (actionObj.name === 'Update QuickBooks / Xero') {
      if (config.system) {
        configs.push(`System: ${config.system}`);
      }
      if (config.action) {
        configs.push(`Action: ${config.action}`);
      }
      if (config.category) {
        configs.push(`Category: ${config.category}`);
      }
    }
    if (actionObj.name === 'Send Webhook to External System') {
      if (config.webhookUrl || config.url) {
        configs.push(`URL: ${config.webhookUrl || config.url}`);
      }
      if (config.method) {
        configs.push(`Method: ${config.method}`);
      }
    }
  }
  
  if (actionObj.category === 'Client Management') {
    if (actionObj.name === 'Assign Client to Team Member') {
      if (config.teamMember || config.assignee) {
        configs.push(`Team Member: ${config.teamMember || config.assignee}`);
      }
    }
  }
  
  if (actionObj.category === 'Utility') {
    if (actionObj.name === 'Wait / Delay') {
      if (config.duration || config.days || config.hours) {
        const duration = config.duration || (config.days ? `${config.days} days` : `${config.hours} hours`);
        configs.push(`Duration: ${duration}`);
      }
    }
    if (actionObj.name === 'Notify Team (In-App)') {
      if (config.message) {
        configs.push(`Message: ${config.message.substring(0, 50)}${config.message.length > 50 ? '...' : ''}`);
      }
      if (config.teamMembers) {
        const members = Array.isArray(config.teamMembers) 
          ? config.teamMembers.join(', ')
          : config.teamMembers;
        configs.push(`Team: ${members}`);
      }
    }
  }
  
  return {
    name: actionObj.name,
    configs: configs,
  };
}

// ==================== CONFIG FIELD RENDERER ====================
function ConfigFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: any;
  onChange: (value: any) => void;
}) {
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className="text-sm"
        />
      );
    
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          className="text-sm"
        />
      );
    
    case 'select':
      return (
        <Select value={value || ''} onValueChange={handleChange}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder={field.placeholder || `Select ${field.label}...`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case 'multiselect':
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {(value || []).map((val: string, idx: number) => {
              const option = field.options?.find(o => o.value === val);
              return (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {option?.label || val}
                  <button
                    onClick={() => {
                      const newValue = (value || []).filter((_: any, i: number) => i !== idx);
                      handleChange(newValue);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
          <Select
            value=""
            onValueChange={(val) => {
              const currentValues = value || [];
              if (!currentValues.includes(val)) {
                handleChange([...currentValues, val]);
              }
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Add item..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.filter(opt => !(value || []).includes(opt.value)).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    
    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className="text-sm"
        />
      );
    
    case 'date':
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="text-sm"
        />
      );
    
    case 'time':
      return (
        <Input
          type="time"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="text-sm"
        />
      );
    
    case 'toggle':
      return (
        <Switch
          checked={value || false}
          onCheckedChange={handleChange}
        />
      );
    
    default:
      return null;
  }
}

// ==================== TRIGGER CONFIG FORM ====================
function TriggerConfigForm({
  triggerId,
  config,
  onChange,
}: {
  triggerId: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  const schema = TRIGGER_CONFIG_SCHEMAS[triggerId];
  
  if (!schema || schema.length === 0) {
    return null;
  }

  const handleFieldChange = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  // Handle dynamic field visibility (e.g., scheduleDay only shows for weekly/monthly)
  const visibleFields = schema.filter(field => {
    if (field.key === 'scheduleDay' && triggerId === 't12') {
      return config.scheduleType === 'weekly' || config.scheduleType === 'monthly';
    }
    return true;
  });

  return (
    <div className="mt-4 space-y-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
      <div className="text-sm font-medium text-violet-900">
        Configure Trigger
      </div>
      {visibleFields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <ConfigFieldRenderer
            field={field}
            value={config[field.key]}
            onChange={(value) => handleFieldChange(field.key, value)}
          />
        </div>
      ))}
    </div>
  );
}

// ==================== ACTION CONFIG FORM ====================
function ActionConfigForm({
  actionId,
  config,
  onChange,
  workflow,
  currentStageId,
  tasks,
}: {
  actionId: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  workflow?: AutomationBuilderProps['workflow'];
  currentStageId?: string;
  tasks?: Task[];
}) {
  const schema = getActionConfigSchema(actionId, workflow, currentStageId, tasks);
  
  if (!schema || schema.length === 0) {
    return null;
  }

  const handleFieldChange = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      {schema.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <ConfigFieldRenderer
            field={field}
            value={config[field.key]}
            onChange={(value) => handleFieldChange(field.key, value)}
          />
        </div>
      ))}
    </div>
  );
}

// ==================== TEST RESULTS COMPONENT ====================
function AutomationTestResults({
  result,
  open,
  onOpenChange,
  onTestAgain,
}: {
  result: TestResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestAgain: () => void;
}) {
  if (!result) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'skipped':
        return <Clock className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'skipped':
        return 'text-slate-500 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getOverallStatusBadge = () => {
    switch (result.overallStatus) {
      case 'success':
        return (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Automation would execute successfully</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Automation partially succeeded</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Automation would not execute</span>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Automation Results</DialogTitle>
          <DialogDescription>
            Simulation of automation execution with mock data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Section */}
          <div className={`p-4 rounded-lg border ${getStatusColor(result.overallStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              {getOverallStatusBadge()}
              <div className="text-sm text-slate-600">
                ⏱️ Test completed in {(result.executionTime / 1000).toFixed(2)}s
              </div>
            </div>
            <p className="text-sm mt-2">{result.summary}</p>
          </div>

          {/* Execution Log */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>📋</span> Execution Log
            </h4>
            <div className="space-y-2">
              {result.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getStatusColor(log.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">[{log.step}]</span>
                        <span className="font-medium text-sm">{log.title}</span>
                        {log.duration && (
                          <span className="text-xs text-slate-500">
                            ({log.duration}ms)
                          </span>
                        )}
                      </div>
                      {log.details.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {log.details.map((detail, detailIdx) => (
                            <div key={detailIdx} className="text-xs text-slate-600">
                              └─ {detail}
                            </div>
                          ))}
                        </div>
                      )}
                      {log.error && (
                        <div className="ml-6 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                          ⚠️ {log.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Data Notice */}
          <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
            <p className="text-xs text-violet-700 italic">
              ℹ️ This test used simulated data. Actual execution may vary based on real-time conditions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onTestAgain} className="bg-violet-600 hover:bg-violet-700">
            <Play className="w-4 h-4 mr-2" />
            Test Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== AUTOMATION PREVIEW ====================
function AutomationPreview({
  trigger,
  conditions,
  actions,
  logicOperator,
  compact = false,
}: {
  trigger: TriggerStructured | null;
  conditions: Condition[];
  actions: ActionStructured[];
  logicOperator?: 'AND' | 'OR';
  compact?: boolean;
}) {
  const getConditionText = (condition: Condition): string => {
    const field = CONDITION_FIELDS.find(f => f.value === condition.field);
    const operator = field 
      ? OPERATORS_BY_TYPE[field.type]?.find(o => o.value === condition.operator)
      : null;
    
    return `${field?.label || condition.field} ${operator?.label || condition.operator} ${condition.value}`;
  };

  const getTriggerText = (): string => {
    if (!trigger) return '(No trigger selected)';
    
    let text = trigger.name;
    
    // Add configuration details
    if (trigger.config && Object.keys(trigger.config).length > 0) {
      const config = trigger.config;
      const details: string[] = [];
      
      // Time-based configs
      if (config.days !== undefined) {
        details.push(`${config.days} day${config.days !== 1 ? 's' : ''}`);
      }
      if (config.hours !== undefined && config.hours > 0) {
        details.push(`${config.hours} hour${config.hours !== 1 ? 's' : ''}`);
      }
      
      // Schedule configs
      if (config.scheduleType) {
        details.push(config.scheduleType);
      }
      if (config.scheduleTime) {
        details.push(`at ${config.scheduleTime}`);
      }
      if (config.scheduleDay) {
        details.push(config.scheduleDay);
      }
      
      // Task configs
      if (config.taskId) {
        const task = MOCK_CONFIG_TASKS.find(t => t.value === config.taskId);
        if (task) details.push(`"${task.label}"`);
      }
      
      // Client configs
      if (config.status) {
        const status = MOCK_CLIENT_STATUSES.find(s => s.value === config.status);
        if (status) details.push(`to ${status.label}`);
      }
      if (config.documentType) {
        const docType = MOCK_DOCUMENT_TYPES.find(d => d.value === config.documentType);
        if (docType) details.push(docType.label);
      }
      if (config.formType) {
        const form = MOCK_FORM_TYPES.find(f => f.value === config.formType);
        if (form) details.push(form.label);
      }
      
      // Communication configs (text matching)
      if (config.textMatching) {
        details.push(`matching "${config.textMatching}"`);
      }
      if (config.textMatchingType) {
        const matchType = config.textMatchingType === 'exact' ? 'exact' : config.textMatchingType === 'word' ? 'word' : 'any';
        if (config.textMatching) {
          details[details.length - 1] = details[details.length - 1].replace('matching', `${matchType} matching`);
        }
      }
      
      // Error codes
      if (config.errorCodes && Array.isArray(config.errorCodes) && config.errorCodes.length > 0) {
        details.push(`${config.errorCodes.length} error code${config.errorCodes.length > 1 ? 's' : ''}`);
      }
      
      // Custom field
      if (config.customField && config.customField !== 'none') {
        const customField = MOCK_CUSTOM_FIELDS.find(f => f.value === config.customField);
        if (customField) details.push(customField.label);
      }
      
      if (details.length > 0) {
        text += ` (${details.join(', ')})`;
      }
    }
    
    return text;
  };

  const getActionText = (action: ActionStructured): string => {
    let text = action.name;
    
    // Add configuration details
    if (action.config && Object.keys(action.config).length > 0) {
      const config = action.config;
      const details: string[] = [];
      
      // Communication configs
      if (config.templateId) {
        const template = MOCK_EMAIL_TEMPLATES.find(t => t.value === config.templateId);
        if (template) details.push(template.label);
      }
      if (config.assigneeId) {
        const assignee = MOCK_TEAM_MEMBERS.find(u => u.value === config.assigneeId);
        if (assignee) details.push(assignee.label.split(' (')[0]);
      }
      if (config.channel) {
        details.push(config.channel);
      }
      
      // Task configs
      if (config.taskName) {
        details.push(`"${config.taskName}"`);
      }
      if (config.taskId) {
        const task = MOCK_CONFIG_TASKS.find(t => t.value === config.taskId);
        if (task) details.push(`"${task.label}"`);
      }
      if (config.priority) {
        details.push(`${config.priority} priority`);
      }
      
      // Workflow configs
      if (config.targetStageId) {
        const stage = MOCK_STAGES.find(s => s.value === config.targetStageId);
        if (stage) details.push(`to ${stage.label}`);
      }
      
      // Delay configs
      if (config.delayAmount && config.delayUnit) {
        details.push(`${config.delayAmount} ${config.delayUnit}`);
      }
      
      // Document configs
      if (config.documentTypes && Array.isArray(config.documentTypes) && config.documentTypes.length > 0) {
        details.push(`${config.documentTypes.length} doc type${config.documentTypes.length > 1 ? 's' : ''}`);
      }
      if (config.formId) {
        const form = MOCK_FORM_TYPES.find(f => f.value === config.formId);
        if (form) details.push(form.label);
      }
      
      // Report configs
      if (config.reportType) {
        const report = MOCK_REPORT_TYPES.find(r => r.value === config.reportType);
        if (report) details.push(report.label);
      }
      if (config.reportFormat) {
        details.push(config.reportFormat.toUpperCase());
      }
      
      // Integration configs
      if (config.integrationType) {
        details.push(config.integrationType === 'quickbooks' ? 'QuickBooks' : 'Xero');
      }
      
      // Client Management configs
      if (config.mergeBy) {
        details.push(`by ${config.mergeBy}`);
      }
      if (config.recipientEmail) {
        details.push(`to ${config.recipientEmail}`);
      }
      
      // Sequence configs
      if (config.emailSequenceTemplateId) {
        const seq = MOCK_EMAIL_SEQUENCES.find(s => s.value === config.emailSequenceTemplateId);
        if (seq) details.push(seq.label);
      }
      if (config.emailAccountId) {
        const account = MOCK_EMAIL_ACCOUNTS.find(a => a.value === config.emailAccountId);
        if (account) details.push(`from ${account.label}`);
      }
      if (config.smsSequenceTemplateId) {
        const seq = MOCK_SMS_SEQUENCES.find(s => s.value === config.smsSequenceTemplateId);
        if (seq) details.push(seq.label);
      }
      if (config.phoneAccountId) {
        const account = MOCK_PHONE_ACCOUNTS.find(a => a.value === config.phoneAccountId);
        if (account) details.push(`from ${account.label}`);
      }
      
      // Webhook configs (enhanced)
      if (config.webhookAction) {
        details.push(config.webhookAction.toUpperCase());
      }
      
      if (details.length > 0) {
        text += ` (${details.slice(0, 2).join(', ')})`;
      }
    }
    
    return text;
  };

  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Automation Preview
        </div>
        <div className="text-xs text-slate-600 space-y-1.5">
          <div>
            <span className="font-semibold text-slate-700">When</span>{' '}
            <span className="text-slate-600">
              {getTriggerText()}
            </span>
          </div>

          {conditions.length > 0 && (
            <div>
              <span className="font-semibold text-slate-700">And</span>{' '}
              {conditions.map((condition, index) => (
                <span key={condition.id}>
                  {index > 0 && ` ${logicOperator || 'AND'} `}
                  <span className="text-slate-600">{getConditionText(condition)}</span>
                </span>
              ))}
            </div>
          )}

          <div>
            <span className="font-semibold text-slate-700">Then</span>{' '}
            {actions.length > 0 ? (
              <div className="mt-0.5 space-y-0.5">
                {actions.map((action, index) => (
                  <div key={`${action.id}-${index}`} className="ml-3">
                    <span className="text-slate-500">{index + 1}.</span>{' '}
                    <span className="text-slate-600">{getActionText(action)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-slate-400">(No actions)</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-violet-50 border-violet-200">
      <div className="p-4">
        <div className="text-sm font-semibold text-violet-900 mb-3">
          Automation Preview
        </div>
        <div className="text-sm text-slate-700 space-y-2">
          <div>
            <span className="font-bold text-violet-700">When</span>{' '}
            <span className="font-medium">
              {getTriggerText()}
            </span>
          </div>

          {conditions.length > 0 && (
            <div>
              <span className="font-bold text-violet-700">And</span>{' '}
              {conditions.map((condition, index) => (
                <span key={condition.id}>
                  {index > 0 && ` ${logicOperator || 'AND'} `}
                  <span className="font-medium">{getConditionText(condition)}</span>
                </span>
              ))}
            </div>
          )}

          <div>
            <span className="font-bold text-violet-700">Then</span>{' '}
            {actions.length > 0 ? (
              <div className="mt-1 space-y-1">
                {actions.map((action, index) => (
                  <div key={`${action.id}-${index}`} className="ml-4">
                    <span className="text-violet-600">{index + 1}.</span>{' '}
                    <span className="font-medium">{getActionText(action)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-slate-400">(No actions)</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AutomationBuilder({ 
  stageName, 
  tasks = [], 
  automations: initialAutomations = [],
  focusedTaskId,
  focusedAutomationId,
  onAutomationsChange,
  workflow,
  currentStageId 
}: AutomationBuilderProps) {
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);

  // Sync with external automations prop
  useEffect(() => {
    setAutomations(initialAutomations);
  }, [initialAutomations]);

  // Update parent when automations change
  useEffect(() => {
    if (onAutomationsChange) {
      onAutomationsChange(automations);
    }
  }, [automations]);

  // Auto-edit focused automation when provided
  useEffect(() => {
    if (focusedAutomationId) {
      const automation = automations.find(a => a.id === focusedAutomationId);
      if (automation) {
        handleEditAutomation(automation);
      }
    }
  }, [focusedAutomationId]);

  const triggerTypes = [
    { value: 'stage_entered', label: 'When Stage is Entered', icon: Zap, category: 'Stage' },
    { value: 'stage_completed', label: 'When Stage is Completed', icon: FileCheck, category: 'Stage' },
    { value: 'specific_task_completed', label: 'When Specific Task Completed', icon: FileCheck, category: 'Task' },
    { value: 'any_task_completed', label: 'When Any Task Completed', icon: FileCheck, category: 'Task' },
    { value: 'task_assigned', label: 'When Task is Assigned', icon: Plus, category: 'Task' },
    { value: 'time_after_stage', label: 'Time After Stage Entered', icon: Clock, category: 'Time' },
    { value: 'time_after_task', label: 'Time After Task Completed', icon: Clock, category: 'Time' },
    { value: 'days_before_deadline', label: 'X Days Before Deadline', icon: Clock, category: 'Time' },
    { value: 'deadline_passed', label: 'When Deadline Passed', icon: Clock, category: 'Time' },
    { value: 'time_scheduled', label: 'Scheduled (Daily/Weekly/Monthly)', icon: Calendar, category: 'Time' },
    { value: 'no_client_response', label: 'Client Hasn\'t Responded in X Days', icon: Clock, category: 'Client' },
    { value: 'document_received', label: 'When Document Received', icon: FileCheck, category: 'Client' },
    { value: 'document_signed', label: 'When Document is Signed', icon: FileCheck, category: 'Client' },
    { value: 'organizer_submitted', label: 'When Organizer is Submitted', icon: FileCheck, category: 'Client' },
    { value: 'meeting_scheduled', label: 'When Meeting is Scheduled', icon: Calendar, category: 'Client' },
    { value: 'payment_received', label: 'When Payment Received', icon: CreditCard, category: 'Financial' },
    { value: 'payment_overdue', label: 'When Payment Overdue', icon: CreditCard, category: 'Financial' },
  ];

  const actionTypes = [
    { value: 'send_client_email', label: 'Send Email to Client', category: 'Communication' },
    { value: 'send_team_email', label: 'Send Email to Team Member', category: 'Communication' },
    { value: 'send_slack', label: 'Send Slack/Teams Message', category: 'Communication' },
    { value: 'send_sms', label: 'Send SMS Reminder', category: 'Communication' },
    { value: 'request_documents', label: 'Request Documents from Client', category: 'Client Portal' },
    { value: 'update_client_status', label: 'Update Client Portal Status', category: 'Client Portal' },
    { value: 'send_proposal', label: 'Send Proposal/Quote', category: 'Sales' },
    { value: 'send_engagement_letter', label: 'Send Engagement Letter', category: 'Sales' },
    { value: 'request_signature', label: 'Request E-Signature', category: 'Sales' },
    { value: 'create_task', label: 'Create Follow-up Task', category: 'Task Management' },
    { value: 'assign_task', label: 'Assign Task to Team Member', category: 'Task Management' },
    { value: 'complete_task', label: 'Auto-Complete Task', category: 'Task Management' },
    { value: 'escalate_to_manager', label: 'Escalate to Manager/Partner', category: 'Task Management' },
    { value: 'move_to_stage', label: 'Move to Next Stage', category: 'Workflow' },
    { value: 'create_calendar_event', label: 'Create Calendar Event/Meeting', category: 'Scheduling' },
    { value: 'generate_report', label: 'Generate & Send Report', category: 'Reports' },
    { value: 'update_accounting_software', label: 'Update QuickBooks/Xero', category: 'Integrations' },
    { value: 'send_webhook', label: 'Send Webhook to External System', category: 'Integrations' },
    { value: 'archive_project', label: 'Archive Completed Work', category: 'Workflow' },
  ];

  const [newAutomation, setNewAutomation] = useState({
    name: '', // Automation name
    trigger: '', // Keep for compatibility
    triggerObj: null as TriggerStructured | null, // Structured trigger
    triggerConfig: {} as Record<string, any>,
    conditions: [] as Condition[], // Now with id field
    logicOperator: 'AND' as 'AND' | 'OR',
    actions: [] as Action[], // Keep old format temporarily
    actionObjs: [{ id: '', category: '', name: '', config: {} }] as ActionStructured[], // Structured actions - start with 1 empty action
    actionConfigs: {} as Record<number, Record<string, any>>, // Configs by action index
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showConditions, setShowConditions] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Auto-show create form if there are no automations and not editing
  useEffect(() => {
    // Only auto-show create form if:
    // 1. There are no automations
    // 2. Not currently editing an automation
    // 3. No focused automation (which would trigger edit)
    if (automations.length === 0 && !editingId && !focusedAutomationId) {
      setIsCreating(true);
    }
  }, [automations.length, editingId, focusedAutomationId]);

  // Filter automations when a task is focused or when editing
  const displayedAutomations = editingId
    ? automations.filter(auto => auto.id === editingId)
    : focusedTaskId 
      ? automations.filter(auto => auto.triggerTaskId === focusedTaskId)
      : automations;

  const handleEditAutomation = (automation: Automation) => {
    console.log('Editing automation:', automation);
    setEditingId(automation.id);
    
    // Convert stored format to structured models
    const triggerObj = automation.triggerObj || toStructuredTrigger(automation.trigger, automation.triggerObj?.config);
    const conditions = (automation.conditions || []).map(c => {
      // Add id if missing
      if (!c.id) {
        return { ...c, id: `cond-${Date.now()}-${Math.random()}` };
      }
      return c;
    });
    
    // Convert actionDetails to ActionStructured
    const actionObjs = automation.actionObjs || (automation.actionDetails || []).map((a: Action) => {
      // Check if it's already structured (has the new fields)
      const maybeStructured = a as any;
      if (maybeStructured.id && maybeStructured.category && maybeStructured.name) {
        // Already structured
        return maybeStructured as ActionStructured;
      } else if (a.type) {
        // Old format with type string
        const converted = toStructuredAction(a.type, a.details);
        return converted || { id: '', category: '', name: '', config: {} };
      }
      return { id: '', category: '', name: '', config: {} };
    });
    
    // Extract configs from structured models
    const triggerConfig = triggerObj?.config || {};
    const actionConfigs: Record<number, Record<string, any>> = {};
    actionObjs.forEach((action, idx) => {
      if (action.config && Object.keys(action.config).length > 0) {
        actionConfigs[idx] = action.config;
      }
    });
    
    // Populate form with automation data
    setNewAutomation({
      name: automation.name || '',
      trigger: automation.trigger,
      triggerObj: triggerObj,
      triggerConfig: triggerConfig,
      conditions: conditions,
      logicOperator: automation.logicOperator || 'AND',
      actions: automation.actionDetails || [],
      actionObjs: actionObjs,
      actionConfigs: actionConfigs,
    });
    
    // Open conditions collapsible if automation has conditions
    if (conditions.length > 0) {
      setShowConditions(true);
    }
  };

  const handleDeleteAutomation = (id: string) => {
    setAutomations(automations.filter(a => a.id !== id));
    setDeleteConfirmId(null);
  };

  const handleTestAutomation = async () => {
    // Validation
    if (!newAutomation.triggerObj) {
      toast.error('Please select a trigger before testing');
      return;
    }
    
    if (newAutomation.actionObjs.length === 0 || !newAutomation.actionObjs[0].id) {
      toast.error('Please add at least one action before testing');
      return;
    }

    // Validate trigger config
    if (newAutomation.triggerObj.id && TRIGGER_CONFIG_SCHEMAS[newAutomation.triggerObj.id]) {
      const schema = TRIGGER_CONFIG_SCHEMAS[newAutomation.triggerObj.id];
      for (const field of schema) {
        if (field.required && !newAutomation.triggerConfig[field.key]) {
          toast.error(`Trigger configuration: "${field.label}" is required.`);
          return;
        }
      }
    }

    // Validate action configs
    for (let i = 0; i < newAutomation.actionObjs.length; i++) {
      const action = newAutomation.actionObjs[i];
      if (!action.id) {
        toast.error(`Please select action #${i + 1} before testing`);
        return;
      }

      const actionConfig = newAutomation.actionConfigs[i];
      const actionSchema = getActionConfigSchema(action.id, workflow, currentStageId, tasks);
      
      if (actionSchema) {
        for (const field of actionSchema) {
          if (field.required && !actionConfig?.[field.key]) {
            toast.error(`Action "${action.name}" requires: ${field.label}`);
            return;
          }
        }
      }
    }

    setIsTesting(true);
    try {
      // Simulate realistic delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await runAutomationTest(
        {
          triggerObj: newAutomation.triggerObj,
          triggerConfig: newAutomation.triggerConfig,
          conditions: newAutomation.conditions,
          logicOperator: newAutomation.logicOperator,
          actionObjs: newAutomation.actionObjs,
          actionConfigs: newAutomation.actionConfigs,
        },
        workflow,
        currentStageId,
        tasks
      );

      setTestResult(result);
      setShowTestResults(true);
    } catch (error) {
      toast.error('Test failed. Please try again.');
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAutomation = () => {
    // Validation
    if (!newAutomation.triggerObj) {
      toast.error('Please select a trigger');
      return;
    }
    
    if (newAutomation.actionObjs.length === 0) {
      toast.error('Please add at least one action');
      return;
    }
    
    // Validate trigger config
    if (newAutomation.triggerObj.id && TRIGGER_CONFIG_SCHEMAS[newAutomation.triggerObj.id]) {
      const schema = TRIGGER_CONFIG_SCHEMAS[newAutomation.triggerObj.id];
      for (const field of schema) {
        if (field.required && !newAutomation.triggerConfig[field.key]) {
          toast.error(`Trigger requires: ${field.label}`);
          return;
        }
      }
    }
    
    // Validate action configs
    for (let i = 0; i < newAutomation.actionObjs.length; i++) {
      const action = newAutomation.actionObjs[i];
      if (!action.id) {
        toast.error(`Please select action #${i + 1}`);
        return;
      }

      const actionConfig = newAutomation.actionConfigs[i];
      const actionSchema = getActionConfigSchema(action.id, workflow, currentStageId, tasks);
      
      if (actionSchema) {
        for (const field of actionSchema) {
          if (field.required && !actionConfig?.[field.key]) {
            toast.error(`Action "${action.name}" requires: ${field.label}`);
            return;
          }
        }
      }
    }
    
    // Convert structured models to stored format
    const triggerData = fromStructuredTrigger(newAutomation.triggerObj);
    const triggerWithConfig: TriggerStructured = {
      ...newAutomation.triggerObj,
      config: newAutomation.triggerConfig,
    };
    
    const actionsWithConfigs: ActionStructured[] = newAutomation.actionObjs.map((action, idx) => ({
      ...action,
      config: newAutomation.actionConfigs[idx] || {},
    }));
    
    // Use custom name or generate one if empty
    let automationName = newAutomation.name.trim();
    if (!automationName) {
      // Auto-generate name if not provided
      const triggerLabel = newAutomation.triggerObj.name;
      const actionSummary = newAutomation.actionObjs
        .map(a => a.name)
        .slice(0, 2)
        .join(', ') + (newAutomation.actionObjs.length > 2 ? '...' : '');
      automationName = `${triggerLabel} → ${actionSummary}`;
    }
    
    const currentAutomation = automations.find(a => a.id === editingId);
    
    // Create automation data maintaining backward compatibility
    const automationData: Automation = {
      id: editingId || Date.now().toString(),
      name: automationName,
      trigger: triggerData.value, // Keep old format for compatibility
      enabled: currentAutomation?.enabled ?? true,
      actions: newAutomation.actionObjs.map(a => a.name), // Action names for display
      actionDetails: newAutomation.actions, // Keep old format temporarily
      conditions: newAutomation.conditions,
      // New structured fields
      triggerObj: triggerWithConfig,
      actionObjs: actionsWithConfigs,
      logicOperator: newAutomation.logicOperator,
    };

    if (editingId) {
      // Update existing
      setAutomations(automations.map(a => 
        a.id === editingId ? automationData : a
      ));
      setEditingId(null);
      toast.success('Automation updated successfully');
    } else {
      // Create new
      setAutomations([...automations, automationData]);
      setIsCreating(false);
      toast.success('Automation created successfully');
    }
    
    // Reset form
    setNewAutomation({
      name: '',
      trigger: '',
      triggerObj: null,
      triggerConfig: {},
      conditions: [],
      logicOperator: 'AND',
      actions: [],
      actionObjs: [{ id: '', category: '', name: '', config: {} }], // Start with 1 empty action
      actionConfigs: {},
    });
    setShowConditions(false);
  };

  const handleCancelEdit = () => {
    if (editingId) {
      setEditingId(null);
    } else {
      setIsCreating(false);
    }
    setNewAutomation({
      name: '',
      trigger: '',
      triggerObj: null,
      triggerConfig: {},
      conditions: [],
      logicOperator: 'AND',
      actions: [],
      actionObjs: [{ id: '', category: '', name: '', config: {} }], // Start with 1 empty action
      actionConfigs: {},
    });
    setShowConditions(false);
  };

  const renderAutomationForm = () => (
    <div className="space-y-4 mt-4">
      {/* Automation Name */}
      <Card className="p-4 border-slate-200">
        <div className="space-y-2">
          <Label htmlFor="automation-name" className="text-sm font-medium">
            Automation Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="automation-name"
            placeholder="e.g., Send welcome email on stage entry"
            value={newAutomation.name}
            onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
            className="text-sm"
          />
          <p className="text-xs text-slate-500">
            Give your automation a descriptive name to easily identify it later
          </p>
        </div>
      </Card>

      {/* Step 1: Trigger */}
      <Card className="p-4 border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-sm text-violet-700">1</span>
            </div>
            <Label>When this happens (Trigger)</Label>
          </div>
          <Select 
            value={newAutomation.triggerObj?.id || ''} 
            onValueChange={(triggerId) => {
              const trigger = MOCK_TRIGGERS.find(t => t.id === triggerId);
              setNewAutomation({ 
                ...newAutomation, 
                triggerObj: trigger || null,
                triggerConfig: {}, // Reset config when changing trigger
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trigger" />
            </SelectTrigger>
            <SelectContent>
              {['Stage', 'Task', 'Time', 'Client', 'Financial', 'Communication'].map(category => {
                const categoryTriggers = MOCK_TRIGGERS.filter(t => t.category === category);
                if (categoryTriggers.length === 0) return null;
                
                return (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs text-slate-500 uppercase tracking-wider">
                      {category}
                    </SelectLabel>
                    {categoryTriggers.map((trigger) => (
                      <SelectItem key={trigger.id} value={trigger.id}>
                        {trigger.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>

          {/* Trigger Configuration Form */}
          {newAutomation.triggerObj && (
            <div className="pl-10">
              <TriggerConfigForm
                triggerId={newAutomation.triggerObj.id}
                config={newAutomation.triggerConfig}
                onChange={(config) => setNewAutomation({ ...newAutomation, triggerConfig: config })}
              />
            </div>
          )}
                </div>
      </Card>

      {/* Step 2: Conditions (Optional) - Collapsible */}
      <Collapsible 
        open={showConditions || newAutomation.conditions.length > 0} 
        onOpenChange={setShowConditions}
        className="w-full"
      >
        <Card className="p-4 border-slate-200">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm text-blue-700">2</span>
              </div>
                <div className="text-left">
                  <Label className="text-sm font-medium cursor-pointer">
                    If these conditions are met (Optional)
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {newAutomation.conditions.length === 0 
                      ? 'Restrict when this automation runs'
                      : `${newAutomation.conditions.length} condition${newAutomation.conditions.length !== 1 ? 's' : ''} added`}
              </p>
              {newAutomation.conditions.length === 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600">
                    Skip this step unless you need to program conditional logic
                  </p>
                </div>
              )}
            </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Add Condition Button - Always visible, on left of chevron */}
            <Button 
              variant="outline" 
              size="sm" 
                  className="gap-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                    // Open accordion if closed
                    if (!showConditions && newAutomation.conditions.length === 0) {
                  setShowConditions(true);
                    }
                    // Add new condition
                setNewAutomation({
                  ...newAutomation,
                    conditions: [...newAutomation.conditions, { id: `cond-${Date.now()}`, field: '', operator: '', value: '' }]
                });
              }}
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </Button>
                
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${showConditions || newAutomation.conditions.length > 0 ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {newAutomation.conditions.length === 0 
                  ? 'No conditions - automation will run for all triggers'
                  : 'Configure conditions to restrict when this automation runs'}
              </p>
          </div>

            {/* Logic Operator Toggle (only show when there are 2+ conditions) */}
            {newAutomation.conditions.length > 1 && (
              <div className="pl-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-slate-600">Match conditions:</Label>
                  <div className="flex gap-1 bg-slate-100 rounded-md p-1">
                    <Button
                      size="sm"
                      variant={newAutomation.logicOperator === 'AND' ? 'default' : 'ghost'}
                      className={`h-7 px-3 text-xs ${newAutomation.logicOperator === 'AND' ? 'bg-violet-600 text-white' : ''}`}
                      onClick={() => setNewAutomation({ ...newAutomation, logicOperator: 'AND' })}
                    >
                      AND
                    </Button>
                    <Button
                      size="sm"
                      variant={newAutomation.logicOperator === 'OR' ? 'default' : 'ghost'}
                      className={`h-7 px-3 text-xs ${newAutomation.logicOperator === 'OR' ? 'bg-violet-600 text-white' : ''}`}
                      onClick={() => setNewAutomation({ ...newAutomation, logicOperator: 'OR' })}
                    >
                      OR
                    </Button>
            </div>
                </div>
                
                {/* Info Box with Explanation */}
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <p className="font-medium text-violet-900 text-xs">
                        {newAutomation.logicOperator === 'AND' ? 'AND (All conditions must match)' : 'OR (Any condition can match)'}
                      </p>
                      <p className="text-violet-700 text-xs">
                        {newAutomation.logicOperator === 'AND' 
                          ? 'The automation will only run when ALL conditions are true.'
                          : 'The automation will run when ANY of these conditions is true.'}
                      </p>
                      <div className="mt-2 pt-2 border-t border-violet-200">
                        <p className="text-violet-600 font-medium text-xs mb-1">Example:</p>
                        <p className="text-violet-700 text-xs">
                          {newAutomation.logicOperator === 'AND'
                            ? 'Client Type is "Individual" AND Invoice Balance > 1000'
                            : 'Client Type is "Individual" OR Days Overdue > 7'}
              </p>
            </div>
        </div>
              </div>
            </div>
          </div>
            )}

            {/* Conditions List */}
            {newAutomation.conditions.length > 0 && (
              <div className="space-y-2">
                {newAutomation.conditions.map((condition, idx) => {
                  const selectedField = CONDITION_FIELDS.find(f => f.value === condition.field);
                  const availableOperators = selectedField ? OPERATORS_BY_TYPE[selectedField.type] : OPERATORS_BY_TYPE.text;
                  
                  return (
                    <div key={condition.id}>
                      {idx > 0 && (
                        <div className="flex items-center gap-2 my-2">
                          <div className="h-px bg-slate-200 flex-1" />
                          <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs">
                            {newAutomation.logicOperator || 'AND'}
                          </Badge>
                          <div className="h-px bg-slate-200 flex-1" />
            </div>
                      )}
                      <div className="flex gap-2 flex-wrap items-start">
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      const updated = [...newAutomation.conditions];
                            updated[idx] = { ...updated[idx], field: value, operator: '', value: '' };
                      setNewAutomation({ ...newAutomation, conditions: updated });
                    }}
                  >
                    <SelectTrigger className="w-40 min-w-[160px]">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                            {CONDITION_FIELDS.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => {
                      const updated = [...newAutomation.conditions];
                      updated[idx] = { ...updated[idx], operator: value };
                      setNewAutomation({ ...newAutomation, conditions: updated });
                    }}
                  >
                    <SelectTrigger className="w-32 min-w-[128px]">
                            <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                            {availableOperators?.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                    </SelectContent>
                  </Select>
                        
                        {/* Value input - varies by field type */}
                        {selectedField?.type === 'enum' && selectedField.enumOptions ? (
                          <Select
                            value={typeof condition.value === 'string' ? condition.value : ''}
                            onValueChange={(value) => {
                              const updated = [...newAutomation.conditions];
                              updated[idx] = { ...updated[idx], value };
                              setNewAutomation({ ...newAutomation, conditions: updated });
                            }}
                          >
                            <SelectTrigger className="flex-1 min-w-[200px]">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedField.enumOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : selectedField?.type === 'number' ? (
                  <Input 
                            type="number"
                    placeholder="Value" 
                    className="flex-1 min-w-[200px]"
                    value={condition.value}
                    onChange={(e) => {
                      const updated = [...newAutomation.conditions];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      setNewAutomation({ ...newAutomation, conditions: updated });
                    }}
                  />
                        ) : (
                          <Input 
                            placeholder="Value" 
                            className="flex-1 min-w-[200px]"
                            value={condition.value}
                            onChange={(e) => {
                              const updated = [...newAutomation.conditions];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setNewAutomation({ ...newAutomation, conditions: updated });
                            }}
                          />
                        )}
                        
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      const updated = newAutomation.conditions.filter((_, i) => i !== idx);
                      setNewAutomation({ ...newAutomation, conditions: updated });
                            // Auto-collapse if no conditions left
                            if (updated.length === 0) {
                              setShowConditions(false);
                            }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
            </div>
                  );
                })}
        </div>
            )}
          </CollapsibleContent>
      </Card>
      </Collapsible>

      {/* Step 3: Actions */}
      <Card className="p-4 border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm text-green-700">3</span>
              </div>
              <Label>Then do this (Actions)</Label>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setNewAutomation({
                  ...newAutomation,
                  actionObjs: [...newAutomation.actionObjs, { id: '', category: '', name: '', config: {} }]
                });
              }}
            >
              <Plus className="w-4 h-4" />
              Add Action
            </Button>
          </div>

          <div className="space-y-3 pl-10">
            {newAutomation.actionObjs.length === 0 ? (
              <div className="text-sm text-slate-500">No actions configured yet</div>
            ) : (
              newAutomation.actionObjs.map((action, idx) => {
                const hasConfig = action.id && ACTION_CONFIG_SCHEMAS[action.id] && ACTION_CONFIG_SCHEMAS[action.id].length > 0;
                const currentConfig = newAutomation.actionConfigs[idx] || {};
                
                return (
                  <div key={idx} className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex gap-2 items-start">
                      <Select
                        value={action.id}
                        onValueChange={(actionId) => {
                          const selectedAction = MOCK_ACTIONS.find(a => a.id === actionId);
                          if (selectedAction) {
                            const updated = [...newAutomation.actionObjs];
                            updated[idx] = { ...selectedAction, config: {} };
                            // Reset config for this action
                            const newConfigs = { ...newAutomation.actionConfigs };
                            newConfigs[idx] = {};
                            setNewAutomation({ 
                              ...newAutomation, 
                              actionObjs: updated,
                              actionConfigs: newConfigs 
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Communication', 'Client Portal', 'Sales / Engagement', 'Task Management', 'Workflow', 'Scheduling', 'Reports', 'Integrations', 'Utility'].map(category => {
                            const categoryActions = MOCK_ACTIONS.filter(a => a.category === category);
                            if (categoryActions.length === 0) return null;
                            
                            return (
                              <SelectGroup key={category}>
                                <SelectLabel className="text-xs text-slate-500 uppercase tracking-wider">
                                  {category}
                                </SelectLabel>
                                {categoryActions.map((act) => (
                                  <SelectItem key={act.id} value={act.id}>
                                    {act.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            );
                          })}
                        </SelectContent>
                      </Select>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={newAutomation.actionObjs.length <= 1}
                          onClick={() => {
                          // Prevent removing the last action (actions are required)
                          if (newAutomation.actionObjs.length <= 1) {
                            toast.error('At least one action is required');
                            return;
                          }
                          const updatedActions = newAutomation.actionObjs.filter((_, i) => i !== idx);
                          const newConfigs = { ...newAutomation.actionConfigs };
                          delete newConfigs[idx];
                          // Reindex configs
                          const reindexedConfigs: Record<number, Record<string, any>> = {};
                          Object.keys(newConfigs).forEach((key) => {
                            const oldIdx = parseInt(key);
                            const newIdx = oldIdx > idx ? oldIdx - 1 : oldIdx;
                            reindexedConfigs[newIdx] = newConfigs[oldIdx];
                          });
                          setNewAutomation({ 
                            ...newAutomation, 
                            actionObjs: updatedActions,
                            actionConfigs: reindexedConfigs 
                          });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    {/* Action Configuration Form (if action requires config) */}
                    {hasConfig && action.id && (
                      <div className="pl-4 pt-2 border-l-2 border-violet-200">
                        <ActionConfigForm
                          actionId={action.id}
                          config={currentConfig}
                          onChange={(config) => {
                            const newConfigs = { ...newAutomation.actionConfigs };
                            newConfigs[idx] = config;
                            setNewAutomation({ 
                              ...newAutomation, 
                              actionConfigs: newConfigs 
                            });
                          }}
                          workflow={workflow}
                          currentStageId={currentStageId}
                          tasks={tasks}
                        />
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>
      </Card>

      {/* Preview (only show if trigger is selected) */}
      {newAutomation.triggerObj && (
        <AutomationPreview
          trigger={newAutomation.triggerObj}
          conditions={newAutomation.conditions}
          actions={newAutomation.actionObjs}
          logicOperator={newAutomation.logicOperator}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="flex-1"
          onClick={handleCancelEdit}
        >
          Cancel
        </Button>
        <Button 
          variant="outline"
          className="flex-1"
          disabled={!newAutomation.triggerObj || newAutomation.actionObjs.length === 0 || isTesting}
          onClick={handleTestAutomation}
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Test Automation
            </>
          )}
        </Button>
        <Button 
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          disabled={!newAutomation.triggerObj || newAutomation.actionObjs.length === 0 || isTesting}
          onClick={handleSaveAutomation}
        >
          <Zap className="w-4 h-4 mr-2" />
          {editingId ? 'Update Automation' : 'Create Automation'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stage Info Banner */}
      {stageName && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-violet-900">Stage: {stageName}</h4>
                {focusedTaskId && (
                  <Badge className="bg-violet-600 text-xs">Task Focus</Badge>
                )}
              </div>
              <p className="text-xs text-violet-700">
                {focusedTaskId 
                  ? `Viewing automations related to "${tasks.find(t => t.id === focusedTaskId)?.name}"`
                  : 'Automations will trigger automatically based on stage and task events'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Form */}
      {isCreating && (
        <Card className="p-6 border-violet-200 bg-violet-50/30">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Create New Automation</h3>
            <p className="text-sm text-slate-500 mt-1">
              {stageName 
                ? `Add a new automation for "${stageName}" stage`
                : 'Configure when and what happens automatically'}
            </p>
          </div>
          {renderAutomationForm()}
        </Card>
      )}

      {/* Edit Form */}
      {editingId && !isCreating && (
        <Card className="p-6 border-violet-300 bg-violet-50/30">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Edit Automation</h3>
            <p className="text-sm text-slate-500 mt-1">
              Update the trigger, conditions, and actions for this automation
            </p>
        </div>
          {renderAutomationForm()}
        </Card>
      )}

      {/* View Mode: Existing Automations List */}
      {!isCreating && !editingId && (
        <div className="space-y-4">
          {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {automations.length > 0 ? 'Current Automations' : 'Automations'}
          </h3>
              <p className="text-sm text-slate-500 mt-1">
                {automations.length === 0 
                  ? 'No automations configured yet. Create your first automation to get started.'
                  : stageName
                    ? `${automations.length} automation${automations.length !== 1 ? 's' : ''} configured for "${stageName}" stage`
                    : `${automations.length} automation${automations.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
          <Button 
            className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={() => {
                setIsCreating(true);
                // Reset form with one empty action
                setNewAutomation({
                  name: '',
                  trigger: '',
                  triggerObj: null,
                  triggerConfig: {},
                  conditions: [],
                  logicOperator: 'AND',
                  actions: [],
                  actionObjs: [{ id: '', category: '', name: '', config: {} }],
                  actionConfigs: {},
                });
                setShowConditions(false);
              }}
          >
            <Plus className="w-4 h-4" />
            Add Automation
          </Button>
      </div>

          {/* Filter Badge */}
          {focusedTaskId && displayedAutomations.length > 0 && (
            <Badge variant="outline" className="text-xs w-fit">
            Showing {displayedAutomations.length} of {automations.length} (filtered by task)
          </Badge>
        )}
        
          {/* Empty States */}
          {displayedAutomations.length === 0 && !focusedTaskId && (
            <Card className="p-8 border-dashed border-slate-300">
              <div className="text-center space-y-3">
              <Zap className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    No automations yet
              </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Get started by creating your first automation
              </p>
                </div>
            </div>
          </Card>
        )}
          
          {displayedAutomations.length === 0 && focusedTaskId && (
            <Card className="p-6 border-dashed border-slate-300">
            <p className="text-sm text-slate-500 text-center">
                No automations configured for this task
            </p>
          </Card>
        )}

          {/* Automation Cards */}
        {displayedAutomations.map((automation, automationIndex) => {
          // Convert automation data to structured format for preview
          const triggerObj = automation.triggerObj || toStructuredTrigger(automation.trigger, automation.triggerObj?.config);
          const conditions = (automation.conditions || []).map(c => {
            // Add id if missing
            if (!c.id) {
              return { ...c, id: `cond-${Date.now()}-${Math.random()}` };
            }
            return c;
          });
          
          // Convert actionDetails to ActionStructured
          const actionObjs = automation.actionObjs || (automation.actionDetails || []).map((a: Action) => {
            // Check if it's already structured (has the new fields)
            const maybeStructured = a as any;
            if (maybeStructured.id && maybeStructured.category && maybeStructured.name) {
              // Already structured
              return maybeStructured as ActionStructured;
            } else if (a.type) {
              // Old format with type string - try to parse details as JSON config
              let config = {};
              try {
                if (a.details) {
                  config = JSON.parse(a.details);
                }
              } catch (e) {
                // Not JSON, use empty config
              }
              const converted = toStructuredAction(a.type, config);
              return converted || { id: '', category: '', name: '', config: {} };
            }
            return { id: '', category: '', name: '', config: {} };
          }).filter(action => action.id); // Filter out empty actions
          
          return (
            <div 
              key={automation.id}
              className="group border border-slate-200 hover:border-violet-300 transition-all duration-200 cursor-pointer rounded-xl bg-white shadow-sm hover:shadow-lg"
                onClick={(e) => {
                  console.log('Card clicked', automation.id);
                  handleEditAutomation(automation);
                }}
              >
                <div className="p-5">
                  <div className="space-y-3">
                    {/* Row 1: Status + Name + Actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Status Toggle - Horizontal Layout */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-2 w-[100px] flex-shrink-0"
                        >
                          <Switch 
                            checked={automation.enabled}
                            onCheckedChange={(checked) => {
                              setAutomations(automations.map(a => 
                                a.id === automation.id ? { ...a, enabled: checked } : a
                              ));
                            }}
                            className={automation.enabled 
                              ? 'data-[state=checked]:!bg-green-600' 
                              : 'data-[state=unchecked]:!bg-slate-400'
                            }
                          />
                          <Badge 
                            variant={automation.enabled ? "default" : "secondary"}
                            className={`text-xs whitespace-nowrap ${
                              automation.enabled 
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-50' 
                                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {automation.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {/* Name */}
                        <h3 className="text-base font-semibold text-slate-900 truncate flex-1">
                          {displayedAutomations.length > 1 && `${automationIndex + 1}. `}
                          {automation.name}
                        </h3>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 w-[72px] flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          title="Edit automation"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAutomation(automation);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete automation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(automation.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: Two-Column Layout - Preview (Left) + Detailed Breakdown (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
                      {/* Left Column: Detailed Breakdown - Trigger, Condition, Action */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Column 1: Trigger */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-blue-700">Trigger</span>
                          </div>
                          {triggerObj ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-900">
                                {formatTriggerDisplay(triggerObj, automation.triggerConfig || automation.triggerObj?.config)}
                              </p>
                              {/* Trigger Configuration Details - Comprehensive Display */}
                              {(() => {
                                const config = automation.triggerConfig || triggerObj.config || {};
                                const configs: string[] = [];
                                
                                // Task triggers
                                if (triggerObj.category === 'Task') {
                                  if (config.taskName) {
                                    configs.push(`Task: ${config.taskName}`);
                                  } else if (config.taskId) {
                                    configs.push(`Task ID: ${config.taskId}`);
                                  }
                                  if (config.status) {
                                    configs.push(`Status: ${config.status}`);
                                  }
                                }
                                
                                // Stage triggers
                                if (triggerObj.category === 'Stage') {
                                  if (config.stageName) {
                                    configs.push(`Stage: ${config.stageName}`);
                                  } else if (config.stageId) {
                                    configs.push(`Stage ID: ${config.stageId}`);
                                  }
                                }
                                
                                // Client triggers
                                if (triggerObj.category === 'Client') {
                                  if (config.documentType) {
                                    configs.push(`Document Type: ${config.documentType}`);
                                  }
                                  if (config.formType) {
                                    configs.push(`Form Type: ${config.formType}`);
                                  }
                                  if (config.meetingType) {
                                    configs.push(`Meeting Type: ${config.meetingType}`);
                                  }
                                  if (config.status) {
                                    configs.push(`Status: ${config.status}`);
                                  }
                                  if (config.clientType) {
                                    configs.push(`Client Type: ${config.clientType}`);
                                  }
                                  if (config.days) {
                                    configs.push(`Days: ${config.days}`);
                                  }
                                }
                                
                                // Time triggers
                                if (triggerObj.category === 'Time') {
                                  if (config.frequency) {
                                    configs.push(`Frequency: ${config.frequency}`);
                                  }
                                  if (config.time) {
                                    configs.push(`Time: ${config.time}`);
                                  }
                                  if (config.days) {
                                    configs.push(`Days: ${config.days}`);
                                  }
                                  if (config.hours) {
                                    configs.push(`Hours: ${config.hours}`);
                                  }
                                  if (config.dayOfWeek) {
                                    configs.push(`Day of Week: ${config.dayOfWeek}`);
                                  }
                                }
                                
                                // Invoice triggers
                                if (triggerObj.category === 'Invoice') {
                                  if (config.invoiceStatus) {
                                    configs.push(`Invoice Status: ${config.invoiceStatus}`);
                                  }
                                  if (config.amount) {
                                    configs.push(`Amount: $${config.amount}`);
                                  }
                                }
                                
                                // Payment triggers
                                if (triggerObj.category === 'Payment') {
                                  if (config.paymentMethod) {
                                    configs.push(`Payment Method: ${config.paymentMethod}`);
                                  }
                                  if (config.amount) {
                                    configs.push(`Amount: $${config.amount}`);
                                  }
                                }
                                
                                // Email triggers
                                if (triggerObj.category === 'Email') {
                                  if (config.fromEmail) {
                                    configs.push(`From: ${config.fromEmail}`);
                                  }
                                  if (config.subject) {
                                    configs.push(`Subject: ${config.subject}`);
                                  }
                                  if (config.textMatching) {
                                    configs.push(`Text Matching: ${config.textMatching}`);
                                  }
                                }
                                
                                // SMS triggers
                                if (triggerObj.category === 'SMS') {
                                  if (config.fromNumber) {
                                    configs.push(`From: ${config.fromNumber}`);
                                  }
                                  if (config.textMatching) {
                                    configs.push(`Text Matching: ${config.textMatching}`);
                                  }
                                }
                                
                                // Error triggers
                                if (triggerObj.category === 'Error') {
                                  if (config.errorCodes && Array.isArray(config.errorCodes)) {
                                    configs.push(`Error Codes: ${config.errorCodes.join(', ')}`);
                                  } else if (config.errorCode) {
                                    configs.push(`Error Code: ${config.errorCode}`);
                                  }
                                }
                                
                                return configs.length > 0 ? (
                                  <div className="ml-3 space-y-0.5 pt-1">
                                    {configs.map((cfg, idx) => (
                                      <p key={idx} className="text-xs text-slate-500">
                                        {configs.length > 1 ? `${idx + 1}. ` : '• '}
                                        {cfg}
                                      </p>
                                    ))}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">(No trigger configured)</p>
                          )}
                        </div>

                        {/* Column 2: Condition */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-amber-700">Condition</span>
                            {conditions.length > 1 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
                                {automation.logicOperator || 'AND'}
                              </Badge>
                            )}
                          </div>
                          {conditions.length > 0 ? (
                            <div className="space-y-1">
                              {conditions.map((condition, index) => (
                                <div key={condition.id} className="space-y-0.5">
                                  {index > 0 && (
                                    <p className="text-xs font-medium text-amber-600 mb-1">
                                      {automation.logicOperator || 'AND'}
                                    </p>
                                  )}
                                  <p className="text-sm text-slate-700">
                                    {conditions.length > 1 && `${index + 1}. `}
                                    {formatConditionDisplay(condition)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">(No conditions)</p>
                          )}
                        </div>

                        {/* Column 3: Action */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-green-700">Action</span>
                          </div>
                          {actionObjs.length > 0 ? (
                            <div className="space-y-2">
                              {actionObjs.map((action, index) => {
                                const actionDisplay = formatActionDisplay(action);
                                return (
                                  <div key={`${action.id}-${index}`} className="space-y-1">
                                    <p className="text-sm font-medium text-slate-900">
                                      {actionObjs.length > 1 && `${index + 1}. `}
                                      {actionDisplay.name}
                                    </p>
                                    {/* Action Configuration Details */}
                                    {actionDisplay.configs.length > 0 && (
                                      <div className="ml-3 space-y-0.5">
                                        {actionDisplay.configs.map((config, configIdx) => (
                                          <p key={configIdx} className="text-xs text-slate-500">
                                            {actionDisplay.configs.length > 1 ? `${configIdx + 1}. ` : '• '}
                                            {config}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">(No actions configured)</p>
                          )}
                        </div>
                      </div>
                      {/* Left Column: Automation Preview */}
                      <div>
                        <AutomationPreview
                          trigger={triggerObj}
                          conditions={conditions}
                          actions={actionObjs}
                          logicOperator={automation.logicOperator}
                          compact={true}
                        />
                      </div>
                    </div>

                    {/* Row 3: Badges */}
                    {/* <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {triggerTypes.find((t) => t.value === automation.trigger)?.label}
                      </Badge>
                      {(automation as any).details && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {(automation as any).details}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-300 mx-1">→</span>
                      {(automation.actionDetails || []).map((actionDetail, idx) => {
                        // Get action type label
                        const actionType = actionTypes.find(a => a.value === actionDetail.type);
                        let displayText = actionType?.label || actionDetail.type || automation.actions[idx] || 'Action';
                        
                        // For email actions, try to show subject
                        if ((actionDetail.type === 'send_client_email' || actionDetail.type === 'send_team_email') && actionDetail.details) {
                          try {
                            const emailData = JSON.parse(actionDetail.details);
                            if (emailData.subject) {
                              displayText = `${actionType?.label}: "${emailData.subject}"`;
                            }
                          } catch (e) {
                            // Not JSON, use default display
                          }
                        }
                        
                        return (
                          <Badge 
                            key={idx} 
                            variant="outline"
                            className="text-xs bg-violet-50 text-violet-700 border-violet-200"
                          >
                            {displayText}
                          </Badge>
                        );
                      })
                      }
                      {(!automation.actionDetails || automation.actionDetails.length === 0) && automation.actions.map((action, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                          {action}
                        </Badge>
                      ))}
                    </div> */}

                    {/* Click to edit hint */}
                    <div className="pt-1 border-t border-slate-100">
                      <p className="text-xs text-slate-400 group-hover:text-violet-600 transition-colors flex items-center gap-1">
                        <Edit2 className="w-3 h-3" />
                        Click to edit this automation
                      </p>
                    </div>
                  </div>
                </div>
          </div>
          );
        })}
          </div>
        )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
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
              onClick={() => deleteConfirmId && handleDeleteAutomation(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Results Dialog */}
      <AutomationTestResults
        result={testResult}
        open={showTestResults}
        onOpenChange={setShowTestResults}
        onTestAgain={handleTestAutomation}
      />
    </div>
  );
}
