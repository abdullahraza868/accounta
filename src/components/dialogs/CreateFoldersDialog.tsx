import React, { useState } from 'react';
import { X, FolderPlus, FolderOpen, ChevronRight, Plus, Trash2, ChevronDown, Check } from 'lucide-react';
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

interface CreateFoldersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onCreateFolders: (template: FolderTemplate) => void;
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
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer"
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
        <span className="text-sm text-gray-700">{folder.name}</span>
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

export function CreateFoldersDialog({ isOpen, onClose, selectedCount, onCreateFolders }: CreateFoldersDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FolderTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<FolderTemplate[]>([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  if (!isOpen) return null;

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onCreateFolders(selectedTemplate);
      setSelectedTemplate(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setShowCustomBuilder(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
          }}
        >
          <div className="flex items-center gap-3">
            <FolderPlus className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Create Folder Structure
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Create folder structure in <span className="font-semibold text-brand-primary">{selectedCount} client{selectedCount > 1 ? 's' : ''}</span> document area
            </p>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select a Template</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                className="rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create Custom Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-brand-primary border-brand-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FolderOpen className="w-4 h-4 text-brand-primary flex-shrink-0" />
                          <span className="font-medium text-gray-900">{template.name}</span>
                          {template.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="text-xs text-gray-500">
                          {template.folders.length} folder{template.folders.length > 1 ? 's' : ''}
                          {template.folders.some(f => f.children) && (
                            <span> with subfolders</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-brand-primary" />
                Preview: {selectedTemplate.name}
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                {selectedTemplate.folders.map(folder => (
                  <FolderTreeItem key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}

          {/* Custom Builder Placeholder */}
          {showCustomBuilder && (
            <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">Custom Template Builder</h4>
              <p className="text-sm text-gray-500 mb-4">
                This feature will allow you to create custom folder templates.
                <br />
                It will be available in Settings → Folders for full template management.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomBuilder(false)}
                className="rounded-lg"
              >
                Close Builder
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {selectedTemplate && (
              <span>Apply "{selectedTemplate.name}" to {selectedCount} client{selectedCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              className="rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
