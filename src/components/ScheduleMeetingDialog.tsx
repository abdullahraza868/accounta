import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarIcon, Video, MapPin, Phone, Search, Check, ChevronDown, ChevronRight, User, Building2, Users, Plus, Minus, Globe, Mail, X, Bell } from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

type MeetingType = 'video' | 'in-person' | 'call';
type ReminderDuration = 'days' | 'hours';

type ScheduleMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meeting: { 
    title: string; 
    description?: string;
    date: string; 
    time: string; 
    type: MeetingType;
    videoProvider?: 'google-meet' | 'zoom';
    location?: string;
    clientId?: string;
    clientName?: string;
    attendees?: string[];
    timezone?: string;
    emailReminder?: {
      value: number;
      duration: ReminderDuration;
    };
    smsReminder?: {
      value: number;
      duration: ReminderDuration;
    };
  }) => void;
  clientName?: string; // Optional - for when called from client context
  clientId?: string; // Optional - for when called from client context
  showClientSelector?: boolean; // Whether to show client selector
  initialDate?: Date; // Optional - pre-fill date when double-clicking calendar
  initialTime?: string; // Optional - pre-fill time when double-clicking calendar
  defaultTimeZone?: string; // Optional - default timezone
};

export function ScheduleMeetingDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  clientName: initialClientName, 
  clientId: initialClientId,
  showClientSelector = false,
  initialDate,
  initialTime,
  defaultTimeZone = 'America/New_York'
}: ScheduleMeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('video');
  const [videoProvider, setVideoProvider] = useState<'google-meet' | 'zoom'>('google-meet');
  const [location, setLocation] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || '');
  const [selectedClientName, setSelectedClientName] = useState<string>(initialClientName || '');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  
  // Attendee management
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  
  // Timezone
  const [timezone, setTimezone] = useState(defaultTimeZone);
  
  // Reminder states - defaulting to 1 day before for email, 1 hour before for SMS
  const [emailReminderValue, setEmailReminderValue] = useState<number>(1);
  const [emailReminderDuration, setEmailReminderDuration] = useState<ReminderDuration>('days');
  const [smsReminderValue, setSmsReminderValue] = useState<number>(1);
  const [smsReminderDuration, setSmsReminderDuration] = useState<ReminderDuration>('hours');
  
  // Collapsible states
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  const [timezoneExpanded, setTimezoneExpanded] = useState(false);

  // Mock client data
  const clients = [
    { id: '1', name: 'Troy Business Services LLC', type: 'business' as const },
    { id: '2', name: 'Acme Corporation', type: 'business' as const },
    { id: '3', name: 'Best Face Forward', type: 'business' as const },
    { id: '4', name: 'Tech Innovations Inc', type: 'business' as const },
    { id: '5', name: 'Green Energy Solutions', type: 'business' as const },
    { id: '6', name: 'Smith & Associates', type: 'business' as const },
    { id: '7', name: 'Global Trading Co', type: 'business' as const },
    { id: '8', name: 'Health First Clinic', type: 'business' as const },
    { id: '9', name: 'Creative Studios LLC', type: 'business' as const },
    { id: '10', name: 'Financial Advisors Group', type: 'business' as const },
    { id: '11', name: 'John & Mary Smith', type: 'individual' as const },
  ];

  const getClientInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getClientColor = (id: string) => {
    const colors = [
      '#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', 
      '#ca8a04', '#16a34a', '#0891b2', '#4f46e5', '#9333ea'
    ];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const getClientIcon = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return <Building2 className="w-3.5 h-3.5" />;
    return client.type === 'business' ? 
      <Building2 className="w-3.5 h-3.5" /> : 
      <Users className="w-3.5 h-3.5" />;
  };

  // Update selected client when props change
  useEffect(() => {
    if (initialClientId) setSelectedClientId(initialClientId);
    if (initialClientName) setSelectedClientName(initialClientName);
  }, [initialClientId, initialClientName]);

  // Pre-fill date and time when provided (e.g., from double-click)
  useEffect(() => {
    if (open) {
      if (initialDate) setDate(initialDate);
      if (initialTime) setTime(initialTime);
    }
  }, [open, initialDate, initialTime]);

  // Track trigger width for popover
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [clientSearchOpen, selectedClientId]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddAttendee = () => {
    const trimmedEmail = attendeeEmail.trim().toLowerCase();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (attendees.includes(trimmedEmail)) {
      toast.error('This email is already in the attendee list');
      return;
    }

    setAttendees([...attendees, trimmedEmail]);
    setAttendeeEmail('');
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(e => e !== email));
  };

  const handleAttendeeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  const handleSave = () => {
    if (!title.trim() || !date || !time) return;
    if (showClientSelector && !selectedClientId) return; // Require client if selector is shown
    
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: format(date, 'yyyy-MM-dd'),
      time,
      type: meetingType,
      videoProvider: meetingType === 'video' ? videoProvider : undefined,
      location: meetingType === 'in-person' ? location.trim() || undefined : undefined,
      clientId: selectedClientId || undefined,
      clientName: selectedClientName || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      timezone,
      emailReminder: {
        value: emailReminderValue,
        duration: emailReminderDuration
      },
      smsReminder: {
        value: smsReminderValue,
        duration: smsReminderDuration
      }
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(undefined);
    setTime('');
    setMeetingType('video');
    setVideoProvider('google-meet');
    setLocation('');
    setAttendees([]);
    setAttendeeEmail('');
    setTimezone(defaultTimeZone);
    setEmailReminderValue(1);
    setEmailReminderDuration('days');
    setSmsReminderValue(1);
    setSmsReminderDuration('hours');
    setRemindersExpanded(false);
    setTimezoneExpanded(false);
    if (showClientSelector) {
      setSelectedClientId('');
      setSelectedClientName('');
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDate(undefined);
    setTime('');
    setMeetingType('video');
    setVideoProvider('google-meet');
    setLocation('');
    setAttendees([]);
    setAttendeeEmail('');
    setTimezone(defaultTimeZone);
    setEmailReminderValue(1);
    setEmailReminderDuration('days');
    setSmsReminderValue(1);
    setSmsReminderDuration('hours');
    setRemindersExpanded(false);
    setTimezoneExpanded(false);
    if (showClientSelector) {
      setSelectedClientId('');
      setSelectedClientName('');
    }
    onOpenChange(false);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) setSelectedClientName(client.name);
  };

  // Helper function to get timezone display name
  const getTimezoneDisplay = (tz: string) => {
    const timezoneMap: { [key: string]: string } = {
      'America/New_York': 'Eastern Time (ET)',
      'America/Chicago': 'Central Time (CT)',
      'America/Denver': 'Mountain Time (MT)',
      'America/Los_Angeles': 'Pacific Time (PT)',
      'America/Anchorage': 'Alaska Time (AKT)',
      'Pacific/Honolulu': 'Hawaii Time (HT)',
      'Europe/London': 'London (GMT)',
      'Europe/Paris': 'Paris (CET)',
      'Asia/Tokyo': 'Tokyo (JST)',
      'Australia/Sydney': 'Sydney (AEST)',
    };
    return timezoneMap[tz] || tz;
  };

  // Helper function to get reminder summary text
  const getReminderSummary = () => {
    const emailText = `${emailReminderValue} ${emailReminderDuration === 'hours' ? (emailReminderValue === 1 ? 'hour' : 'hours') : (emailReminderValue === 1 ? 'day' : 'days')} before via email`;
    const smsText = `${smsReminderValue} ${smsReminderDuration === 'hours' ? (smsReminderValue === 1 ? 'hour' : 'hours') : (smsReminderValue === 1 ? 'day' : 'days')} before via SMS`;
    return `${emailText}, ${smsText}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="schedule-meeting-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Schedule Meeting</DialogTitle>
          <DialogDescription className="text-base mt-2" id="schedule-meeting-description">
            {showClientSelector ? (
              "Select a client and schedule a meeting"
            ) : (
              <>
                Schedule a meeting with <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedClientName || initialClientName}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showClientSelector && (
            <div>
              <Label htmlFor="client">Client <span className="text-red-600">*</span></Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between mt-1.5 h-auto min-h-[40px] py-2"
                  >
                    {selectedClientId ? (
                      <div className="flex items-center gap-2 text-left">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 relative"
                          style={{ backgroundColor: getClientColor(selectedClientId) }}
                        >
                          <span className="text-xs font-semibold">{getClientInitials(selectedClientName)}</span>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                            {getClientIcon(selectedClientId)}
                          </div>
                        </div>
                        <span className="font-medium">{selectedClientName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a client...</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0" 
                  align="start"
                  style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'var(--radix-popover-trigger-width)' }}
                >
                  <Command>
                    <CommandInput placeholder="Search clients..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              handleClientSelect(client.id);
                              setClientSearchOpen(false);
                            }}
                            className="gap-2 py-2.5"
                          >
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 relative"
                              style={{ backgroundColor: getClientColor(client.id) }}
                            >
                              <span className="text-xs font-semibold">{getClientInitials(client.name)}</span>
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                {client.type === 'business' ? 
                                  <Building2 className="w-3.5 h-3.5" /> : 
                                  <Users className="w-3.5 h-3.5" />
                                }
                              </div>
                            </div>
                            <span className="flex-1">{client.name}</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                              style={{ color: 'var(--primaryColor)' }}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <Label htmlFor="title">Meeting Title <span className="text-red-600">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Q4 Tax Planning Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date <span className="text-red-600">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Time <span className="text-red-600">*</span></Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Meeting Type <span className="text-red-600">*</span></Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setMeetingType('video')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  meetingType === 'video'
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Video className={cn(
                  "w-5 h-5",
                  meetingType === 'video' ? "text-blue-600" : "text-gray-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  meetingType === 'video' ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"
                )}>
                  Video Call
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMeetingType('in-person')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  meetingType === 'in-person'
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <MapPin className={cn(
                  "w-5 h-5",
                  meetingType === 'in-person' ? "text-purple-600" : "text-gray-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  meetingType === 'in-person' ? "text-purple-900 dark:text-purple-100" : "text-gray-700 dark:text-gray-300"
                )}>
                  In-Person
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMeetingType('call')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  meetingType === 'call'
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Phone className={cn(
                  "w-5 h-5",
                  meetingType === 'call' ? "text-green-600" : "text-gray-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  meetingType === 'call' ? "text-green-900 dark:text-green-100" : "text-gray-700 dark:text-gray-300"
                )}>
                  Phone Call
                </span>
              </button>
            </div>
          </div>

          {meetingType === 'video' && (
            <div>
              <Label>Video Platform</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setVideoProvider('google-meet')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                    videoProvider === 'google-meet'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">G</div>
                  <div className="text-left">
                    <div className={cn(
                      "font-medium",
                      videoProvider === 'google-meet' ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                    )}>
                      Google Meet
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Video conferencing</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoProvider('zoom')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                    videoProvider === 'zoom'
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">Z</div>
                  <div className="text-left">
                    <div className={cn(
                      "font-medium",
                      videoProvider === 'zoom' ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                    )}>
                      Zoom
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Video meetings</div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Meeting link will be generated and sent to all participants
              </p>
            </div>
          )}

          {meetingType === 'in-person' && (
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Office conference room, 123 Main St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Add meeting location details
              </p>
            </div>
          )}

          {/* Time Zone - Collapsible */}
          <Collapsible open={timezoneExpanded} onOpenChange={setTimezoneExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Time Zone</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getTimezoneDisplay(timezone)}</div>
                  </div>
                </div>
                {timezoneExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 pb-1 px-3">
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Meeting time will be in this timezone
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Attendees */}
          <div>
            <Label htmlFor="attendee-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Attendees (Optional)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="attendee-email"
                type="email"
                placeholder="email@example.com"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                onKeyPress={handleAttendeeKeyPress}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddAttendee}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Add email addresses to send calendar invites
            </p>
            
            {/* Attendee List */}
            {attendees.length > 0 && (
              <div className="mt-3 space-y-2">
                {attendees.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttendee(email)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reminder Section - Collapsible */}
          <Collapsible open={remindersExpanded} onOpenChange={setRemindersExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Reminders</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getReminderSummary()}</div>
                  </div>
                </div>
                {remindersExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 pb-1 px-3">
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reminders will be sent to the provided email address and phone number.
                </p>
              </div>

              {/* Email Address Reminder */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
                  Email Address Reminder
                </Label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Select Days/Hours */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Select Days/Hours
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setEmailReminderValue(Math.max(1, emailReminderValue - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={emailReminderValue}
                        onChange={(e) => setEmailReminderValue(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-9 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setEmailReminderValue(emailReminderValue + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Duration
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setEmailReminderDuration('days')}
                        className={cn(
                          "flex-1 h-9 text-xs",
                          emailReminderDuration === 'days'
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        style={emailReminderDuration === 'days' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      >
                        Day(s) Before
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEmailReminderDuration('hours')}
                        className={cn(
                          "flex-1 h-9 text-xs",
                          emailReminderDuration === 'hours'
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        style={emailReminderDuration === 'hours' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      >
                        Hour(s) Before
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone SMS Reminder */}
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
                  Phone SMS Reminder
                </Label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Select Days/Hours */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Select Days/Hours
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setSmsReminderValue(Math.max(1, smsReminderValue - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={smsReminderValue}
                        onChange={(e) => setSmsReminderValue(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-9 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setSmsReminderValue(smsReminderValue + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Duration
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setSmsReminderDuration('days')}
                        className={cn(
                          "flex-1 h-9 text-xs",
                          smsReminderDuration === 'days'
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        style={smsReminderDuration === 'days' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      >
                        Day(s) Before
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSmsReminderDuration('hours')}
                        className={cn(
                          "flex-1 h-9 text-xs",
                          smsReminderDuration === 'hours'
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        style={smsReminderDuration === 'hours' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                      >
                        Hour(s) Before
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !date || !time || (showClientSelector && !selectedClientId)}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="text-white"
          >
            Schedule Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}