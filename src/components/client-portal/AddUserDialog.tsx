import { useState } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar as CalendarIcon,
  FolderTree,
  Key,
  Send,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { PhoneInput } from '../ui/phone-input';

type AddUserDialogProps = {
  clientType: 'Individual' | 'Business';
  roleTypes: string[];
  onClose: () => void;
  onSave: (userData: any) => void;
};

// Available client portal pages
const PORTAL_PAGES = [
  'Dashboard',
  'Profile',
  'Documents',
  'Signatures',
  'Invoices',
  'Account Access',
];

// Role-based page access presets
const ROLE_PAGE_PRESETS: Record<string, string[]> = {
  'Employee': ['Profile', 'Documents', 'Signatures'],
  'Accountant': ['Dashboard', 'Profile', 'Documents', 'Signatures'],
  'Bookkeeper': ['Documents', 'Invoices'],
  'Advisor / Consultant': ['Documents'],
};

// Mock folder structure for permissions
const FOLDER_STRUCTURE = [
  {
    id: 'tax',
    name: 'Tax Documents',
    path: '/Tax Documents',
    children: [
      { id: 'tax-2024', name: '2024', path: '/Tax Documents/2024' },
      { id: 'tax-2023', name: '2023', path: '/Tax Documents/2023' },
      { id: 'tax-archive', name: 'Archive', path: '/Tax Documents/Archive' },
    ],
  },
  {
    id: 'financial',
    name: 'Financial Statements',
    path: '/Financial Statements',
    children: [
      { id: 'financial-quarterly', name: 'Quarterly', path: '/Financial Statements/Quarterly' },
      { id: 'financial-annual', name: 'Annual', path: '/Financial Statements/Annual' },
    ],
  },
  {
    id: 'contracts',
    name: 'Contracts',
    path: '/Contracts',
    children: [],
  },
  {
    id: 'payroll',
    name: 'Payroll',
    path: '/Payroll',
    children: [],
  },
  {
    id: 'invoices',
    name: 'Invoices',
    path: '/Invoices',
    children: [
      { id: 'invoices-sent', name: 'Sent', path: '/Invoices/Sent' },
      { id: 'invoices-received', name: 'Received', path: '/Invoices/Received' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal Documents',
    path: '/Legal Documents',
    children: [],
  },
];

// Access duration presets
const ACCESS_DURATION_PRESETS = [
  { label: '1 Day', value: 1 },
  { label: '1 Week', value: 7 },
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
  { label: 'Custom Date', value: 'custom' },
  { label: 'Unlimited', value: null },
];

export function AddUserDialog({ clientType, roleTypes, onClose, onSave }: AddUserDialogProps) {
  const { branding } = useBranding();
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['tax', 'financial']);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    customRole: '',
    accessExpires: null as string | null,
    status: 'Active' as 'Active' | 'Suspended',
    hasPortalAccess: true,
    force2FA: false,
    sendLoginCredentials: true,
    permissions: {
      pages: ['Dashboard'] as string[],
      folders: [] as string[],
    },
  });

  const [accessDurationPreset, setAccessDurationPreset] = useState<number | null | 'custom'>(null);
  const [customDate, setCustomDate] = useState<Date>();

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRoleChange = (role: string) => {
    // Update role
    handleInputChange('role', role);
    
    // Apply role-based page preset if available
    if (ROLE_PAGE_PRESETS[role]) {
      handleInputChange('permissions', {
        ...formData.permissions,
        pages: ROLE_PAGE_PRESETS[role],
      });
    }
  };

  const handleAccessDurationChange = (value: number | null | 'custom') => {
    setAccessDurationPreset(value);
    if (value === 'custom') {
      // Will use date picker
      return;
    }
    if (value === null) {
      handleInputChange('accessExpires', null);
    } else {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + value);
      handleInputChange('accessExpires', expiryDate.toISOString().split('T')[0]);
    }
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    setCustomDate(date);
    if (date) {
      handleInputChange('accessExpires', format(date, 'yyyy-MM-dd'));
    }
  };

  const togglePagePermission = (page: string) => {
    const currentPages = formData.permissions.pages;
    const newPages = currentPages.includes(page)
      ? currentPages.filter((p) => p !== page)
      : [...currentPages, page];
    handleInputChange('permissions', { ...formData.permissions, pages: newPages });
  };

  const toggleFolderPermission = (folderPath: string) => {
    const currentFolders = formData.permissions.folders;
    const newFolders = currentFolders.includes(folderPath)
      ? currentFolders.filter((f) => f !== folderPath)
      : [...currentFolders, folderPath];
    handleInputChange('permissions', { ...formData.permissions, folders: newFolders });
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const handleSelectAllPages = () => {
    if (formData.permissions.pages.length === PORTAL_PAGES.length) {
      handleInputChange('permissions', { ...formData.permissions, pages: [] });
    } else {
      handleInputChange('permissions', { ...formData.permissions, pages: [...PORTAL_PAGES] });
    }
  };

  const handleSelectAllFolders = () => {
    const allFolderPaths: string[] = [];
    FOLDER_STRUCTURE.forEach((folder) => {
      allFolderPaths.push(folder.path);
      folder.children.forEach((child) => allFolderPaths.push(child.path));
    });

    if (formData.permissions.folders.length === allFolderPaths.length) {
      handleInputChange('permissions', { ...formData.permissions, folders: [] });
    } else {
      handleInputChange('permissions', { ...formData.permissions, folders: allFolderPaths });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // At least one page permission
    if (formData.hasPortalAccess && formData.permissions.pages.length === 0) {
      toast.error('Please select at least one page permission');
      return;
    }

    onSave(formData);
  };

  const renderFolderTree = () => {
    return (
      <div className="space-y-1">
        {FOLDER_STRUCTURE.map((folder) => {
          const isExpanded = expandedFolders.includes(folder.id);
          const hasChildren = folder.children.length > 0;
          const isChecked = formData.permissions.folders.includes(folder.path);

          return (
            <div key={folder.id}>
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                {hasChildren && (
                  <button
                    onClick={() => toggleFolderExpanded(folder.id)}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
                    ) : (
                      <ChevronRight className="w-4 h-4" style={{ color: branding.colors.mutedText }} />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-5" />}
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleFolderPermission(folder.path)}
                />
                <FolderTree className="w-4 h-4" style={{ color: branding.colors.primaryButton }} />
                <span className="text-sm flex-1" style={{ color: branding.colors.bodyText }}>
                  {folder.name}
                </span>
              </div>

              {/* Children */}
              {isExpanded && hasChildren && (
                <div className="ml-9 mt-1 space-y-1">
                  {folder.children.map((child) => {
                    const isChildChecked = formData.permissions.folders.includes(child.path);
                    return (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          checked={isChildChecked}
                          onCheckedChange={() => toggleFolderPermission(child.path)}
                        />
                        <FolderTree
                          className="w-4 h-4"
                          style={{ color: branding.colors.mutedText }}
                        />
                        <span className="text-sm" style={{ color: branding.colors.bodyText }}>
                          {child.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          background: branding.colors.cardBackground,
          borderColor: branding.colors.borderColor,
        }}
        aria-describedby="add-user-description"
      >
        <DialogHeader
          style={{
            borderColor: branding.colors.borderColor,
          }}
        >
          <DialogTitle style={{ color: branding.colors.headingText }}>
            Add Client Portal User
          </DialogTitle>
          <DialogDescription
            style={{ color: branding.colors.mutedText }}
            id="add-user-description"
          >
            Enter user information, configure permissions, and set access levels
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="access">Access & Security</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pr-4">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" style={{ color: branding.colors.bodyText }}>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: branding.colors.mutedText }}
                    />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      placeholder="Enter full name"
                      style={{
                        background: branding.colors.inputBackground,
                        borderColor: branding.colors.inputBorder,
                        color: branding.colors.inputText,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" style={{ color: branding.colors.bodyText }}>
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: branding.colors.mutedText }}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="email@example.com"
                      style={{
                        background: branding.colors.inputBackground,
                        borderColor: branding.colors.inputBorder,
                        color: branding.colors.inputText,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" style={{ color: branding.colors.bodyText }}>
                    Phone Number
                  </Label>
                  <div className="mt-2">
                    <PhoneInput
                      defaultCountry="US"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      className="phone-input-custom"
                      placeholder="Enter phone number"
                      style={{
                        '--PhoneInputCountryFlag-borderColor': branding.colors.inputBorder,
                      } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" style={{ color: branding.colors.bodyText }}>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger
                      className="mt-2"
                      style={{
                        background: branding.colors.inputBackground,
                        borderColor: branding.colors.inputBorder,
                        color: branding.colors.inputText,
                      }}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleTypes.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'Other' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="customRole" style={{ color: branding.colors.bodyText }}>
                      Custom Role Title
                    </Label>
                    <Input
                      id="customRole"
                      value={formData.customRole}
                      onChange={(e) => handleInputChange('customRole', e.target.value)}
                      className="mt-2"
                      placeholder="Enter custom role"
                      style={{
                        background: branding.colors.inputBackground,
                        borderColor: branding.colors.inputBorder,
                        color: branding.colors.inputText,
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6 mt-4">
              {/* Portal Access Toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{
                  background: branding.colors.cardBackground,
                  borderColor: branding.colors.borderColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                      Grant Portal Access
                    </div>
                    <div className="text-xs" style={{ color: branding.colors.mutedText }}>
                      Allow this user to login to the client portal
                    </div>
                  </div>
                </div>
                <Switch
                  checked={formData.hasPortalAccess}
                  onCheckedChange={(val) => handleInputChange('hasPortalAccess', val)}
                />
              </div>

              {formData.hasPortalAccess && (
                <>
                  {/* Page Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label style={{ color: branding.colors.headingText }}>
                        Page Access Permissions
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllPages}
                        className="h-7 text-xs"
                      >
                        {formData.permissions.pages.length === PORTAL_PAGES.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>
                    <div
                      className="grid grid-cols-2 gap-3 p-4 rounded-lg border"
                      style={{
                        background: branding.colors.cardBackground,
                        borderColor: branding.colors.borderColor,
                      }}
                    >
                      {PORTAL_PAGES.map((page) => (
                        <div key={page} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.permissions.pages.includes(page)}
                            onCheckedChange={() => togglePagePermission(page)}
                          />
                          <span className="text-sm" style={{ color: branding.colors.bodyText }}>
                            {page}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Folder Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label style={{ color: branding.colors.headingText }}>
                        Folder Access Permissions
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllFolders}
                        className="h-7 text-xs"
                      >
                        {formData.permissions.folders.length > 0 ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        background: branding.colors.cardBackground,
                        borderColor: branding.colors.borderColor,
                      }}
                    >
                      {renderFolderTree()}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Access & Security Tab */}
            <TabsContent value="access" className="space-y-6 mt-4">
              {/* Access Duration */}
              <div>
                <Label style={{ color: branding.colors.bodyText }}>Access Duration</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {ACCESS_DURATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={accessDurationPreset === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAccessDurationChange(preset.value)}
                      style={
                        accessDurationPreset === preset.value
                          ? {
                              background: branding.colors.primaryButton,
                              color: branding.colors.primaryButtonText,
                            }
                          : {}
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {/* Custom Date Picker */}
                {accessDurationPreset === 'custom' && (
                  <div className="mt-4">
                    <Label style={{ color: branding.colors.bodyText }}>Select Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-2',
                            !customDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDate ? format(customDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={handleCustomDateSelect}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    background: branding.colors.cardBackground,
                    borderColor: branding.colors.borderColor,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                        Require Two-Factor Authentication
                      </div>
                      <div className="text-xs" style={{ color: branding.colors.mutedText }}>
                        Force user to set up 2FA on first login
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.force2FA}
                    onCheckedChange={(val) => handleInputChange('force2FA', val)}
                  />
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    background: branding.colors.cardBackground,
                    borderColor: branding.colors.borderColor,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                        Send Login Credentials
                      </div>
                      <div className="text-xs" style={{ color: branding.colors.mutedText }}>
                        Email login instructions to the user
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.sendLoginCredentials}
                    onCheckedChange={(val) => handleInputChange('sendLoginCredentials', val)}
                  />
                </div>
              </div>

              {/* Summary */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  background: `${branding.colors.primaryButton}10`,
                  borderColor: `${branding.colors.primaryButton}30`,
                }}
              >
                <div className="text-sm font-medium mb-3" style={{ color: branding.colors.headingText }}>
                  Roles & Permissions Summary
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left side - Access details */}
                  <div>
                    <ul className="text-sm space-y-1" style={{ color: branding.colors.bodyText }}>
                      <li>• Portal Access: {formData.hasPortalAccess ? 'Enabled' : 'Disabled'}</li>
                      <li>
                        • Access Expires:{' '}
                        {formData.accessExpires || 'Unlimited'}
                      </li>
                      <li>• 2FA Required: {formData.force2FA ? 'Yes' : 'No'}</li>
                      <li>• Page Permissions: {formData.permissions.pages.length} pages</li>
                      <li>• Folder Permissions: {formData.permissions.folders.length} folders</li>
                    </ul>
                  </div>
                  
                  {/* Right side - Portal pages list */}
                  <div>
                    <div className="text-xs font-medium mb-2" style={{ color: branding.colors.headingText }}>
                      Portal Pages Access:
                    </div>
                    <ul className="text-xs space-y-1" style={{ color: branding.colors.bodyText }}>
                      {PORTAL_PAGES.map((page) => {
                        const hasAccess = formData.permissions.pages.includes(page);
                        return (
                          <li key={page} className="flex items-center gap-1.5">
                            <span className={hasAccess ? 'text-green-600' : 'text-gray-400'}>
                              {hasAccess ? '✓' : '✗'}
                            </span>
                            <span className={hasAccess ? '' : 'opacity-50'}>
                              {page}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: branding.colors.borderColor }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === 'permissions') setActiveTab('basic');
                  if (activeTab === 'access') setActiveTab('permissions');
                }}
              >
                Back
              </Button>
            )}
            {activeTab !== 'access' ? (
              <Button
                onClick={() => {
                  if (activeTab === 'basic') setActiveTab('permissions');
                  if (activeTab === 'permissions') setActiveTab('access');
                }}
                style={{
                  background: branding.colors.primaryButton,
                  color: branding.colors.primaryButtonText,
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                style={{
                  background: branding.colors.primaryButton,
                  color: branding.colors.primaryButtonText,
                }}
              >
                Add User
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}