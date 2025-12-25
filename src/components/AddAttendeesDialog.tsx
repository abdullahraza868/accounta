import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Users,
  Mail,
  Plus,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';

type Attendee = {
  email: string;
  name?: string;
  isOrganizer?: boolean;
  responseStatus?: 'accepted' | 'declined' | 'pending';
};

type AddAttendeesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAttendees: string[];
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  onAddAttendees: (emails: string[], sendInvites: boolean) => void;
};

export function AddAttendeesDialog({
  open,
  onOpenChange,
  currentAttendees,
  meetingTitle,
  meetingDate,
  meetingTime,
  onAddAttendees
}: AddAttendeesDialogProps) {
  const [emailInput, setEmailInput] = useState('');
  const [newAttendees, setNewAttendees] = useState<string[]>([]);
  const [sendCalendarInvites, setSendCalendarInvites] = useState(true);
  const [includeInternalTeam, setIncludeInternalTeam] = useState(false);

  // Internal team members (mock data)
  const internalTeam = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@firm.com' },
    { id: '2', name: 'Mike Brown', email: 'mike@firm.com' },
    { id: '3', name: 'Emily Davis', email: 'emily@firm.com' },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (currentAttendees.includes(trimmedEmail)) {
      toast.error('This person is already an attendee');
      return;
    }

    if (newAttendees.includes(trimmedEmail)) {
      toast.error('Email already added to the list');
      return;
    }

    setNewAttendees([...newAttendees, trimmedEmail]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setNewAttendees(newAttendees.filter(e => e !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = () => {
    if (newAttendees.length === 0) {
      toast.error('Please add at least one attendee');
      return;
    }

    onAddAttendees(newAttendees, sendCalendarInvites);
    
    if (sendCalendarInvites) {
      toast.success(`Added ${newAttendees.length} attendee(s) and sent calendar invites`);
    } else {
      toast.success(`Added ${newAttendees.length} attendee(s)`);
    }

    // Reset state
    setNewAttendees([]);
    setEmailInput('');
    setSendCalendarInvites(true);
    onOpenChange(false);
  };

  const handleAddInternalMember = (email: string) => {
    if (currentAttendees.includes(email) || newAttendees.includes(email)) {
      toast.error('This team member is already an attendee');
      return;
    }
    setNewAttendees([...newAttendees, email]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" aria-describedby="add-attendees-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Attendees</DialogTitle>
          <DialogDescription id="add-attendees-description">
            Add people to "{meetingTitle}" on {meetingDate} at {meetingTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Attendees */}
          {currentAttendees.length > 0 && (
            <div>
              <Label className="text-sm flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Current Attendees ({currentAttendees.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {currentAttendees.map((email, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Add Email Input */}
          <div>
            <Label htmlFor="attendee-email" className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Add Attendee Email <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="attendee-email"
                type="email"
                placeholder="email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleAddEmail} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter or click Add to add multiple email addresses
            </p>
          </div>

          {/* Internal Team Quick Add */}
          <div>
            <Label className="text-sm flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Add Team Members
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {internalTeam.map((member) => {
                const isAlreadyAdded = currentAttendees.includes(member.email) || newAttendees.includes(member.email);
                return (
                  <button
                    key={member.id}
                    onClick={() => !isAlreadyAdded && handleAddInternalMember(member.email)}
                    disabled={isAlreadyAdded}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--primaryColor)' }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                      </div>
                    </div>
                    {isAlreadyAdded ? (
                      <Badge variant="outline" className="text-xs">Added</Badge>
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Attendees List */}
          {newAttendees.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-sm flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4" />
                  New Attendees ({newAttendees.length})
                </Label>
                <div className="space-y-2">
                  {newAttendees.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Calendar Invite Options */}
          <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Checkbox
                id="send-invites"
                checked={sendCalendarInvites}
                onCheckedChange={(checked) => setSendCalendarInvites(checked as boolean)}
              />
              <div className="flex-1">
                <Label
                  htmlFor="send-invites"
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send calendar invites via email
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Attendees will receive an email with calendar invite (.ics file) and can add it to their calendar
                </p>
              </div>
            </div>

            {sendCalendarInvites && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Calendar invites will include:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-0.5">
                    <li>Meeting title, date, and time</li>
                    <li>Video meeting link (if applicable)</li>
                    <li>Location details (if applicable)</li>
                    <li>Meeting description and agenda</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={newAttendees.length === 0}
            className="min-w-[140px]"
          >
            {sendCalendarInvites ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Add & Send Invites
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Attendees
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}