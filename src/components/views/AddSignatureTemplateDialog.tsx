import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  User,
  Users,
  Mail,
  Briefcase,
  UserCheck,
  Clock,
  Check,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

type AddRoleStep = 'choose' | 'external-choose' | 'external-now' | 'external-later' | 'firm-choose' | 'firm-now' | 'firm-later';

// Mock firm users
const MOCK_FIRM_USERS = [
  { id: '1', name: 'David Wilson', title: 'Tax Associate', email: 'david.w@firm.com' },
  { id: '2', name: 'Emily Davis', title: 'Accountant', email: 'emily.d@firm.com' },
  { id: '3', name: 'Jessica Martinez', title: 'Senior Accountant', email: 'jessica.m@firm.com' },
  { id: '4', name: 'Michael Chen', title: 'Partner', email: 'michael.c@firm.com' },
  { id: '5', name: 'Sarah Johnson', title: 'Senior Tax Manager', email: 'sarah.j@firm.com' },
].sort((a, b) => a.name.localeCompare(b.name));

interface AddSignatureTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClient: () => void;
  onAddClientSpouse: () => void;
  onAddExternalNow: (label: string, name: string, email: string) => void;
  onAddExternalLater: (label: string) => void;
  onAddFirmUserNow: (user: typeof MOCK_FIRM_USERS[0]) => void;
  onAddFirmUserLater: (label: string) => void;
}

