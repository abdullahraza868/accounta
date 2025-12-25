import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import {
  ArrowLeft,
  FileText,
  X,
  Plus,
  Trash2,
  Users,
  FileSignature,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  User,
  Building2,
  UserPlus,
  Briefcase,
  Check,
  Heart,
  PenLine,
  Calendar,
  Square,
  Home,
  Cake,
  AlertCircle,
  Send,
  GripVertical,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { validateEmail } from '../../lib/emailValidation';
import { toast } from 'sonner@2.0.3';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

// Draggable Recipient Component
type DraggableRecipientItemProps = {
  recipient: Recipient;
  index: number;
  moveRecipient: (dragIndex: number, hoverIndex: number) => void;
  removeRecipient: (id: string) => void;
  signingOrder: 'sequential' | 'simultaneous';
};

const DraggableRecipientItem = ({ 
  recipient, 
  index, 
  moveRecipient, 
  removeRecipient,
  signingOrder 
}: DraggableRecipientItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'recipient',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'recipient',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveRecipient(item.index, index);
        item.index = index;
      }
    },
  });

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
  const indentLevel = isSequential ? index : 0;
  const marginLeft = indentLevel * 32;

  return (
    <div ref={(node) => drag(drop(node))} className={cn("relative", isDragging && "opacity-50")}>
      <div
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow mt-3 cursor-move"
        style={{ 
          borderLeftWidth: '4px', 
          borderLeftColor: recipient.color,
          marginLeft: `${marginLeft}px`
        }}
      >
        <div className="flex items-start gap-3">
          <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
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
};

