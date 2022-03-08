import { HookType } from 'nc-common';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import Noco from '../noco/Noco';
import Model from './Model';
import NocoCache from '../noco-cache/NocoCache';

export default class Hook implements HookType {
  id?: string;
  fk_model_id?: string;
  title?: string;
  description?: string;
  env?: string;
  type?: string;
  event?: 'After' | 'Before';
  operation?: 'insert' | 'delete' | 'update';
  async?: boolean;
  payload?: boolean;
  url?: string;
  headers?: string;
  condition?: string;
  notification?: string;
  retries?: number;
  retry_interval?: number;
  timeout?: number;
  active?: boolean;

  project_id?: string;
  base_id?: string;

  constructor(hook: Partial<Hook>) {
    Object.assign(this, hook);
  }

  public static async get(hookId: string) {
    let hook =
      hookId &&
      (await NocoCache.get(
        `${CacheScope.HOOK}:${hookId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!hook) {
      hook = await Noco.ncMeta.metaGet2(null, null, MetaTable.HOOKS, hookId);
      await NocoCache.set(`${CacheScope.HOOK}:${hookId}`, hook);
    }
    return hook && new Hook(hook);
  }

  // public static async insert(hook: Partial<Hook>) {
  //   const { id } = await Noco.ncMeta.metaInsert2(null, null, MetaTable.HOOKS, {
  //     // user: hook.user,
  //     // ip: hook.ip,
  //     // base_id: hook.base_id,
  //     // project_id: hook.project_id,
  //     // row_id: hook.row_id,
  //     // fk_model_id: hook.fk_model_id,
  //     // op_type: hook.op_type,
  //     // op_sub_type: hook.op_sub_type,
  //     // status: hook.status,
  //     // description: hook.description,
  //     // details: hook.details
  //   });
  //
  //   return this.get(id);
  // }

  static async list(param: {
    fk_model_id: string;
    event?: 'after' | 'before';
    operation?: 'insert' | 'delete' | 'update';
  }) {
    let hooks = await NocoCache.getList(CacheScope.HOOK, [param.fk_model_id]);
    if (!hooks.length) {
      hooks = await Noco.ncMeta.metaList(null, null, MetaTable.HOOKS, {
        condition: {
          fk_model_id: param.fk_model_id
          // ...(param.event ? { event: param.event?.toLowerCase?.() } : {}),
          // ...(param.operation
          //   ? { operation: param.operation?.toLowerCase?.() }
          //   : {})
        }
      });
      await NocoCache.setList(CacheScope.HOOK, [param.fk_model_id], hooks);
    }
    // filter event & operation
    if (param.event) {
      hooks = hooks.filter(
        h => h.event?.toLowerCase() === param.event?.toLowerCase()
      );
    }
    if (param.operation) {
      hooks = hooks.filter(
        h => h.operation?.toLowerCase() === param.operation?.toLowerCase()
      );
    }
    return hooks?.map(h => new Hook(h));
  }

  public static async insert(hook: Partial<Hook>) {
    const insertObj = {
      fk_model_id: hook.fk_model_id,
      title: hook.title,
      description: hook.description,
      env: hook.env,
      type: hook.type,
      event: hook.event?.toLowerCase?.(),
      operation: hook.operation?.toLowerCase?.(),
      async: hook.async,
      payload: !!hook.payload,
      url: hook.url,
      headers: hook.headers,
      condition:
        hook.condition && typeof hook.condition === 'object'
          ? JSON.stringify(hook.condition)
          : hook.condition,
      notification:
        hook.notification && typeof hook.notification === 'object'
          ? JSON.stringify(hook.notification)
          : hook.notification,
      retries: hook.retries,
      retry_interval: hook.retry_interval,
      timeout: hook.timeout,
      active: hook.active,
      project_id: hook.project_id,
      base_id: hook.base_id
    };

    if (!(hook.project_id && hook.base_id)) {
      const model = await Model.getByIdOrName({ id: hook.fk_model_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }

    const { id } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.HOOKS,
      insertObj
    );

    await NocoCache.appendToList(
      CacheScope.HOOK,
      [hook.fk_model_id],
      `${CacheScope.HOOK}:${id}`
    );

    return this.get(id);
  }

  public static async update(hookId: string, hook: Partial<Hook>) {
    const updateObj = {
      title: hook.title,
      description: hook.description,
      env: hook.env,
      type: hook.type,
      event: hook.event?.toLowerCase?.(),
      operation: hook.operation?.toLowerCase?.(),
      async: hook.async,
      payload: !!hook.payload,
      url: hook.url,
      headers: hook.headers,
      condition:
        hook.condition && typeof hook.condition === 'object'
          ? JSON.stringify(hook.condition)
          : hook.condition,
      notification:
        hook.notification && typeof hook.notification === 'object'
          ? JSON.stringify(hook.notification)
          : hook.notification,
      retries: hook.retries,
      retry_interval: hook.retry_interval,
      timeout: hook.timeout,
      active: hook.active
    };

    // get existing cache
    const key = `${CacheScope.HOOK}:${hookId}`;
    let o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      // update data
      o = { ...updateObj, ...o };
      // set cache
      await NocoCache.set(key, o);
    }
    // set meta
    await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.HOOKS,
      updateObj,
      hookId
    );

    return this.get(hookId);
  }

  static async delete(hookId: any) {
    return await Noco.ncMeta.metaDelete(null, null, MetaTable.HOOKS, hookId);
    await NocoCache.deepDel(
      CacheScope.HOOK,
      `${CacheScope.HOOK}:${hookId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
  }
}
