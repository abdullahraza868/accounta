import React, { useState } from 'react';
import { Client } from '../../App';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ManageClientGroupsDialog } from '../ManageClientGroupsDialog';
import { AddActionItemDialog } from '../AddActionItemDialog';
import { AddNoteDialog } from '../AddNoteDialog';
import { ScheduleMeetingDialog } from '../ScheduleMeetingDialog';
import { 
  Clock, 
  LogIn, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  Calendar,
  Plus,
  CheckSquare,
  BarChart3,
  StickyNote,
  Trash2,
  Edit,
  Video,
  MapPin,
  Tag,
  GripVertical,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../ui/utils';

type SnapshotTabProps = {
  client: Client;
};

type CardId = 'lastLogin' | 'touchpoints' | 'memberSince' | 'documents' | 'actionItems' | 'tracker' | 'clientGroups' | 'notes' | 'meetings';

type ActionItem = {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  completedDate?: string;
};

type Note = {
  id: number;
  content: string;
  date: string;
  author: string;
  highlighted?: boolean;
};

type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'video' | 'call' | 'in-person';
  status: 'upcoming' | 'completed';
  videoProvider?: 'google-meet' | 'zoom';
  meetingLink?: string;
};

export function SnapshotTab({ client }: SnapshotTabProps) {
  const [showAddActionItemDialog, setShowAddActionItemDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false);
  const [clientData, setClientData] = useState(client);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState<ActionItem | null>(null);
  const [showGroupsDialog, setShowGroupsDialog] = useState(false);

  // Handler for saving client groups
  const handleSaveGroups = (groups: string[]) => {
    // First group becomes the primary group, rest are tags
    const [primaryGroup, ...tags] = groups;
    setClientData({
      ...clientData,
      group: primaryGroup || '',
      tags: tags
    });
  };

  // Mock data
  const clientStats = {
    memberSince: 'Jan 15, 2024',
    daysSinceJoined: 283,
    loginCreated: 'Jan 16, 2024',
    lastLogin: '2 hours ago',
    touchpoints: {
      emails: 23,
      texts: 8,
      calls: 5
    },
    documentsSubmitted: 12
  };

  const [notes, setNotes] = useState<Note[]>([
    { id: 1, content: 'Client prefers communication via email', date: '2024-10-15', author: 'Sarah Johnson', highlighted: true },
    { id: 2, content: 'Quarterly review scheduled for Nov 15', date: '2024-10-10', author: 'Mike Brown', highlighted: true },
    { id: 3, content: 'Needs tax documents by Dec 1st', date: '2024-10-05', author: 'Sarah Johnson', highlighted: true }
  ]);

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: 1, title: 'Upload Q3 Financial Statements', status: 'pending', dueDate: '2024-11-15' },
    { id: 2, title: 'Review and sign tax forms', status: 'pending', dueDate: '2024-11-20' },
    { id: 3, title: 'Submit payroll information', status: 'completed', dueDate: '2024-10-25', completedDate: '2024-10-24 03:30 PM' },
    { id: 4, title: 'Update business address', status: 'pending', dueDate: '2024-11-30' }
  ]);

  const trackerItems = [
    { id: 1, name: '2024 Tax Return', status: 'In Progress', progress: 65 },
    { id: 2, name: 'Quarterly Bookkeeping', status: 'Completed', progress: 100 },
    { id: 3, name: 'Annual Audit Prep', status: 'Not Started', progress: 0 }
  ];

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: 'Q4 Tax Planning Review',
      date: '2024-11-15',
      time: '10:00 AM',
      type: 'video',
      status: 'upcoming',
      videoProvider: 'google-meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 2,
      title: 'Year-End Financial Review',
      date: '2024-12-01',
      time: '2:00 PM',
      type: 'in-person',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Q3 Business Review',
      date: '2024-10-20',
      time: '11:00 AM',
      type: 'video',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Annual Tax Strategy Session',
      date: '2024-09-15',
      time: '1:00 PM',
      type: 'in-person',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Onboarding Meeting',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'call',
      status: 'completed'
    }
  ]);

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastMeetings = meetings.filter(m => m.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getMeetingIcon = (type: 'video' | 'call' | 'in-person') => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getMeetingTypeColor = (type: 'video' | 'call' | 'in-person') => {
    switch (type) {
      case 'video':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'call':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-person':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const handleAddActionItem = (item: { id?: number; title: string; description?: string; dueDate?: string }) => {
    if (item.id) {
      // Edit existing item
      setActionItems(items =>
        items.map(i =>
          i.id === item.id
            ? {
                ...i,
                title: item.title,
                description: item.description,
                dueDate: item.dueDate || i.dueDate
              }
            : i
        )
      );
      setEditingActionItem(null);
    } else {
      // Add new item
      const newItem: ActionItem = {
        id: Math.max(...actionItems.map(i => i.id), 0) + 1,
        title: item.title,
        description: item.description,
        status: 'pending',
        dueDate: item.dueDate || ''
      };
      setActionItems([...actionItems, newItem]);
    }
  };

  const handleToggleActionItem = (id: number) => {
    setActionItems(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'completed' ? 'pending' : 'completed',
              completedDate: item.status === 'completed' ? undefined : new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }
          : item
      )
    );
  };

  const handleDeleteActionItem = (id: number) => {
    setActionItems(items => items.filter(item => item.id !== id));
  };

  const handleAddNote = (note: { content: string; highlighted: boolean }) => {
    const newNote: Note = {
      id: Math.max(...notes.map(n => n.id), 0) + 1,
      content: note.content,
      date: new Date().toISOString().split('T')[0],
      author: 'Current User',
      highlighted: note.highlighted
    };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes => notes.filter(note => note.id !== id));
  };

  const handleScheduleMeeting = (meetingData: any) => {
    const newMeeting: Meeting = {
      id: Math.max(...meetings.map(m => m.id), 0) + 1,
      title: meetingData.title,
      date: meetingData.date,
      time: meetingData.time,
      type: meetingData.type,
      status: 'upcoming',
      videoProvider: meetingData.videoProvider,
      meetingLink: meetingData.type === 'video' ? `https://${meetingData.videoProvider === 'google-meet' ? 'meet.google.com' : 'zoom.us'}/abc-defg-hij` : undefined
    };
    setMeetings([...meetings, newMeeting]);
  };

  const displayedActionItems = hideCompleted
    ? actionItems.filter(item => item.status !== 'completed')
    : actionItems;

  // Card components
  const renderCard = (cardId: CardId) => {
    const cards = {
      lastLogin: (
        <Card className="h-full p-4 pl-8 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Last Login</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{clientStats.lastLogin}</p>
              <p className="text-xs text-gray-500 mt-0.5">Created: {clientStats.loginCreated}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      ),
      touchpoints: (
        <Card className="h-full p-4 pl-8 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Touchpoints</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Emails
                  </span>
                  <span className="font-semibold text-gray-900">{clientStats.touchpoints.emails}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Texts
                  </span>
                  <span className="font-semibold text-gray-900">{clientStats.touchpoints.texts}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Calls
                  </span>
                  <span className="font-semibold text-gray-900">{clientStats.touchpoints.calls}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ),
      memberSince: (
        <Card className="h-full p-4 pl-8 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{clientStats.memberSince}</p>
              <p className="text-xs text-gray-500 mt-0.5">{clientStats.daysSinceJoined} days</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      ),
      documents: (
        <Card className="h-full p-4 pl-8 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Current Year Documents</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{clientStats.documentsSubmitted}</p>
              <p className="text-xs text-gray-500 mt-0.5">Submitted</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      ),
      actionItems: (
        <Card className="h-full p-5 border border-gray-200/60 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 pl-8">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Action Items</h3>
              <Badge variant="secondary" className="text-xs">Client Portal View</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-gray-600 hover:text-gray-900"
                onClick={() => setHideCompleted(!hideCompleted)}
              >
                {hideCompleted ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Show Completed
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hide Completed
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => setShowAddActionItemDialog(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {displayedActionItems.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  item.status === 'completed' 
                    ? "bg-green-50 border-green-200/60" 
                    : "bg-white border-gray-200/60 hover:border-purple-300"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleActionItem(item.id)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      item.status === 'completed' 
                        ? "bg-green-500 border-green-500" 
                        : "border-gray-300 hover:border-green-500"
                    )}
                  >
                    {item.status === 'completed' && (
                      <CheckSquare className="w-3 h-3 text-white" fill="white" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      item.status === 'completed' 
                        ? "line-through text-gray-500" 
                        : "text-gray-900"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.status === 'completed' && item.completedDate
                        ? `Completed: ${item.completedDate}`
                        : item.dueDate
                        ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                        : 'No due date'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setEditingActionItem(item);
                      console.log('Edit action item:', item);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteActionItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {displayedActionItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {hideCompleted ? 'All action items completed!' : 'No action items yet'}
                </p>
              </div>
            )}
          </div>
        </Card>
      ),
      tracker: (
        <Card className="h-full p-5 border border-gray-200/60 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 pl-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Tracker</h3>
              <Badge variant="secondary" className="text-xs">Client Portal View</Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {trackerItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      item.progress === 100 && "bg-green-50 text-green-700 border-green-300",
                      item.progress > 0 && item.progress < 100 && "bg-blue-50 text-blue-700 border-blue-300",
                      item.progress === 0 && "bg-gray-50 text-gray-700 border-gray-300"
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.progress === 100 && "bg-green-500",
                      item.progress > 0 && item.progress < 100 && "bg-blue-500",
                      item.progress === 0 && "bg-gray-300"
                    )}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{item.progress}% Complete</p>
              </div>
            ))}
          </div>
        </Card>
      ),
      clientGroups: (
        <Card className="h-full border-2 border-purple-200 dark:border-purple-800 shadow-lg overflow-hidden flex flex-col">
          {/* Purple Gradient Header */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Client Groups</h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    {clientData.group 
                      ? `Member of ${clientData.group}` 
                      : 'No group assigned'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="sm" 
                className="h-8 text-xs text-white hover:bg-white/20 border border-white/30"
                onClick={() => setShowGroupsDialog(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Manage
              </Button>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800">
            {((clientData.group || (clientData.tags && clientData.tags.length > 0))) && (
              <div className="flex flex-wrap gap-3">
                {clientData.group && (
                  <div className="px-4 py-2.5 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {clientData.group}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Primary Group</p>
                  </div>
                )}
                {clientData.tags && clientData.tags.map((tag, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2.5 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tag</p>
                  </div>
                ))}
              </div>
            )}

            {(!clientData.group && (!clientData.tags || clientData.tags.length === 0)) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No groups assigned</p>
                <p className="text-xs text-gray-500 mb-4">Add this client to groups for better organization</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={() => setShowGroupsDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add to Group
                </Button>
              </div>
            )}
          </div>
        </Card>
      ),
      notes: (
        <Card className="h-full p-5 border border-gray-200/60 shadow-sm flex flex-col overflow-hidden">
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
            {notes.filter(n => n.highlighted).map((note) => (
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
            {notes.filter(n => n.highlighted).length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <StickyNote className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No highlighted notes yet</p>
              </div>
            )}
          </div>
        </Card>
      ),
      meetings: (
        <Card className="h-full p-5 border border-gray-200/60 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 pl-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Meetings</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setShowScheduleMeetingDialog(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Schedule
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs uppercase tracking-wide text-gray-500">Upcoming</h4>
                <Badge variant="secondary" className="text-xs h-5">{upcomingMeetings.length}</Badge>
              </div>
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 2).map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-purple-50 border border-purple-200/60 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                      <Badge variant="outline" className={cn('text-xs', getMeetingTypeColor(meeting.type))}>
                        {getMeetingIcon(meeting.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>{meeting.time}</span>
                    </div>
                    {meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
                {upcomingMeetings.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming meetings</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs uppercase tracking-wide text-gray-500">Past</h4>
                <Badge variant="secondary" className="text-xs h-5">{pastMeetings.length}</Badge>
              </div>
              <div className="space-y-2">
                {pastMeetings.slice(0, 2).map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-gray-50 border border-gray-200/60 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">{meeting.title}</p>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {getMeetingIcon(meeting.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>{meeting.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              {pastMeetings.length > 2 && (
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs mt-2 text-purple-600">
                  View All {pastMeetings.length} Past Meetings
                </Button>
              )}
            </div>
          </div>
        </Card>
      )
    };

    return cards[cardId];
  };

  return (
    <div className="p-6">
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {renderCard('lastLogin')}
        {renderCard('touchpoints')}
        {renderCard('memberSince')}
        {renderCard('documents')}
      </div>
      
      {/* Action Items and Notes Row */}
      <div className="grid grid-cols-2 gap-4">
        {renderCard('actionItems')}
        {renderCard('notes')}
      </div>
      
      {/* Meetings and Tracker Row */}
      <div className="grid grid-cols-2 gap-4">
        {renderCard('meetings')}
        {renderCard('tracker')}
      </div>

      {/* Dialogs */}
      <ManageClientGroupsDialog
        open={showGroupsDialog}
        onOpenChange={setShowGroupsDialog}
        client={clientData}
        onSave={handleSaveGroups}
      />

      <AddActionItemDialog
        open={showAddActionItemDialog || !!editingActionItem}
        onOpenChange={(open) => {
          setShowAddActionItemDialog(open);
          if (!open) setEditingActionItem(null);
        }}
        onSave={handleAddActionItem}
        clientName={client.name}
        editItem={editingActionItem}
      />

      <AddNoteDialog
        open={showAddNoteDialog}
        onOpenChange={setShowAddNoteDialog}
        onSave={handleAddNote}
        clientName={client.name}
      />

      <ScheduleMeetingDialog
        open={showScheduleMeetingDialog}
        onOpenChange={setShowScheduleMeetingDialog}
        onSave={handleScheduleMeeting}
        clientName={client.name}
      />
    </div>
  );
}