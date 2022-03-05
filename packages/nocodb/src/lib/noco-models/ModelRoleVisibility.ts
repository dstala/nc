import { ModelRoleVisibilityType } from 'nc-common';
import Noco from '../noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import Model from './Model';
import NocoCache from '../noco-cache/NocoCache';

export default class ModelRoleVisibility implements ModelRoleVisibilityType {
  id?: string;
  project_id?: string;
  base_id?: string;
  // fk_model_id?: string;
  fk_view_id?: string;
  role?: string;
  disabled?: string;

  constructor(body: Partial<ModelRoleVisibilityType>) {
    Object.assign(this, body);
  }

  static async list(projectId): Promise<ModelRoleVisibility[]> {
    let data = await NocoCache.getList(CacheScope.MODEL_ROLE_VISIBILITY, [
      projectId
    ]);
    if (!data.length) {
      data = await Noco.ncMeta.metaList2(
        projectId,
        null,
        MetaTable.MODEL_ROLE_VISIBILITY
      );
      await NocoCache.setList(
        CacheScope.MODEL_ROLE_VISIBILITY,
        [projectId],
        data
      );
    }
    return data?.map(baseData => new ModelRoleVisibility(baseData));
  }

  static async get(args: { role: string; fk_view_id: any }) {
    let data =
      args.fk_view_id &&
      args.role &&
      (await NocoCache.get(
        `${CacheScope.MODEL_ROLE_VISIBILITY}:${args.fk_view_id}:${args.role}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!data) {
      data = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.MODEL_ROLE_VISIBILITY,
        // args.fk_model_id
        //   ? {
        //       fk_model_id: args.fk_model_id,
        //       role: args.role
        //     }
        //   :
        {
          fk_view_id: args.fk_view_id,
          role: args.role
        }
      );
      await NocoCache.set(
        `${CacheScope.MODEL_ROLE_VISIBILITY}:${args.fk_view_id}:${args.role}`,
        data
      );
    }
    return data && new ModelRoleVisibility(data);
  }

  static async update(
    fk_view_id: string,
    role: string,
    body: { disabled: any }
  ) {
    // TODO: cache -> use <fk_view_id_1>:<role_1>
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      {
        disabled: body.disabled
      },
      {
        fk_view_id,
        role
      }
    );
  }

  async delete() {
    return await ModelRoleVisibility.delete(this.fk_view_id, this.role);
  }
  static async delete(fk_view_id: string, role: string) {
    // TODO: cache -> use <fk_view_id_1>:<role_1>
    return await Noco.ncMeta.metaDelete(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      {
        fk_view_id,
        role
      }
    );
  }

  static async insert(body: Partial<ModelRoleVisibilityType>) {
    const insertObj = {
      role: body.role,
      disabled: body.disabled,
      // fk_model_id: body.fk_model_id,
      fk_view_id: body.fk_view_id,
      project_id: body.project_id,
      base_id: body.base_id
    };

    if (!(body.project_id && body.base_id)) {
      const model = await Model.getByIdOrName({ id: body.fk_model_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }
    const row = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      insertObj
    );

    await NocoCache.appendToList(
      CacheScope.MODEL_ROLE_VISIBILITY,
      [body.project_id],
      `${CacheScope.MODEL_ROLE_VISIBILITY}:${body.fk_view_id}:${body.role}`
    );

    await NocoCache.set(
      `${CacheScope.MODEL_ROLE_VISIBILITY}:${body.fk_view_id}:${body.role}`,
      row
    );

    return row;
  }
}
