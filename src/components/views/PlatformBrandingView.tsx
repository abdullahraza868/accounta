import { useState } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Upload, RotateCcw, Save, Eye, ChevronDown, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ColorSectionProps = {
  title: string;
  description?: string;
  colors: Array<{
    label: string;
    key: string;
    value: string;
  }>;
  onColorChange: (key: string, value: string) => void;
};

function ColorSection({ title, description, colors, onColorChange }: ColorSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      
      <div className="space-y-4">
        {colors.map(({ label, key, value }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">{label}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="flex-1"
                  placeholder="#000000"
                />
                <div className="relative">
                  <input
                    type="color"
                    value={value.includes('gradient') ? '#7c3aed' : value}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    style={{ 
                      background: value.includes('gradient') 
                        ? value.replace('linear-gradient', 'linear-gradient')
                        : value 
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-32 flex items-center justify-center">
              <Button
                size="sm"
                style={{
                  background: value,
                  color: label.includes('Text') ? value : '#ffffff'
                }}
                className="pointer-events-none"
              >
                Preview
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformBrandingView() {
  const { branding, updateColors, updateImages, updateCompanyName, resetToDefaults } = useBranding();
  const [localColors, setLocalColors] = useState(branding.colors);
  const [localCompanyName, setLocalCompanyName] = useState(branding.companyName);
  const [hasChanges, setHasChanges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleColorChange = (key: string, value: string) => {
    setLocalColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateColors(localColors);
    updateCompanyName(localCompanyName);
    setHasChanges(false);
    toast.success('Branding settings saved successfully! Colors are now applied across the application.');
    
    // Force a small re-render to ensure all components pick up the new CSS variables
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalColors(branding.colors);
    setLocalCompanyName(branding.companyName);
    setHasChanges(false);
    toast.success('Reset to default branding settings');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 mb-2">Platform Branding</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize the look and feel of your Acounta platform
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                style={{
                  background: localColors.primaryButton,
                  color: localColors.primaryButtonText,
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes {hasChanges && '(Unsaved)'}
              </Button>
            </div>
          </div>

          {/* Live Preview Banner */}
          {hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-blue-900 dark:text-blue-100">Live Preview Mode</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You have unsaved changes. Click "Save Changes" to apply these colors across the entire application.
              </p>
            </div>
          )}

          {/* Quick Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6 mb-6">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Quick Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2"
                  style={{ background: localColors.primaryBrand }}
                />
                <p className="text-xs text-gray-600">Primary Brand</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2"
                  style={{ background: localColors.secondaryBrand }}
                />
                <p className="text-xs text-gray-600">Secondary Brand</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center"
                  style={{ 
                    background: localColors.sidebarActiveBackground,
                    color: localColors.sidebarActiveText
                  }}
                >
                  <span className="text-sm">Active Menu</span>
                </div>
                <p className="text-xs text-gray-600">Sidebar Active</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 flex items-center justify-center"
                  style={{ 
                    background: localColors.primaryButton,
                    color: localColors.primaryButtonText
                  }}
                >
                  <span className="text-sm">Button</span>
                </div>
                <p className="text-xs text-gray-600">Primary Button</p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <Collapsible open={showHelp} onOpenChange={setShowHelp} className="mb-6">
            <CollapsibleTrigger asChild>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-blue-900 dark:text-blue-100">How to Use Platform Branding</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-b-xl p-6 -mt-3 pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">✨ Changing Colors</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use the color picker (colored box) or enter hex codes directly. Changes are previewed in real-time.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">💾 Saving Changes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click "Save Changes" to apply colors across the entire application. Settings are saved to your browser's local storage.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">🔄 Resetting</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click "Reset to Defaults" to restore the original Acounta purple theme.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 CSS Variables</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All colors are exposed as CSS variables. Developers can use the floating "CSS Variables" button in the bottom-right to view all available variables and their current values.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Company Name */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6 mb-6">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Company Information</h3>
            <div className="max-w-md">
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Company Name</Label>
              <Input
                value={localCompanyName}
                onChange={(e) => {
                  setLocalCompanyName(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6 mb-6">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Brand Assets</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Company Logo</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload logo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG or SVG (max. 2MB)</p>
                  <Input type="file" className="hidden" accept="image/*" />
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 block">Login Illustration</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload illustration</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG or SVG (max. 2MB)</p>
                  <Input type="file" className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
          </div>

          {/* Color Sections */}
          <div className="space-y-6">
            {/* Brand Colors */}
            <ColorSection
              title="Brand Color Settings"
              description="Primary colors that represent your brand identity"
              colors={[
                { label: 'Primary Brand Color', key: 'primaryBrand', value: localColors.primaryBrand },
                { label: 'Secondary Brand Color', key: 'secondaryBrand', value: localColors.secondaryBrand },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Main Background */}
            <ColorSection
              title="Main Background Color Settings"
              description="Background color for the main application area"
              colors={[
                { label: 'Main Background', key: 'mainBackground', value: localColors.mainBackground },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Sidebar Colors */}
            <ColorSection
              title="Sidebar Color Settings"
              description="Customize your navigation sidebar appearance"
              colors={[
                { label: 'Sidebar Background', key: 'sidebarBackground', value: localColors.sidebarBackground },
                { label: 'Sidebar Text Color', key: 'sidebarText', value: localColors.sidebarText },
                { label: 'Active Menu Background', key: 'sidebarActiveBackground', value: localColors.sidebarActiveBackground },
                { label: 'Active Menu Text', key: 'sidebarActiveText', value: localColors.sidebarActiveText },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Button Colors */}
            <ColorSection
              title="Button Color Settings"
              description="Customize button styles throughout the application"
              colors={[
                { label: 'Primary Button', key: 'primaryButton', value: localColors.primaryButton },
                { label: 'Primary Button Text', key: 'primaryButtonText', value: localColors.primaryButtonText },
                { label: 'Secondary Button', key: 'secondaryButton', value: localColors.secondaryButton },
                { label: 'Secondary Button Text', key: 'secondaryButtonText', value: localColors.secondaryButtonText },
                { label: 'Danger Button', key: 'dangerButton', value: localColors.dangerButton },
                { label: 'Danger Button Text', key: 'dangerButtonText', value: localColors.dangerButtonText },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Top Bar Colors */}
            <ColorSection
              title="Top Bar Color Settings"
              description="Customize the header and top navigation bar"
              colors={[
                { label: 'Top Bar Background', key: 'topBarBackground', value: localColors.topBarBackground },
                { label: 'Top Bar Text', key: 'topBarText', value: localColors.topBarText },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Card Colors */}
            <ColorSection
              title="Card Color Settings"
              description="Styling for cards and panels"
              colors={[
                { label: 'Card Background', key: 'cardBackground', value: localColors.cardBackground },
                { label: 'Card Border', key: 'cardBorder', value: localColors.cardBorder },
                { label: 'Card Hover Border', key: 'cardHoverBorder', value: localColors.cardHoverBorder },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Text Colors */}
            <ColorSection
              title="Text Color Settings"
              description="Typography colors for headings and body text"
              colors={[
                { label: 'Heading Text', key: 'headingText', value: localColors.headingText },
                { label: 'Body Text', key: 'bodyText', value: localColors.bodyText },
                { label: 'Muted Text', key: 'mutedText', value: localColors.mutedText },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Input Colors */}
            <ColorSection
              title="Input Field Color Settings"
              description="Styling for form inputs and text fields"
              colors={[
                { label: 'Input Background', key: 'inputBackground', value: localColors.inputBackground },
                { label: 'Input Border', key: 'inputBorder', value: localColors.inputBorder },
                { label: 'Input Text', key: 'inputText', value: localColors.inputText },
                { label: 'Input Focus Border', key: 'inputFocusBorder', value: localColors.inputFocusBorder },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Link Colors */}
            <ColorSection
              title="Link Color Settings"
              description="Hyperlink colors and hover states"
              colors={[
                { label: 'Link Color', key: 'linkColor', value: localColors.linkColor },
                { label: 'Link Hover Color', key: 'linkHoverColor', value: localColors.linkHoverColor },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Status Colors */}
            <ColorSection
              title="Status Color Settings"
              description="Colors for success, warning, error, and info states"
              colors={[
                { label: 'Success Color', key: 'successColor', value: localColors.successColor },
                { label: 'Warning Color', key: 'warningColor', value: localColors.warningColor },
                { label: 'Error Color', key: 'errorColor', value: localColors.errorColor },
                { label: 'Info Color', key: 'infoColor', value: localColors.infoColor },
              ]}
              onColorChange={handleColorChange}
            />

            {/* Login Page Colors */}
            <ColorSection
              title="Login Page Settings"
              description="Customize your login page appearance"
              colors={[
                { label: 'Login Background', key: 'loginBackground', value: localColors.loginBackground },
                { label: 'Login Card Background', key: 'loginCardBackground', value: localColors.loginCardBackground },
                { label: 'Illustration Background', key: 'loginIllustrationBackground', value: localColors.loginIllustrationBackground },
              ]}
              onColorChange={handleColorChange}
            />
          </div>

          {/* Save Button at Bottom */}
          <div className="mt-8 flex justify-end gap-3 pb-8">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              style={{
                background: localColors.primaryButton,
                color: localColors.primaryButtonText,
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes {hasChanges && '(Unsaved)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
