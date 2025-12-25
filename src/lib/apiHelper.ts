/**
 * API Helper Utilities
 * 
 * Provides utilities for making API calls with automatic mock fallback
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api.config';

export type ApiCallOptions<T> = {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  mockResponse?: T;
  config?: AxiosRequestConfig;
};

/**
 * Make an API call with automatic mock fallback
 * 
 * @param options - API call options
 * @returns Promise with the API response or mock response
 */
export async function apiCall<T>(options: ApiCallOptions<T>): Promise<T> {
  const {
    endpoint,
    method = 'GET',
    data,
    mockResponse,
    config = {}
  } = options;

  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url: endpoint,
      data,
      timeout: config.timeout || 5000,
      ...config
    });

    return response.data;
  } catch (error: any) {
    // If API is not available and we have a mock response, use it
    if (API_CONFIG.useMockMode && mockResponse !== undefined) {
      console.info(`[Demo Mode] Using mock data for ${endpoint}`);
      return mockResponse;
    }

    // If no mock response or mock mode is disabled, throw the error
    throw error;
  }
}

/**
 * Check if the API is available
 * 
 * @param baseUrl - The base URL to check
 * @returns Promise<boolean> indicating if the API is available
 */
export async function isApiAvailable(baseUrl: string): Promise<boolean> {
  try {
    await axios.get(baseUrl, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get API status information
 * 
 * @returns Object with API status information
 */
export async function getApiStatus() {
  const baseUrl = API_CONFIG.baseUrl;
  const available = await isApiAvailable(baseUrl);

  return {
    available,
    baseUrl,
    mockMode: !available && API_CONFIG.useMockMode,
    message: available 
      ? 'Connected to API server'
      : API_CONFIG.useMockMode
        ? 'Using demo data'
        : 'API connection required'
  };
}
