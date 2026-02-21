import { getApiUrl, getAuth } from './config';

export class HttpClient {
  private baseUrl: string | null = null;
  private authHeader: string | null = null;

  async init(): Promise<void> {
    this.baseUrl = await getApiUrl();
    const auth = await getAuth();
    if (auth) {
      this.authHeader =
        auth.type === 'api_key' ? `Bearer ${auth.value}` : `Bearer ${auth.value}`;
    }
  }

  setAuth(token: string): void {
    this.authHeader = `Bearer ${token}`;
  }

  async uploadBlob<T>(path: string, blob: Blob): Promise<T> {
    if (!this.baseUrl) await this.init();

    const headers: Record<string, string> = {};
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: blob,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Not authenticated. Run "oanim login" to sign in.');
      }
      const text = await res.text();
      throw new Error(`API error (${res.status}): ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async request<T>(method: string, path: string, opts?: { body?: unknown }): Promise<T> {
    if (!this.baseUrl) await this.init();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Not authenticated. Run "oanim login" to sign in.');
      }
      const text = await res.text();
      throw new Error(`API error (${res.status}): ${text}`);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }
}
