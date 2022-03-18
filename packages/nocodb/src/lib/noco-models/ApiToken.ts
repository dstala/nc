import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import Noco from '../noco/Noco';
import { nanoid } from 'nanoid';
import NocoCache from '../noco-cache/NocoCache';

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
    // TODO: return id
    const { id: tokenId } = await ncMeta.metaInsert(
      null,
      null,
      MetaTable.API_TOKENS,
      {
        description: apiToken.description,
        token
      }
    );
    await NocoCache.appendToList(
      CacheScope.API_TOKEN,
      [],
      `${CacheScope.API_TOKEN}:${tokenId}`
    );
    await NocoCache.set(`${CacheScope.API_TOKEN}:${token}`, tokenId);
    return {
      description: apiToken.description,
      token
    };
  }

  static async list(ncMeta = Noco.ncMeta) {
    let tokens = await NocoCache.getList(CacheScope.API_TOKEN, []);
    if (!tokens.length) {
      tokens = await ncMeta.metaList(null, null, MetaTable.API_TOKENS);
      await NocoCache.setList(CacheScope.API_TOKEN, [], tokens);
    }
    return tokens?.map(t => new ApiToken(t));
  }
  static async delete(tokenId, ncMeta = Noco.ncMeta) {
    await NocoCache.deepDel(
      CacheScope.API_TOKEN,
      `${CacheScope.API_TOKEN}:${tokenId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    return await ncMeta.metaDelete(null, null, MetaTable.API_TOKENS, tokenId);
  }

  static async get(tokenId: string, ncMeta = Noco.ncMeta): Promise<ApiToken> {
    let data =
      tokenId &&
      (await NocoCache.get(
        `${CacheScope.API_TOKEN}:${tokenId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!data) {
      data = await ncMeta.metaGet2(null, null, MetaTable.API_TOKENS, tokenId);
      await NocoCache.set(`${CacheScope.API_TOKEN}:${tokenId}`, data);
    }
    return data && new ApiToken(data);
  }

  static async getByToken(token, ncMeta = Noco.ncMeta) {
    const tokenId =
      token &&
      (await NocoCache.get(
        `${CacheScope.API_TOKEN}:${token}`,
        CacheGetType.TYPE_OBJECT
      ));
    let data = null;
    if (!tokenId) {
      data = await ncMeta.metaGet(null, null, MetaTable.API_TOKENS, { token });
      await NocoCache.set(`${CacheScope.API_TOKEN}:${token}`, data?.id);
    } else {
      return this.get(tokenId);
    }
    return data?.id && this.get(data?.id, ncMeta);
  }
}
