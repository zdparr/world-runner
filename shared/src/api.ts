import { z } from 'zod';

// Request/response contracts shared by the server and the web client.

export const LoginRequest = z.object({
  password: z.string().min(1, 'Password is required').max(512),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export interface MeResponse {
  authenticated: boolean;
}

export interface HealthResponse {
  ok: boolean;
  db: 'up' | 'down';
  uptimeSeconds: number;
}

export interface HelloResponse {
  message: string;
  serverTime: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
