import { useState } from 'react';
import { X, Calendar, FileText, Tag, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';

type FilterPanelProps = {
  onClose: () => void;
};

export function DocumentFilterPanel({ onClose }: FilterPanelProps) {
  const [statusMode, setStatusMode] = useState<'include' | 'exclude'>('include');
  const [documentTypeMode, setDocumentTypeMode] = useState<'include' | 'exclude'>('include');
  const [yearMode, setYearMode] = useState<'include' | 'exclude'>('include');
  const [methodMode, setMethodMode] = useState<'include' | 'exclude'>('include');

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [showNewOnly, setShowNewOnly] = useState(false);

  const statuses = [
    { id: 'pending', label: 'Pending', icon: '🟠' },
    { id: 'approved', label: 'Approved', icon: '🟢' },
    { id: 'requested', label: 'Requested', icon: '🟣' },
    { id: 'rejected', label: 'Rejected', icon: '🔴' },
  ];

  const documentTypes = [
    { id: 'w2', label: 'W-2' },
    { id: '1099', label: '1099-MISC' },
    { id: 'bank', label: 'Bank Statement' },
    { id: 'tax', label: 'Tax Return' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'receipt', label: 'Receipt' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'property', label: 'Property Tax Bill' },
    { id: 'other', label: 'Other' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const years = ['2024', '2023', '2022', '2021', '2020'];

  const methods = [
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'upload', label: 'Uploaded File', icon: '📄' },
    { id: 'text', label: 'Text Message', icon: '💬' },
  ];

  const toggleSelection = (
    array: string[],
    setter: (value: string[]) => void,
    id: string
  ) => {
    if (array.includes(id)) {
      setter(array.filter(item => item !== id));
    } else {
      setter([...array, id]);
    }
  };

  const selectAll = (setter: (value: string[]) => void, allIds: string[]) => {
    setter(allIds);
  };

  const clearAll = () => {
    setSelectedStatuses([]);
    setSelectedDocTypes([]);
    setSelectedYears([]);
    setSelectedMethods([]);
    setShowNewOnly(false);
  };

  const applyFilters = () => {
    // In real implementation, this would call a callback to apply filters
    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-brand-gradient tracking-tight">
              Filter Documents
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Refine your document list with advanced filters
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Filter - New Documents Only */}
        <div className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showNewOnly}
              onChange={(e) => setShowNewOnly(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 h-5 w-5"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">Show New Documents Only</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Filter to documents that need review or action
              </div>
            </div>
          </label>
        </div>

        <Separator />

        {/* Status Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
          </div>

          {/* Include/Exclude Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setStatusMode('include')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                statusMode === 'include'
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✓ Include
            </button>
            <button
              onClick={() => setStatusMode('exclude')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                statusMode === 'exclude'
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✕ Exclude
            </button>
          </div>

          {/* Select All Link */}
          <div className="mb-2">
            <button
              onClick={() => selectAll(setSelectedStatuses, statuses.map(s => s.id))}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select All Statuses
            </button>
          </div>

          <div className="space-y-2">
            {statuses.map((status) => (
              <label key={status.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.id)}
                  onChange={() => toggleSelection(selectedStatuses, setSelectedStatuses, status.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {status.icon} {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Document Type Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</Label>
          </div>

          {/* Include/Exclude Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setDocumentTypeMode('include')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                documentTypeMode === 'include'
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✓ Include
            </button>
            <button
              onClick={() => setDocumentTypeMode('exclude')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                documentTypeMode === 'exclude'
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✕ Exclude
            </button>
          </div>

          {/* Select All Link */}
          <div className="mb-2">
            <button
              onClick={() => selectAll(setSelectedDocTypes, documentTypes.map(d => d.id))}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select All Types
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {documentTypes.map((type) => (
              <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedDocTypes.includes(type.id)}
                  onChange={() => toggleSelection(selectedDocTypes, setSelectedDocTypes, type.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Year Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</Label>
          </div>

          {/* Include/Exclude Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setYearMode('include')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                yearMode === 'include'
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✓ Include
            </button>
            <button
              onClick={() => setYearMode('exclude')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                yearMode === 'exclude'
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✕ Exclude
            </button>
          </div>

          {/* Select All Link */}
          <div className="mb-2">
            <button
              onClick={() => selectAll(setSelectedYears, years)}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select All Years
            </button>
          </div>

          <div className="space-y-2">
            {years.map((year) => (
              <label key={year} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => toggleSelection(selectedYears, setSelectedYears, year)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {year}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Method Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Method</Label>
          </div>

          {/* Include/Exclude Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setMethodMode('include')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                methodMode === 'include'
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✓ Include
            </button>
            <button
              onClick={() => setMethodMode('exclude')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                methodMode === 'exclude'
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
              )}
            >
              ✕ Exclude
            </button>
          </div>

          {/* Select All Link */}
          <div className="mb-2">
            <button
              onClick={() => selectAll(setSelectedMethods, methods.map(m => m.id))}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select All Methods
            </button>
          </div>

          <div className="space-y-2">
            {methods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedMethods.includes(method.id)}
                  onChange={() => toggleSelection(selectedMethods, setSelectedMethods, method.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {method.icon} {method.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" style={{ color: 'var(--primaryColor)' }} />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Received Date Range</Label>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">From</Label>
              <Input type="date" className="h-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800" />
            </div>
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">To</Label>
              <Input type="date" className="h-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl"
            onClick={clearAll}
          >
            Reset
          </Button>
          <Button
            className="flex-1 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(to bottom right, var(--primaryColor), var(--secondaryColor))',
              color: 'white',
            }}
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
