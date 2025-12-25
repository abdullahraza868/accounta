import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  Users, 
  List, 
  BarChart3,
  Video,
  Phone,
  MapPin,
  Clock,
  Mail
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { cn } from '../ui/utils';
import { MeetingAnalytics } from '../MeetingAnalytics';
import { CalendarAgendaView } from '../CalendarAgendaView';
import { ScheduleMeetingDialog } from '../ScheduleMeetingDialog';
import { MeetingDetailsDialog } from '../MeetingDetailsDialog';
import { CalendarSettingsDialog } from '../CalendarSettingsDialog';
import { toast } from 'sonner@2.0.3';

type CalendarViewType = 'day' | 'week' | 'month' | 'agenda' | 'analytics';

type Meeting = {
  id: string;
  title: string;
  client: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'in-person' | 'call' | 'email';
  videoProvider?: 'google-meet' | 'zoom';
  meetingLink?: string;
  location?: string;
  attendees: string[];
  description?: string;
  calendar: string;
};

type CalendarSource = {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'internal';
  color: string;
  enabled: boolean;
  connected?: boolean;
  email?: string;
};

type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [initialMeetingDate, setInitialMeetingDate] = useState<Date | undefined>();
  const [initialMeetingTime, setInitialMeetingTime] = useState<string | undefined>();
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [defaultTimeZone, setDefaultTimeZone] = useState('America/New_York');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [draggedMeeting, setDraggedMeeting] = useState<Meeting | null>(null);

  // Mock data
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', avatar: 'SJ', color: '#7c3aed' },
    { id: '2', name: 'Mike Brown', avatar: 'MB', color: '#2563eb' },
    { id: '3', name: 'Emily Davis', avatar: 'ED', color: '#059669' },
    { id: '4', name: 'John Smith', avatar: 'JS', color: '#dc2626' },
  ];

  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([
    { id: '1', name: 'Work Calendar', type: 'google', color: '#7c3aed', enabled: true, connected: true, email: 'you@company.com' },
    { id: '2', name: 'Personal Calendar', type: 'google', color: '#2563eb', enabled: true, connected: true, email: 'you@gmail.com' },
    { id: '3', name: 'Firm Calendar', type: 'internal', color: '#059669', enabled: true },
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Q4 Tax Planning Review',
      client: 'Troy Business Services LLC',
      clientId: '1',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '11:00',
      type: 'video',
      videoProvider: 'google-meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      attendees: ['sarah@firm.com', 'gokhan@troy.com'],
      description: 'Discuss Q4 tax strategy and year-end planning',
      calendar: '1'
    },
    {
      id: '2',
      title: 'Year-End Financial Review',
      client: 'Best Face Forward',
      clientId: '3',
      date: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
      startTime: '14:00',
      endTime: '15:30',
      type: 'in-person',
      location: 'Main Office Conference Room A, 123 Business St, Suite 100',
      attendees: ['mike@firm.com', 'jamal@bestface.com'],
      description: 'Review annual financials and discuss next steps',
      calendar: '1'
    },
    {
      id: '3',
      title: 'Client Onboarding Call',
      client: 'John & Mary Smith',
      clientId: '11',
      date: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '09:30',
      type: 'call',
      attendees: ['sarah@firm.com', 'john@smithfamily.com'],
      calendar: '1'
    },
  ]);

  // Load events from localStorage on mount
  useEffect(() => {
    const loadEventsFromStorage = () => {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        try {
          const events = JSON.parse(storedEvents);
          // Merge stored events with default meetings, avoiding duplicates
          setMeetings(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newEvents = events.filter((e: Meeting) => !existingIds.has(e.id));
            return [...prev, ...newEvents];
          });
        } catch (error) {
          console.error('Error loading calendar events:', error);
        }
      }
    };

    loadEventsFromStorage();

    // Listen for new calendar events
    const handleNewEvent = (event: CustomEvent) => {
      const newEvent = event.detail;
      setMeetings(prev => {
        // Check if event already exists
        if (prev.some(m => m.id === newEvent.id)) {
          return prev;
        }
        return [...prev, newEvent];
      });
    };

    window.addEventListener('calendarEventCreated', handleNewEvent as EventListener);

    return () => {
      window.removeEventListener('calendarEventCreated', handleNewEvent as EventListener);
    };
  }, []);

  const toggleCalendarSource = (id: string) => {
    setCalendarSources(sources =>
      sources.map(source =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
  };

  const updateCalendarColor = (id: string, color: string) => {
    setCalendarSources(sources =>
      sources.map(source =>
        source.id === id ? { ...source, color } : source
      )
    );
  };

  const handleConnectAccount = (type: 'google' | 'microsoft') => {
    // In a real app, this would initiate OAuth flow
    toast.success(`${type === 'google' ? 'Google' : 'Microsoft'} account connection initiated`, {
      description: 'In production, this would open an OAuth window to connect your account.'
    });

    // Mock: Add a new connected calendar
    const newId = String(calendarSources.length + 1);
    const newCalendar: CalendarSource = {
      id: newId,
      name: type === 'google' ? 'New Google Calendar' : 'New Outlook Calendar',
      type,
      color: '#2563eb',
      enabled: true,
      connected: true,
      email: type === 'google' ? 'newaccount@gmail.com' : 'newaccount@outlook.com'
    };
    setCalendarSources([...calendarSources, newCalendar]);
  };

  const handleDisconnectAccount = (id: string) => {
    const calendar = calendarSources.find(c => c.id === id);
    if (calendar) {
      toast.success(`Disconnected ${calendar.name}`);
      setCalendarSources(calendarSources.filter(c => c.id !== id));
    }
  };

  const handleTimeZoneChange = (timezone: string) => {
    setDefaultTimeZone(timezone);
    toast.success('Time zone updated', {
      description: `All meetings will now display in ${timezone}`
    });
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeamMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getMeetingIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5" />;
      case 'in-person':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'email':
        return <Mail className="w-4.5 h-4.5" />;
    }
  };

  const getMeetingColor = (type: Meeting['type']) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'call':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-person':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'email':
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendarSources.find(c => c.id === calendarId);
    return calendar?.color || '#7c3aed';
  };

  // Calendar navigation
  const goToPrevious = useCallback(() => {
    setCurrentDate(prevDate => {
      if (viewType === 'month') {
        return subMonths(prevDate, 1);
      } else if (viewType === 'week') {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      } else {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
      }
    });
  }, [viewType]);

  const goToNext = useCallback(() => {
    setCurrentDate(prevDate => {
      if (viewType === 'month') {
        return addMonths(prevDate, 1);
      } else if (viewType === 'week') {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      } else {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      }
    });
  }, [viewType]);

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Mouse scroll navigation
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle scroll if the mouse is over the calendar area
      if (!calendarRef.current?.contains(e.target as Node)) {
        return;
      }

      // Prevent default scroll behavior
      e.preventDefault();

      // Scroll down = move forward, scroll up = move backward
      if (e.deltaY > 0) {
        goToNext();
      } else if (e.deltaY < 0) {
        goToPrevious();
      }
    };

    const calendarElement = calendarRef.current;
    if (calendarElement) {
      calendarElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (calendarElement) {
        calendarElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [goToNext, goToPrevious]);

  // Month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.date), date) &&
      calendarSources.find(s => s.id === meeting.calendar)?.enabled
    );
  };

  const handleScheduleMeeting = (meetingData: any) => {
    console.log('Scheduling meeting:', meetingData);
    // In real app, this would save to API
  };

  const openScheduleDialogWithTime = (date: Date, time?: string) => {
    setInitialMeetingDate(date);
    setInitialMeetingTime(time);
    setShowScheduleDialog(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
  };

  const handleEditMeeting = () => {
    setShowMeetingDetails(false);
    setShowEditDialog(true);
  };

  const handleDeleteMeeting = () => {
    if (selectedMeeting) {
      setMeetingToDelete(selectedMeeting.id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteMeeting = () => {
    if (meetingToDelete) {
      setMeetings(meetings.filter(m => m.id !== meetingToDelete));
      
      // Also remove from localStorage if it's an email-created event
      if (meetingToDelete.startsWith('email-event-')) {
        const storedEvents = localStorage.getItem('calendarEvents');
        if (storedEvents) {
          try {
            const events = JSON.parse(storedEvents);
            const updatedEvents = events.filter((e: Meeting) => e.id !== meetingToDelete);
            localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
          } catch (error) {
            console.error('Error updating calendar events:', error);
          }
        }
      }
      
      toast.success('Meeting deleted successfully');
      setMeetingToDelete(null);
      setShowDeleteConfirm(false);
      setShowMeetingDetails(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, meeting: Meeting) => {
    setDraggedMeeting(meeting);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', meeting.id);
    // Set drag image to prevent default ghost image issues
    if (e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.5';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedMeeting(null);
  };

  const handleDrop = (e: React.DragEvent, newDate: Date, newTime?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedMeeting) return;

    // Calculate duration to maintain the same length
    const [oldStartHour, oldStartMin] = draggedMeeting.startTime.split(':').map(Number);
    const [oldEndHour, oldEndMin] = draggedMeeting.endTime.split(':').map(Number);
    const durationMinutes = (oldEndHour * 60 + oldEndMin) - (oldStartHour * 60 + oldStartMin);
    
    // Use provided time or keep original time
    const startTime = newTime || draggedMeeting.startTime;
    const [newStartHour, newStartMin] = startTime.split(':').map(Number);
    const newEndMinutes = newStartHour * 60 + newStartMin + durationMinutes;
    const newEndHour = Math.floor(newEndMinutes / 60);
    const newEndMin = newEndMinutes % 60;
    const endTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`;

    setMeetings(meetings.map(m => 
      m.id === draggedMeeting.id 
        ? { ...m, date: format(newDate, 'yyyy-MM-dd'), startTime, endTime }
        : m
    ));

    toast.success('Meeting moved', {
      description: `${draggedMeeting.title} moved to ${format(newDate, 'MMM d')} at ${startTime}`
    });

    setDraggedMeeting(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100">
            {viewType === 'agenda' && 'Meeting Agenda'}
            {viewType === 'analytics' && 'Meeting Analytics'}
            {(viewType === 'day' || viewType === 'week' || viewType === 'month') && 'Calendar'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage meetings and appointments
          </p>
        </div>
        
        {/* Current Date Display - Moved to top right */}
        {(viewType === 'day' || viewType === 'week' || viewType === 'month') && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {viewType === 'day' && format(currentDate, 'MMMM d, yyyy')}
            {viewType === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
            {viewType === 'month' && format(currentDate, 'MMMM yyyy')}
          </h2>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Navigation Controls - All grouped together */}
          <div className="flex items-center gap-3">
            {(viewType === 'day' || viewType === 'week' || viewType === 'month') && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
            
            {/* View Type Selector with Dynamic Arrow Positioning */}
            <div className="flex items-center gap-2">
              {/* Calendar View Buttons (Day/Week/Month with arrows) */}
              {(viewType === 'day' || viewType === 'week' || viewType === 'month') && (
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Day View - arrows surround it when selected */}
                  {viewType === 'day' && (
                    <>
                      <Button variant="outline" size="sm" onClick={goToPrevious} className="rounded-none border-r border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setViewType('day')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        Day
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNext} className="rounded-none border-r border-gray-200 dark:border-gray-700">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('week')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                      >
                        Week
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('month')}
                        className="rounded-none"
                      >
                        Month
                      </Button>
                    </>
                  )}
                  
                  {/* Week View - arrows surround it when selected */}
                  {viewType === 'week' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('day')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                      >
                        Day
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToPrevious} className="rounded-none border-r border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setViewType('week')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        Week
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNext} className="rounded-none border-r border-gray-200 dark:border-gray-700">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('month')}
                        className="rounded-none"
                      >
                        Month
                      </Button>
                    </>
                  )}
                  
                  {/* Month View - arrows surround it when selected */}
                  {viewType === 'month' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('day')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                      >
                        Day
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('week')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                      >
                        Week
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToPrevious} className="rounded-none border-r border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setViewType('month')}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        Month
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNext} className="rounded-none">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Agenda & Analytics View Buttons */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {viewType !== 'agenda' && viewType !== 'analytics' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('agenda')}
                      className="rounded-none border-r border-gray-200 dark:border-gray-700"
                    >
                      <List className="w-4 h-4 mr-1.5" />
                      Agenda
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('analytics')}
                      className="rounded-none"
                    >
                      <BarChart3 className="w-4 h-4 mr-1.5" />
                      Analytics
                    </Button>
                  </>
                )}

                {viewType === 'agenda' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('month')}
                      className="rounded-none border-r border-gray-200 dark:border-gray-700"
                    >
                      <CalendarIcon className="w-4 h-4 mr-1.5" />
                      Calendar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setViewType('agenda')}
                      className="rounded-none border-r border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <List className="w-4 h-4 mr-1.5" />
                      Agenda
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('analytics')}
                      className="rounded-none"
                    >
                      <BarChart3 className="w-4 h-4 mr-1.5" />
                      Analytics
                    </Button>
                  </>
                )}

                {viewType === 'analytics' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('month')}
                      className="rounded-none border-r border-gray-200 dark:border-gray-700"
                    >
                      <CalendarIcon className="w-4 h-4 mr-1.5" />
                      Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewType('agenda')}
                      className="rounded-none border-r border-gray-200 dark:border-gray-700"
                    >
                      <List className="w-4 h-4 mr-1.5" />
                      Agenda
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setViewType('analytics')}
                      className="rounded-none"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <BarChart3 className="w-4 h-4 mr-1.5" />
                      Analytics
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowScheduleDialog(true)}
            className="gap-2"
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Button>
          
          {/* Team Member Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Team View
                {selectedTeamMembers.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTeamMembers.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Team Members</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {teamMembers.map(member => (
                <DropdownMenuItem
                  key={member.id}
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault(); // Prevent dropdown from closing
                    toggleTeamMember(member.id);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox
                      checked={selectedTeamMembers.includes(member.id)}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                      }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>
                    <span className="flex-1">{member.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsDialog(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Month View */}
      {viewType === 'month' && selectedTeamMembers.length === 0 && (
        <div ref={calendarRef} className="flex-1">
        <Card className="h-full overflow-hidden border-gray-200/60 dark:border-gray-700/60">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day}
                className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
            {calendarDays.map((day, index) => {
              const dayMeetings = getMeetingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={index}
                  className={cn(
                    "border-r border-b border-gray-200 dark:border-gray-700 p-2 min-h-[120px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
                    !isCurrentMonth && "bg-gray-50/50 dark:bg-gray-900/50",
                    isDayToday && "bg-blue-50/50 dark:bg-blue-900/20"
                  )}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewType('day');
                  }}
                  onDoubleClick={() => {
                    openScheduleDialogWithTime(day, '09:00');
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isCurrentMonth ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600",
                      isDayToday && "w-6 h-6 rounded-full flex items-center justify-center text-white"
                    )}
                    style={isDayToday ? { backgroundColor: 'var(--primaryColor)' } : {}}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map(meeting => (
                      <button
                        key={meeting.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, meeting)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "w-full text-left p-1.5 rounded text-xs hover:opacity-80 transition-opacity border cursor-move",
                          draggedMeeting?.id === meeting.id && "opacity-50"
                        )}
                        style={{ 
                          backgroundColor: `${getCalendarColor(meeting.calendar)}15`,
                          borderColor: `${getCalendarColor(meeting.calendar)}40`,
                          color: getCalendarColor(meeting.calendar)
                        }}
                        title={`${meeting.startTime} - ${meeting.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMeetingClick(meeting);
                        }}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {getMeetingIcon(meeting.type)}
                          <span className="truncate font-medium">{meeting.startTime}</span>
                          <span className="truncate">{meeting.title}</span>
                        </div>
                      </button>
                    ))}
                    {dayMeetings.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        </div>
      )}

      {/* Day View */}
      {viewType === 'day' && selectedTeamMembers.length === 0 && (
        <div ref={calendarRef} className="flex-1">
        <Card className="h-full overflow-hidden border-gray-200/60 dark:border-gray-700/60">
          <div className="flex h-full">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Time</span>
              </div>
              {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => (
                <div key={hour} className="h-20 border-b border-gray-200 dark:border-gray-700 px-2 py-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Column */}
            <div className="flex-1 overflow-y-auto">
              {/* Day Header */}
              <div className="h-16 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {format(currentDate, 'EEEE')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(currentDate, 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="relative">
                {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => {
                  const hourMeetings = meetings.filter(meeting => {
                    if (!isSameDay(new Date(meeting.date), currentDate)) return false;
                    if (!calendarSources.find(s => s.id === meeting.calendar)?.enabled) return false;
                    const meetingHour = parseInt(meeting.startTime.split(':')[0]);
                    return meetingHour === hour;
                  });

                  return (
                    <div 
                      key={hour} 
                      className="h-20 border-b border-gray-200 dark:border-gray-700 px-4 py-1 relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onDoubleClick={() => {
                        openScheduleDialogWithTime(currentDate, `${hour.toString().padStart(2, '0')}:00`);
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, currentDate, `${hour.toString().padStart(2, '0')}:00`)}
                    >
                      {hourMeetings.map(meeting => (
                        <button
                          key={meeting.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, meeting)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "w-full text-left p-2 rounded-lg mb-1 border transition-all hover:shadow-md cursor-move",
                            draggedMeeting?.id === meeting.id && "opacity-50"
                          )}
                          style={{ 
                            backgroundColor: `${getCalendarColor(meeting.calendar)}15`,
                            borderColor: `${getCalendarColor(meeting.calendar)}60`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMeetingClick(meeting);
                          }}
                          onDoubleClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                              getMeetingColor(meeting.type)
                            )}>
                              {getMeetingIcon(meeting.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {meeting.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {meeting.startTime} - {meeting.endTime}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {meeting.client}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Week View */}
      {viewType === 'week' && selectedTeamMembers.length === 0 && (
        <div ref={calendarRef} className="flex-1">
        <Card className="h-full overflow-hidden border-gray-200/60 dark:border-gray-700/60">
          <div className="flex h-full">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="h-16 border-b border-gray-200 dark:border-gray-700" />
              {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => (
                <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 px-2 py-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>
              ))}
            </div>

            {/* Week Days */}
            <div className="flex-1 flex overflow-x-auto">
              {eachDayOfInterval({ 
                start: startOfWeek(currentDate), 
                end: endOfWeek(currentDate) 
              }).map((day, dayIndex) => {
                const dayMeetings = getMeetingsForDate(day);
                const isDayToday = isToday(day);

                return (
                  <div key={dayIndex} className="flex-1 min-w-[140px] border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    {/* Day Header */}
                    <div 
                      className={cn(
                        "h-16 border-b border-gray-200 dark:border-gray-700 p-2 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        isDayToday && "bg-blue-50/50 dark:bg-blue-900/20"
                      )}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewType('day');
                      }}
                    >
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {format(day, 'EEE')}
                      </div>
                      <div className={cn(
                        "text-lg font-semibold mt-1",
                        isDayToday && "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white"
                      )}
                      style={isDayToday ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => {
                      const hourMeetings = dayMeetings.filter(meeting => {
                        const meetingHour = parseInt(meeting.startTime.split(':')[0]);
                        return meetingHour === hour;
                      });

                      return (
                        <div 
                          key={hour} 
                          className="h-16 border-b border-gray-200 dark:border-gray-700 p-0.5 relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onDoubleClick={() => {
                            openScheduleDialogWithTime(day, `${hour.toString().padStart(2, '0')}:00`);
                          }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, `${hour.toString().padStart(2, '0')}:00`)}
                        >
                          {hourMeetings.map(meeting => (
                            <button
                              key={meeting.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, meeting)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "w-full text-left p-1 rounded text-xs hover:opacity-80 transition-opacity mb-0.5 cursor-move",
                                draggedMeeting?.id === meeting.id && "opacity-50"
                              )}
                              style={{ 
                                backgroundColor: `${getCalendarColor(meeting.calendar)}`,
                                color: 'white'
                              }}
                              title={`${meeting.startTime} - ${meeting.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMeetingClick(meeting);
                              }}
                              onDoubleClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1">
                                {getMeetingIcon(meeting.type)}
                                <span className="truncate font-medium">{meeting.startTime}</span>
                              </div>
                              <div className="truncate text-xs opacity-90">
                                {meeting.title}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Team View - Column Layout */}
      {selectedTeamMembers.length > 0 && (
        <div ref={calendarRef} className="flex-1">
        <Card className="h-full overflow-hidden border-gray-200/60 dark:border-gray-700/60">
          <div className="flex h-full">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="h-16 border-b border-gray-200 dark:border-gray-700" />
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 px-2 py-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {hour}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Team Member Columns */}
            <div className="flex-1 flex overflow-x-auto">
              {selectedTeamMembers.map(memberId => {
                const member = teamMembers.find(m => m.id === memberId);
                if (!member) return null;

                return (
                  <div key={memberId} className="flex-1 min-w-[200px] border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    {/* Member Header */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </span>
                    </div>

                    {/* Time Slots */}
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <div 
                        key={hour} 
                        className="h-16 border-b border-gray-200 dark:border-gray-700 p-1 relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onDoubleClick={() => {
                          openScheduleDialogWithTime(currentDate, `${hour.toString().padStart(2, '0')}:00`);
                        }}
                      >
                        {/* Meetings would be positioned here based on time */}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Agenda View */}
      {viewType === 'agenda' && (
        <div className="flex-1 overflow-auto">
          <CalendarAgendaView
            meetings={meetings}
            onMeetingClick={(meeting) => {
              setSelectedMeeting(meeting);
              setShowMeetingDetails(true);
            }}
            onScheduleNew={() => setShowScheduleDialog(true)}
          />
        </div>
      )}

      {/* Analytics View */}
      {viewType === 'analytics' && (
        <div className="flex-1 overflow-auto">
          <MeetingAnalytics
            meetings={meetings}
            dateRange="month"
          />
        </div>
      )}

      {/* Calendar Settings Dialog */}
      <CalendarSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        calendarSources={calendarSources}
        onToggleSource={toggleCalendarSource}
        onUpdateColor={updateCalendarColor}
        onConnectAccount={handleConnectAccount}
        onDisconnectAccount={handleDisconnectAccount}
        defaultTimeZone={defaultTimeZone}
        onTimeZoneChange={handleTimeZoneChange}
      />

      {/* Schedule Meeting Dialog */}
      <ScheduleMeetingDialog
        open={showScheduleDialog}
        onOpenChange={(open) => {
          setShowScheduleDialog(open);
          if (!open) {
            // Clear initial values when dialog closes
            setInitialMeetingDate(undefined);
            setInitialMeetingTime(undefined);
          }
        }}
        onSave={handleScheduleMeeting}
        showClientSelector={true}
        initialDate={initialMeetingDate}
        initialTime={initialMeetingTime}
        defaultTimeZone={defaultTimeZone}
      />

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        open={showMeetingDetails}
        onOpenChange={setShowMeetingDetails}
        meeting={selectedMeeting}
        onEdit={handleEditMeeting}
        onDelete={handleDeleteMeeting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMeeting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Meeting Dialog */}
      {showEditDialog && selectedMeeting && (
        <ScheduleMeetingDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(meetingData) => {
            // Update the meeting in the list
            setMeetings(meetings.map(m => 
              m.id === selectedMeeting.id 
                ? { ...m, ...meetingData, id: selectedMeeting.id }
                : m
            ));
            toast.success('Meeting updated successfully');
            setShowEditDialog(false);
            setSelectedMeeting(null);
          }}
          showClientSelector={true}
          defaultTimeZone={defaultTimeZone}
          // Pre-fill with existing meeting data
          initialDate={new Date(selectedMeeting.date)}
          initialTime={selectedMeeting.startTime}
        />
      )}
    </div>
  );
}