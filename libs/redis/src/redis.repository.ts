import Redis from 'ioredis';

export class RedisRepository {
  constructor(private readonly redis: Redis, private readonly repositoryPrefix: string) {}

  public async set(key: string, value: string, ttlInMilliseconds?: number): Promise<void> {
    const redisKey = this.repositoryPrefix + key;

    if (!ttlInMilliseconds) {
      await this.redis.set(redisKey, value);

      return;
    }

    await this.redis.set(redisKey, value, 'PX', ttlInMilliseconds);
  }

  public async get(key: string): Promise<string> {
    const redisKey = this.repositoryPrefix + key;

    return this.redis.get(redisKey);
  }

  public async del(key: string): Promise<void> {
    const redisKey = this.repositoryPrefix + key;

    await this.redis.del(redisKey);
  }

  public async rpush(key: string, value: string): Promise<void> {
    const redisKey = this.repositoryPrefix + key;

    await this.redis.rpush(redisKey, value);
  }

  public async lrange(key: string, from: number, to: number): Promise<string[]> {
    const redisKey = this.repositoryPrefix + key;

    return this.redis.lrange(redisKey, from, to);
  }

  public async lpop(key: string): Promise<string> {
    const redisKey = this.repositoryPrefix + key;

    return this.redis.lpop(redisKey);
  }

  public async llen(key: string): Promise<number> {
    const redisKey = this.repositoryPrefix + key;

    return this.redis.llen(redisKey);
  }
}
