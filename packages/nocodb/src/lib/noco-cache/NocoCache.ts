import CacheMgr from './CacheMgr';
import RedisCacheMgr from './RedisCacheMgr';
import MemCacheMgr from './MemCacheMgr';

export default class NocoCache {
  private static client: CacheMgr;

  public static init(config: { driver: 'redis' | 'memory' }) {
    switch (config.driver) {
      case 'redis':
        this.client = new RedisCacheMgr({});
        break;
      case 'memory':
        this.client = new MemCacheMgr({});
        break;
    }
  }

  public static async set(key, value, ttl?): Promise<boolean> {
    return this.client.set(key, value, ttl);
  }

  public static async get(key, options?): Promise<any> {
    return this.client.get(key, options);
  }
  public static async getAll(pattern: string): Promise<any[]> {
    return this.client.getAll(pattern);
  }
  public static async getOne(pattern: string): Promise<any> {
    return this.client.getOne(pattern);
  }

  public static async del(key): Promise<boolean> {
    return this.client.del(key);
  }

  public static async delAll(pattern: string): Promise<any[]> {
    return this.client.delAll(pattern);
  }

  public static async clear(): Promise<boolean> {
    return this.client.clear();
  }
}
