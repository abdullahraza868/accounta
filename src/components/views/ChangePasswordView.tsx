import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { apiService } from '../../services/ApiService';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

export function ChangePasswordView() {
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password validation rules
  const passwordRules = [
    { 
      id: 'length', 
      label: 'At least 8 characters', 
      test: (pwd: string) => pwd.length >= 8 
    },
    { 
      id: 'uppercase', 
      label: 'One uppercase letter', 
      test: (pwd: string) => /[A-Z]/.test(pwd) 
    },
    { 
      id: 'lowercase', 
      label: 'One lowercase letter', 
      test: (pwd: string) => /[a-z]/.test(pwd) 
    },
    { 
      id: 'number', 
      label: 'One number', 
      test: (pwd: string) => /\d/.test(pwd) 
    },
    { 
      id: 'special', 
      label: 'One special character', 
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) 
    },
  ];

  const isPasswordValid = passwordRules.every(rule => rule.test(formData.newPassword));
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';
  const canSubmit = formData.currentPassword !== '' && isPasswordValid && passwordsMatch;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setIsSaving(true);
    try {
      // TODO: After generating NSwag client, this will call the real API
      await apiService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--bgColorRightPanel, #f9fafb)' }}>
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Change Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
        </div>

        {/* Password Change Card */}
        <Card className="border shadow-sm" style={{ background: 'var(--bgColor, #ffffff)', borderColor: 'var(--stokeColor, #e5e7eb)' }}>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                  Current Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className="pr-10"
                    style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                    className="pr-10"
                    style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.newPassword && (
                  <div className="mt-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                    <div className="space-y-1">
                      {passwordRules.map(rule => {
                        const isValid = rule.test(formData.newPassword);
                        return (
                          <div key={rule.id} className="flex items-center gap-2 text-sm">
                            {isValid ? (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={cn(
                              isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            )}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                    className="pr-10"
                    style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || isSaving}
                  className="flex-1 text-white"
                  style={{ background: canSubmit ? 'var(--primaryColor, #7c3aed)' : undefined }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSaving ? 'Changing Password...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-blue-900 dark:text-blue-100 mb-1">Security Tip</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use a strong, unique password that you don't use for any other accounts. 
                      Consider using a password manager to generate and store secure passwords.
                    </p>
                  </div>
                </div>
              </div>
            </form>
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
