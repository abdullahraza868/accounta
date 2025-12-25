import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Send,
  Edit,
  Maximize2,
  Minimize2,
  FileSignature,
  PenLine,
  User,
  Calendar,
  Square,
  Building2,
  Cake,
  Home,
  Type,
  GripVertical,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner@2.0.3';



type Recipient = {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
};

type PlacedField = {
  id: string;
  type: string;
  label: string;
  recipientId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
};

// Mock template fields
const mockTemplateFields: PlacedField[] = [
  { id: '1', type: 'signature', label: 'Signature', recipientId: 'client', page: 1, x: 20, y: 70, width: 30, height: 6, required: true },
  { id: '2', type: 'date-signed', label: 'Date', recipientId: 'client', page: 1, x: 55, y: 70, width: 20, height: 6, required: true },
  { id: '3', type: 'name', label: 'Full Name', recipientId: 'client', page: 2, x: 20, y: 30, width: 40, height: 5, required: true },
];

// Draggable Recipient Component
type DraggableRecipientProps = {
  recipient: Recipient;
  index: number;
  moveRecipient: (dragIndex: number, hoverIndex: number) => void;
};

const DraggableRecipient = ({ recipient, index, moveRecipient }: DraggableRecipientProps) => {
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-move transition-opacity",
        isDragging && "opacity-50"
      )}
      style={{ borderColor: `${recipient.color}40`, backgroundColor: `${recipient.color}05` }}
    >
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: recipient.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{recipient.name}</p>
        {recipient.email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
        )}
      </div>
      <Badge 
        variant="outline" 
        className="text-xs flex-shrink-0"
        style={{ borderColor: recipient.color, color: recipient.color }}
      >
        {recipient.role}
      </Badge>
    </div>
  );
};

