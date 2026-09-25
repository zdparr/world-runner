import type { ApiError, HelloResponse, LoginRequest, MeResponse } from '@narrator/shared';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(body?.error ?? `Request failed (${res.status})`, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  me: () => request<MeResponse>('/api/auth/me'),
  login: (body: LoginRequest) => request<MeResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<MeResponse>('/api/auth/logout', { method: 'POST' }),
  hello: () => request<HelloResponse>('/api/hello'),
};
