import { useState, useEffect } from 'react';
import { X as XIcon, Plus, Trash2, User, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

type Recipient = {
  id: string;
  name: string;
  email: string;
  role?: string;
  signedAt?: string;
  viewedAt?: string;
  ipAddress?: string;
  viewedIpAddress?: string;
  signedIpAddress?: string;
};

type SignatureRequest = {
  id: string;
  documentName: string;
  documentType: 'custom' | '8879' | 'template';
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  year: number;
  sentAt: string;
  recipients: Recipient[];
  totalSent: number;
  totalSigned: number;
  status: 'completed' | 'partial' | 'sent' | 'viewed' | 'unsigned';
  createdBy: string;
  source: 'manual' | 'workflow';
  workflowName?: string;
  sentBy?: string;
  template?: string;
};

type EditSignatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature: SignatureRequest | null;
  onSave: (updatedSignature: Partial<SignatureRequest>) => void;
};

export function EditSignatureDialog({
  open,
  onOpenChange,
  signature,
  onSave,
}: EditSignatureDialogProps) {
  const [documentName, setDocumentName] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Reset form when signature changes
  useEffect(() => {
    if (signature) {
      setDocumentName(signature.documentName);
      setYear(signature.year);
      setRecipients([...signature.recipients]);
    }
  }, [signature]);

  const handleAddRecipient = () => {
    const newRecipient: Recipient = {
      id: `new-${Date.now()}`,
      name: '',
      email: '',
      role: 'Signer',
    };
    setRecipients([...recipients, newRecipient]);
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleUpdateRecipient = (id: string, field: 'name' | 'email' | 'role', value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleSave = () => {
    if (!signature) return;

    // Validate
    if (!documentName.trim()) {
      alert('Document name is required');
      return;
    }

    if (recipients.length === 0) {
      alert('At least one recipient is required');
      return;
    }

    // Check all recipients have name and email
    const invalidRecipients = recipients.filter(r => !r.name.trim() || !r.email.trim());
    if (invalidRecipients.length > 0) {
      alert('All recipients must have a name and email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(r => !emailRegex.test(r.email));
    if (invalidEmails.length > 0) {
      alert('All recipients must have valid email addresses');
      return;
    }

    onSave({
      id: signature.id,
      documentName: documentName.trim(),
      year,
      recipients,
      totalSent: recipients.length,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!signature) return null;

  // Check if any recipients have already signed
  const hasSignedRecipients = recipients.some(r => r.signedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-signature-description">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Signature Request</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400" id="edit-signature-description">
            Make changes to the signature request details and recipients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info - Read Only */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client</Label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{signature.clientName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Document Type</Label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {signature.documentType === '8879' ? 'IRS 8879' : signature.documentType === 'template' ? 'Template' : 'Custom'}
                </p>
              </div>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              className="mt-2"
            />
          </div>

          {/* Year */}
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="Enter year"
              className="mt-2"
              min="2000"
              max="2099"
            />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Recipients</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipient}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Recipient
              </Button>
            </div>

            {hasSignedRecipients && (
              <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Some recipients have already signed. Changes to their information will be recorded in the audit trail.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {recipients.map((recipient, index) => {
                const hasSigned = !!recipient.signedAt;
                const hasViewed = !!recipient.viewedAt;

                return (
                  <div
                    key={recipient.id}
                    className={cn(
                      "border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                      hasSigned && "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Recipient {index + 1}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {hasSigned && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-2 py-0 h-5">
                                Signed
                              </Badge>
                            )}
                            {!hasSigned && hasViewed && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs px-2 py-0 h-5">
                                Viewed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!hasSigned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecipient(recipient.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`recipient-name-${recipient.id}`} className="text-xs">Name</Label>
                        <Input
                          id={`recipient-name-${recipient.id}`}
                          value={recipient.name}
                          onChange={(e) => handleUpdateRecipient(recipient.id, 'name', e.target.value)}
                          placeholder="Recipient name"
                          className="mt-1"
                          disabled={hasSigned}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`recipient-email-${recipient.id}`} className="text-xs">Email</Label>
                        <Input
                          id={`recipient-email-${recipient.id}`}
                          type="email"
                          value={recipient.email}
                          onChange={(e) => handleUpdateRecipient(recipient.id, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="mt-1"
                          disabled={hasSigned}
                        />
                      </div>
                    </div>

                    {hasSigned && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Signed on {new Date(recipient.signedAt!).toLocaleString()}
                          {recipient.signedIpAddress && ` from ${recipient.signedIpAddress}`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {recipients.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <User className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recipients added</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRecipient}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Recipient
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              style={{ backgroundColor: 'var(--primaryColor)' }}
              className="text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}