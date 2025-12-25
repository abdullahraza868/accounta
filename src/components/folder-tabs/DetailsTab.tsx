import { useState } from 'react';
import { Client } from '../../App';
import { 
  Building2, Mail, Phone, MapPin, User, Plus, Edit2, Save, X, 
  Trash2, CreditCard, FileText, Users, Calendar, Home, Briefcase,
  Shield, Globe, Camera, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

type DetailsTabProps = {
  client: Client;
};

type ContactType = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

type AddressType = {
  id: string;
  type: 'Home' | 'Business' | 'Mailing' | 'Other';
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
};

type BankInfoType = {
  id: string;
  bankName: string;
  bankNumber: string;
  routingNumber: string;
  accountType: 'Checking' | 'Savings' | 'Business Checking' | 'Business Savings';
};

export function DetailsTab({ client }: DetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for Individual clients
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: client.firstName || '',
    middleName: '',
    lastName: client.lastName || '',
    preferredName: '',
    email: client.email || '',
    phone: client.phone || '',
    dateOfBirth: '',
    ssn: '',
    
    // Business Info (for business clients)
    businessName: client.type === 'Business' ? client.name : '',
    ein: '',
    businessType: '',
    industry: '',
    yearEstablished: '',
    
    // Demographics
    profession: '',
    filingStatus: '',
    dlNumber: '',
    dlIssuedState: '',
    dlIssuedDate: '',
    dlExpirationDate: '',
    
    // Additional
    referredBy: '',
    clientGroup: client.group || '',
    assignedTo: client.assignedTo || '',
  });

  // Multiple contacts and addresses
  const [contacts, setContacts] = useState<ContactType[]>([
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      relationship: 'Spouse',
      email: 'jane@example.com',
      phone: '555-123-4567',
      isPrimary: false,
    }
  ]);

  const [addresses, setAddresses] = useState<AddressType[]>([
    {
      id: '1',
      type: 'Home',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isPrimary: true,
    }
  ]);

  const [bankInfo, setBankInfo] = useState<BankInfoType[]>([
    {
      id: '1',
      bankName: 'Chase Bank',
      bankNumber: '****1234',
      routingNumber: '021000021',
      accountType: 'Checking',
    }
  ]);

  const [dependents, setDependents] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    ssn: string;
  }>>([]);

  const addContact = () => {
    setContacts([...contacts, {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      relationship: '',
      email: '',
      phone: '',
      isPrimary: false,
    }]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const addAddress = () => {
    setAddresses([...addresses, {
      id: Date.now().toString(),
      type: 'Home',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      isPrimary: false,
    }]);
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const addBankAccount = () => {
    setBankInfo([...bankInfo, {
      id: Date.now().toString(),
      bankName: '',
      bankNumber: '',
      routingNumber: '',
      accountType: 'Checking',
    }]);
  };

  const removeBankAccount = (id: string) => {
    setBankInfo(bankInfo.filter(b => b.id !== id));
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

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  // VIEW MODE
  if (!isEditing) {
    return (
      <ScrollArea className="h-full">
        <div className="p-8">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-end mb-6">
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          </div>

          {/* Profile Header */}
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
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      {client.group}
                    </Badge>
                    {client.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} className="bg-white/20 text-white border-white/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
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
                </div>
              </div>
            </div>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Client Info */}
            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  {client.type === 'Business' ? 'Business Information' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {client.type === 'Individual' ? (
                  <>
                    <InfoRow label="Full Name" value={`${client.firstName} ${client.lastName}`} />
                    <InfoRow label="Preferred Name" value="-" />
                    <InfoRow label="Date of Birth" value="-" />
                    <InfoRow label="SSN" value="***-**-****" masked />
                    <InfoRow label="Profession" value="-" />
                  </>
                ) : (
                  <>
                    <InfoRow label="Business Name" value={client.name} />
                    <InfoRow label="Contact Person" value={`${client.firstName} ${client.lastName}`} />
                    <InfoRow label="EIN" value="**-*******" masked />
                    <InfoRow label="Business Type" value="-" />
                    <InfoRow label="Industry" value="-" />
                    <InfoRow label="Year Established" value="-" />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <InfoRow 
                  label="Primary Email" 
                  value={client.email}
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                />
                <InfoRow 
                  label="Primary Phone" 
                  value={client.phone}
                  icon={<Phone className="w-4 h-4 text-gray-400" />}
                />
                <Separator />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Assigned To
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                        {client.assignedTo.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{client.assignedTo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Addresses */}
          <Card className="mb-6 border-gray-200/60 shadow-lg">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-purple-600" />
                  Addresses
                </CardTitle>
                <Badge variant="outline">{addresses.length} Address{addresses.length !== 1 ? 'es' : ''}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={address.isPrimary ? 'bg-purple-100 text-purple-700' : ''}>
                            {address.type}
                          </Badge>
                          {address.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-900">
                          {address.address1}
                          {address.address2 && <>, {address.address2}</>}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                        {address.country !== 'USA' && (
                          <div className="text-sm text-gray-600">{address.country}</div>
                        )}
                      </div>
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No addresses added
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Other Contacts */}
          <Card className="mb-6 border-gray-200/60 shadow-lg">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Other Contacts
                </CardTitle>
                <Badge variant="outline">{contacts.length} Contact{contacts.length !== 1 ? 's' : ''}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{contact.relationship}</div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No additional contacts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two Column Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Bank Info */}
            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Bank Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {bankInfo.map((bank) => (
                  <div key={bank.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                    <InfoRow label="Bank Name" value={bank.bankName} />
                    <InfoRow label="Account Number" value={bank.bankNumber} masked />
                    <InfoRow label="Routing Number" value={bank.routingNumber} />
                    <InfoRow label="Account Type" value={bank.accountType} />
                  </div>
                ))}
                {bankInfo.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No bank accounts added
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <InfoRow label="DL Number" value="-" />
                <InfoRow label="DL Issued State" value="-" />
                <InfoRow label="DL Issued Date" value="-" />
                <InfoRow label="DL Expiration Date" value="-" />
                <InfoRow label="Filing Status" value="-" />
              </CardContent>
            </Card>
          </div>

          {/* Dependents (for Individual clients) */}
          {client.type === 'Individual' && (
            <Card className="mb-6 border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Dependents
                  </CardTitle>
                  <Badge variant="outline">{dependents.length} Dependent{dependents.length !== 1 ? 's' : ''}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {dependents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No dependents added
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dependents.map((dep) => (
                      <div key={dep.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{dep.name}</div>
                          <div className="text-sm text-gray-500">
                            {dep.relationship} • DOB: {dep.dateOfBirth || '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <InfoRow label="Group" value={client.group} />
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Service Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/60 shadow-lg">
              <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <InfoRow label="Referred By" value="-" />
                <InfoRow label="Client Number" value={`CL-${client.id.padStart(6, '0')}`} />
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // EDIT MODE
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        {/* Header with Save/Cancel */}
        <div className="flex items-center justify-end gap-2 mb-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-4 -mt-4">
          <Button 
            variant="outline"
            onClick={handleCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Profile Photo */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 text-2xl">
                    {client.type === 'Business' ? <Building2 className="w-10 h-10" /> : client.firstName[0] + client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Profile Photo</h4>
                <p className="text-sm text-gray-500 mb-3">Upload a professional photo</p>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              {client.type === 'Business' ? 'Business Information' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {client.type === 'Individual' ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-600">*</span></Label>
                  <Input 
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input 
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    placeholder="Middle Name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-600">*</span></Label>
                  <Input 
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input 
                    id="preferredName"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({...formData, preferredName: e.target.value})}
                    placeholder="Preferred Name"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ssn">SSN</Label>
                  <Input 
                    id="ssn"
                    value={formData.ssn}
                    onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                    placeholder="***-**-****"
                    type="password"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="profession">Profession</Label>
                  <Input 
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    placeholder="e.g. Software Engineer, Doctor"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="businessName">Business Name <span className="text-red-600">*</span></Label>
                  <Input 
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="ein">EIN</Label>
                  <Input 
                    id="ein"
                    value={formData.ein}
                    onChange={(e) => setFormData({...formData, ein: e.target.value})}
                    placeholder="**-*******"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(value) => setFormData({...formData, businessType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="scorp">S-Corp</SelectItem>
                      <SelectItem value="ccorp">C-Corp</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
                <div>
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input 
                    id="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={(e) => setFormData({...formData, yearEstablished: e.target.value})}
                    placeholder="YYYY"
                  />
                </div>
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <h4 className="font-medium text-gray-700 mb-4">Primary Contact Person</h4>
                </div>
                <div>
                  <Label htmlFor="contactFirstName">First Name</Label>
                  <Input 
                    id="contactFirstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactLastName">Last Name</Label>
                  <Input 
                    id="contactLastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last Name"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number <span className="text-red-600">*</span></Label>
                <Input 
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                Addresses
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addAddress}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {addresses.map((address, index) => (
                <div key={address.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Address {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAddress(address.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Address Type</Label>
                      <Select value={address.type} onValueChange={(value: any) => {
                        setAddresses(addresses.map(a => 
                          a.id === address.id ? {...a, type: value} : a
                        ));
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Mailing">Mailing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={address.isPrimary}
                          onChange={(e) => {
                            setAddresses(addresses.map(a => ({
                              ...a,
                              isPrimary: a.id === address.id ? e.target.checked : false
                            })));
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Set as primary</span>
                      </label>
                    </div>
                    <div className="col-span-2">
                      <Label>Address Line 1</Label>
                      <Input 
                        value={address.address1}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, address1: e.target.value} : a
                          ));
                        }}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Address Line 2</Label>
                      <Input 
                        value={address.address2}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, address2: e.target.value} : a
                          ));
                        }}
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input 
                        value={address.city}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, city: e.target.value} : a
                          ));
                        }}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input 
                        value={address.state}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, state: e.target.value} : a
                          ));
                        }}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input 
                        value={address.postalCode}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, postalCode: e.target.value} : a
                          ));
                        }}
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input 
                        value={address.country}
                        onChange={(e) => {
                          setAddresses(addresses.map(a => 
                            a.id === address.id ? {...a, country: e.target.value} : a
                          ));
                        }}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Contacts */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Other Contacts {client.type === 'Individual' && '(Spouse, Partner, etc.)'}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addContact}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeContact(contact.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input 
                        value={contact.firstName}
                        onChange={(e) => {
                          setContacts(contacts.map(c => 
                            c.id === contact.id ? {...c, firstName: e.target.value} : c
                          ));
                        }}
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input 
                        value={contact.lastName}
                        onChange={(e) => {
                          setContacts(contacts.map(c => 
                            c.id === contact.id ? {...c, lastName: e.target.value} : c
                          ));
                        }}
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Relationship</Label>
                      <Select 
                        value={contact.relationship}
                        onValueChange={(value) => {
                          setContacts(contacts.map(c => 
                            c.id === contact.id ? {...c, relationship: value} : c
                          ));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Business Partner">Business Partner</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                          <SelectItem value="Attorney">Attorney</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          setContacts(contacts.map(c => 
                            c.id === contact.id ? {...c, email: e.target.value} : c
                          ));
                        }}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          setContacts(contacts.map(c => 
                            c.id === contact.id ? {...c, phone: e.target.value} : c
                          ));
                        }}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Bank Information
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addBankAccount}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bank Account
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {bankInfo.map((bank, index) => (
                <div key={bank.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Account {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeBankAccount(bank.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Bank Name</Label>
                      <Input 
                        value={bank.bankName}
                        onChange={(e) => {
                          setBankInfo(bankInfo.map(b => 
                            b.id === bank.id ? {...b, bankName: e.target.value} : b
                          ));
                        }}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input 
                        value={bank.bankNumber}
                        onChange={(e) => {
                          setBankInfo(bankInfo.map(b => 
                            b.id === bank.id ? {...b, bankNumber: e.target.value} : b
                          ));
                        }}
                        placeholder="Account Number"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label>Routing Number</Label>
                      <Input 
                        value={bank.routingNumber}
                        onChange={(e) => {
                          setBankInfo(bankInfo.map(b => 
                            b.id === bank.id ? {...b, routingNumber: e.target.value} : b
                          ));
                        }}
                        placeholder="Routing Number"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Account Type</Label>
                      <Select 
                        value={bank.accountType}
                        onValueChange={(value: any) => {
                          setBankInfo(bankInfo.map(b => 
                            b.id === bank.id ? {...b, accountType: value} : b
                          ));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Checking">Checking</SelectItem>
                          <SelectItem value="Savings">Savings</SelectItem>
                          <SelectItem value="Business Checking">Business Checking</SelectItem>
                          <SelectItem value="Business Savings">Business Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card className="mb-6 border-gray-200/60 shadow-lg">
          <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dlNumber">Driver's License Number</Label>
                <Input 
                  id="dlNumber"
                  value={formData.dlNumber}
                  onChange={(e) => setFormData({...formData, dlNumber: e.target.value})}
                  placeholder="DL Number"
                />
              </div>
              <div>
                <Label htmlFor="dlIssuedState">DL Issued State</Label>
                <Input 
                  id="dlIssuedState"
                  value={formData.dlIssuedState}
                  onChange={(e) => setFormData({...formData, dlIssuedState: e.target.value})}
                  placeholder="e.g. CA, NY"
                />
              </div>
              <div>
                <Label htmlFor="dlIssuedDate">DL Issued Date</Label>
                <Input 
                  id="dlIssuedDate"
                  type="date"
                  value={formData.dlIssuedDate}
                  onChange={(e) => setFormData({...formData, dlIssuedDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dlExpirationDate">DL Expiration Date</Label>
                <Input 
                  id="dlExpirationDate"
                  type="date"
                  value={formData.dlExpirationDate}
                  onChange={(e) => setFormData({...formData, dlExpirationDate: e.target.value})}
                />
              </div>
              {client.type === 'Individual' && (
                <div className="col-span-2">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select value={formData.filingStatus} onValueChange={(value) => setFormData({...formData, filingStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                      <SelectItem value="hoh">Head of Household</SelectItem>
                      <SelectItem value="qualifying-widow">Qualifying Widow(er)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dependents (Individual only) */}
        {client.type === 'Individual' && (
          <Card className="mb-6 border-gray-200/60 shadow-lg">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Dependents
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addDependent}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dependent
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {dependents.map((dependent, index) => (
                  <div key={dependent.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Dependent {index + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeDependent(dependent.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Full Name</Label>
                        <Input 
                          value={dependent.name}
                          onChange={(e) => {
                            setDependents(dependents.map(d => 
                              d.id === dependent.id ? {...d, name: e.target.value} : d
                            ));
                          }}
                          placeholder="Full Name"
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select 
                          value={dependent.relationship}
                          onValueChange={(value) => {
                            setDependents(dependents.map(d => 
                              d.id === dependent.id ? {...d, relationship: value} : d
                            ));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Son">Son</SelectItem>
                            <SelectItem value="Daughter">Daughter</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input 
                          type="date"
                          value={dependent.dateOfBirth}
                          onChange={(e) => {
                            setDependents(dependents.map(d => 
                              d.id === dependent.id ? {...d, dateOfBirth: e.target.value} : d
                            ));
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>SSN</Label>
                        <Input 
                          value={dependent.ssn}
                          onChange={(e) => {
                            setDependents(dependents.map(d => 
                              d.id === dependent.id ? {...d, ssn: e.target.value} : d
                            ));
                          }}
                          placeholder="***-**-****"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="border-gray-200/60 shadow-lg">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Services & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="clientGroup">Client Group</Label>
                <Select value={formData.clientGroup} onValueChange={(value) => setFormData({...formData, clientGroup: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Fit-St Premium">Fit-St Premium</SelectItem>
                    <SelectItem value="FreeTrial">Free Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Brown">Mike Brown</SelectItem>
                    <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200/60 shadow-lg">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="referredBy">Referred By</Label>
                <Input 
                  id="referredBy"
                  value={formData.referredBy}
                  onChange={(e) => setFormData({...formData, referredBy: e.target.value})}
                  placeholder="Name or source"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save/Cancel Footer */}
        <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-4">
          <Button 
            variant="outline"
            onClick={handleCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

// Helper component for displaying info rows in view mode
function InfoRow({ 
  label, 
  value, 
  icon, 
  masked = false 
}: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode;
  masked?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className={`text-sm ${masked ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
        {value || '-'}
      </div>
    </div>
  );
}
