// Reusable Line Item Template Dialog Component
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, FileText, DollarSign, Check, Clock } from 'lucide-react';

export type LineItemTemplate = {
  id: string;
  name: string;
  description?: string;
  category: 'Bookkeeping' | 'Tax' | 'Consulting' | 'Audit' | 'Payroll' | 'Other';
  defaultRate: number;
  usageCount: number;
  lastUsed: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  'Bookkeeping': '#8B5CF6',
  'Tax': '#3B82F6',
  'Consulting': '#10B981',
  'Audit': '#F59E0B',
  'Payroll': '#EF4444',
  'Other': '#6B7280',
};

type LineItemTemplateDialogProps = {
  isOpen: boolean;
  templates: LineItemTemplate[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTemplate: (template: LineItemTemplate) => void;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
};

export function LineItemTemplateDialog({
  isOpen,
  templates,
  searchQuery,
  onSearchChange,
  onSelectTemplate,
  onClose,
  onBackdropClick,
}: LineItemTemplateDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-1">Add Line Item from Template</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select a template to quickly add a line item to your invoice
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left group relative overflow-hidden bg-white dark:bg-gray-900"
              >
                {/* Price Badge - Top Right */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                  ${template.defaultRate.toFixed(2)}
                </div>

                {/* Template Name & Category */}
                <div className="pr-28 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-medium group-hover:text-[var(--primaryColor)] transition-colors">
                      {template.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[template.category]}20`,
                        color: CATEGORY_COLORS[template.category],
                      }}
                    >
                      {template.category}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  )}
                </div>

                {/* Item Details Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">${template.defaultRate.toFixed(2)}</span>
                        <span className="text-gray-500">/ unit</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--primaryColor)' }} />
                      Click to add
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No templates found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}