import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';

export default class FormViewColumn {
  id?: string;
  title?: string;
  show?: boolean;
  order?: number;

  fk_view_id?: string;
  fk_column_id?: string;

  constructor(data: FormViewColumn) {
    Object.assign(this, data);
  }

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
        order: column.order,
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
        }
      }
    );

    return views?.map(v => new FormViewColumn(v));
  }
}