export function AddSignatureTemplateDialog({
  open,
  onOpenChange,
  onAddClient,
  onAddClientSpouse,
  onAddExternalNow,
  onAddExternalLater,
  onAddFirmUserNow,
  onAddFirmUserLater,
}: AddSignatureTemplateDialogProps) {
  const [step, setStep] = useState<AddRoleStep>('choose');
  const [externalLabel, setExternalLabel] = useState('');
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [firmLabel, setFirmLabel] = useState('');
  const [selectedFirmUser, setSelectedFirmUser] = useState<typeof MOCK_FIRM_USERS[0] | null>(null);

  const externalNameRef = useRef<HTMLInputElement>(null);
  const externalLabelRef = useRef<HTMLInputElement>(null);
  const firmLabelRef = useRef<HTMLInputElement>(null);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('choose');
      setExternalLabel('');
      setExternalName('');
      setExternalEmail('');
      setFirmLabel('');
      setSelectedFirmUser(null);
    }
  }, [open]);

  // Auto-focus based on step
  useEffect(() => {
    if (!open) return;
    
    if (step === 'external-now') {
      setTimeout(() => externalNameRef.current?.focus(), 100);
    } else if (step === 'external-later') {
      setTimeout(() => externalLabelRef.current?.focus(), 100);
    } else if (step === 'firm-later') {
      setTimeout(() => firmLabelRef.current?.focus(), 100);
    }
  }, [step, open]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddExternalNow = () => {
    if (!externalName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    if (!externalEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }
    if (!validateEmail(externalEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    onAddExternalNow(externalLabel || 'External Recipient', externalName, externalEmail);
    onOpenChange(false);
  };

  const handleAddExternalLater = () => {
    onAddExternalLater(externalLabel || 'External Recipient');
    onOpenChange(false);
  };

  const handleAddFirmUserNow = () => {
    if (!selectedFirmUser) {
      toast.error('Please select a firm user');
      return;
    }
    onAddFirmUserNow(selectedFirmUser);
    onOpenChange(false);
  };

  const handleAddFirmUserLater = () => {
    onAddFirmUserLater(firmLabel || 'Firm User');
    onOpenChange(false);
  };

  const goBack = () => {
    if (step === 'external-choose' || step === 'firm-choose') {
      setStep('choose');
    } else if (step === 'external-now' || step === 'external-later') {
      setStep('external-choose');
    } else if (step === 'firm-now' || step === 'firm-later') {
      setStep('firm-choose');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="add-signature-template-recipient-description">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {step !== 'choose' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="gap-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle>Add Recipient</DialogTitle>
              <DialogDescription id="add-signature-template-recipient-description">
                {step === 'choose' && 'Choose the type of recipient to add to this template'}
                {step === 'external-choose' && 'When should we specify the external recipient?'}
                {step === 'external-now' && 'Provide details for the external recipient'}
                {step === 'external-later' && 'Add a label for this recipient role'}
                {step === 'firm-choose' && 'When should we specify the firm user?'}
                {step === 'firm-now' && 'Select a firm user from your team'}
                {step === 'firm-later' && 'Add a label for this recipient role'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Choose Recipient Type */}
        {step === 'choose' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => {
                onAddClient();
                onOpenChange(false);
              }}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[var(--primaryColor)] hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all">
                <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium mb-1">Client</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select when using template
              </p>
            </button>

            <button
              onClick={() => {
                onAddClientSpouse();
                onOpenChange(false);
              }}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[var(--primaryColor)] hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium mb-1">Client & Spouse</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select when using template
              </p>
            </button>

            <button
              onClick={() => setStep('external-choose')}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all">
                <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-medium mb-1">External Recipient</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick now or when using
              </p>
            </button>

            <button
              onClick={() => setStep('firm-choose')}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium mb-1">Firm User</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick now or when using
              </p>
            </button>
          </div>
        )}

        {/* Step 2a: External - Pick Now or Later */}
        {step === 'external-choose' && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('external-now')}
                className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all text-center group"
              >
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <UserCheck className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Pick Now</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Specify person details now
                </p>
              </button>

              <button
                onClick={() => setStep('external-later')}
                className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all text-center group"
              >
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Pick When Using</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select person when using template
                </p>
              </button>
            </div>

            {/* Inline Label Input for Pick When Using */}
            {step === 'external-choose' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="quickExternalLabel" className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Or add a "Pick When Using" recipient with a label:
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        ref={externalLabelRef}
                        id="quickExternalLabel"
                        value={externalLabel}
                        onChange={(e) => setExternalLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && externalLabel.trim()) {
                            handleAddExternalLater();
                          }
                        }}
                        placeholder="e.g., Attorney, CPA, Banker (optional)"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddExternalLater}
                        size="sm"
                        style={{ backgroundColor: 'var(--primaryColor)' }}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Person will be selected when using this template
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2b: External - Pick Now Form */}
        {step === 'external-now' && (
          <div className="py-4">
            <Card className="p-6 space-y-6">
              {/* Name Field */}
              <div className={`p-5 rounded-lg border-2 transition-all ${externalName ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <User className={`w-5 h-5 mt-0.5 ${externalName ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <div className="flex-1">
                    <Label htmlFor="externalName" className="text-base flex items-center gap-2">
                      Name
                      <span className="text-red-500">*</span>
                      {!externalName && (
                        <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                          Required
                        </Badge>
                      )}
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Full name of the recipient
                    </p>
                  </div>
                </div>
                <Input
                  ref={externalNameRef}
                  id="externalName"
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Enter recipient name"
                  className="h-11"
                  autoComplete="off"
                />
              </div>

              {/* Email Field */}
              <div className={`p-5 rounded-lg border-2 transition-all ${externalEmail && validateEmail(externalEmail) ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <Mail className={`w-5 h-5 mt-0.5 ${externalEmail && validateEmail(externalEmail) ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <div className="flex-1">
                    <Label htmlFor="externalEmail" className="text-base flex items-center gap-2">
                      Email
                      <span className="text-red-500">*</span>
                      {!(externalEmail && validateEmail(externalEmail)) && (
                        <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                          Required
                        </Badge>
                      )}
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Email address for sending documents
                    </p>
                  </div>
                </div>
                <Input
                  id="externalEmail"
                  type="email"
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="email@example.com"
                  className="h-11"
                  autoComplete="off"
                />
              </div>

              {/* Label Field (Optional) */}
              <div className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
                <div className="flex items-start gap-3 mb-3">
                  <Badge className="mt-0.5 bg-gray-600">Optional</Badge>
                  <div className="flex-1">
                    <Label htmlFor="externalLabel" className="text-base">
                      Recipient Label
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      e.g., Attorney, CPA, Banker
                    </p>
                  </div>
                </div>
                <Input
                  id="externalLabel"
                  value={externalLabel}
                  onChange={(e) => setExternalLabel(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Optional label for this recipient"
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                onClick={handleAddExternalNow}
                disabled={!externalName.trim() || !externalEmail.trim() || !validateEmail(externalEmail)}
                style={{ backgroundColor: (externalName.trim() && externalEmail.trim() && validateEmail(externalEmail)) ? 'var(--primaryColor)' : undefined }}
              >
                Add Recipient
              </Button>
            </div>
          </div>
        )}

        {/* Step 2c: External - Pick When Using Form */}
        {step === 'external-later' && (
          <div className="py-4">
            <Card className="p-6 space-y-6">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">Pick When Using</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                      The specific person will be selected when you use this template
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
                <div className="flex items-start gap-3 mb-3">
                  <Badge className="mt-0.5 bg-gray-600">Optional</Badge>
                  <div className="flex-1">
                    <Label htmlFor="externalLabelLater" className="text-base">
                      Recipient Label
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Give this role a descriptive label (e.g., Attorney, CPA, Banker)
                    </p>
                  </div>
                </div>
                <Input
                  ref={externalLabelRef}
                  id="externalLabelLater"
                  value={externalLabel}
                  onChange={(e) => setExternalLabel(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g., Attorney, CPA, Banker"
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                onClick={handleAddExternalLater}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Add Recipient
              </Button>
            </div>
          </div>
        )}

        {/* Step 3a: Firm User - Pick Now or Later */}
        {step === 'firm-choose' && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('firm-now')}
                className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-center group"
              >
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <UserCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Pick Now</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a firm user now
                </p>
              </button>

              <button
                onClick={() => setStep('firm-later')}
                className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-center group"
              >
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Pick When Using</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select user when using template
                </p>
              </button>
            </div>

            {/* Inline Label Input for Pick When Using */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <Label htmlFor="quickFirmLabel" className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Or add a "Pick When Using" firm user with a label:
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      ref={firmLabelRef}
                      id="quickFirmLabel"
                      value={firmLabel}
                      onChange={(e) => setFirmLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddFirmUserLater();
                        }
                      }}
                      placeholder="e.g., Reviewing Partner, Tax Manager (optional)"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddFirmUserLater}
                      size="sm"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Firm user will be selected when using this template
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3b: Firm User - Pick Now (Visual Grid) */}
        {step === 'firm-now' && (
          <div className="py-4">
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search firm members..."
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {MOCK_FIRM_USERS.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedFirmUser(member)}
                  className={cn(
                    "p-4 border-2 rounded-xl text-left transition-all",
                    selectedFirmUser?.id === member.id
                      ? "border-[var(--primaryColor)] bg-purple-50/50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selectedFirmUser?.id === member.id
                        ? "bg-purple-100 dark:bg-purple-900/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <Briefcase className={cn(
                        "w-6 h-6",
                        selectedFirmUser?.id === member.id
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-600 dark:text-gray-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.name}</p>
                        {selectedFirmUser?.id === member.id && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                onClick={handleAddFirmUserNow}
                disabled={!selectedFirmUser}
                style={{ backgroundColor: selectedFirmUser ? 'var(--primaryColor)' : undefined }}
              >
                Add Recipient
              </Button>
            </div>
          </div>
        )}

        {/* Step 3c: Firm User - Pick When Using Form */}
        {step === 'firm-later' && (
          <div className="py-4">
            <Card className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Pick When Using</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      The firm user will be selected when you use this template
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
                <div className="flex items-start gap-3 mb-3">
                  <Badge className="mt-0.5 bg-gray-600">Optional</Badge>
                  <div className="flex-1">
                    <Label htmlFor="firmLabel" className="text-base">
                      Recipient Label
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Give this role a descriptive label (e.g., Reviewing Partner, Tax Manager)
                    </p>
                  </div>
                </div>
                <Input
                  ref={firmLabelRef}
                  id="firmLabel"
                  value={firmLabel}
                  onChange={(e) => setFirmLabel(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g., Reviewing Partner, Tax Manager"
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                onClick={handleAddFirmUserLater}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Add Recipient
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}