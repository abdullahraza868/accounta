import { Database } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function DataRetentionView() {
  return (
    <PlaceholderSettingsView
      title="Data Retention"
      description="Configure data retention policies and automatic deletion rules"
      icon={Database}
      gradient="from-orange-500 to-red-600"
    />
  );
}
