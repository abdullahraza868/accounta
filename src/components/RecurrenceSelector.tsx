import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { Repeat, Calendar, X, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type RecurrenceData = {
  pattern: RecurrencePattern;
  interval: number;
  startDate?: string;
  endDate?: string;
  occurrences?: number;
  endType: 'never' | 'date' | 'occurrences';
};

type RecurrenceSelectorProps = {
  value: RecurrenceData;
  onChange: (value: RecurrenceData) => void;
  className?: string;
  allowEndDate?: boolean; // If false, hides "On Date" end option (for templates)
  showTemplateMessage?: boolean; // If true, shows message about setting dates when using template
};

const recurrenceOptions: { value: RecurrencePattern; label: string; icon: string }[] = [
  { value: 'none', label: 'No Recurrence', icon: '🚫' },
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
  { value: 'quarterly', label: 'Quarterly', icon: '📊' },
  { value: 'yearly', label: 'Yearly', icon: '🎯' },
];

export function RecurrenceSelector({ value, onChange, className, allowEndDate = true, showTemplateMessage = false }: RecurrenceSelectorProps) {
  const handlePatternChange = (pattern: RecurrencePattern) => {
    onChange({
      ...value,
      pattern,
      interval: pattern === 'none' ? 1 : value.interval,
    });
  };

  const handleIntervalChange = (interval: number) => {
    onChange({ ...value, interval: Math.max(1, interval) });
  };

  const handleEndTypeChange = (endType: RecurrenceData['endType']) => {
    onChange({ ...value, endType });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...value, endDate });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({ ...value, occurrences: Math.max(1, occurrences) });
  };

  const handleStartDateChange = (startDate: string) => {
    onChange({ ...value, startDate });
  };

  const getIntervalLabel = () => {
    switch (value.pattern) {
      case 'daily': return 'day(s)';
      case 'weekly': return 'week(s)';
      case 'monthly': return 'month(s)';
      case 'quarterly': return 'quarter(s)';
      case 'yearly': return 'year(s)';
      default: return '';
    }
  };

  const getRecurrenceSummary = () => {
    if (value.pattern === 'none') return 'This invoice will not repeat';
    
    let summary = `Repeats every ${value.interval > 1 ? value.interval + ' ' : ''}${getIntervalLabel()}`;
    
    if (value.endType === 'date' && value.endDate) {
      const date = new Date(value.endDate);
      summary += `, until ${date.toLocaleDateString()}`;
    } else if (value.endType === 'occurrences' && value.occurrences) {
      summary += `, for ${value.occurrences} occurrence${value.occurrences > 1 ? 's' : ''}`;
    } else {
      summary += ', indefinitely';
    }
    
    return summary;
  };

  return (
    <div className={className}>
      {/* Pattern Selection */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {recurrenceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePatternChange(option.value)}
            className={cn(
              "p-4 border-2 rounded-lg text-left transition-all hover:shadow-md",
              value.pattern === option.value
                ? 'bg-purple-50 dark:bg-purple-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
            style={{
              borderColor: value.pattern === option.value ? 'var(--primaryColor)' : undefined
            }}
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <div className="text-sm font-medium">{option.label}</div>
          </button>
        ))}
      </div>

      {/* Additional Options (shown when not 'none') */}
      {value.pattern !== 'none' && (
        <div className="space-y-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
          {/* Interval */}
          <div>
            <Label className="mb-2 block">Repeat Every</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIntervalChange(value.interval - 1)}
                  className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={value.interval <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <Input
                  type="number"
                  min="1"
                  value={value.interval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <button
                  onClick={() => handleIntervalChange(value.interval + 1)}
                  className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getIntervalLabel()}
              </span>
            </div>
          </div>

          {/* Start Date */}
          {allowEndDate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Start Date (Optional)</Label>
                {value.startDate && (
                  <button
                    onClick={() => handleStartDateChange('')}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-2">
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Choose when invoices start, how often they repeat, and when they should end (or continue indefinitely).
                </div>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  value={value.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="pl-10"
                  placeholder="Select start date"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If not set, recurring will start from the invoice sent date
              </p>
            </div>
          )}

          {/* End Condition */}
          <div>
            <Label className="mb-3 block">Ends</Label>
            <div className="space-y-3">
              {/* Never */}
              <button
                onClick={() => handleEndTypeChange('never')}
                className={cn(
                  "w-full p-3 border-2 rounded-lg text-left transition-all",
                  value.endType === 'never'
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                style={{
                  borderColor: value.endType === 'never' ? 'var(--primaryColor)' : undefined
                }}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    value.endType === 'never' && 'border-purple-600'
                  )}
                  style={{
                    borderColor: value.endType === 'never' ? 'var(--primaryColor)' : undefined
                  }}>
                    {value.endType === 'never' && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }} />
                    )}
                  </div>
                  <span className="text-sm font-medium">Never</span>
                </div>
              </button>

              {/* On Date */}
              {allowEndDate && (
                <div
                  className={cn(
                    "w-full p-3 border-2 rounded-lg text-left transition-all",
                    value.endType === 'date'
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                  style={{
                    borderColor: value.endType === 'date' ? 'var(--primaryColor)' : undefined
                  }}
                >
                  <button
                    onClick={() => handleEndTypeChange('date')}
                    className="flex items-center gap-2 mb-2 w-full text-left"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      value.endType === 'date' && 'border-purple-600'
                    )}
                    style={{
                      borderColor: value.endType === 'date' ? 'var(--primaryColor)' : undefined
                    }}>
                      {value.endType === 'date' && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }} />
                      )}
                    </div>
                    <span className="text-sm font-medium">On Date</span>
                  </button>
                  {value.endType === 'date' && (
                    <div className="ml-6 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        type="date"
                        value={value.endDate || ''}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="pl-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* After Occurrences */}
              <div
                className={cn(
                  "w-full p-3 border-2 rounded-lg text-left transition-all",
                  value.endType === 'occurrences'
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                style={{
                  borderColor: value.endType === 'occurrences' ? 'var(--primaryColor)' : undefined
                }}
              >
                <button
                  onClick={() => handleEndTypeChange('occurrences')}
                  className="flex items-center gap-2 mb-2 w-full text-left"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    value.endType === 'occurrences' && 'border-purple-600'
                  )}
                  style={{
                    borderColor: value.endType === 'occurrences' ? 'var(--primaryColor)' : undefined
                  }}>
                    {value.endType === 'occurrences' && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primaryColor)' }} />
                    )}
                  </div>
                  <span className="text-sm font-medium">After Number of Occurrences</span>
                </button>
                {value.endType === 'occurrences' && (
                  <div className="ml-6 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOccurrencesChange((value.occurrences || 1) - 1);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(value.occurrences || 1) <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <Input
                      type="number"
                      min="1"
                      value={value.occurrences || 1}
                      onChange={(e) => handleOccurrencesChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOccurrencesChange((value.occurrences || 1) + 1);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      occurrence{(value.occurrences || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Repeat className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                {getRecurrenceSummary()}
              </div>
            </div>
            
            {/* Template Message */}
            {showTemplateMessage && (
              <div className="flex items-start gap-2 p-3 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Calendar className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  Start and end dates will be set when you create invoices using this template
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}