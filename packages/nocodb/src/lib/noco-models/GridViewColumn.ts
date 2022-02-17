import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';

export default class GridViewColumn {
  id: string;
  show: boolean;
  order: number;

  fk_view_id: string;
  fk_column_id: string;

  constructor(data: GridViewColumn) {
    Object.assign(this, data);
  }

  public static async list(viewId: string): Promise<GridViewColumn[]> {
    const views = await Noco.ncMeta.metaList2(
      null,
      null,
      MetaTable.GRID_VIEW_COLUMNS,
      {
        condition: {
          fk_view_id: viewId
        },
        orderBy: {
          order: 'asc'
        }
      }
    );

    return views?.map(v => new GridViewColumn(v));
  }

  static async insert(column: Partial<GridViewColumn>) {
    const { id } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GRID_VIEW_COLUMNS,
      {
        fk_view_id: column.fk_view_id,
        fk_column_id: column.fk_column_id,
        order: column.order,
        show: column.show
      }
    );
    return new GridViewColumn({
      id,
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: column.order,
      show: column.show
    });
  }
}
