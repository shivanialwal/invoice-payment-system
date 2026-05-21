import type { Invoice, InvoiceRequest, InvoiceStatus } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  // 204 No Content (DELETE) has no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export const invoiceApi = {
  getAll: (status?: InvoiceStatus) => {
    const query = status ? `?status=${status}` : '';
    return request<Invoice[]>(`/invoices${query}`);
  },

  getById: (id: number) =>
    request<Invoice>(`/invoices/${id}`),

  create: (data: InvoiceRequest) =>
    request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: InvoiceRequest) =>
    request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/invoices/${id}`, { method: 'DELETE' }),
};

// ── AI line items (Anthropic via backend) ─────────────────────────────────────

export async function generateLineItems(prompt: string) {
  return request<{ description: string; quantity: number; unitPrice: number }[]>(
    '/invoices/ai/line-items',
    { method: 'POST', body: JSON.stringify({ prompt }) },
  );
}
