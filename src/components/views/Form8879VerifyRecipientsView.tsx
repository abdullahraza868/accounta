import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import {
  ArrowLeft, FileText, X, User, Building2, Heart, AlertCircle, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Trash2, UserPlus, Maximize2, Minimize2, Send,
  FileSignature, PenLine, Calendar, Square, Home, Cake, Check, Plus, Users, GripVertical, Briefcase,
  Edit3, ArrowRight, Bot, CheckCircle2, Mail
} from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
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
  spouseName?: string;
  spouseEmail?: string;
  hasSpouse?: boolean;
};

type FirmMember = {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

const recipientColors = ['#7C3AED', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', type: 'Individual', spouseName: 'Jane Smith', spouseEmail: 'jane.smith@email.com', hasSpouse: true },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Individual', hasSpouse: false },
  { id: '3', name: 'Michael Chen', email: 'mchen@techcorp.com', type: 'Business', companyName: 'TechCorp Inc.', hasSpouse: false },
];

const mockFirmMembers: FirmMember[] = [
  { id: '1', username: 'helper68210', email: 'helper68210@acounta.com', role: 'ADMIN', isActive: true },
  { id: '2', username: 'helper57893', email: 'helper57893@acounta.com', role: 'ADMIN', isActive: true },
  { id: '3', username: 'helper53040', email: 'helper53040@acounta.com', role: 'STAFF', isActive: true },
  { id: '4', username: 'john.accountant', email: 'john.accountant@acounta.com', role: 'PARTNER', isActive: true },
  { id: '5', username: 'sarah.cpa', email: 'sarah.cpa@acounta.com', role: 'MANAGER', isActive: true },
];

type DraggableRecipientItemProps = {
  recipient: Recipient;
  index: number;
  moveRecipient: (dragIndex: number, hoverIndex: number) => void;
  removeRecipient: (id: string) => void;
  signingOrder: 'sequential' | 'simultaneous';
};

