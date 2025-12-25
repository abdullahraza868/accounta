import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Send,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './ui/utils';

type EmailLogEntry = {
  id: string;
  emailId: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced';
  openedAt?: string;
  openCount?: number;
  deliveredAt?: string;
  failureReason?: string;
  isSecure: boolean;
  clientName?: string;
};

export function EmailActivityLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeamMember, setFilterTeamMember] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('7days');

  // Mock log entries
  const logEntries: EmailLogEntry[] = [
    {
      id: '1',
      emailId: 'e1',
      subject: 'Q4 Tax Documents Ready for Review',
      from: { name: 'Sarah Johnson', email: 'sarah@firm.com' },
      to: ['gokhan@troy.com'],
      sentAt: new Date().toISOString(),
      status: 'opened',
      deliveredAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      openCount: 3,
      isSecure: false,
      clientName: 'Troy Business Services LLC',
    },
    {
      id: '2',
      emailId: 'e2',
      subject: 'Year-End Financial Review Meeting Confirmation',
      from: { name: 'Sarah Johnson', email: 'sarah@firm.com' },
      to: ['jamal@bestface.com'],
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isSecure: false,
      clientName: 'Best Face Forward',
    },
    {
      id: '3',
      emailId: 'e3',
      subject: '[SECURE] 2024 Tax Return - Sensitive Information',
      from: { name: 'Mike Chen', email: 'mike@firm.com' },
      to: ['john@smithfamily.com'],
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isSecure: true,
      clientName: 'John & Mary Smith',
    },
    {
      id: '4',
      emailId: 'e4',
      subject: 'Quarterly Tax Payment Reminder',
      from: { name: 'Emily Rodriguez', email: 'emily@firm.com' },
      to: ['client@example.com'],
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'failed',
      failureReason: 'Recipient email address not found (550 User not found)',
      isSecure: false,
    },
    {
      id: '5',
      emailId: 'e5',
      subject: 'Monthly Newsletter - Tax Tips',
      from: { name: 'David Kim', email: 'david@firm.com' },
      to: ['newsletter@clients.com'],
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'opened',
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      openCount: 127,
      isSecure: false,
    },
  ];

  const teamMembers = [
    { id: 'all', name: 'All Team Members' },
    { id: 'sarah@firm.com', name: 'Sarah Johnson' },
    { id: 'mike@firm.com', name: 'Mike Chen' },
    { id: 'emily@firm.com', name: 'Emily Rodriguez' },
    { id: 'david@firm.com', name: 'David Kim' },
  ];

  const filteredEntries = logEntries.filter(entry => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !entry.subject.toLowerCase().includes(query) &&
        !entry.from.name.toLowerCase().includes(query) &&
        !entry.from.email.toLowerCase().includes(query) &&
        !entry.to.some(email => email.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Status filter
    if (filterStatus !== 'all' && entry.status !== filterStatus) {
      return false;
    }

    // Team member filter
    if (filterTeamMember !== 'all' && entry.from.email !== filterTeamMember) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (entry: EmailLogEntry) => {
    const statusConfig = {
      sent: {
        icon: <Send className="w-3 h-3" />,
        label: 'Sent',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      delivered: {
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Delivered',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      opened: {
        icon: <Eye className="w-3 h-3" />,
        label: `Opened${entry.openCount ? ` (${entry.openCount}x)` : ''}`,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      failed: {
        icon: <XCircle className="w-3 h-3" />,
        label: 'Failed',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      bounced: {
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Bounced',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };

    const config = statusConfig[entry.status];

    return (
      <Badge variant="secondary" className={`gap-1 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleExport = () => {
    toast.success('Email activity log exported');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Email Activity Log
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and monitor all email activity across the firm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              toast.info('Refreshing activity log...');
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="gap-2"
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search emails, senders, recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Member Filter */}
          <div>
            <Select value={filterTeamMember} onValueChange={setFilterTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="All Team Members" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {logEntries.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {logEntries.filter(e => e.status === 'delivered' || e.status === 'opened').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Opened</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {logEntries.filter(e => e.status === 'opened').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {logEntries.filter(e => e.status === 'failed' || e.status === 'bounced').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {Math.round((logEntries.filter(e => e.status === 'opened').length / logEntries.length) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Activity List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Recent Activity ({filteredEntries.length})
          </h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Subject and Status */}
                    <div className="flex items-start gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {entry.subject}
                          </h4>
                          {entry.isSecure && (
                            <Badge variant="secondary" className="text-xs gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <Shield className="w-3 h-3" />
                              Secure
                            </Badge>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(entry)}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 ml-6">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">From: {entry.from.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">To: {entry.to[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Sent: {format(new Date(entry.sentAt), 'MMM d, h:mm a')}</span>
                      </div>
                      {entry.deliveredAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered: {format(new Date(entry.deliveredAt), 'MMM d, h:mm a')}</span>
                        </div>
                      )}
                      {entry.openedAt && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Opened: {format(new Date(entry.openedAt), 'MMM d, h:mm a')}</span>
                        </div>
                      )}
                      {entry.clientName && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">Client: {entry.clientName}</span>
                        </div>
                      )}
                    </div>

                    {/* Failure Reason */}
                    {entry.failureReason && (
                      <div className="mt-2 ml-6 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                        <span className="font-medium">Error:</span> {entry.failureReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No email activity found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

import { toast } from 'sonner@2.0.3';
import { Shield, Building2 } from 'lucide-react';
