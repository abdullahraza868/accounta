import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Plus,
  GripVertical,
  Trash2,
  Users,
  FileSignature,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  MousePointer,
  User,
  Building2,
  UserPlus,
  Tag,
  Briefcase,
  Check,
  Heart,
  PenLine,
  Calendar,
  Square,
  Home,
  Cake,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { validateEmail } from '../../lib/emailValidation';

type RecipientType = 'signer';
type RecipientSourceType = 'client' | 'external' | 'spouse-tag' | 'firm';

type SignatureField = {
  id: string;
  type: 'signature' | 'initial' | 'date-signed' | 'text' | 'checkbox' | 'name' | 'company-name' | 'dob' | 'address';
  label: string;
  required: boolean;
  recipientId: string;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type Recipient = {
  id: string;
  name: string;
  email: string;
  type: RecipientType;
  order: number;
  color: string;
  sourceType: RecipientSourceType;
  clientId?: string;
  clientType?: 'Individual' | 'Business';
  companyName?: string;
  firmMemberId?: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  type: 'Individual' | 'Business';
  companyName?: string;
};

type FirmMember = {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

const recipientColors = [
  '#7C3AED',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
];

// Mock client data - in real app, this would come from API
const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', type: 'Individual' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Individual' },
  { id: '3', name: 'Michael Chen', email: 'mchen@techcorp.com', type: 'Business', companyName: 'TechCorp Inc.' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily.r@consulting.com', type: 'Business', companyName: 'Rodriguez Consulting' },
  { id: '5', name: 'David Lee', email: 'david.lee@email.com', type: 'Individual' },
  { id: '6', name: 'Jennifer Martinez', email: 'jmartinez@globalllc.com', type: 'Business', companyName: 'Global Solutions LLC' },
];

// Mock firm member data - in real app, this would come from API
const mockFirmMembers: FirmMember[] = [
  { id: '1', username: 'helper68210', email: 'helper68210@acounta.com', role: 'ADMIN', isActive: true },
  { id: '2', username: 'helper57893', email: 'helper57893@acounta.com', role: 'ADMIN', isActive: true },
  { id: '3', username: 'helper53040', email: 'helper53040@acounta.com', role: 'STAFF', isActive: true },
  { id: '4', username: 'john.accountant', email: 'john.accountant@acounta.com', role: 'PARTNER', isActive: true },
  { id: '5', username: 'sarah.cpa', email: 'sarah.cpa@acounta.com', role: 'MANAGER', isActive: true },
];

export function NewTemplateView() {
  const navigate = useNavigate();
  
  // Ref for auto-focusing template name input
  const templateNameInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'details' | 'upload' | 'recipients' | 'fields'>('details');
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['details']));
  
  const [templateName, setTemplateName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() - 1); // Default to previous year
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Category autocomplete states
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [savedCategories, setSavedCategories] = useState<string[]>([
    'Tax Returns',
    'Financial Statements',
    'Engagement Letters',
    'Client Agreements',
    'Compliance Documents',
  ]);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fields, setFields] = useState<SignatureField[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedFieldType, setSelectedFieldType] = useState<SignatureField['type'] | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  
  // Add Recipient Dialog states
  const [showAddRecipientDialog, setShowAddRecipientDialog] = useState(false);
  const [addRecipientStep, setAddRecipientStep] = useState<'choose' | 'client' | 'external' | 'firm'>('choose');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFirmMember, setSelectedFirmMember] = useState<FirmMember | null>(null);
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firmMemberSearch, setFirmMemberSearch] = useState('');
  const [signingOrder, setSigningOrder] = useState<'sequential' | 'simultaneous'>('sequential');
  
  // Dragging field states
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Resizing field states
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (validTypes.includes(file.type)) {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF or Word document');
    }
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setCategoryInputValue(value);
    setShowCategoryDropdown(false);
    
    // Add to saved categories if it's new
    if (!savedCategories.includes(value) && value.trim()) {
      setSavedCategories([...savedCategories, value]);
    }
  };

  const handleCategoryInputChange = (value: string) => {
    setCategoryInputValue(value);
    setCategory(value);
    setShowCategoryDropdown(true);
  };

  const filteredCategories = savedCategories.filter(cat =>
    cat.toLowerCase().includes(categoryInputValue.toLowerCase())
  );

  const openAddRecipientDialog = () => {
    setShowAddRecipientDialog(true);
    setAddRecipientStep('choose');
    setSelectedClient(null);
    setSelectedFirmMember(null);
    setExternalName('');
    setExternalEmail('');
    setEmailError('');
    setSigningOrder('sequential');
    setFirmMemberSearch('');
  };
  
  const handleEmailChange = (email: string) => {
    setExternalEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const closeAddRecipientDialog = () => {
    setShowAddRecipientDialog(false);
    setAddRecipientStep('choose');
  };

  const addFirmMemberImmediately = (member: FirmMember, role: RecipientType = 'signer') => {
    const newRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: member.username,
      email: member.email,
      type: role,
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'firm',
      firmMemberId: member.id,
    };
    
    setRecipients([...recipients, newRecipient]);
    closeAddRecipientDialog();
  };

  const addClientImmediately = (client: Client) => {
    const newRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: client.name,
      email: client.email,
      type: 'signer',
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'client',
      clientId: client.id,
      clientType: client.type,
      companyName: client.companyName,
    };
    
    setRecipients([...recipients, newRecipient]);
    closeAddRecipientDialog();
  };

  const addClientAndSpouseImmediately = () => {
    const clientRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: 'Client',
      email: '', // Tag - will be resolved later
      type: 'signer',
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'spouse-tag',
    };
    
    const spouseRecipient: Recipient = {
      id: `recipient-${Date.now() + 1}`,
      name: 'Spouse',
      email: '', // Tag - will be resolved later
      type: 'signer',
      order: recipients.length + 2,
      color: recipientColors[(recipients.length + 1) % recipientColors.length],
      sourceType: 'spouse-tag',
    };
    
    setRecipients([...recipients, clientRecipient, spouseRecipient]);
    closeAddRecipientDialog();
  };

  const confirmAddRecipient = () => {
    let newRecipient: Recipient | null = null;

    if (addRecipientStep === 'external' && externalName && externalEmail) {
      newRecipient = {
        id: `recipient-${Date.now()}`,
        name: externalName,
        email: externalEmail,
        type: 'signer',
        order: recipients.length + 1,
        color: recipientColors[recipients.length % recipientColors.length],
        sourceType: 'external',
      };
    }

    if (newRecipient) {
      setRecipients([...recipients, newRecipient]);
      closeAddRecipientDialog();
    }
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(recipients.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    setFields(fields.filter(f => f.recipientId !== id));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };
  
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string, field: SignatureField) => {
    e.stopPropagation();
    const fieldElement = e.currentTarget as HTMLElement;
    const rect = fieldElement.getBoundingClientRect();
    const parentRect = fieldElement.parentElement!.getBoundingClientRect();
    
    setDraggingField(fieldId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!draggingField) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    setFields(fields.map(f => 
      f.id === draggingField 
        ? { ...f, x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)) }
        : f
    ));
  };

  const handleFieldMouseUp = () => {
    setDraggingField(null);
    setResizingField(null);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, field: SignatureField) => {
    e.stopPropagation();
    setResizingField(fieldId);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({
      width: field.width || getFieldWidth(field.type),
      height: field.height || getFieldHeight(field.type),
    });
  };

  const handleResizeMouseMove = (e: React.MouseEvent, containerWidth: number) => {
    if (!resizingField) return;
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    // Convert pixel delta to percentage-based size adjustment
    const scale = containerWidth / 612; // 612px is base document width
    const newWidth = Math.max(30, resizeStartSize.width + deltaX / scale);
    const newHeight = Math.max(20, resizeStartSize.height + deltaY / scale);
    
    setFields(fields.map(f => 
      f.id === resizingField 
        ? { ...f, width: newWidth, height: newHeight }
        : f
    ));
  };
  
  const getFieldWidth = (type: SignatureField['type']): number => {
    switch (type) {
      case 'signature': return 140;
      case 'initial': return 50;
      case 'checkbox': return 20;
      case 'date-signed': return 100;
      case 'name': return 120;
      case 'company-name': return 140;
      case 'dob': return 100;
      case 'address': return 160;
      default: return 100;
    }
  };

  const getFieldHeight = (type: SignatureField['type']): number => {
    switch (type) {
      case 'signature': return 50;
      case 'initial': return 30;
      case 'checkbox': return 20;
      default: return 30;
    }
  };
  
  const placeFieldOnDocument = (x: number, y: number) => {
    if (!selectedFieldType || !selectedRecipient) return;
    
    const labelMap: Record<SignatureField['type'], string> = {
      'signature': 'Signature',
      'initial': 'Initial',
      'date-signed': 'Date Signed',
      'text': 'Text',
      'checkbox': 'Checkbox',
      'name': 'Name',
      'company-name': 'Company Name',
      'dob': 'DOB',
      'address': 'Address',
    };
    
    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label: labelMap[selectedFieldType] || selectedFieldType,
      required: selectedFieldType === 'signature',
      recipientId: selectedRecipient,
      page: currentPage,
      x,
      y,
      width: getFieldWidth(selectedFieldType),
      height: getFieldHeight(selectedFieldType),
    };
    setFields([...fields, newField]);
    setSelectedFieldType(null);
  };

  const handleSave = () => {
    console.log('Saving template:', {
      templateName,
      year,
      category,
      description,
      uploadedFile,
      recipients,
      fields,
    });
    navigate('/signature-templates');
  };

  const canProceedFromDetails = Boolean(templateName && year && category);
  const canProceedFromUpload = Boolean(uploadedFile);
  const canProceedFromRecipients = recipients.length > 0 && recipients.every(r => r.name && (r.email || r.sourceType === 'spouse-tag'));
  const canSave = canProceedFromDetails && canProceedFromUpload && canProceedFromRecipients && fields.length > 0;
  
  const goBack = () => {
    setAutoAdvanceEnabled(false);
    if (step === 'upload') setStep('details');
    else if (step === 'recipients') setStep('upload');
    else if (step === 'fields') setStep('recipients');
  };
  
  useEffect(() => {
    setVisitedSteps(prev => new Set(prev).add(step));
  }, [step]);
  
  useEffect(() => {
    if (autoAdvanceEnabled && step === 'upload' && canProceedFromUpload) {
      const timer = setTimeout(() => setStep('recipients'), 300);
      return () => clearTimeout(timer);
    }
  }, [step, canProceedFromUpload, autoAdvanceEnabled]);

  // Sync categoryInputValue with category
  useEffect(() => {
    setCategoryInputValue(category);
  }, [category]);
  
  // Auto-focus template name input when on details step
  useEffect(() => {
    if (step === 'details' && templateNameInputRef.current) {
      // Small timeout to ensure the DOM is ready
      setTimeout(() => {
        templateNameInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/signature-templates')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div>
              <h1 className="flex items-center gap-2">
                <FileSignature className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                New Signature Template
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === 'details' && 'Enter template information'}
                {step === 'upload' && 'Upload your document'}
                {step === 'recipients' && 'Add recipients who will sign'}
                {step === 'fields' && 'Place signature fields on document'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {step !== 'details' && (
              <Button
                variant="outline"
                onClick={goBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/signature-templates')}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => {
              if (visitedSteps.has('details')) {
                setAutoAdvanceEnabled(false);
                setStep('details');
              }
            }}
            disabled={!visitedSteps.has('details')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === 'details'
                  ? 'text-white'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              }`}
              style={step === 'details' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              {step === 'details' ? '1' : '✓'}
            </div>
            <span className={`text-sm ${step === 'details' ? '' : 'text-gray-500 dark:text-gray-400'}`}>
              Details
            </span>
          </button>
          
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 min-w-[40px]" />
          
          <button
            onClick={() => {
              if (visitedSteps.has('upload')) {
                setAutoAdvanceEnabled(false);
                setStep('upload');
              }
            }}
            disabled={!visitedSteps.has('upload')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === 'upload'
                  ? 'text-white'
                  : visitedSteps.has('upload')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              style={step === 'upload' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              {visitedSteps.has('upload') && step !== 'upload' ? '✓' : '2'}
            </div>
            <span className={`text-sm ${step === 'upload' ? '' : 'text-gray-500 dark:text-gray-400'}`}>
              Upload
            </span>
          </button>
          
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 min-w-[40px]" />
          
          <button
            onClick={() => {
              if (visitedSteps.has('recipients')) {
                setAutoAdvanceEnabled(false);
                setStep('recipients');
              }
            }}
            disabled={!visitedSteps.has('recipients')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === 'recipients'
                  ? 'text-white'
                  : visitedSteps.has('recipients')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              style={step === 'recipients' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              {visitedSteps.has('recipients') && step !== 'recipients' ? '✓' : '3'}
            </div>
            <span className={`text-sm ${step === 'recipients' ? '' : 'text-gray-500 dark:text-gray-400'}`}>
              Recipients
            </span>
          </button>
          
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 min-w-[40px]" />
          
          <button
            onClick={() => {
              if (visitedSteps.has('fields')) {
                setAutoAdvanceEnabled(false);
                setStep('fields');
              }
            }}
            disabled={!visitedSteps.has('fields')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === 'fields'
                  ? 'text-white'
                  : visitedSteps.has('fields')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              style={step === 'fields' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              4
            </div>
            <span className={`text-sm ${step === 'fields' ? '' : 'text-gray-500 dark:text-gray-400'}`}>
              Place Fields
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {step === 'details' && (
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2" style={{ borderColor: 'var(--primaryColor)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primaryColor)' }}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2 flex items-center gap-2">
                      Create Your Template
                      <Badge variant="outline" className="ml-2">Step 1 of 4</Badge>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Fill in the required information below to get started. All fields marked with * are required.
                    </p>
                    
                    {/* Checklist */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${templateName ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          {templateName && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={templateName ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>
                          Template Name
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${year ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          {year && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={year ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>
                          Year Selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${category ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          {category && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={category ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>
                          Category Set
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form Card */}
              <Card className="p-8">
                <div className="space-y-8">
                  {/* Template Name */}
                  <div className={`p-5 rounded-lg border-2 transition-all ${templateName ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className={`w-5 h-5 mt-0.5 ${templateName ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <div className="flex-1">
                        <Label htmlFor="template-name" className="text-base flex items-center gap-2">
                          Template Name
                          <span className="text-red-500">*</span>
                          {!templateName && (
                            <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                              Required - Start typing
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Give your template a clear, descriptive name
                        </p>
                      </div>
                    </div>
                    <Input
                      ref={templateNameInputRef}
                      id="template-name"
                      placeholder="e.g., W-9 Form, Engagement Letter, Tax Return 2024"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="text-base h-11"
                      autoComplete="off"
                    />
                  </div>

                  {/* Year and Category */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Year */}
                    <div className={`p-5 rounded-lg border-2 transition-all ${year ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <Calendar className={`w-5 h-5 mt-0.5 ${year ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <div className="flex-1">
                          <Label htmlFor="year" className="text-base flex items-center gap-2">
                            Year
                            <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Select the applicable year
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          variant={year === new Date().getFullYear() - 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setYear(new Date().getFullYear() - 1)}
                          className="flex-1"
                          style={year === new Date().getFullYear() - 1 ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {new Date().getFullYear() - 1}
                        </Button>
                        <Button
                          type="button"
                          variant={year === new Date().getFullYear() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setYear(new Date().getFullYear())}
                          className="flex-1"
                          style={year === new Date().getFullYear() ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {new Date().getFullYear()}
                        </Button>
                      </div>
                      <Select
                        value={year.toString()}
                        onValueChange={(value) => setYear(parseInt(value))}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Or select a different year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Category */}
                    <div className={`p-5 rounded-lg border-2 transition-all relative ${category ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <Tag className={`w-5 h-5 mt-0.5 ${category ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <div className="flex-1">
                          <Label htmlFor="category" className="text-base flex items-center gap-2">
                            Category
                            <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Organize by document type
                          </p>
                        </div>
                      </div>
                      <Input
                        id="category"
                        placeholder="Type or select category"
                        value={categoryInputValue}
                        onChange={(e) => handleCategoryInputChange(e.target.value)}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowCategoryDropdown(false), 200);
                        }}
                        className="text-base h-11"
                      />
                      {showCategoryDropdown && (filteredCategories.length > 0 || categoryInputValue) && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto left-0 right-0 mx-5">
                          {filteredCategories.length > 0 ? (
                            <>
                              {filteredCategories.map((cat, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleCategorySelect(cat)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                >
                                  {cat}
                                </button>
                              ))}
                            </>
                          ) : null}
                          {categoryInputValue && !savedCategories.includes(categoryInputValue) && (
                            <button
                              onClick={() => handleCategorySelect(categoryInputValue)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-t border-gray-200 dark:border-gray-700"
                              style={{ color: 'var(--primaryColor)' }}
                            >
                              <Plus className="w-3 h-3 inline mr-2" />
                              Create "{categoryInputValue}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Description - Optional */}
                  <div className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/20">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-5 h-5 mt-0.5 text-gray-400" />
                      <div className="flex-1">
                        <Label htmlFor="description" className="text-base flex items-center gap-2">
                          Description
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add additional notes or context about this template
                        </p>
                      </div>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="Add any notes about this template..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => {
                      if (canProceedFromDetails) {
                        setAutoAdvanceEnabled(true);
                        setStep('upload');
                      }
                    }}
                    disabled={!canProceedFromDetails}
                    style={{
                      backgroundColor: canProceedFromDetails ? 'var(--primaryColor)' : undefined,
                      borderColor: canProceedFromDetails ? 'var(--primaryColor)' : undefined,
                    }}
                    className="disabled:opacity-50"
                  >
                    Continue to Upload
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {step === 'upload' && (
            <Card className="p-6">
              <h2 className="mb-2">Upload Document</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Upload the document that will be used for this template
              </p>

              {uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <div className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <p className="text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2">Drag and drop your document here</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or click anywhere to browse files
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInput}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-upload')?.click();
                    }}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Supported formats: PDF, DOC, DOCX (Max 25MB)
                  </p>
                </div>
              )}

              {uploadedFile && (
                <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => {
                      if (canProceedFromUpload) {
                        setAutoAdvanceEnabled(true);
                        setStep('recipients');
                      }
                    }}
                    disabled={!canProceedFromUpload}
                    style={{
                      backgroundColor: canProceedFromUpload ? 'var(--primaryColor)' : undefined,
                      borderColor: canProceedFromUpload ? 'var(--primaryColor)' : undefined,
                    }}
                    className="disabled:opacity-50"
                  >
                    Continue to Recipients
                  </Button>
                </div>
              )}
            </Card>
          )}

          {step === 'recipients' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="mb-1">Recipients</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add people who need to sign or receive this document
                    </p>
                  </div>
                  <Button
                    onClick={openAddRecipientDialog}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Recipient
                  </Button>
                </div>

                {recipients.length === 0 ? (
                  <button
                    onClick={openAddRecipientDialog}
                    className="w-full text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group"
                  >
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      No recipients added yet
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      Click anywhere to add your first recipient
                    </p>
                  </button>
                ) : (
                  <div className="space-y-0">
                    {/* Recipients list with visual signing order indicators */}
                    {recipients.map((recipient, index) => {
                      const getRecipientIcon = () => {
                        if (recipient.sourceType === 'client') {
                          return recipient.clientType === 'Business' ? (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <User className="w-5 h-5 text-purple-600" />
                          );
                        } else if (recipient.sourceType === 'external') {
                          return <UserPlus className="w-5 h-5 text-green-600" />;
                        } else if (recipient.sourceType === 'spouse-tag') {
                          return <Heart className="w-5 h-5 text-pink-600" />;
                        } else if (recipient.sourceType === 'firm') {
                          return <Briefcase className="w-5 h-5 text-gray-600" />;
                        }
                        return <User className="w-5 h-5 text-gray-600" />;
                      };

                      const isSequential = signingOrder === 'sequential';
                      // Each recipient gets progressively more indented in sequential mode
                      const indentLevel = isSequential ? index : 0;
                      const marginLeft = indentLevel * 32; // 32px (8 tailwind units) per level

                      return (
                        <div key={recipient.id} className="relative">
                          <div
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow mt-3"
                            style={{ 
                              borderLeftWidth: '4px', 
                              borderLeftColor: recipient.color,
                              marginLeft: `${marginLeft}px`
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 pt-1">
                                <div className="relative">
                                  <span className={`text-sm min-w-[20px] inline-flex items-center justify-center w-7 h-7 rounded-full ${
                                    isSequential 
                                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium'
                                  }`}>
                                    {index + 1}
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {getRecipientIcon()}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{recipient.name || 'Unnamed Recipient'}</span>
                                      {recipient.sourceType === 'client' && (
                                        <Badge variant="secondary" className="text-xs">
                                          {recipient.clientType === 'Business' ? 'Business' : 'Individual'}
                                        </Badge>
                                      )}
                                      {recipient.sourceType === 'external' && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                          External
                                        </Badge>
                                      )}
                                      {recipient.sourceType === 'spouse-tag' && (
                                        <Badge variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                                          Tag • 2 people
                                        </Badge>
                                      )}
                                      {recipient.sourceType === 'firm' && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                          Firm Member
                                        </Badge>
                                      )}
                                    </div>
                                    {recipient.companyName && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        {recipient.companyName}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {recipient.email || (recipient.sourceType === 'spouse-tag' ? 'Will be resolved to client and spouse' : 'No email')}
                                    </p>
                                    
                                    {/* Signer badge */}
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        <PenLine className="w-3 h-3 inline mr-1" />
                                        Signer
                                      </Badge>
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRecipient(recipient.id)}
                                    className="text-gray-400 hover:text-red-600 mt-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {recipients.length > 1 && (
                <Card className="p-6">
                  <h3 className="mb-3">Signing Order</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Choose how recipients should sign this document
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSigningOrder('sequential')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        signingOrder === 'sequential'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          signingOrder === 'sequential'
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {signingOrder === 'sequential' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">One After Another</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Recipients sign in order: 1, 2, 3...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-8 mt-2">
                        {recipients.slice(0, 3).map((recipient, idx) => (
                          <div key={recipient.id} className="flex items-center">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                              style={{ backgroundColor: recipient.color }}
                            >
                              {idx + 1}
                            </div>
                            {idx < Math.min(2, recipients.length - 1) && (
                              <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                            )}
                          </div>
                        ))}
                        {recipients.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">+{recipients.length - 3}</span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setSigningOrder('simultaneous')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        signingOrder === 'simultaneous'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          signingOrder === 'simultaneous'
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {signingOrder === 'simultaneous' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">All at Once</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            All recipients can sign simultaneously
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-8 mt-2">
                        {recipients.slice(0, 3).map((recipient) => (
                          <div
                            key={recipient.id}
                            className="w-6 h-6 rounded-full -ml-2 first:ml-0 border-2 border-white dark:border-gray-800"
                            style={{ backgroundColor: recipient.color }}
                          />
                        ))}
                        {recipients.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">+{recipients.length - 3}</span>
                        )}
                      </div>
                    </button>
                  </div>
                </Card>
              )}

              {recipients.length > 0 && (
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm mb-3">Ready for Field Placement</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Template Name:</span>
                      <span>{templateName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Document:</span>
                      <span>{uploadedFile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                      <span>{recipients.length} ({recipients.filter(r => r.type === 'signer').length} signers)</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (canProceedFromRecipients) {
                        setAutoAdvanceEnabled(true);
                        setStep('fields');
                        if (recipients.length > 0) {
                          setSelectedRecipient(recipients[0].id);
                        }
                      }
                    }}
                    disabled={!canProceedFromRecipients}
                    style={{
                      backgroundColor: canProceedFromRecipients ? 'var(--primaryColor)' : undefined,
                      borderColor: canProceedFromRecipients ? 'var(--primaryColor)' : undefined,
                    }}
                    className="w-full disabled:opacity-50"
                    size="lg"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Continue to Field Placement
                  </Button>
                </Card>
              )}
            </div>
          )}

          {step === 'fields' && (
            <div className="flex gap-6 h-[calc(100vh-280px)]">
              <div className="flex-1 flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px] text-center">
                        Page {currentPage} of 4
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                        {zoom}%
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className={`flex flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
                    {isFullscreen && (
                      <Button 
                        variant="ghost" 
                        size="lg"
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 z-[60] text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
                        title="Exit fullscreen"
                      >
                        <Minimize2 className="w-6 h-6" />
                      </Button>
                    )}
                    <div className="w-24 p-3 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pages</p>
                      <div className="space-y-2 flex-1 overflow-auto">
                        {[1, 2, 3, 4].map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-full h-20 border-2 rounded flex items-center justify-center text-xs transition-colors ${
                              currentPage === page
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-start justify-center">
                      <div 
                        className="shadow-lg relative overflow-hidden"
                        style={{ 
                          width: `${612 * (zoom / 100)}px`,
                          height: `${792 * (zoom / 100)}px`,
                          backgroundColor: 'white',
                        }}
                        onClick={(e) => {
                          if (!draggingField && !resizingField) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            placeFieldOnDocument(x, y);
                          }
                        }}
                        onMouseMove={(e) => {
                          handleFieldMouseMove(e);
                          handleResizeMouseMove(e, e.currentTarget.getBoundingClientRect().width);
                        }}
                        onMouseUp={handleFieldMouseUp}
                        onMouseLeave={handleFieldMouseUp}
                      >
                        <div className="absolute inset-0 p-8 text-sm text-gray-700 pointer-events-none">
                          <p className="mb-4"><strong>September 17, 2025</strong></p>
                          <p className="mb-4"><strong>Chair Powell&apos;s Press Conference</strong></p>
                          <p className="mb-2"><strong>PRELIMINARY</strong></p>
                          <p className="mb-4"><strong>Transcript of Chair Powell&apos;s Press Conference Opening Statement</strong></p>
                          <p className="mb-4"><strong>September 17, 2025</strong></p>
                          <p className="mb-4">
                            <strong>CHAIR POWELL.</strong> Good afternoon. My colleagues and I remain squarely focused on
                            achieving our dual mandate goals of maximum employment and stable prices for the benefit of
                            the American people.
                          </p>
                          <p className="mb-4">
                            While the unemployment rate remains low, it has shifted up. The shift in the balance of risks, today the Federal
                            Open Market Committee decided to lower our policy interest rate by 1/4 percentage point. We
                            also decided to continue to reduce our securities holdings. I will have more to say about
                            monetary policy after briefly reviewing economic developments.
                          </p>
                          <p className="mb-4">
                            Recent indicators suggest that growth of economic activity has continued. GDP rose at a
                            solid pace in the second quarter...
                          </p>
                        </div>

                        {fields
                          .filter(f => f.page === currentPage)
                          .map((field) => {
                            const recipient = recipients.find(r => r.id === field.recipientId);
                            const width = field.width || getFieldWidth(field.type);
                            const height = field.height || getFieldHeight(field.type);
                            
                            return (
                              <div
                                key={field.id}
                                className={`absolute border-2 rounded text-xs flex items-center justify-between gap-1 cursor-move hover:shadow-lg transition-shadow select-none group ${
                                  draggingField === field.id || resizingField === field.id ? 'shadow-2xl z-50' : ''
                                }`}
                                style={{
                                  left: `${field.x}%`,
                                  top: `${field.y}%`,
                                  width: `${width}px`,
                                  height: `${height}px`,
                                  borderColor: recipient?.color,
                                  backgroundColor: recipient?.color + '15',
                                  color: recipient?.color,
                                  padding: field.type === 'checkbox' ? '2px' : '4px 8px',
                                }}
                                onMouseDown={(e) => handleFieldMouseDown(e, field.id, field)}
                              >
                                {field.type === 'checkbox' ? (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <Square className="w-4 h-4" style={{ color: recipient?.color }} />
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-medium truncate flex-1">{field.label}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(field.id);
                                      }}
                                      className="hover:opacity-80 rounded p-0.5 transition-opacity flex-shrink-0"
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                                {/* Resize handle */}
                                <div
                                  className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{
                                    borderRight: `2px solid ${recipient?.color}`,
                                    borderBottom: `2px solid ${recipient?.color}`,
                                  }}
                                  onMouseDown={(e) => handleResizeMouseDown(e, field.id, field)}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="w-80">
                <Card className="p-6">
                  <h3 className="mb-4">Template Settings</h3>

                  <div>
                    <h4 className="text-sm mb-3">Select Recipient</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Choose who should fill out the fields you place
                    </p>
                    <div className="space-y-2">
                      {recipients.filter(r => r.type === 'signer').map((recipient) => (
                        <button
                          key={recipient.id}
                          onClick={() => setSelectedRecipient(recipient.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedRecipient === recipient.id
                              ? 'bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          style={{
                            borderColor: selectedRecipient === recipient.id ? recipient.color : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: recipient.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                {recipient.sourceType === 'spouse-tag' && recipient.name.includes('Spouse') ? 'Spouse' : 
                                 recipient.sourceType === 'spouse-tag' ? 'Client' :
                                 recipient.sourceType === 'external' ? 'External' :
                                 recipient.sourceType === 'firm' ? 'Firm Staff' : 'Client'}
                              </p>
                              <p className="text-sm truncate">{recipient.name}</p>
                              {recipient.email && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                  {recipient.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                            {fields.filter(f => f.recipientId === recipient.id).length} fields placed
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedRecipient && (
                    <div className="mt-6">
                      <h4 className="text-sm mb-3">Add Field to Document</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'signature', label: 'Signature', icon: FileSignature },
                          { value: 'initial', label: 'Initials', icon: PenLine },
                          { value: 'name', label: 'Name', icon: User },
                          { value: 'date-signed', label: 'Date Signed', icon: Calendar },
                          { value: 'checkbox', label: 'Checkbox', icon: Square },
                          { value: 'company-name', label: 'Company', icon: Building2 },
                          { value: 'dob', label: 'DOB', icon: Cake },
                          { value: 'address', label: 'Address', icon: Home },
                        ].map((field) => {
                          const Icon = field.icon;
                          return (
                            <Button
                              key={field.value}
                              variant={selectedFieldType === field.value ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedFieldType(field.value as SignatureField['type'])}
                              className="text-xs justify-start"
                              style={
                                selectedFieldType === field.value
                                  ? { backgroundColor: 'var(--primaryColor)' }
                                  : {}
                              }
                            >
                              <Icon className="w-3.5 h-3.5 mr-1.5" />
                              {field.label}
                            </Button>
                          );
                        })}
                      </div>
                      {selectedFieldType && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            Click on the document to place a {selectedFieldType} field
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFieldType(null)}
                            className="w-full"
                          >
                            <X className="w-3 h-3 mr-1.5" />
                            Cancel Field Placement
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm mb-3">Summary</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Fields:</span>
                        <span>{fields.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                        <span>{recipients.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Page:</span>
                        <span>{currentPage} of 4</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleSave}
                      disabled={!canSave}
                      style={{
                        backgroundColor: canSave ? 'var(--primaryColor)' : undefined,
                        borderColor: canSave ? 'var(--primaryColor)' : undefined,
                      }}
                      className="w-full disabled:opacity-50"
                      size="lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Finish Template
                    </Button>
                    {!canSave && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Add at least one field to finish
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Recipient Dialog */}
      <Dialog open={showAddRecipientDialog} onOpenChange={setShowAddRecipientDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="new-template-add-recipient-description">
          <DialogHeader>
            <DialogTitle>
              {addRecipientStep === 'choose' && 'Add Recipient'}
              {addRecipientStep === 'client' && 'Select Client'}
              {addRecipientStep === 'external' && 'Add External Recipient'}
              {addRecipientStep === 'firm' && 'Select Firm Member'}
            </DialogTitle>
            <DialogDescription id="new-template-add-recipient-description">
              {addRecipientStep === 'choose' && 'Choose how you want to add a recipient'}
              {addRecipientStep === 'client' && 'Search and select a client from your database'}
              {addRecipientStep === 'external' && 'Add someone outside your client list'}
              {addRecipientStep === 'firm' && 'Select a member from your firm'}
            </DialogDescription>
          </DialogHeader>

          {addRecipientStep === 'choose' && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => setAddRecipientStep('client')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">Client</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select from your clients</p>
                </div>
              </button>

              <button
                onClick={() => addClientAndSpouseImmediately()}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">Client & Spouse</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send to both spouses</p>
                </div>
              </button>

              <button
                onClick={() => setAddRecipientStep('external')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">External Recipient</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add outside person</p>
                </div>
              </button>

              <button
                onClick={() => setAddRecipientStep('firm')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">Firm</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select firm member</p>
                </div>
              </button>
            </div>
          )}

          {addRecipientStep === 'client' && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="mb-2 block">Search and Select Client</Label>
                <Command className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CommandInput placeholder="Search clients by name or email..." />
                  <CommandList className="max-h-[400px]">
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {mockClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => addClientImmediately(client)}
                          className="flex items-center gap-3 cursor-pointer p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            client.type === 'Business' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                          )}>
                            {client.type === 'Business' ? (
                              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{client.name}</span>
                              {client.companyName && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">• {client.companyName}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{client.email}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {addRecipientStep === 'external' && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="external-name" className="mb-2 block">Name</Label>
                <Input
                  id="external-name"
                  placeholder="Enter recipient name"
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="external-email" className="mb-2 block">Email</Label>
                <Input
                  id="external-email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={externalEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={emailError ? 'border-red-500 dark:border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{emailError}</p>
                )}
              </div>



              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  Back
                </Button>
                <Button
                  onClick={confirmAddRecipient}
                  disabled={!externalName || !externalEmail || !!emailError}
                  style={{ backgroundColor: (externalName && externalEmail && !emailError) ? 'var(--primaryColor)' : undefined }}
                >
                  Add Recipient
                </Button>
              </div>
            </div>
          )}



          {addRecipientStep === 'firm' && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a firm member to add as a recipient. They will be added immediately.
              </p>

              <Input
                placeholder="Search firm members..."
                value={firmMemberSearch}
                onChange={(e) => setFirmMemberSearch(e.target.value)}
                className="w-full"
              />
              
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {(() => {
                  const filteredMembers = mockFirmMembers
                    .filter(member => member.isActive)
                    .filter(member => 
                      firmMemberSearch === '' ||
                      member.username.toLowerCase().includes(firmMemberSearch.toLowerCase()) ||
                      member.email.toLowerCase().includes(firmMemberSearch.toLowerCase())
                    );

                  if (filteredMembers.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {firmMemberSearch ? 'No firm members match your search' : 'No active firm members found'}
                        </p>
                      </div>
                    );
                  }

                  return filteredMembers.map((member) => {
                    // Generate initials from username
                    const initials = member.username
                      .split(/[._-]/)
                      .map(part => part[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    
                    // Generate a consistent color based on username
                    const colors = [
                      'bg-purple-500',
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-pink-500',
                      'bg-indigo-500',
                    ];
                    const colorIndex = member.username.charCodeAt(0) % colors.length;
                    const bgColor = colors[colorIndex];

                    return (
                      <button
                        key={member.id}
                        onClick={() => addFirmMemberImmediately(member)}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all text-left group"
                      >
                        <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 transition-transform`}>
                          <span className="text-lg">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{member.username}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs mb-1">{member.role}</Badge>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>



              <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
