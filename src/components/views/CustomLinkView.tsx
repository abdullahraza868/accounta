import { useSearchParams } from 'react-router-dom';
import { Globe } from 'lucide-react';

export function CustomLinkView() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Custom Link';

  if (!url) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl text-gray-900 dark:text-gray-100 mb-2">No URL Provided</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please provide a valid URL to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-8 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{url}</p>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
