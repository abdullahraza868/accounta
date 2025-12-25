import React from 'react';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface TablePaginationCompactProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Compact pagination for use inside Card borders (e.g., Split Views)
 * Shows only page info and navigation buttons without items-per-page selector
 */
export function TablePaginationCompact({
  currentPage,
  totalPages,
  onPageChange
}: TablePaginationCompactProps) {
  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display (max 5)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }
    
    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        
        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        
        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className="h-7 w-7 p-0 text-xs"
            style={currentPage === pageNum ? { backgroundColor: 'var(--primaryColor)' } : undefined}
          >
            {pageNum}
          </Button>
        ))}
        
        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        
        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 p-0"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}