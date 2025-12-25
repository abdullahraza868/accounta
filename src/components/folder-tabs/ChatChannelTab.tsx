import { Client } from '../../App';
import { Hash, Send, Plus, Users, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { useState } from 'react';

type ChatChannelTabProps = {
  client: Client;
};

export function ChatChannelTab({ client }: ChatChannelTabProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [message, setMessage] = useState('');

  const channels = [
    { id: 'general', name: 'general', members: 5, unread: 0, isPrivate: false },
    { id: 'tax-2024', name: 'tax-2024', members: 3, unread: 2, isPrivate: false },
    { id: 'documents', name: 'documents', members: 4, unread: 0, isPrivate: false },
    { id: 'private', name: 'private-accounting', members: 2, unread: 1, isPrivate: true },
  ];

  const messages = {
    'general': [
      { id: '1', user: 'Sarah Johnson', avatar: 'SJ', time: '10:30 AM', text: 'Hi team, just uploaded the Q3 financials to the documents channel.' },
      { id: '2', user: 'Mike Brown', avatar: 'MB', time: '10:32 AM', text: 'Thanks Sarah! I\'ll review them this afternoon.' },
      { id: '3', user: 'You', avatar: 'YO', time: '10:35 AM', text: 'Great work everyone. Let me know if you need anything from the client.' },
    ],
    'tax-2024': [
      { id: '1', user: 'Sarah Johnson', avatar: 'SJ', time: 'Yesterday', text: 'Starting work on the 2024 tax return. Need the W2 forms.' },
      { id: '2', user: 'You', avatar: 'YO', time: 'Today', text: 'I\'ve requested them from the client. Should have them by Friday.' },
    ],
    'documents': [
      { id: '1', user: 'Mike Brown', avatar: 'MB', time: '2 days ago', text: 'All documents are now organized in the Files tab.' },
    ],
    'private': [
      { id: '1', user: 'Sarah Johnson', avatar: 'SJ', time: '1 hour ago', text: 'Need to discuss the client\'s billing structure.' },
    ],
  };

  const currentMessages = messages[selectedChannel as keyof typeof messages] || [];

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      setMessage('');
    }
  };

  return (
    <div className="p-8 h-full flex gap-6">
      {/* Channels List */}
      <div className="w-72 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold tracking-tight">Channels</h3>
          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-purple-50 hover:text-purple-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 ${
                selectedChannel === channel.id 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-md border border-gray-200/60'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {channel.isPrivate ? (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="truncate text-[15px] font-medium tracking-tight">{channel.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {channel.unread > 0 && (
                  <Badge className={cn(
                    "text-xs h-5 min-w-[20px] flex items-center justify-center px-1",
                    selectedChannel === channel.id 
                      ? "bg-white/20 text-white hover:bg-white/20" 
                      : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/30"
                  )}>
                    {channel.unread}
                  </Badge>
                )}
                <Users className={cn("w-3 h-3", selectedChannel === channel.id ? "text-white/60" : "text-gray-400")} />
                <span className={cn("text-xs", selectedChannel === channel.id ? "text-white/80" : "text-gray-500")}>{channel.members}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col border-gray-200/60 shadow-xl shadow-gray-900/5 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
        {/* Channel Header */}
        <div className="p-5 border-b border-gray-200/50 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold tracking-tight">{channels.find(c => c.id === selectedChannel)?.name}</h3>
              <div className="text-[13px] text-gray-500 mt-0.5 font-normal">
                Chat channel for {client.name}
              </div>
            </div>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              {channels.find(c => c.id === selectedChannel)?.members} members
            </Badge>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="flex gap-4">
              <Avatar className="w-11 h-11 flex-shrink-0 ring-2 ring-purple-500/10 ring-offset-2">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-sm">
                  {msg.avatar}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[15px] font-semibold text-gray-900 tracking-tight">{msg.user}</span>
                  <span className="text-[11px] text-gray-400 font-normal">{msg.time}</span>
                </div>
                <div className="text-[14px] text-gray-700 bg-white/80 p-3 rounded-xl border border-gray-200/60 shadow-sm font-normal leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="p-5 border-t border-gray-200/50 bg-white/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-white text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 rounded-xl h-12 w-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
