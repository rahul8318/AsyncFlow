import Redis from 'ioredis';
import { env } from '../config/env.js';

class MemoryCache {
  private store = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }
}

let redisClient: Redis | MemoryCache;

if (env.REDIS_ENABLED) {
  try {
    const r = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
    });
    r.on('error', (err) => {
      console.warn('⚠️ Redis connection error, using in-memory cache fallback:', err.message);
    });
    redisClient = r;
  } catch (err) {
    console.warn('⚠️ Could not initialize Redis client, falling back to in-memory cache.');
    redisClient = new MemoryCache();
  }
} else {
  redisClient = new MemoryCache();
}

export const cache = redisClient;
export default cache;
