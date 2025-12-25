import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Users,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  Download,
  User
} from 'lucide-react';

export function ClientPortalView() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'invoices' | 'messages' | 'team'>('dashboard');

  // Mock client data
  const clientData = {
    name: 'Acme Corporation',
    type: 'Business',
    accountManager: 'Sarah Johnson',
    accountManagerEmail: 'sarah.j@accountingfirm.com'
  };

  const notifications = [
    { id: '1', type: 'document', message: 'New tax document ready for review', time: '2 hours ago', unread: true },
    { id: '2', type: 'invoice', message: 'Invoice #2024-156 is due in 5 days', time: '1 day ago', unread: true },
    { id: '3', type: 'message', message: 'Sarah Johnson sent you a message', time: '2 days ago', unread: false },
  ];

  const upcomingTasks = [
    { id: '1', title: 'Review Q3 Financial Statements', dueDate: '2024-10-28', status: 'pending' },
    { id: '2', title: 'Sign Quarterly Tax Return', dueDate: '2024-10-30', status: 'pending' },
    { id: '3', title: 'Upload Expense Receipts', dueDate: '2024-11-05', status: 'pending' },
  ];

  const recentDocuments = [
    { id: '1', name: 'Q3_2024_Financial_Statement.pdf', uploadedDate: '2024-10-20', size: '2.4 MB', category: 'Financial Statements' },
    { id: '2', name: 'Tax_Return_Draft_2024.pdf', uploadedDate: '2024-10-18', size: '1.8 MB', category: 'Tax Returns' },
    { id: '3', name: 'Payroll_Summary_October.pdf', uploadedDate: '2024-10-15', size: '856 KB', category: 'Payroll' },
  ];

  const recentInvoices = [
    { id: '1', number: 'INV-2024-156', amount: '$2,500.00', dueDate: '2024-10-30', status: 'pending' },
    { id: '2', number: 'INV-2024-145', amount: '$2,500.00', dueDate: '2024-09-30', status: 'paid' },
    { id: '3', number: 'INV-2024-134', amount: '$2,800.00', dueDate: '2024-08-30', status: 'paid' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl shadow-gray-900/5 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Client Portal</h1>
              <p className="text-xs text-gray-500">{clientData.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Documents
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Invoices
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
            {notifications.filter(n => n.type === 'message' && n.unread).length > 0 && (
              <Badge className="ml-auto bg-red-500 text-white">
                {notifications.filter(n => n.type === 'message' && n.unread).length}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            My Team
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200/50 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'documents' && 'Documents'}
                {activeTab === 'invoices' && 'Invoices'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'team' && 'My Team'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {clientData.name}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border border-gray-200/60 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{upcomingTasks.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-gray-200/60 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Documents</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{recentDocuments.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-gray-200/60 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">$2,500</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border border-gray-200/60 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Messages</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {notifications.filter(n => n.type === 'message').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Tasks and Notifications */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Upcoming Tasks */}
                  <Card className="p-6 border border-gray-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
                      <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                          <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recent Documents */}
                  <Card className="p-6 border border-gray-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Documents</h3>
                      <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="space-y-3">
                      {recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.category} • {doc.size} • {new Date(doc.uploadedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Column - Account Info and Quick Actions */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="p-6 border border-gray-200/60 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full bg-gradient-to-br from-purple-600 to-purple-700 justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Accountant
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pay Invoice
                      </Button>
                    </div>
                  </Card>

                  {/* Account Manager */}
                  <Card className="p-6 border border-gray-200/60 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Account Manager</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{clientData.accountManager}</p>
                        <p className="text-sm text-gray-500">{clientData.accountManagerEmail}</p>
                        <Button size="sm" variant="outline" className="mt-3 w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Notifications */}
                  <Card className="p-6 border border-gray-200/60 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-3 rounded-lg border transition-all ${
                          notif.unread 
                            ? 'border-purple-200 bg-purple-50/30' 
                            : 'border-gray-200'
                        }`}>
                          <p className="text-sm text-gray-900">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <Card className="p-12 border border-gray-200/60 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'documents' && <FileText className="w-8 h-8 text-purple-600" />}
                  {activeTab === 'invoices' && <DollarSign className="w-8 h-8 text-purple-600" />}
                  {activeTab === 'messages' && <MessageSquare className="w-8 h-8 text-purple-600" />}
                  {activeTab === 'team' && <Users className="w-8 h-8 text-purple-600" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                </h3>
                <p className="text-gray-500 mb-6">
                  This section is ready to be built with the same design system
                </p>
                <Button className="bg-gradient-to-br from-purple-600 to-purple-700">
                  Build This Section
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
