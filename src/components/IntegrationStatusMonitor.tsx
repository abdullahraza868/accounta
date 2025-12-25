import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  X,
  ExternalLink,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from './ui/utils';
import { useNavigate } from 'react-router-dom';

export type IntegrationIssue = {
  id: string;
  integrationName: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  detailedMessage?: string;
  actionLabel: string;
  actionUrl?: string;
  onAction?: () => void;
  timestamp: Date;
  affectedUsers?: number;
  canDismiss: boolean;
};

type IntegrationStatusMonitorProps = {
  issues: IntegrationIssue[];
  onDismiss: (issueId: string) => void;
  onReconnect: (integrationId: string) => void;
};

export function IntegrationStatusMonitor({
  issues,
  onDismiss,
  onReconnect,
}: IntegrationStatusMonitorProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeIssues = issues.filter(issue => !dismissedIds.has(issue.id));
  const hasIssues = activeIssues.length > 0;

  const criticalIssues = activeIssues.filter(i => i.severity === 'critical');
  const errorIssues = activeIssues.filter(i => i.severity === 'error');
  const warningIssues = activeIssues.filter(i => i.severity === 'warning');

  const handleDismiss = (issueId: string) => {
    setDismissedIds(prev => new Set([...prev, issueId]));
    onDismiss(issueId);
  };

  const getSeverityConfig = (severity: 'warning' | 'error' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-900 dark:text-red-100',
          subtext: 'text-red-800 dark:text-red-200',
          icon: XCircle,
          iconColor: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
        };
      case 'error':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-300 dark:border-orange-700',
          text: 'text-orange-900 dark:text-orange-100',
          subtext: 'text-orange-800 dark:text-orange-200',
          icon: AlertTriangle,
          iconColor: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-300 dark:border-amber-700',
          text: 'text-amber-900 dark:text-amber-100',
          subtext: 'text-amber-800 dark:text-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        };
    }
  };

  if (!hasIssues) {
    return null;
  }

  return (
    <div className="relative z-10">
      <Card
        className={cn(
          'border-2 transition-all',
          criticalIssues.length > 0
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
            : errorIssues.length > 0
            ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
            : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
        )}
      >
        {/* Header - Always visible */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {criticalIssues.length > 0 ? (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              ) : errorIssues.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      'font-semibold',
                      criticalIssues.length > 0
                        ? 'text-red-900 dark:text-red-100'
                        : errorIssues.length > 0
                        ? 'text-orange-900 dark:text-orange-100'
                        : 'text-amber-900 dark:text-amber-100'
                    )}
                  >
                    {criticalIssues.length > 0
                      ? 'Critical Integration Issues'
                      : errorIssues.length > 0
                      ? 'Integration Issues Detected'
                      : 'Integration Warnings'}
                  </h3>
                  <Badge
                    className={cn(
                      criticalIssues.length > 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                        : errorIssues.length > 0
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    )}
                  >
                    {activeIssues.length} {activeIssues.length === 1 ? 'Issue' : 'Issues'}
                  </Badge>
                </div>
                <p
                  className={cn(
                    'text-sm',
                    criticalIssues.length > 0
                      ? 'text-red-800 dark:text-red-200'
                      : errorIssues.length > 0
                      ? 'text-orange-800 dark:text-orange-200'
                      : 'text-amber-800 dark:text-amber-200'
                  )}
                >
                  {criticalIssues.length > 0
                    ? 'Critical services are offline. Immediate action required.'
                    : errorIssues.length > 0
                    ? 'Some integrations need attention to restore full functionality.'
                    : 'Minor integration issues detected. Please review when convenient.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/settings/company/connected');
                }}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Issues List */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            {activeIssues.map((issue) => {
              const config = getSeverityConfig(issue.severity);
              const Icon = config.icon;

              return (
                <Card
                  key={issue.id}
                  className={cn('p-4 border-2', config.bg, config.border)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className={cn('font-semibold mb-1', config.text)}>
                            {issue.integrationName}
                          </h4>
                          <p className={cn('text-sm mb-2', config.subtext)}>
                            {issue.message}
                          </p>
                          {issue.detailedMessage && (
                            <p className={cn('text-xs', config.subtext)}>
                              {issue.detailedMessage}
                            </p>
                          )}
                        </div>
                        {issue.canDismiss && (
                          <button
                            onClick={() => handleDismiss(issue.id)}
                            className={cn(
                              'p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors',
                              config.iconColor
                            )}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {issue.affectedUsers && (
                        <p className={cn('text-xs mb-3', config.subtext)}>
                          Affecting {issue.affectedUsers} team {issue.affectedUsers === 1 ? 'member' : 'members'}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (issue.onAction) {
                              issue.onAction();
                            } else if (issue.actionUrl) {
                              navigate(issue.actionUrl);
                            } else {
                              onReconnect(issue.id);
                            }
                          }}
                          className={cn(
                            'text-xs',
                            issue.severity === 'critical'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : issue.severity === 'error'
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          )}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          {issue.actionLabel}
                        </Button>
                        {issue.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(issue.actionUrl, '_blank')}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Learn More
                          </Button>
                        )}
                      </div>

                      <p className={cn('text-xs mt-2', config.subtext)}>
                        Detected {new Date(issue.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// Topbar notification badge component
type IntegrationStatusBadgeProps = {
  issueCount: number;
  severity: 'warning' | 'error' | 'critical';
  onClick: () => void;
};

export function IntegrationStatusBadge({
  issueCount,
  severity,
  onClick,
}: IntegrationStatusBadgeProps) {
  if (issueCount === 0) return null;

  const config =
    severity === 'critical'
      ? { bg: 'bg-red-500', pulse: true }
      : severity === 'error'
      ? { bg: 'bg-orange-500', pulse: true }
      : { bg: 'bg-amber-500', pulse: false };

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={`${issueCount} integration ${issueCount === 1 ? 'issue' : 'issues'}`}
    >
      <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      <span
        className={cn(
          'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold',
          config.bg,
          config.pulse && 'animate-pulse'
        )}
      >
        {issueCount}
      </span>
    </button>
  );
}
