// Uses the Web Crypto API (not Node's `crypto` module) so this works both in
// regular server code and in Next.js Middleware, which runs on the Edge runtime.

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${expiresAt}`;
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${bufferToHex(signature)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return false;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(signatureHex),
      encoder.encode(payload)
    );
    return valid;
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
