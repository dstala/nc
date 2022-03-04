import Noco from '../noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import { FormColumnType } from 'nc-common';
import View from './View';
import NocoCache from '../noco-cache/NocoCache';

export default class FormViewColumn implements FormColumnType {
  id?: string;
  label?: string;
  help?: string;
  description?: string;
  required?: boolean;
  show?: boolean;
  order?: number;

  fk_view_id?: string;
  fk_column_id?: string;
  project_id?: string;
  base_id?: string;

  constructor(data: FormViewColumn) {
    Object.assign(this, data);
  }

  uuid?: any;

  public static async get(formViewId: string) {
    let view =
      formViewId &&
      (await NocoCache.get(
        `${CacheScope.FORM_VIEW_COLUMN}:${formViewId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.FORM_VIEW_COLUMNS,
        formViewId
      );
    }
    await NocoCache.set(`${CacheScope.FORM_VIEW_COLUMN}:${formViewId}`, view);

    return view && new FormViewColumn(view);
  }

  static async insert(column: Partial<FormViewColumn>) {
    const insertObj = {
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: await Noco.ncMeta.metaGetNextOrder(MetaTable.FORM_VIEW_COLUMNS, {
        fk_view_id: column.fk_view_id
      }),
      show: column.show,
      project_id: column.project_id,
      base_id: column.base_id
    };

    if (!(column.project_id && column.base_id)) {
      const viewRef = await View.get(column.fk_view_id);
      insertObj.project_id = viewRef.project_id;
      insertObj.base_id = viewRef.base_id;
    }

    const { id } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.FORM_VIEW_COLUMNS,
      insertObj
    );
    await NocoCache.appendToList(
      CacheScope.FORM_VIEW_COLUMN,
      [column.fk_view_id],
      `${CacheScope.FORM_VIEW_COLUMN}:${id}`
    );
    return new FormViewColumn({
      id,
      ...insertObj
    });
  }

  public static async list(viewId: string): Promise<FormViewColumn[]> {
    const views = await NocoCache.getList(CacheScope.FORM_VIEW_COLUMN, [
      viewId
    ]);
    if (!views.length) {
      const views = await Noco.ncMeta.metaList2(
        null,
        null,
        MetaTable.FORM_VIEW_COLUMNS,
        {
          condition: {
            fk_view_id: viewId
          },
          orderBy: {
            order: 'asc'
          }
        }
      );
      await NocoCache.setList(CacheScope.FORM_VIEW_COLUMN, [viewId], views);
    }

    return views?.map(v => new FormViewColumn(v));
  }

  static async update(columnId: string, body: Partial<FormViewColumn>) {
    // get existing cache
    const key = `${CacheScope.FORM_VIEW_COLUMN}:${columnId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      o.label = body.label;
      o.help = body.help;
      o.description = body.description;
      o.required = body.required;
      // set cache
      await NocoCache.set(key, o);
    }
    // update meta
    await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.FORM_VIEW_COLUMNS,
      {
        label: body.label,
        help: body.help,
        description: body.description,
        required: body.required
      },
      columnId
    );
  }

  created_at?: string;
  updated_at?: string;
}
