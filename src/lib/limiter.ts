import { callStore } from "./store";

export type Take = { allowed: boolean; remaining: number; retryAfter: number };

// Used only if the store cannot be reached, so limits still hold on one server instance.
const memory = new Map<string, { count: number; resetAt: number }>();

export function takeMemory(key: string, limit: number, windowSeconds: number): Take {
  const now = Date.now();
  if (memory.size > 2000) for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: 1 <= limit, remaining: Math.max(limit - 1, 0), retryAfter: windowSeconds };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(limit - entry.count, 0),
    retryAfter: Math.max(Math.ceil((entry.resetAt - now) / 1000), 1)
  };
}

export async function take(key: string, limit: number, windowSeconds: number): Promise<Take> {
  const result = await callStore<Take>({ action: "take", key, limit, window: windowSeconds });
  if (result && typeof result.allowed === "boolean") return result;
  return takeMemory(key, limit, windowSeconds);
}
