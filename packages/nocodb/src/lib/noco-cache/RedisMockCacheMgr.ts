// import CacheMgr from './CacheMgr';
// import Redis from 'ioredis-mock';
//
// export default class RedisCacheMgr extends CacheMgr {
//   client: RedisClientType<any>;
//
//   constructor(config: any) {
//     super();
//     this.client = createClient(config);
//   }
//
//   async clear(): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   async del(key: string): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   async get(key: string, config?: any): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   async set(key: string, value: any, config?: any): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   async getAll(pattern: string): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   getOne(pattern: string): Promise<any> {
//     return Promise.resolve(undefined);
//   }
//
//   // @ts-ignore
//   delAll(pattern: string): Promise<any[]> {
//     return Promise.resolve([]);
//   }
// }
