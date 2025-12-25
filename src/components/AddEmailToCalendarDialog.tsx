import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Mail, X, Calendar as CalendarIcon, Clock, Users, ExternalLink } from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

type Email = {
  id: string;
  subject: string;
  body: string;
  from: { name: string; email: string };
  to: string[];
  date: string;
};

type AddEmailToCalendarDialogProps = {
  open: boolean;
  onClose: () => void;
  email: Email | null;
};

export function AddEmailToCalendarDialog({ open, onClose, email }: AddEmailToCalendarDialogProps) {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [inviteSender, setInviteSender] = useState(false);
  const [additionalAttendees, setAdditionalAttendees] = useState('');

  // Initialize form when email changes
  useEffect(() => {
    if (email && open) {
      // Set title to just the subject
      setEventTitle(email.subject);
      
      // Set description with email body only
      setEventDescription(email.body);
      
      // Set default date to today
      const today = new Date();
      setEventDate(format(today, 'yyyy-MM-dd'));
      
      // Reset other fields
      setEventStartTime('');
      setEventEndTime('');
      setIsAllDay(false);
      setInviteSender(true); // Default to inviting sender
      setAdditionalAttendees('');
    }
  }, [email, open]);

  const handleCreateEvent = () => {
    // Validate required fields
    if (!eventTitle || !eventDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isAllDay && (!eventStartTime || !eventEndTime)) {
      toast.error('Please provide start and end times');
      return;
    }

    // Build attendees list
    const attendees = [];
    if (inviteSender && email) {
      attendees.push(email.from.email);
    }
    if (additionalAttendees.trim()) {
      const emails = additionalAttendees.split(',').map(e => e.trim()).filter(e => e);
      attendees.push(...emails);
    }

    // Create calendar event object
    const calendarEvent = {
      id: `email-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: eventTitle,
      client: email.from.name,
      clientId: 'email-client',
      date: eventDate,
      startTime: isAllDay ? '00:00' : eventStartTime,
      endTime: isAllDay ? '23:59' : eventEndTime,
      type: 'email' as const,
      attendees,
      description: eventDescription,
      calendar: '1', // Default to first calendar
      emailId: email?.id,
      isAllDay,
    };

    // Get existing calendar events from localStorage
    const existingEvents = localStorage.getItem('calendarEvents');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    
    // Add new event
    events.push(calendarEvent);
    
    // Save back to localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    
    // Trigger a custom event to notify CalendarView
    window.dispatchEvent(new CustomEvent('calendarEventCreated', { detail: calendarEvent }));

    // Show success message with toast
    toast.success('Calendar event created successfully!', {
      description: `Event scheduled for ${format(new Date(eventDate), 'MMM d, yyyy')}${isAllDay ? '' : ` at ${eventStartTime}`}`
    });
    
    // Close dialog
    onClose();
  };

  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="add-to-calendar-description">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Add Email to Calendar
          </DialogTitle>
          <DialogDescription id="add-to-calendar-description">
            Add the email to your calendar as an event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Context Card */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Creating event from email
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  From: <span className="font-medium">{email.from.name}</span> ({email.from.email})
                </p>
              </div>
            </div>
          </Card>

          {/* Event Title */}
          <div>
            <Label htmlFor="eventTitle" className="text-sm font-medium mb-2 block">
              Event Title *
            </Label>
            <Input
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event title"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              This event was created from an email
            </p>
          </div>

          {/* Event Description */}
          <div>
            <Label htmlFor="eventDescription" className="text-sm font-medium mb-2 block">
              Event Description
            </Label>
            <Textarea
              id="eventDescription"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={6}
              className="resize-none"
              placeholder="Event details..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email body and link to original email included below
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="eventDate" className="text-sm font-medium mb-2 block">
                Event Date *
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            {/* All Day Toggle */}
            <div className="col-span-2">
              <button
                onClick={() => setIsAllDay(!isAllDay)}
                className={cn(
                  'w-full p-3 rounded-lg border-2 transition-all text-left',
                  isAllDay
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      All Day Event
                    </span>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center',
                    isAllDay ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  )}>
                    {isAllDay && <X className="w-3.5 h-3.5 text-white rotate-45" />}
                  </div>
                </div>
              </button>
            </div>

            {!isAllDay && (
              <>
                <div>
                  <Label htmlFor="eventStartTime" className="text-sm font-medium mb-2 block">
                    Start Time *
                  </Label>
                  <Input
                    id="eventStartTime"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="eventEndTime" className="text-sm font-medium mb-2 block">
                    End Time *
                  </Label>
                  <Input
                    id="eventEndTime"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-3">
            <Label className="text-sm font-medium block">
              Event Attendees
            </Label>

            {/* Invite Sender Option */}
            <button
              onClick={() => setInviteSender(!inviteSender)}
              className={cn(
                'w-full p-3 rounded-lg border-2 transition-all text-left',
                inviteSender
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Invite Email Sender
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {email.from.name} ({email.from.email})
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded flex items-center justify-center',
                  inviteSender ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                )}>
                  {inviteSender && <X className="w-3.5 h-3.5 text-white rotate-45" />}
                </div>
              </div>
            </button>

            {/* Additional Attendees */}
            <div>
              <Label htmlFor="additionalAttendees" className="text-sm font-medium mb-2 block">
                Additional Attendees (Optional)
              </Label>
              <Input
                id="additionalAttendees"
                value={additionalAttendees}
                onChange={(e) => setAdditionalAttendees(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>
          </div>

          {/* Preview Attendees */}
          {(inviteSender || additionalAttendees.trim()) && (
            <Card className="p-3 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Attendees:
              </p>
              <div className="flex flex-wrap gap-2">
                {inviteSender && (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" />
                    {email.from.email}
                  </Badge>
                )}
                {additionalAttendees.trim().split(',').map((email, i) => {
                  const trimmed = email.trim();
                  if (!trimmed) return null;
                  return (
                    <Badge key={i} variant="secondary" className="gap-1">
                      <Users className="w-3 h-3" />
                      {trimmed}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            disabled={!eventTitle || !eventDate || (!isAllDay && (!eventStartTime || !eventEndTime))}
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}