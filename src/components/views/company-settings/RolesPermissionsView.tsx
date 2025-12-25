import { Shield } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function RolesPermissionsView() {
  return (
    <PlaceholderSettingsView
      title="Roles & Permissions"
      description="Manage user roles, permissions, and access controls for your team"
      icon={Shield}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
