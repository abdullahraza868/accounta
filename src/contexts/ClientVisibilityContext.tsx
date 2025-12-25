import { createContext, useContext, useState, ReactNode } from 'react';

// Visibility settings for Individual clients
export interface IndividualCardVisibility {
  demographics: boolean; // Always true
  drivingLicense: boolean;
  ssn: boolean;
  bankAccount: boolean;
  dependents: boolean;
  otherContacts: boolean;
  services: boolean;
}

// Visibility settings for Business clients
export interface BusinessCardVisibility {
  demographics: boolean; // Always true
  ein: boolean;
  businessBankAccount: boolean;
  withholdings: boolean;
  licenses: boolean;
  salesTaxAccounts: boolean;
  businessOtherContacts: boolean;
  businessServices: boolean;
}

interface ClientVisibilityContextType {
  individualCardVisibility: IndividualCardVisibility;
  businessCardVisibility: BusinessCardVisibility;
  setIndividualCardVisibility: (visibility: IndividualCardVisibility) => void;
  setBusinessCardVisibility: (visibility: BusinessCardVisibility) => void;
}

const ClientVisibilityContext = createContext<ClientVisibilityContextType | undefined>(undefined);

export function ClientVisibilityProvider({ children }: { children: ReactNode }) {
  // Default visibility settings - all enabled by default
  const [individualCardVisibility, setIndividualCardVisibility] = useState<IndividualCardVisibility>({
    demographics: true, // Always visible
    drivingLicense: true,
    ssn: true,
    bankAccount: true,
    dependents: true,
    otherContacts: true,
    services: true,
  });

  const [businessCardVisibility, setBusinessCardVisibility] = useState<BusinessCardVisibility>({
    demographics: true, // Always visible
    ein: true,
    businessBankAccount: true,
    withholdings: true,
    licenses: true,
    salesTaxAccounts: true,
    businessOtherContacts: true,
    businessServices: true,
  });

  return (
    <ClientVisibilityContext.Provider
      value={{
        individualCardVisibility,
        businessCardVisibility,
        setIndividualCardVisibility,
        setBusinessCardVisibility,
      }}
    >
      {children}
    </ClientVisibilityContext.Provider>
  );
}

export function useClientVisibility() {
  const context = useContext(ClientVisibilityContext);
  if (context === undefined) {
    throw new Error('useClientVisibility must be used within a ClientVisibilityProvider');
  }
  return context;
}
