import CacheMgr from './CacheMgr';
import RedisCacheMgr from './RedisCacheMgr';
import RedisMockCacheMgr from './RedisMockCacheMgr';

export default class NocoCache {
  private static client: CacheMgr;
  private static cacheDisabled: boolean;

  public static init(config: { driver: 'redis' | 'redisMock' }) {
    if (process.env.NC_DISABLE_CACHE) {
      this.cacheDisabled = !!process.env.NC_DISABLE_CACHE || false;
      // return;
    }

    switch (config.driver) {
      case 'redis':
        this.client = new RedisCacheMgr({});
        break;
      case 'redisMock':
        this.client = new RedisMockCacheMgr({});
        break;
    }
  }

  public static async set(key, value, ttl?): Promise<boolean> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.set(key, value, ttl);
  }

  public static async get(key, type): Promise<any> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.get(key, type);
  }

  public static async getAll(pattern: string): Promise<any[]> {
    if (this.cacheDisabled) return Promise.resolve([]);
    return this.client.getAll(pattern);
  }

  public static async del(key): Promise<boolean> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.del(key);
  }

  public static async delAll(scope: string, pattern: string): Promise<any[]> {
    if (this.cacheDisabled) return Promise.resolve([]);
    return this.client.delAll(scope, pattern);
  }

  public static async getList(
    scope: string,
    subKeys: string[]
  ): Promise<any[]> {
    if (this.cacheDisabled) return Promise.resolve([]);
    return this.client.getList(scope, subKeys);
  }

  public static async setList(
    scope: string,
    subListKeys: string[],
    list: any[]
  ): Promise<boolean> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.setList(scope, subListKeys, list);
  }

  public static async deepDel(
    scope: string,
    key: string,
    direction: string
  ): Promise<boolean> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.deepDel(scope, key, direction);
  }

  public static async appendToList(
    scope: string,
    subListKeys: string[],
    key: string
  ): Promise<boolean> {
    if (this.cacheDisabled) return Promise.resolve(true);
    return this.client.appendToList(scope, subListKeys, key);
  }
}
