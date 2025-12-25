import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Phone,
  ExternalLink,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  FileText,
  CreditCard,
  Settings,
  Zap,
  Shield,
  Building2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import twilioAccountImage from 'figma:asset/1aa91906ee5071dc8123b86d72817a4bce4994b6.png';

type TwilioSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  }) => void;
};

type SetupStep = {
  id: string;
  title: string;
  description: string;
  icon: any;
};

const SETUP_STEPS: SetupStep[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Learn about Twilio integration',
    icon: Info,
  },
  {
    id: 'account',
    title: 'Twilio Account',
    description: 'Create or access your account',
    icon: Building2,
  },
  {
    id: 'brand',
    title: 'Brand Registration',
    description: 'Register your business (A2P 10DLC)',
    icon: Shield,
  },
  {
    id: 'number',
    title: 'Phone Number',
    description: 'Purchase a phone number',
    icon: Phone,
  },
  {
    id: 'credentials',
    title: 'Connect',
    description: 'Enter your credentials',
    icon: Settings,
  },
  {
    id: 'test',
    title: 'Test',
    description: 'Verify connection',
    icon: Zap,
  },
];

export function TwilioSetupDialog({ open, onOpenChange, onComplete }: TwilioSetupDialogProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isSendingTestSMS, setIsSendingTestSMS] = useState(false);
  const [testSMSResult, setTestSMSResult] = useState<'success' | 'error' | null>(null);

  const currentStep = SETUP_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < SETUP_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleTestConnection = async () => {
    if (!accountSid || !authToken || !phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock success
    setTestResult('success');
    setIsTesting(false);
    toast.success('Connection successful!');
  };

  const handleSendTestSMS = async () => {
    if (!testPhoneNumber) {
      toast.error('Please enter a phone number to receive the test SMS');
      return;
    }

    setIsSendingTestSMS(true);
    setTestSMSResult(null);

    try {
      // Simulate sending test SMS via API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      setTestSMSResult('success');
      toast.success(`Test SMS sent to ${testPhoneNumber}!`);
    } catch (error) {
      setTestSMSResult('error');
      toast.error('Failed to send test SMS');
    } finally {
      setIsSendingTestSMS(false);
    }
  };

  const handleComplete = () => {
    if (testResult !== 'success') {
      toast.error('Please test the connection first');
      return;
    }

    onComplete({
      accountSid,
      authToken,
      phoneNumber,
    });

    // Reset form
    setCurrentStepIndex(0);
    setAccountSid('');
    setAuthToken('');
    setPhoneNumber('');
    setTestResult(null);
  };

  const handleClose = () => {
    if (currentStepIndex > 0) {
      const confirmed = window.confirm(
        'Are you sure you want to close? Your progress will be lost.'
      );
      if (!confirmed) return;
    }

    setCurrentStepIndex(0);
    setAccountSid('');
    setAuthToken('');
    setPhoneNumber('');
    setTestResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="twilio-setup-description">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Connect Twilio Custom Phone Number
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400" id="twilio-setup-description">
            Set up SMS and voice capabilities with your own business phone number
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="py-6">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
              <div
                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
                style={{
                  width: `${(currentStepIndex / (SETUP_STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {SETUP_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 relative bg-white dark:bg-gray-800 px-2"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : isCurrent
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-600 text-purple-600 dark:text-purple-400'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        isCurrent
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4">
          {/* Step 1: Overview */}
          {currentStep.id === 'overview' && (
            <div className="space-y-4">
              <Card className="p-5 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      What You'll Need
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Twilio account (free to create)</li>
                      <li>• Business information (EIN/Tax ID for brand registration)</li>
                      <li>• Credit card for phone number purchase (~$1-2/month)</li>
                      <li>• A2P 10DLC brand registration fee (~$4 one-time)</li>
                      <li>• Campaign registration (~$10/month)</li>
                      <li>• 15-30 minutes for complete setup</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  What is Twilio?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Twilio is a cloud communications platform that allows Acounta to send SMS messages
                  and make phone calls using your own business phone number. This ensures all client
                  communications come from your firm's number, not an Acounta number.
                </p>

                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">
                  What is A2P 10DLC?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A2P 10DLC (Application-to-Person 10-Digit Long Code) is a system in the United States
                  that allows businesses to send SMS messages through standard 10-digit phone numbers.
                  It requires business registration and verification to prevent spam and ensure compliance.
                </p>

                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">
                  Important Security Notice
                </h4>
                <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Your Twilio credentials are securely encrypted and stored. Acounta does not
                      collect any personally identifiable information (PII) or sensitive customer data
                      through this integration.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Twilio Account */}
          {currentStep.id === 'account' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Step 1: Create or Access Your Twilio Account
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If you don't have a Twilio account yet, you'll need to create one. If you already
                  have an account, you can skip to the next step.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Circle className="w-4 h-4 text-purple-600" />
                      New to Twilio?
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Create a free Twilio account to get started. You'll receive trial credits to
                      test the service.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open('https://www.twilio.com/try-twilio', '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Create Twilio Account
                    </Button>
                  </Card>

                  <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Already Have an Account?
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Sign in to your Twilio console to access your account information and credentials.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open('https://console.twilio.com/', '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Sign In to Console
                    </Button>
                  </Card>
                </div>
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">What You'll Need:</p>
                    <ul className="space-y-1">
                      <li>• Business email address</li>
                      <li>• Phone number for verification</li>
                      <li>• Credit card for phone number purchase (will be charged monthly)</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Brand Registration */}
          {currentStep.id === 'brand' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Step 2: Register Your Business Brand (A2P 10DLC)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  US carriers require all businesses to register before sending SMS messages. This
                  process helps prevent spam and ensures message deliverability.
                </p>

                <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Registration Requirements
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                        <li>• Legal business name</li>
                        <li>• Business registration number (EIN/Tax ID)</li>
                        <li>• Business address</li>
                        <li>• Business type and industry</li>
                        <li>• Contact information</li>
                        <li>• Website URL (if applicable)</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Register Your Brand
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Submit your business information for verification. One-time fee of ~$4.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open('https://www.twilio.com/docs/sms/a2p-10dlc/register-brand', '_blank')
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Brand Registration Guide
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Create a Campaign
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Describe your SMS use case (e.g., "Client notifications and reminders"). Monthly fee of ~$10.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            'https://www.twilio.com/docs/sms/a2p-10dlc/register-campaign',
                            '_blank'
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Campaign Registration Guide
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Wait for Approval
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Most brands are approved instantly, but some may require additional verification (1-2 weeks).
                        You can purchase a phone number while waiting, but cannot send messages until approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>
                      Without A2P 10DLC registration, your messages may be blocked or filtered by carriers.
                      Complete this step before sending production messages.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: Phone Number */}
          {currentStep.id === 'number' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Step 3: Purchase a Phone Number
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a phone number that will be used to send SMS messages and make calls to your clients.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Go to Phone Numbers
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        In your Twilio console, navigate to Phone Numbers {">"} Buy a Number
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            'https://console.twilio.com/us1/develop/phone-numbers/manage/search',
                            '_blank'
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Buy a Phone Number
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Select Capabilities
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Make sure to select the following capabilities:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300">
                          SMS
                        </Badge>
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300">
                          Voice (Optional)
                        </Badge>
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300">
                          MMS (Optional)
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Choose Your Number
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Select a local area code that matches your business location, or choose a toll-free number.
                        Most numbers cost $1-2/month.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">4</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Assign to Campaign
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        After purchasing, assign the number to your A2P 10DLC campaign (from Step 2).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Pricing:</p>
                    <ul className="space-y-1">
                      <li>• Phone number: $1-2/month (varies by type)</li>
                      <li>• Outbound SMS: $0.0075 per message</li>
                      <li>• Inbound SMS: $0.0075 per message</li>
                      <li>• Voice calls: $0.013-0.022 per minute (if enabled)</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: Credentials */}
          {currentStep.id === 'credentials' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Step 4: Enter Your Twilio Credentials
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Copy your credentials from your Twilio console and paste them below. These allow
                  Acounta to send messages on your behalf.
                </p>

                {/* Visual Guide */}
                <Card className="p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Where to Find Your Credentials:
                  </p>
                  <img
                    src={twilioAccountImage}
                    alt="Twilio Account Credentials"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 mb-3"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://console.twilio.com/', '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Twilio Console
                  </Button>
                </Card>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountSid">Account SID *</Label>
                    <Input
                      id="accountSid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={accountSid}
                      onChange={(e) => setAccountSid(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Found in your Twilio Console dashboard
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="authToken">Auth Token *</Label>
                    <Input
                      id="authToken"
                      type="password"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Click "Show" in your Twilio Console to reveal
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      The phone number you purchased (include country code, e.g., +1)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active (Enable SMS sending)
                    </Label>
                  </div>
                </div>
              </div>

              <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">Security:</p>
                    <p>
                      Your credentials are encrypted using industry-standard AES-256 encryption and
                      stored securely. They are never logged or shared with third parties.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 6: Test */}
          {currentStep.id === 'test' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Step 5: Test Your Connection
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Let's verify that your Twilio credentials are correct and your account is properly configured.
                </p>

                <Card className="p-5 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Account SID:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {accountSid ? `${accountSid.slice(0, 8)}...` : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Auth Token:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {authToken ? '••••••••' : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone Number:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {phoneNumber || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleTestConnection}
                      disabled={!accountSid || !authToken || !phoneNumber || isTesting}
                      className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {testResult === 'success' && (
                  <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Connection Successful!
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Your Twilio account is properly configured and ready to send messages. Click
                          "Complete Setup" to finish.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {testResult === 'error' && (
                  <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Connection Failed
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                          Unable to connect to Twilio. Please check your credentials and try again.
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Common issues: Invalid Account SID or Auth Token, incorrect phone number format
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="mt-4">
                  <Label htmlFor="testPhoneNumber">Test Phone Number</Label>
                  <Input
                    id="testPhoneNumber"
                    placeholder="+1234567890"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter a phone number to receive a test SMS
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleSendTestSMS}
                      disabled={!testPhoneNumber || isSendingTestSMS}
                      className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      {isSendingTestSMS ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending Test SMS...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Send Test SMS
                        </>
                      )}
                    </Button>
                  </div>

                  {testSMSResult === 'success' && (
                    <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Test SMS Sent!
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            A test SMS has been sent to {testPhoneNumber}. Check your phone to verify.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {testSMSResult === 'error' && (
                    <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                            Failed to Send Test SMS
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                            Unable to send test SMS. Please check your phone number and try again.
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            Common issues: Invalid phone number format
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>

            {currentStepIndex < SETUP_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={testResult !== 'success'}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}