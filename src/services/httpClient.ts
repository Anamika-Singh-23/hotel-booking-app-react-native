// src/services/httpClient.ts
import { API_CONFIG } from '../config/api';
import { getAccessToken } from '../storage/tokenStorage';

// Custom error class so catch blocks can distinguish API errors
// from network failures
export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

interface RequestOptions {
  method?:        'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?:          object;
  requiresAuth?:  boolean;    // attach Bearer token when true
}

export const httpClient = async <T>(
  endpoint: string,
  options:  RequestOptions = {},
): Promise<T> => {
  const { method = 'GET', body, requiresAuth = false } = options;

  // ── Build headers ──────────────────────────────────────────────────────
  const headers: Record<string, string> = { ...API_CONFIG.headers };

  if (requiresAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // ── Timeout via AbortController ────────────────────────────────────────
  const controller = new AbortController();
  const timeoutId  = setTimeout(
    () => controller.abort(),
    API_CONFIG.timeout,
  );

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      method,
      headers,
      body:   body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ── Parse response body ──────────────────────────────────────────────
    const json = await response.json();

    // HTTP error (4xx, 5xx)
    if (!response.ok) {
      throw new ApiException(
        json?.message  ?? 'Something went wrong',
        response.status,
        json?.code,
      );
    }

    return json as T;

  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw our own errors as-is
    if (error instanceof ApiException) throw error;

    // Network failure or timeout
    if ((error as Error).name === 'AbortError') {
      throw new ApiException('Request timed out. Check your connection.', 408);
    }

    throw new ApiException('Network error. Please try again.', 0);
  }
};