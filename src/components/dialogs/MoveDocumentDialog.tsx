import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { MoveRight, AlertTriangle, User, Building2, Search, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';

type Document = {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  clientType: 'Individual' | 'Business';
  documentType: string;
  year: string;
};

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  documentCount: number;
  newDocumentCount: number;
  mostRecentDate: string;
  linkedAccounts?: string[];
};

type MoveDocumentDialogProps = {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  clients: ClientSummary[];
  onMove: (docId: string, newClientId: string) => void;
};

export function MoveDocumentDialog({
  open,
  onClose,
  document,
  clients,
  onMove,
}: MoveDocumentDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeTab, setActiveTab] = useState<'linked' | 'all'>('linked');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [unlinkedConfirmationText, setUnlinkedConfirmationText] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');

  if (!document) return null;

  // Get current client from document
  const currentClient = clients.find(c => c.id === document.clientId);
  
  // Get linked accounts
  const linkedAccounts = currentClient?.linkedAccounts
    ? clients.filter(c => currentClient.linkedAccounts?.includes(c.id) && c.id !== document.clientId)
    : [];

  // Get all other clients (excluding current client and linked accounts)
  const allOtherClients = clients.filter(
    c => c.id !== document.clientId && !currentClient?.linkedAccounts?.includes(c.id)
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const requiresConfirmation = selectedClient?.type !== document.clientType;
  
  // Check if target is unlinked
  const isUnlinked = selectedClient ? !currentClient?.linkedAccounts?.includes(selectedClientId) : false;
  // Show confirmation for both linked and unlinked accounts
  const shouldShowConfirmation = selectedClientId !== '';
  const needsUnlinkedConfirmation = isUnlinked && selectedClientId;

  // Reset selection when switching tabs
  const handleTabChange = (tab: 'linked' | 'all') => {
    setActiveTab(tab);
    setSelectedClientId('');
    setUnlinkedConfirmationText('');
    setConfirmationText('');
    setClientTypeFilter('all');
  };

  const handleMove = () => {
    if (!selectedClientId) {
      toast.error('Please select a client to move the document to');
      return;
    }

    // For unlinked clients, require confirmation text
    if (isUnlinked && unlinkedConfirmationText !== 'MOVE') {
      toast.error('Please type "MOVE" to confirm moving to an unlinked client');
      return;
    }

    // For linked accounts, require confirmation text
    if (!isUnlinked && confirmationText.toLowerCase() !== 'move') {
      toast.error('Please type "MOVE" to confirm');
      return;
    }

    onMove(document.id, selectedClientId);
    
    // Reset and close
    setSelectedClientId('');
    setActiveTab('linked');
    setSearchQuery('');
    setConfirmationText('');
    setUnlinkedConfirmationText('');
    onClose();
  };

  // Filter clients based on active tab, search, and client type
  const getFilteredClients = () => {
    let clientsToShow = activeTab === 'linked' ? linkedAccounts : allOtherClients;
    
    // Apply search filter
    if (searchQuery) {
      clientsToShow = clientsToShow.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply client type filter
    if (clientTypeFilter !== 'all') {
      clientsToShow = clientsToShow.filter(c => c.type === clientTypeFilter);
    }
    
    return clientsToShow;
  };

  const filteredClients = getFilteredClients().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          // Reset all state on close
          setSelectedClientId('');
          setActiveTab('linked');
          setSearchQuery('');
          setConfirmationText('');
          setUnlinkedConfirmationText('');
          setClientTypeFilter('all');
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="move-document-description">
        <DialogHeader>
          <DialogTitle>Move Document to Another Client</DialogTitle>
          <DialogDescription id="move-document-description">
            Carefully select which client this document should belong to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4 flex-1 overflow-hidden flex flex-col">
          {/* Document Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                📄
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{document.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{document.documentType}</Badge>
                  <Badge variant="outline" className="text-xs">{document.year}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* From → To Display */}
          <div className="flex items-center gap-3">
            {/* From */}
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-2 border-blue-300 dark:border-blue-700">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">FROM</div>
              <div className="flex items-center gap-2">
                {document.clientType === 'Business' ? (
                  <Building2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">{document.clientName}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{document.clientType}</div>
            </div>

            {/* Arrow */}
            <MoveRight className="w-8 h-8 text-gray-400 flex-shrink-0" />

            {/* To */}
            <div className={cn(
              "flex-1 rounded-lg p-3 border-2",
              selectedClient
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 border-dashed"
            )}>
              <div className={cn(
                "text-xs font-medium mb-1",
                selectedClient ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"
              )}>
                TO
              </div>
              {selectedClient ? (
                <>
                  <div className="flex items-center gap-2">
                    {selectedClient.type === 'Business' ? (
                      <Building2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <User className="w-4 h-4 text-green-600" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{selectedClient.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedClient.type}</div>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">Select client below</div>
              )}
            </div>
          </div>

          {/* Warning if moving between different types */}
          {requiresConfirmation && !isUnlinked && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> You're moving a document from a {document.clientType} to a {selectedClient?.type}. 
                This is unusual and should be done carefully.
              </AlertDescription>
            </Alert>
          )}

          {/* Tab Interface */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('linked')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'linked'
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Users className="w-4 h-4" />
              Linked Accounts
              {linkedAccounts.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {linkedAccounts.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => handleTabChange('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'all'
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Building2 className="w-4 h-4" />
              All Clients
              {allOtherClients.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {allOtherClients.length}
                </Badge>
              )}
            </button>
          </div>

          {/* Warning banner for All Clients tab */}
          {activeTab === 'all' && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                <strong>Caution:</strong> Moving documents to a non-linked client. Make sure this is intentional.
              </AlertDescription>
            </Alert>
          )}

          {/* Client Search */}
          <div>
            <Label htmlFor="client-search" className="mb-2">
              {activeTab === 'linked' ? 'Select Linked Account' : 'Select Any Client'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="client-search"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2">
              <button
                onClick={() => setClientTypeFilter('all')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  clientTypeFilter === 'all'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                All
              </button>
              <button
                onClick={() => setClientTypeFilter('Individual')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  clientTypeFilter === 'Individual'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <User className="w-3 h-3" />
                Individual
              </button>
              <button
                onClick={() => setClientTypeFilter('Business')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  clientTypeFilter === 'Business'
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Building2 className="w-3 h-3" />
                Business
              </button>
            </div>

          {/* Client List */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-80 w-full">
              <div className="space-y-4 pr-4">
                {activeTab === 'linked' && linkedAccounts.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      No linked accounts for {document.clientName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Switch to "All Clients" tab to select a different client
                    </p>
                  </div>
                )}

                {/* Client List - Unified */}
                {filteredClients.length > 0 && (
                  <div className="space-y-1">
                    {filteredClients.map((client) => {
                      const isClientLinked = currentClient?.linkedAccounts?.includes(client.id);
                      return (
                        <button
                          key={client.id}
                          onClick={() => setSelectedClientId(client.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-2 transition-all",
                            selectedClientId === client.id
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                              : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {client.type === 'Business' ? (
                                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <User className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              )}
                              <span className="font-medium text-gray-900 dark:text-white truncate">{client.name}</span>
                              {activeTab === 'linked' && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                                  Linked Account
                                </Badge>
                              )}
                              {activeTab === 'all' && !isClientLinked && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400">
                                  Not Linked
                                </Badge>
                              )}
                            </div>
                            {selectedClientId === client.id && (
                              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {client.documentCount} documents
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* No results */}
                {filteredClients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery ? `No clients found matching "${searchQuery}"` : activeTab === 'linked' ? 'No linked accounts available' : 'No other clients available'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Confirmation Section - Above buttons */}
          {shouldShowConfirmation && isUnlinked && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Confirm Move to Unlinked Client
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>{selectedClient?.name}</strong> is not linked to <strong>{document.clientName}</strong>.
                    This action will move the document to an unlinked account.
                  </p>
                  <div className="mt-3">
                    <Label className="text-xs text-red-800 dark:text-red-200">
                      Type "MOVE" to confirm:
                    </Label>
                    <Input
                      value={unlinkedConfirmationText}
                      onChange={(e) => setUnlinkedConfirmationText(e.target.value)}
                      className="mt-1 border-red-300 focus:border-red-500 dark:border-red-700 dark:focus:border-red-500"
                      placeholder="Type MOVE"
                    />
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation for Linked Account */}
          {shouldShowConfirmation && !isUnlinked && (
            <div>
              <Label htmlFor="confirmation" className="text-sm">
                Type <strong className="text-red-600">MOVE</strong> to confirm
              </Label>
              <Input
                id="confirmation"
                placeholder="Type MOVE to confirm"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={cn(
              "btn-primary gap-2",
              needsUnlinkedConfirmation && "bg-red-600 hover:bg-red-700"
            )}
            onClick={handleMove}
            disabled={
              !selectedClientId || 
              (!isUnlinked && confirmationText.toLowerCase() !== 'move') ||
              (isUnlinked && unlinkedConfirmationText !== 'MOVE')
            }
          >
            <MoveRight className="w-4 h-4" />
            {needsUnlinkedConfirmation ? 'Confirm Move to Unlinked Client' : 'Move Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
