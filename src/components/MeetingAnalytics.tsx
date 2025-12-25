import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Phone,
  BarChart3,
  PieChart
} from 'lucide-react';
import { cn } from './ui/utils';
import { parseISO, isBefore, startOfDay, differenceInDays, format } from 'date-fns';

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

type MeetingAnalyticsProps = {
  meetings: Meeting[];
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
};

export function MeetingAnalytics({ meetings, dateRange = 'month' }: MeetingAnalyticsProps) {
  const today = new Date();
  const todayStart = startOfDay(today);

  // Calculate date range
  const getDaysInRange = () => {
    switch (dateRange) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
    }
  };

  const daysInRange = getDaysInRange();
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - daysInRange);

  // Filter meetings in range
  const meetingsInRange = meetings.filter(m => {
    const meetingDate = parseISO(m.date);
    return meetingDate >= rangeStart && meetingDate <= today;
  });

  const upcomingMeetings = meetings.filter(m => {
    const meetingDate = parseISO(m.date);
    return meetingDate >= todayStart;
  });

  const pastMeetings = meetings.filter(m => {
    const meetingDate = parseISO(m.date);
    return isBefore(meetingDate, todayStart);
  });

  // Calculate statistics
  const totalMeetings = meetingsInRange.length;
  const videoMeetings = meetingsInRange.filter(m => m.type === 'video').length;
  const inPersonMeetings = meetingsInRange.filter(m => m.type === 'in-person').length;
  const phoneMeetings = meetingsInRange.filter(m => m.type === 'call').length;

  // Calculate average meetings per week
  const avgPerWeek = Math.round((totalMeetings / daysInRange) * 7 * 10) / 10;

  // Calculate total meeting time (rough estimate based on typical meeting duration)
  const calculateMeetingDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  const totalMinutes = meetingsInRange.reduce((sum, m) => {
    return sum + calculateMeetingDuration(m.startTime, m.endTime);
  }, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Find most active client
  const clientMeetingCounts = meetingsInRange.reduce((counts, m) => {
    counts[m.client] = (counts[m.client] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const mostActiveClient = Object.entries(clientMeetingCounts)
    .sort(([, a], [, b]) => b - a)[0];

  // Calculate percentages
  const videoPercentage = totalMeetings > 0 ? Math.round((videoMeetings / totalMeetings) * 100) : 0;
  const inPersonPercentage = totalMeetings > 0 ? Math.round((inPersonMeetings / totalMeetings) * 100) : 0;
  const phonePercentage = totalMeetings > 0 ? Math.round((phoneMeetings / totalMeetings) * 100) : 0;

  const stats = [
    {
      label: 'Total Meetings',
      value: totalMeetings,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      trend: totalMeetings > 0 ? '+' + totalMeetings : '0'
    },
    {
      label: 'Upcoming',
      value: upcomingMeetings.length,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: null
    },
    {
      label: 'Total Hours',
      value: totalHours,
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      trend: `${avgPerWeek}/week`
    },
    {
      label: 'Unique Clients',
      value: Object.keys(clientMeetingCounts).length,
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      trend: null
    },
  ];

  const getRangeLabel = () => {
    switch (dateRange) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 90 Days';
      case 'year': return 'Last Year';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meeting Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getRangeLabel()}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          {totalMeetings} meetings analyzed
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Meeting Type Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Meeting Type Distribution
          </h3>
        </div>

        <div className="space-y-4">
          {/* Video */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Calls</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {videoMeetings}
                </span>
                <Badge variant="secondary" className="text-xs min-w-[48px] justify-center">
                  {videoPercentage}%
                </Badge>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${videoPercentage}%` }}
              />
            </div>
          </div>

          {/* In-Person */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In-Person</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {inPersonMeetings}
                </span>
                <Badge variant="secondary" className="text-xs min-w-[48px] justify-center">
                  {inPersonPercentage}%
                </Badge>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${inPersonPercentage}%` }}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Calls</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {phoneMeetings}
                </span>
                <Badge variant="secondary" className="text-xs min-w-[48px] justify-center">
                  {phonePercentage}%
                </Badge>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${phonePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Most Active Client */}
      {mostActiveClient && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Most Active Client
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                {mostActiveClient[0]}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mostActiveClient[1]} {mostActiveClient[1] === 1 ? 'meeting' : 'meetings'} in this period
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--primaryColor)' }}>
              {mostActiveClient[1]}
            </div>
          </div>
        </Card>
      )}

      {/* Meeting History Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Meeting History
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Past Meetings
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pastMeetings.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Upcoming Meetings
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--primaryColor)' }}>
              {upcomingMeetings.length}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
