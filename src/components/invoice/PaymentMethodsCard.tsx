// Reusable Payment Methods Card Component
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { CreditCard, Building } from 'lucide-react';

export type PaymentMethod = 'ach' | 'amazon' | 'card';

type PaymentMethodsCardProps = {
  selectedPaymentMethods: PaymentMethod[];
  onTogglePaymentMethod: (method: PaymentMethod) => void;
};

export function PaymentMethodsCard({
  selectedPaymentMethods,
  onTogglePaymentMethod,
}: PaymentMethodsCardProps) {
  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
      <Label className="mb-4 block text-base flex items-center gap-2">
        <CreditCard className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
        Payment Methods
      </Label>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onTogglePaymentMethod('card')}
          className={`p-5 border-2 rounded-xl transition-all ${
            selectedPaymentMethods.includes('card')
              ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <CreditCard className="w-8 h-8 mb-3 mx-auto" style={selectedPaymentMethods.includes('card') ? { color: 'var(--primaryColor)' } : {}} />
          <div className="font-medium">Card</div>
          <div className="text-xs text-gray-500 mt-1">Credit/Debit</div>
        </button>
        <button
          onClick={() => onTogglePaymentMethod('ach')}
          className={`p-5 border-2 rounded-xl transition-all ${
            selectedPaymentMethods.includes('ach')
              ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Building className="w-8 h-8 mb-3 mx-auto" style={selectedPaymentMethods.includes('ach') ? { color: 'var(--primaryColor)' } : {}} />
          <div className="font-medium">ACH</div>
          <div className="text-xs text-gray-500 mt-1">Bank Transfer</div>
        </button>
        <button
          onClick={() => onTogglePaymentMethod('amazon')}
          className={`p-5 border-2 rounded-xl transition-all ${
            selectedPaymentMethods.includes('amazon')
              ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md scale-105'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="text-3xl mb-2">🛒</div>
          <div className="font-medium">Amazon Pay</div>
          <div className="text-xs text-gray-500 mt-1">Quick checkout</div>
        </button>
      </div>
    </Card>
  );
}