export default function UseTemplateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId, templateName, recipients: initialRecipients, isGroup, groupName } = location.state || {
    templateId: '',
    templateName: 'Engagement Letter',
    recipients: [],
    isGroup: false,
    groupName: ''
  };

  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1); // Default to previous year
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fields, setFields] = useState<PlacedField[]>(mockTemplateFields);
  const [selectedRecipient, setSelectedRecipient] = useState(initialRecipients[0]?.id || '');
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  const moveRecipient = (dragIndex: number, hoverIndex: number) => {
    const newRecipients = [...recipients];
    const [removed] = newRecipients.splice(dragIndex, 1);
    newRecipients.splice(hoverIndex, 0, removed);
    setRecipients(newRecipients);
  };

  const handleSend = () => {
    console.log('Sending signature request from template:', templateId);
    console.log('Recipients:', recipients);
    toast.success('Signature request sent successfully!');
    navigate('/signatures');
  };

  const getFieldColor = (recipientId: string) => {
    const recipient = recipients.find((r: Recipient) => r.id === recipientId);
    return recipient?.color || '#8B5CF6';
  };

  // Determine recipient title
  const getRecipientTitle = () => {
    if (isGroup) return 'Client Groups';
    if (recipients.length === 2 && recipients.some((r: Recipient) => r.id === 'spouse')) {
      return 'Client and Spouse';
    }
    return 'Client';
  };

  // Field types matching UploadDocumentView
  const fieldTypes = [
    { type: 'signature', label: 'Signature', Icon: FileSignature },
    { type: 'initial', label: 'Initials', Icon: PenLine },
    { type: 'name', label: 'Name', Icon: User },
    { type: 'date-signed', label: 'Date Signed', Icon: Calendar },
    { type: 'checkbox', label: 'Checkbox', Icon: Square },
    { type: 'company-name', label: 'Company', Icon: Building2 },
    { type: 'dob', label: 'DOB', Icon: Cake },
    { type: 'address', label: 'Address', Icon: Home },
  ];

  // Handle document click to place field
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !selectedFieldType || !selectedRecipient) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newField: PlacedField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label: fieldTypes.find(ft => ft.type === selectedFieldType)?.label || 'Field',
      recipientId: selectedRecipient,
      page: currentPage,
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y)),
      width: getFieldWidth(selectedFieldType),
      height: getFieldHeight(selectedFieldType),
      required: true,
    };
    
    setFields([...fields, newField]);
    setSelectedFieldType(null);
  };

  const getFieldWidth = (type: string): number => {
    switch (type) {
      case 'signature': return 30;
      case 'initial': return 10;
      case 'checkbox': return 4;
      case 'date-signed': return 20;
      case 'name': return 25;
      case 'text': return 30;
      default: return 20;
    }
  };

  const getFieldHeight = (type: string): number => {
    switch (type) {
      case 'signature': return 8;
      case 'initial': return 6;
      case 'checkbox': return 4;
      default: return 6;
    }
  };

  // Handle field drag
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    
    const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggingField(fieldId);
    setDragOffset({
      x: e.clientX - rect.left - (field.x * rect.width / 100),
      y: e.clientY - rect.top - (field.y * rect.height / 100)
    });
  };

  const handleDocumentMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingField && !resizingField) return;

    if (draggingField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      setFields(fields.map(f => 
        f.id === draggingField 
          ? { ...f, x: Math.max(0, Math.min(100 - f.width, x)), y: Math.max(0, Math.min(100 - f.height, y)) }
          : f
      ));
    }

    if (resizingField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const newWidth = Math.max(5, resizeStartSize.width + (deltaX / rect.width) * 100);
      const newHeight = Math.max(4, resizeStartSize.height + (deltaY / rect.height) * 100);
      
      setFields(fields.map(f => 
        f.id === resizingField 
          ? { ...f, width: newWidth, height: newHeight }
          : f
      ));
    }
  };

  const handleDocumentMouseUp = () => {
    setDraggingField(null);
    setResizingField(null);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    
    setResizingField(fieldId);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: field.width, height: field.height });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/signatures')}
            >
              <X className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-medium">Use Template: {templateName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Preview and send signature request
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
          {/* Left: Document Preview */}
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800 p-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
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
                    className={cn("shadow-lg relative overflow-hidden", isEditMode && selectedFieldType && "cursor-crosshair")}
                    style={{ 
                      width: `${612 * (zoom / 100)}px`,
                      height: `${792 * (zoom / 100)}px`,
                      backgroundColor: 'white',
                    }}
                    onClick={handleDocumentClick}
                    onMouseMove={handleDocumentMouseMove}
                    onMouseUp={handleDocumentMouseUp}
                  >
                    <div className="absolute inset-0 p-8 text-sm text-gray-700 pointer-events-none overflow-hidden">
                      <div className="max-w-full break-words">
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
                          today&apos;s monetary policy actions after briefly reviewing economic developments.
                        </p>
                      </div>
                    </div>

                    {/* Placed Fields */}
                    {fields
                      .filter(field => field.page === currentPage)
                      .map((field) => (
                        <div
                          key={field.id}
                          className={cn(
                            "absolute border-2 rounded flex items-center justify-center text-xs font-medium group",
                            isEditMode ? "cursor-move" : "pointer-events-none"
                          )}
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            width: `${field.width}%`,
                            height: `${field.height}%`,
                            borderColor: getFieldColor(field.recipientId),
                            backgroundColor: `${getFieldColor(field.recipientId)}10`,
                            color: getFieldColor(field.recipientId),
                          }}
                          onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                        >
                          {field.label}
                          {isEditMode && (
                            <>
                              {/* Delete button */}
                              <button
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(field.id);
                                }}
                              >
                                ×
                              </button>
                              {/* Resize handle */}
                              <div
                                className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize"
                                style={{ borderColor: getFieldColor(field.recipientId) }}
                                onMouseDown={(e) => handleResizeMouseDown(e, field.id)}
                              />
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
          </div>

          {/* Right: Recipients & Info */}
          {!isFullscreen && (
          <div className="w-80 flex flex-col gap-4 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Tax Year Selector */}
            <Card className="p-5">
              <Label className="text-sm mb-3 block">Tax Year</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={taxYear === new Date().getFullYear() - 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaxYear(new Date().getFullYear() - 1)}
                  className="flex-1"
                  style={taxYear === new Date().getFullYear() - 1 ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  {new Date().getFullYear() - 1}
                </Button>
                <Button
                  type="button"
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-5">
              <Label className="text-sm mb-4 block">{getRecipientTitle()}</Label>
              {isGroup && groupName ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{groupName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{recipients.length} {recipients.length === 1 ? 'client' : 'clients'}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Sending to all clients in this group
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <DndProvider backend={HTML5Backend}>
                    {recipients.map((recipient: Recipient, index: number) => (
                      <DraggableRecipient
                        key={recipient.id}
                        recipient={recipient}
                        index={index}
                        moveRecipient={moveRecipient}
                      />
                    ))}
                  </DndProvider>
                </div>
              )}
            </Card>

            {/* Edit Mode Field Palette */}
            {isEditMode && (
              <>
                <Card className="p-4">
                  <Label className="text-sm mb-3 block">Select Recipient</Label>
                  <div className="space-y-2">
                    {recipients.map((recipient: Recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => setSelectedRecipient(recipient.id)}
                        className={cn(
                          "w-full p-2 rounded-lg border-2 transition-all text-left flex items-center gap-2",
                          selectedRecipient === recipient.id 
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
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
                    {fieldTypes.map((ft) => {
                      const FieldIcon = ft.Icon;
                      return (
                        <Button
                          key={ft.type}
                          variant={selectedFieldType === ft.type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFieldType(selectedFieldType === ft.type ? null : ft.type)}
                          className="text-xs justify-start"
                          style={
                            selectedFieldType === ft.type
                              ? { backgroundColor: 'var(--primaryColor)' }
                              : {}
                          }
                        >
                          <FieldIcon className="w-3.5 h-3.5 mr-1.5" />
                          {ft.label}
                        </Button>
                      );
                    })}
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

            {/* Template Info */}
            {!isEditMode && (
              <Card className="p-4">
                <Label className="text-sm mb-3 block">Template Info</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Template:</span>
                    <span className="font-medium">{templateName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax Year:</span>
                    <span>{taxYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fields:</span>
                    <span>{fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                    <span>4</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isEditMode ? (
                <>
                  <Button
                    onClick={handleSend}
                    className="w-full"
                    style={{ backgroundColor: 'var(--primaryColor)', borderColor: 'var(--primaryColor)' }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send for Signature
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Fields
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/signatures')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditMode(false)}
                    className="w-full"
                    style={{ backgroundColor: 'var(--primaryColor)', borderColor: 'var(--primaryColor)' }}
                  >
                    Done Editing
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      setFields(mockTemplateFields);
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
          )}
      </div>
    </div>
  );
}