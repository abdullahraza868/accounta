import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ArrowLeft,
  FileText,
  X,
  FileSignature,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  User,
  Building2,
  PenLine,
  Calendar,
  Square,
  Home,
  Cake,
  Send,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';

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
  type: 'signer';
  order: number;
  color: string;
  sourceType: 'client' | 'spouse';
};

type Client = {
  id: string;
  name: string;
  email: string;
  spouseName?: string;
  spouseEmail?: string;
  hasSpouse: boolean;
};

const recipientColors = [
  '#7C3AED',
  '#3B82F6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#EF4444',
];

export function Form8879View() {
  const navigate = useNavigate();
  const location = useLocation();

  // File and document state - get file from location.state
  const [uploadedFile] = useState<File | null>((location.state as any)?.file || null);
  const verifiedRecipients = (location.state as any)?.recipients || [];
  const [documentName, setDocumentName] = useState('');
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Recipients (from verification screen)
  const [client, setClient] = useState<Client>({
    id: verifiedRecipients.find((r: any) => r.type === 'client')?.clientId || '1',
    name: verifiedRecipients.find((r: any) => r.type === 'client')?.name || 'John Smith',
    email: verifiedRecipients.find((r: any) => r.type === 'client')?.email || 'john.smith@example.com',
    spouseName: verifiedRecipients.find((r: any) => r.type === 'spouse')?.name || '',
    spouseEmail: verifiedRecipients.find((r: any) => r.type === 'spouse')?.email || '',
    hasSpouse: verifiedRecipients.some((r: any) => r.type === 'spouse')
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fields, setFields] = useState<SignatureField[]>([]);

  // Field placement state
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedFieldType, setSelectedFieldType] = useState<SignatureField['type'] | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  // Initialize recipients and fields when component mounts
  useEffect(() => {
    // If no file or no verified recipients, redirect to verification
    if (!uploadedFile || verifiedRecipients.length === 0) {
      if (uploadedFile) {
        // Has file but no verified recipients - go to verification
        navigate('/signatures/form-8879/verify', { state: { file: uploadedFile } });
      } else {
        // No file at all - go back to signatures
        navigate('/signatures');
      }
      return;
    }

    // Set default document name
    setDocumentName(`Form 8879 - ${client.name}`);

    // Initialize recipients from verified data
    const newRecipients: Recipient[] = [];
    
    // Add client
    const clientData = verifiedRecipients.find((r: any) => r.type === 'client');
    if (clientData) {
      newRecipients.push({
        id: 'client-1',
        name: clientData.name,
        email: clientData.email,
        type: 'signer',
        order: 1,
        color: recipientColors[0],
        sourceType: 'client',
      });
    }

    // Add spouse if exists
    const spouseData = verifiedRecipients.find((r: any) => r.type === 'spouse');
    if (spouseData) {
      newRecipients.push({
        id: 'spouse-1',
        name: spouseData.name,
        email: spouseData.email,
        type: 'signer',
        order: 2,
        color: recipientColors[1],
        sourceType: 'spouse',
      });
    }

    setRecipients(newRecipients);
    if (newRecipients.length > 0) {
      setSelectedRecipient(newRecipients[0].id);
    }

    // Simulate AI auto-placement of fields
    setTimeout(() => {
      const autoFields: SignatureField[] = [
        // Client signature fields
        { id: 'auto-1', type: 'signature', label: 'Signature', required: true, recipientId: 'client-1', page: 1, x: 10, y: 65, width: 140, height: 50 },
        { id: 'auto-2', type: 'date-signed', label: 'Date Signed', required: true, recipientId: 'client-1', page: 1, x: 40, y: 65, width: 100, height: 30 },
        { id: 'auto-3', type: 'name', label: 'Name', required: true, recipientId: 'client-1', page: 1, x: 10, y: 75, width: 120, height: 30 },
      ];

      // Add spouse fields if spouse exists
      if (client.hasSpouse) {
        autoFields.push(
          { id: 'auto-4', type: 'signature', label: 'Signature', required: true, recipientId: 'spouse-1', page: 1, x: 10, y: 85, width: 140, height: 50 },
          { id: 'auto-5', type: 'date-signed', label: 'Date Signed', required: true, recipientId: 'spouse-1', page: 1, x: 40, y: 85, width: 100, height: 30 },
          { id: 'auto-6', type: 'name', label: 'Name', required: true, recipientId: 'spouse-1', page: 2, x: 10, y: 15, width: 120, height: 30 }
        );
      }

      setFields(autoFields);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile, navigate]);

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFieldType || !selectedRecipient || !isEditMode) return;

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
    if (!isEditMode) return;
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
    if (!draggingField || !isEditMode) return;
    
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
    if (!isEditMode) return;
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, field: SignatureField) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    setResizingField(fieldId);
    setResizeStartSize({ 
      width: field.width || getFieldWidth(field.type), 
      height: field.height || getFieldHeight(field.type) 
    });
    setResizeStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!resizingField || !isEditMode) return;
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
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

  const canSend = fields.length > 0 && recipients.every(r => fields.some(f => f.recipientId === r.id));

  const handleSend = () => {
    if (!canSend) {
      toast.error('Please add at least one field for each recipient');
      return;
    }

    toast.success('Form 8879 sent successfully!');
    navigate('/signatures');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/signatures/form-8879/verify', { state: { file: uploadedFile, recipients: verifiedRecipients } })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipients
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h1 className="text-lg">{documentName || 'Form 8879'}</h1>
            {uploadedFile && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{uploadedFile.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex h-[calc(100vh-80px)]",
        isFullscreen ? "p-0" : "gap-6 p-6"
      )}>
        {/* Document Viewer */}
        <div className={cn(
          "flex flex-col",
          isFullscreen ? "flex-1" : "flex-1 max-w-4xl mx-auto"
        )}>
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Page {currentPage} of 4</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 4}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={zoom <= 50}
                  onClick={() => setZoom(z => Math.max(50, z - 10))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm w-16 text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={zoom >= 200}
                  onClick={() => setZoom(z => Math.min(200, z + 10))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
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

              {/* Page Thumbnails */}
              <div className="w-24 p-3 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pages</p>
                <div className="space-y-2 flex-1 overflow-auto">
                  {[1, 2, 3, 4].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-full aspect-[8.5/11] border-2 rounded flex items-center justify-center text-xs transition-colors",
                        currentPage === page
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      )}
                      style={{
                        borderColor: currentPage === page ? 'var(--primaryColor)' : undefined
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Preview */}
              <div 
                className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900 flex items-start justify-center"
                onMouseMove={(e) => {
                  handleFieldMouseMove(e);
                  handleResizeMouseMove(e);
                }}
                onMouseUp={() => {
                  handleFieldMouseUp();
                  handleResizeMouseUp();
                }}
              >
                <div className="relative">
                  <Card
                    className={cn(
                      "bg-white dark:bg-gray-800 shadow-lg relative",
                      isEditMode && selectedFieldType ? "cursor-crosshair" : ""
                    )}
                    style={{
                      width: `${612 * (zoom / 100)}px`,
                      minHeight: `${792 * (zoom / 100)}px`,
                    }}
                    onClick={handleDocumentClick}
                  >
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <FileText className="w-12 h-12 text-gray-400" />
                        <div className="text-right">
                          <h3>Form 8879</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">IRS e-file Signature Authorization</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <p>Taxpayer Name: {client.name}</p>
                        {client.hasSpouse && (
                          <p>Spouse Name: {client.spouseName}</p>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            This is a preview of the uploaded Form 8879 document.
                            The actual document content will be displayed here.
                          </p>
                        </div>
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
                            className={`absolute border-2 rounded text-xs flex items-center justify-between gap-1 transition-shadow select-none group ${
                              draggingField === field.id || resizingField === field.id ? 'shadow-2xl z-50' : ''
                            } ${isEditMode ? 'cursor-move hover:shadow-lg' : 'pointer-events-none'}`}
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
                                {isEditMode && (
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
                                )}
                              </>
                            )}
                            {/* Resize handle - only visible in edit mode */}
                            {isEditMode && (
                              <div
                                className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                  borderRight: `2px solid ${recipient?.color}`,
                                  borderBottom: `2px solid ${recipient?.color}`,
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, field.id, field)}
                              />
                            )}
                          </div>
                        );
                      })}
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        {!isFullscreen && (
          <div className="w-96 overflow-auto">
            <Card className="p-6">
              <h3 className="mb-4">Document Settings</h3>

              {/* Document Name Editor */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm mb-3">Document Name</h4>
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  className="h-9"
                />
              </div>

              {/* Tax Year Selector */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm mb-3">Tax Year</h4>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={taxYear === new Date().getFullYear() - 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTaxYear(new Date().getFullYear() - 1)}
                    className="flex-1"
                    style={taxYear === new Date().getFullYear() - 1 ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    {new Date().getFullYear() - 1}
                  </Button>
                  <Button
                    variant={taxYear === new Date().getFullYear() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTaxYear(new Date().getFullYear())}
                    className="flex-1"
                    style={taxYear === new Date().getFullYear() ? { backgroundColor: 'var(--primaryColor)' } : {}}
                  >
                    {new Date().getFullYear()}
                  </Button>
                </div>
                <Select
                  value={taxYear.toString()}
                  onValueChange={(value) => setTaxYear(parseInt(value))}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Select year" />
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

              {/* Client & Spouse Email Management */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm">{client.hasSpouse ? 'Client and Spouse' : 'Client'}</h4>
                  <Badge variant="outline" className="text-xs" style={{ borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }}>
                    AI Extracted
                  </Badge>
                </div>
                <div className="space-y-3">
                  {recipients.map((recipient) => (
                    <div 
                      key={recipient.id} 
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: recipient.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {recipient.sourceType === 'client' ? 'Client' : 'Spouse'}
                          </div>
                          <div className="text-sm truncate">
                            {recipient.name}
                          </div>
                        </div>
                      </div>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={recipient.email}
                        onChange={(e) => {
                          const newRecipients = recipients.map(r => 
                            r.id === recipient.id ? { ...r, email: e.target.value } : r
                          );
                          setRecipients(newRecipients);
                          
                          if (recipient.sourceType === 'client') {
                            setClient({ ...client, email: e.target.value });
                          } else if (recipient.sourceType === 'spouse') {
                            setClient({ ...client, spouseEmail: e.target.value });
                          }
                        }}
                        className="text-sm h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Section */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm mb-3">Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Fields:</span>
                    <span className="font-medium">{fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                    <span className="font-medium">{recipients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax Year:</span>
                    <span className="font-medium">{taxYear}</span>
                  </div>
                </div>
              </div>

              {/* Edit Details Section - Collapsible */}
              <div className="mb-6 pb-6 border-b-2 border-gray-300 dark:border-gray-600">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Edit Details</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs font-semibold" 
                      style={{ 
                        borderColor: 'var(--primaryColor)', 
                        color: 'var(--primaryColor)',
                        backgroundColor: 'var(--primaryColor)10'
                      }}
                    >
                      AI Auto-Placed
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    {fields.length} fields automatically placed for {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'}
                  </p>
                  <Button
                    variant={isEditMode ? "default" : "outline"}
                    size="default"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="w-full font-semibold"
                    style={isEditMode ? { backgroundColor: 'var(--primaryColor)' } : { borderWidth: '2px' }}
                  >
                    {isEditMode ? 'Done Editing Fields' : 'Edit Fields'}
                  </Button>
                </div>

                {isEditMode && (
                  <>
                    <div className="mt-6">
                      <h4 className="text-sm mb-3">Select Recipient</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Choose who should fill out the fields you place
                      </p>
                      <div className="space-y-2">
                        {recipients.map((recipient) => (
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
                                  {recipient.sourceType === 'client' ? 'Client' : 'Spouse'}
                                </p>
                                <p className="text-sm truncate">{recipient.name}</p>
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
                  </>
                )}
              </div>

              {/* Send Button */}
              <div>
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
                    Add at least one field for each recipient
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}