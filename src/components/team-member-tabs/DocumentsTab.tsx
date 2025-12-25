import { TeamMember } from '../folder-tabs/TeamsTab';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  FileText,
  Upload,
  Download,
  Search,
  Folder,
  File,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

type DocumentsTabProps = {
  member: TeamMember;
};

export function DocumentsTab({ member }: DocumentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const categories = ['Tax Forms', 'Contracts', 'Benefits', 'Performance', 'Training', 'Personal'];

  const documents = [
    {
      id: '1',
      name: 'W-4_2024.pdf',
      category: 'Tax Forms',
      size: '245 KB',
      uploadedBy: 'John Smith',
      uploadedDate: '2024-10-10',
      type: 'PDF'
    },
    {
      id: '2',
      name: 'Employment_Contract.pdf',
      category: 'Contracts',
      size: '1.2 MB',
      uploadedBy: 'HR Department',
      uploadedDate: '2024-01-15',
      type: 'PDF'
    },
    {
      id: '3',
      name: 'Health_Insurance_Enrollment.pdf',
      category: 'Benefits',
      size: '387 KB',
      uploadedBy: 'John Smith',
      uploadedDate: '2024-09-15',
      type: 'PDF'
    },
    {
      id: '4',
      name: 'Q3_Performance_Review.pdf',
      category: 'Performance',
      size: '156 KB',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2024-09-28',
      type: 'PDF'
    },
    {
      id: '5',
      name: 'Cybersecurity_Training_Certificate.pdf',
      category: 'Training',
      size: '92 KB',
      uploadedBy: 'Training Portal',
      uploadedDate: '2024-10-05',
      type: 'PDF'
    },
    {
      id: '6',
      name: 'Direct_Deposit_Form.pdf',
      category: 'Personal',
      size: '123 KB',
      uploadedBy: 'John Smith',
      uploadedDate: '2024-08-22',
      type: 'PDF'
    },
    {
      id: '7',
      name: 'I-9_Employment_Verification.pdf',
      category: 'Tax Forms',
      size: '298 KB',
      uploadedBy: 'HR Department',
      uploadedDate: '2024-01-15',
      type: 'PDF'
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory.length === 0 || 
      selectedCategory.includes(doc.category);
    
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategory(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tax Forms': 'bg-red-50 text-red-700 border-red-200',
      'Contracts': 'bg-blue-50 text-blue-700 border-blue-200',
      'Benefits': 'bg-green-50 text-green-700 border-green-200',
      'Performance': 'bg-purple-50 text-purple-700 border-purple-200',
      'Training': 'bg-orange-50 text-orange-700 border-orange-200',
      'Personal': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employee Documents</h2>
          <p className="text-sm text-gray-500 mt-1">All documents for {member.name}</p>
        </div>
        <Button className="bg-gradient-to-br from-purple-600 to-purple-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Category
              {selectedCategory.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedCategory.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              Filter by Category
            </div>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategory.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedCategory.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory([])}>
                  Clear Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => {
          const count = documents.filter(d => d.category === category).length;
          return (
            <Card 
              key={category}
              className="p-3 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory([category])}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">{category}</p>
                  <p className="text-xs text-gray-500">{count} file{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Documents List */}
      <Card className="border border-gray-200/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{doc.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{doc.uploadedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm || selectedCategory.length > 0
                  ? 'No documents found matching your filters'
                  : 'No documents uploaded yet'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
