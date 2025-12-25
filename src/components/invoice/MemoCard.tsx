// Reusable Memo Card Component
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { MessageSquare } from 'lucide-react';

type MemoCardProps = {
  memo: string;
  onMemoChange: (memo: string) => void;
};

export function MemoCard({ memo, onMemoChange }: MemoCardProps) {
  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
          Invoice Memo
        </Label>
      </div>
      <Textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="Add a memo or payment instructions..."
        className="min-h-[100px] resize-none"
      />
    </Card>
  );
}
