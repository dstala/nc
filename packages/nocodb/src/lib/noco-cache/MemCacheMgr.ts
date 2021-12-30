import CacheMgr from './CacheMgr';

const filterBy = pattern => {
  const re = new RegExp(
    '^' +
      pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') +
      '$'
  );
  return str => {
    return re.test(str);
  };
};

import LRU from 'lru-cache';

export default class MemCacheMgr extends CacheMgr {
  instance: LRU<any, any>;

  constructor(options: LRU.Options<any, any>) {
    super();
    this.instance = new LRU(options);
  }

  async clear(): Promise<void> {
    // this.instance.
  }

  async del(key: string): Promise<any> {
    return this.instance.del(key);
  }

  async get(key: string, _config?: any): Promise<any> {
    return this.instance.get(key);
  }

  async set(key: string, value: any, _config?: any): Promise<any> {
    return this.instance.set(key, value);
  }

  // @ts-ignore
  async getAll(pattern: string): Promise<any> {
    return Promise.all(
      this.instance
        .keys()
        .filter(filterBy(pattern))
        .map(k => this.get(k))
    );
  }

  getOne(pattern: string): Promise<any> {
    const key = this.instance.keys().find(filterBy(pattern));
    return this.get(key);
  }
}
