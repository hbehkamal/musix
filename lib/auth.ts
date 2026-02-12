export const AUTH_COOKIE_NAME = "musix_access_token";
export const AUTH_EXPIRATION_COOKIE_NAME = "musix_access_token_expires";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Parse backend expiration (ISO string or Unix seconds) to Date, or null if invalid. */
export function parseExpiration(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Default token TTL in seconds when backend doesn't send expiration (matches token cookie maxAge). */
export const DEFAULT_TOKEN_MAX_AGE_SECONDS = COOKIE_OPTIONS.maxAge;

/**
 * Resolve expiration Date from login API result. Tries common backend fields;
 * supports absolute (ISO string, Unix seconds) and relative (expires_in seconds).
 * Returns null if nothing parseable; caller should use a fallback.
 */
export function getExpirationFromLoginResult(result: unknown): Date | null {
  if (result == null || typeof result !== "object") return null;
  
  const r = result as Record<string, unknown>;
  const absolute = r.access_token_expration;

  const parsed = parseExpiration(absolute);
  if (parsed) return parsed;
  const expiresIn = r.expires_in;
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0) {
    return new Date(Date.now() + expiresIn * 1000);
  }
  if (typeof expiresIn === "string") {
    const n = Number(expiresIn);
    if (Number.isFinite(n) && n > 0) return new Date(Date.now() + n * 1000);
  }
  return null;
}

export function setTokenCookie(token: string): string {
  const value = encodeURIComponent(token);
  const parts = [
    `${AUTH_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${COOKIE_OPTIONS.maxAge}`,
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ];
  if (COOKIE_OPTIONS.secure) parts.push("Secure");
  return parts.join("; ");
}

/** Set cookie with token expiration (ISO string). Call alongside setTokenCookie. */
export function setExpirationCookie(expiresAt: Date): string {
  const value = encodeURIComponent(expiresAt.toISOString());
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const parts = [
    `${AUTH_EXPIRATION_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${maxAge}`,
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ];
  if (COOKIE_OPTIONS.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearTokenCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=lax`;
}

export function clearExpirationCookie(): string {
  return `${AUTH_EXPIRATION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=lax`;
}

/** True if token is present and not expired (or no expiration cookie set). */
export function isTokenValid(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token?.trim()) return false;
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return true;
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${AUTH_EXPIRATION_COOKIE_NAME}=([^;]*)`)
  );
  const raw = match ? decodeURIComponent(match[1]) : null;


  if (!raw) return true; // no expiration stored → consider valid
  const expiresAt = parseExpiration(raw);
  if (!expiresAt) return false; // invalid or un-parseable → treat as expired
  return Date.now() < expiresAt.getTime();
}

/** Use in API routes when calling the backend: Authorization: Bearer <token> */
export function getAuthHeaders(request: Request): Record<string, string> {
  if (!isTokenValid(request)) return {};
  const token = getTokenFromRequest(request);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
