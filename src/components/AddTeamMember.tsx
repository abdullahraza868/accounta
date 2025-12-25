import { Client } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { TeamMember } from './folder-tabs/TeamsTab';
import { validateEmail } from '../lib/emailValidation';

type AddTeamMemberProps = {
  client: Client;
  onClose: () => void;
  onSave: (member: Partial<TeamMember>) => void;
};

const relationshipTypes = [
  'Partner',
  'Employee',
  'Accountant',
  'Bookkeeper',
  'Manager',
  'Director',
  'Shareholder',
  'Consultant',
  'Advisor',
  'Other'
];

export function AddTeamMember({ client, onClose, onSave }: AddTeamMemberProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    title: '',
    department: '',
    hasPortalAccess: false,
    sendLogin: false,
    notes: ''
  });
  
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: Partial<TeamMember> = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      relationship: formData.relationship,
      title: formData.title,
      department: formData.department,
      dateAdded: new Date().toISOString().split('T')[0],
      hasPortalAccess: formData.hasPortalAccess
    };

    onSave(newMember);
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const isFormValid = formData.name && formData.email && !emailError && formData.relationship;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Team Members
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new partner, employee, or contact to {client.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john.smith@company.com"
                className={emailError ? 'border-red-500 dark:border-red-500' : ''}
                required
              />
              {emailError && (
                <p className="text-sm text-red-500 dark:text-red-400">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">
                Relationship <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                required
              >
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employment Information */}
        <Card className="p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Employment Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Managing Partner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Executive"
              />
            </div>
          </div>
        </Card>

        {/* Portal Access */}
        <Card className="p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Portal Access & Permissions</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="portalAccess" className="cursor-pointer font-medium">
                  Grant Portal Access
                </Label>
                <p className="text-xs text-gray-500">
                  Allow this team member to access the client portal and view documents
                </p>
              </div>
              <Switch
                id="portalAccess"
                checked={formData.hasPortalAccess}
                onCheckedChange={(checked) => setFormData({ ...formData, hasPortalAccess: checked })}
              />
            </div>

            {formData.hasPortalAccess && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="sendLogin" className="cursor-pointer font-medium text-blue-900">
                    Send Login Information
                  </Label>
                  <p className="text-xs text-blue-600">
                    Automatically send login credentials and welcome email
                  </p>
                </div>
                <Switch
                  id="sendLogin"
                  checked={formData.sendLogin}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendLogin: checked })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Additional Notes */}
        <Card className="p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Notes</h3>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any internal notes about this team member..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              These notes are for internal use only and won't be visible to the team member
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}