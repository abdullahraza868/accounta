import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import {
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Mail,
  Clock,
  User,
  AlertCircle,
  Filter,
  Download,
  Search,
  Calendar,
  Settings,
  FileText,
  Users,
  TrendingUp,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  timestamp: Date;
  type:
    | "automation"
    | "task_completed"
    | "task_created"
    | "stage_moved"
    | "document_signed"
    | "email_sent"
    | "assignment"
    | "organizer_submitted"
    | "meeting_scheduled"
    | "deadline_warning";
  clientName: string;
  clientId: string;
  workflowName: string;
  stageName?: string;
  taskName?: string;
  automationName?: string;
  userName?: string;
  details: string;
  metadata?: {
    fromStage?: string;
    toStage?: string;
    documentType?: string;
    emailSubject?: string;
    emailBody?: string;
    emailTo?: string;
    emailCc?: string;
    emailBcc?: string;
    assignedTo?: string;
    daysOverdue?: number;
    triggerType?: string;
    triggerCondition?: string;
    actionsTaken?: string[];
    completionNotes?: string;
    timeSpent?: string;
    movedBy?: string;
    moveReason?: string;
    signerName?: string;
    signerEmail?: string;
    ipAddress?: string;
    organizerFields?: { field: string; value: string }[];
    meetingDate?: string;
    meetingTime?: string;
    meetingAttendees?: string[];
    meetingAgenda?: string;
    deadlineDate?: string;
    affectedTasks?: string[];
    assignmentContext?: string;
    taskPriority?: string;
    taskDueDate?: string;
  };
}

interface ActivityLogProps {
  workflowId?: string; // If provided, filter to specific workflow
  clientId?: string; // If provided, filter to specific client
  compact?: boolean; // Compact view for embedding
  onBack?: () => void; // Back button callback
}

