import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// Firm-wide payroll settings
export interface FirmSettings {
  // Holiday Policy
  holidaysPaid: boolean;
  holidayPayRate: number; // 1.0 = normal, 1.5 = time and a half, 2.0 = double
  firmHolidays: string[]; // Array of holiday dates (YYYY-MM-DD format)

  // Lunch Break Policy
  lunchPaid: boolean; // true = paid lunch, false = unpaid (deducted)
  lunchDeductionMethod: "auto" | "manual";
  lunchDefaultMinutes: number;
  lunchFlexible: boolean;

  // PTO Policy
  ptoType: "accrued" | "upfront";
  ptoAccrualRate: number; // hours per pay period
  ptoAccrualPeriod:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "per-hour";
  ptoAnnualLimit: number; // hours per year
  ptoCarryoverAllowed: boolean;
  ptoMaxCarryover: number; // hours
  ptoPaid: boolean;

  // Sick Leave Policy (Comprehensive)
  sickLeaveSeparate: boolean; // true = separate from PTO, false = combined
  sickLeaveAccrualMethod?:
    | "per-hour"
    | "per-pay-period"
    | "lump-sum"; // How sick time accrues
  sickLeaveAccrualRate?: number; // e.g., 1 hour per 30 hours worked, or 4 hours per pay period
  sickLeaveAccrualFrequency?:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "annually"; // For per-pay-period and lump-sum
  sickLeaveAnnualLimit?: number; // hours per year (e.g., 40, 80)
  sickLeaveAccrualCap?: number; // Maximum balance allowed (e.g., 48 hours)
  sickLeaveWaitingPeriodDays?: number; // Days before accrual starts (e.g., 30, 90)
  sickLeaveUsageWaitingPeriodDays?: number; // Days before usage is allowed (e.g., 90)
  sickLeaveCarryoverPolicy?: "unlimited" | "limited" | "none"; // Rollover rules
  sickLeaveMaxCarryover?: number; // Hours that can carry over (if limited)
  sickLeavePayType?: "paid" | "unpaid" | "partial"; // How sick time is paid
  sickLeavePartialPayPercentage?: number; // Percentage if partial (e.g., 50, 75)
  sickLeaveStateCompliance?: string; // State compliance template ID (california, washington, newyork, etc.)

  // Overtime Policy
  overtimeEnabled: boolean;
  overtimeDefaultThreshold: number; // hours per week
  overtimeDefaultRate: number; // 1.5 = time and a half
  overtimeCalculationPeriod: "weekly" | "biweekly" | "monthly";

  // Work Week Settings
  standardHoursPerWeek: number;
  workDays: number[]; // 0=Sunday, 1=Monday, etc.

  // Time Entry & Permissions (NEW)
  timeEntryMethod?: "clock-in-out" | "manual-entry" | "hybrid"; // How users log time
  userTimeEditPermission?:
    | "free-edit"
    | "view-only"
    | "requires-approval"; // User editing permissions
}

// User Profile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  hoursPerWeek: number;
  hourlyRate: number; // Cost to firm
  billableRate: number; // Client-facing rate
  active: boolean;

  // Employment Type (NEW)
  employmentType?: "hourly" | "salaried" | "contractor";
  annualSalary?: number; // For salaried employees

  // Payroll and time tracking settings
  ptoHoursPerYear?: number; // Vacation/PTO hours allocated per year
  ptoHoursUsed?: number; // PTO hours used this year
  ptoBalance?: number; // Current PTO balance in hours

  // Sick Leave Tracking (Comprehensive)
  sickLeaveBalance?: number; // Current sick leave balance in hours
  sickLeaveUsed?: number; // Sick leave hours used this year
  sickLeaveAccrued?: number; // Total sick leave accrued this year
  sickLeaveHireDate?: string; // Hire date for waiting period calculations (YYYY-MM-DD)
  sickLeaveCustomPolicy?: boolean; // true = uses custom policy, false = uses firm default
  // Custom policy overrides (only used if sickLeaveCustomPolicy = true)
  sickLeaveAccrualMethod?:
    | "per-hour"
    | "per-pay-period"
    | "lump-sum";
  sickLeaveAccrualRate?: number;
  sickLeaveAccrualFrequency?:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "annually";
  sickLeaveAnnualLimit?: number;
  sickLeaveAccrualCap?: number;
  sickLeavePayType?: "paid" | "unpaid" | "partial";
  sickLeavePartialPayPercentage?: number;
  sickLeaveCarryoverPolicy?: "unlimited" | "limited" | "none";
  sickLeaveMaxCarryover?: number;

  holidays?: string[]; // Array of holiday dates (YYYY-MM-DD format) - overrides firm defaults
  lunchBreakMinutes?: number; // Daily lunch break in minutes (auto-deducted)
  lunchPaid?: boolean; // Override firm default for lunch paid/unpaid
  overtimeEnabled?: boolean; // Whether this user is eligible for overtime
  overtimeRate?: number; // Overtime hourly rate (typically 1.5x base rate)
  overtimeThreshold?: number; // Hours per week before overtime applies (default 40)
}

// Types
interface QuickAction {
  id: string;
  type: string;
  label: string;
  config?: any;
}

// Stage task template (used in workflow builder)
interface StageTaskTemplate {
  id: string;
  name: string;
  description: string;
  assigneeRole: string;
  assignmentType: "direct" | "inherit";
  inheritFromTaskId?: string;
  estimatedTime: string;
  movesToNextStage: boolean;
  dependencies: string[];
  quickActions?: QuickAction[];
}

// Actual project task (instances created from templates)
export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  projectId: string;
  workflowId: string;
  stageId: string;
  assignee: string;
  priority?: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "blocked" | "completed";
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  templateTaskId?: string; // Links back to stage task template
  automations: number;
  dependencies: string[];
  comments?: number;
  attachments?: number;
  subtasks?: { total: number; completed: number };
  isRecurring?: boolean;
  recurrencePattern?:
    | "daily"
    | "weekly"
    | "weekdays"
    | "monthly"
    | "yearly"
    | "custom";
  recurrenceInterval?: number; // For custom intervals (e.g., every 2 weeks)
  recurrenceBaseDate?: "scheduled" | "completed"; // Base next occurrence on scheduled date or completion date
  recurrenceStartDate?: string; // When recurrence should start
  recurrenceEndDate?: string; // When recurrence should end
  recurrenceWeekDays?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  recurrenceDayOfMonth?: number; // For monthly: specific day of month
  timeTracked?: number; // Total time tracked in seconds
}

// Timer entry for time tracking
export interface TimerEntry {
  id: string;
  taskId: string;
  projectId: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp
  duration?: number; // in seconds
}

// Active timer state
export interface ActiveTimer {
  taskId: string;
  projectId: string;
  startTime: number;
  isPaused: boolean;
  pausedTime?: number; // Total time paused in ms
  lastPauseStart?: number; // When the current pause started
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  triggerTaskId?: string;
  enabled: boolean;
  actions: string[];
  details?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  tasks: StageTaskTemplate[];
  automations: Automation[];
  trackerLabel: string;
  trackerIcon?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  stages: Stage[];
  category?:
    | "Bookkeeping"
    | "Tax"
    | "Payroll"
    | "Sales"
    | "Advisory";
}

export interface Project {
  id: string;
  name: string;
  workflowId: string;
  currentStageId: string;
  assignees: string[];
  progress: number;
  tasks: { total: number; completed: number };
  dueDate: string;
  comments: number;
  attachments: number;
  createdAt: string;
  clientName?: string;
  personInCharge?: string;
  timeSpent?: number; // in hours
  year?: number;
  billableStatus?: "billable" | "non-billable";
  clientType?: "individual" | "business";
}

interface WorkflowContextType {
  workflows: Workflow[];
  projects: Project[];
  tasks: ProjectTask[];
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (workflow: Workflow) => void;
  deleteWorkflow: (workflowId: string) => void;
  duplicateWorkflow: (
    workflowId: string,
    customName?: string,
  ) => string;
  getWorkflow: (workflowId: string) => Workflow | undefined;
  addProject: (
    project: Omit<Project, "id" | "createdAt">,
  ) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  getProjectsByWorkflow: (workflowId: string) => Project[];
  moveProject: (projectId: string, newStageId: string) => void;
  // Task management
  addTask: (
    task: Omit<ProjectTask, "id" | "createdAt">,
  ) => void;
  updateTask: (task: ProjectTask) => void;
  deleteTask: (taskId: string) => void;
  getTasksByProject: (projectId: string) => ProjectTask[];
  getTasksByWorkflow: (workflowId: string) => ProjectTask[];
  getTasksByAssignee: (assignee: string) => ProjectTask[];
  getTaskCounts: (workflowId: string) => {
    total: number;
    overdue: number;
    dueSoon: number;
  };
  // Timer management
  activeTimer: ActiveTimer | null;
  timerEntries: TimerEntry[];
  startTimer: (taskId: string, projectId: string) => void;
  stopTimer: () => number; // Returns total time tracked
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateTimerTask: (projectId: string) => void;
  getTimerElapsed: () => number;
  getTimerEntriesByTask: (taskId: string) => TimerEntry[];
  getTimerEntriesByProject: (projectId: string) => TimerEntry[];
  getAllTimerEntries: () => TimerEntry[];
  updateTimerEntry: (entry: TimerEntry) => void;
  updateTimerEntryProject: (
    entryId: string,
    projectId: string,
  ) => void;
  // User Profile management
  userProfiles: UserProfile[];
  updateUserProfiles: (profiles: UserProfile[]) => void;
  // Firm Settings management
  firmSettings: FirmSettings;
  updateFirmSettings: (settings: FirmSettings) => void;
}

