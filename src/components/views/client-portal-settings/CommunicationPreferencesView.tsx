import { MessageSquare } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function CommunicationPreferencesView() {
  return (
    <PlaceholderSettingsView
      title="Communication Preferences"
      description="Configure reminder management, notification preferences, and communication settings"
      icon={MessageSquare}
      gradient="from-blue-500 to-blue-600"
    />
  );
}
