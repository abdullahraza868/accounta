import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type AddNoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: { content: string; highlighted: boolean }) => void;
  clientName: string;
};

export function AddNoteDialog({ open, onOpenChange, onSave, clientName }: AddNoteDialogProps) {
  const [content, setContent] = useState('');
  const [highlighted, setHighlighted] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;
    
    onSave({
      content: content.trim(),
      highlighted
    });
    
    // Reset form
    setContent('');
    setHighlighted(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setContent('');
    setHighlighted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="add-note-description">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription id="add-note-description">
            Add a note for {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Note Content <span className="text-red-600">*</span></Label>
            <Textarea
              id="content"
              placeholder="Type your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="highlighted" className="cursor-pointer">
                Highlight this note
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">
                Highlighted notes appear in the snapshot view
              </p>
            </div>
            <Switch
              id="highlighted"
              checked={highlighted}
              onCheckedChange={setHighlighted}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!content.trim()}
            style={{ backgroundColor: 'var(--primaryColor)' }}
            className="text-white"
          >
            Add Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}