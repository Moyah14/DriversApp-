const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getStoredUser<T = any>(): T | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: unknown) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('superadmin_signed_in', user && (user as any).role === 'SYSTEM_ADMIN' ? 'true' : 'false');
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('superadmin_signed_in');
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearSession();
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: any }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setSession(data.token, data.user);
  return data;
}

export async function resolveTenantId(): Promise<string | undefined> {
  const me = getStoredUser<any>();
  if (me?.tenantId || me?.tenant_id) return me.tenantId || me.tenant_id;
  try {
    const tenants = await api('/api/v1/tenants');
    const active = (tenants || []).find((t: any) => t.status === 'active') || (tenants || [])[0];
    return active?.id;
  } catch {
    return undefined;
  }
}

export { API_URL };
