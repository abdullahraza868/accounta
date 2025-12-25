import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { PhoneInput } from './ui/phone-input';
import { User, Building2, Zap, Mail, Phone, Tag, Send, Link as LinkIcon, Check } from 'lucide-react';
import { cn } from './ui/utils';
import type { ClientGroup } from './ClientGroupsDialog';
import { toast } from 'sonner@2.0.3';

type ClientType = 'individual' | 'business';

type AddQuickClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientGroups: ClientGroup[];
};

export function AddQuickClientDialog({ open, onOpenChange, clientGroups }: AddQuickClientDialogProps) {
  const navigate = useNavigate();
  
  // Form state
  const [clientType, setClientType] = useState<ClientType>('individual');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('lead');
  const [sendCredentials, setSendCredentials] = useState(true);
  const [useFakeDomain, setUseFakeDomain] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setClientType('individual');
    setBusinessName('');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSelectedGroup('lead');
    setSendCredentials(true);
    setUseFakeDomain(false);
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Client type specific validation
    if (clientType === 'business' && !businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    // Name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation (always required unless using fake domain)
    if (!useFakeDomain) {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Construct client data - use the current email value (which will be the fake domain if toggled)
      const finalEmail = useFakeDomain ? email : email;
      
      const clientData = {
        clientType,
        businessName: clientType === 'business' ? businessName : undefined,
        firstName,
        middleName: middleName || undefined,
        lastName,
        email: finalEmail,
        phone: phone || undefined,
        clientGroup: selectedGroup,
        sendCredentials,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating quick client:', clientData);

      // Success actions
      const clientName = clientType === 'business' 
        ? businessName 
        : `${firstName} ${lastName}`;

      if (sendCredentials) {
        toast.success('Client Created & Credentials Sent', {
          description: `${clientName} has been added and welcome email sent to ${finalEmail}`,
          icon: <Check className="w-4 h-4" />,
        });
      } else {
        toast.success('Client Created Successfully', {
          description: `${clientName} has been added to your client list`,
          icon: <Check className="w-4 h-4" />,
        });
      }

      // Close dialog and reset
      onOpenChange(false);
      resetForm();

      // Navigate to new client folder
      // In real app, use the actual client ID returned from API
      const mockClientId = `client-${Date.now()}`;
      setTimeout(() => {
        navigate(`/clients/${mockClientId}`);
      }, 300);

    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to Create Client', {
        description: 'Please try again or contact support if the problem persists',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Auto-fill fake domain email when checkbox is toggled
  const handleFakeDomainToggle = (checked: boolean) => {
    setUseFakeDomain(checked);
    if (checked) {
      // Generate a unique ID using timestamp
      const uniqueId = Date.now();
      setEmail(`${uniqueId}@afakedomain.net`);
    } else {
      setEmail('');
    }
  };

  // Sort client groups alphabetically
  const sortedGroups = [...clientGroups].sort((a, b) => a.name.localeCompare(b.name));

  // Check if "Lead" group exists, if not we'll need to add it
  const hasLeadGroup = clientGroups.some(g => g.id === 'lead');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="add-quick-client-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Quick Add Client
          </DialogTitle>
          <DialogDescription id="add-quick-client-description">
            Quickly create a new client and optionally send them login credentials
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Type Selection */}
          <div>
            <Label className="mb-3 block">Client Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClientType('individual')}
                className={cn(
                  'p-4 border-2 rounded-lg transition-all text-left',
                  'hover:border-gray-300 dark:hover:border-gray-600',
                  clientType === 'individual'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    clientType === 'individual'
                      ? 'bg-purple-100 dark:bg-purple-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}>
                    <User className={cn(
                      'w-5 h-5',
                      clientType === 'individual'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      'font-medium mb-1',
                      clientType === 'individual'
                        ? 'text-purple-900 dark:text-purple-100'
                        : 'text-gray-900 dark:text-gray-100'
                    )}>
                      Individual
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Individual client
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setClientType('business')}
                className={cn(
                  'p-4 border-2 rounded-lg transition-all text-left',
                  'hover:border-gray-300 dark:hover:border-gray-600',
                  clientType === 'business'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    clientType === 'business'
                      ? 'bg-purple-100 dark:bg-purple-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}>
                    <Building2 className={cn(
                      'w-5 h-5',
                      clientType === 'business'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      'font-medium mb-1',
                      clientType === 'business'
                        ? 'text-purple-900 dark:text-purple-100'
                        : 'text-gray-900 dark:text-gray-100'
                    )}>
                      Business
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Business entity
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Business Name (only for business clients) */}
          {clientType === 'business' && (
            <div>
              <Label htmlFor="business-name">
                Business Name *
              </Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) {
                      setErrors({ ...errors, businessName: '' });
                    }
                  }}
                  placeholder="Enter business name"
                  className={cn('pl-10', errors.businessName && 'border-red-500')}
                />
              </div>
              {errors.businessName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.businessName}</p>
              )}
            </div>
          )}

          {/* Contact Person Name */}
          <div>
            <Label className="mb-3 block">
              {clientType === 'business' ? 'Primary Contact *' : 'Name *'}
            </Label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <Label htmlFor="first-name" className="text-xs text-gray-500 dark:text-gray-400">
                  First Name *
                </Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) {
                      setErrors({ ...errors, firstName: '' });
                    }
                  }}
                  placeholder="First"
                  className={cn('mt-1', errors.firstName && 'border-red-500')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div className="col-span-3">
                <Label htmlFor="middle-name" className="text-xs text-gray-500 dark:text-gray-400">
                  Middle
                </Label>
                <Input
                  id="middle-name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="M.I."
                  className="mt-1"
                />
              </div>
              <div className="col-span-5">
                <Label htmlFor="last-name" className="text-xs text-gray-500 dark:text-gray-400">
                  Last Name *
                </Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) {
                      setErrors({ ...errors, lastName: '' });
                    }
                  }}
                  placeholder="Last"
                  className={cn('mt-1', errors.lastName && 'border-red-500')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="email">
                Email Address {!useFakeDomain && '*'}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="fake-domain"
                  checked={useFakeDomain}
                  onCheckedChange={handleFakeDomainToggle}
                />
                <Label htmlFor="fake-domain" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  Use fake email
                </Label>
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                placeholder={useFakeDomain ? 'Auto-generated unique ID' : 'client@example.com'}
                className={cn('pl-10', errors.email && 'border-red-500')}
                disabled={useFakeDomain}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
            )}
            {useFakeDomain && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using fake domain prevents emails from being sent to random addresses
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <PhoneInput
                id="phone"
                value={phone}
                onChange={setPhone}
                placeholder="+1 (555) 000-0000"
                className="pl-10"
              />
            </div>
          </div>

          {/* Client Group */}
          <div>
            <Label htmlFor="client-group">Client Group</Label>
            <div className="relative mt-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="client-group" className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {!hasLeadGroup && (
                    <SelectItem value="lead">Lead (Default)</SelectItem>
                  )}
                  {sortedGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose a client group above if not a lead
            </p>
          </div>

          {/* Send Credentials */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Switch
                id="send-credentials"
                checked={sendCredentials}
                onCheckedChange={setSendCredentials}
                disabled={useFakeDomain}
              />
              <div className="flex-1">
                <Label htmlFor="send-credentials" className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer">
                  Send welcome email with login instructions
                </Label>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Client will receive an email with your firm's portal domain and instructions to login via magic link, Google, or Microsoft
                </p>
                {useFakeDomain && (
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                    Disabled because fake domain is being used
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Client
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}