/**
 * API Configuration
 *
 * IMPORTANT: Change the API_BASE_URL to point to your ASP.NET Boilerplate backend
 *
 * MOCK MODE: When the API is not available, the application will automatically
 * fall back to mock mode. This allows you to develop and test the UI without
 * a running backend server.
 *
 * To connect to your real API:
 * 1. Update the baseUrl below to your API URL
 * 2. Ensure your API is running and accessible
 * 3. The app will automatically use the real API when available
 */

export const API_CONFIG = {
  // Acounta API base URL
  // TODO: Update this to your actual API URL when ready
  baseUrl: "https://localhost:44313",

  // For local development, you might use:
  // baseUrl: 'http://localhost:21021',
  // baseUrl: 'https://localhost:44301',

  // Swagger JSON URL for NSwag generation
  swaggerUrl: "https://localhost:44313/swagger/v1/swagger.json",

  // API endpoints (optional - can be used for organizing endpoints)
  endpoints: {
    auth: "/api/TokenAuth",
    session: "/api/services/app/Session",
    account: "/api/services/app/Account",
    tenant: "/api/services/app/Tenant",
    clients: "/api/services/app/Client",
    billing: "/api/services/app/Billing",
    signatures: "/api/services/app/Signature",
    documents: "/api/services/app/Document",
    branding: "/api/services/app/PlatformBranding",
  },

  // Timeout settings
  timeout: 30000, // 30 seconds

  // Retry settings
  maxRetries: 3,
  retryDelay: 1000, // 1 second

  // Mock mode - automatically enabled when API is unavailable
  useMockMode: true, // Set to false to require real API connection
};

/**
 * Get API base URL
 * Can be overridden with window.API_BASE_URL for runtime configuration
 */
export function getApiBaseUrl(): string {
  // Allow runtime override via window object (useful for different environments)
  if (
    typeof window !== "undefined" &&
    (window as any).API_BASE_URL
  ) {
    return (window as any).API_BASE_URL;
  }

  return API_CONFIG.baseUrl;
}