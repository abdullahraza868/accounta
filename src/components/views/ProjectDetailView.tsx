import { useState, useRef, useEffect } from "react";
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
  Eye,
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
  StickyNote,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { TimeTracker } from "../TimeTracker";
import { EmailTemplateSelector } from "../EmailTemplateSelector";
import { AddNoteDialog } from "../AddNoteDialog";
import { Separator } from "../ui/separator";
import { ProjectsDocumentsTab } from "../folder-tabs/ProjectsDocumentsTab";
import { ProjectsCommunicationTab } from "../folder-tabs/ProjectsCommunicationTab";
import { ProjectsActivityLogView } from "./ProjectsActivityLogView";
import { cn } from "../ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

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
  
  // Communication tab state
  const communicationTabRef = useRef<{
    channelMode: 'internal' | 'external' | 'texting' | 'email';
    setChannelMode: (mode: 'internal' | 'external' | 'texting' | 'email') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  } | null>(null);
  const [currentChannelMode, setCurrentChannelMode] = useState<'internal' | 'external' | 'texting' | 'email'>('internal');
  const [communicationKey, setCommunicationKey] = useState(0);

  // Force re-render when Communication tab becomes active
  useEffect(() => {
    if (activeTab === 'communication') {
      setTimeout(() => {
        setCommunicationKey(prev => prev + 1);
      }, 100);
    }
  }, [activeTab]);

  // Lead person state
  const [leadPerson, setLeadPerson] = useState("Sarah Miller");

  // Due date editing state
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  // Convert "Nov 30, 2024" to date input format "2024-11-30"
  const parseDueDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '2024-11-30'; // fallback
    }
  };
  const formatDueDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  const [projectDueDateInput, setProjectDueDateInput] = useState(parseDueDate(project.dueDate));
  const [projectDueDateDisplay, setProjectDueDateDisplay] = useState(project.dueDate);

  // Visibility & Permissions state
  const [projectVisibility, setProjectVisibility] = useState<{
    level: 'Public' | 'Private' | 'Team';
    visibleUsers: string[];
  }>({
    level: 'Team',
    visibleUsers: ['JD', 'SM', 'AS', 'MJ']
  });

  // Team Members Dialog state
  const [showTeamMembersDialog, setShowTeamMembersDialog] = useState(false);

  // Visibility & Permissions Dialog state
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);

  // Map assignee codes to full names and roles
  const getTeamMemberDetails = (code: string) => {
    const members: Record<string, { name: string; role: string; email: string }> = {
      'JD': { name: 'John Doe', role: 'Senior Designer', email: 'john.doe@example.com' },
      'SM': { name: 'Sarah Miller', role: 'Project Manager', email: 'sarah.miller@example.com' },
      'AS': { name: 'Alex Smith', role: 'Developer', email: 'alex.smith@example.com' },
      'MJ': { name: 'Michael Johnson', role: 'QA Specialist', email: 'michael.j@example.com' },
    };
    return members[code] || { name: code, role: 'Team Member', email: '' };
  };

  // Highlighted Notes state
  type HighlightedNote = {
    id: number;
    content: string;
    date: string;
    author: string;
    highlighted?: boolean;
  };

  const [highlightedNotes, setHighlightedNotes] = useState<HighlightedNote[]>([
    { id: 1, content: 'Design phase requires client approval before proceeding to development', date: '2024-10-15', author: 'Sarah Miller', highlighted: true },
    { id: 2, content: 'Client requested violet color scheme - update all mockups accordingly', date: '2024-10-12', author: 'John Doe', highlighted: true },
    { id: 3, content: 'Project deadline extended to Nov 30 - adjust timeline for remaining tasks', date: '2024-10-10', author: 'Alex Smith', highlighted: true },
    { id: 4, content: 'Mobile-first approach confirmed - prioritize responsive design in wireframes', date: '2024-10-08', author: 'Sarah Miller', highlighted: true }
  ]);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);

  const handleAddNote = (note: { content: string; highlighted: boolean }) => {
    const newNote: HighlightedNote = {
      id: Math.max(...highlightedNotes.map((n: HighlightedNote) => n.id), 0) + 1,
      content: note.content,
      date: new Date().toISOString().split('T')[0],
      author: 'Current User',
      highlighted: note.highlighted
    };
    setHighlightedNotes([newNote, ...highlightedNotes]);
  };

  const handleDeleteNote = (id: number) => {
    setHighlightedNotes((highlightedNotes: HighlightedNote[]) => highlightedNotes.filter((note: HighlightedNote) => note.id !== id));
  };

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
            {/* Project Team Info - Three Cards */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {/* Account Manager Card */}
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <span className="text-amber-700 font-medium">
                  Account Manager:
                </span>{" "}
                {leadPerson}
              </span>
            </div>

              {/* Team Members Card */}
              <button
                onClick={() => setShowTeamMembersDialog(true)}
                className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-600" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-blue-700 font-medium">Team Members:</span>
                  <div className="flex items-center -space-x-2">
                    {project.assignees.slice(0, 3).map((assignee, idx) => (
                      <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px]">
                          {assignee}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {project.assignees.length > 3 && (
                    <span className="text-xs text-blue-600 ml-1">
                      +{project.assignees.length - 3}
                    </span>
                  )}
                </div>
              </button>
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
            Activity log
          </Button>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Mail className="w-4 h-4" />
            Send Update
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setActiveTab("communication")}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("time")}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Log Time
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <DollarSign className="w-4 h-4" />
                Generate Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <div className="flex-1">
              <p className="text-sm text-slate-500">Due Date</p>
              {isEditingDueDate ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={projectDueDateInput}
                    onChange={(e) => setProjectDueDateInput(e.target.value)}
                    onBlur={() => {
                      setProjectDueDateDisplay(formatDueDate(projectDueDateInput));
                      setIsEditingDueDate(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setProjectDueDateDisplay(formatDueDate(projectDueDateInput));
                        setIsEditingDueDate(false);
                      } else if (e.key === 'Escape') {
                        setProjectDueDateInput(parseDueDate(project.dueDate));
                        setProjectDueDateDisplay(project.dueDate);
                        setIsEditingDueDate(false);
                      }
                    }}
                    className="text-lg border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg">{projectDueDateDisplay}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-100"
                    onClick={() => setIsEditingDueDate(true)}
                  >
                    <Pencil className="w-3 h-3 text-slate-500" />
                  </Button>
                </div>
              )}
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
          {/* <TabsTrigger value="notes">Notes</TabsTrigger> */}
          <TabsTrigger value="time">Time Log / Budget</TabsTrigger>
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
              {/* <Card className="p-6">
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
              </Card> */}

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
              {/* Highlighted Notes */}
              <Card className="p-5 border border-gray-200/60 shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 flex-shrink-0 pl-8">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Highlighted Notes</h3>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => setShowAddNoteDialog(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Note
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                  {highlightedNotes.filter((n: HighlightedNote) => n.highlighted).map((note: HighlightedNote) => (
                    <div key={note.id} className="p-3 bg-yellow-50 border border-yellow-200/60 rounded-lg relative group">
                      <p className="text-sm text-gray-900 pr-6">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{note.author}</p>
                        <p className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {highlightedNotes.filter((n: HighlightedNote) => n.highlighted).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <StickyNote className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No highlighted notes yet</p>
                    </div>
                  )}
                </div>
              </Card>

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

            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <ProjectsDocumentsTab project={project} />
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
        <TabsContent value="activity" className="p-0">
          <ProjectsActivityLogView project={project} />
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-0">
          {/* Submenu Bar - Channel Mode Switcher */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentChannelMode('internal');
                  communicationTabRef.current?.setChannelMode('internal');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'internal'
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Internal Discussion
                <Badge className="ml-1 bg-orange-500 hover:bg-orange-500 text-white text-[10px] h-4 min-w-4 px-1">
                  2
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('external');
                  communicationTabRef.current?.setChannelMode('external');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'external'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Client Chat
                <Badge className="ml-1 bg-red-600 hover:bg-red-600 text-white text-[10px] h-4 min-w-4 px-1 animate-pulse">
                  1
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('email');
                  communicationTabRef.current?.setChannelMode('email');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'email'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                Email
                <Badge className="ml-1 bg-purple-600 hover:bg-purple-600 text-white text-[10px] h-4 min-w-4 px-1">
                  1
                </Badge>
              </button>
              <button
                onClick={() => {
                  setCurrentChannelMode('texting');
                  communicationTabRef.current?.setChannelMode('texting');
                }}
                className={cn(
                  "h-10 px-3 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 relative",
                  currentChannelMode === 'texting'
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Text Messages
              </button>
            </div>

            {/* Search - Right Side */}
            <div className="relative w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={communicationTabRef.current?.searchQuery || ''}
                onChange={(e) => communicationTabRef.current?.setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-8 text-sm"
              />
              {communicationTabRef.current?.searchQuery && (
                <button
                  onClick={() => communicationTabRef.current?.setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Communication Tab Content */}
          <ProjectsCommunicationTab key={communicationKey} ref={communicationTabRef} project={project} />
        </TabsContent>
      </Tabs>

      {/* Team Members Dialog */}
      <Dialog open={showTeamMembersDialog} onOpenChange={setShowTeamMembersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Team Members
            </DialogTitle>
            <DialogDescription>
              View team members working on this project and manage visibility settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {project.assignees.map((assignee, idx) => {
              const member = getTeamMemberDetails(assignee);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {assignee}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.role}
                    </p>
                    {member.email && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setShowTeamMembersDialog(false);
                setShowVisibilityDialog(true);
              }}
            >
              <Eye className="w-4 h-4" />
              View & Edit Visibility
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility & Permissions Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-green-600" />
              Visibility & Permissions
            </DialogTitle>
            <DialogDescription>
              Manage who can view and access this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Visibility Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility Level</Label>
              <RadioGroup
                value={projectVisibility.level}
                onValueChange={(value: 'Public' | 'Private' | 'Team') => {
                  setProjectVisibility(prev => ({ ...prev, level: value }));
                }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <RadioGroupItem value="Public" id="public" />
                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div>
                      <span className="font-medium">Public</span>
                      <p className="text-xs text-slate-500">Visible to all team members</p>
                  </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <RadioGroupItem value="Team" id="team" />
                  <Label htmlFor="team" className="flex-1 cursor-pointer">
                    <div>
                      <span className="font-medium">Team</span>
                      <p className="text-xs text-slate-500">Visible to selected team members</p>
              </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <RadioGroupItem value="Private" id="private" />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div>
                      <span className="font-medium">Private</span>
                      <p className="text-xs text-slate-500">Only visible to you</p>
                  </div>
                  </Label>
                </div>
              </RadioGroup>
              </div>

            {/* Visible Users (only show if Team is selected) */}
            {projectVisibility.level === 'Team' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Visible To</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {['JD', 'SM', 'AS', 'MJ', 'RW', 'AB'].map((userCode) => {
                    const member = getTeamMemberDetails(userCode);
                    const isSelected = projectVisibility.visibleUsers.includes(userCode);
                    return (
                      <div
                        key={userCode}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50"
                      >
                        <Checkbox
                          id={userCode}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setProjectVisibility(prev => ({
                                ...prev,
                                visibleUsers: [...prev.visibleUsers, userCode]
                              }));
                            } else {
                              setProjectVisibility(prev => ({
                                ...prev,
                                visibleUsers: prev.visibleUsers.filter(u => u !== userCode)
                              }));
                            }
                          }}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                            {userCode}
                          </AvatarFallback>
                        </Avatar>
                        <Label htmlFor={userCode} className="flex-1 cursor-pointer">
                  <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                        </Label>
                </div>
                    );
                  })}
              </div>
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowVisibilityDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowVisibilityDialog(false);
                  // In a real app, you would save the changes here
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={showAddNoteDialog}
        onOpenChange={setShowAddNoteDialog}
        onSave={handleAddNote}
        clientName={project.name}
      />
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