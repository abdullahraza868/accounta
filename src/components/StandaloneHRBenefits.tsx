import { MyHRBenefits } from "./MyHRBenefits";
import { WorkflowProvider } from "./WorkflowContext";

/**
 * StandaloneHRBenefits - A self-contained component for the HR & Benefits section
 *
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps the MyHRBenefits with required providers.
 *
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the MyHRBenefits component
 * 3. Copy all UI components from /components/ui folder:
 *    - badge.tsx
 *    - progress.tsx
 *    - utils.ts (if needed for cn utility)
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneHRBenefits />
 *
 * Features:
 * - PTO (Paid Time Off) tracking with accrual rates
 * - Sick Leave tracking with state compliance
 * - Overtime tracking and monitoring
 * - Configurable through firmSettings in WorkflowContext
 */

interface StandaloneHRBenefitsProps {
  /** Optional callback when user data changes */
  onDataChange?: (data: any) => void;
}

export function StandaloneHRBenefits({
  onDataChange,
}: StandaloneHRBenefitsProps) {
  return (
    <WorkflowProvider>
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-gray-900">
        {/* HR Benefits Content */}
        <MyHRBenefits />
      </div>
    </WorkflowProvider>
  );
}