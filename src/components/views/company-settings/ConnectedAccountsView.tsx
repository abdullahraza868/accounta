import { Link2 } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function ConnectedAccountsView() {
  return (
    <PlaceholderSettingsView
      title="Connected Accounts"
      description="Manage connected accounts for email sync, calendar integration, and third-party services"
      icon={Link2}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
