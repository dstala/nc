import Noco from '../noco/Noco';
import { MetaTable } from '../utils/globals';
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
import { NcError } from '../noco/meta/api/helpers/catchError';

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

  constructor(data: View) {
    Object.assign(this, data);
  }

  async getModel(): Promise<Model> {
    return (this.model = await Model.get({ id: this.fk_model_id }));
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
    const view = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.VIEWS,
      viewId
    );

    return view && new View(view);
  }

  public static async list(modelId: string) {
    const viewsList = await Noco.ncMeta.metaList2(null, null, MetaTable.VIEWS, {
      condition: {
        fk_model_id: modelId
      },
      orderBy: {
        order: 'asc'
      }
    });

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

    const copyFormView =
      view.copy_from_id && (await View.get(view.copy_from_id));

    const { id: view_id } = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.VIEWS,
      {
        title: view.title,
        show: true,
        is_default: view.is_default,
        order,
        type: view.type,
        fk_model_id: view.fk_model_id
      }
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

    let columns = await (
      await Model.get({ id: view.fk_model_id })
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
      for (const col of columns) {
        await View.insertColumn({
          view_id,
          show: true,
          order: order++,
          ...col
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

  static async insertColumn(param: { view_id: any; order; show }) {
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
    const columns: Array<GridViewColumn | any> = [];
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
    } else {
      await ncMeta.metaInsert2(null, null, table, {
        fk_view_id: viewId,
        fk_column_id: fkColId,
        order: colData.order,
        show: colData.show
      });
    }

    return columns;
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

    if (view.is_default) NcError.badRequest("Default view can't be deleted");

    await Sort.deleteAll(viewId);
    await Filter.deleteAll(viewId);
    const table = this.extractViewTableName(view);
    const columnTable = this.extractViewColumnsTableName(view);
    await ncMeta.metaDelete(null, null, columnTable, {
      fk_view_id: viewId
    });
    await ncMeta.metaDelete(null, null, table, {
      fk_view_id: viewId
    });
    await ncMeta.metaDelete(null, null, MetaTable.VIEWS, viewId);
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
}
