import CacheMgr from './CacheMgr';
import Redis from 'ioredis-mock';
import { CacheDelDirection, CacheGetType } from '../utils/globals';

export default class RedisMockCacheMgr extends CacheMgr {
  client: any;

  constructor(config: any) {
    super();
    this.client = new Redis(config);
  }

  // @ts-ignore
  async del(key: string): Promise<any> {
    console.log(`RedisMockCacheMgr::del: deleting key ${key}`);
    return this.client.del(key);
  }

  // @ts-ignore
  async get(key: string, type: string, config?: any): Promise<any> {
    console.log(`RedisMockCacheMgr::get: getting key ${key} with type ${type}`);
    if (type === CacheGetType.TYPE_ARRAY) {
      return this.client.smembers(key);
    } else if (type === CacheGetType.TYPE_OBJECT) {
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
    } else if (type === CacheGetType.TYPE_STRING) {
      return await this.client.get(key);
    }
    throw Error(`Invalid CacheGetType: ${type}`);
  }

  // @ts-ignore
  async set(key: string, value: any): Promise<any> {
    if (typeof value !== 'undefined' && value) {
      console.log(
        `RedisMockCacheMgr::set: setting key ${key} with value ${value}`
      );
      if (typeof value === 'object') {
        if (Array.isArray(value) && value.length) {
          await this.client.del(key);
          return this.client.sadd(key, value);
        }
        return this.client.set(key, JSON.stringify(value));
      }
      return this.client.set(key, value);
    } else {
      console.log(
        `RedisMockCacheMgr::set: value is empty for ${key}. Skipping ...`
      );
      return Promise.resolve(true);
    }
  }

  // @ts-ignore
  async getAll(pattern: string): Promise<any> {
    return this.client.hgetall(pattern);
  }

  // @ts-ignore
  async delAll(scope: string, pattern: string): Promise<any[]> {
    // Example: model:*:<id>
    const keys = await this.client.keys(`${scope}:${pattern}`);
    console.log(
      `RedisMockCacheMgr::delAll: deleting all keys with pattern ${scope}:${pattern}`
    );
    return Promise.all(
      keys.map(
        async k =>
          await this.client.deepDel(scope, k, CacheDelDirection.CHILD_TO_PARENT)
      )
    );
  }

  async getList(scope: string, subKeys: string[]): Promise<any[]> {
    // remove null from arrays
    subKeys = subKeys.filter(k => k);
    // e.g. key = <scope>:<project_id_1>:<base_id_1>:list
    const key = `${scope}:${subKeys.join(':')}:list`;
    // e.g. arr = ["<scope>:<model_id_1>", "<scope>:<model_id_2>"]
    const arr = (await this.get(key, CacheGetType.TYPE_ARRAY)) || [];
    console.log(`RedisMockCacheMgr::getList: getting list with key ${key}`);
    return Promise.all(
      arr.map(async k => await this.get(k, CacheGetType.TYPE_OBJECT))
    );
  }

  async setList(
    scope: string,
    subListKeys: string[],
    list: any[]
  ): Promise<boolean> {
    if (!list.length) {
      console.log('RedisMockCacheMgr::setList: List is empty. Skipping ...');
      return Promise.resolve(true);
    }
    // remove null from arrays
    subListKeys = subListKeys.filter(k => k);
    // construct key for List
    // e.g. <scope>:<project_id_1>:<base_id_1>:list
    const listKey = `${scope}:${subListKeys.join(':')}:list`;
    // fetch existing list
    const listOfGetKeys =
      (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
    for (const o of list) {
      // construct key for Get
      // e.g. <scope>:<model_id_1>
      const getKey = `${scope}:${o.id}`;
      // set Get Key
      console.log(`RedisMockCacheMgr::setList: setting key ${getKey}`);
      await this.set(getKey, JSON.stringify(o));
      // push Get Key to List
      listOfGetKeys.push(getKey);
    }
    // set List Key
    console.log(`RedisMockCacheMgr::setList: setting list with key ${listKey}`);
    return this.set(listKey, listOfGetKeys);
  }

  async deepDel(
    scope: string,
    key: string,
    direction: string
  ): Promise<boolean> {
    console.log(`RedisMockCacheMgr::deepDel: choose direction ${direction}`);
    if (direction === CacheDelDirection.CHILD_TO_PARENT) {
      // given a child key, delete all keys in corresponding parent lists
      const scopeList = await this.client.keys(`${scope}:*:list`);
      for (const listKey of scopeList) {
        // get target list
        let list = (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
        if (!list.length) {
          continue;
        }
        // remove target Key
        list = list.filter(k => k !== key);
        if (list.length) {
          // set target list
          console.log(`RedisMockCacheMgr::deepDel: set key ${listKey}`);
          await this.set(listKey, list);
        } else {
          // delete list
          console.log(`RedisMockCacheMgr::deepDel: remove listKey ${listKey}`);
          await this.del(listKey);
        }
      }
      console.log(`RedisMockCacheMgr::deepDel: remove key ${key}`);
      return await this.del(key);
    } else if (direction === CacheDelDirection.PARENT_TO_CHILD) {
      // given a list key, delete all the children
      const listOfChildren = await this.get(key, CacheGetType.TYPE_ARRAY);
      // delete each child key
      await Promise.all(listOfChildren.map(async k => await this.del(k)));
      // delete list key
      return await this.del(key);
    } else {
      throw Error(`Invalid deepDel direction found : ${direction}`);
      return Promise.resolve(false);
    }
  }

  async appendToList(
    scope: string,
    subListKeys: string[],
    key: string
  ): Promise<boolean> {
    // remove null from arrays
    subListKeys = subListKeys.filter(k => k);
    // e.g. key = <scope>:<project_id_1>:<base_id_1>:list
    const listKey = `${scope}:${subListKeys.join(':')}:list`;
    console.log(`RedisCacheMgr::appendToList: append key ${key} to ${listKey}`);
    const list = (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
    list.push(key);
    return this.set(listKey, list);
  }
}
