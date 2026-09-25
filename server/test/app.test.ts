import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import { SESSION_MAX_AGE_SECONDS, createSessionValue, isSessionValueValid } from '../src/auth';

const PASSWORD = 'correct horse battery staple';

const config = loadConfig({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://unused',
  APP_PASSWORD: PASSWORD,
  SESSION_SECRET: 'x'.repeat(32),
});

let app: FastifyInstance;
afterEach(async () => {
  await app?.close();
});

async function makeApp(pingDb: () => Promise<void> = async () => {}) {
  app = await buildApp({ config, pingDb, serveWeb: false });
  return app;
}

async function login(password = PASSWORD) {
  return app.inject({ method: 'POST', url: '/api/auth/login', payload: { password } });
}

describe('session values', () => {
  it('round-trips', () => {
    expect(isSessionValueValid(createSessionValue(PASSWORD), PASSWORD)).toBe(true);
  });

  it('is invalidated by a password change', () => {
    expect(isSessionValueValid(createSessionValue(PASSWORD), 'new password')).toBe(false);
  });

  it('expires', () => {
    const issued = Date.now() - SESSION_MAX_AGE_SECONDS * 1000 - 1;
    expect(isSessionValueValid(createSessionValue(PASSWORD, issued), PASSWORD)).toBe(false);
  });

  it('rejects malformed values', () => {
    for (const v of ['', 'abc', '123', '1.2.3', 'NaN.deadbeef']) {
      expect(isSessionValueValid(v, PASSWORD)).toBe(false);
    }
  });
});

describe('config', () => {
  it('rejects a short SESSION_SECRET without echoing it', () => {
    expect(() =>
      loadConfig({ DATABASE_URL: 'x', APP_PASSWORD: 'p', SESSION_SECRET: 'tooshort' }),
    ).toThrow(/SESSION_SECRET: must be at least 32 characters/);
    expect(() =>
      loadConfig({ DATABASE_URL: 'x', APP_PASSWORD: 'p', SESSION_SECRET: 'tooshort' }),
    ).not.toThrow(/tooshort/);
  });
});

describe('GET /healthz', () => {
  it('is 200 when the database responds', async () => {
    await makeApp();
    const res = await app.inject('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, db: 'up' });
  });

  it('is 503 when the database is down', async () => {
    await makeApp(async () => {
      throw new Error('connection refused');
    });
    const res = await app.inject('/healthz');
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ ok: false, db: 'down' });
  });
});

describe('auth', () => {
  it('blocks protected API routes without a session', async () => {
    await makeApp();
    const res = await app.inject('/api/hello');
    expect(res.statusCode).toBe(401);
  });

  it('rejects a wrong password', async () => {
    await makeApp();
    const res = await login('nope');
    expect(res.statusCode).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('rejects an empty body', async () => {
    await makeApp();
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it('logs in with an httpOnly signed cookie that unlocks the API', async () => {
    await makeApp();
    const res = await login();
    expect(res.statusCode).toBe(200);
    const cookie = res.cookies[0]!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('Lax');

    const cookies = { [cookie.name]: cookie.value };
    expect((await app.inject({ url: '/api/auth/me', cookies })).json()).toEqual({ authenticated: true });
    const hello = await app.inject({ url: '/api/hello', cookies });
    expect(hello.statusCode).toBe(200);
    expect(hello.json().message).toMatch(/narrator/i);
  });

  it('rejects a tampered cookie', async () => {
    await makeApp();
    const cookie = (await login()).cookies[0]!;
    const tampered = cookie.value.replace(/^\d/, (d) => String((Number(d) + 1) % 10));
    const res = await app.inject({ url: '/api/hello', cookies: { [cookie.name]: tampered } });
    expect(res.statusCode).toBe(401);
  });

  it('returns JSON 404 for unknown API routes', async () => {
    await makeApp();
    const cookie = (await login()).cookies[0]!;
    const res = await app.inject({ url: '/api/nope', cookies: { [cookie.name]: cookie.value } });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Not found' });
  });
});
