import { useState } from 'react';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';

interface ChangeYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentCount: number;
  onConfirm: (year: string) => void;
}

export function ChangeYearDialog({
  open,
  onOpenChange,
  documentCount,
  onConfirm,
}: ChangeYearDialogProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const handleConfirm = () => {
    onConfirm(selectedYear);
    toast.success(`Updated ${documentCount} document${documentCount > 1 ? 's' : ''} to year ${selectedYear}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="change-year-description">
        <DialogHeader>
          <DialogTitle>Change Document Year</DialogTitle>
          <DialogDescription id="change-year-description">
            Update the tax year for {documentCount} selected document{documentCount > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            Select Year
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year.toString())}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1",
                  selectedYear === year.toString()
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                )}
              >
                <Calendar className={cn(
                  "w-4 h-4",
                  selectedYear === year.toString()
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedYear === year.toString()
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {year}
                </span>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Update Year
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
