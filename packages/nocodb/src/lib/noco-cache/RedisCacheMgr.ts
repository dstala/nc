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
  async get(key: string, type: number, config?: any): Promise<any> {
    if (type === 1) {
      return this.client.smembers(key);
    } else if (type == 2) {
      return this.client.get(key);
    }
  }

  // @ts-ignore
  async set(key: string, value: any): Promise<any> {
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return this.client.sadd(key, value);
      }
      // return this.client.hmset(key, value);
    }
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

  async getList(scope: string, subKeys: string[]): Promise<any[]> {
    // remove null from arrays
    subKeys = subKeys.filter(k => k);
    // e.g. key = <scope>:<project_id_1>:<base_id_1>:list
    const key = `${scope}:${subKeys.join(':')}:list`;
    // e.g. arr = ["<scope>:<model_id_1>", "<scope>:<model_id_2>"]
    const arr = (await this.get(key, 1)) || [];
    return Promise.all(arr.map(async k => JSON.parse(await this.get(k, 2))));
  }

  async setList(
    scope: string,
    subListKeys: string[],
    list: any[]
  ): Promise<boolean> {
    const listOfGetKeys = [];
    for (const o of list) {
      // construct key for Get
      // e.g. <scope>:<model_id_1>
      const getKey = `${scope}:${o.id}`;
      // set Get Key
      await this.set(getKey, JSON.stringify(o));
      // push Get Key to List
      listOfGetKeys.push(getKey);
    }
    // remove null from arrays
    subListKeys = subListKeys.filter(k => k);
    // construct key for List
    // e.g. <scope>:<project_id_1>:<base_id_1>:list
    const listKey = `${scope}:${subListKeys.join(':')}:list`;
    // set List Key
    return this.set(listKey, listOfGetKeys);
  }
}
