import React from 'react';
import {
  Upload, Check, X, MoveRight, Trash2, Edit, Mail, Bell, Eye,
  StickyNote, FileEdit, Calendar, FileText, Clock, Filter, Download,
  Building2, User
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type ActivityType = 
  | 'upload'
  | 'approve'
  | 'reject'
  | 'move'
  | 'delete'
  | 'rename'
  | 'request'
  | 'reminder'
  | 'view'
  | 'note'
  | 'type_change'
  | 'year_change';

type Document = {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  documentType: string;
  year: string;
  receivedDate: string | null;
  reviewedDate: string | null;
  reviewedBy: string | null;
  status: 'pending' | 'approved' | 'requested' | 'rejected';
  rejectionReason?: string;
  requestedDate?: string;
  method: 'Uploaded File' | 'Email' | 'Text Message' | null;
  thumbnail: string;
  hasOldYear?: boolean;
  uploadedBy?: string;
};

type ActivityLogEntry = {
  id: string;
  timestamp: Date;
  activityType: ActivityType;
  performedBy: string;
  clientId: string;
  clientName: string;
  documentId?: string;
  documentName?: string;
  documentType?: string;
  details: string;
  metadata?: {
    rejectionReason?: string;
    fromFolder?: string;
    toFolder?: string;
    fromClient?: string;
    toClient?: string;
    fromYear?: string;
    toYear?: string;
    oldName?: string;
    newName?: string;
    reminderSent?: boolean;
    reminderViewed?: boolean;
    emailSent?: boolean;
    originalDocument?: Document;
  };
};

interface ActivityLogViewProps {
  activities: ActivityLogEntry[];
  days: number;
  typeFilter: ActivityType | 'all';
  userFilter: string;
  searchQuery: string;
  showFilters: boolean;
  uniqueUsers: string[];
  onDaysChange: (days: number) => void;
  onTypeFilterChange: (type: ActivityType | 'all') => void;
  onUserFilterChange: (user: string) => void;
  onSearchQueryChange: (query: string) => void;
  onToggleFilters: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onClearFilters: () => void;
}

export function ActivityLogView({
  activities,
  days,
  typeFilter,
  userFilter,
  searchQuery,
  showFilters,
  uniqueUsers,
  onDaysChange,
  onTypeFilterChange,
  onUserFilterChange,
  onSearchQueryChange,
  onToggleFilters,
  onExportCSV,
  onExportPDF,
  onClearFilters,
}: ActivityLogViewProps) {
  
  // Format activity timestamp for display
  const formatActivityTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Get activity type display info
  const getActivityTypeInfo = (type: ActivityType): { icon: React.ReactNode; label: string; color: string } => {
    switch (type) {
      case 'upload':
        return { icon: <Upload className="w-4 h-4" />, label: 'Upload', color: 'text-blue-600 dark:text-blue-400' };
      case 'approve':
        return { icon: <Check className="w-4 h-4" />, label: 'Approved', color: 'text-green-600 dark:text-green-400' };
      case 'reject':
        return { icon: <X className="w-4 h-4" />, label: 'Rejected', color: 'text-red-600 dark:text-red-400' };
      case 'move':
        return { icon: <MoveRight className="w-4 h-4" />, label: 'Moved', color: 'text-purple-600 dark:text-purple-400' };
      case 'delete':
        return { icon: <Trash2 className="w-4 h-4" />, label: 'Deleted', color: 'text-red-600 dark:text-red-400' };
      case 'rename':
        return { icon: <Edit className="w-4 h-4" />, label: 'Renamed', color: 'text-gray-600 dark:text-gray-400' };
      case 'request':
        return { icon: <Mail className="w-4 h-4" />, label: 'Request Sent', color: 'text-orange-600 dark:text-orange-400' };
      case 'reminder':
        return { icon: <Bell className="w-4 h-4" />, label: 'Reminder', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'view':
        return { icon: <Eye className="w-4 h-4" />, label: 'Viewed', color: 'text-gray-600 dark:text-gray-400' };
      case 'note':
        return { icon: <StickyNote className="w-4 h-4" />, label: 'Note Added', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'type_change':
        return { icon: <FileEdit className="w-4 h-4" />, label: 'Type Changed', color: 'text-gray-600 dark:text-gray-400' };
      case 'year_change':
        return { icon: <Calendar className="w-4 h-4" />, label: 'Year Changed', color: 'text-gray-600 dark:text-gray-400' };
      default:
        return { icon: <FileText className="w-4 h-4" />, label: 'Activity', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Activity Log Filters */}
      {showFilters && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
              >
                Clear All
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                  <Select value={days.toString()} onValueChange={(v) => onDaysChange(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="60">Last 60 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="99999">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Type */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Activity Type</Label>
                  <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as ActivityType | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="upload">Uploads</SelectItem>
                      <SelectItem value="approve">Approvals</SelectItem>
                      <SelectItem value="reject">Rejections</SelectItem>
                      <SelectItem value="move">Moves</SelectItem>
                      <SelectItem value="delete">Deletions</SelectItem>
                      <SelectItem value="rename">Renames</SelectItem>
                      <SelectItem value="request">Requests</SelectItem>
                      <SelectItem value="reminder">Reminders</SelectItem>
                      <SelectItem value="view">Views</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                      <SelectItem value="type_change">Type Changes</SelectItem>
                      <SelectItem value="year_change">Year Changes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Performed By</Label>
                  <Select value={userFilter} onValueChange={onUserFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map(user => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search</Label>
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Activity Log Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Activity Log Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFilters}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                {days < 99999 && ` in last ${days} ${days === 1 ? 'day' : 'days'}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onExportCSV}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Activity Log List */}
        <ScrollArea className="flex-1">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No activities found for the selected filters
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {activities.map((activity, index) => {
                const typeInfo = getActivityTypeInfo(activity.activityType);
                const showDateDivider = index === 0 || 
                  new Date(activities[index - 1].timestamp).toDateString() !== 
                  new Date(activity.timestamp).toDateString();

                return (
                  <div key={activity.id}>
                    {/* Date Divider */}
                    {showDateDivider && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.timestamp.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      </div>
                    )}

                    {/* Activity Item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        activity.activityType === 'reject' ? 'bg-red-100 dark:bg-red-900/30' :
                        activity.activityType === 'approve' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.activityType === 'upload' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.activityType === 'move' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      )}>
                        <div className={typeInfo.color}>
                          {typeInfo.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {activity.performedBy}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 mx-2">·</span>
                            <span className={cn("font-medium", typeInfo.color)}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatActivityTimestamp(activity.timestamp)}
                          </div>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {activity.details}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Building2 className="w-3 h-3 mr-1" />
                            {activity.clientName}
                          </Badge>
                          {activity.documentName && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {activity.documentName}
                            </Badge>
                          )}
                          {activity.documentType && (
                            <Badge variant="outline" className="text-xs text-gray-600">
                              {activity.documentType}
                            </Badge>
                          )}
                          {activity.metadata?.emailSent && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                              <Mail className="w-3 h-3 mr-1" />
                              Email Sent
                            </Badge>
                          )}
                        </div>

                        {/* Expandable Details for Rejections */}
                        {activity.activityType === 'reject' && activity.metadata?.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">
                              Rejection Reason:
                            </div>
                            <div className="text-sm text-red-800 dark:text-red-200">
                              {activity.metadata.rejectionReason}
                            </div>
                            {activity.metadata.originalDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-7 text-xs"
                                onClick={() => toast.info('View original rejected document')}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Original Document
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Move Details */}
                        {activity.activityType === 'move' && activity.metadata && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {activity.metadata.fromClient && activity.metadata.toClient && (
                              <div>From: {activity.metadata.fromClient} → To: {activity.metadata.toClient}</div>
                            )}
                          </div>
                        )}

                        {/* Year Change Details */}
                        {activity.activityType === 'year_change' && activity.metadata && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            Year: {activity.metadata.fromYear} → {activity.metadata.toYear}
                          </div>
                        )}

                        {/* Rename Details */}
                        {activity.activityType === 'rename' && activity.metadata && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            From: {activity.metadata.oldName} → To: {activity.metadata.newName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
