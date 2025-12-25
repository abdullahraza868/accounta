import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Clock, FileText, GripVertical, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { IntegrationStatusMonitor, type IntegrationIssue } from '../IntegrationStatusMonitor';

type CardId = 'integrationStatus' | 'taskOverview' | 'invoices' | 'signedDocs' | 'inbox' | 
              'projectTask' | 'calendar' | 'documents' | 'leads' |
              'myTasks' | 'organizer' | 'recentActivity' | 'clientOverview';

export function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('all');
  
  // Mock integration issues - would come from API
  const [integrationIssues, setIntegrationIssues] = useState<IntegrationIssue[]>([
    {
      id: 'qb-disconnect',
      integrationName: 'QuickBooks',
      severity: 'error',
      message: 'Connection expired',
      detailedMessage: 'QuickBooks connection has expired. Reconnect to continue syncing client data and financial information.',
      actionLabel: 'Reconnect Now',
      actionUrl: '/settings/company/connected',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      affectedUsers: 12,
      canDismiss: true,
    },
  ]);

  // Task overview data for donut chart
  const taskData = [
    { name: 'Pending', value: 82, color: 'var(--primaryColor, #7c3aed)' },
    { name: 'Completed', value: 118, color: '#10b981' },
    { name: 'Overdue', value: 34, color: '#ef4444' },
    { name: 'Unfinished', value: 0, color: '#f59e0b' },
  ];

  const totalTasks = taskData.reduce((sum, item) => sum + item.value, 0);

  // Project tasks
  const projectTasks = [
    { id: 1, date: '16/01/2025', name: 'Habiba', status: 'Interview - Mark Sweet', workflow: 'Immigration', type: 'New Start / [W1]' },
    { id: 2, date: '16/01/2025', name: 'Habiba', status: 'Offer Letter - Mark Sweet', workflow: 'R7/12', type: 'New Start / [W1]' },
    { id: 3, date: '16/01/2025', name: 'Habiba', status: 'Documents - Mark Sweet', workflow: 'Business - work update', type: 'New Project / [W2]' },
    { id: 4, date: '16/01/2025', name: 'Habiba', status: 'Documents - Mark Sweet', workflow: 'Administration', type: 'New Project / [W1]' },
  ];

  // My tasks
  const myTasks = [
    { id: 1, title: 'New Assigned Task', due: '06/01/25', category: 'Pending', hasAttachment: true },
    { id: 2, title: 'New Task for 01/01/21', due: '06/01/25', category: 'Completed', hasAttachment: false },
    { id: 3, title: 'Task from Email', due: '06/01/25', category: 'Pending', hasAttachment: false },
    { id: 4, title: 'Task 2 from email', due: '06/01/25', category: 'Unfinished', hasAttachment: true },
    { id: 5, title: 'Test reliable email task', due: '06/01/25', category: 'Overdue', hasAttachment: true },
  ];

  // Invoices
  const invoices = [
    { id: 1, client: 'Atlantis Vienna', invoiceNo: 'ACH0108-0007', dueDate: '18/11/2007', amount: '$5,441.27', status: 'open' },
    { id: 2, client: 'Atlantis Vienna', invoiceNo: 'ACH0108-0006', dueDate: '06/05/2007', amount: '$7,102.06', status: 'open' },
    { id: 3, client: 'ABC12 Vienna', invoiceNo: 'ACH0108-0002', dueDate: '12/05/2025', amount: '$5,126.48', status: 'paid' },
    { id: 4, client: 'ABC12 Vienna', invoiceNo: 'ACH0104-0002', dueDate: '12/01/2025', amount: '$682.12', status: 'paid' },
  ];

  // Calendar meetings
  const meetings = [
    { id: 1, time: '03:30 PM', title: 'Meeting with Accounting1 Client', date: '12/21/2024' },
  ];

  // Documents
  const documents = [
    { type: 'Uploaded Docs', count: 0, color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
    { type: 'E Create Documents', count: 3, color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
    { type: 'To Be Processed', count: 11, color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
  ];

  // New signed documents
  const signedDocuments = [
    { id: 1, client: 'Accounting1 Client', text: 'Uploaded a new document', time: '2 months ago' },
    { id: 2, client: 'Accounting1 Client', text: 'Uploaded a new document', time: '2 months ago' },
    { id: 3, client: 'Accounting1 Client', text: 'Uploaded a new document', time: '2 months ago' },
    { id: 4, client: 'Accounting1 Client', text: 'Uploaded a new document', time: '2 months ago' },
  ];

  // Inbox messages
  const inboxMessages = [
    { id: 1, from: 'Juan Verburg', subject: 'Message Subject', time: '11 min' },
    { id: 2, from: 'Juan Verburg', subject: 'Message Subject', time: '11 min' },
    { id: 3, from: 'Last name First name', subject: 'last name 07044122019', time: '11 min' },
    { id: 4, from: 'ABC ABC', subject: "I'm sky high of die", time: '11 min' },
    { id: 5, from: 'Accounting1 Client', subject: 'new message', time: '14 min' },
  ];

  // Leads data
  const leadsData = [
    { name: 'In Progress', value: 245, color: 'var(--primaryColor, #7c3aed)' },
    { name: 'In Progress', value: 245, color: '#3b82f6' },
    { name: 'Converted', value: 50, color: '#10b981' },
  ];

  // Recent client activity
  const recentActivity = [
    { id: 1, client: 'Juan Miguel', action: 'Deleted Consulting - Nicole Workout', time: '2 days ago', avatar: 'JM', color: 'bg-purple-600' },
    { id: 2, client: 'Juan Miguel', action: 'Started Preparing I/s AGO/way - Adriene Agbeko', time: '2 days ago', avatar: 'JM', color: 'bg-purple-600' },
    { id: 3, client: 'Adam', action: 'Uploaded Wilkinson new 03/04', time: '2 days ago', avatar: 'A', color: 'bg-purple-600' },
    { id: 4, client: 'Adam', action: 'Deleted Consulting - Nicole Workout', time: '2 days ago', avatar: 'A', color: 'bg-purple-600' },
    { id: 5, client: 'Adam', action: 'Consulting Documenting Consulting Doc - Been Konsaelstellen now added', time: '2 days ago', avatar: 'A', color: 'bg-purple-600' },
    { id: 6, client: 'Adam', action: 'Deleted New Vortrag Duster I/s AGO - Nicole Workout', time: '3 days ago', avatar: 'A', color: 'bg-purple-600' },
  ];

  const renderCard = (cardId: CardId) => {
    const baseClasses = "border shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden";
    
    switch (cardId) {
      case 'integrationStatus':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Integration Status</CardTitle>
                  <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <IntegrationStatusMonitor 
                issues={integrationIssues}
                onDismiss={(issueId) => {
                  setIntegrationIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
                }}
                onReconnect={(integrationId) => {
                  navigate('/settings/company/connected');
                }}
              />
            </CardContent>
          </Card>
        );

      case 'taskOverview':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Task Overview</CardTitle>
                  <div className="flex gap-2">
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedTaskFilter === 'all' ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      style={selectedTaskFilter === 'all' ? { background: 'var(--primaryColor)' } : {}}
                      onClick={() => setSelectedTaskFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedTaskFilter === 'week' ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      style={selectedTaskFilter === 'week' ? { background: 'var(--primaryColor)' } : {}}
                      onClick={() => setSelectedTaskFilter('week')}
                    >
                      Week
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={taskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {taskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'invoices':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Invoices</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">Open</Badge>
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" style={{ color: 'var(--primaryColor)' }}>Paid</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="mb-4">
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Open 4</span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">Paid 19</span>
                    <span className="text-red-600 dark:text-red-400">Bad Logins(1): 303</span>
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.client}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">INV {invoice.invoiceNo} • Due: {invoice.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.amount}</div>
                      <Badge variant="outline" className={invoice.status === 'paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : ''}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'signedDocs':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">New Signed Documents</CardTitle>
                  <Link to="/signatures">
                    <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-3">
                {signedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <Avatar className="w-8 h-8" style={{ background: 'var(--primaryColor)' }}>
                      <AvatarFallback className="text-white text-xs">AC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.client}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{doc.text}</div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{doc.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'inbox':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Inbox</CardTitle>
                  <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-2">
                {inboxMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <Avatar className="w-8 h-8 flex-shrink-0" style={{ background: 'var(--primaryColor)' }}>
                      <AvatarFallback className="text-white text-xs">{message.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{message.from}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{message.subject}</div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{message.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'projectTask':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Project Task</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">New List • 7 days</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-3">
                {projectTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.date}</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }}>
                          {task.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{task.status}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{task.workflow}</span>
                      <span>{task.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'calendar':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Calendar</CardTitle>
                  <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                    View Meetings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Search Client/meeting Task here...." 
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
                />
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100 mb-3">30 Days</div>
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8" style={{ background: 'var(--primaryColor)' }}>
                      <AvatarFallback className="text-white text-xs">AC</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{meeting.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{meeting.time} • {meeting.date}</div>
                  </div>
                  <Button size="sm" className="text-white" style={{ background: 'var(--primaryColor)' }}>
                    Join Meeting
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 'documents':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Documents</CardTitle>
                  <Link to="/incoming-documents">
                    <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="grid grid-cols-3 gap-3">
                {documents.map((doc, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border text-center ${doc.color}`}
                  >
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{doc.count}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{doc.type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'leads':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Leads</CardTitle>
                  <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                    View All Leads
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">105 Total Prospects</div>
              <div className="flex items-center justify-center gap-8">
                {leadsData.map((lead, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ background: lead.color }}
                    >
                      {lead.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{lead.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'myTasks':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <CardTitle className="text-gray-900 dark:text-gray-100">My Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{task.title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Due: {task.due}</span>
                        {task.hasAttachment && <FileText className="w-3 h-3 ml-2" />}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.category === 'Completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                        task.category === 'Overdue' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                        task.category === 'Unfinished' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {task.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'organizer':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Organizer</CardTitle>
                  <Button variant="link" className="text-sm h-auto p-0" style={{ color: 'var(--primaryColor)' }}>
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Last 7 Days</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Task Status</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Count</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Documents</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'recentActivity':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <CardTitle className="text-gray-900 dark:text-gray-100">Recent Clients Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
                    <Avatar className={`w-8 h-8 ${activity.color}`}>
                      <AvatarFallback className="text-white text-xs">{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{activity.client}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{activity.action}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'clientOverview':
        return (
          <Card className={baseClasses}>
            <CardHeader className="pb-4 shrink-0 drag-handle cursor-move border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <CardTitle className="text-gray-900 dark:text-gray-100">Client Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credential Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">304 Clients</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0</span>
                    <span>Non Login: 303</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Logins</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">304 Clients</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Last Login: Accounting1 Client</span>
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 dark:text-green-400">VIP: 0</span>
                      <span className="text-red-600 dark:text-red-400">Bad Logins(1): 303</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const cardIds: CardId[] = [
    'integrationStatus', 'taskOverview', 'invoices', 'signedDocs', 'inbox',
    'projectTask', 'calendar', 'documents', 'leads',
    'myTasks', 'organizer', 'recentActivity', 'clientOverview'
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl text-gray-900 dark:text-gray-100">Hi - {user?.name || 'User'}</h1>
        </div>

        {/* Simple Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {cardIds.map((cardId) => (
            <div key={cardId} className="h-[400px]">
              {renderCard(cardId)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}