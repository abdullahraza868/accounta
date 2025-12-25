import { ShieldCheck } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function ClientPermissionsView() {
  return (
    <PlaceholderSettingsView
      title="Client Permissions"
      description="Configure what clients can see and do in their portal"
      icon={ShieldCheck}
      gradient="from-blue-500 to-blue-600"
    />
  );
}
