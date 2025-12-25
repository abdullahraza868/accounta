import React, { useState } from 'react';
import {
  FileText, Upload, Download, Mail, Clock, User, ChevronDown, ChevronUp,
  Eye, EyeOff, AlertCircle, CheckCircle, File, Edit, Trash2, Send, ExternalLink, XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

type ActivityType = 
  | 'document_uploaded'
  | 'document_downloaded'
  | 'document_deleted'
  | 'document_requested'
  | 'document_rejected'
  | 'reminder_sent'
  | 'document_viewed'
  | 'document_moved'
  | 'upload_link_sent'
  | 'client_uploaded';

type ActivityStatus = 'success' | 'failed' | 'warning' | 'info';

type Activity = {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  timestamp: Date;
  user: string;
  client?: string;
  documentName?: string;
  description: string;
  details?: Record<string, string>;
  metadata?: {
    ipAddress?: string;
    deviceType?: string;
    location?: string;
    originalFileUrl?: string;
    thumbnailUrl?: string;
    emailSentDate?: Date;
    emailViewedDate?: Date;
    emailOpenedDate?: Date;
  };
};

interface DocumentActivityLogViewProps {
  clientName: string;
  isFirm?: boolean;
}

// Comprehensive mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'document_rejected',
    status: 'warning',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    user: 'John Smith',
    client: 'Retail Partners',
    documentName: 'Bank_Statement_Wrong.pdf',
    description: 'Document rejected - Wrong month submitted',
    details: {
      rejectionReason: 'Wrong document uploaded. Please upload December bank statement instead of November.',
      notificationSent: 'Yes',
      emailTo: 'contact@retailpartners.com'
    },
    metadata: {
      originalFileUrl: 'https://example.com/documents/bank_statement_nov.pdf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1757256137041-0aab889db199?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5rJTIwc3RhdGVtZW50JTIwY2FsY3VsYXRvciUyMHBob25lfGVufDF8fHx8MTc2NTY3NDE4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      location: 'Office',
      emailSentDate: new Date('2025-12-13T15:58:00'),
      emailViewedDate: new Date('2025-12-13T16:08:00'),
      emailOpenedDate: new Date('2025-12-13T16:13:00')
    }
  },
  {
    id: '2',
    type: 'document_uploaded',
    status: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: 'Sarah Johnson',
    client: 'Acme Corp',
    documentName: 'Q4_Financial_Statement.pdf',
    description: 'Uploaded Q4 Financial Statement',
    details: {
      fileSize: '2.5 MB',
      folder: 'Financial Statements'
    },
    metadata: {
      ipAddress: '192.168.1.100',
      deviceType: 'Desktop',
      location: 'San Francisco, CA'
    }
  },
  {
    id: '3',
    type: 'reminder_sent',
    status: 'info',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    user: 'System',
    client: 'Tech Solutions LLC',
    documentName: 'W-9 Form',
    description: 'Automatic reminder sent for missing W-9',
    details: {
      emailTo: 'contact@techsolutions.com',
      reminderType: 'Automated'
    },
    metadata: {
      emailSentDate: new Date('2025-12-14T09:15:00'),
      emailViewedDate: new Date('2025-12-14T09:32:00')
    }
  },
  {
    id: '4',
    type: 'client_uploaded',
    status: 'success',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    user: 'Client Portal',
    client: 'Green Energy Inc',
    documentName: 'Tax_Document_2024.pdf',
    description: 'Client uploaded document via secure portal',
    details: {
      uploadMethod: 'Secure Upload Link',
      verificationCode: '****56'
    },
    metadata: {
      ipAddress: '203.0.113.45',
      deviceType: 'Mobile',
      location: 'Austin, TX'
    }
  },
  {
    id: '5',
    type: 'document_downloaded',
    status: 'success',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    user: 'Michael Chen',
    client: 'Retail Partners',
    documentName: 'Invoice_2024_December.pdf',
    description: 'Downloaded December invoice',
    details: {
      downloadCount: '1',
      fileSize: '890 KB'
    }
  },
  {
    id: '6',
    type: 'upload_link_sent',
    status: 'info',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    user: 'Sarah Johnson',
    client: 'Manufacturing Co',
    documentName: 'Bank Statements',
    description: 'Secure upload link sent to client',
    details: {
      expiresIn: '7 days',
      requiresPhone: 'Yes'
    },
    metadata: {
      emailSentDate: new Date('2025-12-11T14:22:00')
    }
  },
  {
    id: '7',
    type: 'document_viewed',
    status: 'success',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    user: 'Client',
    client: 'Acme Corp',
    documentName: 'Tax_Return_2023.pdf',
    description: 'Client viewed tax return document',
    metadata: {
      ipAddress: '198.51.100.23',
      deviceType: 'Desktop',
      location: 'New York, NY'
    }
  },
  {
    id: '8',
    type: 'document_requested',
    status: 'warning',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    user: 'John Smith',
    client: 'Startup Ventures',
    documentName: 'Business License',
    description: 'Requested missing business license',
    details: {
      dueDate: 'Dec 20, 2024',
      priority: 'High'
    }
  },
  {
    id: '9',
    type: 'document_moved',
    status: 'success',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    user: 'Sarah Johnson',
    documentName: 'Contract_Draft.pdf',
    description: 'Moved document to Contracts folder',
    details: {
      fromFolder: 'Drafts',
      toFolder: 'Contracts'
    }
  },
  {
    id: '10',
    type: 'document_deleted',
    status: 'warning',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    user: 'Michael Chen',
    client: 'Old Client LLC',
    documentName: 'Outdated_Report.pdf',
    description: 'Deleted outdated report',
    details: {
      reason: 'Document expired',
      restorable: 'Yes (30 days)'
    }
  },
  {
    id: '11',
    type: 'reminder_sent',
    status: 'failed',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    user: 'System',
    client: 'Invalid Email Corp',
    documentName: '1099 Form',
    description: 'Failed to send reminder - invalid email',
    details: {
      error: 'Email bounced',
      emailTo: 'invalid@example.com'
    }
  }
];