const WorkflowContext = createContext<
  WorkflowContextType | undefined
>(undefined);

// Initial mock workflows for demo
const initialWorkflows: Workflow[] = [
  {
    id: "workflow-accounting",
    name: "Accounting Workflow",
    description: "Standard accounting process workflow",
    icon: "📊",
    category: "Bookkeeping",
    stages: [
      {
        id: "stage-1",
        name: "Document Collection",
        color: "border-blue-500",
        trackerLabel: "Collecting Documents",
        trackerIcon: "📄",
        tasks: [
          {
            id: "acc-task-1",
            name: "Send document request to client",
            description:
              "Send email with list of required documents",
            assigneeRole: "Accountant",
            assignmentType: "direct",
            estimatedTime: "15 min",
            movesToNextStage: false,
            dependencies: [],
          },
          {
            id: "acc-task-2",
            name: "Upload bank statements",
            description:
              "Upload all bank statements for the period",
            assigneeRole: "Client",
            assignmentType: "direct",
            estimatedTime: "30 min",
            movesToNextStage: false,
            dependencies: ["acc-task-1"],
          },
          {
            id: "acc-task-3",
            name: "Upload receipts and invoices",
            description: "Upload all receipts and invoices",
            assigneeRole: "Client",
            assignmentType: "direct",
            estimatedTime: "45 min",
            movesToNextStage: false,
            dependencies: ["acc-task-1"],
          },
          {
            id: "acc-task-4",
            name: "Verify document completeness",
            description:
              "Check all required documents are received",
            assigneeRole: "Accountant",
            assignmentType: "direct",
            estimatedTime: "20 min",
            movesToNextStage: true,
            dependencies: ["acc-task-2", "acc-task-3"],
          },
        ],
        automations: [
          {
            id: "acc-auto-1",
            name: "Send welcome email",
            trigger: "stage_entered",
            enabled: true,
            actions: ["Send email template", "Set due date"],
            details:
              "Automatically send document request when project enters this stage",
          },
          {
            id: "acc-auto-2",
            name: "Reminder for pending documents",
            trigger: "time_based",
            enabled: true,
            actions: [
              "Send reminder email",
              "Notify accountant",
            ],
            details:
              "3 days after stage entry if documents not received",
          },
        ],
      },
      {
        id: "stage-2",
        name: "Reconciliation",
        color: "border-violet-500",
        trackerLabel: "Reviewing Transactions",
        trackerIcon: "🔄",
        tasks: [
          {
            id: "acc-task-5",
            name: "Import bank transactions",
            description:
              "Import transactions into accounting software",
            assigneeRole: "Bookkeeper",
            assignmentType: "direct",
            estimatedTime: "30 min",
            movesToNextStage: false,
            dependencies: [],
          },
          {
            id: "acc-task-6",
            name: "Categorize transactions",
            description:
              "Categorize all transactions by account",
            assigneeRole: "Bookkeeper",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-5",
            estimatedTime: "2 hours",
            movesToNextStage: false,
            dependencies: ["acc-task-5"],
          },
          {
            id: "acc-task-7",
            name: "Match receipts to transactions",
            description:
              "Match uploaded receipts with bank transactions",
            assigneeRole: "Bookkeeper",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-6",
            estimatedTime: "1.5 hours",
            movesToNextStage: false,
            dependencies: ["acc-task-6"],
          },
          {
            id: "acc-task-8",
            name: "Reconcile accounts",
            description:
              "Reconcile all accounts and resolve discrepancies",
            assigneeRole: "Bookkeeper",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-7",
            estimatedTime: "1 hour",
            movesToNextStage: true,
            dependencies: ["acc-task-7"],
          },
        ],
        automations: [
          {
            id: "acc-auto-3",
            name: "Auto-categorize transactions",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-5",
            enabled: true,
            actions: [
              "Run AI categorization",
              "Flag uncategorized items",
            ],
            details:
              "Automatically categorize common transactions using AI",
          },
          {
            id: "acc-auto-4",
            name: "Flag missing receipts",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-7",
            enabled: true,
            actions: [
              "Create task for missing receipts",
              "Email client",
            ],
            details:
              "Automatically request missing receipts from client",
          },
        ],
      },
      {
        id: "stage-3",
        name: "Review",
        color: "border-amber-500",
        trackerLabel: "Under Review",
        trackerIcon: "👁️",
        tasks: [
          {
            id: "acc-task-9",
            name: "Generate financial statements",
            description:
              "Generate P&L, Balance Sheet, and Cash Flow",
            assigneeRole: "Senior Accountant",
            assignmentType: "direct",
            estimatedTime: "45 min",
            movesToNextStage: false,
            dependencies: [],
          },
          {
            id: "acc-task-10",
            name: "Review for accuracy",
            description:
              "Review all accounts for accuracy and completeness",
            assigneeRole: "Senior Accountant",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-9",
            estimatedTime: "1 hour",
            movesToNextStage: false,
            dependencies: ["acc-task-9"],
          },
          {
            id: "acc-task-11",
            name: "Prepare notes and adjustments",
            description:
              "Document any adjustments or notes for the client",
            assigneeRole: "Senior Accountant",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-10",
            estimatedTime: "30 min",
            movesToNextStage: false,
            dependencies: ["acc-task-10"],
          },
          {
            id: "acc-task-12",
            name: "Partner review and approval",
            description:
              "Final review and approval from partner",
            assigneeRole: "Partner",
            assignmentType: "direct",
            estimatedTime: "30 min",
            movesToNextStage: true,
            dependencies: ["acc-task-11"],
          },
        ],
        automations: [
          {
            id: "acc-auto-5",
            name: "Quality check alert",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-10",
            enabled: true,
            actions: ["Run quality checks", "Flag anomalies"],
            details:
              "Automatically flag unusual transactions or variances",
          },
          {
            id: "acc-auto-6",
            name: "Request partner review",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-11",
            enabled: true,
            actions: ["Assign to partner", "Send notification"],
            details:
              "Automatically notify partner when ready for review",
          },
        ],
      },
      {
        id: "stage-4",
        name: "Approved",
        color: "border-green-500",
        trackerLabel: "Approved",
        trackerIcon: "✅",
        tasks: [
          {
            id: "acc-task-13",
            name: "Prepare client presentation",
            description:
              "Create presentation of financial results",
            assigneeRole: "Senior Accountant",
            assignmentType: "direct",
            estimatedTime: "1 hour",
            movesToNextStage: false,
            dependencies: [],
          },
          {
            id: "acc-task-14",
            name: "Schedule client meeting",
            description:
              "Schedule meeting to review results with client",
            assigneeRole: "Admin",
            assignmentType: "direct",
            estimatedTime: "15 min",
            movesToNextStage: false,
            dependencies: ["acc-task-13"],
          },
          {
            id: "acc-task-15",
            name: "Conduct client review meeting",
            description:
              "Present financial statements and answer questions",
            assigneeRole: "Senior Accountant",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-13",
            estimatedTime: "1 hour",
            movesToNextStage: false,
            dependencies: ["acc-task-14"],
          },
          {
            id: "acc-task-16",
            name: "Client approval confirmation",
            description:
              "Obtain client sign-off on financial statements",
            assigneeRole: "Client",
            assignmentType: "direct",
            estimatedTime: "5 min",
            movesToNextStage: true,
            dependencies: ["acc-task-15"],
          },
        ],
        automations: [
          {
            id: "acc-auto-7",
            name: "Send calendar invite",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-14",
            enabled: true,
            actions: [
              "Send calendar invite",
              "Attach presentation",
            ],
            details:
              "Automatically send meeting invite with documents",
          },
        ],
      },
      {
        id: "stage-5",
        name: "Invoiced",
        color: "border-emerald-500",
        trackerLabel: "Complete",
        trackerIcon: "💰",
        tasks: [
          {
            id: "acc-task-17",
            name: "Generate invoice",
            description:
              "Create invoice based on services provided",
            assigneeRole: "Billing",
            assignmentType: "direct",
            estimatedTime: "15 min",
            movesToNextStage: false,
            dependencies: [],
          },
          {
            id: "acc-task-18",
            name: "Send invoice to client",
            description:
              "Email invoice and payment instructions",
            assigneeRole: "Billing",
            assignmentType: "inherit",
            inheritFromTaskId: "acc-task-17",
            estimatedTime: "5 min",
            movesToNextStage: false,
            dependencies: ["acc-task-17"],
          },
          {
            id: "acc-task-19",
            name: "Archive project documents",
            description:
              "Archive all project documents in secure storage",
            assigneeRole: "Admin",
            assignmentType: "direct",
            estimatedTime: "20 min",
            movesToNextStage: false,
            dependencies: ["acc-task-18"],
          },
          {
            id: "acc-task-20",
            name: "Close project",
            description:
              "Mark project as complete and update CRM",
            assigneeRole: "Senior Accountant",
            assignmentType: "direct",
            estimatedTime: "10 min",
            movesToNextStage: false,
            dependencies: ["acc-task-19"],
          },
        ],
        automations: [
          {
            id: "acc-auto-8",
            name: "Auto-generate invoice",
            trigger: "stage_entered",
            enabled: true,
            actions: [
              "Calculate billable hours",
              "Generate invoice",
            ],
            details:
              "Automatically create invoice when project is approved",
          },
          {
            id: "acc-auto-9",
            name: "Payment reminder",
            trigger: "time_based",
            enabled: true,
            actions: [
              "Send payment reminder",
              "Update accounts receivable",
            ],
            details:
              "Send reminder if payment not received in 14 days",
          },
          {
            id: "acc-auto-10",
            name: "Request feedback",
            trigger: "specific_task_completed",
            triggerTaskId: "acc-task-20",
            enabled: true,
            actions: [
              "Send feedback survey",
              "Update client record",
            ],
            details:
              "Request client feedback after project completion",
          },
        ],
      },
    ],
  },
  {
    id: "workflow-sales",
    name: "Sales Pipeline",
    description: "Lead to client conversion workflow",
    icon: "📈",
    category: "Sales",
    stages: [
      {
        id: "stage-s1",
        name: "New Lead",
        color: "border-slate-500",
        trackerLabel: "Initial Contact",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-s2",
        name: "Qualified",
        color: "border-blue-500",
        trackerLabel: "Reviewing Proposal",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-s3",
        name: "Proposal",
        color: "border-violet-500",
        trackerLabel: "Proposal Sent",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-s4",
        name: "Negotiation",
        color: "border-amber-500",
        trackerLabel: "In Discussion",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-s5",
        name: "Won",
        color: "border-green-500",
        trackerLabel: "Onboarding",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-tax",
    name: "Tax Preparation",
    description: "Individual and business tax return workflow",
    icon: "📋",
    category: "Tax",
    stages: [
      {
        id: "stage-t1",
        name: "Organizer",
        color: "border-blue-500",
        trackerLabel: "Collecting Info",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-t2",
        name: "Preparation",
        color: "border-violet-500",
        trackerLabel: "Preparing",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-t3",
        name: "Review",
        color: "border-amber-500",
        trackerLabel: "Under Review",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-t4",
        name: "E-File",
        color: "border-green-500",
        trackerLabel: "Filed",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-payroll",
    name: "Payroll Processing",
    description: "Monthly payroll workflow",
    icon: "💰",
    category: "Payroll",
    stages: [
      {
        id: "stage-p1",
        name: "Data Collection",
        color: "border-blue-500",
        trackerLabel: "Collecting Data",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-p2",
        name: "Processing",
        color: "border-violet-500",
        trackerLabel: "Processing",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-p3",
        name: "Review",
        color: "border-amber-500",
        trackerLabel: "Reviewing",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-p4",
        name: "Completed",
        color: "border-green-500",
        trackerLabel: "Paid",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-advisory",
    name: "Advisory Services",
    description: "Client advisory and consultation workflow",
    icon: "🎯",
    category: "Advisory",
    stages: [
      {
        id: "stage-a1",
        name: "Discovery",
        color: "border-blue-500",
        trackerLabel: "Discovering Needs",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-a2",
        name: "Analysis",
        color: "border-violet-500",
        trackerLabel: "Analyzing",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-a3",
        name: "Recommendations",
        color: "border-amber-500",
        trackerLabel: "Presenting",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-a4",
        name: "Implementation",
        color: "border-green-500",
        trackerLabel: "Implementing",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-audit",
    name: "Financial Audit",
    description: "Internal and external audit workflow",
    icon: "🔍",
    category: "Advisory",
    stages: [
      {
        id: "stage-au1",
        name: "Planning",
        color: "border-blue-500",
        trackerLabel: "Planning",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-au2",
        name: "Fieldwork",
        color: "border-violet-500",
        trackerLabel: "In Progress",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-au3",
        name: "Reporting",
        color: "border-amber-500",
        trackerLabel: "Drafting Report",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-au4",
        name: "Complete",
        color: "border-green-500",
        trackerLabel: "Completed",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-onboarding",
    name: "Client Onboarding",
    description: "New client onboarding process",
    icon: "👋",
    category: "Sales",
    stages: [
      {
        id: "stage-o1",
        name: "Welcome",
        color: "border-blue-500",
        trackerLabel: "Getting Started",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-o2",
        name: "Setup",
        color: "border-violet-500",
        trackerLabel: "Setting Up",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-o3",
        name: "Training",
        color: "border-amber-500",
        trackerLabel: "Training",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-o4",
        name: "Active",
        color: "border-green-500",
        trackerLabel: "Active Client",
        tasks: [],
        automations: [],
      },
    ],
  },
  {
    id: "workflow-compliance",
    name: "Compliance Review",
    description: "Regulatory compliance workflow",
    icon: "⚖️",
    category: "Advisory",
    stages: [
      {
        id: "stage-c1",
        name: "Assessment",
        color: "border-blue-500",
        trackerLabel: "Assessing",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-c2",
        name: "Documentation",
        color: "border-violet-500",
        trackerLabel: "Documenting",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-c3",
        name: "Remediation",
        color: "border-amber-500",
        trackerLabel: "Fixing Issues",
        tasks: [],
        automations: [],
      },
      {
        id: "stage-c4",
        name: "Certified",
        color: "border-green-500",
        trackerLabel: "Compliant",
        tasks: [],
        automations: [],
      },
    ],
  },
];

// Initial mock projects
const initialProjects: Project[] = [
  {
    id: "client-1",
    name: "Acme Corp",
    workflowId: "workflow-accounting",
    currentStageId: "stage-1",
    assignees: ["JD", "SM"],
    progress: 25,
    tasks: { total: 8, completed: 2 },
    dueDate: "Nov 15",
    comments: 5,
    attachments: 3,
    createdAt: new Date(2025, 0, 15).toISOString(),
    clientName: "Acme Corp",
    personInCharge: "JD",
    timeSpent: 12.5,
    year: 2025,
    billableStatus: "billable",
    clientType: "business",
  },
  {
    id: "client-2",
    name: "TechStart LLC",
    workflowId: "workflow-accounting",
    currentStageId: "stage-2",
    assignees: ["AS"],
    progress: 45,
    tasks: { total: 6, completed: 3 },
    dueDate: "Nov 12",
    comments: 8,
    attachments: 12,
    createdAt: new Date(2025, 1, 3).toISOString(),
    clientName: "TechStart LLC",
    personInCharge: "AS",
    timeSpent: 8.0,
    year: 2025,
    billableStatus: "billable",
    clientType: "business",
  },
  {
    id: "client-3",
    name: "Global Industries",
    workflowId: "workflow-accounting",
    currentStageId: "stage-3",
    assignees: ["SM", "AS"],
    progress: 75,
    tasks: { total: 5, completed: 4 },
    dueDate: "Nov 10",
    comments: 15,
    attachments: 20,
    createdAt: new Date(2024, 11, 20).toISOString(),
    clientName: "Global Industries",
    personInCharge: "SM",
    timeSpent: 24.5,
    year: 2024,
    billableStatus: "billable",
    clientType: "business",
  },
  {
    id: "client-4",
    name: "Startup XYZ",
    workflowId: "workflow-sales",
    currentStageId: "stage-s2",
    assignees: ["JD", "KL"],
    progress: 60,
    tasks: { total: 10, completed: 6 },
    dueDate: "Nov 18",
    comments: 12,
    attachments: 8,
    createdAt: new Date(2025, 2, 10).toISOString(),
    clientName: "Startup XYZ",
    personInCharge: "JD",
    timeSpent: 15.0,
    year: 2025,
    billableStatus: "billable",
    clientType: "business",
  },
  {
    id: "client-5",
    name: "Enterprise Co",
    workflowId: "workflow-sales",
    currentStageId: "stage-s4",
    assignees: ["JD"],
    progress: 90,
    tasks: { total: 7, completed: 6 },
    dueDate: "Nov 8",
    comments: 6,
    attachments: 5,
    createdAt: new Date(2025, 1, 28).toISOString(),
    clientName: "Enterprise Co",
    personInCharge: "JD",
    timeSpent: 32.0,
    year: 2025,
    billableStatus: "billable",
    clientType: "individual",
  },
  {
    id: "uncat-project",
    name: "Internal Projects",
    workflowId: "workflow-general",
    currentStageId: "stage-general",
    assignees: ["Emily Brown"],
    progress: 30,
    tasks: { total: 4, completed: 0 },
    dueDate: "Nov 5",
    comments: 0,
    attachments: 0,
    createdAt: new Date(2025, 9, 25).toISOString(),
    clientName: "Internal",
    personInCharge: "Emily Brown",
    timeSpent: 8.5,
    year: 2025,
    billableStatus: "non-billable",
    clientType: "business",
  },
];

// Initial mock tasks
const initialTasks: ProjectTask[] = [
  // Acme Corp (Accounting) - Stage 1: Document Collection
  {
    id: "task-1",
    name: "Collect bank statements",
    description:
      "Request and collect all bank statements for the month",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "John Smith",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 13).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 345600000).toISOString(), // Completed 4 days ago
    automations: 2,
    dependencies: [],
    comments: 3,
    attachments: 2,
    subtasks: { total: 4, completed: 4 },
  },
  {
    id: "task-2",
    name: "Request credit card receipts",
    description: "Follow up on missing credit card receipts",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "John Smith",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 12).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 432000000).toISOString(), // Completed 5 days ago
    automations: 1,
    dependencies: [],
    comments: 1,
    attachments: 0,
    subtasks: { total: 2, completed: 2 },
  },
  // TechStart LLC (Accounting) - Stage 2: Reconciliation
  {
    id: "task-3",
    name: "Reconcile checking account",
    description: "Match transactions with bank statements",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "Mike Wilson",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 14).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 259200000).toISOString(), // Completed 3 days ago
    automations: 1,
    dependencies: [],
    comments: 5,
    attachments: 3,
    subtasks: { total: 3, completed: 3 },
  },
  {
    id: "task-4",
    name: "Review payroll entries",
    description:
      "Verify all payroll entries are correctly categorized",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "John Smith",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 7).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 432000000).toISOString(), // Completed 5 days ago
    automations: 0,
    dependencies: ["task-3"],
    comments: 0,
    attachments: 1,
    subtasks: { total: 5, completed: 5 },
  },
  // Global Industries (Accounting) - Stage 3: Review
  {
    id: "task-5",
    name: "Final review of financials",
    description: "Complete final review before approval",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "Mike Wilson",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 10).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(), // Completed 2 days ago
    automations: 3,
    dependencies: [],
    comments: 12,
    attachments: 8,
    subtasks: { total: 6, completed: 6 },
  },
  {
    id: "task-6",
    name: "Client approval meeting",
    description:
      "Schedule and conduct approval meeting with client",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "AS",
    priority: "high",
    status: "todo",
    dueDate: new Date(2025, 10, 11).toISOString(), // Nov 11, 2025 - TODAY
    createdAt: new Date().toISOString(),
    automations: 2,
    dependencies: ["task-5"],
    comments: 2,
    attachments: 1,
    subtasks: { total: 3, completed: 1 },
  },
  // Startup XYZ (Sales) - Stage 2: Qualified
  {
    id: "task-7",
    name: "Prepare proposal document",
    description: "Create detailed service proposal",
    projectId: "client-4",
    workflowId: "workflow-sales",
    stageId: "stage-s2",
    assignee: "Emily Brown",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 16).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 518400000).toISOString(), // Completed 6 days ago
    automations: 1,
    dependencies: [],
    comments: 4,
    attachments: 5,
    subtasks: { total: 8, completed: 8 },
  },
  {
    id: "task-8",
    name: "Schedule discovery call",
    description:
      "Set up call to discuss needs and requirements",
    projectId: "client-4",
    workflowId: "workflow-sales",
    stageId: "stage-s2",
    assignee: "Emily Brown",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 8).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 345600000).toISOString(), // Completed 4 days ago
    automations: 0,
    dependencies: [],
    comments: 8,
    attachments: 2,
    subtasks: { total: 2, completed: 2 },
  },
  // Enterprise Co (Sales) - Stage 4: Negotiation
  {
    id: "task-9",
    name: "Review contract terms",
    description:
      "Review and finalize contract terms with legal",
    projectId: "client-5",
    workflowId: "workflow-sales",
    stageId: "stage-s4",
    assignee: "Emily Brown",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 12).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 432000000).toISOString(), // Completed 5 days ago
    automations: 1,
    dependencies: [],
    comments: 6,
    attachments: 4,
    subtasks: { total: 4, completed: 4 },
  },
  {
    id: "task-10",
    name: "Send final proposal",
    description: "Send updated proposal with negotiated terms",
    projectId: "client-5",
    workflowId: "workflow-sales",
    stageId: "stage-s4",
    assignee: "Emily Brown",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 13).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 259200000).toISOString(), // Completed 3 days ago
    automations: 2,
    dependencies: ["task-9"],
    comments: 3,
    attachments: 1,
    subtasks: { total: 3, completed: 3 },
  },
  // Additional tasks for better testing
  {
    id: "task-11",
    name: "Update client contact information",
    description:
      "Verify and update client contact details in system",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "Emily Brown",
    priority: "low",
    status: "completed",
    dueDate: new Date(2025, 10, 18).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 345600000).toISOString(), // Completed 4 days ago
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 1, completed: 1 },
  },
  {
    id: "task-12",
    name: "Prepare quarterly tax estimates",
    description:
      "Calculate and prepare quarterly estimated tax payments",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "Emily Brown",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 5).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(), // Completed 2 days ago
    automations: 1,
    dependencies: [],
    comments: 7,
    attachments: 6,
    subtasks: { total: 5, completed: 5 },
  },
  {
    id: "task-13",
    name: "Review expense reports",
    description: "Audit and approve employee expense reports",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "Sarah Johnson",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 14).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 518400000).toISOString(), // Completed 6 days ago
    automations: 0,
    dependencies: [],
    comments: 2,
    attachments: 4,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "task-14",
    name: "Process vendor invoices",
    description:
      "Review and process outstanding vendor invoices",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "Sarah Johnson",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 13).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 259200000).toISOString(), // Completed 3 days ago
    automations: 1,
    dependencies: [],
    comments: 1,
    attachments: 3,
    subtasks: { total: 2, completed: 2 },
  },
  {
    id: "task-15",
    name: "Send monthly financial reports",
    description:
      "Compile and distribute monthly financial statements",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "Emily Brown",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 12).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(), // Completed 2 days ago
    automations: 2,
    dependencies: [],
    comments: 4,
    attachments: 2,
    subtasks: { total: 4, completed: 4 },
  },
  {
    id: "task-16",
    name: "Follow up on outstanding payments",
    description: "Contact clients with overdue invoices",
    projectId: "client-4",
    workflowId: "workflow-sales",
    stageId: "stage-s2",
    assignee: "Sarah Johnson",
    priority: "high",
    status: "completed",
    dueDate: new Date(2025, 10, 9).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 432000000).toISOString(), // Completed 5 days ago
    automations: 1,
    dependencies: [],
    comments: 9,
    attachments: 1,
    subtasks: { total: 6, completed: 6 },
  },
  {
    id: "task-17",
    name: "Prepare budget forecast",
    description: "Create financial forecast for next quarter",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "David Chen",
    priority: "low",
    status: "completed",
    dueDate: new Date(2025, 10, 6).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 432000000).toISOString(), // Completed 5 days ago
    automations: 0,
    dependencies: [],
    comments: 15,
    attachments: 10,
    subtasks: { total: 7, completed: 7 },
  },
  {
    id: "task-18",
    name: "Schedule team training session",
    description: "Organize training on new accounting software",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "Sarah Johnson",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 21).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 345600000).toISOString(), // Completed 4 days ago
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 3, completed: 3 },
  },
  {
    id: "task-19",
    name: "Audit inventory records",
    description:
      "Verify physical inventory matches system records",
    projectId: "client-5",
    workflowId: "workflow-sales",
    stageId: "stage-s4",
    assignee: "David Chen",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 15).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(), // Completed 2 days ago
    automations: 1,
    dependencies: [],
    comments: 5,
    attachments: 7,
    subtasks: { total: 4, completed: 4 },
  },
  {
    id: "task-20",
    name: "Update employee benefits documentation",
    description:
      "Review and update benefits package information",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "Mike Wilson",
    priority: "low",
    status: "completed",
    dueDate: new Date(2025, 10, 14).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 518400000).toISOString(), // Completed 6 days ago
    automations: 0,
    dependencies: [],
    comments: 1,
    attachments: 2,
    subtasks: { total: 2, completed: 2 },
  },
  // Email Tasks - created from email system
  {
    id: "email-task-1",
    name: "Re: Missing tax documents from Acme Corp",
    description:
      "Client sent email with questions about W-2 forms - need to respond and request missing documents",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-1",
    assignee: "JD",
    priority: "high",
    status: "todo",
    dueDate: new Date(2025, 10, 12).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 0,
    dependencies: [],
    comments: 2,
    attachments: 1,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "email-task-2",
    name: "Action Required: Invoice #4521 payment confirmation",
    description:
      "Client needs confirmation of payment received - check accounts and reply",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "SM",
    priority: "medium",
    status: "in-progress",
    dueDate: new Date(2025, 10, 13).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 0,
    dependencies: [],
    comments: 4,
    attachments: 2,
    subtasks: { total: 2, completed: 1 },
  },
  {
    id: "email-task-3",
    name: "FW: Urgent - Year-end financial review meeting",
    description:
      "Schedule year-end review meeting with Enterprise Co leadership team",
    projectId: "client-5",
    workflowId: "workflow-sales",
    stageId: "stage-s4",
    assignee: "AK",
    priority: "high",
    status: "todo",
    dueDate: new Date(2025, 10, 11).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 1,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 3, completed: 0 },
  },
  {
    id: "email-task-4",
    name: "Question about Q4 expense reports",
    description:
      "Client asking about categorization of several Q4 expenses - review and respond",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "TC",
    priority: "low",
    status: "todo",
    dueDate: new Date(2025, 10, 15).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 0,
    dependencies: [],
    comments: 1,
    attachments: 3,
    subtasks: { total: 0, completed: 0 },
  },
  // Recurring Tasks
  {
    id: "recurring-task-1",
    name: "Weekly bank reconciliation",
    description:
      "Reconcile all bank accounts - runs every Monday",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "AS",
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2025, 10, 18).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 2,
    dependencies: [],
    comments: 3,
    attachments: 1,
    subtasks: { total: 4, completed: 2 },
  },
  {
    id: "recurring-task-2",
    name: "Monthly payroll processing",
    description: "Process and submit payroll for all employees",
    projectId: "client-2",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "JD",
    priority: "high",
    status: "todo",
    dueDate: new Date(2025, 11, 1).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 3,
    dependencies: [],
    comments: 8,
    attachments: 5,
    subtasks: { total: 6, completed: 0 },
  },
  {
    id: "recurring-task-3",
    name: "Daily cash flow report",
    description:
      "Generate and review daily cash position report",
    projectId: "client-3",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "SM",
    priority: "medium",
    status: "completed",
    dueDate: new Date(2025, 10, 11).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    automations: 1,
    dependencies: [],
    comments: 1,
    attachments: 1,
    subtasks: { total: 2, completed: 2 },
  },
  {
    id: "recurring-task-4",
    name: "Quarterly tax payment reminder",
    description:
      "Review and prepare quarterly estimated tax payments",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-2",
    assignee: "AK",
    priority: "high",
    status: "todo",
    dueDate: new Date(2026, 0, 15).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 2,
    dependencies: [],
    comments: 5,
    attachments: 4,
    subtasks: { total: 5, completed: 1 },
  },
  {
    id: "recurring-task-5",
    name: "Bi-weekly team status meeting",
    description:
      "Team sync meeting to review progress and blockers",
    projectId: "client-4",
    workflowId: "workflow-sales",
    stageId: "stage-s2",
    assignee: "KL",
    priority: "low",
    status: "todo",
    dueDate: new Date(2025, 10, 13).toISOString(),
    createdAt: new Date().toISOString(),
    automations: 0,
    dependencies: [],
    comments: 2,
    attachments: 0,
    subtasks: { total: 1, completed: 0 },
  },
  // UNCATEGORIZED TASKS - For testing uncategorized time tracking
  {
    id: "task-uncat-1",
    name: "Admin Work",
    description:
      "General administrative tasks - not yet assigned to client",
    projectId: "uncat-project",
    workflowId: "workflow-general",
    stageId: "stage-general",
    assignee: "Emily Brown",
    priority: "medium",
    status: "in-progress",
    dueDate: new Date(2025, 10, 5).toISOString(),
    createdAt: new Date(2025, 9, 27).toISOString(),
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "task-uncat-2",
    name: "Internal Meeting Prep",
    description: "Preparation for internal team meeting",
    projectId: "uncat-project",
    workflowId: "workflow-general",
    stageId: "stage-general",
    assignee: "Emily Brown",
    priority: "low",
    status: "in-progress",
    dueDate: new Date(2025, 10, 5).toISOString(),
    createdAt: new Date(2025, 9, 28).toISOString(),
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "task-uncat-3",
    name: "Training & Development",
    description: "Professional development time",
    projectId: "uncat-project",
    workflowId: "workflow-general",
    stageId: "stage-general",
    assignee: "Emily Brown",
    priority: "low",
    status: "in-progress",
    dueDate: new Date(2025, 10, 5).toISOString(),
    createdAt: new Date(2025, 9, 28).toISOString(),
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "task-uncat-4",
    name: "Email & Communication",
    description:
      "General email correspondence and communication",
    projectId: "uncat-project",
    workflowId: "workflow-general",
    stageId: "stage-general",
    assignee: "Emily Brown",
    priority: "low",
    status: "in-progress",
    dueDate: new Date(2025, 10, 5).toISOString(),
    createdAt: new Date(2025, 9, 30).toISOString(),
    automations: 0,
    dependencies: [],
    comments: 0,
    attachments: 0,
    subtasks: { total: 0, completed: 0 },
  },
  {
    id: "task-22",
    name: "Tax compliance review",
    description:
      "Review quarterly tax filings and ensure compliance",
    projectId: "client-1",
    workflowId: "workflow-accounting",
    stageId: "stage-3",
    assignee: "Alex Rivera",
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2025, 10, 25).toISOString(),
    createdAt: new Date(2025, 10, 10).toISOString(),
    automations: 0,
    dependencies: [],
    comments: 2,
    attachments: 3,
    subtasks: { total: 4, completed: 2 },
  },
];

