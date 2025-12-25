/**
 * TEMPORARY DEBUG COMPONENT
 * 
 * Add this to your login process to see what's happening
 * 
 * INSTRUCTIONS:
 * 1. Add this import to LoginView.tsx:
 *    import { DebugRedirectIssue } from '../DEBUG_REDIRECT_ISSUE';
 * 
 * 2. Add this component right after successful login (before navigate):
 *    <DebugRedirectIssue from={from} />
 * 
 * 3. Check the console output
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export function DebugRedirectIssue({ from }: { from: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🐛 DEBUG REDIRECT ISSUE:');
    console.log('========================');
    console.log('📍 Current location:', location.pathname);
    console.log('🎯 Target location (from):', from);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('👤 User:', user);
    console.log('📦 localStorage keys:', Object.keys(localStorage));
    console.log('📦 localStorage.preferredPortal:', localStorage.getItem('preferredPortal'));
    console.log('📦 localStorage.clientPortalSession:', localStorage.getItem('clientPortalSession'));
    console.log('📦 localStorage.accessToken:', localStorage.getItem('accessToken'));
    console.log('🌍 window.location.href:', window.location.href);
    console.log('🌍 window.location.pathname:', window.location.pathname);
    console.log('========================');

    // Check for any suspicious redirects in the navigation history
    console.log('📜 Navigation history length:', window.history.length);
    
    // Log all route changes
    const handleRouteChange = () => {
      console.log('🔄 Route changed to:', window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [from, location, user, isAuthenticated]);

  return null;
}

/**
 * ALTERNATIVE: Console command to check everything
 * 
 * Paste this into the browser console after login:
 */
export const debugLoginRedirect = () => {
  console.log('🐛 DEBUG LOGIN REDIRECT:');
  console.log('========================');
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Pathname:', window.location.pathname);
  console.log('📍 Hash:', window.location.hash);
  console.log('📍 Search:', window.location.search);
  console.log('');
  console.log('📦 localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`   ${key}:`, localStorage.getItem(key));
    }
  }
  console.log('');
  console.log('📦 sessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      console.log(`   ${key}:`, sessionStorage.getItem(key));
    }
  }
  console.log('========================');
};

// Make it available in the console
if (typeof window !== 'undefined') {
  (window as any).debugLoginRedirect = debugLoginRedirect;
}
