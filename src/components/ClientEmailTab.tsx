import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import {
  Mail,
  Send,
  Search,
  Star,
  Paperclip,
  Shield,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from './ui/utils';
import { ComposeEmailDialog } from './ComposeEmailDialog';
import { AIEmailSummaryDialog } from './AIEmailSummaryDialog';
import { toast } from 'sonner@2.0.3';

type ClientEmailTabProps = {
  clientId: string;
  clientName: string;
  clientEmail: string;
};

type Email = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
    isClient: boolean;
  };
  to: string[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  isSecure: boolean;
  status?: 'sent' | 'delivered' | 'opened' | 'failed';
  sentBy?: string; // Team member who sent it
};

export function ClientEmailTab({ clientId, clientName, clientEmail }: ClientEmailTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEmails, setExpandedEmails] = useState<string[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Mock emails for this client
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: { 
        name: 'Gokhan Troy', 
        email: clientEmail, 
        avatar: 'GT',
        isClient: true 
      },
      to: ['sarah@firm.com'],
      subject: 'Q4 Tax Documents Ready for Review',
      body: `Hi Sarah,\n\nI hope this email finds you well. I wanted to let you know that I've uploaded all the Q4 tax documents to the portal as requested.\n\nThe documents include:\n- Income statements\n- Expense reports\n- Quarterly revenue breakdown\n\nPlease let me know if you need anything else or if you have any questions.\n\nBest regards,\nGokhan`,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      hasAttachments: true,
      attachments: [
        { id: '1', name: 'Q4-Income-Statement.pdf', size: 245000, type: 'application/pdf' },
        { id: '2', name: 'Q4-Expenses.xlsx', size: 89000, type: 'application/vnd.ms-excel' }
      ],
      isSecure: false,
      status: 'delivered',
    },
    {
      id: '2',
      from: { 
        name: 'Sarah Johnson', 
        email: 'sarah@firm.com', 
        avatar: 'SJ',
        isClient: false 
      },
      to: [clientEmail],
      subject: 'Re: Q4 Tax Documents Ready for Review',
      body: `Hi Gokhan,\n\nThank you for uploading the Q4 documents! I've reviewed everything and it looks great.\n\nI have a few questions about some expense categories. Can we schedule a quick call this week to discuss?\n\nBest,\nSarah`,
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      starred: true,
      hasAttachments: false,
      isSecure: false,
      status: 'opened',
      sentBy: 'Sarah Johnson',
    },
    {
      id: '3',
      from: { 
        name: 'Mike Chen', 
        email: 'mike@firm.com', 
        avatar: 'MC',
        isClient: false 
      },
      to: [clientEmail],
      subject: '[SECURE] 2024 Tax Return - Final Review',
      body: `This is a secure email. The client needs to verify their identity to view this message.`,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      hasAttachments: true,
      attachments: [
        { id: '3', name: '2024-Tax-Return.pdf', size: 1200000, type: 'application/pdf' }
      ],
      isSecure: true,
      status: 'delivered',
      sentBy: 'Mike Chen',
    },
    {
      id: '4',
      from: { 
        name: 'Gokhan Troy', 
        email: clientEmail, 
        avatar: 'GT',
        isClient: true 
      },
      to: ['sarah@firm.com'],
      subject: 'Question about Quarterly Estimates',
      body: `Hi Sarah,\n\nI have a quick question about the quarterly tax estimates for next year.\n\nShould I be setting aside the same percentage as last year, or do you think it should be adjusted based on Q4 performance?\n\nThanks!\nGokhan`,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      hasAttachments: false,
      isSecure: false,
      status: 'delivered',
    },
    {
      id: '5',
      from: { 
        name: 'Sarah Johnson', 
        email: 'sarah@firm.com', 
        avatar: 'SJ',
        isClient: false 
      },
      to: [clientEmail],
      subject: 'Re: Question about Quarterly Estimates',
      body: `Hi Gokhan,\n\nGreat question! Based on your Q4 performance, I'd recommend adjusting your estimates slightly.\n\nLet's schedule a call to review the numbers in detail and come up with a plan.\n\nBest,\nSarah`,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      hasAttachments: false,
      isSecure: false,
      status: 'opened',
      sentBy: 'Sarah Johnson',
    },
  ]);

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleEmailExpand = (emailId: string) => {
    setExpandedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleStarEmail = (emailId: string) => {
    setEmails(emails.map(e =>
      e.id === emailId ? { ...e, starred: !e.starred } : e
    ));
  };

  const handleSummarizeAll = () => {
    toast.info('Generating summary of all client emails...', {
      description: 'AI is analyzing the email thread',
    });
    // Would trigger AI summary generation for all emails
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Email Communication
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            All emails with {clientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSummarizeAll}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Summarize All
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCompose(true)}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Emails</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {emails.length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">From Client</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {emails.filter(e => e.from.isClient).length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">To Client</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {emails.filter(e => !e.from.isClient).length}
          </p>
        </Card>
      </div>

      {/* Email List */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Mail className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No emails found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmails.map(email => {
                const isExpanded = expandedEmails.includes(email.id);

                return (
                  <div
                    key={email.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Email Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-full",
                            email.from.isClient ? "bg-gray-600" : ""
                          )}
                          style={!email.from.isClient ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {email.from.avatar || email.from.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {email.from.name}
                              </span>
                              {email.from.isClient && (
                                <Badge variant="secondary" className="text-xs">Client</Badge>
                              )}
                              {email.sentBy && (
                                <Badge variant="secondary" className="text-xs">
                                  Sent by {email.sentBy}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {email.from.email} → {email.to[0]}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStarEmail(email.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  email.starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                                )}
                              />
                            </Button>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleEmailExpand(email.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                              {email.subject}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {email.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-gray-400" />}
                              {email.isSecure && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {!isExpanded && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {email.body.substring(0, 100)}...
                            </p>
                          )}
                        </button>

                        {/* Expanded Email Body */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                {email.body}
                              </pre>
                            </div>

                            {/* Attachments */}
                            {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Attachments ({email.attachments.length})
                                </h4>
                                <div className="space-y-2">
                                  {email.attachments.map(attachment => (
                                    <Card key={attachment.id} className="p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                          <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {attachment.name}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(attachment.size)}
                                          </p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                          <Download className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowCompose(true);
                                }}
                              >
                                Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedEmail(email);
                                  setShowAISummary(true);
                                }}
                                className="gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                AI Summary
                              </Button>
                            </div>
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
      </Card>

      {/* Dialogs */}
      <ComposeEmailDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        initialClientId={clientId}
        initialClientName={clientName}
      />

      {selectedEmail && (
        <AIEmailSummaryDialog
          open={showAISummary}
          onOpenChange={setShowAISummary}
          email={selectedEmail}
        />
      )}
    </div>
  );
}
