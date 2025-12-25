import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ClientNameWithLinkProps = {
  clientName: string;
  clientId: string;
  className?: string;
  iconClassName?: string;
};

export function ClientNameWithLink({ 
  clientName, 
  clientId, 
  className = 'text-sm text-gray-900',
  iconClassName = 'w-3.5 h-3.5 text-purple-600 dark:text-purple-400'
}: ClientNameWithLinkProps) {
  const navigate = useNavigate();
  
  return (
    <div className="inline-flex items-center gap-0.5 group">
      <span className={className}>{clientName}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/clients?clientId=${clientId}`);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded shrink-0"
        title="Open client folder"
      >
        <ExternalLink className={iconClassName} />
      </button>
    </div>
  );
}
