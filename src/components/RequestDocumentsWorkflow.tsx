import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Mail, Save, ArrowLeft, FileText, 
  AlertCircle, Building2, User, ChevronDown, CheckCircle, ArrowRight 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { cn } from './ui/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

type ClientInfo = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  email?: string;
};

type DocumentRequest = {
  id: string;
  documentType: string;
  description: string;
  isCustom: boolean;
  category?: string;
};

type Props = {
  clients: ClientInfo[];
  onClose: () => void;
  onSend: (requests: DocumentRequest[], clients: ClientInfo[], emailBody: string, sendEmail: boolean) => void;
};

// Common IRS forms and tax documents
const DEFAULT_DOCUMENT_TYPES = [
  // Personal Income
  { category: 'Personal Income', items: ['W-2 Form', '1099-MISC', '1099-NEC', '1099-INT', '1099-DIV', '1099-B', '1099-R', 'SSA-1099', 'K-1 (1065, 1120-S, 1041)'] },
  // Business Income
  { category: 'Business Income', items: ['Schedule C', 'Schedule E', 'Schedule F', '1120', '1120-S', '1065', 'Profit & Loss Statement', 'Balance Sheet'] },
  // Deductions
  { category: 'Deductions', items: ['1098 (Mortgage Interest)', '1098-E (Student Loan Interest)', '1098-T (Tuition)', '5498 (IRA Contributions)', 'Property Tax Bill', 'Donation Receipts', 'Medical Receipts', 'Charitable Contribution Records'] },
  // Banking & Statements
  { category: 'Banking & Statements', items: ['Bank Statements', 'Investment Statements', 'Retirement Account Statements', 'Cryptocurrency Records', 'Credit Card Statements'] },
  // Real Estate
  { category: 'Real Estate', items: ['Closing Statement (HUD-1)', 'Rental Income Records', 'Rental Expense Records', 'Home Improvement Records', 'Property Sale Records'] },
  // Business Expenses
  { category: 'Business Expenses', items: ['Receipts', 'Invoices', 'Mileage Log', 'Vehicle Expenses', 'Office Expenses', 'Travel & Entertainment Expenses', 'Equipment Purchases'] },
  // Healthcare
  { category: 'Healthcare', items: ['1095-A (Health Insurance)', '1095-B', '1095-C', 'HSA Statements', 'Medical Expense Receipts'] },
  // Other
  { category: 'Other', items: ['State Tax Forms', 'Foreign Account Records (FBAR)', 'Education Credits Documentation', 'Estimated Tax Payment Records', 'Prior Year Tax Returns'] },
];

const CATEGORY_NAMES = DEFAULT_DOCUMENT_TYPES.map(c => c.category);

// Mock email templates - in real app, these would come from settings
const EMAIL_TEMPLATES = [
  { id: 'default', name: 'Default Request', subject: 'Document Request for Tax Preparation' },
  { id: 'reminder', name: 'Friendly Reminder', subject: 'Reminder: Documents Needed' },
  { id: 'urgent', name: 'Urgent Request', subject: 'URGENT: Documents Required by [Date]' },
  { id: 'followup', name: 'Follow-up Request', subject: 'Following Up: Tax Documents' },
];

