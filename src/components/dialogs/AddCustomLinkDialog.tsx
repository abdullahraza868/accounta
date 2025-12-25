import { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Link as LinkIcon,
  Globe,
  Home,
  FileText,
  Folder,
  Mail,
  Phone,
  Calendar,
  Settings,
  Users,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { ClickableOptionBox } from '../ui/clickable-option-box';

type AddCustomLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (link: CustomLink) => void;
  editLink?: CustomLink | null;
  onEdit?: (link: CustomLink) => void;
};

export type CustomLink = {
  id: string;
  name: string;
  url: string;
  icon: string;
  openBehavior: 'new-window' | 'embedded';
  isCustom: true;
};

const availableIcons = [
  { id: 'globe', icon: Globe, label: 'Globe' },
  { id: 'link', icon: LinkIcon, label: 'Link' },
  { id: 'external-link', icon: ExternalLink, label: 'External Link' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'file-text', icon: FileText, label: 'Document' },
  { id: 'folder', icon: Folder, label: 'Folder' },
  { id: 'mail', icon: Mail, label: 'Mail' },
  { id: 'phone', icon: Phone, label: 'Phone' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'users', icon: Users, label: 'Users' },
];

export function AddCustomLinkDialog({ open, onOpenChange, onAdd, editLink, onEdit }: AddCustomLinkDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('globe');
  const [openBehavior, setOpenBehavior] = useState<'new-window' | 'embedded'>('embedded');
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  // Close tracking for double-click-outside-to-close
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Populate form when editLink changes
  useEffect(() => {
    if (editLink && open) {
      setName(editLink.name);
      setUrl(editLink.url);
      setSelectedIcon(editLink.icon);
      setOpenBehavior(editLink.openBehavior);
    } else if (!open) {
      resetForm();
    }
  }, [editLink, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setClickCount(prev => prev + 1);
      
      if (clickTimer) {
        clearTimeout(clickTimer);
      }

      const timer = setTimeout(() => {
        setClickCount(0);
      }, 500);
      setClickTimer(timer);

      if (clickCount + 1 >= 2) {
        onOpenChange(false);
        resetForm();
        setClickCount(0);
        if (clickTimer) clearTimeout(clickTimer);
      }
    } else {
      onOpenChange(newOpen);
      setClickCount(0);
      if (clickTimer) clearTimeout(clickTimer);
    }
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setSelectedIcon('globe');
    setOpenBehavior('embedded');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { name?: string; url?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      // Basic URL validation
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    if (editLink && onEdit) {
      // Edit mode
      onEdit({
        id: editLink.id,
        name: name.trim(),
        url: normalizedUrl,
        icon: selectedIcon,
        openBehavior,
        isCustom: true,
      });
      toast.success('Custom link updated successfully');
    } else {
      // Add mode
      onAdd({
        id: `custom-${Date.now()}`,
        name: name.trim(),
        url: normalizedUrl,
        icon: selectedIcon,
        openBehavior,
        isCustom: true,
      });
      toast.success('Custom link added successfully');
    }

    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        aria-describedby="add-custom-link-description"
      >
        <DialogHeader>
          <DialogTitle>{editLink ? 'Edit Custom Link' : 'Add Custom Link'}</DialogTitle>
          <DialogDescription id="add-custom-link-description">
            {editLink ? 'Update your custom link settings' : 'Add a custom link to your navigation menu'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="link-name">
              Link Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link-name"
              placeholder="e.g., Acounta Website"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="link-url">
              URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link-url"
              placeholder="e.g., www.acounta.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
              }}
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter URL with or without https://
            </p>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label>Select Icon</Label>
            <div className="grid grid-cols-4 gap-3">
              {availableIcons.map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <button
                    key={iconOption.id}
                    onClick={() => setSelectedIcon(iconOption.id)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      selectedIcon === iconOption.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-800'
                    }`}
                  >
                    <Icon 
                      className={`w-5 h-5 ${
                        selectedIcon === iconOption.id
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />
                    <span className={`text-xs ${
                      selectedIcon === iconOption.id
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {iconOption.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open Behavior */}
          <div className="space-y-3">
            <Label>Open Behavior</Label>
            <div className="grid grid-cols-2 gap-3">
              <ClickableOptionBox
                isChecked={openBehavior === 'embedded'}
                onToggle={() => setOpenBehavior('embedded')}
                icon={Globe}
                title="Open Embedded"
                description="Open within the app with navigation"
                primaryColor="var(--primaryColor)"
              />
              <ClickableOptionBox
                isChecked={openBehavior === 'new-window'}
                onToggle={() => setOpenBehavior('new-window')}
                icon={ExternalLink}
                title="Open in New Window"
                description="Open in a new browser tab"
                primaryColor="var(--primaryColor)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          {editLink ? (
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Update Link
            </Button>
          ) : (
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Add Link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}