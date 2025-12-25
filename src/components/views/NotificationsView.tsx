import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type Notification = {
  id: number;
  type: 'task' | 'document' | 'message' | 'system' | 'client';
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  avatar?: string;
  avatarFallback?: string;
};

export function NotificationsView() {
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'task',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Review Q4 Financial Reports" by John Smith',
      time: '5 minutes ago',
      read: false,
      urgent: true,
      avatarFallback: 'JS'
    },
    {
      id: 2,
      type: 'document',
      title: 'Document Uploaded',
      message: 'Accounting1 Client uploaded a new document "Tax Return 2024.pdf"',
      time: '15 minutes ago',
      read: false,
      avatarFallback: 'AC'
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Juan Verburg sent you a message: "Can we schedule a meeting for tomorrow?"',
      time: '1 hour ago',
      read: false,
      avatarFallback: 'JV'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Platform maintenance scheduled for tonight at 11 PM EST. Expected downtime: 30 minutes.',
      time: '2 hours ago',
      read: true,
      avatarFallback: 'SY'
    },
    {
      id: 5,
      type: 'client',
      title: 'Client Activity',
      message: 'Adam deleted "Consulting - Nicole Workout" from the project',
      time: '3 hours ago',
      read: true,
      avatarFallback: 'A'
    },
    {
      id: 6,
      type: 'task',
      title: 'Task Deadline Approaching',
      message: 'Task "Monthly Report Preparation" is due in 2 days',
      time: '5 hours ago',
      read: true,
      urgent: true,
      avatarFallback: 'TR'
    },
    {
      id: 7,
      type: 'document',
      title: 'Document Signed',
      message: 'Client "Atlantis Vienna" signed the invoice ACH0108-0007',
      time: '1 day ago',
      read: true,
      avatarFallback: 'AV'
    },
    {
      id: 8,
      type: 'message',
      title: 'New Message',
      message: 'Team notification: Weekly meeting rescheduled to Friday at 3 PM',
      time: '1 day ago',
      read: true,
      avatarFallback: 'TN'
    },
    {
      id: 9,
      type: 'client',
      title: 'New Client Registration',
      message: 'A new client "Tech Solutions Inc." has registered and is awaiting approval',
      time: '2 days ago',
      read: true,
      avatarFallback: 'TS'
    },
    {
      id: 10,
      type: 'system',
      title: 'Backup Completed',
      message: 'Your data backup was successfully completed at 2:00 AM',
      time: '2 days ago',
      read: true,
      avatarFallback: 'SY'
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-500';
      case 'document':
        return 'bg-green-500';
      case 'message':
        return 'var(--primaryColor, #7c3aed)';
      case 'system':
        return 'bg-orange-500';
      case 'client':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const toggleNotification = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const markAsRead = (ids: number[]) => {
    setNotifications(notifications.map(n => 
      ids.includes(n.id) ? { ...n, read: true } : n
    ));
    setSelectedNotifications([]);
  };

  const markAsUnread = (ids: number[]) => {
    setNotifications(notifications.map(n => 
      ids.includes(n.id) ? { ...n, read: false } : n
    ));
    setSelectedNotifications([]);
  };

  const deleteNotifications = (ids: number[]) => {
    setNotifications(notifications.filter(n => !ids.includes(n.id)));
    setSelectedNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread' && n.read) return false;
    if (filterType === 'urgent' && !n.urgent) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bgColorRightPanel, #f9fafb)' }}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl text-gray-900 dark:text-gray-100">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="text-white" style={{ background: 'var(--primaryColor)' }}>
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stay updated with all your notifications
          </p>
        </div>

        {/* Filters and Actions Bar */}
        <Card className="mb-6 border shadow-sm" style={{ background: 'var(--bgColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType('all')}>
                      All Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('unread')}>
                      Unread Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('urgent')}>
                      Urgent Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedNotifications)}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotifications(selectedNotifications)}
                      className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Select All */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                <Checkbox
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length > 0
                    ? `${selectedNotifications.length} selected`
                    : 'Select all'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="border shadow-sm" style={{ background: 'var(--bgColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No notifications found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : filterType === 'unread'
                    ? "You're all caught up!"
                    : 'No urgent notifications at the moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border shadow-sm transition-all hover:shadow-md cursor-pointer ${
                  !notification.read ? 'border-l-4' : ''
                }`}
                style={{
                  background: notification.read
                    ? 'var(--bgColor, #ffffff)'
                    : 'rgba(var(--primaryColorBtnRgb), 0.03)',
                  borderColor: !notification.read
                    ? 'var(--primaryColor)'
                    : 'var(--stokeColor, #e5e7eb)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={() => toggleNotification(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Avatar */}
                    <Avatar className={`w-10 h-10 ${getTypeColor(notification.type)}`}>
                      <AvatarFallback className="text-white text-xs">
                        {notification.avatarFallback}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h4>
                          {notification.urgent && (
                            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead([notification.id]);
                            }}
                            className="text-xs hover:underline"
                            style={{ color: 'var(--primaryColor)' }}
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsUnread([notification.id]);
                            }}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                          >
                            Mark as unread
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotifications([notification.id]);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
