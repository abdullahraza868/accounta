import { useState } from 'react';
import { Client } from '../App';
import { 
  Building2, Mail, Phone, MapPin, User, Edit2, Save, X, Plus, Trash2,
  CreditCard, FileText, Users, Home, Briefcase, Globe, Camera, CheckCircle2, Settings, Eye, EyeOff, Calendar, Shield, IdCard, Baby, UserCircle, ScrollText, DollarSign, Scale, Link, ChevronDown, ChevronUp, Image as ImageIcon, Cake, Flag, GraduationCap, Search, Filter
} from 'lucide-react';
import { getServiceIcon } from './ServiceIcons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from './ui/utils';
import { PhoneInput } from './ui/phone-input';
import { toast } from 'sonner@2.0.3';
import { Switch } from './ui/switch';
import { ManageClientGroupsDialog } from './ManageClientGroupsDialog';
import { PasswordVerificationDialog } from './PasswordVerificationDialog';
import { ConsolidatedDemographicsCard } from './ConsolidatedDemographicsCard';
import { ConsolidatedBusinessDemographicsCard } from './ConsolidatedBusinessDemographicsCard';
import { useClientVisibility } from '../contexts/ClientVisibilityContext';
import { SSNCard } from './SSNCard';
import { EINCard } from './EINCard';
import { BankAccountCard } from './BankAccountCard';
import { DriverLicenseCard } from './DriverLicenseCard';
import { ServicesCard } from './ServicesCard';

type DemographicsViewProps = {
  client: Client;
  isReadOnly?: boolean;
  showSettings?: boolean;
  onSettingsToggle?: () => void;
  hideProfileHeader?: boolean;
};

