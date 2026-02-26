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
  const authToken = token;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${authToken}`,
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
  return fetchApi<{ usage: UsageRecord[]; totalCostUsd: number }>(
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
  return fetchApi<{ creditBalanceUsd: number }>('/api/v1/usage/balance', token);
}

// Billing
export async function createCheckout(token: string, amount: number) {
  return fetchApi<{ checkoutUrl: string; sessionId: string }>('/api/v1/billing/checkout', token, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function getPaymentHistory(
  token: string,
  limit = 50,
  offset = 0
) {
  return fetchApi<{ payments: Payment[]; totalPurchasedUsd: number }>(
    `/api/v1/billing/history?limit=${limit}&offset=${offset}`,
    token
  );
}

// API Keys
export async function getApiKeys(token: string) {
  return fetchApi<{ api_keys: ApiKey[] }>('/api/v1/api-keys', token);
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
  return fetchApi<User>('/api/v1/auth/me', token);
}

// ============================================================================
// Media Generation
// ============================================================================

export interface MediaResult {
  url: string | null;
  result?: Record<string, unknown>;
  provider: string;
  model: string;
  estimatedCostUsd: number;
}

export interface MediaSubmitResult {
  requestId: string;
  statusUrl?: string;
  responseUrl?: string;
  model: string;
  provider: string;
  estimatedCostUsd: number;
}

export interface MediaStatusResult {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  queuePosition?: number | null;
  url?: string | null;
  result?: Record<string, unknown>;
  provider?: string;
  model?: string;
  estimatedCostUsd?: number;
}

export async function runModel(
  token: string,
  model: string,
  input: Record<string, unknown>
): Promise<MediaResult> {
  return fetchApi('/api/v1/media/run', token, {
    method: 'POST',
    body: JSON.stringify({ model, input }),
  });
}

export async function removeBackground(
  token: string,
  imageUrl: string
): Promise<MediaResult> {
  return fetchApi('/api/v1/media/remove-background', token, {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
  });
}

export async function upscaleImage(
  token: string,
  imageUrl: string,
  scale?: number
): Promise<MediaResult> {
  return fetchApi('/api/v1/media/upscale', token, {
    method: 'POST',
    body: JSON.stringify({ imageUrl, scale }),
  });
}

export async function submitJob(
  token: string,
  model: string,
  input: Record<string, unknown>
): Promise<MediaSubmitResult> {
  return fetchApi('/api/v1/media/submit', token, {
    method: 'POST',
    body: JSON.stringify({ model, input }),
  });
}

export async function getJobStatus(
  token: string,
  requestId: string,
  model: string,
  statusUrl?: string,
  responseUrl?: string
): Promise<MediaStatusResult> {
  const params = new URLSearchParams({ model });
  if (statusUrl) params.set('statusUrl', statusUrl);
  if (responseUrl) params.set('responseUrl', responseUrl);
  return fetchApi(`/api/v1/media/status/${requestId}?${params.toString()}`, token, {
    headers: { 'Content-Type': '' },
  });
}

// Types — match actual API response shapes (camelCase)
export interface UsageRecord {
  date: string;
  totalCostUsd: number;
  count: number;
}

export interface UsageDetailRecord {
  id: string;
  provider: string;
  model: string;
  operation: string;
  estimatedCostUsd: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  amountUsd: number;
  creditsUsd: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
}

export interface ApiKey {
  id: string;
  prefix: string;
  name?: string;
  last_used_at: number | null;
  created_at: number;
}

export interface User {
  id: string;
  email: string;
  credit_balance_usd: number;
  created_at: string;
}
