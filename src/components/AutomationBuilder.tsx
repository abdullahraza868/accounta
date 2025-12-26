import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Trash2, Zap, Edit2, GripVertical, Filter, Play, MoreVertical, CheckCircle, XCircle, Inbox } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ==================== INTERFACES ====================
interface Trigger {
  id: string;
  category: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string | number | boolean | string[];
}

interface Action {
  id: string;
  category: string;
  name: string;
  config?: Record<string, any>;
}

interface Automation {
  id: string;
  name: string;
  trigger: Trigger | null;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
}

interface AutomationBuilderProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  stageName?: string;
  automations?: Automation[];
  onAutomationsChange?: (automations: Automation[]) => void;
  editingAutomation?: Automation | null;
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

interface TriggerConfig {
  // Time-based configs
  days?: number;
  hours?: number;
  scheduleType?: 'daily' | 'weekly' | 'monthly';
  scheduleTime?: string;
  scheduleDay?: string; // For weekly (Mon-Sun) or monthly (1-31)
  
  // Task-specific configs
  taskId?: string;
  taskName?: string;
  
  // Client-specific configs
  status?: string;
  documentType?: string;
  formType?: string;
}

interface ActionConfig {
  // Communication configs
  templateId?: string;
  recipient?: string;
  recipientType?: 'client' | 'team' | 'custom';
  subject?: string;
  body?: string;
  channel?: 'email' | 'sms' | 'slack' | 'teams';
  
  // Task Management configs
  taskName?: string;
  assigneeId?: string;
  dueDate?: string;
  dueDateOffset?: number; // Days from trigger
  priority?: 'low' | 'medium' | 'high';
  
  // Workflow configs
  targetStageId?: string;
  targetStageName?: string;
  
  // Scheduling configs
  title?: string;
  duration?: number; // minutes
  attendees?: string[];
  
  // Integrations configs
  webhookUrl?: string;
  payload?: Record<string, any>;
  integrationType?: 'quickbooks' | 'xero';
  
  // Utility configs
  delayAmount?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  notificationMessage?: string;
  
  // Client Portal configs
  portalStatus?: string;
  documentTypes?: string[];
  formId?: string;
  
  // Reports configs
  reportType?: string;
  reportFormat?: 'pdf' | 'excel' | 'csv';
}

// ==================== MOCK DATA ====================

// Triggers with IDs
const MOCK_TRIGGERS: Trigger[] = [
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
];

