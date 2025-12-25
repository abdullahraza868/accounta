import React, { useState } from 'react';
import { X, Video, Calendar, Clock, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface Meeting {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
}

interface InviteToMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onInvite: (meetingId: string) => void;
}

// Mock meetings
const PROGRAMMED_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Tax Planning Consultation',
    description: 'Annual tax planning session to discuss tax strategies and opportunities',
    duration: '60 minutes',
    type: 'Tax Services'
  },
  {
    id: '2',
    title: 'Quarterly Business Review',
    description: 'Review financial performance and discuss business goals',
    duration: '45 minutes',
    type: 'Advisory'
  },
  {
    id: '3',
    title: 'Initial Client Onboarding',
    description: 'Welcome meeting to discuss services and gather initial information',
    duration: '30 minutes',
    type: 'Onboarding'
  },
  {
    id: '4',
    title: 'Year-End Tax Meeting',
    description: 'Discuss year-end tax planning and required documentation',
    duration: '45 minutes',
    type: 'Tax Services'
  },
  {
    id: '5',
    title: 'Financial Statement Review',
    description: 'Review and discuss monthly or quarterly financial statements',
    duration: '30 minutes',
    type: 'Bookkeeping'
  },
  {
    id: '6',
    title: 'Audit Planning Session',
    description: 'Discuss audit scope, timeline, and required documentation',
    duration: '90 minutes',
    type: 'Audit'
  }
];

export function InviteToMeetingDialog({ isOpen, onClose, selectedCount, onInvite }: InviteToMeetingDialogProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvite = () => {
    if (selectedMeeting) {
      onInvite(selectedMeeting);
      setSelectedMeeting(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedMeeting(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
          }}
        >
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Invite to Meeting
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Send meeting invitation to <span className="font-semibold text-brand-primary">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span>
            </p>
          </div>

          {/* Meetings List */}
          <div className="space-y-3">
            {PROGRAMMED_MEETINGS.map((meeting) => {
              const isSelected = selectedMeeting === meeting.id;
              return (
                <div
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-brand-primary border-brand-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                          {meeting.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Client schedules time</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {selectedMeeting && (
              <span>Send invitation to {selectedCount} client{selectedCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!selectedMeeting}
              className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
