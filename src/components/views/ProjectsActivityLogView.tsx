import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  ChevronRight, 
  Search, 
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  User,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity,
  Zap,
  RefreshCcw,
  Bell,
  Eye,
  EyeOff,
  MailOpen,
  CheckSquare,
  Flag,
  MessageSquare,
  UserPlus,
  UserMinus,
  Target,
  Video
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

type ActivityType = 
  | 'task_created'
  | 'task_completed'
  | 'task_assigned'
  | 'milestone_reached'
  | 'milestone_updated'
  | 'document_uploaded'
  | 'document_reviewed'
  | 'comment_added'
  | 'status_changed'
  | 'team_member_added'
  | 'team_member_removed'
  | 'deadline_updated'
  | 'budget_updated'
  | 'email_sent'
  | 'meeting_scheduled'
  | 'meeting_completed';

type ActivityEvent = {
  id: string;
  timestamp: string;
  type: ActivityType;
  projectName: string;
  projectId: string;
  description: string;
  details: Record<string, any>;
  status: 'success' | 'failed' | 'pending' | 'warning';
  relatedEvents?: string[];
  category?: 'tasks' | 'milestones' | 'documents' | 'team' | 'communications' | 'system';
  emailContent?: {
    subject: string;
    body: string;
  };
  tracking?: {
    emailOpened?: boolean;
    emailOpenedAt?: string;
    emailOpenCount?: number;
    emailBounced?: boolean;
    emailFailed?: boolean;
    documentViewed?: boolean;
    documentViewedAt?: string;
    documentViewCount?: number;
    documentLastViewedAt?: string;
    documentDownloaded?: boolean;
    documentDownloadedAt?: string;
    taskCompletedAt?: string;
    taskViewed?: boolean;
    taskViewedAt?: string;
  };
};

type ProjectsActivityLogViewProps = {
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
};

