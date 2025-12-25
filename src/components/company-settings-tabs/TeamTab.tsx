import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  RefreshCw,
  UserPlus,
  FlipHorizontal,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { EditTeamMemberInline } from './EditTeamMemberInline';

// Mock data for roles
const AVAILABLE_ROLES = [
  { id: 'admin', name: 'Admin', color: 'purple', isDefault: false },
  { id: 'senior-accountant', name: 'Senior Accountant', color: 'blue', isDefault: false },
  { id: 'accountant', name: 'Accountant', color: 'green', isDefault: false },
  { id: 'bookkeeper', name: 'Bookkeeper', color: 'yellow', isDefault: false },
  { id: 'tax-specialist', name: 'Tax Specialist', color: 'blue', isDefault: false },
  { id: 'staff', name: 'Staff', color: 'gray', isDefault: true },
];

// Mock data for client groups
const CLIENT_GROUPS = [
  { id: 'group-1', name: 'Enterprise Clients', clientCount: 15 },
  { id: 'group-2', name: 'Small Business', clientCount: 32 },
  { id: 'group-3', name: 'Non-Profit Organizations', clientCount: 8 },
  { id: 'group-4', name: 'Tech Startups', clientCount: 12 },
  { id: 'group-5', name: 'Retail Clients', clientCount: 20 },
];

// Mock data for individual clients
const CLIENTS = [
  { id: 'client-1', name: 'Acme Corporation', groupId: 'group-1' },
  { id: 'client-2', name: 'TechStart Inc.', groupId: 'group-4' },
  { id: 'client-3', name: 'Green Valley NGO', groupId: 'group-3' },
  { id: 'client-4', name: 'Main Street Bakery', groupId: 'group-2' },
  { id: 'client-5', name: 'Global Enterprises Ltd', groupId: 'group-1' },
  { id: 'client-6', name: 'Local Coffee Shop', groupId: 'group-5' },
  { id: 'client-7', name: 'Innovation Labs', groupId: 'group-4' },
  { id: 'client-8', name: 'Community Foundation', groupId: 'group-3' },
  { id: 'client-9', name: 'Downtown Boutique', groupId: 'group-5' },
  { id: 'client-10', name: 'Smith & Associates', groupId: 'group-2' },
];

type TeamMember = {
  id: string;
  name: string;
  username: string;
  email: string;
  contact: string;
  role: string;
  roleColor: string;
  userCategory: string;
  isActive: boolean;
  currentPlan: string;
  assignedClients: string[];
  assignedProjects: string[];
  assignedDocumentFolders: string[];
  assignedTasks: string[];
};

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'helper68210',
    email: 'helper68210@acounta.com',
    contact: 'helper68210@acounta.com',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Regular User',
    isActive: true,
    currentPlan: 'Active(No Plan)',
    assignedClients: ['Client A', 'Client B'],
    assignedProjects: ['Project 1', 'Project 2'],
    assignedDocumentFolders: ['Folder 1', 'Folder 2'],
    assignedTasks: ['Task 1', 'Task 2']
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'helper57893',
    email: 'helper57893@acounta.com',
    contact: 'helper57893@acounta.com',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Regular User',
    isActive: true,
    currentPlan: 'Active(No Plan)',
    assignedClients: ['Client C'],
    assignedProjects: ['Project 3'],
    assignedDocumentFolders: ['Folder 3'],
    assignedTasks: ['Task 3']
  },
  {
    id: '3',
    name: 'Alice Johnson',
    username: 'dsfdsfs',
    email: 'dsfdsfs@fds.dafef',
    contact: 'dsfdsfs@fds.dafef',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Implementation Manager',
    isActive: false,
    currentPlan: 'Inactive',
    assignedClients: [],
    assignedProjects: [],
    assignedDocumentFolders: [],
    assignedTasks: []
  },
  {
    id: '4',
    name: 'Bob Brown',
    username: 'helper53040',
    email: 'helper53040@acounta.com',
    contact: 'helper53040@acounta.com',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Regular User',
    isActive: true,
    currentPlan: 'Active(No Plan)',
    assignedClients: ['Client D'],
    assignedProjects: ['Project 4'],
    assignedDocumentFolders: ['Folder 4'],
    assignedTasks: ['Task 4']
  },
  {
    id: '5',
    name: 'Charlie Davis',
    username: 'dfggpf',
    email: 'dfggpf@ghghfhj.gh',
    contact: 'dfggpf@ghghfhj.gh',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Regular User',
    isActive: false,
    currentPlan: 'Inactive',
    assignedClients: [],
    assignedProjects: [],
    assignedDocumentFolders: [],
    assignedTasks: []
  },
  {
    id: '6',
    name: 'David Wilson',
    username: 'sdfds',
    email: 'sdfds@ghfhf-fdsfd',
    contact: 'sdfds@ghfhf-fdsfd',
    role: 'ADMIN',
    roleColor: 'purple',
    userCategory: 'Regular User',
    isActive: false,
    currentPlan: 'Inactive',
    assignedClients: [],
    assignedProjects: [],
    assignedDocumentFolders: [],
    assignedTasks: []
  }
];

