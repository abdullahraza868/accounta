import { useState, useMemo, Fragment } from 'react';
import { useWorkflowContext } from './WorkflowContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subDays, subMonths, subWeeks } from 'date-fns@3.6.0';
import { TimeTrackingFilterPanel } from './TimeTrackingFilterPanel';
import { UserTimeDetailView } from './UserTimeDetailView';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Target, DollarSign, TrendingUp, Filter, Search, Calendar, BarChart3, User, FileDown, AlertTriangle, HelpCircle, ArrowUp, ArrowDown, Users, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Checkbox } from './ui/checkbox';

// User profile interface for rates and settings - now imported from WorkflowContext
import type { UserProfile } from './WorkflowContext';

interface UtilizationData {
  name: string;
  totalHoursLogged: number;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number; // Billable Hours / Available Hours
  availableHours: number;
  billablePercentage: number; // Billable / Total Logged
  productivityScore: number;
  effectiveRate: number;
  revenueGenerated: number;
  costToFirm: number;
  profitability: number;
  tasksCompleted: number;
  hourlyRate: number;
  billableRate: number;
  role: string;
  // Overtime tracking
  overtimeHours: number;
  overtimeCost: number;
  overtimeEnabled: boolean;
  overtimeThreshold: number;
  adjustedCost: number; // Total cost including OT premium
  adjustedProfitability: number; // Revenue - Adjusted Cost
}

type GroupByOption = 'user' | 'team' | 'client' | 'project';
type DateRangeOption = 'today' | 'yesterday' | 'week' | 'last-week' | 'month' | 'last-month' | 'quarter' | 'year' | 'custom';

interface UtilizationAnalyticsProps {
  initialUserName?: string | null;
  initialWeekStart?: Date | null;
  onNavigateBack?: () => void;
}

