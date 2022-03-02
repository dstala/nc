import CacheMgr from './CacheMgr';
import RedisCacheMgr from './RedisCacheMgr';
// import MemCacheMgr from './MemCacheMgr';
// import DummyCacheMgr from './DummyCacheMgr';

export default class NocoCache {
  private static client: CacheMgr;

  public static init(config: { driver: 'redis' | 'memory' }) {
    if (process.env.NC_DISABLE_CACHE) {
      // this.client = new DummyCacheMgr();
      return;
    }

    switch (config.driver) {
      case 'redis':
        this.client = new RedisCacheMgr({});
        break;
      // case 'memory':
      //   this.client = new MemCacheMgr({});
      //   break;
    }
  }

  public static async set(key, value, ttl?): Promise<boolean> {
    return this.client.set(key, value, ttl);
  }

  public static async get(key, type): Promise<any> {
    return this.client.get(key, type);
  }

  public static async getAll(pattern: string): Promise<any[]> {
    return this.client.getAll(pattern);
  }

  public static async del(key): Promise<boolean> {
    return this.client.del(key);
  }

  public static async delAll(scope: string, pattern: string): Promise<any[]> {
    return this.client.delAll(scope, pattern);
  }

  public static async getList(
    scope: string,
    subKeys: string[]
  ): Promise<any[]> {
    return this.client.getList(scope, subKeys);
  }

  public static async setList(
    scope: string,
    subListKeys: string[],
    list: any[]
  ): Promise<boolean> {
    return this.client.setList(scope, subListKeys, list);
  }

  public static async deepDel(
    scope: string,
    key: string,
    direction: string
  ): Promise<boolean> {
    return this.client.deepDel(scope, key, direction);
  }

  public static async appendToList(
    listKey: string,
    key: string
  ): Promise<boolean> {
    return this.client.appendToList(listKey, key);
  }
}
