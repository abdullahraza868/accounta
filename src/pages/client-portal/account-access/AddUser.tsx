import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAppSettings } from '../../../contexts/AppSettingsContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Separator } from '../../../components/ui/separator';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Key,
  Check,
  ChevronRight,
  AlertCircle,
  Crown,
  Settings,
  Eye,
  Folder,
  FolderTree,
  Lock,
  Scale,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { validateEmail, validatePhone, validateRequired, validateDate } from '../../../lib/fieldValidation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';

type Step = 1 | 2 | 3 | 4 | 5;

// Role options based on client type (Business client example)
const roleOptions = [
  { 
    value: 'partner', 
    label: 'Partner', 
    description: 'Full access to business documents and settings',
    icon: Crown,
    color: '#f59e0b' // amber
  },
  { 
    value: 'manager', 
    label: 'Manager', 
    description: 'Manage content and team access',
    icon: Settings,
    color: '#3b82f6' // blue
  },
  { 
    value: 'employee', 
    label: 'Employee', 
    description: 'Standard access to assigned content',
    icon: User,
    color: '#8b5cf6' // purple
  },
  { 
    value: 'accountant', 
    label: 'Accountant', 
    description: 'Access to financial documents and tax records',
    icon: Shield,
    color: '#10b981' // green
  },
  { 
    value: 'bookkeeper', 
    label: 'Bookkeeper', 
    description: 'Access to invoices and financial records',
    icon: UserCheck,
    color: '#6366f1' // indigo
  },
  { 
    value: 'advisor', 
    label: 'Advisor / Consultant', 
    description: 'Advisory and consulting services',
    icon: Briefcase,
    color: '#8b5cf6' // purple
  },
  { 
    value: 'poa', 
    label: 'Power of Attorney', 
    description: 'Legal authority to act on behalf of client',
    icon: Scale,
    color: '#dc2626' // red
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Custom role with specific permissions',
    icon: User,
    color: '#6b7280' // gray
  },
];

const navigationPages = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'upload', label: 'Upload', icon: '📤' },
  { id: 'signatures', label: 'Signatures', icon: '✍️' },
  { id: 'invoices', label: 'Invoices', icon: '🧾' },
  { id: 'account-access', label: 'Account Access', icon: '🔑' },
];

// Role-based permission presets
const rolePermissionPresets: Record<string, string[]> = {
  'partner': ['dashboard', 'profile', 'documents', 'upload', 'signatures', 'invoices', 'account-access'],
  'manager': ['dashboard', 'profile', 'documents', 'upload', 'signatures', 'invoices', 'account-access'],
  'employee': ['dashboard', 'profile', 'documents', 'upload', 'signatures', 'invoices'],
  'accountant': ['dashboard', 'profile', 'documents', 'upload', 'signatures', 'invoices'],
  'bookkeeper': ['dashboard', 'profile', 'documents', 'upload', 'invoices'], // upload, view documents, invoices
  'advisor': ['dashboard', 'profile', 'documents', 'upload'], // upload
  'poa': ['dashboard', 'profile', 'documents', 'upload', 'signatures', 'invoices', 'account-access'], // everything
  'other': ['dashboard', 'profile', 'documents'],
};

// Roles available for business vs individual accounts
const businessRoles = ['partner', 'manager', 'employee', 'accountant', 'bookkeeper', 'advisor', 'poa', 'other'];
const individualRoles = ['accountant', 'bookkeeper', 'advisor', 'poa', 'other']; // Removed: partner, manager, employee

const accessPresets = [
  { value: '30', label: '30 Days', description: 'Expires in one month' },
  { value: '60', label: '60 Days', description: 'Expires in two months' },
  { value: '90', label: '90 Days', description: 'Expires in three months' },
  { value: '180', label: '6 Months', description: 'Expires in six months' },
  { value: '365', label: '1 Year', description: 'Expires in one year' },
  { value: 'custom', label: 'Custom Date', description: 'Choose a specific date' },
];

// Mock folder structure
const folderStructure = [
  {
    id: 'tax-returns',
    name: 'Tax Returns',
    children: [
      { id: 'tax-2024', name: '2024' },
      { id: 'tax-2023', name: '2023' },
      { id: 'tax-2022', name: '2022' },
    ],
  },
  {
    id: 'financial-statements',
    name: 'Financial Statements',
    children: [
      { id: 'fs-q4-2024', name: 'Q4 2024' },
      { id: 'fs-q3-2024', name: 'Q3 2024' },
    ],
  },
  {
    id: 'contracts',
    name: 'Contracts',
    children: [],
  },
  {
    id: 'invoices-folder',
    name: 'Invoices',
    children: [],
  },
];

