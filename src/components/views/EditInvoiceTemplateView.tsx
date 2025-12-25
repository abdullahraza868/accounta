// EditInvoiceTemplateView Component - Edit existing invoice templates
// Uses the EXACT same design as AddInvoiceView step 3
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { RecurrenceSelector, RecurrenceData } from '../RecurrenceSelector';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Save,
  X,
  Repeat,
  Sparkles,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Tag,
  Clock,
  Percent,
  Search,
  Pencil,
} from 'lucide-react';

// Category types
const TEMPLATE_CATEGORIES = [
  'Accounting',
  'Audit',
  'Bookkeeping',
  'Consulting',
  'Other',
  'Payroll',
  'Tax',
] as const;

type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Accounting': '#8B5CF6',
  'Bookkeeping': '#3B82F6',
  'Tax': '#10B981',
  'Consulting': '#F59E0B',
  'Audit': '#EF4444',
  'Payroll': '#EC4899',
  'Other': '#6B7280',
};

const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  'Accounting': '📊',
  'Bookkeeping': '📚',
  'Tax': '📄',
  'Consulting': '💼',
  'Audit': '🔍',
  'Payroll': '💰',
  'Other': '📋',
};

const EMOJI_OPTIONS = ['📚', '📊', '💼', '📄', '🏢', '📅', '🧮', '🗺️', '💰', '🔍', '💡', '📋', '📈', '💵', '🎯'];

type LineItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  isRecurring?: boolean;
  recurrenceData?: RecurrenceData | null;
  memo?: string;
  lineItems: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }[];
};

type DiscountType = 'percentage' | 'amount';
type Discount = {
  type: DiscountType;
  value: number;
};

// Mock line item templates
type LineItemTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  defaultRate: number;
};

const mockLineItemTemplates: LineItemTemplate[] = [
  { id: '1', name: 'Monthly Bookkeeping', description: 'Monthly bookkeeping services', category: 'Bookkeeping', defaultRate: 500 },
  { id: '2', name: 'Accounts Payable', description: 'AP processing and management', category: 'Bookkeeping', defaultRate: 300 },
  { id: '3', name: 'Bank Reconciliation', description: 'Monthly bank reconciliation', category: 'Bookkeeping', defaultRate: 200 },
  { id: '4', name: 'Financial Statements', description: 'Monthly financial statement preparation', category: 'Accounting', defaultRate: 400 },
  { id: '5', name: 'General Ledger Review', description: 'GL account review and cleanup', category: 'Accounting', defaultRate: 350 },
  { id: '6', name: 'Individual Tax Return', description: 'Personal income tax preparation', category: 'Tax', defaultRate: 350 },
  { id: '7', name: 'Business Tax Return', description: 'Corporate tax return preparation', category: 'Tax', defaultRate: 850 },
  { id: '8', name: 'Tax Planning Session', description: 'Strategic tax planning consultation', category: 'Tax', defaultRate: 250 },
  { id: '9', name: 'Hourly Consulting', description: 'General business consulting', category: 'Consulting', defaultRate: 200 },
  { id: '10', name: 'Payroll Processing', description: 'Monthly payroll processing', category: 'Payroll', defaultRate: 150 },
  { id: '11', name: 'Payroll Tax Filing', description: 'Quarterly payroll tax filing', category: 'Payroll', defaultRate: 125 },
  { id: '12', name: 'Financial Audit', description: 'Annual financial statement audit', category: 'Audit', defaultRate: 2500 },
  { id: '13', name: 'Budget Analysis', description: 'Annual budget review and analysis', category: 'Accounting', defaultRate: 450 },
  { id: '14', name: 'CFO Services', description: 'Fractional CFO consulting', category: 'Consulting', defaultRate: 500 },
];

// Memo templates
type MemoTemplate = {
  id: string;
  name: string;
  content: string;
  category: string;
};

