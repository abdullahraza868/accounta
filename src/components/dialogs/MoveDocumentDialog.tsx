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
import { MoveRight, AlertTriangle, User, Building2, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  if (!document) return null;

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const requiresConfirmation = selectedClient?.type !== document.clientType;

  // Filter and group clients
  const filteredClients = clients
    .filter(c => c.id !== document.clientId) // Exclude current client
    .filter(c => 
      searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const businessClients = filteredClients.filter(c => c.type === 'Business').sort((a, b) => a.name.localeCompare(b.name));
  const individualClients = filteredClients.filter(c => c.type === 'Individual').sort((a, b) => a.name.localeCompare(b.name));

  const handleMove = () => {
    if (!selectedClientId) {
      toast.error('Please select a client to move the document to');
      return;
    }

    if (requiresConfirmation && confirmationText.toLowerCase() !== 'move') {
      toast.error('Please type "MOVE" to confirm');
      return;
    }

    onMove(document.id, selectedClientId);
    
    // Reset and close
    setSelectedClientId('');
    setSearchQuery('');
    setConfirmationText('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          {requiresConfirmation && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> You're moving a document from a {document.clientType} to a {selectedClient?.type}. 
                This is unusual and should be done carefully.
              </AlertDescription>
            </Alert>
          )}

          {/* Client Search */}
          <div>
            <Label htmlFor="client-search" className="mb-2">Select Destination Client</Label>
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

          {/* Client List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {/* Business Clients */}
                {businessClients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      Business ({businessClients.length})
                    </h4>
                    <div className="space-y-1">
                      {businessClients.map((client) => (
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
                            <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                            {selectedClientId === client.id && (
                              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Clients */}
                {individualClients.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Individual ({individualClients.length})
                    </h4>
                    <div className="space-y-1">
                      {individualClients.map((client) => (
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
                            <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                            {selectedClientId === client.id && (
                              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
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
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {businessClients.length === 0 && individualClients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No clients found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Confirmation Input */}
          {requiresConfirmation && selectedClientId && (
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
            className="btn-primary gap-2"
            onClick={handleMove}
            disabled={
              !selectedClientId || 
              (requiresConfirmation && confirmationText.toLowerCase() !== 'move')
            }
          >
            <MoveRight className="w-4 h-4" />
            Move Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
