import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  FileSignature,
  Plus,
  Activity,
  ArrowLeft,
  Copy,
  Tag,
  Calendar,
  User,
  Settings,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { UseTemplateDialog } from '../UseTemplateDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

type SignatureTemplate = {
  id: string;
  name: string;
  year: number;
  createdAt: string;
  createdBy: string;
  lastUsed?: string;
  usageCount: number;
  description?: string;
  category: 'Tax' | 'Engagement' | 'Custom';
  icon: string;
  roles?: ('client' | 'client-spouse' | 'external' | 'firm-user')[];
};

const mockTemplates: SignatureTemplate[] = [
  {
    id: '1',
    name: 'Engagement Letter 2024',
    year: 2024,
    createdAt: '2024-01-15',
    createdBy: 'Sarah Johnson',
    lastUsed: '2024-10-26',
    usageCount: 45,
    category: 'Engagement',
    description: 'Standard engagement letter for new clients',
    icon: '📝'
  },
  {
    id: '2',
    name: 'Form 8879 - Individual',
    year: 2024,
    createdAt: '2024-01-10',
    createdBy: 'System',
    lastUsed: '2024-10-25',
    usageCount: 234,
    category: 'Tax',
    description: 'IRS e-file signature authorization for individual returns',
    icon: '📋'
  },
  {
    id: '3',
    name: 'Form 8879 - Business',
    year: 2024,
    createdAt: '2024-01-10',
    createdBy: 'System',
    lastUsed: '2024-10-20',
    usageCount: 156,
    category: 'Tax',
    description: 'IRS e-file signature authorization for business returns',
    icon: '🏢'
  },
  {
    id: '4',
    name: 'Tax Authorization Letter',
    year: 2024,
    createdAt: '2024-02-01',
    createdBy: 'Michael Chen',
    lastUsed: '2024-10-15',
    usageCount: 78,
    category: 'Tax',
    description: 'Authorization to represent client before IRS',
    icon: '🔐'
  },
  {
    id: '5',
    name: 'W-9 Request',
    year: 2024,
    createdAt: '2024-01-20',
    createdBy: 'Sarah Johnson',
    lastUsed: '2024-10-10',
    usageCount: 92,
    category: 'Custom',
    description: 'Request for taxpayer identification',
    icon: '📄'
  },
  {
    id: '6',
    name: 'Quarterly Review Agreement',
    year: 2024,
    createdAt: '2024-03-10',
    createdBy: 'Emily Davis',
    lastUsed: '2024-09-30',
    usageCount: 34,
    category: 'Engagement',
    description: 'Agreement for quarterly financial review services',
    icon: '📊'
  },
  {
    id: '7',
    name: 'Extension Authorization',
    year: 2024,
    createdAt: '2024-03-01',
    createdBy: 'Michael Chen',
    lastUsed: '2024-04-15',
    usageCount: 156,
    category: 'Tax',
    description: 'Authorization to file tax extension',
    icon: '⏰'
  },
  {
    id: '8',
    name: 'Engagement Letter 2023',
    year: 2023,
    createdAt: '2023-01-15',
    createdBy: 'Sarah Johnson',
    lastUsed: '2023-12-20',
    usageCount: 89,
    category: 'Engagement',
    description: 'Standard engagement letter for 2023',
    icon: '📝'
  },
  {
    id: '9',
    name: 'Annual Tax Organizer',
    year: 2024,
    createdAt: '2024-01-05',
    createdBy: 'Sarah Johnson',
    lastUsed: '2024-10-01',
    usageCount: 187,
    category: 'Tax',
    description: 'Comprehensive tax information gathering form',
    icon: '📁'
  },
  {
    id: '10',
    name: 'Bookkeeping Services Agreement',
    year: 2024,
    createdAt: '2024-02-15',
    createdBy: 'Emily Davis',
    lastUsed: '2024-09-15',
    usageCount: 56,
    category: 'Engagement',
    description: 'Monthly bookkeeping service agreement',
    icon: '💼'
  },
];

const CATEGORY_COLORS = {
  Tax: '#3b82f6',
  Engagement: '#10b981',
  Custom: '#8b5cf6',
};

