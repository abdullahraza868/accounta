import { Button } from './ui/button';
import { FileText, Edit, Trash2, Check, Repeat, ChevronDown, ChevronUp } from 'lucide-react';

type TemplateCategory = 'Accounting' | 'Bookkeeping' | 'Payroll' | 'Tax' | 'Consulting' | 'Audit' | 'Other';

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Accounting': '#8B5CF6',
  'Bookkeeping': '#3B82F6',
  'Tax': '#10B981',
  'Consulting': '#F59E0B',
  'Audit': '#EF4444',
  'Payroll': '#EC4899',
  'Other': '#6B7280',
};

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  isRecurring?: boolean;
  lineItems: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }[];
};

interface TemplateCardProps {
  template: InvoiceTemplate;
  templateTotal: number;
  isExpanded: boolean;
  displayedItems: { name: string; description?: string; quantity: number; rate: number }[];
  styleIndex: number;
  onToggleExpand: () => void;
  onUseTemplate: () => void;
}

export function TemplateCard({
  template,
  templateTotal,
  isExpanded,
  displayedItems,
  styleIndex,
  onToggleExpand,
  onUseTemplate,
}: TemplateCardProps) {
  const cardStyle = styleIndex % 6;

  return (
    <div className="relative">
      {/* Style Label */}
      <div className="absolute -top-2 left-2 px-2 py-0.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-medium rounded z-20">
        {cardStyle === 0 && 'Style 1: Bottom Bar'}
        {cardStyle === 1 && 'Style 2: Top-Left'}
        {cardStyle === 2 && 'Style 3: Next to Title'}
        {cardStyle === 3 && 'Style 4: Below Emoji'}
        {cardStyle === 4 && 'Style 5: Side Panel'}
        {cardStyle === 5 && 'Style 6: Header Strip'}
      </div>

      {/* STYLE 1: BOTTOM ACTION BAR */}
      {cardStyle === 0 && (
        <div className="p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg">
          {templateTotal > 0 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
              ${templateTotal.toFixed(2)}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="text-4xl">{template.icon}</div>
            {template.isRecurring && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs" style={{ color: 'var(--primaryColor)' }}>
                <Repeat className="w-3 h-3" />
                <span className="font-medium">Recurring</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

          {template.lineItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                Included Items ({template.lineItems.length}):
              </p>
              <div className="space-y-2">
                {displayedItems.map((item, idx) => {
                  const itemAmount = item.quantity * item.rate;
                  return (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                          {item.description && (
                            <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                        ${itemAmount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {template.lineItems.length > 3 && (
                  <div
                    onClick={onToggleExpand}
                    className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    {!isExpanded ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="font-medium">Show less</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button onClick={onUseTemplate} className="flex-1" style={{ backgroundColor: 'var(--primaryColor)' }}>
              <FileText className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STYLE 2: TOP-LEFT CORNER */}
      {cardStyle === 1 && (
        <div className="p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg">
          <div className="absolute top-3 left-3 flex gap-1 z-10">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[var(--primaryColor)]">
              <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {templateTotal > 0 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
              ${templateTotal.toFixed(2)}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 mt-8">
            <div className="text-4xl">{template.icon}</div>
            {template.isRecurring && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs" style={{ color: 'var(--primaryColor)' }}>
                <Repeat className="w-3 h-3" />
                <span className="font-medium">Recurring</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium mb-2 pr-24">{template.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

          {template.lineItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                Included Items ({template.lineItems.length}):
              </p>
              <div className="space-y-2">
                {displayedItems.map((item, idx) => {
                  const itemAmount = item.quantity * item.rate;
                  return (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                          {item.description && (
                            <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                        ${itemAmount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {template.lineItems.length > 3 && (
                  <div
                    onClick={onToggleExpand}
                    className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    {!isExpanded ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="font-medium">Show less</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <Button onClick={onUseTemplate} className="w-full mt-4" style={{ backgroundColor: 'var(--primaryColor)' }}>
            <FileText className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      )}

      {/* STYLE 3: NEXT TO TITLE */}
      {cardStyle === 2 && (
        <div className="p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg">
          {templateTotal > 0 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
              ${templateTotal.toFixed(2)}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="text-4xl">{template.icon}</div>
            {template.isRecurring && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs" style={{ color: 'var(--primaryColor)' }}>
                <Repeat className="w-3 h-3" />
                <span className="font-medium">Recurring</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-lg font-medium flex-1 pr-16">{template.name}</h3>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Edit className="w-3.5 h-3.5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

          {template.lineItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                Included Items ({template.lineItems.length}):
              </p>
              <div className="space-y-2">
                {displayedItems.map((item, idx) => {
                  const itemAmount = item.quantity * item.rate;
                  return (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                          {item.description && (
                            <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                        ${itemAmount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {template.lineItems.length > 3 && (
                  <div
                    onClick={onToggleExpand}
                    className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    {!isExpanded ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="font-medium">Show less</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <Button onClick={onUseTemplate} className="w-full mt-4" style={{ backgroundColor: 'var(--primaryColor)' }}>
            <FileText className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      )}

      {/* STYLE 4: BELOW EMOJI */}
      {cardStyle === 3 && (
        <div className="p-6 rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg">
          {templateTotal > 0 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
              ${templateTotal.toFixed(2)}
            </div>
          )}

          <div className="flex items-start gap-3 mb-3">
            <div>
              <div className="text-4xl mb-2">{template.icon}</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              {template.isRecurring && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs mb-2 inline-flex" style={{ color: 'var(--primaryColor)' }}>
                  <Repeat className="w-3 h-3" />
                  <span className="font-medium">Recurring</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-medium mb-2 pr-24">{template.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

          {template.lineItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                Included Items ({template.lineItems.length}):
              </p>
              <div className="space-y-2">
                {displayedItems.map((item, idx) => {
                  const itemAmount = item.quantity * item.rate;
                  return (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                          {item.description && (
                            <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                        ${itemAmount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {template.lineItems.length > 3 && (
                  <div
                    onClick={onToggleExpand}
                    className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                    style={{ color: 'var(--primaryColor)' }}
                  >
                    {!isExpanded ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="font-medium">Show less</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <Button onClick={onUseTemplate} className="w-full mt-4" style={{ backgroundColor: 'var(--primaryColor)' }}>
            <FileText className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      )}

      {/* STYLE 5: SIDE PANEL */}
      {cardStyle === 4 && (
        <div className="rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg flex">
          <div className="w-10 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center gap-2 py-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-6">
            {templateTotal > 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                ${templateTotal.toFixed(2)}
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <div className="text-4xl">{template.icon}</div>
              {template.isRecurring && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs" style={{ color: 'var(--primaryColor)' }}>
                  <Repeat className="w-3 h-3" />
                  <span className="font-medium">Recurring</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium mb-2 pr-24">{template.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

            {template.lineItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Included Items ({template.lineItems.length}):
                </p>
                <div className="space-y-2">
                  {displayedItems.map((item, idx) => {
                    const itemAmount = item.quantity * item.rate;
                    return (
                      <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                            {item.description && (
                              <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                          ${itemAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {template.lineItems.length > 3 && (
                    <div
                      onClick={onToggleExpand}
                      className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                      style={{ color: 'var(--primaryColor)' }}
                    >
                      {!isExpanded ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span className="font-medium">Show less</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button onClick={onUseTemplate} className="w-full mt-4" style={{ backgroundColor: 'var(--primaryColor)' }}>
              <FileText className="w-4 h-4 mr-2" />
              Use This Template
            </Button>
          </div>
        </div>
      )}

      {/* STYLE 6: HEADER STRIP */}
      {cardStyle === 5 && (
        <div className="rounded-xl border-2 transition-all relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--primaryColor)] hover:shadow-lg">
          <div className="h-10 px-4 flex items-center justify-between" style={{ backgroundColor: `${CATEGORY_COLORS[template.category]}15` }}>
            <div className="flex items-center gap-2">
              <div className="text-xl">{template.icon}</div>
              {template.isRecurring && (
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--primaryColor)' }}>
                  <Repeat className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {templateTotal > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--primaryColor)' }}>
                  ${templateTotal.toFixed(2)}
                </span>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50">
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

            {template.lineItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Included Items ({template.lineItems.length}):
                </p>
                <div className="space-y-2">
                  {displayedItems.map((item, idx) => {
                    const itemAmount = item.quantity * item.rate;
                    return (
                      <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--primaryColor)' }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-900 dark:text-gray-100 truncate block">{item.name}</span>
                            {item.description && (
                              <span className="text-gray-500 text-[10px] truncate block">{item.description}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                          ${itemAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {template.lineItems.length > 3 && (
                    <div
                      onClick={onToggleExpand}
                      className="flex items-center gap-2 pt-1 text-xs hover:opacity-80 hover:underline transition-all cursor-pointer"
                      style={{ color: 'var(--primaryColor)' }}
                    >
                      {!isExpanded ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span className="font-medium">+ {template.lineItems.length - 3} more</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span className="font-medium">Show less</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button onClick={onUseTemplate} className="w-full mt-4" style={{ backgroundColor: 'var(--primaryColor)' }}>
              <FileText className="w-4 h-4 mr-2" />
              Use This Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
