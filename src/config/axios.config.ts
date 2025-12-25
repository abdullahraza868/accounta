/**
 * Axios Configuration
 * 
 * Configures Axios interceptors for authentication and error handling
 * Import this file in App.tsx to set up global Axios configuration
 */

import axios from 'axios';

/**
 * Request Interceptor
 * Automatically adds the bearer token and tenant ID to all requests
 */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant ID if available (for multi-tenancy)
    // This header format matches ASP.NET Boilerplate's expected header name
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['Abp.TenantId'] = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common error scenarios
 */
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden - access denied
    if (error.response?.status === 403) {
      console.error('Access denied - insufficient permissions');
      // You can redirect to an access denied page
      // window.location.href = '/access-denied';
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      // You can show a global error notification here
    }
    
    // Handle network errors
    if (!error.response) {
      // In mock mode, network errors are expected and handled gracefully
      // We don't log them to avoid console clutter since the banner shows the status
      // If you need to debug network issues, uncomment the line below:
      // console.info('[Demo Mode] Network request failed - using mock data');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to set the auth token
 */
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

/**
 * Helper function to set the tenant ID
 */
export function setTenantId(tenantId: string | null) {
  if (tenantId) {
    localStorage.setItem('tenantId', tenantId);
  } else {
    localStorage.removeItem('tenantId');
  }
}

/**
 * Helper function to clear all auth data
 */
export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('tenantId');
}