export function SignatureTemplatesView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<SignatureTemplate['category'] | 'all'>('all');
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);

  // Handler functions for template actions
  const handleUseTemplate = (templateId: string, templateName: string) => {
    setSelectedTemplateForUse({ id: templateId, name: templateName });
    setUseTemplateDialogOpen(true);
  };

  const handleViewTemplate = (templateId: string, templateName: string) => {
    console.log('Viewing template:', templateId, templateName);
    // In a real app, this would open a preview modal of the template
    alert(`Viewing template: ${templateName}\n\nThis would show a preview of the template fields and layout.`);
  };

  const handleEditTemplate = (templateId: string, templateName: string) => {
    console.log('Editing template:', templateId, templateName);
    // Navigate to template editor
    navigate(`/signature-templates/edit/${templateId}`);
  };

  const handleDuplicateTemplate = (templateId: string, templateName: string) => {
    console.log('Duplicating template:', templateId, templateName);
    // In a real app, this would create a copy of the template
    alert(`Template "${templateName}" has been duplicated.\n\nA copy has been created with the name "${templateName} (Copy)".`);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      console.log('Deleting template:', templateToDelete.id, templateToDelete.name);
      // In a real app, this would delete the template from the database
      // Show success message (could use toast)
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Get unique years for filter
  const uniqueYears = Array.from(new Set(mockTemplates.map(t => t.year))).sort((a, b) => b - a);

  // Filter templates
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || template.year === selectedYear;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesYear && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category: SignatureTemplate['category']) => {
    switch (category) {
      case 'Tax':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Engagement':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'Custom':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
    }
  };

  // Group templates by category
  const CATEGORIES: SignatureTemplate['category'][] = ['Tax', 'Engagement', 'Custom'];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signatures
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-gray-100">Signature Templates</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage reusable templates for signature requests
            </p>
          </div>
          <div className="flex gap-2">
            <NotificationDrawer 
              category="signature"
              onNavigateToSettings={() => navigate('/settings/notifications')}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Notifications
                </Button>
              }
            />
            <Button
              size="sm"
              className="gap-2"
              style={{ backgroundColor: 'var(--primaryColor)' }}
              onClick={() => navigate('/signature-templates/new')}
            >
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedYear === 'all'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                style={selectedYear === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                All Years
              </button>
              {uniqueYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    selectedYear === year
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  style={selectedYear === year ? { backgroundColor: 'var(--primaryColor)' } : {}}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === 'all'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                style={selectedCategory === 'all' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('Tax')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === 'Tax'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                style={selectedCategory === 'Tax' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                Tax
              </button>
              <button
                onClick={() => setSelectedCategory('Engagement')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === 'Engagement'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                style={selectedCategory === 'Engagement' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                Engagement
              </button>
              <button
                onClick={() => setSelectedCategory('Custom')}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === 'Custom'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                style={selectedCategory === 'Custom' ? { backgroundColor: 'var(--primaryColor)' } : {}}
              >
                Custom
              </button>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedYear !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedYear('all');
                  setSelectedCategory('all');
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTemplates.length} of {mockTemplates.length} templates
          </div>
        </div>
      </div>

      {/* Card View */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No templates found</p>
            {(searchQuery || selectedYear !== 'all' || selectedCategory !== 'all') && (
              <p className="text-sm mt-1">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              // Filter by selected category
              if (selectedCategory !== 'all' && selectedCategory !== category) return null;
              
              const categoryTemplates = filteredTemplates.filter((t) => t.category === category);
              if (categoryTemplates.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4" style={{ color: CATEGORY_COLORS[category] }} />
                    <h3 className="text-sm font-medium" style={{ color: CATEGORY_COLORS[category] }}>
                      {category}
                    </h3>
                    <div 
                      className="h-px flex-1"
                      style={{ backgroundColor: `${CATEGORY_COLORS[category]}40` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="group p-4 rounded-xl border-2 transition-all relative overflow-visible border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg cursor-pointer"
                        onClick={() => handleViewTemplate(template.id, template.name)}
                      >
                        {/* Document Preview on Hover - covers entire card except button */}
                        <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 rounded-xl flex items-center justify-center"
                          style={{ bottom: '52px', top: '34px' }}
                        >
                          <div className="w-[90%] h-[90%] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex flex-col p-3 shadow-2xl">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300 dark:border-gray-600">
                              <FileSignature className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mt-3"></div>
                              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mt-3"></div>
                              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                            </div>
                          </div>
                        </div>

                        {/* Top Right Actions */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template.id, template.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id, template.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Main Content Layout */}
                        <div className="flex gap-3 mb-2">
                          {/* Left Side - Icon, Title, Description */}
                          <div className="flex-1 min-w-0">
                            {/* Icon */}
                            <div className="text-3xl mb-2">{template.icon}</div>
                            
                            {/* Title */}
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                              {template.name}
                            </h3>

                            {/* Description */}
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {template.description}
                            </p>
                          </div>

                          {/* Right Side - Thumbnail (below edit/delete buttons) */}
                          <div className="flex flex-col items-end pt-12">
                            <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700 flex-shrink-0">
                              <FileSignature className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

                        {/* Template Details - Compact */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Category</span>
                            <Badge className={`text-xs px-2 py-0 h-5 ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Year</span>
                            <span className="text-gray-900 dark:text-gray-100">{template.year}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Created</span>
                            <span className="text-gray-900 dark:text-gray-100">{formatDate(template.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Created by</span>
                            <span className="text-gray-900 dark:text-gray-100 truncate ml-2">{template.createdBy}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Times Used</span>
                            <span className="text-gray-900 dark:text-gray-100 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {template.usageCount}
                            </span>
                          </div>
                          {template.lastUsed && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Last Used</span>
                              <span className="text-gray-900 dark:text-gray-100">{formatDate(template.lastUsed)}</span>
                            </div>
                          )}
                        </div>

                        {/* Use Template Button */}
                        <Button
                          className="w-full gap-2 relative z-30 h-9 text-sm"
                          style={{ backgroundColor: 'var(--primaryColor)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template.id, template.name);
                          }}
                        >
                          <FileSignature className="w-4 h-4" />
                          Use This Template
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Use Template Dialog */}
      {selectedTemplateForUse && (
        <UseTemplateDialog
          isOpen={useTemplateDialogOpen}
          onClose={() => {
            setUseTemplateDialogOpen(false);
            setSelectedTemplateForUse(null);
          }}
          templateId={selectedTemplateForUse.id}
          templateName={selectedTemplateForUse.name}
          onNavigateToPreview={(templateId, recipients, isGroup, groupName) => {
            navigate('/signature-templates/use', {
              state: { templateId, templateName: selectedTemplateForUse.name, recipients, isGroup, groupName }
            });
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}