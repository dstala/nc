import Noco from '../../lib/noco/Noco';
import Model from './Model';
import Column from './Column';
import UITypes from '../sqlUi/UITypes';
import LinkToAnotherRecordColumn from './LinkToAnotherRecordColumn';
import { MetaTable } from '../utils/globals';
import View from './View';

export default class Filter {
  id: string;

  fk_model_id?: string;
  fk_view_id?: string;
  fk_column_id?: string;
  fk_parent_id?: string;

  comparison_op?: string;
  value?: string;

  logical_op?: string;
  is_group?: boolean;

  constructor(data: Filter | FilterObject) {
    Object.assign(this, data);
  }

  public async getModel(): Promise<Model> {
    return this.fk_view_id
      ? (await View.get(this.fk_view_id)).getModel()
      : Model.get({
          id: this.fk_model_id
        });
  }

  public static async insert(model: Partial<FilterObject>) {
    const row = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.FILTER_EXP,
      {
        fk_view_id: model.fk_view_id,
        fk_column_id: model.fk_column_id,
        comparison_op: model.comparison_op,
        value: model.value,
        fk_parent_id: model.fk_parent_id,

        is_group: model.is_group,
        logical_op: model.logical_op
      }
    );
    if (model?.children?.length) {
      await Promise.all(
        model.children.map(f => this.insert({ ...f, fk_parent_id: row.id }))
      );
    }

    return new Filter(
      await Noco.ncMeta.metaGet2(null, null, MetaTable.FILTER_EXP, row.id)
    );
  }

  static async update(id, filter: Partial<Filter>) {
    await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.FILTER_EXP,
      {
        fk_column_id: filter.fk_column_id,
        comparison_op: filter.comparison_op,
        value: filter.value,
        fk_parent_id: filter.fk_parent_id,

        is_group: filter.is_group,
        logical_op: filter.logical_op
      },
      id
    );
  }

  static async delete(id: string) {
    const filter = await this.get(id);

    const deleteRecursively = async (filter: Filter) => {
      if (!filter) return;
      for (const f of (await filter?.getChildren()) || [])
        await deleteRecursively(f);
      await Noco.ncMeta.metaDelete(null, null, MetaTable.FILTER_EXP, filter.id);
    };
    await deleteRecursively(filter);
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
      MetaTable.FILTER_EXP,
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
      MetaTable.FILTER_EXP,
      {
        condition: {
          fk_parent_id: this.id
        }
      }
    );
    return childFilters && childFilters.map(f => new Filter(f));
  }

  // public static async getFilter({
  //   viewId
  // }: {
  //   viewId: string;
  // }): Promise<Filter> {
  //   if (!viewId) return null;
  //
  //   const filterObj = await Noco.ncMeta.metaGet2(
  //     null,
  //     null,
  //     MetaTable.FILTER_EXP,
  //     { fk_view_id: viewId, fk_parent_id: null }
  //   );
  //   return filterObj && new Filter(filterObj);
  // }

  public static async getFilterObject({
    viewId
  }: {
    viewId: string;
  }): Promise<FilterObject> {
    const filters = await Noco.ncMeta.metaList2(
      null,
      null,
      MetaTable.FILTER_EXP,
      {
        condition: { fk_view_id: viewId }
      }
    );

    const result: FilterObject = {
      is_group: true,
      children: [],
      logical_op: 'AND'
    };

    const grouped = {};
    const idFilterMapping = {};

    for (const filter of filters) {
      if (!filter._fk_parent_id) {
        result.children.push(filter);
        idFilterMapping[result.id] = result;
      } else {
        grouped[filter._fk_parent_id] = grouped[filter._fk_parent_id] || [];
        grouped[filter._fk_parent_id].push(filter);
        idFilterMapping[filter.id] = filter;
        filter.column = await new Filter(filter).getColumn();
        if (filter.column?.uidt === UITypes.LinkToAnotherRecord) {
        }
      }
    }

    for (const [id, children] of Object.entries(grouped)) {
      if (idFilterMapping?.[id]) idFilterMapping[id].children = children;
    }

    // if (!result) {
    //   return (await Filter.insert({
    //     fk_view_id: viewId,
    //     is_group: true,
    //     logical_op: 'AND'
    //   })) as any;
    // }

    return result;
  }

  static async deleteAll(viewId: string) {
    const filter = await this.getFilterObject({ viewId });

    const deleteRecursively = async filter => {
      if (!filter) return;
      for (const f of filter?.children || []) await deleteRecursively(f);
      await Noco.ncMeta.metaDelete(null, null, MetaTable.FILTER_EXP, filter.id);
    };
    await deleteRecursively(filter);
  }

  private static async get(id: string) {
    const filterObj = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.FILTER_EXP,
      { id }
    );
    return filterObj && new Filter(filterObj);
  }

  static async rootFilterList({ viewId }: { viewId: any }) {
    const filterOdjs = await Noco.ncMeta.metaList2(
      null,
      null,
      MetaTable.FILTER_EXP,
      {
        condition: {
          fk_parent_id: null,
          fk_view_id: viewId
        }
      }
    );
    return filterOdjs?.map(f => new Filter(f));
  }
}

export interface FilterObject {
  id?: string;
  fk_view_id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  fk_parent_id?: string;

  comparison_op?: string;
  value?: string;

  logical_op?: string;
  is_group?: boolean;
  children?: FilterObject[];
  column?: Column & {
    colOptions?: LinkToAnotherRecordColumn;
  };
}
