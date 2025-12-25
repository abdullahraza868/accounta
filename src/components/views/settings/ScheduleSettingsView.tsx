import { useState } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Globe,
  DollarSign,
  Edit,
  Copy,
  Trash2,
  Link2,
  Code,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Settings,
  CalendarCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Ban,
  RefreshCw,
  LayoutGrid,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Checkbox } from '../../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';

// Types
type MeetingType = 'open' | 'invite-only';
type MeetingLocation = 'auto-link' | 'phone' | 'in-person';
type MeetingPlatform = 'google-meet' | 'zoom' | 'teams';

type MeetingTypeItem = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: MeetingType;
  isPaid: boolean;
  price?: number;
  bufferBefore: number;
  bufferAfter: number;
  minAdvanceNotice: number; // hours
  maxAdvanceNotice: number; // days
  maxPerDay?: number;
  maxPerWeek?: number;
  location: MeetingLocation;
  platform?: MeetingPlatform;
  reminders: {
    email: { enabled: boolean; hours: number }[];
    sms: { enabled: boolean; hours: number }[];
  };
  bookingsThisMonth: number;
  revenue?: number;
};

type TimeBlock = {
  start: string;
  end: string;
};

type DaySchedule = {
  enabled: boolean;
  blocks: TimeBlock[];
};

type WeekSchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
};

type CalendarIntegration = {
  id: string;
  name: string;
  email: string;
  platform: 'google' | 'outlook';
  readForConflicts: boolean;
  writeBookings: boolean;
};

type BypassCode = {
  id: string;
  code: string;
  createdAt: Date;
  status: 'active' | 'used' | 'revoked';
  clientName?: string;
  clientEmail?: string;
  paymentMethod?: string;
  amount: number;
  notes?: string;
  usedAt?: Date;
  usedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
};

type CalendarSlot = {
  id: string;
  date: Date;
  day: string;
  time: string;
  status: 'available' | 'conflict' | 'blocked' | 'outside-hours' | 'override-available';
  conflictSource?: string;
  isManualOverride: boolean;
  notes: string;
};