export function UtilizationAnalytics({ initialUserName, initialWeekStart, onNavigateBack }: UtilizationAnalyticsProps = {}) {
  const { tasks, projects, timerEntries, userProfiles } = useWorkflowContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeOption>('month');
  const [groupBy, setGroupBy] = useState<GroupByOption>('user');
  const [showBillableOnly, setShowBillableOnly] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]); // NEW: Team member filter
  const [showClientBreakdown, setShowClientBreakdown] = useState(false); // NEW: Client breakdown toggle
  
  // User hours detail dialog state
  const [selectedUserName, setSelectedUserName] = useState<string | null>(initialUserName || null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(initialWeekStart || new Date());
  
  // Filter states for the advanced filter panel
  const [includedUsers, setIncludedUsers] = useState<string[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<string[]>([]);
  const [includedClients, setIncludedClients] = useState<string[]>([]);
  const [excludedClients, setExcludedClients] = useState<string[]>([]);
  const [includedProjects, setIncludedProjects] = useState<string[]>([]);
  const [excludedProjects, setExcludedProjects] = useState<string[]>([]);
  const [includedRoles, setIncludedRoles] = useState<string[]>([]);
  const [excludedRoles, setExcludedRoles] = useState<string[]>([]);
  
  // Get unique roles
  const allRoles = useMemo(() => {
    return Array.from(new Set(userProfiles.map(u => u.role))).sort();
  }, [userProfiles]);
  
  // Get unique clients
  const allClients = useMemo(() => {
    const clientsSet = new Set(projects.map(p => p.clientName).filter(Boolean));
    return Array.from(clientsSet).sort().map(name => ({ name: name as string, type: 'business' as const }));
  }, [projects]);
  
  // Get unique users
  const allUsers = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.assignee))).sort();
  }, [tasks]);

  // Calculate date range
  const getDateRange = (range: DateRangeOption) => {
    const now = new Date();
    
    switch (range) {
      case 'today':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return {
          start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        };
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'last-week':
        const lastWeek = subWeeks(now, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        return { start: quarterStart, end: quarterEnd };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  };

  // Get prior period date range for comparison
  const getPriorPeriodRange = (range: DateRangeOption) => {
    const currentRange = getDateRange(range);
    const daysInRange = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'today':
      case 'yesterday':
        // Compare to previous day
        const prevDay = subDays(currentRange.start, 1);
        return {
          start: new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate()),
          end: new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate(), 23, 59, 59)
        };
      case 'week':
      case 'last-week':
        // Compare to previous week
        return {
          start: subWeeks(currentRange.start, 1),
          end: subWeeks(currentRange.end, 1)
        };
      case 'month':
      case 'last-month':
        // Compare to previous month
        return {
          start: startOfMonth(subMonths(currentRange.start, 1)),
          end: endOfMonth(subMonths(currentRange.start, 1))
        };
      case 'quarter':
        // Compare to previous quarter
        const prevQuarterStart = new Date(currentRange.start);
        prevQuarterStart.setMonth(prevQuarterStart.getMonth() - 3);
        const prevQuarterEnd = new Date(currentRange.end);
        prevQuarterEnd.setMonth(prevQuarterEnd.getMonth() - 3);
        return { start: prevQuarterStart, end: prevQuarterEnd };
      case 'year':
        // Compare to previous year
        return {
          start: new Date(currentRange.start.getFullYear() - 1, 0, 1),
          end: new Date(currentRange.start.getFullYear() - 1, 11, 31)
        };
      default:
        return {
          start: startOfMonth(subMonths(currentRange.start, 1)),
          end: endOfMonth(subMonths(currentRange.start, 1))
        };
    }
  };

  // Filter timer entries by date range
  const filteredEntriesByDate = useMemo(() => {
    const range = getDateRange(dateRange);
    return timerEntries.filter(entry => 
      isWithinInterval(new Date(entry.startTime), { start: range.start, end: range.end })
    );
  }, [timerEntries, dateRange]);

  // Filter timer entries for prior period
  const priorPeriodEntries = useMemo(() => {
    const priorRange = getPriorPeriodRange(dateRange);
    return timerEntries.filter(entry => 
      isWithinInterval(new Date(entry.startTime), { start: priorRange.start, end: priorRange.end })
    );
  }, [timerEntries, dateRange]);

  // Calculate client x team member hours matrix
  interface ClientHours {
    clientName: string;
    hours: { [userName: string]: number };
    totalHours: number;
  }

  const clientHoursMatrix = useMemo(() => {
    const matrix: ClientHours[] = [];
    const clientMap = new Map<string, ClientHours>();
    
    const range = getDateRange(dateRange);

    // Filter entries by date range
    const filteredEntries = timerEntries.filter(entry =>
      isWithinInterval(new Date(entry.startTime), { start: range.start, end: range.end })
    );

    // Build matrix
    filteredEntries.forEach(entry => {
      const project = projects.find(p => p.id === entry.projectId);
      if (!project) return;

      // Find the task from the tasks context
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
  }, [timerEntries, projects, tasks, dateRange]);

  // Get all unique team members from client hours matrix
  const allTeamMembersFromMatrix = useMemo(() => {
    const members = new Set<string>();
    clientHoursMatrix.forEach(client => {
      Object.keys(client.hours).forEach(name => members.add(name));
    });
    return Array.from(members).sort();
  }, [clientHoursMatrix]);

  // Initialize selected team members when allTeamMembersFromMatrix changes
  useMemo(() => {
    if (selectedTeamMembers.length === 0 && allTeamMembersFromMatrix.length > 0) {
      setSelectedTeamMembers(allTeamMembersFromMatrix);
    }
  }, [allTeamMembersFromMatrix]);

  // Calculate utilization data
  const utilizationData = useMemo(() => {
    const data: UtilizationData[] = [];
    const userMap = new Map<string, UtilizationData>();

    // Initialize data for each user
    userProfiles.forEach(profile => {
      const range = getDateRange(dateRange);
      const daysInRange = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
      const weeksInRange = daysInRange / 7;
      const availableHours = profile.hoursPerWeek * weeksInRange;

      userMap.set(profile.name, {
        name: profile.name,
        totalHoursLogged: 0,
        billableHours: 0,
        nonBillableHours: 0,
        utilizationRate: 0,
        availableHours: availableHours,
        billablePercentage: 0,
        productivityScore: 0,
        effectiveRate: 0,
        revenueGenerated: 0,
        costToFirm: 0,
        profitability: 0,
        tasksCompleted: 0,
        hourlyRate: profile.hourlyRate,
        billableRate: profile.billableRate,
        role: profile.role,
        // Overtime tracking
        overtimeHours: 0,
        overtimeCost: 0,
        overtimeEnabled: profile.overtimeEnabled,
        overtimeThreshold: profile.overtimeThreshold,
        adjustedCost: 0,
        adjustedProfitability: 0
      });
    });

    // Process timer entries
    filteredEntriesByDate.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task || !entry.duration) return;

      const userData = userMap.get(task.assignee);
      if (!userData) return;

      const hours = entry.duration / 3600; // Convert seconds to hours
      
      // Determine if billable - in production, this would be a task property
      // For now, we'll consider "completed" tasks as billable
      const isBillable = task.status === 'completed';

      userData.totalHoursLogged += hours;
      if (isBillable) {
        userData.billableHours += hours;
      } else {
        userData.nonBillableHours += hours;
      }
    });

    // Calculate completed tasks
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const range = getDateRange(dateRange);
        if (isWithinInterval(completedDate, { start: range.start, end: range.end })) {
          const userData = userMap.get(task.assignee);
          if (userData) {
            userData.tasksCompleted++;
          }
        }
      }
    });

    // Calculate derived metrics
    userMap.forEach(userData => {
      // Utilization Rate = Billable Hours / Available Hours
      userData.utilizationRate = userData.availableHours > 0 
        ? (userData.billableHours / userData.availableHours) * 100 
        : 0;

      // Billable Percentage = Billable Hours / Total Logged
      userData.billablePercentage = userData.totalHoursLogged > 0 
        ? (userData.billableHours / userData.totalHoursLogged) * 100 
        : 0;

      // Productivity Score (tasks completed per 10 hours worked)
      userData.productivityScore = userData.totalHoursLogged > 0 
        ? (userData.tasksCompleted / userData.totalHoursLogged) * 10 
        : 0;

      // Revenue Generated
      userData.revenueGenerated = userData.billableHours * userData.billableRate;

      // Cost to Firm
      userData.costToFirm = userData.totalHoursLogged * userData.hourlyRate;

      // Profitability
      userData.profitability = userData.revenueGenerated - userData.costToFirm;

      // Effective Rate
      userData.effectiveRate = userData.totalHoursLogged > 0 
        ? userData.revenueGenerated / userData.totalHoursLogged 
        : 0;

      // Overtime tracking
      if (userData.overtimeEnabled && userData.overtimeThreshold) {
        // Calculate OT hours
        userData.overtimeHours = Math.max(0, userData.totalHoursLogged - userData.overtimeThreshold);
        
        // OT cost is the additional 50% premium on OT hours
        // (OT hours are already paid at regular rate in costToFirm)
        userData.overtimeCost = userData.overtimeHours * userData.hourlyRate * 0.5;
        
        // Adjusted cost = regular cost + OT premium
        userData.adjustedCost = userData.costToFirm + userData.overtimeCost;
        
        // Adjusted profitability
        userData.adjustedProfitability = userData.revenueGenerated - userData.adjustedCost;
      } else {
        // No OT - adjusted values same as regular
        userData.adjustedCost = userData.costToFirm;
        userData.adjustedProfitability = userData.profitability;
      }
    });

    data.push(...Array.from(userMap.values()));

    // Apply filters
    let filtered = data;

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(lower) || 
        d.role.toLowerCase().includes(lower)
      );
    }

    // Billable only filter
    if (showBillableOnly) {
      filtered = filtered.filter(d => d.billableHours > 0);
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(d => d.role === selectedRole);
    }

    // Advanced filters
    if (includedUsers.length > 0) {
      filtered = filtered.filter(d => includedUsers.includes(d.name));
    }
    if (excludedUsers.length > 0) {
      filtered = filtered.filter(d => !excludedUsers.includes(d.name));
    }
    if (includedRoles.length > 0) {
      filtered = filtered.filter(d => includedRoles.includes(d.role));
    }
    if (excludedRoles.length > 0) {
      filtered = filtered.filter(d => !excludedRoles.includes(d.role));
    }

    // Team member filter
    if (selectedTeamMembers.length > 0) {
      filtered = filtered.filter(d => selectedTeamMembers.includes(d.name));
    }

    // Sort by total hours logged (descending)
    filtered.sort((a, b) => b.totalHoursLogged - a.totalHoursLogged);

    return filtered;
  }, [filteredEntriesByDate, tasks, dateRange, searchTerm, showBillableOnly, selectedRole, includedUsers, excludedUsers, includedRoles, excludedRoles, userProfiles, selectedTeamMembers]);

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const totalHours = utilizationData.reduce((sum, d) => sum + d.totalHoursLogged, 0);
    const totalBillable = utilizationData.reduce((sum, d) => sum + d.billableHours, 0);
    const totalAvailable = utilizationData.reduce((sum, d) => sum + d.availableHours, 0);
    const totalRevenue = utilizationData.reduce((sum, d) => sum + d.revenueGenerated, 0);
    const totalCost = utilizationData.reduce((sum, d) => sum + d.costToFirm, 0);
    const totalProfit = totalRevenue - totalCost;
    const avgUtilization = totalAvailable > 0 ? (totalBillable / totalAvailable) * 100 : 0;
    const avgBillablePercentage = totalHours > 0 ? (totalBillable / totalHours) * 100 : 0;

    return {
      totalHours,
      totalBillable,
      totalAvailable,
      totalRevenue,
      totalCost,
      totalProfit,
      avgUtilization,
      avgBillablePercentage,
      activeUsers: utilizationData.filter(d => d.totalHoursLogged > 0).length
    };
  }, [utilizationData]);

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

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProfitabilityColor = (profit: number) => {
    if (profit >= 5000) return 'text-emerald-600';
    if (profit >= 2000) return 'text-blue-600';
    if (profit >= 0) return 'text-amber-600';
    return 'text-red-600';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Name',
      'Role',
      'Total Hours',
      'Billable Hours',
      'Non-Billable Hours',
      'Available Hours',
      'Utilization Rate (%)',
      'Billable %',
      'Tasks Completed',
      'Productivity Score',
      'Hourly Cost',
      'Billable Rate',
      'Effective Rate',
      'Revenue Generated',
      'Cost to Firm',
      'Profitability'
    ];

    const rows = utilizationData.map(d => [
      d.name,
      d.role,
      d.totalHoursLogged.toFixed(2),
      d.billableHours.toFixed(2),
      d.nonBillableHours.toFixed(2),
      d.availableHours.toFixed(2),
      d.utilizationRate.toFixed(2),
      d.billablePercentage.toFixed(2),
      d.tasksCompleted,
      d.productivityScore.toFixed(2),
      d.hourlyRate.toFixed(2),
      d.billableRate.toFixed(2),
      d.effectiveRate.toFixed(2),
      d.revenueGenerated.toFixed(2),
      d.costToFirm.toFixed(2),
      d.profitability.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilization-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleUserClick = (userName: string) => {
    const range = getDateRange(dateRange);
    setSelectedUserName(userName);
    setSelectedWeekStart(startOfWeek(range.start, { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6">
      {selectedUserName ? (
        <UserTimeDetailView
          userName={selectedUserName}
          initialWeekStart={selectedWeekStart}
          onBack={() => {
            setSelectedUserName(null);
            // If we have a callback, call it (navigates back to payroll)
            if (onNavigateBack) {
              onNavigateBack();
            }
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-slate-900 dark:text-gray-100">Utilization & Analytics</h2>
              </div>
              <p className="text-slate-500 dark:text-gray-400">
                Track team utilization, billable hours, and profitability
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip open={showHelp} onOpenChange={setShowHelp}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-sm">
                    <div className="space-y-2">
                      <p className="text-xs">
                        <strong>Utilization Rate:</strong> Billable hours / Available hours. Target: 60-80%
                      </p>
                      <p className="text-xs">
                        <strong>Billable %:</strong> Billable hours / Total logged hours
                      </p>
                      <p className="text-xs">
                        <strong>Productivity Score:</strong> Tasks completed per 10 hours worked
                      </p>
                      <p className="text-xs">
                        <strong>Profitability:</strong> Revenue generated - Cost to firm
                      </p>
                      <p className="text-xs mt-2 text-amber-600">
                        💡 Click on a user name to view and edit their weekly hours breakdown
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" className="gap-2" onClick={exportToCSV}>
                <FileDown className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Total Hours</div>
                  <div className="text-2xl font-mono text-violet-700 dark:text-violet-400">
                    {formatHours(aggregateStats.totalHours)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-gray-500">
                    {formatHours(aggregateStats.totalBillable)} billable
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Avg Utilization</div>
                  <div className="text-2xl font-mono text-blue-700 dark:text-blue-400">
                    {formatPercentage(aggregateStats.avgUtilization)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-gray-500">
                    {formatPercentage(aggregateStats.avgBillablePercentage)} of logged
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Revenue</div>
                  <div className="text-2xl font-mono text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(aggregateStats.totalRevenue)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-gray-500">
                    {formatCurrency(aggregateStats.totalCost)} cost
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-600 dark:text-gray-400 mb-0.5">Profitability</div>
                  <div className={`text-2xl font-mono ${getProfitabilityColor(aggregateStats.totalProfit)}`}>
                    {formatCurrency(aggregateStats.totalProfit)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-gray-500">
                    {aggregateStats.activeUsers} active users
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-400 dark:text-gray-500" />
              <span className="text-sm text-slate-600 dark:text-gray-400">Filters</span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Group By */}
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger>
                    <BarChart3 className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Group by User</SelectItem>
                    <SelectItem value="team">Group by Team</SelectItem>
                    <SelectItem value="client">Group by Client</SelectItem>
                    <SelectItem value="project">Group by Project</SelectItem>
                  </SelectContent>
                </Select>

                {/* Role Filter */}
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <User className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {allRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Advanced Filters Button */}
                <Button
                  variant={showFilterPanel ? 'default' : 'outline'}
                  className={`gap-2 ${showFilterPanel ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  <Filter className="w-4 h-4" />
                  Advanced
                </Button>
              </div>

              {/* Billable Only Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-gray-700">
                <Switch
                  id="billable-only"
                  checked={showBillableOnly}
                  onCheckedChange={setShowBillableOnly}
                />
                <Label htmlFor="billable-only" className="text-sm cursor-pointer">
                  Show only users with billable hours
                </Label>
              </div>
            </div>
          </Card>

          {/* Advanced Filter Panel */}
          {showFilterPanel && (
            <TimeTrackingFilterPanel
              includedUsers={includedUsers}
              excludedUsers={excludedUsers}
              includedClients={includedClients}
              excludedClients={excludedClients}
              includedProjects={includedProjects}
              excludedProjects={excludedProjects}
              includedRoles={includedRoles}
              excludedRoles={excludedRoles}
              allUsers={allUsers}
              allClients={allClients}
              allProjects={projects.map(p => ({ id: p.id, name: p.name }))}
              allRoles={allRoles}
              onIncludedUsersChange={setIncludedUsers}
              onExcludedUsersChange={setExcludedUsers}
              onIncludedClientsChange={setIncludedClients}
              onExcludedClientsChange={setExcludedClients}
              onIncludedProjectsChange={setIncludedProjects}
              onExcludedProjectsChange={setExcludedProjects}
              onIncludedRolesChange={setIncludedRoles}
              onExcludedRolesChange={setExcludedRoles}
              onClose={() => setShowFilterPanel(false)}
              onClearAll={() => {
                setIncludedUsers([]);
                setExcludedUsers([]);
                setIncludedClients([]);
                setExcludedClients([]);
                setIncludedProjects([]);
                setExcludedProjects([]);
                setIncludedRoles([]);
                setExcludedRoles([]);
              }}
            />
          )}

          {/* Utilization Table */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm dark:text-gray-200">Utilization Report</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* Date Range Display */}
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Showing: <span className="font-medium text-violet-600 dark:text-violet-400">
                    {format(getDateRange(dateRange).start, 'MMM d, yyyy')} - {format(getDateRange(dateRange).end, 'MMM d, yyyy')}
                  </span>
                </p>
                {/* Date Range Control & User Count & Team Member Selector */}
                <div className="flex items-center gap-2">
                  {/* Client Breakdown Button */}
                  <Button 
                    variant={showClientBreakdown ? "default" : "outline"}
                    onClick={() => setShowClientBreakdown(!showClientBreakdown)}
                    className={`gap-2 ${showClientBreakdown ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  >
                    <Users className="w-4 h-4" />
                    {showClientBreakdown ? 'Back to Summary' : 'View Client Breakdown'}
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
                                setSelectedTeamMembers(allTeamMembersFromMatrix);
                              } else if (value === 'none') {
                                setSelectedTeamMembers([]);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px] gap-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">
                                  {selectedTeamMembers.length === allTeamMembersFromMatrix.length 
                                    ? 'All Members' 
                                    : selectedTeamMembers.length === 0
                                    ? 'No Members'
                                    : `${selectedTeamMembers.length} Selected`}
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
                                    onClick={() => setSelectedTeamMembers(allTeamMembersFromMatrix)}
                                  >
                                    Select All
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setSelectedTeamMembers([])}
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <div className="border-t pt-1">
                                  {allTeamMembersFromMatrix.map((member) => (
                                    <div
                                      key={member}
                                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                      onClick={() => {
                                        setSelectedTeamMembers(prev =>
                                          prev.includes(member)
                                            ? prev.filter(m => m !== member)
                                            : [...prev, member]
                                        );
                                      }}
                                    >
                                      <Checkbox
                                        checked={selectedTeamMembers.includes(member)}
                                        onCheckedChange={(checked) => {
                                          setSelectedTeamMembers(prev =>
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
                          {selectedTeamMembers.length > 0 && selectedTeamMembers.length < allTeamMembersFromMatrix.length && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-violet-500 text-white text-xs">
                              {selectedTeamMembers.length}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Filter by team members
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                    <SelectTrigger className="w-[160px]">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">{utilizationData.length} users</Badge>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              {showClientBreakdown ? (
                /* Client Hours Breakdown */
                clientHoursMatrix.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No client hours data found</p>
                    <p className="text-sm mt-1">Try adjusting your date range</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-gray-800 border-b-2 border-slate-300 dark:border-gray-600">
                        <tr>
                          <th className="text-left p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-slate-50 dark:bg-gray-800 z-10">Client</th>
                          {allTeamMembersFromMatrix.map(member => (
                            <th key={member} className="text-center p-3 font-medium text-slate-700 dark:text-gray-300 min-w-[100px]">
                              {member}
                            </th>
                          ))}
                          <th className="text-center p-3 font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 sticky right-0 z-10">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientHoursMatrix.map((client, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800">
                            <td className="p-3 font-medium text-slate-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">{client.clientName}</td>
                            {allTeamMembersFromMatrix.map(member => {
                              const hours = client.hours[member] || 0;
                              return (
                                <td key={member} className="text-center p-3 font-mono text-slate-600 dark:text-gray-400">
                                  {hours > 0 ? formatHours(hours) : '—'}
                                </td>
                              );
                            })}
                            <td className="text-center p-3 font-mono text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 sticky right-0">
                              {formatHours(client.totalHours)}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Total Row */}
                        <tr className="border-t-2 border-slate-300 dark:border-gray-600 bg-violet-50 dark:bg-violet-950 font-medium">
                          <td className="p-3 text-slate-700 dark:text-gray-300 sticky left-0 bg-violet-50 dark:bg-violet-950 z-10">TOTAL</td>
                          {allTeamMembersFromMatrix.map(member => {
                            const memberTotal = clientHoursMatrix.reduce((sum, client) => 
                              sum + (client.hours[member] || 0), 0
                            );
                            return (
                              <td key={member} className="text-center p-3 font-mono text-violet-700 dark:text-violet-400">
                                {formatHours(memberTotal)}
                              </td>
                            );
                          })}
                          <td className="text-center p-3 font-mono text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900 sticky right-0 z-10 text-lg">
                            {formatHours(aggregateStats.totalHours)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Utilization Table */
                utilizationData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No utilization data found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or date range</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-3 sticky left-0 bg-slate-50 dark:bg-gray-800 z-10 dark:text-gray-300">Name</th>
                        <th className="text-left p-3 dark:text-gray-300">Role</th>
                        <th className="text-right p-3 dark:text-gray-300">Total Hours</th>
                        <th className="text-right p-3 dark:text-gray-300">Billable</th>
                        <th className="text-right p-3 dark:text-gray-300">Non-Billable</th>
                        <th className="text-right p-3 dark:text-gray-300">Available</th>
                        <th className="text-right p-3 dark:text-gray-300">Utilization</th>
                        <th className="text-right p-3 dark:text-gray-300">Billable %</th>
                        <th className="text-right p-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                OT Hours
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Overtime hours beyond threshold</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                        <th className="text-right p-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                OT Cost
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Additional OT premium cost</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                        <th className="text-right p-3">Tasks</th>
                        <th className="text-right p-3">Productivity</th>
                        <th className="text-right p-3">Effective Rate</th>
                        <th className="text-right p-3">Revenue</th>
                        <th className="text-right p-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                Adjusted Cost
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Total cost including OT premium</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                        <th className="text-right p-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                Adjusted Profit
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Profit after OT costs</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilizationData.map((user, index) => (
                        <tr 
                          key={user.name}
                          className="border-b border-slate-100 dark:border-gray-700 hover:bg-violet-50/30 dark:hover:bg-violet-950/30 transition-colors cursor-pointer"
                          onClick={() => {
                            const range = getDateRange(dateRange);
                            setSelectedUserName(user.name);
                            setSelectedWeekStart(startOfWeek(range.start, { weekStartsOn: 1 }));
                          }}
                        >
                          <td className="p-3 sticky left-0 bg-white dark:bg-gray-900 z-10">
                            <div className="flex items-center gap-2">
                              {user.name === 'Emily Brown' ? (
                                <img 
                                  src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2MzYzODk5OHww&ixlib=rb-4.1.0&q=80&w=1080"
                                  alt="Emily Brown"
                                  className="w-8 h-8 rounded-full object-cover border-2 border-violet-200 dark:border-violet-700 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-xs text-violet-700 dark:text-violet-400 shrink-0">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <span className="font-medium dark:text-gray-200">{user.name}</span>
                              {user.overtimeEnabled && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400">
                                  OT
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-mono dark:text-gray-300">{formatHours(user.totalHoursLogged)}</td>
                          <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatHours(user.billableHours)}</td>
                          <td className="p-3 text-right font-mono text-slate-500 dark:text-gray-500">{formatHours(user.nonBillableHours)}</td>
                          <td className="p-3 text-right font-mono text-slate-400 dark:text-gray-600">{formatHours(user.availableHours)}</td>
                          <td className="p-3 text-right">
                            <span className={`font-mono font-medium ${getUtilizationColor(user.utilizationRate)}`}>
                              {formatPercentage(user.utilizationRate)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono dark:text-gray-300">{formatPercentage(user.billablePercentage)}</td>
                          <td className="p-3 text-right">
                            {user.overtimeEnabled && user.overtimeHours > 0 ? (
                              <span className="font-mono text-blue-600 dark:text-blue-400">{formatHours(user.overtimeHours)}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-gray-600">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {user.overtimeEnabled && user.overtimeCost > 0 ? (
                              <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(user.overtimeCost)}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-gray-600">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono dark:text-gray-300">{user.tasksCompleted}</td>
                          <td className="p-3 text-right font-mono dark:text-gray-300">{user.productivityScore.toFixed(1)}</td>
                          <td className="p-3 text-right font-mono dark:text-gray-300">{formatCurrency(user.effectiveRate)}</td>
                          <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(user.revenueGenerated)}</td>
                          <td className="p-3 text-right">
                            {user.overtimeEnabled ? (
                              <span className="font-mono text-red-600 dark:text-red-400">{formatCurrency(user.adjustedCost)}</span>
                            ) : (
                              <span className="font-mono text-slate-500 dark:text-gray-500">{formatCurrency(user.costToFirm)}</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <span className={`font-mono font-medium ${getProfitabilityColor(user.overtimeEnabled ? user.adjustedProfitability : user.profitability)}`}>
                              {formatCurrency(user.overtimeEnabled ? user.adjustedProfitability : user.profitability)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )
              )}
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}