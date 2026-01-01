import { Client } from '../App';

export type ClientWizardData = {
  clientType: 'individual' | 'business';
  profilePhoto?: string;
  selectedGroups?: string[];
  clientNumber?: string;
  // Individual fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  dob?: string;
  ssn?: string;
  gender?: string;
  maritalStatus?: string;
  filingStatus?: string;
  profession?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dlNumber?: string;
  dlState?: string;
  dlIssueDate?: string;
  dlExpirationDate?: string;
  // Business fields
  companyName?: string;
  dbaName?: string;
  ein?: string;
  entityType?: string;
  entityNumber?: string;
  stateOfIncorporation?: string;
  incorporationDate?: string;
  businessStartDate?: string;
  ownerName?: string;
  totalEmployees?: string;
  fiscalYearEnd?: string;
  // Financial
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  selectedServices?: string[];
  // Additional
  spouse?: any;
  dependents?: any[];
  additionalContacts?: any[];
  [key: string]: any;
};

/**
 * Convert Client type to wizard form data format
 */
export function clientToWizardData(client: Client): Partial<ClientWizardData> {
  // Map Client type ('Individual' | 'Business') to wizard clientType ('individual' | 'business')
  const clientType = client.type === 'Business' ? 'business' : 'individual';
  
  // Extract name parts for individual clients
  const nameParts = client.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  return {
    clientType,
    clientNumber: client.id,
    // Individual fields
    firstName: client.firstName || firstName,
    lastName: client.lastName || lastName,
    email: client.email,
    phone: client.phone,
    // Map Client type to wizard format
    ...(clientType === 'individual' && {
      // Add individual-specific fields if available
    }),
    ...(clientType === 'business' && {
      companyName: client.name,
      // Add business-specific fields if available
    }),
  };
}

/**
 * Convert wizard data back to Client type format
 */
export function wizardDataToClient(data: ClientWizardData): Partial<Client> {
  // Map wizard clientType ('individual' | 'business') to Client type ('Individual' | 'Business')
  const type = data.clientType === 'business' ? 'Business' : 'Individual';
  
  // Construct name based on client type
  const name = data.clientType === 'business' 
    ? (data.companyName || '')
    : `${data.firstName || ''} ${data.lastName || ''}`.trim();
  
  return {
    type,
    name,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    id: data.clientNumber || '',
    group: data.selectedGroups?.[0] || '',
    tags: data.selectedGroups?.slice(1) || [],
    createdDate: new Date().toISOString(),
    assignedTo: '',
  };
}


