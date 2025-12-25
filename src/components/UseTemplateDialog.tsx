import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Search, 
  Users, 
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Send,
  Heart,
  Building2
} from 'lucide-react';
import { cn } from './ui/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

// Custom Fullscreen Icon Component
const FullscreenIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3H19C20.1046 3 21 3.89543 21 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Client = {
  id: string;
  name: string;
  email: string;
  type: 'Individual' | 'Business';
  companyName?: string;
};

type ClientGroup = {
  id: string;
  name: string;
  clientCount: number;
  clients: string[];
};

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

type UseTemplateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  onNavigateToPreview?: (templateId: string, recipients: Recipient[], isGroup?: boolean, groupName?: string) => void;
};

// Mock data - matches NewTemplateView
const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', type: 'Individual' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Individual' },
  { id: '3', name: 'Michael Chen', email: 'mchen@techcorp.com', type: 'Business', companyName: 'TechCorp Inc.' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily.r@consulting.com', type: 'Business', companyName: 'Rodriguez Consulting' },
  { id: '5', name: 'David Lee', email: 'david.lee@email.com', type: 'Individual' },
  { id: '6', name: 'Jennifer Martinez', email: 'jmartinez@globalllc.com', type: 'Business', companyName: 'Global Solutions LLC' },
];

// Real client groups from the system (matching ManageClientGroupsDialog)
const availableClientGroups = [
  'Premium',
  'Trial',
  'FreeTrial',
  'Fit-St Premium',
  'VIP',
  'Tax Services',
  'Bookkeeping',
  'Quarterly Review',
  'Annual Review',
  'New Client',
  'High Priority'
];

const mockClientGroups: ClientGroup[] = availableClientGroups.map((name, index) => ({
  id: `g${index + 1}`,
  name,
  clientCount: Math.floor(Math.random() * 50) + 5, // Random count for demo
  clients: []
}));

const mockTemplateFields: PlacedField[] = [
  {
    id: 'f1',
    type: 'signature',
    label: 'Client Signature',
    recipientId: 'client',
    page: 1,
    x: 20,
    y: 70,
    width: 25,
    height: 8,
    required: true
  },
  {
    id: 'f2',
    type: 'date',
    label: 'Date Signed',
    recipientId: 'client',
    page: 1,
    x: 50,
    y: 70,
    width: 15,
    height: 8,
    required: true
  },
  {
    id: 'f3',
    type: 'text',
    label: 'Printed Name',
    recipientId: 'client',
    page: 1,
    x: 20,
    y: 60,
    width: 25,
    height: 6,
    required: true
  },
];

const recipientColors = [
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
];

