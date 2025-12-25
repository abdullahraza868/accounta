import { useState } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  FileText, 
  Clock, 
  Shield, 
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
  Settings,
  ChevronLeft,
  Paperclip,
  Calendar as CalendarIcon,
  CheckSquare,
  Folder,
  MoreVertical,
  Reply,
  ReplyAll,
  Forward,
  Download,
  Flag,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Users,
  Building2,
  Tag,
  BarChart3,
  Eye,
  MousePointerClick,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ComposeEmailDialog } from '../ComposeEmailDialog';
import { EmailSettingsDialog } from '../EmailSettingsDialog';
import { AssignToProjectDialog } from '../AssignToProjectDialog';
import { CreateTaskFromEmailDialog } from '../CreateTaskFromEmailDialog';
import { AIEmailSummaryDialog } from '../AIEmailSummaryDialog';
import { AIGenerateEmailDialog } from '../AIGenerateEmailDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';

type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'scheduled' | 'secure' | 'starred' | 'trash';

type EmailViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Email = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  flagged: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  isSecure: boolean;
  thread?: Email[];
  projectIds?: string[];
  clientId?: string;
  clientName?: string;
  scheduledFor?: string;
  status?: 'sent' | 'delivered' | 'opened' | 'failed' | 'scheduled' | 'draft';
  openedAt?: string;
  deliveredAt?: string;
  sentAt?: string;
  clickedLinks?: Array<{
    url: string;
    clickedAt: string;
  }>;
};

