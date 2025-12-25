// Reusable Discount Dialog Component
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Percent, DollarSign } from 'lucide-react';

export type DiscountType = 'percentage' | 'amount';

type DiscountDialogProps = {
  isOpen: boolean;
  discountType: DiscountType;
  discountValue: string;
  onDiscountTypeChange: (type: DiscountType) => void;
  onDiscountValueChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
};

export function DiscountDialog({
  isOpen,
  discountType,
  discountValue,
  onDiscountTypeChange,
  onDiscountValueChange,
  onApply,
  onCancel,
  onBackdropClick,
}: DiscountDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-4">Add Discount</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Discount Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onDiscountTypeChange('percentage')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  discountType === 'percentage'
                    ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Percent className="w-6 h-6 mx-auto mb-2" style={discountType === 'percentage' ? { color: 'var(--primaryColor)' } : {}} />
                <div className="font-medium">Percentage</div>
              </button>
              <button
                onClick={() => onDiscountTypeChange('amount')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  discountType === 'amount'
                    ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" style={discountType === 'amount' ? { color: 'var(--primaryColor)' } : {}} />
                <div className="font-medium">Amount</div>
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="discountValue">
              {discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
            </Label>
            <Input
              ref={inputRef}
              id="discountValue"
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
              className="mt-1.5"
              min="0"
              step={discountType === 'percentage' ? '1' : '0.01'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onApply();
                }
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onApply}
              className="flex-1"
              style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}
            >
              Apply Discount
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
