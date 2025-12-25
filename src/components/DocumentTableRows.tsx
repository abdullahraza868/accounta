import { Fragment } from 'react';
import { Badge } from './ui/badge';

interface Category {
  id: string;
  name: string;
  order: number;
}

interface DocumentGroup {
  category: Category;
  documents: any[];
}

interface DocumentTableRowsProps {
  showOrganizeView: boolean;
  organizedDocuments: DocumentGroup[];
  documents: any[];
  renderDocumentRow: (doc: any) => JSX.Element;
}

export function DocumentTableRows({
  showOrganizeView,
  organizedDocuments,
  documents,
  renderDocumentRow,
}: DocumentTableRowsProps) {
  if (showOrganizeView) {
    return (
      <>
        {organizedDocuments.flatMap((group) => [
          // Category header row
          <tr key={`header-${group.category.id}`} className="bg-purple-50 dark:bg-purple-900/20 border-t-2 border-purple-200 dark:border-purple-700">
            <td colSpan={8} className="px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  {group.category.order}. {group.category.name}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
                  {group.documents.length}
                </Badge>
              </div>
            </td>
          </tr>,
          // Documents in this category
          ...group.documents.map((doc) => (
            <Fragment key={doc.id}>
              {renderDocumentRow(doc)}
            </Fragment>
          ))
        ])}
      </>
    );
  }

  return (
    <>
      {documents.map((doc) => (
        <Fragment key={doc.id}>
          {renderDocumentRow(doc)}
        </Fragment>
      ))}
    </>
  );
}
