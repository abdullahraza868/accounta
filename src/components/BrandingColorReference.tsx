import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const cssVariables = [
  { name: '--backgroundColor', description: 'Main app background' },
  { name: '--middleBackgroundColor', description: 'Card/content background' },
  { name: '--primaryColor', description: 'Primary brand color' },
  { name: '--secondaryColor', description: 'Secondary brand color' },
  { name: '--primaryColorBtn', description: 'Primary button background' },
  { name: '--primaryTextColorBtn', description: 'Primary button text' },
  { name: '--dangerColorBtn', description: 'Danger button background' },
  { name: '--dangerTextColorBtn', description: 'Danger button text' },
  { name: '--bgColorSideMenu', description: 'Sidebar background' },
  { name: '--selectedBgColorSideMenu', description: 'Active menu background' },
  { name: '--selectedColorSideMenu', description: 'Active menu text' },
  { name: '--primaryColorSideMenu', description: 'Sidebar text color' },
  { name: '--bgColorTopBar', description: 'Top bar background' },
  { name: '--primaryColorTopBar', description: 'Top bar text' },
  { name: '--iconsColorTopBar', description: 'Top bar icons' },
];

export function BrandingColorReference() {
  const [isVisible, setIsVisible] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const copyToClipboard = (varName: string) => {
    navigator.clipboard.writeText(`var(${varName})`);
    setCopiedVar(varName);
    toast.success(`Copied ${varName}`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          className="gap-2 bg-white shadow-lg"
        >
          <Eye className="w-4 h-4" />
          CSS Variables
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-gray-900">CSS Variables Reference</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
        >
          <EyeOff className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {cssVariables.map((variable) => {
          const computedValue = getComputedStyle(document.documentElement)
            .getPropertyValue(variable.name)
            .trim();
          
          return (
            <div
              key={variable.name}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs text-purple-600 font-mono">
                      {variable.name}
                    </code>
                    <button
                      onClick={() => copyToClipboard(variable.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedVar === variable.name ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">{variable.description}</p>
                </div>
                <div
                  className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                  style={{
                    background: computedValue.includes('gradient')
                      ? computedValue
                      : computedValue || '#ffffff',
                  }}
                  title={computedValue}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        Click variable names to copy to clipboard
      </div>
    </div>
  );
}
