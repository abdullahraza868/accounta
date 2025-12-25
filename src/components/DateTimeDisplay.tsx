import { useAppSettings } from '../contexts/AppSettingsContext';

interface DateTimeDisplayProps {
  date: Date | string;
  className?: string;
  dateClassName?: string;
  timeClassName?: string;
}

/**
 * Standard date/time display component used across all tables.
 * Displays date on top line and time on bottom line.
 * Automatically uses the date/time format from Application Settings.
 * 
 * @example
 * <DateTimeDisplay date={invoice.created} />
 */
export function DateTimeDisplay({ 
  date, 
  className = "",
  dateClassName = "text-sm text-gray-900 dark:text-gray-100",
  timeClassName = "text-xs text-gray-500 dark:text-gray-400"
}: DateTimeDisplayProps) {
  const { formatDateTime } = useAppSettings();
  
  const formatted = formatDateTime(date);
  const [dateLine, timeLine] = formatted.split('\n');
  
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className={dateClassName}>{dateLine}</span>
      <span className={timeClassName}>{timeLine}</span>
    </div>
  );
}

interface DateDisplayProps {
  date: Date | string;
  className?: string;
}

/**
 * Standard date-only display component.
 * Automatically uses the date format from Application Settings.
 * 
 * @example
 * <DateDisplay date={invoice.dueDate} />
 */
export function DateDisplay({ 
  date, 
  className = "text-sm text-gray-900 dark:text-gray-100"
}: DateDisplayProps) {
  const { formatDate } = useAppSettings();
  
  return (
    <span className={className}>{formatDate(date)}</span>
  );
}
