import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import { FormColumnType } from 'nc-common';
import View from './View';

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

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(null, null, MetaTable.FORM_VIEW, {
      fk_view_id: viewId
    });

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
    return new FormViewColumn({
      id,
      ...insertObj
    });
  }

  public static async list(viewId: string): Promise<FormViewColumn[]> {
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

    return views?.map(v => new FormViewColumn(v));
  }

  static async update(columnId: string, body: Partial<FormViewColumn>) {
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
