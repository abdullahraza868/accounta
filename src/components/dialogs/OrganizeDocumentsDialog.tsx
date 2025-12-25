import { useState } from 'react';
import { FileText, GripVertical, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';

type Document = {
  id: string;
  name: string;
  documentType: string;
  year: string;
  category?: string;
};

type TaxCategory = {
  id: string;
  name: string;
  order: number;
  description: string;
};

const TAX_CATEGORIES: TaxCategory[] = [
  { id: 'income', name: 'Income', order: 1, description: 'W-2s, 1099s, business income' },
  { id: 'deductions', name: 'Deductions', order: 2, description: 'Mortgage interest, charitable donations' },
  { id: 'credits', name: 'Credits', order: 3, description: 'Education credits, energy credits' },
  { id: 'investments', name: 'Investments', order: 4, description: 'Stock sales, dividends, interest' },
  { id: 'business', name: 'Business Expenses', order: 5, description: 'Business receipts, mileage' },
  { id: 'property', name: 'Property & Assets', order: 6, description: 'Property tax, rental income' },
  { id: 'healthcare', name: 'Healthcare', order: 7, description: 'Medical expenses, HSA contributions' },
  { id: 'other', name: 'Other', order: 8, description: 'Miscellaneous documents' },
];

interface OrganizeDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  onOrganize: (documentCategories: Record<string, string>) => void;
}

export function OrganizeDocumentsDialog({
  open,
  onOpenChange,
  documents,
  onOrganize,
}: OrganizeDocumentsDialogProps) {
  const [documentCategories, setDocumentCategories] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryAssign = (docId: string, categoryId: string) => {
    setDocumentCategories(prev => ({
      ...prev,
      [docId]: categoryId,
    }));
  };

  const handleSave = () => {
    onOrganize(documentCategories);
    toast.success('Documents organized successfully');
    onOpenChange(false);
  };

  // Group documents by assigned category
  const groupedDocuments = TAX_CATEGORIES.map(category => ({
    category,
    documents: documents.filter(doc => documentCategories[doc.id] === category.id),
  }));

  const uncategorizedDocs = documents.filter(doc => !documentCategories[doc.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]" aria-describedby="organize-documents-description">
        <DialogHeader>
          <DialogTitle>Organize Documents by Tax Form Sections</DialogTitle>
          <DialogDescription id="organize-documents-description">
            Organize documents into tax form categories. Documents will appear in the order they belong on tax forms.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4 h-[600px]">
          {/* Left: Uncategorized Documents */}
          <div className="border rounded-lg p-4 flex flex-col">
            <div className="mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                Uncategorized Documents
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag or click to assign to a category
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {uncategorizedDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-2 border rounded-md bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {doc.documentType} • {doc.year}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {uncategorizedDocs.length === 0 && (
                  <div className="text-center py-8">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      All documents organized!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Middle: Category Selector */}
          <div className="border rounded-lg p-4 flex flex-col">
            <div className="mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                Tax Form Categories
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select a category to assign documents
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {TAX_CATEGORIES.map(category => {
                  const count = groupedDocuments.find(g => g.category.id === category.id)?.documents.length || 0;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedCategory === category.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {category.order}.
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {count}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Category Documents */}
          <div className="border rounded-lg p-4 flex flex-col">
            <div className="mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                {selectedCategory 
                  ? TAX_CATEGORIES.find(c => c.id === selectedCategory)?.name 
                  : 'Select a Category'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCategory
                  ? `Documents in ${TAX_CATEGORIES.find(c => c.id === selectedCategory)?.name}`
                  : 'View documents in each category'}
              </p>
            </div>
            <ScrollArea className="flex-1">
              {selectedCategory ? (
                <div className="space-y-2">
                  {/* Add button for uncategorized docs */}
                  {uncategorizedDocs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Click to add:
                      </p>
                      {uncategorizedDocs.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => handleCategoryAssign(doc.id, selectedCategory)}
                          className="w-full p-2 mb-2 border border-dashed rounded-md bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 transition-colors text-left"
                        >
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            + {doc.name}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {doc.documentType} • {doc.year}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Already categorized docs */}
                  {groupedDocuments
                    .find(g => g.category.id === selectedCategory)
                    ?.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="p-2 border rounded-md bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {doc.documentType} • {doc.year}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setDocumentCategories(prev => {
                                const newCategories = { ...prev };
                                delete newCategories[doc.id];
                                return newCategories;
                              });
                            }}
                            className="text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                  {groupedDocuments.find(g => g.category.id === selectedCategory)?.documents.length === 0 &&
                    uncategorizedDocs.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No documents in this category
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a category to view documents
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Organization
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
