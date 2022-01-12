import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import Model from './Model';
import Column from './Column';

export default class Filter {
  id: string;

  fk_model_id: string;
  fk_column_id?: string;
  fk_parent_id?: string;

  comparison_op?: string;
  value?: string;

  logical_op?: string;
  is_group?: boolean;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public async getModel(): Promise<Model> {
    return Model.get({
      id: this.fk_model_id
    });
  }

  public static async insert(model: Partial<FilterObject>) {
    const row = await Noco.ncMeta.metaInsert2(null, null, 'nc_filter_exp_v2', {
      fk_model_id: model.fk_model_id,
      fk_column_id: model.fk_column_id,
      comparison_op: model.comparison_op,
      value: model.value,
      fk_parent_id: model.fk_parent_id,

      is_group: model.is_group,
      logical_op: model.logical_op
    });
    if (model?.children?.length) {
      await Promise.all(
        model.children.map(f => this.insert({ ...f, fk_parent_id: row.id }))
      );
    }
  }

  public getColumn(): Promise<Column> {
    if (!this.fk_column_id) return null;
    return Column.get({
      colId: this.fk_column_id
    });
  }

  public async getGroup(): Promise<Filter> {
    if (!this.fk_parent_id) return null;
    const filterOdj = await Noco.ncMeta.metaGet2(
      null,
      null,
      'nc_filter_exp_v2',
      {
        id: this.fk_parent_id
      }
    );
    return filterOdj && new Filter(filterOdj);
  }

  public async getChildren(): Promise<Filter[]> {
    if (!this.is_group) return null;
    const childFilters = await Noco.ncMeta.metaList2(
      null,
      null,
      'nc_filter_exp_v2',
      {
        condition: {
          fk_parent_id: this.fk_parent_id
        }
      }
    );
    return childFilters && childFilters.map(f => new Filter(f));
  }

  public static async getFilter({
    base_id,
    db_alias,
    modelId
  }: {
    base_id?: string;
    db_alias?: string;
    modelId: string;
  }): Promise<Filter> {
    const filterObj = await Noco.ncMeta.metaGet2(
      base_id,
      db_alias,
      'nc_filter_exp_v2',
      {
        condition: { fk_model_id: modelId, fk_parent_id: null }
      }
    );
    return filterObj && new Filter(filterObj);
  }

  public static async getFilterObject({
    base_id,
    db_alias,
    modelId
  }: {
    base_id?: string;
    db_alias?: string;
    modelId: string;
  }): Promise<FilterObject> {
    const filters = await Noco.ncMeta.metaList2(
      base_id,
      db_alias,
      'nc_filter_exp_v2',
      {
        condition: { fk_model_id: modelId }
      }
    );

    let result: FilterObject;

    const grouped = {};
    const idFilterMapping = {};

    for (const filter of filters) {
      if (!filter.fk_parent_id) {
        result = filter;
        idFilterMapping[result.id] = result;
      } else {
        grouped[filter.fk_parent_id] = grouped[filter.fk_parent_id] || [];
        grouped[filter.fk_parent_id].push(filter);
        idFilterMapping[filter.id] = filter;
      }
    }

    for (const [id, children] of Object.entries(grouped)) {
      idFilterMapping[id].children = children;
    }

    return result;
  }
}

export interface FilterObject {
  id?: string;
  fk_model_id: string;
  fk_column_id?: string;
  fk_parent_id?: string;

  comparison_op?: string;
  value?: string;

  logical_op?: string;
  is_group?: boolean;
  children?: FilterObject[];
}
