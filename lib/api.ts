const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('smart_grocery_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, data: any) => apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T = any>(endpoint: string, data: any) => apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T = any>(endpoint: string, data?: any) => apiFetch<T>(endpoint, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }),
};
