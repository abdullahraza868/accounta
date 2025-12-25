import { useState } from 'react';
import { List, Users, Search, Play } from 'lucide-react';
import { cn } from '../ui/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { IncomingDocumentsView } from './IncomingDocumentsView';
import { IncomingDocumentsClientView } from './IncomingDocumentsClientView';

type ViewMode = 'all' | 'by-client';

export function IncomingDocumentsViewWrapper() {
  const [viewMode, setViewMode] = useState<ViewMode>('by-client');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* Header with Toggle, Search, and Review Mode */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Incoming Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review and manage client documents
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-4 px-4 pb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'all'
                    ? "bg-white dark:bg-gray-700 text-brand-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <List className="w-4 h-4" />
                By Time
              </button>
              <button
                onClick={() => setViewMode('by-client')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'by-client'
                    ? "bg-white dark:bg-gray-700 text-brand-primary shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <Users className="w-4 h-4" />
                By Client
              </button>
            </div>

            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Review Mode Button */}
          <Button className="btn-primary h-9">
            <Play className="w-4 h-4 mr-2" />
            Review Mode
          </Button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden p-6">
        {viewMode === 'all' ? (
          <IncomingDocumentsView />
        ) : (
          <IncomingDocumentsClientView />
        )}
      </div>
    </div>
  );
}