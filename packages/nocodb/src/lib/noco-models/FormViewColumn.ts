import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import { FormColumnType } from 'nc-common';

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
    const { id } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.FORM_VIEW_COLUMNS,
      {
        fk_view_id: column.fk_view_id,
        fk_column_id: column.fk_column_id,
        order: await Noco.ncMeta.metaGetNextOrder(MetaTable.FORM_VIEW_COLUMNS, {
          fk_view_id: column.fk_view_id
        }),
        show: column.show
      }
    );
    return new FormViewColumn({
      id,
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: column.order,
      show: column.show
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
