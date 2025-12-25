import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/ApiService';
import { toast } from 'sonner@2.0.3';

export function MyAccountView() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    middleName: '',
    lastName: user?.name?.split(' ')[1] || 'User',
    email: user?.emailAddress || '',
    phoneNumber: '',
    phoneCountryCode: '+91'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: After generating NSwag client, this will call the real API
      await apiService.updateProfile({
        name: formData.firstName,
        surname: formData.lastName,
        emailAddress: formData.email,
        phoneNumber: formData.phoneNumber ? `${formData.phoneCountryCode}${formData.phoneNumber}` : undefined
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bgColorRightPanel, #f9fafb)' }}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="border shadow-sm mb-6" style={{ background: 'var(--bgColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
          <CardContent className="pt-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                  <AvatarFallback 
                    className="text-3xl text-white"
                    style={{ background: 'var(--primaryColor, #7c3aed)' }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button 
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-gray-800 border-2 shadow-lg transition-transform hover:scale-110"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                  onClick={() => toast.info('Photo upload coming soon!')}
                >
                  <Camera className="w-4 h-4" style={{ color: 'var(--primaryColor, #7c3aed)' }} />
                </button>
              </div>
              <h2 className="mt-4 text-gray-900 dark:text-gray-100">{formData.firstName} {formData.lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Firm Account</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-sm"
                style={{ color: 'var(--primaryColor, #7c3aed)' }}
                onClick={() => toast.info('Reset photo functionality coming soon!')}
              >
                Reset Profile Photo
              </Button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-2"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
              </div>

              {/* Middle Name */}
              <div>
                <Label htmlFor="middleName" className="text-gray-700 dark:text-gray-300">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="mt-2"
                  placeholder="Optional"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-2"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-2"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={formData.phoneCountryCode} onValueChange={(value) => handleInputChange('phoneCountryCode', value)}>
                    <SelectTrigger className="w-24" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="94184 21598"
                    className="flex-1"
                    style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                  />
                </div>
              </div>

              {/* Two Factor Authentication */}
              <div>
                <Label htmlFor="twoFactor" className="text-gray-700 dark:text-gray-300">Two Factor Enabled?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    id="twoFactor"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 text-white"
                style={{ background: 'var(--primaryColor, #7c3aed)' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Copyright © 2025, Acounta ® Inc. All Rights Reserved.{' '}
            <a href="tel:923-226-8682" className="hover:underline" style={{ color: 'var(--primaryColor, #7c3aed)' }}>
              923-ACOUNTA (226-8682)
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:underline" style={{ color: 'var(--primaryColor, #7c3aed)' }}>
              Terms & Conditions
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:underline" style={{ color: 'var(--primaryColor, #7c3aed)' }}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
