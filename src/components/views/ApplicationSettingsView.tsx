import { useState } from 'react';
import { ArrowLeft, Save, Calendar, Clock, Palette, Image, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useAppSettings, type DateFormat, type TimeFormat } from '../../contexts/AppSettingsContext';
import { toast } from 'sonner@2.0.3';

export function ApplicationSettingsView() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppSettings();
  
  // Local state for form
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.dateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(settings.timeFormat);
  const [primaryColor, setPrimaryColor] = useState<string>(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(settings.secondaryColor);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl);
  const [mobileLogoUrl, setMobileLogoUrl] = useState<string>(settings.mobileLogoUrl);

  const handleSave = () => {
    updateSettings({
      dateFormat,
      timeFormat,
      primaryColor,
      secondaryColor,
      logoUrl,
      mobileLogoUrl,
    });
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setDateFormat(settings.dateFormat);
    setTimeFormat(settings.timeFormat);
    setPrimaryColor(settings.primaryColor);
    setSecondaryColor(settings.secondaryColor);
    setLogoUrl(settings.logoUrl);
    setMobileLogoUrl(settings.mobileLogoUrl);
    toast.info('Changes reset');
  };

  const handleResetToDefaults = () => {
    setDateFormat('MM-DD-YYYY');
    setTimeFormat('12-hour');
    setPrimaryColor('#7c3aed');
    setSecondaryColor('#a78bfa');
    setLogoUrl('');
    setMobileLogoUrl('');
    toast.info('Reset to default values');
  };

  const exampleDate = new Date();

  // Local format functions that use current form state for live preview
  const previewFormatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}-${day}-${year}`;
    }
  };

  const previewFormatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (timeFormat === '24-hour') {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
  };

  const previewFormatDateTime = (date: Date): string => {
    return `${previewFormatDate(date)}\n${previewFormatTime(date)}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div>
              <h1 className="flex items-center gap-2">
                Application Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure global application preferences and defaults
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: 'var(--primaryColor)' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Client Portal Branding */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 dark:text-gray-100 mb-1">Client Portal Logos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload custom logos to display in the client portal
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Desktop Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-url"
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Upload Logo"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Displayed in client portal sidebar (recommended: 200x50px)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-logo-url">Mobile Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mobile-logo-url"
                      type="text"
                      value={mobileLogoUrl}
                      onChange={(e) => setMobileLogoUrl(e.target.value)}
                      placeholder="https://example.com/mobile-logo.png"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Upload Mobile Logo"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Displayed on mobile devices (recommended: 40x40px)
                  </p>
                </div>
              </div>

              {/* Logo Preview - Always show since we have defaults */}
              {true && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-3">
                        Logo Preview
                      </p>
                      <div className="flex gap-6 items-start flex-wrap">
                        {logoUrl && (
                          <div>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">Desktop</p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <img 
                                src={logoUrl} 
                                alt="Desktop Logo" 
                                className="h-12 w-auto max-w-[200px]"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {mobileLogoUrl && (
                          <div>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">Mobile</p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <img 
                                src={mobileLogoUrl} 
                                alt="Mobile Logo" 
                                className="h-10 w-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Date & Time Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 dark:text-gray-100 mb-1">Date & Time Format</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose how dates and times are displayed throughout the application
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={dateFormat}
                    onValueChange={(value) => setDateFormat(value as DateFormat)}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM-DD-YYYY">MM-DD-YYYY (US Format)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (European Format)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Example: {previewFormatDate(exampleDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select
                    value={timeFormat}
                    onValueChange={(value) => setTimeFormat(value as TimeFormat)}
                  >
                    <SelectTrigger id="time-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12-hour">12-hour (h:mm AM/PM)</SelectItem>
                      <SelectItem value="24-hour">24-hour (h:mm)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Example: {previewFormatTime(exampleDate)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Preview
                    </p>
                    <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-line">
                      {previewFormatDateTime(exampleDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Color Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 dark:text-gray-100 mb-1">Accent Colors</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize the primary and secondary colors used throughout the application (buttons, headers, filters, etc.)
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-12 cursor-pointer"
                      />
                    </div>
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-28 font-mono text-sm"
                      placeholder="#7c3aed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Used for buttons, selected states, and table headers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-12 cursor-pointer"
                      />
                    </div>
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-28 font-mono text-sm"
                      placeholder="#a78bfa"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Used for gradients and hover effects
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Color Preview
                    </p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div 
                          className="h-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">Table Header</p>
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <button 
                            className="h-16 px-6 rounded-lg text-white shadow-sm transition-opacity hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Primary Button
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="outline" onClick={handleReset}>
              Reset Changes
            </Button>
            <Button onClick={handleResetToDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: 'var(--primaryColor)' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}