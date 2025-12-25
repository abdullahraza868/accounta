// Reusable Memo Card Component with Template System
import { useState } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Sparkles, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export type MemoTemplate = {
  id: string;
  name: string;
  content: string;
  category: string;
};

type MemoCardWithTemplatesProps = {
  memo: string;
  onMemoChange: (memo: string) => void;
  memoTemplates: MemoTemplate[];
  onUpdateMemoTemplates: (templates: MemoTemplate[]) => void;
};

export function MemoCardWithTemplates({
  memo,
  onMemoChange,
  memoTemplates,
  onUpdateMemoTemplates,
}: MemoCardWithTemplatesProps) {
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [showMemoTemplateDialog, setShowMemoTemplateDialog] = useState(false);
  const [editingMemoTemplate, setEditingMemoTemplate] = useState<MemoTemplate | null>(null);
  const [memoTemplateForm, setMemoTemplateForm] = useState({ name: '', content: '', category: 'General' });

  const handleSaveMemoTemplate = () => {
    if (!memoTemplateForm.name.trim() || !memoTemplateForm.content.trim()) {
      toast.error('Please provide both name and content');
      return;
    }

    if (editingMemoTemplate) {
      // Update existing template
      const updatedTemplates = memoTemplates.map((t) =>
        t.id === editingMemoTemplate.id
          ? { ...t, ...memoTemplateForm }
          : t
      ).sort((a, b) => a.name.localeCompare(b.name));
      onUpdateMemoTemplates(updatedTemplates);
      toast.success('Template updated!');
    } else {
      // Create new template
      const newTemplate: MemoTemplate = {
        id: `memo-${Date.now()}`,
        ...memoTemplateForm
      };
      const updatedTemplates = [...memoTemplates, newTemplate].sort((a, b) => a.name.localeCompare(b.name));
      onUpdateMemoTemplates(updatedTemplates);
      toast.success('Template created!');
    }

    setShowMemoTemplateDialog(false);
    setMemoTemplateForm({ name: '', content: '', category: 'General' });
    setEditingMemoTemplate(null);
  };

  return (
    <>
      <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--primaryColor)' }}>Invoice Memo</h3>
          </div>
          <button
            onClick={() => setShowMemoTemplates(!showMemoTemplates)}
            className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
            style={{ color: 'var(--primaryColor)' }}
          >
            <Sparkles className="w-4 h-4" />
            {showMemoTemplates ? 'Hide Templates' : 'Use Template'}
          </button>
        </div>

        {showMemoTemplates && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose from {memoTemplates.length} templates or create your own
              </p>
              <button
                onClick={() => {
                  setMemoTemplateForm({ name: '', content: '', category: 'General' });
                  setEditingMemoTemplate(null);
                  setShowMemoTemplateDialog(true);
                }}
                className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                style={{ borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }}
              >
                <Plus className="w-4 h-4" />
                New Template
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {memoTemplates.map((template) => (
                <div
                  key={template.id}
                  className="relative p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
                >
                  <button
                    onClick={() => {
                      onMemoChange(template.content);
                      setShowMemoTemplates(false);
                      toast.success(`Applied "${template.name}"`);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm pr-2">{template.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0" style={{ color: 'var(--primaryColor)' }}>
                        {template.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{template.content}</div>
                  </button>
                  
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemoTemplateForm({
                          name: template.name,
                          content: template.content,
                          category: template.category
                        });
                        setEditingMemoTemplate(template);
                        setShowMemoTemplateDialog(true);
                      }}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-200 dark:border-gray-700"
                      style={{ color: 'var(--primaryColor)' }}
                      title="Edit template"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${template.name}"?`)) {
                          const updatedTemplates = memoTemplates.filter((t) => t.id !== template.id);
                          onUpdateMemoTemplates(updatedTemplates);
                          toast.success('Template deleted');
                        }
                      }}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 text-red-600"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Textarea
          id="memo"
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          placeholder="Add payment instructions, terms, or notes for your client..."
          rows={4}
          className="resize-none"
        />
      </Card>

      {/* Memo Template Dialog */}
      {showMemoTemplateDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMemoTemplateDialog(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--primaryColor)' }} />
                  <span style={{ color: 'var(--primaryColor)' }}>
                    {editingMemoTemplate ? 'Edit Memo Template' : 'New Memo Template'}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingMemoTemplate ? 'Update your memo template' : 'Create a reusable memo template'}
                </p>
              </div>
              <button
                onClick={() => setShowMemoTemplateDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="template-name" className="text-base mb-2 block">Template Name</Label>
                <Input
                  id="template-name"
                  value={memoTemplateForm.name}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, name: e.target.value })}
                  placeholder="e.g., Net 30 - Standard"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="template-category" className="text-base mb-2 block">Category</Label>
                <select
                  id="template-category"
                  value={memoTemplateForm.category}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="General">General</option>
                  <option value="Payment Terms">Payment Terms</option>
                  <option value="Payment Details">Payment Details</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <Label htmlFor="template-content" className="text-base mb-2 block">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={memoTemplateForm.content}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, content: e.target.value })}
                  placeholder="Enter the memo text that will be used when this template is selected..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMemoTemplateDialog(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveMemoTemplate}
                  className="flex-1 h-11"
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {editingMemoTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
