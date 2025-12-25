import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  Users,
  FileText,
  Edit,
  Save
} from 'lucide-react';
import { useState } from 'react';

type DemographicsTabProps = {
  member: TeamMember;
};

export function DemographicsTab({ member }: DemographicsTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Mock comprehensive employee data
  const employeeData = {
    // Personal Information
    firstName: member.name.split(' ')[0],
    lastName: member.name.split(' ').slice(1).join(' '),
    middleName: '',
    dateOfBirth: '1985-06-15',
    ssn: '***-**-4567',
    gender: 'Male',
    maritalStatus: 'Married',
    
    // Contact Information
    email: member.email,
    phone: member.phone,
    alternatePhone: '(555) 123-0000',
    
    // Address
    street: '123 Main Street',
    unit: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    
    // Emergency Contact
    emergencyContactName: 'Jane Smith',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '(555) 987-6543',
    
    // Employment Information
    employmentType: 'Full-time',
    department: member.department || 'Not specified',
    position: member.title || 'Not specified',
    employmentStatus: member.status,
    startDate: member.employmentDate || '2020-01-15',
    
    // Compensation
    salary: '$85,000',
    payRate: '$40.87/hr',
    payType: 'Salaried',
    paySchedule: 'Bi-weekly',
    
    // Tax Information
    filingStatus: 'Married Filing Jointly',
    federalAllowances: '2',
    stateAllowances: '2',
    additionalWithholding: '$0',
    
    // Benefits
    healthInsurance: 'Premium Plan',
    dentalInsurance: 'Standard Plan',
    visionInsurance: 'Standard Plan',
    retirement401k: '6%',
    lifeInsurance: '2x Salary',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employee Demographics</h2>
          <p className="text-sm text-gray-500 mt-1">Comprehensive employee information and records</p>
        </div>
        <Button 
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? 'bg-gradient-to-br from-purple-600 to-purple-700' : ''}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Personal Information */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name <span className="text-red-600">*</span></Label>
            <Input id="firstName" defaultValue={employeeData.firstName} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" defaultValue={employeeData.middleName} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name <span className="text-red-600">*</span></Label>
            <Input id="lastName" defaultValue={employeeData.lastName} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth <span className="text-red-600">*</span></Label>
            <Input id="dob" type="date" defaultValue={employeeData.dateOfBirth} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssn">Social Security Number <span className="text-red-600">*</span></Label>
            <Input id="ssn" defaultValue={employeeData.ssn} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select defaultValue={employeeData.gender} disabled={!isEditing}>
              <SelectTrigger id="gender">
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
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select defaultValue={employeeData.maritalStatus} disabled={!isEditing}>
              <SelectTrigger id="maritalStatus">
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
      </Card>

      {/* Contact Information */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
            <Input id="email" type="email" defaultValue={employeeData.email} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Primary Phone <span className="text-red-600">*</span></Label>
            <Input id="phone" type="tel" defaultValue={employeeData.phone} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="altPhone">Alternate Phone</Label>
            <Input id="altPhone" type="tel" defaultValue={employeeData.alternatePhone} disabled={!isEditing} />
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Home Address</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address <span className="text-red-600">*</span></Label>
            <Input id="street" defaultValue={employeeData.street} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Apt/Unit</Label>
            <Input id="unit" defaultValue={employeeData.unit} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City <span className="text-red-600">*</span></Label>
            <Input id="city" defaultValue={employeeData.city} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-red-600">*</span></Label>
            <Input id="state" defaultValue={employeeData.state} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code <span className="text-red-600">*</span></Label>
            <Input id="zipCode" defaultValue={employeeData.zipCode} disabled={!isEditing} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="country">Country <span className="text-red-600">*</span></Label>
            <Input id="country" defaultValue={employeeData.country} disabled={!isEditing} />
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Emergency Contact</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Contact Name <span className="text-red-600">*</span></Label>
            <Input id="emergencyName" defaultValue={employeeData.emergencyContactName} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyRelation">Relationship <span className="text-red-600">*</span></Label>
            <Input id="emergencyRelation" defaultValue={employeeData.emergencyContactRelation} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Phone Number <span className="text-red-600">*</span></Label>
            <Input id="emergencyPhone" type="tel" defaultValue={employeeData.emergencyContactPhone} disabled={!isEditing} />
          </div>
        </div>
      </Card>

      {/* Employment Details */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Employment Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type <span className="text-red-600">*</span></Label>
            <Select defaultValue={employeeData.employmentType} disabled={!isEditing}>
              <SelectTrigger id="employmentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department <span className="text-red-600">*</span></Label>
            <Input id="department" defaultValue={employeeData.department} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position <span className="text-red-600">*</span></Label>
            <Input id="position" defaultValue={employeeData.position} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date <span className="text-red-600">*</span></Label>
            <Input id="startDate" type="date" defaultValue={employeeData.startDate} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employmentStatus">Status <span className="text-red-600">*</span></Label>
            <Select defaultValue={employeeData.employmentStatus} disabled={!isEditing}>
              <SelectTrigger id="employmentStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Compensation */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Compensation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payType">Pay Type <span className="text-red-600">*</span></Label>
            <Select defaultValue={employeeData.payType} disabled={!isEditing}>
              <SelectTrigger id="payType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salaried">Salaried</SelectItem>
                <SelectItem value="Hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Annual Salary</Label>
            <Input id="salary" defaultValue={employeeData.salary} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payRate">Hourly Rate</Label>
            <Input id="payRate" defaultValue={employeeData.payRate} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paySchedule">Pay Schedule <span className="text-red-600">*</span></Label>
            <Select defaultValue={employeeData.paySchedule} disabled={!isEditing}>
              <SelectTrigger id="paySchedule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="Semi-monthly">Semi-monthly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tax Information */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Tax Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filingStatus">Filing Status <span className="text-red-600">*</span></Label>
            <Select defaultValue={employeeData.filingStatus} disabled={!isEditing}>
              <SelectTrigger id="filingStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married Filing Jointly">Married Filing Jointly</SelectItem>
                <SelectItem value="Married Filing Separately">Married Filing Separately</SelectItem>
                <SelectItem value="Head of Household">Head of Household</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="federalAllowances">Federal Allowances</Label>
            <Input id="federalAllowances" defaultValue={employeeData.federalAllowances} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stateAllowances">State Allowances</Label>
            <Input id="stateAllowances" defaultValue={employeeData.stateAllowances} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalWithholding">Additional Withholding</Label>
            <Input id="additionalWithholding" defaultValue={employeeData.additionalWithholding} disabled={!isEditing} />
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-5 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Benefits Enrollment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="healthInsurance">Health Insurance</Label>
            <Select defaultValue={employeeData.healthInsurance} disabled={!isEditing}>
              <SelectTrigger id="healthInsurance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                <SelectItem value="Standard Plan">Standard Plan</SelectItem>
                <SelectItem value="Premium Plan">Premium Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dentalInsurance">Dental Insurance</Label>
            <Select defaultValue={employeeData.dentalInsurance} disabled={!isEditing}>
              <SelectTrigger id="dentalInsurance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Standard Plan">Standard Plan</SelectItem>
                <SelectItem value="Premium Plan">Premium Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visionInsurance">Vision Insurance</Label>
            <Select defaultValue={employeeData.visionInsurance} disabled={!isEditing}>
              <SelectTrigger id="visionInsurance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Standard Plan">Standard Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retirement401k">401(k) Contribution</Label>
            <Input id="retirement401k" defaultValue={employeeData.retirement401k} disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lifeInsurance">Life Insurance</Label>
            <Input id="lifeInsurance" defaultValue={employeeData.lifeInsurance} disabled={!isEditing} />
          </div>
        </div>
      </Card>
    </div>
  );
}
