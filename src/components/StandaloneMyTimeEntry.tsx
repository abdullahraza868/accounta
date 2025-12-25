import { MyTimeEntry } from "./MyTimeEntry";
import { WorkflowProvider } from "./WorkflowContext";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * StandaloneMyTimeEntry - A self-contained component for the Time Entry section
 *
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps MyTimeEntry with required providers.
 *
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the MyTimeEntry component
 * 3. Copy all UI components from /components/ui folder:
 *    - button.tsx, badge.tsx, input.tsx, label.tsx, select.tsx
 *    - separator.tsx, utils.ts (for cn function)
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneMyTimeEntry />
 *
 * Features:
 * - Real-time clock in/out tracking
 * - Break time management (start/end breaks)
 * - Manual time entry with approval workflow
 * - Multiple time entry methods (clock-in-out, manual, hybrid)
 * - Edit permissions (free-edit, requires-approval, locked)
 * - Automatic break deductions
 * - Daily and weekly time summaries
 * - Project/task assignment for time entries
 */

interface StandaloneMyTimeEntryProps {
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional callback when user clocks in */
  onClockIn?: (timestamp: Date) => void;
  /** Optional callback when user clocks out */
  onClockOut?: (
    clockInTime: Date,
    clockOutTime: Date,
    breakMinutes: number,
  ) => void;
  /** Optional callback when break starts */
  onBreakStart?: (timestamp: Date) => void;
  /** Optional callback when break ends */
  onBreakEnd?: (breakDuration: number) => void;
  /** Optional callback when manual time entry is added */
  onManualEntry?: (entry: any) => void;
  /** Optional initial user name to show */
  userName?: string;
}

function MyTimeEntryContent({
  showBackButton,
  onNavigateBack,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  onManualEntry,
  userName,
}: StandaloneMyTimeEntryProps) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-gray-900">
      {/* Time Entry Section */}
      <MyTimeEntry />
    </div>
  );
}

export function StandaloneMyTimeEntry(
  props: StandaloneMyTimeEntryProps,
) {
  return (
    <WorkflowProvider>
      <MyTimeEntryContent {...props} />
    </WorkflowProvider>
  );
}