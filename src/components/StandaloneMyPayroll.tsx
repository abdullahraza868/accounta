import { MyPayroll } from './MyPayroll';
import { WorkflowProvider } from './WorkflowContext';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * StandaloneMyPayroll - A self-contained component for the My Payroll section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps MyPayroll with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the MyPayroll component
 * 3. Copy all UI components from /components/ui folder:
 *    - button.tsx, badge.tsx, select.tsx, separator.tsx
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneMyPayroll />
 * 
 * Features:
 * - View current and historical pay periods
 * - Pay period navigation (previous/next)
 * - Hours breakdown (regular, overtime, PTO, sick leave)
 * - Pay breakdown (regular pay, overtime pay, PTO pay, sick pay)
 * - Automatic lunch deductions
 * - Gross and net pay calculations
 * - Pay date information
 * - Status indicators (current, processing, paid)
 * - Download pay stubs
 * - Year-to-date (YTD) totals
 */

interface StandaloneMyPayrollProps {
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional callback when pay period changes */
  onPeriodChange?: (periodId: string, period: any) => void;
  /** Optional callback when pay stub is downloaded */
  onDownloadPayStub?: (periodId: string) => void;
  /** Optional initial pay period to display */
  initialPeriodId?: string;
  /** Optional user name to show */
  userName?: string;
}

function MyPayrollContent({ 
  showBackButton, 
  onNavigateBack,
  onPeriodChange,
  onDownloadPayStub,
  initialPeriodId,
  userName 
}: StandaloneMyPayrollProps) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-gray-900">
        {/* My Payroll Section */}
        <MyPayroll />
    </div>
  );
}

export function StandaloneMyPayroll(props: StandaloneMyPayrollProps) {
  return (
    <WorkflowProvider>
      <MyPayrollContent {...props} />
    </WorkflowProvider>
  );
}