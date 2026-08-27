import Redis from "ioredis";

export const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 1000,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) return null; // jangan retry terus menerus jika redis offline
    return 1000;
  },
});

redis.on("error", (err) => {
  // Tangkap error secara graceful agar tidak throw unhandled exception
});