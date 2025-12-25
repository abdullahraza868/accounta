import { CreditCard, Eye, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type BankAccountData = {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
};

type BankAccountCardProps = {
  data: BankAccountData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (data: BankAccountData) => void;
  onRequestView: () => void;
  isUnlocked: boolean;
};

export function BankAccountCard({
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onRequestView,
  isUnlocked,
}: BankAccountCardProps) {
  const displayAccountNumber = isUnlocked ? data.accountNumber : `****${data.accountNumber.slice(-4)}`;

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Bank Account Information</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2 text-xs gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={onSave} className="h-7 px-2 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!isEditing ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.bankName}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</div>
                <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                  {displayAccountNumber}
                </div>
              </div>
              {!isUnlocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestView}
                  className="gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs h-8"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Routing Number</div>
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">{data.routingNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Type</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{data.accountType}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
              <Input
                id="bankName"
                value={data.bankName}
                onChange={(e) => onChange({ ...data, bankName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="accountNumber" className="text-xs">Account Number</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accountNumber"
                  value={isUnlocked ? data.accountNumber : data.accountNumber}
                  onChange={(e) => onChange({ ...data, accountNumber: e.target.value })}
                  disabled={!isUnlocked}
                  className="flex-1"
                />
                {!isUnlocked && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onRequestView}
                    className="h-10 px-3 text-xs gap-1.5 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View & Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="routingNumber" className="text-xs">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={data.routingNumber}
                  onChange={(e) => onChange({ ...data, routingNumber: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="accountType" className="text-xs">Account Type</Label>
                <Select value={data.accountType} onValueChange={(val) => onChange({ ...data, accountType: val })}>
                  <SelectTrigger id="accountType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Business Checking">Business Checking</SelectItem>
                    <SelectItem value="Business Savings">Business Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
