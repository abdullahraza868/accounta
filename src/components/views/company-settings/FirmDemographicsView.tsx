import { Building2 } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function FirmDemographicsView() {
  return (
    <PlaceholderSettingsView
      title="Firm Demographics"
      description="Configure your firm's basic information, address, and contact details"
      icon={Building2}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
