import { Shield } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function AuthSecurityView() {
  return (
    <PlaceholderSettingsView
      title="Authentication & Security"
      description="Configure multi-factor authentication, password policies, and security settings"
      icon={Shield}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
