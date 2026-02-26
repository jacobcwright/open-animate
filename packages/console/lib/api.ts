const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oanim.dev';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(text, res.status);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// Usage
export async function getUsage(token: string, days = 30) {
  return fetchApi<{ usage: UsageRecord[] }>(
    `/api/v1/usage?days=${days}`,
    token
  );
}

export async function getUsageRecords(
  token: string,
  limit = 50,
  offset = 0
) {
  return fetchApi<{ records: UsageDetailRecord[]; total: number }>(
    `/api/v1/usage/records?limit=${limit}&offset=${offset}`,
    token
  );
}

export async function getBalance(token: string) {
  return fetchApi<{ balance: number }>('/api/v1/usage/balance', token);
}

// Billing
export async function createCheckout(token: string, amount: number) {
  return fetchApi<{ url: string }>('/api/v1/billing/checkout', token, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function getPaymentHistory(
  token: string,
  limit = 50,
  offset = 0
) {
  return fetchApi<{ payments: Payment[]; total: number }>(
    `/api/v1/billing/history?limit=${limit}&offset=${offset}`,
    token
  );
}

// API Keys
export async function getApiKeys(token: string) {
  return fetchApi<{ keys: ApiKey[] }>('/api/v1/api-keys', token);
}

export async function createApiKey(token: string, name: string) {
  return fetchApi<{ key: ApiKey; secret: string }>(
    '/api/v1/api-keys',
    token,
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    }
  );
}

export async function deleteApiKey(token: string, keyId: string) {
  return fetchApi<void>(`/api/v1/api-keys/${keyId}`, token, {
    method: 'DELETE',
  });
}

// Auth
export async function getMe(token: string) {
  return fetchApi<{ user: User }>('/api/v1/auth/me', token);
}

// Types
export interface UsageRecord {
  date: string;
  total_cost: number;
  count: number;
}

export interface UsageDetailRecord {
  id: string;
  provider: string;
  model: string;
  operation: string;
  estimated_cost_usd: number;
  created_at: string;
}

export interface Payment {
  id: string;
  amount_usd: number;
  credits_usd: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface ApiKey {
  id: string;
  prefix: string;
  name?: string;
  last_used_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  credit_balance_usd: number;
  created_at: string;
}
