import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
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
  User,
  Building2,
  UserPlus,
  Briefcase,
  Check,
  Heart,
  PenLine,
  Calendar,
  AlertCircle,
  Send,
  GripVertical,
  Edit,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Square,
  Cake,
  Home,
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
  signedAt?: string;
  viewedAt?: string;
  ipAddress?: string;
  viewedIpAddress?: string;
  signedIpAddress?: string;
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

  const hasSigned = !!recipient.signedAt;

  return (
    <div ref={(node) => drag(drop(node))} className={cn("relative", isDragging && "opacity-50")}>
      <div
        className={cn(
          "border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow mt-3 cursor-move",
          hasSigned && "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
        )}
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
                  {hasSigned && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-2 py-0 h-5">
                      Signed
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

                {hasSigned && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed on {new Date(recipient.signedAt!).toLocaleString()}
                      {recipient.signedIpAddress && ` from ${recipient.signedIpAddress}`}
                    </p>
                  </div>
                )}
              </div>

              {!hasSigned && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(recipient.id)}
                  className="text-gray-400 hover:text-red-600 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function EditSignatureView() {
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
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [signatureData, setSignatureData] = useState<SignatureRequest | null>(null);
  
  // Initialize data from location state
  useEffect(() => {
    if (location.state?.signature) {
      const sig = location.state.signature as SignatureRequest;
      setSignatureData(sig);
      setDocumentName(sig.documentName);
      setYear(sig.year);
      setRecipients(sig.recipients.map((r, index) => ({
        ...r,
        type: 'signer' as RecipientType,
        order: index + 1,
        color: recipientColors[index % recipientColors.length],
        sourceType: (r.sourceType || 'external') as RecipientSourceType,
      })));
    } else {
      // If no signature data, redirect back
      navigate('/signatures');
    }
  }, [location.state]);
  
  // Auto-focus document name input when on details step
  useEffect(() => {
    if (step === 'details' && documentNameInputRef.current) {
      setTimeout(() => {
        documentNameInputRef.current?.focus();
      }, 100);
    }
  }, [step]);
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fields, setFields] = useState<SignatureField[]>([]);
  
  // Field Placement Editor states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3); // Mock total pages
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<SignatureField['type'] | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  
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

  const openAddRecipientDialog = () => {
    setShowAddRecipientDialog(true);
    setAddRecipientStep('choose');
    setSelectedClient(null);
    setSelectedFirmMember(null);
    setExternalName('');
    setExternalEmail('');
    setEmailError('');
    setSigningOrder('sequential');
  };

  const closeAddRecipientDialog = () => {
    setShowAddRecipientDialog(false);
    setAddRecipientStep('choose');
    setSelectedClient(null);
    setSelectedFirmMember(null);
    setExternalName('');
    setExternalEmail('');
    setEmailError('');
    setSigningOrder('sequential');
  };

  const handleAddClientRecipient = () => {
    if (selectedClient) {
      const newRecipient: Recipient = {
        id: `recipient-${Date.now()}`,
        name: selectedClient.name,
        email: selectedClient.email,
        type: 'signer',
        order: recipients.length + 1,
        color: recipientColors[recipients.length % recipientColors.length],
        sourceType: 'client',
        clientId: selectedClient.id,
        clientType: selectedClient.type,
        companyName: selectedClient.companyName,
      };
      setRecipients([...recipients, newRecipient]);
      closeAddRecipientDialog();
      toast.success(`Added ${selectedClient.name} as recipient`);
    }
  };

  const handleAddExternalRecipient = () => {
    const validation = validateEmail(externalEmail);
    if (!validation.isValid) {
      setEmailError(validation.error || 'Invalid email');
      return;
    }

    if (!externalName.trim()) {
      toast.error('Please enter a name');
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
    toast.success(`Added ${externalName} as recipient`);
  };

  const handleAddFirmMemberRecipient = () => {
    if (selectedFirmMember) {
      const newRecipient: Recipient = {
        id: `recipient-${Date.now()}`,
        name: selectedFirmMember.username,
        email: selectedFirmMember.email,
        type: 'signer',
        order: recipients.length + 1,
        color: recipientColors[recipients.length % recipientColors.length],
        sourceType: 'firm',
        firmMemberId: selectedFirmMember.id,
      };
      setRecipients([...recipients, newRecipient]);
      closeAddRecipientDialog();
      toast.success(`Added ${selectedFirmMember.username} as recipient`);
    }
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    toast.success('Recipient removed');
  };

  const moveRecipient = (dragIndex: number, hoverIndex: number) => {
    const dragRecipient = recipients[dragIndex];
    const newRecipients = [...recipients];
    newRecipients.splice(dragIndex, 1);
    newRecipients.splice(hoverIndex, 0, dragRecipient);
    setRecipients(newRecipients.map((r, i) => ({ ...r, order: i + 1 })));
  };

  // Field placement editor handlers
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
    toast.success('Field added to document');
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
    toast.success('Field removed');
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

  const canAdvanceToRecipients = !!documentName.trim() && !!year;
  const canAdvanceToFields = recipients.length > 0;
  const canSave = documentName.trim() && year && recipients.length > 0;

  const goBack = () => {
    if (step === 'fields') {
      setStep('recipients');
    } else if (step === 'recipients') {
      setStep('details');
    }
  };

  const handleSaveChanges = () => {
    if (!signatureData) return;

    // Validate
    if (!documentName.trim()) {
      toast.error('Document name is required');
      return;
    }

    if (recipients.length === 0) {
      toast.error('At least one recipient is required');
      return;
    }

    // In a real app, this would make an API call
    toast.success('Signature request updated successfully!');
    navigate('/signatures');
  };

  if (!signatureData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-2">No Signature Data</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            No signature request data was provided.
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

  // Check if any recipients have already signed
  const hasSignedRecipients = recipients.some(r => r.signedAt);

  return (
    <DndProvider backend={HTML5Backend}>
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
                  <Edit className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Edit Signature Request
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step === 'details' && 'Update document information'}
                  {step === 'recipients' && 'Update recipients who will sign'}
                  {step === 'fields' && 'Update signature fields on document'}
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
                      <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 flex items-center gap-2">
                        Edit Document Details
                        <Badge variant="outline" className="ml-2">Step 1 of 3</Badge>
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Update the document information below. All fields marked with * are required.
                      </p>
                      
                      {/* Client Info - Read Only */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{signatureData.clientName}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Document Type</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {signatureData.documentType === '8879' ? 'IRS 8879' : signatureData.documentType === 'template' ? 'Template' : 'Custom'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

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
                    </div>

                    {hasSignedRecipients && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ Some recipients have already signed. Changes will be recorded in the audit trail.
                        </p>
                      </div>
                    )}

                    {/* Continue Button */}
                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => {
                          if (canAdvanceToRecipients) {
                            setAutoAdvanceEnabled(true);
                            setStep('recipients');
                            setVisitedSteps(prev => new Set([...prev, 'recipients']));
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
                </Card>
              </div>
            )}

            {/* STEP 2: Recipients */}
            {step === 'recipients' && (
              <div className="space-y-6">
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 flex items-center gap-2">
                        Manage Recipients
                        <Badge variant="outline" className="ml-2">Step 2 of 3</Badge>
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add or update recipients who will sign this document. Recipients can be clients, external contacts, or firm members.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="flex items-center gap-2">
                        Recipients
                        <Badge variant="secondary">{recipients.length}</Badge>
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Drag to reorder • Click "+" to add new recipient
                      </p>
                    </div>
                    <Button
                      onClick={openAddRecipientDialog}
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recipient
                    </Button>
                  </div>

                  {hasSignedRecipients && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Recipients who have already signed cannot be removed or have their information changed.
                      </p>
                    </div>
                  )}

                  {recipients.length > 0 ? (
                    <div className="space-y-3">
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
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        No recipients added yet
                      </p>
                      <Button
                        onClick={openAddRecipientDialog}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Recipient
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      onClick={() => {
                        if (canAdvanceToFields) {
                          setStep('fields');
                          setVisitedSteps(prev => new Set([...prev, 'fields']));
                        }
                      }}
                      disabled={!canAdvanceToFields}
                      style={{
                        backgroundColor: canAdvanceToFields ? 'var(--primaryColor)' : undefined,
                      }}
                      className="disabled:opacity-50"
                    >
                      Continue to Place Fields
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* STEP 3: Place Fields (Placeholder) */}
            {step === 'fields' && (
              <div className="space-y-6">
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 flex items-center gap-2">
                        Place Signature Fields
                        <Badge variant="outline" className="ml-2">Step 3 of 3</Badge>
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update signature field placements on your document.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8">
                  <div className="text-center py-12">
                    <FileSignature className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Field placement editor would go here (similar to UploadDocumentView)
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/signatures')}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        disabled={!canSave}
                        style={{
                          backgroundColor: canSave ? 'var(--primaryColor)' : undefined,
                        }}
                        className="disabled:opacity-50"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Add Recipient Dialog */}
        <Dialog open={showAddRecipientDialog} onOpenChange={setShowAddRecipientDialog}>
          <DialogContent className="max-w-2xl" aria-describedby="add-recipient-description">
            <DialogHeader>
              <DialogTitle>Add Recipient</DialogTitle>
              <DialogDescription id="add-recipient-description">
                Choose where to add a recipient from
              </DialogDescription>
            </DialogHeader>

            {addRecipientStep === 'choose' && (
              <div className="grid grid-cols-3 gap-4 py-4">
                <button
                  onClick={() => setAddRecipientStep('client')}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all text-center group"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">Client</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From client list
                  </p>
                </button>

                <button
                  onClick={() => setAddRecipientStep('external')}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-all text-center group"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-medium mb-1">External</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add manually
                  </p>
                </button>

                <button
                  onClick={() => setAddRecipientStep('firm')}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all text-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-1">Firm Member</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From your team
                  </p>
                </button>
              </div>
            )}

            {addRecipientStep === 'client' && (
              <div className="py-4">
                <Command className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CommandInput placeholder="Search clients..." />
                  <CommandList>
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {mockClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => setSelectedClient(client)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {client.type === 'Business' ? (
                                <Building2 className="w-4 h-4 text-blue-600" />
                              ) : (
                                <User className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                            {selectedClient?.id === client.id && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleAddClientRecipient}
                    disabled={!selectedClient}
                    style={{
                      backgroundColor: selectedClient ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
            )}

            {addRecipientStep === 'external' && (
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="externalName">Name *</Label>
                  <Input
                    id="externalName"
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="externalEmail">Email *</Label>
                  <Input
                    id="externalEmail"
                    type="email"
                    value={externalEmail}
                    onChange={(e) => {
                      setExternalEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="email@example.com"
                    className="mt-2"
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 mt-1">{emailError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleAddExternalRecipient}
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
            )}

            {addRecipientStep === 'firm' && (
              <div className="py-4">
                <Command className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CommandInput placeholder="Search firm members..." />
                  <CommandList>
                    <CommandEmpty>No firm members found.</CommandEmpty>
                    <CommandGroup>
                      {mockFirmMembers.map((member) => (
                        <CommandItem
                          key={member.id}
                          onSelect={() => setSelectedFirmMember(member)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{member.username}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                            {selectedFirmMember?.id === member.id && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setAddRecipientStep('choose')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleAddFirmMemberRecipient}
                    disabled={!selectedFirmMember}
                    style={{
                      backgroundColor: selectedFirmMember ? 'var(--primaryColor)' : undefined,
                    }}
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}