// Actions with IDs
const MOCK_ACTIONS: Action[] = [
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
const MOCK_TASKS = [
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

// Trigger Configuration Schemas
const TRIGGER_CONFIG_SCHEMAS: Record<string, ConfigField[]> = {
  't5': [ // When Specific Task Completed
    { key: 'taskId', label: 'Select Task', type: 'select', required: true, options: MOCK_TASKS },
  ],
  't7': [ // When Task is Commented
    { key: 'taskId', label: 'Specific Task (Optional)', type: 'select', required: false, options: MOCK_TASKS, placeholder: 'Any task' },
  ],
  't8': [ // Time After Stage Entered
    { key: 'days', label: 'Days', type: 'number', required: true, min: 0, placeholder: '0' },
    { key: 'hours', label: 'Hours', type: 'number', required: false, min: 0, max: 23, placeholder: '0' },
  ],
  't9': [ // Time After Task Completed
    { key: 'days', label: 'Days', type: 'number', required: true, min: 0, placeholder: '0' },
    { key: 'hours', label: 'Hours', type: 'number', required: false, min: 0, max: 23, placeholder: '0' },
    { key: 'taskId', label: 'Specific Task (Optional)', type: 'select', required: false, options: MOCK_TASKS, placeholder: 'Any task' },
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
};

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
    { key: 'taskId', label: 'Task', type: 'select', required: true, options: MOCK_TASKS },
    { key: 'assigneeId', label: 'Assign To', type: 'select', required: true, options: MOCK_TEAM_MEMBERS },
  ],
  'a13': [ // Auto-Complete Task
    { key: 'taskId', label: 'Task', type: 'select', required: true, options: MOCK_TASKS },
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
};

// Mock Automations for Table
const MOCK_AUTOMATIONS_DATA: Automation[] = [
  {
    id: 'auto1',
    name: 'Send Tax Organizer on Stage Entry',
    trigger: {
      id: MOCK_TRIGGERS[0]?.id || 't1',
      category: MOCK_TRIGGERS[0]?.category || 'Stage',
      name: MOCK_TRIGGERS[0]?.name || 'When Stage is Entered',
      config: {},
    },
    enabled: true,
    conditions: [
      { id: 'c1', field: 'client_type', operator: 'is', value: 'individual' },
    ],
    actions: [
      {
        id: MOCK_ACTIONS[6]?.id || 'a7',
        category: MOCK_ACTIONS[6]?.category || 'Client Portal',
        name: MOCK_ACTIONS[6]?.name || 'Send Form / Organizer',
        config: {},
      },
      {
        id: MOCK_ACTIONS[22]?.id || 'a23',
        category: MOCK_ACTIONS[22]?.category || 'Utility',
        name: MOCK_ACTIONS[22]?.name || 'Notify Team (In-App)',
        config: {},
      },
    ],
  },
  {
    id: 'auto2',
    name: 'Payment Reminder for Overdue Invoices',
    trigger: {
      id: MOCK_TRIGGERS[22]?.id || 't23',
      category: MOCK_TRIGGERS[22]?.category || 'Financial',
      name: MOCK_TRIGGERS[22]?.name || 'When Payment Overdue',
      config: {},
    },
    enabled: true,
    conditions: [
      { id: 'c2', field: 'days_overdue', operator: 'greater_than', value: 7 },
    ],
    actions: [
      {
        id: MOCK_ACTIONS[0]?.id || 'a1',
        category: MOCK_ACTIONS[0]?.category || 'Communication',
        name: MOCK_ACTIONS[0]?.name || 'Send Email to Client',
        config: {},
      },
      {
        id: MOCK_ACTIONS[3]?.id || 'a4',
        category: MOCK_ACTIONS[3]?.category || 'Communication',
        name: MOCK_ACTIONS[3]?.name || 'Send SMS Reminder',
        config: {},
      },
    ],
  },
  {
    id: 'auto3',
    name: 'Task Assignment on Client Creation',
    trigger: {
      id: MOCK_TRIGGERS[12]?.id || 't13',
      category: MOCK_TRIGGERS[12]?.category || 'Client',
      name: MOCK_TRIGGERS[12]?.name || 'When Client Created',
      config: {},
    },
    enabled: false,
    conditions: [],
    actions: [
      {
        id: MOCK_ACTIONS[10]?.id || 'a11',
        category: MOCK_ACTIONS[10]?.category || 'Task Management',
        name: MOCK_ACTIONS[10]?.name || 'Create Follow-up Task',
        config: {},
      },
      {
        id: MOCK_ACTIONS[11]?.id || 'a12',
        category: MOCK_ACTIONS[11]?.category || 'Task Management',
        name: MOCK_ACTIONS[11]?.name || 'Assign Task to Team Member',
        config: {},
      },
    ],
  },
];

// ==================== CONFIG FORM RENDERER ====================
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
      // For simplicity, using comma-separated values in a text input
      // In production, you'd use a proper multiselect component
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
        <textarea
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="mt-4 space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
        Configure Trigger
      </div>
      {visibleFields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
}: {
  actionId: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  const schema = ACTION_CONFIG_SCHEMAS[actionId];
  
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
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
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

// ==================== SORTABLE ACTION ITEM ====================
function SortableActionItem({ 
  action, 
  actionIndex,
  onDelete, 
  onEdit,
}: { 
  action: Action; 
  actionIndex: number;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const sortableId = `action-${actionIndex}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get config summary
  const getConfigSummary = () => {
    const schema = ACTION_CONFIG_SCHEMAS[action.id];
    if (!schema || !action.config || Object.keys(action.config).length === 0) {
      return null;
    }

    const summaryParts: string[] = [];
    schema.forEach(field => {
      const value = action.config?.[field.key];
      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'select') {
          const option = field.options?.find(o => o.value === value);
          if (option) {
            summaryParts.push(option.label);
          }
        } else if (field.type === 'multiselect' && Array.isArray(value) && value.length > 0) {
          summaryParts.push(`${value.length} selected`);
        } else if (typeof value === 'string' || typeof value === 'number') {
          summaryParts.push(String(value));
        }
      }
    });

    return summaryParts.length > 0 ? summaryParts.slice(0, 2).join(', ') : null;
  };

  const configSummary = getConfigSummary();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        {action.category}
      </Badge>
          <span className="text-sm text-gray-700 dark:text-gray-300">
        {action.name}
      </span>
        </div>
        {configSummary && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {configSummary}
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ==================== TRIGGER SELECTOR ====================
function TriggerSelector({
  value,
  onChange,
}: {
  value: Trigger | null;
  onChange: (trigger: Trigger | null) => void;
}) {
  const groupedTriggers = MOCK_TRIGGERS.reduce((acc, trigger) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push(trigger);
    return acc;
  }, {} as Record<string, Trigger[]>);

  const handleTriggerChange = (triggerId: string) => {
    const trigger = MOCK_TRIGGERS.find(t => t.id === triggerId);
    if (trigger) {
      onChange({ ...trigger, config: {} });
    } else {
      onChange(null);
    }
  };

  const handleConfigChange = (config: Record<string, any>) => {
    if (value) {
      onChange({ ...value, config });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
        <Label>Select Trigger</Label>
      </div>
      
      <Select
        value={value?.id || ''}
        onValueChange={handleTriggerChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a trigger..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedTriggers).map(([category, triggers]) => (
            <SelectGroup key={category}>
              <SelectLabel>{category}</SelectLabel>
              {triggers.map((trigger) => (
                <SelectItem key={trigger.id} value={trigger.id}>
                  {trigger.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <TriggerConfigForm
          triggerId={value.id}
          config={value.config || {}}
          onChange={handleConfigChange}
        />
      )}
    </div>
  );
}

// ==================== CONDITION BUILDER ====================
function ConditionBuilder({
  conditions,
  onChange,
}: {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}) {
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');

  const addCondition = () => {
    const newCondition: Condition = {
      id: `cond_${Date.now()}`,
      field: '',
      operator: '',
      value: '',
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onChange(
      conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    );
  };

  const deleteCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  const getFieldType = (fieldValue: string): ConditionField | undefined => {
    return CONDITION_FIELDS.find(f => f.value === fieldValue);
  };

  const getOperators = (fieldValue: string) => {
    const field = getFieldType(fieldValue);
    if (!field) return [];
    return OPERATORS_BY_TYPE[field.type] || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
          <Label>Conditions (Optional)</Label>
        </div>
        
        {conditions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Logic:</span>
            <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded p-0.5">
              <Button
                size="sm"
                variant={logicOperator === 'AND' ? 'default' : 'ghost'}
                className="h-6 px-2 text-xs"
                onClick={() => setLogicOperator('AND')}
              >
                AND
              </Button>
              <Button
                size="sm"
                variant={logicOperator === 'OR' ? 'default' : 'ghost'}
                className="h-6 px-2 text-xs"
                onClick={() => setLogicOperator('OR')}
              >
                OR
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {conditions.map((condition, index) => {
          const field = getFieldType(condition.field);
          const operators = getOperators(condition.field);

          return (
            <div key={condition.id}>
              {index > 0 && (
                <div className="flex items-center justify-center my-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}>
                    {logicOperator}
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {/* Field Selector */}
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(condition.id, { field: value, operator: '', value: '' })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator Selector */}
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    disabled={!condition.field}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Operator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value Input */}
                  <div>
                    {field?.type === 'enum' && field.enumOptions ? (
                      <Select
                        value={String(condition.value)}
                        onValueChange={(value) => updateCondition(condition.id, { value })}
                        disabled={!condition.operator}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Value..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.enumOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field?.type === 'number' ? (
                      <Input
                        type="number"
                        value={String(condition.value)}
                        onChange={(e) => updateCondition(condition.id, { value: Number(e.target.value) })}
                        placeholder="Value..."
                        className="text-xs"
                        disabled={!condition.operator}
                      />
                    ) : field?.type === 'boolean' ? (
                      <Switch
                        checked={Boolean(condition.value)}
                        onCheckedChange={(checked) => updateCondition(condition.id, { value: checked })}
                        disabled={!condition.operator}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={String(condition.value)}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        placeholder="Value..."
                        className="text-xs"
                        disabled={!condition.operator}
                      />
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteCondition(condition.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addCondition();
        }}
        className="w-full"
        type="button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
}

// ==================== ACTION BUILDER ====================
function ActionBuilder({
  actions,
  onChange,
}: {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}) {
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, any>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addAction = () => {
    if (!selectedActionId) {
      toast.error('Please select an action');
      return;
    }

    const actionTemplate = MOCK_ACTIONS.find(a => a.id === selectedActionId);
    if (!actionTemplate) return;

    // Check if action already added - allow duplicates but with different indices
    // Create a new action with empty config
    const newAction: Action = {
      id: actionTemplate.id,
      category: actionTemplate.category,
      name: actionTemplate.name,
      config: {},
    };

    const newActions = [...actions, newAction];
    onChange(newActions);
    setSelectedActionId('');
    
    // Check if the action requires configuration
    const schema = ACTION_CONFIG_SCHEMAS[actionTemplate.id];
    if (schema && schema.length > 0) {
      // Open edit dialog for the new action
      // Use setTimeout to ensure state updates are processed before opening dialog
      setTimeout(() => {
        setEditingActionIndex(newActions.length - 1);
        setEditConfig({});
      }, 0);
    } else {
    toast.success('Action added');
    }
  };

  const deleteAction = (actionIndex: number) => {
    onChange(actions.filter((_, idx) => idx !== actionIndex));
    toast.success('Action removed');
  };

  const handleEditAction = (actionIndex: number) => {
    setEditingActionIndex(actionIndex);
    setEditConfig(actions[actionIndex].config || {});
  };

  const handleSaveConfig = () => {
    if (editingActionIndex !== null) {
      const updatedActions = [...actions];
      updatedActions[editingActionIndex] = {
        ...updatedActions[editingActionIndex],
        config: editConfig,
      };
      onChange(updatedActions);
      setEditingActionIndex(null);
      setEditConfig({});
      toast.success('Action configuration saved');
    }
  };

  const handleCancelEdit = () => {
    setEditingActionIndex(null);
    setEditConfig({});
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);

      const oldIndex = parseInt(activeId.split('-')[1]);
      const newIndex = parseInt(overId.split('-')[1]);

      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
      onChange(arrayMove(actions, oldIndex, newIndex));
      }
    }
  };

  const groupedActions = MOCK_ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const editingAction = editingActionIndex !== null ? actions[editingActionIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
        <Label>Actions</Label>
      </div>

      {/* Action Selector */}
      <div className="flex gap-2">
        <Select
          value={selectedActionId}
          onValueChange={setSelectedActionId}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select an action..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedActions).map(([category, categoryActions]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {categoryActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    {action.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addAction();
          }} 
          size="sm"
          type="button"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Actions List */}
      {actions.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={actions.map((_, idx) => `action-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {actions.map((action, index) => (
                <SortableActionItem
                  key={`action-${index}`}
                  action={action}
                  actionIndex={index}
                  onDelete={() => deleteAction(index)}
                  onEdit={() => handleEditAction(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {actions.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          No actions added yet. Add at least one action.
        </div>
      )}

      {/* Edit Action Config Dialog */}
      {editingAction && editingActionIndex !== null && (
        <Dialog 
          open={true} 
          onOpenChange={(open) => {
            if (!open) {
              handleCancelEdit();
            }
          }}
        >
          <DialogContent 
            className="max-w-2xl"
            onEscapeKeyDown={(e) => {
              // Allow ESC to close
            }}
          >
            <DialogHeader>
              <DialogTitle>Configure Action: {editingAction.name}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <ActionConfigForm
                actionId={editingAction.id}
                config={editConfig}
                onChange={setEditConfig}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveConfig();
                }} 
                style={{ backgroundColor: 'var(--primaryColor)' }}
                type="button"
              >
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ==================== AUTOMATION PREVIEW ====================
function AutomationPreview({
  trigger,
  conditions,
  actions,
}: {
  trigger: Trigger | null;
  conditions: Condition[];
  actions: Action[];
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
        const task = MOCK_TASKS.find(t => t.value === config.taskId);
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
      
      if (details.length > 0) {
        text += ` (${details.join(', ')})`;
      }
    }
    
    return text;
  };

  const getActionText = (action: Action): string => {
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
        const task = MOCK_TASKS.find(t => t.value === config.taskId);
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
      
      if (details.length > 0) {
        text += ` (${details.slice(0, 2).join(', ')})`;
      }
    }
    
    return text;
  };

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Automation Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <div>
            <span className="font-bold text-blue-700 dark:text-blue-400">When</span>{' '}
            <span className="font-medium">
              {getTriggerText()}
            </span>
          </div>

          {conditions.length > 0 && (
            <div>
              <span className="font-bold text-blue-700 dark:text-blue-400">And</span>{' '}
              {conditions.map((condition, index) => (
                <span key={condition.id}>
                  {index > 0 && ' AND '}
                  <span className="font-medium">{getConditionText(condition)}</span>
                </span>
              ))}
            </div>
          )}

          <div>
            <span className="font-bold text-blue-700 dark:text-blue-400">Then</span>{' '}
            {actions.length > 0 ? (
              <div className="mt-1 space-y-1">
                {actions.map((action, index) => (
                  <div key={`${action.id}-${index}`} className="ml-4">
                    <span className="text-blue-600 dark:text-blue-400">{index + 1}.</span>{' '}
                    <span className="font-medium">{getActionText(action)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">(No actions)</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== AUTOMATION LIST HELPER FUNCTIONS ====================
const TRIGGER_CATEGORY_COLORS: Record<string, string> = {
  'Stage': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  'Task': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  'Time': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  'Client': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  'Financial': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  'Communication': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
};

const ACTION_CATEGORY_COLORS: Record<string, string> = {
  'Communication': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  'Client Portal': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  'Sales / Engagement': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  'Task Management': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  'Workflow': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
  'Scheduling': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800',
  'Reports': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800',
  'Integrations': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800',
  'Utility': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const getTriggerCategoryColor = (trigger: Trigger | null): string => {
  if (!trigger) return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  return TRIGGER_CATEGORY_COLORS[trigger.category] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

const getActionCategoryColor = (category: string): string => {
  return ACTION_CATEGORY_COLORS[category] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
};

// ==================== AUTOMATION LIST TABLE ====================
export function AutomationList({
  automations = MOCK_AUTOMATIONS_DATA,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
}: {
  automations?: Automation[];
  onEdit?: (automation: Automation) => void;
  onDelete?: (automationId: string) => void;
  onStatusChange?: (automationId: string, enabled: boolean) => void;
  onAddNew?: () => void;
}) {
  return (
    <Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-200/60 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Automations</CardTitle>
          {onAddNew && (
            <Button
              onClick={onAddNew}
              size="sm"
              className="gap-1.5"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Plus className="w-4 h-4" />
              Add New Automation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {automations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm font-medium">No automations yet</p>
            <p className="text-xs mt-1">Click "Add New Automation" to get started</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
            <Table className="w-full min-w-[900px]">
            <TableHeader>
                <tr style={{ 
                  background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))' 
                }}>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide">
                  On Event
                </TableHead>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide">
                  Status
                </TableHead>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide">
                  Label
                </TableHead>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide">
                  Conditions
                </TableHead>
                  <TableHead className="px-6 py-3 text-white/90 text-xs uppercase tracking-wide text-right">
                  
                </TableHead>
              </tr>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {automations.map((automation) => (
                <TableRow
                  key={automation.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors duration-150"
                >
                  {/* On Event */}
                  <TableCell className="px-6 py-4">
                    {automation.trigger && (
                        <Badge 
                          className={`text-xs px-2 py-1 font-medium gap-1.5 ${getTriggerCategoryColor(automation.trigger)}`}
                        >
                          <Zap className="w-3 h-3" />
                        {automation.trigger.name}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                    <TableCell className="px-6 py-4">
                      <Badge
                        onClick={() => onStatusChange && onStatusChange(automation.id, !automation.enabled)}
                        className={`text-xs px-2 py-1 font-medium gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${
                          automation.enabled
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}
                      >
                        {automation.enabled ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </>
                        )}
                      </Badge>
                  </TableCell>

                  {/* Label */}
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {automation.name}
                    </span>
                  </TableCell>

                  {/* Actions */}
                    <TableCell className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 items-center">
                        {automation.actions.slice(0, 3).map((action, idx) => (
                          <Badge 
                            key={`${action.id}-${idx}`}
                            className={`text-xs px-2 py-0.5 font-medium ${getActionCategoryColor(action.category)}`}
                          >
                          {action.name}
                        </Badge>
                      ))}
                        {automation.actions.length > 3 && (
                          <Badge 
                            variant="outline"
                            className="text-xs px-2 py-0.5 font-medium bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                          >
                            +{automation.actions.length - 3} more
                          </Badge>
                        )}
                    </div>
                  </TableCell>

                  {/* Conditions */}
                    <TableCell className="px-6 py-4">
                    {automation.conditions.length > 0 ? (
                        <Badge 
                          className="text-xs px-2 py-1 font-medium gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
                        >
                          <Filter className="w-3 h-3" />
                        {automation.conditions.length} condition{automation.conditions.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                        <Badge 
                          className="text-xs px-2 py-1 font-medium bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        >
                          None
                        </Badge>
                    )}
                  </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="px-6 py-4">
                    <div className="flex justify-end items-center gap-1 w-[72px] ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit && onEdit(automation)}
                              className="cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete && onDelete(automation.id)}
                              className="text-red-600 cursor-pointer focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== MAIN AUTOMATION BUILDER ====================
export function AutomationBuilder({
  open = false,
  onOpenChange,
  stageName,
  automations = [],
  onAutomationsChange,
  editingAutomation = null,
}: AutomationBuilderProps) {
  const [currentAutomation, setCurrentAutomation] = useState<Automation>(() => {
    if (editingAutomation) {
      return { ...editingAutomation };
    }
    return {
    id: `auto_${Date.now()}`,
    name: '',
    trigger: null,
    enabled: true,
    conditions: [],
    actions: [],
    };
  });

  // Update currentAutomation only when dialog opens or editingAutomation prop changes (not on every render)
  const previousEditingAutomationId = useRef<string | null>(null);
  const previousOpen = useRef<boolean>(false);
  
  useEffect(() => {
    // Only update if:
    // 1. Dialog just opened (open changed from false to true)
    // 2. We're switching between edit/new mode (editingAutomation.id changed)
    const dialogJustOpened = open && !previousOpen.current;
    const editingAutomationChanged = editingAutomation?.id !== previousEditingAutomationId.current;
    
    if (dialogJustOpened || editingAutomationChanged) {
      if (editingAutomation && open) {
        setCurrentAutomation({ ...editingAutomation });
        previousEditingAutomationId.current = editingAutomation.id;
      } else if (!editingAutomation && open) {
        setCurrentAutomation({
          id: `auto_${Date.now()}`,
          name: '',
          trigger: null,
          enabled: true,
          conditions: [],
          actions: [],
        });
        previousEditingAutomationId.current = null;
      }
    }
    
    previousOpen.current = open;
  }, [editingAutomation, open]);

  const handleSave = () => {
    // Validation
    if (!currentAutomation.trigger) {
      toast.error('Please select a trigger');
      return;
    }

    if (currentAutomation.actions.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    if (!currentAutomation.name.trim()) {
      toast.error('Please enter an automation name');
      return;
    }

    // Validate trigger configuration
    const triggerSchema = TRIGGER_CONFIG_SCHEMAS[currentAutomation.trigger.id];
    if (triggerSchema && triggerSchema.length > 0) {
      const triggerConfig = currentAutomation.trigger.config || {};
      
      for (const field of triggerSchema) {
        if (field.required) {
          const value = triggerConfig[field.key];
          
          // Check for conditional visibility
          if (field.key === 'scheduleDay' && currentAutomation.trigger.id === 't12') {
            const scheduleType = triggerConfig.scheduleType;
            if (scheduleType !== 'weekly' && scheduleType !== 'monthly') {
              continue; // Skip validation if not visible
            }
          }
          
          if (value === undefined || value === null || value === '') {
            toast.error(`Trigger configuration required: ${field.label}`);
            return;
          }
        }
      }
    }

    // Validate action configurations
    for (let i = 0; i < currentAutomation.actions.length; i++) {
      const action = currentAutomation.actions[i];
      const actionSchema = ACTION_CONFIG_SCHEMAS[action.id];
      
      if (actionSchema && actionSchema.length > 0) {
        const actionConfig = action.config || {};
        
        for (const field of actionSchema) {
          if (field.required) {
            const value = actionConfig[field.key];
            
            if (value === undefined || value === null || value === '') {
              toast.error(`Action #${i + 1} (${action.name}) configuration required: ${field.label}`);
              return;
            }
            
            // Special validation for multiselect
            if (field.type === 'multiselect' && Array.isArray(value) && value.length === 0) {
              toast.error(`Action #${i + 1} (${action.name}) configuration required: ${field.label}`);
              return;
            }
          }
        }
      }
    }

    // Save automation (update if editing, create if new)
    const isEditing = editingAutomation !== null && editingAutomation !== undefined;
    let updatedAutomations: Automation[];
    
    if (isEditing) {
      // Update existing automation
      updatedAutomations = automations.map(a => 
        a.id === currentAutomation.id ? currentAutomation : a
      );
      toast.success('Automation updated successfully');
    } else {
      // Create new automation
      updatedAutomations = [...automations, currentAutomation];
    toast.success('Automation saved successfully');
    }
    
    onAutomationsChange?.(updatedAutomations);
    onOpenChange?.(false);
    
    // Reset form
    setCurrentAutomation({
      id: `auto_${Date.now()}`,
      name: '',
      trigger: null,
      enabled: true,
      conditions: [],
      actions: [],
    });
  };

  const handleCancel = () => {
    onOpenChange?.(false);
    // Reset form
    setCurrentAutomation({
      id: `auto_${Date.now()}`,
      name: '',
      trigger: null,
      enabled: true,
      conditions: [],
      actions: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingAutomation ? 'Edit' : 'Create'} Automation {stageName && `for ${stageName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Automation Name */}
          <div className="space-y-2">
            <Label htmlFor="automation-name">Automation Name</Label>
            <Input
              id="automation-name"
              value={currentAutomation.name}
              onChange={(e) =>
                setCurrentAutomation({ ...currentAutomation, name: e.target.value })
              }
              placeholder="Enter automation name..."
            />
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label htmlFor="automation-enabled" className="cursor-pointer">
              Enable this automation
            </Label>
            <Switch
              id="automation-enabled"
              checked={currentAutomation.enabled}
              onCheckedChange={(checked) =>
                setCurrentAutomation({ ...currentAutomation, enabled: checked })
              }
            />
          </div>

          {/* Trigger Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Trigger</CardTitle>
            </CardHeader>
            <CardContent>
              <TriggerSelector
                value={currentAutomation.trigger}
                onChange={(trigger) =>
                  setCurrentAutomation({ ...currentAutomation, trigger })
                }
              />
            </CardContent>
          </Card>

          {/* Conditions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ConditionBuilder
                conditions={currentAutomation.conditions}
                onChange={(conditions) =>
                  setCurrentAutomation({ ...currentAutomation, conditions })
                }
              />
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionBuilder
                actions={currentAutomation.actions}
                onChange={(actions) =>
                  setCurrentAutomation({ ...currentAutomation, actions })
                }
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <AutomationPreview
            trigger={currentAutomation.trigger}
            conditions={currentAutomation.conditions}
            actions={currentAutomation.actions}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} style={{ backgroundColor: 'var(--primaryColor)' }}>
            {editingAutomation ? 'Update Automation' : 'Save Automation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export default for backward compatibility
export default AutomationBuilder;
