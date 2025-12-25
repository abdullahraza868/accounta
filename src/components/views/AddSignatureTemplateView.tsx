import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  ArrowLeft,
  Check,
  User,
  Users,
  Mail,
  Briefcase,
  FileSignature,
  AlertCircle,
  X,
  UserCircle,
  Plus,
  Clock,
  UserCheck,
  GripVertical,
  PenLine,
  Calendar as CalendarIcon,
  Type,
  Square,
  Home,
  Cake,
  Building2,
  Heart,
  UserPlus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  Send,
  Upload,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { AddSignatureTemplateDialog } from './AddSignatureTemplateDialog';

type TemplateRole = 'client' | 'client-spouse' | 'external' | 'firm-user';
type TemplateCategory = 'Tax' | 'Engagement' | 'Custom';
type SigningOrder = 'sequential' | 'simultaneous';

type RoleOption = {
  id: TemplateRole;
  label: string;
  description: string;
  icon: typeof User;
};

type ConfiguredRole = {
  id: string;
  roleType: TemplateRole;
  order: number;
  label?: string;
  name?: string;
  email?: string;
  firmUserId?: string;
  firmUserName?: string;
  selectLater?: boolean;
  color: string;
  sourceType: 'client' | 'external' | 'spouse-tag' | 'firm';
  clientType?: 'Individual' | 'Business';
};

type FieldType = 'signature' | 'initial' | 'date-signed' | 'text' | 'checkbox' | 'name' | 'company-name' | 'dob' | 'address';

type TemplateField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  recipientId: string;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

// Mock firm users
const MOCK_FIRM_USERS = [
  { id: '1', name: 'David Wilson', title: 'Tax Associate', email: 'david.w@firm.com' },
  { id: '2', name: 'Emily Davis', title: 'Accountant', email: 'emily.d@firm.com' },
  { id: '3', name: 'Jessica Martinez', title: 'Senior Accountant', email: 'jessica.m@firm.com' },
  { id: '4', name: 'Michael Chen', title: 'Partner', email: 'michael.c@firm.com' },
  { id: '5', name: 'Sarah Johnson', title: 'Senior Tax Manager', email: 'sarah.j@firm.com' },
].sort((a, b) => a.name.localeCompare(b.name));

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'client',
    label: 'Client',
    description: 'Individual or business client signing the document',
    icon: User,
  },
  {
    id: 'client-spouse',
    label: 'Client and Spouse',
    description: 'Both primary client and their spouse need to sign',
    icon: Users,
  },
  {
    id: 'external',
    label: 'External Recipient',
    description: 'Someone outside your firm or client base',
    icon: Mail,
  },
  {
    id: 'firm-user',
    label: 'Firm User',
    description: 'Member of your firm who needs to sign',
    icon: Briefcase,
  },
];

const ROLE_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

