const PHP_API_URL = import.meta.env.VITE_API_URL || 'https://kidsparadise.com.bd/smart-grocery/api.php';

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

function resolvePhpAction(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (clean.startsWith('settings/')) {
    const key = clean.split('/')[1];
    return `${PHP_API_URL}?action=settings&key=${key}`;
  }
  if (clean.startsWith('wishlist/')) {
    const userId = clean.split('/')[1];
    return `${PHP_API_URL}?action=wishlist&userId=${userId}`;
  }
  if (clean.startsWith('addresses/')) {
    const userId = clean.split('/')[1];
    return `${PHP_API_URL}?action=addresses&userId=${userId}`;
  }
  if (clean.startsWith('auth/login')) {
    return `${PHP_API_URL}?action=login`;
  }
  if (clean.startsWith('auth/register')) {
    return `${PHP_API_URL}?action=register`;
  }
  if (clean.startsWith('auth/me')) {
    return `${PHP_API_URL}?action=me`;
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    return `${PHP_API_URL}?action=${parts[0]}&id=${parts[1]}`;
  }
  return `${PHP_API_URL}?action=${clean}`;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = resolvePhpAction(endpoint);
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
