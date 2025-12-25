import React, { useState } from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface SendLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSendLogin: () => void;
}

export function SendLoginDialog({ isOpen, onClose, selectedCount, onSendLogin }: SendLoginDialogProps) {
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const portalUrl = 'https://portal.yourfirm.com';
  
  const loginMessage = `Welcome to our Client Portal!

To access your secure client portal, please follow these simple steps:

1. Visit: ${portalUrl}
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email for a secure login link
5. Click the link in your email to instantly access your portal

Alternative Login Options:
- Sign in with Google
- Sign in with Microsoft

${includeInstructions ? `What is a Magic Link?
A magic link is a secure, one-time login link sent directly to your email. It provides passwordless access to your portal and expires after a short time for your security.

Need a New Magic Link?
If your magic link expires or you need to log in again:
1. Go to ${portalUrl}
2. Enter your email address
3. Click "Send Magic Link"
4. A new secure link will be sent to your email

` : ''}If you have any questions or need assistance accessing the portal, please don't hesitate to contact us.

Best regards,
Your Accounting Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(loginMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onSendLogin();
    handleClose();
  };

  const handleClose = () => {
    setIncludeInstructions(true);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
          }}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Send Portal Access Instructions
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Send portal login instructions to <span className="font-semibold text-brand-primary">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span>
            </p>
          </div>

          {/* Include Instructions */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                  includeInstructions
                    ? 'bg-brand-primary border-brand-primary'
                    : 'border-gray-300 group-hover:border-brand-primary/50'
                }`}
                onClick={() => setIncludeInstructions(!includeInstructions)}
              >
                {includeInstructions && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <div>
                <div className="font-medium text-gray-900">Include detailed instructions</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Add explanation of magic links and how to request a new one if expired
                </div>
              </div>
            </label>
          </div>

          {/* Message Preview */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Email Message Preview
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="rounded-lg text-xs h-7"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {loginMessage}
              </pre>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">i</span>
                </div>
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Passwordless Authentication</p>
                <p className="text-blue-800">
                  Your clients will receive a magic link via email for secure, passwordless access. 
                  They can also choose to sign in with their Google or Microsoft accounts for added convenience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send via Email
          </Button>
        </div>
      </div>
    </div>
  );
}
