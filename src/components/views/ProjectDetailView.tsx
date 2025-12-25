import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  Mail,
  Send,
  FileText,
  DollarSign,
  Star,
  User,
  ListTodo,
  Zap,
  Plus,
  EyeOff,
  Pencil,
  Trash2,
  File,
  Check,
  X,
  MoreVertical,
  Download,
  Upload,
  Search,
} from "lucide-react";
import { ActivityLog } from "../ActivityLog";
import { TimeTracker } from "../TimeTracker";
import { EmailTemplateSelector } from "../EmailTemplateSelector";
import { Separator } from "../ui/separator";

interface ProjectDetailsPageProps {
  project: {
    id: string;
    name: string;
    template: string;
    assignees: string[];
    progress: number;
    tasks: { total: number; completed: number };
    dueDate: string;
    comments: number;
    attachments: number;
  };
  onBack: () => void;
  onViewActivityLog: () => void;
}

export function ProjectDetailPage({
  project,
  onBack,
  onViewActivityLog,
}: ProjectDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Lead person state
  const [leadPerson, setLeadPerson] = useState("Sarah Miller");

  // Action items state
  const [actionItems, setActionItems] = useState([
    {
      id: "1",
      text: "Upload Q3 Financial Statements",
      completed: false,
      dueDate: "11/4/2024",
      completedAt: null,
    },
    {
      id: "2",
      text: "Review and sign tax forms",
      completed: false,
      dueDate: "11/19/2024",
      completedAt: null,
    },
    {
      id: "3",
      text: "Submit payroll information",
      completed: true,
      dueDate: "10/24/2024",
      completedAt: "2024-10-24 03:30 PM",
    },
    {
      id: "4",
      text: "Update business address",
      completed: false,
      dueDate: "11/29/2024",
      completedAt: null,
    },
  ]);
  const [newActionItem, setNewActionItem] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([
    {
      id: "1",
      client: "Abacus 360",
      owner: "Client",
      document: "W9B_Misc_2024.pdf",
      type: "W9B-MISC",
      year: 2024,
      received: "10/15/2024 11:02 AM",
      method: "Email",
      status: "Approved",
    },
    {
      id: "2",
      client: "Abacus 360",
      owner: "Client",
      document: "Quarterly_Tax_Return_Q3.pdf",
      type: "Tax Return",
      year: 2024,
      received: "10/13/2024 08:20 AM",
      method: "Email",
      status: "Approved",
    },
    {
      id: "3",
      client: "Abacus 360",
      owner: "Spouse",
      document: "Bank_Statement_October.pdf",
      type: "Bank Statement",
      year: 2024,
      received: "10/14/2024 02:30 PM",
      method: "Upload",
      status: "Approved",
    },
    {
      id: "4",
      client: "Abacus 360",
      owner: "Client",
      document: "Payroll_Summary_Oct.xlsx",
      type: "Payroll",
      year: 2024,
      received: "10/16/2024 05:44 PM",
      method: "Email",
      status: "Rejected",
    },
    {
      id: "5",
      client: "Abacus 360",
      owner: "Spouse",
      document: "Receipt_Office_Supplies.pdf",
      type: "Receipt",
      year: 2024,
      received: "10/16/2024 10:15 AM",
      method: "Text Message",
      status: "Approved",
    },
    {
      id: "6",
      client: "Abacus 360",
      owner: "Client",
      document: "Invoice_Client_Services_Oct.pdf",
      type: "Invoice",
      year: 2024,
      received: "10/17/2024 03:00 PM",
      method: "Email",
      status: "Approved",
    },
  ]);

  // Master list for next year
  const [masterList, setMasterList] = useState([
    {
      id: "1",
      category: "Tax Documents",
      required: true,
      items: [
        "W2 Forms",
        "1099 Forms",
        "W9B-MISC",
        "1098 Forms",
      ],
    },
    {
      id: "2",
      category: "Financial Statements",
      required: true,
      items: [
        "Bank Statements (All Accounts)",
        "Credit Card Statements",
        "Investment Statements",
      ],
    },
    {
      id: "3",
      category: "Business Documents",
      required: false,
      items: [
        "Business Invoices",
        "Business Receipts",
        "Payroll Summaries",
        "Quarterly Tax Returns",
      ],
    },
    {
      id: "4",
      category: "Personal Documents",
      required: false,
      items: [
        "Mortgage Statements",
        "Property Tax Bills",
        "Insurance Documents",
        "Medical Expenses",
      ],
    },
    {
      id: "5",
      category: "Deductions & Credits",
      required: false,
      items: [
        "Charitable Contributions",
        "Education Expenses",
        "Childcare Expenses",
        "Home Office Expenses",
      ],
    },
  ]);

  const [documentsView, setDocumentsView] = useState<
    "current" | "master"
  >("current");

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.document
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doc.type
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesYear =
      yearFilter === "all" ||
      doc.year.toString() === yearFilter;
    const matchesOwner =
      ownerFilter === "all" || doc.owner === ownerFilter;
    return matchesSearch && matchesYear && matchesOwner;
  });

  const getMethodBadgeStyle = (method: string) => {
    switch (method) {
      case "Email":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Text Message":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Upload":
        return "bg-violet-100 text-violet-700 hover:bg-violet-100";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "Approved" ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  };

  // Notes with comments system
  const [noteComments, setNoteComments] = useState([
    {
      id: "1",
      author: "John Doe",
      text: "Great progress on the design phase!",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      author: "Sarah Miller",
      text: "Client has requested some color changes",
      timestamp: "5 hours ago",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [notes, setNotes] = useState(`# Project Notes

## Client Requirements
- Modern design with clean aesthetic
- Mobile-first approach
- Fast loading times

## Next Steps
- Complete design mockups
- Client review scheduled for Nov 10
- Prepare presentation materials

## Important Points
- Client prefers violet color scheme
- Must integrate with existing systems
- Budget approved for additional features`);

  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Current stage tasks and automations from workflow
  const currentStageData = {
    stageName: "Design",
    stageColor: "violet",
    tasks: [
      {
        id: "t1",
        name: "Create wireframes",
        status: "completed",
        assignee: "JD",
        isAutomation: false,
      },
      {
        id: "t2",
        name: "Design mockups",
        status: "in-progress",
        assignee: "SM",
        isAutomation: false,
      },
      {
        id: "t3",
        name: "Client review",
        status: "pending",
        assignee: "AS",
        isAutomation: false,
      },
    ],
    automations: [
      {
        id: "a1",
        name: "Send email when stage entered",
        status: "completed",
        trigger: "Stage Entered",
      },
      {
        id: "a2",
        name: "Create calendar event for review",
        status: "pending",
        trigger: "Task Completion",
      },
    ],
  };

  const saveNotes = () => {
    setIsSavingNotes(true);
    setTimeout(() => {
      setIsSavingNotes(false);
      alert("Notes saved successfully!");
    }, 500);
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      setActionItems([
        ...actionItems,
        {
          id: Date.now().toString(),
          text: newActionItem,
          completed: false,
          dueDate: formattedDate,
          completedAt: null,
        },
      ]);
      setNewActionItem("");
    }
  };

  const toggleActionItem = (id: string) => {
    setActionItems(
      actionItems.map((item) => {
        if (item.id === id) {
          const now = new Date();
          const completedAt = !item.completed
            ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`
            : null;
          return {
            ...item,
            completed: !item.completed,
            completedAt,
          };
        }
        return item;
      }),
    );
  };

  const deleteActionItem = (id: string) => {
    setActionItems(
      actionItems.filter((item) => item.id !== id),
    );
  };

  const filteredActionItems = hideCompleted
    ? actionItems.filter((item) => !item.completed)
    : actionItems;

  const addNoteComment = () => {
    if (newComment.trim()) {
      setNoteComments([
        {
          id: Date.now().toString(),
          author: "Current User",
          text: newComment,
          timestamp: "Just now",
        },
        ...noteComments,
      ]);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-slate-900">{project.name}</h1>
            <p className="text-slate-500 mt-1">
              {project.template}
            </p>
            {/* Account Manager */}
            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg inline-flex">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <span className="text-amber-700 font-medium">
                  Account Manager:
                </span>{" "}
                {leadPerson}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onViewActivityLog}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Full Activity Log
          </Button>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Mail className="w-4 h-4" />
            Send Update
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Progress</p>
              <p className="text-2xl mt-1">
                {project.progress}%
              </p>
            </div>
            <div className="w-12 h-12">
              <svg
                className="transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray={`${project.progress}, 100`}
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tasks</p>
              <p className="text-2xl mt-1">
                {project.tasks.completed}/{project.tasks.total}
              </p>
            </div>
            <CheckSquare className="w-8 h-8 text-slate-300" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Due Date</p>
              <p className="text-lg mt-1">{project.dueDate}</p>
            </div>
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Activity</p>
              <p className="text-2xl mt-1">
                {project.comments}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="time">Utilization</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="communication">
            Communication
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Project Details */}
            <div className="col-span-2 space-y-6">
              {/* Progress Section */}
              <Card className="p-6">
                <h3 className="text-slate-900 mb-4">
                  Project Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">
                        Overall Completion
                      </span>
                      <span className="text-sm">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-slate-500">
                        Completed Tasks
                      </p>
                      <p className="text-2xl mt-1">
                        {project.tasks.completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Remaining Tasks
                      </p>
                      <p className="text-2xl mt-1">
                        {project.tasks.total -
                          project.tasks.completed}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Stage */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900">
                      Current Stage
                    </h3>
                    <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                      {currentStageData.stageName}
                    </Badge>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ListTodo className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-medium text-slate-700">
                      Workflow Tasks
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {currentStageData.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded ${
                          task.status === "in-progress"
                            ? "bg-violet-50 border border-violet-200"
                            : task.status === "completed"
                              ? "bg-slate-50"
                              : "hover:bg-slate-50"
                        } cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={task.status === "completed"}
                          className="w-4 h-4"
                          readOnly
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              task.status === "completed"
                                ? "text-slate-600 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {task.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-500">
                              {task.assignee === "JD"
                                ? "John"
                                : task.assignee === "SM"
                                  ? "Sarah"
                                  : "Alex"}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "secondary"
                              : task.status === "in-progress"
                                ? "default"
                                : "outline"
                          }
                          className={`text-xs ${task.status === "in-progress" ? "bg-violet-600" : ""}`}
                        >
                          {task.status === "completed"
                            ? "Done"
                            : task.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automations Section */}
                <Separator className="my-4" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-medium text-slate-700">
                      Automations
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {currentStageData.automations.map(
                      (automation) => (
                        <div
                          key={automation.id}
                          className="flex items-start gap-3 p-3 rounded bg-amber-50 border border-amber-200"
                        >
                          <Zap className="w-4 h-4 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">
                              {automation.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Trigger: {automation.trigger}
                            </p>
                          </div>
                          <Badge
                            variant={
                              automation.status === "completed"
                                ? "secondary"
                                : "default"
                            }
                            className={`text-xs ${automation.status === "pending" ? "bg-amber-600" : ""}`}
                          >
                            {automation.status === "completed"
                              ? "Done"
                              : "Pending"}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </Card>

              {/* Recent Activity Preview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900">
                    Recent Activity
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab("activity")}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        Task completed: Requirements gathering
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        Email sent to client
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        5 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        Stage changed to Design
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        1 day ago
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Team & Files */}
            <div className="space-y-6">
              {/* Action Items */}
              <Card className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-violet-600" />
                    <h3 className="text-slate-900">
                      Action Items
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      Client Portal View
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setHideCompleted(!hideCompleted)
                      }
                      className="gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide Completed
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Action Items List */}
                <div className="space-y-2">
                  {filteredActionItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded border ${
                        item.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          toggleActionItem(item.id)
                        }
                        className="w-4 h-4 mt-0.5 accent-green-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${item.completed ? "line-through text-slate-600" : "text-slate-900"}`}
                        >
                          {item.text}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.completed && item.completedAt
                            ? `Completed: ${item.completedAt}`
                            : `Due: ${item.dueDate}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-200"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={() =>
                            deleteActionItem(item.id)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Team Members */}
              <Card className="p-6">
                <h3 className="text-slate-900 mb-4">
                  Team Members
                </h3>
                <div className="space-y-3">
                  {project.assignees.map((assignee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-violet-100 text-violet-700">
                          {assignee}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          {assignee === "JD"
                            ? "John Doe"
                            : assignee === "SM"
                              ? "Sarah Miller"
                              : "Alex Smith"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Designer
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        Active
                      </Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Add Member
                  </Button>
                </div>
              </Card>

              {/* Files & Attachments */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900">Files</h3>
                  <Badge variant="secondary">
                    {project.attachments}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        requirements.pdf
                      </p>
                      <p className="text-xs text-slate-500">
                        2.3 MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                    <FileText className="w-4 h-4 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        mockup-v1.fig
                      </p>
                      <p className="text-xs text-slate-500">
                        5.7 MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                    <FileText className="w-4 h-4 text-violet-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        client-feedback.docx
                      </p>
                      <p className="text-xs text-slate-500">
                        1.1 MB
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                >
                  Upload File
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-slate-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      setActiveTab("communication")
                    }
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab("time")}
                  >
                    <Clock className="w-4 h-4" />
                    Log Time
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Generate Invoice
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="p-6">
            {/* Sub-navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={
                    documentsView === "current"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setDocumentsView("current")}
                  className={
                    documentsView === "current"
                      ? "bg-violet-600 hover:bg-violet-700"
                      : ""
                  }
                >
                  Current Year Documents
                </Button>
                <Button
                  variant={
                    documentsView === "master"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setDocumentsView("master")}
                  className={
                    documentsView === "master"
                      ? "bg-violet-600 hover:bg-violet-700"
                      : ""
                  }
                >
                  Master List (2025)
                </Button>
              </div>
              {documentsView === "current" && (
                <Button
                  size="sm"
                  className="gap-2 bg-violet-600 hover:bg-violet-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              )}
            </div>

            {/* Current Year Documents View */}
            {documentsView === "current" && (
              <>
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">
                      Owner:
                    </label>
                    <select
                      value={ownerFilter}
                      onChange={(e) =>
                        setOwnerFilter(e.target.value)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="Client">
                        Client Only
                      </option>
                      <option value="Spouse">
                        Spouse Only
                      </option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">
                      Year:
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(e) =>
                        setYearFilter(e.target.value)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All Years</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                  <div className="flex-1 flex items-center gap-2 ml-auto">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="text-sm border rounded px-3 py-1 flex-1 max-w-xs"
                    />
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-slate-50 rounded-t border-b border-slate-200">
                  <div className="col-span-2 text-xs font-medium text-slate-600">
                    CLIENT
                  </div>
                  <div className="col-span-1 text-xs font-medium text-slate-600">
                    OWNER
                  </div>
                  <div className="col-span-2 text-xs font-medium text-slate-600">
                    DOCUMENT
                  </div>
                  <div className="col-span-2 text-xs font-medium text-slate-600">
                    TYPE
                  </div>
                  <div className="col-span-1 text-xs font-medium text-slate-600">
                    YEAR
                  </div>
                  <div className="col-span-2 text-xs font-medium text-slate-600">
                    RECEIVED
                  </div>
                  <div className="col-span-1 text-xs font-medium text-slate-600">
                    METHOD
                  </div>
                  <div className="col-span-1 text-xs font-medium text-slate-600 text-right">
                    ACTIONS
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-200">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`grid grid-cols-12 gap-3 px-3 py-3 hover:bg-slate-50 ${
                        doc.owner === "Spouse"
                          ? "bg-purple-50/30"
                          : ""
                      }`}
                    >
                      <div className="col-span-2 text-sm text-slate-900 truncate">
                        {doc.client}
                      </div>
                      <div className="col-span-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            doc.owner === "Client"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {doc.owner}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-900 truncate">
                          {doc.document}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-slate-600 truncate">
                        {doc.type}
                      </div>
                      <div className="col-span-1 text-sm text-slate-600">
                        {doc.year}
                      </div>
                      <div className="col-span-2 text-sm text-slate-600">
                        {doc.received}
                      </div>
                      <div className="col-span-1">
                        <Badge
                          className={`text-xs ${getMethodBadgeStyle(doc.method)}`}
                        >
                          {doc.method === "Email"
                            ? "Email"
                            : doc.method === "Upload"
                              ? "Upload"
                              : "Text"}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        {getStatusIcon(doc.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-slate-200"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredDocuments.length === 0 && (
                  <div className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No documents found
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Master List View */}
            {documentsView === "master" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-violet-600" />
                    <h3 className="text-slate-900">
                      Master Document List for 2025
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Required documents for next tax year. Use this
                  list to track what needs to be collected from
                  the client.
                </p>

                {/* Master List Categories */}
                <div className="space-y-4">
                  {masterList.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border ${
                        category.required
                          ? "bg-amber-50 border-amber-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-900">
                            {category.category}
                          </h4>
                          {category.required && (
                            <Badge className="text-xs bg-amber-600 hover:bg-amber-700">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-violet-600"
                            />
                            <span className="text-sm text-slate-700 flex-1">
                              {item}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 mt-2"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Project Notes</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotes("")}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={saveNotes}
                  disabled={isSavingNotes}
                >
                  {isSavingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Add your project notes here..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Supports Markdown formatting. Notes are
              automatically saved.
            </p>
          </Card>

          {/* Comments on Notes */}
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Comments</h3>
            <div className="space-y-3">
              {noteComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                      {comment.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-900">
                        {comment.author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {comment.timestamp}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2 pt-2 border-t">
                <Input
                  value={newComment}
                  onChange={(e) =>
                    setNewComment(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && addNoteComment()
                  }
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={addNoteComment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time">
          <TimeTracker
            projectId={project.id}
            projectName={project.name}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">
              Project Activity Log
            </h3>
            <ActivityLog
              clientId={project.id}
              compact={false}
            />
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Send Communication</h3>
            <p className="text-sm text-slate-600 mb-4">
              Choose from pre-built templates or compose a custom message to send to your client.
            </p>
            <EmailTemplateSelector 
              onSelect={(template) => {
                console.log('Selected template:', template);
              }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Communication History</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm">Project Update Email</p>
                    <p className="text-xs text-slate-500 mt-1">Sent to client@example.com</p>
                  </div>
                  <p className="text-xs text-slate-500">2 days ago</p>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Hi, I wanted to update you on the progress of your project...
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm">Document Request</p>
                    <p className="text-xs text-slate-500 mt-1">Sent to client@example.com</p>
                  </div>
                  <p className="text-xs text-slate-500">5 days ago</p>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  We need the following documents to proceed...
                </p>
              </div>
              <div className="border-l-4 border-violet-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm">Welcome Email</p>
                    <p className="text-xs text-slate-500 mt-1">Sent to client@example.com</p>
                  </div>
                  <p className="text-xs text-slate-500">1 week ago</p>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Welcome! We're excited to work with you...
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrapper component for routing - fetches project data and handles navigation
export function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Mock project data - in a real app, this would be fetched from an API
  const mockProjectData = {
    id: projectId || 'unknown',
    name: 'Acme Corp Website Redesign',
    template: 'Accounting Workflow',
    assignees: ['JD', 'SM', 'AS'],
    progress: 65,
    tasks: { total: 12, completed: 8 },
    dueDate: 'Nov 30, 2024',
    comments: 24,
    attachments: 15,
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const handleViewActivityLog = () => {
    navigate(`/projects/${projectId}/activity-log`);
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
      <ProjectDetailPage
        project={mockProjectData}
        onBack={handleBack}
        onViewActivityLog={handleViewActivityLog}
      />
    </div>
  );
}