import { 
  Building2, Mail, Phone, MapPin, Calendar, User, 
  Briefcase, Edit2, Save, X, Hash, Flag, Shield, CheckCircle2 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PhoneInput } from './ui/phone-input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { VerificationCodeInput } from './ui/verification-code-input';
import { useState } from 'react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

type BusinessDemographicsData = {
  // Primary Contact
  contactPerson: string;
  title: string;
  profileImage: string;
  email: string;
  phone: string;
  phoneVerified?: boolean;
  alternatePhone: string;
  // Company Information
  legalName: string;
  dbaName: string;
  ein: string;
  entityType: string;
  entityNumber: string;
  stateOfIncorporation: string;
  incorporationDate: string;
  businessStartDate: string;
  sosExpirationDate: string;
  industry: string;
  businessActivity: string;
  totalEmployees: string;
  fiscalYearEnd: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type ConsolidatedBusinessDemographicsCardProps = {
  data: BusinessDemographicsData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (data: BusinessDemographicsData) => void;
  // EIN access control
  onRequestEINView?: () => void;
  isEINUnlocked?: boolean;
};

export function ConsolidatedBusinessDemographicsCard({
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onRequestEINView,
  isEINUnlocked,
}: ConsolidatedBusinessDemographicsCardProps) {
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(data.phoneVerified ?? false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    // Mock: Simulate sending verification code
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingCode(false);
    setIsConfirmationDialogOpen(false);
    setIsVerificationDialogOpen(true);
  };

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    // Mock: Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock: Accept any 6-digit code
    if (code.length === 6) {
      setPhoneVerified(true);
      setIsVerificationDialogOpen(false);
      setVerificationCode('');
      // Update parent data
      onChange({ ...data, phoneVerified: true });
    }
    setIsVerifying(false);
  };

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Company Demographics</h3>
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
            {/* Company Name Section */}
            <div>
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {data.legalName}
              </div>
              {data.dbaName && data.dbaName !== data.legalName && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  DBA: {data.dbaName}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {data.entityType}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {data.industry}
                </span>
              </div>
            </div>

            <Separator />

            {/* Primary Contact Section */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Primary Contact</div>
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-purple-100 dark:border-purple-900">
                  <AvatarImage src={data.profileImage} alt={data.contactPerson} />
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {data.contactPerson.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{data.contactPerson}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{data.title}</div>
                  <div className="flex flex-col gap-1 mt-2 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                      {data.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>
                        {(() => {
                          const phone = data.phone.replace(/^\+1\s*/, '').replace(/\D/g, '');
                          if (phone.length === 10) {
                            return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                          }
                          return data.phone;
                        })()}
                      </span>
                      {phoneVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 text-[10px] px-1.5 py-0 h-4">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsConfirmationDialogOpen(true)}
                          className="h-5 px-2 text-[10px] border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 gap-1 cursor-pointer"
                        >
                          <Shield className="w-3 h-3" />
                          Verify your phone
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Company Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-start gap-2">
                <div className="text-gray-400 dark:text-gray-500 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400">EIN</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {isEINUnlocked ? (data.ein || 'Not provided') : (data.ein ? `**-***${data.ein.slice(-4)}` : 'Not provided')}
                    </div>
                    {!isEINUnlocked && data.ein && onRequestEINView && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onRequestEINView}
                        className="h-6 px-2 text-xs gap-1 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Shield className="w-3 h-3" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <InfoItem icon={<Hash className="w-3.5 h-3.5" />} label="Entity Number" value={data.entityNumber} />
              <InfoItem icon={<Flag className="w-3.5 h-3.5" />} label="State of Inc." value={data.stateOfIncorporation} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Incorporation Date" value={new Date(data.incorporationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Business Start" value={new Date(data.businessStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
              <InfoItem icon={<Briefcase className="w-3.5 h-3.5" />} label="Business Activity" value={data.businessActivity} />
              <InfoItem icon={<User className="w-3.5 h-3.5" />} label="Total Employees" value={data.totalEmployees} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Fiscal Year End" value={data.fiscalYearEnd} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="SOS Expiration" value={new Date(data.sosExpirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Business Address
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
            {/* Company Information */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company Information</div>
              <div>
                <Label htmlFor="legalName" className="text-xs">Legal Name</Label>
                <Input
                  id="legalName"
                  value={data.legalName}
                  onChange={(e) => onChange({ ...data, legalName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dbaName" className="text-xs">DBA Name</Label>
                <Input
                  id="dbaName"
                  value={data.dbaName}
                  onChange={(e) => onChange({ ...data, dbaName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ein" className="text-xs">Employer Identification Number (EIN)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="ein"
                    value={isEINUnlocked ? (data.ein || '') : (data.ein ? `**-***${data.ein.slice(-4)}` : '')}
                    onChange={(e) => onChange({ ...data, ein: e.target.value })}
                    placeholder="XX-XXXXXXX"
                    disabled={!isEINUnlocked}
                    className="flex-1"
                  />
                  {!isEINUnlocked && onRequestEINView && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onRequestEINView}
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
                  <Label htmlFor="entityType" className="text-xs">Entity Type</Label>
                  <Select value={data.entityType} onValueChange={(val) => onChange({ ...data, entityType: val })}>
                    <SelectTrigger id="entityType" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="S-Corp">S-Corp</SelectItem>
                      <SelectItem value="C-Corp">C-Corp</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entityNumber" className="text-xs">Entity Number</Label>
                  <Input
                    id="entityNumber"
                    value={data.entityNumber}
                    onChange={(e) => onChange({ ...data, entityNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stateOfInc" className="text-xs">State of Incorporation</Label>
                  <Select value={data.stateOfIncorporation} onValueChange={(val) => onChange({ ...data, stateOfIncorporation: val })}>
                    <SelectTrigger id="stateOfInc" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incorporationDate" className="text-xs">Incorporation Date</Label>
                  <Input
                    id="incorporationDate"
                    type="date"
                    value={data.incorporationDate}
                    onChange={(e) => onChange({ ...data, incorporationDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="businessStartDate" className="text-xs">Business Start Date</Label>
                  <Input
                    id="businessStartDate"
                    type="date"
                    value={data.businessStartDate}
                    onChange={(e) => onChange({ ...data, businessStartDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sosExpiration" className="text-xs">SOS Expiration Date</Label>
                  <Input
                    id="sosExpiration"
                    type="date"
                    value={data.sosExpirationDate}
                    onChange={(e) => onChange({ ...data, sosExpirationDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="industry" className="text-xs">Industry</Label>
                  <Input
                    id="industry"
                    value={data.industry}
                    onChange={(e) => onChange({ ...data, industry: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="businessActivity" className="text-xs">Business Activity</Label>
                  <Input
                    id="businessActivity"
                    value={data.businessActivity}
                    onChange={(e) => onChange({ ...data, businessActivity: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="totalEmployees" className="text-xs">Total Employees</Label>
                  <Input
                    id="totalEmployees"
                    value={data.totalEmployees}
                    onChange={(e) => onChange({ ...data, totalEmployees: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fiscalYearEnd" className="text-xs">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    value={data.fiscalYearEnd}
                    onChange={(e) => onChange({ ...data, fiscalYearEnd: e.target.value })}
                    placeholder="MM/DD"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Primary Contact */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Primary Contact</div>
              <div>
                <Label htmlFor="contactPerson" className="text-xs">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={data.contactPerson}
                  onChange={(e) => onChange({ ...data, contactPerson: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-xs">Title</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => onChange({ ...data, title: e.target.value })}
                  className="mt-1"
                />
              </div>
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

            {/* Address */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Address</div>
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

      {/* Confirmation Dialog - Send Verification Code */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Send Verification Code</DialogTitle>
            <DialogDescription className="text-center">
              We'll send a 6-digit verification code to this phone number
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Phone Display */}
            <div className="p-4 rounded-lg text-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <Phone className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                {(() => {
                  const phone = data.phone.replace(/^\+1\s*/, '').replace(/\D/g, '');
                  if (phone.length === 10) {
                    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                  }
                  return data.phone;
                })()}
              </p>
            </div>

            {/* Important Notice - Firm Initiating on Behalf of Client */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Verification Code Will Be Sent to Client
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    The verification code will be sent to the client's phone number, not yours. You'll need to either:
                  </p>
                  <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1.5 ml-4 list-disc">
                    <li>Request the code from the client after it's sent</li>
                    <li>Ask the client to complete verification in their client portal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                A verification code will be sent via SMS to this number. Standard messaging rates may apply.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmationDialogOpen(false)}
                disabled={isSendingCode}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendVerificationCode}
                disabled={isSendingCode}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isSendingCode ? (
                  <>
                    <span className="mr-2">Sending...</span>
                  </>
                ) : (
                  'Send Code'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Verify Phone Number</DialogTitle>
            <DialogDescription className="text-center">
              Enter the 6-digit verification code we sent to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Phone Display */}
            <div className="p-3 rounded-lg text-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {(() => {
                  const phone = data.phone.replace(/^\+1\s*/, '').replace(/\D/g, '');
                  if (phone.length === 10) {
                    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                  }
                  return data.phone;
                })()}
              </p>
            </div>

            {/* Verification Code Input */}
            <div>
              <Label className="text-sm mb-3 block font-medium text-center text-gray-700 dark:text-gray-300">
                Enter Verification Code
              </Label>
              <VerificationCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                onComplete={handleVerifyCode}
                disabled={isVerifying}
              />
              <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
                Demo: Enter any <strong>6-digit code</strong> to verify
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsVerificationDialogOpen(false);
                  setVerificationCode('');
                }}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleVerifyCode(verificationCode)}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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