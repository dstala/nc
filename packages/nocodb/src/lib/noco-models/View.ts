import Noco from '../noco/Noco';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import Model from './Model';
import FormView from './FormView';
import GridView from './GridView';
import KanbanView from './KanbanView';
import GalleryView from './GalleryView';
import GridViewColumn from './GridViewColumn';
import Sort from './Sort';
import Filter from './Filter';
import { ViewType, ViewTypes } from 'nc-common';
import GalleryViewColumn from './GalleryViewColumn';
import FormViewColumn from './FormViewColumn';
import UITypes from '../sqlUi/UITypes';
import Column from './Column';
import NocoCache from '../noco-cache/NocoCache';

const { v4: uuidv4 } = require('uuid');
export default class View implements ViewType {
  id?: string;
  title?: string;
  uuid?: string;
  password?: string;
  show: boolean;
  is_default: boolean;
  order: number;
  type: ViewTypes;

  fk_model_id: string;
  model?: Model;
  view?: FormView | GridView | KanbanView | GalleryView;
  columns?: Array<FormViewColumn | GridViewColumn | GalleryViewColumn>;

  sorts: Sort[];
  filter: Filter;
  project_id?: string;
  base_id?: string;

  constructor(data: View) {
    Object.assign(this, data);
  }

  async getModel(): Promise<Model> {
    return (this.model = await Model.getByIdOrName({ id: this.fk_model_id }));
  }

  async getModelWithInfo(): Promise<Model> {
    return (this.model = await Model.getWithInfo({ id: this.fk_model_id }));
  }

  async getView<T>(): Promise<T> {
    switch (this.type) {
      case ViewTypes.GRID:
        this.view = await GridView.get(this.id);
        break;
      case ViewTypes.KANBAN:
        this.view = await KanbanView.get(this.id);
        break;
      case ViewTypes.GALLERY:
        this.view = await GalleryView.get(this.id);
        break;
      case ViewTypes.FORM:
        this.view = await FormView.get(this.id);
        break;
    }
    return <T>this.view;
  }

  async getViewWithInfo(): Promise<
    FormView | GridView | KanbanView | GalleryView
  > {
    switch (this.type) {
      case ViewTypes.GRID:
        this.view = await GridView.getWithInfo(this.id);
        break;
      case ViewTypes.KANBAN:
        this.view = await KanbanView.get(this.id);
        break;
      case ViewTypes.GALLERY:
        this.view = await GalleryView.get(this.id);
        break;
      case ViewTypes.FORM:
        this.view = await FormView.get(this.id);
        break;
    }
    return this.view;
  }

