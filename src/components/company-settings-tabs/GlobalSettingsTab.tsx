import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Settings, Globe } from 'lucide-react';

export function GlobalSettingsTab() {
  return (
    <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
          <Globe className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-gray-900 dark:text-gray-100 mb-3">Global Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          Configure platform-wide settings including time zones, date formats, currency, and more.
        </p>
        <Button className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
          <Settings className="w-4 h-4 mr-2" />
          Configure Settings
        </Button>
      </div>
    </Card>
  );
}
