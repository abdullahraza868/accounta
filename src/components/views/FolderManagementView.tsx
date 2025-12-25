import React, { useState } from 'react';
import { FolderOpen, Plus, Trash2, Edit2, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
  permissions?: string;
}

interface FolderTemplate {
  id: string;
  name: string;
  description: string;
  folders: FolderNode[];
  isDefault?: boolean;
}

// Generate year-based folder structure
const getCurrentYear = () => new Date().getFullYear();
const getYears = () => [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Default templates
const DEFAULT_TEMPLATES: FolderTemplate[] = [
  {
    id: 'tax',
    name: 'Tax Documents',
    description: 'Year-based folders for tax documents',
    isDefault: true,
    folders: getYears().map(year => ({
      id: `tax-${year}`,
      name: year.toString(),
      permissions: 'All Access'
    }))
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Year and month folders for bookkeeping records',
    isDefault: true,
    folders: getYears().map(year => ({
      id: `bookkeeping-${year}`,
      name: year.toString(),
      permissions: 'All Access',
      children: MONTHS.map((month, idx) => ({
        id: `bookkeeping-${year}-${idx}`,
        name: month,
        permissions: 'All Access'
      }))
    }))
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Year and month folders for payroll records',
    isDefault: true,
    folders: getYears().map(year => ({
      id: `payroll-${year}`,
      name: year.toString(),
      permissions: 'All Access',
      children: MONTHS.map((month, idx) => ({
        id: `payroll-${year}-${idx}`,
        name: month,
        permissions: 'All Access'
      }))
    }))
  }
];

function FolderTreeItem({ folder, level = 0 }: { folder: FolderNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 1);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => folder.children && setIsExpanded(!isExpanded)}
      >
        {folder.children && folder.children.length > 0 ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )
        ) : (
          <div className="w-4" />
        )}
        <FolderOpen className="w-4 h-4 text-brand-primary" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{folder.name}</span>
        {folder.permissions && (
          <span className="text-xs text-gray-500 ml-auto">{folder.permissions}</span>
        )}
      </div>
      {isExpanded && folder.children && (
        <div>
          {folder.children.map(child => (
            <FolderTreeItem key={child.id} folder={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderManagementView() {
  const [templates, setTemplates] = useState<FolderTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<FolderTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Folder Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage folder templates for client document organization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Templates List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Folder Templates</h2>
                  <Button
                    onClick={() => setIsCreatingTemplate(true)}
                    className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {templates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-brand-primary border-brand-primary'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FolderOpen className="w-4 h-4 text-brand-primary flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">{template.name}</span>
                            {template.isDefault && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {template.folders.length} folder{template.folders.length > 1 ? 's' : ''}
                            {template.folders.some(f => f.children) && (
                              <span> with subfolders</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!template.isDefault && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Edit template:', template.id);
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400 hover:text-brand-primary"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {templates.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No folder templates yet</p>
                    <p className="text-sm mt-1">Click "New Template" to create one</p>
                  </div>
                )}
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedTemplate ? 'Template Preview' : 'Select a Template'}
                </h2>
              </div>

              <div className="p-6">
                {selectedTemplate ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-5 h-5 text-brand-primary" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedTemplate.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
                      <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Folder Structure
                      </div>
                      {selectedTemplate.folders.map(folder => (
                        <FolderTreeItem key={folder.id} folder={folder} />
                      ))}
                    </div>

                    {selectedTemplate.isDefault && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs">i</span>
                            </div>
                          </div>
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-1">Default Template</p>
                            <p className="text-blue-800 dark:text-blue-200">
                              This is a system default template and cannot be edited or deleted. 
                              You can create a custom template based on this structure.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Select a template to preview its structure</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Template Builder Placeholder */}
          {isCreatingTemplate && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-8">
              <div className="text-center">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Template Builder</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This feature will allow you to create custom folder templates with drag-and-drop functionality.
                  <br />
                  Coming soon!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingTemplate(false)}
                  className="rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">About Folder Templates</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>• Folder templates help you maintain consistent document organization across all clients</p>
              <p>• Templates can be applied during bulk actions or when creating new clients</p>
              <p>• Default templates are automatically updated with current year folders</p>
              <p>• Custom templates can include any folder structure you need for your workflow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
