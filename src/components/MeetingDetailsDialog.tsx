import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Users, 
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { AddAttendeesDialog } from './AddAttendeesDialog';

type MeetingType = 'video' | 'in-person' | 'call';

type MeetingDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: {
    id: string;
    title: string;
    client: string;
    clientId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: MeetingType;
    videoProvider?: 'google-meet' | 'zoom';
    meetingLink?: string;
    location?: string;
    attendees: string[];
    description?: string;
    calendar: string;
  } | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function MeetingDetailsDialog({ 
  open, 
  onOpenChange, 
  meeting,
  onEdit,
  onDelete 
}: MeetingDetailsDialogProps) {
  const [showAddAttendees, setShowAddAttendees] = useState(false);

  if (!meeting) return null;

  const handleAddAttendees = (emails: string[], sendInvites: boolean) => {
    // In a real app, this would call an API to add attendees and send invites
    console.log('Adding attendees:', emails, 'Send invites:', sendInvites);
  };

  const getMeetingIcon = (type: MeetingType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getMeetingTypeLabel = (type: MeetingType) => {
    switch (type) {
      case 'video':
        return 'Video Call';
      case 'call':
        return 'Phone Call';
      case 'in-person':
        return 'In-Person';
    }
  };

  const getMeetingTypeColor = (type: MeetingType) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'call':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'in-person':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" aria-describedby="meeting-details-description">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl pr-8">{meeting.title}</DialogTitle>
              <DialogDescription className="sr-only" id="meeting-details-description">
                View meeting details for {meeting.title} with {meeting.client}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={getMeetingTypeColor(meeting.type)}
                >
                  {getMeetingIcon(meeting.type)}
                  <span className="ml-1.5">{getMeetingTypeLabel(meeting.type)}</span>
                </Badge>
                {meeting.videoProvider && (
                  <Badge variant="outline">
                    {meeting.videoProvider === 'google-meet' ? 'Google Meet' : 'Zoom'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">Client</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{meeting.client}</div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">Date & Time</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4" />
                {meeting.startTime} - {meeting.endTime}
              </div>
            </div>
          </div>

          {/* Meeting Link (for video calls) */}
          {meeting.type === 'video' && meeting.meetingLink && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Meeting Link</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => window.open(meeting.meetingLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join {meeting.videoProvider === 'google-meet' ? 'Google Meet' : 'Zoom'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(meeting.meetingLink!)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Location (for in-person meetings) */}
          {meeting.type === 'in-person' && meeting.location && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Location</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {meeting.location}
                </div>
              </div>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Attendees {meeting.attendees && meeting.attendees.length > 0 && `(${meeting.attendees.length})`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAttendees(true)}
                  className="h-7 text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add Attendees
                </Button>
              </div>
              {meeting.attendees && meeting.attendees.length > 0 ? (
                <div className="space-y-1">
                  {meeting.attendees.map((attendee, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {attendee}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No attendees yet
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {meeting.description && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {meeting.description}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Add Attendees Dialog */}
      <AddAttendeesDialog
        open={showAddAttendees}
        onOpenChange={setShowAddAttendees}
        currentAttendees={meeting.attendees || []}
        meetingTitle={meeting.title}
        meetingDate={format(new Date(meeting.date), 'MMMM d, yyyy')}
        meetingTime={`${meeting.startTime} - ${meeting.endTime}`}
        onAddAttendees={handleAddAttendees}
      />
    </Dialog>
  );
}