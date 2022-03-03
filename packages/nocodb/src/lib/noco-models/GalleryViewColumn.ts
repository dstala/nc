import Noco from '../noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import View from './View';
import NocoCache from '../noco-cache/NocoCache';

export default class GalleryViewColumn {
  id: string;
  title?: string;
  show?: boolean;
  order?: number;

  fk_view_id: string;
  fk_column_id: string;
  project_id?: string;
  base_id?: string;

  constructor(data: GalleryViewColumn) {
    Object.assign(this, data);
  }

  public static async get(viewId: string) {
    let view =
      viewId &&
      (await NocoCache.get(
        `${CacheScope.GALLERY_VIEW_COLUMN}:${viewId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await Noco.ncMeta.metaGet2(null, null, MetaTable.GALLERY_VIEW, {
        fk_view_id: viewId
      });
      await NocoCache.set(`${CacheScope.GALLERY_VIEW_COLUMN}:${viewId}`, view);
    }
    return view && new GalleryViewColumn(view);
  }
  static async insert(
    column: Partial<GalleryViewColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const insertObj = {
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: await ncMeta.metaGetNextOrder(MetaTable.GALLERY_VIEW_COLUMNS, {
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

    const { id } = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.GALLERY_VIEW_COLUMNS,
      insertObj
    );

    await NocoCache.appendToList(
      CacheScope.GALLERY_VIEW_COLUMN,
      [column.fk_view_id],
      `${CacheScope.GALLERY_VIEW_COLUMN}:${id}`
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
    let views = await NocoCache.getList(CacheScope.GALLERY_VIEW_COLUMN, [
      viewId
    ]);
    if (!views.length) {
      views = await Noco.ncMeta.metaList2(
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
      await NocoCache.setList(CacheScope.GALLERY_VIEW_COLUMN, [viewId], views);
    }

    return views?.map(v => new GalleryViewColumn(v));
  }
}
