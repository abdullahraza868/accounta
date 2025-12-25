import { useNavigate } from 'react-router-dom';
import { Building2, User, ExternalLink } from 'lucide-react';
import { cn } from './ui/utils';

interface ClientCellDisplayProps {
  clientId: string;
  clientName: string;
  clientType?: 'Business' | 'Individual';
  onNameClick?: () => void;
  className?: string;
  showAvatar?: boolean;
  showFolderLink?: boolean;
}

/**
 * Standard client display component for table cells.
 * Shows avatar (Business/Individual), client name with click action, and folder link icon.
 * Used across all tables for consistent client name presentation.
 * 
 * @example
 * // Basic usage with avatar and folder link
 * <ClientCellDisplay 
 *   clientId="123"
 *   clientName="Acme Corporation"
 *   clientType="Business"
 * />
 * 
 * @example
 * // With custom name click handler (e.g., view document)
 * <ClientCellDisplay 
 *   clientId="123"
 *   clientName="John Doe"
 *   clientType="Individual"
 *   onNameClick={() => console.log('View document')}
 * />
 * 
 * @example
 * // Without avatar
 * <ClientCellDisplay 
 *   clientId="123"
 *   clientName="Jane Smith"
 *   showAvatar={false}
 * />
 */
export function ClientCellDisplay({
  clientId,
  clientName,
  clientType = 'Individual',
  onNameClick,
  className = '',
  showAvatar = true,
  showFolderLink = true,
}: ClientCellDisplayProps) {
  const navigate = useNavigate();

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/clients?clientId=${clientId}`, '_blank');
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNameClick) {
      onNameClick();
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showAvatar && (
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          clientType === 'Business' 
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : "bg-gradient-to-br from-green-500 to-green-600"
        )}>
          {clientType === 'Business' ? (
            <Building2 className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
      )}
      
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap group/clientname">
          <button
            onClick={handleNameClick}
            className={cn(
              "text-gray-900 dark:text-gray-100 truncate",
              onNameClick && "hover:underline"
            )}
          >
            {clientName}
          </button>
          
          {showFolderLink && (
            <button
              onClick={handleFolderClick}
              className="opacity-0 group-hover/clientname:opacity-100 transition-opacity p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded shrink-0"
              title="Open client folder"
              style={{
                '--hover-bg': 'var(--primaryColor)',
                opacity: 0,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const parent = e.currentTarget.closest('.group\\/clientname');
                if (parent && !parent.matches(':hover')) {
                  e.currentTarget.style.opacity = '0';
                }
              }}
            >
              <ExternalLink 
                className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" 
                style={{ color: 'var(--primaryColor)' }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}