export class APIError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let data = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }
      throw new APIError(res.status, data, `API Error: ${res.status} ${res.statusText}`);
    }

    if (res.status === 204) {
      return null as unknown as T;
    }

    return res.json();
  }

  get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
