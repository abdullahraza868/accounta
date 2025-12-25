import { useState, useMemo } from 'react';
import { useWorkflowContext } from './WorkflowContext';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, eachDayOfInterval, isWeekend, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, addDays } from 'date-fns@3.6.0';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { DollarSign, FileDown, Calendar, Clock, Coffee, Umbrella, PartyPopper, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, CheckCircle, Lock, Unlock, Filter, X, Users, HeartPulse, ChevronDown, ChevronUp, Building2, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';
import { Checkbox } from './ui/checkbox';

type ViewMode = 'week' | 'biweekly' | 'month';
type ApprovalStatus = 'draft' | 'approved' | 'locked';

interface PayrollReportProps {
  onNavigateToTeamMetrics?: (userName: string, weekStart: Date) => void;
}

interface ClientHours {
  clientName: string;
  hours: { [userName: string]: number };
  totalHours: number;
  clientType?: 'individual' | 'business';
}

interface PayrollSummary {
  userName: string;
  employmentType: 'hourly' | 'salaried' | 'contractor';
  annualSalary?: number;
  grossHours: number;
  lunchDeduction: number;
  ptoUsed: number;
  sickLeaveUsed: number;
  holidayPay: number;
  netHours: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  ptoPay: number;
  sickPay: number;
  holidayPayAmount: number;
  grossPay: number;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  overtimeEnabled: boolean;
  sickLeaveAccrued: number;
}

export function PayrollReport({ onNavigateToTeamMetrics }: PayrollReportProps) {
  const { projects, timerEntries, userProfiles, tasks, updateUserProfiles, firmSettings } = useWorkflowContext();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [grossHoursExpanded, setGrossHoursExpanded] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('draft');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [editedSickHours, setEditedSickHours] = useState<{ [userName: string]: number }>({});

  // Calculate date range based on view mode and current date
  const dateRangeData = useMemo(() => {
    switch (viewMode) {
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return { start: weekStart, end: weekEnd };
      
      case 'biweekly':
        const biweekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const biweekEnd = addDays(endOfWeek(addWeeks(biweekStart, 1), { weekStartsOn: 1 }), 0);
        return { start: biweekStart, end: biweekEnd };
      
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
    }
  }, [viewMode, currentDate]);

  // Navigation handlers
  const handlePrevious = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'biweekly':
        setCurrentDate(subWeeks(currentDate, 2));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'biweekly':
        setCurrentDate(addWeeks(currentDate, 2));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleFastPrevious = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(subWeeks(currentDate, 4));
        break;
      case 'biweekly':
        setCurrentDate(subWeeks(currentDate, 8));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 6));
        break;
    }
  };

  const handleFastNext = () => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(addWeeks(currentDate, 4));
        break;
      case 'biweekly':
        setCurrentDate(addWeeks(currentDate, 8));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 6));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate working days in period (excluding weekends)
  const workingDays = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRangeData.start, end: dateRangeData.end });
    return days.filter(day => !isWeekend(day)).length;
  }, [dateRangeData]);

  // Calculate client x team member hours matrix
  const clientHoursMatrix = useMemo(() => {
    const matrix: ClientHours[] = [];
    const clientMap = new Map<string, ClientHours>();

    // Filter entries by date range
    const filteredEntries = timerEntries.filter(entry =>
      isWithinInterval(new Date(entry.startTime), { start: dateRangeData.start, end: dateRangeData.end })
    );

    // Build matrix
    filteredEntries.forEach(entry => {
      const project = projects.find(p => p.id === entry.projectId);
      if (!project) return;

      // Find the task from the tasks context (not from project workflow)
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task) return;

      const clientName = project.clientName || 'Unassigned Client';
      const userName = task.assignee || 'Unassigned';

      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          clientName,
          hours: {},
          totalHours: 0
        });
      }

      const clientData = clientMap.get(clientName)!;
      const hours = (entry.duration || 0) / 3600;
      
      clientData.hours[userName] = (clientData.hours[userName] || 0) + hours;
      clientData.totalHours += hours;
    });

    return Array.from(clientMap.values()).sort((a, b) => 
      a.clientName.localeCompare(b.clientName)
    );
  }, [timerEntries, projects, tasks, dateRangeData]);

  // Calculate billable client hours only (for expandable breakdown)
  const billableClientHoursMatrix = useMemo(() => {
    const matrix: ClientHours[] = [];
    const clientMap = new Map<string, ClientHours>();

    // Filter entries by date range
    const filteredEntries = timerEntries.filter(entry =>
      isWithinInterval(new Date(entry.startTime), { start: dateRangeData.start, end: dateRangeData.end })
    );

    // Build matrix - billable clients only
    filteredEntries.forEach(entry => {
      const project = projects.find(p => p.id === entry.projectId);
      if (!project || project.billableStatus !== 'billable') return;

      // Find the task from the tasks context (not from project workflow)
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task) return;

      const clientName = project.clientName || 'Unassigned Client';
      const userName = task.assignee || 'Unassigned';

      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          clientName,
          hours: {},
          totalHours: 0,
          clientType: project.clientType
        });
      }

      const clientData = clientMap.get(clientName)!;
      const hours = (entry.duration || 0) / 3600;
      
      clientData.hours[userName] = (clientData.hours[userName] || 0) + hours;
      clientData.totalHours += hours;
    });

    return Array.from(clientMap.values()).sort((a, b) => 
      a.clientName.localeCompare(b.clientName)
    );
  }, [timerEntries, projects, tasks, dateRangeData]);

  // Calculate non-billable hours per team member
  const nonBillableHours = useMemo(() => {
    const hoursMap: { [userName: string]: number } = {};

    // Filter entries by date range
    const filteredEntries = timerEntries.filter(entry =>
      isWithinInterval(new Date(entry.startTime), { start: dateRangeData.start, end: dateRangeData.end })
    );

    // Sum non-billable hours
    filteredEntries.forEach(entry => {
      const project = projects.find(p => p.id === entry.projectId);
      if (!project || project.billableStatus === 'billable') return;

      const task = tasks.find(t => t.id === entry.taskId);
      if (!task) return;

      const userName = task.assignee || 'Unassigned';
      const hours = (entry.duration || 0) / 3600;
      
      hoursMap[userName] = (hoursMap[userName] || 0) + hours;
    });

    return hoursMap;
  }, [timerEntries, projects, tasks, dateRangeData]);

  // Get all unique team members
  const allTeamMembers = useMemo(() => {
    const members = new Set<string>();
    clientHoursMatrix.forEach(client => {
      Object.keys(client.hours).forEach(name => members.add(name));
    });
    return Array.from(members).sort();
  }, [clientHoursMatrix]);

  // Initialize selected members when allTeamMembers changes
  useMemo(() => {
    if (selectedMembers.length === 0 && allTeamMembers.length > 0) {
      setSelectedMembers(allTeamMembers);
    }
  }, [allTeamMembers]);

  // Filtered team members based on selection
  const filteredTeamMembers = useMemo(() => {
    if (selectedMembers.length === 0) return allTeamMembers;
    return allTeamMembers.filter(member => selectedMembers.includes(member));
  }, [allTeamMembers, selectedMembers]);

  // Calculate payroll summaries
  const payrollSummaries = useMemo(() => {
    const summaries: PayrollSummary[] = [];

    allTeamMembers.forEach(userName => {
      const profile = userProfiles.find(u => u.name === userName);
      if (!profile) return;

      // Calculate gross hours from all clients
      let grossHours = 0;
      clientHoursMatrix.forEach(client => {
        grossHours += client.hours[userName] || 0;
      });

      // Calculate lunch deduction - only deduct for days actually worked
      // Assume 8-hour workday, so 1 hour of logged time = 1/8 of a day
      const daysWorked = grossHours / 8;
      const lunchMinutesPerDay = profile.lunchBreakMinutes || 30;
      const lunchDeduction = (lunchMinutesPerDay * daysWorked) / 60;

      // PTO used in this period (simplified - in production would track by date)
      const ptoUsed = 0; // Would need to track PTO requests by date range

      // Sick leave used - check edited value first, then profile value
      const sickLeaveUsed = editedSickHours[userName] !== undefined 
        ? editedSickHours[userName] 
        : (profile.sickLeaveUsed || 0);

      // Calculate holidays in the period
      const holidaysInPeriod = (profile.holidays || []).filter(holiday => {
        try {
          const holidayDate = parseISO(holiday);
          return isWithinInterval(holidayDate, { start: dateRangeData.start, end: dateRangeData.end });
        } catch {
          return false;
        }
      });
      const holidayHours = holidaysInPeriod.length * 8; // 8 hours per holiday

      // Net hours = Gross - Lunch deductions
      const netHours = Math.max(0, grossHours - lunchDeduction);

      // Calculate regular vs overtime
      const overtimeThreshold = profile.overtimeThreshold || 40;
      const overtimeEnabled = profile.overtimeEnabled || false;
      const employmentType = profile.employmentType || 'hourly';
      
      let regularHours = netHours;
      let overtimeHours = 0;

      if (overtimeEnabled && netHours > overtimeThreshold) {
        regularHours = overtimeThreshold;
        overtimeHours = netHours - overtimeThreshold;
      }

      // Calculate pay
      const hourlyRate = profile.hourlyRate;
      const overtimeRate = profile.overtimeRate || hourlyRate * 1.5;
      
      let regularPay: number;
      let overtimePay: number;
      let ptoPay: number;
      let holidayPayAmount: number;
      let sickPay: number;
      
      if (employmentType === 'salaried') {
        // Salaried employees: Calculate based on period type
        // For week: annualSalary / 52
        // For biweekly: annualSalary / 26
        // For month: annualSalary / 12
        const annualSalary = profile.annualSalary || (hourlyRate * profile.hoursPerWeek * 52);
        
        let periodPay = 0;
        switch (viewMode) {
          case 'week':
            periodPay = annualSalary / 52;
            break;
          case 'biweekly':
            periodPay = annualSalary / 26;
            break;
          case 'month':
            periodPay = annualSalary / 12;
            break;
        }
        
        // Salaried get their base pay regardless of hours (up to threshold)
        regularPay = periodPay;
        
        // But still calculate overtime if they work beyond threshold
        overtimePay = overtimeHours * overtimeRate;
        
        // PTO, sick pay and holidays are already included in their salary
        ptoPay = 0;
        sickPay = 0;
        holidayPayAmount = 0;
      } else {
        // Hourly employees: Pay based on actual hours
        regularPay = regularHours * hourlyRate;
        overtimePay = overtimeHours * overtimeRate;
        ptoPay = ptoUsed * hourlyRate;
        sickPay = sickLeaveUsed * hourlyRate;
        holidayPayAmount = holidayHours * hourlyRate;
      }

      // Calculate sick leave accrued this period based on firm settings
      let sickLeaveAccrued = 0;
      if (firmSettings?.sickLeavePolicy) {
        const policy = firmSettings.sickLeavePolicy;
        
        switch (policy.accrualMethod) {
          case 'per-hour':
            // Calculate based on hours worked
            const accrualRate = policy.accrualRate || 0; // e.g., 1 hour per 30 hours worked
            if (accrualRate > 0) {
              sickLeaveAccrued = grossHours / accrualRate;
            }
            break;
          
          case 'per-pay-period':
            // Fixed hours per pay period
            sickLeaveAccrued = policy.accrualRate || 0;
            break;
          
          case 'lump-sum':
            // Lump sum would be handled elsewhere (e.g., annually)
            sickLeaveAccrued = 0;
            break;
        }

        // Apply max accrual cap if set
        if (policy.maxAccrual) {
          const currentBalance = profile.sickLeaveBalance || 0;
          const potentialBalance = currentBalance + sickLeaveAccrued;
          if (potentialBalance > policy.maxAccrual) {
            sickLeaveAccrued = Math.max(0, policy.maxAccrual - currentBalance);
          }
        }
      }
      
      const grossPay = regularPay + overtimePay + ptoPay + sickPay + holidayPayAmount;

      summaries.push({
        userName,
        employmentType,
        annualSalary: profile.annualSalary,
        grossHours,
        lunchDeduction,
        ptoUsed,
        sickLeaveUsed,
        holidayPay: holidayHours,
        netHours,
        regularHours,
        overtimeHours,
        regularPay,
        overtimePay,
        ptoPay,
        sickPay,
        holidayPayAmount,
        grossPay,
        hourlyRate,
        overtimeRate,
        overtimeThreshold,
        overtimeEnabled,
        sickLeaveAccrued
      });
    });

    return summaries;
  }, [allTeamMembers, clientHoursMatrix, userProfiles, workingDays, dateRangeData, editedSickHours, viewMode, firmSettings]);

  // Calculate totals
  const totals = useMemo(() => {
    // Filter summaries to only include selected members
    const filteredSummaries = payrollSummaries.filter(s => selectedMembers.includes(s.userName));
    
    return {
      grossHours: filteredSummaries.reduce((sum, s) => sum + s.grossHours, 0),
      lunchDeduction: filteredSummaries.reduce((sum, s) => sum + s.lunchDeduction, 0),
      ptoUsed: filteredSummaries.reduce((sum, s) => sum + s.ptoUsed, 0),
      sickLeaveUsed: filteredSummaries.reduce((sum, s) => sum + s.sickLeaveUsed, 0),
      holidayPay: filteredSummaries.reduce((sum, s) => sum + s.holidayPay, 0),
      netHours: filteredSummaries.reduce((sum, s) => sum + s.netHours, 0),
      regularHours: filteredSummaries.reduce((sum, s) => sum + s.regularHours, 0),
      overtimeHours: filteredSummaries.reduce((sum, s) => sum + s.overtimeHours, 0),
      regularPay: filteredSummaries.reduce((sum, s) => sum + s.regularPay, 0),
      overtimePay: filteredSummaries.reduce((sum, s) => sum + s.overtimePay, 0),
      ptoPay: filteredSummaries.reduce((sum, s) => sum + s.ptoPay, 0),
      sickPay: filteredSummaries.reduce((sum, s) => sum + s.sickPay, 0),
      holidayPayAmount: filteredSummaries.reduce((sum, s) => sum + s.holidayPayAmount, 0),
      sickLeaveAccrued: filteredSummaries.reduce((sum, s) => sum + s.sickLeaveAccrued, 0),
      grossPay: filteredSummaries.reduce((sum, s) => sum + s.grossPay, 0)
    };
  }, [payrollSummaries, selectedMembers]);

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + 'h';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Client/Summary',
      ...allTeamMembers,
      'Total'
    ];

    // Client hours rows
    const clientRows = clientHoursMatrix.map(client => [
      client.clientName,
      ...allTeamMembers.map(member => (client.hours[member] || 0).toFixed(1)),
      client.totalHours.toFixed(1)
    ]);

    // Payroll summary rows
    const summaryRows = [
      [''],
      ['GROSS HOURS', ...payrollSummaries.map(s => s.grossHours.toFixed(1)), totals.grossHours.toFixed(1)],
      ['Less: Lunch', ...payrollSummaries.map(s => `(${s.lunchDeduction.toFixed(1)})`), `(${totals.lunchDeduction.toFixed(1)})`],
      ['PTO Used', ...payrollSummaries.map(s => s.ptoUsed > 0 ? `(${s.ptoUsed.toFixed(1)})` : '0.0'), totals.ptoUsed > 0 ? `(${totals.ptoUsed.toFixed(1)})` : '0.0'],
      ['Sick Leave Used', ...payrollSummaries.map(s => s.sickLeaveUsed.toFixed(1)), totals.sickLeaveUsed.toFixed(1)],
      ['Holiday Pay', ...payrollSummaries.map(s => s.holidayPay.toFixed(1)), totals.holidayPay.toFixed(1)],
      [''],
      ['NET HOURS', ...payrollSummaries.map(s => s.netHours.toFixed(1)), totals.netHours.toFixed(1)],
      ['Regular (≤40)', ...payrollSummaries.map(s => s.regularHours.toFixed(1)), totals.regularHours.toFixed(1)],
      ['Overtime (>40)', ...payrollSummaries.map(s => s.overtimeHours.toFixed(1)), totals.overtimeHours.toFixed(1)],
      [''],
      ['Regular Pay', ...payrollSummaries.map(s => s.regularPay.toFixed(2)), totals.regularPay.toFixed(2)],
      ['Overtime Pay', ...payrollSummaries.map(s => s.overtimePay.toFixed(2)), totals.overtimePay.toFixed(2)],
      ['PTO Pay', ...payrollSummaries.map(s => s.ptoPay.toFixed(2)), totals.ptoPay.toFixed(2)],
      ['Sick Pay', ...payrollSummaries.map(s => s.sickPay.toFixed(2)), totals.sickPay.toFixed(2)],
      ['Holiday Pay', ...payrollSummaries.map(s => s.holidayPayAmount.toFixed(2)), totals.holidayPayAmount.toFixed(2)],
      [''],
      ['Sick Leave Accrued', ...payrollSummaries.map(s => s.sickLeaveAccrued.toFixed(2)), totals.sickLeaveAccrued.toFixed(2)],
      [''],
      ['GROSS PAY', ...payrollSummaries.map(s => s.grossPay.toFixed(2)), totals.grossPay.toFixed(2)]
    ];

    const csvContent = [
      headers.join(','),
      ...clientRows.map(row => row.join(',')),
      ...summaryRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Approve payroll - deduct sick hours and apply accruals
  const approvePayroll = () => {
    if (!updateUserProfiles) {
      toast.error('Unable to update user profiles');
      return;
    }

    // Update user profiles with sick leave deductions and accruals
    const updatedProfiles = userProfiles.map(profile => {
      const summary = payrollSummaries.find(s => s.userName === profile.name);
      if (!summary) return profile;

      const sickLeaveUsed = summary.sickLeaveUsed || 0;
      const sickLeaveAccrued = summary.sickLeaveAccrued || 0;
      const currentBalance = profile.sickLeaveBalance || 0;

      // Calculate new balance: current - used + accrued
      const newBalance = currentBalance - sickLeaveUsed + sickLeaveAccrued;

      return {
        ...profile,
        sickLeaveBalance: Math.max(0, newBalance),
        sickLeaveUsed: 0 // Reset used hours after deduction
      };
    });

    updateUserProfiles(updatedProfiles);
    setApprovalStatus('approved');
    setEditedSickHours({}); // Clear edited hours
    
    toast.success(
      `Payroll approved! Sick leave deducted and ${totals.sickLeaveAccrued.toFixed(1)}h accrued.`,
      { duration: 4000 }
    );
  };

  // Lock payroll
  const lockPayroll = () => {
    setApprovalStatus('locked');
    toast.success('Payroll report locked!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl dark:text-gray-100">Payroll Report</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Ready-to-use payroll calculations with deductions and overtime
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            <FileDown className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Total Hours</div>
              <div className="text-2xl font-mono text-emerald-700 dark:text-emerald-400">
                {formatHours(totals.grossHours)}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">
                {formatHours(totals.netHours)} net
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Overtime Hours</div>
              <div className="text-2xl font-mono text-blue-700 dark:text-blue-400">
                {formatHours(totals.overtimeHours)}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">
                {formatCurrency(totals.overtimePay)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Lunch Deducted</div>
              <div className="text-2xl font-mono text-amber-700 dark:text-amber-400">
                {formatHours(totals.lunchDeduction)}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">
                {workingDays} days
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-white to-rose-50 dark:from-gray-800 dark:to-rose-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Sick Leave Accrued</div>
              <div className="text-2xl font-mono text-rose-700 dark:text-rose-400">
                {formatHours(totals.sickLeaveAccrued)}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">
                {totals.sickLeaveUsed > 0 ? `${formatHours(totals.sickLeaveUsed)} used` : 'this period'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Total Payroll</div>
              <div className="text-2xl font-mono text-violet-700 dark:text-violet-400">
                {formatCurrency(totals.grossPay)}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">
                gross pay
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payroll Summary Table */}
      <Card className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg mb-1 dark:text-gray-200">Payroll Summary</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Ready-to-use payroll calculations</p>
              </div>
            </div>

            {/* Date Navigation & Controls */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950 dark:to-gray-800 border border-violet-200 dark:border-violet-800 rounded-lg">
              <div className="flex items-center justify-center gap-4 flex-1">
                {/* View Mode Buttons */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-slate-200 dark:border-gray-600">
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="text-xs"
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'biweekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('biweekly')}
                    className="text-xs"
                  >
                    2 Weeks
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="text-xs"
                  >
                    Month
                  </Button>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFastPrevious}>
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevious}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="min-w-[220px] text-center">
                    <div className="text-sm font-medium text-violet-700 dark:text-violet-400">
                      {format(dateRangeData.start, 'MMM d')} - {format(dateRangeData.end, 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      {workingDays} working days
                    </div>
                  </div>

                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFastNext}>
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
                    Today
                  </Button>
                  
                  {/* Team Member Filter */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Select
                            value="filter"
                            onValueChange={(value) => {
                              if (value === 'all') {
                                setSelectedMembers(allTeamMembers);
                              } else if (value === 'none') {
                                setSelectedMembers([]);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px] gap-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">
                                  {selectedMembers.length === allTeamMembers.length 
                                    ? 'All Members' 
                                    : selectedMembers.length === 0
                                    ? 'No Members'
                                    : `${selectedMembers.length} Selected`}
                                </span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setSelectedMembers(allTeamMembers)}
                                  >
                                    Select All
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setSelectedMembers([])}
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <div className="border-t pt-1">
                                  {allTeamMembers.map((member) => (
                                    <div
                                      key={member}
                                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                      onClick={() => {
                                        setSelectedMembers(prev =>
                                          prev.includes(member)
                                            ? prev.filter(m => m !== member)
                                            : [...prev, member]
                                        );
                                      }}
                                    >
                                      <Checkbox
                                        checked={selectedMembers.includes(member)}
                                        onCheckedChange={(checked) => {
                                          setSelectedMembers(prev =>
                                            checked
                                              ? [...prev, member]
                                              : prev.filter(m => m !== member)
                                          );
                                        }}
                                      />
                                      <span className="text-xs dark:text-gray-300">{member}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </SelectContent>
                          </Select>
                          {selectedMembers.length > 0 && selectedMembers.length < allTeamMembers.length && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-violet-500 text-white text-xs">
                              {selectedMembers.length}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Filter by team members
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 ml-4">
                {selectedMembers.length === allTeamMembers.length 
                  ? `${allTeamMembers.length} Team Members`
                  : `${selectedMembers.length} of ${allTeamMembers.length} Members`}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-gray-800 border-b-2 border-slate-300 dark:border-gray-600">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-slate-50 dark:bg-gray-800 z-20 min-w-[160px]">Summary</th>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <th key={member} className="text-center p-3 font-medium text-slate-700 dark:text-gray-300 min-w-[120px]">
                        <div className="relative inline-block">
                          <span>{member}</span>
                          <div className="absolute -top-2 -right-8 flex items-center gap-0.5">
                            {summary?.employmentType === 'contractor' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-amber-500 text-white border-amber-600">
                                      C
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div>Independent Contractor</div>
                                      <div>Paid hourly only</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {summary?.employmentType === 'salaried' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-violet-100 text-violet-600">
                                      S
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div>Salaried Employee</div>
                                      <div>Annual: {summary.annualSalary ? formatCurrency(summary.annualSalary) : 'N/A'}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {summary?.overtimeEnabled && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-600">
                                      OT
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div>OT Threshold: {summary.overtimeThreshold}h/week</div>
                                    <div>OT Rate: {formatCurrency(summary.overtimeRate)}/hr</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="text-center p-3 font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 sticky right-0 z-20 min-w-[120px] border-l-2 border-violet-200 dark:border-violet-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Gross Hours */}
                <tr className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-slate-50 dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-2">
                      <span>GROSS HOURS</span>
                      <button
                        onClick={() => setGrossHoursExpanded(!grossHoursExpanded)}
                        className="text-xs text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700 px-2 py-0.5 rounded border border-slate-300 dark:border-gray-600 transition-all"
                      >
                        {grossHoursExpanded ? 'collapse' : 'expand'}
                      </button>
                    </div>
                  </td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-slate-700 dark:text-gray-300">
                            {summary ? formatHours(summary.grossHours) : '—'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (onNavigateToTeamMetrics) {
                                onNavigateToTeamMetrics(member, startOfWeek(dateRangeData.start, { weekStartsOn: 1 }));
                              }
                            }}
                            className="h-5 w-5 p-0 hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-violet-700 dark:hover:text-violet-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {formatHours(totals.grossHours)}
                  </td>
                </tr>

                {/* Client Breakdown Rows - Expandable */}
                {grossHoursExpanded && (
                  <>
                    {billableClientHoursMatrix.length > 0 ? (
                      billableClientHoursMatrix.map((client, idx) => (
                        <tr key={`client-${idx}`} className="border-b border-slate-100 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-950/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/50">
                          <td className="p-2 pl-10 text-sm text-slate-600 dark:text-gray-400 sticky left-0 bg-blue-50/30 dark:bg-blue-950/30 z-10">
                            <div className="flex items-center gap-2">
                              {client.clientType === 'individual' ? (
                                <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              )}
                              <span>{client.clientName}</span>
                            </div>
                          </td>
                          {filteredTeamMembers.map(member => {
                            const hours = client.hours[member] || 0;
                            return (
                              <td key={member} className="text-center p-2 font-mono text-sm text-slate-600 dark:text-gray-400">
                                {hours > 0 ? formatHours(hours) : '—'}
                              </td>
                            );
                          })}
                          <td className="text-center p-2 font-mono text-sm text-slate-600 dark:text-gray-400 bg-blue-50/30 dark:bg-blue-950/30 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                            {formatHours(client.totalHours)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-100 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-950/30">
                        <td colSpan={filteredTeamMembers.length + 2} className="p-3 text-center text-sm text-slate-500 dark:text-gray-500 italic">
                          No billable client hours to display
                        </td>
                      </tr>
                    )}
                    
                    {/* Non-Billable Time Row */}
                    <tr className="border-b border-slate-200 dark:border-gray-700 bg-slate-100/50 dark:bg-gray-800/50">
                      <td className="p-2 pl-10 text-sm text-slate-500 dark:text-gray-500 sticky left-0 bg-slate-100/50 dark:bg-gray-800/50 z-10">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                          <span className="italic">Non-Billable Time</span>
                        </div>
                      </td>
                      {filteredTeamMembers.map(member => {
                        const hours = nonBillableHours[member] || 0;
                        return (
                          <td key={member} className="text-center p-2 font-mono text-sm text-slate-500 dark:text-gray-500 italic">
                            {hours > 0 ? formatHours(hours) : '—'}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-mono text-sm text-slate-500 dark:text-gray-500 italic bg-slate-100/50 dark:bg-gray-800/50 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                        {formatHours(Object.values(nonBillableHours).reduce((sum, h) => sum + h, 0))}
                      </td>
                    </tr>
                  </>
                )}

                {/* Less: Lunch */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      Less: Lunch
                    </div>
                  </td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-red-600 dark:text-red-400">
                        {summary ? `(${formatHours(summary.lunchDeduction)})` : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    ({formatHours(totals.lunchDeduction)})
                  </td>
                </tr>

                {/* PTO Used */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <Umbrella className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      PTO Used
                    </div>
                  </td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-slate-600 dark:text-gray-400">
                        {summary && summary.ptoUsed > 0 ? `(${formatHours(summary.ptoUsed)})` : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.ptoUsed > 0 ? `(${formatHours(totals.ptoUsed)})` : '—'}
                  </td>
                </tr>

                {/* Sick Leave Used */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      Sick Leave Used
                    </div>
                  </td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    const currentValue = editedSickHours[member] !== undefined 
                      ? editedSickHours[member] 
                      : (summary?.sickLeaveUsed || 0);
                    
                    return (
                      <td key={member} className="text-center p-3">
                        <Input
                          type="number"
                          value={currentValue}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setEditedSickHours(prev => ({
                              ...prev,
                              [member]: value
                            }));
                          }}
                          className="w-20 h-8 text-center font-mono text-sm"
                          step="0.5"
                          min="0"
                          disabled={approvalStatus === 'locked'}
                        />
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.sickLeaveUsed > 0 ? formatHours(totals.sickLeaveUsed) : '—'}
                  </td>
                </tr>

                {/* Holiday Pay */}
                <tr className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <PartyPopper className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      Holiday Pay
                    </div>
                  </td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-emerald-600 dark:text-emerald-400">
                        {summary && summary.holidayPay > 0 ? formatHours(summary.holidayPay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.holidayPay > 0 ? formatHours(totals.holidayPay) : '—'}
                  </td>
                </tr>

                {/* Spacer */}
                <tr className="h-2 bg-slate-100 dark:bg-gray-800">
                  <td className="sticky left-0 bg-slate-100 dark:bg-gray-800"></td>
                  {filteredTeamMembers.map(member => (
                    <td key={member} className="bg-slate-100 dark:bg-gray-800"></td>
                  ))}
                  <td className="sticky right-0 bg-slate-100 dark:bg-gray-800 border-l-2 border-violet-200 dark:border-violet-800"></td>
                </tr>

                {/* Net Hours */}
                <tr className="border-b border-slate-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950">
                  <td className="p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-blue-50 dark:bg-blue-950 z-10">NET HOURS</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono font-medium text-blue-700 dark:text-blue-400">
                        {summary ? formatHours(summary.netHours) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono font-medium text-violet-700 dark:text-violet-400 bg-blue-50 dark:bg-blue-950 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {formatHours(totals.netHours)}
                  </td>
                </tr>

                {/* Regular Hours */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">Regular (≤40)</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-slate-600 dark:text-gray-400">
                        {summary ? formatHours(summary.regularHours) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {formatHours(totals.regularHours)}
                  </td>
                </tr>

                {/* Overtime Hours */}
                <tr className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 pl-6 text-slate-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10">Overtime ({'>'}40)</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-blue-600 dark:text-blue-400">
                        {summary && summary.overtimeHours > 0 ? formatHours(summary.overtimeHours) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.overtimeHours > 0 ? formatHours(totals.overtimeHours) : '—'}
                  </td>
                </tr>

                {/* Spacer */}
                <tr className="h-2 bg-slate-100 dark:bg-gray-800">
                  <td className="sticky left-0 bg-slate-100 dark:bg-gray-800"></td>
                  {filteredTeamMembers.map(member => (
                    <td key={member} className="bg-slate-100 dark:bg-gray-800"></td>
                  ))}
                  <td className="sticky right-0 bg-slate-100 dark:bg-gray-800 border-l-2 border-violet-200 dark:border-violet-800"></td>
                </tr>

                {/* Regular Pay */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">Regular Pay</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-slate-700 dark:text-gray-300">
                        {summary ? formatCurrency(summary.regularPay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-violet-700 dark:text-violet-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {formatCurrency(totals.regularPay)}
                  </td>
                </tr>

                {/* Overtime Pay */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">Overtime Pay</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-blue-600 dark:text-blue-400">
                        {summary?.employmentType === 'contractor' 
                          ? <span className="text-slate-400 dark:text-gray-500">N/A</span>
                          : summary && summary.overtimePay > 0 ? formatCurrency(summary.overtimePay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.overtimePay > 0 ? formatCurrency(totals.overtimePay) : '—'}
                  </td>
                </tr>

                {/* PTO Pay */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">PTO Pay</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-slate-600 dark:text-gray-400">
                        {summary?.employmentType === 'contractor' 
                          ? <span className="text-slate-400 dark:text-gray-500">N/A</span>
                          : summary && summary.ptoPay > 0 ? formatCurrency(summary.ptoPay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.ptoPay > 0 ? formatCurrency(totals.ptoPay) : '—'}
                  </td>
                </tr>

                {/* Sick Pay */}
                <tr className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">Sick Pay</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-rose-600 dark:text-rose-400">
                        {summary?.employmentType === 'contractor' 
                          ? <span className="text-slate-400 dark:text-gray-500">N/A</span>
                          : summary && summary.sickPay > 0 ? formatCurrency(summary.sickPay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-rose-600 dark:text-rose-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.sickPay > 0 ? formatCurrency(totals.sickPay) : '—'}
                  </td>
                </tr>

                {/* Holiday Pay */}
                <tr className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">Holiday Pay</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono text-emerald-600 dark:text-emerald-400">
                        {summary?.employmentType === 'contractor' 
                          ? <span className="text-slate-400 dark:text-gray-500">N/A</span>
                          : summary && summary.holidayPayAmount > 0 ? formatCurrency(summary.holidayPayAmount) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900 sticky right-0 z-10 border-l-2 border-violet-200 dark:border-violet-800">
                    {totals.holidayPayAmount > 0 ? formatCurrency(totals.holidayPayAmount) : '—'}
                  </td>
                </tr>

                {/* Spacer */}
                <tr className="h-2 bg-slate-100 dark:bg-gray-800">
                  <td className="sticky left-0 bg-slate-100 dark:bg-gray-800"></td>
                  {filteredTeamMembers.map(member => (
                    <td key={member} className="bg-slate-100 dark:bg-gray-800"></td>
                  ))}
                  <td className="sticky right-0 bg-slate-100 dark:bg-gray-800 border-l-2 border-violet-200 dark:border-violet-800"></td>
                </tr>

                {/* Gross Pay */}
                <tr className="border-t-2 border-slate-300 dark:border-gray-600 bg-violet-50 dark:bg-violet-950">
                  <td className="p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-violet-50 dark:bg-violet-950 z-10">GROSS PAY</td>
                  {filteredTeamMembers.map(member => {
                    const summary = payrollSummaries.find(s => s.userName === member);
                    return (
                      <td key={member} className="text-center p-3 font-mono font-medium text-violet-700 dark:text-violet-400">
                        {summary ? formatCurrency(summary.grossPay) : '—'}
                      </td>
                    );
                  })}
                  <td className="text-center p-3 font-mono font-medium text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900 sticky right-0 z-10 text-lg border-l-2 border-violet-300 dark:border-violet-700">
                    {formatCurrency(totals.grossPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

      {/* Info Footer */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-gray-300">
            <p className="font-medium mb-1">About This Report</p>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-gray-400">
              <li>• Lunch breaks are automatically deducted based on team member settings ({workingDays} working days)</li>
              <li>• Overtime is calculated for eligible employees when net hours exceed their threshold</li>
              <li>• Salaried employees (SAL badge) receive their base {viewMode === 'week' ? 'weekly' : viewMode === 'biweekly' ? 'biweekly' : 'monthly'} pay regardless of hours worked, plus any overtime</li>
              <li>• Holiday pay is added for hourly employees; it's included in base pay for salaried employees</li>
              <li>• Sick leave is editable by managers and automatically deducted from balances upon approval</li>
              <li>• Sick leave accruals are calculated based on firm policy settings (hours worked or per pay period)</li>
              <li>• This report is ready to export and use for payroll processing</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Approval Controls */}
      <Card className="p-6 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Payroll Approval</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {approvalStatus === 'draft' && 'Review and approve to deduct sick hours and apply accruals'}
                {approvalStatus === 'approved' && 'Payroll approved. Lock to prevent further edits.'}
                {approvalStatus === 'locked' && 'Payroll is locked and cannot be edited.'}
              </p>
            </div>
            <Badge 
              variant={approvalStatus === 'draft' ? 'secondary' : 'default'}
              className={
                approvalStatus === 'draft' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400' :
                approvalStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400' :
                'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
              }
            >
              {approvalStatus === 'draft' && 'Draft'}
              {approvalStatus === 'approved' && 'Approved'}
              {approvalStatus === 'locked' && 'Locked'}
            </Badge>
          </div>

          {approvalStatus === 'draft' && totals.sickLeaveAccrued > 0 && (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-violet-200 dark:border-violet-700">
              <div className="text-sm text-slate-700 dark:text-gray-300">
                <span className="font-medium">Sick Leave Summary:</span>
                <div className="mt-1 text-xs space-y-0.5">
                  <div>• <span className="font-medium text-rose-600 dark:text-rose-400">{formatHours(totals.sickLeaveUsed)}</span> will be deducted from balances</div>
                  <div>• <span className="font-medium text-emerald-600 dark:text-emerald-400">+{formatHours(totals.sickLeaveAccrued)}</span> will be accrued based on hours worked</div>
                  <div className="text-slate-500 dark:text-gray-400">Net impact: {totals.sickLeaveAccrued - totals.sickLeaveUsed >= 0 ? '+' : ''}{formatHours(totals.sickLeaveAccrued - totals.sickLeaveUsed)} to balances</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {approvalStatus === 'draft' && (
              <Button
                onClick={approvePayroll}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Finalize Payroll
              </Button>
            )}
            {approvalStatus === 'approved' && (
              <Button
                variant="outline"
                onClick={lockPayroll}
                className="gap-2"
              >
                <Lock className="w-4 h-4" />
                Lock Payroll
              </Button>
            )}
            {approvalStatus === 'locked' && (
              <Button
                variant="outline"
                onClick={() => setApprovalStatus('approved')}
                className="gap-2"
              >
                <Unlock className="w-4 h-4" />
                Unlock
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}