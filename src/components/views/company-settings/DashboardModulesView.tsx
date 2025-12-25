import { LayoutGrid } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function DashboardModulesView() {
  return (
    <PlaceholderSettingsView
      title="Dashboard Modules"
      description="Customize dashboard views and widgets for you and your team"
      icon={LayoutGrid}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
