import { useState, useRef, useEffect } from 'react';
import { ClientPortalLayout } from '../../../components/client-portal/ClientPortalLayout';
import { useBranding } from '../../../contexts/BrandingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ClickableOptionBox } from '../../../components/ui/clickable-option-box';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { User, Mail, Phone, MapPin, Building2, Save, Users, UserPlus, X, Check, Loader2, ArrowRight, Link as LinkIcon, XCircle, Clock, UserMinus, Send, RefreshCw, AlertCircle, AlertTriangle, History, ChevronDown, ChevronUp, Heart, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { validateEmail } from '../../../lib/fieldValidation';
import { Card } from '../../../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import DemographicsView from '../../../components/DemographicsView';
import { CreateClientWizard } from '../../../components/CreateClientWizard';
import { clientToWizardData } from '../../../utils/clientDataTransform';
import { Client } from '../../../App';

export default function ClientPortalProfile() {
  const { branding } = useBranding();
  const { user } = useAuth();
  const accountEmailInputRef = useRef<HTMLInputElement>(null);

  // Mock profile data - replace with actual API call
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || 'John',
    lastName: user?.name?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    company: 'Acme Corporation',
  });

  // Client type - detect from user account (mock for now)
  const clientType: 'Individual' | 'Business' = 'Individual'; // Would come from user.clientType

  const [isEditing, setIsEditing] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [showAccountLinking, setShowAccountLinking] = useState(false);
  
  // Create Client object from user data for DemographicsView
  const clientData: Client = {
    id: user?.id || 'client-1',
    name: user?.name || `${profile.firstName} ${profile.lastName}`,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    type: clientType,
    group: '',
    assignedTo: '',
    tags: [],
    createdDate: new Date().toISOString(),
  };
  const [linkingState, setLinkingState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [accountEmail, setAccountEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [unlinkReason, setUnlinkReason] = useState<'divorced' | 'separated' | 'other'>('divorced');
  const [unlinkReasonOther, setUnlinkReasonOther] = useState('');
  
  // Main account linking status: 'none', 'pending', 'linked', 'rejected', 'expired'
  type AccountLinkStatus = 'none' | 'pending' | 'linked' | 'rejected' | 'expired';
  
  // Activity log types
  type ActivityLogEntry = {
    id: string;
    type: 'invitation_sent' | 'invitation_resent' | 'invitation_accepted' | 'invitation_rejected' | 
          'invitation_expired' | 'access_changed' | 'account_unlinked' | 'invitation_cancelled';
    timestamp: Date;
    description: string;
    details?: string;
    performedBy?: string;
  };
  
  // Mock account linking data - replace with API call
  const [accountLinkStatus, setAccountLinkStatus] = useState<AccountLinkStatus>('none');
  const [invitationData, setInvitationData] = useState<{
    email: string;
    sentDate: Date;
    expiresDate: Date;
  } | null>(null);
  const [linkedAccount, setLinkedAccount] = useState<{
    name: string;
    email: string;
    linkedDate: Date;
    accessLevel: 'full' | 'limited'; // full = see all, limited = only final tax
    relationship?: string; // 'spouse', 'business_partner', 'family', etc.
  } | null>(null);

  // Mock activity log - replace with API call
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([
    {
      id: '1',
      type: 'invitation_sent',
      timestamp: new Date('2024-10-15T14:30:00'),
      description: 'Invitation sent',
      details: 'jane.doe@example.com',
    },
    {
      id: '2',
      type: 'invitation_resent',
      timestamp: new Date('2024-10-20T09:15:00'),
      description: 'Invitation resent',
      details: 'jane.doe@example.com',
    },
    {
      id: '3',
      type: 'invitation_accepted',
      timestamp: new Date('2024-10-21T16:45:00'),
      description: 'Invitation accepted',
      details: 'Jane Doe accepted the account linking invitation',
    },
    {
      id: '4',
      type: 'access_changed',
      timestamp: new Date('2024-10-25T11:20:00'),
      description: 'Access level changed to Limited Access',
      details: 'Can only see final tax return deliverables',
      performedBy: 'You',
    },
    {
      id: '5',
      type: 'access_changed',
      timestamp: new Date('2024-10-28T13:10:00'),
      description: 'Access level changed to Full Access',
      details: 'Can see all tax documents and returns',
      performedBy: 'You',
    },
  ]);

  // Auto-focus email input when account linking form appears
  useEffect(() => {
    if (showAccountLinking && linkingState === 'idle' && accountEmailInputRef.current) {
      const timer = setTimeout(() => {
        accountEmailInputRef.current?.focus();
        accountEmailInputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAccountLinking, linkingState]);

  const handleSave = () => {
    // Mock save - replace with actual API call
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setAccountEmail(value);
    
    // Validate email
    const validation = validateEmail(value, true);
    if (!validation.isValid) {
      setEmailError(validation.error || '');
    } else {
      setEmailError('');
    }
  };

  const handleSendInvitation = () => {
    setEmailTouched(true);
    
    // Validate email before sending
    const validation = validateEmail(accountEmail, true);
    if (!validation.isValid) {
      setEmailError(validation.error || 'Please enter a valid email address');
      toast.error(validation.error || 'Please enter a valid email address');
      return;
    }

    setLinkingState('sending');
    
    // Simulate API call
    setTimeout(() => {
      const sentDate = new Date();
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + 7); // 7 days expiration
      
      setInvitationData({
        email: accountEmail,
        sentDate,
        expiresDate,
      });
      setAccountLinkStatus('pending');
      setLinkingState('sent');
      toast.success('Invitation sent successfully!');

      // Add to activity log
      const newEntry: ActivityLogEntry = {
        id: Date.now().toString(),
        type: 'invitation_sent',
        timestamp: sentDate,
        description: 'Invitation sent',
        details: accountEmail,
      };
      setActivityLog([newEntry, ...activityLog]);
      
      setTimeout(() => {
        setShowAccountLinking(false);
        setLinkingState('idle');
        setAccountEmail('');
      }, 2000);
    }, 1500);
  };

  const handleCancelPendingInvitation = () => {
    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'invitation_cancelled',
      timestamp: new Date(),
      description: 'Invitation cancelled',
      details: invitationData?.email || '',
      performedBy: 'You',
    };
    setActivityLog([newEntry, ...activityLog]);

    // API call to cancel invitation
    setAccountLinkStatus('none');
    setInvitationData(null);
    toast.success('Invitation cancelled');
  };

  const handleResendInvitation = () => {
    if (!invitationData) return;
    
    setLinkingState('sending');
    setShowAccountLinking(true);
    
    // Simulate API call
    setTimeout(() => {
      const sentDate = new Date();
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + 7);
      
      setInvitationData({
        ...invitationData,
        sentDate,
        expiresDate,
      });
      setLinkingState('sent');
      toast.success('Invitation resent successfully!');

      // Add to activity log
      const newEntry: ActivityLogEntry = {
        id: Date.now().toString(),
        type: 'invitation_resent',
        timestamp: sentDate,
        description: 'Invitation resent',
        details: invitationData.email,
      };
      setActivityLog([newEntry, ...activityLog]);
      
      setTimeout(() => {
        setShowAccountLinking(false);
        setLinkingState('idle');
      }, 2000);
    }, 1500);
  };

  const confirmUnlinkAccount = () => {
    // Build reason text
    let reasonText = '';
    if (unlinkReason === 'divorced') {
      reasonText = 'Reason: Divorced';
    } else if (unlinkReason === 'separated') {
      reasonText = 'Reason: Separated';
    } else if (unlinkReason === 'other' && unlinkReasonOther.trim()) {
      reasonText = `Reason: ${unlinkReasonOther.trim()}`;
    } else if (unlinkReason === 'other') {
      reasonText = 'Reason: Other';
    }

    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'account_unlinked',
      timestamp: new Date(),
      description: 'Account unlinked',
      details: `${linkedAccount?.name} (${linkedAccount?.email}) was unlinked. ${reasonText}`,
      performedBy: 'You',
    };
    setActivityLog([newEntry, ...activityLog]);

    // API call to unlink account - would send reason to backend
    setAccountLinkStatus('none');
    setLinkedAccount(null);
    setShowUnlinkDialog(false);
    
    // Reset reason fields
    setUnlinkReason('divorced');
    setUnlinkReasonOther('');
    
    toast.success('Account unlinked successfully');
  };

  const handleSendNewInvitation = () => {
    // Pre-fill with previous email if available (confirm or edit flow)
    const previousEmail = invitationData?.email || '';
    
    // Reset to allow sending new invitation
    setAccountLinkStatus('none');
    setInvitationData(null);
    setShowAccountLinking(true);
    setAccountEmail(previousEmail); // Pre-fill email
    setEmailError('');
    setEmailTouched(false);
    setLinkingState('idle'); // Reset to form state
  };

  const handleCancelInvitation = () => {
    setShowAccountLinking(false);
    setLinkingState('idle');
    setAccountEmail('');
    setEmailError('');
    setEmailTouched(false);
  };

  // Mock function to simulate account accepting invitation
  const simulateAcceptance = () => {
    const acceptDate = new Date();
    setAccountLinkStatus('linked');
    setLinkedAccount({
      name: 'Jane Doe',
      email: invitationData?.email || 'jane.doe@example.com',
      linkedDate: acceptDate,
      accessLevel: 'full', // Default to full access
      relationship: 'spouse',
    });
    setInvitationData(null);
    toast.success('User accepted the invitation!');

    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'invitation_accepted',
      timestamp: acceptDate,
      description: 'Invitation accepted',
      details: 'Jane Doe accepted the account linking invitation',
    };
    setActivityLog([newEntry, ...activityLog]);
  };

  // Mock function to simulate account rejecting invitation
  const simulateRejection = () => {
    const rejectDate = new Date();
    setAccountLinkStatus('rejected');
    // Keep invitationData so we can pre-fill on resend
    toast.error('User rejected the invitation');

    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'invitation_rejected',
      timestamp: rejectDate,
      description: 'Invitation rejected',
      details: 'The user declined the account linking invitation',
    };
    setActivityLog([newEntry, ...activityLog]);
  };

  // Mock function to simulate invitation expiring
  const simulateExpiration = () => {
    const expireDate = new Date();
    setAccountLinkStatus('expired');
    // Keep invitationData so we can pre-fill on resend
    toast.error('Invitation expired');

    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'invitation_expired',
      timestamp: expireDate,
      description: 'Invitation expired',
      details: 'The invitation expired after 7 days without a response',
    };
    setActivityLog([newEntry, ...activityLog]);
  };

  // Change access level
  const handleChangeAccessLevel = (level: 'full' | 'limited') => {
    if (!linkedAccount) return;
    
    setLinkedAccount({
      ...linkedAccount,
      accessLevel: level,
    });
    
    const message = level === 'full' 
      ? 'Linked account can now see all tax documents' 
      : 'Linked account can now see only final tax returns';
    toast.success(message);

    // Add to activity log
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      type: 'access_changed',
      timestamp: new Date(),
      description: `Access level changed to ${level === 'full' ? 'Full Access' : 'Limited Access'}`,
      details: level === 'full' ? 'Can see all tax documents and returns' : 'Can only see final tax return deliverables',
      performedBy: 'You',
    };
    setActivityLog([newEntry, ...activityLog]);
  };

  // Helper function to get icon and color for activity type
  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'invitation_sent':
        return { icon: Send, color: '#3B82F6', bg: '#DBEAFE' };
      case 'invitation_resent':
        return { icon: RefreshCw, color: '#3B82F6', bg: '#DBEAFE' };
      case 'invitation_accepted':
        return { icon: Check, color: '#10B981', bg: '#D1FAE5' };
      case 'invitation_rejected':
        return { icon: XCircle, color: '#EF4444', bg: '#FEE2E2' };
      case 'invitation_expired':
        return { icon: Clock, color: '#9CA3AF', bg: '#F3F4F6' };
      case 'invitation_cancelled':
        return { icon: X, color: '#9CA3AF', bg: '#F3F4F6' };
      case 'access_changed':
        return { icon: Users, color: '#8B5CF6', bg: '#EDE9FE' };
      case 'account_unlinked':
        return { icon: UserMinus, color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { icon: AlertCircle, color: '#9CA3AF', bg: '#F3F4F6' };
    }
  };

  return (
    <ClientPortalLayout>
      <div className="h-full relative">
        {/* Edit Profile Button - Floating in top right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setShowEditWizard(true)}
            style={{
              background: branding.colors.primaryButton,
              color: branding.colors.primaryButtonText,
            }}
            className="gap-2 shadow-lg"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
        
        {/* Demographics Section - Exact same UI as Demographics tab */}
        <div className="h-full">
          <DemographicsView 
            client={clientData}
            isReadOnly={false}
            hideProfileHeader={false}
          />
          
          {/* Account Linking Section - Positioned at bottom, matching DemographicsView padding */}
          <div className="px-8 pb-8">
        <div
          className="rounded-lg p-6 border"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.borderColor,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ color: branding.colors.headingText }}>
                Account Linking
              </h2>
              <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                {accountLinkStatus === 'linked' 
                  ? 'A linked account has access to shared tax deliverables'
                  : 'Link another account to share documents and view deliverables together'}
              </p>
            </div>
            {accountLinkStatus === 'none' && !showAccountLinking && (
              <Button
                variant="outline"
                onClick={() => setShowAccountLinking(true)}
                style={{
                  borderColor: branding.colors.primaryButton,
                  color: branding.colors.primaryButton,
                }}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Link Account
              </Button>
            )}
            {accountLinkStatus === 'linked' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowActivityLog(!showActivityLog)}
                  style={{
                    borderColor: branding.colors.primaryButton,
                    color: branding.colors.primaryButton,
                  }}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  Activity Log
                  {showActivityLog ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUnlinkDialog(true)}
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                  Unlink Account
                </Button>
              </div>
            )}
          </div>
          
          {/* Household/Spouse Info - Only for Individual Clients */}
          {clientType === 'Individual' && accountLinkStatus === 'none' && !showAccountLinking && (
            <div 
              className="p-3 rounded-md mb-4 border-l-2" 
              style={{ 
                borderLeftColor: branding.colors.primaryButton,
                backgroundColor: `${branding.colors.primaryButton}08`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: branding.colors.primaryButton }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: branding.colors.bodyText }}>
                    <span className="font-medium" style={{ color: branding.colors.headingText }}>For joint tax filing:</span> Link your spouse or partner below. They'll be able to view and sign shared tax documents.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity Log - Shows above the green box when linked */}
          {accountLinkStatus === 'linked' && activityLog.length > 0 && showActivityLog && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div 
                className="rounded-lg border p-4"
                style={{
                  background: branding.colors.cardBackground,
                  borderColor: branding.colors.borderColor,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5" style={{ color: branding.colors.primaryButton }} />
                  <h3 className="font-medium" style={{ color: branding.colors.headingText }}>
                    Activity Log
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                    background: `${branding.colors.primaryButton}15`,
                    color: branding.colors.primaryButton,
                  }}>
                    {activityLog.length} {activityLog.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {activityLog.map((entry, index) => {
                    const { icon: Icon, color, bg } = getActivityIcon(entry.type);
                    const isLast = index === activityLog.length - 1;

                    return (
                      <div key={entry.id} className="relative flex gap-3 group">
                        {/* Timeline line */}
                        {!isLast && (
                          <div 
                            className="absolute left-[15px] top-8 w-0.5 h-full -ml-px"
                            style={{ background: branding.colors.borderColor }}
                          />
                        )}

                        {/* Icon */}
                        <div 
                          className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                          style={{ background: bg }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                                {entry.description}
                              </p>
                              {entry.details && (
                                <p className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                                  {entry.details}
                                </p>
                              )}
                              {entry.performedBy && (
                                <p className="text-xs mt-1" style={{ color: branding.colors.mutedText }}>
                                  By: {entry.performedBy}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                                {entry.timestamp.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                                {entry.timestamp.toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STATE: No Link - Initial state */}
            {accountLinkStatus === 'none' && !showAccountLinking && (
              <motion.div
                key="no-link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md"
                  style={{
                    background: `${branding.colors.primaryButton}08`,
                    borderColor: branding.colors.primaryButton,
                  }}
                  onClick={() => setShowAccountLinking(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowAccountLinking(true);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                        No linked accounts yet
                      </p>
                      <p className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>
                        Click here to send an invitation to link another account
                      </p>
                    </div>
                    <UserPlus className="w-5 h-5 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: Sending Invitation Flow */}
            {accountLinkStatus === 'none' && showAccountLinking && (
              <motion.div
                key="management"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Visual Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                  {/* Step 1: Enter Email */}
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                      style={{
                        background: linkingState === 'idle' ? branding.colors.primaryButton : `${branding.colors.primaryButton}30`,
                        color: 'white',
                      }}
                    >
                      {linkingState === 'idle' ? <Mail className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-center" style={{ color: branding.colors.bodyText }}>Enter Email</span>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 mb-6" style={{ color: branding.colors.mutedText }} />

                  {/* Step 2: Sending */}
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                      style={{
                        background: linkingState === 'sending' ? branding.colors.primaryButton : (linkingState === 'sent' ? `${branding.colors.primaryButton}30` : `${branding.colors.mutedText}30`),
                        color: linkingState === 'sending' || linkingState === 'sent' ? 'white' : branding.colors.mutedText,
                      }}
                    >
                      {linkingState === 'sending' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : linkingState === 'sent' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Loader2 className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-center" style={{ color: branding.colors.bodyText }}>Sending</span>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 mb-6" style={{ color: branding.colors.mutedText }} />

                  {/* Step 3: Invitation Sent */}
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                      style={{
                        background: linkingState === 'sent' ? branding.colors.primaryButton : `${branding.colors.mutedText}30`,
                        color: linkingState === 'sent' ? 'white' : branding.colors.mutedText,
                      }}
                    >
                      {linkingState === 'sent' ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-center" style={{ color: branding.colors.bodyText }}>Invitation Sent</span>
                  </div>
                </div>

                {/* Email Input Form */}
                {linkingState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="accountEmail" style={{ color: branding.colors.bodyText }}>
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: branding.colors.mutedText }}
                        />
                        <Input
                          ref={accountEmailInputRef}
                          id="accountEmail"
                          type="email"
                          placeholder="user@example.com"
                          value={accountEmail}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          className={`pl-10 transition-all duration-200 ${emailError && emailTouched ? 'border-red-500 focus:border-red-500' : 'focus:ring-2 focus:ring-offset-1'}`}
                          style={{
                            background: branding.colors.inputBackground,
                            borderColor: emailError && emailTouched ? '#EF4444' : branding.colors.inputBorder,
                            color: branding.colors.inputText,
                            boxShadow: !emailError || !emailTouched ? `0 0 0 2px transparent, 0 0 15px ${branding.colors.primaryButton}30` : undefined,
                          }}
                          aria-invalid={emailError && emailTouched ? 'true' : 'false'}
                          aria-describedby={emailError && emailTouched ? 'email-error' : undefined}
                          autoFocus
                        />
                      </div>
                      {emailError && emailTouched && (
                        <p 
                          id="email-error"
                          className="text-sm mt-1.5 flex items-center gap-1 text-red-600"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {emailError}
                        </p>
                      )}
                      <p className="text-xs mt-1.5" style={{ color: branding.colors.mutedText }}>
                        Enter the email address of the account you'd like to link
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelInvitation}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendInvitation}
                        style={{
                          background: branding.colors.primaryButton,
                          color: branding.colors.primaryButtonText,
                        }}
                        className="gap-2"
                        disabled={!accountEmail || !!emailError}
                      >
                        <UserPlus className="w-4 h-4" />
                        Send Invitation
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Sending State */}
                {linkingState === 'sending' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 rounded-lg text-center"
                    style={{
                      background: `${branding.colors.primaryButton}08`,
                    }}
                  >
                    <Loader2 
                      className="w-12 h-12 mx-auto mb-4 animate-spin" 
                      style={{ color: branding.colors.primaryButton }}
                    />
                    <p className="font-medium" style={{ color: branding.colors.headingText }}>
                      Sending invitation...
                    </p>
                    <p className="text-sm mt-2" style={{ color: branding.colors.mutedText }}>
                      Please wait while we send the invitation to {accountEmail}
                    </p>
                  </motion.div>
                )}

                {/* Sent State */}
                {linkingState === 'sent' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-lg text-center border-2"
                    style={{
                      background: `${branding.colors.primaryButton}08`,
                      borderColor: branding.colors.primaryButton,
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: branding.colors.primaryButton }}
                    >
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-medium text-lg mb-2" style={{ color: branding.colors.headingText }}>
                      Invitation Sent Successfully!
                    </p>
                    <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                      An invitation has been sent to <strong>{accountEmail}</strong>
                    </p>
                    <p className="text-sm mt-2" style={{ color: branding.colors.mutedText }}>
                      They will receive an email with instructions to link their account
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STATE: Pending - Waiting for user to accept */}
            {accountLinkStatus === 'pending' && invitationData && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="p-5 rounded-lg border-l-4"
                  style={{
                    background: '#FEF3C7',
                    borderColor: '#F59E0B',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Clock className="w-5 h-5 mt-0.5 text-amber-600" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-900">
                          Invitation Pending
                        </p>
                        <p className="text-sm mt-1 text-amber-800">
                          Sent to: <strong>{invitationData.email}</strong>
                        </p>
                        <p className="text-xs mt-2 text-amber-700">
                          Sent: {invitationData.sentDate.toLocaleDateString()} at {invitationData.sentDate.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-amber-700">
                          Expires: {invitationData.expiresDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResendInvitation}
                        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelPendingInvitation}
                        className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mock Buttons for Testing */}
                  <div className="mt-4 pt-4 border-t border-amber-200 flex gap-2">
                    <Button
                      size="sm"
                      onClick={simulateAcceptance}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-3 h-3" />
                      [Test] Accept
                    </Button>
                    <Button
                      size="sm"
                      onClick={simulateRejection}
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-3 h-3" />
                      [Test] Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={simulateExpiration}
                      className="gap-2 bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Clock className="w-3 h-3" />
                      [Test] Expire
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: Linked - Successfully connected */}
            {accountLinkStatus === 'linked' && linkedAccount && (
              <motion.div
                key="linked"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="p-5 rounded-lg border-l-4"
                  style={{
                    background: '#D1FAE5',
                    borderColor: '#10B981',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">
                        Account Linked
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-700" />
                          <span className="text-sm text-green-800">
                            <strong>{linkedAccount.name}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-700" />
                          <span className="text-sm text-green-800">{linkedAccount.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-green-700" />
                          <span className="text-sm text-green-800">
                            Linked on {linkedAccount.linkedDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Access Level Selection */}
                      <div className="mt-4 p-4 bg-white/50 rounded border border-green-200">
                        <p className="text-xs font-medium text-green-900 mb-3">Access Level:</p>
                        <div className="space-y-2">
                          {/* Full Access Option */}
                          <div 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              linkedAccount.accessLevel === 'full' 
                                ? 'border-green-600 bg-green-50' 
                                : 'border-green-200 hover:border-green-400 hover:bg-white'
                            }`}
                            onClick={() => handleChangeAccessLevel('full')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleChangeAccessLevel('full');
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                linkedAccount.accessLevel === 'full' ? 'bg-green-600' : 'bg-green-200'
                              }`}>
                                {linkedAccount.accessLevel === 'full' && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Full Access</p>
                                <p className="text-xs text-green-700 mt-1">
                                  Can see all tax documents and returns
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Limited Access Option */}
                          <div 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              linkedAccount.accessLevel === 'limited' 
                                ? 'border-green-600 bg-green-50' 
                                : 'border-green-200 hover:border-green-400 hover:bg-white'
                            }`}
                            onClick={() => handleChangeAccessLevel('limited')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleChangeAccessLevel('limited');
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                linkedAccount.accessLevel === 'limited' ? 'bg-green-600' : 'bg-green-200'
                              }`}>
                                {linkedAccount.accessLevel === 'limited' && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Limited Access</p>
                                <p className="text-xs text-green-700 mt-1">
                                  Can only see final tax return deliverables
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* What's Shared Info */}
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-xs font-medium text-green-900 mb-2">Sharing:</p>
                          <ul className="text-xs text-green-800 space-y-1">
                            <li className="flex items-center gap-2">
                              <Check className="w-3 h-3" />
                              Final tax return (both receive copies)
                            </li>
                            <li className="flex items-center gap-2">
                              {linkedAccount.accessLevel === 'full' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Uploaded documents shared
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-green-600" />
                                  Uploaded documents not shared. Each party can only view their submitted documents.
                                </>
                              )}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: Rejected - User declined */}
            {accountLinkStatus === 'rejected' && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="p-5 rounded-lg border-l-4"
                  style={{
                    background: '#FEE2E2',
                    borderColor: '#EF4444',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <XCircle className="w-5 h-5 mt-0.5 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">
                          Invitation Declined
                        </p>
                        <p className="text-sm mt-1 text-red-800">
                          The user declined the account linking invitation.
                        </p>
                        <p className="text-xs mt-2 text-red-700">
                          You can send a new invitation if needed.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSendNewInvitation}
                      style={{
                        background: branding.colors.primaryButton,
                        color: branding.colors.primaryButtonText,
                      }}
                      className="gap-2"
                    >
                      <Send className="w-3 h-3" />
                      Send New
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: Expired - Invitation expired */}
            {accountLinkStatus === 'expired' && (
              <motion.div
                key="expired"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="p-5 rounded-lg border-l-4"
                  style={{
                    background: '#F3F4F6',
                    borderColor: '#9CA3AF',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle className="w-5 h-5 mt-0.5 text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Invitation Expired
                        </p>
                        <p className="text-sm mt-1 text-gray-700">
                          The invitation you sent has expired after 7 days.
                        </p>
                        <p className="text-xs mt-2 text-gray-600">
                          Send a new invitation to continue the linking process.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSendNewInvitation}
                      style={{
                        background: branding.colors.primaryButton,
                        color: branding.colors.primaryButtonText,
                      }}
                      className="gap-2"
                    >
                      <Send className="w-3 h-3" />
                      Send New
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          </div>
        </div>
      </div>

      {/* Unlink Account Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent 
          className="max-w-lg"
          onDoubleClickOutsideClose={() => setShowUnlinkDialog(false)}
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Unlink Account</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-base space-y-4 pt-2">
            <div>
              Are you sure you want to unlink <strong>{linkedAccount?.name}</strong>?
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-900 font-medium mb-2">This will immediately:</div>
              <div className="text-sm text-red-800 space-y-1.5">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Remove their access to all shared tax deliverables</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Disconnect the household link permanently</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Require a new invitation to re-link in the future</span>
                </div>
              </div>
            </div>

            {/* Reason Selection - Visual Pick Boxes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: branding.colors.headingText }}>
                Reason for unlinking: <span className="text-red-600">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    unlinkReason === 'divorced' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setUnlinkReason('divorced')}
                >
                  <div className="text-sm font-medium">Divorced</div>
                </div>
                <div
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    unlinkReason === 'separated' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setUnlinkReason('separated')}
                >
                  <div className="text-sm font-medium">Separated</div>
                </div>
                <div
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    unlinkReason === 'other' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setUnlinkReason('other')}
                >
                  <div className="text-sm font-medium">Other</div>
                </div>
              </div>

              {/* Other Reason Text Field */}
              {unlinkReason === 'other' && (
                <div className="mt-3">
                  <Label htmlFor="otherReason" className="text-xs mb-2 block" style={{ color: branding.colors.mutedText }}>
                    Please specify:
                  </Label>
                  <Textarea
                    id="otherReason"
                    placeholder="Enter reason..."
                    value={unlinkReasonOther}
                    onChange={(e) => setUnlinkReasonOther(e.target.value)}
                    rows={2}
                    className="resize-none"
                    style={{
                      background: branding.colors.inputBackground,
                      borderColor: branding.colors.inputBorder,
                      color: branding.colors.inputText,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="text-sm" style={{ color: branding.colors.mutedText }}>
              This action cannot be undone. You will need to send a new invitation if you want to link again.
            </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnlinkAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Unlink Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Wizard */}
      {showEditWizard && (
        <CreateClientWizard
          mode="edit"
          hideClientType={true}
          initialData={clientToWizardData(clientData)}
          clientGroups={[]}
          asPage={false}
          title="Edit Profile"
          onClose={() => setShowEditWizard(false)}
          onSave={(data) => {
            // Handle save - update client data
            console.log('Saving profile data:', data);
            toast.success('Profile updated successfully');
            setShowEditWizard(false);
            // In a real app, you would update the client data here
          }}
        />
      )}
    </ClientPortalLayout>
  );
}
