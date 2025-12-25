import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  User
} from 'lucide-react';
import { useState } from 'react';

type ChatChannelTabProps = {
  member: TeamMember;
};

export function ChatChannelTab({ member }: ChatChannelTabProps) {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Hi! Just wanted to follow up on the Q3 performance review. Great work this quarter!',
      timestamp: '2024-10-20 09:15 AM',
      isCurrentUser: false
    },
    {
      id: '2',
      sender: member.name,
      content: 'Thank you! I really appreciate the feedback. Looking forward to discussing the upcoming projects.',
      timestamp: '2024-10-20 09:30 AM',
      isCurrentUser: true
    },
    {
      id: '3',
      sender: 'Sarah Johnson',
      content: 'Absolutely! Let\'s schedule a meeting for next week to go over the details.',
      timestamp: '2024-10-20 09:45 AM',
      isCurrentUser: false
    },
    {
      id: '4',
      sender: member.name,
      content: 'Sounds good. Also, I wanted to let you know that I\'ve submitted my PTO request for November 15-17.',
      timestamp: '2024-10-20 10:00 AM',
      isCurrentUser: true
    },
    {
      id: '5',
      sender: 'Sarah Johnson',
      content: 'I saw that! Already approved it. Have a great time off!',
      timestamp: '2024-10-20 10:15 AM',
      isCurrentUser: false
    },
    {
      id: '6',
      sender: member.name,
      content: 'Thank you so much!',
      timestamp: '2024-10-20 10:20 AM',
      isCurrentUser: true
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-purple-700">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
            <p className="text-sm text-gray-500">{member.title}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-white">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[70%] ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-700" />
                </div>
              )}
              <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {!msg.isCurrentUser && (
                  <span className="text-xs text-gray-600 mb-1 px-3">{msg.sender}</span>
                )}
                <div className={`rounded-2xl px-4 py-2 ${
                  msg.isCurrentUser 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-3">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
