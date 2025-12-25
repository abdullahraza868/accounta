import { useState, useMemo } from 'react';
import { Search, Plus, MessageSquare, Phone, CheckCheck, Smile, Paperclip, Send, X, Smartphone, User, Building2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type Client = {
  id: string;
  name: string;
  phone: string;
  type: 'Individual' | 'Business';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
};

type Message = {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  date: string;
  isCurrentUser: boolean;
  readBy?: string[];
};

export function TextMessagesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'new' | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showNewTextDialog, setShowNewTextDialog] = useState(false);
  const [newTextClientSearch, setNewTextClientSearch] = useState('');
  const [newTextMessage, setNewTextMessage] = useState('');
  const [newTextFilter, setNewTextFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Mock clients data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      type: 'Individual',
      lastMessage: 'Thanks for the quick response!',
      lastMessageTime: '2h',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '(555) 234-5678',
      type: 'Individual',
      lastMessage: 'Can we schedule a meeting?',
      lastMessageTime: '1d',
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Tech Solutions LLC',
      phone: '(555) 345-6789',
      type: 'Business',
      lastMessage: 'Please send the documents',
      lastMessageTime: '2d',
      unreadCount: 1,
    },
    {
      id: '4',
      name: 'Maria Garcia',
      phone: '(555) 456-7890',
      type: 'Individual',
      lastMessage: 'Sounds good',
      lastMessageTime: '3d',
      unreadCount: 0,
    },
    {
      id: '5',
      name: 'Global Enterprises Inc',
      phone: '(555) 567-8901',
      type: 'Business',
      lastMessage: 'Thank you!',
      lastMessageTime: '1w',
      unreadCount: 0,
    },
    {
      id: '6',
      name: 'Robert Chen',
      phone: '(555) 678-9012',
      type: 'Individual',
      lastMessage: 'Perfect, see you then',
      lastMessageTime: '1w',
      unreadCount: 0,
    },
    {
      id: '7',
      name: 'Downtown Retail Corp',
      phone: '(555) 789-0123',
      type: 'Business',
      lastMessage: 'We need the quarterly report',
      lastMessageTime: '2w',
      unreadCount: 0,
    },
    {
      id: '8',
      name: 'Emily Davis',
      phone: '(555) 890-1234',
      type: 'Individual',
      lastMessage: 'Thanks!',
      lastMessageTime: '2w',
      unreadCount: 0,
    },
  ];

  // Filter clients
  const filteredClients = useMemo(() => {
    let filtered = mockClients;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    }

    // Filter by mode
    if (filterMode === 'new') {
      filtered = filtered.filter(client => (client.unreadCount || 0) > 0);
    }

    // Filter by type
    if (newTextFilter !== 'all') {
      filtered = filtered.filter(client => client.type === newTextFilter);
    }

    return filtered;
  }, [searchQuery, filterMode, newTextFilter]);

  // Mock messages for selected client
  const messages: Message[] = selectedClient ? [
    {
      id: '1',
      sender: selectedClient.name,
      senderInitials: selectedClient.type === 'Business' 
        ? selectedClient.name.substring(0, 2).toUpperCase() 
        : selectedClient.name.split(' ').map(n => n[0]).join(''),
      content: 'Hi, I wanted to follow up on our last conversation.',
      timestamp: '10:30 AM',
      date: 'Today',
      isCurrentUser: false,
    },
    {
      id: '2',
      sender: 'You',
      senderInitials: 'ME',
      content: 'Of course! Let me get that information for you.',
      timestamp: '10:32 AM',
      date: 'Today',
      isCurrentUser: true,
      readBy: ['client'],
    },
    {
      id: '3',
      sender: selectedClient.name,
      senderInitials: selectedClient.type === 'Business' 
        ? selectedClient.name.substring(0, 2).toUpperCase() 
        : selectedClient.name.split(' ').map(n => n[0]).join(''),
      content: selectedClient.lastMessage || 'Thanks for the quick response!',
      timestamp: '10:35 AM',
      date: 'Today',
      isCurrentUser: false,
    },
  ] : [];

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const grouped: Record<string, Message[]> = {};
    messages.forEach(message => {
      if (!grouped[message.date]) {
        grouped[message.date] = [];
      }
      grouped[message.date].push(message);
    });
    return grouped;
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    console.log('Sending message:', {
      client: selectedClient?.id,
      text: messageText,
    });

    setMessageText('');
  };

  const handleFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected:', file.name);
        // Handle file upload here
      }
    };
    input.click();
  };

  const commonEmojis = ['😊', '👍', '❤️', '😂', '🎉', '✅', '👋', '🙏', '💯', '🔥', '✨', '💪'];

  const insertEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Left Sidebar - Clients List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Text Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewTextDialog(true)}
              className="h-8 gap-1.5"
              style={{ backgroundColor: 'var(--primaryColor)' }}
            >
              <Plus className="w-4 h-4" />
              New Text
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filterMode === 'all'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              All Clients
            </button>
            <button
              onClick={() => setFilterMode('new')}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                filterMode === 'new'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              New Texts
              {mockClients.filter(c => (c.unreadCount || 0) > 0).length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                  {mockClients.filter(c => (c.unreadCount || 0) > 0).length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Clients List */}
        <ScrollArea className="flex-1">
          {filteredClients.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No clients match your search' : 'No text messages yet'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    "w-full p-3 rounded-lg mb-1 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
                    selectedClient?.id === client.id && "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs font-medium",
                        client.type === 'Business'
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      )}>
                        {client.type === 'Business' 
                          ? client.name.substring(0, 2).toUpperCase() 
                          : client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {client.type === 'Business' ? (
                            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {client.name}
                          </span>
                        </div>
                        {client.lastMessageTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {client.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {client.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-xs text-gray-500 dark:text-gray-400 truncate flex-1",
                          (client.unreadCount || 0) > 0 && "font-semibold text-gray-900 dark:text-gray-100"
                        )}>
                          {client.lastMessage || 'No messages yet'}
                        </p>
                        {(client.unreadCount || 0) > 0 && (
                          <Badge className="h-5 px-1.5 text-[10px] bg-purple-600 hover:bg-purple-600 ml-2 flex-shrink-0">
                            {client.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side - Conversation */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {!selectedClient ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Select a client to view messages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose a client from the list to start messaging
              </p>
              <Button
                onClick={() => setShowNewTextDialog(true)}
                className="gap-2"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4" />
                New Text Message
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    selectedClient.type === 'Business'
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  )}>
                    {selectedClient.type === 'Business' 
                      ? selectedClient.name.substring(0, 2).toUpperCase() 
                      : selectedClient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedClient.name}
                    </h3>
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                      SMS
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedClient.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-6">
                {Object.entries(messagesByDate).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {dateMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3 group",
                            message.isCurrentUser && "flex-row-reverse"
                          )}
                        >
                          {/* Avatar */}
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className={cn(
                              "text-xs",
                              message.isCurrentUser 
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" 
                                : selectedClient.type === 'Business'
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            )}>
                              {message.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={cn("flex-1 max-w-2xl", message.isCurrentUser && "flex flex-col items-end")}>
                            {/* Sender Name */}
                            <div className={cn(
                              "flex items-center gap-2 mb-1",
                              message.isCurrentUser && "justify-end"
                            )}>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{message.sender}</span>
                            </div>
                            
                            <div className="relative">
                              <div
                                className={cn(
                                  "rounded-lg px-3 py-2 border-l-4 shadow-sm",
                                  message.isCurrentUser
                                    ? "bg-purple-50 dark:bg-purple-900/20 border-l-purple-500"
                                    : selectedClient.type === 'Business'
                                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-blue-400"
                                      : "bg-green-50 dark:bg-green-900/20 border-l-green-400"
                                )}
                              >
                                {/* Message Content */}
                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap mb-1">{message.content}</p>
                              
                                {/* Timestamp & Read Receipt */}
                                <div className={cn(
                                  "flex items-center gap-1.5 mt-1.5",
                                  message.isCurrentUser ? "justify-end" : "justify-end"
                                )}>
                                  {message.readBy && message.readBy.length > 0 && (
                                    <CheckCheck className="w-3 h-3 text-green-600 dark:text-green-500" />
                                  )}
                                  <span className={cn(
                                    "text-[10px]",
                                    message.isCurrentUser 
                                      ? "text-purple-600 dark:text-purple-400" 
                                      : selectedClient.type === 'Business' 
                                        ? "text-blue-600 dark:text-blue-400" 
                                        : "text-green-600 dark:text-green-400"
                                  )}>
                                    {message.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {/* Communication Mode Banner */}
              <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-600 dark:text-green-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-900 dark:text-green-100">SMS Text Messages: {selectedClient.name}</p>
                  <p className="text-[10px] text-green-600 dark:text-green-400">Sending to {selectedClient.phone}</p>
                </div>
                <Badge className="bg-green-600 hover:bg-green-600 text-white text-[10px]">SMS</Badge>
              </div>

              {/* Message Input */}
              <div className="p-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a text message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="resize-none pr-20 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      rows={3}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleFileAttach}>
                        <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </Button>
                      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Smile className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="end" side="top">
                          <div className="grid grid-cols-6 gap-1">
                            {commonEmojis.map((emoji, i) => (
                              <button
                                key={i}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 self-end"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Text Dialog */}
      <Dialog open={showNewTextDialog} onOpenChange={setShowNewTextDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              New Text Message
            </DialogTitle>
            <DialogDescription>
              Select a client and compose your text message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Client Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNewTextFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  newTextFilter === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                All Clients
              </button>
              <button
                onClick={() => setNewTextFilter('Individual')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                  newTextFilter === 'Individual'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <User className="w-3 h-3" />
                Individual
              </button>
              <button
                onClick={() => setNewTextFilter('Business')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                  newTextFilter === 'Business'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Building2 className="w-3 h-3" />
                Business
              </button>
            </div>

            {/* Client Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Select Client
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search for a client..."
                  value={newTextClientSearch}
                  onChange={(e) => setNewTextClientSearch(e.target.value)}
                  className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              
              {/* Client List */}
              <ScrollArea className="h-48 mt-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                {mockClients
                  .filter(client =>
                    client.name.toLowerCase().includes(newTextClientSearch.toLowerCase()) ||
                    client.phone.toLowerCase().includes(newTextClientSearch.toLowerCase())
                  )
                  .map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowNewTextDialog(false);
                        setNewTextClientSearch('');
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className={cn(
                            "text-xs font-medium",
                            client.type === 'Business'
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          )}>
                            {client.type === 'Business' 
                              ? client.name.substring(0, 2).toUpperCase() 
                              : client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {client.type === 'Business' ? (
                              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {client.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {client.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}