import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBranding } from '../../../contexts/BrandingContext';
import { Button } from '../../../components/ui/button';
import { Check, XCircle, Loader2, Users, Mail, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

export default function HouseholdInvitationResponse() {
  const { branding } = useBranding();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'valid' | 'invalid' | 'accepted' | 'rejected' | 'expired'>('valid');
  
  // Mock invitation data - replace with API call
  const [invitationData, setInvitationData] = useState<{
    senderName: string;
    senderEmail: string;
    recipientEmail: string;
    sentDate: Date;
    expiresDate: Date;
  } | null>(null);

  useEffect(() => {
    // Get invitation token from URL
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      setLoading(false);
      return;
    }

    // Simulate API call to validate token and get invitation details
    setTimeout(() => {
      // Mock validation - replace with actual API call
      setInvitationData({
        senderName: 'John Doe',
        senderEmail: 'john.doe@example.com',
        recipientEmail: 'jane.doe@example.com',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expiresDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      });
      setStatus('valid');
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleAccept = () => {
    setProcessing(true);
    
    // Simulate API call to accept invitation
    setTimeout(() => {
      setStatus('accepted');
      setProcessing(false);
      toast.success('Household link accepted successfully!');
      
      // Redirect to login or dashboard after 3 seconds
      setTimeout(() => {
        navigate('/client-portal/login');
      }, 3000);
    }, 1500);
  };

  const handleReject = () => {
    if (!confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    setProcessing(true);
    
    // Simulate API call to reject invitation
    setTimeout(() => {
      setStatus('rejected');
      setProcessing(false);
      toast.error('Invitation declined');
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: branding.colors.pageBackground }}
    >
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={branding.images.primaryLogo} 
            alt="Logo" 
            className="h-12 mx-auto mb-4"
          />
          <h1 style={{ color: branding.colors.headingText }}>
            Household Linking Invitation
          </h1>
        </div>

        {/* Main Card */}
        <div
          className="rounded-lg p-8 border"
          style={{
            background: branding.colors.cardBackground,
            borderColor: branding.colors.borderColor,
          }}
        >
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 
                  className="w-12 h-12 mx-auto mb-4 animate-spin"
                  style={{ color: branding.colors.primaryButton }}
                />
                <p style={{ color: branding.colors.bodyText }}>
                  Validating invitation...
                </p>
              </motion.div>
            )}

            {/* Invalid/Expired Token */}
            {!loading && (status === 'invalid' || status === 'expired') && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: '#FEE2E2' }}
                >
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-xl mb-2" style={{ color: branding.colors.headingText }}>
                  {status === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
                </h2>
                <p className="mb-6" style={{ color: branding.colors.mutedText }}>
                  {status === 'expired' 
                    ? 'This invitation has expired. Please ask your spouse to send a new invitation.'
                    : 'This invitation link is invalid or has already been used.'}
                </p>
                <Button
                  onClick={() => navigate('/client-portal/login')}
                  style={{
                    background: branding.colors.primaryButton,
                    color: branding.colors.primaryButtonText,
                  }}
                >
                  Go to Login
                </Button>
              </motion.div>
            )}

            {/* Valid Invitation - Accept/Reject */}
            {!loading && status === 'valid' && invitationData && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-center mb-6">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ background: `${branding.colors.primaryButton}15` }}
                  >
                    <Users 
                      className="w-10 h-10"
                      style={{ color: branding.colors.primaryButton }}
                    />
                  </div>
                  <h2 className="text-xl mb-2" style={{ color: branding.colors.headingText }}>
                    You've Been Invited!
                  </h2>
                  <p style={{ color: branding.colors.mutedText }}>
                    Link your household to share tax deliverables
                  </p>
                </div>

                {/* Invitation Details */}
                <div 
                  className="p-4 rounded-lg mb-6"
                  style={{ background: branding.colors.pageBackground }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" style={{ color: branding.colors.mutedText }} />
                      <div>
                        <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                          From
                        </p>
                        <p className="font-medium" style={{ color: branding.colors.headingText }}>
                          {invitationData.senderName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: branding.colors.mutedText }} />
                      <div>
                        <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                          Sender Email
                        </p>
                        <p className="text-sm" style={{ color: branding.colors.bodyText }}>
                          {invitationData.senderEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: branding.colors.mutedText }} />
                      <div>
                        <p className="text-xs" style={{ color: branding.colors.mutedText }}>
                          Your Email
                        </p>
                        <p className="text-sm" style={{ color: branding.colors.bodyText }}>
                          {invitationData.recipientEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You'll Share */}
                <div 
                  className="p-4 rounded-lg mb-6 border-l-4"
                  style={{
                    background: `${branding.colors.primaryButton}08`,
                    borderColor: branding.colors.primaryButton,
                  }}
                >
                  <p className="text-sm font-medium mb-3" style={{ color: branding.colors.headingText }}>
                    What will be shared:
                  </p>
                  <ul className="text-sm space-y-2" style={{ color: branding.colors.bodyText }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5" style={{ color: branding.colors.primaryButton }} />
                      <span>Tax return deliverables (both of you will receive copies)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 mt-0.5" style={{ color: branding.colors.mutedText }} />
                      <span>Your document storage remains separate and private</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 mt-0.5" style={{ color: branding.colors.mutedText }} />
                      <span>No connection to your uploaded documents</span>
                    </li>
                  </ul>
                </div>

                {/* Expiration Notice */}
                <p className="text-xs text-center mb-6" style={{ color: branding.colors.mutedText }}>
                  This invitation expires on {invitationData.expiresDate.toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={processing}
                    style={{
                      background: branding.colors.primaryButton,
                      color: branding.colors.primaryButtonText,
                    }}
                    className="flex-1 gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Accept & Link Household
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Accepted State */}
            {status === 'accepted' && (
              <motion.div
                key="accepted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-600"
                >
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl mb-2" style={{ color: branding.colors.headingText }}>
                  Household Linked Successfully!
                </h2>
                <p className="mb-6" style={{ color: branding.colors.mutedText }}>
                  You and your spouse are now linked. Both of you will receive tax deliverables.
                </p>
                <p className="text-sm" style={{ color: branding.colors.mutedText }}>
                  Redirecting you to login...
                </p>
              </motion.div>
            )}

            {/* Rejected State */}
            {status === 'rejected' && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: '#FEE2E2' }}
                >
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-xl mb-2" style={{ color: branding.colors.headingText }}>
                  Invitation Declined
                </h2>
                <p className="mb-6" style={{ color: branding.colors.mutedText }}>
                  You have declined the household linking invitation.
                </p>
                <Button
                  onClick={() => navigate('/client-portal/login')}
                  style={{
                    background: branding.colors.primaryButton,
                    color: branding.colors.primaryButtonText,
                  }}
                >
                  Go to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: branding.colors.mutedText }}>
          Need help? Contact your accounting firm for assistance.
        </p>
      </div>
    </div>
  );
}
