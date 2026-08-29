import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: true,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 500, 2000);
    },
  });

redis.on("error", (err) => {
  // Silent error handling for dev environment if Redis is not running
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function isRedisReady(): Promise<boolean> {
  try {
    const status: string = redis.status;
    if (status === "ready") return true;
    if (status === "wait" || status === "close" || status === "end") {
      await redis.connect();
    }
    return redis.status === "ready" || redis.status === "connecting" || redis.status === "connect";
  } catch {
    return false;
  }
}