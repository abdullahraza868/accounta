import { Calendar } from 'lucide-react';
import { PlaceholderSettingsView } from '../PlaceholderSettingsView';

export function CalendarSettingsView() {
  return (
    <PlaceholderSettingsView
      title="Calendar Settings"
      description="Configure firm-level calendar preferences, working hours, and time zones"
      icon={Calendar}
      gradient="from-purple-500 to-purple-600"
    />
  );
}
