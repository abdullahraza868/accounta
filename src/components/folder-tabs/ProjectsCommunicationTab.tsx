import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Building2, 
  MoreVertical, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  Smile,
  Send, 
  X, 
  ChevronDown,
  Star, 
  MessageSquare, 
  Pin, 
  CheckCheck,
  Filter, 
  Smartphone,
  Mail,
  Inbox,
  Reply,
  Forward,
  Trash2,
  Archive,
  MailPlus,
  Info,
  ShieldAlert,
  Copy,
  Edit2,
  CheckSquare,
  UserPlus,
  FileDown,
  Phone,
  Plus,
  Calendar,
  Eye,
  CheckCircle2,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { EmailPDFPreviewDialog } from '../dialogs/EmailPDFPreviewDialog';

type ProjectsCommunicationTabProps = {
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

type ChannelMode = 'internal' | 'external' | 'texting' | 'email';
type UrgencyLevel = 'normal' | 'next-block' | 'time-sensitive' | 'critical';

type ReadReceipt = {
  userId: string;
  userName: string;
  userInitials: string;
  seenAt: string;
};

type Message = {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  date: string;
  urgency: UrgencyLevel;
  reactions?: { emoji: string; count: number }[];
  isCurrentUser?: boolean;
  attachments?: { name: string; type: string; size: string }[];
  isPinned?: boolean;
  readBy?: ReadReceipt[];
  sentAt: string;
  assignedTo?: string;
  assignedToInitials?: string;
};

type Channel = {
  id: string;
  name: string;
  type: 'client-discussion' | 'client' | 'text-message' | 'email';
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  urgency?: UrgencyLevel;
  participants?: string[];
  phoneNumber?: string;
  email?: string;
};

type EmailThread = {
  id: string;
  subject: string;
  participants: string[];
  lastSender: string;
  lastSenderInitials: string;
  preview: string;
  timestamp: string;
  date: string;
  unread: boolean;
  hasAttachment: boolean;
  isStarred: boolean;
  emailCount: number;
};

type Email = {
  id: string;
  from: string;
  fromInitials: string;
  to: string[];
  cc?: string[];
  subject: string;
  content: string;
  timestamp: string;
  date: string;
  attachments?: { name: string; type: string; size: string }[];
  isFromFirm: boolean;
};

export const ProjectsCommunicationTab = forwardRef<any, ProjectsCommunicationTabProps>(({ project }, ref) => {
  const [channelMode, setChannelMode] = useState<ChannelMode>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageUrgency, setMessageUrgency] = useState<UrgencyLevel>('normal');
  const [selectedEmailThread, setSelectedEmailThread] = useState<EmailThread | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [pendingUrgency, setPendingUrgency] = useState<UrgencyLevel>('normal');
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [showEmailPDFPreview, setShowEmailPDFPreview] = useState(false);

  // Get project name for display
  const projectName = project.name;

  // Team members for assignment
  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', initials: 'SJ', role: 'Senior Tax Accountant' },
    { id: '2', name: 'Mike Brown', initials: 'MB', role: 'Tax Manager' },
    { id: '3', name: 'Emily Davis', initials: 'ED', role: 'CPA' },
    { id: '4', name: 'Alex Wilson', initials: 'AW', role: 'Junior Accountant' },
    { id: '5', name: 'You', initials: 'SD', role: 'Account Owner' },
  ];

  // Mock channels filtered for this project
  const internalChannels: Channel[] = [
    {
      id: 'cd1',
      name: projectName,
      type: 'client-discussion',
      unreadCount: 2,
      lastMessage: 'Project milestone needs review before client presentation',
      lastMessageTime: '1h',
      urgency: 'time-sensitive',
      participants: ['Sarah Johnson', 'Mike Brown', 'You'],
    },
  ];

  const externalChannels: Channel[] = [
    {
      id: 'ce1',
      name: projectName,
      type: 'client',
      unreadCount: 1,
      lastMessage: 'URGENT: Client requested changes to the design mockups...',
      lastMessageTime: '30m',
      urgency: 'critical',
      participants: [projectName],
    },
  ];

  const textingChannels: Channel[] = [
    {
      id: 'sms1',
      name: projectName,
      type: 'text-message',
      unreadCount: 0,
      lastMessage: 'Thanks for the quick update on the project status',
      lastMessageTime: '2h',
      phoneNumber: '+1 (555) 123-4567',
    },
  ];

  const emailChannels: Channel[] = [
    {
      id: 'email1',
      name: projectName,
      type: 'email',
      unreadCount: 1,
      lastMessage: 'Re: Project Status Update',
      lastMessageTime: '45m',
      email: 'client@example.com',
    },
  ];

  // Mock email threads - showing all firm communications for this project
  const emailThreads: EmailThread[] = [
    {
      id: 'thread1',
      subject: 'Project Status Update - Phase 2 Complete',
      participants: ['You', 'Client Team'],
      lastSender: 'Client Team',
      lastSenderInitials: 'CT',
      preview: 'Great work on Phase 2! We have a few questions about the implementation...',
      timestamp: '1:15 PM',
      date: 'Today',
      unread: true,
      hasAttachment: true,
      isStarred: false,
      emailCount: 4,
    },
    {
      id: 'thread2',
      subject: 'Q4 2024 Project Milestone Review',
      participants: ['Sarah Johnson', 'Client Team'],
      lastSender: 'Sarah Johnson',
      lastSenderInitials: 'SJ',
      preview: 'Just a friendly reminder that your Q4 project milestone review is scheduled...',
      timestamp: 'Yesterday',
      date: 'Yesterday',
      unread: false,
      hasAttachment: false,
      isStarred: true,
      emailCount: 2,
    },
    {
      id: 'thread3',
      subject: 'Project Kickoff Meeting Scheduled',
      participants: ['Mike Brown', 'Client Team', 'You'],
      lastSender: 'Mike Brown',
      lastSenderInitials: 'MB',
      preview: 'I\'ve scheduled our project kickoff meeting for December 15th...',
      timestamp: '2 days ago',
      date: 'Oct 24',
      unread: false,
      hasAttachment: true,
      isStarred: false,
      emailCount: 5,
    },
    {
      id: 'thread4',
      subject: 'Project Requirements Document',
      participants: ['You', 'Client Team'],
      lastSender: 'You',
      lastSenderInitials: 'ME',
      preview: 'As we discussed, here are the updated project requirements...',
      timestamp: 'Oct 20',
      date: 'Oct 20',
      unread: false,
      hasAttachment: true,
      isStarred: false,
      emailCount: 3,
    },
    {
      id: 'thread5',
      subject: 'Re: Design Mockup Feedback',
      participants: ['Sarah Johnson', 'Client Team'],
      lastSender: 'Client Team',
      lastSenderInitials: 'CT',
      preview: 'Thank you for the updated mockups! They look great.',
      timestamp: 'Oct 18',
      date: 'Oct 18',
      unread: false,
      hasAttachment: false,
      isStarred: false,
      emailCount: 6,
    },
  ];

  // Get current channels based on mode
  const getCurrentChannels = (): Channel[] => {
    switch (channelMode) {
      case 'internal':
        return internalChannels;
      case 'external':
        return externalChannels;
      case 'texting':
        return textingChannels;
      case 'email':
        return emailChannels;
      default:
        return [];
    }
  };

  const currentChannels = getCurrentChannels();

  // Auto-select first channel when mode changes
  useEffect(() => {
    if (channelMode === 'email') {
      if (emailThreads.length > 0) {
        setSelectedEmailThread(emailThreads[0]);
      }
    } else {
      if (currentChannels.length > 0) {
        setSelectedChannel(currentChannels[0]);
      }
    }
  }, [channelMode]);

  // Mock messages for selected channel
  const getMessagesForChannel = (channel: Channel | null): Message[] => {
    if (!channel) return [];

    if (channel.type === 'client-discussion') {
      // Internal team discussion about project
      return [
        {
          id: '1',
          sender: 'Sarah Johnson',
          senderInitials: 'SJ',
          content: `${projectName} milestone is approaching. Should we schedule a review meeting before the client presentation?`,
          timestamp: '2:45 PM',
          date: 'Today',
          sentAt: 'Today at 2:45 PM',
          urgency: 'normal',
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '2:46 PM' },
            { userId: 'mb', userName: 'Mike Brown', userInitials: 'MB', seenAt: '2:50 PM' }
          ],
        },
        {
          id: '2',
          sender: 'You',
          senderInitials: 'ME',
          content: 'Good idea. I\'ll set up a meeting for tomorrow. We should also review the design mockups.',
          timestamp: '2:47 PM',
          date: 'Today',
          sentAt: 'Today at 2:47 PM',
          urgency: 'normal',
          isCurrentUser: true,
          readBy: [
            { userId: 'sj', userName: 'Sarah Johnson', userInitials: 'SJ', seenAt: '2:48 PM' },
            { userId: 'mb', userName: 'Mike Brown', userInitials: 'MB', seenAt: '2:51 PM' }
          ],
        },
        {
          id: '3',
          sender: 'Mike Brown',
          senderInitials: 'MB',
          content: 'IMPORTANT: Client requested changes to the design. Need to review by Friday.',
          timestamp: '3:15 PM',
          date: 'Today',
          sentAt: 'Today at 3:15 PM',
          urgency: 'time-sensitive',
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '3:16 PM' }
          ],
        },
      ];
    } else if (channel.type === 'client') {
      // Direct communication with client about project
      return [
        {
          id: '1',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'Hi! I wanted to follow up on the project status. How is Phase 2 progressing?',
          timestamp: '10:15 AM',
          date: 'Today',
          sentAt: 'Today at 10:15 AM',
          urgency: 'normal',
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '10:20 AM' }
          ],
        },
        {
          id: '2',
          sender: 'You',
          senderInitials: 'ME',
          content: 'Phase 2 is on track! We\'re about 80% complete and should finish by end of week.',
          timestamp: '10:22 AM',
          date: 'Today',
          sentAt: 'Today at 10:22 AM',
          urgency: 'normal',
          isCurrentUser: true,
          readBy: [
            { userId: 'client', userName: 'Client Team', userInitials: 'CT', seenAt: '10:25 AM' }
          ],
        },
        {
          id: '3',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'Perfect! Also, when can we schedule a demo of the new features?',
          timestamp: '11:30 AM',
          date: 'Today',
          sentAt: 'Today at 11:30 AM',
          urgency: 'normal',
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '11:32 AM' }
          ],
        },
        {
          id: '4',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'URGENT: We need to make changes to the design before the presentation. Can we meet today to discuss?',
          timestamp: '2:30 PM',
          date: 'Today',
          sentAt: 'Today at 2:30 PM',
          urgency: 'critical',
        },
      ];
    } else if (channel.type === 'text-message') {
      // Text messages
      return [
        {
          id: '1',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'Quick question - what time is our project review meeting tomorrow?',
          timestamp: '9:15 AM',
          date: 'Today',
          sentAt: 'Today at 9:15 AM',
          urgency: 'normal',
        },
        {
          id: '2',
          sender: 'You',
          senderInitials: 'ME',
          content: 'Our meeting is at 2:00 PM. See you then!',
          timestamp: '9:18 AM',
          date: 'Today',
          sentAt: 'Today at 9:18 AM',
          urgency: 'normal',
          isCurrentUser: true,
        },
        {
          id: '3',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'Thanks!',
          timestamp: '9:20 AM',
          date: 'Today',
          sentAt: 'Today at 9:20 AM',
          urgency: 'normal',
        },
        {
          id: '4',
          sender: 'You',
          senderInitials: 'ME',
          content: 'Perfect, looking forward to it!',
          timestamp: '9:22 AM',
          date: 'Today',
          sentAt: 'Today at 9:22 AM',
          urgency: 'normal',
          isCurrentUser: true,
        },
        {
          id: '5',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: 'Also, can you send me the latest project timeline?',
          timestamp: '2:05 PM',
          date: 'Today',
          sentAt: 'Today at 2:05 PM',
          urgency: 'normal',
        },
        {
          id: '6',
          sender: 'You',
          senderInitials: 'ME',
          content: 'Absolutely! I\'ll email that to you right away.',
          timestamp: '2:10 PM',
          date: 'Today',
          sentAt: 'Today at 2:10 PM',
          urgency: 'normal',
          isCurrentUser: true,
        },
      ];
    } else if (channel.type === 'email') {
      // Email messages (legacy - not used with new email interface)
      return [
        {
          id: '1',
          sender: 'You',
          senderInitials: 'ME',
          content: `Hi,\n\nI hope this email finds you well. I'm reaching out to provide an update on the project status.\n\nCurrent progress:\n• Phase 1: Complete\n• Phase 2: 80% complete\n• Phase 3: Not started\n\nWe're on track to meet the deadline. Please let me know if you have any questions.\n\nBest regards`,
          timestamp: '8:30 AM',
          date: 'Today',
          sentAt: 'Today at 8:30 AM',
          urgency: 'normal',
          isCurrentUser: true,
          attachments: [
            { name: 'Project_Status_Report.pdf', type: 'PDF', size: '156 KB' }
          ],
          readBy: [
            { userId: 'client', userName: 'Client Team', userInitials: 'CT', seenAt: '9:15 AM' }
          ],
        },
        {
          id: '2',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: `Hi,\n\nThank you for the update! The progress looks great.\n\nI also wanted to mention that we'd like to add a few new features to Phase 3.\n\nPlease let me know if you need any additional information.\n\nThanks!`,
          timestamp: '11:45 AM',
          date: 'Today',
          sentAt: 'Today at 11:45 AM',
          urgency: 'normal',
          attachments: [
            { name: 'New_Features_Request.pdf', type: 'PDF', size: '245 KB' }
          ],
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '11:50 AM' }
          ],
        },
        {
          id: '3',
          sender: 'You',
          senderInitials: 'ME',
          content: `Perfect! I've reviewed the new features request. We can definitely incorporate these into Phase 3.\n\nI'll update the project timeline and send it over by end of day tomorrow.\n\nThanks for the feedback!`,
          timestamp: '12:05 PM',
          date: 'Today',
          sentAt: 'Today at 12:05 PM',
          urgency: 'normal',
          isCurrentUser: true,
          readBy: [
            { userId: 'client', userName: 'Client Team', userInitials: 'CT', seenAt: '12:10 PM' }
          ],
        },
        {
          id: '4',
          sender: 'Client Team',
          senderInitials: 'CT',
          content: `Wonderful! I appreciate your help with this.\n\nOne more thing - when would be a good time to schedule a demo of the completed features?`,
          timestamp: '1:15 PM',
          date: 'Today',
          sentAt: 'Today at 1:15 PM',
          urgency: 'normal',
        },
      ];
    }
  };

  // Get emails for a specific thread
  const getEmailsForThread = (thread: EmailThread | null): Email[] => {
    if (!thread) return [];

    if (thread.id === 'thread1') {
      return [
        {
          id: 'e1',
          from: 'You',
          fromInitials: 'ME',
          to: ['Client Team'],
          subject: 'Project Status Update - Phase 2 Complete',
          content: `Hi,\n\nI hope this email finds you well. I'm reaching out to provide an update on the project status.\n\nCurrent progress:\n• Phase 1: Complete\n• Phase 2: 80% complete\n• Phase 3: Not started\n\nWe're on track to meet the deadline. Please let me know if you have any questions.\n\nBest regards`,
          timestamp: '8:30 AM',
          date: 'Today',
          attachments: [{ name: 'Project_Status_Report.pdf', type: 'PDF', size: '156 KB' }],
          isFromFirm: true,
        },
        {
          id: 'e2',
          from: 'Client Team',
          fromInitials: 'CT',
          to: ['You'],
          subject: 'Re: Project Status Update - Phase 2 Complete',
          content: `Hi,\n\nThank you for the update! The progress looks great.\n\nI also wanted to mention that we'd like to add a few new features to Phase 3.\n\nPlease let me know if you need any additional information.\n\nThanks!`,
          timestamp: '11:45 AM',
          date: 'Today',
          attachments: [{ name: 'New_Features_Request.pdf', type: 'PDF', size: '245 KB' }],
          isFromFirm: false,
        },
        {
          id: 'e3',
          from: 'You',
          fromInitials: 'ME',
          to: ['Client Team'],
          subject: 'Re: Project Status Update - Phase 2 Complete',
          content: `Perfect! I've reviewed the new features request. We can definitely incorporate these into Phase 3.\n\nI'll update the project timeline and send it over by end of day tomorrow.\n\nThanks for the feedback!`,
          timestamp: '12:05 PM',
          date: 'Today',
          attachments: [],
          isFromFirm: true,
        },
        {
          id: 'e4',
          from: 'Client Team',
          fromInitials: 'CT',
          to: ['You'],
          subject: 'Re: Project Status Update - Phase 2 Complete',
          content: `Wonderful! I appreciate your help with this.\n\nOne more thing - when would be a good time to schedule a demo of the completed features?`,
          timestamp: '1:15 PM',
          date: 'Today',
          attachments: [],
          isFromFirm: false,
        },
      ];
    } else if (thread.id === 'thread2') {
      return [
        {
          id: 'e5',
          from: 'Sarah Johnson',
          fromInitials: 'SJ',
          to: ['Client Team'],
          subject: 'Q4 2024 Project Milestone Review',
          content: `Hi,\n\nJust a friendly reminder that your Q4 project milestone review is scheduled for January 15, 2025.\n\nWe'll be reviewing:\n• Phase 1 completion\n• Phase 2 progress\n• Phase 3 planning\n\nLet me know if you have any questions!\n\nBest,\nSarah Johnson\nProject Manager`,
          timestamp: '9:30 AM',
          date: 'Yesterday',
          attachments: [],
          isFromFirm: true,
        },
        {
          id: 'e6',
          from: 'Client Team',
          fromInitials: 'CT',
          to: ['Sarah Johnson'],
          cc: ['You'],
          subject: 'Re: Q4 2024 Project Milestone Review',
          content: `Hi Sarah,\n\nThank you for the reminder! We're looking forward to the review.\n\nWe'll prepare our questions and feedback ahead of time.\n\nThanks,\nClient Team`,
          timestamp: '2:15 PM',
          date: 'Yesterday',
          attachments: [],
          isFromFirm: false,
        },
      ];
    } else if (thread.id === 'thread3') {
      return [
        {
          id: 'e7',
          from: 'Mike Brown',
          fromInitials: 'MB',
          to: ['Client Team'],
          cc: ['You'],
          subject: 'Project Kickoff Meeting Scheduled',
          content: `Hi,\n\nI've scheduled our project kickoff meeting for December 15th at 2:00 PM.\n\nIn this meeting, we'll review:\n• Project scope and objectives\n• Timeline and milestones\n• Team roles and responsibilities\n• Communication protocols\n\nI've attached an agenda for your review. Please let me know if there are any specific topics you'd like to discuss.\n\nLooking forward to our meeting!\n\nBest regards,\nMike Brown\nProject Lead`,
          timestamp: '10:45 AM',
          date: 'Oct 24',
          attachments: [{ name: 'Meeting_Agenda_Dec15.pdf', type: 'PDF', size: '128 KB' }],
          isFromFirm: true,
        },
      ];
    }

    return [];
  };

  const messages = getMessagesForChannel(selectedChannel);

  // Group messages by date
  const messagesByDate = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = message.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    console.log('Sending message:', {
      channel: selectedChannel?.id,
      text: messageText,
      urgency: messageUrgency
    });

    setMessageText('');
    setMessageUrgency('normal');
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return 'border-l-red-500 bg-red-50/50';
      case 'time-sensitive':
        return 'border-l-orange-500 bg-orange-50/30';
      case 'next-block':
        return 'border-l-yellow-500 bg-yellow-50/30';
      default:
        return 'border-l-gray-200';
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">Critical</Badge>;
      case 'time-sensitive':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs">Time Sensitive</Badge>;
      case 'next-block':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">Next Block</Badge>;
      default:
        return null;
    }
  };

  // Expose to parent via ref
  useImperativeHandle(ref, () => ({
    channelMode,
    setChannelMode,
    searchQuery,
    setSearchQuery
  }));

  // Render Email Interface
  if (channelMode === 'email') {
    const selectedEmails = getEmailsForThread(selectedEmailThread);

    return (
      <div className="flex h-[calc(100vh-280px)]">
        {/* Email Thread List */}
        <div className="w-96 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Thread List Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Email Threads</h3>
              <Button size="sm" className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <MailPlus className="w-4 h-4 mr-2" />
                New Email
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Thread List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {emailThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedEmailThread(thread)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg mb-1 transition-all hover:bg-white",
                    selectedEmailThread?.id === thread.id ? "bg-white shadow-sm border border-purple-200" : "bg-transparent",
                    thread.unread && "font-semibold"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs",
                        thread.unread ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {thread.lastSenderInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {thread.isStarred && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
                          {thread.unread && <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">{thread.timestamp}</span>
                      </div>
                      <h4 className={cn(
                        "text-sm mb-1 truncate",
                        thread.unread ? "font-semibold text-gray-900" : "text-gray-700"
                      )}>
                        {thread.subject}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="truncate">{thread.participants.join(', ')}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{thread.preview}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {thread.hasAttachment && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            <Paperclip className="w-2.5 h-2.5 mr-1" />
                            Attachment
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {thread.emailCount} {thread.emailCount === 1 ? 'email' : 'emails'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Detail View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedEmailThread ? (
            <>
              {/* Email Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-900">{selectedEmailThread.subject}</h2>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedEmailThread({...selectedEmailThread, isStarred: !selectedEmailThread.isStarred})}>
                            <Star className={cn(
                              "w-4 h-4",
                              selectedEmailThread.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                            )} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Star thread</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Reply className="w-4 h-4 mr-2" />
                          Reply to Thread
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Forward className="w-4 h-4 mr-2" />
                          Forward Thread
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pin className="w-4 h-4 mr-2" />
                          Pin Thread
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          Star Thread
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Filter className="w-4 h-4 mr-2" />
                          Filter Emails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Search className="w-4 h-4 mr-2" />
                          Search in Thread
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowEmailPDFPreview(true)}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive Thread
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Thread
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{selectedEmailThread.emailCount} messages</span>
                  <span>•</span>
                  <span>{selectedEmailThread.participants.join(', ')}</span>
                </div>
              </div>

              {/* Email Thread */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4 max-w-4xl">
                  {selectedEmails.map((email, index) => (
                    <Card key={email.id} className={cn(
                      "p-4 group",
                      email.isFromFirm ? "border-l-4 border-l-purple-500" : "border-l-4 border-l-gray-300"
                    )}>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={cn(
                            email.isFromFirm ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                          )}>
                            {email.fromInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <h4 className="font-semibold text-gray-900">{email.from}</h4>
                              <p className="text-xs text-gray-500">
                                To: {email.to.join(', ')}
                                {email.cc && email.cc.length > 0 && ` • Cc: ${email.cc.join(', ')}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 flex-shrink-0">{email.timestamp}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Reply className="w-4 h-4 mr-2" />
                                    Reply
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Forward className="w-4 h-4 mr-2" />
                                    Forward
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Text
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="w-4 h-4 mr-2" />
                                    Star Email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  {email.isFromFirm && (
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                  {!email.isFromFirm && (
                                    <DropdownMenuItem>
                                      <ShieldAlert className="w-4 h-4 mr-2" />
                                      Report as Spam
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {email.content}
                      </div>
                      {email.attachments && email.attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            {email.attachments.map((attachment, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs font-medium text-gray-700">{attachment.name}</p>
                                  <p className="text-[10px] text-gray-500">{attachment.size}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="border-gray-300"
                  />
                  <div className="relative">
                    <Textarea
                      placeholder="Type your reply..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="resize-none pr-20"
                      rows={4}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach file</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="w-4 h-4 mr-2" />
                        Forward
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select an email thread to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Chat Interface (Internal, External, Texting)
  return (
    <div className="flex h-[calc(100vh-280px)]">
      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Channel Header */}
        {selectedChannel && (
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {selectedChannel.type === 'client-discussion' && <Users className="w-5 h-5" />}
                    {selectedChannel.type === 'client' && <MessageSquare className="w-5 h-5" />}
                    {selectedChannel.type === 'text-message' && <Smartphone className="w-5 h-5" />}
                    {selectedChannel.type === 'email' && <Mail className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {selectedChannel.type === 'client-discussion' && `Team Discussion: ${project.name}`}
                      {selectedChannel.type === 'client' && project.name}
                      {selectedChannel.type === 'text-message' && project.name}
                      {selectedChannel.type === 'email' && selectedChannel.name}
                    </h3>
                    {selectedChannel.type === 'client-discussion' && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Internal
                      </Badge>
                    )}
                    {selectedChannel.type === 'client-discussion' && messageUrgency !== 'normal' && (
                      <Badge className={cn(
                        "text-xs",
                        messageUrgency === 'critical' && "bg-red-600 hover:bg-red-600 text-white",
                        messageUrgency === 'time-sensitive' && "bg-orange-600 hover:bg-orange-600 text-white",
                        messageUrgency === 'next-block' && "bg-yellow-600 hover:bg-yellow-600 text-white"
                      )}>
                        {messageUrgency === 'critical' && '🔴 Critical'}
                        {messageUrgency === 'time-sensitive' && '🟠 Time Sensitive'}
                        {messageUrgency === 'next-block' && '🟡 Next Work Block'}
                      </Badge>
                    )}
                    {selectedChannel.type === 'client' && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Client Chat
                      </Badge>
                    )}
                    {selectedChannel.type === 'text-message' && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        SMS
                      </Badge>
                    )}
                    {selectedChannel.type === 'email' && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Email
                      </Badge>
                    )}
                  </div>
                  {selectedChannel.type === 'client-discussion' && selectedChannel.participants && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Team: {selectedChannel.participants.join(', ')}
                    </p>
                  )}
                  {selectedChannel.type === 'client' && selectedChannel.participants && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedChannel.participants.join(', ')}
                    </p>
                  )}
                  {selectedChannel.phoneNumber && (
                    <p className="text-xs text-gray-500 mt-0.5">{selectedChannel.phoneNumber}</p>
                  )}
                  {selectedChannel.email && (
                    <p className="text-xs text-gray-500 mt-0.5">{selectedChannel.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          {!selectedChannel ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {channelMode === 'internal' && 'No internal discussions about this project'}
                  {channelMode === 'external' && 'No external communications for this project'}
                  {channelMode === 'texting' && 'No text messages for this project'}
                  {channelMode === 'email' && 'No email communications for this project'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {Object.entries(messagesByDate).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 group",
                          message.isCurrentUser && "flex-row-reverse"
                        )}
                      >
                        {/* Avatar - Always show */}
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={cn(
                            "text-xs",
                            message.isCurrentUser 
                              ? "bg-purple-100 text-purple-700" 
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {message.senderInitials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={cn("flex-1 max-w-2xl", message.isCurrentUser && "flex flex-col items-end")}>
                          {/* Sender Name - Always show, positioned based on sender */}
                          <div className={cn(
                            "flex items-center gap-2 mb-1",
                            message.isCurrentUser && "justify-end"
                          )}>
                            <span className="text-xs font-medium text-gray-700">{message.sender}</span>
                          </div>
                          
                          <div className="relative">
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2 border-l-4 shadow-sm",
                                message.isCurrentUser
                                  ? "bg-purple-50 border-l-purple-500"
                                  : "bg-blue-50 border-l-blue-400"
                              )}
                            >
                              {/* Urgency Badge for non-current user */}
                              {!message.isCurrentUser && message.urgency !== 'normal' && (
                                <div className="mb-2">
                                  {getUrgencyBadge(message.urgency)}
                                </div>
                              )}

                              {/* Assignment */}
                              {message.assignedTo && (
                                <div className="mb-2 flex items-center gap-1.5 text-xs bg-white/60 border border-purple-200 rounded px-2 py-1 w-fit">
                                  <Avatar className="w-4 h-4">
                                    <AvatarFallback className="bg-purple-100 text-purple-700 text-[8px]">
                                      {message.assignedToInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-purple-700 font-medium">Assigned to {message.assignedTo}</span>
                                </div>
                              )}
                              
                              {/* Pinned */}
                              {message.isPinned && (
                                <div className="mb-2 flex items-center gap-1.5 text-xs text-purple-700">
                                  <Pin className="w-3 h-3 fill-purple-700" />
                                  <span className="font-medium">Pinned</span>
                                </div>
                              )}
                              
                              {/* Message Content */}
                              <p className="text-sm text-gray-900 whitespace-pre-wrap mb-1">{message.content}</p>
                            
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-white/60 px-2 py-1 rounded">
                                      <Paperclip className="w-3 h-3" />
                                      <span>{att.name}</span>
                                      <span className="text-gray-400">({att.size})</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 flex-wrap">
                                  {message.reactions.map((reaction, idx) => (
                                    <button
                                      key={idx}
                                      className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs hover:border-purple-300 transition-colors"
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span className="text-gray-600">{reaction.count}</span>
                                    </button>
                                  ))}
                                  <button className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs hover:border-purple-300 transition-colors text-gray-400 hover:text-gray-600">
                                    <Smile className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {/* Timestamp & Read Receipt - Inside bubble, bottom right */}
                              <div className={cn(
                                "flex items-center gap-1.5 mt-1.5",
                                message.isCurrentUser ? "justify-end" : "justify-end"
                              )}>
                                {message.readBy && message.readBy.length > 0 && (
                                  <CheckCheck className="w-3 h-3 text-green-600" />
                                )}
                                <span className={cn(
                                  "text-[10px]",
                                  message.isCurrentUser ? "text-purple-600" : "text-blue-600"
                                )}>
                                  {message.timestamp}
                                </span>
                              </div>
                            </div>

                            {/* Message Actions Menu - Shows on Hover */}
                            <div className={cn(
                              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                              message.isCurrentUser ? "left-0 -translate-x-full -ml-2" : "right-0 translate-x-full mr-2"
                            )}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={message.isCurrentUser ? "end" : "start"} className="w-56">
                                  <DropdownMenuItem>
                                    <CheckSquare className="w-4 h-4 mr-2 text-purple-600" />
                                    Create Task
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                                    Assign to Someone
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Pin className="w-4 h-4 mr-2 text-yellow-600" />
                                    {message.isPinned ? 'Unpin Message' : 'Pin Message'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Forward className="w-4 h-4 mr-2 text-gray-600" />
                                    Forward Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2 text-gray-600" />
                                    Copy Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setPendingMessageId(message.id);
                                    setPendingUrgency('critical');
                                    setShowAssignmentDialog(true);
                                  }}>
                                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                                    Mark as Critical
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setPendingMessageId(message.id);
                                    setPendingUrgency('time-sensitive');
                                    setShowAssignmentDialog(true);
                                  }}>
                                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                    Mark as Time Sensitive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setPendingMessageId(message.id);
                                    setPendingUrgency('next-block');
                                    setShowAssignmentDialog(true);
                                  }}>
                                    <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                    Mark as Next Work Block
                                  </DropdownMenuItem>
                                  {message.urgency && message.urgency !== 'normal' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                                        Mark as Resolved
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        {selectedChannel && (
          <div className="border-t border-gray-200 bg-white">
            {/* Communication Mode Banner */}
            {channelMode === 'internal' && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-900">Internal Team Discussion: {project.name}</p>
                  <p className="text-[10px] text-blue-600">
                    {selectedChannel.participants 
                      ? `Team: ${selectedChannel.participants.join(', ')}` 
                      : 'This conversation is private and only visible to your team members'}
                  </p>
                </div>
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px]">Team Only</Badge>
              </div>
            )}
            {channelMode === 'external' && (
              <div className="px-4 py-2 bg-purple-50 border-b border-purple-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-900">Direct Client Communication: {project.name}</p>
                  <p className="text-[10px] text-purple-600">Messages sent here go directly to the client</p>
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[10px]">Client Visible</Badge>
              </div>
            )}
            {channelMode === 'texting' && (
              <div className="px-4 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-900">SMS Text Messages: {project.name}</p>
                  <p className="text-[10px] text-green-600">Sending to {selectedChannel.phoneNumber}</p>
                </div>
                <Badge className="bg-green-600 hover:bg-green-600 text-white text-[10px]">SMS</Badge>
              </div>
            )}
            
            {/* Quick Actions Bar - Urgency Buttons - Only for Internal Discussion */}
            {channelMode === 'internal' && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-2">
                <Button
                  variant={messageUrgency === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageUrgency(messageUrgency === 'critical' ? 'normal' : 'critical')}
                  className={cn(
                    "h-7 text-[11px]",
                    messageUrgency === 'critical' && "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Critical
                </Button>
                <Button
                  variant={messageUrgency === 'time-sensitive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageUrgency(messageUrgency === 'time-sensitive' ? 'normal' : 'time-sensitive')}
                  className={cn(
                    "h-7 text-[11px]",
                    messageUrgency === 'time-sensitive' && "bg-orange-600 hover:bg-orange-700 text-white"
                  )}
                >
                  <Clock className="w-3 h-3 mr-1.5" />
                  Time Sensitive
                </Button>
                <Button
                  variant={messageUrgency === 'next-block' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageUrgency(messageUrgency === 'next-block' ? 'normal' : 'next-block')}
                  className={cn(
                    "h-7 text-[11px]",
                    messageUrgency === 'next-block' && "bg-yellow-600 hover:bg-yellow-700 text-white"
                  )}
                >
                  <Clock className="w-3 h-3 mr-1.5" />
                  Next Work Block
                </Button>
              </div>
            )}

            {/* Enhanced Message Input */}
            <div className="p-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={
                      channelMode === 'texting' 
                        ? 'Type a text message...' 
                        : channelMode === 'email'
                        ? 'Type an email message...'
                        : 'Type a message...'
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="resize-none pr-20"
                    rows={3}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Paperclip className="w-4 h-4 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Smile className="w-4 h-4 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add emoji</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 self-end"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="assignment-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Assign {pendingUrgency === 'critical' ? 'Critical' : pendingUrgency === 'time-sensitive' ? 'Time Sensitive' : 'Next Work Block'} Message
            </DialogTitle>
            <DialogDescription id="assignment-description">
              This message requires immediate attention. Assign it to a team member who will be responsible for handling it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  // TODO: Update message with assignment
                  console.log(`Assigned to ${member.name} with urgency ${pendingUrgency}`);
                  setShowAssignmentDialog(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-100 text-purple-700 group-hover:bg-purple-200">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAssignmentDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email PDF Preview Dialog */}
      <EmailPDFPreviewDialog
        open={showEmailPDFPreview}
        onOpenChange={setShowEmailPDFPreview}
        subject={selectedEmailThread?.subject || ''}
        emails={getEmailsForThread(selectedEmailThread)}
      />
    </div>
  );
});

