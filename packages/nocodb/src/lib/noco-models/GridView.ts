import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
import GridViewColumn from './GridViewColumn';

export default class GridView {
  title: string;
  show: boolean;
  is_default: boolean;
  order: number;

  fk_view_id: string;

  columns?: GridViewColumn[];

  constructor(data: GridView) {
    Object.assign(this, data);
  }

  async getColumns(): Promise<GridViewColumn[]> {
    return (this.columns = await GridViewColumn.list(this.fk_view_id));
  }

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(null, null, MetaTable.GRID_VIEW, {
      fk_view_id: viewId
    });

    return view && new GridView(view);
  }

  static async insert(view: Partial<GridView>) {
    await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GRID_VIEW,
      {
        fk_view_id: view.fk_view_id
      },
      true
    );

    return this.get(view.fk_view_id);
  }

  static async getWithInfo(id: string) {
    const view = await this.get(id);
    return view;
  }
}
