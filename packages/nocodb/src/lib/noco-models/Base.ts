import Noco from '../noco/Noco';

export default class Base {
  public alias?: string;
  public host?: string;
  public port?: number;
  public username?: string;
  public password?: string;
  public database?: string;
  public url?: string;
  public params?: string;
  public type?: string;

  public project_id: string;
  public id: string;

  constructor(base: Partial<Base>) {
    Object.assign(this, base);
  }

  public static async createBase(base: BaseBody & { projectId: string }) {
    await Noco.ncMeta.metaInsert2(base.projectId, null, 'nc_bases_v2', {
      alias: base.alias,
      host: base.host,
      port: base.port,
      username: base.username,
      password: base.password,
      database: base.database,
      url: base.url,
      params: base.params,
      type: base.type
    });
  }

  static async list(args: { projectId: string }): Promise<Base[]> {
    const baseDataList = await Noco.ncMeta.metaList2(
      args.projectId,
      null,
      'nc_bases_v2'
    );
    return baseDataList?.map(baseData => new Base(baseData));
  }
  static async get(id: string): Promise<Base> {
    const baseData = await Noco.ncMeta.metaGet2(null, null, 'nc_bases_v2', id);
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
}

export interface BaseBody {
  alias: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
  params?: string;
  token?: string;
  type?: string;
}
