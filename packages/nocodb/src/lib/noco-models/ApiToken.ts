import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';
import { nanoid } from 'nanoid';

export default class ApiToken {
  project_id?: string;
  db_alias?: string;
  description?: string;
  permissions?: string;
  token?: string;
  expiry?: string;
  enabled?: boolean;

  constructor(audit: Partial<ApiToken>) {
    Object.assign(this, audit);
  }

  public static async insert(
    apiToken: Partial<ApiToken>,
    ncMeta = Noco.ncMeta
  ) {
    const token = nanoid(40);
    await ncMeta.metaInsert(null, null, MetaTable.API_TOKENS, {
      description: apiToken.description,
      token
    });
    return {
      description: apiToken.description,
      token
    };
  }

  static async list(ncMeta = Noco.ncMeta) {
    // todo: redis cache
    return await ncMeta.metaList(null, null, MetaTable.API_TOKENS);
  }
  static async delete(tokenId, ncMeta = Noco.ncMeta) {
    return await ncMeta.metaDelete(null, null, MetaTable.API_TOKENS, tokenId);
  }

  static async getByToken(token, ncMeta = Noco.ncMeta) {
    // todo:  redis - cache
    return await ncMeta.metaGet(null, null, MetaTable.API_TOKENS, { token });
  }
}