  public static async get(viewId: string) {
    let view =
      viewId &&
      (await NocoCache.get(
        `${CacheScope.VIEW}:${viewId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!view) {
      view = await Noco.ncMeta.metaGet2(null, null, MetaTable.VIEWS, viewId);
      await NocoCache.set(`${CacheScope.VIEW}:${viewId}`, view);
    }

    return view && new View(view);
  }

  public static async list(modelId: string) {
    let viewsList = await NocoCache.getList(CacheScope.VIEW, [modelId]);
    if (!viewsList.length) {
      viewsList = await Noco.ncMeta.metaList2(null, null, MetaTable.VIEWS, {
        condition: {
          fk_model_id: modelId
        },
        orderBy: {
          order: 'asc'
        }
      });
      await NocoCache.setList(CacheScope.VIEW, [modelId], viewsList);
    }

    return viewsList?.map(v => new View(v));
  }

  public async getFilters() {
    return (this.filter = (await Filter.getFilterObject({
      viewId: this.id
    })) as any);
  }

  public async getSorts() {
    return (this.sorts = await Sort.list({ viewId: this.id }));
  }

  static async insert(
    view: Partial<View> &
      Partial<FormView | GridView | GalleryView | KanbanView> & {
        copy_from_id?: string;
      },
    ncMeta = Noco.ncMeta
  ) {
    const order =
      (+(
        await ncMeta
          .knex(MetaTable.VIEWS)
          .max('order', { as: 'order' })
          .where({
            fk_model_id: view.fk_model_id
          })
          .first()
      )?.order || 0) + 1;

    const insertObj = {
      title: view.title,
      show: true,
      is_default: view.is_default,
      order,
      type: view.type,
      fk_model_id: view.fk_model_id,
      project_id: view.project_id,
      base_id: view.base_id
    };
    if (!(view.project_id && view.base_id)) {
      const model = await Model.getByIdOrName({ id: view.fk_model_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }

    const copyFormView =
      view.copy_from_id && (await View.get(view.copy_from_id));

    const { id: view_id } = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.VIEWS,
      insertObj
    );

    await NocoCache.appendToList(
      CacheScope.VIEW,
      [view.fk_model_id],
      `${CacheScope.VIEW}:${view_id}`
    );

    switch (view.type) {
      case ViewTypes.GRID:
        await GridView.insert({
          ...(view as GridView),
          fk_view_id: view_id
        });
        break;
      case ViewTypes.GALLERY:
        await GalleryView.insert({
          ...view,
          fk_view_id: view_id
        });
        break;
      case ViewTypes.FORM:
        await FormView.insert({
          ...view,
          fk_view_id: view_id
        });
        break;
      // case ViewTypes.KANBAN:
      //   await KanbanView.insert({
      //     ...view,
      //     fk_view_id: id
      //   });
      //   break;
      // case ViewTypes.FORM:
      //   await FormView.insert({
      //     ...view,
      //     fk_view_id: id
      //   });
      //   break;
    }

    let columns: any[] = await (
      await Model.getByIdOrName({ id: view.fk_model_id })
    ).getColumns();

    if (copyFormView) {
      const sorts = await copyFormView.getSorts();
      const filters = await copyFormView.getFilters();
      columns = await copyFormView.getColumns();

      for (const sort of sorts) {
        await Sort.insert({
          ...sort,
          fk_view_id: view_id
        });
      }

      for (const filter of filters.children) {
        await Filter.insert({
          ...filter,
          fk_view_id: view_id
        });
      }
    }
    {
      let order = 1;
      for (const vCol of columns) {
        let show = 'show' in vCol ? vCol.show : true;
        const col = await Column.get({ colId: vCol.fk_column_id || vCol.id });
        if (
          col &&
          (col.uidt === UITypes.ForeignKey ||
            col.cn === 'created_at' ||
            col.cn === 'updated_at' ||
            (col.pk && (col.ai || col.cdf)))
        )
          show = false;
        await View.insertColumn({
          order: order++,
          ...col,
          view_id,
          fk_column_id: vCol.fk_column_id || vCol.id,
          show
        });
      }
    }

    return View.get(view_id);
  }

  static async insertColumnToAllViews(
    param: {
      fk_column_id: any;
      fk_model_id: any;
      order;
      show;
    },
    ncMeta = Noco.ncMeta
  ) {
    const views = await this.list(param.fk_model_id);

    for (const view of views) {
      switch (view.type) {
        case ViewTypes.GRID:
          await GridViewColumn.insert(
            {
              ...param,
              fk_view_id: view.id
            },
            ncMeta
          );
          break;
        case ViewTypes.GALLERY:
          await GalleryViewColumn.insert(
            {
              ...param,
              fk_view_id: view.id
            },
            ncMeta
          );
          break;
      }
    }
  }

  static async insertColumn(param: {
    view_id: any;
    order;
    show;
    fk_column_id;
  }) {
    const view = await this.get(param.view_id);

    let col;
    switch (view.type) {
      case ViewTypes.GRID:
        {
          col = await GridViewColumn.insert({
            ...param,
            fk_view_id: view.id
          });
        }
        break;
      case ViewTypes.GALLERY:
        {
          col = await GalleryViewColumn.insert({
            ...param,
            fk_view_id: view.id
          });
        }
        break;
      case ViewTypes.FORM:
        {
          col = await FormViewColumn.insert({
            ...param,
            fk_view_id: view.id
          });
        }
        break;
    }

    return col;
  }

  static async listWithInfo(id: string) {
    const list = await this.list(id);
    for (const item of list) {
      await item.getViewWithInfo();
    }
    return list;
  }

  static async getColumns(
    viewId: string
  ): Promise<Array<GridViewColumn | any>> {
    let columns: Array<GridViewColumn | any> = [];
    const view = await this.get(viewId);

    // todo:  just get - order & show props
    switch (view.type) {
      case ViewTypes.GRID:
        columns = await GridViewColumn.list(viewId);
        break;

      case ViewTypes.GALLERY:
        columns = await GalleryViewColumn.list(viewId);
        break;
      case ViewTypes.FORM:
        columns = await FormViewColumn.list(viewId);
        break;
    }

    return columns;
  }

  async getColumns() {
    return (this.columns = await View.getColumns(this.id));
  }

  static async updateColumn(
    viewId: string,
    colId: string,
    colData: {
      order: number;
      show: boolean;
    },
    ncMeta = Noco.ncMeta
  ): Promise<Array<GridViewColumn | any>> {
    const columns: Array<GridViewColumn | any> = [];
    const view = await this.get(viewId);
    let table;
    switch (view.type) {
      case ViewTypes.GRID:
        table = MetaTable.GRID_VIEW_COLUMNS;
        break;
      case ViewTypes.GALLERY:
        table = MetaTable.GALLERY_VIEW_COLUMNS;
        break;
      case ViewTypes.KANBAN:
        table = MetaTable.KANBAN_VIEW_COLUMNS;
        break;
      case ViewTypes.FORM:
        table = MetaTable.FORM_VIEW_COLUMNS;
        break;
    }

    await ncMeta.metaUpdate(
      null,
      null,
      table,
      {
        order: colData.order,
        show: colData.show
      },
      colId
    );

    return columns;
  }

  static async insertOrUpdateColumn(
    viewId: string,
    fkColId: string,
    colData: {
      order: number;
      show: boolean;
    },
    ncMeta = Noco.ncMeta
  ): Promise<Array<GridViewColumn | any>> {
    const view = await this.get(viewId);
    const table = this.extractViewColumnsTableName(view);

    const existingCol = await ncMeta.metaGet2(null, null, table, {
      fk_view_id: viewId,
      fk_column_id: fkColId
    });

    if (existingCol) {
      await ncMeta.metaUpdate(
        null,
        null,
        table,
        {
          order: colData.order,
          show: colData.show
        },
        existingCol.id
      );
      return { ...existingCol, ...colData };
    } else {
      return await ncMeta.metaInsert2(null, null, table, {
        fk_view_id: viewId,
        fk_column_id: fkColId,
        order: colData.order,
        show: colData.show
      });
    }
  }

  static async getByUUID(uuid: string, ncMeta = Noco.ncMeta) {
    const view = await ncMeta.metaGet2(null, null, MetaTable.VIEWS, {
      uuid
    });

    return view && new View(view);
  }

  static async share(viewId, ncMeta = Noco.ncMeta) {
    const view = await this.get(viewId);
    if (!view.uuid) {
      view.uuid = uuidv4();
      await ncMeta.metaUpdate(
        null,
        null,
        MetaTable.VIEWS,
        {
          uuid: view.uuid
        },
        viewId
      );
    }

    return view;
  }

  static async passwordUpdate(
    viewId: string,
    { password }: { password: string },
    ncMeta = Noco.ncMeta
  ) {
    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.VIEWS,
      {
        password
      },
      viewId
    );
  }

  static async sharedViewDelete(viewId, ncMeta = Noco.ncMeta) {
    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.VIEWS,
      {
        uuid: null
      },
      viewId
    );
  }

  static async update(
    viewId: string,
    body: {
      title: string;
      order: number;
    },
    ncMeta = Noco.ncMeta
  ) {
    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.VIEWS,
      {
        title: body.title,
        order: body.order
      },
      viewId
    );
  }

  // @ts-ignore
  static async delete(viewId, ncMeta = Noco.ncMeta) {
    const view = await this.get(viewId);
    await Sort.deleteAll(viewId);
    await Filter.deleteAll(viewId);
    const table = this.extractViewTableName(view);
    const tableScope = this.extractViewTableNameScope(view);
    const columnTable = this.extractViewColumnsTableName(view);
    const columnTableScope = this.extractViewColumnsTableNameScope(view);
    await ncMeta.metaDelete(null, null, columnTable, {
      fk_view_id: viewId
    });
    await NocoCache.deepDel(
      tableScope,
      `${tableScope}:${viewId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, table, {
      fk_view_id: viewId
    });
    await NocoCache.deepDel(
      columnTableScope,
      `${columnTableScope}:${viewId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.VIEWS, viewId);
    await NocoCache.deepDel(
      CacheScope.VIEW,
      `${CacheScope.VIEW}:${viewId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
  }

  private static extractViewColumnsTableName(view: View) {
    let table;
    switch (view.type) {
      case ViewTypes.GRID:
        table = MetaTable.GRID_VIEW_COLUMNS;
        break;
      case ViewTypes.GALLERY:
        table = MetaTable.GALLERY_VIEW_COLUMNS;
        break;
      case ViewTypes.KANBAN:
        table = MetaTable.KANBAN_VIEW_COLUMNS;
        break;
      case ViewTypes.FORM:
        table = MetaTable.FORM_VIEW_COLUMNS;
        break;
    }
    return table;
  }

  private static extractViewTableName(view: View) {
    let table;
    switch (view.type) {
      case ViewTypes.GRID:
        table = MetaTable.GRID_VIEW;
        break;
      case ViewTypes.GALLERY:
        table = MetaTable.GALLERY_VIEW;
        break;
      case ViewTypes.KANBAN:
        table = MetaTable.KANBAN_VIEW;
        break;
      case ViewTypes.FORM:
        table = MetaTable.FORM_VIEW;
        break;
    }
    return table;
  }

  private static extractViewColumnsTableNameScope(view: View) {
    let scope;
    switch (view.type) {
      case ViewTypes.GRID:
        scope = CacheScope.GRID_VIEW_COLUMN;
        break;
      case ViewTypes.GALLERY:
        scope = CacheScope.GALLERY_VIEW_COLUMN;
        break;
      case ViewTypes.KANBAN:
        scope = CacheScope.KANBAN_VIEW_COLUMN;
        break;
      case ViewTypes.FORM:
        scope = CacheScope.FORM_VIEW_COLUMN;
        break;
    }
    return scope;
  }

  private static extractViewTableNameScope(view: View) {
    let scope;
    switch (view.type) {
      case ViewTypes.GRID:
        scope = CacheScope.GRID_VIEW;
        break;
      case ViewTypes.GALLERY:
        scope = CacheScope.GALLERY_VIEW;
        break;
      case ViewTypes.KANBAN:
        scope = CacheScope.KANBAN_VIEW;
        break;
      case ViewTypes.FORM:
        scope = CacheScope.FORM_VIEW;
        break;
    }
    return scope;
  }

  static async showAllColumns(
    viewId,
    ignoreColdIds = [],
    ncMeta = Noco.ncMeta
  ) {
    const view = await this.get(viewId);
    const table = this.extractViewColumnsTableName(view);
    const scope = this.extractViewColumnsTableNameScope(view);
    // get existing cache
    const key = `${scope}:${viewId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      // update data
      o.show = true;
      // set cache
      await NocoCache.set(key, o);
    }
    // set meta
    return await ncMeta.metaUpdate(
      null,
      null,
      table,
      { show: true },
      {
        fk_view_id: viewId
      },
      ignoreColdIds?.length
        ? {
            _not: {
              fk_column_id: {
                in: ignoreColdIds
              }
            }
          }
        : null
    );
  }

  static async hideAllColumns(
    viewId,
    ignoreColdIds = [],
    ncMeta = Noco.ncMeta
  ) {
    const view = await this.get(viewId);
    const table = this.extractViewColumnsTableName(view);
    const scope = this.extractViewColumnsTableNameScope(view);
    // get existing cache
    const key = `${scope}:${viewId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      // update data
      o.show = false;
      // set cache
      await NocoCache.set(key, o);
    }
    // set meta
    return await ncMeta.metaUpdate(
      null,
      null,
      table,
      { show: false },
      {
        fk_view_id: viewId
      },
      ignoreColdIds?.length
        ? {
            _not: {
              fk_column_id: {
                in: ignoreColdIds
              }
            }
          }
        : null
    );
  }

  async delete() {
    await View.delete(this.id);
  }

  static async shareViewList(tableId, ncMeta = Noco.ncMeta) {
    let sharedViews = await NocoCache.getList(CacheScope.VIEW, [tableId]);
    if (!sharedViews) {
      sharedViews = await ncMeta.metaList2(null, null, MetaTable.VIEWS, {
        xcCondition: {
          fk_model_id: {
            eq: tableId
          },
          _not: {
            uuid: {
              eq: null
            }
          }
        }
      });
      await NocoCache.setList(CacheScope.VIEW, [tableId], sharedViews);
    }
    return sharedViews?.map(v => new View(v));
  }
}
