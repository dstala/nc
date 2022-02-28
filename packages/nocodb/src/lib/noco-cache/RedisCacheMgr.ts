import CacheMgr from './CacheMgr';
import Redis from 'ioredis';

export default class RedisCacheMgr extends CacheMgr {
  client: any;

  constructor(config: any) {
    super();
    this.client = new Redis(config);
  }

  async clear(): Promise<any> {
    return Promise.resolve(undefined);
  }

  // @ts-ignore
  async del(key: string): Promise<any> {
    return this.client.del(key);
  }

  // @ts-ignore
  async get(key: string, config?: any): Promise<any> {
    return this.client.get(key);
  }

  // @ts-ignore
  async set(key: string, value: any, config?: any): Promise<any> {
    return this.client.set(key, value);
  }

  // @ts-ignore
  async getAll(pattern: string): Promise<any> {
    return this.client.hgetall(pattern);
  }

  // @ts-ignore
  getOne(pattern: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  // @ts-ignore
  delAll(pattern: string): Promise<any[]> {
    return Promise.resolve([]);
  }
}