export function ActivityLog({
  workflowId,
  clientId,
  compact = false,
  onBack,
}: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] =
    useState<string>("7days");
  const [selectedClient, setSelectedClient] =
    useState<string>("all");
  const [expandedActivityId, setExpandedActivityId] = useState<
    string | null
  >(null);

  // Mock data - in production this would come from your backend
  const mockActivities: ActivityEvent[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "automation",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Monthly Bookkeeping",
      stageName: "Document Collection",
      automationName: "Send reminder email after 3 days",
      details:
        "Automation triggered: Sent reminder email to client",
      metadata: {
        emailSubject:
          "Reminder: Please upload September bank statements",
        emailBody:
          "Hi there,\n\nThis is a friendly reminder that we're still waiting for your September bank statements to complete your monthly bookkeeping.\n\nPlease upload the following:\n• Checking account statement\n• Savings account statement\n• Credit card statements\n\nYou can upload these documents directly through your client portal.\n\nThanks!\nYour Accounting Team",
        emailTo: "john@acmecorp.com",
        triggerType: "Time-based",
        triggerCondition: "Client in stage for 3+ days",
        actionsTaken: [
          "Sent reminder email to client",
          "Created follow-up task for team",
          'Updated client status to "Pending Documents"',
        ],
      },
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "task_completed",
      clientName: "TechStart LLC",
      clientId: "client-2",
      workflowName: "Tax Return Prep",
      stageName: "Review & Quality Check",
      taskName: "Partner review",
      userName: "Sarah Johnson",
      details: "Task completed by Sarah Johnson",
      metadata: {
        completionNotes:
          "Reviewed all tax calculations and supporting documentation. Everything looks good. Approved for filing. Client has significant R&D credits this year that should result in a refund.",
        timeSpent: "2h 15m",
      },
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: "stage_moved",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Monthly Bookkeeping",
      details: "Client moved from Data Entry to Review stage",
      metadata: {
        fromStage: "Data Entry",
        toStage: "Review & Quality Check",
        movedBy: "Mike Chen",
        moveReason:
          "All transactions categorized and reconciled. Ready for partner review.",
      },
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "document_signed",
      clientName: "Global Industries",
      clientId: "client-3",
      workflowName: "Lead to Client Onboarding",
      stageName: "Engagement",
      details: "Client signed engagement letter",
      metadata: {
        documentType: "Engagement Letter",
        signerName: "Jennifer Martinez",
        signerEmail: "jmartinez@globalindustries.com",
        ipAddress: "192.168.1.100",
      },
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      type: "automation",
      clientName: "TechStart LLC",
      clientId: "client-2",
      workflowName: "Tax Return Prep",
      stageName: "Review & Quality Check",
      automationName:
        "Auto-complete optional tasks after 3 days",
      taskName: "Optional partner review",
      details:
        'Automation triggered: Auto-completed task "Optional partner review"',
    },
    {
      id: "6",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: "organizer_submitted",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Tax Return Prep",
      stageName: "Document Collection",
      details: "Client submitted Personal Tax Organizer",
      metadata: {
        documentType: "Personal Tax Organizer",
        organizerFields: [
          { field: "Income - W2", value: "$125,000" },
          { field: "Income - 1099", value: "$15,000" },
          { field: "Mortgage Interest", value: "$18,500" },
          { field: "Property Tax", value: "$8,200" },
          { field: "Charitable Donations", value: "$5,000" },
          { field: "Dependents", value: "2" },
        ],
      },
    },
    {
      id: "7",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      type: "meeting_scheduled",
      clientName: "Global Industries",
      clientId: "client-3",
      workflowName: "Tax Return Prep",
      stageName: "Planning",
      details:
        "Client scheduled Tax Review Meeting for Nov 15, 2025",
    },
    {
      id: "8",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: "deadline_warning",
      clientName: "TechStart LLC",
      clientId: "client-2",
      workflowName: "Tax Return Prep",
      stageName: "Filing & Delivery",
      taskName: "Submit tax return",
      details: "Task is 2 days overdue",
      metadata: {
        daysOverdue: 2,
      },
    },
    {
      id: "9",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      type: "email_sent",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Monthly Bookkeeping",
      stageName: "Document Collection",
      details: "Sent email: Monthly bookkeeping checklist",
      metadata: {
        emailSubject:
          "Monthly bookkeeping checklist for September",
        emailBody:
          "Hello,\n\nHere's your monthly bookkeeping checklist for September:\n\n✓ Bank statements (checking and savings)\n✓ Credit card statements\n✓ Receipts for business expenses\n✓ Payroll records\n✓ Sales records and invoices\n\nPlease upload these documents by the end of the week so we can complete your books on schedule.\n\nLet us know if you have any questions!\n\nBest regards,\nAccounting Team",
        emailTo: "john@acmecorp.com",
        emailCc: "finance@acmecorp.com",
      },
    },
    {
      id: "10",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      type: "assignment",
      clientName: "Global Industries",
      clientId: "client-3",
      workflowName: "Monthly Bookkeeping",
      stageName: "Data Entry",
      taskName: "Categorize transactions",
      userName: "Mike Chen",
      details: "Task assigned to Mike Chen",
      metadata: {
        assignedTo: "Mike Chen",
        taskPriority: "High",
        taskDueDate: "November 10, 2025",
        assignmentContext:
          "Large volume of transactions this month - approximately 250 transactions to categorize. Client recently changed their accounting software, so extra attention needed for proper mapping.",
      },
    },
    {
      id: "11",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "task_created",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Monthly Bookkeeping",
      stageName: "Document Collection",
      taskName: "Request Q3 financial statements",
      userName: "Sarah Johnson",
      details: "New task created for document collection",
    },
    {
      id: "12",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      type: "email_sent",
      clientName: "TechStart LLC",
      clientId: "client-2",
      workflowName: "Tax Return Prep",
      stageName: "Review & Quality Check",
      details: "Sent email: Tax return ready for review",
      metadata: {
        emailSubject:
          "Your 2024 Tax Return is Ready for Review",
        emailBody:
          "Dear Client,\\n\\nWe have completed the preparation of your 2024 tax return and it is now ready for your review.\\n\\nPlease review the attached draft and let us know if you have any questions or need any changes.\\n\\nBest regards,\\nTax Team",
        emailTo: "admin@techstart.com",
      },
    },
    {
      id: "13",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      type: "stage_moved",
      clientName: "Global Industries",
      clientId: "client-3",
      workflowName: "Lead to Client Onboarding",
      details:
        "Client moved from Engagement to Document Collection",
      metadata: {
        fromStage: "Engagement",
        toStage: "Document Collection",
        movedBy: "Sarah Johnson",
        moveReason:
          "Engagement letter signed. Moving to collect initial documentation.",
      },
    },
    {
      id: "14",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      type: "automation",
      clientName: "Acme Corp",
      clientId: "client-1",
      workflowName: "Monthly Bookkeeping",
      stageName: "Document Collection",
      automationName: "Welcome email sequence",
      details:
        "Automation triggered: Sent welcome email to new client",
      metadata: {
        emailSubject: "Welcome to Our Bookkeeping Services!",
        emailBody:
          "Welcome! We're excited to work with you on your monthly bookkeeping needs. Here's what to expect...",
        emailTo: "john@acmecorp.com",
        triggerType: "Client Stage Entry",
        triggerCondition:
          "Client enters Document Collection stage",
        actionsTaken: [
          "Sent welcome email",
          "Created initial task list",
          "Assigned primary bookkeeper",
        ],
      },
    },
    {
      id: "15",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
      type: "task_completed",
      clientName: "TechStart LLC",
      clientId: "client-2",
      workflowName: "Tax Return Prep",
      stageName: "Data Entry",
      taskName: "Input all W2 and 1099 forms",
      userName: "Mike Chen",
      details: "Task completed by Mike Chen",
      metadata: {
        completionNotes:
          "All income forms entered and verified against client-provided documents. Ready for deduction entry.",
        timeSpent: "1h 30m",
      },
    },
  ];

  // Filter activities
  const filteredActivities = mockActivities.filter(
    (activity) => {
      // Filter by workflow if provided
      if (workflowId && activity.workflowName !== workflowId)
        return false;

      // Filter by client if provided
      if (clientId && activity.clientId !== clientId)
        return false;

      // Filter by type
      if (filterType !== "all" && activity.type !== filterType)
        return false;

      // Filter by selected client
      if (
        selectedClient !== "all" &&
        activity.clientId !== selectedClient
      )
        return false;

      // Filter by date range
      const now = Date.now();
      const activityTime = activity.timestamp.getTime();
      const dayInMs = 1000 * 60 * 60 * 24;

      if (
        filterDateRange === "today" &&
        now - activityTime > dayInMs
      )
        return false;
      if (
        filterDateRange === "7days" &&
        now - activityTime > dayInMs * 7
      )
        return false;
      if (
        filterDateRange === "30days" &&
        now - activityTime > dayInMs * 30
      )
        return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.clientName.toLowerCase().includes(query) ||
          activity.workflowName.toLowerCase().includes(query) ||
          activity.details.toLowerCase().includes(query) ||
          activity.taskName?.toLowerCase().includes(query) ||
          activity.automationName?.toLowerCase().includes(query)
        );
      }

      return true;
    },
  );

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "automation":
        return <Zap className="w-4 h-4 text-violet-600" />;
      case "task_completed":
        return (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        );
      case "task_created":
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case "stage_moved":
        return (
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        );
      case "document_signed":
        return (
          <FileText className="w-4 h-4 text-emerald-600" />
        );
      case "email_sent":
        return <Mail className="w-4 h-4 text-sky-600" />;
      case "assignment":
        return <User className="w-4 h-4 text-amber-600" />;
      case "organizer_submitted":
        return <FileCheck className="w-4 h-4 text-teal-600" />;
      case "meeting_scheduled":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case "deadline_warning":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventBadgeColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "automation":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "task_completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "task_created":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "stage_moved":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "document_signed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "email_sent":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "assignment":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "organizer_submitted":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "meeting_scheduled":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "deadline_warning":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatEventType = (type: ActivityEvent["type"]) => {
    return type
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = Date.now();
    const diff = now - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const exportActivities = () => {
    // In production, this would generate a CSV/PDF export
    console.log("Exporting activities...", filteredActivities);
  };

  const handleActivityClick = (activityId: string) => {
    setExpandedActivityId(
      expandedActivityId === activityId ? null : activityId,
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In production, you'd show a toast notification
    console.log("Copied to clipboard");
  };

  // Get unique clients for filter
  const uniqueClients = Array.from(
    new Set(mockActivities.map((a) => a.clientName)),
  );

  const renderDetailView = (activity: ActivityEvent) => {
    return (
      <div className="space-y-6">
        {/* Type-specific content */}
        {activity.metadata && (
          <>
            {/* Email Details */}
            {activity.type === "email_sent" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-slate-700">
                    Email Content
                  </h4>
                  {activity.metadata.emailBody && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          activity.metadata.emailBody!,
                        )
                      }
                      className="gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {activity.metadata.emailTo && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        To
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.emailTo}
                      </p>
                    </div>
                  )}
                  {activity.metadata.emailCc && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        CC
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.emailCc}
                      </p>
                    </div>
                  )}
                  {activity.metadata.emailBcc && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        BCC
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.emailBcc}
                      </p>
                    </div>
                  )}
                  {activity.metadata.emailSubject && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Subject
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.emailSubject}
                      </p>
                    </div>
                  )}
                  {activity.metadata.emailBody && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Message
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {activity.metadata.emailBody}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Automation Details */}
            {activity.type === "automation" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Automation Details
                </h4>

                <div className="space-y-3 text-sm">
                  {activity.metadata.triggerType && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Trigger Type
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.triggerType}
                      </p>
                    </div>
                  )}
                  {activity.metadata.triggerCondition && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Trigger Condition
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.triggerCondition}
                      </p>
                    </div>
                  )}
                  {activity.metadata.actionsTaken &&
                    activity.metadata.actionsTaken.length >
                      0 && (
                      <div>
                        <Label className="text-xs text-slate-500">
                          Actions Taken
                        </Label>
                        <ul className="mt-1 space-y-1">
                          {activity.metadata.actionsTaken.map(
                            (action, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">
                                  {action}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  {activity.metadata.emailSubject && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Email Sent
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.emailSubject}
                      </p>
                    </div>
                  )}
                  {activity.metadata.emailBody && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Email Content
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {activity.metadata.emailBody}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Task Completion Details */}
            {activity.type === "task_completed" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Completion Details
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.timeSpent && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Time Spent
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.timeSpent}
                      </p>
                    </div>
                  )}
                  {activity.metadata.completionNotes && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Completion Notes
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700">
                          {activity.metadata.completionNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage Movement Details */}
            {activity.type === "stage_moved" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Stage Movement
                </h4>

                <div className="space-y-3 text-sm">
                  {activity.metadata.fromStage &&
                    activity.metadata.toStage && (
                      <div>
                        <Label className="text-xs text-slate-500">
                          Movement
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-slate-100"
                          >
                            {activity.metadata.fromStage}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-700 border-blue-200"
                          >
                            {activity.metadata.toStage}
                          </Badge>
                        </div>
                      </div>
                    )}
                  {activity.metadata.movedBy && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Moved By
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.movedBy}
                      </p>
                    </div>
                  )}
                  {activity.metadata.moveReason && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Reason
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700">
                          {activity.metadata.moveReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Signing Details */}
            {activity.type === "document_signed" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Signature Details
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.documentType && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Document
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.documentType}
                      </p>
                    </div>
                  )}
                  {activity.metadata.signerName && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Signer Name
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.signerName}
                      </p>
                    </div>
                  )}
                  {activity.metadata.signerEmail && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Signer Email
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.signerEmail}
                      </p>
                    </div>
                  )}
                  {activity.metadata.ipAddress && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        IP Address
                      </Label>
                      <p className="text-slate-900 mt-0.5 font-mono text-xs">
                        {activity.metadata.ipAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Organizer Submission Details */}
            {activity.type === "organizer_submitted" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Organizer Information
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.documentType && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Document Type
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.documentType}
                      </p>
                    </div>
                  )}
                  {activity.metadata.organizerFields &&
                    activity.metadata.organizerFields.length >
                      0 && (
                      <div>
                        <Label className="text-xs text-slate-500">
                          Submitted Fields
                        </Label>
                        <div className="mt-1 space-y-1.5">
                          {activity.metadata.organizerFields.map(
                            (field, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded"
                              >
                                <span className="text-slate-600">
                                  {field.field}
                                </span>
                                <span className="text-slate-900">
                                  {field.value}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Meeting Details */}
            {activity.type === "meeting_scheduled" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Meeting Information
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.meetingDate && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Date
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.meetingDate}
                      </p>
                    </div>
                  )}
                  {activity.metadata.meetingTime && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Time
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.meetingTime}
                      </p>
                    </div>
                  )}
                  {activity.metadata.meetingAttendees &&
                    activity.metadata.meetingAttendees.length >
                      0 && (
                      <div>
                        <Label className="text-xs text-slate-500">
                          Attendees
                        </Label>
                        <ul className="mt-1 space-y-1">
                          {activity.metadata.meetingAttendees.map(
                            (attendee, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-700">
                                  {attendee}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  {activity.metadata.meetingAgenda && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Agenda
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700">
                          {activity.metadata.meetingAgenda}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deadline Warning Details */}
            {activity.type === "deadline_warning" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Deadline Information
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.daysOverdue && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Days Overdue
                      </Label>
                      <p className="text-red-600 mt-0.5">
                        {activity.metadata.daysOverdue} days
                      </p>
                    </div>
                  )}
                  {activity.metadata.deadlineDate && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Original Deadline
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.deadlineDate}
                      </p>
                    </div>
                  )}
                  {activity.metadata.affectedTasks &&
                    activity.metadata.affectedTasks.length >
                      0 && (
                      <div>
                        <Label className="text-xs text-slate-500">
                          Affected Tasks
                        </Label>
                        <ul className="mt-1 space-y-1">
                          {activity.metadata.affectedTasks.map(
                            (task, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-slate-700">
                                  {task}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Assignment Details */}
            {activity.type === "assignment" && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-700">
                  Assignment Details
                </h4>

                <div className="space-y-2 text-sm">
                  {activity.metadata.assignedTo && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Assigned To
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.assignedTo}
                      </p>
                    </div>
                  )}
                  {activity.metadata.taskPriority && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Priority
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.taskPriority}
                      </p>
                    </div>
                  )}
                  {activity.metadata.taskDueDate && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Due Date
                      </Label>
                      <p className="text-slate-900 mt-0.5">
                        {activity.metadata.taskDueDate}
                      </p>
                    </div>
                  )}
                  {activity.metadata.assignmentContext && (
                    <div>
                      <Label className="text-xs text-slate-500">
                        Context
                      </Label>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-slate-700">
                          {activity.metadata.assignmentContext}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Activity summary stats
  const stats = {
    total: filteredActivities.length,
    automations: filteredActivities.filter(
      (a) => a.type === "automation",
    ).length,
    tasksCompleted: filteredActivities.filter(
      (a) => a.type === "task_completed",
    ).length,
    stageMovements: filteredActivities.filter(
      (a) => a.type === "stage_moved",
    ).length,
  };

  const renderActivityFeed = () => (
    <div className="space-y-3">
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No activities found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        filteredActivities.map((activity, index) => {
          const isExpanded = expandedActivityId === activity.id;
          return (
            <div key={activity.id}>
              <Card className="overflow-hidden transition-shadow">
                {/* Activity Header - Clickable */}
                <div
                  className="p-4 hover:bg-slate-50 cursor-pointer"
                  onClick={() =>
                    handleActivityClick(activity.id)
                  }
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {getEventIcon(activity.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900">
                            {activity.clientName}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getEventBadgeColor(activity.type)}`}
                          >
                            {formatEventType(activity.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatTimestamp(
                              activity.timestamp,
                            )}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-2">
                        {activity.details}
                      </p>

                      {/* Metadata badges */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge
                          variant="outline"
                          className="bg-slate-50"
                        >
                          {activity.workflowName}
                        </Badge>
                        {activity.stageName && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {activity.stageName}
                          </Badge>
                        )}
                        {activity.taskName && (
                          <span className="text-slate-500">
                            → {activity.taskName}
                          </span>
                        )}
                        {activity.automationName && (
                          <span className="text-violet-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {activity.automationName}
                          </span>
                        )}
                        {activity.userName && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.userName}
                          </span>
                        )}
                      </div>

                      {/* Additional metadata */}
                      {activity.metadata && !isExpanded && (
                        <div className="mt-2 text-xs text-slate-500">
                          {activity.metadata.fromStage &&
                            activity.metadata.toStage && (
                              <span>
                                Moved:{" "}
                                {activity.metadata.fromStage} →{" "}
                                {activity.metadata.toStage}
                              </span>
                            )}
                          {activity.metadata.emailSubject && (
                            <span>
                              Subject: "
                              {activity.metadata.emailSubject}"
                            </span>
                          )}
                          {activity.metadata.documentType && (
                            <span>
                              Document:{" "}
                              {activity.metadata.documentType}
                            </span>
                          )}
                          {activity.metadata.daysOverdue && (
                            <span className="text-red-600">
                              {activity.metadata.daysOverdue}{" "}
                              days overdue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail View - Shows below when clicked */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-6">
                    {renderDetailView(activity)}
                  </div>
                )}
              </Card>

              {/* Timeline connector - don't show on last item */}
              {index < filteredActivities.length - 1 && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  if (compact) {
    // Compact view for embedding in other components
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-600" />
            <h4 className="text-slate-900">Recent Activity</h4>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>Activity Log</SheetTitle>
                <SheetDescription>
                  View all workflow activities and automations
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ActivityLog
                  workflowId={workflowId}
                  clientId={clientId}
                  compact={false}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <ScrollArea className="flex-1">
          {renderActivityFeed()}
        </ScrollArea>
      </div>
    );
  }

  // Full view
  return (
    <div className="flex flex-col h-screen space-y-6 pb-6">
      {/* Back button */}
      {onBack && (
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}

      {/* Header with stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Events
              </p>
              <p className="text-2xl text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Automations Fired
              </p>
              <p className="text-2xl text-violet-600 mt-1">
                {stats.automations}
              </p>
            </div>
            <Zap className="w-8 h-8 text-violet-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Tasks Completed
              </p>
              <p className="text-2xl text-green-600 mt-1">
                {stats.tasksCompleted}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Stage Movements
              </p>
              <p className="text-2xl text-indigo-600 mt-1">
                {stats.stageMovements}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 flex-shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <Label>Filters</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">
                Search
              </Label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Client, task, workflow..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">
                Event Type
              </Label>
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="automation">
                    Automations
                  </SelectItem>
                  <SelectItem value="task_completed">
                    Task Completed
                  </SelectItem>
                  <SelectItem value="stage_moved">
                    Stage Moved
                  </SelectItem>
                  <SelectItem value="document_signed">
                    Document Signed
                  </SelectItem>
                  <SelectItem value="email_sent">
                    Email Sent
                  </SelectItem>
                  <SelectItem value="assignment">
                    Assignments
                  </SelectItem>
                  <SelectItem value="organizer_submitted">
                    Organizer Submitted
                  </SelectItem>
                  <SelectItem value="meeting_scheduled">
                    Meeting Scheduled
                  </SelectItem>
                  <SelectItem value="deadline_warning">
                    Deadline Warnings
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            {!clientId && (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">
                  Client
                </Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Clients
                    </SelectItem>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">
                Time Period
              </Label>
              <Select
                value={filterDateRange}
                onValueChange={setFilterDateRange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">
                    Last 7 Days
                  </SelectItem>
                  <SelectItem value="30days">
                    Last 30 Days
                  </SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Activities
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="p-6 flex-1 flex flex-col min-h-0">
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-slate-900">Activity Feed</h3>
            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredActivities.length}{" "}
              {filteredActivities.length === 1
                ? "event"
                : "events"}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {renderActivityFeed()}
        </ScrollArea>
      </Card>
    </div>
  );
}