export function ScheduleSettingsView() {
  const [activeTab, setActiveTab] = useState('meeting-types');

  // Meeting Types
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeItem[]>([
    {
      id: '1',
      name: 'Initial Consultation',
      description: 'Free 30-minute consultation to discuss your needs',
      duration: 30,
      type: 'open',
      isPaid: false,
      bufferBefore: 15,
      bufferAfter: 15,
      minAdvanceNotice: 24,
      maxAdvanceNotice: 60,
      maxPerDay: 5,
      maxPerWeek: 20,
      location: 'auto-link',
      platform: 'google-meet',
      reminders: {
        email: [{ enabled: true, hours: 24 }],
        sms: [{ enabled: true, hours: 1 }],
      },
      bookingsThisMonth: 15,
    },
    {
      id: '2',
      name: 'Tax Planning Session',
      description: 'Comprehensive tax planning discussion',
      duration: 60,
      type: 'invite-only',
      isPaid: false,
      bufferBefore: 15,
      bufferAfter: 15,
      minAdvanceNotice: 48,
      maxAdvanceNotice: 90,
      location: 'auto-link',
      platform: 'zoom',
      reminders: {
        email: [{ enabled: true, hours: 24 }],
        sms: [{ enabled: false, hours: 1 }],
      },
      bookingsThisMonth: 8,
    },
    {
      id: '3',
      name: 'Premium Advisory Call',
      description: 'One-on-one premium advisory session',
      duration: 60,
      type: 'open',
      isPaid: true,
      price: 150,
      bufferBefore: 15,
      bufferAfter: 30,
      minAdvanceNotice: 48,
      maxAdvanceNotice: 60,
      maxPerDay: 3,
      maxPerWeek: 10,
      location: 'auto-link',
      platform: 'zoom',
      reminders: {
        email: [{ enabled: true, hours: 24 }, { enabled: true, hours: 2 }],
        sms: [{ enabled: true, hours: 1 }],
      },
      bookingsThisMonth: 12,
      revenue: 1800,
    },
  ]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingTypeItem | null>(null);
  const [bypassCodesDialogOpen, setBypassCodesDialogOpen] = useState(false);

  // Availability Settings
  const [availabilityWindow, setAvailabilityWindow] = useState<'30' | '60' | 'rolling' | 'custom'>('rolling');
  const [rollingDays, setRollingDays] = useState(45);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [timeSlotIncrement, setTimeSlotIncrement] = useState(30);

  // Weekly Schedule
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({
    monday: {
      enabled: true,
      blocks: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
    },
    tuesday: {
      enabled: true,
      blocks: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
    },
    wednesday: {
      enabled: true,
      blocks: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
    },
    thursday: {
      enabled: true,
      blocks: [{ start: '09:00', end: '17:00' }],
    },
    friday: {
      enabled: true,
      blocks: [{ start: '09:00', end: '15:00' }],
    },
    saturday: { enabled: false, blocks: [] },
    sunday: { enabled: false, blocks: [] },
  });

  // Calendar Integrations
  const [calendarIntegrations, setCalendarIntegrations] = useState<CalendarIntegration[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      platform: 'google',
      readForConflicts: true,
      writeBookings: true,
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      platform: 'outlook',
      readForConflicts: true,
      writeBookings: true,
    },
    {
      id: '3',
      name: 'Conference Room A',
      email: 'conference-a@example.com',
      platform: 'google',
      readForConflicts: false,
      writeBookings: true,
    },
    {
      id: '4',
      name: 'Team Calendar',
      email: 'team@example.com',
      platform: 'google',
      readForConflicts: false,
      writeBookings: true,
    },
  ]);

  // Widget Settings
  const [widgetSettings, setWidgetSettings] = useState({
    selectedMeetingTypes: ['1', '3'],
    style: 'inline' as 'inline' | 'popup',
    heading: 'Schedule a Consultation',
    description: 'Book a free consultation with our team',
    fontFamily: 'Inter',
    colors: {
      primary: '#764498',
      primaryText: '#FFFFFF',
      secondary: '#ede2f5',
      secondaryText: '#09090B',
      button: '#764498',
      buttonText: '#FFFFFF',
      buttonHover: '#4B2472',
      buttonHoverText: '#FFFFFF',
      border: '#D4D4D8',
    },
    allowedDomains: ['yourdomain.com', 'www.yourdomain.com', 'blog.yourdomain.com'],
  });
  const [newDomain, setNewDomain] = useState('');

  // Bypass Codes
  const [bypassCodes, setBypassCodes] = useState<BypassCode[]>([
    {
      id: '1',
      code: 'PAID-2024-ABC123',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
      paymentMethod: 'Zelle',
      amount: 150,
      notes: 'Paid via Zelle on 12/15',
    },
    {
      id: '2',
      code: 'PAID-2024-XYZ789',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@example.com',
      paymentMethod: 'Check #1234',
      amount: 150,
      notes: 'Check received and deposited',
    },
    {
      id: '3',
      code: 'PAID-2024-DEF456',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: 'used',
      clientName: 'Michael Chen',
      clientEmail: 'michael@example.com',
      paymentMethod: 'Zelle',
      amount: 150,
      usedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      usedBy: 'Michael Chen',
    },
  ]);

  const [generateCodeDialogOpen, setGenerateCodeDialogOpen] = useState(false);

  // Calendar Override State
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [slotDetailDialog, setSlotDetailDialog] = useState<{
    open: boolean;
    slot: CalendarSlot | null;
  }>({ open: false, slot: null });
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Sample calendar slots with conflicts
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>(
    generateWeekSlots(currentWeekStart)
  );

  function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function generateWeekSlots(weekStart: Date): CalendarSlot[] {
    const slots: CalendarSlot[] = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; // 8am to 5pm

    days.forEach((day, dayIndex) => {
      hours.forEach((hour) => {
        const slotDate = new Date(weekStart);
        slotDate.setDate(slotDate.getDate() + dayIndex);
        slotDate.setHours(hour, 0, 0, 0);

        const id = `${day}-${hour}`;
        
        // Add some sample conflicts
        let status: 'available' | 'conflict' | 'blocked' | 'outside-hours' | 'override-available' = 'available';
        let conflictSource = '';
        
        // Sample conflicts on Tuesday 10am and Thursday 2pm
        if ((day === 'tuesday' && hour === 10) || (day === 'thursday' && hour === 14)) {
          status = 'conflict';
          conflictSource = 'john.doe@gmail.com (Google Calendar)';
        }
        
        // Sample manual blocks on Monday 3pm and Friday 4pm
        if ((day === 'monday' && hour === 15) || (day === 'friday' && hour === 16)) {
          status = 'blocked';
        }

        // Outside hours (weekends before 10am and after 3pm)
        if ((day === 'saturday' || day === 'sunday') && (hour < 10 || hour > 15)) {
          status = 'outside-hours';
        }

        slots.push({
          id,
          date: slotDate,
          day,
          time: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
          status,
          conflictSource,
          isManualOverride: false,
          notes: '',
        });
      });
    });

    return slots;
  }

  const handleCreateMeetingType = () => {
    setCreateDialogOpen(true);
  };

  const handleEditMeetingType = (meetingType: MeetingTypeItem) => {
    setSelectedMeetingType(meetingType);
    setEditDialogOpen(true);
  };

  const handleDeleteMeetingType = (id: string) => {
    setMeetingTypes(prev => prev.filter(mt => mt.id !== id));
    toast.success('Meeting type deleted');
  };

  const handleCopyLink = (meetingType: MeetingTypeItem) => {
    const link = `https://app.acounta.io/book/${meetingType.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Booking link copied to clipboard');
  };

  const handleViewBypassCodes = (meetingType: MeetingTypeItem) => {
    setSelectedMeetingType(meetingType);
    setBypassCodesDialogOpen(true);
  };

  const handleAddDomain = () => {
    if (newDomain && !widgetSettings.allowedDomains.includes(newDomain)) {
      setWidgetSettings(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, newDomain],
      }));
      setNewDomain('');
      toast.success('Domain added');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setWidgetSettings(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domain),
    }));
    toast.success('Domain removed');
  };

  const handleCopyWidgetCode = () => {
    const code = `<!-- Acounta Schedule Widget -->
<script src="https://app.acounta.io/widget.js"
  data-widget-id="wg_abc123xyz"
  data-style="${widgetSettings.style}">
</script>`;
    navigator.clipboard.writeText(code);
    toast.success('Widget code copied to clipboard');
  };

  const handleSaveAvailability = () => {
    toast.success('Availability settings saved!');
  };

  const handleAddTimeBlock = (day: keyof WeekSchedule) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: [...prev[day].blocks, { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const handleRemoveTimeBlock = (day: keyof WeekSchedule, index: number) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: prev[day].blocks.filter((_, i) => i !== index),
      },
    }));
  };

  const handleCopyToOtherDays = (fromDay: keyof WeekSchedule, block: TimeBlock) => {
    // This would open a dialog to select which days to copy to
    toast.info('Copy to other days dialog would open here');
  };

  const handleToggleCalendarIntegration = (id: string, field: 'readForConflicts' | 'writeBookings') => {
    setCalendarIntegrations(prev =>
      prev.map(cal =>
        cal.id === id ? { ...cal, [field]: !cal[field] } : cal
      )
    );
  };

  // Calendar Override Handlers
  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
    setCalendarSlots(generateWeekSlots(newWeekStart));
    setSelectedSlots([]);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
    setCalendarSlots(generateWeekSlots(newWeekStart));
    setSelectedSlots([]);
  };

  const handleCurrentWeek = () => {
    const today = getMonday(new Date());
    setCurrentWeekStart(today);
    setCalendarSlots(generateWeekSlots(today));
    setSelectedSlots([]);
  };

  const handleSlotClick = (slot: CalendarSlot) => {
    if (bulkSelectMode) {
      setSelectedSlots(prev =>
        prev.includes(slot.id)
          ? prev.filter(id => id !== slot.id)
          : [...prev, slot.id]
      );
    } else {
      setSlotDetailDialog({ open: true, slot });
    }
  };

  const handleToggleSlotBlock = (slotId: string) => {
    setCalendarSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const newStatus = slot.status === 'blocked' ? 'available' : 'blocked';
          return { ...slot, status: newStatus };
        }
        return slot;
      })
    );
    toast.success(
      calendarSlots.find(s => s.id === slotId)?.status === 'blocked'
        ? 'Time slot unblocked'
        : 'Time slot blocked'
    );
  };

  const handleOverrideConflict = (slotId: string) => {
    setCalendarSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId && slot.status === 'conflict') {
          return { ...slot, status: 'override-available', isManualOverride: true };
        }
        return slot;
      })
    );
    toast.success('Conflict overridden - slot now available');
  };

  const handleBulkBlock = () => {
    if (selectedSlots.length === 0) {
      toast.error('No slots selected');
      return;
    }
    setCalendarSlots(prev =>
      prev.map(slot =>
        selectedSlots.includes(slot.id)
          ? { ...slot, status: 'blocked' }
          : slot
      )
    );
    toast.success(`${selectedSlots.length} slots blocked`);
    setSelectedSlots([]);
    setBulkSelectMode(false);
  };

  const handleBulkUnblock = () => {
    if (selectedSlots.length === 0) {
      toast.error('No slots selected');
      return;
    }
    setCalendarSlots(prev =>
      prev.map(slot =>
        selectedSlots.includes(slot.id)
          ? { ...slot, status: 'available', isManualOverride: false }
          : slot
      )
    );
    toast.success(`${selectedSlots.length} slots unblocked`);
    setSelectedSlots([]);
    setBulkSelectMode(false);
  };

  const handleBlockEntireDay = (day: string) => {
    const slotsToBlock = calendarSlots.filter(slot => slot.day === day).map(s => s.id);
    setCalendarSlots(prev =>
      prev.map(slot =>
        slotsToBlock.includes(slot.id)
          ? { ...slot, status: 'blocked' }
          : slot
      )
    );
    toast.success(`All slots blocked for ${day}`);
  };

  const platformIcons = {
    'google-meet': Calendar,
    zoom: Globe,
    teams: Globe,
  };

  const dayLabels: { [key in keyof WeekSchedule]: string } = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="meeting-types" className="gap-2">
            <Clock className="w-4 h-4" />
            Meeting Types
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Calendar className="w-4 h-4" />
            Availability & Calendar
          </TabsTrigger>
          <TabsTrigger value="override" className="gap-2">
            <CalendarCheck className="w-4 h-4" />
            Calendar Override
          </TabsTrigger>
          <TabsTrigger value="widget" className="gap-2">
            <Code className="w-4 h-4" />
            Website Widget
          </TabsTrigger>
        </TabsList>

        {/* Meeting Types Tab */}
        <TabsContent value="meeting-types">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Meeting Types
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage different types of meetings clients can book
                </p>
              </div>
              <Button
                onClick={handleCreateMeetingType}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            </div>

            {/* Meeting Type Cards */}
            <div className="space-y-4">
              {meetingTypes.map((meeting) => {
                const PlatformIcon = meeting.platform ? platformIcons[meeting.platform] : Clock;
                return (
                  <Card key={meeting.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {meeting.name}
                            </h4>
                            <Badge variant={meeting.type === 'open' ? 'default' : 'secondary'}>
                              {meeting.type === 'open' ? 'Open Meeting' : 'Invite Only'}
                            </Badge>
                            {meeting.isPaid && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                ${meeting.price}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {meeting.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {meeting.duration} minutes
                            </span>
                            {meeting.type === 'open' && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Link2 className="w-4 h-4" />
                                  Booking Link
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-4 h-4" />
                                  Widget Available
                                </span>
                              </>
                            )}
                            {meeting.platform && (
                              <span className="flex items-center gap-1">
                                <PlatformIcon className="w-4 h-4" />
                                {meeting.platform.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              📊 {meeting.bookingsThisMonth} bookings this month
                            </span>
                            {meeting.revenue && (
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                💰 ${meeting.revenue.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMeetingType(meeting)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(meeting)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Link
                          </Button>
                          {meeting.type === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info('Widget code dialog would open')}
                            >
                              <Code className="w-4 h-4 mr-1" />
                              Widget Code
                            </Button>
                          )}
                          {meeting.isPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewBypassCodes(meeting)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Bypass Codes
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteMeetingType(meeting.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Availability & Calendar Tab */}
        <TabsContent value="availability">
          <div className="space-y-6">
            {/* Availability Window */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    📅 Availability Window
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    How far in advance can clients book?
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="availability"
                      value="30"
                      checked={availabilityWindow === '30'}
                      onChange={(e) => setAvailabilityWindow(e.target.value as any)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-900 dark:text-gray-100">Next 30 days (recommended)</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="availability"
                      value="60"
                      checked={availabilityWindow === '60'}
                      onChange={(e) => setAvailabilityWindow(e.target.value as any)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-900 dark:text-gray-100">Next 60 days</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="availability"
                      value="rolling"
                      checked={availabilityWindow === 'rolling'}
                      onChange={(e) => setAvailabilityWindow(e.target.value as any)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-gray-900 dark:text-gray-100">Rolling window:</span>
                      <Input
                        type="number"
                        value={rollingDays}
                        onChange={(e) => setRollingDays(parseInt(e.target.value))}
                        className="w-20"
                        min={1}
                        max={365}
                        disabled={availabilityWindow !== 'rolling'}
                      />
                      <span className="text-gray-900 dark:text-gray-100">days ahead</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="availability"
                      value="custom"
                      checked={availabilityWindow === 'custom'}
                      onChange={(e) => setAvailabilityWindow(e.target.value as any)}
                      className="w-4 h-4 text-purple-600 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100 block mb-2">Custom date range:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          disabled={availabilityWindow !== 'custom'}
                        />
                        <span className="text-gray-600">to</span>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          disabled={availabilityWindow !== 'custom'}
                        />
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ Rolling window automatically updates daily
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      🗓️ Weekly Schedule
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set your regular weekly availability
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Load Preset
                  </Button>
                </div>

                <div className="space-y-4">
                  {(Object.keys(weekSchedule) as Array<keyof WeekSchedule>).map((day) => {
                    const schedule = weekSchedule[day];
                    return (
                      <div
                        key={day}
                        className={cn(
                          'border rounded-lg p-4',
                          schedule.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={schedule.enabled}
                            onCheckedChange={(checked) =>
                              setWeekSchedule(prev => ({
                                ...prev,
                                [day]: { ...prev[day], enabled: !!checked },
                              }))
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {dayLabels[day]}
                            </h4>

                            {schedule.enabled ? (
                              <div className="space-y-2">
                                {schedule.blocks.map((block, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={block.start}
                                      onChange={(e) => {
                                        const newBlocks = [...schedule.blocks];
                                        newBlocks[index].start = e.target.value;
                                        setWeekSchedule(prev => ({
                                          ...prev,
                                          [day]: { ...prev[day], blocks: newBlocks },
                                        }));
                                      }}
                                      className="w-32"
                                    />
                                    <span className="text-gray-600">-</span>
                                    <Input
                                      type="time"
                                      value={block.end}
                                      onChange={(e) => {
                                        const newBlocks = [...schedule.blocks];
                                        newBlocks[index].end = e.target.value;
                                        setWeekSchedule(prev => ({
                                          ...prev,
                                          [day]: { ...prev[day], blocks: newBlocks },
                                        }));
                                      }}
                                      className="w-32"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveTimeBlock(day, index)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCopyToOtherDays(day, block)}
                                    >
                                      Copy to
                                      <ChevronDown className="w-3 h-3 ml-1" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAddTimeBlock(day)}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Time Block
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Unavailable</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => toast.info('Save as preset functionality')}
                >
                  Save as Preset...
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  📆 Calendar Integration
                </h3>

                <div className="space-y-6">
                  {/* Check for Conflicts */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Check these calendars for conflicts:
                    </h4>
                    <div className="space-y-2">
                      {calendarIntegrations.map((cal) => (
                        <div
                          key={cal.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={cal.readForConflicts}
                              onCheckedChange={() => handleToggleCalendarIntegration(cal.id, 'readForConflicts')}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {cal.name} ({cal.platform === 'google' ? 'Google' : 'Outlook'} Calendar)
                              </p>
                              <p className="text-sm text-gray-500">{cal.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      ℹ️ We'll block times when these calendars show busy
                    </p>
                  </div>

                  {/* Write Bookings To */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Add bookings to these calendars:
                    </h4>
                    <div className="space-y-2">
                      {calendarIntegrations.map((cal) => (
                        <div
                          key={cal.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={cal.writeBookings}
                              onCheckedChange={() => handleToggleCalendarIntegration(cal.id, 'writeBookings')}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {cal.name} ({cal.platform === 'google' ? 'Google' : 'Outlook'} Calendar)
                              </p>
                              <p className="text-sm text-gray-500">{cal.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      ℹ️ Confirmed bookings will appear in all selected calendars
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Configuration */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  ⚙️ Booking Slot Configuration
                </h3>

                <div>
                  <Label htmlFor="timeSlot">Default time slot increment</Label>
                  <Select
                    value={timeSlotIncrement.toString()}
                    onValueChange={(value) => setTimeSlotIncrement(parseInt(value))}
                  >
                    <SelectTrigger className="w-48 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Clients will see available times in this increment
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveAvailability}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Calendar Override Tab */}
        <TabsContent value="override">
          <div className="space-y-6">
            {/* Header with Week Navigation */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      📅 Calendar Override
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View conflicts and manually override availability for specific times
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousWeek}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCurrentWeek}
                    >
                      This Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextWeek}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Week Display */}
                <div className="flex items-center justify-between mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Viewing week of</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={bulkSelectMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setBulkSelectMode(!bulkSelectMode);
                        setSelectedSlots([]);
                      }}
                      className={bulkSelectMode ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : ''}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      {bulkSelectMode ? 'Cancel Selection' : 'Bulk Select'}
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions (only shown when in bulk select mode) */}
                {bulkSelectMode && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkBlock}
                          disabled={selectedSlots.length === 0}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block Selected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkUnblock}
                          disabled={selectedSlots.length === 0}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Unblock Selected
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Legend:</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conflict</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 border-2 border-gray-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Manually Blocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Outside Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-purple-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Override (Available)</span>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {/* Header Row - Days */}
                    <div className="grid grid-cols-8 gap-1 mb-1">
                      <div className="p-2 text-center text-xs font-semibold text-gray-500">Time</div>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="p-2 text-center">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{day}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs mt-1"
                            onClick={() => handleBlockEntireDay(day.toLowerCase())}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Block Day
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Time Rows */}
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => {
                      const timeLabel = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                      return (
                        <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                          {/* Time Label */}
                          <div className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center">
                            {timeLabel}
                          </div>

                          {/* Slots for each day */}
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const slot = calendarSlots.find(s => s.day === day && s.time === timeLabel);
                            if (!slot) return <div key={day} className="p-2"></div>;

                            const isSelected = selectedSlots.includes(slot.id);
                            
                            let bgColor = 'bg-gray-50 dark:bg-gray-800';
                            let borderColor = 'border-gray-300 dark:border-gray-700';
                            let hoverColor = 'hover:border-gray-400';

                            if (slot.status === 'available') {
                              bgColor = 'bg-green-100 dark:bg-green-900/30';
                              borderColor = 'border-green-500';
                              hoverColor = 'hover:border-green-600';
                            } else if (slot.status === 'conflict') {
                              bgColor = 'bg-red-100 dark:bg-red-900/30';
                              borderColor = 'border-red-500';
                              hoverColor = 'hover:border-red-600';
                            } else if (slot.status === 'blocked') {
                              bgColor = 'bg-gray-300 dark:bg-gray-600';
                              borderColor = 'border-gray-500';
                              hoverColor = 'hover:border-gray-600';
                            } else if (slot.status === 'override-available') {
                              bgColor = 'bg-green-100 dark:bg-green-900/30';
                              borderColor = 'border-purple-500';
                              hoverColor = 'hover:border-purple-600';
                            }

                            if (isSelected) {
                              borderColor = 'border-purple-600';
                            }

                            return (
                              <button
                                key={slot.id}
                                onClick={() => handleSlotClick(slot)}
                                className={cn(
                                  'p-2 rounded border-2 transition-all cursor-pointer min-h-[60px] flex items-center justify-center',
                                  bgColor,
                                  borderColor,
                                  hoverColor,
                                  isSelected && 'ring-2 ring-purple-500'
                                )}
                              >
                                {slot.status === 'conflict' && !bulkSelectMode && (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                                {slot.status === 'blocked' && !bulkSelectMode && (
                                  <Ban className="w-4 h-4 text-gray-600" />
                                )}
                                {slot.status === 'override-available' && !bulkSelectMode && (
                                  <CheckCircle className="w-4 h-4 text-purple-600" />
                                )}
                                {bulkSelectMode && isSelected && (
                                  <CheckCircle className="w-4 h-4 text-purple-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <p>Click any slot to view details or override. Use bulk select to block/unblock multiple slots at once.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slot Detail Dialog */}
          <Dialog open={slotDetailDialog.open} onOpenChange={(open) => setSlotDetailDialog({ open, slot: null })}>
            <DialogContent aria-describedby="slot-details-description">
              <DialogHeader>
                <DialogTitle>Time Slot Details</DialogTitle>
                <DialogDescription id="slot-details-description" className="sr-only">
                  View detailed information about this time slot
                </DialogDescription>
              </DialogHeader>
              {slotDetailDialog.slot && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</Label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {slotDetailDialog.slot.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{slotDetailDialog.slot.time}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {slotDetailDialog.slot.status === 'available' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Available for booking</span>
                        </>
                      )}
                      {slotDetailDialog.slot.status === 'conflict' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Conflict detected</span>
                        </>
                      )}
                      {slotDetailDialog.slot.status === 'blocked' && (
                        <>
                          <Ban className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Manually blocked</span>
                        </>
                      )}
                      {slotDetailDialog.slot.status === 'outside-hours' && (
                        <>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Outside working hours</span>
                        </>
                      )}
                      {slotDetailDialog.slot.status === 'override-available' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">Available (conflict overridden)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {slotDetailDialog.slot.conflictSource && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Label className="text-sm font-medium text-red-700 dark:text-red-300">Conflict Source</Label>
                      <p className="text-sm text-red-900 dark:text-red-100 mt-1">{slotDetailDialog.slot.conflictSource}</p>
                    </div>
                  )}

                  {slotDetailDialog.slot.isManualOverride && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">Manual Override Active</Label>
                      <p className="text-sm text-purple-900 dark:text-purple-100 mt-1">
                        You've manually overridden the conflict for this slot
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                    <Textarea
                      placeholder="Add notes about this time slot..."
                      className="mt-1"
                      rows={3}
                      value={slotDetailDialog.slot.notes}
                      onChange={(e) => {
                        if (slotDetailDialog.slot) {
                          setCalendarSlots(prev =>
                            prev.map(s =>
                              s.id === slotDetailDialog.slot!.id
                                ? { ...s, notes: e.target.value }
                                : s
                            )
                          );
                          setSlotDetailDialog({
                            ...slotDetailDialog,
                            slot: { ...slotDetailDialog.slot, notes: e.target.value }
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSlotDetailDialog({ open: false, slot: null })}>
                  Close
                </Button>
                {slotDetailDialog.slot?.status === 'conflict' && (
                  <Button
                    onClick={() => {
                      if (slotDetailDialog.slot) {
                        handleOverrideConflict(slotDetailDialog.slot.id);
                        setSlotDetailDialog({ open: false, slot: null });
                      }
                    }}
                    className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Override Conflict
                  </Button>
                )}
                {(slotDetailDialog.slot?.status === 'available' || slotDetailDialog.slot?.status === 'override-available') && (
                  <Button
                    onClick={() => {
                      if (slotDetailDialog.slot) {
                        handleToggleSlotBlock(slotDetailDialog.slot.id);
                        setSlotDetailDialog({ open: false, slot: null });
                      }
                    }}
                    variant="destructive"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Block Slot
                  </Button>
                )}
                {slotDetailDialog.slot?.status === 'blocked' && (
                  <Button
                    onClick={() => {
                      if (slotDetailDialog.slot) {
                        handleToggleSlotBlock(slotDetailDialog.slot.id);
                        setSlotDetailDialog({ open: false, slot: null });
                      }
                    }}
                    className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Unblock Slot
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Website Widget Tab */}
        <TabsContent value="widget">
          <div className="space-y-6">
            {/* Step 1: Select Meeting Types */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Step 1: Select Meeting Types to Display
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose which meeting types appear in the widget:
                </p>

                <div className="space-y-2">
                  {meetingTypes
                    .filter((mt) => mt.type === 'open')
                    .map((meeting) => (
                      <div key={meeting.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={widgetSettings.selectedMeetingTypes.includes(meeting.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWidgetSettings(prev => ({
                                ...prev,
                                selectedMeetingTypes: [...prev.selectedMeetingTypes, meeting.id],
                              }));
                            } else {
                              setWidgetSettings(prev => ({
                                ...prev,
                                selectedMeetingTypes: prev.selectedMeetingTypes.filter(id => id !== meeting.id),
                              }));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {meeting.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{meeting.duration} min</span>
                            <span>•</span>
                            <span>{meeting.type === 'open' ? 'Open' : 'Invite Only'}</span>
                            {meeting.isPaid && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">${meeting.price}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ Only "Open" meeting types can be embedded on website
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Customize Appearance */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Step 2: Customize Widget Appearance
                </h3>

                <div className="space-y-6">
                  {/* Widget Style */}
                  <div>
                    <Label>Widget Style</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="widgetStyle"
                          value="inline"
                          checked={widgetSettings.style === 'inline'}
                          onChange={(e) =>
                            setWidgetSettings(prev => ({ ...prev, style: e.target.value as any }))
                          }
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Inline</p>
                          <p className="text-sm text-gray-600">Embedded directly in page</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="widgetStyle"
                          value="popup"
                          checked={widgetSettings.style === 'popup'}
                          onChange={(e) =>
                            setWidgetSettings(prev => ({ ...prev, style: e.target.value as any }))
                          }
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Popup Modal</p>
                          <p className="text-sm text-gray-600">Button that opens booking overlay</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="heading">Section Heading</Label>
                      <Input
                        id="heading"
                        value={widgetSettings.heading}
                        onChange={(e) =>
                          setWidgetSettings(prev => ({ ...prev, heading: e.target.value }))
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Section Description</Label>
                      <Textarea
                        id="description"
                        value={widgetSettings.description}
                        onChange={(e) =>
                          setWidgetSettings(prev => ({ ...prev, description: e.target.value }))
                        }
                        className="mt-2"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <Label className="mb-3 block">Colors</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries({
                        primary: 'Primary Color',
                        primaryText: 'Primary Text',
                        secondary: 'Secondary Color',
                        secondaryText: 'Secondary Text',
                        button: 'Button Color',
                        buttonText: 'Button Text',
                        buttonHover: 'Button Hover',
                        buttonHoverText: 'Button Hover Text',
                      }).map(([key, label]) => (
                        <div key={key}>
                          <Label htmlFor={key} className="text-sm">{label}</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              id={key}
                              value={widgetSettings.colors[key as keyof typeof widgetSettings.colors]}
                              onChange={(e) =>
                                setWidgetSettings(prev => ({
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value },
                                }))
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={widgetSettings.colors[key as keyof typeof widgetSettings.colors]}
                              onChange={(e) =>
                                setWidgetSettings(prev => ({
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value },
                                }))
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      Reset to Brand Colors
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Domain Security */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Step 3: Domain Security
                </h3>

                <div>
                  <Label>Allowed Domains (Whitelist)</Label>
                  <div className="flex gap-2 mt-2 mb-3">
                    <Input
                      placeholder="yourdomain.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDomain();
                        }
                      }}
                    />
                    <Button onClick={handleAddDomain}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {widgetSettings.allowedDomains.map((domain) => (
                      <div
                        key={domain}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-900 dark:text-gray-100">{domain}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveDomain(domain)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    ℹ️ Widget will only work on whitelisted domains
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Preview & Code */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Step 4: Preview & Get Code
                </h3>

                <div className="space-y-6">
                  {/* Preview */}
                  <div>
                    <Label className="mb-2 block">Preview:</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                      <h4 className="text-xl font-semibold mb-2" style={{ color: widgetSettings.colors.primary }}>
                        {widgetSettings.heading}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {widgetSettings.description}
                      </p>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a meeting type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {widgetSettings.selectedMeetingTypes.map((id) => {
                            const meeting = meetingTypes.find((m) => m.id === id);
                            return meeting ? (
                              <SelectItem key={id} value={id}>
                                {meeting.name} ({meeting.duration} min)
                              </SelectItem>
                            ) : null;
                          })}
                        </SelectContent>
                      </Select>
                      <Button
                        className="mt-4"
                        style={{
                          backgroundColor: widgetSettings.colors.button,
                          color: widgetSettings.colors.buttonText,
                        }}
                      >
                        Choose Time →
                      </Button>
                    </div>
                  </div>

                  {/* Embed Code */}
                  <div>
                    <Label className="mb-2 block">Embed Code:</Label>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`<!-- Acounta Schedule Widget -->
<script src="https://app.acounta.io/widget.js"
  data-widget-id="wg_abc123xyz"
  data-style="${widgetSettings.style}">
</script>`}</code>
                      </pre>
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopyWidgetCode}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">Open Preview in New Tab</Button>
                    <Button className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                      Save Widget Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bypass Codes Dialog */}
      {selectedMeetingType && (
        <Dialog open={bypassCodesDialogOpen} onOpenChange={setBypassCodesDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" aria-describedby="bypass-codes-description">
            <DialogHeader>
              <DialogTitle>
                Payment Bypass Codes - {selectedMeetingType.name}
              </DialogTitle>
              <DialogDescription id="bypass-codes-description">
                Generate codes for clients who paid via alternative methods (Zelle, check, wire transfer, etc)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate codes for clients who paid via alternative methods (Zelle, check, wire transfer, etc)
              </p>

              <Button
                onClick={() => setGenerateCodeDialogOpen(true)}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate New Bypass Code
              </Button>

              {/* Active Codes */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Active Codes</h4>
                <div className="space-y-3">
                  {bypassCodes
                    .filter((code) => code.status === 'active')
                    .map((code) => (
                      <Card key={code.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {code.code}
                              </p>
                              <p className="text-sm text-gray-600">
                                Created: {code.createdAt.toLocaleDateString()} • Status: Active
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-gray-100">
                              For: {code.clientName} ({code.clientEmail})
                            </p>
                            <p className="text-gray-600">
                              Payment Method: {code.paymentMethod} • Amount: ${code.amount}
                            </p>
                            {code.notes && (
                              <p className="text-gray-600">Notes: {code.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(code.code);
                                toast.success('Code copied');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy Code
                            </Button>
                            <Button size="sm" variant="outline">
                              Send to Client
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Used Codes */}
              {bypassCodes.filter((code) => code.status === 'used').length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Used Codes</h4>
                  <div className="space-y-3">
                    {bypassCodes
                      .filter((code) => code.status === 'used')
                      .map((code) => (
                        <Card key={code.id} className="p-4 opacity-75">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                                  {code.code}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Created: {code.createdAt.toLocaleDateString()} • Used:{' '}
                                  {code.usedAt?.toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary">Used</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Booked By: {code.usedBy}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Generate Bypass Code Dialog (placeholder - will implement fully) */}
      <Dialog open={generateCodeDialogOpen} onOpenChange={setGenerateCodeDialogOpen}>
        <DialogContent aria-describedby="generate-bypass-code-description">
          <DialogHeader>
            <DialogTitle>Generate Bypass Code</DialogTitle>
            <DialogDescription id="generate-bypass-code-description">
              Create a bypass code for clients who paid via alternative methods
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Full bypass code generation form will be implemented here with client info, payment details, etc.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateCodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              Create Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
