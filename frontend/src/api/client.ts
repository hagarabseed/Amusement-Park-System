const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  title?: string;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>, title?: string) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.title = title;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pp_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/auth/login' && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(body.detail || body.title || 'Request failed', res.status, body.errors, body.title);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors && Object.keys(err.errors).length > 0) {
      return Object.values(err.errors).join(' • ');
    }
    return err.message;
  }
  return err instanceof Error ? err.message : 'Unexpected error occurred';
}