// Draggable Recipient Component
type DraggableRecipientItemProps = {
  recipient: ConfiguredRole;
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

  const getDisplayName = () => {
    if (recipient.name) return recipient.name;
    if (recipient.roleType === 'client') return 'Client';
    if (recipient.roleType === 'client-spouse') return 'Client';
    if (recipient.roleType === 'external') return recipient.label || 'External Recipient';
    if (recipient.roleType === 'firm-user') return recipient.firmUserName || 'Firm User';
    return 'Recipient';
  };

  const getDisplayEmail = () => {
    if (recipient.email) return recipient.email;
    if (recipient.sourceType === 'spouse-tag') return 'Will be resolved to client and spouse';
    if (recipient.selectLater) return 'Will be resolved when using template';
    return 'Select when using template';
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
                  <span className="font-medium">{getDisplayName()}</span>
                  {recipient.sourceType === 'client' && recipient.clientType && (
                    <Badge variant="secondary" className="text-xs">
                      {recipient.clientType}
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {getDisplayEmail()}
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

export function AddSignatureTemplateView() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Category & Upload
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('Tax');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Template Details
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateYear, setTemplateYear] = useState<number>(new Date().getFullYear());

  // Step 3: Roles
  const [configuredRoles, setConfiguredRoles] = useState<ConfiguredRole[]>([]);
  const [signingOrder, setSigningOrder] = useState<SigningOrder>('sequential');

  // Step 4: Field Placement
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // Template placeholder has 1 page
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Add Role Dialog
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [addRoleStep, setAddRoleStep] = useState<'choose' | 'client' | 'external-choose' | 'external-now' | 'external-later' | 'firm-choose' | 'firm-now' | 'firm-later'>('choose');
  const [externalLabel, setExternalLabel] = useState('');
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [selectedFirmUser, setSelectedFirmUser] = useState<typeof MOCK_FIRM_USERS[0] | null>(null);

  // Refs for focus management
  const templateNameRef = useRef<HTMLInputElement>(null);
  const externalNameRef = useRef<HTMLInputElement>(null);
  const externalLabelRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Focus states
  const [isTemplateNameFocused, setIsTemplateNameFocused] = useState(false);

  const steps = [
    { number: 1, title: 'Category' },
    { number: 2, title: 'Template Details' },
    { number: 3, title: 'Recipients' },
    { number: 4, title: 'Assign Fields' },
  ];

  const handleCategorySelect = (category: TemplateCategory) => {
    setSelectedCategory(category);
  };

  // File upload handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        if (errors.uploadedFile) {
          setErrors(prev => ({ ...prev, uploadedFile: '' }));
        }
        toast.success('Document uploaded successfully!', {
          description: file.name,
        });
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload a PDF file',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        if (errors.uploadedFile) {
          setErrors(prev => ({ ...prev, uploadedFile: '' }));
        }
        toast.success('Document uploaded successfully!', {
          description: file.name,
        });
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload a PDF file',
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedCategory) {
        newErrors.category = 'Please select a category';
      }
      if (!uploadedFile) {
        newErrors.uploadedFile = 'Please upload a PDF document';
      }
    }

    if (step === 2) {
      if (!templateName.trim()) {
        newErrors.templateName = 'Template name is required';
      }
    }

    if (step === 3) {
      if (configuredRoles.length === 0) {
        newErrors.roles = 'Please add at least one recipient role';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        // Save template
        toast.success('Template created successfully!');
        navigate('/signature-templates');
      } else {
        setCurrentStep(currentStep + 1);
        setErrors({});
        // Auto-select first recipient when entering Step 4
        if (currentStep === 3 && configuredRoles.length > 0) {
          setSelectedRecipient(configuredRoles[0].id);
        }
      }
    } else {
      // Show toast for validation errors
      toast.error('Please fill out all required fields', {
        description: 'Some required information is missing',
        action: {
          label: 'Got it',
          onClick: () => {
            if (currentStep === 2) {
              if (errors.templateName && templateNameRef.current) {
                templateNameRef.current.focus();
              }
            }
          },
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return !!selectedCategory;
    if (currentStep === 2) return templateName.trim();
    if (currentStep === 3) return configuredRoles.length > 0;
    if (currentStep === 4) return true;
    return false;
  };

  const getCategoryIcon = (category: TemplateCategory) => {
    switch (category) {
      case 'Tax':
        return '📋';
      case 'Engagement':
        return '📝';
      case 'Custom':
        return '📄';
    }
  };

  const getCategoryDescription = (category: TemplateCategory) => {
    switch (category) {
      case 'Tax':
        return 'For tax-related forms and authorizations';
      case 'Engagement':
        return 'For engagement letters and service agreements';
      case 'Custom':
        return 'For custom documents and forms';
    }
  };

  // Auto-focus template name when entering step 2
  useEffect(() => {
    if (currentStep === 2 && !templateName) {
      setTimeout(() => {
        templateNameRef.current?.focus();
        templateNameRef.current?.select();
      }, 100);
    }
  }, [currentStep]);

  // Auto-focus external name when on external-now step
  useEffect(() => {
    if (addRoleStep === 'external-now') {
      setTimeout(() => {
        externalNameRef.current?.focus();
        externalNameRef.current?.select();
      }, 100);
    }
  }, [addRoleStep]);

  // Auto-focus external label when on external-later step
  useEffect(() => {
    if (addRoleStep === 'external-later' || addRoleStep === 'firm-later') {
      setTimeout(() => {
        externalLabelRef.current?.focus();
        externalLabelRef.current?.select();
      }, 100);
    }
  }, [addRoleStep]);

  const moveRecipient = (dragIndex: number, hoverIndex: number) => {
    const dragRecipient = configuredRoles[dragIndex];
    const newRoles = [...configuredRoles];
    newRoles.splice(dragIndex, 1);
    newRoles.splice(hoverIndex, 0, dragRecipient);
    newRoles.forEach((role, idx) => {
      role.order = idx + 1;
    });
    setConfiguredRoles(newRoles);
  };

  const openAddRoleDialog = () => {
    setShowAddRoleDialog(true);
    setAddRoleStep('choose');
    setExternalLabel('');
    setExternalName('');
    setExternalEmail('');
    setSelectedFirmUser(null);
  };

  const closeAddRoleDialog = () => {
    setShowAddRoleDialog(false);
    setAddRoleStep('choose');
    setExternalLabel('');
    setExternalName('');
    setExternalEmail('');
    setSelectedFirmUser(null);
  };

  const addClientRole = () => {
    const newRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'client',
      order: configuredRoles.length + 1,
      selectLater: true,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'client',
    };
    setConfiguredRoles([...configuredRoles, newRole]);
    closeAddRoleDialog();
    toast.success('Client recipient added');
  };

  const addClientSpouseRole = () => {
    const clientRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'client-spouse',
      order: configuredRoles.length + 1,
      selectLater: true,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'client',
      name: 'Client',
    };
    const spouseRole: ConfiguredRole = {
      id: `role-${Date.now() + 1}`,
      roleType: 'client-spouse',
      order: configuredRoles.length + 2,
      selectLater: true,
      color: ROLE_COLORS[(configuredRoles.length + 1) % ROLE_COLORS.length],
      sourceType: 'spouse-tag',
      name: "Client's Spouse",
    };
    setConfiguredRoles([...configuredRoles, clientRole, spouseRole]);
    closeAddRoleDialog();
    toast.success('Client and Spouse recipients added');
  };

  const addExternalNowRole = () => {
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

    const newRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'external',
      order: configuredRoles.length + 1,
      label: externalLabel || 'External Recipient',
      name: externalName,
      email: externalEmail,
      selectLater: false,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'external',
    };
    setConfiguredRoles([...configuredRoles, newRole]);
    closeAddRoleDialog();
    toast.success(`Added ${externalName} as recipient`);
  };

  const addExternalLaterRole = () => {
    const newRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'external',
      order: configuredRoles.length + 1,
      label: externalLabel || 'External Recipient',
      selectLater: true,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'external',
    };
    setConfiguredRoles([...configuredRoles, newRole]);
    closeAddRoleDialog();
    toast.success('External recipient added');
  };

  const addFirmUserNowRole = () => {
    if (!selectedFirmUser) {
      toast.error('Please select a firm user');
      return;
    }

    const newRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'firm-user',
      order: configuredRoles.length + 1,
      firmUserId: selectedFirmUser.id,
      firmUserName: selectedFirmUser.name,
      email: selectedFirmUser.email,
      selectLater: false,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'firm',
    };
    setConfiguredRoles([...configuredRoles, newRole]);
    closeAddRoleDialog();
    toast.success(`Added ${selectedFirmUser.name} as recipient`);
  };

  const addFirmUserLaterRole = () => {
    const newRole: ConfiguredRole = {
      id: `role-${Date.now()}`,
      roleType: 'firm-user',
      order: configuredRoles.length + 1,
      selectLater: true,
      color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
      sourceType: 'firm',
    };
    setConfiguredRoles([...configuredRoles, newRole]);
    closeAddRoleDialog();
    toast.success('Firm user recipient added');
  };

  const removeRecipient = (id: string) => {
    setConfiguredRoles(configuredRoles.filter(r => r.id !== id).map((r, idx) => ({ ...r, order: idx + 1 })));
    // Remove fields assigned to this recipient
    setFields(fields.filter(f => f.recipientId !== id));
    // Clear selection if this was selected
    if (selectedRecipient === id) {
      setSelectedRecipient(configuredRoles.length > 1 ? configuredRoles.find(r => r.id !== id)?.id || null : null);
    }
    toast.success('Recipient removed');
  };

  const getRoleDisplayName = (role: ConfiguredRole) => {
    if (role.name) return role.name;
    if (role.roleType === 'client') return 'Client';
    if (role.roleType === 'client-spouse') return 'Client';
    if (role.roleType === 'external') return role.label || 'External Recipient';
    if (role.roleType === 'firm-user') return role.firmUserName || 'Firm User';
    return 'Recipient';
  };

  // Field placement functions
  const getFieldWidth = (type: FieldType): number => {
    switch (type) {
      case 'signature': return 140;
      case 'initial': return 60;
      case 'date-signed': return 100;
      case 'checkbox': return 20;
      case 'dob': return 100;
      case 'company-name': return 140;
      case 'address': return 200;
      default: return 120;
    }
  };

  const getFieldHeight = (type: FieldType): number => {
    switch (type) {
      case 'signature': return 50;
      case 'checkbox': return 20;
      case 'address': return 60;
      default: return 30;
    }
  };

  const getFieldLabel = (type: FieldType): string => {
    const labels: Record<FieldType, string> = {
      'signature': 'Signature',
      'initial': 'Initial',
      'date-signed': 'Date',
      'text': 'Text',
      'checkbox': 'Checkbox',
      'name': 'Name',
      'company-name': 'Company',
      'dob': 'DOB',
      'address': 'Address',
    };
    return labels[type];
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFieldType || !selectedRecipient) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label: getFieldLabel(selectedFieldType),
      required: true,
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

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string, field: TemplateField) => {
    e.stopPropagation();
    setDraggingField(fieldId);
    
    const parentRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const fieldRect = e.currentTarget.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - fieldRect.left,
      y: e.clientY - fieldRect.top,
    });
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!draggingField) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const field = fields.find(f => f.id === draggingField);
    if (!field) return;

    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    setFields(fields.map(f =>
      f.id === draggingField
        ? { ...f, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : f
    ));
  };

  const handleFieldMouseUp = () => {
    setDraggingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, field: TemplateField) => {
    e.stopPropagation();
    setResizingField(fieldId);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width || getFieldWidth(field.type),
      height: field.height || getFieldHeight(field.type),
    });
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!resizingField) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    setFields(fields.map(f => {
      if (f.id === resizingField) {
        const newWidth = Math.max(40, resizeStart.width + deltaX);
        const newHeight = Math.max(20, resizeStart.height + deltaY);
        return { ...f, width: newWidth, height: newHeight };
      }
      return f;
    }));
  };

  const handleResizeMouseUp = () => {
    setResizingField(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/signature-templates')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
        </div>
        <div>
          <h1 className="text-2xl text-gray-900 dark:text-gray-100">Create New Template</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set up a reusable template for signature requests
          </p>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    currentStep === step.number
                      ? 'text-white shadow-lg'
                      : currentStep > step.number
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                  style={currentStep === step.number ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <span
                  className={`text-sm ${
                    currentStep === step.number
                      ? 'font-medium text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="h-px w-12 bg-gray-300 dark:bg-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentStep !== 4 && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-2">Select Template Category</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose the category that best describes this template
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['Tax', 'Engagement', 'Custom'] as TemplateCategory[]).map((category) => (
                    <Card
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category
                          ? 'border-2 ring-2 ring-offset-2'
                          : 'border-2 border-gray-200 dark:border-gray-700'
                      }`}
                      style={
                        selectedCategory === category
                          ? {
                              borderColor: 'var(--primaryColor)',
                              ringColor: 'var(--primaryColor)',
                            }
                          : {}
                      }
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-3">{getCategoryIcon(category)}</div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryDescription(category)}
                        </p>
                        {selectedCategory === category && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--primaryColor)' }}>
                            <Check className="w-4 h-4" />
                            Selected
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {errors.category && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </div>
                )}

                {/* Document Upload Section */}
                {selectedCategory && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        Upload Template Document
                        <span className="text-red-500">*</span>
                        {!uploadedFile && (
                          <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20">
                            Required
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload a PDF document that will be used as the template
                      </p>
                    </div>

                    {!uploadedFile ? (
                      <Card
                        className={`border-2 border-dashed transition-all cursor-pointer ${
                          isDragging
                            ? 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="p-12 text-center">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <h4 className="text-base text-gray-900 dark:text-gray-100 mb-2">
                            Click to upload or drag and drop
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            PDF files only (max 10MB)
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20">
                        <div className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {uploadedFile.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-green-400 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile();
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {errors.uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        {errors.uploadedFile}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Template Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Form Card */}
                <Card className="p-8">
                  <div className="space-y-8">
                    {/* Template Name */}
                    <div className={`p-5 rounded-lg border-2 transition-all ${templateName ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className={`w-5 h-5 mt-0.5 ${templateName ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <div className="flex-1">
                          <Label htmlFor="templateName" className="text-base flex items-center gap-2">
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
                        ref={templateNameRef}
                        id="templateName"
                        value={templateName}
                        onChange={(e) => {
                          setTemplateName(e.target.value);
                          setTouched(prev => ({ ...prev, templateName: true }));
                          if (errors.templateName) {
                            setErrors(prev => ({ ...prev, templateName: '' }));
                          }
                        }}
                        onFocus={() => setIsTemplateNameFocused(true)}
                        onBlur={() => setIsTemplateNameFocused(false)}
                        placeholder="e.g., Form 8879 - Individual, Engagement Letter 2024"
                        className={cn(
                          "transition-all duration-200",
                          isTemplateNameFocused ? "text-3xl h-16" : "text-base h-11"
                        )}
                        autoComplete="off"
                      />
                    </div>

                    {/* Tax Year */}
                    <div className={`p-5 rounded-lg border-2 transition-all ${templateYear ? 'border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <CalendarIcon className={`w-5 h-5 mt-0.5 ${templateYear ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label htmlFor="templateYear" className="text-base flex items-center gap-2">
                              Tax Year
                              <span className="text-red-500">*</span>
                            </Label>
                            {templateYear && (
                              <Badge 
                                variant="default" 
                                className="text-base px-3 py-1"
                                style={{ backgroundColor: 'var(--primaryColor)' }}
                              >
                                {templateYear}
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
                          variant={templateYear === new Date().getFullYear() - 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTemplateYear(new Date().getFullYear() - 1)}
                          className="flex-1"
                          style={templateYear === new Date().getFullYear() - 1 ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {new Date().getFullYear() - 1}
                        </Button>
                        <Button
                          type="button"
                          variant={templateYear === new Date().getFullYear() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTemplateYear(new Date().getFullYear())}
                          className="flex-1"
                          style={templateYear === new Date().getFullYear() ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {new Date().getFullYear()}
                        </Button>
                        <Button
                          type="button"
                          variant={templateYear === new Date().getFullYear() + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTemplateYear(new Date().getFullYear() + 1)}
                          className="flex-1"
                          style={templateYear === new Date().getFullYear() + 1 ? { backgroundColor: 'var(--primaryColor)' } : {}}
                        >
                          {new Date().getFullYear() + 1}
                        </Button>
                      </div>
                      <Select
                        value={templateYear.toString()}
                        onValueChange={(value) => setTemplateYear(parseInt(value))}
                      >
                        <SelectTrigger id="templateYear">
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template Description */}
                    <div className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/30">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 mt-0.5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <Label htmlFor="templateDescription" className="text-base">
                            Description <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Add additional context about when to use this template
                          </p>
                        </div>
                      </div>
                      <Textarea
                        id="templateDescription"
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="e.g., Use this for individual tax returns requiring electronic filing authorization..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 3: Recipients - EXACT COPY FROM UploadDocumentView */}
            {currentStep === 3 && (
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
                      onClick={openAddRoleDialog}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recipient
                    </Button>
                  </div>

                  {configuredRoles.length === 0 ? (
                    <button
                      onClick={openAddRoleDialog}
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
                        {configuredRoles.map((recipient, index) => (
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

                  {errors.roles && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-4">
                      <AlertCircle className="w-4 h-4" />
                      {errors.roles}
                    </div>
                  )}
                </Card>

                {configuredRoles.length > 1 && (
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
                          {configuredRoles.slice(0, 3).map((recipient, idx) => (
                            <div key={recipient.id} className="flex items-center">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                                style={{ backgroundColor: recipient.color }}
                              >
                                {idx + 1}
                              </div>
                              {idx < Math.min(2, configuredRoles.length - 1) && (
                                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                              )}
                            </div>
                          ))}
                          {configuredRoles.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{configuredRoles.length - 3}</span>
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
                          {configuredRoles.slice(0, 3).map((recipient) => (
                            <div
                              key={recipient.id}
                              className="w-6 h-6 rounded-full -ml-2 first:ml-0 border-2 border-white dark:border-gray-800"
                              style={{ backgroundColor: recipient.color }}
                            />
                          ))}
                          {configuredRoles.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{configuredRoles.length - 3}</span>
                          )}
                        </div>
                      </button>
                    </div>
                  </Card>
                )}

                {configuredRoles.length > 0 && (
                  <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm mb-3">Ready for Field Placement</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Template Name:</span>
                        <span>{templateName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span>{selectedCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                        <span>{configuredRoles.length} ({configuredRoles.filter(r => r.sourceType !== 'spouse-tag').length} {signingOrder === 'sequential' ? 'in sequence' : 'simultaneous'})</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Field Placement - EXACT COPY FROM UploadDocumentView */}
        {currentStep === 4 && (
          <div className="flex gap-6 h-[calc(100vh-280px)] px-6 py-8">
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px] text-center">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled>
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
                      className="shadow-lg relative overflow-hidden cursor-crosshair"
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
                          <p className="text-sm opacity-50">Template Document Preview</p>
                        </div>
                      </div>

                      {/* Signature Fields */}
                      {fields
                        .filter(f => f.page === currentPage)
                        .map((field) => {
                          const recipient = configuredRoles.find(r => r.id === field.recipientId);
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

            {/* Right Sidebar - EXACT COPY */}
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
                    {configuredRoles.map((recipient) => {
                      const recipientName = recipient.name || 
                        (recipient.sourceType === 'spouse-tag' ? 'Spouse' :
                         recipient.sourceType === 'external' ? 'External' :
                         recipient.sourceType === 'firm' ? 'Firm Staff' : 'Client');
                      
                      return (
                        <button
                          key={recipient.id}
                          onClick={() => setSelectedRecipient(recipient.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedRecipient === recipient.id
                              ? 'bg-gray-50 dark:bg-gray-800'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          style={selectedRecipient === recipient.id ? { borderColor: recipient.color } : undefined}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: recipient.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {recipient.sourceType === 'spouse-tag' ? 'Spouse' :
                                 recipient.sourceType === 'external' ? 'External' :
                                 recipient.sourceType === 'firm' ? 'Firm Staff' : 'Client'}
                              </p>
                              <p className="text-sm truncate">{recipientName}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {fields.filter(f => f.recipientId === recipient.id).length} fields
                            </Badge>
                          </div>
                          {recipient.email && (
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={recipient.email}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                setConfiguredRoles(configuredRoles.map(r => 
                                  r.id === recipient.id ? { ...r, email: e.target.value } : r
                                ));
                              }}
                              className="text-sm h-8"
                              disabled
                            />
                          )}
                        </button>
                      );
                    })}
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
                        { value: 'date-signed', label: 'Date Signed', icon: CalendarIcon },
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
                            onClick={() => setSelectedFieldType(field.value as FieldType)}
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
                      <span>{configuredRoles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Page:</span>
                      <span>{currentPage} of {totalPages}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/signature-templates')}>
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              style={{ backgroundColor: canGoNext() ? 'var(--primaryColor)' : undefined }}
            >
              {currentStep === 4 ? 'Save Template' : 'Next'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Recipient Dialog */}
      <AddSignatureTemplateDialog
        open={showAddRoleDialog}
        onOpenChange={setShowAddRoleDialog}
        onAddClient={addClientRole}
        onAddClientSpouse={addClientSpouseRole}
        onAddExternalNow={(label, name, email) => {
          const newRole: ConfiguredRole = {
            id: `role-${Date.now()}`,
            roleType: 'external',
            order: configuredRoles.length + 1,
            label,
            name,
            email,
            selectLater: false,
            color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
            sourceType: 'external',
          };
          setConfiguredRoles([...configuredRoles, newRole]);
          toast.success(`Added ${name} as recipient`);
        }}
        onAddExternalLater={(label) => {
          const newRole: ConfiguredRole = {
            id: `role-${Date.now()}`,
            roleType: 'external',
            order: configuredRoles.length + 1,
            label,
            selectLater: true,
            color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
            sourceType: 'external',
          };
          setConfiguredRoles([...configuredRoles, newRole]);
          toast.success('External recipient added');
        }}
        onAddFirmUserNow={(user) => {
          const newRole: ConfiguredRole = {
            id: `role-${Date.now()}`,
            roleType: 'firm-user',
            order: configuredRoles.length + 1,
            firmUserId: user.id,
            firmUserName: user.name,
            email: user.email,
            selectLater: false,
            color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
            sourceType: 'firm',
          };
          setConfiguredRoles([...configuredRoles, newRole]);
          toast.success(`Added ${user.name} as recipient`);
        }}
        onAddFirmUserLater={(label) => {
          const newRole: ConfiguredRole = {
            id: `role-${Date.now()}`,
            roleType: 'firm-user',
            order: configuredRoles.length + 1,
            label,
            selectLater: true,
            color: ROLE_COLORS[configuredRoles.length % ROLE_COLORS.length],
            sourceType: 'firm',
          };
          setConfiguredRoles([...configuredRoles, newRole]);
          toast.success('Firm user recipient added');
        }}
      />
    </div>
  );
}