export function DocumentActivityLogView({ clientName, isFirm = false }: DocumentActivityLogViewProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = useState<'all' | 'uploads' | 'downloads' | 'reminders' | 'client_activity' | 'rejected'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEvents(newExpanded);
  };

  // Format time ago
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hr ago`;
    } else {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'document_uploaded':
      case 'client_uploaded':
        return <Upload className="w-5 h-5" />;
      case 'document_downloaded':
        return <Download className="w-5 h-5" />;
      case 'document_deleted':
        return <Trash2 className="w-5 h-5" />;
      case 'document_rejected':
        return <XCircle className="w-5 h-5" />;
      case 'reminder_sent':
      case 'upload_link_sent':
        return <Mail className="w-5 h-5" />;
      case 'document_requested':
        return <AlertCircle className="w-5 h-5" />;
      case 'document_viewed':
        return <Eye className="w-5 h-5" />;
      case 'document_moved':
        return <Edit className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: ActivityType, status: ActivityStatus) => {
    if (status === 'failed') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
      };
    }
    if (status === 'warning') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    }

    switch (type) {
      case 'document_uploaded':
      case 'client_uploaded':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          dot: 'bg-green-500',
        };
      case 'document_downloaded':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'reminder_sent':
      case 'upload_link_sent':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
        };
      case 'document_viewed':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          text: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          dot: 'bg-gray-400',
        };
    }
  };

  // Filter activities
  let filteredActivities = mockActivities.filter(activity => {
    if (selectedPreset === 'uploads') {
      return activity.type === 'document_uploaded' || activity.type === 'client_uploaded';
    }
    if (selectedPreset === 'downloads') {
      return activity.type === 'document_downloaded';
    }
    if (selectedPreset === 'reminders') {
      return activity.type === 'reminder_sent' || activity.type === 'upload_link_sent';
    }
    if (selectedPreset === 'client_activity') {
      return activity.type === 'client_uploaded' || activity.type === 'document_viewed';
    }
    if (selectedPreset === 'rejected') {
      return activity.type === 'document_rejected';
    }
    return true;
  });

  // Date range filter
  const now = new Date();
  filteredActivities = filteredActivities.filter(activity => {
    if (dateRange === 'today') {
      return activity.timestamp.toDateString() === now.toDateString();
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return activity.timestamp >= weekAgo;
    }
    if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return activity.timestamp >= monthAgo;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Activity Log - {isFirm ? 'Firm Documents' : clientName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time timeline of all document activities and events
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Filters - 2 Line Layout */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Line 1: Category Filter Pills */}
            <div className="w-full flex justify-center">
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setSelectedPreset('all')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all ${
                    selectedPreset === 'all'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  All Activity
                </button>
                
                <button
                  onClick={() => setSelectedPreset('uploads')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                    selectedPreset === 'uploads'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'uploads' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Uploads
                </button>
                
                <button
                  onClick={() => setSelectedPreset('downloads')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                    selectedPreset === 'downloads'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'downloads' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Downloads
                </button>

                <button
                  onClick={() => setSelectedPreset('reminders')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                    selectedPreset === 'reminders'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'reminders' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Reminders
                </button>

                <button
                  onClick={() => setSelectedPreset('client_activity')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                    selectedPreset === 'client_activity'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'client_activity' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Client Activity
                </button>

                <button
                  onClick={() => setSelectedPreset('rejected')}
                  className={`gap-1.5 h-8 px-4 rounded text-xs font-medium transition-all flex items-center ${
                    selectedPreset === 'rejected'
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  style={selectedPreset === 'rejected' ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Rejected
                </button>
              </div>
            </div>

            {/* Line 2: Date Range Filter */}
            <div className="w-full flex justify-center">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setDateRange('today')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    dateRange === 'today'
                      ? 'font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Today
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    dateRange === 'week'
                      ? 'font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Last 7 Days
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    dateRange === 'month'
                      ? 'font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Last 30 Days
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={() => setDateRange('all')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    dateRange === 'all'
                      ? 'font-semibold text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const colors = getActivityColor(activity.type, activity.status);
              const isExpanded = expandedEvents.has(activity.id);
              const hasDetails = activity.details || activity.metadata;

              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Left: Time Ago */}
                  <div className="w-24 flex-shrink-0 text-right pt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>

                  {/* Middle: Timeline */}
                  <div className="relative flex flex-col items-center flex-shrink-0">
                    {/* Timeline dot */}
                    <div className={cn("w-3 h-3 rounded-full border-4 border-white dark:border-gray-900 z-10", colors.dot)} />
                    
                    {/* Timeline line */}
                    {index !== filteredActivities.length - 1 && (
                      <div className="absolute top-3 bottom-[-16px] w-[2px] bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>

                  {/* Right: Activity Card */}
                  <div className="flex-1 pb-4">
                    <div
                      onClick={() => hasDetails && toggleExpand(activity.id)}
                      className={cn(
                        "bg-white dark:bg-gray-800 border-2 rounded-xl p-4 transition-all",
                        colors.border,
                        hasDetails && "cursor-pointer hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", colors.bg)}>
                          <div className={colors.text}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {activity.description}
                              </h4>
                              {activity.client && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  Client: <span className="font-medium">{activity.client}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", colors.bg, colors.text)}
                              >
                                {activity.status}
                              </Badge>
                              {hasDetails && (
                                isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {activity.user}
                              </div>
                              {activity.documentName && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {activity.documentName}
                                </div>
                              )}
                            </div>
                            
                            {/* Email Tracking Status on Main Card */}
                            {activity.metadata?.emailOpenedDate && (
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                                <Eye className="w-3 h-3" />
                                Opened: {activity.metadata.emailOpenedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} | {activity.metadata.emailOpenedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            )}
                            {!activity.metadata?.emailOpenedDate && activity.metadata?.emailViewedDate && (
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                                <Eye className="w-3 h-3" />
                                Viewed: {activity.metadata.emailViewedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} | {activity.metadata.emailViewedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            )}
                            {!activity.metadata?.emailOpenedDate && !activity.metadata?.emailViewedDate && activity.metadata?.emailSentDate && (
                              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                <EyeOff className="w-3 h-3" />
                                Not Opened
                              </div>
                            )}
                          </div>

                          {/* Expanded Details - CUSTOM FOR REJECTED DOCUMENTS */}
                          {isExpanded && hasDetails && activity.type === 'document_rejected' && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                              {/* Rejection Reason & Notification Status */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Rejection Reason:</span> {activity.details?.rejectionReason}
                                  </p>
                                </div>
                                <div className="col-span-1 text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Notification Sent:</span> {activity.details?.notificationSent}
                                  </p>
                                </div>
                              </div>

                              {/* Email To */}
                              {activity.details?.emailTo && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Email To:</span> {activity.details.emailTo}
                                </div>
                              )}

                              {/* Document Preview Section */}
                              {activity.metadata?.thumbnailUrl && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Rejected Document Preview:
                                  </p>
                                  <div className="group relative inline-block">
                                    <img
                                      src={activity.metadata.thumbnailUrl}
                                      alt="Document Preview"
                                      className="w-40 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105"
                                    />
                                  </div>
                                  {activity.metadata.originalFileUrl && (
                                    <a
                                      href={activity.metadata.originalFileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View Original File
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Email Tracking Timeline */}
                              {(activity.metadata?.emailSentDate || activity.metadata?.emailViewedDate || activity.metadata?.emailOpenedDate) && (
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  {activity.metadata.emailSentDate && (
                                    <span>
                                      <span className="font-medium">Email Sent:</span>{' '}
                                      {activity.metadata.emailSentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} |{' '}
                                      {activity.metadata.emailSentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                  )}
                                  {activity.metadata.emailViewedDate && (
                                    <>
                                      <span className="text-gray-300 dark:text-gray-600">|</span>
                                      <span>
                                        <span className="font-medium">Viewed:</span>{' '}
                                        {activity.metadata.emailViewedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} |{' '}
                                        {activity.metadata.emailViewedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                      </span>
                                    </>
                                  )}
                                  {activity.metadata.emailOpenedDate && (
                                    <>
                                      <span className="text-gray-300 dark:text-gray-600">|</span>
                                      <span>
                                        <span className="font-medium">Opened:</span>{' '}
                                        {activity.metadata.emailOpenedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} |{' '}
                                        {activity.metadata.emailOpenedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Expanded Details - GENERIC FOR OTHER ACTIVITIES */}
                          {isExpanded && hasDetails && activity.type !== 'document_rejected' && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-3">
                                {activity.details && Object.entries(activity.details).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100 ml-1">{value}</span>
                                  </div>
                                ))}
                                {activity.metadata && (
                                  <>
                                    {activity.metadata.ipAddress && (
                                      <div className="text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">IP Address:</span>
                                        <span className="text-gray-900 dark:text-gray-100 ml-1">{activity.metadata.ipAddress}</span>
                                      </div>
                                    )}
                                    {activity.metadata.deviceType && (
                                      <div className="text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Device:</span>
                                        <span className="text-gray-900 dark:text-gray-100 ml-1">{activity.metadata.deviceType}</span>
                                      </div>
                                    )}
                                    {activity.metadata.location && (
                                      <div className="text-xs col-span-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Location:</span>
                                        <span className="text-gray-900 dark:text-gray-100 ml-1">{activity.metadata.location}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No activities found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your filters or date range
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}