export function UploadDocumentView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref for auto-focusing document name input
  const documentNameInputRef = useRef<HTMLInputElement>(null);
  
  // State to track if document name input is focused
  const [isDocumentNameFocused, setIsDocumentNameFocused] = useState(false);
  
  const [step, setStep] = useState<'details' | 'recipients' | 'fields'>('details');
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['details']));
  
  const [documentName, setDocumentName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() - 1); // Default to previous year
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Initialize file from location state
  useEffect(() => {
    if (location.state?.file) {
      setUploadedFile(location.state.file as File);
    }
  }, []);
  
  // Auto-focus document name input when on details step
  useEffect(() => {
    if (step === 'details' && documentNameInputRef.current) {
      // Small timeout to ensure the DOM is ready
      setTimeout(() => {
        documentNameInputRef.current?.focus();
      }, 100);
    }
  }, [step]);
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fields, setFields] = useState<SignatureField[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedFieldType, setSelectedFieldType] = useState<SignatureField['type'] | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  
  // Add Recipient Dialog states
  const [showAddRecipientDialog, setShowAddRecipientDialog] = useState(false);
  const [addRecipientStep, setAddRecipientStep] = useState<'choose' | 'client' | 'external' | 'firm' | 'spouse-select'>('choose');
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
    setExternalName('');
    setExternalEmail('');
    setEmailError('');
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
    // Show client selector instead
    setAddRecipientStep('spouse-select');
  };

  const addClientAndSpouseWithClient = (client: Client) => {
    const clientRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: client.name,
      email: client.email,
      type: 'signer',
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'spouse-tag',
      clientId: client.id,
      clientType: client.type,
      companyName: client.companyName,
    };
    
    const spouseRecipient: Recipient = {
      id: `recipient-${Date.now() + 1}`,
      name: `${client.name.split(' ')[0]}'s Spouse`,
      email: '', // Tag - will be resolved later
      type: 'signer',
      order: recipients.length + 2,
      color: recipientColors[(recipients.length + 1) % recipientColors.length],
      sourceType: 'spouse-tag',
    };
    
    setRecipients([...recipients, clientRecipient, spouseRecipient]);
    closeAddRecipientDialog();
  };

  const addExternalRecipient = () => {
    if (!externalName.trim()) {
      setEmailError('Name is required');
      return;
    }
    if (!externalEmail.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(externalEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const newRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: externalName,
      email: externalEmail,
      type: 'signer',
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'external',
    };
    setRecipients([...recipients, newRecipient]);
    closeAddRecipientDialog();
  };

  const addFirmMemberImmediately = (member: FirmMember) => {
    const newRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: member.username,
      email: member.email,
      type: 'signer',
      order: recipients.length + 1,
      color: recipientColors[recipients.length % recipientColors.length],
      sourceType: 'firm',
      firmMemberId: member.id,
    };
    setRecipients([...recipients, newRecipient]);
    closeAddRecipientDialog();
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    // Also remove fields associated with this recipient
    setFields(fields.filter(f => f.recipientId !== id));
    if (selectedRecipient === id) {
      setSelectedRecipient('');
    }
  };

  const moveRecipient = (dragIndex: number, hoverIndex: number) => {
    const updatedRecipients = [...recipients];
    const [draggedRecipient] = updatedRecipients.splice(dragIndex, 1);
    updatedRecipients.splice(hoverIndex, 0, draggedRecipient);
    
    // Update order property
    const reorderedRecipients = updatedRecipients.map((recipient, index) => ({
      ...recipient,
      order: index + 1,
    }));
    
    setRecipients(reorderedRecipients);
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFieldType || !selectedRecipient) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const recipient = recipients.find(r => r.id === selectedRecipient);
    if (!recipient) return;

    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label: selectedFieldType.charAt(0).toUpperCase() + selectedFieldType.slice(1).replace('-', ' '),
      required: true,
      recipientId: selectedRecipient,
      page: currentPage,
      x: Math.max(0, Math.min(85, x)),
      y: Math.max(0, Math.min(90, y)),
      width: getFieldWidth(selectedFieldType),
      height: getFieldHeight(selectedFieldType),
    };

    setFields([...fields, newField]);
    setSelectedFieldType(null);
  };

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string, field: SignatureField) => {
    e.stopPropagation();
    const fieldElement = e.currentTarget as HTMLElement;
    const rect = fieldElement.getBoundingClientRect();
    
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
        ? { ...f, x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(90, y)) }
        : f
    ));
  };

  const handleFieldMouseUp = () => {
    setDraggingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, field: SignatureField) => {
    e.stopPropagation();
    
    setResizingField(fieldId);
    setResizeStartSize({ 
      width: field.width || getFieldWidth(field.type), 
      height: field.height || getFieldHeight(field.type) 
    });
    setResizeStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!resizingField) return;
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    // Convert pixel delta to size adjustment (612px is base document width)
    const scale = 612 * (zoom / 100) / 612;
    const newWidth = Math.max(30, resizeStartSize.width + deltaX / scale);
    const newHeight = Math.max(20, resizeStartSize.height + deltaY / scale);
    
    setFields(fields.map(f => 
      f.id === resizingField 
        ? { ...f, width: newWidth, height: newHeight }
        : f
    ));
  };

  const handleResizeMouseUp = () => {
    setResizingField(null);
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

  const getFieldIcon = (type: SignatureField['type']) => {
    switch (type) {
      case 'signature': return <FileSignature className="w-3 h-3" />;
      case 'initial': return <PenLine className="w-3 h-3" />;
      case 'date-signed': return <Calendar className="w-3 h-3" />;
      case 'checkbox': return <Square className="w-3 h-3" />;
      case 'name': return <User className="w-3 h-3" />;
      case 'company-name': return <Building2 className="w-3 h-3" />;
      case 'dob': return <Cake className="w-3 h-3" />;
      case 'address': return <Home className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const canAdvanceToRecipients = documentName.trim() !== '' && year !== '' && uploadedFile !== null;
  const canAdvanceToFields = recipients.length > 0;
  const canSend = fields.length > 0 && recipients.every(r => fields.some(f => f.recipientId === r.id));

  const goBack = () => {
    if (step === 'fields') {
      setStep('recipients');
    } else if (step === 'recipients') {
      setStep('details');
    }
  };

  const handleSend = () => {
    if (!canSend) {
      toast.error('Please add at least one field for each recipient');
      return;
    }

    toast.success('Signature request sent successfully!');
    navigate('/signatures');
  };

  // Track visited steps
  useEffect(() => {
    setVisitedSteps(prev => new Set(prev).add(step));
  }, [step]);

  // Show error state if no file
  if (!uploadedFile && step !== 'details') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="mb-2">No Document Selected</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please select a document to upload for signature.
          </p>
          <Button
            onClick={() => navigate('/signatures')}
            style={{ backgroundColor: 'var(--primaryColor)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Signatures
          </Button>
        </Card>
      </div>
    );
  }

  const totalPages = 1; // For uploaded documents, assume single page

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/signatures')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Signatures
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div>
              <h1 className="flex items-center gap-2">
                <FileSignature className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                Upload Document for Signature
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === 'details' && 'Enter document information'}
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
              onClick={() => navigate('/signatures')}
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
              {visitedSteps.has('recipients') && step !== 'recipients' ? '✓' : '2'}
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
              3
            </div>
            <span className={`text-sm ${step === 'fields' ? '' : 'text-gray-500 dark:text-gray-400'}`}>
              Place Fields
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* STEP 1: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Send className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2 flex items-center gap-2">
                      Send Document for Signature
                      <Badge variant="outline" className="ml-2">Step 1 of 3</Badge>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Fill in the required information below to prepare your document. All fields marked with * are required.
                    </p>
                    
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${uploadedFile ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          {uploadedFile && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={uploadedFile ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>
                          Document Uploaded
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${documentName ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          {documentName && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={documentName ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}>
                          Document Named
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* File Display */}
              {uploadedFile && (
                <Card className="p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">File Ready</span>
                      </div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Form Card */}
              <Card className="p-8">
                <div className="space-y-8">
                  {/* Document Name */}
                  <div className={`p-5 rounded-lg border-2 transition-all ${documentName ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className={`w-5 h-5 mt-0.5 ${documentName ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <div className="flex-1">
                        <Label htmlFor="documentName" className="text-base flex items-center gap-2">
                          Document Name
                          <span className="text-red-500">*</span>
                          {!documentName && (
                            <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                              Required - Start typing
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Give your document a clear, descriptive name
                        </p>
                      </div>
                    </div>
                    <Input
                      ref={documentNameInputRef}
                      id="documentName"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      onFocus={() => setIsDocumentNameFocused(true)}
                      onBlur={() => setIsDocumentNameFocused(false)}
                      placeholder="e.g., Engagement Letter 2024, Client Agreement"
                      className={cn(
                        "transition-all duration-200",
                        isDocumentNameFocused ? "text-3xl h-16" : "text-base h-11"
                      )}
                      autoComplete="off"
                    />
                  </div>

                  {/* Tax Year */}
                  <div className={`p-5 rounded-lg border-2 transition-all ${year ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Calendar className={`w-5 h-5 mt-0.5 ${year ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Label htmlFor="year" className="text-base flex items-center gap-2">
                            Tax Year
                            <span className="text-red-500">*</span>
                          </Label>
                          {year && (
                            <Badge 
                              variant="default" 
                              className="text-base px-3 py-1"
                              style={{ backgroundColor: 'var(--primaryColor)' }}
                            >
                              {year}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Quick select or choose from dropdown
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
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    if (canAdvanceToRecipients) {
                      setAutoAdvanceEnabled(true);
                      setStep('recipients');
                    }
                  }}
                  disabled={!canAdvanceToRecipients}
                  style={{
                    backgroundColor: canAdvanceToRecipients ? 'var(--primaryColor)' : undefined,
                    borderColor: canAdvanceToRecipients ? 'var(--primaryColor)' : undefined,
                  }}
                  className="disabled:opacity-50"
                >
                  Continue to Recipients
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Recipients - EXACT COPY FROM NewTemplateView */}
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
                  <DndProvider backend={HTML5Backend}>
                    <div className="space-y-0">
                      {recipients.map((recipient, index) => (
                        <DraggableRecipientItem
                          key={recipient.id}
                          recipient={recipient}
                          index={index}
                          moveRecipient={moveRecipient}
                          removeRecipient={removeRecipient}
                          signingOrder={signingOrder}
                        />
                      ))}
                    </div>
                  </DndProvider>
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
                      <span className="text-gray-600 dark:text-gray-400">Document Name:</span>
                      <span>{documentName}</span>
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
                      if (canAdvanceToFields) {
                        setAutoAdvanceEnabled(true);
                        setStep('fields');
                        if (recipients.length > 0) {
                          setSelectedRecipient(recipients[0].id);
                        }
                      }
                    }}
                    disabled={!canAdvanceToFields}
                    style={{
                      backgroundColor: canAdvanceToFields ? 'var(--primaryColor)' : undefined,
                      borderColor: canAdvanceToFields ? 'var(--primaryColor)' : undefined,
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

          {/* STEP 3: Place Fields - EXACT COPY FROM NewTemplateView */}
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
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        onClick={handleDocumentClick}
                        onMouseMove={(e) => {
                          handleFieldMouseMove(e);
                          handleResizeMouseMove(e);
                        }}
                        onMouseUp={() => {
                          handleFieldMouseUp();
                          handleResizeMouseUp();
                        }}
                        onMouseLeave={() => {
                          handleFieldMouseUp();
                          handleResizeMouseUp();
                        }}
                      >
                        {/* Document placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                          <div className="text-center">
                            <FileText className="w-16 h-16 mx-auto mb-2 opacity-20" />
                            <p className="text-sm opacity-50">{uploadedFile?.name}</p>
                          </div>
                        </div>

                        {/* Signature Fields */}
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
                                        handleDeleteField(field.id);
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

              {/* Right Sidebar */}
              <div className="w-80">
                <Card className="p-6">
                  <h3 className="mb-4">Document Settings</h3>

                  {/* Recipients & Field Placement */}
                  <div>
                    <h4 className="text-sm mb-3">Recipients & Field Placement</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Click to select a recipient and manage their email
                    </p>
                    <div className="space-y-2">
                      {recipients.filter(r => r.type === 'signer').map((recipient) => (
                        <button
                          key={recipient.id}
                          onClick={() => setSelectedRecipient(recipient.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedRecipient === recipient.id
                              ? 'border-purple-500 bg-gray-50 dark:bg-gray-800'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: recipient.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {recipient.sourceType === 'spouse-tag' && recipient.name.includes('Spouse') ? 'Spouse' : 
                                 recipient.sourceType === 'spouse-tag' ? 'Client' :
                                 recipient.sourceType === 'external' ? 'External' :
                                 recipient.sourceType === 'firm' ? 'Firm Staff' : 'Client'}
                              </p>
                              <p className="text-sm truncate">{recipient.name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {fields.filter(f => f.recipientId === recipient.id).length} fields
                            </Badge>
                          </div>
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={recipient.email}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setRecipients(recipients.map(r => 
                                r.id === recipient.id ? { ...r, email: e.target.value } : r
                              ));
                            }}
                            className="text-sm h-8"
                          />
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
                        <span>{currentPage} of {totalPages}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleSend}
                      disabled={!canSend}
                      style={{
                        backgroundColor: canSend ? 'var(--primaryColor)' : undefined,
                        borderColor: canSend ? 'var(--primaryColor)' : undefined,
                      }}
                      className="w-full disabled:opacity-50"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send for Signature
                    </Button>
                    {!canSend && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Add at least one field to send
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Recipient Dialog - EXACT COPY FROM NewTemplateView */}
      <Dialog open={showAddRecipientDialog} onOpenChange={setShowAddRecipientDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="upload-document-add-recipient-description">
          <DialogHeader>
            <DialogTitle>
              {addRecipientStep === 'choose' && 'Add Recipient'}
              {addRecipientStep === 'client' && 'Select Client'}
              {addRecipientStep === 'external' && 'Add External Recipient'}
              {addRecipientStep === 'firm' && 'Select Firm Member'}
              {addRecipientStep === 'spouse-select' && 'Select Client for Client & Spouse'}
            </DialogTitle>
            <DialogDescription id="upload-document-add-recipient-description">
              {addRecipientStep === 'choose' && 'Choose how you want to add a recipient'}
              {addRecipientStep === 'client' && 'Search and select a client from your database'}
              {addRecipientStep === 'external' && 'Add someone outside your client list'}
              {addRecipientStep === 'firm' && 'Select a member from your firm'}
              {addRecipientStep === 'spouse-select' && 'This will add both the client and their spouse as signers'}
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
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium truncate">{client.name}</p>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {client.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {client.email}
                            </p>
                            {client.companyName && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                {client.companyName}
                              </p>
                            )}
                          </div>
                          <Check className="w-5 h-5 text-purple-600 opacity-0" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <div className="flex justify-start">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {addRecipientStep === 'external' && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="external-name">Full Name <span className="text-red-600">*</span></Label>
                  <Input
                    id="external-name"
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="external-email">Email Address <span className="text-red-600">*</span></Label>
                  <Input
                    id="external-email"
                    type="email"
                    value={externalEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1.5"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{emailError}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-3 mt-6">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={addExternalRecipient}
                  disabled={!externalName.trim() || !externalEmail.trim() || !!emailError}
                  style={{
                    backgroundColor: (externalName.trim() && externalEmail.trim() && !emailError) ? 'var(--primaryColor)' : undefined,
                  }}
                  className="disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            </div>
          )}

          {addRecipientStep === 'firm' && (
            <div className="py-4">
              <Input
                placeholder="Search firm members..."
                value={firmMemberSearch}
                onChange={(e) => setFirmMemberSearch(e.target.value)}
                className="w-full mb-4"
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

              <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {addRecipientStep === 'spouse-select' && (
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
                          onSelect={() => addClientAndSpouseWithClient(client)}
                          className="flex items-center gap-3 cursor-pointer p-3 hover:bg-pink-50 dark:hover:bg-pink-900/20"
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
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium truncate">{client.name}</p>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {client.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {client.email}
                            </p>
                            {client.companyName && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                {client.companyName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-600" />
                            <span className="text-xs text-pink-600">+Spouse</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <div className="flex justify-start">
                <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
