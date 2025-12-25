import { MyAnalytics } from "./MyAnalytics";
import { WorkflowProvider } from "./WorkflowContext";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * StandaloneMyAnalytics - A self-contained component for the My Time Analytics section
 *
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps MyAnalytics with required providers.
 *
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the MyAnalytics component
 * 3. Copy all UI components from /components/ui folder:
 *    - button.tsx, badge.tsx, input.tsx, select.tsx
 *    - utils.ts (for cn function)
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneMyAnalytics />
 *
 * Features:
 * - Weekly time analytics with navigation
 * - Time entry breakdown (billable vs. non-billable)
 * - Utilization percentage calculation
 * - Revenue tracking per time entry
 * - Effective hourly rate calculation
 * - Edit time entries (permission-based)
 * - Project and client tracking
 * - Approval status indicators
 * - Weekly summary statistics
 */

interface StandaloneMyAnalyticsProps {
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional initial week start date */
  initialWeekStart?: Date;
  /** Optional callback when time entry is edited */
  onTimeEntryEdit?: (entryId: string, newData: any) => void;
  /** Optional callback when week changes */
  onWeekChange?: (weekStart: Date) => void;
  /** Optional initial user name to show */
  userName?: string;
}

function MyAnalyticsContent({
  showBackButton,
  onNavigateBack,
  initialWeekStart,
  onTimeEntryEdit,
  onWeekChange,
  userName,
}: StandaloneMyAnalyticsProps) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-gray-900">
      {/* Time Analytics Section */}
      <MyAnalytics />
    </div>
  );
}

export function StandaloneMyAnalytics(
  props: StandaloneMyAnalyticsProps,
) {
  return (
    <WorkflowProvider>
      <MyAnalyticsContent {...props} />
    </WorkflowProvider>
  );
}