import CacheMgr from './CacheMgr';
import Redis from 'ioredis';
import { CacheDelDirection, CacheGetType, CacheScope } from '../utils/globals';

export default class RedisCacheMgr extends CacheMgr {
  client: any;

  constructor(config: any) {
    super();
    this.client = new Redis(config);
    // flush the existing db with selected key (Default: 0)
    this.client.flushdb();
  }

  // avoid circular structure to JSON
  getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  // @ts-ignore
  async del(key: string): Promise<any> {
    console.log(`RedisCacheMgr::del: deleting key ${key}`);
    return this.client.del(key);
  }

  // @ts-ignore
  async get(key: string, type: string, config?: any): Promise<any> {
    console.log(`RedisCacheMgr::get: getting key ${key} with type ${type}`);
    if (type === CacheGetType.TYPE_ARRAY) {
      return this.client.smembers(key);
    } else if (type === CacheGetType.TYPE_OBJECT) {
      const res = await this.client.get(key);
      try {
        const o = JSON.parse(res);
        if (typeof o === 'object') {
          if (
            o &&
            Object.keys(o).length === 0 &&
            Object.getPrototypeOf(o) === Object.prototype
          ) {
            console.log(`RedisCacheMgr::get: object is empty!`);
          }
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
    return Promise.resolve(true);
  }

  // @ts-ignore
  async set(key: string, value: any): Promise<any> {
    if (typeof value !== 'undefined' && value) {
      console.log(`RedisCacheMgr::set: setting key ${key} with value ${value}`);
      if (typeof value === 'object') {
        if (Array.isArray(value) && value.length) {
          return this.client.sadd(key, value);
        }
        return this.client.set(
          key,
          JSON.stringify(value, this.getCircularReplacer())
        );
      }
      return this.client.set(key, value);
    } else {
      console.log(
        `RedisCacheMgr::set: value is empty for ${key}. Skipping ...`
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
      `RedisCacheMgr::delAll: deleting all keys with pattern ${scope}:${pattern}`
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
    const key =
      subKeys.length === 0
        ? `${scope}:list`
        : `${scope}:${subKeys.join(':')}:list`;
    // e.g. arr = ["<scope>:<model_id_1>", "<scope>:<model_id_2>"]
    const arr = (await this.get(key, CacheGetType.TYPE_ARRAY)) || [];
    console.log(`RedisCacheMgr::getList: getting list with key ${key}`);
    return Promise.all(
      arr.map(async k => await this.get(k, CacheGetType.TYPE_OBJECT))
    );
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
    const listKey =
      subListKeys.length === 0
        ? `${scope}:list`
        : `${scope}:${subListKeys.join(':')}:list`;
    if (!list.length) {
      console.log(
        `RedisCacheMgr::setList: List is empty for ${listKey}. Skipping ...`
      );
      return Promise.resolve(true);
    }
    // fetch existing list
    const listOfGetKeys =
      (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
    for (const o of list) {
      // construct key for Get
      // e.g. <scope>:<model_id_1>
      let getKey = `${scope}:${o.id}`;
      // special case - MODEL_ROLE_VISIBILITY
      if (scope === CacheScope.MODEL_ROLE_VISIBILITY) {
        getKey = `${scope}:${o.id}:${o.role}`;
      }
      // set Get Key
      console.log(`RedisCacheMgr::setList: setting key ${getKey}`);
      await this.set(getKey, JSON.stringify(o, this.getCircularReplacer()));
      // push Get Key to List
      listOfGetKeys.push(getKey);
    }
    // set List Key
    console.log(`RedisCacheMgr::setList: setting list with key ${listKey}`);
    return this.set(listKey, listOfGetKeys);
  }

  async deepDel(
    scope: string,
    key: string,
    direction: string
  ): Promise<boolean> {
    console.log(`RedisCacheMgr::deepDel: choose direction ${direction}`);
    if (direction === CacheDelDirection.CHILD_TO_PARENT) {
      // given a child key, delete all keys in corresponding parent lists
      const scopeList = await this.client.keys(`${scope}*list`);
      for (const listKey of scopeList) {
        // get target list
        let list = (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
        if (!list.length) {
          continue;
        }
        // remove target Key
        list = list.filter(k => k !== key);
        // delete list
        console.log(`RedisCacheMgr::deepDel: remove listKey ${listKey}`);
        await this.del(listKey);
        if (list.length) {
          // set target list
          console.log(`RedisCacheMgr::deepDel: set key ${listKey}`);
          await this.del(listKey);
          await this.set(listKey, list);
        }
      }
      console.log(`RedisCacheMgr::deepDel: remove key ${key}`);
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
    const listKey =
      subListKeys.length === 0
        ? `${scope}:list`
        : `${scope}:${subListKeys.join(':')}:list`;
    console.log(`RedisCacheMgr::appendToList: append key ${key} to ${listKey}`);
    const list = (await this.get(listKey, CacheGetType.TYPE_ARRAY)) || [];
    list.push(key);
    return this.set(listKey, list);
  }
}
