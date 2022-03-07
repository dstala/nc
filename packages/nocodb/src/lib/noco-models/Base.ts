import Noco from '../noco/Noco';
import Project from './Project';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import Model from './Model';
import { BaseType } from 'nc-common';
import NocoCache from '../noco-cache/NocoCache';

// todo: hide credentials
export default class Base implements BaseType {
  public alias?: string;
  public host?: string;
  public port?: number;
  public username?: string;
  public password?: string;
  public database?: string;
  public url?: string;
  public params?: string;
  public type?: string;
  public is_meta?: boolean;

  public project_id: string;
  public id: string;

  constructor(base: Partial<Base>) {
    Object.assign(this, base);
  }

  public static async createBase(base: BaseType & { projectId: string }) {
    const { id } = await Noco.ncMeta.metaInsert2(
      base.projectId,
      null,
      MetaTable.BASES,
      {
        id: base?.id,
        alias: base.alias,
        host: base.host,
        port: base.port,
        username: base.username,
        password: base.password,
        database: base.database,
        url: base.url,
        params: base.params,
        type: base.type,
        is_meta: base.is_meta
      }
    );
    await NocoCache.appendToList(
      CacheScope.BASE,
      [base.projectId],
      `${CacheScope.BASE}:${id}`
    );
    return this.get(id);
  }

  static async list(args: { projectId: string }): Promise<Base[]> {
    let baseDataList = await NocoCache.getList(CacheScope.BASE, [
      args.projectId
    ]);
    if (!baseDataList.length) {
      baseDataList = await Noco.ncMeta.metaList2(
        args.projectId,
        null,
        MetaTable.BASES
      );
      await NocoCache.setList(CacheScope.BASE, [args.projectId], baseDataList);
    }
    return baseDataList?.map(baseData => new Base(baseData));
  }
  static async get(id: string): Promise<Base> {
    let baseData =
      id &&
      (await NocoCache.get(
        `${CacheScope.BASE}:${id}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!baseData) {
      baseData = await Noco.ncMeta.metaGet2(null, null, MetaTable.BASES, id);
      await NocoCache.set(`${CacheScope.BASE}:${id}`, baseData);
    }
    return baseData && new Base(baseData);
  }

  public getConnectionConfig(): any {
    if (this.is_meta) {
      const metaConfig = Noco.getConfig()?.meta?.db;
      const config = { ...metaConfig };
      if (config.client === 'sqlite3') {
        config.connection = metaConfig;
      }

      return config;
    }

    // todo: construct with props
    return {
      client: this.type,
      connection: {
        host: this.host ?? 'localhost',
        port: this.port ?? 3303,
        user: this.username ?? 'root',
        password: this.password ?? 'password',
        database: this.database ?? 'dummy_db'
      }
    };
  }
  getProject(): Promise<Project> {
    return Project.get(this.project_id);
  }

  async delete(ncMeta = Noco.ncMeta) {
    const models = await Model.list(
      {
        base_id: this.id,
        project_id: this.project_id
      },
      ncMeta
    );
    for (const model of models) {
      await model.delete(ncMeta);
    }
    await NocoCache.deepDel(
      CacheScope.BASE,
      `${CacheScope.BASE}:${this.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    return await ncMeta.metaDelete(null, null, MetaTable.BASES, this.id);
  }
}
