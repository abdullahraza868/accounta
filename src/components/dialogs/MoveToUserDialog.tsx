import { useState, useMemo } from 'react';
import { MoveRight, Users, Building2, User, AlertTriangle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

type ClientSummary = {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  linkedAccounts?: string[];
};

interface MoveToUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentClientId: string;
  currentClientName: string;
  documentCount: number;
  clients: ClientSummary[];
  onConfirm: (targetClientId: string, targetClientName: string) => void;
}

export function MoveToUserDialog({
  open,
  onOpenChange,
  currentClientId,
  currentClientName,
  documentCount,
  clients,
  onConfirm,
}: MoveToUserDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAllClients, setShowAllClients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');

  // Get current client
  const currentClient = clients.find(c => c.id === currentClientId);

  // Get linked accounts
  const linkedAccounts = currentClient?.linkedAccounts
    ? clients.filter(c => currentClient.linkedAccounts?.includes(c.id))
    : [];

  // Get all other clients (excluding current client and linked accounts)
  const allOtherClients = clients.filter(
    c => c.id !== currentClientId && !currentClient?.linkedAccounts?.includes(c.id)
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Filter other clients based on search and type filter
  const otherClients = useMemo(() => {
    let filtered = allOtherClients;
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (clientTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === clientTypeFilter);
    }
    
    return filtered;
  }, [allOtherClients, searchQuery, clientTypeFilter]);

  const handleConfirm = () => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    const targetClient = clients.find(c => c.id === selectedClientId);
    if (!targetClient) return;

    onConfirm(selectedClientId, targetClient.name);
    onOpenChange(false);
    setSelectedClientId(null);
    setShowAllClients(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedClientId(null);
      setShowAllClients(false);
      setSearchQuery('');
      setClientTypeFilter('all');
    }
    onOpenChange(open);
  };

  // Count by client type
  const businessCount = allOtherClients.filter(c => c.type === 'Business').length;
  const individualCount = allOtherClients.filter(c => c.type === 'Individual').length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]" aria-describedby="move-to-user-description">
        <DialogHeader>
          <DialogTitle>Move Documents to User</DialogTitle>
          <DialogDescription id="move-to-user-description">
            Moving {documentCount} document{documentCount > 1 ? 's' : ''} from {currentClientName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Linked Accounts Section */}
          {linkedAccounts.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Linked Accounts
              </Label>
              <div className="space-y-2">
                {linkedAccounts.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3",
                      selectedClientId === client.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      selectedClientId === client.id
                        ? "bg-purple-100 dark:bg-purple-900/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      {client.type === 'Business' ? (
                        <Building2 className={cn(
                          "w-5 h-5",
                          selectedClientId === client.id
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-blue-600 dark:text-blue-400"
                        )} />
                      ) : (
                        <User className={cn(
                          "w-5 h-5",
                          selectedClientId === client.id
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-green-600 dark:text-green-400"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-semibold truncate",
                        selectedClientId === client.id
                          ? "text-purple-900 dark:text-purple-100"
                          : "text-gray-900 dark:text-white"
                      )}>
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.type} • Linked Account
                      </p>
                    </div>
                    {selectedClientId === client.id && (
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Separator with Toggle for All Clients */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white dark:bg-gray-900 px-4 flex items-center gap-3">
                <Label htmlFor="show-all" className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
                  Show all clients
                </Label>
                <Switch
                  id="show-all"
                  checked={showAllClients}
                  onCheckedChange={setShowAllClients}
                />
              </div>
            </div>
          </div>

          {/* All Clients Section */}
          {showAllClients && (
            <div>
              <Alert className="mb-3 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                  <strong>Caution:</strong> Moving documents to a non-linked client. Make sure this is intentional.
                </AlertDescription>
              </Alert>
              
              <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                All Other Clients
              </Label>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Client Type Filter Pills */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setClientTypeFilter('all')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    clientTypeFilter === 'all'
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  All
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                    {allOtherClients.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setClientTypeFilter('Business')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    clientTypeFilter === 'Business'
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <Building2 className="w-3 h-3" />
                  Business
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                    {businessCount}
                  </Badge>
                </button>
                <button
                  onClick={() => setClientTypeFilter('Individual')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    clientTypeFilter === 'Individual'
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <User className="w-3 h-3" />
                  Individual
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                    {individualCount}
                  </Badge>
                </button>
              </div>
              
              <ScrollArea className="h-64 border rounded-lg p-2">
                <div className="space-y-2">
                  {otherClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3",
                        selectedClientId === client.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        selectedClientId === client.id
                          ? "bg-purple-100 dark:bg-purple-900/40"
                          : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        {client.type === 'Business' ? (
                          <Building2 className={cn(
                            "w-4 h-4",
                            selectedClientId === client.id
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-blue-600 dark:text-blue-400"
                          )} />
                        ) : (
                          <User className={cn(
                            "w-4 h-4",
                            selectedClientId === client.id
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-green-600 dark:text-green-400"
                          )} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          selectedClientId === client.id
                            ? "text-purple-900 dark:text-purple-100"
                            : "text-gray-900 dark:text-white"
                        )}>
                          {client.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {client.type}
                        </p>
                      </div>
                      {selectedClientId === client.id && (
                        <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* No Linked Accounts Message */}
          {linkedAccounts.length === 0 && !showAllClients && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                No linked accounts for {currentClientName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle "Show all clients" to select a different client
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedClientId}>
            <MoveRight className="w-4 h-4 mr-2" />
            Move {documentCount} Document{documentCount > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
