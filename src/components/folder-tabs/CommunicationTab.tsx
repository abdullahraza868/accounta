import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Client } from '../../App';
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
  History,
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
import { CallbackDetailDialog } from '../dialogs/CallbackDetailDialog';
import { CallbackMessageDialog } from '../dialogs/CallbackMessageDialog';

type CommunicationTabProps = {
  client: Client;
};

type ChannelMode = 'internal' | 'external' | 'texting' | 'email' | 'callback-history';
type UrgencyLevel = 'normal' | 'next-block' | 'time-sensitive' | 'critical';
type CallbackPriority = 'low' | 'medium' | 'high';
type CallbackStatus = 'open' | 'not-reached' | 'completed';

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

type CallbackMessage = {
  id: string;
  clientName: string;
  scheduledDate: string;
  completionDate?: string;
  assignedBy: string;
  assignedByInitials: string;
  assignedTo?: string;
  assignedToInitials?: string;
  status: CallbackStatus;
  priority: CallbackPriority;
  message: string;
  phoneNumber?: string;
  createdAt: string;
};

export const CommunicationTab = forwardRef<any, CommunicationTabProps>(({ client }, ref) => {
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
  const [callbackStatusFilter, setCallbackStatusFilter] = useState<CallbackStatus | 'all'>('all');
  const [callbackPriorityFilter, setCallbackPriorityFilter] = useState<CallbackPriority | 'all'>('all');
  const [selectedCallback, setSelectedCallback] = useState<CallbackMessage | null>(null);
  const [showCallbackDetailDialog, setShowCallbackDetailDialog] = useState(false);
  const [showAddCallbackDialog, setShowAddCallbackDialog] = useState(false);

  // Get client name for display
  const clientName = client.type === 'Business' ? client.companyName : `${client.firstName} ${client.lastName}`;

  // Get client message bubble color based on type
  const getClientBubbleColor = () => {
    if (client.type === 'Business') {
      return 'bg-blue-50 border-l-blue-400';
    } else {
      return 'bg-green-50 border-l-green-400';
    }
  };

  // Team members for assignment
  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', initials: 'SJ', role: 'Senior Tax Accountant' },
    { id: '2', name: 'Mike Brown', initials: 'MB', role: 'Tax Manager' },
    { id: '3', name: 'Emily Davis', initials: 'ED', role: 'CPA' },
    { id: '4', name: 'Alex Wilson', initials: 'AW', role: 'Junior Accountant' },
    { id: '5', name: 'You', initials: 'SD', role: 'Account Owner' },
  ];

  // Mock channels filtered for this client
  const internalChannels: Channel[] = [
    {
      id: 'cd1',
      name: clientName,
      type: 'client-discussion',
      unreadCount: 2,
      lastMessage: 'Client prefers quarterly tax planning meetings',
      lastMessageTime: '1h',
      urgency: 'time-sensitive',
      participants: ['Sarah Johnson', 'Mike Brown', 'You'],
    },
  ];

  const externalChannels: Channel[] = [
    {
      id: 'ce1',
      name: clientName,
      type: 'client',
      unreadCount: 1,
      lastMessage: 'URGENT: I just received a notice from the IRS...',
      lastMessageTime: '30m',
      urgency: 'critical',
      participants: [clientName],
    },
  ];

  const textingChannels: Channel[] = [
    {
      id: 'sms1',
      name: clientName,
      type: 'text-message',
      unreadCount: 0,
      lastMessage: 'Thanks for the quick response',
      lastMessageTime: '2h',
      phoneNumber: client.phone,
    },
  ];

  const emailChannels: Channel[] = [
    {
      id: 'email1',
      name: clientName,
      type: 'email',
      unreadCount: 1,
      lastMessage: 'Re: Tax Document Request',
      lastMessageTime: '45m',
      email: client.email,
    },
  ];

  // Mock callback history for this client
  const callbackHistory: CallbackMessage[] = [
    {
      id: '1',
      clientName: clientName,
      scheduledDate: '2024-12-15',
      completionDate: '2024-12-15',
      assignedBy: 'Sarah Johnson',
      assignedByInitials: 'SJ',
      assignedTo: 'Mike Brown',
      assignedToInitials: 'MB',
      status: 'completed',
      priority: 'high',
      message: 'Client called regarding IRS notice. Needs immediate consultation about Form 1099 discrepancy. Very concerned about potential penalties.',
      phoneNumber: client.phone,
      createdAt: '2024-12-14 at 2:30 PM',
    },
    {
      id: '2',
      clientName: clientName,
      scheduledDate: '2024-12-18',
      assignedBy: 'You',
      assignedByInitials: 'ME',
      assignedTo: 'Emily Davis',
      assignedToInitials: 'ED',
      status: 'open',
      priority: 'medium',
      message: 'Follow up on Q4 estimated tax payment. Client mentioned they might have additional income to report.',
      phoneNumber: client.phone,
      createdAt: '2024-12-13 at 10:15 AM',
    },
    {
      id: '3',
      clientName: clientName,
      scheduledDate: '2024-12-12',
      assignedBy: 'Emily Davis',
      assignedByInitials: 'ED',
      status: 'not-reached',
      priority: 'low',
      message: 'Routine check-in about year-end tax planning. Left voicemail, client has not returned call yet.',
      phoneNumber: client.phone,
      createdAt: '2024-12-10 at 4:45 PM',
    },
  ];

  // Mock email threads - showing all firm communications with this client
  const emailThreads: EmailThread[] = [
    {
      id: 'thread1',
      subject: 'Tax Document Request - 2024 Filing',
      participants: ['You', clientName],
      lastSender: clientName,
      lastSenderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
      preview: 'One more thing - I noticed I may qualify for the home office deduction...',
      timestamp: '1:15 PM',
      date: 'Today',
      unread: true,
      hasAttachment: true,
      isStarred: false,
      emailCount: 4,
    },
    {
      id: 'thread2',
      subject: 'Q4 2024 Estimated Tax Payment Reminder',
      participants: ['Sarah Johnson', clientName],
      lastSender: 'Sarah Johnson',
      lastSenderInitials: 'SJ',
      preview: 'Just a friendly reminder that your Q4 estimated tax payment is due...',
      timestamp: 'Yesterday',
      date: 'Yesterday',
      unread: false,
      hasAttachment: false,
      isStarred: true,
      emailCount: 2,
    },
    {
      id: 'thread3',
      subject: 'Year-End Tax Planning Meeting Scheduled',
      participants: ['Mike Brown', clientName, 'You'],
      lastSender: 'Mike Brown',
      lastSenderInitials: 'MB',
      preview: 'I\'ve scheduled our year-end tax planning meeting for December 15th...',
      timestamp: '2 days ago',
      date: 'Oct 24',
      unread: false,
      hasAttachment: true,
      isStarred: false,
      emailCount: 5,
    },
    {
      id: 'thread4',
      subject: 'IRA Contribution Limits for 2024',
      participants: ['You', clientName],
      lastSender: 'You',
      lastSenderInitials: 'ME',
      preview: 'As we discussed, here are the updated IRA contribution limits for 2024...',
      timestamp: 'Oct 20',
      date: 'Oct 20',
      unread: false,
      hasAttachment: true,
      isStarred: false,
      emailCount: 3,
    },
    {
      id: 'thread5',
      subject: 'Re: Business Expense Clarification',
      participants: ['Sarah Johnson', clientName],
      lastSender: clientName,
      lastSenderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
      preview: 'Thank you for clarifying! That makes sense now.',
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
      // Internal team discussion about client
      return [
        {
          id: '1',
          sender: 'Sarah Johnson',
          senderInitials: 'SJ',
          content: `${clientName} mentioned they want to focus on tax optimization strategies for next year. Should we prepare a proposal?`,
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
          content: 'Good idea. I\'ll draft something up by EOD. We should also include retirement planning options.',
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
          content: 'IMPORTANT: Client has tight deadline for Q4 estimated tax payments. Need to review by Friday.',
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
      // Direct communication with client
      return [
        {
          id: '1',
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: 'Hi! I wanted to follow up on the tax documents I submitted last week. Have you had a chance to review them?',
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
          content: 'Yes, I\'ve reviewed everything. Looks great! I\'ll have your return ready for review by end of day tomorrow.',
          timestamp: '10:22 AM',
          date: 'Today',
          sentAt: 'Today at 10:22 AM',
          urgency: 'normal',
          isCurrentUser: true,
          readBy: [
            { userId: 'client', userName: clientName, userInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`, seenAt: '10:25 AM' }
          ],
        },
        {
          id: '3',
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: 'Perfect! Also, when can we schedule our next quarterly meeting?',
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
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: 'URGENT: I just received a notice from the IRS regarding my 2023 return. They\'re requesting additional documentation by Friday. Can we meet today to discuss this?',
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
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: 'Quick question - what time is our meeting tomorrow?',
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
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
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
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: 'Also, can you send me a copy of last year\'s return for my records?',
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
          content: `Hi ${client.firstName},\n\nI hope this email finds you well. I'm reaching out to request some additional documents needed to complete your 2024 tax return.\n\nPlease provide the following:\n• W2 forms from all employers\n• 1099 forms (if applicable)\n• Mortgage interest statements (1098)\n• Property tax statements\n• Charitable contribution receipts\n\nYou can upload these through the client portal or reply to this email with the attachments.\n\nPlease let me know if you have any questions.\n\nBest regards`,
          timestamp: '8:30 AM',
          date: 'Today',
          sentAt: 'Today at 8:30 AM',
          urgency: 'normal',
          isCurrentUser: true,
          attachments: [
            { name: 'Document_Checklist.pdf', type: 'PDF', size: '156 KB' }
          ],
          readBy: [
            { userId: 'client', userName: clientName, userInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`, seenAt: '9:15 AM' }
          ],
        },
        {
          id: '2',
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: `Hi,\n\nThank you for the checklist! I have uploaded all the required documents through the client portal this morning.\n\nI also attached my W2 from my second employer that I just received yesterday.\n\nPlease let me know if you need anything else or if there are any issues accessing the files.\n\nThanks!`,
          timestamp: '11:45 AM',
          date: 'Today',
          sentAt: 'Today at 11:45 AM',
          urgency: 'normal',
          attachments: [
            { name: 'W2_SecondEmployer_2024.pdf', type: 'PDF', size: '245 KB' }
          ],
          readBy: [
            { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '11:50 AM' }
          ],
        },
        {
          id: '3',
          sender: 'You',
          senderInitials: 'ME',
          content: `Perfect! I've received all the documents and everything looks complete.\n\nI'll start processing your return today and should have it ready for your review by end of day tomorrow.\n\nI'll send you a secure link to review and e-sign the return once it's ready.\n\nThanks for getting these to me so quickly!`,
          timestamp: '12:05 PM',
          date: 'Today',
          sentAt: 'Today at 12:05 PM',
          urgency: 'normal',
          isCurrentUser: true,
          readBy: [
            { userId: 'client', userName: clientName, userInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`, seenAt: '12:10 PM' }
          ],
        },
        {
          id: '4',
          sender: clientName,
          senderInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          content: `Wonderful! I appreciate your help with this.\n\nOne more thing - I noticed I may qualify for the home office deduction this year since I've been working from home. Should I provide any additional documentation for that?\n\nAlso, when would be a good time to schedule our quarterly tax planning meeting for next quarter?`,
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
          to: [clientName],
          subject: 'Tax Document Request - 2024 Filing',
          content: `Hi ${client.firstName},\n\nI hope this email finds you well. I'm reaching out to request some additional documents needed to complete your 2024 tax return.\n\nPlease provide the following:\n• W2 forms from all employers\n• 1099 forms (if applicable)\n• Mortgage interest statements (1098)\n• Property tax statements\n• Charitable contribution receipts\n\nYou can upload these through the client portal or reply to this email with the attachments.\n\nPlease let me know if you have any questions.\n\nBest regards`,
          timestamp: '8:30 AM',
          date: 'Today',
          attachments: [{ name: 'Document_Checklist.pdf', type: 'PDF', size: '156 KB' }],
          isFromFirm: true,
        },
        {
          id: 'e2',
          from: clientName,
          fromInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          to: ['You'],
          subject: 'Re: Tax Document Request - 2024 Filing',
          content: `Hi,\n\nThank you for the checklist! I have uploaded all the required documents through the client portal this morning.\n\nI also attached my W2 from my second employer that I just received yesterday.\n\nPlease let me know if you need anything else or if there are any issues accessing the files.\n\nThanks!`,
          timestamp: '11:45 AM',
          date: 'Today',
          attachments: [{ name: 'W2_SecondEmployer_2024.pdf', type: 'PDF', size: '245 KB' }],
          isFromFirm: false,
        },
        {
          id: 'e3',
          from: 'You',
          fromInitials: 'ME',
          to: [clientName],
          subject: 'Re: Tax Document Request - 2024 Filing',
          content: `Perfect! I've received all the documents and everything looks complete.\n\nI'll start processing your return today and should have it ready for your review by end of day tomorrow.\n\nI'll send you a secure link to review and e-sign the return once it's ready.\n\nThanks for getting these to me so quickly!`,
          timestamp: '12:05 PM',
          date: 'Today',
          attachments: [],
          isFromFirm: true,
        },
        {
          id: 'e4',
          from: clientName,
          fromInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          to: ['You'],
          subject: 'Re: Tax Document Request - 2024 Filing',
          content: `Wonderful! I appreciate your help with this.\n\nOne more thing - I noticed I may qualify for the home office deduction this year since I've been working from home. Should I provide any additional documentation for that?\n\nAlso, when would be a good time to schedule our quarterly tax planning meeting for next quarter?`,
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
          to: [clientName],
          subject: 'Q4 2024 Estimated Tax Payment Reminder',
          content: `Hi ${client.firstName},\n\nJust a friendly reminder that your Q4 estimated tax payment is due on January 15, 2025.\n\nBased on your current income projections, I recommend making a payment of approximately $8,500 to avoid any underpayment penalties.\n\nIf your income has changed significantly from what we projected, please let me know so we can adjust the recommendation.\n\nLet me know if you have any questions!\n\nBest,\nSarah Johnson\nSenior Tax Advisor`,
          timestamp: '9:30 AM',
          date: 'Yesterday',
          attachments: [],
          isFromFirm: true,
        },
        {
          id: 'e6',
          from: clientName,
          fromInitials: client.type === 'Business' ? (client.companyName?.substring(0, 2).toUpperCase() || 'CL') : `${client.firstName[0]}${client.lastName[0]}`,
          to: ['Sarah Johnson'],
          cc: ['You'],
          subject: 'Re: Q4 2024 Estimated Tax Payment Reminder',
          content: `Hi Sarah,\n\nThank you for the reminder! My income has been fairly consistent with our projections.\n\nI'll make the payment this week. Can you send me the payment voucher?\n\nThanks,\n${client.firstName}`,
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
          to: [clientName],
          cc: ['You'],
          subject: 'Year-End Tax Planning Meeting Scheduled',
          content: `Hi ${client.firstName},\n\nI've scheduled our year-end tax planning meeting for December 15th at 2:00 PM.\n\nIn this meeting, we'll review:\n• 2024 tax year summary\n• Tax-saving strategies for 2025\n• Retirement contribution recommendations\n• Any changes to tax law that may affect you\n\nI've attached an agenda for your review. Please let me know if there are any specific topics you'd like to discuss.\n\nLooking forward to our meeting!\n\nBest regards,\nMike Brown\nTax Partner`,
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

  // Filter callbacks
  const filteredCallbacks = callbackHistory.filter(cb => {
    if (callbackStatusFilter !== 'all' && cb.status !== callbackStatusFilter) return false;
    if (callbackPriorityFilter !== 'all' && cb.priority !== callbackPriorityFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: CallbackPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: CallbackStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'not-reached':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Render Callback History Interface
  if (channelMode === 'callback-history') {
    return (
      <div className="flex flex-col h-[calc(100vh-280px)] bg-white">
        {/* Header with Filters */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Callback History</h2>
            <Button
              size="sm"
              onClick={() => setShowAddCallbackDialog(true)}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Phone className="w-4 h-4 mr-2" />
              Add Message
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Status:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCallbackStatusFilter('all')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackStatusFilter === 'all'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setCallbackStatusFilter('open')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackStatusFilter === 'open'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Open
                </button>
                <button
                  onClick={() => setCallbackStatusFilter('not-reached')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackStatusFilter === 'not-reached'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Not Reached
                </button>
                <button
                  onClick={() => setCallbackStatusFilter('completed')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackStatusFilter === 'completed'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Priority:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCallbackPriorityFilter('all')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackPriorityFilter === 'all'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setCallbackPriorityFilter('low')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackPriorityFilter === 'low'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Low
                </button>
                <button
                  onClick={() => setCallbackPriorityFilter('medium')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackPriorityFilter === 'medium'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Medium
                </button>
                <button
                  onClick={() => setCallbackPriorityFilter('high')}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all border",
                    callbackPriorityFilter === 'high'
                      ? "bg-selected-light border-brand-light hover-brand"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  High
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Callback Cards */}
        <ScrollArea className="flex-1 px-6 py-4">
          {filteredCallbacks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No callback messages found</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCallbacks.map((callback) => (
                <Card key={callback.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side - Main Info */}
                    <div className="flex-1 space-y-3">
                      {/* Client and Status Row */}
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{callback.clientName}</h3>
                        <Badge className={cn("text-xs", getStatusColor(callback.status))}>
                          {callback.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={cn("text-xs", getPriorityColor(callback.priority))}>
                          {callback.priority}
                        </Badge>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-gray-700 line-clamp-2">{callback.message}</p>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Scheduled: {callback.scheduledDate}</span>
                        </div>
                        {callback.completionDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span>Completed: {callback.completionDate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>By: {callback.assignedBy}</span>
                        </div>
                        {callback.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>To: {callback.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCallback(callback);
                          setShowCallbackDetailDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit functionality
                          setShowAddCallbackDialog(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          // Delete functionality
                          if (confirm('Are you sure you want to delete this callback message?')) {
                            // Delete logic here
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

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
                    {selectedChannel.type === 'client' && (client.type === 'Business' ? <Building2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />)}
                    {selectedChannel.type === 'text-message' && <Smartphone className="w-5 h-5" />}
                    {selectedChannel.type === 'email' && <Mail className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {selectedChannel.type === 'client-discussion' && `Team Discussion: ${client.name}`}
                      {selectedChannel.type === 'client' && client.name}
                      {selectedChannel.type === 'text-message' && client.name}
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
                        {messageUrgency === 'next-block' && '🟡 Next Block'}
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
                  {channelMode === 'internal' && 'No internal discussions about this client'}
                  {channelMode === 'external' && 'No external communications with this client'}
                  {channelMode === 'texting' && 'No text messages with this client'}
                  {channelMode === 'email' && 'No email communications with this client'}
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
                              : client.type === 'Business'
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
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
                                  : client.type === 'Business'
                                    ? "bg-blue-50 border-l-blue-400"
                                    : "bg-green-50 border-l-green-400"
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
                                  message.isCurrentUser ? "text-purple-600" : client.type === 'Business' ? "text-blue-600" : "text-green-600"
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
                  <p className="text-xs font-medium text-blue-900">Internal Team Discussion: {client.name}</p>
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
                  <p className="text-xs font-medium text-purple-900">Direct Client Communication: {client.name}</p>
                  <p className="text-[10px] text-purple-600">Messages sent here go directly to the client</p>
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[10px]">Client Visible</Badge>
              </div>
            )}
            {channelMode === 'texting' && (
              <div className="px-4 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-900">SMS Text Messages: {client.name}</p>
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

      {/* Callback Detail Dialog */}
      <CallbackDetailDialog
        open={showCallbackDetailDialog}
        onOpenChange={setShowCallbackDetailDialog}
        callback={selectedCallback}
      />

      {/* Add Callback Dialog */}
      <CallbackMessageDialog
        open={showAddCallbackDialog}
        onOpenChange={setShowAddCallbackDialog}
      />
    </div>
  );
});
