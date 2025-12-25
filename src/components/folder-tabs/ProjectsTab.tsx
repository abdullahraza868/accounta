import { Client } from '../../App';
import { Folder, Plus, Calendar, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

type ProjectsTabProps = {
  client: Client;
};

export function ProjectsTab({ client }: ProjectsTabProps) {
  const projects = [
    { id: '1', name: '2024 Tax Return', status: 'in-progress', dueDate: '2025-04-15', assignee: 'John Smith' },
    { id: '2', name: 'Quarterly Bookkeeping Q4', status: 'completed', dueDate: '2024-10-31', assignee: 'Sarah Johnson' },
    { id: '3', name: 'Financial Statement Review', status: 'not-started', dueDate: '2024-11-30', assignee: 'Mike Brown' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Not Started</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-purple-700" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>{project.name}</div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {project.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{project.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
