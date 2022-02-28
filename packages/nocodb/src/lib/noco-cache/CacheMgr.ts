export default abstract class CacheMgr {
  public abstract get(key: string): Promise<any>;
  public abstract set(key: string, value: any, ttl?: any): Promise<any>;
  public abstract clear(): Promise<any>;
  public abstract del(key: string): Promise<any>;
  public abstract getAll(pattern: string): Promise<any[]>;
  public abstract delAll(pattern: string): Promise<any[]>;
  public abstract getOne(pattern: string): Promise<any>;
}
