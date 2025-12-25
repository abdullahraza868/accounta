import { useState } from 'react';
import { UtilizationAnalytics } from './UtilizationAnalytics';
import { WorkflowProvider } from './WorkflowContext';
import { TooltipProvider } from './ui/tooltip';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * StandaloneUtilizationAnalytics - A self-contained component for the Utilization & Analytics section
 * 
 * This component can be exported and imported into other Figma Make projects.
 * It includes all necessary state management and wraps UtilizationAnalytics with required providers.
 * 
 * Usage:
 * 1. Copy this file to your new project's /components folder
 * 2. Copy the UtilizationAnalytics component and its dependencies:
 *    - TimeTrackingFilterPanel.tsx
 *    - UserTimeDetailView.tsx
 * 3. Copy all UI components from /components/ui folder:
 *    - button.tsx, card.tsx, input.tsx, select.tsx, badge.tsx
 *    - switch.tsx, label.tsx, scroll-area.tsx, tooltip.tsx, checkbox.tsx
 * 4. Copy WorkflowContext.tsx
 * 5. Import and use: <StandaloneUtilizationAnalytics />
 * 
 * Features:
 * - Team utilization tracking (billable vs available hours)
 * - Productivity metrics and profitability per user
 * - Advanced filtering by user, client, project, role
 * - Date range selection (today, week, month, year, custom)
 * - Export capabilities
 * - Overtime tracking and cost analysis
 * - Group by user, team, client, or project
 */

interface StandaloneUtilizationAnalyticsProps {
  /** Optional initial user to filter/focus on */
  initialUserName?: string | null;
  /** Optional initial week start date for filtering */
  initialWeekStart?: Date | null;
  /** Show back button to navigate away */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onNavigateBack?: () => void;
  /** Optional callback when data is filtered/changed */
  onDataChange?: (data: any) => void;
}

export function StandaloneUtilizationAnalytics({
  initialUserName,
  initialWeekStart,
  showBackButton = true,
  onNavigateBack,
  onDataChange
}: StandaloneUtilizationAnalyticsProps) {
  const [userFilter, setUserFilter] = useState<string | null>(initialUserName || null);
  const [weekStart, setWeekStart] = useState<Date | null>(initialWeekStart || null);

  const handleNavigateBack = () => {
    // Clear filters when navigating back
    setUserFilter(null);
    setWeekStart(null);
    
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <WorkflowProvider>
      <TooltipProvider>
        <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
          <UtilizationAnalytics 
            initialUserName={userFilter}
            initialWeekStart={weekStart}
            onNavigateBack={handleNavigateBack}
          />
        </div>
      </TooltipProvider>
    </WorkflowProvider>
  );
}