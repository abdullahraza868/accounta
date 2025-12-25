import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Send,
  Shield,
  Paperclip,
  X,
  FileText,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Building2,
  Tag,
  Sparkles,
  AlertCircle,
  File,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';

type ComposeEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'new' | 'reply' | 'replyAll' | 'forward';
  replyToEmail?: any;
  initialClientId?: string;
  initialClientName?: string;
};

type Recipient = {
  type: 'client' | 'group' | 'email';
  value: string;
  label: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'upload' | 'fileManager';
};

export function ComposeEmailDialog({
  open,
  onOpenChange,
  mode = 'new',
  replyToEmail,
  initialClientId,
  initialClientName,
}: ComposeEmailDialogProps) {
  const [to, setTo] = useState<Recipient[]>([]);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSecure, setIsSecure] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [recipientType, setRecipientType] = useState<'to' | 'cc' | 'bcc'>('to');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock templates
  const templates = [
    { id: '1', name: 'Tax Season Reminder', category: 'Tax Season' },
    { id: '2', name: 'Year-End Review', category: 'Annual Reviews' },
    { id: '3', name: 'Document Request', category: 'Document Requests' },
    { id: '4', name: 'Meeting Confirmation', category: 'Meetings' },
  ];

  // Mock clients
  const clients = [
    { id: '1', name: 'Troy Business Services LLC', email: 'gokhan@troy.com', type: 'Business' },
    { id: '3', name: 'Best Face Forward', email: 'jamal@bestface.com', type: 'Business' },
    { id: '11', name: 'John & Mary Smith', email: 'john@smithfamily.com', type: 'Individual' },
  ];

  // Mock client groups
  const clientGroups = [
    { id: 'g1', name: 'All Business Clients', count: 24 },
    { id: 'g2', name: '1040 Clients', count: 156 },
    { id: 'g3', name: 'Quarterly Filers', count: 45 },
  ];

  useEffect(() => {
    if (open) {
      // Reset form
      if (mode === 'new') {
        setTo([]);
        setSubject('');
        setBody('');
      } else if (mode === 'reply' && replyToEmail) {
        setTo([{ type: 'email', value: replyToEmail.from.email, label: replyToEmail.from.name }]);
        setSubject(`Re: ${replyToEmail.subject.replace(/^Re: /, '')}`);
        setBody(`\n\n---\nOn ${format(new Date(replyToEmail.date), 'PPP')}, ${replyToEmail.from.name} wrote:\n\n${replyToEmail.body}`);
      } else if (mode === 'replyAll' && replyToEmail) {
        setTo([{ type: 'email', value: replyToEmail.from.email, label: replyToEmail.from.name }]);
        // Add CC recipients
        if (replyToEmail.cc && replyToEmail.cc.length > 0) {
          setCc(replyToEmail.cc.map((email: string) => ({ type: 'email' as const, value: email, label: email })));
          setShowCc(true);
        }
        setSubject(`Re: ${replyToEmail.subject.replace(/^Re: /, '')}`);
        setBody(`\n\n---\nOn ${format(new Date(replyToEmail.date), 'PPP')}, ${replyToEmail.from.name} wrote:\n\n${replyToEmail.body}`);
      } else if (mode === 'forward' && replyToEmail) {
        setSubject(`Fwd: ${replyToEmail.subject.replace(/^Fwd: /, '')}`);
        setBody(`\n\n---\nForwarded message from ${replyToEmail.from.name}:\n\n${replyToEmail.body}`);
        // Copy attachments
        if (replyToEmail.attachments) {
          setAttachments(replyToEmail.attachments.map((att: any) => ({
            ...att,
            source: 'fileManager',
          })));
        }
      }

      // Set initial client
      if (initialClientId && initialClientName) {
        const client = clients.find(c => c.id === initialClientId);
        if (client) {
          setTo([{ type: 'client', value: client.id, label: client.name }]);
        }
      }
    }
  }, [open, mode, replyToEmail, initialClientId, initialClientName]);

  const handleSend = () => {
    if (to.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (schedule && !scheduleDate) {
      toast.error('Please select a date for scheduled email');
      return;
    }

    if (isSecure) {
      // Check if all recipients have phone numbers
      const missingPhone = to.some(recipient => {
        if (recipient.type === 'client') {
          const client = clients.find(c => c.id === recipient.value);
          // In real app, check if client has phone
          return false; // Mock: all have phone
        }
        return false;
      });

      if (missingPhone) {
        toast.error('Some recipients don\'t have phone numbers on file. Secure email requires SMS verification.');
        return;
      }
    }

    const action = schedule ? 'scheduled' : 'sent';
    const prefix = isSecure ? 'Secure email' : 'Email';
    
    toast.success(
      schedule
        ? `${prefix} scheduled for ${format(scheduleDate!, 'PPP')} at ${scheduleTime}`
        : `${prefix} sent successfully`,
      {
        description: `To: ${to.map(r => r.label).join(', ')}`,
      }
    );

    onOpenChange(false);
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved');
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const maxSize = 20 * 1024 * 1024; // 20MB

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return;
      }

      newAttachments.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'upload',
      });
    });

    setAttachments([...attachments, ...newAttachments]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const addRecipient = (type: 'to' | 'cc' | 'bcc', recipient: Recipient) => {
    if (type === 'to') {
      setTo([...to, recipient]);
    } else if (type === 'cc') {
      setCc([...cc, recipient]);
    } else {
      setBcc([...bcc, recipient]);
    }
  };

  const removeRecipient = (type: 'to' | 'cc' | 'bcc', index: number) => {
    if (type === 'to') {
      setTo(to.filter((_, i) => i !== index));
    } else if (type === 'cc') {
      setCc(cc.filter((_, i) => i !== index));
    } else {
      setBcc(bcc.filter((_, i) => i !== index));
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Building2 className="w-3 h-3" />;
      case 'group':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="compose-email-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            {mode === 'new' && 'Compose Email'}
            {mode === 'reply' && 'Reply'}
            {mode === 'replyAll' && 'Reply All'}
            {mode === 'forward' && 'Forward'}
          </DialogTitle>
          <DialogDescription id="compose-email-description">
            {isSecure ? 'Compose a secure email with SMS verification' : 'Compose and send an email'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Secure Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <Label className="text-sm font-medium">Send as Secure Email</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Requires SMS verification for recipients
                </p>
              </div>
            </div>
            <Switch
              checked={isSecure}
              onCheckedChange={setIsSecure}
            />
          </div>

          {isSecure && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                Recipients will receive an email with a secure link. They'll need to enter a verification code sent to their phone to view the message.
              </AlertDescription>
            </Alert>
          )}

          {/* Recipients */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">To</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {to.map((recipient, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1">
                    {getRecipientIcon(recipient.type)}
                    <span>{recipient.label}</span>
                    <button
                      onClick={() => removeRecipient('to', index)}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRecipientType('to');
                    setShowRecipientSelector(true);
                  }}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Recipients
                </Button>
                {!showCc && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCc(true)}
                  >
                    Cc
                  </Button>
                )}
                {!showBcc && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowBcc(true)}
                  >
                    Bcc
                  </Button>
                )}
              </div>
            </div>

            {showCc && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Cc</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {cc.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1">
                      {getRecipientIcon(recipient.type)}
                      <span>{recipient.label}</span>
                      <button
                        onClick={() => removeRecipient('cc', index)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRecipientType('cc');
                    setShowRecipientSelector(true);
                  }}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Cc Recipients
                </Button>
              </div>
            )}

            {showBcc && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Bcc</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bcc.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1">
                      {getRecipientIcon(recipient.type)}
                      <span>{recipient.label}</span>
                      <button
                        onClick={() => removeRecipient('bcc', index)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRecipientType('bcc');
                    setShowRecipientSelector(true);
                  }}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Bcc Recipients
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Template Selection */}
          <div className="flex items-center gap-2">
            <Switch
              id="use-template"
              checked={useTemplate}
              onCheckedChange={setUseTemplate}
            />
            <Label htmlFor="use-template" className="text-sm font-medium cursor-pointer">
              Use Template
            </Label>
          </div>

          {useTemplate && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{template.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Templates support merge fields like {'{client_name}'}, {'{firm_name}'}, etc.
              </p>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium mb-2 block">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="body" className="text-sm font-medium">Message</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-2"
                onClick={() => {
                  toast.info('AI email generation coming soon...');
                }}
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </Button>
            </div>
            <Textarea
              id="body"
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-sans"
            />
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Attachments</Label>
            <div className="space-y-2">
              {attachments.map(attachment => (
                <Card key={attachment.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {attachment.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.size)}
                        {attachment.source === 'fileManager' && ' • From File Manager'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.info('File Manager integration coming soon...');
                  }}
                  className="gap-2"
                >
                  <Paperclip className="w-4 h-4" />
                  From File Manager
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum file size: 20 MB per attachment
              </p>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="flex items-center gap-2">
            <Switch
              id="schedule"
              checked={schedule}
              onCheckedChange={setSchedule}
            />
            <Label htmlFor="schedule" className="text-sm font-medium cursor-pointer">
              Schedule Email
            </Label>
          </div>

          {schedule && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              style={{ backgroundColor: 'var(--primaryColor)' }}
              className="gap-2"
            >
              {isSecure ? <Shield className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {schedule ? 'Schedule Email' : 'Send Email'}
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>

      {/* Recipient Selector Dialog - Will create this next */}
      {showRecipientSelector && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Recipients</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRecipientSelector(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Clients */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Clients
                </h4>
                <div className="space-y-1">
                  {clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        addRecipient(recipientType, {
                          type: 'client',
                          value: client.id,
                          label: client.name,
                        });
                        setShowRecipientSelector(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Client Groups */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Client Groups
                </h4>
                <div className="space-y-1">
                  {clientGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => {
                        addRecipient(recipientType, {
                          type: 'group',
                          value: group.id,
                          label: group.name,
                        });
                        setShowRecipientSelector(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                    >
                      <p className="text-sm font-medium">{group.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {group.count} clients
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Email */}
              <div>
                <h4 className="text-sm font-medium mb-2">Enter Email Address</h4>
                <Input
                  placeholder="email@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const email = e.currentTarget.value;
                      if (email && email.includes('@')) {
                        addRecipient(recipientType, {
                          type: 'email',
                          value: email,
                          label: email,
                        });
                        setShowRecipientSelector(false);
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter to add
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Dialog>
  );
}
