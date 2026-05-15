import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Własna, prosta implementacja w pamięci jako fallback (dla dewelopmentu)
// Ogranicza z użyciem Map. W produkcji użyłbyś tylko Upstash.
const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

function fallbackRateLimit(ip: string, limit: number, windowSecs: number) {
  const now = Date.now();
  let record = ipRequestMap.get(ip);
  
  if (!record || record.expiresAt < now) {
    record = { count: 0, expiresAt: now + windowSecs * 1000 };
  }
  
  record.count++;
  ipRequestMap.set(ip, record);
  
  return {
    success: record.count <= limit,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.expiresAt,
  };
}

// Skonfiguruj Upstash Ratelimit lub użyj fallback
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });
}

export async function checkRateLimit(identifier: string = "anonymous") {
  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    return { success, limit, remaining, reset };
  }
  
  // Fallback map ratelimit (10 reqs per 60 secs)
  return fallbackRateLimit(identifier, 10, 60);
}
