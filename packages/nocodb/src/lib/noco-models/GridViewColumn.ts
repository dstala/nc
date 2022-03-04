import Noco from '../noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import { GridColumnType } from 'nc-common';
import extractDefinedProps from '../noco/meta/api/helpers/extractDefinedProps';
import View from './View';
import NocoCache from '../noco-cache/NocoCache';

export default class GridViewColumn implements GridColumnType {
  id: string;
  show: boolean;
  order: number;
  width?: string;

  fk_view_id: string;
  fk_column_id: string;
  project_id?: string;
  base_id?: string;

  constructor(data: GridViewColumn) {
    Object.assign(this, data);
  }

  public static async list(viewId: string): Promise<GridViewColumn[]> {
    let views = await NocoCache.getList(CacheScope.GRID_VIEW_COLUMN, [viewId]);
    if (!views.length) {
      views = await Noco.ncMeta.metaList2(
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
      await NocoCache.setList(CacheScope.GRID_VIEW_COLUMN, [viewId], views);
    }
    return views?.map(v => new GridViewColumn(v));
  }

  public static async get(gridViewColumnId: string) {
    let view =
      gridViewColumnId &&
      (await NocoCache.get(
        `${CacheScope.GRID_VIEW_COLUMN}:${gridViewColumnId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.GRID_VIEW_COLUMNS,
        gridViewColumnId
      );
      await NocoCache.set(
        `${CacheScope.GRID_VIEW_COLUMN}:${gridViewColumnId}`,
        view
      );
    }
    return view && new GridViewColumn(view);
  }

  static async insert(column: Partial<GridViewColumn>, ncMeta = Noco.ncMeta) {
    const insertObj = {
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: await ncMeta.metaGetNextOrder(MetaTable.GRID_VIEW_COLUMNS, {
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
      MetaTable.GRID_VIEW_COLUMNS,
      insertObj
    );

    await NocoCache.appendToList(
      CacheScope.GRID_VIEW_COLUMN,
      [column.fk_view_id],
      `${CacheScope.GRID_VIEW_COLUMN}:${id}`
    );

    return new GridViewColumn({
      id,
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: column.order,
      show: column.show
    });
  }

  static async update(
    columnId: string,
    body: Partial<GridViewColumn>,
    ncMeta = Noco.ncMeta
  ) {
    // TODO: Cache
    const updateBody = extractDefinedProps(body, ['order', 'show', 'width']);
    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.GRID_VIEW_COLUMNS,
      updateBody,
      columnId
    );
  }
}
