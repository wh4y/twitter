import Redis from 'ioredis';

export class RedisRepository<Entity> {
  constructor(private readonly redis: Redis, private readonly repositoryPrefix: string) {}

  public async set(key: string, value: Entity): Promise<void> {
    const redisKey = this.repositoryPrefix + key;
    const jsonValue = JSON.stringify(value);

    await this.redis.set(redisKey, jsonValue);
  }

  public async get(key: string): Promise<Entity> {
    const redisKey = this.repositoryPrefix + key;
    const jsonValue = await this.redis.get(redisKey);

    return JSON.parse(jsonValue);
  }

  public async del(key: string): Promise<Entity> {
    const entity = await this.get(key);
    const redisKey = this.repositoryPrefix + key;

    await this.redis.del(redisKey);

    return entity;
  }
}