// Mock data for project activities
const createMockActivities = (project: ProjectsActivityLogViewProps['project']): ActivityEvent[] => [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    type: 'task_completed',
    projectName: project.name,
    projectId: project.id,
    description: 'Task "Design mockups for homepage" completed by Sarah Johnson',
    details: {
      taskName: 'Design mockups for homepage',
      assignee: 'Sarah Johnson',
      taskId: 'TASK-001',
      completedAt: new Date(Date.now() - 30 * 60000).toLocaleString(),
    },
    status: 'success',
    category: 'tasks',
    tracking: {
      taskCompletedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(), // 90 mins ago
    type: 'milestone_reached',
    projectName: project.name,
    projectId: project.id,
    description: 'Milestone "Phase 1 Complete" reached',
    details: {
      milestoneName: 'Phase 1 Complete',
      milestoneId: 'MIL-001',
      progress: '100%',
      tasksCompleted: '12/12',
    },
    status: 'success',
    category: 'milestones',
    relatedEvents: ['1'],
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    type: 'document_uploaded',
    projectName: project.name,
    projectId: project.id,
    description: 'Document "Project_Specification_V2.pdf" uploaded by Mike Brown',
    details: {
      documentName: 'Project_Specification_V2.pdf',
      uploadedBy: 'Mike Brown',
      documentType: 'Specification',
      fileSize: '2.3 MB',
      documentId: 'DOC-001',
    },
    status: 'success',
    category: 'documents',
    tracking: {
      documentViewed: true,
      documentViewedAt: new Date(Date.now() - 1.5 * 60 * 60000).toISOString(),
      documentViewCount: 3,
      documentLastViewedAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      documentDownloaded: true,
      documentDownloadedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
    type: 'status_changed',
    projectName: project.name,
    projectId: project.id,
    description: 'Project status changed: In Progress → Review',
    details: {
      previousStatus: 'In Progress',
      newStatus: 'Review',
      changedBy: 'You',
      reason: 'Phase 1 completed, ready for client review',
    },
    status: 'warning',
    category: 'system',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(), // Yesterday
    type: 'email_sent',
    projectName: project.name,
    projectId: project.id,
    description: 'Project status update email sent to client team',
    details: {
      emailType: 'Status Update',
      recipient: 'client@example.com',
      subject: `Project Update: ${project.name}`,
    },
    status: 'success',
    category: 'communications',
    emailContent: {
      subject: `Project Update: ${project.name}`,
      body: `Hello Team,

This is an update on the progress of ${project.name}.

Current Status: Review
Progress: ${project.progress}%
Tasks Completed: ${project.tasks.completed}/${project.tasks.total}

We've completed Phase 1 and are ready for your review. Please let us know if you have any questions.

Best regards,
Project Team`,
    },
    tracking: {
      emailOpened: false,
      emailBounced: false,
      emailFailed: false,
    },
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60000).toISOString(), // Yesterday
    type: 'team_member_added',
    projectName: project.name,
    projectId: project.id,
    description: 'Emily Davis added to project team',
    details: {
      teamMember: 'Emily Davis',
      role: 'Designer',
      addedBy: 'You',
    },
    status: 'success',
    category: 'team',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), // 2 days ago
    type: 'task_created',
    projectName: project.name,
    projectId: project.id,
    description: 'New task "Implement user authentication" created',
    details: {
      taskName: 'Implement user authentication',
      createdBy: 'You',
      taskId: 'TASK-002',
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'success',
    category: 'tasks',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60000).toISOString(), // 2 days ago
    type: 'deadline_updated',
    projectName: project.name,
    projectId: project.id,
    description: 'Project deadline updated',
    details: {
      previousDeadline: 'Nov 30, 2024',
      newDeadline: 'Dec 15, 2024',
      updatedBy: 'You',
      reason: 'Client requested additional features',
    },
    status: 'success',
    category: 'system',
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(), // 3 days ago
    type: 'comment_added',
    projectName: project.name,
    projectId: project.id,
    description: 'Comment added to project discussion',
    details: {
      commentBy: 'Sarah Johnson',
      comment: 'The design mockups look great! Ready to move forward.',
      discussionThread: 'Design Review',
    },
    status: 'success',
    category: 'communications',
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(), // 4 days ago
    type: 'milestone_updated',
    projectName: project.name,
    projectId: project.id,
    description: 'Milestone "Phase 2 Planning" updated',
    details: {
      milestoneName: 'Phase 2 Planning',
      milestoneId: 'MIL-002',
      previousProgress: '30%',
      newProgress: '60%',
      updatedBy: 'Mike Brown',
    },
    status: 'success',
    category: 'milestones',
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(), // 5 days ago
    type: 'document_reviewed',
    projectName: project.name,
    projectId: project.id,
    description: 'Document "Technical_Requirements.pdf" reviewed and approved',
    details: {
      documentName: 'Technical_Requirements.pdf',
      reviewedBy: 'You',
      reviewStatus: 'Approved',
      documentId: 'DOC-002',
      comments: 'All requirements look good. Proceeding with implementation.',
    },
    status: 'success',
    category: 'documents',
    tracking: {
      documentViewed: true,
      documentViewedAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
      documentViewCount: 5,
      documentLastViewedAt: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    },
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60000).toISOString(), // 6 days ago
    type: 'meeting_scheduled',
    projectName: project.name,
    projectId: project.id,
    description: 'Client review meeting scheduled',
    details: {
      meetingTitle: 'Phase 1 Review Meeting',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60000).toLocaleDateString(),
      scheduledTime: '2:00 PM EST',
      participants: ['You', 'Sarah Johnson', 'Client Team'],
      meetingId: 'MTG-001',
    },
    status: 'success',
    category: 'communications',
  },
  {
    id: '13',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(), // 7 days ago
    type: 'task_assigned',
    projectName: project.name,
    projectId: project.id,
    description: 'Task "Create database schema" assigned to Alex Wilson',
    details: {
      taskName: 'Create database schema',
      assignedTo: 'Alex Wilson',
      assignedBy: 'You',
      taskId: 'TASK-003',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60000).toLocaleDateString(),
    },
    status: 'success',
    category: 'tasks',
  },
  {
    id: '14',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60000).toISOString(), // 8 days ago
    type: 'budget_updated',
    projectName: project.name,
    projectId: project.id,
    description: 'Project budget updated',
    details: {
      previousBudget: '$50,000',
      newBudget: '$65,000',
      updatedBy: 'You',
      reason: 'Additional features requested by client',
    },
    status: 'success',
    category: 'system',
  },
  {
    id: '15',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(), // 10 days ago
    type: 'meeting_completed',
    projectName: project.name,
    projectId: project.id,
    description: 'Kickoff meeting completed',
    details: {
      meetingTitle: 'Project Kickoff Meeting',
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60000).toLocaleString(),
      participants: ['You', 'Sarah Johnson', 'Mike Brown', 'Client Team'],
      meetingId: 'MTG-002',
      notes: 'Discussed project scope, timeline, and deliverables. All parties aligned.',
    },
    status: 'success',
    category: 'communications',
  },
];

