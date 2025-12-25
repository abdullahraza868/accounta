import { BarChart3 } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function AccessReportsView() {
  return (
    <PlaceholderSettingsView
      title="Access Reports"
      description="Generate and view reports on user access, permissions, and security events"
      icon={BarChart3}
      gradient="from-orange-500 to-red-600"
    />
  );
}