export function RequestDocumentsWorkflow({ clients, onClose, onSend }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [emailSubject, setEmailSubject] = useState('Document Request for Tax Preparation');
  const [emailBody, setEmailBody] = useState(`Dear [Client Name],

We are preparing your tax return and need the following documents to complete your filing:

[Document List]

You can upload these documents securely through our client portal using the link below:
[Secure Upload Link]

Alternatively, you can log into your client portal at any time to upload documents.

If you have any questions, please don't hesitate to reach out.

Best regards,
[Your Firm Name]`);
  const [newDocumentType, setNewDocumentType] = useState('');
  const [newDocumentCategory, setNewDocumentCategory] = useState('Other');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customDocumentTypes, setCustomDocumentTypes] = useState<{ name: string; category: string }[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Personal Income']);

  const handleAddDocument = (documentType: string, isCustom: boolean = false, category?: string) => {
    if (documentRequests.some(req => req.documentType === documentType)) {
      toast.error('This document is already in the list');
      return;
    }

    const newRequest: DocumentRequest = {
      id: Date.now().toString(),
      documentType,
      description: '',
      isCustom,
      category,
    };

    setDocumentRequests([...documentRequests, newRequest]);
    toast.success(`Added ${documentType}`);
  };

  const handleRemoveDocument = (id: string) => {
    setDocumentRequests(documentRequests.filter(req => req.id !== id));
    toast.success('Document removed');
  };

  const handleUpdateDescription = (id: string, description: string) => {
    setDocumentRequests(documentRequests.map(req =>
      req.id === id ? { ...req, description } : req
    ));
  };

  const handleAddCustomDocument = () => {
    if (!newDocumentType.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    // Add to custom list for firm-wide use
    const customDoc = { name: newDocumentType, category: newDocumentCategory };
    if (!customDocumentTypes.some(d => d.name === newDocumentType)) {
      setCustomDocumentTypes([...customDocumentTypes, customDoc]);
    }

    handleAddDocument(newDocumentType, true, newDocumentCategory);
    setNewDocumentType('');
    setNewDocumentCategory('Other');
    setShowCustomDialog(false);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
    }
  };

  const handleNext = () => {
    if (documentRequests.length === 0) {
      toast.error('Please add at least one document to request');
      return;
    }
    setStep(2);
  };

  const handleSend = (sendEmail: boolean) => {
    if (documentRequests.length === 0) {
      toast.error('Please add at least one document to request');
      return;
    }

    onSend(documentRequests, clients, emailBody, sendEmail);
    
    if (sendEmail) {
      toast.success(`Document request sent to ${clients.length} client${clients.length > 1 ? 's' : ''}`);
    } else {
      toast.success(`Documents added to request list for ${clients.length} client${clients.length > 1 ? 's' : ''}`);
    }
    
    onClose();
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateEmailPreview = () => {
    let preview = emailBody;
    
    // Replace client name placeholder
    if (clients.length === 1) {
      preview = preview.replace('[Client Name]', clients[0].name);
    } else {
      preview = preview.replace('[Client Name]', 'Valued Client');
    }

    // Replace document list
    const docList = documentRequests.map((req, idx) => {
      let line = `${idx + 1}. ${req.documentType}`;
      if (req.description) {
        line += ` - ${req.description}`;
      }
      return line;
    }).join('\n');

    preview = preview.replace('[Document List]', docList);
    preview = preview.replace('[Secure Upload Link]', 'https://portal.yourfirm.com/upload?token=abc123xyz');
    preview = preview.replace('[Your Firm Name]', 'Your Accounting Firm');

    return preview;
  };

  // Group custom documents by category
  const customDocsByCategory = customDocumentTypes.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  onClose();
                }
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 2 ? 'Back' : 'Cancel'}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {step === 1 ? 'Select Documents to Request' : 'Review & Send Request'}
                </h2>
                <Badge variant="outline" className="text-xs">
                  Step {step} of 2
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Requesting from {clients.length} client{clients.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <div className="flex flex-col items-end gap-1">
                <Button
                  onClick={handleNext}
                  disabled={documentRequests.length === 0}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  Next: Review & Send
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs h-auto py-1"
                >
                  Cancel Request
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSend(false)}
                  disabled={documentRequests.length === 0}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add to List Only
                  <span className="text-xs text-gray-500 ml-1">(No Email)</span>
                </Button>
                <Button
                  onClick={() => handleSend(true)}
                  disabled={documentRequests.length === 0}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Email Request
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selected Clients */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">To:</span>
            {clients.map(client => (
              <Badge key={client.id} variant="outline" className="gap-1.5">
                {client.type === 'Business' ? (
                  <Building2 className="w-3 h-3 text-blue-600" />
                ) : (
                  <User className="w-3 h-3 text-green-600" />
                )}
                {client.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Document Selection */}
      {step === 1 && (
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Column - Document Catalog */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Document Catalog</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Click to add documents to your request
              </p>

              {/* Custom Document Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowCustomDialog(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Custom Document
              </Button>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <div className="p-2">
                {/* Custom Documents by Category */}
                {Object.entries(customDocsByCategory).map(([category, docs]) => (
                  <div key={`custom-${category}`} className="mb-3">
                    <button
                      onClick={() => toggleCategory(`Custom-${category}`)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm font-medium text-gray-900 dark:text-white"
                    >
                      <span>{category} (Custom)</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategories.includes(`Custom-${category}`) && "rotate-180"
                      )} />
                    </button>
                    {expandedCategories.includes(`Custom-${category}`) && (
                      <div className="mt-1 space-y-0.5 pl-2">
                        {docs.map((doc) => (
                          <button
                            key={doc}
                            onClick={() => handleAddDocument(doc, true, category)}
                            disabled={documentRequests.some(req => req.documentType === doc)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
                              documentRequests.some(req => req.documentType === doc)
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300"
                            )}
                          >
                            {doc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Standard Documents by Category */}
                {DEFAULT_DOCUMENT_TYPES.map((category) => (
                  <div key={category.category} className="mb-3">
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm font-medium text-gray-900 dark:text-white"
                    >
                      <span>{category.category}</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategories.includes(category.category) && "rotate-180"
                      )} />
                    </button>
                    {expandedCategories.includes(category.category) && (
                      <div className="mt-1 space-y-0.5 pl-2">
                        {category.items.map((doc) => (
                          <button
                            key={doc}
                            onClick={() => handleAddDocument(doc, false, category.category)}
                            disabled={documentRequests.some(req => req.documentType === doc)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
                              documentRequests.some(req => req.documentType === doc)
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300"
                            )}
                          >
                            {doc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Selected Documents */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Requested Documents ({documentRequests.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add descriptions to provide context for each document request
              </p>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <div className="p-4">
                {documentRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No documents selected</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      Select documents from the catalog on the left
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentRequests.map((request, index) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {request.documentType}
                                  </h4>
                                  {request.isCustom && (
                                    <Badge variant="outline" className="text-xs">Custom</Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveDocument(request.id)}
                                  className="h-auto px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-xs">Delete</span>
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Add description or instructions (optional)..."
                                value={request.description}
                                onChange={(e) => handleUpdateDescription(request.id, e.target.value)}
                                className="min-h-[60px] text-sm resize-none"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review & Send */}
      {step === 2 && (
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Column - Document Summary */}
          <div className="w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Documents to Request ({documentRequests.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review and remove documents if needed
              </p>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <div className="p-4 space-y-2">
                {documentRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-xs flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.documentType}
                            </p>
                            {request.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {request.description}
                              </p>
                            )}
                            {request.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {request.category}
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveDocument(request.id)}
                            className="h-auto px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-xs">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Email Template */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customize the email or click "Add to List Only" to skip sending
              </p>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <div className="p-4 space-y-4">
                {/* Important Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Choose How to Proceed
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                        You have two options:
                      </p>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span><strong>Send Email Request:</strong> Sends the email below and adds documents to tracking list</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span><strong>Add to List Only:</strong> Adds documents to tracking list without sending an email</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template" className="text-xs mb-1.5 block">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-xs mb-1.5 block">Subject Line</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="emailBody" className="text-xs mb-1.5 block">Email Body</Label>
                  <Textarea
                    id="emailBody"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="min-h-[200px] text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Available placeholders: [Client Name], [Document List], [Secure Upload Link], [Your Firm Name]
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Email Preview</Label>
                    <Badge variant="outline" className="text-xs">Live Preview</Badge>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject:</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{emailSubject}</p>
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {generateEmailPreview()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Document Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent aria-describedby="add-custom-document-description">
          <DialogHeader>
            <DialogTitle>Add Custom Document</DialogTitle>
            <DialogDescription id="add-custom-document-description">
              Create a custom document type to request from clients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="docName" className="text-sm mb-1.5 block">Document Name</Label>
              <Input
                id="docName"
                placeholder="e.g., Vehicle Registration, Business License..."
                value={newDocumentType}
                onChange={(e) => setNewDocumentType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomDocument();
                  }
                }}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="docCategory" className="text-sm mb-1.5 block">Category</Label>
              <Select value={newDocumentCategory} onValueChange={setNewDocumentCategory}>
                <SelectTrigger id="docCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_NAMES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This document will appear in the selected category for future use
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomDialog(false);
                setNewDocumentType('');
                setNewDocumentCategory('Other');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomDocument}
              disabled={!newDocumentType.trim()}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}