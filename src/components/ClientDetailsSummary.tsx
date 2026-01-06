import React from 'react';
import { Client } from '../App';
import { Building2, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { getServiceIcon } from './ServiceIcons';
import { cn } from './ui/utils';

type ClientDetailsSummaryProps = {
  client: Client;
  actions?: React.ReactNode;
};

export function ClientDetailsSummary({ client, actions }: ClientDetailsSummaryProps) {
  // Format services for display
  const formatServiceLabel = (service: string) => {
    // Convert service name to "Service Client" format
    return `${service} Client`;
  };

  // Get service display - show max 2 services
  const getServiceDisplay = () => {
    if (!client.services || client.services.length === 0) {
      return null;
    }

    // Show up to 2 services
    const servicesToShow = client.services.slice(0, 2).filter(Boolean);
    
    if (servicesToShow.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {servicesToShow.map((service, index) => {
          const ServiceIcon = getServiceIcon(service);
          return (
            <Badge 
              key={index}
              variant="secondary" 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
            >
              <ServiceIcon className="w-3 h-3" />
              {formatServiceLabel(service)}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Client Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className={cn(
            "w-10 h-10 flex-shrink-0 border-2",
            client.type === 'Business'
              ? "border-blue-100 dark:border-blue-900"
              : "border-green-100 dark:border-green-900"
          )}>
            <AvatarFallback className={cn(
              client.type === 'Business'
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            )}>
              {client.type === 'Business' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {client.name}
              </h3>
              {getServiceDisplay() && (
                <div className="flex items-center gap-2">
                  {getServiceDisplay()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0.5 flex-shrink-0 font-medium",
                  client.type === 'Business'
                    ? "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20"
                    : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20"
                )}
              >
                {client.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