type EditingCard = 
  // Individual cards
  | 'personalInfo'
  | 'demographics'
  | 'contactInfo'
  | 'drivingLicense'
  | 'bankAccount'
  | 'dependents'
  | 'otherContacts'
  | 'services'
  // Business cards
  | 'primaryContact'
  | 'companyInfo'
  | 'businessBankAccount'
  | 'withholdings'
  | 'licenses'
  | 'salesTaxAccounts'
  | 'businessOtherContacts'
  | 'businessServices'
  | null;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function DemographicsView({ 
  client, 
  isReadOnly = false, 
  showSettings = false, 
  onSettingsToggle,
  hideProfileHeader = false 
}: DemographicsViewProps) {
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  const [showGroupsDialog, setShowGroupsDialog] = useState(false);
  const [clientData, setClientData] = useState(client);
  
  // Password verification for sensitive fields
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingSensitiveField, setPendingSensitiveField] = useState<string | null>(null);
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [pendingPasswordReveal, setPendingPasswordReveal] = useState<string | null>(null);
  
  // Use global visibility settings from context
  const { 
    individualCardVisibility, 
    setIndividualCardVisibility,
    businessCardVisibility,
    setBusinessCardVisibility 
  } = useClientVisibility();

  // INDIVIDUAL CLIENT DATA
  // Consolidated Demographics (combines personal info, demographics, contact, address, professional)
  const [consolidatedDemographics, setConsolidatedDemographics] = useState({
    // Personal
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Smith',
    preferredName: 'Johnny',
    suffix: '',
    profileImage: 'https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NTI3OTY4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    dateOfBirth: '1985-06-15',
    ssn: '***-**-4567',
    gender: 'Male',
    maritalStatus: 'Married',
    citizenship: 'US Citizen',
    // Professional
    filingStatus: 'Married Filing Jointly',
    profession: 'Software Engineer',
    // Contact
    email: client.email || 'john.smith@example.com',
    phone: client.phone || '+15551234567',
    alternatePhone: '+15559876543',
    // Address
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  });

  // Keep old states for backward compatibility during transition
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Smith',
    preferredName: 'Johnny',
    suffix: '',
  });

  const [demographics, setDemographics] = useState({
    dateOfBirth: '1985-06-15',
    ssn: '***-**-4567',
    gender: 'Male',
    maritalStatus: 'Married',
    citizenship: 'US Citizen',
  });

  const [contactInfo, setContactInfo] = useState({
    email: client.email || 'john.smith@example.com',
    phone: client.phone || '+15551234567',
    alternatePhone: '+15559876543',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  });

  // Driving License Info
  const [drivingLicense, setDrivingLicense] = useState({
    dlNumber: 'D1234567',
    dlIssuedState: 'NY',
    dlIssuedDate: '2020-01-15',
    dlExpirationDate: '2028-01-15',
    dlFrontImage: 'https://images.unsplash.com/photo-1623795457659-f6b530b2e383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcml2ZXIlMjBsaWNlbnNlJTIwY2FyZHxlbnwxfHx8fDE3NjUyODcyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    dlBackImage: 'https://images.unsplash.com/photo-1554224311-beee4ece8c35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZCUyMGNhcmQlMjBiYWNrfGVufDB8fHx8MTczMzg1NDU1MXww&ixlib=rb-4.1.0&q=80&w=1080',
  });

  // Bank Account
  const [bankAccount, setBankAccount] = useState({
    bankName: 'Chase Bank',
    accountNumber: '****1234',
    routingNumber: '021000021',
    accountType: 'Checking',
  });

  // Children and Dependents
  const [dependents, setDependents] = useState([
    {
      id: '1',
      name: 'Emily Smith',
      relationship: 'Daughter',
      dateOfBirth: '2015-03-20',
      ssn: '***-**-7890',
    },
    {
      id: '2',
      name: 'Michael Smith Jr.',
      relationship: 'Son',
      dateOfBirth: '2018-09-10',
      ssn: '***-**-7891',
    }
  ]);

  // Other Contacts (Individual)
  const [otherContacts, setOtherContacts] = useState([
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      relationship: 'Spouse',
      email: 'jane.smith@example.com',
      phone: '+15551237890',
    }
  ]);

  // Services (Individual) - now only contains service list
  const [services, setServices] = useState({
    services: ['Tax', 'Bookkeeping', 'Payroll'],
  });

  // Available services list
  const availableServices = [
    'Tax',
    'Bookkeeping',
    'Payroll',
    'Advisory',
    'Cleanup',
    'Catch up',
    'Sales tax filing',
    'Year end tax'
  ];

  // BUSINESS CLIENT DATA
  // Consolidated Business Demographics
  const [consolidatedBusinessDemographics, setConsolidatedBusinessDemographics] = useState({
    // Primary Contact
    contactPerson: 'Robert Johnson',
    title: 'CEO',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzY1Mjk4MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    email: 'robert@acmecorp.com',
    phone: '+15551112222',
    alternatePhone: '+15553334444',
    // Company Information
    legalName: 'Acme Corporation Inc.',
    dbaName: 'Acme Corp',
    ein: '**-***7890',
    entityType: 'S-Corp',
    entityNumber: 'C3456789',
    stateOfIncorporation: 'DE',
    incorporationDate: '2015-03-15',
    businessStartDate: '2015-04-01',
    sosExpirationDate: '2025-03-15',
    industry: 'Technology',
    businessActivity: 'Software Development',
    totalEmployees: '25',
    fiscalYearEnd: '12/31',
    address1: '456 Business Blvd',
    address2: 'Suite 200',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA',
  });

  // Keep old states for backward compatibility
  const [primaryContact, setPrimaryContact] = useState({
    contactPerson: 'Robert Johnson',
    title: 'CEO',
    email: 'robert@acmecorp.com',
    phone: '+15551112222',
    alternatePhone: '+15553334444',
  });

  const [companyInfo, setCompanyInfo] = useState({
    legalName: 'Acme Corporation Inc.',
    dbaName: 'Acme Corp',
    ein: '**-***7890',
    entityType: 'S-Corp',
    entityNumber: 'C3456789',
    stateOfIncorporation: 'DE',
    incorporationDate: '2015-03-15',
    businessStartDate: '2015-04-01',
    sosExpirationDate: '2025-03-15',
    industry: 'Technology',
    businessActivity: 'Software Development',
    totalEmployees: '25',
    fiscalYearEnd: '12/31',
    address1: '456 Business Blvd',
    address2: 'Suite 200',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA',
  });

  // Business Bank Account
  const [businessBankAccount, setBusinessBankAccount] = useState({
    bankName: 'Wells Fargo Business',
    accountNumber: '****5678',
    routingNumber: '121000248',
    accountType: 'Business Checking',
  });

  // Withholdings
  const [withholdings, setWithholdings] = useState([
    {
      id: '1',
      name: 'California EDD',
      number: 'EDD-123-4567',
      state: 'CA',
    },
    {
      id: '2',
      name: 'IRS Federal',
      number: '98-7654321',
      state: 'NY',
    }
  ]);

  // Licenses
  const [licenses, setLicenses] = useState([
    {
      id: '1',
      type: 'Business License',
      number: 'BL-2023-456789',
      issuingState: 'CA',
      startDate: '2023-01-15',
      endDate: '2024-12-31',
    },
    {
      id: '2',
      type: 'Professional License',
      number: 'PL-CA-789012',
      issuingState: 'CA',
      startDate: '2022-06-01',
      endDate: '2025-05-31',
    }
  ]);

  // Sales Tax Accounts
  const [salesTaxAccounts, setSalesTaxAccounts] = useState([
    {
      id: '1',
      stateName: 'CA',
      accountNumber: 'SR-123-456789',
      password: '',
      validity: '2015-04-01',
    },
    {
      id: '2',
      stateName: 'NY',
      accountNumber: 'ST-987-654321',
      password: '',
      validity: '2018-09-15',
    }
  ]);

  // Other Contacts (Business)
  const [businessOtherContacts, setBusinessOtherContacts] = useState([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Williams',
      relationship: 'CFO',
      email: 'sarah@acmecorp.com',
      phone: '+15555556666',
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Davis',
      relationship: 'Accountant',
      email: 'michael@acmecorp.com',
      phone: '+15557778888',
    }
  ]);

  // Services (Business)
  const [businessServices, setBusinessServices] = useState({
    services: ['Payroll', 'Tax', 'Bookkeeping', 'Advisory'],
  });

  // Linked Accounts (Individual - Spouse)
  const [spouseAccount, setSpouseAccount] = useState(
    demographics.maritalStatus === 'Married' || demographics.maritalStatus === 'Married Filing Jointly'
      ? { id: 'CLI-2024-002', name: 'Jane M. Smith' }
      : null
  );

  // Linked Accounts (Business - Multiple Businesses with same email)
  const [linkedBusinessAccounts, setLinkedBusinessAccounts] = useState([
    { id: 'CLI-2024-101', name: 'Acme Real Estate LLC' },
    { id: 'CLI-2024-103', name: 'Acme Consulting Services Inc.' },
    { id: 'CLI-2024-108', name: 'Acme Properties Group' },
  ]);

  const handleSaveCard = (cardType: EditingCard) => {
    toast.success('Changes Saved', {
      description: `${getCardDisplayName(cardType)} has been updated successfully`,
    });
    setEditingCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  // Handler for requesting access to sensitive fields
  const handleRequestSensitiveFieldAccess = (fieldName: string, cardType: EditingCard) => {
    setPendingSensitiveField(fieldName);
    setShowPasswordDialog(true);
    // Store the card type we want to edit after verification
    sessionStorage.setItem('pendingCardEdit', cardType || '');
  };

  // Handler for successful password verification
  const handlePasswordVerified = () => {
    if (pendingSensitiveField) {
      setVerifiedFields(new Set([...verifiedFields, pendingSensitiveField]));
      toast.success('Access Granted', {
        description: 'You can now view and edit this sensitive information',
      });
      
      // Start editing the card after verification
      const pendingCard = sessionStorage.getItem('pendingCardEdit') as EditingCard;
      if (pendingCard) {
        setEditingCard(pendingCard);
        sessionStorage.removeItem('pendingCardEdit');
      }
    }
    
    // Handle password reveal
    if (pendingPasswordReveal) {
      setRevealedPasswords(new Set([...revealedPasswords, pendingPasswordReveal]));
      toast.success('Password Revealed', {
        description: 'You can now view the account password',
      });
    }
    
    setPendingSensitiveField(null);
    setPendingPasswordReveal(null);
  };

  // Check if a sensitive field is unlocked
  const isSensitiveFieldUnlocked = (fieldName: string): boolean => {
    return verifiedFields.has(fieldName);
  };

  // Get friendly name for sensitive fields
  const getSensitiveFieldDisplayName = (fieldName: string): string => {
    const fieldNames: Record<string, string> = {
      ssn: 'Social Security Number (SSN)',
      ein: 'Employer Identification Number (EIN)',
      bankAccount: 'Bank Account Details',
      businessBankAccount: 'Business Bank Account Details',
      dependents: 'Dependents SSN Information',
    };
    return fieldNames[fieldName] || 'sensitive information';
  };

  const getCardDisplayName = (cardType: EditingCard): string => {
    const cardNames: Record<string, string> = {
      personalInfo: 'Personal Information',
      demographics: 'Demographics',
      contactInfo: 'Contact Information',
      drivingLicense: 'Driving License Information',
      bankAccount: 'Bank Account Information',
      dependents: 'Children and Other Dependents',
      otherContacts: 'Other Contact Information',
      services: 'Services Availed',
      primaryContact: 'Primary Contact Information',
      companyInfo: 'Company Information',
      businessBankAccount: 'Bank Account Information',
      withholdings: 'Withholdings',
      licenses: 'Licenses',
      salesTaxAccounts: 'Sales Tax Accounts',
      businessOtherContacts: 'Other Contact Information',
      businessServices: 'Services Availed',
    };
    return cardNames[cardType || ''] || 'Information';
  };

  const addDependent = () => {
    setDependents([...dependents, {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      dateOfBirth: '',
      ssn: '',
    }]);
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const addOtherContact = () => {
    setOtherContacts([...otherContacts, {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      relationship: '',
      email: '',
      phone: '',
    }]);
  };

  const removeOtherContact = (id: string) => {
    setOtherContacts(otherContacts.filter(c => c.id !== id));
  };

  const addWithholding = () => {
    setWithholdings([...withholdings, {
      id: Date.now().toString(),
      name: '',
      number: '',
      state: '',
    }]);
  };

  const removeWithholding = (id: string) => {
    setWithholdings(withholdings.filter(w => w.id !== id));
  };

  const addLicense = () => {
    setLicenses([...licenses, {
      id: Date.now().toString(),
      type: '',
      number: '',
      issuingState: '',
      startDate: '',
      endDate: '',
    }]);
  };

  const removeLicense = (id: string) => {
    setLicenses(licenses.filter(l => l.id !== id));
  };

  const addSalesTaxAccount = () => {
    setSalesTaxAccounts([...salesTaxAccounts, {
      id: Date.now().toString(),
      stateName: '',
      accountNumber: '',
      password: '',
      validity: '',
    }]);
  };

  const removeSalesTaxAccount = (id: string) => {
    setSalesTaxAccounts(salesTaxAccounts.filter(s => s.id !== id));
  };

  const addBusinessOtherContact = () => {
    setBusinessOtherContacts([...businessOtherContacts, {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      relationship: '',
      email: '',
      phone: '',
    }]);
  };

  const removeBusinessOtherContact = (id: string) => {
    setBusinessOtherContacts(businessOtherContacts.filter(c => c.id !== id));
  };

  const handleSaveGroups = (groups: string[]) => {
    setClientData({
      ...clientData,
      group: groups[0] || '',
      tags: groups.slice(1)
    });
    console.log('Saving groups:', groups);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-4 border-purple-200 bg-purple-50/30 dark:bg-purple-900/20">
            <CardHeader className="border-b border-purple-200/50 dark:border-purple-700/50 pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100 text-sm">
                  <Eye className="w-4 h-4" />
                  Customize Visible Sections
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSettingsToggle?.()}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2.5">
                Toggle sections on/off based on the data you collect. Hidden sections won't appear in view or edit mode. <strong>This setting applies to all clients</strong> and will also affect what's visible in the client portal.
              </p>
              
              {client.type === 'Individual' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  <CardToggle 
                    label="Driver's License" 
                    enabled={individualCardVisibility.drivingLicense}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, drivingLicense: val})}
                  />
                  <CardToggle 
                    label="SSN" 
                    enabled={individualCardVisibility.ssn}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, ssn: val})}
                  />
                  <CardToggle 
                    label="Bank Account" 
                    enabled={individualCardVisibility.bankAccount}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, bankAccount: val})}
                  />
                  <CardToggle 
                    label="Children & Dependents" 
                    enabled={individualCardVisibility.dependents}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, dependents: val})}
                  />
                  <CardToggle 
                    label="Other Contacts" 
                    enabled={individualCardVisibility.otherContacts}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, otherContacts: val})}
                  />
                  <CardToggle 
                    label="Services" 
                    enabled={individualCardVisibility.services}
                    onChange={(val) => setIndividualCardVisibility({...individualCardVisibility, services: val})}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  <CardToggle 
                    label="EIN" 
                    enabled={businessCardVisibility.ein}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, ein: val})}
                  />
                  <CardToggle 
                    label="Bank Account" 
                    enabled={businessCardVisibility.businessBankAccount}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, businessBankAccount: val})}
                  />
                  <CardToggle 
                    label="Withholdings" 
                    enabled={businessCardVisibility.withholdings}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, withholdings: val})}
                  />
                  <CardToggle 
                    label="Licenses" 
                    enabled={businessCardVisibility.licenses}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, licenses: val})}
                  />
                  <CardToggle 
                    label="Sales Tax Accounts" 
                    enabled={businessCardVisibility.salesTaxAccounts}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, salesTaxAccounts: val})}
                  />
                  <CardToggle 
                    label="Other Contacts" 
                    enabled={businessCardVisibility.businessOtherContacts}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, businessOtherContacts: val})}
                  />
                  <CardToggle 
                    label="Services" 
                    enabled={businessCardVisibility.businessServices}
                    onChange={(val) => setBusinessCardVisibility({...businessCardVisibility, businessServices: val})}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Profile Header */}
        {!hideProfileHeader && (
          <Card className="mb-6 border-gray-200/60 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-white/20 shadow-xl">
                  <AvatarFallback className="bg-white/20 text-white">
                    {client.type === 'Business' ? <Building2 className="w-7 h-7" /> : client.firstName[0] + client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{client.name}</h3>
                  <p className="text-white/80 text-sm mt-0.5">
                    {client.type === 'Business' ? 'Business Client' : 'Individual Client'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {clientData.group && (
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        {clientData.group}
                      </Badge>
                    )}
                    {clientData.tags && clientData.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} className="bg-white/20 text-white border-white/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {!isReadOnly && (
                      <button 
                        onClick={() => setShowGroupsDialog(true)}
                        className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs uppercase tracking-wide">Client Since</div>
                  <div className="text-white font-medium mt-1 text-sm">
                    {new Date(client.createdDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-white/60 text-xs uppercase tracking-wide mt-3">Client No.</div>
                  <div className="text-white font-medium mt-1 text-sm">
                    {client.id}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* INDIVIDUAL CLIENT CARDS */}
        {client.type === 'Individual' && (
          <div className="grid grid-cols-2 gap-4">
              {/* Consolidated Demographics Card - Spans full width - ALWAYS VISIBLE */}
              <div className="col-span-2">
                  <ConsolidatedDemographicsCard
                    data={consolidatedDemographics}
                    isEditing={!isReadOnly && editingCard === 'demographics'}
                    onEdit={() => !isReadOnly && setEditingCard(editingCard === 'demographics' ? null : 'demographics')}
                    onSave={() => handleSaveCard('demographics')}
                    onCancel={handleCancelEdit}
                    onChange={setConsolidatedDemographics}
                    onRequestSSNView={() => handleRequestSensitiveFieldAccess('ssn', 'demographics')}
                    isSSNUnlocked={isSensitiveFieldUnlocked('ssn')}
                  />
                </div>

              {/* Other Contact Information Card */}
              {individualCardVisibility.otherContacts && (
                <DemographicCard
                  title="Other Contact Information"
                  icon={<Users className="w-4 h-4 text-purple-600" />}
                  badge={otherContacts.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'otherContacts'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'otherContacts' ? null : 'otherContacts')}
                  onSave={() => handleSaveCard('otherContacts')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {otherContacts.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No contacts added
                        </div>
                      ) : (
                        otherContacts.map((contact) => (
                          <div key={contact.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-9 h-9 flex-shrink-0">
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{contact.relationship}</div>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                                    <Mail className="w-3 h-3 flex-shrink-0" /> {contact.email}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3 flex-shrink-0" /> {contact.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {otherContacts.map((contact, index) => (
                        <div key={contact.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Contact #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOtherContact(contact.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="First Name"
                              value={contact.firstName}
                              onChange={(e) => {
                                const updated = [...otherContacts];
                                updated[index].firstName = e.target.value;
                                setOtherContacts(updated);
                              }}
                            />
                            <Input
                              placeholder="Last Name"
                              value={contact.lastName}
                              onChange={(e) => {
                                const updated = [...otherContacts];
                                updated[index].lastName = e.target.value;
                                setOtherContacts(updated);
                              }}
                            />
                          </div>
                          <Input
                            placeholder="Relationship"
                            value={contact.relationship}
                            onChange={(e) => {
                              const updated = [...otherContacts];
                              updated[index].relationship = e.target.value;
                              setOtherContacts(updated);
                            }}
                          />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={contact.email}
                            onChange={(e) => {
                              const updated = [...otherContacts];
                              updated[index].email = e.target.value;
                              setOtherContacts(updated);
                            }}
                          />
                          <PhoneInput
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={(val) => {
                              const updated = [...otherContacts];
                              updated[index].phone = val;
                              setOtherContacts(updated);
                            }}
                          />
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOtherContact}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Contact
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Driving License Card - New Version */}
              {individualCardVisibility.drivingLicense && (
                <DriverLicenseCard
                  data={drivingLicense}
                  isEditing={!isReadOnly && editingCard === 'drivingLicense'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'drivingLicense' ? null : 'drivingLicense')}
                  onSave={() => handleSaveCard('drivingLicense')}
                  onCancel={handleCancelEdit}
                  onChange={setDrivingLicense}
                />
              )}

              {/* Bank Account Card - New Version */}
              {individualCardVisibility.bankAccount && (
                <BankAccountCard
                  data={bankAccount}
                  isEditing={!isReadOnly && editingCard === 'bankAccount'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'bankAccount' ? null : 'bankAccount')}
                  onSave={() => handleSaveCard('bankAccount')}
                  onCancel={handleCancelEdit}
                  onChange={setBankAccount}
                  onRequestView={() => handleRequestSensitiveFieldAccess('bankAccount', 'bankAccount')}
                  isUnlocked={isSensitiveFieldUnlocked('bankAccount')}
                />
              )}

              {/* Services Card - New Visual Version */}
              {individualCardVisibility.services && (
                <ServicesCard
                  services={services.services}
                  availableServices={availableServices}
                  onToggleService={(service) => {
                    const isActive = services.services.includes(service);
                    if (isActive) {
                      setServices({ services: services.services.filter(s => s !== service) });
                    } else {
                      setServices({ services: [...services.services, service] });
                    }
                  }}
                />
              )}

              {/* Children and Dependents Card */}
              {individualCardVisibility.dependents && (
                <DemographicCard
                  title="Children and Other Dependents"
                  icon={<Baby className="w-4 h-4 text-purple-600" />}
                  badge={dependents.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'dependents'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'dependents' ? null : 'dependents')}
                  onSave={() => handleSaveCard('dependents')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {dependents.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No dependents added
                        </div>
                      ) : (
                        dependents.map((dep) => (
                          <div key={dep.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{dep.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {dep.relationship} • DOB: {dep.dateOfBirth}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                              SSN: {dep.ssn}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {dependents.map((dependent, index) => (
                        <div key={dependent.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Dependent #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDependent(dependent.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Full Name"
                              value={dependent.name}
                              onChange={(e) => {
                                const updated = [...dependents];
                                updated[index].name = e.target.value;
                                setDependents(updated);
                              }}
                            />
                            <Input
                              placeholder="Relationship"
                              value={dependent.relationship}
                              onChange={(e) => {
                                const updated = [...dependents];
                                updated[index].relationship = e.target.value;
                                setDependents(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              placeholder="Date of Birth"
                              value={dependent.dateOfBirth}
                              onChange={(e) => {
                                const updated = [...dependents];
                                updated[index].dateOfBirth = e.target.value;
                                setDependents(updated);
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="SSN"
                                value={isSensitiveFieldUnlocked('dependents') ? dependent.ssn : dependent.ssn}
                                onChange={(e) => {
                                  const updated = [...dependents];
                                  updated[index].ssn = e.target.value;
                                  setDependents(updated);
                                }}
                                disabled={!isSensitiveFieldUnlocked('dependents')}
                                className="flex-1"
                              />
                              {!isSensitiveFieldUnlocked('dependents') && index === 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRequestSensitiveFieldAccess('dependents', 'dependents')}
                                  className="h-10 px-3 text-xs gap-1.5 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 whitespace-nowrap"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  View & Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addDependent}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Dependent
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Linked Accounts Card (Individual - Spouse) */}
              <LinkedAccountsCard 
                clientType="Individual"
                spouseAccount={spouseAccount}
                linkedBusinessAccounts={[]}
              />
          </div>
        )}

        {/* BUSINESS CLIENT CARDS */}
        {client.type === 'Business' && (
          <div className="grid grid-cols-2 gap-4">
              {/* Consolidated Business Demographics Card - Spans full width - ALWAYS VISIBLE */}
              <div className="col-span-2">
                <ConsolidatedBusinessDemographicsCard
                    data={consolidatedBusinessDemographics}
                    isEditing={!isReadOnly && editingCard === 'companyInfo'}
                    onEdit={() => !isReadOnly && setEditingCard(editingCard === 'companyInfo' ? null : 'companyInfo')}
                    onSave={() => handleSaveCard('companyInfo')}
                    onCancel={handleCancelEdit}
                    onChange={setConsolidatedBusinessDemographics}
                    onRequestEINView={() => handleRequestSensitiveFieldAccess('ein', 'companyInfo')}
                    isEINUnlocked={isSensitiveFieldUnlocked('ein')}
                  />
                </div>

              {/* Business Other Contact Information Card */}
              {businessCardVisibility.businessOtherContacts && (
                <DemographicCard
                  title="Other Contact Information"
                  icon={<Users className="w-4 h-4 text-purple-600" />}
                  badge={businessOtherContacts.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'businessOtherContacts'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'businessOtherContacts' ? null : 'businessOtherContacts')}
                  onSave={() => handleSaveCard('businessOtherContacts')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {businessOtherContacts.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No contacts added
                        </div>
                      ) : (
                        businessOtherContacts.map((contact) => (
                          <div key={contact.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-9 h-9 flex-shrink-0">
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{contact.relationship}</div>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                                    <Mail className="w-3 h-3 flex-shrink-0" /> {contact.email}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3 flex-shrink-0" /> {(() => {
                                      const phone = contact.phone.replace(/^\+1\s*/, '').replace(/\D/g, '');
                                      if (phone.length === 10) {
                                        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                                      }
                                      return contact.phone;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {businessOtherContacts.map((contact, index) => (
                        <div key={contact.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Contact #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBusinessOtherContact(contact.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="First Name"
                              value={contact.firstName}
                              onChange={(e) => {
                                const updated = [...businessOtherContacts];
                                updated[index].firstName = e.target.value;
                                setBusinessOtherContacts(updated);
                              }}
                            />
                            <Input
                              placeholder="Last Name"
                              value={contact.lastName}
                              onChange={(e) => {
                                const updated = [...businessOtherContacts];
                                updated[index].lastName = e.target.value;
                                setBusinessOtherContacts(updated);
                              }}
                            />
                          </div>
                          <Input
                            placeholder="Role/Title"
                            value={contact.relationship}
                            onChange={(e) => {
                              const updated = [...businessOtherContacts];
                              updated[index].relationship = e.target.value;
                              setBusinessOtherContacts(updated);
                            }}
                          />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={contact.email}
                            onChange={(e) => {
                              const updated = [...businessOtherContacts];
                              updated[index].email = e.target.value;
                              setBusinessOtherContacts(updated);
                            }}
                          />
                          <PhoneInput
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={(val) => {
                              const updated = [...businessOtherContacts];
                              updated[index].phone = val;
                              setBusinessOtherContacts(updated);
                            }}
                          />
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addBusinessOtherContact}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Contact
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Business Bank Account Card */}
              {businessCardVisibility.businessBankAccount && (
                <BankAccountCard
                  data={businessBankAccount}
                  isEditing={!isReadOnly && editingCard === 'businessBankAccount'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'businessBankAccount' ? null : 'businessBankAccount')}
                  onSave={() => handleSaveCard('businessBankAccount')}
                  onCancel={handleCancelEdit}
                  onChange={setBusinessBankAccount}
                  onRequestView={() => handleRequestSensitiveFieldAccess('businessBankAccount', 'businessBankAccount')}
                  isUnlocked={isSensitiveFieldUnlocked('businessBankAccount')}
                />
              )}

              {/* Withholdings Card */}
              {businessCardVisibility.withholdings && (
                <DemographicCard
                  title="Withholdings"
                  icon={<DollarSign className="w-4 h-4 text-purple-600" />}
                  badge={withholdings.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'withholdings'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'withholdings' ? null : 'withholdings')}
                  onSave={() => handleSaveCard('withholdings')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {withholdings.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No withholdings added
                        </div>
                      ) : (
                        withholdings.map((withholding) => (
                          <div key={withholding.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{withholding.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Account: {withholding.number} • State: {withholding.state}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {withholdings.map((withholding, index) => (
                        <div key={withholding.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Withholding #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWithholding(withholding.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <Input
                            placeholder="Agency Name"
                            value={withholding.name}
                            onChange={(e) => {
                              const updated = [...withholdings];
                              updated[index].name = e.target.value;
                              setWithholdings(updated);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Account Number"
                              value={withholding.number}
                              onChange={(e) => {
                                const updated = [...withholdings];
                                updated[index].number = e.target.value;
                                setWithholdings(updated);
                              }}
                            />
                            <Select 
                              value={withholding.state} 
                              onValueChange={(val) => {
                                const updated = [...withholdings];
                                updated[index].state = val;
                                setWithholdings(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addWithholding}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Withholding
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Licenses Card */}
              {businessCardVisibility.licenses && (
                <DemographicCard
                  title="Licenses"
                  icon={<ScrollText className="w-4 h-4 text-purple-600" />}
                  badge={licenses.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'licenses'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'licenses' ? null : 'licenses')}
                  onSave={() => handleSaveCard('licenses')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {licenses.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No licenses added
                        </div>
                      ) : (
                        licenses.map((license) => (
                          <div key={license.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{license.type}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Number: {license.number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              State: {license.issuingState} • Valid: {license.startDate} - {license.endDate}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {licenses.map((license, index) => (
                        <div key={license.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">License #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLicense(license.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <Input
                            placeholder="License Type"
                            value={license.type}
                            onChange={(e) => {
                              const updated = [...licenses];
                              updated[index].type = e.target.value;
                              setLicenses(updated);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="License Number"
                              value={license.number}
                              onChange={(e) => {
                                const updated = [...licenses];
                                updated[index].number = e.target.value;
                                setLicenses(updated);
                              }}
                            />
                            <Select 
                              value={license.issuingState} 
                              onValueChange={(val) => {
                                const updated = [...licenses];
                                updated[index].issuingState = val;
                                setLicenses(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Issuing State" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="date"
                              placeholder="License Start Date"
                              value={license.startDate}
                              onChange={(e) => {
                                const updated = [...licenses];
                                updated[index].startDate = e.target.value;
                                setLicenses(updated);
                              }}
                            />
                            <Input
                              type="date"
                              placeholder="License End Date"
                              value={license.endDate}
                              onChange={(e) => {
                                const updated = [...licenses];
                                updated[index].endDate = e.target.value;
                                setLicenses(updated);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addLicense}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add License
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Sales Tax Accounts Card */}
              {businessCardVisibility.salesTaxAccounts && (
                <DemographicCard
                  title="Sales Tax Accounts"
                  icon={<Scale className="w-4 h-4 text-purple-600" />}
                  badge={salesTaxAccounts.length.toString()}
                  isEditing={!isReadOnly && editingCard === 'salesTaxAccounts'}
                  onEdit={() => !isReadOnly && setEditingCard(editingCard === 'salesTaxAccounts' ? null : 'salesTaxAccounts')}
                  onSave={() => handleSaveCard('salesTaxAccounts')}
                  onCancel={handleCancelEdit}
                  viewContent={
                    <div className="space-y-3">
                      {salesTaxAccounts.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          No sales tax accounts added
                        </div>
                      ) : (
                        salesTaxAccounts.map((account) => (
                          <div key={account.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{account.stateName} Sales Tax</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Account: {account.accountNumber}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Validity: {account.validity}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  editContent={
                    <div className="space-y-4">
                      {salesTaxAccounts.map((account, index) => (
                        <div key={account.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Account #{index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSalesTaxAccount(account.id)}
                              className="h-7 px-2 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Select 
                              value={account.stateName} 
                              onValueChange={(val) => {
                                const updated = [...salesTaxAccounts];
                                updated[index].stateName = val;
                                setSalesTaxAccounts(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="State Name" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Account No."
                              value={account.accountNumber}
                              onChange={(e) => {
                                const updated = [...salesTaxAccounts];
                                updated[index].accountNumber = e.target.value;
                                setSalesTaxAccounts(updated);
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Input
                                type={revealedPasswords.has(`sales-tax-${account.id}`) ? "text" : "password"}
                                placeholder="Account Password"
                                value={account.password}
                                onChange={(e) => {
                                  const updated = [...salesTaxAccounts];
                                  updated[index].password = e.target.value;
                                  setSalesTaxAccounts(updated);
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => {
                                  const fieldId = `sales-tax-${account.id}`;
                                  if (revealedPasswords.has(fieldId)) {
                                    // Hide password
                                    setRevealedPasswords(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(fieldId);
                                      return newSet;
                                    });
                                  } else {
                                    // Request password to reveal
                                    setPendingPasswordReveal(fieldId);
                                    setShowPasswordDialog(true);
                                  }
                                }}
                              >
                                {revealedPasswords.has(`sales-tax-${account.id}`) ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                            <Input
                              type="date"
                              placeholder="Sales Tax Account Validity"
                              value={account.validity}
                              onChange={(e) => {
                                const updated = [...salesTaxAccounts];
                                updated[index].validity = e.target.value;
                                setSalesTaxAccounts(updated);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSalesTaxAccount}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Sales Tax Account
                      </Button>
                    </div>
                  }
                />
              )}

              {/* Business Services Card - New Visual Version */}
              {businessCardVisibility.businessServices && (
                <ServicesCard
                  services={businessServices.services}
                  availableServices={availableServices}
                  onToggleService={(service) => {
                    const isActive = businessServices.services.includes(service);
                    if (isActive) {
                      setBusinessServices({ services: businessServices.services.filter(s => s !== service) });
                    } else {
                      setBusinessServices({ services: [...businessServices.services, service] });
                    }
                  }}
                />
              )}

              {/* Linked Accounts Card (Business - Multiple Businesses) */}
              <LinkedAccountsCard 
                clientType="Business"
                spouseAccount={null}
                linkedBusinessAccounts={linkedBusinessAccounts}
              />
          </div>
        )}
      </div>

      {/* Manage Client Groups Dialog */}
      {!isReadOnly && (
        <ManageClientGroupsDialog
          open={showGroupsDialog}
          onOpenChange={setShowGroupsDialog}
          client={clientData}
          onSave={handleSaveGroups}
        />
      )}

      {/* Password Verification Dialog */}
      <PasswordVerificationDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onVerify={handlePasswordVerified}
        fieldName={getSensitiveFieldDisplayName(pendingSensitiveField || '')}
      />
    </div>
  );
}

// Reusable Card Component
function DemographicCard({
  title,
  icon,
  badge,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  viewContent,
  editContent,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  viewContent: React.ReactNode;
  editContent: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200/60 shadow-lg">
      <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            {icon}
            {title}
            {badge && <Badge variant="outline" className="text-xs ml-1">{badge}</Badge>}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 px-2 text-xs gap-1.5"
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isEditing ? (
          <div className="space-y-4">
            {editContent}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                className="flex-1 bg-gradient-to-br from-purple-600 to-purple-700"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          viewContent
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for card visibility toggles
function CardToggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!enabled)}
      className={cn(
        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all",
        enabled 
          ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600" 
          : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 opacity-50"
      )}
    >
      <div className="flex items-center gap-1.5">
        {enabled ? (
          <Eye className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={(val) => {
          // Prevent event bubbling since parent div already handles click
          onChange(val);
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// Helper component for linked accounts card
function LinkedAccountsCard({ 
  clientType, 
  spouseAccount, 
  linkedBusinessAccounts 
}: { 
  clientType: string;
  spouseAccount: { id: string; name: string } | null;
  linkedBusinessAccounts: { id: string; name: string }[];
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [localSpouseAccount, setLocalSpouseAccount] = useState(spouseAccount);
  const [localBusinessAccounts, setLocalBusinessAccounts] = useState(linkedBusinessAccounts);

  // Mock data - all accounts in the system
  const allAccounts = [
    { id: 'IND-001', name: 'John Smith', type: 'Individual' },
    { id: 'IND-002', name: 'Jane Doe', type: 'Individual' },
    { id: 'IND-003', name: 'Robert Johnson', type: 'Individual' },
    { id: 'IND-004', name: 'Sarah Williams', type: 'Individual' },
    { id: 'BUS-001', name: 'Acme Corporation Inc.', type: 'Business' },
    { id: 'BUS-002', name: 'Tech Solutions LLC', type: 'Business' },
    { id: 'BUS-003', name: 'Global Enterprises', type: 'Business' },
    { id: 'BUS-004', name: 'Innovate Industries', type: 'Business' },
    { id: 'BUS-005', name: 'Prime Partners LLP', type: 'Business' },
  ];

  // Calculate counts for filter pills
  const getAvailableAccounts = (filter: 'all' | 'Individual' | 'Business') => {
    return allAccounts.filter(account => {
      const typeMatch = filter === 'all' || account.type === filter;
      const notLinked = clientType === 'Individual'
        ? !localSpouseAccount || account.id !== localSpouseAccount.id
        : !localBusinessAccounts.find(a => a.id !== account.id);
      return typeMatch && notLinked;
    });
  };

  const allCount = getAvailableAccounts('all').length;
  const individualCount = getAvailableAccounts('Individual').length;
  const businessCount = getAvailableAccounts('Business').length;

  const hasLinkedAccounts = clientType === 'Individual' 
    ? localSpouseAccount !== null 
    : localBusinessAccounts.length > 0;

  const handleNavigate = (clientId: string) => {
    toast.info('Navigation', {
      description: `Navigating to client ${clientId}...`
    });
  };

  const handleAddAccount = (account: typeof allAccounts[0]) => {
    if (clientType === 'Individual') {
      setLocalSpouseAccount({ id: account.id, name: account.name });
      toast.success('Linked Account Added', {
        description: `${account.name} has been linked as spouse account.`
      });
    } else {
      if (!localBusinessAccounts.find(a => a.id !== account.id)) {
        setLocalBusinessAccounts([...localBusinessAccounts, { id: account.id, name: account.name }]);
        toast.success('Linked Account Added', {
          description: `${account.name} has been linked.`
        });
      }
    }
    setShowAddDialog(false);
    setSearchQuery('');
    setAccountTypeFilter('all');
  };

  const handleRemoveAccount = (accountId: string) => {
    if (clientType === 'Individual') {
      setLocalSpouseAccount(null);
      toast.success('Linked Account Removed', {
        description: 'Spouse account has been unlinked.'
      });
    } else {
      setLocalBusinessAccounts(localBusinessAccounts.filter(a => a.id !== accountId));
      toast.success('Linked Account Removed', {
        description: 'Business account has been unlinked.'
      });
    }
  };

  // Filter accounts based on type filter and search query
  const availableAccounts = allAccounts.filter(account => {
    // Type filter from pills
    const typeMatch = accountTypeFilter === 'all' || account.type === accountTypeFilter;
    
    // Don't show accounts that are already linked
    const notLinked = clientType === 'Individual'
      ? !localSpouseAccount || account.id !== localSpouseAccount.id
      : !localBusinessAccounts.find(a => a.id !== account.id);
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && notLinked && searchMatch;
  });

  return (
    <>
      <Card className="border-gray-200/60 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Link className="w-4 h-4 text-purple-600" />
              Linked Accounts
            </CardTitle>
            <div className="flex items-center gap-2">
              {clientType === 'Business' && localBusinessAccounts.length > 0 && (
                <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {localBusinessAccounts.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="h-7 px-2 text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!hasLinkedAccounts ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Link className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>No linked accounts</div>
              <div className="text-xs mt-1">
                {clientType === 'Individual' 
                  ? 'Link spouse account to connect related information'
                  : 'Link business accounts to connect related entities'}
              </div>
            </div>
          ) : (
            <>
              {clientType === 'Individual' && localSpouseAccount ? (
                <div className="relative group">
                  <div 
                    onClick={() => handleNavigate(localSpouseAccount.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                          {localSpouseAccount.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{localSpouseAccount.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Spouse Account</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAccount(localSpouseAccount.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 transition-opacity flex items-center gap-1 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Unlink</span>
                      </button>
                      <div className="text-purple-600">
                        <ChevronUp className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {localBusinessAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="relative group"
                    >
                      <div
                        onClick={() => handleNavigate(account.id)}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{account.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAccount(account.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 transition-opacity flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Unlink</span>
                          </button>
                          <div className="text-purple-600">
                            <ChevronUp className="w-4 h-4 rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" aria-describedby="add-linked-account-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-600" />
                Add Linked Account
              </DialogTitle>
              <DialogDescription id="add-linked-account-description">
                Search and select accounts to link to this client
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Client Type Filter Pills */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAccountTypeFilter('all')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'all'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  All ({allCount})
                </button>
                <button
                  onClick={() => setAccountTypeFilter('Individual')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'Individual'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Individual ({individualCount})
                </button>
                <button
                  onClick={() => setAccountTypeFilter('Business')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'Business'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Business ({businessCount})
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {availableAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div>No accounts found</div>
                    <div className="text-xs mt-1">Try adjusting your search or filters</div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {availableAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleAddAccount(account)}
                        className="flex items-center justify-between p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {account.type === 'Individual' ? (
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                {account.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{account.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{account.id}</span>
                              <span>•</span>
                              <span>{account.type}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Link Account
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}


