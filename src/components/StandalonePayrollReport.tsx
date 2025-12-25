import { useState } from 'react';
import { PayrollReport } from './PayrollReport';
import { WorkflowProvider } from './WorkflowContext';
import { TooltipProvider } from './ui/tooltip';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * StandalonePayrollReport - A self-contained component for the Payroll Report section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps PayrollReport with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the PayrollReport component
 * 3. Copy all UI components from /components/ui folder:
 *    - card.tsx, button.tsx, select.tsx, badge.tsx, scroll-area.tsx
 *    - input.tsx, tooltip.tsx, checkbox.tsx
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandalonePayrollReport />
 * 
 * Features:
 * - Payroll calculations with regular pay, overtime, PTO, sick pay
 * - Weekly, bi-weekly, and monthly payroll periods
 * - Automatic lunch deductions
 * - Holiday pay tracking
 * - Approval and locking workflow
 * - Client-based hour breakdown
 * - Export capabilities for payroll processing
 * - Sick leave accrual tracking
 */

interface StandalonePayrollReportProps {
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional callback when navigating to team metrics/utilization */
  onNavigateToTeamMetrics?: (userName: string, weekStart: Date) => void;
  /** Optional callback when payroll is approved */
  onPayrollApproved?: (data: any) => void;
  /** Optional callback when payroll data changes */
  onDataChange?: (data: any) => void;
}

export function StandalonePayrollReport({
  showBackButton = true,
  onNavigateBack,
  onNavigateToTeamMetrics,
  onPayrollApproved,
  onDataChange
}: StandalonePayrollReportProps) {
  const handleNavigateToMetrics = (userName: string, weekStart: Date) => {
    if (onNavigateToTeamMetrics) {
      onNavigateToTeamMetrics(userName, weekStart);
    } else {
      console.log('Navigate to team metrics for:', userName, weekStart);
    }
  };

  return (
    <WorkflowProvider>
      <TooltipProvider>
        <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
          <PayrollReport 
            onNavigateToTeamMetrics={handleNavigateToMetrics}
          />
        </div>
      </TooltipProvider>
    </WorkflowProvider>
  );
}