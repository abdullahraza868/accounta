import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Plus,
  Trash2,
  Mail,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type DocumentRequest = {
  id: string;
  documentType: string;
  description: string;
};

const commonTaxDocuments = [
  { value: 'w2', label: 'W-2 Form', description: 'Wage and Tax Statement from employer' },
  { value: '1099-int', label: '1099-INT', description: 'Interest Income' },
  { value: '1099-div', label: '1099-DIV', description: 'Dividends and Distributions' },
  { value: '1099-misc', label: '1099-MISC', description: 'Miscellaneous Income' },
  { value: '1099-nec', label: '1099-NEC', description: 'Nonemployee Compensation' },
  { value: '1099-b', label: '1099-B', description: 'Proceeds from Broker Transactions' },
  { value: '1099-r', label: '1099-R', description: 'Distributions from Pensions, Annuities, etc.' },
  { value: '1098', label: '1098', description: 'Mortgage Interest Statement' },
  { value: '1098-e', label: '1098-E', description: 'Student Loan Interest Statement' },
  { value: '1098-t', label: '1098-T', description: 'Tuition Statement' },
  { value: '5498', label: '5498', description: 'IRA Contribution Information' },
  { value: 'schedule-k1', label: 'Schedule K-1', description: 'Partner\'s Share of Income, Deductions, Credits' },
  { value: 'property-tax', label: 'Property Tax Statement', description: 'Real estate property tax documents' },
  { value: 'charitable', label: 'Charitable Donation Receipts', description: 'Documentation of charitable contributions' },
  { value: 'medical', label: 'Medical Expenses', description: 'Healthcare and medical expense receipts' },
  { value: 'business-expenses', label: 'Business Expenses', description: 'Business-related expense documentation' },
  { value: 'mileage', label: 'Mileage Log', description: 'Business mileage documentation' },
  { value: 'home-office', label: 'Home Office Expenses', description: 'Home office deduction documentation' },
  { value: 'estimated-tax', label: 'Estimated Tax Payments', description: 'Quarterly estimated tax payment records' },
  { value: 'prior-return', label: 'Prior Year Tax Return', description: 'Previous year\'s tax return' },
  { value: 'custom', label: 'Custom Document', description: 'Add your own document type' },
];

