// Password hashing with scrypt from Node's standard library. The stored value carries its own
// settings and salt, so the cost can be raised later without breaking existing accounts.
import crypto from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function scrypt(password: string, salt: Buffer, n: number, r: number, p: number, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password.normalize("NFKC"), salt, length, { N: n, r, p, maxmem: 128 * n * r * 2 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, N, R, P, KEY_LENGTH);
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string | null) {
  // A missing account still pays the same cost, so response time does not reveal which emails exist.
  const parts = (stored || "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    await scrypt(password, Buffer.alloc(16), N, R, P, KEY_LENGTH);
    return false;
  }
  const [, n, r, p, salt, hash] = parts;
  try {
    const expected = Buffer.from(hash, "base64url");
    const key = await scrypt(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p), expected.length);
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

const COMMON = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop",
  "iloveyou", "11111111", "00000000", "abc12345", "letmein123", "welcome123", "admin123", "passw0rd"
]);

/** Returns a message for a password that is too weak, or null if it is acceptable. */
export function passwordProblem(password: string, email: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use at most 128 characters.";
  if (/^(.)\1+$/.test(password)) return "Pick something less repetitive.";
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || lower === email.toLowerCase() || lower === email.split("@")[0]?.toLowerCase()) {
    return "That password is too easy to guess. Try a longer one.";
  }
  return null;
}
