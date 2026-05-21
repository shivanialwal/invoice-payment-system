/**
 * API client — talks to Spring Boot at /api (proxied in dev).
 * Until the backend is ready, pages use mock data from src/data/.
 */

const BASE = '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Placeholder for AI line-item generation (Anthropic via backend). */
export async function generateLineItems(prompt: string): Promise<{ description: string; quantity: number; unitPrice: number }[]> {
  return apiPost('/invoices/ai/line-items', { prompt });
}
