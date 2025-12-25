import { useState, useEffect } from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import { getApiStatus } from '../lib/apiHelper';

export function MockModeBanner() {
  const [apiStatus, setApiStatus] = useState<{
    available: boolean;
    mockMode: boolean;
    message: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const wasDismissed = localStorage.getItem('mockModeBannerDismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check API status
    getApiStatus().then(status => {
      setApiStatus(status);
    });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('mockModeBannerDismissed', 'true');
  };

  // Don't show if dismissed or API is available
  if (dismissed || !apiStatus || apiStatus.available) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 flex-shrink-0" />
        <div>
          <span className="font-medium">Demo Mode: </span>
          <span>Using mock data for demonstration purposes</span>
          <span className="ml-2 text-sm opacity-90">
            (To connect to real API, update <code className="bg-white/20 px-1 rounded">config/api.config.ts</code>)
          </span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
        title="Dismiss this message"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
