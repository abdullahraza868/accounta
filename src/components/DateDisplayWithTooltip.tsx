import { useAppSettings } from '../contexts/AppSettingsContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface DateDisplayWithTooltipProps {
  date: Date | string;
  time?: string;
  className?: string;
}

/**
 * Date display component that shows only the date, with full date+time in tooltip on hover.
 * Used for cleaner table layouts while preserving time information.
 * 
 * @example
 * <DateDisplayWithTooltip date={invoice.created} time={invoice.createdTime} />
 */
export function DateDisplayWithTooltip({ 
  date, 
  time,
  className = "text-sm text-gray-900 dark:text-gray-100"
}: DateDisplayWithTooltipProps) {
  const { formatDate, formatTime } = useAppSettings();
  
  // Format date for display
  const dateOnly = formatDate(date);
  
  // Format full date+time for tooltip (date @ time format)
  const fullDateTime = time ? `${formatDate(date)} @ ${time}` : dateOnly;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {dateOnly}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {fullDateTime}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}