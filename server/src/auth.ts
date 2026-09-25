import { createHash, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'narrator_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function passwordMatches(candidate: string, expected: string): boolean {
  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(sha256(candidate), sha256(expected));
}

// A short fingerprint of the password is embedded in the session so changing
// APP_PASSWORD invalidates every existing session.
function passwordFingerprint(password: string): string {
  return sha256(`narrator-session:${password}`).toString('hex').slice(0, 16);
}

/** Session payload (before cookie signing): `<issuedAtMs>.<passwordFingerprint>`. */
export function createSessionValue(password: string, now = Date.now()): string {
  return `${now}.${passwordFingerprint(password)}`;
}

export function isSessionValueValid(value: string, password: string, now = Date.now()): boolean {
  const [issuedAtRaw, fingerprint, ...rest] = value.split('.');
  if (!issuedAtRaw || !fingerprint || rest.length > 0) return false;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now) return false;
  if (now - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;
  return fingerprint === passwordFingerprint(password);
}
