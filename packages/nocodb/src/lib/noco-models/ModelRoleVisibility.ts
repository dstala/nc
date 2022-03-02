import { ModelRoleVisibilityType } from 'nc-common';
import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import Model from './Model';

export default class ModelRoleVisibility implements ModelRoleVisibilityType {
  id?: string;
  project_id?: string;
  base_id?: string;
  fk_model_id?: string;
  role?: string;
  disabled?: string;

  constructor(body: Partial<ModelRoleVisibilityType>) {
    Object.assign(this, body);
  }

  static async list(projectId): Promise<ModelRoleVisibility[]> {
    const datas = await Noco.ncMeta.metaList2(
      projectId,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY
    );
    return datas?.map(baseData => new ModelRoleVisibility(baseData));
  }

  static async get(args: { role: string; fk_model_id: any }) {
    const data = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      {
        fk_model_id: args.fk_model_id,
        role: args.role
      }
    );
    return data && new ModelRoleVisibility(data);
  }

  static async update(id: string, body: { disabled: any }) {
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      {
        disabled: body.disabled
      },
      id
    );
  }

  async delete() {
    return await ModelRoleVisibility.delete(this.id);
  }
  static async delete(id: string) {
    return await Noco.ncMeta.metaDelete(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      id
    );
  }

  static async insert(body: Partial<ModelRoleVisibilityType>) {
    const insertObj = {
      role: body.role,
      disabled: body.disabled,
      fk_model_id: body.fk_model_id,
      project_id: body.project_id,
      base_id: body.base_id
    };

    if (!(body.project_id && body.base_id)) {
      const model = await Model.getByIdOrName({ id: body.fk_model_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }
    return await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.MODEL_ROLE_VISIBILITY,
      insertObj
    );
  }
}
