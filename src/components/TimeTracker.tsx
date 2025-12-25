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
import { Clock, Play, Pause, Plus, Edit2, Trash2, Check, X, DollarSign, TrendingUp, AlertCircle, Receipt, Upload } from 'lucide-react';
import { Separator } from './ui/separator';

interface TimeEntry {
  id: string;
  taskName: string;
  description: string;
  date: string;
  duration: number; // in minutes
  hourlyRate: number;
  billable: boolean;
  isRunning?: boolean;
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
    },
    {
      id: '2',
      taskName: 'Client meeting',
      description: 'Requirements gathering session',
      date: '2024-11-04',
      duration: 60,
      hourlyRate: 75,
      billable: true,
    },
    {
      id: '3',
      taskName: 'Research',
      description: 'Competitor analysis',
      date: '2024-11-03',
      duration: 90,
      hourlyRate: 75,
      billable: false,
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
    const mins = minutes % 60;
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

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Hours</p>
              <p className="text-2xl mt-1">{formatDuration(totalHours)}</p>
            </div>
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Billable Amount</p>
              <p className="text-2xl mt-1">${totalBillable.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-slate-300" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Entries</p>
              <p className="text-2xl mt-1">{entries.length}</p>
            </div>
            <div className="w-8 h-8 rounded bg-violet-100 flex items-center justify-center text-violet-600">
              {entries.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Tracking (Optional) */}
      {(projectBudget !== null || isEditingBudget) && (
        <Card className={`p-6 ${ 
          isBudgetOverrun ? 'border-red-300 bg-red-50' : 
          budgetPercentage > 80 ? 'border-amber-300 bg-amber-50' : 
          'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${ 
                isBudgetOverrun ? 'text-red-600' : 
                budgetPercentage > 80 ? 'text-amber-600' : 
                'text-green-600'
              }`} />
              <h3 className="text-slate-900">Project Budget</h3>
              {isBudgetOverrun && (
                <Badge className="bg-red-600 hover:bg-red-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Over Budget
                </Badge>
              )}
              {!isBudgetOverrun && budgetPercentage > 80 && (
                <Badge className="bg-amber-600 hover:bg-amber-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Approaching Limit
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
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Budget</p>
                  <p className="text-2xl mt-1">${projectBudget?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Spent</p>
                  <p className="text-2xl mt-1">${totalBillable.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Remaining</p>
                  <p className={`text-2xl mt-1 ${isBudgetOverrun ? 'text-red-600' : ''}`}>
                    ${budgetRemaining.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Budget Used</span>
                  <span className={`text-sm font-medium ${
                    isBudgetOverrun ? 'text-red-600' : 
                    budgetPercentage > 80 ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
                    {budgetPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(budgetPercentage, 100)} 
                  className={`h-3 ${
                    isBudgetOverrun ? '[&>div]:bg-red-600' : 
                    budgetPercentage > 80 ? '[&>div]:bg-amber-600' : 
                    '[&>div]:bg-green-600'
                  }`}
                />
              </div>
            </div>
          )}
        </Card>
      )}
      
      {/* Add Budget Button (when no budget set) */}
      {projectBudget === null && !isEditingBudget && (
        <Card className="p-4 border-dashed border-2 border-slate-300 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <p className="text-sm text-slate-600">Track your project against a budget (optional)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingBudget(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Set Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900">Time Entries</h3>
        
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
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
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
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.hourlyRate || 0}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      ${((editForm.duration || 0) / 60 * (editForm.hourlyRate || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={editForm.billable || false}
                        onChange={(e) => setEditForm({ ...editForm, billable: e.target.checked })}
                        className="w-4 h-4"
                      />
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
                    <TableCell className="text-sm">{entry.taskName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{entry.description}</TableCell>
                    <TableCell className="text-sm">{formatDuration(entry.duration)}</TableCell>
                    <TableCell className="text-sm">${entry.hourlyRate}/hr</TableCell>
                    <TableCell className="text-sm">${calculateTotal(entry).toFixed(2)}</TableCell>
                    <TableCell>
                      {entry.billable ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Billable</Badge>
                      ) : (
                        <Badge variant="secondary">Non-billable</Badge>
                      )}
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
        </Table>
      </Card>
      
      {/* Divider */}
      <Separator className="my-8" />
      
      {/* Other Expenses Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900">Other Expenses/Reimbursements</h3>
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

      {/*  Expenses Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
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
                        <input
                          type="checkbox"
                          checked={editExpenseForm.billable || false}
                          onChange={(e) => setEditExpenseForm({ ...editExpenseForm, billable: e.target.checked })}
                          className="w-4 h-4"
                        />
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
        </Table>
      </Card>
      
      {/* Expenses Summary */}
      {expenses.length > 0 && (
        <Card className="p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-600">Total Billable Expenses:</span>
            </div>
            <span className="text-lg font-medium text-slate-900">${totalExpenses.toFixed(2)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

function NewEntryForm({ onSubmit, onCancel }: { onSubmit: (entry: Omit<TimeEntry, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<TimeEntry, 'id'>>({
    taskName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    hourlyRate: 75,
    billable: true,
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
  });

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