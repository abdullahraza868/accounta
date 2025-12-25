import React, { useState } from 'react';
import { UserCircle, Plus, Pencil, Trash2, Save, X, DollarSign, Clock, Briefcase, Umbrella, Calendar, Coffee, TrendingUp, Settings, Users, AlertCircle, Heart, ArrowLeft, ChevronRight, Edit2, Check, Eye } from 'lucide-react';
import type { UserProfile, FirmSettings } from './WorkflowContext';

interface TeamSettingsProps {
  userProfiles: UserProfile[];
  onUpdateProfiles: (profiles: UserProfile[]) => void;
  firmSettings: FirmSettings;
  onUpdateFirmSettings: (settings: FirmSettings) => void;
}

type TabType = 'team-members' | 'firm-settings';

export function TeamSettings({ userProfiles, onUpdateProfiles, firmSettings, onUpdateFirmSettings }: TeamSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('team-members');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const startEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setFormData(user);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      hoursPerWeek: 40,
      employmentType: 'hourly',
      hourlyRate: 50,
      billableRate: 150,
      active: true,
      ptoHoursPerYear: 80,
      ptoHoursUsed: 0,
      ptoBalance: 80,
      sickLeaveBalance: 40,
      sickLeaveUsed: 0,
      sickLeaveAccrued: 40,
      sickLeaveHireDate: new Date().toISOString().split('T')[0],
      sickLeaveCustomPolicy: false,
      holidays: [],
      lunchBreakMinutes: 30,
      overtimeEnabled: false,
      overtimeRate: 75,
      overtimeThreshold: 40
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const saveUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (isAdding) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: formData.name || '',
        email: formData.email || '',
        role: formData.role || '',
        hoursPerWeek: formData.hoursPerWeek || 40,
        hourlyRate: formData.hourlyRate || 50,
        billableRate: formData.billableRate || 150,
        active: formData.active !== false
      };
      onUpdateProfiles([...userProfiles, newUser]);
    } else if (editingId) {
      onUpdateProfiles(
        userProfiles.map(u => 
          u.id === editingId ? { ...u, ...formData } as UserProfile : u
        )
      );
    }

    cancelEdit();
  };

  const deleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      onUpdateProfiles(userProfiles.filter(u => u.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    onUpdateProfiles(
      userProfiles.map(u => 
        u.id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-white">Firm Settings</h2>
          <p className="text-slate-600 dark:text-gray-400 text-sm mt-1">
            Manage team member profiles, rates, and firm-wide payroll policies
          </p>
        </div>
        {activeTab === 'team-members' && (
          <button
            onClick={startAdd}
            disabled={isAdding}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('team-members')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'team-members'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </div>
        </button>
        <button
          onClick={() => setActiveTab('firm-settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'firm-settings'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Firm Settings
          </div>
        </button>
      </div>

      {/* Team Members Tab */}
      {activeTab === 'team-members' && (
        <>
          {/* Add New User Form */}
          {isAdding && (
        <div className="bg-white dark:bg-gray-800 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-6">
          <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            New Team Member
          </h3>
          <UserForm
            data={formData}
            onChange={setFormData}
            onSave={saveUser}
            onCancel={cancelEdit}
          />
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {userProfiles.map(user => (
          <div
            key={user.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
              !user.active ? 'border-slate-200 dark:border-gray-700 opacity-60' : 'border-slate-200 dark:border-gray-700'
            } ${editingId === user.id ? 'border-indigo-600 dark:border-indigo-500 border-2' : ''}`}
          >
            {editingId === user.id ? (
              <div className="p-6">
                <UserForm
                  data={formData}
                  onChange={setFormData}
                  onSave={saveUser}
                  onCancel={cancelEdit}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {user.name === 'Emily Brown' ? (
                      <img 
                        src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2MzYzODk5OHww&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Emily Brown"
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                        user.active ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-400 dark:bg-gray-600'
                      }`}>
                        <UserCircle className="w-7 h-7" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-slate-900 dark:text-white">{user.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.active 
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' 
                            : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400'
                        }`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">{user.email}</p>
                      
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <span className="text-slate-600 dark:text-gray-400">{user.role}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <span className="text-slate-600 dark:text-gray-400">{user.hoursPerWeek} hrs/week</span>
                        </div>

                        {/* Employment Type Badge */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            user.employmentType === 'salaried' 
                              ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400' 
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
                          }`}>
                            {user.employmentType === 'salaried' ? 'Salaried' : 'Hourly'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <span className="text-slate-600 dark:text-gray-400">
                            {user.employmentType === 'salaried' && user.annualSalary
                              ? `Salary: $${user.annualSalary.toLocaleString()}/yr`
                              : `Cost: $${user.hourlyRate}/hr`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-500" />
                          <span className="text-slate-600 dark:text-gray-400">
                            Billable: ${user.billableRate}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        user.active
                          ? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Profitability Preview */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-gray-500">Margin per hour:</span>
                      <span className="ml-2 text-green-600 dark:text-green-500">
                        ${user.billableRate - user.hourlyRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-gray-500">Markup:</span>
                      <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                        {Math.round((user.billableRate / user.hourlyRate - 1) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-gray-500">Weekly capacity:</span>
                      <span className="ml-2 text-slate-700 dark:text-gray-300">
                        {user.hoursPerWeek} hours
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-gray-500">Max weekly revenue:</span>
                      <span className="ml-2 text-green-700 dark:text-green-400">
                        ${(user.billableRate * user.hoursPerWeek).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-gray-500">Max weekly profit:</span>
                      <span className="ml-2 text-emerald-700 dark:text-emerald-400 font-medium">
                        ${((user.billableRate - user.hourlyRate) * user.hoursPerWeek).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payroll & Time Tracking Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                  <div className="grid grid-cols-5 gap-4">
                    {/* PTO Summary */}
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Umbrella className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-900 dark:text-blue-300">PTO Balance</span>
                      </div>
                      <div className="text-xl font-mono text-blue-700 dark:text-blue-400">
                        {user.ptoBalance !== undefined 
                          ? user.ptoBalance
                          : user.ptoHoursPerYear !== undefined && user.ptoHoursUsed !== undefined 
                          ? (user.ptoHoursPerYear - user.ptoHoursUsed)
                          : '—'}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                        {user.ptoHoursUsed !== undefined
                          ? `${user.ptoHoursUsed} hrs used`
                          : 'Not configured'}
                      </div>
                    </div>

                    {/* Sick Leave Balance */}
                    <div className="bg-rose-50 dark:bg-rose-950 rounded-lg p-3 border border-rose-100 dark:border-rose-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-medium text-rose-900 dark:text-rose-300">Sick Leave</span>
                      </div>
                      <div className="text-xl font-mono text-rose-700 dark:text-rose-400">
                        {user.sickLeaveBalance !== undefined ? user.sickLeaveBalance : '—'}
                      </div>
                      <div className="text-xs text-rose-600 dark:text-rose-500 mt-1">
                        {user.sickLeaveUsed !== undefined
                          ? `${user.sickLeaveUsed} hrs used`
                          : user.sickLeaveBalance !== undefined 
                          ? 'Available'
                          : 'Not configured'}
                      </div>
                    </div>

                    {/* Lunch Break */}
                    <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-medium text-amber-900 dark:text-amber-300">Lunch Break</span>
                      </div>
                      <div className="text-xl font-mono text-amber-700 dark:text-amber-400">
                        {user.lunchBreakMinutes !== undefined ? user.lunchBreakMinutes : '—'}
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        {user.lunchBreakMinutes !== undefined 
                          ? `${user.lunchBreakMinutes} min daily`
                          : 'Not configured'}
                      </div>
                    </div>

                    {/* Overtime Status */}
                    <div className={`rounded-lg p-3 border ${
                      user.overtimeEnabled 
                        ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-800' 
                        : 'bg-slate-50 dark:bg-gray-800 border-slate-100 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className={`w-4 h-4 ${
                          user.overtimeEnabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-gray-600'
                        }`} />
                        <span className={`text-xs font-medium ${
                          user.overtimeEnabled ? 'text-green-900 dark:text-green-300' : 'text-slate-600 dark:text-gray-400'
                        }`}>
                          Overtime
                        </span>
                      </div>
                      <div className={`text-xl font-mono ${
                        user.overtimeEnabled ? 'text-green-700 dark:text-green-400' : 'text-slate-400 dark:text-gray-600'
                      }`}>
                        {user.overtimeEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className={`text-xs mt-1 ${
                        user.overtimeEnabled ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-gray-600'
                      }`}>
                        {user.overtimeEnabled && user.overtimeRate
                          ? `$${user.overtimeRate}/hr OT`
                          : user.overtimeEnabled 
                            ? 'Rate not set'
                            : 'Not eligible'}
                      </div>
                    </div>

                    {/* Overtime Threshold */}
                    <div className="bg-violet-50 dark:bg-violet-950 rounded-lg p-3 border border-violet-100 dark:border-violet-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-xs font-medium text-violet-900 dark:text-violet-300">OT Threshold</span>
                      </div>
                      <div className="text-xl font-mono text-violet-700 dark:text-violet-400">
                        {user.overtimeThreshold !== undefined ? user.overtimeThreshold : '—'}
                      </div>
                      <div className="text-xs text-violet-600 dark:text-violet-500 mt-1">
                        {user.overtimeThreshold !== undefined 
                          ? 'hrs/week'
                          : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {userProfiles.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-gray-600">
          <UserCircle className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-gray-400 mb-4">No team members yet</p>
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Add Your First Team Member
          </button>
        </div>
      )}
        </>
      )}

      {/* Firm Settings Tab */}
      {activeTab === 'firm-settings' && (
        <FirmSettingsForm 
          settings={firmSettings}
          onUpdate={onUpdateFirmSettings}
        />
      )}
    </div>
  );
}

interface UserFormProps {
  data: Partial<UserProfile>;
  onChange: (data: Partial<UserProfile>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function UserForm({ data, onChange, onSave, onCancel }: UserFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={e => onChange({ ...data, name: e.target.value })}
            placeholder="John Smith"
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={e => onChange({ ...data, email: e.target.value })}
            placeholder="john@company.com"
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.role || ''}
            onChange={e => onChange({ ...data, role: e.target.value })}
            placeholder="Senior Accountant"
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Hours per Week */}
        <div>
          <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
            Hours per Week
          </label>
          <input
            type="number"
            value={data.hoursPerWeek || 40}
            onChange={e => onChange({ ...data, hoursPerWeek: parseInt(e.target.value) || 40 })}
            min="1"
            max="80"
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Employment Type Section */}
      <div className="bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
          Employment Type <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => onChange({ ...data, employmentType: 'hourly' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              (data.employmentType || 'hourly') === 'hourly'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
            }`}
          >
            Hourly Employee
          </button>
          
          <button
            type="button"
            onClick={() => onChange({ ...data, employmentType: 'salaried' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              data.employmentType === 'salaried'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
            }`}
          >
            Salaried Employee
          </button>
          
          <button
            type="button"
            onClick={() => onChange({ ...data, employmentType: 'contractor' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              data.employmentType === 'contractor'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
            }`}
          >
            Contractor
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hourly Rate or Annual Salary */}
          {(data.employmentType || 'hourly') === 'hourly' || data.employmentType === 'contractor' ? (
            <div>
              <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
                {data.employmentType === 'contractor' ? 'Hourly Rate' : 'Hourly Cost (what you pay)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={data.hourlyRate || 50}
                  onChange={e => onChange({ ...data, hourlyRate: parseFloat(e.target.value) || 50 })}
                  min="0"
                  step="0.5"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
                  Annual Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={data.annualSalary || 100000}
                    onChange={e => {
                      const annualSalary = parseFloat(e.target.value) || 100000;
                      const hourlyEquivalent = annualSalary / ((data.hoursPerWeek || 40) * 52);
                      onChange({ ...data, annualSalary, hourlyRate: hourlyEquivalent });
                    }}
                    min="0"
                    step="1000"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
                  Hourly Equivalent (calculated)
                </label>
                <div className="px-3 py-2 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-700 dark:text-gray-300">
                  ${data.annualSalary && data.hoursPerWeek 
                    ? (data.annualSalary / ((data.hoursPerWeek || 40) * 52)).toFixed(2)
                    : '0.00'}/hr
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  Used for profitability calculations
                </p>
              </div>
            </>
          )}

          {/* Hire Date - Only for contractors */}
          {data.employmentType === 'contractor' && (
            <div>
              <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
                Hire Date
              </label>
              <input
                type="date"
                value={data.sickLeaveHireDate || ''}
                onChange={e => onChange({ ...data, sickLeaveHireDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Billable Rate - Not for contractors */}
          {data.employmentType !== 'contractor' && (
            <div>
              <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">
                Billable Rate (what you charge)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={data.billableRate || 150}
                  onChange={e => onChange({ ...data, billableRate: parseFloat(e.target.value) || 150 })}
                  min="0"
                  step="5"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculated Preview - Not for contractors */}
      {data.employmentType !== 'contractor' && data.hourlyRate && data.billableRate && (
        <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-600 dark:text-gray-400">Profit per Hour</div>
              <div className="text-indigo-700 dark:text-indigo-400">
                ${data.billableRate - data.hourlyRate}
              </div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-gray-400">Markup Percentage</div>
              <div className="text-indigo-700 dark:text-indigo-400">
                {Math.round((data.billableRate / data.hourlyRate - 1) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-gray-400">Max Weekly Revenue</div>
              <div className="text-indigo-700 dark:text-indigo-400">
                ${((data.billableRate || 0) * (data.hoursPerWeek || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Settings Section - Not for contractors */}
      {data.employmentType !== 'contractor' && (
      <div className="border-t border-slate-200 dark:border-gray-700 pt-4 mt-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          Payroll & Time Tracking Settings
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* PTO Hours Per Year */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Umbrella className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              PTO Hours Per Year
            </label>
            <input
              type="number"
              value={data.ptoHoursPerYear || 80}
              onChange={e => onChange({ ...data, ptoHoursPerYear: parseInt(e.target.value) || 0 })}
              min="0"
              step="8"
              placeholder="80"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Total vacation/sick time allocated annually</p>
          </div>

          {/* PTO Hours Used */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              PTO Hours Used (YTD)
            </label>
            <input
              type="number"
              value={data.ptoHoursUsed || 0}
              onChange={e => onChange({ ...data, ptoHoursUsed: parseInt(e.target.value) || 0 })}
              min="0"
              step="8"
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
              {data.ptoHoursPerYear && data.ptoHoursUsed !== undefined 
                ? `${data.ptoHoursPerYear - data.ptoHoursUsed} hours remaining`
                : 'Hours used this year'}
            </p>
          </div>

          {/* Sick Leave Balance */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Sick Leave Balance
            </label>
            <input
              type="number"
              value={data.sickLeaveBalance || 0}
              onChange={e => onChange({ ...data, sickLeaveBalance: parseInt(e.target.value) || 0 })}
              min="0"
              step="4"
              placeholder="40"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Current sick time available (hours)</p>
          </div>

          {/* Sick Leave Used */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Sick Leave Used (YTD)
            </label>
            <input
              type="number"
              value={data.sickLeaveUsed || 0}
              onChange={e => onChange({ ...data, sickLeaveUsed: parseInt(e.target.value) || 0 })}
              min="0"
              step="4"
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Sick hours used this year</p>
          </div>

          {/* Hire Date for Sick Leave */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              Hire Date (for sick leave)
            </label>
            <input
              type="date"
              value={data.sickLeaveHireDate || ''}
              onChange={e => onChange({ ...data, sickLeaveHireDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">For waiting period calculations</p>
          </div>

          {/* Custom Sick Policy Toggle */}
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg">
              <input
                type="checkbox"
                checked={data.sickLeaveCustomPolicy || false}
                onChange={e => onChange({ ...data, sickLeaveCustomPolicy: e.target.checked })}
                className="w-4 h-4 text-rose-600 border-slate-300 dark:border-gray-600 rounded focus:ring-rose-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Use Custom Sick Leave Policy for this Employee
                </span>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                  Override firm-wide sick leave settings with employee-specific rules
                </p>
              </div>
            </label>
          </div>

          {/* Custom Policy Options - Only show if custom policy is enabled */}
          {data.sickLeaveCustomPolicy && (
            <>
              <div className="col-span-2">
                <div className="bg-rose-100 dark:bg-rose-950 border-2 border-rose-300 dark:border-rose-700 rounded-lg p-4 space-y-4">
                  <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Custom Sick Leave Policy
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Pay Type Override */}
                    <div>
                      <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2">
                        Pay Type
                      </label>
                      <select
                        value={data.sickLeavePayType || 'paid'}
                        onChange={e => onChange({ ...data, sickLeavePayType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="paid">Paid (100%)</option>
                        <option value="partial">Partially Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>

                    {/* Partial Pay Percentage - Only show if partial */}
                    {data.sickLeavePayType === 'partial' && (
                      <div>
                        <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2">
                          Pay Percentage
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={data.sickLeavePartialPayPercentage || 50}
                            onChange={e => onChange({ ...data, sickLeavePartialPayPercentage: parseInt(e.target.value) || 50 })}
                            min="0"
                            max="100"
                            step="5"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                          />
                          <span className="text-sm text-slate-600 dark:text-gray-400">%</span>
                        </div>
                      </div>
                    )}

                    {/* Accrual Cap Override */}
                    <div>
                      <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2">
                        Accrual Cap (max balance)
                      </label>
                      <input
                        type="number"
                        value={data.sickLeaveAccrualCap || 0}
                        onChange={e => onChange({ ...data, sickLeaveAccrualCap: parseInt(e.target.value) || 0 })}
                        min="0"
                        step="8"
                        placeholder="80"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Lunch Break Minutes */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              Daily Lunch Break (minutes)
            </label>
            <select
              value={data.lunchBreakMinutes || 30}
              onChange={e => onChange({ ...data, lunchBreakMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="0">No lunch break</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Auto-deducted from daily hours</p>
          </div>

          {/* Overtime Threshold */}
          <div>
            <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              Overtime Threshold (hrs/week)
            </label>
            <input
              type="number"
              value={data.overtimeThreshold || 40}
              onChange={e => onChange({ ...data, overtimeThreshold: parseInt(e.target.value) || 40 })}
              min="0"
              step="1"
              placeholder="40"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Hours per week before OT applies</p>
          </div>
        </div>

        {/* Overtime Settings */}
        <div className="mt-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.overtimeEnabled || false}
                  onChange={e => onChange({ ...data, overtimeEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Enable Overtime Pay
                </span>
              </label>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 ml-6">
                Calculate overtime pay for hours worked beyond threshold
              </p>
            </div>

            {data.overtimeEnabled && (
              <div className="w-40">
                <label className="block text-xs text-slate-700 dark:text-gray-300 mb-1">
                  OT Rate ($/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-2 text-xs text-slate-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={data.overtimeRate || (data.hourlyRate ? data.hourlyRate * 1.5 : 75)}
                    onChange={e => onChange({ ...data, overtimeRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.5"
                    className="w-full pl-5 pr-2 py-1.5 text-sm border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  {data.hourlyRate && data.overtimeRate 
                    ? `${((data.overtimeRate / data.hourlyRate) * 100).toFixed(0)}% of base rate`
                    : 'Usually 1.5x base rate'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// Firm Settings Form Component
interface FirmSettingsFormProps {
  settings: FirmSettings;
  onUpdate: (settings: FirmSettings) => void;
}

// State Compliance Templates for Sick Leave
interface SickLeaveTemplate {
  id: string;
  name: string;
  state: string;
  description: string;
  effectiveDate?: string;
  settings: Partial<FirmSettings>;
}

const SICK_LEAVE_TEMPLATES: Record<string, SickLeaveTemplate> = {
  custom: {
    id: 'custom',
    name: 'Custom',
    state: 'None',
    description: 'Configure your own sick leave policy',
    settings: {
      sickLeaveAccrualMethod: 'per-pay-period',
      sickLeaveAccrualRate: 3.33,
      sickLeaveAccrualFrequency: 'biweekly',
      sickLeaveAnnualLimit: 80,
      sickLeaveAccrualCap: 80,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 0,
      sickLeaveCarryoverPolicy: 'unlimited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  california: {
    id: 'california',
    name: 'California',
    state: 'CA',
    description: '1 hr per 30 hrs worked, 24 hr minimum, 48 hr cap',
    effectiveDate: '2015',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 24,
      sickLeaveAccrualCap: 48,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 48,
      sickLeavePayType: 'paid',
    },
  },
  washington: {
    id: 'washington',
    name: 'Washington',
    state: 'WA',
    description: '1 hr per 40 hrs worked',
    effectiveDate: '2018',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 40,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 0,
      sickLeaveCarryoverPolicy: 'unlimited',
      sickLeavePayType: 'paid',
    },
  },
  newyork: {
    id: 'newyork',
    name: 'New York',
    state: 'NY',
    description: '1 hr per 30 hrs worked, 56 hr annual cap',
    effectiveDate: '2020',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 56,
      sickLeaveAccrualCap: 56,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 120,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 56,
      sickLeavePayType: 'paid',
    },
  },
  massachusetts: {
    id: 'massachusetts',
    name: 'Massachusetts',
    state: 'MA',
    description: '1 hr per 30 hrs worked, 40 hr annual cap',
    effectiveDate: '2015',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  oregon: {
    id: 'oregon',
    name: 'Oregon',
    state: 'OR',
    description: '1 hr per 30 hrs worked',
    effectiveDate: '2016',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 90,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  colorado: {
    id: 'colorado',
    name: 'Colorado',
    state: 'CO',
    description: '1 hr per 30 hrs worked, 48 hr annual cap',
    effectiveDate: '2021',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 48,
      sickLeaveAccrualCap: 48,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 0,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 48,
      sickLeavePayType: 'paid',
    },
  },
  arizona: {
    id: 'arizona',
    name: 'Arizona',
    state: 'AZ',
    description: '1 hr per 30 hrs worked, 40 hr cap',
    effectiveDate: '2017',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  connecticut: {
    id: 'connecticut',
    name: 'Connecticut',
    state: 'CT',
    description: '1 hr per 40 hrs worked, 40 hr annual cap',
    effectiveDate: '2012',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 40,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 680,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  maryland: {
    id: 'maryland',
    name: 'Maryland',
    state: 'MD',
    description: '1 hr per 30 hrs worked, 64 hr cap',
    effectiveDate: '2018',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 64,
      sickLeaveWaitingPeriodDays: 106,
      sickLeaveUsageWaitingPeriodDays: 106,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  michigan: {
    id: 'michigan',
    name: 'Michigan',
    state: 'MI',
    description: '1 hr per 35 hrs worked, 72 hr annual cap',
    effectiveDate: '2019',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 35,
      sickLeaveAnnualLimit: 72,
      sickLeaveAccrualCap: 72,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 72,
      sickLeavePayType: 'paid',
    },
  },
  newjersey: {
    id: 'newjersey',
    name: 'New Jersey',
    state: 'NJ',
    description: '1 hr per 30 hrs worked, 40 hr annual cap',
    effectiveDate: '2018',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 30,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 120,
      sickLeaveUsageWaitingPeriodDays: 120,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  rhodeisland: {
    id: 'rhodeisland',
    name: 'Rhode Island',
    state: 'RI',
    description: '1 hr per 35 hrs worked, 40 hr annual cap',
    effectiveDate: '2018',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 35,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 90,
      sickLeaveCarryoverPolicy: 'limited',
      sickLeaveMaxCarryover: 40,
      sickLeavePayType: 'paid',
    },
  },
  vermont: {
    id: 'vermont',
    name: 'Vermont',
    state: 'VT',
    description: '1 hr per 52 hrs worked, 40 hr annual cap',
    effectiveDate: '2017',
    settings: {
      sickLeaveAccrualMethod: 'per-hour',
      sickLeaveAccrualRate: 52,
      sickLeaveAnnualLimit: 40,
      sickLeaveAccrualCap: 40,
      sickLeaveWaitingPeriodDays: 0,
      sickLeaveUsageWaitingPeriodDays: 0,
      sickLeaveCarryoverPolicy: 'unlimited',
      sickLeavePayType: 'paid',
    },
  },
};

function FirmSettingsForm({ settings, onUpdate }: FirmSettingsFormProps) {
  const [formData, setFormData] = useState<FirmSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleChange = (updates: Partial<FirmSettings>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleBackToCards = () => {
    if (hasChanges) {
      onUpdate(formData);
      setHasChanges(false);
    }
    setActiveSection(null);
  };

  // Apply state compliance template
  const applyTemplate = (templateId: string) => {
    const template = SICK_LEAVE_TEMPLATES[templateId];
    if (template) {
      handleChange({
        sickLeaveStateCompliance: templateId as any,
        ...template.settings,
      });
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  // Card grid view when no section is selected
  if (!activeSection) {
    const colorMap: Record<string, { bg: string; text: string; icon: string; border: string }> = {
      violet: { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-400', icon: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
      amber: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      rose: { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-400', icon: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
      green: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-400', icon: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-700 dark:text-indigo-400', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
    };

    return (
      <div className="space-y-6">
        <div className="text-sm text-slate-600 dark:text-gray-400">
          Configure your firm-wide payroll policies and settings
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Holiday Policy Card */}
          <button
            onClick={() => setActiveSection('holiday-policy')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.violet.bg} ${colorMap.violet.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <Calendar className={`w-7 h-7 ${colorMap.violet.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Holiday Policy
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Firm Holidays</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.firmHolidays.length} days configured</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Holiday Pay</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formData.holidaysPaid ? `Paid at ${formData.holidayPayRate}x rate` : 'Unpaid'}
                </span>
              </div>
            </div>
          </button>

          {/* Lunch Break Policy Card */}
          <button
            onClick={() => setActiveSection('lunch-break')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.amber.bg} ${colorMap.amber.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <Coffee className={`w-7 h-7 ${colorMap.amber.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Lunch Break Policy
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Default Break</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.defaultLunchBreak || 30} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Deduction</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formData.autoDeductLunch ? 'Auto-deduct enabled' : 'Manual tracking'}
                </span>
              </div>
            </div>
          </button>

          {/* PTO Policy Card */}
          <button
            onClick={() => setActiveSection('pto-policy')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.blue.bg} ${colorMap.blue.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <Umbrella className={`w-7 h-7 ${colorMap.blue.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  PTO Policy
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Accrual Rate</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.ptoAccrualRate || 0} hrs per period</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Accrual Method</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(formData.ptoAccrualMethod || 'per-pay-period').replace(/-/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Annual Limit</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.ptoAnnualLimit || 80} hours/year</span>
              </div>
            </div>
          </button>

          {/* Sick Leave Policy Card */}
          <button
            onClick={() => setActiveSection('sick-leave')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.rose.bg} ${colorMap.rose.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <Heart className={`w-7 h-7 ${colorMap.rose.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Sick Leave Policy
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Compliance</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance || 'custom']?.name || 'Custom'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Accrual Method</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(formData.sickLeaveAccrualMethod || 'per-hour').replace(/-/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Annual Limit</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.sickLeaveAnnualLimit || 40} hours/year</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Cap</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.sickLeaveAccrualCap || 40} hours</span>
              </div>
            </div>
          </button>

          {/* Overtime Policy Card */}
          <button
            onClick={() => setActiveSection('overtime-policy')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.green.bg} ${colorMap.green.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <TrendingUp className={`w-7 h-7 ${colorMap.green.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Overtime Policy
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Weekly Threshold</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.overtimeThreshold || 40} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Pay Multiplier</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.overtimeMultiplier || 1.5}x rate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Daily Threshold</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formData.dailyOvertimeThreshold ? `${formData.dailyOvertimeThreshold} hrs` : 'Not set'}
                </span>
              </div>
            </div>
          </button>

          {/* Work Week Settings Card */}
          <button
            onClick={() => setActiveSection('work-week')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`${colorMap.indigo.bg} ${colorMap.indigo.border} border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                <Clock className={`w-7 h-7 ${colorMap.indigo.icon}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Work Week Settings
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Standard Work Week</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.standardWorkWeek || 40} hours/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Pay Period</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(formData.payPeriod || 'biweekly').replace(/-/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Week Start</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formData.weekStartDay || 'Monday'}
                </span>
              </div>
            </div>
          </button>

          {/* Time Entry & Permissions Card */}
          <button
            onClick={() => setActiveSection('time-entry-permissions')}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-8 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 border rounded-lg p-3 group-hover:scale-110 transition-transform duration-200">
                <Edit2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Time Entry & Permissions
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">Time Entry Method</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(formData.timeEntryMethod || 'hybrid').replace(/-/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400">User Edit Permission</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(formData.userTimeEditPermission || 'free-edit').replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Edit view for specific section
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={handleBackToCards}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Firm Settings</span>
      </button>

      {/* Holiday Policy */}
      {activeSection === 'holiday-policy' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          Holiday Policy
        </h3>
        
        <div className="space-y-4">
          {/* Holidays Paid Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-900">Holidays Paid</label>
              <p className="text-xs text-slate-500 mt-0.5">Pay employees for firm holidays</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.holidaysPaid}
                onChange={e => handleChange({ holidaysPaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Holiday Pay Rate */}
          {formData.holidaysPaid && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Holiday Pay Rate
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleChange({ holidayPayRate: 1.0 })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.holidayPayRate === 1.0
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-semibold">1.0x</div>
                  <div className="text-xs mt-1">Normal Rate</div>
                </button>
                <button
                  onClick={() => handleChange({ holidayPayRate: 1.5 })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.holidayPayRate === 1.5
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-semibold">1.5x</div>
                  <div className="text-xs mt-1">Time & Half</div>
                </button>
                <button
                  onClick={() => handleChange({ holidayPayRate: 2.0 })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.holidayPayRate === 2.0
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-semibold">2.0x</div>
                  <div className="text-xs mt-1">Double Time</div>
                </button>
              </div>
            </div>
          )}

          {/* Firm Holidays List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Firm Holidays ({formData.firmHolidays.length} days)
              </label>
              <button
                onClick={() => {
                  // Add US Federal Holidays for current year
                  const currentYear = new Date().getFullYear();
                  const federalHolidays = [
                    `${currentYear}-01-01`, // New Year's Day
                    `${currentYear}-01-20`, // Martin Luther King Jr. Day (3rd Monday in Jan - approximate)
                    `${currentYear}-02-17`, // Presidents' Day (3rd Monday in Feb - approximate)
                    `${currentYear}-05-26`, // Memorial Day (Last Monday in May - approximate)
                    `${currentYear}-06-19`, // Juneteenth
                    `${currentYear}-07-04`, // Independence Day
                    `${currentYear}-09-01`, // Labor Day (1st Monday in Sep - approximate)
                    `${currentYear}-10-13`, // Columbus Day (2nd Monday in Oct - approximate)
                    `${currentYear}-11-11`, // Veterans Day
                    `${currentYear}-11-27`, // Thanksgiving (4th Thursday in Nov - approximate)
                    `${currentYear}-12-25`  // Christmas
                  ];
                  const uniqueHolidays = Array.from(new Set([...formData.firmHolidays, ...federalHolidays])).sort();
                  handleChange({ firmHolidays: uniqueHolidays });
                }}
                className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add Federal Holidays
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              {formData.firmHolidays.length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No holidays added. Click "Add Federal Holidays" to get started.
                </div>
              )}
              {formData.firmHolidays.map((holiday, idx) => {
                // Try to identify the holiday name
                const date = new Date(holiday + 'T00:00:00');
                const monthDay = holiday.substring(5); // Get MM-DD
                let holidayName = '';
                
                if (monthDay === '01-01') holidayName = "New Year's Day";
                else if (monthDay.startsWith('01-') && parseInt(monthDay.split('-')[1]) >= 15 && parseInt(monthDay.split('-')[1]) <= 21) holidayName = "MLK Jr. Day";
                else if (monthDay.startsWith('02-') && parseInt(monthDay.split('-')[1]) >= 15 && parseInt(monthDay.split('-')[1]) <= 21) holidayName = "Presidents' Day";
                else if (monthDay.startsWith('05-') && parseInt(monthDay.split('-')[1]) >= 25) holidayName = "Memorial Day";
                else if (monthDay === '06-19') holidayName = "Juneteenth";
                else if (monthDay === '07-04') holidayName = "Independence Day";
                else if (monthDay.startsWith('09-') && parseInt(monthDay.split('-')[1]) <= 7) holidayName = "Labor Day";
                else if (monthDay.startsWith('10-') && parseInt(monthDay.split('-')[1]) >= 8 && parseInt(monthDay.split('-')[1]) <= 14) holidayName = "Columbus Day";
                else if (monthDay === '11-11') holidayName = "Veterans Day";
                else if (monthDay.startsWith('11-') && parseInt(monthDay.split('-')[1]) >= 22 && parseInt(monthDay.split('-')[1]) <= 28) holidayName = "Thanksgiving";
                else if (monthDay === '12-25') holidayName = "Christmas";
                
                return (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex-1">
                      {holidayName && (
                        <div className="text-sm font-medium text-slate-900">{holidayName}</div>
                      )}
                      <div className={`text-xs ${holidayName ? 'text-slate-500' : 'text-slate-700'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newHolidays = formData.firmHolidays.filter((_, i) => i !== idx);
                        handleChange({ firmHolidays: newHolidays });
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              <div className="pt-2">
                <input
                  type="date"
                  onChange={e => {
                    if (e.target.value && !formData.firmHolidays.includes(e.target.value)) {
                      handleChange({ firmHolidays: [...formData.firmHolidays, e.target.value].sort() });
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add custom holiday date"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Lunch Break Policy */}
      {activeSection === 'lunch-break' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600" />
          Lunch Break Policy
        </h3>
        
        <div className="space-y-4">
          {/* Lunch Paid Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-900">Lunch Paid</label>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.lunchPaid ? 'Lunch time is paid' : 'Lunch time is deducted from hours'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lunchPaid}
                onChange={e => handleChange({ lunchPaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Deduction Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deduction Method
            </label>
            <select
              value={formData.lunchDeductionMethod}
              onChange={e => handleChange({ lunchDeductionMethod: e.target.value as 'auto' | 'manual' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="auto">Auto-deduct</option>
              <option value="manual">Manual log</option>
            </select>
          </div>

          {/* Default Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Lunch Duration
            </label>
            <select
              value={formData.lunchDefaultMinutes}
              onChange={e => handleChange({ lunchDefaultMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">No lunch break</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          {/* Flexible Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <label className="text-sm font-medium text-slate-900">Flexible Duration</label>
              <p className="text-xs text-slate-500 mt-0.5">Allow employees to set custom lunch durations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lunchFlexible}
                onChange={e => handleChange({ lunchFlexible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
      )}

      {/* PTO Policy */}
      {activeSection === 'pto-policy' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Umbrella className="w-5 h-5 text-blue-600" />
          PTO (Paid Time Off) Policy
        </h3>
        
        <div className="space-y-4">
          {/* PTO Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PTO Allocation Method
            </label>
            <select
              value={formData.ptoType}
              onChange={e => handleChange({ ptoType: e.target.value as 'accrued' | 'upfront' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upfront">Upfront Allocation (given at year start)</option>
              <option value="accrued">Accrued Over Time</option>
            </select>
          </div>

          {/* Accrual Settings (if accrued) */}
          {formData.ptoType === 'accrued' && (
            <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Accrual Rate (hours)
                </label>
                <input
                  type="number"
                  value={formData.ptoAccrualRate}
                  onChange={e => handleChange({ ptoAccrualRate: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Accrual Period
                </label>
                <select
                  value={formData.ptoAccrualPeriod}
                  onChange={e => handleChange({ ptoAccrualPeriod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="weekly">Per Week</option>
                  <option value="biweekly">Per 2 Weeks</option>
                  <option value="monthly">Per Month</option>
                  <option value="per-hour">Per Hour Worked</option>
                </select>
              </div>
            </div>
          )}

          {/* Annual Limit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual PTO Limit (hours)
            </label>
            <input
              type="number"
              value={formData.ptoAnnualLimit}
              onChange={e => handleChange({ ptoAnnualLimit: parseInt(e.target.value) || 0 })}
              step="8"
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Carryover */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-900">Allow Carryover</label>
              <p className="text-xs text-slate-500 mt-0.5">Permit unused PTO to roll over to next year</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ptoCarryoverAllowed}
                onChange={e => handleChange({ ptoCarryoverAllowed: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Max Carryover */}
          {formData.ptoCarryoverAllowed && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Carryover (hours)
              </label>
              <input
                type="number"
                value={formData.ptoMaxCarryover}
                onChange={e => handleChange({ ptoMaxCarryover: parseInt(e.target.value) || 0 })}
                step="8"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Sick Leave Policy */}
      {activeSection === 'sick-leave' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" />
          Sick Leave Policy
        </h3>
        
        <div className="space-y-4">
          {/* Separate from PTO */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-900">Separate from PTO</label>
              <p className="text-xs text-slate-500 mt-0.5">Track sick leave separately from vacation/PTO</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sickLeaveSeparate}
                onChange={e => handleChange({ sickLeaveSeparate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {formData.sickLeaveSeparate && (
            <div className="space-y-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
              
              {/* State Compliance Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State Compliance Template
                </label>
                <select
                  value={formData.sickLeaveStateCompliance || 'custom'}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {Object.values(SICK_LEAVE_TEMPLATES).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.state}) - {template.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  {formData.sickLeaveStateCompliance && SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance] && (
                    <>
                      <span className="font-medium">
                        {SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance]?.name}:
                      </span>{' '}
                      {SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance]?.description}
                      {SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance]?.effectiveDate && (
                        <> (Effective {SICK_LEAVE_TEMPLATES[formData.sickLeaveStateCompliance].effectiveDate})</>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Accrual Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Accrual Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChange({ sickLeaveAccrualMethod: 'per-hour' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveAccrualMethod === 'per-hour'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Per Hour</div>
                    <div className="text-xs mt-1">Based on hours worked</div>
                  </button>
                  <button
                    onClick={() => handleChange({ sickLeaveAccrualMethod: 'per-pay-period' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveAccrualMethod === 'per-pay-period'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Per Pay Period</div>
                    <div className="text-xs mt-1">Fixed each period</div>
                  </button>
                  <button
                    onClick={() => handleChange({ sickLeaveAccrualMethod: 'lump-sum' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveAccrualMethod === 'lump-sum'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Lump Sum</div>
                    <div className="text-xs mt-1">Annual grant</div>
                  </button>
                </div>
              </div>

              {/* Accrual Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {formData.sickLeaveAccrualMethod === 'per-hour' 
                      ? 'Hours Worked per 1 Hour Sick Leave'
                      : formData.sickLeaveAccrualMethod === 'per-pay-period'
                      ? 'Hours Accrued Per Pay Period'
                      : 'Annual Hours Granted'}
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveAccrualRate || 0}
                    onChange={e => handleChange({ sickLeaveAccrualRate: parseFloat(e.target.value) || 0 })}
                    step={formData.sickLeaveAccrualMethod === 'per-hour' ? '1' : '0.5'}
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={formData.sickLeaveAccrualMethod === 'per-hour' ? '30' : '3.33'}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.sickLeaveAccrualMethod === 'per-hour' 
                      ? 'CA: 30 (1hr per 30hrs), WA: 40'
                      : formData.sickLeaveAccrualMethod === 'per-pay-period'
                      ? 'Example: 3.33 hrs biweekly = 80hrs/yr'
                      : 'Total hours granted on anniversary'}
                  </p>
                </div>

                {(formData.sickLeaveAccrualMethod === 'per-pay-period' || formData.sickLeaveAccrualMethod === 'lump-sum') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Accrual Frequency
                    </label>
                    <select
                      value={formData.sickLeaveAccrualFrequency || 'biweekly'}
                      onChange={e => handleChange({ sickLeaveAccrualFrequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Annual Limit & Accrual Cap */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Annual Limit (hours/year)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveAnnualLimit || 0}
                    onChange={e => handleChange({ sickLeaveAnnualLimit: parseInt(e.target.value) || 0 })}
                    step="8"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="80"
                  />
                  <p className="text-xs text-slate-500 mt-1">Max hours that can accrue per year</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accrual Cap (max balance)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveAccrualCap || 0}
                    onChange={e => handleChange({ sickLeaveAccrualCap: parseInt(e.target.value) || 0 })}
                    step="8"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="80"
                  />
                  <p className="text-xs text-slate-500 mt-1">Stop accruing at this balance (CA: 48hrs)</p>
                </div>
              </div>

              {/* Waiting Periods */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accrual Waiting Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveWaitingPeriodDays || 0}
                    onChange={e => handleChange({ sickLeaveWaitingPeriodDays: parseInt(e.target.value) || 0 })}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500 mt-1">Days before accrual starts (0 = immediate)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Usage Waiting Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveUsageWaitingPeriodDays || 0}
                    onChange={e => handleChange({ sickLeaveUsageWaitingPeriodDays: parseInt(e.target.value) || 0 })}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="90"
                  />
                  <p className="text-xs text-slate-500 mt-1">Days before usage allowed (CA: 90 days)</p>
                </div>
              </div>

              {/* Carryover Policy */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year-End Carryover Policy
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChange({ sickLeaveCarryoverPolicy: 'unlimited' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveCarryoverPolicy === 'unlimited'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Unlimited</div>
                    <div className="text-xs mt-1">Full rollover</div>
                  </button>
                  <button
                    onClick={() => handleChange({ sickLeaveCarryoverPolicy: 'limited' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveCarryoverPolicy === 'limited'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Limited</div>
                    <div className="text-xs mt-1">Cap at max</div>
                  </button>
                  <button
                    onClick={() => handleChange({ sickLeaveCarryoverPolicy: 'none' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeaveCarryoverPolicy === 'none'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">None</div>
                    <div className="text-xs mt-1">Use or lose</div>
                  </button>
                </div>
              </div>

              {formData.sickLeaveCarryoverPolicy === 'limited' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maximum Carryover (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeaveMaxCarryover || 0}
                    onChange={e => handleChange({ sickLeaveMaxCarryover: parseInt(e.target.value) || 0 })}
                    step="8"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="48"
                  />
                  <p className="text-xs text-slate-500 mt-1">Hours that can roll over to next year (CA: 48 hrs)</p>
                </div>
              )}

              {/* Pay Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Sick Leave Pay Type (Firm Default)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChange({ 
                      sickLeavePayType: 'paid',
                      sickLeavePartialPayPercentage: 100 
                    })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeavePayType === 'paid'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Paid</div>
                    <div className="text-xs mt-1">100% pay</div>
                  </button>
                  <button
                    onClick={() => handleChange({ 
                      sickLeavePayType: 'partial',
                      sickLeavePartialPayPercentage: 50 
                    })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeavePayType === 'partial'
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Partial</div>
                    <div className="text-xs mt-1">Custom %</div>
                  </button>
                  <button
                    onClick={() => handleChange({ 
                      sickLeavePayType: 'unpaid',
                      sickLeavePartialPayPercentage: 0 
                    })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.sickLeavePayType === 'unpaid'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Unpaid</div>
                    <div className="text-xs mt-1">0% pay</div>
                  </button>
                </div>
              </div>

              {formData.sickLeavePayType === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Partial Pay Percentage
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      value={formData.sickLeavePartialPayPercentage || 50}
                      onChange={e => handleChange({ sickLeavePartialPayPercentage: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                      step="5"
                      className="flex-1"
                    />
                    <div className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-semibold">
                      {formData.sickLeavePartialPayPercentage || 50}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Employee receives {formData.sickLeavePartialPayPercentage || 50}% of regular pay for sick time
                  </p>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Employee-Level Overrides Available</p>
                    <p>You can override pay type and other policies for individual team members in their profile settings.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Overtime Policy */}
      {activeSection === 'overtime-policy' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Overtime Policy
        </h3>
        
        <div className="space-y-4">
          {/* Overtime Enabled */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-900">Overtime Enabled</label>
              <p className="text-xs text-slate-500 mt-0.5">Enable overtime pay calculations firm-wide</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.overtimeEnabled}
                onChange={e => handleChange({ overtimeEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {formData.overtimeEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Threshold (hours/week)
                  </label>
                  <input
                    type="number"
                    value={formData.overtimeDefaultThreshold}
                    onChange={e => handleChange({ overtimeDefaultThreshold: parseInt(e.target.value) || 40 })}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default OT Rate Multiplier
                  </label>
                  <select
                    value={formData.overtimeDefaultRate}
                    onChange={e => handleChange({ overtimeDefaultRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1.5">Time and a Half (1.5x)</option>
                    <option value="2.0">Double Time (2.0x)</option>
                    <option value="2.5">2.5x</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Calculation Period
                </label>
                <select
                  value={formData.overtimeCalculationPeriod}
                  onChange={e => handleChange({ overtimeCalculationPeriod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* Work Week Settings */}
      {activeSection === 'work-week' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Work Week Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Standard Hours Per Week
            </label>
            <input
              type="number"
              value={formData.standardHoursPerWeek}
              onChange={e => handleChange({ standardHoursPerWeek: parseInt(e.target.value) || 40 })}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Work Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const newWorkDays = formData.workDays.includes(idx)
                      ? formData.workDays.filter(d => d !== idx)
                      : [...formData.workDays, idx].sort((a, b) => a - b);
                    handleChange({ workDays: newWorkDays });
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.workDays.includes(idx)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Time Entry & Permissions */}
      {activeSection === 'time-entry-permissions' && (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Edit2 className="w-5 h-5 text-cyan-600" />
          Time Entry & Permissions
        </h3>
        
        <div className="space-y-6">
          {/* Time Entry Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Entry Method
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Choose how employees log their work hours
            </p>
            <select
              value={formData.timeEntryMethod || 'hybrid'}
              onChange={e => handleChange({ timeEntryMethod: e.target.value as 'clock-in-out' | 'manual-entry' | 'hybrid' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="clock-in-out">Clock In/Out Only</option>
              <option value="manual-entry">Manual Entry Only</option>
              <option value="hybrid">Hybrid (Both Methods)</option>
            </select>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-900">
                  <p className="font-medium mb-1">Clock In/Out</p>
                  <p className="text-blue-700">Employees clock in and out with real-time tracking. Best for hourly workers and strict time tracking.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-green-900">
                  <p className="font-medium mb-1">Manual Entry</p>
                  <p className="text-green-700">Employees manually enter time for specific dates and projects. Best for flexible schedules and project-based work.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-purple-900">
                  <p className="font-medium mb-1">Hybrid</p>
                  <p className="text-purple-700">Employees can use either method. Provides maximum flexibility for different work styles.</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Time Edit Permission */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User Time Edit Permission
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Control whether employees can edit their own time entries
            </p>
            <select
              value={formData.userTimeEditPermission || 'free-edit'}
              onChange={e => handleChange({ userTimeEditPermission: e.target.value as 'free-edit' | 'view-only' | 'requires-approval' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="free-edit">Free Edit</option>
              <option value="view-only">View Only</option>
              <option value="requires-approval">Requires Approval</option>
            </select>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-green-900">
                  <p className="font-medium mb-1">Free Edit</p>
                  <p className="text-green-700">Employees can freely add, edit, and manage their time entries without approval. Changes are saved immediately.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Eye className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="text-slate-900">
                  <p className="font-medium mb-1">View Only</p>
                  <p className="text-slate-700">Employees can only view their time entries. All changes must be made by managers or admins.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-amber-900">
                  <p className="font-medium mb-1">Requires Approval</p>
                  <p className="text-amber-700">Employees can edit their time, but changes are marked as "Pending" until approved by a manager. Useful for manual clock-out adjustments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}