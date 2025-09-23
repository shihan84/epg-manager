import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

export class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, value);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, ttlSeconds);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  // Cache key generators
  static getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  static getChannelKey(userId: string, channelId?: string): string {
    return channelId ? `channels:${userId}:${channelId}` : `channels:${userId}`;
  }

  static getProgramKey(userId: string, programId?: string): string {
    return programId ? `programs:${userId}:${programId}` : `programs:${userId}`;
  }

  static getScheduleKey(userId: string, scheduleId?: string): string {
    return scheduleId
      ? `schedules:${userId}:${scheduleId}`
      : `schedules:${userId}`;
  }

  static getEPGKey(userId: string, params: string): string {
    return `epg:${userId}:${params}`;
  }

  static getStatsKey(): string {
    return 'stats:system';
  }

  // Cache invalidation helpers
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:${userId}`,
      `channels:${userId}:*`,
      `programs:${userId}:*`,
      `schedules:${userId}:*`,
      `epg:${userId}:*`,
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  async invalidateSystemCache(): Promise<void> {
    await this.delPattern('stats:*');
  }
}

export const cache = CacheService.getInstance();
