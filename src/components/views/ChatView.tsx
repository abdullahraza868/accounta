import { useState } from 'react';
import { Resizable } from 're-resizable';
import { 
  Search, Plus, MessageCircle, Users, Briefcase, Building2, 
  MoreVertical, Clock, AlertCircle, Paperclip, Smile,
  Send, X, FileText, CheckSquare, User, Download, ChevronDown, Hash,
  ChevronRight, Trash2, Star, AtSign, MessageSquare, UserPlus, UsersRound, Phone,
  Pin, Forward, Zap, Image as ImageIcon, Code, Bold, Italic, Underline, Link, CheckCheck, MessagesSquare,
  Check, Eye, EyeOff, ShieldCheck, Copy, Calendar, Filter, ArrowLeft
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
import { Checkbox } from '../ui/checkbox';
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
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type UrgencyLevel = 'normal' | 'next-block' | 'time-sensitive' | 'critical';

type ReadReceipt = {
  userId: string;
  userName: string;
  userInitials: string;
  seenAt: string;
};

type AcknowledgmentRecord = {
  userId: string;
  userName: string;
  userInitials: string;
  acknowledgedAt: string;
};

type ResolutionRecord = {
  userId: string;
  userName: string;
  userInitials: string;
  resolvedAt: string;
};

type Channel = {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project' | 'client-discussion' | 'client' | 'consultant' | 'text-message';
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  urgency?: UrgencyLevel;
  participants?: string[];
  isOnline?: boolean;
  hasTitle?: boolean;
  memberCount?: number;
  isFavorited?: boolean;
  hasMention?: boolean;
  isResolved?: boolean;
  phoneNumber?: string;
  seenByCurrentUser?: boolean;
  seenAt?: string;
  acknowledgedByCurrentUser?: boolean;
  acknowledgedAt?: string;
};

type Message = {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  date: string; // e.g., "Today", "Yesterday", "Oct 24, 2025"
  urgency: UrgencyLevel;
  reactions?: { emoji: string; count: number }[];
  isCurrentUser?: boolean;
  attachments?: { name: string; type: string; size: string }[];
  isPinned?: boolean;
  readBy?: ReadReceipt[];
  acknowledgedBy?: AcknowledgmentRecord[];
  resolvedBy?: ResolutionRecord;
  sentAt: string;
  assignedTo?: string;
  assignedToInitials?: string;
};

type ChatViewProps = {
  onBack?: () => void;
};

type ChannelMode = 'internal' | 'external' | 'texting';
type ViewMode = 'messages' | 'files' | 'tasks' | 'pins' | 'critical' | 'time-sensitive' | 'next-block';

type UrgentMonitoringItem = {
  id: string;
  conversationId: string;
  recipientName: string;
  recipientInitials: string;
  message: string;
  type: 'critical' | 'time-sensitive';
  sentAt: string;
  status: 'pending' | 'seen' | 'acknowledged' | 'resolved';
  seenAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
};

export function ChatView({ onBack }: ChatViewProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageUrgency, setMessageUrgency] = useState<UrgencyLevel>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelMode, setChannelMode] = useState<ChannelMode>('internal');
  const [viewMode, setViewMode] = useState<ViewMode>('messages');
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [newMessageType, setNewMessageType] = useState<'direct' | 'group'>('direct');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isCatchupMode, setIsCatchupMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  // File filters
  const [fileUserFilter, setFileUserFilter] = useState<string>('all');
  const [fileDateFilter, setFileDateFilter] = useState<string>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  
  // Resizable sidebar
  const [sidebarWidth, setSidebarWidth] = useState(336);
  
  // Urgent monitoring
  const [showMonitoringPanel, setShowMonitoringPanel] = useState(false);
  
  // Assignment dialog
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [pendingUrgency, setPendingUrgency] = useState<UrgencyLevel>('normal');
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  
  // Collapse states
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [criticalCollapsed, setCriticalCollapsed] = useState(false);
  const [timeSensitiveCollapsed, setTimeSensitiveCollapsed] = useState(false);
  const [nextBlockCollapsed, setNextBlockCollapsed] = useState(false);
  const [directCollapsed, setDirectCollapsed] = useState(false);
  const [groupCollapsed, setGroupCollapsed] = useState(false);
  const [projectCollapsed, setProjectCollapsed] = useState(false);
  const [clientDiscussionCollapsed, setClientDiscussionCollapsed] = useState(false);
  const [externalDirectCollapsed, setExternalDirectCollapsed] = useState(false);
  const [externalGroupCollapsed, setExternalGroupCollapsed] = useState(false);
  const [externalChannelsCollapsed, setExternalChannelsCollapsed] = useState(false);
  const [externalClientsCollapsed, setExternalClientsCollapsed] = useState(false);

  // Track favorited and resolved channels
  const [favoritedChannels, setFavoritedChannels] = useState<Set<string>>(new Set(['d3', 'g1']));
  const [resolvedChannels, setResolvedChannels] = useState<Set<string>>(new Set());
  
  // Track acknowledged messages
  const [acknowledgedMessages, setAcknowledgedMessages] = useState<Set<string>>(new Set());

  // Mock team members for selection
  const teamMembers = [
    { id: 'tm1', name: 'Sarah Johnson', role: 'Senior Accountant', initials: 'SJ' },
    { id: 'tm2', name: 'Mike Brown', role: 'Tax Specialist', initials: 'MB' },
    { id: 'tm3', name: 'Emily Davis', role: 'Junior Accountant', initials: 'ED' },
    { id: 'tm4', name: 'Tom Wilson', role: 'Bookkeeper', initials: 'TW' },
    { id: 'tm5', name: 'Lisa Anderson', role: 'Payroll Manager', initials: 'LA' },
    { id: 'tm6', name: 'John Smith', role: 'CFO', initials: 'JS' },
    { id: 'tm7', name: 'Rachel Green', role: 'Accounts Payable', initials: 'RG' },
    { id: 'tm8', name: 'David Lee', role: 'Financial Analyst', initials: 'DL' },
    { id: 'tm9', name: 'Maria Garcia', role: 'Controller', initials: 'MG' },
    { id: 'tm10', name: 'James Taylor', role: 'Audit Manager', initials: 'JT' },
  ];

  // Filter members based on search
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      if (newMessageType === 'direct') {
        // For direct messages, only allow one selection
        newSelection.clear();
      }
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  // Reset dialog state when opening
  const handleDialogOpenChange = (open: boolean) => {
    setNewMessageDialogOpen(open);
    if (!open) {
      setSelectedMembers(new Set());
      setGroupName('');
      setMemberSearchQuery('');
    }
  };

  // Mock data
  const channels: Channel[] = [
    // Direct Messages
    {
      id: 'd1',
      name: 'Sarah Johnson',
      type: 'direct',
      unreadCount: 3,
      lastMessage: 'Can you review the tax documents?',
      lastMessageTime: '2m',
      urgency: 'time-sensitive',
      isOnline: true,
      hasMention: true,
      seenByCurrentUser: true,
      seenAt: '10:46 AM',
      acknowledgedByCurrentUser: true,
      acknowledgedAt: '10:47 AM',
    },
    {
      id: 'd2',
      name: 'Mike Brown',
      type: 'direct',
      unreadCount: 2,
      lastMessage: 'Thanks for the update!',
      lastMessageTime: '1h',
      isOnline: false,
    },
    {
      id: 'd3',
      name: 'Emily Davis',
      type: 'direct',
      unreadCount: 1,
      lastMessage: 'Meeting confirmed',
      lastMessageTime: '30m',
      isOnline: true,
    },
    {
      id: 'd4',
      name: 'Tom Wilson',
      type: 'direct',
      unreadCount: 5,
      lastMessage: 'Sounds good!',
      lastMessageTime: '2h',
      isOnline: true,
      hasMention: true,
    },
    {
      id: 'd5',
      name: 'Lisa Anderson',
      type: 'direct',
      unreadCount: 0,
      lastMessage: 'See you tomorrow',
      lastMessageTime: '4h',
      isOnline: false,
    },
    {
      id: 'd6',
      name: 'Robert Chen',
      type: 'direct',
      unreadCount: 1,
      lastMessage: 'Got it, will do',
      lastMessageTime: '1d',
      isOnline: false,
    },
    {
      id: 'd7',
      name: 'Jessica Martinez',
      type: 'direct',
      unreadCount: 0,
      lastMessage: 'All set!',
      lastMessageTime: '1d',
      isOnline: true,
    },
    {
      id: 'd8',
      name: 'David Lee',
      type: 'direct',
      unreadCount: 3,
      lastMessage: 'Perfect, thanks!',
      lastMessageTime: '2d',
      isOnline: false,
      hasMention: true,
    },

    // Group Chats
    {
      id: 'g1',
      name: 'Tax Team',
      type: 'group',
      unreadCount: 12,
      lastMessage: 'Q4 2024 review meeting tomorrow',
      lastMessageTime: '5m',
      urgency: 'next-block',
      participants: ['Sarah Johnson', 'Mike Brown', 'Emily Davis', 'You'],
      hasTitle: true,
      hasMention: true,
    },
    {
      id: 'g2',
      name: 'Sarah Johnson, Mike Brown, Tom Wilson',
      type: 'group',
      unreadCount: 4,
      lastMessage: 'All reconciliations complete',
      lastMessageTime: '3h',
      participants: ['Sarah Johnson', 'Mike Brown', 'Tom Wilson', 'You'],
      hasTitle: false,
    },
    {
      id: 'g3',
      name: 'Audit Team',
      type: 'group',
      unreadCount: 0,
      lastMessage: 'Great work everyone',
      lastMessageTime: '6h',
      participants: ['Emily Davis', 'Robert Chen', 'You'],
      hasTitle: true,
    },
    {
      id: 'g4',
      name: 'Payroll Processing',
      type: 'group',
      unreadCount: 2,
      lastMessage: 'All done for this month',
      lastMessageTime: '1d',
      participants: ['Tom Wilson', 'Jessica Martinez', 'You'],
      hasTitle: true,
    },
    {
      id: 'g5',
      name: 'Client Success Team',
      type: 'group',
      unreadCount: 0,
      lastMessage: 'Feedback looks positive',
      lastMessageTime: '2d',
      participants: ['Lisa Anderson', 'David Lee', 'Mike Brown', 'You'],
      hasTitle: true,
    },

    // Projects
    {
      id: 'p1',
      name: 'Q4 2024 Tax Prep',
      type: 'project',
      unreadCount: 15,
      lastMessage: 'Critical deadline approaching!',
      lastMessageTime: '10m',
      urgency: 'critical',
      memberCount: 8,
      participants: ['Sarah Johnson', 'Emily Davis', 'Mike Brown', 'Tom Wilson', 'Lisa Anderson', 'Robert Chen', 'Jessica Martinez', 'You'],
      hasMention: true,
    },
    {
      id: 'p2',
      name: 'Year-End Audit 2024',
      type: 'project',
      unreadCount: 0,
      lastMessage: 'Phase 1 complete',
      lastMessageTime: '1h',
      urgency: 'next-block',
      memberCount: 5,
      participants: ['Emily Davis', 'Robert Chen', 'David Lee', 'Jessica Martinez', 'You'],
    },
    {
      id: 'p3',
      name: 'Client Portal Rollout',
      type: 'project',
      unreadCount: 8,
      lastMessage: 'Beta testing starts next week',
      lastMessageTime: '2h',
      memberCount: 4,
      participants: ['Mike Brown', 'Tom Wilson', 'Jessica Martinez', 'You'],
      hasMention: true,
    },
    {
      id: 'p4',
      name: 'Compliance Updates 2025',
      type: 'project',
      unreadCount: 3,
      lastMessage: 'Documentation complete',
      lastMessageTime: '3d',
      memberCount: 3,
      participants: ['Lisa Anderson', 'Robert Chen', 'You'],
    },

    // Client Discussions (Internal team discussions about clients)
    {
      id: 'cd1',
      name: 'Troy Business Services',
      type: 'client-discussion',
      unreadCount: 0,
      lastMessage: 'Strategy meeting went well',
      lastMessageTime: '1h',
      participants: ['Sarah Johnson', 'Mike Brown', 'You'],
    },
    {
      id: 'cd2',
      name: 'Abacus 360',
      type: 'client-discussion',
      unreadCount: 1,
      lastMessage: 'Client prefers quarterly meetings',
      lastMessageTime: '2d',
      participants: ['Emily Davis', 'You'],
    },
    {
      id: 'cd3',
      name: 'Garcia Consulting',
      type: 'client-discussion',
      unreadCount: 0,
      lastMessage: 'Following up next week',
      lastMessageTime: '3d',
      participants: ['Tom Wilson', 'Lisa Anderson', 'You'],
    },
    {
      id: 'cd4',
      name: 'Peterson Industries',
      type: 'client-discussion',
      unreadCount: 2,
      lastMessage: 'Everything looks good',
      lastMessageTime: '4d',
      participants: ['Mike Brown', 'You'],
    },
    {
      id: 'cd5',
      name: 'Miller & Associates LLC',
      type: 'client-discussion',
      unreadCount: 0,
      lastMessage: 'Annual review scheduled',
      lastMessageTime: '5d',
      participants: ['Robert Chen', 'Emily Davis', 'You'],
    },

    // External Clients
    {
      id: 'ce1',
      name: 'Troy Business Services',
      type: 'client',
      unreadCount: 2,
      lastMessage: 'When can we schedule a call?',
      lastMessageTime: '15m',
      urgency: 'time-sensitive',
      participants: ['Marcus Troy'],
    },
    {
      id: 'ce2',
      name: 'Abacus 360',
      type: 'client',
      unreadCount: 1,
      lastMessage: 'Documents received, thanks!',
      lastMessageTime: '2d',
      participants: ['Jagruti Chico'],
    },
    {
      id: 'ce3',
      name: 'Samantha Garcia',
      type: 'client',
      unreadCount: 3,
      lastMessage: 'Perfect, see you then!',
      lastMessageTime: '1d',
      participants: ['Samantha Garcia'],
    },
    {
      id: 'ce4',
      name: 'Peterson Industries',
      type: 'client',
      unreadCount: 0,
      lastMessage: 'Looking forward to it',
      lastMessageTime: '3d',
      participants: ['James Peterson'],
    },
    {
      id: 'ce5',
      name: 'Miller & Associates LLC',
      type: 'client',
      unreadCount: 4,
      lastMessage: 'Thank you!',
      lastMessageTime: '1d',
      participants: ['Jennifer Miller'],
      hasMention: true,
    },

    // External Group Chats
    {
      id: 'eg1',
      name: 'Q4 Tax Planning Discussion',
      type: 'group',
      unreadCount: 3,
      lastMessage: 'Let me review and get back to you',
      lastMessageTime: '30m',
      participants: ['Marcus Troy', 'Jagruti Chico', 'Jennifer Miller'],
      memberCount: 3,
      hasTitle: true,
    },
    {
      id: 'eg2',
      name: 'Audit Coordination',
      type: 'group',
      unreadCount: 0,
      lastMessage: 'Perfect, thank you!',
      lastMessageTime: '2h',
      participants: ['James Peterson', 'Samantha Garcia'],
      memberCount: 2,
      hasTitle: true,
    },

    // External Consultants (Channels)
    {
      id: 'con1',
      name: 'legal-advisors',
      type: 'consultant',
      unreadCount: 2,
      lastMessage: 'Review complete',
      lastMessageTime: '1d',
      participants: ['John Smith'],
      hasTitle: true,
    },
    {
      id: 'con2',
      name: 'it-support',
      type: 'consultant',
      unreadCount: 0,
      lastMessage: 'System upgraded successfully',
      lastMessageTime: '2d',
      participants: ['Alex Kumar'],
      hasTitle: true,
    },
    {
      id: 'con3',
      name: 'marketing-consultants',
      type: 'consultant',
      unreadCount: 0,
      lastMessage: 'Campaign approved',
      lastMessageTime: '5d',
      participants: ['Maria Santos'],
      hasTitle: true,
    },

    // External Clients section (Business entities)
    {
      id: 'client1',
      name: 'Anderson Corp',
      type: 'client',
      unreadCount: 1,
      lastMessage: 'Quarterly review completed',
      lastMessageTime: '4h',
      participants: ['Robert Anderson', 'Sarah Lee'],
    },

    // Text Messages
    {
      id: 'sms1',
      name: 'Marcus Troy',
      type: 'text-message',
      unreadCount: 1,
      lastMessage: 'Thanks for the quick response',
      lastMessageTime: '5m',
      phoneNumber: '+1 (555) 123-4567',
    },
    {
      id: 'sms2',
      name: 'Samantha Garcia',
      type: 'text-message',
      unreadCount: 0,
      lastMessage: 'See you at 3pm',
      lastMessageTime: '2h',
      phoneNumber: '+1 (555) 234-5678',
    },
    {
      id: 'sms3',
      name: 'James Peterson',
      type: 'text-message',
      unreadCount: 2,
      lastMessage: 'Can you send the invoice?',
      lastMessageTime: '1d',
      phoneNumber: '+1 (555) 345-6789',
      hasMention: false,
    },
  ];

  // Mock files data
  const allFiles = [
    { id: '1', name: 'Q4_Tax_Summary.pdf', size: '2.4 MB', time: '10:48 AM', date: 'today', type: 'PDF', uploader: 'Sarah Johnson', uploaderId: 'm1' },
    { id: '2', name: 'Supporting_Docs.xlsx', size: '1.1 MB', time: '10:48 AM', date: 'today', type: 'Excel', uploader: 'Sarah Johnson', uploaderId: 'm1' },
    { id: '3', name: 'Client_Contract.pdf', size: '856 KB', time: '2:15 PM', date: 'yesterday', type: 'PDF', uploader: 'You', uploaderId: 'you' },
    { id: '4', name: 'Budget_2024.xlsx', size: '2.1 MB', time: 'Oct 23', date: 'week', type: 'Excel', uploader: 'Mike Brown', uploaderId: 'm2' },
    { id: '5', name: 'Payroll_Report.pdf', size: '1.8 MB', time: 'Oct 23', date: 'week', type: 'PDF', uploader: 'Emily Davis', uploaderId: 'm3' },
    { id: '6', name: 'Tax_Documents.zip', size: '5.2 MB', time: 'Oct 22', date: 'week', type: 'ZIP', uploader: 'Sarah Johnson', uploaderId: 'm1' },
    { id: '7', name: 'Client_Data.csv', size: '890 KB', time: 'Oct 21', date: 'week', type: 'CSV', uploader: 'Mike Brown', uploaderId: 'm2' },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      senderInitials: 'SJ',
      content: 'Can you review the tax documents I sent over? We need to finalize by EOD.',
      timestamp: '10:45 AM',
      date: 'Today',
      sentAt: 'Today at 10:45 AM',
      urgency: 'time-sensitive',
      readBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '10:46 AM' },
        { userId: 'mb', userName: 'Mike Brown', userInitials: 'MB', seenAt: '10:50 AM' }
      ],
      acknowledgedBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', acknowledgedAt: '10:47 AM' }
      ],
    },
    {
      id: 'critical-1',
      sender: 'Mike Brown',
      senderInitials: 'MB',
      content: 'URGENT: Client data breach detected in Peterson account. Need immediate action on security protocols.',
      timestamp: '9:15 AM',
      date: 'Today',
      sentAt: 'Today at 9:15 AM',
      urgency: 'critical',
      readBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '9:16 AM' }
      ],
      acknowledgedBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', acknowledgedAt: '9:17 AM' }
      ],
      resolvedBy: {
        userId: 'me',
        userName: 'You',
        userInitials: 'ME',
        resolvedAt: '10:30 AM'
      },
    },
    {
      id: 'critical-2',
      sender: 'Mike Brown',
      senderInitials: 'MB',
      content: 'Critical error in payroll calculations - needs fix before Friday processing.',
      timestamp: '8:30 AM',
      date: 'Today',
      sentAt: 'Today at 8:30 AM',
      urgency: 'critical',
      readBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '8:32 AM' }
      ],
      acknowledgedBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', acknowledgedAt: '8:35 AM' }
      ],
    },
    {
      id: '2',
      sender: 'You',
      senderInitials: 'ME',
      content: 'Yes, I\'ll take a look now. Give me 30 minutes.',
      timestamp: '10:47 AM',
      date: 'Today',
      sentAt: 'Today at 10:47 AM',
      urgency: 'normal',
      isCurrentUser: true,
      readBy: [
        { userId: 'sj', userName: 'Sarah Johnson', userInitials: 'SJ', seenAt: '10:47 AM' }
      ],
    },
    {
      id: '3',
      sender: 'Sarah Johnson',
      senderInitials: 'SJ',
      content: 'Perfect, thanks! Also attaching the supporting documents.',
      timestamp: '10:48 AM',
      date: 'Today',
      sentAt: 'Today at 10:48 AM',
      urgency: 'normal',
      attachments: [
        { name: 'Q4_Tax_Summary.pdf', type: 'PDF', size: '2.4 MB' },
        { name: 'Supporting_Docs.xlsx', type: 'Excel', size: '1.1 MB' },
      ],
      readBy: [
        { userId: 'me', userName: 'You', userInitials: 'ME', seenAt: '10:49 AM' }
      ],
    },
    {
      id: '4',
      sender: 'You',
      senderInitials: 'ME',
      content: 'Reviewed everything. Looks good to me! Just one minor question on line 47.',
      timestamp: '11:15 AM',
      date: 'Today',
      sentAt: 'Today at 11:15 AM',
      urgency: 'normal',
      isCurrentUser: true,
      reactions: [
        { emoji: '👍', count: 2 },
        { emoji: '✅', count: 1 },
      ],
      isPinned: true,
      readBy: [
        { userId: 'sj', userName: 'Sarah Johnson', userInitials: 'SJ', seenAt: '11:16 AM' }
      ],
    },
  ];

  // Mock urgent monitoring items - messages YOU sent that need monitoring
  const urgentMonitoringItems: UrgentMonitoringItem[] = [
    {
      id: 'um1',
      conversationId: 'd2',
      recipientName: 'Mike Brown',
      recipientInitials: 'MB',
      message: 'Please approve the vendor contract ASAP',
      type: 'critical',
      sentAt: '2 hours ago',
      status: 'pending',
    },
    {
      id: 'um2',
      conversationId: 'd4',
      recipientName: 'Tom Wilson',
      recipientInitials: 'TW',
      message: 'Need your input on client proposal by EOD',
      type: 'critical',
      sentAt: '45 mins ago',
      status: 'pending',
    },
    {
      id: 'um3',
      conversationId: 'd3',
      recipientName: 'Emily Davis',
      recipientInitials: 'ED',
      message: 'Staff meeting moved to 3pm today',
      type: 'time-sensitive',
      sentAt: '1 hour ago',
      status: 'pending',
    },
    {
      id: 'um4',
      conversationId: 'd6',
      recipientName: 'Robert Chen',
      recipientInitials: 'RC',
      message: 'Review the Q4 budget spreadsheet when you can',
      type: 'time-sensitive',
      sentAt: '3 hours ago',
      status: 'pending',
    },
    {
      id: 'um5',
      conversationId: 'd8',
      recipientName: 'David Lee',
      recipientInitials: 'DL',
      message: 'Deadline for audit docs is tomorrow morning',
      type: 'time-sensitive',
      sentAt: '4 hours ago',
      status: 'pending',
    },
    // Acknowledged/Seen items (not yet resolved)
    {
      id: 'um6',
      conversationId: 'd5',
      recipientName: 'Lisa Anderson',
      recipientInitials: 'LA',
      message: 'Payroll needs your signature by Friday',
      type: 'critical',
      sentAt: '1 day ago',
      status: 'acknowledged',
      acknowledgedAt: '1 day ago at 2:15 PM',
    },
    {
      id: 'um7',
      conversationId: 'd7',
      recipientName: 'Jessica Martinez',
      recipientInitials: 'JM',
      message: 'Client feedback survey is ready to send',
      type: 'time-sensitive',
      sentAt: '2 days ago',
      status: 'seen',
      seenAt: '2 days ago at 11:30 AM',
    },
    // Resolved items
    {
      id: 'um8',
      conversationId: 'd1',
      recipientName: 'Sarah Johnson',
      recipientInitials: 'SJ',
      message: 'Urgent: Client wants to reschedule the tax review meeting',
      type: 'critical',
      sentAt: '3 days ago',
      status: 'resolved',
      acknowledgedAt: '3 days ago at 9:45 AM',
      resolvedAt: '2 days ago at 4:30 PM',
    },
    {
      id: 'um9',
      conversationId: 'g2',
      recipientName: 'Q4 Planning Team',
      recipientInitials: 'Q4',
      message: 'Please review the budget proposal before Monday',
      type: 'time-sensitive',
      sentAt: '5 days ago',
      status: 'resolved',
      seenAt: '4 days ago at 10:00 AM',
      resolvedAt: '3 days ago at 2:00 PM',
    },
  ];

  // Calculate monitoring counts
  const criticalMonitoringCount = urgentMonitoringItems.filter(item => item.type === 'critical' && item.status === 'pending').length;
  const timeSensitiveMonitoringCount = urgentMonitoringItems.filter(item => item.type === 'time-sensitive' && item.status === 'pending').length;
  const totalMonitoringCount = criticalMonitoringCount + timeSensitiveMonitoringCount;

  // Get monitoring count for a specific conversation
  const getConversationMonitoringCount = (channelId: string) => {
    return urgentMonitoringItems.filter(item => item.conversationId === channelId && item.status === 'pending').length;
  };

  // Get monitoring count by urgency type for a specific conversation
  const getConversationMonitoringCountByType = (channelId: string, type: 'critical' | 'time-sensitive') => {
    return urgentMonitoringItems.filter(item => 
      item.conversationId === channelId && 
      item.type === type && 
      item.status === 'pending'
    ).length;
  };

  // Get the urgency level for messages YOU sent in this conversation
  const getSenderUrgency = (channelId: string): UrgencyLevel | undefined => {
    const pendingItems = urgentMonitoringItems.filter(item => item.conversationId === channelId && item.status === 'pending');
    if (pendingItems.length === 0) return undefined;
    
    // Return highest urgency level
    if (pendingItems.some(item => item.type === 'critical')) return 'critical';
    if (pendingItems.some(item => item.type === 'time-sensitive')) return 'time-sensitive';
    return undefined;
  };

  // Monitor panel tab state
  const [monitorTabView, setMonitorTabView] = useState<'pending' | 'all'>('pending');

  const toggleFavorite = (channelId: string) => {
    setFavoritedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const toggleResolved = (channelId: string) => {
    setResolvedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const acknowledgeMessage = (messageId: string) => {
    setAcknowledgedMessages(prev => {
      const newSet = new Set(prev);
      newSet.add(messageId);
      return newSet;
    });
  };

  const isExternal = selectedChannel && ['client', 'consultant', 'text-message'].includes(selectedChannel.type);

  // Get channels for current mode
  const filteredChannels = channels.filter(channel => {
    const isInternalChannel = ['direct', 'project', 'client-discussion'].includes(channel.type);
    const isInternalGroup = channel.type === 'group' && channel.id.startsWith('g');
    const isExternalGroup = channel.type === 'group' && channel.id.startsWith('eg');
    const isTextingChannel = channel.type === 'text-message';
    
    if (channelMode === 'internal') {
      return isInternalChannel || isInternalGroup;
    } else if (channelMode === 'texting') {
      return isTextingChannel;
    } else {
      return !isInternalChannel && !isInternalGroup && !isTextingChannel;
    }
  });

  // Catchup mode: filter to only channels needing attention
  const channelsNeedingAttention = filteredChannels.filter(c => c.unreadCount > 0 || c.hasMention);
  const catchupChannels = isCatchupMode ? channelsNeedingAttention : filteredChannels;

  // Sort function: @ mentions first, then by unread count
  const sortByPriority = (a: Channel, b: Channel) => {
    // @ mentions always come first
    if (a.hasMention && !b.hasMention) return -1;
    if (!a.hasMention && b.hasMention) return 1;
    
    // Then sort by unread count (higher first)
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    
    // Finally maintain original order
    return 0;
  };

  // Organize channels by urgency and favorites
  // Only show channels with urgency YOU RECEIVED (not ones you sent for monitoring)
  const criticalChannels = catchupChannels.filter(c => 
    c.urgency === 'critical' && 
    !resolvedChannels.has(c.id) && 
    !favoritedChannels.has(c.id)
  ).sort(sortByPriority);
  
  const timeSensitiveChannels = catchupChannels.filter(c => 
    c.urgency === 'time-sensitive' && 
    !resolvedChannels.has(c.id) && 
    !favoritedChannels.has(c.id) &&
    // Don't include if already in critical
    c.urgency !== 'critical'
  ).sort(sortByPriority);
  const nextBlockChannels = catchupChannels.filter(c => c.urgency === 'next-block' && !resolvedChannels.has(c.id) && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const favoriteChannels = catchupChannels.filter(c => favoritedChannels.has(c.id)).sort(sortByPriority);
  const directChannels = catchupChannels.filter(c => c.type === 'direct' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const groupChannels = catchupChannels.filter(c => c.type === 'group' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const projectChannels = catchupChannels.filter(c => c.type === 'project' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const clientDiscussionChannels = catchupChannels.filter(c => c.type === 'client-discussion' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  
  // External channel organization
  const externalDirectChannels = catchupChannels.filter(c => c.type === 'client' && !c.urgency && !favoritedChannels.has(c.id) && c.participants && c.participants.length === 1).sort(sortByPriority);
  const externalGroupChannels = catchupChannels.filter(c => c.type === 'group' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const consultantChannels = catchupChannels.filter(c => c.type === 'consultant' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);
  const externalClientsChannels = catchupChannels.filter(c => c.type === 'client' && !c.urgency && !favoritedChannels.has(c.id) && (!c.participants || c.participants.length > 1)).sort(sortByPriority);
  
  const textMessageChannels = catchupChannels.filter(c => c.type === 'text-message' && !c.urgency && !favoritedChannels.has(c.id)).sort(sortByPriority);

  // Calculate total unread and channels needing attention
  const totalUnread = filteredChannels.reduce((sum, channel) => sum + channel.unreadCount, 0);
  const totalNeedingAttention = channelsNeedingAttention.length;

  // File filtering
  const filteredFiles = allFiles.filter(file => {
    const userMatch = fileUserFilter === 'all' || file.uploaderId === fileUserFilter;
    const dateMatch = fileDateFilter === 'all' || file.date === fileDateFilter;
    return userMatch && dateMatch;
  });

  const filesToday = filteredFiles.filter(f => f.date === 'today');
  const filesYesterday = filteredFiles.filter(f => f.date === 'yesterday');
  const filesThisWeek = filteredFiles.filter(f => f.date === 'week');

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'group':
        return <Users className="w-3 h-3" />;
      case 'project':
        return <Hash className="w-3 h-3" />;
      case 'client-discussion':
        return <MessagesSquare className="w-3 h-3" />;
      case 'client':
        return <Building2 className="w-3 h-3" />;
      case 'consultant':
        return <User className="w-3 h-3" />;
      case 'text-message':
        return <Phone className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const renderChannelButton = (channel: Channel, showMonitoringIcon: boolean = false) => {
    const displayNames = channel.participants?.slice(0, 3).join(', ') || '';
    const overflow = (channel.participants?.length || 0) - 3;
    const isFavorited = favoritedChannels.has(channel.id);
    const hasGroupMembers = channel.type === 'group' && channel.participants && channel.participants.length > 0;
    const senderUrgency = getSenderUrgency(channel.id);
    const isSenderUrgent = senderUrgency !== undefined;

    const buttonContent = (
      <div
        key={channel.id}
        className="group relative"
      >
        <button
          onClick={() => {
            setSelectedChannel(channel);
            setViewMode('messages');
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1 rounded transition-colors text-left',
            selectedChannel?.id === channel.id
              ? 'bg-purple-100 dark:bg-purple-900/40 text-gray-900 dark:text-gray-100'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
          )}
        >
          {channel.type === 'direct' ? (
            <div className="relative flex-shrink-0">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                  {channel.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {channel.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
              )}
            </div>
          ) : channel.type === 'text-message' ? (
            <div className="relative flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative flex-shrink-0">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-white text-[10px]",
                channel.type === 'group' && "bg-blue-500",
                channel.type === 'project' && "bg-purple-500",
                channel.type === 'client-discussion' && "bg-gray-500",
                channel.type === 'client' && "bg-orange-500",
                channel.type === 'consultant' && "bg-indigo-500"
              )}>
                {getChannelIcon(channel.type)}
              </div>
              {channel.type === 'group' && channel.participants && channel.participants.length > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <span className="text-[8px] text-gray-700 dark:text-gray-300 font-semibold">
                    {channel.participants.length}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] truncate block leading-tight">
                {channel.hasTitle && channel.type === 'group' ? (
                  channel.name
                ) : channel.type === 'group' ? (
                  <>
                    {displayNames}
                    {overflow > 0 && <span className="text-gray-500"> +{overflow}</span>}
                  </>
                ) : channel.type === 'project' ? (
                  channel.name
                ) : (
                  channel.name
                )}
              </span>
              {/* Seen/Acknowledged indicators for urgent messages */}
              {channel.urgency && channel.urgency !== 'normal' && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {channel.seenByCurrentUser ? (
                    channel.acknowledgedByCurrentUser ? (
                      <ShieldCheck className="w-3 h-3 text-green-600" title="Acknowledged" />
                    ) : (
                      <Eye className="w-3 h-3 text-blue-600" title="Seen" />
                    )
                  ) : (
                    <EyeOff className={cn(
                      "w-3 h-3 animate-pulse",
                      channel.urgency === 'critical' && "text-red-600",
                      channel.urgency === 'time-sensitive' && "text-orange-600",
                      channel.urgency === 'next-block' && "text-yellow-600"
                    )} title="Not yet seen" />
                  )}
                </div>
              )}
            </div>
            {/* Seen/acknowledged timestamp */}
            {channel.urgency && channel.urgency !== 'normal' && channel.seenByCurrentUser && (
              <div className="text-[10px] text-gray-500 mt-0.5">
                {channel.acknowledgedByCurrentUser ? (
                  <span className="text-green-600">Acknowledged {channel.acknowledgedAt}</span>
                ) : (
                  <span className="text-blue-600">Seen {channel.seenAt}</span>
                )}
              </div>
            )}
          </div>

          {/* Badges container */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-2">
            {/* Red monitoring icon - only in Critical/Time-Sensitive sections for sender urgency */}
            {showMonitoringIcon && isSenderUrgent && (
              <div className="bg-red-600 text-white text-[10px] h-4 w-4 flex items-center justify-center flex-shrink-0 rounded font-semibold">
                <Eye className="w-2.5 h-2.5" />
              </div>
            )}
            {/* Blue @ mention badge - don't show if this is sender urgency (not a mention) */}
            {channel.hasMention === true && !isSenderUrgent && (
              <div className="bg-blue-600 text-white text-[10px] h-4 w-4 flex items-center justify-center flex-shrink-0 rounded font-semibold">
                @
              </div>
            )}
            {/* Red unread count badge */}
            {channel.unreadCount > 0 && (
              <div className="bg-red-600 text-white text-[10px] h-4 w-4 flex items-center justify-center flex-shrink-0 rounded-full font-semibold">
                {channel.unreadCount}
              </div>
            )}
          </div>
        </button>

        {/* Star icon for favoriting */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(channel.id);
          }}
          className={cn(
            "absolute right-14 top-1/2 -translate-y-1/2 p-0.5 rounded transition-all z-10",
            isFavorited ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Star className={cn(
            "w-3.5 h-3.5",
            isFavorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
          )} />
        </button>

        {/* Menu for urgent conversations */}
        {channel.urgency && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 rounded transition-all z-10 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toggleResolved(channel.id)}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark as resolved
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggleFavorite(channel.id)}>
                <Star className="w-4 h-4 mr-2" />
                {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );

    // Wrap with tooltip if it's a group with members
    if (hasGroupMembers) {
      return (
        <TooltipProvider key={channel.id}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-800 text-white p-2 max-w-xs">
              <div className="text-[11px]">
                <div className="font-semibold mb-1">Group Members ({channel.participants!.length})</div>
                <div className="text-gray-300 dark:text-gray-400">
                  {channel.participants!.join(', ')}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  const renderSection = (
    title: string,
    channels: Channel[],
    collapsed: boolean,
    setCollapsed: (value: boolean) => void,
    icon?: React.ReactNode,
    iconColor?: string,
    showDivider?: boolean,
    isUrgent?: boolean,
    onAdd?: () => void
  ) => {
    if (channels.length === 0) return null;
    
    // Show monitoring icon only in CRITICAL and TIME SENSITIVE sections
    const showMonitoringIcon = title === 'CRITICAL' || title === 'TIME SENSITIVE';
    
    // Calculate total unread count for this section
    const totalUnread = channels.reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);

    return (
      <div className={cn(
        "mb-3 rounded-lg transition-all",
        isUrgent && title === 'CRITICAL' && "bg-gradient-to-r from-red-100 to-red-50 p-2 border-2 border-red-300 shadow-md",
        isUrgent && title === 'TIME SENSITIVE' && "bg-orange-50/50 p-2",
        isUrgent && title === 'NEXT WORK BLOCK' && "bg-yellow-50/50 p-2"
      )}>
        {showDivider && <div className="border-t border-gray-200 mb-3" />}
        <Collapsible open={!collapsed} onOpenChange={(open) => setCollapsed(!open)}>
          <div className="flex items-center gap-1">
            <CollapsibleTrigger className="flex-1 flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors group">
              <ChevronRight className={cn("w-3 h-3 transition-transform flex-shrink-0", !collapsed && "rotate-90")} />
              {icon && <span className={iconColor}>{icon}</span>}
              <span className={cn(
                "text-[11px] uppercase tracking-wide flex-1 font-semibold",
                title === 'CRITICAL' && "text-red-700"
              )}>
                {title}
              </span>
              {collapsed && totalUnread > 0 && (
                <span className="text-[10px] font-semibold h-4 min-w-[16px] px-1.5 flex items-center justify-center rounded-full bg-purple-600 text-white">
                  {totalUnread}
                </span>
              )}
            </CollapsibleTrigger>
            {onAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors mr-1"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          <CollapsibleContent className="space-y-0.5 mt-1">
            {channels.map(channel => renderChannelButton(channel, showMonitoringIcon))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Column - Messages List */}
      <Resizable
        size={{ width: sidebarWidth, height: '100%' }}
        onResizeStop={(e, direction, ref, d) => {
          setSidebarWidth(sidebarWidth + d.width);
        }}
        minWidth={240}
        maxWidth={600}
        enable={{ right: true }}
        handleStyles={{
          right: {
            width: '4px',
            right: '-2px',
            cursor: 'col-resize',
            background: 'transparent',
            transition: 'background 0.2s',
          }
        }}
        handleClasses={{
          right: 'hover:bg-purple-300/50'
        }}
      >
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Conversations Header */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMonitoringPanel(false)}
                className="text-gray-900 hover:text-purple-600 transition-colors"
              >
                <h2>Conversations</h2>
              </button>
              {totalUnread > 0 && (
                <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <Dialog open={newMessageDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" aria-describedby="new-message-description">
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription id="new-message-description">
                    Start a new conversation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant={newMessageType === 'direct' ? 'default' : 'outline'}
                      onClick={() => {
                        setNewMessageType('direct');
                        setSelectedMembers(new Set());
                      }}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Direct Message
                    </Button>
                    <Button
                      variant={newMessageType === 'group' ? 'default' : 'outline'}
                      onClick={() => {
                        setNewMessageType('group');
                        setSelectedMembers(new Set());
                      }}
                      className="flex-1"
                    >
                      <UsersRound className="w-4 h-4 mr-2" />
                      Group Chat
                    </Button>
                  </div>

                  {newMessageType === 'group' && (
                    <div className="space-y-2">
                      <Label>Group name (optional)</Label>
                      <Input 
                        placeholder="Enter group name..." 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      {newMessageType === 'direct' ? 'Select person' : `Select members ${selectedMembers.size > 0 ? `(${selectedMembers.size})` : ''}`}
                    </Label>
                    <Input 
                      placeholder="Search team members..." 
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-64 border rounded-md">
                      <div className="p-2 space-y-1">
                        {filteredMembers.length > 0 ? (
                          filteredMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => toggleMemberSelection(member.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors text-left",
                                selectedMembers.has(member.id) && "bg-purple-50 hover:bg-purple-100"
                              )}
                            >
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[11px]">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-gray-900 truncate">{member.name}</p>
                                <p className="text-[11px] text-gray-500 truncate">{member.role}</p>
                              </div>
                              <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                selectedMembers.has(member.id) 
                                  ? "bg-purple-600 border-purple-600" 
                                  : "border-gray-300"
                              )}>
                                {selectedMembers.has(member.id) && (
                                  <Check className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 text-[13px]">
                            No members found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleDialogOpenChange(false)}
                      disabled={selectedMembers.size === 0}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Catchup */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-[13px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Button
              variant={isCatchupMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsCatchupMode(!isCatchupMode)}
              className={cn(
                "h-8 px-2.5 text-[11px] font-medium flex-shrink-0 relative",
                isCatchupMode && "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              Catchup
              {!isCatchupMode && totalNeedingAttention > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-semibold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                  {totalNeedingAttention}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Channels List */}
        <div className={cn(
          "flex-1 overflow-y-auto transition-colors",
          isCatchupMode && "bg-teal-50/30 dark:bg-teal-900/10"
        )}>
          {showMonitoringPanel ? (
            /* Monitoring Panel View */
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-gray-900 dark:text-gray-100">Track Critical Messages</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMonitoringPanel(false)}
                    className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Monitor urgent messages you sent</p>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setMonitorTabView('pending')}
                  className={cn(
                    "flex-1 px-4 py-2 text-[13px] font-medium transition-colors border-b-2",
                    monitorTabView === 'pending'
                      ? 'border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  Pending
                  {totalMonitoringCount > 0 && (
                    <span className="ml-1.5 bg-purple-600 text-white text-[10px] font-semibold h-4 min-w-[16px] px-1 inline-flex items-center justify-center rounded-full">
                      {totalMonitoringCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setMonitorTabView('all')}
                  className={cn(
                    "flex-1 px-4 py-2 text-[13px] font-medium transition-colors border-b-2",
                    monitorTabView === 'all'
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  All
                  <span className="ml-1.5 text-[10px] text-gray-500">
                    ({urgentMonitoringItems.length})
                  </span>
                </button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {monitorTabView === 'pending' ? (
                    <>
                      {/* Critical Section */}
                      {criticalMonitoringCount > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 px-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <h4 className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Critical - Awaiting Acknowledgment</h4>
                            <Badge className="bg-red-600 text-white text-[9px] h-3.5 px-1.5">{criticalMonitoringCount}</Badge>
                          </div>
                          <div className="space-y-2">
                            {urgentMonitoringItems.filter(item => item.type === 'critical' && item.status === 'pending').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              // Jump to conversation
                              const conversation = channels.find(c => c.id === item.conversationId);
                              if (conversation) {
                                setSelectedChannel(conversation);
                                setViewMode('messages');
                                setShowMonitoringPanel(false);
                              }
                            }}
                            className="w-full text-left p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[9px]">
                                  {item.recipientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-gray-900 truncate">{item.recipientName}</p>
                                <p className="text-[10px] text-gray-500">Sent {item.sentAt}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 line-clamp-2 mb-2">{item.message}</p>
                            <div className="flex items-center gap-1 text-[10px] text-red-600">
                              <EyeOff className="w-3 h-3 animate-pulse" />
                              <span>Not acknowledged</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time-Sensitive Section */}
                  {timeSensitiveMonitoringCount > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <h4 className="text-[11px] font-semibold text-orange-700 uppercase tracking-wide">Time-Sensitive - Awaiting View</h4>
                        <Badge className="bg-orange-600 text-white text-[9px] h-3.5 px-1.5">{timeSensitiveMonitoringCount}</Badge>
                      </div>
                      <div className="space-y-2">
                        {urgentMonitoringItems.filter(item => item.type === 'time-sensitive' && item.status === 'pending').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              // Jump to conversation
                              const conversation = channels.find(c => c.id === item.conversationId);
                              if (conversation) {
                                setSelectedChannel(conversation);
                                setViewMode('messages');
                                setShowMonitoringPanel(false);
                              }
                            }}
                            className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[9px]">
                                  {item.recipientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-gray-900 truncate">{item.recipientName}</p>
                                <p className="text-[10px] text-gray-500">Sent {item.sentAt}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 line-clamp-2 mb-2">{item.message}</p>
                            <div className="flex items-center gap-1 text-[10px] text-orange-600">
                              <EyeOff className="w-3 h-3 animate-pulse" />
                              <span>Not seen</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State for Pending */}
                  {criticalMonitoringCount === 0 && timeSensitiveMonitoringCount === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-[13px]">No urgent messages to monitor</p>
                      <p className="text-[11px] text-gray-400 mt-1">All caught up!</p>
                    </div>
                  )}
                </>
              ) : (
                /* All Tab */
                <>
                  {/* Pending Section */}
                  {urgentMonitoringItems.filter(item => item.status === 'pending').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h4 className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Pending</h4>
                        <Badge className="bg-red-600 text-white text-[9px] h-3.5 px-1.5">
                          {urgentMonitoringItems.filter(item => item.status === 'pending').length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {urgentMonitoringItems.filter(item => item.status === 'pending').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              const conversation = channels.find(c => c.id === item.conversationId);
                              if (conversation) {
                                setSelectedChannel(conversation);
                                setViewMode('messages');
                                setShowMonitoringPanel(false);
                              }
                            }}
                            className={cn(
                              "w-full text-left p-3 border rounded-lg transition-colors",
                              item.type === 'critical'
                                ? 'bg-red-50 hover:bg-red-100 border-red-200'
                                : 'bg-orange-50 hover:bg-orange-100 border-orange-200'
                            )}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[9px]">
                                  {item.recipientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {item.type === 'critical' && <AlertCircle className="w-3 h-3 text-red-600" />}
                                  {item.type === 'time-sensitive' && <Clock className="w-3 h-3 text-orange-600" />}
                                  <p className="text-[12px] font-semibold text-gray-900 truncate">{item.recipientName}</p>
                                </div>
                                <p className="text-[10px] text-gray-500">Sent {item.sentAt}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 line-clamp-2 mb-2">{item.message}</p>
                            <div className={cn(
                              "flex items-center gap-1 text-[10px]",
                              item.type === 'critical' ? 'text-red-600' : 'text-orange-600'
                            )}>
                              <EyeOff className="w-3 h-3 animate-pulse" />
                              <span>{item.type === 'critical' ? 'Not acknowledged' : 'Not seen'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acknowledged/Seen Section */}
                  {urgentMonitoringItems.filter(item => item.status === 'acknowledged' || item.status === 'seen').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Acknowledged/Seen</h4>
                        <Badge className="bg-blue-600 text-white text-[9px] h-3.5 px-1.5">
                          {urgentMonitoringItems.filter(item => item.status === 'acknowledged' || item.status === 'seen').length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {urgentMonitoringItems.filter(item => item.status === 'acknowledged' || item.status === 'seen').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              const conversation = channels.find(c => c.id === item.conversationId);
                              if (conversation) {
                                setSelectedChannel(conversation);
                                setViewMode('messages');
                                setShowMonitoringPanel(false);
                              }
                            }}
                            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[9px]">
                                  {item.recipientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {item.type === 'critical' && <AlertCircle className="w-3 h-3 text-gray-500" />}
                                  {item.type === 'time-sensitive' && <Clock className="w-3 h-3 text-gray-500" />}
                                  <p className="text-[12px] font-semibold text-gray-900 truncate">{item.recipientName}</p>
                                </div>
                                <p className="text-[10px] text-gray-500">Sent {item.sentAt}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 line-clamp-2 mb-2">{item.message}</p>
                            <div className="flex items-center gap-1 text-[10px] text-blue-600">
                              <Eye className="w-3 h-3" />
                              <span>{item.status === 'acknowledged' ? 'Acknowledged' : 'Seen'} • {item.acknowledgedAt || item.seenAt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolved Section */}
                  {urgentMonitoringItems.filter(item => item.status === 'resolved').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <CheckCheck className="w-4 h-4 text-teal-600" />
                        <h4 className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">Resolved</h4>
                        <Badge className="bg-teal-600 text-white text-[9px] h-3.5 px-1.5">
                          {urgentMonitoringItems.filter(item => item.status === 'resolved').length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {urgentMonitoringItems.filter(item => item.status === 'resolved').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              const conversation = channels.find(c => c.id === item.conversationId);
                              if (conversation) {
                                setSelectedChannel(conversation);
                                setViewMode('messages');
                                setShowMonitoringPanel(false);
                              }
                            }}
                            className="w-full text-left p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors opacity-75"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[9px]">
                                  {item.recipientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {item.type === 'critical' && <AlertCircle className="w-3 h-3 text-gray-400" />}
                                  {item.type === 'time-sensitive' && <Clock className="w-3 h-3 text-gray-400" />}
                                  <p className="text-[12px] font-semibold text-gray-900 truncate">{item.recipientName}</p>
                                </div>
                                <p className="text-[10px] text-gray-500">Sent {item.sentAt}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 line-clamp-2 mb-2">{item.message}</p>
                            <div className="flex items-center gap-1 text-[10px] text-teal-600">
                              <CheckCheck className="w-3 h-3" />
                              <span>Resolved • {item.resolvedAt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
          ) : (
          <div className="p-2">
            {/* Catchup Mode Indicator */}
            {isCatchupMode && (
              <div className="mb-3 px-2 py-2 bg-teal-600 text-white rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Catchup Mode
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCatchupMode(false)}
                    className="h-5 px-1.5 text-[10px] text-white hover:bg-teal-700 hover:text-white"
                  >
                    Exit
                  </Button>
                </div>
                <p className="text-[10px] opacity-90">
                  {totalNeedingAttention} conversation{totalNeedingAttention !== 1 ? 's' : ''} need{totalNeedingAttention === 1 ? 's' : ''} attention
                </p>
              </div>
            )}
            
            {/* Mode Switcher + Indicator (only when not in catchup mode) */}
            {!isCatchupMode && (
              <div className="mb-3 space-y-2">
                {/* Mode Toggle */}
                <div className="flex items-center gap-0.5 bg-gradient-to-br from-gray-100 to-gray-50 p-0.5 rounded-lg">
                  <button
                    onClick={() => setChannelMode('internal')}
                    className={cn(
                      'flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200 text-center',
                      channelMode === 'internal'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Internal
                  </button>
                  <button
                    onClick={() => setChannelMode('external')}
                    className={cn(
                      'flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200 text-center',
                      channelMode === 'external'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    External
                  </button>
                  <button
                    onClick={() => setChannelMode('texting')}
                    className={cn(
                      'flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200 text-center',
                      channelMode === 'texting'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Texting
                  </button>
                </div>
                
                {/* Mode Indicator */}
                {channelMode === 'internal' && (
                  <div className="px-2 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-center">
                    <p className="text-[10px] text-purple-700 font-medium uppercase tracking-wide">
                      Internal Team Communication
                    </p>
                  </div>
                )}
                {channelMode === 'external' && (
                  <div className="px-2 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-center">
                    <p className="text-[10px] text-orange-700 font-medium uppercase tracking-wide">
                      External - Professional Mode
                    </p>
                  </div>
                )}
                {channelMode === 'texting' && (
                  <div className="px-2 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-[10px] text-blue-700 font-medium uppercase tracking-wide flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3" />
                      SMS Text Messages
                    </p>
                  </div>
                )}
                
                {/* Track Critical Button */}
                <Button
                  variant={showMonitoringPanel ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMonitoringPanel(!showMonitoringPanel)}
                  className={cn(
                    'w-full h-auto px-2.5 py-1.5 text-[11px] font-medium',
                    totalMonitoringCount > 0 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse'
                      : showMonitoringPanel 
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  )}
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track Critical</span>
                    {totalMonitoringCount > 0 && (
                      <span className="ml-1 text-[10px] font-semibold h-4 w-4 flex items-center justify-center rounded-full bg-white text-red-600">
                        {totalMonitoringCount}
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            )}

            {/* Empty state for catchup mode */}
            {isCatchupMode && totalNeedingAttention === 0 && (
              <div className="text-center py-12">
                <CheckCheck className="w-12 h-12 mx-auto mb-3 text-teal-600" />
                <p className="text-gray-900 font-medium mb-1">All caught up!</p>
                <p className="text-[13px] text-gray-500">
                  No conversations need your attention right now.
                </p>
              </div>
            )}
            {/* Critical */}
            {renderSection(
              'CRITICAL',
              criticalChannels,
              criticalCollapsed,
              setCriticalCollapsed,
              <AlertCircle className="w-3 h-3" />,
              'text-red-600',
              false,
              true
            )}

            {/* Time Sensitive */}
            {renderSection(
              'TIME SENSITIVE',
              timeSensitiveChannels,
              timeSensitiveCollapsed,
              setTimeSensitiveCollapsed,
              <Clock className="w-3 h-3" />,
              'text-orange-600',
              false,
              true
            )}

            {/* Next Work Block */}
            {renderSection(
              'NEXT WORK BLOCK',
              nextBlockChannels,
              nextBlockCollapsed,
              setNextBlockCollapsed,
              <Clock className="w-3 h-3" />,
              'text-orange-500',
              false,
              true
            )}

            {/* Favorites */}
            {renderSection(
              'FAVORITES',
              favoriteChannels,
              favoritesCollapsed,
              setFavoritesCollapsed,
              <Star className="w-3 h-3" />,
              'text-yellow-500'
            )}

            {/* Direct Messages */}
            {channelMode === 'internal' && renderSection(
              'DIRECT MESSAGES',
              directChannels,
              directCollapsed,
              setDirectCollapsed,
              <MessageCircle className="w-3 h-3" />,
              'text-gray-500',
              true,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* Group Chats */}
            {channelMode === 'internal' && renderSection(
              'GROUP CHATS',
              groupChannels,
              groupCollapsed,
              setGroupCollapsed,
              <Users className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('group');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* Channels */}
            {channelMode === 'internal' && renderSection(
              'CHANNELS',
              projectChannels,
              projectCollapsed,
              setProjectCollapsed,
              <Hash className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* Client Discussions */}
            {channelMode === 'internal' && renderSection(
              'CLIENT DISCUSSIONS',
              clientDiscussionChannels,
              clientDiscussionCollapsed,
              setClientDiscussionCollapsed,
              <MessagesSquare className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* External Direct Messages */}
            {channelMode === 'external' && renderSection(
              'DIRECT MESSAGES',
              externalDirectChannels,
              externalDirectCollapsed,
              setExternalDirectCollapsed,
              <MessageCircle className="w-3 h-3" />,
              'text-gray-500',
              true,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* External Group Messages */}
            {channelMode === 'external' && renderSection(
              'GROUP CHATS',
              externalGroupChannels,
              externalGroupCollapsed,
              setExternalGroupCollapsed,
              <Users className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('group');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* External Channels */}
            {channelMode === 'external' && renderSection(
              'CHANNELS',
              consultantChannels,
              externalChannelsCollapsed,
              setExternalChannelsCollapsed,
              <Hash className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* External Clients */}
            {channelMode === 'external' && renderSection(
              'CLIENTS',
              externalClientsChannels,
              externalClientsCollapsed,
              setExternalClientsCollapsed,
              <Building2 className="w-3 h-3" />,
              'text-gray-500',
              false,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}

            {/* Text Messages */}
            {channelMode === 'texting' && renderSection(
              'TEXT MESSAGES',
              textMessageChannels,
              false,
              () => {},
              <Phone className="w-3 h-3" />,
              'text-gray-500',
              true,
              false,
              () => {
                setNewMessageType('direct');
                setNewMessageDialogOpen(true);
              }
            )}
          </div>
          )}
        </div>
        </div>
      </Resizable>

      {/* Middle Column - Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedChannel.type === 'direct' || selectedChannel.type === 'text-message' ? (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[11px]">
                        {selectedChannel.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0",
                      selectedChannel.type === 'group' && "bg-blue-500",
                      selectedChannel.type === 'project' && "bg-purple-500",
                      selectedChannel.type === 'client-discussion' && "bg-gray-500",
                      selectedChannel.type === 'client' && "bg-orange-500",
                      selectedChannel.type === 'consultant' && "bg-indigo-500"
                    )}>
                      {getChannelIcon(selectedChannel.type)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-gray-900 truncate">{selectedChannel.name}</h3>
                    {selectedChannel.phoneNumber && (
                      <p className="text-[11px] text-gray-500">{selectedChannel.phoneNumber}</p>
                    )}
                  </div>
                  {isExternal && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] flex-shrink-0">
                      {selectedChannel.type === 'text-message' ? 'SMS' : 'External'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedChannel.participants && selectedChannel.participants.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowParticipants(!showParticipants)}
                      className="h-8 px-3 text-[13px] text-gray-600"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      {selectedChannel.memberCount || selectedChannel.participants.length}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Sub-navigation */}
              <div className="px-4 flex items-center gap-1 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('messages')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors",
                    viewMode === 'messages' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Messages
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('files')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors",
                    viewMode === 'files' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Files
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('tasks')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors",
                    viewMode === 'tasks' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Tasks
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('pins')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors",
                    viewMode === 'pins' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Pins
                </Button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('critical')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors relative",
                    viewMode === 'critical' 
                      ? 'border-red-600 text-red-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  Critical
                  {(() => {
                    const criticalCount = selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'critical') : 0;
                    if (criticalCount > 0) {
                      return (
                        <span className="ml-1.5 bg-red-600 text-white text-[10px] font-semibold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                          {criticalCount}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('time-sensitive')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors relative",
                    viewMode === 'time-sensitive' 
                      ? 'border-orange-600 text-orange-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Time Sensitive
                  {(() => {
                    const timeSensitiveCount = selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'time-sensitive') : 0;
                    if (timeSensitiveCount > 0) {
                      return (
                        <span className="ml-1.5 bg-orange-600 text-white text-[10px] font-semibold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                          {timeSensitiveCount}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('next-block')}
                  className={cn(
                    "h-9 px-3 text-[13px] rounded-none border-b-2 transition-colors",
                    viewMode === 'next-block' 
                      ? 'border-yellow-600 text-yellow-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Next Block
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {viewMode === 'messages' ? (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-6">
                  <div className="space-y-4">
                    {mockMessages.map((message, index) => {
                      // Show date header if first message or date changed
                      const showDateHeader = index === 0 || message.date !== mockMessages[index - 1].date;
                      
                      return (
                        <div key={message.id}>
                          {showDateHeader && (
                            <div className="flex items-center justify-center my-4">
                              <div className="px-3 py-1 bg-gray-100 rounded-full text-[11px] text-gray-600 font-medium">
                                {message.date}
                              </div>
                            </div>
                          )}
                          <div
                            className={cn(
                              'flex gap-3 group',
                              message.isCurrentUser && 'flex-row-reverse'
                            )}
                          >
                        {!message.isCurrentUser && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                              {message.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn('flex-1 max-w-2xl', message.isCurrentUser && 'flex flex-col items-end')}>
                          {!message.isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] text-gray-900">{message.sender}</span>
                              <span className="text-[11px] text-gray-500">{message.timestamp}</span>
                              {message.urgency !== 'normal' && (
                                <Badge className={cn(
                                  "text-[9px] h-4 px-1.5",
                                  message.urgency === 'critical' && "bg-red-600 text-white",
                                  message.urgency === 'time-sensitive' && "bg-orange-600 text-white",
                                  message.urgency === 'next-block' && "bg-yellow-600 text-white"
                                )}>
                                  {message.urgency === 'critical' && 'Critical'}
                                  {message.urgency === 'time-sensitive' && 'Time Sensitive'}
                                  {message.urgency === 'next-block' && 'Next Block'}
                                </Badge>
                              )}
                              {message.isPinned && (
                                <Pin className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                              )}
                            </div>
                          )}
                          
                          {message.assignedTo && (
                            <div className="mb-1.5 flex items-center gap-1.5 text-xs bg-purple-50 border border-purple-200 rounded px-2 py-1 w-fit">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-[8px]">
                                  {message.assignedToInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-purple-700 font-medium">Assigned to {message.assignedTo}</span>
                            </div>
                          )}
                          
                          <div className="relative">
                            <div className={cn(
                              'rounded-lg px-3 py-2 text-[13px]',
                              message.isCurrentUser
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            )}>
                              <p>{message.content}</p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                                      <Paperclip className="w-3 h-3" />
                                      <span className="text-[11px] flex-1">{attachment.name}</span>
                                      <span className="text-[10px] opacity-70">{attachment.size}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Message menu */}
                            <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
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
                                    Pin Message
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
                                      <DropdownMenuItem onClick={() => selectedChannel && toggleResolved(selectedChannel.id)}>
                                        <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                                        Mark as Resolved
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {message.isCurrentUser && (
                            <span className="text-[11px] text-gray-500 mt-1">{message.timestamp}</span>
                          )}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {message.reactions.map((reaction, idx) => (
                                <button
                                  key={idx}
                                  className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[11px] transition-colors"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-gray-600">{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Read Receipts for urgent messages */}
                          {message.urgency && message.urgency !== 'normal' && message.readBy && message.readBy.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-[11px] space-y-1">
                              <div className="flex items-center gap-1 text-gray-600 mb-1.5">
                                <Eye className="w-3 h-3" />
                                <span className="font-semibold">Read by:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {message.readBy.map((receipt, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200">
                                    <Avatar className="w-4 h-4">
                                      <AvatarFallback className="bg-blue-500 text-white text-[8px]">
                                        {receipt.userInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-700">{receipt.userName}</span>
                                    <span className="text-gray-500 text-[10px]">{receipt.seenAt}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Acknowledgment status */}
                              {message.acknowledgedBy && message.acknowledgedBy.length > 0 && (
                                <>
                                  <div className="flex items-center gap-1 text-green-600 mt-2 mb-1.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span className="font-semibold">Acknowledged by:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {message.acknowledgedBy.map((ack, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded border border-green-200">
                                        <Avatar className="w-4 h-4">
                                          <AvatarFallback className="bg-green-600 text-white text-[8px]">
                                            {ack.userInitials}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-green-700">{ack.userName}</span>
                                        <span className="text-green-600 text-[10px]">{ack.acknowledgedAt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                              
                              {/* Resolution status */}
                              {message.resolvedBy && (
                                <>
                                  <div className="flex items-center gap-1 text-purple-600 mt-2 mb-1.5">
                                    <CheckCheck className="w-3 h-3" />
                                    <span className="font-semibold">Resolved by:</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                    <Avatar className="w-4 h-4">
                                      <AvatarFallback className="bg-purple-600 text-white text-[8px]">
                                        {message.resolvedBy.userInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-purple-700">{message.resolvedBy.userName}</span>
                                    <span className="text-purple-600 text-[10px]">{message.resolvedBy.resolvedAt}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Acknowledge button for urgent messages */}
                          {!message.isCurrentUser && message.urgency && message.urgency !== 'normal' && 
                           !acknowledgedMessages.has(message.id) && 
                           !message.acknowledgedBy?.some(ack => ack.userId === 'me') && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                onClick={() => acknowledgeMessage(message.id)}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px]"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Acknowledge
                              </Button>
                            </div>
                          )}
                          
                          {/* Audit Trail for critical/time-sensitive messages */}
                          {message.urgency && (message.urgency === 'critical' || message.urgency === 'time-sensitive') && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-[10px] border-l-2 border-blue-400">
                              <div className="font-semibold text-blue-900 mb-1.5">Timeline</div>
                              <div className="space-y-1 text-blue-800">
                                <div className="flex items-start gap-1.5">
                                  <Send className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                  <span>Sent by {message.sender} at {message.sentAt}</span>
                                </div>
                                {message.readBy && message.readBy.length > 0 && (
                                  <div className="flex items-start gap-1.5">
                                    <Eye className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                    <span>First seen by {message.readBy[0].userName} at {message.readBy[0].seenAt}</span>
                                  </div>
                                )}
                                {message.acknowledgedBy && message.acknowledgedBy.length > 0 && (
                                  <div className="flex items-start gap-1.5">
                                    <ShieldCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-green-700" />
                                    <span className="text-green-700">Acknowledged by {message.acknowledgedBy[0].userName} at {message.acknowledgedBy[0].acknowledgedAt}</span>
                                  </div>
                                )}
                                {message.resolvedBy && (
                                  <div className="flex items-start gap-1.5">
                                    <CheckCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-purple-700" />
                                    <span className="text-purple-700">Resolved by {message.resolvedBy.userName} at {message.resolvedBy.resolvedAt}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Quick Actions Bar */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
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

                {/* Enhanced Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex-shrink-0">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      {/* Formatting toolbar */}
                      <div className="flex items-center gap-1 mb-1.5 pb-1.5 border-b border-gray-100">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Bold className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Italic className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Underline className="w-3.5 h-3.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-1" />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Link className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Code className="w-3.5 h-3.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 mx-1" />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Paperclip className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                          <Smile className="w-3.5 h-3.5" />
                        </Button>
                        <div className="flex-1" />
                        {messageUrgency !== 'normal' && (
                          <Badge className={cn(
                            "text-[10px] h-5 px-2",
                            messageUrgency === 'critical' && "bg-red-600 text-white",
                            messageUrgency === 'time-sensitive' && "bg-orange-600 text-white",
                            messageUrgency === 'next-block' && "bg-yellow-600 text-white"
                          )}>
                            {messageUrgency === 'critical' && 'Critical'}
                            {messageUrgency === 'time-sensitive' && 'Time Sensitive'}
                            {messageUrgency === 'next-block' && 'Next Block'}
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        placeholder={isExternal ? "Message (external - be professional)..." : "Type your message..."}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                      />
                    </div>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white self-end"
                      disabled={!messageText.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : viewMode === 'files' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">Shared Files</h3>
                  </div>
                  
                  {/* Search Files */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-[13px] bg-gray-50 border-gray-200"
                    />
                    {fileSearchQuery && (
                      <button
                        onClick={() => setFileSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Today */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <h4 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">Today</h4>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Q4_Tax_Summary.pdf', size: '2.4 MB', time: '10:48 AM', type: 'PDF', uploader: 'Sarah Johnson' },
                        { name: 'Supporting_Docs.xlsx', size: '1.1 MB', time: '10:48 AM', type: 'Excel', uploader: 'Sarah Johnson' },
                      ].filter(file => 
                        fileSearchQuery === '' || 
                        file.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
                        file.uploader.toLowerCase().includes(fileSearchQuery.toLowerCase())
                      ).map((file, idx) => (
                        <Card key={idx} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-gray-900 truncate">{file.name}</p>
                              <p className="text-[11px] text-gray-500">{file.size} • {file.uploader} • {file.time}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Yesterday */}
                  {(() => {
                    const yesterdayFiles = [
                      { name: 'Client_Contract.pdf', size: '856 KB', time: '2:15 PM', type: 'PDF', uploader: 'You' }
                    ].filter(file => 
                      fileSearchQuery === '' || 
                      file.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
                      file.uploader.toLowerCase().includes(fileSearchQuery.toLowerCase())
                    );
                    
                    if (yesterdayFiles.length === 0) return null;
                    
                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <h4 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">Yesterday</h4>
                        </div>
                        <div className="space-y-2">
                          {yesterdayFiles.map((file, idx) => (
                            <Card key={idx} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-gray-900 truncate">{file.name}</p>
                                  <p className="text-[11px] text-gray-500">{file.size} • {file.uploader} • {file.time}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* This Week */}
                  {(() => {
                    const weekFiles = [
                      { name: 'Budget_2024.xlsx', size: '2.1 MB', time: 'Oct 23', type: 'Excel', uploader: 'Mike Brown' },
                      { name: 'Payroll_Report.pdf', size: '1.8 MB', time: 'Oct 23', type: 'PDF', uploader: 'Emily Davis' },
                      { name: 'Tax_Documents.zip', size: '5.2 MB', time: 'Oct 22', type: 'ZIP', uploader: 'Sarah Johnson' },
                      { name: 'Client_Data.csv', size: '890 KB', time: 'Oct 21', type: 'CSV', uploader: 'Mike Brown' },
                    ].filter(file => 
                      fileSearchQuery === '' || 
                      file.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
                      file.uploader.toLowerCase().includes(fileSearchQuery.toLowerCase())
                    );
                    
                    if (weekFiles.length === 0) return null;
                    
                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <h4 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">This Week</h4>
                        </div>
                        <div className="space-y-2">
                          {weekFiles.map((file, idx) => (
                            <Card key={idx} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-gray-900 truncate">{file.name}</p>
                                  <p className="text-[11px] text-gray-500">{file.size} • {file.uploader} • {file.time}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </ScrollArea>
            ) : viewMode === 'tasks' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Tasks</h3>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-[12px]">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      New Task
                    </Button>
                  </div>
                  
                  {/* Overdue */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <h4 className="text-[12px] font-semibold text-red-700 uppercase tracking-wide">Overdue</h4>
                      <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">1</Badge>
                    </div>
                    <Card className="p-3 border-l-4 border-l-red-600">
                      <div className="flex items-start gap-3">
                        <Checkbox className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[13px] text-gray-900 font-medium">Complete client audit review</p>
                            <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5 flex-shrink-0">Critical</Badge>
                          </div>
                          <p className="text-[12px] text-gray-600 mb-2">Review and sign off on Q4 audit documents for Anderson Corp</p>
                          <div className="flex items-center flex-wrap gap-3 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Sarah Johnson</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-red-600" />
                              <span className="text-red-600">Yesterday</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>Tax Returns 2024</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Today */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <h4 className="text-[12px] font-semibold text-orange-700 uppercase tracking-wide">Due Today</h4>
                      <Badge className="bg-orange-600 text-white text-[10px] h-4 px-1.5">2</Badge>
                    </div>
                    <div className="space-y-2">
                      <Card className="p-3 border-l-4 border-l-orange-600">
                        <div className="flex items-start gap-3">
                          <Checkbox className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-[13px] text-gray-900 font-medium">Review tax documents</p>
                              <Badge className="bg-orange-600 text-white text-[10px] h-4 px-1.5 flex-shrink-0">High</Badge>
                            </div>
                            <p className="text-[12px] text-gray-600 mb-2">Review Q4 tax summary and supporting documents</p>
                            <div className="flex items-center flex-wrap gap-3 text-[11px] text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>You</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Today at 5:00 PM</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <span>Client Reviews</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 border-l-4 border-l-purple-600">
                        <div className="flex items-start gap-3">
                          <Checkbox className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-[13px] text-gray-900 font-medium">Send invoice to client</p>
                              <Badge className="bg-purple-600 text-white text-[10px] h-4 px-1.5 flex-shrink-0">Normal</Badge>
                            </div>
                            <p className="text-[12px] text-gray-600 mb-2">Prepare and send October billing invoice</p>
                            <div className="flex items-center flex-wrap gap-3 text-[11px] text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>Mike Brown</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Today at 6:00 PM</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <span>Billing</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Upcoming */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h4 className="text-[12px] font-semibold text-blue-700 uppercase tracking-wide">Upcoming</h4>
                      <Badge className="bg-blue-600 text-white text-[10px] h-4 px-1.5">1</Badge>
                    </div>
                    <Card className="p-3 border-l-4 border-l-blue-600">
                      <div className="flex items-start gap-3">
                        <Checkbox className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[13px] text-gray-900 font-medium">Submit Q4 summary</p>
                            <Badge className="bg-orange-600 text-white text-[10px] h-4 px-1.5 flex-shrink-0">High</Badge>
                          </div>
                          <p className="text-[12px] text-gray-600 mb-2">Compile and submit quarterly financial summary</p>
                          <div className="flex items-center flex-wrap gap-3 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Sarah Johnson</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Tomorrow at 12:00 PM</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>Quarterly Reports</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Completed */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCheck className="w-4 h-4 text-green-600" />
                      <h4 className="text-[12px] font-semibold text-green-700 uppercase tracking-wide">Completed</h4>
                      <Badge className="bg-green-600 text-white text-[10px] h-4 px-1.5">1</Badge>
                    </div>
                    <Card className="p-3 border-l-4 border-l-green-600 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Checkbox checked className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[13px] text-gray-500 line-through font-medium">Client meeting prep</p>
                            <Badge className="bg-gray-400 text-white text-[10px] h-4 px-1.5 flex-shrink-0">Normal</Badge>
                          </div>
                          <p className="text-[12px] text-gray-500 mb-2 line-through">Prepare presentation for quarterly review meeting</p>
                          <div className="flex items-center flex-wrap gap-3 text-[11px] text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Mike Brown</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">Completed Oct 24</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>Client Meetings</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            ) : viewMode === 'pins' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Pinned Messages</h3>
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                          ME
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] text-gray-900">You</span>
                          <span className="text-[11px] text-gray-500">11:15 AM</span>
                          <Pin className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                        </div>
                        <p className="text-[13px] text-gray-700">
                          Reviewed everything. Looks good to me! Just one minor question on line 47.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            ) : viewMode === 'critical' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Critical Messages</h3>
                    <Badge className="bg-red-600 text-white">
                      {mockMessages.filter(m => m.urgency === 'critical').length + 
                       (selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'critical') : 0)}
                    </Badge>
                  </div>
                  
                  {/* Messages YOU sent (pending acknowledgment) */}
                  {(() => {
                    const sentItems = selectedChannel 
                      ? urgentMonitoringItems.filter(item => 
                          item.conversationId === selectedChannel.id && 
                          item.type === 'critical' && 
                          item.status === 'pending'
                        )
                      : [];
                    
                    if (sentItems.length > 0) {
                      return (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Send className="w-4 h-4 text-red-600" />
                            <h4 className="text-[12px] font-semibold text-red-700 uppercase tracking-wide">Awaiting Acknowledgment</h4>
                            <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">{sentItems.length}</Badge>
                          </div>
                          <div className="space-y-2">
                            {sentItems.map((item) => (
                              <Card key={item.id} className="p-4 border-l-4 border-l-red-600 bg-red-50/30">
                                <div className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                                      {item.recipientInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-[13px] text-gray-900 font-medium">To: {item.recipientName}</span>
                                      <span className="text-[11px] text-gray-500">Sent {item.sentAt}</span>
                                      <Badge className="bg-red-600 text-white text-[9px] h-4 px-1.5">Critical</Badge>
                                    </div>
                                    <p className="text-[13px] text-gray-700 mb-2">{item.message}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-red-600">
                                      <EyeOff className="w-3 h-3 animate-pulse" />
                                      <span>Not yet acknowledged</span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Messages RECEIVED */}
                  {mockMessages.filter(m => m.urgency === 'critical').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Download className="w-4 h-4 text-red-600" />
                        <h4 className="text-[12px] font-semibold text-red-700 uppercase tracking-wide">Received</h4>
                        <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">
                          {mockMessages.filter(m => m.urgency === 'critical').length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {mockMessages.filter(m => m.urgency === 'critical').map((message) => (
                          <Card key={message.id} className="p-4 border-l-4 border-l-red-600">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                              {message.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[13px] text-gray-900">{message.sender}</span>
                              <span className="text-[11px] text-gray-500">{message.timestamp}</span>
                              <Badge className="bg-red-600 text-white text-[9px] h-4 px-1.5">
                                Critical
                              </Badge>
                            </div>
                            <p className="text-[13px] text-gray-700 mb-3">{message.content}</p>
                            
                            {/* Acknowledge button */}
                            {!message.isCurrentUser && !acknowledgedMessages.has(message.id) && 
                             !message.acknowledgedBy?.some(ack => ack.userId === 'me') && (
                              <Button
                                size="sm"
                                onClick={() => acknowledgeMessage(message.id)}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] mb-3"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
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
                                Pin Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="w-4 h-4 mr-2 text-gray-600" />
                                Forward Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                                Keep as Critical
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                Change to Time Sensitive
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                Change to Next Block
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Audit Trail */}
                        <div className="mt-3 p-2 bg-blue-50 rounded text-[10px] border-l-2 border-blue-400">
                          <div className="font-semibold text-blue-900 mb-1.5">Timeline</div>
                          <div className="space-y-1 text-blue-800">
                            <div className="flex items-start gap-1.5">
                              <Send className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                              <span>Sent by {message.sender} at {message.sentAt}</span>
                            </div>
                            {message.readBy && message.readBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Eye className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                <span>First seen by {message.readBy[0].userName} at {message.readBy[0].seenAt}</span>
                              </div>
                            )}
                            {message.acknowledgedBy && message.acknowledgedBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <ShieldCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-green-700" />
                                <span className="text-green-700">Acknowledged by {message.acknowledgedBy[0].userName} at {message.acknowledgedBy[0].acknowledgedAt}</span>
                              </div>
                            )}
                            {message.resolvedBy && (
                              <div className="flex items-start gap-1.5">
                                <CheckCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-purple-700" />
                                <span className="text-purple-700">Resolved by {message.resolvedBy.userName} at {message.resolvedBy.resolvedAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {mockMessages.filter(m => m.urgency === 'critical').length === 0 && 
                   (selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'critical') : 0) === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-[13px]">No critical messages</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : viewMode === 'time-sensitive' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Time Sensitive Messages</h3>
                    <Badge className="bg-orange-600 text-white">
                      {mockMessages.filter(m => m.urgency === 'time-sensitive').length + 
                       (selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'time-sensitive') : 0)}
                    </Badge>
                  </div>
                  
                  {/* Messages YOU sent (pending view) */}
                  {(() => {
                    const sentItems = selectedChannel 
                      ? urgentMonitoringItems.filter(item => 
                          item.conversationId === selectedChannel.id && 
                          item.type === 'time-sensitive' && 
                          item.status === 'pending'
                        )
                      : [];
                    
                    if (sentItems.length > 0) {
                      return (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Send className="w-4 h-4 text-orange-600" />
                            <h4 className="text-[12px] font-semibold text-orange-700 uppercase tracking-wide">Awaiting View</h4>
                            <Badge className="bg-orange-600 text-white text-[10px] h-4 px-1.5">{sentItems.length}</Badge>
                          </div>
                          <div className="space-y-2">
                            {sentItems.map((item) => (
                              <Card key={item.id} className="p-4 border-l-4 border-l-orange-600 bg-orange-50/30">
                                <div className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                                      {item.recipientInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-[13px] text-gray-900 font-medium">To: {item.recipientName}</span>
                                      <span className="text-[11px] text-gray-500">Sent {item.sentAt}</span>
                                      <Badge className="bg-orange-600 text-white text-[9px] h-4 px-1.5">Time-Sensitive</Badge>
                                    </div>
                                    <p className="text-[13px] text-gray-700 mb-2">{item.message}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-orange-600">
                                      <EyeOff className="w-3 h-3 animate-pulse" />
                                      <span>Not yet seen</span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Messages RECEIVED */}
                  {mockMessages.filter(m => m.urgency === 'time-sensitive').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Download className="w-4 h-4 text-orange-600" />
                        <h4 className="text-[12px] font-semibold text-orange-700 uppercase tracking-wide">Received</h4>
                        <Badge className="bg-orange-600 text-white text-[10px] h-4 px-1.5">
                          {mockMessages.filter(m => m.urgency === 'time-sensitive').length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {mockMessages.filter(m => m.urgency === 'time-sensitive').map((message) => (
                          <Card key={message.id} className="p-4 border-l-4 border-l-orange-600">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                              {message.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[13px] text-gray-900">{message.sender}</span>
                              <span className="text-[11px] text-gray-500">{message.timestamp}</span>
                              <Badge className="bg-orange-600 text-white text-[9px] h-4 px-1.5">
                                Time Sensitive
                              </Badge>
                            </div>
                            <p className="text-[13px] text-gray-700 mb-3">{message.content}</p>
                            
                            {/* Acknowledge button */}
                            {!message.isCurrentUser && !acknowledgedMessages.has(message.id) && 
                             !message.acknowledgedBy?.some(ack => ack.userId === 'me') && (
                              <Button
                                size="sm"
                                onClick={() => acknowledgeMessage(message.id)}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] mb-3"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
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
                                Pin Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="w-4 h-4 mr-2 text-gray-600" />
                                Forward Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                                Change to Critical
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                Keep as Time Sensitive
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                Change to Next Block
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Audit Trail */}
                        <div className="mt-3 p-2 bg-blue-50 rounded text-[10px] border-l-2 border-blue-400">
                          <div className="font-semibold text-blue-900 mb-1.5">Timeline</div>
                          <div className="space-y-1 text-blue-800">
                            <div className="flex items-start gap-1.5">
                              <Send className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                              <span>Sent by {message.sender} at {message.sentAt}</span>
                            </div>
                            {message.readBy && message.readBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Eye className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                <span>First seen by {message.readBy[0].userName} at {message.readBy[0].seenAt}</span>
                              </div>
                            )}
                            {message.acknowledgedBy && message.acknowledgedBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <ShieldCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-green-700" />
                                <span className="text-green-700">Acknowledged by {message.acknowledgedBy[0].userName} at {message.acknowledgedBy[0].acknowledgedAt}</span>
                              </div>
                            )}
                            {message.resolvedBy && (
                              <div className="flex items-start gap-1.5">
                                <CheckCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-purple-700" />
                                <span className="text-purple-700">Resolved by {message.resolvedBy.userName} at {message.resolvedBy.resolvedAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {mockMessages.filter(m => m.urgency === 'time-sensitive').length === 0 && 
                   (selectedChannel ? getConversationMonitoringCountByType(selectedChannel.id, 'time-sensitive') : 0) === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-[13px]">No time sensitive messages</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : viewMode === 'next-block' ? (
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Next Work Block Messages</h3>
                    <Badge className="bg-yellow-600 text-white">
                      {mockMessages.filter(m => m.urgency === 'next-block').length}
                    </Badge>
                  </div>
                  {mockMessages.filter(m => m.urgency === 'next-block').length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Download className="w-4 h-4 text-yellow-600" />
                        <h4 className="text-[12px] font-semibold text-yellow-700 uppercase tracking-wide">Received</h4>
                        <Badge className="bg-yellow-600 text-white text-[10px] h-4 px-1.5">
                          {mockMessages.filter(m => m.urgency === 'next-block').length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {mockMessages.filter(m => m.urgency === 'next-block').map((message) => (
                          <Card key={message.id} className="p-4 border-l-4 border-l-yellow-600">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                              {message.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[13px] text-gray-900">{message.sender}</span>
                              <span className="text-[11px] text-gray-500">{message.timestamp}</span>
                              <Badge className="bg-yellow-600 text-white text-[9px] h-4 px-1.5">
                                Next Block
                              </Badge>
                            </div>
                            <p className="text-[13px] text-gray-700 mb-3">{message.content}</p>
                            
                            {/* Acknowledge button */}
                            {!message.isCurrentUser && !acknowledgedMessages.has(message.id) && 
                             !message.acknowledgedBy?.some(ack => ack.userId === 'me') && (
                              <Button
                                size="sm"
                                onClick={() => acknowledgeMessage(message.id)}
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] mb-3"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
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
                                Pin Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="w-4 h-4 mr-2 text-gray-600" />
                                Forward Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                                Change to Critical
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                Change to Time Sensitive
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                Keep as Next Block
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Audit Trail */}
                        <div className="mt-3 p-2 bg-blue-50 rounded text-[10px] border-l-2 border-blue-400">
                          <div className="font-semibold text-blue-900 mb-1.5">Timeline</div>
                          <div className="space-y-1 text-blue-800">
                            <div className="flex items-start gap-1.5">
                              <Send className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                              <span>Sent by {message.sender} at {message.sentAt}</span>
                            </div>
                            {message.readBy && message.readBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Eye className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                <span>First seen by {message.readBy[0].userName} at {message.readBy[0].seenAt}</span>
                              </div>
                            )}
                            {message.acknowledgedBy && message.acknowledgedBy.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <ShieldCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-green-700" />
                                <span className="text-green-700">Acknowledged by {message.acknowledgedBy[0].userName} at {message.acknowledgedBy[0].acknowledgedAt}</span>
                              </div>
                            )}
                            {message.resolvedBy && (
                              <div className="flex items-start gap-1.5">
                                <CheckCheck className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-purple-700" />
                                <span className="text-purple-700">Resolved by {message.resolvedBy.userName} at {message.resolvedBy.resolvedAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {mockMessages.filter(m => m.urgency === 'next-block').length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-[13px]">No next work block messages</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : null}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-[13px]">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Participants (when shown) */}
      {selectedChannel && showParticipants && selectedChannel.participants && (
        <div className="w-56 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900">Participants</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowParticipants(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-gray-500">{selectedChannel.participants.length} members</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {selectedChannel.participants.map((participant, idx) => (
                <button key={idx} className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px]">
                      {participant.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] text-gray-700">{participant}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

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
    </div>
  );
}

export default ChatView;
