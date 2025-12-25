import { useState } from 'react';
import { Client } from '../../App';
import { 
  FileText, Upload, Folder, Download, Share2, Trash2, MoreVertical, 
  Grid3x3, List, Search, ArrowUpDown, RefreshCw, FolderPlus, Eye, Edit,
  Star, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type FilesTabProps = {
  client: Client;
};

type ViewMode = 'grid' | 'list';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  icon?: string;
};

export function FilesTab({ client }: FilesTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Mock folder structure
  const [currentPath, setCurrentPath] = useState('clients/0322');
  
  const items: FileItem[] = [
    { 
      id: '1', 
      name: 'Firm Only Folder (Not Shared With Clients)', 
      type: 'folder',
      modified: 'October 25, 2025 10:32 AM'
    },
    {
      id: '2',
      name: 'Tax_Return_2024.pdf',
      type: 'file',
      size: '2.4 MB',
      modified: 'October 20, 2025',
      icon: '📄'
    },
    {
      id: '3',
      name: 'Bank_Statements',
      type: 'folder',
      modified: 'October 15, 2025'
    },
    {
      id: '4',
      name: 'W2_2024.pdf',
      type: 'file',
      size: '456 KB',
      modified: 'October 10, 2025',
      icon: '📄'
    },
    {
      id: '5',
      name: '1099_Forms',
      type: 'folder',
      modified: 'September 28, 2025'
    },
  ];

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Toolbar */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <FolderPlus className="w-4 h-4" />
              New Folder
            </Button>
            <Button size="sm" className="h-9 gap-2 bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort by
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder={`Search ${client.name}/0322`}
                className="pl-9 w-80 h-9"
              />
            </div>
            
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'grid' ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'list' ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="hover:text-purple-600 cursor-pointer">clients</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">0322</span>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' ? (
          // List View
          <div className="min-w-full">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedItems.size === items.length}
                      onChange={() => {
                        if (selectedItems.size === items.length) {
                          setSelectedItems(new Set());
                        } else {
                          setSelectedItems(new Set(items.map(i => i.id)));
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors group cursor-pointer",
                      selectedItems.has(item.id) && "bg-purple-50/50"
                    )}
                    onClick={() => item.type === 'folder' && console.log('Open folder:', item.name)}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.type === 'folder' ? (
                          <Folder className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                        <span className="text-sm text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{item.modified}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{item.size || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.type === 'file' && (
                            <>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="w-4 h-4 mr-2" />
                            Add to Starred
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid View
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "p-4 hover:shadow-md transition-all cursor-pointer group border-gray-200",
                    selectedItems.has(item.id) && "ring-2 ring-purple-500 bg-purple-50/30"
                  )}
                  onClick={() => item.type === 'folder' && console.log('Open folder:', item.name)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectItem(item.id);
                        }}
                      >
                        {item.type === 'folder' ? (
                          <Folder className="w-6 h-6 text-purple-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.type === 'file' && (
                            <>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="w-4 h-4 mr-2" />
                            Add to Starred
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="truncate">{item.modified}</span>
                      </div>
                      {item.size && (
                        <p className="text-xs text-gray-500">{item.size}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      {selectedItems.size > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-purple-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-900 font-medium">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
