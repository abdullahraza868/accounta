import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Search, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone,
  Users,
  Filter,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';
import { cn } from './ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type Meeting = {
  id: string;
  title: string;
  client: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'in-person' | 'call';
  videoProvider?: 'google-meet' | 'zoom';
  meetingLink?: string;
  location?: string;
  attendees: string[];
  description?: string;
  calendar: string;
};

type CalendarAgendaViewProps = {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onScheduleNew?: () => void;
};

export function CalendarAgendaView({
  meetings,
  onMeetingClick,
  onScheduleNew
}: CalendarAgendaViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'in-person' | 'call'>('all');
  const [dateRange, setDateRange] = useState<'upcoming' | 'today' | 'week' | 'month' | 'past'>('upcoming');

  // Filter meetings by search, type, and date range
  const filteredMeetings = meetings.filter(meeting => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = filterType === 'all' || meeting.type === filterType;

    // Date range filter
    const meetingDate = parseISO(meeting.date);
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekEnd = endOfDay(addDays(today, 7));
    const monthEnd = endOfDay(addDays(today, 30));

    let matchesDateRange = true;
    if (dateRange === 'upcoming') {
      matchesDateRange = isAfter(meetingDate, todayStart);
    } else if (dateRange === 'today') {
      matchesDateRange = isAfter(meetingDate, todayStart) && isBefore(meetingDate, todayEnd);
    } else if (dateRange === 'week') {
      matchesDateRange = isAfter(meetingDate, todayStart) && isBefore(meetingDate, weekEnd);
    } else if (dateRange === 'month') {
      matchesDateRange = isAfter(meetingDate, todayStart) && isBefore(meetingDate, monthEnd);
    } else if (dateRange === 'past') {
      matchesDateRange = isBefore(meetingDate, todayStart);
    }

    return matchesSearch && matchesType && matchesDateRange;
  }).sort((a, b) => {
    // Sort by date and time
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  // Group meetings by date
  const groupedMeetings = filteredMeetings.reduce((groups, meeting) => {
    const date = meeting.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meeting);
    return groups;
  }, {} as Record<string, Meeting[]>);

  const getMeetingIcon = (type: Meeting['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getMeetingTypeLabel = (type: Meeting['type']) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'call':
        return 'Call';
      case 'in-person':
        return 'In-Person';
    }
  };

  const getMeetingTypeColor = (type: Meeting['type']) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'call':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'in-person':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const isToday = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col gap-3">
        {/* Dropdowns Row */}
        <div className="flex gap-3">
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Next 7 Days</SelectItem>
              <SelectItem value="month">Next 30 Days</SelectItem>
              <SelectItem value="past">Past Meetings</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="w-[400px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'} found
        </div>
      </div>

      {/* Meeting List */}
      <div className="space-y-6">
        {Object.keys(groupedMeetings).length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No meetings found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "You don't have any meetings scheduled"}
            </p>
          </Card>
        ) : (
          Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className={cn(
                "sticky top-0 z-10 py-2 px-4 rounded-lg backdrop-blur-sm",
                isToday(date) 
                  ? "bg-purple-100/90 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
                  : "bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
              )}>
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "font-semibold",
                    isToday(date)
                      ? "text-purple-900 dark:text-purple-100"
                      : "text-gray-900 dark:text-gray-100"
                  )}>
                    {formatDateHeader(date)}
                    {isToday(date) && (
                      <Badge className="ml-2" variant="default">Today</Badge>
                    )}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {dateMeetings.length} {dateMeetings.length === 1 ? 'meeting' : 'meetings'}
                  </div>
                </div>
              </div>

              {/* Meetings for this date */}
              <div className="space-y-2 pl-2">
                {dateMeetings.map((meeting) => (
                  <Card
                    key={meeting.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer group border-l-4"
                    style={{ borderLeftColor: 'var(--primaryColor)' }}
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Time */}
                      <div className="flex-shrink-0 w-20 text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {meeting.startTime}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {meeting.endTime}
                        </div>
                      </div>

                      {/* Meeting Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {meeting.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {meeting.client}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("flex items-center gap-1.5", getMeetingTypeColor(meeting.type))}
                          >
                            {getMeetingIcon(meeting.type)}
                            {getMeetingTypeLabel(meeting.type)}
                          </Badge>
                        </div>

                        {/* Meeting Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                          {meeting.type === 'video' && meeting.videoProvider && (
                            <div className="flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5" />
                              {meeting.videoProvider === 'google-meet' ? 'Google Meet' : 'Zoom'}
                            </div>
                          )}
                          {meeting.type === 'in-person' && meeting.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {meeting.location}
                            </div>
                          )}
                          {meeting.attendees && meeting.attendees.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {meeting.attendees.length} {meeting.attendees.length === 1 ? 'attendee' : 'attendees'}
                            </div>
                          )}
                          {meeting.description && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <span className="truncate max-w-xs">{meeting.description}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        {meeting.type === 'video' && meeting.meetingLink && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(meeting.meetingLink, '_blank');
                              }}
                              className="h-7 text-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              Join Meeting
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
