import { LucideIcon } from 'lucide-react';

type PlaceholderSettingsViewProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
};

export function PlaceholderSettingsView({ 
  title, 
  description, 
  icon: Icon,
  gradient = 'from-purple-500 to-purple-600'
}: PlaceholderSettingsViewProps) {
  return (
    <div className="max-w-[1200px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-10 flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This settings page is under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