export function UseTemplateDialog({ isOpen, onClose, templateId, templateName, onNavigateToPreview }: UseTemplateDialogProps) {
  const [step, setStep] = useState<'choose' | 'select-client' | 'select-client-spouse' | 'select-group' | 'preview'>('choose');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ClientGroup | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const handleSelectSingleClient = (client: Client) => {
    setSelectedClient(client);
    const newRecipients = [
      {
        id: 'client',
        name: client.name,
        email: client.email,
        role: 'Signer',
        color: recipientColors[0]
      }
    ];
    setRecipients(newRecipients);
    
    // Navigate to full page preview
    if (onNavigateToPreview) {
      onNavigateToPreview(templateId, newRecipients);
      onClose();
      resetDialog();
    } else {
      setStep('preview');
    }
  };

  const handleSelectClientWithSpouse = (client: Client) => {
    setSelectedClient(client);
    const newRecipients = [
      {
        id: 'client',
        name: client.name,
        email: client.email,
        role: 'Signer',
        color: recipientColors[0]
      },
      {
        id: 'spouse',
        name: client.type === 'Individual' ? 'Spouse' : 'Partner',
        email: '', // In real app, would get spouse email from client data
        role: 'Signer',
        color: recipientColors[1]
      }
    ];
    setRecipients(newRecipients);
    
    // Navigate to full page preview
    if (onNavigateToPreview) {
      onNavigateToPreview(templateId, newRecipients, false);
      onClose();
      resetDialog();
    } else {
      setStep('preview');
    }
  };

  const handleSelectGroup = (group: ClientGroup) => {
    setSelectedGroup(group);
    const groupClients = mockClients.filter(c => group.clients.includes(c.id));
    const newRecipients: Recipient[] = groupClients.map((client, index) => ({
      id: `${client.id}-client`,
      name: client.name,
      email: client.email,
      role: 'Signer',
      color: recipientColors[index % recipientColors.length]
    }));
    
    setRecipients(newRecipients);
    
    // Navigate to full page preview
    if (onNavigateToPreview) {
      onNavigateToPreview(templateId, newRecipients, true, group.name);
      onClose();
      resetDialog();
    } else {
      setStep('preview');
    }
  };

  const handleSend = () => {
    console.log('Sending signature request from template:', templateId);
    console.log('Recipients:', recipients);
    alert(`Signature request sent successfully!\n\nTemplate: ${templateName}\nRecipients: ${recipients.map(r => r.name).join(', ')}`);
    onClose();
    resetDialog();
  };

  const resetDialog = () => {
    setStep('choose');
    setSelectedClient(null);
    setSelectedGroup(null);
    setCurrentPage(1);
    setZoom(100);
    setIsFullscreen(false);
    setRecipients([]);
  };

  const goBack = () => {
    if (step === 'select-client' || step === 'select-client-spouse' || step === 'select-group') {
      setStep('choose');
      setSelectedClient(null);
      setSelectedGroup(null);
    } else if (step === 'preview') {
      setStep('choose');
    }
  };

  const getFieldColor = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    return recipient?.color || '#8B5CF6';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetDialog();
      }
    }}>
      <DialogContent className="max-w-2xl p-0 flex flex-col" aria-describedby="use-template-description">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle>Use Template: {templateName}</DialogTitle>
          <DialogDescription className="mt-1" id="use-template-description">
            {step === 'choose' && 'Choose how to send this template'}
            {step === 'select-client' && 'Select a client'}
            {step === 'select-client-spouse' && 'Select a client (includes spouse)'}
            {step === 'select-group' && 'Select a client group'}
            {step === 'preview' && 'Preview and send signature request'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Choose send method */}
          {step === 'choose' && (
            <div className="max-w-3xl mx-auto">
              <div>
                <Label className="text-base mb-3 block">Send To</Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Single Client Option */}
                  <button
                    onClick={() => setStep('select-client')}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">Single Client</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send to one client</p>
                    </div>
                  </button>

                  {/* Client & Spouse Option */}
                  <button
                    onClick={() => setStep('select-client-spouse')}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">Client & Spouse</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send to both spouses</p>
                    </div>
                  </button>

                  {/* Client Group Option */}
                  <button
                    onClick={() => setStep('select-group')}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">Client Group</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send to all in a group</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2a: Select single client */}
          {step === 'select-client' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div>
                <Label className="mb-2 block">Search and Select Client</Label>
                <Command className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CommandInput placeholder="Search clients by name or email..." />
                  <CommandList className="max-h-[500px]">
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {mockClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => handleSelectSingleClient(client)}
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
            </div>
          )}

          {/* Step 2b: Select client with spouse */}
          {step === 'select-client-spouse' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div>
                <Label className="mb-2 block">Search and Select Client (includes spouse)</Label>
                <Command className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CommandInput placeholder="Search clients by name or email..." />
                  <CommandList className="max-h-[500px]">
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {mockClients.filter(c => c.type === 'Individual').map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => handleSelectClientWithSpouse(client)}
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
            </div>
          )}

          {/* Step 2c: Select client group */}
          {step === 'select-group' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div>
                <Label className="mb-2 block">Search and Select Client Group</Label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search client groups..."
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-auto">
                  {mockClientGroups.map((group) => (
                    <Card
                      key={group.id}
                      className="p-3 cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
                      onClick={() => handleSelectGroup(group)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">{group.name}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {group.clientCount} {group.clientCount === 1 ? 'client' : 'clients'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {group.clientCount}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="h-full flex gap-4">
              {/* Left: Document Preview */}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2"
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        <FullscreenIcon className={cn("w-4 h-4 transition-transform", isFullscreen && "rotate-180")} />
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
                        <FullscreenIcon className="w-6 h-6 rotate-180" />
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
                        {mockTemplateFields
                          .filter(field => field.page === currentPage)
                          .map((field) => (
                            <div
                              key={field.id}
                              className="absolute border-2 rounded flex items-center justify-center text-xs font-medium pointer-events-none"
                              style={{
                                left: `${field.x}%`,
                                top: `${field.y}%`,
                                width: `${field.width}%`,
                                height: `${field.height}%`,
                                borderColor: getFieldColor(field.recipientId),
                                backgroundColor: `${getFieldColor(field.recipientId)}10`,
                                color: getFieldColor(field.recipientId),
                              }}
                            >
                              {field.label}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right: Recipients & Info */}
              <div className="w-80 flex flex-col gap-4">
                <Card className="p-4">
                  <Label className="text-sm mb-3 block">Recipients</Label>
                  <div className="space-y-2">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center gap-2 p-2 rounded border"
                        style={{ borderColor: `${recipient.color}40` }}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: recipient.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{recipient.name}</p>
                          {recipient.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{recipient.email}</p>
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
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <Label className="text-sm mb-3 block">Template Info</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Template:</span>
                      <span className="font-medium">{templateName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fields:</span>
                      <span>{mockTemplateFields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                      <span>4</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div>
            {step !== 'choose' && (
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step === 'preview' && (
              <Button
                onClick={handleSend}
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Signature Request
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}