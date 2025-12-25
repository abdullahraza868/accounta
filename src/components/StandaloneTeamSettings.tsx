import { TeamSettings } from './TeamSettings';
import { WorkflowProvider, useWorkflowContext } from './WorkflowContext';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * StandaloneTeamSettings - A self-contained component for the Team Settings section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps TeamSettings with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the TeamSettings component
 * 3. Copy all UI components from /components/ui folder (this uses many standard UI components)
 * 4. Copy WorkflowContext.tsx (includes UserProfile and FirmSettings types)
 * 5. Import and use: <StandaloneTeamSettings />
 * 
 * Features:
 * - Team member management (add, edit, delete)
 * - User profiles with rates (hourly, billable, overtime)
 * - Employment types (hourly, salaried, contractor)
 * - PTO and sick leave policies per user
 * - Firm-wide settings configuration
 * - Time entry methods and permissions
 * - Overtime policies and thresholds
 * - Lunch break deductions
 * - Holiday calendars
 */

interface StandaloneTeamSettingsProps {
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional callback when team member is added/updated */
  onMemberChange?: (profiles: any[]) => void;
  /** Optional callback when firm settings are updated */
  onSettingsChange?: (settings: any) => void;
}

function TeamSettingsContent({ 
  showBackButton, 
  onNavigateBack,
  onMemberChange,
  onSettingsChange
}: StandaloneTeamSettingsProps) {
  const { userProfiles, updateUserProfiles, firmSettings, updateFirmSettings } = useWorkflowContext();

  const handleUpdateProfiles = (profiles: any[]) => {
    updateUserProfiles(profiles);
    if (onMemberChange) {
      onMemberChange(profiles);
    }
  };

  const handleUpdateFirmSettings = (settings: any) => {
    updateFirmSettings(settings);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
        {/* Team Settings Section */}
        <TeamSettings 
          userProfiles={userProfiles}
          onUpdateProfiles={handleUpdateProfiles}
          firmSettings={firmSettings}
          onUpdateFirmSettings={handleUpdateFirmSettings}
        />
      </div>
    </div>
  );
}

export function StandaloneTeamSettings(props: StandaloneTeamSettingsProps) {
  return (
    <WorkflowProvider>
      <TeamSettingsContent {...props} />
    </WorkflowProvider>
  );
}