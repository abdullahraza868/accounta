import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from './ui/utils';

type PasswordVerificationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  fieldName: string;
};

export function PasswordVerificationDialog({
  isOpen,
  onClose,
  onVerify,
  fieldName,
}: PasswordVerificationDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setError('');
    
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsVerifying(true);

    // Simulate API call to verify password
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation - in production this would be an API call
    // For demo purposes, accept any non-empty password
    if (password.length > 0) {
      setIsVerifying(false);
      setPassword('');
      onVerify();
      onClose();
    } else {
      setIsVerifying(false);
      setError('Incorrect password. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setPassword('');
      setError('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Password Verification Required</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Verify your password to access {fieldName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-4">
            {/* Info Message */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-900 dark:text-purple-100">
                  <p className="font-medium mb-1">Sensitive Information Protection</p>
                  <p className="text-purple-700 dark:text-purple-300">
                    For security purposes, please enter your account password to view or edit this sensitive information.
                  </p>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Account Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  className={cn(
                    'pr-10',
                    error && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              setPassword('');
              setError('');
            }}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !password}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white min-w-[100px]"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="ml-2">Verifying...</span>
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
