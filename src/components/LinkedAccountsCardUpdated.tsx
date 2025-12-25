import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Link, Plus, X, ChevronUp, Building2, Search, User, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type LinkedAccountsCardProps = {
  clientType: string;
  spouseAccount: { id: string; name: string } | null;
  linkedBusinessAccounts: { id: string; name: string }[];
};

export function LinkedAccountsCard({ 
  clientType, 
  spouseAccount, 
  linkedBusinessAccounts 
}: LinkedAccountsCardProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'Individual' | 'Business'>('all');
  const [localSpouseAccount, setLocalSpouseAccount] = useState(spouseAccount);
  const [localBusinessAccounts, setLocalBusinessAccounts] = useState(linkedBusinessAccounts);

  // Mock data - all accounts in the system
  const allAccounts = [
    { id: 'IND-001', name: 'John Smith', type: 'Individual' as const },
    { id: 'IND-002', name: 'Jane Doe', type: 'Individual' as const },
    { id: 'IND-003', name: 'Robert Johnson', type: 'Individual' as const },
    { id: 'IND-004', name: 'Sarah Williams', type: 'Individual' as const },
    { id: 'BUS-001', name: 'Acme Corporation Inc.', type: 'Business' as const },
    { id: 'BUS-002', name: 'Tech Solutions LLC', type: 'Business' as const },
    { id: 'BUS-003', name: 'Global Enterprises', type: 'Business' as const },
    { id: 'BUS-004', name: 'Innovate Industries', type: 'Business' as const },
    { id: 'BUS-005', name: 'Prime Partners LLP', type: 'Business' as const },
  ];

  // Calculate counts for filter pills
  const getAvailableAccounts = (filter: 'all' | 'Individual' | 'Business') => {
    return allAccounts.filter(account => {
      const typeMatch = filter === 'all' || account.type === filter;
      const notLinked = clientType === 'Individual'
        ? !localSpouseAccount || account.id !== localSpouseAccount.id
        : !localBusinessAccounts.find(a => a.id === account.id);
      return typeMatch && notLinked;
    });
  };

  const allCount = getAvailableAccounts('all').length;
  const individualCount = getAvailableAccounts('Individual').length;
  const businessCount = getAvailableAccounts('Business').length;

  const hasLinkedAccounts = clientType === 'Individual' 
    ? localSpouseAccount !== null 
    : localBusinessAccounts.length > 0;

  const handleNavigate = (clientId: string) => {
    toast.info('Navigation', {
      description: `Navigating to client ${clientId}...`
    });
  };

  const handleAddAccount = (account: typeof allAccounts[0]) => {
    if (clientType === 'Individual') {
      setLocalSpouseAccount({ id: account.id, name: account.name });
      toast.success('Linked Account Added', {
        description: `${account.name} has been linked as spouse account.`
      });
    } else {
      if (!localBusinessAccounts.find(a => a.id === account.id)) {
        setLocalBusinessAccounts([...localBusinessAccounts, { id: account.id, name: account.name }]);
        toast.success('Linked Account Added', {
          description: `${account.name} has been linked.`
        });
      }
    }
    setShowAddDialog(false);
    setSearchQuery('');
    setAccountTypeFilter('all');
  };

  const handleRemoveAccount = (accountId: string) => {
    if (clientType === 'Individual') {
      setLocalSpouseAccount(null);
      toast.success('Linked Account Removed', {
        description: 'Spouse account has been unlinked.'
      });
    } else {
      setLocalBusinessAccounts(localBusinessAccounts.filter(a => a.id !== accountId));
      toast.success('Linked Account Removed', {
        description: 'Business account has been unlinked.'
      });
    }
  };

  // Filter accounts based on type filter and search query
  const availableAccounts = allAccounts.filter(account => {
    // Type filter from pills
    const typeMatch = accountTypeFilter === 'all' || account.type === accountTypeFilter;
    
    // Don't show accounts that are already linked
    const notLinked = clientType === 'Individual'
      ? !localSpouseAccount || account.id !== localSpouseAccount.id
      : !localBusinessAccounts.find(a => a.id === account.id);
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.id.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && notLinked && searchMatch;
  });

  return (
    <>
      <Card className="border-gray-200/60 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Link className="w-4 h-4 text-purple-600" />
              Linked Accounts
            </CardTitle>
            <div className="flex items-center gap-2">
              {clientType === 'Business' && localBusinessAccounts.length > 0 && (
                <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {localBusinessAccounts.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="h-7 px-2 text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!hasLinkedAccounts ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Link className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>No linked accounts</div>
              <div className="text-xs mt-1">
                {clientType === 'Individual' 
                  ? 'Link spouse account to connect related information'
                  : 'Link business accounts to connect related entities'}
              </div>
            </div>
          ) : (
            <>
              {clientType === 'Individual' && localSpouseAccount ? (
                <div className="relative group">
                  <div 
                    onClick={() => handleNavigate(localSpouseAccount.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">
                          {localSpouseAccount.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{localSpouseAccount.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Spouse Account</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAccount(localSpouseAccount.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 transition-opacity flex items-center gap-1 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Unlink</span>
                      </button>
                      <div className="text-purple-600">
                        <ChevronUp className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {localBusinessAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="relative group"
                    >
                      <div
                        onClick={() => handleNavigate(account.id)}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{account.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{account.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAccount(account.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 transition-opacity flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Unlink</span>
                          </button>
                          <div className="text-purple-600">
                            <ChevronUp className="w-4 h-4 rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Linked Account Dialog */}
      {showAddDialog && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" aria-describedby="add-linked-account-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-600" />
                Add Linked Account
              </DialogTitle>
              <DialogDescription id="add-linked-account-description">
                Search and select accounts to link to this client
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Client Type Filter Pills */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAccountTypeFilter('all')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'all'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  All ({allCount})
                </button>
                <button
                  onClick={() => setAccountTypeFilter('Individual')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'Individual'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Individual ({individualCount})
                </button>
                <button
                  onClick={() => setAccountTypeFilter('Business')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    accountTypeFilter === 'Business'
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Business ({businessCount})
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

              {/* Account List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {availableAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div>No accounts found</div>
                    <div className="text-xs mt-1">Try adjusting your search or filters</div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {availableAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleAddAccount(account)}
                        className="flex items-center justify-between p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {account.type === 'Individual' ? (
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                {account.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{account.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{account.id}</span>
                              <span>•</span>
                              <span>{account.type}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Link Account
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}