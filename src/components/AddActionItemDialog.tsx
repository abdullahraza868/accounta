import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from './ui/utils';
import { format, parse } from 'date-fns';

type AddActionItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { id?: number; title: string; description?: string; dueDate?: string }) => void;
  clientName: string;
  editItem?: { id: number; title: string; description?: string; dueDate?: string } | null;
};

export function AddActionItemDialog({ open, onOpenChange, onSave, clientName, editItem }: AddActionItemDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description || '');
      if (editItem.dueDate) {
        try {
          setDueDate(parse(editItem.dueDate, 'yyyy-MM-dd', new Date()));
        } catch (e) {
          setDueDate(undefined);
        }
      } else {
        setDueDate(undefined);
      }
    } else {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
    }
  }, [editItem, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      ...(editItem && { id: editItem.id }),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="action-item-description">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Action Item' : 'Add Action Item'}</DialogTitle>
          <DialogDescription id="action-item-description">
            {editItem ? `Update action item for ${clientName}` : `Create a new action item for ${clientName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title <span className="text-red-600">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Upload Q3 Financial Statements"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div>
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1.5",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim()}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="text-white"
          >
            {editItem ? 'Update Action Item' : 'Add Action Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}