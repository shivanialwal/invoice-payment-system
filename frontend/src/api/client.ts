import type { Invoice, InvoiceRequest, InvoiceStatus } from '../types';

const BASE = '/api';

function getToken(): string | null {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return null;
  return (JSON.parse(stored) as { token: string }).token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export const invoiceApi = {
  getAll: (status?: InvoiceStatus) => {
    const query = status ? `?status=${status}` : '';
    return request<Invoice[]>(`/invoices${query}`);
  },
  getById: (id: number) => request<Invoice>(`/invoices/${id}`),
  create: (data: InvoiceRequest) =>
    request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: InvoiceRequest) =>
    request<Invoice>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/invoices/${id}`, { method: 'DELETE' }),
};

// ── AI ────────────────────────────────────────────────────────────────────────

export const generateLineItems = (prompt: string) =>
  request<{ description: string; quantity: number; unitPrice: number }[]>(
    '/invoices/ai/line-items',
    { method: 'POST', body: JSON.stringify({ prompt }) },
  );
