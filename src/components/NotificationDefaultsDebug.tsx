import { Card } from './ui/card';
import { generateSmartCategoryDefaults } from '../data/notificationDefaults';
import { CATEGORY_INFO } from '../data/notificationTypes';

/**
 * DEBUG COMPONENT - Shows current notification defaults
 * Add this to NotificationSettingsView temporarily to see what defaults are actually applied
 * Remove after verifying defaults are correct
 */
export function NotificationDefaultsDebug() {
  const defaults = generateSmartCategoryDefaults();

  return (
    <Card className="p-6 mb-6 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-400 dark:border-yellow-600">
      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
        🐛 DEBUG: Current Notification Defaults
      </h3>
      <div className="space-y-2 text-xs">
        {defaults.map((def) => {
          const info = CATEGORY_INFO[def.category];
          return (
            <div 
              key={def.category}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  {info.label.charAt(0)}
                </div>
                <span className="font-medium">{info.label}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex gap-1">
                  {def.channels.map(ch => (
                    <span 
                      key={ch}
                      className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                {def.popupSound && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    🔊 Sound
                  </span>
                )}
                {def.digestEnabled && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    📬 Digest: {def.digestFrequency}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-yellow-700 dark:text-yellow-300">
        ⚠️ This is a debug component. Remove it after verifying defaults are correct.
      </p>
    </Card>
  );
}
