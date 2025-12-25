import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Send,
  Paperclip
} from 'lucide-react';
import { useState } from 'react';

type CommunicationTabProps = {
  member: TeamMember;
};

export function CommunicationTab({ member }: CommunicationTabProps) {
  const [newMessage, setNewMessage] = useState('');

  const communications = [
    {
      id: '1',
      type: 'Email',
      subject: 'PTO Request Approved',
      message: 'Your request for time off from November 15-17 has been approved.',
      from: 'HR Department',
      date: '2024-10-20 10:15 AM',
      direction: 'received'
    },
    {
      id: '2',
      type: 'Email',
      subject: 'Expense Report Submission',
      message: 'I have submitted my expense report for the client meeting last week. Total: $450.00',
      to: 'Finance Department',
      date: '2024-10-15 02:15 PM',
      direction: 'sent'
    },
    {
      id: '3',
      type: 'Message',
      subject: 'Team Meeting Reminder',
      message: 'Reminder: Weekly team meeting tomorrow at 10 AM in Conference Room B.',
      from: 'Sarah Johnson',
      date: '2024-10-14 04:30 PM',
      direction: 'received'
    },
    {
      id: '4',
      type: 'Phone',
      subject: 'Call with Manager',
      message: 'Discussed Q4 objectives and upcoming projects.',
      from: 'Sarah Johnson',
      date: '2024-10-10 03:00 PM',
      direction: 'received'
    },
    {
      id: '5',
      type: 'Email',
      subject: 'W-4 Form Updated',
      message: 'I have uploaded my updated W-4 form to the portal.',
      to: 'HR Department',
      date: '2024-10-10 11:00 AM',
      direction: 'sent'
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <Mail className="w-4 h-4" />;
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      case 'Message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Email':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Phone':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Message':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Communication History</h2>
        <p className="text-sm text-gray-500 mt-1">All communications with {member.name}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button className="bg-gradient-to-br from-blue-600 to-blue-700">
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </Button>
        <Button variant="outline">
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Message
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* New Message */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Send New Message</h3>
        <div className="space-y-3">
          <Textarea 
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach File
            </Button>
            <Button className="bg-gradient-to-br from-purple-600 to-purple-700">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </Card>

      {/* Communication History */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Communications</h3>
        <div className="space-y-4">
          {communications.map((comm) => (
            <div 
              key={comm.id}
              className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(comm.type)}`}>
                    <span className="mr-1">{getTypeIcon(comm.type)}</span>
                    {comm.type}
                  </Badge>
                  <Badge variant="outline" className={
                    comm.direction === 'sent' 
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }>
                    {comm.direction === 'sent' ? 'Sent' : 'Received'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{comm.date}</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">{comm.subject}</h4>
              <p className="text-sm text-gray-600 mb-2">{comm.message}</p>
              <div className="text-xs text-gray-500">
                {comm.direction === 'sent' ? `To: ${comm.to}` : `From: ${comm.from}`}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
