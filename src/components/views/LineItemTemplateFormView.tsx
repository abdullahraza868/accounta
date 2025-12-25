import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Save, DollarSign, Check, Calendar, Plus, Minus } from 'lucide-react';

// Category types
const TEMPLATE_CATEGORIES = [
  'Accounting',
  'Bookkeeping',
  'Payroll',
  'Tax',
  'Consulting',
  'Audit',
  'Other'
] as const;

type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  'Accounting': '📊',
  'Bookkeeping': '📚',
  'Tax': '📄',
  'Consulting': '💼',
  'Audit': '🔍',
  'Payroll': '💰',
  'Other': '📋',
};

type LineItemTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  defaultRate: number;
  defaultQuantity?: number;
  createdDate?: string;
};

export function LineItemTemplateFormView() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingTemplate = location.state?.template as LineItemTemplate | undefined;
  const isEditMode = !!existingTemplate;
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(existingTemplate?.name || '');
  const [description, setDescription] = useState(existingTemplate?.description || '');
  const [category, setCategory] = useState<TemplateCategory>(existingTemplate?.category || 'Tax');
  const [defaultRate, setDefaultRate] = useState(existingTemplate?.defaultRate?.toString() || '');
  const [defaultQuantity, setDefaultQuantity] = useState(existingTemplate?.defaultQuantity?.toString() || '1');
  const createdDate = existingTemplate?.createdDate || new Date().toISOString();

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    defaultRate?: string;
    defaultQuantity?: string;
  }>({});

  // Focus on first field on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!defaultRate.trim()) {
      newErrors.defaultRate = 'Default rate is required';
    } else if (isNaN(Number(defaultRate)) || Number(defaultRate) <= 0) {
      newErrors.defaultRate = 'Please enter a valid amount greater than 0';
    }

    if (!defaultQuantity.trim()) {
      newErrors.defaultQuantity = 'Default quantity is required';
    } else if (isNaN(Number(defaultQuantity)) || Number(defaultQuantity) <= 0) {
      newErrors.defaultQuantity = 'Please enter a valid quantity greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const template: LineItemTemplate = {
      id: existingTemplate?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      category,
      defaultRate: Number(defaultRate),
      defaultQuantity: Number(defaultQuantity),
      createdDate,
    };

    // TODO: Save to actual state management/backend
    console.log('Saving template:', template);

    // Navigate back with success
    navigate('/billing/templates', {
      state: {
        savedTemplate: template,
        isEdit: isEditMode
      }
    });
  };

  const handleCancel = () => {
    navigate('/billing/templates');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateTotal = () => {
    const rate = Number(defaultRate) || 0;
    const qty = Number(defaultQuantity) || 1;
    return rate * qty;
  };

  const incrementQuantity = () => {
    const current = Number(defaultQuantity) || 0;
    setDefaultQuantity((current + 1).toString());
    if (errors.defaultQuantity) setErrors({ ...errors, defaultQuantity: undefined });
  };

  const decrementQuantity = () => {
    const current = Number(defaultQuantity) || 0;
    if (current > 1) {
      setDefaultQuantity((current - 1).toString());
      if (errors.defaultQuantity) setErrors({ ...errors, defaultQuantity: undefined });
    }
  };

  const incrementRate = () => {
    const current = Number(defaultRate) || 0;
    setDefaultRate((current + 1).toFixed(2));
    if (errors.defaultRate) setErrors({ ...errors, defaultRate: undefined });
  };

  const decrementRate = () => {
    const current = Number(defaultRate) || 0;
    if (current > 1) {
      setDefaultRate((current - 1).toFixed(2));
      if (errors.defaultRate) setErrors({ ...errors, defaultRate: undefined });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-xl">
                {isEditMode ? 'Edit Line Item Template' : 'New Line Item Template'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ? 'Update your line item template' : 'Create a reusable line item for faster invoicing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - 2 Column Layout */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Form (2/3) */}
            <div className="col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {/* Line Item Card */}
                <div className="space-y-3">
                  {/* Item Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: 'var(--primaryColor)' }}>
                      #1
                    </div>
                    <Input
                      type="text"
                      placeholder="Item name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={`flex-1 bg-gray-50 dark:bg-gray-900 border-0 ${errors.name ? 'ring-2 ring-red-500' : ''} ${!name.trim() ? 'ring-2 ring-blue-500' : ''}`}
                      ref={nameInputRef}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 ml-15">{errors.name}</p>
                  )}

                  {/* Description */}
                  <div className="ml-15">
                    <Input
                      type="text"
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-900 border-0"
                    />
                  </div>

                  {/* Quantity, Rate, Amount Row */}
                  <div className="grid grid-cols-3 gap-4 ml-15">
                    {/* Quantity */}
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                        Quantity
                      </Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={decrementQuantity}
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={defaultQuantity}
                          onChange={(e) => {
                            setDefaultQuantity(e.target.value);
                            if (errors.defaultQuantity) setErrors({ ...errors, defaultQuantity: undefined });
                          }}
                          onFocus={(e) => e.target.select()}
                          className={`flex-1 text-center bg-gray-50 dark:bg-gray-900 border-0 ${errors.defaultQuantity ? 'ring-2 ring-red-500' : ''} ${!defaultQuantity.trim() ? 'ring-2 ring-blue-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={incrementQuantity}
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.defaultQuantity && (
                        <p className="text-xs text-red-500 mt-1">{errors.defaultQuantity}</p>
                      )}
                    </div>

                    {/* Rate */}
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                        Rate
                      </Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={decrementRate}
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={defaultRate}
                            onChange={(e) => {
                              setDefaultRate(e.target.value);
                              if (errors.defaultRate) setErrors({ ...errors, defaultRate: undefined });
                            }}
                            onFocus={(e) => e.target.select()}
                            className={`pl-8 text-center bg-gray-50 dark:bg-gray-900 border-0 ${errors.defaultRate ? 'ring-2 ring-red-500' : ''} ${!defaultRate.trim() ? 'ring-2 ring-blue-500' : ''}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={incrementRate}
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.defaultRate && (
                        <p className="text-xs text-red-500 mt-1">{errors.defaultRate}</p>
                      )}
                    </div>

                    {/* Amount (Read-only) */}
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                        Amount
                      </Label>
                      <div className="h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex items-center justify-center font-medium" style={{ color: 'var(--primaryColor)' }}>
                        ${calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Label className="mb-3 block">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 hover:shadow-sm ${
                          category === cat
                            ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                        <span className={`text-xs font-medium ${
                          category === cat ? 'text-[var(--primaryColor)]' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {cat}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview (1/3) */}
            <div className="col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Preview - Invoice Line Item Style */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Category Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</span>
                      </div>
                    </div>

                    {/* Line Item Row */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                            <span className="font-medium">
                              {name || 'Item Name'}
                            </span>
                          </div>
                          {(description || 'Description will appear here') && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                              {description || 'Description will appear here'}
                            </p>
                          )}
                        </div>
                        <div className="px-3 py-1 rounded-full text-sm font-medium text-white flex-shrink-0" style={{ backgroundColor: 'var(--primaryColor)' }}>
                          ${calculateTotal().toFixed(2)}
                        </div>
                      </div>

                      {/* Quantity and Rate Details */}
                      <div className="ml-6 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Qty:</span>
                              <span className="font-medium">{defaultQuantity || '1'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-medium">{defaultRate ? Number(defaultRate).toFixed(2) : '0.00'}</span>
                              <span className="text-xs text-gray-500">/ unit</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(createdDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Below Preview */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSave}
                    className="w-full"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Save Changes' : 'Create Template'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}