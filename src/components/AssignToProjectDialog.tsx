import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import {
  Folder,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

type AssignToProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailId: string;
  clientId?: string;
  clientName?: string;
};

type Project = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: 'active' | 'completed' | 'on-hold';
  dueDate?: string;
  type: string;
};

export function AssignToProjectDialog({
  open,
  onOpenChange,
  emailId,
  clientId,
  clientName,
}: AssignToProjectDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Mock projects - filter by client if clientId is provided
  const allProjects: Project[] = [
    {
      id: 'p1',
      name: '2024 Tax Return',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      status: 'active',
      dueDate: '2025-04-15',
      type: 'Tax Preparation',
    },
    {
      id: 'p2',
      name: 'Q4 2024 Review',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      status: 'active',
      dueDate: '2025-01-15',
      type: 'Financial Review',
    },
    {
      id: 'p3',
      name: 'Payroll Setup',
      clientId: '1',
      clientName: 'Troy Business Services LLC',
      status: 'completed',
      type: 'Payroll',
    },
    {
      id: 'p4',
      name: 'Year-End Financial Review',
      clientId: '3',
      clientName: 'Best Face Forward',
      status: 'active',
      dueDate: '2025-12-20',
      type: 'Financial Review',
    },
    {
      id: 'p5',
      name: 'Business Entity Formation',
      clientId: '3',
      clientName: 'Best Face Forward',
      status: 'on-hold',
      type: 'Consulting',
    },
  ];

  const projects = clientId
    ? allProjects.filter(p => p.clientId === clientId)
    : allProjects;

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAssign = () => {
    if (selectedProjects.length === 0) {
      toast.error('Please select at least one project');
      return;
    }

    const selectedProjectNames = filteredProjects
      .filter(p => selectedProjects.includes(p.id))
      .map(p => p.name);

    toast.success(
      `Email assigned to ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`,
      {
        description: selectedProjectNames.join(', '),
      }
    );

    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby="assign-project-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Assign Email to Project
          </DialogTitle>
          <DialogDescription id="assign-project-description">
            {clientName
              ? `Select projects from ${clientName} to assign this email`
              : 'Select one or more projects to assign this email'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Project List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                <Folder className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No projects found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map(project => (
                  <Card
                    key={project.id}
                    className={`p-4 cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-700 ${
                      selectedProjects.includes(project.id)
                        ? 'border-purple-500 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
                        : ''
                    }`}
                    onClick={() => handleToggleProject(project.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => handleToggleProject(project.id)}
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Building2 className="w-3 h-3" />
                                <span>{project.clientName}</span>
                              </div>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <Badge variant="secondary" className="text-xs">
                                {project.type}
                              </Badge>
                            </div>
                          </div>

                          <Badge
                            variant="secondary"
                            className={`text-xs gap-1 ${getStatusColor(project.status)}`}
                          >
                            {getStatusIcon(project.status)}
                            {project.status}
                          </Badge>
                        </div>

                        {project.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedProjects.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
              {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="gap-2"
            disabled={selectedProjects.length === 0}
          >
            <Folder className="w-4 h-4" />
            Assign to {selectedProjects.length > 0 ? `${selectedProjects.length} ` : ''}Project
            {selectedProjects.length > 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