export function EmailView({ open, onOpenChange }: EmailViewProps) {
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAssignProject, setShowAssignProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [composeMode, setComposeMode] = useState<'new' | 'reply' | 'replyAll' | 'forward'>('new');
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedActivityEmail, setSelectedActivityEmail] = useState<Email | null>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);

  // Mock email data
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: { name: 'Gokhan Troy', email: 'gokhan@troy.com', avatar: 'GT' },
      to: ['sarah@firm.com'],
      subject: 'Q4 Tax Documents Ready for Review',
      body: `Hi Sarah,\n\nI hope this email finds you well. I wanted to let you know that I've uploaded all the Q4 tax documents to the portal as requested.\n\nThe documents include:\n- Income statements\n- Expense reports\n- Quarterly revenue breakdown\n\nPlease let me know if you need anything else or if you have any questions.\n\nBest regards,\nGokhan`,
      date: new Date().toISOString(),
      read: false,
      starred: false,
      flagged: true,
      hasAttachments: true,
      attachments: [
        { id: '1', name: 'Q4-Income-Statement.pdf', size: 245000, type: 'application/pdf' },
        { id: '2', name: 'Q4-Expenses.xlsx', size: 89000, type: 'application/vnd.ms-excel' }
      ],
      isSecure: false,
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    },
    {
      id: '2',
      from: { name: 'Sarah Johnson', email: 'sarah@firm.com', avatar: 'SJ' },
      to: ['jamal@bestface.com'],
      subject: 'Year-End Financial Review Meeting Confirmation',
      body: `Hi Jamal,\n\nThis is to confirm our year-end financial review meeting scheduled for next week.\n\nMeeting Details:\n- Date: December 20, 2025\n- Time: 2:00 PM EST\n- Duration: 1.5 hours\n- Location: Virtual (Google Meet link will be sent)\n\nPlease review the attached agenda before our meeting.\n\nLooking forward to our discussion!\n\nBest,\nSarah`,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: true,
      flagged: false,
      hasAttachments: true,
      attachments: [
        { id: '3', name: 'Meeting-Agenda.pdf', size: 125000, type: 'application/pdf' }
      ],
      isSecure: false,
      clientId: '3',
      clientName: 'Best Face Forward',
      status: 'opened',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      clickedLinks: [
        {
          url: 'https://meet.google.com/abc-defg-hij',
          clickedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '3',
      from: { name: 'Mike Chen', email: 'mike@firm.com', avatar: 'MC' },
      to: ['john@smithfamily.com'],
      subject: '[SECURE] 2024 Tax Return - Sensitive Information',
      body: `This is a secure email. The recipient will need to verify their identity to view this message.`,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: true,
      attachments: [
        { id: '4', name: '2024-Tax-Return.pdf', size: 1200000, type: 'application/pdf' }
      ],
      isSecure: true,
      clientId: '11',
      clientName: 'John & Mary Smith',
      status: 'delivered',
      deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      from: { name: 'Sarah Johnson', email: 'sarah@firm.com', avatar: 'SJ' },
      to: ['clients@firm.com'],
      subject: 'DRAFT: Tax Season 2025 Preparation Guide',
      body: `Dear Valued Clients,\n\nAs we approach the 2025 tax season, we wanted to share this comprehensive preparation guide to help you get organized.\n\n[Draft content continues...]`,
      date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      status: 'draft'
    },
    {
      id: '5',
      from: { name: 'Sarah Johnson', email: 'sarah@firm.com', avatar: 'SJ' },
      to: ['newsletter@clients.com'],
      subject: 'Monthly Tax Newsletter - January 2025',
      body: `Scheduled to send on January 1, 2025 at 9:00 AM`,
      date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const folders = [
    { id: 'inbox' as EmailFolder, label: 'Inbox', icon: Inbox, count: emails.filter(e => !e.read && e.status !== 'draft' && e.status !== 'scheduled').length },
    { id: 'starred' as EmailFolder, label: 'Starred', icon: Star, count: emails.filter(e => e.starred).length },
    { id: 'sent' as EmailFolder, label: 'Sent', icon: Send, count: emails.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'opened').length },
    { id: 'drafts' as EmailFolder, label: 'Drafts', icon: FileText, count: emails.filter(e => e.status === 'draft').length },
    { id: 'scheduled' as EmailFolder, label: 'Scheduled', icon: Clock, count: emails.filter(e => e.status === 'scheduled').length },
    { id: 'secure' as EmailFolder, label: 'Secure', icon: Shield, count: emails.filter(e => e.isSecure).length },
    { id: 'trash' as EmailFolder, label: 'Trash', icon: Trash2, count: 0 },
  ];

  const getFilteredEmails = () => {
    let filtered = emails;

    // Filter by folder
    switch (selectedFolder) {
      case 'inbox':
        filtered = filtered.filter(e => e.status !== 'draft' && e.status !== 'scheduled' && e.to.includes('sarah@firm.com'));
        break;
      case 'starred':
        filtered = filtered.filter(e => e.starred);
        break;
      case 'sent':
        filtered = filtered.filter(e => (e.status === 'sent' || e.status === 'delivered' || e.status === 'opened') && e.from.email === 'sarah@firm.com');
        break;
      case 'drafts':
        filtered = filtered.filter(e => e.status === 'draft');
        break;
      case 'scheduled':
        filtered = filtered.filter(e => e.status === 'scheduled');
        break;
      case 'secure':
        filtered = filtered.filter(e => e.isSecure);
        break;
      case 'trash':
        filtered = [];
        break;
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleCompose = () => {
    setComposeMode('new');
    setReplyToEmail(null);
    setShowCompose(true);
  };

  const handleReply = (email: Email, replyAll: boolean = false) => {
    setComposeMode(replyAll ? 'replyAll' : 'reply');
    setReplyToEmail(email);
    setShowCompose(true);
  };

  const handleForward = (email: Email) => {
    setComposeMode('forward');
    setReplyToEmail(email);
    setShowCompose(true);
  };

  const handleStarEmail = (emailId: string) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, starred: !e.starred } : e
    ));
    toast.success(emails.find(e => e.id === emailId)?.starred ? 'Removed from starred' : 'Added to starred');
  };

  const handleFlagEmail = (emailId: string) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, flagged: !e.flagged } : e
    ));
    toast.success(emails.find(e => e.id === emailId)?.flagged ? 'Flag removed' : 'Email flagged');
  };

  const handleMarkAsRead = (emailId: string, read: boolean) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, read } : e
    ));
  };

  const handleDeleteEmail = (emailId: string) => {
    setEmails(emails.filter(e => e.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    toast.success('Email moved to trash');
  };

  const formatEmailDate = (date: string) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(emailDate, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return format(emailDate, 'EEE');
    } else {
      return format(emailDate, 'MMM d');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredEmails = getFilteredEmails();

  if (!open) return null;

  return (
    <div className="fixed top-16 left-0 md:left-20 right-0 bottom-0 bg-white dark:bg-gray-900 z-40 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Close
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email</h1>
          <Badge variant="secondary" className="text-xs">
            {filteredEmails.filter(e => !e.read).length} unread
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCompose}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Compose
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
          <div className="p-4 space-y-1">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setSelectedEmail(null);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedFolder === folder.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <Separator />

          <div className="p-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                console.log('Activity Log clicked, setting showActivityLog to true');
                setShowActivityLog(true);
                setSelectedEmail(null);
                console.log('After setState');
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Activity Log
            </Button>
          </div>
        </div>

        {/* Middle - Email List */}
        {!showActivityLog ? (
          <>
            <div className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

              {/* Email List */}
              <ScrollArea className="flex-1">
                {filteredEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <Mail className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No emails found</p>
                  </div>
                ) : (
                  <TooltipProvider>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredEmails.map(email => (
                        <div
                          key={email.id}
                          className={cn(
                            "group relative transition-colors",
                            // Read/unread state (highest priority)
                            email.read 
                              ? "bg-gray-100 dark:bg-gray-800 opacity-60" 
                              : "bg-white dark:bg-gray-900",
                            // Hover state
                            !email.read && "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                            email.read && "hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          <button
                            onClick={() => {
                              setSelectedEmail(email);
                              handleMarkAsRead(email.id, true);
                            }}
                            className="w-full p-4 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                <div 
                                  className="w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-full"
                                  style={{ backgroundColor: 'var(--primaryColor)' }}
                                >
                                  {email.from.avatar || email.from.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={cn(
                                    "text-sm truncate",
                                    !email.read ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"
                                  )}>
                                    {email.from.name}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {formatEmailDate(email.date)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mb-1">
                                  <p className={cn(
                                    "text-sm truncate flex-1",
                                    !email.read ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                                  )}>
                                    {email.subject}
                                  </p>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {email.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-gray-400" />}
                                    {email.isSecure && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                                  </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {email.body.substring(0, 80)}...
                                </p>

                                {email.status === 'scheduled' && email.scheduledFor && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <Clock className="w-3 h-3 text-orange-500" />
                                    <span className="text-xs text-orange-600 dark:text-orange-400">
                                      Scheduled for {format(new Date(email.scheduledFor), 'MMM d, h:mm a')}
                                    </span>
                                  </div>
                                )}

                                {email.clientName && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Building2 className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {email.clientName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Star and Flag buttons - positioned on the right */}
                          <div className="absolute right-2 top-4 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStarEmail(email.id);
                                  }}
                                  className={cn(
                                    "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                                    email.starred && "opacity-100"
                                  )}
                                >
                                  <Star className={cn(
                                    "w-4 h-4",
                                    email.starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                                  )} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {email.starred ? 'Remove star' : 'Add star'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFlagEmail(email.id);
                                  }}
                                  className={cn(
                                    "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                                    email.flagged && "opacity-100"
                                  )}
                                >
                                  <Flag className={cn(
                                    "w-4 h-4",
                                    email.flagged ? "text-red-500 fill-red-500" : "text-gray-400"
                                  )} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {email.flagged ? 'Remove flag' : 'Flag email'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                )}
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
            {/* Activity Log */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity Log</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track email engagement and performance</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowActivityLog(false);
                  setSelectedActivityType(null);
                  setSelectedEmail(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!selectedActivityType ? (
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Activity Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sent Card */}
                    <button
                      onClick={() => setSelectedActivityType('sent')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Send className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {emails.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'opened').length}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Sent
                        </div>
                      </div>
                    </button>

                    {/* Delivered Card */}
                    <button
                      onClick={() => setSelectedActivityType('delivered')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {emails.filter(e => e.status === 'delivered' || e.status === 'opened').length}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Delivered
                        </div>
                      </div>
                    </button>

                    {/* Opened Card */}
                    <button
                      onClick={() => setSelectedActivityType('opened')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Eye className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {emails.filter(e => e.status === 'opened').length}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Opened
                        </div>
                      </div>
                    </button>

                    {/* Clicked Card */}
                    <button
                      onClick={() => setSelectedActivityType('clicked')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <MousePointerClick className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          0
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Clicked
                        </div>
                      </div>
                    </button>

                    {/* Bounced Card */}
                    <button
                      onClick={() => setSelectedActivityType('bounced')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          0
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Bounced
                        </div>
                      </div>
                    </button>

                    {/* Replied Card */}
                    <button
                      onClick={() => setSelectedActivityType('replied')}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Reply className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          0
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Replied
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {selectedActivityType} Emails
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedActivityType(null)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {emails
                    .filter(email => {
                      if (selectedActivityType === 'sent') {
                        return email.status === 'sent' || email.status === 'delivered' || email.status === 'opened';
                      } else if (selectedActivityType === 'delivered') {
                        return email.status === 'delivered' || email.status === 'opened';
                      } else if (selectedActivityType === 'opened') {
                        return email.status === 'opened';
                      }
                      return false;
                    })
                    .map(email => (
                      <button
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <div 
                              className="w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-full"
                              style={{ backgroundColor: 'var(--primaryColor)' }}
                            >
                              {email.from.avatar || email.from.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {email.from.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {formatEmailDate(email.date)}
                              </span>
                            </div>

                            <p className="text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                              {email.subject}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {email.body.substring(0, 80)}...
                            </p>

                            {email.clientName && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {email.clientName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Right - Email Content */}
        <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedEmail.subject}
                      </h2>
                      {selectedEmail.isSecure && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Secure
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <div 
                            className="w-full h-full flex items-center justify-center text-white text-xs font-medium rounded-full"
                            style={{ backgroundColor: 'var(--primaryColor)' }}
                          >
                            {selectedEmail.from.avatar || selectedEmail.from.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedEmail.from.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEmail.from.email}</p>
                        </div>
                      </div>
                      <span>•</span>
                      <span>{format(new Date(selectedEmail.date), 'MMM d, yyyy · h:mm a')}</span>
                    </div>

                    {selectedEmail.to && selectedEmail.to.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">To:</span> {selectedEmail.to.join(', ')}
                      </div>
                    )}

                    {selectedEmail.status && selectedEmail.status !== 'draft' && (
                      <div className="mt-2 flex items-center gap-2">
                        {selectedEmail.status === 'delivered' && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Check className="w-3 h-3" />
                            Delivered
                          </Badge>
                        )}
                        {selectedEmail.status === 'opened' && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Check className="w-3 h-3 text-green-600" />
                            Opened {selectedEmail.openedAt && `• ${formatDistanceToNow(new Date(selectedEmail.openedAt), { addSuffix: true })}`}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStarEmail(selectedEmail.id)}
                      className={cn(selectedEmail.starred && "text-yellow-500")}
                    >
                      <Star className={cn("w-4 h-4", selectedEmail.starred && "fill-yellow-500")} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFlagEmail(selectedEmail.id)}
                      className={cn(selectedEmail.flagged && "text-red-500")}
                    >
                      <Flag className={cn("w-4 h-4", selectedEmail.flagged && "fill-red-500")} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => {
                          setShowAssignProject(true);
                        }}>
                          <Folder className="w-4 h-4 mr-2" />
                          Assign to Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setShowCreateTask(true);
                        }}>
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Create Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setShowAISummary(true);
                        }}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Summary
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleMarkAsRead(selectedEmail.id, !selectedEmail.read)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Mark as {selectedEmail.read ? 'Unread' : 'Read'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEmail(selectedEmail.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReply(selectedEmail)}
                    className="gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReply(selectedEmail, true)}
                    className="gap-2"
                  >
                    <ReplyAll className="w-4 h-4" />
                    Reply All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleForward(selectedEmail)}
                    className="gap-2"
                  >
                    <Forward className="w-4 h-4" />
                    Forward
                  </Button>
                </div>
              </div>

              {/* Email Body */}
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl">
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {selectedEmail.body}
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedEmail.hasAttachments && selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Attachments ({selectedEmail.attachments.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedEmail.attachments.map(attachment => (
                          <Card key={attachment.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity Tracking - Show when in activity log mode */}
                  {showActivityLog && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Email Activity Tracking
                      </h3>
                      
                      <div className="space-y-3">
                        {/* Sent */}
                        {selectedEmail.sentAt && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                Email Sent
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {format(new Date(selectedEmail.sentAt), 'MMM d, yyyy')} | {format(new Date(selectedEmail.sentAt), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delivered */}
                        {selectedEmail.deliveredAt && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                Delivered
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {format(new Date(selectedEmail.deliveredAt), 'MMM d, yyyy')} | {format(new Date(selectedEmail.deliveredAt), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Opened */}
                        {selectedEmail.openedAt && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                Email Opened
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {format(new Date(selectedEmail.openedAt), 'MMM d, yyyy')} | {format(new Date(selectedEmail.openedAt), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Clicked Links */}
                        {selectedEmail.clickedLinks && selectedEmail.clickedLinks.length > 0 && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                              <MousePointerClick className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                                Links Clicked ({selectedEmail.clickedLinks.length})
                              </div>
                              <div className="space-y-2">
                                {selectedEmail.clickedLinks.map((link, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs">
                                    <ExternalLink className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-gray-700 dark:text-gray-300 truncate font-mono">
                                        {link.url}
                                      </div>
                                      <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                                        {format(new Date(link.clickedAt), 'MMM d, yyyy')} | {format(new Date(link.clickedAt), 'h:mm a')}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No email selected</p>
                <p className="text-sm mt-1">Select an email from the list to read it</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ComposeEmailDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        mode={composeMode}
        replyToEmail={replyToEmail}
      />

      <EmailSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {selectedEmail && (
        <>
          <AssignToProjectDialog
            open={showAssignProject}
            onOpenChange={setShowAssignProject}
            emailId={selectedEmail.id}
            clientId={selectedEmail.clientId}
            clientName={selectedEmail.clientName}
          />

          <CreateTaskFromEmailDialog
            open={showCreateTask}
            onOpenChange={setShowCreateTask}
            email={selectedEmail}
          />

          <AIEmailSummaryDialog
            open={showAISummary}
            onOpenChange={setShowAISummary}
            email={selectedEmail}
          />
        </>
      )}

      <AIGenerateEmailDialog
        open={showAIGenerate}
        onOpenChange={setShowAIGenerate}
      />
    </div>
  );
}