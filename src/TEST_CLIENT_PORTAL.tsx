import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TEST PAGE - Quick way to access client portal in Figma Make
 * 
 * This page automatically redirects to /client-portal/login
 * 
 * To use: Just reload the app and it will take you to the client portal
 */
export default function TestClientPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 Redirecting to client portal...');
    navigate('/client-portal/login');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Client Portal...</p>
      </div>
    </div>
  );
}
