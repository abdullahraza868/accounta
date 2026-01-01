import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientVisibility } from '../contexts/ClientVisibilityContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { PhoneInput } from './ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { StepNavigation, Step as StepConfig } from './StepNavigation';
import { 
  X, 
  User, 
  Building2, 
  Upload, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  CreditCard,
  Briefcase,
  Users,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Tag,
  DollarSign,
  Hash,
  UserPlus,
  Baby,
  UserCheck,
  Shield,
  AlertCircle,
  Minus,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  UserCircle,
  IdCard,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import { ManageClientGroupsDialog } from './ManageClientGroupsDialog';
import { ScrollArea } from './ui/scroll-area';
import { ConsolidatedDemographicsCard } from './ConsolidatedDemographicsCard';
import { ConsolidatedBusinessDemographicsCard } from './ConsolidatedBusinessDemographicsCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { SSNCard } from './SSNCard';
import { EINCard } from './EINCard';
import { BankAccountCard } from './BankAccountCard';
import { DriverLicenseCard } from './DriverLicenseCard';
import { ServicesCard } from './ServicesCard';
import { SpouseCard } from './SpouseCard';
import { DependentsCard } from './DependentsCard';
import { AdditionalContactsCard } from './AdditionalContactsCard';

type ClientType = 'individual' | 'business';

type ServiceType = 'tax' | 'bookkeeping' | 'payroll' | 'advisory' | 'cleanup' | 'catchup' | 'sales-tax' | 'year-end';

type FilingStatus = 'single' | 'married-joint' | 'married-separate' | 'head-of-household' | 'qualifying-widow';

type AccountType = 'checking' | 'savings' | 'money-market';

type EntityType = 'llc' | 's-corp' | 'c-corp' | 'partnership' | 'sole-proprietor' | 'non-profit';

interface CreateClientWizardProps {
  onClose?: () => void;
  clientGroups: ClientGroup[];
  asPage?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<ClientWizardData>;
  hideClientType?: boolean;
  title?: string;
  onSave?: (data: any) => void;
}

interface ClientWizardData {
  clientType: ClientType;
  profilePhoto: string;
  selectedGroups: string[];
  clientNumber: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  ssn?: string;
  filingStatus?: FilingStatus;
  profession?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  companyName?: string;
  dbaName?: string;
  ein?: string;
  entityType?: EntityType;
  [key: string]: any;
}

interface Withholding {
  id: string;
  agency: string;
  accountNumber: string;
}

interface UserAccount {
  id: string;
  username: string;
  email: string;
}

interface License {
  id: string;
  type: string;
  number: string;
  expirationDate: string;
}

interface SalesTaxAccount {
  id: string;
  state: string;
  accountNumber: string;
  frequency: string;
}

interface Spouse {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  dob: string;
}

interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dob: string;
  ssn: string;
}

interface AdditionalContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const SERVICES: { id: ServiceType; label: string }[] = [
  { id: 'tax', label: 'Tax' },
  { id: 'bookkeeping', label: 'Bookkeeping' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'advisory', label: 'Advisory' },
  { id: 'cleanup', label: 'Cleanup' },
  { id: 'catchup', label: 'Catch-up' },
  { id: 'sales-tax', label: 'Sales Tax Filing' },
  { id: 'year-end', label: 'Year-End Tax' },
];

