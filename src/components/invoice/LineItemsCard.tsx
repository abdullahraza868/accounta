// Reusable Line Items Card Component
import { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Plus,
  Minus,
  Trash2,
  FileText,
  Clock,
  DollarSign,
  Percent,
  X,
  Sparkles,
} from 'lucide-react';

export type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Discount = {
  type: 'percentage' | 'amount';
  value: number;
};

type LineItemsCardProps = {
  items: InvoiceItem[];
  discount: Discount | null;
  onAddLineItemInline: () => void;
  onShowTemplateDialog: () => void;
  onUpdateItemField: (id: string, field: keyof InvoiceItem, value: any) => void;
  onUpdateItem: (id: string, field: 'quantity' | 'rate', value: string) => void;
  onIncrementItem: (id: string, field: 'quantity' | 'rate') => void;
  onDecrementItem: (id: string, field: 'quantity' | 'rate') => void;
  onRemoveItem: (id: string) => void;
  onShowDiscountPopup: () => void;
  onRemoveDiscount: () => void;
  newLineItemInputRef?: React.RefObject<HTMLInputElement>;
  onStartFromTemplate?: () => void; // Optional - only for edit invoice
};

export function LineItemsCard({
  items,
  discount,
  onAddLineItemInline,
  onShowTemplateDialog,
  onUpdateItemField,
  onUpdateItem,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onShowDiscountPopup,
  onRemoveDiscount,
  newLineItemInputRef,
  onStartFromTemplate,
}: LineItemsCardProps) {
  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
          Line Items
        </h3>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Start from Template Button - Only in Edit mode */}
          {onStartFromTemplate && (
            <button
              onClick={onStartFromTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 hover:border-purple-300"
              style={{ color: 'var(--primaryColor)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">Template</span>
            </button>
          )}

          {/* Discount Toggle */}
          {discount ? (
            <button
              onClick={onRemoveDiscount}
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
              onClick={onShowDiscountPopup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Discount</span>
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center mb-6">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 mb-6">No line items yet</p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
            <button
              onClick={onAddLineItemInline}
              className="p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-center group"
            >
              <Plus className="w-8 h-8 mx-auto mb-3 text-[var(--primaryColor)]" />
              <h3 className="font-medium text-[var(--primaryColor)] mb-1">Create Custom</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter manually
              </p>
            </button>
            <button
              onClick={onShowTemplateDialog}
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
                      onChange={(e) => onUpdateItemField(item.id, 'name', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="Service or product name"
                      className="flex-1 font-medium"
                      ref={index === items.length - 1 ? newLineItemInputRef : undefined}
                    />
                  </div>
                  <Input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => onUpdateItemField(item.id, 'description', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Description (optional)"
                    className="text-sm text-gray-500"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
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
                      onClick={() => onDecrementItem(item.id, 'quantity')}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                      style={{ color: 'var(--primaryColor)' }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="text-center h-10"
                      min="1"
                      style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                    />
                    <button
                      onClick={() => onIncrementItem(item.id, 'quantity')}
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
                      onClick={() => onDecrementItem(item.id, 'rate')}
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
                        onChange={(e) => onUpdateItem(item.id, 'rate', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="pl-8 text-center h-10"
                        min="0"
                        step="0.01"
                        style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.01em' }}
                      />
                    </div>
                    <button
                      onClick={() => onIncrementItem(item.id, 'rate')}
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
          
          {/* Add Item Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAddLineItemInline}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--primaryColor)] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--primaryColor)' }} />
              <div className="text-center">
                <div className="font-medium" style={{ color: 'var(--primaryColor)' }}>Create Custom</div>
                <div className="text-xs text-gray-500 mt-1">Enter manually</div>
              </div>
            </button>
            <button
              onClick={onShowTemplateDialog}
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
  );
}