export function RequestDocumentsView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const [recipient, setRecipient] = useState('client');
  const [message, setMessage] = useState('Please provide the following documents for your 2024 tax return:');
  const [requests, setRequests] = useState<DocumentRequest[]>([
    { id: '1', documentType: 'w2', description: 'Wage and Tax Statement from employer' }
  ]);

  const handleAddRequest = () => {
    setRequests([...requests, {
      id: Date.now().toString(),
      documentType: '',
      description: ''
    }]);
  };

  const handleRemoveRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleDocumentTypeChange = (id: string, value: string) => {
    const docInfo = commonTaxDocuments.find(d => d.value === value);
    setRequests(requests.map(r => 
      r.id === id 
        ? { 
            ...r, 
            documentType: value,
            description: value === 'custom' ? '' : (docInfo?.description || '')
          }
        : r
    ));
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, description: value } : r
    ));
  };

  const handleSendRequest = () => {
    const validRequests = requests.filter(r => r.documentType && r.description);
    if (validRequests.length === 0) {
      toast.error('Please add at least one document request');
      return;
    }

    toast.success(`Document request sent to ${recipient === 'both' ? 'client and spouse' : recipient}`);
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mb-4 -ml-2"
            style={{ color: branding.colors.linkColor }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>

          <h1 className="text-3xl mb-2" style={{ color: branding.colors.headingText }}>
            Request Documents
          </h1>
          <p style={{ color: branding.colors.mutedText }}>
            Create a document request to send to your client
          </p>
        </div>

        <div className="space-y-6">
          {/* Recipient Selection */}
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              background: branding.colors.cardBackground,
              borderColor: branding.colors.border 
            }}
          >
            <Label style={{ color: branding.colors.bodyText }} className="mb-3 block">
              Send Request To
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setRecipient('client')}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: recipient === 'client' ? branding.colors.primaryButton : branding.colors.border,
                  background: recipient === 'client' ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                }}
              >
                <div style={{ color: branding.colors.headingText }}>Client</div>
                <div className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>John Smith</div>
              </button>
              <button
                onClick={() => setRecipient('spouse')}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: recipient === 'spouse' ? branding.colors.primaryButton : branding.colors.border,
                  background: recipient === 'spouse' ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                }}
              >
                <div style={{ color: branding.colors.headingText }}>Spouse</div>
                <div className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>Sarah Smith</div>
              </button>
              <button
                onClick={() => setRecipient('both')}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: recipient === 'both' ? branding.colors.primaryButton : branding.colors.border,
                  background: recipient === 'both' ? `${branding.colors.primaryButton}10` : branding.colors.cardBackground,
                }}
              >
                <div style={{ color: branding.colors.headingText }}>Both</div>
                <div className="text-sm mt-1" style={{ color: branding.colors.mutedText }}>Client & Spouse</div>
              </button>
            </div>
          </div>

          {/* Message */}
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              background: branding.colors.cardBackground,
              borderColor: branding.colors.border 
            }}
          >
            <Label style={{ color: branding.colors.bodyText }} className="mb-3 block">
              Message
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              style={{ 
                background: branding.colors.inputBackground,
                borderColor: branding.colors.inputBorder,
                color: branding.colors.inputText
              }}
            />
          </div>

          {/* Document Requests */}
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              background: branding.colors.cardBackground,
              borderColor: branding.colors.border 
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Label style={{ color: branding.colors.bodyText }}>
                Documents Needed ({requests.length})
              </Label>
              <Button
                onClick={handleAddRequest}
                size="sm"
                variant="outline"
                style={{
                  borderColor: branding.colors.primaryButton,
                  color: branding.colors.primaryButton,
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>

            <div className="space-y-4">
              {requests.map((request, index) => (
                <div 
                  key={request.id}
                  className="p-4 rounded-lg border"
                  style={{ 
                    background: branding.colors.inputBackground,
                    borderColor: branding.colors.inputBorder 
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-xs mb-2 block" style={{ color: branding.colors.mutedText }}>
                          Document Type
                        </Label>
                        <Select 
                          value={request.documentType} 
                          onValueChange={(value) => handleDocumentTypeChange(request.id, value)}
                        >
                          <SelectTrigger 
                            style={{ 
                              background: branding.colors.cardBackground,
                              borderColor: branding.colors.border,
                              color: branding.colors.inputText
                            }}
                          >
                            <SelectValue placeholder="Select document type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {commonTaxDocuments.map(doc => (
                              <SelectItem key={doc.value} value={doc.value}>
                                {doc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs mb-2 block" style={{ color: branding.colors.mutedText }}>
                          Description / Notes
                        </Label>
                        <Textarea
                          value={request.description}
                          onChange={(e) => handleDescriptionChange(request.id, e.target.value)}
                          placeholder={request.documentType === 'custom' ? 'Enter custom document description...' : 'Add additional notes...'}
                          rows={2}
                          style={{ 
                            background: branding.colors.cardBackground,
                            borderColor: branding.colors.border,
                            color: branding.colors.inputText
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveRequest(request.id)}
                      className="p-2 rounded-lg transition-colors mt-6"
                      style={{ color: branding.colors.dangerColor }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div 
                  className="p-8 rounded-lg border-2 border-dashed text-center"
                  style={{ borderColor: branding.colors.border }}
                >
                  <Mail className="w-12 h-12 mx-auto mb-3" style={{ color: branding.colors.mutedText }} />
                  <p style={{ color: branding.colors.mutedText }}>
                    No documents added yet. Click "Add Document" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              style={{
                background: branding.colors.primaryButton,
                color: branding.colors.primaryButtonText,
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
