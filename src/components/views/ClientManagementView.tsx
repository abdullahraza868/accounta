import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client, FolderTab } from '../../App';
import { ClientList } from '../ClientList';
import { ClientFolder } from '../ClientFolder';
import { FilterPanel } from '../FilterPanel';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../ui/sheet';

type ViewType = 'card' | 'list' | 'table';
type CommunicationSubTab = 'internal' | 'external' | 'texting' | 'email' | 'callback-history';

export function ClientManagementView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<FolderTab>('Snapshot');
  const [communicationSubTab, setCommunicationSubTab] = useState<CommunicationSubTab>('internal');
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('table');
  const [isMobile, setIsMobile] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [clients, setClients] = useState<Client[]>([
    { 
      id: '1', 
      name: 'Troy Business Services LLC', 
      firstName: 'Gokhan', 
      lastName: 'Cilek', 
      email: 'troy@biz.com', 
      phone: '+12104452301', 
      type: 'Business', 
      group: 'Trial',
      assignedTo: 'Sarah Johnson',
      tags: ['Trial', 'Tax 2024'],
      createdDate: '2024-01-15T10:30:00Z'
    },
    { 
      id: '2', 
      name: 'Abacus 360', 
      firstName: 'Jagruti', 
      lastName: 'Chico', 
      email: 'info@abacus.com', 
      phone: '+15551234567', 
      type: 'Business', 
      group: 'Premium',
      assignedTo: 'Mike Brown',
      tags: ['Premium', 'Quarterly Review'],
      createdDate: '2023-11-20T14:15:00Z'
    },
    { 
      id: '3', 
      name: 'Best Face Forward', 
      firstName: 'Jamal', 
      lastName: 'Clark', 
      email: 'info@bestface.com', 
      phone: '+13108887234', 
      type: 'Business', 
      group: 'Fit-St Premium',
      assignedTo: 'Sarah Johnson',
      tags: ['Fit-St Premium'],
      createdDate: '2024-03-10T09:00:00Z'
    },
    { 
      id: '4', 
      name: 'Cleveland Business Services, LLC', 
      firstName: 'James', 
      lastName: 'Cole', 
      email: 'james@cbsllc.co', 
      phone: '+11234328234', 
      type: 'Business', 
      group: 'Fit-St Premium',
      assignedTo: 'Sarah Johnson',
      tags: ['Fit-St Premium', 'VIP', 'Tax Services'],
      createdDate: '2023-09-05T11:20:00Z'
    },
    { 
      id: '5', 
      name: 'Count on Cooley Bookkeeping', 
      firstName: 'Robyn', 
      lastName: 'Cooley', 
      email: 'info@countoncooley.com', 
      phone: '+15550816478', 
      type: 'Business', 
      group: 'FreeTrial',
      assignedTo: 'Emily Davis',
      tags: ['FreeTrial', 'Bookkeeping'],
      createdDate: '2024-10-18T16:45:00Z'
    },
    { 
      id: '6', 
      name: 'TNT Accounting Services, LLC', 
      firstName: 'Travonta', 
      lastName: 'Connor', 
      email: 'tconnor@tntaccounting.net', 
      phone: '+18477265663', 
      type: 'Business', 
      group: 'FreeTrial',
      assignedTo: 'Sarah Johnson',
      tags: ['FreeTrial', 'Onboarding'],
      createdDate: '2024-10-22T13:30:00Z'
    },
    { 
      id: '7', 
      name: 'Trevor Barker', 
      firstName: 'Trevor', 
      lastName: 'Barker', 
      email: 'trevor@tbarker.com', 
      phone: '+14443775432', 
      type: 'Individual', 
      group: 'FreeTrial',
      assignedTo: 'Emily Davis',
      tags: ['Individual', 'New'],
      createdDate: '2024-10-20T10:00:00Z'
    },
    { 
      id: '8', 
      name: 'Amanda Richardson', 
      firstName: 'Amanda', 
      lastName: 'Richardson', 
      email: 'amanda.r@email.com', 
      phone: '+15559876543', 
      type: 'Individual', 
      group: 'Premium',
      assignedTo: 'Mike Brown',
      tags: ['Individual', 'Tax Planning'],
      createdDate: '2024-02-14T08:30:00Z'
    },
    { 
      id: '9', 
      name: 'Michael Torres', 
      firstName: 'Michael', 
      lastName: 'Torres', 
      email: 'mtorres@email.com', 
      phone: '+15552345678', 
      type: 'Individual', 
      group: 'Trial',
      assignedTo: 'Sarah Johnson',
      tags: ['Individual', 'Trial'],
      createdDate: '2024-09-12T15:20:00Z'
    },
    { 
      id: '10', 
      name: 'Jennifer Lee', 
      firstName: 'Jennifer', 
      lastName: 'Lee', 
      email: 'jlee@email.com', 
      phone: '+15553456789', 
      type: 'Individual', 
      group: 'Premium',
      assignedTo: 'Emily Davis',
      tags: ['Individual', 'Premium'],
      createdDate: '2024-07-08T12:00:00Z'
    },
  ]);

  // Handle clientId from URL parameter - open folder immediately at top
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const clientId = urlParams.get('clientId');
    
    console.log('🔍 ClientManagementView - URL Effect:', { 
      clientId, 
      clientsLength: clients.length,
      currentViewType: viewType,
      selectedClientId: selectedClient?.id 
    });
    
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      console.log('📂 Found client:', client?.name);
      
      if (client) {
        // Batch all state updates together
        setShowFilters(false);
        setViewType('card'); // Always use card view for consistency
        setSelectedClient(client);
        
        console.log('✅ State updated - client folder should open');
        
        // Clear URL parameter
        navigate('/clients', { replace: true });
        
        // Force scroll to top after state settles
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log('📜 Scrolling to top');
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        });
      } else {
        console.log('❌ Client not found with id:', clientId);
      }
    }
  }, [location.search, clients, navigate]);

  const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId ? { ...client, ...updates } : client
      )
    );
    
    if (selectedClient?.id === clientId) {
      setSelectedClient(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <>
      <div className="h-full flex overflow-hidden gap-2 md:gap-3 p-2 md:p-3">
        {/* Client List - Fixed/Flexible width based on view */}
        <div className={viewType === 'table' ? 'flex-1 min-w-0' : 'flex-shrink-0'}>
          <ClientList 
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={(client) => {
              setSelectedClient(client);
              setShowFilters(false);
            }}
            activeTab={activeTab}
            communicationSubTab={communicationSubTab}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            viewType={viewType}
            onViewTypeChange={setViewType}
            onUpdateClient={handleUpdateClient}
          />
        </div>
        
        {/* Right Panel - Flexible width with constraints */}
        {(showFilters || (viewType !== 'table' && selectedClient)) && (
          <div className="hidden md:block flex-1 min-w-0 max-w-[480px] lg:max-w-[600px] xl:max-w-none">
            {showFilters ? (
              <FilterPanel onClose={() => setShowFilters(false)} />
            ) : (
              <ClientFolder 
                client={selectedClient!}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                communicationSubTab={communicationSubTab}
                onCommunicationSubTabChange={setCommunicationSubTab}
              />
            )}
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={(open) => !open && setShowFilters(false)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 md:hidden">
          <SheetTitle className="sr-only">Filter Clients</SheetTitle>
          <SheetDescription className="sr-only">
            Filter and sort your client list by various criteria
          </SheetDescription>
          <FilterPanel onClose={() => setShowFilters(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile Client Details Sheet */}
      <Sheet open={isMobile && !!selectedClient && !showFilters} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetTitle className="sr-only">
            {selectedClient ? selectedClient.name : 'Client Details'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            View and manage client information, files, and communications
          </SheetDescription>
          {selectedClient && (
            <ClientFolder 
              client={selectedClient}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              communicationSubTab={communicationSubTab}
              onCommunicationSubTabChange={setCommunicationSubTab}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}