import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Phone,
  User,
  Calendar,
  Clock,
  Mail,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

// Mock firm users
const MOCK_FIRM_USERS = [
  { id: '1', name: 'David Wilson', initials: 'DW', title: 'Tax Associate' },
  { id: '2', name: 'Emily Davis', initials: 'ED', title: 'Accountant' },
  { id: '3', name: 'Jessica Martinez', initials: 'JM', title: 'Senior Accountant' },
  { id: '4', name: 'Michael Chen', initials: 'MC', title: 'Partner' },
  { id: '5', name: 'Nicole Carter', initials: 'NC', title: 'Secretary' },
  { id: '6', name: 'Sarah Johnson', initials: 'SJ', title: 'Senior Tax Manager' },
].sort((a, b) => a.name.localeCompare(b.name));

// Mock clients
const MOCK_CLIENTS = [
  { id: '1', name: 'ABC Corporation', type: 'Business' },
  { id: '2', name: 'John Smith', type: 'Individual' },
  { id: '3', name: 'Mary Johnson', type: 'Individual' },
  { id: '4', name: 'Sarah Williams', type: 'Individual' },
  { id: '5', name: 'Tech Solutions Inc', type: 'Business' },
  { id: '6', name: 'Robert Brown', type: 'Individual' },
].sort((a, b) => a.name.localeCompare(b.name));

// Status options for callbacks
const CALLBACK_STATUSES = [
  'Open',
  'Called Back',
  'Completed',
  'Left Message',
  'Not Available',
  'Delayed',
  'Cancelled',
];

// Email templates
const EMAIL_TEMPLATES = [
  { id: '1', name: 'Callback Confirmation' },
  { id: '2', name: 'Follow-up Required' },
  { id: '3', name: 'Document Request' },
  { id: '4', name: 'Appointment Reminder' },
  { id: '5', name: 'General Follow-up' },
].sort((a, b) => a.name.localeCompare(b.name));

// Email trigger options
const EMAIL_TRIGGERS = [
  'Immediately',
  'End of Call',
  'End of Day',
  'Tomorrow',
  'In 2 Days',
  'In 3 Days',
  'In 1 Week',
];

type EmailTrigger = {
  id: string;
  template: string;
  trigger: string;
};

interface CallbackMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToEmailTemplates?: () => void;
}