export function CreateClientWizard({ 
  onClose, 
  clientGroups, 
  asPage = false,
  mode = 'create',
  initialData,
  hideClientType = false,
  title,
  onSave
}: CreateClientWizardProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get visibility settings from context
  const { individualCardVisibility, businessCardVisibility } = useClientVisibility();

  // Determine initial step - skip 'basic' if client type is hidden
  const initialStep = (hideClientType || mode === 'edit') ? 'identity' : 'basic';
  
  // Step management
  const [currentStep, setCurrentStep] = useState<'basic' | 'identity' | 'financial' | 'additional' | 'demographics' | 'review'>(initialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set([initialStep]));

  // Step 1: Basic Profile - initialize from initialData if provided
  const [clientType, setClientType] = useState<ClientType>(
    initialData?.clientType || (initialData?.clientType === 'business' ? 'business' : 'individual')
  );
  const [profilePhoto, setProfilePhoto] = useState<string>(initialData?.profilePhoto || '');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialData?.selectedGroups || ['lead']);
  const [clientNumber, setClientNumber] = useState<string>(initialData?.clientNumber || '');
  
  // Client Groups Dialog
  const [showClientGroupsDialog, setShowClientGroupsDialog] = useState(false);

  // Step 2: Identity & Contact - Individual
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [ssn, setSsn] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [profession, setProfession] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlState, setDlState] = useState('');
  const [dlIssueDate, setDlIssueDate] = useState('');
  const [dlExpirationDate, setDlExpirationDate] = useState('');
  const [dlFrontImage, setDlFrontImage] = useState<string | null>(null);
  const [dlBackImage, setDlBackImage] = useState<string | null>(null);
  const [useFakeDomain, setUseFakeDomain] = useState(false);

  // Step 2: Identity & Contact - Business
  const [companyName, setCompanyName] = useState('');
  const [dbaName, setDbaName] = useState('');
  const [companyActivity, setCompanyActivity] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [ein, setEin] = useState('');
  const [entityNumber, setEntityNumber] = useState('');
  const [businessStartDate, setBusinessStartDate] = useState('');
  const [incorporationDate, setIncorporationDate] = useState('');
  const [sosExpirationDate, setSosExpirationDate] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('llc');
  const [stateOfIncorporation, setStateOfIncorporation] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [totalEmployees, setTotalEmployees] = useState('');
  const [fiscalYearEnd, setFiscalYearEnd] = useState('');

  // Step 3: Financial & Services
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [selectedServices, setSelectedServices] = useState<Set<ServiceType>>(new Set());
  const [customServices, setCustomServices] = useState<{id: string; label: string}[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [withholdings, setWithholdings] = useState<Withholding[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [salesTaxAccounts, setSalesTaxAccounts] = useState<SalesTaxAccount[]>([]);

  // Step 4: Additional Info
  const [spouse, setSpouse] = useState<Spouse | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>([]);
  const [hasFinancialStatements, setHasFinancialStatements] = useState(false);
  const [needBookkeeping, setNeedBookkeeping] = useState(false);
  const [needPayroll, setNeedPayroll] = useState(false);
  const [referredBy, setReferredBy] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form fields from initialData
  useEffect(() => {
    if (initialData) {
      // Individual fields
      if (initialData.firstName) setFirstName(initialData.firstName);
      if (initialData.middleName) setMiddleName(initialData.middleName);
      if (initialData.lastName) setLastName(initialData.lastName);
      if (initialData.preferredName) setPreferredName(initialData.preferredName);
      if (initialData.email) setEmail(initialData.email);
      if (initialData.phone) setPhone(initialData.phone);
      if (initialData.dob) setDob(initialData.dob);
      if (initialData.ssn) setSsn(initialData.ssn);
      if (initialData.filingStatus) setFilingStatus(initialData.filingStatus as FilingStatus);
      if (initialData.profession) setProfession(initialData.profession);
      if (initialData.address1) setAddress1(initialData.address1);
      if (initialData.address2) setAddress2(initialData.address2);
      if (initialData.city) setCity(initialData.city);
      if (initialData.state) setState(initialData.state);
      if (initialData.postalCode) setPostalCode(initialData.postalCode);
      
      // Business fields
      if (initialData.companyName) setCompanyName(initialData.companyName);
      if (initialData.dbaName) setDbaName(initialData.dbaName);
      if (initialData.ein) setEin(initialData.ein);
      if (initialData.entityType) setEntityType(initialData.entityType as EntityType);
      if (initialData.stateOfIncorporation) setStateOfIncorporation(initialData.stateOfIncorporation);
      if (initialData.ownerName) setOwnerName(initialData.ownerName);
      
      // Financial fields
      if (initialData.bankName) setBankName(initialData.bankName);
      if (initialData.accountNumber) setAccountNumber(initialData.accountNumber);
      if (initialData.routingNumber) setRoutingNumber(initialData.routingNumber);
      if (initialData.accountType) setAccountType(initialData.accountType as AccountType);
      if (initialData.selectedServices) {
        setSelectedServices(new Set(initialData.selectedServices as ServiceType[]));
      }
      
      // Additional fields
      if (initialData.spouse) setSpouse(initialData.spouse as Spouse);
      if (initialData.dependents) setDependents(initialData.dependents as Dependent[]);
      if (initialData.additionalContacts) setAdditionalContacts(initialData.additionalContacts as AdditionalContact[]);
      if (initialData.referredBy) setReferredBy(initialData.referredBy);
    }
  }, [initialData]);

  // Steps array - exclude 'basic' if client type is hidden
  const allSteps: StepConfig[] = [
    { id: 'basic', label: 'Basic Profile', number: 1 },
    { id: 'identity', label: 'Identity & Contact', number: 2 },
    { id: 'financial', label: 'Financial & Services', number: 3 },
    { id: 'additional', label: 'Additional Info', number: 4 },
    { id: 'demographics', label: 'Demographics Preview', number: 5 },
    { id: 'review', label: mode === 'edit' ? 'Review & Save' : 'Review & Create', number: 6 },
  ];

  const steps: StepConfig[] = hideClientType 
    ? allSteps.filter(s => s.id !== 'basic').map((s, idx) => ({ ...s, number: idx + 1 }))
    : allSteps;

  const sortedGroups = [...clientGroups].sort((a, b) => a.name.localeCompare(b.name));
  const hasLeadGroup = clientGroups.some(g => g.id === 'lead');

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId as typeof currentStep);
  };

  const handleNext = () => {
    const stepOrder: (typeof currentStep)[] = hideClientType 
      ? ['identity', 'financial', 'additional', 'demographics', 'review']
      : ['basic', 'identity', 'financial', 'additional', 'demographics', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      setVisitedSteps(new Set([...visitedSteps, nextStep]));
    }
  };

  const handleBack = () => {
    const stepOrder: (typeof currentStep)[] = hideClientType 
      ? ['identity', 'financial', 'additional', 'demographics', 'review']
      : ['basic', 'identity', 'financial', 'additional', 'demographics', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleService = (serviceId: ServiceType) => {
    const newServices = new Set(selectedServices);
    if (newServices.has(serviceId)) {
      newServices.delete(serviceId);
    } else {
      newServices.add(serviceId);
    }
    setSelectedServices(newServices);
  };

  const toggleAllServices = () => {
    if (selectedServices.size === SERVICES.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(SERVICES.map(s => s.id)));
    }
  };

  // Handle fake domain toggle
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const clientData = {
        clientType,
        profilePhoto,
        clientGroups: selectedGroups,
        clientNumber,
        // Individual fields
        ...(clientType === 'individual' && {
          firstName,
          middleName,
          lastName,
          preferredName,
          dob,
          ssn,
          filingStatus,
          profession,
          dlNumber,
          dlState,
          dlIssueDate,
          dlExpirationDate,
        }),
        // Business fields
        ...(clientType === 'business' && {
          companyName,
          dbaName,
          companyActivity,
          companyType,
          ein,
          entityNumber,
          businessStartDate,
          incorporationDate,
          sosExpirationDate,
          entityType,
          stateOfIncorporation,
          ownerName,
          totalEmployees,
        }),
        // Common fields
        email,
        phone,
        address1,
        address2,
        city,
        state,
        postalCode,
        // Financial
        bankName,
        accountNumber,
        routingNumber,
        accountType,
        selectedServices: Array.from(selectedServices),
        withholdings,
        userAccounts,
        licenses,
        salesTaxAccounts,
        // Additional
        spouse,
        dependents,
        additionalContacts,
        hasFinancialStatements,
        needBookkeeping,
        needPayroll,
        referredBy,
        isActive,
        twoFactorEnabled,
      };

      if (mode === 'edit' && onSave) {
        // Edit mode - call onSave callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSave(clientData);
        toast.success('Profile Updated Successfully', {
          description: 'Your profile has been updated',
          icon: <Check className="w-4 h-4" />,
        });
        if (onClose) {
          onClose();
        }
      } else {
        // Create mode - original flow
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Creating client:', clientData);

        const clientName = clientType === 'business' ? companyName : `${firstName} ${lastName}`;

        toast.success('Client Created Successfully', {
          description: `${clientName} has been added to your client list`,
          icon: <Check className="w-4 h-4" />,
        });

        if (onClose) {
          onClose();
        }

        const mockClientId = `client-${Date.now()}`;
        setTimeout(() => {
          navigate(`/clients/${mockClientId}`);
        }, 300);
      }

    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(mode === 'edit' ? 'Failed to Update Profile' : 'Failed to Create Client', {
        description: 'Please try again or contact support if the problem persists',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Basic Profile
  const renderBasicProfile = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client Type Toggle - Hidden when hideClientType is true */}
      {!hideClientType && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium mb-4">Client Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setClientType('individual')}
              className={cn(
                'p-6 border-2 rounded-xl transition-all text-left',
                'hover:border-gray-300 dark:hover:border-gray-600',
                clientType === 'individual'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  clientType === 'individual'
                    ? 'bg-purple-100 dark:bg-purple-900/40'
                    : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <User className={cn(
                    'w-6 h-6',
                    clientType === 'individual'
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )} />
                </div>
                <div>
                  <p className="font-medium mb-1">Individual Client</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personal tax client
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setClientType('business')}
              className={cn(
                'p-6 border-2 rounded-xl transition-all text-left',
                'hover:border-gray-300 dark:hover:border-gray-600',
                clientType === 'business'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  clientType === 'business'
                    ? 'bg-purple-100 dark:bg-purple-900/40'
                    : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <Building2 className={cn(
                    'w-6 h-6',
                    clientType === 'business'
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )} />
                </div>
                <div>
                  <p className="font-medium mb-1">Business Client</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Business entity
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              clientType === 'individual' ? (
                <User className="w-12 h-12 text-gray-400" />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Recommended: Square image, at least 200x200 pixels
            </p>
          </div>
        </div>
      </div>

      {/* Client Group & Number */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Client Organization</h3>
        
        {/* Client Group */}
        <div className="mb-4">
          <Label>Client Groups</Label>
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            {selectedGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedGroups.map((group, index) => (
                  <Badge 
                    key={index}
                    className="px-3 py-1.5 text-sm flex items-center gap-2 group cursor-default"
                    style={{ 
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      color: 'var(--primaryColor)',
                      border: '1px solid var(--primaryColor)'
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{group}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGroups(selectedGroups.filter(g => g !== group));
                      }}
                      className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-900 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${group}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No groups assigned
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowClientGroupsDialog(true)}
              className="w-full border-brand-light text-brand-primary hover-brand"
            >
              <Tag className="w-4 h-4 mr-2" />
              Manage Client Groups
            </Button>
          </div>
        </div>

        {/* Client Number */}
        <div className="mt-6">
          <Label htmlFor="client-number">Client Number</Label>
          <div className="relative mt-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="client-number"
              value={clientNumber}
              onChange={(e) => setClientNumber(e.target.value)}
              placeholder=""
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Useful if you&apos;re coordinating with any other system
          </p>
        </div>
      </div>
    </div>
  );

  // Step 2: Identity & Contact - Individual
  const renderIdentityIndividual = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Name */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="mt-1"
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="middle-name">Middle Name</Label>
              <Input
                id="middle-name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="M.I."
                className="mt-1"
              />
            </div>
            <div className="col-span-5">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferred-name">Preferred Name</Label>
            <Input
              id="preferred-name"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="How they prefer to be called"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder={useFakeDomain ? 'Auto-generated unique ID' : 'email@example.com'}
                className="pl-10"
                disabled={useFakeDomain}
              />
            </div>
            {useFakeDomain && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using fake domain prevents emails from being sent to real addresses
              </p>
            )}
          </div>

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
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Tax Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {individualCardVisibility.ssn && (
            <div>
              <Label htmlFor="ssn">SSN</Label>
              <div className="relative mt-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="ssn"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="filing-status">Filing Status</Label>
            <Select value={filingStatus} onValueChange={(v) => setFilingStatus(v as FilingStatus)}>
              <SelectTrigger id="filing-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                <SelectItem value="head-of-household">Head of Household</SelectItem>
                <SelectItem value="qualifying-widow">Qualifying Widow(er)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Occupation"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Address</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="address1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street address"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Apt, suite, unit, etc. (optional)"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="mt-1"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state" className="mt-1">
                  <SelectValue placeholder="ST" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ZIP code"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Driver's License */}
      {individualCardVisibility.drivingLicense && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium mb-4">Driver&apos;s License Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dl-number">License Number</Label>
              <Input
                id="dl-number"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                placeholder="License number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dl-state">Issued State</Label>
              <Select value={dlState} onValueChange={setDlState}>
                <SelectTrigger id="dl-state" className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dl-issue">Issue Date</Label>
              <Input
                id="dl-issue"
                type="date"
                value={dlIssueDate}
                onChange={(e) => setDlIssueDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dl-expiration">Expiration Date</Label>
              <Input
                id="dl-expiration"
                type="date"
                value={dlExpirationDate}
                onChange={(e) => setDlExpirationDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Driver's License Images */}
            <div className="col-span-2">
              <Label className="mb-2 block">License Images</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Front Image */}
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Front</Label>
                  <input
                    type="file"
                    id="dl-front-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setDlFrontImage(reader.result as string);
                          toast.success('Front image uploaded');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="relative">
                    {dlFrontImage ? (
                      <div className="relative group">
                        <img src={dlFrontImage} alt="License Front" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDlFrontImage(null)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('dl-front-upload')?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upload Front</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Back Image */}
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Back</Label>
                  <input
                    type="file"
                    id="dl-back-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setDlBackImage(reader.result as string);
                          toast.success('Back image uploaded');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="relative">
                    {dlBackImage ? (
                      <div className="relative group">
                        <img src={dlBackImage} alt="License Back" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDlBackImage(null)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('dl-back-upload')?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upload Back</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Identity & Contact - Business
  const renderIdentityBusiness = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Company Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Legal business name"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dba">DBA (Doing Business As)</Label>
            <Input
              id="dba"
              value={dbaName}
              onChange={(e) => setDbaName(e.target.value)}
              placeholder="Trade name (if different)"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-activity">Company Activity</Label>
              <Input
                id="company-activity"
                value={companyActivity}
                onChange={(e) => setCompanyActivity(e.target.value)}
                placeholder="Primary business activity"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company-type">Company Type</Label>
              <Input
                id="company-type"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                placeholder="Type of business"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder={useFakeDomain ? 'Auto-generated unique ID' : 'contact@company.com'}
                className="pl-10"
                disabled={useFakeDomain}
              />
            </div>
            {useFakeDomain && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using fake domain prevents emails from being sent to real addresses
              </p>
            )}
          </div>

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
        </div>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Business Address</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="address1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street address"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Suite, unit, etc. (optional)"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="mt-1"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state" className="mt-1">
                  <SelectValue placeholder="ST" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ZIP code"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tax & Entity Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Tax & Entity Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {businessCardVisibility.ein && (
            <div>
              <Label htmlFor="ein">EIN</Label>
              <div className="relative mt-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="ein"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="entity-number">Entity Number</Label>
            <Input
              id="entity-number"
              value={entityNumber}
              onChange={(e) => setEntityNumber(e.target.value)}
              placeholder="State entity number"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="entity-type">Entity Type</Label>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
              <SelectTrigger id="entity-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="s-corp">S Corporation</SelectItem>
                <SelectItem value="c-corp">C Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                <SelectItem value="non-profit">Non-Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state-incorporation">State of Incorporation</Label>
            <Select value={stateOfIncorporation} onValueChange={setStateOfIncorporation}>
              <SelectTrigger id="state-incorporation" className="mt-1">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Important Dates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-start">Date of Business Start</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="business-start"
                type="date"
                value={businessStartDate}
                onChange={(e) => setBusinessStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="incorporation">Date of Incorporation</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="incorporation"
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sos-expiration">SOS Expiration Date</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="sos-expiration"
                type="date"
                value={sosExpirationDate}
                onChange={(e) => setSosExpirationDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Owner & Employees */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Owner & Employees</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="owner-name">Owner Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="owner-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Primary owner/officer"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total-employees">Total Number of Employees</Label>
            <div className="relative mt-1">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="total-employees"
                type="number"
                value={totalEmployees}
                onChange={(e) => setTotalEmployees(e.target.value)}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Financial & Services
  const renderFinancialServices = () => {
    // Check if bank account section should be visible based on client type
    const showBankAccount = clientType === 'individual' 
      ? individualCardVisibility.bankAccount 
      : businessCardVisibility.businessBankAccount;
    
    return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bank Account Info */}
      {showBankAccount && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium mb-4">Bank Account Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank-name">Bank Name</Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Financial institution name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <div className="relative mt-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="routing-number">Routing Number</Label>
              <div className="relative mt-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="routing-number"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="Routing number"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Account Type</Label>
              <div className="flex gap-3 mt-1">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all flex-1",
                    accountType === 'checking'
                      ? "border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  )}
                  onClick={() => setAccountType('checking')}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    accountType === 'checking'
                      ? "border-purple-600 dark:border-purple-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  style={accountType === 'checking' ? { 
                    backgroundColor: 'var(--primaryColor)',
                    borderColor: 'var(--primaryColor)'
                  } : {}}
                  >
                    {accountType === 'checking' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">Checking</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all flex-1",
                    accountType === 'savings'
                      ? "border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  )}
                  onClick={() => setAccountType('savings')}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    accountType === 'savings'
                      ? "border-purple-600 dark:border-purple-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  style={accountType === 'savings' ? { 
                    backgroundColor: 'var(--primaryColor)',
                    borderColor: 'var(--primaryColor)'
                  } : {}}
                  >
                    {accountType === 'savings' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">Savings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Service Classification */}
      {(clientType === 'individual' ? individualCardVisibility.services : businessCardVisibility.businessServices) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Service Classification</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingService(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Service
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAllServices}
                className="gap-2"
              >
                {selectedServices.size === SERVICES.length + customServices.length ? (
                  <>
                    <X className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    All Services
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Add New Service Form */}
          {isAddingService && (
            <div className="mb-4 p-4 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--primaryColor)' }}>
              <Label className="mb-2 block">New Service Name</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter service name..."
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newServiceName.trim()) {
                      e.preventDefault();
                      const serviceId = `custom-${Date.now()}`;
                      setCustomServices([...customServices, { id: serviceId, label: newServiceName.trim() }]);
                      setSelectedServices(new Set([...selectedServices, serviceId as ServiceType]));
                      setNewServiceName('');
                      setIsAddingService(false);
                      toast.success(`Service "${newServiceName.trim()}" added`);
                    } else if (e.key === 'Escape') {
                      setIsAddingService(false);
                      setNewServiceName('');
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newServiceName.trim()) {
                      const serviceId = `custom-${Date.now()}`;
                      setCustomServices([...customServices, { id: serviceId, label: newServiceName.trim() }]);
                      setSelectedServices(new Set([...selectedServices, serviceId as ServiceType]));
                      setNewServiceName('');
                      setIsAddingService(false);
                      toast.success(`Service "${newServiceName.trim()}" added`);
                    }
                  }}
                  disabled={!newServiceName.trim()}
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                  className="text-white"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingService(false);
                    setNewServiceName('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {/* Default Services */}
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={cn(
                  'p-3 border-2 rounded-lg transition-all text-sm',
                  selectedServices.has(service.id)
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {service.label}
              </button>
            ))}
            
            {/* Custom Services */}
            {customServices.map((service) => (
              <div key={service.id} className="relative group">
                <button
                  type="button"
                  onClick={() => toggleService(service.id as ServiceType)}
                  className={cn(
                    'w-full p-3 border-2 rounded-lg transition-all text-sm',
                    selectedServices.has(service.id as ServiceType)
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {service.label}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomServices(customServices.filter(s => s.id !== service.id));
                    const newSelected = new Set(selectedServices);
                    newSelected.delete(service.id as ServiceType);
                    setSelectedServices(newSelected);
                    toast.success(`Service "${service.label}" removed`);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  title="Remove custom service"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Extras */}
      {clientType === 'business' && (
        <>
          {/* Withholdings */}
          {businessCardVisibility.withholdings && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Withholdings</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setWithholdings([...withholdings, {
                    id: Date.now().toString(),
                    agency: '',
                    accountNumber: '',
                  }]);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Withholding
              </Button>
            </div>
            {withholdings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No withholdings added yet
              </p>
            ) : (
              <div className="space-y-3">
                {withholdings.map((withholding, index) => (
                  <div key={withholding.id} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Agency name"
                        value={withholding.agency}
                        onChange={(e) => {
                          const updated = [...withholdings];
                          updated[index].agency = e.target.value;
                          setWithholdings(updated);
                        }}
                      />
                      <Input
                        placeholder="Account number"
                        value={withholding.accountNumber}
                        onChange={(e) => {
                          const updated = [...withholdings];
                          updated[index].accountNumber = e.target.value;
                          setWithholdings(updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWithholdings(withholdings.filter(w => w.id !== withholding.id));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}

          {/* Licenses */}
          {businessCardVisibility.licenses && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Licenses</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setLicenses([...licenses, {
                    id: Date.now().toString(),
                    type: '',
                    number: '',
                    expirationDate: '',
                  }]);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add License
              </Button>
            </div>
            {licenses.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No licenses added yet
              </p>
            ) : (
              <div className="space-y-3">
                {licenses.map((license, index) => (
                  <div key={license.id} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        placeholder="License type"
                        value={license.type}
                        onChange={(e) => {
                          const updated = [...licenses];
                          updated[index].type = e.target.value;
                          setLicenses(updated);
                        }}
                      />
                      <Input
                        placeholder="License number"
                        value={license.number}
                        onChange={(e) => {
                          const updated = [...licenses];
                          updated[index].number = e.target.value;
                          setLicenses(updated);
                        }}
                      />
                      <Input
                        type="date"
                        placeholder="Expiration"
                        value={license.expirationDate}
                        onChange={(e) => {
                          const updated = [...licenses];
                          updated[index].expirationDate = e.target.value;
                          setLicenses(updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLicenses(licenses.filter(l => l.id !== license.id));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}

          {/* Sales Tax Accounts */}
          {businessCardVisibility.salesTaxAccounts && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Sales Tax Accounts</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSalesTaxAccounts([...salesTaxAccounts, {
                    id: Date.now().toString(),
                    state: '',
                    accountNumber: '',
                    frequency: '',
                  }]);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </div>
            {salesTaxAccounts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No sales tax accounts added yet
              </p>
            ) : (
              <div className="space-y-3">
                {salesTaxAccounts.map((account, index) => (
                  <div key={account.id} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Select
                        value={account.state}
                        onValueChange={(v) => {
                          const updated = [...salesTaxAccounts];
                          updated[index].state = v;
                          setSalesTaxAccounts(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Account number"
                        value={account.accountNumber}
                        onChange={(e) => {
                          const updated = [...salesTaxAccounts];
                          updated[index].accountNumber = e.target.value;
                          setSalesTaxAccounts(updated);
                        }}
                      />
                      <Input
                        placeholder="Filing frequency"
                        value={account.frequency}
                        onChange={(e) => {
                          const updated = [...salesTaxAccounts];
                          updated[index].frequency = e.target.value;
                          setSalesTaxAccounts(updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSalesTaxAccounts(salesTaxAccounts.filter(a => a.id !== account.id));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </>
      )}
    </div>
    );
  };

  // Step 4: Additional Info & Relationships
  const renderAdditionalInfo = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Individual: Spouse */}
      {clientType === 'individual' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Spouse Information</h3>
            {!spouse && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSpouse({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    ssn: '',
                    dob: '',
                  });
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Spouse
              </Button>
            )}
          </div>
          {!spouse ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No spouse added
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={spouse.firstName}
                    onChange={(e) => setSpouse({ ...spouse, firstName: e.target.value })}
                    placeholder="First name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    value={spouse.middleName}
                    onChange={(e) => setSpouse({ ...spouse, middleName: e.target.value })}
                    placeholder="M.I."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={spouse.lastName}
                    onChange={(e) => setSpouse({ ...spouse, lastName: e.target.value })}
                    placeholder="Last name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={spouse.email}
                    onChange={(e) => setSpouse({ ...spouse, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <PhoneInput
                    value={spouse.phone}
                    onChange={(v) => setSpouse({ ...spouse, phone: v })}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>SSN</Label>
                  <Input
                    value={spouse.ssn}
                    onChange={(e) => setSpouse({ ...spouse, ssn: e.target.value })}
                    placeholder="XXX-XX-XXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={spouse.dob}
                    onChange={(e) => setSpouse({ ...spouse, dob: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSpouse(null)}
                className="text-red-600 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Spouse
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Individual: Dependents */}
      {clientType === 'individual' && individualCardVisibility.dependents && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Children / Dependents</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDependents([...dependents, {
                  id: Date.now().toString(),
                  firstName: '',
                  lastName: '',
                  relationship: '',
                  dob: '',
                  ssn: '',
                }]);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Dependent
            </Button>
          </div>
          {dependents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No dependents added yet
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {dependents.map((dependent, index) => (
                  <div key={dependent.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="First name"
                        value={dependent.firstName}
                        onChange={(e) => {
                          const updated = [...dependents];
                          updated[index].firstName = e.target.value;
                          setDependents(updated);
                        }}
                      />
                      <Input
                        placeholder="Last name"
                        value={dependent.lastName}
                        onChange={(e) => {
                          const updated = [...dependents];
                          updated[index].lastName = e.target.value;
                          setDependents(updated);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Relationship"
                        value={dependent.relationship}
                        onChange={(e) => {
                          const updated = [...dependents];
                          updated[index].relationship = e.target.value;
                          setDependents(updated);
                        }}
                      />
                      <Input
                        type="date"
                        placeholder="DOB"
                        value={dependent.dob}
                        onChange={(e) => {
                          const updated = [...dependents];
                          updated[index].dob = e.target.value;
                          setDependents(updated);
                        }}
                      />
                      <Input
                        placeholder="SSN"
                        value={dependent.ssn}
                        onChange={(e) => {
                          const updated = [...dependents];
                          updated[index].ssn = e.target.value;
                          setDependents(updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDependents(dependents.filter(d => d.id !== dependent.id));
                      }}
                      className="text-red-600 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Add More Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDependents([...dependents, {
                    id: Date.now().toString(),
                    firstName: '',
                    lastName: '',
                    relationship: '',
                    dob: '',
                    ssn: '',
                  }]);
                }}
                className="w-full mt-3 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add More
              </Button>
            </>
          )}
        </div>
      )}

      {/* Additional Contacts */}
      {(clientType === 'individual' ? individualCardVisibility.otherContacts : businessCardVisibility.businessOtherContacts) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Additional Contacts</h3>
          {additionalContacts.length === 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAdditionalContacts([...additionalContacts, {
                  id: Date.now().toString(),
                  name: '',
                  email: '',
                  phone: '',
                  role: '',
                }]);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          )}
        </div>
        {additionalContacts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No additional contacts added yet
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {additionalContacts.map((contact, index) => (
                <div key={contact.id} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <Input
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...additionalContacts];
                        updated[index].name = e.target.value;
                        setAdditionalContacts(updated);
                      }}
                    />
                    <Input
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) => {
                        const updated = [...additionalContacts];
                        updated[index].email = e.target.value;
                        setAdditionalContacts(updated);
                      }}
                    />
                    <Input
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) => {
                        const updated = [...additionalContacts];
                        updated[index].phone = e.target.value;
                        setAdditionalContacts(updated);
                      }}
                    />
                    <Input
                      placeholder="Role"
                      value={contact.role}
                      onChange={(e) => {
                        const updated = [...additionalContacts];
                        updated[index].role = e.target.value;
                        setAdditionalContacts(updated);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdditionalContacts(additionalContacts.filter(c => c.id !== contact.id));
                    }}
                    className="text-red-600 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAdditionalContacts([...additionalContacts, {
                  id: Date.now().toString(),
                  name: '',
                  email: '',
                  phone: '',
                  role: '',
                }]);
              }}
              className="w-full mt-3 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add More
            </Button>
          </>
        )}
        </div>
      )}

      {/* Referral */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium mb-4">Referral</h3>
        <div>
          <Label htmlFor="referred-by">Referred By</Label>
          <Input
            id="referred-by"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            placeholder="Who referred this client?"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track where this client came from
          </p>
        </div>
      </div>
    </div>
  );

  // Step 5: Demographics Preview
  const renderDemographics = () => {
    // Build demographics data for preview
    const individualDemographicsData = {
      // Personal
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      preferredName: preferredName,
      suffix: '',
      profileImage: profilePhoto,
      dateOfBirth: dob,
      gender: gender || '',
      maritalStatus: maritalStatus || '',
      citizenship: '',
      // Professional
      filingStatus: filingStatus,
      profession: profession,
      // Contact
      email: email,
      phone: phone,
      alternatePhone: alternatePhone,
      // Address
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      postalCode: postalCode,
      country: ''
    };

    const businessDemographicsData = {
      // Primary Contact
      contactPerson: ownerName,
      title: '',
      profileImage: profilePhoto,
      email: email,
      phone: phone,
      alternatePhone: alternatePhone,
      // Company Information
      legalName: companyName,
      dbaName: dbaName,
      entityType: entityType,
      entityNumber: entityNumber,
      stateOfIncorporation: stateOfIncorporation,
      incorporationDate: incorporationDate,
      businessStartDate: businessStartDate,
      sosExpirationDate: sosExpirationDate,
      industry: companyType,
      businessActivity: companyActivity,
      totalEmployees: totalEmployees,
      fiscalYearEnd: fiscalYearEnd,
      // Address
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      postalCode: postalCode,
      country: ''
    };

    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Demographics Preview</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                This is how your client&apos;s information will appear in the Demographics tab. Review the consolidated view before proceeding to final review.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  clientType === 'individual' ? (
                    <User className="w-10 h-10 text-white" />
                  ) : (
                    <Building2 className="w-10 h-10 text-white" />
                  )
                )}
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-semibold">
                  {clientType === 'individual' 
                    ? `${firstName} ${lastName}` 
                    : companyName}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-white/80" />
                    <span className="text-sm text-white/90 capitalize">{clientType}</span>
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/80" />
                      <span className="text-sm text-white/90">{selectedGroups.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wide mt-3">Client No.</div>
                <div className="text-white font-medium mt-1 text-sm font-mono">
                  {clientNumber || 'Auto-generated'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Demographics Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {clientType === 'individual' ? (
            <div className="col-span-2">
              <ConsolidatedDemographicsCard
                data={individualDemographicsData}
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                onChange={() => {}}
              />
            </div>
          ) : (
            <div className="col-span-2">
              <ConsolidatedBusinessDemographicsCard
                data={businessDemographicsData}
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                onChange={() => {}}
              />
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> After creation, you can edit any of these fields individually from the Demographics tab.
          </p>
        </div>
      </div>
    );
  };

  // Step 6: Review Summary (Demographics Tab Style)
  const renderReview = () => {
    // Check if bank account section should be visible based on client type
    const showBankAccount = clientType === 'individual' 
      ? individualCardVisibility.bankAccount 
      : businessCardVisibility.businessBankAccount;

    // Build data structures to pass to the card components
    const mockClientData = {
      type: clientType,
      firstName: firstName,
      lastName: lastName,
      preferredName: preferredName,
      email: email,
      phone: phone,
      dateOfBirth: dob,
      ssn: ssn,
      address: {
        street1: address1,
        street2: address2,
        city: city,
        state: state,
        zipCode: postalCode
      },
      filingStatus: filingStatus,
      profession: profession,
      driverLicense: {
        number: dlNumber,
        state: dlState,
        issueDate: dlIssueDate,
        expirationDate: dlExpirationDate,
        frontImage: dlFrontImage,
        backImage: dlBackImage
      },
      bankAccount: {
        bankName: bankName,
        accountNumber: accountNumber,
        routingNumber: routingNumber,
        accountType: accountType
      },
      companyName: companyName,
      dbaName: dbaName,
      ein: ein,
      entityType: entityType,
      stateOfIncorporation: stateOfIncorporation,
      services: Array.from(selectedServices),
      customServices: customServices
    };

    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Review Before Creating</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please review all information below. You can go back to any step to make changes before creating the client.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout like Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientType === 'individual' ? (
            <>
              {/* Individual Client Cards */}
              {/* Client Organization */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Client Organization
                </h3>
                <div className="space-y-3">
                  {profilePhoto && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Profile Photo</Label>
                      <div className="mt-2">
                        <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                      </div>
                    </div>
                  )}
                  {selectedGroups.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Client Groups</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedGroups.map((group, index) => (
                          <Badge 
                            key={index}
                            className="px-2.5 py-1 text-xs"
                            style={{ 
                              backgroundColor: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--primaryColor)',
                              border: '1px solid var(--primaryColor)'
                            }}
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {clientNumber && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Client Number</Label>
                      <p className="text-sm font-medium font-mono">{clientNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Full Name</Label>
                    <p className="text-sm font-medium">{firstName} {lastName || '—'}</p>
                  </div>
                  {preferredName && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Preferred Name</Label>
                      <p className="text-sm font-medium">{preferredName}</p>
                    </div>
                  )}
                  {dob && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</Label>
                      <p className="text-sm font-medium">{dob}</p>
                    </div>
                  )}
                  {filingStatus && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Filing Status</Label>
                      <p className="text-sm font-medium capitalize">{filingStatus.replace('-', ' ')}</p>
                    </div>
                  )}
                  {profession && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Profession</Label>
                      <p className="text-sm font-medium">{profession}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Email</Label>
                    <p className="text-sm font-medium">{email || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Phone</Label>
                    <p className="text-sm font-medium">{phone || '—'}</p>
                  </div>
                  {address1 && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Address</Label>
                      <p className="text-sm font-medium">
                        {address1}
                        {address2 && <br />}
                        {address2}
                        {(city || state || postalCode) && <br />}
                        {city}{city && state && ', '}{state} {postalCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SSN Card */}
              {individualCardVisibility.ssn && ssn && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Social Security Number
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">SSN</Label>
                      <p className="text-sm font-medium font-mono">{ssn}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver's License Card */}
              {individualCardVisibility.drivingLicense && (dlNumber || dlFrontImage || dlBackImage) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Driver&apos;s License
                  </h3>
                  <div className="space-y-3">
                    {dlNumber && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">License Number</Label>
                        <p className="text-sm font-medium">{dlNumber}</p>
                      </div>
                    )}
                    {dlState && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Issued State</Label>
                        <p className="text-sm font-medium">{dlState}</p>
                      </div>
                    )}
                    {dlIssueDate && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Issue Date</Label>
                        <p className="text-sm font-medium">{dlIssueDate}</p>
                      </div>
                    )}
                    {dlExpirationDate && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Expiration Date</Label>
                        <p className="text-sm font-medium">{dlExpirationDate}</p>
                      </div>
                    )}
                    {(dlFrontImage || dlBackImage) && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">License Images</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {dlFrontImage && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Front</p>
                              <img src={dlFrontImage} alt="License Front" className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-700" />
                            </div>
                          )}
                          {dlBackImage && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Back</p>
                              <img src={dlBackImage} alt="License Back" className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-700" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Account Card */}
              {showBankAccount && (bankName || accountNumber) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Bank Account
                  </h3>
                  <div className="space-y-3">
                    {bankName && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Bank Name</Label>
                        <p className="text-sm font-medium">{bankName}</p>
                      </div>
                    )}
                    {accountNumber && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Account Number</Label>
                        <p className="text-sm font-medium font-mono">••••{accountNumber.slice(-4)}</p>
                      </div>
                    )}
                    {routingNumber && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Routing Number</Label>
                        <p className="text-sm font-medium font-mono">{routingNumber}</p>
                      </div>
                    )}
                    {accountType && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Account Type</Label>
                        <p className="text-sm font-medium capitalize">{accountType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services Card */}
              {selectedServices.size > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedServices).map(serviceId => {
                      const service = SERVICES.find(s => s.id === serviceId);
                      return (
                        <Badge key={serviceId} variant="secondary" className="text-xs">
                          {service?.label}
                        </Badge>
                      );
                    })}
                    {customServices.map(service => (
                      <Badge key={service.id} variant="secondary" className="text-xs">
                        {service.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Spouse Card */}
              {spouse && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Spouse Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Name</Label>
                      <p className="text-sm font-medium">{spouse.firstName} {spouse.lastName}</p>
                    </div>
                    {spouse.dateOfBirth && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</Label>
                        <p className="text-sm font-medium">{spouse.dateOfBirth}</p>
                      </div>
                    )}
                    {spouse.ssn && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">SSN</Label>
                        <p className="text-sm font-medium font-mono">{spouse.ssn}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dependents Card */}
              {dependents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Baby className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Children / Dependents ({dependents.length})
                  </h3>
                  <div className="space-y-3">
                    {dependents.map((dependent, index) => (
                      <div key={dependent.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm font-medium">{dependent.name}</p>
                        {dependent.dateOfBirth && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">DOB: {dependent.dateOfBirth}</p>
                        )}
                        {dependent.relationship && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{dependent.relationship}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Contacts Card */}
              {additionalContacts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Additional Contacts ({additionalContacts.length})
                  </h3>
                  <div className="space-y-3">
                    {additionalContacts.map((contact) => (
                      <div key={contact.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm font-medium">{contact.name}</p>
                        {contact.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</p>
                        )}
                        {contact.role && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.role}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referral Card */}
              {referredBy && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Referral
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Referred By</Label>
                      <p className="text-sm font-medium">{referredBy}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Business Client Cards */}
              {/* Client Organization */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Client Organization
                </h3>
                <div className="space-y-3">
                  {profilePhoto && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Profile Photo</Label>
                      <div className="mt-2">
                        <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                      </div>
                    </div>
                  )}
                  {selectedGroups.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Client Groups</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedGroups.map((group, index) => (
                          <Badge 
                            key={index}
                            className="px-2.5 py-1 text-xs"
                            style={{ 
                              backgroundColor: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--primaryColor)',
                              border: '1px solid var(--primaryColor)'
                            }}
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {clientNumber && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Client Number</Label>
                      <p className="text-sm font-medium font-mono">{clientNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Company Name</Label>
                    <p className="text-sm font-medium">{companyName || '—'}</p>
                  </div>
                  {dbaName && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">DBA Name</Label>
                      <p className="text-sm font-medium">{dbaName}</p>
                    </div>
                  )}
                  {entityType && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Entity Type</Label>
                      <p className="text-sm font-medium uppercase">{entityType}</p>
                    </div>
                  )}
                  {stateOfIncorporation && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">State of Incorporation</Label>
                      <p className="text-sm font-medium">{stateOfIncorporation}</p>
                    </div>
                  )}
                  {incorporationDate && (
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Incorporation Date</Label>
                      <p className="text-sm font-medium">{incorporationDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Contact */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Primary Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Name</Label>
                    <p className="text-sm font-medium">{ownerName || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Email</Label>
                    <p className="text-sm font-medium">{email || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Phone</Label>
                    <p className="text-sm font-medium">{phone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* EIN Card */}
              {businessCardVisibility.ein && ein && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Employer Identification Number
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">EIN</Label>
                      <p className="text-sm font-medium font-mono">{ein}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Card */}
              {showBankAccount && (bankName || accountNumber) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Bank Account
                  </h3>
                  <div className="space-y-3">
                    {bankName && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Bank Name</Label>
                        <p className="text-sm font-medium">{bankName}</p>
                      </div>
                    )}
                    {accountNumber && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Account Number</Label>
                        <p className="text-sm font-medium font-mono">••••{accountNumber.slice(-4)}</p>
                      </div>
                    )}
                    {routingNumber && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Routing Number</Label>
                        <p className="text-sm font-medium font-mono">{routingNumber}</p>
                      </div>
                    )}
                    {accountType && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Account Type</Label>
                        <p className="text-sm font-medium capitalize">{accountType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services Card */}
              {selectedServices.size > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedServices).map(serviceId => {
                      const service = SERVICES.find(s => s.id === serviceId);
                      return (
                        <Badge key={serviceId} variant="secondary" className="text-xs">
                          {service?.label}
                        </Badge>
                      );
                    })}
                    {customServices.map(service => (
                      <Badge key={service.id} variant="secondary" className="text-xs">
                        {service.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Contacts Card */}
              {additionalContacts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Additional Contacts ({additionalContacts.length})
                  </h3>
                  <div className="space-y-3">
                    {additionalContacts.map((contact) => (
                      <div key={contact.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm font-medium">{contact.name}</p>
                        {contact.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</p>
                        )}
                        {contact.role && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.role}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referral Card */}
              {referredBy && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Referral
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Referred By</Label>
                      <p className="text-sm font-medium">{referredBy}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Page Layout (no dialog wrapper)
  if (asPage) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Header with Breadcrumb */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => navigate('/clients')}
              className="hover:text-brand-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Clients
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{title || (mode === 'edit' ? 'Edit Profile' : 'Create New Client')}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl">{title || (mode === 'edit' ? 'Edit Profile' : 'Create New Client')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add a new client to your CRM system
              </p>
            </div>
          </div>

          {/* Step Navigation */}
          <StepNavigation
            steps={steps}
            currentStepId={currentStep}
            visitedStepIds={visitedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50 dark:bg-gray-900">
          {currentStep === 'basic' && renderBasicProfile()}
          {currentStep === 'identity' && (clientType === 'individual' ? renderIdentityIndividual() : renderIdentityBusiness())}
          {currentStep === 'financial' && renderFinancialServices()}
          {currentStep === 'additional' && renderAdditionalInfo()}
          {currentStep === 'demographics' && renderDemographics()}
          {currentStep === 'review' && renderReview()}
        </div>

        {/* Footer - Fixed */}
        <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'basic' || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {mode === 'edit' ? 'Save Changes' : 'Create Client'}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Client Groups Dialog */}
        <ManageClientGroupsDialog
          open={showClientGroupsDialog}
          onOpenChange={setShowClientGroupsDialog}
          client={{
            id: 'new-client',
            name: clientType === 'individual' 
              ? `${firstName || 'New'} ${lastName || 'Client'}`.trim()
              : companyName || 'New Client',
            type: clientType === 'individual' ? 'Individual' : 'Business',
            email: email || '',
            phone: phone || '',
            group: selectedGroups[0] || '',
            tags: selectedGroups.slice(1),
            status: 'lead'
          }}
          onSave={(groups) => {
            setSelectedGroups(groups);
            toast.success(`Client groups updated`);
          }}
        />
      </div>
    );
  }

  // Dialog Layout (original)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">{title || (mode === 'edit' ? 'Edit Profile' : 'Create New Client')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add a new client to your CRM system
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Navigation */}
          <StepNavigation
            steps={steps}
            currentStepId={currentStep}
            visitedStepIds={visitedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentStep === 'basic' && renderBasicProfile()}
          {currentStep === 'identity' && (clientType === 'individual' ? renderIdentityIndividual() : renderIdentityBusiness())}
          {currentStep === 'financial' && renderFinancialServices()}
          {currentStep === 'additional' && renderAdditionalInfo()}
          {currentStep === 'demographics' && renderDemographics()}
          {currentStep === 'review' && renderReview()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'basic' || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {mode === 'edit' ? 'Save Changes' : 'Create Client'}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Client Groups Dialog */}
      <ManageClientGroupsDialog
        open={showClientGroupsDialog}
        onOpenChange={setShowClientGroupsDialog}
        client={{
          id: 'new-client',
          name: clientType === 'individual' 
            ? `${firstName || 'New'} ${lastName || 'Client'}`.trim()
            : companyName || 'New Client',
          type: clientType === 'individual' ? 'Individual' : 'Business',
          email: email || '',
          phone: phone || '',
          group: selectedGroups[0] || '',
          tags: selectedGroups.slice(1),
          status: 'lead'
        }}
        onSave={(groups) => {
          setSelectedGroups(groups);
          toast.success(`Client groups updated`);
        }}
      />
    </div>
  );
}
