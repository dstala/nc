import CacheMgr from './CacheMgr';
// @ts-ignore
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
    console.log(`RedisCacheMgr::del: deleting key ${key}`);
    return this.client.del(key);
  }

  // @ts-ignore
  async get(key: string, type: number, config?: any): Promise<any> {
    console.log(`RedisCacheMgr::get: getting key ${key} with type ${type}`);
    if (type === 1) {
      return this.client.smembers(key);
    } else if (type == 2) {
      const res = await this.client.get(key);
      try {
        const o = JSON.parse(res);
        if (typeof o === 'object') {
          return Promise.resolve(o);
        }
      } catch (e) {
        return Promise.resolve(res);
      }
      return Promise.resolve(res);
    }
  }

  // @ts-ignore
  async set(key: string, value: any): Promise<any> {
    console.log(`RedisCacheMgr::set: setting key ${key} with value ${value}`);
    if (typeof value === 'object') {
      if (Array.isArray(value) && value.length) {
        await this.client.del(key);
        return this.client.sadd(key, value);
      }
      return this.client.set(key, JSON.stringify(value));
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
  async delAll(pattern: string): Promise<any[]> {
    const keys = await this.client.keys(pattern);
    console.log(`RedisCacheMgr::delAll: deleting all keys with ${keys}`);
    return Promise.all(keys.map(async k => await this.client.del(k)));
  }

  async getList(scope: string, subKeys: string[]): Promise<any[]> {
    // remove null from arrays
    subKeys = subKeys.filter(k => k);
    // e.g. key = <scope>:<project_id_1>:<base_id_1>:list
    const key = `${scope}:${subKeys.join(':')}:list`;
    // e.g. arr = ["<scope>:<model_id_1>", "<scope>:<model_id_2>"]
    const arr = (await this.get(key, 1)) || [];
    console.log(`RedisCacheMgr::getList: getting list with key ${key}`);
    return Promise.all(arr.map(async k => await this.get(k, 2)));
  }

  async setList(
    scope: string,
    subListKeys: string[],
    list: any[]
  ): Promise<boolean> {
    // remove null from arrays
    subListKeys = subListKeys.filter(k => k);
    // construct key for List
    // e.g. <scope>:<project_id_1>:<base_id_1>:list
    const listKey = `${scope}:${subListKeys.join(':')}:list`;
    // fetch existing list
    const listOfGetKeys = (await this.get(listKey, 1)) || [];
    for (const o of list) {
      // construct key for Get
      // e.g. <scope>:<model_id_1>
      const getKey = `${scope}:${o.id}`;
      // set Get Key
      console.log(`RedisCacheMgr::setList: setting key ${getKey}`);
      await this.set(getKey, JSON.stringify(o));
      // push Get Key to List
      listOfGetKeys.push(getKey);
    }
    // set List Key
    console.log(`RedisCacheMgr::setList: setting list with key ${listKey}`);
    return this.set(listKey, listOfGetKeys);
  }

  async deepDel(scope: string, key: string): Promise<boolean> {
    const scopeList = await this.client.keys(`${scope}:*:list`);
    for (const listKey of scopeList) {
      // get target list
      let list = (await this.get(listKey, 1)) || [];
      if (!list.length) {
        continue;
      }
      // remove target Key
      list = list.filter(k => k !== key);
      if (list.length) {
        // set target list
        console.log(`RedisCacheMgr::deepDel: set key ${listKey}`);
        await this.set(listKey, list);
      } else {
        // delete list
        console.log(`RedisCacheMgr::deepDel: remove listKey ${listKey}`);
        await this.del(listKey);
      }
    }
    console.log(`RedisCacheMgr::deepDel: remove key ${key}`);
    return await this.del(key);
  }

  async appendToList(listKey: string, key: string): Promise<boolean> {
    console.log(`RedisCacheMgr::appendToList: append key ${key} to ${listKey}`);
    const list = (await this.get(listKey, 1)) || [];
    list.push(key);
    return this.set(listKey, list);
  }
}