// Initial timer entries for testing - Comprehensive dataset for analytics
const initialTimerEntries: TimerEntry[] = [
  // John Smith - This Week (High utilization - ~35 hours)
  {
    id: "js-mon-1",
    taskId: "task-1",
    projectId: "client-1",
    startTime: new Date(Date.now() - 518400000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "js-mon-2",
    taskId: "task-2",
    projectId: "client-1",
    startTime: new Date(Date.now() - 518400000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "js-mon-3",
    taskId: "task-3",
    projectId: "client-2",
    startTime: new Date(Date.now() - 518400000).setHours(
      15,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      17,
      0,
      0,
      0,
    ),
    duration: 5400,
  },
  {
    id: "js-tue-1",
    taskId: "task-4",
    projectId: "client-2",
    startTime: new Date(Date.now() - 432000000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "js-tue-2",
    taskId: "task-5",
    projectId: "client-3",
    startTime: new Date(Date.now() - 432000000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      16,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "js-wed-1",
    taskId: "task-6",
    projectId: "client-3",
    startTime: new Date(Date.now() - 345600000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      11,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "js-wed-2",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 345600000).setHours(
      11,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      14,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "js-wed-3",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 345600000).setHours(
      14,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      16,
      0,
      0,
      0,
    ),
    duration: 5400,
  },
  {
    id: "js-thu-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 259200000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "js-thu-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 259200000).setHours(
      13,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      16,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "js-fri-1",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 172800000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "js-fri-2",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(Date.now() - 172800000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },

  // Sarah Johnson - This Week (Moderate utilization - ~25 hours)
  {
    id: "sj-mon-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 518400000).setHours(
      9,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "sj-mon-2",
    taskId: "task-14",
    projectId: "client-4",
    startTime: new Date(Date.now() - 518400000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "sj-tue-1",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 432000000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      13,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "sj-wed-1",
    taskId: "task-16",
    projectId: "client-1",
    startTime: new Date(Date.now() - 345600000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "sj-wed-2",
    taskId: "task-17",
    projectId: "client-2",
    startTime: new Date(Date.now() - 345600000).setHours(
      13,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "sj-thu-1",
    taskId: "task-18",
    projectId: "client-3",
    startTime: new Date(Date.now() - 259200000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      13,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "sj-fri-1",
    taskId: "task-19",
    projectId: "client-5",
    startTime: new Date(Date.now() - 172800000).setHours(
      9,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 9000,
  },

  // Mike Wilson - This Week (Lower utilization - ~15 hours)
  {
    id: "mw-mon-1",
    taskId: "task-20",
    projectId: "client-2",
    startTime: new Date(Date.now() - 518400000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "mw-wed-1",
    taskId: "task-1",
    projectId: "client-1",
    startTime: new Date(Date.now() - 345600000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      13,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "mw-thu-1",
    taskId: "task-3",
    projectId: "client-2",
    startTime: new Date(Date.now() - 259200000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      16,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "mw-fri-1",
    taskId: "task-5",
    projectId: "client-3",
    startTime: new Date(Date.now() - 172800000).setHours(
      10,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 7200,
  },

  // Emily Brown - This Week (Very high utilization - ~30 hours in 35 hour week)
  {
    id: "eb-mon-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 518400000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-mon-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 518400000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-tue-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 432000000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "eb-tue-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 432000000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-wed-1",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 345600000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "eb-wed-2",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(Date.now() - 345600000).setHours(
      13,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      16,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-thu-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 259200000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-thu-2",
    taskId: "task-14",
    projectId: "client-4",
    startTime: new Date(Date.now() - 259200000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-fri-1",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 172800000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      10,
      30,
      0,
      0,
    ),
    duration: 5400,
  },
  {
    id: "eb-fri-2",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 172800000).setHours(
      10,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 3600,
  },
  {
    id: "eb-fri-3",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 172800000).setHours(
      11,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 3600,
  },
  {
    id: "eb-fri-4",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 172800000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      14,
      0,
      0,
      0,
    ),
    duration: 3600,
  },
  {
    id: "eb-fri-5",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 172800000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 3600,
  },
  {
    id: "eb-fri-6",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 172800000).setHours(
      15,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      15,
      45,
      0,
      0,
    ),
    duration: 2700,
  },

  // Emily Brown - Week of Oct 27 - Nov 2, 2025 with UNCATEGORIZED entries
  // Monday Oct 27
  {
    id: "eb-oct27-1",
    taskId: "task-uncat-1",
    projectId: "uncat-project",
    startTime: new Date(2025, 9, 27, 9, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 27, 11, 30, 0, 0).getTime(),
    duration: 9000,
  },
  {
    id: "eb-oct27-2",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(2025, 9, 27, 13, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 27, 15, 0, 0, 0).getTime(),
    duration: 7200,
  },
  // Tuesday Oct 28
  {
    id: "eb-oct28-1",
    taskId: "task-uncat-2",
    projectId: "uncat-project",
    startTime: new Date(2025, 9, 28, 9, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 28, 10, 30, 0, 0).getTime(),
    duration: 5400,
  },
  {
    id: "eb-oct28-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(2025, 9, 28, 11, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 28, 13, 30, 0, 0).getTime(),
    duration: 9000,
  },
  {
    id: "eb-oct28-3",
    taskId: "task-uncat-3",
    projectId: "uncat-project",
    startTime: new Date(2025, 9, 28, 14, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 28, 15, 45, 0, 0).getTime(),
    duration: 6300,
  },
  // Wednesday Oct 29
  {
    id: "eb-oct29-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(2025, 9, 29, 9, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 29, 12, 0, 0, 0).getTime(),
    duration: 10800,
  },
  {
    id: "eb-oct29-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(2025, 9, 29, 13, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 29, 15, 30, 0, 0).getTime(),
    duration: 9000,
  },
  // Thursday Oct 30
  {
    id: "eb-oct30-1",
    taskId: "task-uncat-4",
    projectId: "uncat-project",
    startTime: new Date(2025, 9, 30, 9, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 30, 10, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct30-2",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(2025, 9, 30, 10, 30, 0, 0).getTime(),
    endTime: new Date(2025, 9, 30, 13, 0, 0, 0).getTime(),
    duration: 9000,
  },
  {
    id: "eb-oct30-3",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(2025, 9, 30, 14, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 30, 16, 0, 0, 0).getTime(),
    duration: 7200,
  },
  // Friday Oct 31, 2025 - 6 entries for testing expand/collapse
  {
    id: "eb-oct31-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(2025, 9, 31, 9, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 10, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct31-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(2025, 9, 31, 10, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 11, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct31-3",
    taskId: "task-9",
    projectId: "client-5",
    startTime: new Date(2025, 9, 31, 11, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 12, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct31-4",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(2025, 9, 31, 13, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 14, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct31-5",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(2025, 9, 31, 14, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 15, 0, 0, 0).getTime(),
    duration: 3600,
  },
  {
    id: "eb-oct31-6",
    taskId: "task-15",
    projectId: "client-2",
    startTime: new Date(2025, 9, 31, 15, 0, 0, 0).getTime(),
    endTime: new Date(2025, 9, 31, 16, 0, 0, 0).getTime(),
    duration: 3600,
  },
  // Saturday Nov 1
  {
    id: "eb-nov1-1",
    taskId: "task-uncat-1",
    projectId: "uncat-project",
    startTime: new Date(2025, 10, 1, 10, 0, 0, 0).getTime(),
    endTime: new Date(2025, 10, 1, 12, 0, 0, 0).getTime(),
    duration: 7200,
  },

  // Emily Brown - Additional entries for last 3 weeks (for monthly view testing)
  // Week 2 ago
  {
    id: "eb-2w-mon-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1728000000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1728000000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-2w-mon-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1728000000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1728000000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-2w-tue-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1641600000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1641600000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-2w-tue-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 1641600000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1641600000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-2w-wed-1",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 1555200000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1555200000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-2w-wed-2",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(Date.now() - 1555200000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1555200000).setHours(
      16,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "eb-2w-thu-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 1468800000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1468800000).setHours(
      11,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-2w-thu-2",
    taskId: "task-14",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1468800000).setHours(
      12,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1468800000).setHours(
      14,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-2w-fri-1",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 1382400000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1382400000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-2w-fri-2",
    taskId: "task-16",
    projectId: "client-1",
    startTime: new Date(Date.now() - 1382400000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1382400000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 7200,
  },

  // Week 3 ago
  {
    id: "eb-3w-mon-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2332800000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2332800000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-3w-mon-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2332800000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2332800000).setHours(
      14,
      30,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "eb-3w-tue-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2246400000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2246400000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "eb-3w-tue-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 2246400000).setHours(
      13,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2246400000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "eb-3w-wed-1",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 2160000000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2160000000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-3w-wed-2",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(Date.now() - 2160000000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2160000000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-3w-thu-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 2073600000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2073600000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-3w-thu-2",
    taskId: "task-14",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2073600000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2073600000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-3w-fri-1",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 1987200000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1987200000).setHours(
      11,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "eb-3w-fri-2",
    taskId: "task-16",
    projectId: "client-1",
    startTime: new Date(Date.now() - 1987200000).setHours(
      12,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1987200000).setHours(
      14,
      30,
      0,
      0,
    ),
    duration: 9000,
  },

  // Week 4 ago
  {
    id: "eb-4w-mon-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2937600000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2937600000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-4w-mon-2",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2937600000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2937600000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "eb-4w-tue-1",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2851200000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2851200000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-4w-tue-2",
    taskId: "task-10",
    projectId: "client-5",
    startTime: new Date(Date.now() - 2851200000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2851200000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-4w-wed-1",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 2764800000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2764800000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-4w-wed-2",
    taskId: "task-12",
    projectId: "client-2",
    startTime: new Date(Date.now() - 2764800000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2764800000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-4w-thu-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 2678400000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2678400000).setHours(
      11,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-4w-thu-2",
    taskId: "task-14",
    projectId: "client-4",
    startTime: new Date(Date.now() - 2678400000).setHours(
      12,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2678400000).setHours(
      14,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "eb-4w-fri-1",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 2592000000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2592000000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-4w-fri-2",
    taskId: "task-16",
    projectId: "client-1",
    startTime: new Date(Date.now() - 2592000000).setHours(
      12,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 2592000000).setHours(
      14,
      30,
      0,
      0,
    ),
    duration: 7200,
  },

  // David Chen - This Week (Very low utilization - ~5 hours)
  {
    id: "dc-tue-1",
    taskId: "task-17",
    projectId: "client-2",
    startTime: new Date(Date.now() - 432000000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 432000000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 5400,
  },
  {
    id: "dc-thu-1",
    taskId: "task-18",
    projectId: "client-3",
    startTime: new Date(Date.now() - 259200000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 259200000).setHours(
      15,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "dc-fri-1",
    taskId: "task-19",
    projectId: "client-5",
    startTime: new Date(Date.now() - 172800000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 5400,
  },

  // Alex Rivera (Contractor) - This Week (~12 hours)
  {
    id: "ar-mon-1",
    taskId: "task-22",
    projectId: "client-1",
    startTime: new Date(Date.now() - 518400000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 518400000).setHours(
      13,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "ar-wed-1",
    taskId: "task-22",
    projectId: "client-1",
    startTime: new Date(Date.now() - 345600000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 345600000).setHours(
      17,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "ar-fri-1",
    taskId: "task-22",
    projectId: "client-1",
    startTime: new Date(Date.now() - 172800000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 172800000).setHours(
      13,
      0,
      0,
      0,
    ),
    duration: 14400,
  },

  // Last Week entries for comparison
  {
    id: "js-lw-1",
    taskId: "task-1",
    projectId: "client-1",
    startTime: new Date(Date.now() - 1123200000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1123200000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "js-lw-2",
    taskId: "task-2",
    projectId: "client-1",
    startTime: new Date(Date.now() - 1036800000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1036800000).setHours(
      13,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "js-lw-3",
    taskId: "task-4",
    projectId: "client-2",
    startTime: new Date(Date.now() - 950400000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 950400000).setHours(
      11,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "js-lw-4",
    taskId: "task-6",
    projectId: "client-3",
    startTime: new Date(Date.now() - 864000000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 864000000).setHours(
      17,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "js-lw-5",
    taskId: "task-8",
    projectId: "client-4",
    startTime: new Date(Date.now() - 777600000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 777600000).setHours(
      13,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "sj-lw-1",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 1123200000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1123200000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "sj-lw-2",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 950400000).setHours(
      9,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 950400000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "sj-lw-3",
    taskId: "task-16",
    projectId: "client-1",
    startTime: new Date(Date.now() - 864000000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 864000000).setHours(
      15,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-lw-1",
    taskId: "task-7",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1123200000).setHours(
      8,
      30,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1123200000).setHours(
      11,
      0,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "eb-lw-2",
    taskId: "task-9",
    projectId: "client-4",
    startTime: new Date(Date.now() - 1036800000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1036800000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 12600,
  },
  {
    id: "eb-lw-3",
    taskId: "task-11",
    projectId: "client-1",
    startTime: new Date(Date.now() - 950400000).setHours(
      13,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 950400000).setHours(
      16,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-lw-4",
    taskId: "task-13",
    projectId: "client-3",
    startTime: new Date(Date.now() - 864000000).setHours(
      9,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 864000000).setHours(
      12,
      0,
      0,
      0,
    ),
    duration: 10800,
  },
  {
    id: "eb-lw-5",
    taskId: "task-15",
    projectId: "client-5",
    startTime: new Date(Date.now() - 777600000).setHours(
      14,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 777600000).setHours(
      16,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
  {
    id: "mw-lw-1",
    taskId: "task-20",
    projectId: "client-2",
    startTime: new Date(Date.now() - 1036800000).setHours(
      11,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 1036800000).setHours(
      13,
      0,
      0,
      0,
    ),
    duration: 7200,
  },
  {
    id: "mw-lw-2",
    taskId: "task-1",
    projectId: "client-1",
    startTime: new Date(Date.now() - 864000000).setHours(
      10,
      0,
      0,
      0,
    ),
    endTime: new Date(Date.now() - 864000000).setHours(
      12,
      30,
      0,
      0,
    ),
    duration: 9000,
  },
];

// Initial user profiles
const initialUserProfiles: UserProfile[] = [
  {
    id: "user-1",
    name: "John Smith",
    email: "john@company.com",
    role: "Senior Accountant",
    hoursPerWeek: 40,
    hourlyRate: 50,
    billableRate: 150,
    active: true,
    ptoHoursPerYear: 120,
    ptoHoursUsed: 24,
    ptoBalance: 96,
    sickLeaveBalance: 40,
    sickLeaveUsed: 8,
    sickLeaveAccrued: 48,
    sickLeaveHireDate: "2020-01-15",
    sickLeaveCustomPolicy: false,
    holidays: ["2025-01-01", "2025-07-04", "2025-12-25"],
    lunchBreakMinutes: 30,
    overtimeEnabled: false,
    overtimeRate: 75,
    overtimeThreshold: 40,
  },
  {
    id: "user-2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Controller",
    hoursPerWeek: 40,
    hourlyRate: 60,
    billableRate: 175,
    active: true,
    ptoHoursPerYear: 160,
    ptoHoursUsed: 40,
    ptoBalance: 120,
    sickLeaveBalance: 56,
    sickLeaveUsed: 16,
    sickLeaveAccrued: 72,
    sickLeaveHireDate: "2018-03-20",
    sickLeaveCustomPolicy: false,
    holidays: ["2025-01-01", "2025-07-04", "2025-12-25"],
    lunchBreakMinutes: 60,
    overtimeEnabled: false,
    overtimeRate: 90,
    overtimeThreshold: 40,
  },
  {
    id: "user-3",
    name: "Mike Wilson",
    email: "mike@company.com",
    role: "Staff Accountant",
    hoursPerWeek: 40,
    hourlyRate: 40,
    billableRate: 120,
    active: true,
    ptoHoursPerYear: 80,
    ptoHoursUsed: 16,
    ptoBalance: 64,
    sickLeaveBalance: 48,
    sickLeaveUsed: 4,
    sickLeaveAccrued: 52,
    sickLeaveHireDate: "2021-06-10",
    sickLeaveCustomPolicy: false,
    holidays: ["2025-01-01", "2025-07-04", "2025-12-25"],
    lunchBreakMinutes: 30,
    overtimeEnabled: true,
    overtimeRate: 60,
    overtimeThreshold: 40,
  },
  {
    id: "user-4",
    name: "Emily Brown",
    email: "emily@company.com",
    role: "Bookkeeper",
    hoursPerWeek: 35,
    hourlyRate: 45,
    billableRate: 135,
    active: true,
    ptoHoursPerYear: 80,
    ptoHoursUsed: 12,
    ptoBalance: 68,
    sickLeaveBalance: 32,
    sickLeaveUsed: 12,
    sickLeaveAccrued: 44,
    sickLeaveHireDate: "2022-09-01",
    sickLeaveCustomPolicy: true, // Has custom policy
    sickLeavePayType: "partial",
    sickLeavePartialPayPercentage: 75, // 75% paid
    holidays: ["2025-01-01", "2025-07-04", "2025-12-25"],
    lunchBreakMinutes: 30,
    overtimeEnabled: true,
    overtimeRate: 67.5,
    overtimeThreshold: 35,
  },
  {
    id: "user-5",
    name: "David Chen",
    email: "david@company.com",
    role: "Junior Accountant",
    hoursPerWeek: 40,
    hourlyRate: 35,
    billableRate: 100,
    active: true,
    ptoHoursPerYear: 80,
    ptoHoursUsed: 8,
    ptoBalance: 72,
    sickLeaveBalance: 24,
    sickLeaveUsed: 0,
    sickLeaveAccrued: 24,
    sickLeaveHireDate: "2023-11-01",
    sickLeaveCustomPolicy: false,
    holidays: ["2025-01-01", "2025-07-04", "2025-12-25"],
    lunchBreakMinutes: 30,
    overtimeEnabled: true,
    overtimeRate: 52.5,
    overtimeThreshold: 40,
  },
  {
    id: "user-6",
    name: "Alex Rivera",
    email: "alex@contractor.com",
    role: "Tax Consultant",
    hoursPerWeek: 20,
    employmentType: "contractor",
    hourlyRate: 75,
    billableRate: 200,
    active: true,
    sickLeaveHireDate: "2024-08-15",
  },
];

// Default firm settings
const defaultFirmSettings: FirmSettings = {
  // Holiday Policy - Default: Paid holidays at normal rate
  holidaysPaid: true,
  holidayPayRate: 1.0,
  firmHolidays: [
    "2025-01-01", // New Year's Day
    "2025-05-26", // Memorial Day
    "2025-07-04", // Independence Day
    "2025-09-01", // Labor Day
    "2025-11-27", // Thanksgiving
    "2025-12-25", // Christmas
  ],

  // Lunch Break Policy - Default: Unpaid, auto-deduct 30 min
  lunchPaid: false,
  lunchDeductionMethod: "auto",
  lunchDefaultMinutes: 30,
  lunchFlexible: false,

  // PTO Policy - Default: Upfront allocation, 80 hours/year
  ptoType: "upfront",
  ptoAccrualRate: 3.33, // ~80 hours per year / 24 pay periods
  ptoAccrualPeriod: "biweekly",
  ptoAnnualLimit: 80,
  ptoCarryoverAllowed: false,
  ptoMaxCarryover: 40,
  ptoPaid: true,

  // Sick Leave Policy - Default: Combined with PTO
  sickLeaveSeparate: false,
  sickLeaveAccrualMethod: "per-pay-period",
  sickLeaveAccrualRate: 3.33, // Default 3.33 hours per pay period
  sickLeaveAccrualFrequency: "biweekly",
  sickLeaveAnnualLimit: 80,
  sickLeaveAccrualCap: 80,
  sickLeaveWaitingPeriodDays: 0,
  sickLeaveUsageWaitingPeriodDays: 0,
  sickLeaveCarryoverPolicy: "unlimited",
  sickLeaveMaxCarryover: 40,
  sickLeavePayType: "paid",
  sickLeavePartialPayPercentage: 100,
  sickLeaveStateCompliance: "custom",

  // Overtime Policy - Default: Enabled, 40 hrs/week, 1.5x rate
  overtimeEnabled: true,
  overtimeDefaultThreshold: 40,
  overtimeDefaultRate: 1.5,
  overtimeCalculationPeriod: "weekly",

  // Work Week Settings - Default: 40 hours, Mon-Fri
  standardHoursPerWeek: 40,
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
};

export function WorkflowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [workflows, setWorkflows] =
    useState<Workflow[]>(initialWorkflows);
  const [projects, setProjects] =
    useState<Project[]>(initialProjects);
  const [tasks, setTasks] =
    useState<ProjectTask[]>(initialTasks);
  const [activeTimer, setActiveTimer] =
    useState<ActiveTimer | null>(null);
  const [timerEntries, setTimerEntries] = useState<
    TimerEntry[]
  >(initialTimerEntries);
  const [userProfiles, setUserProfiles] = useState<
    UserProfile[]
  >(initialUserProfiles);
  const [firmSettings, setFirmSettings] =
    useState<FirmSettings>(defaultFirmSettings);

  const addWorkflow = (workflow: Workflow) => {
    setWorkflows((prev) => [...prev, workflow]);
  };

  const updateWorkflow = (workflow: Workflow) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflow.id ? workflow : w)),
    );
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.filter((w) => w.id !== workflowId),
    );
    // Also delete all projects using this workflow
    setProjects((prev) =>
      prev.filter((p) => p.workflowId !== workflowId),
    );
  };

  const duplicateWorkflow = (
    workflowId: string,
    customName?: string,
  ) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    if (!workflow) return "";

    // Deep clone the workflow with new IDs
    const newWorkflowId = `workflow-${Date.now()}`;
    const stageIdMap = new Map<string, string>();
    const taskIdMap = new Map<string, string>();

    // Generate new stage IDs
    workflow.stages.forEach((stage) => {
      stageIdMap.set(
        stage.id,
        `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      );
    });

    // Clone stages with new IDs
    const newStages = workflow.stages.map((stage) => {
      const newStageId = stageIdMap.get(stage.id)!;

      // Generate new task IDs and create task ID map
      const newTasks = stage.tasks.map((task) => {
        const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        taskIdMap.set(task.id, newTaskId);
        return { ...task, id: newTaskId };
      });

      // Update task dependencies to use new task IDs
      const updatedTasks = newTasks.map((task) => ({
        ...task,
        dependencies: task.dependencies.map(
          (depId) => taskIdMap.get(depId) || depId,
        ),
        inheritFromTaskId: task.inheritFromTaskId
          ? taskIdMap.get(task.inheritFromTaskId) ||
            task.inheritFromTaskId
          : undefined,
      }));

      // Clone automations with new IDs
      const newAutomations = stage.automations.map(
        (automation) => ({
          ...automation,
          id: `automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          triggerTaskId: automation.triggerTaskId
            ? taskIdMap.get(automation.triggerTaskId) ||
              automation.triggerTaskId
            : undefined,
        }),
      );

      return {
        ...stage,
        id: newStageId,
        tasks: updatedTasks,
        automations: newAutomations,
      };
    });

    const duplicatedWorkflow: Workflow = {
      ...workflow,
      id: newWorkflowId,
      name: customName || `${workflow.name} (Copy)`,
      stages: newStages,
    };

    setWorkflows((prev) => [...prev, duplicatedWorkflow]);
    return newWorkflowId;
  };

  const getWorkflow = (workflowId: string) => {
    return workflows.find((w) => w.id === workflowId);
  };

  const addProject = (
    project: Omit<Project, "id" | "createdAt">,
  ) => {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (project: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? project : p)),
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) =>
      prev.filter((p) => p.id !== projectId),
    );
  };

  const getProjectsByWorkflow = (workflowId: string) => {
    return projects.filter((p) => p.workflowId === workflowId);
  };

  const moveProject = (
    projectId: string,
    newStageId: string,
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, currentStageId: newStageId }
          : p,
      ),
    );
  };

  // Task management functions
  const addTask = (
    task: Omit<ProjectTask, "id" | "createdAt">,
  ) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (task: ProjectTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? task : t)),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId);
  };

  const getTasksByWorkflow = (workflowId: string) => {
    return tasks.filter((t) => t.workflowId === workflowId);
  };

  const getTasksByAssignee = (assignee: string) => {
    return tasks.filter((t) => t.assignee === assignee);
  };

  const getTaskCounts = (workflowId: string) => {
    const workflowTasks = tasks.filter(
      (t) =>
        t.workflowId === workflowId && t.status !== "completed",
    );
    const total = workflowTasks.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    let overdue = 0;
    let dueSoon = 0;

    workflowTasks.forEach((task) => {
      const dueDate = new Date(task.dueDate);
      if (dueDate < today) {
        overdue++;
      } else if (dueDate <= threeDaysFromNow) {
        dueSoon++;
      }
    });

    return { total, overdue, dueSoon };
  };

  // Timer management functions
  const startTimer = (taskId: string, projectId: string) => {
    if (activeTimer) {
      stopTimer();
    }
    setActiveTimer({
      taskId,
      projectId,
      startTime: Date.now(),
      isPaused: false,
    });
  };

  const stopTimer = () => {
    if (!activeTimer) return 0;

    const endTime = Date.now();
    const totalElapsed = endTime - activeTimer.startTime;
    let totalPausedTime = activeTimer.pausedTime || 0;

    // If currently paused, add the current pause duration
    if (activeTimer.isPaused && activeTimer.lastPauseStart) {
      totalPausedTime += endTime - activeTimer.lastPauseStart;
    }

    const durationInSeconds = Math.floor(
      (totalElapsed - totalPausedTime) / 1000,
    );

    // Save timer entry
    const newEntry: TimerEntry = {
      id: `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      startTime: activeTimer.startTime,
      endTime,
      duration: durationInSeconds,
    };
    setTimerEntries((prev) => [...prev, newEntry]);

    // Update task with accumulated time
    const task = tasks.find((t) => t.id === activeTimer.taskId);
    if (task) {
      const updatedTask = {
        ...task,
        timeTracked:
          (task.timeTracked || 0) + durationInSeconds,
      };
      updateTask(updatedTask);
    }

    setActiveTimer(null);
    return durationInSeconds;
  };

  const pauseTimer = () => {
    if (!activeTimer || activeTimer.isPaused) return;

    const pauseStart = Date.now();

    setActiveTimer({
      ...activeTimer,
      isPaused: true,
      lastPauseStart: pauseStart,
    });
  };

  const resumeTimer = () => {
    if (
      !activeTimer ||
      !activeTimer.isPaused ||
      !activeTimer.lastPauseStart
    )
      return;

    const resumeStart = Date.now();
    const pauseDuration =
      resumeStart - activeTimer.lastPauseStart;
    const newPausedTime =
      (activeTimer.pausedTime || 0) + pauseDuration;

    setActiveTimer({
      ...activeTimer,
      isPaused: false,
      pausedTime: newPausedTime,
      lastPauseStart: undefined,
    });
  };

  const updateTimerTask = (projectId: string) => {
    if (!activeTimer) return;

    const newEntry: TimerEntry = {
      id: `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: activeTimer.taskId,
      projectId,
      startTime: activeTimer.startTime,
      endTime: Date.now(),
      duration: Math.floor(
        (Date.now() - activeTimer.startTime) / 1000,
      ),
    };
    setTimerEntries((prev) => [...prev, newEntry]);

    // Update task with accumulated time
    const task = tasks.find((t) => t.id === activeTimer.taskId);
    if (task) {
      const updatedTask = {
        ...task,
        timeTracked:
          (task.timeTracked || 0) + newEntry.duration!,
      };
      updateTask(updatedTask);
    }

    setActiveTimer({
      ...activeTimer,
      projectId,
    });
  };

  const getTimerElapsed = () => {
    if (!activeTimer) return 0;

    const elapsed = Date.now() - activeTimer.startTime;
    let totalPausedTime = activeTimer.pausedTime || 0;

    // If currently paused, add the current pause duration
    if (activeTimer.isPaused && activeTimer.lastPauseStart) {
      totalPausedTime +=
        Date.now() - activeTimer.lastPauseStart;
    }

    return Math.max(0, elapsed - totalPausedTime);
  };

  const getTimerEntriesByTask = (taskId: string) => {
    return timerEntries.filter(
      (entry) => entry.taskId === taskId,
    );
  };

  const getTimerEntriesByProject = (projectId: string) => {
    return timerEntries.filter(
      (entry) => entry.projectId === projectId,
    );
  };

  const getAllTimerEntries = () => {
    return timerEntries;
  };

  const updateTimerEntry = (entry: TimerEntry) => {
    setTimerEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? entry : e)),
    );
  };

  const updateTimerEntryProject = (
    entryId: string,
    projectId: string,
  ) => {
    setTimerEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, projectId } : e,
      ),
    );
  };

  const updateUserProfiles = (profiles: UserProfile[]) => {
    setUserProfiles(profiles);
  };

  const updateFirmSettings = (settings: FirmSettings) => {
    setFirmSettings(settings);
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        projects,
        tasks,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
        duplicateWorkflow,
        getWorkflow,
        addProject,
        updateProject,
        deleteProject,
        getProjectsByWorkflow,
        moveProject,
        addTask,
        updateTask,
        deleteTask,
        getTasksByProject,
        getTasksByWorkflow,
        getTasksByAssignee,
        getTaskCounts,
        activeTimer,
        timerEntries,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        updateTimerTask,
        getTimerElapsed,
        getTimerEntriesByTask,
        getTimerEntriesByProject,
        getAllTimerEntries,
        updateTimerEntry,
        updateTimerEntryProject,
        userProfiles,
        updateUserProfiles,
        firmSettings,
        updateFirmSettings,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error(
      "useWorkflowContext must be used within WorkflowProvider",
    );
  }
  return context;
}