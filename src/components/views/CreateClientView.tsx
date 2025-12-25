import { CreateClientWizard } from '../CreateClientWizard';
import type { ClientGroup } from '../ClientGroupsDialog';

// Default client groups - in production this would come from API/context
const DEFAULT_CLIENT_GROUPS: ClientGroup[] = [
  { id: 'lead', name: 'Lead', color: '#ef4444', clientCount: 0 },
  { id: 'active', name: 'Active', color: '#22c55e', clientCount: 0 },
  { id: 'inactive', name: 'Inactive', color: '#f97316', clientCount: 0 },
  { id: 'prospect', name: 'Prospect', color: '#3b82f6', clientCount: 0 },
];

export function CreateClientView() {
  return (
    <CreateClientWizard 
      asPage={true} 
      clientGroups={DEFAULT_CLIENT_GROUPS} 
    />
  );
}
