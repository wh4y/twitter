import Redis from 'ioredis';

export class RedisRepository {
  private readonly repositoryPrefix: string;

  constructor(private readonly redis: Redis, repositoryPrefix: string) {
    this.repositoryPrefix = repositoryPrefix + ':';
  }

  private getRedisKey(key: string) {
    return this.repositoryPrefix + key;
  }

  public async expire(key: string, ttlInMilliseconds: number): Promise<void> {
    const ttlInSeconds = ttlInMilliseconds / 1000;

    const redisKey = this.getRedisKey(key);

    this.redis.expire(redisKey, ttlInSeconds);
  }

  public async set(key: string, value: string, ttlInMilliseconds?: number): Promise<void> {
    const redisKey = this.getRedisKey(key);

    if (!ttlInMilliseconds) {
      await this.redis.set(redisKey, value);

      return;
    }

    await this.redis.set(redisKey, value, 'PX', ttlInMilliseconds);
  }

  public async get(key: string): Promise<string> {
    const redisKey = this.getRedisKey(key);

    return this.redis.get(redisKey);
  }

  public async del(key: string): Promise<void> {
    const redisKey = this.getRedisKey(key);

    await this.redis.del(redisKey);
  }

  public async rpush(key: string, value: string): Promise<void> {
    const redisKey = this.getRedisKey(key);

    await this.redis.rpush(redisKey, value);
  }

  public async lrange(key: string, from: number, to: number): Promise<string[]> {
    const redisKey = this.getRedisKey(key);

    return this.redis.lrange(redisKey, from, to);
  }

  public async lpop(key: string): Promise<string> {
    const redisKey = this.getRedisKey(key);

    return this.redis.lpop(redisKey);
  }

  public async llen(key: string): Promise<number> {
    const redisKey = this.getRedisKey(key);

    return this.redis.llen(redisKey);
  }

  public async sadd(key: string, value: string): Promise<void> {
    const redisKey = this.getRedisKey(key);

    this.redis.sadd(redisKey, value);
  }

  public async srem(key: string, value: string): Promise<void> {
    const redisKey = this.getRedisKey(key);

    this.redis.srem(redisKey, value);
  }

  public async smembers(key: string): Promise<string[]> {
    const redisKey = this.getRedisKey(key);

    return this.redis.smembers(redisKey);
  }

  public async scard(key: string): Promise<number> {
    const redisKey = this.getRedisKey(key);

    return this.redis.scard(redisKey);
  }
}
