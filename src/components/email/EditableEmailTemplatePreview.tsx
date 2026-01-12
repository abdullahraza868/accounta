import { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, Star, Copy, Trash2, 
  ToggleLeft, ToggleRight, Sparkles, Mail
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { format } from 'date-fns';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '../ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  isSystem: boolean;
  isFavorite: boolean;
  isAutomated?: boolean;
  automatedConfig?: {
    enabled: boolean;
    triggerType: 'birthday' | 'holiday' | 'anniversary';
    sendDate?: string;
    recipientCount?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
};

type EditableEmailTemplatePreviewProps = {
  template: EmailTemplate;
  categories: Array<{ id: string; name: string; icon: any; color: string }>;
  availableVariables: string[];
  onSave: (templateId: string, updates: Partial<EmailTemplate>) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onToggleFavorite: (templateId: string) => void;
  onToggleAutomation?: (templateId: string) => void;
  onGenerateWithAI?: () => void;
};

export function EditableEmailTemplatePreview({
  template,
  categories,
  availableVariables,
  onSave,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onToggleAutomation,
  onGenerateWithAI,
}: EditableEmailTemplatePreviewProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Individual field edit states
  const [editingField, setEditingField] = useState<'subject' | 'body' | 'tags' | 'name' | null>(null);
  const [editedValues, setEditedValues] = useState({
    subject: template.subject,
    body: template.body,
    tags: template.tags,
    name: template.name,
  });

  // Refs for auto-focus
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const category = categories.find(c => c.id === template.category);
  const CategoryIcon = category?.icon;

  // Sync edited values when template changes
  useEffect(() => {
    setEditedValues({
      subject: template.subject,
      body: template.body,
      tags: template.tags,
      name: template.name,
    });
  }, [template.id, template.subject, template.body, template.tags, template.name]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editingField === 'subject' && subjectInputRef.current) {
      subjectInputRef.current.focus();
      subjectInputRef.current.select();
    } else if (editingField === 'body' && bodyTextareaRef.current) {
      bodyTextareaRef.current.focus();
      bodyTextareaRef.current.setSelectionRange(
        bodyTextareaRef.current.value.length,
        bodyTextareaRef.current.value.length
      );
    } else if (editingField === 'tags' && tagsInputRef.current) {
      tagsInputRef.current.focus();
      tagsInputRef.current.select();
    } else if (editingField === 'name' && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingField]);

  const handleFieldClick = (field: 'subject' | 'body' | 'tags' | 'name') => {
    setEditingField(field);
    // Initialize with current template values
    setEditedValues({
      subject: template.subject,
      body: template.body,
      tags: template.tags,
      name: template.name,
    });
  };

  const handleFieldBlur = (field: 'subject' | 'body' | 'tags' | 'name') => {
    // Auto-save on blur
    const currentValue = editedValues[field];
    const originalValue = field === 'tags' 
      ? template.tags 
      : template[field];

    // Only save if value changed
    if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
      if (field === 'tags') {
        onSave(template.id, { tags: editedValues.tags });
      } else if (field === 'subject') {
        onSave(template.id, { subject: editedValues.subject });
      } else if (field === 'body') {
        onSave(template.id, { body: editedValues.body });
      } else if (field === 'name') {
        onSave(template.id, { name: editedValues.name });
      }
    }
    setEditingField(null);
  };

  const handleFieldKeyDown = (
    e: React.KeyboardEvent,
    field: 'subject' | 'body' | 'tags' | 'name'
  ) => {
    // Save on Enter (except for body which is multi-line)
    if (e.key === 'Enter' && field !== 'body' && !e.shiftKey) {
      e.preventDefault();
      handleFieldBlur(field);
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      setEditedValues({
        subject: template.subject,
        body: template.body,
        tags: template.tags,
        name: template.name,
      });
      setEditingField(null);
    }
  };

  const handleValueChange = (field: 'subject' | 'body' | 'tags' | 'name', value: string | string[]) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const isAnyFieldEditing = editingField !== null;

  return (
    <Card 
      className={`transition-all overflow-hidden ${
        isAnyFieldEditing
          ? 'border-purple-300 dark:border-purple-700 shadow-md'
          : 'border-gray-200 dark:border-gray-800'
      }`}
      style={{ 
        borderColor: isAnyFieldEditing
          ? undefined 
          : 'var(--stokeColor, #e5e7eb)' 
      }}
    >
      {/* Template Metadata Header (Compact) */}
      <div 
        className="border-b px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
        style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {CategoryIcon && (
            <div 
              className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-${category?.color}-100 dark:bg-${category?.color}-900/30`}
            >
              <CategoryIcon className={`w-3.5 h-3.5 text-${category?.color}-600 dark:text-${category?.color}-400`} />
            </div>
          )}
          {editingField === 'name' ? (
            <Input
              ref={nameInputRef}
              value={editedValues.name}
              onChange={(e) => handleValueChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              onKeyDown={(e) => handleFieldKeyDown(e, 'name')}
              className="h-6 text-xs font-medium flex-1"
              placeholder="Template name..."
            />
          ) : (
            <span 
              className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => handleFieldClick('name')}
              title="Click to edit template name"
            >
              {template.name}
            </span>
          )}
          {template.isSystem && (
            <Badge variant="outline" className="text-xs h-5">
              System
            </Badge>
          )}
          {template.isAutomated && (
            <Badge 
              variant={template.automatedConfig?.enabled ? 'default' : 'secondary'}
              className="text-xs h-5"
            >
              {template.automatedConfig?.enabled ? 'Active' : 'Inactive'}
            </Badge>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {category?.name} • {format(new Date(template.updatedAt), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleFavorite(template.id)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Star 
              className={`w-3.5 h-3.5 ${
                template.isFavorite 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-400'
              }`} 
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {!template.isSystem && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(template.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Viewer Style Layout */}
      <div className="bg-white dark:bg-gray-900">
        {/* Email Header (Like actual email) */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {/* Subject Line - Prominent like email viewer */}
              <div className="flex items-center gap-2 mb-2">
                {editingField === 'subject' ? (
                  <Input
                    ref={subjectInputRef}
                    value={editedValues.subject}
                    onChange={(e) => handleValueChange('subject', e.target.value)}
                    onBlur={() => handleFieldBlur('subject')}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'subject')}
                    placeholder="Email subject..."
                    className="text-lg font-semibold h-auto py-0.5 border-0 border-b-2 border-purple-300 dark:border-purple-700 rounded-none focus-visible:ring-0 focus-visible:border-purple-500 dark:focus-visible:border-purple-500"
                  />
                ) : (
                  <h2 
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => handleFieldClick('subject')}
                    title="Click to edit subject"
                  >
                    {template.subject || <span className="text-gray-400 italic font-normal">Click to add subject...</span>}
                  </h2>
                )}
              </div>

              {/* From/To Information - Like email viewer */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                <Avatar className="w-7 h-7">
                  <div 
                    className="w-full h-full flex items-center justify-center text-white text-xs font-medium rounded-full"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {'{{firm_name}}'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {'{{firm_email}}'} • {format(new Date(), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>

              {/* To field */}
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">To:</span> <span className="text-gray-500 dark:text-gray-400">{'{{client_name}}'} &lt;{'{{client_email}}'}&gt;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Body - White background like email viewer */}
        <div className="px-4 py-3">
          {editingField === 'body' ? (
            <div>
              {onGenerateWithAI && (
                <div className="mb-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerateWithAI}
                    className="gap-1.5 h-6 text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate with AI
                  </Button>
                </div>
              )}
              <Textarea
                ref={bodyTextareaRef}
                value={editedValues.body}
                onChange={(e) => handleValueChange('body', e.target.value)}
                onBlur={() => handleFieldBlur('body')}
                onKeyDown={(e) => handleFieldKeyDown(e, 'body')}
                placeholder="Write your email content here..."
                rows={10}
                className="font-sans text-sm resize-y border-0 focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
              />
            </div>
          ) : (
            <div 
              className="prose dark:prose-invert max-w-none cursor-pointer min-h-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => handleFieldClick('body')}
              title="Click to edit email body"
            >
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {template.body || <span className="text-gray-400 italic">Click to add email content...</span>}
              </div>
            </div>
          )}
        </div>

        {/* Tags Section - Below email body */}
        <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tags:</span>
            {editingField === 'tags' ? (
              <Input
                ref={tagsInputRef}
                value={editedValues.tags.join(', ')}
                onChange={(e) => handleValueChange(
                  'tags', 
                  e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                )}
                onBlur={() => handleFieldBlur('tags')}
                onKeyDown={(e) => handleFieldKeyDown(e, 'tags')}
                placeholder="welcome, new-client, onboarding"
                className="flex-1 h-8 text-xs"
              />
            ) : (
              <div 
                className="flex flex-wrap gap-1.5 flex-1 cursor-pointer min-h-[1.5rem] py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => handleFieldClick('tags')}
                title="Click to edit tags"
              >
                {template.tags.length > 0 ? (
                  template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">Click to add tags...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Automated Email Config */}
        {template.isAutomated && template.automatedConfig && (
          <div className="mb-3 p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                Automated Sending
              </span>
              {onToggleAutomation && (
                <button
                  onClick={() => onToggleAutomation(template.id)}
                  className="flex items-center gap-1.5"
                >
                  {template.automatedConfig.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
            </div>
            {template.automatedConfig.enabled && (
              <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                {template.automatedConfig.triggerType === 'birthday' && (
                  <p>• Sends automatically on client birthdays</p>
                )}
                {template.automatedConfig.triggerType === 'holiday' && template.automatedConfig.sendDate && (
                  <p>• Sends on {new Date(template.automatedConfig.sendDate).toLocaleDateString()}</p>
                )}
                <p>• Recipients: {template.automatedConfig.recipientCount || 0} clients</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Settings */}
      <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <CollapsibleTrigger asChild>
          <button 
            className="w-full px-4 py-2 border-t flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              More Settings
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isSettingsOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 py-3 border-t space-y-3" style={{ borderColor: 'var(--stokeColor, #e5e7eb)' }}>
            {/* Category */}
            <div>
              <Label htmlFor={`category-${template.id}`} className="text-sm">
                Category
              </Label>
              <Select 
                value={template.category} 
                onValueChange={(value) => onSave(template.id, { category: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available Variables */}
            <div>
              <Label className="text-sm mb-2 block">Available Variables</Label>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div className="grid grid-cols-2 gap-2">
                  {availableVariables.slice(0, 8).map(variable => (
                    <button
                      key={variable}
                      onClick={() => {
                        navigator.clipboard.writeText(variable);
                      }}
                      className="text-xs px-2 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded font-mono text-left transition-colors"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Click to copy • {availableVariables.length} total variables
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

