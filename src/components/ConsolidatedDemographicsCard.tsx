import { 
  User, Mail, Phone, MapPin, Calendar, Cake, Flag, GraduationCap, 
  Briefcase, FileText, Edit2, Save, X, Shield 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PhoneInput } from './ui/phone-input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

type DemographicsData = {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  suffix: string;
  profileImage: string;
  dateOfBirth: string;
  ssn: string;
  gender: string;
  maritalStatus: string;
  citizenship: string;
  // Professional
  filingStatus: string;
  profession: string;
  // Contact
  email: string;
  phone: string;
  alternatePhone: string;
  // Address
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type ConsolidatedDemographicsCardProps = {
  data: DemographicsData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (data: DemographicsData) => void;
  // SSN access control
  onRequestSSNView?: () => void;
  isSSNUnlocked?: boolean;
};

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function ConsolidatedDemographicsCard({
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onRequestSSNView,
  isSSNUnlocked,
}: ConsolidatedDemographicsCardProps) {
  const fullName = `${data.firstName}${data.middleName ? ' ' + data.middleName : ''} ${data.lastName}${data.suffix ? ' ' + data.suffix : ''}`;
  const age = calculateAge(data.dateOfBirth);

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Demographics</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2 text-xs gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={onSave} className="h-7 px-2 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!isEditing ? (
          // VIEW MODE
          <div className="p-4 space-y-4">
            {/* Profile Section with Image */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-purple-100 dark:border-purple-900">
                <AvatarImage src={data.profileImage} alt={fullName} />
                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {data.firstName[0]}{data.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {fullName}
                  {data.preferredName && data.preferredName !== data.firstName && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({data.preferredName})</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5" />
                    {new Date(data.dateOfBirth).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} ({age} yrs)
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {data.gender}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal & Professional Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-start gap-2">
                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400">SSN</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {isSSNUnlocked ? (data.ssn || 'Not provided') : (data.ssn ? `***-**-${data.ssn.slice(-4)}` : 'Not provided')}
                    </div>
                    {!isSSNUnlocked && data.ssn && onRequestSSNView && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onRequestSSNView}
                        className="h-6 px-2 text-xs gap-1 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Shield className="w-3 h-3" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <InfoItem icon={<Flag className="w-3.5 h-3.5" />} label="Marital Status" value={data.maritalStatus} />
              <InfoItem icon={<Flag className="w-3.5 h-3.5" />} label="Citizenship" value={data.citizenship} />
              <InfoItem icon={<FileText className="w-3.5 h-3.5" />} label="Filing Status" value={data.filingStatus} />
              <InfoItem icon={<Briefcase className="w-3.5 h-3.5" />} label="Profession" value={data.profession} />
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={data.email} />
                <InfoItem icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={data.phone} />
                {data.alternatePhone && (
                  <InfoItem icon={<Phone className="w-3.5 h-3.5" />} label="Alternate Phone" value={data.alternatePhone} />
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Address
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {data.address1}
                {data.address2 && <>, {data.address2}</>}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {data.city}, {data.state} {data.postalCode}
              </div>
            </div>
          </div>
        ) : (
          // EDIT MODE
          <div className="p-4 space-y-4">
            {/* Name Fields */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Personal Information</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs">First Name</Label>
                  <Input
                    id="firstName"
                    value={data.firstName}
                    onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="middleName" className="text-xs">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={data.middleName}
                    onChange={(e) => onChange({ ...data, middleName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                  <Input
                    id="lastName"
                    value={data.lastName}
                    onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="suffix" className="text-xs">Suffix</Label>
                  <Input
                    id="suffix"
                    value={data.suffix}
                    onChange={(e) => onChange({ ...data, suffix: e.target.value })}
                    placeholder="Jr., Sr., III"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="preferredName" className="text-xs">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    value={data.preferredName}
                    onChange={(e) => onChange({ ...data, preferredName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ssn" className="text-xs">Social Security Number (SSN)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="ssn"
                    value={isSSNUnlocked ? (data.ssn || '') : (data.ssn ? `***-**-${data.ssn.slice(-4)}` : '')}
                    onChange={(e) => onChange({ ...data, ssn: e.target.value })}
                    placeholder="XXX-XX-XXXX"
                    disabled={!isSSNUnlocked}
                    className="flex-1"
                  />
                  {!isSSNUnlocked && onRequestSSNView && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onRequestSSNView}
                      className="h-10 px-3 text-xs gap-1.5 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 whitespace-nowrap"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      View & Edit
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gender" className="text-xs">Gender</Label>
                  <Select value={data.gender} onValueChange={(val) => onChange({ ...data, gender: val })}>
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus" className="text-xs">Marital Status</Label>
                  <Select value={data.maritalStatus} onValueChange={(val) => onChange({ ...data, maritalStatus: val })}>
                    <SelectTrigger id="maritalStatus" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="citizenship" className="text-xs">Citizenship</Label>
                <Input
                  id="citizenship"
                  value={data.citizenship}
                  onChange={(e) => onChange({ ...data, citizenship: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Professional Information */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Professional</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="filingStatus" className="text-xs">Filing Status</Label>
                  <Select value={data.filingStatus} onValueChange={(val) => onChange({ ...data, filingStatus: val })}>
                    <SelectTrigger id="filingStatus" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married Filing Jointly">Married Filing Jointly</SelectItem>
                      <SelectItem value="Married Filing Separately">Married Filing Separately</SelectItem>
                      <SelectItem value="Head of Household">Head of Household</SelectItem>
                      <SelectItem value="Qualifying Widow(er)">Qualifying Widow(er)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profession" className="text-xs">Profession</Label>
                  <Input
                    id="profession"
                    value={data.profession}
                    onChange={(e) => onChange({ ...data, profession: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact</div>
              <div>
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ ...data, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone</Label>
                  <PhoneInput
                    id="phone"
                    value={data.phone}
                    onChange={(val) => onChange({ ...data, phone: val })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="altPhone" className="text-xs">Alternate Phone</Label>
                  <PhoneInput
                    id="altPhone"
                    value={data.alternatePhone}
                    onChange={(val) => onChange({ ...data, alternatePhone: val })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</div>
              <div>
                <Label htmlFor="address1" className="text-xs">Address Line 1</Label>
                <Input
                  id="address1"
                  value={data.address1}
                  onChange={(e) => onChange({ ...data, address1: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address2" className="text-xs">Address Line 2</Label>
                <Input
                  id="address2"
                  value={data.address2}
                  onChange={(e) => onChange({ ...data, address2: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-6 gap-2">
                <div className="col-span-3">
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={(e) => onChange({ ...data, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="state" className="text-xs">State</Label>
                  <Select value={data.state} onValueChange={(val) => onChange({ ...data, state: val })}>
                    <SelectTrigger id="state" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="postal" className="text-xs">ZIP Code</Label>
                  <Input
                    id="postal"
                    value={data.postalCode}
                    onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 dark:text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{value}</div>
      </div>
    </div>
  );
}