export default function AddUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('edit');
  const isEditMode = !!userId;
  
  const { branding } = useBranding();
  const { settings, formatDate } = useAppSettings();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set([1, 2, 3, 4])); // In edit mode, all steps are visited
  
  // Mock client type - in real app would come from context/props/API
  const [clientType] = useState<'Business' | 'Individual'>('Business'); // Change to 'Individual' for testing
  
  // Step 1: Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  
  // Step 2: Role & Permissions
  const [selectedRole, setSelectedRole] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customRoleTitleError, setCustomRoleTitleError] = useState('');
  const [force2FA, setForce2FA] = useState(true); // Default to true
  const [navigationPermissions, setNavigationPermissions] = useState<string[]>([
    'dashboard',
    'profile',
    'documents',
  ]);
  
  // Step 3: File Manager & Folder Access
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['tax-returns', 'financial-statements']);
  const [selectedFolders, setSelectedFolders] = useState<string[]>(['tax-returns', 'tax-2024']);
  
  // Step 4: Access Duration
  const [accessType, setAccessType] = useState<'unlimited' | 'limited'>('limited'); // Default to limited
  const [accessPreset, setAccessPreset] = useState('30'); // Default to 30 days
  const [accessDate, setAccessDate] = useState('');
  const [accessDateError, setAccessDateError] = useState('');
  
  // Step 5: Portal Access
  const [hasPortalAccess, setHasPortalAccess] = useState(true);
  const [sendCredentials, setSendCredentials] = useState(true);
  
  // Admin access confirmation dialog
  const [showAdminAccessDialog, setShowAdminAccessDialog] = useState(false);
  const [pendingAdminAccess, setPendingAdminAccess] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Role & Permissions', icon: Shield },
    { number: 3, title: 'Folder Access', icon: FolderTree },
    { number: 4, title: 'Access Duration', icon: Calendar },
    { number: 5, title: 'Review & Finalize', icon: Key },
  ];

  // Get filtered role options based on client type
  const getAvailableRoles = () => {
    const availableRoleIds = clientType === 'Business' ? businessRoles : individualRoles;
    return roleOptions.filter(role => availableRoleIds.includes(role.value));
  };

  // Apply role-based permission preset when role changes
  const handleRoleChange = (roleValue: string) => {
    setSelectedRole(roleValue);
    
    // Apply permission preset if available
    if (rolePermissionPresets[roleValue]) {
      setNavigationPermissions(rolePermissionPresets[roleValue]);
    }
    
    // Clear custom role title when switching away from 'other'
    if (roleValue !== 'other') {
      setCustomRoleTitle('');
      setCustomRoleTitleError('');
    }
  };

  const toggleNavigationPermission = (pageId: string) => {
    // Special handling for account-access (admin permission)
    if (pageId === 'account-access') {
      if (navigationPermissions.includes(pageId)) {
        // Remove admin access
        setNavigationPermissions((prev) => prev.filter((id) => id !== pageId));
      } else {
        // Show confirmation dialog before granting admin access
        setShowAdminAccessDialog(true);
        setPendingAdminAccess(true);
      }
      return;
    }
    
    // Normal permission toggle
    setNavigationPermissions((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };
  
  const confirmAdminAccess = () => {
    setNavigationPermissions((prev) => [...prev, 'account-access']);
    setShowAdminAccessDialog(false);
    setPendingAdminAccess(false);
  };
  
  const cancelAdminAccess = () => {
    setShowAdminAccessDialog(false);
    setPendingAdminAccess(false);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const toggleFolderAccess = (folderId: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  // Validation handlers
  const handleEmailChange = (value: string) => {
    setEmail(value);
    const result = validateEmail(value, true);
    setEmailError(result.error || '');
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const result = validatePhone(value, false);
    setPhoneError(result.error || '');
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    const result = validateRequired(value, 'First name');
    setFirstNameError(result.error || '');
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    const result = validateRequired(value, 'Last name');
    setLastNameError(result.error || '');
  };

  const handleAccessDateChange = (value: string) => {
    setAccessDate(value);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = validateDate(value, accessType === 'limited' && accessPreset === 'custom', tomorrow);
    setAccessDateError(result.error || '');
  };

  const handleCustomRoleTitleChange = (value: string) => {
    setCustomRoleTitle(value);
    const result = validateRequired(value, 'Custom role title');
    setCustomRoleTitleError(result.error || '');
  };

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && userId) {
      // Mock user data - in real app would fetch from API
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@acmecorp.com',
          phone: '+15551234567',
          role: 'partner',
          customRoleTitle: '',
          force2FA: true,
          navigationPermissions: ['dashboard', 'profile', 'documents', 'signatures', 'invoices'],
          selectedFolders: ['/Tax Documents', '/Financial Statements', '/Contracts'],
          accessType: 'unlimited',
          accessDate: null,
          accessPreset: 'unlimited',
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@acmecorp.com',
          phone: '+15552345678',
          role: 'accountant',
          customRoleTitle: '',
          force2FA: true,
          navigationPermissions: ['dashboard', 'documents', 'invoices'],
          selectedFolders: ['/Tax Documents', '/Financial Statements'],
          accessType: 'limited',
          accessDate: '2025-12-31',
          accessPreset: 'custom',
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@acmecorp.com',
          phone: '+15553456789',
          role: 'manager',
          customRoleTitle: '',
          force2FA: false,
          navigationPermissions: ['dashboard', 'documents'],
          selectedFolders: ['/Tax Documents'],
          accessType: 'limited',
          accessDate: '2025-06-30',
          accessPreset: 'custom',
        },
        {
          id: '4',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.d@acmecorp.com',
          phone: '+15554567890',
          role: 'employee',
          customRoleTitle: '',
          force2FA: false,
          navigationPermissions: ['dashboard'],
          selectedFolders: [],
          accessType: 'limited',
          accessDate: '2025-03-31',
          accessPreset: 'custom',
        },
      ];

      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone);
        setSelectedRole(user.role);
        setCustomRoleTitle(user.customRoleTitle);
        setForce2FA(user.force2FA);
        setNavigationPermissions(user.navigationPermissions);
        setSelectedFolders(user.selectedFolders);
        setAccessType(user.accessType as 'unlimited' | 'limited');
        if (user.accessDate) {
          setAccessDate(user.accessDate);
        }
        setAccessPreset(user.accessPreset);
      }
    }
  }, [isEditMode, userId]);
  
  // Initialize with 30 days default
  useEffect(() => {
    if (!isEditMode && accessType === 'limited' && accessPreset === '30' && !accessDate) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setAccessDate(futureDate.toISOString().split('T')[0]);
    }
  }, [isEditMode]);

  const handleAccessPresetChange = (preset: string) => {
    setAccessPreset(preset);
    if (preset !== 'custom') {
      // Calculate date based on preset
      const days = parseInt(preset);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      setAccessDate(futureDate.toISOString().split('T')[0]);
      setAccessDateError('');
    } else {
      setAccessDate('');
    }
  };

  const isStepValid = (step: Step): boolean => {
    switch (step) {
      case 1:
        return (
          firstName.trim() !== '' &&
          lastName.trim() !== '' &&
          email.trim() !== '' &&
          !emailError &&
          !phoneError &&
          !firstNameError &&
          !lastNameError
        );
      case 2:
        return selectedRole !== '' && (selectedRole !== 'other' || (customRoleTitle.trim() !== '' && !customRoleTitleError));
      case 3:
        return true; // Folder access is optional
      case 4:
        return accessType === 'unlimited' || (accessType === 'limited' && ((accessPreset !== 'custom') || (accessDate !== '' && !accessDateError)));
      case 5:
        return true; // Always valid
      default:
        return false;
    }
  };

  const handleNext = () => {
    const maxStep = isEditMode ? 4 : 5;
    if (currentStep < maxStep) {
      const nextStep = (currentStep + 1) as Step;
      setCurrentStep(nextStep);
      setVisitedSteps((prev) => new Set(prev).add(nextStep));
    }
  };

  const handleStepClick = (step: Step) => {
    // Only allow clicking on visited steps
    if (visitedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    // Simulate user creation/update
    if (isEditMode) {
      toast.success('User updated successfully!');
    } else {
      toast.success('User added successfully!');
    }
    navigate('/client-portal/account-access');
  };

  const getAccessDurationDisplay = () => {
    if (accessType === 'unlimited') return 'Unlimited';
    if (accessPreset === 'custom') {
      return accessDate ? formatDate(accessDate) : 'Custom date';
    }
    const preset = accessPresets.find(p => p.value === accessPreset);
    return preset?.label || '';
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/client-portal/account-access')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Account Access
            </Button>
            <div>
              <h1 className="text-2xl" style={{ color: branding.colors.headingText }}>
                {isEditMode ? 'Edit User' : 'Add New User'}
              </h1>
              <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                Step {currentStep} of {isEditMode ? '4' : '5'}: {steps[currentStep - 1].title}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps - Clickable */}
        <Card className="p-6 border shadow-sm" style={{ borderColor: branding.colors.borderColor }}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = visitedSteps.has(step.number) && !isActive;
              const isVisited = visitedSteps.has(step.number);
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isVisited}
                    className={`flex flex-col items-center flex-1 transition-all ${
                      isVisited ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'border-green-500 bg-green-50'
                          : isActive
                          ? 'bg-white shadow-sm'
                          : 'bg-gray-50'
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: branding.colors.primaryButton,
                              background: `${branding.colors.primaryButton}10`,
                            }
                          : isCompleted
                          ? {}
                          : { borderColor: branding.colors.borderColor }
                      }
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: isActive
                              ? branding.colors.primaryButton
                              : isVisited
                              ? branding.colors.mutedText
                              : '#cbd5e0',
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs mt-2 text-center"
                      style={{
                        color: isActive || isCompleted
                          ? branding.colors.headingText
                          : isVisited
                          ? branding.colors.mutedText
                          : '#cbd5e0',
                      }}
                    >
                      {step.title}
                    </p>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-px mx-2" style={{ background: branding.colors.borderColor }} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8 border shadow-sm" style={{ borderColor: branding.colors.borderColor }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>
                  Basic Information
                </h2>
                <p className="text-sm mb-6" style={{ color: branding.colors.mutedText }}>
                  Enter the user's basic contact information
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-600">*</span></Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: firstNameError ? '#ef4444' : branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                  />
                  {firstNameError && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{firstNameError}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-600">*</span></Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: lastNameError ? '#ef4444' : branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                  />
                  {lastNameError && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{lastNameError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: branding.colors.mutedText }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: emailError ? '#ef4444' : branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: branding.colors.mutedText }}
                  />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-10"
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: phoneError ? '#ef4444' : branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                  />
                </div>
                {phoneError && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{phoneError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Role & Permissions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>
                  Role & Permissions
                </h2>
                <p className="text-sm mb-6" style={{ color: branding.colors.mutedText }}>
                  Select the user's role and configure their access permissions
                </p>
              </div>

              <div className="space-y-4">
                <Label>Select Role <span className="text-red-600">*</span></Label>
                <div className="grid grid-cols-2 gap-4">
                  {getAvailableRoles().map((role) => {
                    const RoleIcon = role.icon;
                    const isSelected = selectedRole === role.value;
                    
                    return (
                      <Card
                        key={role.value}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          isSelected ? 'shadow-md' : 'hover:shadow-sm'
                        }`}
                        style={{
                          borderColor: isSelected ? role.color : branding.colors.borderColor,
                          background: isSelected ? `${role.color}10` : branding.colors.cardBackground,
                        }}
                        onClick={() => handleRoleChange(role.value)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${role.color}20` }}
                          >
                            <RoleIcon className="w-5 h-5" style={{ color: role.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium" style={{ color: branding.colors.headingText }}>
                                {role.label}
                              </p>
                              {isSelected && (
                                <Check className="w-4 h-4" style={{ color: role.color }} />
                              )}
                            </div>
                            <p className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Custom Role Title */}
              {selectedRole === 'other' && (
                <div className="space-y-2 p-6 rounded-lg border-2" style={{ borderColor: branding.colors.primaryButton, background: `${branding.colors.primaryButton}10` }}>
                  <Label htmlFor="customRoleTitle" className="text-base">Custom Role Title <span className="text-red-600">*</span></Label>
                  <Input
                    id="customRoleTitle"
                    placeholder="e.g., Auditor, Advisor, Tax Specialist, etc."
                    value={customRoleTitle}
                    onChange={(e) => handleCustomRoleTitleChange(e.target.value)}
                    autoFocus
                    className="text-base h-12"
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: customRoleTitleError ? '#ef4444' : branding.colors.primaryButton,
                      color: branding.colors.inputText,
                      borderWidth: '2px',
                    }}
                  />
                  {customRoleTitleError && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{customRoleTitleError}</span>
                    </div>
                  )}
                  <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                    This title will be saved and available for future users.
                  </p>
                </div>
              )}

              <Separator />

              <div 
                className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: force2FA ? branding.colors.primaryButton : branding.colors.borderColor,
                  background: force2FA ? `${branding.colors.primaryButton}15` : branding.colors.cardBackground,
                }}
                onClick={() => setForce2FA(!force2FA)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ background: force2FA ? `${branding.colors.primaryButton}20` : '#f3f4f6' }}
                    >
                      <Shield className="w-5 h-5" style={{ color: force2FA ? branding.colors.primaryButton : '#9ca3af' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: branding.colors.headingText }}>
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                        Require 2FA for enhanced security (Recommended)
                      </p>
                      {force2FA && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: branding.colors.primaryButton }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-medium" style={{ color: branding.colors.primaryButton }}>
                            2FA Required for Login
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Checkbox 
                    checked={force2FA} 
                    onCheckedChange={(checked) => setForce2FA(checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Portal Page Access</Label>
                    <p className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                      Select which pages this user can access in the portal
                    </p>
                    <div 
                      className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md"
                      style={{ 
                        background: `${branding.colors.primaryButton}08`,
                        borderLeft: `3px solid ${branding.colors.primaryButton}`,
                      }}
                    >
                      <Folder className="w-4 h-4 flex-shrink-0" style={{ color: branding.colors.primaryButton }} />
                      <p className="text-xs" style={{ color: branding.colors.bodyText }}>
                        <strong>Note:</strong> Folder access permissions are configured on the next page
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Exclude account-access from Select All
                      const nonAdminPages = navigationPages.filter(p => p.id !== 'account-access');
                      const allNonAdminSelected = nonAdminPages.every(p => navigationPermissions.includes(p.id));
                      
                      if (allNonAdminSelected) {
                        // Deselect all except account-access (keep it if already granted)
                        setNavigationPermissions(prev => prev.filter(id => id === 'account-access'));
                      } else {
                        // Select all except account-access (preserve if already granted)
                        const newPermissions = nonAdminPages.map(p => p.id);
                        if (navigationPermissions.includes('account-access')) {
                          newPermissions.push('account-access');
                        }
                        setNavigationPermissions(newPermissions);
                      }
                    }}
                    style={{
                      borderColor: branding.colors.primaryButton,
                      color: branding.colors.primaryButton,
                    }}
                  >
                    Select All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {navigationPages.map((page) => {
                    const isAccountAccess = page.id === 'account-access';
                    const hasAdminAccess = navigationPermissions.includes('account-access');
                    return (
                      <div
                        key={page.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isAccountAccess ? 'border-2' : ''
                        }`}
                        style={{ 
                          borderColor: isAccountAccess ? '#9ca3af' : branding.colors.borderColor,
                          background: isAccountAccess ? (hasAdminAccess ? '#fef3c7' : '#f3f4f6') : 'transparent',
                          opacity: isAccountAccess && !hasAdminAccess ? 0.6 : 1,
                        }}
                      >
                        <Checkbox
                          checked={navigationPermissions.includes(page.id)}
                          onCheckedChange={() => toggleNavigationPermission(page.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div 
                          className="flex items-center gap-3 flex-1"
                          onClick={() => toggleNavigationPermission(page.id)}
                        >
                          {isAccountAccess ? (
                            <Lock className="w-5 h-5" style={{ color: hasAdminAccess ? '#f59e0b' : '#6b7280' }} />
                          ) : (
                            <span className="text-2xl">{page.icon}</span>
                          )}
                          <div className="flex-1">
                            <span className="text-sm block" style={{ color: branding.colors.bodyText }}>
                              {page.label}
                            </span>
                            {isAccountAccess && (
                              <span className="text-xs block mt-0.5" style={{ color: hasAdminAccess ? '#f59e0b' : '#6b7280' }}>
                                🔐 Admin access - requires confirmation
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Folder Access */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>
                  File Manager & Folder Access
                </h2>
                <p className="text-sm mb-4" style={{ color: branding.colors.mutedText }}>
                  Grant access to specific folders in the file manager
                </p>
                <div 
                  className="p-3 rounded-lg border-l-4 mb-6" 
                  style={{ 
                    borderColor: branding.colors.primaryButton,
                    background: `${branding.colors.primaryButton}10`,
                  }}
                >
                  <p className="text-sm" style={{ color: branding.colors.bodyText }}>
                    📁 <strong>Note:</strong> Users will have upload and download access for granted folders only.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allFolderIds = [
                      ...folderStructure.map(f => f.id),
                      ...folderStructure.flatMap(f => f.children.map(c => c.id))
                    ];
                    if (selectedFolders.length === allFolderIds.length) {
                      setSelectedFolders([]);
                    } else {
                      setSelectedFolders(allFolderIds);
                    }
                  }}
                  style={{
                    borderColor: branding.colors.primaryButton,
                    color: branding.colors.primaryButton,
                  }}
                >
                  {selectedFolders.length === (folderStructure.length + folderStructure.reduce((acc, f) => acc + f.children.length, 0)) 
                    ? 'Deselect All' 
                    : 'Full Access'}
                </Button>
              </div>

              <div className="space-y-3">
                {folderStructure.map((folder) => (
                  <div key={folder.id}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      style={{ borderColor: branding.colors.borderColor }}
                    >
                      <Checkbox
                        checked={selectedFolders.includes(folder.id)}
                        onCheckedChange={() => toggleFolderAccess(folder.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggleFolderAccess(folder.id)}
                      >
                        <Folder 
                          className="w-5 h-5" 
                          style={{ color: branding.colors.primaryButton }} 
                        />
                        <span 
                          className="text-sm font-medium" 
                          style={{ color: branding.colors.bodyText }}
                        >
                          {folder.name}
                        </span>
                      </div>
                      {folder.children.length > 0 && (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform cursor-pointer ${
                            expandedFolders.includes(folder.id) ? 'rotate-90' : ''
                          }`}
                          style={{ color: branding.colors.mutedText }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolder(folder.id);
                          }}
                        />
                      )}
                    </div>

                    {/* Child folders */}
                    {expandedFolders.includes(folder.id) && folder.children.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {folder.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: branding.colors.borderColor }}
                          >
                            <Checkbox
                              checked={selectedFolders.includes(child.id)}
                              onCheckedChange={() => toggleFolderAccess(child.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => toggleFolderAccess(child.id)}
                            >
                              <Folder 
                                className="w-4 h-4" 
                                style={{ color: branding.colors.mutedText }} 
                              />
                              <span className="text-sm" style={{ color: branding.colors.bodyText }}>
                                {child.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div 
                className="p-4 rounded-lg border" 
                style={{ 
                  borderColor: branding.colors.borderColor,
                  background: `${branding.colors.primaryButton}05` 
                }}
              >
                <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                  💡 <strong>Tip:</strong> Users will only see and access folders you select here. You can modify these permissions later.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Access Duration */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>
                  Access Duration
                </h2>
                <p className="text-sm mb-6" style={{ color: branding.colors.mutedText }}>
                  Set how long this user will have access to the portal
                </p>
              </div>

              <div className="space-y-4">
                {/* Limited Time Access */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all`}
                  style={{
                    borderColor: accessType === 'limited' ? branding.colors.primaryButton : branding.colors.borderColor,
                    background: accessType === 'limited' ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                  }}
                  onClick={() => setAccessType('limited')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={accessType === 'limited'}
                      onCheckedChange={() => setAccessType('limited')}
                    />
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: branding.colors.headingText }}>
                        Limited Time Access
                      </p>
                      <p className="text-sm mt-1 mb-4" style={{ color: branding.colors.mutedText }}>
                        User access will expire after a specified period
                      </p>
                      
                      {accessType === 'limited' && (
                        <div className="space-y-4">
                          {/* Preset Options */}
                          <div className="grid grid-cols-3 gap-3">
                            {accessPresets.map((preset) => (
                              <div
                                key={preset.value}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  accessPreset === preset.value ? 'shadow-sm' : ''
                                }`}
                                style={{
                                  borderColor: accessPreset === preset.value 
                                    ? branding.colors.primaryButton 
                                    : branding.colors.borderColor,
                                  background: accessPreset === preset.value 
                                    ? `${branding.colors.primaryButton}15` 
                                    : branding.colors.cardBackground,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccessPresetChange(preset.value);
                                }}
                              >
                                <p 
                                  className="text-sm font-medium" 
                                  style={{ color: branding.colors.headingText }}
                                >
                                  {preset.label}
                                </p>
                                <p 
                                  className="text-xs mt-1" 
                                  style={{ color: branding.colors.mutedText }}
                                >
                                  {preset.description}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Custom Date Picker */}
                          {accessPreset === 'custom' && (
                            <div className="space-y-3">
                              <Label className="text-base">Select Expiration Date</Label>
                              <Input
                                type="date"
                                value={accessDate}
                                onChange={(e) => handleAccessDateChange(e.target.value)}
                                ref={(el) => {
                                  if (el && accessPreset === 'custom' && !accessDate) {
                                    setTimeout(() => {
                                      try {
                                        el.showPicker?.();
                                      } catch (error) {
                                        // Silently catch SecurityError from showPicker in iframe context
                                        if (error instanceof Error && error.name !== 'SecurityError') {
                                          console.error('Error opening date picker:', error);
                                        }
                                      }
                                    }, 100);
                                  }
                                }}
                                className="h-14 text-base w-full cursor-pointer"
                                style={{
                                  background: branding.colors.inputBackground,
                                  borderColor: accessDateError ? '#ef4444' : branding.colors.inputBorder,
                                  color: branding.colors.inputText,
                                  borderWidth: '2px',
                                }}
                              />
                              {accessDateError && (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{accessDateError}</span>
                                </div>
                              )}
                              <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                                💡 Click the field to open the date picker. Use arrow keys or &gt;&gt; to navigate by year.
                              </p>
                            </div>
                          )}

                          {/* Preview - Enhanced with visual weight */}
                          {accessDate && (
                            <div 
                              className="p-4 rounded-lg border-2" 
                              style={{ 
                                background: `${branding.colors.primaryButton}15`,
                                borderColor: branding.colors.primaryButton,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="p-2 rounded-full"
                                  style={{ background: branding.colors.primaryButton }}
                                >
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                                    Access Expires On
                                  </p>
                                  <p 
                                    className="text-lg mt-0.5" 
                                    style={{ 
                                      color: branding.colors.primaryButton,
                                      fontWeight: '600',
                                    }}
                                  >
                                    {formatDate(accessDate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unlimited Access */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all`}
                  style={{
                    borderColor: accessType === 'unlimited' ? branding.colors.primaryButton : branding.colors.borderColor,
                    background: accessType === 'unlimited' ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                  }}
                  onClick={() => setAccessType('unlimited')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={accessType === 'unlimited'}
                      onCheckedChange={() => setAccessType('unlimited')}
                    />
                    <div>
                      <p className="font-medium" style={{ color: branding.colors.headingText }}>
                        Unlimited Access
                      </p>
                      <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                        User will have permanent access until manually disabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Finalize */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg mb-4" style={{ color: branding.colors.headingText }}>
                  {isEditMode ? 'Review Changes' : 'Review & Finalize'}
                </h2>
                <p className="text-sm mb-6" style={{ color: branding.colors.mutedText }}>
                  {isEditMode 
                    ? 'Review updated information and optionally send credentials to the user'
                    : 'Review all information and configure final settings'}
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                  style={{ 
                    borderColor: hasPortalAccess ? branding.colors.primaryButton : branding.colors.borderColor,
                    background: hasPortalAccess ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                  }}
                  onClick={() => setHasPortalAccess(!hasPortalAccess)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ background: hasPortalAccess ? `${branding.colors.primaryButton}20` : '#f3f4f6' }}
                      >
                        <Key className="w-5 h-5" style={{ color: hasPortalAccess ? branding.colors.primaryButton : '#9ca3af' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: branding.colors.headingText }}>
                          Enable Portal Access
                        </p>
                        <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                          Allow this user to log into the client portal
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={hasPortalAccess}
                      onCheckedChange={(checked) => setHasPortalAccess(checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {hasPortalAccess && (
                  <div
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                    style={{ 
                      borderColor: sendCredentials ? branding.colors.primaryButton : branding.colors.borderColor,
                      background: sendCredentials ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                    }}
                    onClick={() => setSendCredentials(!sendCredentials)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: sendCredentials ? `${branding.colors.primaryButton}20` : '#f3f4f6' }}
                        >
                          <Mail className="w-5 h-5" style={{ color: sendCredentials ? branding.colors.primaryButton : '#9ca3af' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: branding.colors.headingText }}>
                            {isEditMode ? 'Resend Login Credentials' : 'Send Login Credentials'}
                          </p>
                          <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                            {isEditMode 
                              ? `Resend login credentials to ${email || 'the user'}`
                              : `Email login credentials to ${email || 'the user'}`}
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        checked={sendCredentials}
                        onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Summary - Redesigned */}
              <div className="space-y-4">
                <h3 style={{ color: branding.colors.headingText }}>
                  Review User Details
                </h3>
                
                <div className="grid gap-4">
                  {/* User Information Card */}
                  <Card 
                    className="p-4"
                    style={{ 
                      background: branding.colors.cardBackground,
                      borderColor: branding.colors.borderColor,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${branding.colors.primaryButton}20` }}
                      >
                        <User className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: branding.colors.headingText }}>
                          User Information
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: branding.colors.mutedText }}>
                          Basic contact details
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 ml-13">
                      <div>
                        <p className="text-xs" style={{ color: branding.colors.mutedText }}>Name</p>
                        <p className="text-sm mt-0.5" style={{ color: branding.colors.bodyText }}>
                          {firstName} {lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: branding.colors.mutedText }}>Email</p>
                        <p className="text-sm mt-0.5" style={{ color: branding.colors.bodyText }}>{email}</p>
                      </div>
                      {phone && (
                        <div>
                          <p className="text-xs" style={{ color: branding.colors.mutedText }}>Phone</p>
                          <p className="text-sm mt-0.5" style={{ color: branding.colors.bodyText }}>{phone}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Role & Permissions Card */}
                  <Card 
                    className="p-4"
                    style={{ 
                      background: branding.colors.cardBackground,
                      borderColor: branding.colors.borderColor,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${branding.colors.primaryButton}20` }}
                      >
                        <Shield className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: branding.colors.headingText }}>
                          Role & Permissions
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: branding.colors.mutedText }}>
                          Access level and security settings
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 ml-13">
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs mb-1.5" style={{ color: branding.colors.mutedText }}>Role</p>
                          <Badge 
                            style={{ 
                              background: `${roleOptions.find((r) => r.value === selectedRole)?.color || branding.colors.primaryButton}20`,
                              color: roleOptions.find((r) => r.value === selectedRole)?.color || branding.colors.primaryButton,
                              borderColor: roleOptions.find((r) => r.value === selectedRole)?.color || branding.colors.primaryButton,
                            }}
                            className="border"
                          >
                            {selectedRole === 'other' && customRoleTitle 
                              ? customRoleTitle 
                              : roleOptions.find((r) => r.value === selectedRole)?.label || 'Not selected'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs mb-1.5" style={{ color: branding.colors.mutedText }}>Two-Factor Auth</p>
                          <Badge 
                            style={{ 
                              background: force2FA ? '#3b82f620' : '#f3f4f6',
                              color: force2FA ? '#3b82f6' : '#6b7280',
                              borderColor: force2FA ? '#3b82f6' : '#d1d5db',
                            }}
                            className="border"
                          >
                            {force2FA ? (
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Required
                              </span>
                            ) : (
                              'Optional'
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs mb-2" style={{ color: branding.colors.mutedText }}>Portal Pages</p>
                        <div className="space-y-1.5">
                          {navigationPages.map((page) => {
                            const hasAccess = navigationPermissions.includes(page.id);
                            const isAdmin = page.id === 'account-access';
                            return (
                              <div 
                                key={page.id}
                                className="flex items-center gap-2 text-xs"
                                style={{ 
                                  color: hasAccess ? branding.colors.bodyText : branding.colors.mutedText,
                                  opacity: hasAccess ? 1 : 0.4,
                                }}
                              >
                                <div 
                                  className="w-4 h-4 rounded flex items-center justify-center"
                                  style={{ 
                                    background: hasAccess ? '#10b98120' : '#f3f4f6',
                                    border: hasAccess ? '1px solid #10b981' : '1px solid #e5e7eb',
                                  }}
                                >
                                  {hasAccess && <Check className="w-3 h-3 text-green-600" />}
                                </div>
                                <span>{page.label}</span>
                                {isAdmin && hasAccess && (
                                  <Badge variant="outline" style={{ 
                                    borderColor: '#f59e0b', 
                                    color: '#f59e0b',
                                    fontSize: '9px',
                                    padding: '1px 4px',
                                    height: '16px',
                                  }}>
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Folder & Access Card - Compact Version */}
                  <Card 
                    className="p-4 border-2"
                    style={{ 
                      background: `${branding.colors.primaryButton}08`,
                      borderColor: `${branding.colors.primaryButton}40`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${branding.colors.primaryButton}20` }}
                      >
                        <Calendar className="w-4 h-4" style={{ color: branding.colors.primaryButton }} />
                      </div>
                      <p className="font-medium" style={{ color: branding.colors.headingText }}>
                        Access & Duration
                      </p>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: branding.colors.mutedText }}>Folders:</span>
                        <span className="text-sm font-medium" style={{ color: branding.colors.bodyText }}>
                          {selectedFolders.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: branding.colors.mutedText }}>Duration:</span>
                        <span className="text-sm font-medium" style={{ color: branding.colors.bodyText }}>
                          {getAccessDurationDisplay()}
                        </span>
                      </div>
                      {accessType === 'limited' && accessDate && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: branding.colors.mutedText }}>Expires:</span>
                          <span className="text-sm font-medium" style={{ color: branding.colors.primaryButton }}>
                            {formatDate(accessDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: branding.colors.mutedText }}>Portal:</span>
                        <span className="text-sm font-medium" style={{ color: branding.colors.bodyText }}>
                          {hasPortalAccess ? '✓ Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/client-portal/account-access')}
            >
              Cancel
            </Button>
            {currentStep < (isEditMode ? 4 : 5) ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
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
                disabled={!isStepValid(currentStep)}
                style={{
                  background: branding.colors.primaryButton,
                  color: branding.colors.primaryButtonText,
                }}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                {isEditMode ? 'Update User' : 'Add User'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Access Confirmation Dialog */}
      <AlertDialog open={showAdminAccessDialog} onOpenChange={setShowAdminAccessDialog}>
        <AlertDialogContent style={{ background: branding.colors.cardBackground }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2" style={{ color: branding.colors.headingText }}>
              <Lock className="w-5 h-5" style={{ color: '#f59e0b' }} />
              Grant Account Access Permission?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: branding.colors.bodyText }}>
              <div className="space-y-3 mt-2">
                <div 
                  className="p-3 rounded-lg border-l-4"
                  style={{
                    background: '#fef3c7',
                    borderColor: '#f59e0b',
                  }}
                >
                  <div className="text-sm font-medium text-amber-900">
                    ⚠️ This is an administrative permission
                  </div>
                </div>
                
                <div className="text-sm" style={{ color: branding.colors.bodyText }}>
                  Granting <strong>Account Access</strong> permission allows this user to:
                </div>
                
                <ul className="space-y-2 text-sm ml-4" style={{ color: branding.colors.bodyText }}>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Add, edit, and remove other users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Manage user permissions and access levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>View and modify folder access for all users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Reset passwords and send login credentials</span>
                  </li>
                </ul>

                <div className="text-sm font-medium" style={{ color: branding.colors.bodyText }}>
                  Only grant this permission to trusted administrators.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAdminAccess}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAdminAccess}
              style={{
                background: '#f59e0b',
                color: 'white',
              }}
            >
              Yes, Grant Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientPortalLayout>
  );
}
