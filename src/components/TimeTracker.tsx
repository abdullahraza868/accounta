import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Clock, Play, Pause, Plus, Edit2, Trash2, Check, X, DollarSign, TrendingUp, AlertCircle, Receipt, Upload, Users, BarChart3, Calendar as CalendarIcon, Target, ChevronDown, ChevronUp, CheckCircle, User, Settings, FileImage } from 'lucide-react';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Avatar, AvatarFallback } from './ui/avatar';

interface TimeEntry {
  id: string;
  taskName: string;
  description: string;
  date: string;
  duration: number; // in minutes
  hourlyRate: number;
  billable: boolean;
  isRunning?: boolean;
  user?: string; // User who logged the time
}

interface Expense {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  billable: boolean;
  receipt?: string;
}

interface TimeTrackerProps {
  projectId: string;
  projectName: string;
}

export function TimeTracker({ projectId, projectName }: TimeTrackerProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      taskName: 'Design mockups',
      description: 'Created initial wireframes and mockups',
      date: '2024-11-05',
      duration: 120,
      hourlyRate: 75,
      billable: true,
      user: 'Sarah Johnson',
    },
    {
      id: '2',
      taskName: 'Client meeting',
      description: 'Requirements gathering session',
      date: '2024-11-04',
      duration: 60,
      hourlyRate: 75,
      billable: true,
      user: 'Mike Brown',
    },
    {
      id: '3',
      taskName: 'Research',
      description: 'Competitor analysis',
      date: '2024-11-03',
      duration: 90,
      hourlyRate: 75,
      billable: false,
      user: 'You',
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimeEntry>>({});
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  
  // Budget tracking (optional)
  const [projectBudget, setProjectBudget] = useState<number | null>(5000); // null means no budget set
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [expenseBudgetHandling, setExpenseBudgetHandling] = useState<'include-total' | 'exclude-total'>('include-total');
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  
  // Mock team members list
  const teamMembers = ['Sarah Johnson', 'Mike Brown', 'You', 'Emily Davis', 'Alex Wilson'];
  
  // Expenses tracking
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Adobe Creative Cloud Subscription',
      category: 'Software',
      date: '2024-11-05',
      amount: 54.99,
      billable: true,
    },
    {
      id: '2',
      description: 'Stock photos from Unsplash',
      category: 'Materials',
      date: '2024-11-03',
      amount: 29.00,
      billable: true,
    },
  ]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseForm, setEditExpenseForm] = useState<Partial<Expense>>({});
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const calculateTotal = (entry: TimeEntry) => {
    const hours = entry.duration / 60;
    return hours * entry.hourlyRate;
  };

  const totalBillable = entries
    .filter(e => e.billable)
    .reduce((sum, e) => sum + calculateTotal(e), 0);

  const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);
  
  // Calculate billable and non-billable hours
  const billableHours = entries
    .filter(e => e.billable)
    .reduce((sum, e) => sum + e.duration, 0);
  
  const nonBillableHours = entries
    .filter(e => !e.billable)
    .reduce((sum, e) => sum + e.duration, 0);
  
  // Calculate average hourly rate
  const billableEntries = entries.filter(e => e.billable);
  const averageRate = billableEntries.length > 0
    ? billableEntries.reduce((sum, e) => sum + e.hourlyRate, 0) / billableEntries.length
    : 0;
  
  // Calculate billable percentage
  const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
  
  // Calculate total expenses (billable and non-billable)
  const totalBillableExpenses = expenses
    .filter(e => e.billable)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalNonBillableExpenses = expenses
    .filter(e => !e.billable)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalAllExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate total project cost based on expense handling setting
  const getTotalProjectCost = () => {
    if (expenseBudgetHandling === 'include-total') {
      return totalBillable + totalBillableExpenses;
    } else {
      // exclude-total: expenses not included in budget calculations
      return totalBillable;
    }
  };
  
  const totalProjectCost = getTotalProjectCost();
  
  // Budget calculations
  const budgetWithExpenses = projectBudget ? projectBudget : null;
  const budgetPercentageWithExpenses = budgetWithExpenses 
    ? ((totalProjectCost / budgetWithExpenses) * 100) 
    : 0;
  const budgetRemainingWithExpenses = budgetWithExpenses 
    ? budgetWithExpenses - totalProjectCost 
    : 0;
  const isBudgetOverrunWithExpenses = budgetWithExpenses 
    ? totalProjectCost > budgetWithExpenses 
    : false;
  
  // Time breakdown by task
  const timeByTask = entries.reduce((acc, entry) => {
    if (!acc[entry.taskName]) {
      acc[entry.taskName] = {
        taskName: entry.taskName,
        totalDuration: 0,
        billableDuration: 0,
        nonBillableDuration: 0,
        totalAmount: 0,
        entries: []
      };
    }
    acc[entry.taskName].totalDuration += entry.duration;
    if (entry.billable) {
      acc[entry.taskName].billableDuration += entry.duration;
      acc[entry.taskName].totalAmount += calculateTotal(entry);
    } else {
      acc[entry.taskName].nonBillableDuration += entry.duration;
    }
    acc[entry.taskName].entries.push(entry);
    return acc;
  }, {} as Record<string, {
    taskName: string;
    totalDuration: number;
    billableDuration: number;
    nonBillableDuration: number;
    totalAmount: number;
    entries: TimeEntry[];
  }>);
  
  // Time breakdown by user (mock - in real app, entries would have user info)
  // For now, we'll create a mock breakdown
  const timeByUser = [
    { userName: 'Sarah Johnson', billableHours: billableHours * 0.4, nonBillableHours: nonBillableHours * 0.3, totalAmount: totalBillable * 0.4 },
    { userName: 'Mike Brown', billableHours: billableHours * 0.35, nonBillableHours: nonBillableHours * 0.4, totalAmount: totalBillable * 0.35 },
    { userName: 'You', billableHours: billableHours * 0.25, nonBillableHours: nonBillableHours * 0.3, totalAmount: totalBillable * 0.25 },
  ];

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId) {
      setEntries(entries.map(e => 
        e.id === editingId ? { ...e, ...editForm } : e
      ));
      cancelEdit();
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };
  
  const toggleBillableStatus = (id: string) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, billable: !e.billable } : e
    ));
  };

  const addNewEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries([newEntry, ...entries]);
    setNewEntryOpen(false);
  };
  
  // Budget functions
  const budgetPercentage = projectBudget ? (totalBillable / projectBudget) * 100 : 0;
  const budgetRemaining = projectBudget ? projectBudget - totalBillable : 0;
  const isBudgetOverrun = projectBudget ? totalBillable > projectBudget : false;
  
  const handleSaveBudget = () => {
    const value = parseFloat(budgetInput);
    if (!isNaN(value) && value > 0) {
      setProjectBudget(value);
    } else if (budgetInput === '') {
      setProjectBudget(null);
    }
    setIsEditingBudget(false);
    setBudgetInput('');
  };
  
  const handleEditBudget = () => {
    setBudgetInput(projectBudget?.toString() || '');
    setIsEditingBudget(true);
  };
  
  const handleRemoveBudget = () => {
    setProjectBudget(null);
    setIsEditingBudget(false);
    setBudgetInput('');
  };
  
  // Expense functions
  const totalExpenses = expenses
    .filter(e => e.billable)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const startExpenseEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditExpenseForm(expense);
  };
  
  const cancelExpenseEdit = () => {
    setEditingExpenseId(null);
    setEditExpenseForm({});
  };
  
  const saveExpenseEdit = () => {
    if (editingExpenseId) {
      setExpenses(expenses.map(e => 
        e.id === editingExpenseId ? { ...e, ...editExpenseForm } : e
      ));
      cancelExpenseEdit();
    }
  };
  
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };
  
  const addNewExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
    setNewExpenseOpen(false);
  };

  const [showTimeBreakdowns, setShowTimeBreakdowns] = useState(true);
  const [showTaskBreakdown, setShowTaskBreakdown] = useState(true);
  const [showUserBreakdown, setShowUserBreakdown] = useState(true);

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Dashboard */}
            <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          Summary Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Billable Time */}
          <Card className="p-5 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Billable Time</p>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{formatDuration(billableHours)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {billablePercentage.toFixed(1)}% of total time
            </p>
          </Card>

          {/* Total Non-Billable Time */}
          <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Non-Billable Time</p>
              <Clock className="w-5 h-5 text-blue-600" />
          </div>
            <p className="text-3xl font-bold text-blue-700">{formatDuration(nonBillableHours)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {((100 - billablePercentage).toFixed(1))}% of total time
            </p>
        </Card>

          {/* Total Billable Amount */}
          <Card className="p-5 border-l-4 border-l-violet-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Billable Amount</p>
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-3xl font-bold text-violet-700">${totalBillable.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Avg rate: ${averageRate.toFixed(2)}/hr
            </p>
        </Card>

          {/* Total Expenses */}
          <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Expenses</p>
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-700">${totalAllExpenses.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </p>
        </Card>
        </div>
      </div>

      {/* Enhanced Budget Tracking Section */}
      {(projectBudget !== null || isEditingBudget) && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Budget Overview
          </h2>
          <Card className={`p-6 border-2 ${
            isBudgetOverrunWithExpenses ? 'border-red-400 bg-red-50/50 shadow-lg' : 
            budgetPercentageWithExpenses > 80 ? 'border-amber-400 bg-amber-50/50 shadow-md' : 
            'border-green-400 bg-green-50/50'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isBudgetOverrunWithExpenses ? 'bg-red-100' : 
                  budgetPercentageWithExpenses > 80 ? 'bg-amber-100' : 
                  'bg-green-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    isBudgetOverrunWithExpenses ? 'text-red-600' : 
                    budgetPercentageWithExpenses > 80 ? 'text-amber-600' : 
                'text-green-600'
              }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Project Budget</h3>
                  <p className="text-sm text-slate-600">Time + Expenses tracking</p>
                </div>
                {isBudgetOverrunWithExpenses && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Over Budget
                </Badge>
              )}
                {!isBudgetOverrunWithExpenses && budgetPercentageWithExpenses > 80 && (
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Approaching Limit
                </Badge>
              )}
                {!isBudgetOverrunWithExpenses && budgetPercentageWithExpenses <= 80 && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    On Track
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditingBudget && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditBudget}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Budget
                  </Button>
                  <Dialog open={showBudgetSettings} onOpenChange={setShowBudgetSettings}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Budget Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Budget Settings</DialogTitle>
                        <DialogDescription>
                          Configure how expenses are handled in budget calculations
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <RadioGroup value={expenseBudgetHandling} onValueChange={(value) => setExpenseBudgetHandling(value as 'include-total' | 'exclude-total')}>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                              <RadioGroupItem value="include-total" id="include-total" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="include-total" className="font-medium cursor-pointer">
                                  Include in total budget
                                </Label>
                                <p className="text-xs text-slate-500 mt-1">
                                  Expenses are added to total budget, remaining budget, and all budget calculations. Both time and expenses reduce the budget.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                              <RadioGroupItem value="exclude-total" id="exclude-total" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="exclude-total" className="font-medium cursor-pointer">
                                  Exclude from total budget
                                </Label>
                                <p className="text-xs text-slate-500 mt-1">
                                  Expenses are not included in budget calculations (total budget, remaining budget, etc.). Expenses will still appear in stats cards and expense tables for tracking purposes.
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowBudgetSettings(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveBudget}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isEditingBudget ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="budget">Budget Amount ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Enter budget amount"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleSaveBudget}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingBudget(false);
                  setBudgetInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
              <div className="space-y-6">
                {/* Budget Breakdown */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-slate-900">${budgetWithExpenses?.toFixed(2)}</p>
                </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Time Spent</p>
                    <p className="text-2xl font-bold text-violet-700">${totalBillable.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDuration(billableHours)}</p>
                </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Expenses</p>
                    <p className="text-2xl font-bold text-amber-700">
                      ${totalBillableExpenses.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {expenseBudgetHandling === 'exclude-total' 
                        ? `${expenses.filter(e => e.billable).length} items (excluded from budget)` 
                        : `${expenses.filter(e => e.billable).length} items`}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${
                    isBudgetOverrunWithExpenses 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${
                      isBudgetOverrunWithExpenses ? 'text-red-600' : 'text-green-700'
                    }`}>
                      ${Math.abs(budgetRemainingWithExpenses).toFixed(2)}
                    </p>
                    {isBudgetOverrunWithExpenses && (
                      <p className="text-xs text-red-600 mt-1">Over by ${Math.abs(budgetRemainingWithExpenses).toFixed(2)}</p>
                    )}
                </div>
              </div>
              
                {/* Budget Progress Bar */}
              <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">Budget Utilization</span>
                      <Badge className={
                        isBudgetOverrunWithExpenses 
                          ? 'bg-red-100 text-red-700 border-red-300' 
                          : budgetPercentageWithExpenses > 80 
                          ? 'bg-amber-100 text-amber-700 border-amber-300' 
                          : 'bg-green-100 text-green-700 border-green-300'
                      }>
                        {budgetPercentageWithExpenses.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">
                      ${totalProjectCost.toFixed(2)} of ${budgetWithExpenses?.toFixed(2)}
                  </span>
                </div>
                <Progress 
                    value={Math.min(budgetPercentageWithExpenses, 100)} 
                    className={`h-4 ${
                      isBudgetOverrunWithExpenses ? '[&>div]:bg-red-600' : 
                      budgetPercentageWithExpenses > 80 ? '[&>div]:bg-amber-600' : 
                    '[&>div]:bg-green-600'
                  }`}
                />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Time: ${totalBillable.toFixed(2)}</span>
                    {expenseBudgetHandling === 'include-total' && (
                      <>
                        <span>•</span>
                        <span>Expenses: ${totalBillableExpenses.toFixed(2)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Total: ${totalProjectCost.toFixed(2)}</span>
                    {expenseBudgetHandling === 'exclude-total' && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600">Expenses: ${totalBillableExpenses.toFixed(2)} (excluded)</span>
                      </>
                    )}
                  </div>
              </div>
            </div>
          )}
        </Card>
        </div>
      )}
      
      {/* Add Budget Button (when no budget set) */}
      {projectBudget === null && !isEditingBudget && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Budget Overview
          </h2>
          <Card className="p-6 border-dashed border-2 border-slate-300 bg-slate-50/50 hover:border-violet-400 transition-colors">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Track your project against a budget</p>
                  <p className="text-xs text-slate-500 mt-0.5">Monitor spending and stay on track (optional)</p>
                </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingBudget(true)}
                className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
            >
              <Plus className="w-4 h-4" />
              Set Budget
            </Button>
          </div>
        </Card>
        </div>
      )}

      {/* Time Breakdowns Section */}
      {entries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Time Breakdowns
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeBreakdowns(!showTimeBreakdowns)}
              className="gap-2"
            >
              {showTimeBreakdowns ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Breakdowns
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Breakdowns
                </>
              )}
            </Button>
          </div>

          {showTimeBreakdowns && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By User/Team Member */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    By Team Member
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserBreakdown(!showUserBreakdown)}
                    className="h-6 w-6 p-0"
                  >
                    {showUserBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                </div>
                {showUserBreakdown && (
                  <div className="space-y-3">
                    {timeByUser.map((user, idx) => {
                      const userTotalHours = user.billableHours + user.nonBillableHours;
                      const userBillablePercentage = userTotalHours > 0 
                        ? (user.billableHours / userTotalHours) * 100 
                        : 0;
                      return (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{user.userName}</span>
                            <span className="text-sm font-semibold text-violet-700">
                              ${user.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Billable:</span>
                              <span className="font-medium text-green-700">
                                {formatDuration(user.billableHours)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Non-billable:</span>
                              <span className="font-medium text-blue-700">
                                {formatDuration(user.nonBillableHours)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Billable %</span>
                                <span className="text-xs font-medium text-slate-700">
                                  {userBillablePercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${userBillablePercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* By Task */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    By Task
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTaskBreakdown(!showTaskBreakdown)}
                    className="h-6 w-6 p-0"
                  >
                    {showTaskBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                </div>
                {showTaskBreakdown && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.values(timeByTask).map((task, idx) => {
                      const taskBillablePercentage = task.totalDuration > 0
                        ? (task.billableDuration / task.totalDuration) * 100
                        : 0;
                      return (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{task.taskName}</span>
                            <span className="text-sm font-semibold text-violet-700">
                              ${task.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Total Time:</span>
                              <span className="font-medium text-slate-700">
                                {formatDuration(task.totalDuration)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Billable:</span>
                              <span className="font-medium text-green-700">
                                {formatDuration(task.billableDuration)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Non-billable:</span>
                              <span className="font-medium text-blue-700">
                                {formatDuration(task.nonBillableDuration)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Billable %</span>
                                <span className="text-xs font-medium text-slate-700">
                                  {taskBillablePercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${taskBillablePercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Time Entries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Time Entries
          </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => alert('Invoice generation would happen here')}
          >
            <DollarSign className="w-4 h-4" />
            Generate Invoice
          </Button>
          <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4" />
                Add Time Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>Record time spent on a task</DialogDescription>
              </DialogHeader>
              <NewEntryForm onSubmit={addNewEntry} onCancel={() => setNewEntryOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Time Entries Table */}
        <Card className="overflow-hidden">
        <Table>
          <TableHeader>
              <TableRow className="bg-slate-50">
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                {editingId === entry.id ? (
                  <>
                    <TableCell>
                      <Input
                        type="date"
                        value={editForm.date || ''}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editForm.user || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, user: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="User" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.taskName || ''}
                        onChange={(e) => setEditForm({ ...editForm, taskName: e.target.value })}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.duration || 0}
                        onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className={!editForm.billable ? 'opacity-50 text-slate-400' : ''}>
                      <Input
                        type="number"
                        value={editForm.hourlyRate || 0}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className={!editForm.billable ? 'opacity-50 text-slate-400' : ''}>
                      ${((editForm.duration || 0) / 60 * (editForm.hourlyRate || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editForm.billable ? 'billable' : 'non-billable'}
                        onValueChange={(value) => setEditForm({ ...editForm, billable: value === 'billable' })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billable">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Billable</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="non-billable">
                            <div className="flex items-center gap-2">
                              <X className="w-4 h-4 text-slate-500" />
                              <span>Non-billable</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={saveEdit}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-700"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-sm text-slate-600">{entry.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                            {entry.user ? entry.user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-700">{entry.user || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.taskName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{entry.description}</TableCell>
                    <TableCell className="text-sm">{formatDuration(entry.duration)}</TableCell>
                    <TableCell className={`text-sm ${!entry.billable ? 'opacity-50 text-slate-400' : ''}`}>
                      ${entry.hourlyRate}/hr
                    </TableCell>
                    <TableCell className={`text-sm ${!entry.billable ? 'opacity-50 text-slate-400' : ''}`}>
                      ${calculateTotal(entry).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleBillableStatus(entry.id)}
                        className="cursor-pointer"
                      >
                        {entry.billable ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer">
                            <CheckCircle className="w-3 h-3 mr-1 inline" />
                            Billable
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                            <X className="w-3 h-3 mr-1 inline" />
                            Non-billable
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(entry)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
            {/* Total Row */}
            <tfoot>
              <TableRow className="bg-violet-50/50 border-t-2 border-violet-200 font-semibold">
                <TableCell colSpan={4} className="text-sm font-semibold text-slate-900">
                  Total
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  {formatDuration(billableHours)}
                  <div className="text-xs font-normal text-slate-600 mt-0.5">
                    Billable: {formatDuration(billableHours)} • Non-billable: {formatDuration(nonBillableHours)}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  ${averageRate.toFixed(2)}/hr
                  <div className="text-xs font-normal text-slate-600 mt-0.5">Average</div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-violet-700">
                  ${totalBillable.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                      {entries.filter(e => e.billable).length} Billable
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {entries.filter(e => !e.billable).length} Non-billable
                    </Badge>
                  </div>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </tfoot>
        </Table>
      </Card>
      </div>
      
      {/* Expenses Section */}
        <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-violet-600" />
              Expenses & Reimbursements
            </h2>
          <p className="text-sm text-slate-500 mt-1">Track additional project expenses for invoicing</p>
        </div>
        <Dialog open={newExpenseOpen} onOpenChange={setNewExpenseOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Record an expense for this project</DialogDescription>
            </DialogHeader>
            <ExpenseForm onSubmit={addNewExpense} onCancel={() => setNewExpenseOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

        {/* Expenses Table */}
        <Card className="overflow-hidden">
        <Table>
          <TableHeader>
              <TableRow className="bg-slate-50">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No expenses recorded yet</p>
                  <p className="text-sm mt-1">Add expenses like software, materials, or travel costs</p>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  {editingExpenseId === expense.id ? (
                    <>
                      <TableCell>
                        <Input
                          type="date"
                          value={editExpenseForm.date || ''}
                          onChange={(e) => setEditExpenseForm({ ...editExpenseForm, date: e.target.value })}
                          className="w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editExpenseForm.description || ''}
                          onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editExpenseForm.category || ''}
                          onValueChange={(value) => setEditExpenseForm({ ...editExpenseForm, category: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="Materials">Materials</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={editExpenseForm.amount || 0}
                          onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: parseFloat(e.target.value) })}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editExpenseForm.billable ? 'billable' : 'non-billable'}
                          onValueChange={(value) => setEditExpenseForm({ ...editExpenseForm, billable: value === 'billable' })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="billable">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Billable</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="non-billable">
                              <div className="flex items-center gap-2">
                                <X className="w-4 h-4 text-slate-500" />
                                <span>Non-billable</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">-</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={saveExpenseEdit}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-slate-700"
                            onClick={cancelExpenseEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-sm text-slate-600">{expense.date}</TableCell>
                      <TableCell className="text-sm">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {expense.billable ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Billable</Badge>
                        ) : (
                          <Badge variant="secondary">Non-billable</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.receipt ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
                            <Receipt className="w-3 h-3" />
                            View
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-slate-400">
                            <Upload className="w-3 h-3" />
                            Add
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startExpenseEdit(expense)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
            {/* Expenses Total Row */}
      {expenses.length > 0 && (
              <tfoot>
                <TableRow className="bg-amber-50/50 border-t-2 border-amber-200 font-semibold">
                  <TableCell colSpan={3} className="text-sm font-semibold text-slate-900">
                    Total
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-900">
                    ${totalBillableExpenses.toFixed(2)}
                    <div className="text-xs font-normal text-slate-600 mt-0.5">
                      Billable: ${totalBillableExpenses.toFixed(2)} • Non-billable: ${totalNonBillableExpenses.toFixed(2)}
            </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                        {expenses.filter(e => e.billable).length} Billable
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {expenses.filter(e => !e.billable).length} Non-billable
                      </Badge>
          </div>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}

function NewEntryForm({ onSubmit, onCancel }: { onSubmit: (entry: Omit<TimeEntry, 'id'>) => void; onCancel: () => void }) {
  const teamMembers = ['Sarah Johnson', 'Mike Brown', 'You', 'Emily Davis', 'Alex Wilson'];
  
  const [form, setForm] = useState<Omit<TimeEntry, 'id'>>({
    taskName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    hourlyRate: 75,
    billable: true,
    user: 'You', // Default to current user
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="taskName">Task Name</Label>
        <Input
          id="taskName"
          value={form.taskName}
          onChange={(e) => setForm({ ...form, taskName: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user">User</Label>
        <Select
          value={form.user || 'You'}
          onValueChange={(value) => setForm({ ...form, user: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member} value={member}>
                {member}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billable">Billable</Label>
          <div className="flex items-center h-10">
            <input
              id="billable"
              type="checkbox"
              checked={form.billable}
              onChange={(e) => setForm({ ...form, billable: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="billable" className="ml-2 text-sm text-slate-600">
              Bill this time to client
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
          Add Entry
        </Button>
      </div>
    </form>
  );
}

function ExpenseForm({ onSubmit, onCancel }: { onSubmit: (expense: Omit<Expense, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Expense, 'id'>>({
    description: '',
    category: 'Software',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    billable: true,
    receipt: undefined,
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      // In a real app, you would upload the file and get a URL
      // For now, we'll store the filename
      setForm({ ...form, receipt: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Materials">Materials</SelectItem>
              <SelectItem value="Travel">Travel</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billable">Billable</Label>
          <div className="flex items-center h-10">
            <input
              id="billable"
              type="checkbox"
              checked={form.billable}
              onChange={(e) => setForm({ ...form, billable: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="billable" className="ml-2 text-sm text-slate-600">
              Bill this expense to client
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt</Label>
        <div className="flex items-center gap-2">
          <Input
            id="receipt"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="flex-1"
          />
          {receiptFile && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileImage className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{receiptFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReceiptFile(null);
                  setForm({ ...form, receipt: undefined });
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">Upload receipt image (JPG, PNG) or PDF</p>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
          Add Expense
        </Button>
      </div>
    </form>
  );
}