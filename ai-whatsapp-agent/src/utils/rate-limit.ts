import { config } from "../config/config";

const bucket = new Map<string, { count: number; resetAt: number }>();

export function allowRequest(key: string): boolean {
  const now = Date.now();
  const entry = bucket.get(key);

  if (!entry || entry.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + config.RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= config.RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}
