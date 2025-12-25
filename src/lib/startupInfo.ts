/**
 * Startup Information Logger
 * 
 * Provides helpful information about the app's current mode and configuration
 */

import { API_CONFIG } from '../config/api.config';

export function logStartupInfo() {
  const apiUrl = API_CONFIG.baseUrl;
  const mockMode = API_CONFIG.useMockMode;
  
  // Detect mode based on hostname and mock mode setting
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168');

  console.log(
    '%c🚀 Acounta Client Management System',
    'color: #7c3aed; font-size: 16px; font-weight: bold;'
  );
  
  console.log(
    '%cMode: %c' + (isDevelopment ? 'Development' : 'Production'),
    'color: #6b7280;',
    'color: #10b981; font-weight: bold;'
  );
  
  console.log(
    '%cAPI URL: %c' + apiUrl,
    'color: #6b7280;',
    'color: #3b82f6; font-weight: bold;'
  );
  
  if (mockMode) {
    console.log(
      '%c⚠️  Mock Mode: %cEnabled',
      'color: #6b7280;',
      'color: #f59e0b; font-weight: bold;'
    );
    console.log(
      '%cℹ️  The application is running with mock data.',
      'color: #6b7280;'
    );
    console.log(
      '%cℹ️  To connect to a real API, update the baseUrl in config/api.config.ts',
      'color: #6b7280;'
    );
  } else {
    console.log(
      '%c✅ Mock Mode: %cDisabled',
      'color: #6b7280;',
      'color: #10b981; font-weight: bold;'
    );
    console.log(
      '%cℹ️  The application requires a real API connection.',
      'color: #6b7280;'
    );
  }
  
  console.log(''); // Empty line for spacing
  
  // Verify CSS variables are loaded
  setTimeout(() => {
    verifyCSS();
  }, 100);
}

function verifyCSS() {
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primaryColor').trim();
  const backgroundColor = rootStyles.getPropertyValue('--backgroundColor').trim();
  
  if (primaryColor && backgroundColor) {
    console.log(
      '%c✅ CSS Variables: %cLoaded successfully',
      'color: #6b7280;',
      'color: #10b981; font-weight: bold;'
    );
    console.log(
      '%c   Primary Color: %c' + primaryColor,
      'color: #6b7280;',
      'color: ' + primaryColor + '; font-weight: bold;'
    );
  } else {
    console.error(
      '%c❌ CSS Variables: %cNot loaded!',
      'color: #6b7280;',
      'color: #ef4444; font-weight: bold;'
    );
    console.error(
      '%c⚠️  This will cause styling issues. Try hard refreshing the page (Ctrl+Shift+R)',
      'color: #f59e0b;'
    );
  }
  
  console.log(''); // Empty line for spacing
}

export function logMockAction(action: string, details?: any) {
  if (API_CONFIG.useMockMode) {
    console.log(
      `%c[MOCK] %c${action}`,
      'color: #f59e0b; font-weight: bold;',
      'color: #6b7280;',
      details || ''
    );
  }
}

export function logApiSuccess(action: string, details?: any) {
  console.log(
    `%c✅ %c${action}`,
    'color: #10b981; font-weight: bold;',
    'color: #6b7280;',
    details || ''
  );
}

export function logApiError(action: string, error: any) {
  if (API_CONFIG.useMockMode) {
    // In mock mode, errors are expected - log as warning
    console.warn(
      `%c⚠️  %c${action} failed (expected in mock mode)`,
      'color: #f59e0b; font-weight: bold;',
      'color: #6b7280;'
    );
  } else {
    // In production mode, log as error
    console.error(
      `%c❌ %c${action} failed`,
      'color: #ef4444; font-weight: bold;',
      'color: #6b7280;',
      error
    );
  }
}
