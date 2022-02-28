import CacheMgr from './CacheMgr';
import RedisCacheMgr from './RedisCacheMgr';
// import MemCacheMgr from './MemCacheMgr';
// import DummyCacheMgr from './DummyCacheMgr';

export default class NocoCache {
  private static client: CacheMgr;
  // private static INDEX_KEY_SUFFIX = '_hm';

  // private static secondaryClient: CacheMgr;

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

  // TODO: remove it later
  // public static async setV2(key, _secondaryKey, value, ttl?): Promise<boolean> {
  //   const secondaryKey = `${_secondaryKey}${this.INDEX_KEY_SUFFIX}`;
  //   await this.client.set(key, value, ttl); // model_id
  //   const arr = (await this.client.get(secondaryKey)) || []; // project_id_hm
  //   arr.push(key);
  //   return this.client.set(secondaryKey, arr);
  // }

  public static async get(key, type): Promise<any> {
    return this.client.get(key, type);
  }

  // TODO: remove it later
  // public static async getV2(_secondaryKey): Promise<any> {
  //   const secondaryKey = `${_secondaryKey}${this.INDEX_KEY_SUFFIX}`;
  //   const arr = (await this.client.get(secondaryKey)) || [];
  //   return Promise.all(arr.map(k => this.get(k)));
  // }

  // TODO: remove it later
  // public static async delV2(_secondaryKey): Promise<any> {
  //   const secondaryKey = `${_secondaryKey}${this.INDEX_KEY_SUFFIX}`;
  //   const arr = (await this.client.get(secondaryKey)) || [];
  //   await this.client.del(secondaryKey);
  //   await Promise.all(
  //     arr.map(async k => {
  //       await this.delV2(k);
  //       await this.del(k);
  //     })
  //   );
  // }

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

  public static async getList(
    scope: string,
    subKeys: string[]
  ): Promise<any[]> {
    return this.client.getList(scope, subKeys);
  }

  public static async setList(
    scope: string,
    subListKeys: string[],
    list: any[],
  ): Promise<boolean> {
    return this.client.setList(scope, subListKeys, list);
  }
}
