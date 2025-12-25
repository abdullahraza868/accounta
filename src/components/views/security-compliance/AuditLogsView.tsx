import { FileText } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function AuditLogsView() {
  return (
    <PlaceholderSettingsView
      title="Audit Logs"
      description="View and search system audit logs and user activity history"
      icon={FileText}
      gradient="from-orange-500 to-red-600"
    />
  );
}
