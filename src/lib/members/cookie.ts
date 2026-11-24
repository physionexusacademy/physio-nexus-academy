/**
 * The "approved member" cookie. When the website is members-only, the Worker lets a request through only if it carries this cookie (or the person is on a page that
 * is open to everyone). The cookie says: this person was found to be an approved member by the server a few minutes ago. It is signed with a key only the server has
 * (HMAC-SHA256), so it cannot be made or changed in the browser, and it expires quickly so a suspension takes effect within minutes. Web Crypto only: it runs in the
 * Worker, in Next.js and in node tests.
 */
export const MEMBER_COOKIE = "pna_ma";
/** How long an approval is trusted before the server is asked again (so a suspension takes effect within this time). */
export const MEMBER_COOKIE_TTL_SECONDS = 10 * 60;

const encoder = new TextEncoder();
const VERSION = "v1";

const toBase64Url = (bytes: ArrayBuffer) => {
  let text = "";
  for (const b of new Uint8Array(bytes)) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(`pna-members-gate:${VERSION}|${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

/** Compares two strings without stopping at the first difference. */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `v1.<user id>.<expiry, seconds>.<signature>` */
export async function signMemberToken(secret: string, userId: string, nowSeconds: number, ttlSeconds: number = MEMBER_COOKIE_TTL_SECONDS): Promise<string> {
  if (!secret) throw new Error("members: no signing key");
  if (!UUID.test(userId)) throw new Error("members: bad user id");
  const body = `${VERSION}.${userId}.${Math.floor(nowSeconds) + ttlSeconds}`;
  return `${body}.${await sign(secret, body)}`;
}

/** The user id when the token is genuine and not expired; otherwise null. Never throws. */
export async function verifyMemberToken(secret: string, token: string | null | undefined, nowSeconds: number): Promise<string | null> {
  try {
    if (!secret || !token || token.length > 400) return null;
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== VERSION) return null;
    const [, userId, expiry, signature] = parts;
    if (!UUID.test(userId) || !/^\d{9,12}$/.test(expiry)) return null;
    if (Number(expiry) <= nowSeconds) return null;
    const expected = await sign(secret, `${VERSION}.${userId}.${expiry}`);
    return sameText(signature, expected) ? userId : null;
  } catch {
    return null;
  }
}

export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

/** The Set-Cookie line that stores the approval: not readable by scripts, only over https, sent only to this site. */
export const memberCookieHeader = (token: string, ttlSeconds: number = MEMBER_COOKIE_TTL_SECONDS) =>
  `${MEMBER_COOKIE}=${token}; Max-Age=${ttlSeconds}; Path=/; HttpOnly; Secure; SameSite=Lax`;
export const clearMemberCookieHeader = () => `${MEMBER_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