export function TeamTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleToggleActive = (id: string, isActive: boolean) => {
    setTeamMembers(members =>
      members.map(m => m.id === id ? { ...m, isActive } : m)
    );
    toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
  };

  const handleDelete = (id: string) => {
    setTeamMembers(members => members.filter(m => m.id !== id));
    toast.success('User removed successfully');
  };

  const handleEdit = (member: TeamMember) => {
    console.log('Editing member:', member);
    setEditingMember(member);
    setIsCreatingNew(false);
  };

  const handleAddNew = () => {
    console.log('Adding new member');
    setEditingMember(null);
    setIsCreatingNew(true);
  };

  const handleCancel = () => {
    setEditingMember(null);
    setIsCreatingNew(false);
  };

  const handleSave = (memberData: any) => {
    if (editingMember) {
      // Update existing member
      setTeamMembers(members =>
        members.map(m => m.id === editingMember.id ? { ...m, ...memberData } : m)
      );
      toast.success('Team member updated successfully');
    } else {
      // Create new member
      const newMember: TeamMember = {
        id: `${Date.now()}`,
        name: memberData.name,
        username: memberData.email.split('@')[0],
        email: memberData.email,
        contact: memberData.email,
        role: memberData.role,
        roleColor: 'purple',
        userCategory: memberData.userCategory,
        isActive: memberData.isActive,
        currentPlan: memberData.isActive ? 'Active(No Plan)' : 'Inactive',
        assignedClients: memberData.assignedClients,
        assignedProjects: memberData.assignedProjects,
        assignedDocumentFolders: memberData.assignedDocumentFolders,
        assignedTasks: memberData.assignedTasks,
      };
      setTeamMembers(members => [...members, newMember]);
      toast.success('Team member added successfully');
    }
    handleCancel();
  };

  const filteredMembers = teamMembers.filter(member =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If editing or creating, show the inline editor
  if (editingMember || isCreatingNew) {
    console.log('Rendering EditTeamMemberInline with:', { editingMember, isCreatingNew });
    return (
      <div className="space-y-4">
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border-2 border-yellow-500">
          <p className="text-lg font-bold">DEBUG: Editor should be showing here</p>
          <p>Editing: {editingMember ? 'YES - ' + editingMember.name : 'NO'}</p>
          <p>Creating New: {isCreatingNew ? 'YES' : 'NO'}</p>
        </div>
        <EditTeamMemberInline
          member={editingMember || undefined}
          onCancel={handleCancel}
          onSave={handleSave}
          availableRoles={AVAILABLE_ROLES}
          clientGroups={CLIENT_GROUPS}
          clients={CLIENTS}
          existingEmails={teamMembers.map(m => m.email)}
        />
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* DEBUG BANNER - REMOVE AFTER TESTING */}
      <div className="bg-green-500 text-white p-4 text-center font-bold text-xl">
        ✅ NEW TEAM EDITOR LOADED - VERSION 2.0 ✅
      </div>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-1">Team Members</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredMembers.length} Team Member{filteredMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-900"
              />
            </div>
            
            {/* Refresh Button */}
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* Add Helper Account */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
            >
              <Plus className="w-4 h-4" />
              Add Helper Account
            </Button>

            {/* Add Team Member */}
            <Button className="flex items-center gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white" onClick={handleAddNew}>
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </Button>
          </div>
        </div>
      </div>

      {/* Hint Message */}
      <div className="mx-6 mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 flex items-center gap-2">
        <FlipHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
        <p className="text-sm text-purple-900 dark:text-purple-100">
          <strong>Tip:</strong> Click on any team member row to view their permissions and details
        </p>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">User name</TableHead>
              <TableHead className="text-white">Contact</TableHead>
              <TableHead className="text-white">Roles</TableHead>
              <TableHead className="text-white">User Category</TableHead>
              <TableHead className="text-white">Active?</TableHead>
              <TableHead className="text-white">Current Plans</TableHead>
              <TableHead className="text-white text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow 
                key={member.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleEdit(member)}
              >
                <TableCell className="text-gray-900 dark:text-gray-100">
                  {member.username}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {member.contact}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0"
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select defaultValue={member.userCategory}>
                    <SelectTrigger className="w-48 bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular User">Regular User</SelectItem>
                      <SelectItem value="Implementation Manager">Implementation Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={member.isActive}
                    onCheckedChange={(checked) => handleToggleActive(member.id, checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {member.currentPlan}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-purple-700 dark:hover:text-purple-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(member);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No team members found</p>
        </div>
      )}
    </Card>
  );
}