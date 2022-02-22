import { HookType } from 'nc-common';
import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';

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

  constructor(hook: Partial<Hook>) {
    Object.assign(this, hook);
  }

  public static async get(hookId: string) {
    const hook = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.HOOKS,
      hookId
    );
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
    event?: 'After' | 'Before';
    operation?: 'insert' | 'delete' | 'update';
  }) {
    const hooks = await Noco.ncMeta.metaList(null, null, MetaTable.HOOKS, {
      condition: {
        fk_model_id: param.fk_model_id,
        ...(param.event ? { event: param.event } : {}),
        ...(param.operation ? { operation: param.operation } : {})
      }
    });
    return hooks?.map(h => new Hook(h));
  }
}
