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
  public token?: string;
  public type?: string;

  public project_id: string;

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
      token: base.token,
      type: base.type
    });
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
