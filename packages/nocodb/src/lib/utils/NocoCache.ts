import Keyv from 'keyv';

export default class NocoCache {
  private static keyv: Keyv;

  public static init() {
    this.keyv = new Keyv();
  }

  public static async set(key, value, ttl?): Promise<boolean> {
    return this.keyv.set(key, value, ttl);
  }
  public static async get(key, options?): Promise<any> {
    return this.keyv.get(key, options);
  }
  public static async delete(key): Promise<boolean> {
    return this.keyv.delete(key);
  }
  public static async clear(): Promise<boolean> {
    return this.keyv.clear();
  }
}
