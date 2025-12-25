import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Clock, Building2 } from 'lucide-react';

interface TimeEntry {
  id: string;
  clientName: string;
  projectId?: string;
  taskId: string;
  hours: number;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  clientName: string;
  name: string;
  tasks?: Array<{ id: string; name: string }>;
}

interface TimeEntryPopupContentProps {
  hours: number;
  onHoursChange: (hours: number) => void;
  isUncategorized: boolean;
  onUncategorizedChange: (value: boolean) => void;
  selectedClient: string;
  onClientChange: (client: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  clients: Client[];
  projects: Project[];
  existingEntries?: TimeEntry[];
  onSelectExistingEntry?: (entry: TimeEntry) => void;
}

export function TimeEntryPopupContent({
  hours,
  onHoursChange,
  isUncategorized,
  onUncategorizedChange,
  selectedClient,
  onClientChange,
  selectedProject,
  onProjectChange,
  notes,
  onNotesChange,
  clients,
  projects,
  existingEntries,
  onSelectExistingEntry,
}: TimeEntryPopupContentProps) {
  const filteredProjects = selectedClient
    ? projects.filter((p) => p.clientName === selectedClient)
    : [];

  return (
    <div className="space-y-4">
      {/* Hours Input */}
      <div>
        <Label htmlFor="hours" className="text-sm font-medium">
          Hours
        </Label>
        <div className="relative mt-1.5">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="hours"
            type="number"
            step="0.25"
            min="0"
            max="24"
            value={hours || ''}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
            className="pl-9"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Uncategorized Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <Label htmlFor="uncategorized" className="text-sm font-medium cursor-pointer">
            Uncategorized Time
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Track time without assigning to a client or project
          </p>
        </div>
        <Switch
          id="uncategorized"
          checked={isUncategorized}
          onCheckedChange={onUncategorizedChange}
        />
      </div>

      {/* Client Selection */}
      {!isUncategorized && (
        <>
          <div>
            <Label htmlFor="client" className="text-sm font-medium">
              Client
            </Label>
            <Select value={selectedClient} onValueChange={onClientChange}>
              <SelectTrigger id="client" className="mt-1.5">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection */}
          {selectedClient && (
            <div>
              <Label htmlFor="project" className="text-sm font-medium">
                Project
              </Label>
              <Select value={selectedProject} onValueChange={onProjectChange}>
                <SelectTrigger id="project" className="mt-1.5">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes about this time entry..."
          className="mt-1.5 min-h-[80px]"
        />
      </div>

      {/* Existing Entries for Quick Selection */}
      {existingEntries && existingEntries.length > 0 && onSelectExistingEntry && (
        <div className="border-t pt-4">
          <Label className="text-xs mb-2 block text-gray-600 dark:text-gray-400">
            Quick Select from Recent Entries
          </Label>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {existingEntries.map((entry) => (
              <Button
                key={entry.id}
                type="button"
                variant="ghost"
                onClick={() => onSelectExistingEntry(entry)}
                className="w-full justify-start text-xs h-auto py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="font-medium">{entry.clientName}</div>
                  {entry.notes && (
                    <div className="text-gray-500 dark:text-gray-400 truncate w-full">
                      {entry.notes}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
