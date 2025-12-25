import { Shield, Eye, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type SSNCardProps = {
  ssn: string;
  onRequestView: () => void;
  isUnlocked: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (ssn: string) => void;
};

export function SSNCard({ 
  ssn, 
  onRequestView, 
  isUnlocked, 
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange
}: SSNCardProps) {
  const displaySSN = isUnlocked ? ssn : `***-**-${ssn.slice(-4)}`;

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Social Security Number</h3>
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
      <CardContent className="p-4 flex-1 flex flex-col">
        {!isEditing ? (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">SSN</div>
                  <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    {displaySSN}
                  </div>
                </div>
              </div>
              {!isUnlocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestView}
                  className="gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Eye className="w-4 h-4" />
                  View Full SSN
                </Button>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              This information is protected and requires password verification to view
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="ssn" className="text-xs">Social Security Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="ssn"
                value={isUnlocked ? ssn : ssn}
                onChange={(e) => onChange(e.target.value)}
                disabled={!isUnlocked}
                placeholder="XXX-XX-XXXX"
                className="flex-1 font-mono"
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
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Password verification required to view and edit this field
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
