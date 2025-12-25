# Fix for CreateInvoiceTemplateWizard Step 3 - Add Preview

## Problem
Step 3 (Line Items) page doesn't have a preview like the AddInvoiceView final page does.

## Solution
Replace the Step 3 section (lines 1142-1644) with a two-column layout:
- Left column (2/3 width): All the form fields
- Right column (1/3 width): Sticky preview card with template information and action buttons

## Changes Needed

### 1. Change the container div (line 1142)
**FROM:**
```typescript
<div className="max-w-6xl mx-auto p-8 space-y-6">
```

**TO:**
```typescript
<div className="max-w-7xl mx-auto p-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Template Form */}
    <div className="lg:col-span-2 space-y-6">
```

### 2. Keep all existing content but wrap it in the left column
- Template Info Card
- Line Items Card
- Total section  
- Recurring Settings
- Payment Methods
- Memo

### 3. Remove the Action Buttons section (lines 1619-1643)
Remove this entire section:
```typescript
{/* Action Buttons */}
<div className="flex items-center justify-between">
  <Button variant="outline"...>Back to Basic Info</Button>
  ...
</div>
```

### 4. Close the left column and add right column preview
**ADD AFTER THE MEMO SECTION (after line 1617):**
```typescript
              </div>

              {/* Right Column - Template Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl border-2 rounded-xl" style={{ borderColor: 'var(--primaryColor)' }}>
                    {/* Preview Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-sm opacity-90">Template Preview</p>
                          <p className="text-lg font-semibold">{templateName || 'New Template'}</p>
                        </div>
                        <FileText className="w-8 h-8 opacity-80" />
                      </div>
                    </div>

                    {/* Preview Body - Stripe Style */}
                    <div className="p-8 bg-white dark:bg-gray-900 relative">
                      {/* Template Icon Background */}
                      <div className="absolute top-6 right-6 opacity-10">
                        <div className="text-7xl">{templateIcon}</div>
                      </div>

                      {/* Total Amount - Large */}
                      <div className="mb-1">
                        <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                          ${calculateTotal().toFixed(2)}
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="mb-8 text-gray-500 text-sm">
                        {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
                        {recurrenceData && ` • ${recurrenceData.pattern}`}
                      </div>

                      {/* Three Row Layout */}
                      <div className="space-y-2 mb-6">
                        {/* Category */}
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-24">Category</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {templateCategory}
                          </span>
                        </div>

                        {/* Line Items */}
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-24">Line Items</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {lineItems.length > 0 ? `${lineItems.length} ${lineItems.length === 1 ? 'item' : 'items'}` : 'No items'}
                          </span>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex gap-8">
                          <span className="text-gray-500 text-sm w-24">Payments</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {selectedPaymentMethods.length > 0 
                              ? selectedPaymentMethods.map(m => m.toUpperCase()).join(', ')
                              : 'None selected'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Discount badge if applied */}
                      {discount && (
                        <div className="mb-4 inline-block">
                          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            {discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}
                          </span>
                        </div>
                      )}

                      {/* View template details link */}
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-gray-500 text-sm">
                          {memo ? (
                            <div className="line-clamp-2">{memo}</div>
                          ) : (
                            <div className="italic">No memo added</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleSaveTemplate}
                      className="w-full gap-2 h-12"
                      style={{ backgroundColor: 'var(--primaryColor)' }}
                    >
                      <Save className="w-4 h-4" />
                      Save Template
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleStepNavigation('basic')}
                      >
                        Back
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
```

### 5. Ensure proper closing
After the right column, you need to close:
- The grid div
- The outer container div
- The currentStep === 'lineItems' conditional

This matches the pattern from AddInvoiceView.tsx Step 3.