export function CallbackMessageDialog({ open, onOpenChange, onNavigateToEmailTemplates }: CallbackMessageDialogProps) {
  // Form fields
  const [callback, setCallback] = useState('');
  const [assignee, setAssignee] = useState('');
  const [client, setClient] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');
  const [status, setStatus] = useState('Open');
  const [dueDate, setDueDate] = useState('');
  const [emailTriggers, setEmailTriggers] = useState<EmailTrigger[]>([]);
  
  // UI states
  const [showAddEmailTrigger, setShowAddEmailTrigger] = useState(false);
  const [newEmailTemplate, setNewEmailTemplate] = useState('');
  const [newEmailTrigger, setNewEmailTrigger] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackRef = useRef<HTMLInputElement>(null);

  // Load saved email triggers from localStorage on mount
  useEffect(() => {
    const savedTriggers = localStorage.getItem('callbackEmailTriggers');
    if (savedTriggers) {
      try {
        setEmailTriggers(JSON.parse(savedTriggers));
      } catch (error) {
        console.error('Failed to load saved email triggers:', error);
      }
    }
  }, []);

  // Save email triggers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('callbackEmailTriggers', JSON.stringify(emailTriggers));
  }, [emailTriggers]);

  // Reset form when dialog closes (but keep email triggers)
  useEffect(() => {
    if (!open) {
      setCallback('');
      setAssignee('');
      setClient('');
      setPhoneMessage('');
      setStatus('Open');
      setDueDate('');
      // DO NOT reset emailTriggers - they persist across sessions
      setShowAddEmailTrigger(false);
      setNewEmailTemplate('');
      setNewEmailTrigger('');
      setClientSearchQuery('');
      setErrors({});
    } else {
      // Auto-focus callback field when dialog opens
      setTimeout(() => callbackRef.current?.focus(), 100);
    }
  }, [open]);

  // Filtered clients based on search
  const filteredClients = MOCK_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleAddEmailTrigger = () => {
    if (!newEmailTemplate) {
      toast.error('Please select an email template');
      return;
    }
    if (!newEmailTrigger) {
      toast.error('Please select a trigger');
      return;
    }

    const emailTrigger: EmailTrigger = {
      id: Date.now().toString(),
      template: newEmailTemplate,
      trigger: newEmailTrigger,
    };

    setEmailTriggers([...emailTriggers, emailTrigger]);
    setNewEmailTemplate('');
    setNewEmailTrigger('');
    setShowAddEmailTrigger(false);
    toast.success('Email trigger added');
  };

  const handleRemoveEmailTrigger = (id: string) => {
    setEmailTriggers(emailTriggers.filter(et => et.id !== id));
    toast.success('Email trigger removed');
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!callback.trim()) {
      newErrors.callback = 'Callback field is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in required fields');
      return;
    }

    // Get assignee name for confirmation message
    const assigneeName = MOCK_FIRM_USERS.find(u => u.id === assignee)?.name || 'task queue';

    // Save callback and close
    toast.success(
      `Callback added to ${assigneeName}`,
      {
        description: callback,
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      }
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        aria-describedby="callback-message-description"
        onPointerDownOutside={(e) => {
          // Prevent closing on single click outside
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          // Allow double-click to close
          if (target.dataset.doubleClick === 'close') {
            onOpenChange(false);
          } else {
            // Mark for potential double-click
            target.dataset.doubleClick = 'close';
            setTimeout(() => {
              delete target.dataset.doubleClick;
            }, 300);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Phone className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
            Callback Message
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400" id="callback-message-description">
            Add a callback message to follow up with a client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Callback Field (Required) */}
          <div className="space-y-2">
            <Label htmlFor="callback" className="text-base flex items-center gap-2">
              Callback
              <span className="text-red-500">*</span>
              {!callback && (
                <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                  Required
                </Badge>
              )}
            </Label>
            <Input
              ref={callbackRef}
              id="callback"
              value={callback}
              onChange={(e) => {
                setCallback(e.target.value);
                if (errors.callback) {
                  setErrors(prev => ({ ...prev, callback: '' }));
                }
              }}
              placeholder="Enter callback subject..."
              className={cn(
                errors.callback && 'border-red-500 focus:ring-red-500'
              )}
            />
            {errors.callback && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                {errors.callback}
              </div>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Assign To
            </Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_FIRM_USERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.title}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Client Name
            </Label>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search clients..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {client.type === 'Business' ? 'B' : 'I'}
                      </Badge>
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Message */}
          <div className="space-y-2">
            <Label htmlFor="phoneMessage" className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Message
            </Label>
            <Textarea
              id="phoneMessage"
              value={phoneMessage}
              onChange={(e) => setPhoneMessage(e.target.value)}
              placeholder="Enter the phone message details..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-base">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALLBACK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Email Triggers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Triggers
              </Label>
              {!showAddEmailTrigger && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddEmailTrigger(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Email Trigger
                </Button>
              )}
            </div>

            {/* Empty State */}
            {emailTriggers.length === 0 && !showAddEmailTrigger && (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">No email triggers configured</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Create email templates to send automated notifications</p>
                </div>
                {onNavigateToEmailTemplates && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onNavigateToEmailTemplates();
                      onOpenChange(false);
                    }}
                    className="gap-2"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Settings className="w-4 h-4" />
                    Create Email Template
                  </Button>
                )}
              </div>
            )}

            {/* Existing Email Triggers */}
            {emailTriggers.length > 0 && (
              <div className="space-y-2">
                {emailTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {trigger.template}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Trigger: {trigger.trigger}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEmailTriggers(emailTriggers.filter((t) => t.id !== trigger.id));
                      }}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Email Trigger Form */}
            {showAddEmailTrigger && (
              <Card className="p-4 border-2" style={{ borderColor: 'var(--primaryColor)', opacity: 0.6 }}>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="emailTemplate" className="text-sm">
                      Email Template
                    </Label>
                    <Select value={newEmailTemplate} onValueChange={setNewEmailTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailTrigger" className="text-sm">
                      Trigger
                    </Label>
                    <Select value={newEmailTrigger} onValueChange={setNewEmailTrigger}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TRIGGERS.map((trigger) => (
                          <SelectItem key={trigger} value={trigger}>
                            {trigger}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleAddEmailTrigger}
                      className="gap-2"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Trigger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddEmailTrigger(false);
                        setNewEmailTemplate('');
                        setNewEmailTrigger('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2"
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Callback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}