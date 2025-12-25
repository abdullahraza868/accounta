import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ProjectTask } from './WorkflowContext';

interface TimeTrackingDetailDialogProps {
  task: ProjectTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeTrackingDetailDialog({ task, open, onOpenChange }: TimeTrackingDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Time Tracking Details - {task.title}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detailed time tracking view coming soon...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
