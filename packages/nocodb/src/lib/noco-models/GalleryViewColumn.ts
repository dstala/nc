import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';

export default class GalleryViewColumn {
  id: string;
  title?: string;
  show?: boolean;
  order?: number;

  fk_view_id: string;
  fk_column_id: string;

  constructor(data: GalleryViewColumn) {
    Object.assign(this, data);
  }

  public static async get(viewId: string) {
    const view = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.GALLERY_VIEW,
      {
        fk_view_id: viewId
      }
    );

    return view && new GalleryViewColumn(view);
  }
  static async insert(column: Partial<GalleryViewColumn>) {
    const { id } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GALLERY_VIEW_COLUMNS,
      {
        fk_view_id: column.fk_view_id,
        fk_column_id: column.fk_column_id,
        order: await Noco.ncMeta.metaGetNextOrder(
          MetaTable.GALLERY_VIEW_COLUMNS,
          {
            fk_view_id: column.fk_view_id
          }
        ),
        show: column.show
      }
    );
    return new GalleryViewColumn({
      id,
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: column.order,
      show: column.show
    });
  }

  public static async list(viewId: string): Promise<GalleryViewColumn[]> {
    const views = await Noco.ncMeta.metaList2(
      null,
      null,
      MetaTable.GALLERY_VIEW_COLUMNS,
      {
        condition: {
          fk_view_id: viewId
        },
        orderBy: {
          order: 'asc'
        }
      }
    );

    return views?.map(v => new GalleryViewColumn(v));
  }
}
