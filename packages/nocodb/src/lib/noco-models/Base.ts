import Noco from '../noco/Noco';
import Project from './Project';
import { MetaTable } from '../utils/globals';
import Model from './Model';
import { BaseType } from 'nc-common';

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
    await Noco.ncMeta.metaInsert2(base.projectId, null, MetaTable.BASES, {
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
    });
  }

  static async list(args: { projectId: string }): Promise<Base[]> {
    const baseDataList = await Noco.ncMeta.metaList2(
      args.projectId,
      null,
      MetaTable.BASES
    );
    return baseDataList?.map(baseData => new Base(baseData));
  }
  static async get(id: string): Promise<Base> {
    const baseData = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.BASES,
      id
    );
    return baseData && new Base(baseData);
  }

  public getConnectionConfig(): any {
    // todo: construct with props
    return {
      client: 'mysql2',
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
    return await ncMeta.metaDelete(null, null, MetaTable.BASES, this.id);
  }
}