type FilterPreset = 'all' | 'action_required' | 'tasks' | 'milestones' | 'documents' | 'team' | 'communications' | 'system' | 'not_seen';
type CategoryFilter = 'all' | 'tasks' | 'milestones' | 'documents' | 'team' | 'communications' | 'system';

export function ProjectsActivityLogView({ project }: ProjectsActivityLogViewProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Use project-specific mock data
  const mockActivities = createMockActivities(project);

  // Calculate summary stats
  const todayActivities = mockActivities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  const stats = {
    tasksCompleted: todayActivities.filter(a => a.type === 'task_completed').length,
    milestonesReached: todayActivities.filter(a => a.type === 'milestone_reached').length,
    documentsUploaded: todayActivities.filter(a => a.type === 'document_uploaded').length,
    actionRequired: mockActivities.filter(a => a.status === 'failed' || a.status === 'warning').length,
    totalActivities: todayActivities.length,
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEvents(newExpanded);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'task_created':
      case 'task_completed':
      case 'task_assigned':
        return <CheckSquare className="w-5 h-5" />;
      case 'milestone_reached':
      case 'milestone_updated':
        return <Flag className="w-5 h-5" />;
      case 'document_uploaded':
      case 'document_reviewed':
        return <FileText className="w-5 h-5" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5" />;
      case 'status_changed':
        return <AlertTriangle className="w-5 h-5" />;
      case 'team_member_added':
        return <UserPlus className="w-5 h-5" />;
      case 'team_member_removed':
        return <UserMinus className="w-5 h-5" />;
      case 'deadline_updated':
        return <Calendar className="w-5 h-5" />;
      case 'budget_updated':
        return <DollarSign className="w-5 h-5" />;
      case 'email_sent':
        return <Mail className="w-5 h-5" />;
      case 'meeting_scheduled':
      case 'meeting_completed':
        return <Video className="w-5 h-5" />;
      default:
        return <ClipboardList className="w-5 h-5" />;
    }
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'task_created':
        return 'Task Created';
      case 'task_completed':
        return 'Task';
      case 'task_assigned':
        return 'Task Assigned';
      case 'milestone_reached':
        return 'Milestone';
      case 'milestone_updated':
        return 'Milestone';
      case 'document_uploaded':
        return 'Document';
      case 'document_reviewed':
        return 'Document';
      case 'comment_added':
        return 'Comment';
      case 'status_changed':
        return 'Status';
      case 'team_member_added':
        return 'Team';
      case 'team_member_removed':
        return 'Team';
      case 'deadline_updated':
        return 'Deadline';
      case 'budget_updated':
        return 'Budget';
      case 'email_sent':
        return 'Email';
      case 'meeting_scheduled':
        return 'Meeting';
      case 'meeting_completed':
        return 'Meeting';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: ActivityType, status: string) => {
    // Override color based on status for critical items
    if (status === 'failed') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
      };
    }
    if (status === 'warning') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    }

    switch (type) {
      case 'email_sent':
      case 'comment_added':
      case 'meeting_scheduled':
      case 'meeting_completed':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'task_completed':
      case 'milestone_reached':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          dot: 'bg-green-500',
        };
      case 'task_created':
      case 'task_assigned':
      case 'milestone_updated':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
        };
      case 'document_uploaded':
      case 'document_reviewed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'team_member_added':
      case 'team_member_removed':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          text: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500',
        };
      case 'status_changed':
      case 'deadline_updated':
      case 'budget_updated':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          dot: 'bg-gray-400',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return null;
    }
  };

  const getFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format timestamp for timeline display
  const getTimelineTimestamp = (timestamp: string, groupKey: string) => {
    const date = new Date(timestamp);
    
    // For "Today" - show relative time
    if (groupKey === 'Today') {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hr ago`;
      }
    }
    
    // For all other days - show date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format tracking timestamp: 12/8/2025 | 2:30 PM
  const formatTrackingTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} | ${timeStr}`;
  };

  // Filter by preset
  const filterByPreset = (activities: ActivityEvent[]) => {
    switch (selectedPreset) {
      case 'action_required':
        return activities.filter(a => a.status === 'failed' || a.status === 'warning');
      case 'tasks':
        return activities.filter(a => 
          a.type === 'task_created' || 
          a.type === 'task_completed' || 
          a.type === 'task_assigned'
        );
      case 'milestones':
        return activities.filter(a => 
          a.type === 'milestone_reached' || 
          a.type === 'milestone_updated'
        );
      case 'documents':
        return activities.filter(a => 
          a.type === 'document_uploaded' || 
          a.type === 'document_reviewed'
        );
      case 'team':
        return activities.filter(a => 
          a.type === 'team_member_added' || 
          a.type === 'team_member_removed'
        );
      case 'communications':
        return activities.filter(a => 
          a.type === 'email_sent' || 
          a.type === 'comment_added' ||
          a.type === 'meeting_scheduled' ||
          a.type === 'meeting_completed'
        );
      case 'system':
        return activities.filter(a => 
          a.type === 'status_changed' || 
          a.type === 'deadline_updated' ||
          a.type === 'budget_updated'
        );
      case 'not_seen':
        return activities.filter(a => 
          (a.type === 'email_sent' && 
          a.tracking && 
          a.tracking.emailOpened === false) ||
          (a.type === 'document_uploaded' && 
          a.tracking && 
          a.tracking.documentViewed === false)
        );
      default:
        return activities;
    }
  };

  // Filter by date range
  const filterByDateRange = (activities: ActivityEvent[]) => {
    const now = new Date();
    return activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / 86400000);
      
      switch (dateRange) {
        case 'today':
          return activityDate.toDateString() === now.toDateString();
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        default:
          return true;
      }
    });
  };

  // Filter by search
  const filterBySearch = (activities: ActivityEvent[]) => {
    if (!searchQuery) return activities;
    
    const query = searchQuery.toLowerCase();
    return activities.filter(a =>
      a.projectName.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      Object.values(a.details).some(v => 
        String(v).toLowerCase().includes(query)
      )
    );
  };

  // Filter by category
  const filterByCategory = (activities: ActivityEvent[]) => {
    if (categoryFilter === 'all') return activities;
    return activities.filter(a => a.category === categoryFilter);
  };

  // Apply all filters
  let filteredActivities = mockActivities;
  filteredActivities = filterByDateRange(filteredActivities);
  filteredActivities = filterByPreset(filteredActivities);
  filteredActivities = filterBySearch(filteredActivities);
  filteredActivities = filterByCategory(filteredActivities);

  // Group by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    let groupKey: string;
    if (date.toDateString() === now.toDateString()) {
      groupKey = 'Today';
    } else if (diffDays === 1) {
      groupKey = 'Yesterday';
    } else if (diffDays < 7) {
      groupKey = 'This Week';
    } else if (diffDays < 30) {
      groupKey = 'This Month';
    } else {
      groupKey = 'Older';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
    return groups;
  }, {} as Record<string, ActivityEvent[]>);

  // Ensure order: Today, Yesterday, This Week, This Month, Older
  const orderedGroups = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Scrollable Container - allows header and cards to scroll away */}
      <div className="flex-1 overflow-y-auto">
        {/* Header - NOT STICKY */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Project Activity Log
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                    v19
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time timeline of all project events and activities
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {/* Category Filter - 2 Line Layout */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Line 1: Category Filter Pills - CENTERED */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setSelectedPreset('all');
                    }}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all ${
                      categoryFilter === 'all' && selectedPreset === 'all'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'all' && selectedPreset === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    All Activities
                  </button>
                  
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setSelectedPreset('action_required');
                    }}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      selectedPreset === 'action_required'
                        ? 'text-white'
                        : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                    }`}
                    style={selectedPreset === 'action_required' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    Action Required
                    {stats.actionRequired > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-[10px] font-bold">
                        {stats.actionRequired}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setCategoryFilter('tasks')}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      categoryFilter === 'tasks'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'tasks' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                    Tasks
                  </button>
                  
                  <button
                    onClick={() => setCategoryFilter('milestones')}
                    className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                      categoryFilter === 'milestones'
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    style={categoryFilter === 'milestones' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    <Flag className="w-3.5 h-3.5 mr-1.5" />
                    Milestones
                  </button>
                </div>
              </div>

              {/* Line 2: Sleek Text Filter Menu - CENTERED */}
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setSelectedPreset('all')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'all'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('not_seen')}
                    className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                      selectedPreset === 'not_seen'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    Not Seen
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('tasks')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'tasks'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Tasks
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('milestones')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'milestones'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Milestones
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('documents')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'documents'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Documents
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('team')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'team'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Team
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('communications')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'communications'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Communications
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => setSelectedPreset('system')}
                    className={`px-3 py-1.5 rounded transition-all ${
                      selectedPreset === 'system'
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No activities found matching your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPreset('all');
                    setSearchQuery('');
                    setDateRange('week');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {orderedGroups.map((groupKey) => {
                  const groupActivities = groupedActivities[groupKey];
                  if (!groupActivities || groupActivities.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      {/* Date Group Header - NOT STICKY */}
                      <div className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800">
                            <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                              {groupKey}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                        </div>
                      </div>

                      {/* Activities in this group */}
                      <div className="relative space-y-3 pl-8">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[1.125rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-transparent dark:from-purple-700 dark:via-blue-700" />

                        {groupActivities.map((activity, index) => {
                          const isExpanded = expandedEvents.has(activity.id);
                          const colors = getActivityColor(activity.type, activity.status);
                          const isActionRequired = activity.status === 'failed' || activity.status === 'warning';

                          return (
                            <div key={activity.id} className="relative">
                              {/* Timeline timestamp - on the left */}
                              <div className="absolute -left-[9.5rem] top-4 w-[8rem] text-right">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {getTimelineTimestamp(activity.timestamp, groupKey)}
                                </span>
                              </div>

                              {/* Timeline dot */}
                              <div className={`absolute -left-[1.4375rem] top-4 w-5 h-5 rounded-full border-4 border-gray-50 dark:border-gray-900 ${colors.dot} ${isActionRequired ? 'animate-pulse' : ''}`} />

                              {/* Activity Card */}
                              <div
                                className={`bg-white dark:bg-gray-800 border-2 ${colors.border} rounded-xl overflow-hidden transition-all ${
                                  isActionRequired ? 'shadow-lg' : 'hover:shadow-md'
                                }`}
                              >
                                {/* Card Header - Always Visible */}
                                <button
                                  onClick={() => toggleExpand(activity.id)}
                                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Icon with Label */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${colors.bg} ${colors.border} ${colors.text}`}>
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <span className={`text-[10px] font-medium ${colors.text}`}>
                                        {getActivityTypeLabel(activity.type)}
                                      </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3 mb-1">
                                        <div className="flex-1 min-w-0">
                                          {/* Project Name - Line 1 */}
                                          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                                            {activity.projectName}
                                          </h3>
                                          {/* Description - Line 2 */}
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                            {activity.description}
                                          </p>
                                          {/* Key Details at First Level */}
                                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            {activity.details.taskName && (
                                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {activity.details.taskName}
                                              </span>
                                            )}
                                            {activity.details.milestoneName && (
                                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {activity.details.milestoneName}
                                              </span>
                                            )}
                                            {activity.details.documentName && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.details.documentName}
                                              </span>
                                            )}
                                            {activity.details.assignee && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Assigned to: {activity.details.assignee}
                                              </span>
                                            )}
                                            {activity.details.teamMember && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.details.teamMember}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {getStatusBadge(activity.status)}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 flex-wrap mt-2">
                                        <span title={getFullTimestamp(activity.timestamp)}>
                                          {getTimelineTimestamp(activity.timestamp, groupKey)}
                                        </span>
                                        {activity.relatedEvents && activity.relatedEvents.length > 0 && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                              <Bell className="w-3 h-3" />
                                              Related event
                                            </span>
                                          </>
                                        )}
                                        {!isExpanded && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-purple-600 dark:text-purple-400 italic">
                                              Click for details
                                            </span>
                                          </>
                                        )}
                                        {/* TRACKING INFO - Positioned ~2/3 across */}
                                        <div className="flex-1" />
                                        
                                        {/* Email Tracking */}
                                        {activity.type === 'email_sent' && activity.tracking && (
                                          <>
                                            {activity.tracking.emailOpened === false ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title="Email has not been opened yet"
                                              >
                                                <EyeOff className="w-3 h-3" />
                                                <span className="uppercase">NOT OPENED</span>
                                              </span>
                                            ) : activity.tracking.emailOpened && activity.tracking.emailOpenedAt ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title={`Opened ${activity.tracking.emailOpenCount || 1} time(s)`}
                                              >
                                                <MailOpen className="w-3 h-3" />
                                                Opened: {formatTrackingTimestamp(activity.tracking.emailOpenedAt)}
                                              </span>
                                            ) : null}
                                            {activity.tracking.emailBounced && (
                                              <>
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1">
                                                  <XCircle className="w-3 h-3" />
                                                  <span className="uppercase">BOUNCED</span>
                                                </span>
                                              </>
                                            )}
                                          </>
                                        )}
                                        
                                        {/* Document Tracking */}
                                        {activity.type === 'document_uploaded' && activity.tracking && (
                                          <>
                                            {activity.tracking.documentViewed === false ? (
                                              <span 
                                                className="flex items-center gap-1"
                                                title="Document has not been viewed yet"
                                              >
                                                <EyeOff className="w-3 h-3" />
                                                <span className="uppercase">NOT VIEWED</span>
                                              </span>
                                            ) : activity.tracking.documentViewed && activity.tracking.documentViewedAt ? (
                                              <>
                                                <span 
                                                  className="flex items-center gap-1"
                                                  title={`Viewed ${activity.tracking.documentViewCount || 1} time(s). Last viewed: ${activity.tracking.documentLastViewedAt ? formatTrackingTimestamp(activity.tracking.documentLastViewedAt) : 'N/A'}`}
                                                >
                                                  <Eye className="w-3 h-3" />
                                                  Viewed: {formatTrackingTimestamp(activity.tracking.documentViewedAt)}
                                                </span>
                                                {activity.tracking.documentDownloaded && activity.tracking.documentDownloadedAt && (
                                                  <>
                                                    <span className="text-gray-400">•</span>
                                                    <span 
                                                      className="flex items-center gap-1"
                                                      title={`Downloaded: ${formatTrackingTimestamp(activity.tracking.documentDownloadedAt)}`}
                                                    >
                                                      <Download className="w-3 h-3" />
                                                      Downloaded: {formatTrackingTimestamp(activity.tracking.documentDownloadedAt)}
                                                    </span>
                                                  </>
                                                )}
                                              </>
                                            ) : null}
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <div className="flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="mt-3 space-y-2">
                                      {Object.entries(activity.details).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3 text-sm">
                                          <span className="text-gray-500 dark:text-gray-500 capitalize min-w-[140px] font-medium">
                                            {key.replace(/_/g, ' ')}:
                                          </span>
                                          <span className="text-gray-900 dark:text-gray-100 flex-1">
                                            {String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Related Events */}
                                    {activity.relatedEvents && activity.relatedEvents.length > 0 && (
                                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                          <Bell className="w-3 h-3" />
                                          Related Events
                                        </div>
                                        <div className="space-y-1">
                                          {activity.relatedEvents.map(relatedId => {
                                            const relatedEvent = mockActivities.find(a => a.id === relatedId);
                                            if (!relatedEvent) return null;
                                            return (
                                              <button
                                                key={relatedId}
                                                onClick={() => toggleExpand(relatedId)}
                                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                              >
                                                → {relatedEvent.description}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Email Content */}
                                    {activity.emailContent && (
                                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          Email Content
                                        </div>
                                        <div className="space-y-1">
                                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            Subject: {activity.emailContent.subject}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {activity.emailContent.body}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