const defaultMemoTemplates: MemoTemplate[] = [
  { id: 'memo-1', name: 'Standard Payment Terms', content: 'Payment is due upon receipt of this invoice. Thank you for your prompt payment!', category: 'General' },
  { id: 'memo-2', name: 'Net 30 Terms', content: 'Payment is due within 30 days of invoice date. Please remit payment to the address listed above.', category: 'General' },
  { id: 'memo-3', name: 'Monthly Service', content: 'Thank you for your continued business. This invoice covers services provided for the current month.', category: 'Recurring' },
  { id: 'memo-4', name: 'Tax Season', content: 'This invoice is for tax preparation services. Please review and submit payment at your earliest convenience.', category: 'Tax' },
];

export function EditInvoiceTemplateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const template = location.state?.template as InvoiceTemplate | undefined;
  const newLineItemInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  // If no template was passed, redirect back
  useEffect(() => {
    if (!template) {
      navigate('/manage-invoice-templates');
    }
  }, [template, navigate]);

  // Form state - Template info
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateDescription, setTemplateDescription] = useState(template?.description || '');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>(template?.category || 'Bookkeeping');
  const [templateIcon, setTemplateIcon] = useState(template?.icon || '📋');
  const [isRecurring, setIsRecurring] = useState(template?.isRecurring || false);
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData | null>(template?.recurrenceData || null);
  const [isRecurrenceExpanded, setIsRecurrenceExpanded] = useState(false);
  const [memo, setMemo] = useState(template?.memo || 'Payment is due upon receipt of this invoice. Thank you for your prompt payment!');

  // Line items state
  const [items, setItems] = useState<LineItem[]>(
    template?.lineItems.map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate,
    })) || []
  );

  // Discount state
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [discountInput, setDiscountInput] = useState({ type: 'percentage' as DiscountType, value: '' });

  // Memo templates state
  const [memoTemplates, setMemoTemplates] = useState<MemoTemplate[]>(defaultMemoTemplates);
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [showMemoTemplateDialog, setShowMemoTemplateDialog] = useState(false);
  const [editingMemoTemplate, setEditingMemoTemplate] = useState<MemoTemplate | null>(null);
  const [memoTemplateForm, setMemoTemplateForm] = useState({ name: '', content: '', category: 'General' });

  // Dialog states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showTemplateItems, setShowTemplateItems] = useState(true);
  const [itemSearch, setItemSearch] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-focus discount input when popup opens
  useEffect(() => {
    if (showDiscountPopup) {
      setTimeout(() => {
        discountInputRef.current?.focus();
        discountInputRef.current?.select();
      }, 200);
    }
  }, [showDiscountPopup]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discount
    ? discount.type === 'percentage'
      ? (subtotal * discount.value) / 100
      : discount.value
    : 0;
  const total = subtotal - discountAmount;

  // Filtered line item templates
  const filteredLineItemTemplates = mockLineItemTemplates.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Line item handlers
  const handleAddLineItemInline = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);

    // Focus the new input after render
    setTimeout(() => {
      if (newLineItemInputRef.current) {
        newLineItemInputRef.current.focus();
      }
    }, 100);
  };

  const handleAddTemplateItem = (templateItem: LineItemTemplate) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: templateItem.name,
      description: templateItem.description,
      quantity: 1,
      rate: templateItem.defaultRate,
      amount: templateItem.defaultRate,
    };
    setItems([...items, newItem]);
    setShowAddItemDialog(false);
    toast.success(`Added "${templateItem.name}"`);
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'rate', value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: numValue };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleUpdateItemField = (id: string, field: 'name' | 'description', value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleIncrementItem = (id: string, field: 'quantity' | 'rate') => {
    setItems(items.map(item => {
      if (item.id === id) {
        const increment = field === 'quantity' ? 0.25 : 10;
        const updated = { ...item, [field]: item[field] + increment };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleDecrementItem = (id: string, field: 'quantity' | 'rate') => {
    setItems(items.map(item => {
      if (item.id === id) {
        const decrement = field === 'quantity' ? 0.25 : 10;
        const newValue = Math.max(0, item[field] - decrement);
        const updated = { ...item, [field]: newValue };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  // Discount handlers
  const handleRemoveDiscount = () => {
    setDiscount(null);
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput.value);
    if (isNaN(value) || value <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (discountInput.type === 'percentage' && value > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    setDiscount({
      type: discountInput.type,
      value: value,
    });
    setShowDiscountPopup(false);
    setDiscountInput({ type: 'percentage', value: '' });
    toast.success('Discount applied successfully');
  };

  // Memo template handlers
  const handleSaveMemoTemplate = () => {
    if (!memoTemplateForm.name.trim() || !memoTemplateForm.content.trim()) {
      alert('Please enter both template name and content');
      return;
    }

    if (editingMemoTemplate) {
      setMemoTemplates(memoTemplates.map(t =>
        t.id === editingMemoTemplate.id
          ? { ...t, name: memoTemplateForm.name, content: memoTemplateForm.content, category: memoTemplateForm.category }
          : t
      ));
      toast.success('Memo template updated');
    } else {
      const newTemplate: MemoTemplate = {
        id: `memo-${Date.now()}`,
        name: memoTemplateForm.name,
        content: memoTemplateForm.content,
        category: memoTemplateForm.category,
      };
      setMemoTemplates([...memoTemplates, newTemplate]);
      toast.success('Memo template created');
    }

    setShowMemoTemplateDialog(false);
    setEditingMemoTemplate(null);
    setMemoTemplateForm({ name: '', content: '', category: 'General' });
  };

  const handleDeleteMemoTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this memo template?')) {
      setMemoTemplates(memoTemplates.filter(t => t.id !== id));
      toast.success('Memo template deleted');
    }
  };

  const handleDialogBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      setClickCount(0);
      setShowAddItemDialog(false);
    } else {
      setClickCount(1);
      const timer = setTimeout(() => {
        setClickCount(0);
        setClickTimer(null);
      }, 300);
      setClickTimer(timer);
    }
  };

  const handleSave = () => {
    // Validation
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const hasEmptyItems = items.some(item => !item.name.trim());
    if (hasEmptyItems) {
      alert('Please fill in all line item names');
      return;
    }

    const updatedTemplate: InvoiceTemplate = {
      id: template?.id || Date.now().toString(),
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      icon: templateIcon,
      isRecurring,
      recurrenceData: isRecurring ? recurrenceData : null,
      memo,
      lineItems: items.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      }))
    };

    console.log('Saving template:', updatedTemplate);
    toast.success('Template saved successfully!');
    
    navigate('/manage-invoice-templates', {
      state: { 
        savedTemplate: updatedTemplate,
        message: 'Template saved successfully!' 
      }
    });
  };

  if (!template) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/manage-invoice-templates')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Edit Template</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modify template details and line items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Template Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Info Card */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                  Template Information
                </h3>
                
                <div className="space-y-4">
                  {/* Template Name */}
                  <div>
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                      className="mt-1.5 h-10"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Enter template description"
                      className="mt-1.5"
                      rows={2}
                    />
                  </div>

                  {/* Visual Category Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Category <span className="text-red-500 text-lg">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setTemplateCategory(cat)}
                          className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                            templateCategory === cat
                              ? 'border-[var(--primaryColor)] shadow-lg scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          style={templateCategory === cat ? { backgroundColor: `${CATEGORY_COLORS[cat]}10` } : {}}
                        >
                          <div className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</div>
                          <div className="text-sm font-medium">{cat}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <Label>Select Icon (Optional)</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-5xl p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        {templateIcon}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-sm px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-[var(--primaryColor)] transition-colors"
                          >
                            Change Icon
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-2">
                              {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setTemplateIcon(emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="w-10 h-10 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recurring Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Recurring Invoice Template</Label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!isRecurring) {
                            // Enable recurring
                            setIsRecurring(true);
                            setIsRecurrenceExpanded(true);
                            if (!recurrenceData) {
                              setRecurrenceData({
                                pattern: 'none',
                                interval: 1,
                                endType: 'never'
                              });
                            }
                          } else {
                            // Just toggle expansion
                            setIsRecurrenceExpanded(!isRecurrenceExpanded);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                          isRecurring && recurrenceData && recurrenceData.pattern !== 'none'
                            ? 'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800' 
                            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" style={{ color: isRecurring && recurrenceData && recurrenceData.pattern !== 'none' ? 'var(--primaryColor)' : undefined }} />
                        <span className={isRecurring && recurrenceData && recurrenceData.pattern !== 'none' ? 'font-medium' : ''} style={{ color: isRecurring && recurrenceData && recurrenceData.pattern !== 'none' ? 'var(--primaryColor)' : undefined }}>
                          {isRecurring && recurrenceData && recurrenceData.pattern !== 'none' ? (
                            <>
                              {recurrenceData.interval > 1 ? `Every ${recurrenceData.interval} ` : ''}
                              {recurrenceData.pattern === 'daily' && (recurrenceData.interval > 1 ? 'days' : 'Daily')}
                              {recurrenceData.pattern === 'weekly' && (recurrenceData.interval > 1 ? 'weeks' : 'Weekly')}
                              {recurrenceData.pattern === 'monthly' && (recurrenceData.interval > 1 ? 'months' : 'Monthly')}
                              {recurrenceData.pattern === 'quarterly' && (recurrenceData.interval > 1 ? 'quarters' : 'Quarterly')}
                              {recurrenceData.pattern === 'yearly' && (recurrenceData.interval > 1 ? 'years' : 'Yearly')}
                            </>
                          ) : 'Recurring'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Recurrence Options */}
                  {isRecurring && isRecurrenceExpanded && recurrenceData && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <RecurrenceSelector
                        value={recurrenceData}
                        onChange={setRecurrenceData}
                        allowEndDate={false}
                        showTemplateMessage={true}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Line Items */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    Line Items
                  </h3>
                  
                  {/* Discount Toggle - Small and Subtle */}
                  {discount ? (
                    <button
                      onClick={handleRemoveDiscount}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30"
                    >
                      <Percent className="w-3.5 h-3.5 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`} off
                      </span>
                      <X className="w-3 h-3 text-green-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDiscountPopup(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Add Discount</span>
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center mb-6">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 mb-6">No line items yet</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
                      <button
                        onClick={handleAddLineItemInline}
                        className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                      >
                        <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                        <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enter manually
                        </p>
                      </button>
                      <button
                        onClick={() => {
                          setShowTemplateItems(true);
                          setShowAddItemDialog(true);
                        }}
                        className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
                      >
                        <Clock className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
                        <h3 className="font-medium text-[var(--primaryColor)] mb-1">Use Template</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pick saved items
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] transition-colors bg-white dark:bg-gray-900"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--primaryColor)', color: 'white' }}>
                                #{index + 1}
                              </span>
                              <Input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItemField(item.id, 'name', e.target.value)}
                                onFocus={(e) => e.target.select()}
                                placeholder="Service or product name"
                                className="flex-1 font-medium"
                                ref={index === items.length - 1 ? newLineItemInputRef : undefined}
                              />
                            </div>
                            <Input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleUpdateItemField(item.id, 'description', e.target.value)}
                              onFocus={(e) => e.target.select()}
                              placeholder="Description (optional)"
                              className="text-sm text-gray-500"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Quantity</Label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecrementItem(item.id, 'quantity')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="text-center h-10"
                                min="0"
                                step="0.25"
                                style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                              />
                              <button
                                onClick={() => handleIncrementItem(item.id, 'quantity')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Rate</Label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecrementItem(item.id, 'rate')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <Input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                                  onFocus={(e) => e.target.select()}
                                  className="pl-8 text-center h-10"
                                  min="0"
                                  step="0.01"
                                  style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                                />
                              </div>
                              <button
                                onClick={() => handleIncrementItem(item.id, 'rate')}
                                className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                style={{ color: 'var(--primaryColor)' }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Amount</Label>
                            <div className="h-10 px-3 flex items-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-md border-2 border-purple-200 dark:border-purple-900">
                              <span className="font-medium" style={{ color: 'var(--primaryColor)' }}>${item.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Item Buttons - Two Side by Side */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleAddLineItemInline}
                        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                        <div className="text-center">
                          <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Create Custom</div>
                          <div className="text-xs text-gray-500 mt-1">Enter manually</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowTemplateItems(true);
                          setShowAddItemDialog(true);
                        }}
                        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
                        <div className="text-center">
                          <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Use Template</div>
                          <div className="text-xs text-gray-500 mt-1">Pick saved items</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Memo */}
              <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--primaryColor)' }}>Template Memo</h3>
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
                      {memoTemplates.map((memoTemplate) => (
                        <div
                          key={memoTemplate.id}
                          className="relative p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
                        >
                          <button
                            onClick={() => {
                              setMemo(memoTemplate.content);
                              setShowMemoTemplates(false);
                              toast.success(`Applied "${memoTemplate.name}"`);
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-sm pr-2">{memoTemplate.name}</div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0" style={{ color: 'var(--primaryColor)' }}>
                                {memoTemplate.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{memoTemplate.content}</p>
                          </button>
                          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMemoTemplateForm({ 
                                  name: memoTemplate.name, 
                                  content: memoTemplate.content, 
                                  category: memoTemplate.category 
                                });
                                setEditingMemoTemplate(memoTemplate);
                                setShowMemoTemplateDialog(true);
                              }}
                              className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMemoTemplate(memoTemplate.id);
                              }}
                              className="p-1 bg-white dark:bg-gray-800 rounded shadow text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Add notes or payment instructions..."
                  rows={3}
                  className="resize-none"
                />
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card className="overflow-hidden shadow-xl border-2" style={{ borderColor: 'var(--primaryColor)' }}>
                  {/* Preview Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm opacity-90">Template Preview</p>
                        <p className="text-lg font-semibold">Your Company Name</p>
                      </div>
                      <FileText className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  {/* Preview Body - Stripe Style */}
                  <div className="p-8 bg-white dark:bg-gray-900 relative">
                    {/* Invoice Icon with Download Circle on the right - Clickable */}
                    <button 
                      onClick={() => setShowFullPreview(true)}
                      className="absolute top-6 right-6 opacity-10 hover:opacity-20 transition-opacity cursor-pointer"
                    >
                      <svg className="w-20 h-20 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="20" r="3.5" fill="currentColor" stroke="white" strokeWidth="1"/>
                        <path d="M18 18.5v3m0 0l-1.5-1.5m1.5 1.5l1.5-1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Total Amount - Large */}
                    <div className="mb-1">
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        ${total.toFixed(2)}
                      </div>
                    </div>

                    {/* Template Name */}
                    <div className="mb-8 text-gray-500 text-sm">
                      {templateName || 'Template Name'}
                    </div>

                    {/* Three Row Layout */}
                    <div className="space-y-2 mb-6">
                      {/* Category */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">Category</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                          {CATEGORY_ICONS[templateCategory]} {templateCategory}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">Icon</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm text-2xl">
                          {templateIcon}
                        </span>
                      </div>

                      {/* Memo */}
                      <div className="flex gap-8">
                        <span className="text-gray-500 text-sm w-16">Memo</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {memo || (items.length > 0 ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : 'No items')}
                        </span>
                      </div>
                    </div>

                    {/* View invoice details link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        onClick={() => setShowFullPreview(true)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center gap-1 transition-colors"
                      >
                        View template details
                        <span className="text-xs">›</span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSave}
                    className="w-full gap-2 h-12"
                    style={{ backgroundColor: 'var(--primaryColor)' }}
                  >
                    <Save className="w-4 h-4" />
                    Save Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/manage-invoice-templates')}
                    className="w-full gap-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      {showAddItemDialog && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleDialogBackdropClick}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-medium">Add Line Item</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose from templates or create a custom line item
                  </p>
                </div>
                <button
                  onClick={() => setShowAddItemDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateItems(true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    showTemplateItems
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Line Item Templates
                </button>
                <button
                  onClick={() => setShowTemplateItems(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    !showTemplateItems
                      ? 'bg-[var(--primaryColor)] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Custom
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {showTemplateItems ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search line item templates..."
                      className="pl-11 h-12"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-6">
                    {TEMPLATE_CATEGORIES.map((category) => {
                      const categoryItems = filteredLineItemTemplates.filter((item) => item.category === category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-3.5 h-3.5" style={{ color: CATEGORY_COLORS[category] }} />
                            <h4 className="text-xs font-medium" style={{ color: CATEGORY_COLORS[category] }}>
                              {category}
                            </h4>
                            <div 
                              className="h-px flex-1"
                              style={{ backgroundColor: `${CATEGORY_COLORS[category]}40` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {categoryItems.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleAddTemplateItem(item)}
                                className="p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="font-medium text-sm">{item.name}</div>
                                  <div className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                                    ${item.defaultRate}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Custom item creation coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discount Popup */}
      {showDiscountPopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDiscountPopup(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">Add Discount</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply a discount to this template</p>
              </div>
              <button
                onClick={() => setShowDiscountPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base mb-3 block">Discount Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setDiscountInput({ ...discountInput, type: 'percentage' });
                      setTimeout(() => {
                        discountInputRef.current?.focus();
                      }, 100);
                    }}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      discountInput.type === 'percentage'
                        ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Percent className="w-6 h-6 mx-auto mb-2" style={discountInput.type === 'percentage' ? { color: 'var(--primaryColor)' } : {}} />
                    <div className="font-medium">Percentage</div>
                    <div className="text-xs text-gray-500 mt-1">e.g., 10%</div>
                  </button>
                  <button
                    onClick={() => {
                      setDiscountInput({ ...discountInput, type: 'amount' });
                      setTimeout(() => {
                        discountInputRef.current?.focus();
                      }, 100);
                    }}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      discountInput.type === 'amount'
                        ? 'border-[var(--primaryColor)] bg-purple-50 dark:bg-purple-950/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-2" style={discountInput.type === 'amount' ? { color: 'var(--primaryColor)' } : {}} />
                    <div className="font-medium">Fixed Amount</div>
                    <div className="text-xs text-gray-500 mt-1">e.g., $50</div>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="discountValue" className="text-base mb-2 block">
                  Discount {discountInput.type === 'percentage' ? 'Percentage' : 'Amount'}
                </Label>
                <div className="relative">
                  {discountInput.type === 'amount' && (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  )}
                  <Input
                    ref={discountInputRef}
                    id="discountValue"
                    type="number"
                    value={discountInput.value}
                    onChange={(e) => setDiscountInput({ ...discountInput, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyDiscount();
                      }
                    }}
                    placeholder={discountInput.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    className={`h-12 ${discountInput.type === 'amount' ? 'pl-10' : ''}`}
                    min="0"
                    max={discountInput.type === 'percentage' ? '100' : undefined}
                    step="0.01"
                  />
                  {discountInput.type === 'percentage' && (
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Preview */}
              {discountInput.value && parseFloat(discountInput.value) > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>
                        Discount ({discountInput.type === 'percentage' ? `${discountInput.value}%` : `$${discountInput.value}`}):
                      </span>
                      <span className="font-medium">
                        -${(discountInput.type === 'percentage' 
                          ? (subtotal * parseFloat(discountInput.value)) / 100 
                          : parseFloat(discountInput.value)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-purple-800 font-medium" style={{ color: 'var(--primaryColor)' }}>
                      <span>New Total:</span>
                      <span>
                        ${(subtotal - (discountInput.type === 'percentage' 
                          ? (subtotal * parseFloat(discountInput.value)) / 100 
                          : parseFloat(discountInput.value)
                        )).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDiscountPopup(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleApplyDiscount}
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  Apply Discount
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">{editingMemoTemplate ? 'Edit' : 'Create'} Memo Template</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save this memo for future use</p>
              </div>
              <button
                onClick={() => setShowMemoTemplateDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="memoTemplateName">Template Name *</Label>
                <Input
                  id="memoTemplateName"
                  value={memoTemplateForm.name}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, name: e.target.value })}
                  placeholder="e.g., Standard Payment Terms"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="memoTemplateCategory">Category</Label>
                <select
                  id="memoTemplateCategory"
                  value={memoTemplateForm.category}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, category: e.target.value })}
                  className="mt-1.5 w-full h-10 px-3 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-[var(--primaryColor)] focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Recurring">Recurring</option>
                  <option value="Tax">Tax</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <Label htmlFor="memoTemplateContent">Content *</Label>
                <Textarea
                  id="memoTemplateContent"
                  value={memoTemplateForm.content}
                  onChange={(e) => setMemoTemplateForm({ ...memoTemplateForm, content: e.target.value })}
                  placeholder="Enter memo content..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowMemoTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveMemoTemplate}
                  style={{ backgroundColor: 'var(--primaryColor)' }}
                >
                  {editingMemoTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