const DraggableRecipientItem = ({ recipient, index, moveRecipient, removeRecipient, signingOrder }: DraggableRecipientItemProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'recipient',
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
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
      return recipient.clientType === 'Business' ? <Building2 className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-purple-600" />;
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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow mt-3 cursor-move" style={{ borderLeftWidth: '4px', borderLeftColor: recipient.color, marginLeft: `${marginLeft}px` }}>
        <div className="flex items-start gap-3">
          <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
          <div className="flex items-center gap-2 pt-1">
            <div className="relative">
              <span className={`text-sm min-w-[20px] inline-flex items-center justify-center w-7 h-7 rounded-full ${isSequential ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium'}`}>
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
                  {recipient.sourceType === 'client' && <Badge variant="secondary" className="text-xs">{recipient.clientType === 'Business' ? 'Business' : 'Individual'}</Badge>}
                  {recipient.sourceType === 'external' && <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">External</Badge>}
                  {recipient.sourceType === 'firm' && <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Firm Member</Badge>}
                </div>
                {recipient.companyName && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{recipient.companyName}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{recipient.email || (recipient.sourceType === 'spouse-tag' ? 'Will be resolved to client and spouse' : 'No email')}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs"><PenLine className="w-3 h-3 inline mr-1" />Signer</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeRecipient(recipient.id)} className="text-gray-400 hover:text-red-600 mt-1">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Form8879VerifyRecipientsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const uploadedFile = (location.state as any)?.file || null;

  const [step, setStep] = useState<'verify' | 'recipients' | 'fields'>('verify');
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['verify']));
  const [isEditMode, setIsEditMode] = useState(false);
  const [recipientsManuallyChanged, setRecipientsManuallyChanged] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalPages = 4;

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 'recipient-1', name: 'John Smith', email: 'john.smith@email.com', type: 'signer', order: 1, color: recipientColors[0], sourceType: 'client', clientId: '1' },
    { id: 'recipient-2', name: 'Jane Smith', email: 'jane.smith@email.com', type: 'signer', order: 2, color: recipientColors[1], sourceType: 'spouse-tag', clientId: '1' },
  ]);

  const [signingOrder, setSigningOrder] = useState<'sequential' | 'simultaneous'>('simultaneous');
  const [documentName, setDocumentName] = useState('');
  const [emailMessage, setEmailMessage] = useState('Please review and sign the attached Form 8879.');
  const [fields, setFields] = useState<SignatureField[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedFieldType, setSelectedFieldType] = useState<SignatureField['type'] | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  const [showAddRecipientDialog, setShowAddRecipientDialog] = useState(false);
  const [addRecipientStep, setAddRecipientStep] = useState<'choose' | 'client' | 'external' | 'firm' | 'spouse-select'>('choose');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFirmMember, setSelectedFirmMember] = useState<FirmMember | null>(null);
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firmMemberSearch, setFirmMemberSearch] = useState('');

  // Set default document name based on client
  useEffect(() => {
    if (recipients.length > 0 && !documentName) {
      const firstClient = recipients.find(r => r.sourceType === 'client');
      if (firstClient) {
        setDocumentName(`${firstClient.name} - Form 8879`);
      } else {
        setDocumentName('Form 8879 - E-file Authorization');
      }
    }
  }, [recipients, documentName]);

  // Pre-populate signature and date fields on verify step
  useEffect(() => {
    if (recipients.length > 0 && fields.length === 0) {
      const autoFields: SignatureField[] = [];
      recipients.forEach((recipient, idx) => {
        autoFields.push({ 
          id: `field-sig-${recipient.id}`, 
          type: 'signature', 
          label: 'Signature', 
          required: true, 
          recipientId: recipient.id, 
          page: 1, 
          x: 10, 
          y: 70 + (idx * 15), 
          width: 140, 
          height: 50 
        });
        autoFields.push({ 
          id: `field-date-${recipient.id}`, 
          type: 'date-signed', 
          label: 'Date', 
          required: true, 
          recipientId: recipient.id, 
          page: 1, 
          x: 55, 
          y: 72 + (idx * 15), 
          width: 100, 
          height: 30 
        });
      });
      setFields(autoFields);
      if (recipients.length > 0 && !selectedRecipient) setSelectedRecipient(recipients[0].id);
    }
  }, [recipients]);

  useEffect(() => {
    setVisitedSteps(prev => new Set(prev).add(step));
  }, [step]);

  const openAddRecipientDialog = () => {
    setShowAddRecipientDialog(true);
    setAddRecipientStep('choose');
    setSelectedClient(null);
    setSelectedFirmMember(null);
    setExternalName('');
    setExternalEmail('');
    setEmailError('');
    setFirmMemberSearch('');
  };

  const handleEmailChange = (email: string) => {
    setExternalEmail(email);
    setEmailError(email && !validateEmail(email) ? 'Please enter a valid email address' : '');
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

  const addClientAndSpouseImmediately = () => setAddRecipientStep('spouse-select');

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
      email: '',
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

  const moveRecipient = (dragIndex: number, hoverIndex: number) => {
    const updatedRecipients = [...recipients];
    const [draggedRecipient] = updatedRecipients.splice(dragIndex, 1);
    updatedRecipients.splice(hoverIndex, 0, draggedRecipient);
    const reorderedRecipients = updatedRecipients.map((recipient, index) => ({ ...recipient, order: index + 1 }));
    setRecipients(reorderedRecipients);
  };

  const removeRecipient = (id: string) => {
    const updatedRecipients = recipients.filter(r => r.id !== id);
    setRecipients(updatedRecipients);
    setFields(fields.filter(f => f.recipientId !== id));
    if (selectedRecipient === id && updatedRecipients.length > 0) {
      setSelectedRecipient(updatedRecipients[0].id);
    }
  };

  const getFieldWidth = (type: SignatureField['type']): number => {
    const widths = { signature: 140, initial: 50, checkbox: 20, 'date-signed': 100, name: 120, 'company-name': 140, dob: 100, address: 160 };
    return widths[type] || 100;
  };

  const getFieldHeight = (type: SignatureField['type']): number => {
    const heights = { signature: 50, initial: 30, checkbox: 20 };
    return heights[type] || 30;
  };

  const getFieldIcon = (type: SignatureField['type']) => {
    const icons = {
      signature: <FileSignature className="w-3 h-3" />,
      initial: <PenLine className="w-3 h-3" />,
      'date-signed': <Calendar className="w-3 h-3" />,
      checkbox: <Square className="w-3 h-3" />,
      name: <User className="w-3 h-3" />,
      'company-name': <Building2 className="w-3 h-3" />,
      dob: <Cake className="w-3 h-3" />,
      address: <Home className="w-3 h-3" />,
    };
    return icons[type] || <FileText className="w-3 h-3" />;
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !selectedFieldType || !selectedRecipient) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label: selectedFieldType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
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

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    
    // Get the document container rect
    const docElement = (e.currentTarget as HTMLElement).parentElement;
    const rect = docElement?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggingField(fieldId);
    setDragOffset({
      x: e.clientX - rect.left - (field.x * rect.width / 100),
      y: e.clientY - rect.top - (field.y * rect.height / 100)
    });
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!draggingField && !resizingField) return;

    if (draggingField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      setFields(fields.map(f => 
        f.id === draggingField 
          ? { ...f, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }
          : f
      ));
    }

    if (resizingField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const newWidth = Math.max(30, resizeStartSize.width + deltaX);
      const newHeight = Math.max(20, resizeStartSize.height + deltaY);
      
      setFields(fields.map(f => 
        f.id === resizingField 
          ? { ...f, width: newWidth, height: newHeight }
          : f
      ));
    }
  };

  const handleFieldMouseUp = () => {
    setDraggingField(null);
    setResizingField(null);
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
    // Handled in handleFieldMouseMove
  };

  const handleResizeMouseUp = () => {
    // Handled in handleFieldMouseUp
  };

  const canSend = recipients.length > 0 && documentName.trim().length > 0 && fields.length > 0;

  const handleSend = () => {
    if (!canSend) {
      toast.error('Please complete all required fields');
      return;
    }
    toast.success('Form 8879 sent for signature!');
    setTimeout(() => navigate('/signatures'), 1500);
  };

  const goToRecipients = () => {
    setRecipients([]);
    setFields([]);
    setSelectedRecipient('');
    setRecipientsManuallyChanged(true);
    setStep('recipients');
  };
  const goToFields = () => setStep('fields');
  const goBackToVerify = () => setStep('verify');

  if (!uploadedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="mb-2">No Document Selected</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please upload a Form 8879 document to continue.</p>
          <Button onClick={() => navigate('/signatures')} style={{ backgroundColor: 'var(--primaryColor)' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Signatures
          </Button>
        </Card>
      </div>
    );
  }

  // VERIFY STEP - Show AI-extracted information with document preview
  if (step === 'verify') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/signatures')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />Back to Signatures
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  <Input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="border-none p-0 h-auto text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Verify AI-extracted recipients and document details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/signatures')}>Cancel</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="flex gap-6 h-full">
            {/* Left Side - Document Preview (matching UploadDocumentView layout) */}
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
                      className={cn("shadow-lg relative overflow-hidden", isEditMode && selectedFieldType && "cursor-crosshair")}
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
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <FileText className="w-32 h-32" />
                      </div>

                      {/* Placed Fields */}
                      {fields
                        .filter(field => field.page === currentPage)
                        .map((field) => {
                          const recipient = recipients.find(r => r.id === field.recipientId);
                          const width = field.width || getFieldWidth(field.type);
                          const height = field.height || getFieldHeight(field.type);
                          
                          return (
                            <div
                              key={field.id}
                              className={cn(
                                "absolute border-2 rounded text-xs flex items-center justify-between gap-1 select-none group cursor-move hover:shadow-lg transition-shadow",
                                draggingField === field.id || resizingField === field.id ? 'shadow-2xl z-50' : ''
                              )}
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
                              onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
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

            {/* Right Side - Verification Info (matching UploadDocumentView width) */}
            <div className="w-[400px] flex-none">
              <Card className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* 1. Extracted Recipients (TOP) - Always Visible */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2">
                        <Users className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                        {recipientsManuallyChanged ? 'Recipients' : 'Extracted Recipients'} ({recipients.length})
                      </h3>
                      {!recipientsManuallyChanged && (
                        <Badge variant="secondary" className="text-xs">AI Extracted</Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      {recipients.map((recipient, index) => (
                        <div key={recipient.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3" style={{ borderLeftWidth: '4px', borderLeftColor: recipient.color }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              {recipient.sourceType === 'client' && recipient.clientType === 'Business' ? (
                                <Building2 className="w-4 h-4 text-blue-600" />
                              ) : recipient.sourceType === 'spouse-tag' ? (
                                <Heart className="w-4 h-4 text-pink-600" />
                              ) : (
                                <User className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{recipient.name}</span>
                                {recipient.sourceType === 'spouse-tag' && (
                                  <Badge variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                                    Spouse
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`email-${recipient.id}`} className="text-xs text-gray-500 dark:text-gray-400">
                                  Email Address
                                </Label>
                                <Input
                                  id={`email-${recipient.id}`}
                                  type="email"
                                  value={recipient.email}
                                  onChange={(e) => {
                                    setRecipients(recipients.map(r => 
                                      r.id === recipient.id ? { ...r, email: e.target.value } : r
                                    ));
                                  }}
                                  placeholder="Enter email address"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. AI Extraction Message or Manual Selection Message - Always Visible */}
                  {!recipientsManuallyChanged ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            AI Extraction Complete
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Successfully analyzed Form 8879 and identified {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : recipients.length === 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm mb-1">No Recipients Added</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Click "Change Recipients" to add people who need to sign this document.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm mb-1">Recipients Updated</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            You have manually selected {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} for this document.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Change Recipients Button - Always Visible */}
                  <Button 
                    variant="outline" 
                    onClick={goToRecipients} 
                    className="w-full h-12 flex items-center justify-center gap-2 border-2"
                    style={{ borderColor: 'var(--primaryColor)' }}
                  >
                    <Users className="w-4 h-4" />
                    Change Recipients
                  </Button>

                  {/* 4. Document Information - Hidden when editing fields */}
                  {!isEditMode && (
                    <div>
                      <h4 className="text-sm mb-3">Document Information</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="doc-name" className="text-xs text-gray-500 dark:text-gray-400 mb-1">Document Name</Label>
                          <Input id="doc-name" value={documentName} onChange={(e) => setDocumentName(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">File Name</Label>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs truncate">{uploadedFile.name}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Pages</Label>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <span className="text-xs">{totalPages}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Type</Label>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <span className="text-xs">Form 8879</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email-msg" className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Message</Label>
                          <Textarea id="email-msg" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={2} className="text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Mode - Field Placement Controls */}
                  {isEditMode && (
                    <>
                      <Card className="p-4">
                        <Label className="text-sm mb-3 block">Select Recipient</Label>
                        <div className="space-y-2">
                          {recipients.map((recipient) => (
                            <button
                              key={recipient.id}
                              onClick={() => setSelectedRecipient(recipient.id)}
                              className={cn(
                                "w-full p-2 rounded-lg border-2 transition-all text-left flex items-center gap-2",
                                selectedRecipient === recipient.id
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              )}
                            >
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: recipient.color }}
                              />
                              <span className="text-sm truncate">{recipient.name}</span>
                            </button>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <Label className="text-sm mb-3 block">Add Field to Document</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { type: 'signature' as const, label: 'Signature', Icon: FileSignature },
                            { type: 'initial' as const, label: 'Initials', Icon: PenLine },
                            { type: 'name' as const, label: 'Name', Icon: User },
                            { type: 'date-signed' as const, label: 'Date Signed', Icon: Calendar },
                            { type: 'checkbox' as const, label: 'Checkbox', Icon: Square },
                            { type: 'company-name' as const, label: 'Company', Icon: Building2 },
                            { type: 'dob' as const, label: 'DOB', Icon: Cake },
                            { type: 'address' as const, label: 'Address', Icon: Home },
                          ].map(({ type, label, Icon }) => (
                            <Button
                              key={type}
                              variant={selectedFieldType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedFieldType(selectedFieldType === type ? null : type)}
                              disabled={!selectedRecipient}
                              className="text-xs justify-start"
                              style={
                                selectedFieldType === type
                                  ? { backgroundColor: 'var(--primaryColor)' }
                                  : {}
                              }
                            >
                              <Icon className="w-3.5 h-3.5 mr-1.5" />
                              {label}
                            </Button>
                          ))}
                        </div>
                        {selectedFieldType && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              Click on the document to place a {selectedFieldType} field
                            </p>
                          </div>
                        )}
                      </Card>
                    </>
                  )}

                  {/* Action Buttons - Changes based on mode */}
                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {!isEditMode ? (
                      <>
                        <Button 
                          onClick={handleSend} 
                          disabled={!canSend} 
                          className="w-full h-12 flex items-center justify-center gap-2" 
                          style={{ backgroundColor: 'var(--primaryColor)' }}
                        >
                          <Send className="w-4 h-4" />
                          Send for Signature
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditMode(true);
                            if (recipients.length > 0 && !selectedRecipient) {
                              setSelectedRecipient(recipients[0].id);
                            }
                          }} 
                          className="w-full h-12 flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Fields
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => setIsEditMode(false)}
                          className="w-full h-12 flex items-center justify-center gap-2" 
                          style={{ backgroundColor: 'var(--primaryColor)' }}
                        >
                          Done Editing
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditMode(false);
                            setSelectedFieldType(null);
                          }}
                          className="w-full h-12 flex items-center justify-center gap-2"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RECIPIENTS STEP - Manage recipients
  if (step === 'recipients') {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
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
                    Form 8879 - E-file Authorization
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add recipients who will sign
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={goBackToVerify}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
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
                onClick={() => {}}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  1
                </div>
                <span className="text-sm">Recipients</span>
              </button>
              
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 min-w-[40px]" />
              
              <button
                onClick={() => {
                  if (recipients.length > 0) {
                    goBackToVerify();
                  }
                }}
                disabled={recipients.length === 0}
                className={`flex items-center gap-2 transition-opacity ${
                  recipients.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  recipients.length > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  2
                </div>
                <span className={`text-sm ${
                  recipients.length > 0 
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>Verify</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
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
                            Everyone can sign at the same time
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-8 mt-2">
                        {recipients.slice(0, 3).map((recipient) => (
                          <div
                            key={recipient.id}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white -ml-2 first:ml-0 border-2 border-white dark:border-gray-800"
                            style={{ backgroundColor: recipient.color }}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        ))}
                        {recipients.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">+{recipients.length - 3}</span>
                        )}
                      </div>
                    </button>
                  </div>
                </Card>
              )}

              {/* Summary Card with Continue Button */}
              {recipients.length > 0 && (
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm mb-3">Ready to Verify</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Document Name:</span>
                      <span>{documentName || 'Form 8879'}</span>
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
                    onClick={goBackToVerify}
                    style={{
                      backgroundColor: 'var(--primaryColor)',
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue to Verify
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>

        <Dialog open={showAddRecipientDialog} onOpenChange={closeAddRecipientDialog}>
          <DialogContent className="max-w-2xl" aria-describedby="form8879-add-recipient-description">
            <DialogHeader>
              <DialogTitle>
                {addRecipientStep === 'choose' && 'Add Recipient'}
                {addRecipientStep === 'client' && 'Select Client'}
                {addRecipientStep === 'external' && 'Add External Recipient'}
                {addRecipientStep === 'firm' && 'Select Firm Member'}
                {addRecipientStep === 'spouse-select' && 'Select Client for Client & Spouse'}
              </DialogTitle>
              <DialogDescription id="form8879-add-recipient-description">
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
                      const initials = member.username
                        .split(/[._-]/)
                        .map(part => part[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      
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
      </DndProvider>
    );
  }

  // FIELDS STEP - Place signature fields
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('recipients')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />Back to Recipients
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Edit Signature Fields
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Place and customize signature fields on the document
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setStep('recipients')}>Back</Button>
              <Button onClick={handleSend} disabled={!canSend} style={{ backgroundColor: 'var(--primaryColor)' }}>
                <Send className="w-4 h-4 mr-2" />Send for Signature
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden p-6">
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
                    className={cn("shadow-lg relative overflow-hidden", selectedFieldType && "cursor-crosshair")}
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
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <FileText className="w-32 h-32" />
                    </div>

                    {fields.filter(f => f.page === currentPage).map(field => {
                      const recipient = recipients.find(r => r.id === field.recipientId);
                      return (
                        <div
                          key={field.id}
                          className="absolute border-2 bg-white/90 dark:bg-gray-800/90 hover:shadow-lg transition-shadow cursor-move"
                          style={{
                            borderColor: recipient?.color || '#7C3AED',
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            width: `${field.width}px`,
                            height: `${field.height}px`,
                          }}
                          onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                        >
                          <div className="h-full flex items-center justify-between px-2 text-xs">
                            <div className="flex items-center gap-1">
                              {getFieldIcon(field.type)}
                              <span className="truncate">{field.label}</span>
                            </div>
                            <button onClick={() => handleDeleteField(field.id)} className="text-gray-400 hover:text-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div
                            className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 cursor-se-resize"
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

          <div className="w-80 flex-none border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="mb-3">Select Recipient</h3>
                <div className="space-y-2">
                  {recipients.map(recipient => (
                    <button
                      key={recipient.id}
                      onClick={() => setSelectedRecipient(recipient.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 text-left transition-all",
                        selectedRecipient === recipient.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: recipient.color
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedRecipient === recipient.id ? 'border-purple-500' : 'border-gray-300'
                        )}>
                          {selectedRecipient === recipient.id && (
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">{recipient.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3">Field Types</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Select a field type, then click on the document to place it
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'signature' as const, label: 'Signature', icon: <FileSignature className="w-4 h-4" /> },
                    { type: 'initial' as const, label: 'Initial', icon: <PenLine className="w-4 h-4" /> },
                    { type: 'date-signed' as const, label: 'Date', icon: <Calendar className="w-4 h-4" /> },
                    { type: 'name' as const, label: 'Name', icon: <User className="w-4 h-4" /> },
                    { type: 'checkbox' as const, label: 'Checkbox', icon: <Square className="w-4 h-4" /> },
                    { type: 'company-name' as const, label: 'Company', icon: <Building2 className="w-4 h-4" /> },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedFieldType(type)}
                      disabled={!selectedRecipient}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                        selectedFieldType === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                        !selectedRecipient && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {icon}
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Card className="p-4 border-2" style={{ borderColor: 'var(--primaryColor)', borderWidth: '2px' }}>
                <h3 className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
                    <span>{recipients.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Fields:</span>
                    <span>{fields.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Document:</span>
                    <span className="truncate max-w-[150px]">{uploadedFile.name}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
