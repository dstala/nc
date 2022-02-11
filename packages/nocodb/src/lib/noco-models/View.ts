import Noco from '../noco/Noco';
import { MetaTable, ViewTypes } from '../utils/globals';
import Model from './Model';
import FormView from './FormView';
import GridView from './GridView';
import KanbanView from './KanbanView';
import GalleryView from './GalleryView';
import { Transaction } from 'knex';
import GridViewColumn from './GridViewColumn';
import Sort from './Sort';
import Filter from './Filter';

export default class View {
  id?: string;
  title: string;
  show: boolean;
  is_default: boolean;
  order: number;
  type: ViewTypes;

  fk_model_id: string;
  model?: Model;
  view?: FormView | GridView | KanbanView | GalleryView;

  sorts: Sort[];
  filter: Filter;

  constructor(data: View) {
    Object.assign(this, data);
  }

  async getModel(): Promise<Model> {
    return (this.model = await Model.get({ id: this.fk_model_id }));
  }

  async getView(): Promise<FormView | GridView | KanbanView | GalleryView> {
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
    return this.view;
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
      Partial<FormView | GridView | GalleryView | KanbanView>,
    _trx: Transaction
  ) {
    const { id } = await Noco.ncMeta.metaInsert2(null, null, MetaTable.VIEWS, {
      title: view.title,
      show: true,
      is_default: view.is_default,
      order: view.order,
      type: view.type,
      fk_model_id: view.fk_model_id
    });

    switch (view.type) {
      case ViewTypes.GRID:
        await GridView.insert({
          ...view,
          fk_view_id: id
        });
        break;
      // case ViewTypes.KANBAN:
      //   await KanbanView.insert({
      //     ...view,
      //     fk_view_id: id
      //   });
      //   break;
      // case ViewTypes.GALLERY:
      //   await GalleryView.insert({
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

    return View.get(id);
  }

  static async insertColumn(param: { fk_column_id: any; fk_model_id: any }) {
    const views = await this.list(param.fk_model_id);

    for (const view of views) {
      switch (view.type) {
        case ViewTypes.GRID:
          await GridViewColumn.insert({
            ...param,
            fk_view_id: view.id
          });
          break;
      }
    }
  }

  static async listWithInfo(id: string) {
    const list = await this.list(id);
    for (const item of list) {
      await item.getViewWithInfo();
    }
    return list;
  }
}
